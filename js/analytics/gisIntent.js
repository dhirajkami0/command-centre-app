/*=========================================================
  GreenGuard AI
  GIS Intent Engine
=========================================================*/

window.GreenGuardAI =
    window.GreenGuardAI || {};

(function (

    GG

) {

    "use strict";

    const GISIntent = {};

    GISIntent.VERSION =

        "1.0.0";

    /*--------------------------------------------------
      Create Result
    --------------------------------------------------*/

    GISIntent.createResult = function (

        query

    ) {

        query =

            String(

                query ||

                ""

            )

            .trim()

            .toUpperCase();

        return {

            originalQuery:

                query,

            normalizedQuery:

                query,

            domain:

                "gis",

            intent:

                null,

            confidence:

                0,

            entities: {},

            parameters: {},

            source:

                "local"

        };

    };
/*--------------------------------------------------
  Hierarchy
--------------------------------------------------*/

GISIntent.detectHierarchy = function (

    result

) {

    /*----------------------------------
      Already Detected
    ----------------------------------*/

    if (

        result.intent

    ) {

        return result;

    }

    const INTENTS =

        GG.GISConstants.INTENTS;

    /*----------------------------------
      Compartment
    ----------------------------------*/

    if (

        GG.StaffIntent.hasKeyword(

            result,

            "GIS_COMPARTMENT"

        )

    ) {

        result.intent =

            INTENTS.GIS_COMPARTMENT;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Beat
    ----------------------------------*/

    if (

        GG.StaffIntent.hasKeyword(

            result,

            "GIS_BEAT"

        )

    ) {

        result.intent =

            INTENTS.GIS_BEAT;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Range
    ----------------------------------*/

    if (

        GG.StaffIntent.hasKeyword(

            result,

            "GIS_RANGE"

        )

    ) {

        result.intent =

            INTENTS.GIS_RANGE;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Division
    ----------------------------------*/

    if (

        GG.StaffIntent.hasKeyword(

            result,

            "GIS_DIVISION"

        )

    ) {

        result.intent =

            INTENTS.GIS_DIVISION;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Circle
    ----------------------------------*/

    if (

        GG.StaffIntent.hasKeyword(

            result,

            "GIS_CIRCLE"

        )

    ) {

        result.intent =

            INTENTS.GIS_CIRCLE;

        result.confidence =

            0.99;

        return result;

    }

    /*----------------------------------
      Hierarchy
    ----------------------------------*/

    if (

        GG.StaffIntent.hasKeyword(

            result,

            "GIS_HIERARCHY"

        )

    ) {

        result.intent =

            INTENTS.GIS_HIERARCHY;

        result.confidence =

            0.98;

    }

    return result;

};
    /*--------------------------------------------------
      Detect
    --------------------------------------------------*/

GISIntent.detect = function (

    query

) {

    const result =

        GISIntent.createResult(

            query

        );

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        result.normalizedQuery ===

        ""

    ) {

        return result;

    }

    /*----------------------------------
      Detection Order
      (Specific → Generic)
    ----------------------------------*/

    /*----------------------------------
      Jurisdiction
    ----------------------------------*/

    GISIntent.detectHierarchy(

        result

    );

    /*----------------------------------
      Live Staff
    ----------------------------------*/

    GISIntent.detectStaffPresence(

        result

    );

    GISIntent.detectStaffPresenceCount(

        result

    );

    GISIntent.detectStaffOnDuty(

        result

    );

    /*----------------------------------
      Current Selection
    ----------------------------------*/

    GISIntent.detectSelection(

        result

    );

    /*----------------------------------
      Spatial
    ----------------------------------*/

    GISIntent.detectSpatial(

        result

    );

    /*----------------------------------
      Analytics
    ----------------------------------*/

    GISIntent.detectAnalytics(

        result

    );

    /*----------------------------------
      Map
    ----------------------------------*/

    GISIntent.detectMap(

        result

    );

    /*----------------------------------
      Return
    ----------------------------------*/

    return result;

};
  
  /*--------------------------------------------------
  Staff On Duty
--------------------------------------------------*/

/*--------------------------------------------------
  Staff On Duty
--------------------------------------------------*/

GISIntent.detectStaffOnDuty = function (

    result

) {

    if (

        result.intent

    ) {

        return result;

    }

    if (

        GG.StaffIntent.hasKeyword(

            result,

            "WHO_IS_ON_DUTY"

        )

    ) {

        result.intent =

            GG.GISConstants.INTENTS.GIS_STAFF_ON_DUTY;

        result.confidence =

            0.99;

    }

    return result;

};
  /*--------------------------------------------------
  Staff Presence Count
--------------------------------------------------*/
/*--------------------------------------------------
  Staff Presence
--------------------------------------------------*/

GISIntent.detectStaffPresence = function (

    result

) {

    /*----------------------------------
      Already Detected
    ----------------------------------*/

    if (

        result.intent

    ) {

        return result;

    }

    /*----------------------------------
      Staff Presence
    ----------------------------------*/

    if (

        GG.StaffIntent.hasKeyword(

            result,

            "GIS_STAFF_PRESENCE"

        )

    ) {

        result.intent =

            GG.GISConstants.INTENTS.GIS_STAFF_PRESENCE;

        result.confidence =

            0.99;

    }

    return result;

};
/*--------------------------------------------------
  Staff Presence Count
--------------------------------------------------*/

GISIntent.detectStaffPresenceCount = function (

    result

) {

    if (

        result.intent

    ) {

        return result;

    }

    if (

        GG.StaffIntent.hasKeyword(

            result,

            "GIS_STAFF_PRESENCE_COUNT"

        )

    ) {

        result.intent =

            GG.GISConstants.INTENTS.GIS_STAFF_PRESENCE_COUNT;

        result.confidence =

            0.99;

    }

    return result;

};

/*--------------------------------------------------
  Selection
--------------------------------------------------*/

/*--------------------------------------------------
  Selection
--------------------------------------------------*/
/*--------------------------------------------------
  Selection
--------------------------------------------------*/

GISIntent.detectSelection = function (

    result

) {

    /*----------------------------------
      Already Detected
    ----------------------------------*/

    if (

        result.intent

    ) {

        return result;

    }

    /*----------------------------------
      Selected GIS Object
    ----------------------------------*/

    if (

        GG.StaffIntent.hasKeyword(

            result,

            "GIS_SELECTION"

        )

    ) {

        result.intent =

            GG.GISConstants.INTENTS.GIS_SELECTION;

        result.confidence =

            0.95;

    }

    return result;

};

    /*--------------------------------------------------
      Hierarchy
    --------------------------------------------------*/

/*--------------------------------------------------
  Spatial
--------------------------------------------------*/

GISIntent.detectSpatial = function (

    result

) {

    if (

        result.intent

    ) {

        return result;

    }

    const INTENTS =

        GG.GISConstants.INTENTS;

    /*----------------------------------
      Nearest
    ----------------------------------*/

    if (

        GG.StaffIntent.hasKeyword(

            result,

            "GIS_NEAREST"

        )

    ) {

        result.intent =

            INTENTS.GIS_NEAREST;

        result.confidence =

            0.98;

        return result;

    }

    /*----------------------------------
      Inside
    ----------------------------------*/

    if (

        GG.StaffIntent.hasKeyword(

            result,

            "GIS_INSIDE"

        )

    ) {

        result.intent =

            INTENTS.GIS_INSIDE;

        result.confidence =

            0.98;

        return result;

    }

    /*----------------------------------
      Distance
    ----------------------------------*/

    if (

        GG.StaffIntent.hasKeyword(

            result,

            "GIS_DISTANCE"

        )

    ) {

        result.intent =

            INTENTS.GIS_DISTANCE;

        result.confidence =

            0.98;

    }

    return result;

};
    /*--------------------------------------------------
      Spatial
    --------------------------------------------------*/

/*--------------------------------------------------
  Spatial
--------------------------------------------------*/

GISIntent.detectSpatial = function (

    result

) {

    /*----------------------------------
      Already Detected
    ----------------------------------*/

    if (

        result.intent

    ) {

        return result;

    }

    /*----------------------------------
      Nearest
    ----------------------------------*/

    if (

        GG.StaffIntent.hasKeyword(

            result,

            "GIS_NEAREST"

        )

    ) {

        result.intent =

            GG.GISConstants.INTENTS.GIS_NEAREST;

        result.confidence =

            0.98;

        return result;

    }

    /*----------------------------------
      Inside
    ----------------------------------*/

    if (

        GG.StaffIntent.hasKeyword(

            result,

            "GIS_INSIDE"

        )

    ) {

        result.intent =

            GG.GISConstants.INTENTS.GIS_INSIDE;

        result.confidence =

            0.98;

        return result;

    }

    /*----------------------------------
      Distance
    ----------------------------------*/

    if (

        GG.StaffIntent.hasKeyword(

            result,

            "GIS_DISTANCE"

        )

    ) {

        result.intent =

            GG.GISConstants.INTENTS.GIS_DISTANCE;

        result.confidence =

            0.98;

    }

    return result;

};
    /*--------------------------------------------------
      Analytics
    --------------------------------------------------*/

/*--------------------------------------------------
  Analytics
--------------------------------------------------*/

GISIntent.detectAnalytics = function (

    result

) {

    if (

        result.intent

    ) {

        return result;

    }

    const INTENTS =

        GG.GISConstants.INTENTS;

    /*----------------------------------
      Analytics
    ----------------------------------*/

    if (

        GG.StaffIntent.hasKeyword(

            result,

            "GIS_ANALYTICS"

        )

    ) {

        result.intent =

            INTENTS.GIS_ANALYTICS;

        result.confidence =

            0.97;

        return result;

    }

    /*----------------------------------
      Summary
    ----------------------------------*/

    if (

        GG.StaffIntent.hasKeyword(

            result,

            "GIS_SUMMARY"

        )

    ) {

        result.intent =

            INTENTS.GIS_SUMMARY;

        result.confidence =

            0.97;

    }

    return result;

};
    /*--------------------------------------------------
      Map
    --------------------------------------------------*/

/*--------------------------------------------------
  Map
--------------------------------------------------*/

GISIntent.detectMap = function (

    result

) {

    if (

        result.intent

    ) {

        return result;

    }

    const INTENTS =

        GG.GISConstants.INTENTS;

    if (

        GG.StaffIntent.hasKeyword(

            result,

            "GIS_MAP"

        )

    ) {

        result.intent =

            INTENTS.GIS_MAP;

        result.confidence =

            0.96;

    }

    return result;

};

    GG.GISIntent =

        Object.freeze(

            GISIntent

        );

})(

    window.GreenGuardAI

);
