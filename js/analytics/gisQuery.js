/*=========================================================
  GreenGuard AI
  GIS Query
=========================================================*/

window.GreenGuardAI =
    window.GreenGuardAI || {};

(function (

    GG

) {

    "use strict";

    const GISQuery = {};

    GISQuery.VERSION =

        "1.0.0";

    /*--------------------------------------------------
      Current Filter
    --------------------------------------------------*/

    GISQuery.queryCurrentFilter = function () {

        return {

            success: true,

            data:

                GG.GISBusiness.getFilter()

        };

    };

    /*--------------------------------------------------
      Current Selection
    --------------------------------------------------*/

    GISQuery.queryCurrentSelection = function () {

        return {

            success: true,

            data:

                GG.GISBusiness.getCurrentGeometry()

        };

    };

    /*--------------------------------------------------
      GIS Features
    --------------------------------------------------*/

    GISQuery.queryGIS = function () {

        return {

            success: true,

            data:

                GG.GISBusiness.getGIS()

        };

    };

    /*--------------------------------------------------
      Compartments
    --------------------------------------------------*/

    GISQuery.queryCompartments = function () {

        return {

            success: true,

            data:

                GG.GISBusiness.getCompartments()

        };

    };

    /*--------------------------------------------------
      Villages
    --------------------------------------------------*/

    GISQuery.queryVillages = function () {

        return {

            success: true,

            data:

                GG.GISBusiness.getVillages()

        };

    };

    /*--------------------------------------------------
      Live Staff
    --------------------------------------------------*/

    GISQuery.queryLiveStaff = function () {

        return {

            success: true,

            data:

                GG.GISBusiness.getLiveStaff()

        };

    };

    /*--------------------------------------------------
      Staff Profiles
    --------------------------------------------------*/

    GISQuery.queryStaffProfiles = function () {

        return {

            success: true,

            data:

                GG.GISBusiness.getStaffProfiles()

        };

    };

    /*--------------------------------------------------
      Patrol Tracks
    --------------------------------------------------*/

    GISQuery.queryTracks = function () {

        return {

            success: true,

            data:

                GG.GISBusiness.getTracks()

        };

    };

    /*--------------------------------------------------
      Sessions
    --------------------------------------------------*/

    GISQuery.querySessions = function () {

        return {

            success: true,

            data:

                GG.GISBusiness.getSessions()

        };

    };

    /*--------------------------------------------------
      Analytics Cache
    --------------------------------------------------*/

    GISQuery.queryAnalytics = function () {

        return {

            success: true,

            data:

                GG.GISBusiness.getAnalyticsCache()

        };

    };

    /*--------------------------------------------------
      Monthly Cache
    --------------------------------------------------*/

    GISQuery.queryMonthly = function () {

        return {

            success: true,

            data:

                GG.GISBusiness.getMonthlyCache()

        };

    };

    /*--------------------------------------------------
      GIS Information
    --------------------------------------------------*/

    GISQuery.queryInfo = function () {

        return {

            success: true,

            data:

                GG.GISBusiness.info()

        };

    };

    /*--------------------------------------------------
      Export
    --------------------------------------------------*/

    GG.GISQuery =

        Object.freeze(

            GISQuery

        );

})(

    window.GreenGuardAI

);
