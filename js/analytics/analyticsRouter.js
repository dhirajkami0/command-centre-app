(function (window) {

"use strict";

const GG =
    window.GreenGuardAI =
    window.GreenGuardAI || {};

const AnalyticsEngine =
    GG.AnalyticsEngine;

/*=========================================================
 ROUTE ANALYTICS INTENT
=========================================================*/

AnalyticsEngine.routeAnalyticsIntent = function (

    intent

) {

    switch (

        intent.intent

    ) {

        /*
        Future

        case "analyticsSummary":
        case "analyticsCoverage":
        */

        default:

            return {

                success: false,

                source: "router",

                domain: "analytics",

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

                        "Analytics module not implemented."

                }

            };

    }

};

console.log(

    "%cAnalytics Router Loaded",

    "color:#008000;font-weight:bold;"

);

})(window);
