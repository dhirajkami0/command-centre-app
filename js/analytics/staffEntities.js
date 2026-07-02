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
 GET FIELD
=========================================================*/

StaffEntities.getField = function (

    context,

    field,

    defaultValue = ""

) {

    if (

        !context ||

        !context.data

    ) {

        return defaultValue;

    }

    const value =

        context.data[field];

    if (

        value === undefined ||

        value === null

    ) {

        return defaultValue;

    }

    return value;

};

/*=========================================================
 HAS FIELD
=========================================================*/

StaffEntities.hasField = function (

    context,

    field

) {

    if (

        !context ||

        !context.data

    ) {

        return false;

    }

    return Object.prototype.hasOwnProperty.call(

        context.data,

        field

    );

};
 /*=========================================================
 SET FIELD
=========================================================*/

StaffEntities.setField = function (

    target,

    field,

    value

) {

    if (

        !target ||

        typeof target !== "object"

    ) {

        return false;

    }

    if (

        typeof field !== "string" ||

        field.trim() === ""

    ) {

        return false;

    }

    target[field] = value;

    return true;

};
 /*=========================================================
 GET STRING
=========================================================*/

StaffEntities.getString = function (

    context,

    field,

    defaultValue = ""

) {

    const value =

        StaffEntities.getField(

            context,

            field,

            defaultValue

        );

    if (

        value === null ||

        value === undefined

    ) {

        return defaultValue;

    }

    return String(

        value

    ).trim();

};
 /*=========================================================
 GET NUMBER
=========================================================*/

StaffEntities.getNumber = function (

    context,

    field,

    defaultValue = 0

) {

    const value =

        StaffEntities.getField(

            context,

            field,

            defaultValue

        );

    if (

        value === null ||

        value === undefined ||

        value === ""

    ) {

        return defaultValue;

    }

    const number =

        Number(value);

    if (

        Number.isNaN(

            number

        )

    ) {

        return defaultValue;

    }

    return number;

};
 /*=========================================================
 GET BOOLEAN
=========================================================*/

StaffEntities.getBoolean = function (

    context,

    field,

    defaultValue = false

) {

    const value =

        StaffEntities.getField(

            context,

            field,

            defaultValue

        );

    if (

        value === null ||

        value === undefined

    ) {

        return defaultValue;

    }

    /*----------------------------------
      Already Boolean
    ----------------------------------*/

    if (

        typeof value === "boolean"

    ) {

        return value;

    }

    /*----------------------------------
      Number
    ----------------------------------*/

    if (

        typeof value === "number"

    ) {

        return value !== 0;

    }

    /*----------------------------------
      String
    ----------------------------------*/

    if (

        typeof value === "string"

    ) {

        switch (

            value

                .trim()

                .toLowerCase()

        ) {

            case "true":

            case "yes":

            case "y":

            case "1":

            case "active":

            case "enabled":

                return true;

            case "false":

            case "no":

            case "n":

            case "0":

            case "inactive":

            case "disabled":

                return false;

        }

    }

    return defaultValue;

};
 /*=========================================================
 GET ARRAY
=========================================================*/

StaffEntities.getArray = function (

    context,

    field,

    defaultValue = []

) {

    const value =

        StaffEntities.getField(

            context,

            field,

            defaultValue

        );

    /*----------------------------------
      Missing
    ----------------------------------*/

    if (

        value === null ||

        value === undefined

    ) {

        return [

            ...defaultValue

        ];

    }

    /*----------------------------------
      Already Array
    ----------------------------------*/

    if (

        Array.isArray(

            value

        )

    ) {

        return [

            ...value

        ];

    }

    /*----------------------------------
      Single Value
    ----------------------------------*/

    return [

        value

    ];

};
/*=========================================================
 NORMALIZE STAFF DOCUMENT
=========================================================*/
 /*=========================================================
 GENERIC FIELD EXTRACTOR
=========================================================*/

StaffEntities.extractFields = function (

    context,

    target,

    mappings

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !context ||

        !target ||

        !Array.isArray(

            mappings

        )

    ) {

        return;

    }

    /*----------------------------------
      Loop Through Mapping
    ----------------------------------*/

    mappings.forEach(

        function (

            field

        ) {

            let value;

            switch (

                field.type

            ) {

                case "string":

                    value =

                        StaffEntities.getString(

                            context,

                            field.source

                        );

                    break;

                case "number":

                    value =

                        StaffEntities.getNumber(

                            context,

                            field.source

                        );

                    break;

                case "boolean":

                    value =

                        StaffEntities.getBoolean(

                            context,

                            field.source

                        );

                    break;

                case "array":

                    value =

                        StaffEntities.getArray(

                            context,

                            field.source

                        );

                    break;

                default:

                    value =

                        StaffEntities.getField(

                            context,

                            field.source

                        );

            }

            StaffEntities.setField(

                target,

                field.target,

                value

            );

        }

    );

};
/*=========================================================
 EXTRACT IDENTITY FIELDS
=========================================================*/

StaffEntities.extractIdentityFields = function (

    context

) {

    /*----------------------------------
      Validate Context
    ----------------------------------*/

    if (

        !context ||

        typeof context !== "object"

    ) {

        return null;

    }

    if (

        !context.data ||

        typeof context.data !== "object"

    ) {

        return context;

    }

    if (

        !context.identity ||

        typeof context.identity !== "object"

    ) {

        context.identity = {};

    }

    if (

        !context.fieldMaps ||

        !context.fieldMaps.IDENTITY

    ) {

        throw new Error(

            "StaffConstants.FIELD_MAPS.IDENTITY not available."

        );

    }

    /*----------------------------------
      Generic Extraction
    ----------------------------------*/

    StaffEntities.extractFields(

        context,

        context.identity,

        context.fieldMaps.IDENTITY

    );

    /*----------------------------------
      Return Context
    ----------------------------------*/

    return context;

};
 /*=========================================================
 EXTRACT POSTING FIELDS
=========================================================*/

/*=========================================================
 EXTRACT POSTING FIELDS
=========================================================*/

StaffEntities.extractPostingFields = function (

    context

) {

    /*----------------------------------
      Validate Context
    ----------------------------------*/

    if (

        !context ||

        typeof context !== "object"

    ) {

        return null;

    }

    if (

        !context.data ||

        typeof context.data !== "object"

    ) {

        return context;

    }

    if (

        !context.posting ||

        typeof context.posting !== "object"

    ) {

        context.posting = {};

    }

    if (

        !context.fieldMaps ||

        !context.fieldMaps.POSTING

    ) {

        throw new Error(

            "StaffConstants.FIELD_MAPS.POSTING not available."

        );

    }

    /*----------------------------------
      Generic Extraction
    ----------------------------------*/

    StaffEntities.extractFields(

        context,

        context.posting,

        context.fieldMaps.POSTING

    );

    /*----------------------------------
      Return Context
    ----------------------------------*/

    return context;

};/*=========================================================
 EXTRACT DUTY FIELDS
=========================================================*/


/*=========================================================
 EXTRACT ASSIGNMENT FIELDS
=========================================================*/

StaffEntities.extractAssignmentFields = function (

    context

) {

    /*----------------------------------
      Validate Context
    ----------------------------------*/

    if (

        !context ||

        typeof context !== "object"

    ) {

        return null;

    }

    if (

        !context.data ||

        typeof context.data !== "object"

    ) {

        return context;

    }

    /*----------------------------------
      Assignment Object
    ----------------------------------*/

    if (

        !context.assignment ||

        typeof context.assignment !== "object"

    ) {

        context.assignment = {};

    }

    /*----------------------------------
      Validate Field Map
    ----------------------------------*/

    if (

        !context.fieldMaps ||

        !context.fieldMaps.ASSIGNMENT

    ) {

        throw new Error(

            "StaffConstants.FIELD_MAPS.ASSIGNMENT not available."

        );

    }

    /*----------------------------------
      Generic Extraction
    ----------------------------------*/

    StaffEntities.extractFields(

        context,

        context.assignment,

        context.fieldMaps.ASSIGNMENT

    );

    /*----------------------------------
      Return Context
    ----------------------------------*/

    return context;

};
 /*=========================================================
 EXTRACT LOCATION FIELDS
=========================================================*/

StaffEntities.extractLocationFields = function (

    context

) {

    /*----------------------------------
      Validate Context
    ----------------------------------*/

    if (

        !context ||

        typeof context !== "object"

    ) {

        return null;

    }

    if (

        !context.data ||

        typeof context.data !== "object"

    ) {

        return context;

    }

    if (

        !context.location ||

        typeof context.location !== "object"

    ) {

        context.location = {};

    }

    if (

        !context.fieldMaps ||

        !context.fieldMaps.LOCATION

    ) {

        throw new Error(

            "StaffConstants.FIELD_MAPS.LOCATION not available."

        );

    }

    /*----------------------------------
      Generic Extraction
    ----------------------------------*/

    StaffEntities.extractFields(

        context,

        context.location,

        context.fieldMaps.LOCATION

    );

    /*----------------------------------
      Return Context
    ----------------------------------*/

    return context;

};
 /*=========================================================
 EXTRACT GPS FIELDS
=========================================================*/

StaffEntities.extractGPSFields = function (

    context

) {

    /*----------------------------------
      Validate Context
    ----------------------------------*/

    if (

        !context ||

        typeof context !== "object"

    ) {

        return null;

    }

    if (

        !context.data ||

        typeof context.data !== "object"

    ) {

        return context;

    }

    if (

        !context.gps ||

        typeof context.gps !== "object"

    ) {

        context.gps = {};

    }

    if (

        !context.fieldMaps ||

        !context.fieldMaps.GPS

    ) {

        throw new Error(

            "StaffConstants.FIELD_MAPS.GPS not available."

        );

    }

    /*----------------------------------
      Generic Extraction
    ----------------------------------*/

    StaffEntities.extractFields(

        context,

        context.gps,

        context.fieldMaps.GPS

    );

    /*----------------------------------
      Return Context
    ----------------------------------*/

    return context;

};
 /*=========================================================
 EXTRACT TEAM FIELDS
=========================================================*/

StaffEntities.extractTeamFields = function (

    context

) {

    /*----------------------------------
      Validate Context
    ----------------------------------*/

    if (

        !context ||

        typeof context !== "object"

    ) {

        return null;

    }

    if (

        !context.data ||

        typeof context.data !== "object"

    ) {

        return context;

    }

    if (

        !context.teamInfo ||

        typeof context.teamInfo !== "object"

    ) {

        context.teamInfo = {};

    }

    if (

        !context.fieldMaps ||

        !context.fieldMaps.TEAM

    ) {

        throw new Error(

            "StaffConstants.FIELD_MAPS.TEAM not available."

        );

    }

    /*----------------------------------
      Generic Extraction
    ----------------------------------*/

    StaffEntities.extractFields(

        context,

        context.teamInfo,

        context.fieldMaps.TEAM

    );

    /*----------------------------------
      Return Context
    ----------------------------------*/

    return context;

};
 /*=========================================================
 EXTRACT TRACKING FIELDS
=========================================================*/

StaffEntities.extractTrackingFields = function (

    context

) {

    /*----------------------------------
      Validate Context
    ----------------------------------*/

    if (

        !context ||

        typeof context !== "object"

    ) {

        return null;

    }

    if (

        !context.data ||

        typeof context.data !== "object"

    ) {

        return context;

    }

    /*----------------------------------
      Tracking Object
    ----------------------------------*/

    if (

        !context.tracking ||

        typeof context.tracking !== "object"

    ) {

        context.tracking = {};

    }

    /*----------------------------------
      Validate Field Map
    ----------------------------------*/

    if (

        !context.fieldMaps ||

        !context.fieldMaps.TRACKING

    ) {

        throw new Error(

            "StaffConstants.FIELD_MAPS.TRACKING not available."

        );

    }

    /*----------------------------------
      Generic Extraction
    ----------------------------------*/

    StaffEntities.extractFields(

        context,

        context.tracking,

        context.fieldMaps.TRACKING

    );

    /*----------------------------------
      Return Context
    ----------------------------------*/

    return context;

};

 /*=========================================================
 EXTRACT ANALYTICS FIELDS
=========================================================*/

StaffEntities.extractAnalyticsFields = function (

    context

) {

    /*----------------------------------
      Validate Context
    ----------------------------------*/

    if (

        !context ||

        typeof context !== "object"

    ) {

        return null;

    }

    if (

        !context.data ||

        typeof context.data !== "object"

    ) {

        return context;

    }

    /*----------------------------------
      Analytics Object
    ----------------------------------*/

    if (

        !context.analytics ||

        typeof context.analytics !== "object"

    ) {

        context.analytics = {};

    }

    /*----------------------------------
      Validate Field Map
    ----------------------------------*/

    if (

        !context.fieldMaps ||

        !context.fieldMaps.ANALYTICS

    ) {

        throw new Error(

            "StaffConstants.FIELD_MAPS.ANALYTICS not available."

        );

    }

    /*----------------------------------
      Generic Extraction
    ----------------------------------*/

    StaffEntities.extractFields(

        context,

        context.analytics,

        context.fieldMaps.ANALYTICS

    );

    /*----------------------------------
      Return Context
    ----------------------------------*/

    return context;

};
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
  Firestore Document Extraction
----------------------------------*/

const id =

    typeof staffDoc.id === "string"

        ? staffDoc.id

        : "";

const data =

    staffDoc.data;

/*----------------------------------
  Firestore Metadata
----------------------------------*/

const documentId =
    id;

const documentData =
    data;

/*----------------------------------
  Firestore State
----------------------------------*/

const hasId =

    documentId.length > 0;

const hasData =

    Object.keys(

        documentData

    ).length > 0;

/*----------------------------------
  Basic Document Info
----------------------------------*/

const documentInfo = {

    id:

        documentId,

    hasId,

    hasData

};
    /*----------------------------------
      Firestore Document Extraction
    ----------------------------------*/

    const id =

        typeof staffDoc.id === "string"

            ? staffDoc.id

            : "";

    const data =

        staffDoc.data;

    /*----------------------------------
      Firestore Metadata
    ----------------------------------*/

    const documentId =
        id;

    const documentData =
        data;

    /*----------------------------------
      Firestore State
    ----------------------------------*/

    const hasId =

        documentId.length > 0;

    const hasData =

        Object.keys(

            documentData

        ).length > 0;

    /*----------------------------------
      Basic Document Info
    ----------------------------------*/

    const documentInfo = {

        id:

            documentId,

        hasId,

        hasData

    };

    /*=====================================================
      CONSTANTS START HERE
    =====================================================*/

/*----------------------------------
  Local References
----------------------------------*/

const {

    FIELDS,

    ROLES,

    DESIGNATIONS,

    DESIGNATION_ALIASES,

    DUTY_TYPES,

    STATUS,

    SEARCH_PRIORITY,

    ENTITY_TYPES,

    KEYWORDS,

    SYNONYMS,

    COLLECTIONS

} = StaffConstants;

/*----------------------------------
  Local Helper Objects
----------------------------------*/

/*
------------------------------------
Normalized Firestore Record
------------------------------------
*/

const normalized = {};

/*
------------------------------------
Validation
------------------------------------
*/

const errors = [];

const warnings = [];

/*
------------------------------------
Entity Collection
------------------------------------
*/

const entities = [];

/*
------------------------------------
Metadata
------------------------------------
*/

const metadata = {

    confidence: 1.0,

    valid: true,

    source: "",

    documentId: id

};

/*
------------------------------------
Identity
------------------------------------
*/

const identity = {

    cleanName: "",

    rawName: "",

    name: "",

    phone: "",

    email: "",

    role: "",

    designation: "",

    type: ""

};

/*
------------------------------------
Posting
------------------------------------
*/

const posting = {

    circle: "",

    division: "",

    range: "",

    beat: ""

};
const assignment = {

    assignedCompartment: "",

    dutyType: "",

    dutyActive: false,

    status: "",

    leader: "",

    team: ""

};
/*
------------------------------------
Duty
------------------------------------
*/

const duty = {

    dutyType: "",

    dutyActive: false,

    status: "",

    lastDutyEnd: ""

};

/*
------------------------------------
Location
------------------------------------
*/

const location = {

    location: "",

    lat: null,

    lon: null

};

/*
------------------------------------
GPS
------------------------------------
*/

const gps = {

    accuracy: null,

    heading: null,

    speed: null,

    lastSeen: null,

    timestamp: null,

    updatedAt: null,

    turnAngle: null,

    turnRate: null

};

/*
------------------------------------
Team
------------------------------------
*/

const teamInfo = {

    leader: "",

    team: ""

};

/*
------------------------------------
Tracking
------------------------------------
*/

const tracking = {

    sessionId: "",

    source: "",

    id: ""

};

/*
------------------------------------
Analytics
------------------------------------
*/

const analytics = {

    pointCount: 0,

    distanceKm: 0,

    startedAt: null,

    endedAt: null,

    monthKey: "",

    compartments: [],

    simplifiedTrack: [],

    startLat: null,

    startLon: null,

    startAccuracy: null

};
    /*=====================================================
      CONTEXT START HERE
    =====================================================*/

    /*----------------------------------
      Context
    ----------------------------------*/

   /*----------------------------------
  Context
----------------------------------*/

const context = {

    id,

    data,

    documentInfo,

    normalized,

    errors,

    warnings,

    entities,

    metadata,

    identity,

    posting,
assignment,
    duty,

    location,

    gps,

    teamInfo,

    tracking,

    analytics,

    fields: FIELDS,
    fieldMaps: StaffConstants.FIELD_MAPS,

    roles: ROLES,

    designations: DESIGNATIONS,

    aliases: DESIGNATION_ALIASES,

    dutyTypes: DUTY_TYPES,

    entityTypes: ENTITY_TYPES,

    keywords: KEYWORDS,

    synonyms: SYNONYMS

};

    /*
    =====================================================

    NEXT STEP

    Field Extraction

    =====================================================
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
