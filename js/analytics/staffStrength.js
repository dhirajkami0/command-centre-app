(function (window) {

"use strict";

window.GreenGuardAI =
    window.GreenGuardAI || {};

const AnalyticsEngine =
    window.GreenGuardAI.AnalyticsEngine;

if (!AnalyticsEngine)
    return;

/*=========================================================
 STAFF STRENGTH
=========================================================*/

AnalyticsEngine.queryStaffStrength = function (filters = {}) {

    console.log(
        "👥 STAFF STRENGTH"
    );

    let staff =
        Object.values(
            AnalyticsEngine.staffIndex || {}
        );

    if (filters.division) {

        staff = staff.filter(s =>
            String(s.division || "")
            .toUpperCase() ===
            String(filters.division)
            .toUpperCase()
        );

    }

    if (filters.range) {

        staff = staff.filter(s =>
            String(s.range || "")
            .toUpperCase() ===
            String(filters.range)
            .toUpperCase()
        );

    }

    if (filters.beat) {

        staff = staff.filter(s =>
            String(s.beat || "")
            .toUpperCase() ===
            String(filters.beat)
            .toUpperCase()
        );

    }

    const designation = {};
    const role = {};

    let dutyActive = 0;

    for (const s of staff) {

        const d =
            s.designation || "UNKNOWN";

        designation[d] =
            (designation[d] || 0) + 1;

        const r =
            s.role || "UNKNOWN";

        role[r] =
            (role[r] || 0) + 1;

        if (s.dutyActive)
            dutyActive++;

    }

    return {

        success: true,

        intent:
            "staffStrength",

        total:
            staff.length,

        active:
            dutyActive,

        inactive:
            staff.length - dutyActive,

        designation,

        role

    };

};

/*=========================================================
 ROLE COUNT
=========================================================*/

AnalyticsEngine.countByRole = function (role) {

    return Object.values(
        AnalyticsEngine.staffIndex || {}
    ).filter(s =>
        String(s.role || "")
        .toUpperCase() ===
        String(role)
        .toUpperCase()
    ).length;

};

/*=========================================================
 DESIGNATION COUNT
=========================================================*/

AnalyticsEngine.countByDesignation = function (designation) {

    return Object.values(
        AnalyticsEngine.staffIndex || {}
    ).filter(s =>
        String(s.designation || "")
        .toUpperCase() ===
        String(designation)
        .toUpperCase()
    ).length;

};

/*=========================================================
 ACTIVE STAFF
=========================================================*/

AnalyticsEngine.countDutyActive = function () {

    return Object.values(
        AnalyticsEngine.staffIndex || {}
    ).filter(s => s.dutyActive)
    .length;

};

/*=========================================================
 DIVISION COUNT
=========================================================*/

AnalyticsEngine.countByDivision = function () {

    const result = {};

    Object.values(
        AnalyticsEngine.staffIndex || {}
    ).forEach(s => {

        const d =
            s.division || "UNKNOWN";

        result[d] =
            (result[d] || 0) + 1;

    });

    return result;

};

/*=========================================================
 RANGE COUNT
=========================================================*/

AnalyticsEngine.countByRange = function () {

    const result = {};

    Object.values(
        AnalyticsEngine.staffIndex || {}
    ).forEach(s => {

        const r =
            s.range || "UNKNOWN";

        result[r] =
            (result[r] || 0) + 1;

    });

    return result;

};

/*=========================================================
 BEAT COUNT
=========================================================*/

AnalyticsEngine.countByBeat = function () {

    const result = {};

    Object.values(
        AnalyticsEngine.staffIndex || {}
    ).forEach(s => {

        const b =
            s.beat || "UNKNOWN";

        result[b] =
            (result[b] || 0) + 1;

    });

    return result;

};

console.log(
    "%cStaff Strength Module Loaded",
    "color:#1E90FF;font-weight:bold;"
);

})(window);
