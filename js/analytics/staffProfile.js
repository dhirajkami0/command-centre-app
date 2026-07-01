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

    if (!name) return null;

    const staff =
        Object.values(
            AnalyticsEngine.staffIndex || {}
        );

    console.log("Searching:", name);
    console.log("Total Staff:", staff.length);

    /*----------------------------------
      Exact Match
    ----------------------------------*/

    for (const s of staff) {

        const fields = [

            s.cleanName,
            s.name,
            s.staffName,
            s.profileName,
            s.rawName,
            s.fullName,
            s.id

        ]
        .filter(Boolean)
        .map(v => String(v).toUpperCase());

        if (fields.includes(name)) {

            console.log("✅ Exact Match", s);

            return s;

        }

    }

    /*----------------------------------
      Partial Match
    ----------------------------------*/

    for (const s of staff) {

        const fields = [

            s.cleanName,
            s.name,
            s.staffName,
            s.profileName,
            s.rawName,
            s.fullName,
            s.id

        ]
        .filter(Boolean)
        .map(v => String(v).toUpperCase());

        if (fields.some(v => v.includes(name))) {

            console.log("✅ Partial Match", s);

            return s;

        }

    }

    console.log("❌ Staff Not Found");

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

    type: "staff",

    intent: "staffProfile",

    profile: profile

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
/*=========================================================
 PHONE
=========================================================*/

AnalyticsEngine.getPhone = function (name) {

    const s =
        AnalyticsEngine.findStaff(name);

    if (!s)
        return "";

    return (

        s.phone ||

        s.mobile ||

        s.mobileNo ||

        s.phoneNumber ||

        ""

    );

};

/*=========================================================
 DESIGNATION
=========================================================*/

AnalyticsEngine.getDesignation = function (name) {

    const s =
        AnalyticsEngine.findStaff(name);

    if (!s)
        return "";

    return (

        s.designation ||

        s.post ||

        s.rank ||

        ""

    );

};

/*=========================================================
 ROLE
=========================================================*/

AnalyticsEngine.getRole = function (name) {

    const s =
        AnalyticsEngine.findStaff(name);

    if (!s)
        return "";

    return (

        s.role ||

        ""

    );

};

/*=========================================================
 BEAT
=========================================================*/

AnalyticsEngine.getBeat = function (name) {

    const s =
        AnalyticsEngine.findStaff(name);

    if (!s)
        return "";

    return (

        s.beat ||

        ""

    );

};

/*=========================================================
 RANGE
=========================================================*/

AnalyticsEngine.getRange = function (name) {

    const s =
        AnalyticsEngine.findStaff(name);

    if (!s)
        return "";

    return (

        s.range ||

        ""

    );

};

/*=========================================================
 DIVISION
=========================================================*/

AnalyticsEngine.getDivision = function (name) {

    const s =
        AnalyticsEngine.findStaff(name);

    if (!s)
        return "";

    return (

        s.division ||

        ""

    );

};

/*=========================================================
 POSTING
=========================================================*/

AnalyticsEngine.getPosting = function (name) {

    const s =
        AnalyticsEngine.findStaff(name);

    if (!s)
        return "";

    return {

        beat:

            s.beat || "",

        range:

            s.range || "",

        division:

            s.division || ""

    };

};

    /*=========================================================
 PROFILE SUMMARY
=========================================================*/

AnalyticsEngine.getProfileSummary = function (name) {

    const s =
        AnalyticsEngine.findStaff(name);

    if (!s)
        return null;

    return {

        name:
            s.name || s.staffName || "",

        designation:
            s.designation || "",

        role:
            s.role || "",

        beat:
            s.beat || "",

        range:
            s.range || "",

        division:
            s.division || "",

        phone:
            s.phone ||
            s.mobile ||
            s.mobileNo ||
            ""

    };

};
})(window);
