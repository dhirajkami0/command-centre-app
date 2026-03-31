const CACHE_NAME = "forest-app-v3";

const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json"
];

/* INSTALL */
self.addEventListener("install", event => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

/* ACTIVATE */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

/* FETCH — network first */
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(res => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, res.clone());
          return res;
        });
      })
      .catch(() => caches.match(event.request))
  );
});
