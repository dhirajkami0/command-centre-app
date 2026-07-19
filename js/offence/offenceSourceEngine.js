/* =========================================================
   GreenGuard
   Offence Intelligence Module

   File:
   js/offence/offenceSourceEngine.js

   Version:
   2.0.0

   Purpose:
   - Build SOURCE offence hotspot dataset
   - SOURCE = accused origin / accused address
   - Aggregate repeated accused source locations
   - Preserve POR-authoritative relationships
   - Preserve CaseID as secondary metadata
   - Preserve linked accused records
   - Prepare SOURCE data for heatmap
   - Prepare SOURCE data for clickable markers
   - Provide POR-based source lookup
   - Provide POR-based cascade support

   AUTHORITATIVE RELATIONSHIP:

   Accused Address
        │
        ▼
      SOURCE
        │
      porKey
        │
        ▼
   Offence POR
        │
        ├── Cases
        ├── Accused
        ├── Witnesses
        ├── Seizures
        └── Seized Articles

   IMPORTANT:

   POR / porKey is authoritative.

   CaseID:
   - May exist
   - May be missing
   - May be mismatched
   - Is secondary metadata only

   SOURCE hotspot aggregation is geographic/address based.

   Example:

   Accused A ─┐
   Accused B ─┼── Same Address ── SOURCE HOTSPOT
   Accused C ─┘

   The hotspot can contain multiple PORs.

   IMPORTANT:
   - NO Leaflet rendering
   - NO heatmap rendering
   - NO popup rendering
   - NO Firestore queries
   - NO geocoding API calls

   Dependencies:
   1. offenceConstants.js
   2. offenceStore.js
   3. offenceGeocoder.js
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


    const Geocoder =
        GG.Offence.Geocoder;


    if (!Constants) {

        console.error(
            "[OffenceSourceEngine] OffenceConstants unavailable."
        );

        return;

    }


    if (!Store) {

        console.error(
            "[OffenceSourceEngine] OffenceStore unavailable."
        );

        return;

    }


    if (!Geocoder) {

        console.error(
            "[OffenceSourceEngine] OffenceGeocoder unavailable."
        );

        return;

    }


    /* =====================================================
       3. MODULE
       ===================================================== */

    const SourceEngine = {};


    /* =====================================================
       4. MODULE INFORMATION
       ===================================================== */

    SourceEngine.VERSION =
        "2.0.0";


    SourceEngine.initialized =
        false;


    /* =====================================================
       5. SOURCE HOTSPOT DATA

       Final hotspot:

       {
           id,
           key,

           type: "SOURCE",

           name,
           address,
           normalizedAddress,

           latitude,
           longitude,

           geocodeStatus,

           offenceCount,
           accusedCount,

           heatWeight,

           porKey,
           porKeys: [],
           porNos: [],

           caseIds: [],

           accusedIds: [],
           suspectIds: [],

           cases: [],
           accused: []
       }

       IMPORTANT:

       porKeys is authoritative.

       caseIds is secondary.
       ===================================================== */

    SourceEngine.hotspots =
        [];


    /* =====================================================
       6. HOTSPOT INDEX

       hotspot key
           ↓
       hotspot
       ===================================================== */

    SourceEngine.index =
        new Map();


    /* =====================================================
       7. HOTSPOT ID INDEX

       hotspot ID
           ↓
       hotspot
       ===================================================== */

    SourceEngine.idIndex =
        new Map();


    /* =====================================================
       8. POR → SOURCE INDEX

       AUTHORITATIVE

       porKey
           ↓
       [
           sourceHotspot,
           ...
       ]
       ===================================================== */

    SourceEngine.porIndex =
        new Map();


    /* =====================================================
       9. CASE → SOURCE INDEX

       SECONDARY ONLY

       CaseID
           ↓
       [
           sourceHotspot,
           ...
       ]
       ===================================================== */

    SourceEngine.caseIndex =
        new Map();


    /* =====================================================
       10. ACCUSED → SOURCE INDEX

       AccusedID
           ↓
       sourceHotspot
       ===================================================== */

    SourceEngine.accusedIndex =
        new Map();


    /* =====================================================
       11. SUSPECT → SOURCE INDEX

       Legacy compatibility.

       suspectId
           ↓
       sourceHotspot
       ===================================================== */

    SourceEngine.suspectIndex =
        new Map();


    /* =====================================================
       12. INITIALIZE
       ===================================================== */

    SourceEngine.init =
        function () {

            if (
                SourceEngine.initialized
            ) {

                return SourceEngine;

            }


            SourceEngine.initialized =
                true;


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(

                    "🔥 OffenceSourceEngine Ready",

                    {

                        version:
                            SourceEngine.VERSION,

                        authoritativeConnector:
                            "porKey"

                    }

                );

            }


            return SourceEngine;

        };


    /* =====================================================
       13. NORMALIZE GENERIC KEY
       ===================================================== */

    SourceEngine.normalizeKey =
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
       14. NORMALIZE POR KEY

       Prefer already-normalized porKey from Normalizer.

       This is only a safe fallback.

       NO fuzzy matching is performed here.
       ===================================================== */

    SourceEngine.normalizePorKey =
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

                .replace(
                    /\r?\n/g,
                    " "
                )

                .replace(
                    /\s+/g,
                    " "
                )

                .trim()

                .toUpperCase();

        };


    /* =====================================================
       15. VALIDATE COORDINATES
       ===================================================== */

    SourceEngine.isValidCoordinate =
        function (

            latitude,

            longitude

        ) {

            if (
                typeof Geocoder.isValidCoordinate ===
                "function"
            ) {

                return Geocoder
                    .isValidCoordinate(

                        latitude,

                        longitude

                    );

            }


            const lat =
                Number(
                    latitude
                );


            const lng =
                Number(
                    longitude
                );


            return (

                Number.isFinite(
                    lat
                ) &&

                Number.isFinite(
                    lng
                ) &&

                lat >= -90 &&

                lat <= 90 &&

                lng >= -180 &&

                lng <= 180

            );

        };


    /* =====================================================
       16. CREATE COORDINATE KEY

       Coordinates rounded to 5 decimals.

       Example:

       26.5452211
       89.4800412

       becomes:

       26.54522|89.48004
       ===================================================== */

    SourceEngine.createCoordinateKey =
        function (

            latitude,

            longitude

        ) {

            if (
                !SourceEngine
                    .isValidCoordinate(

                        latitude,

                        longitude

                    )
            ) {

                return "";

            }


            return (

                Number(
                    latitude
                ).toFixed(
                    5
                ) +

                "|" +

                Number(
                    longitude
                ).toFixed(
                    5
                )

            );

        };


    /* =====================================================
       17. CREATE HOTSPOT KEY

       Geographic grouping strategy:

       1. normalized address
       2. coordinates as fallback

       POR is NOT part of the geographic hotspot key.

       Why?

       Multiple PORs from the same source location should
       aggregate into one geographic SOURCE hotspot.

       Example:

       POR-1 ─┐
       POR-2 ─┼── Damanpur ── ONE HOTSPOT
       POR-3 ─┘
       ===================================================== */

    SourceEngine.createHotspotKey =
        function (

            location

        ) {

            if (!location) {

                return "";

            }


            const address =

                SourceEngine
                    .normalizeKey(

                        location.normalizedAddress ||

                        location.rawAddress ||

                        location.address ||

                        location.name

                    );


            if (address) {

                return (

                    "SOURCE::ADDRESS::" +

                    address

                );

            }


            const coordinateKey =

                SourceEngine
                    .createCoordinateKey(

                        location.latitude,

                        location.longitude

                    );


            if (coordinateKey) {

                return (

                    "SOURCE::COORD::" +

                    coordinateKey

                );

            }


            return "";

        };


    /* =====================================================
       18. CREATE HOTSPOT ID
       ===================================================== */

    SourceEngine.createHotspotId =
        function (

            key

        ) {

            return (

                "OFFENCE_SOURCE_" +

                String(
                    key ||
                    ""
                )

                    .toUpperCase()

                    .replace(
                        /[^A-Z0-9]+/g,
                        "_"
                    )

                    .replace(
                        /^_+|_+$/g,
                        ""
                    )

            );

        };


    /* =====================================================
       19. ADD UNIQUE VALUE
       ===================================================== */

    SourceEngine.addUnique =
        function (

            array,

            value,

            normalizer =
                SourceEngine.normalizeKey

        ) {

            if (
                !Array.isArray(
                    array
                )
            ) {

                return;

            }


            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {

                return;

            }


            const key =

                normalizer(
                    value
                );


            if (!key) {

                return;

            }


            const exists =

                array.some(

                    function (
                        existing
                    ) {

                        return (

                            normalizer(
                                existing
                            ) ===
                            key

                        );

                    }

                );


            if (!exists) {

                array.push(
                    value
                );

            }

        };


    /* =====================================================
       20. ADD UNIQUE OBJECT
       ===================================================== */

    SourceEngine.addUniqueObject =
        function (

            array,

            object,

            keyGetter

        ) {

            if (
                !Array.isArray(
                    array
                ) ||
                !object ||
                typeof keyGetter !==
                "function"
            ) {

                return;

            }


            const key =

                SourceEngine
                    .normalizeKey(

                        keyGetter(
                            object
                        )

                    );


            if (!key) {

                return;

            }


            const exists =

                array.some(

                    function (
                        existing
                    ) {

                        return (

                            SourceEngine
                                .normalizeKey(

                                    keyGetter(
                                        existing
                                    )

                                ) ===

                            key

                        );

                    }

                );


            if (!exists) {

                array.push(
                    object
                );

            }

        };


    /* =====================================================
       21. EXTRACT POR KEY

       Priority:

       resolvedSource.porKey
       accused.porKey
       case.porKey
       accused.refPorNo
       case.porNo
       case.refPorNo
       ===================================================== */

    SourceEngine.extractPorKey =
        function (

            resolvedSource,

            caseRecord

        ) {

            const accused =

                resolvedSource
                    ?.accused ||
                {};


            const raw =

                resolvedSource
                    ?.porKey ||

                accused
                    ?.porKey ||

                caseRecord
                    ?.porKey ||

                accused
                    ?.refPorNo ||

                accused
                    ?.porNo ||

                caseRecord
                    ?.porNo ||

                caseRecord
                    ?.refPorNo ||

                "";


            return SourceEngine
                .normalizePorKey(
                    raw
                );

        };


    /* =====================================================
       22. EXTRACT DISPLAY POR NUMBER
       ===================================================== */

    SourceEngine.extractPorNo =
        function (

            resolvedSource,

            caseRecord

        ) {

            const accused =

                resolvedSource
                    ?.accused ||
                {};


            return (

                resolvedSource
                    ?.porNo ||

                resolvedSource
                    ?.refPorNo ||

                accused
                    ?.refPorNo ||

                accused
                    ?.porNo ||

                caseRecord
                    ?.porNo ||

                caseRecord
                    ?.refPorNo ||

                ""

            );

        };


    /* =====================================================
       23. EXTRACT CASE ID

       Secondary metadata only.
       ===================================================== */

    SourceEngine.extractCaseId =
        function (

            resolvedSource,

            caseRecord

        ) {

            return (

                resolvedSource
                    ?.caseId ||

                resolvedSource
                    ?.accused
                    ?.caseId ||

                caseRecord
                    ?.caseId ||

                caseRecord
                    ?.id ||

                ""

            );

        };


    /* =====================================================
       24. EXTRACT ACCUSED ID

       Supports current and legacy field names.
       ===================================================== */

    SourceEngine.extractAccusedId =
        function (

            accused

        ) {

            if (!accused) {

                return "";

            }


            return (

                accused.accusedId ||

                accused.AccusedID ||

                accused.suspectId ||

                accused.id ||

                ""

            );

        };


    /* =====================================================
       25. CREATE EMPTY HOTSPOT
       ===================================================== */

    SourceEngine.createHotspot =
        function (

            location

        ) {

            const key =

                SourceEngine
                    .createHotspotKey(
                        location
                    );


            return {

                id:

                    SourceEngine
                        .createHotspotId(
                            key
                        ),

                key:
                    key,

                type:

                    Constants
                        .LOCATION_TYPE
                        ?.SOURCE ||

                    "SOURCE",

                name:

                    location.name ||

                    location.rawAddress ||

                    location.address ||

                    "Unknown Source",

                address:

                    location.rawAddress ||

                    location.address ||

                    location.name ||

                    "",

                normalizedAddress:

                    location.normalizedAddress ||

                    SourceEngine
                        .normalizeKey(

                            location.rawAddress ||

                            location.address ||

                            location.name

                        ),

                latitude:

                    Number(
                        location.latitude
                    ),

                longitude:

                    Number(
                        location.longitude
                    ),

                geocodeStatus:

                    location.geocodeStatus ||

                    null,

                geocodeSource:

                    location.geocodeSource ||

                    location.source ||

                    null,

                offenceCount:
                    0,

                accusedCount:
                    0,

                heatWeight:
                    0,

                /* -----------------------------------------
                   POR AUTHORITATIVE RELATIONSHIP
                   ----------------------------------------- */

                porKey:
                    "",

                porKeys:
                    [],

                porNos:
                    [],

                /* -----------------------------------------
                   SECONDARY CASE METADATA
                   ----------------------------------------- */

                caseIds:
                    [],

                /* -----------------------------------------
                   ACCUSED RELATIONSHIPS
                   ----------------------------------------- */

                accusedIds:
                    [],

                suspectIds:
                    [],

                cases:
                    [],

                accused:
                    []

            };

        };


    /* =====================================================
       26. ADD POR TO HOTSPOT
       ===================================================== */

    SourceEngine.addPor =
        function (

            hotspot,

            porKey,

            porNo

        ) {

            if (!hotspot) {

                return;

            }


            const normalizedPorKey =

                SourceEngine
                    .normalizePorKey(
                        porKey
                    );


            if (normalizedPorKey) {

                SourceEngine
                    .addUnique(

                        hotspot.porKeys,

                        normalizedPorKey,

                        SourceEngine
                            .normalizePorKey

                    );


                /*
                 * Convenience field.
                 *
                 * If hotspot contains exactly one POR,
                 * hotspot.porKey contains that POR.
                 *
                 * If multiple PORs share the same hotspot,
                 * porKey becomes blank and porKeys remains
                 * authoritative.
                 */

                hotspot.porKey =

                    hotspot.porKeys.length ===
                    1

                        ? hotspot.porKeys[0]

                        : "";

            }


            if (porNo) {

                SourceEngine
                    .addUnique(

                        hotspot.porNos,

                        porNo

                    );

            }

        };


    /* =====================================================
       27. ADD CASE TO HOTSPOT

       CaseID is secondary.

       POR relationship is handled separately.
       ===================================================== */

    SourceEngine.addCase =
        function (

            hotspot,

            caseRecord,

            fallbackCaseId

        ) {

            if (!hotspot) {

                return;

            }


            const caseId =

                caseRecord
                    ?.caseId ||

                caseRecord
                    ?.id ||

                fallbackCaseId ||

                "";


            if (caseId) {

                SourceEngine
                    .addUnique(

                        hotspot.caseIds,

                        caseId

                    );

            }


            if (caseRecord) {

                SourceEngine
                    .addUniqueObject(

                        hotspot.cases,

                        caseRecord,

                        function (
                            item
                        ) {

                            return (

                                item.caseId ||

                                item.id ||

                                item.porKey ||

                                item.porNo ||

                                item.refPorNo

                            );

                        }

                    );

            }

        };


    /* =====================================================
       28. ADD ACCUSED TO HOTSPOT
       ===================================================== */

    SourceEngine.addAccused =
        function (

            hotspot,

            accused

        ) {

            if (
                !hotspot ||
                !accused
            ) {

                return;

            }


            const accusedId =

                SourceEngine
                    .extractAccusedId(
                        accused
                    );


            if (accusedId) {

                SourceEngine
                    .addUnique(

                        hotspot.accusedIds,

                        accusedId

                    );

            }


            /*
             * Legacy suspectId support.
             */

            if (
                accused.suspectId
            ) {

                SourceEngine
                    .addUnique(

                        hotspot.suspectIds,

                        accused.suspectId

                    );

            }


            SourceEngine
                .addUniqueObject(

                    hotspot.accused,

                    accused,

                    function (
                        item
                    ) {

                        return (

                            SourceEngine
                                .extractAccusedId(
                                    item
                                ) ||

                            [

                                item.name ||
                                item.accusedName ||
                                "",

                                item.address ||
                                item.addressOfAccused ||
                                item.presentAddress ||
                                item.permanentAddress ||
                                ""

                            ].join(
                                "|"
                            )

                        );

                    }

                );

        };


    /* =====================================================
       29. ADD RESOLVED SOURCE

       Expected resolved source:

       {
           location: {...},
           accused: {...},
           porKey,
           porNo,
           caseId
       }

       caseRecord is optional.

       POR can be derived from either:
       - resolvedSource
       - accused
       - caseRecord
       ===================================================== */

    SourceEngine.addResolvedSource =
        function (

            resolvedSource,

            caseRecord =
                null

        ) {

            if (
                !resolvedSource ||
                !resolvedSource.location
            ) {

                return null;

            }


            const location =

                resolvedSource.location;


            /* =============================================
               29.1 IGNORE UNRESOLVED LOCATIONS
               ============================================= */

            if (
                !SourceEngine
                    .isValidCoordinate(

                        location.latitude,

                        location.longitude

                    )
            ) {

                return null;

            }


            /* =============================================
               29.2 GET GEOGRAPHIC HOTSPOT KEY
               ============================================= */

            const key =

                SourceEngine
                    .createHotspotKey(
                        location
                    );


            if (!key) {

                return null;

            }


            /* =============================================
               29.3 GET / CREATE HOTSPOT
               ============================================= */

            let hotspot =

                SourceEngine.index
                    .get(
                        key
                    );


            if (!hotspot) {

                hotspot =

                    SourceEngine
                        .createHotspot(
                            location
                        );


                SourceEngine.index
                    .set(

                        key,

                        hotspot

                    );


                SourceEngine.hotspots
                    .push(
                        hotspot
                    );

            }


            /* =============================================
               29.4 EXTRACT AUTHORITATIVE POR
               ============================================= */

            const porKey =

                SourceEngine
                    .extractPorKey(

                        resolvedSource,

                        caseRecord

                    );


            const porNo =

                SourceEngine
                    .extractPorNo(

                        resolvedSource,

                        caseRecord

                    );


            SourceEngine
                .addPor(

                    hotspot,

                    porKey,

                    porNo

                );


            /* =============================================
               29.5 ADD SECONDARY CASE
               ============================================= */

            const caseId =

                SourceEngine
                    .extractCaseId(

                        resolvedSource,

                        caseRecord

                    );


            SourceEngine
                .addCase(

                    hotspot,

                    caseRecord,

                    caseId

                );


            /* =============================================
               29.6 ADD ACCUSED
               ============================================= */

            SourceEngine
                .addAccused(

                    hotspot,

                    resolvedSource.accused

                );


            /* =============================================
               29.7 UPDATE COUNTS

               Offence count is UNIQUE POR count.

               This is critical.

               NOT:
               number of accused rows

               NOT:
               number of CaseIDs

               Example:

               One POR
               3 accused
               same address

               offenceCount = 1
               accusedCount = 3
               ============================================= */

            hotspot.offenceCount =

                hotspot.porKeys.length;


            /*
             * Legacy fallback:
             *
             * If old data does not yet expose porKey,
             * preserve meaningful heatmap behaviour using
             * unique CaseIDs.
             */

            if (
                hotspot.offenceCount ===
                0
            ) {

                hotspot.offenceCount =

                    hotspot.caseIds.length;

            }


            hotspot.accusedCount =

                hotspot.accused.length;


            hotspot.heatWeight =

                hotspot.offenceCount;


            return hotspot;

        };


    /* =====================================================
       30. BUILD FROM RESOLVED CONTEXTS

       Input:

       GG.Offence.Geocoder.resolveAll()

       Expected context:

       {
           case,
           porKey,
           sources: [...]
       }

       IMPORTANT:

       We no longer require context.case.

       A valid POR-linked accused source may exist even if
       CaseID is missing or mismatched.
       ===================================================== */

    SourceEngine.build =
        function (

            resolvedContexts =
                []

        ) {

            SourceEngine
                .reset();


            if (
                !Array.isArray(
                    resolvedContexts
                )
            ) {

                return [];

            }


            for (
                const context
                of resolvedContexts
            ) {

                if (!context) {

                    continue;

                }


                const caseRecord =

                    context.case ||
                    null;


                const sources =

                    Array.isArray(
                        context.sources
                    )

                        ? context.sources

                        : [];


                for (
                    const source
                    of sources
                ) {

                    if (!source) {

                        continue;

                    }


                    /*
                     * Propagate context-level POR metadata
                     * when Geocoder stores it on context
                     * rather than individual source.
                     */

                    const enrichedSource =

                        Object.assign(

                            {},

                            source,

                            {

                                porKey:

                                    source.porKey ||

                                    context.porKey ||

                                    context.refPorKey ||

                                    "",

                                porNo:

                                    source.porNo ||

                                    source.refPorNo ||

                                    context.porNo ||

                                    context.refPorNo ||

                                    "",

                                caseId:

                                    source.caseId ||

                                    context.caseId ||

                                    caseRecord
                                        ?.caseId ||

                                    ""

                            }

                        );


                    SourceEngine
                        .addResolvedSource(

                            enrichedSource,

                            caseRecord

                        );

                }

            }


            SourceEngine
                .rebuildIndexes();


            SourceEngine
                .calculateHeatWeights();


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(

                    "🔥 OffenceSourceEngine Built",

                    SourceEngine
                        .getStats()

                );

            }


            return SourceEngine.hotspots;

        };


    /* =====================================================
       31. BUILD DIRECTLY FROM STORE
       ===================================================== */

    SourceEngine.buildFromStore =
        async function () {

            const resolvedContexts =

                await Geocoder
                    .resolveAll();


            return SourceEngine
                .build(
                    resolvedContexts
                );

        };


    /* =====================================================
       32. CALCULATE HEAT WEIGHTS

       offenceCount:
       Actual unique POR count.

       heatWeight:
       Normalized 0 → 1 intensity.
       ===================================================== */

    SourceEngine.calculateHeatWeights =
        function () {

            if (
                SourceEngine.hotspots
                    .length ===
                0
            ) {

                return;

            }


            const maxCount =

                Math.max(

                    ...SourceEngine.hotspots
                        .map(

                            function (
                                hotspot
                            ) {

                                return (

                                    hotspot.offenceCount ||
                                    0

                                );

                            }

                        )

                );


            for (
                const hotspot
                of SourceEngine.hotspots
            ) {

                hotspot.heatWeight =

                    maxCount > 0

                        ? hotspot.offenceCount /
                          maxCount

                        : 0;

            }

        };


    /* =====================================================
       33. ADD HOTSPOT TO MULTI INDEX
       ===================================================== */

    SourceEngine.addToMultiIndex =
        function (

            index,

            key,

            hotspot,

            normalizer =
                SourceEngine.normalizeKey

        ) {

            if (
                !(index instanceof Map) ||
                !hotspot
            ) {

                return;

            }


            const normalizedKey =

                normalizer(
                    key
                );


            if (!normalizedKey) {

                return;

            }


            if (
                !index.has(
                    normalizedKey
                )
            ) {

                index.set(

                    normalizedKey,

                    []

                );

            }


            const array =

                index.get(
                    normalizedKey
                );


            const exists =

                array.some(

                    function (
                        existing
                    ) {

                        return (

                            existing.id ===
                            hotspot.id

                        );

                    }

                );


            if (!exists) {

                array.push(
                    hotspot
                );

            }

        };


    /* =====================================================
       34. REBUILD LOOKUP INDEXES
       ===================================================== */

    SourceEngine.rebuildIndexes =
        function () {

            SourceEngine.idIndex
                .clear();


            SourceEngine.porIndex
                .clear();


            SourceEngine.caseIndex
                .clear();


            SourceEngine.accusedIndex
                .clear();


            SourceEngine.suspectIndex
                .clear();


            for (
                const hotspot
                of SourceEngine.hotspots
            ) {


                /* =========================================
                   HOTSPOT ID INDEX
                   ========================================= */

                SourceEngine.idIndex
                    .set(

                        SourceEngine
                            .normalizeKey(
                                hotspot.id
                            ),

                        hotspot

                    );


                /* =========================================
                   POR INDEX
                   AUTHORITATIVE
                   ========================================= */

                for (
                    const porKey
                    of hotspot.porKeys
                ) {

                    SourceEngine
                        .addToMultiIndex(

                            SourceEngine.porIndex,

                            porKey,

                            hotspot,

                            SourceEngine
                                .normalizePorKey

                        );

                }


                /* =========================================
                   CASE INDEX
                   SECONDARY
                   ========================================= */

                for (
                    const caseId
                    of hotspot.caseIds
                ) {

                    SourceEngine
                        .addToMultiIndex(

                            SourceEngine.caseIndex,

                            caseId,

                            hotspot

                        );

                }


                /* =========================================
                   ACCUSED INDEX
                   ========================================= */

                for (
                    const accusedId
                    of hotspot.accusedIds
                ) {

                    const key =

                        SourceEngine
                            .normalizeKey(
                                accusedId
                            );


                    if (key) {

                        SourceEngine.accusedIndex
                            .set(

                                key,

                                hotspot

                            );

                    }

                }


                /* =========================================
                   LEGACY SUSPECT INDEX
                   ========================================= */

                for (
                    const suspectId
                    of hotspot.suspectIds
                ) {

                    const key =

                        SourceEngine
                            .normalizeKey(
                                suspectId
                            );


                    if (key) {

                        SourceEngine.suspectIndex
                            .set(

                                key,

                                hotspot

                            );

                    }

                }

            }


            return true;

        };


    /* =====================================================
       35. GET ALL HOTSPOTS
       ===================================================== */

    SourceEngine.getHotspots =
        function () {

            return SourceEngine.hotspots;

        };


    /* =====================================================
       36. GET HOTSPOT BY ID
       ===================================================== */

    SourceEngine.getHotspotById =
        function (

            id

        ) {

            const key =

                SourceEngine
                    .normalizeKey(
                        id
                    );


            if (!key) {

                return null;

            }


            return (

                SourceEngine.idIndex
                    .get(
                        key
                    ) ||

                null

            );

        };


    /* =====================================================
       37. GET SOURCES BY POR

       PRIMARY LOOKUP
       ===================================================== */

    SourceEngine.getByPor =
        function (

            porKey

        ) {

            const key =

                SourceEngine
                    .normalizePorKey(
                        porKey
                    );


            if (!key) {

                return [];

            }


            return (

                SourceEngine.porIndex
                    .get(
                        key
                    ) ||

                []

            );

        };


    /* =====================================================
       38. ALIAS: GET BY POR KEY
       ===================================================== */

    SourceEngine.getByPorKey =
        function (

            porKey

        ) {

            return SourceEngine
                .getByPor(
                    porKey
                );

        };


    /* =====================================================
       39. GET SOURCES BY CASE ID

       SECONDARY LOOKUP
       ===================================================== */

    SourceEngine.getByCaseId =
        function (

            caseId

        ) {

            const key =

                SourceEngine
                    .normalizeKey(
                        caseId
                    );


            if (!key) {

                return [];

            }


            return (

                SourceEngine.caseIndex
                    .get(
                        key
                    ) ||

                []

            );

        };


    /* =====================================================
       40. GET SOURCE BY ACCUSED ID
       ===================================================== */

    SourceEngine.getByAccusedId =
        function (

            accusedId

        ) {

            const key =

                SourceEngine
                    .normalizeKey(
                        accusedId
                    );


            if (!key) {

                return null;

            }


            return (

                SourceEngine.accusedIndex
                    .get(
                        key
                    ) ||

                null

            );

        };


    /* =====================================================
       41. GET SOURCE BY SUSPECT ID

       Legacy compatibility.
       ===================================================== */

    SourceEngine.getBySuspectId =
        function (

            suspectId

        ) {

            const key =

                SourceEngine
                    .normalizeKey(
                        suspectId
                    );


            if (!key) {

                return null;

            }


            return (

                SourceEngine.suspectIndex
                    .get(
                        key
                    ) ||

                null

            );

        };


    /* =====================================================
       42. GET HEATMAP DATA

       Output:

       [
           [latitude, longitude, weight],
           ...
       ]

       Leaflet.heat compatible.
       ===================================================== */

    SourceEngine.getHeatmapData =
        function () {

            return SourceEngine.hotspots

                .filter(

                    function (
                        hotspot
                    ) {

                        return SourceEngine
                            .isValidCoordinate(

                                hotspot.latitude,

                                hotspot.longitude

                            );

                    }

                )

                .map(

                    function (
                        hotspot
                    ) {

                        return [

                            hotspot.latitude,

                            hotspot.longitude,

                            hotspot.heatWeight

                        ];

                    }

                );

        };


    /* =====================================================
       43. GET MARKER DATA

       Full hotspot objects for clickable hit targets.
       ===================================================== */

    SourceEngine.getMarkerData =
        function () {

            return SourceEngine.hotspots

                .filter(

                    function (
                        hotspot
                    ) {

                        return SourceEngine
                            .isValidCoordinate(

                                hotspot.latitude,

                                hotspot.longitude

                            );

                    }

                );

        };


    /* =====================================================
       44. GET STORE POR CASCADE

       Compatible with possible Store API names.
       ===================================================== */

    SourceEngine.getStorePorCascade =
        function (

            porKey

        ) {

            try {


                if (
                    typeof Store.getCascadeByPor ===
                    "function"
                ) {

                    return (

                        Store
                            .getCascadeByPor(
                                porKey
                            ) ||

                        null

                    );

                }


                if (
                    typeof Store.getPorCascade ===
                    "function"
                ) {

                    return (

                        Store
                            .getPorCascade(
                                porKey
                            ) ||

                        null

                    );

                }


                if (
                    typeof Store.getByPor ===
                    "function"
                ) {

                    return (

                        Store
                            .getByPor(
                                porKey
                            ) ||

                        null

                    );

                }


                return null;

            }

            catch (
                error
            ) {

                if (
                    Constants.DEBUG
                        ?.ENABLED
                ) {

                    console.warn(

                        "[OffenceSourceEngine] POR cascade lookup failed",

                        porKey,

                        error

                    );

                }


                return null;

            }

        };


    /* =====================================================
       45. GET SOURCE CASCADE DATA

       Click SOURCE hotspot
             ↓
       hotspot
             ↓
       porKeys[]
             ↓
       POR cascades
             ↓
       cases
       accused
       witnesses
       seizures
       seized articles

       IMPORTANT:

       A geographic hotspot can represent multiple PORs.
       ===================================================== */

    SourceEngine.getCascadeData =
        function (

            hotspotId

        ) {

            const hotspot =

                SourceEngine
                    .getHotspotById(
                        hotspotId
                    );


            if (!hotspot) {

                return null;

            }


            const cascades =
                [];


            for (
                const porKey
                of hotspot.porKeys
            ) {

                const cascade =

                    SourceEngine
                        .getStorePorCascade(
                            porKey
                        );


                cascades.push({

                    porKey:
                        porKey,

                    cascade:
                        cascade

                });

            }


            return {

                type:
                    "SOURCE",

                hotspot:
                    hotspot,

                offenceCount:
                    hotspot.offenceCount,

                accusedCount:
                    hotspot.accusedCount,

                porKey:
                    hotspot.porKey,

                porKeys:

                    [
                        ...hotspot.porKeys
                    ],

                porNos:

                    [
                        ...hotspot.porNos
                    ],

                caseIds:

                    [
                        ...hotspot.caseIds
                    ],

                accusedIds:

                    [
                        ...hotspot.accusedIds
                    ],

                suspectIds:

                    [
                        ...hotspot.suspectIds
                    ],

                cases:

                    [
                        ...hotspot.cases
                    ],

                accused:

                    [
                        ...hotspot.accused
                    ],

                cascades:
                    cascades

            };

        };


    /* =====================================================
       46. GET POR CASCADE DATA DIRECTLY
       ===================================================== */

    SourceEngine.getPorCascadeData =
        function (

            porKey

        ) {

            const key =

                SourceEngine
                    .normalizePorKey(
                        porKey
                    );


            if (!key) {

                return null;

            }


            return {

                porKey:
                    key,

                sources:

                    SourceEngine
                        .getByPor(
                            key
                        ),

                cascade:

                    SourceEngine
                        .getStorePorCascade(
                            key
                        )

            };

        };


    /* =====================================================
       47. GET STATS
       ===================================================== */

    SourceEngine.getStats =
        function () {

            const uniquePorKeys =
                new Set();


            const uniqueCaseIds =
                new Set();


            const uniqueAccusedIds =
                new Set();


            let totalOffences =
                0;


            let totalAccusedLinks =
                0;


            for (
                const hotspot
                of SourceEngine.hotspots
            ) {

                totalOffences +=

                    hotspot.offenceCount ||
                    0;


                totalAccusedLinks +=

                    hotspot.accused.length;


                for (
                    const porKey
                    of hotspot.porKeys
                ) {

                    uniquePorKeys
                        .add(
                            porKey
                        );

                }


                for (
                    const caseId
                    of hotspot.caseIds
                ) {

                    uniqueCaseIds
                        .add(

                            SourceEngine
                                .normalizeKey(
                                    caseId
                                )

                        );

                }


                for (
                    const accusedId
                    of hotspot.accusedIds
                ) {

                    uniqueAccusedIds
                        .add(

                            SourceEngine
                                .normalizeKey(
                                    accusedId
                                )

                        );

                }

            }


            return {

                version:
                    SourceEngine.VERSION,

                hotspots:

                    SourceEngine.hotspots
                        .length,

                totalOffences:
                    totalOffences,

                uniquePorKeys:

                    uniquePorKeys
                        .size,

                linkedPORs:

                    SourceEngine.porIndex
                        .size,

                linkedCases:

                    uniqueCaseIds
                        .size,

                linkedAccused:

                    uniqueAccusedIds
                        .size,

                accusedLinks:
                    totalAccusedLinks,

                legacyLinkedSuspects:

                    SourceEngine.suspectIndex
                        .size

            };

        };


    /* =====================================================
       48. RESET
       ===================================================== */

    SourceEngine.reset =
        function () {

            SourceEngine.hotspots =
                [];


            SourceEngine.index
                .clear();


            SourceEngine.idIndex
                .clear();


            SourceEngine.porIndex
                .clear();


            SourceEngine.caseIndex
                .clear();


            SourceEngine.accusedIndex
                .clear();


            SourceEngine.suspectIndex
                .clear();


            return true;

        };


    /* =====================================================
       49. EXPORT
       ===================================================== */

    GG.Offence.SourceEngine =
        SourceEngine;


    /* =====================================================
       50. INITIALIZE
       ===================================================== */

    SourceEngine
        .init();


    /* =====================================================
       51. READY LOG
       ===================================================== */

    if (
        Constants.DEBUG
            ?.ENABLED
    ) {

        console.log(

            "🔥 OffenceSourceEngine Loaded",

            {

                version:
                    SourceEngine.VERSION,

                authoritativeConnector:
                    "porKey"

            }

        );

    }


})();
