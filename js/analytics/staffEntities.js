(function (window) {

"use strict";

/*=========================================================
 GREENGUARD
=========================================================*/

const GG =
    window.GreenGuardAI =
    window.GreenGuardAI || {};

/*=========================================================
 DEPENDENCIES
=========================================================*/

const StaffConstants =
    GG.StaffConstants;

if (!StaffConstants) {

    throw new Error(

        "StaffConstants not loaded."

    );

}

/*=========================================================
 MODULE
=========================================================*/

const StaffEntities = {};

/*=========================================================
 VERSION
=========================================================*/

StaffEntities.VERSION =
    "1.0.0";

/*=========================================================
 INITIALIZATION
=========================================================*/

StaffEntities.loaded =
    false;

StaffEntities.loading =
    false;

/*=========================================================
 STAFF DATA
=========================================================*/

StaffEntities.staff = [];

/*=========================================================
 LOOKUP INDEXES
=========================================================*/

StaffEntities.index = {

    /*----------------------------------
      Staff
    ----------------------------------*/

    byCleanName:
        new Map(),

    byName:
        new Map(),

    byPhone:
        new Map(),

    /*----------------------------------
      Role
    ----------------------------------*/

    byRole:
        new Map(),

    byDesignation:
        new Map(),

    /*----------------------------------
      Posting
    ----------------------------------*/

    byBeat:
        new Map(),

    byRange:
        new Map(),

    byDivision:
        new Map(),

    byCircle:
        new Map(),

    byCompartment:
        new Map(),

    /*----------------------------------
      Team
    ----------------------------------*/

    byLeader:
        new Map(),

    byTeam:
        new Map()

};

/*=========================================================
 CACHE
=========================================================*/

StaffEntities.cache = {

    entities:

        new Map(),

    search:

        new Map()

};

/*=========================================================
 UTILITIES
=========================================================*/

StaffEntities.clear = function () {

    StaffEntities.staff = [];

    Object.keys(

        StaffEntities.index

    )

    .forEach(

        key =>

            StaffEntities.index[key].clear()

    );

    StaffEntities.cache.entities.clear();

    StaffEntities.cache.search.clear();

    StaffEntities.loaded = false;

};

/*=========================================================
 STATUS
=========================================================*/

StaffEntities.isLoaded = function () {

    return StaffEntities.loaded;

};

StaffEntities.isLoading = function () {

    return StaffEntities.loading;

};
/*=========================================================
 INITIALIZATION
=========================================================*/

StaffEntities.initialize = async function () {

    if (StaffEntities.loaded) {

        return true;

    }

    if (StaffEntities.loading) {

        return StaffEntities.waitUntilLoaded();

    }

    return await StaffEntities.buildIndex();

};

/*=========================================================
 WAIT UNTIL INDEX IS READY
=========================================================*/

StaffEntities.waitUntilLoaded = function () {

    return new Promise(

        (resolve, reject) => {

            const started =
                Date.now();

            const timeout =
                15000;

            const timer =
                setInterval(

                    function () {

                        if (

                            StaffEntities.loaded

                        ) {

                            clearInterval(

                                timer

                            );

                            resolve(true);

                            return;

                        }

                        if (

                            !StaffEntities.loading

                        ) {

                            clearInterval(

                                timer

                            );

                            resolve(false);

                            return;

                        }

                        if (

                            Date.now() -

                            started >

                            timeout

                        ) {

                            clearInterval(

                                timer

                            );

                            reject(

                                new Error(

                                    "StaffEntities initialization timeout."

                                )

                            );

                        }

                    },

                    100

                );

        }

    );

};

/*=========================================================
 START LOADING
=========================================================*/

StaffEntities.startLoading = function () {

    StaffEntities.loading =
        true;

    StaffEntities.loaded =
        false;

};

/*=========================================================
 FINISH LOADING
=========================================================*/

StaffEntities.finishLoading = function () {

    StaffEntities.loading =
        false;

    StaffEntities.loaded =
        true;

};

/*=========================================================
 FAIL LOADING
=========================================================*/

StaffEntities.failLoading = function () {

    StaffEntities.loading =
        false;

    StaffEntities.loaded =
        false;

};

/*=========================================================
 RESET
=========================================================*/

StaffEntities.reset = function () {

    StaffEntities.clear();

};

/*=========================================================
 LAST BUILD
=========================================================*/

StaffEntities.lastBuild =
    0;

/*=========================================================
 INDEX VERSION
=========================================================*/

StaffEntities.indexVersion =
    1;

/*=========================================================
 SHOULD REBUILD
=========================================================*/

StaffEntities.shouldRebuild = function (

    maxAge =

        5 *

        60 *

        1000

) {

    if (

        !StaffEntities.loaded

    ) {

        return true;

    }

    return (

        Date.now() -

        StaffEntities.lastBuild >

        maxAge

    );

};

/*=========================================================
 MARK REBUILD
=========================================================*/

StaffEntities.markBuilt = function () {

    StaffEntities.lastBuild =
        Date.now();

};
  /*=========================================================
 FIREBASE
=========================================================*/

StaffEntities.getFirebase = function () {

    return window.fb || null;

};

/*=========================================================
 FIRESTORE
=========================================================*/

StaffEntities.getFirestore = function () {

    return window.db || null;

};

/*=========================================================
 VALIDATE FIREBASE
=========================================================*/

StaffEntities.validateFirebase = function () {

    const fb =
        StaffEntities.getFirebase();

    const db =
        StaffEntities.getFirestore();

    if (!fb) {

        throw new Error(

            "Firebase SDK not initialized."

        );

    }

    if (!db) {

        throw new Error(

            "Firestore not initialized."

        );

    }

    if (

        typeof fb.collection !== "function"

    ) {

        throw new Error(

            "Firebase collection() unavailable."

        );

    }

    if (

        typeof fb.getDocs !== "function"

    ) {

        throw new Error(

            "Firebase getDocs() unavailable."

        );

    }

    return {

        fb,

        db

    };

};

/*=========================================================
 GET COLLECTION
=========================================================*/

StaffEntities.getCollection = function (

    collectionName

) {

    const {

        fb,

        db

    } =

        StaffEntities.validateFirebase();

    return fb.collection(

        db,

        collectionName

    );

};

/*=========================================================
 STAFF PROFILES COLLECTION
=========================================================*/

StaffEntities.getStaffProfilesCollection = function () {

    return StaffEntities.getCollection(

        StaffConstants
            .COLLECTIONS
            .STAFF_PROFILES

    );

};

/*=========================================================
 LIVE STAFF COLLECTION
=========================================================*/

StaffEntities.getLiveStaffCollection = function () {

    return StaffEntities.getCollection(

        StaffConstants
            .COLLECTIONS
            .LIVE_STAFF

    );

};

/*=========================================================
 PATROL TRACKS COLLECTION
=========================================================*/

StaffEntities.getPatrolTracksCollection = function () {

    return StaffEntities.getCollection(

        StaffConstants
            .COLLECTIONS
            .PATROL_TRACKS

    );

};
  /*=========================================================
 LOAD COLLECTION
=========================================================*/

StaffEntities.loadCollection = async function (

    collectionReference

) {

    const {

        fb

    } =

        StaffEntities.validateFirebase();

    if (

        !collectionReference

    ) {

        throw new Error(

            "Firestore collection reference missing."

        );

    }

    const snapshot =

        await fb.getDocs(

            collectionReference

        );

    if (

        !snapshot

    ) {

        throw new Error(

            "Unable to load Firestore collection."

        );

    }

    return snapshot;

};
  /*=========================================================
 LOAD STAFF PROFILES
=========================================================*/

StaffEntities.loadStaffProfiles =
async function () {

    console.group(

        "🧠 Loading Staff Profiles"

    );

    try {

        /*----------------------------------
          Get Collection
        ----------------------------------*/

        const collection =

            StaffEntities
                .getStaffProfilesCollection();

        /*----------------------------------
          Load Snapshot
        ----------------------------------*/

        const snapshot =

            await StaffEntities
                .loadCollection(

                    collection

                );

        /*----------------------------------
          Convert Snapshot
        ----------------------------------*/

        const staff =

            [];

        snapshot.forEach(

            function (doc) {

                staff.push({

                    id:
                        doc.id,

                    data:
                        doc.data()

                });

            }

        );

        console.log(

            "Profiles Loaded:",

            staff.length

        );

        /*----------------------------------
          Normalize
        ----------------------------------*/

return StaffEntities.normalizeStaffDocuments(
    staff
);
    }

    catch (err) {

        console.error(

            err

        );

        throw err;

    }

    finally {

        console.groupEnd();

    }

};

  /*=========================================================
 NORMALIZE STAFF DOCUMENT
=========================================================*/

/*=========================================================
 NORMALIZE STAFF DOCUMENT
=========================================================*/

StaffEntities.normalizeStaffDocument = function (

    staffDoc

) {

    /*----------------------------------
      Input Validation
    ----------------------------------*/

    if (

        !staffDoc ||

        typeof staffDoc !== "object"

    ) {

        console.warn(

            "[StaffEntities] Invalid staff document.",

            staffDoc

        );

        return null;

    }

    if (

        !("data" in staffDoc)

    ) {

        console.warn(

            "[StaffEntities] Missing Firestore data.",

            staffDoc

        );

        return null;

    }

    if (

        !staffDoc.data ||

        typeof staffDoc.data !== "object"

    ) {

        console.warn(

            "[StaffEntities] Invalid Firestore document data.",

            staffDoc

        );

        return null;

    }

    /*----------------------------------
      Firestore Document
    ----------------------------------*/

    const id =

        staffDoc.id ||

        "";

    const data =

        staffDoc.data;

    /*----------------------------------
      Constants
    ----------------------------------*/

    const FIELDS =
        StaffConstants.FIELDS;

    const ROLES =
        StaffConstants.ROLES;

    const DESIGNATIONS =
        StaffConstants.DESIGNATIONS;

    const DUTY_TYPES =
        StaffConstants.DUTY_TYPES;

    /*----------------------------------
      Local Variables
    ----------------------------------*/

    const normalized = {};

    const errors = [];

    const warnings = [];

    /*----------------------------------
      Context
    ----------------------------------*/

    const context = {

        id,

        data,

        normalized,

        errors,

        warnings,

        fields: FIELDS,

        roles: ROLES,

        designations: DESIGNATIONS,

        dutyTypes: DUTY_TYPES

    };

    /*
    =========================================================
    NEXT STEP

    Field Extraction

    context.normalized

    =========================================================
    */

    return context;

};
/*=========================================================
 PUBLIC API
=========================================================*/

StaffEntities.buildIndex =
    async function () {

        throw new Error(

            "buildIndex() not implemented."

        );

    };

StaffEntities.extract =
    function (

        query

    ) {

        throw new Error(

            "extract() not implemented."

        );

    };

StaffEntities.extractNames =
    function (

        query

    ) {

        throw new Error(

            "extractNames() not implemented."

        );

    };

StaffEntities.extractPhones =
    function (

        query

    ) {

        throw new Error(

            "extractPhones() not implemented."

        );

    };

StaffEntities.extractRoles =
    function (

        query

    ) {

        throw new Error(

            "extractRoles() not implemented."

        );

    };

StaffEntities.extractDesignations =
    function (

        query

    ) {

        throw new Error(

            "extractDesignations() not implemented."

        );

    };

StaffEntities.extractPosting =
    function (

        query

    ) {

        throw new Error(

            "extractPosting() not implemented."

        );

    };

StaffEntities.extractTeam =
    function (

        query

    ) {

        throw new Error(

            "extractTeam() not implemented."

        );

    };

StaffEntities.extractDuty =
    function (

        query

    ) {

        throw new Error(

            "extractDuty() not implemented."

        );

    };

StaffEntities.extractGPS =
    function (

        query

    ) {

        throw new Error(

            "extractGPS() not implemented."

        );

    };

/*=========================================================
 REGISTER
=========================================================*/

GG.StaffEntities =
    StaffEntities;

console.log(

    "%cStaff Entities Loaded",

    "color:#008000;font-weight:bold;"

);

})(window);
