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
 *     claimed to be enabled when it is not.
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

/** Readable error — the raw exception never reaches the UI. */
function describeError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (/push_subscriptions|schema cache|does not exist/i.test(message)) {
    return "Notification storage isn't set up on the server yet.";
  }
  if (/storage|database|network|fetch/i.test(message)) {
    return "Couldn't reach the notification service. Please try again.";
  }
  return "Something went wrong while setting up notifications.";
}

/**
 * SHA-256 of the endpoint — the stable per-browser key used by the
 * unique (user_id, endpoint_hash) constraint (duplicate prevention).
 */
async function hashEndpoint(endpoint: string): Promise<string> {
  const bytes = new TextEncoder().encode(endpoint);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Browser support probe (no permission side effects). */
export function pushSupport(): { supported: boolean; reason?: string } {
  if (typeof window === "undefined") return { supported: false, reason: "Not available before the app loads." };
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
  const res = await fetch("/api/push/config", { cache: "no-store" });
  if (!res.ok) return { configured: false, publicKey: null };
  const data = (await res.json()) as { configured?: boolean; publicKey?: string | null };
  return { configured: !!data.configured && !!data.publicKey, publicKey: data.publicKey ?? null };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

/**
 * Full enable flow. Call ONLY from a user gesture (the dialog button):
 * it requests notification permission, registers /sw.js, subscribes via
 * VAPID and stores the subscription (own row, RLS-gated upsert).
 */
export async function enablePush(): Promise<PushState> {
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

  const json = subscription.toJSON();
  const endpoint = json.endpoint;
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    return { kind: "error", message: "The browser returned an incomplete subscription." };
  }

  const endpointHash = await hashEndpoint(endpoint);
  const { error } = await sb.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint,
      endpoint_hash: endpointHash,
      p256dh,
      auth_key: auth,
    },
    { onConflict: "user_id,endpoint_hash" }
  );
  if (error) return { kind: "error", message: describeError(error) };

  return { kind: "subscribed" };
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
  const support = pushSupport();
  if (!support.supported) {
    return { kind: "unsupported", reason: support.reason ?? "This browser doesn't support web push." };
  }

  const sb = getBrowserSupabase();
  const registration = await navigator.serviceWorker.getRegistration("/");
  const sub = registration ? await registration.pushManager.getSubscription() : null;

  if (sub) {
    const endpointHash = await hashEndpoint(sub.endpoint);
    if (sb) {
      // Own-row delete — RLS scopes it to auth.uid(); errors are not fatal
      // (the browser-side unsubscribe below is the source of truth).
      await sb.from("push_subscriptions").delete().eq("endpoint_hash", endpointHash);
    }
    await sub.unsubscribe().catch(() => undefined);
  }
  return { kind: "ready" };
}
