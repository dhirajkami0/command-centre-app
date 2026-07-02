(function (window) {

"use strict";

/*=========================================================
 NAMESPACE
=========================================================*/

const GG =
    window.GreenGuardAI =
    window.GreenGuardAI || {};

/*=========================================================
 PREVENT DOUBLE LOADING
=========================================================*/

if (

    GG.StaffConstants

) {

    console.warn(

        "[GreenGuardAI] StaffConstants already loaded."

    );

    return;

}

const StaffConstants = {};

/*=========================================================
 VERSION
=========================================================*/

StaffConstants.VERSION =

    "1.0.0";

/*=========================================================
 DOMAIN
=========================================================*/

StaffConstants.DOMAIN =

    "staff";

/*=========================================================
 INTENTS
=========================================================*/

StaffConstants.INTENTS = Object.freeze({

    /*----------------------------------
      Search
    ----------------------------------*/

    STAFF_SEARCH:
        "staffSearch",

    STAFF_DIRECTORY:
        "staffDirectory",

    STAFF_EXISTS:
        "staffExists",

    STAFF_BY_NAME:
        "staffByName",

    STAFF_BY_PHONE:
        "staffByPhone",

    STAFF_BY_ROLE:
        "staffByRole",

    STAFF_BY_DESIGNATION:
        "staffByDesignation",

    STAFF_BY_LEADER:
        "staffByLeader",

    STAFF_BY_TEAM:
        "staffByTeam",

    /*----------------------------------
      Profile
    ----------------------------------*/

    STAFF_PROFILE:
        "staffProfile",

    STAFF_CONTACT:
        "staffContact",

    STAFF_ROLE:
        "staffRole",

    STAFF_DESIGNATION:
        "staffDesignation",

    STAFF_TYPE:
        "staffType",

    STAFF_IDENTITY:
        "staffIdentity",

    /*----------------------------------
      Posting
    ----------------------------------*/

    STAFF_POSTING:
        "staffPosting",

    STAFF_BEAT:
        "staffBeat",

    STAFF_RANGE:
        "staffRange",

    STAFF_DIVISION:
        "staffDivision",

    STAFF_CIRCLE:
        "staffCircle",

    STAFF_COMPARTMENT:
        "staffCompartment",

    STAFF_AREA:
        "staffArea",

    /*----------------------------------
      Location
    ----------------------------------*/

    STAFF_LOCATION:
        "staffLocation",

    STAFF_GPS:
        "staffGPS",

    STAFF_COORDINATES:
        "staffCoordinates",

    STAFF_CURRENT_POSITION:
        "staffCurrentPosition",

    STAFF_MAP_LOCATION:
        "staffMapLocation",

    STAFF_LAST_LOCATION:
        "staffLastLocation",

    /*----------------------------------
      Duty
    ----------------------------------*/

    STAFF_DUTY:
        "staffDuty",

    STAFF_DUTY_STATUS:
        "staffDutyStatus",

    STAFF_DUTY_TYPE:
        "staffDutyType",

    STAFF_DUTY_ACTIVE:
        "staffDutyActive",

    STAFF_DUTY_HISTORY:
        "staffDutyHistory",

    STAFF_LAST_DUTY:
        "staffLastDuty",

    /*----------------------------------
      Status
    ----------------------------------*/

    STAFF_STATUS:
        "staffStatus",

    STAFF_ONLINE:
        "staffOnline",

    STAFF_OFFLINE:
        "staffOffline",

    STAFF_AVAILABLE:
        "staffAvailable",

    STAFF_UNAVAILABLE:
        "staffUnavailable",
     /*----------------------------------
      Movement
    ----------------------------------*/

    STAFF_MOVEMENT:
        "staffMovement",

    STAFF_SPEED:
        "staffSpeed",

    STAFF_HEADING:
        "staffHeading",

    STAFF_DIRECTION:
        "staffDirection",

    STAFF_TURNING:
        "staffTurning",

    STAFF_MOTION:
        "staffMotion",

    STAFF_MOVING:
        "staffMoving",

    /*----------------------------------
      GPS
    ----------------------------------*/

    STAFF_GPS_STATUS:
        "staffGPSStatus",

    STAFF_GPS_ACCURACY:
        "staffGPSAccuracy",

    STAFF_TRACKING:
        "staffTracking",

    STAFF_SOURCE:
        "staffSource",

    STAFF_SIGNAL:
        "staffSignal",

    STAFF_LAST_SEEN:
        "staffLastSeen",

    STAFF_UPDATED:
        "staffUpdated",

    STAFF_TIMESTAMP:
        "staffTimestamp",

    STAFF_TIME:
        "staffTime",

    /*----------------------------------
      Team
    ----------------------------------*/

    STAFF_LEADER:
        "staffLeader",

    STAFF_TEAM:
        "staffTeam",

    STAFF_TEAM_MEMBERS:
        "staffTeamMembers",

    STAFF_LEADER_INFO:
        "staffLeaderInfo",

    TEAM_LEADER:
        "teamLeader",

    TEAM_MEMBERS:
        "teamMembers",

    TEAM_SEARCH:
        "teamSearch",

    /*----------------------------------
      Session
    ----------------------------------*/

    STAFF_SESSION:
        "staffSession",

    STAFF_SESSION_STATUS:
        "staffSessionStatus",

    STAFF_TRACKING_SESSION:
        "staffTrackingSession",

    /*----------------------------------
      Hierarchy
    ----------------------------------*/

    STAFF_HIERARCHY:
        "staffHierarchy",

    STAFF_REPORTING:
        "staffReporting",

    STAFF_ADMINISTRATIVE_UNIT:
        "staffAdministrativeUnit",

    /*----------------------------------
      Analytics
    ----------------------------------*/

    STAFF_STRENGTH:
        "staffStrength",

    ACTIVE_STAFF_COUNT:
        "activeStaffCount",

    ACTIVE_STAFF_LIST:
        "activeStaffList",

    INACTIVE_STAFF_LIST:
        "inactiveStaffList",

    STAFF_BY_ROLE:
        "staffByRole",

    STAFF_BY_DESIGNATION:
        "staffByDesignation",

    STAFF_BY_BEAT:
        "staffByBeat",

    STAFF_BY_RANGE:
        "staffByRange",

    STAFF_BY_DIVISION:
        "staffByDivision",

    STAFF_BY_CIRCLE:
        "staffByCircle",

    STAFF_BY_COMPARTMENT:
        "staffByCompartment",

    STAFF_BY_DUTY:
        "staffByDuty",

    STAFF_BY_LEADER:
        "staffByLeader",

    MOVING_STAFF:
        "movingStaff",

    STATIONARY_STAFF:
        "stationaryStaff",

    FAST_MOVING_STAFF:
        "fastMovingStaff",

    SLOW_MOVING_STAFF:
        "slowMovingStaff",

    STAFF_NEAR_LOCATION:
        "staffNearLocation",

    TEAM_LEADER_LIST:
        "teamLeaderList",

    DUTY_SUMMARY:
        "dutySummary",

    STAFF_STATISTICS:
        "staffStatistics",

    /*----------------------------------
      Administration
    ----------------------------------*/

    STAFF_DOCUMENT:
        "staffDocument",

    STAFF_DEVICE:
        "staffDevice",

  

    STAFF_RECORD:
        "staffRecord",

    /*----------------------------------
      Control Room
    ----------------------------------*/

    WHO_IS_ON_DUTY:
        "whoIsOnDuty",

    WHO_IS_PATROLLING:
        "whoIsPatrolling",

    WHO_IS_NEAREST:
        "whoIsNearest",

    WHO_IS_OFFLINE:
        "whoIsOffline",

    WHO_HAS_OLD_GPS:
        "whoHasOldGPS",

    WHO_HAS_POOR_ACCURACY:
        "whoHasPoorAccuracy",

    WHO_STOPPED_MOVING:
        "whoStoppedMoving",

    WHO_STARTED_DUTY:
        "whoStartedDuty",

    WHO_ENDED_DUTY:
        "whoEndedDuty",

    /*----------------------------------
      Map
    ----------------------------------*/

    STAFF_MAP:
        "staffMap",

    STAFF_MAP_MARKER:
        "staffMapMarker",

    STAFF_LIVE_MAP:
        "staffLiveMap",

    STAFF_LOCATION_HISTORY:
        "staffLocationHistory",

    /*----------------------------------
      Alerts
    ----------------------------------*/

    STAFF_NO_GPS:
        "staffNoGPS",

    STAFF_INACTIVE_GPS:
        "staffInactiveGPS",

    STAFF_LOW_ACCURACY_GPS:
        "staffLowAccuracyGPS",

    STAFF_NO_MOVEMENT:
        "staffNoMovement",

    STAFF_NO_DUTY:
        "staffNoDuty",

    /*----------------------------------
      Communication
    ----------------------------------*/

    STAFF_CALL:
        "staffCall",

    STAFF_MESSAGE:
        "staffMessage",

    STAFF_SHARE_LOCATION:
        "staffShareLocation",

    /*----------------------------------
      Summary
    ----------------------------------*/

    STAFF_SUMMARY:
        "staffSummary",

    STAFF_OPERATIONAL_STATUS:
        "staffOperationalStatus"

});

/*=========================================================
 APPLICATION ROLES
=========================================================*/

StaffConstants.ROLES = Object.freeze({

    ADMIN:
        "ADMIN",

    DFO:
        "DFO",

    ADFO:
        "ADFO",

    TEAM_LEADER:
        "TEAM LEADER",

    STAFF:
        "STAFF"

});

/*=========================================================
 DESIGNATIONS
=========================================================*/

/*=========================================================
 DESIGNATIONS
=========================================================*/

StaffConstants.DESIGNATIONS = Object.freeze({

    /*----------------------------------
      Forest Field Staff
    ----------------------------------*/

    BS:
        "BS",

    FG:
        "FG",

    DL:
        "DL",

    PDL:
        "PDL",

    DR:
        "DR",

    FR:
        "FR",

    DR_FR:
        "DR/FR",

    AS:
        "AS",

    FV:
        "FV",

    BANASAHAYAK:
        "BANASAHAYAK",

    BANASAHAYK:
        "BANASAHAYK",

    BANASAYAHAK:
        "BANASAYAHAK",

    WATCHER:
        "WATCHER",

    DRIVER:
        "DRIVER",

    ORDELY:
        "ORDELY",

    /*----------------------------------
      Officers
    ----------------------------------*/

    DFO:
        "DFO",

    ADFO:
        "ADFO",

    CCF:
        "CCF",

    FD:
        "FD",

    IFS:
        "IFS",

    WBFS:
        "WBFS"

});
/*=========================================================
 DUTY TYPES
=========================================================*/

StaffConstants.DUTY_TYPES = Object.freeze({

    /*----------------------------------
      Patrol Duties
    ----------------------------------*/

    FOOT_PATROLLING:
        "Foot Patrolling",

    VEHICLE_PATROLLING:
        "Vehicle Patrolling",

    NIGHT_PATROLLING:
        "Night Patrolling",

    BOAT_PATROLLING:
        "Boat Patrolling",

    ELEPHANT_PATROLLING:
        "Elephant Patrolling",

    /*----------------------------------
      Wildlife Duties
    ----------------------------------*/

    DEPREDATION_DUTY:
        "Depredation Duty",

    RESCUE_DUTY:
        "Rescue Duty",

    CONFLICT_DUTY:
        "Conflict Duty",

    ANTI_POACHING:
        "Anti Poaching",

    SURVEILLANCE:
        "Surveillance",

    /*----------------------------------
      Protection Duties
    ----------------------------------*/

    CAMP_DUTY:
        "Camp Duty",

    BEAT_DUTY:
        "Beat Duty",

    RANGE_DUTY:
        "Range Duty",

    CHECK_POST_DUTY:
        "Check Post Duty",

    /*----------------------------------
      Administrative Duties
    ----------------------------------*/

    OFFICE_DUTY:
        "Office Duty",

    TRAINING:
        "Training",

    INVESTIGATION:
        "Investigation",

    MEETING:
        "Meeting",

    COURT_DUTY:
        "Court Duty",

    LEAVE:
        "Leave",

    /*----------------------------------
      Other
    ----------------------------------*/

    OTHER:
        "Other"

});
/*=========================================================
 FIRESTORE COLLECTIONS
=========================================================*/

StaffConstants.COLLECTIONS = Object.freeze({

    /*----------------------------------
      Staff Master
    ----------------------------------*/

    STAFF_PROFILES:
        "staff_profiles",

    /*----------------------------------
      Live Staff
    ----------------------------------*/

    LIVE_STAFF:
        "live_staff",

    /*----------------------------------
      Patrol
    ----------------------------------*/

    PATROL_TRACKS:
        "patrol_tracks",

    /*----------------------------------
      AI Cache (Future)
    ----------------------------------*/

    STAFF_CACHE:
        "staff_cache",

    STAFF_HISTORY:
        "staff_history"

});
/*=========================================================
 FIRESTORE FIELDS
=========================================================*/

StaffConstants.FIELDS = Object.freeze({

    /*----------------------------------
      Common Document
    ----------------------------------*/

    ID:
        "id",

    TYPE:
        "type",

    SOURCE:
        "source",

    CREATED_AT:
        "createdAt",

    UPDATED_AT:
        "updatedAt",

    

   

    /*----------------------------------
      Staff Identity
    ----------------------------------*/

    NAME:
        "name",

    RAW_NAME:
        "rawName",

    CLEAN_NAME:
        "cleanName",

    PHONE:
        "phone",

    EMAIL:
        "email",

    ROLE:
        "role",

    DESIGNATION:
        "designation",

  

    /*----------------------------------
      Administrative Hierarchy
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

    COMPARTMENTS:
        "compartments",

    AREA:
        "area",

    /*----------------------------------
      Team
    ----------------------------------*/

    LEADER:
        "leader",

    TEAM:
        "team",

    TEAM_MEMBERS:
        "teamMembers",

    /*----------------------------------
      Duty
    ----------------------------------*/

    DUTY_ACTIVE:
        "dutyActive",

    DUTY_TYPE:
        "dutyType",

    STATUS:
        "status",

    LAST_DUTY_END:
        "lastDutyEnd",

    /*----------------------------------
      Tracking Session
    ----------------------------------*/

    SESSION_ID:
        "sessionId",

    MONTH_KEY:
        "monthKey",

    /*----------------------------------
      GPS
    ----------------------------------*/

    LOCATION:
        "location",

    LAT:
        "lat",

    LON:
        "lon",

    ACCURACY:
        "accuracy",

    SPEED:
        "speed",

    HEADING:
        "heading",

    TURN_RATE:
        "turnRate",

    TURN_ANGLE:
        "turnAngle",

    LAST_SEEN:
        "lastSeen",

    /*----------------------------------
      Patrol Tracks
    ----------------------------------*/

    START_LAT:
        "startLat",

    START_LON:
        "startLon",

    START_ACCURACY:
        "startAccuracy",

    STARTED_AT:
        "startedAt",

    ENDED_AT:
        "endedAt",

    DISTANCE_KM:
        "distanceKm",

    POINT_COUNT:
        "pointCount",

   

    SIMPLIFIED_TRACK:
        "simplifiedTrack",

   
    /*----------------------------------
      Statistics
    ----------------------------------*/

    ACTIVE_COUNT:
        "activeCount",

    INACTIVE_COUNT:
        "inactiveCount",

    STAFF_COUNT:
        "staffCount",

    /*----------------------------------
      Device
    ----------------------------------*/

    DEVICE:
        "device",

   
   

  

   
    /*----------------------------------
      Future
    ----------------------------------*/

   

    NOTES:
        "notes",

    DESCRIPTION:
        "description",

   

});
/*=========================================================
 ENTITY TYPES
=========================================================*/

StaffConstants.ENTITY_TYPES = Object.freeze({

    /*----------------------------------
      Staff Identity
    ----------------------------------*/

    STAFF:
        "staff",

    NAME:
        "name",

    CLEAN_NAME:
        "cleanName",

    PHONE:
        "phone",

    EMAIL:
        "email",

    /*----------------------------------
      Role & Designation
    ----------------------------------*/

    ROLE:
        "role",

    DESIGNATION:
        "designation",

    TYPE:
        "type",

    /*----------------------------------
      Administrative Hierarchy
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

    AREA:
        "area",

    /*----------------------------------
      Duty
    ----------------------------------*/

    DUTY:
        "duty",

    DUTY_TYPE:
        "dutyType",

    DUTY_STATUS:
        "dutyStatus",

    DUTY_ACTIVE:
        "dutyActive",

    SESSION:
        "session",

    /*----------------------------------
      Team
    ----------------------------------*/

    LEADER:
        "leader",

    TEAM:
        "team",

    TEAM_MEMBER:
        "teamMember",

    /*----------------------------------
      GPS
    ----------------------------------*/

    LOCATION:
        "location",

    LATITUDE:
        "lat",

    LONGITUDE:
        "lon",

    GPS:
        "gps",

    SPEED:
        "speed",

    HEADING:
        "heading",

    ACCURACY:
        "accuracy",

    /*----------------------------------
      Status
    ----------------------------------*/

    STATUS:
        "status",

  

    LAST_SEEN:
        "lastSeen",

 

TIMESTAMP:
    "timestamp",



LAST_DUTY_END:
    "lastDutyEnd",
     /*----------------------------------
      Firestore Documents
    ----------------------------------*/

    DOCUMENT_ID:
        "documentId",

   

SESSION_ID:
    "sessionId",

    /*----------------------------------
      Device
    ----------------------------------*/

    DEVICE:
        "device",

    SOURCE:
        "source",

    RECORD:
        "record",

    /*----------------------------------
      GPS
    ----------------------------------*/

    TRACKING:
        "tracking",

    SIGNAL:
        "signal",

    COORDINATES:
        "coordinates",

    CURRENT_POSITION:
        "currentPosition",

    MAP_LOCATION:
        "mapLocation",

    LAST_LOCATION:
        "lastLocation",

    LOCATION_HISTORY:
        "locationHistory",

    TURN_RATE:
        "turnRate",

    TURN_ANGLE:
        "turnAngle",

    /*----------------------------------
      Time
    ----------------------------------*/

    TIME:
        "time",

    TIMESTAMP:
        "timestamp",

  
    CREATED_AT:
        "createdAt",

UPDATED_AT:
    "updatedAt",

    /*----------------------------------
      Analytics
    ----------------------------------*/

    STAFF_COUNT:
        "staffCount",

    ACTIVE_COUNT:
        "activeCount",

    INACTIVE_COUNT:
        "inactiveCount",

    DISTANCE:
        "distance",

    /*----------------------------------
      Control Room
    ----------------------------------*/

    NEAREST:
        "nearest",

    OLD_GPS:
        "oldGps",

    LOW_ACCURACY:
        "lowAccuracy",

    NO_MOVEMENT:
        "noMovement",

    NO_DUTY:
        "noDuty",

    /*----------------------------------
      Communication
    ----------------------------------*/

    MESSAGE:
        "message",

    CALL:
        "call",

    SHARE_LOCATION:
        "shareLocation"

});

 /*=========================================================
 FIELD MAPS
=========================================================*/

StaffConstants.FIELD_MAPS = Object.freeze({

    /*-----------------------------------------------------
      Identity
    -----------------------------------------------------*/

    IDENTITY: Object.freeze([

        {
            target: "cleanName",
            source: StaffConstants.FIELDS.CLEAN_NAME,
            type: "string"
        },

        {
            target: "name",
            source: StaffConstants.FIELDS.NAME,
            type: "string"
        },

        {
            target: "rawName",
            source: StaffConstants.FIELDS.RAW_NAME,
            type: "string"
        },

        {
            target: "phone",
            source: StaffConstants.FIELDS.PHONE,
            type: "string"
        },

        {
            target: "email",
            source: StaffConstants.FIELDS.EMAIL,
            type: "string"
        },

        {
            target: "role",
            source: StaffConstants.FIELDS.ROLE,
            type: "string"
        },

        {
            target: "designation",
            source: StaffConstants.FIELDS.DESIGNATION,
            type: "string"
        },

        {
            target: "type",
            source: StaffConstants.FIELDS.TYPE,
            type: "string"
        }

    ]),

    /*-----------------------------------------------------
      Posting
    -----------------------------------------------------*/

    POSTING: Object.freeze([

        {
            target: "circle",
            source: StaffConstants.FIELDS.CIRCLE,
            type: "string"
        },

        {
            target: "division",
            source: StaffConstants.FIELDS.DIVISION,
            type: "string"
        },

        {
            target: "range",
            source: StaffConstants.FIELDS.RANGE,
            type: "string"
        },

        {
            target: "beat",
            source: StaffConstants.FIELDS.BEAT,
            type: "string"
        },


    ]),/*-----------------------------------------------------
  Assignment
-----------------------------------------------------*/

ASSIGNMENT: Object.freeze([

    {
        target: "assignedCompartment",
        source: StaffConstants.FIELDS.COMPARTMENT,
        type: "string"
    },

    {
        target: "dutyType",
        source: StaffConstants.FIELDS.DUTY_TYPE,
        type: "string"
    },

    {
        target: "dutyActive",
        source: StaffConstants.FIELDS.DUTY_ACTIVE,
        type: "boolean"
    },

    {
        target: "status",
        source: StaffConstants.FIELDS.STATUS,
        type: "string"
    },

    {
        target: "leader",
        source: StaffConstants.FIELDS.LEADER,
        type: "string"
    },

    {
        target: "team",
        source: StaffConstants.FIELDS.TEAM,
        type: "string"
    }

])

});
 /*=========================================================
 KEYWORDS
=========================================================*/

StaffConstants.KEYWORDS = Object.freeze({

    /*----------------------------------
      Search
    ----------------------------------*/

    STAFF_SEARCH: [

        "SEARCH",
        "FIND",
        "LOOKUP",
        "LOCATE",
        "GET",
        "SHOW"

    ],

    STAFF_DIRECTORY: [

        "DIRECTORY",
        "LIST",
        "ALL STAFF",
        "STAFF LIST"

    ],

    /*----------------------------------
      Profile
    ----------------------------------*/

    STAFF_PROFILE: [

        "PROFILE",
        "DETAILS",
        "INFORMATION",
        "INFO",
        "WHO IS",
        "ABOUT"

    ],

    STAFF_CONTACT: [

        "PHONE",
        "MOBILE",
        "CONTACT",
        "NUMBER",
        "CALL"

    ],

    STAFF_ROLE: [

        "ROLE",
        "PERMISSION"

    ],

    STAFF_DESIGNATION: [

        "DESIGNATION",
        "POST",
        "RANK"

    ],

    /*----------------------------------
      Posting
    ----------------------------------*/

    STAFF_POSTING: [

        "POSTING",
        "POSTED",
        "WORKING AT"

    ],

    STAFF_BEAT: [

        "BEAT"

    ],

    STAFF_RANGE: [

        "RANGE"

    ],

    STAFF_DIVISION: [

        "DIVISION"

    ],

    STAFF_CIRCLE: [

        "CIRCLE"

    ],

    STAFF_COMPARTMENT: [

        "COMPARTMENT"

    ],

    /*----------------------------------
      Location
    ----------------------------------*/

    STAFF_LOCATION: [

        "WHERE",
        "LOCATION",
        "GPS",
        "POSITION",
        "LOCATE",
        "CURRENT LOCATION",
        "CURRENT POSITION"

    ],

    STAFF_MAP: [

        "MAP",
        "SHOW MAP"

    ],

    /*----------------------------------
      Duty
    ----------------------------------*/

    STAFF_DUTY: [

        "DUTY",
        "PATROLLING",
        "PATROL"

    ],

    STAFF_DUTY_STATUS: [

        "ON DUTY",
        "OFF DUTY"

    ],

    STAFF_DUTY_TYPE: [

        "DUTY TYPE"

    ],

    /*----------------------------------
      Status
    ----------------------------------*/

    STAFF_STATUS: [

        "STATUS",
        "ACTIVE",
        "INACTIVE"

    ],

    /*----------------------------------
      Team
    ----------------------------------*/

    STAFF_TEAM: [

        "TEAM"

    ],

    STAFF_LEADER: [

        "LEADER",
        "TEAM LEADER"

    ],

    /*----------------------------------
      GPS
    ----------------------------------*/

    STAFF_GPS: [

        "GPS",
        "COORDINATES",
        "LATITUDE",
        "LONGITUDE"

    ],

    STAFF_SPEED: [

        "SPEED"

    ],

    STAFF_HEADING: [

        "HEADING",
        "DIRECTION"

    ],

    STAFF_ACCURACY: [

        "ACCURACY"

    ],

    /*----------------------------------
      Analytics
    ----------------------------------*/

    STAFF_STRENGTH: [

        "HOW MANY",
        "COUNT",
        "TOTAL",
        "STRENGTH"

    ],

    STAFF_STATISTICS: [

        "STATISTICS",
        "SUMMARY",
        "REPORT"

    ]

});
 /*=========================================================
 SYNONYMS
=========================================================*/

StaffConstants.SYNONYMS = Object.freeze({

    /*----------------------------------
      Search
    ----------------------------------*/

    SEARCH: [

        "SEARCH",
        "FIND",
        "LOOKUP",
        "LOCATE",
        "GET",
        "SHOW",
        "DISPLAY"

    ],

    /*----------------------------------
      Profile
    ----------------------------------*/

    PROFILE: [

        "PROFILE",
        "DETAILS",
        "DETAIL",
        "INFORMATION",
        "INFO",
        "ABOUT",
        "WHO IS"

    ],

    /*----------------------------------
      Contact
    ----------------------------------*/

    CONTACT: [

        "PHONE",
        "MOBILE",
        "NUMBER",
        "CONTACT",
        "CALL",
        "TELEPHONE"

    ],

    /*----------------------------------
      Role
    ----------------------------------*/

    ROLE: [

        "ROLE",
        "PERMISSION",
        "ACCESS"

    ],

    /*----------------------------------
      Designation
    ----------------------------------*/

    DESIGNATION: [

        "DESIGNATION",
        "POST",
        "RANK"

    ],

    /*----------------------------------
      Posting
    ----------------------------------*/

    POSTING: [

        "POSTING",
        "POSTED",
        "WORKING",
        "WORKING AT"

    ],

    /*----------------------------------
      Location
    ----------------------------------*/

    LOCATION: [

        "WHERE",
        "LOCATION",
        "LOCATE",
        "GPS",
        "POSITION",
        "CURRENT LOCATION",
        "CURRENT POSITION",
        "CURRENT PLACE"

    ],

    /*----------------------------------
      Map
    ----------------------------------*/

    MAP: [

        "MAP",
        "SHOW MAP",
        "OPEN MAP"

    ],

    /*----------------------------------
      Duty
    ----------------------------------*/

    DUTY: [

        "DUTY",
        "PATROL",
        "PATROLLING",
        "WORK",
        "ASSIGNMENT"

    ],

    /*----------------------------------
      Status
    ----------------------------------*/

    STATUS: [

        "STATUS",
        "ACTIVE",
        "INACTIVE",
        "ONLINE",
        "OFFLINE"

    ],

    /*----------------------------------
      Team
    ----------------------------------*/

    TEAM: [

        "TEAM",
        "GROUP",
        "SQUAD"

    ],

    LEADER: [

        "LEADER",
        "TEAM LEADER",
        "HEAD"

    ],

    /*----------------------------------
      GPS
    ----------------------------------*/

    GPS: [

        "GPS",
        "COORDINATES",
        "LATITUDE",
        "LONGITUDE"

    ],

    SPEED: [

        "SPEED",
        "VELOCITY"

    ],

    HEADING: [

        "HEADING",
        "DIRECTION",
        "BEARING"

    ],

    ACCURACY: [

        "ACCURACY",
        "PRECISION"

    ],

    /*----------------------------------
      Analytics
    ----------------------------------*/

    STRENGTH: [

        "COUNT",
        "TOTAL",
        "HOW MANY",
        "NUMBER OF",
        "STRENGTH"

    ],

    SUMMARY: [

        "SUMMARY",
        "STATISTICS",
        "REPORT",
        "OVERVIEW"

    ]

});
 /*=========================================================
 CONFIDENCE
=========================================================*/

StaffConstants.CONFIDENCE = Object.freeze({

    /*----------------------------------
      Perfect Match
    ----------------------------------*/

    EXACT_INTENT:

        1.00,

    EXACT_ENTITY:

        1.00,

    /*----------------------------------
      Keyword Match
    ----------------------------------*/

    PRIMARY_KEYWORD:

        0.45,

    SECONDARY_KEYWORD:

        0.20,

    EXTRA_KEYWORD:

        0.05,

    /*----------------------------------
      Entity Match
    ----------------------------------*/

    STAFF_NAME:

        0.35,

    PHONE:

        0.35,

    ROLE:

        0.20,

    DESIGNATION:

        0.20,

    TEAM:

        0.20,

    LEADER:

        0.20,

    BEAT:

        0.20,

    RANGE:

        0.20,

    DIVISION:

        0.20,

    CIRCLE:

        0.20,

    COMPARTMENT:

        0.20,

    /*----------------------------------
      Bonuses
    ----------------------------------*/

    MULTIPLE_ENTITIES:

        0.10,

    MULTIPLE_KEYWORDS:

        0.10,

    /*----------------------------------
      Penalties
    ----------------------------------*/

    UNKNOWN_ENTITY:

        -0.20,

    AMBIGUOUS:

        -0.15,

    UNKNOWN_KEYWORD:

        -0.10,

    /*----------------------------------
      Final Thresholds
    ----------------------------------*/

    VERY_HIGH:

        0.95,

    HIGH:

        0.90,

    GOOD:

        0.80,

    MEDIUM:

        0.65,

    LOW:

        0.40,

    AI_FALLBACK:

        0.75

});
 /*=========================================================
 SEARCH PRIORITY
=========================================================*/

StaffConstants.SEARCH_PRIORITY = Object.freeze([

    /*----------------------------------
      Highest Priority
    ----------------------------------*/

    StaffConstants.FIELDS.CLEAN_NAME,

    StaffConstants.FIELDS.NAME,

    StaffConstants.FIELDS.PHONE,

    /*----------------------------------
      Staff Identity
    ----------------------------------*/

    StaffConstants.FIELDS.ROLE,

    StaffConstants.FIELDS.DESIGNATION,

    /*----------------------------------
      Administrative Hierarchy
    ----------------------------------*/

    StaffConstants.FIELDS.BEAT,

    StaffConstants.FIELDS.RANGE,

    StaffConstants.FIELDS.DIVISION,

    StaffConstants.FIELDS.CIRCLE,

    StaffConstants.FIELDS.COMPARTMENT,

    /*----------------------------------
      Team
    ----------------------------------*/

    StaffConstants.FIELDS.LEADER,

    StaffConstants.FIELDS.TEAM,

    /*----------------------------------
      Duty
    ----------------------------------*/

    StaffConstants.FIELDS.DUTY_TYPE,

    StaffConstants.FIELDS.STATUS,

    /*----------------------------------
      GPS
    ----------------------------------*/

    StaffConstants.FIELDS.LOCATION,

    StaffConstants.FIELDS.LAT,

    StaffConstants.FIELDS.LON

]);
/*=========================================================
 STAFF STATUS
=========================================================*/

StaffConstants.STATUS = Object.freeze({

    /*----------------------------------
      Live Status
    ----------------------------------*/

    ACTIVE:
        "ACTIVE",

    ENDED:
        "ENDED",

    ONLINE:
        "ONLINE",

    OFFLINE:
        "OFFLINE",

    AVAILABLE:
        "AVAILABLE",

    UNAVAILABLE:
        "UNAVAILABLE",

    /*----------------------------------
      Duty Status
    ----------------------------------*/

    ON_DUTY:
        "ON_DUTY",

    OFF_DUTY:
        "OFF_DUTY",

    DUTY_ACTIVE:
        "DUTY_ACTIVE",

    DUTY_ENDED:
        "DUTY_ENDED",

    /*----------------------------------
      Tracking
    ----------------------------------*/

    TRACKING:
        "TRACKING",

    NOT_TRACKING:
        "NOT_TRACKING",

    GPS_ACTIVE:
        "GPS_ACTIVE",

    GPS_INACTIVE:
        "GPS_INACTIVE",

    /*----------------------------------
      Operational
    ----------------------------------*/

    MOVING:
        "MOVING",

    STATIONARY:
        "STATIONARY",

    PATROLLING:
        "PATROLLING",

    IDLE:
        "IDLE",

    /*----------------------------------
      System
    ----------------------------------*/

    UNKNOWN:
        "UNKNOWN"

});

/*=========================================================
 REGISTER
=========================================================*/

GG.StaffConstants =

    StaffConstants;

console.log(

    "%cStaff Constants Loaded",

    "color:#008000;font-weight:bold;"

);

})(window);
