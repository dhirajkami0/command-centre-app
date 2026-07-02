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

const StaffDirectory = {};

/*=========================================================
 VERSION
=========================================================*/

StaffDirectory.VERSION =

    "1.0.0";

/*=========================================================
 STATUS
=========================================================*/

StaffDirectory.loaded =

    false;

StaffDirectory.loading =

    false;

/*=========================================================
 CACHE
=========================================================*/

StaffDirectory.cache =

    new Map();

StaffDirectory.lastRequest =

    null;

StaffDirectory.lastResult =

    null;

/*=========================================================
 CLEAR CACHE
=========================================================*/

StaffDirectory.clearCache = function () {

    StaffDirectory.cache.clear();

};

/*=========================================================
 CREATE RESPONSE
=========================================================*/

StaffDirectory.createResponse = function (

    request = {}

) {

    return {

        success:

            false,

        source:

            "LOCAL",

        module:

            "StaffDirectory",

        intent:

            StaffConstants.INTENTS.STAFF_DIRECTORY,

        confidence:

            request.confidence ||

            0,

        query:

            request.originalQuery ||

            "",

        filters:

            request.parameters ||

            {},

        staff:

            [],

        total:

            0,

        message:

            "",

        warnings:

            [],

        errors:

            [],

        metadata: {

            version:

                StaffDirectory.VERSION,

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

StaffDirectory.initialize = function () {

    StaffDirectory.loaded =

        true;

    StaffDirectory.loading =

        false;

    return true;

};
    /*=========================================================
 QUERY STAFF DIRECTORY
=========================================================*/

StaffDirectory.queryStaffDirectory = function (

    request

) {

    const started =

        Date.now();

    /*----------------------------------
      Create Response
    ----------------------------------*/

    const response =

        StaffDirectory.createResponse(

            request

        );

    StaffDirectory.lastRequest =

        request;

    /*----------------------------------
      Filter Staff
    ----------------------------------*/

    const staff =

        StaffDirectory.filterStaff(

            request

        );

    /*----------------------------------
      Build Directory
    ----------------------------------*/

    response.staff =

        StaffDirectory.buildDirectory(

            staff

        );

    response.total =

        response.staff.length;

    response.success =

        true;

    response.message =

        response.total +

        " staff found.";

    response.metadata.executionTime =

        Date.now() -

        started;

    StaffDirectory.lastResult =

        response;

    return response;

};
    /*=========================================================
 FILTER STAFF
=========================================================*/

StaffDirectory.filterStaff = function (

    request

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !request ||

        typeof request !== "object"

    ) {

        return [];

    }

    const parameters =

        request.parameters ||

        {};

    let staff =

        [

            ...StaffEntities.staff

        ];

    /*----------------------------------
      Role
    ----------------------------------*/

    if (

        parameters.role

    ) {

        const role =

            String(

                parameters.role

            )

            .trim()

            .toUpperCase();

        staff =

            staff.filter(

                function (

                    s

                ) {

                    return (

                        String(

                            s.identity.role ||

                            ""

                        )

                        .toUpperCase() ===

                        role

                    );

                }

            );

    }

    /*----------------------------------
      Division
    ----------------------------------*/

    if (

        parameters.division

    ) {

        const division =

            String(

                parameters.division

            )

            .trim()

            .toUpperCase();

        staff =

            staff.filter(

                function (

                    s

                ) {

                    return (

                        String(

                            s.posting.division ||

                            ""

                        )

                        .toUpperCase() ===

                        division

                    );

                }

            );

    }

    /*----------------------------------
      Range
    ----------------------------------*/

    if (

        parameters.range

    ) {

        const range =

            String(

                parameters.range

            )

            .trim()

            .toUpperCase();

        staff =

            staff.filter(

                function (

                    s

                ) {

                    return (

                        String(

                            s.posting.range ||

                            ""

                        )

                        .toUpperCase() ===

                        range

                    );

                }

            );

    }

    /*----------------------------------
      Beat
    ----------------------------------*/

    if (

        parameters.beat

    ) {

        const beat =

            String(

                parameters.beat

            )

            .trim()

            .toUpperCase();

        staff =

            staff.filter(

                function (

                    s

                ) {

                    return (

                        String(

                            s.posting.beat ||

                            ""

                        )

                        .toUpperCase() ===

                        beat

                    );

                }

            );

    }

    /*----------------------------------
      Duty Active
    ----------------------------------*/

    if (

        typeof parameters.dutyActive ===

        "boolean"

    ) {

        staff =

            staff.filter(

                function (

                    s

                ) {

                    return (

                        s.assignment.dutyActive ===

                        parameters.dutyActive

                    );

                }

            );

    }

    /*----------------------------------
      Team Leader
    ----------------------------------*/

    if (

        parameters.leader

    ) {

        const leader =

            String(

                parameters.leader

            )

            .trim()

            .toUpperCase();

        staff =

            staff.filter(

                function (

                    s

                ) {

                    return (

                        String(

                            s.teamInfo.leader ||

                            ""

                        )

                        .toUpperCase() ===

                        leader

                    );

                }

            );

    }

    return staff;

};/*=========================================================
 BUILD DIRECTORY
=========================================================*/

StaffDirectory.buildDirectory = function (

    staffList

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !Array.isArray(

            staffList

        )

    ) {

        return [];

    }

    /*----------------------------------
      Build
    ----------------------------------*/

    return staffList.map(

        function (

            staff

        ) {

            return {

                /*--------------------------
                  Identity
                --------------------------*/

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

                type:

                    staff.identity.type,

                /*--------------------------
                  Posting
                --------------------------*/

                circle:

                    staff.posting.circle,

                division:

                    staff.posting.division,

                range:

                    staff.posting.range,

                beat:

                    staff.posting.beat,

                compartment:

                    staff.assignment.assignedCompartment,

                /*--------------------------
                  Duty
                --------------------------*/

                dutyType:

                    staff.assignment.dutyType,

                dutyActive:

                    staff.assignment.dutyActive,

                status:

                    staff.assignment.status,

                /*--------------------------
                  Team
                --------------------------*/

                leader:

                    staff.teamInfo.leader,

                team:

                    staff.teamInfo.team,

                /*--------------------------
                  GPS
                --------------------------*/

                location:

                    staff.location.location,

                lat:

                    staff.location.lat,

                lon:

                    staff.location.lon,

                accuracy:

                    staff.gps.accuracy,

                speed:

                    staff.gps.speed,

                heading:

                    staff.gps.heading,

                lastSeen:

                    staff.gps.lastSeen,

                /*--------------------------
                  Tracking
                --------------------------*/

                sessionId:

                    staff.tracking.sessionId,

                source:

                    staff.tracking.source,

                /*--------------------------
                  Analytics
                --------------------------*/

                distanceKm:

                    staff.analytics.distanceKm,

                pointCount:

                    staff.analytics.pointCount

            };

        }

    );

};/*=========================================================
 REGISTER
=========================================================*/

GG.queryStaffDirectory = function (

    request

) {

    return StaffDirectory.queryStaffDirectory(

        request

    );

};

/*=========================================================
 INITIALIZE
=========================================================*/

StaffDirectory.initialize();

/*=========================================================
 EXPORT
=========================================================*/

GG.StaffDirectory =

    StaffDirectory;

console.log(

    "%cStaff Directory Loaded",

    "color:#008000;font-weight:bold;"

);

})(window);
