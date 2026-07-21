/* ============================================================
   GREENGUARD
   OFFENCE UI CONTROLLER

   File:
   js/offence/offenceUIController.js

   Version:
   3.0.1
============================================================ */

(function () {

    "use strict";


    /* ========================================================
       ROOT NAMESPACE

       IMPORTANT:
       Do not depend on an IIFE parameter here.

       The application already uses:

           window.GG

       We retrieve/create it directly from window.
    ======================================================== */

    window.GG =
        window.GG ||
        {};


    const GG =
        window.GG;


    /* ========================================================
       OFFENCE NAMESPACE
    ======================================================== */

    GG.Offence =
        GG.Offence ||
        {};


    /* ========================================================
       MODULE GUARD

       Remove an old UI instance if this script is reloaded.

       We do NOT delete:
       - Store
       - SpatialEngine
       - SpatialRenderer
    ======================================================== */

    if (
        GG.Offence
            .UIController
            ?.destroy &&
        typeof
        GG.Offence
            .UIController
            .destroy ===
        "function"
    ) {

        try {

            GG.Offence
                .UIController
                .destroy();

        }

        catch (
            error
        ) {

            console.warn(
                "⚠ Previous OffenceUIController cleanup failed:",
                error
            );

        }

    }


    /* ========================================================
       UI CONTROLLER
    ======================================================== */

    const UIController = {

        VERSION:
            "3.0.1",


        MODULE_NAME:
            "OffenceUIController",


        initialized:
            false,


        ready:
            false,


        panelOpen:
            false,


        activeMode:
            null,


        preparing:
            false,


        lastPreparedAt:
            null,


        lastError:
            null,


        __preparePromise:
            null,


        elements:
            {},


CONFIG: {

    /* ========================================================
       DOM IDS
    ======================================================== */

    BUTTON_ID:
        "gg-offence-main-button",

    PANEL_ID:
        "gg-offence-analysis-panel",

    CLOSE_BUTTON_ID:
        "gg-offence-close-button",

    SOURCE_BUTTON_ID:
        "gg-offence-source-button",

    TARGET_BUTTON_ID:
        "gg-offence-target-button",

    CLEAR_BUTTON_ID:
        "gg-offence-clear-button",

    STATUS_ID:
        "gg-offence-status",

    STYLE_ID:
        "gg-offence-ui-styles",


    /* ========================================================
       POSITION

       OFFENCE button:
       Right side of map, below Chat/AI control.

       Adjust BUTTON_TOP only if your Chat button position
       changes later.
    ======================================================== */

    BUTTON_TOP:
        145,

    BUTTON_RIGHT:
        20,

    PANEL_GAP:
        10,

    PANEL_WIDTH:
        260,

    Z_INDEX:
        10000,


    /* ========================================================
       STORE WAIT CONFIG
    ======================================================== */

    STORE_WAIT_ATTEMPTS:
        240,

    STORE_WAIT_INTERVAL:
        250

},


        /* ====================================================
           GET OFFENCE STORE
        ==================================================== */

        getStore:
            function () {

                return window.GG
                    ?.Offence
                    ?.Store ||
                    null;

            },
        /* ====================================================
           GET OFFENCE DATA LOADER

           AUTHORITATIVE DATA ENTRY POINT:

           DataLoader.load()
               ↓
           Firestore
               ↓
           Offence Store
        ==================================================== */

        getDataLoader:
            function () {

                return window.GG
                    ?.Offence
                    ?.DataLoader ||
                    null;

            },



        /* ====================================================
           GET SPATIAL ENGINE
        ==================================================== */

        getSpatialEngine:
            function () {

                return window.GG
                    ?.Offence
                    ?.SpatialEngine ||
                    null;

            },


        /* ====================================================
           GET SPATIAL RENDERER
        ==================================================== */

        getSpatialRenderer:
            function () {

                return window.GG
                    ?.Offence
                    ?.SpatialRenderer ||
                    null;

            },



        /* ====================================================
           INITIALIZE UI CONTROLLER

           IMPORTANT:

           This initializes only the UI.

           It does NOT force the SpatialEngine to build here.

           Spatial preparation happens when:

           1. User opens OFFENCE panel
              OR

           2. User clicks SOURCE
              OR

           3. User clicks TARGET

           This reproduces the timing of the manual sequence
           that was already proven to work.
        ==================================================== */

        init:
            function () {


                /* ============================================
                   ALREADY INITIALIZED
                ============================================ */

                if (
                    UIController.initialized ===
                    true
                ) {


                    UIController
                        .refreshElementReferences();


                    return true;


                }



                /* ============================================
                   MARK INITIALIZED
                ============================================ */

                UIController.initialized =
                    true;



                try {


                    /* ========================================
                       INJECT CONTROLLER CSS
                    ======================================== */

                    UIController
                        .injectStyles();



                    /* ========================================
                       REMOVE OLD / DUPLICATE OFFENCE UI

                       This removes UI elements only.

                       It does NOT remove:

                       - Store
                       - SpatialEngine
                       - SpatialRenderer
                       - spatial indexes
                    ======================================== */

                    UIController
                        .removeLegacyUI();



                    /* ========================================
                       CREATE NEW MAIN OFFENCE BUTTON
                    ======================================== */

                    UIController
                        .createMainButton();



                    /* ========================================
                       CREATE NEW ANALYSIS PANEL
                    ======================================== */

                    UIController
                        .createPanel();



                    /* ========================================
                       GET DOM REFERENCES
                    ======================================== */

                    UIController
                        .refreshElementReferences();



                    /* ========================================
                       BIND BUTTON EVENTS
                    ======================================== */

                    UIController
                        .bindEvents();



                    /* ========================================
                       INITIAL STATUS
                    ======================================== */

                    UIController
                        .updateStatus(

                            "Offence spatial analysis ready.",

                            "ready"

                        );



                    /* ========================================
                       READY
                    ======================================== */

                    UIController.ready =
                        true;



                    console.log(

                        "🚨 OffenceUIController Ready",

                        UIController
                            .getStats?.()

                    );



                    return true;


                }


                catch (
                    error
                ) {


                    UIController.ready =
                        false;


                    UIController.lastError =
                        error;



                    console.error(

                        "❌ OffenceUIController initialization failed:",

                        error

                    );



                    return false;


                }


            },


               /* ====================================================
           REMOVE LEGACY / DUPLICATE OFFENCE UI

           PURPOSE
           ----------------------------------------------------

           Remove only old UI elements that may conflict with
           the new Offence Spatial Analysis UI.

           IMPORTANT:

           This does NOT touch:

           - GG.Offence.Store
           - GG.Offence.SpatialEngine
           - GG.Offence.SpatialRenderer
           - Leaflet layers
           - GIS data
           - Village polygons
           - Range polygons

           It removes DOM elements only.
        ==================================================== */

        removeLegacyUI:
            function () {


                const selectors = [

                    "#offenceButton",

                    "#offence-btn",

                    "#offenceBtn",

                    "#offence-analysis-button",

                    "#offenceAnalysisButton",


                    /*
                     * Remove previous instances of our own
                     * generated UI before recreating them.
                     */

                    "#" +
                        UIController
                            .CONFIG
                            .BUTTON_ID,


                    "#" +
                        UIController
                            .CONFIG
                            .PANEL_ID

                ];



                selectors.forEach(

                    function (
                        selector
                    ) {


                        try {


                            const element =
                                document
                                    .querySelector(
                                        selector
                                    );



                            if (
                                element
                            ) {


                                element
                                    .remove();


                            }


                        }


                        catch (
                            error
                        ) {


                            /*
                             * Ignore missing or invalid
                             * legacy selectors.
                             */


                        }


                    }

                );


            },



        /* ====================================================
           INJECT UI STYLES

           POSITION DESIGN
           ----------------------------------------------------

           Desktop:

                    RIGHT SIDE

                 [ Chat / AI ]
                      ↓

                 [ OFFENCE ]
                      ↓

              ┌───────────────┐
              │ OFFENCE PANEL │
              └───────────────┘


           The button uses:

           CONFIG.BUTTON_TOP
           CONFIG.BUTTON_RIGHT

           The panel is positioned immediately below it.

           This prevents the Offence button from sitting over
           the Monthly Status panel as happened previously.
        ==================================================== */

        injectStyles:
            function () {


                /* ============================================
                   REMOVE OLD STYLE BLOCK
                ============================================ */

                const existingStyle =
                    document
                        .getElementById(

                            UIController
                                .CONFIG
                                .STYLE_ID

                        );



                if (
                    existingStyle
                ) {


                    existingStyle
                        .remove();


                }



                /* ============================================
                   CREATE STYLE ELEMENT
                ============================================ */

                const style =
                    document
                        .createElement(
                            "style"
                        );



                style.id =
                    UIController
                        .CONFIG
                        .STYLE_ID;



                /* ============================================
                   POSITION VALUES
                ============================================ */

                const buttonTop =
                    UIController
                        .CONFIG
                        .BUTTON_TOP;



                const buttonRight =
                    UIController
                        .CONFIG
                        .BUTTON_RIGHT;



                /*
                 * Main button height:
                 *
                 * 48 px
                 *
                 * Panel gap:
                 *
                 * CONFIG.PANEL_GAP
                 */

                const panelTop =
                    buttonTop +
                    48 +
                    UIController
                        .CONFIG
                        .PANEL_GAP;



                const panelWidth =
                    UIController
                        .CONFIG
                        .PANEL_WIDTH;



                const zIndex =
                    UIController
                        .CONFIG
                        .Z_INDEX;



                /* ============================================
                   CSS
                ============================================ */

                style.textContent =
                    `


                    /* ========================================
                       OFFENCE MAIN BUTTON
                    ======================================== */

                    #${UIController.CONFIG.BUTTON_ID} {

                        position:
                            fixed;


                        top:
                            ${buttonTop}px;


                        right:
                            ${buttonRight}px;


                        z-index:
                            ${zIndex};


                        display:
                            flex;


                        align-items:
                            center;


                        justify-content:
                            center;


                        gap:
                            8px;


                        min-width:
                            126px;


                        height:
                            48px;


                        padding:
                            0 17px;


                        margin:
                            0;


                        border:
                            1px solid
                            rgba(
                                255,
                                255,
                                255,
                                0.55
                            );


                        border-radius:
                            17px;


                        outline:
                            none;


                        background:
                            rgba(
                                255,
                                255,
                                255,
                                0.96
                            );


                        color:
                            #18202a;


                        font-family:
                            Arial,
                            Helvetica,
                            sans-serif;


                        font-size:
                            14px;


                        font-weight:
                            800;


                        letter-spacing:
                            0.3px;


                        line-height:
                            1;


                        cursor:
                            pointer;


                        box-sizing:
                            border-box;


                        box-shadow:
                            0 8px 28px
                            rgba(
                                0,
                                0,
                                0,
                                0.26
                            );


                        backdrop-filter:
                            blur(
                                12px
                            );


                        -webkit-backdrop-filter:
                            blur(
                                12px
                            );


                        transition:
                            transform
                            0.18s
                            ease,

                            box-shadow
                            0.18s
                            ease,

                            background
                            0.18s
                            ease;

                    }



                    #${UIController.CONFIG.BUTTON_ID}:hover {

                        transform:
                            translateY(
                                -2px
                            );


                        box-shadow:
                            0 11px 32px
                            rgba(
                                0,
                                0,
                                0,
                                0.32
                            );

                    }



                    #${UIController.CONFIG.BUTTON_ID}:active {

                        transform:
                            translateY(
                                0
                            );

                    }



                    #${UIController.CONFIG.BUTTON_ID}.gg-offence-open {

                        background:
                            rgba(
                                245,
                                247,
                                249,
                                0.99
                            );


                        box-shadow:
                            0 10px 32px
                            rgba(
                                0,
                                0,
                                0,
                                0.30
                            );

                    }





                    /* ========================================
                       OFFENCE ANALYSIS PANEL
                    ======================================== */

                    #${UIController.CONFIG.PANEL_ID} {

                        position:
                            fixed;


                        top:
                            ${panelTop}px;


                        right:
                            ${buttonRight}px;


                        z-index:
                            ${zIndex};


                        width:
                            ${panelWidth}px;


                        display:
                            none;


                        overflow:
                            hidden;


                        box-sizing:
                            border-box;


                        border:
                            1px solid
                            rgba(
                                255,
                                255,
                                255,
                                0.52
                            );


                        border-radius:
                            18px;


                        background:
                            rgba(
                                248,
                                249,
                                250,
                                0.97
                            );


                        box-shadow:
                            0 12px 36px
                            rgba(
                                0,
                                0,
                                0,
                                0.30
                            );


                        backdrop-filter:
                            blur(
                                16px
                            );


                        -webkit-backdrop-filter:
                            blur(
                                16px
                            );


                        font-family:
                            Arial,
                            Helvetica,
                            sans-serif;

                    }





                    /* ========================================
                       PANEL OPEN STATE
                    ======================================== */

                    #${UIController.CONFIG.PANEL_ID}.gg-offence-panel-open {

                        display:
                            block;

                    }





                    /* ========================================
                       PANEL HEADER
                    ======================================== */

                    .gg-offence-panel-header {

                        display:
                            flex;


                        align-items:
                            center;


                        justify-content:
                            space-between;


                        width:
                            100%;


                        min-height:
                            52px;


                        padding:
                            0 10px
                            0 15px;


                        box-sizing:
                            border-box;


                        border-bottom:
                            1px solid
                            rgba(
                                0,
                                0,
                                0,
                                0.08
                            );

                    }





                    /* ========================================
                       PANEL TITLE
                    ======================================== */

                    .gg-offence-panel-title {

                        display:
                            flex;


                        align-items:
                            center;


                        gap:
                            6px;


                        color:
                            #27313b;


                        font-size:
                            14px;


                        font-weight:
                            900;


                        letter-spacing:
                            0.25px;


                        white-space:
                            nowrap;

                    }





                    /* ========================================
                       CLOSE BUTTON
                    ======================================== */

                    #${UIController.CONFIG.CLOSE_BUTTON_ID} {

                        width:
                            34px;


                        height:
                            34px;


                        display:
                            flex;


                        align-items:
                            center;


                        justify-content:
                            center;


                        padding:
                            0;


                        margin:
                            0;


                        border:
                            0;


                        border-radius:
                            50%;


                        outline:
                            none;


                        background:
                            transparent;


                        color:
                            #66717d;


                        font-size:
                            21px;


                        font-weight:
                            400;


                        line-height:
                            1;


                        cursor:
                            pointer;


                        transition:
                            background
                            0.15s
                            ease,

                            color
                            0.15s
                            ease;

                    }



                    #${UIController.CONFIG.CLOSE_BUTTON_ID}:hover {

                        background:
                            rgba(
                                0,
                                0,
                                0,
                                0.07
                            );


                        color:
                            #202832;

                    }





                    /* ========================================
                       STATUS AREA
                    ======================================== */

                    #${UIController.CONFIG.STATUS_ID} {

                        width:
                            100%;


                        min-height:
                            38px;


                        display:
                            flex;


                        align-items:
                            center;


                        padding:
                            8px 15px;


                        box-sizing:
                            border-box;


                        border-bottom:
                            1px solid
                            rgba(
                                0,
                                0,
                                0,
                                0.07
                            );


                        color:
                            #687582;


                        font-size:
                            11px;


                        font-weight:
                            500;


                        line-height:
                            1.4;

                    }





                    /* ========================================
                       STATUS — READY
                    ======================================== */

                    #${UIController.CONFIG.STATUS_ID}[data-state="ready"] {

                        color:
                            #687582;

                    }





                    /* ========================================
                       STATUS — LOADING
                    ======================================== */

                    #${UIController.CONFIG.STATUS_ID}[data-state="loading"] {

                        color:
                            #946200;

                    }





                    /* ========================================
                       STATUS — SUCCESS
                    ======================================== */

                    #${UIController.CONFIG.STATUS_ID}[data-state="success"] {

                        color:
                            #14733c;

                    }





                    /* ========================================
                       STATUS — ERROR
                    ======================================== */

                    #${UIController.CONFIG.STATUS_ID}[data-state="error"] {

                        color:
                            #b42318;

                    }





                    /* ========================================
                       ACTION BUTTON CONTAINER
                    ======================================== */

                    .gg-offence-panel-actions {

                        display:
                            flex;


                        flex-direction:
                            column;


                        gap:
                            9px;


                        width:
                            100%;


                        padding:
                            10px;


                        box-sizing:
                            border-box;

                    }





                    /* ========================================
                       SOURCE / TARGET / CLEAR BUTTONS
                    ======================================== */

                    .gg-offence-action-button {

                        width:
                            100%;


                        min-height:
                            45px;


                        display:
                            flex;


                        align-items:
                            center;


                        justify-content:
                            flex-start;


                        gap:
                            11px;


                        padding:
                            0 14px;


                        margin:
                            0;


                        box-sizing:
                            border-box;


                        border:
                            1px solid
                            rgba(
                                0,
                                0,
                                0,
                                0.09
                            );


                        border-radius:
                            12px;


                        outline:
                            none;


                        background:
                            rgba(
                                255,
                                255,
                                255,
                                0.92
                            );


                        color:
                            #27313b;


                        font-family:
                            Arial,
                            Helvetica,
                            sans-serif;


                        font-size:
                            14px;


                        font-weight:
                            800;


                        text-align:
                            left;


                        cursor:
                            pointer;


                        transition:
                            transform
                            0.15s
                            ease,

                            background
                            0.15s
                            ease,

                            box-shadow
                            0.15s
                            ease;

                    }



                    .gg-offence-action-button:hover {

                        transform:
                            translateY(
                                -1px
                            );


                        background:
                            #ffffff;


                        box-shadow:
                            0 4px 12px
                            rgba(
                                0,
                                0,
                                0,
                                0.09
                            );

                    }





                    /* ========================================
                       ACTIVE MODE

                       SOURCE selected
                       OR
                       TARGET selected
                    ======================================== */

                    .gg-offence-action-button.gg-active {

                        background:
                            rgba(
                                226,
                                241,
                                253,
                                0.98
                            );


                        outline:
                            2px solid
                            rgba(
                                29,
                                112,
                                184,
                                0.34
                            );


                        box-shadow:
                            0 3px 12px
                            rgba(
                                29,
                                112,
                                184,
                                0.14
                            );

                    }





                    /* ========================================
                       CLEAR BUTTON
                    ======================================== */

                    #${UIController.CONFIG.CLEAR_BUTTON_ID} {

                        color:
                            #b42318;

                    }





                    /* ========================================
                       ACTION ICON
                    ======================================== */

                    .gg-offence-action-icon {

                        width:
                            22px;


                        flex:
                            0 0
                            22px;


                        text-align:
                            center;


                        font-size:
                            17px;

                    }



/* ========================================
   CASE RESULTS HEADER
======================================== */

.gg-offence-case-results-header{

    padding:10px 14px;

    border-top:1px solid rgba(0,0,0,.08);

    border-bottom:1px solid rgba(0,0,0,.08);

    background:#f7f8fa;

    font-size:12px;

    font-weight:800;

    letter-spacing:.4px;

    color:#46515c;

}



/* ========================================
   CASE RESULTS CONTAINER
======================================== */

#gg-offence-case-results{

    min-height:120px;

    max-height:260px;

    overflow-y:auto;

    padding:10px;

    box-sizing:border-box;

}



/* ========================================
   EMPTY MESSAGE
======================================== */

.gg-offence-empty{

    padding:18px 10px;

    text-align:center;

    color:#7b8794;

    font-size:12px;

    line-height:1.6;

}



/* ========================================
   CONTEXT HEADER
======================================== */

.gg-offence-case-context{

    margin-bottom:10px;

    padding:10px;

    border-radius:10px;

    background:#eef5fb;

    border:1px solid rgba(29,112,184,.18);

}



.gg-offence-case-context-title{

    font-size:12px;

    font-weight:700;

    color:#234;

    margin-bottom:6px;

}



.gg-offence-case-count{

    margin-top:6px;

    font-size:11px;

    color:#5a6672;

    font-weight:700;

}



/* ========================================
   CASE CARD
======================================== */

.gg-offence-case-card{

    padding:12px;

    margin-bottom:10px;

    border-radius:12px;

    background:#fff;

    border:1px solid rgba(0,0,0,.08);

    cursor:pointer;

    transition:.15s;

}



.gg-offence-case-card:hover{

    transform:translateY(-1px);

    box-shadow:0 4px 12px rgba(0,0,0,.12);

}



/* ========================================
   POR NUMBER
======================================== */

.gg-offence-case-title{

    font-size:13px;

    font-weight:800;

    color:#1f2933;

}



/* ========================================
   DATE / SPECIES
======================================== */

.gg-offence-case-meta{

    margin-top:6px;

    font-size:11px;

    color:#6d7782;

    line-height:1.5;

}



/* ========================================
   VIEW LINK
======================================== */

.gg-offence-case-view{

    margin-top:8px;

    font-size:12px;

    font-weight:700;

    color:#1565c0;

}

                    /* ========================================
                       SHORT DESKTOP SCREENS

                       If screen height is small, fixed TOP
                       positioning may push the panel too low.

                       In that situation move both controls to
                       bottom-based positioning.
                    ======================================== */

                    @media (
                        max-height:
                        760px
                    ) {


                        #${UIController.CONFIG.BUTTON_ID} {

                            top:
                                auto;


                            bottom:
                                88px;

                        }



                        #${UIController.CONFIG.PANEL_ID} {

                            top:
                                auto;


                            bottom:
                                146px;

                        }


                    }





                    /* ========================================
                       MOBILE / NARROW SCREEN
                    ======================================== */

                    @media (
                        max-width:
                        700px
                    ) {


                        #${UIController.CONFIG.BUTTON_ID} {

                            top:
                                auto;


                            right:
                                12px;


                            bottom:
                                88px;


                            min-width:
                                112px;


                            height:
                                44px;


                            padding:
                                0 14px;


                            border-radius:
                                15px;

                        }



                        #${UIController.CONFIG.PANEL_ID} {

                            top:
                                auto;


                            right:
                                12px;


                            bottom:
                                142px;


                            width:
                                min(
                                    ${panelWidth}px,
                                    calc(
                                        100vw - 24px
                                    )
                                );

                        }


                    }


                    `;



                /* ============================================
                   ADD CSS TO DOCUMENT
                ============================================ */

                document
                    .head
                    .appendChild(
                        style
                    );


            },

               /* ====================================================
           CREATE MAIN OFFENCE BUTTON
        ==================================================== */

        createMainButton:
            function () {


                /* ============================================
                   REMOVE EXISTING INSTANCE
                ============================================ */

                const existing =
                    document
                        .getElementById(

                            UIController
                                .CONFIG
                                .BUTTON_ID

                        );


                if (
                    existing
                ) {

                    existing
                        .remove();

                }



                /* ============================================
                   CREATE BUTTON
                ============================================ */

                const button =
                    document
                        .createElement(
                            "button"
                        );


                button.id =
                    UIController
                        .CONFIG
                        .BUTTON_ID;


                button.type =
                    "button";


                button.title =
                    "Open Offence Spatial Analysis";


                button.setAttribute(
                    "aria-label",
                    "Open Offence Spatial Analysis"
                );


                button.setAttribute(
                    "aria-expanded",
                    "false"
                );


                button.innerHTML =
                    `
                        <span
                            aria-hidden="true"
                        >
                            🚨
                        </span>

                        <span>
                            OFFENCE
                        </span>
                    `;



                /* ============================================
                   ADD TO PAGE

                   We append directly to document.body so the
                   button is independent of existing map panels.

                   Position is controlled entirely by Part 2 CSS.
                ============================================ */

                document
                    .body
                    .appendChild(
                        button
                    );


                return button;


            },



        /* ====================================================
           CREATE OFFENCE ANALYSIS PANEL
        ==================================================== */

createPanel:
    function () {


        /* ============================================
           REMOVE EXISTING INSTANCE
        ============================================ */

        const existing =
            document
                .getElementById(

                    UIController
                        .CONFIG
                        .PANEL_ID

                );


        if (
            existing
        ) {

            existing
                .remove();

        }



        /* ============================================
           CREATE PANEL
        ============================================ */

        const panel =
            document
                .createElement(
                    "div"
                );


        panel.id =
            UIController
                .CONFIG
                .PANEL_ID;


        panel.setAttribute(
            "role",
            "dialog"
        );


        panel.setAttribute(
            "aria-label",
            "Offence Spatial Analysis"
        );


        panel.setAttribute(
            "aria-hidden",
            "true"
        );



        /* ============================================
           PANEL CONTENT

           FLOW

           SOURCE
               ↓
           Render Sources
               ↓
           Click Source
               ↓
           Render Related Targets
               ↓
           Click Target
               ↓
           Show Matching Cases

           TARGET
               ↓
           Render Targets
               ↓
           Click Target
               ↓
           Render Related Sources
               ↓
           Click Source
               ↓
           Show Matching Cases
        ============================================ */

        panel.innerHTML =
            `

                <!-- =======================================
                     HEADER
                ======================================== -->

                <div
                    class="
                        gg-offence-panel-header
                    "
                >

                    <div
                        class="
                            gg-offence-panel-title
                        "
                    >

                        <span
                            aria-hidden="true"
                        >
                            🚨
                        </span>

                        <span>
                            OFFENCE ANALYSIS
                        </span>

                    </div>


                    <button
                        id="${UIController.CONFIG.CLOSE_BUTTON_ID}"
                        type="button"
                        title="Close Offence Analysis"
                        aria-label="Close Offence Analysis"
                    >
                        ×
                    </button>

                </div>



                <!-- =======================================
                     STATUS
                ======================================== -->

                <div
                    id="${UIController.CONFIG.STATUS_ID}"
                    data-state="ready"
                >

                    Open Source or Target spatial analysis.

                </div>



                <!-- =======================================
                     ACTION BUTTONS
                ======================================== -->

                <div
                    class="
                        gg-offence-panel-actions
                    "
                >


                    <button
                        id="${UIController.CONFIG.SOURCE_BUTTON_ID}"
                        class="
                            gg-offence-action-button
                        "
                        type="button"
                    >

                        <span
                            class="
                                gg-offence-action-icon
                            "
                            aria-hidden="true"
                        >
                            🏡
                        </span>

                        <span>

                            SOURCE

                        </span>

                    </button>



                    <button
                        id="${UIController.CONFIG.TARGET_BUTTON_ID}"
                        class="
                            gg-offence-action-button
                        "
                        type="button"
                    >

                        <span
                            class="
                                gg-offence-action-icon
                            "
                            aria-hidden="true"
                        >
                            🎯
                        </span>

                        <span>

                            TARGET

                        </span>

                    </button>



                    <button
                        id="${UIController.CONFIG.CLEAR_BUTTON_ID}"
                        class="
                            gg-offence-action-button
                        "
                        type="button"
                    >

                        <span
                            class="
                                gg-offence-action-icon
                            "
                            aria-hidden="true"
                        >
                            🧹
                        </span>

                        <span>

                            CLEAR

                        </span>

                    </button>


                </div>



                <!-- =======================================
                     CASE RESULTS
                ======================================== -->

                <div
                    class="
                        gg-offence-case-results-header
                    "
                >

                    CASE RESULTS

                </div>



                <div
                    id="gg-offence-case-results"
                >

                    <div
                        class="
                            gg-offence-empty
                        "
                    >

                        Select a
                        <b>Source → Target</b>
                        or
                        <b>Target → Source</b>
                        pair to view matching offence cases.

                    </div>

                </div>

            `;



        /* ============================================
           ADD PANEL TO PAGE
        ============================================ */

        document
            .body
            .appendChild(
                panel
            );


        return panel;


    },



        /* ====================================================
           CAPTURE DOM REFERENCES

           Keeps all UI references in one place.

           Expected Part 1 structure:

           UIController.elements = {
               ...
           };
        ==================================================== */

        captureElements:
            function () {


                UIController.elements =
                    UIController.elements ||
                    {};


                UIController.elements.mainButton =
                    document
                        .getElementById(

                            UIController
                                .CONFIG
                                .BUTTON_ID

                        );


                UIController.elements.panel =
                    document
                        .getElementById(

                            UIController
                                .CONFIG
                                .PANEL_ID

                        );


                UIController.elements.closeButton =
                    document
                        .getElementById(

                            UIController
                                .CONFIG
                                .CLOSE_BUTTON_ID

                        );


                UIController.elements.sourceButton =
                    document
                        .getElementById(

                            UIController
                                .CONFIG
                                .SOURCE_BUTTON_ID

                        );


                UIController.elements.targetButton =
                    document
                        .getElementById(

                            UIController
                                .CONFIG
                                .TARGET_BUTTON_ID

                        );


                UIController.elements.clearButton =
                    document
                        .getElementById(

                            UIController
                                .CONFIG
                                .CLEAR_BUTTON_ID

                        );


                UIController.elements.status =
                    document
                        .getElementById(

                            UIController
                                .CONFIG
                                .STATUS_ID

                        );



                return UIController.elements;


            },



        /* ====================================================
           SET STATUS MESSAGE
        ==================================================== */

        setStatus:
            function (
                message,
                state = "ready"
            ) {


                const status =
                    UIController
                        .elements
                        ?.status;


                if (
                    !status
                ) {

                    return;

                }


                status.textContent =
                    String(
                        message ||
                        ""
                    );


                status.setAttribute(
                    "data-state",
                    state
                );


            },



        /* ====================================================
           UPDATE ACTIVE MODE BUTTON

           mode:

           "source"
           "target"
           null
        ==================================================== */

        updateActiveModeUI:
            function (
                mode
            ) {


                const sourceButton =
                    UIController
                        .elements
                        ?.sourceButton;


                const targetButton =
                    UIController
                        .elements
                        ?.targetButton;



                if (
                    sourceButton
                ) {

                    sourceButton
                        .classList
                        .toggle(

                            "gg-active",

                            mode ===
                                "source"

                        );

                }



                if (
                    targetButton
                ) {

                    targetButton
                        .classList
                        .toggle(

                            "gg-active",

                            mode ===
                                "target"

                        );

                }


            },



        /* ====================================================
           OPEN PANEL
        ==================================================== */

        openPanel:
            function () {


                const panel =
                    UIController
                        .elements
                        ?.panel;


                const button =
                    UIController
                        .elements
                        ?.mainButton;


                if (
                    !panel
                ) {

                    return false;

                }



                panel
                    .classList
                    .add(
                        "gg-offence-panel-open"
                    );


                panel.setAttribute(
                    "aria-hidden",
                    "false"
                );



                if (
                    button
                ) {

                    button
                        .classList
                        .add(
                            "gg-offence-open"
                        );


                    button.setAttribute(
                        "aria-expanded",
                        "true"
                    );

                }



                UIController.panelOpen =
                    true;


                return true;


            },



        /* ====================================================
           CLOSE PANEL

           IMPORTANT:

           Closing the panel does NOT clear the rendered
           offence layer.

           This allows the user to inspect the map while the
           control panel is hidden.

           CLEAR is the explicit action that removes offence
           rendering.
        ==================================================== */

        closePanel:
            function () {


                const panel =
                    UIController
                        .elements
                        ?.panel;


                const button =
                    UIController
                        .elements
                        ?.mainButton;



                if (
                    panel
                ) {

                    panel
                        .classList
                        .remove(
                            "gg-offence-panel-open"
                        );


                    panel.setAttribute(
                        "aria-hidden",
                        "true"
                    );

                }



                if (
                    button
                ) {

                    button
                        .classList
                        .remove(
                            "gg-offence-open"
                        );


                    button.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }



                UIController.panelOpen =
                    false;


                return true;


            },



        /* ====================================================
           TOGGLE PANEL

           IMPORTANT
           ----------------------------------------------------

           This only opens/closes the UI.

           The actual SpatialEngine initialization sequence
           will be handled by the action flow in the next part.

           This keeps panel interaction fast and avoids
           rebuilding the engine every time the panel opens.
        ==================================================== */

        togglePanel:
            function () {


                if (
                    UIController.panelOpen
                ) {

                    return UIController
                        .closePanel();

                }


                return UIController
                    .openPanel();


            },



        /* ====================================================
           BIND UI EVENTS
        ==================================================== */

        bindEvents:
            function () {


                const elements =
                    UIController
                        .elements;


                if (
                    !elements
                ) {

                    console.warn(
                        "⚠ OffenceUIController cannot bind events: elements unavailable"
                    );

                    return false;

                }



                /* ============================================
                   MAIN OFFENCE BUTTON
                ============================================ */

                if (
                    elements.mainButton
                ) {

                    elements
                        .mainButton
                        .onclick =
                            function (
                                event
                            ) {


                                event
                                    ?.preventDefault?.();


                                event
                                    ?.stopPropagation?.();


                                UIController
                                    .togglePanel();


                            };

                }



                /* ============================================
                   CLOSE BUTTON
                ============================================ */

                if (
                    elements.closeButton
                ) {

                    elements
                        .closeButton
                        .onclick =
                            function (
                                event
                            ) {


                                event
                                    ?.preventDefault?.();


                                event
                                    ?.stopPropagation?.();


                                UIController
                                    .closePanel();


                            };

                }



                /* ============================================
                   SOURCE BUTTON

                   The complete tested initialization sequence
                   will be inside:

                   UIController.activateSource()

                   which is added in Part 4.
                ============================================ */

                if (
                    elements.sourceButton
                ) {

                    elements
                        .sourceButton
                        .onclick =
                            async function (
                                event
                            ) {


                                event
                                    ?.preventDefault?.();


                                event
                                    ?.stopPropagation?.();


                                if (
                                    typeof
                                    UIController
                                        .activateSource ===
                                    "function"
                                ) {

                                    await UIController
                                        .activateSource();

                                }

                                else {

                                    console.error(
                                        "❌ OffenceUIController.activateSource() unavailable"
                                    );

                                }


                            };

                }



                /* ============================================
                   TARGET BUTTON
                ============================================ */

                if (
                    elements.targetButton
                ) {

                    elements
                        .targetButton
                        .onclick =
                            async function (
                                event
                            ) {


                                event
                                    ?.preventDefault?.();


                                event
                                    ?.stopPropagation?.();


                                if (
                                    typeof
                                    UIController
                                        .activateTarget ===
                                    "function"
                                ) {

                                    await UIController
                                        .activateTarget();

                                }

                                else {

                                    console.error(
                                        "❌ OffenceUIController.activateTarget() unavailable"
                                    );

                                }


                            };

                }



                /* ============================================
                   CLEAR BUTTON
                ============================================ */

                if (
                    elements.clearButton
                ) {

                    elements
                        .clearButton
                        .onclick =
                            function (
                                event
                            ) {


                                event
                                    ?.preventDefault?.();


                                event
                                    ?.stopPropagation?.();


                                if (
                                    typeof
                                    UIController
                                        .clearAnalysis ===
                                    "function"
                                ) {

                                    UIController
                                        .clearAnalysis();

                                }

                                else {

                                    console.error(
                                        "❌ OffenceUIController.clearAnalysis() unavailable"
                                    );

                                }


                            };

                }



                return true;


            },

               /* ====================================================
           GET AUTHORITATIVE STORE CASCADES

           CURRENT OFFENCE STORE API
           ----------------------------------------------------

           Your current Store does NOT expose:

               Store.cascades

           Your tested Store exposes:

               Store.getAllCascades()

           and:

               Store.getCaseCascades()

           SpatialEngine may also expose:

               SpatialEngine.getStoreCascades()

           We support all valid current paths safely.

           PRIORITY
           ----------------------------------------------------

           1. SpatialEngine.getStoreCascades()
           2. Store.getAllCascades()
           3. Store.getCaseCascades()

        ==================================================== */

        getStoreCascades:
            function () {


                const Store =
                    UIController
                        .getStore();


                const SpatialEngine =
                    UIController
                        .getSpatialEngine();



                /* ============================================
                   PREFERRED:
                   USE SPATIAL ENGINE'S OWN STORE CONNECTOR

                   This was already tested successfully:

                   GG.Offence
                     .SpatialEngine
                     .getStoreCascades()

                   Result:
                   573 POR cascades
                ============================================ */

                try {


                    if (
                        SpatialEngine &&
                        typeof
                        SpatialEngine
                            .getStoreCascades ===
                        "function"
                    ) {


                        const cascades =
                            SpatialEngine
                                .getStoreCascades();


                        if (
                            Array.isArray(
                                cascades
                            )
                        ) {


                            return cascades;


                        }


                    }


                }


                catch (
                    error
                ) {


                    console.warn(

                        "⚠ SpatialEngine.getStoreCascades() failed:",

                        error

                    );


                }



                /* ============================================
                   STORE DIRECT FALLBACK
                ============================================ */

                if (
                    !Store
                ) {


                    return [];


                }



                /* ============================================
                   STORE.getAllCascades()
                ============================================ */

                try {


                    if (
                        typeof
                        Store
                            .getAllCascades ===
                        "function"
                    ) {


                        const cascades =
                            Store
                                .getAllCascades();


                        if (
                            Array.isArray(
                                cascades
                            )
                        ) {


                            return cascades;


                        }


                    }


                }


                catch (
                    error
                ) {


                    console.warn(

                        "⚠ Store.getAllCascades() failed:",

                        error

                    );


                }



                /* ============================================
                   STORE.getCaseCascades()
                ============================================ */

                try {


                    if (
                        typeof
                        Store
                            .getCaseCascades ===
                        "function"
                    ) {


                        const cascades =
                            Store
                                .getCaseCascades();


                        if (
                            Array.isArray(
                                cascades
                            )
                        ) {


                            return cascades;


                        }


                    }


                }


                catch (
                    error
                ) {


                    console.warn(

                        "⚠ Store.getCaseCascades() failed:",

                        error

                    );


                }



                return [];


            },



        /* ====================================================
           ENSURE OFFENCE STORE READY

           NEW AUTHORITATIVE FLOW
           ----------------------------------------------------

           Store already ready
                   ↓
              use immediately

           Store not ready
                   ↓
           DataLoader.load()
                   ↓
              Firestore
                   ↓
             Store.build()
                   ↓
           Store.ready = true

           This replaces the old 60-second passive polling loop.
        ==================================================== */

        ensureStoreReady:
            async function () {


                /* ============================================
                   GET STORE
                ============================================ */

                const Store =
                    UIController
                        .getStore();


                if (
                    !Store
                ) {

                    throw new Error(
                        "GG.Offence.Store is not loaded."
                    );

                }



                /* ============================================
                   FAST PATH

                   Store may already have been loaded earlier.
                ============================================ */

                let cascades =
                    UIController
                        .getStoreCascades();


                if (
                    Store.ready === true &&
                    Array.isArray(
                        cascades
                    ) &&
                    cascades.length > 0
                ) {

                    console.log(
                        "🔥 Offence Store already ready →",
                        cascades.length,
                        "POR cascades"
                    );


                    return {

                        ready:
                            true,

                        Store:
                            Store,

                        cascades:
                            cascades,

                        count:
                            cascades.length

                    };

                }



                /* ============================================
                   STORE EMPTY

                   LOAD AUTHORITATIVE FIRESTORE DATA
                ============================================ */

                const DataLoader =
                    UIController
                        .getDataLoader();


                if (
                    !DataLoader ||
                    typeof
                    DataLoader.load !==
                    "function"
                ) {

                    throw new Error(
                        "GG.Offence.DataLoader.load() is unavailable."
                    );

                }



                console.log(
                    "🔥 Offence Store empty → loading offence data..."
                );


                UIController
                    .setStatus(

                        "Loading offence case data...",

                        "loading"

                    );



                /* ============================================
                   LOAD DATA

                   This is the exact operation proven manually:

                   await GG.Offence.DataLoader.load();
                ============================================ */

                const loadResult =
                    await DataLoader
                        .load();



                console.log(

                    "🔥 Offence DataLoader completed:",

                    loadResult

                );



                /* ============================================
                   RE-READ STORE AFTER LOAD

                   Do not rely on stale pre-load cascade array.
                ============================================ */

                cascades =
                    UIController
                        .getStoreCascades();



                /* ============================================
                   VALIDATE AUTHORITATIVE STORE
                ============================================ */

                if (
                    Store.ready !== true
                ) {

                    throw new Error(
                        "Offence Store is not ready after DataLoader.load()."
                    );

                }


                if (
                    !Array.isArray(
                        cascades
                    ) ||
                    cascades.length === 0
                ) {

                    throw new Error(
                        "Offence Store contains no POR cascades after loading."
                    );

                }



                console.log(

                    "✅ Offence Store loaded →",

                    cascades.length,

                    "POR cascades"

                );



                return {

                    ready:
                        true,

                    Store:
                        Store,

                    cascades:
                        cascades,

                    count:
                        cascades.length

                };


            },



        /* ====================================================
           WAIT FOR SPATIAL ENGINE READY

           rebuild() in the current implementation may be
           synchronous.

           But we also support a future asynchronous rebuild.

           This small wait additionally protects against an
           internal delayed index population.
        ==================================================== */

        waitForSpatialEngineReady:
            async function (
                maxAttempts = 40,
                interval = 100
            ) {


                for (
                    let attempt = 1;
                    attempt <= maxAttempts;
                    attempt++
                ) {


                    const SpatialEngine =
                        UIController
                            .getSpatialEngine();



                    const porCount =
                        SpatialEngine
                            ?.porSpatialIndex
                            ?.size ||
                        0;



                    if (
                        SpatialEngine
                            ?.ready ===
                            true &&

                        porCount > 0
                    ) {


                        return true;


                    }



                    await new Promise(

                        function (
                            resolve
                        ) {


                            window
                                .setTimeout(

                                    resolve,

                                    interval

                                );


                        }

                    );


                }



                return false;


            },



        /* ====================================================
           PREPARE SPATIAL SYSTEM

           THIS IS THE CORE FIX
           ----------------------------------------------------

           This reproduces the sequence that already worked
           manually in your console.

           TESTED MANUAL FLOW:

               Store ready
                    ↓
               573 cascades
                    ↓
               SpatialEngine.rebuild()
                    ↓
               Engine ready: true
                    ↓
               POR Index: 573
                    ↓
               Sources: 46
                    ↓
               Targets: 13
                    ↓
               SpatialRenderer.init()
                    ↓
               renderAllSources()
                   OR
               renderAllTargets()


           IMPORTANT
           ----------------------------------------------------

           This function is shared by:

               SOURCE
               TARGET

           It also prevents two simultaneous initialization
           operations if the user clicks quickly.

        ==================================================== */

        prepareSpatialSystem:
            async function () {


                /* ============================================
                   REUSE ACTIVE PREPARATION PROMISE

                   Prevent:

                   SOURCE click
                   +
                   TARGET click

                   from triggering duplicate rebuilds.
                ============================================ */

                if (
                    UIController
                        .__preparePromise
                ) {


                    return UIController
                        .__preparePromise;


                }



                /* ============================================
                   CREATE SINGLE PREPARATION PROMISE
                ============================================ */

                UIController
                    .__preparePromise =

                    (
                        async function () {


                            UIController.preparing =
                                true;


                            UIController.lastError =
                                null;



                            UIController
                                .setStatus(

                                    "Preparing spatial analysis...",

                                    "loading"

                                );



                            try {


/* =================================
   STEP 1
   ENSURE AUTHORITATIVE STORE READY

   If Store is empty:
       DataLoader.load()

   If Store is already populated:
       continue immediately
================================= */

const storeState =
    await UIController
        .ensureStoreReady();



                                if (
                                    !storeState ||
                                    storeState.ready !==
                                    true
                                ) {


                                    throw new Error(

                                        "Authoritative Offence Store is not ready."

                                    );


                                }



                                console.log(

                                    "🔥 Offence Store authoritative:",

                                    storeState.count,

                                    "POR cascades"

                                );



                                /* =================================
                                   STEP 2
                                   GET SPATIAL ENGINE
                                ================================= */

                                const SpatialEngine =
                                    UIController
                                        .getSpatialEngine();



                                if (
                                    !SpatialEngine
                                ) {


                                    throw new Error(

                                        "GG.Offence.SpatialEngine is not loaded."

                                    );


                                }



                                /* =================================
                                   STEP 3
                                   INSPECT CURRENT ENGINE STATE
                                ================================= */

                                let porCount =
                                    SpatialEngine
                                        ?.porSpatialIndex
                                        ?.size ||
                                    0;



                                let engineReady =
                                    SpatialEngine
                                        .ready ===
                                        true &&

                                    porCount > 0;



                                console.log(

                                    "🚨 SpatialEngine before preparation:",

                                    {

                                        ready:
                                            SpatialEngine
                                                .ready,

                                        porCount:
                                            porCount

                                    }

                                );



                                /* =================================
                                   STEP 4
                                   REBUILD ONLY IF REQUIRED

                                   This reproduces the manual fix:

                                   GG.Offence
                                     .SpatialEngine
                                     .rebuild();

                                   We do NOT rebuild every click if
                                   the engine is already valid.
                                ================================= */

                                if (
                                    !engineReady
                                ) {


                                    if (
                                        typeof
                                        SpatialEngine
                                            .rebuild !==
                                        "function"
                                    ) {


                                        throw new Error(

                                            "SpatialEngine.rebuild() is unavailable."

                                        );


                                    }



                                    console.log(

                                        "🚨 SpatialEngine empty/not ready → rebuilding..."

                                    );



                                    const rebuildResult =
                                        SpatialEngine
                                            .rebuild();



                                    /* =============================
                                       SUPPORT ASYNC REBUILD
                                    ============================= */

                                    if (
                                        rebuildResult &&
                                        typeof
                                        rebuildResult
                                            .then ===
                                        "function"
                                    ) {


                                        await rebuildResult;


                                    }



                                    /* =============================
                                       WAIT FOR INDEX POPULATION
                                    ============================= */

                                    await UIController
                                        .waitForSpatialEngineReady();


                                }



                                /* =================================
                                   STEP 5
                                   FINAL ENGINE VALIDATION
                                ================================= */

                                porCount =
                                    SpatialEngine
                                        ?.porSpatialIndex
                                        ?.size ||
                                    0;



                                const sources =
                                    SpatialEngine
                                        ?.getSourceVillages
                                        ?.() ||
                                    [];



                                const targets =
                                    SpatialEngine
                                        ?.getTargetRanges
                                        ?.() ||
                                    [];



                                engineReady =
                                    SpatialEngine
                                        .ready ===
                                        true &&

                                    porCount > 0;



                                if (
                                    !engineReady
                                ) {


                                    throw new Error(

                                        "SpatialEngine is still empty after rebuild."

                                    );


                                }



                                console.log(

                                    "✅ SpatialEngine ready",

                                    {

                                        POR:
                                            porCount,

                                        sources:
                                            sources.length,

                                        targets:
                                            targets.length

                                    }

                                );



                                /* =================================
                                   STEP 6
                                   GET SPATIAL RENDERER
                                ================================= */

                                const SpatialRenderer =
                                    UIController
                                        .getSpatialRenderer();



                                if (
                                    !SpatialRenderer
                                ) {


                                    throw new Error(

                                        "GG.Offence.SpatialRenderer is not loaded."

                                    );


                                }



                                /* =================================
                                   STEP 7
                                   INITIALIZE RENDERER

                                   The renderer builds:

                                   - 291 village feature groups
                                   - 25 range feature groups

                                   based on your previous successful
                                   renderer test.
                                ================================= */

                                if (
                                    typeof
                                    SpatialRenderer
                                        .init ===
                                    "function"
                                ) {


                                    const initResult =
                                        SpatialRenderer
                                            .init();



                                    if (
                                        initResult &&
                                        typeof
                                        initResult
                                            .then ===
                                        "function"
                                    ) {


                                        await initResult;


                                    }


                                }



                                /* =================================
                                   STEP 8
                                   VALIDATE RENDERER

                                   Some renderer implementations use:

                                   ready

                                   Some only use:

                                   initialized

                                   We therefore do not reject solely
                                   because ready is undefined.
                                ================================= */

                                if (
                                    SpatialRenderer
                                        .initialized ===
                                        false
                                ) {


                                    throw new Error(

                                        "SpatialRenderer initialization failed."

                                    );


                                }



                                UIController
                                    .lastPreparedAt =
                                    new Date();



                                UIController
                                    .setStatus(

                                        "Spatial data ready.",

                                        "success"

                                    );



                                console.log(

                                    "✅ Offence spatial system prepared",

                                    {

                                        spatialEngine:
                                            SpatialEngine
                                                .getStats
                                                ?.(),

                                        renderer:
                                            SpatialRenderer
                                                .getStats
                                                ?.()

                                    }

                                );



                                return {

                                    ready:
                                        true,


                                    Store:
                                        storeState.Store,


                                    cascades:
                                        storeState.cascades,


                                    SpatialEngine:
                                        SpatialEngine,


                                    SpatialRenderer:
                                        SpatialRenderer,


                                    porCount:
                                        porCount,


                                    sourceCount:
                                        sources.length,


                                    targetCount:
                                        targets.length


                                };


                            }


                            catch (
                                error
                            ) {


                                UIController
                                    .lastError =
                                    error;



                                UIController
                                    .setStatus(

                                        error
                                            ?.message ||

                                        "Spatial initialization failed.",

                                        "error"

                                    );



                                console.error(

                                    "❌ Offence spatial preparation failed:",

                                    error

                                );



                                throw error;


                            }


                            finally {


                                UIController.preparing =
                                    false;


                            }


                        }

                    )();



                /* ============================================
                   WAIT FOR SHARED PROMISE
                ============================================ */

                try {


                    return await UIController
                        .__preparePromise;


                }


                finally {


                    /*
                     * Clear the promise after completion.
                     *
                     * The actual SpatialEngine remains built.
                     *
                     * Future clicks use the fast path:
                     *
                     * ready === true
                     * POR index > 0
                     *
                     * therefore no unnecessary rebuild.
                     */

                    UIController
                        .__preparePromise =
                        null;


                }


            },



        /* ====================================================
           ACTIVATE SOURCE MODE

           USER FLOW
           ----------------------------------------------------

           OFFENCE
               ↓
           SOURCE
               ↓
           prepareSpatialSystem()
               ↓
           clear previous offence rendering
               ↓
           renderAllSources()
               ↓
           46 resolved source village polygons
               ↓
           intensity based on offence count

           Further polygon click drill-down is handled by:

           offenceSpatialRenderer.js

        ==================================================== */

        activateSource:
            async function () {


                /* ============================================
                   PREVENT REPEATED CLICK DURING PREPARATION
                ============================================ */

                if (
                    UIController.preparing ===
                    true
                ) {


                    return false;


                }



                UIController
                    .setStatus(

                        "Loading source village heatmap...",

                        "loading"

                    );



                try {


                    /* ========================================
                       PREPARE AUTHORITATIVE SPATIAL SYSTEM
                    ======================================== */

                    const prepared =
                        await UIController
                            .prepareSpatialSystem();



                    const SpatialRenderer =
                        prepared
                            ?.SpatialRenderer ||

                        UIController
                            .getSpatialRenderer();



                    if (
                        !SpatialRenderer
                    ) {


                        throw new Error(

                            "SpatialRenderer unavailable."

                        );


                    }



                    /* ========================================
                       CLEAR PREVIOUS OFFENCE MODE

                       Example:

                       TARGET
                           ↓
                       user clicks SOURCE
                           ↓
                       remove TARGET layers first
                    ======================================== */

                    if (
                        typeof
                        SpatialRenderer
                            .clear ===
                        "function"
                    ) {


                        SpatialRenderer
                            .clear();


                    }



                    /* ========================================
                       RENDER ALL SOURCES
                    ======================================== */

                    if (
                        typeof
                        SpatialRenderer
                            .renderAllSources !==
                        "function"
                    ) {


                        throw new Error(

                            "SpatialRenderer.renderAllSources() is unavailable."

                        );


                    }



                    const renderResult =
                        SpatialRenderer
                            .renderAllSources();



                    const sources =
                        renderResult &&
                        typeof
                        renderResult
                            .then ===
                        "function"

                            ? await renderResult

                            : renderResult;



                    /* ========================================
                       UPDATE MODE
                    ======================================== */

                    UIController.activeMode =
                        "source";



                    UIController
                        .updateActiveModeUI(

                            "source"

                        );



                    /* ========================================
                       DETERMINE RENDERED COUNT
                    ======================================== */

                    const count =
                        Array.isArray(
                            sources
                        )

                            ? sources.length

                            : (

                                prepared
                                    ?.sourceCount ||

                                UIController
                                    .getSpatialEngine()
                                    ?.getSourceVillages
                                    ?.()
                                    ?.length ||

                                0

                            );



                    UIController
                        .setStatus(

                            count +
                            " source village polygons rendered.",

                            "success"

                        );



                    console.log(

                        "🏡 OFFENCE SOURCE mode active:",

                        count,

                        "villages"

                    );



                    return sources;


                }


                catch (
                    error
                ) {


                    UIController
                        .lastError =
                        error;



                    UIController
                        .setStatus(

                            error
                                ?.message ||

                            "Source heatmap failed.",

                            "error"

                        );



                    console.error(

                        "❌ OFFENCE SOURCE mode failed:",

                        error

                    );



                    return false;


                }


            },



        /* ====================================================
           ACTIVATE TARGET MODE

           USER FLOW
           ----------------------------------------------------

           OFFENCE
               ↓
           TARGET
               ↓
           prepareSpatialSystem()
               ↓
           clear previous offence rendering
               ↓
           renderAllTargets()
               ↓
           GIS-resolved target range polygons

           Your current tested result:

           Total target labels:
               13

           GIS-resolved/renderable ranges:
               7

        ==================================================== */

        activateTarget:
            async function () {


                /* ============================================
                   PREVENT REPEATED CLICK DURING PREPARATION
                ============================================ */

                if (
                    UIController.preparing ===
                    true
                ) {


                    return false;


                }



                UIController
                    .setStatus(

                        "Loading target range heatmap...",

                        "loading"

                    );



                try {


                    /* ========================================
                       PREPARE AUTHORITATIVE SPATIAL SYSTEM
                    ======================================== */

                    const prepared =
                        await UIController
                            .prepareSpatialSystem();



                    const SpatialRenderer =
                        prepared
                            ?.SpatialRenderer ||

                        UIController
                            .getSpatialRenderer();



                    if (
                        !SpatialRenderer
                    ) {


                        throw new Error(

                            "SpatialRenderer unavailable."

                        );


                    }



                    /* ========================================
                       CLEAR PREVIOUS SOURCE/TARGET RENDERING
                    ======================================== */

                    if (
                        typeof
                        SpatialRenderer
                            .clear ===
                        "function"
                    ) {


                        SpatialRenderer
                            .clear();


                    }



                    /* ========================================
                       RENDER ALL TARGETS
                    ======================================== */

                    if (
                        typeof
                        SpatialRenderer
                            .renderAllTargets !==
                        "function"
                    ) {


                        throw new Error(

                            "SpatialRenderer.renderAllTargets() is unavailable."

                        );


                    }



                    const renderResult =
                        SpatialRenderer
                            .renderAllTargets();



                    const targets =
                        renderResult &&
                        typeof
                        renderResult
                            .then ===
                        "function"

                            ? await renderResult

                            : renderResult;



                    /* ========================================
                       UPDATE MODE
                    ======================================== */

                    UIController.activeMode =
                        "target";



                    UIController
                        .updateActiveModeUI(

                            "target"

                        );



                    /* ========================================
                       RENDERED TARGET COUNT

                       renderAllTargets() previously returned
                       the 7 GIS-resolved target ranges.
                    ======================================== */

                    const count =
                        Array.isArray(
                            targets
                        )

                            ? targets.length

                            : 0;



                    UIController
                        .setStatus(

                            count +
                            " target range polygons rendered.",

                            "success"

                        );



                    console.log(

                        "🎯 OFFENCE TARGET mode active:",

                        count,

                        "ranges"

                    );



                    return targets;


                }


                catch (
                    error
                ) {


                    UIController
                        .lastError =
                        error;



                    UIController
                        .setStatus(

                            error
                                ?.message ||

                            "Target heatmap failed.",

                            "error"

                        );



                    console.error(

                        "❌ OFFENCE TARGET mode failed:",

                        error

                    );



                    return false;


                }


            },



        /* ====================================================
           CLEAR OFFENCE SPATIAL ANALYSIS

           ONLY offenceSpatialRenderer layers are cleared.

           It does NOT:

           - clear base map
           - clear staff
           - clear sightings
           - clear patrol tracks
           - clear GIS base data
           - reset SpatialEngine
           - rebuild Store

        ==================================================== */

        clearAnalysis:
            function () {


                try {


                    const SpatialRenderer =
                        UIController
                            .getSpatialRenderer();



                    if (
                        SpatialRenderer &&
                        typeof
                        SpatialRenderer
                            .clear ===
                        "function"
                    ) {


                        SpatialRenderer
                            .clear();


                    }



                    /* ========================================
                       RESET ACTIVE MODE
                    ======================================== */

                    UIController.activeMode =
                        null;



                    UIController
                        .updateActiveModeUI(
                            null
                        );



                    /* ========================================
                       UPDATE STATUS
                    ======================================== */

                    UIController
                        .setStatus(

                            "Offence spatial layers cleared.",

                            "ready"

                        );



                    console.log(

                        "🧹 Offence spatial analysis cleared"

                    );



                    return true;


                }


                catch (
                    error
                ) {


                    UIController
                        .lastError =
                        error;



                    UIController
                        .setStatus(

                            "Unable to clear offence spatial layers.",

                            "error"

                        );



                    console.error(

                        "❌ Offence spatial clear failed:",

                        error

                    );



                    return false;


                }


            },


               /* ====================================================
           COMPATIBILITY ALIAS:
           REFRESH ELEMENT REFERENCES

           Earlier Part 1 may call:

               refreshElementReferences()

           Part 3 introduced:

               captureElements()

           Keep both names valid.
        ==================================================== */

        refreshElementReferences:
            function () {


                return UIController
                    .captureElements();


            },



        /* ====================================================
           COMPATIBILITY ALIAS:
           UPDATE STATUS

           Earlier Part 1 may call:

               updateStatus(
                   message,
                   state
               )

           Part 3 introduced:

               setStatus(
                   message,
                   state
               )

           Keep both names valid.
        ==================================================== */

        updateStatus:
            function (
                message,
                state = "ready"
            ) {


                return UIController
                    .setStatus(

                        message,

                        state

                    );


            },



        /* ====================================================
           GET UI CONTROLLER STATS
        ==================================================== */

        getStats:
            function () {


                const Store =
                    UIController
                        .getStore();


                const SpatialEngine =
                    UIController
                        .getSpatialEngine();


                const SpatialRenderer =
                    UIController
                        .getSpatialRenderer();


                const cascades =
                    UIController
                        .getStoreCascades();



                const sourceCount =

                    SpatialEngine
                        ?.getSourceVillages
                        ?.()
                        ?.length ||

                    0;



                const targetCount =

                    SpatialEngine
                        ?.getTargetRanges
                        ?.()
                        ?.length ||

                    0;



                const porCount =

                    SpatialEngine
                        ?.porSpatialIndex
                        ?.size ||

                    0;



                return {


                    version:

                        UIController
                            .VERSION,


                    initialized:

                        UIController
                            .initialized,


                    ready:

                        UIController
                            .ready,


                    panelOpen:

                        UIController
                            .panelOpen,


                    activeMode:

                        UIController
                            .activeMode,


                    preparing:

                        UIController
                            .preparing,


                    storeReady:

                        Store
                            ?.ready ===
                            true,


                    storeCascadeCount:

                        Array.isArray(
                            cascades
                        )

                            ? cascades.length

                            : 0,


                    spatialEngineReady:

                        SpatialEngine
                            ?.ready ===
                            true,


                    porSpatialIndex:

                        porCount,


                    sourceVillages:

                        sourceCount,


                    targetRanges:

                        targetCount,


                    rendererInitialized:

                        SpatialRenderer
                            ?.initialized ===
                            true,


                    rendererReady:

                        SpatialRenderer
                            ?.ready ===
                            true,


                    mainButtonExists:

                        !!document
                            .getElementById(

                                UIController
                                    .CONFIG
                                    .BUTTON_ID

                            ),


                    panelExists:

                        !!document
                            .getElementById(

                                UIController
                                    .CONFIG
                                    .PANEL_ID

                            ),


                    lastPreparedAt:

                        UIController
                            .lastPreparedAt,


                    lastError:

                        UIController
                            .lastError

                            ? (

                                UIController
                                    .lastError
                                    .message ||

                                String(
                                    UIController
                                        .lastError
                                )

                            )

                            : null


                };


            },



        /* ====================================================
           DEBUG

           Run:

               GG.Offence
                 .UIController
                 .debug();

           This gives one combined snapshot of:

           - UI
           - Store
           - SpatialEngine
           - SpatialRenderer
        ==================================================== */

        debug:
            function () {


                const Store =
                    UIController
                        .getStore();


                const SpatialEngine =
                    UIController
                        .getSpatialEngine();


                const SpatialRenderer =
                    UIController
                        .getSpatialRenderer();


                const cascades =
                    UIController
                        .getStoreCascades();



                console.group(

                    "🚨 OFFENCE UI CONTROLLER DEBUG"

                );



                console.log(

                    "UIController:",

                    UIController

                );



                console.log(

                    "UI Stats:",

                    UIController
                        .getStats()

                );



                console.log(

                    "Store:",

                    Store

                );



                console.log(

                    "Store Ready:",

                    Store
                        ?.ready

                );



                console.log(

                    "Store Cascades:",

                    Array.isArray(
                        cascades
                    )

                        ? cascades.length

                        : 0

                );



                console.log(

                    "SpatialEngine:",

                    SpatialEngine

                );



                console.log(

                    "SpatialEngine Stats:",

                    SpatialEngine
                        ?.getStats
                        ?.()

                );



                console.log(

                    "Spatial POR Index:",

                    SpatialEngine
                        ?.porSpatialIndex
                        ?.size

                );



                console.log(

                    "Source Villages:",

                    SpatialEngine
                        ?.getSourceVillages
                        ?.()
                        ?.length

                );



                console.log(

                    "Target Ranges:",

                    SpatialEngine
                        ?.getTargetRanges
                        ?.()
                        ?.length

                );



                console.log(

                    "SpatialRenderer:",

                    SpatialRenderer

                );



                console.log(

                    "SpatialRenderer Stats:",

                    SpatialRenderer
                        ?.getStats
                        ?.()

                );



                console.log(

                    "Main Button:",

                    document
                        .getElementById(

                            UIController
                                .CONFIG
                                .BUTTON_ID

                        )

                );



                console.log(

                    "Analysis Panel:",

                    document
                        .getElementById(

                            UIController
                                .CONFIG
                                .PANEL_ID

                        )

                );



                console.groupEnd();



return UIController
    .getStats();

},

/* ====================================================
   SHOW SPATIAL CASES
==================================================== */

showSpatialCases: function (cases, context = {}) {

    const list = Array.isArray(cases)
        ? cases
        : [];

    console.group(
        "🚨 UI.showSpatialCases"
    );

    console.log(
        "Cases:",
        list.length
    );

    console.log(
        "Context:",
        context
    );

    if (!list.length) {

        UIController.setStatus(
            "No offence cases found.",
            "ready"
        );

        console.groupEnd();

        return false;
    }

    UIController.setStatus(
        `${list.length} offence case${
            list.length === 1 ? "" : "s"
        } found.`,
        "success"
    );

    /*
    ---------------------------------------------------
    Cache current spatial selection
    ---------------------------------------------------
    */

    UIController.currentSpatialCases = list;

    UIController.currentSpatialContext = context;

    /*
    ---------------------------------------------------
    Preferred architecture

    UIController
          ↓
    Offence.UI
          ↓
    Case Panel
    ---------------------------------------------------
    */

    if (

        GG.Offence &&
        GG.Offence.UI &&
        typeof GG.Offence.UI.showSpatialCases ===
            "function" &&

        GG.Offence.UI !== UIController

    ) {

        console.log(
            "Delegating to GG.Offence.UI.showSpatialCases()"
        );

        console.groupEnd();

        return GG.Offence.UI.showSpatialCases(
            list,
            context
        );

    }

    /*
    ---------------------------------------------------
    Temporary compatibility

    Existing Cascade UI
    ---------------------------------------------------
    */

    if (

        GG.Offence &&
        GG.Offence.CascadeUI &&
        typeof GG.Offence.CascadeUI.showCases ===
            "function"

    ) {

        console.log(
            "Delegating to CascadeUI.showCases()"
        );

        console.groupEnd();

        return GG.Offence.CascadeUI.showCases(
            list,
            context
        );

    }

    /*
    ---------------------------------------------------
    Final fallback
    ---------------------------------------------------
    */

    console.warn(
        "No Spatial Case UI registered."
    );

    console.table(
        list
    );

    console.groupEnd();

    return list;

}

};


    /* ========================================================
       EXPORT MODULE

       PRIMARY:

           GG.Offence.UIController

       ALSO AVAILABLE THROUGH:

           window.GG.Offence.UIController

    ======================================================== */

    GG.Offence.UIController =
        UIController;

GG.Offence.UI =
    UIController;

    /* ========================================================
       OPTIONAL GREENGUARDAI EXPORT

       Your project currently exposes many analytics modules
       through GreenGuardAI.

       We expose this controller there as well if the namespace
       already exists.

       This does NOT create or replace GreenGuardAI.
    ======================================================== */

    if (
        window.GreenGuardAI
    ) {


        window
            .GreenGuardAI
            .OffenceUIController =
            UIController;


    }



    /* ========================================================
       AUTO INITIALIZATION

       IMPORTANT
       --------------------------------------------------------

       We initialize only the UI here.

       We DO NOT force SpatialEngine.rebuild() at script load.

       Why?

       The Offence Store may still be empty during startup.

       The tested safe flow is now:

           App loads
               ↓
           UIController.init()
               ↓
           Button + Panel created
               ↓
           User clicks SOURCE / TARGET
               ↓
           prepareSpatialSystem()
               ↓
           waitForStore()
               ↓
           Store ready + cascades available
               ↓
           SpatialEngine rebuilt if required
               ↓
           SpatialRenderer initialized
               ↓
           polygons rendered

       This reproduces the manual working sequence.
    ======================================================== */

    function autoInitialize() {


        /* ====================================================
           PREVENT DUPLICATE INITIALIZATION
        ==================================================== */

        if (
            UIController
                .initialized ===
                true
        ) {


            return;


        }



        try {


            const result =
                UIController
                    .init();



            /* =================================================
               SUPPORT ASYNC INIT IF IMPLEMENTATION CHANGES
            ================================================= */

            if (
                result &&
                typeof
                result.then ===
                "function"
            ) {


                result

                    .then(

                        function () {


                            console.log(

                                "🚨 OffenceUIController Ready",

                                UIController
                                    .getStats()

                            );


                        }

                    )

                    .catch(

                        function (
                            error
                        ) {


                            console.error(

                                "❌ OffenceUIController initialization failed:",

                                error

                            );


                        }

                    );


                return;


            }



            console.log(

                "🚨 OffenceUIController Ready",

                UIController
                    .getStats()

            );


        }


        catch (
            error
        ) {


            console.error(

                "❌ OffenceUIController initialization failed:",

                error

            );


        }


    }



    /* ========================================================
       DOM STARTUP STRATEGY

       If DOM is still loading:

           wait for DOMContentLoaded

       Otherwise:

           initialize immediately
    ======================================================== */

    if (
        document.readyState ===
        "loading"
    ) {


        document
            .addEventListener(

                "DOMContentLoaded",

                function () {


                    autoInitialize();


                },

                {
                    once:
                        true
                }

            );


    }


    else {


        autoInitialize();


    }



})();


/* ============================================================
   END OF FILE

   js/offence/offenceUIController.js

   VERSION: 3.0.0
============================================================ */
