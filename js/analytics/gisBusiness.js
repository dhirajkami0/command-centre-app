/*=========================================================
  GreenGuard AI
  GIS Business Layer
=========================================================*/

window.GreenGuardAI =
    window.GreenGuardAI || {};

(function (

    GG

) {

    "use strict";

    const GISBusiness = {};

    GISBusiness.VERSION =

        "1.0.0";

    /*--------------------------------------------------
      Ready
    --------------------------------------------------*/

    GISBusiness.ready = function () {

        return !!(

            window.allGISFeatures &&

            window.allCompartmentFeatures

        );

    };

    /*--------------------------------------------------
      Info
    --------------------------------------------------*/

    GISBusiness.info = function () {

        return {

            ready:

                GISBusiness.ready(),

            gis:

                window.allGISFeatures?.length || 0,

            compartments:

                window.allCompartmentFeatures?.length || 0,

            villages:

                window.__villageCache?.length || 0,

            monthlyCache:

                Object.keys(

                    window.monthlyStatusCache || {}

                ).length,

            analyticsCache:

                Object.keys(

                    window.gisAnalyticsCache || {}

                ).length

        };

    };

    /*--------------------------------------------------
      Current Filter
    --------------------------------------------------*/

    GISBusiness.getFilter = function () {

        return window.gisFilter || {};

    };

    /*--------------------------------------------------
      Current Geometry
    --------------------------------------------------*/

    GISBusiness.getCurrentGeometry = function () {

        return window.currentSelectedGeometry || null;

    };

    /*--------------------------------------------------
      GIS Features
    --------------------------------------------------*/

    GISBusiness.getGIS = function () {

        return window.allGISFeatures || [];

    };

    /*--------------------------------------------------
      Compartments
    --------------------------------------------------*/

    GISBusiness.getCompartments = function () {

        return window.allCompartmentFeatures || [];

    };

    /*--------------------------------------------------
      Villages
    --------------------------------------------------*/

    GISBusiness.getVillages = function () {

        return window.__villageCache || [];

    };

    /*--------------------------------------------------
      Live Staff
    --------------------------------------------------*/

    GISBusiness.getLiveStaff = function () {

        return window.liveStaffCache || [];

    };

    /*--------------------------------------------------
      Staff Profiles
    --------------------------------------------------*/

    GISBusiness.getStaffProfiles = function () {

        return window.allStaffProfiles || [];

    };

    /*--------------------------------------------------
      Patrol Tracks
    --------------------------------------------------*/

    GISBusiness.getTracks = function () {

        return window.staffTracks || [];

    };

    /*--------------------------------------------------
      Session Tracks
    --------------------------------------------------*/

    GISBusiness.getSessions = function () {

        return window.sessionTrackCache || {};

    };

    /*--------------------------------------------------
      Analytics Cache
    --------------------------------------------------*/

    GISBusiness.getAnalyticsCache = function () {

        return window.gisAnalyticsCache || {};

    };

    /*--------------------------------------------------
      Monthly Cache
    --------------------------------------------------*/

    GISBusiness.getMonthlyCache = function () {

        return window.monthlyStatusCache || {};

    };

    /*--------------------------------------------------
      Export
    --------------------------------------------------*/

    GG.GISBusiness =

        Object.freeze(

            GISBusiness

        );

})(

    window.GreenGuardAI

);
