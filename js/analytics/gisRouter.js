(function (window) {

"use strict";

const GG =
    window.GreenGuardAI =
    window.GreenGuardAI || {};

const AnalyticsEngine =
    GG.AnalyticsEngine;

/*=========================================================
 ROUTE GIS INTENT
=========================================================*/

AnalyticsEngine.routeGISIntent = function (

    intent

) {

    switch (

        intent.intent

    ) {

        /*
        Future

        case "gisBeat":
        case "gisRange":
        case "gisCompartment":
        */

        default:

            return {

                success: false,

                source: "router",

                domain: "gis",

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

                        "GIS module not implemented."

                }

            };

    }

};

console.log(

    "%cGIS Router Loaded",

    "color:#008000;font-weight:bold;"

);

})(window);
