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
    console.group(
        "🧠 GreenGuard Controller"
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
        /*----------------------------------
          Ensure Analytics
        ----------------------------------*/
        await Controller.ensureAnalyticsReady();
        /*----------------------------------
          Detect Intent
        ----------------------------------*/
        const IntentManager =
            GG.IntentManager;
        if (
            !IntentManager ||
            typeof IntentManager.detect !==
            "function"
        ) {
            throw new Error(
                "IntentManager unavailable."
            );
        }
        const intent =
            await IntentManager.detect(
                request.query
            );
        if (

    GG.Config?.DEBUG?.ENABLED

) {

    console.log(

        "Unified Intent:",

        intent

    );

}
        /*----------------------------------
          Save Intent
        ----------------------------------*/
        request.detectedIntent =
            intent;
        /*----------------------------------
          Dispatcher
        ----------------------------------*/
        const Dispatcher =
            GG.AIDispatcher;
        if (
            !Dispatcher ||
            typeof Dispatcher.dispatch !==
            "function"
        ) {
            throw new Error(
                "Dispatcher unavailable."
            );
        }
        const response =
            await Dispatcher.dispatch(
                intent
            );
        
        if (GG.Config?.DEBUG?.ENABLED) {
            console.log("Dispatcher Response:", response);
        }

        /*----------------------------------
          Local Success
        ----------------------------------*/
        if (
            response &&
            response.success
        ) {
            response.local =
                true;
            response.intent =
                intent.intent;
            response.detectedIntent =
                intent;
            return response;
        }
        /*----------------------------------
          Cloud Required
        ----------------------------------*/
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
    catch (err) {
        console.error(
            err
        );
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

/* Note: In Core.callAI(), update the invocation as follows:
window.callAI({
    query: request.query,
    intent: request.detectedIntent || request.intent,
    toolResults: {}
});
*/

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
