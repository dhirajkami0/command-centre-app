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

const StaffIntent =
    GG.StaffIntent;

const StaffRouter =
    GG.StaffRouter;

const StaffFormatter =
    GG.StaffFormatter;

if (

    !StaffIntent

) {

    throw new Error(

        "StaffIntent not loaded."

    );

}

if (

    !StaffRouter

) {

    throw new Error(

        "StaffRouter not loaded."

    );

}

if (

    !StaffFormatter

) {

    throw new Error(

        "StaffFormatter not loaded."

    );

}

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

    false;

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
 INITIALIZE
=========================================================*/

AIDispatcher.initialize = function () {

    AIDispatcher.loaded =

        true;

    AIDispatcher.loading =

        false;

    return true;

};/*=========================================================
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
        typeof request !== "object"
    ) {
        console.error(
            "❌ Invalid Request"
        );
        console.groupEnd();
        return {
            success: false,
            message:
                "Invalid request."
        };
    }

    const intent =
        request.detectedIntent ||
        request;
/*----------------------------------
  Normalize Request
----------------------------------*/

if (

    request.detectedIntent

) {

    request.intent =

        request.detectedIntent.intent;

    request.domain =

        request.detectedIntent.domain;

    request.parameters =

        request.detectedIntent.parameters ||

        {};

    request.entities =

        request.detectedIntent.entities ||

        {};

    request.context =

        request.detectedIntent.context ||

        {};

    request.confidence =

        request.detectedIntent.confidence ||

        0;

}
    /*----------------------------------
      Create Response
    ----------------------------------*/

    const response =
        AIDispatcher.createResponse(
            request.query || ""
        );

    AIDispatcher.lastRequest =
        request;
    AIDispatcher.lastIntent =
        intent;
    AIDispatcher.lastQuery =
        request.query || "";

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
      Route
    ----------------------------------*/

    let routed =
        null;
    console.time(
        "Router"
    );

    switch (
        intent.domain
    ) {
        case "staff":
            console.log(
                "➡ Routing → StaffRouter"
            );
            routed =
                await GG.StaffRouter.route(
                    request
                );
            break;
        case "gis":
            console.log(
                "➡ Routing → GISRouter"
            );
            routed =
                await GG.GISRouter.route(
                    request
                );
            break;
        case "wildlife":
            console.log(
                "➡ Routing → WildlifeRouter"
            );
            routed =
                await GG.WildlifeRouter.route(
                    request
                );
            break;
        case "fire":
            console.log(
                "➡ Routing → FireRouter"
            );
            routed =
                await GG.FireRouter.route(
                    request
                );
            break;
        case "patrol":
            console.log(
                "➡ Routing → PatrolRouter"
            );
            routed =
                await GG.PatrolRouter.route(
                    request
                );
            break;
        case "analytics":
            console.log(
                "➡ Routing → AnalyticsRouter"
            );
            routed =
                await GG.AnalyticsRouter.route(
                    request
                );
            break;
        default:
            console.error(
                "❌ Unsupported Domain:",
                intent.domain
            );
            console.groupEnd();
            return {
                success: false,
                message:
                    "Unsupported AI domain."
            };
    }

    console.timeEnd(
        "Router"
    );

    console.log(
        "📦 Router Response:",
        routed
    );

    /*----------------------------------
      Router Failed
    ----------------------------------*/

    if (
        !routed ||
        !routed.success
    ) {
        console.error(
            "❌ Router Failed"
        );
        console.groupEnd();
        return routed;
    }

/*----------------------------------
  Already Formatted By Router
----------------------------------*/

const formatted =

    routed;

    console.log(
        "📝 Formatted:",
        formatted
    );

    /*----------------------------------
      Unified Response
    ----------------------------------*/

    response.success =
        formatted.success;
    response.domain =
        intent.domain;
    response.intent =
        intent.intent;
    response.confidence =
        intent.confidence;
    response.data =
        routed.data;
    response.raw =
        routed;
    response.request =
        request;
    response.detectedIntent =
        intent;
    response.formatted =
        formatted;
    response.answer =
        formatted.markdown ||
        formatted.html ||
        formatted.message ||
        "";
    response.message =
        formatted.message;
    response.cards =
        formatted.cards ||
        [];
    response.tables =
        formatted.tables ||
        [];
    response.sections =
        formatted.sections ||
        [];
    response.metadata.executionTime =
        Date.now() -
        started;

    AIDispatcher.lastResponse =
        response;

    console.log(
        "✅ Final Dispatcher Response:",
        response
    );
    console.log(
        "⏱ Total Dispatcher Time:",
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
 EXPORT
=========================================================*/

GG.AIDispatcher =

    AIDispatcher;

/*=========================================================
 INITIALIZE
=========================================================*/

AIDispatcher.initialize();

/*=========================================================
 READY
=========================================================*/

console.log(

    "%cAI Dispatcher Loaded",

    "color:#008000;font-weight:bold;"

);

})(window);
