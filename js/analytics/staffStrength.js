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

const StaffStrength = {};

/*=========================================================
 VERSION
=========================================================*/

StaffStrength.VERSION =

    "1.0.0";

/*=========================================================
 STATUS
=========================================================*/

StaffStrength.loaded =

    false;

StaffStrength.loading =

    false;

/*=========================================================
 CACHE
=========================================================*/

StaffStrength.cache =

    new Map();

StaffStrength.lastRequest =

    null;

StaffStrength.lastResult =

    null;

/*=========================================================
 CLEAR CACHE
=========================================================*/

StaffStrength.clearCache = function () {

    StaffStrength.cache.clear();

};

/*=========================================================
 CREATE RESPONSE
=========================================================*/

StaffStrength.createResponse = function (

    request = {}

) {

    return {

        success:

            false,

        source:

            "LOCAL",

        module:

            "StaffStrength",

        intent:

            StaffConstants.INTENTS.STAFF_STRENGTH,

        confidence:

            request.confidence ||

            0,

        query:

            request.originalQuery ||

            "",

        filters:

            request.parameters ||

            {},

        summary:

            null,

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

                StaffStrength.VERSION,

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

StaffStrength.initialize = function () {

    StaffStrength.loaded =

        true;

    StaffStrength.loading =

        false;

    return true;

};/*=========================================================
 QUERY STAFF STRENGTH
=========================================================*/

StaffStrength.queryStaffStrength = function (

    request

) {

    const started =

        Date.now();

    /*----------------------------------
      Create Response
    ----------------------------------*/

    const response =

        StaffStrength.createResponse(

            request

        );

    StaffStrength.lastRequest =

        request;

    /*----------------------------------
      Calculate Strength
    ----------------------------------*/

    const summary =

        StaffStrength.calculateStrength(

            request

        );

    /*----------------------------------
      Build Response
    ----------------------------------*/

    response.summary =

        StaffStrength.buildStrength(

            summary

        );

    response.staff =

        summary.staff;

    response.total =

        summary.total;

    response.success =

        true;

    response.message =

        "Staff strength calculated.";

    response.metadata.executionTime =

        Date.now() -

        started;

    StaffStrength.lastResult =

        response;

    return response;

};/*=========================================================
 CALCULATE STRENGTH
=========================================================*/

/*=========================================================
 CALCULATE STRENGTH
=========================================================*/

StaffStrength.calculateStrength = function (

    request

) {

    /*----------------------------------
      Parameters
    ----------------------------------*/

    const parameters =

        request.parameters ||

        {};

    /*----------------------------------
      Hydrated Staff
    ----------------------------------*/

    let staff =

        StaffEntities.staff.map(

            function (

                s

            ) {

                const cleanName =

                    String(

                        s.identity?.cleanName ||

                        s.cleanName ||

                        ""

                    )

                    .trim()

                    .toUpperCase();

                if (

                    cleanName === ""

                ) {

                    return s;

                }

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

                return s;

            }

        );

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

                s =>

                    String(

                        s.posting.division ||

                        ""

                    )

                    .trim()

                    .toUpperCase() ===

                    division

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

                s =>

                    String(

                        s.posting.range ||

                        ""

                    )

                    .trim()

                    .toUpperCase() ===

                    range

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

                s =>

                    String(

                        s.posting.beat ||

                        ""

                    )

                    .trim()

                    .toUpperCase() ===

                    beat

            );

    }

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

                s =>

                    String(

                        s.identity.role ||

                        ""

                    )

                    .trim()

                    .toUpperCase() ===

                    role

            );

    }

    /*----------------------------------
      Duty
    ----------------------------------*/

    if (

        typeof parameters.dutyActive ===

        "boolean"

    ) {

        staff =

            staff.filter(

                s =>

                    s.assignment.dutyActive ===

                    parameters.dutyActive

            );

    }

    /*----------------------------------
      Summary
    ----------------------------------*/

    const summary = {

        total:

            staff.length,

        active:

            0,

        inactive:

            0,

        byRole: {},

        byDivision: {},

        byRange: {},

        byBeat: {},

        staff

    };

    /*----------------------------------
      Calculate
    ----------------------------------*/

    staff.forEach(

        function (

            s

        ) {

            if (

                s.assignment.dutyActive

            ) {

                summary.active++;

            }

            else {

                summary.inactive++;

            }

            const role =

                s.identity.role ||

                "UNKNOWN";

            summary.byRole[

                role

            ] =

                (

                    summary.byRole[

                        role

                    ] ||

                    0

                ) + 1;

            const division =

                s.posting.division ||

                "UNKNOWN";

            summary.byDivision[

                division

            ] =

                (

                    summary.byDivision[

                        division

                    ] ||

                    0

                ) + 1;

            const range =

                s.posting.range ||

                "UNKNOWN";

            summary.byRange[

                range

            ] =

                (

                    summary.byRange[

                        range

                    ] ||

                    0

                ) + 1;

            const beat =

                s.posting.beat ||

                "UNKNOWN";

            summary.byBeat[

                beat

            ] =

                (

                    summary.byBeat[

                        beat

                    ] ||

                    0

                ) + 1;

        }

    );

    return summary;

};
 /*=========================================================
 BUILD STRENGTH
=========================================================*/

StaffStrength.buildStrength = function (

    summary

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !summary ||

        typeof summary !== "object"

    ) {

        return null;

    }

    return {

        /*----------------------------------
          Overall
        ----------------------------------*/

        total:

            summary.total,

        active:

            summary.active,

        inactive:

            summary.inactive,

        /*----------------------------------
          Distribution
        ----------------------------------*/

        byRole:

            summary.byRole,

        byDivision:

            summary.byDivision,

        byRange:

            summary.byRange,

        byBeat:

            summary.byBeat,

        /*----------------------------------
          Staff
        ----------------------------------*/

        staff:

            summary.staff,

        /*----------------------------------
          Statistics
        ----------------------------------*/

        statistics: {

            total:

                summary.total,

            activePercentage:

                summary.total > 0

                    ? Number(

                        (

                            summary.active /

                            summary.total *

                            100

                        ).toFixed(

                            2

                        )

                    )

                    : 0,

            inactivePercentage:

                summary.total > 0

                    ? Number(

                        (

                            summary.inactive /

                            summary.total *

                            100

                        ).toFixed(

                            2

                        )

                    )

                    : 0

        }

    };

};/*=========================================================
 REGISTER
=========================================================*/

GG.queryStaffStrength = function (

    request

) {

    return StaffStrength.queryStaffStrength(

        request

    );

};

/*=========================================================
 INITIALIZE
=========================================================*/

StaffStrength.initialize();

/*=========================================================
 EXPORT
=========================================================*/

GG.StaffStrength =

    StaffStrength;

console.log(

    "%cStaff Strength Loaded",

    "color:#008000;font-weight:bold;"

);

})(window);
