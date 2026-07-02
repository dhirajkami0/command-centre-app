(function (window) {

"use strict";

/*=========================================================
 NAMESPACE
=========================================================*/

const GG =
    window.GreenGuardAI =
    window.GreenGuardAI || {};

const AnalyticsEngine =
    GG.AnalyticsEngine;

/*=========================================================
 ROUTE WILDLIFE INTENT
=========================================================*/

AnalyticsEngine.routeWildlifeIntent = function (

    intent

) {

    switch (

        intent.intent

    ) {

        /*
        Future

        case "wildlifeSpecies":
        case "wildlifeSighting":
        case "wildlifeMovement":
        */

        default:

            return {

                success: false,

                source: "router",

                domain: "wildlife",

                intent:

                    intent.intent,

                confidence:

                    intent.confidence,

                entities:

                    intent.entities ||

                    {},

                data: {

                    success: false,

                    message:

                        "Wildlife module not implemented."

                }

            };

    }

};

console.log(

    "%cWildlife Router Loaded",

    "color:#008000;font-weight:bold;"

);

})(window);
