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

Controller.ask = async function (
    request
) {

    Controller.init();

    const started =
        Date.now();

    console.group(
        "🧠 CONTROLLER PIPELINE"
    );

    console.log(
        "File:",
        "controller.js"
    );

    console.log(
        "Function:",
        "Controller.ask()"
    );

    console.log(
        "Incoming Request:",
        request
    );

    try {

        /*----------------------------------
          Validate Request
        ----------------------------------*/

        if (

            !request ||

            typeof request !==
            "object"

        ) {

            throw new Error(
                "Invalid request."
            );

        }

        if (

            !request.query

        ) {

            throw new Error(
                "Request query missing."
            );

        }

        console.log(
            "✅ Request Valid"
        );

        /*----------------------------------
          Ensure Analytics
        ----------------------------------*/

        console.group(
            "📊 Analytics"
        );

        console.log(
            "Controller.ensureAnalyticsReady()"
        );

        await Controller.ensureAnalyticsReady();

        console.log(
            "✅ Analytics Ready"
        );

        console.groupEnd();

        /*----------------------------------
          Detect Intent
        ----------------------------------*/

        console.group(
            "🎯 Intent Detection"
        );

        const IntentManager =
            GG.IntentManager;

        console.log(
            "Module:",
            IntentManager
        );

        if (

            !IntentManager ||

            typeof IntentManager.detect !==
            "function"

        ) {

            throw new Error(
                "IntentManager unavailable."
            );

        }

        console.log(
            "Calling:",
            "IntentManager.detect()"
        );

        const intent =
            await IntentManager.detect(
                request.query
            );

        console.log(
            "Intent Returned:"
        );

        console.log(
            intent
        );

        console.log(
            "Intent:",
            intent.intent
        );

        console.log(
            "Domain:",
            intent.domain
        );

        console.log(
            "Confidence:",
            intent.confidence
        );

        console.groupEnd();

        if (

            GG.Config?.DEBUG?.ENABLED

        ) {

            console.log(
                "Unified Intent:",
                intent
            );

        }

        /*----------------------------------
          Save Unified Intent
        ----------------------------------*/

        request.detectedIntent =
            intent;
        request.intent =
            intent.intent;
        request.domain =
            intent.domain;
        request.entities =
            intent.entities || {};
        request.confidence =
            intent.confidence || 0;

        console.group(
            "📝 Request Updated"
        );
        console.log(
            "request.intent:",
            request.intent
        );
        console.log(
            "request.domain:",
            request.domain
        );
        console.log(
            "request.confidence:",
            request.confidence
        );
        console.log(
            "request.entities:",
            request.entities
        );
        console.groupEnd();

        /*----------------------------------
          Dispatcher
        ----------------------------------*/

        console.group(
            "🚀 Dispatcher"
        );

        const Dispatcher =
            GG.AIDispatcher;

        console.log(
            "Module:",
            Dispatcher
        );

        if (

            !Dispatcher ||

            typeof Dispatcher.dispatch !==
            "function"

        ) {

            throw new Error(
                "Dispatcher unavailable."
            );

        }

        console.log(
            "Calling:",
            "AIDispatcher.dispatch()"
        );

const response =
    await Dispatcher.dispatch(
        request
    );

        console.log(
            "Dispatcher Returned:"
        );

        console.log(
            response
        );

        console.groupEnd();

        if (

            GG.Config?.DEBUG?.ENABLED

        ) {

            console.log(
                "Dispatcher Response:",
                response
            );

        }

        /*----------------------------------
          Local Success
        ----------------------------------*/

        if (

            response &&

            response.success

        ) {

            console.group(
                "✅ Controller Success"
            );

            response.local =
                true;

            response.intent =
                intent.intent;

            response.detectedIntent =
                intent;

            console.log(
                "Final Intent:",
                response.intent
            );

            console.log(
                "Local:",
                response.local
            );

            console.log(
                "Response:"
            );

            console.log(
                response
            );

            console.log(
                "Elapsed:",
                Date.now() -
                started,
                "ms"
            );

            console.groupEnd();

            console.group(
                "🏁 FINAL PIPELINE"
            );
            console.log(
                "Query:",
                request.query
            );
            console.log(
                "Intent:",
                response.intent
            );
            console.log(
                "Domain:",
                response.domain
            );
            console.log(
                "Handler:",
                response.module
            );
            console.log(
                "Formatter:",
                response.formatted?.module
            );
            console.log(
                "Cards:",
                response.cards?.length || 0
            );
            console.log(
                "Sections:",
                response.sections?.length || 0
            );
            console.log(
                "Markdown:",
                !!response.formatted?.markdown
            );
            console.log(
                "HTML:",
                !!response.formatted?.html
            );
            console.groupEnd();

            console.groupEnd();

            return response;

        }

        /*----------------------------------
          Cloud Required
        ----------------------------------*/

        console.warn(
            "⚠ Local pipeline finished but requires cloud."
        );

        console.log(
            "Elapsed:",
            Date.now() -
            started,
            "ms"
        );

        console.groupEnd();

        return {

            success: false,

            local: false,

            reason: "cloud",

            intent:

                intent?.intent ||

                "unknown",

            detectedIntent:

                intent ||

                null,

            message:

                "Requires cloud reasoning."

        };

    }

    catch (

        err

    ) {

        console.group(
            "❌ Controller Error"
        );

        console.error(
            err
        );

        console.log(
            "Elapsed:",
            Date.now() -
            started,
            "ms"
        );

        console.groupEnd();

        return {

            success: false,

            local: false,

            source:
                "controller",

            message:
                err.message,

            error:
                err

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
