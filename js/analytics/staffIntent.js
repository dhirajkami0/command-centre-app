(function (window) {

"use strict";

window.GreenGuardAI =
    window.GreenGuardAI || {};

const AnalyticsEngine =
    window.GreenGuardAI.AnalyticsEngine;

/*----------------------------------------------------------
STAFF INTENTS
----------------------------------------------------------*/

AnalyticsEngine.STAFF_INTENTS = {

    STAFF_DIRECTORY : "staffDirectory",

    STAFF_PROFILE : "staffProfile",

    STAFF_STRENGTH : "staffStrength",

    LIVE_STAFF : "liveStaff",

    STAFF_LOCATION : "staffLocation",

    STAFF_PATROL : "staffPatrol",

    STAFF_CONTACT : "staffContact",

    STAFF_ANALYTICS : "staffAnalytics",

    UNKNOWN : "unknown"

};


/*----------------------------------------------------------
DETECT STAFF INTENT
----------------------------------------------------------*/

AnalyticsEngine.detectStaffIntent = function (query) {

    const text =
        String(query || "")
        .trim()
        .toUpperCase();

    /*----------------------------------
    STAFF CONTACT
    ----------------------------------*/

    if (

        /\b(PHONE|MOBILE|CONTACT|EMAIL)\b/.test(text)

    ) {

        return AnalyticsEngine.STAFF_INTENTS.STAFF_CONTACT;

    }

    /*----------------------------------
    STAFF LOCATION
    ----------------------------------*/

    if (

        /\b(WHERE|LOCATION|LOCATE|GPS|CURRENT LOCATION|LAST LOCATION)\b/.test(text)

    ) {

        return AnalyticsEngine.STAFF_INTENTS.STAFF_LOCATION;

    }

    /*----------------------------------
    STAFF PATROL
    ----------------------------------*/

    if (

        /\b(PATROL|TRACK|ROUTE|DISTANCE|SESSION)\b/.test(text)

    ) {

        return AnalyticsEngine.STAFF_INTENTS.STAFF_PATROL;

    }

    /*----------------------------------
    LIVE STAFF
    ----------------------------------*/

    if (

        /\b(LIVE|ACTIVE|ON DUTY|DUTY STAFF|CURRENT DUTY)\b/.test(text)

    ) {

        return AnalyticsEngine.STAFF_INTENTS.LIVE_STAFF;

    }

    /*----------------------------------
    STAFF STRENGTH
    ----------------------------------*/

/*----------------------------------
STAFF STRENGTH
----------------------------------*/

if (

    /\b(
        HOW MANY|
        COUNT|
        TOTAL|
        STRENGTH|
        NUMBER OF|
        TEAM LEADER|
        TEAM LEADERS|
        ACTIVE STAFF|
        INACTIVE STAFF|
        STAFF STRENGTH|
        STAFF COUNT
    )\b/ix.test(text)

) {

    return AnalyticsEngine.STAFF_INTENTS.STAFF_STRENGTH;

}
    /*----------------------------------
    STAFF ANALYTICS
    ----------------------------------*/

    if (

        /\b(TOP|BEST|MOST|LEAST|COMPARE|SUMMARY|STATISTICS|ANALYTICS|RANKING)\b/.test(text)

    ) {

        return AnalyticsEngine.STAFF_INTENTS.STAFF_ANALYTICS;

    }

    /*----------------------------------
    STAFF PROFILE
    ----------------------------------*/

    if (

        /\b(PROFILE|DETAILS|DETAIL|INFORMATION|WHO IS)\b/.test(text)

    ) {

        return AnalyticsEngine.STAFF_INTENTS.STAFF_PROFILE;

    }

    /*----------------------------------
    STAFF DIRECTORY
    ----------------------------------*/

    if (

        /\b(SHOW|LIST|DISPLAY|DIRECTORY|STAFF)\b/.test(text)

    ) {

        return AnalyticsEngine.STAFF_INTENTS.STAFF_DIRECTORY;

    }

    return AnalyticsEngine.STAFF_INTENTS.UNKNOWN;

};

})(window);
