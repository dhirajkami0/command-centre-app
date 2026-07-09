(function (window) {

"use strict";

/*=========================================================
 GREENGUARD
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

/*=========================================================
 MODULE
=========================================================*/

const StaffIntent = {};

/*=========================================================
 VERSION
=========================================================*/

StaffIntent.VERSION =

    "1.0.0";

/*=========================================================
 STATUS
=========================================================*/

StaffIntent.loaded =

    false;

StaffIntent.loading =

    false;

/*=========================================================
 CACHE
=========================================================*/

StaffIntent.cache =

    new Map();

/*=========================================================
 LAST RESULT
=========================================================*/

StaffIntent.lastResult =

    null;

/*=========================================================
 LAST QUERY
=========================================================*/

StaffIntent.lastQuery =

    "";

/*=========================================================
 CONFIDENCE
=========================================================*/

StaffIntent.defaultConfidence =

    0;
/*=========================================================
 INTENT PRIORITY
=========================================================*/

StaffIntent.PRIORITY = Object.freeze({

    EXACT:

        100,

    NAME:

        95,

    PHONE:

        95,

    ROLE:

        90,

    DESIGNATION:

        90,

    POSTING:

        85,

    TEAM:

        80,

    DUTY:

        80,

    GPS:

        80,

    ANALYTICS:

        70,

    UNKNOWN:

        0

});

/*=========================================================
 AI THRESHOLDS
=========================================================*/

StaffIntent.THRESHOLDS = Object.freeze({

    LOCAL:

        0.90,

    VERY_HIGH:

        0.95,

    HIGH:

        0.85,

    GOOD:

        0.75,

    MEDIUM:

        0.60,

    AI:

        0.70,

    LOW:

        0.40

});

/*=========================================================
 CREATE INTENT RESULT
=========================================================*/

StaffIntent.createIntentResult = function (

    query = ""

) {

    const originalQuery =

        typeof query === "string"

            ? query

            : "";

    const normalizedQuery =

        originalQuery

            .trim()

            .toUpperCase();

    return {

        /*----------------------------------
          Query
        ----------------------------------*/

        originalQuery,

        normalizedQuery,

        /*----------------------------------
          Intent
        ----------------------------------*/

        intent:

            null,

      domain:

    StaffConstants.DOMAIN,
        confidence:

            0,

        source:

            "local",

        /*----------------------------------
          Routing
        ----------------------------------*/

        requiresAI:

            false,

        route:

            null,

        /*----------------------------------
          Entity Matches
        ----------------------------------*/

        entities: {

            staff: [],

            phones: [],

            roles: [],

            designations: [],

            posting: [],

            team: [],

            duty: [],

            gps: []

        },

        /*----------------------------------
          Parameters
        ----------------------------------*/

        parameters: {},

        /*----------------------------------
          Keywords
        ----------------------------------*/

        keywords: [],

        /*----------------------------------
          Diagnostics
        ----------------------------------*/

        warnings: [],

        errors: [],

        /*----------------------------------
          Metadata
        ----------------------------------*/

        metadata: {

           version:

    StaffConstants.VERSION,
            timestamp:

                Date.now(),

            engine:

                "StaffIntent"

        }

    };

};

/*=========================================================
 CACHE HELPERS
=========================================================*/

StaffIntent.getCachedResult = function (

    query

) {

    if (

        typeof query !== "string"

    ) {

        return null;

    }

    const key =

        query

            .trim()

            .toUpperCase();

    return (

        StaffIntent.cache.get(

            key

        ) ||

        null

    );

};

StaffIntent.setCachedResult = function (

    query,

    result

) {

    if (

        typeof query !== "string"

    ) {

        return;

    }

    if (

        !result

    ) {

        return;

    }

    const key =

        query

            .trim()

            .toUpperCase();

    StaffIntent.cache.set(

        key,

        result

    );

};
    /*=========================================================
 DETECT
 Master Intent Detection
=========================================================*/

/*=========================================================
 DETECT
 Master Intent Detection
=========================================================*/
/*=========================================================
 DETECT STAFF INTENT
=========================================================*/
/*=========================================================
 DETECT
=========================================================*/
StaffIntent.matchIntent = function (

    query,

    config

) {

    query =

        String(

            query ||

            ""

        ).toUpperCase();

    /*--------------------------
      ANY
    --------------------------*/

    if (

        config.any &&

        !config.any.every(

            word =>

            query.includes(

                word

            )

        )

    ) {

        return false;

    }

    /*--------------------------
      ONE OF
    --------------------------*/

    if (

        config.oneOf &&

        !config.oneOf.some(

            word =>

            query.includes(

                word

            )

        )

    ) {

        return false;

    }

    /*--------------------------
      EXCLUDE
    --------------------------*/

    if (

        config.exclude &&

        config.exclude.some(

            word =>

            query.includes(

                word

            )

        )

    ) {

        return false;

    }

    return true;

};
/*=========================================================
 DETECT
=========================================================*/

/*=========================================================
 DETECT
=========================================================*/

StaffIntent.detect = function (

    query

) {

    const started =

        Date.now();

    console.group(

        "🟤 STAFF INTENT"

    );

    console.log(

        "File:",

        "staffIntent.js"

    );

    console.log(

        "Function:",

        "StaffIntent.detect"

    );

    console.log(

        "Incoming Query:",

        query

    );

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        typeof query !== "string"

    ) {

        console.warn(

            "❌ Invalid Query"

        );

        console.groupEnd();

        return StaffIntent.createIntentResult();

    }

    query =

        query.trim();

    console.log(

        "Normalized Query:",

        query

    );

    /*----------------------------------
      Cache
    ----------------------------------*/

    const cached =

        StaffIntent.getCachedResult(

            query

        );

    if (

        cached

    ) {

        console.log(

            "⚡ STAFF CACHE HIT"

        );

        console.log(

            cached

        );

        console.groupEnd();

        return cached;

    }

    console.log(

        "⚪ STAFF CACHE MISS"

    );

    /*----------------------------------
      Create Result
    ----------------------------------*/

    let result =

        StaffIntent.createIntentResult(

            query

        );

    StaffIntent.lastQuery =

        query;

    console.log(

        "📄 Initial Result:",

        result

    );

    /*----------------------------------
      Extract Entities
    ----------------------------------*/

    console.time(

        "StaffEntities.extract"

    );

    const extraction =

        StaffEntities.extract(

            query

        );

    console.timeEnd(

        "StaffEntities.extract"

    );

    console.log(

        "📦 Extraction:",

        extraction

    );

    if (

        !extraction

    ) {

        console.error(

            "❌ Extraction Failed"

        );

        result.errors.push(

            "Extraction failed."

        );

        result.requiresAI =

            true;

        console.groupEnd();

        return result;

    }

    /*----------------------------------
      Copy Entities
    ----------------------------------*/

    result.entities = {

        staff:

            [

                ...(extraction.entities?.staff || [])

            ],

        phones:

            [

                ...(extraction.entities?.phones || [])

            ],

        roles:

            [

                ...(extraction.entities?.roles || [])

            ],

        designations:

            [

                ...(extraction.entities?.designations || [])

            ],

        posting:

            [

                ...(extraction.entities?.posting || [])

            ],

        team:

            [

                ...(extraction.entities?.team || [])

            ],

        duty:

            [

                ...(extraction.entities?.duty || [])

            ],

        gps:

            [

                ...(extraction.entities?.gps || [])

            ]

    };

    console.log(

        "👥 Entities:",

        result.entities

    );

    /*----------------------------------
      Keywords
    ----------------------------------*/

    result.keywords =

        [

            ...(extraction.keywords || [])

        ];

    console.log(

        "🏷 Keywords:",

        result.keywords

    );

    /*----------------------------------
      Parameters
    ----------------------------------*/

    result.parameters = {

        ...(extraction.parameters || {})

    };

    console.log(

        "⚙ Parameters:",

        result.parameters

    );

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.metadata.extraction =

        extraction;

    /*=================================================
      GLOBAL INTENT DETECTION
    =================================================*/

    console.time(

        "detectGlobalIntent"

    );

    result =

        StaffIntent.detectGlobalIntent(

            result

        );

    console.timeEnd(

        "detectGlobalIntent"

    );

    console.log(

        "🌍 After detectGlobalIntent:",

        result.intent

    );

    /*=================================================
      STAFF INTENT DETECTION
      (Only if global did not match)
    =================================================*/

    if (

        !result.intent

    ) {

        console.time(

            "detectStaffIntent"

        );

        result =

            StaffIntent.detectStaffIntent(

                result

            );

        console.timeEnd(

            "detectStaffIntent"

        );

        console.log(

            "👤 After detectStaffIntent:",

            result.intent

        );

    }

    else {

        console.log(

            "✅ Staff detection skipped (Global intent matched)."

        );

    }

    console.log(

        "Confidence Before Calculation:",

        result.confidence

    );

    /*----------------------------------
      Confidence
    ----------------------------------*/

    console.time(

        "calculateConfidence"

    );

    StaffIntent.calculateConfidence(

        result

    );

    console.timeEnd(

        "calculateConfidence"

    );

    console.log(

        "Confidence After Calculation:",

        result.confidence

    );

    /*----------------------------------
      AI Decision
    ----------------------------------*/

    result.requiresAI =

        StaffIntent.needsAI(

            result

        );

    console.log(

        "Requires AI:",

        result.requiresAI

    );

    /*----------------------------------
      Execution Time
    ----------------------------------*/

    result.metadata.executionTime =

        Date.now() -

        started;

    console.log(

        "Execution Time:",

        result.metadata.executionTime,

        "ms"

    );

    /*----------------------------------
      Cache
    ----------------------------------*/

    StaffIntent.lastResult =

        result;

    StaffIntent.setCachedResult(

        query,

        result

    );

    console.log(

        "🏁 Final Staff Result:",

        result

    );

    console.groupEnd();

    return result;

}; /*=========================================================
 DETECT POSTING INTENT
=========================================================*/
/*=========================================================
  CALCULATE CONFIDENCE
=========================================================*/

StaffIntent.calculateConfidence = function (

    result

) {

    if (

        !result ||

        typeof result !== "object"

    ) {

        return 0;

    }

    let confidence = Number(

        result.confidence

    );

    if (

        !Number.isFinite(

            confidence

        )

    ) {

        confidence = 0;

    }

    confidence = Math.max(

        0,

        Math.min(

            1,

            confidence

        )

    );

    result.confidence = confidence;

    return confidence;

};
/*=========================================================
  DETECT STAFF POSTING
=========================================================*/

/*=========================================================
 DETECT POSTING INTENT
=========================================================*/

StaffIntent.detectPostingIntent = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result ||

        !result.entities

    ) {

        return result;

    }

    const staff =

        result.entities.staff ||

        [];

    if (

        staff.length === 0

    ) {

        return result;

    }

    const profile =

        staff[0];

    const query =

        result.normalizedQuery;

    const INTENTS =

        StaffConstants.INTENTS;

    const KEYWORDS =

        StaffConstants.KEYWORDS;

    /*----------------------------------
      Helper
    ----------------------------------*/

    function hasKeyword(

        list

    ) {

        if (

            !Array.isArray(

                list

            )

        ) {

            return false;

        }

        return list.some(

            function (

                word

            ) {

                return query.includes(

                    String(

                        word

                    ).toUpperCase()

                );

            }

        );

    }

    /*----------------------------------
      Beat
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_BEAT

        )

    ) {

        result.intent =

            INTENTS.STAFF_BEAT;

        result.parameters.staff =

            profile;

        result.parameters.beat =

            profile.posting?.beat ||

            null;

        result.confidence =

            Math.max(

                result.confidence,

                0.98

            );

        return result;

    }

    /*----------------------------------
      Range
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_RANGE

        )

    ) {

        result.intent =

            INTENTS.STAFF_RANGE;

        result.parameters.staff =

            profile;

        result.parameters.range =

            profile.posting?.range ||

            null;

        result.confidence =

            Math.max(

                result.confidence,

                0.98

            );

        return result;

    }

    /*----------------------------------
      Division
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_DIVISION

        )

    ) {

        result.intent =

            INTENTS.STAFF_DIVISION;

        result.parameters.staff =

            profile;

        result.parameters.division =

            profile.posting?.division ||

            null;

        result.confidence =

            Math.max(

                result.confidence,

                0.98

            );

        return result;

    }

    /*----------------------------------
      Circle
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_CIRCLE

        )

    ) {

        result.intent =

            INTENTS.STAFF_CIRCLE;

        result.parameters.staff =

            profile;

        result.parameters.circle =

            profile.posting?.circle ||

            null;

        result.confidence =

            Math.max(

                result.confidence,

                0.98

            );

        return result;

    }

    /*----------------------------------
      Complete Posting
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_POSTING

        )

    ) {

        result.intent =

            INTENTS.STAFF_POSTING;

        result.parameters.staff =

            profile;

        result.parameters.posting =

            profile.posting ||

            null;

        result.confidence =

            Math.max(

                result.confidence,

                0.97

            );

        return result;

    }

    return result;

};
 /*=========================================================
 DETECT DUTY INTENT
=========================================================*/

StaffIntent.detectDutyIntent = function (
    result
) {
    /*----------------------------------
      Validate
    ----------------------------------*/
    if (
        !result ||
        !result.entities
    ) {
        return result;
    }

    const staff =
        result.entities.staff ||
        [];

    if (
        staff.length === 0
    ) {
        return result;
    }

    const profile =
        staff[0];

    const query =
        result.normalizedQuery;

    const INTENTS =
        StaffConstants.INTENTS;
    const KEYWORDS =
        StaffConstants.KEYWORDS;

    /*----------------------------------
      Helper
    ----------------------------------*/
    function hasKeyword(
        list
    ) {
        if (
            !Array.isArray(
                list
            )
        ) {
            return false;
        }
        return list.some(
            function (
                word
            ) {
                return query.includes(
                    String(
                        word
                    )
                    .toUpperCase()
                );
            }
        );
    }

    /*----------------------------------
      Duty Status
    ----------------------------------*/
    if (
        hasKeyword(
            KEYWORDS.STAFF_DUTY_STATUS
        )
    ) {
        result.intent =
            INTENTS.STAFF_DUTY_STATUS;
        result.parameters.staff =
            profile;
        result.parameters.status =
            profile.assignment?.status || null;
        result.confidence =
            0.98;
        return result;
    }

    /*----------------------------------
      Duty Type
    ----------------------------------*/
    if (
        hasKeyword(
            KEYWORDS.STAFF_DUTY_TYPE
        )
    ) {
        result.intent =
            INTENTS.STAFF_DUTY_TYPE;
        result.parameters.staff =
            profile;
        result.parameters.dutyType =
            profile.assignment?.dutyType || null;
        result.confidence =
            0.98;
        return result;
    }

    /*----------------------------------
      Duty Started
    ----------------------------------*/
    if (
        hasKeyword(
            KEYWORDS.STAFF_DUTY_STARTED
        )
    ) {
        result.intent =
            INTENTS.STAFF_DUTY_STARTED;
        result.parameters.staff =
            profile;
        result.parameters.startedAt =
            profile.analytics?.startedAt ||
            null;
        result.confidence =
            0.98;
        return result;
    }

    /*----------------------------------
      Duty Ended
    ----------------------------------*/
    if (
        hasKeyword(
            KEYWORDS.STAFF_DUTY_ENDED
        )
    ) {
        result.intent =
            INTENTS.STAFF_DUTY_ENDED;
        result.parameters.staff =
            profile;
        result.parameters.endedAt =
            profile.analytics?.endedAt ||
            null;
        result.confidence =
            0.98;
        return result;
    }

    /*----------------------------------
      Assignment
    ----------------------------------*/
    if (
        hasKeyword(
            KEYWORDS.STAFF_ASSIGNMENT
        )
    ) {
        result.intent =
            INTENTS.STAFF_ASSIGNMENT;
        result.parameters.staff =
            profile;
        result.parameters.assignment =
            profile.assignment || null;
        result.parameters.assignedCompartment =
            profile.assignment?.assignedCompartment || null;
        result.confidence =
            0.98;
        return result;
    }

    /*----------------------------------
      Duty Active
    ----------------------------------*/
    if (
        hasKeyword(
            KEYWORDS.STAFF_DUTY_ACTIVE
        )
    ) {
        result.intent =
            INTENTS.STAFF_DUTY_ACTIVE;
        result.parameters.staff =
            profile;
        result.parameters.dutyActive =
            profile.assignment?.dutyActive || false;
        result.confidence =
            0.98;
        return result;
    }

  

    /*----------------------------------
      Last Duty
    ----------------------------------*/
    if (
        hasKeyword(
            KEYWORDS.STAFF_LAST_DUTY
        )
    ) {
        result.intent =
            INTENTS.STAFF_LAST_DUTY;
        result.parameters.staff =
            profile;
        result.parameters.lastDutyEnd =
            profile.assignment?.lastDutyEnd || null;
        result.confidence =
            0.96;
        return result;
    }

    /*----------------------------------
      Generic Duty
    ----------------------------------*/
    if (
        hasKeyword(
            KEYWORDS.STAFF_DUTY
        )
    ) {
        result.intent =
            INTENTS.STAFF_DUTY;
        result.parameters.staff =
            profile;
        result.parameters.duty =
            profile.assignment ||
            null;
        result.confidence =
            0.97;
        return result;
    }

    return result;
};

 /*=========================================================
 DETECT TEAM INTENT
=========================================================*/

StaffIntent.detectTeamIntent = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result ||

        !result.entities

    ) {

        return result;

    }

    const staff =

        result.entities.staff ||

        [];

    if (

        staff.length === 0

    ) {

        return result;

    }

    const profile =

        staff[0];

    const query =

        result.normalizedQuery;

    const INTENTS =

        StaffConstants.INTENTS;

    const KEYWORDS =

        StaffConstants.KEYWORDS;

    /*----------------------------------
      Helper
    ----------------------------------*/

    function hasKeyword(

        list

    ) {

        if (

            !Array.isArray(

                list

            )

        ) {

            return false;

        }

        return list.some(

            function (

                word

            ) {

                return query.includes(

                    String(

                        word

                    )

                    .toUpperCase()

                );

            }

        );

    }

    /*----------------------------------
      Team Leader
      (Specific before Generic)
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_LEADER

        )

    ) {

        result.intent =

            INTENTS.STAFF_LEADER;

        result.parameters.staff =

            profile;

        result.parameters.leader =

            profile.teamInfo?.leader ||

            null;

        result.confidence =

            0.98;

        return result;

    }

    /*----------------------------------
      Team
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_TEAM

        )

    ) {

        result.intent =

            INTENTS.STAFF_TEAM;

        result.parameters.staff =

            profile;

        result.parameters.team =

            profile.teamInfo?.team ||

            null;

        result.parameters.teamMembers =

            profile.teamInfo?.teamMembers ||

            [];

        result.confidence =

            0.97;

        return result;

    }

    return result;

};
 /*=========================================================
 DETECT ANALYTICS INTENT
=========================================================*/

StaffIntent.detectAnalyticsIntent = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result ||

        !result.entities

    ) {

        return result;

    }

    const staff =

        result.entities.staff ||

        [];

    if (

        staff.length === 0

    ) {

        return result;

    }

    const profile =

        staff[0];

    const query =

        result.normalizedQuery;

    const INTENTS =

        StaffConstants.INTENTS;

    const KEYWORDS =

        StaffConstants.KEYWORDS;

    /*----------------------------------
      Helper
    ----------------------------------*/

    function hasKeyword(

        list

    ) {

        if (

            !Array.isArray(

                list

            )

        ) {

            return false;

        }

        return list.some(

            function (

                word

            ) {

                return query.includes(

                    String(

                        word

                    )

                    .toUpperCase()

                );

            }

        );

    }

    /*----------------------------------
      Patrol Distance
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_DISTANCE

        )

    ) {

        result.intent =

            INTENTS.STAFF_DISTANCE;

        result.parameters.staff =

            profile;

        result.parameters.distanceKm =

            profile.analytics?.distanceKm ||

            0;

        result.confidence =

            0.98;

        return result;

    }

    /*----------------------------------
      Patrol Points
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_PATROL_POINTS

        )

    ) {

        result.intent =

            INTENTS.STAFF_PATROL_POINTS;

        result.parameters.staff =

            profile;

        result.parameters.pointCount =

            profile.analytics?.pointCount ||

            0;

        result.confidence =

            0.98;

        return result;

    }

    /*----------------------------------
      Patrol Started
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_PATROL_START

        )

    ) {

        result.intent =

            INTENTS.STAFF_PATROL_START;

        result.parameters.staff =

            profile;

        result.parameters.startedAt =

            profile.analytics?.startedAt ||

            null;

        result.confidence =

            0.98;

        return result;

    }

    /*----------------------------------
      Patrol Ended
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_PATROL_END

        )

    ) {

        result.intent =

            INTENTS.STAFF_PATROL_END;

        result.parameters.staff =

            profile;

        result.parameters.endedAt =

            profile.analytics?.endedAt ||

            null;

        result.confidence =

            0.98;

        return result;

    }

    /*----------------------------------
      Patrol Duration
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_PATROL_DURATION

        )

    ) {

        result.intent =

            INTENTS.STAFF_PATROL_DURATION;

        result.parameters.staff =

            profile;

        result.parameters.startedAt =

            profile.analytics?.startedAt ||

            null;

        result.parameters.endedAt =

            profile.analytics?.endedAt ||

            null;

        result.confidence =

            0.98;

        return result;

    }

    /*----------------------------------
      Complete Patrol Analytics
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_ANALYTICS

        )

    ) {

        result.intent =

            INTENTS.STAFF_ANALYTICS;

        result.parameters.staff =

            profile;

        result.parameters.analytics =

            profile.analytics ||

            null;

        result.confidence =

            0.97;

        return result;

    }

    return result;

};

 /*=========================================================
 DETECT STRENGTH INTENT
=========================================================*/
/*=========================================================
 DETECT SUMMARY / DIRECTORY INTENT
=========================================================*/

StaffIntent.detectSummaryIntent = function (

    result

) {

    if (

        !result ||

        !result.entities

    ) {

        return result;

    }

    const staff =

        result.entities.staff ||

        [];

    const query =

        result.normalizedQuery;

    const INTENTS =

        StaffConstants.INTENTS;

    const KEYWORDS =

        StaffConstants.KEYWORDS;

    function hasKeyword(

        list

    ) {

        if (

            !Array.isArray(list)

        ) {

            return false;

        }

        return list.some(

            word =>

                query.includes(

                    String(word)

                        .toUpperCase()

                )

        );

    };

    /*----------------------------------
      Staff Summary
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_SUMMARY

        )

    ) {

        result.intent =

            INTENTS.STAFF_SUMMARY;

        result.parameters.staff =

            staff;

        result.confidence =

            0.98;

        return result;

    }

    /*----------------------------------
      Jurisdiction Summary
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_JURISDICTION_SUMMARY

        )

    ) {

        result.intent =

            INTENTS.STAFF_JURISDICTION_SUMMARY;

        result.parameters.staff =

            staff;

        result.confidence =

            0.98;

        return result;

    }

    /*----------------------------------
      Designation Summary
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_DESIGNATION_SUMMARY

        )

    ) {

        result.intent =

            INTENTS.STAFF_DESIGNATION_SUMMARY;

        result.parameters.staff =

            staff;

        result.confidence =

            0.98;

        return result;

    }

    /*----------------------------------
      Circle Directory
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_CIRCLE_DIRECTORY

        )

    ) {

        result.intent =

            INTENTS.STAFF_CIRCLE_DIRECTORY;

        result.parameters.staff =

            staff;

        result.confidence =

            0.98;

        return result;

    }

    /*----------------------------------
      Division Directory
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_DIVISION_DIRECTORY

        )

    ) {

        result.intent =

            INTENTS.STAFF_DIVISION_DIRECTORY;

        result.parameters.staff =

            staff;

        result.confidence =

            0.98;

        return result;

    }

    /*----------------------------------
      Range Directory
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_RANGE_DIRECTORY

        )

    ) {

        result.intent =

            INTENTS.STAFF_RANGE_DIRECTORY;

        result.parameters.staff =

            staff;

        result.confidence =

            0.98;

        return result;

    }

    /*----------------------------------
      Beat Directory
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_BEAT_DIRECTORY

        )

    ) {

        result.intent =

            INTENTS.STAFF_BEAT_DIRECTORY;

        result.parameters.staff =

            staff;

        result.confidence =

            0.98;

        return result;

    }

    /*----------------------------------
      Designation Directory
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_DESIGNATION_DIRECTORY

        )

    ) {

        result.intent =

            INTENTS.STAFF_DESIGNATION_DIRECTORY;

        result.parameters.staff =

            staff;

        result.confidence =

            0.98;

        return result;

    }

    return result;

};
/*=========================================================
 DETECT STRENGTH INTENT
=========================================================*/

/*=========================================================
 DETECT STATUS / LIVE STAFF INTENT
=========================================================*/

StaffIntent.detectStatusIntent = function (

    result

) {

    if (

        !result ||

        !result.entities

    ) {

        return result;

    }

    const staff =

        result.entities.staff ||

        [];

    const query =

        result.normalizedQuery;

    const INTENTS =

        StaffConstants.INTENTS;

    const KEYWORDS =

        StaffConstants.KEYWORDS;

    function hasKeyword(list) {

        if (!Array.isArray(list)) {

            return false;

        }

        return list.some(

            word =>

                query.includes(

                    String(word).toUpperCase()

                )

        );

    }

    /*----------------------------------
      Active Count
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_ACTIVE_COUNT

        )

    ) {

        const active =

            staff.filter(

                s =>

                    s.assignment?.dutyActive === true

            );

        result.intent =

            INTENTS.STAFF_ACTIVE_COUNT;

        result.parameters.staff =

            active;

        result.parameters.count =

            active.length;

        result.confidence =

            0.98;

        return result;

    }

    /*----------------------------------
      Active List
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_ACTIVE_LIST

        )

    ) {

        result.intent =

            INTENTS.STAFF_ACTIVE_LIST;

        result.parameters.staff =

            staff.filter(

                s =>

                    s.assignment?.dutyActive === true

            );

        result.confidence =

            0.98;

        return result;

    }

    /*----------------------------------
      Inactive List
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_INACTIVE_LIST

        )

    ) {

        result.intent =

            INTENTS.STAFF_INACTIVE_LIST;

        result.parameters.staff =

            staff.filter(

                s =>

                    s.assignment?.dutyActive !== true

            );

        result.confidence =

            0.98;

        return result;

    }

    /*----------------------------------
      Duty Summary
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_DUTY_SUMMARY

        )

    ) {

        result.intent =

            INTENTS.STAFF_DUTY_SUMMARY;

        result.parameters.staff =

            staff;

        result.confidence =

            0.97;

        return result;

    }

    /*----------------------------------
      Team Leaders
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_TEAM_LEADER_LIST

        )

    ) {

        result.intent =

            INTENTS.STAFF_TEAM_LEADER_LIST;

        result.parameters.staff =

            staff.filter(

                s =>

                    s.identity?.role === "TEAM_LEADER"

            );

        result.confidence =

            0.97;

        return result;

    }

    /*----------------------------------
      Moving Staff
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_MOVING

        )

    ) {

        result.intent =

            INTENTS.STAFF_MOVING;

        result.parameters.staff =

            staff.filter(

                s =>

                    Number(

                        s.gps?.speed || 0

                    ) > 0

            );

        result.confidence =

            0.97;

        return result;

    }

    /*----------------------------------
      Stationary Staff
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_STATIONARY

        )

    ) {

        result.intent =

            INTENTS.STAFF_STATIONARY;

        result.parameters.staff =

            staff.filter(

                s =>

                    Number(

                        s.gps?.speed || 0

                    ) <= 0

            );

        result.confidence =

            0.97;

        return result;

    }

    return result;

};
/*=========================================================
 NEEDS AI
=========================================================*/
/*=========================================================
 DETECT CONTROL ROOM INTENT
=========================================================*/

StaffIntent.detectControlRoomIntent = function (

    result

) {

    if (

        !result ||

        !result.entities

    ) {

        return result;

    }

    const staff =

        result.entities.staff ||

        [];

    const query =

        result.normalizedQuery;

    const INTENTS =

        StaffConstants.INTENTS;

    function contains(

        ...phrases

    ) {

        return phrases.some(

            p =>

                query.includes(

                    p.toUpperCase()

                )

        );

    }

    /*----------------------------------
      Who Is On Duty
    ----------------------------------*/

    if (

        contains(

            "WHO IS ON DUTY",

            "WHO ARE ON DUTY",

            "STAFF ON DUTY",

            "ON DUTY STAFF",

            "CURRENT DUTY STAFF",

            "CURRENTLY ON DUTY"

        )

    ) {

        result.intent =

            INTENTS.WHO_IS_ON_DUTY;

        result.parameters.staff =

            staff.filter(

                s =>

                    s.assignment?.dutyActive === true

            );

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Who Is Patrolling
    ----------------------------------*/

    if (

        contains(

            "WHO IS PATROLLING",

            "WHO ARE PATROLLING",

            "PATROLLING STAFF",

            "STAFF PATROLLING",

            "CURRENTLY PATROLLING",

            "ON PATROL",

            "PATROL STAFF"

        )

    ) {

        result.intent =

            INTENTS.WHO_IS_PATROLLING;

        result.parameters.staff =

            staff.filter(

                s =>

                    s.assignment?.dutyActive === true &&

                    String(

                        s.assignment?.dutyType ||

                        ""

                    ).toUpperCase().includes(

                        "PATROL"

                    )

            );

        result.confidence =

            0.99;

        return result;

    }

    return result;

};
/*=========================================================
 DETERMINE AI REQUIREMENT
=========================================================*/

StaffIntent.needsAI = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result

    ) {

        return true;

    }

    const CONF =

        StaffConstants.CONFIDENCE;

    /*----------------------------------
      Existing Decision
    ----------------------------------*/

    if (

        result.requiresAI === true

    ) {

        return true;

    }

    /*----------------------------------
      Intent Missing
    ----------------------------------*/

    if (

        !result.intent

    ) {

        result.warnings.push(

            "Intent not detected."

        );

        return true;

    }


 /*----------------------------------
  GLOBAL LOCAL INTENTS
----------------------------------*/

switch (

    result.intent

) {

    case StaffConstants.INTENTS.WHO_IS_ON_DUTY:

    case StaffConstants.INTENTS.WHO_IS_PATROLLING:

    case StaffConstants.INTENTS.STAFF_ACTIVE_COUNT:

    case StaffConstants.INTENTS.STAFF_ACTIVE_LIST:

    case StaffConstants.INTENTS.STAFF_INACTIVE_LIST:

    case StaffConstants.INTENTS.STAFF_DUTY_SUMMARY:

    case StaffConstants.INTENTS.STAFF_TEAM_LEADER_LIST:

    case StaffConstants.INTENTS.STAFF_MOVING:

    case StaffConstants.INTENTS.STAFF_STATIONARY:

    case StaffConstants.INTENTS.STAFF_SUMMARY:

    case StaffConstants.INTENTS.STAFF_JURISDICTION_SUMMARY:

    case StaffConstants.INTENTS.STAFF_DESIGNATION_SUMMARY:

    case StaffConstants.INTENTS.STAFF_CIRCLE_DIRECTORY:

    case StaffConstants.INTENTS.STAFF_DIVISION_DIRECTORY:

    case StaffConstants.INTENTS.STAFF_RANGE_DIRECTORY:

    case StaffConstants.INTENTS.STAFF_BEAT_DIRECTORY:

    case StaffConstants.INTENTS.STAFF_DESIGNATION_DIRECTORY:

        return false;

}
    /*----------------------------------
      Staff Missing
    ----------------------------------*/

    if (

        result.entities.staff.length === 0

    ) {

        result.warnings.push(

            "No staff entity found."

        );

        return true;

    }

    /*----------------------------------
      Too Many Matches
    ----------------------------------*/

    if (

        result.entities.staff.length > 10

    ) {

        result.warnings.push(

            "Too many matching staff."

        );

        return true;

    }

    /*----------------------------------
      Confidence
    ----------------------------------*/

    if (

        result.confidence <

        CONF.AI_FALLBACK

    ) {

        result.warnings.push(

            "Confidence below AI threshold."

        );

        return true;

    }

    /*----------------------------------
      Unknown Intent
    ----------------------------------*/

    if (

        result.intent ===

        "UNKNOWN"

    ) {

        result.warnings.push(

            "Unknown intent."

        );

        return true;

    }

    /*----------------------------------
      Empty Parameters
    ----------------------------------*/

    if (

        result.parameters &&

        Object.keys(

            result.parameters

        ).length === 0

    ) {

        result.warnings.push(

            "No routing parameters."

        );

        return true;

    }

    /*----------------------------------
      Reasoning Queries
    ----------------------------------*/

    const query =

        result.normalizedQuery;

    if (

        query.includes("WHY") ||

        query.includes("HOW") ||

        query.includes("EXPLAIN") ||

        query.includes("COMPARE") ||

        query.includes("RECOMMEND") ||

        query.includes("SUGGEST") ||

        query.includes("ANALYSE") ||

        query.includes("ANALYZE")

    ) {

        result.warnings.push(

            "Reasoning query."

        );

        return true;

    }

    /*----------------------------------
      Local Intents
    ----------------------------------*/

    switch (

        result.intent

    ) {

        /* Profile */

        case StaffConstants.INTENTS.STAFF_PROFILE:

        case StaffConstants.INTENTS.STAFF_CONTACT:

        case StaffConstants.INTENTS.STAFF_ROLE:

        case StaffConstants.INTENTS.STAFF_DESIGNATION:

        /* Posting */

        case StaffConstants.INTENTS.STAFF_POSTING:

        case StaffConstants.INTENTS.STAFF_CIRCLE:

        case StaffConstants.INTENTS.STAFF_DIVISION:

        case StaffConstants.INTENTS.STAFF_RANGE:

        case StaffConstants.INTENTS.STAFF_BEAT:

        

        /* Location */

        case StaffConstants.INTENTS.STAFF_LOCATION:

        case StaffConstants.INTENTS.STAFF_GPS:

        /* Duty */

        case StaffConstants.INTENTS.STAFF_DUTY:

        case StaffConstants.INTENTS.STAFF_DUTY_STATUS:

        case StaffConstants.INTENTS.STAFF_DUTY_TYPE:

        case StaffConstants.INTENTS.STAFF_DUTY_STARTED:

        case StaffConstants.INTENTS.STAFF_DUTY_ENDED:

        case StaffConstants.INTENTS.STAFF_DUTY_ACTIVE:

        case StaffConstants.INTENTS.STAFF_LAST_DUTY:

        case StaffConstants.INTENTS.STAFF_ASSIGNMENT:

        /* Team */

        case StaffConstants.INTENTS.STAFF_TEAM:

        case StaffConstants.INTENTS.STAFF_LEADER:

        /* GPS */

        case StaffConstants.INTENTS.STAFF_SPEED:

        case StaffConstants.INTENTS.STAFF_HEADING:

        case StaffConstants.INTENTS.STAFF_ACCURACY:

        /* Patrol Analytics */

        case StaffConstants.INTENTS.STAFF_ANALYTICS:

        case StaffConstants.INTENTS.STAFF_DISTANCE:

        case StaffConstants.INTENTS.STAFF_PATROL_POINTS:

        case StaffConstants.INTENTS.STAFF_PATROL_START:

        case StaffConstants.INTENTS.STAFF_PATROL_END:

        case StaffConstants.INTENTS.STAFF_PATROL_DURATION:

        /* Strength */

       case StaffConstants.INTENTS.STAFF_ACTIVE_COUNT:

case StaffConstants.INTENTS.STAFF_ACTIVE_LIST:

case StaffConstants.INTENTS.STAFF_INACTIVE_LIST:

case StaffConstants.INTENTS.STAFF_DUTY_SUMMARY:

case StaffConstants.INTENTS.STAFF_TEAM_LEADER_LIST:

case StaffConstants.INTENTS.STAFF_MOVING:

case StaffConstants.INTENTS.STAFF_STATIONARY:

        /* Control Room */

        case StaffConstants.INTENTS.WHO_IS_ON_DUTY:

        case StaffConstants.INTENTS.WHO_IS_PATROLLING:

            return false;

    }

    /*----------------------------------
      Default
    ----------------------------------*/

    result.warnings.push(

        "Fallback to AI."

    );

    return true;

};

 /*=========================================================
 ROUTE
=========================================================*/

/*=========================================================
 ROUTE STAFF INTENT
=========================================================*/

/*=========================================================
 ROUTE INTENT
=========================================================*/

StaffIntent.route = async function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result

    ) {

        throw new Error(

            "Intent result missing."

        );

    }

    /*----------------------------------
      AI Fallback
    ----------------------------------*/

    if (

        result.requiresAI

    ) {

        return {

            success: true,

            ai: true,

            action: "AI",

            result

        };

    }

    /*----------------------------------
      Router
    ----------------------------------*/

    const router =

        window.GreenGuardAI
            ?.StaffRouter;

    if (

        !router

    ) {

        throw new Error(

            "StaffRouter not loaded."

        );

    }

    if (

        typeof router.route !==

        "function"

    ) {

        throw new Error(

            "StaffRouter.route() not found."

        );

    }

    /*----------------------------------
      Delegate
    ----------------------------------*/

    return await router.route(

        result

    );

};
    /*=========================================================
 DETECT STAFF INTENT
=========================================================*/
/*=========================================================
 DETECT STAFF INTENT (ORCHESTRATOR)
=========================================================*/

StaffIntent.detectStaffIntent = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result ||

        !result.entities

    ) {

        return result;

    }

    const staff =

        result.entities.staff ||

        [];

    if (

        staff.length === 0

    ) {

        return result;

    }

    console.log(

        "=============================="

    );

    console.log(

        "detectStaffIntent() START"

    );

    console.log(

        "Query:",

        result.normalizedQuery

    );

    console.log(

        "Staff:",

        staff

    );

    console.log(

        "=============================="

    );

    const INTENTS =

        StaffConstants.INTENTS;

    /*----------------------------------
      Debug Helper
    ----------------------------------*/

    function debugParameters(

        label

    ) {

        console.log(

            "==========",

            label,

            "=========="

        );

        console.log(

            "Result Frozen:",

            Object.isFrozen(

                result

            )

        );

        console.log(

            "Parameters:",

            result.parameters

        );

        console.log(

            "Parameters Frozen:",

            Object.isFrozen(

                result.parameters

            )

        );

        console.log(

            "Parameters Extensible:",

            Object.isExtensible(

                result.parameters

            )

        );

        console.log(

            "Staff Descriptor:",

            Object.getOwnPropertyDescriptor(

                result.parameters,

                "staff"

            )

        );

    }

    /*----------------------------------
      Profile
    ----------------------------------*/

    result =

        StaffIntent.detectProfileIntent(

            result

        );

    if (

        result.intent === INTENTS.STAFF_PROFILE ||

        result.intent === INTENTS.STAFF_CONTACT ||

        result.intent === INTENTS.STAFF_ROLE ||

        result.intent === INTENTS.STAFF_DESIGNATION

    ) {

        debugParameters(

            result.intent

        );

        return result;

    }

    /*----------------------------------
      Posting
    ----------------------------------*/

    result =

        StaffIntent.detectPostingIntent(

            result

        );

    if (

        result.intent === INTENTS.STAFF_POSTING ||

        result.intent === INTENTS.STAFF_CIRCLE ||

        result.intent === INTENTS.STAFF_DIVISION ||

        result.intent === INTENTS.STAFF_RANGE ||

        result.intent === INTENTS.STAFF_BEAT 

       

    ) {

        debugParameters(

            result.intent

        );

        return result;

    }

    /*----------------------------------
      Duty
    ----------------------------------*/

    result =

        StaffIntent.detectDutyIntent(

            result

        );

    if (

        result.intent === INTENTS.STAFF_DUTY ||

        result.intent === INTENTS.STAFF_DUTY_STATUS ||

        result.intent === INTENTS.STAFF_DUTY_TYPE ||

        result.intent === INTENTS.STAFF_DUTY_STARTED ||

        result.intent === INTENTS.STAFF_DUTY_ENDED ||

        result.intent === INTENTS.STAFF_DUTY_ACTIVE ||

        result.intent === INTENTS.STAFF_LAST_DUTY ||

        result.intent === INTENTS.STAFF_ASSIGNMENT ||

        result.intent === INTENTS.WHO_IS_ON_DUTY ||

        result.intent === INTENTS.WHO_IS_PATROLLING

    ) {

        debugParameters(

            result.intent

        );

        return result;

    }

    /*----------------------------------
      Team
    ----------------------------------*/

    result =

        StaffIntent.detectTeamIntent(

            result

        );

    if (

        result.intent === INTENTS.STAFF_TEAM ||

        result.intent === INTENTS.STAFF_LEADER

    ) {

        debugParameters(

            result.intent

        );

        return result;

    }

    /*----------------------------------
      GPS
    ----------------------------------*/

    result =

        StaffIntent.detectGPSIntent(

            result

        );

    if (

        result.intent === INTENTS.STAFF_LOCATION ||

        result.intent === INTENTS.STAFF_GPS ||

        result.intent === INTENTS.STAFF_SPEED ||

        result.intent === INTENTS.STAFF_HEADING ||

        result.intent === INTENTS.STAFF_ACCURACY

    ) {

        debugParameters(

            result.intent

        );

        return result;

    }

    /*----------------------------------
      Patrol Analytics
    ----------------------------------*/

    result =

        StaffIntent.detectAnalyticsIntent(

            result

        );

    if (

        result.intent === INTENTS.STAFF_ANALYTICS ||

        result.intent === INTENTS.STAFF_DISTANCE ||

        result.intent === INTENTS.STAFF_PATROL_POINTS ||

        result.intent === INTENTS.STAFF_PATROL_START ||

        result.intent === INTENTS.STAFF_PATROL_END ||

        result.intent === INTENTS.STAFF_PATROL_DURATION

    ) {

        debugParameters(

            result.intent

        );

        return result;

    }
/*----------------------------------
  Summary
----------------------------------*/

result =

    StaffIntent.detectSummaryIntent(

        result

    );

if (

    result.intent === INTENTS.STAFF_SUMMARY ||

    result.intent === INTENTS.STAFF_JURISDICTION_SUMMARY ||

    result.intent === INTENTS.STAFF_DESIGNATION_SUMMARY ||

    result.intent === INTENTS.STAFF_CIRCLE_DIRECTORY ||

    result.intent === INTENTS.STAFF_DIVISION_DIRECTORY ||

    result.intent === INTENTS.STAFF_RANGE_DIRECTORY ||

    result.intent === INTENTS.STAFF_BEAT_DIRECTORY ||

    result.intent === INTENTS.STAFF_DESIGNATION_DIRECTORY

) {

    debugParameters(

        result.intent

    );

    return result;

}
    /*----------------------------------
      Strength
    ----------------------------------*/

   result =

    StaffIntent.detectStatusIntent(

        result

    );

    if (

        result.intent === INTENTS.STAFF_ACTIVE_COUNT ||

result.intent === INTENTS.STAFF_ACTIVE_LIST ||

result.intent === INTENTS.STAFF_INACTIVE_LIST ||

result.intent === INTENTS.STAFF_DUTY_SUMMARY ||

result.intent === INTENTS.STAFF_TEAM_LEADER_LIST ||

result.intent === INTENTS.STAFF_MOVING ||

result.intent === INTENTS.STAFF_STATIONARY

    ) {

        debugParameters(

            result.intent

        );

        return result;

    }
/*----------------------------------
  Control Room
----------------------------------*/

result =

    StaffIntent.detectControlRoomIntent(

        result

    );

if (

    result.intent ===

        INTENTS.WHO_IS_ON_DUTY ||

    result.intent ===

        INTENTS.WHO_IS_PATROLLING

) {

    debugParameters(

        result.intent

    );

    return result;

}
    /*----------------------------------
      Search Fallback
    ----------------------------------*/

    result.intent =

        INTENTS.STAFF_SEARCH;

    result.parameters.staff =

        staff[0];

    result.confidence =

        Math.max(

            result.confidence,

            0.80

        );

    debugParameters(

        "STAFF_SEARCH"

    );

    return result;

};

 /*=========================================================
 DETECT PROFILE INTENT
=========================================================*/

StaffIntent.detectProfileIntent = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result ||

        !result.entities

    ) {

        return result;

    }

    const staff =

        result.entities.staff ||

        [];

    if (

        staff.length === 0

    ) {

        return result;

    }

    const profile =

        staff[0];

    const query =

        result.normalizedQuery;

    const INTENTS =

        StaffConstants.INTENTS;

    const KEYWORDS =

        StaffConstants.KEYWORDS;

    /*----------------------------------
      Helper
    ----------------------------------*/

    function hasKeyword(

        list

    ) {

        if (

            !Array.isArray(

                list

            )

        ) {

            return false;

        }

        return list.some(

            function (

                word

            ) {

                return query.includes(

                    String(

                        word

                    )

                    .toUpperCase()

                );

            }

        );

    }

    /*----------------------------------
      Staff Profile
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_PROFILE

        )

    ) {

        result.intent =

            INTENTS.STAFF_PROFILE;

        result.parameters.staff =

            profile;

        result.parameters.profile =

            profile.identity;

        result.confidence =

            Math.max(

                result.confidence,

                0.98

            );

        return result;

    }

    /*----------------------------------
      Contact
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_CONTACT

        )

    ) {

        result.intent =

            INTENTS.STAFF_CONTACT;

        result.parameters.staff =

            profile;

        result.parameters.phone =

            profile.identity?.phone ||

            null;

        result.parameters.email =

            profile.identity?.email ||

            null;

        result.confidence =

            Math.max(

                result.confidence,

                0.98

            );

        return result;

    }

    /*----------------------------------
      Role
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_ROLE

        )

    ) {

        result.intent =

            INTENTS.STAFF_ROLE;

        result.parameters.staff =

            profile;

        result.parameters.role =

            profile.identity?.role ||

            null;

        result.confidence =

            Math.max(

                result.confidence,

                0.97

            );

        return result;

    }

    /*----------------------------------
      Designation
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_DESIGNATION

        )

    ) {

        result.intent =

            INTENTS.STAFF_DESIGNATION;

        result.parameters.staff =

            profile;

        result.parameters.designation =

            profile.identity?.designation ||

            null;

        result.confidence =

            Math.max(

                result.confidence,

                0.97

            );

        return result;

    }

    return result;

};
 /*=========================================================
 DETECT GPS INTENT
=========================================================*/

StaffIntent.detectGPSIntent = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result ||

        !result.entities

    ) {

        return result;

    }

    const staff =

        result.entities.staff ||

        [];

    if (

        staff.length === 0

    ) {

        return result;

    }

    const profile =

        staff[0];

    const query =

        result.normalizedQuery;

    const INTENTS =

        StaffConstants.INTENTS;

    const KEYWORDS =

        StaffConstants.KEYWORDS;

    /*----------------------------------
      Helper
    ----------------------------------*/

    function hasKeyword(

        list

    ) {

        if (

            !Array.isArray(

                list

            )

        ) {

            return false;

        }

        return list.some(

            function (

                word

            ) {

                return query.includes(

                    String(

                        word

                    )

                    .toUpperCase()

                );

            }

        );

    }

    /*----------------------------------
      Staff Location
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_LOCATION

        )

    ) {

        result.intent =

            INTENTS.STAFF_LOCATION;

        result.parameters.staff =

            profile;

        result.parameters.location =

            profile.location ||

            null;

        result.confidence =

            Math.max(

                result.confidence,

                0.98

            );

        return result;

    }

    /*----------------------------------
      GPS
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_GPS

        )

    ) {

        result.intent =

            INTENTS.STAFF_GPS;

        result.parameters.staff =

            profile;

        result.parameters.gps =

            profile.gps ||

            null;

        result.confidence =

            Math.max(

                result.confidence,

                0.98

            );

        return result;

    }

    /*----------------------------------
      Speed
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_SPEED

        )

    ) {

        result.intent =

            INTENTS.STAFF_SPEED;

        result.parameters.staff =

            profile;

        result.parameters.speed =

            profile.gps?.speed ??

            null;

        result.confidence =

            Math.max(

                result.confidence,

                0.97

            );

        return result;

    }

    /*----------------------------------
      Heading
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_HEADING

        )

    ) {

        result.intent =

            INTENTS.STAFF_HEADING;

        result.parameters.staff =

            profile;

        result.parameters.heading =

            profile.gps?.heading ??

            null;

        result.confidence =

            Math.max(

                result.confidence,

                0.97

            );

        return result;

    }

    /*----------------------------------
      Accuracy
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_ACCURACY

        )

    ) {

        result.intent =

            INTENTS.STAFF_ACCURACY;

        result.parameters.staff =

            profile;

        result.parameters.accuracy =

            profile.gps?.accuracy ??

            null;

        result.confidence =

            Math.max(

                result.confidence,

                0.97

            );

        return result;

    }

    return result;

};
 /*=========================================================
 GLOBAL INTENT DETECTOR
=========================================================*/

StaffIntent.detectGlobalIntent = function (

    result

) {

    console.group(

        "🌍 GLOBAL INTENT"

    );

    console.log(

        "Incoming:",

        result.intent

    );

    /*----------------------------------
      CONTROL ROOM
    ----------------------------------*/

    result =

        StaffIntent.detectControlRoomIntent(

            result

        );

    if (

        result.intent

    ) {

        console.log(

            "✅ Control Room:",

            result.intent

        );

        console.groupEnd();

        return result;

    }

    /*----------------------------------
      STATUS
    ----------------------------------*/

    result =

        StaffIntent.detectStatusIntent(

            result

        );

    if (

        result.intent

    ) {

        console.log(

            "✅ Status:",

            result.intent

        );

        console.groupEnd();

        return result;

    }

    /*----------------------------------
      SUMMARY
    ----------------------------------*/

    result =

        StaffIntent.detectSummaryIntent(

            result

        );

    if (

        result.intent

    ) {

        console.log(

            "✅ Summary:",

            result.intent

        );

        console.groupEnd();

        return result;

    }

    /*----------------------------------
      ANALYTICS
    ----------------------------------*/

    result =

        StaffIntent.detectAnalyticsIntent(

            result

        );

    if (

        result.intent

    ) {

        console.log(

            "✅ Analytics:",

            result.intent

        );

        console.groupEnd();

        return result;

    }

    /*----------------------------------
      DIRECTORY
    ----------------------------------*/

    result =

        StaffIntent.detectDirectoryIntent(

            result

        );

    if (

        result.intent

    ) {

        console.log(

            "✅ Directory:",

            result.intent

        );

        console.groupEnd();

        return result;

    }

    console.log(

        "❌ No Global Intent"

    );

    console.groupEnd();

    return result;

};
 /*=========================================================
 DIRECTORY INTENT
=========================================================*/

StaffIntent.detectDirectoryIntent = function (

    result

) {

    if (

        !result ||

        !result.entities

    ) {

        return result;

    }

    const staff =

        result.entities.staff ||

        [];

    const query =

        result.normalizedQuery ||

        "";

    const INTENTS =

        StaffConstants.INTENTS;

    const KEYWORDS =

        StaffConstants.KEYWORDS;

    function hasKeyword(

        list

    ) {

        if (

            !Array.isArray(

                list

            )

        ) {

            return false;

        }

        return list.some(

            function (

                word

            ) {

                return query.includes(

                    String(

                        word

                    ).toUpperCase()

                );

            }

        );

    }

    /*----------------------------------
      Circle Directory
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_CIRCLE_DIRECTORY

        )

    ) {

        result.intent =

            INTENTS.STAFF_CIRCLE_DIRECTORY;

        result.parameters.staff =

            staff;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Division Directory
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_DIVISION_DIRECTORY

        )

    ) {

        result.intent =

            INTENTS.STAFF_DIVISION_DIRECTORY;

        result.parameters.staff =

            staff;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Range Directory
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_RANGE_DIRECTORY

        )

    ) {

        result.intent =

            INTENTS.STAFF_RANGE_DIRECTORY;

        result.parameters.staff =

            staff;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Beat Directory
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_BEAT_DIRECTORY

        )

    ) {

        result.intent =

            INTENTS.STAFF_BEAT_DIRECTORY;

        result.parameters.staff =

            staff;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Designation Directory
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_DESIGNATION_DIRECTORY

        )

    ) {

        result.intent =

            INTENTS.STAFF_DESIGNATION_DIRECTORY;

        result.parameters.staff =

            staff;

        result.confidence =

            0.99;

        return result;

    }

    return result;

};
 /*=========================================================
 INITIALIZE
=========================================================*/

StaffIntent.initialize =

function () {

    StaffIntent.loaded =

        true;

    StaffIntent.loading =

        false;

    return true;

};

/*=========================================================
 CLEAR CACHE
=========================================================*/

StaffIntent.clear =

function () {

    StaffIntent.cache.clear();

    StaffIntent.lastResult =

        null;

    StaffIntent.lastQuery =

        "";

};

/*=========================================================
 IS LOADED
=========================================================*/

StaffIntent.isLoaded =

function () {

    return StaffIntent.loaded;

};

/*=========================================================
 REGISTER
=========================================================*/

GG.StaffIntent =

    StaffIntent;

console.log(

    "%cStaff Intent Loaded",

    "color:#0a7d00;font-weight:bold;"

);

})(window);
