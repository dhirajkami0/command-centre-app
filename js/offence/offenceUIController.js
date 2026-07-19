/* =========================================================
   GreenGuard
   Offence Intelligence Module

   File:
   js/offence/offenceUIController.js

   Version:
   2.0.0

   PURPOSE:
   ---------------------------------------------------------
   Master UI controller for Offence Intelligence.

   Responsibilities:

   - Create Offence Intelligence map control
   - Activate / deactivate offence intelligence
   - Switch SOURCE / TARGET / ALL modes
   - Build SourceEngine
   - Build TargetEngine
   - Build HeatmapEngine
   - Initialize MapRenderer
   - Render offence heatmap layers
   - Coordinate CascadeController / CascadeRenderer
   - Refresh intelligence after store updates
   - Maintain UI state

   CURRENT ARCHITECTURE:
   ---------------------------------------------------------

   Firestore
       ↓
   OffenceDataLoader
       ↓
   OffenceNormalizer
       ↓
   OffenceStore
       ↓
   OffenceGeocoder
       ↓
   OffenceSourceEngine
       ↓
   OffenceTargetEngine
       ↓
   OffenceHeatmapEngine
       ↓
   OffenceMapRenderer
       ↓
   SOURCE / TARGET hotspot click
       ↓
   OffenceCascadeController
       ↓
   POR-authoritative relationship resolution
       ↓
   OffenceCascadeRenderer


   AUTHORITATIVE CONNECTOR:
   ---------------------------------------------------------

   POR No / Ref POR No
           ↓
       normalized porKey
           ↓
   Cases
   Accused
   Witnesses
   Seizures
   Seized Articles
   SOURCE locations
   TARGET locations


   IMPORTANT:
   ---------------------------------------------------------

   UIController DOES NOT:

   - query Firestore directly
   - normalize records
   - geocode addresses
   - resolve POR relationships
   - render hotspot internals
   - build cascade HTML

   It only orchestrates the offence intelligence modules.

   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       1. NAMESPACE

       Canonical namespace:
       window.GG.Offence

       Do not create a separate GreenGuardAI namespace here.
       ===================================================== */

    window.GG =
        window.GG ||
        {};


    GG.Offence =
        GG.Offence ||
        {};


    /* =====================================================
       2. PREVENT DOUBLE LOADING
       ===================================================== */

    if (
        GG.Offence.UIController
    ) {

        console.warn(
            "[OffenceUIController] Already loaded."
        );

        return;

    }


    /* =====================================================
       3. MODULE
       ===================================================== */

    const UIController = {};


    UIController.VERSION =
        "2.0.0";


    UIController.initialized =
        false;


    UIController.active =
        false;


    UIController.loading =
        false;


    UIController.eventsBound =
        false;


    UIController.activationPromise =
        null;


    UIController.refreshPromise =
        null;


    /* =====================================================
       4. MODES

       Must match OffenceMapRenderer.
       ===================================================== */

    UIController.MODE =
        Object.freeze({

            ALL:
                "ALL",

            SOURCE:
                "SOURCE",

            TARGET:
                "TARGET"

        });


    UIController.mode =
        UIController.MODE.ALL;


    /* =====================================================
       5. DOM IDS
       ===================================================== */

    UIController.IDS = {

        root:
            "offenceIntelligenceControl",

        button:
            "offenceIntelligenceButton",

        menu:
            "offenceIntelligenceMenu",

        allButton:
            "offenceAllModeButton",

        sourceButton:
            "offenceSourceModeButton",

        targetButton:
            "offenceTargetModeButton",

        refreshButton:
            "offenceRefreshButton",

        fitButton:
            "offenceFitButton",

        closeButton:
            "offenceModeCloseButton",

        status:
            "offenceIntelligenceStatus"

    };


    /* =====================================================
       6. EVENT NAMES
       ===================================================== */

    UIController.EVENTS =
        Object.freeze({

            ACTIVATED:
                "offence:ui-activated",

            DEACTIVATED:
                "offence:ui-deactivated",

            MODE_CHANGED:
                "offence:ui-mode-changed",

            REFRESHED:
                "offence:ui-refreshed",

            ERROR:
                "offence:ui-error"

        });


    /* =====================================================
       7. GET CONSTANTS
       ===================================================== */

    UIController.getConstants =
        function () {

            return (
                GG.Offence.Constants ||
                null
            );

        };


    /* =====================================================
       8. DEBUG ENABLED
       ===================================================== */

    UIController.isDebugEnabled =
        function () {

            return !!(
                GG.Offence.Constants
                    ?.DEBUG
                    ?.ENABLED
            );

        };


    /* =====================================================
       9. GET MAP

       Supports current GreenGuard global map references.

       Preferred initialization:

       GG.Offence.UIController.init(map)

       ===================================================== */

    UIController.getMap =
        function () {

            const candidates = [

                UIController.map,

                window.map,

                window.leafletMap,

                window.mainMap,

                GG.map,

                GG.Map,

                GG.Map?.map,

                GG.MapController?.map

            ];


            for (
                const candidate
                of candidates
            ) {

                if (
                    candidate &&
                    typeof candidate.addLayer ===
                        "function" &&
                    typeof candidate.removeLayer ===
                        "function"
                ) {

                    return candidate;

                }

            }


            return null;

        };


    /* =====================================================
       10. CHECK CORE DEPENDENCIES
       ===================================================== */

    UIController.checkDependencies =
        function () {

            const missing =
                [];


            /*
             * Authoritative offence data pipeline.
             *
             * DataLoader
             *      ↓
             * Store
             *      ↓
             * SourceEngine / TargetEngine
             *      ↓
             * HeatmapEngine
             *      ↓
             * MapRenderer
             *      ↓
             * Cascade
             */


            if (
                !GG.Offence.DataLoader
            ) {

                missing.push(
                    "OffenceDataLoader"
                );

            }


            if (
                !GG.Offence.Store
            ) {

                missing.push(
                    "OffenceStore"
                );

            }


            if (
                !GG.Offence.SourceEngine
            ) {

                missing.push(
                    "OffenceSourceEngine"
                );

            }


            if (
                !GG.Offence.TargetEngine
            ) {

                missing.push(
                    "OffenceTargetEngine"
                );

            }


            if (
                !GG.Offence.HeatmapEngine
            ) {

                missing.push(
                    "OffenceHeatmapEngine"
                );

            }


            if (
                !GG.Offence.MapRenderer
            ) {

                missing.push(
                    "OffenceMapRenderer"
                );

            }


            /*
             * Cascade modules are required for
             * hotspot drill-down, but map rendering can
             * technically exist without them.
             *
             * We still report them because the current
             * GreenGuard design requires cascading.
             */

            if (
                !GG.Offence.CascadeController
            ) {

                missing.push(
                    "OffenceCascadeController"
                );

            }


            if (
                !GG.Offence.CascadeRenderer
            ) {

                missing.push(
                    "OffenceCascadeRenderer"
                );

            }


            return {

                success:
                    missing.length === 0,

                missing:
                    missing

            };

        };


    /* =====================================================
       11. CREATE ROOT CONTROL
       ===================================================== */

    UIController.createControl =
        function () {

            let root =

                document.getElementById(

                    UIController
                        .IDS
                        .root

                );


            if (root) {

                return root;

            }


            root =

                document.createElement(
                    "div"
                );


            root.id =

                UIController
                    .IDS
                    .root;


            root.className =

                "offence-intelligence-control";


            /*
             * Core positioning.
             *
             * Visual styling may later move into:
             * css/offence/offenceUI.css
             */

            root.style.position =
                "fixed";


            root.style.right =
                "16px";


            root.style.bottom =
                "90px";


            root.style.zIndex =
                "9998";


            root.style.display =
                "flex";


            root.style.flexDirection =
                "column";


            root.style.alignItems =
                "flex-end";


            root.style.gap =
                "8px";


            document.body.appendChild(
                root
            );


            return root;

        };


    /* =====================================================
       12. CREATE MAIN BUTTON
       ===================================================== */

    UIController.createMainButton =
        function (
            root
        ) {

            let button =

                document.getElementById(

                    UIController
                        .IDS
                        .button

                );


            if (button) {

                return button;

            }


            button =

                document.createElement(
                    "button"
                );


            button.id =

                UIController
                    .IDS
                    .button;


            button.type =
                "button";


            button.className =
                "offence-intelligence-button";


            button.title =
                "Offence Intelligence";


            button.setAttribute(

                "aria-label",

                "Open Offence Intelligence"

            );


            button.setAttribute(

                "aria-expanded",

                "false"

            );


            button.innerHTML = `

                <i class="fa-solid fa-fire-flame-curved"></i>

                <span>
                    Offence
                </span>

            `;


            button.style.minHeight =
                "44px";


            button.style.padding =
                "10px 14px";


            button.style.border =
                "none";


            button.style.borderRadius =
                "22px";


            button.style.cursor =
                "pointer";


            button.style.boxShadow =
                "0 4px 14px rgba(0,0,0,0.22)";


            button.style.fontWeight =
                "600";


            button.style.display =
                "flex";


            button.style.alignItems =
                "center";


            button.style.gap =
                "7px";


            button.addEventListener(

                "click",

                async function (
                    event
                ) {

                    event.preventDefault();

                    event.stopPropagation();


                    await UIController
                        .toggle();

                }

            );


            root.appendChild(
                button
            );


            return button;

        };


    /* =====================================================
       13. CREATE MODE BUTTON
       ===================================================== */

    UIController.createModeButton =
        function (

            id,

            label,

            icon,

            mode

        ) {

            let button =

                document.getElementById(
                    id
                );


            if (button) {

                return button;

            }


            button =

                document.createElement(
                    "button"
                );


            button.id =
                id;


            button.type =
                "button";


            button.className =
                "offence-mode-button";


            button.dataset.mode =
                mode;


            button.innerHTML = `

                <i class="${icon}"></i>

                <span>
                    ${label}
                </span>

            `;


            button.style.border =
                "none";


            button.style.padding =
                "9px 12px";


            button.style.borderRadius =
                "8px";


            button.style.cursor =
                "pointer";


            button.style.width =
                "100%";


            button.style.textAlign =
                "left";


            button.style.display =
                "flex";


            button.style.alignItems =
                "center";


            button.style.gap =
                "8px";


            button.addEventListener(

                "click",

                async function (
                    event
                ) {

                    event.preventDefault();

                    event.stopPropagation();


                    await UIController
                        .setMode(
                            mode
                        );

                }

            );


            return button;

        };


    /* =====================================================
       14. CREATE ACTION BUTTON
       ===================================================== */

    UIController.createActionButton =
        function (

            id,

            label,

            icon,

            handler

        ) {

            let button =

                document.getElementById(
                    id
                );


            if (button) {

                return button;

            }


            button =

                document.createElement(
                    "button"
                );


            button.id =
                id;


            button.type =
                "button";


            button.className =
                "offence-action-button";


            button.innerHTML = `

                <i class="${icon}"></i>

                <span>
                    ${label}
                </span>

            `;


            button.style.border =
                "none";


            button.style.padding =
                "8px 10px";


            button.style.borderRadius =
                "8px";


            button.style.cursor =
                "pointer";


            button.style.flex =
                "1";


            button.addEventListener(

                "click",

                async function (
                    event
                ) {

                    event.preventDefault();

                    event.stopPropagation();


                    try {

                        await handler();

                    }

                    catch (
                        error
                    ) {

                        console.error(

                            "[OffenceUIController] Action failed:",

                            error

                        );

                    }

                }

            );


            return button;

        };


    /* =====================================================
       15. CREATE MENU
       ===================================================== */

    UIController.createMenu =
        function (
            root
        ) {

            let menu =

                document.getElementById(

                    UIController
                        .IDS
                        .menu

                );


            if (menu) {

                return menu;

            }


            menu =

                document.createElement(
                    "div"
                );


            menu.id =

                UIController
                    .IDS
                    .menu;


            menu.className =
                "offence-intelligence-menu";


            menu.style.display =
                "none";


            menu.style.width =
                "230px";


            menu.style.padding =
                "10px";


            menu.style.borderRadius =
                "12px";


            menu.style.background =
                "#ffffff";


            menu.style.boxShadow =
                "0 6px 24px rgba(0,0,0,0.22)";


            /* -------------------------
               Header
               ------------------------- */

            const header =

                document.createElement(
                    "div"
                );


            header.style.display =
                "flex";


            header.style.alignItems =
                "center";


            header.style.justifyContent =
                "space-between";


            header.style.marginBottom =
                "8px";


            const title =

                document.createElement(
                    "strong"
                );


            title.textContent =
                "Offence Intelligence";


            header.appendChild(
                title
            );


            /* -------------------------
               Close Button
               ------------------------- */

            const closeButton =

                document.createElement(
                    "button"
                );


            closeButton.id =

                UIController
                    .IDS
                    .closeButton;


            closeButton.type =
                "button";


            closeButton.innerHTML =
                '<i class="fa-solid fa-xmark"></i>';


            closeButton.title =
                "Close Offence Intelligence";


            closeButton.style.border =
                "none";


            closeButton.style.background =
                "transparent";


            closeButton.style.cursor =
                "pointer";


            closeButton.addEventListener(

                "click",

                function (
                    event
                ) {

                    event.preventDefault();

                    event.stopPropagation();


                    UIController
                        .deactivate();

                }

            );


            header.appendChild(
                closeButton
            );


            menu.appendChild(
                header
            );


            /* -------------------------
               ALL
               ------------------------- */

            menu.appendChild(

                UIController
                    .createModeButton(

                        UIController
                            .IDS
                            .allButton,

                        "Source + Target",

                        "fa-solid fa-layer-group",

                        UIController
                            .MODE
                            .ALL

                    )

            );


            /* -------------------------
               SOURCE
               ------------------------- */

            menu.appendChild(

                UIController
                    .createModeButton(

                        UIController
                            .IDS
                            .sourceButton,

                        "Source Hotspots",

                        "fa-solid fa-house-user",

                        UIController
                            .MODE
                            .SOURCE

                    )

            );


            /* -------------------------
               TARGET
               ------------------------- */

            menu.appendChild(

                UIController
                    .createModeButton(

                        UIController
                            .IDS
                            .targetButton,

                        "Target Hotspots",

                        "fa-solid fa-location-crosshairs",

                        UIController
                            .MODE
                            .TARGET

                    )

            );


            /* -------------------------
               Action Row
               ------------------------- */

            const actions =

                document.createElement(
                    "div"
                );


            actions.style.display =
                "flex";


            actions.style.gap =
                "6px";


            actions.style.marginTop =
                "8px";


            actions.appendChild(

                UIController
                    .createActionButton(

                        UIController
                            .IDS
                            .refreshButton,

                        "Refresh",

                        "fa-solid fa-rotate",

                        function () {

                            return UIController
                                .refresh();

                        }

                    )

            );


            actions.appendChild(

                UIController
                    .createActionButton(

                        UIController
                            .IDS
                            .fitButton,

                        "Fit",

                        "fa-solid fa-expand",

                        function () {

                            const Renderer =

                                GG.Offence
                                    .MapRenderer;


                            if (
                                typeof Renderer
                                    ?.fitBounds ===
                                    "function"
                            ) {

                                return Renderer
                                    .fitBounds(

                                        UIController
                                            .mode

                                    );

                            }


                            return false;

                        }

                    )

            );


            menu.appendChild(
                actions
            );


            /* -------------------------
               Status
               ------------------------- */

            const status =

                document.createElement(
                    "div"
                );


            status.id =

                UIController
                    .IDS
                    .status;


            status.className =
                "offence-intelligence-status";


            status.style.marginTop =
                "9px";


            status.style.fontSize =
                "12px";


            status.style.opacity =
                "0.75";


            status.style.lineHeight =
                "1.4";


            status.textContent =
                "Inactive";


            menu.appendChild(
                status
            );


            /*
             * Menu before main button so menu
             * visually expands upward.
             */

            root.insertBefore(

                menu,

                root.firstChild

            );


            return menu;

        };


    /* =====================================================
       16. GET ELEMENT
       ===================================================== */

    UIController.getElement =
        function (
            id
        ) {

            return document
                .getElementById(
                    id
                );

        };


    /* =====================================================
       17. SHOW MENU
       ===================================================== */

    UIController.showMenu =
        function () {

            const menu =

                UIController
                    .getElement(

                        UIController
                            .IDS
                            .menu

                    );


            if (menu) {

                menu.style.display =
                    "block";

            }


            const button =

                UIController
                    .getElement(

                        UIController
                            .IDS
                            .button

                    );


            if (button) {

                button.setAttribute(

                    "aria-expanded",

                    "true"

                );

            }

        };


    /* =====================================================
       18. HIDE MENU
       ===================================================== */

    UIController.hideMenu =
        function () {

            const menu =

                UIController
                    .getElement(

                        UIController
                            .IDS
                            .menu

                    );


            if (menu) {

                menu.style.display =
                    "none";

            }


            const button =

                UIController
                    .getElement(

                        UIController
                            .IDS
                            .button

                    );


            if (button) {

                button.setAttribute(

                    "aria-expanded",

                    "false"

                );

            }

        };


    /* =====================================================
       19. SET STATUS
       ===================================================== */

    UIController.setStatus =
        function (
            message
        ) {

            const status =

                UIController
                    .getElement(

                        UIController
                            .IDS
                            .status

                    );


            if (status) {

                status.textContent =
                    message ||
                    "";

            }

        };


    /* =====================================================
       20. SET LOADING
       ===================================================== */

    UIController.setLoading =
        function (
            loading
        ) {

            UIController.loading =
                !!loading;


            const ids = [

                UIController
                    .IDS
                    .button,

                UIController
                    .IDS
                    .allButton,

                UIController
                    .IDS
                    .sourceButton,

                UIController
                    .IDS
                    .targetButton,

                UIController
                    .IDS
                    .refreshButton

            ];


            ids.forEach(

                function (
                    id
                ) {

                    const element =

                        UIController
                            .getElement(
                                id
                            );


                    if (!element) {

                        return;

                    }


                    element.disabled =
                        UIController.loading;


                    if (
                        UIController.loading
                    ) {

                        element.classList.add(
                            "is-loading"
                        );

                    }

                    else {

                        element.classList.remove(
                            "is-loading"
                        );

                    }

                }

            );

        };


    /* =====================================================
       21. UPDATE ACTIVE MODE UI
       ===================================================== */

    UIController.updateModeUI =
        function () {

            const buttons = [

                UIController
                    .IDS
                    .allButton,

                UIController
                    .IDS
                    .sourceButton,

                UIController
                    .IDS
                    .targetButton

            ];


            buttons.forEach(

                function (
                    id
                ) {

                    const button =

                        UIController
                            .getElement(
                                id
                            );


                    if (!button) {

                        return;

                    }


                    const active =

                        button.dataset.mode ===
                        UIController.mode;


                    button.classList.toggle(

                        "is-active",

                        active

                    );


                    button.style.fontWeight =

                        active

                            ? "700"

                            : "400";


                    button.setAttribute(

                        "aria-pressed",

                        active
                            ? "true"
                            : "false"

                    );

                }

            );

        };


    /* =====================================================
       22. INITIALIZE MAP RENDERER
       ===================================================== */

    UIController.initializeMapRenderer =
        function () {

            const Renderer =

                GG.Offence
                    .MapRenderer;


            if (!Renderer) {

                throw new Error(
                    "OffenceMapRenderer unavailable."
                );

            }


            const map =

                UIController
                    .getMap();


            if (!map) {

                throw new Error(
                    "Leaflet map unavailable."
                );

            }


            UIController.map =
                map;


            if (
                typeof Renderer.init ===
                    "function"
            ) {

                Renderer.init(
                    map
                );

            }


            return Renderer;

        };


    /* =====================================================
       23. BUILD SOURCE + TARGET ENGINES
       ===================================================== */

/* =====================================================
   23. BUILD SOURCE + TARGET ENGINES

   AUTHORITATIVE PIPELINE:

   OffenceStore
        ↓
   OffenceGeocoder.resolveAll()
        ↓
   resolvedContexts
        ↓
   SourceEngine.build(resolvedContexts)
        ↓
   TargetEngine.build(resolvedContexts)

   IMPORTANT:

   SourceEngine.build() and TargetEngine.build()
   require resolvedContexts.

   Never call:

       SourceEngine.build()
       TargetEngine.build()

   without resolvedContexts.

   POR / porKey remains the authoritative
   relationship connector.
   ===================================================== */

UIController.buildData =
    async function () {

        const Store =

            GG.Offence
                .Store;


        const Geocoder =

            GG.Offence
                .Geocoder;


        const SourceEngine =

            GG.Offence
                .SourceEngine;


        const TargetEngine =

            GG.Offence
                .TargetEngine;


        /* ---------------------------------------------
           Validate Store
           --------------------------------------------- */

        if (!Store) {

            throw new Error(
                "OffenceStore unavailable."
            );

        }


        /* ---------------------------------------------
           Validate Store readiness

           DataLoader must already have completed:

           Firestore
                ↓
           Normalizer
                ↓
           Store.build()
           --------------------------------------------- */

        if (
            !Store.initialized ||
            !Store.ready
        ) {

            throw new Error(
                "OffenceStore is not ready."
            );

        }


        /* ---------------------------------------------
           Validate Geocoder
           --------------------------------------------- */

        if (!Geocoder) {

            throw new Error(
                "OffenceGeocoder unavailable."
            );

        }


        if (
            typeof Geocoder.resolveAll !==
            "function"
        ) {

            throw new Error(
                "OffenceGeocoder.resolveAll unavailable."
            );

        }


        /* ---------------------------------------------
           Validate SourceEngine
           --------------------------------------------- */

        if (!SourceEngine) {

            throw new Error(
                "OffenceSourceEngine unavailable."
            );

        }


        if (
            typeof SourceEngine.build !==
            "function"
        ) {

            throw new Error(
                "OffenceSourceEngine.build unavailable."
            );

        }


        /* ---------------------------------------------
           Validate TargetEngine
           --------------------------------------------- */

        if (!TargetEngine) {

            throw new Error(
                "OffenceTargetEngine unavailable."
            );

        }


        if (
            typeof TargetEngine.build !==
            "function"
        ) {

            throw new Error(
                "OffenceTargetEngine.build unavailable."
            );

        }


        /* ---------------------------------------------
           Resolve offence contexts

           Expected runtime:

           Store
                ↓
           Geocoder.resolveAll()
                ↓
           approximately 573 resolved contexts

           Each context may contain:

           {
               case,
               caseId,
               porKey,
               porNo,
               sources: [],
               targets: []
           }
           --------------------------------------------- */

        const resolvedResult =

            await Geocoder
                .resolveAll();


        /* ---------------------------------------------
           Normalize Geocoder result

           Primary contract:

               resolveAll() → Array

           Compatibility support is retained in case
           the Geocoder returns a wrapper object such as:

               {
                   resolvedContexts: [...]
               }

           or:

               {
                   contexts: [...]
               }

           or:

               {
                   data: [...]
               }
           --------------------------------------------- */

        let resolvedContexts =
            [];


        if (
            Array.isArray(
                resolvedResult
            )
        ) {

            resolvedContexts =

                resolvedResult;

        }

        else if (
            Array.isArray(
                resolvedResult
                    ?.resolvedContexts
            )
        ) {

            resolvedContexts =

                resolvedResult
                    .resolvedContexts;

        }

        else if (
            Array.isArray(
                resolvedResult
                    ?.contexts
            )
        ) {

            resolvedContexts =

                resolvedResult
                    .contexts;

        }

        else if (
            Array.isArray(
                resolvedResult
                    ?.data
            )
        ) {

            resolvedContexts =

                resolvedResult
                    .data;

        }


        /* ---------------------------------------------
           Validate resolved contexts

           Do not silently build empty engines.

           Calling:

               SourceEngine.build([])
               TargetEngine.build([])

           would reset both engines and reproduce the
           exact zero-hotspot failure.
           --------------------------------------------- */

        if (
            resolvedContexts.length ===
            0
        ) {

            throw new Error(
                "OffenceGeocoder.resolveAll() returned no resolved contexts."
            );

        }


        /* ---------------------------------------------
           Build SOURCE intelligence

           Contract:

           SourceEngine.build(
               resolvedContexts
           )

           Expected from current dataset:

               resolvedContexts ≈ 573
               raw sources      ≈ 768
               source hotspots  ≈ 570
           --------------------------------------------- */

        const source =

            await SourceEngine
                .build(

                    resolvedContexts

                );


        /* ---------------------------------------------
           Build TARGET intelligence

           IMPORTANT:

           Use the SAME resolvedContexts used by
           SourceEngine.

           Expected from current dataset:

               raw targets      ≈ 85
               target hotspots  ≈ 83
           --------------------------------------------- */

        const target =

            await TargetEngine
                .build(

                    resolvedContexts

                );


        /* ---------------------------------------------
           Normalize engine results
           --------------------------------------------- */

        const sourceHotspots =

            Array.isArray(
                source
            )

                ? source

                : (

                    typeof SourceEngine
                        .getHotspots ===
                        "function"

                        ? SourceEngine
                            .getHotspots()

                        : []

                );


        const targetHotspots =

            Array.isArray(
                target
            )

                ? target

                : (

                    typeof TargetEngine
                        .getHotspots ===
                        "function"

                        ? TargetEngine
                            .getHotspots()

                        : []

                );


        /* ---------------------------------------------
           Runtime validation

           A non-empty resolved context collection with
           zero SOURCE and zero TARGET hotspots usually
           indicates a Geocoder → Engine contract problem.
           --------------------------------------------- */

        if (
            resolvedContexts.length > 0 &&
            sourceHotspots.length === 0 &&
            targetHotspots.length === 0
        ) {

            console.warn(

                "[OffenceUIController] " +
                "Resolved contexts exist but both " +
                "SourceEngine and TargetEngine are empty.",

                {

                    resolvedContexts:
                        resolvedContexts.length,

                    sourceHotspots:
                        sourceHotspots.length,

                    targetHotspots:
                        targetHotspots.length

                }

            );

        }


        /* ---------------------------------------------
           Debug
           --------------------------------------------- */

        if (
            UIController
                .isDebugEnabled()
        ) {

            console.log(

                "🔥 Offence Source / Target Built",

                {

                    resolvedContexts:
                        resolvedContexts.length,

                    sourceHotspots:
                        sourceHotspots.length,

                    targetHotspots:
                        targetHotspots.length,

                    connector:
                        "POR",

                    authoritativeConnector:
                        "porKey"

                }

            );

        }


        /* ---------------------------------------------
           Return canonical build result

           resolvedContexts is intentionally returned.

           This allows future HeatmapEngine lifecycle
           alignment without re-running Geocoder.
           --------------------------------------------- */

        return {

            resolvedContexts:
                resolvedContexts,

            source:
                sourceHotspots,

            target:
                targetHotspots

        };

    };


    /* =====================================================
       24. BUILD HEATMAP ENGINE

       AUTHORITATIVE RUNTIME CONTRACT:
       -----------------------------------------------------

       SourceEngine.getHotspots()
                    ↓
       HeatmapEngine.data.sources

       TargetEngine.getHotspots()
                    ↓
       HeatmapEngine.data.targets

                    ↓
       HeatmapEngine.rebuildIndexes()

                    ↓
       POR hydration
       hotspotIndex
       porIndex
       caseIndex

                    ↓
       HeatmapEngine.ready = true

       IMPORTANT:
       -----------------------------------------------------

       Current OffenceHeatmapEngine v2.0.0 does NOT expose:

       - build()
       - buildFromEngines()

       Therefore UIController must bridge the already-built
       SourceEngine / TargetEngine hotspot arrays into the
       canonical HeatmapEngine.data contract.

       POR remains the authoritative relationship connector.

       ===================================================== */

    UIController.buildHeatmap =
        async function () {

            const HeatmapEngine =

                GG.Offence
                    .HeatmapEngine;


            const SourceEngine =

                GG.Offence
                    .SourceEngine;


            const TargetEngine =

                GG.Offence
                    .TargetEngine;


            /* ---------------------------------------------
               Validate HeatmapEngine
               --------------------------------------------- */

            if (!HeatmapEngine) {

                throw new Error(
                    "OffenceHeatmapEngine unavailable."
                );

            }


            /* ---------------------------------------------
               Validate SourceEngine
               --------------------------------------------- */

            if (!SourceEngine) {

                throw new Error(
                    "OffenceSourceEngine unavailable."
                );

            }


            /* ---------------------------------------------
               Validate TargetEngine
               --------------------------------------------- */

            if (!TargetEngine) {

                throw new Error(
                    "OffenceTargetEngine unavailable."
                );

            }


            /* ---------------------------------------------
               Read canonical SOURCE hotspots

               SourceEngine has already been built by:

               UIController.buildData()

               Therefore DO NOT rebuild it here.
               --------------------------------------------- */

            const sourceHotspots =

                typeof SourceEngine
                    .getHotspots ===
                    "function"

                    ? SourceEngine
                        .getHotspots()

                    : [];


            /* ---------------------------------------------
               Read canonical TARGET hotspots

               TargetEngine has already been built by:

               UIController.buildData()

               Therefore DO NOT rebuild it here.
               --------------------------------------------- */

            const targetHotspots =

                typeof TargetEngine
                    .getHotspots ===
                    "function"

                    ? TargetEngine
                        .getHotspots()

                    : [];


            /* ---------------------------------------------
               Normalize arrays
               --------------------------------------------- */

            const sources =

                Array.isArray(
                    sourceHotspots
                )

                    ? sourceHotspots

                    : [];


            const targets =

                Array.isArray(
                    targetHotspots
                )

                    ? targetHotspots

                    : [];


            /* ---------------------------------------------
               Initialize HeatmapEngine if required
               --------------------------------------------- */

            if (
                typeof HeatmapEngine
                    .init ===
                    "function"
            ) {

                HeatmapEngine
                    .init();

            }


            /* ---------------------------------------------
               Reset previous canonical heatmap state

               clear() resets:

               data.resolvedContexts
               data.sources
               data.targets
               data.links

               hotspotIndex
               porIndex
               caseIndex

               ready
               building
               lastBuildAt

               It does NOT destroy SourceEngine or
               TargetEngine hotspot data.
               --------------------------------------------- */

            if (
                typeof HeatmapEngine
                    .clear ===
                    "function"
            ) {

                HeatmapEngine
                    .clear();

            }


            /* ---------------------------------------------
               Mark build in progress
               --------------------------------------------- */

            HeatmapEngine.building =
                true;


            try {

                /* -----------------------------------------
                   Guarantee canonical data container
                   ----------------------------------------- */

                if (
                    !HeatmapEngine.data ||
                    typeof HeatmapEngine.data !==
                        "object"
                ) {

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

                }


                /* -----------------------------------------
                   Preserve canonical data properties
                   ----------------------------------------- */

                if (
                    !Array.isArray(
                        HeatmapEngine
                            .data
                            .resolvedContexts
                    )
                ) {

                    HeatmapEngine
                        .data
                        .resolvedContexts =
                        [];

                }


                /* -----------------------------------------
                   SOURCE ENGINE
                        ↓
                   HEATMAP ENGINE

                   Use copies of arrays so HeatmapEngine
                   cannot accidentally mutate SourceEngine
                   internal hotspot collection.
                   ----------------------------------------- */

                HeatmapEngine
                    .data
                    .sources =

                    sources.slice();


                /* -----------------------------------------
                   TARGET ENGINE
                        ↓
                   HEATMAP ENGINE
                   ----------------------------------------- */

                HeatmapEngine
                    .data
                    .targets =

                    targets.slice();


                /* -----------------------------------------
                   Links

                   Current architecture does not require
                   links for SOURCE / TARGET heat rendering.

                   POR relationships are resolved through:

                   porIndex
                       ↓
                   Store.getCascadeByPor()
                       ↓
                   POR-authoritative cascade

                   Therefore an empty links array is valid.

                   Future source-target spatial link
                   generation can populate this array
                   without changing this orchestration.
                   ----------------------------------------- */

                HeatmapEngine
                    .data
                    .links =
                    [];


                /* -----------------------------------------
                   Rebuild canonical indexes

                   This performs:

                   SOURCE registration
                   TARGET registration

                        ↓

                   hotspotIndex

                        ↓

                   porIndex

                        ↓

                   caseIndex

                        ↓

                   hydrateAllPorRelations()

                   This is the proven runtime contract.
                   ----------------------------------------- */

                if (
                    typeof HeatmapEngine
                        .rebuildIndexes !==
                        "function"
                ) {

                    throw new Error(
                        "OffenceHeatmapEngine.rebuildIndexes unavailable."
                    );

                }


                HeatmapEngine
                    .rebuildIndexes();


                /* -----------------------------------------
                   Mark canonical engine ready
                   ----------------------------------------- */

                HeatmapEngine.ready =
                    true;


                HeatmapEngine.lastBuildAt =
                    Date.now();


                /* -----------------------------------------
                   Build result
                   ----------------------------------------- */

                const result = {

                    success:
                        true,

                    sourceHotspots:
                        HeatmapEngine
                            .getSourceHotspots()
                            .length,

                    targetHotspots:
                        HeatmapEngine
                            .getTargetHotspots()
                            .length,

                    hotspotIndex:

                        HeatmapEngine
                            .hotspotIndex
                            ?.size ||

                        0,

                    porIndex:

                        HeatmapEngine
                            .porIndex
                            ?.size ||

                        0,

                    caseIndex:

                        HeatmapEngine
                            .caseIndex
                            ?.size ||

                        0,

                    links:

                        typeof HeatmapEngine
                            .getLinks ===
                            "function"

                            ? HeatmapEngine
                                .getLinks()
                                .length

                            : 0,

                    ready:
                        HeatmapEngine.ready,

                    lastBuildAt:
                        HeatmapEngine.lastBuildAt

                };


                /* -----------------------------------------
                   Debug
                   ----------------------------------------- */

                if (
                    UIController
                        .isDebugEnabled()
                ) {

                    console.log(

                        "🔥 Offence Heatmap Bridge Built",

                        {

                            sourceEngine:
                                sources.length,

                            targetEngine:
                                targets.length,

                            heatmapSources:
                                result
                                    .sourceHotspots,

                            heatmapTargets:
                                result
                                    .targetHotspots,

                            hotspotIndex:
                                result
                                    .hotspotIndex,

                            porIndex:
                                result
                                    .porIndex,

                            caseIndex:
                                result
                                    .caseIndex,

                            links:
                                result
                                    .links,

                            ready:
                                result
                                    .ready,

                            connector:
                                "POR"

                        }

                    );

                }


                return result;

            }

            catch (
                error
            ) {

                /* -----------------------------------------
                   Build failed
                   ----------------------------------------- */

                HeatmapEngine.ready =
                    false;


                console.error(

                    "[OffenceUIController] Heatmap build failed:",

                    error

                );


                throw error;

            }

            finally {

                HeatmapEngine.building =
                    false;

            }

        };

    /* =====================================================
       25. RENDER CURRENT MODE

       MapRenderer reads hotspots directly from
       HeatmapEngine.

       Do not pass raw SourceEngine / TargetEngine
       arrays into MapRenderer.
       ===================================================== */

    UIController.render =
        async function () {

            const Renderer =

                UIController
                    .initializeMapRenderer();


            if (
                typeof Renderer.render !==
                    "function"
            ) {

                throw new Error(
                    "OffenceMapRenderer.render unavailable."
                );

            }


            return Renderer
                .render({

                    mode:
                        UIController.mode,

                    show:
                        true

                });

        };


    /* =====================================================
       26. GET SOURCE STATS
       ===================================================== */

    UIController.getSourceStats =
        function () {

            const Engine =

                GG.Offence
                    .SourceEngine;


            if (
                typeof Engine
                    ?.getStats ===
                    "function"
            ) {

                return (
                    Engine.getStats() ||
                    {}
                );

            }


            const hotspots =

                typeof Engine
                    ?.getHotspots ===
                    "function"

                    ? Engine.getHotspots()

                    : [];


            return {

                hotspots:

                    Array.isArray(
                        hotspots
                    )

                        ? hotspots.length

                        : 0

            };

        };


    /* =====================================================
       27. GET TARGET STATS
       ===================================================== */

    UIController.getTargetStats =
        function () {

            const Engine =

                GG.Offence
                    .TargetEngine;


            if (
                typeof Engine
                    ?.getStats ===
                    "function"
            ) {

                return (
                    Engine.getStats() ||
                    {}
                );

            }


            const hotspots =

                typeof Engine
                    ?.getHotspots ===
                    "function"

                    ? Engine.getHotspots()

                    : [];


            return {

                hotspots:

                    Array.isArray(
                        hotspots
                    )

                        ? hotspots.length

                        : 0

            };

        };


    /* =====================================================
       28. UPDATE STATUS FROM STATS
       ===================================================== */

    UIController.updateStatus =
        function () {

            const sourceStats =

                UIController
                    .getSourceStats();


            const targetStats =

                UIController
                    .getTargetStats();


            const sourceCount =

                Number(

                    sourceStats.hotspots ??

                    sourceStats.hotspotCount ??

                    sourceStats.count ??

                    0

                );


            const targetCount =

                Number(

                    targetStats.hotspots ??

                    targetStats.hotspotCount ??

                    targetStats.count ??

                    0

                );


            UIController.setStatus(

                "Source: " +
                sourceCount +
                " | Target: " +
                targetCount

            );


            return {

                source:
                    sourceStats,

                target:
                    targetStats

            };

        };


    /* =====================================================
       29. ACTIVATE
       ===================================================== */

    UIController.activate =
        async function () {

            if (
                UIController.active &&
                !UIController.loading
            ) {

                UIController
                    .showMenu();


                const Renderer =

                    GG.Offence
                        .MapRenderer;


                if (
                    typeof Renderer
                        ?.show ===
                        "function"
                ) {

                    Renderer.show();

                }


                return true;

            }


            if (
                UIController.activationPromise
            ) {

                return UIController
                    .activationPromise;

            }


            UIController.activationPromise =

                (async function () {

                    const dependencyCheck =

                        UIController
                            .checkDependencies();


                    if (
                        !dependencyCheck.success
                    ) {

                        console.error(

                            "[OffenceUIController] Missing dependencies:",

                            dependencyCheck.missing

                        );


                        UIController.setStatus(

                            "Missing: " +
                            dependencyCheck
                                .missing
                                .join(", ")

                        );


                        return false;

                    }


                    UIController.setLoading(
                        true
                    );


                    try {

                        UIController
                            .showMenu();


                        UIController.setStatus(
                            "Building offence intelligence..."
                        );


                        /*
                         * Cascade panel remains hidden until
                         * a hotspot is clicked.
                         */

                        if (
                            typeof GG.Offence
                                .CascadeRenderer
                                ?.hide ===
                                "function"
                        ) {

                            GG.Offence
                                .CascadeRenderer
                                .hide();

                        }


                        /*
                         * Ensure map renderer has map reference.
                         */

                        UIController
                            .initializeMapRenderer();


                        /*
                         * Build SOURCE + TARGET.
                         */
                        /*
                         * Ensure authoritative offence data
                         * is loaded before derived intelligence
                         * engines are built.
                         *
                         * DataLoader owns:
                         *
                         * Firestore
                         *      ↓
                         * Normalizer
                         *      ↓
                         * Store
                         *
                         * UIController only orchestrates it.
                         */

                        const DataLoader =

                            GG.Offence
                                .DataLoader;


                        const Store =

                            GG.Offence
                                .Store;


                        if (
                            DataLoader &&
                            (
                                !Store?.initialized ||
                                !Store?.ready
                            )
                        ) {

                            UIController.setStatus(
                                "Loading offence data..."
                            );


                            if (
                                typeof DataLoader.load !==
                                    "function"
                            ) {

                                throw new Error(
                                    "OffenceDataLoader.load unavailable."
                                );

                            }


                            await DataLoader
                                .load();

                        }


                        if (
                            !Store?.initialized ||
                            !Store?.ready
                        ) {

                            throw new Error(
                                "OffenceStore is not ready after data load."
                            );

                        }


                        UIController.setStatus(
                            "Building offence intelligence..."
                        );


                        /*
                         * Build SOURCE + TARGET.
                         */

await UIController
    .buildData();

await UIController
    .buildHeatmap();

await UIController
    .render();


                        UIController.active =
                            true;


                        UIController
                            .updateModeUI();


                        const stats =

                            UIController
                                .updateStatus();


                        const button =

                            UIController
                                .getElement(

                                    UIController
                                        .IDS
                                        .button

                                );


                        if (button) {

                            button.classList.add(
                                "is-active"
                            );

                        }


                        UIController
                            .dispatchEvent(

                                UIController
                                    .EVENTS
                                    .ACTIVATED,

                                {

                                    mode:
                                        UIController.mode,

                                    source:
                                        stats.source,

                                    target:
                                        stats.target

                                }

                            );


                        if (
                            UIController
                                .isDebugEnabled()
                        ) {

                            console.log(

                                "🔥 Offence Intelligence Active",

                                {

                                    mode:
                                        UIController.mode,

                                    source:
                                        stats.source,

                                    target:
                                        stats.target

                                }

                            );

                        }


                        return true;

                    }

                    catch (
                        error
                    ) {

                        UIController.active =
                            false;


                        console.error(

                            "[OffenceUIController] Activation failed:",

                            error

                        );


                        UIController.setStatus(
                            "Unable to activate"
                        );


                        UIController
                            .dispatchError(
                                error
                            );


                        return false;

                    }

                    finally {

                        UIController.setLoading(
                            false
                        );

                    }

                })();


            try {

                return await UIController
                    .activationPromise;

            }

            finally {

                UIController.activationPromise =
                    null;

            }

        };


    /* =====================================================
       30. DEACTIVATE
       ===================================================== */

    UIController.deactivate =
        function () {

            UIController.active =
                false;


            UIController
                .hideMenu();


            /*
             * Hide offence map layers.
             *
             * Do not destroy built intelligence.
             * This allows fast reactivation.
             */

            const Renderer =

                GG.Offence
                    .MapRenderer;


            if (
                typeof Renderer
                    ?.hide ===
                    "function"
            ) {

                Renderer.hide();

            }

            else if (
                typeof Renderer
                    ?.clear ===
                    "function"
            ) {

                Renderer.clear();

            }


            /*
             * Close CascadeController state.
             */

            if (
                typeof GG.Offence
                    .CascadeController
                    ?.close ===
                    "function"
            ) {

                GG.Offence
                    .CascadeController
                    .close();

            }


            /*
             * Ensure cascade UI hidden.
             */

            if (
                typeof GG.Offence
                    .CascadeRenderer
                    ?.hide ===
                    "function"
            ) {

                GG.Offence
                    .CascadeRenderer
                    .hide();

            }


            const button =

                UIController
                    .getElement(

                        UIController
                            .IDS
                            .button

                    );


            if (button) {

                button.classList.remove(
                    "is-active"
                );

            }


            UIController.setStatus(
                "Inactive"
            );


            UIController
                .dispatchEvent(

                    UIController
                        .EVENTS
                        .DEACTIVATED,

                    {

                        mode:
                            UIController.mode

                    }

                );


            if (
                UIController
                    .isDebugEnabled()
            ) {

                console.log(
                    "🔥 Offence Intelligence Inactive"
                );

            }


            return true;

        };


    /* =====================================================
       31. TOGGLE
       ===================================================== */

    UIController.toggle =
        async function () {

            if (
                UIController.loading
            ) {

                return false;

            }


            if (
                UIController.active
            ) {

                return UIController
                    .deactivate();

            }


            return await UIController
                .activate();

        };


    /* =====================================================
       32. NORMALIZE MODE
       ===================================================== */

    UIController.normalizeMode =
        function (
            mode
        ) {

            const value =

                String(
                    mode ||
                    ""
                )
                    .trim()
                    .toUpperCase();


            /*
             * Backward compatibility.
             */

            if (
                value === "BOTH"
            ) {

                return UIController
                    .MODE
                    .ALL;

            }


            if (
                value ===
                    UIController
                        .MODE
                        .SOURCE
            ) {

                return UIController
                    .MODE
                    .SOURCE;

            }


            if (
                value ===
                    UIController
                        .MODE
                        .TARGET
            ) {

                return UIController
                    .MODE
                    .TARGET;

            }


            if (
                value ===
                    UIController
                        .MODE
                        .ALL
            ) {

                return UIController
                    .MODE
                    .ALL;

            }


            return null;

        };


    /* =====================================================
       33. SET MODE
       ===================================================== */

    UIController.setMode =
        async function (
            mode
        ) {

            const normalized =

                UIController
                    .normalizeMode(
                        mode
                    );


            if (!normalized) {

                console.warn(

                    "[OffenceUIController] Invalid mode:",

                    mode

                );


                return false;

            }


            UIController.mode =
                normalized;


            UIController
                .updateModeUI();


            if (
                !UIController.active
            ) {

                return true;

            }


            if (
                UIController.loading
            ) {

                return false;

            }


            UIController.setLoading(
                true
            );


            try {

                const label =

                    normalized ===
                        UIController.MODE.ALL

                        ? "source + target"

                        : normalized.toLowerCase();


                UIController.setStatus(

                    "Rendering " +
                    label +
                    " hotspots..."

                );


                const Renderer =

                    GG.Offence
                        .MapRenderer;


                /*
                 * Preferred mode switching.
                 */

                if (
                    typeof Renderer
                        ?.setMode ===
                        "function"
                ) {

                    Renderer.setMode(
                        normalized
                    );

                }

                else {

                    await UIController
                        .render();

                }


                UIController
                    .updateStatus();


                UIController
                    .dispatchEvent(

                        UIController
                            .EVENTS
                            .MODE_CHANGED,

                        {

                            mode:
                                normalized

                        }

                    );


                return true;

            }

            catch (
                error
            ) {

                console.error(

                    "[OffenceUIController] Mode change failed:",

                    error

                );


                UIController.setStatus(
                    "Render failed"
                );


                UIController
                    .dispatchError(
                        error
                    );


                return false;

            }

            finally {

                UIController.setLoading(
                    false
                );

            }

        };


    /* =====================================================
       34. SHOW ALL
       ===================================================== */

    UIController.showAll =
        function () {

            return UIController
                .setMode(

                    UIController
                        .MODE
                        .ALL

                );

        };


    /* =====================================================
       35. SHOW SOURCE
       ===================================================== */

    UIController.showSource =
        function () {

            return UIController
                .setMode(

                    UIController
                        .MODE
                        .SOURCE

                );

        };


    /* =====================================================
       36. SHOW TARGET
       ===================================================== */

    UIController.showTarget =
        function () {

            return UIController
                .setMode(

                    UIController
                        .MODE
                        .TARGET

                );

        };


    /* =====================================================
       37. REFRESH
       ===================================================== */

    UIController.refresh =
        async function () {

            if (
                !UIController.active
            ) {

                return false;

            }


            if (
                UIController.refreshPromise
            ) {

                return UIController
                    .refreshPromise;

            }


            UIController.refreshPromise =

                (async function () {

                    UIController.setLoading(
                        true
                    );


                    try {

                        UIController.setStatus(
                            "Refreshing offence intelligence..."
                        );


                        /*
                         * Rebuild SOURCE + TARGET.
                         */

                        await UIController
                            .buildData();


                        /*
                         * Rebuild HeatmapEngine.
                         */

                        await UIController
                            .buildHeatmap();


                        /*
                         * Re-render map.
                         */

                        await UIController
                            .render();


                        const stats =

                            UIController
                                .updateStatus();


                        UIController
                            .dispatchEvent(

                                UIController
                                    .EVENTS
                                    .REFRESHED,

                                {

                                    mode:
                                        UIController.mode,

                                    source:
                                        stats.source,

                                    target:
                                        stats.target

                                }

                            );


                        return true;

                    }

                    catch (
                        error
                    ) {

                        console.error(

                            "[OffenceUIController] Refresh failed:",

                            error

                        );


                        UIController.setStatus(
                            "Refresh failed"
                        );


                        UIController
                            .dispatchError(
                                error
                            );


                        return false;

                    }

                    finally {

                        UIController.setLoading(
                            false
                        );

                    }

                })();


            try {

                return await UIController
                    .refreshPromise;

            }

            finally {

                UIController.refreshPromise =
                    null;

            }

        };


    /* =====================================================
       38. HANDLE STORE UPDATE

       If offence intelligence is active,
       rebuild derived SOURCE / TARGET / heatmap data.
       ===================================================== */

    UIController.handleStoreUpdate =
        function () {

            if (
                !UIController.active
            ) {

                return;

            }


            UIController
                .refresh();

        };


    /* =====================================================
       39. HANDLE HOTSPOT CLICK

       MapRenderer dispatches this event.

       CascadeController should normally listen directly.

       This method is intentionally only used to ensure
       the UI remains active and visible.
       ===================================================== */

    UIController.handleHotspotClick =
        function (
            event
        ) {

            if (
                !UIController.active
            ) {

                return;

            }


            if (
                UIController
                    .isDebugEnabled()
            ) {

                console.log(

                    "[OffenceUIController] Hotspot clicked:",

                    event?.detail

                );

            }

        };


    /* =====================================================
       40. BIND GLOBAL EVENTS
       ===================================================== */

    UIController.bindEvents =
        function () {

            if (
                UIController.eventsBound
            ) {

                return;

            }


            UIController.eventsBound =
                true;


            /*
             * Store update events.
             */

            window.addEventListener(

                "offence:updated",

                UIController
                    .handleStoreUpdate

            );


            window.addEventListener(

                "offence:data-updated",

                UIController
                    .handleStoreUpdate

            );


            window.addEventListener(

                "offence:data-ready",

                UIController
                    .handleStoreUpdate

            );


            /*
             * Hotspot click.
             */

            window.addEventListener(

                GG.Offence.Constants
                    ?.EVENTS
                    ?.HOTSPOT_CLICK ||

                "offence:hotspot-click",

                UIController
                    .handleHotspotClick

            );

        };


    /* =====================================================
       41. UNBIND GLOBAL EVENTS
       ===================================================== */

    UIController.unbindEvents =
        function () {

            if (
                !UIController.eventsBound
            ) {

                return;

            }


            window.removeEventListener(

                "offence:updated",

                UIController
                    .handleStoreUpdate

            );


            window.removeEventListener(

                "offence:data-updated",

                UIController
                    .handleStoreUpdate

            );


            window.removeEventListener(

                "offence:data-ready",

                UIController
                    .handleStoreUpdate

            );


            window.removeEventListener(

                GG.Offence.Constants
                    ?.EVENTS
                    ?.HOTSPOT_CLICK ||

                "offence:hotspot-click",

                UIController
                    .handleHotspotClick

            );


            UIController.eventsBound =
                false;

        };


    /* =====================================================
       42. DISPATCH EVENT
       ===================================================== */

    UIController.dispatchEvent =
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
                    UIController
                        .isDebugEnabled()
                ) {

                    console.warn(

                        "[OffenceUIController] Event dispatch failed:",

                        eventName,

                        error

                    );

                }

            }

        };


    /* =====================================================
       43. DISPATCH ERROR
       ===================================================== */

    UIController.dispatchError =
        function (
            error
        ) {

            UIController
                .dispatchEvent(

                    UIController
                        .EVENTS
                        .ERROR,

                    {

                        message:

                            error?.message ||

                            String(
                                error ||
                                "Unknown error"
                            ),

                        error:
                            error

                    }

                );

        };


    /* =====================================================
       44. GET STATUS
       ===================================================== */

    UIController.getStatus =
        function () {

            const Renderer =

                GG.Offence
                    .MapRenderer;


            return {

                version:
                    UIController.VERSION,

                initialized:
                    UIController.initialized,

                active:
                    UIController.active,

                loading:
                    UIController.loading,

                mode:
                    UIController.mode,

                mapAvailable:
                    !!UIController
                        .getMap(),

                renderer:

                    typeof Renderer
                        ?.getStatus ===
                        "function"

                        ? Renderer.getStatus()

                        : null,

                source:

                    UIController
                        .getSourceStats(),

                target:

                    UIController
                        .getTargetStats()

            };

        };


    /* =====================================================
       45. INIT
       ===================================================== */

    UIController.init =
        function (
            map = null
        ) {

            if (
                UIController.initialized
            ) {

                if (map) {

                    UIController.map =
                        map;


                    if (
                        typeof GG.Offence
                            .MapRenderer
                            ?.setMap ===
                            "function"
                    ) {

                        GG.Offence
                            .MapRenderer
                            .setMap(
                                map
                            );

                    }

                }


                return UIController;

            }


            if (map) {

                UIController.map =
                    map;

            }


            const root =

                UIController
                    .createControl();


            UIController
                .createMenu(
                    root
                );


            UIController
                .createMainButton(
                    root
                );


            UIController
                .bindEvents();


            UIController
                .updateModeUI();


            /*
             * Cascade remains hidden until
             * hotspot selection.
             */

            if (
                typeof GG.Offence
                    .CascadeRenderer
                    ?.hide ===
                    "function"
            ) {

                GG.Offence
                    .CascadeRenderer
                    .hide();

            }


            /*
             * Initialize MapRenderer only when
             * map already exists.
             *
             * If map is created later, activate()
             * will initialize it.
             */

            const resolvedMap =

                UIController
                    .getMap();


            if (
                resolvedMap &&
                typeof GG.Offence
                    .MapRenderer
                    ?.init ===
                    "function"
            ) {

                GG.Offence
                    .MapRenderer
                    .init(
                        resolvedMap
                    );

            }


            UIController.initialized =
                true;


            if (
                UIController
                    .isDebugEnabled()
            ) {

                console.log(

                    "🔥 OffenceUIController Ready",

                    {

                        version:
                            UIController.VERSION,

                        mode:
                            UIController.mode,

                        mapAvailable:
                            !!resolvedMap,

                        connector:
                            "POR"

                    }

                );

            }


            return UIController;

        };


    /* =====================================================
       46. DESTROY
       ===================================================== */

    UIController.destroy =
        function () {

            UIController
                .deactivate();


            UIController
                .unbindEvents();


            const root =

                UIController
                    .getElement(

                        UIController
                            .IDS
                            .root

                    );


            if (root) {

                root.remove();

            }


            UIController.initialized =
                false;


            UIController.active =
                false;


            UIController.loading =
                false;


            UIController.map =
                null;


            return true;

        };


    /* =====================================================
       47. REGISTER
       ===================================================== */

    GG.Offence.UIController =
        UIController;


    /* =====================================================
       48. AUTO INITIALIZE

       Creates UI controls only.

       Does NOT:
       - load Firestore
       - build engines
       - render heatmaps

       Those operations start when user activates
       Offence Intelligence.
       ===================================================== */

    function autoInit() {

        UIController
            .init();

    }


    if (
        document.readyState ===
            "loading"
    ) {

        document.addEventListener(

            "DOMContentLoaded",

            autoInit,

            {
                once:
                    true
            }

        );

    }

    else {

        autoInit();

    }


    /* =====================================================
       49. READY LOG
       ===================================================== */

    if (
        UIController
            .isDebugEnabled()
    ) {

        console.log(

            "🔥 OffenceUIController Loaded",

            {

                version:
                    UIController.VERSION,

                namespace:
                    "GG.Offence.UIController",

                connector:
                    "POR"

            }

        );

    }


})();
