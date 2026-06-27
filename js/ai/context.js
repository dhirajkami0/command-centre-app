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

Context.getUser = function () {

    return object(

        read("currentUser", {})

    );

};



/*----------------------------------------------------------
  DUTY
----------------------------------------------------------*/

Context.getDuty = function () {

    return object(

        read("currentDuty", {})

    );

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

    return {

        lat: number(

            read("currentLatitude", 0)

        ),

        lng: number(

            read("currentLongitude", 0)

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

Context.snapshot = function () {

    lastContext = {

        user:

            Context.getUser(),

        duty:

            Context.getDuty(),

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

    return clone(

        lastContext

    );

};
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
