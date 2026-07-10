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

    intent

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

        "Incoming Intent:",

        intent

    );

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !intent ||

        typeof intent !== "object"

    ) {

        console.error(

            "❌ Invalid Intent"

        );

        console.groupEnd();

        return {

            success: false,

            message:

                "Invalid intent."

        };

    }

    /*----------------------------------
      Create Response
    ----------------------------------*/

    const response =

        AIDispatcher.createResponse(

            intent.query || ""

        );

    AIDispatcher.lastIntent =

        intent;

    AIDispatcher.lastQuery =

        intent.query || "";

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

                    intent

                );

            break;

        case "gis":

            console.log(

                "➡ Routing → GISRouter"

            );

            routed =

                await GG.GISRouter.route(

                    intent

                );

            break;

        case "wildlife":

            console.log(

                "➡ Routing → WildlifeRouter"

            );

            routed =

                await GG.WildlifeRouter.route(

                    intent

                );

            break;

        case "fire":

            console.log(

                "➡ Routing → FireRouter"

            );

            routed =

                await GG.FireRouter.route(

                    intent

                );

            break;

        case "patrol":

            console.log(

                "➡ Routing → PatrolRouter"

            );

            routed =

                await GG.PatrolRouter.route(

                    intent

                );

            break;

        case "analytics":

            console.log(

                "➡ Routing → AnalyticsRouter"

            );

            routed =

                await GG.AnalyticsRouter.route(

                    intent

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
      Formatter
    ----------------------------------*/

    let formatted =

        routed;

    console.time(

        "Formatter"

    );

    switch (

        intent.domain

    ) {

        case "staff":

            console.log(

                "➡ StaffFormatter"

            );
console.log(
    "===== ROUTED BEFORE FORMAT ====="
);

console.log(
    routed.intent
);

console.log(
    routed.data
);

console.log(
    routed.data?.length
);

console.log(
    routed.data?.[0]
);

console.log(
    routed.data?.[0]?.staff?.length
);
            formatted =

                GG.StaffFormatter.format(

                    routed

                );

            break;

        case "gis":

            if (

                GG.GISFormatter

            ) {

                console.log(

                    "➡ GISFormatter"

                );

                formatted =

                    GG.GISFormatter.format(

                        routed

                    );

            }

            break;

    }

    console.timeEnd(

        "Formatter"

    );

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

};
 /*=========================================================
 DISPATCH STAFF
=========================================================*/

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

        typeof intent !== "object"

    ) {

        return {

            success: false,

            message:

                "Invalid staff intent."

        };

    }

    /*----------------------------------
      Dependencies
    ----------------------------------*/

    const StaffRouter =

        GG.StaffRouter;

    const StaffFormatter =

        GG.StaffFormatter;

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

    if (

        !StaffFormatter ||

        typeof StaffFormatter.format !==

        "function"

    ) {

        return {

            success: false,

            message:

                "StaffFormatter unavailable."

        };

    }

    /*----------------------------------
      Route Request
    ----------------------------------*/

    const routed =

        await StaffRouter.route(

            intent

        );

    /*----------------------------------
      Route Failed
    ----------------------------------*/

    if (

        !routed ||

        routed.success !== true

    ) {

        return (

            routed ||

            {

                success: false,

                message:

                    "Staff router failed."

            }

        );

    }

    /*----------------------------------
      Format Response
    ----------------------------------*/

    const formatted =

        StaffFormatter.format(

            routed

        );

    /*----------------------------------
      Formatter Failed
    ----------------------------------*/

    if (

        !formatted ||

        formatted.success !== true

    ) {

        return {

            success: false,

            message:

                "Staff formatter failed."

        };

    }

    /*----------------------------------
      Return
    ----------------------------------*/

    return {

        success:

            true,

        source:

            "LOCAL",

        domain:

            "staff",

        intent:

            intent.intent,

        confidence:

            intent.confidence,

        entities:

            intent.entities ||

            {},

        /*----------------------------------
          IMPORTANT
        ----------------------------------*/

        data:

            routed.data ||

            null,

        markdown:

            formatted.markdown ||

            "",

        html:

            formatted.html ||

            "",

        cards:

            formatted.cards ||

            [],

        tables:

            formatted.tables ||

            [],

        sections:

            formatted.sections ||

            [],

        message:

            formatted.message ||

            "",

        metadata:

            routed.metadata ||

            {}

    };

};/*=========================================================
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

        typeof intent !== "object"

    ) {

        return {

            success: false,

            message:

                "Invalid GIS intent."

        };

    }

    /*----------------------------------
      Dependencies
    ----------------------------------*/

    const GISRouter =

        GG.GISRouter;

    const GISFormatter =

        GG.GISFormatter;

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
      Route Request
    ----------------------------------*/

    const routed =

        await GISRouter.route(

            intent

        );

    /*----------------------------------
      Route Failed
    ----------------------------------*/

    if (

        !routed ||

        routed.success !== true

    ) {

        return (

            routed ||

            {

                success: false,

                message:

                    "GIS router failed."

            }

        );

    }

    /*----------------------------------
      Format Response
    ----------------------------------*/

    let formatted =

        routed;

    if (

        GISFormatter &&

        typeof GISFormatter.format ===

        "function"

    ) {

        formatted =

            GISFormatter.format(

                routed

            );

    }

    /*----------------------------------
      Formatter Failed
    ----------------------------------*/

    if (

        !formatted ||

        formatted.success !== true

    ) {

        return {

            success: false,

            message:

                "GIS formatter failed."

        };

    }

    /*----------------------------------
      Return
    ----------------------------------*/

    return {

        success:

            true,

        source:

            "LOCAL",

        domain:

            "gis",

        intent:

            intent.intent,

        confidence:

            intent.confidence,

        entities:

            intent.entities ||

            {},

        /*----------------------------------
          IMPORTANT
        ----------------------------------*/

        data:

            routed.data ||

            null,

        markdown:

            formatted.markdown ||

            "",

        html:

            formatted.html ||

            "",

        cards:

            formatted.cards ||

            [],

        tables:

            formatted.tables ||

            [],

        sections:

            formatted.sections ||

            [],

        message:

            formatted.message ||

            "",

        metadata:

            routed.metadata ||

            {}

    };

};/*=========================================================
 DISPATCH WILDLIFE
=========================================================*/

AIDispatcher.dispatchWildlife = function (

    intent

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !intent ||

        typeof intent !== "object"

    ) {

        return {

            success: false,

            message:

                "Invalid wildlife intent."

        };

    }

    /*----------------------------------
      Wildlife Module Check
    ----------------------------------*/

    if (

        typeof GG.WildlifeRouter !==

        "object"

    ) {

        return {

            success: false,

            domain:

                "wildlife",

            intent:

                intent.intent,

            confidence:

                intent.confidence,

            message:

                "Wildlife AI module is not installed."

        };

    }

    /*----------------------------------
      Route
    ----------------------------------*/

    const routed =

        GG.WildlifeRouter.route(

            intent

        );

    /*----------------------------------
      Route Failed
    ----------------------------------*/

    if (

        !routed ||

        routed.success !== true

    ) {

        return routed || {

            success: false,

            message:

                "Wildlife router failed."

        };

    }

    /*----------------------------------
      Formatter
    ----------------------------------*/

    let formatted =

        routed;

    if (

        GG.WildlifeFormatter &&

        typeof GG.WildlifeFormatter.format ===

        "function"

    ) {

        formatted =

            GG.WildlifeFormatter.format(

                routed

            );

    }

    /*----------------------------------
      Return
    ----------------------------------*/

    return {

        success:

            formatted.success,

        domain:

            "wildlife",

        intent:

            intent.intent,

        confidence:

            intent.confidence,

        data:

            routed,

        markdown:

            formatted.markdown ||

            "",

        html:

            formatted.html ||

            "",

        cards:

            formatted.cards ||

            [],

        tables:

            formatted.tables ||

            [],

        sections:

            formatted.sections ||

            [],

        message:

            formatted.message ||

            ""

    };

};/*=========================================================
 DISPATCH FIRE
=========================================================*/

AIDispatcher.dispatchFire = function (

    intent

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !intent ||

        typeof intent !== "object"

    ) {

        return {

            success: false,

            message:

                "Invalid fire intent."

        };

    }

    /*----------------------------------
      Fire Module Check
    ----------------------------------*/

    if (

        typeof GG.FireRouter !==

        "object"

    ) {

        return {

            success: false,

            domain:

                "fire",

            intent:

                intent.intent,

            confidence:

                intent.confidence,

            message:

                "Fire AI module is not installed."

        };

    }

    /*----------------------------------
      Route
    ----------------------------------*/

    const routed =

        GG.FireRouter.route(

            intent

        );

    /*----------------------------------
      Route Failed
    ----------------------------------*/

    if (

        !routed ||

        routed.success !== true

    ) {

        return routed || {

            success: false,

            message:

                "Fire router failed."

        };

    }

    /*----------------------------------
      Formatter
    ----------------------------------*/

    let formatted =

        routed;

    if (

        GG.FireFormatter &&

        typeof GG.FireFormatter.format ===

        "function"

    ) {

        formatted =

            GG.FireFormatter.format(

                routed

            );

    }

    /*----------------------------------
      Return
    ----------------------------------*/

    return {

        success:

            formatted.success,

        domain:

            "fire",

        intent:

            intent.intent,

        confidence:

            intent.confidence,

        data:

            routed,

        markdown:

            formatted.markdown ||

            "",

        html:

            formatted.html ||

            "",

        cards:

            formatted.cards ||

            [],

        tables:

            formatted.tables ||

            [],

        sections:

            formatted.sections ||

            [],

        message:

            formatted.message ||

            ""

    };

};/*=========================================================
 DISPATCH PATROL
=========================================================*/

AIDispatcher.dispatchPatrol = function (

    intent

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !intent ||

        typeof intent !== "object"

    ) {

        return {

            success: false,

            message:

                "Invalid patrol intent."

        };

    }

    /*----------------------------------
      Patrol Module Check
    ----------------------------------*/

    if (

        typeof GG.PatrolRouter !==

        "object"

    ) {

        return {

            success: false,

            domain:

                "patrol",

            intent:

                intent.intent,

            confidence:

                intent.confidence,

            message:

                "Patrol AI module is not installed."

        };

    }

    /*----------------------------------
      Route
    ----------------------------------*/

    const routed =

        GG.PatrolRouter.route(

            intent

        );

    /*----------------------------------
      Route Failed
    ----------------------------------*/

    if (

        !routed ||

        routed.success !== true

    ) {

        return routed || {

            success: false,

            message:

                "Patrol router failed."

        };

    }

    /*----------------------------------
      Formatter
    ----------------------------------*/

    let formatted =

        routed;

    if (

        GG.PatrolFormatter &&

        typeof GG.PatrolFormatter.format ===

        "function"

    ) {

        formatted =

            GG.PatrolFormatter.format(

                routed

            );

    }

    /*----------------------------------
      Return
    ----------------------------------*/

    return {

        success:

            formatted.success,

        domain:

            "patrol",

        intent:

            intent.intent,

        confidence:

            intent.confidence,

        data:

            routed,

        markdown:

            formatted.markdown ||

            "",

        html:

            formatted.html ||

            "",

        cards:

            formatted.cards ||

            [],

        tables:

            formatted.tables ||

            [],

        sections:

            formatted.sections ||

            [],

        message:

            formatted.message ||

            ""

    };

};/*=========================================================
 DISPATCH ANALYTICS
=========================================================*/

AIDispatcher.dispatchAnalytics = function (

    intent

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !intent ||

        typeof intent !== "object"

    ) {

        return {

            success: false,

            message:

                "Invalid analytics intent."

        };

    }

    /*----------------------------------
      Analytics Module Check
    ----------------------------------*/

    if (

        typeof GG.AnalyticsRouter !==

        "object"

    ) {

        return {

            success: false,

            domain:

                "analytics",

            intent:

                intent.intent,

            confidence:

                intent.confidence,

            message:

                "Analytics AI module is not installed."

        };

    }

    /*----------------------------------
      Route
    ----------------------------------*/

    const routed =

        GG.AnalyticsRouter.route(

            intent

        );

    /*----------------------------------
      Route Failed
    ----------------------------------*/

    if (

        !routed ||

        routed.success !== true

    ) {

        return routed || {

            success: false,

            message:

                "Analytics router failed."

        };

    }

    /*----------------------------------
      Formatter
    ----------------------------------*/

    let formatted =

        routed;

    if (

        GG.AnalyticsFormatter &&

        typeof GG.AnalyticsFormatter.format ===

        "function"

    ) {

        formatted =

            GG.AnalyticsFormatter.format(

                routed

            );

    }

    /*----------------------------------
      Return
    ----------------------------------*/

    return {

        success:

            formatted.success,

        domain:

            "analytics",

        intent:

            intent.intent,

        confidence:

            intent.confidence,

        data:

            routed,

        markdown:

            formatted.markdown ||

            "",

        html:

            formatted.html ||

            "",

        cards:

            formatted.cards ||

            [],

        tables:

            formatted.tables ||

            [],

        sections:

            formatted.sections ||

            [],

        message:

            formatted.message ||

            ""

    };

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
