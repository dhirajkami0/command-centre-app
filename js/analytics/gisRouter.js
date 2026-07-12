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

        const INTENTS =

            GG.GISConstants.INTENTS;

        const QUERY =

            GG.GISQuery || {};

        const FORMATTER =

            GG.GISFormatter || {};

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

    };

    /*--------------------------------------------------
      Route
    --------------------------------------------------*/

    GISRouter.route = function (

        request

    ) {

        if (

            !request ||

            !request.intent

        ) {

            return null;

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

            return null;

        }

        return handler(

            request

        );

    };

    /*--------------------------------------------------
      Export
    --------------------------------------------------*/

    GISRouter.registerRoutes();

    GG.GISRouter =

        Object.freeze(

            GISRouter

        );

    console.log(

        "✅ GIS Router Loaded",

        GISRouter.VERSION

    );

})(

    window.GreenGuardAI

);
