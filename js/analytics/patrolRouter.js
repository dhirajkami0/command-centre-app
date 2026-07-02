(function (window) {

"use strict";

const GG =
    window.GreenGuardAI =
    window.GreenGuardAI || {};

const AnalyticsEngine =
    GG.AnalyticsEngine;

/*=========================================================
 ROUTE PATROL INTENT
=========================================================*/

AnalyticsEngine.routePatrolIntent = function (

    intent

) {

    switch (

        intent.intent

    ) {

        /*
        Future

        case "patrolCoverage":
        case "patrolDistance":
        */

        default:

            return {

                success: false,

                source: "router",

                domain: "patrol",

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

                        "Patrol module not implemented."

                }

            };

    }

};

console.log(

    "%cPatrol Router Loaded",

    "color:#008000;font-weight:bold;"

);

})(window);
