/* =========================================
🔥 GREENGUARD SERVICE WORKER
SMART / USER-CONTROLLED UPDATE SYSTEM
========================================= */


// =========================================
// 🔥 CACHE VERSION
// =========================================
//
// CHANGE THIS WHEN YOU DEPLOY A NEW VERSION.
//
// Example:
//
// greenguard-v35
// greenguard-v36
// greenguard-v37
//
// =========================================

const CACHE_NAME =
    "greenguard-v35";


// =========================================
// 📦 APPLICATION SHELL
// =========================================

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
// DO NOT call skipWaiting() here.
//
// The new worker must remain WAITING until
// the user explicitly presses Update.
//
// =========================================

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

        );

    }

);


// =========================================
// 🚀 ACTIVATE
// =========================================
//
// Activation occurs:
//
// 1. Normally on first installation
//
// OR
//
// 2. After the user explicitly presses
//    the Update button and the page sends:
//
//    { action: "skipWaiting" }
//
// =========================================

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


                                    return Promise.resolve();

                                }

                            )

                        );

                    }

                )

        );


        // =====================================
        // 🔥 TAKE CONTROL OF EXISTING CLIENTS
        // =====================================
        //
        // This is OK.
        //
        // IMPORTANT:
        //
        // The page-side controllerchange handler
        // MUST NOT automatically reload.
        //
        // =====================================

        self.clients.claim();

    }

);


// =========================================
// 🔄 USER-CONTROLLED SKIP WAITING
// =========================================
//
// IMPORTANT:
//
// This is the ONLY normal route by which
// an already-installed waiting worker is
// allowed to activate.
//
// =========================================

self.addEventListener(

    "message",

    function(event){

        if(

            event.data &&

            event.data.action ===
            "skipWaiting"

        ){

            console.log(
                "⚡ GreenGuard Update Confirmed by User"
            );


            self.skipWaiting();

        }

    }

);


// =========================================
// 🌐 FETCH HANDLER
// =========================================

self.addEventListener(

    "fetch",

    function(event){

        const req =
            event.request;


        // =====================================
        // ❌ SKIP GOOGLE APPS SCRIPT API
        // =====================================

        if(

            req.url.includes(
                "script.google.com"
            )

        ){

            return;

        }


        // =====================================
        // ❌ ONLY HANDLE GET REQUESTS
        // =====================================

        if(

            req.method !==
            "GET"

        ){

            return;

        }


        // =====================================
        // 📄 HTML / NAVIGATION
        // =====================================
        //
        // NETWORK FIRST
        //
        // This ensures that after an explicit
        // GreenGuard update/reload, the newest
        // index.html is obtained.
        //
        // Offline → cached index.html.
        //
        // =====================================

        if(

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


                            // ==================================
                            // CACHE FRESH HTML
                            // ==================================

                            if(

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

                                )

                                .catch(

                                    function(error){

                                        console.warn(
                                            "⚠ HTML cache update failed:",
                                            error
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
                                "📦 Offline HTML → cache"
                            );


                            return caches.match(
                                "./index.html"
                            );

                        }

                    )

            );


            return;

        }


        // =========================================
        // 📦 STATIC / OTHER GET REQUESTS
        // =========================================
        //
        // NETWORK FIRST
        //
        // Network succeeds:
        //     return fresh resource
        //     update cache
        //
        // Network fails:
        //     return cached resource
        //
        // =========================================

        event.respondWith(

            fetch(req)

                .then(

                    function(response){

                        // =================================
                        // 🔥 ONLY CACHE VALID RESPONSES
                        // =================================

                        if(

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

                            )

                            .catch(

                                function(error){

                                    console.warn(
                                        "⚠ Resource cache update failed:",
                                        error
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
                            "📦 Cache Fallback:",
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
