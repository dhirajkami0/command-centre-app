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

        "✅ Dispatcher Response:",

        response

    );

    console.log(

        "⏱ Execution:",

        response.metadata.executionTime,

        "ms"

    );

    console.groupEnd();

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

                "Invalid staff intent."

        };

    }

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

                    "Staff router failed."

            }

        );

    }

    /*----------------------------------
      Already Formatted
    ----------------------------------*/

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

};/*=========================================================
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

    Object.freeze(

        AIDispatcher

    );

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
