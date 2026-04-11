/* =========================================
   🔥 GREENGUARD SERVICE WORKER (FINAL PRO)
========================================= */

const CACHE_NAME = "greenguard-v10"; // 🔥 UPDATE VERSION

/* 📦 CORE + LIBRARIES (OFFLINE READY) */
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",

  // 🔥 ICONS
  "./icons/icon-192.png",
  "./icons/icon-512.png",

  /* 🔥 CRITICAL CDN FILES (ADDED) */
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet-omnivore@0.3.4/leaflet-omnivore.min.js",
  "https://unpkg.com/shpjs@latest/dist/shp.js",
  "https://unpkg.com/leaflet-kml@1.0.1/L.KML.js",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
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
        console.log("📦 Caching core + libs");

        return cache.addAll(urlsToCache)
          .catch(err => {
            console.warn("⚠ Some files failed to cache:", err);
          });
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
            console.log("🧹 Removing old cache:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );

  return self.clients.claim();

});

/* =========================================
   🌐 FETCH (NETWORK FIRST → CACHE FALLBACK)
========================================= */
self.addEventListener("fetch", event => {

  const req = event.request;

  /* ❌ SKIP NON-GET */
  if (req.method !== "GET") return;

  /* ❌ SKIP API CALLS */
  if (req.url.includes("script.google.com")) return;

  /* ❌ SKIP NON-HTTP */
  if (!req.url.startsWith("http")) return;

  event.respondWith(

    fetch(req)
      .then(res => {

        if (!res || res.status !== 200) return res;

        const resClone = res.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(req, resClone);
        });

        return res;

      })
      .catch(() => {

        return caches.match(req).then(cached => {

          if (cached) return cached;

          /* 🔥 SMART FALLBACKS */
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
