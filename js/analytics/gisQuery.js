/*=========================================================
  GreenGuard AI
  GIS Query Layer
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

    const GIS =

        GG.GISBusiness;

    /*--------------------------------------------------
      Information
    --------------------------------------------------*/

    GISQuery.info = function () {

        return GIS.info();

    };

    /*--------------------------------------------------
      Ready
    --------------------------------------------------*/

    GISQuery.isReady = function () {

        return GIS.isReady();

    };
GISQuery.findContainingCompartment = function (

    lat,

    lng

) {

    return GIS.findContainingCompartment(

        lat,

        lng

    );

};

  /*--------------------------------------------------
  Nearest Compartment
--------------------------------------------------*/

GISQuery.findNearestCompartment = function (

    lat,

    lng

) {

    return GIS.findNearestCompartment(

        lat,

        lng

    );

};

  /*--------------------------------------------------
  Hierarchy
--------------------------------------------------*/

GISQuery.getHierarchy = function (

    value

) {

    return GG.GISEntities.getHierarchy(

        value

    );

};

  /*--------------------------------------------------
  Staff Inside Compartment
--------------------------------------------------*/

GISQuery.findStaffInsideCompartment = function (

    compartment

) {

    return GG.StaffGIS.findStaffInsideCompartment(

        compartment

    );

};

  /*--------------------------------------------------
  Staff Inside Beat
--------------------------------------------------*/

GISQuery.findStaffInsideBeat = function (

    beat

) {

    return GG.StaffGIS.findStaffInsideBeat(

        beat

    );

};
  /*--------------------------------------------------
  Staff Inside Range
--------------------------------------------------*/

GISQuery.findStaffInsideRange = function (

    range

) {

    return GG.StaffGIS.findStaffInsideRange(

        range

    );

};
  /*--------------------------------------------------
  Staff Inside Division
--------------------------------------------------*/

GISQuery.findStaffInsideDivision = function (

    division

) {

    return GG.StaffGIS.findStaffInsideDivision(

        division

    );

};
    /*--------------------------------------------------
      Filter
    --------------------------------------------------*/

    GISQuery.getFilter = function () {

        return GIS.getFilter();

    };

    GISQuery.getCurrentDivision = function () {

        return GIS.getCurrentDivision();

    };

    GISQuery.getCurrentRange = function () {

        return GIS.getCurrentRange();

    };

    GISQuery.getCurrentBeat = function () {

        return GIS.getCurrentBeat();

    };

    GISQuery.getCurrentCompartment = function () {

        return GIS.getCurrentCompartment();

    };

    /*--------------------------------------------------
      Selection
    --------------------------------------------------*/

    GISQuery.getCurrentGeometry = function () {

        return GIS.getCurrentGeometry();

    };

    GISQuery.hasSelection = function () {

        return GIS.hasSelection();

    };

    /*--------------------------------------------------
      GIS
    --------------------------------------------------*/

    GISQuery.getGIS = function () {

        return GIS.getGIS();

    };

    GISQuery.getCompartments = function () {

        return GIS.getCompartments();

    };

    GISQuery.getVillages = function () {

        return GIS.getVillages();

    };

    /*--------------------------------------------------
      Staff
    --------------------------------------------------*/

    GISQuery.getStaffProfiles = function () {

        return GIS.getStaffProfiles();

    };

    GISQuery.getLiveStaff = function () {

        return GIS.getLiveStaff();

    };

    GISQuery.getStaffMarkers = function () {

        return GIS.getStaffMarkers();

    };

    GISQuery.getStaffTracks = function () {

        return GIS.getStaffTracks();

    };

    GISQuery.getActiveSessions = function () {

        return GIS.getActiveSessions();

    };

    /*--------------------------------------------------
      Patrol
    --------------------------------------------------*/

    GISQuery.getTracks = function () {

        return GIS.getTracks();

    };

    GISQuery.getSessions = function () {

        return GIS.getSessions();

    };

    GISQuery.getPatrolCache = function () {

        return GIS.getPatrolCache();

    };

    GISQuery.getTrackDistanceMap = function () {

        return GIS.getTrackDistanceMap();

    };

    GISQuery.getTrackPointCount = function () {

        return GIS.getTrackPointCount();

    };

    /*--------------------------------------------------
      Analytics
    --------------------------------------------------*/

    GISQuery.getAnalyticsCache = function () {

        return GIS.getAnalyticsCache();

    };

    GISQuery.getMonthlyCache = function () {

        return GIS.getMonthlyCache();

    };

    /*--------------------------------------------------
      Spatial Index
    --------------------------------------------------*/

    GISQuery.getSpatialIndex = function () {

        return GIS.getSpatialIndex();

    };

    GISQuery.isSpatialIndexReady = function () {

        return GIS.isSpatialIndexReady();

    };

    /*--------------------------------------------------
      Map
    --------------------------------------------------*/

    GISQuery.getMap = function () {

        return GIS.getMap();

    };

    GISQuery.getLayerControl = function () {

        return GIS.getLayerControl();

    };

    GISQuery.getRootLayer = function () {

        return GIS.getRootLayer();

    };

    GISQuery.getDivisionLayer = function () {

        return GIS.getDivisionLayer();

    };

    GISQuery.getRangeLayer = function () {

        return GIS.getRangeLayer();

    };

    GISQuery.getBeatLayer = function () {

        return GIS.getBeatLayer();

    };

    GISQuery.getCompartmentLayer = function () {

        return GIS.getCompartmentLayer();

    };

    GISQuery.getStaffLayer = function () {

        return GIS.getStaffLayer();

    };

    GISQuery.getVillageLayer = function () {

        return GIS.getVillageLayer();

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
