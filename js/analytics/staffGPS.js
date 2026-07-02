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

const StaffGPS = {};

/*=========================================================
 VERSION
=========================================================*/

StaffGPS.VERSION =

    "1.0.0";

/*=========================================================
 STATUS
=========================================================*/

StaffGPS.loaded =

    false;

StaffGPS.loading =

    false;

/*=========================================================
 CACHE
=========================================================*/

StaffGPS.cache =

    new Map();

StaffGPS.lastRequest =

    null;

StaffGPS.lastResult =

    null;

/*=========================================================
 CLEAR CACHE
=========================================================*/

StaffGPS.clearCache = function () {

    StaffGPS.cache.clear();

};

/*=========================================================
 CREATE RESPONSE
=========================================================*/

StaffGPS.createResponse = function (

    request = {}

) {

    return {

        success:

            false,

        source:

            "LOCAL",

        module:

            "StaffGPS",

        intent:

            StaffConstants.INTENTS.STAFF_GPS,

        confidence:

            request.confidence ||

            0,

        query:

            request.originalQuery ||

            "",

        staff:

            null,

        gps:

            null,

        message:

            "",

        warnings:

            [],

        errors:

            [],

        metadata: {

            version:

                StaffGPS.VERSION,

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

StaffGPS.initialize = function () {

    StaffGPS.loaded =

        true;

    StaffGPS.loading =

        false;

    return true;

};/*=========================================================
 QUERY STAFF GPS
=========================================================*/

StaffGPS.queryStaffGPS = function (

    request

) {

    const started =

        Date.now();

    /*----------------------------------
      Create Response
    ----------------------------------*/

    const response =

        StaffGPS.createResponse(

            request

        );

    StaffGPS.lastRequest =

        request;

    /*----------------------------------
      Find Staff
    ----------------------------------*/

    const staff =

        StaffGPS.findStaff(

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
      Build GPS
    ----------------------------------*/

    response.staff =

        staff;

    response.gps =

        StaffGPS.buildGPS(

            staff

        );

    response.success =

        true;

    response.message =

        "GPS information found.";

    response.metadata.executionTime =

        Date.now() -

        started;

    StaffGPS.lastResult =

        response;

    return response;

};/*=========================================================
 FIND STAFF
=========================================================*/

StaffGPS.findStaff = function (

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

};
  /*=========================================================
 BUILD GPS
=========================================================*/

StaffGPS.buildGPS = function (

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

        role:

            staff.identity.role,

        designation:

            staff.identity.designation,

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
          Duty
        ----------------------------------*/

        dutyType:

            staff.assignment.dutyType,

        dutyActive:

            staff.assignment.dutyActive,

        status:

            staff.assignment.status,

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
          Team
        ----------------------------------*/

        leader:

            staff.teamInfo.leader,

        team:

            staff.teamInfo.team,

        /*----------------------------------
          Tracking
        ----------------------------------*/

        sessionId:

            staff.tracking.sessionId,

        id:

            staff.tracking.id,

        source:

            staff.tracking.source,

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

};
  /*=========================================================
 REGISTER
=========================================================*/

GG.queryStaffGPS = function (

    request

) {

    return StaffGPS.queryStaffGPS(

        request

    );

};

/*=========================================================
 INITIALIZE
=========================================================*/

StaffGPS.initialize();

/*=========================================================
 EXPORT
=========================================================*/

GG.StaffGPS =

    StaffGPS;

console.log(

    "%cStaff GPS Loaded",

    "color:#008000;font-weight:bold;"

);

})(window);
