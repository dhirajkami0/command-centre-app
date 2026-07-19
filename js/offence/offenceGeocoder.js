/* =========================================================
   GreenGuard
   Offence Intelligence Module

   File:
   js/offence/offenceGeocoder.js

   Purpose:
   - Resolve SOURCE locations from accused addresses
   - Resolve TARGET locations from seizure places
   - Use POR No / porKey as authoritative relationship context
   - Preserve CaseID as secondary metadata
   - Cache geocoded locations
   - Avoid duplicate simultaneous geocoding
   - Support manual/pre-resolved coordinates
   - Prepare spatial data for SOURCE/TARGET heatmaps

   Architecture:

   Firestore
      ↓
   offenceDataLoader.js
      ↓
   offenceNormalizer.js
      ↓
   offenceStore.js
      ↓
   POR-authoritative cascades
      │
      ├── Cases
      ├── Accused
      │      ↓
      │    SOURCE
      │
      ├── Witnesses
      └── Seizures
             │
             ├── Seized Articles
             ↓
           TARGET

   IMPORTANT:
   - NO Leaflet rendering
   - NO heatmap rendering
   - NO popup rendering
   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       1. GLOBAL NAMESPACE
       ===================================================== */

    window.GG =
        window.GG ||
        {};


    GG.Offence =
        GG.Offence ||
        {};


    /* =====================================================
       2. DEPENDENCIES
       ===================================================== */

    const Constants =
        GG.Offence.Constants;


    const Store =
        GG.Offence.Store;


    if (!Constants) {

        console.error(
            "[OffenceGeocoder] OffenceConstants unavailable."
        );

        return;

    }


    if (!Store) {

        console.error(
            "[OffenceGeocoder] OffenceStore unavailable."
        );

        return;

    }


    /* =====================================================
       3. MODULE
       ===================================================== */

    const OffenceGeocoder = {};


    /* =====================================================
       4. MODULE INFO
       ===================================================== */

    OffenceGeocoder.VERSION =
        "2.0.0";


    OffenceGeocoder.initialized =
        false;


    /* =====================================================
       5. MEMORY CACHE

       Cache key:

       SOURCE::NORMALIZED ADDRESS

       or

       TARGET::NORMALIZED ADDRESS

       Value:

       {
           latitude,
           longitude,
           status
       }
       ===================================================== */

    OffenceGeocoder.cache =
        new Map();


    /* =====================================================
       6. PENDING REQUESTS

       Prevent duplicate simultaneous geocoding requests.
       ===================================================== */

    OffenceGeocoder.pending =
        new Map();


    /* =====================================================
       7. SAFE CONSTANT HELPERS
       ===================================================== */

    OffenceGeocoder.getSourceType =
        function () {

            return (
                Constants.LOCATION_TYPE
                    ?.SOURCE ||
                "SOURCE"
            );

        };


    OffenceGeocoder.getTargetType =
        function () {

            return (
                Constants.LOCATION_TYPE
                    ?.TARGET ||
                "TARGET"
            );

        };


    OffenceGeocoder.getGeocodeStatus =
        function (
            name,
            fallback
        ) {

            return (
                Constants.GEOCODE_STATUS
                    ?.[name] ||
                fallback
            );

        };


    /* =====================================================
       8. INIT
       ===================================================== */

    OffenceGeocoder.init =
        function () {

            if (
                OffenceGeocoder.initialized
            ) {

                return OffenceGeocoder;

            }


            OffenceGeocoder.initialized =
                true;


            OffenceGeocoder
                .loadCache();


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(
                    "🔥 OffenceGeocoder Ready",
                    {
                        version:
                            OffenceGeocoder.VERSION,
                        porAuthoritative:
                            true
                    }
                );

            }


            return OffenceGeocoder;

        };


    /* =====================================================
       9. NORMALIZE LOCATION KEY

       Used for geocode cache grouping only.
       ===================================================== */

    OffenceGeocoder.normalizeKey =
        function (
            value
        ) {

            if (
                value === null ||
                value === undefined
            ) {

                return "";

            }


            return String(
                value
            )

                .trim()

                .replace(
                    /\s+/g,
                    " "
                )

                .toUpperCase();

        };


    /* =====================================================
       10. NORMALIZE POR KEY

       Prefer Store normalization when available.

       POR is authoritative for relationships.
       ===================================================== */

    OffenceGeocoder.normalizePorKey =
        function (
            value
        ) {

            if (
                typeof Store
                    .normalizePorKey ===
                "function"
            ) {

                return Store
                    .normalizePorKey(
                        value
                    );

            }


            if (
                typeof Store
                    .normalizePor ===
                "function"
            ) {

                return Store
                    .normalizePor(
                        value
                    );

            }


            return String(
                value ||
                ""
            )

                .trim()

                .replace(
                    /\s+/g,
                    " "
                )

                .toUpperCase();

        };


    /* =====================================================
       11. VALIDATE COORDINATES
       ===================================================== */

    OffenceGeocoder.isValidCoordinate =
        function (
            latitude,
            longitude
        ) {

            latitude =
                Number(
                    latitude
                );


            longitude =
                Number(
                    longitude
                );


            return (

                Number.isFinite(
                    latitude
                ) &&

                Number.isFinite(
                    longitude
                ) &&

                latitude >= -90 &&

                latitude <= 90 &&

                longitude >= -180 &&

                longitude <= 180

            );

        };


    /* =====================================================
       12. CREATE LOCATION ID
       ===================================================== */

    OffenceGeocoder.createLocationId =
        function (
            type,
            location
        ) {

            const key =

                OffenceGeocoder
                    .normalizeKey(
                        location
                    );


            const safe =

                key

                    .replace(
                        /[^A-Z0-9]+/g,
                        "_"
                    )

                    .replace(
                        /^_+|_+$/g,
                        ""
                    );


            return (

                String(
                    type ||
                    "LOCATION"
                )
                    .toUpperCase() +

                "_" +

                (
                    safe ||
                    "UNKNOWN"
                )

            );

        };


    /* =====================================================
       13. CREATE CANONICAL LOCATION

       Spatial object used by downstream heatmap engine.
       ===================================================== */

    OffenceGeocoder.createLocation =
        function (
            options = {}
        ) {

            const type =

                options.type ||

                OffenceGeocoder
                    .getSourceType();


            const rawAddress =

                String(
                    options.rawAddress ||
                    ""
                ).trim();


            const normalizedAddress =

                OffenceGeocoder
                    .normalizeKey(
                        rawAddress
                    );


            const latitude =

                options.latitude === null ||
                options.latitude === undefined

                    ? null

                    : Number(
                        options.latitude
                    );


            const longitude =

                options.longitude === null ||
                options.longitude === undefined

                    ? null

                    : Number(
                        options.longitude
                    );


            const resolved =

                OffenceGeocoder
                    .isValidCoordinate(
                        latitude,
                        longitude
                    );


            return {

                id:

                    options.id ||

                    OffenceGeocoder
                        .createLocationId(
                            type,
                            rawAddress
                        ),

                type:
                    type,

                name:

                    options.name ||
                    rawAddress,

                rawAddress:
                    rawAddress,

                normalizedAddress:
                    normalizedAddress,

                latitude:

                    resolved
                        ? latitude
                        : null,

                longitude:

                    resolved
                        ? longitude
                        : null,

                porKey:

                    options.porKey ||
                    "",

                porNo:

                    options.porNo ||
                    "",

                caseIds:

                    Array.isArray(
                        options.caseIds
                    )

                        ? [
                            ...options.caseIds
                        ]

                        : [],

                offenceCount:

                    Number(
                        options.offenceCount ||
                        0
                    ),

                geocodeStatus:

                    resolved

                        ? (
                            options.geocodeStatus ||

                            OffenceGeocoder
                                .getGeocodeStatus(
                                    "RESOLVED",
                                    "RESOLVED"
                                )
                        )

                        : (
                            options.geocodeStatus ||

                            OffenceGeocoder
                                .getGeocodeStatus(
                                    "PENDING",
                                    "PENDING"
                                )
                        )

            };

        };


    /* =====================================================
       14. CACHE KEY

       SOURCE and TARGET remain separate namespaces.
       ===================================================== */

    OffenceGeocoder.getCacheKey =
        function (
            type,
            address
        ) {

            return (

                String(
                    type ||
                    "LOCATION"
                )
                    .toUpperCase() +

                "::" +

                OffenceGeocoder
                    .normalizeKey(
                        address
                    )

            );

        };


    /* =====================================================
       15. GET CACHE
       ===================================================== */

    OffenceGeocoder.getCached =
        function (
            type,
            address
        ) {

            const key =

                OffenceGeocoder
                    .getCacheKey(
                        type,
                        address
                    );


            return (

                OffenceGeocoder
                    .cache
                    .get(
                        key
                    ) ||

                null

            );

        };


    /* =====================================================
       16. SET CACHE
       ===================================================== */

    OffenceGeocoder.setCached =
        function (
            type,
            address,
            result
        ) {

            if (
                !address ||
                !result
            ) {

                return false;

            }


            const key =

                OffenceGeocoder
                    .getCacheKey(
                        type,
                        address
                    );


            OffenceGeocoder
                .cache
                .set(
                    key,
                    result
                );


            OffenceGeocoder
                .saveCache();


            return true;

        };


    /* =====================================================
       17. LOAD PERSISTENT CACHE
       ===================================================== */

    OffenceGeocoder.loadCache =
        function () {

            if (
                Constants.UPDATE
                    ?.PRESERVE_GEOCODE_CACHE !==
                true
            ) {

                return;

            }


            const cacheKey =

                Constants.CACHE
                    ?.GEOCODES;


            if (!cacheKey) {

                return;

            }


            try {

                const raw =

                    localStorage
                        .getItem(
                            cacheKey
                        );


                if (!raw) {

                    return;

                }


                const parsed =

                    JSON.parse(
                        raw
                    );


                if (
                    !parsed ||
                    typeof parsed !==
                    "object"
                ) {

                    return;

                }


                Object.entries(
                    parsed
                )
                    .forEach(

                        function (
                            entry
                        ) {

                            const key =
                                entry[0];

                            const value =
                                entry[1];


                            OffenceGeocoder
                                .cache
                                .set(
                                    key,
                                    value
                                );

                        }

                    );

            }

            catch (
                error
            ) {

                console.warn(
                    "[OffenceGeocoder] Cache load failed",
                    error
                );

            }

        };


    /* =====================================================
       18. SAVE PERSISTENT CACHE
       ===================================================== */

    OffenceGeocoder.saveCache =
        function () {

            if (
                Constants.UPDATE
                    ?.PRESERVE_GEOCODE_CACHE !==
                true
            ) {

                return;

            }


            const cacheKey =

                Constants.CACHE
                    ?.GEOCODES;


            if (!cacheKey) {

                return;

            }


            try {

                const data =

                    Object.fromEntries(
                        OffenceGeocoder.cache
                    );


                localStorage
                    .setItem(

                        cacheKey,

                        JSON.stringify(
                            data
                        )

                    );

            }

            catch (
                error
            ) {

                if (
                    Constants.DEBUG
                        ?.LOG_GEOCODING
                ) {

                    console.warn(
                        "[OffenceGeocoder] Cache save failed",
                        error
                    );

                }

            }

        };


    /* =====================================================
       19. REGISTER MANUAL LOCATION

       Useful for known forest locations.
       ===================================================== */

    OffenceGeocoder.registerManual =
        function (
            type,
            address,
            latitude,
            longitude
        ) {

            if (
                !address
            ) {

                return false;

            }


            if (
                !OffenceGeocoder
                    .isValidCoordinate(
                        latitude,
                        longitude
                    )
            ) {

                return false;

            }


            const result = {

                latitude:

                    Number(
                        latitude
                    ),

                longitude:

                    Number(
                        longitude
                    ),

                status:

                    OffenceGeocoder
                        .getGeocodeStatus(
                            "MANUAL",
                            "MANUAL"
                        )

            };


            OffenceGeocoder
                .setCached(
                    type,
                    address,
                    result
                );


            return true;

        };


    /* =====================================================
       20. RESOLVE FROM CACHE
       ===================================================== */

    OffenceGeocoder.resolveCached =
        function (
            type,
            address
        ) {

            const cached =

                OffenceGeocoder
                    .getCached(
                        type,
                        address
                    );


            if (!cached) {

                return null;

            }


            if (
                !OffenceGeocoder
                    .isValidCoordinate(
                        cached.latitude,
                        cached.longitude
                    )
            ) {

                return null;

            }


            return {

                latitude:

                    Number(
                        cached.latitude
                    ),

                longitude:

                    Number(
                        cached.longitude
                    ),

                status:

                    cached.status ||

                    OffenceGeocoder
                        .getGeocodeStatus(
                            "RESOLVED",
                            "RESOLVED"
                        )

            };

        };


    /* =====================================================
       21. EXTRACT PRE-RESOLVED COORDINATES

       Allows Firestore/Normalizer records to already contain
       coordinates.

       Supported examples:

       latitude / longitude
       lat / lng
       sourceLatitude / sourceLongitude
       targetLatitude / targetLongitude

       Also supports:
       location.latitude / location.longitude
       ===================================================== */

    OffenceGeocoder.extractCoordinates =
        function (
            record,
            type
        ) {

            if (!record) {

                return null;

            }


            const isSource =

                type ===
                OffenceGeocoder
                    .getSourceType();


            const candidates = [

                {
                    latitude:
                        record.latitude,
                    longitude:
                        record.longitude
                },

                {
                    latitude:
                        record.lat,
                    longitude:
                        record.lng
                },

                {
                    latitude:
                        record.location
                            ?.latitude,
                    longitude:
                        record.location
                            ?.longitude
                },

                {
                    latitude:
                        record.location
                            ?.lat,
                    longitude:
                        record.location
                            ?.lng
                },

                isSource

                    ? {
                        latitude:
                            record.sourceLatitude,
                        longitude:
                            record.sourceLongitude
                    }

                    : {
                        latitude:
                            record.targetLatitude,
                        longitude:
                            record.targetLongitude
                    }

            ];


            for (
                const candidate
                of candidates
            ) {

                if (
                    OffenceGeocoder
                        .isValidCoordinate(
                            candidate
                                ?.latitude,
                            candidate
                                ?.longitude
                        )
                ) {

                    return {

                        latitude:

                            Number(
                                candidate.latitude
                            ),

                        longitude:

                            Number(
                                candidate.longitude
                            )

                    };

                }

            }


            return null;

        };


    /* =====================================================
       22. EXTERNAL GEOCODER HOOK

       Optional application hook:

       GG.Offence.resolveLocation =
           async function(address, type) {

               return {
                   latitude: 26.55,
                   longitude: 89.52
               };

           };
       ===================================================== */

    OffenceGeocoder.callExternal =
        async function (
            address,
            type
        ) {

            if (
                typeof GG.Offence
                    .resolveLocation !==
                "function"
            ) {

                return null;

            }


            try {

                const result =

                    await GG.Offence
                        .resolveLocation(
                            address,
                            type
                        );


                if (
                    result &&

                    OffenceGeocoder
                        .isValidCoordinate(
                            result.latitude,
                            result.longitude
                        )
                ) {

                    return {

                        latitude:

                            Number(
                                result.latitude
                            ),

                        longitude:

                            Number(
                                result.longitude
                            ),

                        status:

                            result.status ||

                            OffenceGeocoder
                                .getGeocodeStatus(
                                    "RESOLVED",
                                    "RESOLVED"
                                )

                    };

                }

            }

            catch (
                error
            ) {

                if (
                    Constants.DEBUG
                        ?.LOG_GEOCODING
                ) {

                    console.warn(
                        "[OffenceGeocoder] External geocoder failed",
                        address,
                        error
                    );

                }

            }


            return null;

        };


    /* =====================================================
       23. RESOLVE LOCATION

       Priority:

       1. Cache
       2. External geocoder
       3. Failed status
       ===================================================== */

    OffenceGeocoder.resolve =
        async function (
            address,
            type
        ) {

            address =

                String(
                    address ||
                    ""
                ).trim();


            if (!address) {

                return null;

            }


            type =

                type ||

                OffenceGeocoder
                    .getSourceType();


            /* ---------------------------------------------
               CACHE
               --------------------------------------------- */

            const cached =

                OffenceGeocoder
                    .resolveCached(
                        type,
                        address
                    );


            if (cached) {

                return cached;

            }


            /* ---------------------------------------------
               DUPLICATE REQUEST PROTECTION
               --------------------------------------------- */

            const pendingKey =

                OffenceGeocoder
                    .getCacheKey(
                        type,
                        address
                    );


            if (
                OffenceGeocoder
                    .pending
                    .has(
                        pendingKey
                    )
            ) {

                return await OffenceGeocoder
                    .pending
                    .get(
                        pendingKey
                    );

            }


            /* ---------------------------------------------
               CREATE REQUEST
               --------------------------------------------- */

            const promise =

                (async function () {

                    const result =

                        await OffenceGeocoder
                            .callExternal(
                                address,
                                type
                            );


                    if (result) {

                        OffenceGeocoder
                            .setCached(
                                type,
                                address,
                                result
                            );


                        return result;

                    }


                    return {

                        latitude:
                            null,

                        longitude:
                            null,

                        status:

                            OffenceGeocoder
                                .getGeocodeStatus(
                                    "FAILED",
                                    "FAILED"
                                )

                    };

                })();


            OffenceGeocoder
                .pending
                .set(
                    pendingKey,
                    promise
                );


            try {

                return await promise;

            }

            finally {

                OffenceGeocoder
                    .pending
                    .delete(
                        pendingKey
                    );

            }

        };


    /* =====================================================
       24. GET SOURCE ADDRESS

       SOURCE = accused origin/address.

       Constants.SOURCE_LOCATION_FIELDS is preferred.

       Fallback fields support current/legacy normalized data.
       ===================================================== */

    OffenceGeocoder.getSourceAddress =
        function (
            accused
        ) {

            if (!accused) {

                return "";

            }


            const fields =

                Array.isArray(
                    Constants
                        .SOURCE_LOCATION_FIELDS
                )

                    ? Constants
                        .SOURCE_LOCATION_FIELDS

                    : [

                        "address",

                        "addressOfAccused",

                        "fullAddress",

                        "presentAddress",

                        "permanentAddress",

                        "village"

                    ];


            for (
                const field
                of fields
            ) {

                const value =
                    accused[
                        field
                    ];


                if (
                    value &&
                    String(
                        value
                    ).trim()
                ) {

                    return String(
                        value
                    ).trim();

                }

            }


            return "";

        };


    /* =====================================================
       25. GET TARGET ADDRESS

       TARGET = seizure/offence location.

       Constants.TARGET_LOCATION_FIELDS is preferred.

       Fallback fields support current normalized data.
       ===================================================== */

    OffenceGeocoder.getTargetAddress =
        function (
            seizure
        ) {

            if (!seizure) {

                return "";

            }


            const fields =

                Array.isArray(
                    Constants
                        .TARGET_LOCATION_FIELDS
                )

                    ? Constants
                        .TARGET_LOCATION_FIELDS

                    : [

                        "placeOfSeizure",

                        "seizurePlace",

                        "place",

                        "location",

                        "address"

                    ];


            for (
                const field
                of fields
            ) {

                const value =
                    seizure[
                        field
                    ];


                if (
                    typeof value ===
                    "string" &&

                    value.trim()
                ) {

                    return value
                        .trim();

                }

            }


            return "";

        };


    /* =====================================================
       26. RESOLVE SOURCE

       Accused
          ↓
       Address
          ↓
       SOURCE location
       ===================================================== */

    OffenceGeocoder.resolveSource =
        async function (
            accused
        ) {

            if (!accused) {

                return null;

            }


            const address =

                OffenceGeocoder
                    .getSourceAddress(
                        accused
                    );


            if (!address) {

                return null;

            }


            const type =

                OffenceGeocoder
                    .getSourceType();


            /* ---------------------------------------------
               USE PRE-RESOLVED COORDINATES FIRST
               --------------------------------------------- */

            const coordinates =

                OffenceGeocoder
                    .extractCoordinates(
                        accused,
                        type
                    );


            let result;


            if (coordinates) {

                result = {

                    latitude:
                        coordinates.latitude,

                    longitude:
                        coordinates.longitude,

                    status:

                        OffenceGeocoder
                            .getGeocodeStatus(
                                "RESOLVED",
                                "RESOLVED"
                            )

                };

            }

            else {

                result =

                    await OffenceGeocoder
                        .resolve(
                            address,
                            type
                        );

            }


            return OffenceGeocoder
                .createLocation({

                    type:
                        type,

                    name:
                        address,

                    rawAddress:
                        address,

                    latitude:
                        result
                            ?.latitude,

                    longitude:
                        result
                            ?.longitude,

                    geocodeStatus:
                        result
                            ?.status

                });

        };


    /* =====================================================
       27. RESOLVE TARGET

       Seizure
          ↓
       Place of Seizure
          ↓
       TARGET location
       ===================================================== */

    OffenceGeocoder.resolveTarget =
        async function (
            seizure
        ) {

            if (!seizure) {

                return null;

            }


            const address =

                OffenceGeocoder
                    .getTargetAddress(
                        seizure
                    );


            if (!address) {

                return null;

            }


            const type =

                OffenceGeocoder
                    .getTargetType();


            /* ---------------------------------------------
               USE PRE-RESOLVED COORDINATES FIRST
               --------------------------------------------- */

            const coordinates =

                OffenceGeocoder
                    .extractCoordinates(
                        seizure,
                        type
                    );


            let result;


            if (coordinates) {

                result = {

                    latitude:
                        coordinates.latitude,

                    longitude:
                        coordinates.longitude,

                    status:

                        OffenceGeocoder
                            .getGeocodeStatus(
                                "RESOLVED",
                                "RESOLVED"
                            )

                };

            }

            else {

                result =

                    await OffenceGeocoder
                        .resolve(
                            address,
                            type
                        );

            }


            return OffenceGeocoder
                .createLocation({

                    type:
                        type,

                    name:
                        address,

                    rawAddress:
                        address,

                    latitude:
                        result
                            ?.latitude,

                    longitude:
                        result
                            ?.longitude,

                    geocodeStatus:
                        result
                            ?.status

                });

        };


    /* =====================================================
       28. GET CASCADE POR INFORMATION

       Handles slight differences in Store cascade structure.
       ===================================================== */

    OffenceGeocoder.getCascadePorInfo =
        function (
            cascade
        ) {

            if (!cascade) {

                return {

                    porKey:
                        "",

                    porNo:
                        ""

                };

            }


            const cases =

                Array.isArray(
                    cascade.cases
                )

                    ? cascade.cases

                    : (
                        cascade.case

                            ? [
                                cascade.case
                            ]

                            : []
                    );


            const primaryCase =

                cascade.case ||

                cases[0] ||

                null;


            const porNo =

                String(

                    cascade.porNo ||

                    cascade.refPorNo ||

                    primaryCase
                        ?.porNo ||

                    primaryCase
                        ?.refPorNo ||

                    ""

                ).trim();


            const porKey =

                String(

                    cascade.porKey ||

                    OffenceGeocoder
                        .normalizePorKey(
                            porNo
                        ) ||

                    ""

                ).trim();


            return {

                porKey:
                    porKey,

                porNo:
                    porNo

            };

        };


    /* =====================================================
       29. GET CASE IDS FROM CASCADE

       CaseID remains secondary metadata.
       It is NOT used as authoritative connector here.
       ===================================================== */

    OffenceGeocoder.getCascadeCaseIds =
        function (
            cascade
        ) {

            if (!cascade) {

                return [];

            }


            const cases =

                Array.isArray(
                    cascade.cases
                )

                    ? cascade.cases

                    : (
                        cascade.case

                            ? [
                                cascade.case
                            ]

                            : []
                    );


            return [

                ...new Set(

                    cases

                        .map(

                            function (
                                caseRecord
                            ) {

                                return String(

                                    caseRecord
                                        ?.caseId ||

                                    caseRecord
                                        ?.id ||

                                    ""

                                ).trim();

                            }

                        )

                        .filter(
                            Boolean
                        )

                )

            ];

        };


    /* =====================================================
       30. GET ARTICLES FOR SEIZURE

       Prefer articles already attached to the cascade.

       Fall back to Store lookup when available.
       ===================================================== */

    OffenceGeocoder.getArticlesForSeizure =
        function (
            seizure,
            cascade
        ) {

            if (!seizure) {

                return [];

            }


            const seizureId =

                String(

                    seizure.seizureId ||

                    seizure.id ||

                    ""

                ).trim();


            if (!seizureId) {

                return [];

            }


            const cascadeArticles =

                Array.isArray(
                    cascade
                        ?.seizedArticles
                )

                    ? cascade
                        .seizedArticles

                    : [];


            const matching =

                cascadeArticles
                    .filter(

                        function (
                            article
                        ) {

                            return String(

                                article
                                    ?.seizureId ||

                                ""

                            ).trim() ===
                            seizureId;

                        }

                    );


            if (
                matching.length > 0
            ) {

                return matching;

            }


            if (
                typeof Store
                    .getArticlesBySeizureId ===
                "function"
            ) {

                const articles =

                    Store
                        .getArticlesBySeizureId(
                            seizureId
                        );


                return Array.isArray(
                    articles
                )

                    ? articles

                    : [];

            }


            return [];

        };


    /* =====================================================
       31. RESOLVE POR CASCADE

       POR IS AUTHORITATIVE.

       POR
        │
        ├── CASE(S)
        │
        ├── ACCUSED
        │     ↓
        │   SOURCE
        │
        ├── WITNESSES
        │
        └── SEIZURES
              │
              ├── ARTICLES
              ↓
            TARGET
       ===================================================== */

    OffenceGeocoder.resolvePorCascade =
        async function (
            cascade
        ) {

            if (!cascade) {

                return null;

            }


            const porInfo =

                OffenceGeocoder
                    .getCascadePorInfo(
                        cascade
                    );


            /*
             * POR is authoritative.
             *
             * Do not create a spatial cascade when there
             * is no usable POR identity.
             */

            if (
                !porInfo.porKey &&
                !porInfo.porNo
            ) {

                return null;

            }


            const cases =

                Array.isArray(
                    cascade.cases
                )

                    ? cascade.cases

                    : (
                        cascade.case

                            ? [
                                cascade.case
                            ]

                            : []
                    );


            const primaryCase =

                cascade.case ||

                cases[0] ||

                null;


            const accusedList =

                Array.isArray(
                    cascade.accused
                )

                    ? cascade.accused

                    : [];


            const witnesses =

                Array.isArray(
                    cascade.witnesses
                )

                    ? cascade.witnesses

                    : [];


            const seizures =

                Array.isArray(
                    cascade.seizures
                )

                    ? cascade.seizures

                    : [];


            const seizedArticles =

                Array.isArray(
                    cascade.seizedArticles
                )

                    ? cascade.seizedArticles

                    : [];


            const caseIds =

                OffenceGeocoder
                    .getCascadeCaseIds(
                        cascade
                    );


            const sources = [];

            const targets = [];


            /* =================================================
               ACCUSED → SOURCE LOCATIONS
               ================================================= */

            for (
                const accused
                of accusedList
            ) {

                const source =

                    await OffenceGeocoder
                        .resolveSource(
                            accused
                        );


                if (!source) {

                    continue;

                }


                source.porKey =
                    porInfo.porKey;


                source.porNo =
                    porInfo.porNo;


                source.caseIds =
                    [
                        ...caseIds
                    ];


                source.offenceCount =
                    Math.max(
                        cases.length,
                        1
                    );


                sources.push({

                    type:

                        OffenceGeocoder
                            .getSourceType(),

                    porKey:
                        porInfo.porKey,

                    porNo:
                        porInfo.porNo,

                    case:
                        primaryCase,

                    cases:
                        cases,

                    caseIds:
                        caseIds,

                    accused:
                        accused,

                    location:
                        source

                });

            }


            /* =================================================
               SEIZURES → TARGET LOCATIONS
               ================================================= */

            for (
                const seizure
                of seizures
            ) {

                const target =

                    await OffenceGeocoder
                        .resolveTarget(
                            seizure
                        );


                if (!target) {

                    continue;

                }


                target.porKey =
                    porInfo.porKey;


                target.porNo =
                    porInfo.porNo;


                target.caseIds =
                    [
                        ...caseIds
                    ];


                target.offenceCount =
                    Math.max(
                        cases.length,
                        1
                    );


                const articles =

                    OffenceGeocoder
                        .getArticlesForSeizure(
                            seizure,
                            cascade
                        );


                targets.push({

                    type:

                        OffenceGeocoder
                            .getTargetType(),

                    porKey:
                        porInfo.porKey,

                    porNo:
                        porInfo.porNo,

                    case:
                        primaryCase,

                    cases:
                        cases,

                    caseIds:
                        caseIds,

                    seizure:
                        seizure,

                    seizedArticles:
                        articles,

                    location:
                        target

                });

            }


            return {

                porKey:
                    porInfo.porKey,

                porNo:
                    porInfo.porNo,

                case:
                    primaryCase,

                cases:
                    cases,

                caseIds:
                    caseIds,

                accused:
                    accusedList,

                witnesses:
                    witnesses,

                seizures:
                    seizures,

                seizedArticles:
                    seizedArticles,

                sources:
                    sources,

                targets:
                    targets,

                counts: {

                    cases:
                        cases.length,

                    accused:
                        accusedList.length,

                    witnesses:
                        witnesses.length,

                    seizures:
                        seizures.length,

                    seizedArticles:
                        seizedArticles.length,

                    sources:
                        sources.length,

                    targets:
                        targets.length

                }

            };

        };


    /* =====================================================
       32. BACKWARD COMPATIBILITY

       Old downstream code may still call:

       resolveCaseContext(context)

       It now routes through POR-authoritative resolution.
       ===================================================== */

    OffenceGeocoder.resolveCaseContext =
        async function (
            context
        ) {

            return await OffenceGeocoder
                .resolvePorCascade(
                    context
                );

        };


    /* =====================================================
       33. GET STORE CASCADES

       Preferred Store API:

       Store.getCaseCascades()

       Fallbacks:
       Store.getAllCascades()
       Store.getAllCaseContexts()

       This keeps the module compatible during migration.
       ===================================================== */

    OffenceGeocoder.getStoreCascades =
        function () {

            if (
                typeof Store
                    .getCaseCascades ===
                "function"
            ) {

                const cascades =

                    Store
                        .getCaseCascades();


                return Array.isArray(
                    cascades
                )

                    ? cascades

                    : [];

            }


            if (
                typeof Store
                    .getAllCascades ===
                "function"
            ) {

                const cascades =

                    Store
                        .getAllCascades();


                return Array.isArray(
                    cascades
                )

                    ? cascades

                    : [];

            }


            if (
                typeof Store
                    .getAllCaseContexts ===
                "function"
            ) {

                const contexts =

                    Store
                        .getAllCaseContexts();


                return Array.isArray(
                    contexts
                )

                    ? contexts

                    : [];

            }


            console.warn(
                "[OffenceGeocoder] No supported Store cascade API found."
            );


            return [];

        };


    /* =====================================================
       34. RESOLVE ALL STORE DATA

       Produces complete POR-authoritative spatial contexts.

       Result:

       [
           {
               porKey,
               porNo,
               cases,
               accused,
               witnesses,
               seizures,
               seizedArticles,
               sources,
               targets
           }
       ]
       ===================================================== */

    OffenceGeocoder.resolveAll =
        async function () {

            if (
                Store.ready ===
                false
            ) {

                console.warn(
                    "[OffenceGeocoder] OffenceStore is not ready."
                );

                return [];

            }


            const cascades =

                OffenceGeocoder
                    .getStoreCascades();


            const results = [];


            let sourceCount =
                0;


            let targetCount =
                0;


            for (
                const cascade
                of cascades
            ) {

                const resolved =

                    await OffenceGeocoder
                        .resolvePorCascade(
                            cascade
                        );


                if (!resolved) {

                    continue;

                }


                sourceCount +=

                    resolved.sources
                        ?.length ||

                    0;


                targetCount +=

                    resolved.targets
                        ?.length ||

                    0;


                results.push(
                    resolved
                );

            }


            if (
                Constants.DEBUG
                    ?.LOG_GEOCODING
            ) {

                console.log(

                    "🔥 OffenceGeocoder.resolveAll",

                    {

                        porCascades:
                            results.length,

                        sources:
                            sourceCount,

                        targets:
                            targetCount,

                        cache:
                            OffenceGeocoder
                                .cache
                                .size,

                        pending:
                            OffenceGeocoder
                                .pending
                                .size

                    }

                );

            }


            return results;

        };


    /* =====================================================
       35. FLATTEN SOURCE LOCATIONS

       Convenient input for SOURCE heatmap builder.
       ===================================================== */

    OffenceGeocoder.getResolvedSources =
        async function () {

            const cascades =

                await OffenceGeocoder
                    .resolveAll();


            return cascades
                .flatMap(

                    function (
                        cascade
                    ) {

                        return (
                            cascade.sources ||
                            []
                        );

                    }

                );

        };


    /* =====================================================
       36. FLATTEN TARGET LOCATIONS

       Convenient input for TARGET heatmap builder.
       ===================================================== */

    OffenceGeocoder.getResolvedTargets =
        async function () {

            const cascades =

                await OffenceGeocoder
                    .resolveAll();


            return cascades
                .flatMap(

                    function (
                        cascade
                    ) {

                        return (
                            cascade.targets ||
                            []
                        );

                    }

                );

        };


    /* =====================================================
       37. GET ONLY MAPPABLE SOURCES

       Removes unresolved coordinates.
       ===================================================== */

    OffenceGeocoder.getMappableSources =
        async function () {

            const sources =

                await OffenceGeocoder
                    .getResolvedSources();


            return sources
                .filter(

                    function (
                        item
                    ) {

                        return (

                            item
                                ?.location &&

                            OffenceGeocoder
                                .isValidCoordinate(

                                    item.location
                                        .latitude,

                                    item.location
                                        .longitude

                                )

                        );

                    }

                );

        };


    /* =====================================================
       38. GET ONLY MAPPABLE TARGETS
       ===================================================== */

    OffenceGeocoder.getMappableTargets =
        async function () {

            const targets =

                await OffenceGeocoder
                    .getResolvedTargets();


            return targets
                .filter(

                    function (
                        item
                    ) {

                        return (

                            item
                                ?.location &&

                            OffenceGeocoder
                                .isValidCoordinate(

                                    item.location
                                        .latitude,

                                    item.location
                                        .longitude

                                )

                        );

                    }

                );

        };


    /* =====================================================
       39. GET CACHE STATS
       ===================================================== */

    OffenceGeocoder.getStats =
        function () {

            let resolved =
                0;


            let failed =
                0;


            let manual =
                0;


            for (
                const item
                of OffenceGeocoder
                    .cache
                    .values()
            ) {

                if (

                    item.status ===

                    OffenceGeocoder
                        .getGeocodeStatus(
                            "MANUAL",
                            "MANUAL"
                        )

                ) {

                    manual++;

                }

                else if (

                    OffenceGeocoder
                        .isValidCoordinate(
                            item.latitude,
                            item.longitude
                        )

                ) {

                    resolved++;

                }

                else {

                    failed++;

                }

            }


            return {

                total:

                    OffenceGeocoder
                        .cache
                        .size,

                resolved:
                    resolved,

                manual:
                    manual,

                failed:
                    failed,

                pending:

                    OffenceGeocoder
                        .pending
                        .size

            };

        };


    /* =====================================================
       40. CLEAR CACHE
       ===================================================== */

    OffenceGeocoder.clearCache =
        function () {

            OffenceGeocoder
                .cache
                .clear();


            OffenceGeocoder
                .pending
                .clear();


            const cacheKey =

                Constants.CACHE
                    ?.GEOCODES;


            if (cacheKey) {

                try {

                    localStorage
                        .removeItem(
                            cacheKey
                        );

                }

                catch (
                    error
                ) {

                    // Ignore localStorage failure.

                }

            }


            return true;

        };


    /* =====================================================
       41. EXPORT
       ===================================================== */

    GG.Offence.Geocoder =
        OffenceGeocoder;


    /* =====================================================
       42. INITIALIZE
       ===================================================== */

    OffenceGeocoder
        .init();


    /* =====================================================
       43. READY LOG
       ===================================================== */

    if (
        Constants.DEBUG
            ?.ENABLED
    ) {

        console.log(

            "🔥 OffenceGeocoder Loaded",

            {

                version:
                    OffenceGeocoder.VERSION,

                porAuthoritative:
                    true,

                sourceType:

                    OffenceGeocoder
                        .getSourceType(),

                targetType:

                    OffenceGeocoder
                        .getTargetType()

            }

        );

    }


})();
