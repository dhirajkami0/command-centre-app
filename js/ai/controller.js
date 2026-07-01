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
 ASK
=========================================================*/

Controller.ask = async function (query) {

    await Controller.ensureAnalyticsReady();

    query =

        window.GreenGuardAI.AnalyticsEngine

            .normalizeQuery(query);

    return

        window.GreenGuardAI.AnalyticsEngine

            .query(query);

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
