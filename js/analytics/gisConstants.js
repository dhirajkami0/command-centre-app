/*=========================================================
  GreenGuard AI
  GIS Constants
=========================================================*/

window.GreenGuardAI =
    window.GreenGuardAI || {};

(function (

    GG

) {

    "use strict";

    const GISConstants = {};

    /*--------------------------------------------------
      VERSION
    --------------------------------------------------*/

    GISConstants.VERSION =

        "1.0.0";

    /*--------------------------------------------------
      DOMAIN
    --------------------------------------------------*/

    GISConstants.DOMAIN =

        "gis";

    /*--------------------------------------------------
      INTENTS
    --------------------------------------------------*/

    GISConstants.INTENTS = Object.freeze({

        GIS_SEARCH:
            "gisSearch",

        GIS_PROFILE:
            "gisProfile",

        GIS_MAP:
            "gisMap",

        GIS_FILTER:
            "gisFilter",

        GIS_SELECTION:
            "gisSelection",

        GIS_CURRENT_LOCATION:
            "gisCurrentLocation",

        GIS_CURRENT_FILTER:
            "gisCurrentFilter",

        GIS_DIVISION:
            "gisDivision",

        GIS_RANGE:
            "gisRange",

        GIS_BEAT:
            "gisBeat",

        GIS_COMPARTMENT:
            "gisCompartment",

        GIS_VILLAGE:
            "gisVillage",

        GIS_HIERARCHY:
            "gisHierarchy",

        GIS_NEAREST:
            "gisNearest",

        GIS_INSIDE:
            "gisInside",

        GIS_CONTAINS:
            "gisContains",

        GIS_DISTANCE:
            "gisDistance",

        GIS_DIRECTION:
            "gisDirection",

        GIS_ANALYTICS:
            "gisAnalytics",

        GIS_SUMMARY:
            "gisSummary"

    });

    /*--------------------------------------------------
      KEYWORDS
    --------------------------------------------------*/

    GISConstants.KEYWORDS = Object.freeze({

        GIS_MAP: [

            "MAP",

            "OPEN MAP",

            "SHOW MAP",

            "CURRENT MAP"

        ],

        GIS_FILTER: [

            "FILTER",

            "CURRENT FILTER",

            "MAP FILTER"

        ],

        GIS_SELECTION: [

            "SELECTED",

            "CURRENT",

            "CURRENT AREA",

            "SELECTED AREA",

            "SELECTED POLYGON"

        ],

        GIS_DIVISION: [

            "DIVISION"

        ],

        GIS_RANGE: [

            "RANGE"

        ],

        GIS_BEAT: [

            "BEAT"

        ],

        GIS_COMPARTMENT: [

            "COMPARTMENT",

            "COMP",

            "COUPE"

        ],

        GIS_VILLAGE: [

            "VILLAGE"

        ],

        GIS_HIERARCHY: [

            "HIERARCHY",

            "JURISDICTION"

        ],

        GIS_NEAREST: [

            "NEAREST",

            "CLOSEST",

            "NEAR"

        ],

        GIS_INSIDE: [

            "INSIDE",

            "WITHIN",

            "IN"

        ],

        GIS_CONTAINS: [

            "CONTAINS",

            "HAS",

            "INCLUDES"

        ],

        GIS_DISTANCE: [

            "DISTANCE"

        ],

        GIS_DIRECTION: [

            "DIRECTION",

            "BEARING"

        ],

        GIS_ANALYTICS: [

            "ANALYTICS",

            "STATISTICS",

            "REPORT"

        ],

        GIS_SUMMARY: [

            "SUMMARY",

            "OVERVIEW"

        ]

    });

    /*--------------------------------------------------
      ENTITY TYPES
    --------------------------------------------------*/

    GISConstants.ENTITY_TYPES = Object.freeze({

        DIVISION:
            "division",

        RANGE:
            "range",

        BEAT:
            "beat",

        COMPARTMENT:
            "compartment",

        VILLAGE:
            "village",

        GEOMETRY:
            "geometry"

    });

    /*--------------------------------------------------
      EXPORT
    --------------------------------------------------*/

    GG.GISConstants =

        Object.freeze(

            GISConstants

        );

})(

    window.GreenGuardAI

);
