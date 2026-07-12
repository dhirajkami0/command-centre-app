/*==================================================
  GIS BUSINESS
==================================================*/

window.GreenGuardAI ??= {};

GreenGuardAI.GISBusiness = Object.create(null);

/*==================================================
  CONFIG
==================================================*/

GreenGuardAI.GISBusiness.VERSION = "1.0.0";

/*==================================================
  READY?
==================================================*/

GreenGuardAI.GISBusiness.isReady = function () {

    return (

        Array.isArray(window.allGISFeatures) &&

        window.allGISFeatures.length > 0 &&

        Array.isArray(window.allCompartmentFeatures)

    );

};

/*==================================================
  CURRENT FILTER
==================================================*/

GreenGuardAI.GISBusiness.getCurrentFilter = function () {

    return {

        division:

            window.gisFilter?.division ||

            "ALL",

        range:

            window.gisFilter?.range ||

            "ALL",

        beat:

            window.gisFilter?.beat ||

            "ALL",

        compartment:

            window.gisFilter?.compartment ||

            "ALL"

    };

};

/*==================================================
  CURRENT SELECTION
==================================================*/

GreenGuardAI.GISBusiness.getCurrentSelection = function () {

    return window.currentSelectedGeometry ||

           null;

};

/*==================================================
  ACTIVE POPUP
==================================================*/

GreenGuardAI.GISBusiness.getPopupContext = function () {

    return window.activePopupContext ||

           null;

};

/*==================================================
  GIS FEATURES
==================================================*/

GreenGuardAI.GISBusiness.getGISFeatures = function () {

    return window.allGISFeatures ||

           [];

};

/*==================================================
  COMPARTMENTS
==================================================*/

GreenGuardAI.GISBusiness.getCompartments = function () {

    return window.allCompartmentFeatures ||

           [];

};

/*==================================================
  VILLAGES
==================================================*/

GreenGuardAI.GISBusiness.getVillages = function () {

    return window.__villageCache ||

           [];

};

/*==================================================
  MONTHLY CACHE
==================================================*/

GreenGuardAI.GISBusiness.getMonthlyStatus = function (

    key = "btr_all"

) {

    return (

        window.monthlyStatusCache?.[key] ||

        null

    );

};

/*==================================================
  SESSION TRACK
==================================================*/

GreenGuardAI.GISBusiness.getSessionTrack = function (

    sessionId

) {

    return (

        window.sessionTrackCache?.[sessionId] ||

        []

    );

};

/*==================================================
  LIVE GPS
==================================================*/

GreenGuardAI.GISBusiness.getLatestGPS = function () {

    return window.latestGps ||

           null;

};

/*==================================================
  ACTIVE SESSION
==================================================*/

GreenGuardAI.GISBusiness.getActiveSession = function (

    cleanName

) {

    return (

        window.activeSessionMap?.[cleanName] ||

        null

    );

};

/*==================================================
  ANALYTICS CACHE
==================================================*/

GreenGuardAI.GISBusiness.getAnalyticsCache = function () {

    return window.gisAnalyticsCache ||

           {};

};

/*==================================================
  INFO
==================================================*/

GreenGuardAI.GISBusiness.info = function () {

    return {

        ready:

            GreenGuardAI.GISBusiness.isReady(),

        gis:

            window.allGISFeatures?.length ||

            0,

        compartments:

            window.allCompartmentFeatures?.length ||

            0,

        villages:

            window.__villageCache?.length ||

            0,

        monthlyCache:

            Object.keys(

                window.monthlyStatusCache ||

                {}

            ).length,

        analyticsCache:

            Object.keys(

                window.gisAnalyticsCache ||

                {}

            ).length

    };

};
