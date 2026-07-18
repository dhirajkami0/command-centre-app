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

GG.BusinessRegistry = Object.freeze({

    confidenceThreshold:

        GG.Config.INTENT.HIGH_CONFIDENCE,

    domains: Object.freeze([

        GG.StaffConstants.DOMAIN,

        GG.GISConstants?.DOMAIN,

        "wildlife",

        "patrol",

        "legal",

        "analytics",

        "report"

    ].filter(Boolean)),

    intents: Object.freeze(

        Object.values(

            GG.StaffConstants.INTENTS

        )

    ),

    entityTypes: Object.freeze(

        Object.values(

            GG.StaffConstants.ENTITY_TYPES

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

IntentManager.mergeIntent = function (

    localIntent,

    aiIntent

) {

    IntentManager.init();

    /*----------------------------------
      Invalid AI
    ----------------------------------*/

    if (

        !aiIntent ||

        typeof aiIntent !== "object"

    ) {

        return localIntent;

    }

    /*----------------------------------
      Normalize AI Intent Against
      Business Registry

      Examples:
      STAFF_PROFILE   -> staffProfile
      STAFF_CONTACT   -> staffContact
      WHO_IS_ON_DUTY  -> whoIsOnDuty

      Already canonical values remain
      unchanged.
    ----------------------------------*/

    if (

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

        let canonicalIntent = null;

        /*----------------------------------
          1. Exact Canonical Match
        ----------------------------------*/

        canonicalIntent =

            intents.find(

                function (

                    value

                ) {

                    return (

                        value === rawIntent

                    );

                }

            ) || null;

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

                ) || null;

        }

        /*----------------------------------
          3. CONSTANT_STYLE -> camelCase

          STAFF_PROFILE
          ->
          staffProfile

          WHO_IS_ON_DUTY
          ->
          whoIsOnDuty
        ----------------------------------*/

        if (

            !canonicalIntent &&

            rawIntent.includes("_")

        ) {

            const converted =

                rawIntent

                    .toLowerCase()

                    .split("_")

                    .filter(Boolean)

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

                ) || null;

        }

        /*----------------------------------
          Apply Canonical Intent

          IMPORTANT:
          Only replace when the converted
          intent actually exists in the
          Business Registry.

          This prevents breaking unknown
          or future intents.
        ----------------------------------*/

        if (

            canonicalIntent

        ) {

            aiIntent = {

                ...aiIntent,

                intent:

                    canonicalIntent

            };

        }

        /*----------------------------------
          Debug
        ----------------------------------*/

        if (

            GG.Config?.DEBUG?.ENABLED

        ) {

            console.log(

                "🧠 AI INTENT NORMALIZED:",

                {

                    raw:

                        rawIntent,

                    canonical:

                        canonicalIntent,

                    final:

                        aiIntent.intent

                }

            );

        }

    }

    /*----------------------------------
      Invalid Local
    ----------------------------------*/

    if (

        !localIntent ||

        typeof localIntent !== "object"

    ) {

        return aiIntent;

    }

    /*----------------------------------
      Merge
    ----------------------------------*/

    const merged = {

        success:

            aiIntent.success !== false,

        source:

            aiIntent.source ||

            "ai",

        provider:

            aiIntent.provider ||

            "AI",

        query:

            localIntent.query ||

            aiIntent.query ||

            "",

        domain:

            aiIntent.domain ||

            localIntent.domain ||

            "unknown",

        intent:

            aiIntent.intent ||

            localIntent.intent ||

            "unknown",

        confidence:

            Number(

                aiIntent.confidence ??

                localIntent.confidence ??

                0

            ),

        entities: {

            ...(localIntent.entities || {}),

            ...(aiIntent.entities || {})

        },

        raw:

            aiIntent.raw ||

            null

    };

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
