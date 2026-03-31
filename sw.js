const CACHE_NAME = "forest-app-v1";

/* Files to cache */
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json"
];

/* INSTALL */
self.addEventListener("install", event => {
  console.log("✅ Service Worker Installed");

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

/* ACTIVATE */
self.addEventListener("activate", event => {
  console.log("🚀 Service Worker Activated");
});

/* FETCH (offline support) */
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});