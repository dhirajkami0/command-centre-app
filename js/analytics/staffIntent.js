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
 CLEAR CACHE
=========================================================*/

StaffIntent.clearCache = function () {

    /*----------------------------------
      Reset Cache
    ----------------------------------*/

    StaffIntent.cache.clear();

    /*----------------------------------
      Reset Runtime State
    ----------------------------------*/

    StaffIntent.lastResult =

        null;

    StaffIntent.lastQuery =

        "";

    /*----------------------------------
      Return
    ----------------------------------*/

    return true;

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
  SAFE KEYWORD MATCHING

  Prevents short keywords such as:
  FR, RO, DL, BS, FV

  from matching inside unrelated words.

  Examples:

  FR
  ✓ "FR"
  ✓ "Dhiraj Kami FR"
  ✗ "FROM"
  ✗ "FRONT"

  RO
  ✓ "RO"
  ✓ "Who is the RO"
  ✗ "ROLE"

  Multi-word phrases continue to work normally.
=========================================================*/

StaffIntent.matchKeyword = function (
    query,
    keyword
) {

    if (
        !query ||
        !keyword
    ) {
        return false;
    }

    const normalizedQuery =
        String(query)
            .toUpperCase()
            .trim();

    const normalizedKeyword =
        String(keyword)
            .toUpperCase()
            .trim();

    if (
        !normalizedQuery ||
        !normalizedKeyword
    ) {
        return false;
    }

    /*----------------------------------
      Escape Regex Characters
    ----------------------------------*/

    const escapedKeyword =
        normalizedKeyword.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

    /*----------------------------------
      Convert Spaces To Flexible Spaces

      "RANGE OFFICER"

      matches:

      "RANGE OFFICER"
      "RANGE   OFFICER"
    ----------------------------------*/

    const pattern =
        escapedKeyword.replace(
            /\s+/g,
            "\\s+"
        );

    /*----------------------------------
      Whole Word / Whole Phrase Match

      Prevents:

      FR → FROM
      RO → ROLE
      DL → BUNDLE

      But allows:

      FR
      Dhiraj, FR
      RANGE OFFICER
      WHO IS ON DUTY
    ----------------------------------*/

    const regex =
        new RegExp(
            "(^|[^A-Z0-9])" +
            pattern +
            "(?=$|[^A-Z0-9])",
            "i"
        );

    return regex.test(
        normalizedQuery
    );

};
 /*=========================================================
  GET BEST KEYWORD MATCH

  Longer / more specific phrases win.

  Example:

  Query:
  "WHO IS ON DUTY"

  Possible:
  DUTY
  ON DUTY
  WHO IS ON DUTY

  Winner:
  WHO IS ON DUTY
=========================================================*/

StaffIntent.getBestKeywordMatch = function (
    query,
    keywords
) {

    if (
        !query ||
        !Array.isArray(keywords) ||
        !keywords.length
    ) {
        return null;
    }

    const matches =
        keywords.filter(
            keyword =>
                StaffIntent.matchKeyword(
                    query,
                    keyword
                )
        );

    if (
        !matches.length
    ) {
        return null;
    }

    matches.sort(
        (a, b) =>
            String(b).length -
            String(a).length
    );

    return matches[0];

};
    /*=========================================================
 DETECT
 Master Intent Detection
=========================================================*/

 StaffIntent.detectAssignmentIntent = function (

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

    const parameters =

        result.parameters ||

        {};

    /*----------------------------------
      Aggregate Guard
    ----------------------------------*/

    if (

        parameters.isAggregate === true

    ) {

        return result;

    }

    /*----------------------------------
      Single Staff Only
    ----------------------------------*/

    const staff =

        result.entities.staff ||

        [];

    if (

        staff.length !== 1

    ) {

        return result;

    }

    /*----------------------------------
      Query
    ----------------------------------*/

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

    /*----------------------------------
      Preserve Staff
    ----------------------------------*/

    parameters.staff =

        staff[0];

    result.parameters =

        parameters;

    /*----------------------------------
      Assignment View
    ----------------------------------*/

    parameters.assignmentView =

        "FULL";

    /* Duty Type */

    if (

        /\bDUTY TYPE\b|\bTYPE OF DUTY\b|\bDUTY MODE\b|\bPATROL TYPE\b|\bWORK MODE\b/i.test(

            query

        )

    ) {

        parameters.assignmentView =

            "DUTY_TYPE";

    }

    /* Compartment */

    else if (

        /\bCOMPARTMENT\b/i.test(

            query

        )

    ) {

        parameters.assignmentView =

            "COMPARTMENT";

    }

    /* Beat */

    else if (

        /\bBEAT\b/i.test(

            query

        )

    ) {

        parameters.assignmentView =

            "BEAT";

    }

    /* Range */

    else if (

        /\bRANGE\b/i.test(

            query

        )

    ) {

        parameters.assignmentView =

            "RANGE";

    }

    /* Division */

    else if (

        /\bDIVISION\b/i.test(

            query

        )

    ) {

        parameters.assignmentView =

            "DIVISION";

    }

    /*----------------------------------
      Assignment Intent
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            StaffConstants.KEYWORDS.STAFF_ASSIGNMENT

        )

    ) {

        result.intent =

            StaffConstants.INTENTS.STAFF_ASSIGNMENT;

        result.confidence =

            0.99;

        return result;

    }

    return result;

};
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

    const parameters =

        result.parameters ||

        {};

    /*----------------------------------
      Aggregate Guard
    ----------------------------------*/

    if (

        parameters.isAggregate === true

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
      Preserve Staff
    ----------------------------------*/

    parameters.staff =

        profile;

    result.parameters =

        parameters;

    /*----------------------------------
      Designation
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_DESIGNATION

        )

    ) {

        result.intent =

            INTENTS.STAFF_DESIGNATION;

        parameters.designation =

            profile.identity?.designation ??

            profile.designation ??

            null;

        parameters.designationCode =

            profile.identity?.designationCode ??

            profile.designationCode ??

            null;

        parameters.designationName =

            profile.identity?.designationName ??

            profile.designationName ??

            profile.identity?.designation ??

            profile.designation ??

            null;

        result.confidence =

            0.99;

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

    const KEYWORDS =

        StaffConstants.KEYWORDS;

    const parameters =

        result.parameters ||

        {};

    /*----------------------------------
      Moving Staff
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

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
      Stationary Staff
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

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

    return result;

}; /*=========================================================
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

    const parameters =

        result.parameters ||

        {};

    /*----------------------------------
      Aggregate Guard
    ----------------------------------*/

    if (

        parameters.isAggregate === true

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
      Preserve Staff
    ----------------------------------*/

    parameters.staff =

        profile;

    result.parameters =

        parameters;

    /*----------------------------------
      Duty Status
    ----------------------------------*/

    if (

        !StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_DUTY_STATUS

        )

    ) {

        return result;

    }

    result.intent =

        INTENTS.STAFF_DUTY_STATUS;

    parameters.dutyStatus =

        profile.assignment?.dutyStatus ??

        null;

    parameters.dutyActive =

        profile.assignment?.dutyActive ??

        null;

    parameters.dutyStartedAt =

        profile.assignment?.dutyStartedAt ??

        null;

    parameters.dutyEndedAt =

        profile.assignment?.dutyEndedAt ??

        null;

    result.confidence =

        0.99;

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
    config = {}
) {

    query =
        String(
            query ||
            ""
        )
        .trim()
        .toUpperCase();

    if (
        query === ""
    ) {
        return false;
    }

    /*--------------------------
      ALL REQUIRED
    --------------------------*/

    if (
        Array.isArray(
            config.any
        ) &&
        config.any.length > 0 &&
        !config.any.every(
            word =>
                StaffIntent.matchKeyword(
                    query,
                    word
                )
        )
    ) {

        return false;

    }

    /*--------------------------
      AT LEAST ONE
    --------------------------*/

    if (
        Array.isArray(
            config.oneOf
        ) &&
        config.oneOf.length > 0 &&
        !config.oneOf.some(
            word =>
                StaffIntent.matchKeyword(
                    query,
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
        Array.isArray(
            config.exclude
        ) &&
        config.exclude.some(
            word =>
                StaffIntent.matchKeyword(
                    query,
                    word
                )
        )
    ) {

        return false;

    }

    return true;

};

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

    const parameters =

        result.parameters ||

        {};

    /*----------------------------------
      Aggregate Guard
    ----------------------------------*/

    if (

        parameters.isAggregate === true

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
      Preserve Staff
    ----------------------------------*/

    parameters.staff =

        profile;

    result.parameters =

        parameters;

    /*----------------------------------
      Role
    ----------------------------------*/

    if (

        !StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_ROLE

        )

    ) {

        return result;

    }

    result.intent =

        INTENTS.STAFF_ROLE;

    parameters.role =

        profile.identity?.role ??

        profile.role ??

        null;

    parameters.roles =

        profile.identity?.roles ??

        profile.roles ??

        [];

    result.confidence =

        0.99;

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
  Assignment queries belong to
  Assignment detector
----------------------------------*/


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

    const parameters =

        result.parameters ||

        {};

    /*----------------------------------
      Aggregate Guard
    ----------------------------------*/

    if (

        parameters.isAggregate === true

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
if (

    StaffIntent.hasKeyword(

        query,

        KEYWORDS.STAFF_ASSIGNMENT

    )

) {

    return result;

}
    /*----------------------------------
      Preserve Staff
    ----------------------------------*/

    parameters.staff =

        profile;

    result.parameters =

        parameters;

    /*----------------------------------
      Beat
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_BEAT

        )

    ) {

        result.intent =

            INTENTS.STAFF_BEAT;

        parameters.beat =

            profile.posting?.beat ??

            null;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Range
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_RANGE

        )

    ) {

        result.intent =

            INTENTS.STAFF_RANGE;

        parameters.range =

            profile.posting?.range ??

            null;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Division
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_DIVISION

        )

    ) {

        result.intent =

            INTENTS.STAFF_DIVISION;

        parameters.division =

            profile.posting?.division ??

            null;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Circle
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_CIRCLE

        )

    ) {

        result.intent =

            INTENTS.STAFF_CIRCLE;

        parameters.circle =

            profile.posting?.circle ??

            null;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Complete Posting
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_POSTING

        )

    ) {

        result.intent =

            INTENTS.STAFF_POSTING;

        parameters.posting =

            profile.posting ??

            null;

        result.confidence =

            0.99;

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

    /*==================================================
      AGGREGATE DUTY INTENTS
    ==================================================*/

    /*----------------------------------
      Duty Summary
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_DUTY_SUMMARY

        )

    ) {

        result.intent =

            INTENTS.STAFF_DUTY_SUMMARY;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Inactive Staff
      (check before Active)
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

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
      Active Count
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_ACTIVE_COUNT

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
      Active Staff
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

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
      Aggregate Only
    ----------------------------------*/

    if (

        !single

    ) {

        return result;

    }

    /*==================================================
      SINGLE STAFF DUTY
    ==================================================*/

    result.parameters.staff =

        staff[0];

    /*----------------------------------
      Duty Status
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

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
      Duty Started
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_DUTY_STARTED

        )

    ) {

        result.intent =

            INTENTS.STAFF_DUTY_STARTED;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Duty Ended
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_DUTY_ENDED

        )

    ) {

        result.intent =

            INTENTS.STAFF_DUTY_ENDED;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Duty Type
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_DUTY_TYPE

        )

    ) {

        result.intent =

            INTENTS.STAFF_DUTY_TYPE;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Assignment
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_ASSIGNMENT

        )

    ) {

        result.intent =

            INTENTS.STAFF_ASSIGNMENT;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      General Duty
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_DUTY

        )

    ) {

        result.intent =

            INTENTS.STAFF_DUTY;

        result.confidence =

            0.99;

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

    /*==================================
      Aggregate Team Intents
    ==================================*/

    /*----------------------------------
      Team Leader Directory
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

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
      Aggregate Only
    ----------------------------------*/

    if (

        !single

    ) {

        return result;

    }

    /*==================================
      Single Staff Team Intents
    ==================================*/

    parameters.staff =

        staff[0];

    result.parameters =

        parameters;

    /*----------------------------------
      Team Leader
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_LEADER

        )

    ) {

        result.intent =

            INTENTS.STAFF_LEADER;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Team
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_TEAM

        )

    ) {

        result.intent =

            INTENTS.STAFF_TEAM;

        result.confidence =

            0.99;

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

        result.intent ||

        !result.entities

    ) {

        return result;

    }

    const parameters =

        result.parameters ||

        {};

    /*----------------------------------
      Aggregate Queries
    ----------------------------------*/

    if (

        parameters.isAggregate === true

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

    /*----------------------------------
      Preserve Staff
    ----------------------------------*/

    parameters.staff =

        profile;

    result.parameters =

        parameters;

    /*----------------------------------
      Patrol Distance
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_DISTANCE

        )

    ) {

        result.intent =

            INTENTS.STAFF_DISTANCE;

        parameters.distanceKm =

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

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_PATROL_POINTS

        )

    ) {

        result.intent =

            INTENTS.STAFF_PATROL_POINTS;

        parameters.pointCount =

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

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_PATROL_START

        )

    ) {

        result.intent =

            INTENTS.STAFF_PATROL_START;

        parameters.startedAt =

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

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_PATROL_END

        )

    ) {

        result.intent =

            INTENTS.STAFF_PATROL_END;

        parameters.endedAt =

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

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_PATROL_DURATION

        )

    ) {

        result.intent =

            INTENTS.STAFF_PATROL_DURATION;

        parameters.startedAt =

            profile.analytics?.startedAt ||

            null;

        parameters.endedAt =

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

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_ANALYTICS

        )

    ) {

        result.intent =

            INTENTS.STAFF_ANALYTICS;

        parameters.analytics =

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

    /*----------------------------------
      Staff Summary
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_SUMMARY

        )

    ) {

        result.intent =

            INTENTS.STAFF_SUMMARY;

        parameters.staff =

            staff;

        result.parameters =

            parameters;

        result.confidence =

            0.98;

        return result;

    }

    /*----------------------------------
      Jurisdiction Summary
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_JURISDICTION_SUMMARY

        )

    ) {

        result.intent =

            INTENTS.STAFF_JURISDICTION_SUMMARY;

        parameters.staff =

            staff;

        result.parameters =

            parameters;

        result.confidence =

            0.98;

        return result;

    }

    /*----------------------------------
      Designation Summary
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_DESIGNATION_SUMMARY

        )

    ) {

        result.intent =

            INTENTS.STAFF_DESIGNATION_SUMMARY;

        parameters.staff =

            staff;

        result.parameters =

            parameters;

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
/*==================================================
  GLOBAL WHOLE-WORD KEYWORD MATCHER
==================================================*/

StaffIntent.hasKeyword = function (

    query,

    list

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        typeof query !== "string" ||

        !Array.isArray(

            list

        ) ||

        list.length === 0

    ) {

        return false;

    }

    /*----------------------------------
      Normalize Query
    ----------------------------------*/

    query =

        query

            .trim()

            .toUpperCase()

            .replace(

                /\s+/g,

                " "

            );

    if (

        query === ""

    ) {

        return false;

    }

    /*----------------------------------
      Match
    ----------------------------------*/

    for (

        let i = 0;

        i < list.length;

        i++

    ) {

        let keyword =

            list[i];

        if (

            typeof keyword !== "string"

        ) {

            continue;

        }

        keyword =

            keyword

                .trim()

                .toUpperCase()

                .replace(

                    /\s+/g,

                    " "

                );

        if (

            keyword === ""

        ) {

            continue;

        }

        /*------------------------------
          Escape Regex Characters
        ------------------------------*/

        const escaped =

            keyword.replace(

                /[.*+?^${}()|[\]\\]/g,

                "\\$&"

            );

        /*------------------------------
          Whole Word Match
        ------------------------------*/

        const regex =

            new RegExp(

                "(^|\\W)" +

                escaped +

                "(\\W|$)"

            );

        if (

            regex.test(

                query

            )

        ) {

            return true;

        }

    }

    return false;

};
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

    /*==================================================
      AGGREGATE STATUS
    ==================================================*/

    /*----------------------------------
      Inactive List
      (Must come before Active List)
    ----------------------------------*/

    if (
        StaffIntent.hasKeyword(
            query,
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
      Active Count
    ----------------------------------*/

    if (
        StaffIntent.hasKeyword(
            query,
            KEYWORDS.STAFF_ACTIVE_COUNT
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
      Active List
    ----------------------------------*/

    if (
        StaffIntent.hasKeyword(
            query,
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
      Moving Staff
    ----------------------------------*/

    if (
        StaffIntent.hasKeyword(
            query,
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
      Stationary Staff
    ----------------------------------*/

    if (
        StaffIntent.hasKeyword(
            query,
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
      Team Leader List
    ----------------------------------*/

    if (
        StaffIntent.hasKeyword(
            query,
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
      Aggregate Only
    ----------------------------------*/

    if (
        !single
    ) {

        return result;

    }

    /*==================================================
      SINGLE STAFF STATUS
    ==================================================*/

    result.parameters.staff =
        staff[0];

    /*----------------------------------
      Duty Status
    ----------------------------------*/

    if (
        StaffIntent.hasKeyword(
            query,
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
        StaffIntent.hasKeyword(
            query,
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
        StaffIntent.hasKeyword(
            query,
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
        StaffIntent.hasKeyword(
            query,
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
        StaffIntent.hasKeyword(
            query,
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

    /*----------------------------------
      Who Is On Duty
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.WHO_IS_ON_DUTY

        )

    ) {

        parameters.staff =

            staff;

        parameters.dutyActive =

            true;

        result.parameters =

            parameters;

        result.intent =

            INTENTS.WHO_IS_ON_DUTY;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Who Is Patrolling
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.WHO_IS_PATROLLING

        )

    ) {

        parameters.staff =

            staff;

        result.parameters =

            parameters;

        result.intent =

            INTENTS.WHO_IS_PATROLLING;

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

    const parameters =

        result.parameters ||

        {};

    /*----------------------------------
      Aggregate Guard
    ----------------------------------*/

    if (

        parameters.isAggregate === true

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
      Preserve Staff
    ----------------------------------*/

    parameters.staff =

        profile;

    result.parameters =

        parameters;

    /*----------------------------------
      Contact
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_CONTACT

        )

    ) {

        const phone =

            profile.identity?.phone ??

            profile.contact?.phone ??

            null;

        const email =

            profile.identity?.email ??

            profile.contact?.email ??

            null;

        result.intent =

            INTENTS.STAFF_CONTACT;

        parameters.phone =

            phone;

        parameters.email =

            email;

        parameters.contact = {

            phone:

                phone,

            email:

                email

        };

        result.confidence =

            0.99;

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
/*----------------------------------
  Nearby (Single / Self / Aggregate)
----------------------------------*/

result =
    StaffIntent.detectNearbyIntent(
        result
    );

if (

    result.intent ===

    StaffConstants.INTENTS.STAFF_NEARBY

) {

    console.timeEnd(
        "detectStaffIntent"
    );

    console.log(
        "👤 Final Intent:",
        result.intent
    );

    StaffIntent.calculateConfidence(
        result
    );

    result.requiresAI =
        StaffIntent.needsAI(
            result
        );

    result.metadata.executionTime =
        Date.now() -
        started;

    StaffIntent.lastResult =
        result;

    StaffIntent.setCachedResult(
        query,
        result
    );

    console.groupEnd();

    return result;

}
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

      All single-staff detector ordering
      is controlled in one place:
      detectStaffIntent()
    ----------------------------------*/

    result =
        StaffIntent.detectStaffIntent(
            result
        );

}
else if (
    result.parameters.isAggregate === true
) {

    /*----------------------------------
      Aggregate / Global

      Handles:
      - directories
      - counts
      - summaries
      - control-room queries
      - queries without named staff
    ----------------------------------*/

    result =
        StaffIntent.detectGlobalIntent(
            result
        );

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

    const parameters =

        result.parameters ||

        {};

    const entities =

        result.entities ||

        {};

    const staff =

        entities.staff ||

        [];

    /*----------------------------------
      Context
    ----------------------------------*/

    const hasJurisdiction =

        !!parameters.circle ||

        !!parameters.division ||

        !!parameters.range ||

        !!parameters.beat ||

        !!parameters.compartment;

    const hasDesignation =

        (

            entities.designations ||

            []

        ).length > 0;

    /*----------------------------------
      Aggregate Keywords
    ----------------------------------*/

    const aggregateWords = [

        /* Counts */

        "STAFF COUNT",

        "TOTAL STAFF",

        "HOW MANY STAFF",

        "NUMBER OF STAFF",

        "STAFF TOTAL",

        "STAFF STRENGTH",

        "HEADCOUNT",

        /* Directories */

        "ALL STAFF",

        "STAFF LIST",

        "DIRECTORY",

        "LIST STAFF",

        "LIST",

        /* Summary */

        "SUMMARY",

        "DUTY SUMMARY",

        "JURISDICTION SUMMARY",

        "DESIGNATION SUMMARY",

        /* Status */

        "ACTIVE STAFF",

        "INACTIVE STAFF",

        "MOVING STAFF",

        "STATIONARY STAFF",

        "TEAM LEADER LIST",

        "TEAM LEADERS",

        /* Control Room */

        "WHO IS ON DUTY",

        "WHO IS PATROLLING"

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

    /*----------------------------------
      Final Decision
    ----------------------------------*/

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

StaffIntent.detectLocationIntent = function (

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

    const parameters =

        result.parameters ||

        {};

    /*----------------------------------
      Aggregate Guard
    ----------------------------------*/

    if (

        parameters.isAggregate === true

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
      Preserve Staff
    ----------------------------------*/

    parameters.staff =

        profile;

    result.parameters =

        parameters;
/*----------------------------------
  Business Location Type
----------------------------------*/

parameters.locationType = "FULL";

/* Posting */

if (
    /\bPOSTED\b|\bPOSTING\b/i.test(query)
) {
    parameters.locationType = "POSTING";
}

/* GPS */

else if (
    /\bGPS\b|\bLATITUDE\b|\bLONGITUDE\b|\bLAT\b|\bLON\b|\bCOORDINATE\b|\bCOORDINATES\b|\bMAP POINT\b/i.test(query)
) {
    parameters.locationType = "GPS";
}

/* Last Seen */

else if (
    /\bLAST SEEN\b|\bLAST KNOWN\b|\bLAST REPORTED\b/i.test(query)
) {
    parameters.locationType = "LAST_SEEN";
}

/* Live */

else if (
    /\bLIVE LOCATION\b|\bREALTIME LOCATION\b|\bREAL TIME LOCATION\b|\bLIVE POSITION\b|\bLIVE TRACK\b/i.test(query)
) {
    parameters.locationType = "LIVE";
}

/* Track */

else if (
    /\bTRACK LOCATION\b|\bTRACK POSITION\b|\bCURRENT TRACK\b/i.test(query)
) {
    parameters.locationType = "TRACK";
}

/* Beat */

else if (
    /\bWHICH BEAT\b/i.test(query)
) {
    parameters.locationType = "BEAT";
}

/* Range */

else if (
    /\bWHICH RANGE\b/i.test(query)
) {
    parameters.locationType = "RANGE";
}

/* Division */

else if (
    /\bWHICH DIVISION\b/i.test(query)
) {
    parameters.locationType = "DIVISION";
}

/* Area */

else if (
    /\bWHICH AREA\b|\bWHICH PLACE\b/i.test(query)
) {
    parameters.locationType = "AREA";
}

/* Current */

else if (
    /\bWHERE IS\b|\bWHERE IS NOW\b|\bWHERE IS CURRENTLY\b|\bCURRENT LOCATION\b|\bLATEST LOCATION\b|\bPRESENT LOCATION\b|\bCURRENT POSITION\b|\bCURRENT PLACE\b|\bLOCATION\b/i.test(query)
) {
    parameters.locationType = "CURRENT";
}
    /*----------------------------------
      Staff Location
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_LOCATION

        )

    ) {

        result.intent =

            INTENTS.STAFF_LOCATION;

        result.confidence =

            0.99;

        return result;

    }

    return result;

};
StaffIntent.detectNearbyIntent = function (

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

    const parameters =

        result.parameters ||

        {};

    const staff =

        Array.isArray(

            result.entities?.staff

        )

            ? result.entities.staff

            : [];

    /*----------------------------------
      Nearby Keywords
    ----------------------------------*/

    const hasNearby =

        StaffIntent.hasKeyword(

            query,

            StaffConstants.KEYWORDS.STAFF_NEARBY

        );

    if (

        !hasNearby

    ) {

        return result;

    }

    /*----------------------------------
      Intent
    ----------------------------------*/

    result.intent =

        StaffConstants.INTENTS.STAFF_NEARBY;

    result.confidence =

        0.99;

    /*----------------------------------
      Reference = Named Staff
    ----------------------------------*/

    if (

        staff.length > 0

    ) {

        parameters.isSingle =

            true;

        parameters.reference =

            "STAFF";

    }

    /*----------------------------------
      Reference = Logged-in User
    ----------------------------------*/

    else if (

        /\bME\b/.test(

            query

        ) ||

        /\bMY\b/.test(

            query

        ) ||

        /\bMYSELF\b/.test(

            query

        ) ||

        /\bHERE\b/.test(

            query

        ) ||

        /\bMY LOCATION\b/.test(

            query

        ) ||

        /\bCURRENT LOCATION\b/.test(

            query

        )

    ) {

        parameters.reference =

            "SELF";

    }

    /*----------------------------------
      Reference = Automatic
    ----------------------------------*/

    else {

        parameters.reference =

            "AUTO";

    }

    result.parameters =

        parameters;

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





    /*=========================================================
      REMAINING DETECTORS REQUIRE A STAFF ENTITY
    =========================================================*/

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


    /*=========================================================
      2. ASSIGNMENT

      Specific assignment questions should be resolved
      before generic posting or duty detection.

      Examples:
      "What is Dhiraj's assignment?"
      "Which beat is Dhiraj assigned to?"
    =========================================================*/

    result =
        StaffIntent.detectAssignmentIntent(
            result
        );

    if (
        result.intent ===
        INTENTS.STAFF_ASSIGNMENT
    ) {

        debugParameters(
            result.intent
        );

        return result;

    }


    /*=========================================================
      3. DUTY STATUS

      Specific duty-status detection before broader duty logic.

      Example:
      "Is Dhiraj on duty?"
    =========================================================*/

    result =
        StaffIntent.detectDutyStatusIntent(
            result
        );

    if (
        result.intent ===
        INTENTS.STAFF_DUTY_STATUS
    ) {

        debugParameters(
            result.intent
        );

        return result;

    }


    /*=========================================================
      4. CONTACT

      Example:
      "What is Dhiraj's phone number?"
      "Give me Dhiraj's contact"
    =========================================================*/

    result =
        StaffIntent.detectContactIntent(
            result
        );

    if (
        result.intent ===
        INTENTS.STAFF_CONTACT
    ) {

        debugParameters(
            result.intent
        );

        return result;

    }


    /*=========================================================
      5. DESIGNATION

      Example:
      "What is Dhiraj's designation?"
    =========================================================*/

    result =
        StaffIntent.detectDesignationIntent(
            result
        );

    if (
        result.intent ===
        INTENTS.STAFF_DESIGNATION
    ) {

        debugParameters(
            result.intent
        );

        return result;

    }


    /*=========================================================
      6. ROLE

      Example:
      "What is Dhiraj's role?"
    =========================================================*/

    result =
        StaffIntent.detectRoleIntent(
            result
        );

    if (
        result.intent ===
        INTENTS.STAFF_ROLE
    ) {

        debugParameters(
            result.intent
        );

        return result;

    }


    /*=========================================================
      7. POSTING

      Single-staff jurisdiction/posting questions.

      Examples:
      "Which range is Dhiraj posted in?"
      "What is Dhiraj's beat?"
    =========================================================*/

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


    /*=========================================================
      8. DUTY

      Remaining duty-related single-staff intents.
    =========================================================*/

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


    /*=========================================================
      9. TEAM
    =========================================================*/

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


/*=========================================================
  GPS

  Must run BEFORE generic location detection.

  Handles:
  - STAFF_SPEED
  - STAFF_HEADING
  - STAFF_ACCURACY
=========================================================*/

result =
    StaffIntent.detectGPSIntent(
        result
    );

if (
    result.intent === INTENTS.STAFF_SPEED ||
    result.intent === INTENTS.STAFF_HEADING ||
    result.intent === INTENTS.STAFF_ACCURACY
) {

    debugParameters(
        result.intent
    );

    return result;

}


/*=========================================================
  LOCATION

  Generic location detection runs after specific
  GPS field detection.
=========================================================*/

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


    /*=========================================================
      11. PATROL ANALYTICS

      Specific analytics should be resolved before
      generic profile fallback.
    =========================================================*/

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


    /*=========================================================
      12. PROFILE — LAST FALLBACK

      Generic profile detection must come after all
      specific single-staff intents.

      Example:
      "Show Dhiraj's profile"
      "Details of Dhiraj"
    =========================================================*/

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


    /*=========================================================
      NO SINGLE-STAFF INTENT
    =========================================================*/

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

    const parameters =

        result.parameters ||

        {};

    /*----------------------------------
      Aggregate Guard
    ----------------------------------*/

    if (

        parameters.isAggregate === true

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
      Preserve Staff
    ----------------------------------*/

    parameters.staff =

        profile;

    result.parameters =

        parameters;

    /*----------------------------------
      Staff Profile
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_PROFILE

        )

    ) {

        result.intent =

            INTENTS.STAFF_PROFILE;

        parameters.profile =

            profile.identity ||

            null;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Contact
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_CONTACT

        )

    ) {

        result.intent =

            INTENTS.STAFF_CONTACT;

        parameters.phone =

            profile.identity?.phone ??

            profile.contact?.phone ??

            null;

        parameters.email =

            profile.identity?.email ??

            profile.contact?.email ??

            null;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Role
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_ROLE

        )

    ) {

        result.intent =

            INTENTS.STAFF_ROLE;

        parameters.role =

            profile.identity?.role ??

            null;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Designation
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_DESIGNATION

        )

    ) {

        result.intent =

            INTENTS.STAFF_DESIGNATION;

        parameters.designation =

            profile.identity?.designation ??

            null;

        result.confidence =

            0.99;

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

StaffIntent.detectGPSIntent = function (

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

    const parameters =

        result.parameters ||

        {};

    /*----------------------------------
      Aggregate Guard
    ----------------------------------*/

    if (

        parameters.isAggregate === true

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
      Preserve Staff
    ----------------------------------*/

    parameters.staff =

        profile;

    result.parameters =

        parameters;

    /*----------------------------------
      GPS
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_GPS

        )

    ) {

        result.intent =

            INTENTS.STAFF_GPS;

        parameters.gps =

            profile.gps ??

            null;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Speed
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_SPEED

        )

    ) {

        result.intent =

            INTENTS.STAFF_SPEED;

        parameters.speed =

            profile.gps?.speed ??

            null;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Heading
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_HEADING

        )

    ) {

        result.intent =

            INTENTS.STAFF_HEADING;

        parameters.heading =

            profile.gps?.heading ??

            null;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Accuracy
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_ACCURACY

        )

    ) {

        result.intent =

            INTENTS.STAFF_ACCURACY;

        parameters.accuracy =

            profile.gps?.accuracy ??

            null;

        result.confidence =

            0.99;

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

    if (result.intent) {

        console.log(
            "✅ Control Room:",
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

    if (result.intent) {

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

    if (result.intent) {

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

    if (result.intent) {

        console.log(
            "✅ Directory:",
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

    if (result.intent) {

        console.log(
            "✅ Duty:",
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

    if (result.intent) {

        console.log(
            "✅ Status:",
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

    if (result.intent) {

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

    if (result.intent) {

        console.log(
            "✅ Team:",
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
      GIS Spatial Query
    ----------------------------------*/

    if (

        /\b(INSIDE|WITHIN)\b/

        .test(

            query

        )

    ) {

        return result;

    }

    /*----------------------------------
      Boolean Filters
    ----------------------------------*/

    if (

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
      Active Staff Count
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

    /*----------------------------------
      Ignore Count Queries
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
      Ignore Aggregate Status Queries
    ----------------------------------*/

    if (

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_ACTIVE_LIST

        ) ||

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_ACTIVE_COUNT

        ) ||

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_INACTIVE_LIST

        ) ||

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_INACTIVE_COUNT

        ) ||

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_MOVING

        ) ||

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_STATIONARY

        ) ||

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_TEAM_LEADER_LIST

        ) ||

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_DUTY_SUMMARY

        )

    ) {

        return result;

    }

    /*----------------------------------
      Entity Flags
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

    /*----------------------------------
      Explicit Directory Language Only
    ----------------------------------*/

    const directoryQuery =

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_DIRECTORY

        ) ||

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_CIRCLE_DIRECTORY

        ) ||

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_DIVISION_DIRECTORY

        ) ||

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_RANGE_DIRECTORY

        ) ||

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_BEAT_DIRECTORY

        ) ||

        StaffIntent.hasKeyword(

            query,

            KEYWORDS.STAFF_DESIGNATION_DIRECTORY

        );

    if (

        !directoryQuery

    ) {

        return result;

    }

    /*----------------------------------
      Designation Directory
      Highest Priority
    ----------------------------------*/

    if (

        hasDesignation

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

        hasBeat

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

        hasRange

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

        hasDivision

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

        hasCircle

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

    result.intent =

        INTENTS.STAFF_DIRECTORY;

    result.parameters.staff =

        staff;

    result.confidence =

        0.95;

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
