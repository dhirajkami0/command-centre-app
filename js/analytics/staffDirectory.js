(function (window) {

"use strict";

window.GreenGuardAI =
    window.GreenGuardAI || {};

const AnalyticsEngine =
    window.GreenGuardAI.AnalyticsEngine =
    window.GreenGuardAI.AnalyticsEngine || {};

/*----------------------------------------------------------
STAFF DIRECTORY

Purpose

Return a filtered list of staff.

Supported Filters

{
    staff,
    circle,
    division,
    range,
    beat,
    designation,
    role,
    dutyActive,
    dutyType,
    leader,
    team,
    compartment
}
----------------------------------------------------------*/

AnalyticsEngine.queryStaffDirectory =
function (filters = {}) {

    console.group(
        "👥 STAFF DIRECTORY"
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
    Apply Filters
    ----------------------------------*/

    rows =
        AnalyticsEngine.applyDirectoryFilters(
            rows,
            filters
        );

    /*----------------------------------
    Sort
    ----------------------------------*/

    rows.sort(function (a, b) {

        return String(
            a.name || ""
        ).localeCompare(

            String(
                b.name || ""
            )

        );

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

        intent: "staffDirectory",

        total: rows.length,

        data: rows,

        filters: filters

    };

};

/*----------------------------------------------------------
FILTER PIPELINE
----------------------------------------------------------*/

AnalyticsEngine.applyDirectoryFilters =
function (

    rows,

    filters

){

    if (

        !Array.isArray(rows)

    ){

        return [];

    }

    if (

        !filters

    ){

        return rows;

    }

    /*----------------------------------
    Staff
    ----------------------------------*/

    if (filters.staff) {

        rows = rows.filter(function (r) {

            return String(

                r.cleanName ||

                r.name ||

                ""

            )

            .toUpperCase()

            .includes(

                String(filters.staff)

                .toUpperCase()

            );

        });

    }

    /*----------------------------------
    Division
    ----------------------------------*/

    if (filters.division) {

        rows = rows.filter(function (r) {

            return String(

                r.division || ""

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

        rows = rows.filter(function (r) {

            return String(

                r.range || ""

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

        rows = rows.filter(function (r) {

            return String(

                r.beat || ""

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

        rows = rows.filter(function (r) {

            return String(

                r.designation || ""

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

        rows = rows.filter(function (r) {

            return String(

                r.role || ""

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

        rows = rows.filter(function (r) {

            return Boolean(

                r.dutyActive

            ) === Boolean(

                filters.dutyActive

            );

        });

    }

    return rows;

};

console.log(

    "%cStaff Directory Module Loaded",

    "color:#1976D2;font-weight:bold;"

);

})(window);
