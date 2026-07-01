(function (window) {

"use strict";

window.GreenGuardAI =
    window.GreenGuardAI || {};

const AnalyticsEngine =
    window.GreenGuardAI.AnalyticsEngine =
    window.GreenGuardAI.AnalyticsEngine || {};

/*=========================================================
STAFF ROUTES
=========================================================*/

AnalyticsEngine.STAFF_ROUTES = {

    [AnalyticsEngine.STAFF_INTENTS.STAFF_DIRECTORY]:
        AnalyticsEngine.queryStaffDirectory,

    [AnalyticsEngine.STAFF_INTENTS.STAFF_PROFILE]:
        AnalyticsEngine.queryStaffProfile,

    [AnalyticsEngine.STAFF_INTENTS.STAFF_STRENGTH]:
        AnalyticsEngine.queryStaffStrength,

    [AnalyticsEngine.STAFF_INTENTS.LIVE_STAFF]:
        AnalyticsEngine.queryLiveStaff,

    [AnalyticsEngine.STAFF_INTENTS.STAFF_LOCATION]:
        AnalyticsEngine.queryStaffLocation,

    [AnalyticsEngine.STAFF_INTENTS.STAFF_PATROL]:
        AnalyticsEngine.queryStaffPatrol,

    [AnalyticsEngine.STAFF_INTENTS.STAFF_CONTACT]:
        AnalyticsEngine.queryStaffContact,

    [AnalyticsEngine.STAFF_INTENTS.STAFF_ANALYTICS]:
        AnalyticsEngine.queryStaffAnalytics

};

/*=========================================================
ROUTE STAFF INTENT
=========================================================*/

AnalyticsEngine.routeStaffIntent = function (

    request

) {

    console.group(

        "👥 STAFF ROUTER"

    );

    console.log(

        "Request:",

        request

    );

    /*----------------------------------
    VALIDATE REQUEST
    ----------------------------------*/

    if (

        !request ||

        typeof request !== "object"

    ) {

        console.groupEnd();

        return {

            success: false,

            source: "router",

            domain: "staff",

            intent: "unknown",

            confidence: 0,

            entities: {},

            data: {

                success: false,

                message:
                    "Invalid intent request."

            }

        };

    }

    /*----------------------------------
    DESTRUCTURE REQUEST
    ----------------------------------*/

    const {

        source,

        domain,

        intent,

        confidence,

        entities = {}

    } = request;

    const filters = entities;

    /*----------------------------------
    MODULE MISSING
    ----------------------------------*/

    function moduleMissing(message) {

        return {

            success: false,

            source,

            domain,

            intent,

            confidence,

            entities: filters,

            message

        };

    }

    /*----------------------------------
    ROUTE LOOKUP
    ----------------------------------*/

    const handler =

        AnalyticsEngine.STAFF_ROUTES[

            intent

        ];

    let result = null;

    /*----------------------------------
    UNKNOWN INTENT
    ----------------------------------*/

    if (

        intent ===

        AnalyticsEngine.STAFF_INTENTS.UNKNOWN

    ) {

        result =

            moduleMissing(

                "Unknown staff intent."

            );

    }

    /*----------------------------------
    MODULE NOT INSTALLED
    ----------------------------------*/

    else if (

        typeof handler !== "function"

    ) {

        result =

            moduleMissing(

                "Module not installed for intent: " +

                intent

            );

    }

    /*----------------------------------
    EXECUTE MODULE
    ----------------------------------*/

    else {

        result =

            handler(

                filters

            );

    }

    console.log(

        "Result:",

        result

    );

    console.groupEnd();

    return {

        success:

            result.success,

        source,

        domain,

        intent,

        confidence,

        entities: filters,

        data: result

    };

};

})(window);
