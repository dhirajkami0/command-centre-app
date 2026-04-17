/* =========================================
   🔥 GREENGUARD SERVICE WORKER (FINAL PRO LOCAL)
========================================= */

const CACHE_NAME = "greenguard-v15"; // 🔥 UPDATE VERSION EVERY CHANGE

/* =========================================
   📦 CORE + LOCAL FILES
========================================= */
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",

  /* 🔥 LOCAL LIBRARIES */
  "./css/leaflet.css",
  "./js/leaflet.js",
  "./js/leaflet-omnivore.min.js",
  "./js/shp.js",
  "./js/leaflet-kml.js",

  /* 🔥 LEAFLET IMAGES (CRITICAL FIX) */
  "./css/images/layers.png",
  "./css/images/layers-2x.png",
  "./css/images/marker-icon.png",
  "./css/images/marker-icon-2x.png",
  "./css/images/marker-shadow.png",

  /* 🔥 APP ICONS */
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

/* =========================================
   📥 INSTALL
========================================= */
self.addEventListener("install", event => {

  console.log("✅ SW Installing...");

  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("📦 Caching app shell...");
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.error("❌ Cache failed:", err);
      })
  );

});

/* =========================================
   🚀 ACTIVATE
========================================= */
self.addEventListener("activate", event => {

  console.log("🚀 SW Activated");

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

  return self.clients.claim();
});

/* =========================================
   🌐 FETCH (OFFLINE-FIRST + NAVIGATION FIX)
========================================= */
self.addEventListener("fetch", event => {

  const req = event.request;

  /* ❌ Skip API calls */
  if (req.url.includes("script.google.com")) return;

  /* ❌ Only GET */
  if (req.method !== "GET") return;

  /* 🔥🔥 CRITICAL FIX: HANDLE PAGE RELOAD OFFLINE */
  if (req.mode === "navigate") {
    event.respondWith(
      caches.match("./index.html")
        .then(res => {
          if (res) return res;
          return fetch(req);
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  /* =========================================
     🔄 NORMAL CACHE FLOW
  ========================================= */
  event.respondWith(

    caches.match(req).then(cached => {

      /* ✅ CACHE FIRST */
      if (cached) {
        return cached;
      }

      /* 🌐 NETWORK */
      return fetch(req)
        .then(res => {

          if (!res || res.status !== 200) return res;

          const resClone = res.clone();

          /* 💾 SAVE */
          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, resClone);
          });

          return res;
        })
        .catch(() => {

          /* 🔥 OFFLINE FALLBACK */
          if (req.destination === "document") {
            return caches.match("./index.html");
          }

          return new Response("Offline", {
            status: 503,
            statusText: "Offline"
          });

        });

    })

  );

});
