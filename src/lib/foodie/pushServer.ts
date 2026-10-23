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

export function getPushConfig(): PushConfig {
  const publicKey = (process.env.PUSH_VAPID_PUBLIC_KEY ?? "").trim() || null;
  const privateKey = (process.env.PUSH_VAPID_PRIVATE_KEY ?? "").trim() || null;
  const subject = (process.env.PUSH_VAPID_SUBJECT ?? "").trim() || null;
  return { configured: !!(publicKey && privateKey && subject), publicKey, privateKey, subject };
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

/** Send one notification; returns "ok" or the HTTP status for stale cleanup. */
export async function sendToSubscription(
  config: PushConfig,
  sub: StoredSubscription,
  payload: { title: string; body: string; url: string; tag?: string }
): Promise<{ ok: true } | { ok: false; status: number }> {
  webpush.setVapidDetails(config.subject as string, config.publicKey as string, config.privateKey as string);
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
}
