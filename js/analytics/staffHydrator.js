/* HEADER */

(function (

    window

) {

"use strict";

/*=========================================================
  GREENGUARD NAMESPACE
=========================================================*/

const GG =

    window.GreenGuardAI ||

    window.GG ||

    {};

/*=========================================================
  STAFF HYDRATOR MODULE
=========================================================*/

const StaffHydrator =

    {};

/*=========================================================
  VERSION
=========================================================*/

StaffHydrator.VERSION =

    "2.0.0";

/*=========================================================
  DESCRIPTION
=========================================================*/

StaffHydrator.DESCRIPTION =

    "Runtime Staff Hydration Engine";

/*=========================================================
  hydrate()
=========================================================*/

/*=========================================================
  hydrate()
=========================================================*/

StaffHydrator.hydrate =

function (

    cleanName

) {

    /*----------------------------------
      Validate Name
    ----------------------------------*/

    if (

        typeof cleanName !==

        "string"

    ) {

        return null;

    }

    /*----------------------------------
      Normalize Name
    ----------------------------------*/

    cleanName =

        cleanName

            .trim()

            .toUpperCase();

    if (

        cleanName === ""

    ) {

        return null;

    }

    /*----------------------------------
      Validate StaffEntities
    ----------------------------------*/

    if (

        !GG.StaffEntities ||

        !GG.StaffEntities.cache ||

        !GG.StaffEntities.cache.entities

    ) {

        console.error(

            "StaffEntities cache unavailable."

        );

        return null;

    }

    /*----------------------------------
      Lookup Canonical Staff
    ----------------------------------*/

    const canonical =

        GG
            .StaffEntities
            .cache
            .entities
            .get(

                cleanName

            );

    if (

        !canonical

    ) {

        return null;

    }

    /*----------------------------------
      Clone Frozen Canonical Object
    ----------------------------------*/

    let hydrated;

    try {

        hydrated =

            structuredClone(

                canonical

            );

    }

    catch (

        error

    ) {

        console.error(

            "structuredClone failed",

            error

        );

        return null;

    }

    /*----------------------------------
      Ensure Mutable
    ----------------------------------*/

    if (

        Object.isFrozen(

            hydrated

        )

    ) {

        console.error(

            "Hydrated object is frozen."

        );

        return null;

    }

    /*----------------------------------
      Runtime Metadata
    ----------------------------------*/

    hydrated.runtime = {

        hydrated: true,

        hydratedAt:

            Date.now(),

        liveMerged: false,

        patrolMerged: false

    };

    /*----------------------------------
      Return
    ----------------------------------*/

    return hydrated;

};
/*=========================================================
  hydratePatrol()
=========================================================*/

/*=========================================================
  HYDRATE PATROL TRACK
-----------------------------------------------------------
  Merge patrol_tracks runtime data into the hydrated staff.

  Source

      window.patrolTrackCache

  Target

      Hydrated Staff Object

=========================================================*/

StaffHydrator.hydratePatrol =

function (

    staff,

    patrol

) {

    /*----------------------------------
      Validate Staff
    ----------------------------------*/

    if (

        !staff ||

        typeof staff !==

        "object"

    ) {

        return staff;

    }

    /*----------------------------------
      No Patrol Document
    ----------------------------------*/

    if (

        !patrol ||

        typeof patrol !==

        "object"

    ) {

        return staff;

    }

    /*----------------------------------
      Posting
    ----------------------------------*/

    if (

        staff.posting

    ) {

        staff.posting.division =

            patrol.division ??

            staff.posting.division;

        staff.posting.range =

            patrol.range ??

            staff.posting.range;

        staff.posting.beat =

            patrol.beat ??

            staff.posting.beat;

    }

    /*----------------------------------
      Assignment
    ----------------------------------*/

    if (

        staff.assignment

    ) {

        staff.assignment.assignedCompartment =

            patrol.compartment ??

            staff.assignment.assignedCompartment;

        staff.assignment.dutyType =

            patrol.dutyType ??

            staff.assignment.dutyType;

        staff.assignment.dutyActive =

            patrol.dutyActive ??

            staff.assignment.dutyActive;

        staff.assignment.status =

            patrol.status ??

            staff.assignment.status;

        staff.assignment.leader =

            patrol.leader ??

            staff.assignment.leader;

        staff.assignment.team =

            patrol.team ??

            staff.assignment.team;

    }

    /*----------------------------------
      Tracking
    ----------------------------------*/

    if (

        staff.tracking

    ) {

        staff.tracking.sessionId =

            patrol.sessionId ??

            staff.tracking.sessionId;

        staff.tracking.source =

            patrol.source ??

            staff.tracking.source;

        staff.tracking.id =

            patrol.id ??

            staff.tracking.id;

    }

    /*----------------------------------
      GPS
    ----------------------------------*/

    if (

        staff.gps

    ) {

        staff.gps.lastSeen =

            patrol.lastSeen ??

            staff.gps.lastSeen;

        staff.gps.timestamp =

            patrol.timestamp ??

            staff.gps.timestamp;

        staff.gps.updatedAt =

            patrol.updatedAt ??

            staff.gps.updatedAt;

    }

    /*----------------------------------
      Analytics
    ----------------------------------*/

    if (

        staff.analytics

    ) {

        staff.analytics.pointCount =

            patrol.pointCount ??

            staff.analytics.pointCount;

        staff.analytics.distanceKm =

            patrol.distanceKm ??

            staff.analytics.distanceKm;

        staff.analytics.startedAt =

            patrol.startedAt ??

            staff.analytics.startedAt;

        staff.analytics.endedAt =

            patrol.endedAt ??

            staff.analytics.endedAt;

        staff.analytics.monthKey =

            patrol.monthKey ??

            staff.analytics.monthKey;

        staff.analytics.createdAt =

            patrol.createdAt ??

            staff.analytics.createdAt;

        staff.analytics.updatedAt =

            patrol.updatedAt ??

            staff.analytics.updatedAt;

        staff.analytics.compartments =

            patrol.compartments ??

            staff.analytics.compartments;

        staff.analytics.simplifiedTrack =

            patrol.simplifiedTrack ??

            staff.analytics.simplifiedTrack;

        staff.analytics.startLat =

            patrol.startLat ??

            staff.analytics.startLat;

        staff.analytics.startLon =

            patrol.startLon ??

            staff.analytics.startLon;

        staff.analytics.startAccuracy =

            patrol.startAccuracy ??

            staff.analytics.startAccuracy;

    }

    /*----------------------------------
      Metadata
    ----------------------------------*/

    if (

        staff.metadata

    ) {

        staff.metadata.source =

            "PATROL_TRACKS";

    }

    /*----------------------------------
      Return Hydrated Staff
    ----------------------------------*/

    return staff;

};

/*=========================================================
  getHydratedStaff()
=========================================================*/

/*=========================================================
  GET HYDRATED STAFF
-----------------------------------------------------------
  Purpose

      Returns a fully hydrated runtime staff object.

      Hydration Order

          1. Clone Canonical Staff
          2. Lookup live_staff
          3. Merge live_staff
          4. Lookup patrol_tracks
          5. Merge patrol_tracks

  Input

      cleanName

  Output

      Hydrated Staff Object

      OR

      null
=========================================================*/

StaffHydrator.getHydratedStaff =

function (

    cleanName

) {

    /*----------------------------------
      Clone Canonical Staff
    ----------------------------------*/

    const staff =

        StaffHydrator.hydrate(

            cleanName

        );

    if (

        !staff

    ) {

        return null;

    }

    /*----------------------------------
      Lookup Live Staff
    ----------------------------------*/

    const live =

        StaffHydrator.getLiveStaff(

            cleanName

        );

    /*----------------------------------
      Merge Live Staff
    ----------------------------------*/

    if (

        live

    ) {

        StaffHydrator.hydrateLive(

            staff,

            live

        );

    }

    /*----------------------------------
      Lookup Patrol Track
    ----------------------------------*/

const patrol =

StaffHydrator.getPatrolTrack(
        cleanName

    );

    /*----------------------------------
      Merge Patrol Track
    ----------------------------------*/

    if (

        patrol

    ) {

        StaffHydrator.hydratePatrol(

            staff,

            patrol

        );

    }

    /*----------------------------------
      Return Hydrated Staff
    ----------------------------------*/

    return staff;

};
/*=========================================================
  GET LIVE STAFF DOCUMENT
-----------------------------------------------------------
  Purpose

      Locate a runtime live_staff document using
      cleanName.

  Input

      cleanName

  Output

      Live Staff Document

      OR

      null
=========================================================*/

/*=========================================================
  GET LIVE STAFF DOCUMENT
-----------------------------------------------------------
  Uses the realtime cache created by loadStaff()
=========================================================*/

StaffHydrator.getLiveStaff =

function (

    cleanName

) {

    if (

        typeof cleanName !==

        "string"

    ) {

        return null;

    }

    cleanName =

        cleanName

            .trim()

            .toUpperCase();

    if (

        cleanName === ""

    ) {

        return null;

    }

    return (

        window.liveStaffCache?.[

            cleanName

        ]

        ||

        null

    );

};/*=========================================================
  GET PATROL TRACK DOCUMENT
-----------------------------------------------------------
  Purpose

      Locate a runtime patrol_tracks document
      using cleanName.

  Input

      cleanName

  Output

      Patrol Track Document

      OR

      null
=========================================================*/

/*=========================================================
  GET PATROL TRACK DOCUMENT
-----------------------------------------------------------
  Runtime Patrol Cache

  Builds an in-memory cache from Firestore.

  Cache Key

      cleanName

  Returns

      Patrol Document

      OR

      null
=========================================================*/

StaffHydrator.getPatrolTrack =

function (

    cleanName

) {

    cleanName =

        String(

            cleanName || ""

        )

        .trim()

        .toUpperCase();

    return (

        window.patrolTrackCache?.[

            cleanName

        ]

        ||

        null

    );

};
/*=========================================================
  REGISTER MODULE
=========================================================*/

GG.StaffHydrator =

    StaffHydrator;

window.GreenGuardAI =

    GG;

window.GG =

    GG;

console.log(

    "%cStaff Hydrator Loaded",

    "color:#009688;font-weight:bold;"

);

})(

    window

);
