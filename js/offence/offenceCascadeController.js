/* =========================================================
   GreenGuard
   Offence Intelligence Module

   File:
   js/offence/offenceCascadeController.js

   Purpose:
   - Listen for offence hotspot clicks
   - Handle SOURCE and TARGET hotspot drill-down
   - Maintain cascading selection state
   - Resolve hotspot → cases
   - Resolve case → accused
   - Resolve case → seizures
   - Resolve case → source hotspots
   - Resolve case → target hotspots
   - Preserve SOURCE / TARGET entry context
   - Emit UI-ready cascade events
   - Support future panel / card / popup renderer

   Cascade Flow:

   SOURCE CLICK
       ↓
   Source Hotspot
       ↓
   Cases linked to source
       ↓
   Selected Case
       ↓
   Case Details
       ↓
   Accused
       ↓
   Seizures
       ↓
   Related Target Hotspots

   TARGET CLICK
       ↓
   Target Hotspot
       ↓
   Cases linked to target
       ↓
   Selected Case
       ↓
   Case Details
       ↓
   Accused
       ↓
   Seizures
       ↓
   Related Source Hotspots

   Dependencies:
   1. offenceConstants.js
   2. offenceStore.js
   3. offenceSourceEngine.js
   4. offenceTargetEngine.js
   5. offenceHeatmapEngine.js
   6. offenceMapRenderer.js

   IMPORTANT:
   - NO DOM manipulation
   - NO HTML generation
   - NO Leaflet rendering
   - NO geocoding
   - NO direct database calls

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


    if (!SourceEngine) {

        console.error(
            "[OffenceCascadeController] OffenceSourceEngine unavailable."
        );

        return;

    }


    if (!TargetEngine) {

        console.error(
            "[OffenceCascadeController] OffenceTargetEngine unavailable."
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


    /* =====================================================
       4. MODULE INFO
       ===================================================== */

    CascadeController.VERSION =
        "1.0.0";

    CascadeController.initialized =
        false;

    CascadeController._eventsBound =
        false;


    /* =====================================================
       5. CASCADE LEVELS
       ===================================================== */

    CascadeController.LEVEL = Object.freeze({

        NONE:
            "NONE",

        HOTSPOT:
            "HOTSPOT",

        CASE:
            "CASE",

        ACCUSED:
            "ACCUSED",

        SEIZURE:
            "SEIZURE"

    });


    /* =====================================================
       6. ENTRY TYPES
       ===================================================== */

    CascadeController.TYPE = Object.freeze({

        SOURCE:
            "SOURCE",

        TARGET:
            "TARGET"

    });


    /* =====================================================
       7. EVENTS

       UI modules should listen to these events.

       offence:cascade-opened

       offence:cascade-case-selected

       offence:cascade-accused-selected

       offence:cascade-seizure-selected

       offence:cascade-level-changed

       offence:cascade-closed
       ===================================================== */

    CascadeController.EVENTS = Object.freeze({

        OPENED:
            "offence:cascade-opened",

        CASE_SELECTED:
            "offence:cascade-case-selected",

        ACCUSED_SELECTED:
            "offence:cascade-accused-selected",

        SEIZURE_SELECTED:
            "offence:cascade-seizure-selected",

        LEVEL_CHANGED:
            "offence:cascade-level-changed",

        CLOSED:
            "offence:cascade-closed",

        UPDATED:
            "offence:cascade-updated"

    });


    /* =====================================================
       8. CASCADE STATE

       This is the single source of truth for the
       current offence drill-down session.
       ===================================================== */

    CascadeController.state = {

        open:
            false,

        level:
            "NONE",

        entryType:
            null,

        hotspotId:
            null,

        hotspot:
            null,

        hotspotCascade:
            null,

        caseId:
            null,

        case:
            null,

        caseContext:
            null,

        accusedId:
            null,

        accused:
            null,

        seizureId:
            null,

        seizure:
            null,

        cases:
            [],

        accusedList:
            [],

        seizures:
            [],

        sourceHotspots:
            [],

        targetHotspots:
            [],

        sourceTargetLinks:
            [],

        latlng:
            null

    };


    /* =====================================================
       9. CREATE EMPTY STATE
       ===================================================== */

    CascadeController.createEmptyState =
        function () {

            return {

                open:
                    false,

                level:

                    CascadeController
                        .LEVEL
                        .NONE,

                entryType:
                    null,

                hotspotId:
                    null,

                hotspot:
                    null,

                hotspotCascade:
                    null,

                caseId:
                    null,

                case:
                    null,

                caseContext:
                    null,

                accusedId:
                    null,

                accused:
                    null,

                seizureId:
                    null,

                seizure:
                    null,

                cases:
                    [],

                accusedList:
                    [],

                seizures:
                    [],

                sourceHotspots:
                    [],

                targetHotspots:
                    [],

                sourceTargetLinks:
                    [],

                latlng:
                    null

            };

        };


    /* =====================================================
       10. INITIALIZE
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

                    "🔥 OffenceCascadeController Ready"

                );

            }


            return CascadeController;

        };


    /* =====================================================
       11. NORMALIZE KEY
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
       12. BIND EVENTS

       MapRenderer emits:

       offence:hotspot-click

       This controller receives it.
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
       13. UNBIND EVENTS
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
       14. HANDLE HOTSPOT EVENT
       ===================================================== */

    CascadeController.handleHotspotEvent =
        function (

            event

        ) {

            const detail =

                event
                    ?.detail ||
                {};


            CascadeController
                .openHotspot(

                    detail.hotspotId,

                    detail.type,

                    {

                        hotspot:

                            detail.hotspot,

                        cascade:

                            detail.cascade,

                        latlng:

                            detail.latlng

                    }

                );

        };


    /* =====================================================
       15. OPEN HOTSPOT CASCADE

       Main entry point after map click.
       ===================================================== */

    CascadeController.openHotspot =
        function (

            hotspotId,

            entryType = null,

            options = {}

        ) {

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


            /* -------------------------
               Resolve unified hotspot
               ------------------------- */

            const entry =

                HeatmapEngine
                    .getHotspotById(

                        hotspotId

                    );


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


            /* -------------------------
               Resolve type
               ------------------------- */

            const type =

                CascadeController
                    .normalizeKey(

                        entryType ||

                        entry.type

                    );


            if (

                type !==
                    CascadeController.TYPE.SOURCE &&

                type !==
                    CascadeController.TYPE.TARGET

            ) {

                return {

                    success:
                        false,

                    reason:
                        "INVALID_HOTSPOT_TYPE"

                };

            }


            /* -------------------------
               Resolve hotspot
               ------------------------- */

            const hotspot =

                options.hotspot ||

                entry.hotspot;


            /* -------------------------
               Resolve cascade
               ------------------------- */

            let cascade =

                options.cascade ||

                HeatmapEngine
                    .getCascadeData(

                        hotspotId

                    );


            /*
             * HeatmapEngine.getCascadeData()
             *
             * returns:
             *
             * {
             *     type: "SOURCE",
             *     data: {...}
             * }
             *
             * Normalize to inner data.
             */

            if (
                cascade &&
                cascade.data
            ) {

                cascade =
                    cascade.data;

            }


            /* -------------------------
               Reset previous state
               ------------------------- */

            CascadeController.state =

                CascadeController
                    .createEmptyState();


            /* -------------------------
               Set hotspot state
               ------------------------- */

            CascadeController.state.open =
                true;


            CascadeController.state.level =

                CascadeController
                    .LEVEL
                    .HOTSPOT;


            CascadeController.state.entryType =
                type;


            CascadeController.state.hotspotId =
                hotspotId;


            CascadeController.state.hotspot =
                hotspot;


            CascadeController.state.hotspotCascade =
                cascade;


            CascadeController.state.latlng =

                options.latlng ||

                {

                    lat:

                        hotspot
                            ?.latitude,

                    lng:

                        hotspot
                            ?.longitude

                };


            /* -------------------------
               Build case list
               ------------------------- */

            CascadeController.state.cases =

                CascadeController
                    .extractCasesFromCascade(

                        cascade,

                        hotspot

                    );


            /* -------------------------
               Emit opened event
               ------------------------- */

            const payload =

                CascadeController
                    .buildHotspotPayload();


            CascadeController
                .dispatchEvent(

                    CascadeController
                        .EVENTS
                        .OPENED,

                    payload

                );


            CascadeController
                .dispatchUpdated();


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(

                    "🔥 Offence Cascade Opened",

                    payload

                );

            }


            return {

                success:
                    true,

                data:
                    payload

            };

        };


    /* =====================================================
       16. EXTRACT CASES FROM CASCADE
       ===================================================== */

    CascadeController.extractCasesFromCascade =
        function (

            cascade,

            hotspot

        ) {

            const cases = [];

            const seen =

                new Set();


            /* -------------------------
               Cases already resolved
               ------------------------- */

            const rawCases =

                Array.isArray(
                    cascade?.cases
                )

                    ? cascade.cases

                    : [];


            for (

                const item

                of rawCases

            ) {

                /*
                 * Some engines may return:
                 *
                 * case object
                 *
                 * OR
                 *
                 * {
                 *    case,
                 *    accused,
                 *    seizures
                 * }
                 */

                const caseRecord =

                    item?.case ||

                    item;


                if (
                    !caseRecord
                ) {

                    continue;

                }


                const caseId =

                    CascadeController
                        .getCaseId(

                            caseRecord

                        );


                if (
                    !caseId
                ) {

                    continue;

                }


                const key =

                    CascadeController
                        .normalizeKey(

                            caseId

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


                cases.push(

                    caseRecord

                );

            }


            /* -------------------------
               Fallback to hotspot case IDs
               ------------------------- */

            const caseIds =

                cascade
                    ?.caseIds ||

                hotspot
                    ?.caseIds ||

                [];


            for (

                const caseId

                of caseIds

            ) {

                const key =

                    CascadeController
                        .normalizeKey(

                            caseId

                        );


                if (
                    !key ||
                    seen.has(
                        key
                    )
                ) {

                    continue;

                }


                const caseRecord =

                    CascadeController
                        .getCaseFromStore(

                            caseId

                        );


                if (
                    caseRecord
                ) {

                    seen.add(
                        key
                    );


                    cases.push(

                        caseRecord

                    );

                }

            }


            return cases;

        };


    /* =====================================================
       17. SELECT CASE

       Hotspot
          ↓
       Case
          ↓
       Full context
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


            if (
                !caseId
            ) {

                return {

                    success:
                        false,

                    reason:
                        "CASE_ID_REQUIRED"

                };

            }


            /* -------------------------
               Resolve case context
               ------------------------- */

            const context =

                CascadeController
                    .getCaseContext(

                        caseId

                    );


            const caseRecord =

                context?.case ||

                CascadeController
                    .getCaseFromStore(

                        caseId

                    );


            if (
                !caseRecord &&
                !context
            ) {

                return {

                    success:
                        false,

                    reason:
                        "CASE_NOT_FOUND"

                };

            }


            /* -------------------------
               Resolve relationship
               ------------------------- */

            const relation =

                HeatmapEngine
                    .getCaseRelation(

                        caseId

                    ) ||

                {

                    sources:
                        [],

                    targets:
                        []

                };


            /* -------------------------
               Update state
               ------------------------- */

            CascadeController.state.level =

                CascadeController
                    .LEVEL
                    .CASE;


            CascadeController.state.caseId =
                caseId;


            CascadeController.state.case =
                caseRecord;


            CascadeController.state.caseContext =
                context;


            CascadeController.state.accusedList =

                CascadeController
                    .extractAccused(

                        context,

                        caseId

                    );


            CascadeController.state.seizures =

                CascadeController
                    .extractSeizures(

                        context,

                        caseId

                    );


            CascadeController.state.sourceHotspots =

                Array.isArray(
                    relation.sources
                )

                    ? relation.sources

                    : [];


            CascadeController.state.targetHotspots =

                Array.isArray(
                    relation.targets
                )

                    ? relation.targets

                    : [];


            CascadeController.state.sourceTargetLinks =

                CascadeController
                    .getLinksForCase(

                        caseId

                    );


            /* -------------------------
               Clear deeper selections
               ------------------------- */

            CascadeController.state.accusedId =
                null;


            CascadeController.state.accused =
                null;


            CascadeController.state.seizureId =
                null;


            CascadeController.state.seizure =
                null;


            /* -------------------------
               Build payload
               ------------------------- */

            const payload =

                CascadeController
                    .buildCasePayload();


            /* -------------------------
               Emit
               ------------------------- */

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
       18. SELECT ACCUSED
       ===================================================== */

    CascadeController.selectAccused =
        function (

            accusedId

        ) {

            if (
                !CascadeController.state
                    .caseId
            ) {

                return {

                    success:
                        false,

                    reason:
                        "CASE_NOT_SELECTED"

                };

            }


            const accused =

                CascadeController
                    .findRecord(

                        CascadeController.state
                            .accusedList,

                        accusedId,

                        CascadeController
                            .getAccusedId

                    );


            if (
                !accused
            ) {

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
       19. SELECT SEIZURE
       ===================================================== */

    CascadeController.selectSeizure =
        function (

            seizureId

        ) {

            if (
                !CascadeController.state
                    .caseId
            ) {

                return {

                    success:
                        false,

                    reason:
                        "CASE_NOT_SELECTED"

                };

            }


            const seizure =

                CascadeController
                    .findRecord(

                        CascadeController.state
                            .seizures,

                        seizureId,

                        CascadeController
                            .getSeizureId

                    );


            if (
                !seizure
            ) {

                return {

                    success:
                        false,

                    reason:
                        "SEIZURE_NOT_FOUND"

                };

            }


            CascadeController.state.level =

                CascadeController
                    .LEVEL
                    .SEIZURE;


            CascadeController.state.seizureId =

                CascadeController
                    .getSeizureId(

                        seizure

                    );


            CascadeController.state.seizure =
                seizure;


            const payload = {

                ...CascadeController
                    .buildCasePayload(),

                selectedSeizure:

                    seizure

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
       20. BACK TO HOTSPOT
       ===================================================== */

    CascadeController.backToHotspot =
        function () {

            if (
                !CascadeController.state
                    .open
            ) {

                return false;

            }


            CascadeController.state.level =

                CascadeController
                    .LEVEL
                    .HOTSPOT;


            CascadeController.state.caseId =
                null;


            CascadeController.state.case =
                null;


            CascadeController.state.caseContext =
                null;


            CascadeController.state.accusedId =
                null;


            CascadeController.state.accused =
                null;


            CascadeController.state.seizureId =
                null;


            CascadeController.state.seizure =
                null;


            CascadeController.state.accusedList =
                [];


            CascadeController.state.seizures =
                [];


            CascadeController.state.sourceHotspots =
                [];


            CascadeController.state.targetHotspots =
                [];


            CascadeController.state.sourceTargetLinks =
                [];


            CascadeController
                .dispatchLevelChanged();


            CascadeController
                .dispatchUpdated();


            return true;

        };


    /* =====================================================
       21. BACK TO CASE
       ===================================================== */

    CascadeController.backToCase =
        function () {

            if (
                !CascadeController.state
                    .caseId
            ) {

                return false;

            }


            CascadeController.state.level =

                CascadeController
                    .LEVEL
                    .CASE;


            CascadeController.state.accusedId =
                null;


            CascadeController.state.accused =
                null;


            CascadeController.state.seizureId =
                null;


            CascadeController.state.seizure =
                null;


            CascadeController
                .dispatchLevelChanged();


            CascadeController
                .dispatchUpdated();


            return true;

        };


    /* =====================================================
       22. CLOSE CASCADE
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
       23. GET CASE FROM STORE

       Defensive compatibility layer.

       Store implementation may expose:
       getCaseById()
       or getCase()
       ===================================================== */

    CascadeController.getCaseFromStore =
        function (

            caseId

        ) {

            if (
                typeof Store
                    .getCaseById ===
                    "function"
            ) {

                const result =

                    Store
                        .getCaseById(

                            caseId

                        );


                if (
                    result
                ) {

                    return result;

                }

            }


            if (
                typeof Store
                    .getCase ===
                    "function"
            ) {

                const result =

                    Store
                        .getCase(

                            caseId

                        );


                if (
                    result
                ) {

                    return result;

                }

            }


            return null;

        };


    /* =====================================================
       24. GET CASE CONTEXT
       ===================================================== */

    CascadeController.getCaseContext =
        function (

            caseId

        ) {

            if (
                typeof Store
                    .getCaseContext ===
                    "function"
            ) {

                return (

                    Store
                        .getCaseContext(

                            caseId

                        ) ||

                    null

                );

            }


            return null;

        };


    /* =====================================================
       25. EXTRACT ACCUSED

       Tries context first.

       Falls back to Store methods if available.
       ===================================================== */

    CascadeController.extractAccused =
        function (

            context,

            caseId

        ) {

            let accused = [];


            /* -------------------------
               Context.accused
               ------------------------- */

            if (
                Array.isArray(
                    context?.accused
                )
            ) {

                accused =

                    context.accused;

            }


            /* -------------------------
               Context.accusedList
               ------------------------- */

            else if (
                Array.isArray(
                    context?.accusedList
                )
            ) {

                accused =

                    context.accusedList;

            }


            /* -------------------------
               Store fallback
               ------------------------- */

            else if (
                typeof Store
                    .getAccusedByCaseId ===
                    "function"
            ) {

                accused =

                    Store
                        .getAccusedByCaseId(

                            caseId

                        ) ||

                    [];

            }


            else if (
                typeof Store
                    .getAccusedByCase ===
                    "function"
            ) {

                accused =

                    Store
                        .getAccusedByCase(

                            caseId

                        ) ||

                    [];

            }


            return Array.isArray(
                accused
            )

                ? accused

                : [];

        };


    /* =====================================================
       26. EXTRACT SEIZURES
       ===================================================== */

    CascadeController.extractSeizures =
        function (

            context,

            caseId

        ) {

            let seizures = [];


            /* -------------------------
               Context.seizures
               ------------------------- */

            if (
                Array.isArray(
                    context?.seizures
                )
            ) {

                seizures =

                    context.seizures;

            }


            /* -------------------------
               Context.seizure
               ------------------------- */

            else if (
                Array.isArray(
                    context?.seizure
                )
            ) {

                seizures =

                    context.seizure;

            }


            /* -------------------------
               Store fallback
               ------------------------- */

            else if (
                typeof Store
                    .getSeizuresByCaseId ===
                    "function"
            ) {

                seizures =

                    Store
                        .getSeizuresByCaseId(

                            caseId

                        ) ||

                    [];

            }


            else if (
                typeof Store
                    .getSeizuresByCase ===
                    "function"
            ) {

                seizures =

                    Store
                        .getSeizuresByCase(

                            caseId

                        ) ||

                    [];

            }


            return Array.isArray(
                seizures
            )

                ? seizures

                : [];

        };


    /* =====================================================
       27. GET SOURCE/TARGET LINKS FOR CASE
       ===================================================== */

    CascadeController.getLinksForCase =
        function (

            caseId

        ) {

            const key =

                CascadeController
                    .normalizeKey(

                        caseId

                    );


            return HeatmapEngine
                .getSourceTargetLinks()

                .filter(

                    function (

                        link

                    ) {

                        return (

                            CascadeController
                                .normalizeKey(

                                    link.caseId

                                ) ===

                            key

                        );

                    }

                );

        };


    /* =====================================================
       28. GET CASE ID
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

                record.case_id ||

                record.porNo ||

                record.porNumber ||

                record.id ||

                ""

            );

        };


    /* =====================================================
       29. GET ACCUSED ID
       ===================================================== */

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

                record.accused_id ||

                record.id ||

                record.name ||

                record.accusedName ||

                ""

            );

        };


    /* =====================================================
       30. GET SEIZURE ID
       ===================================================== */

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

                record.seizure_id ||

                record.id ||

                [

                    record.caseId ||

                    "",

                    record.seizureDate ||

                    "",

                    record.placeOfSeizure ||

                    ""

                ].join(
                    "|"
                )

            );

        };


    /* =====================================================
       31. FIND RECORD BY FLEXIBLE ID
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
       32. BUILD HOTSPOT PAYLOAD

       This is what the future UI receives immediately
       after clicking a heatmap hotspot.
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

                offenceCount:

                    state.hotspot
                        ?.offenceCount ||

                    state.cases
                        .length,

                seizureCount:

                    state.hotspot
                        ?.seizureCount ||

                    0,

                caseCount:

                    state.cases
                        .length,

                cases:

                    state.cases

            };

        };


    /* =====================================================
       33. BUILD CASE PAYLOAD

       Complete UI-ready case drill-down object.
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

                caseId:

                    state.caseId,

                case:

                    state.case,

                caseContext:

                    state.caseContext,

                accusedCount:

                    state.accusedList
                        .length,

                accused:

                    state.accusedList,

                seizureCount:

                    state.seizures
                        .length,

                seizures:

                    state.seizures,

                sourceHotspots:

                    state.sourceHotspots,

                targetHotspots:

                    state.targetHotspots,

                sourceTargetLinks:

                    state.sourceTargetLinks,

                selectedAccused:

                    state.accused,

                selectedSeizure:

                    state.seizure

            };

        };


    /* =====================================================
       34. GET STATE

       Returns copy to prevent external mutation of
       controller state.
       ===================================================== */

    CascadeController.getState =
        function () {

            const state =

                CascadeController.state;


            return {

                ...state,

                cases:

                    [
                        ...state.cases
                    ],

                accusedList:

                    [
                        ...state.accusedList
                    ],

                seizures:

                    [
                        ...state.seizures
                    ],

                sourceHotspots:

                    [
                        ...state.sourceHotspots
                    ],

                targetHotspots:

                    [
                        ...state.targetHotspots
                    ],

                sourceTargetLinks:

                    [
                        ...state.sourceTargetLinks
                    ]

            };

        };


    /* =====================================================
       35. IS OPEN
       ===================================================== */

    CascadeController.isOpen =
        function () {

            return (

                CascadeController.state
                    .open === true

            );

        };


    /* =====================================================
       36. GET CURRENT LEVEL
       ===================================================== */

    CascadeController.getLevel =
        function () {

            return CascadeController
                .state
                .level;

        };


    /* =====================================================
       37. DISPATCH LEVEL CHANGED
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
       38. DISPATCH UPDATED
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
       39. DISPATCH EVENT
       ===================================================== */

    CascadeController.dispatchEvent =
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

                        "[OffenceCascadeController] Event dispatch failed",

                        eventName,

                        error

                    );

                }

            }

        };


    /* =====================================================
       40. RESET
       ===================================================== */

    CascadeController.reset =
        function () {

            CascadeController.state =

                CascadeController
                    .createEmptyState();


            return true;

        };


    /* =====================================================
       41. DESTROY
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
       42. EXPORT
       ===================================================== */

    GG.Offence.CascadeController =
        CascadeController;


    /* =====================================================
       43. INITIALIZE

       Safe because MapRenderer may load before or after.
       We only bind a window event listener here.
       ===================================================== */

    CascadeController.init();


    /* =====================================================
       44. READY LOG
       ===================================================== */

    if (
        Constants.DEBUG
            ?.ENABLED
    ) {

        console.log(

            "🔥 OffenceCascadeController Loaded",

            CascadeController

        );

    }


})();
