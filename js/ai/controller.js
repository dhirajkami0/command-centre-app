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
    if (GG.Config?.DEBUG?.ENABLED) {
        console.log(
            "%cGreenGuard Controller Ready",
            "color:#008000;font-weight:bold;"
        );
    }
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
    GG.Config?.ANALYTICS?.AUTO_LOAD &&
    !Analytics.loaded
) {
    if (
        typeof Analytics.load ===
        "function"
    ) {
        await Analytics.load();
    }
}
 /*----------------------------------
  Return
----------------------------------*/

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
          Intent Manager
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

        /*----------------------------------
          Attach Intent
        ----------------------------------*/

        Object.assign(

            request,

            {

                detectedIntent:

                    intent,

                intent:

                    intent.intent,

                domain:

                    intent.domain,

                entities:

                    intent.entities ||

                    {},

                parameters:

                    intent.parameters ||

                    {},

                context:

                    intent.context ||

                    {},

                confidence:

                    intent.confidence ||

                    0

            }

        );

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

                request

            );

        /*----------------------------------
          Local Success
        ----------------------------------*/

        if (

            response &&

            response.success

        ) {

            response.local =

                true;

            response.metadata =

                response.metadata ||

                {};

            response.metadata.controllerTime =

                Date.now() -

                started;

            if (

                GG.Config?.FREEZE_RESPONSES ===

                true

            ) {

                return Object.freeze(

                    response

                );

            }return response;

        }

        /*----------------------------------
          Cloud Required
        ----------------------------------*/

        return {

            success:

                false,

            local:

                false,

            reason:

                "cloud",

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

        error

    ) {

        return {

            success:

                false,

            local:

                false,

            source:

                "controller",

            message:

                error.message,

            error:

                error

        };

    }

};
 /*=========================================================
 REGISTER
=========================================================*/

/*=========================================================
 REGISTER
=========================================================*/

GG.Controller =

    Controller;

if (

    GG.Config?.DEBUG?.ENABLED

) {

    console.log(

        "%cGreenGuard AI Controller Loaded",

        "color:#008000;font-weight:bold;"

    );

}
})(window);
