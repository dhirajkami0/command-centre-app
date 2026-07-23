(function (window) {

"use strict";

/*=========================================================
 GREENGUARD AI
=========================================================*/

const GG =
    window.GreenGuardAI =
    window.GreenGuardAI || {};

/*=========================================================
 DEPENDENCIES
=========================================================*/

/*
    Domain routers are resolved lazily
    inside each dispatch method.

    Example:
    - dispatchStaff()
    - dispatchGIS()
    - dispatchWildlife()
    - dispatchPatrol()
    - dispatchAnalytics()
    - dispatchLegal()
    - dispatchReport()
    - dispatchFire()
*/

/*=========================================================
 MODULE
=========================================================*/

const AIDispatcher = {};

/*=========================================================
 VERSION
=========================================================*/

AIDispatcher.VERSION =

    "1.0.0";

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

AIDispatcher.lastQuery =

    "";

AIDispatcher.lastIntent =

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

            createdAt:

                Date.now(),

            executionTime:

                0

        }

    };

};

/*=========================================================
 MASTER DISPATCH
=========================================================*/

/*=========================================================
 MASTER DISPATCH
=========================================================*/

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

        console.groupEnd();

        return {

            success: false,

            message:

                "Invalid request."

        };

    }

    /*----------------------------------
      Normalize
    ----------------------------------*/

    const intent =

        request.detectedIntent ||

        request;

    if (

        request.detectedIntent

    ) {

        request.intent =

            intent.intent;

        request.domain =

            intent.domain;

        request.parameters =

            intent.parameters ||

            {};

        request.entities =

            intent.entities ||

            {};

        request.context =

            intent.context ||

            {};

        request.confidence =

            intent.confidence ||

            0;

    }

    AIDispatcher.lastRequest =

        request;

    AIDispatcher.lastIntent =

        intent;

    AIDispatcher.lastQuery =

        request.query ||

        "";

    console.log(

        "Domain:",

        intent.domain

    );

    console.log(

        "Intent:",

        intent.intent

    );

    console.log(

        "Confidence:",

        intent.confidence

    );

    /*----------------------------------
      Dispatch
    ----------------------------------*/

    let response =

        null;

    console.time(

        "Dispatch"

    );

    switch (

        intent.domain

    ) {

        case "staff":

            response =

                await AIDispatcher.dispatchStaff(

                    request

                );

            break;

        case "gis":

            response =

                await AIDispatcher.dispatchGIS(

                    request

                );

            break;

        case "wildlife":

            response =

                await AIDispatcher.dispatchWildlife(

                    request

                );

            break;
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


        case "fire":

            response =

                await AIDispatcher.dispatchFire(

                    request

                );

            break;
        case "fire":

            response =

                await AIDispatcher.dispatchFire(

                    request

                );

            break;

        case "patrol":

            response =

                await AIDispatcher.dispatchPatrol(

                    request

                );

            break;

        case "analytics":

            response =

                await AIDispatcher.dispatchAnalytics(

                    request

                );

            break;

        case "legal":

            response =

                await AIDispatcher.dispatchLegal(

                    request

                );

            break;

        case "report":

            response =

                await AIDispatcher.dispatchReport(

                    request

                );

            break;

        default:

            response = {

                success: false,

                message:

                    "Unsupported AI domain."

            };

    }

    console.timeEnd(

        "Dispatch"

    );

    /*----------------------------------
      Failed
    ----------------------------------*/

    if (

        !response ||

        response.success !==

        true

    ) {

        console.error(

            "❌ Dispatcher Failed",

            response

        );

        console.groupEnd();

        return response;

    }

    /*----------------------------------
      Metadata
    ----------------------------------*/

    response.metadata =

        response.metadata ||

        {};

    response.metadata.executionTime =

        Date.now() -

        started;

    response.request =

        request;

    response.detectedIntent =

        intent;

    AIDispatcher.lastResponse =

        response;



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

return response;


}; /*=========================================================
 DISPATCH STAFF
=========================================================*/

/*=========================================================
 DISPATCH STAFF
=========================================================*/
 /*=========================================================
 DISPATCH LEGAL
=========================================================*/

AIDispatcher.dispatchLegal = async function (

    intent

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !intent ||

        typeof intent !==

        "object"

    ) {

        return {

            success: false,

            message:

                "Invalid legal intent."

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

            success: false,

            message:

                "LegalRouter unavailable."

        };

    }

    /*----------------------------------
      Route
    ----------------------------------*/

    const response =

        await LegalRouter.route(

            intent

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

                success: false,

                message:

                    "Legal router failed."

            }

        );

    }

    /*----------------------------------
      Already Formatted
    ----------------------------------*/

    return response;

};
 /*=========================================================
 DISPATCH REPORT
=========================================================*/

AIDispatcher.dispatchReport = async function (

    intent

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !intent ||

        typeof intent !==

        "object"

    ) {

        return {

            success: false,

            message:

                "Invalid report intent."

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

            success: false,

            message:

                "ReportRouter unavailable."

        };

    }

    /*----------------------------------
      Route
    ----------------------------------*/

    const response =

        await ReportRouter.route(

            intent

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

                success: false,

                message:

                    "Report router failed."

                }

        );

    }

    /*----------------------------------
      Already Formatted
    ----------------------------------*/

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

            success: false,

            message:

                "Invalid staff request."

        };

    }

    /*----------------------------------
      Normalize Staff Entities
    ----------------------------------*/

    request.entities =

        request.entities ||

        {};

    /* AI returns:
       entities.name = "DHIRAJ KAMI"

       Staff pipeline expects:
       entities.staff = ["DHIRAJ KAMI"]
    */

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

            success: false,

            message:

                "StaffRouter unavailable."

        };

    }

    /*----------------------------------
      Route
    ----------------------------------*/

    const response =

        await StaffRouter.route(

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

        console.error(

            "❌ Staff Router Failed",

            response

        );

        return (

            response ||

            {

                success: false,

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

/*=========================================================
 DISPATCH GIS
=========================================================*/

AIDispatcher.dispatchGIS = async function (

    intent

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !intent ||

        typeof intent !==

        "object"

    ) {

        return {

            success: false,

            message:

                "Invalid GIS intent."

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

            success: false,

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

            intent

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

                success: false,

                message:

                    "GIS router failed."

            }

        );

    }

    /*----------------------------------
      Already Formatted
    ----------------------------------*/

    return response;

};/*=========================================================
 DISPATCH WILDLIFE
=========================================================*/

/*=========================================================
 DISPATCH WILDLIFE
=========================================================*/

AIDispatcher.dispatchWildlife = async function (

    intent

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !intent ||

        typeof intent !==

        "object"

    ) {

        return {

            success: false,

            message:

                "Invalid wildlife intent."

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

            success: false,

            message:

                "WildlifeRouter unavailable."

        };

    }

    /*----------------------------------
      Route
    ----------------------------------*/

    const response =

        await WildlifeRouter.route(

            intent

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

                success: false,

                message:

                    "Wildlife router failed."

            }

        );

    }

    /*----------------------------------
      Already Formatted
    ----------------------------------*/

    return response;

};
 
/*=========================================================
 DISPATCH SIGHTING
=========================================================*/

/**
 * Dispatch Elephant Sighting / HEC requests.
 *
 * Pipeline:
 *
 * AIDispatcher
 *      ↓
 * SightingRouter
 *      ↓
 * SightingQuery
 *      ↓
 * SightingFormatter
 *
 * IMPORTANT:
 *
 * SightingRouter owns:
 *
 * - intent → query-handler routing
 * - query execution
 * - formatter invocation
 *
 * Therefore AIDispatcher MUST NOT:
 *
 * - query sightings directly
 * - read Firestore directly
 * - calculate HEC analytics
 * - calculate mitigation
 * - format the response again
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
      Normalize Request Containers
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

    if (

        GG.Config?.DEBUG?.ENABLED

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

            GG.Config?.DEBUG?.ENABLED

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
      Ensure Router Initialized
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

        }

    }


    /*----------------------------------
      Optional Route Registration
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

            GG.Config?.DEBUG?.ENABLED

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

            GG.Config?.DEBUG?.ENABLED

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

            GG.Config?.DEBUG?.ENABLED

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
      Success Debug
    ----------------------------------*/

    if (

        GG.Config?.DEBUG?.ENABLED

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
      formatter stage.

      DO NOT call:

      GG.SightingFormatter.format()

      here again.

      Otherwise the response would be
      formatted twice.
    ----------------------------------*/


    return response;

};
 
 
 
 /*=========================================================
 DISPATCH FIRE
=========================================================*/

AIDispatcher.dispatchFire = async function (

    intent

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !intent ||

        typeof intent !==

        "object"

    ) {

        return {

            success: false,

            message:

                "Invalid fire intent."

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

            success: false,

            message:

                "FireRouter unavailable."

        };

    }

    /*----------------------------------
      Route
    ----------------------------------*/

    const response =

        await FireRouter.route(

            intent

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

                success: false,

                message:

                    "Fire router failed."

            }

        );

    }

    /*----------------------------------
      Already Formatted
    ----------------------------------*/

    return response;

};/*=========================================================
 DISPATCH PATROL
=========================================================*/

/*=========================================================
 DISPATCH PATROL
=========================================================*/

AIDispatcher.dispatchPatrol = async function (

    intent

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !intent ||

        typeof intent !==

        "object"

    ) {

        return {

            success: false,

            message:

                "Invalid patrol intent."

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

            success: false,

            message:

                "PatrolRouter unavailable."

        };

    }

    /*----------------------------------
      Route
    ----------------------------------*/

    const response =

        await PatrolRouter.route(

            intent

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

                success: false,

                message:

                    "Patrol router failed."

            }

        );

    }

    /*----------------------------------
      Already Formatted
    ----------------------------------*/

    return response;

};/*=========================================================
 DISPATCH ANALYTICS
=========================================================*/

/*=========================================================
 DISPATCH ANALYTICS
=========================================================*/

AIDispatcher.dispatchAnalytics = async function (

    intent

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !intent ||

        typeof intent !==

        "object"

    ) {

        return {

            success: false,

            message:

                "Invalid analytics intent."

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

            success: false,

            message:

                "AnalyticsRouter unavailable."

        };

    }

    /*----------------------------------
      Route
    ----------------------------------*/

    const response =

        await AnalyticsRouter.route(

            intent

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

                success: false,

                message:

                    "Analytics router failed."

            }

        );

    }

    /*----------------------------------
      Already Formatted
    ----------------------------------*/

    return response;

};/*=========================================================
 REGISTER
=========================================================*/

GG.dispatchAI = function (

    intent

) {

    return AIDispatcher.dispatch(

        intent

    );

};
/*=========================================================
INITIALIZE
=========================================================*/



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

})(window);
