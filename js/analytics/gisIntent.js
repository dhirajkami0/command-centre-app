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

    GISIntent.detectHierarchy(

        result

    );

    GISIntent.detectSelection(

        result

    );

    GISIntent.detectSpatial(

        result

    );

    GISIntent.detectAnalytics(

        result

    );

    GISIntent.detectMap(

        result

    );

    /*----------------------------------
      Return
    ----------------------------------*/

    return result;

};

    /*--------------------------------------------------
      Selection
    --------------------------------------------------*/

    GISIntent.detectSelection = function (

        result

    ) {

        if (

            result.intent

        ) {

            return result;

        }

        const query =

            result.normalizedQuery;

        const KEYWORDS =

            GG.GISConstants.KEYWORDS;

        const INTENTS =

            GG.GISConstants.INTENTS;

        if (

            GG.StaffIntent.hasKeyword(

                query,

                KEYWORDS.GIS_SELECTION

            )

        ) {

            result.intent =

                INTENTS.GIS_SELECTION;

            result.confidence =

                0.95;

        }

        return result;

    };

    /*--------------------------------------------------
      Hierarchy
    --------------------------------------------------*/

    GISIntent.detectHierarchy = function (

        result

    ) {

        if (

            result.intent

        ) {

            return result;

        }

        const query =

            result.normalizedQuery;

        const KEYWORDS =

            GG.GISConstants.KEYWORDS;

        const INTENTS =

            GG.GISConstants.INTENTS;

        if (

            GG.StaffIntent.hasKeyword(

                query,

                KEYWORDS.GIS_COMPARTMENT

            )

        ) {

            result.intent =

                INTENTS.GIS_COMPARTMENT;

            result.confidence =

                0.99;

            return result;

        }

        if (

            GG.StaffIntent.hasKeyword(

                query,

                KEYWORDS.GIS_BEAT

            )

        ) {

            result.intent =

                INTENTS.GIS_BEAT;

            result.confidence =

                0.99;

            return result;

        }

        if (

            GG.StaffIntent.hasKeyword(

                query,

                KEYWORDS.GIS_RANGE

            )

        ) {

            result.intent =

                INTENTS.GIS_RANGE;

            result.confidence =

                0.99;

            return result;

        }

        if (

            GG.StaffIntent.hasKeyword(

                query,

                KEYWORDS.GIS_DIVISION

            )

        ) {

            result.intent =

                INTENTS.GIS_DIVISION;

            result.confidence =

                0.99;

        }

        return result;

    };

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

        const query =

            result.normalizedQuery;

        const KEYWORDS =

            GG.GISConstants.KEYWORDS;

        const INTENTS =

            GG.GISConstants.INTENTS;

        if (

            GG.StaffIntent.hasKeyword(

                query,

                KEYWORDS.GIS_NEAREST

            )

        ) {

            result.intent =

                INTENTS.GIS_NEAREST;

            result.confidence =

                0.98;

            return result;

        }

        if (

            GG.StaffIntent.hasKeyword(

                query,

                KEYWORDS.GIS_INSIDE

            )

        ) {

            result.intent =

                INTENTS.GIS_INSIDE;

            result.confidence =

                0.98;

            return result;

        }

        if (

            GG.StaffIntent.hasKeyword(

                query,

                KEYWORDS.GIS_DISTANCE

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

        const query =

            result.normalizedQuery;

        const KEYWORDS =

            GG.GISConstants.KEYWORDS;

        const INTENTS =

            GG.GISConstants.INTENTS;

        if (

            GG.StaffIntent.hasKeyword(

                query,

                KEYWORDS.GIS_ANALYTICS

            )

        ) {

            result.intent =

                INTENTS.GIS_ANALYTICS;

            result.confidence =

                0.97;

            return result;

        }

        if (

            GG.StaffIntent.hasKeyword(

                query,

                KEYWORDS.GIS_SUMMARY

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

    GISIntent.detectMap = function (

        result

    ) {

        if (

            result.intent

        ) {

            return result;

        }

        const query =

            result.normalizedQuery;

        const KEYWORDS =

            GG.GISConstants.KEYWORDS;

        const INTENTS =

            GG.GISConstants.INTENTS;

        if (

            GG.StaffIntent.hasKeyword(

                query,

                KEYWORDS.GIS_MAP

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
