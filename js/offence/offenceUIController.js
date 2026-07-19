(function (window) {

    "use strict";


    /*=========================================================
      NAMESPACE
    =========================================================*/

    const GG =

        window.GreenGuardAI =

        window.GreenGuardAI || {};


    GG.Offence =

        GG.Offence || {};


    /*=========================================================
      PREVENT DOUBLE LOADING
    =========================================================*/

    if (

        GG.Offence.UIController

    ) {

        console.warn(

            "[GreenGuardAI] Offence UI Controller already loaded."

        );

        return;

    }


    /*=========================================================
      MODULE
    =========================================================*/

    const UIController = {};


    /*=========================================================
      INFO
    =========================================================*/

    UIController.VERSION =

        "1.0.0";


    UIController.initialized =

        false;


    UIController.active =

        false;


    UIController.loading =

        false;


    UIController.mode =

        "both";


    /*=========================================================
      DOM IDS
    =========================================================*/

    UIController.IDS = {

        root:

            "offenceIntelligenceControl",

        button:

            "offenceIntelligenceButton",

        menu:

            "offenceIntelligenceMenu",

        sourceButton:

            "offenceSourceModeButton",

        targetButton:

            "offenceTargetModeButton",

        bothButton:

            "offenceBothModeButton",

        closeButton:

            "offenceModeCloseButton",

        status:

            "offenceIntelligenceStatus"

    };


    /*=========================================================
      GET MAP
    =========================================================*/

    UIController.getMap = function () {

        /*
         * GreenGuard currently uses a global Leaflet map.
         *
         * This function deliberately checks several common
         * locations so the controller does not hard-fail if
         * the map reference changes later.
         */

        return (

            window.map ||

            GG.map ||

            GG.Map ||

            GG.MapController?.map ||

            null

        );

    };


    /*=========================================================
      CHECK DEPENDENCIES
    =========================================================*/

    UIController.checkDependencies = function () {

        const missing = [];


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


    /*=========================================================
      CREATE ROOT CONTROL
    =========================================================*/

    UIController.createControl = function () {

        let root =

            document.getElementById(

                UIController.IDS.root

            );


        if (

            root

        ) {

            return root;

        }


        root =

            document.createElement(

                "div"

            );


        root.id =

            UIController.IDS.root;


        root.className =

            "offence-intelligence-control";


        /*
         * Inline positioning is intentionally minimal.
         *
         * You can move these rules into a dedicated
         * offenceUI.css file later.
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


    /*=========================================================
      CREATE MAIN BUTTON
    =========================================================*/

    UIController.createMainButton = function (

        root

    ) {

        let button =

            document.getElementById(

                UIController.IDS.button

            );


        if (

            button

        ) {

            return button;

        }


        button =

            document.createElement(

                "button"

            );


        button.id =

            UIController.IDS.button;


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


        button.innerHTML = `

            <i class="fa-solid fa-fire-flame-curved"></i>

            <span>
                Offence
            </span>

        `;


        /*----------------------------------
          Temporary Core Styling
        ----------------------------------*/

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

            function (

                event

            ) {

                event.preventDefault();

                event.stopPropagation();


                UIController.toggle();

            }

        );


        root.appendChild(

            button

        );


        return button;

    };


    /*=========================================================
      CREATE MODE BUTTON
    =========================================================*/

    UIController.createModeButton = function (

        id,

        label,

        icon,

        mode

    ) {

        const button =

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


        button.addEventListener(

            "click",

            async function (

                event

            ) {

                event.preventDefault();

                event.stopPropagation();


                await UIController.setMode(

                    mode

                );

            }

        );


        return button;

    };


    /*=========================================================
      CREATE MENU
    =========================================================*/

    UIController.createMenu = function (

        root

    ) {

        let menu =

            document.getElementById(

                UIController.IDS.menu

            );


        if (

            menu

        ) {

            return menu;

        }


        menu =

            document.createElement(

                "div"

            );


        menu.id =

            UIController.IDS.menu;


        menu.className =

            "offence-intelligence-menu";


        menu.style.display =

            "none";


        menu.style.width =

            "210px";


        menu.style.padding =

            "10px";


        menu.style.borderRadius =

            "12px";


        menu.style.background =

            "#ffffff";


        menu.style.boxShadow =

            "0 6px 24px rgba(0,0,0,0.22)";


        /*----------------------------------
          Header
        ----------------------------------*/

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


        header.innerHTML = `

            <strong>

                Offence Intelligence

            </strong>

        `;


        /*----------------------------------
          Close Button
        ----------------------------------*/

        const closeButton =

            document.createElement(

                "button"

            );


        closeButton.id =

            UIController.IDS.closeButton;


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


                UIController.deactivate();

            }

        );


        header.appendChild(

            closeButton

        );


        menu.appendChild(

            header

        );


        /*----------------------------------
          BOTH
        ----------------------------------*/

        menu.appendChild(

            UIController.createModeButton(

                UIController.IDS.bothButton,

                "Source + Target",

                "fa-solid fa-layer-group",

                "both"

            )

        );


        /*----------------------------------
          SOURCE
        ----------------------------------*/

        menu.appendChild(

            UIController.createModeButton(

                UIController.IDS.sourceButton,

                "Source Hotspots",

                "fa-solid fa-house-user",

                "source"

            )

        );


        /*----------------------------------
          TARGET
        ----------------------------------*/

        menu.appendChild(

            UIController.createModeButton(

                UIController.IDS.targetButton,

                "Target Hotspots",

                "fa-solid fa-location-crosshairs",

                "target"

            )

        );


        /*----------------------------------
          Status
        ----------------------------------*/

        const status =

            document.createElement(

                "div"

            );


        status.id =

            UIController.IDS.status;


        status.className =

            "offence-intelligence-status";


        status.style.marginTop =

            "9px";


        status.style.fontSize =

            "12px";


        status.style.opacity =

            "0.75";


        status.textContent =

            "Inactive";


        menu.appendChild(

            status

        );


        /*
         * Insert menu BEFORE main button
         * so it visually expands upward.
         */

        root.insertBefore(

            menu,

            root.firstChild

        );


        return menu;

    };


    /*=========================================================
      GET ELEMENT
    =========================================================*/

    UIController.getElement = function (

        id

    ) {

        return document.getElementById(

            id

        );

    };


    /*=========================================================
      SET STATUS
    =========================================================*/

    UIController.setStatus = function (

        message

    ) {

        const status =

            UIController.getElement(

                UIController.IDS.status

            );


        if (

            status

        ) {

            status.textContent =

                message || "";

        }

    };


    /*=========================================================
      SET LOADING
    =========================================================*/

    UIController.setLoading = function (

        loading

    ) {

        UIController.loading =

            !!loading;


        const button =

            UIController.getElement(

                UIController.IDS.button

            );


        if (

            !button

        ) {

            return;

        }


        button.disabled =

            UIController.loading;


        if (

            UIController.loading

        ) {

            button.classList.add(

                "is-loading"

            );

        }

        else {

            button.classList.remove(

                "is-loading"

            );

        }

    };


    /*=========================================================
      UPDATE ACTIVE MODE UI
    =========================================================*/

    UIController.updateModeUI = function () {

        const buttons = [

            UIController.IDS.bothButton,

            UIController.IDS.sourceButton,

            UIController.IDS.targetButton

        ];


        buttons.forEach(

            function (

                id

            ) {

                const button =

                    UIController.getElement(

                        id

                    );


                if (

                    !button

                ) {

                    return;

                }


                if (

                    button.dataset.mode ===

                    UIController.mode

                ) {

                    button.classList.add(

                        "is-active"

                    );


                    button.style.fontWeight =

                        "700";

                }

                else {

                    button.classList.remove(

                        "is-active"

                    );


                    button.style.fontWeight =

                        "400";

                }

            }

        );

    };


    /*=========================================================
      BUILD OFFENCE ENGINES
    =========================================================*/

    UIController.buildData = async function () {

        const SourceEngine =

            GG.Offence.SourceEngine;


        const TargetEngine =

            GG.Offence.TargetEngine;


        const source =

            await SourceEngine

                .buildFromStore();


        const target =

            await TargetEngine

                .buildFromStore();


        return {

            source:

                source || [],

            target:

                target || []

        };

    };


    /*=========================================================
      BUILD HEATMAP ENGINE
    =========================================================*/

    UIController.buildHeatmap = async function () {

        const HeatmapEngine =

            GG.Offence.HeatmapEngine;


        if (

            !HeatmapEngine

        ) {

            return null;

        }


        /*
         * Different engine implementations may expose
         * buildFromEngines() or build().
         *
         * Prefer buildFromEngines if available.
         */

        if (

            typeof HeatmapEngine

                .buildFromEngines ===

            "function"

        ) {

            return await HeatmapEngine

                .buildFromEngines();

        }


        if (

            typeof HeatmapEngine.build ===

            "function"

        ) {

            return await HeatmapEngine

                .build({

                    source:

                        GG.Offence
                            .SourceEngine
                            .getHotspots(),

                    target:

                        GG.Offence
                            .TargetEngine
                            .getHotspots()

                });

        }


        return null;

    };


    /*=========================================================
      RENDER CURRENT MODE
    =========================================================*/

    UIController.render = async function () {

        const Renderer =

            GG.Offence.MapRenderer;


        if (

            !Renderer

        ) {

            throw new Error(

                "OffenceMapRenderer unavailable."

            );

        }


        /*----------------------------------
          Clear Existing Offence Layers
        ----------------------------------*/

        if (

            typeof Renderer.clear ===

            "function"

        ) {

            Renderer.clear();

        }


        /*----------------------------------
          Unified Render Method
        ----------------------------------*/

        if (

            typeof Renderer.render ===

            "function"

        ) {

            return await Renderer.render({

                mode:

                    UIController.mode,

                source:

                    GG.Offence
                        .SourceEngine
                        .getHotspots(),

                target:

                    GG.Offence
                        .TargetEngine
                        .getHotspots(),

                sourceHeatmap:

                    GG.Offence
                        .SourceEngine
                        .getHeatmapData(),

                targetHeatmap:

                    GG.Offence
                        .TargetEngine
                        .getHeatmapData()

            });

        }


        /*----------------------------------
          Mode-Specific Fallback Methods
        ----------------------------------*/

        if (

            UIController.mode ===

            "source"

        ) {

            if (

                typeof Renderer
                    .renderSource ===

                "function"

            ) {

                return await Renderer

                    .renderSource();

            }

        }


        if (

            UIController.mode ===

            "target"

        ) {

            if (

                typeof Renderer
                    .renderTarget ===

                "function"

            ) {

                return await Renderer

                    .renderTarget();

            }

        }


        if (

            UIController.mode ===

            "both"

        ) {

            if (

                typeof Renderer
                    .renderBoth ===

                "function"

            ) {

                return await Renderer

                    .renderBoth();

            }

        }


        console.warn(

            "[OffenceUIController] No compatible MapRenderer render method found."

        );


        return null;

    };


    /*=========================================================
      ACTIVATE
    =========================================================*/

    UIController.activate = async function () {

        if (

            UIController.loading

        ) {

            return;

        }


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

                "Modules unavailable"

            );


            return;

        }


        UIController.setLoading(

            true

        );


        try {

            UIController.active =

                true;


            /*----------------------------------
              Open Control Menu
            ----------------------------------*/

            const menu =

                UIController.getElement(

                    UIController.IDS.menu

                );


            if (

                menu

            ) {

                menu.style.display =

                    "block";

            }


            /*----------------------------------
              Cascade Starts Hidden
            ----------------------------------*/

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


            UIController.setStatus(

                "Building offence intelligence..."

            );


            /*----------------------------------
              Build Source + Target
            ----------------------------------*/

            await UIController

                .buildData();


            /*----------------------------------
              Build Unified Heatmap
            ----------------------------------*/

            await UIController

                .buildHeatmap();


            /*----------------------------------
              Render Current Mode
            ----------------------------------*/

            await UIController

                .render();


            /*----------------------------------
              Update UI
            ----------------------------------*/

            UIController

                .updateModeUI();


            const sourceStats =

                GG.Offence
                    .SourceEngine
                    .getStats();


            const targetStats =

                GG.Offence
                    .TargetEngine
                    .getStats();


            UIController.setStatus(

                "Source: " +

                (

                    sourceStats.hotspots ||

                    0

                ) +

                " | Target: " +

                (

                    targetStats.hotspots ||

                    0

                )

            );


            const button =

                UIController.getElement(

                    UIController.IDS.button

                );


            if (

                button

            ) {

                button.classList.add(

                    "is-active"

                );

            }


            console.log(

                "🔥 Offence Intelligence Active",

                {

                    mode:

                        UIController.mode,

                    source:

                        sourceStats,

                    target:

                        targetStats

                }

            );

        }

        catch (

            error

        ) {

            console.error(

                "[OffenceUIController] Activation failed:",

                error

            );


            UIController.setStatus(

                "Unable to activate"

            );

        }

        finally {

            UIController.setLoading(

                false

            );

        }

    };


    /*=========================================================
      DEACTIVATE
    =========================================================*/

    UIController.deactivate = function () {

        UIController.active =

            false;


        /*----------------------------------
          Hide Menu
        ----------------------------------*/

        const menu =

            UIController.getElement(

                UIController.IDS.menu

            );


        if (

            menu

        ) {

            menu.style.display =

                "none";

        }


        /*----------------------------------
          Clear Map Layers
        ----------------------------------*/

        const Renderer =

            GG.Offence.MapRenderer;


        if (

            typeof Renderer?.clear ===

            "function"

        ) {

            Renderer.clear();

        }


        /*----------------------------------
          Hide Cascade
        ----------------------------------*/

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


        /*----------------------------------
          Main Button State
        ----------------------------------*/

        const button =

            UIController.getElement(

                UIController.IDS.button

            );


        if (

            button

        ) {

            button.classList.remove(

                "is-active"

            );

        }


        UIController.setStatus(

            "Inactive"

        );


        console.log(

            "🔥 Offence Intelligence Inactive"

        );

    };


    /*=========================================================
      TOGGLE
    =========================================================*/

    UIController.toggle = async function () {

        if (

            UIController.active

        ) {

            UIController

                .deactivate();

            return;

        }


        await UIController

            .activate();

    };


    /*=========================================================
      SET MODE
    =========================================================*/

    UIController.setMode = async function (

        mode

    ) {

        const allowed = [

            "both",

            "source",

            "target"

        ];


        if (

            !allowed.includes(

                mode

            )

        ) {

            console.warn(

                "[OffenceUIController] Invalid mode:",

                mode

            );

            return;

        }


        UIController.mode =

            mode;


        UIController

            .updateModeUI();


        if (

            !UIController.active

        ) {

            return;

        }


        UIController.setLoading(

            true

        );


        try {

            UIController.setStatus(

                "Rendering " +

                mode +

                " hotspots..."

            );


            await UIController

                .render();


            const sourceStats =

                GG.Offence
                    .SourceEngine
                    .getStats();


            const targetStats =

                GG.Offence
                    .TargetEngine
                    .getStats();


            UIController.setStatus(

                "Source: " +

                (

                    sourceStats.hotspots ||

                    0

                ) +

                " | Target: " +

                (

                    targetStats.hotspots ||

                    0

                )

            );

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

        }

        finally {

            UIController.setLoading(

                false

            );

        }

    };


    /*=========================================================
      REFRESH
    =========================================================*/

    UIController.refresh = async function () {

        if (

            !UIController.active

        ) {

            return;

        }


        if (

            UIController.loading

        ) {

            return;

        }


        UIController.setLoading(

            true

        );


        try {

            UIController.setStatus(

                "Refreshing..."

            );


            await UIController

                .buildData();


            await UIController

                .buildHeatmap();


            await UIController

                .render();


            const sourceStats =

                GG.Offence
                    .SourceEngine
                    .getStats();


            const targetStats =

                GG.Offence
                    .TargetEngine
                    .getStats();


            UIController.setStatus(

                "Source: " +

                (

                    sourceStats.hotspots ||

                    0

                ) +

                " | Target: " +

                (

                    targetStats.hotspots ||

                    0

                )

            );

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

        }

        finally {

            UIController.setLoading(

                false

            );

        }

    };


    /*=========================================================
      HANDLE STORE UPDATE
    =========================================================*/

    UIController.handleStoreUpdate = function () {

        /*
         * Daily offence records may increase.
         *
         * If offence mode is currently active,
         * rebuild the intelligence layers.
         */

        if (

            !UIController.active

        ) {

            return;

        }


        UIController

            .refresh();

    };


    /*=========================================================
      BIND GLOBAL EVENTS
    =========================================================*/

    UIController.bindEvents = function () {

        /*
         * These event names can be dispatched by
         * OffenceStore after load/update.
         *
         * Duplicate listeners are prevented by init().
         */

        window.addEventListener(

            "offence:updated",

            UIController.handleStoreUpdate

        );


        window.addEventListener(

            "offence:data-updated",

            UIController.handleStoreUpdate

        );

    };


    /*=========================================================
      INIT
    =========================================================*/

    UIController.init = function () {

        if (

            UIController.initialized

        ) {

            return;

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
         * Cascade should never be visible
         * merely because UIController loaded.
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


        UIController.initialized =

            true;


        console.log(

            "%cOffence UI Controller Ready",

            "color:#d32f2f;font-weight:bold;"

        );

    };


    /*=========================================================
      REGISTER
    =========================================================*/

    GG.Offence.UIController =

        UIController;


    /*=========================================================
      AUTO INIT
    =========================================================*/

    if (

        document.readyState ===

        "loading"

    ) {

        document.addEventListener(

            "DOMContentLoaded",

            function () {

                UIController.init();

            },

            {

                once:

                    true

            }

        );

    }

    else {

        UIController.init();

    }


})(window);
