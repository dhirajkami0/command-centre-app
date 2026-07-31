/* =========================================
   🔥 GREENGUARD SERVICE WORKER (SMART UPDATE)
========================================= */

const CACHE_NAME = "GreenGuard-20260731112749"; // 🔥 CHANGE EVERY UPDATE

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

  // =====================================
  // 🔥 FORCE IMMEDIATE UPDATE
  // =====================================
  self.skipWaiting();

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => {

        console.log("📦 Caching App Shell");

        return cache.addAll(APP_SHELL);

      })

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

            console.log(
              "🧹 Deleting old cache:",
              key
            );

            return caches.delete(key);

          }

        })

      )

    )

  );

  // =====================================
  // 🔥 TAKE CONTROL IMMEDIATELY
  // =====================================
  self.clients.claim();

});

/* =========================================
   🔄 SKIP WAITING (ON USER ACTION)
========================================= */
self.addEventListener("message", event => {

  if (
    event.data &&
    event.data.action === "skipWaiting"
  ) {

    console.log("⚡ Skip Waiting Triggered");

    self.skipWaiting();

  }

});

/* =========================================
   🌐 FETCH
========================================= */
self.addEventListener("fetch", event => {

  const req = event.request;

  /* ❌ Skip API */
  if (
    req.url.includes("script.google.com")
  ) return;

  /* ❌ Only GET */
  if (req.method !== "GET") return;

  /* =========================================
     📄 HTML → NETWORK FIRST
  ========================================= */
  if (req.mode === "navigate") {

    event.respondWith(

      fetch(req)

        .then(res => {

          console.log(
            "🌐 Fresh HTML:",
            req.url
          );

          const clone = res.clone();

          caches.open(CACHE_NAME)
            .then(cache => {

              cache.put(
                "./index.html",
                clone
              );

            });

          return res;

        })

        .catch(() => {

          console.log(
            "📦 Offline HTML Cache Used"
          );

          return caches.match("./index.html");

        })

    );

    return;

  }

  /* =========================================
     📦 STATIC FILES → NETWORK FIRST
  ========================================= */
  event.respondWith(

    fetch(req)

      .then(res => {

        // =====================================
        // 🔥 VALID RESPONSE
        // =====================================

        if (
          res &&
          res.status === 200
        ) {

          const clone = res.clone();

          caches.open(CACHE_NAME)
            .then(cache => {

              cache.put(req, clone);

            });

        }

        return res;

      })

      // =====================================
      // 🔥 FALLBACK TO CACHE
      // =====================================

      .catch(() => {

        console.log(
          "📦 Cache Fallback:",
          req.url
        );

        return caches.match(req);

      })

  );

});
