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

const StaffLocation = {};

/*=========================================================
 VERSION
=========================================================*/

StaffLocation.VERSION =

    "1.0.0";

/*=========================================================
 STATUS
=========================================================*/

StaffLocation.loaded =

    false;

StaffLocation.loading =

    false;

/*=========================================================
 CACHE
=========================================================*/

StaffLocation.cache =

    new Map();

StaffLocation.lastRequest =

    null;

StaffLocation.lastResult =

    null;

/*=========================================================
 CLEAR CACHE
=========================================================*/

StaffLocation.clearCache = function () {

    StaffLocation.cache.clear();

};

/*=========================================================
 CREATE RESPONSE
=========================================================*/

StaffLocation.createResponse = function (

    request = {}

) {

    return {

        success:

            false,

        source:

            "LOCAL",

        module:

            "StaffLocation",

        intent:

            StaffConstants.INTENTS.STAFF_LOCATION,

        confidence:

            request.confidence ||

            0,

        query:

            request.originalQuery ||

            "",

        staff:

            null,

        location:

            null,

        message:

            "",

        warnings:

            [],

        errors:

            [],

        metadata: {

            version:

                StaffLocation.VERSION,

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

StaffLocation.initialize = function () {

    StaffLocation.loaded =

        true;

    StaffLocation.loading =

        false;

    return true;

};
  /*=========================================================
 QUERY STAFF LOCATION
=========================================================*/

StaffLocation.queryStaffLocation = function (

    request

) {

    const started =

        Date.now();

    /*----------------------------------
      Create Response
    ----------------------------------*/

    const response =

        StaffLocation.createResponse(

            request

        );

    StaffLocation.lastRequest =

        request;

    /*----------------------------------
      Find Staff
    ----------------------------------*/

    const staff =

        StaffLocation.findStaff(

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
      Build Location
    ----------------------------------*/

    response.staff =

        staff;

    response.location =

        StaffLocation.buildLocation(

            staff

        );

    response.success =

        true;

    response.message =

        "Staff location found.";

    response.metadata.executionTime =

        Date.now() -

        started;

    StaffLocation.lastResult =

        response;

    return response;

};
  /*=========================================================
 FIND STAFF
=========================================================*/

/*=========================================================
 FIND STAFF
=========================================================*/

StaffLocation.findStaff = function (

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
      Canonical Staff
    ----------------------------------*/

    let staff = null;

    /*----------------------------------
      Parameters
    ----------------------------------*/

    if (

        request.parameters &&

        request.parameters.staff

    ) {

        staff =

            request.parameters.staff;

    }

    /*----------------------------------
      Staff Entity
    ----------------------------------*/

    else if (

        request.entities &&

        Array.isArray(

            request.entities.staff

        ) &&

        request.entities.staff.length > 0

    ) {

        staff =

            request.entities.staff[0];

    }

    /*----------------------------------
      Phone Entity
    ----------------------------------*/

    else if (

        request.entities &&

        Array.isArray(

            request.entities.phones

        ) &&

        request.entities.phones.length > 0

    ) {

        staff =

            request.entities.phones[0];

    }

    /*----------------------------------
      Role Entity
    ----------------------------------*/

    else if (

        request.entities &&

        Array.isArray(

            request.entities.roles

        ) &&

        request.entities.roles.length > 0

    ) {

        staff =

            request.entities.roles[0];

    }

    /*----------------------------------
      Posting Entity
    ----------------------------------*/

    else if (

        request.entities &&

        Array.isArray(

            request.entities.posting

        ) &&

        request.entities.posting.length > 0

    ) {

        staff =

            request.entities.posting[0];

    }

    /*----------------------------------
      Team Entity
    ----------------------------------*/

    else if (

        request.entities &&

        Array.isArray(

            request.entities.team

        ) &&

        request.entities.team.length > 0

    ) {

        staff =

            request.entities.team[0];

    }

    /*----------------------------------
      Duty Entity
    ----------------------------------*/

    else if (

        request.entities &&

        Array.isArray(

            request.entities.duty

        ) &&

        request.entities.duty.length > 0

    ) {

        staff =

            request.entities.duty[0];

    }

    /*----------------------------------
      GPS Entity
    ----------------------------------*/

    else if (

        request.entities &&

        Array.isArray(

            request.entities.gps

        ) &&

        request.entities.gps.length > 0

    ) {

        staff =

            request.entities.gps[0];

    }

    /*----------------------------------
      Staff Not Found
    ----------------------------------*/

    if (

        !staff

    ) {

        return null;

    }

    /*----------------------------------
      Resolve Clean Name
    ----------------------------------*/

    const cleanName =

        String(

            staff.identity?.cleanName ||

            staff.cleanName ||

            ""

        )

        .trim()

        .toUpperCase();

    /*----------------------------------
      Cannot Hydrate
    ----------------------------------*/

    if (

        cleanName === ""

    ) {

        return staff;

    }

    /*----------------------------------
      Hydrate Runtime Data
    ----------------------------------*/

    if (

        window.GreenGuardAI &&

        window.GreenGuardAI.StaffHydrator &&

        typeof window.GreenGuardAI
            .StaffHydrator
            .getHydratedStaff ===

        "function"

    ) {

        const hydrated =

            window.GreenGuardAI
                .StaffHydrator
                .getHydratedStaff(

                    cleanName

                );

        if (

            hydrated

        ) {

            return hydrated;

        }

    }

    /*----------------------------------
      Fallback
    ----------------------------------*/

    return staff;

};/*=========================================================
 BUILD LOCATION
=========================================================*/

StaffLocation.buildLocation = function (

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
          Administrative Posting
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

        heading:

            staff.gps.heading,

        speed:

            staff.gps.speed,

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
          Duty
        ----------------------------------*/

        dutyType:

            staff.assignment.dutyType,

        dutyActive:

            staff.assignment.dutyActive,

        status:

            staff.assignment.status,

        /*----------------------------------
          Team
        ----------------------------------*/

        leader:

            staff.teamInfo.leader,

        team:

            staff.teamInfo.team,

        /*----------------------------------
          Analytics
        ----------------------------------*/

        pointCount:

            staff.analytics.pointCount,

        distanceKm:

            staff.analytics.distanceKm,

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

GG.queryStaffLocation = function (

    request

) {

    return StaffLocation.queryStaffLocation(

        request

    );

};

/*=========================================================
 INITIALIZE
=========================================================*/

StaffLocation.initialize();

/*=========================================================
 EXPORT
=========================================================*/

GG.StaffLocation =

    StaffLocation;

console.log(

    "%cStaff Location Loaded",

    "color:#008000;font-weight:bold;"

);

})(window);
