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

            /*----------------------------------
              DEBUG
            ----------------------------------*/

            console.group(

                "🧠 Staff Field Extraction"

            );

            console.log(

                "SOURCE :",

                field.source

            );

            console.log(

                "TARGET :",

                field.target

            );

            console.log(

                "TYPE :",

                field.type

            );

            console.log(

                "VALUE :",

                value

            );

            console.log(

                "BEFORE :",

                JSON.parse(

                    JSON.stringify(

                        target

                    )

                )

            );

            /*----------------------------------
              Copy Value
            ----------------------------------*/

            StaffEntities.setField(

                target,

                field.target,

                value

            );

            /*----------------------------------
              DEBUG
            ----------------------------------*/

            console.log(

                "AFTER :",

                JSON.parse(

                    JSON.stringify(

                        target

                    )

                )

            );

            console.groupEnd();

        }

    );

};
StaffEntities.extractDesignationEntities = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result ||

        typeof result !== "object"

    ) {

        return result;

    }

    const query =

        String(

            result.normalizedQuery ||

            ""

        )

        .trim()

        .toUpperCase();

    if (

        query === ""

    ) {

        return result;

    }

    const matches = [];

    const seen =

        new Set();

    /*----------------------------------
      Helper
    ----------------------------------*/

    function addDesignation(

        staff

    ) {

        if (

            !staff ||

            !staff.identity

        ) {

            return;

        }

        const key =

            String(

                staff.identity.cleanName ||

                ""

            )

            .trim()

            .toUpperCase();

        if (

            seen.has(

                key

            )

        ) {

            return;

        }

        seen.add(

            key

        );

        matches.push(

            staff

        );

    }

    /*----------------------------------
      Search Designation
    ----------------------------------*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff ||

                !staff.identity

            ) {

                return;

            }

            const designation =

                String(

                    staff.identity.designation ||

                    ""

                )

                .trim()

                .toUpperCase();

            if (

                designation === ""

            ) {

                return;

            }

            if (

                query.includes(

                    designation

                )

            ) {

                addDesignation(

                    staff

                );

            }

        }

    );

    /*----------------------------------
      Save Result
    ----------------------------------*/

    result.entities.designations =

        matches;

    result.stats.designationMatches =

        matches.length;

    result.stats.totalEntities +=

        matches.length;

    return result;

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
  Canonical Defaults
----------------------------------*/

if (

    context.assignment.lastDutyEnd === undefined

) {

    context.assignment.lastDutyEnd = null;

}
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

    /*----------------------------------
      Ensure Canonical Team Section
    ----------------------------------*/

    if (

        !context.teamInfo ||

        typeof context.teamInfo !== "object"

    ) {

        context.teamInfo = {};

    }

    /*----------------------------------
      Validate Field Maps
    ----------------------------------*/

    if (

        !context.fieldMaps ||

        typeof context.fieldMaps !== "object"

    ) {

        throw new Error(

            "StaffConstants.FIELD_MAPS not available."

        );

    }

    if (

        !Array.isArray(

            context.fieldMaps.TEAM_INFO

        )

    ) {

        throw new Error(

            "StaffConstants.FIELD_MAPS.TEAM_INFO not available."

        );

    }

    /*----------------------------------
      Extract Team Fields
    ----------------------------------*/

    StaffEntities.extractFields(

        context,

        context.teamInfo,

        context.fieldMaps.TEAM_INFO

    );

    /*----------------------------------
      Return Canonical Context
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
 VALIDATE NORMALIZED DATA
=========================================================*/

StaffEntities.validateNormalizedData = function (

    context

) {

    /*----------------------------------
      Validate Context
    ----------------------------------*/

    if (

        !context ||

        typeof context !== "object"

    ) {

        throw new Error(

            "Validation context missing."

        );

    }

    /*----------------------------------
      Local References
    ----------------------------------*/

    const {

        identity,

        posting,

        assignment,

        location,

        gps,

        tracking,

        analytics,

        errors,

        warnings,

        metadata

    } = context;

    /*----------------------------------
      Identity
    ----------------------------------*/

    if (

        !identity.cleanName

    ) {

        errors.push(

            "Missing cleanName."

        );

    }

    if (

        !identity.name

    ) {

        warnings.push(

            "Missing display name."

        );

    }

    if (

        !identity.role

    ) {

        warnings.push(

            "Missing role."

        );

    }

    if (

        !identity.designation

    ) {

        warnings.push(

            "Missing designation."

        );

    }

    /*----------------------------------
      Posting
    ----------------------------------*/

    if (

        !posting.circle

    ) {

        warnings.push(

            "Missing circle."

        );

    }

    if (

        !posting.division

    ) {

        warnings.push(

            "Missing division."

        );

    }

    if (

        !posting.range

    ) {

        warnings.push(

            "Missing range."

        );

    }

    if (

        !posting.beat

    ) {

        warnings.push(

            "Missing beat."

        );

    }

    /*----------------------------------
      Assignment
    ----------------------------------*/

    if (

        assignment.dutyActive &&

        !assignment.dutyType

    ) {

        warnings.push(

            "Duty active without duty type."

        );

    }

    /*----------------------------------
      GPS
    ----------------------------------*/

    if (

        location.lat !== null &&

        (

            location.lat < -90 ||

            location.lat > 90

        )

    ) {

        errors.push(

            "Latitude out of range."

        );

    }

    if (

        location.lon !== null &&

        (

            location.lon < -180 ||

            location.lon > 180

        )

    ) {

        errors.push(

            "Longitude out of range."

        );

    }

    if (

        gps.accuracy !== null &&

        gps.accuracy < 0

    ) {

        warnings.push(

            "Invalid GPS accuracy."

        );

    }

    if (

        gps.speed !== null &&

        gps.speed < 0

    ) {

        warnings.push(

            "Invalid speed."

        );

    }

    /*----------------------------------
      Tracking
    ----------------------------------*/

    if (

        assignment.dutyActive &&

        !tracking.sessionId

    ) {

        warnings.push(

            "Active duty without session."

        );

    }

    /*----------------------------------
      Analytics
    ----------------------------------*/

    if (

        analytics.distanceKm < 0

    ) {

        warnings.push(

            "Negative distance."

        );

    }

    if (

        analytics.pointCount < 0

    ) {

        warnings.push(

            "Negative point count."

        );

    }

    /*----------------------------------
      Metadata
    ----------------------------------*/

    metadata.valid =

        errors.length === 0;

    metadata.errorCount =

        errors.length;

    metadata.warningCount =

        warnings.length;

    metadata.confidence =

        metadata.valid

            ? 1

            : 0;

    /*----------------------------------
      Return Context
    ----------------------------------*/

    return context;

};

 /*=========================================================
 BUILD SEARCH TOKENS
=========================================================*/

StaffEntities.buildSearchTokens = function (

    context

) {

    /*----------------------------------
      Validate Context
    ----------------------------------*/

    if (

        !context ||

        typeof context !== "object"

    ) {

        throw new Error(

            "Search token context missing."

        );

    }

    /*----------------------------------
      Create Token Store
    ----------------------------------*/

    const tokens =

        new Set();

    /*----------------------------------
      Helper
    ----------------------------------*/

    function add(value) {

        if (

            value === null ||

            value === undefined

        ) {

            return;

        }

        const text =

            String(value)

                .trim()

                .toUpperCase();

        if (

            text.length === 0

        ) {

            return;

        }

        tokens.add(

            text

        );

    }

    /*----------------------------------
      Helper (Split Words)
    ----------------------------------*/

    function addWords(value) {

        if (

            !value

        ) {

            return;

        }

        String(value)

            .toUpperCase()

            .split(

                /[\s,._()/\\-]+/

            )

            .forEach(

                add

            );

    };

    /*=====================================================
      Identity
    =====================================================*/

    add(

        context.identity.cleanName

    );

    add(

        context.identity.name

    );

    add(

        context.identity.rawName

    );

    add(

        context.identity.phone

    );

    add(

        context.identity.email

    );

    add(

        context.identity.role

    );

    add(

        context.identity.designation

    );

    add(

        context.identity.type

    );

    addWords(

        context.identity.cleanName

    );

    addWords(

        context.identity.name

    );

    addWords(

        context.identity.rawName

    );

    /*=====================================================
      Posting
    =====================================================*/

    add(

        context.posting.circle

    );

    add(

        context.posting.division

    );

    add(

        context.posting.range

    );

    add(

        context.posting.beat

    );

    addWords(

        context.posting.circle

    );

    addWords(

        context.posting.division

    );

    addWords(

        context.posting.range

    );

    addWords(

        context.posting.beat

    );

    /*=====================================================
      Assignment
    =====================================================*/

    add(

        context.assignment.assignedCompartment

    );

    add(

        context.assignment.dutyType

    );

    add(

        context.assignment.status

    );

    add(

        context.assignment.leader

    );

    add(

        context.assignment.team

    );

    addWords(

        context.assignment.assignedCompartment

    );

    addWords(

        context.assignment.leader

    );

    addWords(

        context.assignment.team

    );

    /*=====================================================
      Location
    =====================================================*/

    add(

        context.location.location

    );

    addWords(

        context.location.location

    );

    /*=====================================================
      Team
    =====================================================*/

    add(

        context.teamInfo.leader

    );

    add(

        context.teamInfo.team

    );

    addWords(

        context.teamInfo.leader

    );

    addWords(

        context.teamInfo.team

    );

    /*=====================================================
      Tracking
    =====================================================*/

    add(

        context.tracking.sessionId

    );

    add(

        context.tracking.source

    );

    add(

        context.tracking.id

    );

    /*=====================================================
      Analytics
    =====================================================*/

    add(

        context.analytics.monthKey

    );

    /*=====================================================
      Boolean Flags
    =====================================================*/

    if (

        context.assignment.dutyActive

    ) {

        add(

            "DUTY_ACTIVE"

        );

    }

    else {

        add(

            "DUTY_INACTIVE"

        );

    }

    /*=====================================================
      Numeric Tokens
    =====================================================*/

    if (

        context.location.lat !== null

    ) {

        add(

            context.location.lat

        );

    }

    if (

        context.location.lon !== null

    ) {

        add(

            context.location.lon

        );

    }

    /*=====================================================
      Search Priority
    =====================================================*/

    context.search = {

        tokens:

            Array.from(

                tokens

            ),

        priority:

            StaffConstants

                .SEARCH_PRIORITY

    };

    /*----------------------------------
      Return Context
    ----------------------------------*/

    return context;

};

 /*=========================================================
 BUILD ALIASES
=========================================================*/

StaffEntities.buildAliases = function (

    context

) {

    /*----------------------------------
      Validate Context
    ----------------------------------*/

    if (

        !context ||

        typeof context !== "object"

    ) {

        throw new Error(

            "Alias context missing."

        );

    }

    /*----------------------------------
      Alias Store
    ----------------------------------*/

    const aliases =

        new Set();

    /*----------------------------------
      Helper
    ----------------------------------*/

    function add(value) {

        if (

            value === null ||

            value === undefined

        ) {

            return;

        }

        const text =

            String(value)

                .trim()

                .toUpperCase();

        if (

            !text

        ) {

            return;

        }

        aliases.add(

            text

        );

    }

    /*----------------------------------
      Helper (Words)
    ----------------------------------*/

    function addWords(value) {

        if (

            !value

        ) {

            return;

        }

        String(value)

            .toUpperCase()

            .split(

                /[\s,._()/\\-]+/

            )

            .forEach(

                add

            );

    }

    /*=====================================================
      Identity
    =====================================================*/

    add(

        context.identity.cleanName

    );

    add(

        context.identity.name

    );

    add(

        context.identity.rawName

    );

    addWords(

        context.identity.cleanName

    );

    addWords(

        context.identity.name

    );

    addWords(

        context.identity.rawName

    );

    /*=====================================================
      Role
    =====================================================*/

    add(

        context.identity.role

    );

    addWords(

        context.identity.role

    );

    /*=====================================================
      Designation
    =====================================================*/

    add(

        context.identity.designation

    );

    addWords(

        context.identity.designation

    );

    /*----------------------------------
      Designation Aliases
    ----------------------------------*/

    if (

        context.aliases &&

        typeof context.aliases === "object"

    ) {

        const list =

            context.aliases[
                context.identity.designation
            ];

        if (

            Array.isArray(

                list

            )

        ) {

            list.forEach(

                add

            );

        }

    }

    /*=====================================================
      Posting
    =====================================================*/

    [

        context.posting.circle,

        context.posting.division,

        context.posting.range,

        context.posting.beat,

        context.assignment.assignedCompartment

    ]

    .forEach(

        function (

            value

        ) {

            add(

                value

            );

            addWords(

                value

            );

        }

    );

    /*=====================================================
      Team
    =====================================================*/

    [

        context.assignment.leader,

        context.assignment.team,

        context.teamInfo.leader,

        context.teamInfo.team

    ]

    .forEach(

        function (

            value

        ) {

            add(

                value

            );

            addWords(

                value

            );

        }

    );

    /*=====================================================
      Duty
    =====================================================*/

    add(

        context.assignment.dutyType

    );

    add(

        context.assignment.status

    );

    addWords(

        context.assignment.dutyType

    );

    addWords(

        context.assignment.status

    );

    /*=====================================================
      Contact
    =====================================================*/

    add(

        context.identity.phone

    );

    add(

        context.identity.email

    );

    /*=====================================================
      Tracking
    =====================================================*/

    add(

        context.tracking.sessionId

    );

    add(

        context.tracking.source

    );

    /*=====================================================
      Location
    =====================================================*/

    add(

        context.location.location

    );

    addWords(

        context.location.location

    );

    /*=====================================================
      Save
    =====================================================*/

    context.aliasList =

        Array.from(

            aliases

        );

    /*----------------------------------
      Return
    ----------------------------------*/

    return context;

};

 /*=========================================================
 BUILD CANONICAL STAFF OBJECT
=========================================================*/
/*=========================================================
 BUILD CANONICAL STAFF OBJECT
=========================================================*/

StaffEntities.buildCanonicalStaffObject = function (

    context

) {

    /*----------------------------------
      Validate Context
    ----------------------------------*/

    if (

        !context ||

        typeof context !== "object"

    ) {

        throw new Error(

            "Canonical context missing."

        );

    }

    /*----------------------------------
      Build Canonical Object
    ----------------------------------*/

    context.normalized = Object.freeze({

        /*=================================
          Firestore
        =================================*/

        id:
            context.id,

        documentInfo:
            Object.freeze({

                ...context.documentInfo

            }),

        /*=================================
          Identity
        =================================*/

        identity:
            Object.freeze({

                ...context.identity

            }),

        /*=================================
          Posting
        =================================*/

        posting:
            Object.freeze({

                ...context.posting

            }),

        /*=================================
          Assignment
        =================================*/

        assignment:
            Object.freeze({

                ...context.assignment

            }),

        /*=================================
          Location
        =================================*/

        location:
            Object.freeze({

                ...context.location

            }),

        /*=================================
          GPS
        =================================*/

        gps:
            Object.freeze({

                ...context.gps

            }),

        /*=================================
          Team
        =================================*/

        teamInfo:
            Object.freeze({

                ...context.teamInfo

            }),

        /*=================================
          Tracking
        =================================*/

        tracking:
            Object.freeze({

                ...context.tracking

            }),

        /*=================================
          Analytics
        =================================*/

        analytics:
            Object.freeze({

                ...context.analytics

            }),

        /*=================================
          Search
        =================================*/

        search:
            Object.freeze({

                ...context.search

            }),

        /*=================================
          Aliases
        =================================*/

        aliases:
            Object.freeze(

                [...context.aliasList]

            ),

        /*=================================
          Validation
        =================================*/

        metadata:
            Object.freeze({

                ...context.metadata

            }),

        errors:
            Object.freeze(

                [...context.errors]

            ),

        warnings:
            Object.freeze(

                [...context.warnings]

            ),

        entities:
            Object.freeze(

                [...context.entities]

            )

    });

    /*----------------------------------
      Return Context
    ----------------------------------*/

    return context;

};/*=========================================================
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

    createdAt: null,

    updatedAt: null,

    startAccuracy: 0,

    startLat: 0,

    startLon: 0,

    compartments: [],

    simplifiedTrack: []

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

/*----------------------------------
  Extract Identity
----------------------------------*/

StaffEntities.extractIdentityFields(
    context
);

/*----------------------------------
  Extract Posting
----------------------------------*/

StaffEntities.extractPostingFields(
    context
);

/*----------------------------------
  Extract Assignment
----------------------------------*/

StaffEntities.extractAssignmentFields(
    context
);

/*----------------------------------
  Extract Location
----------------------------------*/

StaffEntities.extractLocationFields(
    context
);

/*----------------------------------
  Extract GPS
----------------------------------*/

StaffEntities.extractGPSFields(
    context
);

/*----------------------------------
  Extract Team
----------------------------------*/

StaffEntities.extractTeamFields(
    context
);

/*----------------------------------
  Extract Tracking
----------------------------------*/

StaffEntities.extractTrackingFields(
    context
);

/*----------------------------------
  Extract Analytics
----------------------------------*/

StaffEntities.extractAnalyticsFields(
    context
);

/*----------------------------------
  Validate
----------------------------------*/

StaffEntities.validateNormalizedData(
    context
);

/*----------------------------------
  Build Search Tokens
----------------------------------*/

StaffEntities.buildSearchTokens(
    context
);

/*----------------------------------
  Build Aliases
----------------------------------*/

StaffEntities.buildAliases(
    context
);

/*----------------------------------
  Build Canonical Staff
----------------------------------*/

StaffEntities.buildCanonicalStaffObject(
    context
);

/*----------------------------------
  Return Canonical Staff
----------------------------------*/

return context.normalized;

};

 /*=========================================================
 NORMALIZE STAFF DOCUMENTS
=========================================================*/

StaffEntities.normalizeStaffDocuments = function (

    staffDocuments

) {

    /*----------------------------------
      Validate Input
    ----------------------------------*/

    if (

        !Array.isArray(

            staffDocuments

        )

    ) {

        console.warn(

            "[StaffEntities] Invalid staff document list.",

            staffDocuments

        );

        return [];

    }

    /*----------------------------------
      Output
    ----------------------------------*/

    const normalizedDocuments = [];

    /*----------------------------------
      Statistics
    ----------------------------------*/

    let totalDocuments = 0;

    let normalizedCount = 0;

    let skippedCount = 0;

    /*----------------------------------
      Normalize
    ----------------------------------*/

    staffDocuments.forEach(

        function (

            staffDoc,

            index

        ) {

            totalDocuments++;

            try {

                const normalized =

                    StaffEntities
                        .normalizeStaffDocument(

                            staffDoc

                        );

                if (

                    !normalized

                ) {

                    skippedCount++;

                    return;

                }

                normalizedDocuments.push(

                    normalized

                );

                normalizedCount++;

            }

            catch (

                error

            ) {

                skippedCount++;

                console.error(

                    "[StaffEntities] Failed to normalize document.",

                    {

                        index,

                        id:

                            staffDoc?.id ||

                            "",

                        error

                    }

                );

            }

        }

    );

    /*----------------------------------
      Summary
    ----------------------------------*/

    console.group(

        "🧠 Staff Normalization"

    );

    console.log(

        "Total:",

        totalDocuments

    );

    console.log(

        "Normalized:",

        normalizedCount

    );

    console.log(

        "Skipped:",

        skippedCount

    );

    console.groupEnd();

    /*----------------------------------
      Return
    ----------------------------------*/

    return normalizedDocuments;

};

 /*=========================================================
 BUILD INDEX MAPS
=========================================================*/

StaffEntities.buildIndexMaps = function () {

    /*----------------------------------
      Validate Staff Collection
    ----------------------------------*/

    if (

        !Array.isArray(

            StaffEntities.staff

        )

    ) {

        throw new Error(

            "Staff collection not available."

        );

    }

    /*----------------------------------
      Local Reference
    ----------------------------------*/

    const indexes =

        StaffEntities.index;

    /*----------------------------------
      Clear Existing Indexes
    ----------------------------------*/

    Object.keys(

        indexes

    )

    .forEach(

        function (

            key

        ) {

            indexes[key].clear();

        }

    );

    /*----------------------------------
      Helper
    ----------------------------------*/

    function add(

        map,

        key,

        staff

    ) {

        if (

            key === null ||

            key === undefined

        ) {

            return;

        }

        const value =

            String(

                key

            )

            .trim()

            .toUpperCase();

        if (

            value.length === 0

        ) {

            return;

        }

        if (

            !map.has(

                value

            )

        ) {

            map.set(

                value,

                []

            );

        }

        map

            .get(

                value

            )

            .push(

                staff

            );

    }

 
    /*----------------------------------
      Build All Indexes
    ----------------------------------*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff

            ) {

                return;

            }

            /*==============================
              Identity
            ==============================*/

            add(

                indexes.byCleanName,

                staff.identity.cleanName,

                staff

            );

            add(

                indexes.byName,

                staff.identity.name,

                staff

            );

            add(

                indexes.byPhone,

                staff.identity.phone,

                staff

            );

            /*==============================
              Role
            ==============================*/

            add(

                indexes.byRole,

                staff.identity.role,

                staff

            );

            add(

                indexes.byDesignation,

                staff.identity.designation,

                staff

            );

            /*==============================
              Posting
            ==============================*/

            add(

                indexes.byCircle,

                staff.posting.circle,

                staff

            );

            add(

                indexes.byDivision,

                staff.posting.division,

                staff

            );

            add(

                indexes.byRange,

                staff.posting.range,

                staff

            );

            add(

                indexes.byBeat,

                staff.posting.beat,

                staff

            );

            add(

                indexes.byCompartment,

                staff.assignment.assignedCompartment,

                staff

            );

            /*==============================
              Team
            ==============================*/

            add(

                indexes.byLeader,

                staff.assignment.leader,

                staff

            );

            add(

                indexes.byTeam,

                staff.assignment.team,

                staff

            );

        }

    );

    /*----------------------------------
      Summary
    ----------------------------------*/

    console.group(

        "🧠 Staff Index Maps"

    );

    console.log(

        "Staff:",

        StaffEntities.staff.length

    );

    console.log(

        "Clean Names:",

        indexes.byCleanName.size

    );

    console.log(

        "Names:",

        indexes.byName.size

    );

    console.log(

        "Phones:",

        indexes.byPhone.size

    );

    console.log(

        "Roles:",

        indexes.byRole.size

    );

    console.log(

        "Designations:",

        indexes.byDesignation.size

    );

    console.log(

        "Circles:",

        indexes.byCircle.size

    );

    console.log(

        "Divisions:",

        indexes.byDivision.size

    );

    console.log(

        "Ranges:",

        indexes.byRange.size

    );

    console.log(

        "Beats:",

        indexes.byBeat.size

    );

    console.log(

        "Compartments:",

        indexes.byCompartment.size

    );

    console.log(

        "Leaders:",

        indexes.byLeader.size

    );

    console.log(

        "Teams:",

        indexes.byTeam.size

    );

    console.groupEnd();

    /*----------------------------------
      Return
    ----------------------------------*/

    return StaffEntities.index;

};

 /*=========================================================
 CREATE EXTRACTION RESULT
=========================================================*/

StaffEntities.createExtractionResult = function (

    query = ""

) {

    /*----------------------------------
      Normalize Query
    ----------------------------------*/

    const originalQuery =

        typeof query === "string"

            ? query

            : "";

    const normalizedQuery =

        originalQuery

            .trim()

            .toUpperCase();

    /*----------------------------------
      Build Result
    ----------------------------------*/

    return {

        /*=================================
          Query
        =================================*/

        originalQuery,

        normalizedQuery,

        /*=================================
          Entities
        =================================*/

        entities: {

            staff: [],

            phones: [],

            roles: [],

            designations: [],

            posting: [],

            team: [],

            duty: [],

            gps: []

        },

        /*=================================
          Keywords
        =================================*/

        keywords: [],

        /*=================================
          Intent Candidates
        =================================*/

        intents: [],

        /*=================================
          Confidence
        =================================*/

        confidence: 0,

        /*=================================
          Validation
        =================================*/

        warnings: [],

        errors: [],

        /*=================================
          Statistics
        =================================*/

        stats: {

            totalEntities: 0,

            uniqueStaff: 0,

            executionTime: 0

        },

        /*=================================
          Metadata
        =================================*/

        metadata: {

            version:

                StaffEntities.VERSION,

            timestamp:

                Date.now(),

            source:

                StaffConstants.DOMAIN

        }

    };

};

/*=========================================================
 EXTRACT STAFF ENTITIES
=========================================================*/

StaffEntities.extractStaffEntities = function (
    result
) {
    /*----------------------------------
      Validate Result
    ----------------------------------*/
    if (
        !result ||
        typeof result !== "object"
    ) {
        return result;
    }
    /*----------------------------------
      Search Query
    ----------------------------------*/
    const query =
        String(
            result.searchQuery ||
            result.normalizedQuery ||
            ""
        )
        .trim()
        .toUpperCase();
    if (
        query === ""
    ) {
        return result;
    }
    /*----------------------------------
      Query Words
    ----------------------------------*/
    const queryWords =
        new Set(
            query
                .split(/\s+/)
                .filter(
                    function (
                        word
                    ) {
                        return (
                            word.length >= 2
                        );
                    }
                )
        );
    /*----------------------------------
      Matches
    ----------------------------------*/
    const matches = [];
    const seen =
        new Set();
    /*----------------------------------
      Helper
    ----------------------------------*/
    function addMatch(
        staff,
        score
    ) {
        if (
            !staff ||
            !staff.identity
        ) {
            return;
        }
        const key =
            String(
                staff.identity.cleanName ||
                ""
            )
            .trim()
            .toUpperCase();
        if (
            seen.has(
                key
            )
        ) {
            return;
        }
        seen.add(
            key
        );
        matches.push({
            staff:
                staff,
            score:
                score
        });
    }
    /*----------------------------------
      Search Staff
    ----------------------------------*/
    StaffEntities.staff.forEach(
        function (
            staff
        ) {
            if (
                !staff ||
                !staff.search ||
                !Array.isArray(
                    staff.search.tokens
                )
            ) {
                return;
            }
            let score = 0;
            staff.search.tokens.forEach(
                function (
                    token
                ) {
                    token =
                        String(
                            token ||
                            ""
                        )
                        .trim()
                        .toUpperCase();
                    if (
                        token.length < 2
                    ) {
                        return;
                    }
                    /*------------------------------
                      Exact Full Query
                    ------------------------------*/
                    if (
                        token === query
                    ) {
                        score += 1000;
                        return;
                    }
                    /*------------------------------
                      Exact Word Match
                    ------------------------------*/
                    if (
                        queryWords.size === 1 &&
                        queryWords.has(
                            token
                        )
                    ) {
                        score +=
                            token.length *
                            100;
                        return;
                    }
                    /*------------------------------
                      Multi-word Token
                    ------------------------------*/
                    const tokenWords =
                        token
                            .split(/\s+/)
                            .filter(
                                function (
                                    word
                                ) {
                                    return (
                                        word.length >= 2
                                    );
                                }
                            );
                    let matchedWords = 0;
                    tokenWords.forEach(
                        function (
                            word
                        ) {
                            if (
                                queryWords.has(
                                    word
                                )
                            ) {
                                matchedWords++;
                            }
                        }
                    );
                    if (
                        tokenWords.length === 1
                    ) {
                        if (
                            queryWords.size === 1 &&
                            matchedWords === 1
                        ) {
                            score +=
                                token.length *
                                100;
                        }
                    } else {
                       if (

    matchedWords === tokenWords.length &&

    tokenWords.length === queryWords.size

) {

    score +=

        token.length *

        40;

}
                    }
                }
            );
            if (
                score > 0
            ) {
                addMatch(
                    staff,
                    score
                );
            }
        }
    );
    /*----------------------------------
      Highest Score First
    ----------------------------------*/
    matches.sort(
        function (
            a,
            b
        ) {
            if (
                b.score !==
                a.score
            ) {
                return (
                    b.score -
                    a.score
                );
            }
            return (
                a.staff.identity.cleanName
                    .localeCompare(
                        b.staff.identity.cleanName
                    )
            );
        }
    );
    /*----------------------------------
      Save Result
    ----------------------------------*/
    result.entities.staff =
        matches.map(
            function (
                item
            ) {
                return item.staff;
            }
        );
    result.stats.uniqueStaff =
        result.entities.staff.length;
    result.stats.totalEntities +=
        result.entities.staff.length;
    return result;
};
 /*=========================================================
 EXTRACT PHONE ENTITIES
=========================================================*/

StaffEntities.extractPhoneEntities = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result ||

        typeof result !== "object"

    ) {

        return result;

    }

    const query =

        result.normalizedQuery;

    if (

        !query

    ) {

        return result;

    }

    const matches = [];

    const seen = new Set();

    /*----------------------------------
      Search Staff
    ----------------------------------*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff ||

                !staff.identity

            ) {

                return;

            }

            const phone =

                String(

                    staff.identity.phone ||

                    ""

                ).trim();

            if (

                phone === ""

            ) {

                return;

            }

            if (

                !query.includes(

                    phone

                )

            ) {

                return;

            }

            if (

                seen.has(

                    phone

                )

            ) {

                return;

            }

            seen.add(

                phone

            );

            matches.push(

                staff

            );

        }

    );

    /*----------------------------------
      Save Result
    ----------------------------------*/

    result.entities.phones =

        matches;

    result.stats.phoneMatches =

        matches.length;

    result.stats.totalEntities +=

        matches.length;

    return result;

};
 /*=========================================================
 EXTRACT ROLE ENTITIES
=========================================================*/

StaffEntities.extractRoleEntities = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result ||

        typeof result !== "object"

    ) {

        return result;

    }

    const query =

        result.normalizedQuery;

    if (

        !query

    ) {

        return result;

    }

    const matches = [];

    const seen = new Set();

    /*----------------------------------
      Helper
    ----------------------------------*/

    function addRole(

        staff

    ) {

        if (

            !staff ||

            !staff.identity

        ) {

            return;

        }

        const key =

            staff.identity.cleanName;

        if (

            seen.has(

                key

            )

        ) {

            return;

        }

        seen.add(

            key

        );

        matches.push(

            staff

        );

    }

    /*----------------------------------
      Search Roles
    ----------------------------------*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff ||

                !staff.identity

            ) {

                return;

            }

            const role =

                String(

                    staff.identity.role ||

                    ""

                )

                .trim()

                .toUpperCase();

            if (

                !role

            ) {

                return;

            }

            if (

                query.includes(

                    role

                )

            ) {

                addRole(

                    staff

                );

                return;

            }

            if (

                StaffConstants.SYNONYMS &&

                Array.isArray(

                    StaffConstants.SYNONYMS[

                        role

                    ]

                )

            ) {

                const found =

                    StaffConstants

                        .SYNONYMS[

                            role

                        ]

                        .some(

                            function (

                                synonym

                            ) {

                                return query.includes(

                                    String(

                                        synonym

                                    )

                                    .toUpperCase()

                                );

                            }

                        );

                if (

                    found

                ) {

                    addRole(

                        staff

                    );

                }

            }

        }

    );

    /*----------------------------------
      Save Result
    ----------------------------------*/

    result.entities.roles =

        matches;

    result.stats.roleMatches =

        matches.length;

    result.stats.totalEntities +=

        matches.length;

    return result;

};
 StaffEntities.buildPostingIndex = function () {

    if (

        StaffEntities.postingIndex

    ) {

        return StaffEntities.postingIndex;

    }

    const index = [];

    const seen = new Set();

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff ||

                !staff.posting

            ) {

                return;

            }

            function add(

                type,

                value

            ) {

                value =

                    String(

                        value ||

                        ""

                    )

                    .trim();

                if (

                    !value

                ) {

                    return;

                }

                const key =

                    type +

                    "|" +

                    value.toUpperCase();

                if (

                    seen.has(

                        key

                    )

                ) {

                    return;

                }

                seen.add(

                    key

                );

                index.push({

                    type:

                        type,

                    value:

                        value,

                    normalized:

                        value.toUpperCase(),

                    length:

                        value.length

                });

            }

            add(

                "circle",

                staff.posting.circle

            );

            add(

                "division",

                staff.posting.division

            );

            add(

                "range",

                staff.posting.range

            );

            add(

                "beat",

                staff.posting.beat

            );

            add(

                "compartment",

                staff.assignment

                    ?.assignedCompartment

            );

        }

    );

    index.sort(

        function (

            a,

            b

        ) {

            return (

                b.length -

                a.length

            );

        }

    );

    StaffEntities.postingIndex =

        index;

    return index;

};
StaffEntities.extractPostingEntities = function (

    result

) {

    if (

        !result

    ) {

        return result;

    }

    const query =

        String(

            result.normalizedQuery ||

            ""

        )

        .toUpperCase();

    const posting = [];

    const seen = new Set();

    const index =

        StaffEntities.buildPostingIndex();

    index.forEach(

        function (

            item

        ) {

            if (

                query.includes(

                    item.normalized

                )

            ) {

                const key =

                    item.type +

                    "|" +

                    item.normalized;

                if (

                    seen.has(

                        key

                    )

                ) {

                    return;

                }

                seen.add(

                    key

                );

                posting.push({

                    type:

                        item.type,

                    value:

                        item.value

                });

            }

        }

    );

    result.entities.posting =

        posting;

    result.stats.postingMatches =

        posting.length;

    result.stats.totalEntities +=

        posting.length;

    return result;

};

 /*=========================================================
 EXTRACT TEAM ENTITIES
=========================================================*/

StaffEntities.extractTeamEntities = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result ||

        typeof result !== "object"

    ) {

        return result;

    }

    const query =

        result.normalizedQuery;

    if (

        !query

    ) {

        return result;

    }

    const matches = [];

    const seen = new Set();

    /*----------------------------------
      Helper
    ----------------------------------*/

    function addTeam(

        staff

    ) {

        if (

            !staff ||

            !staff.identity

        ) {

            return;

        }

        const key =

            staff.identity.cleanName;

        if (

            seen.has(

                key

            )

        ) {

            return;

        }

        seen.add(

            key

        );

        matches.push(

            staff

        );

    }

    /*----------------------------------
      Search Team
    ----------------------------------*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff ||

                !staff.teamInfo

            ) {

                return;

            }

            const values = [

                staff.teamInfo.leader,

                staff.teamInfo.team

            ];

            const found =

                values.some(

                    function (

                        value

                    ) {

                        if (

                            !value

                        ) {

                            return false;

                        }

                        return query.includes(

                            String(

                                value

                            )

                            .trim()

                            .toUpperCase()

                        );

                    }

                );

            if (

                found

            ) {

                addTeam(

                    staff

                );

            }

        }

    );

    /*----------------------------------
      Save Result
    ----------------------------------*/

    result.entities.team =

        matches;

    result.stats.teamMatches =

        matches.length;

    result.stats.totalEntities +=

        matches.length;

    return result;

};
 /*=========================================================
 EXTRACT DUTY ENTITIES
=========================================================*/

StaffEntities.extractDutyEntities = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result ||

        typeof result !== "object"

    ) {

        return result;

    }

    const query =

        result.normalizedQuery;

    if (

        !query

    ) {

        return result;

    }

    const matches = [];

    const seen =

        new Set();

    /*----------------------------------
      Helper
    ----------------------------------*/

    function addDuty(

        staff

    ) {

        if (

            !staff ||

            !staff.identity

        ) {

            return;

        }

        const key =

            staff.identity.cleanName;

        if (

            seen.has(

                key

            )

        ) {

            return;

        }

        seen.add(

            key

        );

        matches.push(

            staff

        );

    }

    /*----------------------------------
      Search Duty
    ----------------------------------*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff

            ) {

                return;

            }

            const values = [

                staff.assignment ?

                    staff.assignment.dutyType :

                    "",

                staff.assignment ?

                    String(

                        staff.assignment.dutyActive

                    ) :

                    "",

                staff.assignment ?

                    staff.assignment.status :

                    "",

                staff.duty ?

                    staff.duty.lastDutyEnd :

                    ""

            ];

            const found =

                values.some(

                    function (

                        value

                    ) {

                        if (

                            value === null ||

                            value === undefined ||

                            value === ""

                        ) {

                            return false;

                        }

                        return query.includes(

                            String(

                                value

                            )

                            .trim()

                            .toUpperCase()

                        );

                    }

                );

            if (

                found

            ) {

                addDuty(

                    staff

                );

            }

        }

    );

    /*----------------------------------
      Save Result
    ----------------------------------*/

    result.entities.duty =

        matches;

    result.stats.dutyMatches =

        matches.length;

    result.stats.totalEntities +=

        matches.length;

    return result;

};
/*=========================================================
 EXTRACT GPS ENTITIES
=========================================================*/

StaffEntities.extractGPSEntities = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result ||

        typeof result !== "object"

    ) {

        return result;

    }

    const query =

        result.normalizedQuery;

    if (

        !query

    ) {

        return result;

    }

    const matches = [];

    const seen =

        new Set();

    /*----------------------------------
      Helper
    ----------------------------------*/

    function addGPS(

        staff

    ) {

        if (

            !staff ||

            !staff.identity

        ) {

            return;

        }

        const key =

            staff.identity.cleanName;

        if (

            seen.has(

                key

            )

        ) {

            return;

        }

        seen.add(

            key

        );

        matches.push(

            staff

        );

    }

    /*----------------------------------
      Search GPS
    ----------------------------------*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff

            ) {

                return;

            }

            const values = [

                staff.location ?

                    staff.location.location :

                    "",

                staff.location ?

                    String(

                        staff.location.lat

                    ) :

                    "",

                staff.location ?

                    String(

                        staff.location.lon

                    ) :

                    "",

                staff.gps ?

                    String(

                        staff.gps.accuracy

                    ) :

                    "",

                staff.gps ?

                    String(

                        staff.gps.speed

                    ) :

                    "",

                staff.gps ?

                    String(

                        staff.gps.heading

                    ) :

                    "",

                staff.gps ?

                    String(

                        staff.gps.turnRate

                    ) :

                    "",

                staff.gps ?

                    String(

                        staff.gps.turnAngle

                    ) :

                    "",

                staff.gps ?

                    String(

                        staff.gps.lastSeen

                    ) :

                    "",

                staff.gps ?

                    String(

                        staff.gps.timestamp

                    ) :

                    "",

                staff.gps ?

                    String(

                        staff.gps.updatedAt

                    ) :

                    ""

            ];

            const found =

                values.some(

                    function (

                        value

                    ) {

                        if (

                            value === null ||

                            value === undefined ||

                            value === ""

                        ) {

                            return false;

                        }

                        return query.includes(

                            String(

                                value

                            )

                            .trim()

                            .toUpperCase()

                        );

                    }

                );

            if (

                found

            ) {

                addGPS(

                    staff

                );

            }

        }

    );

    /*----------------------------------
      Save Result
    ----------------------------------*/

    result.entities.gps =

        matches;

    result.stats.gpsMatches =

        matches.length;

    result.stats.totalEntities +=

        matches.length;

    return result;

};
 /*=========================================================
 EXTRACT KEYWORDS
=========================================================*/

StaffEntities.extractKeywords = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result ||

        typeof result !== "object"

    ) {

        return result;

    }

    const query =

        result.normalizedQuery;

    if (

        !query

    ) {

        return result;

    }

    result.keywords = [];

    const seen =

        new Set();

    const keywordGroups =

        StaffConstants.KEYWORDS || {};

    /*----------------------------------
      Scan Keyword Groups
    ----------------------------------*/

    Object.keys(

        keywordGroups

    ).forEach(

        function (

            group

        ) {

            const words =

                keywordGroups[

                    group

                ];

            if (

                !Array.isArray(

                    words

                )

            ) {

                return;

            }

            words.forEach(

                function (

                    word

                ) {

                    const keyword =

                        String(

                            word

                        )

                        .trim()

                        .toUpperCase();

                    if (

                        keyword === ""

                    ) {

                        return;

                    }

                    if (

                        !query.includes(

                            keyword

                        )

                    ) {

                        return;

                    }

                    if (

                        seen.has(

                            keyword

                        )

                    ) {

                        return;

                    }

                    seen.add(

                        keyword

                    );

                    result.keywords.push({

                        group,

                        keyword

                    });

                }

            );

        }

    );

    /*----------------------------------
      Statistics
    ----------------------------------*/

    result.stats.keywordMatches =

        result.keywords.length;

    result.stats.totalEntities +=

        result.keywords.length;

    return result;

};
 /*=========================================================
 CALCULATE EXTRACTION CONFIDENCE
=========================================================*/

StaffEntities.calculateExtractionConfidence = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result ||

        typeof result !== "object"

    ) {

        return result;

    }

    if (

        !result.stats

    ) {

        result.stats = {};

    }

    const C =

        StaffConstants.CONFIDENCE;

    let score = 0;

    /*----------------------------------
      Staff Match
    ----------------------------------*/

    if (

        result.stats.uniqueStaff > 0

    ) {

        score +=

            C.STAFF_NAME;

    }

    /*----------------------------------
      Phone Match
    ----------------------------------*/

    if (

        result.stats.phoneMatches > 0

    ) {

        score +=

            C.PHONE;

    }

    /*----------------------------------
      Role Match
    ----------------------------------*/

    if (

        result.stats.roleMatches > 0

    ) {

        score +=

            C.ROLE;

    }

    /*----------------------------------
      Posting Match
    ----------------------------------*/

    if (

        result.stats.postingMatches > 0

    ) {

        score +=

            C.BEAT;

    }

    /*----------------------------------
      Team Match
    ----------------------------------*/

    if (

        result.stats.teamMatches > 0

    ) {

        score +=

            C.TEAM;

    }

    /*----------------------------------
      Duty Match
    ----------------------------------*/

    if (

        result.stats.dutyMatches > 0

    ) {

        score +=

            C.MULTIPLE_ENTITIES;

    }

    /*----------------------------------
      GPS Match
    ----------------------------------*/

    if (

        result.stats.gpsMatches > 0

    ) {

        score +=

            C.MULTIPLE_ENTITIES;

    }

    /*----------------------------------
      Keyword Bonus
    ----------------------------------*/

    const keywordCount =

        result.stats.keywordMatches ||

        0;

    if (

        keywordCount > 0

    ) {

        score +=

            C.PRIMARY_KEYWORD;

    }

    if (

        keywordCount > 1

    ) {

        score +=

            C.SECONDARY_KEYWORD;

    }

    if (

        keywordCount > 2

    ) {

        score +=

            C.EXTRA_KEYWORD;

    }

    /*----------------------------------
      Multi Entity Bonus
    ----------------------------------*/

    if (

        result.stats.totalEntities > 2

    ) {

        score +=

            C.MULTIPLE_ENTITIES;

    }

    /*----------------------------------
      Clamp
    ----------------------------------*/

    score =

        Math.max(

            0,

            Math.min(

                1,

                score

            )

        );

    /*----------------------------------
      Save
    ----------------------------------*/

    result.confidence =

        Number(

            score.toFixed(

                3

            )

        );

    result.metadata.confidence =

        result.confidence;

    return result;

};
 /*=========================================================
 FINALIZE EXTRACTION
=========================================================*/

StaffEntities.finalizeExtraction = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result ||

        typeof result !== "object"

    ) {

        return result;

    }

    /*----------------------------------
      Ensure Objects
    ----------------------------------*/

    result.entities =
        result.entities || {};

    result.parameters =
        result.parameters || {};

    result.metadata =
        result.metadata || {};

    result.stats =
        result.stats || {};

    result.keywords =
        result.keywords || [];

    /*----------------------------------
      Primary Staff
    ----------------------------------*/

    if (

        Array.isArray(

            result.entities.staff

        ) &&

        result.entities.staff.length > 0

    ) {

        result.parameters.staff =

            result.entities.staff[0];

    }

    /*----------------------------------
      Counts
    ----------------------------------*/

    result.metadata.staffCount =

        result.entities.staff
            ? result.entities.staff.length
            : 0;

    result.metadata.phoneCount =

        result.entities.phones
            ? result.entities.phones.length
            : 0;

    result.metadata.roleCount =

        result.entities.roles
            ? result.entities.roles.length
            : 0;

    result.metadata.postingCount =

        result.entities.posting
            ? result.entities.posting.length
            : 0;

    result.metadata.teamCount =

        result.entities.team
            ? result.entities.team.length
            : 0;

    result.metadata.dutyCount =

        result.entities.duty
            ? result.entities.duty.length
            : 0;

    result.metadata.gpsCount =

        result.entities.gps
            ? result.entities.gps.length
            : 0;

    result.metadata.keywordCount =

        result.keywords.length;

    /*----------------------------------
      Total Matches
    ----------------------------------*/

    result.metadata.totalMatches =

        result.metadata.staffCount +

        result.metadata.phoneCount +

        result.metadata.roleCount +

        result.metadata.postingCount +

        result.metadata.teamCount +

        result.metadata.dutyCount +

        result.metadata.gpsCount;

    /*----------------------------------
      Success
    ----------------------------------*/

    result.success =

        result.metadata.totalMatches > 0 ||

        result.metadata.keywordCount > 0;

    /*----------------------------------
      Source
    ----------------------------------*/

    result.source =

        "LOCAL";

    /*----------------------------------
      Engine
    ----------------------------------*/

    result.metadata.engine =

        "StaffEntities";

    result.metadata.version =

        StaffEntities.VERSION;

    result.metadata.finishedAt =

        Date.now();

    /*----------------------------------
      Freeze
    ----------------------------------*/

    Object.freeze(

        result.entities

    );

    Object.freeze(

        result.parameters

    );

    Object.freeze(

        result.stats

    );

    Object.freeze(

        result.metadata

    );

    return result;

};
 /*=========================================================
 EXTRACT
=========================================================*/

/*=========================================================
 EXTRACT
=========================================================*/

StaffEntities.extract = function (

    query

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        typeof query !== "string"

    ) {

        query = "";

    }

    query =

        query.trim();

    /*----------------------------------
      Cache
    ----------------------------------*/

    if (

        StaffEntities.cache.search.has(

            query

        )

    ) {

        return StaffEntities.cache.search.get(

            query

        );

    }

    /*----------------------------------
      Create Result
    ----------------------------------*/

    let result =

        StaffEntities.createExtractionResult(

            query

        );

    /*----------------------------------
      Build Search Query
    ----------------------------------*/

    result.searchQuery =

        StaffEntities.cleanSearchQuery(

            result.normalizedQuery

        );

    /*----------------------------------
      Extract Staff
    ----------------------------------*/

    result =

        StaffEntities.extractStaffEntities(

            result

        );

    /*----------------------------------
      Extract Phones
    ----------------------------------*/

    result =

        StaffEntities.extractPhoneEntities(

            result

        );

    /*----------------------------------
      Extract Roles
    ----------------------------------*/

    result =

        StaffEntities.extractRoleEntities(

            result

        );

 /*----------------------------------
  Extract Designations
----------------------------------*/

result =
    StaffEntities.extractDesignationEntities(
        result
    );
    /*----------------------------------
      Extract Posting
    ----------------------------------*/

    result =

        StaffEntities.extractPostingEntities(

            result

        );

    /*----------------------------------
      Extract Posting Parameters
    ----------------------------------*/

   

    /*----------------------------------
      Extract Team
    ----------------------------------*/

    result =

        StaffEntities.extractTeamEntities(

            result

        );

    /*----------------------------------
      Extract Duty
    ----------------------------------*/

    result =

        StaffEntities.extractDutyEntities(

            result

        );

    /*----------------------------------
      Extract GPS
    ----------------------------------*/

    result =

        StaffEntities.extractGPSEntities(

            result

        );

    /*----------------------------------
      Extract Keywords
    ----------------------------------*/

    result =

        StaffEntities.extractKeywords(

            result

        );

    /*----------------------------------
      Calculate Confidence
    ----------------------------------*/

    result =

        StaffEntities.calculateExtractionConfidence(

            result

        );

    /*----------------------------------
      Finalize
    ----------------------------------*/

    result =

        StaffEntities.finalizeExtraction(

            result

        );

    /*----------------------------------
      Cache
    ----------------------------------*/

    StaffEntities.cache.search.set(

        query,

        result

    );

    /*----------------------------------
      Return
    ----------------------------------*/

    return result;

};
 /*=========================================================
 CLEAN SEARCH QUERY
=========================================================*/
/*=========================================================
 CLEAN SEARCH QUERY
=========================================================*/

/*=========================================================
 CLEAN SEARCH QUERY
=========================================================*/

/*=========================================================
 CLEAN SEARCH QUERY
=========================================================*/

StaffEntities.cleanSearchQuery = function (

    query

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        typeof query !== "string"

    ) {

        return "";

    }

    /*----------------------------------
      Normalize
    ----------------------------------*/

    let search =

        query
            .trim()
            .toUpperCase();

    /*----------------------------------
      Remove Language Noise
    ----------------------------------*/

    const removeWords = [

        /*----------------------------------
          General
        ----------------------------------*/

        "SHOW",
        "VIEW",
        "OPEN",
        "DISPLAY",
        "GET",
        "FIND",
        "SEARCH",
        "LOOKUP",
        "LIST",
        "GIVE",
        "TELL",
        "RETURN",

        /*----------------------------------
          Questions
        ----------------------------------*/

        "WHO",
        "WHAT",
        "WHERE",
        "WHEN",
        "WHICH",
        "HOW",
        "WHY",

        /*----------------------------------
          Grammar
        ----------------------------------*/

        "IS",
        "ARE",
        "WAS",
        "WERE",
        "AM",
        "BE",
        "BEEN",
        "BEING",
        "OF",
        "THE",
        "A",
        "AN",
        "TO",
        "FOR",
        "IN",
        "AT",
        "ON",
        "FROM",
        "WITH",
        "BY",
        "UNDER",

        /*----------------------------------
          Generic Staff
        ----------------------------------*/

        "STAFF",
        "OFFICER",
        "EMPLOYEE",
        "PERSON",
        "MEMBER",

        /*----------------------------------
          Profile
        ----------------------------------*/

        "PROFILE",
        "DETAIL",
        "DETAILS",
        "INFORMATION",
        "INFO",
        "ABOUT",
        "IDENTITY",

        /*----------------------------------
          Contact
        ----------------------------------*/

        "PHONE",
        "NUMBER",
        "MOBILE",
        "CONTACT",
        "EMAIL",
        "CELL",
        "CALL",

        /*----------------------------------
          Identity
        ----------------------------------*/

        "ROLE",
        "DESIGNATION",
        "TYPE",
        "RANK",
        "POST",

        /*----------------------------------
          Posting
        ----------------------------------*/

        "POSTING",
        "POSTED",
        "POSTED TO",
        "WORKING",
        "WORKING AT",
        "CIRCLE",
        "DIVISION",
        "RANGE",
        "BEAT",

        /*----------------------------------
          Assignment
        ----------------------------------*/

        "ASSIGNED",
        "ASSIGNMENT",
        "DEPLOYED",
        "DEPLOYMENT",
        "AREA",
        "PLACE",
        "COMPARTMENT",

        /*----------------------------------
          Duty
        ----------------------------------*/

        "DUTY",
        "STATUS",
        "ACTIVE",
        "INACTIVE",
        "PATROL",
        "PATROLLING",
        "START",
        "STARTED",
        "END",
        "ENDED",

        /*----------------------------------
          Team
        ----------------------------------*/

        "TEAM",
        "LEADER",

        /*----------------------------------
          GPS
        ----------------------------------*/

        "GPS",
        "LOCATION",
        "POSITION",
        "LATITUDE",
        "LONGITUDE",
        "COORDINATES",

        /*----------------------------------
          Analytics
        ----------------------------------*/

        "DISTANCE",
        "POINT",
        "POINTS",
        "TRACK",
        "TRACKING",
        "ANALYTICS",
        "STATISTICS",
        "SUMMARY",
        "REPORT",

        /*----------------------------------
          Strength
        ----------------------------------*/

        "COUNT",
        "TOTAL",
        "STRENGTH",
        "MANY"

    ];

    /*----------------------------------
      Remove Noise Words
    ----------------------------------*/

    removeWords.forEach(

        function (

            word

        ) {

            search =

                search.replace(

                    new RegExp(

                        "\\b" +

                        word +

                        "\\b",

                        "g"

                    ),

                    " "

                );

        }

    );

    /*----------------------------------
      Remove Punctuation
    ----------------------------------*/

    search =

        search.replace(

            /[^A-Z0-9\s]/g,

            " "

        );

    /*----------------------------------
      Cleanup Spaces
    ----------------------------------*/

    search =

        search

            .replace(

                /\s+/g,

                " "

            )

            .trim();

    /*----------------------------------
      Return
    ----------------------------------*/

    return search;

};
 /*=========================================================
 BUILD SEARCH CACHE
=========================================================*/

StaffEntities.buildSearchCache = function () {

    /*----------------------------------
      Validate Staff Collection
    ----------------------------------*/

    if (

        !Array.isArray(

            StaffEntities.staff

        )

    ) {

        throw new Error(

            "Staff collection not available."

        );

    }

    /*----------------------------------
      Cache Reference
    ----------------------------------*/

    const cache =

        StaffEntities.cache.search;

    /*----------------------------------
      Clear Existing Cache
    ----------------------------------*/

    cache.clear();

    /*----------------------------------
      Build Cache
    ----------------------------------*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff ||

                !staff.search ||

                !Array.isArray(

                    staff.search.tokens

                )

            ) {

                return;

            }

            staff.search.tokens.forEach(

                function (

                    token

                ) {

                    if (

                        token === null ||

                        token === undefined

                    ) {

                        return;

                    }

                    const key =

                        String(

                            token

                        )

                        .trim()

                        .toUpperCase();

                    if (

                        key.length === 0

                    ) {

                        return;

                    }

                    if (

                        !cache.has(

                            key

                        )

                    ) {

                        cache.set(

                            key,

                            []

                        );

                    }

                    cache

                        .get(

                            key

                        )

                        .push(

                            staff

                        );

                }

            );

        }

    );

    /*----------------------------------
      Summary
    ----------------------------------*/

    console.group(

        "🧠 Staff Search Cache"

    );

    console.log(

        "Tokens:",

        cache.size

    );

    console.groupEnd();

    /*----------------------------------
      Return
    ----------------------------------*/

    return cache;

};
 /*=========================================================
 BUILD ENTITY CACHE
=========================================================*/

StaffEntities.buildEntityCache = function () {

    /*----------------------------------
      Validate Staff Collection
    ----------------------------------*/

    if (

        !Array.isArray(

            StaffEntities.staff

        )

    ) {

        throw new Error(

            "Staff collection not available."

        );

    }

    /*----------------------------------
      Cache Reference
    ----------------------------------*/

    const cache =

        StaffEntities.cache.entities;

    /*----------------------------------
      Clear Existing Cache
    ----------------------------------*/

    cache.clear();

    /*----------------------------------
      Helper
    ----------------------------------*/

    function add(

        key,

        staff

    ) {

        if (

            key === null ||

            key === undefined

        ) {

            return;

        }

        const value =

            String(

                key

            )

            .trim()

            .toUpperCase();

        if (

            value.length === 0

        ) {

            return;

        }

        if (

            !cache.has(

                value

            )

        ) {

            cache.set(

                value,

                staff

            );

        }

    }

    /*----------------------------------
      Build Cache
    ----------------------------------*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff

            ) {

                return;

            }

            /*==============================
              Document
            ==============================*/

            add(

                staff.id,

                staff

            );

            if (

                staff.documentInfo

            ) {

                add(

                    staff.documentInfo.id,

                    staff

                );

            }

            /*==============================
              Identity
            ==============================*/

            if (

                staff.identity

            ) {

                add(

                    staff.identity.cleanName,

                    staff

                );

                add(

                    staff.identity.name,

                    staff

                );

                add(

                    staff.identity.rawName,

                    staff

                );

                add(

                    staff.identity.phone,

                    staff

                );

                add(

                    staff.identity.email,

                    staff

                );

            }

            /*==============================
              Tracking
            ==============================*/

            if (

                staff.tracking

            ) {

                add(

                    staff.tracking.sessionId,

                    staff

                );

            }

        }

    );

    /*----------------------------------
      Summary
    ----------------------------------*/

    console.group(

        "🧠 Staff Entity Cache"

    );

    console.log(

        "Entities:",

        cache.size

    );

    console.groupEnd();

    /*----------------------------------
      Return
    ----------------------------------*/

    return cache;

};
/*=========================================================
 PUBLIC API
=========================================================*/

/*=========================================================
 BUILD STAFF INDEX
=========================================================*/

StaffEntities.buildIndex = async function () {

    /*----------------------------------
      Prevent Duplicate Build
    ----------------------------------*/

    if (

        StaffEntities.loading

    ) {

        return StaffEntities.waitUntilLoaded();

    }

    /*----------------------------------
      Start
    ----------------------------------*/

    StaffEntities.startLoading();

    console.group(

        "🧠 Building Staff Index"

    );

    try {

        /*----------------------------------
          Reset
        ----------------------------------*/

        StaffEntities.clear();

        /*----------------------------------
          Load Staff Profiles
        ----------------------------------*/

        const staff =

            await StaffEntities.loadStaffProfiles();

        /*----------------------------------
          Store Staff
        ----------------------------------*/

        StaffEntities.staff =

            Array.isArray(

                staff

            )

                ? staff

                : [];

        /*----------------------------------
          Build Lookup Maps
        ----------------------------------*/

        StaffEntities.buildIndexMaps();

        /*----------------------------------
          Build Search Cache
        ----------------------------------*/

        StaffEntities.buildSearchCache();

        /*----------------------------------
          Build Entity Cache
        ----------------------------------*/

        StaffEntities.buildEntityCache();

        /*----------------------------------
          Mark Build Complete
        ----------------------------------*/

        StaffEntities.markBuilt();

        StaffEntities.finishLoading();

        /*----------------------------------
          Summary
        ----------------------------------*/

        console.log(

            "Staff:",

            StaffEntities.staff.length

        );

        console.log(

            "Clean Names:",

            StaffEntities.index.byCleanName.size

        );

        console.log(

            "Phones:",

            StaffEntities.index.byPhone.size

        );

        console.log(

            "Roles:",

            StaffEntities.index.byRole.size

        );

        console.log(

            "Search Tokens:",

            StaffEntities.cache.search.size

        );

        console.log(

            "Entity Cache:",

            StaffEntities.cache.entities.size

        );

        console.log(

            "✅ Staff Index Ready"

        );

        console.groupEnd();

        /*----------------------------------
          Return
        ----------------------------------*/

        return StaffEntities.staff;

    }

    catch (

        error

    ) {

        /*----------------------------------
          Fail
        ----------------------------------*/

        StaffEntities.failLoading();

        console.groupEnd();

        console.error(

            "[StaffEntities] Index build failed.",

            error

        );

        throw error;

    }

};

/*=========================================================
EXTRACT
Master Staff Extraction Engine
=========================================================*/
/*=========================================================
 EXTRACT NAMES
=========================================================*/

StaffEntities.extractNames = function (

    query

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        typeof query !== "string"

    ) {

        return [];

    }

    /*----------------------------------
      Normalize Query
    ----------------------------------*/

    const search =

        query

            .trim()

            .toUpperCase();

    if (

        search.length === 0

    ) {

        return [];

    }

    /*----------------------------------
      Local References
    ----------------------------------*/

    const {

        byCleanName,

        byName

    } =

        StaffEntities.index;

    /*----------------------------------
      Result Collection
    ----------------------------------*/

    const results =

        new Map();

    /*----------------------------------
      Helper
    ----------------------------------*/

    function addList(

        list

    ) {

        if (

            !Array.isArray(

                list

            )

        ) {

            return;

        }

        list.forEach(

            function (

                staff

            ) {

                if (

                    !staff

                ) {

                    return;

                }

                results.set(

                    staff.id,

                    staff

                );

            }

        );

    }

    /*----------------------------------
      Exact Match
    ----------------------------------*/

    addList(

        byCleanName.get(

            search

        )

    );

    addList(

        byName.get(

            search

        )

    );

    /*----------------------------------
      Partial Match
    ----------------------------------*/

    byCleanName.forEach(

        function (

            value,

            key

        ) {

            if (

                key.includes(

                    search

                )

            ) {

                addList(

                    value

                );

            }

        }

    );

    byName.forEach(

        function (

            value,

            key

        ) {

            if (

                key.includes(

                    search

                )

            ) {

                addList(

                    value

                );

            }

        }

    );

    /*----------------------------------
      Return
    ----------------------------------*/

    return Array.from(

        results.values()

    );

};
/*=========================================================
 EXTRACT PHONES
=========================================================*/

StaffEntities.extractPhones = function (

    query

) {

    /*----------------------------------
      Validate Query
    ----------------------------------*/

    if (

        typeof query !== "string"

    ) {

        return [];

    }

    /*----------------------------------
      Normalize
    ----------------------------------*/

    const search =

        query

            .replace(

                /\D/g,

                ""

            )

            .trim();

    if (

        search.length === 0

    ) {

        return [];

    }

    /*----------------------------------
      Index
    ----------------------------------*/

    const phoneIndex =

        StaffEntities.index.byPhone;

    /*----------------------------------
      Result Collection
    ----------------------------------*/

    const results =

        new Map();

    /*----------------------------------
      Helper
    ----------------------------------*/

    function addList(

        list

    ) {

        if (

            !Array.isArray(

                list

            )

        ) {

            return;

        }

        list.forEach(

            function (

                staff

            ) {

                if (

                    !staff

                ) {

                    return;

                }

                results.set(

                    staff.id,

                    staff

                );

            }

        );

    }

    /*----------------------------------
      Exact Match
    ----------------------------------*/

    addList(

        phoneIndex.get(

            search

        )

    );

    /*----------------------------------
      Partial Match
    ----------------------------------*/

    phoneIndex.forEach(

        function (

            value,

            key

        ) {

            if (

                key.includes(

                    search

                )

            ) {

                addList(

                    value

                );

            }

        }

    );

    /*----------------------------------
      Return
    ----------------------------------*/

    return Array.from(

        results.values()

    );

};
/*=========================================================
 EXTRACT ROLES
=========================================================*/

StaffEntities.extractRoles = function (

    query

) {

    /*----------------------------------
      Validate Query
    ----------------------------------*/

    if (

        typeof query !== "string"

    ) {

        return [];

    }

    /*----------------------------------
      Normalize
    ----------------------------------*/

    const search =

        query

            .trim()

            .toUpperCase();

    if (

        search.length === 0

    ) {

        return [];

    }

    /*----------------------------------
      Role Index
    ----------------------------------*/

    const roleIndex =

        StaffEntities.index.byRole;

    /*----------------------------------
      Results
    ----------------------------------*/

    const results =

        new Map();

    /*----------------------------------
      Helper
    ----------------------------------*/

    function addList(

        list

    ) {

        if (

            !Array.isArray(

                list

            )

        ) {

            return;

        }

        list.forEach(

            function (

                staff

            ) {

                if (

                    !staff

                ) {

                    return;

                }

                results.set(

                    staff.id,

                    staff

                );

            }

        );

    }

    /*----------------------------------
      Exact Match
    ----------------------------------*/

    addList(

        roleIndex.get(

            search

        )

    );

    /*----------------------------------
      Partial Match
    ----------------------------------*/

    roleIndex.forEach(

        function (

            value,

            key

        ) {

            if (

                key.includes(

                    search

                )

            ) {

                addList(

                    value

                );

            }

        }

    );

    /*----------------------------------
      Synonym Match
    ----------------------------------*/

    if (

        StaffConstants.SYNONYMS &&

        StaffConstants.SYNONYMS.ROLE

    ) {

        StaffConstants.SYNONYMS.ROLE.forEach(

            function (

                synonym

            ) {

                if (

                    synonym.includes(

                        search

                    )

                ) {

                    addList(

                        roleIndex.get(

                            synonym

                        )

                    );

                }

            }

        );

    }

    /*----------------------------------
      Return
    ----------------------------------*/

    return Array.from(

        results.values()

    );

};
/*=========================================================
 EXTRACT DESIGNATIONS
=========================================================*/

StaffEntities.extractDesignations = function (

    query

) {

    /*----------------------------------
      Validate Query
    ----------------------------------*/

    if (

        typeof query !== "string"

    ) {

        return [];

    }

    /*----------------------------------
      Normalize Query
    ----------------------------------*/

    const search =

        query

            .trim()

            .toUpperCase();

    if (

        search.length === 0

    ) {

        return [];

    }

    /*----------------------------------
      Designation Index
    ----------------------------------*/

    const designationIndex =

        StaffEntities.index.byDesignation;

    /*----------------------------------
      Result Collection
    ----------------------------------*/

    const results =

        new Map();

    /*----------------------------------
      Helper
    ----------------------------------*/

    function addList(

        list

    ) {

        if (

            !Array.isArray(

                list

            )

        ) {

            return;

        }

        list.forEach(

            function (

                staff

            ) {

                if (

                    !staff

                ) {

                    return;

                }

                results.set(

                    staff.id,

                    staff

                );

            }

        );

    }

    /*----------------------------------
      Exact Match
    ----------------------------------*/

    addList(

        designationIndex.get(

            search

        )

    );

    /*----------------------------------
      Partial Match
    ----------------------------------*/

    designationIndex.forEach(

        function (

            value,

            key

        ) {

            if (

                key.includes(

                    search

                )

            ) {

                addList(

                    value

                );

            }

        }

    );

    /*----------------------------------
      Designation Alias Match
    ----------------------------------*/

    if (

        StaffConstants.DESIGNATION_ALIASES &&

        typeof StaffConstants.DESIGNATION_ALIASES === "object"

    ) {

        Object.entries(

            StaffConstants.DESIGNATION_ALIASES

        )

        .forEach(

            function (

                [

                    designation,

                    aliases

                ]

            ) {

                if (

                    designation

                        .toUpperCase()

                        .includes(

                            search

                        )

                ) {

                    addList(

                        designationIndex.get(

                            designation

                                .toUpperCase()

                        )

                    );

                }

                if (

                    Array.isArray(

                        aliases

                    )

                ) {

                    aliases.forEach(

                        function (

                            alias

                        ) {

                            if (

                                String(

                                    alias

                                )

                                .toUpperCase()

                                .includes(

                                    search

                                )

                            ) {

                                addList(

                                    designationIndex.get(

                                        designation

                                            .toUpperCase()

                                    )

                                );

                            }

                        }

                    );

                }

            }

        );

    }

    /*----------------------------------
      StaffConstants.DESIGNATIONS Match
    ----------------------------------*/

    if (

        StaffConstants.DESIGNATIONS

    ) {

        Object.values(

            StaffConstants.DESIGNATIONS

        )

        .forEach(

            function (

                designation

            ) {

                const value =

                    String(

                        designation

                    )

                    .toUpperCase();

                if (

                    value.includes(

                        search

                    )

                ) {

                    addList(

                        designationIndex.get(

                            value

                        )

                    );

                }

            }

        );

    }

    /*----------------------------------
      Return
    ----------------------------------*/

    return Array.from(

        results.values()

    );

};

/*=========================================================
 EXTRACT POSTING
=========================================================*/

StaffEntities.extractPosting = function (

    query

) {

    /*----------------------------------
      Validate Query
    ----------------------------------*/

    if (

        typeof query !== "string"

    ) {

        return [];

    }

    /*----------------------------------
      Normalize Query
    ----------------------------------*/

    const search =

        query

            .trim()

            .toUpperCase();

    if (

        search.length === 0

    ) {

        return [];

    }

    /*----------------------------------
      Local References
    ----------------------------------*/

    const {

        byCircle,

        byDivision,

        byRange,

        byBeat,

        byCompartment

    } =

        StaffEntities.index;

    /*----------------------------------
      Result Collection
    ----------------------------------*/

    const results =

        new Map();

    /*----------------------------------
      Helper
    ----------------------------------*/

    function addList(

        list

    ) {

        if (

            !Array.isArray(

                list

            )

        ) {

            return;

        }

        list.forEach(

            function (

                staff

            ) {

                if (

                    !staff

                ) {

                    return;

                }

                results.set(

                    staff.id,

                    staff

                );

            }

        );

    }

    /*=====================================================
      Circle
    =====================================================*/

    addList(

        byCircle.get(

            search

        )

    );

    byCircle.forEach(

        function (

            value,

            key

        ) {

            if (

                key.includes(

                    search

                )

            ) {

                addList(

                    value

                );

            }

        }

    );

    /*=====================================================
      Division
    =====================================================*/

    addList(

        byDivision.get(

            search

        )

    );

    byDivision.forEach(

        function (

            value,

            key

        ) {

            if (

                key.includes(

                    search

                )

            ) {

                addList(

                    value

                );

            }

        }

    );

    /*=====================================================
      Range
    =====================================================*/

    addList(

        byRange.get(

            search

        )

    );

    byRange.forEach(

        function (

            value,

            key

        ) {

            if (

                key.includes(

                    search

                )

            ) {

                addList(

                    value

                );

            }

        }

    );

    /*=====================================================
      Beat
    =====================================================*/

    addList(

        byBeat.get(

            search

        )

    );

    byBeat.forEach(

        function (

            value,

            key

        ) {

            if (

                key.includes(

                    search

                )

            ) {

                addList(

                    value

                );

            }

        }

    );

    /*=====================================================
      Compartment
    =====================================================*/

    addList(

        byCompartment.get(

            search

        )

    );

    byCompartment.forEach(

        function (

            value,

            key

        ) {

            if (

                key.includes(

                    search

                )

            ) {

                addList(

                    value

                );

            }

        }

    );

    /*----------------------------------
      Return
    ----------------------------------*/

    return Array.from(

        results.values()

    );

};

/*=========================================================
 EXTRACT TEAM
=========================================================*/

StaffEntities.extractTeam = function (

    query

) {

    /*----------------------------------
      Validate Query
    ----------------------------------*/

    if (

        typeof query !== "string"

    ) {

        return [];

    }

    /*----------------------------------
      Normalize Query
    ----------------------------------*/

    const search =

        query

            .trim()

            .toUpperCase();

    if (

        search.length === 0

    ) {

        return [];

    }

    /*----------------------------------
      Local References
    ----------------------------------*/

    const {

        byLeader,

        byTeam

    } =

        StaffEntities.index;

    /*----------------------------------
      Result Collection
    ----------------------------------*/

    const results =

        new Map();

    /*----------------------------------
      Helper
    ----------------------------------*/

    function addList(

        list

    ) {

        if (

            !Array.isArray(

                list

            )

        ) {

            return;

        }

        list.forEach(

            function (

                staff

            ) {

                if (

                    !staff

                ) {

                    return;

                }

                results.set(

                    staff.id,

                    staff

                );

            }

        );

    }

    /*=====================================================
      Leader
    =====================================================*/

    addList(

        byLeader.get(

            search

        )

    );

    byLeader.forEach(

        function (

            value,

            key

        ) {

            if (

                key.includes(

                    search

                )

            ) {

                addList(

                    value

                );

            }

        }

    );

    /*=====================================================
      Team
    =====================================================*/

    addList(

        byTeam.get(

            search

        )

    );

    byTeam.forEach(

        function (

            value,

            key

        ) {

            if (

                key.includes(

                    search

                )

            ) {

                addList(

                    value

                );

            }

        }

    );

    /*=====================================================
      Team Member Search
    =====================================================*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff ||

                !staff.assignment ||

                !staff.assignment.team

            ) {

                return;

            }

            const members =

                String(

                    staff.assignment.team

                )

                .toUpperCase();

            if (

                members.includes(

                    search

                )

            ) {

                results.set(

                    staff.id,

                    staff

                );

            }

        }

    );

    /*----------------------------------
      Return
    ----------------------------------*/

    return Array.from(

        results.values()

    );

};

/*=========================================================
 EXTRACT DUTY
=========================================================*/

StaffEntities.extractDuty = function (

    query

) {

    /*----------------------------------
      Validate Query
    ----------------------------------*/

    if (

        typeof query !== "string"

    ) {

        return [];

    }

    /*----------------------------------
      Normalize Query
    ----------------------------------*/

    const search =

        query

            .trim()

            .toUpperCase();

    if (

        search.length === 0

    ) {

        return [];

    }

    /*----------------------------------
      Result Collection
    ----------------------------------*/

    const results =

        new Map();

    /*----------------------------------
      Helper
    ----------------------------------*/

    function add(

        staff

    ) {

        if (

            !staff

        ) {

            return;

        }

        results.set(

            staff.id,

            staff

        );

    }

    /*----------------------------------
      Search Staff
    ----------------------------------*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff ||

                !staff.assignment

            ) {

                return;

            }

            const assignment =

                staff.assignment;

            /*==============================
              Duty Type
            ==============================*/

            const dutyType =

                String(

                    assignment.dutyType ||

                    ""

                )

                .toUpperCase();

            /*==============================
              Status
            ==============================*/

            const status =

                String(

                    assignment.status ||

                    ""

                )

                .toUpperCase();

            /*==============================
              Duty Active
            ==============================*/

            const dutyActive =

                Boolean(

                    assignment.dutyActive

                );

            /*==============================
              Exact Duty Type
            ==============================*/

            if (

                dutyType === search

            ) {

                add(

                    staff

                );

            }

            /*==============================
              Partial Duty Type
            ==============================*/

            if (

                dutyType.includes(

                    search

                )

            ) {

                add(

                    staff

                );

            }

            /*==============================
              Status
            ==============================*/

            if (

                status === search

            ) {

                add(

                    staff

                );

            }

            if (

                status.includes(

                    search

                )

            ) {

                add(

                    staff

                );

            }

            /*==============================
              Active Duty
            ==============================*/

            if (

                dutyActive &&

                (

                    search === "ACTIVE" ||

                    search === "ON DUTY" ||

                    search === "DUTY ACTIVE" ||

                    search === "PATROLLING"

                )

            ) {

                add(

                    staff

                );

            }

            /*==============================
              Inactive Duty
            ==============================*/

            if (

                !dutyActive &&

                (

                    search === "INACTIVE" ||

                    search === "OFF DUTY" ||

                    search === "DUTY ENDED"

                )

            ) {

                add(

                    staff

                );

            }

        }

    );

    /*----------------------------------
      Duty Type Synonyms
    ----------------------------------*/

    if (

        StaffConstants.DUTY_TYPES

    ) {

        Object.values(

            StaffConstants.DUTY_TYPES

        )

        .forEach(

            function (

                duty

            ) {

                const value =

                    String(

                        duty

                    )

                    .toUpperCase();

                if (

                    value.includes(

                        search

                    )

                    ||

                    search.includes(

                        value

                    )

                ) {

                    StaffEntities.staff.forEach(

                        function (

                            staff

                        ) {

                            if (

                                !staff ||

                                !staff.assignment

                            ) {

                                return;

                            }

                            if (

                                String(

                                    staff.assignment.dutyType ||

                                    ""

                                )

                                .toUpperCase() === value

                            ) {

                                add(

                                    staff

                                );

                            }

                        }

                    );

                }

            }

        );

    }

    /*----------------------------------
      Return
    ----------------------------------*/

    return Array.from(

        results.values()

    );

};
/*=========================================================
 EXTRACT GPS
=========================================================*/

StaffEntities.extractGPS = function (

    query

) {

    /*----------------------------------
      Validate Query
    ----------------------------------*/

    if (

        typeof query !== "string"

    ) {

        return [];

    }

    /*----------------------------------
      Normalize Query
    ----------------------------------*/

    const search =

        query

            .trim()

            .toUpperCase();

    if (

        search.length === 0

    ) {

        return [];

    }

    /*----------------------------------
      Results
    ----------------------------------*/

    const results =

        new Map();

    /*----------------------------------
      Helper
    ----------------------------------*/

    function add(

        staff

    ) {

        if (

            !staff

        ) {

            return;

        }

        results.set(

            staff.id,

            staff

        );

    }

    /*----------------------------------
      Search All Staff
    ----------------------------------*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff

            ) {

                return;

            }

            const gps =

                staff.gps ||

                {};

            const location =

                staff.location ||

                {};

            const tracking =

                staff.tracking ||

                {};

            /*==============================
              Latitude
            ==============================*/

            if (

                location.lat !== null &&

                String(

                    location.lat

                )

                .toUpperCase()

                .includes(

                    search

                )

            ) {

                add(

                    staff

                );

            }

            /*==============================
              Longitude
            ==============================*/

            if (

                location.lon !== null &&

                String(

                    location.lon

                )

                .toUpperCase()

                .includes(

                    search

                )

            ) {

                add(

                    staff

                );

            }

            /*==============================
              Location String
            ==============================*/

            if (

                location.location &&

                String(

                    location.location

                )

                .toUpperCase()

                .includes(

                    search

                )

            ) {

                add(

                    staff

                );

            }

            /*==============================
              Accuracy
            ==============================*/

            if (

                gps.accuracy !== null &&

                String(

                    gps.accuracy

                )

                .includes(

                    search

                )

            ) {

                add(

                    staff

                );

            }

            /*==============================
              Speed
            ==============================*/

            if (

                gps.speed !== null &&

                String(

                    gps.speed

                )

                .includes(

                    search

                )

            ) {

                add(

                    staff

                );

            }

            /*==============================
              Heading
            ==============================*/

            if (

                gps.heading !== null &&

                String(

                    gps.heading

                )

                .includes(

                    search

                )

            ) {

                add(

                    staff

                );

            }

            /*==============================
              GPS Source
            ==============================*/

            if (

                tracking.source &&

                String(

                    tracking.source

                )

                .toUpperCase()

                .includes(

                    search

                )

            ) {

                add(

                    staff

                );

            }

            /*==============================
              Session ID
            ==============================*/

            if (

                tracking.sessionId &&

                String(

                    tracking.sessionId

                )

                .toUpperCase()

                .includes(

                    search

                )

            ) {

                add(

                    staff

                );

            }

            /*==============================
              GPS Status
            ==============================*/

            if (

                search === "GPS"

            ) {

                if (

                    location.lat !== null &&

                    location.lon !== null

                ) {

                    add(

                        staff

                    );

                }

            }

            if (

                search === "GPS ACTIVE"

            ) {

                if (

                    location.lat !== null &&

                    location.lon !== null

                ) {

                    add(

                        staff

                    );

                }

            }

            if (

                search === "GPS INACTIVE"

            ) {

                if (

                    location.lat === null ||

                    location.lon === null

                ) {

                    add(

                        staff

                    );

                }

            }

            /*==============================
              Moving
            ==============================*/

            if (

                search === "MOVING"

            ) {

                if (

                    Number(

                        gps.speed ||

                        0

                    ) > 0

                ) {

                    add(

                        staff

                    );

                }

            }

            /*==============================
              Stationary
            ==============================*/

            if (

                search === "STATIONARY"

            ) {

                if (

                    Number(

                        gps.speed ||

                        0

                    ) <= 0

                ) {

                    add(

                        staff

                    );

                }

            }

        }

    );

    /*----------------------------------
      Return
    ----------------------------------*/

    return Array.from(

        results.values()

    );

};

/*=========================================================
 AUTO INITIALIZE
=========================================================*/


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
