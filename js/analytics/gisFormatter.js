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

    GISFormatter.format = function (

        response

    ) {

        if (

            !response

        ) {

            return "";

        }

        if (

            typeof response ===

            "string"

        ) {

            return response;

        }

        return JSON.stringify(

            response,

            null,

            2

        );

    };

    /*--------------------------------------------------
      Current Filter
    --------------------------------------------------*/

    GISFormatter.formatFilter = function () {

        return GISFormatter.format(

            Query.getFilter()

        );

    };

    /*--------------------------------------------------
      Current Selection
    --------------------------------------------------*/

    GISFormatter.formatSelection = function () {

        return GISFormatter.format(

            {

                division:

                    Query.getCurrentDivision(),

                range:

                    Query.getCurrentRange(),

                beat:

                    Query.getCurrentBeat(),

                compartment:

                    Query.getCurrentCompartment()

            }

        );

    };

    /*--------------------------------------------------
      Beat Summary
    --------------------------------------------------*/

    GISFormatter.formatBeatSummary = function (

        beat

    ) {

        return GISFormatter.format(

            Query.getBeatSummary(

                beat

            )

        );

    };

    /*--------------------------------------------------
      Range Summary
    --------------------------------------------------*/

    GISFormatter.formatRangeSummary = function (

        range

    ) {

        return GISFormatter.format(

            Query.getRangeSummary(

                range

            )

        );

    };

    /*--------------------------------------------------
      Division Summary
    --------------------------------------------------*/

    GISFormatter.formatDivisionSummary = function (

        division

    ) {

        return GISFormatter.format(

            Query.getDivisionSummary(

                division

            )

        );

    };

    /*--------------------------------------------------
      Staff Inside Beat
    --------------------------------------------------*/

    GISFormatter.formatBeatStaff = function (

        beat

    ) {

        return GISFormatter.format(

            Query.findStaffInsideBeat(

                beat

            )

        );

    };

    /*--------------------------------------------------
      Staff Inside Range
    --------------------------------------------------*/

    GISFormatter.formatRangeStaff = function (

        range

    ) {

        return GISFormatter.format(

            Query.findStaffInsideRange(

                range

            )

        );

    };

    /*--------------------------------------------------
      Staff Inside Division
    --------------------------------------------------*/

    GISFormatter.formatDivisionStaff = function (

        division

    ) {

        return GISFormatter.format(

            Query.findStaffInsideDivision(

                division

            )

        );

    };

    /*--------------------------------------------------
      GIS Info
    --------------------------------------------------*/

    GISFormatter.formatInfo = function () {

        return GISFormatter.format(

            Query.info()

        );

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
