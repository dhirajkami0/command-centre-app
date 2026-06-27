/*!
 * GreenGuard AI
 * context.js
 * Version : 1.0.0
 * Production Safe
 *
 * Depends:
 *   GreenGuardAI.Config
 *   GreenGuardAI.Cache
 */

(function (window) {

    "use strict";

    /*----------------------------------------------------------
      Namespace
    ----------------------------------------------------------*/

    window.GreenGuardAI =
        window.GreenGuardAI || {};

    if (window.GreenGuardAI.Context) {

        console.warn(
            "[GreenGuardAI] Context already loaded."
        );

        return;

    }

    if (!window.GreenGuardAI.Config) {

        console.error(
            "[GreenGuardAI] Config module missing."
        );

        return;

    }

    if (!window.GreenGuardAI.Cache) {

        console.error(
            "[GreenGuardAI] Cache module missing."
        );

        return;

    }

    const Config =
        window.GreenGuardAI.Config;

    const Cache =
        window.GreenGuardAI.Cache;

    const Context = {};

    /*----------------------------------------------------------
      Private State
    ----------------------------------------------------------*/

    let ready = false;

    let lastContext = {};

    let lastUpdated = 0;

    /*----------------------------------------------------------
      Init
    ----------------------------------------------------------*/

    Context.init = async function () {

        if (ready)
            return true;

        try {

          await Cache.init();

ready = true;

Config.log(
    "Context",
    "Initialized"
);

            return true;

        }

        catch (err) {

            Config.error(
                "Context.init",
                err
            );

            return false;

        }

    };

    /*----------------------------------------------------------
      Safe Window Read
    ----------------------------------------------------------*/

    function read(path, fallback = null) {

        try {

            const parts = path.split(".");

            let obj = window;

            for (const part of parts) {

                if (

                    obj === undefined ||

                    obj === null

                ) {

                    return fallback;

                }

                obj = obj[part];

            }

            return obj ?? fallback;

        }

        catch {

            return fallback;

        }

    }

    /*----------------------------------------------------------
      Exists
    ----------------------------------------------------------*/

    function exists(value) {

        return (

            value !== undefined &&

            value !== null

        );

    }

    /*----------------------------------------------------------
      Clone
    ----------------------------------------------------------*/

    function clone(value) {

        return Config.clone(value);

    }

    /*----------------------------------------------------------
      Safe Array
    ----------------------------------------------------------*/

    function array(value) {

        return Array.isArray(value)

            ? value

            : [];

    }

    /*----------------------------------------------------------
      Safe Object
    ----------------------------------------------------------*/

    function object(value) {

        return (

            value &&

            typeof value === "object"

        )

            ? value

            : {};

    }

    /*----------------------------------------------------------
      Safe Number
    ----------------------------------------------------------*/

    function number(value) {

        const n = Number(value);

        return Number.isFinite(n)

            ? n

            : 0;

    }

    /*----------------------------------------------------------
      Safe String
    ----------------------------------------------------------*/

    function string(value) {

        if (

            value === undefined ||

            value === null

        )

            return "";

        return String(value);

    }

    /*----------------------------------------------------------
      Empty
    ----------------------------------------------------------*/

    function empty(value) {

        if (!exists(value))
            return true;

        if (

            Array.isArray(value)

        )

            return value.length === 0;

        if (

            typeof value === "object"

        )

            return (

                Object.keys(value)

                    .length === 0

            );

        return false;

    }

    /*----------------------------------------------------------
      Timestamp
    ----------------------------------------------------------*/

    function timestamp() {

        return Date.now();

    }

    /*----------------------------------------------------------
      Cache Helpers
    ----------------------------------------------------------*/

    async function cacheGet(key) {

        return await Cache.get(key);

    }

    async function cacheSet(

        key,

        value,

        ttl

    ) {

        return await Cache.set(

            key,

            value,

            ttl

        );

    }

    /*----------------------------------------------------------
      Reset
    ----------------------------------------------------------*/

    Context.reset = function () {

        lastContext = {};

        lastUpdated = 0;

    };

    /*----------------------------------------------------------
      Status
    ----------------------------------------------------------*/

    Context.isReady = function () {

        return ready;

    };

    /*----------------------------------------------------------
      Last Context
    ----------------------------------------------------------*/

    Context.last = function () {

        return clone(

            lastContext

        );

    };


  /*----------------------------------------------------------
  USER
----------------------------------------------------------*/
/*----------------------------------------------------------
  USER PROFILE
----------------------------------------------------------*/

Context.getProfile = function () {

    return clone(

        object(

            read("userProfile", {})

        )

    );

};



/*----------------------------------------------------------
  DUTY
----------------------------------------------------------*/

Context.getDuty = function () {

    const sessions = object(

        read(
            "activeSessionMap",
            {}
        )

    );

    return {

        active:

            !!read(
                "isDutyActive",
                false
            ),

        sessions:

            clone(sessions),

        sessionCount:

            Object.keys(sessions).length

    };

};


/*----------------------------------------------------------
  ACTIVE POPUP
----------------------------------------------------------*/

Context.getSelection = function () {

    return object(

        read("activePopupContext", {})

    );

};





/*----------------------------------------------------------
  CURRENT LOCATION
----------------------------------------------------------*/

Context.getLocation = function () {

    const gps = object(

        read("latestGps", {})

    );

    return {

        lat: number(gps.lat),

        lng: number(gps.lng),

        accuracy: number(gps.accuracy),

        speed: number(gps.speed),

        heading: number(gps.heading),

        timestamp: gps.timestamp || null

    };

};
/*----------------------------------------------------------
  LIVE STAFF
----------------------------------------------------------*/

Context.getLiveStaff = function () {

    const markers = object(

        read("staffMarkers", {})

    );

    return {

        count: Object.keys(markers).length,

        names: Object.keys(markers)

    };

};
/*----------------------------------------------------------
  PATROL
----------------------------------------------------------*/

Context.getPatrol = function () {

    const tracks = object(

        read(
            "staffTracks",
            {}
        )

    );

    const sessions = object(

        read(
            "activeSessionMap",
            {}
        )

    );

    return {

        tracks:

            Object.keys(tracks).length,

        sessions:

            Object.keys(sessions).length,

        latestGps:

            clone(

                object(

                    read(
                        "latestGps",
                        {}
                    )

                )

            )

    };

};

    /*----------------------------------------------------------
  GIS
----------------------------------------------------------*/

Context.getGIS = function () {

    const features =

        array(

            read(

                "allGISFeatures",

                []

            )

        );

    const compartments =

        array(

            read(

                "allCompartmentFeatures",

                []

            )

        );

    return {

        featureCount:

            features.length,

        compartmentCount:

            compartments.length,

        gridReady:

            !!read(

                "__gridReady",

                false

            )

    };


    
};

    /*----------------------------------------------------------
  ANALYTICS
----------------------------------------------------------*/

Context.getAnalytics = function () {

    return {

        realtime:

            clone(

                object(

                    read(

                        "realtimeAnalyticsState",

                        {}

                    )

                )

            ),

        monthly:

            clone(

                object(

                    read(

                        "monthlyStatusCache",

                        {}

                    )

                )

            )

    };

};
/*----------------------------------------------------------
  DEVICE
----------------------------------------------------------*/

Context.getDevice = function () {

    return {

        online:

            navigator.onLine,

        language:

            navigator.language,

        platform:

            navigator.platform,

        userAgent:

            navigator.userAgent

    };

};



/*----------------------------------------------------------
  SNAPSHOT
----------------------------------------------------------*/

Context.snapshot = async function () {

  lastContext = {

   profile:

    Context.getProfile(),

    duty:

        Context.getDuty(),

    liveStaff:

        Context.getLiveStaff(),

    patrol:

        Context.getPatrol(),

    gis:

        Context.getGIS(),

    analytics:

        Context.getAnalytics(),

    selection:

        Context.getSelection(),

    location:

        Context.getLocation(),

    device:

        Context.getDevice(),

    updated:

        timestamp()

};
  lastUpdated =
    lastContext.updated;

await cacheSet(
    "context_snapshot",
    lastContext,
    10000
);

return clone(
    lastContext
);
};
    Context.updated = function () {

    return lastUpdated;

};
/*----------------------------------------------------------
  REFRESH
----------------------------------------------------------*/

Context.refresh = async function () {

    Context.reset();

    return await Context.snapshot();

};
    /*----------------------------------------------------------
  AUTO INITIALIZE
----------------------------------------------------------*/

Context.init()

    .then(() => {

        Config.log(

            "Context",

            "Ready"

        );

    })

    .catch((err) => {

        Config.error(

            "Context",

            err

        );

    });
    /*----------------------------------------------------------
      Register
    ----------------------------------------------------------*/

    window.GreenGuardAI.Context =
        Context;

    console.log(

        "%cGreenGuard AI Context Loaded",

        "color:#008800;font-weight:bold;"

    );

})(window);
