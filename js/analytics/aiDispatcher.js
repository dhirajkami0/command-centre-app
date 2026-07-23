(function (window) {

"use strict";

/*=========================================================
 GREENGUARD AI
=========================================================*/

const GG =
    window.GreenGuardAI =
    window.GreenGuardAI || {};

/*=========================================================
 PREVENT DOUBLE LOADING
=========================================================*/

if (

    GG.AIDispatcher

) {

    console.warn(

        "[GreenGuardAI] AIDispatcher already loaded."

    );

    return;

}

/*=========================================================
 MODULE
=========================================================*/

const AIDispatcher = {};

/*=========================================================
 VERSION
=========================================================*/

AIDispatcher.VERSION =

    "1.1.0";

/*=========================================================
 STATUS
=========================================================*/

AIDispatcher.loaded =

    true;

AIDispatcher.loading =

    false;

/*=========================================================
 CACHE
=========================================================*/

AIDispatcher.cache =

    new Map();

/*=========================================================
 LAST EXECUTION STATE
=========================================================*/

AIDispatcher.lastQuery =

    "";

AIDispatcher.lastIntent =

    null;

AIDispatcher.lastRequest =

    null;

AIDispatcher.lastResponse =

    null;

/*=========================================================
 CLEAR CACHE
=========================================================*/

AIDispatcher.clearCache = function () {

    AIDispatcher.cache.clear();

};

/*=========================================================
 CREATE RESPONSE
=========================================================*/

AIDispatcher.createResponse = function (

    query = ""

) {

    return {

        success:

            false,

        query:

            query,

        domain:

            null,

        intent:

            null,

        confidence:

            0,

        formatted:

            null,

        raw:

            null,

        message:

            "",

        metadata: {

            version:

                AIDispatcher.VERSION,

            module:

                "AIDispatcher",

            createdAt:

                Date.now(),

            executionTime:

                0

        }

    };

};

/*=========================================================
 NORMALIZE REQUEST
=========================================================*/

/**
 * Converts the incoming dispatcher request into the
 * canonical request shape expected by domain routers.
 *
 * Supports:
 *
 * 1.
 * {
 *     query,
 *     detectedIntent: {...}
 * }
 *
 * 2.
 * {
 *     query,
 *     domain,
 *     intent,
 *     ...
 * }
 */

AIDispatcher.normalizeRequest = function (

    request

) {

    if (

        !request ||

        typeof request !==

        "object"

    ) {

        return null;

    }

    const detectedIntent =

        request.detectedIntent &&
        typeof request.detectedIntent ===
        "object"

            ? request.detectedIntent

            : null;

    const intent =

        detectedIntent ||

        request;

    /*----------------------------------
      Domain
    ----------------------------------*/

    request.domain =

        intent.domain ||

        request.domain ||

        null;

    /*----------------------------------
      Intent
    ----------------------------------*/

    request.intent =

        intent.intent ||

        request.intent ||

        null;

    /*----------------------------------
      Confidence
    ----------------------------------*/

    request.confidence =

        Number(

            intent.confidence ??

            request.confidence ??

            0

        );

    /*----------------------------------
      Entities
    ----------------------------------*/

    request.entities = {

        ...(request.entities || {}),

        ...(intent.entities || {})

    };

    /*----------------------------------
      Parameters
    ----------------------------------*/

    request.parameters = {

        ...(request.parameters || {}),

        ...(intent.parameters || {})

    };

    /*----------------------------------
      Context
    ----------------------------------*/

    request.context = {

        ...(request.context || {}),

        ...(intent.context || {})

    };

    /*----------------------------------
      Query
    ----------------------------------*/

    request.query =

        request.query ||

        intent.query ||

        request.originalQuery ||

        "";

    /*----------------------------------
      Original Query
    ----------------------------------*/

    request.originalQuery =

        request.originalQuery ||

        request.query ||

        intent.query ||

        "";

    return {

        request:

            request,

        intent:

            intent

    };

};

/*=========================================================
 MASTER DISPATCH
=========================================================*/

AIDispatcher.dispatch = async function (

    request

) {

    const started =

        Date.now();

    console.group(

        "🟠 AI DISPATCHER"

    );

    console.log(

        "File:",

        "aiDispatcher.js"

    );

    console.log(

        "Function:",

        "AIDispatcher.dispatch"

    );

    console.log(

        "Incoming Request:",

        request

    );

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !request ||

        typeof request !==

        "object"

    ) {

        console.error(

            "Invalid dispatcher request."

        );

        console.groupEnd();

        return {

            success:

                false,

            domain:

                null,

            intent:

                null,

            message:

                "Invalid request."

        };

    }

    /*----------------------------------
      Normalize
    ----------------------------------*/

    const normalized =

        AIDispatcher.normalizeRequest(

            request

        );

    if (

        !normalized

    ) {

        console.groupEnd();

        return {

            success:

                false,

            message:

                "Unable to normalize request."

        };

    }

    request =

        normalized.request;

    const intent =

        normalized.intent;

    /*----------------------------------
      Runtime State
    ----------------------------------*/

    AIDispatcher.lastRequest =

        request;

    AIDispatcher.lastIntent =

        intent;

    AIDispatcher.lastQuery =

        request.query ||

        "";

    /*----------------------------------
      Debug
    ----------------------------------*/

    console.log(

        "Domain:",

        request.domain

    );

    console.log(

        "Intent:",

        request.intent

    );

    console.log(

        "Confidence:",

        request.confidence

    );

    console.log(

        "Entities:",

        request.entities

    );

    console.log(

        "Parameters:",

        request.parameters

    );

    console.log(

        "Context:",

        request.context

    );

    /*----------------------------------
      Dispatch
    ----------------------------------*/

    let response =

        null;

    console.time(

        "Dispatch"

    );

    try {

        switch (

            request.domain

        ) {

            /*==================================
              STAFF
            ==================================*/

            case "staff":

                response =

                    await AIDispatcher.dispatchStaff(

                        request

                    );

                break;


            /*==================================
              GIS
            ==================================*/

            case "gis":

                response =

                    await AIDispatcher.dispatchGIS(

                        request

                    );

                break;


            /*==================================
              WILDLIFE
            ==================================*/

            case "wildlife":

                response =

                    await AIDispatcher.dispatchWildlife(

                        request

                    );

                break;


            /*==================================
              ELEPHANT SIGHTING / HEC
            ==================================*/

            case "sighting":

                response =

                    await AIDispatcher.dispatchSighting(

                        request

                    );

                break;


            /*==================================
              FIRE
            ==================================*/

            case "fire":

                response =

                    await AIDispatcher.dispatchFire(

                        request

                    );

                break;


            /*==================================
              PATROL
            ==================================*/

            case "patrol":

                response =

                    await AIDispatcher.dispatchPatrol(

                        request

                    );

                break;


            /*==================================
              ANALYTICS
            ==================================*/

            case "analytics":

                response =

                    await AIDispatcher.dispatchAnalytics(

                        request

                    );

                break;


            /*==================================
              LEGAL
            ==================================*/

            case "legal":

                response =

                    await AIDispatcher.dispatchLegal(

                        request

                    );

                break;


            /*==================================
              REPORT
            ==================================*/

            case "report":

                response =

                    await AIDispatcher.dispatchReport(

                        request

                    );

                break;


            /*==================================
              UNKNOWN
            ==================================*/

            default:

                response = {

                    success:

                        false,

                    domain:

                        request.domain ||

                        "unknown",

                    intent:

                        request.intent ||

                        null,

                    message:

                        "Unsupported AI domain: " +

                        (

                            request.domain ||

                            "unknown"

                        )

                };

        }

    }

    catch (

        error

    ) {

        console.error(

            "❌ Dispatcher Exception:",

            error

        );

        response = {

            success:

                false,

            domain:

                request.domain ||

                null,

            intent:

                request.intent ||

                null,

            message:

                error?.message ||

                "AI dispatcher execution failed.",

            errors: [

                error?.message ||

                "Unknown dispatcher error."

            ]

        };

    }

    finally {

        console.timeEnd(

            "Dispatch"

        );

    }

    /*----------------------------------
      Invalid Response
    ----------------------------------*/

    if (

        !response ||

        typeof response !==

        "object"

    ) {

        response = {

            success:

                false,

            domain:

                request.domain ||

                null,

            intent:

                request.intent ||

                null,

            message:

                "Domain dispatcher returned an invalid response."

        };

    }

    /*----------------------------------
      Preserve Canonical Request Data
    ----------------------------------*/

    response.request =

        response.request ||

        request;

    response.detectedIntent =

        intent;

    response.domain =

        response.domain ||

        request.domain ||

        null;

    response.intent =

        response.intent ||

        request.intent ||

        null;

    response.entities =

        response.entities ||

        request.entities ||

        {};

    response.parameters =

        response.parameters ||

        request.parameters ||

        {};

    response.context =

        response.context ||

        request.context ||

        {};

    /*----------------------------------
      Metadata
    ----------------------------------*/

    response.metadata =

        response.metadata ||

        {};

    response.metadata.dispatcher =

        "AIDispatcher";

    response.metadata.dispatcherVersion =

        AIDispatcher.VERSION;

    response.metadata.executionTime =

        Date.now() -

        started;

    /*----------------------------------
      Save Last Response
    ----------------------------------*/

    AIDispatcher.lastResponse =

        response;

    /*----------------------------------
      Debug
    ----------------------------------*/

    console.log(

        "=============================="

    );

    console.log(

        "DISPATCH RETURN"

    );

    console.log(

        "Success:",

        response.success

    );

    console.log(

        "Domain:",

        response.domain

    );

    console.log(

        "Module:",

        response.module

    );

    console.log(

        "Intent:",

        response.intent

    );

    console.log(

        "Markdown:",

        !!response.markdown

    );

    console.dir(

        response

    );

    console.log(

        "=============================="

    );

    console.groupEnd();

    return response;

};

/*=========================================================
 DISPATCH STAFF
=========================================================*/

AIDispatcher.dispatchStaff = async function (

    request

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !request ||

        typeof request !==

        "object"

    ) {

        return {

            success:

                false,

            domain:

                "staff",

            message:

                "Invalid staff request."

        };

    }

    /*----------------------------------
      Normalize Containers
    ----------------------------------*/

    request.entities =

        request.entities ||

        {};

    request.parameters =

        request.parameters ||

        {};

    request.context =

        request.context ||

        {};

    request.domain =

        request.domain ||

        "staff";

    /*----------------------------------
      Normalize Staff Entities

      AI may return:

      entities.name = "DHIRAJ KAMI"

      Staff pipeline expects:

      entities.staff = ["DHIRAJ KAMI"]
    ----------------------------------*/

    if (

        typeof request.entities.name ===

        "string" &&

        !Array.isArray(

            request.entities.staff

        )

    ) {

        request.entities.staff = [

            request.entities.name

        ];

    }

    /*----------------------------------
      Debug
    ----------------------------------*/

    console.log(

        "👤 Staff Entity Normalization"

    );

    console.log(

        "Entities:",

        request.entities

    );

    /*----------------------------------
      Router
    ----------------------------------*/

    const StaffRouter =

        GG.StaffRouter;

    if (

        !StaffRouter ||

        typeof StaffRouter.route !==

        "function"

    ) {

        return {

            success:

                false,

            domain:

                "staff",

            intent:

                request.intent ||

                null,

            message:

                "StaffRouter unavailable."

        };

    }

    /*----------------------------------
      Route
    ----------------------------------*/

    let response;

    try {

        response =

            await StaffRouter.route(

                request

            );

    }

    catch (

        error

    ) {

        console.error(

            "❌ StaffRouter Exception:",

            error

        );

        return {

            success:

                false,

            domain:

                "staff",

            intent:

                request.intent ||

                null,

            message:

                error?.message ||

                "Staff router execution failed.",

            errors: [

                error?.message ||

                "Unknown staff router error."

            ]

        };

    }

    /*----------------------------------
      Failed
    ----------------------------------*/

    if (

        !response ||

        response.success !==

        true

    ) {

        console.error(

            "❌ Staff Router Failed",

            response

        );

        return (

            response ||

            {

                success:

                    false,

                domain:

                    "staff",

                intent:

                    request.intent ||

                    null,

                message:

                    "Staff router failed."

            }

        );

    }

    /*----------------------------------
      Success
    ----------------------------------*/

    console.log(

        "✅ Staff Router Success"

    );

    console.log(

        response

    );

    return response;

};

/*=========================================================
 DISPATCH GIS
=========================================================*/

AIDispatcher.dispatchGIS = async function (

    request

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !request ||

        typeof request !==

        "object"

    ) {

        return {

            success:

                false,

            domain:

                "gis",

            message:

                "Invalid GIS request."

        };

    }

    /*----------------------------------
      Router
    ----------------------------------*/

    const GISRouter =

        GG.GISRouter;

    if (

        !GISRouter ||

        typeof GISRouter.route !==

        "function"

    ) {

        return {

            success:

                false,

            domain:

                "gis",

            intent:

                request.intent ||

                null,

            message:

                "GISRouter unavailable."

        };

    }

    /*----------------------------------
      Ensure Routes Registered
    ----------------------------------*/

    if (

        typeof GISRouter.registerRoutes ===

        "function"

    ) {

        GISRouter.registerRoutes();

    }

    /*----------------------------------
      Route
    ----------------------------------*/

    const response =

        await GISRouter.route(

            request

        );

    /*----------------------------------
      Failed
    ----------------------------------*/

    if (

        !response ||

        response.success !==

        true

    ) {

        return (

            response ||

            {

                success:

                    false,

                domain:

                    "gis",

                intent:

                    request.intent ||

                    null,

                message:

                    "GIS router failed."

            }

        );

    }

    return response;

};

/*=========================================================
 DISPATCH WILDLIFE
=========================================================*/

AIDispatcher.dispatchWildlife = async function (

    request

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !request ||

        typeof request !==

        "object"

    ) {

        return {

            success:

                false,

            domain:

                "wildlife",

            message:

                "Invalid wildlife request."

        };

    }

    /*----------------------------------
      Router
    ----------------------------------*/

    const WildlifeRouter =

        GG.WildlifeRouter;

    if (

        !WildlifeRouter ||

        typeof WildlifeRouter.route !==

        "function"

    ) {

        return {

            success:

                false,

            domain:

                "wildlife",

            intent:

                request.intent ||

                null,

            message:

                "WildlifeRouter unavailable."

        };

    }

    /*----------------------------------
      Route
    ----------------------------------*/

    const response =

        await WildlifeRouter.route(

            request

        );

    /*----------------------------------
      Failed
    ----------------------------------*/

    if (

        !response ||

        response.success !==

        true

    ) {

        return (

            response ||

            {

                success:

                    false,

                domain:

                    "wildlife",

                intent:

                    request.intent ||

                    null,

                message:

                    "Wildlife router failed."

            }

        );

    }

    return response;

};

/*=========================================================
 DISPATCH SIGHTING
=========================================================*/

/**
 * Elephant Sighting / HEC pipeline:
 *
 * AIDispatcher
 *      ↓
 * SightingRouter
 *      ↓
 * SightingQuery
 *      ↓
 * SightingFormatter
 *
 * SightingRouter owns:
 *
 * - intent → handler routing
 * - query execution
 * - formatter selection/invocation
 *
 * Dispatcher deliberately does NOT:
 *
 * - read sighting storage
 * - query Firestore
 * - calculate HEC analytics
 * - calculate mitigation
 * - apply jurisdiction filters
 * - format Sighting responses
 */

AIDispatcher.dispatchSighting = async function (

    request

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !request ||

        typeof request !==

        "object"

    ) {

        return {

            success:

                false,

            domain:

                "sighting",

            message:

                "Invalid sighting request."

        };

    }

    /*----------------------------------
      Normalize Containers
    ----------------------------------*/

    request.entities =

        request.entities ||

        {};

    request.parameters =

        request.parameters ||

        {};

    request.context =

        request.context ||

        {};

    /*----------------------------------
      Preserve Domain
    ----------------------------------*/

    request.domain =

        request.domain ||

        "sighting";

    /*----------------------------------
      Debug
    ----------------------------------*/

    const debug =

        GG.Config?.DEBUG?.ENABLED ===

        true;

    if (

        debug

    ) {

        console.group(

            "🐘 SIGHTING DISPATCH"

        );

        console.log(

            "Request:",

            request

        );

        console.log(

            "Intent:",

            request.intent

        );

        console.log(

            "Entities:",

            request.entities

        );

        console.log(

            "Parameters:",

            request.parameters

        );

        console.log(

            "Context:",

            request.context

        );

    }

    /*----------------------------------
      Resolve Router Lazily
    ----------------------------------*/

    const SightingRouter =

        GG.SightingRouter;

    if (

        !SightingRouter ||

        typeof SightingRouter.route !==

        "function"

    ) {

        if (

            debug

        ) {

            console.error(

                "❌ SightingRouter unavailable."

            );

            console.groupEnd();

        }

        return {

            success:

                false,

            domain:

                "sighting",

            intent:

                request.intent ||

                null,

            message:

                "SightingRouter unavailable."

        };

    }

    /*----------------------------------
      Initialize Router If Required
    ----------------------------------*/

    if (

        typeof SightingRouter.initialize ===

        "function" &&

        SightingRouter.loaded !==

        true

    ) {

        try {

            SightingRouter.initialize();

        }

        catch (

            error

        ) {

            console.error(

                "❌ SightingRouter initialization failed:",

                error

            );

            if (

                debug

            ) {

                console.groupEnd();

            }

            return {

                success:

                    false,

                domain:

                    "sighting",

                intent:

                    request.intent ||

                    null,

                message:

                    error?.message ||

                    "SightingRouter initialization failed.",

                errors: [

                    error?.message ||

                    "Unknown SightingRouter initialization error."

                ]

            };

        }

    }

    /*----------------------------------
      Register Routes If Supported
    ----------------------------------*/

    if (

        typeof SightingRouter.registerRoutes ===

        "function"

    ) {

        try {

            SightingRouter.registerRoutes();

        }

        catch (

            error

        ) {

            console.error(

                "❌ SightingRouter route registration failed:",

                error

            );

            if (

                debug

            ) {

                console.groupEnd();

            }

            return {

                success:

                    false,

                domain:

                    "sighting",

                intent:

                    request.intent ||

                    null,

                message:

                    error?.message ||

                    "SightingRouter route registration failed.",

                errors: [

                    error?.message ||

                    "Unknown SightingRouter registration error."

                ]

            };

        }

    }

    /*----------------------------------
      Route
    ----------------------------------*/

    let response;

    try {

        response =

            await SightingRouter.route(

                request

            );

    }

    catch (

        error

    ) {

        console.error(

            "❌ SightingRouter Exception:",

            error

        );

        if (

            debug

        ) {

            console.groupEnd();

        }

        return {

            success:

                false,

            domain:

                "sighting",

            intent:

                request.intent ||

                null,

            message:

                error?.message ||

                "Sighting router execution failed.",

            errors: [

                error?.message ||

                "Unknown sighting router error."

            ]

        };

    }

    /*----------------------------------
      Validate Router Response
    ----------------------------------*/

    if (

        !response ||

        typeof response !==

        "object"

    ) {

        if (

            debug

        ) {

            console.error(

                "❌ Invalid SightingRouter response:",

                response

            );

            console.groupEnd();

        }

        return {

            success:

                false,

            domain:

                "sighting",

            intent:

                request.intent ||

                null,

            message:

                "SightingRouter returned an invalid response."

        };

    }

    /*----------------------------------
      Router Failure
    ----------------------------------*/

    if (

        response.success !==

        true

    ) {

        console.error(

            "❌ Sighting Router Failed",

            response

        );

        if (

            debug

        ) {

            console.groupEnd();

        }

        return response;

    }

    /*----------------------------------
      Preserve Canonical Request
    ----------------------------------*/

    response.request =

        response.request ||

        request;

    response.domain =

        response.domain ||

        "sighting";

    response.intent =

        response.intent ||

        request.intent ||

        null;

    response.entities =

        response.entities ||

        request.entities ||

        {};

    response.parameters =

        response.parameters ||

        request.parameters ||

        {};

    response.context =

        response.context ||

        request.context ||

        {};

    /*----------------------------------
      Debug
    ----------------------------------*/

    if (

        debug

    ) {

        console.log(

            "✅ Sighting Router Success"

        );

        console.log(

            "Domain:",

            response.domain

        );

        console.log(

            "Intent:",

            response.intent

        );

        console.log(

            "Formatter:",

            response.metadata
                ?.formatter ||

            null

        );

        console.log(

            "Has Markdown:",

            !!response.markdown

        );

        console.log(

            "Data:",

            response.data

        );

        console.log(

            "Response:",

            response

        );

        console.groupEnd();

    }

    /*----------------------------------
      IMPORTANT

      SightingRouter already owns the
      formatting stage.

      DO NOT call SightingFormatter here.

      Calling it here would format the
      same response twice.
    ----------------------------------*/

    return response;

};

/*=========================================================
 DISPATCH FIRE
=========================================================*/

AIDispatcher.dispatchFire = async function (

    request

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !request ||

        typeof request !==

        "object"

    ) {

        return {

            success:

                false,

            domain:

                "fire",

            message:

                "Invalid fire request."

        };

    }

    /*----------------------------------
      Router
    ----------------------------------*/

    const FireRouter =

        GG.FireRouter;

    if (

        !FireRouter ||

        typeof FireRouter.route !==

        "function"

    ) {

        return {

            success:

                false,

            domain:

                "fire",

            intent:

                request.intent ||

                null,

            message:

                "FireRouter unavailable."

        };

    }

    /*----------------------------------
      Route
    ----------------------------------*/

    const response =

        await FireRouter.route(

            request

        );

    /*----------------------------------
      Failed
    ----------------------------------*/

    if (

        !response ||

        response.success !==

        true

    ) {

        return (

            response ||

            {

                success:

                    false,

                domain:

                    "fire",

                intent:

                    request.intent ||

                    null,

                message:

                    "Fire router failed."

            }

        );

    }

    return response;

};

/*=========================================================
 DISPATCH PATROL
=========================================================*/

AIDispatcher.dispatchPatrol = async function (

    request

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !request ||

        typeof request !==

        "object"

    ) {

        return {

            success:

                false,

            domain:

                "patrol",

            message:

                "Invalid patrol request."

        };

    }

    /*----------------------------------
      Router
    ----------------------------------*/

    const PatrolRouter =

        GG.PatrolRouter;

    if (

        !PatrolRouter ||

        typeof PatrolRouter.route !==

        "function"

    ) {

        return {

            success:

                false,

            domain:

                "patrol",

            intent:

                request.intent ||

                null,

            message:

                "PatrolRouter unavailable."

        };

    }

    /*----------------------------------
      Route
    ----------------------------------*/

    const response =

        await PatrolRouter.route(

            request

        );

    /*----------------------------------
      Failed
    ----------------------------------*/

    if (

        !response ||

        response.success !==

        true

    ) {

        return (

            response ||

            {

                success:

                    false,

                domain:

                    "patrol",

                intent:

                    request.intent ||

                    null,

                message:

                    "Patrol router failed."

            }

        );

    }

    return response;

};

/*=========================================================
 DISPATCH ANALYTICS
=========================================================*/

AIDispatcher.dispatchAnalytics = async function (

    request

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !request ||

        typeof request !==

        "object"

    ) {

        return {

            success:

                false,

            domain:

                "analytics",

            message:

                "Invalid analytics request."

        };

    }

    /*----------------------------------
      Router
    ----------------------------------*/

    const AnalyticsRouter =

        GG.AnalyticsRouter;

    if (

        !AnalyticsRouter ||

        typeof AnalyticsRouter.route !==

        "function"

    ) {

        return {

            success:

                false,

            domain:

                "analytics",

            intent:

                request.intent ||

                null,

            message:

                "AnalyticsRouter unavailable."

        };

    }

    /*----------------------------------
      Route
    ----------------------------------*/

    const response =

        await AnalyticsRouter.route(

            request

        );

    /*----------------------------------
      Failed
    ----------------------------------*/

    if (

        !response ||

        response.success !==

        true

    ) {

        return (

            response ||

            {

                success:

                    false,

                domain:

                    "analytics",

                intent:

                    request.intent ||

                    null,

                message:

                    "Analytics router failed."

            }

        );

    }

    return response;

};

/*=========================================================
 DISPATCH LEGAL
=========================================================*/

AIDispatcher.dispatchLegal = async function (

    request

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !request ||

        typeof request !==

        "object"

    ) {

        return {

            success:

                false,

            domain:

                "legal",

            message:

                "Invalid legal request."

        };

    }

    /*----------------------------------
      Router
    ----------------------------------*/

    const LegalRouter =

        GG.LegalRouter;

    if (

        !LegalRouter ||

        typeof LegalRouter.route !==

        "function"

    ) {

        return {

            success:

                false,

            domain:

                "legal",

            intent:

                request.intent ||

                null,

            message:

                "LegalRouter unavailable."

        };

    }

    /*----------------------------------
      Route
    ----------------------------------*/

    const response =

        await LegalRouter.route(

            request

        );

    /*----------------------------------
      Failed
    ----------------------------------*/

    if (

        !response ||

        response.success !==

        true

    ) {

        return (

            response ||

            {

                success:

                    false,

                domain:

                    "legal",

                intent:

                    request.intent ||

                    null,

                message:

                    "Legal router failed."

            }

        );

    }

    return response;

};

/*=========================================================
 DISPATCH REPORT
=========================================================*/

AIDispatcher.dispatchReport = async function (

    request

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !request ||

        typeof request !==

        "object"

    ) {

        return {

            success:

                false,

            domain:

                "report",

            message:

                "Invalid report request."

        };

    }

    /*----------------------------------
      Router
    ----------------------------------*/

    const ReportRouter =

        GG.ReportRouter;

    if (

        !ReportRouter ||

        typeof ReportRouter.route !==

        "function"

    ) {

        return {

            success:

                false,

            domain:

                "report",

            intent:

                request.intent ||

                null,

            message:

                "ReportRouter unavailable."

        };

    }

    /*----------------------------------
      Route
    ----------------------------------*/

    const response =

        await ReportRouter.route(

            request

        );

    /*----------------------------------
      Failed
    ----------------------------------*/

    if (

        !response ||

        response.success !==

        true

    ) {

        return (

            response ||

            {

                success:

                    false,

                domain:

                    "report",

                intent:

                    request.intent ||

                    null,

                message:

                    "Report router failed."

            }

        );

    }

    return response;

};

/*=========================================================
 GET STATUS
=========================================================*/

AIDispatcher.getStatus = function () {

    return {

        loaded:

            AIDispatcher.loaded,

        loading:

            AIDispatcher.loading,

        version:

            AIDispatcher.VERSION,

        cacheSize:

            AIDispatcher.cache.size,

        lastQuery:

            AIDispatcher.lastQuery,

        lastIntent:

            AIDispatcher.lastIntent,

        lastRequest:

            AIDispatcher.lastRequest,

        lastResponse:

            AIDispatcher.lastResponse,

        routers: {

            staff:

                !!GG.StaffRouter,

            gis:

                !!GG.GISRouter,

            wildlife:

                !!GG.WildlifeRouter,

            sighting:

                !!GG.SightingRouter,

            fire:

                !!GG.FireRouter,

            patrol:

                !!GG.PatrolRouter,

            analytics:

                !!GG.AnalyticsRouter,

            legal:

                !!GG.LegalRouter,

            report:

                !!GG.ReportRouter

        }

    };

};

/*=========================================================
 REGISTER GLOBAL DISPATCH FUNCTION
=========================================================*/

GG.dispatchAI = function (

    request

) {

    return AIDispatcher.dispatch(

        request

    );

};

/*=========================================================
 EXPORT
=========================================================*/

GG.AIDispatcher =

    AIDispatcher;

/*=========================================================
 READY
=========================================================*/

if (

    GG.Config?.DEBUG?.ENABLED

) {

    console.log(

        "%cAI Dispatcher Loaded",

        "color:#008000;font-weight:bold;"

    );

}

/*=========================================================
 MODULE LOADED
=========================================================*/

console.log(

    "✅ AIDispatcher Loaded",

    AIDispatcher.VERSION

);

/*=========================================================
 END MODULE
=========================================================*/

})(window);
