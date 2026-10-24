/**
 * PUSH SERVER HELPERS — SERVER-ONLY (imported exclusively by API routes).
 *
 * Secrets boundary: PUSH_VAPID_PRIVATE_KEY / PUSH_VAPID_SUBJECT are read
 * here and NEVER sent to the browser. The public key is served by
 * /api/push/config (it is public by design — that is what VAPID means).
 * No secret is ever hardcoded, logged, or exposed through NEXT_PUBLIC_.
 */

import webpush from "web-push";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/config";

export interface PushConfig {
  configured: boolean;
  publicKey: string | null;
  privateKey: string | null;
  subject: string | null;
}

/**
 * Pure resolution of the VAPID env inputs — extracted so tests can cover
 * missing / partial / complete configurations without touching process.env.
 * A subject must look like a mailto: or https: contact (the Web Push spec
 * requirement for VAPID) to count as configured.
 */
export function resolvePushConfig(env: {
  publicKey?: string;
  privateKey?: string;
  subject?: string;
}): PushConfig {
  const publicKey = (env.publicKey ?? "").trim() || null;
  const privateKey = (env.privateKey ?? "").trim() || null;
  const rawSubject = (env.subject ?? "").trim();
  const subject =
    /^mailto:[^\s]+$/i.test(rawSubject) || /^https:\/\/[^\s]+$/i.test(rawSubject)
      ? rawSubject
      : null;
  return {
    configured: !!(publicKey && privateKey && subject),
    publicKey,
    privateKey,
    subject,
  };
}

export function getPushConfig(): PushConfig {
  return resolvePushConfig({
    publicKey: process.env.PUSH_VAPID_PUBLIC_KEY,
    privateKey: process.env.PUSH_VAPID_PRIVATE_KEY,
    subject: process.env.PUSH_VAPID_SUBJECT,
  });
}

/**
 * Supabase client scoped to the CALLING USER's JWT: RLS applies exactly as
 * in the browser, so this code can only ever read/remove rows the user
 * already owns. No service role exists anywhere in this codebase.
 */
export function createUserScopedClient(accessToken: string): SupabaseClient {
  return createClient(SUPABASE_URL.trim(), SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface StoredSubscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
}

export type PushSendResult = { ok: true } | { ok: false; status: number };

/** The shape this module needs from the web-push sender — injectable in tests. */
export type PushSender = (
  sub: StoredSubscription,
  payload: { title: string; body: string; url: string; tag?: string }
) => Promise<PushSendResult>;

/** The real web-push sender (production path). */
function webPushSender(config: PushConfig): PushSender {
  // VAPID details are set per call site from server env — cheap and keeps
  // the config from being cached across env changes in long-lived processes.
  webpush.setVapidDetails(config.subject as string, config.publicKey as string, config.privateKey as string);
  return async (sub, payload) => {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
        JSON.stringify(payload)
      );
      return { ok: true };
    } catch (err) {
      const status =
        typeof err === "object" && err !== null && "statusCode" in err
          ? Number((err as { statusCode?: number }).statusCode)
          : 500;
      return { ok: false, status };
    }
  };
}

/**
 * Push-service statuses worth ONE retry: transient rate limits and server
 * hiccups. Terminal failures (400/403/404/410 = bad request / forbidden /
 * unknown / gone) are NEVER retried — a dead endpoint stays dead and a
 * retried 4xx would only duplicate the failure, not fix it.
 */
export function isRetryablePushStatus(status: number): boolean {
  return status === 429 || status === 500 || status === 502 || status === 503;
}

/** Milliseconds between the first attempt and the single retry. */
const RETRY_DELAY_MS = 500;

/**
 * Send one notification with ONE bounded retry for transient failures.
 * The payload `tag` (set by callers) makes duplicate deliveries collapse
 * in the browser, so a retry after an ambiguous failure cannot stack two
 * visible notifications. Never throws.
 */
export async function sendToSubscription(
  config: PushConfig,
  sub: StoredSubscription,
  payload: { title: string; body: string; url: string; tag?: string },
  sender?: PushSender
): Promise<PushSendResult> {
  const send = sender ?? webPushSender(config);

  const first = await send(sub, payload);
  if (first.ok || !isRetryablePushStatus(first.status)) return first;

  await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  const second = await send(sub, payload);
  if (second.ok || !isRetryablePushStatus(second.status)) return second;

  // Both attempts failed transiently — report the final status; the caller
  // logs it (status codes only, never the endpoint URL).
  return second;
}

/**
 * Server-side delivery logging: status codes and counts ONLY. The endpoint
 * URL embeds a per-browser push token — it is never logged.
 */
export function logDeliveryOutcome(subId: string, result: PushSendResult): void {
  if (result.ok) return;
  console.error(`[push] delivery failed sub=${subId} status=${result.status}`);
}

/**
 * Extracts the caller's access token from an Authorization header.
 * Pure (no Next.js types) so the delivery route stays thin and this rule
 * is unit-testable. Returns null when the header is absent, malformed,
 * not a Bearer scheme, or carries an empty credential.
 */
export function parseBearerToken(header: string | null): string | null {
  if (!header) return null;
  const match = /^Bearer\s+(\S+)\s*$/i.exec(header.trim());
  return match ? (match[1] ?? null) : null;
}

/**
 * Server-side time budget for push_subscriptions reads/writes (mirrors the
 * data layer's QUERY_TIMEOUT_MS discipline — a hung database must never
 * hang the delivery route). Kept local to the push module so the delivery
 * route does not import the entire foodie data layer.
 */
export const PUSH_QUERY_TIMEOUT_MS = 10_000;

/** Raised by `withPushQueryTimeout` when the budget is exceeded. */
export class PushQueryTimeoutError extends Error {
  constructor() {
    super(`push_subscriptions query exceeded the ${PUSH_QUERY_TIMEOUT_MS}ms server-side time budget`);
    this.name = "PushQueryTimeoutError";
  }
}

/**
 * Stop waiting on `op` after `ms` (default PUSH_QUERY_TIMEOUT_MS). The
 * underlying query is discarded, not cancelled — the caller proceeds on its
 * honest failure path instead of hanging. Accepts PromiseLike because
 * Supabase query builders (PostgrestFilterBuilder) are thenables without
 * .catch/.finally, not full Promises.
 */
export function withPushQueryTimeout<T>(op: PromiseLike<T>, ms: number = PUSH_QUERY_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new PushQueryTimeoutError()), ms);
  });
  return Promise.race([op, timeout]).finally(() => {
    if (timer !== undefined) clearTimeout(timer);
  });
}

/**
 * User-safe classification of a failed push_subscriptions read/write — the
 * raw Supabase error text never reaches the browser. Mirrors the client's
 * describePushError taxonomy (storage-missing / timeout / generic) so both
 * sides of the feature speak the same honest vocabulary. Our own
 * PushQueryTimeoutError is recognized by identity first — its message must
 * never be re-classified by text matching.
 */
export function describeSubscriptionStoreError(error: unknown): string {
  if (error instanceof PushQueryTimeoutError) {
    return "The notification storage took too long to respond — try again.";
  }
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (/push_subscriptions|schema cache|does not exist|could not find the table|pgrst205/i.test(message)) {
    return "Notification storage isn't set up on the server yet — nothing has been sent.";
  }
  if (/timeout|timed out|abort/i.test(message)) {
    return "The notification storage took too long to respond — try again.";
  }
  return "Couldn't reach the notification storage — try again.";
}
