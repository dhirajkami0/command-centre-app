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

    query =
        Controller.normalizeQuery(query);

    /*----------------------------------
      Intent Cache
    ----------------------------------*/

    const cache =
        window.GreenGuardAI.Cache
            ?.getIntent?.(query);

    if (cache) {

        console.log(
            "🟢 Intent Cache Hit"
        );

        return window.GreenGuardAI
            .AnalyticsEngine
            .routeStaffIntent(query);

    }

    /*----------------------------------
      Local Intent
    ----------------------------------*/

    const local =
        Controller.getLocalIntent(query);

    console.log(
        "Local Intent:",
        local
    );

    /*----------------------------------
      High Confidence
    ----------------------------------*/

    if (

        local.confidence >= 0.90

    ) {

        console.log(
            "🟢 Local Intent Accepted"
        );

        window.GreenGuardAI.Cache
            ?.setIntent?.(
                query,
                local
            );

        return window.GreenGuardAI
            .AnalyticsEngine
            .routeStaffIntent(query);

    }

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
