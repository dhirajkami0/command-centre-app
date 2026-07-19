/* =========================================================
   GreenGuard
   Offence Intelligence Module

   File:
   js/offence/offenceHeatmapEngine.js

   Version:
   2.0.0

   Purpose:
   - Coordinate SOURCE and TARGET hotspot engines
   - Build SOURCE and TARGET heatmap datasets
   - Maintain POR-authoritative spatial relationships
   - Prepare Leaflet.heat-compatible datasets
   - Preserve full hotspot metadata
   - Provide unified hotspot lookup
   - Provide POR-based cascade lookup
   - Provide secondary CaseID lookup
   - Build SOURCE → TARGET relationships by POR
   - Support incremental refresh

   AUTHORITATIVE RELATIONSHIP:

   SOURCE
   Accused Address
        │
        │
      porKey
        │
        ▼
   POR CASCADE
        │
        ├── Cases
        ├── Accused
        ├── Witnesses
        ├── Seizures
        └── Seized Articles
                │
                ▼
             TARGET
        Place of Seizure

   IMPORTANT:

   POR / porKey is the authoritative connector.

   CaseID:
   - May exist
   - May be missing
   - May be mismatched
   - Is secondary metadata only

   SeizureID:
   - Connects seizure → seized articles

   This module performs:
   - NO direct Leaflet rendering
   - NO popup HTML generation
   - NO DOM manipulation
   - NO Firestore queries
   - NO external geocoding API calls

   Dependencies:
   1. offenceConstants.js
   2. offenceStore.js
   3. offenceGeocoder.js
   4. offenceSourceEngine.js
   5. offenceTargetEngine.js
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


    const SourceEngine =
        GG.Offence.SourceEngine;


    const TargetEngine =
        GG.Offence.TargetEngine;


    if (!Constants) {

        console.error(
            "[OffenceHeatmapEngine] OffenceConstants unavailable."
        );

        return;

    }


    if (!Store) {

        console.error(
            "[OffenceHeatmapEngine] OffenceStore unavailable."
        );

        return;

    }


    if (!Geocoder) {

        console.error(
            "[OffenceHeatmapEngine] OffenceGeocoder unavailable."
        );

        return;

    }


    if (!SourceEngine) {

        console.error(
            "[OffenceHeatmapEngine] OffenceSourceEngine unavailable."
        );

        return;

    }


    if (!TargetEngine) {

        console.error(
            "[OffenceHeatmapEngine] OffenceTargetEngine unavailable."
        );

        return;

    }


    /* =====================================================
       3. MODULE
       ===================================================== */

    const HeatmapEngine = {};


    /* =====================================================
       4. MODULE INFORMATION
       ===================================================== */

    HeatmapEngine.VERSION =
        "2.0.0";


    HeatmapEngine.initialized =
        false;


    HeatmapEngine.building =
        false;


    HeatmapEngine.ready =
        false;


    HeatmapEngine.lastBuildAt =
        null;


    /* =====================================================
       5. DISPLAY MODES
       ===================================================== */

    HeatmapEngine.MODE =
        Object.freeze({

            SOURCE:
                "SOURCE",

            TARGET:
                "TARGET",

            BOTH:
                "BOTH",

            FLOW:
                "FLOW"

        });


    /* =====================================================
       6. CURRENT DISPLAY MODE
       ===================================================== */

    HeatmapEngine.mode =
        Constants.DEFAULT_MAP_MODE ||
        HeatmapEngine.MODE.BOTH;


    /* =====================================================
       7. MASTER SPATIAL DATA
       ===================================================== */

    HeatmapEngine.data = {

        resolvedContexts:
            [],

        sources:
            [],

        targets:
            [],

        links:
            []

    };


    /* =====================================================
       8. HOTSPOT INDEX

       hotspotId
           ↓
       {
           type,
           hotspot
       }
       ===================================================== */

    HeatmapEngine.hotspotIndex =
        new Map();


    /* =====================================================
       9. POR RELATION INDEX

       AUTHORITATIVE INDEX

       porKey
          ↓
       {
           porKey,
           porNo,

           cases: [],
           accused: [],
           witnesses: [],
           seizures: [],
           seizedArticles: [],

           sources: [],
           targets: []
       }

       This is the PRIMARY relationship index.
       ===================================================== */

    HeatmapEngine.porIndex =
        new Map();


    /* =====================================================
       10. CASE RELATION INDEX

       SECONDARY INDEX ONLY

       CaseID
          ↓
       {
           caseId,
           case,
           porKeys: [],
           sources: [],
           targets: []
       }

       CaseID is NOT used as the authoritative
       SOURCE → TARGET connector.
       ===================================================== */

    HeatmapEngine.caseIndex =
        new Map();


    /* =====================================================
       11. INITIALIZE
       ===================================================== */

    HeatmapEngine.init =
        function () {

            if (
                HeatmapEngine.initialized
            ) {

                return HeatmapEngine;

            }


            HeatmapEngine.initialized =
                true;


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(

                    "🔥 OffenceHeatmapEngine Ready",

                    {

                        version:
                            HeatmapEngine.VERSION,

                        relationshipModel:
                            Constants.RELATIONSHIP
                                ?.MODEL ||
                            "POR_AUTHORITATIVE"

                    }

                );

            }


            return HeatmapEngine;

        };


    /* =====================================================
       12. NORMALIZE GENERIC KEY
       ===================================================== */

    HeatmapEngine.normalizeKey =
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

                .toUpperCase();

        };


    /* =====================================================
       13. NORMALIZE POR KEY

       Prefer Normalizer-generated porKey.

       This fallback normalization is intentionally
       conservative.

       It does NOT attempt dangerous fuzzy POR matching.
       ===================================================== */

    HeatmapEngine.normalizePorKey =
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
       14. UNIQUE ARRAY
       ===================================================== */

    HeatmapEngine.unique =
        function (

            values

        ) {

            if (
                !Array.isArray(
                    values
                )
            ) {

                return [];

            }


            const seen =
                new Set();


            const output =
                [];


            for (
                const value
                of values
            ) {

                if (
                    value === null ||
                    value === undefined ||
                    value === ""
                ) {

                    continue;

                }


                const key =

                    typeof value ===
                    "object"

                        ? (
                            value.id ||
                            value.caseId ||
                            value.accusedId ||
                            value.witnessId ||
                            value.seizureId ||
                            value.articleId ||
                            JSON.stringify(
                                value
                            )
                        )

                        : String(
                            value
                        );


                if (
                    seen.has(
                        key
                    )
                ) {

                    continue;

                }


                seen.add(
                    key
                );


                output.push(
                    value
                );

            }


            return output;

        };


    /* =====================================================
       15. GET HOTSPOT POR KEYS

       Supports both current and legacy hotspot structures.
       ===================================================== */

    HeatmapEngine.getHotspotPorKeys =
        function (

            hotspot

        ) {

            if (!hotspot) {

                return [];

            }


            const keys =
                [];


            if (
                hotspot.porKey
            ) {

                keys.push(
                    hotspot.porKey
                );

            }


            if (
                Array.isArray(
                    hotspot.porKeys
                )
            ) {

                keys.push(
                    ...hotspot.porKeys
                );

            }


            if (
                hotspot.porNo
            ) {

                keys.push(
                    hotspot.porNo
                );

            }


            if (
                Array.isArray(
                    hotspot.porNos
                )
            ) {

                keys.push(
                    ...hotspot.porNos
                );

            }


            return HeatmapEngine
                .unique(

                    keys.map(

                        function (
                            key
                        ) {

                            return HeatmapEngine
                                .normalizePorKey(
                                    key
                                );

                        }

                    )

                )

                .filter(
                    Boolean
                );

        };


    /* =====================================================
       16. GET HOTSPOT CASE IDS
       ===================================================== */

    HeatmapEngine.getHotspotCaseIds =
        function (

            hotspot

        ) {

            if (!hotspot) {

                return [];

            }


            const ids =
                [];


            if (
                hotspot.caseId
            ) {

                ids.push(
                    hotspot.caseId
                );

            }


            if (
                Array.isArray(
                    hotspot.caseIds
                )
            ) {

                ids.push(
                    ...hotspot.caseIds
                );

            }


            return HeatmapEngine
                .unique(

                    ids.map(

                        function (
                            id
                        ) {

                            return HeatmapEngine
                                .normalizeKey(
                                    id
                                );

                        }

                    )

                )

                .filter(
                    Boolean
                );

        };


    /* =====================================================
       17. VALIDATE DISPLAY MODE
       ===================================================== */

    HeatmapEngine.isValidMode =
        function (

            mode

        ) {

            const normalized =

                HeatmapEngine
                    .normalizeKey(
                        mode
                    );


            return Object.values(

                HeatmapEngine.MODE

            ).includes(

                normalized

            );

        };


    /* =====================================================
       18. SET DISPLAY MODE
       ===================================================== */

    HeatmapEngine.setMode =
        function (

            mode

        ) {

            mode =

                HeatmapEngine
                    .normalizeKey(
                        mode
                    );


            if (
                !HeatmapEngine
                    .isValidMode(
                        mode
                    )
            ) {

                console.warn(

                    "[OffenceHeatmapEngine] Invalid mode:",

                    mode

                );


                return false;

            }


            HeatmapEngine.mode =
                mode;


            HeatmapEngine.dispatchEvent(

                "offence:heatmap-mode-changed",

                {

                    mode:
                        mode

                }

            );


            return true;

        };


    /* =====================================================
       19. GET DISPLAY MODE
       ===================================================== */

    HeatmapEngine.getMode =
        function () {

            return HeatmapEngine.mode;

        };


    /* =====================================================
       20. BUILD COMPLETE SPATIAL DATASET

       Pipeline:

       Store
         ↓
       Geocoder.resolveAll()
         ↓
       resolved POR contexts
         ↓
       SourceEngine.build()
         ↓
       TargetEngine.build()
         ↓
       rebuild POR indexes
         ↓
       build SOURCE → TARGET links
       ===================================================== */

    HeatmapEngine.build =
        async function () {

            if (
                HeatmapEngine.building
            ) {

                return {

                    success:
                        false,

                    reason:
                        "BUILD_IN_PROGRESS"

                };

            }


            HeatmapEngine.building =
                true;


            HeatmapEngine.ready =
                false;


            try {


                /* =============================================
                   20.1 RESOLVE SPATIAL CONTEXTS
                   ============================================= */

                const resolvedContexts =

                    await Geocoder
                        .resolveAll();


                HeatmapEngine.data
                    .resolvedContexts =

                    Array.isArray(
                        resolvedContexts
                    )

                        ? resolvedContexts

                        : [];


                /* =============================================
                   20.2 BUILD SOURCE HOTSPOTS
                   ============================================= */

                const sources =

                    SourceEngine
                        .build(

                            HeatmapEngine
                                .data
                                .resolvedContexts

                        );


                HeatmapEngine.data.sources =

                    Array.isArray(
                        sources
                    )

                        ? sources

                        : [];


                /* =============================================
                   20.3 BUILD TARGET HOTSPOTS
                   ============================================= */

                const targets =

                    TargetEngine
                        .build(

                            HeatmapEngine
                                .data
                                .resolvedContexts

                        );


                HeatmapEngine.data.targets =

                    Array.isArray(
                        targets
                    )

                        ? targets

                        : [];


                /* =============================================
                   20.4 REBUILD ALL INDEXES
                   ============================================= */

                HeatmapEngine
                    .rebuildIndexes();


                /* =============================================
                   20.5 BUILD POR SOURCE → TARGET LINKS
                   ============================================= */

                HeatmapEngine.data.links =

                    HeatmapEngine
                        .buildSourceTargetLinks();


                HeatmapEngine.ready =
                    true;


                HeatmapEngine.lastBuildAt =
                    new Date();


                const stats =

                    HeatmapEngine
                        .getStats();


                HeatmapEngine.dispatchEvent(

                    Constants.EVENTS
                        ?.HEATMAP_RENDERED ||

                    "offence:heatmapRendered",

                    stats

                );


                if (
                    Constants.DEBUG
                        ?.ENABLED
                ) {

                    console.log(

                        "🔥 OffenceHeatmapEngine Built",

                        stats

                    );

                }


                return {

                    success:
                        true,

                    stats:
                        stats,

                    sources:

                        HeatmapEngine
                            .data
                            .sources,

                    targets:

                        HeatmapEngine
                            .data
                            .targets,

                    links:

                        HeatmapEngine
                            .data
                            .links

                };

            }

            catch (
                error
            ) {

                HeatmapEngine.ready =
                    false;


                console.error(

                    "[OffenceHeatmapEngine] Build failed",

                    error

                );


                return {

                    success:
                        false,

                    error:
                        error

                };

            }

            finally {

                HeatmapEngine.building =
                    false;

            }

        };


    /* =====================================================
       21. REBUILD ALL INDEXES
       ===================================================== */

    HeatmapEngine.rebuildIndexes =
        function () {

            HeatmapEngine.hotspotIndex
                .clear();


            HeatmapEngine.porIndex
                .clear();


            HeatmapEngine.caseIndex
                .clear();


            /* =============================================
               21.1 SOURCE HOTSPOTS
               ============================================= */

            for (
                const hotspot
                of HeatmapEngine.data.sources
            ) {

                HeatmapEngine
                    .indexHotspot(

                        hotspot,

                        HeatmapEngine.MODE
                            .SOURCE

                    );

            }


            /* =============================================
               21.2 TARGET HOTSPOTS
               ============================================= */

            for (
                const hotspot
                of HeatmapEngine.data.targets
            ) {

                HeatmapEngine
                    .indexHotspot(

                        hotspot,

                        HeatmapEngine.MODE
                            .TARGET

                    );

            }


            /* =============================================
               21.3 HYDRATE POR CASCADES FROM STORE
               ============================================= */

            for (
                const [
                    porKey,
                    relation
                ]
                of HeatmapEngine.porIndex
            ) {

                HeatmapEngine
                    .hydratePorRelation(

                        porKey,

                        relation

                    );

            }


            /* =============================================
               21.4 HYDRATE SECONDARY CASE INDEX
               ============================================= */

            HeatmapEngine
                .hydrateCaseIndex();


            return true;

        };


    /* =====================================================
       22. INDEX HOTSPOT
       ===================================================== */

    HeatmapEngine.indexHotspot =
        function (

            hotspot,

            type

        ) {

            if (!hotspot) {

                return;

            }


            const hotspotId =

                HeatmapEngine
                    .normalizeKey(

                        hotspot.id

                    );


            if (
                hotspotId
            ) {

                HeatmapEngine.hotspotIndex
                    .set(

                        hotspotId,

                        {

                            type:
                                type,

                            hotspot:
                                hotspot

                        }

                    );

            }


            /* =============================================
               POR RELATIONSHIPS
               ============================================= */

            const porKeys =

                HeatmapEngine
                    .getHotspotPorKeys(
                        hotspot
                    );


            for (
                const porKey
                of porKeys
            ) {

                HeatmapEngine
                    .addPorRelation(

                        porKey,

                        type ===
                        HeatmapEngine.MODE.SOURCE

                            ? "sources"

                            : "targets",

                        hotspot

                    );

            }


            /* =============================================
               SECONDARY CASE RELATIONSHIPS
               ============================================= */

            const caseIds =

                HeatmapEngine
                    .getHotspotCaseIds(
                        hotspot
                    );


            for (
                const caseId
                of caseIds
            ) {

                HeatmapEngine
                    .addCaseRelation(

                        caseId,

                        type ===
                        HeatmapEngine.MODE.SOURCE

                            ? "sources"

                            : "targets",

                        hotspot,

                        porKeys

                    );

            }

        };


    /* =====================================================
       23. CREATE EMPTY POR RELATION
       ===================================================== */

    HeatmapEngine.createPorRelation =
        function (

            porKey

        ) {

            return {

                porKey:
                    porKey,

                porNo:
                    "",

                cases:
                    [],

                accused:
                    [],

                witnesses:
                    [],

                seizures:
                    [],

                seizedArticles:
                    [],

                sources:
                    [],

                targets:
                    []

            };

        };


    /* =====================================================
       24. ADD POR RELATION
       ===================================================== */

    HeatmapEngine.addPorRelation =
        function (

            porKey,

            relationType,

            hotspot

        ) {

            const key =

                HeatmapEngine
                    .normalizePorKey(
                        porKey
                    );


            if (!key) {

                return;

            }


            if (
                !HeatmapEngine.porIndex
                    .has(
                        key
                    )
            ) {

                HeatmapEngine.porIndex
                    .set(

                        key,

                        HeatmapEngine
                            .createPorRelation(
                                key
                            )

                    );

            }


            const relation =

                HeatmapEngine.porIndex
                    .get(
                        key
                    );


            if (
                !Array.isArray(
                    relation[
                        relationType
                    ]
                )
            ) {

                return;

            }


            const exists =

                relation[
                    relationType
                ]
                    .some(

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

                relation[
                    relationType
                ]
                    .push(
                        hotspot
                    );

            }

        };


    /* =====================================================
       25. GET STORE POR CASCADE

       Supports several possible Store method names so the
       engine remains compatible with the current Store and
       future naming refinements.
       ===================================================== */

    HeatmapEngine.getStorePorCascade =
        function (

            porKey

        ) {

            try {


                if (
                    typeof Store.getCascadeByPor ===
                    "function"
                ) {

                    return (

                        Store.getCascadeByPor(
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

                        Store.getPorCascade(
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

                        Store.getByPor(
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

                        "[OffenceHeatmapEngine] POR cascade lookup failed",

                        porKey,

                        error

                    );

                }


                return null;

            }

        };


    /* =====================================================
       26. HYDRATE POR RELATION FROM STORE
       ===================================================== */

    HeatmapEngine.hydratePorRelation =
        function (

            porKey,

            relation

        ) {

            if (!relation) {

                return;

            }


            const cascade =

                HeatmapEngine
                    .getStorePorCascade(
                        porKey
                    );


            if (!cascade) {

                return;

            }


            relation.porNo =

                cascade.porNo ||

                cascade.refPorNo ||

                relation.porNo ||

                "";


            relation.cases =

                HeatmapEngine.unique(

                    cascade.cases ||
                    []

                );


            relation.accused =

                HeatmapEngine.unique(

                    cascade.accused ||
                    []

                );


            relation.witnesses =

                HeatmapEngine.unique(

                    cascade.witnesses ||
                    []

                );


            relation.seizures =

                HeatmapEngine.unique(

                    cascade.seizures ||
                    []

                );


            relation.seizedArticles =

                HeatmapEngine.unique(

                    cascade.seizedArticles ||
                    cascade.articles ||
                    []

                );

        };


    /* =====================================================
       27. ADD SECONDARY CASE RELATION
       ===================================================== */

    HeatmapEngine.addCaseRelation =
        function (

            caseId,

            relationType,

            hotspot,

            porKeys =
                []

        ) {

            const key =

                HeatmapEngine
                    .normalizeKey(
                        caseId
                    );


            if (!key) {

                return;

            }


            if (
                !HeatmapEngine.caseIndex
                    .has(
                        key
                    )
            ) {

                HeatmapEngine.caseIndex
                    .set(

                        key,

                        {

                            caseId:
                                key,

                            case:
                                null,

                            porKeys:
                                [],

                            sources:
                                [],

                            targets:
                                []

                        }

                    );

            }


            const relation =

                HeatmapEngine.caseIndex
                    .get(
                        key
                    );


            relation.porKeys =

                HeatmapEngine.unique(

                    [

                        ...relation.porKeys,

                        ...porKeys

                    ]

                );


            if (
                !Array.isArray(
                    relation[
                        relationType
                    ]
                )
            ) {

                return;

            }


            const exists =

                relation[
                    relationType
                ]
                    .some(

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

                relation[
                    relationType
                ]
                    .push(
                        hotspot
                    );

            }

        };


    /* =====================================================
       28. HYDRATE SECONDARY CASE INDEX
       ===================================================== */

    HeatmapEngine.hydrateCaseIndex =
        function () {

            for (
                const [
                    caseKey,
                    relation
                ]
                of HeatmapEngine.caseIndex
            ) {

                if (
                    typeof Store.getCaseById ===
                    "function"
                ) {

                    relation.case =

                        Store
                            .getCaseById(
                                caseKey
                            ) ||

                        null;

                }

            }

        };


    /* =====================================================
       29. BUILD SOURCE → TARGET LINKS

       IMPORTANT:

       This is POR-based.

       NOT CaseID-based.

       If one POR has:

       2 source hotspots
       3 target hotspots

       Output:

       6 source-target links.
       ===================================================== */

    HeatmapEngine.buildSourceTargetLinks =
        function () {

            const links =
                [];


            const seen =
                new Set();


            for (
                const [
                    porKey,
                    relation
                ]
                of HeatmapEngine.porIndex
            ) {

                if (
                    !relation.sources.length ||
                    !relation.targets.length
                ) {

                    continue;

                }


                for (
                    const source
                    of relation.sources
                ) {

                    for (
                        const target
                        of relation.targets
                    ) {

                        const linkId =

                            [

                                porKey,

                                source.id,

                                target.id

                            ].join(
                                "::"
                            );


                        if (
                            seen.has(
                                linkId
                            )
                        ) {

                            continue;

                        }


                        seen.add(
                            linkId
                        );


                        links.push({

                            id:
                                linkId,

                            porKey:
                                porKey,

                            porNo:
                                relation.porNo ||
                                "",

                            caseIds:

                                HeatmapEngine
                                    .unique(

                                        [

                                            ...HeatmapEngine
                                                .getHotspotCaseIds(
                                                    source
                                                ),

                                            ...HeatmapEngine
                                                .getHotspotCaseIds(
                                                    target
                                                )

                                        ]

                                    ),

                            source:
                                source,

                            target:
                                target,

                            sourceId:
                                source.id,

                            targetId:
                                target.id,

                            sourceLat:

                                source.latitude ??
                                source.lat ??
                                null,

                            sourceLng:

                                source.longitude ??
                                source.lng ??
                                null,

                            targetLat:

                                target.latitude ??
                                target.lat ??
                                null,

                            targetLng:

                                target.longitude ??
                                target.lng ??
                                null

                        });

                    }

                }

            }


            return links;

        };


    /* =====================================================
       30. GET SOURCE → TARGET LINKS
       ===================================================== */

    HeatmapEngine.getSourceTargetLinks =
        function () {

            return [

                ...HeatmapEngine
                    .data
                    .links

            ];

        };


    /* =====================================================
       31. GET SOURCE HEAT DATA
       ===================================================== */

    HeatmapEngine.getSourceHeatData =
        function () {

            if (
                typeof SourceEngine.getHeatmapData ===
                "function"
            ) {

                return (

                    SourceEngine
                        .getHeatmapData() ||

                    []

                );

            }


            return [];

        };


    /* =====================================================
       32. GET TARGET HEAT DATA
       ===================================================== */

    HeatmapEngine.getTargetHeatData =
        function () {

            if (
                typeof TargetEngine.getHeatmapData ===
                "function"
            ) {

                return (

                    TargetEngine
                        .getHeatmapData() ||

                    []

                );

            }


            return [];

        };


    /* =====================================================
       33. GET HEAT DATA BY MODE

       SOURCE and TARGET remain separate.

       They must NOT be merged because the renderer may
       style them independently.
       ===================================================== */

    HeatmapEngine.getHeatData =
        function (

            mode =
                HeatmapEngine.mode

        ) {

            mode =

                HeatmapEngine
                    .normalizeKey(
                        mode
                    );


            if (
                !HeatmapEngine
                    .isValidMode(
                        mode
                    )
            ) {

                mode =
                    HeatmapEngine.MODE
                        .BOTH;

            }


            const result = {

                mode:
                    mode,

                sources:
                    [],

                targets:
                    [],

                links:
                    []

            };


            if (

                mode ===
                HeatmapEngine.MODE.SOURCE ||

                mode ===
                HeatmapEngine.MODE.BOTH ||

                mode ===
                HeatmapEngine.MODE.FLOW

            ) {

                result.sources =

                    HeatmapEngine
                        .getSourceHeatData();

            }


            if (

                mode ===
                HeatmapEngine.MODE.TARGET ||

                mode ===
                HeatmapEngine.MODE.BOTH ||

                mode ===
                HeatmapEngine.MODE.FLOW

            ) {

                result.targets =

                    HeatmapEngine
                        .getTargetHeatData();

            }


            if (
                mode ===
                HeatmapEngine.MODE.FLOW
            ) {

                result.links =

                    HeatmapEngine
                        .getSourceTargetLinks();

            }


            return result;

        };


    /* =====================================================
       34. GET MARKER DATA BY MODE
       ===================================================== */

    HeatmapEngine.getMarkerData =
        function (

            mode =
                HeatmapEngine.mode

        ) {

            mode =

                HeatmapEngine
                    .normalizeKey(
                        mode
                    );


            if (
                !HeatmapEngine
                    .isValidMode(
                        mode
                    )
            ) {

                mode =
                    HeatmapEngine.MODE
                        .BOTH;

            }


            const result = {

                mode:
                    mode,

                sources:
                    [],

                targets:
                    []

            };


            if (

                mode ===
                HeatmapEngine.MODE.SOURCE ||

                mode ===
                HeatmapEngine.MODE.BOTH ||

                mode ===
                HeatmapEngine.MODE.FLOW

            ) {

                result.sources =

                    typeof SourceEngine.getMarkerData ===
                    "function"

                        ? (
                            SourceEngine
                                .getMarkerData() ||
                            []
                        )

                        : HeatmapEngine
                            .data
                            .sources;

            }


            if (

                mode ===
                HeatmapEngine.MODE.TARGET ||

                mode ===
                HeatmapEngine.MODE.BOTH ||

                mode ===
                HeatmapEngine.MODE.FLOW

            ) {

                result.targets =

                    typeof TargetEngine.getMarkerData ===
                    "function"

                        ? (
                            TargetEngine
                                .getMarkerData() ||
                            []
                        )

                        : HeatmapEngine
                            .data
                            .targets;

            }


            return result;

        };


    /* =====================================================
       35. GET HOTSPOT BY ID
       ===================================================== */

    HeatmapEngine.getHotspotById =
        function (

            hotspotId

        ) {

            const key =

                HeatmapEngine
                    .normalizeKey(
                        hotspotId
                    );


            if (!key) {

                return null;

            }


            return (

                HeatmapEngine.hotspotIndex
                    .get(
                        key
                    ) ||

                null

            );

        };


    /* =====================================================
       36. GET POR RELATION
       ===================================================== */

    HeatmapEngine.getPorRelation =
        function (

            porKey

        ) {

            const key =

                HeatmapEngine
                    .normalizePorKey(
                        porKey
                    );


            if (!key) {

                return null;

            }


            return (

                HeatmapEngine.porIndex
                    .get(
                        key
                    ) ||

                null

            );

        };


    /* =====================================================
       37. GET ALL POR RELATIONS
       ===================================================== */

    HeatmapEngine.getPorRelations =
        function () {

            return Array.from(

                HeatmapEngine.porIndex
                    .values()

            );

        };


    /* =====================================================
       38. GET POR CASCADE

       This is the primary cascade lookup.

       Returns:

       POR
       ├── cases
       ├── accused
       ├── witnesses
       ├── seizures
       ├── seizedArticles
       ├── sources
       └── targets
       ===================================================== */

    HeatmapEngine.getPorCascade =
        function (

            porKey

        ) {

            const relation =

                HeatmapEngine
                    .getPorRelation(
                        porKey
                    );


            if (!relation) {

                return null;

            }


            return {

                porKey:
                    relation.porKey,

                porNo:
                    relation.porNo,

                cases:

                    [
                        ...relation.cases
                    ],

                accused:

                    [
                        ...relation.accused
                    ],

                witnesses:

                    [
                        ...relation.witnesses
                    ],

                seizures:

                    [
                        ...relation.seizures
                    ],

                seizedArticles:

                    [
                        ...relation.seizedArticles
                    ],

                sources:

                    [
                        ...relation.sources
                    ],

                targets:

                    [
                        ...relation.targets
                    ],

                counts: {

                    cases:
                        relation.cases.length,

                    accused:
                        relation.accused.length,

                    witnesses:
                        relation.witnesses.length,

                    seizures:
                        relation.seizures.length,

                    seizedArticles:
                        relation.seizedArticles.length,

                    sources:
                        relation.sources.length,

                    targets:
                        relation.targets.length

                }

            };

        };


    /* =====================================================
       39. GET HOTSPOT CASCADE DATA

       A hotspot may contain multiple PORs because several
       offences can aggregate into the same geographic
       hotspot.

       Therefore cascade result contains all related POR
       cascades.
       ===================================================== */

    HeatmapEngine.getCascadeData =
        function (

            hotspotId

        ) {

            const entry =

                HeatmapEngine
                    .getHotspotById(
                        hotspotId
                    );


            if (!entry) {

                return null;

            }


            const hotspot =
                entry.hotspot;


            const porKeys =

                HeatmapEngine
                    .getHotspotPorKeys(
                        hotspot
                    );


            const cascades =

                porKeys

                    .map(

                        function (
                            porKey
                        ) {

                            return HeatmapEngine
                                .getPorCascade(
                                    porKey
                                );

                        }

                    )

                    .filter(
                        Boolean
                    );


            return {

                type:
                    entry.type,

                hotspot:
                    hotspot,

                porKeys:
                    porKeys,

                cascades:
                    cascades,

                counts: {

                    pors:
                        porKeys.length,

                    cascades:
                        cascades.length

                }

            };

        };


    /* =====================================================
       40. GET CASE RELATION

       Secondary lookup only.
       ===================================================== */

    HeatmapEngine.getCaseRelation =
        function (

            caseId

        ) {

            const key =

                HeatmapEngine
                    .normalizeKey(
                        caseId
                    );


            if (!key) {

                return null;

            }


            return (

                HeatmapEngine.caseIndex
                    .get(
                        key
                    ) ||

                null

            );

        };


    /* =====================================================
       41. GET ALL CASE RELATIONS
       ===================================================== */

    HeatmapEngine.getCaseRelations =
        function () {

            return Array.from(

                HeatmapEngine.caseIndex
                    .values()

            );

        };


    /* =====================================================
       42. GET LINKS BY POR
       ===================================================== */

    HeatmapEngine.getLinksByPor =
        function (

            porKey

        ) {

            const key =

                HeatmapEngine
                    .normalizePorKey(
                        porKey
                    );


            if (!key) {

                return [];

            }


            return HeatmapEngine
                .data
                .links

                .filter(

                    function (
                        link
                    ) {

                        return (

                            HeatmapEngine
                                .normalizePorKey(
                                    link.porKey
                                ) ===
                            key

                        );

                    }

                );

        };


    /* =====================================================
       43. GET STATS
       ===================================================== */

    HeatmapEngine.getStats =
        function () {

            let sourceStats =
                {};


            let targetStats =
                {};


            if (
                typeof SourceEngine.getStats ===
                "function"
            ) {

                sourceStats =

                    SourceEngine
                        .getStats() ||
                    {};

            }


            if (
                typeof TargetEngine.getStats ===
                "function"
            ) {

                targetStats =

                    TargetEngine
                        .getStats() ||
                    {};

            }


            let porWithSources =
                0;


            let porWithTargets =
                0;


            let porWithSourceAndTarget =
                0;


            for (
                const relation
                of HeatmapEngine.porIndex
                    .values()
            ) {

                const hasSource =

                    relation.sources.length >
                    0;


                const hasTarget =

                    relation.targets.length >
                    0;


                if (hasSource) {

                    porWithSources++;

                }


                if (hasTarget) {

                    porWithTargets++;

                }


                if (
                    hasSource &&
                    hasTarget
                ) {

                    porWithSourceAndTarget++;

                }

            }


            return {

                version:
                    HeatmapEngine.VERSION,

                ready:
                    HeatmapEngine.ready,

                building:
                    HeatmapEngine.building,

                mode:
                    HeatmapEngine.mode,

                relationshipModel:

                    Constants.RELATIONSHIP
                        ?.MODEL ||

                    "POR_AUTHORITATIVE",

                resolvedContexts:

                    HeatmapEngine
                        .data
                        .resolvedContexts
                        .length,

                sourceHotspots:

                    HeatmapEngine
                        .data
                        .sources
                        .length,

                targetHotspots:

                    HeatmapEngine
                        .data
                        .targets
                        .length,

                sourceOffences:

                    sourceStats.totalOffences ??
                    sourceStats.offences ??
                    null,

                targetOffences:

                    targetStats.totalOffences ??
                    targetStats.offences ??
                    null,

                porRelations:

                    HeatmapEngine.porIndex
                        .size,

                porWithSources:
                    porWithSources,

                porWithTargets:
                    porWithTargets,

                porWithSourceAndTarget:
                    porWithSourceAndTarget,

                secondaryCaseRelations:

                    HeatmapEngine.caseIndex
                        .size,

                sourceTargetLinks:

                    HeatmapEngine
                        .data
                        .links
                        .length,

                lastBuildAt:

                    HeatmapEngine
                        .lastBuildAt

            };

        };


    /* =====================================================
       44. REFRESH

       Reuses Geocoder cache where available.
       ===================================================== */

    HeatmapEngine.refresh =
        async function () {

            return await HeatmapEngine
                .build();

        };


    /* =====================================================
       45. UPDATE STORE AND REFRESH

       Supports all five datasets:

       {
           cases,
           accused,
           witnesses,
           seizures,
           seizedArticles
       }
       ===================================================== */

    HeatmapEngine.update =
        async function (

            rawData =
                {}

        ) {

            if (
                typeof Store.update !==
                "function"
            ) {

                return {

                    success:
                        false,

                    reason:
                        "STORE_UPDATE_UNAVAILABLE"

                };

            }


            const updateResult =

                Store
                    .update(
                        rawData
                    );


            if (
                !updateResult ||
                updateResult.success !==
                true
            ) {

                return {

                    success:
                        false,

                    reason:
                        "STORE_UPDATE_FAILED",

                    store:
                        updateResult

                };

            }


            const buildResult =

                await HeatmapEngine
                    .refresh();


            return {

                success:

                    buildResult
                        ?.success ===
                    true,

                store:
                    updateResult,

                heatmap:
                    buildResult

            };

        };


    /* =====================================================
       46. RESET
       ===================================================== */

    HeatmapEngine.reset =
        function () {

            HeatmapEngine.data = {

                resolvedContexts:
                    [],

                sources:
                    [],

                targets:
                    [],

                links:
                    []

            };


            HeatmapEngine.hotspotIndex
                .clear();


            HeatmapEngine.porIndex
                .clear();


            HeatmapEngine.caseIndex
                .clear();


            if (
                typeof SourceEngine.reset ===
                "function"
            ) {

                SourceEngine
                    .reset();

            }


            if (
                typeof TargetEngine.reset ===
                "function"
            ) {

                TargetEngine
                    .reset();

            }


            HeatmapEngine.ready =
                false;


            HeatmapEngine.building =
                false;


            HeatmapEngine.lastBuildAt =
                null;


            return true;

        };


    /* =====================================================
       47. DISPATCH EVENT
       ===================================================== */

    HeatmapEngine.dispatchEvent =
        function (

            eventName,

            detail =
                {}

        ) {

            if (!eventName) {

                return;

            }


            try {

                window.dispatchEvent(

                    new CustomEvent(

                        eventName,

                        {

                            detail:
                                detail

                        }

                    )

                );

            }

            catch (
                error
            ) {

                if (
                    Constants.DEBUG
                        ?.ENABLED
                ) {

                    console.warn(

                        "[OffenceHeatmapEngine] Event dispatch failed",

                        eventName,

                        error

                    );

                }

            }

        };


    /* =====================================================
       48. EXPORT
       ===================================================== */

    GG.Offence.HeatmapEngine =
        HeatmapEngine;


    /* =====================================================
       49. INITIALIZE
       ===================================================== */

    HeatmapEngine
        .init();


    /* =====================================================
       50. READY LOG
       ===================================================== */

    if (
        Constants.DEBUG
            ?.ENABLED
    ) {

        console.log(

            "🔥 OffenceHeatmapEngine Loaded",

            {

                version:
                    HeatmapEngine.VERSION,

                mode:
                    HeatmapEngine.mode,

                authoritativeConnector:
                    "porKey"

            }

        );

    }


})();
