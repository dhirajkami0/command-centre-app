(function (window) {

"use strict";

window.GreenGuardAI =
    window.GreenGuardAI || {};

const AnalyticsEngine =
    window.GreenGuardAI.AnalyticsEngine;

if (!AnalyticsEngine) {

    console.error(
        "AnalyticsEngine not loaded."
    );

    return;

}

/*=========================================================
 STAFF STRENGTH
=========================================================*/

AnalyticsEngine.queryStaffStrength =
function (filters = {}) {

    /*----------------------------------
      Analytics Ready
    ----------------------------------*/

    if (!AnalyticsEngine.loaded) {

        return {

            success: false,

            type: "staff",

            intent: "staffStrength",

            data: {},

            message:
                "Analytics Engine not loaded."

        };

    }

    console.group(
        "👥 STAFF STRENGTH"
    );

    console.log(
        "Filters:",
        filters
    );

    /*----------------------------------
      Dataset
    ----------------------------------*/

    let rows =
        Object.values(
            AnalyticsEngine.staffIndex || {}
        );

    console.log(
        "Initial Staff:",
        rows.length
    );

    /*----------------------------------
      Division
    ----------------------------------*/

    if (filters.division) {

        rows = rows.filter(function (s) {

            return String(
                s.division || ""
            ).toUpperCase()

            ===

            String(
                filters.division
            ).toUpperCase();

        });

    }

    /*----------------------------------
      Range
    ----------------------------------*/

    if (filters.range) {

        rows = rows.filter(function (s) {

            return String(
                s.range || ""
            ).toUpperCase()

            ===

            String(
                filters.range
            ).toUpperCase();

        });

    }

    /*----------------------------------
      Beat
    ----------------------------------*/

    if (filters.beat) {

        rows = rows.filter(function (s) {

            return String(
                s.beat || ""
            ).toUpperCase()

            ===

            String(
                filters.beat
            ).toUpperCase();

        });

    }

    /*----------------------------------
      Designation
    ----------------------------------*/

    if (filters.designation) {

        rows = rows.filter(function (s) {

            return String(
                s.designation || ""
            ).toUpperCase()

            ===

            String(
                filters.designation
            ).toUpperCase();

        });

    }

    /*----------------------------------
      Role
    ----------------------------------*/

    if (filters.role) {

        rows = rows.filter(function (s) {

            return String(
                s.role || ""
            ).toUpperCase()

            ===

            String(
                filters.role
            ).toUpperCase();

        });

    }

    /*----------------------------------
      Duty
    ----------------------------------*/

    if (

        filters.dutyActive !== null &&

        filters.dutyActive !== undefined

    ) {

        rows = rows.filter(function (s) {

            return Boolean(
                s.dutyActive
            ) === Boolean(
                filters.dutyActive
            );

        });

    }

    /*----------------------------------
      Summary
    ----------------------------------*/

    const designation = {};

    const role = {};

    let active = 0;

    rows.forEach(function (s) {

        const d =
            s.designation ||
            "UNKNOWN";

        designation[d] =
            (designation[d] || 0) + 1;

        const r =
            s.role ||
            "UNKNOWN";

        role[r] =
            (role[r] || 0) + 1;

        if (s.dutyActive)
            active++;

    });

    console.log(
        "Final Staff:",
        rows.length
    );

    console.groupEnd();

    /*----------------------------------
      Standard Response
    ----------------------------------*/

    return {

        success: true,

        type: "staff",

        intent: "staffStrength",

        data: {

            total:
                rows.length,

            active:
                active,

            inactive:
                rows.length - active,

            designation:
                designation,

            role:
                role

        },

        filters:
            filters

    };

};

/*=========================================================
 ROLE COUNT
=========================================================*/

AnalyticsEngine.countByRole =
function (role) {

    return Object.values(
        AnalyticsEngine.staffIndex || {}
    ).filter(function (s) {

        return String(
            s.role || ""
        ).toUpperCase()

        ===

        String(
            role
        ).toUpperCase();

    }).length;

};

/*=========================================================
 DESIGNATION COUNT
=========================================================*/

AnalyticsEngine.countByDesignation =
function (designation) {

    return Object.values(
        AnalyticsEngine.staffIndex || {}
    ).filter(function (s) {

        return String(
            s.designation || ""
        ).toUpperCase()

        ===

        String(
            designation
        ).toUpperCase();

    }).length;

};

/*=========================================================
 ACTIVE STAFF
=========================================================*/

AnalyticsEngine.countDutyActive =
function () {

    return Object.values(
        AnalyticsEngine.staffIndex || {}
    ).filter(function (s) {

        return s.dutyActive;

    }).length;

};

/*=========================================================
 DIVISION COUNT
=========================================================*/

AnalyticsEngine.countByDivision =
function () {

    const result = {};

    Object.values(
        AnalyticsEngine.staffIndex || {}
    ).forEach(function (s) {

        const key =
            s.division ||
            "UNKNOWN";

        result[key] =
            (result[key] || 0) + 1;

    });

    return result;

};

/*=========================================================
 RANGE COUNT
=========================================================*/

AnalyticsEngine.countByRange =
function () {

    const result = {};

    Object.values(
        AnalyticsEngine.staffIndex || {}
    ).forEach(function (s) {

        const key =
            s.range ||
            "UNKNOWN";

        result[key] =
            (result[key] || 0) + 1;

    });

    return result;

};

/*=========================================================
 BEAT COUNT
=========================================================*/

AnalyticsEngine.countByBeat =
function () {

    const result = {};

    Object.values(
        AnalyticsEngine.staffIndex || {}
    ).forEach(function (s) {

        const key =
            s.beat ||
            "UNKNOWN";

        result[key] =
            (result[key] || 0) + 1;

    });

    return result;

};

console.log(

    "%cStaff Strength Module Loaded",

    "color:#1E90FF;font-weight:bold;"

);

})(window);
