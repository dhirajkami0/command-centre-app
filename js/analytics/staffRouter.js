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

AnalyticsEngine.routeStaffIntent =
function (query) {

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
        "Query :",
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

    let result = null;

    switch (intent) {

        /*----------------------------------
        Staff Directory
        ----------------------------------*/

        case "staffDirectory":

            result =
                AnalyticsEngine.queryStaffDirectory(
                    filters
                );

            break;

        /*----------------------------------
        Staff Profile
        ----------------------------------*/

        case "staffProfile":

            result =
                AnalyticsEngine.queryStaffProfile(
                    filters
                );

            break;

        /*----------------------------------
        Staff Strength
        ----------------------------------*/

        case "staffStrength":

            result =
                AnalyticsEngine.queryStaffStrength(
                    filters
                );

            break;

        /*----------------------------------
        Live Staff
        ----------------------------------*/

        case "liveStaff":

            result =
                AnalyticsEngine.queryLiveStaff(
                    filters
                );

            break;

        /*----------------------------------
        Staff Location
        ----------------------------------*/

        case "staffLocation":

            result =
                AnalyticsEngine.queryStaffLocation(
                    filters
                );

            break;

        /*----------------------------------
        Staff Patrol
        ----------------------------------*/

        case "staffPatrol":

            result =
                AnalyticsEngine.queryStaffPatrol(
                    filters
                );

            break;

        /*----------------------------------
        Staff Contact
        ----------------------------------*/

        case "staffContact":

            result =
                AnalyticsEngine.queryStaffContact(
                    filters
                );

            break;

        /*----------------------------------
        Staff Analytics
        ----------------------------------*/

        case "staffAnalytics":

            result =
                AnalyticsEngine.queryStaffAnalytics(
                    filters
                );

            break;

        /*----------------------------------
        Unknown
        ----------------------------------*/

        default:

            result = {

                success: false,

                intent: "unknown",

                message:
                    "Unknown staff intent.",

                filters: filters

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

        intent: intent,

        filters: filters,

        data: result

    };

};

})(window);
