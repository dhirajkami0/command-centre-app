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

        !GG.StaffEntities.index ||

        !GG.StaffEntities.index.byCleanName

    ) {

        console.error(

            "StaffEntities index unavailable."

        );

        return null;

    }

    /*----------------------------------
      Lookup Canonical Staff
    ----------------------------------*/

    const matches =

        GG
            .StaffEntities
            .index
            .byCleanName
            .get(

                cleanName

            );

    if (

        !Array.isArray(

            matches

        ) ||

        matches.length === 0

    ) {

        return null;

    }

    /*----------------------------------
      Canonical Staff
    ----------------------------------*/

    const canonical =

        matches[0];

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
      Safety Check
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
      Return Mutable Copy
    ----------------------------------*/

    return hydrated;

};

/*=========================================================
  hydrateLive()
=========================================================*/

StaffHydrator.hydrateLive =

function (

    staff,

    live

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
      No Live Document
    ----------------------------------*/

    if (

        !live ||

        typeof live !==

        "object"

    ) {

        return staff;

    }

    /*----------------------------------
      Identity
    ----------------------------------*/

    if (

        staff.identity

    ) {

        staff.identity.rawName =

            live.rawName ??

            staff.identity.rawName;

        staff.identity.name =

            live.name ??

            staff.identity.name;

        staff.identity.phone =

            live.phone ??

            staff.identity.phone;

        staff.identity.email =

            live.email ??

            staff.identity.email;

        staff.identity.role =

            live.role ??

            staff.identity.role;

        staff.identity.designation =

            live.designation ??

            staff.identity.designation;

    }

    /*----------------------------------
      Posting
    ----------------------------------*/

    if (

        staff.posting

    ) {

        staff.posting.circle =

            live.circle ??

            staff.posting.circle;

        staff.posting.division =

            live.division ??

            staff.posting.division;

        staff.posting.range =

            live.range ??

            staff.posting.range;

        staff.posting.beat =

            live.beat ??

            staff.posting.beat;

    }

    /*----------------------------------
      Assignment
    ----------------------------------*/

    if (

        staff.assignment

    ) {

        staff.assignment.assignedCompartment =

            live.compartment ??

            staff.assignment.assignedCompartment;

        staff.assignment.dutyType =

            live.dutyType ??

            staff.assignment.dutyType;

        staff.assignment.dutyActive =

            live.dutyActive ??

            staff.assignment.dutyActive;

        staff.assignment.status =

            live.status ??

            staff.assignment.status;

        staff.assignment.leader =

            live.leader ??

            staff.assignment.leader;

        staff.assignment.team =

            live.team ??

            staff.assignment.team;

        staff.assignment.lastDutyEnd =

            live.lastDutyEnd ??

            staff.assignment.lastDutyEnd;

    }

    /*----------------------------------
      Duty
    ----------------------------------*/

    if (

        staff.duty

    ) {

        staff.duty.dutyType =

            live.dutyType ??

            staff.duty.dutyType;

        staff.duty.dutyActive =

            live.dutyActive ??

            staff.duty.dutyActive;

        staff.duty.status =

            live.status ??

            staff.duty.status;

        staff.duty.lastDutyEnd =

            live.lastDutyEnd ??

            staff.duty.lastDutyEnd;

    }

    /*----------------------------------
      Location
    ----------------------------------*/

    if (

        staff.location

    ) {

        staff.location.location =

            live.location ??

            staff.location.location;

        staff.location.lat =

            live.lat ??

            staff.location.lat;

       staff.location.lon =

    live.lon ??

    live.lng ??

    staff.location.lon;
    }

    /*----------------------------------
      GPS
    ----------------------------------*/

    if (

        staff.gps

    ) {

        staff.gps.accuracy =

            live.accuracy ??

            staff.gps.accuracy;

        staff.gps.heading =

            live.heading ??

            staff.gps.heading;

        staff.gps.speed =

            live.speed ??

            staff.gps.speed;

        staff.gps.lastSeen =

            live.lastSeen ??

            staff.gps.lastSeen;

        staff.gps.timestamp =

            live.timestamp ??

            staff.gps.timestamp;

        staff.gps.updatedAt =

            live.updatedAt ??

            staff.gps.updatedAt;

        staff.gps.turnAngle =

            live.turnAngle ??

            staff.gps.turnAngle;

        staff.gps.turnRate =

            live.turnRate ??

            staff.gps.turnRate;

    }

    /*----------------------------------
      Tracking
    ----------------------------------*/

    if (

        staff.tracking

    ) {

        staff.tracking.sessionId =

            live.sessionId ??

            staff.tracking.sessionId;

        staff.tracking.source =

            live.source ??

            staff.tracking.source;

        staff.tracking.id =

            live.id ??

            staff.tracking.id;

    }

    /*----------------------------------
      Metadata
    ----------------------------------*/

    if (

        staff.metadata

    ) {

        staff.metadata.source =

            "LIVE_STAFF";

    }

    /*----------------------------------
      Return Hydrated Staff
    ----------------------------------*/

    return staff;

};

/*=========================================================
  hydratePatrol()
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
