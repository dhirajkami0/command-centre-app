/* =========================================
   🔥 GREENGUARD SERVICE WORKER (SMART UPDATE)
========================================= */

const CACHE_NAME = "greenguard-v23"; // 🔥 CHANGE EVERY UPDATE

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/leaflet.css",
  "./js/leaflet.js",
  "./js/leaflet-omnivore.min.js",
  "./js/shp.js",
  "./js/leaflet-kml.js",
   "./kml/Compartments.kml",
  "./css/images/layers.png",
  "./css/images/layers-2x.png",
  "./css/images/marker-icon.png",
  "./css/images/marker-icon-2x.png",
  "./css/images/marker-shadow.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

/* =========================================
   📥 INSTALL
========================================= */
self.addEventListener("install", event => {

  console.log("📦 SW Installing...");

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
  );

});

/* =========================================
   🚀 ACTIVATE
========================================= */
self.addEventListener("activate", event => {

  console.log("🚀 SW Activated");

  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

/* =========================================
   🔄 SKIP WAITING (ON USER ACTION)
========================================= */
self.addEventListener("message", event => {
  if (event.data && event.data.action === "skipWaiting") {
    self.skipWaiting();
  }
});

/* =========================================
   🌐 FETCH (SMART STRATEGY)
========================================= */
self.addEventListener("fetch", event => {

  const req = event.request;

  /* ❌ Skip API */
  if (req.url.includes("script.google.com")) return;

  /* ❌ Only GET */
  if (req.method !== "GET") return;

  /* =========================================
     📄 HTML → NETWORK FIRST
  ========================================= */
  if (req.mode === "navigate") {

    event.respondWith(
      fetch(req)
        .then(res => {

          const clone = res.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put("./index.html", clone);
          });

          return res;

        })
        .catch(() => caches.match("./index.html"))
    );

    return;
  }

  /* =========================================
     📦 STATIC → CACHE FIRST + UPDATE
  ========================================= */
  event.respondWith(

    caches.match(req).then(cached => {

      const networkFetch = fetch(req)
        .then(res => {

          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(req, clone);
            });
          }

          return res;

        })
        .catch(() => cached);

      return cached || networkFetch;

    })

  );

});
