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
 VERSION
=========================================================*/

IntentManager.VERSION =

    "1.1.0";

IntentManager.initialized =

    false;
/*=========================================================
  INTENT CACHE POLICY

  DEVELOPMENT:
      false = always run current intent detectors.

  PRODUCTION:
      may later be changed to true after the
      intent architecture is stable.
=========================================================*/

IntentManager.ENABLE_INTENT_CACHE = false;
/*=========================================================
 INTERNAL HELPERS
=========================================================*/

/**
 * Return unique non-empty values.
 */

IntentManager.uniqueValues = function (

    values = []

) {

    return values

        .filter(

            function (

                value

            ) {

                return (

                    value !== undefined &&

                    value !== null &&

                    value !== ""

                );

            }

        )

        .filter(

            function (

                value,

                index,

                array

            ) {

                return (

                    array.indexOf(

                        value

                    ) === index

                );

            }

        );

};

/*=========================================================
 GET CONSTANT VALUES
=========================================================*/

/**
 * Safely reads values from a constants object.
 *
 * Example:
 *
 * getConstantValues(
 *     GG.StaffConstants,
 *     "INTENTS"
 * )
 */

IntentManager.getConstantValues = function (

    constants,

    property

) {

    if (

        !constants ||

        typeof constants !==

        "object"

    ) {

        return [];

    }

    const registry =

        constants[

            property

        ];

    if (

        !registry ||

        typeof registry !==

        "object"

    ) {

        return [];

    }

    try {

        return Object.values(

            registry

        );

    }

    catch (

        error

    ) {

        return [];

    }

};

/*=========================================================
 BUSINESS REGISTRY
=========================================================*/

/**
 * Central registry of domains, intents and entity types
 * that Gemini is allowed to classify.
 *
 * IMPORTANT:
 *
 * BusinessRegistry does NOT detect intents.
 *
 * Local detection remains owned by:
 *
 * StaffIntent
 * SightingIntent
 * WildlifeIntent
 * GISIntent
 * PatrolIntent
 * FireIntent
 * LegalIntent
 * ReportIntent
 * AnalyticsIntent
 *
 * BusinessRegistry only constrains AI classification.
 */

IntentManager.buildBusinessRegistry = function () {

    /*-----------------------------------------------------
      DOMAINS
    -----------------------------------------------------*/

    const domains =

        IntentManager.uniqueValues(

            [

                GG.StaffConstants
                    ?.DOMAIN ||

                    "staff",

                GG.GISConstants
                    ?.DOMAIN ||

                    "gis",

                GG.SightingConstants
                    ?.DOMAIN ||

                    "sighting",

                GG.WildlifeConstants
                    ?.DOMAIN ||

                    "wildlife",

                GG.PatrolConstants
                    ?.DOMAIN ||

                    "patrol",

                GG.FireConstants
                    ?.DOMAIN ||

                    "fire",

                GG.LegalConstants
                    ?.DOMAIN ||

                    "legal",

                GG.AnalyticsConstants
                    ?.DOMAIN ||

                    "analytics",

                GG.ReportConstants
                    ?.DOMAIN ||

                    "report"

            ]

        );

    /*-----------------------------------------------------
      INTENTS
    -----------------------------------------------------*/

    const intents =

        IntentManager.uniqueValues(

            [

                /*----------------------------------
                  STAFF
                ----------------------------------*/

                ...IntentManager.getConstantValues(

                    GG.StaffConstants,

                    "INTENTS"

                ),

                /*----------------------------------
                  SIGHTING / HEC
                ----------------------------------*/

                ...IntentManager.getConstantValues(

                    GG.SightingConstants,

                    "INTENTS"

                ),

                /*----------------------------------
                  GIS
                ----------------------------------*/

                ...IntentManager.getConstantValues(

                    GG.GISConstants,

                    "INTENTS"

                ),

                /*----------------------------------
                  WILDLIFE
                ----------------------------------*/

                ...IntentManager.getConstantValues(

                    GG.WildlifeConstants,

                    "INTENTS"

                ),

                /*----------------------------------
                  PATROL
                ----------------------------------*/

                ...IntentManager.getConstantValues(

                    GG.PatrolConstants,

                    "INTENTS"

                ),

                /*----------------------------------
                  FIRE
                ----------------------------------*/

                ...IntentManager.getConstantValues(

                    GG.FireConstants,

                    "INTENTS"

                ),

                /*----------------------------------
                  LEGAL
                ----------------------------------*/

                ...IntentManager.getConstantValues(

                    GG.LegalConstants,

                    "INTENTS"

                ),

                /*----------------------------------
                  ANALYTICS
                ----------------------------------*/

                ...IntentManager.getConstantValues(

                    GG.AnalyticsConstants,

                    "INTENTS"

                ),

                /*----------------------------------
                  REPORT
                ----------------------------------*/

                ...IntentManager.getConstantValues(

                    GG.ReportConstants,

                    "INTENTS"

                )

            ]

        );

    /*-----------------------------------------------------
      ENTITY TYPES
    -----------------------------------------------------*/

    const entityTypes =

        IntentManager.uniqueValues(

            [

                ...IntentManager.getConstantValues(

                    GG.StaffConstants,

                    "ENTITY_TYPES"

                ),

                ...IntentManager.getConstantValues(

                    GG.SightingConstants,

                    "ENTITY_TYPES"

                ),

                ...IntentManager.getConstantValues(

                    GG.GISConstants,

                    "ENTITY_TYPES"

                ),

                ...IntentManager.getConstantValues(

                    GG.WildlifeConstants,

                    "ENTITY_TYPES"

                ),

                ...IntentManager.getConstantValues(

                    GG.PatrolConstants,

                    "ENTITY_TYPES"

                ),

                ...IntentManager.getConstantValues(

                    GG.FireConstants,

                    "ENTITY_TYPES"

                ),

                ...IntentManager.getConstantValues(

                    GG.LegalConstants,

                    "ENTITY_TYPES"

                ),

                ...IntentManager.getConstantValues(

                    GG.AnalyticsConstants,

                    "ENTITY_TYPES"

                ),

                ...IntentManager.getConstantValues(

                    GG.ReportConstants,

                    "ENTITY_TYPES"

                )

            ]

        );

    return Object.freeze({

        confidenceThreshold:

            GG.Config
                ?.INTENT
                ?.HIGH_CONFIDENCE ??

            0.90,

        domains:

            Object.freeze(

                domains

            ),

        intents:

            Object.freeze(

                intents

            ),

        entityTypes:

            Object.freeze(

                entityTypes

            )

    });

};

/*=========================================================
 CREATE BUSINESS REGISTRY
=========================================================*/

GG.BusinessRegistry =

    IntentManager.buildBusinessRegistry();

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

    if (

        GG.Config
            ?.DEBUG
            ?.ENABLED

    ) {

        console.log(

            "Business Registry:",

            GG.BusinessRegistry

        );

    }

};

/*=========================================================
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
      Convert To String
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

    return query;

};

/*=========================================================
 GET CACHED INTENT
=========================================================*/

IntentManager.getCachedIntent =
async function (

    query

) {

    IntentManager.init();


    /*----------------------------------
      Development Mode

      Intent caching is deliberately
      disabled while detectors, constants,
      priorities and routing are under
      active development.
    ----------------------------------*/

    if (

        IntentManager
            .ENABLE_INTENT_CACHE !==
        true

    ) {

        return null;

    }


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
      Read
    ----------------------------------*/

    const intent =

        await Cache.getIntent(

            query

        );


    /*----------------------------------
      Debug
    ----------------------------------*/

    if (

        GG.Config
            ?.DEBUG
            ?.ENABLED &&

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

IntentManager.setCachedIntent =
async function (

    query,

    intent

) {

    IntentManager.init();


    /*----------------------------------
      Development Mode

      Do not persist intent decisions
      while intent detection is under
      active development.
    ----------------------------------*/

    if (

        IntentManager
            .ENABLE_INTENT_CACHE !==
        true

    ) {

        return;

    }


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

        GG.Config
            ?.DEBUG
            ?.ENABLED

    ) {

        console.log(

            "💾 Intent Cached",

            query

        );

    }

};

/*=========================================================
 GET LOCAL DETECTORS
=========================================================*/

/**
 * Detector order does NOT force a winner.
 *
 * Highest confidence wins.
 *
 * Order only matters when two detectors return
 * exactly the same confidence because the first
 * detected winner is preserved.
 */

IntentManager.getDetectors = function () {

    return [

        GG.StaffIntent,

        GG.SightingIntent,

        GG.WildlifeIntent,

        GG.GISIntent,

        GG.PatrolIntent,

        GG.FireIntent,

        GG.LegalIntent,

        GG.ReportIntent,

        GG.AnalyticsIntent

    ];

};

/*=========================================================
 GET DETECTOR NAME
=========================================================*/

IntentManager.getDetectorName = function (

    detector

) {

    if (

        !detector

    ) {

        return "UnknownDetector";

    }

    /*----------------------------------
      Explicit Module Name
    ----------------------------------*/

    if (

        typeof detector.NAME ===

        "string" &&

        detector.NAME

    ) {

        return detector.NAME;

    }

    /*----------------------------------
      Domain
    ----------------------------------*/

    if (

        typeof detector.DOMAIN ===

        "string" &&

        detector.DOMAIN

    ) {

        return (

            detector.DOMAIN +

            "Intent"

        );

    }

    /*----------------------------------
      Constructor
    ----------------------------------*/

    if (

        detector.constructor?.name &&

        detector.constructor.name !==

        "Object"

    ) {

        return detector.constructor.name;

    }

    /*----------------------------------
      Version Fallback
    ----------------------------------*/

    if (

        detector.VERSION

    ) {

        return (

            "Detector@" +

            detector.VERSION

        );

    }

    return "UnknownDetector";

};

/*=========================================================
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
      Detectors
    ----------------------------------*/

    const detectors =

        IntentManager.getDetectors();

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

            IntentManager.getDetectorName(

                detector

            );

        try {

            const detected =

                detector.detect(

                    query

                );

            if (

                !detected ||

                typeof detected !==

                "object"

            ) {

                continue;

            }

            const confidence =

                Number(

                    detected.confidence ||

                    0

                );

            /*----------------------------------
              Highest Confidence Wins
            ----------------------------------*/

            if (

                confidence >

                bestConfidence

            ) {

                bestConfidence =

                    confidence;

                bestIntent =

                    detected;

                bestDetector =

                    detectorName;

            }

        }

        catch (

            error

        ) {

            console.error(

                "Detector Error:",

                detectorName,

                error

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

            success:

                false,

            source:

                "local",

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

            entities:

                {},

            parameters:

                {},

            context:

                {},

            winningDetector:

                null,

            executionTime:

                Date.now() -

                started

        };

    }

    /*----------------------------------
      Build Final Result

      Do not unnecessarily mutate the
      detector's original object.
    ----------------------------------*/

    const result = {

        ...bestIntent,

        success:

            bestIntent.success !==

            false,

        source:

            bestIntent.source ||

            "local",

        provider:

            bestIntent.provider ||

            "IntentManager",

        query:

            bestIntent.query ||

            query,

        domain:

            bestIntent.domain ||

            "unknown",

        intent:

            bestIntent.intent ||

            "unknown",

        confidence:

            Number(

                bestIntent.confidence ||

                0

            ),

        entities:

            bestIntent.entities ||

            {},

        parameters:

            bestIntent.parameters ||

            {},

        context:

            bestIntent.context ||

            {},

        winningDetector:

            bestIntent.winningDetector ||

            bestDetector ||

            null,

        executionTime:

            Date.now() -

            started

    };

    /*----------------------------------
      Debug
    ----------------------------------*/

    if (

        GG.Config
            ?.DEBUG
            ?.ENABLED

    ) {

        console.log(

            "🏆 Local Winner:",

            {

                detector:

                    result.winningDetector,

                domain:

                    result.domain,

                intent:

                    result.intent,

                confidence:

                    result.confidence

            }

        );

    }

    console.groupEnd();

    return result;

};

/*=========================================================
 BUILD AI REQUEST
=========================================================*/

IntentManager.buildAIRequest = function (

    query,

    localIntent = {}

) {

    IntentManager.init();

    return {

        query:

            query,

        normalizedQuery:

            IntentManager.normalize(

                query

            ),

        detector: {

            winner:

                localIntent.winningDetector ||

                "UNKNOWN",

            provider:

                localIntent.provider ||

                "UNKNOWN"

        },

        localIntent: {

            success:

                localIntent.success,

            source:

                localIntent.source ||

                "IntentManager",

            domain:

                localIntent.domain ||

                "UNKNOWN",

            intent:

                localIntent.intent ||

                "UNKNOWN",

            confidence:

                Number(

                    localIntent.confidence ||

                    0

                ),

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

            localIntent.entities ||

            {},

        business:

            GG.BusinessRegistry,

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

    /*----------------------------------
      Invalid Intent
    ----------------------------------*/

    if (

        !intent ||

        typeof intent !==

        "object"

    ) {

        return true;

    }

    /*----------------------------------
      Confidence
    ----------------------------------*/

    const confidence =

        Number(

            intent.confidence ||

            0

        );

    /*----------------------------------
      Threshold
    ----------------------------------*/

    const threshold =

        Number(

            GG.Config
                ?.INTENT
                ?.HIGH_CONFIDENCE ??

            GG.BusinessRegistry
                ?.confidenceThreshold ??

            0.80

        );

    /*----------------------------------
      High Confidence Local Result
    ----------------------------------*/

    if (

        confidence >=

        threshold

    ) {

        if (

            GG.Config
                ?.DEBUG
                ?.ENABLED

        ) {

            console.log(

                "🟢 Local Intent Accepted",

                {

                    confidence:

                        confidence,

                    threshold:

                        threshold,

                    domain:

                        intent.domain,

                    intent:

                        intent.intent

                }

            );

        }

        return false;

    }

    return true;

};

/*=========================================================
 NORMALIZE AI DOMAIN
=========================================================*/

/**
 * AI is only allowed to select a domain already
 * registered in BusinessRegistry.
 *
 * Unknown AI domains return null and therefore cannot
 * replace a valid local domain.
 */

IntentManager.normalizeAIDomain = function (

    domain

) {

    if (

        typeof domain !==

        "string"

    ) {

        return null;

    }

    const rawDomain =

        domain
            .trim();

    if (

        !rawDomain

    ) {

        return null;

    }

    const domains =

        Array.isArray(

            GG.BusinessRegistry
                ?.domains

        )

            ? GG.BusinessRegistry.domains

            : [];

    /*----------------------------------
      Exact
    ----------------------------------*/

    let canonicalDomain =

        domains.find(

            function (

                value

            ) {

                return (

                    value ===

                    rawDomain

                );

            }

        ) ||

        null;

    /*----------------------------------
      Case Insensitive
    ----------------------------------*/

    if (

        !canonicalDomain

    ) {

        canonicalDomain =

            domains.find(

                function (

                    value

                ) {

                    return (

                        String(

                            value

                        ).toLowerCase() ===

                        rawDomain.toLowerCase()

                    );

                }

            ) ||

            null;

    }

    return canonicalDomain;

};

/*=========================================================
 NORMALIZE AI INTENT
=========================================================*/

/**
 * Convert AI intent into an actual canonical intent
 * registered in GreenGuard.
 *
 * Supports:
 *
 * staffProfile
 * STAFFPROFILE
 * STAFF_PROFILE
 *
 * All resolve to the canonical registry value
 * when that value exists.
 */

IntentManager.normalizeAIIntent = function (

    intent

) {

    if (

        typeof intent !==

        "string"

    ) {

        return null;

    }

    const rawIntent =

        intent
            .trim();

    if (

        !rawIntent

    ) {

        return null;

    }

    const intents =

        Array.isArray(

            GG.BusinessRegistry
                ?.intents

        )

            ? GG.BusinessRegistry.intents

            : [];

    /*----------------------------------
      1. Exact Canonical Match
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

        ) ||

        null;

    /*----------------------------------
      2. Case-Insensitive Match
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

            ) ||

            null;

    }

    /*----------------------------------
      3. CONSTANT_STYLE -> camelCase

      STAFF_PROFILE
          ->
      staffProfile

      SIGHTING_ACTIVE
          ->
      sightingActive

      WHO_IS_ON_DUTY
          ->
      whoIsOnDuty
    ----------------------------------*/

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

                        ).toLowerCase() ===

                        converted.toLowerCase()

                    );

                }

            ) ||

            null;

    }

    return canonicalIntent;

};

/*=========================================================
 NORMALIZE AI RESULT
=========================================================*/

/**
 * Normalize only the AI classification.
 *
 * Local detector results are never modified here.
 */

IntentManager.normalizeAIResult = function (

    aiIntent

) {

    if (

        !aiIntent ||

        typeof aiIntent !==

        "object"

    ) {

        return aiIntent;

    }

    const rawDomain =

        aiIntent.domain;

    const rawIntent =

        aiIntent.intent;

    const canonicalDomain =

        IntentManager.normalizeAIDomain(

            rawDomain

        );

    const canonicalIntent =

        IntentManager.normalizeAIIntent(

            rawIntent

        );

    const normalized = {

        ...aiIntent

    };

    /*----------------------------------
      Apply Domain Only When Valid
    ----------------------------------*/

    if (

        canonicalDomain

    ) {

        normalized.domain =

            canonicalDomain;

    }

    /*----------------------------------
      Apply Intent Only When Valid
    ----------------------------------*/

    if (

        canonicalIntent

    ) {

        normalized.intent =

            canonicalIntent;

    }

    /*----------------------------------
      Debug
    ----------------------------------*/

    if (

        GG.Config
            ?.DEBUG
            ?.ENABLED

    ) {

        console.log(

            "🧠 AI CLASSIFICATION NORMALIZED:",

            {

                domain: {

                    raw:

                        rawDomain,

                    canonical:

                        canonicalDomain

                },

                intent: {

                    raw:

                        rawIntent,

                    canonical:

                        canonicalIntent

                },

                final: {

                    domain:

                        normalized.domain,

                    intent:

                        normalized.intent

                }

            }

        );

    }

    return normalized;

};

/*=========================================================
 IS REGISTERED DOMAIN
=========================================================*/

IntentManager.isRegisteredDomain = function (

    domain

) {

    return (

        IntentManager.normalizeAIDomain(

            domain

        ) !== null

    );

};

/*=========================================================
 IS REGISTERED INTENT
=========================================================*/

IntentManager.isRegisteredIntent = function (

    intent

) {

    return (

        IntentManager.normalizeAIIntent(

            intent

        ) !== null

    );

};

/*=========================================================
 MERGE INTENT
=========================================================*/

IntentManager.mergeIntent = function (

    localIntent,

    aiIntent

) {

    IntentManager.init();

    /*=====================================================
      INVALID AI

      Preserve complete local result.
    =====================================================*/

    if (

        !aiIntent ||

        typeof aiIntent !==

        "object"

    ) {

        return localIntent;

    }

    /*=====================================================
      NORMALIZE AI
    =====================================================*/

    aiIntent =

        IntentManager.normalizeAIResult(

            aiIntent

        );

    /*=====================================================
      INVALID LOCAL

      AI can be returned directly when there is no local
      result, but only after normalization.
    =====================================================*/

    if (

        !localIntent ||

        typeof localIntent !==

        "object"

    ) {

        return {

            ...aiIntent,

            entities:

                aiIntent.entities ||

                {},

            parameters:

                aiIntent.parameters ||

                {},

            context:

                aiIntent.context ||

                {}

        };

    }

    /*=====================================================
      VALID AI DOMAIN
    =====================================================*/

    const aiDomain =

        IntentManager.normalizeAIDomain(

            aiIntent.domain

        );

    /*=====================================================
      VALID AI INTENT
    =====================================================*/

    const aiCanonicalIntent =

        IntentManager.normalizeAIIntent(

            aiIntent.intent

        );

    /*=====================================================
      LOCAL DOMAIN
    =====================================================*/

    const localDomain =

        localIntent.domain &&

        localIntent.domain !==

        "unknown"

            ? localIntent.domain

            : null;

    /*=====================================================
      LOCAL INTENT
    =====================================================*/

    const localCanonicalIntent =

        localIntent.intent &&

        localIntent.intent !==

        "unknown"

            ? localIntent.intent

            : null;

    /*=====================================================
      FINAL DOMAIN

      Valid registered AI domain may override local.

      Invalid/unknown AI domain cannot destroy a valid
      local domain.
    =====================================================*/

    const finalDomain =

        aiDomain ||

        localDomain ||

        aiIntent.domain ||

        localIntent.domain ||

        "unknown";

    /*=====================================================
      FINAL INTENT

      Valid registered AI intent may override local.

      Invalid/unknown AI intent cannot destroy a valid
      local intent.
    =====================================================*/

    const finalIntent =

        aiCanonicalIntent ||

        localCanonicalIntent ||

        aiIntent.intent ||

        localIntent.intent ||

        "unknown";

    /*=====================================================
      ENTITIES

      AI values override the same entity property only
      when AI supplies that property.
    =====================================================*/

    const mergedEntities = {

        ...(localIntent.entities || {}),

        ...(aiIntent.entities || {})

    };

    /*=====================================================
      PARAMETERS
    =====================================================*/

    const mergedParameters = {

        ...(localIntent.parameters || {}),

        ...(aiIntent.parameters || {})

    };

    /*=====================================================
      CONTEXT
    =====================================================*/

    const mergedContext = {

        ...(localIntent.context || {}),

        ...(aiIntent.context || {})

    };

    /*=====================================================
      FINAL MERGED RESULT
    =====================================================*/

    const merged = {

        /*----------------------------------
          Success
        ----------------------------------*/

        success:

            aiIntent.success !==

            false,

        /*----------------------------------
          Source
        ----------------------------------*/

        source:

            aiIntent.source ||

            localIntent.source ||

            "ai",

        /*----------------------------------
          Provider
        ----------------------------------*/

        provider:

            aiIntent.provider ||

            localIntent.provider ||

            "AI",

        /*----------------------------------
          Query
        ----------------------------------*/

        query:

            localIntent.query ||

            aiIntent.query ||

            "",

        /*----------------------------------
          Domain
        ----------------------------------*/

        domain:

            finalDomain,

        /*----------------------------------
          Intent
        ----------------------------------*/

        intent:

            finalIntent,

        /*----------------------------------
          Confidence
        ----------------------------------*/

        confidence:

            Number(

                aiIntent.confidence ??

                localIntent.confidence ??

                0

            ),

        /*----------------------------------
          Entities
        ----------------------------------*/

        entities:

            mergedEntities,

        /*----------------------------------
          Parameters
        ----------------------------------*/

        parameters:

            mergedParameters,

        /*----------------------------------
          Context
        ----------------------------------*/

        context:

            mergedContext,

        /*----------------------------------
          Winning Detector

          Preserve the actual local detector
          unless AI explicitly provides one.
        ----------------------------------*/

        winningDetector:

            aiIntent.winningDetector ||

            localIntent.winningDetector ||

            null,

        /*----------------------------------
          Diagnostic Confidence
        ----------------------------------*/

        localConfidence:

            Number(

                localIntent.confidence ??

                0

            ),

        aiConfidence:

            Number(

                aiIntent.confidence ??

                0

            ),

        /*----------------------------------
          Raw AI Result
        ----------------------------------*/

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

    return merged;

};

/*=========================================================
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
      Empty Query Protection
    ----------------------------------*/

    if (

        !query

    ) {

        return {

            success:

                false,

            source:

                "local",

            provider:

                "IntentManager",

            query:

                "",

            domain:

                "unknown",

            intent:

                "unknown",

            confidence:

                0,

            entities:

                {},

            parameters:

                {},

            context:

                {}

        };

    }

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
      Local Detection
    ----------------------------------*/

    intent =

        IntentManager.detectLocal(

            query

        );

    /*----------------------------------
      Debug
    ----------------------------------*/

    if (

        GG.Config
            ?.DEBUG
            ?.ENABLED

    ) {

        console.log(

            "LOCAL:",

            intent

        );

        console.log(

            "USE AI:",

            IntentManager.shouldUseAI(

                intent

            )

        );

    }

    /*----------------------------------
      High Confidence Local Result
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
      AI Provider
    ----------------------------------*/

    const AI =

        GG.AI;

    /*----------------------------------
      AI Unavailable

      Preserve Local Result
    ----------------------------------*/

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

    /*----------------------------------
      AI Classification
    ----------------------------------*/

    try {

        const request =

            IntentManager.buildAIRequest(

                query,

                intent

            );

        let aiIntent =

            await AI.detectIntent(

                request

            );

        /*----------------------------------
          Normalize AI Classification
        ----------------------------------*/

        aiIntent =

            IntentManager.normalizeAIResult(

                aiIntent

            );

        /*----------------------------------
          Merge AI With Local
        ----------------------------------*/

        if (

            aiIntent &&

            aiIntent.success !==

            false

        ) {

            intent =

                IntentManager.mergeIntent(

                    intent,

                    aiIntent

                );

        }

    }

    catch (

        error

    ) {

        console.error(

            "Intent AI Detection Error:",

            error

        );

        /*
         * IMPORTANT:
         *
         * AI failure must never destroy the
         * existing local detector result.
         */

    }

    /*----------------------------------
      Ensure Canonical Containers
    ----------------------------------*/

    intent.entities =

        intent.entities ||

        {};

    intent.parameters =

        intent.parameters ||

        {};

    intent.context =

        intent.context ||

        {};

    /*----------------------------------
      Cache Final Intent
    ----------------------------------*/

    await IntentManager.setCachedIntent(

        query,

        intent

    );

    return intent;

};

/*=========================================================
 CLEAR CACHE
=========================================================*/

IntentManager.clearCache =
async function () {

    const Cache =

        GG.Cache;


    if (

        !Cache

    ) {

        return false;

    }


    /*----------------------------------
      Intent Cache API
    ----------------------------------*/

    if (

        typeof Cache.clearIntent ===
        "function"

    ) {

        await Cache.clearIntent();

        return true;

    }


    return false;

};

/*=========================================================
 GET STATUS
=========================================================*/

IntentManager.getStatus = function () {

    return {

        initialized:

            IntentManager.initialized,

        version:

            IntentManager.VERSION,

        confidenceThreshold:

            GG.BusinessRegistry
                ?.confidenceThreshold ??

            null,

        domains:

            GG.BusinessRegistry
                ?.domains ||

            [],

        intents:

            GG.BusinessRegistry
                ?.intents ||

            [],

        entityTypes:

            GG.BusinessRegistry
                ?.entityTypes ||

            [],

        detectors: {

            staff:

                !!GG.StaffIntent,

            sighting:

                !!GG.SightingIntent,

            wildlife:

                !!GG.WildlifeIntent,

            gis:

                !!GG.GISIntent,

            patrol:

                !!GG.PatrolIntent,

            fire:

                !!GG.FireIntent,

            legal:

                !!GG.LegalIntent,

            report:

                !!GG.ReportIntent,

            analytics:

                !!GG.AnalyticsIntent

        }

    };

};

/*=========================================================
 REGISTER
=========================================================*/

GG.IntentManager =

    IntentManager;

/*=========================================================
 LOADED
=========================================================*/

console.log(

    "%cGreenGuard Intent Manager Loaded",

    "color:#008000;font-weight:bold;"

);

/*=========================================================
 END MODULE
=========================================================*/

})(window);
