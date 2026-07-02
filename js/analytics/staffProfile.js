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

const StaffProfile = {};

/*=========================================================
 VERSION
=========================================================*/

StaffProfile.VERSION =

    "1.0.0";

/*=========================================================
 STATUS
=========================================================*/

StaffProfile.loaded =

    false;

StaffProfile.loading =

    false;

/*=========================================================
 CACHE
=========================================================*/

StaffProfile.cache =

    new Map();

StaffProfile.lastRequest =

    null;

StaffProfile.lastResult =

    null;

/*=========================================================
 CLEAR CACHE
=========================================================*/

StaffProfile.clearCache = function () {

    StaffProfile.cache.clear();

};

/*=========================================================
 CREATE RESPONSE
=========================================================*/

StaffProfile.createResponse = function (

    request = {}

) {

    return {

        success:

            false,

        source:

            "LOCAL",

        module:

            "StaffProfile",

        intent:

            StaffConstants.INTENTS.STAFF_PROFILE,

        confidence:

            request.confidence ||

            0,

        query:

            request.originalQuery ||

            "",

        staff:

            null,

        data:

            null,

        message:

            "",

        warnings:

            [],

        errors:

            [],

        metadata: {

            version:

                StaffProfile.VERSION,

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

StaffProfile.initialize = function () {

    StaffProfile.loaded =

        true;

    StaffProfile.loading =

        false;

    return true;

};/*=========================================================
 QUERY STAFF PROFILE
=========================================================*/

StaffProfile.queryStaffProfile = function (

    request

) {

    const started =

        Date.now();

    /*----------------------------------
      Create Response
    ----------------------------------*/

    const response =

        StaffProfile.createResponse(

            request

        );

    StaffProfile.lastRequest =

        request;

    /*----------------------------------
      Find Staff
    ----------------------------------*/

    const staff =

        StaffProfile.findStaff(

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
      Build Profile
    ----------------------------------*/

    response.staff =

        staff;

    response.data =

        StaffProfile.buildProfile(

            staff

        );

    response.success =

        true;

    response.message =

        "Staff profile found.";

    response.metadata.executionTime =

        Date.now() -

        started;

    StaffProfile.lastResult =

        response;

    return response;

};/*=========================================================
 FIND STAFF
=========================================================*/

StaffProfile.findStaff = function (

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
 BUILD PROFILE
=========================================================*/

StaffProfile.buildProfile = function (

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

        identity: {

            cleanName:

                staff.identity?.cleanName || "",

            rawName:

                staff.identity?.rawName || "",

            name:

                staff.identity?.name || "",

            phone:

                staff.identity?.phone || "",

            email:

                staff.identity?.email || "",

            role:

                staff.identity?.role || "",

            designation:

                staff.identity?.designation || "",

            type:

                staff.identity?.type || ""

        },

        /*----------------------------------
          Posting
        ----------------------------------*/

        posting: {

            circle:

                staff.posting?.circle || "",

            division:

                staff.posting?.division || "",

            range:

                staff.posting?.range || "",

            beat:

                staff.posting?.beat || ""

        },

        /*----------------------------------
          Assignment
        ----------------------------------*/

        assignment: {

            assignedCompartment:

                staff.assignment?.assignedCompartment || "",

            dutyType:

                staff.assignment?.dutyType || "",

            dutyActive:

                staff.assignment?.dutyActive || false,

            status:

                staff.assignment?.status || "",

            leader:

                staff.assignment?.leader || "",

            team:

                staff.assignment?.team || ""

        },

        /*----------------------------------
          Duty
        ----------------------------------*/

        duty: {

            dutyType:

                staff.duty?.dutyType || "",

            dutyActive:

                staff.duty?.dutyActive || false,

            status:

                staff.duty?.status || "",

            lastDutyEnd:

                staff.duty?.lastDutyEnd || ""

        },

        /*----------------------------------
          Location
        ----------------------------------*/

        location: {

            location:

                staff.location?.location || "",

            lat:

                staff.location?.lat ?? null,

            lon:

                staff.location?.lon ?? null

        },

        /*----------------------------------
          GPS
        ----------------------------------*/

        gps: {

            accuracy:

                staff.gps?.accuracy ?? null,

            heading:

                staff.gps?.heading ?? null,

            speed:

                staff.gps?.speed ?? null,

            lastSeen:

                staff.gps?.lastSeen ?? null,

            timestamp:

                staff.gps?.timestamp ?? null,

            updatedAt:

                staff.gps?.updatedAt ?? null,

            turnAngle:

                staff.gps?.turnAngle ?? null,

            turnRate:

                staff.gps?.turnRate ?? null

        },

        /*----------------------------------
          Team
        ----------------------------------*/

        teamInfo: {

            leader:

                staff.teamInfo?.leader || "",

            team:

                staff.teamInfo?.team || ""

        },

        /*----------------------------------
          Tracking
        ----------------------------------*/

        tracking: {

            sessionId:

                staff.tracking?.sessionId || "",

            source:

                staff.tracking?.source || "",

            id:

                staff.tracking?.id || ""

        },

        /*----------------------------------
          Analytics
        ----------------------------------*/

        analytics: {

            pointCount:

                staff.analytics?.pointCount || 0,

            distanceKm:

                staff.analytics?.distanceKm || 0,

            startedAt:

                staff.analytics?.startedAt || null,

            endedAt:

                staff.analytics?.endedAt || null,

            monthKey:

                staff.analytics?.monthKey || "",

            compartments:

                staff.analytics?.compartments || [],

            simplifiedTrack:

                staff.analytics?.simplifiedTrack || [],

            startLat:

                staff.analytics?.startLat ?? null,

            startLon:

                staff.analytics?.startLon ?? null,

            startAccuracy:

                staff.analytics?.startAccuracy ?? null

        },

        /*----------------------------------
          Metadata
        ----------------------------------*/

        metadata: {

            confidence:

                staff.metadata?.confidence ?? 1,

            valid:

                staff.metadata?.valid ?? true,

            source:

                staff.metadata?.source || "",

            documentId:

                staff.metadata?.documentId || ""

        }

    };

};
    /*=========================================================
 REGISTER
=========================================================*/

GG.queryStaffProfile = function (

    request

) {

    return StaffProfile.queryStaffProfile(

        request

    );

};

/*=========================================================
 INITIALIZE
=========================================================*/

StaffProfile.initialize();

/*=========================================================
 EXPORT
=========================================================*/

GG.StaffProfile =

    StaffProfile;

console.log(

    "%cStaff Profile Loaded",

    "color:#008000;font-weight:bold;"

);

})(window);
