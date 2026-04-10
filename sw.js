/* =========================================
   🔥 GREENGUARD SERVICE WORKER (FINAL)
========================================= */

const CACHE_NAME = "greenguard-v9"; // 🔥 CHANGE VERSION ON EVERY UPDATE

/* 📦 CORE FILES (APP SHELL) */
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",

  // 🔥 ICONS (VERY IMPORTANT FOR PWA)
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
        console.log("📦 Caching core files");
        return cache.addAll(urlsToCache);
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

  // 🔥 TAKE CONTROL IMMEDIATELY
  return self.clients.claim();

});

/* =========================================
   🌐 FETCH HANDLER (NETWORK FIRST)
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

        // ❌ INVALID RESPONSE
        if (!res || res.status !== 200) {
          return res;
        }

        const resClone = res.clone();

        // 💾 CACHE NEW RESPONSE
        caches.open(CACHE_NAME).then(cache => {
          cache.put(req, resClone);
        });

        return res;

      })
      .catch(() => {

        // 📦 CACHE FALLBACK
        return caches.match(req).then(cached => {

          if (cached) return cached;

          // 🔥 PWA FALLBACK
          return caches.match("./index.html");

        });

      })

  );

});
