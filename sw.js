const CACHE_NAME = "forest-app-v4"; // 🔥 change version

const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json"
];

/* INSTALL */
self.addEventListener("install", event => {
  console.log("✅ Service Worker Installing...");
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("📦 Caching core files");
        return cache.addAll(urlsToCache);
      })
  );
});

/* ACTIVATE */
self.addEventListener("activate", event => {
  console.log("🚀 Service Worker Activated");

  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

/* FETCH — SAFE NETWORK FIRST */
self.addEventListener("fetch", event => {

  const req = event.request;

  // 🔥 ❌ DO NOT CACHE POST / API CALLS
  if (req.method !== "GET") {
    return; // let it go directly to network
  }

  event.respondWith(
    fetch(req)
      .then(res => {

        // 🔥 Only cache valid responses
        if (!res || res.status !== 200 || res.type !== "basic") {
          return res;
        }

        const resClone = res.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(req, resClone);
        });

        return res;
      })
      .catch(() => {
        // 🔥 fallback from cache
        return caches.match(req);
      })
  );
});
