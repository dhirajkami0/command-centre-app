/* =========================================================
   GreenGuard
   Offence Intelligence Module

   File:
   js/offence/offenceTargetEngine.js

   Version:
   2.0.0

   Purpose:
   - Build TARGET offence hotspot dataset
   - TARGET = offence / seizure destination location
   - Primary target source = Place of Seizure
   - Aggregate repeated target locations
   - Preserve POR-authoritative relationships
   - Preserve CaseID as secondary metadata
   - Preserve linked seizure records
   - Prepare TARGET data for heatmap
   - Prepare TARGET data for clickable markers
   - Provide POR-based target lookup
   - Provide POR-based cascade support

   AUTHORITATIVE RELATIONSHIP:

   Place of Seizure
        │
        ▼
      TARGET
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

   TARGET hotspot aggregation is geographic/address based.

   Example:

   Seizure A ─┐
   Seizure B ─┼── Same Place ── TARGET HOTSPOT
   Seizure C ─┘

   A single target hotspot may contain multiple PORs.

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
            "[OffenceTargetEngine] OffenceConstants unavailable."
        );

        return;

    }


    if (!Store) {

        console.error(
            "[OffenceTargetEngine] OffenceStore unavailable."
        );

        return;

    }


    if (!Geocoder) {

        console.error(
            "[OffenceTargetEngine] OffenceGeocoder unavailable."
        );

        return;

    }


    /* =====================================================
       3. MODULE
       ===================================================== */

    const TargetEngine = {};


    /* =====================================================
       4. MODULE INFORMATION
       ===================================================== */

    TargetEngine.VERSION =
        "2.0.0";


    TargetEngine.initialized =
        false;


    /* =====================================================
       5. TARGET HOTSPOT DATA

       Final hotspot:

       {
           id,
           key,

           type: "TARGET",

           name,
           address,
           normalizedAddress,

           latitude,
           longitude,

           geocodeStatus,
           geocodeSource,

           offenceCount,
           seizureCount,

           heatWeight,

           porKey,
           porKeys: [],
           porNos: [],

           caseIds: [],

           seizureIds: [],

           cases: [],
           seizures: []
       }

       IMPORTANT:

       porKeys is authoritative.

       caseIds is secondary.
       ===================================================== */

    TargetEngine.hotspots =
        [];


    /* =====================================================
       6. PRIMARY HOTSPOT INDEX

       hotspot key
           ↓
       hotspot
       ===================================================== */

    TargetEngine.index =
        new Map();


    /* =====================================================
       7. HOTSPOT ID INDEX

       hotspot ID
           ↓
       hotspot
       ===================================================== */

    TargetEngine.idIndex =
        new Map();


    /* =====================================================
       8. POR → TARGET INDEX

       AUTHORITATIVE

       porKey
           ↓
       [
           targetHotspot,
           ...
       ]
       ===================================================== */

    TargetEngine.porIndex =
        new Map();


    /* =====================================================
       9. CASE → TARGET INDEX

       SECONDARY ONLY

       CaseID
           ↓
       [
           targetHotspot,
           ...
       ]
       ===================================================== */

    TargetEngine.caseIndex =
        new Map();


    /* =====================================================
       10. SEIZURE → TARGET INDEX

       SeizureID
           ↓
       targetHotspot
       ===================================================== */

    TargetEngine.seizureIndex =
        new Map();


    /* =====================================================
       11. INITIALIZE
       ===================================================== */

    TargetEngine.init =
        function () {

            if (
                TargetEngine.initialized
            ) {

                return TargetEngine;

            }


            TargetEngine.initialized =
                true;


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(

                    "🔥 OffenceTargetEngine Ready",

                    {

                        version:
                            TargetEngine.VERSION,

                        authoritativeConnector:
                            "porKey"

                    }

                );

            }


            return TargetEngine;

        };


    /* =====================================================
       12. NORMALIZE GENERIC KEY
       ===================================================== */

    TargetEngine.normalizeKey =
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
       13. NORMALIZE POR KEY

       Prefer normalized porKey supplied by Normalizer.

       This is a safe fallback only.

       NO fuzzy POR matching occurs here.
       ===================================================== */

    TargetEngine.normalizePorKey =
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
       14. VALIDATE COORDINATES
       ===================================================== */

    TargetEngine.isValidCoordinate =
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
       15. CREATE COORDINATE KEY

       Coordinates rounded to 5 decimals.

       Example:

       26.5452211
       89.4800412

       becomes:

       26.54522|89.48004
       ===================================================== */

    TargetEngine.createCoordinateKey =
        function (

            latitude,

            longitude

        ) {

            if (
                !TargetEngine
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
       16. CREATE HOTSPOT KEY

       Geographic grouping strategy:

       1. normalized target address/location
       2. coordinates as fallback

       POR is NOT part of geographic hotspot key.

       Multiple PORs at the same target location should
       aggregate into ONE geographic hotspot.

       Example:

       POR-1 ─┐
       POR-2 ─┼── BHT-5 Compartment ── ONE TARGET
       POR-3 ─┘
       ===================================================== */

    TargetEngine.createHotspotKey =
        function (

            location

        ) {

            if (!location) {

                return "";

            }


            const address =

                TargetEngine
                    .normalizeKey(

                        location.normalizedAddress ||

                        location.rawAddress ||

                        location.address ||

                        location.name

                    );


            if (address) {

                return (

                    "TARGET::ADDRESS::" +

                    address

                );

            }


            const coordinateKey =

                TargetEngine
                    .createCoordinateKey(

                        location.latitude,

                        location.longitude

                    );


            if (coordinateKey) {

                return (

                    "TARGET::COORD::" +

                    coordinateKey

                );

            }


            return "";

        };


    /* =====================================================
       17. CREATE HOTSPOT ID
       ===================================================== */

    TargetEngine.createHotspotId =
        function (

            key

        ) {

            return (

                "OFFENCE_TARGET_" +

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
       18. ADD UNIQUE VALUE
       ===================================================== */

    TargetEngine.addUnique =
        function (

            array,

            value,

            normalizer =
                TargetEngine.normalizeKey

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
       19. ADD UNIQUE OBJECT
       ===================================================== */

    TargetEngine.addUniqueObject =
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

                TargetEngine
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

                            TargetEngine
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
       20. EXTRACT POR KEY

       Priority:

       resolvedTarget.porKey
       seizure.porKey
       case.porKey
       seizure.refPorNo
       seizure.porNo
       case.porNo
       case.refPorNo
       ===================================================== */

    TargetEngine.extractPorKey =
        function (

            resolvedTarget,

            caseRecord

        ) {

            const seizure =

                resolvedTarget
                    ?.seizure ||
                {};


            const raw =

                resolvedTarget
                    ?.porKey ||

                seizure
                    ?.porKey ||

                caseRecord
                    ?.porKey ||

                seizure
                    ?.refPorNo ||

                seizure
                    ?.porNo ||

                caseRecord
                    ?.porNo ||

                caseRecord
                    ?.refPorNo ||

                "";


            return TargetEngine
                .normalizePorKey(
                    raw
                );

        };


    /* =====================================================
       21. EXTRACT DISPLAY POR NUMBER
       ===================================================== */

    TargetEngine.extractPorNo =
        function (

            resolvedTarget,

            caseRecord

        ) {

            const seizure =

                resolvedTarget
                    ?.seizure ||
                {};


            return (

                resolvedTarget
                    ?.porNo ||

                resolvedTarget
                    ?.refPorNo ||

                seizure
                    ?.refPorNo ||

                seizure
                    ?.porNo ||

                caseRecord
                    ?.porNo ||

                caseRecord
                    ?.refPorNo ||

                ""

            );

        };


    /* =====================================================
       22. EXTRACT CASE ID

       SECONDARY ONLY
       ===================================================== */

    TargetEngine.extractCaseId =
        function (

            resolvedTarget,

            caseRecord

        ) {

            return (

                resolvedTarget
                    ?.caseId ||

                resolvedTarget
                    ?.seizure
                    ?.caseId ||

                caseRecord
                    ?.caseId ||

                caseRecord
                    ?.id ||

                ""

            );

        };


    /* =====================================================
       23. EXTRACT SEIZURE ID
       ===================================================== */

    TargetEngine.extractSeizureId =
        function (

            seizure

        ) {

            if (!seizure) {

                return "";

            }


            return (

                seizure.seizureId ||

                seizure.SeizureID ||

                seizure.id ||

                ""

            );

        };


    /* =====================================================
       24. CREATE EMPTY TARGET HOTSPOT
       ===================================================== */

    TargetEngine.createHotspot =
        function (

            location

        ) {

            const key =

                TargetEngine
                    .createHotspotKey(
                        location
                    );


            return {

                id:

                    TargetEngine
                        .createHotspotId(
                            key
                        ),

                key:
                    key,

                type:

                    Constants
                        .LOCATION_TYPE
                        ?.TARGET ||

                    "TARGET",

                name:

                    location.name ||

                    location.rawAddress ||

                    location.address ||

                    "Unknown Target",

                address:

                    location.rawAddress ||

                    location.address ||

                    location.name ||

                    "",

                normalizedAddress:

                    location.normalizedAddress ||

                    TargetEngine
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

                seizureCount:
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
                   CASE SECONDARY METADATA
                   ----------------------------------------- */

                caseIds:
                    [],

                /* -----------------------------------------
                   SEIZURE RELATIONSHIPS
                   ----------------------------------------- */

                seizureIds:
                    [],

                cases:
                    [],

                seizures:
                    []

            };

        };


    /* =====================================================
       25. ADD POR TO HOTSPOT
       ===================================================== */

    TargetEngine.addPor =
        function (

            hotspot,

            porKey,

            porNo

        ) {

            if (!hotspot) {

                return;

            }


            const normalizedPorKey =

                TargetEngine
                    .normalizePorKey(
                        porKey
                    );


            if (normalizedPorKey) {

                TargetEngine
                    .addUnique(

                        hotspot.porKeys,

                        normalizedPorKey,

                        TargetEngine
                            .normalizePorKey

                    );


                /*
                 * Convenience porKey:
                 *
                 * If exactly one POR exists at this hotspot,
                 * expose it directly.
                 *
                 * Multiple PORs:
                 * porKey = ""
                 * porKeys remains authoritative.
                 */

                hotspot.porKey =

                    hotspot.porKeys.length ===
                    1

                        ? hotspot.porKeys[0]

                        : "";

            }


            if (porNo) {

                TargetEngine
                    .addUnique(

                        hotspot.porNos,

                        porNo

                    );

            }

        };


    /* =====================================================
       26. ADD CASE TO HOTSPOT

       CaseID is secondary.
       ===================================================== */

    TargetEngine.addCase =
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

                TargetEngine
                    .addUnique(

                        hotspot.caseIds,

                        caseId

                    );

            }


            if (caseRecord) {

                TargetEngine
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
       27. ADD SEIZURE TO HOTSPOT
       ===================================================== */

    TargetEngine.addSeizure =
        function (

            hotspot,

            seizure

        ) {

            if (
                !hotspot ||
                !seizure
            ) {

                return;

            }


            const seizureId =

                TargetEngine
                    .extractSeizureId(
                        seizure
                    );


            if (seizureId) {

                TargetEngine
                    .addUnique(

                        hotspot.seizureIds,

                        seizureId

                    );

            }


            TargetEngine
                .addUniqueObject(

                    hotspot.seizures,

                    seizure,

                    function (
                        item
                    ) {

                        return (

                            TargetEngine
                                .extractSeizureId(
                                    item
                                ) ||

                            [

                                item.porKey ||
                                item.refPorNo ||
                                item.porNo ||
                                "",

                                item.seizureDate ||
                                "",

                                item.placeOfSeizure ||
                                ""

                            ].join(
                                "|"
                            )

                        );

                    }

                );

        };


    /* =====================================================
       28. ADD RESOLVED TARGET

       Expected:

       {
           location: {...},
           seizure: {...},
           porKey,
           porNo,
           caseId
       }

       caseRecord is OPTIONAL.

       This is important because a valid seizure may be
       linked through POR even when CaseID is absent,
       stale, or mismatched.
       ===================================================== */

    TargetEngine.addResolvedTarget =
        function (

            resolvedTarget,

            caseRecord =
                null

        ) {

            if (
                !resolvedTarget ||
                !resolvedTarget.location
            ) {

                return null;

            }


            const location =

                resolvedTarget.location;


            /* =============================================
               28.1 IGNORE UNRESOLVED LOCATION
               ============================================= */

            if (
                !TargetEngine
                    .isValidCoordinate(

                        location.latitude,

                        location.longitude

                    )
            ) {

                return null;

            }


            /* =============================================
               28.2 BUILD GEOGRAPHIC HOTSPOT KEY
               ============================================= */

            const key =

                TargetEngine
                    .createHotspotKey(
                        location
                    );


            if (!key) {

                return null;

            }


            /* =============================================
               28.3 GET / CREATE HOTSPOT
               ============================================= */

            let hotspot =

                TargetEngine.index
                    .get(
                        key
                    );


            if (!hotspot) {

                hotspot =

                    TargetEngine
                        .createHotspot(
                            location
                        );


                TargetEngine.index
                    .set(

                        key,

                        hotspot

                    );


                TargetEngine.hotspots
                    .push(
                        hotspot
                    );

            }


            /* =============================================
               28.4 EXTRACT AUTHORITATIVE POR
               ============================================= */

            const porKey =

                TargetEngine
                    .extractPorKey(

                        resolvedTarget,

                        caseRecord

                    );


            const porNo =

                TargetEngine
                    .extractPorNo(

                        resolvedTarget,

                        caseRecord

                    );


            TargetEngine
                .addPor(

                    hotspot,

                    porKey,

                    porNo

                );


            /* =============================================
               28.5 ADD SECONDARY CASE METADATA
               ============================================= */

            const caseId =

                TargetEngine
                    .extractCaseId(

                        resolvedTarget,

                        caseRecord

                    );


            TargetEngine
                .addCase(

                    hotspot,

                    caseRecord,

                    caseId

                );


            /* =============================================
               28.6 ADD SEIZURE
               ============================================= */

            TargetEngine
                .addSeizure(

                    hotspot,

                    resolvedTarget.seizure

                );


            /* =============================================
               28.7 UPDATE COUNTS

               offenceCount = UNIQUE POR COUNT

               seizureCount = UNIQUE SEIZURE COUNT

               Example:

               One POR
               2 seizure records
               same target location

               offenceCount = 1
               seizureCount = 2
               ============================================= */

            hotspot.offenceCount =

                hotspot.porKeys.length;


            /*
             * Legacy fallback:
             *
             * If an older dataset has no porKey yet,
             * use unique CaseIDs temporarily.
             */

            if (
                hotspot.offenceCount ===
                0
            ) {

                hotspot.offenceCount =

                    hotspot.caseIds.length;

            }


            hotspot.seizureCount =

                hotspot.seizureIds.length;


            /*
             * Some legacy seizure rows may not contain
             * seizureId.
             *
             * In that case preserve meaningful count using
             * unique seizure objects.
             */

            if (
                hotspot.seizureCount ===
                0
            ) {

                hotspot.seizureCount =

                    hotspot.seizures.length;

            }


            hotspot.heatWeight =

                hotspot.offenceCount;


            return hotspot;

        };


    /* =====================================================
       29. BUILD TARGET HOTSPOTS

       Input:
       GG.Offence.Geocoder.resolveAll()

       Expected context:

       {
           case,
           caseId,
           porKey,
           porNo,
           targets: [...]
       }

       IMPORTANT:

       context.case is NOT required.

       A POR-linked seizure remains valid even if its
       CaseID is missing or mismatched.
       ===================================================== */

    TargetEngine.build =
        function (

            resolvedContexts =
                []

        ) {

            TargetEngine
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


                const targets =

                    Array.isArray(
                        context.targets
                    )

                        ? context.targets

                        : [];


                for (
                    const target
                    of targets
                ) {

                    if (!target) {

                        continue;

                    }


                    /*
                     * Propagate POR metadata from context
                     * into target when Geocoder keeps POR
                     * at context level.
                     */

                    const enrichedTarget =

                        Object.assign(

                            {},

                            target,

                            {

                                porKey:

                                    target.porKey ||

                                    context.porKey ||

                                    context.refPorKey ||

                                    "",

                                porNo:

                                    target.porNo ||

                                    target.refPorNo ||

                                    context.porNo ||

                                    context.refPorNo ||

                                    "",

                                caseId:

                                    target.caseId ||

                                    context.caseId ||

                                    caseRecord
                                        ?.caseId ||

                                    ""

                            }

                        );


                    TargetEngine
                        .addResolvedTarget(

                            enrichedTarget,

                            caseRecord

                        );

                }

            }


            TargetEngine
                .rebuildIndexes();


            TargetEngine
                .calculateHeatWeights();


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(

                    "🔥 OffenceTargetEngine Built",

                    TargetEngine
                        .getStats()

                );

            }


            return TargetEngine.hotspots;

        };


    /* =====================================================
       30. BUILD DIRECTLY FROM STORE

       Store
         ↓
       Geocoder
         ↓
       TargetEngine
       ===================================================== */

    TargetEngine.buildFromStore =
        async function () {

            const resolvedContexts =

                await Geocoder
                    .resolveAll();


            return TargetEngine
                .build(
                    resolvedContexts
                );

        };


    /* =====================================================
       31. CALCULATE HEAT WEIGHTS

       offenceCount:
       Actual unique POR count.

       heatWeight:
       Normalized 0 → 1 intensity.
       ===================================================== */

    TargetEngine.calculateHeatWeights =
        function () {

            if (
                TargetEngine.hotspots
                    .length ===
                0
            ) {

                return;

            }


            const maxCount =

                Math.max(

                    ...TargetEngine.hotspots
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
                of TargetEngine.hotspots
            ) {

                hotspot.heatWeight =

                    maxCount > 0

                        ? hotspot.offenceCount /
                          maxCount

                        : 0;

            }

        };


    /* =====================================================
       32. ADD HOTSPOT TO MULTI INDEX
       ===================================================== */

    TargetEngine.addToMultiIndex =
        function (

            index,

            key,

            hotspot,

            normalizer =
                TargetEngine.normalizeKey

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
       33. REBUILD LOOKUP INDEXES
       ===================================================== */

    TargetEngine.rebuildIndexes =
        function () {

            TargetEngine.idIndex
                .clear();


            TargetEngine.porIndex
                .clear();


            TargetEngine.caseIndex
                .clear();


            TargetEngine.seizureIndex
                .clear();


            for (
                const hotspot
                of TargetEngine.hotspots
            ) {


                /* =========================================
                   HOTSPOT ID INDEX
                   ========================================= */

                TargetEngine.idIndex
                    .set(

                        TargetEngine
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

                    TargetEngine
                        .addToMultiIndex(

                            TargetEngine.porIndex,

                            porKey,

                            hotspot,

                            TargetEngine
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

                    TargetEngine
                        .addToMultiIndex(

                            TargetEngine.caseIndex,

                            caseId,

                            hotspot

                        );

                }


                /* =========================================
                   SEIZURE INDEX
                   ========================================= */

                for (
                    const seizureId
                    of hotspot.seizureIds
                ) {

                    const key =

                        TargetEngine
                            .normalizeKey(
                                seizureId
                            );


                    if (key) {

                        TargetEngine.seizureIndex
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
       34. GET ALL HOTSPOTS
       ===================================================== */

    TargetEngine.getHotspots =
        function () {

            return TargetEngine.hotspots;

        };


    /* =====================================================
       35. GET HOTSPOT BY ID
       ===================================================== */

    TargetEngine.getHotspotById =
        function (

            id

        ) {

            const key =

                TargetEngine
                    .normalizeKey(
                        id
                    );


            if (!key) {

                return null;

            }


            return (

                TargetEngine.idIndex
                    .get(
                        key
                    ) ||

                null

            );

        };


    /* =====================================================
       36. GET TARGETS BY POR

       PRIMARY LOOKUP
       ===================================================== */

    TargetEngine.getByPor =
        function (

            porKey

        ) {

            const key =

                TargetEngine
                    .normalizePorKey(
                        porKey
                    );


            if (!key) {

                return [];

            }


            return (

                TargetEngine.porIndex
                    .get(
                        key
                    ) ||

                []

            );

        };


    /* =====================================================
       37. ALIAS: GET BY POR KEY
       ===================================================== */

    TargetEngine.getByPorKey =
        function (

            porKey

        ) {

            return TargetEngine
                .getByPor(
                    porKey
                );

        };


    /* =====================================================
       38. GET TARGETS BY CASE ID

       SECONDARY LOOKUP
       ===================================================== */

    TargetEngine.getByCaseId =
        function (

            caseId

        ) {

            const key =

                TargetEngine
                    .normalizeKey(
                        caseId
                    );


            if (!key) {

                return [];

            }


            return (

                TargetEngine.caseIndex
                    .get(
                        key
                    ) ||

                []

            );

        };


    /* =====================================================
       39. GET TARGET BY SEIZURE ID
       ===================================================== */

    TargetEngine.getBySeizureId =
        function (

            seizureId

        ) {

            const key =

                TargetEngine
                    .normalizeKey(
                        seizureId
                    );


            if (!key) {

                return null;

            }


            return (

                TargetEngine.seizureIndex
                    .get(
                        key
                    ) ||

                null

            );

        };


    /* =====================================================
       40. GET HEATMAP DATA

       Leaflet.heat-compatible:

       [
           [latitude, longitude, weight],
           ...
       ]
       ===================================================== */

    TargetEngine.getHeatmapData =
        function () {

            return TargetEngine.hotspots

                .filter(

                    function (
                        hotspot
                    ) {

                        return TargetEngine
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
       41. GET MARKER DATA

       Full hotspot objects for clickable markers.
       ===================================================== */

    TargetEngine.getMarkerData =
        function () {

            return TargetEngine.hotspots

                .filter(

                    function (
                        hotspot
                    ) {

                        return TargetEngine
                            .isValidCoordinate(

                                hotspot.latitude,

                                hotspot.longitude

                            );

                    }

                );

        };


    /* =====================================================
       42. GET STORE POR CASCADE

       Supports possible Store API names.

       Preferred:
       Store.getCascadeByPor(porKey)
       ===================================================== */

    TargetEngine.getStorePorCascade =
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

                        "[OffenceTargetEngine] POR cascade lookup failed",

                        porKey,

                        error

                    );

                }


                return null;

            }

        };


    /* =====================================================
       43. GET TARGET CASCADE DATA

       TARGET CLICK FLOW:

       Target hotspot
            ↓
       porKeys[]
            ↓
       POR cascade
            ↓
       Case details
            ↓
       Accused
            ↓
       Witnesses
            ↓
       Seizures
            ↓
       Seized Articles

       A geographic target hotspot may contain multiple PORs.
       ===================================================== */

    TargetEngine.getCascadeData =
        function (

            hotspotId

        ) {

            const hotspot =

                TargetEngine
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

                    TargetEngine
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
                    "TARGET",

                hotspot:
                    hotspot,

                offenceCount:
                    hotspot.offenceCount,

                seizureCount:
                    hotspot.seizureCount,

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

                seizureIds:

                    [
                        ...hotspot.seizureIds
                    ],

                cases:

                    [
                        ...hotspot.cases
                    ],

                seizures:

                    [
                        ...hotspot.seizures
                    ],

                cascades:
                    cascades

            };

        };


    /* =====================================================
       44. GET POR CASCADE DATA DIRECTLY
       ===================================================== */

    TargetEngine.getPorCascadeData =
        function (

            porKey

        ) {

            const key =

                TargetEngine
                    .normalizePorKey(
                        porKey
                    );


            if (!key) {

                return null;

            }


            return {

                porKey:
                    key,

                targets:

                    TargetEngine
                        .getByPor(
                            key
                        ),

                cascade:

                    TargetEngine
                        .getStorePorCascade(
                            key
                        )

            };

        };


    /* =====================================================
       45. GET STATS
       ===================================================== */

    TargetEngine.getStats =
        function () {

            const uniquePorKeys =
                new Set();


            const uniqueCaseIds =
                new Set();


            const uniqueSeizureIds =
                new Set();


            let totalOffences =
                0;


            let totalSeizures =
                0;


            for (
                const hotspot
                of TargetEngine.hotspots
            ) {

                totalOffences +=

                    hotspot.offenceCount ||
                    0;


                totalSeizures +=

                    hotspot.seizureCount ||
                    0;


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

                            TargetEngine
                                .normalizeKey(
                                    caseId
                                )

                        );

                }


                for (
                    const seizureId
                    of hotspot.seizureIds
                ) {

                    uniqueSeizureIds
                        .add(

                            TargetEngine
                                .normalizeKey(
                                    seizureId
                                )

                        );

                }

            }


            return {

                version:
                    TargetEngine.VERSION,

                hotspots:

                    TargetEngine.hotspots
                        .length,

                totalOffences:
                    totalOffences,

                totalSeizures:
                    totalSeizures,

                uniquePorKeys:

                    uniquePorKeys
                        .size,

                linkedPORs:

                    TargetEngine.porIndex
                        .size,

                linkedCases:

                    uniqueCaseIds
                        .size,

                linkedSeizures:

                    uniqueSeizureIds
                        .size

            };

        };


    /* =====================================================
       46. RESET
       ===================================================== */

    TargetEngine.reset =
        function () {

            TargetEngine.hotspots =
                [];


            TargetEngine.index
                .clear();


            TargetEngine.idIndex
                .clear();


            TargetEngine.porIndex
                .clear();


            TargetEngine.caseIndex
                .clear();


            TargetEngine.seizureIndex
                .clear();


            return true;

        };


    /* =====================================================
       47. EXPORT
       ===================================================== */

    GG.Offence.TargetEngine =
        TargetEngine;


    /* =====================================================
       48. INITIALIZE
       ===================================================== */

    TargetEngine
        .init();


    /* =====================================================
       49. READY LOG
       ===================================================== */

    if (
        Constants.DEBUG
            ?.ENABLED
    ) {

        console.log(

            "🔥 OffenceTargetEngine Loaded",

            {

                version:
                    TargetEngine.VERSION,

                authoritativeConnector:
                    "porKey"

            }

        );

    }


})();
