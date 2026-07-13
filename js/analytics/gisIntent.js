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
      Populate Parameters
    ----------------------------------*/

    result.parameters =

        result.parameters ||

        {};

    const feature =

        GG.GISEntities.search(

            result.normalizedQuery

        );

    if (

        feature

    ) {

        const p =

            feature.properties ||

            {};

        result.parameters.circle =

            p.circle ||

            result.parameters.circle ||

            "";

        result.parameters.division =

            p.division ||

            result.parameters.division ||

            "";

        result.parameters.range =

            p.range ||

            result.parameters.range ||

            "";

        result.parameters.beat =

            p.beat ||

            result.parameters.beat ||

            "";

        result.parameters.compartment =

            p.compartment ||

            p.name ||

            result.parameters.compartment ||

            "";

        result.parameters.village =

            p.village ||

            result.parameters.village ||

            "";

    }

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
  /*=========================================================
  Extract GIS Jurisdiction
  Source: GISEntities
=========================================================*/

GISIntent.extractJurisdiction = function (

    result

) {
    console.log(
        "🔥 extractJurisdiction called:",
        result.normalizedQuery
    );

    if (

        !result ||

        !result.normalizedQuery

    ) {

        return result;

    }


    if (

        !GG.GISEntities ||

        typeof GG.GISEntities.search !== "function"

    ) {

        return result;

    }


    let feature = null;


    const query =

        result.normalizedQuery;


    /*----------------------------------
      1. Direct Search
    ----------------------------------*/

    feature =

        GG.GISEntities.search(

            query

        );


    /*----------------------------------
      2. Range Search
    ----------------------------------*/

    if (

        !feature

    ) {

        const index =

            GG.GISEntities.build();


        for (

            const key in index.ranges

        ) {

            if (

                query.includes(key)

            ) {

                feature =

                    index.ranges[key];

                break;

            }

        }


        /*----------------------------------
          3. Beat Search
        ----------------------------------*/

        if (

            !feature

        ) {

            for (

                const key in index.beats

            ) {

                if (

                    query.includes(key)

                ) {

                    feature =

                        index.beats[key];

                    break;

                }

            }

        }


        /*----------------------------------
          4. Compartment Search
        ----------------------------------*/

        if (

            !feature

        ) {

            for (

                const key in index.compartments

            ) {

                if (

                    query.includes(key)

                ) {

                    feature =

                        index.compartments[key];

                    break;

                }

            }

        }

    }


    if (

        !feature ||

        !feature.properties

    ) {

        return result;

    }


    const p =

        feature.properties;


    result.parameters =

        result.parameters || {};


    result.parameters.circle =

        p.circle ||

        "";


    result.parameters.division =

        p.division ||

        "";


    result.parameters.range =

        p.range ||

        "";


    result.parameters.beat =

        p.beat ||

        "";


    result.parameters.compartment =

        p.compartment ||

        p.name ||

        "";


    result.entities =

        result.entities || {};


    result.entities.gis = {

        type:"Feature",

        properties:p

    };


    console.log(

        "GIS Jurisdiction Extracted:",

        result.parameters

    );


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
      Specific → Generic
    ----------------------------------*/


    /*----------------------------------
      Jurisdiction Detection
    ----------------------------------*/

GISIntent.detectHierarchy(

    result

);


/*----------------------------------
  GIS Jurisdiction Extraction
----------------------------------*/

GISIntent.extractJurisdiction(

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

            result.normalizedQuery,

            GG.GISConstants.KEYWORDS.GIS_STAFF_PRESENCE_COUNT

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
