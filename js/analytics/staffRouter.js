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

    console.group(

        "🟣 STAFF ROUTER"

    );

    console.log(

        "File:",

        "staffRouter.js"

    );

    console.log(

        "Incoming Request:",

        request

    );

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !request ||

        typeof request !== "object"

    ) {

        console.error(

            "❌ Invalid Router Request"

        );

        console.groupEnd();

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

    console.log(

        "Intent:",

        request.intent

    );

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

        console.error(

            "❌ No Route Registered:",

            request.intent

        );

        response.message =

            "No route registered for intent.";

        response.errors.push(

            request.intent

        );

        response.metadata.executionTime =

            Date.now() -

            started;

        console.groupEnd();

        return response;

    }

    console.log(

        "Handler:",

        handler.name

    );

    console.log(

        "Handler Function:",

        handler

    );

    try {

        console.time(

            "Query"

        );

        const result =

            await handler(

                request

            );
console.log("====================================");
console.log("HANDLER RETURNED");
console.log(result);

console.log("RESULT.DATA");
console.log(result.data);

console.log("RESULT.DATA LENGTH");
console.log(
    Array.isArray(result.data)
        ? result.data.length
        : null
);

console.log("====================================");
        console.timeEnd(

            "Query"

        );

        console.log(

            "Query Result:",

            result

        );

        if (

            result &&

            typeof result === "object"

        ) {

            Object.assign(

                response,

                result

            );
console.log("====================================");
console.log("ROUTER RESPONSE");
console.log(response);

console.log("ROUTER RESPONSE.DATA");
console.log(response.data);

console.log("ROUTER RESPONSE.DATA LENGTH");
console.log(
    Array.isArray(response.data)
        ? response.data.length
        : null
);

console.log("====================================");        }

        response.success =

            true;

    }

    catch (

        error

    ) {

        console.error(

            "❌ Query Failed",

            error

        );

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

    console.log(

        "Router Response:",

        response

    );

    console.log(

        "Execution:",

        response.metadata.executionTime,

        "ms"

    );

    console.groupEnd();

    return response;

};
    /*=========================================================
 REGISTER ROUTES
=========================================================*/
StaffRouter.registerWithLog = function (

    intent,

    handler

) {

    console.group(

        "📝 ROUTE REGISTRATION"

    );

    console.log(

        "File:",

        "staffRouter.js"

    );

    console.log(

        "Intent:",

        intent

    );

    console.log(

        "Handler:",

        handler
            ? handler.name
            : "<null>"

    );

    console.log(

        "Function Exists:",

        typeof handler ===
        "function"

    );

    console.log(

        "Function Object:",

        handler

    );

    StaffRouter.register(

        intent,

        handler

    );

console.log(

    "Registered:",

    StaffRouter.getRoute(

        intent

    ) === handler

);

    console.groupEnd();

};
/*=========================================================
 REGISTER ROUTES
=========================================================*/

StaffRouter.registerRoutes = function () {
    const INTENTS = StaffConstants.INTENTS;

    /*----------------------------------
      SEARCH
    ----------------------------------*/
    StaffRouter.registerWithLog(INTENTS.STAFF_SEARCH, GG.queryStaffSearch);
    StaffRouter.registerWithLog(INTENTS.STAFF_DIRECTORY, GG.queryStaffDirectory);
    StaffRouter.registerWithLog(INTENTS.STAFF_EXISTS, GG.queryStaffExists);
    StaffRouter.registerWithLog(INTENTS.STAFF_BY_NAME, GG.queryStaffByName);
    StaffRouter.registerWithLog(INTENTS.STAFF_BY_PHONE, GG.queryStaffByPhone);
    StaffRouter.registerWithLog(INTENTS.STAFF_BY_ROLE, GG.queryStaffByRole);
    StaffRouter.registerWithLog(INTENTS.STAFF_BY_DESIGNATION, GG.queryStaffByDesignation);
    StaffRouter.registerWithLog(INTENTS.STAFF_BY_LEADER, GG.queryStaffByLeader);
    StaffRouter.registerWithLog(INTENTS.STAFF_BY_TEAM, GG.queryStaffByTeam);

    /*----------------------------------
      PROFILE
    ----------------------------------*/
    StaffRouter.registerWithLog(INTENTS.STAFF_PROFILE, GG.queryStaffProfile);
    StaffRouter.registerWithLog(INTENTS.STAFF_CONTACT, GG.queryStaffContact);
    StaffRouter.registerWithLog(INTENTS.STAFF_ROLE, GG.queryStaffRole);
    StaffRouter.registerWithLog(INTENTS.STAFF_DESIGNATION, GG.queryStaffDesignation);

    /*----------------------------------
      POSTING
    ----------------------------------*/
    StaffRouter.registerWithLog(INTENTS.STAFF_POSTING, GG.queryStaffPosting);
    StaffRouter.registerWithLog(INTENTS.STAFF_CIRCLE, GG.queryStaffCircle);
    StaffRouter.registerWithLog(INTENTS.STAFF_DIVISION, GG.queryStaffDivision);
    StaffRouter.registerWithLog(INTENTS.STAFF_RANGE, GG.queryStaffRange);
    StaffRouter.registerWithLog(INTENTS.STAFF_BEAT, GG.queryStaffBeat);

    /*----------------------------------
      LOCATION
    ----------------------------------*/
    StaffRouter.registerWithLog(INTENTS.STAFF_LOCATION, GG.queryStaffLocation);
    StaffRouter.registerWithLog(INTENTS.STAFF_GPS, GG.queryStaffGPS);

    /*----------------------------------
      DUTY
    ----------------------------------*/
    StaffRouter.registerWithLog(INTENTS.STAFF_DUTY, GG.queryStaffDuty);
    StaffRouter.registerWithLog(INTENTS.STAFF_DUTY_STATUS, GG.queryStaffDutyStatus);
    StaffRouter.registerWithLog(INTENTS.STAFF_DUTY_TYPE, GG.queryStaffDutyType);
    StaffRouter.registerWithLog(INTENTS.STAFF_DUTY_STARTED, GG.queryStaffDutyStarted);
    StaffRouter.registerWithLog(INTENTS.STAFF_DUTY_ENDED, GG.queryStaffDutyEnded);
    StaffRouter.registerWithLog(INTENTS.STAFF_DUTY_ACTIVE, GG.queryStaffDutyActive);
    StaffRouter.registerWithLog(INTENTS.STAFF_LAST_DUTY, GG.queryStaffLastDuty);
    StaffRouter.registerWithLog(INTENTS.STAFF_ASSIGNMENT, GG.queryStaffAssignment);

    /*----------------------------------
      TEAM
    ----------------------------------*/
    StaffRouter.registerWithLog(INTENTS.STAFF_TEAM, GG.queryStaffTeam);
    StaffRouter.registerWithLog(INTENTS.STAFF_LEADER, GG.queryStaffLeader);

    /*----------------------------------
      GPS
    ----------------------------------*/
    StaffRouter.registerWithLog(INTENTS.STAFF_SPEED, GG.queryStaffSpeed);
    StaffRouter.registerWithLog(INTENTS.STAFF_HEADING, GG.queryStaffHeading);
    StaffRouter.registerWithLog(INTENTS.STAFF_ACCURACY, GG.queryStaffAccuracy);

    /*----------------------------------
      ANALYTICS
    ----------------------------------*/
    StaffRouter.registerWithLog(INTENTS.STAFF_ANALYTICS, GG.queryStaffAnalytics);
    StaffRouter.registerWithLog(INTENTS.STAFF_DISTANCE, GG.queryStaffDistance);
    StaffRouter.registerWithLog(INTENTS.STAFF_PATROL_POINTS, GG.queryStaffPatrolPoints);
    StaffRouter.registerWithLog(INTENTS.STAFF_PATROL_START, GG.queryStaffPatrolStart);
    StaffRouter.registerWithLog(INTENTS.STAFF_PATROL_END, GG.queryStaffPatrolEnd);
    StaffRouter.registerWithLog(INTENTS.STAFF_PATROL_DURATION, GG.queryStaffPatrolDuration);

    /*----------------------------------
      SUMMARY
    ----------------------------------*/
    StaffRouter.registerWithLog(INTENTS.STAFF_SUMMARY, GG.queryStaffSummary);
    StaffRouter.registerWithLog(INTENTS.STAFF_JURISDICTION_SUMMARY, GG.queryJurisdictionSummary);
    StaffRouter.registerWithLog(INTENTS.STAFF_DESIGNATION_SUMMARY, GG.queryDesignationSummary);
    StaffRouter.registerWithLog(INTENTS.STAFF_CIRCLE_DIRECTORY, GG.queryCircleDirectory);
    StaffRouter.registerWithLog(INTENTS.STAFF_DIVISION_DIRECTORY, GG.queryDivisionDirectory);
    StaffRouter.registerWithLog(INTENTS.STAFF_RANGE_DIRECTORY, GG.queryRangeDirectory);
    StaffRouter.registerWithLog(INTENTS.STAFF_BEAT_DIRECTORY, GG.queryBeatDirectory);
    StaffRouter.registerWithLog(INTENTS.STAFF_DESIGNATION_DIRECTORY, GG.queryDesignationDirectory);
/*----------------------------------
  COUNTS
----------------------------------*/

StaffRouter.registerWithLog(

    INTENTS.STAFF_COUNT,

    GG.queryStaffCount

);

StaffRouter.registerWithLog(

    INTENTS.STAFF_CIRCLE_COUNT,

    GG.queryCircleCount

);

StaffRouter.registerWithLog(

    INTENTS.STAFF_DIVISION_COUNT,

    GG.queryDivisionCount

);

StaffRouter.registerWithLog(

    INTENTS.STAFF_RANGE_COUNT,

    GG.queryRangeCount

);

StaffRouter.registerWithLog(

    INTENTS.STAFF_BEAT_COUNT,

    GG.queryBeatCount

);

StaffRouter.registerWithLog(

    INTENTS.STAFF_DESIGNATION_COUNT,

    GG.queryDesignationCount

);
    /*----------------------------------
      STATUS
    ----------------------------------*/
    StaffRouter.registerWithLog(INTENTS.STAFF_ACTIVE_COUNT, GG.queryActiveStaffCount);
    StaffRouter.registerWithLog(INTENTS.STAFF_ACTIVE_LIST, GG.queryActiveStaffList);
    StaffRouter.registerWithLog(INTENTS.STAFF_INACTIVE_LIST, GG.queryInactiveStaffList);
    StaffRouter.registerWithLog(INTENTS.STAFF_DUTY_SUMMARY, GG.queryDutySummary);
    StaffRouter.registerWithLog(INTENTS.STAFF_TEAM_LEADER_LIST, GG.queryTeamLeaderList);
    StaffRouter.registerWithLog(INTENTS.STAFF_MOVING, GG.queryMovingStaff);
    StaffRouter.registerWithLog(INTENTS.STAFF_STATIONARY, GG.queryStationaryStaff);

    /*----------------------------------
      CONTROL ROOM
    ----------------------------------*/
    StaffRouter.registerWithLog(INTENTS.WHO_IS_ON_DUTY, GG.queryWhoIsOnDuty);
    StaffRouter.registerWithLog(INTENTS.WHO_IS_PATROLLING, GG.queryWhoIsPatrolling);

    /*----------------------------------
      TABLE LOG
    ----------------------------------*/

    console.group(

        "📋 STAFF ROUTER TABLE"

    );

    console.log(

        "Total Routes:",

        StaffRouter.routes.size

    );

    StaffRouter.routes.forEach(

        function (

            handler,

            intent

        ) {

            console.log(

                intent,

                "→",

                handler

                    ? handler.name

                    : "<null>"

            );

        }

    );

    console.groupEnd();
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
