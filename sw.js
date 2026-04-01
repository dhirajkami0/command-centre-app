self.addEventListener("fetch", event => {

  const req = event.request;

  // ❌ Skip non-GET
  if (req.method !== "GET") return;

  // ❌ Skip API (VERY IMPORTANT for your app)
  if (req.url.includes("script.google.com")) return;

  event.respondWith(

    fetch(req)
      .then(res => {

        // ✅ Only cache safe responses
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
        // ✅ fallback to cache if offline
        return caches.match(req);
      })

  );

});
