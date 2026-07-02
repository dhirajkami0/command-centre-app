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
        "staffUnavailable"

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

StaffConstants.DESIGNATIONS = Object.freeze({

    FOREST_RANGER:
        "Forest Ranger",

    DEPUTY_RANGER:
        "Deputy Ranger",

    FORESTER:
        "Forester",

    BANASAHAYAK:
        "Banasahayak",

    FOREST_GUARD:
        "Forest Guard",

    WATCHER:
        "Watcher"

});

/*=========================================================
 STAFF STATUS
=========================================================*/

StaffConstants.STATUS = Object.freeze({

    ACTIVE:
        "ACTIVE",

    ENDED:
        "ENDED",

    OFFLINE:
        "OFFLINE"

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
