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

const StaffContact = {};

/*=========================================================
 VERSION
=========================================================*/

StaffContact.VERSION =

    "1.0.0";

/*=========================================================
 STATUS
=========================================================*/

StaffContact.loaded =

    false;

StaffContact.loading =

    false;

/*=========================================================
 CACHE
=========================================================*/

StaffContact.cache =

    new Map();

StaffContact.lastRequest =

    null;

StaffContact.lastResult =

    null;

/*=========================================================
 CLEAR CACHE
=========================================================*/

StaffContact.clearCache = function () {

    StaffContact.cache.clear();

};

/*=========================================================
 CREATE RESPONSE
=========================================================*/

StaffContact.createResponse = function (

    request = {}

) {

    return {

        success:

            false,

        source:

            "LOCAL",

        module:

            "StaffContact",

        intent:

            StaffConstants.INTENTS.STAFF_CONTACT,

        confidence:

            request.confidence ||

            0,

        query:

            request.originalQuery ||

            "",

        staff:

            null,

        contact:

            null,

        message:

            "",

        warnings:

            [],

        errors:

            [],

        metadata: {

            version:

                StaffContact.VERSION,

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

StaffContact.initialize = function () {

    StaffContact.loaded =

        true;

    StaffContact.loading =

        false;

    return true;

};

/*=========================================================
 QUERY STAFF CONTACT
=========================================================*/

StaffContact.queryStaffContact = function (

    request

) {

    const started =

        Date.now();

    /*----------------------------------
      Create Response
    ----------------------------------*/

    const response =

        StaffContact.createResponse(

            request

        );

    StaffContact.lastRequest =

        request;

    /*----------------------------------
      Find Staff
    ----------------------------------*/

    const staff =

        StaffContact.findStaff(

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
      Build Contact
    ----------------------------------*/

    response.staff =

        staff;

    response.contact =

        StaffContact.buildContact(

            staff

        );

    response.success =

        true;

    response.message =

        "Contact details found.";

    response.metadata.executionTime =

        Date.now() -

        started;

    StaffContact.lastResult =

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

StaffContact.findStaff = function (

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

};
  /*=========================================================
 BUILD CONTACT
=========================================================*/

StaffContact.buildContact = function (

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

        designation:

            staff.identity.designation,

        role:

            staff.identity.role,

        type:

            staff.identity.type,

       /*----------------------------------
  Contact
----------------------------------*/

phone:

    staff.identity.phone,

phoneNumber:

    staff.identity.phone,

mobile:

    staff.identity.phone,

mobileNumber:

    staff.identity.phone,

contact:

    staff.identity.phone,

contactNumber:

    staff.identity.phone,

email:

    staff.identity.email,
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

GG.queryStaffContact = function (

    request

) {

    return StaffContact.queryStaffContact(

        request

    );

};

/*=========================================================
 INITIALIZE
=========================================================*/

StaffContact.initialize();

/*=========================================================
 EXPORT
=========================================================*/

GG.StaffContact =

    StaffContact;

console.log(

    "%cStaff Contact Loaded",

    "color:#008000;font-weight:bold;"

);

})(window);
