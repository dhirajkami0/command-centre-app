/* =========================================================
   GreenGuard
   Offence Intelligence Module

   File:
   js/offence/offenceHeatmapEngine.js

   Purpose:
   - Combine SOURCE and TARGET hotspots
   - Manage SOURCE / TARGET / BOTH display modes
   - Prepare Leaflet.heat-compatible data
   - Preserve full hotspot metadata
   - Provide unified click/cascade lookup
   - Provide case-to-source/target relationships
   - Support refresh when daily offence data changes

   IMPORTANT:
   - NO direct Leaflet rendering
   - NO popup HTML
   - NO DOM manipulation
   - NO geocoding API calls

   Dependencies:
   1. offenceConstants.js
   2. offenceNormalizer.js
   3. offenceStore.js
   4. offenceGeocoder.js
   5. offenceSourceEngine.js
   6. offenceTargetEngine.js
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
       4. MODULE INFO
       ===================================================== */

    HeatmapEngine.VERSION =
        "1.0.0";

    HeatmapEngine.initialized =
        false;

    HeatmapEngine.building =
        false;

    HeatmapEngine.ready =
        false;


    /* =====================================================
       5. DISPLAY MODES
       ===================================================== */

    HeatmapEngine.MODE = Object.freeze({

        SOURCE:
            "SOURCE",

        TARGET:
            "TARGET",

        BOTH:
            "BOTH"

    });


    /* =====================================================
       6. CURRENT MODE

       Default is BOTH because your map requirement is:

       SOURCE + TARGET visible together.
       ===================================================== */

    HeatmapEngine.mode =
        HeatmapEngine.MODE.BOTH;


    /* =====================================================
       7. MASTER DATA

       resolvedContexts:
           Complete geocoded case contexts.

       sources:
           Aggregated SOURCE hotspots.

       targets:
           Aggregated TARGET hotspots.
       ===================================================== */

    HeatmapEngine.data = {

        resolvedContexts: [],

        sources: [],

        targets: []

    };


    /* =====================================================
       8. UNIFIED HOTSPOT INDEX

       hotspot ID
            ↓
       {
           type,
           hotspot
       }
       ===================================================== */

    HeatmapEngine.hotspotIndex =
        new Map();


    /* =====================================================
       9. CASE RELATION INDEX

       CaseID
          ↓
       {
           case,
           sources: [],
           targets: []
       }

       Useful later for:

       Click case
          ↓
       Highlight source
          ↓
       Highlight target
       ===================================================== */

    HeatmapEngine.caseIndex =
        new Map();


    /* =====================================================
       10. INITIALIZE
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
                    "🔥 OffenceHeatmapEngine Ready"
                );

            }


            return HeatmapEngine;

        };


    /* =====================================================
       11. NORMALIZE KEY
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
       12. VALIDATE MODE
       ===================================================== */

    HeatmapEngine.isValidMode =
        function (

            mode

        ) {

            return Object.values(

                HeatmapEngine.MODE

            ).includes(

                HeatmapEngine
                    .normalizeKey(

                        mode

                    )

            );

        };


    /* =====================================================
       13. SET MODE
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
       14. GET MODE
       ===================================================== */

    HeatmapEngine.getMode =
        function () {

            return HeatmapEngine.mode;

        };


    /* =====================================================
       15. BUILD COMPLETE SPATIAL DATASET

       IMPORTANT:

       Geocoder.resolveAll() runs ONCE.

       The same resolved contexts are passed to BOTH:

       SourceEngine
       TargetEngine

       This prevents duplicate geocoding work.
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


            try {

                /* -------------------------
                   Resolve all case contexts
                   ------------------------- */

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


                /* -------------------------
                   Build SOURCE hotspots
                   ------------------------- */

                const sources =

                    SourceEngine
                        .build(

                            HeatmapEngine.data
                                .resolvedContexts

                        );


                /* -------------------------
                   Build TARGET hotspots
                   ------------------------- */

                const targets =

                    TargetEngine
                        .build(

                            HeatmapEngine.data
                                .resolvedContexts

                        );


                HeatmapEngine.data.sources =

                    Array.isArray(
                        sources
                    )

                        ? sources

                        : [];


                HeatmapEngine.data.targets =

                    Array.isArray(
                        targets
                    )

                        ? targets

                        : [];


                /* -------------------------
                   Build unified indexes
                   ------------------------- */

                HeatmapEngine
                    .rebuildIndexes();


                HeatmapEngine.ready =
                    true;


                const stats =

                    HeatmapEngine
                        .getStats();


                HeatmapEngine.dispatchEvent(

                    Constants.EVENTS
                        ?.HEATMAP_UPDATED ||

                    "offence:heatmap-updated",

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

                        HeatmapEngine.data
                            .sources,

                    targets:

                        HeatmapEngine.data
                            .targets

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
       16. REBUILD INDEXES
       ===================================================== */

    HeatmapEngine.rebuildIndexes =
        function () {

            HeatmapEngine.hotspotIndex
                .clear();


            HeatmapEngine.caseIndex
                .clear();


            /* =================================================
               SOURCE HOTSPOTS
               ================================================= */

            for (

                const hotspot

                of HeatmapEngine.data.sources

            ) {

                HeatmapEngine.hotspotIndex
                    .set(

                        HeatmapEngine
                            .normalizeKey(

                                hotspot.id

                            ),

                        {

                            type:

                                HeatmapEngine
                                    .MODE
                                    .SOURCE,

                            hotspot:

                                hotspot

                        }

                    );


                for (

                    const caseId

                    of (
                        hotspot.caseIds ||
                        []
                    )

                ) {

                    HeatmapEngine
                        .addCaseRelation(

                            caseId,

                            "sources",

                            hotspot

                        );

                }

            }


            /* =================================================
               TARGET HOTSPOTS
               ================================================= */

            for (

                const hotspot

                of HeatmapEngine.data.targets

            ) {

                HeatmapEngine.hotspotIndex
                    .set(

                        HeatmapEngine
                            .normalizeKey(

                                hotspot.id

                            ),

                        {

                            type:

                                HeatmapEngine
                                    .MODE
                                    .TARGET,

                            hotspot:

                                hotspot

                        }

                    );


                for (

                    const caseId

                    of (
                        hotspot.caseIds ||
                        []
                    )

                ) {

                    HeatmapEngine
                        .addCaseRelation(

                            caseId,

                            "targets",

                            hotspot

                        );

                }

            }


            /* =================================================
               ATTACH CASE RECORDS
               ================================================= */

            for (

                const [

                    caseKey,

                    relation

                ]

                of HeatmapEngine.caseIndex

            ) {

                relation.case =

                    Store
                        .getCaseById(

                            caseKey

                        );

            }

        };


    /* =====================================================
       17. ADD CASE RELATION
       ===================================================== */

    HeatmapEngine.addCaseRelation =
        function (

            caseId,

            relationType,

            hotspot

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

                            case:
                                null,

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


            if (
                !exists
            ) {

                relation[
                    relationType
                ]
                    .push(

                        hotspot

                    );

            }

        };


    /* =====================================================
       18. GET SOURCE HEAT DATA
       ===================================================== */

    HeatmapEngine.getSourceHeatData =
        function () {

            return SourceEngine
                .getHeatmapData();

        };


    /* =====================================================
       19. GET TARGET HEAT DATA
       ===================================================== */

    HeatmapEngine.getTargetHeatData =
        function () {

            return TargetEngine
                .getHeatmapData();

        };


    /* =====================================================
       20. GET HEAT DATA BY MODE

       SOURCE:
       {
           sources: [...],
           targets: []
       }

       TARGET:
       {
           sources: [],
           targets: [...]
       }

       BOTH:
       {
           sources: [...],
           targets: [...]
       }

       IMPORTANT:

       SOURCE and TARGET remain separate arrays.

       We do NOT merge them into one heat layer because
       later the Leaflet renderer must be able to visually
       distinguish the two datasets.
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
                HeatmapEngine.MODE.BOTH

            ) {

                result.sources =

                    HeatmapEngine
                        .getSourceHeatData();

            }


            if (

                mode ===
                HeatmapEngine.MODE.TARGET ||

                mode ===
                HeatmapEngine.MODE.BOTH

            ) {

                result.targets =

                    HeatmapEngine
                        .getTargetHeatData();

            }


            return result;

        };


    /* =====================================================
       21. GET MARKER DATA BY MODE

       These full hotspot objects are used for
       clickable markers / hit targets.
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
                HeatmapEngine.MODE.BOTH

            ) {

                result.sources =

                    SourceEngine
                        .getMarkerData();

            }


            if (

                mode ===
                HeatmapEngine.MODE.TARGET ||

                mode ===
                HeatmapEngine.MODE.BOTH

            ) {

                result.targets =

                    TargetEngine
                        .getMarkerData();

            }


            return result;

        };


    /* =====================================================
       22. GET HOTSPOT BY ID
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


            return (

                HeatmapEngine.hotspotIndex
                    .get(
                        key
                    ) ||

                null

            );

        };


    /* =====================================================
       23. GET HOTSPOT CASCADE DATA

       Automatically detects whether clicked hotspot
       belongs to SOURCE or TARGET.
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


            if (
                !entry
            ) {

                return null;

            }


            if (

                entry.type ===
                HeatmapEngine.MODE.SOURCE

            ) {

                return {

                    type:

                        HeatmapEngine
                            .MODE
                            .SOURCE,

                    data:

                        SourceEngine
                            .getCascadeData(

                                hotspotId

                            )

                };

            }


            if (

                entry.type ===
                HeatmapEngine.MODE.TARGET

            ) {

                return {

                    type:

                        HeatmapEngine
                            .MODE
                            .TARGET,

                    data:

                        TargetEngine
                            .getCascadeData(

                                hotspotId

                            )

                };

            }


            return null;

        };


    /* =====================================================
       24. GET CASE RELATION

       Example:

       Case C-101
          │
          ├── SOURCE → accused home
          │
          └── TARGET → seizure location

       This becomes useful later for drawing
       source-to-target movement lines.
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
       25. GET ALL CASE RELATIONS
       ===================================================== */

    HeatmapEngine.getCaseRelations =
        function () {

            return Array.from(

                HeatmapEngine.caseIndex
                    .entries()

            ).map(

                function (

                    entry

                ) {

                    return {

                        caseId:

                            entry[0],

                        case:

                            entry[1].case,

                        sources:

                            entry[1].sources,

                        targets:

                            entry[1].targets

                    };

                }

            );

        };


    /* =====================================================
       26. GET SOURCE → TARGET LINKS

       Future use:

       Source address
             │
             │ offence relationship
             ▼
       Target offence/seizure location

       Output:

       [
           {
               caseId,
               source,
               target
           }
       ]

       If one case has:
       2 sources
       2 targets

       It produces:
       4 relationships.
       ===================================================== */

    HeatmapEngine.getSourceTargetLinks =
        function () {

            const links = [];


            for (

                const [

                    caseId,

                    relation

                ]

                of HeatmapEngine.caseIndex

            ) {

                for (

                    const source

                    of relation.sources

                ) {

                    for (

                        const target

                        of relation.targets

                    ) {

                        links.push({

                            caseId:

                                caseId,

                            case:

                                relation.case,

                            source:

                                source,

                            target:

                                target

                        });

                    }

                }

            }


            return links;

        };


    /* =====================================================
       27. GET STATS
       ===================================================== */

    HeatmapEngine.getStats =
        function () {

            const sourceStats =

                SourceEngine
                    .getStats();


            const targetStats =

                TargetEngine
                    .getStats();


            const links =

                HeatmapEngine
                    .getSourceTargetLinks();


            return {

                ready:

                    HeatmapEngine.ready,

                mode:

                    HeatmapEngine.mode,

                resolvedCases:

                    HeatmapEngine.data
                        .resolvedContexts
                        .length,

                sourceHotspots:

                    sourceStats.hotspots,

                targetHotspots:

                    targetStats.hotspots,

                sourceOffences:

                    sourceStats.totalOffences,

                targetOffences:

                    targetStats.totalOffences,

                linkedCases:

                    HeatmapEngine.caseIndex
                        .size,

                sourceTargetLinks:

                    links.length

            };

        };


    /* =====================================================
       28. REFRESH

       Use after daily offence data changes.

       Expected flow:

       New offence data
            ↓
       OffenceStore.update(...)
            ↓
       HeatmapEngine.refresh()
            ↓
       Geocoder cache reused
            ↓
       SOURCE rebuilt
            ↓
       TARGET rebuilt
            ↓
       Map renderer receives update event
       ===================================================== */

    HeatmapEngine.refresh =
        async function () {

            return await HeatmapEngine
                .build();

        };


    /* =====================================================
       29. UPDATE DATA AND REFRESH

       Convenience method for daily updates.

       Example:

       await GG.Offence.HeatmapEngine.update({
           cases: newCases,
           accused: newAccused,
           seizures: newSeizures
       });
       ===================================================== */

    HeatmapEngine.update =
        async function (

            rawData = {}

        ) {

            const updateResult =

                Store
                    .update(

                        rawData

                    );


            if (
                !updateResult ||
                updateResult.success !== true
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
                        ?.success === true,

                store:

                    updateResult,

                heatmap:

                    buildResult

            };

        };


    /* =====================================================
       30. RESET
       ===================================================== */

    HeatmapEngine.reset =
        function () {

            HeatmapEngine.data = {

                resolvedContexts:
                    [],

                sources:
                    [],

                targets:
                    []

            };


            HeatmapEngine.hotspotIndex
                .clear();


            HeatmapEngine.caseIndex
                .clear();


            SourceEngine
                .reset();


            TargetEngine
                .reset();


            HeatmapEngine.ready =
                false;


            return true;

        };


    /* =====================================================
       31. DISPATCH EVENT
       ===================================================== */

    HeatmapEngine.dispatchEvent =
        function (

            eventName,

            detail = {}

        ) {

            if (
                !eventName
            ) {

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
       32. EXPORT
       ===================================================== */

    GG.Offence.HeatmapEngine =
        HeatmapEngine;


    /* =====================================================
       33. INITIALIZE
       ===================================================== */

    HeatmapEngine.init();


    /* =====================================================
       34. READY LOG
       ===================================================== */

    if (
        Constants.DEBUG
            ?.ENABLED
    ) {

        console.log(

            "🔥 OffenceHeatmapEngine Loaded",

            HeatmapEngine

        );

    }


})();
