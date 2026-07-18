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
    
    STAFF_BY_PHONE: "staffByPhone",
    STAFF_BY_ROLE: "staffByRole",
    STAFF_BY_DESIGNATION: "staffByDesignation",
    STAFF_BY_LEADER: "staffByLeader",
    STAFF_BY_TEAM: "staffByTeam",
STAFF_NEARBY:
    "staffNearby",
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
    
    STAFF_PATROL_DURATION: "staffPatrolDuration",

    /*=========================================================
      SUMMARY
    =========================================================*/

    STAFF_SUMMARY: "staffSummary",
    STAFF_JURISDICTION_SUMMARY: "staffJurisdictionSummary",
    STAFF_DESIGNATION_SUMMARY: "staffDesignationSummary",
STAFF_AGGREGATE: "staffAggregate",
    /*=========================================================
      DIRECTORIES
    =========================================================*/

    STAFF_CIRCLE_DIRECTORY: "staffCircleDirectory",
    STAFF_DIVISION_DIRECTORY: "staffDivisionDirectory",
    STAFF_RANGE_DIRECTORY: "staffRangeDirectory",
    STAFF_BEAT_DIRECTORY: "staffBeatDirectory",
    STAFF_DESIGNATION_DIRECTORY: "staffDesignationDirectory",
    /*=========================================================
      COUNTS
    =========================================================*/

    STAFF_COUNT: "staffCount",

    STAFF_CIRCLE_COUNT: "staffCircleCount",

    STAFF_DIVISION_COUNT: "staffDivisionCount",

    STAFF_RANGE_COUNT: "staffRangeCount",

    STAFF_BEAT_COUNT: "staffBeatCount",

    STAFF_DESIGNATION_COUNT: "staffDesignationCount",
    /*=========================================================
      LIVE STATUS
    =========================================================*/

    STAFF_ACTIVE_COUNT: "staffActiveCount",
    STAFF_ACTIVE_LIST: "staffActiveList",
    STAFF_INACTIVE_LIST: "staffInactiveList",
STAFF_STATUS: "staffStatus",
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
"SEARCH",
"SEARCH STAFF",
"SEARCH FOR",
"SEARCH OFFICER",
"FIND",
"FIND STAFF",
"FIND PERSON",
"FIND OFFICER",
"LOOKUP",
"LOOK UP",
"STAFF LOOKUP",
"LOCATE STAFF",
"LOOK FOR",
"LOOK FOR STAFF",
"STAFF SEARCH"
],
STAFF_NEARBY: [

    "NEAR",

    "NEARBY",

    "NEAREST",

    "CLOSEST",

    "AROUND",

    "AROUND ME",

    "NEAR ME",

    "MY LOCATION",

    "MY CURRENT LOCATION",

    "WHO IS NEAR",

    "WHO IS AROUND",

    "STAFF NEARBY",

    "NEARBY STAFF"

],
STAFF_DIRECTORY: [

    "STAFF DIRECTORY",

    "DIRECTORY",

    "STAFF LIST",

    "LIST STAFF",

    "LIST OF STAFF",

    "ALL STAFF",

    "COMPLETE STAFF LIST",

    "SHOW STAFF DIRECTORY",

    "DISPLAY STAFF DIRECTORY",

    "VIEW STAFF DIRECTORY"

],
/*----------------------------------
  Staff Profile
----------------------------------*/
STAFF_PROFILE: [

    /*----------------------------------
      Primary Business Intent
    ----------------------------------*/

    "PROFILE",
    "STAFF PROFILE",
    "PERSON PROFILE",
    "EMPLOYEE PROFILE",
    "OFFICER PROFILE",
    "USER PROFILE",
    "FULL PROFILE",
    "COMPLETE PROFILE",

    /*----------------------------------
      Identity
    ----------------------------------*/

    "WHO IS",
    "WHO'S",
    "IDENTITY",
    "IDENTIFY",
    "FULL NAME",
    "NAME",

    /*----------------------------------
      Information
    ----------------------------------*/

    "ABOUT",
    "TELL ME ABOUT",
    "INFORMATION",
    "INFO",
    "DETAIL",
    "DETAILS",
    "BACKGROUND",
    "BIO",
    "BIOGRAPHY",

    /*----------------------------------
      Staff Record
    ----------------------------------*/

    "STAFF RECORD",
    "EMPLOYEE RECORD",
    "PERSONNEL RECORD",
    "STAFF DETAILS",
    "EMPLOYEE DETAILS",
    "PERSON DETAILS"

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
      Business Intent
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

    "WHICH DESIGNATION",
    "DESIGNATION OF",
    "RANK OF",
    "TITLE OF",
    "CADRE OF",

    /*----------------------------------
      Forest Department Designations
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

    "RO",
    "RANGE OFFICER",

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

    "ELEPHANT SQUAD"

],
/*----------------------------------
  Permanent Posting
----------------------------------*/
/*----------------------------------
  Official Posting
----------------------------------*/

STAFF_POSTING: [

    "POSTING",
    "POSTED",
    "POST",

    "POSTED AT",
    "POSTED IN",
    "POSTED UNDER",

    "OFFICIAL POSTING",
    "CURRENT POSTING",

    "PERMANENT POSTING",

    "OFFICIAL WORKPLACE",
  

   

    "ADMINISTRATIVE POSTING",

    "OFFICIALLY POSTED",

    "WHERE IS HE POSTED",
    "WHERE IS SHE POSTED",
    "WHERE IS STAFF POSTED",

    "WHERE DOES HE WORK",
    "WHERE DOES SHE WORK",
    "WHERE DOES STAFF WORK",

    "WHERE DOES HE BELONG",
    "WHERE DOES SHE BELONG",
    "WHERE DOES STAFF BELONG",

    "BELONGS TO",

    "POSTING DETAILS",
    "POSTING INFORMATION",

    "OFFICIAL DETAILS",

    "HOME POSTING",

    "PERMANENT POST",

    "POSTING OFFICE",

    "POSTING HQ"

],

/*----------------------------------
  Beat (Administrative)
----------------------------------*/

STAFF_BEAT: [

    "BEAT",

    "FOREST BEAT",

    "BEAT NAME",

    "BEAT OF",

    "WHICH BEAT",

    "WHAT BEAT",

    "POSTED BEAT",

    "OFFICIAL BEAT",

    "ASSIGNED BEAT",

    "BELONGS TO BEAT",

    "BEAT HEADQUARTER",

    "BEAT HQ"

],

/*----------------------------------
  Range (Administrative)
----------------------------------*/

STAFF_RANGE: [

    "RANGE",

    "FOREST RANGE",

    "RANGE NAME",

    "RANGE OF",

    "WHICH RANGE",

    "WHAT RANGE",

    "POSTED RANGE",

    "OFFICIAL RANGE",

    "ASSIGNED RANGE",

    "BELONGS TO RANGE",

    "RANGE OFFICE",

    "RANGE HEADQUARTER",

    "RANGE HQ"

],

/*----------------------------------
  Division (Administrative)
----------------------------------*/

STAFF_DIVISION: [

    "DIVISION",

    "FOREST DIVISION",

    "DIVISION NAME",

    "DIVISION OF",

    "WHICH DIVISION",

    "WHAT DIVISION",

    "POSTED DIVISION",

    "OFFICIAL DIVISION",

    "ASSIGNED DIVISION",

    "BELONGS TO DIVISION",

    "DIVISION OFFICE",

    "DIVISION HEADQUARTER",

    "DIVISION HQ"

],

/*----------------------------------
  Circle (Administrative)
----------------------------------*/

STAFF_CIRCLE: [

    "CIRCLE",

    "FOREST CIRCLE",

    "CIRCLE NAME",

    "CIRCLE OF",

    "WHICH CIRCLE",

    "WHAT CIRCLE",

    "POSTED CIRCLE",

    "OFFICIAL CIRCLE",

    "ASSIGNED CIRCLE",

    "BELONGS TO CIRCLE",

    "CIRCLE OFFICE",

    "CIRCLE HEADQUARTER",

    "CIRCLE HQ"

],

/*----------------------------------
  Live Location
----------------------------------*/
/*----------------------------------
  Live GPS Location Only
----------------------------------*/

STAFF_LOCATION: [

    /*----------------------------------
      Primary
    ----------------------------------*/

    "LOCATION",
    "LOCATE",

    "LIVE LOCATION",
    "CURRENT LOCATION",
    "PRESENT LOCATION",

    "REALTIME LOCATION",
    "REAL TIME LOCATION",

    "LATEST LOCATION",
    "LAST LOCATION",

    /*----------------------------------
      Natural Questions
    ----------------------------------*/

    "WHERE IS",
    "WHERE IS NOW",
    "WHERE IS CURRENTLY",

    "WHERE IS HE NOW",
    "WHERE IS SHE NOW",
    "WHERE ARE THEY NOW",

    "WHERE CAN I FIND",
    "WHERE CAN WE FIND",

    "CURRENTLY WHERE IS",

    /*----------------------------------
      GPS
    ----------------------------------*/

    "GPS",
    "CURRENT GPS",
    "LIVE GPS",

    "GPS LOCATION",
    "GPS POSITION",

    "GPS COORDINATE",
    "GPS COORDINATES",

    "CURRENT COORDINATES",

    "LATITUDE",
    "LONGITUDE",

    "LAT",
    "LON",
    "LONG",

    "LAT LONG",
    "LAT LON",

    "COORDINATE",
    "COORDINATES",

    "MAP POINT",

    "EXACT LOCATION",
    "EXACT POSITION",

    /*----------------------------------
      Position
    ----------------------------------*/

    "CURRENT POSITION",
    "LIVE POSITION",
    "PRESENT POSITION",

    "CURRENT PLACE",
    "CURRENT SPOT",
    "CURRENT POINT",

    /*----------------------------------
      Last Known
    ----------------------------------*/

    "LAST SEEN",

    

    "LAST KNOWN LOCATION",
    "LAST KNOWN POSITION",

    "LAST REPORTED LOCATION",
    "LAST REPORTED POSITION",

    /*----------------------------------
      Tracking
    ----------------------------------*/

    "TRACK",

    "TRACK LOCATION",

    "TRACK POSITION",

    "LIVE TRACK",

    "CURRENT TRACK",

    "TRACK STAFF",

    /*----------------------------------
      Explicit Spatial Questions
    ----------------------------------*/

    "WHICH COMPARTMENT NOW",

    "WHICH BEAT NOW",


    "WHICH DIVISION NOW",

    "CURRENT COMPARTMENT",

    "CURRENT BEAT",

    "CURRENT RANGE",

    "CURRENT DIVISION",

    "LIVE COMPARTMENT",

    "LIVE BEAT",

    "LIVE RANGE",

    "LIVE DIVISION",

    "CURRENTLY IN",

    "CURRENTLY INSIDE",

    "CURRENTLY WITHIN",

    "NOW IN",

    "NOW INSIDE",

    "NOW WITHIN"

],

STAFF_DUTY_STARTED: [

    /*----------------------------------
      Primary Business Intent
    ----------------------------------*/

    "DUTY STARTED",
    "DUTY START TIME",
    "DUTY STARTED AT",

    /*----------------------------------
      Since When
    ----------------------------------*/

    "ON DUTY SINCE",
    "DUTY SINCE",
    "SINCE WHEN ON DUTY",
    "SINCE WHEN STARTED DUTY",

    /*----------------------------------
      Natural Questions
    ----------------------------------*/

    "WHEN DID DUTY START",
    "WHEN WAS DUTY STARTED",
    "WHEN DID HE START DUTY",
    "WHEN DID SHE START DUTY",
    "WHEN DID STAFF START DUTY",

    "WHAT TIME DID DUTY START",
    "WHAT TIME WAS DUTY STARTED",

    /*----------------------------------
      Start Information
    ----------------------------------*/

    "SHOW DUTY START",
    "SHOW DUTY START TIME",

    "GET DUTY START",
    "GET DUTY START TIME",

    "DISPLAY DUTY START",

    "DUTY START DETAILS",
    "DUTY START INFORMATION",

    /*----------------------------------
      Duration
    ----------------------------------*/

    "DUTY DURATION",
    "ON DUTY DURATION",
    "TIME ON DUTY",
    "ELAPSED DUTY TIME",

    "HOW LONG ON DUTY",
    "HOW LONG HAS HE BEEN ON DUTY",
    "HOW LONG HAS SHE BEEN ON DUTY",
    "HOW LONG HAS STAFF BEEN ON DUTY",

    "HOW LONG IS HE ON DUTY",
    "HOW LONG IS SHE ON DUTY",
    "HOW LONG IS STAFF ON DUTY"

],

STAFF_DUTY_ENDED: [

    /*----------------------------------
      Duty End
    ----------------------------------*/

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
    "LAST DUTY TIME",

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

    /*----------------------------------
      Patrol End
    ----------------------------------*/

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

    "PATROL FINISHED AT",
    "PATROL STOPPED AT",
    "PATROL COMPLETED AT",
    "PATROL CLOSED AT",

    "WHEN WAS PATROL COMPLETED",
    "WHEN DID PATROL FINISH",
    "WHEN DID PATROL STOP",

    /*----------------------------------
      Session / Tracking End
    ----------------------------------*/

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

    "PATROL EXIT TIME",

    /*----------------------------------
      Generic End Time
    ----------------------------------*/

    "END TIME",
    "ENDED AT",
    "FINISHED AT",
    "COMPLETED AT",
    "STOPPED AT",
    "CLOSED AT",
    "TERMINATED AT"

],

STAFF_DUTY_STATUS: [

    /*----------------------------------
      ON DUTY
    ----------------------------------*/

    "ON DUTY",
    "IS ON DUTY",
    "ON DUTY NOW",
    "CURRENTLY ON DUTY",
    "IS CURRENTLY ON DUTY",
    "STILL ON DUTY",

    /*----------------------------------
      OFF DUTY
    ----------------------------------*/

    "OFF DUTY",
    "IS OFF DUTY",
    "CURRENTLY OFF DUTY",
    "OFF DUTY NOW",

    /*----------------------------------
      DUTY STATUS
    ----------------------------------*/

    "DUTY STATUS",
    "CURRENT DUTY STATUS",
    "SHOW DUTY STATUS",

    /*----------------------------------
      CURRENT DUTY
    ----------------------------------*/

    "CURRENT DUTY",
    "PRESENT DUTY",

    "TODAY DUTY",
    "TODAYS DUTY",
    "TODAY'S DUTY",
    "DUTY TODAY",

    /*----------------------------------
      ACTIVE
    ----------------------------------*/

    "DUTY ACTIVE",
    "ACTIVE DUTY",
    "IS DUTY ACTIVE",

    /*----------------------------------
      DUTY ON
    ----------------------------------*/

    "DUTY ON",
    "IS DUTY ON",
    "DUTY IS ON",

    /*----------------------------------
      LIVE
    ----------------------------------*/

    "LIVE DUTY",
    "LIVE ON DUTY",

    /*----------------------------------
      EXPLICIT BUSINESS
    ----------------------------------*/

    "ACTIVE ON DUTY",
    "WORKING ON DUTY"

],


/*----------------------------------
  Operational Assignment
----------------------------------*/

STAFF_ASSIGNMENT: [

    /*----------------------------------
      Assignment
    ----------------------------------*/

    "ASSIGNED",
    "ASSIGNMENT",
    "ASSIGNED DUTY",
    "CURRENT ASSIGNMENT",
    "TODAY ASSIGNMENT",
    "ACTIVE ASSIGNMENT",

    /*----------------------------------
      Duty Type
    ----------------------------------*/

    "DUTY TYPE",
    "TYPE OF DUTY",
    "CURRENT DUTY TYPE",
    "WHAT DUTY",
    "WHICH DUTY",
    "WHAT IS DUTY TYPE",

    
    

    "ASSIGNMENT TYPE",

    "WORK TYPE",

    "PATROL TYPE",

    "DUTY MODE",

    "PATROL MODE",

    "WORK MODE",

    "FIELD DUTY",

    /*----------------------------------
      Deputation
    ----------------------------------*/

    "DEPUTED",
    "DEPUTATION",
    "WHERE DEPUTED",
    "WHERE IS DEPUTED",
    "WHERE WAS DEPUTED",
    "WHERE CURRENTLY DEPUTED",

    /*----------------------------------
      Assignment Location
    ----------------------------------*/

    "WHERE ASSIGNED",
    "WHERE IS ASSIGNED",
    "ASSIGNED AREA",
    "ASSIGNED LOCATION",
    "ASSIGNED PLACE",
    "ASSIGNED COMPARTMENT",
   
   
  

    /*----------------------------------
      Duty Area
    ----------------------------------*/

    "DUTY AREA",
    "DUTY LOCATION",
    "DUTY COMPARTMENT",
    "DUTY BEAT",
    "DUTY RANGE",
    "DUTY DIVISION",

    /*----------------------------------
      Deployment
    ----------------------------------*/

    "DEPLOYED",
    "DEPLOYMENT",
    "DEPLOYED AREA",
    "DEPLOYED LOCATION",
    "DEPLOYED COMPARTMENT",
    "DEPLOYED BEAT",
    "DEPLOYED RANGE",
    "DEPLOYED DIVISION",

    /*----------------------------------
      Work Area
    ----------------------------------*/

    "WORK AREA",
    "WORK LOCATION",
    "WORK PLACE",
    "WORKING AREA",
    "WORKING LOCATION",
    "WORKING IN",
    "CURRENT WORK AREA",

    /*----------------------------------
      Compartment Queries
    ----------------------------------*/

    "WHICH COMPARTMENT",
    "WHICH COMPARTMENT ASSIGNED",
    "WHICH COMPARTMENT DEPLOYED",
    "IN WHICH COMPARTMENT",

    /*----------------------------------
      Current Operational Context
    ----------------------------------*/

    "CURRENT TASK",
    "CURRENT OPERATION",
    "CURRENT MISSION",
    "CURRENT DEPLOYMENT",
    "CURRENT DUTY LOCATION",
    "CURRENT DUTY AREA",
    "CURRENT WORK",

    /*----------------------------------
      Explicit Duty Categories
    ----------------------------------*/

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

WHO_IS_PATROLLING: [

    "WHO IS PATROLLING",

    "WHO ARE PATROLLING",

    "WHO IS ON PATROL",

    "WHO ARE ON PATROL",

    "WHO IS OUT ON PATROL",

    "WHO ARE OUT ON PATROL"

],



STAFF_TEAM: [

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

STAFF_LEADER: [
"LEADER",
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



STAFF_DISTANCE: [
"DISTANCE",
"PATROL DISTANCE",
"TOTAL DISTANCE",
"DISTANCE COVERED",
"TOTAL DISTANCE COVERED",
"COVERED DISTANCE",
"TRAVEL DISTANCE",
"MOVEMENT DISTANCE",
"HOW FAR",
"HOW FAR DID",
"HOW MUCH DISTANCE",
"HOW MUCH DISTANCE COVERED",
"HOW MUCH HAS",
"HOW FAR HAS",
"WHAT DISTANCE",
"WHAT IS THE DISTANCE",
"PATROL LENGTH",
"PATROL ROUTE LENGTH",
"PATROL COVERAGE DISTANCE",
"DISTANCE REPORT",
"PATROL DISTANCE REPORT",
"DISTANCE SUMMARY",
"PATROL DISTANCE SUMMARY",
"MOST DISTANCE",
"MAX DISTANCE",
"LONGEST DISTANCE",
"LONGEST PATROL",
"TOP DISTANCE",
"SHOW DISTANCE",
"SHOW PATROL DISTANCE",
"SHOW DISTANCE COVERED",
"LIST DISTANCE",
"LIST PATROL DISTANCE",
"DISPLAY DISTANCE",
"DISPLAY PATROL DISTANCE",
"VIEW DISTANCE",
"VIEW PATROL DISTANCE",
"GET DISTANCE",
"GET PATROL DISTANCE",
"GIVE DISTANCE",
"GIVE PATROL DISTANCE",
"CURRENT DISTANCE",
"CURRENT PATROL DISTANCE"
],

STAFF_PATROL_POINTS: [
"POINT",
"POINTS",
"TRACK POINT",
"TRACK POINTS",
"LOCATION POINT",
"LOCATION POINTS",
"PATROL POINT",
"PATROL POINTS",
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
"TRACK POINT COUNT",
"PATROL POINT COUNT",
"NUMBER OF POINTS",
"TOTAL POINTS",
"TOTAL TRACK POINTS",
"HOW MANY POINTS",
"HOW MANY TRACK POINTS",
"HOW MANY PATROL POINTS",
"SHOW PATROL POINTS",
"SHOW TRACK POINTS",
"GET PATROL POINTS",
"DISPLAY PATROL POINTS",
"PATROL POINT DETAILS",
"TRACK POINT DETAILS",
"PATROL RECORD",
"PATROL RECORDS",
"RECORDED POINTS",
"CAPTURED POINTS",
"LOGGED POINTS",
"SAMPLED POINTS",
"TRACKING POINTS",
"PATROL SAMPLES"
],

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
"START TIME",
"STARTED AT",
"PATROL COMMENCED",
"COMMENCED PATROL",
"PATROL INITIATED",
"PATROL INITIATION",
"PATROL LAUNCHED"
],



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

"SESSION LENGTH",
"TRACK LENGTH",
"TOTAL PATROL TIME",
"TOTAL TRACK TIME",
"TOTAL SESSION TIME",
"ACTIVE PATROL TIME",
"PATROL ELAPSED TIME"
],

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

STAFF_ANALYTICS: [
"ANALYTICS",
"STAFF ANALYTICS",
"ANALYTICS REPORT",
"ANALYTICS SUMMARY",
"STAFF ANALYTICS REPORT",
"STAFF ANALYTICS SUMMARY",
"PERFORMANCE",
"PERFORMANCE REPORT",
"PERFORMANCE SUMMARY",
"STAFF PERFORMANCE",
"STAFF PERFORMANCE REPORT",
"DASHBOARD",
"ANALYTICS DASHBOARD",
"STAFF DASHBOARD",
"PERFORMANCE DASHBOARD",
"INSIGHTS",
"ANALYTICS INSIGHTS",
"PERFORMANCE INSIGHTS",
"STAFF INSIGHTS",
"STAFF REPORTS",
"SHOW ANALYTICS",
"VIEW ANALYTICS",
"DISPLAY ANALYTICS",
"OPEN ANALYTICS",
"GIVE ANALYTICS",
"CURRENT ANALYTICS"
],

STAFF_SUMMARY: [

    /*----------------------------------
      Primary Summary
    ----------------------------------*/

    "STAFF SUMMARY",
    "SUMMARY OF STAFF",
    "OVERALL STAFF SUMMARY",
    "STAFF OVERVIEW",
    "OVERALL OVERVIEW",
    "GENERAL SUMMARY",
    "GENERAL OVERVIEW",

    /*----------------------------------
      Current Summary
    ----------------------------------*/

    "CURRENT STAFF SUMMARY",
    "CURRENT SUMMARY",
    "CURRENT OVERVIEW",
    "LIVE STAFF SUMMARY",
    "LIVE SUMMARY",
    "LIVE OVERVIEW",
    "REALTIME SUMMARY",
    "REAL TIME SUMMARY",

    /*----------------------------------
      Staff Status
    ----------------------------------*/

    "STAFF STATUS",
    "STAFF STATUS SUMMARY",
    "STAFF STATUS OVERVIEW",
    "CURRENT STAFF STATUS",
    "OVERALL STAFF STATUS",

    /*----------------------------------
      Workforce Overview
    ----------------------------------*/

    "WORKFORCE SUMMARY",
    "WORKFORCE OVERVIEW",
    "PERSONNEL SUMMARY",
    "PERSONNEL OVERVIEW",
    "EMPLOYEE SUMMARY",
    "EMPLOYEE OVERVIEW",
    "OFFICER SUMMARY",
    "OFFICER OVERVIEW",

    /*----------------------------------
      Summary Report
    ----------------------------------*/

    "SUMMARY REPORT",
    "STAFF SUMMARY REPORT",
    "STAFF OVERVIEW REPORT",
    "STAFF STATUS REPORT",
    "CURRENT STAFF REPORT",
    "LIVE STAFF REPORT",
    "WORKFORCE REPORT",
    "PERSONNEL REPORT",

    /*----------------------------------
      Dashboard
    ----------------------------------*/

    "DASHBOARD SUMMARY",
    
    "STAFF SNAPSHOT",
    "STAFF HEALTH",
    "WORKFORCE SNAPSHOT"

],

STAFF_JURISDICTION_SUMMARY: [
"JURISDICTION SUMMARY",
"JURISDICTION REPORT",
"JURISDICTION OVERVIEW",
"JURISDICTION STATUS",
"STAFF JURISDICTION SUMMARY",
"CIRCLE SUMMARY",
"CIRCLE REPORT",
"CIRCLE OVERVIEW",
"SUMMARY OF CIRCLE",
"SHOW CIRCLE SUMMARY",
"LIST CIRCLE SUMMARY",
"DIVISION SUMMARY",
"DIVISION REPORT",
"DIVISION OVERVIEW",
"SUMMARY OF DIVISION",
"SHOW DIVISION SUMMARY",
"LIST DIVISION SUMMARY",
"RANGE SUMMARY",
"RANGE REPORT",
"RANGE OVERVIEW",
"SUMMARY OF RANGE",
"SHOW RANGE SUMMARY",
"LIST RANGE SUMMARY",
"BEAT SUMMARY",
"BEAT REPORT",
"BEAT OVERVIEW",
"SUMMARY OF BEAT",
"SHOW BEAT SUMMARY",
"LIST BEAT SUMMARY",
"COMPARTMENT SUMMARY",
"COMPARTMENT REPORT",
"SUMMARY OF COMPARTMENT",
"SHOW COMPARTMENT SUMMARY",
"HOW MANY STAFF IN EACH DIVISION",
"HOW MANY STAFF IN EACH RANGE",
"HOW MANY STAFF IN EACH BEAT",
"HOW MANY STAFF IN EACH CIRCLE",
"STAFF BY DIVISION",
"STAFF BY RANGE",
"STAFF BY BEAT",
"STAFF BY CIRCLE",
"DIVISION WISE SUMMARY",
"RANGE WISE SUMMARY",
"BEAT WISE WISE SUMMARY",
"CIRCLE WISE SUMMARY",
"DIVISION WISE REPORT",
"RANGE WISE REPORT",
"BEAT WISE REPORT",
"CIRCLE WISE REPORT",
"GIVE DIVISION SUMMARY",
"GIVE RANGE SUMMARY",
"GIVE BEAT SUMMARY",
"GIVE CIRCLE SUMMARY",
"CURRENT DIVISION SUMMARY",
"CURRENT RANGE SUMMARY",
"CURRENT BEAT SUMMARY",
"CURRENT CIRCLE SUMMARY"
],

STAFF_DESIGNATION_SUMMARY: [
"DESIGNATION SUMMARY",
"DESIGNATION REPORT",
"DESIGNATION OVERVIEW",
"DESIGNATION STATUS",
"STAFF DESIGNATION SUMMARY",
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
"DESIGNATION WISE SUMMARY",
"DESIGNATION WISE REPORT",
"DESIGNATION STATUS REPORT",
"STAFF DESIGNATION REPORT",
"SHOW DESIGNATION REPORT",
"SHOW DESIGNATION OVERVIEW",
"SHOW DESIGNATION STATUS",
"LIST DESIGNATIONS",
"LIST STAFF DESIGNATIONS",
"LIST DESIGNATION SUMMARY",
"DISPLAY DESIGNATION SUMMARY",
"DISPLAY DESIGNATION REPORT",
"VIEW DESIGNATION SUMMARY",
"VIEW DESIGNATION REPORT",
"GET DESIGNATION SUMMARY",
"GET DESIGNATION REPORT",
"GIVE DESIGNATION SUMMARY",
"GIVE DESIGNATION REPORT",
"CURRENT DESIGNATION SUMMARY",
"CURRENT DESIGNATION REPORT"
],

STAFF_CIRCLE_DIRECTORY: [
"CIRCLE DIRECTORY",
"DIRECTORY OF CIRCLES",
"CIRCLE LIST",
"CIRCLES",
"ALL CIRCLES",
"SHOW CIRCLES",
"LIST CIRCLES",
"WHAT CIRCLES",
"WHICH CIRCLES",
"WHAT ARE THE CIRCLES",
"WHICH ARE THE CIRCLES",
"SHOW CIRCLE DIRECTORY",
"SHOW ALL CIRCLES",
"SHOW CIRCLE LIST",
"SHOW FOREST CIRCLES",
"LIST CIRCLE DIRECTORY",
"LIST ALL CIRCLES",
"LIST FOREST CIRCLES",
"DISPLAY CIRCLE DIRECTORY",
"DISPLAY CIRCLES",
"VIEW CIRCLE DIRECTORY",
"VIEW CIRCLES",
"GET CIRCLE DIRECTORY",
"GET CIRCLES",

"CIRCLE DIRECTORY REPORT",
"GIVE CIRCLE DIRECTORY",
"GIVE CIRCLE LIST",
"CURRENT CIRCLES"
],

STAFF_DIVISION_DIRECTORY: [
"DIVISION DIRECTORY",
"DIVISION LIST",
"DIVISION STAFF",
"DIVISION PERSONNEL",
"DIVISION OFFICERS",
"DIVISION EMPLOYEES",
"DIVISION WORKFORCE",
"DIVISION DIRECTORY REPORT",
"COMPLETE DIVISION DIRECTORY",
"STAFF DIRECTORY OF DIVISION",
"STAFF LIST OF DIVISION",
"STAFF OF DIVISION",
"STAFF UNDER DIVISION",
"STAFF IN DIVISION",
"OFFICERS IN DIVISION",
"EMPLOYEES IN DIVISION",
"PERSONNEL IN DIVISION",
"WHO IS IN DIVISION",
"WHO ARE IN DIVISION",
"WHO WORKS IN DIVISION",
"LIST DIVISION STAFF",
"LIST STAFF OF DIVISION",
"LIST STAFF IN DIVISION",
"LIST STAFF UNDER DIVISION",
"LIST ALL STAFF IN DIVISION",
"LIST OFFICERS IN DIVISION",
"LIST EMPLOYEES IN DIVISION",
"SHOW DIVISION STAFF",
"SHOW STAFF OF DIVISION",
"SHOW STAFF IN DIVISION",
"SHOW STAFF UNDER DIVISION",
"SHOW ALL STAFF IN DIVISION",
"SHOW OFFICERS IN DIVISION",
"SHOW EMPLOYEES IN DIVISION",
"DISPLAY DIVISION STAFF",
"DISPLAY STAFF OF DIVISION",
"VIEW DIVISION STAFF",
"VIEW STAFF OF DIVISION",
"GET DIVISION STAFF",
"GET STAFF OF DIVISION",
"OPEN DIVISION DIRECTORY",
"GIVE DIVISION DIRECTORY",
"GIVE DIVISION STAFF",
"CURRENT DIVISION STAFF"
],

STAFF_RANGE_DIRECTORY: [

    "RANGE DIRECTORY",

    "RANGE STAFF DIRECTORY",

    "DIRECTORY OF RANGE",

    "STAFF DIRECTORY OF RANGE",

    "COMPLETE RANGE DIRECTORY",

    "CURRENT RANGE DIRECTORY",

    "LIST STAFF OF RANGE",

    "LIST STAFF IN RANGE",

    "LIST STAFF UNDER RANGE",

    "LIST ALL STAFF IN RANGE",

    "LIST OFFICERS IN RANGE",

    "LIST EMPLOYEES IN RANGE",

    "LIST PERSONNEL IN RANGE",

    "DISPLAY RANGE DIRECTORY",

    "VIEW RANGE DIRECTORY",

    "OPEN RANGE DIRECTORY",

    "GIVE RANGE DIRECTORY"

],

STAFF_BEAT_DIRECTORY: [
"BEAT DIRECTORY",
"BEAT LIST",
"BEAT STAFF",
"BEAT PERSONNEL",
"BEAT OFFICERS",
"BEAT EMPLOYEES",
"BEAT WORKFORCE",
"BEAT DIRECTORY REPORT",
"COMPLETE BEAT DIRECTORY",
"STAFF DIRECTORY OF BEAT",
"STAFF LIST OF BEAT",
"STAFF OF BEAT",
"STAFF UNDER BEAT",
"STAFF IN BEAT",
"OFFICERS IN BEAT",
"EMPLOYEES IN BEAT",
"PERSONNEL IN BEAT",
"WHO IS IN BEAT",
"WHO ARE IN BEAT",
"WHO WORKS IN BEAT",
"LIST BEAT STAFF",
"LIST STAFF OF BEAT",
"LIST STAFF IN BEAT",
"LIST STAFF UNDER BEAT",
"LIST ALL STAFF IN BEAT",
"LIST OFFICERS IN BEAT",
"LIST EMPLOYEES IN BEAT",
"SHOW BEAT STAFF",
"SHOW STAFF OF BEAT",
"SHOW STAFF UNDER BEAT",
"SHOW STAFF IN BEAT",
"SHOW ALL STAFF IN BEAT",
"SHOW OFFICERS IN BEAT",
"SHOW EMPLOYEES IN BEAT",
"DISPLAY BEAT STAFF",
"DISPLAY STAFF OF BEAT",
"VIEW BEAT STAFF",
"VIEW STAFF OF BEAT",
"GET BEAT STAFF",
"GET STAFF OF BEAT",
"OPEN BEAT DIRECTORY",
"GIVE BEAT DIRECTORY",
"GIVE BEAT STAFF",
"CURRENT BEAT STAFF"
],

STAFF_DESIGNATION_DIRECTORY: [

    /*----------------------------------
      Generic Directory
    ----------------------------------*/

    "DESIGNATION DIRECTORY",
    "DIRECTORY BY DESIGNATION",

    "STAFF BY DESIGNATION",
    "STAFF OF DESIGNATION",
    "STAFF UNDER DESIGNATION",
    "STAFF IN DESIGNATION",

    "STAFF OF",
    "STAFF UNDER",
    "STAFF IN",

    /*----------------------------------
      Forest Ranger (FR)
    ----------------------------------*/

    "FR",
    "FR LIST",

    "SHOW FR",
    "LIST FR",
    "VIEW FR",
    "DISPLAY FR",

    "FOREST RANGER",
    "FOREST RANGERS",

    "SHOW FOREST RANGER",
    "SHOW FOREST RANGERS",

    "LIST FOREST RANGER",
    "LIST FOREST RANGERS",

    "VIEW FOREST RANGER",
    "VIEW FOREST RANGERS",

    "FOREST RANGER LIST",

    "LIST OF FOREST RANGERS",

    "STAFF OF FR",
    "STAFF OF FOREST RANGER",

    /*----------------------------------
      Forester
    ----------------------------------*/

    "FORESTER",
    "FORESTERS",

    "SHOW FORESTER",
    "SHOW FORESTERS",

    "LIST FORESTER",
    "LIST FORESTERS",

    "VIEW FORESTER",
    "VIEW FORESTERS",

    "FORESTER LIST",

    "LIST OF FORESTERS",

    "STAFF OF FORESTER",

    /*----------------------------------
      Beat Supervisor
    ----------------------------------*/

    "BEAT SUPERVISOR",
    "BEAT SUPERVISORS",

    "SHOW BEAT SUPERVISOR",
    "SHOW BEAT SUPERVISORS",

    "LIST BEAT SUPERVISOR",
    "LIST BEAT SUPERVISORS",

    "VIEW BEAT SUPERVISOR",
    "VIEW BEAT SUPERVISORS",

    "BEAT SUPERVISOR LIST",

    /*----------------------------------
      Assistant Surveyor
    ----------------------------------*/

    "AS",

    "SHOW AS",
    "LIST AS",
    "VIEW AS",

    "AS LIST",

    "STAFF OF AS",

    /*----------------------------------
      ADFO
    ----------------------------------*/

    "ADFO",

    "SHOW ADFO",
    "LIST ADFO",
    "VIEW ADFO",

    "ADFO LIST",

    "LIST OF ADFO",

    "STAFF OF ADFO",

    /*----------------------------------
      DFO
    ----------------------------------*/

    "DFO",

    "SHOW DFO",
    "LIST DFO",
    "VIEW DFO",

    "DFO LIST",

    "LIST OF DFO",

    "STAFF OF DFO",

    /*----------------------------------
      Range Officer
    ----------------------------------*/

    "RO",

    "RANGE OFFICER",
    "RANGE OFFICERS",

    "SHOW RANGE OFFICER",
    "SHOW RANGE OFFICERS",

    "LIST RANGE OFFICER",
    "LIST RANGE OFFICERS",

    "VIEW RANGE OFFICER",
    "VIEW RANGE OFFICERS",

    "RANGE OFFICER LIST",

    "STAFF OF RANGE OFFICER",

    /*----------------------------------
      Deputy Range Officer
    ----------------------------------*/

    "DRO",

    "SHOW DRO",
    "LIST DRO",
    "VIEW DRO",

    "DRO LIST",

    "STAFF OF DRO",

    /*----------------------------------
      Driver
    ----------------------------------*/

    "DRIVER",
    "DRIVERS",

    "SHOW DRIVER",
    "SHOW DRIVERS",

    "LIST DRIVER",
    "LIST DRIVERS",

    "VIEW DRIVER",
    "VIEW DRIVERS",

    "DRIVER LIST",

    "STAFF OF DRIVER",

    /*----------------------------------
      Daily Labour
    ----------------------------------*/

    "DL",

    "DAILY LABOUR",
    "DAILY LABOURER",
    "DAILY WAGE",
    "CASUAL LABOUR",

    "SHOW DAILY LABOUR",
    "LIST DAILY LABOUR",
    "VIEW DAILY LABOUR",

    "DL LIST",

    "STAFF OF DL",

    /*----------------------------------
      Banasahayak
    ----------------------------------*/

    "BS",

    "BANASAHAYAK",
    "BANASAYAHAK",
    "BANASAHAYK",

    "SHOW BANASAHAYAK",
    "LIST BANASAHAYAK",
    "VIEW BANASAHAYAK",

    "BS LIST",

    "STAFF OF BS",

    /*----------------------------------
      Forest Volunteer
    ----------------------------------*/

    "FV",

    "FOREST VOLUNTEER",
    "FOREST VOLUNTEERS",

    "SHOW FOREST VOLUNTEER",
    "SHOW FOREST VOLUNTEERS",

    "LIST FOREST VOLUNTEER",
    "LIST FOREST VOLUNTEERS",

    "VIEW FOREST VOLUNTEER",
    "VIEW FOREST VOLUNTEERS",

    "VOLUNTEER LIST",

    "STAFF OF FV",

    /*----------------------------------
      Watcher
    ----------------------------------*/

    "WATCHER",
    "WATCHERS",

    "SHOW WATCHER",
    "SHOW WATCHERS",

    "LIST WATCHER",
    "LIST WATCHERS",

    "VIEW WATCHER",
    "VIEW WATCHERS",

    "STAFF OF WATCHER",

    /*----------------------------------
      Mahout
    ----------------------------------*/

    "MAHOUT",
    "MAHOUTS",

    "SHOW MAHOUT",
    "SHOW MAHOUTS",

    "LIST MAHOUT",
    "LIST MAHOUTS",

    "VIEW MAHOUT",
    "VIEW MAHOUTS",

    "STAFF OF MAHOUT",

    /*----------------------------------
      Elephant Squad
    ----------------------------------*/

    "ELEPHANT SQUAD",

    "SHOW ELEPHANT SQUAD",

    "LIST ELEPHANT SQUAD",

    "VIEW ELEPHANT SQUAD",

    "STAFF OF ELEPHANT SQUAD"

],
/*----------------------------------
  COUNTS
----------------------------------*/

STAFF_COUNT: [

    /*----------------------------------
      Staff
    ----------------------------------*/

    "STAFF COUNT",
    "TOTAL STAFF",
    "NUMBER OF STAFF",
    "HOW MANY STAFF",
    "COUNT OF STAFF",
    "COUNT STAFF",
    "TOTAL STAFF COUNT",
    "STAFF HEADCOUNT",
    "STAFF STRENGTH",
    "TOTAL STAFF STRENGTH",

    /*----------------------------------
      Personnel
    ----------------------------------*/

    "PERSONNEL COUNT",
    "TOTAL PERSONNEL",
    "NUMBER OF PERSONNEL",
    "HOW MANY PERSONNEL",
    "PERSONNEL STRENGTH",

    /*----------------------------------
      Employees
    ----------------------------------*/

    "EMPLOYEE COUNT",
    "TOTAL EMPLOYEES",
    "NUMBER OF EMPLOYEES",
    "HOW MANY EMPLOYEES",

    /*----------------------------------
      Officers
    ----------------------------------*/

    "OFFICER COUNT",
    "TOTAL OFFICERS",
    "NUMBER OF OFFICERS",
    "HOW MANY OFFICERS",

    /*----------------------------------
      Workforce
    ----------------------------------*/

    "WORKFORCE COUNT",
    "TOTAL WORKFORCE",
    "NUMBER OF WORKFORCE",

    /*----------------------------------
      Human Resource
    ----------------------------------*/

    "MANPOWER COUNT",
    "TOTAL MANPOWER",
    "NUMBER OF MANPOWER",

    /*----------------------------------
      Availability
    ----------------------------------*/

    "AVAILABLE STAFF",
    "AVAILABLE STAFF COUNT",
    "AVAILABLE PERSONNEL",
    "AVAILABLE PERSONNEL COUNT",
    "AVAILABLE OFFICERS",
    "AVAILABLE OFFICER COUNT"

],

STAFF_CIRCLE_COUNT: [

    "CIRCLE COUNT",
    "COUNT IN CIRCLE",
    "TOTAL IN CIRCLE",
    "HOW MANY IN CIRCLE",
    "NUMBER OF STAFF IN CIRCLE",
    "CIRCLE STRENGTH"

],

STAFF_DIVISION_COUNT: [

    "DIVISION COUNT",
    "COUNT IN DIVISION",
    "TOTAL IN DIVISION",
    "HOW MANY IN DIVISION",
    "NUMBER OF STAFF IN DIVISION",
    "DIVISION STRENGTH"

],

STAFF_RANGE_COUNT: [

    "RANGE COUNT",
    "COUNT IN RANGE",
    "TOTAL IN RANGE",
    "HOW MANY IN RANGE",
    "NUMBER OF STAFF IN RANGE",
    "RANGE STRENGTH"

],

STAFF_BEAT_COUNT: [

    "BEAT COUNT",
    "COUNT IN BEAT",
    "TOTAL IN BEAT",
    "HOW MANY IN BEAT",
    "NUMBER OF STAFF IN BEAT",
    "BEAT STRENGTH"

],


WHO_IS_ON_DUTY: [

    "WHO IS ON DUTY",

    "WHO ARE ON DUTY",

    "WHO IS CURRENTLY ON DUTY",

    "WHO ARE CURRENTLY ON DUTY",

    "WHO IS WORKING NOW",

    "WHO ARE WORKING NOW"

],

/*----------------------------------
  Active Staff List
----------------------------------*/

STAFF_ACTIVE_LIST: [

    "ACTIVE STAFF",

    "ACTIVE STAFF LIST",

    "ON DUTY STAFF",

    "ON DUTY STAFF LIST",

    "CURRENT ACTIVE STAFF",

    "CURRENTLY ACTIVE STAFF",

    "ACTIVE PERSONNEL",

    "ACTIVE OFFICERS"

],

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

    "INACTIVE STAFF",

    "INACTIVE STAFF LIST",

    "OFF DUTY STAFF",

    "OFF DUTY STAFF LIST",

    "NOT ON DUTY STAFF",

    "CURRENT INACTIVE STAFF",

    "INACTIVE PERSONNEL",

    "INACTIVE OFFICERS"

],
STAFF_DUTY_SUMMARY: [
"DUTY SUMMARY",
"STAFF DUTY SUMMARY",
"CURRENT DUTY SUMMARY",
"TODAY DUTY SUMMARY",
"DUTY OVERVIEW",

"DUTY STATUS SUMMARY",
"DUTY REPORT",
"STAFF DUTY REPORT",
"CURRENT DUTY REPORT",
"WHAT IS THE DUTY STATUS",
"WHAT IS CURRENT DUTY STATUS",
"WHAT DUTY IS RUNNING",
"WHICH DUTIES ARE ACTIVE",
"WHAT STAFF ARE ON DUTY",
"SHOW DUTY SUMMARY",
"SHOW STAFF DUTY",
"SHOW DUTY REPORT",
"SHOW CURRENT DUTY",

"SHOW ACTIVE DUTY",
"LIST DUTY",
"LIST DUTY SUMMARY",
"LIST STAFF DUTY",
"LIST ACTIVE DUTY",
"LIST CURRENT DUTY",
"DISPLAY DUTY SUMMARY",
"DISPLAY DUTY REPORT",
"VIEW DUTY SUMMARY",
"VIEW DUTY REPORT",
"GET DUTY SUMMARY",
"GET DUTY REPORT",
"PATROL DUTY",
"PATROL DUTY SUMMARY",
"ELEPHANT PATROL DUTY",
"CURRENT PATROL DUTY",
"TODAY DUTY REPORT",
"LIVE DUTY REPORT",
"ACTIVE DUTY REPORT",
"DUTY STATUS REPORT",
"GIVE DUTY SUMMARY",
"GIVE DUTY REPORT"

],

STAFF_TEAM_LEADER_LIST: [

    "TEAM LEADER LIST",

    "TEAM LEADERS",

    "TEAM LEADER DIRECTORY",

    "CURRENT TEAM LEADERS"

],

STAFF_MOVING: [

    "MOVING STAFF",

    "MOVING STAFF LIST",

    "STAFF MOVING",

    "CURRENTLY MOVING STAFF",

    "MOVING PERSONNEL",

    "MOVING OFFICERS"

],
STAFF_STATIONARY: [

    "STATIONARY STAFF",

    "STATIONARY STAFF LIST",

    "STOPPED STAFF",

    "IDLE STAFF",

    "NOT MOVING STAFF",

    "CURRENTLY STATIONARY STAFF"

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
