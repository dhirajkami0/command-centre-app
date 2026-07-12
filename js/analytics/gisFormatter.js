/*=========================================================
  GreenGuard AI
  GIS Formatter
=========================================================*/

window.GreenGuardAI =
    window.GreenGuardAI || {};

(function (

    GG

) {

    "use strict";

    const GISFormatter = {};

    GISFormatter.VERSION =

        "1.0.0";

    const Query =

        GG.GISQuery;

    /*--------------------------------------------------
      Format
    --------------------------------------------------*/

/*--------------------------------------------------
  Create Response
--------------------------------------------------*/

GISFormatter.createResponse = function (

    request = {}

) {

    return {

        success:

            false,

        source:

            request.source ||

            "LOCAL",

        module:

            "GISFormatter",

        intent:

            request.intent ||

            "",

        confidence:

            request.confidence ||

            0,

        markdown:

            "",

        html:

            "",

        cards:

            [],

        data:

            null

    };

};

/*--------------------------------------------------
  Current GIS Location
--------------------------------------------------*/

GISFormatter.formatCurrentLocation = function (

    request = {}

) {

    const response =

        GISFormatter.createResponse(

            request

        );

    const filter =

        Query.getFilter();

    const geometry =

        Query.getCurrentGeometry();

    response.success =

        true;

    response.data = {

        filter,

        geometry

    };

    response.markdown =

`# 📍 Current GIS Location

**Division:** ${filter.division || "-"}

**Range:** ${filter.range || "-"}

**Beat:** ${filter.beat || "-"}

**Compartment:** ${filter.compartment || "-"}

**Geometry:** ${geometry ? geometry.type : "-"}`;

    return response;

};
  /*--------------------------------------------------
  Current Village
--------------------------------------------------*/

GISFormatter.formatCurrentVillage = function (

    request = {}

) {

    const response =

        GISFormatter.createResponse(

            request

        );

    const villages =

        Query.getVillages();

    response.success =

        true;

    response.data =

        villages;

    response.markdown =

`# 🏡 Villages

**Total Villages:** ${villages.length}`;

    return response;

};
/*--------------------------------------------------
  Current Compartment
--------------------------------------------------*/

GISFormatter.formatCurrentCompartment = function (

    request = {}

) {

    const response =

        GISFormatter.createResponse(

            request

        );

    const compartment =

        Query.getCurrentCompartment();

    response.success =

        true;

    response.data =

        compartment;

    response.markdown =

`# 📍 Current Compartment

${compartment || "Not Selected"}`;

    return response;

};

  /*--------------------------------------------------
  Staff Location
--------------------------------------------------*/

GISFormatter.formatStaffLocation = function (

    cleanName,

    request = {}

) {

    const response =

        GISFormatter.createResponse(

            request

        );

    const result =

        GG.StaffGIS.locate(

            cleanName

        );

    if (

        !result

    ) {

        response.markdown =

            "# Staff Not Found";

        return response;

    }

    const profile =

        result.profile;

    const spatial =

        profile.spatial || {};

    const gps =

        profile.location || {};

    response.success =

        true;

    response.data =

        profile;

    response.markdown =

`# 📍 ${profile.identity.name}

**Current Division:** ${spatial.division || "-"}

**Current Range:** ${spatial.range || "-"}

**Current Beat:** ${spatial.beat || "-"}

**Current Compartment:** ${spatial.compartment || "-"}

**Latitude:** ${gps.lat || "-"}

**Longitude:** ${gps.lon || "-"}`;

    return response;

};
    /*--------------------------------------------------
      Beat Summary
    --------------------------------------------------*/

/*--------------------------------------------------
  Beat Summary
--------------------------------------------------*/


  /*--------------------------------------------------
  Range Summary
--------------------------------------------------*/

GISFormatter.formatRangeSummary = function (

    range,

    request = {}

) {

    const response =

        GISFormatter.createResponse(

            request

        );

    const result =

        Query.getRangeSummary(

            range

        );

    if (

        !result

    ) {

        response.markdown =

            "# Range Not Found";

        return response;

    }

    response.success =

        true;

    response.data =

        result;

    response.markdown =

`# 👥 Staff Status

**Range:** ${result.range}

**Total Staff:** ${result.staffCount}

**On Duty:** ${result.liveStaff}`;

    return response;

};
  /*--------------------------------------------------
  Division Summary
--------------------------------------------------*/

GISFormatter.formatDivisionSummary = function (

    division,

    request = {}

) {

    const response =

        GISFormatter.createResponse(

            request

        );

    const result =

        Query.getDivisionSummary(

            division

        );

    if (

        !result

    ) {

        response.markdown =

            "# Division Not Found";

        return response;

    }

    response.success =

        true;

    response.data =

        result;

    response.markdown =

`# 👥 Staff Status

**Division:** ${result.division}

**Total Staff:** ${result.staffCount}

**On Duty:** ${result.liveStaff}`;

    return response;

};
  /*--------------------------------------------------
  Beat Staff
--------------------------------------------------*/

GISFormatter.formatBeatStaff = function (

    beat,

    request = {}

) {

    const response =

        GISFormatter.createResponse(

            request

        );

    const staff =

        Query.findStaffInsideBeat(

            beat

        );

    response.success =

        true;

    response.data =

        staff;

    let md =

`# 👥 Staff in ${beat}

**Total Staff:** ${staff.length}`;

    if (

        staff.length

    ) {

        md +=

            "\n\n";

        staff.forEach(

            function (

                s,

                i

            ) {

                md +=

`${i + 1}. ${

    s.name ||

    s.cleanName

}

`;

            }

        );

    }

    response.markdown =

        md;

    return response;

};
  /*--------------------------------------------------
  Range Staff
--------------------------------------------------*/

GISFormatter.formatRangeStaff = function (

    range,

    request = {}

) {

    const response =

        GISFormatter.createResponse(

            request

        );

    const staff =

        Query.findStaffInsideRange(

            range

        );

    response.success =

        true;

    response.data =

        staff;

    let md =

`# 👥 Staff in ${range}

**Total Staff:** ${staff.length}`;

    if (

        staff.length

    ) {

        md +=

            "\n\n";

        staff.forEach(

            function (

                s,

                i

            ) {

                md +=

`${i + 1}. ${

    s.name ||

    s.cleanName

}

`;

            }

        );

    }

    response.markdown =

        md;

    return response;

};
  /*--------------------------------------------------
  Division Staff
--------------------------------------------------*/

GISFormatter.formatDivisionStaff = function (

    division,

    request = {}

) {

    const response =

        GISFormatter.createResponse(

            request

        );

    const staff =

        Query.findStaffInsideDivision(

            division

        );

    response.success =

        true;

    response.data =

        staff;

    let md =

`# 👥 Staff in ${division}

**Total Staff:** ${staff.length}`;

    if (

        staff.length

    ) {

        md +=

            "\n\n";

        staff.forEach(

            function (

                s,

                i

            ) {

                md +=

`${i + 1}. ${

    s.name ||

    s.cleanName

}

`;

            }

        );

    }

    response.markdown =

        md;

    return response;

};
  /*--------------------------------------------------
  Hierarchy
--------------------------------------------------*/

GISFormatter.formatHierarchy = function (

    value,

    request = {}

) {

    const response =

        GISFormatter.createResponse(

            request

        );

    const hierarchy =

        Query.getHierarchy(

            value

        );

    if (

        !hierarchy

    ) {

        response.markdown =

            "# Area Not Found";

        return response;

    }

    response.success =

        true;

    response.data =

        hierarchy;

    response.markdown =

`# 🌿 GIS Hierarchy

**Division:** ${hierarchy.division || "-"}

**Range:** ${hierarchy.range || "-"}

**Beat:** ${hierarchy.beat || "-"}

**Compartment:** ${hierarchy.compartment || "-"}`;

    return response;

};
  /*--------------------------------------------------
  GIS Information
--------------------------------------------------*/

GISFormatter.formatInfo = function (

    request = {}

) {

    const response =

        GISFormatter.createResponse(

            request

        );

    const info =

        Query.info();

    response.success =

        true;

    response.data =

        info;

    response.markdown =

`# 🌿 GIS Database

**Divisions:** ${info.gis}

**Compartments:** ${info.compartments}

**Villages:** ${info.villages}

**Staff Profiles:** ${info.staffProfiles}`;

    return response;

};

  /*--------------------------------------------------
  Current Selection
--------------------------------------------------*/

/*--------------------------------------------------
  Current Selection
--------------------------------------------------*/

GISFormatter.formatCurrentSelection = function (

    request = {}

) {

    const response =

        GISFormatter.createResponse(

            request

        );

    const division =

        Query.getCurrentDivision();

    const range =

        Query.getCurrentRange();

    const beat =

        Query.getCurrentBeat();

    const compartment =

        Query.getCurrentCompartment();

    response.success =

        true;

    response.data = {

        division,

        range,

        beat,

        compartment

    };

    response.markdown =

`# 📍 Current Selection

**Division:** ${division || "-"}

**Range:** ${range || "-"}

**Beat:** ${beat || "-"}

**Compartment:** ${compartment || "-"}`;

    return response;

};
  /*--------------------------------------------------
  Current Beat
--------------------------------------------------*/

GISFormatter.formatCurrentBeat = function (

    request = {}

) {

    const response =

        GISFormatter.createResponse(

            request

        );

    const beat =

        Query.getCurrentBeat();

    response.success =

        true;

    response.data =

        beat;

    response.markdown =

`# 📍 Current Beat

${beat || "Not Selected"}`;

    return response;

};
  /*--------------------------------------------------
  Current Beat
--------------------------------------------------*/

GISFormatter.formatCurrentBeat = function (

    request = {}

) {

    const response =

        GISFormatter.createResponse(

            request

        );

    const beat =

        Query.getCurrentBeat();

    response.success =

        true;

    response.data =

        beat;

    response.markdown =

`# 📍 Current Beat

${beat || "Not Selected"}`;

    return response;

};
  /*--------------------------------------------------
  Current Range
--------------------------------------------------*/

GISFormatter.formatCurrentRange = function (

    request = {}

) {

    const response =

        GISFormatter.createResponse(

            request

        );

    const range =

        Query.getCurrentRange();

    response.success =

        true;

    response.data =

        range;

    response.markdown =

`# 📍 Current Range

${range || "Not Selected"}`;

    return response;

};
  /*--------------------------------------------------
  Current Division
--------------------------------------------------*/

GISFormatter.formatCurrentDivision = function (

    request = {}

) {

    const response =

        GISFormatter.createResponse(

            request

        );

    const division =

        Query.getCurrentDivision();

    response.success =

        true;

    response.data =

        division;

    response.markdown =

`# 📍 Current Division

${division || "Not Selected"}`;

    return response;

};
    /*--------------------------------------------------
      Export
    --------------------------------------------------*/

    GG.GISFormatter =

        Object.freeze(

            GISFormatter

        );

})(

    window.GreenGuardAI

);
