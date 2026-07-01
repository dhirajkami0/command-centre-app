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
 GET LOCAL INTENT
=========================================================*/

Controller.getLocalIntent = function (query) {

    const AE =
        window.GreenGuardAI.AnalyticsEngine;

    const intent =
        AE.detectStaffIntent(query);

    const entities =
        AE.extractStaffEntities(query);

    const confidence =
        AE.calculateConfidence
            ? AE.calculateConfidence(
                intent,
                entities,
                query
            )
            : 0.50;

    return {

        source: "local",

        intent,

        entities,

        confidence

    };

};
/*=========================================================
 ASK
=========================================================*/

Controller.ask = async function (query) {

    await Controller.ensureAnalyticsReady();

    const AE =
        window.GreenGuardAI.AnalyticsEngine;

    const Cache =
        window.GreenGuardAI.Cache;

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

    let intent = null;

    if (

        Cache &&
        Cache.getIntent

    ) {

        intent =

            await Cache.getIntent(

                query

            );

    }

    if (intent) {

        console.log(
            "🟢 Intent Cache Hit"
        );

        console.log(intent);

        console.groupEnd();

        /*
            Temporary

            Router still works
            using query.

            We will change
            this later.
        */

        return AE.routeStaffIntent(

            query

        );

    }

    /*------------------------------------------
      Local Intent
    ------------------------------------------*/

    intent =

        Controller.getLocalIntent(

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

        intent.confidence >= 0.90

    ) {

        console.log(

            "🟢 Local Intent Accepted"

        );

        if (

            Cache &&
            Cache.setIntent

        ) {

            await Cache.setIntent(

                query,

                intent

            );

        }

        console.groupEnd();

        return AE.routeStaffIntent(

            query

        );

    }

    /*------------------------------------------
      AI Intent
    ------------------------------------------*/

    console.log(

        "🟡 AI Intent Detection"

    );

    intent =

        await window.callAI({

            action:

                "intent",

            question:

                query

        });

    console.log(

        "AI Intent:",

        intent

    );

    if (

        Cache &&
        Cache.setIntent

    ) {

        await Cache.setIntent(

            query,

            intent

        );

    }

    console.groupEnd();

    return AE.routeStaffIntent(

        query

    );

};
    /*----------------------------------
      AI Intent
    ----------------------------------*/

    console.log(
        "🟡 Calling AI..."
    );

    const ai =

        await window.callAI({

            action: "intent",

            question: query

        });

    window.GreenGuardAI.Cache
        ?.setIntent?.(
            query,
            ai
        );

    console.log(
        "AI Intent:",
        ai
    );

    return window.GreenGuardAI
        .AnalyticsEngine
        .routeStaffIntent(query);

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
