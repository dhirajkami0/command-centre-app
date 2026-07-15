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
  Backward Compatibility
  (Current GIS Pipeline)
----------------------------------*/

GIS_STAFF_PRESENCE:
    "gisStaffPresent",

GIS_STAFF_PRESENCE_COUNT:
    "gisStaffCount",

GIS_STAFF_ON_DUTY:
    "gisStaffOnDuty",

GIS_CIRCLE:
    "gisCircle",

GIS_CURRENT_CIRCLE:
    "gisCurrentCircle",

GIS_CIRCLE_SUMMARY:
    "gisCircleSummary",

GIS_BEAT_SUMMARY:
    "gisBeatSummary",

GIS_RANGE_SUMMARY:
    "gisRangeSummary",

GIS_DIVISION_SUMMARY:
    "gisDivisionSummary",

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
      Staff Presence
    ----------------------------------*/

    GIS_STAFF_PRESENT: [

        "WHO IS IN",
        "WHO IS INSIDE",
        "WHO IS WITHIN",

        "SHOW STAFF IN",
        "SHOW STAFF INSIDE",
        "SHOW STAFF WITHIN",

        "STAFF IN",
        "STAFF INSIDE",
        "STAFF WITHIN",

        "STAFF PRESENT",
        "PRESENT STAFF",
        "CURRENT STAFF",
        "LIVE STAFF",

        "STAFF CURRENTLY IN",
        "STAFF CURRENTLY INSIDE",
        "STAFF CURRENTLY WITHIN",

        "WHICH STAFF ARE IN",
        "WHICH STAFF ARE INSIDE",
        "WHICH STAFF ARE WITHIN"

    ],

    /*----------------------------------
      Staff Count
    ----------------------------------*/

    GIS_STAFF_COUNT: [

        "HOW MANY STAFF",

        "HOW MANY STAFF ARE IN",
        "HOW MANY STAFF ARE INSIDE",
        "HOW MANY STAFF ARE WITHIN",

        "NUMBER OF STAFF",
        "NUMBER OF STAFF IN",
        "NUMBER OF STAFF INSIDE",
        "NUMBER OF STAFF WITHIN",

        "TOTAL STAFF",
        "TOTAL STAFF IN",
        "TOTAL STAFF INSIDE",
        "TOTAL STAFF WITHIN",

        "STAFF COUNT",
        "STAFF COUNT IN",
        "STAFF COUNT INSIDE",
        "STAFF COUNT WITHIN",

        "LIVE STAFF COUNT",
        "CURRENT STAFF COUNT",
        "PRESENT STAFF COUNT"

    ],

    /*----------------------------------
      Generic Spatial
    ----------------------------------*/

    GIS_INSIDE: [

        "INSIDE",
        "WITHIN",
        "CONTAINS",
        "HAS",
        "INCLUDES"

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
