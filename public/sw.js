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
 * server-side events):
 *   { title?: string, body?: string, url?: string }
 * Missing fields fall back to honest defaults; the notification never
 * invents content it was not sent.
 */
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_err) {
    payload = { body: event.data ? event.data.text() : "" };
  }
  const title =
    typeof payload.title === "string" && payload.title.trim()
      ? payload.title.trim()
      : "Foodie";
  const body = typeof payload.body === "string" ? payload.body : "";
  const url =
    typeof payload.url === "string" && payload.url.startsWith("/")
      ? payload.url
      : "/";
  const tag = typeof payload.tag === "string" ? payload.tag : undefined;

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
