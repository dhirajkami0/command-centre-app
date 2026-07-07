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

const StaffPosting = {};

/*=========================================================
 VERSION
=========================================================*/

StaffPosting.VERSION =

    "1.0.0";

/*=========================================================
 STATUS
=========================================================*/

StaffPosting.loaded =

    false;

StaffPosting.loading =

    false;

/*=========================================================
 CACHE
=========================================================*/

StaffPosting.cache =

    new Map();

StaffPosting.lastRequest =

    null;

StaffPosting.lastResult =

    null;

/*=========================================================
 CLEAR CACHE
=========================================================*/

StaffPosting.clearCache = function () {

    StaffPosting.cache.clear();

};

/*=========================================================
 CREATE RESPONSE
=========================================================*/

StaffPosting.createResponse = function (

    request = {}

) {

    return {

        success:

            false,

        source:

            "LOCAL",

        module:

            "StaffPosting",

        intent:

            StaffConstants.INTENTS.STAFF_POSTING,

        confidence:

            request.confidence ||

            0,

        query:

            request.originalQuery ||

            "",

        staff:

            null,

        posting:

            null,

        message:

            "",

        warnings:

            [],

        errors:

            [],

        metadata: {

            version:

                StaffPosting.VERSION,

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

StaffPosting.initialize = function () {

    StaffPosting.loaded =

        true;

    StaffPosting.loading =

        false;

    return true;

};
  /*=========================================================
 QUERY STAFF POSTING
=========================================================*/

StaffPosting.queryStaffPosting = function (

    request

) {

    const started =

        Date.now();

    /*----------------------------------
      Create Response
    ----------------------------------*/

    const response =

        StaffPosting.createResponse(

            request

        );

    StaffPosting.lastRequest =

        request;

    /*----------------------------------
      Find Staff
    ----------------------------------*/

    const staff =

        StaffPosting.findStaff(

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
      Build Posting
    ----------------------------------*/

    response.staff =

        staff;

    response.posting =

        StaffPosting.buildPosting(

            staff

        );

    response.success =

        true;

    response.message =

        "Posting details found.";

    response.metadata.executionTime =

        Date.now() -

        started;

    StaffPosting.lastResult =

        response;

    return response;

};/*=========================================================
 FIND STAFF
=========================================================*/

/*=========================================================
 FIND STAFF
=========================================================*/

StaffPosting.findStaff = function (

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

};
  /*=========================================================
 BUILD POSTING
=========================================================*/

StaffPosting.buildPosting = function (

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

        /*----------------------------------
          Current Assignment
        ----------------------------------*/

        assignedCompartment:

            staff.assignment.assignedCompartment,

        dutyType:

            staff.assignment.dutyType,

        dutyActive:

            staff.assignment.dutyActive,

        status:

            staff.assignment.status,

        leader:

            staff.assignment.leader,

        team:

            staff.assignment.team,

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

        lastSeen:

            staff.gps.lastSeen,

        timestamp:

            staff.gps.timestamp,

        /*----------------------------------
          Tracking
        ----------------------------------*/

        sessionId:

            staff.tracking.sessionId,

        source:

            staff.tracking.source,

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

GG.queryStaffPosting = function (

    request

) {

    return StaffPosting.queryStaffPosting(

        request

    );

};

/*=========================================================
 INITIALIZE
=========================================================*/

StaffPosting.initialize();

/*=========================================================
 EXPORT
=========================================================*/

GG.StaffPosting =

    StaffPosting;

console.log(

    "%cStaff Posting Loaded",

    "color:#008000;font-weight:bold;"

);

})(window);
