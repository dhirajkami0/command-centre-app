(function (window) {

"use strict";

window.GreenGuardAI =
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
        window.GreenGuardAI.AnalyticsEngine;

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

    await AE.load();

    return AE.loaded;

};
/*=========================================================
 NORMALIZE QUERY
=========================================================*/

Controller.normalizeQuery = function (query) {

    return window.GreenGuardAI
        .AnalyticsEngine
        .normalizeQuery(query);

};


/*=========================================================
 BUILD INTENT
=========================================================*/

Controller.buildIntent = function (query) {

    const intent =

        window.GreenGuardAI
            .AnalyticsEngine
            .buildStaffIntent(

                query

            );

    intent.domain =

        intent.domain ||

        window.GreenGuardAI
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
        window.GreenGuardAI.Cache;

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
        window.GreenGuardAI.Cache;

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
 ASK
=========================================================*/

Controller.ask = async function (query) {

    await Controller.ensureAnalyticsReady();

    const AE =
        window.GreenGuardAI.AnalyticsEngine;

    const Config =
        window.GreenGuardAI.Config;

    /*------------------------------------------
      Normalize Query
    ------------------------------------------*/

    query =
        Controller.normalizeQuery(query);

    console.group(
        "🧠 GreenGuard AI"
    );

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

        console.groupEnd();

        return AE.routeStaffIntent(

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

        console.groupEnd();

        return AE.routeStaffIntent(

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

        !window.GreenGuardAI.AI ||

        typeof window.GreenGuardAI.AI.detectIntent !== "function"

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

        intent =

            await window.GreenGuardAI
                .AI
                .detectIntent(

                    query

                );

    }

    /*------------------------------------------
      Validate AI Response
    ------------------------------------------*/

    if (

        !intent ||

        typeof intent !== "object" ||

        !intent.intent ||

        intent.confidence <

            Config
                .INTENT
                .MIN_AI_CONFIDENCE

    ) {

        intent =

            Controller.buildIntent(

                query

            );

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

    console.groupEnd();

    return AE.routeStaffIntent(

        intent

    );

};

/*=========================================================
 REGISTER
=========================================================*/

window.GreenGuardAI.Controller =
    Controller;

console.log(

    "%cGreenGuard AI Controller Loaded",

    "color:#008000;font-weight:bold;"

);

})(window);
