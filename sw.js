/* =========================================
🔥 GREENGUARD SERVICE WORKER
USER-CONTROLLED UPDATE
========================================= */


const CACHE_NAME =
    "greenguard-v35";


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


// =========================================
// 📥 INSTALL
// =========================================
//
// IMPORTANT:
//
// DO NOT call self.skipWaiting() here.
//
// The new worker must WAIT until the user
// presses the Update button.
// =========================================

self.addEventListener(
    "install",
    function(event){

        console.log(
            "📦 GreenGuard SW Installing..."
        );


        event.waitUntil(

            caches.open(
                CACHE_NAME
            )

            .then(
                function(cache){

                    console.log(
                        "📦 Caching App Shell"
                    );


                    return cache.addAll(
                        APP_SHELL
                    );

                }
            )

        );

    }
);


// =========================================
// 🚀 ACTIVATE
// =========================================

self.addEventListener(
    "activate",
    function(event){

        console.log(
            "🚀 GreenGuard SW Activated"
        );


        event.waitUntil(

            caches.keys()

                .then(
                    function(keys){

                        return Promise.all(

                            keys.map(
                                function(key){

                                    if (
                                        key !==
                                        CACHE_NAME
                                    ){

                                        console.log(
                                            "🧹 Deleting old cache:",
                                            key
                                        );


                                        return caches.delete(
                                            key
                                        );

                                    }

                                }
                            )

                        );

                    }
                )

        );


        // ==================================================
        // IMPORTANT
        // ==================================================
        //
        // Once the user has explicitly activated the new
        // Service Worker, it may claim the clients.
        //
        // ==================================================

        self.clients.claim();

    }
);


// =========================================
// 🔄 USER-CONTROLLED SKIP WAITING
// =========================================
//
// ONLY the webpage Update button sends this message.
//
// =========================================

self.addEventListener(
    "message",
    function(event){

        if (
            event.data &&
            event.data.action ===
            "skipWaiting"
        ){

            console.log(
                "⚡ User requested Service Worker activation"
            );


            self.skipWaiting();

        }

    }
);


// =========================================
// 🌐 FETCH
// =========================================

self.addEventListener(
    "fetch",
    function(event){

        const req =
            event.request;


        // =====================================
        // ❌ SKIP GOOGLE APPS SCRIPT
        // =====================================

        if (
            req.url.includes(
                "script.google.com"
            )
        ){

            return;

        }


        // =====================================
        // ❌ ONLY GET
        // =====================================

        if (
            req.method !==
            "GET"
        ){

            return;

        }


        // =====================================
        // 📄 HTML NAVIGATION
        // =====================================
        //
        // Network first.
        //
        // This means manual reload gets the latest
        // available HTML when online.
        //
        // =====================================

        if (
            req.mode ===
            "navigate"
        ){

            event.respondWith(

                fetch(req)

                    .then(
                        function(response){

                            console.log(
                                "🌐 Fresh HTML:",
                                req.url
                            );


                            if (
                                response &&
                                response.status ===
                                200
                            ){

                                const clone =
                                    response.clone();


                                caches.open(
                                    CACHE_NAME
                                )
                                .then(
                                    function(cache){

                                        cache.put(
                                            "./index.html",
                                            clone
                                        );

                                    }
                                );

                            }


                            return response;

                        }
                    )

                    .catch(
                        function(){

                            console.log(
                                "📦 Offline HTML cache used"
                            );


                            return caches.match(
                                "./index.html"
                            );

                        }
                    )

            );


            return;

        }


        // =====================================
        // 📦 STATIC FILES
        // =====================================
        //
        // Network first.
        //
        // If network succeeds, cache the latest
        // resource.
        //
        // If network fails, use cache.
        //
        // =====================================

        event.respondWith(

            fetch(req)

                .then(
                    function(response){

                        if (
                            response &&
                            response.status ===
                            200
                        ){

                            const clone =
                                response.clone();


                            caches.open(
                                CACHE_NAME
                            )
                            .then(
                                function(cache){

                                    cache.put(
                                        req,
                                        clone
                                    );

                                }
                            );

                        }


                        return response;

                    }
                )

                .catch(
                    function(){

                        console.log(
                            "📦 Cache fallback:",
                            req.url
                        );


                        return caches.match(
                            req
                        );

                    }
                )

        );

    }
);
