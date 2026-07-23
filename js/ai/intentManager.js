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

    GG.IntentManager

) {

    console.warn(

        "[GreenGuardAI] Intent Manager already loaded."

    );

    return;

}

/*=========================================================
 MODULE
=========================================================*/

const IntentManager = {};

/*=========================================================
 BUSINESS REGISTRY (Startup)
=========================================================*/

/*=========================================================
 BUSINESS REGISTRY
=========================================================*/

/*
 * Central registry of domains, intents and entity types
 * that Gemini is allowed to classify.
 *
 * IMPORTANT:
 *
 * This registry does NOT perform intent detection.
 *
 * It only tells the AI classifier which business
 * concepts already exist in GreenGuard.
 *
 * Therefore:
 *
 * StaffIntent
 * SightingIntent
 * GISIntent
 * WildlifeIntent
 * PatrolIntent
 * etc.
 *
 * remain independently responsible for LOCAL detection.
 */

GG.BusinessRegistry = Object.freeze({

    /*-----------------------------------------------------
      CONFIDENCE
    -----------------------------------------------------*/

    confidenceThreshold:

        GG.Config?.INTENT?.HIGH_CONFIDENCE ??

        0.90,


    /*-----------------------------------------------------
      DOMAINS
    -----------------------------------------------------*/

    domains: Object.freeze(

        [

            /* Staff */

            GG.StaffConstants?.DOMAIN,


            /* GIS */

            GG.GISConstants?.DOMAIN,


            /* Elephant Sighting / HEC */

            GG.SightingConstants?.DOMAIN,


            /* Existing Domains */

            "wildlife",

            "patrol",

            "legal",

            "analytics",

            "report",

            "fire"

        ]

        .filter(Boolean)

        .filter(

            function (

                value,

                index,

                array

            ) {

                return (

                    array.indexOf(value) ===

                    index

                );

            }

        )

    ),


    /*-----------------------------------------------------
      INTENTS
    -----------------------------------------------------*/

    intents: Object.freeze(

        [

            /*----------------------------------
              STAFF
            ----------------------------------*/

            ...Object.values(

                GG.StaffConstants
                    ?.INTENTS ||

                {}

            ),


            /*----------------------------------
              ELEPHANT SIGHTING / HEC
            ----------------------------------*/

            ...Object.values(

                GG.SightingConstants
                    ?.INTENTS ||

                {}

            ),


            /*----------------------------------
              GIS

              Include when GISConstants exposes
              an INTENTS registry.
            ----------------------------------*/

            ...Object.values(

                GG.GISConstants
                    ?.INTENTS ||

                {}

            )

        ]

        .filter(Boolean)

        .filter(

            function (

                value,

                index,

                array

            ) {

                return (

                    array.indexOf(value) ===

                    index

                );

            }

        )

    ),


    /*-----------------------------------------------------
      ENTITY TYPES
    -----------------------------------------------------*/

    entityTypes: Object.freeze(

        [

            /*----------------------------------
              STAFF
            ----------------------------------*/

            ...Object.values(

                GG.StaffConstants
                    ?.ENTITY_TYPES ||

                {}

            ),


            /*----------------------------------
              ELEPHANT SIGHTING / HEC
            ----------------------------------*/

            ...Object.values(

                GG.SightingConstants
                    ?.ENTITY_TYPES ||

                {}

            ),


            /*----------------------------------
              GIS
            ----------------------------------*/

            ...Object.values(

                GG.GISConstants
                    ?.ENTITY_TYPES ||

                {}

            )

        ]

        .filter(Boolean)

        .filter(

            function (

                value,

                index,

                array

            ) {

                return (

                    array.indexOf(value) ===

                    index

                );

            }

        )

    )

});
/*=========================================================
 INFO
=========================================================*/

IntentManager.VERSION =

    "1.0.0";

IntentManager.initialized =

    false;

/*=========================================================
 INIT
=========================================================*/

IntentManager.init = function () {

    if (

        IntentManager.initialized

    ) {

        return;

    }

    IntentManager.initialized =

        true;

    console.log(

        "%cGreenGuard Intent Manager Ready",

        "color:#009688;font-weight:bold;"

    );

};/*=========================================================
 NORMALIZE QUERY
=========================================================*/

IntentManager.normalize = function (

    query

) {

    IntentManager.init();

    /*----------------------------------
      Null Protection
    ----------------------------------*/

    if (

        query === undefined ||

        query === null

    ) {

        return "";

    }

    /*----------------------------------
      Convert to String
    ----------------------------------*/

    query =

        String(

            query

        );

    /*----------------------------------
      Trim
    ----------------------------------*/

    query =

        query.trim();

    /*----------------------------------
      Multiple Spaces
    ----------------------------------*/

    query =

        query.replace(

            /\s+/g,

            " "

        );

    /*----------------------------------
      Uppercase
    ----------------------------------*/

    query =

        query.toUpperCase();

    /*----------------------------------
      Remove Ending Punctuation
    ----------------------------------*/

    query =

        query.replace(

            /[?!.,]+$/g,

            ""

        );

    /*----------------------------------
      Return
    ----------------------------------*/

    return query;

};/*=========================================================
 GET CACHED INTENT
=========================================================*/

IntentManager.getCachedIntent = async function (

    query

) {

    IntentManager.init();

    const Cache =

        GG.Cache;

    /*----------------------------------
      Cache Not Available
    ----------------------------------*/

    if (

        !Cache ||

        typeof Cache.getIntent !==

        "function"

    ) {

        return null;

    }

    /*----------------------------------
      Normalize
    ----------------------------------*/

    query =

        IntentManager.normalize(

            query

        );

    /*----------------------------------
      Read Cache
    ----------------------------------*/

    const intent =

        await Cache.getIntent(

            query

        );

    /*----------------------------------
      Debug
    ----------------------------------*/

    if (

        GG.Config?.DEBUG?.ENABLED &&

        intent

    ) {

        console.log(

            "🟢 Intent Cache HIT",

            query,

            intent

        );

    }

    return intent;

};

/*=========================================================
 SET CACHED INTENT
=========================================================*/

IntentManager.setCachedIntent = async function (

    query,

    intent

) {

    IntentManager.init();

    const Cache =

        GG.Cache;

    /*----------------------------------
      Cache Not Available
    ----------------------------------*/

    if (

        !Cache ||

        typeof Cache.setIntent !==

        "function"

    ) {

        return;

    }

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !intent ||

        typeof intent !==

        "object"

    ) {

        return;

    }

    /*----------------------------------
      Normalize Query
    ----------------------------------*/

    query =

        IntentManager.normalize(

            query

        );

    /*----------------------------------
      Store
    ----------------------------------*/

    await Cache.setIntent(

        query,

        intent

    );

    /*----------------------------------
      Debug
    ----------------------------------*/

    if (

        GG.Config?.DEBUG?.ENABLED

    ) {

        console.log(

            "💾 Intent Cached",

            query

        );

    }

};/*=========================================================
 DETECT LOCAL INTENT
=========================================================*/

IntentManager.detectLocal = function (

    query

) {

    IntentManager.init();

    const started =

        Date.now();

    console.group(

        "🟣 INTENT MANAGER - LOCAL DETECTION"

    );

    /*----------------------------------
      Normalize
    ----------------------------------*/

    query =

        IntentManager.normalize(

            query

        );

    /*----------------------------------
      Local Intent Modules
    ----------------------------------*/

const detectors = [

    GG.StaffIntent,

    GG.SightingIntent,

    GG.WildlifeIntent,

    GG.GISIntent,

    GG.PatrolIntent,

    GG.LegalIntent,

    GG.ReportIntent,

    GG.AnalyticsIntent

];

    let bestIntent =

        null;

    let bestConfidence =

        0;

    let bestDetector =

        null;

    /*----------------------------------
      Execute Local Detectors
    ----------------------------------*/

    for (

        const detector of detectors

    ) {

        if (

            !detector ||

            typeof detector.detect !==

            "function"

        ) {

            continue;

        }

        const detectorName =

            detector.constructor?.name ||

            detector.VERSION ||

            "UnknownDetector";

        try {

            const intent =

                detector.detect(

                    query

                );

            if (

                !intent ||

                typeof intent !==

                "object"

            ) {

                continue;

            }

            const confidence =

                Number(

                    intent.confidence ||

                    0

                );

            if (

                confidence >

                bestConfidence

            ) {

                bestConfidence =

                    confidence;

                bestIntent =

                    intent;

                bestDetector =

                    detectorName;

                bestIntent.winningDetector = detectorName;

            }

        }

        catch (

            err

        ) {

            console.error(

                "Detector Error:",

                err

            );

        }

    }

    /*----------------------------------
      Nothing Found
    ----------------------------------*/

    if (

        !bestIntent

    ) {

        console.groupEnd();

        return {

            success: false,

            source: "local",

            provider:

                "IntentManager",

            query:

                query,

            confidence:

                0,

            domain:

                "unknown",

            intent:

                "unknown",

            entities: {}

        };

    }

    /*----------------------------------
      Final Metadata
    ----------------------------------*/

    bestIntent.success = true;

    bestIntent.source = "local";

    bestIntent.provider = "IntentManager";

    bestIntent.query = query;

    bestIntent.domain = bestIntent.domain || "unknown";

    bestIntent.intent = bestIntent.intent || "unknown";

    bestIntent.entities = bestIntent.entities || {};

    bestIntent.confidence = Number(bestIntent.confidence || 0);

    console.groupEnd();

    return bestIntent;

};
 
 // Build Gemini Intent Request

IntentManager.buildAIRequest = function (

    query,

    localIntent = {}

) {

    return {

        query,

        normalizedQuery:

            IntentManager.normalize(query),

        detector: {
            winner: localIntent.winningDetector || "UNKNOWN",
            provider: localIntent.provider || "UNKNOWN"
        },

        localIntent: {

            success:

                localIntent.success,

            source:

                "IntentManager",

            domain:

                localIntent.domain ||

                "UNKNOWN",

            intent:

                localIntent.intent ||

                "UNKNOWN",

            confidence:

                localIntent.confidence ||

                0,

            entities:

                localIntent.entities ||

                {},

            parameters:

                localIntent.parameters ||

                {},

            context:

                localIntent.context ||

                {}

        },

        extractedEntities:

            localIntent.entities || {},

        business: GG.BusinessRegistry,

        rules: {

            classifyOnly:

                true,

            allowNewIntent:

                false,

            allowNewDomain:

                false,

            allowNewEntityType:

                false,

            allowReasoning:

                false

        }

    };

};
 
 
 /*=========================================================
 SHOULD USE AI
=========================================================*/

IntentManager.shouldUseAI = function (

    intent

) {

    IntentManager.init();

    const Config =

        GG.Config;

    /*----------------------------------
      Invalid Intent
    ----------------------------------*/

    if (

        !intent ||

        typeof intent !== "object"

    ) {

        return true;

    }

    /*----------------------------------
      Read Confidence
    ----------------------------------*/

    const confidence =

        Number(

            intent.confidence || 0

        );

    /*----------------------------------
      Config Threshold
    ----------------------------------*/

    const threshold =

        Config?.INTENT?.HIGH_CONFIDENCE ||

        0.80;

    /*----------------------------------
      High Confidence

      Stay Local
    ----------------------------------*/

    if (

        confidence >=

        threshold

    ) {

        if (

            GG.Config?.DEBUG?.ENABLED

        ) {

            console.log(

                "🟢 Local Intent Accepted",

                confidence

            );

        }

        return false;

    }

    /*----------------------------------
      Low Confidence

      AI Required
    ----------------------------------*/

    return true;

};/*=========================================================
 DETECT INTENT
=========================================================*/

IntentManager.detect = async function (

    query

) {

    IntentManager.init();

    /*----------------------------------
      Normalize Query
    ----------------------------------*/

    query =

        IntentManager.normalize(

            query

        );

    /*----------------------------------
      Intent Cache
    ----------------------------------*/

    let intent =

        await IntentManager.getCachedIntent(

            query

        );

    if (

        intent

    ) {

        return intent;

    }

    /*----------------------------------
      Local Intent Detection
    ----------------------------------*/

    intent =

        IntentManager.detectLocal(

            query

        );
console.log("LOCAL:", intent);

console.log(
    "USE AI:",
    IntentManager.shouldUseAI(intent)
);
    /*----------------------------------
      High Confidence

      Stay Local
  ----------------------------------*/

    if (

        !IntentManager.shouldUseAI(

            intent

        )

    ) {

        await IntentManager.setCachedIntent(

            query,

            intent

        );

        return intent;

    }

    /*----------------------------------
      AI Intent Detection
  ----------------------------------*/

    const AI =

        GG.AI;

    if (

        !AI ||

        typeof AI.detectIntent !==

        "function"

    ) {

        await IntentManager.setCachedIntent(

            query,

            intent

        );

        return intent;

    }

    try {

const request =

    IntentManager.buildAIRequest(

        query,

        intent

    );

const aiIntent =

    await AI.detectIntent(

        request

    );

/*=========================================================
 NORMALIZE AI INTENT TO BUSINESS REGISTRY

 IMPORTANT:
 This affects ONLY the AI result.

 Local intent detection is NOT modified.

 Examples:
 STAFF_PROFILE     -> staffProfile
 STAFF_CONTACT     -> staffContact
 WHO_IS_ON_DUTY    -> whoIsOnDuty

 If Gemini already returns:
 staffProfile

 it remains:
 staffProfile
=========================================================*/

if (

    aiIntent &&

    typeof aiIntent.intent === "string"

) {

    const registry =

        GG.BusinessRegistry || {};

    const intents =

        Array.isArray(

            registry.intents

        )

            ? registry.intents

            : [];

    const rawIntent =

        aiIntent.intent.trim();

    /*----------------------------------
      1. Exact Canonical Match

      staffProfile -> staffProfile
    ----------------------------------*/

    let canonicalIntent =

        intents.find(

            function (

                value

            ) {

                return (

                    value ===

                    rawIntent

                );

            }

        );

    /*----------------------------------
      2. Case-Insensitive Match

      STAFFPROFILE -> staffProfile
    ----------------------------------*/

    if (

        !canonicalIntent

    ) {

        canonicalIntent =

            intents.find(

                function (

                    value

                ) {

                    return (

                        String(

                            value

                        ).toLowerCase() ===

                        rawIntent.toLowerCase()

                    );

                }

            );

    }

    /*----------------------------------
      3. CONSTANT_STYLE -> camelCase

      STAFF_PROFILE
          -> staffProfile

      STAFF_CONTACT
          -> staffContact

      WHO_IS_ON_DUTY
          -> whoIsOnDuty
    ----------------------------------*/

    if (

        !canonicalIntent

    ) {

        const converted =

            rawIntent

                .toLowerCase()

                .split("_")

                .filter(

                    Boolean

                )

                .map(

                    function (

                        part,

                        index

                    ) {

                        if (

                            index === 0

                        ) {

                            return part;

                        }

                        return (

                            part.charAt(0)

                                .toUpperCase() +

                            part.slice(1)

                        );

                    }

                )

                .join("");

        canonicalIntent =

            intents.find(

                function (

                    value

                ) {

                    return (

                        String(

                            value

                        ).toLowerCase() ===

                        converted.toLowerCase()

                    );

                }

            );

    }

    /*----------------------------------
      4. Apply Canonical Intent

      ONLY modify when a real registry
      intent was found.
    ----------------------------------*/

    if (

        canonicalIntent

    ) {

        aiIntent.intent =

            canonicalIntent;

    }

    /*----------------------------------
      Temporary Debug
    ----------------------------------*/

    console.log(

        "🧠 AI INTENT CANONICALIZATION",

        {

            raw:

                rawIntent,

            canonical:

                canonicalIntent ||

                "NOT_FOUND",

            final:

                aiIntent.intent

        }

    );

}

/*----------------------------------
  Merge AI With Local Result
----------------------------------*/

if (

    aiIntent &&

    aiIntent.success !== false

) {

    intent =

        IntentManager.mergeIntent(

            intent,

            aiIntent

        );

}

    }

    catch (err) {

        console.error(

            err

        );

    }

    /*----------------------------------
      Cache Final Intent
  ----------------------------------*/

    await IntentManager.setCachedIntent(

        query,

        intent

    );

    return intent;

};/*=========================================================
 MERGE INTENT
=========================================================*/

/*=========================================================
 MERGE INTENT
=========================================================*/

/*=========================================================
 MERGE INTENT
=========================================================*/

IntentManager.mergeIntent = function (

    localIntent,

    aiIntent

) {

    IntentManager.init();


    /*=====================================================
      INVALID AI RESULT

      If AI returned nothing usable, preserve the complete
      local detector result exactly as it is.
    =====================================================*/

    if (

        !aiIntent ||

        typeof aiIntent !==
            "object"

    ) {

        return localIntent;

    }


    /*=====================================================
      NORMALIZE AI INTENT AGAINST BUSINESS REGISTRY

      Examples:

      STAFF_PROFILE
          ->
      staffProfile

      SIGHTING_ACTIVE
          ->
      sightingActive

      WHO_IS_ON_DUTY
          ->
      whoIsOnDuty

      Already canonical values remain unchanged.
    =====================================================*/

    if (

        typeof aiIntent.intent ===
            "string"

    ) {

        const registry =

            GG.BusinessRegistry ||

            {};


        const intents =

            Array.isArray(

                registry.intents

            )

                ? registry.intents

                : [];


        const rawIntent =

            aiIntent.intent
                .trim();


        let canonicalIntent =

            null;


        /*-------------------------------------------------
          1. EXACT CANONICAL MATCH

          Example:

          staffProfile
              ->
          staffProfile
        -------------------------------------------------*/

        canonicalIntent =

            intents.find(

                function (

                    value

                ) {

                    return (

                        value ===
                        rawIntent

                    );

                }

            ) ||

            null;


        /*-------------------------------------------------
          2. CASE-INSENSITIVE MATCH

          Example:

          STAFFPROFILE
              ->
          staffProfile
        -------------------------------------------------*/

        if (

            !canonicalIntent

        ) {

            canonicalIntent =

                intents.find(

                    function (

                        value

                    ) {

                        return (

                            String(

                                value

                            )
                                .toLowerCase() ===

                            rawIntent
                                .toLowerCase()

                        );

                    }

                ) ||

                null;

        }


        /*-------------------------------------------------
          3. CONSTANT_STYLE -> camelCase

          Examples:

          STAFF_PROFILE
              ->
          staffProfile

          SIGHTING_ACTIVE
              ->
          sightingActive

          WHO_IS_ON_DUTY
              ->
          whoIsOnDuty

          HEC_RISK_SUMMARY
              ->
          hecRiskSummary
        -------------------------------------------------*/

        if (

            !canonicalIntent &&

            rawIntent.includes(

                "_"

            )

        ) {

            const converted =

                rawIntent

                    .toLowerCase()

                    .split(

                        "_"

                    )

                    .filter(

                        Boolean

                    )

                    .map(

                        function (

                            part,

                            index

                        ) {

                            if (

                                index === 0

                            ) {

                                return part;

                            }


                            return (

                                part
                                    .charAt(0)
                                    .toUpperCase() +

                                part
                                    .slice(1)

                            );

                        }

                    )

                    .join(

                        ""

                    );


            canonicalIntent =

                intents.find(

                    function (

                        value

                    ) {

                        return (

                            String(

                                value

                            )
                                .toLowerCase() ===

                            converted
                                .toLowerCase()

                        );

                    }

                ) ||

                null;

        }


        /*-------------------------------------------------
          4. APPLY CANONICAL INTENT

          IMPORTANT:

          AI intent is changed ONLY when the resulting
          intent actually exists inside BusinessRegistry.

          This protects existing Staff, GIS, Wildlife,
          Patrol, Legal, Analytics, Report and Sighting
          pipelines from unknown AI-generated intents.
        -------------------------------------------------*/

        if (

            canonicalIntent

        ) {

            aiIntent = {

                ...aiIntent,

                intent:

                    canonicalIntent

            };

        }


        /*-------------------------------------------------
          DEBUG
        -------------------------------------------------*/

        if (

            GG.Config
                ?.DEBUG
                ?.ENABLED

        ) {

            console.log(

                "🧠 AI INTENT NORMALIZED:",

                {

                    raw:

                        rawIntent,

                    canonical:

                        canonicalIntent ||

                        null,

                    final:

                        aiIntent.intent

                }

            );

        }

    }


    /*=====================================================
      INVALID LOCAL RESULT

      If there was no valid local detector result,
      return the AI result.

      This supports queries where local detectors cannot
      confidently determine an intent but Gemini can.
    =====================================================*/

    if (

        !localIntent ||

        typeof localIntent !==
            "object"

    ) {

        return aiIntent;

    }


    /*=====================================================
      MERGE LOCAL + AI
    =====================================================*/


    /*-----------------------------------------------------
      ENTITIES

      Local entities are preserved.

      AI-extracted values override the same property only
      when AI actually supplies that property.

      Examples:

      staff
      sightingID
      division
      range
      beat
      compartment
      village
      status
      risk
      direction
      species
    -----------------------------------------------------*/

    const mergedEntities = {

        ...(localIntent.entities || {}),

        ...(aiIntent.entities || {})

    };


    /*-----------------------------------------------------
      PARAMETERS

      Critical for business query execution.

      Examples:

      activeOnly
      movedOnly
      resolvedOnly
      highRiskOnly
      radiusKm
      distanceKm
      limit
      status
      risk
      timeWindow
      includeResolved
      sort
    -----------------------------------------------------*/

    const mergedParameters = {

        ...(localIntent.parameters || {}),

        ...(aiIntent.parameters || {})

    };


    /*-----------------------------------------------------
      CONTEXT

      Critical for operational GreenGuard queries.

      Examples:

      current user
      user jurisdiction
      selected sighting
      selected GIS area
      HEC operational context
      map selection
      current duty
      current GPS
    -----------------------------------------------------*/

    const mergedContext = {

        ...(localIntent.context || {}),

        ...(aiIntent.context || {})

    };


    /*=====================================================
      FINAL CANONICAL INTENT
    =====================================================*/

    const merged = {

        /*-------------------------------------------------
          SUCCESS
        -------------------------------------------------*/

        success:

            aiIntent.success !==
            false,


        /*-------------------------------------------------
          SOURCE
        -------------------------------------------------*/

        source:

            aiIntent.source ||

            localIntent.source ||

            "ai",


        /*-------------------------------------------------
          PROVIDER
        -------------------------------------------------*/

        provider:

            aiIntent.provider ||

            localIntent.provider ||

            "AI",


        /*-------------------------------------------------
          QUERY
        -------------------------------------------------*/

        query:

            localIntent.query ||

            aiIntent.query ||

            "",


        /*-------------------------------------------------
          DOMAIN

          AI wins when it provides a valid domain.

          Examples:

          staff
          sighting
          gis
          wildlife
          patrol
          legal
          analytics
          report
          fire
        -------------------------------------------------*/

        domain:

            aiIntent.domain ||

            localIntent.domain ||

            "unknown",


        /*-------------------------------------------------
          INTENT

          AI wins after BusinessRegistry canonicalization.
        -------------------------------------------------*/

        intent:

            aiIntent.intent ||

            localIntent.intent ||

            "unknown",


        /*-------------------------------------------------
          CONFIDENCE
        -------------------------------------------------*/

        confidence:

            Number(

                aiIntent.confidence ??

                localIntent.confidence ??

                0

            ),


        /*-------------------------------------------------
          ENTITIES
        -------------------------------------------------*/

        entities:

            mergedEntities,


        /*-------------------------------------------------
          PARAMETERS
        -------------------------------------------------*/

        parameters:

            mergedParameters,


        /*-------------------------------------------------
          CONTEXT
        -------------------------------------------------*/

        context:

            mergedContext,


        /*-------------------------------------------------
          WINNING DETECTOR
        -------------------------------------------------*/

        winningDetector:

            aiIntent.winningDetector ||

            localIntent.winningDetector ||

            null,


        /*-------------------------------------------------
          LOCAL DETECTOR CONFIDENCE

          Useful for diagnostics without changing routing.
        -------------------------------------------------*/

        localConfidence:

            Number(

                localIntent.confidence ??

                0

            ),


        /*-------------------------------------------------
          AI CONFIDENCE

          Useful for debugging Gemini classification.
        -------------------------------------------------*/

        aiConfidence:

            Number(

                aiIntent.confidence ??

                0

            ),


        /*-------------------------------------------------
          RAW AI RESPONSE
        -------------------------------------------------*/

        raw:

            aiIntent.raw ||

            null

    };


    /*=====================================================
      DEBUG
    =====================================================*/

    if (

        GG.Config
            ?.DEBUG
            ?.ENABLED

    ) {

        console.log(

            "🧠 INTENT MERGE RESULT:",

            {

                local: {

                    domain:

                        localIntent.domain,

                    intent:

                        localIntent.intent,

                    confidence:

                        localIntent.confidence

                },

                ai: {

                    domain:

                        aiIntent.domain,

                    intent:

                        aiIntent.intent,

                    confidence:

                        aiIntent.confidence

                },

                merged: {

                    domain:

                        merged.domain,

                    intent:

                        merged.intent,

                    confidence:

                        merged.confidence,

                    entities:

                        merged.entities,

                    parameters:

                        merged.parameters,

                    context:

                        merged.context

                }

            }

        );

    }


    /*=====================================================
      RETURN
    =====================================================*/

    return merged;

};
/*=========================================================
 CLEAR CACHE
=========================================================*/

IntentManager.clearCache = async function () {

    const Cache =

        GG.Cache;

    if (

        !Cache ||

        typeof Cache.clearIntent !==

        "function"

    ) {

        return;

    }

    await Cache.clearIntent();

};

/*=========================================================
 REGISTER
=========================================================*/

GG.IntentManager =
    IntentManager;

console.log(

    "%cGreenGuard Intent Manager Loaded",

    "color:#008000;font-weight:bold;"

);

})(window);
