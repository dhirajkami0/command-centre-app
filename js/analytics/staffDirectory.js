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
        "Filters :",
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
        "Initial Staff :",
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
        "Final Staff :",
        rows.length
    );

    console.groupEnd();

    return {

        success: true,

        total: rows.length,

        rows: rows,

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

    return rows;

};

})(window);
