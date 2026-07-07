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

const StaffAssignment = {};
/*=========================================================
 VERSION
=========================================================*/

StaffAssignment.VERSION =

    "1.0.0";

/*=========================================================
 STATUS
=========================================================*/

StaffAssignment.loaded =

    false;

StaffAssignment.loading =

    false;
/*=========================================================
 CACHE
=========================================================*/

StaffAssignment.cache =

    new Map();

StaffAssignment.lastRequest =

    null;

StaffAssignment.lastResult =

    null;
/*=========================================================
 CLEAR CACHE
=========================================================*/

StaffAssignment.clearCache = function () {

    StaffAssignment.cache.clear();

};
  
/*=========================================================
 CREATE RESPONSE
=========================================================*/
/*=========================================================
 CREATE RESPONSE
=========================================================*/

StaffAssignment.createResponse = function (

    request = {}

) {

    return {

        success:

            false,

        source:

            "LOCAL",

        module:

            "StaffAssignment",

        intent:

            StaffConstants.INTENTS.STAFF_ASSIGNMENT,

        confidence:

            request.confidence ||

            0,

        query:

            request.originalQuery ||

            "",

        staff:

            null,

        assignment:

            null,

        message:

            "",

        warnings:

            [],

        errors:

            [],

        metadata: {

            version:

                StaffAssignment.VERSION,

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

StaffAssignment.initialize = function () {

    StaffAssignment.loaded =

        true;

    StaffAssignment.loading =

        false;

    return true;

};
 /*=========================================================
 QUERY STAFF ASSIGNMENT
=========================================================*/

StaffAssignment.queryStaffAssignment = function (

    request

) {

    const started =

        Date.now();

    /*----------------------------------
      Create Response
    ----------------------------------*/

    const response =

        StaffAssignment.createResponse(

            request

        );

    StaffAssignment.lastRequest =

        request;

    /*----------------------------------
      Find Staff
    ----------------------------------*/

    const staff =

        StaffAssignment.findStaff(

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
      Build Assignment
    ----------------------------------*/

    response.staff =

        staff;

    response.assignment =

        StaffAssignment.buildAssignment(

            staff

        );

    response.success =

        true;

    response.message =

        "Assignment details found.";

    response.metadata.executionTime =

        Date.now() -

        started;

    StaffAssignment.lastResult =

        response;

    return response;

};/*=========================================================
 FIND STAFF
=========================================================*/

/*=========================================================
 FIND STAFF
=========================================================*/

/*=========================================================
 FIND STAFF
=========================================================*/

StaffAssignment.findStaff = function (

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

    let staff =

        null;

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

}; /*=========================================================
 BUILD ASSIGNMENT
=========================================================*/

StaffAssignment.buildAssignment = function (

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

GG.queryStaffAssignment = function (

    request

) {

    return StaffAssignment.queryStaffAssignment(

        request

    );

};

/*=========================================================
 INITIALIZE
=========================================================*/

StaffAssignment.initialize();

/*=========================================================
 EXPORT
=========================================================*/

GG.StaffAssignment =

    StaffAssignment;

console.log(

    "%cStaff Assignment Loaded",

    "color:#008000;font-weight:bold;"

);

})(window);
