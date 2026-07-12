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

        "1.0.0";

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

            GG.GISQuery;

        /*------------------------------
          Search
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_SEARCH,

            QUERY.getGIS

        );

        /*------------------------------
          Profile
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_PROFILE,

            QUERY.info

        );

        /*------------------------------
          Map
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_MAP,

            QUERY.getMap

        );

        /*------------------------------
          Filter
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_FILTER,

            QUERY.getFilter

        );

        GISRouter.register(

            INTENTS.GIS_CURRENT_FILTER,

            QUERY.getFilter

        );

        /*------------------------------
          Selection
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_SELECTION,

            QUERY.getCurrentGeometry

        );

        /*------------------------------
          Current Location
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_CURRENT_LOCATION,

            QUERY.getCurrentGeometry

        );

        /*------------------------------
          Division
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_DIVISION,

            QUERY.getCurrentDivision

        );

        /*------------------------------
          Range
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_RANGE,

            QUERY.getCurrentRange

        );

        /*------------------------------
          Beat
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_BEAT,

            QUERY.getCurrentBeat

        );

        /*------------------------------
          Compartment
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_COMPARTMENT,

            QUERY.getCurrentCompartment

        );

        /*------------------------------
          Village
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_VILLAGE,

            QUERY.getVillages

        );

        /*------------------------------
          Hierarchy
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_HIERARCHY,

            QUERY.getFilter

        );

        /*------------------------------
          Spatial
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_NEAREST,

            QUERY.getCurrentGeometry

        );

        GISRouter.register(

            INTENTS.GIS_INSIDE,

            QUERY.findContainingCompartment

        );

        GISRouter.register(

            INTENTS.GIS_CONTAINS,

            QUERY.findContainingCompartment

        );

        GISRouter.register(

            INTENTS.GIS_DISTANCE,

            QUERY.getTrackDistanceMap

        );

        GISRouter.register(

            INTENTS.GIS_DIRECTION,

            QUERY.getCurrentGeometry

        );

        /*------------------------------
          Analytics
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_ANALYTICS,

            QUERY.getAnalyticsCache

        );

        GISRouter.register(

            INTENTS.GIS_SUMMARY,

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

        "GIS Router Loaded",

        GISRouter.VERSION

    );

})(

    window.GreenGuardAI

);
