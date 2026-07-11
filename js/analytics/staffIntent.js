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

    /*----------------------------------
      Original Query
    ----------------------------------*/

    const originalQuery =

        typeof query ===

        "string"

            ? query

            : "";

    /*----------------------------------
      Normalized Query
    ----------------------------------*/

    const normalizedQuery =

        originalQuery

            .trim()

            .toUpperCase();

    /*----------------------------------
      Intent Result
    ----------------------------------*/

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
  Diagnostics
----------------------------------*/

warnings: [],

errors: [],
        /*----------------------------------
          Keywords
        ----------------------------------*/

        keywords: [],

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
 DETECT DESIGNATION INTENT
=========================================================*/

StaffIntent.detectDesignationIntent = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result ||

        result.intent ||

        !result.entities

    ) {

        return result;

    }

    /*----------------------------------
      Aggregate Guard
    ----------------------------------*/

    if (

        result.parameters?.isAggregate

    ) {

        return result;

    }

    const staff =

        result.entities.staff ||

        [];

    if (

        staff.length !== 1

    ) {

        return result;

    }

    const profile =

        staff[0];

    const query =

        String(

            result.normalizedQuery ||

            ""

        )

        .trim()

        .toUpperCase();

    if (

        query.length === 0

    ) {

        return result;

    }

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

            profile.identity?.designation ??

            profile.designation ??

            null;

        result.parameters.designationCode =

            profile.identity?.designationCode ??

            profile.designationCode ??

            null;

        result.parameters.designationName =

            profile.identity?.designationName ??

            profile.designationName ??

            profile.identity?.designation ??

            profile.designation ??

            null;

        result.confidence =

            Math.max(

                result.confidence,

                0.99

            );

        return result;

    }

    return result;

};
/*=========================================================
 DETECT
 Master Intent Detection
=========================================================*/
 StaffIntent.detectMovementIntent = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result ||

        result.intent

    ) {

        return result;

    }

    const query =

        String(

            result.normalizedQuery ||

            ""

        )

        .trim()

        .toUpperCase();

    const INTENTS =

        StaffConstants.INTENTS;

    const parameters =

        result.parameters ||

        {};

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

                keyword

            ) {

                keyword =

                    String(

                        keyword

                    )

                    .trim()

                    .toUpperCase();

                return (

                    keyword !== "" &&

                    query.includes(

                        keyword

                    )

                );

            }

        );

    }

    /*----------------------------------
      Moving
    ----------------------------------*/

    if (

        hasKeyword(

            StaffConstants.KEYWORDS.STAFF_MOVING

        )

    ) {

        parameters.moving =

            true;

        result.parameters =

            parameters;

        result.intent =

            INTENTS.STAFF_MOVING;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Stationary
    ----------------------------------*/

    if (

        hasKeyword(

            StaffConstants.KEYWORDS.STAFF_STATIONARY

        )

    ) {

        parameters.stationary =

            true;

        result.parameters =

            parameters;

        result.intent =

            INTENTS.STAFF_STATIONARY;

        result.confidence =

            0.99;

        return result;

    }

    return result;

};
 /*=========================================================
 DETECT DUTY STATUS INTENT
=========================================================*/

StaffIntent.detectDutyStatusIntent = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result ||

        result.intent ||

        !result.entities

    ) {

        return result;

    }

    /*----------------------------------
      Aggregate Guard
    ----------------------------------*/

    if (

        result.parameters?.isAggregate

    ) {

        return result;

    }

    const staff =

        result.entities.staff ||

        [];

    if (

        staff.length !== 1

    ) {

        return result;

    }

    const profile =

        staff[0];

    const query =

        String(

            result.normalizedQuery ||

            ""

        )

        .trim()

        .toUpperCase();

    if (

        query === ""

    ) {

        return result;

    }

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
      Match
    ----------------------------------*/

    if (

        !hasKeyword(

            KEYWORDS.STAFF_DUTY_STATUS

        )

    ) {

        return result;

    }

    /*----------------------------------
      Intent
    ----------------------------------*/

    result.intent =

        INTENTS.STAFF_DUTY_STATUS;

    /*----------------------------------
      Parameters
    ----------------------------------*/

    result.parameters =

        result.parameters ||

        {};

    result.parameters.staff =

        profile;

    result.parameters.dutyStatus =

        profile.assignment?.dutyStatus ??

        null;

    result.parameters.dutyActive =

        profile.assignment?.dutyActive ??

        null;

    result.parameters.dutyStartedAt =

        profile.assignment?.dutyStartedAt ??

        null;

    result.parameters.dutyEndedAt =

        profile.assignment?.dutyEndedAt ??

        null;

    /*----------------------------------
      Confidence
    ----------------------------------*/

    result.confidence =

        Math.max(

            result.confidence ||

            0,

            0.99

        );

    return result;

};
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
/*=========================================================
 DETECT ROLE INTENT
=========================================================*/

StaffIntent.detectRoleIntent = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result ||

        result.intent ||

        !result.entities

    ) {

        return result;

    }

    /*----------------------------------
      Aggregate Guard
    ----------------------------------*/

    if (

        result.parameters?.isAggregate

    ) {

        return result;

    }

    const staff =

        result.entities.staff ||

        [];

    if (

        staff.length !== 1

    ) {

        return result;

    }

    const profile =

        staff[0];

    const query =

        String(

            result.normalizedQuery ||

            ""

        )

        .trim()

        .toUpperCase();

    if (

        query.length === 0

    ) {

        return result;

    }

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

            profile.identity?.role ??

            profile.role ??

            null;

        result.parameters.roles =

            profile.identity?.roles ??

            profile.roles ??

            [];

        result.confidence =

            Math.max(

                result.confidence,

                0.99

            );

        return result;

    }

    return result;

};

 
 /*=========================================================
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

    result.parameters?.isAggregate

) {

    return result;

}
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

StaffIntent.extractPostingParameters = function (

    result

) {

    if (

        !result ||

        !result.entities

    ) {

        return result;

    }

    if (

        !result.parameters

    ) {

        result.parameters = {};

    }

    (

        result.entities.posting ||

        []

    ).forEach(

        function (

            posting

        ) {

            switch (

                posting.type

            ) {

                case "circle":

                    result.parameters.circle =

                        posting.value;

                    break;

                case "division":

                    result.parameters.division =

                        posting.value;

                    break;

                case "range":

                    result.parameters.range =

                        posting.value;

                    break;

                case "beat":

                    result.parameters.beat =

                        posting.value;

                    break;

                case "compartment":

                    result.parameters.compartment =

                        posting.value;

                    break;

            }

        }

    );

    return result;

};
 /*=========================================================
 DETECT DUTY INTENT
=========================================================*/

StaffIntent.detectDutyIntent = function (
    result
) {
    if (
        !result ||
        result.intent ||
        !result.entities
    ) {
        return result;
    }

    const query =
        String(
            result.normalizedQuery ||
            ""
        )
        .toUpperCase();

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
                keyword
            ) {
                keyword =
                    String(
                        keyword
                    )
                    .trim()
                    .toUpperCase();
                return (
                    keyword !== "" &&
                    query.includes(
                        keyword
                    )
                );
            }
        );
    }

    const INTENTS =
        StaffConstants.INTENTS;
    const parameters =
        result.parameters ||
        {};
    const staff =
        result.entities.staff ||
        [];
    const single =
        parameters.isSingle === true;

    /*----------------------------------
      Aggregate
    ----------------------------------*/

    /* Duty Summary */
    if (
        hasKeyword(
            StaffConstants.KEYWORDS.STAFF_DUTY_SUMMARY
        )
    ) {
        result.intent =
            INTENTS.STAFF_DUTY_SUMMARY;
        result.confidence =
            0.99;
        return result;
    }

    if (
        hasKeyword(
            StaffConstants.KEYWORDS.STAFF_ACTIVE_LIST
        )
    ) {
        parameters.dutyActive =
            true;
        result.parameters =
            parameters;
        result.intent =
            INTENTS.STAFF_ACTIVE_LIST;
        result.confidence =
            0.99;
        return result;
    }

    if (
        hasKeyword(
            StaffConstants.KEYWORDS.STAFF_INACTIVE_LIST
        )
    ) {
        parameters.dutyActive =
            false;
        result.parameters =
            parameters;
        result.intent =
            INTENTS.STAFF_INACTIVE_LIST;
        result.confidence =
            0.99;
        return result;
    }

    if (
        hasKeyword(
            StaffConstants.KEYWORDS.STAFF_ACTIVE_COUNT
        )
    ) {
        parameters.dutyActive =
            true;
        result.parameters =
            parameters;
        result.intent =
            INTENTS.STAFF_ACTIVE_COUNT;
        result.confidence =
            0.99;
        return result;
    }

    /*----------------------------------
      Single Staff
    ----------------------------------*/

    if (
        single
    ) {
        result.parameters.staff =
            staff[0];

        /* Duty Started */
        if (
            hasKeyword(
                StaffConstants.KEYWORDS.STAFF_DUTY_STARTED
            )
        ) {
            result.intent =
                INTENTS.STAFF_DUTY_STARTED;
            result.confidence =
                0.99;
            return result;
        }

        /* Duty Ended */
        if (
            hasKeyword(
                StaffConstants.KEYWORDS.STAFF_DUTY_ENDED
            )
        ) {
            result.intent =
                INTENTS.STAFF_DUTY_ENDED;
            result.confidence =
                0.99;
            return result;
        }

        /* Duty Type */
        if (
            hasKeyword(
                StaffConstants.KEYWORDS.STAFF_DUTY_TYPE
            )
        ) {
            result.intent =
                INTENTS.STAFF_DUTY_TYPE;
            result.confidence =
                0.99;
            return result;
        }

        /* Assignment */
        if (
            hasKeyword(
                StaffConstants.KEYWORDS.STAFF_ASSIGNMENT
            )
        ) {
            result.intent =
                INTENTS.STAFF_ASSIGNMENT;
            result.confidence =
                0.99;
            return result;
        }

        /* Duty Status */
        if (
            hasKeyword(
                StaffConstants.KEYWORDS.STAFF_DUTY_STATUS
            )
        ) {
            result.intent =
                INTENTS.STAFF_DUTY_STATUS;
            result.confidence =
                0.99;
            return result;
        }

        /* General Duty */
        if (
            hasKeyword(
                StaffConstants.KEYWORDS.STAFF_DUTY
            )
        ) {
            result.intent =
                INTENTS.STAFF_DUTY;
            result.confidence =
                0.99;
            return result;
        }
    }

    return result;
};
 /*=========================================================
 DETECT TEAM INTENT
=========================================================*/

StaffIntent.detectTeamIntent = function (
    result
) {

    if (
        !result ||
        result.intent ||
        !result.entities
    ) {
        return result;
    }

    const query =
        String(
            result.normalizedQuery ||
            ""
        )
        .toUpperCase();

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
                keyword
            ) {

                keyword =
                    String(
                        keyword
                    )
                    .trim()
                    .toUpperCase();

                return (
                    keyword !== "" &&
                    query.includes(
                        keyword
                    )
                );

            }
        );

    }

    const INTENTS =
        StaffConstants.INTENTS;

    const KEYWORDS =
        StaffConstants.KEYWORDS;

    const parameters =
        result.parameters ||
        {};

    const staff =
        result.entities.staff ||
        [];

    const single =
        parameters.isSingle === true;

    /*----------------------------------
      Aggregate
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_TEAM_LEADER_LIST

        )

    ) {

        parameters.teamLeader =
            true;

        result.parameters =
            parameters;

        result.intent =
            INTENTS.STAFF_TEAM_LEADER_LIST;

        result.confidence =
            0.99;

        return result;

    }

    /*----------------------------------
      Single Staff
    ----------------------------------*/

    if (
        single
    ) {

        result.parameters.staff =
            staff[0];

        /*------------------------------
          Leader
        ------------------------------*/

        if (

            hasKeyword(

                KEYWORDS.STAFF_LEADER

            )

        ) {

            result.intent =
                INTENTS.STAFF_LEADER;

            result.confidence =
                0.99;

            return result;

        }

        /*------------------------------
          Team
        ------------------------------*/

        if (

            hasKeyword(

                KEYWORDS.STAFF_TEAM

            )

        ) {

            result.intent =
                INTENTS.STAFF_TEAM;

            result.confidence =
                0.99;

            return result;

        }

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

    result.parameters?.isAggregate

) {

    return result;

}
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

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (
    !result ||
    result.intent ||
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

    return result;

};
 /*=========================================================
 DETECT STRENGTH INTENT
=========================================================*/

/*=========================================================
 DETECT STATUS / LIVE STAFF INTENT
=========================================================*/

/*=========================================================
 DETECT STATUS INTENT
=========================================================*/

StaffIntent.detectStatusIntent = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result ||

        result.intent ||

        !result.entities

    ) {

        return result;

    }

    const query =

        String(

            result.normalizedQuery ||

            ""

        )

        .trim()

        .toUpperCase();

    const INTENTS =

        StaffConstants.INTENTS;

    const KEYWORDS =

        StaffConstants.KEYWORDS;

    const parameters =

        result.parameters ||

        {};

    const staff =

        result.entities.staff ||

        [];

    const single =

        parameters.isSingle === true;

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

                keyword

            ) {

                keyword =

                    String(

                        keyword

                    )

                    .trim()

                    .toUpperCase();

                return (

                    keyword !== "" &&

                    query.includes(

                        keyword

                    )

                );

            }

        );

    }

    /*==================================
      Aggregate
    ==================================*/

    /*----------------------------------
      Inactive
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_INACTIVE_LIST

        )

    ) {

        parameters.dutyActive =

            false;

        result.parameters =

            parameters;

        result.intent =

            INTENTS.STAFF_INACTIVE_LIST;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Active
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_ACTIVE_LIST

        )

    ) {

        parameters.dutyActive =

            true;

        result.parameters =

            parameters;

        result.intent =

            INTENTS.STAFF_ACTIVE_LIST;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Moving
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_MOVING

        )

    ) {

        parameters.moving =

            true;

        result.parameters =

            parameters;

        result.intent =

            INTENTS.STAFF_MOVING;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Stationary
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_STATIONARY

        )

    ) {

        parameters.stationary =

            true;

        result.parameters =

            parameters;

        result.intent =

            INTENTS.STAFF_STATIONARY;

        result.confidence =

            0.99;

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

        parameters.teamLeader =

            true;

        result.parameters =

            parameters;

        result.intent =

            INTENTS.STAFF_TEAM_LEADER_LIST;

        result.confidence =

            0.99;

        return result;

    }

    /*==================================
      Single Staff
    ==================================*/

    if (

        !single

    ) {

        return result;

    }

    result.parameters.staff =

        staff[0];

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

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Moving Status
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_MOVING

        )

    ) {

        result.intent =

            INTENTS.STAFF_MOVING;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Stationary Status
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_STATIONARY

        )

    ) {

        result.intent =

            INTENTS.STAFF_STATIONARY;

        result.confidence =

            0.99;

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

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Team Leader
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_LEADER

        )

    ) {

        result.intent =

            INTENTS.STAFF_LEADER;

        result.confidence =

            0.99;

        return result;

    }

    return result;

};
 /*=========================================================
 DETECT CONTROL ROOM INTENT
=========================================================*/

StaffIntent.detectControlRoomIntent = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

if (
    !result ||
    result.intent ||
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
      Who Is On Duty
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.WHO_IS_ON_DUTY

        )

    ) {

        result.intent =

            INTENTS.WHO_IS_ON_DUTY;

        result.parameters.staff =

            staff;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Who Is Patrolling
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.WHO_IS_PATROLLING

        )

    ) {

        result.intent =

            INTENTS.WHO_IS_PATROLLING;

        result.parameters.staff =

            staff;

        result.confidence =

            0.99;

        return result;

    }

    return result;

};
/*=========================================================
 DETECT CONTACT INTENT
=========================================================*/

StaffIntent.detectContactIntent = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result ||

        result.intent ||

        !result.entities

    ) {

        return result;

    }

    /*----------------------------------
      Aggregate Guard
    ----------------------------------*/

    if (

        result.parameters?.isAggregate

    ) {

        return result;

    }

    const staff =

        result.entities.staff ||

        [];

    if (

        staff.length !== 1

    ) {

        return result;

    }

    const profile =

        staff[0];

    const query =

        String(

            result.normalizedQuery ||

            ""

        )

        .trim()

        .toUpperCase();

    if (

        query.length === 0

    ) {

        return result;

    }

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

            profile.identity?.phone ??

            profile.contact?.phone ??

            null;

        result.parameters.email =

            profile.identity?.email ??

            profile.contact?.email ??

            null;

        result.parameters.contact = {

            phone:

                profile.identity?.phone ??

                profile.contact?.phone ??

                null,

            email:

                profile.identity?.email ??

                profile.contact?.email ??

                null

        };

        result.confidence =

            Math.max(

                result.confidence,

                0.99

            );

        return result;

    }

    return result;

};
 /*=========================================================
 DETECT SEARCH INTENT
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
      Posting Parameters
    ----------------------------------*/

    result =
        StaffIntent.extractPostingParameters(
            result
        );

    if (
        result.parameters.compartment
    ) {
        // keep everything
    }
    else if (
        result.parameters.beat
    ) {
        result.parameters.compartment =
            null;
    }
    else if (
        result.parameters.range
    ) {
        result.parameters.beat =
            null;
        result.parameters.compartment =
            null;
    }
    else if (
        result.parameters.division
    ) {
        result.parameters.range =
            null;
        result.parameters.beat =
            null;
        result.parameters.compartment =
            null;
    }
    else if (
        result.parameters.circle
    ) {
        result.parameters.division =
            null;
        result.parameters.range =
            null;
        result.parameters.beat =
            null;
        result.parameters.compartment =
            null;
    }

    console.log(
        "📍 Posting Parameters:",
        result.parameters
    );

    /*----------------------------------
      Single vs Aggregate
    ----------------------------------*/

/*----------------------------------
  Single vs Aggregate
----------------------------------*/

StaffIntent.detectSingleVsAggregate(
    result
);

console.log(

    "👤 Scope:",

    result.parameters.isSingle ?

        "Single"

        :

        result.parameters.isAggregate ?

            "Aggregate"

            :

            "Unknown"

);

 if (

    !result.parameters.isSingle &&

    !result.parameters.isAggregate

) {

    console.warn(

        "⚠ Unable to determine query scope."

    );

}
    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.metadata.extraction =
        extraction;

    /*=================================================
      STAFF INTENT DETECTION
    =================================================*/

    console.time(
        "detectStaffIntent"
    );

    if (
        result.parameters.isSingle === true
    ) {
        /*----------------------------------
          Single Staff
        ----------------------------------*/
        result = StaffIntent.detectProfileIntent(result);
        result = StaffIntent.detectContactIntent(result);
        result = StaffIntent.detectRoleIntent(result);
        result = StaffIntent.detectDesignationIntent(result);
        result = StaffIntent.detectPostingIntent(result);
        result = StaffIntent.detectLocationIntent(result);
        result = StaffIntent.detectGPSIntent(result);
        result = StaffIntent.detectDutyStatusIntent(result);
        result = StaffIntent.detectAnalyticsIntent(result);
        
    }
    else if (
        result.parameters.isAggregate === true
    ) {
        /*----------------------------------
          Aggregate
        ----------------------------------*/
        result = StaffIntent.detectGlobalIntent(result);
    }
else {

    return result;

}

    console.timeEnd(
        "detectStaffIntent"
    );

    console.log(
        "👤 Final Intent:",
        result.intent
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
};
StaffIntent.detectSingleVsAggregate = function (

    result

) {

    if (

        !result ||

        result.intent ||

        !result.entities

    ) {

        return result;

    }

    const query =

        String(

            result.normalizedQuery ||

            ""

        )

        .trim()

        .toUpperCase();

    const parameters =

        result.parameters ||

        {};

    const entities =

        result.entities ||

        {};

    const staff =

        entities.staff ||

        [];

    const hasJurisdiction =

        !!parameters.circle ||

        !!parameters.division ||

        !!parameters.range ||

        !!parameters.beat;

    const hasDesignation =

        (

            entities.designations ||

            []

        ).length > 0;

    const aggregateWords = [

    "STAFF COUNT",

    "TOTAL STAFF",

    "HOW MANY STAFF",

    "NUMBER OF STAFF",

    "STAFF TOTAL",

    "STAFF STRENGTH",

    "HEADCOUNT",

    "ALL STAFF",

    "STAFF LIST",

    "DIRECTORY",

    "TEAM LEADERS"

];

    
const aggregate =

    aggregateWords.some(

        function (

            word

        ) {

            return query.includes(

                word

            );

        }

    );

const single =

    staff.length === 1;

result.parameters.isSingle =

    single &&

    !aggregate &&

    !hasJurisdiction &&

    !hasDesignation;

result.parameters.isAggregate =

    !result.parameters.isSingle;

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
 DETECT LOCATION INTENT
=========================================================*/

StaffIntent.detectLocationIntent =

function (

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

    /*----------------------------------
      Aggregate Query
    ----------------------------------*/

    if (

        result.parameters?.isAggregate

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

            staff;

        result.confidence =

            0.98;

        return result;

    }

    return result;

};
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

        result.intent === INTENTS.STAFF_ASSIGNMENT 

       

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
  Location
----------------------------------*/

result =

    StaffIntent.detectLocationIntent(

        result

    );

if (

    result.intent ===

    INTENTS.STAFF_LOCATION

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

    result.intent ===

        INTENTS.STAFF_GPS ||

    result.intent ===

        INTENTS.STAFF_SPEED ||

    result.intent ===

        INTENTS.STAFF_HEADING ||

    result.intent ===

        INTENTS.STAFF_ACCURACY

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
      No Single-Staff Intent
    ----------------------------------*/

    console.log(

        "❌ No Single Staff Intent"

    );

    return result;

};
StaffIntent.detectDesignationCountIntent =
function (
    result
) {

    if (

        !result

    ) {

        return result;

    }

    const query =

        String(

            result.normalizedQuery ||

            ""

        ).toUpperCase();

    const parameters =

        result.parameters ||

        {};

    const designation =

        result.entities.designations ||

        [];

    const hasCount =

        [

            "COUNT",
            "TOTAL",
            "HOW MANY",
            "NUMBER OF",
            "HEADCOUNT",
            "STRENGTH"

        ].some(

            function (

                word

            ) {

                return query.includes(

                    word

                );

            }

        );

    if (

        !hasCount

    ) {

        return result;

    }

    if (

        designation.length === 0

    ) {

        return result;

    }

    result.intent =

        StaffConstants.INTENTS.STAFF_DESIGNATION_COUNT;

    result.parameters.designation =

        designation[0]
            .identity
            .designation;

    result.confidence =

        0.99;

    return result;

}; /*=========================================================
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

        result.intent ||

        !result.entities

    ) {

        return result;

    }

    const staff =

        result.entities.staff ||

        [];

    /*----------------------------------
      Single Staff Only
    ----------------------------------*/

if (

    staff.length !== 1 ||

    result.parameters?.isAggregate

) {

    return result;

}

    /*----------------------------------
      Aggregate Guard
    ----------------------------------*/

    const parameters =

        result.parameters ||

        {};

    if (

        parameters.circle ||

        parameters.division ||

        parameters.range ||

        parameters.beat

    ) {

        return result;

    }

    const profile =

        staff[0];

    const query =

        String(

            result.normalizedQuery ||

            ""

        )

        .toUpperCase();

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

            0.99;

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

            0.99;

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

            0.98;

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

            0.98;

        return result;

    }

    return result;

};
 /*=========================================================
 DETECT GPS INTENT
=========================================================*/

/*=========================================================
 DETECT GPS INTENT
=========================================================*/

StaffIntent.detectGPSIntent =

function (

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

    /*----------------------------------
      Aggregate Query
    ----------------------------------*/

    if (

        result.parameters?.isAggregate

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

        result.normalizedQuery ||

        "";

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

/*=========================================================
 DETECT GLOBAL INTENT
=========================================================*/

/*=========================================================
 DETECT GLOBAL INTENT
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
      Validate
    ----------------------------------*/

    if (

        !result ||

        result.intent

    ) {

        console.groupEnd();

        return result;

    }

    /*----------------------------------
      Aggregate Only
    ----------------------------------*/

    if (

        result.parameters &&

        result.parameters.isSingle

    ) {

        console.log(

            "⏭ Single Staff Query - Skip Global"

        );

        console.groupEnd();

        return result;

    }

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
      DUTY
    ----------------------------------*/

    result =

        StaffIntent.detectDutyIntent(

            result

        );

    if (

        result.intent

    ) {

        console.log(

            "✅ Duty:",

            result.intent

        );

        console.groupEnd();

        return result;

    }

    /*----------------------------------
      MOVEMENT
    ----------------------------------*/

    result =

        StaffIntent.detectMovementIntent(

            result

        );

    if (

        result.intent

    ) {

        console.log(

            "✅ Movement:",

            result.intent

        );

        console.groupEnd();

        return result;

    }

    /*----------------------------------
      TEAM
    ----------------------------------*/

    result =

        StaffIntent.detectTeamIntent(

            result

        );

    if (

        result.intent

    ) {

        console.log(

            "✅ Team:",

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
      COUNT
    ----------------------------------*/

    result =

        StaffIntent.detectCountIntent(

            result

        );

    if (

        result.intent

    ) {

        console.log(

            "✅ Count:",

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



    /*----------------------------------
      NO GLOBAL INTENT
    ----------------------------------*/

    console.log(

        "❌ No Global Intent"

    );

    console.groupEnd();

    return result;

};
StaffIntent.detectCountIntent = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result ||

        result.intent

    ) {

        return result;

    }

    const query =

        String(

            result.normalizedQuery ||

            ""

        )

        .trim()

        .toUpperCase();

    const INTENTS =

        StaffConstants.INTENTS;

    const parameters =

        result.parameters ||

        {};

    const entities =

        result.entities ||

        {};

    /*----------------------------------
      Whole Word Helper
    ----------------------------------*/

    function hasWord(

        word

    ) {

        return new RegExp(

            "(^|\\W)" +

            word +

            "(\\W|$)"

        ).test(

            query

        );

    }

    /*----------------------------------
      Count Keywords
    ----------------------------------*/

    const hasCount =

        [

            "COUNT",

            "COUNTS",

            "TOTAL",

            "HOW MANY",

            "NUMBER OF",

            "HEADCOUNT",

            "STRENGTH"

        ].some(

            function (

                word

            ) {

                return query.includes(

                    word

                );

            }

        );

    if (

        !hasCount

    ) {

        return result;

    }

    /*----------------------------------
      Boolean Filters
    ----------------------------------*/

    if (

        hasWord(

            "INACTIVE"

        ) ||

        query.includes(

            "OFF DUTY"

        )

    ) {

        parameters.dutyActive =

            false;

    }

    else if (

        hasWord(

            "ACTIVE"

        ) ||

        query.includes(

            "ON DUTY"

        )

    ) {

        parameters.dutyActive =

            true;

    }

    if (

        hasWord(

            "MOVING"

        )

    ) {

        parameters.moving =

            true;

    }

    if (

        hasWord(

            "STATIONARY"

        ) ||

        hasWord(

            "STOPPED"

        )

    ) {

        parameters.stationary =

            true;

    }

    result.parameters =

        parameters;

    /*----------------------------------
      Designation Count
    ----------------------------------*/

    if (

        entities.designations &&

        entities.designations.length > 0

    ) {

        result.intent =

            INTENTS.STAFF_DESIGNATION_COUNT;

        result.parameters.designation =

            entities

                .designations[0]

                .identity

                .designation;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Beat Count
    ----------------------------------*/

    if (

        parameters.beat

    ) {

        result.intent =

            INTENTS.STAFF_BEAT_COUNT;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Range Count
    ----------------------------------*/

    if (

        parameters.range

    ) {

        result.intent =

            INTENTS.STAFF_RANGE_COUNT;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Division Count
    ----------------------------------*/

    if (

        parameters.division

    ) {

        result.intent =

            INTENTS.STAFF_DIVISION_COUNT;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Circle Count
    ----------------------------------*/

    if (

        parameters.circle

    ) {

        result.intent =

            INTENTS.STAFF_CIRCLE_COUNT;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Active Count
    ----------------------------------*/

    if (

        parameters.dutyActive ===

        true

    ) {

        result.intent =

            INTENTS.STAFF_ACTIVE_COUNT;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Inactive Count
    ----------------------------------*/

    if (

        parameters.dutyActive ===

        false

    ) {

        result.intent =

            INTENTS.STAFF_INACTIVE_COUNT;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Moving Count
    ----------------------------------*/

    if (

        parameters.moving

    ) {

        result.intent =

            INTENTS.STAFF_MOVING_COUNT;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Stationary Count
    ----------------------------------*/

    if (

        parameters.stationary

    ) {

        result.intent =

            INTENTS.STAFF_STATIONARY_COUNT;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Generic Staff Count
    ----------------------------------*/

    result.intent =

        INTENTS.STAFF_COUNT;

    result.confidence =

        0.99;

    return result;

};
/*=========================================================
  DIRECTORY INTENT
=========================================================*/

StaffIntent.detectDirectoryIntent = function (
    result
) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (
        !result ||
        result.intent ||
        !result.entities
    ) {
        return result;
    }

    if (
        result.parameters &&
        result.parameters.isSingle
    ) {
        return result;
    }

    const query =
        String(
            result.normalizedQuery ||
            ""
        )
        .trim()
        .toUpperCase();

    if (
        query === ""
    ) {
        return result;
    }

    const INTENTS =
        StaffConstants.INTENTS;

    const KEYWORDS =
        StaffConstants.KEYWORDS;

    const parameters =
        result.parameters ||
        {};

    const staff =
        result.entities.staff ||
        [];

    const designations =
        result.entities.designations ||
        [];

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
                keyword
            ) {

                keyword =
                    String(
                        keyword
                    )
                    .trim()
                    .toUpperCase();

                return (
                    keyword &&
                    query.includes(
                        keyword
                    )
                );

            }

        );

    }

    /*----------------------------------
      Count Query?
    ----------------------------------*/

    const copy =
        JSON.parse(
            JSON.stringify(
                result
            )
        );

    StaffIntent.detectCountIntent(
        copy
    );

    if (
        copy.intent
    ) {

        return result;

    }

    /*----------------------------------
      Entities
    ----------------------------------*/

    const hasDesignation =
        designations.length > 0;

    const hasCircle =
        !!parameters.circle;

    const hasDivision =
        !!parameters.division;

    const hasRange =
        !!parameters.range;

    const hasBeat =
        !!parameters.beat;

    const hasJurisdiction =
        hasCircle ||
        hasDivision ||
        hasRange ||
        hasBeat;

    /*----------------------------------
      Directory Language
    ----------------------------------*/

    const directoryQuery =

        hasKeyword(
            KEYWORDS.STAFF_DIRECTORY
        ) ||

        hasKeyword(
            KEYWORDS.STAFF_RANGE_DIRECTORY
        ) ||

        hasKeyword(
            KEYWORDS.STAFF_DIVISION_DIRECTORY
        ) ||

        hasKeyword(
            KEYWORDS.STAFF_BEAT_DIRECTORY
        ) ||

        hasKeyword(
            KEYWORDS.STAFF_CIRCLE_DIRECTORY
        ) ||

        hasKeyword(
            KEYWORDS.STAFF_DESIGNATION_DIRECTORY
        ) ||

        query.includes(
            "LIST"
        ) ||

        query.includes(
            "SHOW"
        ) ||

        query.includes(
            "VIEW"
        ) ||

        query.includes(
            "DISPLAY"
        ) ||

        query.includes(
            "GET"
        ) ||

        query.includes(
            "DIRECTORY"
        ) ||

        query.includes(
            "STAFF"
        ) ||

        query.includes(
            "ALL"
        ) ||

        query.includes(
            "UNDER"
        ) ||

        query.includes(
            "IN "
        ) ||

        query.includes(
            "OF "
        );

    /*----------------------------------
      Designation Directory
      Highest Priority
    ----------------------------------*/

    if (
        hasDesignation &&
        (
            directoryQuery ||
            hasJurisdiction
        )
    ) {

        result.intent =
            INTENTS.STAFF_DESIGNATION_DIRECTORY;

        result.parameters.designation =
            designations[0]
                .identity
                ?.designation ||
            designations[0]
                .designation;

        result.confidence =
            0.99;

        return result;

    }

    /*----------------------------------
      Beat Directory
    ----------------------------------*/

    if (
        hasBeat &&
        directoryQuery
    ) {

        result.intent =
            INTENTS.STAFF_BEAT_DIRECTORY;

        result.confidence =
            0.99;

        return result;

    }

    /*----------------------------------
      Range Directory
    ----------------------------------*/

    if (
        hasRange &&
        directoryQuery
    ) {

        result.intent =
            INTENTS.STAFF_RANGE_DIRECTORY;

        result.confidence =
            0.99;

        return result;

    }

    /*----------------------------------
      Division Directory
    ----------------------------------*/

    if (
        hasDivision &&
        directoryQuery
    ) {

        result.intent =
            INTENTS.STAFF_DIVISION_DIRECTORY;

        result.confidence =
            0.99;

        return result;

    }

    /*----------------------------------
      Circle Directory
    ----------------------------------*/

    if (
        hasCircle &&
        directoryQuery
    ) {

        result.intent =
            INTENTS.STAFF_CIRCLE_DIRECTORY;

        result.confidence =
            0.99;

        return result;

    }

    /*----------------------------------
      Generic Directory
    ----------------------------------*/

    if (
        directoryQuery
    ) {

        result.intent =
            INTENTS.STAFF_DIRECTORY;

        result.parameters.staff =
            staff;

        result.confidence =
            0.95;

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
