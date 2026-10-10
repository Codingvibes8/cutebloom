// CuteBloom Service Worker - Offline First, Web Push & Notification Actions
const CACHE_NAME = "cutebloom-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/auth",
  "/medications",
  "/reminders",
  "/refills",
  "/checkin",
  "/dose-log",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  // Let Supabase Auth and API calls bypass service worker cache
  if (
    event.request.url.includes("supabase.co") ||
    event.request.url.includes("/api/") ||
    event.request.url.includes("/auth/callback")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Clone response and cache static routes
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed, serve from cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
          return new Response("Offline", { status: 503, statusText: "Offline" });
        });
      })
  );
});

// ── Web Push Notification Actions ─────────────────────────────────
// Handles Taken, Snooze, and Skip actions from notification buttons

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const { action, notification } = event;
  const data = notification.data || {};
  const medicationId = data.medicationId;
  const scheduledTime = data.scheduledTime;
  const clientUuid = data.clientUuid;

  // Helper to find or open the app
  const openApp = () => {
    const url = medicationId ? `/medications/${medicationId}/log` : "/dose-log";
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if ("focus" in client) {
            client.focus();
            client.postMessage({
              type: "NOTIFICATION_ACTION",
              action,
              medicationId,
              scheduledTime,
              clientUuid,
            });
            return;
          }
        }
        // Open new window
        return clients.openWindow(url);
      })
    );
  };

  switch (action) {
    case "taken":
      // Mark dose as taken
      event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
          for (const client of clientList) {
            client.postMessage({
              type: "NOTIFICATION_ACTION",
              action: "taken",
              medicationId,
              scheduledTime,
              clientUuid,
            });
          }
        })
      );
      break;

    case "snooze":
      // Snooze for 10 minutes — schedule a new notification
      event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
          for (const client of clientList) {
            client.postMessage({
              type: "NOTIFICATION_ACTION",
              action: "snooze",
              medicationId,
              scheduledTime,
              clientUuid,
            });
          }
        })
      );
      break;

    case "skip":
      // Mark dose as skipped
      event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
          for (const client of clientList) {
            client.postMessage({
              type: "NOTIFICATION_ACTION",
              action: "skip",
              medicationId,
              scheduledTime,
              clientUuid,
            });
          }
        })
      );
      break;

    default:
      // Notification body clicked — open app
      openApp();
      break;
  }
});

// ── Push Event (for future VAPID server push) ──────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || "CuteBloom Reminder";
    const options = {
      body: data.body || "Time for your medication",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: data.tag || "cutebloom-reminder",
      requireInteraction: true,
      actions: [
        { action: "taken", title: "Taken" },
        { action: "snooze", title: "Snooze 10m" },
        { action: "skip", title: "Skip" },
      ],
      data: data.data || {},
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    // Fallback for non-JSON push data
    event.waitUntil(
      self.registration.showNotification("CuteBloom Reminder", {
        body: event.data.text(),
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        requireInteraction: true,
        actions: [
          { action: "taken", title: "Taken" },
          { action: "snooze", title: "Snooze 10m" },
          { action: "skip", title: "Skip" },
        ],
      })
    );
  }
});
