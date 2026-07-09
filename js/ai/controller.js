(function (window) {
"use strict";

/*=========================================================
 NAMESPACE
=========================================================*/

const GG =
    window.GreenGuardAI =
    window.GreenGuardAI || {};

/*=========================================================
 PREVENT DOUBLE LOADING
=========================================================*/

if (
    GG.Controller
) {
    console.warn(
        "[GreenGuardAI] Controller already loaded."
    );
    return;
}

/*=========================================================
 MODULE
=========================================================*/

const Controller = {};

/*=========================================================
 VERSION
=========================================================*/

Controller.VERSION =
    "2.0.0";

/*=========================================================
 STATUS
=========================================================*/

Controller.initialized =
    false;

/*=========================================================
 INITIALIZE
=========================================================*/

Controller.init = function () {
    if (
        Controller.initialized
    ) {
        return true;
    }
    Controller.initialized =
        true;
    console.log(
        "%cGreenGuard Controller Ready",
        "color:#008000;font-weight:bold;"
    );
    return true;
};

/*=========================================================
 WAIT FOR FIREBASE
=========================================================*/

Controller.waitForFirebase = async function () {
    Controller.init();
    const timeout =
        15000;
    const started =
        Date.now();
    while (true) {
        if (
            window.fb &&
            window.db &&
            typeof window.fb.getDocs ===
            "function"
        ) {
            return true;
        }
        if (
            Date.now() -
            started >
            timeout
        ) {
            throw new Error(
                "Firebase initialization timeout."
            );
        }
        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    100
                )
        );
    }
};

/*=========================================================
 ENSURE ANALYTICS READY
=========================================================*/

Controller.ensureAnalyticsReady =
async function () {
    Controller.init();
    const Analytics =
        GG.AnalyticsEngine;
    if (
        !Analytics
    ) {
        throw new Error(
            "AnalyticsEngine not loaded."
        );
    }
    /*----------------------------------
      Already Ready
    ----------------------------------*/
    if (
        Analytics.loaded
    ) {
        return true;
    }
    /*----------------------------------
      Already Loading
    ----------------------------------*/
    if (
        Analytics.loading
    ) {
        while (
            Analytics.loading
        ) {
            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        100
                    )
            );
        }
        return Analytics.loaded;
    }
    /*----------------------------------
      Wait Firebase
    ----------------------------------*/
    await Controller.waitForFirebase();
    /*----------------------------------
      Auto Load
    ----------------------------------*/
    if (
        GG.Config
            .ANALYTICS
            .AUTO_LOAD
    ) {
        await Analytics.load();
    }
    return Analytics.loaded;
};

/*=========================================================
 ASK
=========================================================*/

IntentManager.detect = async function (

    query

) {

    IntentManager.init();

    const started =

        Date.now();

    console.group(

        "🔵 INTENT MANAGER"

    );

    console.log(

        "File:",

        "intentManager.js"

    );

    console.log(

        "Function:",

        "IntentManager.detect"

    );

    console.log(

        "Incoming Query:",

        query

    );

    /*----------------------------------
      Normalize Query
    ----------------------------------*/

    query =

        IntentManager.normalize(

            query

        );

    console.log(

        "Normalized:",

        query

    );

    /*----------------------------------
      Intent Cache
    ----------------------------------*/

    let intent =

        await IntentManager.getCachedIntent(

            query

        );

    if (

        intent

    ) {

        console.log(

            "⚡ CACHE HIT"

        );

        console.log(

            intent

        );

        console.log(

            "⏱",

            Date.now() -

            started,

            "ms"

        );

        console.groupEnd();

        return intent;

    }

    console.log(

        "⚪ CACHE MISS"

    );

    /*----------------------------------
      Local Detection
    ----------------------------------*/

    intent =

        IntentManager.detectLocal(

            query

        );

    console.log(

        "🟢 Local Result:",

        intent

    );

    /*----------------------------------
      Stay Local?
    ----------------------------------*/

    const useAI =

        IntentManager.shouldUseAI(

            intent

        );

    console.log(

        "Requires AI:",

        useAI

    );

    if (

        !useAI

    ) {

        await IntentManager.setCachedIntent(

            query,

            intent

        );

        console.log(

            "✅ Returning Local Intent"

        );

        console.log(

            "⏱",

            Date.now() -

            started,

            "ms"

        );

        console.groupEnd();

        return intent;

    }

    /*----------------------------------
      AI Detection
    ----------------------------------*/

    console.log(

        "🤖 Calling AI Provider"

    );

    const AI =

        GG.AI;

    if (

        !AI ||

        typeof AI.detectIntent !==

        "function"

    ) {

        console.warn(

            "AI Provider unavailable."

        );

        await IntentManager.setCachedIntent(

            query,

            intent

        );

        console.groupEnd();

        return intent;

    }

    try {

        const aiIntent =

            await AI.detectIntent(

                query

            );

        console.log(

            "🤖 AI Result:",

            aiIntent

        );

        if (

            aiIntent &&

            aiIntent.success !== false

        ) {

            intent =

                IntentManager.mergeIntent(

                    intent,

                    aiIntent

                );

            console.log(

                "Merged Intent:",

                intent

            );

        }

    }

    catch (

        err

    ) {

        console.error(

            "AI Detect Error:",

            err

        );

    }

    /*----------------------------------
      Cache Final
    ----------------------------------*/

    await IntentManager.setCachedIntent(

        query,

        intent

    );

    console.log(

        "🏁 Final Intent:",

        intent

    );

    console.log(

        "⏱",

        Date.now() -

        started,

        "ms"

    );

    console.groupEnd();

    return intent;

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
