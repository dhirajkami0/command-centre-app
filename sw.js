const CACHE_NAME = "forest-app-v1";

/* Files to cache */
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json"
];

/* INSTALL */
self.addEventListener("install", event => {
  console.log("✅ Service Worker Installing...");

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.error("❌ Cache failed:", err))
  );

  self.skipWaiting();
});

/* ACTIVATE */
self.addEventListener("activate", event => {
  console.log("🚀 Service Worker Activated");
});

/* FETCH */
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => console.log("⚠️ Fetch failed"))
  );
});
