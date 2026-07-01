/*!
 * GreenGuard AI
 * cache.js
 * Version : 1.0.0
 * Production Safe
 *
 * Depends:
 *   GreenGuardAI.Config
 */

(function (window) {

    "use strict";

    /*----------------------------------------------------------
      Namespace
    ----------------------------------------------------------*/

    window.GreenGuardAI = window.GreenGuardAI || {};

    if (window.GreenGuardAI.Cache) {

        console.warn(
            "[GreenGuardAI] Cache already loaded."
        );

        return;

    }

    if (!window.GreenGuardAI.Config) {

        console.error(
            "[GreenGuardAI] Config must load before Cache."
        );

        return;

    }

    const Config = window.GreenGuardAI.Config;

    const Cache = {};

    /*----------------------------------------------------------
      Private Variables
    ----------------------------------------------------------*/

    let db = null;

    let ready = false;

    let cleanupTimer = null;

    const memory = new Map();

    const stats = {

        hits: 0,

        misses: 0,

        writes: 0,

        deletes: 0

    };

    /*----------------------------------------------------------
      Init
    ----------------------------------------------------------*/

  Cache.init = async function () {

    if (ready)
        return true;

    try {

        await openDatabase();

        startCleanup();

        ready = true;

        Config.log(
            "Cache",
            "Initialized"
        );

        return true;

    }
    catch (err) {

        Config.error(
            "Cache.init",
            err
        );

        return false;

    }

};

    /*----------------------------------------------------------
      Open IndexedDB
    ----------------------------------------------------------*/

    function openDatabase() {

        return new Promise((resolve, reject) => {

            if (!window.indexedDB) {

                console.warn(
                    "[AI] IndexedDB unavailable"
                );

                resolve();

                return;

            }

            const request = indexedDB.open(

                Config.CACHE.DATABASE,

                Config.CACHE.VERSION

            );

            request.onerror = function () {

                reject(request.error);

            };

            request.onsuccess = function () {

                db = request.result;

                resolve();

            };

            request.onupgradeneeded = function (event) {

                db = event.target.result;

                if (

                    !db.objectStoreNames.contains(

                        Config.CACHE.STORE

                    )

                ) {

                    const store =

                        db.createObjectStore(

                            Config.CACHE.STORE,

                            {

                                keyPath: "key"

                            }

                        );

                    store.createIndex(

                        "expires",

                        "expires"

                    );

                }

            };

        });

    }

    /*----------------------------------------------------------
      Helpers
    ----------------------------------------------------------*/

    function now() {

        return Date.now();

    }

    function expired(item) {

        return (

            item &&

            item.expires &&

            item.expires < now()

        );

    }

    function memoryLimit() {

        return Config.CACHE.MAX_MEMORY_ITEMS;

    }

    /*----------------------------------------------------------
      Memory LRU
    ----------------------------------------------------------*/

    function remember(key, value) {

        if (memory.has(key))

            memory.delete(key);

        memory.set(key, value);

        while (

            memory.size >

            memoryLimit()

        ) {

            const oldest =

                memory.keys()

                    .next()

                    .value;

            memory.delete(oldest);

        }

    }

    function forget(key) {

        memory.delete(key);

    }

    /*----------------------------------------------------------
      Cleanup Timer
    ----------------------------------------------------------*/

    function startCleanup() {

        if (cleanupTimer)

            clearInterval(cleanupTimer);

        cleanupTimer = setInterval(

            Cache.cleanup,

            5 * 60 * 1000

        );

    }

    /*----------------------------------------------------------
      Stats
    ----------------------------------------------------------*/

    Cache.stats = function () {

        return {

            ...stats,

            memoryItems:

                memory.size,

            ready

        };

    };
    /*----------------------------------------------------------
      GET
    ----------------------------------------------------------*/

    Cache.get = async function (key) {

        try {

            if (!ready)
                await Cache.init();

            /* Memory */

            if (memory.has(key)) {

                const item = memory.get(key);

                if (!expired(item)) {

                    stats.hits++;

                    remember(key, item);

                    return Config.clone(item.value);

                }

                forget(key);

            }

            /* IndexedDB */

            if (!db) {

                stats.misses++;

                return null;

            }

            return await new Promise((resolve) => {

                const tx = db.transaction(

                    Config.CACHE.STORE,

                    "readonly"

                );

                const store = tx.objectStore(

                    Config.CACHE.STORE

                );

                const req = store.get(key);

                req.onsuccess = function () {

                    const item = req.result;

                    if (!item) {

                        stats.misses++;

                        resolve(null);

                        return;

                    }

                    if (expired(item)) {

                        Cache.remove(key);

                        stats.misses++;

                        resolve(null);

                        return;

                    }

                    remember(key, item);

                    stats.hits++;

                    resolve(

                        Config.clone(item.value)

                    );

                };

                req.onerror = function () {

                    Config.error(

                        "Cache",

                        req.error

                    );

                    resolve(null);

                };

            });

        }

        catch (err) {

            Config.error(

                "Cache.get",

                err

            );

            return null;

        }

    };



    /*----------------------------------------------------------
      SET
    ----------------------------------------------------------*/

    Cache.set = async function (

        key,

        value,

        ttl = Config.CACHE.TTL

    ) {

        try {

            if (!ready)
                await Cache.init();

            const item = {

                key,

                value,

                created: now(),

                updated: now(),

                expires: now() + ttl

            };

            remember(

                key,

                item

            );

            stats.writes++;

            if (!db)
                return true;

            return await new Promise((resolve) => {

                const tx = db.transaction(

                    Config.CACHE.STORE,

                    "readwrite"

                );

                const store = tx.objectStore(

                    Config.CACHE.STORE

                );

                const req = store.put(item);

                req.onsuccess = function () {

                    resolve(true);

                };

                req.onerror = function () {

                    Config.error(

                        "Cache.set",

                        req.error

                    );

                    resolve(false);

                };

            });

        }

        catch (err) {

            Config.error(

                "Cache.set",

                err

            );

            return false;

        }

    };



    /*----------------------------------------------------------
      REMOVE
    ----------------------------------------------------------*/

    Cache.remove = async function (

        key

    ) {

        try {

            forget(key);

            stats.deletes++;

            if (!db)
                return true;

            return await new Promise((resolve) => {

                const tx = db.transaction(

                    Config.CACHE.STORE,

                    "readwrite"

                );

                const store = tx.objectStore(

                    Config.CACHE.STORE

                );

                const req = store.delete(key);

                req.onsuccess = function () {

                    resolve(true);

                };

                req.onerror = function () {

                    resolve(false);

                };

            });

        }

        catch (err) {

            Config.error(

                "Cache.remove",

                err

            );

            return false;

        }

    };



    /*----------------------------------------------------------
      CLEAR
    ----------------------------------------------------------*/

    Cache.clear = async function () {

        try {

            memory.clear();

            if (!db)
                return true;

            return await new Promise((resolve) => {

                const tx = db.transaction(

                    Config.CACHE.STORE,

                    "readwrite"

                );

                const store = tx.objectStore(

                    Config.CACHE.STORE

                );

                const req = store.clear();

                req.onsuccess = function () {

                    resolve(true);

                };

                req.onerror = function () {

                    resolve(false);

                };

            });

        }

        catch (err) {

            Config.error(

                "Cache.clear",

                err

            );

            return false;

        }

    };

      /*----------------------------------------------------------
      HAS
    ----------------------------------------------------------*/

    Cache.has = async function (key) {

        const value = await Cache.get(key);

        return value !== null;

    };



    /*----------------------------------------------------------
      KEYS
    ----------------------------------------------------------*/

    Cache.keys = function () {

        return Array.from(memory.keys());

    };



    /*----------------------------------------------------------
      SIZE
    ----------------------------------------------------------*/

    Cache.size = function () {

        return memory.size;

    };



    /*----------------------------------------------------------
      CLEANUP
    ----------------------------------------------------------*/

    Cache.cleanup = async function () {

        try {

            if (!db)
                return;

            const tx = db.transaction(

                Config.CACHE.STORE,

                "readwrite"

            );

            const store = tx.objectStore(

                Config.CACHE.STORE

            );

            const request = store.openCursor();

            request.onsuccess = function (event) {

                const cursor = event.target.result;

                if (!cursor)
                    return;

                const item = cursor.value;

                if (expired(item)) {

                  forget(item.key);

stats.deletes++;

cursor.delete();
                }

                cursor.continue();

            };

            request.onerror = function () {

                Config.warn(

                    "Cache",

                    "Cleanup failed."

                );

            };

        }

        catch (err) {

            Config.error(

                "Cache.cleanup",

                err

            );

        }

    };



    /*----------------------------------------------------------
      CLOSE DATABASE
    ----------------------------------------------------------*/

    Cache.close = function () {

        try {

            if (cleanupTimer) {

                clearInterval(

                    cleanupTimer

                );

                cleanupTimer = null;

            }

            if (db) {

                db.close();

                db = null;

            }

            ready = false;

        }

        catch (err) {

            Config.error(

                "Cache.close",

                err

            );

        }

    };



    /*----------------------------------------------------------
      DESTROY CACHE
    ----------------------------------------------------------*/

    Cache.destroy = async function () {

        try {

            Cache.close();

            memory.clear();
ready = false;
            return await new Promise(

                (resolve) => {

                 if (!window.indexedDB) {

    resolve(false);

    return;

}

const req = window.indexedDB.deleteDatabase(
    Config.CACHE.DATABASE
);

                    req.onsuccess =

                        () => resolve(true);

                    req.onerror =

                        () => resolve(false);

                    req.onblocked =

                        () => resolve(false);

                }

            );

        }

        catch (err) {

            Config.error(

                "Cache.destroy",

                err

            );

            return false;

        }

    };



    /*----------------------------------------------------------
      MEMORY ONLY CACHE
    ----------------------------------------------------------*/

    Cache.remember = function (

        key,

        value

    ) {

        remember(

            key,

            {

                key,

                value,

                expires:

                    now() +

                    Config.CACHE.TTL

            }

        );

    };



    /*----------------------------------------------------------
      MEMORY REMOVE
    ----------------------------------------------------------*/

    Cache.forget = function (

        key

    ) {

        forget(key);

    };

Cache.touch = async function(key){

    const value = await Cache.get(key);

    if(value===null)
        return false;

    await Cache.set(
        key,
        value
    );

    return true;

};
/*=========================================================
 INTENT CACHE API
=========================================================*/

/*----------------------------------------------------------
 NORMALIZE INTENT KEY
----------------------------------------------------------*/

Cache.normalizeIntentKey = function (query) {

    return "GG_INTENT_" +

        String(query || "")

            .trim()

            .toUpperCase()

            .replace(/\s+/g, "_")

            .replace(/[^\w]/g, "");

};

/*----------------------------------------------------------
 GET INTENT
----------------------------------------------------------*/

Cache.getIntent = async function (query) {

    const key =

        Cache.normalizeIntentKey(

            query

        );

    return await Cache.get(

        key

    );

};

/*----------------------------------------------------------
 SET INTENT
----------------------------------------------------------*/

Cache.setIntent = async function (

    query,

    intent,

    ttl = Config.CACHE.TTL

) {

    const key =

        Cache.normalizeIntentKey(

            query

        );

    return await Cache.set(

        key,

        intent,

        ttl

    );

};

/*----------------------------------------------------------
 REMOVE INTENT
----------------------------------------------------------*/

Cache.removeIntent = async function (

    query

) {

    const key =

        Cache.normalizeIntentKey(

            query

        );

    return await Cache.remove(

        key

    );

};

/*----------------------------------------------------------
 CLEAR INTENT CACHE
----------------------------------------------------------*/

Cache.clearIntentCache = async function () {

    const keys =

        Cache.keys()

            .filter(

                k =>

                k.startsWith(

                    "GG_INTENT_"

                )

            );

    for (

        const key of keys

    ) {

        await Cache.remove(

            key

        );

    }

    return true;

};

/*----------------------------------------------------------
 INTENT CACHE STATS
----------------------------------------------------------*/

Cache.getIntentStats = function () {

    const keys =

        Cache.keys()

            .filter(

                k =>

                k.startsWith(

                    "GG_INTENT_"

                )

            );

    return {

        total:

            keys.length,

        keys

    };

};
    /*----------------------------------------------------------
      READY
    ----------------------------------------------------------*/

    Cache.isReady = function () {

        return ready;

    };



    /*----------------------------------------------------------
      EXPORT STATS
    ----------------------------------------------------------*/

    Cache.info = function () {

        return {

            database:

                Config.CACHE.DATABASE,

            version:

                Config.CACHE.VERSION,

            store:

                Config.CACHE.STORE,

            ready,

            memoryItems:

                memory.size,

            ...stats

        };

    };



    /*----------------------------------------------------------
      AUTO INITIALIZE
    ----------------------------------------------------------*/

    Cache.init()

        .then(() => {

            Config.log(

                "Cache",

                "Ready"

            );

        })

        .catch((err) => {

            Config.error(

                "Cache",

                err

            );

        });
    /*----------------------------------------------------------
      Register
    ----------------------------------------------------------*/

    window.GreenGuardAI.Cache = Cache;

    console.log(

        "%cGreenGuard AI Cache Loaded",

        "color:#0077cc;font-weight:bold;"

    );

})(window);
