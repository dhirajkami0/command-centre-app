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

    entities :

        new Map(),

    aliases :

        new Map(),

    search :

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

StaffEntities.cache.aliases.clear();

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

        typeof context !==

        "object"

    ) {

        return target;

    }

    if (

        !target ||

        typeof target !==

        "object"

    ) {

        return target;

    }

    if (

        !Array.isArray(

            mappings

        ) ||

        mappings.length ===

        0

    ) {

        return target;

    }

    /*----------------------------------
      Extract Fields
    ----------------------------------*/

    mappings.forEach(

        function (

            field

        ) {

            if (

                !field ||

                !field.source ||

                !field.target

            ) {

                return;

            }

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
              Ignore Undefined
            ----------------------------------*/

            if (

                value ===

                undefined

            ) {

                return;

            }

            /*----------------------------------
              Copy Value
            ----------------------------------*/

            StaffEntities.setField(

                target,

                field.target,

                value

            );

        }

    );

    return target;

};
StaffEntities.extractDesignationEntities = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result ||

        typeof result !==

        "object"

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

        !query

    ) {

        return result;

    }

    const matches =

        [];

    const seen =

        new Set();

    /*----------------------------------
      Whole Word Match
    ----------------------------------*/

    function hasWord(

        text,

        word

    ) {

        word =

            String(

                word ||

                ""

            )

            .trim()

            .toUpperCase();

        if (

            !word ||

            word.length < 2

        ) {

            return false;

        }

        const escaped =

            word.replace(

                /[-\/\\^$*+?.()|[\]{}]/g,

                "\\$&"

            );

        return new RegExp(

            "(^|\\W)" +

            escaped +

            "(\\W|$)"

        ).test(

            text

        );

    }

    /*----------------------------------
      Add Match
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

                staff.id ||

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
      Search Designations
    ----------------------------------*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff ||

                !staff.search

            ) {

                return;

            }

            const designationTokens =

                Array.isArray(

                    staff.search.designation

                )

                    ? staff.search.designation

                    : [];

            if (

                designationTokens.length === 0

            ) {

                return;

            }

            let matched =

                false;

            designationTokens.forEach(

                function (

                    designation

                ) {

                    if (

                        matched

                    ) {

                        return;

                    }

                    designation =

                        String(

                            designation ||

                            ""

                        )

                        .trim()

                        .toUpperCase();

                    if (

                        !designation

                    ) {

                        return;

                    }

                    /*----------------------------------
                      Exact Match
                    ----------------------------------*/

                    if (

                        hasWord(

                            query,

                            designation

                        )

                    ) {
console.log(

    "Matched Designation:",

    designation,

    staff.identity.designation,

    staff.identity.cleanName

);
                        matched =

                            true;

                        addDesignation(

                            staff

                        );

                        return;

                    }

                    /*----------------------------------
                      Synonyms
                    ----------------------------------*/

                    const synonyms =

                        StaffConstants

                            ?.SYNONYMS?.[

                                designation

                            ];

                    if (

                        Array.isArray(

                            synonyms

                        )

                    ) {

                        const found =

                            synonyms.some(

                                function (

                                    synonym

                                ) {

                                    return hasWord(

                                        query,

                                        synonym

                                    );

                                }

                            );

                        if (

                            found

                        ) {

                            matched =

                                true;

                            addDesignation(

                                staff

                            );

                        }

                    }

                }

            );

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
  Create Token Stores
----------------------------------*/

const identityTokens =

    new Set();

const phoneTokens =

    new Set();

const designationTokens =

    new Set();

const roleTokens =

    new Set();

const postingTokens =

    new Set();

const assignmentTokens =

    new Set();

const teamTokens =

    new Set();

const gpsTokens =

    new Set();

const analyticsTokens =

    new Set();
    /*----------------------------------
      Helper
    ----------------------------------*/


function add(

    store,

    value

) {

    if (

        value === null ||

        value === undefined

    ) {

        return;

    }

    const text =

        String(

            value

        )

        .trim()

        .toUpperCase();

    if (

        !text

    ) {

        return;

    }

    store.add(

        text

    );

}
    /*----------------------------------
      Helper (Split Words)
    ----------------------------------*/

function addWords(

    store,

    value

) {

    if (

        !value

    ) {

        return;

    }

    String(

        value

    )

    .toUpperCase()

    .split(

        /[\s,._()/\\-]+/

    )

    .forEach(

        function (

            word

        ) {

            add(

                store,

                word

            );

        }

    );

}
/*=====================================================
  Identity
=====================================================*/

add(

    identityTokens,

    context.identity.cleanName

);

add(

    identityTokens,

    context.identity.name

);

add(

    identityTokens,

    context.identity.rawName

);

addWords(

    identityTokens,

    context.identity.cleanName

);

addWords(

    identityTokens,

    context.identity.name

);

addWords(

    identityTokens,

    context.identity.rawName

);

/*=====================================================
  Phone
=====================================================*/

add(

    phoneTokens,

    context.identity.phone

);

add(

    phoneTokens,

    context.identity.email

);

/*=====================================================
  Role
=====================================================*/

add(

    roleTokens,

    context.identity.role

);

addWords(

    roleTokens,

    context.identity.role

);

/*=====================================================
  Designation
=====================================================*/

add(

    designationTokens,

    context.identity.designation

);

addWords(

    designationTokens,

    context.identity.designation

);

add(

    designationTokens,

    context.identity.type

);

addWords(

    designationTokens,

    context.identity.type

);

/*=====================================================
  Posting
=====================================================*/

add(

    postingTokens,

    context.posting.circle

);

add(

    postingTokens,

    context.posting.division

);

add(

    postingTokens,

    context.posting.range

);

add(

    postingTokens,

    context.posting.beat

);

addWords(

    postingTokens,

    context.posting.circle

);

addWords(

    postingTokens,

    context.posting.division

);

addWords(

    postingTokens,

    context.posting.range

);

addWords(

    postingTokens,

    context.posting.beat

);

/*----------------------------------
  Posting Aliases
----------------------------------*/

if (

    context.posting.range

) {

    add(

        postingTokens,

        String(

            context.posting.range

        )

        .replace(

            /\s+/g,

            ""

        )

    );

}

if (

    context.posting.beat

) {

    add(

        postingTokens,

        String(

            context.posting.beat

        )

        .replace(

            /\s+/g,

            ""

        )

    );

}

/*=====================================================
  Assignment
=====================================================*/

add(
    assignmentTokens,
    context.assignment.assignedCompartment
);

add(
    assignmentTokens,
    context.assignment.dutyType
);

add(
    assignmentTokens,
    context.assignment.status
);

add(
    assignmentTokens,
    context.assignment.leader
);

add(
    assignmentTokens,
    context.assignment.team
);

add(
    assignmentTokens,
    context.assignment.lastDutyStart
);

add(
    assignmentTokens,
    context.assignment.lastDutyEnd
);

addWords(
    assignmentTokens,
    context.assignment.assignedCompartment
);

addWords(
    assignmentTokens,
    context.assignment.dutyType
);

addWords(
    assignmentTokens,
    context.assignment.status
);

addWords(
    assignmentTokens,
    context.assignment.leader
);

addWords(
    assignmentTokens,
    context.assignment.team
);

/*=====================================================
  Team
=====================================================*/

add(

    teamTokens,

    context.teamInfo.leader

);

add(

    teamTokens,

    context.teamInfo.team

);

addWords(

    teamTokens,

    context.teamInfo.leader

);

addWords(

    teamTokens,

    context.teamInfo.team

);


/*=====================================================
  Analytics
=====================================================*/

add(

    analyticsTokens,

    context.analytics.monthKey

);

/*=====================================================
  Boolean Flags
=====================================================*/

if (

    context.assignment.dutyActive

) {

    add(

        assignmentTokens,

        "DUTY_ACTIVE"

    );

}

else {

    add(

        assignmentTokens,

        "DUTY_INACTIVE"

    );

}

/*=====================================================
  GPS
=====================================================*/

add(
    gpsTokens,
    context.location.location
);

addWords(
    gpsTokens,
    context.location.location
);

add(
    gpsTokens,
    context.tracking.sessionId
);

add(
    gpsTokens,
    context.tracking.source
);

add(
    gpsTokens,
    context.tracking.id
);

add(
    gpsTokens,
    context.gps.accuracy
);

add(
    gpsTokens,
    context.gps.speed
);

add(
    gpsTokens,
    context.gps.heading
);

add(
    gpsTokens,
    context.gps.turnRate
);

add(
    gpsTokens,
    context.gps.turnAngle
);

add(
    gpsTokens,
    context.gps.lastSeen
);

add(
    gpsTokens,
    context.gps.timestamp
);

add(
    gpsTokens,
    context.gps.updatedAt
);

add(
    gpsTokens,
    context.location.lat
);

add(
    gpsTokens,
    context.location.lon
);
/*=====================================================
  Search Priority
=====================================================*/

const allTokens =

    Array.from(

        new Set([

            ...identityTokens,

            ...phoneTokens,

            ...designationTokens,

            ...roleTokens,

            ...postingTokens,

            ...assignmentTokens,

            ...teamTokens,

            ...gpsTokens,

            ...analyticsTokens

        ])

    );

context.search = {

    identity:

        Array.from(

            identityTokens

        ),

    phone:

        Array.from(

            phoneTokens

        ),

    designation:

        Array.from(

            designationTokens

        ),

    role:

        Array.from(

            roleTokens

        ),

    posting:

        Array.from(

            postingTokens

        ),

    assignment:

        Array.from(

            assignmentTokens

        ),

    team:

        Array.from(

            teamTokens

        ),

    gps:

        Array.from(

            gpsTokens

        ),

    analytics:

        Array.from(

            analyticsTokens

        ),

    /*----------------------------------
      Backward Compatibility
    ----------------------------------*/

    tokens:

        allTokens,

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

    )

    .filter(

        Boolean

    )

    .sort(

        function (

            a,

            b

        ) {

            return (

                b.length -

                a.length

            ) ||

            a.localeCompare(

                b

            );

        }

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
  Debug Search Tokens
----------------------------------*/

if (

    StaffEntities.DEBUG

) {

    console.group(

        "🧠 Search Tokens"

    );

    console.log(

        context.search

    );

    console.groupEnd();

}
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
  Debug Canonical Staff
----------------------------------*/

if (

    StaffEntities.DEBUG

) {

    console.group(

        "🧠 Canonical Staff"

    );

    console.log(

        context.normalized

    );

    console.groupEnd();

}
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

    ).forEach(

        function (

            key

        ) {

            if (

                indexes[key] instanceof Map

            ) {

                indexes[key].clear();

            }

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

            !(map instanceof Map)

        ) {

            return;

        }

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

        map.get(

            value

        ).push(

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

                !staff ||

                typeof staff !== "object"

            ) {

                return;

            }

            const identity =

                staff.identity ||

                {};

            const posting =

                staff.posting ||

                {};

            const assignment =

                staff.assignment ||

                {};

            /*==============================
              Identity
            ==============================*/

            add(

                indexes.byCleanName,

                identity.cleanName,

                staff

            );

            add(

                indexes.byName,

                identity.name,

                staff

            );

            add(

                indexes.byPhone,

                identity.phone,

                staff

            );

            /*==============================
              Role
            ==============================*/

            add(

                indexes.byRole,

                identity.role,

                staff

            );

            add(

                indexes.byDesignation,

                identity.designation,

                staff

            );

            /*==============================
              Posting
            ==============================*/

            add(

                indexes.byCircle,

                posting.circle,

                staff

            );

            add(

                indexes.byDivision,

                posting.division,

                staff

            );

            add(

                indexes.byRange,

                posting.range,

                staff

            );

            add(

                indexes.byBeat,

                posting.beat,

                staff

            );

            add(

                indexes.byCompartment,

                assignment.assignedCompartment,

                staff

            );

            /*==============================
              Team
            ==============================*/

            add(

                indexes.byLeader,

                assignment.leader,

                staff

            );

            add(

                indexes.byTeam,

                assignment.team,

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

    return indexes;

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

        !query

    ) {

        return result;

    }

    /*----------------------------------
      Query Words
    ----------------------------------*/

    const queryWords =

        new Set(

            query

                .split(

                    /\s+/

                )

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

    const matches =

        [];

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

                !staff.search

            ) {

                return;

            }

            const identityTokens =

                Array.isArray(

                    staff.search.identity

                )

                    ? staff.search.identity

                    : [];

            if (

                identityTokens.length === 0

            ) {

                return;

            }

            let score =

                0;

            identityTokens.forEach(

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

                        score +=

                            1000;

                        return;

                    }
                    /*------------------------------
                      Exact Single Token
                    ------------------------------*/

                    if (

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
                      Multi-word Match
                    ------------------------------*/

                    const tokenWords =

                        token

                            .split(

                                /\s+/

                            )

                            .filter(

                                function (

                                    word

                                ) {

                                    return (

                                        word.length >= 2

                                    );

                                }

                            );

                    let matchedWords =

                        0;

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

                    /*------------------------------
                      All Token Words Matched
                    ------------------------------*/

                    if (

                        matchedWords ===

                        tokenWords.length

                    ) {

                        score +=

                            tokenWords.length *

                            100;

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

            return

                a.staff.identity.cleanName.localeCompare(

                    b.staff.identity.cleanName

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

        String(

            result.normalizedQuery ||

            ""

        )

        .trim()

        .toUpperCase();

    if (

        !query

    ) {

        return result;

    }

    const matches = [];

    const seen =

        new Set();

    /*----------------------------------
      Search Phones
    ----------------------------------*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff ||

                !staff.search ||

                !Array.isArray(

                    staff.search.phone

                )

            ) {

                return;

            }

            const found =

                staff.search.phone.some(

                    function (

                        phone

                    ) {

                        phone =

                            String(

                                phone ||

                                ""

                            )

                            .trim()

                            .toUpperCase();

                        return (

                            phone &&

                            query.includes(

                                phone

                            )

                        );

                    }

                );

            if (

                !found

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

        typeof result !==

        "object"

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

        !query

    ) {

        return result;

    }

    const matches =

        [];

    const seen =

        new Set();

    /*----------------------------------
      Whole Word Match
    ----------------------------------*/

    function hasWord(

        text,

        word

    ) {

        word =

            String(

                word ||

                ""

            )

            .trim()

            .toUpperCase();

        if (

            !word

        ) {

            return false;

        }

        const escaped =

            word.replace(

                /[-\/\\^$*+?.()|[\]{}]/g,

                "\\$&"

            );

        return new RegExp(

            "(^|\\W)" +

            escaped +

            "(\\W|$)"

        ).test(

            text

        );

    }

    /*----------------------------------
      Add Match
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

            String(

                staff.identity.cleanName ||

                staff.id ||

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
      Search Roles
    ----------------------------------*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff ||

                !staff.search

            ) {

                return;

            }

            const roleTokens =

                Array.isArray(

                    staff.search.role

                )

                    ? staff.search.role

                    : [];

            if (

                roleTokens.length === 0

            ) {

                return;

            }

            let matched =

                false;

            roleTokens.forEach(

                function (

                    role

                ) {

                    if (

                        matched

                    ) {

                        return;

                    }

                    role =

                        String(

                            role ||

                            ""

                        )

                        .trim()

                        .toUpperCase();

                    if (

                        !role

                    ) {

                        return;

                    }

                    /*----------------------------------
                      Ignore Generic Roles
                    ----------------------------------*/

                    if (

                        [

                            "STAFF",

                            "PERSONNEL",

                            "EMPLOYEE",

                            "OFFICER",

                            "MEMBER",

                            "FIELD STAFF"

                        ].includes(

                            role

                        )

                    ) {

                        return;

                    }

                    /*----------------------------------
                      Exact Role
                    ----------------------------------*/

                    if (

                        hasWord(

                            query,

                            role

                        )

                    ) {

                        matched =

                            true;

                        addRole(

                            staff

                        );

                        return;

                    }

                    /*----------------------------------
                      Synonyms
                    ----------------------------------*/

                    const synonyms =

                        StaffConstants

                            ?.SYNONYMS?.[

                                role

                            ];

                    if (

                        Array.isArray(

                            synonyms

                        )

                    ) {

                        const found =

                            synonyms.some(

                                function (

                                    synonym

                                ) {

                                    return hasWord(

                                        query,

                                        synonym

                                    );

                                }

                            );

                        if (

                            found

                        ) {

                            matched =

                                true;

                            addRole(

                                staff

                            );

                        }

                    }

                }

            );

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

    const index =

        [];

    const seen =

        new Set();

function normalize(

    value

) {

    return String(

        value ||

        ""

    )

    .replace(

        /([a-z])([A-Z])/g,

        "$1 $2"

    )

    .replace(

        /[-_]/g,

        " "

    )

    .replace(

        /\s+/g,

        " "

    )

    .trim()

    .toUpperCase();

}

    function addAlias(

        type,

        value,

        alias

    ) {

        alias =

            normalize(

                alias

            );

        if (

            !alias

        ) {

            return;

        }

        const key =

            type +

            "|" +

            alias;

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

                alias,

            length:

                alias.length

        });

    }

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

                const upper =

                    normalize(

                        value

                    );

                const spaced =

                    upper

                    .replace(

                        /[-_]/g,

                        " "

                    )

                    .replace(

                        /\s+/g,

                        " "

                    )

                    .trim();

                const compact =

                    spaced

                    .replace(

                        /\s+/g,

                        ""

                    );

                /*----------------------------------
                  Original
                ----------------------------------*/

                addAlias(

                    type,

                    value,

                    upper

                );

                /*----------------------------------
                  Space Normalized
                ----------------------------------*/

                addAlias(

                    type,

                    value,

                    spaced

                );

                /*----------------------------------
                  Compact
                ----------------------------------*/

                addAlias(

                    type,

                    value,

                    compact

                );

                /*----------------------------------
                  Reverse Word Order
                ----------------------------------*/

                const words =

                    spaced.split(

                        " "

                    );

                if (

                    words.length === 2

                ) {

                    const reversed =

                        words[1] +

                        " " +

                        words[0];

                    addAlias(

                        type,

                        value,

                        reversed

                    );

                    addAlias(

                        type,

                        value,

                        reversed.replace(

                            /\s+/g,

                            ""

                        )

                    );

                }

                /*----------------------------------
                  Remove Jurisdiction Suffix
                ----------------------------------*/

                [

                    " CIRCLE",

                    " DIVISION",

                    " RANGE",

                    " BEAT"

                ].forEach(

                    function (

                        suffix

                    ) {

                        if (

                            spaced.endsWith(

                                suffix

                            )

                        ) {

                            const alias =

                                spaced

                                .substring(

                                    0,

                                    spaced.length -

                                    suffix.length

                                )

                                .trim();

                            addAlias(

                                type,

                                value,

                                alias

                            );

                            addAlias(

                                type,

                                value,

                                alias.replace(

                                    /\s+/g,

                                    ""

                                )

                            );

                        }

                    }

                );

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

    /*----------------------------------
      Validate
    ----------------------------------*/

if (

    !result

) {

    return result;

}

result.entities =

    result.entities ||

    {};

result.parameters =

    result.parameters ||

    {};

result.stats =

    result.stats ||

    {

        postingMatches: 0,

        totalEntities: 0

    };

    /*----------------------------------
      Normalize Text
    ----------------------------------*/

    function normalizeText(

        text

    ) {

        return String(

            text ||

            ""

        )

            .toUpperCase()

            .replace(

                /[_-]/g,

                " "

            )

            .replace(

                /\s+/g,

                " "

            )

            .trim();

    }

    const query =

        normalizeText(

            result.normalizedQuery

        );

    const posting =

        [];

    const seen =

        new Set();

    const parameters =

        result.parameters ||

        {};

    const index =

        StaffEntities.buildPostingIndex();

    /*----------------------------------
      Whole Word Match
    ----------------------------------*/

    function hasWord(

        text,

        phrase

    ) {

        phrase =

            normalizeText(

                phrase

            );

        if (

            !phrase

        ) {

            return false;

        }

        const escaped =

            phrase.replace(

                /[-\/\\^$*+?.()|[\]{}]/g,

                "\\$&"

            );

        return new RegExp(

            "(^|\\W)" +

            escaped +

            "(\\W|$)"

        ).test(

            text

        );

    }

    /*----------------------------------
      Search Posting
    ----------------------------------*/

    index.forEach(

        function (

            item

        ) {

            const normalized =

                normalizeText(

                    item.normalized

                );

            if (

                !normalized

            ) {

                return;

            }

            if (

                !hasWord(

                    query,

                    normalized

                )

            ) {

                return;

            }

            console.log(

                "Matched Posting:",

                item.type,

                normalized,

                item.value

            );

            const key =

                item.type +

                "|" +

                item.value;

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

            switch (

                String(

                    item.type ||

                    ""

                )

                .toLowerCase()

            ) {

                case "circle":

                    parameters.circle =

                        item.value;

                    break;

                case "division":

                    parameters.division =

                        item.value;

                    break;

                case "range":

                    parameters.range =

                        item.value;

                    break;

                case "beat":

                    parameters.beat =

                        item.value;

                    break;

            }

        }

    );

    result.parameters =

        parameters;

    result.entities.posting =

        posting;

    result.stats.postingMatches =

        posting.length;

    result.stats.totalEntities +=

        posting.length;

    console.log(

        "Posting Parameters:",

        parameters

    );

    return result;

};
 /*=========================================================
 EXTRACT TEAM ENTITIES
=========================================================*/

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

        String(

            result.normalizedQuery ||

            ""

        )

        .trim()

        .toUpperCase();

    if (

        !query

    ) {

        return result;

    }

    const matches = [];

    const seen =

        new Set();

    /*----------------------------------
      Whole Word Match
    ----------------------------------*/

    function hasWord(

        text,

        word

    ) {

        word =

            String(

                word ||

                ""

            )

            .trim()

            .toUpperCase();

        if (

            !word

        ) {

            return false;

        }

        const escaped =

            word.replace(

                /[-\/\\^$*+?.()|[\]{}]/g,

                "\\$&"

            );

        return new RegExp(

            "(^|\\W)" +

            escaped +

            "(\\W|$)"

        ).test(

            text

        );

    }

    /*----------------------------------
      Add Match
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

            String(

                staff.identity.cleanName ||

                staff.id ||

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
      Search Team Tokens
    ----------------------------------*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff ||

                !staff.search

            ) {

                return;

            }

            const teamTokens =

                Array.isArray(

                    staff.search.team

                )

                    ? staff.search.team

                    : [];

            if (

                teamTokens.length === 0

            ) {

                return;

            }

            let matched =

                false;

            teamTokens.forEach(

                function (

                    token

                ) {

                    if (

                        matched

                    ) {

                        return;

                    }

                    token =

                        String(

                            token ||

                            ""

                        )

                        .trim()

                        .toUpperCase();

                    if (

                        !token

                    ) {

                        return;

                    }

                    if (

                        hasWord(

                            query,

                            token

                        )

                    ) {

                        matched =

                            true;

                        addTeam(

                            staff

                        );

                    }

                }

            );

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

        String(

            result.normalizedQuery ||

            ""

        )

        .trim()

        .toUpperCase();

    if (

        !query

    ) {

        return result;

    }

    const matches = [];

    const seen =

        new Set();

    /*----------------------------------
      Whole Word Match
    ----------------------------------*/

    function hasWord(

        text,

        word

    ) {

        word =

            String(

                word ||

                ""

            )

            .trim()

            .toUpperCase();

        if (

            !word

        ) {

            return false;

        }

        const escaped =

            word.replace(

                /[-\/\\^$*+?.()|[\]{}]/g,

                "\\$&"

            );

        return new RegExp(

            "(^|\\W)" +

            escaped +

            "(\\W|$)"

        ).test(

            text

        );

    }

    /*----------------------------------
      Add Match
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

            String(

                staff.identity.cleanName ||

                staff.id ||

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
      Search Assignment Tokens
    ----------------------------------*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff ||

                !staff.search

            ) {

                return;

            }

            const assignmentTokens =

                Array.isArray(

                    staff.search.assignment

                )

                    ? staff.search.assignment

                    : [];

            if (

                assignmentTokens.length === 0

            ) {

                return;

            }

            let matched =

                false;

            assignmentTokens.forEach(

                function (

                    token

                ) {

                    if (

                        matched

                    ) {

                        return;

                    }

                    token =

                        String(

                            token ||

                            ""

                        )

                        .trim()

                        .toUpperCase();

                    if (

                        !token

                    ) {

                        return;

                    }

                    if (

                        hasWord(

                            query,

                            token

                        )

                    ) {

                        matched =

                            true;

                        addDuty(

                            staff

                        );

                    }

                }

            );

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

        String(

            result.normalizedQuery ||

            ""

        )

        .trim()

        .toUpperCase();

    if (

        !query

    ) {

        return result;

    }

    const matches = [];

    const seen =

        new Set();

    /*----------------------------------
      Whole Word Match
    ----------------------------------*/

    function hasWord(

        text,

        word

    ) {

        word =

            String(

                word ||

                ""

            )

            .trim()

            .toUpperCase();

        if (

            !word

        ) {

            return false;

        }

        const escaped =

            word.replace(

                /[-\/\\^$*+?.()|[\]{}]/g,

                "\\$&"

            );

        return new RegExp(

            "(^|\\W)" +

            escaped +

            "(\\W|$)"

        ).test(

            text

        );

    }

    /*----------------------------------
      Add Match
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

            String(

                staff.identity.cleanName ||

                staff.id ||

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
      Search GPS Tokens
    ----------------------------------*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff ||

                !staff.search

            ) {

                return;

            }

            const gpsTokens =

                Array.isArray(

                    staff.search.gps

                )

                    ? staff.search.gps

                    : [];

            if (

                gpsTokens.length === 0

            ) {

                return;

            }

            let matched =

                false;

            gpsTokens.forEach(

                function (

                    token

                ) {

                    if (

                        matched

                    ) {

                        return;

                    }

                    token =

                        String(

                            token ||

                            ""

                        )

                        .trim()

                        .toUpperCase();

                    if (

                        !token

                    ) {

                        return;

                    }

                    if (

                        hasWord(

                            query,

                            token

                        )

                    ) {

                        matched =

                            true;

                        addGPS(

                            staff

                        );

                    }

                }

            );

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

/*=========================================================
 EXTRACT KEYWORDS
=========================================================*/

StaffEntities.extractKeywords = function (

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
      Query
    ----------------------------------*/

    const query =

        String(

            result.normalizedQuery ||

            result.searchQuery ||

            ""

        )

            .trim()

            .toUpperCase();

    if (

        query.length === 0

    ) {

        return result;

    }

    /*----------------------------------
      Initialize
    ----------------------------------*/

    result.keywords = [];

    const seen =

        new Set();

    const keywordGroups =

        StaffConstants.KEYWORDS ||

        {};

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

                            word ||

                            ""

                        )

                            .trim()

                            .toUpperCase();

                    if (

                        keyword.length === 0

                    ) {

                        return;

                    }

                    /*------------------------------
                      Exact Word Match
                    ------------------------------*/

                    const pattern =

                        new RegExp(

                            "\\b" +

                            keyword.replace(

                                /[.*+?^${}()|[\]\\]/g,

                                "\\$&"

                            ) +

                            "\\b"

                        );

                    if (

                        !pattern.test(

                            query

                        )

                    ) {

                        return;

                    }

                    const id =

                        group +

                        "::" +

                        keyword;

                    if (

                        seen.has(

                            id

                        )

                    ) {

                        return;

                    }

                    seen.add(

                        id

                    );

                    result.keywords.push({

                        group:

                            group,

                        keyword:

                            keyword

                    });

                }

            );

        }

    );

    /*----------------------------------
      Sort
    ----------------------------------*/

    result.keywords.sort(

        function (

            a,

            b

        ) {

            if (

                a.group ===

                b.group

            ) {

                return a.keyword.localeCompare(

                    b.keyword

                );

            }

            return a.group.localeCompare(

                b.group

            );

        }

    );

    /*----------------------------------
      Statistics
    ----------------------------------*/

    if (

        !result.stats

    ) {

        result.stats =

            {};

    }

    result.stats.keywordMatches =

        result.keywords.length;

    result.stats.totalEntities =

        (

            result.stats.totalEntities ||

            0

        ) +

        result.keywords.length;

    /*----------------------------------
      Return
    ----------------------------------*/

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
StaffEntities.buildPostingParameters = function (

    result

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !result ||

        !result.entities

    ) {

        return result;

    }

    /*----------------------------------
      Posting Entities
    ----------------------------------*/

    const posting =

        Array.isArray(

            result.entities.posting

        )

            ? result.entities.posting

            : [];

    /*----------------------------------
      Parameters
    ----------------------------------*/

    const parameters =

        result.parameters ||

        {};

    /*----------------------------------
      Build Parameters
    ----------------------------------*/

    posting.forEach(

        function (

            item

        ) {

            if (

                !item ||

                !item.type

            ) {

                return;

            }

            const type =

                String(

                    item.type

                )

                .trim()

                .toLowerCase();

            const value =

                item.value;

            if (

                value === undefined ||

                value === null ||

                value === ""

            ) {

                return;

            }

            switch (

                type

            ) {

                case "circle":

                    parameters.circle =

                        value;

                    break;

                case "division":

                    parameters.division =

                        value;

                    break;

                case "range":

                    parameters.range =

                        value;

                    break;

                case "beat":

                    parameters.beat =

                        value;

                    break;

                case "compartment":

                    parameters.compartment =

                        value;

                    break;

                default:

                    parameters[type] =

                        value;

                    break;

            }

        }

    );

    /*----------------------------------
      Save Parameters
    ----------------------------------*/

    result.parameters =

        parameters;

    /*----------------------------------
      Debug
    ----------------------------------*/

    console.log(

        "Posting Parameters:",

        {

            circle:

                parameters.circle ||

                null,

            division:

                parameters.division ||

                null,

            range:

                parameters.range ||

                null,

            beat:

                parameters.beat ||

                null,

            compartment:

                parameters.compartment ||

                null

        }

    );

    return result;

};
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

    console.log(

        "AFTER STAFF",

        result.entities.staff,

        result.parameters

    );

    /*----------------------------------
      Extract Phones
    ----------------------------------*/

    result =

        StaffEntities.extractPhoneEntities(

            result

        );

    console.log(

        "AFTER PHONE",

        result.entities.staff,

        result.parameters

    );

    /*----------------------------------
      Extract Roles
    ----------------------------------*/

    result =

        StaffEntities.extractRoleEntities(

            result

        );

    console.log(

        "AFTER ROLE",

        result.entities.staff,

        result.parameters

    );

    /*----------------------------------
      Extract Designations
    ----------------------------------*/

    result =

        StaffEntities.extractDesignationEntities(

            result

        );

    console.log(

        "AFTER DESIGNATION",

        result.entities.staff,

        result.parameters

    );

    /*----------------------------------
      Extract Posting
    ----------------------------------*/

    result =

        StaffEntities.extractPostingEntities(

            result

        );

    console.log(

        "AFTER POSTING",

        result.entities.staff,

        result.parameters

    );

    /*----------------------------------
      Build Posting Parameters
    ----------------------------------*/

    StaffEntities.buildPostingParameters(

        result

    );

    console.log(

        "AFTER POSTING PARAMETERS",

        result.entities.staff,

        result.parameters

    );

    /*----------------------------------
      Extract Team
    ----------------------------------*/

    result =

        StaffEntities.extractTeamEntities(

            result

        );

    console.log(

        "AFTER TEAM",

        result.entities.staff,

        result.parameters

    );

    /*----------------------------------
      Extract Duty
    ----------------------------------*/

    result =

        StaffEntities.extractDutyEntities(

            result

        );

    console.log(

        "AFTER DUTY",

        result.entities.staff,

        result.parameters

    );

    /*----------------------------------
      Extract GPS
    ----------------------------------*/

    result =

        StaffEntities.extractGPSEntities(

            result

        );

    console.log(

        "AFTER GPS",

        result.entities.staff,

        result.parameters

    );

    /*----------------------------------
      Extract Keywords
    ----------------------------------*/

    result =

        StaffEntities.extractKeywords(

            result

        );

    console.log(

        "AFTER KEYWORDS",

        result.entities.staff,

        result.parameters

    );

    /*----------------------------------
      Calculate Confidence
    ----------------------------------*/

    result =

        StaffEntities.calculateExtractionConfidence(

            result

        );

    console.log(

        "AFTER CONFIDENCE",

        result.entities.staff,

        result.parameters

    );

    /*----------------------------------
      Finalize
    ----------------------------------*/

    result =

        StaffEntities.finalizeExtraction(

            result

        );

    console.log(

        "AFTER FINALIZE",

        result.entities.staff,

        result.parameters

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
      Remove Punctuation
    ----------------------------------*/

    search =

        search.replace(

            /[^A-Z0-9\s]/g,

            " "

        );

    /*----------------------------------
      Noise Words
    ----------------------------------*/

    const removeWords = [

        /* Commands */

        "SHOW",
        "DISPLAY",
        "VIEW",
        "OPEN",
        "GET",
        "GIVE",
        "RETURN",
        "FIND",
        "SEARCH",
        "LOOKUP",
        "LIST",

        /* Questions */

        "WHO",
        "WHAT",
        "WHERE",
        "WHEN",
        "WHICH",
        "WHY",
        "HOW",

        /* Grammar */

        "IS",
        "ARE",
        "AM",
        "WAS",
        "WERE",
        "BE",
        "BEEN",
        "BEING",
        "DO",
        "DOES",
        "DID",
        "HAS",
        "HAVE",
        "HAD",
        "CAN",
        "COULD",
        "SHALL",
        "SHOULD",
        "WILL",
        "WOULD",
        "MAY",
        "MIGHT",
        "MUST",

        /* Articles */

        "A",
        "AN",
        "THE",
        "OF",
        "TO",
        "FOR",
        "FROM",
        "IN",
        "ON",
        "AT",
        "BY",
        "WITH",
        "UNDER",
        "OVER",
        "INTO",
        "ONTO",

        /* Generic */

        "PLEASE",
        "KINDLY",
        "ME",
        "MY",

        /* Staff */

        "STAFF",
        "PERSON",
        "PERSONNEL",
        "EMPLOYEE",
        "MEMBER",

        /* Profile */

        "PROFILE",
        "DETAIL",
        "DETAILS",
        "INFO",
        "INFORMATION",
        "ABOUT",

        /* Contact */

        "PHONE",
        "NUMBER",
        "MOBILE",
        "CONTACT",
        "EMAIL",
        "CALL",

        /* Business Intent */

        "ROLE",
        "DESIGNATION",
        "POSTING",
        "POSTED",
        "LOCATION",
        "LOCATED",
        "CURRENT",
        "GPS",
        "COORDINATES",
        "POSITION",
        "DUTY",
        "STATUS",
        "ACTIVE",
        "INACTIVE",
        "PATROL",
        "PATROLLING",
        "PATROLLED",
        "ANALYTICS",
        "SUMMARY"

    ];

    /*----------------------------------
      Remove Words
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
      Cleanup
    ----------------------------------*/

    search =

        search

            .replace(

                /\s+/g,

                " "

            )

            .trim();

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
      Cache References
    ----------------------------------*/

    const entityCache =

        StaffEntities
            .cache
            .entities;

    const aliasCache =

        StaffEntities
            .cache
            .aliases;

    /*----------------------------------
      Clear Existing Cache
    ----------------------------------*/

    entityCache.clear();

    aliasCache.clear();

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

            !entityCache.has(

                value

            )

        ) {

            entityCache.set(

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
              Search Identity
            ==============================*/

            if (

                staff.search

            ) {

                [

                    "identity",

                    "phone"

                ]

                .forEach(

                    function (

                        section

                    ) {

                        const values =

                            Array.isArray(

                                staff.search[
                                    section
                                ]

                            )

                                ? staff.search[
                                    section
                                ]

                                : [];

                        values.forEach(

                            function (

                                value

                            ) {

                                add(

                                    value,

                                    staff

                                );

                            }

                        );

                    }

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

/*==============================
  Alias Cache
==============================*/

if (

    Array.isArray(

        staff.aliases

    )

) {

    staff.aliases.forEach(

        function (

            alias

        ) {

            alias =

                String(

                    alias ||

                    ""

                )

                .trim()

                .toUpperCase();

            if (

                alias === ""

            ) {

                return;

            }

            const cleanName =

                staff.identity?.cleanName;

            if (

                !cleanName

            ) {

                return;

            }

            /*----------------------------------
              Preserve First Alias Owner
            ----------------------------------*/

            if (

                aliasCache.has(

                    alias

                )

            ) {

                const existing =

                    aliasCache.get(

                        alias

                    );

                if (

                    existing !==

                    cleanName

                ) {

                    console.warn(

                        "[StaffEntities] Duplicate alias ignored:",

                        alias,

                        "->",

                        cleanName,

                        "(already assigned to",

                        existing + ")"

                    );

                }

                return;

            }

            /*----------------------------------
              Store Alias
            ----------------------------------*/

            aliasCache.set(

                alias,

                cleanName

            );

        }

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

        entityCache.size

    );

    console.log(

        "Aliases:",

        aliasCache.size

    );

    console.groupEnd();

    /*----------------------------------
      Return
    ----------------------------------*/

    return entityCache;

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

    "Alias Cache:",

    StaffEntities.cache.aliases.size

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

    const queryWords =

        new Set(

            search

                .split(

                    /\s+/

                )

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

                staff.id ||

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
      Search Identity Tokens
    ----------------------------------*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff ||

                !staff.search ||

                !Array.isArray(

                    staff.search.identity

                )

            ) {

                return;

            }

            let score =

                0;

            staff.search.identity.forEach(

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
                      Exact
                    ------------------------------*/

                    if (

                        token === search

                    ) {

                        score +=

                            1000;

                        return;

                    }

                    /*------------------------------
                      Partial
                    ------------------------------*/

                    if (

                        token.includes(

                            search

                        )

                    ) {

                        score +=

                            token.length *

                            50;

                    }

                    /*------------------------------
                      Word Match
                    ------------------------------*/

                    const tokenWords =

                        token

                            .split(

                                /\s+/

                            )

                            .filter(

                                Boolean

                            );

                    let matched =

                        0;

                    tokenWords.forEach(

                        function (

                            word

                        ) {

                            if (

                                queryWords.has(

                                    word

                                )

                            ) {

                                matched++;

                            }

                        }

                    );

                    if (

                        matched ===

                        tokenWords.length

                    ) {

                        score +=

                            matched *

                            100;

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
      Return
    ----------------------------------*/

    return matches.map(

        function (

            item

        ) {

            return item.staff;

        }

    );

};
/*=========================================================
 EXTRACT PHONES
=========================================================*/

/*=========================================================
 EXTRACT PHONES
=========================================================*/

StaffEntities.extractPhones = function (

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

                staff.id ||

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
      Search Phone Tokens
    ----------------------------------*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff ||

                !staff.search ||

                !Array.isArray(

                    staff.search.phone

                )

            ) {

                return;

            }

            let score =

                0;

            staff.search.phone.forEach(

                function (

                    token

                ) {

                    token =

                        String(

                            token ||

                            ""

                        )

                        .replace(

                            /\D/g,

                            ""

                        );

                    if (

                        token.length === 0

                    ) {

                        return;

                    }

                    /*------------------------------
                      Exact Match
                    ------------------------------*/

                    if (

                        token === search

                    ) {

                        score +=

                            1000;

                        return;

                    }

                    /*------------------------------
                      Partial Match
                    ------------------------------*/

                    if (

                        token.includes(

                            search

                        )

                    ) {

                        score +=

                            token.length *

                            50;

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
      Return
    ----------------------------------*/

    return matches.map(

        function (

            item

        ) {

            return item.staff;

        }

    );

};
/*=========================================================
 EXTRACT ROLES
=========================================================*/

/*=========================================================
 EXTRACT ROLES
=========================================================*/

StaffEntities.extractRoles = function (

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

    const queryWords =

        new Set(

            search

                .split(

                    /\s+/

                )

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

                staff.id ||

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
      Search Role Tokens
    ----------------------------------*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff ||

                !staff.search ||

                !Array.isArray(

                    staff.search.role

                )

            ) {

                return;

            }

            let score =

                0;

            staff.search.role.forEach(

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
                      Exact Match
                    ------------------------------*/

                    if (

                        token === search

                    ) {

                        score +=

                            1000;

                        return;

                    }

                    /*------------------------------
                      Partial Match
                    ------------------------------*/

                    if (

                        token.includes(

                            search

                        )

                    ) {

                        score +=

                            token.length *

                            50;

                    }

                    /*------------------------------
                      Word Match
                    ------------------------------*/

                    const tokenWords =

                        token

                            .split(

                                /\s+/

                            )

                            .filter(

                                Boolean

                            );

                    let matched =

                        0;

                    tokenWords.forEach(

                        function (

                            word

                        ) {

                            if (

                                queryWords.has(

                                    word

                                )

                            ) {

                                matched++;

                            }

                        }

                    );

                    if (

                        matched ===

                        tokenWords.length

                    ) {

                        score +=

                            matched *

                            100;

                    }

                    /*------------------------------
                      Synonyms
                    ------------------------------*/

                    const synonyms =

                        StaffConstants

                            ?.SYNONYMS?.[

                                token

                            ];

                    if (

                        Array.isArray(

                            synonyms

                        )

                    ) {

                        synonyms.forEach(

                            function (

                                synonym

                            ) {

                                synonym =

                                    String(

                                        synonym

                                    )

                                    .trim()

                                    .toUpperCase();

                                if (

                                    synonym === search

                                ) {

                                    score +=

                                        900;

                                }

                                else if (

                                    synonym.includes(

                                        search

                                    )

                                ) {

                                    score +=

                                        synonym.length *

                                        40;

                                }

                            }

                        );

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
      Return
    ----------------------------------*/

    return matches.map(

        function (

            item

        ) {

            return item.staff;

        }

    );

};
/*=========================================================
 EXTRACT DESIGNATIONS
=========================================================*/

/*=========================================================
 EXTRACT DESIGNATIONS
=========================================================*/

StaffEntities.extractDesignations = function (

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

    const queryWords =

        new Set(

            search

                .split(

                    /\s+/

                )

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

                staff.id ||

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
      Search Designation Tokens
    ----------------------------------*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff ||

                !staff.search ||

                !Array.isArray(

                    staff.search.designation

                )

            ) {

                return;

            }

            let score =

                0;

            staff.search.designation.forEach(

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
                      Exact Match
                    ------------------------------*/

                    if (

                        token ===

                        search

                    ) {

                        score +=

                            1000;

                        return;

                    }

                    /*------------------------------
                      Partial Match
                    ------------------------------*/

                    if (

                        token.includes(

                            search

                        )

                    ) {

                        score +=

                            token.length *

                            50;

                    }

                    /*------------------------------
                      Word Match
                    ------------------------------*/

                    const tokenWords =

                        token

                            .split(

                                /\s+/

                            )

                            .filter(

                                Boolean

                            );

                    let matched =

                        0;

                    tokenWords.forEach(

                        function (

                            word

                        ) {

                            if (

                                queryWords.has(

                                    word

                                )

                            ) {

                                matched++;

                            }

                        }

                    );

                    if (

                        matched ===

                        tokenWords.length

                    ) {

                        score +=

                            matched *

                            100;

                    }

                    /*------------------------------
                      Designation Aliases
                    ------------------------------*/

                    const aliases =

                        StaffConstants

                            ?.DESIGNATION_ALIASES?.[

                                token

                            ];

                    if (

                        Array.isArray(

                            aliases

                        )

                    ) {

                        aliases.forEach(

                            function (

                                alias

                            ) {

                                alias =

                                    String(

                                        alias

                                    )

                                    .trim()

                                    .toUpperCase();

                                if (

                                    alias ===

                                    search

                                ) {

                                    score +=

                                        900;

                                }

                                else if (

                                    alias.includes(

                                        search

                                    )

                                ) {

                                    score +=

                                        alias.length *

                                        40;

                                }

                            }

                        );

                    }

                }

            );

            if (

                score >

                0

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
      Return
    ----------------------------------*/

    return matches.map(

        function (

            item

        ) {

            return item.staff;

        }

    );

};
/*=========================================================
 EXTRACT POSTING
=========================================================*/

/*=========================================================
 EXTRACT POSTING
=========================================================*/

StaffEntities.extractPosting = function (

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

    const queryWords =

        new Set(

            search

                .split(

                    /\s+/

                )

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

                staff.id ||

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
      Search Posting Tokens
    ----------------------------------*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff ||

                !staff.search ||

                !Array.isArray(

                    staff.search.posting

                )

            ) {

                return;

            }

            let score =

                0;

            staff.search.posting.forEach(

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
                      Exact Match
                    ------------------------------*/

                    if (

                        token === search

                    ) {

                        score +=

                            1000;

                        return;

                    }

                    /*------------------------------
                      Partial Match
                    ------------------------------*/

                    if (

                        token.includes(

                            search

                        )

                    ) {

                        score +=

                            token.length *

                            50;

                    }

                    /*------------------------------
                      Word Match
                    ------------------------------*/

                    const tokenWords =

                        token

                            .split(

                                /\s+/

                            )

                            .filter(

                                Boolean

                            );

                    let matched =

                        0;

                    tokenWords.forEach(

                        function (

                            word

                        ) {

                            if (

                                queryWords.has(

                                    word

                                )

                            ) {

                                matched++;

                            }

                        }

                    );

                    if (

                        matched ===

                        tokenWords.length

                    ) {

                        score +=

                            matched *

                            100;

                    }

                }

            );

            if (

                score >

                0

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
      Return
    ----------------------------------*/

    return matches.map(

        function (

            item

        ) {

            return item.staff;

        }

    );

};
/*=========================================================
 EXTRACT TEAM
=========================================================*/

/*=========================================================
 EXTRACT TEAM
=========================================================*/

StaffEntities.extractTeam = function (

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

    const queryWords =

        new Set(

            search

                .split(

                    /\s+/

                )

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

                staff.id ||

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
      Search Team Tokens
    ----------------------------------*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff ||

                !staff.search ||

                !Array.isArray(

                    staff.search.team

                )

            ) {

                return;

            }

            let score =

                0;

            staff.search.team.forEach(

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
                      Exact Match
                    ------------------------------*/

                    if (

                        token === search

                    ) {

                        score +=

                            1000;

                        return;

                    }

                    /*------------------------------
                      Partial Match
                    ------------------------------*/

                    if (

                        token.includes(

                            search

                        )

                    ) {

                        score +=

                            token.length *

                            50;

                    }

                    /*------------------------------
                      Word Match
                    ------------------------------*/

                    const tokenWords =

                        token

                            .split(

                                /\s+/

                            )

                            .filter(

                                Boolean

                            );

                    let matched =

                        0;

                    tokenWords.forEach(

                        function (

                            word

                        ) {

                            if (

                                queryWords.has(

                                    word

                                )

                            ) {

                                matched++;

                            }

                        }

                    );

                    if (

                        matched ===

                        tokenWords.length

                    ) {

                        score +=

                            matched *

                            100;

                    }

                }

            );

            if (

                score >

                0

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
      Return
    ----------------------------------*/

    return matches.map(

        function (

            item

        ) {

            return item.staff;

        }

    );

};

/*=========================================================
 EXTRACT DUTY
=========================================================*/

/*=========================================================
 EXTRACT DUTY
=========================================================*/

StaffEntities.extractDuty = function (

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

    const queryWords =

        new Set(

            search

                .split(

                    /\s+/

                )

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

                staff.id ||

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
      Search Assignment Tokens
    ----------------------------------*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff ||

                !staff.search ||

                !Array.isArray(

                    staff.search.assignment

                )

            ) {

                return;

            }

            let score =

                0;

            let matched =

                false;

            staff.search.assignment.forEach(

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
                      Exact Match
                    ------------------------------*/

                    if (

                        token === search

                    ) {

                        score +=

                            1000;

                        matched =

                            true;

                        return;

                    }

                    /*------------------------------
                      Partial Match
                    ------------------------------*/

                    if (

                        token.includes(

                            search

                        )

                    ) {

                        score +=

                            token.length *

                            50;

                        matched =

                            true;

                    }

                    /*------------------------------
                      Word Match
                    ------------------------------*/

                    const tokenWords =

                        token

                            .split(

                                /\s+/

                            )

                            .filter(

                                Boolean

                            );

                    let count =

                        0;

                    tokenWords.forEach(

                        function (

                            word

                        ) {

                            if (

                                queryWords.has(

                                    word

                                )

                            ) {

                                count++;

                            }

                        }

                    );

                    if (

                        count ===

                        tokenWords.length

                    ) {

                        score +=

                            count *

                            100;

                        matched =

                            true;

                    }

                }

            );

            /*------------------------------
              Duty Type Synonyms
            ------------------------------*/

            if (

                StaffConstants.DUTY_TYPES

            ) {

                Object.values(

                    StaffConstants.DUTY_TYPES

                ).forEach(

                    function (

                        duty

                    ) {

                        duty =

                            String(

                                duty

                            )

                            .toUpperCase();

                        if (

                            duty === search ||

                            duty.includes(

                                search

                            ) ||

                            search.includes(

                                duty

                            )

                        ) {

                            score +=

                                200;

                            matched =

                                true;

                        }

                    }

                );

            }

            if (

                matched

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
      Return
    ----------------------------------*/

    return matches.map(

        function (

            item

        ) {

            return item.staff;

        }

    );

};
/*=========================================================
 EXTRACT GPS
=========================================================*/

/*=========================================================
 EXTRACT GPS
=========================================================*/

StaffEntities.extractGPS = function (

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

    const queryWords =

        new Set(

            search

                .split(

                    /\s+/

                )

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

                staff.id ||

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
      Search GPS Tokens
    ----------------------------------*/

    StaffEntities.staff.forEach(

        function (

            staff

        ) {

            if (

                !staff ||

                !staff.search ||

                !Array.isArray(

                    staff.search.gps

                )

            ) {

                return;

            }

            let score =

                0;

            let matched =

                false;

            staff.search.gps.forEach(

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

                        token.length < 1

                    ) {

                        return;

                    }

                    /*------------------------------
                      Exact Match
                    ------------------------------*/

                    if (

                        token === search

                    ) {

                        score +=

                            1000;

                        matched =

                            true;

                        return;

                    }

                    /*------------------------------
                      Partial Match
                    ------------------------------*/

                    if (

                        token.includes(

                            search

                        )

                    ) {

                        score +=

                            token.length *

                            50;

                        matched =

                            true;

                    }

                    /*------------------------------
                      Word Match
                    ------------------------------*/

                    const tokenWords =

                        token

                            .split(

                                /\s+/

                            )

                            .filter(

                                Boolean

                            );

                    let count =

                        0;

                    tokenWords.forEach(

                        function (

                            word

                        ) {

                            if (

                                queryWords.has(

                                    word

                                )

                            ) {

                                count++;

                            }

                        }

                    );

                    if (

                        count ===

                        tokenWords.length

                    ) {

                        score +=

                            count *

                            100;

                        matched =

                            true;

                    }

                }

            );

            /*------------------------------
              GPS Status
            ------------------------------*/

            if (

                search === "GPS" ||

                search === "GPS ACTIVE"

            ) {

                if (

                    staff.location &&

                    staff.location.lat !== null &&

                    staff.location.lon !== null

                ) {

                    score +=

                        200;

                    matched =

                        true;

                }

            }

            if (

                search === "GPS INACTIVE"

            ) {

                if (

                    !staff.location ||

                    staff.location.lat === null ||

                    staff.location.lon === null

                ) {

                    score +=

                        200;

                    matched =

                        true;

                }

            }

            /*------------------------------
              Moving
            ------------------------------*/

            if (

                search === "MOVING"

            ) {

                if (

                    Number(

                        staff.gps?.speed ||

                        0

                    ) > 0

                ) {

                    score +=

                        300;

                    matched =

                        true;

                }

            }

            /*------------------------------
              Stationary
            ------------------------------*/

            if (

                search === "STATIONARY"

            ) {

                if (

                    Number(

                        staff.gps?.speed ||

                        0

                    ) <= 0

                ) {

                    score +=

                        300;

                    matched =

                        true;

                }

            }

            if (

                matched

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
      Return
    ----------------------------------*/

    return matches.map(

        function (

            item

        ) {

            return item.staff;

        }

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
