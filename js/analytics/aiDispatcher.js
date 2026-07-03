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

AIDispatcher.dispatch = async function (

    intent

) {

    const started =

        Date.now();

    /*----------------------------------
      Validate Intent
    ----------------------------------*/

    if (

        !intent ||

        typeof intent !== "object"

    ) {

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

    /*----------------------------------
      Save State
    ----------------------------------*/

    AIDispatcher.lastQuery =

        intent.query || "";

    AIDispatcher.lastIntent =

        intent;
    /*----------------------------------
      Route By Domain
    ----------------------------------*/

    let raw =

        null;

    switch (

        intent.domain

    ) {

        case "staff":

            raw =

                AIDispatcher.dispatchStaff(

                    intent

                );

            break;

        case "gis":

            raw =

                AIDispatcher.dispatchGIS(

                    intent

                );

            break;

        case "wildlife":

            raw =

                AIDispatcher.dispatchWildlife(

                    intent

                );

            break;

        case "fire":

            raw =

                AIDispatcher.dispatchFire(

                    intent

                );

            break;

        case "patrol":

            raw =

                AIDispatcher.dispatchPatrol(

                    intent

                );

            break;

        case "analytics":

            raw =

                AIDispatcher.dispatchAnalytics(

                    intent

                );

            break;

        default:

            raw = {

                success: false,

                message:

                    "Unsupported AI domain."

            };

    }

    /*----------------------------------
      Format Result
    ----------------------------------*/

    const formatted =

        intent.domain ===

        "staff"

            ? StaffFormatter.format(

                raw

            )

            : raw;

    /*----------------------------------
      Build Response
    ----------------------------------*/

    response.success =

        formatted.success;

    response.domain =

        intent.domain;

    response.intent =

        intent.intent;

    response.confidence =

        intent.confidence;

    response.raw =

        raw;

    response.formatted =

        formatted;

    response.message =

        formatted.message;

    response.metadata.executionTime =

        Date.now() -

        started;

    AIDispatcher.lastResponse =

        response;

    return response;

};/*=========================================================
 DISPATCH STAFF
=========================================================*/

AIDispatcher.dispatchStaff = function (

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
      Route Request
    ----------------------------------*/

    const routed =

        StaffRouter.route(

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

                "Staff router failed."

        };

    }

    /*----------------------------------
      Format Response
    ----------------------------------*/

    const formatted =

        StaffFormatter.format(

            routed

        );

    /*----------------------------------
      Return
    ----------------------------------*/

    return {

        success:

            formatted.success,

        domain:

            "staff",

        intent:

            intent.intent,

        confidence:

            intent.confidence,

        data:

            routed,

        markdown:

            formatted.markdown,

        html:

            formatted.html,

        cards:

            formatted.cards,

        tables:

            formatted.tables,

        sections:

            formatted.sections,

        message:

            formatted.message

    };

};/*=========================================================
 DISPATCH GIS
=========================================================*/

AIDispatcher.dispatchGIS = function (

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
      GIS Module Check
    ----------------------------------*/

    if (

        typeof GG.GISRouter !==

        "object"

    ) {

        return {

            success: false,

            domain:

                "gis",

            intent:

                intent.intent,

            confidence:

                intent.confidence,

            message:

                "GIS AI module is not installed."

        };

    }

    /*----------------------------------
      Route
    ----------------------------------*/

    const routed =

        GG.GISRouter.route(

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

                "GIS router failed."

        };

    }

    /*----------------------------------
      Formatter
    ----------------------------------*/

    let formatted =

        routed;

    if (

        GG.GISFormatter &&

        typeof GG.GISFormatter.format ===

        "function"

    ) {

        formatted =

            GG.GISFormatter.format(

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

            "gis",

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
