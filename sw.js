/* =========================================
   🔥 COMMAND CENTRE SERVICE WORKER
========================================= */

const CACHE_NAME = "command-centre-v1"; // 🔥 CHANGE VERSION WHEN YOU UPDATE

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

  // 🔥 Activate immediately
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

  // 🔥 Delete old caches
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

  // 🔥 Take control immediately
  return self.clients.claim();

});

/* =========================================
   🌐 FETCH HANDLER (SMART NETWORK FIRST)
========================================= */
self.addEventListener("fetch", event => {

  const req = event.request;

  /* ❌ SKIP NON-GET (prevents POST cache error) */
  if (req.method !== "GET") return;

  /* ❌ SKIP API CALLS (VERY IMPORTANT) */
  if (req.url.includes("script.google.com")) return;

  /* ❌ SKIP CHROME EXTENSIONS / UNKNOWN */
  if (!req.url.startsWith("http")) return;

  event.respondWith(

    fetch(req)
      .then(res => {

        /* ❌ DO NOT CACHE INVALID RESPONSES */
        if (!res || res.status !== 200 || res.type !== "basic") {
          return res;
        }

        const resClone = res.clone();

        /* 💾 SAVE TO CACHE */
        caches.open(CACHE_NAME).then(cache => {
          cache.put(req, resClone);
        });

        return res;

      })
      .catch(() => {

        /* 📦 OFFLINE FALLBACK */
        return caches.match(req);

      })

  );

});
