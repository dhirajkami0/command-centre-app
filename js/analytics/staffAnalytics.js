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

const StaffAnalytics = {};

/*=========================================================
 VERSION
=========================================================*/

StaffAnalytics.VERSION =

    "1.0.0";

/*=========================================================
 STATUS
=========================================================*/

StaffAnalytics.loaded =

    false;

StaffAnalytics.loading =

    false;

/*=========================================================
 CACHE
=========================================================*/

StaffAnalytics.cache =

    new Map();

StaffAnalytics.lastRequest =

    null;

StaffAnalytics.lastResult =

    null;

/*=========================================================
 CLEAR CACHE
=========================================================*/

StaffAnalytics.clearCache = function () {

    StaffAnalytics.cache.clear();

};

/*=========================================================
 CREATE RESPONSE
=========================================================*/

StaffAnalytics.createResponse = function (

    request = {}

) {

    return {

        success:

            false,

        source:

            "LOCAL",

        module:

            "StaffAnalytics",

        intent:

            StaffConstants.INTENTS.STAFF_ANALYTICS,

        confidence:

            request.confidence ||

            0,

        query:

            request.originalQuery ||

            "",

        filters:

            request.parameters ||

            {},

        analytics:

            null,

        message:

            "",

        warnings:

            [],

        errors:

            [],

        metadata: {

            version:

                StaffAnalytics.VERSION,

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

StaffAnalytics.initialize = function () {

    StaffAnalytics.loaded =

        true;

    StaffAnalytics.loading =

        false;

    return true;

};/*=========================================================
 QUERY STAFF ANALYTICS
=========================================================*/

StaffAnalytics.queryStaffAnalytics = function (

    request

) {

    const started =

        Date.now();

    /*----------------------------------
      Create Response
    ----------------------------------*/

    const response =

        StaffAnalytics.createResponse(

            request

        );

    StaffAnalytics.lastRequest =

        request;

    /*----------------------------------
      Calculate Analytics
    ----------------------------------*/

    const analytics =

        StaffAnalytics.calculateAnalytics(

            request

        );

    /*----------------------------------
      Build Analytics
    ----------------------------------*/

    response.analytics =

        StaffAnalytics.buildAnalytics(

            analytics

        );

    response.success =

        true;

    response.message =

        "Staff analytics calculated.";

    response.metadata.executionTime =

        Date.now() -

        started;

    StaffAnalytics.lastResult =

        response;

    return response;

};
  /*=========================================================
 CALCULATE ANALYTICS
=========================================================*/

StaffAnalytics.calculateAnalytics = function (

    request

) {

    /*----------------------------------
      Parameters
    ----------------------------------*/

    const parameters =

        request.parameters ||

        {};

    let staff =

        [

            ...StaffEntities.staff

        ];

    /*----------------------------------
      Division Filter
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

                    .toUpperCase() ===

                    division

            );

    }

    /*----------------------------------
      Range Filter
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

                    .toUpperCase() ===

                    range

            );

    }

    /*----------------------------------
      Beat Filter
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

                    .toUpperCase() ===

                    beat

            );

    }

    /*----------------------------------
      Initialize Summary
    ----------------------------------*/

    const analytics = {

        totalStaff: 0,

        activeStaff: 0,

        inactiveStaff: 0,

        totalDistance: 0,

        totalPoints: 0,

        totalSessions: 0,

        activeDuty: 0,

        inactiveDuty: 0,

        averageDistance: 0,

        averagePoints: 0,

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

            analytics.totalStaff++;

            if (

                s.assignment.dutyActive

            ) {

                analytics.activeDuty++;

                analytics.activeStaff++;

            }

            else {

                analytics.inactiveDuty++;

                analytics.inactiveStaff++;

            }

            analytics.totalDistance +=

                Number(

                    s.analytics.distanceKm ||

                    0

                );

            analytics.totalPoints +=

                Number(

                    s.analytics.pointCount ||

                    0

                );

            if (

                s.tracking.sessionId

            ) {

                analytics.totalSessions++;

            }

            const role =

                s.identity.role ||

                "UNKNOWN";

            analytics.byRole[role] =

                (

                    analytics.byRole[role] ||

                    0

                ) + 1;

            const division =

                s.posting.division ||

                "UNKNOWN";

            analytics.byDivision[division] =

                (

                    analytics.byDivision[division] ||

                    0

                ) + 1;

            const range =

                s.posting.range ||

                "UNKNOWN";

            analytics.byRange[range] =

                (

                    analytics.byRange[range] ||

                    0

                ) + 1;

            const beat =

                s.posting.beat ||

                "UNKNOWN";

            analytics.byBeat[beat] =

                (

                    analytics.byBeat[beat] ||

                    0

                ) + 1;

        }

    );

    /*----------------------------------
      Averages
    ----------------------------------*/

    if (

        analytics.totalStaff >

        0

    ) {

        analytics.averageDistance =

            Number(

                (

                    analytics.totalDistance /

                    analytics.totalStaff

                ).toFixed(

                    2

                )

            );

        analytics.averagePoints =

            Number(

                (

                    analytics.totalPoints /

                    analytics.totalStaff

                ).toFixed(

                    2

                )

            );

    }

    return analytics;

};
  /*=========================================================
 BUILD ANALYTICS
=========================================================*/

StaffAnalytics.buildAnalytics = function (

    analytics

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !analytics ||

        typeof analytics !== "object"

    ) {

        return null;

    }

    return {

        /*----------------------------------
          Staff
        ----------------------------------*/

        totalStaff:

            analytics.totalStaff,

        activeStaff:

            analytics.activeStaff,

        inactiveStaff:

            analytics.inactiveStaff,

        /*----------------------------------
          Duty
        ----------------------------------*/

        activeDuty:

            analytics.activeDuty,

        inactiveDuty:

            analytics.inactiveDuty,

        /*----------------------------------
          Patrol
        ----------------------------------*/

        totalDistance:

            analytics.totalDistance,

        averageDistance:

            analytics.averageDistance,

        totalSessions:

            analytics.totalSessions,

        /*----------------------------------
          GPS
        ----------------------------------*/

        totalPoints:

            analytics.totalPoints,

        averagePoints:

            analytics.averagePoints,

        /*----------------------------------
          Distribution
        ----------------------------------*/

        byRole:

            analytics.byRole,

        byDivision:

            analytics.byDivision,

        byRange:

            analytics.byRange,

        byBeat:

            analytics.byBeat,

        /*----------------------------------
          Staff List
        ----------------------------------*/

        staff:

            analytics.staff,

        /*----------------------------------
          Statistics
        ----------------------------------*/

        statistics: {

            activePercentage:

                analytics.totalStaff > 0

                    ? Number(

                        (

                            analytics.activeStaff *

                            100 /

                            analytics.totalStaff

                        ).toFixed(

                            2

                        )

                    )

                    : 0,

            inactivePercentage:

                analytics.totalStaff > 0

                    ? Number(

                        (

                            analytics.inactiveStaff *

                            100 /

                            analytics.totalStaff

                        ).toFixed(

                            2

                        )

                    )

                    : 0,

            averageDistance:

                analytics.averageDistance,

            averagePoints:

                analytics.averagePoints

        }

    };

};
  /*=========================================================
 REGISTER
=========================================================*/

GG.queryStaffAnalytics = function (

    request

) {

    return StaffAnalytics.queryStaffAnalytics(

        request

    );

};

/*=========================================================
 INITIALIZE
=========================================================*/

StaffAnalytics.initialize();

/*=========================================================
 EXPORT
=========================================================*/

GG.StaffAnalytics =

    StaffAnalytics;

console.log(

    "%cStaff Analytics Loaded",

    "color:#008000;font-weight:bold;"

);

})(window);
