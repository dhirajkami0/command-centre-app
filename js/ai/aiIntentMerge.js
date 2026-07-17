(function (window) {

"use strict";

/*=========================================================
 NAMESPACE
=========================================================*/

const GG =

    window.GreenGuardAI =

    window.GreenGuardAI || {};

/*=========================================================
 PREVENT DOUBLE LOADING
=========================================================*/

if (

    GG.AIIntentMerge

) {

    console.warn(

        "[GreenGuardAI] AI Intent Merge already loaded."

    );

    return;

}

/*=========================================================
 MODULE
=========================================================*/

const AIIntentMerge = {};

/*=========================================================
 INFO
=========================================================*/

AIIntentMerge.VERSION =

    "1.0.0";

AIIntentMerge.initialized =

    false;

/*=========================================================
 INIT
=========================================================*/

AIIntentMerge.init = function () {

    if (

        AIIntentMerge.initialized

    ) {

        return;

    }

    AIIntentMerge.initialized =

        true;

    console.log(

        "%cGreenGuard AI Intent Merge Ready",

        "color:#795548;font-weight:bold;"

    );

};
/*=========================================================
 MERGE INTENTS
=========================================================*/

AIIntentMerge.merge = function (

    localIntent = {},

    aiIntent = {}

) {

    AIIntentMerge.init();

    /*----------------------------------
      Validate Inputs
    ----------------------------------*/

    localIntent =

        localIntent || {};

    aiIntent =

        aiIntent || {};

    /*----------------------------------
      Choose Winner
    ----------------------------------*/

    if (

        AIIntentMerge.shouldUseAI(

            localIntent,

            aiIntent

        )

    ) {

        return AIIntentMerge.createMergedIntent(

            aiIntent,

            localIntent

        );

    }

    /*----------------------------------
      Local Wins
    ----------------------------------*/

    return AIIntentMerge.createMergedIntent(

        localIntent,

        aiIntent

    );

};
  /*=========================================================
 SHOULD USE AI
=========================================================*/

AIIntentMerge.shouldUseAI = function (

    localIntent = {},

    aiIntent = {}

) {

    AIIntentMerge.init();

    /*----------------------------------
      AI Must Be Valid
    ----------------------------------*/

    if (

        !aiIntent.success ||

        !aiIntent.validated

    ) {

        return false;

    }

    /*----------------------------------
      AI Must Have Valid Intent
    ----------------------------------*/

    if (

        aiIntent.intent ===

        "UNKNOWN"

    ) {

        return false;

    }

    /*----------------------------------
      Local Failed
    ----------------------------------*/

    if (

        !localIntent.success

    ) {

        return true;

    }

    /*----------------------------------
      Confidence Comparison
    ----------------------------------*/

    return (

        aiIntent.confidence >

        localIntent.confidence

    );

};

  /*=========================================================
 SHOULD USE LOCAL
=========================================================*/

AIIntentMerge.shouldUseLocal = function (

    localIntent = {},

    aiIntent = {}

) {

    AIIntentMerge.init();

    return !AIIntentMerge.shouldUseAI(

        localIntent,

        aiIntent

    );

};

  /*=========================================================
 MERGE ENTITIES
=========================================================*/

AIIntentMerge.mergeEntities = function (

    localEntities = {},

    aiEntities = {}

) {

    AIIntentMerge.init();

    /*----------------------------------
      Normalize
    ----------------------------------*/

    localEntities =

        localEntities || {};

    aiEntities =

        aiEntities || {};

    /*----------------------------------
      Start With Local
    ----------------------------------*/

    const merged = {

        ...localEntities

    };

    /*----------------------------------
      Merge AI Entities
    ----------------------------------*/

    Object.keys(

        aiEntities

    ).forEach(

        function (

            key

        ) {

            if (

                merged[key] ===

                undefined ||

                merged[key] ===

                null ||

                merged[key] === ""

            ) {

                merged[key] =

                    aiEntities[key];

            }

        }

    );

    return merged;

};

  /*=========================================================
 CREATE MERGED INTENT
=========================================================*/

AIIntentMerge.createMergedIntent = function (

    winner = {},

    loser = {}

) {

    AIIntentMerge.init();

    /*----------------------------------
      Normalize
    ----------------------------------*/

    winner =

        winner || {};

    loser =

        loser || {};

    /*----------------------------------
      Merge Entities
    ----------------------------------*/

    const entities =

        AIIntentMerge.mergeEntities(

            winner.entities,

            loser.entities

        );

    /*----------------------------------
      Build Response
    ----------------------------------*/

    return {

        success: true,

        source:

            winner.source ||

            "UNKNOWN",

        provider:

            winner.provider ||

            "UNKNOWN",

        domain:

            winner.domain ||

            "UNKNOWN",

        intent:

            winner.intent ||

            "UNKNOWN",

        confidence:

            winner.confidence ||

            0,

        entities,

        winner:

            winner.source ||

            "UNKNOWN",

        localIntent:

            loser.source === "LOCAL"

                ? loser

                : winner.source === "LOCAL"

                    ? winner

                    : null,

        aiIntent:

            loser.source === "AI"

                ? loser

                : winner.source === "AI"

                    ? winner

                    : null

    };

};

  /*=========================================================
 CREATE FALLBACK INTENT
=========================================================*/
/*=========================================================
 CREATE FALLBACK INTENT
=========================================================*/

AIIntentMerge.createFallbackIntent = function (

    message = "Unable to determine intent."

) {

    AIIntentMerge.init();

    return {

        success: false,

        merged: false,

        validated: false,

        source:

            "AIIntentMerge",

        provider:

            "NONE",

        detector:

            "NONE",

        domain:

            "UNKNOWN",

        intent:

            "UNKNOWN",

        confidence:

            0,

        entities: {},

        winner:

            "NONE",

        localIntent:

            null,

        aiIntent:

            null,

        raw:

            null,

        error:

            String(

                message

            )

    };

};
/*=========================================================
 REGISTER
=========================================================*/

GG.AIIntentMerge =

    AIIntentMerge;

console.log(

    "%cGreenGuard AI Intent Merge Loaded",

    "color:#795548;font-weight:bold;"

);

})(window);
