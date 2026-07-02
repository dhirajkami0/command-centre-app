(function (window) {

"use strict";

const GG =
    window.GreenGuardAI =
    window.GreenGuardAI || {};

const AnalyticsEngine =
    GG.AnalyticsEngine;

/*=========================================================
 ROUTE REPORT INTENT
=========================================================*/

AnalyticsEngine.routeReportIntent = function (

    intent

) {

    switch (

        intent.intent

    ) {

        /*
        Future

        case "reportDaily":
        case "reportMonthly":
        case "reportYearly":
        */

        default:

            return {

                success: false,

                source: "router",

                domain: "report",

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

                        "Report module not implemented."

                }

            };

    }

};

console.log(

    "%cReport Router Loaded",

    "color:#008000;font-weight:bold;"

);

})(window);
