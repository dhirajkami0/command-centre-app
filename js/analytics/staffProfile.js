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
 STAFF PROFILE MODULE
=========================================================*/

AnalyticsEngine.findStaff = function (name) {

    name = String(name || "")
        .trim()
        .toUpperCase();

    if (!name)
        return null;

    /*----------------------------------
      Exact cleanName
    ----------------------------------*/

    if (
        AnalyticsEngine.staffIndex &&
        AnalyticsEngine.staffIndex[name]
    ) {

        return AnalyticsEngine.staffIndex[name];

    }

    /*----------------------------------
      Partial Search
    ----------------------------------*/

    const staff =

        Object.values(
            AnalyticsEngine.staffIndex || {}
        );

    for (const s of staff) {

        const clean =

            String(

                s.cleanName ||

                s.name ||

                ""

            )

            .toUpperCase();

        if (

            clean.includes(name)

        ) {

            return s;

        }

    }

    return null;

};

/*=========================================================
 QUERY STAFF PROFILE
=========================================================*/

AnalyticsEngine.queryStaffProfile = function (

    filters = {}

) {

    console.log(
        "👤 STAFF PROFILE"
    );

    console.log(
        "Filters:",
        filters
    );

    let profile = null;

    /*----------------------------------
      Search by Name
    ----------------------------------*/

    if (filters.staff) {

        profile =

            AnalyticsEngine.findStaff(

                filters.staff

            );

    }

    /*----------------------------------
      No Match
    ----------------------------------*/

    if (!profile) {

        return {

            success: false,

            intent:
                "staffProfile",

            message:
                "Staff not found."

        };

    }

    /*----------------------------------
      Success
    ----------------------------------*/

    return {

        success: true,

        intent:
            "staffProfile",

        profile:
            profile

    };

};

/*=========================================================
 PROFILE EXISTS
=========================================================*/

AnalyticsEngine.hasProfile = function (

    name

) {

    return !!AnalyticsEngine.findStaff(

        name

    );

};

/*=========================================================
 GET PROFILE
=========================================================*/

AnalyticsEngine.getProfile = function (

    name

) {

    return AnalyticsEngine.findStaff(

        name

    );

};

console.log(

    "%cStaff Profile Module Loaded",

    "color:#2E8B57;font-weight:bold;"

);

})(window);
