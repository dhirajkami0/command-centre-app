(function (window) {

"use strict";

window.GreenGuardAI =
    window.GreenGuardAI || {};

const AnalyticsEngine =
    window.GreenGuardAI.AnalyticsEngine =
    window.GreenGuardAI.AnalyticsEngine || {};

/*----------------------------------------------------------
STAFF ROUTER
----------------------------------------------------------*/

/*----------------------------------------------------------
STAFF ROUTER
----------------------------------------------------------*/

AnalyticsEngine.routeStaffIntent = function (query) {

    const intent =
        AnalyticsEngine.detectStaffIntent(
            query
        );

    const filters =
        AnalyticsEngine.extractStaffEntities(
            query
        );

    console.group("👥 STAFF ROUTER");

    console.log(
        "Query:",
        query
    );

    console.log(
        "Intent:",
        intent
    );

    console.log(
        "Filters:",
        filters
    );

    let result;

    switch (intent) {

        /*----------------------------------
        STAFF DIRECTORY
        ----------------------------------*/

        case AnalyticsEngine.STAFF_INTENTS.STAFF_DIRECTORY:

            result =
                AnalyticsEngine.queryStaffDirectory(
                    filters
                );

            break;

        /*----------------------------------
        STAFF PROFILE
        ----------------------------------*/

        case AnalyticsEngine.STAFF_INTENTS.STAFF_PROFILE:

            result =
                AnalyticsEngine.queryStaffProfile(
                    filters
                );

            break;

        /*----------------------------------
        STAFF STRENGTH
        ----------------------------------*/

        case AnalyticsEngine.STAFF_INTENTS.STAFF_STRENGTH:

            result =
                AnalyticsEngine.queryStaffStrength(
                    filters
                );

            break;

        /*----------------------------------
        LIVE STAFF
        ----------------------------------*/

        case AnalyticsEngine.STAFF_INTENTS.LIVE_STAFF:

            if (AnalyticsEngine.queryLiveStaff) {

                result =
                    AnalyticsEngine.queryLiveStaff(
                        filters
                    );

            } else {

                result = {

                    success: false,

                    intent: "liveStaff",

                    message:
                        "Live Staff module not installed."

                };

            }

            break;

        /*----------------------------------
        STAFF LOCATION
        ----------------------------------*/

        case AnalyticsEngine.STAFF_INTENTS.STAFF_LOCATION:

            if (AnalyticsEngine.queryStaffLocation) {

                result =
                    AnalyticsEngine.queryStaffLocation(
                        filters
                    );

            } else {

                result = {

                    success: false,

                    intent: "staffLocation",

                    message:
                        "Staff Location module not installed."

                };

            }

            break;

        /*----------------------------------
        STAFF PATROL
        ----------------------------------*/

        case AnalyticsEngine.STAFF_INTENTS.STAFF_PATROL:

            if (AnalyticsEngine.queryStaffPatrol) {

                result =
                    AnalyticsEngine.queryStaffPatrol(
                        filters
                    );

            } else {

                result = {

                    success: false,

                    intent: "staffPatrol",

                    message:
                        "Staff Patrol module not installed."

                };

            }

            break;

        /*----------------------------------
        STAFF CONTACT
        ----------------------------------*/

        case AnalyticsEngine.STAFF_INTENTS.STAFF_CONTACT:

            if (AnalyticsEngine.queryStaffContact) {

                result =
                    AnalyticsEngine.queryStaffContact(
                        filters
                    );

            } else {

                result = {

                    success: false,

                    intent: "staffContact",

                    message:
                        "Staff Contact module not installed."

                };

            }

            break;

        /*----------------------------------
        STAFF ANALYTICS
        ----------------------------------*/

        case AnalyticsEngine.STAFF_INTENTS.STAFF_ANALYTICS:

            if (AnalyticsEngine.queryStaffAnalytics) {

                result =
                    AnalyticsEngine.queryStaffAnalytics(
                        filters
                    );

            } else {

                result = {

                    success: false,

                    intent: "staffAnalytics",

                    message:
                        "Staff Analytics module not installed."

                };

            }

            break;

        /*----------------------------------
        UNKNOWN
        ----------------------------------*/

        default:

            result = {

                success: false,

                intent: "unknown",

                message:
                    "Unknown staff intent.",

                filters

            };

    }

    console.log(
        "Result:",
        result
    );

    console.groupEnd();

    return {

        success: true,

        type: "staff",

        intent,

        filters,

        data: result

    };

};
