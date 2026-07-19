/* =========================================================
   GreenGuard
   Offence Intelligence Module

   File:
   js/offence/offenceCascadeController.js

   Version:
   2.0.0

   PURPOSE:
   ---------------------------------------------------------
   Central controller for offence heatmap drill-down.

   AUTHORITATIVE RELATIONSHIP:
   ---------------------------------------------------------

       POR No / Ref POR No
              │
              ▼
          normalized porKey
              │
              ├── offence_cases
              ├── offence_accused
              ├── offence_witnesses
              ├── offence_seizures
              ├── offence_seized_articles
              ├── SOURCE hotspots
              └── TARGET hotspots

   IMPORTANT:
   ---------------------------------------------------------
   POR is the authoritative connector.

   CaseID:
   - may exist
   - may be missing
   - may be historical
   - may not match between imported datasets

   Therefore CaseID is SECONDARY only.

   CASCADE FLOW:
   ---------------------------------------------------------

   SOURCE CLICK
        ↓
   Source Hotspot
        ↓
   POR Relation(s)
        ↓
   Case(s)
        ↓
   Accused
   Witnesses
   Seizures
        ↓
   Seized Articles
        ↓
   Related TARGET Hotspots


   TARGET CLICK
        ↓
   Target Hotspot
        ↓
   POR Relation(s)
        ↓
   Case(s)
        ↓
   Accused
   Witnesses
   Seizures
        ↓
   Seized Articles
        ↓
   Related SOURCE Hotspots


   DEPENDENCIES:
   ---------------------------------------------------------
   1. offenceConstants.js
   2. offenceStore.js
   3. offenceSourceEngine.js
   4. offenceTargetEngine.js
   5. offenceHeatmapEngine.js

   OPTIONAL:
   ---------------------------------------------------------
   offenceMapRenderer.js

   RESPONSIBILITIES:
   ---------------------------------------------------------
   - Listen for hotspot clicks
   - Resolve hotspot
   - Resolve POR relation
   - Build POR-authoritative cascade
   - Maintain drill-down state
   - Select POR
   - Select Case
   - Select Accused
   - Select Witness
   - Select Seizure
   - Select Seized Article
   - Emit UI-ready events

   DOES NOT:
   ---------------------------------------------------------
   - manipulate DOM
   - generate HTML
   - render Leaflet
   - geocode
   - access Firestore directly

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


    const SourceEngine =
        GG.Offence.SourceEngine;


    const TargetEngine =
        GG.Offence.TargetEngine;


    const HeatmapEngine =
        GG.Offence.HeatmapEngine;


    if (!Constants) {

        console.error(
            "[OffenceCascadeController] OffenceConstants unavailable."
        );

        return;

    }


    if (!Store) {

        console.error(
            "[OffenceCascadeController] OffenceStore unavailable."
        );

        return;

    }


    if (!HeatmapEngine) {

        console.error(
            "[OffenceCascadeController] OffenceHeatmapEngine unavailable."
        );

        return;

    }


    /* =====================================================
       3. MODULE
       ===================================================== */

    const CascadeController = {};


    CascadeController.VERSION =
        "2.0.0";


    CascadeController.initialized =
        false;


    CascadeController._eventsBound =
        false;


    /* =====================================================
       4. CASCADE LEVELS
       ===================================================== */

    CascadeController.LEVEL =
        Object.freeze({

            NONE:
                "NONE",

            HOTSPOT:
                "HOTSPOT",

            POR:
                "POR",

            CASE:
                "CASE",

            ACCUSED:
                "ACCUSED",

            WITNESS:
                "WITNESS",

            SEIZURE:
                "SEIZURE",

            ARTICLE:
                "ARTICLE"

        });


    /* =====================================================
       5. ENTRY TYPES
       ===================================================== */

    CascadeController.TYPE =
        Object.freeze({

            SOURCE:
                "SOURCE",

            TARGET:
                "TARGET"

        });


    /* =====================================================
       6. EVENTS
       ===================================================== */

    CascadeController.EVENTS =
        Object.freeze({

            OPENED:
                "offence:cascade-opened",

            POR_SELECTED:
                "offence:cascade-por-selected",

            CASE_SELECTED:
                "offence:cascade-case-selected",

            ACCUSED_SELECTED:
                "offence:cascade-accused-selected",

            WITNESS_SELECTED:
                "offence:cascade-witness-selected",

            SEIZURE_SELECTED:
                "offence:cascade-seizure-selected",

            ARTICLE_SELECTED:
                "offence:cascade-article-selected",

            LEVEL_CHANGED:
                "offence:cascade-level-changed",

            UPDATED:
                "offence:cascade-updated",

            CLOSED:
                "offence:cascade-closed"

        });


    /* =====================================================
       7. CREATE EMPTY STATE
       ===================================================== */

    CascadeController.createEmptyState =
        function () {

            return {

                open:
                    false,

                level:
                    CascadeController.LEVEL.NONE,

                entryType:
                    null,

                hotspotId:
                    null,

                hotspot:
                    null,

                latlng:
                    null,


                /* -----------------------------------------
                   POR
                   ----------------------------------------- */

                porKey:
                    null,

                porNo:
                    null,

                porKeys:
                    [],

                porRelations:
                    [],

                porRelation:
                    null,


                /* -----------------------------------------
                   CASE
                   ----------------------------------------- */

                caseId:
                    null,

                case:
                    null,

                cases:
                    [],


                /* -----------------------------------------
                   ACCUSED
                   ----------------------------------------- */

                accusedId:
                    null,

                accused:
                    null,

                accusedList:
                    [],


                /* -----------------------------------------
                   WITNESSES
                   ----------------------------------------- */

                witnessId:
                    null,

                witness:
                    null,

                witnesses:
                    [],


                /* -----------------------------------------
                   SEIZURES
                   ----------------------------------------- */

                seizureId:
                    null,

                seizure:
                    null,

                seizures:
                    [],


                /* -----------------------------------------
                   ARTICLES
                   ----------------------------------------- */

                articleId:
                    null,

                article:
                    null,

                seizedArticles:
                    [],


                /* -----------------------------------------
                   HEATMAP RELATIONS
                   ----------------------------------------- */

                sourceHotspots:
                    [],

                targetHotspots:
                    [],

                sourceTargetLinks:
                    []

            };

        };


    CascadeController.state =
        CascadeController
            .createEmptyState();


    /* =====================================================
       8. NORMALIZE KEY
       ===================================================== */

    CascadeController.normalizeKey =
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
       9. NORMALIZE POR KEY

       Prefer HeatmapEngine implementation because all
       SOURCE/TARGET indexes must use identical POR rules.
       ===================================================== */

    CascadeController.normalizePorKey =
        function (
            value
        ) {

            if (
                typeof HeatmapEngine.normalizePorKey ===
                "function"
            ) {

                return HeatmapEngine
                    .normalizePorKey(
                        value
                    );

            }


            return CascadeController
                .normalizeKey(
                    value
                )
                .replace(
                    /\s+/g,
                    " "
                );

        };


    /* =====================================================
       10. SAFE ARRAY
       ===================================================== */

    CascadeController.toArray =
        function (
            value
        ) {

            if (
                value === null ||
                value === undefined
            ) {

                return [];

            }


            return Array.isArray(
                value
            )
                ? value
                : [value];

        };


    /* =====================================================
       11. UNIQUE OBJECTS
       ===================================================== */

    CascadeController.uniqueObjects =
        function (
            records,
            keyGetter
        ) {

            const output =
                [];


            const seen =
                new Set();


            for (
                const record
                of CascadeController.toArray(
                    records
                )
            ) {

                if (!record) {

                    continue;

                }


                let key =
                    "";


                try {

                    key =
                        keyGetter
                            ? keyGetter(
                                record
                            )
                            : "";

                }

                catch (
                    error
                ) {

                    key =
                        "";

                }


                key =
                    CascadeController
                        .normalizeKey(
                            key
                        );


                if (!key) {

                    output.push(
                        record
                    );

                    continue;

                }


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
                    record
                );

            }


            return output;

        };


    /* =====================================================
       12. FIELD HELPERS
       ===================================================== */

    CascadeController.getCaseId =
        function (
            record
        ) {

            if (!record) {

                return "";

            }


            return (

                record.caseId ||

                record.caseID ||

                record.CaseID ||

                record.case_id ||

                record.id ||

                ""

            );

        };


    CascadeController.getPorNo =
        function (
            record
        ) {

            if (!record) {

                return "";

            }


            return (

                record.porNo ||

                record.porNumber ||

                record.refPorNo ||

                record.refPORNo ||

                record["POR No"] ||

                record["Ref POR No"] ||

                ""

            );

        };


    CascadeController.getAccusedId =
        function (
            record
        ) {

            if (!record) {

                return "";

            }


            return (

                record.accusedId ||

                record.accusedID ||

                record.AccusedID ||

                record.accused_id ||

                record.id ||

                ""

            );

        };


    CascadeController.getWitnessId =
        function (
            record
        ) {

            if (!record) {

                return "";

            }


            return (

                record.witnessId ||

                record.witnessID ||

                record.WitnessID ||

                record.witness_id ||

                record.id ||

                ""

            );

        };


    CascadeController.getSeizureId =
        function (
            record
        ) {

            if (!record) {

                return "";

            }


            return (

                record.seizureId ||

                record.seizureID ||

                record.SeizureID ||

                record.seizure_id ||

                record.id ||

                ""

            );

        };


    CascadeController.getArticleId =
        function (
            record
        ) {

            if (!record) {

                return "";

            }


            return (

                record.articleId ||

                record.articleID ||

                record.ArticleID ||

                record.article_id ||

                record.id ||

                ""

            );

        };


    /* =====================================================
       13. INITIALIZE
       ===================================================== */

    CascadeController.init =
        function () {

            if (
                CascadeController.initialized
            ) {

                return CascadeController;

            }


            CascadeController.initialized =
                true;


            CascadeController
                .bindEvents();


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(

                    "🔥 OffenceCascadeController Ready",

                    {

                        version:
                            CascadeController.VERSION,

                        relationship:
                            "POR_AUTHORITATIVE"

                    }

                );

            }


            return CascadeController;

        };


    /* =====================================================
       14. BIND EVENTS
       ===================================================== */

    CascadeController.bindEvents =
        function () {

            if (
                CascadeController._eventsBound
            ) {

                return;

            }


            CascadeController._eventsBound =
                true;


            window.addEventListener(

                Constants.EVENTS
                    ?.HOTSPOT_CLICK ||

                "offence:hotspot-click",

                CascadeController
                    .handleHotspotEvent

            );

        };


    /* =====================================================
       15. UNBIND EVENTS
       ===================================================== */

    CascadeController.unbindEvents =
        function () {

            if (
                !CascadeController._eventsBound
            ) {

                return;

            }


            window.removeEventListener(

                Constants.EVENTS
                    ?.HOTSPOT_CLICK ||

                "offence:hotspot-click",

                CascadeController
                    .handleHotspotEvent

            );


            CascadeController._eventsBound =
                false;

        };


    /* =====================================================
       16. HANDLE HOTSPOT EVENT
       ===================================================== */

/* =====================================================
   HANDLE HOTSPOT EVENT

   Receives the canonical event emitted by MapRenderer:

       offence:hotspot-click

   Supports:

   1. Individual SOURCE hotspot
   2. Individual TARGET hotspot
   3. Aggregated TARGET GIS polygon
   4. Future aggregated SOURCE GIS polygon

   IMPORTANT:

   The complete hotspot / polygon context must be
   forwarded into openHotspot().

   This allows aggregated polygons such as:

       RANGE::NMT
       RANGE::WRVK

   to enter the POR-authoritative cascade even when
   they are not individual HeatmapEngine hotspot IDs.
   ===================================================== */

CascadeController.handleHotspotEvent =
    function (

        event

    ) {

        /*---------------------------------------------
          1. Extract event detail
        ---------------------------------------------*/

        const detail =

            event
                ?.detail ||

            {};


        /*---------------------------------------------
          2. Extract canonical hotspot ID
        ---------------------------------------------*/

        const hotspotId =

            detail.hotspotId ||

            detail.hotspot?.hotspotId ||

            detail.hotspot?.id ||

            detail.polygon?.hotspotId ||

            detail.polygon?.id ||

            detail.polygon?.key ||

            null;


        if (
            !hotspotId
        ) {

            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.warn(

                    "[OffenceCascadeController] Hotspot event ignored: missing hotspotId",

                    {

                        detail:
                            detail

                    }

                );

            }


            return {

                success:
                    false,

                reason:
                    "HOTSPOT_ID_REQUIRED"

            };

        }


        /*---------------------------------------------
          3. Resolve canonical entry type

          Priority:

          event detail
              ↓
          hotspot
              ↓
          polygon
        ---------------------------------------------*/

        const entryType =

            detail.type ||

            detail.hotspot?.type ||

            detail.polygon?.type ||

            null;


        /*---------------------------------------------
          4. Resolve hotspot context

          MapRenderer.handlePolygonClick() should
          provide detail.hotspot.

          Fallback to polygon itself so an aggregated
          polygon is never lost between:

          MapRenderer
              ↓
          CustomEvent
              ↓
          CascadeController
        ---------------------------------------------*/

        const hotspot =

            detail.hotspot ||

            detail.polygon ||

            null;


        /*---------------------------------------------
          5. Resolve polygon context

          Individual point hotspot:
              null

          Aggregated GIS polygon:
              original polygon entry
        ---------------------------------------------*/

        const polygon =

            detail.polygon ||

            null;


        /*---------------------------------------------
          6. Resolve spatial type

          Examples:

          POINT
          COMPARTMENT
          RANGE
        ---------------------------------------------*/

        const spatialType =

            detail.spatialType ||

            polygon?.spatialType ||

            polygon?.resolutionType ||

            polygon?.resolution ||

            hotspot?.spatialType ||

            hotspot?.resolutionType ||

            hotspot?.resolution ||

            null;


        /*---------------------------------------------
          7. Resolve spatial name

          Examples:

          NMT
          WRVK
          compartment name
        ---------------------------------------------*/

        const spatialName =

            detail.spatialName ||

            polygon?.range ||

            polygon?.compartment ||

            polygon?.name ||

            hotspot?.range ||

            hotspot?.compartment ||

            hotspot?.name ||

            null;


        /*---------------------------------------------
          8. Resolve map coordinates

          Aggregated polygon clicks normally use
          Leaflet click coordinates.

          Individual hotspots may already provide
          lat/lng.
        ---------------------------------------------*/

        const latlng =

            detail.latlng ||

            (

                detail.lat != null &&
                detail.lng != null

                    ? {

                        lat:
                            detail.lat,

                        lng:
                            detail.lng

                    }

                    : null

            );


        /*---------------------------------------------
          9. Build complete openHotspot options

          IMPORTANT:

          hotspot:
              cascade relationship context

          polygon:
              original aggregated spatial context

          latlng:
              map interaction location

          spatialType:
              POINT / COMPARTMENT / RANGE

          spatialName:
              range / compartment / place name
        ---------------------------------------------*/

        const options = {

            hotspot:
                hotspot,

            polygon:
                polygon,

            latlng:
                latlng,

            spatialType:
                spatialType,

            spatialName:
                spatialName,

            /*-----------------------------------------
              Preserve POR metadata from event.

              openHotspot() primarily extracts POR
              information from hotspot, but retaining
              these values keeps the event contract
              complete for future use.
            -----------------------------------------*/

            porKey:

                detail.porKey ||

                hotspot?.porKey ||

                null,

            porKeys:

                Array.isArray(
                    detail.porKeys
                )

                    ? detail.porKeys

                    : Array.isArray(
                        hotspot?.porKeys
                    )

                        ? hotspot.porKeys

                        : [],

            /*-----------------------------------------
              Preserve Leaflet event when available.
            -----------------------------------------*/

            leafletEvent:

                detail.leafletEvent ||

                null,

            /*-----------------------------------------
              Preserve legacy cascade payload.

              This keeps compatibility with your older
              event contract, which already forwarded
              detail.cascade.
            -----------------------------------------*/

            cascade:

                detail.cascade ||

                null

        };


        /*---------------------------------------------
          10. Open canonical cascade
        ---------------------------------------------*/

        const result =

            CascadeController
                .openHotspot(

                    hotspotId,

                    entryType,

                    options

                );


        /*---------------------------------------------
          11. Debug
        ---------------------------------------------*/

        if (
            Constants.DEBUG
                ?.ENABLED
        ) {

            console.log(

                "🔥 Offence Hotspot Event Received",

                {

                    hotspotId:
                        hotspotId,

                    type:
                        entryType,

                    hasHotspot:
                        !!hotspot,

                    hasPolygon:
                        !!polygon,

                    spatialType:
                        spatialType,

                    spatialName:
                        spatialName,

                    porCount:

                        Array.isArray(
                            options.porKeys
                        )

                            ? options
                                .porKeys
                                .length

                            : 0,

                    latlng:
                        latlng,

                    success:
                        result?.success ===
                        true,

                    reason:

                        result?.reason ||

                        null

                }

            );

        }


        /*---------------------------------------------
          12. Return result

          Useful for direct/manual testing even though
          browser event dispatch does not consume the
          return value.
        ---------------------------------------------*/

        return result;

    };


    /* =====================================================
       17. EXTRACT POR KEYS FROM HOTSPOT

       POR is authoritative.

       Supports:
       - porKey
       - porKeys
       - porNo
       - refPorNo
       - related POR values
       ===================================================== */

    CascadeController.extractPorKeysFromHotspot =
        function (
            hotspot,
            entry
        ) {

            const raw =
                [];


            const add =
                function (
                    value
                ) {

                    if (
                        value === null ||
                        value === undefined ||
                        value === ""
                    ) {

                        return;

                    }


                    if (
                        Array.isArray(
                            value
                        )
                    ) {

                        value.forEach(
                            add
                        );

                        return;

                    }


                    raw.push(
                        value
                    );

                };


            add(
                hotspot?.porKey
            );


            add(
                hotspot?.porKeys
            );


            add(
                hotspot?.porNo
            );


            add(
                hotspot?.refPorNo
            );


            add(
                hotspot?.porNumbers
            );


            add(
                entry?.porKey
            );


            add(
                entry?.porKeys
            );


            const keys =
                [];


            const seen =
                new Set();


            for (
                const value
                of raw
            ) {

                const key =

                    CascadeController
                        .normalizePorKey(
                            value
                        );


                if (
                    !key ||
                    seen.has(
                        key
                    )
                ) {

                    continue;

                }


                seen.add(
                    key
                );


                keys.push(
                    key
                );

            }


            return keys;

        };


    /* =====================================================
       18. GET POR RELATION

       HeatmapEngine owns the unified POR relationship index.
       ===================================================== */

    CascadeController.getPorRelation =
        function (
            porKey
        ) {

            const key =

                CascadeController
                    .normalizePorKey(
                        porKey
                    );


            if (!key) {

                return null;

            }


            if (
                typeof HeatmapEngine.getByPor ===
                "function"
            ) {

                return (

                    HeatmapEngine
                        .getByPor(
                            key
                        ) ||

                    null

                );

            }


            if (
                typeof HeatmapEngine.getPorCascade ===
                "function"
            ) {

                return (

                    HeatmapEngine
                        .getPorCascade(
                            key
                        ) ||

                    null

                );

            }


            return null;

        };


    /* =====================================================
       19. OPEN HOTSPOT

       Main heatmap entry point.
       ===================================================== */

/*=========================================================
  OPEN HOTSPOT

  PURPOSE:

  Unified cascade entry point for:

  1. Individual SOURCE hotspot
  2. Individual TARGET hotspot
  3. Aggregated SOURCE polygon
     - future GIS support
  4. Aggregated TARGET polygon
     - current GIS support

  AUTHORITATIVE RELATIONSHIP:

      POR / porKey

  IMPORTANT:

  Aggregated polygons such as:

      RANGE::NMT
      RANGE::WRVK

  may NOT exist as normal individual hotspots inside:

      HeatmapEngine.getHotspotById()

  Therefore:

  1. Try HeatmapEngine lookup.
  2. Fall back to options.hotspot.
  3. Preserve existing hotspot behavior.
  4. Extract ALL POR keys.
  5. Build complete POR relationships.
  6. Aggregate cases / accused / witnesses /
     seizures / seized articles into cascade state.
=========================================================*/

CascadeController.openHotspot =
    function (

        hotspotId,

        entryType = null,

        options = {}

    ) {

        /*---------------------------------------------
          1. Validate hotspot ID
        ---------------------------------------------*/

        if (
            !hotspotId
        ) {

            return {

                success:
                    false,

                reason:
                    "HOTSPOT_ID_REQUIRED"

            };

        }


        /*---------------------------------------------
          2. Normalize options

          Prevent invalid/null options from breaking
          the cascade entry flow.
        ---------------------------------------------*/

        if (
            !options ||

            typeof options !==
                "object"
        ) {

            options = {};

        }


        /*---------------------------------------------
          3. Supplied hotspot

          MapRenderer may supply an aggregated polygon
          as the hotspot context.

          Example:

              {
                  id: "RANGE::NMT",
                  type: "TARGET",
                  porKeys: [...]
              }

          This is valid even if HeatmapEngine does not
          have RANGE::NMT as an individual hotspot ID.
        ---------------------------------------------*/

        const suppliedHotspot =

            options.hotspot ||

            null;


        /*---------------------------------------------
          4. Try canonical HeatmapEngine lookup

          Preserve existing behavior for normal
          SOURCE / TARGET hotspot clicks.
        ---------------------------------------------*/

        let engineEntry =

            null;


        if (

            HeatmapEngine &&

            typeof HeatmapEngine
                .getHotspotById ===
                "function"

        ) {

            try {

                engineEntry =

                    HeatmapEngine
                        .getHotspotById(

                            hotspotId

                        );

            }

            catch (
                error
            ) {

                /*
                 * Do not fail here.
                 *
                 * Aggregated polygons are allowed to
                 * continue using suppliedHotspot.
                 */

                engineEntry =
                    null;


                if (
                    Constants.DEBUG
                        ?.ENABLED
                ) {

                    console.warn(

                        "[OffenceCascadeController] Heatmap hotspot lookup failed",

                        {

                            hotspotId:
                                hotspotId,

                            error:
                                error

                        }

                    );

                }

            }

        }


        /*---------------------------------------------
          5. Resolve canonical entry

          Priority:

          HeatmapEngine entry
              ↓
          supplied aggregated hotspot

          This preserves the old flow while allowing
          aggregated polygons to enter the cascade.
        ---------------------------------------------*/

        const entry =

            engineEntry ||

            suppliedHotspot;


        if (
            !entry
        ) {

            return {

                success:
                    false,

                reason:
                    "HOTSPOT_NOT_FOUND"

            };

        }


        /*---------------------------------------------
          6. Resolve canonical hotspot

          For normal HeatmapEngine entries:

              entry.hotspot

          For aggregated polygons:

              options.hotspot

          Otherwise:

              entry
        ---------------------------------------------*/

        const hotspot =

            suppliedHotspot ||

            entry.hotspot ||

            entry;


        if (
            !hotspot
        ) {

            return {

                success:
                    false,

                reason:
                    "HOTSPOT_NOT_FOUND"

            };

        }


        /*---------------------------------------------
          7. Resolve SOURCE / TARGET type

          Priority:

          explicit entryType
              ↓
          supplied hotspot type
              ↓
          engine entry type
        ---------------------------------------------*/

        const type =

            CascadeController
                .normalizeKey(

                    entryType ||

                    hotspot.type ||

                    entry.type ||

                    ""

                );


        if (

            type !==
                CascadeController
                    .TYPE
                    .SOURCE &&

            type !==
                CascadeController
                    .TYPE
                    .TARGET

        ) {

            return {

                success:
                    false,

                reason:
                    "INVALID_HOTSPOT_TYPE"

            };

        }


        /*---------------------------------------------
          8. Extract complete POR set

          This supports:

          hotspot.porKey
          hotspot.porKeys

          plus any POR metadata available on entry.

          For aggregated TARGET polygons this is the
          critical relationship bridge:

          TARGET RANGE
              ↓
          POR[]
              ↓
          CASES[]
        ---------------------------------------------*/

        const porKeys =

            CascadeController
                .extractPorKeysFromHotspot(

                    hotspot,

                    entry

                );


        /*---------------------------------------------
          9. Build POR relationship graph

          One aggregated polygon can represent many
          POR records.

          Example:

          RANGE::NMT
              ↓
          POR-1
          POR-2
          POR-3
          ...
        ---------------------------------------------*/

        const porRelations = [];


        for (
            const porKey
            of porKeys
        ) {

            if (
                !porKey
            ) {

                continue;

            }


            const relation =

                CascadeController
                    .getPorRelation(

                        porKey

                    );


            if (
                relation
            ) {

                porRelations.push(

                    relation

                );

            }

        }


        /*---------------------------------------------
          10. Reset cascade state

          Every new SOURCE / TARGET click starts a new
          cascade context.
        ---------------------------------------------*/

        CascadeController.state =

            CascadeController
                .createEmptyState();


        const state =

            CascadeController
                .state;


        /*---------------------------------------------
          11. Establish hotspot state
        ---------------------------------------------*/

        state.open =

            true;


        state.level =

            CascadeController
                .LEVEL
                .HOTSPOT;


        state.entryType =

            type;


        state.hotspotId =

            hotspotId;


        state.hotspot =

            hotspot;


        /*---------------------------------------------
          12. Preserve optional polygon context

          This is additive and safe.

          Useful for:

          TARGET range
          TARGET compartment

          and future SOURCE GIS polygons.

          Only assign if these state properties are
          supported dynamically.
        ---------------------------------------------*/

        state.polygon =

            options.polygon ||

            hotspot.polygon ||

            null;


        state.spatialType =

            options.spatialType ||

            hotspot.spatialType ||

            hotspot.resolutionType ||

            hotspot.resolution ||

            null;


        state.spatialName =

            options.spatialName ||

            hotspot.range ||

            hotspot.compartment ||

            hotspot.name ||

            null;


        /*---------------------------------------------
          13. Resolve map coordinates

          Priority:

          Explicit Leaflet click coordinates
              ↓
          Hotspot coordinates
              ↓
          null

          Aggregated polygons may not have a single
          canonical lat/lng. The Leaflet click point
          can therefore be used for UI positioning.
        ---------------------------------------------*/

        const optionLatLng =

            options.latlng ||

            null;


        state.latlng =

            optionLatLng

                ? {

                    lat:

                        optionLatLng.lat ??

                        optionLatLng.latitude ??

                        null,

                    lng:

                        optionLatLng.lng ??

                        optionLatLng.longitude ??

                        null

                }

                : {

                    lat:

                        hotspot?.latitude ??

                        hotspot?.lat ??

                        null,

                    lng:

                        hotspot?.longitude ??

                        hotspot?.lng ??

                        null

                };


        /*---------------------------------------------
          14. Store complete POR context
        ---------------------------------------------*/

        state.porKeys =

            porKeys;


        state.porRelations =

            porRelations;


        /*---------------------------------------------
          15. Aggregate complete hotspot relationship
              data into cascade state

          Expected aggregation:

          PORs
              ↓
          Cases
              ↓
          Accused
          Witnesses
          Seizures
              ↓
          Seized Articles

          Existing aggregation function remains the
          authority for relationship aggregation.
        ---------------------------------------------*/

        CascadeController
            .aggregateRelationsIntoState(

                porRelations

            );


        /*---------------------------------------------
          16. Single POR optimization

          If hotspot represents exactly one POR,
          establish POR context automatically.

          IMPORTANT:

          Keep level = HOTSPOT.

          This allows UI to show hotspot summary and
          cascading buttons before drilling deeper.
        ---------------------------------------------*/

        if (
            porRelations.length ===
                1
        ) {

            state.porRelation =

                porRelations[0];


            state.porKey =

                porRelations[0]
                    .porKey ||

                porKeys[0] ||

                null;


            state.porNo =

                porRelations[0]
                    .porNo ||

                null;

        }


        /*---------------------------------------------
          17. Multiple POR hotspot

          Do NOT arbitrarily select one POR.

          The hotspot remains the active parent
          context and UI can expose:

              PORs
              Cases
              Case Details

          through cascading navigation.
        ---------------------------------------------*/

        else {

            state.porRelation =

                null;


            state.porKey =

                null;


            state.porNo =

                null;

        }


        /*---------------------------------------------
          18. Build canonical hotspot payload
        ---------------------------------------------*/

        const payload =

            CascadeController
                .buildHotspotPayload();


        /*---------------------------------------------
          19. Dispatch OPENED event
        ---------------------------------------------*/

        CascadeController
            .dispatchEvent(

                CascadeController
                    .EVENTS
                    .OPENED,

                payload

            );


        /*---------------------------------------------
          20. Dispatch general cascade update
        ---------------------------------------------*/

        CascadeController
            .dispatchUpdated();


        /*---------------------------------------------
          21. Debug
        ---------------------------------------------*/

        if (
            Constants.DEBUG
                ?.ENABLED
        ) {

            console.log(

                "🔥 Offence Cascade Hotspot Opened",

                {

                    hotspotId:
                        hotspotId,

                    type:
                        type,

                    source:

                        engineEntry

                            ? "HEATMAP_ENGINE"

                            : "SUPPLIED_HOTSPOT",

                    aggregatedPolygon:

                        !engineEntry &&
                        !!suppliedHotspot,

                    spatialType:
                        state.spatialType,

                    spatialName:
                        state.spatialName,

                    porCount:
                        porKeys.length,

                    relationCount:
                        porRelations.length,

                    porKeys:
                        porKeys,

                    hotspot:
                        hotspot

                }

            );

        }


        /*---------------------------------------------
          22. Return canonical result
        ---------------------------------------------*/

        return {

            success:
                true,

            data:
                payload

        };

    };


    /* =====================================================
       20. AGGREGATE POR RELATIONS INTO STATE
       ===================================================== */

    CascadeController.aggregateRelationsIntoState =
        function (
            relations
        ) {

            const state =
                CascadeController.state;


            let cases =
                [];


            let accused =
                [];


            let witnesses =
                [];


            let seizures =
                [];


            let articles =
                [];


            let sources =
                [];


            let targets =
                [];


            for (
                const relation
                of CascadeController.toArray(
                    relations
                )
            ) {

                if (!relation) {

                    continue;

                }


                cases.push(
                    ...CascadeController.toArray(
                        relation.cases
                    )
                );


                accused.push(
                    ...CascadeController.toArray(
                        relation.accused
                    )
                );


                witnesses.push(
                    ...CascadeController.toArray(
                        relation.witnesses
                    )
                );


                seizures.push(
                    ...CascadeController.toArray(
                        relation.seizures
                    )
                );


                articles.push(
                    ...CascadeController.toArray(
                        relation.seizedArticles
                    )
                );


                sources.push(
                    ...CascadeController.toArray(
                        relation.sources
                    )
                );


                targets.push(
                    ...CascadeController.toArray(
                        relation.targets
                    )
                );

            }


            state.cases =

                CascadeController
                    .uniqueObjects(

                        cases,

                        CascadeController
                            .getCaseId

                    );


            state.accusedList =

                CascadeController
                    .uniqueObjects(

                        accused,

                        CascadeController
                            .getAccusedId

                    );


            state.witnesses =

                CascadeController
                    .uniqueObjects(

                        witnesses,

                        CascadeController
                            .getWitnessId

                    );


            state.seizures =

                CascadeController
                    .uniqueObjects(

                        seizures,

                        CascadeController
                            .getSeizureId

                    );


            state.seizedArticles =

                CascadeController
                    .uniqueObjects(

                        articles,

                        CascadeController
                            .getArticleId

                    );


            state.sourceHotspots =
                sources;


            state.targetHotspots =
                targets;


            state.sourceTargetLinks =

                CascadeController
                    .buildSourceTargetLinks(

                        sources,

                        targets,

                        relations

                    );

        };


    /* =====================================================
       21. SELECT POR
       ===================================================== */

    CascadeController.selectPor =
        function (
            porKey
        ) {

            if (
                !CascadeController.state.open
            ) {

                return {

                    success:
                        false,

                    reason:
                        "CASCADE_NOT_OPEN"

                };

            }


            const key =

                CascadeController
                    .normalizePorKey(
                        porKey
                    );


            if (!key) {

                return {

                    success:
                        false,

                    reason:
                        "POR_REQUIRED"

                };

            }


            const relation =

                CascadeController
                    .getPorRelation(
                        key
                    );


            if (!relation) {

                return {

                    success:
                        false,

                    reason:
                        "POR_RELATION_NOT_FOUND"

                };

            }


            const state =
                CascadeController.state;


            state.level =
                CascadeController
                    .LEVEL
                    .POR;


            state.porKey =
                key;


            state.porNo =

                relation.porNo ||

                null;


            state.porRelation =
                relation;


            CascadeController
                .aggregateRelationsIntoState(
                    [relation]
                );


            CascadeController
                .clearRecordSelections();


            const payload =

                CascadeController
                    .buildPorPayload();


            CascadeController
                .dispatchEvent(

                    CascadeController
                        .EVENTS
                        .POR_SELECTED,

                    payload

                );


            CascadeController
                .dispatchLevelChanged();


            CascadeController
                .dispatchUpdated();


            return {

                success:
                    true,

                data:
                    payload

            };

        };


    /* =====================================================
       22. SELECT CASE

       Case selection is a UI drill-down.

       POR remains the relationship authority.
       ===================================================== */

    CascadeController.selectCase =
        function (
            caseId
        ) {

            if (
                !CascadeController.state.open
            ) {

                return {

                    success:
                        false,

                    reason:
                        "CASCADE_NOT_OPEN"

                };

            }


            const caseRecord =

                CascadeController
                    .findRecord(

                        CascadeController
                            .state
                            .cases,

                        caseId,

                        CascadeController
                            .getCaseId

                    ) ||

                CascadeController
                    .getCaseFromStore(
                        caseId
                    );


            if (!caseRecord) {

                return {

                    success:
                        false,

                    reason:
                        "CASE_NOT_FOUND"

                };

            }


            const state =
                CascadeController.state;


            state.level =
                CascadeController
                    .LEVEL
                    .CASE;


            state.caseId =

                CascadeController
                    .getCaseId(
                        caseRecord
                    );


            state.case =
                caseRecord;


            /*
             * IMPORTANT:
             *
             * Resolve child records by POR first.
             */

            const casePorKey =

                CascadeController
                    .normalizePorKey(

                        CascadeController
                            .getPorNo(
                                caseRecord
                            ) ||

                        state.porKey

                    );


            if (
                casePorKey &&
                casePorKey !==
                    state.porKey
            ) {

                const relation =

                    CascadeController
                        .getPorRelation(
                            casePorKey
                        );


                if (relation) {

                    state.porKey =
                        casePorKey;


                    state.porNo =
                        relation.porNo ||
                        null;


                    state.porRelation =
                        relation;


                    CascadeController
                        .aggregateRelationsIntoState(
                            [relation]
                        );

                }

            }


            state.case =
                caseRecord;


            state.caseId =

                CascadeController
                    .getCaseId(
                        caseRecord
                    );


            state.accusedId =
                null;


            state.accused =
                null;


            state.witnessId =
                null;


            state.witness =
                null;


            state.seizureId =
                null;


            state.seizure =
                null;


            state.articleId =
                null;


            state.article =
                null;


            const payload =

                CascadeController
                    .buildCasePayload();


            CascadeController
                .dispatchEvent(

                    CascadeController
                        .EVENTS
                        .CASE_SELECTED,

                    payload

                );


            CascadeController
                .dispatchLevelChanged();


            CascadeController
                .dispatchUpdated();


            return {

                success:
                    true,

                data:
                    payload

            };

        };


    /* =====================================================
       23. SELECT ACCUSED
       ===================================================== */

    CascadeController.selectAccused =
        function (
            accusedId
        ) {

            const accused =

                CascadeController
                    .findRecord(

                        CascadeController
                            .state
                            .accusedList,

                        accusedId,

                        CascadeController
                            .getAccusedId

                    );


            if (!accused) {

                return {

                    success:
                        false,

                    reason:
                        "ACCUSED_NOT_FOUND"

                };

            }


            CascadeController.state.level =

                CascadeController
                    .LEVEL
                    .ACCUSED;


            CascadeController.state.accusedId =

                CascadeController
                    .getAccusedId(
                        accused
                    );


            CascadeController.state.accused =
                accused;


            const payload = {

                ...CascadeController
                    .buildCasePayload(),

                selectedAccused:
                    accused

            };


            CascadeController
                .dispatchEvent(

                    CascadeController
                        .EVENTS
                        .ACCUSED_SELECTED,

                    payload

                );


            CascadeController
                .dispatchLevelChanged();


            CascadeController
                .dispatchUpdated();


            return {

                success:
                    true,

                data:
                    payload

            };

        };


    /* =====================================================
       24. SELECT WITNESS
       ===================================================== */

    CascadeController.selectWitness =
        function (
            witnessId
        ) {

            const witness =

                CascadeController
                    .findRecord(

                        CascadeController
                            .state
                            .witnesses,

                        witnessId,

                        CascadeController
                            .getWitnessId

                    );


            if (!witness) {

                return {

                    success:
                        false,

                    reason:
                        "WITNESS_NOT_FOUND"

                };

            }


            CascadeController.state.level =

                CascadeController
                    .LEVEL
                    .WITNESS;


            CascadeController.state.witnessId =

                CascadeController
                    .getWitnessId(
                        witness
                    );


            CascadeController.state.witness =
                witness;


            const payload = {

                ...CascadeController
                    .buildCasePayload(),

                selectedWitness:
                    witness

            };


            CascadeController
                .dispatchEvent(

                    CascadeController
                        .EVENTS
                        .WITNESS_SELECTED,

                    payload

                );


            CascadeController
                .dispatchLevelChanged();


            CascadeController
                .dispatchUpdated();


            return {

                success:
                    true,

                data:
                    payload

            };

        };


    /* =====================================================
       25. SELECT SEIZURE
       ===================================================== */

    CascadeController.selectSeizure =
        function (
            seizureId
        ) {

            const seizure =

                CascadeController
                    .findRecord(

                        CascadeController
                            .state
                            .seizures,

                        seizureId,

                        CascadeController
                            .getSeizureId

                    );


            if (!seizure) {

                return {

                    success:
                        false,

                    reason:
                        "SEIZURE_NOT_FOUND"

                };

            }


            const state =
                CascadeController.state;


            state.level =

                CascadeController
                    .LEVEL
                    .SEIZURE;


            state.seizureId =

                CascadeController
                    .getSeizureId(
                        seizure
                    );


            state.seizure =
                seizure;


            /*
             * Filter articles for selected seizure.
             *
             * POR remains authoritative for the overall
             * relationship, SeizureID is valid for this
             * direct child relationship.
             */

            const selectedSeizureKey =

                CascadeController
                    .normalizeKey(
                        state.seizureId
                    );


            const articlesForSeizure =

                state.seizedArticles
                    .filter(

                        function (
                            article
                        ) {

                            return (

                                CascadeController
                                    .normalizeKey(

                                        article.seizureId ||

                                        article.seizureID ||

                                        article.SeizureID

                                    ) ===

                                selectedSeizureKey

                            );

                        }

                    );


            const payload = {

                ...CascadeController
                    .buildCasePayload(),

                selectedSeizure:
                    seizure,

                seizureArticles:
                    articlesForSeizure

            };


            CascadeController
                .dispatchEvent(

                    CascadeController
                        .EVENTS
                        .SEIZURE_SELECTED,

                    payload

                );


            CascadeController
                .dispatchLevelChanged();


            CascadeController
                .dispatchUpdated();


            return {

                success:
                    true,

                data:
                    payload

            };

        };


    /* =====================================================
       26. SELECT ARTICLE
       ===================================================== */

    CascadeController.selectArticle =
        function (
            articleId
        ) {

            const article =

                CascadeController
                    .findRecord(

                        CascadeController
                            .state
                            .seizedArticles,

                        articleId,

                        CascadeController
                            .getArticleId

                    );


            if (!article) {

                return {

                    success:
                        false,

                    reason:
                        "ARTICLE_NOT_FOUND"

                };

            }


            CascadeController.state.level =

                CascadeController
                    .LEVEL
                    .ARTICLE;


            CascadeController.state.articleId =

                CascadeController
                    .getArticleId(
                        article
                    );


            CascadeController.state.article =
                article;


            const payload = {

                ...CascadeController
                    .buildCasePayload(),

                selectedArticle:
                    article

            };


            CascadeController
                .dispatchEvent(

                    CascadeController
                        .EVENTS
                        .ARTICLE_SELECTED,

                    payload

                );


            CascadeController
                .dispatchLevelChanged();


            CascadeController
                .dispatchUpdated();


            return {

                success:
                    true,

                data:
                    payload

            };

        };


    /* =====================================================
       27. BUILD SOURCE → TARGET LINKS

       Links are generated by shared POR relation.

       NOT CaseID.
       ===================================================== */

    CascadeController.buildSourceTargetLinks =
        function (
            sources,
            targets,
            relations
        ) {

            const links =
                [];


            for (
                const relation
                of CascadeController.toArray(
                    relations
                )
            ) {

                if (!relation) {

                    continue;

                }


                const porKey =

                    CascadeController
                        .normalizePorKey(
                            relation.porKey
                        );


                const relationSources =

                    CascadeController
                        .toArray(
                            relation.sources
                        );


                const relationTargets =

                    CascadeController
                        .toArray(
                            relation.targets
                        );


                for (
                    const source
                    of relationSources
                ) {

                    for (
                        const target
                        of relationTargets
                    ) {

                        links.push({

                            porKey:
                                porKey,

                            porNo:
                                relation.porNo ||
                                null,

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
       28. FIND RECORD
       ===================================================== */

    CascadeController.findRecord =
        function (
            records,
            id,
            idGetter
        ) {

            if (
                !Array.isArray(
                    records
                ) ||
                typeof idGetter !==
                    "function"
            ) {

                return null;

            }


            const key =

                CascadeController
                    .normalizeKey(
                        id
                    );


            if (!key) {

                return null;

            }


            return (

                records.find(

                    function (
                        record
                    ) {

                        return (

                            CascadeController
                                .normalizeKey(

                                    idGetter(
                                        record
                                    )

                                ) ===

                            key

                        );

                    }

                ) ||

                null

            );

        };


    /* =====================================================
       29. STORE CASE FALLBACK
       ===================================================== */

    CascadeController.getCaseFromStore =
        function (
            caseId
        ) {

            if (
                typeof Store.getCaseById ===
                "function"
            ) {

                const result =

                    Store
                        .getCaseById(
                            caseId
                        );


                if (result) {

                    return result;

                }

            }


            if (
                typeof Store.getCase ===
                "function"
            ) {

                const result =

                    Store
                        .getCase(
                            caseId
                        );


                if (result) {

                    return result;

                }

            }


            return null;

        };


    /* =====================================================
       30. CLEAR RECORD SELECTIONS
       ===================================================== */

    CascadeController.clearRecordSelections =
        function () {

            const state =
                CascadeController.state;


            state.caseId =
                null;


            state.case =
                null;


            state.accusedId =
                null;


            state.accused =
                null;


            state.witnessId =
                null;


            state.witness =
                null;


            state.seizureId =
                null;


            state.seizure =
                null;


            state.articleId =
                null;


            state.article =
                null;

        };


    /* =====================================================
       31. BACK TO HOTSPOT
       ===================================================== */

    CascadeController.backToHotspot =
        function () {

            if (
                !CascadeController.state.open
            ) {

                return false;

            }


            CascadeController.state.level =

                CascadeController
                    .LEVEL
                    .HOTSPOT;


            CascadeController.state.porKey =
                null;


            CascadeController.state.porNo =
                null;


            CascadeController.state.porRelation =
                null;


            CascadeController
                .clearRecordSelections();


            CascadeController
                .aggregateRelationsIntoState(

                    CascadeController
                        .state
                        .porRelations

                );


            CascadeController
                .dispatchLevelChanged();


            CascadeController
                .dispatchUpdated();


            return true;

        };


    /* =====================================================
       32. BACK TO POR
       ===================================================== */

    CascadeController.backToPor =
        function () {

            const state =
                CascadeController.state;


            if (
                !state.porKey
            ) {

                return CascadeController
                    .backToHotspot();

            }


            state.level =

                CascadeController
                    .LEVEL
                    .POR;


            CascadeController
                .clearRecordSelections();


            CascadeController
                .dispatchLevelChanged();


            CascadeController
                .dispatchUpdated();


            return true;

        };


    /* =====================================================
       33. BACK TO CASE
       ===================================================== */

    CascadeController.backToCase =
        function () {

            if (
                !CascadeController.state.case
            ) {

                return CascadeController
                    .backToPor();

            }


            CascadeController.state.level =

                CascadeController
                    .LEVEL
                    .CASE;


            CascadeController.state.accusedId =
                null;


            CascadeController.state.accused =
                null;


            CascadeController.state.witnessId =
                null;


            CascadeController.state.witness =
                null;


            CascadeController.state.seizureId =
                null;


            CascadeController.state.seizure =
                null;


            CascadeController.state.articleId =
                null;


            CascadeController.state.article =
                null;


            CascadeController
                .dispatchLevelChanged();


            CascadeController
                .dispatchUpdated();


            return true;

        };


    /* =====================================================
       34. BUILD HOTSPOT PAYLOAD
       ===================================================== */

    CascadeController.buildHotspotPayload =
        function () {

            const state =
                CascadeController.state;


            return {

                level:
                    state.level,

                entryType:
                    state.entryType,

                hotspotId:
                    state.hotspotId,

                hotspot:
                    state.hotspot,

                latlng:
                    state.latlng,

                porCount:
                    state.porRelations.length,

                porKeys:
                    [...state.porKeys],

                porRelations:
                    [...state.porRelations],

                caseCount:
                    state.cases.length,

                cases:
                    [...state.cases],

                accusedCount:
                    state.accusedList.length,

                witnessCount:
                    state.witnesses.length,

                seizureCount:
                    state.seizures.length,

                seizedArticleCount:
                    state.seizedArticles.length,

                sourceHotspots:
                    [...state.sourceHotspots],

                targetHotspots:
                    [...state.targetHotspots]

            };

        };


    /* =====================================================
       35. BUILD POR PAYLOAD
       ===================================================== */

    CascadeController.buildPorPayload =
        function () {

            const state =
                CascadeController.state;


            return {

                level:
                    state.level,

                entryType:
                    state.entryType,

                hotspot:
                    state.hotspot,

                porKey:
                    state.porKey,

                porNo:
                    state.porNo,

                relation:
                    state.porRelation,

                cases:
                    [...state.cases],

                accused:
                    [...state.accusedList],

                witnesses:
                    [...state.witnesses],

                seizures:
                    [...state.seizures],

                seizedArticles:
                    [...state.seizedArticles],

                sourceHotspots:
                    [...state.sourceHotspots],

                targetHotspots:
                    [...state.targetHotspots],

                sourceTargetLinks:
                    [...state.sourceTargetLinks]

            };

        };


    /* =====================================================
       36. BUILD CASE PAYLOAD
       ===================================================== */

    CascadeController.buildCasePayload =
        function () {

            const state =
                CascadeController.state;


            return {

                level:
                    state.level,

                entryType:
                    state.entryType,

                hotspot:
                    state.hotspot,


                /* POR authority */

                porKey:
                    state.porKey,

                porNo:
                    state.porNo,


                /* Selected case */

                caseId:
                    state.caseId,

                case:
                    state.case,


                /* Full POR-linked datasets */

                cases:
                    [...state.cases],

                accusedCount:
                    state.accusedList.length,

                accused:
                    [...state.accusedList],

                witnessCount:
                    state.witnesses.length,

                witnesses:
                    [...state.witnesses],

                seizureCount:
                    state.seizures.length,

                seizures:
                    [...state.seizures],

                seizedArticleCount:
                    state.seizedArticles.length,

                seizedArticles:
                    [...state.seizedArticles],


                /* Geography */

                sourceHotspots:
                    [...state.sourceHotspots],

                targetHotspots:
                    [...state.targetHotspots],

                sourceTargetLinks:
                    [...state.sourceTargetLinks],


                /* Current selections */

                selectedAccused:
                    state.accused,

                selectedWitness:
                    state.witness,

                selectedSeizure:
                    state.seizure,

                selectedArticle:
                    state.article

            };

        };


    /* =====================================================
       37. GET STATE
       ===================================================== */

    CascadeController.getState =
        function () {

            const state =
                CascadeController.state;


            return {

                ...state,

                porKeys:
                    [...state.porKeys],

                porRelations:
                    [...state.porRelations],

                cases:
                    [...state.cases],

                accusedList:
                    [...state.accusedList],

                witnesses:
                    [...state.witnesses],

                seizures:
                    [...state.seizures],

                seizedArticles:
                    [...state.seizedArticles],

                sourceHotspots:
                    [...state.sourceHotspots],

                targetHotspots:
                    [...state.targetHotspots],

                sourceTargetLinks:
                    [...state.sourceTargetLinks]

            };

        };


    /* =====================================================
       38. GET CURRENT POR
       ===================================================== */

    CascadeController.getCurrentPor =
        function () {

            return {

                porKey:
                    CascadeController
                        .state
                        .porKey,

                porNo:
                    CascadeController
                        .state
                        .porNo,

                relation:
                    CascadeController
                        .state
                        .porRelation

            };

        };


    /* =====================================================
       39. IS OPEN
       ===================================================== */

    CascadeController.isOpen =
        function () {

            return (

                CascadeController
                    .state
                    .open === true

            );

        };


    /* =====================================================
       40. GET LEVEL
       ===================================================== */

    CascadeController.getLevel =
        function () {

            return CascadeController
                .state
                .level;

        };


    /* =====================================================
       41. CLOSE
       ===================================================== */

    CascadeController.close =
        function () {

            const previousState =

                CascadeController
                    .getState();


            CascadeController.state =

                CascadeController
                    .createEmptyState();


            CascadeController
                .dispatchEvent(

                    CascadeController
                        .EVENTS
                        .CLOSED,

                    {

                        previousState:
                            previousState

                    }

                );


            return true;

        };


    /* =====================================================
       42. DISPATCH LEVEL CHANGED
       ===================================================== */

    CascadeController.dispatchLevelChanged =
        function () {

            CascadeController
                .dispatchEvent(

                    CascadeController
                        .EVENTS
                        .LEVEL_CHANGED,

                    {

                        level:

                            CascadeController
                                .state
                                .level,

                        state:

                            CascadeController
                                .getState()

                    }

                );

        };


    /* =====================================================
       43. DISPATCH UPDATED
       ===================================================== */

    CascadeController.dispatchUpdated =
        function () {

            CascadeController
                .dispatchEvent(

                    CascadeController
                        .EVENTS
                        .UPDATED,

                    {

                        state:

                            CascadeController
                                .getState()

                    }

                );

        };


    /* =====================================================
       44. DISPATCH EVENT
       ===================================================== */

    CascadeController.dispatchEvent =
        function (
            eventName,
            detail = {}
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

                        "[OffenceCascadeController] Event dispatch failed",

                        eventName,

                        error

                    );

                }

            }

        };


    /* =====================================================
       45. RESET
       ===================================================== */

    CascadeController.reset =
        function () {

            CascadeController.state =

                CascadeController
                    .createEmptyState();


            return true;

        };


    /* =====================================================
       46. DESTROY
       ===================================================== */

    CascadeController.destroy =
        function () {

            CascadeController
                .unbindEvents();


            CascadeController
                .reset();


            CascadeController.initialized =
                false;


            return true;

        };


    /* =====================================================
       47. EXPORT
       ===================================================== */

    GG.Offence.CascadeController =
        CascadeController;


    /* =====================================================
       48. INITIALIZE
       ===================================================== */

    CascadeController
        .init();


    /* =====================================================
       49. READY LOG
       ===================================================== */

    if (
        Constants.DEBUG
            ?.ENABLED
    ) {

        console.log(

            "🔥 OffenceCascadeController Loaded",

            {

                version:
                    CascadeController.VERSION,

                connector:
                    "POR",

                module:
                    CascadeController

            }

        );

    }


})();
