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

/*=========================================================
 DETECT LOCAL INTENT
=========================================================*/

IntentManager.detectLocal = function (

    query

) {

    IntentManager.init();

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

                    intent.confidence || 0

                );

            if (

                confidence >

                bestConfidence

            ) {

                bestConfidence =

                    confidence;

                bestIntent =

                    intent;

            }

        }

        catch (err) {

            console.error(

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
      Normalize Metadata
    ----------------------------------*/

    bestIntent.success =

        true;

    bestIntent.source =

        "local";

    bestIntent.provider =

        "IntentManager";

    bestIntent.query =

        query;

    bestIntent.domain =

        bestIntent.domain ||

        "unknown";

    bestIntent.intent =

        bestIntent.intent ||

        "unknown";

    bestIntent.entities =

        bestIntent.entities ||

        {};

    bestIntent.confidence =

        Number(

            bestIntent.confidence || 0

        );

    /*----------------------------------
      Debug
    ----------------------------------*/

    if (

        GG.Config?.DEBUG?.ENABLED

    ) {

        console.log(

            "🟢 Local Intent",

            bestIntent

        );

    }

    /*----------------------------------
      Return
    ----------------------------------*/

    return bestIntent;

};/*=========================================================
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

    if (

        GG.Config?.DEBUG?.ENABLED

    ) {

        console.log(

            "🟡 AI Intent Required",

            confidence

        );

    }

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

        if (

            GG.Config?.DEBUG?.ENABLED

        ) {

            console.log(

                "🟢 Intent Cache",

                intent

            );

        }

        return intent;

    }

    /*----------------------------------
      Local Intent Detection
    ----------------------------------*/

    intent =

        IntentManager.detectLocal(

            query

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

    if (

        GG.Config?.DEBUG?.ENABLED

    ) {

        console.log(

            "🤖 AI Intent Detection"

        );

    }

    const AI =

        GG.AI;

    if (

        !AI ||

        typeof AI.detectIntent !==

        "function"

    ) {

        console.warn(

            "AI Provider unavailable."

        );

        await IntentManager.setCachedIntent(

            query,

            intent

        );

        return intent;

    }

    try {

        const aiIntent =

            await AI.detectIntent(

                query

            );

        /*------------------------------
          Validate
        ------------------------------*/

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

    /*----------------------------------
      Return
    ----------------------------------*/

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

    /*----------------------------------
      Return
    ----------------------------------*/

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
 GET STATS
=========================================================*/

IntentManager.getStats = function () {

    return {

        version:

            IntentManager.VERSION,

        initialized:

            IntentManager.initialized

    };

};

/*=========================================================
 REGISTER
=========================================================*/

GG.IntentManager =

    IntentManager;

/*=========================================================
 READY
=========================================================*/

console.log(

    "%cGreenGuard Intent Manager Loaded",

    "color:#009688;font-weight:bold;"

);

})(window);
