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

        !GG.StaffEntities.cache.entities ||

        !GG.StaffEntities.cache.aliases

    ) {

        console.error(

            "StaffEntities cache unavailable."

        );

        return null;

    }

    /*----------------------------------
      Cache Reference
    ----------------------------------*/

    const cache =

        GG
            .StaffEntities
            .cache;

    /*----------------------------------
      Lookup Canonical Staff
    ----------------------------------*/

    let canonical =

        cache
            .entities
            .get(

                cleanName

            );

    /*----------------------------------
      Alias Lookup
    ----------------------------------*/

    if (

        !canonical

    ) {

        const resolved =

            cache
                .aliases
                .get(

                    cleanName

                );

        if (

            resolved

        ) {

            canonical =

                cache
                    .entities
                    .get(

                        resolved

                    );

        }

    }

    /*----------------------------------
      Staff Not Found
    ----------------------------------*/

    if (

        !canonical

    ) {

        return null;

    }

    /*----------------------------------
      Clone Canonical Object
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

            "structuredClone failed.",

            error

        );

        return null;

    }

    /*----------------------------------
      Ensure Mutable
    ----------------------------------*/

    if (

        !hydrated ||

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
      Runtime
    ----------------------------------*/

    hydrated.runtime =

        hydrated.runtime ||

        {};

    hydrated.runtime.hydrated =

        true;

    hydrated.runtime.hydratedAt =

        Date.now();

    hydrated.runtime.liveMerged =

        false;

    hydrated.runtime.patrolMerged =

        false;

    hydrated.runtime.aliasResolved =

        canonical.identity?.cleanName !==

        cleanName;

    hydrated.runtime.lookupKey =

        cleanName;

    hydrated.runtime.canonicalKey =

        canonical.identity?.cleanName ||

        cleanName;

    /*----------------------------------
      Metadata
    ----------------------------------*/

    hydrated.metadata =

        hydrated.metadata ||

        {};

    hydrated.metadata.source =

        "CANONICAL";

    hydrated.metadata.hydratedAt =

        hydrated.runtime.hydratedAt;

    /*----------------------------------
      Merge Live Staff
    ----------------------------------*/

    if (

        typeof StaffHydrator.getLiveStaff ===

        "function"

    ) {

        const live =

            StaffHydrator.getLiveStaff(

                hydrated.identity?.cleanName

            );

        if (

            live

        ) {

            StaffHydrator.hydrateLive(

                hydrated,

                live

            );

        }

    }

    /*----------------------------------
      Merge Patrol
    ----------------------------------*/

    if (

        typeof StaffHydrator.getPatrolTrack ===

        "function"

    ) {

        const patrol =

            StaffHydrator.getPatrolTrack(

                hydrated.identity?.cleanName

            );

        if (

            patrol

        ) {

            StaffHydrator.hydratePatrol(

                hydrated,

                patrol

            );

        }

    }

    /*----------------------------------
      Refresh Analytics
    ----------------------------------*/

    if (

        typeof StaffHydrator.recalculate ===

        "function"

    ) {

        StaffHydrator.recalculate(

            hydrated

        );

    }

    /*----------------------------------
      Return
    ----------------------------------*/

    return hydrated;

};

    /*=========================================================
  mergeIdentity()
-----------------------------------------------------------
  Merge runtime identity fields into the hydrated staff.

  Source

      live_staff

      patrol_tracks

      Any runtime identity object

  Target

      staff.identity

  Notes

      - Non-breaking
      - Updates only existing canonical fields
      - Never overwrites with null/undefined
=========================================================*/

StaffHydrator.mergeIdentity =

function (

    staff,

    source

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
      Validate Source
    ----------------------------------*/

    if (

        !source ||

        typeof source !==

        "object"

    ) {

        return staff;

    }

    /*----------------------------------
      Validate Identity
    ----------------------------------*/

    if (

        !staff.identity

    ) {

        return staff;

    }

    /*----------------------------------
      Merge Identity
    ----------------------------------*/

    staff.identity.id =

        source.id ??

        staff.identity.id;

    staff.identity.documentId =

        source.documentId ??

        source.staffId ??

        source.profileId ??

        staff.identity.documentId;

    staff.identity.name =

        source.name ??

        staff.identity.name;

    staff.identity.cleanName =

        source.cleanName ??

        staff.identity.cleanName;

    staff.identity.firstName =

        source.firstName ??

        staff.identity.firstName;

    staff.identity.middleName =

        source.middleName ??

        staff.identity.middleName;

    staff.identity.lastName =

        source.lastName ??

        staff.identity.lastName;

    staff.identity.initials =

        source.initials ??

        staff.identity.initials;

    staff.identity.designation =

        source.designation ??

        staff.identity.designation;

    staff.identity.designationCode =

        source.designationCode ??

        staff.identity.designationCode;

    staff.identity.role =

        source.role ??

        staff.identity.role;

    staff.identity.gender =

        source.gender ??

        staff.identity.gender;

    staff.identity.phone =

        source.phone ??

        source.mobile ??

        source.mobileNumber ??

        staff.identity.phone;

    staff.identity.email =

        source.email ??

        staff.identity.email;

    staff.identity.photo =

        source.photo ??

        source.photoUrl ??

        source.image ??

        staff.identity.photo;

    staff.identity.aliases =

        Array.isArray(

            source.aliases

        )

            ? source.aliases

            : staff.identity.aliases;

    /*----------------------------------
      Return
    ----------------------------------*/

    return staff;

};

    /*=========================================================
  mergePosting()
-----------------------------------------------------------
  Merge runtime posting information into the hydrated staff.

  Source

      live_staff

      patrol_tracks

      Any runtime posting object

  Target

      staff.posting

  Notes

      - Non-breaking
      - Updates only canonical posting fields
      - Never overwrites with null/undefined
=========================================================*/

StaffHydrator.mergePosting =

function (

    staff,

    source

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
      Validate Source
    ----------------------------------*/

    if (

        !source ||

        typeof source !==

        "object"

    ) {

        return staff;

    }

    /*----------------------------------
      Validate Posting
    ----------------------------------*/

    if (

        !staff.posting

    ) {

        return staff;

    }

    /*----------------------------------
      Administrative Hierarchy
    ----------------------------------*/

    staff.posting.circle =

        source.circle ??

        staff.posting.circle;

    staff.posting.division =

        source.division ??

        staff.posting.division;

    staff.posting.range =

        source.range ??

        staff.posting.range;

    staff.posting.beat =

        source.beat ??

        staff.posting.beat;

    staff.posting.compartment =

        source.compartment ??

        source.compartmentName ??

        staff.posting.compartment;

    /*----------------------------------
      Office
    ----------------------------------*/

    staff.posting.office =

        source.office ??

        staff.posting.office;

    staff.posting.headquarters =

        source.headquarters ??

        source.hq ??

        staff.posting.headquarters;

    /*----------------------------------
      Administrative Codes
    ----------------------------------*/

    staff.posting.circleCode =

        source.circleCode ??

        staff.posting.circleCode;

    staff.posting.divisionCode =

        source.divisionCode ??

        staff.posting.divisionCode;

    staff.posting.rangeCode =

        source.rangeCode ??

        staff.posting.rangeCode;

    staff.posting.beatCode =

        source.beatCode ??

        staff.posting.beatCode;

    staff.posting.compartmentCode =

        source.compartmentCode ??

        staff.posting.compartmentCode;

    /*----------------------------------
      Posting Status
    ----------------------------------*/

    staff.posting.status =

        source.postingStatus ??

        source.status ??

        staff.posting.status;

    staff.posting.postedAt =

        source.postedAt ??

        staff.posting.postedAt;

    staff.posting.transferredAt =

        source.transferredAt ??

        staff.posting.transferredAt;

    /*----------------------------------
      Return
    ----------------------------------*/

    return staff;

};

    /*=========================================================
  mergeAssignment()
-----------------------------------------------------------
  Merge runtime assignment information into the hydrated
  staff object.

  Source

      live_staff

      patrol_tracks

      duty_report

      Any runtime assignment object

  Target

      staff.assignment

  Notes

      - Non-breaking
      - Updates only assignment section
      - Never overwrites with null/undefined
      - Returns original staff object
=========================================================*/

StaffHydrator.mergeAssignment =

function (

    staff,

    source

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
      Validate Source
    ----------------------------------*/

    if (

        !source ||

        typeof source !==

        "object"

    ) {

        return staff;

    }

    /*----------------------------------
      Validate Assignment
    ----------------------------------*/

    if (

        !staff.assignment

    ) {

        return staff;

    }

    /*----------------------------------
      Duty
    ----------------------------------*/

    staff.assignment.dutyType =

        source.dutyType ??

        source.duty ??

        staff.assignment.dutyType;

    staff.assignment.dutyStatus =

        source.dutyStatus ??

        source.status ??

        staff.assignment.dutyStatus;

    staff.assignment.dutyActive =

        source.dutyActive ??

        staff.assignment.dutyActive;

    staff.assignment.dutyStartedAt =

        source.dutyStartedAt ??

        source.dutyIn ??

        source.startedAt ??

        staff.assignment.dutyStartedAt;

    staff.assignment.dutyEndedAt =

        source.dutyEndedAt ??

        source.dutyOut ??

        source.endedAt ??

        staff.assignment.dutyEndedAt;

    /*----------------------------------
      Assignment
    ----------------------------------*/

    staff.assignment.assignmentId =

        source.assignmentId ??

        staff.assignment.assignmentId;

    staff.assignment.assignmentType =

        source.assignmentType ??

        staff.assignment.assignmentType;

    staff.assignment.assignedBy =

        source.assignedBy ??

        staff.assignment.assignedBy;

    staff.assignment.assignedAt =

        source.assignedAt ??

        staff.assignment.assignedAt;

    /*----------------------------------
      Patrol
    ----------------------------------*/

    staff.assignment.patrolType =

        source.patrolType ??

        staff.assignment.patrolType;

    staff.assignment.patrolMode =

        source.patrolMode ??

        staff.assignment.patrolMode;

    staff.assignment.sessionId =

        source.sessionId ??

        staff.assignment.sessionId;

    /*----------------------------------
      Team
    ----------------------------------*/

    staff.assignment.teamId =

        source.teamId ??

        staff.assignment.teamId;

    staff.assignment.teamLeader =

        source.teamLeader ??

        source.leader ??

        staff.assignment.teamLeader;

    staff.assignment.teamName =

        source.teamName ??

        source.team ??

        staff.assignment.teamName;

    /*----------------------------------
      Jurisdiction
    ----------------------------------*/

    staff.assignment.circle =

        source.circle ??

        staff.assignment.circle;

    staff.assignment.division =

        source.division ??

        staff.assignment.division;

    staff.assignment.range =

        source.range ??

        staff.assignment.range;

    staff.assignment.beat =

        source.beat ??

        staff.assignment.beat;

    staff.assignment.compartment =

        source.compartment ??

        source.compartmentName ??

        staff.assignment.compartment;

    /*----------------------------------
      Return
    ----------------------------------*/

    return staff;

};
    /*=========================================================
  mergeLocation()
-----------------------------------------------------------
  Merge runtime location information into the hydrated
  staff object.

  Source

      live_staff

      patrol_tracks

      Any runtime location object

  Target

      staff.location

  Notes

      - Non-breaking
      - Updates only location section
      - Never overwrites with null/undefined
      - Returns original staff object
=========================================================*/
StaffHydrator.mergeLocation =

function (

    staff,

    source

) {

    if (

        !staff ||

        !source ||

        !staff.location

    ) {

        return staff;

    }

    staff.location.location =

        source.location ??

        source.locationName ??

        staff.location.location;

    staff.location.lat =

        source.lat ??

        source.latitude ??

        staff.location.lat;

    staff.location.lon =

        source.lon ??

        source.lng ??

        source.longitude ??

        staff.location.lon;

    return staff;

};

    /*=========================================================
  mergeGPS()
-----------------------------------------------------------
  Merge runtime GPS information into the hydrated
  staff object.

  Source

      live_staff

      patrol_tracks

      Traccar

      Any runtime GPS object

  Target

      staff.gps

  Notes

      - Non-breaking
      - Updates only gps section
      - Never overwrites with null/undefined
      - Returns original staff object
=========================================================*/

StaffHydrator.mergeGPS =

function (

    staff,

    source

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
      Validate Source
    ----------------------------------*/

    if (

        !source ||

        typeof source !==

        "object"

    ) {

        return staff;

    }

    /*----------------------------------
      Validate GPS
    ----------------------------------*/

    if (

        !staff.gps

    ) {

        return staff;

    }

    /*----------------------------------
      Coordinates
    ----------------------------------*/

    staff.gps.latitude =

        source.latitude ??

        source.lat ??

        staff.gps.latitude;

    staff.gps.longitude =

        source.longitude ??

        source.lon ??

        source.lng ??

        staff.gps.longitude;

    staff.gps.altitude =

        source.altitude ??

        source.alt ??

        staff.gps.altitude;

    /*----------------------------------
      Movement
    ----------------------------------*/

    staff.gps.speed =

        source.speed ??

        staff.gps.speed;

    staff.gps.heading =

        source.heading ??

        source.bearing ??

        source.course ??

        staff.gps.heading;

    staff.gps.accuracy =

        source.accuracy ??

        staff.gps.accuracy;

    /*----------------------------------
      GPS Status
    ----------------------------------*/

    staff.gps.provider =

        source.provider ??

        staff.gps.provider;

    staff.gps.fixTime =

        source.fixTime ??

        source.fixtime ??

        source.timestamp ??

        staff.gps.fixTime;

    staff.gps.deviceTime =

        source.deviceTime ??

        source.devicetime ??

        staff.gps.deviceTime;

    staff.gps.serverTime =

        source.serverTime ??

        source.servertime ??

        staff.gps.serverTime;

    /*----------------------------------
      Satellite
    ----------------------------------*/

    staff.gps.satellites =

        source.satellites ??

        staff.gps.satellites;

    /*----------------------------------
      Battery
    ----------------------------------*/

    staff.gps.battery =

        source.battery ??

        source.batteryLevel ??

        staff.gps.battery;

    staff.gps.charging =

        source.charging ??

        staff.gps.charging;

    /*----------------------------------
      Runtime
    ----------------------------------*/

    staff.gps.online =

        source.online ??

        staff.gps.online;

    staff.gps.lastSeen =

        source.lastSeen ??

        source.timestamp ??

        source.fixTime ??

        staff.gps.lastSeen;

    staff.gps.updatedAt =

        source.updatedAt ??

        source.timestamp ??

        staff.gps.updatedAt;

    /*----------------------------------
      Return
    ----------------------------------*/

    return staff;

};

    /*=========================================================
  mergeTracking()
-----------------------------------------------------------
  Merge runtime tracking information into the hydrated
  staff object.

  Source

      live_staff

      patrol_tracks

      Traccar

      Any runtime tracking object

  Target

      staff.tracking

  Notes

      - Non-breaking
      - Updates only tracking section
      - Never overwrites with null/undefined
      - Returns original staff object
=========================================================*/

StaffHydrator.mergeTracking =

function (

    staff,

    source

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
      Validate Source
    ----------------------------------*/

    if (

        !source ||

        typeof source !==

        "object"

    ) {

        return staff;

    }

    /*----------------------------------
      Validate Tracking
    ----------------------------------*/

    if (

        !staff.tracking

    ) {

        return staff;

    }

    /*----------------------------------
      Session
    ----------------------------------*/

    staff.tracking.sessionId =

        source.sessionId ??

        source.session ??

        staff.tracking.sessionId;

    staff.tracking.trackId =

        source.trackId ??

        source.id ??

        staff.tracking.trackId;

    staff.tracking.deviceId =

        source.deviceId ??

        staff.tracking.deviceId;

    /*----------------------------------
      Tracking State
    ----------------------------------*/

    staff.tracking.status =

        source.status ??

        staff.tracking.status;

    staff.tracking.active =

        source.active ??

        staff.tracking.active;

    staff.tracking.online =

        source.online ??

        staff.tracking.online;

    staff.tracking.source =

        source.source ??

        staff.tracking.source;

    /*----------------------------------
      Patrol
    ----------------------------------*/

    staff.tracking.patrolId =

        source.patrolId ??

        staff.tracking.patrolId;

    staff.tracking.routeId =

        source.routeId ??

        staff.tracking.routeId;

    /*----------------------------------
      Device
    ----------------------------------*/

    staff.tracking.deviceName =

        source.deviceName ??

        staff.tracking.deviceName;

    staff.tracking.deviceModel =

        source.deviceModel ??

        staff.tracking.deviceModel;

    /*----------------------------------
      Connectivity
    ----------------------------------*/

    staff.tracking.network =

        source.network ??

        staff.tracking.network;

    staff.tracking.signal =

        source.signal ??

        staff.tracking.signal;

    /*----------------------------------
      Runtime
    ----------------------------------*/

    staff.tracking.startedAt =

        source.startedAt ??

        source.startTime ??

        staff.tracking.startedAt;

    staff.tracking.endedAt =

        source.endedAt ??

        source.endTime ??

        staff.tracking.endedAt;

    staff.tracking.updatedAt =

        source.updatedAt ??

        source.timestamp ??

        staff.tracking.updatedAt;

    staff.tracking.lastHeartbeat =

        source.lastHeartbeat ??

        source.timestamp ??

        staff.tracking.lastHeartbeat;

    /*----------------------------------
      Return
    ----------------------------------*/

    return staff;

};

    /*=========================================================
  mergeAnalytics()
-----------------------------------------------------------
  Merge runtime analytics into the hydrated staff object.

  Source

      patrol_tracks

      analytics

      live_staff

      Any runtime analytics object

  Target

      staff.analytics

  Notes

      - Non-breaking
      - Updates only analytics section
      - Never overwrites with null/undefined
      - Returns original staff object
=========================================================*/

StaffHydrator.mergeAnalytics =

function (

    staff,

    source

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
      Validate Source
    ----------------------------------*/

    if (

        !source ||

        typeof source !==

        "object"

    ) {

        return staff;

    }

    /*----------------------------------
      Validate Analytics
    ----------------------------------*/

    if (

        !staff.analytics

    ) {

        return staff;

    }

    /*----------------------------------
      Session
    ----------------------------------*/

    staff.analytics.sessionId =

        source.sessionId ??

        source.session ??

        staff.analytics.sessionId;

    staff.analytics.monthKey =

        source.monthKey ??

        staff.analytics.monthKey;

    /*----------------------------------
      Patrol Summary
    ----------------------------------*/

    staff.analytics.pointCount =

        source.pointCount ??

        source.points ??

        staff.analytics.pointCount;

    staff.analytics.distanceKm =

        source.distanceKm ??

        source.distance ??

        staff.analytics.distanceKm;

    staff.analytics.duration =

        source.duration ??

        staff.analytics.duration;

    staff.analytics.averageSpeed =

        source.averageSpeed ??

        source.avgSpeed ??

        staff.analytics.averageSpeed;

    staff.analytics.maximumSpeed =

        source.maximumSpeed ??

        source.maxSpeed ??

        staff.analytics.maximumSpeed;

    /*----------------------------------
      Time
    ----------------------------------*/

    staff.analytics.startedAt =

        source.startedAt ??

        source.startTime ??

        staff.analytics.startedAt;

    staff.analytics.endedAt =

        source.endedAt ??

        source.endTime ??

        staff.analytics.endedAt;

    staff.analytics.createdAt =

        source.createdAt ??

        staff.analytics.createdAt;

    staff.analytics.updatedAt =

        source.updatedAt ??

        source.timestamp ??

        staff.analytics.updatedAt;

    /*----------------------------------
      Coverage
    ----------------------------------*/

    staff.analytics.coverage =

        source.coverage ??

        staff.analytics.coverage;

    staff.analytics.coveragePercent =

        source.coveragePercent ??

        staff.analytics.coveragePercent;

    staff.analytics.areaCovered =

        source.areaCovered ??

        staff.analytics.areaCovered;

    /*----------------------------------
      Patrol Statistics
    ----------------------------------*/

    staff.analytics.gridCount =

        source.gridCount ??

        staff.analytics.gridCount;

    staff.analytics.compartments =

        source.compartments ??

        staff.analytics.compartments;

    staff.analytics.visits =

        source.visits ??

        staff.analytics.visits;

    /*----------------------------------
      GPS Statistics
    ----------------------------------*/

    staff.analytics.startLat =

        source.startLat ??

        staff.analytics.startLat;

    staff.analytics.startLon =

        source.startLon ??

        staff.analytics.startLon;

    staff.analytics.startAccuracy =

        source.startAccuracy ??

        staff.analytics.startAccuracy;

    staff.analytics.endLat =

        source.endLat ??

        staff.analytics.endLat;

    staff.analytics.endLon =

        source.endLon ??

        staff.analytics.endLon;

    staff.analytics.endAccuracy =

        source.endAccuracy ??

        staff.analytics.endAccuracy;

    /*----------------------------------
      Track
    ----------------------------------*/

    staff.analytics.simplifiedTrack =

        source.simplifiedTrack ??

        staff.analytics.simplifiedTrack;

    staff.analytics.trackBounds =

        source.trackBounds ??

        staff.analytics.trackBounds;

    /*----------------------------------
      Quality
    ----------------------------------*/

    staff.analytics.qualityScore =

        source.qualityScore ??

        staff.analytics.qualityScore;

    staff.analytics.status =

        source.status ??

        staff.analytics.status;

    /*----------------------------------
      Return
    ----------------------------------*/

    return staff;

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

/*=========================================================
  hydratePatrol()
-----------------------------------------------------------
  Merge PATROL_TRACK runtime information into the hydrated
  canonical staff object.

  Flow

      Canonical Staff

              ↓

      mergePosting()

              ↓

      mergeAssignment()

              ↓

      mergeGPS()

              ↓

      mergeTracking()

              ↓

      mergeAnalytics()

              ↓

      Runtime Flags

  Notes

      - Non-breaking
      - Uses merge helpers only
      - Does not modify canonical cache
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
      Validate Patrol
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

    StaffHydrator.mergePosting(

        staff,

        patrol

    );

    /*----------------------------------
      Assignment
    ----------------------------------*/

    StaffHydrator.mergeAssignment(

        staff,

        patrol

    );

    /*----------------------------------
      GPS
    ----------------------------------*/

    StaffHydrator.mergeGPS(

        staff,

        patrol

    );

    /*----------------------------------
      Tracking
    ----------------------------------*/

    StaffHydrator.mergeTracking(

        staff,

        patrol

    );

    /*----------------------------------
      Analytics
    ----------------------------------*/

    StaffHydrator.mergeAnalytics(

        staff,

        patrol

    );

    /*----------------------------------
      Runtime
    ----------------------------------*/

    staff.runtime =

        staff.runtime ||

        {};

    staff.runtime.patrolMerged =

        true;

    staff.runtime.patrolMergedAt =

        Date.now();

    /*----------------------------------
      Metadata
    ----------------------------------*/

    staff.metadata =

        staff.metadata ||

        {};

    staff.metadata.source =

        "PATROL_TRACKS";

    staff.metadata.updatedAt =

        Date.now();

    /*----------------------------------
      Return
    ----------------------------------*/

    return staff;

};
/*=========================================================
  recalculate()
-----------------------------------------------------------
  Recalculate derived runtime values after all runtime
  merges have completed.

  Flow

      hydrate()

            ↓

      hydrateLive()

            ↓

      hydratePatrol()

            ↓

      recalculate()

            ↓

      Hydrated Staff

  Notes

      - Non-breaking
      - Never modifies canonical cache
      - Updates only derived runtime values
=========================================================*/

StaffHydrator.recalculate =

function (

    staff

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !staff ||

        typeof staff !==

        "object"

    ) {

        return staff;

    }

    /*----------------------------------
      Runtime
    ----------------------------------*/

    staff.runtime =

        staff.runtime ||

        {};

    /*----------------------------------
      Metadata
    ----------------------------------*/

    staff.metadata =

        staff.metadata ||

        {};

    /*----------------------------------
      Assignment
    ----------------------------------*/

    if (

        staff.assignment &&

        staff.tracking

    ) {

        if (

    staff.assignment

) {

    if (

        staff.assignment.dutyEndedAt

    ) {

        staff.assignment.dutyActive =

            false;

    }

    else if (

        staff.assignment.dutyStartedAt ||

        staff.tracking?.sessionId

    ) {

        staff.assignment.dutyActive =

            true;

    }

}

    }

    /*----------------------------------
      GPS
    ----------------------------------*/

    if (

        staff.gps

    ) {

        if (

            !staff.gps.lastSeen &&

            staff.gps.timestamp

        ) {

            staff.gps.lastSeen =

                staff.gps.timestamp;

        }

        if (

            !staff.gps.updatedAt &&

            staff.gps.lastSeen

        ) {

            staff.gps.updatedAt =

                staff.gps.lastSeen;

        }

    }

    /*----------------------------------
      Analytics
    ----------------------------------*/

    if (

        staff.analytics

    ) {

        staff.analytics.updatedAt =

            Date.now();

    }

    /*----------------------------------
      Runtime Source
    ----------------------------------*/

    if (

        staff.runtime.patrolMerged

    ) {

        staff.metadata.source =

            "PATROL_TRACKS";

    }

    else if (

        staff.runtime.liveMerged

    ) {

        staff.metadata.source =

            "LIVE_STAFF";

    }

    else {

        staff.metadata.source =

            "STAFF_PROFILE";

    }

    /*----------------------------------
      Runtime Updated
    ----------------------------------*/

    staff.runtime.updatedAt =

        Date.now();

    /*----------------------------------
      Metadata Updated
    ----------------------------------*/

    staff.metadata.updatedAt =

        staff.runtime.updatedAt;

    /*----------------------------------
      Return
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

/*=========================================================
  getHydratedStaff()
-----------------------------------------------------------
  Returns a fully hydrated runtime staff object.

  Pipeline

      Canonical Staff

              ↓

      hydrate()

              ↓

      hydrateLive()

              ↓

      hydratePatrol()

              ↓

      recalculate()

              ↓

      Hydrated Staff

  Notes

      - Non-breaking
      - Canonical object remains frozen
      - Runtime object is mutable
=========================================================*/

/*=========================================================
  getHydratedStaff()
-----------------------------------------------------------
  Returns a fully hydrated runtime staff object.

  Pipeline

      Canonical Staff

              ↓

      hydrate()

              ↓

      hydrateLive()

              ↓

      hydratePatrol()

              ↓

      recalculate()

              ↓

      Hydrated Staff

  Notes

      - Non-breaking
      - Canonical object remains frozen
      - Runtime object is mutable
      - Alias-aware
=========================================================*/

StaffHydrator.getHydratedStaff =

function (

    cleanName

) {

    /*----------------------------------
      Hydrate Canonical Staff
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
      Resolve Canonical Name
    ----------------------------------*/

    const resolvedName =

        staff
            .identity
            ?.cleanName ||

        cleanName;

    /*----------------------------------
      Lookup Live Staff
    ----------------------------------*/

    const live =

        StaffHydrator.getLiveStaff(

            resolvedName

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

            resolvedName

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
      Recalculate Runtime
    ----------------------------------*/

    StaffHydrator.recalculate(

        staff

    );

    /*----------------------------------
      Return Hydrated Staff
    ----------------------------------*/

    return staff;

};

    /*=========================================================
  hydrateLive()
-----------------------------------------------------------
  Merge LIVE_STAFF runtime information into the hydrated
  canonical staff object.

  Flow

      Canonical Staff

              ↓

      mergeIdentity()

              ↓

      mergePosting()

              ↓

      mergeAssignment()

              ↓

      mergeLocation()

              ↓

      mergeGPS()

              ↓

      mergeTracking()

              ↓

      Runtime Flags

  Notes

      - Non-breaking
      - Does not modify canonical cache
      - Uses merge helpers only
=========================================================*/

StaffHydrator.hydrateLive =

function (

    staff,

    live

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !staff ||

        !live

    ) {

        return staff;

    }

    /*----------------------------------
      Identity
    ----------------------------------*/

    StaffHydrator.mergeIdentity(

        staff,

        live

    );

    /*----------------------------------
      Posting
    ----------------------------------*/

    StaffHydrator.mergePosting(

        staff,

        live

    );

    /*----------------------------------
      Assignment
    ----------------------------------*/

    StaffHydrator.mergeAssignment(

        staff,

        live

    );

    /*----------------------------------
      Location
    ----------------------------------*/

    StaffHydrator.mergeLocation(

        staff,

        live

    );

    /*----------------------------------
      GPS
    ----------------------------------*/

    StaffHydrator.mergeGPS(

        staff,

        live

    );

    /*----------------------------------
      Tracking
    ----------------------------------*/

    StaffHydrator.mergeTracking(

        staff,

        live

    );

    /*----------------------------------
      Runtime
    ----------------------------------*/

    staff.runtime =

        staff.runtime ||

        {};

    staff.runtime.liveMerged =

        true;

    staff.runtime.liveMergedAt =

        Date.now();

    /*----------------------------------
      Metadata
    ----------------------------------*/

    staff.metadata =

        staff.metadata ||

        {};

    staff.metadata.source =

        "LIVE_STAFF";

    staff.metadata.updatedAt =

        Date.now();

    /*----------------------------------
      Return
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
