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
