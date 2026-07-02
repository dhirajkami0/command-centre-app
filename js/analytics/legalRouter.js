(function (window) {

"use strict";

const GG =
    window.GreenGuardAI =
    window.GreenGuardAI || {};

const AnalyticsEngine =
    GG.AnalyticsEngine;

/*=========================================================
 ROUTE LEGAL INTENT
=========================================================*/

AnalyticsEngine.routeLegalIntent = function (

    intent

) {

    switch (

        intent.intent

    ) {

        /*
        Future

        case "legalSection":
        case "legalOffence":
        */

        default:

            return {

                success: false,

                source: "router",

                domain: "legal",

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

                        "Legal module not implemented."

                }

            };

    }

};

console.log(

    "%cLegal Router Loaded",

    "color:#008000;font-weight:bold;"

);

})(window);
