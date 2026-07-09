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
    }

]),
 /*-----------------------------------------------------
  Team
-----------------------------------------------------*/

TEAM_INFO: Object.freeze([

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
    },

    {
        target: "device",
        source: StaffConstants.FIELDS.DEVICE,
        type: "string"
    },

    {
        target: "createdAt",
        source: StaffConstants.FIELDS.CREATED_AT,
        type: "raw"
    },

    {
        target: "updatedAt",
        source: StaffConstants.FIELDS.UPDATED_AT,
        type: "raw"
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
        type: "raw"
    },

    {
        target: "endedAt",
        source: StaffConstants.FIELDS.ENDED_AT,
        type: "raw"
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

    /* Search */

    "SEARCH",
    "SEARCH STAFF",
    "SEARCH FOR",
    "SEARCH OFFICER",

    /* Find */

    "FIND",
    "FIND STAFF",
    "FIND PERSON",
    "FIND OFFICER",

    /* Lookup */

    "LOOKUP",
    "LOOK UP",
    "STAFF LOOKUP",

    /* Locate */

    "LOCATE",
    "LOCATE STAFF",

    /* Search Variations */

    "LOOK FOR",
    "LOOK FOR STAFF",

    /* Dedicated */

    "STAFF SEARCH"

],
    /*----------------------------------
      Directory
    ----------------------------------*/

    STAFF_DIRECTORY: [

    /* Primary */

    "DIRECTORY",
    "STAFF DIRECTORY",
    "EMPLOYEE DIRECTORY",
    "OFFICER DIRECTORY",
    "PERSONNEL DIRECTORY",

    /* Complete Directory */

    "COMPLETE STAFF DIRECTORY",
    "FULL STAFF DIRECTORY",
    "COMPLETE OFFICER DIRECTORY",
    "FULL OFFICER DIRECTORY",

    /* Listing */

    "STAFF LIST",
    "OFFICER LIST",
    "PERSONNEL LIST",

    /* Questions */

    "WHO ARE THE STAFF",
    "WHO ARE THE OFFICERS",

    /* Display */

    "VIEW STAFF DIRECTORY",
    "OPEN STAFF DIRECTORY",
    "DISPLAY STAFF DIRECTORY",

    "VIEW OFFICER DIRECTORY",
    "OPEN OFFICER DIRECTORY",
    "DISPLAY OFFICER DIRECTORY"

],

    /*----------------------------------
      Staff Profile
    ----------------------------------*/

STAFF_PROFILE: [

    /* Profile */

    "PROFILE",
    "STAFF PROFILE",
    "OFFICER PROFILE",
    "EMPLOYEE PROFILE",
    "PERSON PROFILE",
    "USER PROFILE",
    "FULL PROFILE",
    "COMPLETE PROFILE",

    /* View */

    "SHOW PROFILE",
    "VIEW PROFILE",
    "OPEN PROFILE",
    "DISPLAY PROFILE",
    "GET PROFILE",

    /* Details */

    "STAFF DETAILS",
    "OFFICER DETAILS",
    "EMPLOYEE DETAILS",
    "PERSON DETAILS",
    "COMPLETE DETAILS",
    "FULL DETAILS",
    "PERSONAL DETAILS",

    /* Information */

    "STAFF INFORMATION",
    "OFFICER INFORMATION",
    "PERSON INFORMATION",
    "GENERAL INFORMATION",
    "PERSONAL INFORMATION",

    /* Identity */

    "IDENTITY",
    "IDENTIFY",
    "FULL NAME",
    "DISPLAY NAME",

    /* Record */

    "STAFF RECORD",
    "EMPLOYEE RECORD",
    "PERSONNEL RECORD",

    /* Data */

    "STAFF DATA",
    "OFFICER DATA",

    /* Biography */

    "BIO",
    "BIOGRAPHY",
    "BACKGROUND"

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

    /*----------------------------------
      Designation Queries
    ----------------------------------*/

    "DESIGNATION",
    "RANK",
    "TITLE",
    "CADRE",
    "GRADE",

    "WHAT IS DESIGNATION",
    "WHAT IS HIS DESIGNATION",
    "WHAT IS HER DESIGNATION",
    "WHAT IS THEIR DESIGNATION",

    "SHOW DESIGNATION",
    "GET DESIGNATION",
    "DISPLAY DESIGNATION",
    "VIEW DESIGNATION",

    /*----------------------------------
      Senior Officers
    ----------------------------------*/

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

    /*----------------------------------
      Range
    ----------------------------------*/

    "RO",
    "RANGE OFFICER",

    "DRO",
    "DEPUTY RANGE OFFICER",

    /*----------------------------------
      Field Staff
    ----------------------------------*/

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

    "ELEPHANT SQUAD"

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

    "FOREST DIVISION",

    "DIVISION OFFICE",
    "DIVISION HQ",
    "DIVISION HEADQUARTER",

    "DIVISION NAME",

    "CURRENT DIVISION",
    "WORKING DIVISION",
    "POSTED DIVISION",

    "WHICH DIVISION",
    "WHAT DIVISION",

    "BELONGS TO DIVISION",
    "BELONG TO DIVISION",

    "DIVISION OF"

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

    /* Location */

    "LOCATION",
    "CURRENT LOCATION",
    "LIVE LOCATION",
    "GPS LOCATION",
    "REALTIME LOCATION",
    "REAL TIME LOCATION",
    "LATEST LOCATION",
    "LAST LOCATION",
    "PRESENT LOCATION",

    /* Questions */

    "WHERE IS NOW",
    "WHERE HE IS NOW",
    "WHERE SHE IS NOW",
    "CURRENT PLACE",
    "PRESENT PLACE",
    "WHICH LOCATION",
    "WHICH PLACE",

    /* Map */

    "SHOW LOCATION",
    "VIEW LOCATION",
    "MAP LOCATION",
    "SHOW ON MAP",
    "OPEN MAP",

    /* GPS */

    "GPS POSITION",
    "GPS COORDINATES",
    "CURRENT GPS",
    "LIVE GPS"

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
  Who Is On Duty
----------------------------------*/


 /*----------------------------------
  Who Is Patrolling
----------------------------------*/

WHO_IS_PATROLLING: [

    /*=========================================================
      Generic
    =========================================================*/

    "WHO IS PATROLLING",
    "WHO ARE PATROLLING",

    "PATROLLING STAFF",
    "PATROLLING TEAM",
    "PATROLLING OFFICERS",
    "PATROLLING PERSONNEL",
    "PATROLLING EMPLOYEES",

    "STAFF PATROLLING",
    "TEAM PATROLLING",

    "CURRENTLY PATROLLING",
    "CURRENT PATROL",

    /*=========================================================
      Patrol
    =========================================================*/

    "PATROL STAFF",
    "PATROL TEAM",
    "PATROL MEMBERS",
    "PATROL PARTY",

    "WHO IS ON PATROL",
    "WHO ARE ON PATROL",

    "WHO IS OUT ON PATROL",
    "WHO ARE OUT ON PATROL",

    "STAFF ON PATROL",
    "OFFICERS ON PATROL",

    /*=========================================================
      Elephant Patrol
    =========================================================*/

    "ELEPHANT PATROL",
    "ELEPHANT PATROL TEAM",
    "ELEPHANT PATROLLING",

    /*=========================================================
      Foot Patrol
    =========================================================*/

    "FOOT PATROL",
    "FOOT PATROLLING",

    /*=========================================================
      Vehicle Patrol
    =========================================================*/

    "VEHICLE PATROL",
    "MOBILE PATROL",

    /*=========================================================
      Show
    =========================================================*/

    "SHOW PATROLLING STAFF",
    "SHOW STAFF PATROLLING",
    "SHOW PATROL TEAM",
    "SHOW PATROL STAFF",
    "SHOW WHO IS PATROLLING",

    /*=========================================================
      List
    =========================================================*/

    "LIST PATROLLING STAFF",
    "LIST STAFF PATROLLING",
    "LIST PATROL TEAM",
    "LIST PATROL STAFF",

    /*=========================================================
      Display
    =========================================================*/

    "DISPLAY PATROLLING STAFF",
    "DISPLAY PATROL TEAM",
    "VIEW PATROLLING STAFF",
    "VIEW PATROL TEAM",

    "GET PATROLLING STAFF",
    "GET PATROL TEAM",

    /*=========================================================
      Jurisdiction
    =========================================================*/

    "WHO IS PATROLLING IN",
    "WHO ARE PATROLLING IN",

    "WHO IS PATROLLING UNDER",
    "WHO ARE PATROLLING UNDER",

    "PATROLLING STAFF IN",
    "PATROLLING STAFF UNDER",

    "SHOW PATROLLING STAFF IN",
    "SHOW PATROLLING STAFF UNDER",

    "LIST PATROLLING STAFF IN",
    "LIST PATROLLING STAFF UNDER",

    "PATROL TEAM IN",
    "PATROL TEAM UNDER",

    /*=========================================================
      Reports
    =========================================================*/

    "PATROL REPORT",
    "PATROLLING REPORT",
    "LIVE PATROL",

    /*=========================================================
      AI Friendly
    =========================================================*/

    "GIVE PATROLLING STAFF",
    "GIVE PATROL TEAM",

    "CURRENT PATROL",

    "CURRENTLY PATROLLING"

],
    /*----------------------------------
      Status
    ----------------------------------*/

STAFF_STATUS: [

    "STAFF STATUS",

    "ACTIVE STATUS",
    "INACTIVE STATUS",

    "CURRENT STATUS",

    "STAFF ACTIVE STATUS",
    "STAFF INACTIVE STATUS",

    "OFFICER STATUS",

    "STATUS OF STAFF",

    "STATUS OF OFFICER"

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

/*----------------------------------
  Patrol Distance
----------------------------------*/

STAFF_DISTANCE: [

    /*=========================================================
      Generic
    =========================================================*/

    "DISTANCE",
    "PATROL DISTANCE",
    "TOTAL DISTANCE",
    "DISTANCE COVERED",
    "TOTAL DISTANCE COVERED",
    "COVERED DISTANCE",
    "TRAVEL DISTANCE",
    "MOVEMENT DISTANCE",

    /*=========================================================
      Questions
    =========================================================*/

    "HOW FAR",
    "HOW FAR DID",
    "HOW MUCH DISTANCE",
    "HOW MUCH DISTANCE COVERED",
    "HOW MUCH HAS",
    "HOW FAR HAS",
    "WHAT DISTANCE",
    "WHAT IS THE DISTANCE",

    /*=========================================================
      Patrol
    =========================================================*/

    "PATROL LENGTH",
    "PATROL ROUTE LENGTH",
    "PATROL COVERAGE DISTANCE",

    /*=========================================================
      Reports
    =========================================================*/

    "DISTANCE REPORT",
    "PATROL DISTANCE REPORT",
    "DISTANCE SUMMARY",
    "PATROL DISTANCE SUMMARY",

    /*=========================================================
      Rankings
    =========================================================*/

    "MOST DISTANCE",
    "MAX DISTANCE",
    "LONGEST DISTANCE",
    "LONGEST PATROL",
    "TOP DISTANCE",

    /*=========================================================
      Show
    =========================================================*/

    "SHOW DISTANCE",
    "SHOW PATROL DISTANCE",
    "SHOW DISTANCE COVERED",

    /*=========================================================
      List
    =========================================================*/

    "LIST DISTANCE",
    "LIST PATROL DISTANCE",

    /*=========================================================
      Display
    =========================================================*/

    "DISPLAY DISTANCE",
    "DISPLAY PATROL DISTANCE",
    "VIEW DISTANCE",
    "VIEW PATROL DISTANCE",
    "GET DISTANCE",
    "GET PATROL DISTANCE",

    /*=========================================================
      AI Friendly
    =========================================================*/

    "GIVE DISTANCE",
    "GIVE PATROL DISTANCE",
    "CURRENT DISTANCE",
    "CURRENT PATROL DISTANCE"

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

/*----------------------------------
  Staff Analytics
----------------------------------*/

STAFF_ANALYTICS: [

    /* Primary */

    "ANALYTICS",
    "STAFF ANALYTICS",

    "ANALYTICS REPORT",
    "ANALYTICS SUMMARY",

    "STAFF ANALYTICS REPORT",
    "STAFF ANALYTICS SUMMARY",

    /* Performance */

    "PERFORMANCE",
    "PERFORMANCE REPORT",
    "PERFORMANCE SUMMARY",

    "STAFF PERFORMANCE",

    "STAFF PERFORMANCE REPORT",

    /* Dashboard */

    "DASHBOARD",

    "ANALYTICS DASHBOARD",

    "STAFF DASHBOARD",

    "PERFORMANCE DASHBOARD",

    /* Insights */

    "INSIGHTS",

    "ANALYTICS INSIGHTS",

    "PERFORMANCE INSIGHTS",

    "STAFF INSIGHTS",

    /* Reports */

    "STAFF REPORT",

    "STAFF REPORTS",

    "SUMMARY REPORT",

    "PERFORMANCE REPORT",

    /* Display */

    "SHOW ANALYTICS",

    "VIEW ANALYTICS",

    "DISPLAY ANALYTICS",

    "OPEN ANALYTICS",

    /* AI */

    "GIVE ANALYTICS",

    "CURRENT ANALYTICS"

],

    /*----------------------------------
      Staff Summary
    ----------------------------------*/

/*----------------------------------
  Staff Summary
----------------------------------*/

STAFF_SUMMARY: [

    /* Generic */

    "STAFF SUMMARY",
    "SUMMARY OF STAFF",
    "STAFF OVERVIEW",
    "STAFF STATUS",
    "STAFF REPORT",
    "STAFF DETAILS",
    "STAFF INFORMATION",
    "STAFF DATA",
    "OVERALL STAFF",
    "COMPLETE STAFF",
    "FULL STAFF",
    "ALL STAFF",

    /* Questions */

    "WHAT IS THE STAFF STATUS",
    "WHAT IS STAFF STATUS",
    "WHAT IS THE CURRENT STAFF STATUS",
    "SHOW STAFF STATUS",
    "HOW IS THE STAFF",
    "HOW IS STAFF",

    /* Summary */

    "SUMMARY",
    "OVERALL SUMMARY",
    "CURRENT SUMMARY",
    "LIVE SUMMARY",
    "STAFF OVERALL SUMMARY",

    /* Show */

    "SHOW STAFF",
    "SHOW ALL STAFF",
    "SHOW STAFF SUMMARY",
    "SHOW STAFF REPORT",
    "SHOW STAFF DETAILS",
    "SHOW STAFF OVERVIEW",

    /* List */

    "LIST STAFF",
    "LIST ALL STAFF",
    "LIST STAFF SUMMARY",
    "LIST STAFF REPORT",
    "LIST COMPLETE STAFF",

    /* Display */

    "DISPLAY STAFF",
    "DISPLAY STAFF SUMMARY",
    "DISPLAY STAFF REPORT",
    "VIEW STAFF",
    "VIEW STAFF SUMMARY",
    "VIEW STAFF REPORT",
    "GET STAFF SUMMARY",
    "GET STAFF REPORT",

    /* Reports */

    "STAFF STATUS REPORT",
    "STAFF OVERVIEW REPORT",
    "LIVE STAFF REPORT",
    "CURRENT STAFF REPORT",

    /* AI Friendly */

    "GIVE STAFF SUMMARY",
    "GIVE STAFF REPORT",
    "GIVE STAFF DETAILS",
    "CURRENT STAFF SUMMARY",
    "CURRENT STAFF REPORT"

],
    /*----------------------------------
      Jurisdiction Summary
    ----------------------------------*/

/*----------------------------------
  Jurisdiction Summary
----------------------------------*/

STAFF_JURISDICTION_SUMMARY: [

    /* Generic */

    "JURISDICTION SUMMARY",
    "JURISDICTION REPORT",
    "JURISDICTION OVERVIEW",
    "JURISDICTION STATUS",
    "STAFF JURISDICTION SUMMARY",

    /* Circle */

    "CIRCLE SUMMARY",
    "CIRCLE REPORT",
    "CIRCLE OVERVIEW",
    "SUMMARY OF CIRCLE",
    "SHOW CIRCLE SUMMARY",
    "LIST CIRCLE SUMMARY",

    /* Division */

    "DIVISION SUMMARY",
    "DIVISION REPORT",
    "DIVISION OVERVIEW",
    "SUMMARY OF DIVISION",
    "SHOW DIVISION SUMMARY",
    "LIST DIVISION SUMMARY",

    /* Range */

    "RANGE SUMMARY",
    "RANGE REPORT",
    "RANGE OVERVIEW",
    "SUMMARY OF RANGE",
    "SHOW RANGE SUMMARY",
    "LIST RANGE SUMMARY",

    /* Beat */

    "BEAT SUMMARY",
    "BEAT REPORT",
    "BEAT OVERVIEW",
    "SUMMARY OF BEAT",
    "SHOW BEAT SUMMARY",
    "LIST BEAT SUMMARY",

    /* Compartment */

    "COMPARTMENT SUMMARY",
    "COMPARTMENT REPORT",
    "SUMMARY OF COMPARTMENT",
    "SHOW COMPARTMENT SUMMARY",

    /* Questions */

    "HOW MANY STAFF IN EACH DIVISION",
    "HOW MANY STAFF IN EACH RANGE",
    "HOW MANY STAFF IN EACH BEAT",
    "HOW MANY STAFF IN EACH CIRCLE",

    "STAFF BY DIVISION",
    "STAFF BY RANGE",
    "STAFF BY BEAT",
    "STAFF BY CIRCLE",

    /* Reports */

    "DIVISION WISE SUMMARY",
    "RANGE WISE SUMMARY",
    "BEAT WISE SUMMARY",
    "CIRCLE WISE SUMMARY",

    "DIVISION WISE REPORT",
    "RANGE WISE REPORT",
    "BEAT WISE REPORT",
    "CIRCLE WISE REPORT",

    /* AI Friendly */

    "GIVE DIVISION SUMMARY",
    "GIVE RANGE SUMMARY",
    "GIVE BEAT SUMMARY",
    "GIVE CIRCLE SUMMARY",

    "CURRENT DIVISION SUMMARY",
    "CURRENT RANGE SUMMARY",
    "CURRENT BEAT SUMMARY",
    "CURRENT CIRCLE SUMMARY"

],

    /*----------------------------------
      Designation Summary
    ----------------------------------*/

/*----------------------------------
  Designation Summary
----------------------------------*/

STAFF_DESIGNATION_SUMMARY: [

    /* Generic */

    "DESIGNATION SUMMARY",
    "DESIGNATION REPORT",
    "DESIGNATION OVERVIEW",
    "DESIGNATION STATUS",
    "STAFF DESIGNATION SUMMARY",

    /* Questions */

    "STAFF BY DESIGNATION",
    "SUMMARY BY DESIGNATION",
    "SHOW DESIGNATION SUMMARY",
    "SHOW STAFF BY DESIGNATION",

    "HOW MANY FOREST GUARDS",
    "HOW MANY FOREST RANGERS",
    "HOW MANY BEAT OFFICERS",
    "HOW MANY TEAM LEADERS",
    "HOW MANY ADFO",
    "HOW MANY DFO",

    "COUNT BY DESIGNATION",
    "DESIGNATION COUNT",

    /* Reports */

    "DESIGNATION WISE SUMMARY",
    "DESIGNATION WISE REPORT",
    "DESIGNATION REPORT",
    "DESIGNATION STATUS REPORT",

    "STAFF DESIGNATION REPORT",

    /* Show */

    "SHOW DESIGNATION REPORT",
    "SHOW DESIGNATION OVERVIEW",
    "SHOW DESIGNATION STATUS",

    /* List */

    "LIST DESIGNATIONS",
    "LIST STAFF DESIGNATIONS",
    "LIST DESIGNATION SUMMARY",

    /* Display */

    "DISPLAY DESIGNATION SUMMARY",
    "DISPLAY DESIGNATION REPORT",
    "VIEW DESIGNATION SUMMARY",
    "VIEW DESIGNATION REPORT",
    "GET DESIGNATION SUMMARY",
    "GET DESIGNATION REPORT",

    /* AI Friendly */

    "GIVE DESIGNATION SUMMARY",
    "GIVE DESIGNATION REPORT",
    "CURRENT DESIGNATION SUMMARY",
    "CURRENT DESIGNATION REPORT"

],

    /*----------------------------------
      Circle Directory
    ----------------------------------*/

/*----------------------------------
  Circle Directory
----------------------------------*/

STAFF_CIRCLE_DIRECTORY: [

    /* Generic */

    "CIRCLE DIRECTORY",
    "DIRECTORY OF CIRCLES",
    "CIRCLE LIST",
    "CIRCLES",
    "ALL CIRCLES",

    /* Questions */

    "SHOW CIRCLES",
    "LIST CIRCLES",
    "WHAT CIRCLES",
    "WHICH CIRCLES",
    "WHAT ARE THE CIRCLES",
    "WHICH ARE THE CIRCLES",

    /* Show */

    "SHOW CIRCLE DIRECTORY",
    "SHOW ALL CIRCLES",
    "SHOW CIRCLE LIST",
    "SHOW FOREST CIRCLES",

    /* List */

    "LIST CIRCLE DIRECTORY",
    "LIST ALL CIRCLES",
    "LIST FOREST CIRCLES",

    /* Display */

    "DISPLAY CIRCLE DIRECTORY",
    "DISPLAY CIRCLES",
    "VIEW CIRCLE DIRECTORY",
    "VIEW CIRCLES",
    "GET CIRCLE DIRECTORY",
    "GET CIRCLES",

    /* Reports */

    "CIRCLE REPORT",
    "CIRCLE DIRECTORY REPORT",

    /* AI Friendly */

    "GIVE CIRCLE DIRECTORY",
    "GIVE CIRCLE LIST",
    "CURRENT CIRCLES"

],

    /*----------------------------------
      Division Directory
    ----------------------------------*/

/*----------------------------------
  Division Directory
----------------------------------*/

STAFF_DIVISION_DIRECTORY: [

    /* Generic */

    "DIVISION DIRECTORY",
    "DIVISION LIST",
    "DIVISION STAFF",
    "DIVISION PERSONNEL",
    "DIVISION OFFICERS",
    "DIVISION EMPLOYEES",
    "DIVISION WORKFORCE",
    "DIVISION DIRECTORY REPORT",
    "COMPLETE DIVISION DIRECTORY",

    /* Staff Of Division */

    "STAFF DIRECTORY OF DIVISION",
    "STAFF LIST OF DIVISION",
    "STAFF OF DIVISION",
    "STAFF UNDER DIVISION",
    "STAFF IN DIVISION",

    "OFFICERS IN DIVISION",
    "EMPLOYEES IN DIVISION",
    "PERSONNEL IN DIVISION",

    /* Posting */

    "POSTED IN DIVISION",
    "POSTED UNDER DIVISION",
    "BELONGS TO DIVISION",
    "WORKING IN DIVISION",
    "WORKING UNDER DIVISION",

    /* Questions */

    "WHO IS IN DIVISION",
    "WHO ARE IN DIVISION",
    "WHO WORKS IN DIVISION",
    "WHO IS POSTED IN DIVISION",
    "WHO ARE POSTED IN DIVISION",
    "WHO BELONGS TO DIVISION",

    /* List */

    "LIST DIVISION STAFF",
    "LIST STAFF OF DIVISION",
    "LIST STAFF IN DIVISION",
    "LIST STAFF UNDER DIVISION",
    "LIST ALL STAFF IN DIVISION",
    "LIST OFFICERS IN DIVISION",
    "LIST EMPLOYEES IN DIVISION",

    /* Show */

    "SHOW DIVISION STAFF",
    "SHOW STAFF OF DIVISION",
    "SHOW STAFF IN DIVISION",
    "SHOW STAFF UNDER DIVISION",
    "SHOW ALL STAFF IN DIVISION",
    "SHOW OFFICERS IN DIVISION",
    "SHOW EMPLOYEES IN DIVISION",

    /* Display */

    "DISPLAY DIVISION STAFF",
    "DISPLAY STAFF OF DIVISION",
    "VIEW DIVISION STAFF",
    "VIEW STAFF OF DIVISION",

    /* Get */

    "GET DIVISION STAFF",
    "GET STAFF OF DIVISION",

    /* AI */

    "OPEN DIVISION DIRECTORY",
    "GIVE DIVISION DIRECTORY",
    "GIVE DIVISION STAFF",
    "CURRENT DIVISION STAFF"

],

    /*----------------------------------
      Range Directory
    ----------------------------------*/

/*----------------------------------
  Range Directory
----------------------------------*/

STAFF_RANGE_DIRECTORY: [

    /* Primary */

    "RANGE DIRECTORY",
    "RANGE STAFF DIRECTORY",
    "DIRECTORY OF RANGE",
    "STAFF DIRECTORY OF RANGE",
    "RANGE DIRECTORY REPORT",
    "COMPLETE RANGE DIRECTORY",

    /* Staff */

    "STAFF OF RANGE",
    "STAFF IN RANGE",
    "STAFF UNDER RANGE",
    "STAFF POSTED IN RANGE",
    "STAFF POSTED UNDER RANGE",

    /* Officers */

    "OFFICERS IN RANGE",
    "OFFICERS OF RANGE",
    "OFFICERS UNDER RANGE",

    /* Employees */

    "EMPLOYEES IN RANGE",
    "EMPLOYEES OF RANGE",

    /* Personnel */

    "PERSONNEL IN RANGE",
    "PERSONNEL OF RANGE",

    /* Posting */

    "POSTED IN RANGE",
    "POSTED UNDER RANGE",
    "BELONGS TO RANGE",

    /* Questions */

    "WHO IS POSTED IN RANGE",
    "WHO ARE POSTED IN RANGE",
    "WHO BELONGS TO RANGE",
    "WHO WORKS IN RANGE",

    /* Listing */

    "LIST STAFF OF RANGE",
    "LIST STAFF IN RANGE",
    "LIST STAFF UNDER RANGE",
    "LIST ALL STAFF IN RANGE",
    "LIST OFFICERS IN RANGE",
    "LIST EMPLOYEES IN RANGE",
    "LIST PERSONNEL IN RANGE",

    /* Display */

    "DISPLAY STAFF OF RANGE",
    "DISPLAY STAFF IN RANGE",
    "DISPLAY RANGE DIRECTORY",
    "VIEW RANGE DIRECTORY",
    "VIEW STAFF OF RANGE",

    /* AI */

    "OPEN RANGE DIRECTORY",
    "GIVE RANGE DIRECTORY",
    "CURRENT RANGE DIRECTORY"

],
 /*----------------------------------
  Beat Directory
----------------------------------*/

/*----------------------------------
  Beat Directory
----------------------------------*/

STAFF_BEAT_DIRECTORY: [

    /* Generic */

    "BEAT DIRECTORY",
    "BEAT LIST",
    "BEAT STAFF",
    "BEAT PERSONNEL",
    "BEAT OFFICERS",
    "BEAT EMPLOYEES",
    "BEAT WORKFORCE",
    "BEAT DIRECTORY REPORT",
    "COMPLETE BEAT DIRECTORY",

    /* Staff */

    "STAFF DIRECTORY OF BEAT",
    "STAFF LIST OF BEAT",
    "STAFF OF BEAT",
    "STAFF UNDER BEAT",
    "STAFF IN BEAT",

    "OFFICERS IN BEAT",
    "EMPLOYEES IN BEAT",
    "PERSONNEL IN BEAT",

    /* Posting */

    "POSTED IN BEAT",
    "POSTED UNDER BEAT",
    "BELONGS TO BEAT",
    "WORKING IN BEAT",
    "WORKING UNDER BEAT",

    /* Questions */

    "WHO IS IN BEAT",
    "WHO ARE IN BEAT",
    "WHO WORKS IN BEAT",
    "WHO IS POSTED IN BEAT",
    "WHO ARE POSTED IN BEAT",
    "WHO BELONGS TO BEAT",

    /* List */

    "LIST BEAT STAFF",
    "LIST STAFF OF BEAT",
    "LIST STAFF IN BEAT",
    "LIST STAFF UNDER BEAT",
    "LIST ALL STAFF IN BEAT",
    "LIST OFFICERS IN BEAT",
    "LIST EMPLOYEES IN BEAT",

    /* Show */

    "SHOW BEAT STAFF",
    "SHOW STAFF OF BEAT",
    "SHOW STAFF UNDER BEAT",
    "SHOW STAFF IN BEAT",
    "SHOW ALL STAFF IN BEAT",
    "SHOW OFFICERS IN BEAT",
    "SHOW EMPLOYEES IN BEAT",

    /* Display */

    "DISPLAY BEAT STAFF",
    "DISPLAY STAFF OF BEAT",
    "VIEW BEAT STAFF",
    "VIEW STAFF OF BEAT",

    /* Get */

    "GET BEAT STAFF",
    "GET STAFF OF BEAT",

    /* AI */

    "OPEN BEAT DIRECTORY",
    "GIVE BEAT DIRECTORY",
    "GIVE BEAT STAFF",
    "CURRENT BEAT STAFF"

],
 /*----------------------------------
  Designation Directory
----------------------------------*/

/*----------------------------------
  Designation Directory
----------------------------------*/

STAFF_DESIGNATION_DIRECTORY: [

    /*=========================================================
      Generic
    ========================================================*/

    "DESIGNATION DIRECTORY",
    "DESIGNATION LIST",
    "DESIGNATIONS",

    "DESIGNATION STAFF",
    "DESIGNATION PERSONNEL",
    "DESIGNATION EMPLOYEES",
    "DESIGNATION OFFICERS",

    "STAFF BY DESIGNATION",
    "STAFF DIRECTORY BY DESIGNATION",
    "STAFF DIRECTORY OF DESIGNATION",
    "STAFF LIST OF DESIGNATION",

    "STAFF OF DESIGNATION",
    "STAFF UNDER DESIGNATION",
    "STAFF IN DESIGNATION",

    "OFFICERS BY DESIGNATION",
    "EMPLOYEES BY DESIGNATION",
    "PERSONNEL BY DESIGNATION",

    /*=========================================================
      Listing
    ========================================================*/

    "LIST DESIGNATION STAFF",
    "LIST STAFF BY DESIGNATION",
    "LIST STAFF OF DESIGNATION",
    "LIST STAFF UNDER DESIGNATION",
    "LIST ALL STAFF OF DESIGNATION",

    "SHOW DESIGNATION STAFF",
    "SHOW STAFF BY DESIGNATION",
    "SHOW STAFF OF DESIGNATION",
    "SHOW STAFF UNDER DESIGNATION",
    "SHOW ALL STAFF OF DESIGNATION",

    "DISPLAY DESIGNATION STAFF",
    "DISPLAY STAFF OF DESIGNATION",

    "VIEW DESIGNATION STAFF",
    "VIEW STAFF OF DESIGNATION",

    "GET DESIGNATION STAFF",
    "GET STAFF OF DESIGNATION",

    /*=========================================================
      Abbreviations
    ========================================================*/

    "FR",
    "FG",
    "BS",
    "FV",
    "AS",
    "DL",
    "PDL",
    "DRIVER",
    "WATCHER",

    "FR LIST",
    "FG LIST",
    "BS LIST",
    "FV LIST",
    "AS LIST",
    "DL LIST",
    "PDL LIST",

    "DRIVER LIST",
    "WATCHER LIST",

    "SHOW FR",
    "SHOW FG",
    "SHOW BS",
    "SHOW FV",
    "SHOW AS",
    "SHOW DL",
    "SHOW PDL",

    "LIST FR",
    "LIST FG",
    "LIST BS",
    "LIST FV",
    "LIST AS",
    "LIST DL",
    "LIST PDL",

    /*=========================================================
      Full Designation Names
    ========================================================*/

    "FORESTER",
    "FORESTERS",

    "FOREST GUARD",
    "FOREST GUARDS",

    "BANASAHAYAK",
    "BANASAHAYAKS",

    "FOREST VILLAGER",
    "FOREST VILLAGERS",

    "DRIVER",
    "DRIVERS",

    "WATCHER",
    "WATCHERS",

    "DAILY LABOUR",
    "DAILY LABOURER",
    "DAILY LABOURERS",

    "PERMANENT DAILY LABOUR",
    "PERMANENT DAILY LABOURER",
    "PERMANENT DAILY LABOURERS",

    "ANIMAL SQUAD",
    "ANIMAL SQUAD MEMBER",
    "ANIMAL SQUAD MEMBERS",

    /*=========================================================
      Questions
    ========================================================*/

    "WHO ARE THE FR",
    "WHO ARE THE FG",
    "WHO ARE THE BS",
    "WHO ARE THE FV",
    "WHO ARE THE DL",
    "WHO ARE THE PDL",
    "WHO ARE THE AS",

    "WHO ARE THE FORESTERS",
    "WHO ARE THE FOREST GUARDS",
    "WHO ARE THE BANASAHAYAKS",
    "WHO ARE THE FOREST VILLAGERS",

    "WHO ARE DRIVERS",
    "WHO ARE WATCHERS",

    "WHO IS A FORESTER",
    "WHO IS A FOREST GUARD",
    "WHO IS A BANASAHAYAK",
    "WHO IS A FOREST VILLAGER",

    "WHO IS A DRIVER",
    "WHO IS A WATCHER",

    /*=========================================================
      Administrative
    ========================================================*/

    "DESIGNATION DIRECTORY REPORT",
    "DESIGNATION STAFF REPORT",

    "DESIGNATION REGISTER",
    "STAFF REGISTER BY DESIGNATION",

    /*=========================================================
      AI Friendly
    ========================================================*/

    "GIVE DESIGNATION DIRECTORY",
    "GIVE DESIGNATION STAFF",

    "SHOW DESIGNATION DIRECTORY",

    "OPEN DESIGNATION DIRECTORY",

    "CURRENT DESIGNATION DIRECTORY",

    "COMPLETE DESIGNATION DIRECTORY"

],
 /*----------------------------------
  Active Staff Count
----------------------------------*/
/*=========================================================
  WHO_IS_ON_DUTY
  (Only literal "who" questions regarding duty status)
=========================================================*/
WHO_IS_ON_DUTY: [
    "WHO IS ON DUTY",
    "WHO ARE ON DUTY",
    "WHO IS CURRENTLY ON DUTY",
    "WHO ARE CURRENTLY ON DUTY",
    "WHICH STAFF ARE ON DUTY",
    "WHICH OFFICERS ARE ON DUTY",
    "WHO IS WORKING NOW",
    "WHO ARE WORKING NOW",
    "WHO IS DEPLOYED",
    "WHO ARE DEPLOYED",
    "WHO IS ON DUTY IN",
    "WHO ARE ON DUTY IN",
    "WHO IS ON DUTY UNDER",
    "WHO ARE ON DUTY UNDER"
],

/*=========================================================
  STAFF_ACTIVE_LIST
  (Requests for the list or report of active staff)
=========================================================*/
STAFF_ACTIVE_LIST: [
    "ACTIVE STAFF",
    "ACTIVE STAFF LIST",
    "LIST ACTIVE STAFF",
    "SHOW ACTIVE STAFF",
    "DISPLAY ACTIVE STAFF",
    "VIEW ACTIVE STAFF",
    "GET ACTIVE STAFF",
    "CURRENT ACTIVE STAFF",
    "WORKING STAFF",
    "STAFF ON DUTY",
    "ON DUTY STAFF",
    "ACTIVE PERSONNEL",
    "ACTIVE OFFICERS",
    "ACTIVE EMPLOYEES",
    "ACTIVE MEMBERS",
    "ACTIVE STAFF REPORT",
    "ACTIVE STAFF IN",
    "ACTIVE STAFF UNDER",
    "SHOW ACTIVE STAFF IN",
    "SHOW ACTIVE STAFF UNDER",
    "LIST ACTIVE STAFF IN",
    "LIST ACTIVE STAFF UNDER"
],

/*=========================================================
  STAFF_ACTIVE_COUNT
  (Requests for numerical totals)
=========================================================*/
STAFF_ACTIVE_COUNT: [
    "ACTIVE STAFF COUNT",
    "ACTIVE COUNT",
    "CURRENT ACTIVE COUNT",
    "ACTIVE STRENGTH",
    "TOTAL ACTIVE STAFF",
    "NUMBER OF ACTIVE STAFF",
    "HOW MANY ACTIVE STAFF",
    "HOW MANY STAFF ARE ON DUTY",
    "COUNT ACTIVE STAFF",
    "ON DUTY COUNT",
    "CURRENT DUTY COUNT",
    "TOTAL STAFF ON DUTY",
    "ACTIVE HEADCOUNT",
    "ACTIVE MANPOWER",
    "ACTIVE WORKFORCE",
    "TOTAL ACTIVE",
    "TOTAL ACTIVE OFFICERS",
    "TOTAL ACTIVE EMPLOYEES",
    "SHOW ACTIVE STAFF COUNT",
    "SHOW ACTIVE COUNT",
    "SHOW DUTY COUNT",
    "SHOW ON DUTY COUNT",
    "DISPLAY ACTIVE COUNT",
    "DISPLAY ACTIVE STAFF COUNT",
    "VIEW ACTIVE COUNT",
    "GET ACTIVE COUNT",
    "ACTIVE COUNT REPORT",
    "ACTIVE SUMMARY",
    "GIVE ACTIVE COUNT",
    "GIVE ACTIVE STAFF COUNT",
    "CURRENT ACTIVE STRENGTH"
],



/*----------------------------------
  Inactive Staff List
----------------------------------*/

STAFF_INACTIVE_LIST: [

    /* Generic */

    "INACTIVE STAFF",
    "INACTIVE STAFF LIST",
    "INACTIVE LIST",
    "INACTIVE PERSONNEL",
    "INACTIVE OFFICERS",
    "INACTIVE EMPLOYEES",
    "IDLE STAFF",
    "OFF DUTY STAFF",
    "AVAILABLE STAFF",

    /* Duty */

    "OFF DUTY",
    "OFF DUTY STAFF",
    "STAFF OFF DUTY",
    "CURRENTLY OFF DUTY",
    "NOT ON DUTY",
    "NOT WORKING",
    "NOT PATROLLING",
    "FREE STAFF",
    "RESTING STAFF",

    /* Questions */

    "WHO IS OFF DUTY",
    "WHO ARE OFF DUTY",
    "WHO IS INACTIVE",
    "WHO ARE INACTIVE",
    "WHO IS NOT ON DUTY",
    "WHO ARE NOT ON DUTY",
    "WHO IS AVAILABLE",
    "WHO ARE AVAILABLE",
    "WHO IS FREE",
    "WHO ARE FREE",

    /* Show */

    "SHOW INACTIVE STAFF",
    "SHOW OFF DUTY STAFF",
    "SHOW STAFF OFF DUTY",
    "SHOW AVAILABLE STAFF",
    "SHOW FREE STAFF",
    "SHOW IDLE STAFF",

    /* List */

    "LIST INACTIVE STAFF",
    "LIST OFF DUTY STAFF",
    "LIST STAFF OFF DUTY",
    "LIST AVAILABLE STAFF",
    "LIST FREE STAFF",

    /* Display */

    "DISPLAY INACTIVE STAFF",
    "DISPLAY OFF DUTY STAFF",
    "VIEW INACTIVE STAFF",
    "VIEW OFF DUTY STAFF",
    "GET INACTIVE STAFF",
    "GET OFF DUTY STAFF",

    /* Reports */

    "INACTIVE STAFF REPORT",
    "OFF DUTY REPORT",
    "INACTIVE STAFF SUMMARY",

    /* AI Friendly */

    "GIVE INACTIVE STAFF",
    "GIVE OFF DUTY STAFF",
    "GIVE AVAILABLE STAFF",
    "CURRENT INACTIVE STAFF"

],
 /*----------------------------------
  Duty Summary
----------------------------------*/

/*----------------------------------
  Duty Summary
----------------------------------*/

STAFF_DUTY_SUMMARY: [

    /* Generic */

    "DUTY SUMMARY",
    "STAFF DUTY SUMMARY",
    "CURRENT DUTY SUMMARY",
    "TODAY DUTY SUMMARY",
    "DUTY OVERVIEW",
    "DUTY STATUS",
    "DUTY STATUS SUMMARY",
    "DUTY REPORT",
    "STAFF DUTY REPORT",
    "CURRENT DUTY REPORT",

    /* Questions */

    "WHAT IS THE DUTY STATUS",
    "WHAT IS CURRENT DUTY STATUS",
    "WHAT DUTY IS RUNNING",
    "WHICH DUTIES ARE ACTIVE",
    "WHAT STAFF ARE ON DUTY",

    /* Show */

    "SHOW DUTY SUMMARY",
    "SHOW STAFF DUTY",
    "SHOW DUTY REPORT",
    "SHOW CURRENT DUTY",
    "SHOW DUTY STATUS",
    "SHOW ACTIVE DUTY",

    /* List */

    "LIST DUTY",
    "LIST DUTY SUMMARY",
    "LIST STAFF DUTY",
    "LIST ACTIVE DUTY",
    "LIST CURRENT DUTY",

    /* Display */

    "DISPLAY DUTY SUMMARY",
    "DISPLAY DUTY REPORT",
    "VIEW DUTY SUMMARY",
    "VIEW DUTY REPORT",
    "GET DUTY SUMMARY",
    "GET DUTY REPORT",

    /* Patrol */

    "PATROL DUTY",
    "PATROL DUTY SUMMARY",
    "ELEPHANT PATROL DUTY",
    "CURRENT PATROL DUTY",

    /* Reports */

    "TODAY DUTY REPORT",
    "LIVE DUTY REPORT",
    "ACTIVE DUTY REPORT",
    "DUTY STATUS REPORT",

    /* AI Friendly */

    "GIVE DUTY SUMMARY",
    "GIVE DUTY REPORT",
    "CURRENT DUTY SUMMARY",
    "CURRENT DUTY REPORT"

],
 /*----------------------------------
  Team Leader List
----------------------------------*/

/*----------------------------------
  Team Leader List
----------------------------------*/

STAFF_TEAM_LEADER_LIST: [

    /* Generic */

    "TEAM LEADER",
    "TEAM LEADERS",
    "TEAM LEADER LIST",
    "TEAM LEADERS LIST",
    "LEADER",
    "LEADERS",
    "LEADER LIST",
    "LEADERS LIST",

    /* Questions */

    "WHO IS TEAM LEADER",
    "WHO ARE TEAM LEADERS",
    "WHO IS THE TEAM LEADER",
    "WHO ARE THE TEAM LEADERS",

    "WHO IS LEADER",
    "WHO ARE LEADERS",

    /* Show */

    "SHOW TEAM LEADERS",
    "SHOW TEAM LEADER",
    "SHOW LEADERS",
    "SHOW LEADER LIST",
    "SHOW TEAM LEADER LIST",

    /* List */

    "LIST TEAM LEADERS",
    "LIST TEAM LEADER",
    "LIST LEADERS",
    "LIST LEADER",
    "LIST OF TEAM LEADERS",
    "LIST OF LEADERS",

    /* Display */

    "DISPLAY TEAM LEADERS",
    "DISPLAY LEADER LIST",
    "VIEW TEAM LEADERS",
    "VIEW LEADER LIST",
    "GET TEAM LEADERS",
    "GET LEADER LIST",

    /* Directory */

    "TEAM LEADER DIRECTORY",
    "LEADER DIRECTORY",

    /* Reports */

    "TEAM LEADER REPORT",
    "TEAM LEADER SUMMARY",

    /* AI Friendly */

    "GIVE TEAM LEADERS",
    "GIVE TEAM LEADER LIST",
    "GIVE LEADER LIST",
    "CURRENT TEAM LEADERS"

],
 /*----------------------------------
  Moving Staff
----------------------------------*/

/*----------------------------------
  Moving Staff
----------------------------------*/

STAFF_MOVING: [

    /* Generic */

    "MOVING STAFF",
    "MOVING STAFF LIST",
    "MOVING PEOPLE",
    "MOVING OFFICERS",
    "MOVING PERSONNEL",
    "MOVING EMPLOYEES",

    /* Questions */

    "WHO IS MOVING",
    "WHO ARE MOVING",
    "WHO IS CURRENTLY MOVING",
    "WHO ARE CURRENTLY MOVING",

    /* Show */

    "SHOW MOVING STAFF",
    "SHOW MOVING PEOPLE",
    "SHOW STAFF MOVING",
    "SHOW STAFF IN MOTION",
    "SHOW MOVING TEAM",

    /* List */

    "LIST MOVING STAFF",
    "LIST STAFF MOVING",
    "LIST MOVING PEOPLE",
    "LIST MOVING TEAM",

    /* Motion */

    "IN MOTION",
    "STAFF IN MOTION",
    "CURRENTLY MOVING",
    "CURRENTLY TRAVELLING",
    "CURRENTLY TRAVELING",

    /* Travel */

    "TRAVELLING STAFF",
    "TRAVELING STAFF",
    "STAFF TRAVELLING",
    "STAFF TRAVELING",
    "WHO IS TRAVELLING",
    "WHO IS TRAVELING",

    /* Patrol */

    "PATROLLING STAFF",
    "STAFF PATROLLING",
    "MOVING PATROL",
    "PATROL TEAM",
    "PATROL STAFF",
    "PATROL MEMBERS",

    /* Vehicle */

    "DRIVING STAFF",
    "RIDING STAFF",
    "WALKING STAFF",
    "STAFF WALKING",
    "STAFF DRIVING",

    /* Report */

    "MOVEMENT REPORT",
    "MOVING STAFF REPORT",

    /* AI Friendly */

    "GIVE MOVING STAFF",
    "GET MOVING STAFF",
    "DISPLAY MOVING STAFF",
    "VIEW MOVING STAFF"

],
 /*----------------------------------
  Stationary Staff
----------------------------------*/

/*----------------------------------
  Stationary Staff
----------------------------------*/

STAFF_STATIONARY: [

    /* Generic */

    "STATIONARY STAFF",
    "STATIONARY STAFF LIST",
    "STATIONARY PEOPLE",
    "STATIONARY OFFICERS",
    "STATIONARY PERSONNEL",
    "STATIONARY EMPLOYEES",

    /* Questions */

    "WHO IS STATIONARY",
    "WHO ARE STATIONARY",
    "WHO IS NOT MOVING",
    "WHO ARE NOT MOVING",
    "WHO IS IDLE",
    "WHO ARE IDLE",
    "WHO IS STOPPED",
    "WHO ARE STOPPED",

    /* Show */

    "SHOW STATIONARY STAFF",
    "SHOW STAFF NOT MOVING",
    "SHOW IDLE STAFF",
    "SHOW STOPPED STAFF",
    "SHOW STATIONARY PEOPLE",

    /* List */

    "LIST STATIONARY STAFF",
    "LIST IDLE STAFF",
    "LIST STOPPED STAFF",
    "LIST STAFF NOT MOVING",

    /* Motion */

    "NOT MOVING",
    "STAFF NOT MOVING",
    "CURRENTLY STATIONARY",
    "CURRENTLY IDLE",
    "CURRENTLY STOPPED",

    /* Position */

    "STATIC STAFF",
    "STATIC TEAM",
    "STAFF STANDING",
    "STAFF WAITING",

    /* Reports */

    "STATIONARY REPORT",
    "STATIONARY STAFF REPORT",
    "IDLE STAFF REPORT",

    /* AI Friendly */

    "GIVE STATIONARY STAFF",
    "GET STATIONARY STAFF",
    "DISPLAY STATIONARY STAFF",
    "VIEW STATIONARY STAFF"

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
