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

    /\b(HOW MANY|COUNT|TOTAL|STRENGTH|NUMBER OF|TEAM LEADER|TEAM LEADERS|ACTIVE STAFF|INACTIVE STAFF|STAFF STRENGTH|STAFF COUNT)\b/i.test(

        text

    )

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
    /*----------------------------------------------------------
BUILD STAFF INTENT
----------------------------------------------------------*/

AnalyticsEngine.buildStaffIntent = function (query) {

    const intent =
        AnalyticsEngine.detectStaffIntent(query);

    const entities =
        AnalyticsEngine.extractStaffEntities(query);

    const confidence =
        AnalyticsEngine.calculateConfidence(
            intent,
            entities,
            query
        );

    return {

        source: "local",

        domain: "staff",

        intent,

        entities,

        confidence,

        query

    };

};
/*----------------------------------------------------------
GET STAFF INTENT
----------------------------------------------------------*/

/*----------------------------------------------------------
CALCULATE CONFIDENCE
----------------------------------------------------------*/

AnalyticsEngine.calculateConfidence = function (

    intent,

    entities,

    query

) {

    let score = 0;

    if (

        intent !==

        AnalyticsEngine.STAFF_INTENTS.UNKNOWN

    ) {

        score += 0.60;

    }

    if (

        entities.staff

    ) {

        score += 0.25;

    }

    if (

        entities.beat ||

        entities.range ||

        entities.division

    ) {

        score += 0.10;

    }

    if (

        query.length > 5

    ) {

        score += 0.05;

    }

    return Math.min(score,1);

};
})(window);
