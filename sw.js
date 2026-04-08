/* =========================================
   🔥 GREENGUARD SERVICE WORKER
========================================= */

const CACHE_NAME = "greenguard-v2"; // 🔥 UPDATE VERSION WHEN CHANGING FILES

/* 📦 CORE FILES (APP SHELL) */
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json"
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

        /* 📦 TRY CACHE */
        return caches.match(req).then(cached => {

          if (cached) return cached;

          /* 🔥 FALLBACK TO INDEX (PWA SAFE) */
          return caches.match("./index.html");

        });

      })

  );

});
