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
    StaffConstants.VERSION;

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

   const cacheKey =

    request.normalizedQuery ||

    request.originalQuery ||

    "";

StaffRouter.cache.set(

    cacheKey,

    response

);

    return response;

};
    /*=========================================================
 REGISTER ROUTES
=========================================================*/

/*=========================================================
 REGISTER ROUTES
=========================================================*/

StaffRouter.registerRoutes = function () {

    const INTENTS =

        StaffConstants.INTENTS;

    /*----------------------------------
      SEARCH
    ----------------------------------*/

    StaffRouter.register(

        INTENTS.STAFF_SEARCH,

        GG.queryStaffSearch

    );

    StaffRouter.register(

        INTENTS.STAFF_DIRECTORY,

        GG.queryStaffDirectory

    );

    StaffRouter.register(

        INTENTS.STAFF_EXISTS,

        GG.queryStaffExists

    );

    StaffRouter.register(

        INTENTS.STAFF_BY_NAME,

        GG.queryStaffByName

    );

    StaffRouter.register(

        INTENTS.STAFF_BY_PHONE,

        GG.queryStaffByPhone

    );

    StaffRouter.register(

        INTENTS.STAFF_BY_ROLE,

        GG.queryStaffByRole

    );

    StaffRouter.register(

        INTENTS.STAFF_BY_DESIGNATION,

        GG.queryStaffByDesignation

    );

    StaffRouter.register(

        INTENTS.STAFF_BY_LEADER,

        GG.queryStaffByLeader

    );

    StaffRouter.register(

        INTENTS.STAFF_BY_TEAM,

        GG.queryStaffByTeam

    );

    /*----------------------------------
      PROFILE
    ----------------------------------*/

    StaffRouter.register(

        INTENTS.STAFF_PROFILE,

        GG.queryStaffProfile

    );

    StaffRouter.register(

        INTENTS.STAFF_CONTACT,

        GG.queryStaffContact

    );

    StaffRouter.register(

        INTENTS.STAFF_ROLE,

        GG.queryStaffRole

    );

    StaffRouter.register(

        INTENTS.STAFF_DESIGNATION,

        GG.queryStaffDesignation

    );

    /*----------------------------------
      POSTING
    ----------------------------------*/

    StaffRouter.register(

        INTENTS.STAFF_POSTING,

        GG.queryStaffPosting

    );

    StaffRouter.register(

        INTENTS.STAFF_CIRCLE,

        GG.queryStaffCircle

    );

    StaffRouter.register(

        INTENTS.STAFF_DIVISION,

        GG.queryStaffDivision

    );

    StaffRouter.register(

        INTENTS.STAFF_RANGE,

        GG.queryStaffRange

    );

    StaffRouter.register(

        INTENTS.STAFF_BEAT,

        GG.queryStaffBeat

    );

    /*----------------------------------
      LOCATION
    ----------------------------------*/

    StaffRouter.register(

        INTENTS.STAFF_LOCATION,

        GG.queryStaffLocation

    );

    StaffRouter.register(

        INTENTS.STAFF_GPS,

        GG.queryStaffGPS

    );

    /*----------------------------------
      DUTY
    ----------------------------------*/

    StaffRouter.register(

        INTENTS.STAFF_DUTY,

        GG.queryStaffDuty

    );

    StaffRouter.register(

        INTENTS.STAFF_DUTY_STATUS,

        GG.queryStaffDutyStatus

    );

    StaffRouter.register(

        INTENTS.STAFF_DUTY_TYPE,

        GG.queryStaffDutyType

    );

    StaffRouter.register(

        INTENTS.STAFF_DUTY_STARTED,

        GG.queryStaffDutyStarted

    );

    StaffRouter.register(

        INTENTS.STAFF_DUTY_ENDED,

        GG.queryStaffDutyEnded

    );

    StaffRouter.register(

        INTENTS.STAFF_DUTY_ACTIVE,

        GG.queryStaffDutyActive

    );

    StaffRouter.register(

        INTENTS.STAFF_LAST_DUTY,

        GG.queryStaffLastDuty

    );

    StaffRouter.register(

        INTENTS.STAFF_ASSIGNMENT,

        GG.queryStaffAssignment

    );

    /*----------------------------------
      TEAM
    ----------------------------------*/

    StaffRouter.register(

        INTENTS.STAFF_TEAM,

        GG.queryStaffTeam

    );

    StaffRouter.register(

        INTENTS.STAFF_LEADER,

        GG.queryStaffLeader

    );

    /*----------------------------------
      GPS DETAILS
    ----------------------------------*/

    StaffRouter.register(

        INTENTS.STAFF_SPEED,

        GG.queryStaffSpeed

    );

    StaffRouter.register(

        INTENTS.STAFF_HEADING,

        GG.queryStaffHeading

    );

    StaffRouter.register(

        INTENTS.STAFF_ACCURACY,

        GG.queryStaffAccuracy

    );

    /*----------------------------------
      PATROL ANALYTICS
    ----------------------------------*/

    StaffRouter.register(

        INTENTS.STAFF_ANALYTICS,

        GG.queryStaffAnalytics

    );

    StaffRouter.register(

        INTENTS.STAFF_DISTANCE,

        GG.queryStaffDistance

    );

    StaffRouter.register(

        INTENTS.STAFF_PATROL_POINTS,

        GG.queryStaffPatrolPoints

    );

    StaffRouter.register(

        INTENTS.STAFF_PATROL_START,

        GG.queryStaffPatrolStart

    );

    StaffRouter.register(

        INTENTS.STAFF_PATROL_END,

        GG.queryStaffPatrolEnd

    );

    StaffRouter.register(

        INTENTS.STAFF_PATROL_DURATION,

        GG.queryStaffPatrolDuration

    );

   
   

    StaffRouter.register(

        INTENTS.STAFF_ACTIVE_LIST,

        GG.queryActiveStaffList

    );

    StaffRouter.register(

        INTENTS.STAFF_INACTIVE_LIST,

        GG.queryInactiveStaffList

    );

    StaffRouter.register(

        INTENTS.STAFF_DUTY_SUMMARY,

        GG.queryDutySummary

    );

    StaffRouter.register(

        INTENTS.STAFF_TEAM_LEADER_LIST,

        GG.queryTeamLeaderList

    );

    StaffRouter.register(

        INTENTS.STAFF_MOVING,

        GG.queryMovingStaff

    );


    /*----------------------------------
      CONTROL ROOM
    ----------------------------------*/

    StaffRouter.register(

        INTENTS.WHO_IS_ON_DUTY,

        GG.queryWhoIsOnDuty

    );

    StaffRouter.register(

        INTENTS.WHO_IS_PATROLLING,

        GG.queryWhoIsPatrolling

    );
/*----------------------------------
  STATUS
----------------------------------*/

StaffRouter.register(

    INTENTS.STAFF_ACTIVE_COUNT,

    GG.queryActiveStaffCount

);

StaffRouter.register(

    INTENTS.STAFF_ACTIVE_LIST,

    GG.queryActiveStaffList

);

StaffRouter.register(

    INTENTS.STAFF_INACTIVE_LIST,

    GG.queryInactiveStaffList

);

StaffRouter.register(

    INTENTS.STAFF_DUTY_SUMMARY,

    GG.queryDutySummary

);

StaffRouter.register(

    INTENTS.STAFF_TEAM_LEADER_LIST,

    GG.queryTeamLeaderList

);

StaffRouter.register(

    INTENTS.STAFF_MOVING,

    GG.queryMovingStaff

);

StaffRouter.register(

    INTENTS.STAFF_STATIONARY,

    GG.queryStationaryStaff

);
 /*----------------------------------
  SUMMARY
----------------------------------*/

StaffRouter.register(

    INTENTS.STAFF_SUMMARY,

    GG.queryStaffSummary

);

StaffRouter.register(

    INTENTS.STAFF_JURISDICTION_SUMMARY,

    GG.queryJurisdictionSummary

);

StaffRouter.register(

    INTENTS.STAFF_DESIGNATION_SUMMARY,

    GG.queryDesignationSummary

);

StaffRouter.register(

    INTENTS.STAFF_CIRCLE_DIRECTORY,

    GG.queryCircleDirectory

);

StaffRouter.register(

    INTENTS.STAFF_DIVISION_DIRECTORY,

    GG.queryDivisionDirectory

);

StaffRouter.register(

    INTENTS.STAFF_RANGE_DIRECTORY,

    GG.queryRangeDirectory

);

StaffRouter.register(

    INTENTS.STAFF_BEAT_DIRECTORY,

    GG.queryBeatDirectory

);

StaffRouter.register(

    INTENTS.STAFF_DESIGNATION_DIRECTORY,

    GG.queryDesignationDirectory

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
