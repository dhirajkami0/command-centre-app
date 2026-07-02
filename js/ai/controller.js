(function (window) {
"use strict";

const GG = window.GreenGuardAI =
    window.GreenGuardAI || {};

const Controller = {};

/*=========================================================
 WAIT FOR FIREBASE
=========================================================*/

Controller.waitForFirebase = async function () {

    const timeout = 15000;

    const started = Date.now();

    while (true) {

        if (

            window.fb &&
            window.db &&
            typeof window.fb.getDocs === "function"

        ) {

            return true;

        }

        if (

            Date.now() - started >

            timeout

        ) {

            throw new Error(

                "Firebase initialization timeout."

            );

        }

        await new Promise(

            resolve => setTimeout(resolve, 100)

        );

    }

};

/*=========================================================
 ENSURE ANALYTICS READY
=========================================================*/

Controller.ensureAnalyticsReady = async function () {

    const AE =
        GG.AnalyticsEngine;

    if (!AE) {

        throw new Error(

            "AnalyticsEngine not loaded."

        );

    }

    if (AE.loaded) {

        return true;

    }

    if (AE.loading) {

        while (AE.loading) {

            await new Promise(

                resolve => setTimeout(resolve, 100)

            );

        }

        return AE.loaded;

    }

    /*------------------------------------------
      Wait until Firebase is ready
    ------------------------------------------*/

    await Controller.waitForFirebase();

    if (GG.Config.ANALYTICS.AUTO_LOAD) {
        await AE.load();
    }

    return AE.loaded;

};
/*=========================================================
 NORMALIZE QUERY
=========================================================*/

Controller.normalizeQuery = function (query) {

    return GG
        .AnalyticsEngine
        .normalizeQuery(query);

};


/*=========================================================
 BUILD INTENT
=========================================================*/

Controller.buildIntent = function (query) {

    const intent =

        GG
            .AnalyticsEngine
            .buildIntent(

                query

            );

    intent.domain =

        intent.domain ||

        GG
            .Config
            .ROUTER
            .DEFAULT_DOMAIN;

    return intent;

};

/*=========================================================
 GET CACHED INTENT
=========================================================*/

Controller.getCachedIntent = async function (

    query

) {

    const Cache =
        GG.Cache;

    if (

        !Cache ||

        typeof Cache.getIntent !== "function"

    ) {

        return null;

    }

    return await Cache.getIntent(

        query

    );

};

/*=========================================================
 SET CACHED INTENT
=========================================================*/

Controller.setCachedIntent = async function (

    query,

    intent

) {

    const Cache =
        GG.Cache;

    if (

        !Cache ||

        typeof Cache.setIntent !== "function"

    ) {

        return;

    }

    await Cache.setIntent(

        query,

        intent

    );

};

/*=========================================================
 ROUTE INTENT
=========================================================*/

Controller.routeIntent = function (

    intent

) {

    return GG
        .AnalyticsEngine
        .routeIntent(

            intent

        );

};

/*=========================================================
 ASK
=========================================================*/

Controller.ask = async function (query) {

    const AI =
        GG.AI;

    await Controller.ensureAnalyticsReady();

    const Config =
        GG.Config;

    /*------------------------------------------
      Normalize Query
    ------------------------------------------*/

    query =
        Controller.normalizeQuery(query);

    console.group(
        "🧠 GreenGuard AI"
    );

    try {

        console.log(
            "Query:",
            query
        );

        /*------------------------------------------
          Intent Cache
        ------------------------------------------*/

        let intent =

            await Controller.getCachedIntent(

                query

            );

        if (intent) {

            console.log(
                "🟢 Intent Cache Hit"
            );

            console.log(intent);

            return Controller.routeIntent(

                intent

            );

        }

        /*------------------------------------------
          Local Intent
        ------------------------------------------*/

        intent =

            Controller.buildIntent(

                query

            );

        console.log(

            "Local Intent:",

            intent

        );

        /*------------------------------------------
          High Confidence
        ------------------------------------------*/

        if (

            intent.confidence >=

            Config
                .INTENT
                .HIGH_CONFIDENCE

        ) {

            console.log(

                "🟢 Local Intent Accepted"

            );

            await Controller.setCachedIntent(

                query,

                intent

            );

            return Controller.routeIntent(

                intent

            );

        }

        /*------------------------------------------
          AI Intent
        ------------------------------------------*/

        console.log(

            "🟡 AI Intent Detection"

        );

        if (

            !AI ||

            typeof AI.detectIntent !== "function"

        ) {

            console.warn(

                "AI Provider unavailable."

            );

            intent =

                Controller.buildIntent(

                    query

                );

        }
        else {

intent = await AI.detectIntent(query);

if (

    !intent ||

    intent.success === false ||

    intent.confidence <

    Config.INTENT.MIN_AI_CONFIDENCE

) {

    console.warn(

        "Low AI confidence. Falling back to local intent."

    );

    intent =

        Controller.buildIntent(

            query

        );

}

        }

        /*------------------------------------------
          Normalize AI Response
        ------------------------------------------*/

        intent.source =
            intent.source || "ai";

        intent.domain =
            intent.domain ||
            Config.ROUTER.DEFAULT_DOMAIN;

        console.log(

            "AI Intent:",

            intent

        );

        /*------------------------------------------
          Cache Intent
        ------------------------------------------*/

        if (

            intent.success !== false

        ) {

            await Controller.setCachedIntent(

                query,

                intent

            );

        }

        return Controller.routeIntent(

            intent

        );

    }
    catch (err) {

        console.error(

            err

        );

        return {

            success: false,

            source: "controller",

            domain: "system",

            intent: "error",

            confidence: 0,

            entities: {},

            data: {

                success: false,

                message: err.message

            }

        };

    }
    finally {

        console.groupEnd();

    }

};

/*=========================================================
 REGISTER
=========================================================*/

GG.Controller =
    Controller;

console.log(

    "%cGreenGuard AI Controller Loaded",

    "color:#008000;font-weight:bold;"

);

})(window);
