/*=========================================================
  GreenGuard AI
  GIS Router
=========================================================*/

window.GreenGuardAI =
    window.GreenGuardAI || {};

(function (

    GG

) {

    "use strict";

    const GISRouter = {};

    GISRouter.VERSION =
        "1.1.0";

    const ROUTES = {};

    let routesRegistered =
        false;

    /*--------------------------------------------------
      Register
    --------------------------------------------------*/

    GISRouter.register = function (

        intent,

        handler

    ) {

        if (

            !intent ||

            typeof handler !==

            "function"

        ) {

            return;

        }

        ROUTES[intent] =
            handler;

    };

    /*--------------------------------------------------
      Register Routes
    --------------------------------------------------*/

    GISRouter.registerRoutes = function () {

        if (
            routesRegistered
        ) {
            return true;
        }

        const INTENTS =
            GG.GISConstants?.INTENTS;
        const QUERY =
            GG.GISQuery;
        const FORMATTER =
            GG.GISFormatter;

        if (

            !INTENTS ||

            !QUERY ||

            !FORMATTER

        ) {

            return false;

        }

        /*------------------------------
          Search
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_SEARCH,

            FORMATTER.formatSearch ||

            QUERY.getGIS

        );

        /*------------------------------
          Profile
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_PROFILE,

            FORMATTER.formatInfo ||

            QUERY.info

        );

        /*------------------------------
          Map
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_MAP,

            FORMATTER.formatMap ||

            QUERY.getMap

        );

        /*------------------------------
          Filter
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_FILTER,

            FORMATTER.formatCurrentSelection ||

            QUERY.getFilter

        );

        GISRouter.register(

            INTENTS.GIS_CURRENT_FILTER,

            FORMATTER.formatCurrentSelection ||

            QUERY.getFilter

        );

        /*------------------------------
          Selection
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_SELECTION,

            FORMATTER.formatCurrentSelection ||

            QUERY.getCurrentGeometry

        );

        /*------------------------------
          Current Location
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_CURRENT_LOCATION,

            FORMATTER.formatCurrentLocation ||

            QUERY.getCurrentGeometry

        );

        /*------------------------------
          Division
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_DIVISION,

            FORMATTER.formatCurrentDivision ||

            QUERY.getCurrentDivision

        );

        /*------------------------------
          Range
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_RANGE,

            FORMATTER.formatCurrentRange ||

            QUERY.getCurrentRange

        );

        /*------------------------------
          Beat
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_BEAT,

            FORMATTER.formatCurrentBeat ||

            QUERY.getCurrentBeat

        );

        /*------------------------------
          Compartment
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_COMPARTMENT,

            FORMATTER.formatCurrentCompartment ||

            QUERY.getCurrentCompartment

        );

        /*------------------------------
          Village
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_VILLAGE,

            FORMATTER.formatCurrentVillage ||

            QUERY.getVillages

        );

        /*------------------------------
          Hierarchy
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_HIERARCHY,

            FORMATTER.formatHierarchy ||

            QUERY.getHierarchy

        );

        /*------------------------------
          Spatial
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_NEAREST,

            FORMATTER.formatNearest ||

            QUERY.getCurrentGeometry

        );

        GISRouter.register(

            INTENTS.GIS_INSIDE,

            FORMATTER.formatInside ||

            QUERY.findContainingCompartment

        );

        GISRouter.register(

            INTENTS.GIS_CONTAINS,

            FORMATTER.formatContains ||

            QUERY.findContainingCompartment

        );

        GISRouter.register(

            INTENTS.GIS_DISTANCE,

            FORMATTER.formatDistance ||

            QUERY.getTrackDistanceMap

        );

        GISRouter.register(

            INTENTS.GIS_DIRECTION,

            FORMATTER.formatDirection ||

            QUERY.getCurrentGeometry

        );

        /*------------------------------
          Analytics
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_ANALYTICS,

            FORMATTER.formatAnalytics ||

            QUERY.getAnalyticsCache

        );

        /*------------------------------
          Summary
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_SUMMARY,

            FORMATTER.formatInfo ||

            QUERY.info

        );

        routesRegistered =
            true;
        return true;

    };

    /*--------------------------------------------------
      Route
    --------------------------------------------------*/

    GISRouter.route = async function (

        request

    ) {

        if (

            !request ||

            !request.intent

        ) {

            return {

                success: false,

                source: "LOCAL",

                module: "GISRouter",

                message: "Invalid GIS request."

            };

        }

        const handler =

            ROUTES[
                request.intent
            ];

        if (

            typeof handler !==

            "function"

        ) {

            console.warn(

                "GIS Router: No handler for",

                request.intent

            );

            return {

                success: false,

                source: "LOCAL",

                module: "GISRouter",

                intent: request.intent,

                message:

                    "No GIS handler registered."

            };

        }

        try {

            const response =

                await handler(

                    request

                );

            return (

                response ||

                {

                    success: false,

                    source: "LOCAL",

                    module: "GISRouter",

                    message:

                        "GIS handler returned no response."

                }

            );

        } catch (

            error

        ) {

            return {

                success: false,

                source: "LOCAL",

                module: "GISRouter",

                intent:

                    request.intent,

                message:

                    error.message,

                error

            };

        }

    };

    /*--------------------------------------------------
      Export
    --------------------------------------------------*/
    GG.GISRouter =
        GISRouter;

    /*--------------------------------------------------
      Register Routes
    --------------------------------------------------*/
    const registered =
        GISRouter.registerRoutes();

    if (

        !registered &&

        GG.Config?.DEBUG?.ENABLED

    ) {

        console.warn(

            "GIS Router waiting for dependencies."

        );

    }

    /*--------------------------------------------------
      Debug
    --------------------------------------------------*/
    if (

        GG.Config?.DEBUG?.ENABLED

    ) {

        console.log(

            "%cGIS Router Loaded",

            "color:#008000;font-weight:bold;"

        );

    }

})(

    window.GreenGuardAI

);
