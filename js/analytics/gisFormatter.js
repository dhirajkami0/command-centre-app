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

    /*--------------------------------------------------
      Response
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
      Info
    --------------------------------------------------*/

    GISFormatter.formatInfo = function (

        info,

        request = {}

    ) {

        const r =

            GISFormatter.createResponse(

                request

            );

        r.success = true;

        r.data = info;

        r.markdown =

`# 🌍 GIS INFORMATION

• GIS Features : ${info.gis}

• Compartments : ${info.compartments}

• Villages : ${info.villages}

• Staff Profiles : ${info.staffProfiles}

• Live Staff : ${info.liveStaff}

• Patrol Tracks : ${info.tracks}

• Sessions : ${info.sessions}

• Spatial Index : ${info.spatialIndex ? "Ready" : "Not Ready"}

• Map Loaded : ${info.mapLoaded ? "Yes" : "No"}`;

        return r;

    };

    /*--------------------------------------------------
      Filter
    --------------------------------------------------*/

    GISFormatter.formatFilter = function (

        filter,

        request = {}

    ) {

        const r =

            GISFormatter.createResponse(

                request

            );

        r.success = true;

        r.data = filter;

        r.markdown =

`# 🗺 CURRENT FILTER

Division : ${filter.division || "-"}

Range : ${filter.range || "-"}

Beat : ${filter.beat || "-"}

Compartment : ${filter.compartment || "-"}`;

        return r;

    };

    /*--------------------------------------------------
      Selection
    --------------------------------------------------*/

    GISFormatter.formatSelection = function (

        geometry,

        request = {}

    ) {

        const r =

            GISFormatter.createResponse(

                request

            );

        r.success = true;

        r.data = geometry;

        r.markdown =

geometry ?

`# 📍 CURRENT SELECTION

Geometry Type : ${geometry.type}`

:

`# 📍 CURRENT SELECTION

No geometry selected.`;

        return r;

    };

    /*--------------------------------------------------
      Jurisdiction
    --------------------------------------------------*/

    GISFormatter.formatJurisdiction = function (

        data,

        request = {}

    ) {

        const r =

            GISFormatter.createResponse(

                request

            );

        r.success = true;

        r.data = data;

        r.markdown =

`# 🌲 CURRENT JURISDICTION

Division : ${data.division || "-"}

Range : ${data.range || "-"}

Beat : ${data.beat || "-"}

Compartment : ${data.compartment || "-"}`;

        return r;

    };

    /*--------------------------------------------------
      List
    --------------------------------------------------*/

    GISFormatter.formatList = function (

        title,

        list,

        request = {}

    ) {

        const r =

            GISFormatter.createResponse(

                request

            );

        r.success = true;

        r.data = list;

        r.markdown =

`# ${title}

Total : ${list.length}`;

        return r;

    };

    /*--------------------------------------------------
      Export
    --------------------------------------------------*/

    GG.GISFormatter =

        Object.freeze(

            GISFormatter

        );

    console.log(

        "GIS Formatter Loaded",

        GISFormatter.VERSION

    );

})(

    window.GreenGuardAI

);
