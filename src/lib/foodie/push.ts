/**
 * Foodie push-notification CLIENT helpers.
 *
 * SECURITY & COURTESY CONTRACT:
 *   * Notification permission is requested ONLY from an explicit user
 *     action (the notifications dialog) — never on page load, never on a
 *     timer, never from an effect.
 *   * Subscriptions are stored in `public.push_subscriptions` via the
 *     browser Supabase client, so RLS ("own rows only", user_id =
 *     auth.uid()) governs every write/read. There is no service-role path.
 *   * The VAPID public key is fetched from /api/push/config. It is public
 *     by design; the PRIVATE key never leaves the server.
 *   * Duplicate prevention: the row key is (user_id, endpoint_hash) with
 *     endpoint_hash = SHA-256(endpoint), so re-subscribing UPDATES the same
 *     row instead of duplicating it (migration-010 unique constraint).
 *   * Every failure degrades to an honest, user-safe state — nothing is
 *     claimed to be enabled when it is not. enablePush() NEVER throws:
 *     every failure becomes a PushState the dialog can render.
 *   * Renewal: when the browser fires `pushsubscriptionchange` (service
 *     worker), the SW re-subscribes and postMessages this page, which
 *     upserts the renewed subscription for the logged-in user (see
 *     watchPushRenewal). If no page is open, the stale row is cleaned up
 *     by the delivery route's 404/410 handling instead — never silently
 *     pretended to work.
 */

import { getBrowserSupabase } from "@/lib/supabase/client";
import { useAuthStore } from "./authStore";

export type PushState =
  | { kind: "unsupported"; reason: string }
  | { kind: "not-configured" }
  | { kind: "needs-login" }
  | { kind: "permission-denied" }
  | { kind: "ready" }
  | { kind: "subscribed" }
  | { kind: "error"; message: string };

/** How long /api/push/config may take before the dialog reports a failure. */
const CONFIG_TIMEOUT_MS = 8000;

/** Readable error — the raw exception never reaches the UI. */
export function describePushError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (/push_subscriptions|schema cache|does not exist/i.test(message)) {
    return "Notification storage isn't set up on the server yet.";
  }
  if (/abort|timeout|timed out/i.test(message)) {
    return "The notification service took too long to respond. Please try again.";
  }
  if (/storage|database|network|fetch|load failed/i.test(message)) {
    return "Couldn't reach the notification service. Please try again.";
  }
  return "Something went wrong while setting up notifications.";
}

/**
 * SHA-256 of the endpoint — the stable per-browser key used by the
 * unique (user_id, endpoint_hash) constraint (duplicate prevention).
 */
export async function hashPushEndpoint(endpoint: string): Promise<string> {
  const bytes = new TextEncoder().encode(endpoint);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Normalizes a push payload to exactly what the service worker may show.
 * Mirrored by public/sw.js (which cannot import TS) — keep both in sync.
 * The notification never invents content it was not sent: non-string
 * fields fall back to honest defaults, and the url must be a SAME-ORIGIN
 * path — starting with "/" but NOT "//" (a protocol-relative url would
 * navigate off-origin when the notification is clicked).
 */
export function normalizePushPayload(raw: unknown): {
  title: string;
  body: string;
  url: string;
  tag?: string;
} {
  const payload = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const title =
    typeof payload.title === "string" && payload.title.trim() ? payload.title.trim() : "Foodie";
  const body = typeof payload.body === "string" ? payload.body : "";
  const url =
    typeof payload.url === "string" && payload.url.startsWith("/") && !payload.url.startsWith("//")
      ? payload.url
      : "/";
  const tag = typeof payload.tag === "string" && payload.tag ? payload.tag : undefined;
  return { title, body, url, tag };
}

/** Browser support probe (no permission side effects). */
export function pushSupport(): { supported: boolean; reason?: string } {
  if (typeof window === "undefined") return { supported: false, reason: "Not available before the app loads." };
  // Web push + service workers only exist in secure contexts (HTTPS, or
  // localhost during development). Saying so honestly beats a generic error.
  if (window.isSecureContext === false) {
    return { supported: false, reason: "Push needs a secure connection (HTTPS) — this page isn't secure." };
  }
  if (!("serviceWorker" in navigator)) return { supported: false, reason: "This browser has no service-worker support." };
  if (!("PushManager" in window)) return { supported: false, reason: "This browser doesn't support web push." };
  if (!("Notification" in window)) return { supported: false, reason: "This browser doesn't support notifications." };
  return { supported: true };
}

async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  return navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

/** Current server push configuration (VAPID public key), if set up. */
export async function fetchPushConfig(): Promise<{ configured: boolean; publicKey: string | null }> {
  try {
    const res = await fetch("/api/push/config", { cache: "no-store", signal: AbortSignal.timeout(CONFIG_TIMEOUT_MS) });
    if (!res.ok) return { configured: false, publicKey: null };
    const data = (await res.json()) as { configured?: boolean; publicKey?: string | null };
    return { configured: !!data.configured && !!data.publicKey, publicKey: data.publicKey ?? null };
  } catch {
    // Timeout or network failure — the honest state is "not configured",
    // which the dialog renders without ever pretending delivery works.
    return { configured: false, publicKey: null };
  }
}

/** VAPID application-server key decoder (URL-safe base64 → bytes). */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

interface SubscriptionRow {
  user_id: string;
  endpoint: string;
  endpoint_hash: string;
  p256dh: string;
  auth_key: string;
  /** Present only when the browser reports a finite expirationTime. */
  expires_at?: string | null;
}

/**
 * Upserts ONE subscription row for the logged-in user (RLS-gated).
 * Shared by the enable flow and the pushsubscriptionchange renewal path,
 * so both write exactly the same shape (duplicate prevention via the
 * (user_id, endpoint_hash) unique constraint).
 */
async function persistSubscription(
  sb: NonNullable<ReturnType<typeof getBrowserSupabase>>,
  userId: string,
  subscription: PushSubscription
): Promise<{ ok: true } | { ok: false; error: unknown }> {
  const json = subscription.toJSON();
  const endpoint = json.endpoint;
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    return { ok: false, error: new Error("The browser returned an incomplete subscription.") };
  }

  const endpointHash = await hashPushEndpoint(endpoint);
  const row: SubscriptionRow = {
    user_id: userId,
    endpoint,
    endpoint_hash: endpointHash,
    p256dh,
    auth_key: auth,
  };
  // Browsers rarely set expirationTime; when they do, store it so stale
  // rows are explainable (the column is nullable — migration-010).
  const expiresAt =
    typeof subscription.expirationTime === "number" && Number.isFinite(subscription.expirationTime)
      ? new Date(subscription.expirationTime * 1000).toISOString()
      : null;
  if (expiresAt) row.expires_at = expiresAt;

  const { error } = await sb.from("push_subscriptions").upsert(row, {
    onConflict: "user_id,endpoint_hash",
  });
  return error ? { ok: false, error } : { ok: true };
}

/**
 * Full enable flow. Call ONLY from a user gesture (the dialog button):
 * it requests notification permission, registers /sw.js, subscribes via
 * VAPID and stores the subscription (own row, RLS-gated upsert).
 *
 * NEVER THROWS — every failure (including registration/subscription
 * exceptions and the browser denying mid-flow) resolves to a PushState,
 * so the dialog can never be left stuck on a spinner.
 */
export async function enablePush(): Promise<PushState> {
  try {
    const support = pushSupport();
    if (!support.supported) {
      return { kind: "unsupported", reason: support.reason ?? "This browser doesn't support web push." };
    }

    const user = useAuthStore.getState().user;
    if (!user) return { kind: "needs-login" };

    const sb = getBrowserSupabase();
    if (!sb) return { kind: "not-configured" };

    const config = await fetchPushConfig();
    if (!config.configured || !config.publicKey) return { kind: "not-configured" };

    // Already denied (e.g. blocked in site settings) — asking again would
    // instantly resolve "denied"; surface the honest recovery state instead.
    if (Notification.permission === "denied") return { kind: "permission-denied" };

    const permission = await Notification.requestPermission();
    if (permission === "denied") return { kind: "permission-denied" };
    if (permission !== "granted") return { kind: "error", message: "Notification permission wasn't granted." };

    const registration = await registerServiceWorker();
    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(config.publicKey) as BufferSource,
      }));

    const persisted = await persistSubscription(sb, user.id, subscription);
    if (!persisted.ok) return { kind: "error", message: describePushError(persisted.error) };

    return { kind: "subscribed" };
  } catch (err) {
    // Registration/subscription failures (NotAllowedError, AbortError,
    // network) land here — an honest error state, never a stuck spinner.
    return { kind: "error", message: describePushError(err) };
  }
}

/**
 * True when THIS browser already holds a push subscription for the
 * logged-in user (reads the browser's own subscription — no permission
 * prompt, no network).
 */
export async function isSubscribed(): Promise<boolean> {
  const support = pushSupport();
  if (!support.supported) return false;
  try {
    const registration = await navigator.serviceWorker.getRegistration("/");
    if (!registration) return false;
    const sub = await registration.pushManager.getSubscription();
    return !!sub;
  } catch {
    return false;
  }
}

/** Turns push OFF for this browser: unsubscribes and removes the stored row. */
export async function disablePush(): Promise<PushState> {
  try {
    const support = pushSupport();
    if (!support.supported) {
      return { kind: "unsupported", reason: support.reason ?? "This browser doesn't support web push." };
    }

    const sb = getBrowserSupabase();
    const registration = await navigator.serviceWorker.getRegistration("/");
    const sub = registration ? await registration.pushManager.getSubscription() : null;

    if (sub) {
      const endpointHash = await hashPushEndpoint(sub.endpoint);
      const user = useAuthStore.getState().user;
      if (sb && user) {
        // Own-row delete — RLS scopes it to auth.uid() and the explicit
        // user_id filter is defence-in-depth. Errors are not fatal (the
        // browser-side unsubscribe below is the source of truth; any
        // leftover row is cleaned up by the delivery route on 404/410).
        await sb
          .from("push_subscriptions")
          .delete()
          .eq("user_id", user.id)
          .eq("endpoint_hash", endpointHash);
      }
      await sub.unsubscribe().catch(() => undefined);
    }
    return { kind: "ready" };
  } catch {
    return { kind: "error", message: "Couldn't turn notifications off completely — please try again." };
  }
}

/**
 * Message from the service worker after `pushsubscriptionchange`: the
 * browser replaced the subscription (expired/rotated), the SW re-subscribed
 * and hands the new subscription to this page for persistence.
 */
const RENEWAL_MESSAGE_TYPE = "foodie:push-subscription-changed";

/**
 * Listens (once) for service-worker renewal messages and upserts the
 * renewed subscription for the CURRENTLY logged-in user. Returns a cleanup
 * function. Best-effort by design: if no page is open or nobody is signed
 * in, nothing is persisted — the delivery route removes the stale row on
 * its next 404/410, which is the honest outcome.
 */
export function watchPushRenewal(): () => void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return () => undefined;

  const onMessage = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    const data = event.data as { type?: string; subscription?: unknown } | null;
    if (!data || data.type !== RENEWAL_MESSAGE_TYPE) return;

    const user = useAuthStore.getState().user;
    const sb = getBrowserSupabase();
    if (!user || !sb) return; // honest no-op — see docstring
    try {
      const sub = data.subscription as PushSubscription | null;
      if (!sub || typeof sub.toJSON !== "function" || !sub.endpoint) return;
      void persistSubscription(sb, user.id, sub).then((result) => {
        if (!result.ok) console.error("[push] renewal persistence failed:", result.error);
      });
    } catch (err) {
      console.error("[push] renewal message handling failed:", err);
    }
  };

  navigator.serviceWorker.addEventListener("message", onMessage);
  return () => navigator.serviceWorker.removeEventListener("message", onMessage);
}
