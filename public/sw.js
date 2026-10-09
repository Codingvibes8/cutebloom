// CuteBloom Service Worker - Offline First, Caching & Push Notifications
const CACHE_NAME = "cutebloom-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/auth"
];

// --- Install & Activate ---

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

// --- Fetch (Network-first for pages, cache-first for assets) ---

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

// --- Push Notifications ---

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "CuteBloom Reminder", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "CuteBloom Reminder";
  const options = {
    body: data.body || "Time for your medication",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: data.tag || "cutebloom-reminder",
    requireInteraction: data.requireInteraction ?? true,
    actions: data.actions || [
      { action: "taken", title: "Taken" },
      { action: "snooze", title: "Snooze 10m" },
      { action: "skip", title: "Skip" },
    ],
    data: data.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// --- Notification Click Handling ---

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const action = event.action;
  const data = event.notification.data || {};

  if (action === "taken" || action === "snooze" || action === "skip") {
    // Forward the action to the client app
    event.waitUntil(
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
        if (clients.length > 0) {
          // Send to all open windows
          clients.forEach((client) => {
            client.postMessage({
              type: "notification-action",
              action: action,
              data: data,
            });
          });
        } else {
          // No open window — open one and send the action
          self.clients.openWindow("/").then((client) => {
            if (client) {
              client.postMessage({
                type: "notification-action",
                action: action,
                data: data,
              });
            }
          });
        }
      })
    );
  } else {
    // Default click (no action button) — focus or open the app
    event.waitUntil(
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
        if (clients.length > 0) {
          return clients[0].focus();
        }
        return self.clients.openWindow("/");
      })
    );
  }
});

// --- Notification Close Tracking ---

self.addEventListener("notificationclose", (event) => {
  const data = event.notification.data || {};
  // Notify client that the notification was dismissed without action
  if (data.reminderKey) {
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: "notification-closed",
          data: data,
        });
      });
    });
  }
});

// --- Message Handling (from client) ---

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
