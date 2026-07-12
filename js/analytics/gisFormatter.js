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
      Base Response
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

                null,

            metadata: {

                timestamp:

                    Date.now(),

                formatter:

                    "GISFormatter"

            }

        };

    };

    /*--------------------------------------------------
      Generic Formatter
    --------------------------------------------------*/

    GISFormatter.format = function (

        request,

        data

    ) {

        const response =

            GISFormatter.createResponse(

                request

            );

        response.success =

            true;

        response.data =

            data;

        response.markdown =

            "GIS query completed.";

        return response;

    };

    /*--------------------------------------------------
      Information
    --------------------------------------------------*/

    GISFormatter.formatInfo = function (

        request,

        data

    ) {

        const response =

            GISFormatter.createResponse(

                request

            );

        response.success =

            true;

        response.data =

            data;

        response.markdown =

            "# 🌍 GIS INFORMATION";

        return response;

    };

    /*--------------------------------------------------
      GIS Features
    --------------------------------------------------*/

    GISFormatter.formatGIS = function (

        request,

        data

    ) {

        const response =

            GISFormatter.createResponse(

                request

            );

        response.success =

            true;

        response.data =

            data;

        response.markdown =

            "# 🌍 GIS FEATURES";

        return response;

    };

    /*--------------------------------------------------
      Compartments
    --------------------------------------------------*/

    GISFormatter.formatCompartments = function (

        request,

        data

    ) {

        const response =

            GISFormatter.createResponse(

                request

            );

        response.success =

            true;

        response.data =

            data;

        response.markdown =

            "# 📦 COMPARTMENTS";

        return response;

    };

    /*--------------------------------------------------
      Villages
    --------------------------------------------------*/

    GISFormatter.formatVillages = function (

        request,

        data

    ) {

        const response =

            GISFormatter.createResponse(

                request

            );

        response.success =

            true;

        response.data =

            data;

        response.markdown =

            "# 🏡 VILLAGES";

        return response;

    };

    /*--------------------------------------------------
      Live Staff
    --------------------------------------------------*/

    GISFormatter.formatLiveStaff = function (

        request,

        data

    ) {

        const response =

            GISFormatter.createResponse(

                request

            );

        response.success =

            true;

        response.data =

            data;

        response.markdown =

            "# 👤 LIVE STAFF";

        return response;

    };

    /*--------------------------------------------------
      Tracks
    --------------------------------------------------*/

    GISFormatter.formatTracks = function (

        request,

        data

    ) {

        const response =

            GISFormatter.createResponse(

                request

            );

        response.success =

            true;

        response.data =

            data;

        response.markdown =

            "# 🚶 PATROL TRACKS";

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
