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
    GG.StaffIntentDefinitions
) {

    console.warn(
        "[GreenGuardAI] Staff Intent Definitions already loaded."
    );

    return;

}

/*=========================================================
 REQUIRE STAFF CONSTANTS
=========================================================*/

if (
    !GG.StaffConstants ||
    !GG.StaffConstants.INTENTS
) {

    console.error(
        "[GreenGuardAI] StaffConstants.INTENTS unavailable."
    );

    return;

}

/*=========================================================
 CANONICAL INTENT DEFINITIONS

 IMPORTANT:

 Keys MUST be the canonical VALUES from
 StaffConstants.INTENTS.

 These definitions are ONLY semantic guidance for AI.

 They DO NOT replace:
 - StaffIntent
 - StaffConstants
 - StaffRouter
 - StaffQuery
=========================================================*/

const Definitions = {

    /*=====================================================
      SEARCH / DIRECTORY
    =====================================================*/

    staffSearch:
        "Search for staff records using general staff-related criteria when no more specific staff lookup intent applies.",

    staffDirectory:
        "List or browse staff members generally, without restricting the request to a specific jurisdiction or designation.",

    staffExists:
        "Determine whether a particular staff member exists in the staff records.",

    staffByName:
        "Find a staff member specifically by their name.",

    staffByPhone:
        "Find or identify a staff member using a phone number as the search input.",

    staffByRole:
        "Find or list staff members having a particular system role.",

    staffByDesignation:
        "Find or list staff members having a particular official designation.",

    staffByLeader:
        "Find staff members associated with or working under a particular team leader.",

    staffByTeam:
        "Find or list staff members belonging to a particular team.",

    staffNearby:
        "Find staff members who are geographically near a specified location or current position.",


    /*=====================================================
      INDIVIDUAL STAFF PROFILE
    =====================================================*/

    staffProfile:
        "Return general profile or identity information about a specific staff member. Use this for broad questions such as who a person is or requests for general details. Do not use when the user specifically wants contact information, posting, designation, location, duty, assignment, or another more specific attribute.",

    staffContact:
        "Return contact or communication information for a specific staff member. Use whenever the user wants to contact, call, phone, reach, communicate with, get in touch with, or communicate directly with a staff member.",

    staffRole:
        "Return the system or organizational role of a specific staff member.",

    staffDesignation:
        "Return the official designation or job title of a specific staff member.",


    /*=====================================================
      POSTING / JURISDICTION
    =====================================================*/

    staffPosting:
        "Return the official posting or assigned jurisdiction of a specific staff member.",

    staffCircle:
        "Return the circle to which a specific staff member is assigned or posted.",

    staffDivision:
        "Return the division to which a specific staff member is assigned or posted.",

    staffRange:
        "Return the range to which a specific staff member is assigned or posted.",

    staffBeat:
        "Return the beat to which a specific staff member is assigned or posted.",


    /*=====================================================
      CURRENT LOCATION
    =====================================================*/

    staffLocation:
        "Return the current, latest, or last known geographic location of a specific staff member. This refers to spatial or GPS location, not official posting.",


    /*=====================================================
      DUTY
    =====================================================*/

    staffDuty:
        "Return general duty information for a specific staff member when the request does not ask for a more specific duty attribute.",

    staffDutyStatus:
        "Determine the current duty status of a specific staff member, such as whether the person is currently on duty.",

    staffDutyType:
        "Return the type or category of duty assigned to or being performed by a specific staff member.",

    staffDutyStarted:
        "Return information about when a specific staff member started duty.",

    staffDutyEnded:
        "Return information about when a specific staff member ended duty.",

    staffDutyActive:
        "Determine whether a specific staff member currently has an active duty session.",

    staffLastDuty:
        "Return information about the most recent or last completed duty of a specific staff member.",


    /*=====================================================
      ASSIGNMENT / TEAM
    =====================================================*/

    staffAssignment:
        "Return assignment information for a specific staff member.",

    staffTeam:
        "Return the team associated with a specific staff member.",

    staffLeader:
        "Return the team leader or leader associated with a specific staff member.",


    /*=====================================================
      GPS / MOVEMENT
    =====================================================*/

    staffSpeed:
        "Return the current or latest recorded movement speed of a specific staff member.",

    staffHeading:
        "Return the current or latest recorded movement heading or direction of a specific staff member.",

    staffAccuracy:
        "Return the GPS accuracy associated with the current or latest recorded position of a specific staff member.",


    /*=====================================================
      STAFF ANALYTICS / PATROL
    =====================================================*/

    staffAnalytics:
        "Return general analytics or operational metrics for a specific staff member.",

    staffDistance:
        "Return the patrol or tracked distance associated with a specific staff member.",

    staffPatrolPoints:
        "Return information about the recorded GPS or patrol track points of a specific staff member.",

    staffPatrolStart:
        "Return when a specific staff member's patrol started.",

    staffPatrolDuration:
        "Return the duration of a specific staff member's patrol.",


    /*=====================================================
      SUMMARY
    =====================================================*/

    staffSummary:
        "Return a summarized overview of staff information.",

    staffJurisdictionSummary:
        "Return a summary of staff grouped, organized, or analyzed by jurisdiction.",

    staffDesignationSummary:
        "Return a summary of staff grouped, organized, or analyzed by designation.",

    staffAggregate:
        "Return aggregated staff information or combined staff statistics when no more specific count or summary intent applies.",


    /*=====================================================
      DIRECTORY BY JURISDICTION
    =====================================================*/

    staffCircleDirectory:
        "List staff members belonging to or posted within a specified circle.",

    staffDivisionDirectory:
        "List staff members belonging to or posted within a specified division.",

    staffRangeDirectory:
        "List staff members belonging to or posted within a specified range.",

    staffBeatDirectory:
        "List staff members belonging to or posted within a specified beat.",

    staffDesignationDirectory:
        "List staff members having a specified designation.",


    /*=====================================================
      COUNTS
    =====================================================*/

    staffCount:
        "Return the total number of staff matching general criteria.",

    staffCircleCount:
        "Return the number of staff belonging to or posted within a specified circle.",

    staffDivisionCount:
        "Return the number of staff belonging to or posted within a specified division.",

    staffRangeCount:
        "Return the number of staff belonging to or posted within a specified range.",

    staffBeatCount:
        "Return the number of staff belonging to or posted within a specified beat.",

    staffDesignationCount:
        "Return the number of staff having a specified designation.",

    staffActiveCount:
        "Return the number of staff currently considered active.",


    /*=====================================================
      ACTIVE / INACTIVE
    =====================================================*/

    staffActiveList:
        "List staff members currently considered active.",

    staffInactiveList:
        "List staff members currently considered inactive.",

    staffStatus:
        "Return the general operational or activity status of a specific staff member when the request is not specifically about duty status.",


    /*=====================================================
      DUTY SUMMARY
    =====================================================*/

    staffDutySummary:
        "Return a summarized overview of staff duty information across multiple staff members or the organization.",


    /*=====================================================
      TEAM LEADERS
    =====================================================*/

    staffTeamLeaderList:
        "List staff members who are team leaders.",


    /*=====================================================
      MOVEMENT STATUS
    =====================================================*/

    staffMoving:
        "Find or list staff members who are currently moving based on available tracking information.",

    staffStationary:
        "Find or list staff members who are currently stationary based on available tracking information.",


    /*=====================================================
      CONTROL ROOM OPERATIONAL QUERIES
    =====================================================*/

    whoIsOnDuty:
        "List or identify staff members who are currently on duty. Use for organization-wide or multi-staff questions such as who is on duty, which staff are on duty, or show staff currently on duty.",

    whoIsPatrolling:
        "List or identify staff members who are currently patrolling. Use for organization-wide or multi-staff questions asking who is presently on patrol or patrolling."

};

/*=========================================================
 FREEZE DEFINITIONS
=========================================================*/

GG.StaffIntentDefinitions =
    Object.freeze(
        Definitions
    );

/*=========================================================
 VALIDATE AGAINST STAFF CONSTANTS

 Every canonical Staff intent should have exactly one
 semantic definition.
=========================================================*/

const canonicalIntents =
    Object.values(
        GG.StaffConstants.INTENTS
    );

const definitionIntents =
    Object.keys(
        GG.StaffIntentDefinitions
    );

/*=========================================================
 FIND MISSING DEFINITIONS
=========================================================*/

const missingDefinitions =
    canonicalIntents.filter(

        function (
            intent
        ) {

            return !Object.prototype.hasOwnProperty.call(

                GG.StaffIntentDefinitions,

                intent

            );

        }

    );

/*=========================================================
 FIND UNKNOWN / EXTRA DEFINITIONS
=========================================================*/

const extraDefinitions =
    definitionIntents.filter(

        function (
            intent
        ) {

            return !canonicalIntents.includes(
                intent
            );

        }

    );

/*=========================================================
 VALIDATION RESULT
=========================================================*/

GG.StaffIntentDefinitionsValidation =
    Object.freeze({

        canonicalCount:
            canonicalIntents.length,

        definitionCount:
            definitionIntents.length,

        missingDefinitions:
            Object.freeze(
                missingDefinitions
            ),

        extraDefinitions:
            Object.freeze(
                extraDefinitions
            ),

        valid:

            missingDefinitions.length === 0 &&

            extraDefinitions.length === 0

    });

/*=========================================================
 LOG VALIDATION
=========================================================*/

if (
    missingDefinitions.length
) {

    console.warn(
        "[GreenGuardAI] Missing Staff Intent Definitions:",
        missingDefinitions
    );

}

if (
    extraDefinitions.length
) {

    console.warn(
        "[GreenGuardAI] Unknown Staff Intent Definitions:",
        extraDefinitions
    );

}

if (
    GG.Config?.DEBUG?.ENABLED
) {

    console.log(
        "[GreenGuardAI] Staff Intent Definitions:",
        GG.StaffIntentDefinitionsValidation
    );

}

})(window);
