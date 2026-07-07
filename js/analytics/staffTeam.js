(function (window) {

"use strict";

/*=========================================================
 GREENGUARD AI
=========================================================*/

const GG =
    window.GreenGuardAI =
    window.GreenGuardAI || {};

/*=========================================================
 DEPENDENCIES
=========================================================*/

const StaffConstants =
    GG.StaffConstants;

const StaffEntities =
    GG.StaffEntities;

if (

    !StaffConstants

) {

    throw new Error(

        "StaffConstants not loaded."

    );

}

if (

    !StaffEntities

) {

    throw new Error(

        "StaffEntities not loaded."

    );

}

/*=========================================================
 MODULE
=========================================================*/

const StaffTeam = {};

/*=========================================================
 VERSION
=========================================================*/

StaffTeam.VERSION =

    "1.0.0";

/*=========================================================
 STATUS
=========================================================*/

StaffTeam.loaded =

    false;

StaffTeam.loading =

    false;

/*=========================================================
 CACHE
=========================================================*/

StaffTeam.cache =

    new Map();

StaffTeam.lastRequest =

    null;

StaffTeam.lastResult =

    null;

/*=========================================================
 CLEAR CACHE
=========================================================*/

StaffTeam.clearCache = function () {

    StaffTeam.cache.clear();

};

/*=========================================================
 CREATE RESPONSE
=========================================================*/

StaffTeam.createResponse = function (

    request = {}

) {

    return {

        success:

            false,

        source:

            "LOCAL",

        module:

            "StaffTeam",

        intent:

            StaffConstants.INTENTS.STAFF_TEAM,

        confidence:

            request.confidence ||

            0,

        query:

            request.originalQuery ||

            "",

        staff:

            null,

        team:

            null,

        message:

            "",

        warnings:

            [],

        errors:

            [],

        metadata: {

            version:

                StaffTeam.VERSION,

            createdAt:

                Date.now(),

            executionTime:

                0

        }

    };

};

/*=========================================================
 INITIALIZE
=========================================================*/

StaffTeam.initialize = function () {

    StaffTeam.loaded =

        true;

    StaffTeam.loading =

        false;

    return true;

};/*=========================================================
 QUERY STAFF TEAM
=========================================================*/

StaffTeam.queryStaffTeam = function (

    request

) {

    const started =

        Date.now();

    /*----------------------------------
      Create Response
    ----------------------------------*/

    const response =

        StaffTeam.createResponse(

            request

        );

    StaffTeam.lastRequest =

        request;

    /*----------------------------------
      Find Staff
    ----------------------------------*/

    const staff =

        StaffTeam.findStaff(

            request

        );

    if (

        !staff

    ) {

        response.message =

            "Staff not found.";

        response.metadata.executionTime =

            Date.now() -

            started;

        return response;

    }

    /*----------------------------------
      Build Team
    ----------------------------------*/

    response.staff =

        staff;

    response.team =

        StaffTeam.buildTeam(

            staff

        );

    response.success =

        true;

    response.message =

        "Team information found.";

    response.metadata.executionTime =

        Date.now() -

        started;

    StaffTeam.lastResult =

        response;

    return response;

};/*=========================================================
 FIND STAFF
=========================================================*/

StaffTeam.findStaff = function (

    request

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !request ||

        typeof request !== "object"

    ) {

        return null;

    }

    /*----------------------------------
      Parameters
    ----------------------------------*/

    if (

        request.parameters &&

        request.parameters.staff

    ) {

        return request.parameters.staff;

    }

    /*----------------------------------
      Staff Entity
    ----------------------------------*/

    if (

        request.entities &&

        Array.isArray(

            request.entities.staff

        ) &&

        request.entities.staff.length > 0

    ) {

        return request.entities.staff[0];

    }

    /*----------------------------------
      Phone Entity
    ----------------------------------*/

    if (

        request.entities &&

        Array.isArray(

            request.entities.phones

        ) &&

        request.entities.phones.length > 0

    ) {

        return request.entities.phones[0];

    }

    /*----------------------------------
      Role Entity
    ----------------------------------*/

    if (

        request.entities &&

        Array.isArray(

            request.entities.roles

        ) &&

        request.entities.roles.length > 0

    ) {

        return request.entities.roles[0];

    }

    /*----------------------------------
      Posting Entity
    ----------------------------------*/

    if (

        request.entities &&

        Array.isArray(

            request.entities.posting

        ) &&

        request.entities.posting.length > 0

    ) {

        return request.entities.posting[0];

    }

    /*----------------------------------
      Team Entity
    ----------------------------------*/

    if (

        request.entities &&

        Array.isArray(

            request.entities.team

        ) &&

        request.entities.team.length > 0

    ) {

        return request.entities.team[0];

    }

    /*----------------------------------
      Duty Entity
    ----------------------------------*/

    if (

        request.entities &&

        Array.isArray(

            request.entities.duty

        ) &&

        request.entities.duty.length > 0

    ) {

        return request.entities.duty[0];

    }

    /*----------------------------------
      GPS Entity
    ----------------------------------*/

    if (

        request.entities &&

        Array.isArray(

            request.entities.gps

        ) &&

        request.entities.gps.length > 0

    ) {

        return request.entities.gps[0];

    }

    return null;

};/*=========================================================
 BUILD TEAM
=========================================================*/

/*=========================================================
 BUILD TEAM
=========================================================*/

StaffTeam.buildTeam = function (

    staff

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !staff ||

        typeof staff !== "object"

    ) {

        return null;

    }

    return {

        /*----------------------------------
          Identity
        ----------------------------------*/

        cleanName:

            staff.identity.cleanName,

        rawName:

            staff.identity.rawName,

        name:

            staff.identity.name,

        phone:

            staff.identity.phone,

        email:

            staff.identity.email,

        role:

            staff.identity.role,

        designation:

            staff.identity.designation,

        /*----------------------------------
          Team
        ----------------------------------*/

        leader:

            staff.teamInfo.leader,

        team:

            staff.teamInfo.team,

        /*----------------------------------
          Posting
        ----------------------------------*/

        circle:

            staff.posting.circle,

        division:

            staff.posting.division,

        range:

            staff.posting.range,

        beat:

            staff.posting.beat,

        assignedCompartment:

            staff.assignment.assignedCompartment,

        /*----------------------------------
          Duty
        ----------------------------------*/

        dutyType:

            staff.assignment.dutyType,

        dutyActive:

            staff.assignment.dutyActive,

        status:

            staff.assignment.status,

        lastDutyEnd:

            staff.assignment.lastDutyEnd,

        /*----------------------------------
          Live Location
        ----------------------------------*/

        location:

            staff.location.location,

        latitude:

            staff.location.lat,

        longitude:

            staff.location.lon,

        /*----------------------------------
          GPS
        ----------------------------------*/

        accuracy:

            staff.gps.accuracy,

        speed:

            staff.gps.speed,

        heading:

            staff.gps.heading,

        turnAngle:

            staff.gps.turnAngle,

        turnRate:

            staff.gps.turnRate,

        lastSeen:

            staff.gps.lastSeen,

        timestamp:

            staff.gps.timestamp,

        updatedAt:

            staff.gps.updatedAt,

        /*----------------------------------
          Tracking
        ----------------------------------*/

        sessionId:

            staff.tracking.sessionId,

        source:

            staff.tracking.source,

        id:

            staff.tracking.id,

        /*----------------------------------
          Analytics
        ----------------------------------*/

        pointCount:

            staff.analytics.pointCount,

        distanceKm:

            staff.analytics.distanceKm,

        startedAt:

            staff.analytics.startedAt,

        endedAt:

            staff.analytics.endedAt,

        /*----------------------------------
          Metadata
        ----------------------------------*/

        confidence:

            staff.metadata.confidence,

        valid:

            staff.metadata.valid,

        documentId:

            staff.metadata.documentId

    };

};/*=========================================================
 REGISTER
=========================================================*/

GG.queryStaffTeam = function (

    request

) {

    return StaffTeam.queryStaffTeam(

        request

    );

};

/*=========================================================
 INITIALIZE
=========================================================*/

StaffTeam.initialize();

/*=========================================================
 EXPORT
=========================================================*/

GG.StaffTeam =

    StaffTeam;

console.log(

    "%cStaff Team Loaded",

    "color:#008000;font-weight:bold;"

);

})(window);
