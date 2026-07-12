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

        "1.1.0";

    /*--------------------------------------------------
      Ready
    --------------------------------------------------*/

    GISBusiness.ready = function () {

        return !!(

            window.allGISFeatures &&

            window.allCompartmentFeatures

        );

    };

    GISBusiness.isReady =

        GISBusiness.ready;

    /*--------------------------------------------------
      Information
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

            staffProfiles:

                window.allStaffProfiles?.length || 0,

            liveStaff:

                window.liveStaffCache?.length || 0,

            tracks:

                window.staffTracks?.length || 0,

            sessions:

                Object.keys(

                    window.sessionTrackCache || {}

                ).length,

            monthlyCache:

                Object.keys(

                    window.monthlyStatusCache || {}

                ).length,

            analyticsCache:

                Object.keys(

                    window.gisAnalyticsCache || {}

                ).length,

            spatialIndex:

                !!window.compartmentSpatialIndexReady,

            mapLoaded:

                !!window.map

        };

    };

    /*--------------------------------------------------
      Filter
    --------------------------------------------------*/

    GISBusiness.getFilter = function () {

        return window.gisFilter || {};

    };

    GISBusiness.getCurrentDivision = function () {

        return (

            window.gisFilter?.division ||

            null

        );

    };

    GISBusiness.getCurrentRange = function () {

        return (

            window.gisFilter?.range ||

            null

        );

    };

    GISBusiness.getCurrentBeat = function () {

        return (

            window.gisFilter?.beat ||

            window.currentBeat ||

            null

        );

    };

    GISBusiness.getCurrentCompartment = function () {

        return (

            window.gisFilter?.compartment ||

            null

        );

    };

    /*--------------------------------------------------
      Selection
    --------------------------------------------------*/

    GISBusiness.getCurrentGeometry = function () {

        return (

            window.currentSelectedGeometry ||

            null

        );

    };

    GISBusiness.hasSelection = function () {

        return !!(

            window.currentSelectedGeometry

        );

    };

    /*--------------------------------------------------
      GIS
    --------------------------------------------------*/

    GISBusiness.getGIS = function () {

        return (

            window.allGISFeatures ||

            []

        );

    };

    GISBusiness.getCompartments = function () {

        return (

            window.allCompartmentFeatures ||

            []

        );

    };

    GISBusiness.getVillages = function () {

        return (

            window.__villageCache ||

            []

        );

    };

    /*--------------------------------------------------
      Staff
    --------------------------------------------------*/

    GISBusiness.getStaffProfiles = function () {

        return (

            window.allStaffProfiles ||

            []

        );

    };

    GISBusiness.getLiveStaff = function () {

        return (

            window.liveStaffCache ||

            []

        );

    };

    GISBusiness.getStaffMarkers = function () {

        return (

            window.staffMarkers ||

            {}

        );

    };

    GISBusiness.getStaffTracks = function () {

        return (

            window.staffTracks ||

            []

        );

    };

    GISBusiness.getActiveSessions = function () {

        return (

            window.activeSessionMap ||

            {}

        );

    };

    /*--------------------------------------------------
      Patrol
    --------------------------------------------------*/

    GISBusiness.getTracks = function () {

        return (

            window.staffTracks ||

            []

        );

    };

    GISBusiness.getSessions = function () {

        return (

            window.sessionTrackCache ||

            {}

        );

    };

    GISBusiness.getPatrolCache = function () {

        return (

            window.patrolTrackCache ||

            {}

        );

    };

    GISBusiness.getTrackDistanceMap = function () {

        return (

            window.trackDistanceMap ||

            {}

        );

    };

    GISBusiness.getTrackPointCount = function () {

        return (

            window.trackPointCount ||

            {}

        );

    };

    /*--------------------------------------------------
      Analytics
    --------------------------------------------------*/

    GISBusiness.getAnalyticsCache = function () {

        return (

            window.gisAnalyticsCache ||

            {}

        );

    };

    GISBusiness.getMonthlyCache = function () {

        return (

            window.monthlyStatusCache ||

            {}

        );

    };

    /*--------------------------------------------------
      Spatial Index
    --------------------------------------------------*/

    GISBusiness.getSpatialIndex = function () {

        return (

            window.compartmentSpatialIndex ||

            null

        );

    };

    GISBusiness.isSpatialIndexReady = function () {

        return !!(

            window.compartmentSpatialIndexReady

        );

    };

    /*--------------------------------------------------
      Map
    --------------------------------------------------*/

    GISBusiness.getMap = function () {

        return (

            window.map ||

            null

        );

    };

    GISBusiness.getLayerControl = function () {

        return (

            window.layerControl ||

            null

        );

    };

    GISBusiness.getRootLayer = function () {

        return (

            window.rootLayer ||

            null

        );

    };

    GISBusiness.getDivisionLayer = function () {

        return (

            window.divisionLayer ||

            null

        );

    };

    GISBusiness.getRangeLayer = function () {

        return (

            window.rangeLayer ||

            null

        );

    };

    GISBusiness.getBeatLayer = function () {

        return (

            window.beatLayer ||

            null

        );

    };

    GISBusiness.getCompartmentLayer = function () {

        return (

            window.compartmentLayer ||

            null

        );

    };

    GISBusiness.getStaffLayer = function () {

        return (

            window.staffLayer ||

            null

        );

    };

    GISBusiness.getVillageLayer = function () {

        return (

            window.villageLayer ||

            null

        );

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
