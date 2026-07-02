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

            "staff",

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

                StaffIntent.VERSION,

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

StaffIntent.detect = function (

    query

) {

    const started =

        Date.now();

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        typeof query !== "string"

    ) {

        return StaffIntent.createIntentResult();

    }

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

        return cached;

    }

    /*----------------------------------
      Create Result
    ----------------------------------*/

    const result =

        StaffIntent.createIntentResult(

            query

        );

    /*----------------------------------
      Store Query
    ----------------------------------*/

    StaffIntent.lastQuery =

        query;

    /*----------------------------------
      Extract Entities
    ----------------------------------*/

    const extraction =

        StaffEntities.extract(

            query

        );

    /*----------------------------------
      Extraction Failed
    ----------------------------------*/

    if (

        !extraction

    ) {

        result.errors.push(

            "Extraction failed."

        );

        result.requiresAI =

            true;

        return result;

    }

    /*----------------------------------
      Copy Extraction
    ----------------------------------*/

    result.entities.staff =

        extraction.results ||

        [];

    result.metadata.extraction =

        extraction;

    /*----------------------------------
      Run Local Detectors
    ----------------------------------*/

    StaffIntent.detectStaffIntent(

        result

    );

    StaffIntent.detectPostingIntent(

        result

    );

    StaffIntent.detectDutyIntent(

        result

    );

    StaffIntent.detectGPSIntent(

        result

    );

    /*----------------------------------
      Confidence
    ----------------------------------*/

    StaffIntent.calculateConfidence(

        result

    );

    /*----------------------------------
      AI Decision
    ----------------------------------*/

    result.requiresAI =

        StaffIntent.needsAI(

            result

        );

    /*----------------------------------
      Execution Time
    ----------------------------------*/

    result.metadata.executionTime =

        Date.now() -

        started;

    /*----------------------------------
      Save
    ----------------------------------*/

    StaffIntent.lastResult =

        result;

    StaffIntent.setCachedResult(

        query,

        result

    );

    /*----------------------------------
      Return
    ----------------------------------*/

    return result;

};
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

            staff[0];

        result.parameters.circle =

            staff[0].posting.circle;

        result.confidence =

            Math.max(

                result.confidence,

                0.96

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

            staff[0];

        result.parameters.division =

            staff[0].posting.division;

        result.confidence =

            Math.max(

                result.confidence,

                0.96

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

            staff[0];

        result.parameters.range =

            staff[0].posting.range;

        result.confidence =

            Math.max(

                result.confidence,

                0.96

            );

        return result;

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

            staff[0];

        result.parameters.beat =

            staff[0].posting.beat;

        result.confidence =

            Math.max(

                result.confidence,

                0.96

            );

        return result;

    }

    /*----------------------------------
      Compartment
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_COMPARTMENT

        )

    ) {

        result.intent =

            INTENTS.STAFF_COMPARTMENT;

        result.parameters.staff =

            staff[0];

        result.parameters.compartment =

            staff[0].assignment.assignedCompartment;

        result.confidence =

            Math.max(

                result.confidence,

                0.96

            );

        return result;

    }

    /*----------------------------------
      Area
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_AREA

        )

    ) {

        result.intent =

            INTENTS.STAFF_AREA;

        result.parameters.staff =

            staff[0];

        result.parameters.area =

            staff[0].assignment.assignedCompartment;

        result.confidence =

            Math.max(

                result.confidence,

                0.95

            );

        return result;

    }

    /*----------------------------------
      Generic Posting
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_POSTING

        )

    ) {

        result.intent =

            INTENTS.STAFF_POSTING;

        result.parameters.staff =

            staff[0];

        result.confidence =

            Math.max(

                result.confidence,

                0.90

            );

        return result;

    }

    return result;

};

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

            staff[0];

        result.parameters.circle =

            staff[0].posting.circle;

        result.confidence =

            Math.max(

                result.confidence,

                0.96

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

            staff[0];

        result.parameters.division =

            staff[0].posting.division;

        result.confidence =

            Math.max(

                result.confidence,

                0.96

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

            staff[0];

        result.parameters.range =

            staff[0].posting.range;

        result.confidence =

            Math.max(

                result.confidence,

                0.96

            );

        return result;

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

            staff[0];

        result.parameters.beat =

            staff[0].posting.beat;

        result.confidence =

            Math.max(

                result.confidence,

                0.96

            );

        return result;

    }

    /*----------------------------------
      Compartment
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_COMPARTMENT

        )

    ) {

        result.intent =

            INTENTS.STAFF_COMPARTMENT;

        result.parameters.staff =

            staff[0];

        result.parameters.compartment =

            staff[0].assignment.assignedCompartment;

        result.confidence =

            Math.max(

                result.confidence,

                0.96

            );

        return result;

    }

    /*----------------------------------
      Area
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_AREA

        )

    ) {

        result.intent =

            INTENTS.STAFF_AREA;

        result.parameters.staff =

            staff[0];

        result.parameters.area =

            staff[0].assignment.assignedCompartment;

        result.confidence =

            Math.max(

                result.confidence,

                0.95

            );

        return result;

    }

    /*----------------------------------
      Generic Posting
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_POSTING

        )

    ) {

        result.intent =

            INTENTS.STAFF_POSTING;

        result.parameters.staff =

            staff[0];

        result.confidence =

            Math.max(

                result.confidence,

                0.90

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
      GPS Query
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_GPS

        )

    ) {

        result.intent =

            INTENTS.STAFF_GPS;

        result.parameters.staff =

            staff[0];

        result.confidence =

            Math.max(

                result.confidence,

                0.98

            );

        return result;

    }

    /*----------------------------------
      Location Query
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_LOCATION

        )

    ) {

        result.intent =

            INTENTS.STAFF_LOCATION;

        result.parameters.staff =

            staff[0];

        result.confidence =

            Math.max(

                result.confidence,

                0.98

            );

        return result;

    }

    /*----------------------------------
      Coordinates
    ----------------------------------*/

    if (

        query.includes(

            "COORDINATE"

        ) ||

        query.includes(

            "LAT"

        ) ||

        query.includes(

            "LON"

        )

    ) {

        result.intent =

            INTENTS.STAFF_COORDINATES;

        result.parameters.staff =

            staff[0];

        result.confidence =

            Math.max(

                result.confidence,

                0.98

            );

        return result;

    }

    /*----------------------------------
      Current Position
    ----------------------------------*/

    if (

        query.includes(

            "CURRENT"

        ) &&

        query.includes(

            "POSITION"

        )

    ) {

        result.intent =

            INTENTS.STAFF_CURRENT_POSITION;

        result.parameters.staff =

            staff[0];

        result.confidence =

            Math.max(

                result.confidence,

                0.98

            );

        return result;

    }

    /*----------------------------------
      Last Location
    ----------------------------------*/

    if (

        query.includes(

            "LAST"

        ) &&

        query.includes(

            "LOCATION"

        )

    ) {

        result.intent =

            INTENTS.STAFF_LAST_LOCATION;

        result.parameters.staff =

            staff[0];

        result.confidence =

            Math.max(

                result.confidence,

                0.97

            );

        return result;

    }

    /*----------------------------------
      Who Is Nearest
    ----------------------------------*/

    if (

        query.includes(

            "NEAREST"

        )

    ) {

        result.intent =

            INTENTS.WHO_IS_NEAREST;

        result.parameters.staff =

            staff;

        result.confidence =

            Math.max(

                result.confidence,

                0.95

            );

        return result;

    }

    /*----------------------------------
      Old GPS
    ----------------------------------*/

    if (

        query.includes(

            "OLD GPS"

        ) ||

        query.includes(

            "STALE GPS"

        )

    ) {

        result.intent =

            INTENTS.WHO_HAS_OLD_GPS;

        result.parameters.staff =

            staff.filter(

                function (

                    s

                ) {

                    return (

                        s.gps &&

                        s.gps.lastSeen &&

                        (

                            Date.now() -

                            Number(

                                s.gps.lastSeen

                            )

                        ) >

                        10 *

                        60 *

                        1000

                    );

                }

            );

        result.confidence =

            Math.max(

                result.confidence,

                0.95

            );

        return result;

    }

    /*----------------------------------
      Poor Accuracy
    ----------------------------------*/

    if (

        query.includes(

            "ACCURACY"

        )

    ) {

        result.intent =

            INTENTS.WHO_HAS_POOR_ACCURACY;

        result.parameters.staff =

            staff.filter(

                function (

                    s

                ) {

                    return (

                        Number(

                            s.gps

                                ?.accuracy ||

                            0

                        ) >

                        25

                    );

                }

            );

        result.confidence =

            Math.max(

                result.confidence,

                0.95

            );

        return result;

    }

    /*----------------------------------
      Moving
    ----------------------------------*/

    if (

        query.includes(

            "MOVING"

        )

    ) {

        result.intent =

            INTENTS.MOVING_STAFF;

        result.parameters.staff =

            staff.filter(

                function (

                    s

                ) {

                    return (

                        Number(

                            s.gps

                                ?.speed ||

                            0

                        ) >

                        0

                    );

                }

            );

        result.confidence =

            Math.max(

                result.confidence,

                0.94

            );

        return result;

    }

    /*----------------------------------
      Stationary
    ----------------------------------*/

    if (

        query.includes(

            "STATIONARY"

        ) ||

        query.includes(

            "STOPPED"

        )

    ) {

        result.intent =

            INTENTS.STATIONARY_STAFF;

        result.parameters.staff =

            staff.filter(

                function (

                    s

                ) {

                    return (

                        Number(

                            s.gps

                                ?.speed ||

                            0

                        ) <=

                        0

                    );

                }

            );

        result.confidence =

            Math.max(

                result.confidence,

                0.94

            );

        return result;

    }

    /*----------------------------------
      No Match
    ----------------------------------*/

    return result;

};/*=========================================================
 CALCULATE CONFIDENCE
=========================================================*/

StaffIntent.calculateConfidence = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result

    ) {

        return 0;

    }

    const CONF =

        StaffConstants.CONFIDENCE;

    let score =

        0;

    /*----------------------------------
      Intent Match
    ----------------------------------*/

    if (

        result.intent

    ) {

        score +=

            CONF.PRIMARY_KEYWORD;

    }

    /*----------------------------------
      Staff Match
    ----------------------------------*/

    const staffCount =

        result.entities.staff.length;

    if (

        staffCount === 1

    ) {

        score +=

            CONF.STAFF_NAME;

    }

    else if (

        staffCount > 1

    ) {

        score +=

            CONF.STAFF_NAME;

        score +=

            CONF.MULTIPLE_ENTITIES;

    }

    /*----------------------------------
      Phone Match
    ----------------------------------*/

    if (

        result.entities.phones.length >

        0

    ) {

        score +=

            CONF.PHONE;

    }

    /*----------------------------------
      Role Match
    ----------------------------------*/

    if (

        result.entities.roles.length >

        0

    ) {

        score +=

            CONF.ROLE;

    }

    /*----------------------------------
      Designation Match
    ----------------------------------*/

    if (

        result.entities.designations.length >

        0

    ) {

        score +=

            CONF.DESIGNATION;

    }

    /*----------------------------------
      Posting Match
    ----------------------------------*/

    if (

        result.entities.posting.length >

        0

    ) {

        score +=

            CONF.BEAT;

    }

    /*----------------------------------
      Team Match
    ----------------------------------*/

    if (

        result.entities.team.length >

        0

    ) {

        score +=

            CONF.TEAM;

    }

    /*----------------------------------
      Duty Match
    ----------------------------------*/

    if (

        result.entities.duty.length >

        0

    ) {

        score +=

            CONF.MULTIPLE_KEYWORDS;

    }

    /*----------------------------------
      GPS Match
    ----------------------------------*/

    if (

        result.entities.gps.length >

        0

    ) {

        score +=

            CONF.MULTIPLE_KEYWORDS;

    }

    /*----------------------------------
      Keywords
    ----------------------------------*/

    if (

        result.keywords.length >

        1

    ) {

        score +=

            CONF.MULTIPLE_KEYWORDS;

    }

    /*----------------------------------
      Clamp
    ----------------------------------*/

    score =

        Math.max(

            0,

            Math.min(

                1,

                score

            )

        );

    result.confidence =

        score;

    /*----------------------------------
      Confidence Label
    ----------------------------------*/

    if (

        score >=

        CONF.VERY_HIGH

    ) {

        result.metadata.level =

            "VERY_HIGH";

    }

    else if (

        score >=

        CONF.HIGH

    ) {

        result.metadata.level =

            "HIGH";

    }

    else if (

        score >=

        CONF.GOOD

    ) {

        result.metadata.level =

            "GOOD";

    }

    else if (

        score >=

        CONF.MEDIUM

    ) {

        result.metadata.level =

            "MEDIUM";

    }

    else {

        result.metadata.level =

            "LOW";

    }

    return score;

};
/*=========================================================
 NEEDS AI
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
      No Intent
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
      No Staff
    ----------------------------------*/

    if (

        result.entities.staff.length ===

        0

    ) {

        result.warnings.push(

            "No staff entity found."

        );

        return true;

    }

    /*----------------------------------
      Multiple Staff
    ----------------------------------*/

    if (

        result.entities.staff.length >

        10

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
      Search Questions
    ----------------------------------*/

    const query =

        result.normalizedQuery;

    if (

        query.includes(

            "WHY"

        ) ||

        query.includes(

            "EXPLAIN"

        ) ||

        query.includes(

            "HOW"

        ) ||

        query.includes(

            "ANALYSE"

        ) ||

        query.includes(

            "ANALYZE"

        ) ||

        query.includes(

            "RECOMMEND"

        ) ||

        query.includes(

            "SUGGEST"

        ) ||

        query.includes(

            "COMPARE"

        )

    ) {

        result.warnings.push(

            "Reasoning query."

        );

        return true;

    }

    /*----------------------------------
      Analytics
    ----------------------------------*/

    if (

        result.intent ===

        StaffConstants.INTENTS.STAFF_STATISTICS ||

        result.intent ===

        StaffConstants.INTENTS.STAFF_STRENGTH ||

        result.intent ===

        StaffConstants.INTENTS.DUTY_SUMMARY

    ) {

        return false;

    }

    /*----------------------------------
      Standard Staff Queries
    ----------------------------------*/

    switch (

        result.intent

    ) {

        case StaffConstants.INTENTS.STAFF_PROFILE:

        case StaffConstants.INTENTS.STAFF_CONTACT:

        case StaffConstants.INTENTS.STAFF_LOCATION:

        case StaffConstants.INTENTS.STAFF_POSTING:

        case StaffConstants.INTENTS.STAFF_DUTY:

        case StaffConstants.INTENTS.STAFF_STATUS:

        case StaffConstants.INTENTS.STAFF_ROLE:

        case StaffConstants.INTENTS.STAFF_DESIGNATION:

        case StaffConstants.INTENTS.STAFF_TEAM:

        case StaffConstants.INTENTS.STAFF_GPS:

        case StaffConstants.INTENTS.STAFF_BEAT:

        case StaffConstants.INTENTS.STAFF_RANGE:

        case StaffConstants.INTENTS.STAFF_DIVISION:

        case StaffConstants.INTENTS.STAFF_CIRCLE:

        case StaffConstants.INTENTS.STAFF_COMPARTMENT:

        case StaffConstants.INTENTS.WHO_IS_ON_DUTY:

        case StaffConstants.INTENTS.WHO_IS_PATROLLING:

        case StaffConstants.INTENTS.WHO_IS_OFFLINE:

        case StaffConstants.INTENTS.WHO_HAS_OLD_GPS:

        case StaffConstants.INTENTS.WHO_HAS_POOR_ACCURACY:

        case StaffConstants.INTENTS.WHO_STOPPED_MOVING:

        case StaffConstants.INTENTS.MOVING_STAFF:

        case StaffConstants.INTENTS.STATIONARY_STAFF:

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

    /*----------------------------------
      Intent
    ----------------------------------*/

    switch (

        result.intent

    ) {

        /*==================================
          PROFILE
        ==================================*/

        case StaffConstants.INTENTS.STAFF_PROFILE:

            return await router.profile(

                result

            );

        case StaffConstants.INTENTS.STAFF_CONTACT:

            return await router.contact(

                result

            );

        case StaffConstants.INTENTS.STAFF_ROLE:

            return await router.role(

                result

            );

        case StaffConstants.INTENTS.STAFF_DESIGNATION:

            return await router.designation(

                result

            );

        case StaffConstants.INTENTS.STAFF_IDENTITY:

            return await router.identity(

                result

            );

        /*==================================
          POSTING
        ==================================*/

        case StaffConstants.INTENTS.STAFF_POSTING:

            return await router.posting(

                result

            );

        case StaffConstants.INTENTS.STAFF_BEAT:

            return await router.beat(

                result

            );

        case StaffConstants.INTENTS.STAFF_RANGE:

            return await router.range(

                result

            );

        case StaffConstants.INTENTS.STAFF_DIVISION:

            return await router.division(

                result

            );

        case StaffConstants.INTENTS.STAFF_CIRCLE:

            return await router.circle(

                result

            );

        case StaffConstants.INTENTS.STAFF_COMPARTMENT:

            return await router.compartment(

                result

            );

        /*==================================
          LOCATION
        ==================================*/

        case StaffConstants.INTENTS.STAFF_LOCATION:

            return await router.location(

                result

            );

        case StaffConstants.INTENTS.STAFF_GPS:

            return await router.gps(

                result

            );

        case StaffConstants.INTENTS.STAFF_COORDINATES:

            return await router.coordinates(

                result

            );

        case StaffConstants.INTENTS.STAFF_CURRENT_POSITION:

            return await router.currentPosition(

                result

            );

        case StaffConstants.INTENTS.STAFF_LAST_LOCATION:

            return await router.lastLocation(

                result

            );

        /*==================================
          DUTY
        ==================================*/

        case StaffConstants.INTENTS.STAFF_DUTY:

            return await router.duty(

                result

            );

        case StaffConstants.INTENTS.STAFF_DUTY_STATUS:

            return await router.dutyStatus(

                result

            );

        case StaffConstants.INTENTS.STAFF_DUTY_TYPE:

            return await router.dutyType(

                result

            );

        case StaffConstants.INTENTS.STAFF_DUTY_ACTIVE:

            return await router.dutyActive(

                result

            );

        /*==================================
          TEAM
        ==================================*/

        case StaffConstants.INTENTS.STAFF_TEAM:

            return await router.team(

                result

            );

        case StaffConstants.INTENTS.STAFF_LEADER:

            return await router.leader(

                result

            );

        /*==================================
          STATUS
        ==================================*/

        case StaffConstants.INTENTS.STAFF_STATUS:

            return await router.status(

                result

            );

        case StaffConstants.INTENTS.STAFF_ONLINE:

            return await router.online(

                result

            );

        case StaffConstants.INTENTS.STAFF_OFFLINE:

            return await router.offline(

                result

            );

        /*==================================
          CONTROL ROOM
        ==================================*/

        case StaffConstants.INTENTS.WHO_IS_ON_DUTY:

            return await router.whoIsOnDuty(

                result

            );

        case StaffConstants.INTENTS.WHO_IS_PATROLLING:

            return await router.whoIsPatrolling(

                result

            );

        case StaffConstants.INTENTS.WHO_IS_OFFLINE:

            return await router.whoIsOffline(

                result

            );

        case StaffConstants.INTENTS.WHO_IS_NEAREST:

            return await router.nearest(

                result

            );

        case StaffConstants.INTENTS.WHO_HAS_OLD_GPS:

            return await router.oldGps(

                result

            );

        case StaffConstants.INTENTS.WHO_HAS_POOR_ACCURACY:

            return await router.lowAccuracy(

                result

            );

        case StaffConstants.INTENTS.WHO_STOPPED_MOVING:

            return await router.noMovement(

                result

            );

        /*==================================
          ANALYTICS
        ==================================*/

        case StaffConstants.INTENTS.STAFF_STRENGTH:

            return await router.strength(

                result

            );

        case StaffConstants.INTENTS.STAFF_STATISTICS:

            return await router.statistics(

                result

            );

        case StaffConstants.INTENTS.DUTY_SUMMARY:

            return await router.dutySummary(

                result

            );

        /*==================================
          DEFAULT
        ==================================*/

        default:

            return {

                success: false,

                ai: true,

                action: "AI",

                reason: "Unknown intent.",

                result

            };

    }

};
    /*=========================================================
 DETECT STAFF INTENT
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

            staff[0];

        result.confidence =

            0.98;

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

            staff[0];

        result.confidence =

            0.98;

        return result;

    }

    /*----------------------------------
      Location
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_LOCATION

        )

    ) {

        result.intent =

            INTENTS.STAFF_LOCATION;

        result.parameters.staff =

            staff[0];

        result.confidence =

            0.98;

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

            staff[0];

        result.confidence =

            0.98;

        return result;

    }

    /*----------------------------------
      Posting
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_POSTING

        )

    ) {

        result.intent =

            INTENTS.STAFF_POSTING;

        result.parameters.staff =

            staff[0];

        result.confidence =

            0.96;

        return result;

    }

    /*----------------------------------
      Duty
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_DUTY

        )

    ) {

        result.intent =

            INTENTS.STAFF_DUTY;

        result.parameters.staff =

            staff[0];

        result.confidence =

            0.96;

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

            staff[0];

        result.confidence =

            0.95;

        return result;

    }

    /*----------------------------------
      Status
    ----------------------------------*/

    if (

        hasKeyword(

            KEYWORDS.STAFF_STATUS

        )

    ) {

        result.intent =

            INTENTS.STAFF_STATUS;

        result.parameters.staff =

            staff[0];

        result.confidence =

            0.95;

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

            staff[0];

        result.confidence =

            0.95;

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

            staff[0];

        result.confidence =

            0.95;

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

        0.80;

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
