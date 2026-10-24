/*
 * Foodie push service worker (minimal).
 *
 * Registered ONLY from an explicit user action inside the notifications
 * dialog — never on page load — and used for two things:
 *   1. receiving Web Push events and showing a system notification;
 *   2. keeping the subscription alive across reloads.
 *
 * There is deliberately NO offline caching, NO background sync and NO
 * analytics here: this worker does notifications and nothing else.
 */

self.addEventListener("install", (event) => {
  // Activate immediately — nothing to precache.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

/**
 * Push payload contract (JSON, sent by /api/push/test and future
 * server-side events):  { title?: string, body?: string, url?: string, tag?: string }
 * Missing fields fall back to honest defaults; the notification never
 * invents content it was not sent. (Mirrors normalizePushPayload in
 * src/lib/foodie/push.ts — keep both in sync.)
 */
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_err) {
    payload = { body: event.data ? event.data.text() : "" };
  }
  const safe = (typeof payload === "object" && payload !== null) ? payload : {};
  const title =
    typeof safe.title === "string" && safe.title.trim()
      ? safe.title.trim()
      : "Foodie";
  const body = typeof safe.body === "string" ? safe.body : "";
  // Same-origin paths ONLY: starts with "/" but NOT "//" — a protocol-
  // relative url (//cdn.example/x) would navigate off-origin on click.
  const url =
    typeof safe.url === "string" && safe.url.startsWith("/") && !safe.url.startsWith("//")
      ? safe.url
      : "/";
  const tag = typeof safe.tag === "string" && safe.tag ? safe.tag : undefined;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      // Same-origin icon that ships with the app.
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag,
      data: { url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of clientList) {
        if ("focus" in client) {
          client.postMessage({ type: "foodie:notification-click", url: target });
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })()
  );
});

/**
 * Subscription renewal (browser-fired when the old subscription expired or
 * was rotated — e.g. permission reset, browser update, Chrome's 60-day
 * idle expiry).
 *
 * Honest contract: the service worker can re-subscribe with the VAPID
 * PUBLIC key (served by /api/push/config), but it has NO Supabase session,
 * so it can NEVER write the renewed row itself. It hands the new
 * subscription to any open Foodie page via postMessage; the page persists
 * it only for the currently signed-in user (RLS). If no page is open or
 * nobody is signed in, nothing is stored — the stale row is later removed
 * by the delivery route's 404/410 cleanup. Nothing here ever pretends a
 * renewal was stored when it was not.
 */
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      try {
        // The VAPID public key the app was configured with. If the fetch
        // fails or push is not configured on the server, renewal stops
        // here (loudly logged) instead of storing something unusable.
        const res = await fetch("/api/push/config", { cache: "no-store" });
        if (!res.ok) {
          console.error("[sw] pushsubscriptionchange: config unavailable", res.status);
          return;
        }
        const config = await res.json();
        if (!config.configured || !config.publicKey) {
          console.error("[sw] pushsubscriptionchange: push not configured on server");
          return;
        }

        const padding = "=".repeat((4 - (config.publicKey.length % 4)) % 4);
        const base64 = (config.publicKey + padding).replace(/-/g, "+").replace(/_/g, "/");
        const raw = atob(base64);
        const applicationServerKey = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i += 1) applicationServerKey[i] = raw.charCodeAt(i);

        // oldSubscription may be null after an expiry; subscribe fresh either
        // way — same VAPID key means the server sees the same application.
        const subscription = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });

        const clientList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        let handedOff = false;
        for (const client of clientList) {
          client.postMessage({
            type: "foodie:push-subscription-changed",
            subscription: subscription.toJSON(),
          });
          handedOff = true;
        }
        if (!handedOff) {
          console.error(
            "[sw] pushsubscriptionchange: renewed but no open Foodie page to persist it — the stale row will be cleaned up on next delivery"
          );
        }
      } catch (err) {
        // Re-subscription can legitimately fail (permission revoked, push
        // service down). Log loudly; the delivery route cleans the stale row.
        console.error("[sw] pushsubscriptionchange: renewal failed:", err);
      }
    })()
  );
});
