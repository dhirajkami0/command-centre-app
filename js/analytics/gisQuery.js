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


  /*--------------------------------------------------
  Hierarchy
--------------------------------------------------*/

/*--------------------------------------------------
  Hierarchy
--------------------------------------------------*/

GISQuery.getHierarchy = function (

    value

) {

    const feature =

        GG.GISEntities.search(

            value

        );

    if (

        !feature

    ) {

        return null;

    }

    const p =

        feature.properties ||

        {};

    return {

        feature:

            feature,

        division:

            p.division ||

            "",

        range:

            p.range ||

            "",

        beat:

            p.beat ||

            "",

        compartment:

            p.compartment ||

            "",

        village:

            p.village ||

            ""

    };

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
  Beat Summary
--------------------------------------------------*/

GISQuery.getBeatSummary = function (

    beat

) {

    if (

        !beat

    ) {

        return null;

    }

    const feature =

        GG.GISEntities.search(

            beat

        );

    const staff =

    GISQuery.findStaffInsideBeat(

        beat

    ) || [];

    const onDutyStaff =

        staff.filter(

            s =>

                s.dutyActive === true

        );

    return {

        beat:

            beat,

        feature:

            feature,

        /*----------------------------------
          Backward Compatible
        ----------------------------------*/

        staff:

            staff,

        staffCount:

            staff.length,

        /*----------------------------------
          Explicit Presence
        ----------------------------------*/

        presentStaff:

            staff,

        presentStaffCount:

            staff.length,

        /*----------------------------------
          Duty
        ----------------------------------*/

        onDutyStaff:

            onDutyStaff,

        onDutyStaffCount:

            onDutyStaff.length

    };

};

/*--------------------------------------------------
  Range Summary
--------------------------------------------------*/

/*--------------------------------------------------
  Range Summary
--------------------------------------------------*/

GISQuery.getRangeSummary = function (

    range

) {

    if (

        !range

    ) {

        return null;

    }

    const feature =

        GG.GISEntities.search(

            range

        );

    const staff =

        GISQuery.findStaffInsideRange(

            range

        )|| [];

    const onDutyStaff =

        staff.filter(

            s =>

                s.dutyActive === true

        );

    return {

        range:

            range,

        feature:

            feature,

        /*----------------------------------
          Backward Compatible
        ----------------------------------*/

        staff:

            staff,

        staffCount:

            staff.length,

        /*----------------------------------
          Explicit Presence
        ----------------------------------*/

        presentStaff:

            staff,

        presentStaffCount:

            staff.length,

        /*----------------------------------
          Duty
        ----------------------------------*/

        onDutyStaff:

            onDutyStaff,

        onDutyStaffCount:

            onDutyStaff.length

    };

};

/*--------------------------------------------------
  Division Summary
--------------------------------------------------*/

GISQuery.getDivisionSummary = function (

    division

) {

    if (

        !division

    ) {

        return null;

    }

    const feature =

        GG.GISEntities.search(

            division

        );

    const staff =

        GISQuery.findStaffInsideDivision(

            division

        )|| [];

    const onDutyStaff =

        staff.filter(

            s =>

                s.dutyActive === true

        );

    return {

        division:

            division,

        feature:

            feature,

        /*----------------------------------
          Backward Compatible
        ----------------------------------*/

        staff:

            staff,

        staffCount:

            staff.length,

        /*----------------------------------
          Explicit Presence
        ----------------------------------*/

        presentStaff:

            staff,

        presentStaffCount:

            staff.length,

        /*----------------------------------
          Duty
        ----------------------------------*/

        onDutyStaff:

            onDutyStaff,

        onDutyStaffCount:

            onDutyStaff.length

    };

};  /*--------------------------------------------------
  Staff Presence
--------------------------------------------------*/

GISQuery.getStaffPresence = function (

    jurisdiction

) {

    if (

        !jurisdiction

    ) {

        return [];

    }

    /*----------------------------------
      String Input
    ----------------------------------*/

    if (

        typeof jurisdiction ===

        "string"

    ) {

        const key =

            typeof GG.normalizeName ===

            "function"

                ?

                GG.normalizeName(

                    jurisdiction

                )

                :

                String(

                    jurisdiction

                )

                .trim()

                .toUpperCase()

                .replace(

                    /[\s_\-()]+/g,

                    ""

                );

        const index =

            GG.GISEntities.build();

        /*------------------------------
          Circle
        ------------------------------*/

        if (

            index.circles &&

            index.circles[

                key

            ] &&

            typeof GISQuery.findStaffInsideCircle ===

            "function"

        ) {

            return (

                GISQuery.findStaffInsideCircle(

                    jurisdiction

                ) || []

            );

        }

        /*------------------------------
          Division
        ------------------------------*/

        if (

            index.divisions[

                key

            ]

        ) {

            return (

                GISQuery.findStaffInsideDivision(

                    jurisdiction

                ) || []

            );

        }

        /*------------------------------
          Range
        ------------------------------*/

        if (

            index.ranges[

                key

            ]

        ) {

            return (

                GISQuery.findStaffInsideRange(

                    jurisdiction

                ) || []

            );

        }

        /*------------------------------
          Beat
        ------------------------------*/

        if (

            index.beats[

                key

            ]

        ) {

            return (

                GISQuery.findStaffInsideBeat(

                    jurisdiction

                ) || []

            );

        }

        /*------------------------------
          Compartment
        ------------------------------*/

        if (

            index.compartments[

                key

            ]

        ) {

            return (

                GISQuery.findStaffInsideCompartment(

                    jurisdiction

                ) || []

            );

        }

        /*------------------------------
          Village
        ------------------------------*/

        if (

            index.villages[

                key

            ] &&

            typeof GISQuery.findStaffInsideVillage ===

            "function"

        ) {

            return (

                GISQuery.findStaffInsideVillage(

                    jurisdiction

                ) || []

            );

        }

        return [];

    }

    /*----------------------------------
      Compartment
    ----------------------------------*/

    if (

        jurisdiction.compartment

    ) {

        return (

            GISQuery.findStaffInsideCompartment(

                jurisdiction.compartment

            ) || []

        );

    }

    /*----------------------------------
      Beat
    ----------------------------------*/

    if (

        jurisdiction.beat

    ) {

        return (

            GISQuery.findStaffInsideBeat(

                jurisdiction.beat

            ) || []

        );

    }

    /*----------------------------------
      Range
    ----------------------------------*/

    if (

        jurisdiction.range

    ) {

        return (

            GISQuery.findStaffInsideRange(

                jurisdiction.range

            ) || []

        );

    }

    /*----------------------------------
      Division
    ----------------------------------*/

    if (

        jurisdiction.division

    ) {

        return (

            GISQuery.findStaffInsideDivision(

                jurisdiction.division

            ) || []

        );

    }

    /*----------------------------------
      Circle
    ----------------------------------*/

    if (

        jurisdiction.circle &&

        typeof GISQuery.findStaffInsideCircle ===

        "function"

    ) {

        return (

            GISQuery.findStaffInsideCircle(

                jurisdiction.circle

            ) || []

        );

    }

    return [];

};
  /*--------------------------------------------------
  Staff Presence Count
--------------------------------------------------*/

GISQuery.getStaffPresenceCount = function (

    jurisdiction

) {

    const staff =

        GISQuery.getStaffPresence(

            jurisdiction

        );

    return {

        staff:

            staff,

        count:

            staff.length

    };

};

/*--------------------------------------------------
  Staff On Duty
--------------------------------------------------*/

GISQuery.getStaffOnDuty = function (

    jurisdiction

) {

    const staff =

        GISQuery.getStaffPresence(

            jurisdiction

        );

    const onDuty =

        staff.filter(

            s =>

                s.dutyActive === true

        );

    return {

        staff:

            onDuty,

        count:

            onDuty.length

    };

};

  /*--------------------------------------------------
  Current Circle
--------------------------------------------------*/

GISQuery.getCurrentCircle = function () {

    return GIS.getCurrentCircle();

};

/*--------------------------------------------------
  Staff Inside Circle
--------------------------------------------------*/

GISQuery.findStaffInsideCircle = function (

    circle

) {

    return GG.StaffGIS.findStaffInsideCircle(

        circle

    );

};

/*--------------------------------------------------
  Circle Summary
--------------------------------------------------*/

/*--------------------------------------------------
  Circle Summary
--------------------------------------------------*/

GISQuery.getCircleSummary = function (

    circle

) {

    if (

        !circle

    ) {

        return null;

    }

    const feature =

        GG.GISEntities.search(

            circle

        );

    const staff =

        GISQuery.findStaffInsideCircle(

            circle

        )|| [];

    const onDutyStaff =

        staff.filter(

            s =>

                s.dutyActive === true

        );

    return {

        circle:

            circle,

        feature:

            feature,

        /*----------------------------------
          Backward Compatible
        ----------------------------------*/

        staff:

            staff,

        staffCount:

            staff.length,

        /*----------------------------------
          Explicit Presence
        ----------------------------------*/

        presentStaff:

            staff,

        presentStaffCount:

            staff.length,

        /*----------------------------------
          Duty
        ----------------------------------*/

        onDutyStaff:

            onDutyStaff,

        onDutyStaffCount:

            onDutyStaff.length

    };

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
