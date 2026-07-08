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

    /*=========================================================
      SEARCH
    =========================================================*/

    STAFF_SEARCH: "staffSearch",
    STAFF_DIRECTORY: "staffDirectory",
    STAFF_EXISTS: "staffExists",
    STAFF_BY_NAME: "staffByName",
    STAFF_BY_PHONE: "staffByPhone",
    STAFF_BY_ROLE: "staffByRole",
    STAFF_BY_DESIGNATION: "staffByDesignation",
    STAFF_BY_LEADER: "staffByLeader",
    STAFF_BY_TEAM: "staffByTeam",

    /*=========================================================
      PROFILE
    =========================================================*/

    STAFF_PROFILE: "staffProfile",
    STAFF_CONTACT: "staffContact",
    STAFF_ROLE: "staffRole",
    STAFF_DESIGNATION: "staffDesignation",

    /*=========================================================
      POSTING
    =========================================================*/

    STAFF_POSTING: "staffPosting",
    STAFF_CIRCLE: "staffCircle",
    STAFF_DIVISION: "staffDivision",
    STAFF_RANGE: "staffRange",
    STAFF_BEAT: "staffBeat",

    /*=========================================================
      LOCATION
    =========================================================*/

    STAFF_LOCATION: "staffLocation",
    STAFF_GPS: "staffGPS",

    /*=========================================================
      DUTY
    =========================================================*/

    STAFF_DUTY: "staffDuty",
    STAFF_DUTY_STATUS: "staffDutyStatus",
    STAFF_DUTY_TYPE: "staffDutyType",
    STAFF_DUTY_STARTED: "staffDutyStarted",
    STAFF_DUTY_ENDED: "staffDutyEnded",
    STAFF_DUTY_ACTIVE: "staffDutyActive",
    STAFF_LAST_DUTY: "staffLastDuty",
    STAFF_ASSIGNMENT: "staffAssignment",

    /*=========================================================
      TEAM
    =========================================================*/

    STAFF_TEAM: "staffTeam",
    STAFF_LEADER: "staffLeader",

    /*=========================================================
      GPS
    =========================================================*/

    STAFF_SPEED: "staffSpeed",
    STAFF_HEADING: "staffHeading",
    STAFF_ACCURACY: "staffAccuracy",

    /*=========================================================
      PATROL ANALYTICS
    =========================================================*/

    STAFF_ANALYTICS: "staffAnalytics",
    STAFF_DISTANCE: "staffDistance",
    STAFF_PATROL_POINTS: "staffPatrolPoints",
    STAFF_PATROL_START: "staffPatrolStart",
    STAFF_PATROL_END: "staffPatrolEnd",
    STAFF_PATROL_DURATION: "staffPatrolDuration",

    /*=========================================================
      SUMMARY
    =========================================================*/

    STAFF_SUMMARY: "staffSummary",
    STAFF_JURISDICTION_SUMMARY: "staffJurisdictionSummary",
    STAFF_DESIGNATION_SUMMARY: "staffDesignationSummary",

    /*=========================================================
      DIRECTORIES
    =========================================================*/

    STAFF_CIRCLE_DIRECTORY: "staffCircleDirectory",
    STAFF_DIVISION_DIRECTORY: "staffDivisionDirectory",
    STAFF_RANGE_DIRECTORY: "staffRangeDirectory",
    STAFF_BEAT_DIRECTORY: "staffBeatDirectory",
    STAFF_DESIGNATION_DIRECTORY: "staffDesignationDirectory",

    /*=========================================================
      LIVE STATUS
    =========================================================*/

    STAFF_ACTIVE_COUNT: "staffActiveCount",
    STAFF_ACTIVE_LIST: "staffActiveList",
    STAFF_INACTIVE_LIST: "staffInactiveList",

    /*=========================================================
      DUTY SUMMARY
    =========================================================*/

    STAFF_DUTY_SUMMARY: "staffDutySummary",
    STAFF_TEAM_LEADER_LIST: "staffTeamLeaderList",

    /*=========================================================
      MOVEMENT
    =========================================================*/

    STAFF_MOVING: "staffMoving",
    STAFF_STATIONARY: "staffStationary",

    /*=========================================================
      CONTROL ROOM
    =========================================================*/

    WHO_IS_ON_DUTY: "whoIsOnDuty",
    WHO_IS_PATROLLING: "whoIsPatrolling"
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

NAME: "name",

RAW_NAME: "rawName",

CLEAN_NAME: "cleanName",

PHONE: "phone",

EMAIL: "email",

ROLE: "role",

DESIGNATION: "designation",
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

STAFF_TYPE:
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

PATROL_ANALYTICS: "patrolAnalytics",

DISTANCE: "distance",

POINT_COUNT: "pointCount",

PATROL_START: "patrolStart",

PATROL_END: "patrolEnd",

PATROL_DURATION: "patrolDuration",

DUTY_START: "dutyStart",

DUTY_END: "dutyEnd",

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
        target: "lastDutyEnd",
        source: StaffConstants.FIELDS.LAST_DUTY_END,
        type: "raw"
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

]),
 /*-----------------------------------------------------
  Location
-----------------------------------------------------*/

LOCATION: Object.freeze([

    {
        target: "location",
        source: StaffConstants.FIELDS.LOCATION,
        type: "string"
    },

    {
        target: "lat",
        source: StaffConstants.FIELDS.LAT,
        type: "number"
    },

    {
        target: "lon",
        source: StaffConstants.FIELDS.LON,
        type: "number"
    }

]),

/*-----------------------------------------------------
  GPS
-----------------------------------------------------*/

GPS: Object.freeze([

    {
        target: "accuracy",
        source: StaffConstants.FIELDS.ACCURACY,
        type: "number"
    },

    {
        target: "speed",
        source: StaffConstants.FIELDS.SPEED,
        type: "number"
    },

    {
        target: "heading",
        source: StaffConstants.FIELDS.HEADING,
        type: "number"
    },

    {
        target: "turnRate",
        source: StaffConstants.FIELDS.TURN_RATE,
        type: "number"
    },

    {
        target: "turnAngle",
        source: StaffConstants.FIELDS.TURN_ANGLE,
        type: "number"
    },

    {
        target: "lastSeen",
        source: StaffConstants.FIELDS.LAST_SEEN,
        type: "raw"
    },

    {
        target: "updatedAt",
        source: StaffConstants.FIELDS.UPDATED_AT,
        type: "raw"
    }

]),
 /*-----------------------------------------------------
  Team
-----------------------------------------------------*/

TEAM: Object.freeze([

    {
        target: "leader",
        source: StaffConstants.FIELDS.LEADER,
        type: "string"
    },

    {
        target: "team",
        source: StaffConstants.FIELDS.TEAM,
        type: "string"
    },

    {
        target: "teamMembers",
        source: StaffConstants.FIELDS.TEAM_MEMBERS,
        type: "array"
    }

]),
 /*-----------------------------------------------------
 Tracking
-----------------------------------------------------*/

TRACKING: Object.freeze([

    {

        target: "id",

        source: StaffConstants.FIELDS.ID,

        type: "string"

    },

    {

        target: "sessionId",

        source: StaffConstants.FIELDS.SESSION_ID,

        type: "string"

    },

    {

        target: "source",

        source: StaffConstants.FIELDS.SOURCE,

        type: "string"

    }

]),

 /*-----------------------------------------------------
 Analytics
-----------------------------------------------------*/

ANALYTICS: Object.freeze([

    {

        target: "distanceKm",

        source: StaffConstants.FIELDS.DISTANCE_KM,

        type: "number"

    },

    {

        target: "pointCount",

        source: StaffConstants.FIELDS.POINT_COUNT,

        type: "number"

    },

    {

        target: "startedAt",

        source: StaffConstants.FIELDS.STARTED_AT,

        type: "number"

    },

    {

        target: "endedAt",

        source: StaffConstants.FIELDS.ENDED_AT,

        type: "number"

    },

    {

        target: "monthKey",

        source: StaffConstants.FIELDS.MONTH_KEY,

        type: "string"

    },

    {

        target: "compartments",

        source: StaffConstants.FIELDS.COMPARTMENTS,

        type: "array"

    },

    {

        target: "simplifiedTrack",

        source: StaffConstants.FIELDS.SIMPLIFIED_TRACK,

        type: "array"

    },

    {

        target: "startLat",

        source: StaffConstants.FIELDS.START_LAT,

        type: "number"

    },

    {

        target: "startLon",

        source: StaffConstants.FIELDS.START_LON,

        type: "number"

    },

    {

        target: "startAccuracy",

        source: StaffConstants.FIELDS.START_ACCURACY,

        type: "number"

    },

    {

        target: "createdAt",

        source: StaffConstants.FIELDS.CREATED_AT,

        type: "raw"

    }

]),

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
        "SEARCH STAFF",
        "FIND",
        "FIND STAFF",
        "LOOKUP",
        "LOOK UP",
        "LOCATE",
        "GET",
        "SHOW",
        "SEARCH FOR",
        "LOOK FOR",
        "FIND PERSON",
        "FIND OFFICER",
        "SEARCH OFFICER",
        "WHO HAS",
        "WHO IS",
        "SHOW STAFF",
        "SHOW OFFICER",
        "LIST STAFF",
        "STAFF SEARCH",
        "STAFF LOOKUP"
    ],

    /*----------------------------------
      Directory
    ----------------------------------*/

    STAFF_DIRECTORY: [
        "DIRECTORY",
        "STAFF DIRECTORY",
        "EMPLOYEE DIRECTORY",
        "OFFICER DIRECTORY",
        "LIST",
        "LIST STAFF",
        "LIST OFFICERS",
        "SHOW STAFF",
        "SHOW ALL STAFF",
        "SHOW OFFICERS",
        "SHOW ALL OFFICERS",
        "ALL STAFF",
        "ALL OFFICERS",
        "EVERY STAFF",
        "EVERY OFFICER",
        "STAFF LIST",
        "OFFICER LIST",
        "PERSONNEL LIST",
        "WHO ARE THE STAFF",
        "WHO ARE THE OFFICERS",
        "AVAILABLE STAFF",
        "AVAILABLE OFFICERS"
    ],

    /*----------------------------------
      Staff Profile
    ----------------------------------*/

    STAFF_PROFILE: [
        "PROFILE",
        "SHOW PROFILE",
        "VIEW PROFILE",
        "OPEN PROFILE",
        "GET PROFILE",
        "DISPLAY PROFILE",
        "STAFF PROFILE",
        "OFFICER PROFILE",
        "PERSON PROFILE",
        "EMPLOYEE PROFILE",
        "USER PROFILE",
        "WHO IS",
        "WHO'S",
        "IDENTITY",
        "IDENTIFY",
        "NAME",
        "FULL NAME",
        "DISPLAY NAME",
        "PERSON NAME",
        "OFFICER NAME",
        "STAFF NAME",
        "DETAIL",
        "DETAILS",
        "STAFF DETAILS",
        "OFFICER DETAILS",
        "PERSON DETAILS",
        "EMPLOYEE DETAILS",
        "INFORMATION",
        "INFO",
        "GENERAL INFORMATION",
        "STAFF INFORMATION",
        "OFFICER INFORMATION",
        "PERSON INFORMATION",
        "ABOUT",
        "ABOUT STAFF",
        "ABOUT OFFICER",
        "ABOUT PERSON",
        "TELL ME ABOUT",
        "SHOW ME",
        "DESCRIBE",
        "DESCRIBE STAFF",
        "DESCRIBE OFFICER",
        "RECORD",
        "STAFF RECORD",
        "EMPLOYEE RECORD",
        "PERSONNEL RECORD",
        "BIO",
        "BIOGRAPHY",
        "BACKGROUND",
        "COMPLETE PROFILE",
        "FULL PROFILE",
        "COMPLETE DETAILS",
        "FULL DETAILS",
        "SHOW COMPLETE PROFILE",
        "SHOW COMPLETE DETAILS",
        "VIEW DETAILS",
        "VIEW INFORMATION",
        "VIEW RECORD",
        "PERSONAL DETAILS",
        "PERSONAL INFORMATION",
        "STAFF DATA",
        "OFFICER DATA"
    ],

    /*----------------------------------
      Contact
    ----------------------------------*/

    STAFF_CONTACT: [
        "PHONE",
        "PHONE NO",
        "PHONE NUMBER",
        "PHONE NUM",
        "MOBILE",
        "MOBILE NO",
        "MOBILE NUMBER",
        "CELL",
        "CELL NO",
        "CELL NUMBER",
        "CONTACT",
        "CONTACT NO",
        "CONTACT NUMBER",
        "TELEPHONE",
        "TELEPHONE NO",
        "TELEPHONE NUMBER",
        "TEL",
        "TEL NO",
        "LANDLINE",
        "LAND LINE",
        "CALL",
        "CALL HIM",
        "CALL HER",
        "CALL STAFF",
        "RING",
        "DIAL",
        "REACH",
        "REACH HIM",
        "REACH HER",
        "CONNECT",
        "CONNECT TO",
        "GET IN TOUCH",
        "CONTACT DETAILS",
        "CONTACT INFO",
        "CONTACT INFORMATION",
        "COMMUNICATION",
        "EMAIL",
        "EMAIL ID",
        "EMAIL ADDRESS",
        "MAIL",
        "MAIL ID",
        "E MAIL",
        "NUMBER",
        "WHATSAPP",
        "WHATSAPP NUMBER",
        "WHATS APP",
        "WA NUMBER",
        "CONTACT ME",
        "HOW TO CONTACT",
        "HOW CAN I CONTACT",
        "HOW DO I CONTACT",
        "REACHABLE",
        "CAN I CALL",
        "CAN I CONTACT",
        "CAN I REACH"
    ],

    STAFF_ROLE: [
        "ROLE",
        "USER ROLE",
        "ACCESS LEVEL",
        "PERMISSION",
        "AUTHORITY"
    ],

    /*----------------------------------
      Designation
    ----------------------------------*/

    STAFF_DESIGNATION: [
        "DESIGNATION",
        "RANK",
        "POST",
        "POSITION",
        "OFFICE",
        "JOB",
        "TITLE",
        "CADRE",
        "GRADE",
        "WHAT IS DESIGNATION",
        "WHAT IS HIS DESIGNATION",
        "WHAT IS HER DESIGNATION",
        "PCCF",
        "PRINCIPAL CHIEF CONSERVATOR OF FORESTS",
        "APCCF",
        "ADDITIONAL PRINCIPAL CHIEF CONSERVATOR OF FORESTS",
        "CCF",
        "CHIEF CONSERVATOR OF FORESTS",
        "CF",
        "CONSERVATOR OF FORESTS",
        "DCF",
        "DEPUTY CONSERVATOR OF FORESTS",
        "DFO",
        "DIVISIONAL FOREST OFFICER",
        "ADFO",
        "ASSISTANT DIVISIONAL FOREST OFFICER",
        "ACF",
        "ASSISTANT CONSERVATOR OF FORESTS",
        "RO",
        "RANGE OFFICER",
        "FOREST RANGE OFFICER",
        "DRO",
        "DEPUTY RANGE OFFICER",
        "FORESTER",
        "FR",
        "FOREST GUARD",
        "FG",
        "FOREST BEAT OFFICER",
        "FBO",
        "BANASAHAYAK",
        "BANASAYAHAK",
        "BANASAHAYK",
        "BAN SAHAYAK",
        "BANA SAHAYAK",
        "BS",
        "DRIVER",
        "DR",
        "DAILY LABOUR",
        "DAILY LABOURER",
        "DAILY LABOURERS",
        "DAILY WAGE",
        "DAILY WAGER",
        "CASUAL LABOUR",
        "DL",
        "FOREST VOLUNTEER",
        "VOLUNTEER",
        "FV",
        "WATCHER",
        "MAHOUT",
        "ELEPHANT SQUAD",
        "OFFICER",
        "STAFF",
        "EMPLOYEE",
        "PERSONNEL",
        "FIELD STAFF",
        "FIELD OFFICER",
        "FIELD EMPLOYEE"
    ],

    /*----------------------------------
      Permanent Posting
    ----------------------------------*/

    STAFF_POSTING: [
        "POSTING",
        "POSTED",
        "POSTED AT",
        "POSTED IN",
        "PERMANENT POSTING",
        "OFFICIAL POSTING",
        "CURRENT POSTING",
        "PRESENT POSTING",
        "STAFF POSTING",
        "OFFICER POSTING",
        "EMPLOYEE POSTING",
        "OFFICIAL JURISDICTION",
        "ADMINISTRATIVE POSTING",
        "ADMINISTRATIVE LOCATION",
        "POSTING DETAILS",
        "POSTING INFORMATION",
        "POSTING INFO",
        "POSTING LOCATION",
        "OFFICIAL DETAILS",
        "OFFICIAL LOCATION",
        "OFFICIALLY POSTED",
        "OFFICIALLY WORKING",
        "PERMANENT WORK LOCATION",
        "OFFICIAL WORK LOCATION",
        "WHERE IS HE POSTED",
        "WHERE IS SHE POSTED",
        "WHERE IS STAFF POSTED",
        "WHERE DOES HE WORK",
        "WHERE DOES SHE WORK",
        "WHERE DOES STAFF WORK",
        "SHOW POSTING",
        "SHOW POSTING DETAILS",
        "SHOW POSTING INFORMATION",
        "GET POSTING",
        "VIEW POSTING",
        "DISPLAY POSTING",
        "SHOW OFFICIAL POSTING",
        "SHOW PERMANENT POSTING",
        "WHERE DOES HE BELONG",
        "WHERE DOES SHE BELONG",
        "WHERE DOES STAFF BELONG",
        "OFFICIAL OFFICE",
        "POSTING OFFICE",
        "POSTING HQ",
        "HOME POSTING",
        "PERMANENT POST",
        "OFFICIAL POST"
    ],

    /*----------------------------------
      Beat
    ----------------------------------*/

    STAFF_BEAT: [
        "BEAT",
        "BEETS",
        "BET",
        "BEAT AREA",
        "FOREST BEAT",
        "BEAT OFFICE",
        "BEAT NAME",
        "WHICH BEAT",
        "WHAT BEAT",
        "BEAT OF",
        "BELONGS TO BEAT",
        "BELONG TO BEAT",
        "WORKING BEAT",
        "POSTED BEAT",
        "BEAT LOCATION",
        "BEAT HEADQUARTER",
        "BEAT HQ",
        "CURRENT BEAT"
    ],

    /*----------------------------------
      Range
    ----------------------------------*/

    STAFF_RANGE: [
        "RANGE",
        "RNAGE",
        "RNG",
        "RANG",
        "FOREST RANGE",
        "RANGE OFFICE",
        "RANGE NAME",
        "WHICH RANGE",
        "WHAT RANGE",
        "RANGE OF",
        "BELONGS TO RANGE",
        "BELONG TO RANGE",
        "WORKING RANGE",
        "POSTED RANGE",
        "CURRENT RANGE",
        "RANGE HEADQUARTER",
        "RANGE HQ"
    ],

    /*----------------------------------
      Division
    ----------------------------------*/

    STAFF_DIVISION: [
        "DIVISION",
        "DIVISON",
        "DIV",
        "DIVN",
        "FOREST DIVISION",
        "DIVISION OFFICE",
        "DIVISION NAME",
        "WHICH DIVISION",
        "WHAT DIVISION",
        "DIVISION OF",
        "BELONGS TO DIVISION",
        "BELONG TO DIVISION",
        "WORKING DIVISION",
        "POSTED DIVISION",
        "CURRENT DIVISION",
        "DIVISION HEADQUARTER",
        "DIVISION HQ"
    ],

    /*----------------------------------
      Circle
    ----------------------------------*/

    STAFF_CIRCLE: [
        "CIRCLE",
        "CIRCLEE",
        "CIRLCE",
        "CRICLE",
        "CIRCLES",
        "FOREST CIRCLE",
        "CIRCLE OFFICE",
        "CIRCLE NAME",
        "WHICH CIRCLE",
        "WHAT CIRCLE",
        "CIRCLE OF",
        "BELONGS TO CIRCLE",
        "BELONG TO CIRCLE",
        "WORKING CIRCLE",
        "POSTED CIRCLE",
        "CURRENT CIRCLE",
        "CIRCLE HEADQUARTER",
        "CIRCLE HQ"
    ],

    STAFF_COMPARTMENT: [
        "COMPARTMENT"
    ],

    /*----------------------------------
      Live Location
    ----------------------------------*/

    STAFF_LOCATION: [
        "WHERE",
        "WHERE IS",
        "WHERE IS HE",
        "WHERE IS SHE",
        "WHERE ARE THEY",
        "LOCATION",
        "CURRENT LOCATION",
        "LIVE LOCATION",
        "REALTIME LOCATION",
        "REAL TIME LOCATION",
        "LATEST LOCATION",
        "LAST LOCATION",
        "PRESENT LOCATION",
        "POSITION",
        "CURRENT POSITION",
        "LIVE POSITION",
        "PRESENT POSITION",
        "LOCATE",
        "FIND LOCATION",
        "SHOW LOCATION",
        "TRACK",
        "TRACK STAFF",
        "TRACK OFFICER",
        "WHERE NOW",
        "WHERE IS NOW",
        "CURRENT PLACE",
        "PRESENT PLACE",
        "CURRENT AREA",
        "CURRENT BEAT",
        "CURRENT COMPARTMENT",
        "CURRENT SITE",
        "LIVE",
        "LIVE STATUS",
        "LIVE TRACKING",
        "TRACKING",
        "CURRENT STATUS",
        "NEAR WHERE",
        "NEAREST PLACE",
        "WHICH AREA",
        "WHICH LOCATION",
        "WHICH PLACE",
        "WHICH COMPARTMENT",
        "WHICH BEAT",
        "SHOW ON MAP",
        "OPEN MAP",
        "VIEW LOCATION",
        "MAP LOCATION",
        "MAP POSITION"
    ],

    /*----------------------------------
      Duty
    ----------------------------------*/

    STAFF_DUTY: [
        "DUTY",
        "ON DUTY",
        "OFF DUTY",
        "DUTY DETAILS",
        "DUTY INFORMATION",
        "CURRENT DUTY",
        "TODAY DUTY",
        "TODAYS DUTY",
        "PRESENT DUTY",
        "ACTIVE DUTY",
        "LAST DUTY",
        "PATROL",
        "PATROLLING",
        "PATROLL",
        "PATROL DUTY",
        "PATROL STATUS",
        "PATROL DETAILS",
        "PATROL INFORMATION",
        "DEPLOYED",
        "DEPLOYMENT",
        "DEPLOYMENT DETAILS",
        "ASSIGNED",
        "ASSIGNMENT",
        "WORKING",
        "WORKING TODAY",
        "CURRENT WORK",
        "TODAY WORK",
        "TASK",
        "CURRENT TASK",
        "JOB",
        "CURRENT JOB",
        "RESPONSIBILITY",
        "SHIFT",
        "SHIFT DUTY",
        "FIELD DUTY",
        "FIELD WORK",
        "FIELD ASSIGNMENT",
        "OPERATION",
        "CURRENT OPERATION",
        "MISSION",
        "CURRENT MISSION"
    ],

    /*----------------------------------
      Duty Started
    ----------------------------------*/

    STAFF_DUTY_STARTED: [
        "DUTY START",
        "DUTY STARTED",
        "DUTY START TIME",
        "DUTY STARTED AT",
        "DUTY STARTING TIME",
        "START DUTY",
        "START OF DUTY",
        "DUTY BEGIN",
        "DUTY BEGAN",
        "DUTY BEGINNING",
        "WHEN DID DUTY START",
        "WHEN WAS DUTY STARTED",
        "WHEN DID HE START DUTY",
        "WHEN DID SHE START DUTY",
        "WHEN DID STAFF START DUTY",
        "WHAT TIME DID DUTY START",
        "SHOW DUTY START",
        "GET DUTY START",
        "DISPLAY DUTY START",
        "SHOW DUTY START TIME",
        "GET DUTY START TIME",
        "DUTY START DETAILS",
        "DUTY START INFORMATION",
        "DUTY TIMELINE",
        "DUTY HISTORY",
        "TODAY DUTY START",
        "CURRENT DUTY START",
        "DUTY LOGIN",
        "LOGIN TIME",
        "REPORTING TIME",
        "JOINED DUTY",
        "JOIN DUTY",
        "DUTY COMMENCED",
        "COMMENCED DUTY",
        "DUTY INITIATED",
        "DUTY INITIATION",
        "START TIME",
        "STARTED AT",
        "DUTY FROM",
        "DUTY SINCE",
        "ON DUTY SINCE"
    ],

    /*----------------------------------
      Duty Ended
    ----------------------------------*/

    STAFF_DUTY_ENDED: [
        "DUTY END",
        "DUTY ENDED",
        "DUTY END TIME",
        "DUTY ENDED AT",
        "DUTY FINISHED",
        "DUTY FINISH TIME",
        "END DUTY",
        "END OF DUTY",
        "STOP DUTY",
        "STOPPED DUTY",
        "DUTY COMPLETED",
        "DUTY COMPLETE",
        "DUTY CLOSED",
        "DUTY TERMINATED",
        "WHEN DID DUTY END",
        "WHEN WAS DUTY ENDED",
        "WHEN DID HE END DUTY",
        "WHEN DID SHE END DUTY",
        "WHEN DID STAFF END DUTY",
        "WHAT TIME DID DUTY END",
        "SHOW DUTY END",
        "GET DUTY END",
        "DISPLAY DUTY END",
        "SHOW DUTY END TIME",
        "GET DUTY END TIME",
        "DUTY END DETAILS",
        "DUTY END INFORMATION",
        "LAST DUTY END",
        "LAST DUTY ENDED",
        "DUTY HISTORY",
        "DUTY TIMELINE",
        "DUTY LOGOUT",
        "LOGOUT TIME",
        "LEFT DUTY",
        "LEAVE DUTY",
        "SIGNED OFF",
        "SIGN OFF",
        "OFF DUTY TIME",
        "DUTY FINISHED AT",
        "DUTY COMPLETED AT",
        "DUTY STOPPED AT",
        "DUTY CLOSED AT",
        "END TIME",
        "ENDED AT",
        "FINISHED AT",
        "COMPLETED AT",
        "STOPPED AT",
        "LAST DUTY TIME"
    ],

    /*----------------------------------
      Duty Status
    ----------------------------------*/

    STAFF_DUTY_STATUS: [
        "ON DUTY",
        "ACTIVE",
        "ACTIVE DUTY",
        "WORKING",
        "WORKING NOW",
        "CURRENTLY WORKING",
        "IS WORKING",
        "IS ACTIVE",
        "AVAILABLE",
        "AVAILABLE ON DUTY",
        "OFF DUTY",
        "INACTIVE",
        "NOT WORKING",
        "NOT ON DUTY",
        "RESTING",
        "FREE",
        "IDLE",
        "DUTY STATUS",
        "STATUS",
        "CURRENT STATUS",
        "WORK STATUS",
        "ACTIVE OR NOT",
        "ON DUTY OR NOT",
        "IS ON DUTY",
        "IS OFF DUTY",
        "IS ACTIVE NOW",
        "IS AVAILABLE"
    ],

    /*----------------------------------
      Duty Type
    ----------------------------------*/

    STAFF_DUTY_TYPE: [
        "DUTY TYPE",
        "TYPE OF DUTY",
        "CURRENT DUTY TYPE",
        "WHAT DUTY",
        "WHICH DUTY",
        "DUTY NAME",
        "ASSIGNMENT TYPE",
        "WORK TYPE",
        "PATROL TYPE",
        "CURRENT ASSIGNMENT",
        "CURRENT WORK",
        "CURRENT TASK",
        "CURRENT OPERATION",
        "CURRENT MISSION",
        "ELEPHANT PATROL",
        "ELEPHANT DUTY",
        "FIRE PATROL",
        "FIRE DUTY",
        "FOREST PATROL",
        "NIGHT PATROL",
        "DAY PATROL",
        "ANTI POACHING",
        "ANTI POACHING PATROL",
        "ANTI POACHING DUTY",
        "LAW ENFORCEMENT",
        "DEPREDATION DUTY",
        "RESCUE DUTY",
        "VIP DUTY",
        "CHECK POST DUTY",
        "CHECKPOST DUTY",
        "BEAT PATROL",
        "SPECIAL DUTY"
    ],

    /*----------------------------------
      Assignment
    ----------------------------------*/

    STAFF_ASSIGNMENT: [
        "ASSIGNED",
        "ASSIGNMENT",
        "ASSIGNED AREA",
        "ASSIGNED COMPARTMENT",
        "ASSIGNED LOCATION",
        "ASSIGNED PLACE",
        "DEPLOYED",
        "DEPLOYMENT",
        "DEPLOYED AREA",
        "DEPLOYED LOCATION",
        "WORKING AREA",
        "WORK AREA",
        "WORKING IN",
        "WHICH AREA",
        "WHICH COMPARTMENT",
        "WHERE DEPLOYED",
        "WHERE ASSIGNED",
        "DUTY AREA",
        "AREA"
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
        "TEAM",
        "TEAM DETAILS",
        "TEAM INFORMATION",
        "TEAM MEMBERS",
        "TEAM MEMBER",
        "TEAM LIST",
        "TEAM STAFF",
        "TEAM INFO",
        "MEMBER",
        "MEMBERS",
        "GROUP",
        "GROUP MEMBERS",
        "CREW",
        "UNIT",
        "SQUAD",
        "PARTY",
        "WHO IS IN TEAM",
        "WHO ARE IN TEAM",
        "WHO IS ON TEAM",
        "WHO ARE ON TEAM",
        "WHO IS WITH",
        "WHO IS WORKING WITH",
        "WORKING WITH",
        "TEAM OF",
        "MEMBERS OF",
        "PART OF TEAM",
        "PATROL TEAM",
        "ELEPHANT PATROL TEAM",
        "FIRE PATROL TEAM",
        "ANTI POACHING TEAM",
        "RESCUE TEAM",
        "DEPREDATION TEAM",
        "ASSIGNED TEAM",
        "CURRENT TEAM",
        "TODAY TEAM",
        "TEAM ASSIGNMENT"
    ],

    /*----------------------------------
      Team Leader
    ----------------------------------*/

    STAFF_LEADER: [
        "LEADER",
        "TEAM LEADER",
        "GROUP LEADER",
        "TEAM HEAD",
        "HEAD",
        "HEAD OF TEAM",
        "HEAD OF GROUP",
        "INCHARGE",
        "IN CHARGE",
        "OFFICER IN CHARGE",
        "TEAM INCHARGE",
        "TEAM IN CHARGE",
        "PATROL LEADER",
        "PATROL HEAD",
        "WHO IS LEADER",
        "WHO IS TEAM LEADER",
        "WHO LEADS",
        "WHO IS INCHARGE",
        "WHO IS IN CHARGE",
        "WHO IS HEADING",
        "WHO IS COMMANDING",
        "LEADING OFFICER",
        "TEAM COMMANDER",
        "PATROL COMMANDER",
        "SUPERVISOR",
        "SUPERVISING OFFICER",
        "CURRENT LEADER",
        "CURRENT TEAM LEADER",
        "TEAM SUPERVISOR"
    ],

    /*----------------------------------
      GPS Coordinates
    ----------------------------------*/

    STAFF_GPS: [
        "GPS",
        "GPS LOCATION",
        "GPS POSITION",
        "GPS POINT",
        "GPS POINTS",
        "GPS COORDINATES",
        "GPS COORDINATE",
        "COORDINATE",
        "COORDINATES",
        "LOCATION COORDINATES",
        "MAP COORDINATES",
        "GEO COORDINATES",
        "GEOLOCATION",
        "GEO LOCATION",
        "LATITUDE",
        "LONGITUDE",
        "LAT",
        "LON",
        "LONG",
        "LAT LONG",
        "LAT LON",
        "POSITION",
        "EXACT LOCATION",
        "EXACT POSITION",
        "MAP POINT",
        "CURRENT GPS",
        "CURRENT COORDINATES",
        "CURRENT LATITUDE",
        "CURRENT LONGITUDE"
    ],

    /*----------------------------------
      Patrol Distance
    ----------------------------------*/

    STAFF_DISTANCE: [
        "DISTANCE",
        "DISTANCES",
        "HOW FAR",
        "FAR",
        "TOTAL DISTANCE",
        "CURRENT DISTANCE",
        "DISTANCE COVERED",
        "DISTANCE TRAVELLED",
        "DISTANCE TRAVELED",
        "COVERED",
        "COVER",
        "COVERING",
        "COVERAGE DISTANCE",
        "HOW MUCH DISTANCE",
        "HOW MANY KM",
        "HOW MANY KILOMETERS",
        "HOW MANY KILOMETRES",
        "TRAVELLED",
        "TRAVELED",
        "TRAVEL",
        "TRAVELLING",
        "TRAVELING",
        "MOVED",
        "MOVE",
        "MOVEMENT",
        "MOVEMENT DISTANCE",
        "WALKED",
        "WALK",
        "WALKING DISTANCE",
        "TOTAL WALK",
        "TOTAL WALKED",
        "PATROL DISTANCE",
        "PATROL KM",
        "PATROL KMS",
        "PATROL KILOMETERS",
        "PATROL KILOMETRES",
        "PATROL COVERAGE",
        "PATROL TRAVEL",
        "HOW FAR PATROLLED",
        "DISTANCE PATROLLED",
        "GROUND COVERAGE",
        "FIELD COVERAGE",
        "AREA COVERED",
        "HOW FAR HAS HE TRAVELLED",
        "HOW FAR HAS SHE TRAVELLED",
        "HOW FAR HAS STAFF TRAVELLED",
        "HOW FAR HAS HE WALKED",
        "HOW FAR HAS SHE WALKED",
        "HOW MUCH DID HE COVER",
        "HOW MUCH DID SHE COVER",
        "WHAT DISTANCE",
        "SHOW DISTANCE",
        "GET DISTANCE",
        "DISPLAY DISTANCE",
        "KM",
        "KMS",
        "KM COVERED",
        "KMS COVERED",
        "KILOMETER",
        "KILOMETERS",
        "KILOMETRE",
        "KILOMETRES",
        "METRE",
        "METRES",
        "METER",
        "METERS",
        "DISTANCE REPORT",
        "DISTANCE SUMMARY",
        "DISTANCE ANALYTICS",
        "PATROL REPORT",
        "PATROL SUMMARY",
        "TOTAL KM",
        "TOTAL KMS",
        "TOTAL TRAVEL",
        "TOTAL WALK",
        "TODAY DISTANCE",
        "CURRENT DISTANCE",
        "LIVE DISTANCE"
    ],

    /*----------------------------------
      Patrol GPS Points
    ----------------------------------*/

    STAFF_PATROL_POINTS: [
        "POINT",
        "POINTS",
        "GPS POINT",
        "GPS POINTS",
        "TRACK POINT",
        "TRACK POINTS",
        "LOCATION POINT",
        "LOCATION POINTS",
        "PATROL POINT",
        "PATROL POINTS",
        "PATROL GPS",
        "PATROL GPS POINT",
        "PATROL GPS POINTS",
        "PATROL TRACK",
        "PATROL TRACKS",
        "PATROL TRACK POINT",
        "PATROL TRACK POINTS",
        "ROUTE POINT",
        "ROUTE POINTS",
        "TRACK LOG",
        "TRACK LOGS",
        "TRACK RECORD",
        "TRACK RECORDS",
        "TRACK HISTORY",
        "TRACK DATA",
        "GPS RECORD",
        "GPS RECORDS",
        "GPS LOG",
        "GPS LOGS",
        "GPS HISTORY",
        "GPS DATA",
        "LOCATION HISTORY",
        "LOCATION LOG",
        "LOCATION RECORD",
        "POINT COUNT",
        "GPS POINT COUNT",
        "TRACK POINT COUNT",
        "PATROL POINT COUNT",
        "NUMBER OF POINTS",
        "TOTAL POINTS",
        "TOTAL GPS POINTS",
        "TOTAL TRACK POINTS",
        "HOW MANY POINTS",
        "HOW MANY GPS POINTS",
        "HOW MANY TRACK POINTS",
        "HOW MANY PATROL POINTS",
        "SHOW PATROL POINTS",
        "SHOW GPS POINTS",
        "SHOW TRACK POINTS",
        "GET PATROL POINTS",
        "GET GPS POINTS",
        "DISPLAY PATROL POINTS",
        "DISPLAY GPS POINTS",
        "PATROL POINT DETAILS",
        "GPS POINT DETAILS",
        "TRACK POINT DETAILS",
        "PATROL RECORD",
        "PATROL RECORDS",
        "PATROL HISTORY",
        "PATROL ANALYTICS",
        "PATROL SUMMARY",
        "PATROL REPORT",
        "RECORDED POINTS",
        "CAPTURED POINTS",
        "LOGGED POINTS",
        "SAMPLED POINTS",
        "TRACKING POINTS",
        "PATROL SAMPLES"
    ],

    /*----------------------------------
      Patrol Start
    ----------------------------------*/

    STAFF_PATROL_START: [
        "PATROL START",
        "PATROL STARTED",
        "PATROL START TIME",
        "PATROL STARTED AT",
        "PATROL STARTING TIME",
        "START PATROL",
        "START OF PATROL",
        "PATROL BEGIN",
        "PATROL BEGAN",
        "PATROL BEGINNING",
        "PATROL SESSION START",
        "SESSION START",
        "SESSION START TIME",
        "TRACK START",
        "TRACK START TIME",
        "GPS TRACK START",
        "GPS START",
        "TRACKING START",
        "TRACKING START TIME",
        "GPS RECORDING START",
        "GPS LOG START",
        "LOGGING START",
        "WHEN DID PATROL START",
        "WHEN WAS PATROL STARTED",
        "WHEN DID HE START PATROL",
        "WHEN DID SHE START PATROL",
        "WHEN DID STAFF START PATROL",
        "WHAT TIME DID PATROL START",
        "SHOW PATROL START",
        "GET PATROL START",
        "DISPLAY PATROL START",
        "PATROL START DETAILS",
        "PATROL START INFORMATION",
        "PATROL TIMELINE",
        "PATROL HISTORY",
        "PATROL SESSION",
        "PATROL ANALYTICS",
        "PATROL SUMMARY",
        "PATROL REPORT",
        "START TIME",
        "STARTED AT",
        "PATROL COMMENCED",
        "COMMENCED PATROL",
        "PATROL INITIATED",
        "PATROL INITIATION",
        "PATROL LAUNCHED"
    ],

    /*----------------------------------
      Patrol End
    ----------------------------------*/

    STAFF_PATROL_END: [
        "PATROL END",
        "PATROL ENDED",
        "PATROL END TIME",
        "PATROL ENDED AT",
        "PATROL FINISHED",
        "PATROL FINISH TIME",
        "END PATROL",
        "END OF PATROL",
        "PATROL STOP",
        "PATROL STOPPED",
        "PATROL COMPLETED",
        "PATROL COMPLETE",
        "PATROL CLOSED",
        "PATROL TERMINATED",
        "PATROL SESSION END",
        "SESSION END",
        "SESSION END TIME",
        "TRACK END",
        "TRACK END TIME",
        "GPS TRACK END",
        "GPS END",
        "TRACKING END",
        "TRACKING END TIME",
        "GPS RECORDING END",
        "GPS LOG END",
        "LOGGING END",
        "WHEN DID PATROL END",
        "WHEN WAS PATROL ENDED",
        "WHEN DID HE END PATROL",
        "WHEN DID SHE END PATROL",
        "WHEN DID STAFF END PATROL",
        "WHAT TIME DID PATROL END",
        "SHOW PATROL END",
        "GET PATROL END",
        "DISPLAY PATROL END",
        "PATROL END DETAILS",
        "PATROL END INFORMATION",
        "PATROL TIMELINE",
        "PATROL HISTORY",
        "PATROL SESSION",
        "PATROL ANALYTICS",
        "PATROL SUMMARY",
        "PATROL REPORT",
        "PATROL FINISHED AT",
        "PATROL STOPPED AT",
        "PATROL COMPLETED AT",
        "PATROL CLOSED AT",
        "WHEN WAS PATROL COMPLETED",
        "WHEN DID PATROL FINISH",
        "WHEN DID PATROL STOP",
        "END TIME",
        "ENDED AT",
        "FINISHED AT",
        "STOPPED AT",
        "COMPLETED AT",
        "CLOSED AT",
        "TERMINATED AT",
        "PATROL EXIT TIME"
    ],

    /*----------------------------------
      Patrol Duration
    ----------------------------------*/

    STAFF_PATROL_DURATION: [
        "DURATION",
        "PATROL DURATION",
        "TOTAL DURATION",
        "PATROL TIME",
        "PATROL TIME TAKEN",
        "PATROL TIME SPENT",
        "TIME TAKEN",
        "TIME SPENT",
        "TOTAL TIME",
        "ELAPSED TIME",
        "RUNNING TIME",
        "PATROL SESSION DURATION",
        "PATROL SESSION TIME",
        "SESSION DURATION",
        "SESSION TIME",
        "TRACK DURATION",
        "TRACK TIME",
        "GPS TRACK DURATION",
        "GPS TRACK TIME",
        "TRACKING DURATION",
        "TRACKING TIME",
        "GPS RECORDING DURATION",
        "GPS RECORDING TIME",
        "LOGGING DURATION",
        "LOGGING TIME",
        "HOW LONG WAS PATROL",
        "HOW LONG DID PATROL LAST",
        "HOW LONG DID HE PATROL",
        "HOW LONG DID SHE PATROL",
        "HOW LONG DID STAFF PATROL",
        "HOW MUCH TIME",
        "HOW MUCH TIME DID PATROL TAKE",
        "WHAT IS PATROL DURATION",
        "WHAT WAS PATROL DURATION",
        "SHOW PATROL DURATION",
        "GET PATROL DURATION",
        "DISPLAY PATROL DURATION",
        "PATROL DURATION DETAILS",
        "PATROL DURATION INFORMATION",
        "HOURS",
        "HOUR",
        "MINUTES",
        "MINUTE",
        "SECONDS",
        "SECOND",
        "HR",
        "HRS",
        "MIN",
        "MINS",
        "SEC",
        "SECS",
        "PATROL ANALYTICS",
        "PATROL SUMMARY",
        "PATROL REPORT",
        "PATROL TIMELINE",
        "PATROL HISTORY",
        "PATROL LENGTH",
        "SESSION LENGTH",
        "TRACK LENGTH",
        "TOTAL PATROL TIME",
        "TOTAL TRACK TIME",
        "TOTAL SESSION TIME",
        "ACTIVE PATROL TIME",
        "PATROL ELAPSED TIME"
    ],

    /*----------------------------------
      Speed
    ----------------------------------*/

    STAFF_SPEED: [
        "SPEED",
        "CURRENT SPEED",
        "LIVE SPEED",
        "MOVING SPEED",
        "TRAVEL SPEED",
        "RUNNING SPEED",
        "PATROL SPEED",
        "VELOCITY",
        "KMH",
        "KM/H",
        "KMPH",
        "HOW FAST",
        "HOW FAST IS",
        "IS MOVING",
        "MOVEMENT SPEED"
    ],

    /*----------------------------------
      Heading
    ----------------------------------*/

    STAFF_HEADING: [
        "HEADING",
        "CURRENT HEADING",
        "DIRECTION",
        "CURRENT DIRECTION",
        "MOVING DIRECTION",
        "TRAVEL DIRECTION",
        "BEARING",
        "CURRENT BEARING",
        "AZIMUTH",
        "WHICH DIRECTION",
        "GOING WHERE",
        "MOVING WHERE"
    ],

    /*----------------------------------
      GPS Accuracy
    ----------------------------------*/

    STAFF_ACCURACY: [
        "ACCURACY",
        "GPS ACCURACY",
        "LOCATION ACCURACY",
        "POSITION ACCURACY",
        "CURRENT ACCURACY",
        "GPS ERROR",
        "ERROR RADIUS",
        "ACCURATE",
        "PRECISION",
        "LOCATION PRECISION"
    ],

   

    /*----------------------------------
      Patrol Analytics
    ----------------------------------*/

    STAFF_ANALYTICS: [
        "PATROL ANALYTICS",
        "PATROL ANALYSIS",
        "PATROL SUMMARY",
        "PATROL OVERVIEW",
        "PATROL REPORT",
        "PATROL DASHBOARD",
        "COMPLETE PATROL",
        "COMPLETE PATROL REPORT",
        "COMPLETE PATROL ANALYTICS",
        "COMPLETE PATROL SUMMARY",
        "FULL PATROL REPORT",
        "FULL PATROL ANALYTICS",
        "FULL PATROL SUMMARY",
        "STAFF PATROL REPORT",
        "STAFF PATROL ANALYTICS",
        "STAFF PATROL SUMMARY",
        "STAFF PATROL OVERVIEW",
        "OFFICER PATROL REPORT",
        "OFFICER PATROL ANALYTICS",
        "OFFICER PATROL SUMMARY",
        "PATROL PERFORMANCE",
        "PATROL PERFORMANCE REPORT",
        "PATROL PERFORMANCE SUMMARY",
        "PATROL ACTIVITY",
        "PATROL ACTIVITY REPORT",
        "PATROL ACTIVITY SUMMARY",
        "PATROL DASHBOARD",
        "SHOW PATROL DASHBOARD",
        "SHOW PATROL REPORT",
        "SHOW PATROL ANALYTICS",
        "SHOW PATROL SUMMARY",
        "GET PATROL REPORT",
        "GET PATROL ANALYTICS",
        "DISPLAY PATROL REPORT",
        "DISPLAY PATROL ANALYTICS",
        "VIEW PATROL REPORT",
        "VIEW PATROL ANALYTICS",
        "SHOW COMPLETE PATROL",
        "SHOW COMPLETE ANALYTICS",
        "SHOW COMPLETE SUMMARY",
        "HOW WAS PATROL",
        "PATROL DETAILS",
        "COMPLETE PATROL DETAILS",
        "PATROL METRICS",
        "PATROL KPI",
        "PATROL KPIS",
        "PATROL INSIGHTS"
    ],

    /*----------------------------------
      Staff Summary
    ----------------------------------*/

    STAFF_SUMMARY: [
        "SUMMARY",
        "STAFF SUMMARY",
        "STAFF OVERVIEW",
        "STAFF REPORT",
        "STAFF STATUS",
        "STAFF DETAILS",
        "STAFF INFORMATION",
        "STAFF STATISTICS",
        "STAFF ANALYTICS",
        "STAFF DASHBOARD",
        "COMPLETE STAFF",
        "COMPLETE STAFF SUMMARY",
        "COMPLETE STAFF REPORT",
        "COMPLETE STAFF DETAILS",
        "COMPLETE STAFF OVERVIEW",
        "FULL STAFF",
        "FULL STAFF SUMMARY",
        "FULL STAFF REPORT",
        "FULL STAFF DETAILS",
        "OVERALL STAFF",
        "OVERALL SUMMARY",
        "OVERALL REPORT",
        "SHOW STAFF SUMMARY",
        "SHOW STAFF REPORT",
        "SHOW STAFF DETAILS",
        "SHOW STAFF STATUS",
        "GET STAFF SUMMARY",
        "GET STAFF REPORT",
        "DISPLAY STAFF SUMMARY",
        "DISPLAY STAFF REPORT",
        "VIEW STAFF SUMMARY",
        "VIEW STAFF REPORT",
        "TOTAL STAFF",
        "TOTAL OFFICERS",
        "TOTAL EMPLOYEES",
        "TOTAL PERSONNEL",
        "STAFF COUNT",
        "OFFICER COUNT",
        "EMPLOYEE COUNT",
        "HEADCOUNT",
        "MANPOWER",
        "HOW MANY STAFF",
        "HOW MANY OFFICERS",
        "STAFF STRENGTH",
        "STAFF POSITION",
        "WHO ARE THE STAFF",
        "LIST ALL STAFF",
        "STAFF DIRECTORY SUMMARY",
        "STAFF MASTER",
        "STAFF MASTER REPORT",
        "STAFF REGISTER",
        "PERSONNEL REPORT",
        "WORKFORCE REPORT",
        "HUMAN RESOURCE SUMMARY",
        "GIVE STAFF SUMMARY",
        "STAFF SNAPSHOT",
        "CURRENT STAFF SUMMARY",
        "CURRENT STAFF STATUS",
        "CURRENT STAFF REPORT"
    ],

    /*----------------------------------
      Jurisdiction Summary
    ----------------------------------*/

    STAFF_JURISDICTION_SUMMARY: [
        "JURISDICTION SUMMARY",
        "JURISDICTION REPORT",
        "JURISDICTION STRENGTH",
        "AREA SUMMARY",
        "AREA REPORT",
        "AREA WISE STAFF",
        "CIRCLE SUMMARY",
        "CIRCLE REPORT",
        "CIRCLE STRENGTH",
        "CIRCLE WISE STAFF",
        "CIRCLE WISE STRENGTH",
        "STAFF BY CIRCLE",
        "STAFF IN CIRCLE",
        "HOW MANY STAFF IN CIRCLE",
        "TOTAL STAFF IN CIRCLE",
        "DIVISION SUMMARY",
        "DIVISION REPORT",
        "DIVISION STRENGTH",
        "DIVISION WISE STAFF",
        "DIVISION WISE STRENGTH",
        "STAFF BY DIVISION",
        "STAFF IN DIVISION",
        "HOW MANY STAFF IN DIVISION",
        "TOTAL STAFF IN DIVISION",
        "RANGE SUMMARY",
        "RANGE REPORT",
        "RANGE STRENGTH",
        "RANGE WISE STAFF",
        "RANGE WISE STRENGTH",
        "STAFF BY RANGE",
        "STAFF IN RANGE",
        "HOW MANY STAFF IN RANGE",
        "TOTAL STAFF IN RANGE",
        "BEAT SUMMARY",
        "BEAT REPORT",
        "BEAT STRENGTH",
        "BEAT WISE STAFF",
        "BEAT WISE STRENGTH",
        "STAFF BY BEAT",
        "STAFF IN BEAT",
        "HOW MANY STAFF IN BEAT",
        "TOTAL STAFF IN BEAT",
        "STAFF DISTRIBUTION",
        "WORKFORCE DISTRIBUTION",
        "STAFF BREAKDOWN",
        "AREA BREAKDOWN",
        "JURISDICTION BREAKDOWN",
        "SHOW JURISDICTION SUMMARY",
        "SHOW AREA SUMMARY",
        "SHOW DIVISION SUMMARY",
        "SHOW RANGE SUMMARY",
        "SHOW BEAT SUMMARY",
        "SHOW CIRCLE SUMMARY",
        "GIVE JURISDICTION SUMMARY",
        "DISPLAY JURISDICTION SUMMARY",
        "VIEW JURISDICTION SUMMARY"
    ],

    /*----------------------------------
      Designation Summary
    ----------------------------------*/

    STAFF_DESIGNATION_SUMMARY: [
        "DESIGNATION SUMMARY",
        "DESIGNATION REPORT",
        "DESIGNATION WISE SUMMARY",
        "DESIGNATION WISE REPORT",
        "DESIGNATION WISE STAFF",
        "DESIGNATION WISE STRENGTH",
        "DESIGNATION BREAKDOWN",
        "DESIGNATION DISTRIBUTION",
        "DESIGNATION STRENGTH",
        "STAFF STRENGTH BY DESIGNATION",
        "STRENGTH BY DESIGNATION",
        "CADRE STRENGTH",
        "RANK WISE STRENGTH",
        "POST WISE STRENGTH",
        "HOW MANY FR",
        "HOW MANY FG",
        "HOW MANY BS",
        "HOW MANY DL",
        "HOW MANY PDL",
        "HOW MANY DR",
        "HOW MANY FV",
        "HOW MANY WATCHER",
        "HOW MANY DRIVER",
        "HOW MANY ADFO",
        "HOW MANY DFO",
        "HOW MANY CCF",
        "TOTAL FR",
        "TOTAL FG",
        "TOTAL BS",
        "TOTAL DL",
        "TOTAL PDL",
        "TOTAL DR",
        "TOTAL FV",
        "TOTAL WATCHER",
        "TOTAL DRIVER",
        "TOTAL ADFO",
        "TOTAL DFO",
        "TOTAL CCF",
        "STAFF BY DESIGNATION",
        "OFFICERS BY DESIGNATION",
        "EMPLOYEES BY DESIGNATION",
        "STAFF PER DESIGNATION",
        "DESIGNATION WISE COUNT",
        "DESIGNATION WISE HEADCOUNT",
        "DESIGNATION WISE MANPOWER",
        "SHOW DESIGNATION SUMMARY",
        "SHOW DESIGNATION REPORT",
        "SHOW DESIGNATION STRENGTH",
        "SHOW DESIGNATION WISE STAFF",
        "GET DESIGNATION SUMMARY",
        "GET DESIGNATION REPORT",
        "DISPLAY DESIGNATION SUMMARY",
        "DISPLAY DESIGNATION REPORT",
        "VIEW DESIGNATION SUMMARY",
        "VIEW DESIGNATION REPORT",
        "DESIGNATION ANALYSIS",
        "DESIGNATION ANALYTICS",
        "DESIGNATION DASHBOARD",
        "CADRE REPORT",
        "CADRE SUMMARY",
        "GIVE DESIGNATION SUMMARY",
        "GIVE DESIGNATION REPORT",
        "SHOW RANK WISE STAFF",
        "SHOW POST WISE STAFF",
        "SHOW CADRE STRENGTH"
    ],

    /*----------------------------------
      Circle Directory
    ----------------------------------*/

    STAFF_CIRCLE_DIRECTORY: [
        "CIRCLE DIRECTORY",
        "CIRCLE STAFF",
        "STAFF DIRECTORY OF CIRCLE",
        "STAFF LIST OF CIRCLE",
        "STAFF IN CIRCLE",
        "OFFICERS IN CIRCLE",
        "EMPLOYEES IN CIRCLE",
        "PERSONNEL IN CIRCLE",
        "LIST CIRCLE STAFF",
        "LIST STAFF OF CIRCLE",
        "LIST ALL STAFF IN CIRCLE",
        "LIST OFFICERS IN CIRCLE",
        "LIST EMPLOYEES IN CIRCLE",
        "SHOW CIRCLE STAFF",
        "SHOW STAFF OF CIRCLE",
        "SHOW ALL STAFF IN CIRCLE",
        "SHOW OFFICERS IN CIRCLE",
        "SHOW EMPLOYEES IN CIRCLE",
        "DISPLAY CIRCLE STAFF",
        "DISPLAY STAFF OF CIRCLE",
        "VIEW CIRCLE STAFF",
        "GET CIRCLE STAFF",
        "GET STAFF OF CIRCLE",
        "WHO IS IN CIRCLE",
        "WHO ARE IN CIRCLE",
        "WHO WORKS IN CIRCLE",
        "WHO IS POSTED IN CIRCLE",
        "WHO BELONGS TO CIRCLE",
        "CIRCLE STAFF DIRECTORY",
        "CIRCLE PERSONNEL",
        "CIRCLE WORKFORCE",
        "CIRCLE EMPLOYEES",
        "CIRCLE OFFICERS",
        "CIRCLE STAFF REPORT",
        "CIRCLE DIRECTORY REPORT",
        "CIRCLE PERSONNEL REPORT",
        "GIVE CIRCLE DIRECTORY",
        "GIVE CIRCLE STAFF",
        "SHOW CIRCLE DIRECTORY",
        "OPEN CIRCLE DIRECTORY",
        "CURRENT CIRCLE STAFF",
        "COMPLETE CIRCLE DIRECTORY"
    ],

    /*----------------------------------
      Division Directory
    ----------------------------------*/

    STAFF_DIVISION_DIRECTORY: [
        "DIVISION DIRECTORY",
        "DIVISION STAFF",
        "STAFF DIRECTORY OF DIVISION",
        "STAFF LIST OF DIVISION",
        "STAFF IN DIVISION",
        "OFFICERS IN DIVISION",
        "EMPLOYEES IN DIVISION",
        "PERSONNEL IN DIVISION",
        "LIST DIVISION STAFF",
        "LIST STAFF OF DIVISION",
        "LIST ALL STAFF IN DIVISION",
        "LIST OFFICERS IN DIVISION",
        "LIST EMPLOYEES IN DIVISION",
        "SHOW DIVISION STAFF",
        "SHOW STAFF OF DIVISION",
        "SHOW ALL STAFF IN DIVISION",
        "SHOW OFFICERS IN DIVISION",
        "SHOW EMPLOYEES IN DIVISION",
        "DISPLAY DIVISION STAFF",
        "DISPLAY STAFF OF DIVISION",
        "VIEW DIVISION STAFF",
        "GET DIVISION STAFF",
        "GET STAFF OF DIVISION",
        "WHO IS IN DIVISION",
        "WHO ARE IN DIVISION",
        "WHO WORKS IN DIVISION",
        "WHO IS POSTED IN DIVISION",
        "WHO BELONGS TO DIVISION",
        "DIVISION STAFF DIRECTORY",
        "DIVISION PERSONNEL",
        "DIVISION WORKFORCE",
        "DIVISION EMPLOYEES",
        "DIVISION OFFICERS",
        "DIVISION STAFF REPORT",
        "DIVISION DIRECTORY REPORT",
        "DIVISION PERSONNEL REPORT",
        "GIVE DIVISION DIRECTORY",
        "GIVE DIVISION STAFF",
        "SHOW DIVISION DIRECTORY",
        "OPEN DIVISION DIRECTORY",
        "CURRENT DIVISION STAFF",
        "COMPLETE DIVISION DIRECTORY"
    ],

    /*----------------------------------
      Range Directory
    ----------------------------------*/

    STAFF_RANGE_DIRECTORY: [
        "RANGE DIRECTORY",
        "RANGE STAFF",
        "STAFF DIRECTORY OF RANGE",
        "STAFF LIST OF RANGE",
        "STAFF IN RANGE",
        "OFFICERS IN RANGE",
        "EMPLOYEES IN RANGE",
        "PERSONNEL IN RANGE",
        "LIST RANGE STAFF",
        "LIST STAFF OF RANGE",
        "LIST ALL STAFF IN RANGE",
        "LIST OFFICERS IN RANGE",
        "LIST EMPLOYEES IN RANGE",
        "SHOW RANGE STAFF",
        "SHOW STAFF OF RANGE",
        "SHOW ALL STAFF IN RANGE",
        "SHOW OFFICERS IN RANGE",
        "SHOW EMPLOYEES IN RANGE",
        "DISPLAY RANGE STAFF",
        "DISPLAY STAFF OF RANGE",
        "VIEW RANGE STAFF",
        "GET RANGE STAFF",
        "GET STAFF OF RANGE",
        "WHO IS IN RANGE",
        "WHO ARE IN RANGE",
        "WHO WORKS IN RANGE",
        "WHO IS POSTED IN RANGE",
        "WHO BELONGS TO RANGE",
        "RANGE STAFF DIRECTORY",
        "RANGE PERSONNEL",
        "RANGE WORKFORCE",
        "RANGE EMPLOYEES",
        "RANGE OFFICERS",
        "RANGE STAFF REPORT",
        "RANGE DIRECTORY REPORT",
        "RANGE PERSONNEL REPORT",
        "GIVE RANGE DIRECTORY",
        "GIVE RANGE STAFF",
        "SHOW RANGE DIRECTORY",
        "OPEN RANGE DIRECTORY",
        "CURRENT RANGE STAFF",
        "COMPLETE RANGE DIRECTORY"
    ],
 /*----------------------------------
  Beat Directory
----------------------------------*/

STAFF_BEAT_DIRECTORY: [

    "BEAT DIRECTORY",
    "BEAT STAFF",
    "STAFF DIRECTORY OF BEAT",
    "STAFF LIST OF BEAT",
    "STAFF IN BEAT",
    "OFFICERS IN BEAT",
    "EMPLOYEES IN BEAT",
    "PERSONNEL IN BEAT",

    "LIST BEAT STAFF",
    "LIST STAFF OF BEAT",
    "LIST ALL STAFF IN BEAT",
    "LIST OFFICERS IN BEAT",
    "LIST EMPLOYEES IN BEAT",

    "SHOW BEAT STAFF",
    "SHOW STAFF OF BEAT",
    "SHOW ALL STAFF IN BEAT",
    "SHOW OFFICERS IN BEAT",
    "SHOW EMPLOYEES IN BEAT",

    "DISPLAY BEAT STAFF",
    "DISPLAY STAFF OF BEAT",

    "VIEW BEAT STAFF",

    "GET BEAT STAFF",
    "GET STAFF OF BEAT",

    "WHO IS IN BEAT",
    "WHO ARE IN BEAT",
    "WHO WORKS IN BEAT",
    "WHO IS POSTED IN BEAT",
    "WHO BELONGS TO BEAT",

    "BEAT STAFF DIRECTORY",
    "BEAT PERSONNEL",
    "BEAT WORKFORCE",
    "BEAT EMPLOYEES",
    "BEAT OFFICERS",

    "BEAT STAFF REPORT",
    "BEAT DIRECTORY REPORT",
    "BEAT PERSONNEL REPORT",

    "GIVE BEAT DIRECTORY",
    "GIVE BEAT STAFF",

    "SHOW BEAT DIRECTORY",

    "OPEN BEAT DIRECTORY",

    "CURRENT BEAT STAFF",

    "COMPLETE BEAT DIRECTORY"

],
 /*----------------------------------
  Designation Directory
----------------------------------*/

STAFF_DESIGNATION_DIRECTORY: [

    /*----------------------------------
      Generic
    ----------------------------------*/

    "DESIGNATION DIRECTORY",
    "DESIGNATION STAFF",
    "DESIGNATION WISE STAFF",
    "STAFF BY DESIGNATION",
    "STAFF OF DESIGNATION",
    "OFFICERS BY DESIGNATION",
    "EMPLOYEES BY DESIGNATION",
    "PERSONNEL BY DESIGNATION",

    /*----------------------------------
      Listing
    ----------------------------------*/

    "LIST DESIGNATION STAFF",
    "LIST STAFF BY DESIGNATION",
    "LIST STAFF OF DESIGNATION",
    "LIST ALL STAFF OF DESIGNATION",

    "SHOW DESIGNATION STAFF",
    "SHOW STAFF BY DESIGNATION",
    "SHOW STAFF OF DESIGNATION",
    "SHOW ALL STAFF OF DESIGNATION",

    "DISPLAY DESIGNATION STAFF",
    "DISPLAY STAFF OF DESIGNATION",

    "VIEW DESIGNATION STAFF",

    "GET DESIGNATION STAFF",
    "GET STAFF OF DESIGNATION",

    /*----------------------------------
      Designation Lists
    ----------------------------------*/

    "FR LIST",
    "FG LIST",
    "BS LIST",
    "FV LIST",
    "DRIVER LIST",
    "WATCHER LIST",
    "DL LIST",
    "PDL LIST",
    "AS LIST",

    "FORESTER LIST",
    "FOREST GUARD LIST",
    "BANASAHAYAK LIST",
    "FOREST VILLAGER LIST",

    /*----------------------------------
      Queries
    ----------------------------------*/

    "WHO ARE THE FR",
    "WHO ARE THE FG",
    "WHO ARE THE BS",

    "WHO ARE THE FOREST GUARDS",
    "WHO ARE THE FORESTERS",

    "WHO IS A DRIVER",

    "WHO IS A WATCHER",

    /*----------------------------------
      Administrative
    ----------------------------------*/

    "DESIGNATION DIRECTORY REPORT",
    "DESIGNATION STAFF REPORT",
    "DESIGNATION REGISTER",
    "STAFF REGISTER BY DESIGNATION",

    /*----------------------------------
      AI Friendly
    ----------------------------------*/

    "GIVE DESIGNATION DIRECTORY",

    "SHOW DESIGNATION DIRECTORY",

    "OPEN DESIGNATION DIRECTORY",

    "CURRENT DESIGNATION DIRECTORY",

    "COMPLETE DESIGNATION DIRECTORY"

],
 /*----------------------------------
  Active Staff Count
----------------------------------*/

STAFF_ACTIVE_COUNT: [

    /*----------------------------------
      Generic
    ----------------------------------*/

    "ACTIVE STAFF COUNT",
    "ACTIVE COUNT",
    "CURRENT ACTIVE COUNT",
    "ACTIVE STRENGTH",
    "CURRENT ACTIVE STRENGTH",
    "ACTIVE MANPOWER",
    "ACTIVE PERSONNEL",
    "ACTIVE WORKFORCE",

    /*----------------------------------
      On Duty
    ----------------------------------*/

    "ON DUTY COUNT",
    "ON DUTY STAFF COUNT",
    "STAFF ON DUTY COUNT",
    "DUTY COUNT",
    "CURRENT DUTY COUNT",
    "CURRENT ON DUTY COUNT",

    /*----------------------------------
      Questions
    ----------------------------------*/

    "HOW MANY STAFF ARE ACTIVE",
    "HOW MANY ACTIVE STAFF",
    "HOW MANY ARE ON DUTY",
    "HOW MANY STAFF ARE ON DUTY",
    "HOW MANY OFFICERS ARE ACTIVE",
    "HOW MANY EMPLOYEES ARE ACTIVE",

    "TOTAL ACTIVE STAFF",
    "TOTAL ACTIVE OFFICERS",
    "TOTAL STAFF ON DUTY",

    /*----------------------------------
      Reports
    ----------------------------------*/

    "SHOW ACTIVE STAFF COUNT",
    "SHOW ACTIVE COUNT",
    "SHOW DUTY COUNT",

    "DISPLAY ACTIVE STAFF COUNT",

    "VIEW ACTIVE STAFF COUNT",

    "GET ACTIVE STAFF COUNT",

    /*----------------------------------
      AI Friendly
    ----------------------------------*/

    "GIVE ACTIVE STAFF COUNT",
    "CURRENT ACTIVE STAFF COUNT",
    "CURRENT ACTIVE STRENGTH",
    "ACTIVE STAFF TOTAL"

],
 /*----------------------------------
  Active Staff List
----------------------------------*/

STAFF_ACTIVE_LIST: [

    /*----------------------------------
      Generic
    ----------------------------------*/

    "ACTIVE STAFF",
    "ACTIVE STAFF LIST",
    "ACTIVE STAFF DIRECTORY",
    "ACTIVE OFFICERS",
    "ACTIVE EMPLOYEES",
    "ACTIVE PERSONNEL",
    "ACTIVE WORKFORCE",

    /*----------------------------------
      On Duty
    ----------------------------------*/

    "STAFF ON DUTY",
    "ON DUTY STAFF",
    "ON DUTY OFFICERS",
    "ON DUTY EMPLOYEES",
    "ON DUTY PERSONNEL",

    "WHO IS ON DUTY",
    "WHO ARE ON DUTY",

    "CURRENT ON DUTY STAFF",
    "CURRENT ACTIVE STAFF",

    /*----------------------------------
      Listing
    ----------------------------------*/

    "LIST ACTIVE STAFF",
    "LIST ALL ACTIVE STAFF",
    "LIST STAFF ON DUTY",
    "LIST CURRENT ACTIVE STAFF",

    "SHOW ACTIVE STAFF",
    "SHOW ALL ACTIVE STAFF",
    "SHOW STAFF ON DUTY",
    "SHOW CURRENT ACTIVE STAFF",

    "DISPLAY ACTIVE STAFF",
    "DISPLAY STAFF ON DUTY",

    "VIEW ACTIVE STAFF",

    "GET ACTIVE STAFF",

    /*----------------------------------
      Reports
    ----------------------------------*/

    "ACTIVE STAFF REPORT",
    "ACTIVE STAFF DIRECTORY",
    "ACTIVE PERSONNEL REPORT",
    "ACTIVE DUTY REPORT",

    /*----------------------------------
      AI Friendly
    ----------------------------------*/

    "GIVE ACTIVE STAFF",

    "GIVE ACTIVE STAFF LIST",

    "OPEN ACTIVE STAFF LIST",

    "CURRENT ACTIVE STAFF LIST",

    "COMPLETE ACTIVE STAFF LIST"

],
 /*----------------------------------
  Inactive Staff List
----------------------------------*/

STAFF_INACTIVE_LIST: [

    /*----------------------------------
      Generic
    ----------------------------------*/

    "INACTIVE STAFF",
    "INACTIVE STAFF LIST",
    "INACTIVE STAFF DIRECTORY",
    "INACTIVE OFFICERS",
    "INACTIVE EMPLOYEES",
    "INACTIVE PERSONNEL",
    "INACTIVE WORKFORCE",

    /*----------------------------------
      Off Duty
    ----------------------------------*/

    "OFF DUTY STAFF",
    "STAFF OFF DUTY",
    "OFF DUTY OFFICERS",
    "OFF DUTY EMPLOYEES",
    "OFF DUTY PERSONNEL",

    "WHO IS OFF DUTY",
    "WHO ARE OFF DUTY",

    "CURRENT OFF DUTY STAFF",
    "CURRENT INACTIVE STAFF",

    /*----------------------------------
      Listing
    ----------------------------------*/

    "LIST INACTIVE STAFF",
    "LIST ALL INACTIVE STAFF",
    "LIST STAFF OFF DUTY",
    "LIST CURRENT INACTIVE STAFF",

    "SHOW INACTIVE STAFF",
    "SHOW ALL INACTIVE STAFF",
    "SHOW STAFF OFF DUTY",
    "SHOW CURRENT INACTIVE STAFF",

    "DISPLAY INACTIVE STAFF",
    "DISPLAY STAFF OFF DUTY",

    "VIEW INACTIVE STAFF",

    "GET INACTIVE STAFF",

    /*----------------------------------
      Reports
    ----------------------------------*/

    "INACTIVE STAFF REPORT",
    "INACTIVE STAFF DIRECTORY",
    "OFF DUTY REPORT",
    "OFF DUTY STAFF REPORT",

    /*----------------------------------
      AI Friendly
    ----------------------------------*/

    "GIVE INACTIVE STAFF",

    "GIVE INACTIVE STAFF LIST",

    "OPEN INACTIVE STAFF LIST",

    "CURRENT INACTIVE STAFF LIST",

    "COMPLETE INACTIVE STAFF LIST"

],
 /*----------------------------------
  Duty Summary
----------------------------------*/

STAFF_DUTY_SUMMARY: [

    /*----------------------------------
      Generic
    ----------------------------------*/

    "DUTY SUMMARY",
    "DUTY REPORT",
    "DUTY STATUS",
    "DUTY STATUS REPORT",
    "CURRENT DUTY STATUS",
    "CURRENT DUTY SUMMARY",
    "DUTY OVERVIEW",
    "DUTY ANALYSIS",

    /*----------------------------------
      Distribution
    ----------------------------------*/

    "DUTY DISTRIBUTION",
    "DUTY BREAKDOWN",
    "STAFF DUTY SUMMARY",
    "STAFF DUTY REPORT",
    "STAFF DUTY STATUS",

    /*----------------------------------
      Active Duty
    ----------------------------------*/

    "WHO IS ON DUTY",
    "HOW MANY ARE ON DUTY",
    "TOTAL STAFF ON DUTY",

    /*----------------------------------
      Duty Types
    ----------------------------------*/

    "PATROL DUTY SUMMARY",
    "PATROLLING SUMMARY",
    "DEPREDATION DUTY SUMMARY",
    "ELEPHANT DUTY SUMMARY",
    "PROTECTION DUTY SUMMARY",
    "NIGHT PATROL SUMMARY",
    "DAY PATROL SUMMARY",

    /*----------------------------------
      Reports
    ----------------------------------*/

    "SHOW DUTY SUMMARY",
    "SHOW DUTY REPORT",
    "SHOW DUTY STATUS",
    "SHOW STAFF DUTY",

    "DISPLAY DUTY SUMMARY",
    "DISPLAY DUTY REPORT",

    "VIEW DUTY SUMMARY",

    "GET DUTY SUMMARY",

    /*----------------------------------
      AI Friendly
    ----------------------------------*/

    "GIVE DUTY SUMMARY",

    "CURRENT DUTY REPORT",

    "COMPLETE DUTY SUMMARY",

    "TODAY DUTY SUMMARY",

    "TODAY DUTY REPORT"

],
 /*----------------------------------
  Team Leader List
----------------------------------*/

STAFF_TEAM_LEADER_LIST: [

    /*----------------------------------
      Generic
    ----------------------------------*/

    "TEAM LEADER",
    "TEAM LEADERS",
    "TEAM LEADER LIST",
    "TEAM LEADER DIRECTORY",
    "TEAM LEADER REPORT",

    "LEADER LIST",
    "LEADERS LIST",

    /*----------------------------------
      Listing
    ----------------------------------*/

    "LIST TEAM LEADERS",
    "LIST ALL TEAM LEADERS",
    "LIST LEADERS",

    "SHOW TEAM LEADERS",
    "SHOW ALL TEAM LEADERS",
    "SHOW LEADERS",

    "DISPLAY TEAM LEADERS",

    "VIEW TEAM LEADERS",

    "GET TEAM LEADERS",

    /*----------------------------------
      Questions
    ----------------------------------*/

    "WHO ARE THE TEAM LEADERS",
    "WHO IS TEAM LEADER",
    "WHO IS THE TEAM LEADER",

    "WHO LEADS THE TEAM",

    "WHO ARE THE LEADERS",

    /*----------------------------------
      Administrative
    ----------------------------------*/

    "TEAM LEADER DIRECTORY",

    "TEAM LEADER REGISTER",

    "TEAM LEADER DETAILS",

    "TEAM LEADER INFORMATION",

    /*----------------------------------
      AI Friendly
    ----------------------------------*/

    "GIVE TEAM LEADER LIST",

    "SHOW TEAM LEADER DIRECTORY",

    "OPEN TEAM LEADER DIRECTORY",

    "CURRENT TEAM LEADERS",

    "COMPLETE TEAM LEADER LIST"

],
 /*----------------------------------
  Moving Staff
----------------------------------*/

STAFF_MOVING: [

    /*----------------------------------
      Generic
    ----------------------------------*/

    "MOVING STAFF",
    "MOVING OFFICERS",
    "MOVING EMPLOYEES",
    "MOVING PERSONNEL",
    "MOVING WORKFORCE",

    /*----------------------------------
      Motion
    ----------------------------------*/

    "STAFF IN MOTION",
    "OFFICERS IN MOTION",
    "CURRENTLY MOVING",
    "CURRENTLY MOVING STAFF",
    "CURRENTLY MOVING OFFICERS",

    "WHO IS MOVING",
    "WHO ARE MOVING",

    /*----------------------------------
      Live Tracking
    ----------------------------------*/

    "LIVE MOVING STAFF",
    "LIVE MOVEMENT",
    "MOVING GPS",
    "LIVE GPS STAFF",
    "MOVING PATROL",

    /*----------------------------------
      Listing
    ----------------------------------*/

    "LIST MOVING STAFF",
    "LIST ALL MOVING STAFF",

    "SHOW MOVING STAFF",
    "SHOW ALL MOVING STAFF",

    "DISPLAY MOVING STAFF",

    "VIEW MOVING STAFF",

    "GET MOVING STAFF",

    /*----------------------------------
      Reports
    ----------------------------------*/

    "MOVING STAFF REPORT",
    "MOVEMENT REPORT",
    "LIVE MOVEMENT REPORT",
    "CURRENT MOVEMENT",

    /*----------------------------------
      AI Friendly
    ----------------------------------*/

    "GIVE MOVING STAFF",

    "SHOW LIVE MOVEMENT",

    "OPEN MOVING STAFF",

    "CURRENT MOVING STAFF",

    "COMPLETE MOVING STAFF LIST"

],
 /*----------------------------------
  Stationary Staff
----------------------------------*/

STAFF_STATIONARY: [

    /*----------------------------------
      Generic
    ----------------------------------*/

    "STATIONARY STAFF",
    "STATIONARY OFFICERS",
    "STATIONARY EMPLOYEES",
    "STATIONARY PERSONNEL",
    "STATIONARY WORKFORCE",

    /*----------------------------------
      Not Moving
    ----------------------------------*/

    "STAFF NOT MOVING",
    "OFFICERS NOT MOVING",
    "STAFF STANDING",
    "STAFF STOPPED",
    "STOPPED STAFF",

    "WHO IS STATIONARY",
    "WHO ARE STATIONARY",

    "WHO IS NOT MOVING",
    "WHO ARE NOT MOVING",

    /*----------------------------------
      Live Tracking
    ----------------------------------*/

    "LIVE STATIONARY STAFF",
    "LIVE STATIONARY",
    "CURRENTLY STATIONARY",
    "CURRENTLY STATIONARY STAFF",
    "CURRENTLY STOPPED STAFF",

    /*----------------------------------
      Listing
    ----------------------------------*/

    "LIST STATIONARY STAFF",
    "LIST ALL STATIONARY STAFF",

    "SHOW STATIONARY STAFF",
    "SHOW ALL STATIONARY STAFF",

    "DISPLAY STATIONARY STAFF",

    "VIEW STATIONARY STAFF",

    "GET STATIONARY STAFF",

    /*----------------------------------
      Reports
    ----------------------------------*/

    "STATIONARY STAFF REPORT",
    "STATIONARY REPORT",
    "STOPPED STAFF REPORT",
    "LIVE STATIONARY REPORT",

    /*----------------------------------
      AI Friendly
    ----------------------------------*/

    "GIVE STATIONARY STAFF",

    "SHOW STATIONARY STAFF",

    "OPEN STATIONARY STAFF",

    "CURRENT STATIONARY STAFF",

    "COMPLETE STATIONARY STAFF LIST"

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
BANASAHAYAK: [

    "BANASAHAYAK",

    "BANASAYAHAK",

    "BANASAHAYK",

    "BAN SAHAYAK",

    "BANA SAHAYAK",

    "BANA SAHAYAK",

    "BS"

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
StaffConstants.SEARCH_PRIORITY = Object.freeze([

    /*=====================================================
      Highest Priority
    =====================================================*/

    StaffConstants.FIELDS.CLEAN_NAME,

    StaffConstants.FIELDS.NAME,

    StaffConstants.FIELDS.RAW_NAME,

    StaffConstants.FIELDS.PHONE,

    StaffConstants.FIELDS.EMAIL,

    /*=====================================================
      Identity
    =====================================================*/

    StaffConstants.FIELDS.ROLE,

    StaffConstants.FIELDS.DESIGNATION,

    StaffConstants.FIELDS.TYPE,

    /*=====================================================
      Team
    =====================================================*/

    StaffConstants.FIELDS.LEADER,

    StaffConstants.FIELDS.TEAM,

    /*=====================================================
      Posting
    =====================================================*/

    StaffConstants.FIELDS.CIRCLE,

    StaffConstants.FIELDS.DIVISION,

    StaffConstants.FIELDS.RANGE,

    StaffConstants.FIELDS.BEAT,

    StaffConstants.FIELDS.COMPARTMENT,

    /*=====================================================
      Duty
    =====================================================*/

    StaffConstants.FIELDS.DUTY_TYPE,

    StaffConstants.FIELDS.DUTY_ACTIVE,

    StaffConstants.FIELDS.STATUS,

    /*=====================================================
      Location
    =====================================================*/

    StaffConstants.FIELDS.LOCATION,

    /*=====================================================
      GPS
    =====================================================*/

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
