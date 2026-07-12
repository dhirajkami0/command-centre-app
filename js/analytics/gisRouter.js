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

    const ROUTES =

        {};

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

        /*------------------------------
          Information
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_INFO,

            GG.GISQuery.info

        );

        GISRouter.register(

            INTENTS.GIS_FILTER,

            GG.GISQuery.getFilter

        );

        GISRouter.register(

            INTENTS.GIS_SELECTION,

            GG.GISQuery.getCurrentGeometry

        );

        /*------------------------------
          Geography
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_FEATURES,

            GG.GISQuery.getGIS

        );

        GISRouter.register(

            INTENTS.GIS_COMPARTMENTS,

            GG.GISQuery.getCompartments

        );

        GISRouter.register(

            INTENTS.GIS_VILLAGES,

            GG.GISQuery.getVillages

        );

        /*------------------------------
          Current Jurisdiction
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_CURRENT_DIVISION,

            GG.GISQuery.getCurrentDivision

        );

        GISRouter.register(

            INTENTS.GIS_CURRENT_RANGE,

            GG.GISQuery.getCurrentRange

        );

        GISRouter.register(

            INTENTS.GIS_CURRENT_BEAT,

            GG.GISQuery.getCurrentBeat

        );

        GISRouter.register(

            INTENTS.GIS_CURRENT_COMPARTMENT,

            GG.GISQuery.getCurrentCompartment

        );

        /*------------------------------
          Staff
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_LIVE_STAFF,

            GG.GISQuery.getLiveStaff

        );

        GISRouter.register(

            INTENTS.GIS_STAFF_PROFILES,

            GG.GISQuery.getStaffProfiles

        );

        /*------------------------------
          Patrol
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_TRACKS,

            GG.GISQuery.getTracks

        );

        GISRouter.register(

            INTENTS.GIS_SESSIONS,

            GG.GISQuery.getSessions

        );

        /*------------------------------
          Analytics
        ------------------------------*/

        GISRouter.register(

            INTENTS.GIS_ANALYTICS,

            GG.GISQuery.getAnalyticsCache

        );

        GISRouter.register(

            INTENTS.GIS_MONTHLY,

            GG.GISQuery.getMonthlyCache

        );

    };

    /*--------------------------------------------------
      Execute
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

        const fn =

            ROUTES[

                request.intent

            ];

        if (

            typeof fn !==

            "function"

        ) {

            return null;

        }

        return fn(

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

})(

    window.GreenGuardAI

);
