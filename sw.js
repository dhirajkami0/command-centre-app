/* =========================================
🔥 GREENGUARD SERVICE WORKER
FAST STARTUP + OFFLINE FIRST
USER-CONTROLLED UPDATE
========================================= */


/* ============================================================
   CACHE VERSION
============================================================ */

const CACHE_NAME =
    "greenguard-v37";


/* ============================================================
   APP SHELL
============================================================ */

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


/* ============================================================
   STATIC FILE DETECTION
============================================================ */

function isStaticRequest(
    request
){

    const url =
        new URL(
            request.url
        );


    /* --------------------------------------------------------
       ONLY SAME-ORIGIN
       -------------------------------------------------------- */

    if(
        url.origin !==
        self.location.origin
    ){

        return false;

    }


    /* --------------------------------------------------------
       STATIC EXTENSIONS
       -------------------------------------------------------- */

    const pathname =
        url.pathname
            .toLowerCase();


    return (

        pathname.endsWith(".js") ||

        pathname.endsWith(".css") ||

        pathname.endsWith(".json") ||

        pathname.endsWith(".geojson") ||

        pathname.endsWith(".kml") ||

        pathname.endsWith(".png") ||

        pathname.endsWith(".jpg") ||

        pathname.endsWith(".jpeg") ||

        pathname.endsWith(".webp") ||

        pathname.endsWith(".svg") ||

        pathname.endsWith(".ico") ||

        pathname.endsWith(".woff") ||

        pathname.endsWith(".woff2") ||

        pathname.endsWith(".ttf")

    );

}


/* ============================================================
   INSTALL
============================================================ */

self.addEventListener(
    "install",
    function(event){

        console.log(
            "📦 GreenGuard SW Installing:",
            CACHE_NAME
        );


        event.waitUntil(

            caches.open(
                CACHE_NAME
            )

            .then(
                function(cache){

                    console.log(
                        "📦 Caching GreenGuard App Shell"
                    );


                    return cache.addAll(
                        APP_SHELL
                    );

                }
            )

            .then(
                function(){

                    console.log(
                        "✅ GreenGuard App Shell Cached"
                    );

                }
            )

            .catch(
                function(error){

                    console.error(
                        "❌ App Shell Cache Failed:",
                        error
                    );


                    /*
                     * IMPORTANT:
                     *
                     * Do not silently swallow this.
                     * Installation may still complete,
                     * but the error remains visible.
                     */

                }
            )

        );


        /*
         * IMPORTANT
         *
         * DO NOT call skipWaiting() here.
         *
         * The user-controlled Update button
         * decides when the new worker activates.
         */

    }
);


/* ============================================================
   ACTIVATE
============================================================ */

self.addEventListener(
    "activate",
    function(event){

        console.log(
            "🚀 GreenGuard SW Activated:",
            CACHE_NAME
        );


        event.waitUntil(

            caches.keys()

                .then(
                    function(keys){

                        return Promise.all(

                            keys.map(
                                function(key){

                                    /*
                                     * Keep only GreenGuard
                                     * current cache.
                                     */

                                    if(
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


                                    return null;

                                }
                            )

                        );

                    }
                )

                .then(
                    function(){

                        console.log(
                            "✅ GreenGuard Cache Cleanup Complete"
                        );

                    }
                )

        );


        /*
         * Once the user has explicitly activated
         * this Service Worker, allow it to control
         * the current page.
         */

        self.clients.claim();

    }
);


/* ============================================================
   USER-CONTROLLED UPDATE
============================================================ */

self.addEventListener(
    "message",
    function(event){

        if(
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


/* ============================================================
   FETCH
============================================================ */

self.addEventListener(
    "fetch",
    function(event){

        const req =
            event.request;


        /* ====================================================
           ONLY GET
        ==================================================== */

        if(
            req.method !==
            "GET"
        ){

            return;

        }


        const url =
            new URL(
                req.url
            );


        /* ====================================================
           🚫 NEVER INTERCEPT CROSS-ORIGIN REQUESTS
           
           This is extremely important for:
           
           Firebase
           Firestore
           Google APIs
           Apps Script
           External map tiles
           External services
        ==================================================== */

        if(
            url.origin !==
            self.location.origin
        ){

            return;

        }


        /* ====================================================
           🚫 GOOGLE APPS SCRIPT
           
           Extra protection.
        ==================================================== */

        if(
            url.hostname.includes(
                "script.google.com"
            )
        ){

            return;

        }


        /* ====================================================
           📄 HTML NAVIGATION
           
           CACHE FIRST
           
           The cached application opens immediately.
           
           We intentionally DO NOT wait for network here.
        ==================================================== */

        if(
            req.mode ===
            "navigate"
        ){

            event.respondWith(

                caches.match(
                    "./index.html"
                )

                .then(
                    function(cachedResponse){

                        if(
                            cachedResponse
                        ){

                            console.log(
                                "⚡ Instant HTML from cache"
                            );


                            return cachedResponse;

                        }


                        /*
                         * First-ever installation or
                         * cache unavailable.
                         */

                        console.log(
                            "🌐 No cached HTML → network"
                        );


                        return fetch(
                            req
                        );

                    }
                )

                .catch(
                    function(){

                        console.warn(
                            "⚠ HTML cache/network unavailable"
                        );


                        return new Response(

                            "<!doctype html>" +
                            "<html>" +
                            "<body>" +
                            "<h3>GreenGuard</h3>" +
                            "<p>Waiting for network...</p>" +
                            "</body>" +
                            "</html>",

                            {

                                status:
                                    503,

                                headers:{
                                    "Content-Type":
                                        "text/html; charset=utf-8"
                                }

                            }

                        );

                    }
                )

            );


            return;

        }


        /* ====================================================
           📦 STATIC SAME-ORIGIN FILES
           
           CACHE FIRST
           
           This is the major mobile-startup improvement.
        ==================================================== */

        if(
            isStaticRequest(
                req
            )
        ){

            event.respondWith(

                caches.match(
                    req
                )

                .then(
                    function(cachedResponse){

                        if(
                            cachedResponse
                        ){

                            return cachedResponse;

                        }


                        /*
                         * Not cached yet.
                         * Fetch once and cache it.
                         */

                        return fetch(
                            req
                        )

                        .then(
                            function(response){

                                if(
                                    response &&
                                    response.ok
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
                                    )
                                    .catch(
                                        function(error){

                                            console.warn(
                                                "⚠ Static cache write failed:",
                                                error
                                            );

                                        }
                                    );

                                }


                                return response;

                            }
                        );

                    }
                )

                .catch(
                    function(){

                        console.warn(
                            "📦 Static cache unavailable:",
                            req.url
                        );


                        return caches.match(
                            req
                        );

                    }
                )

            );


            return;

        }


        /* ====================================================
           🌐 OTHER SAME-ORIGIN GET REQUESTS
           
           NETWORK FIRST
           
           These are not treated as static application files.
        ==================================================== */

        event.respondWith(

            fetch(
                req
            )

            .catch(
                function(){

                    return caches.match(
                        req
                    );

                }
            )

        );

    }
);
