(function (window) {

"use strict";

/*=========================================================
 GREENGUARD AI
=========================================================*/

const GG =
    window.GreenGuardAI =
    window.GreenGuardAI || {};

/*=========================================================
 DEPENDENCIES
=========================================================*/

const StaffConstants =
    GG.StaffConstants;

const StaffEntities =
    GG.StaffEntities;

const StaffIntent =
    GG.StaffIntent;

if (

    !StaffConstants

) {

    throw new Error(

        "StaffConstants not loaded."

    );

}

if (

    !StaffEntities

) {

    throw new Error(

        "StaffEntities not loaded."

    );

}

if (

    !StaffIntent

) {

    throw new Error(

        "StaffIntent not loaded."

    );

}

/*=========================================================
 MODULE
=========================================================*/

const StaffRouter = {};

/*=========================================================
 VERSION
=========================================================*/

StaffRouter.VERSION =
    "2.0.0";

/*=========================================================
 STATUS
=========================================================*/

StaffRouter.loaded =
    false;

StaffRouter.loading =
    false;

/*=========================================================
 CACHE
=========================================================*/

StaffRouter.cache =
    new Map();

StaffRouter.lastRequest =
    null;

StaffRouter.lastResponse =
    null;

/*=========================================================
 ROUTES
=========================================================*/

StaffRouter.routes =
    new Map();

/*=========================================================
 REGISTER ROUTE
=========================================================*/

StaffRouter.register = function (

    intent,

    handler

) {

    if (

        typeof intent !== "string"

    ) {

        return;

    }

    if (

        typeof handler !== "function"

    ) {

        return;

    }

    StaffRouter.routes.set(

        intent,

        handler

    );

};

/*=========================================================
 GET ROUTE
=========================================================*/

StaffRouter.getRoute = function (

    intent

) {

    return (

        StaffRouter.routes.get(

            intent

        ) ||

        null

    );

};

/*=========================================================
 HAS ROUTE
=========================================================*/

StaffRouter.hasRoute = function (

    intent

) {

    return StaffRouter.routes.has(

        intent

    );

};

/*=========================================================
 CLEAR CACHE
=========================================================*/

StaffRouter.clearCache = function () {

    StaffRouter.cache.clear();

};

/*=========================================================
 INITIALIZE
=========================================================*/

StaffRouter.initialize = function () {

    if (

        StaffRouter.loaded

    ) {

        return true;

    }

    if (

        StaffRouter.loading

    ) {

        return false;

    }

    StaffRouter.loading = true;

    /*----------------------------------
      Register Routes
    ----------------------------------*/

    StaffRouter.registerRoutes();

    /*----------------------------------
      Ready
    ----------------------------------*/

    StaffRouter.loaded = true;

    StaffRouter.loading = false;

    console.log(

        "✅ StaffRouter Ready"

    );

    return true;

};    /*=========================================================
 CREATE RESPONSE
=========================================================*/

StaffRouter.createResponse = function (

    request = {}

) {

    return {

        success:

            false,

        source:

            "LOCAL",

        domain:

            StaffConstants.DOMAIN,

        intent:

            request.intent ||

            StaffConstants.INTENTS.UNKNOWN,

        confidence:

            request.confidence ||

            0,

        query:

            request.originalQuery ||

            "",

        entities:

            request.entities ||

            {},

        parameters:

            request.parameters ||

            {},

        data:

            null,

        message:

            "",

        warnings:

            [],

        errors:

            [],

        metadata: {

            version:

                StaffRouter.VERSION,

            router:

                "StaffRouter",

            startedAt:

                Date.now(),

            executionTime:

                0

        }

    };

};

 /*=========================================================
 ROUTE
=========================================================*/

StaffRouter.route = async function (

    request

) {

    const started =

        Date.now();

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !request ||

        typeof request !== "object"

    ) {

        return {

            success: false,

            message: "Invalid router request."

        };

    }

    /*----------------------------------
      Create Response
    ----------------------------------*/

    const response =

        StaffRouter.createResponse(

            request

        );

    StaffRouter.lastRequest =

        request;

    /*----------------------------------
      Resolve Handler
    ----------------------------------*/

    const handler =

        StaffRouter.getRoute(

            request.intent

        );

    if (

        !handler

    ) {

        response.message =

            "No route registered for intent.";

        response.errors.push(

            request.intent

        );

        response.metadata.executionTime =

            Date.now() -

            started;

        return response;

    }

    try {

        /*----------------------------------
          Execute Handler
        ----------------------------------*/

      

/*----------------------------------
  Execute Handler
----------------------------------*/

const result =

    await handler(

        request

    );
        if (

            result &&

            typeof result === "object"

        ) {

            Object.assign(

                response,

                result

            );

        }

        response.success =

            true;

    }

    catch (

        error

    ) {

        response.success =

            false;

        response.message =

            error.message;

        response.errors.push(

            error

        );

    }

    /*----------------------------------
      Finish
    ----------------------------------*/

    response.metadata.executionTime =

        Date.now() -

        started;

    StaffRouter.lastResponse =

        response;

    StaffRouter.cache.set(

        request.originalQuery ||

        "",

        response

    );

    return response;

};
    /*=========================================================
 REGISTER ROUTES
=========================================================*/

StaffRouter.registerRoutes = function () {

    const INTENTS =

        StaffConstants.INTENTS;

    /*----------------------------------
      Staff Directory
    ----------------------------------*/

    StaffRouter.register(

        INTENTS.STAFF_DIRECTORY,

        GG.queryStaffDirectory

    );

    /*----------------------------------
      Staff Profile
    ----------------------------------*/

    StaffRouter.register(

        INTENTS.STAFF_PROFILE,

        GG.queryStaffProfile

    );

    /*----------------------------------
      Staff Contact
    ----------------------------------*/

    StaffRouter.register(

        INTENTS.STAFF_CONTACT,

        GG.queryStaffContact

    );

    /*----------------------------------
      Staff Posting
    ----------------------------------*/

    StaffRouter.register(

        INTENTS.STAFF_POSTING,

        GG.queryStaffPosting

    );

    /*----------------------------------
      Staff Location
    ----------------------------------*/

    StaffRouter.register(

        INTENTS.STAFF_LOCATION,

        GG.queryStaffLocation

    );

    /*----------------------------------
      Staff Team
    ----------------------------------*/

    StaffRouter.register(

        INTENTS.STAFF_TEAM,

        GG.queryStaffTeam

    );

    /*----------------------------------
      Team Leader
    ----------------------------------*/

    StaffRouter.register(

        INTENTS.STAFF_LEADER,

        GG.queryStaffLeader

    );

    /*----------------------------------
      Duty
    ----------------------------------*/

    StaffRouter.register(

        INTENTS.STAFF_DUTY,

        GG.queryStaffDuty

    );

    /*----------------------------------
      GPS
    ----------------------------------*/

    StaffRouter.register(

        INTENTS.STAFF_GPS,

        GG.queryStaffGPS

    );

    /*----------------------------------
      Analytics
    ----------------------------------*/

    StaffRouter.register(

        INTENTS.STAFF_ANALYTICS,

        GG.queryStaffAnalytics

    );

    /*----------------------------------
      Strength
    ----------------------------------*/

    StaffRouter.register(

        INTENTS.STAFF_STRENGTH,

        GG.queryStaffStrength

    );

};
    /*=========================================================
 INITIALIZE ROUTER
=========================================================*/
/*=========================================================
 AUTO INITIALIZE
=========================================================*/

StaffRouter.initialize();

/*=========================================================
 AUTO INITIALIZE
=========================================================*/

/*=========================================================
 EXPORT
=========================================================*/

GG.StaffRouter =

    StaffRouter;

})(window);
