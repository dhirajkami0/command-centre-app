/*=========================================================
  STAFF HYDRATOR
  ---------------------------------------------------------
  Hydrates canonical StaffEntities with runtime data from

      • live_staff
      • patrol_tracks

  Author  : GreenGuard AI
  Module  : staffHydrator.js
=========================================================*/

(function (

    window

) {

"use strict";

/*=========================================================
  NAMESPACE
=========================================================*/

const GG =

    window.GreenGuardAI ||

    window.GG ||

    {};

const StaffHydrator =

    {};

/*=========================================================
  VERSION
=========================================================*/

StaffHydrator.VERSION =

    "1.0.0";

/*=========================================================
  PRIVATE STATE
=========================================================*/

let initialized =

    false;

let hydrating =

    false;

let hydrated =

    false;

let lastHydrated =

    null;

/*=========================================================
  CACHE
=========================================================*/

const cache = {

    liveStaff :

        new Map(),

    patrolTracks :

        new Map(),

    merged :

        new Map()

};

/*=========================================================
  OPTIONS
=========================================================*/

const options = {

    mergeLive :

        true,

    mergeTracks :

        true,

    overwrite :

        true,

    cloneObjects :

        false

};

/*=========================================================
  STATISTICS
=========================================================*/

const statistics = {

    liveDocuments :

        0,

    patrolDocuments :

        0,

    hydratedStaff :

        0,

    skipped :

        0,

    failed :

        0

};

/*=========================================================
  RESET CACHE
=========================================================*/

StaffHydrator.clear =

function () {

    cache.liveStaff.clear();

    cache.patrolTracks.clear();

    cache.merged.clear();

    statistics.liveDocuments = 0;

    statistics.patrolDocuments = 0;

    statistics.hydratedStaff = 0;

    statistics.skipped = 0;

    statistics.failed = 0;

    hydrated = false;

    lastHydrated = null;

};

/*=========================================================
  INITIALIZE
=========================================================*/

StaffHydrator.initialize =

async function () {

    if (

        initialized

    ) {

        return true;

    }

    initialized = true;

    console.log(

        "%cStaff Hydrator Initialized",

        "color:#009688;font-weight:bold;"

    );

    return true;

};

/*=========================================================
  STATE
=========================================================*/

StaffHydrator.isInitialized =

function () {

    return initialized;

};

StaffHydrator.isHydrating =

function () {

    return hydrating;

};

StaffHydrator.isHydrated =

function () {

    return hydrated;

};

StaffHydrator.lastHydrated =

function () {

    return lastHydrated;

};

/*=========================================================
  INFORMATION
=========================================================*/

StaffHydrator.info =

function () {

    return {

        version :

            StaffHydrator.VERSION,

        initialized,

        hydrating,

        hydrated,

        lastHydrated,

        cache : {

            live :

                cache.liveStaff.size,

            tracks :

                cache.patrolTracks.size,

            merged :

                cache.merged.size

        },

        statistics

    };

};

/*=========================================================
  NORMALIZE LIVE STAFF DOCUMENT
=========================================================*/

StaffHydrator.normalizeLiveStaffDocument =

function (

    document

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !document ||

        typeof document !== "object"

    ) {

        return null;

    }

    /*----------------------------------
      Clean Name
    ----------------------------------*/

    const cleanName =

        String(

            document.cleanName ||

            document.name ||

            ""

        )

        .trim()

        .toUpperCase();

    if (

        cleanName === ""

    ) {

        return null;

    }

    /*----------------------------------
      Lookup Canonical Staff
    ----------------------------------*/

    const index =

        GG.StaffEntities
            .index
            .byCleanName;

    if (

        !index ||

        !index.has(

            cleanName

        )

    ) {

        console.warn(

            "Live Staff not found:",

            cleanName

        );

        return null;

    }

    const staff =

        index.get(

            cleanName

        )[0];

    if (

        !staff

    ) {

        return null;

    }

    /*----------------------------------
      Return
    ----------------------------------*/

    return {

        cleanName,

        document,

        staff

    };

};

  /*=========================================================
  MERGE LIVE STAFF DOCUMENT
=========================================================*/

StaffHydrator.mergeLiveStaffDocument =

function (

    normalized

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !normalized

    ) {

        return false;

    }

    const staff =

        normalized.staff;

    const live =

        normalized.document;

    if (

        !staff ||

        !live

    ) {

        return false;

    }

    /*----------------------------------
      Identity
    ----------------------------------*/

    if (

        live.rawName

    ) {

        staff.identity.rawName =

            live.rawName;

    }

    if (

        live.name

    ) {

        staff.identity.name =

            live.name;

    }

    if (

        live.phone

    ) {

        staff.identity.phone =

            live.phone;

    }

    if (

        live.email

    ) {

        staff.identity.email =

            live.email;

    }

    if (

        live.role

    ) {

        staff.identity.role =

            live.role;

    }

    if (

        live.designation

    ) {

        staff.identity.designation =

            live.designation;

    }

    /*----------------------------------
      Posting
    ----------------------------------*/

    staff.posting.circle =

        live.circle ||

        staff.posting.circle;

    staff.posting.division =

        live.division ||

        staff.posting.division;

    staff.posting.range =

        live.range ||

        staff.posting.range;

    staff.posting.beat =

        live.beat ||

        staff.posting.beat;

    /*----------------------------------
      Assignment
    ----------------------------------*/

    staff.assignment.assignedCompartment =

        live.compartment ||

        staff.assignment.assignedCompartment;

    staff.assignment.dutyType =

        live.dutyType ||

        staff.assignment.dutyType;

    staff.assignment.dutyActive =

        Boolean(

            live.dutyActive

        );

    staff.assignment.status =

        live.status ||

        staff.assignment.status;

    staff.assignment.leader =

        live.leader ||

        staff.assignment.leader;

    staff.assignment.team =

        live.team ||

        staff.assignment.team;

    staff.assignment.lastDutyEnd =

        live.lastDutyEnd ||

        staff.assignment.lastDutyEnd;

    /*----------------------------------
      Location
    ----------------------------------*/

    staff.location.location =

        live.location ||

        staff.location.location;

    staff.location.lat =

        live.lat ??

        staff.location.lat;

    staff.location.lon =

        live.lon ??

        staff.location.lon;

    /*----------------------------------
      GPS
    ----------------------------------*/

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

    staff.gps.turnRate =

        live.turnRate ??

        staff.gps.turnRate;

    /*----------------------------------
      Tracking
    ----------------------------------*/

    staff.tracking.sessionId =

        live.sessionId ||

        staff.tracking.sessionId;

    staff.tracking.source =

        live.source ||

        staff.tracking.source;

    staff.tracking.id =

        String(

            live.id ??

            staff.tracking.id

        );

    /*----------------------------------
      Cache
    ----------------------------------*/

    cache.merged.set(

        staff.identity.cleanName,

        staff

    );

    statistics.hydratedStaff++;

    return true;

};
/*=========================================================
  LOAD LIVE STAFF
=========================================================*/

StaffHydrator.loadLiveStaff =

async function () {

    /*----------------------------------
      Prevent Parallel Loading
    ----------------------------------*/

    if (

        hydrating

    ) {

        console.warn(

            "StaffHydrator : already loading."

        );

        return cache.liveStaff;

    }

    hydrating =

        true;

    console.log(

        "===================================="

    );

    console.log(

        "LOAD LIVE STAFF START"

    );

    console.log(

        "===================================="

    );

    /*----------------------------------
      Clear Previous Cache
    ----------------------------------*/

    cache.liveStaff.clear();

    statistics.liveDocuments =

        0;

    try {

      /*----------------------------------
  Validate StaffEntities
----------------------------------*/

if (

    !GG.StaffEntities

) {

    throw new Error(

        "StaffEntities not available."

    );

}

/*----------------------------------
  Get Collection Reference
----------------------------------*/

const collection =

    GG
        .StaffEntities
        .getLiveStaffCollection();

/*----------------------------------
  Load Firestore Snapshot
----------------------------------*/

const snapshot =

    await GG
        .StaffEntities
        .loadCollection(

            collection

        );
        console.log(

            "Documents:",

            snapshot.size

        );

        /*----------------------------------
          Empty Collection
        ----------------------------------*/

        if (

            snapshot.empty

        ) {

            console.warn(

                "No live staff found."

            );

            hydrating =

                false;

            return cache.liveStaff;

        }

       /*----------------------------------
  Process Documents
----------------------------------*/

snapshot.forEach(

    function (

        doc

    ) {

        /*------------------------------
          Read Firestore
        ------------------------------*/

        const raw =

            doc.data() ||

            {};

        statistics.liveDocuments++;

        /*------------------------------
          Cache Raw Document
        ------------------------------*/

        cache.liveStaff.set(

            doc.id,

            raw

        );

        /*------------------------------
          Normalize
        ------------------------------*/

        const normalized =

            StaffHydrator
                .normalizeLiveStaffDocument(

                    raw

                );

        if (

            !normalized

        ) {

            statistics.skipped++;

            return;

        }

        /*------------------------------
          Merge Into
          Canonical Staff Object
        ------------------------------*/

        const merged =

            StaffHydrator
                .mergeLiveStaffDocument(

                    normalized

                );

        if (

            !merged

        ) {

            statistics.skipped++;

            return;

        }

        console.log(

            "✅ Live Staff Hydrated:",

            normalized.staff.identity.cleanName

        );

    }

);
        console.log(

            "Cached:",

            cache.liveStaff.size,

            "documents"

        );

    }

    catch (

        error

    ) {

        console.error(

            "loadLiveStaff() failed",

            error

        );

        statistics.failed++;

    }

    finally {

        hydrating =

            false;

    }

    console.log(

        "===================================="

    );

    console.log(

        "LOAD LIVE STAFF END"

    );

    console.log(

        "===================================="

    );

    return cache.liveStaff;

};
StaffHydrator.loadPatrolTracks =

async function () {

    throw new Error(

        "loadPatrolTracks() not implemented."

    );

};

StaffHydrator.mergeLiveStaff =

function () {

    throw new Error(

        "mergeLiveStaff() not implemented."

    );

};

StaffHydrator.mergePatrolTracks =

function () {

    throw new Error(

        "mergePatrolTracks() not implemented."

    );

};

StaffHydrator.hydrate =

async function () {

    throw new Error(

        "hydrate() not implemented."

    );

};

/*=========================================================
  REGISTER
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

})(window);
