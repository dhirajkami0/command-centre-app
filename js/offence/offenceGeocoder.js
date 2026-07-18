/* =========================================================
   GreenGuard
   Offence Intelligence Module

   File:
   js/offence/offenceGeocoder.js

   Purpose:
   - Resolve SOURCE locations
   - Resolve TARGET locations
   - Cache geocoded locations
   - Avoid repeated geocoding
   - Support manual/pre-resolved coordinates
   - Prepare locations for heatmap processing

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
        "1.0.0";


    OffenceGeocoder.initialized =
        false;


    /* =====================================================
       5. MEMORY CACHE

       normalized location text
                ↓
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

       Prevents multiple simultaneous requests for
       the same location.
       ===================================================== */

    OffenceGeocoder.pending =
        new Map();


    /* =====================================================
       7. INIT
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
                    "🔥 OffenceGeocoder Ready"
                );

            }


            return OffenceGeocoder;

        };


    /* =====================================================
       8. NORMALIZE LOCATION KEY

       This is used for caching only.

       Example:

       "  Damanpur   Beat "
              ↓
       "DAMANPUR BEAT"
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
       9. VALIDATE COORDINATES
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
       10. CREATE LOCATION ID
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

                safe

            );

        };


    /* =====================================================
       11. CREATE CANONICAL LOCATION
       ===================================================== */

    OffenceGeocoder.createLocation =
        function (

            options = {}

        ) {

            const type =

                options.type ||

                Constants.LOCATION_TYPE
                    .SOURCE;


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

                caseIds:

                    Array.isArray(
                        options.caseIds
                    )

                        ? options.caseIds

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

                            Constants
                                .GEOCODE_STATUS
                                .RESOLVED

                        )

                        : Constants
                            .GEOCODE_STATUS
                            .PENDING

            };

        };


    /* =====================================================
       12. CACHE KEY

       SOURCE and TARGET use separate cache namespaces.

       Same text may represent different semantic locations.
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

                ).toUpperCase() +

                "::" +

                OffenceGeocoder
                    .normalizeKey(

                        address

                    )

            );

        };


    /* =====================================================
       13. GET CACHE
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
       14. SET CACHE
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
       15. LOAD PERSISTENT CACHE

       localStorage is used only as a lightweight
       frontend cache.

       This can later be replaced by Firestore or
       IndexedDB without changing other modules.
       ===================================================== */

    OffenceGeocoder.loadCache =
        function () {

            if (
                Constants.UPDATE
                    ?.PRESERVE_GEOCODE_CACHE !== true
            ) {

                return;

            }


            try {

                const raw =

                    localStorage.getItem(

                        Constants.CACHE
                            .GEOCODES

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
                    typeof parsed !== "object"
                ) {

                    return;

                }


                Object.entries(

                    parsed

                ).forEach(

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
       16. SAVE PERSISTENT CACHE
       ===================================================== */

    OffenceGeocoder.saveCache =
        function () {

            if (
                Constants.UPDATE
                    ?.PRESERVE_GEOCODE_CACHE !== true
            ) {

                return;

            }


            try {

                const data =

                    Object.fromEntries(

                        OffenceGeocoder
                            .cache

                    );


                localStorage.setItem(

                    Constants.CACHE
                        .GEOCODES,

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
       17. REGISTER MANUAL LOCATION

       Important for known places.

       Example:

       registerManual(
           "TARGET",
           "Damanpur Beat",
           26.55,
           89.52
       );

       This avoids external geocoding for known
       forest jurisdictions.
       ===================================================== */

    OffenceGeocoder.registerManual =
        function (

            type,

            address,

            latitude,

            longitude

        ) {

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

                    Constants
                        .GEOCODE_STATUS
                        .MANUAL

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
       18. RESOLVE FROM CACHE
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


            if (
                !cached
            ) {

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

                    Constants
                        .GEOCODE_STATUS
                        .RESOLVED

            };

        };


    /* =====================================================
       19. EXTERNAL GEOCODER HOOK

       IMPORTANT:

       This function intentionally does NOT hardcode
       Google Maps, Nominatim, Mapbox, etc.

       Later you can connect your own backend geocoder.

       Expected return:

       {
           latitude: 26.55,
           longitude: 89.52
       }

       If no external geocoder exists, returns null.
       ===================================================== */

    OffenceGeocoder.callExternal =
        async function (

            address,

            type

        ) {

            /*
             * Optional application-level hook.
             *
             * You can later define:
             *
             * GG.Offence.resolveLocation =
             * async function(address, type) {
             *     ...
             * };
             */

            if (

                typeof GG.Offence
                    .resolveLocation ===
                "function"

            ) {

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

                                Constants
                                    .GEOCODE_STATUS
                                    .RESOLVED

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

            }


            return null;

        };


    /* =====================================================
       20. RESOLVE LOCATION
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

                Constants
                    .LOCATION_TYPE
                    .SOURCE;


            /* -------------------------
               Check cache
               ------------------------- */

            const cached =

                OffenceGeocoder
                    .resolveCached(

                        type,

                        address

                    );


            if (
                cached
            ) {

                return cached;

            }


            /* -------------------------
               Prevent duplicate requests
               ------------------------- */

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


            /* -------------------------
               Create request
               ------------------------- */

            const promise =

                (async function () {

                    const result =

                        await OffenceGeocoder
                            .callExternal(

                                address,

                                type

                            );


                    if (
                        result
                    ) {

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

                            Constants
                                .GEOCODE_STATUS
                                .FAILED

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
       21. GET SOURCE ADDRESS

       Priority:

       1. Present Address
       2. Permanent Address
       ===================================================== */

    OffenceGeocoder.getSourceAddress =
        function (

            accused

        ) {

            if (!accused) {

                return "";

            }


            for (

                const field

                of Constants
                    .SOURCE_LOCATION_FIELDS

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
       22. GET TARGET ADDRESS
       ===================================================== */

    OffenceGeocoder.getTargetAddress =
        function (

            seizure

        ) {

            if (!seizure) {

                return "";

            }


            for (

                const field

                of Constants
                    .TARGET_LOCATION_FIELDS

            ) {

                const value =

                    seizure[
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
       23. RESOLVE SOURCE
       ===================================================== */

    OffenceGeocoder.resolveSource =
        async function (

            accused

        ) {

            const address =

                OffenceGeocoder
                    .getSourceAddress(

                        accused

                    );


            if (!address) {

                return null;

            }


            const result =

                await OffenceGeocoder
                    .resolve(

                        address,

                        Constants
                            .LOCATION_TYPE
                            .SOURCE

                    );


            return OffenceGeocoder
                .createLocation({

                    type:

                        Constants
                            .LOCATION_TYPE
                            .SOURCE,

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
       24. RESOLVE TARGET
       ===================================================== */

    OffenceGeocoder.resolveTarget =
        async function (

            seizure

        ) {

            const address =

                OffenceGeocoder
                    .getTargetAddress(

                        seizure

                    );


            if (!address) {

                return null;

            }


            const result =

                await OffenceGeocoder
                    .resolve(

                        address,

                        Constants
                            .LOCATION_TYPE
                            .TARGET

                    );


            return OffenceGeocoder
                .createLocation({

                    type:

                        Constants
                            .LOCATION_TYPE
                            .TARGET,

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
       25. RESOLVE CASE CONTEXT

       CASE
          │
          ├── Accused → SOURCE
          │
          └── Seizure → TARGET
       ===================================================== */

    OffenceGeocoder.resolveCaseContext =
        async function (

            context

        ) {

            if (
                !context ||
                !context.case
            ) {

                return null;

            }


            const sources = [];

            const targets = [];


            /* -------------------------
               Resolve Sources
               ------------------------- */

            for (

                const accused

                of (
                    context.accused ||
                    []
                )

            ) {

                const source =

                    await OffenceGeocoder
                        .resolveSource(

                            accused

                        );


                if (
                    source
                ) {

                    source.caseIds = [

                        context.case
                            .caseId

                    ];


                    source.offenceCount =
                        1;


                    sources.push({

                        location:

                            source,

                        accused:

                            accused

                    });

                }

            }


            /* -------------------------
               Resolve Targets
               ------------------------- */

            for (

                const seizure

                of (
                    context.seizures ||
                    []
                )

            ) {

                const target =

                    await OffenceGeocoder
                        .resolveTarget(

                            seizure

                        );


                if (
                    target
                ) {

                    target.caseIds = [

                        context.case
                            .caseId

                    ];


                    target.offenceCount =
                        1;


                    targets.push({

                        location:

                            target,

                        seizure:

                            seizure

                    });

                }

            }


            return {

                case:

                    context.case,

                accused:

                    context.accused ||
                    [],

                seizures:

                    context.seizures ||
                    [],

                sources:

                    sources,

                targets:

                    targets

            };

        };


    /* =====================================================
       26. RESOLVE ALL STORE DATA

       This prepares the complete spatial dataset.

       NOTE:
       For large datasets this should later be processed
       in controlled batches.
       ===================================================== */

    OffenceGeocoder.resolveAll =
        async function () {

            const contexts =

                Store
                    .getAllCaseContexts();


            const results = [];


            for (

                const context

                of contexts

            ) {

                const resolved =

                    await OffenceGeocoder
                        .resolveCaseContext(

                            context

                        );


                if (
                    resolved
                ) {

                    results.push(

                        resolved

                    );

                }

            }


            if (
                Constants.DEBUG
                    ?.LOG_GEOCODING
            ) {

                console.log(

                    "🔥 OffenceGeocoder.resolveAll",

                    {

                        cases:

                            results.length,

                        cache:

                            OffenceGeocoder
                                .cache
                                .size

                    }

                );

            }


            return results;

        };


    /* =====================================================
       27. GET CACHE STATS
       ===================================================== */

    OffenceGeocoder.getStats =
        function () {

            let resolved = 0;

            let failed = 0;

            let manual = 0;


            for (

                const item

                of OffenceGeocoder
                    .cache
                    .values()

            ) {

                if (

                    item.status ===
                    Constants
                        .GEOCODE_STATUS
                        .MANUAL

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
       28. CLEAR CACHE
       ===================================================== */

    OffenceGeocoder.clearCache =
        function () {

            OffenceGeocoder
                .cache
                .clear();


            OffenceGeocoder
                .pending
                .clear();


            try {

                localStorage.removeItem(

                    Constants.CACHE
                        .GEOCODES

                );

            }

            catch (

                error

            ) {

                // Ignore storage failure.

            }


            return true;

        };


    /* =====================================================
       29. EXPORT
       ===================================================== */

    GG.Offence.Geocoder =
        OffenceGeocoder;


    /* =====================================================
       30. INITIALIZE
       ===================================================== */

    OffenceGeocoder.init();


    /* =====================================================
       31. READY LOG
       ===================================================== */

    if (
        Constants.DEBUG
            ?.ENABLED
    ) {

        console.log(

            "🔥 OffenceGeocoder Loaded",

            OffenceGeocoder

        );

    }


})();
