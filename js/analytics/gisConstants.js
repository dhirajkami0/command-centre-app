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

    /*----------------------------------
      Generic
    ----------------------------------*/

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

    /*----------------------------------
      Jurisdictions
    ----------------------------------*/

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

    /*----------------------------------
      Spatial
    ----------------------------------*/

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

    /*----------------------------------
      Analytics
    ----------------------------------*/

    GIS_ANALYTICS:
        "gisAnalytics",

    GIS_SUMMARY:
        "gisSummary",

    /*----------------------------------
      Live Staff Presence
      (Current GPS inside polygon)
    ----------------------------------*/

    GIS_STAFF_PRESENT:
        "gisStaffPresent",

    GIS_STAFF_COUNT:
        "gisStaffCount",

    GIS_CIRCLE_STAFF_PRESENT:
        "gisCircleStaffPresent",

    GIS_DIVISION_STAFF_PRESENT:
        "gisDivisionStaffPresent",

    GIS_RANGE_STAFF_PRESENT:
        "gisRangeStaffPresent",

    GIS_BEAT_STAFF_PRESENT:
        "gisBeatStaffPresent",

    GIS_COMPARTMENT_STAFF_PRESENT:
        "gisCompartmentStaffPresent",

    GIS_VILLAGE_STAFF_PRESENT:
        "gisVillageStaffPresent",

    /*----------------------------------
      Other Live Objects
      (Future)
    ----------------------------------*/

    GIS_WILDLIFE_PRESENT:
        "gisWildlifePresent",

    GIS_PATROL_PRESENT:
        "gisPatrolPresent",

    GIS_INCIDENT_PRESENT:
        "gisIncidentPresent",

    GIS_VEHICLE_PRESENT:
        "gisVehiclePresent"

});

    /*--------------------------------------------------
      KEYWORDS
    --------------------------------------------------*/
/*--------------------------------------------------
  QUERY TYPES
--------------------------------------------------*/

GISConstants.QUERY_TYPES = Object.freeze({

    /*----------------------------------
      Information
    ----------------------------------*/

    PROFILE:
        "profile",

    SUMMARY:
        "summary",

    DIRECTORY:
        "directory",

    COUNT:
        "count",

    SEARCH:
        "search",

    ANALYTICS:
        "analytics",

    /*----------------------------------
      Spatial
    ----------------------------------*/

    LOCATION:
        "location",

    INSIDE:
        "inside",

    CONTAINS:
        "contains",

    DISTANCE:
        "distance",

    DIRECTION:
        "direction",

    NEAREST:
        "nearest",

    MAP:
        "map",

    FILTER:
        "filter",

    /*----------------------------------
      Presence
    ----------------------------------*/

    PRESENT:
        "present",

    ACTIVE:
        "active",

    LIVE:
        "live",

    CURRENT:
        "current",

    /*----------------------------------
      Future
    ----------------------------------*/

    HISTORY:
        "history",

    TIMELINE:
        "timeline"

});
  /*--------------------------------------------------
  RESOURCE TYPES
--------------------------------------------------*/

GISConstants.RESOURCES = Object.freeze({

    STAFF:
        "staff",

    PATROL:
        "patrol",

    WILDLIFE:
        "wildlife",

    INCIDENT:
        "incident",

    VEHICLE:
        "vehicle",

    GRID:
        "grid",

    FIRE:
        "fire",

    VILLAGE:
        "village",

    WATERBODY:
        "waterbody",

    CAMERA:
        "camera"

});

  /*--------------------------------------------------
  QUERY GROUPS
--------------------------------------------------*/

GISConstants.QUERY_GROUPS = Object.freeze({

    /*----------------------------------
      Official Posting
      (Staff Domain)
    ----------------------------------*/

    STAFF_DIRECTORY:
        "staffDirectory",

    STAFF_COUNT:
        "staffCount",

    STAFF_SUMMARY:
        "staffSummary",

    /*----------------------------------
      Live Presence
      (GIS Domain)
    ----------------------------------*/

    STAFF_PRESENT:
        "staffPresent",

    STAFF_PRESENT_COUNT:
        "staffPresentCount",

    WHO_IS_PRESENT:
        "whoIsPresent",

    /*----------------------------------
      Polygon
    ----------------------------------*/

    PROFILE:
        "profile",

    SUMMARY:
        "summary",

    ANALYTICS:
        "analytics",

    DIRECTORY:
        "directory",

    MAP:
        "map"

});

  /*--------------------------------------------------
  PARAMETERS
--------------------------------------------------*/

GISConstants.PARAMETERS = Object.freeze({

    /*----------------------------------
      Jurisdiction
    ----------------------------------*/

    CIRCLE:
        "circle",

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

    /*----------------------------------
      Resource
    ----------------------------------*/

    STAFF:
        "staff",

    PATROL:
        "patrol",

    WILDLIFE:
        "wildlife",

    INCIDENT:
        "incident",

    VEHICLE:
        "vehicle",

    /*----------------------------------
      Query Mode
    ----------------------------------*/

    CURRENT:
        "current",

    LIVE:
        "live",

    PRESENT:
        "present",

    OFFICIAL:
        "official",

    /*----------------------------------
      Output
    ----------------------------------*/

    LIST:
        "list",

    COUNT:
        "count",

    SUMMARY:
        "summary",

    PROFILE:
        "profile",

    MAP:
        "map"

});
  /*--------------------------------------------------
  RESPONSE TYPES
--------------------------------------------------*/

GISConstants.RESPONSE_TYPES = Object.freeze({

    /*----------------------------------
      Generic
    ----------------------------------*/

    PROFILE:
        "profile",

    DIRECTORY:
        "directory",

    SUMMARY:
        "summary",

    LIST:
        "list",

    COUNT:
        "count",

    MAP:
        "map",

    ANALYTICS:
        "analytics",

    /*----------------------------------
      GIS Presence
    ----------------------------------*/

    STAFF_PRESENT:
        "staffPresent",

    STAFF_PRESENT_COUNT:
        "staffPresentCount",

    PATROL_PRESENT:
        "patrolPresent",

    WILDLIFE_PRESENT:
        "wildlifePresent",

    INCIDENT_PRESENT:
        "incidentPresent",

    VEHICLE_PRESENT:
        "vehiclePresent"

});

  /*--------------------------------------------------
  DATA SOURCES
--------------------------------------------------*/

GISConstants.DATA_SOURCES = Object.freeze({

    GIS:
        "GIS",

    STAFF:
        "STAFF",

    LIVE_STAFF:
        "LIVE_STAFF",

    PATROL_TRACKS:
        "PATROL_TRACKS",

    ANALYTICS:
        "ANALYTICS",

    WILDLIFE:
        "WILDLIFE",

    INCIDENTS:
        "INCIDENTS",

    FIRE:
        "FIRE"

});

  /*--------------------------------------------------
  LAYERS
--------------------------------------------------*/

GISConstants.LAYERS = Object.freeze({

    CIRCLE:
        "circle",

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

    GRID:
        "grid",

    STAFF:
        "staff",

    PATROL:
        "patrol",

    WILDLIFE:
        "wildlife",

    INCIDENT:
        "incident"

});
  /*--------------------------------------------------
  KEYWORDS
--------------------------------------------------*/

GISConstants.KEYWORDS = Object.freeze({

    /*----------------------------------
      Map
    ----------------------------------*/

    GIS_MAP: [

        "MAP",

        "SHOW MAP",

        "OPEN MAP",

        "CURRENT MAP",

        "DISPLAY MAP"

    ],

    /*----------------------------------
      Filter
    ----------------------------------*/

    GIS_FILTER: [

        "FILTER",

        "MAP FILTER",

        "CURRENT FILTER",

        "APPLY FILTER"

    ],

    /*----------------------------------
      Current Selection
    ----------------------------------*/

    GIS_SELECTION: [

        "CURRENT",

        "SELECTED",

        "SELECTED AREA",

        "CURRENT AREA",

        "CURRENT POLYGON",

        "SELECTED POLYGON"

    ],

    /*----------------------------------
      Jurisdictions
    ----------------------------------*/

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

    /*----------------------------------
      Spatial
    ----------------------------------*/

    GIS_NEAREST: [

        "NEAREST",

        "NEAR",

        "CLOSEST"

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

    /*----------------------------------
      Analytics
    ----------------------------------*/

    GIS_ANALYTICS: [

        "ANALYTICS",

        "STATISTICS",

        "REPORT"

    ],

    GIS_SUMMARY: [

        "SUMMARY",

        "OVERVIEW"

    ],

    /*----------------------------------
      Live Staff Presence
    ----------------------------------*/

    GIS_STAFF_PRESENT: [

        "STAFF PRESENT",

        "PRESENT STAFF",

        "LIVE STAFF",

        "CURRENT STAFF",

        "STAFF INSIDE",

        "STAFF IN",

        "WHO IS IN",

        "WHO IS INSIDE",

        "WHICH STAFF ARE IN",

        "SHOW STAFF",

        "SHOW STAFF INSIDE",

        "SHOW STAFF IN",

        "STAFF CURRENTLY IN",

        "STAFF CURRENTLY INSIDE"

    ],

    GIS_STAFF_COUNT: [

        "HOW MANY STAFF",

        "STAFF COUNT",

        "NUMBER OF STAFF",

        "TOTAL STAFF",

        "TOTAL STAFF PRESENT",

        "PRESENT STAFF COUNT",

        "LIVE STAFF COUNT",

        "CURRENT STAFF COUNT"

    ],

    /*----------------------------------
      Wildlife
    ----------------------------------*/

    GIS_WILDLIFE_PRESENT: [

        "ELEPHANT",

        "ELEPHANTS",

        "ANIMAL",

        "ANIMALS",

        "WILDLIFE",

        "SIGHTINGS"

    ],

    /*----------------------------------
      Patrol
    ----------------------------------*/

    GIS_PATROL_PRESENT: [

        "PATROL",

        "PATROLLING",

        "PATROL TEAM",

        "PATROL STAFF"

    ],

    /*----------------------------------
      Vehicle
    ----------------------------------*/

    GIS_VEHICLE_PRESENT: [

        "VEHICLE",

        "VEHICLES"

    ],

    /*----------------------------------
      Incident
    ----------------------------------*/

    GIS_INCIDENT_PRESENT: [

        "INCIDENT",

        "INCIDENTS",

        "FIRE",

        "FIRES",

        "ALERT",

        "ALERTS"

    ]

});

    /*--------------------------------------------------
      ENTITY TYPES
    --------------------------------------------------*/

/*--------------------------------------------------
  ENTITY TYPES
--------------------------------------------------*/

GISConstants.ENTITY_TYPES = Object.freeze({

    /*----------------------------------
      Jurisdictions
    ----------------------------------*/

    CIRCLE:
        "circle",

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

    /*----------------------------------
      Geometry
    ----------------------------------*/

    GEOMETRY:
        "geometry",

    POLYGON:
        "polygon",

    POINT:
        "point",

    LINE:
        "line",

    /*----------------------------------
      Live Objects
    ----------------------------------*/

    STAFF:
        "staff",

    PATROL:
        "patrol",

    WILDLIFE:
        "wildlife",

    INCIDENT:
        "incident",

    VEHICLE:
        "vehicle",

    GRID:
        "grid",

    /*----------------------------------
      Search
    ----------------------------------*/

    LOCATION:
        "location",

    COORDINATE:
        "coordinate"

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
