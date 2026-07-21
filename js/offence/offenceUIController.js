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


    /* ==========================================================
       REMOVE PREVIOUS OFFENCE STYLE BLOCK

       IMPORTANT:
       There must be only ONE authoritative offence stylesheet.

       This prevents previous desktop/mobile rules from fighting
       the current responsive layout.
    ========================================================== */

    const existingStyle =
        document.getElementById(

            UIController
                .CONFIG
                .STYLE_ID

        );


    if (
        existingStyle
    ) {

        existingStyle.remove();

    }



    /* ==========================================================
       CREATE STYLE ELEMENT
    ========================================================== */

    const style =
        document.createElement(
            "style"
        );


    style.id =
        UIController
            .CONFIG
            .STYLE_ID;



    /* ==========================================================
       Z INDEX
    ========================================================== */

    const zIndex =
        UIController
            .CONFIG
            .Z_INDEX ||
        10000;



    /* ==========================================================
       COMPLETE OFFENCE UI CSS
    ========================================================== */

    style.textContent =
        `


/* ============================================================
   OFFENCE UI — GLOBAL BOX MODEL
============================================================ */

#${UIController.CONFIG.BUTTON_ID},
#${UIController.CONFIG.PANEL_ID},
#${UIController.CONFIG.PANEL_ID} *,
#${UIController.CONFIG.PANEL_ID} *::before,
#${UIController.CONFIG.PANEL_ID} *::after {

    box-sizing:
        border-box;

}



/* ============================================================
   OFFENCE LAUNCHER BUTTON

   FINAL DESKTOP POSITION
   ------------------------------------------------------------

   DO NOT place this in the upper-right Leaflet control column.

   Upper-right is occupied by:

       Zoom + / -
       Layer controls
       Other Leaflet controls

   Lower-right is occupied by:

       Monthly Status / Analytics

   Therefore the OFFENCE button is positioned in the
   RIGHT-SIDE GAP immediately ABOVE the analytics panel.

   Current intended vertical stack:

       Leaflet controls
             ↓
       Chat / AI button
             ↓
       OFFENCE button
             ↓
       Monthly Status / Analytics panel

============================================================ */

#${UIController.CONFIG.BUTTON_ID} {

    position:
        fixed;

    top:
        auto;

    right:
        18px;

    bottom:
        450px;

    left:
        auto;

    z-index:
        ${zIndex};

    display:
        flex;

    align-items:
        center;

    justify-content:
        center;

    gap:
        7px;

    width:
        auto;

    min-width:
        116px;

    max-width:
        calc(100vw - 36px);

    height:
        44px;

    min-height:
        44px;

    padding:
        0 15px;

    margin:
        0;

    border:
        1px solid
        rgba(
            255,
            255,
            255,
            0.70
        );

    border-radius:
        14px;

    outline:
        none;

    background:
        rgba(
            255,
            255,
            255,
            0.97
        );

    color:
        #18202a;

    font-family:
        Arial,
        Helvetica,
        sans-serif;

    font-size:
        13px;

    font-weight:
        800;

    line-height:
        1;

    letter-spacing:
        0.25px;

    white-space:
        nowrap;

    cursor:
        pointer;

    box-shadow:
        0 6px 22px
        rgba(
            0,
            0,
            0,
            0.24
        );

    backdrop-filter:
        blur(12px);

    -webkit-backdrop-filter:
        blur(12px);

    transition:
        transform
        0.15s
        ease,

        box-shadow
        0.15s
        ease,

        background
        0.15s
        ease;

}



#${UIController.CONFIG.BUTTON_ID}:hover {

    transform:
        translateY(-1px);

    background:
        #ffffff;

    box-shadow:
        0 9px 26px
        rgba(
            0,
            0,
            0,
            0.28
        );

}



#${UIController.CONFIG.BUTTON_ID}:active {

    transform:
        translateY(0);

}



#${UIController.CONFIG.BUTTON_ID}.gg-offence-open {

    background:
        rgba(
            245,
            247,
            249,
            0.99
        );

}



/* ============================================================
   MAIN OFFENCE ANALYSIS PANEL

   VIEWPORT SAFE

   CRITICAL:

       top + bottom are defined.

   Therefore the panel can never become taller than the
   currently available screen.

   Header and CLOSE button always remain visible.
============================================================ */

#${UIController.CONFIG.PANEL_ID} {

    position:
        fixed;

    top:
        12px;

    right:
        12px;

    bottom:
        12px;

    left:
        auto;

    width:
        min(
            420px,
            calc(100vw - 24px)
        );

    height:
        auto;

    max-height:
        none;

    min-height:
        0;

    margin:
        0;

    padding:
        0;

    display:
        none;

    flex-direction:
        column;

    overflow:
        hidden;

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

    background:
        rgba(
            248,
            249,
            250,
            0.985
        );

    box-shadow:
        0 18px 48px
        rgba(
            0,
            0,
            0,
            0.30
        );

    backdrop-filter:
        blur(16px);

    -webkit-backdrop-filter:
        blur(16px);

    font-family:
        Arial,
        Helvetica,
        sans-serif;

    z-index:
        ${zIndex + 2};

}



/* ============================================================
   PANEL OPEN
============================================================ */

#${UIController.CONFIG.PANEL_ID}.gg-offence-panel-open {

    display:
        flex;

}



/* ============================================================
   PANEL HEADER

   HEADER DOES NOT SCROLL.

   Therefore:

       OFFENCE ANALYSIS
       CLOSE X

   always remain visible.
============================================================ */

#${UIController.CONFIG.PANEL_ID}
.gg-offence-panel-header {

    position:
        relative;

    top:
        auto;

    z-index:
        10;

    flex:
        0 0 auto;

    display:
        flex;

    align-items:
        center;

    justify-content:
        space-between;

    gap:
        12px;

    width:
        100%;

    min-width:
        0;

    min-height:
        56px;

    padding:
        0 14px 0 16px;

    margin:
        0;

    background:
        #ffffff;

    border-bottom:
        1px solid
        rgba(
            15,
            23,
            42,
            0.09
        );

}



/* ============================================================
   PANEL TITLE
============================================================ */

#${UIController.CONFIG.PANEL_ID}
.gg-offence-panel-title {

    flex:
        1 1 auto;

    min-width:
        0;

    display:
        flex;

    align-items:
        center;

    gap:
        6px;

    margin:
        0;

    color:
        #27313b;

    font-size:
        14px;

    font-weight:
        900;

    line-height:
        1.25;

    letter-spacing:
        0.25px;

    white-space:
        normal;

    overflow-wrap:
        anywhere;

}



/* ============================================================
   CLOSE BUTTON
============================================================ */

#${UIController.CONFIG.CLOSE_BUTTON_ID} {

    position:
        relative;

    flex:
        0 0 36px;

    width:
        36px;

    height:
        36px;

    min-width:
        36px;

    min-height:
        36px;

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
        rgba(
            15,
            23,
            42,
            0.045
        );

    color:
        #53606d;

    font-size:
        22px;

    font-weight:
        500;

    line-height:
        1;

    cursor:
        pointer;

    z-index:
        20;

}



#${UIController.CONFIG.CLOSE_BUTTON_ID}:hover {

    background:
        rgba(
            15,
            23,
            42,
            0.10
        );

    color:
        #111827;

}



/* ============================================================
   STATUS BAR

   STATUS ALSO REMAINS OUTSIDE SCROLL BODY.
============================================================ */

#${UIController.CONFIG.STATUS_ID} {

    position:
        relative;

    top:
        auto;

    flex:
        0 0 auto;

    display:
        flex;

    align-items:
        center;

    width:
        100%;

    min-width:
        0;

    min-height:
        38px;

    padding:
        7px 16px;

    margin:
        0;

    background:
        #f7f8fa;

    border-bottom:
        1px solid
        rgba(
            15,
            23,
            42,
            0.08
        );

    color:
        #66717d;

    font-size:
        12px;

    line-height:
        1.4;

    overflow-wrap:
        anywhere;

}



/* ============================================================
   STATUS STATES
============================================================ */

#${UIController.CONFIG.STATUS_ID}[data-state="ready"] {

    color:
        #687582;

}


#${UIController.CONFIG.STATUS_ID}[data-state="loading"] {

    color:
        #946200;

}


#${UIController.CONFIG.STATUS_ID}[data-state="success"] {

    color:
        #14733c;

}


#${UIController.CONFIG.STATUS_ID}[data-state="error"] {

    color:
        #b42318;

}



/* ============================================================
   PANEL BODY

   THIS IS THE ONLY VERTICAL SCROLL OWNER.

   DO NOT give case details, field details or case list
   another vertical scrollbar.
============================================================ */

#${UIController.CONFIG.PANEL_ID}
.gg-offence-panel-body {

    position:
        relative;

    flex:
        1 1 auto;

    width:
        100%;

    min-width:
        0;

    min-height:
        0;

    max-height:
        none;

    display:
        flex;

    flex-direction:
        column;

    gap:
        16px;

    padding:
        14px;

    margin:
        0;

    overflow-x:
        hidden;

    overflow-y:
        auto;

    overscroll-behavior:
        contain;

    scrollbar-width:
        thin;

    scrollbar-gutter:
        stable;

    -webkit-overflow-scrolling:
        touch;

}



/* ============================================================
   GENERAL SECTION
============================================================ */

#${UIController.CONFIG.PANEL_ID}
.gg-offence-section {

    flex:
        0 0 auto;

    width:
        100%;

    min-width:
        0;

    display:
        flex;

    flex-direction:
        column;

    gap:
        10px;

}



/* ============================================================
   SECTION TITLE
============================================================ */

#${UIController.CONFIG.PANEL_ID}
.gg-offence-section-title {

    width:
        100%;

    min-width:
        0;

    margin:
        0;

    font-size:
        13px;

    font-weight:
        800;

    line-height:
        1.3;

    color:
        #2b3642;

    letter-spacing:
        0.3px;

    overflow-wrap:
        anywhere;

}



/* ============================================================
   ANALYSIS MODE
============================================================ */

#${UIController.CONFIG.PANEL_ID}
.gg-workflow-mode {

    width:
        100%;

    min-width:
        0;

    padding:
        10px;

    border-radius:
        10px;

    background:
        #eef5fb;

    font-weight:
        700;

    font-size:
        12px;

}



#${UIController.CONFIG.PANEL_ID}
.gg-workflow-step {

    width:
        100%;

    min-width:
        0;

    padding:
        12px;

    border:
        1px solid
        rgba(
            0,
            0,
            0,
            0.08
        );

    border-radius:
        10px;

    background:
        #ffffff;

    font-size:
        12px;

}



/* ============================================================
   PANEL ACTION CONTAINER
============================================================ */

#${UIController.CONFIG.PANEL_ID}
.gg-offence-panel-actions {

    display:
        flex;

    flex-direction:
        column;

    gap:
        9px;

    width:
        100%;

    min-width:
        0;

    padding:
        0;

    margin:
        0;

}



/* ============================================================
   SOURCE / TARGET / CLEAR BUTTONS
============================================================ */

#${UIController.CONFIG.PANEL_ID}
.gg-offence-action-button {

    width:
        100%;

    min-width:
        0;

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
            0.94
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

}



#${UIController.CONFIG.PANEL_ID}
.gg-offence-action-button:hover {

    background:
        #ffffff;

    box-shadow:
        0 3px 10px
        rgba(
            0,
            0,
            0,
            0.08
        );

}



#${UIController.CONFIG.PANEL_ID}
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
            0.30
        );

}



/* ============================================================
   ACTION ICON
============================================================ */

#${UIController.CONFIG.PANEL_ID}
.gg-offence-action-icon {

    flex:
        0 0 22px;

    width:
        22px;

    text-align:
        center;

    font-size:
        17px;

}



/* ============================================================
   CLEAR BUTTON
============================================================ */

#${UIController.CONFIG.CLEAR_BUTTON_ID} {

    color:
        #b42318;

}



/* ============================================================
   PARENT CONTENT / CHILD LIST
============================================================ */

#gg-offence-parent-content,
#gg-offence-child-list {

    width:
        100%;

    min-width:
        0;

    max-width:
        100%;

}



/* ============================================================
   CASE SECTION
============================================================ */

#gg-offence-case-section {

    width:
        100%;

    min-width:
        0;

    overflow:
        visible;

}



/* ============================================================
   CASE RESULTS

   NO SECOND SCROLLBAR.
============================================================ */

#gg-offence-case-results {

    width:
        100%;

    min-width:
        0;

    min-height:
        0;

    max-height:
        none;

    padding:
        0;

    margin:
        0;

    overflow:
        visible;

}



/* ============================================================
   CASE RESULT LIST
============================================================ */

#gg-case-result-list {

    width:
        100%;

    min-width:
        0;

    max-width:
        100%;

}



/* ============================================================
   CASE RESULTS HEADER
============================================================ */

.gg-offence-case-results-header {

    width:
        100%;

    padding:
        10px 12px;

    border-top:
        1px solid
        rgba(
            0,
            0,
            0,
            0.08
        );

    border-bottom:
        1px solid
        rgba(
            0,
            0,
            0,
            0.08
        );

    background:
        #f7f8fa;

    font-size:
        12px;

    font-weight:
        800;

    letter-spacing:
        0.4px;

    color:
        #46515c;

}



/* ============================================================
   CASE CONTEXT
============================================================ */

.gg-offence-case-context {

    width:
        100%;

    min-width:
        0;

    margin:
        0 0 10px 0;

    padding:
        10px;

    border:
        1px solid
        rgba(
            29,
            112,
            184,
            0.18
        );

    border-radius:
        10px;

    background:
        #eef5fb;

}



.gg-offence-case-context-title {

    margin:
        0 0 6px 0;

    font-size:
        12px;

    font-weight:
        700;

    color:
        #234;

}



.gg-offence-case-count {

    margin-top:
        6px;

    font-size:
        11px;

    color:
        #5a6672;

    font-weight:
        700;

}



/* ============================================================
   CASE CARD
============================================================ */

.gg-offence-case-card {

    width:
        100%;

    min-width:
        0;

    max-width:
        100%;

    padding:
        12px;

    margin:
        0 0 9px 0;

    border:
        1px solid
        rgba(
            0,
            0,
            0,
            0.08
        );

    border-radius:
        11px;

    background:
        #ffffff;

    cursor:
        pointer;

    overflow:
        hidden;

}



.gg-offence-case-card:hover {

    box-shadow:
        0 3px 10px
        rgba(
            0,
            0,
            0,
            0.10
        );

}



.gg-offence-case-title {

    width:
        100%;

    min-width:
        0;

    font-size:
        13px;

    font-weight:
        800;

    line-height:
        1.35;

    color:
        #1f2933;

    overflow-wrap:
        anywhere;

}



.gg-offence-case-meta {

    width:
        100%;

    min-width:
        0;

    margin-top:
        6px;

    font-size:
        11px;

    color:
        #6d7782;

    line-height:
        1.5;

    overflow-wrap:
        anywhere;

}



.gg-offence-case-view {

    margin-top:
        8px;

    font-size:
        12px;

    font-weight:
        700;

    color:
        #1565c0;

}



.gg-selected-case {

    border:
        2px solid
        #1565c0;

    background:
        #eef6ff;

}



/* ============================================================
   CASE DETAILS SECTION
============================================================ */

#gg-offence-case-details-section {

    width:
        100%;

    min-width:
        0;

    max-width:
        100%;

    overflow:
        visible;

}



/* ============================================================
   CASE DETAILS CONTAINER

   NO SECONDARY SCROLLBAR.
============================================================ */

#gg-offence-case-details {

    width:
        100%;

    min-width:
        0;

    max-width:
        100%;

    min-height:
        0;

    max-height:
        none;

    padding:
        0;

    margin:
        0;

    overflow:
        visible;

    background:
        transparent;

}



/* ============================================================
   CASE DETAILS
   PROFESSIONAL SEPARATE CARD DESIGN
============================================================ */

.gg-offence-case-items {

    display:
        flex;

    flex-direction:
        column;

    gap:
        8px;

    width:
        100%;

    min-width:
        0;

    max-width:
        100%;

    box-sizing:
        border-box;

}



/* ============================================================
   INDIVIDUAL CASE FIELD CARD
============================================================ */

.gg-offence-case-item-box {

    display:
        block;

    width:
        100%;

    min-width:
        0;

    max-width:
        100%;

    padding:
        10px 12px;

    box-sizing:
        border-box;

    background:
        #ffffff;

    border:
        1px solid
        rgba(
            15,
            23,
            42,
            0.12
        );

    border-radius:
        8px;

    box-shadow:
        0 1px 2px
        rgba(
            15,
            23,
            42,
            0.04
        );

}



/* ============================================================
   CASE FIELD LABEL
============================================================ */

.gg-offence-case-item-label {

    display:
        block;

    width:
        100%;

    min-width:
        0;

    margin:
        0 0 4px 0;

    padding:
        0;

    font-size:
        10px;

    line-height:
        1.25;

    font-weight:
        700;

    letter-spacing:
        0.45px;

    text-transform:
        uppercase;

    color:
        #64748b;

}



/* ============================================================
   CASE FIELD VALUE
============================================================ */

.gg-offence-case-item-value {

    display:
        block;

    width:
        100%;

    min-width:
        0;

    margin:
        0;

    padding:
        0;

    font-size:
        13px;

    line-height:
        1.45;

    font-weight:
        600;

    color:
        #0f172a;

    white-space:
        normal;

    overflow-wrap:
        anywhere;

    word-break:
        break-word;

}



/* ============================================================
   LEGACY CASE DETAILS COMPATIBILITY

   Keep this because older rendering paths may still use
   these classes.
============================================================ */

.gg-case-details {

    width:
        100%;

    min-width:
        0;

    display:
        flex;

    flex-direction:
        column;

    gap:
        9px;

    font-size:
        12px;

    line-height:
        1.5;

}



.gg-case-details-row {

    width:
        100%;

    min-width:
        0;

    display:
        flex;

    flex-direction:
        column;

    gap:
        3px;

    padding:
        9px 10px;

    background:
        #ffffff;

    border:
        1px solid
        rgba(
            15,
            23,
            42,
            0.08
        );

    border-radius:
        8px;

}



.gg-case-details-label {

    min-width:
        0;

    color:
        #64748b;

    font-size:
        10px;

    font-weight:
        800;

    line-height:
        1.25;

    letter-spacing:
        0.04em;

    text-transform:
        uppercase;

}



.gg-case-details-value {

    width:
        100%;

    min-width:
        0;

    color:
        #172033;

    font-size:
        13px;

    font-weight:
        600;

    line-height:
        1.45;

    white-space:
        normal;

    overflow-wrap:
        anywhere;

    word-break:
        break-word;

}



/* ============================================================
   EXPANDABLE CASE DETAIL ACTIONS

   ACCUSED
   WITNESSES
   SEIZURE DETAILS
   SEIZED ARTICLES
============================================================ */

.gg-offence-detail-actions {

    display:
        flex;

    flex-direction:
        column;

    gap:
        8px;

    width:
        100%;

    min-width:
        0;

    max-width:
        100%;

    margin-top:
        10px;

    box-sizing:
        border-box;

}



/* ============================================================
   CLICKABLE DETAIL CARD
============================================================ */

.gg-offence-detail-action,
.gg-offence-detail-action-box {

    display:
        flex;

    align-items:
        center;

    justify-content:
        space-between;

    gap:
        10px;

    width:
        100%;

    min-width:
        0;

    max-width:
        100%;

    min-height:
        44px;

    padding:
        10px 12px;

    margin:
        0;

    box-sizing:
        border-box;

    appearance:
        none;

    -webkit-appearance:
        none;

    background:
        #ffffff;

    border:
        1px solid
        rgba(
            15,
            23,
            42,
            0.12
        );

    border-radius:
        8px;

    box-shadow:
        0 1px 2px
        rgba(
            15,
            23,
            42,
            0.04
        );

    cursor:
        pointer;

    text-align:
        left;

    font-family:
        inherit;

    transition:
        background
        0.15s
        ease,

        border-color
        0.15s
        ease,

        box-shadow
        0.15s
        ease;

}



.gg-offence-detail-action:hover,
.gg-offence-detail-action-box:hover {

    background:
        #f8fafc;

    border-color:
        rgba(
            15,
            23,
            42,
            0.20
        );

    box-shadow:
        0 2px 5px
        rgba(
            15,
            23,
            42,
            0.07
        );

}



.gg-offence-detail-action:active,
.gg-offence-detail-action-box:active {

    background:
        #f1f5f9;

}



.gg-offence-detail-action:focus-visible,
.gg-offence-detail-action-box:focus-visible {

    outline:
        2px solid
        currentColor;

    outline-offset:
        2px;

}



/* ============================================================
   DETAIL ACTION LABEL
============================================================ */

.gg-offence-detail-action-label {

    flex:
        1 1 auto;

    min-width:
        0;

    font-size:
        11px;

    line-height:
        1.35;

    font-weight:
        700;

    letter-spacing:
        0.45px;

    text-transform:
        uppercase;

    color:
        #334155;

    overflow-wrap:
        anywhere;

}



/* ============================================================
   DETAIL ACTION ARROW
============================================================ */

.gg-offence-detail-action-arrow {

    flex:
        0 0 auto;

    display:
        inline-flex;

    align-items:
        center;

    justify-content:
        center;

    font-size:
        22px;

    line-height:
        1;

    font-weight:
        400;

    color:
        #64748b;

}



/* ============================================================
   FIELD DETAILS SECTION
============================================================ */

#gg-offence-field-details-section {

    width:
        100%;

    min-width:
        0;

    max-width:
        100%;

    overflow:
        visible;

}



/* ============================================================
   FIELD DETAILS CONTAINER

   NO SECONDARY SCROLLBAR.
============================================================ */

#gg-offence-field-details {

    width:
        100%;

    min-width:
        0;

    max-width:
        100%;

    min-height:
        0;

    max-height:
        none;

    overflow:
        visible;

}



/* ============================================================
   PROFESSIONAL FIELD DETAILS TITLE
============================================================ */

.gg-offence-field-selected-title {

    width:
        100%;

    min-width:
        0;

    margin:
        2px 0 10px 0;

    padding:
        0 2px 9px 2px;

    border-bottom:
        2px solid
        rgba(
            15,
            23,
            42,
            0.10
        );

    color:
        #172033;

    font-size:
        12px;

    font-weight:
        800;

    line-height:
        1.3;

    letter-spacing:
        0.055em;

    overflow-wrap:
        anywhere;

}



/* ============================================================
   FIELD DETAILS CONTENT
============================================================ */

.gg-offence-field-details-content {

    width:
        100%;

    min-width:
        0;

    max-width:
        100%;

    display:
        flex;

    flex-direction:
        column;

    gap:
        10px;

}



/* ============================================================
   FIELD GROUP
============================================================ */

.gg-offence-field-group {

    width:
        100%;

    min-width:
        0;

    max-width:
        100%;

    margin:
        0;

    background:
        #ffffff;

    border:
        1px solid
        rgba(
            15,
            23,
            42,
            0.10
        );

    border-radius:
        10px;

    overflow:
        hidden;

}



/* ============================================================
   FIELD GROUP TITLE
============================================================ */

.gg-offence-field-group-title {

    width:
        100%;

    padding:
        9px 12px;

    background:
        rgba(
            15,
            23,
            42,
            0.035
        );

    border-bottom:
        1px solid
        rgba(
            15,
            23,
            42,
            0.08
        );

    color:
        #475569;

    font-size:
        10px;

    font-weight:
        800;

    line-height:
        1.3;

    letter-spacing:
        0.05em;

    text-transform:
        uppercase;

}



/* ============================================================
   FIELD INFORMATION ROW
============================================================ */

.gg-offence-field-info-row {

    width:
        100%;

    min-width:
        0;

    display:
        flex;

    flex-direction:
        column;

    gap:
        4px;

    padding:
        11px 12px;

    border-bottom:
        1px solid
        rgba(
            15,
            23,
            42,
            0.08
        );

}



.gg-offence-field-info-row:last-child {

    border-bottom:
        none;

}



.gg-offence-field-info-label {

    width:
        100%;

    color:
        #64748b;

    font-size:
        10px;

    font-weight:
        700;

    line-height:
        1.25;

    letter-spacing:
        0.055em;

    text-transform:
        uppercase;

}



.gg-offence-field-info-value {

    width:
        100%;

    min-width:
        0;

    color:
        #172033;

    font-size:
        13px;

    font-weight:
        600;

    line-height:
        1.45;

    white-space:
        normal;

    overflow-wrap:
        anywhere;

    word-break:
        break-word;

}



/* ============================================================
   FIELD SIMPLE TEXT
============================================================ */

.gg-offence-field-text {

    width:
        100%;

    min-width:
        0;

    max-width:
        100%;

    padding:
        11px 12px;

    background:
        #ffffff;

    border:
        1px solid
        rgba(
            15,
            23,
            42,
            0.10
        );

    border-radius:
        8px;

    color:
        #172033;

    font-size:
        13px;

    font-weight:
        600;

    line-height:
        1.5;

    white-space:
        normal;

    overflow-wrap:
        anywhere;

    word-break:
        break-word;

}



/* ============================================================
   NESTED FIELD
============================================================ */

.gg-offence-field-nested {

    width:
        calc(100% - 16px);

    min-width:
        0;

    max-width:
        calc(100% - 16px);

    margin:
        8px;

    border:
        1px solid
        rgba(
            15,
            23,
            42,
            0.08
        );

    border-radius:
        8px;

    overflow:
        hidden;

}



.gg-offence-field-nested-title {

    padding:
        8px 10px;

    background:
        rgba(
            15,
            23,
            42,
            0.035
        );

    border-bottom:
        1px solid
        rgba(
            15,
            23,
            42,
            0.08
        );

    color:
        #475569;

    font-size:
        10px;

    font-weight:
        800;

    line-height:
        1.3;

    letter-spacing:
        0.05em;

    text-transform:
        uppercase;

}



/* ============================================================
   EMPTY MESSAGE
============================================================ */

.gg-offence-empty {

    width:
        100%;

    padding:
        18px 10px;

    text-align:
        center;

    color:
        #7b8794;

    font-size:
        12px;

    line-height:
        1.6;

}



/* ============================================================
   BACK BUTTONS
============================================================ */

#gg-offence-back-to-children,
#gg-offence-back-to-cases,
#gg-offence-back-to-case-details {

    width:
        100%;

    min-height:
        40px;

    padding:
        8px 12px;

    border:
        1px solid
        rgba(
            15,
            23,
            42,
            0.10
        );

    border-radius:
        9px;

    background:
        #ffffff;

    color:
        #334155;

    font-size:
        12px;

    font-weight:
        700;

    cursor:
        pointer;

}



/* ============================================================
   DESKTOP — SHORT HEIGHT

   Keep launcher above analytics instead of returning it
   to the Leaflet upper-right control column.
============================================================ */

@media (
    max-height:
    760px
) {


    #${UIController.CONFIG.PANEL_ID} {

        top:
            6px;

        right:
            8px;

        bottom:
            6px;

        width:
            min(
                400px,
                calc(100vw - 16px)
            );

        border-radius:
            13px;

    }


    #${UIController.CONFIG.PANEL_ID}
    .gg-offence-panel-header {

        min-height:
            50px;

    }


    #${UIController.CONFIG.PANEL_ID}
    .gg-offence-panel-body {

        gap:
            12px;

        padding:
            12px;

    }


    #${UIController.CONFIG.BUTTON_ID} {

        top:
            auto;

        right:
            12px;

        bottom:
            400px;

        height:
            42px;

        min-height:
            42px;

    }


}



/* ============================================================
   TABLET / NARROW DESKTOP
============================================================ */

@media (
    max-width:
    900px
) {


    #${UIController.CONFIG.PANEL_ID} {

        width:
            min(
                390px,
                calc(100vw - 20px)
            );

        top:
            10px;

        right:
            10px;

        bottom:
            10px;

    }


}



/* ============================================================
   MOBILE

   PANEL:
       Safe margin on every edge.

   BUTTON:
       Do not use desktop analytics offset because mobile
       overlays differ significantly.

       Place the launcher on the RIGHT side in the lower-middle
       map area, but safely above the bottom edge.
============================================================ */

@media (
    max-width:
    768px
) {


    #${UIController.CONFIG.PANEL_ID} {

        top:
            max(
                8px,
                env(safe-area-inset-top)
            );

        right:
            8px;

        bottom:
            max(
                8px,
                env(safe-area-inset-bottom)
            );

        left:
            8px;

        width:
            auto;

        height:
            auto;

        max-width:
            none;

        max-height:
            none;

        border-radius:
            14px;

    }


    #${UIController.CONFIG.PANEL_ID}
    .gg-offence-panel-header {

        min-height:
            52px;

        padding:
            0 10px 0 13px;

    }


    #${UIController.CONFIG.PANEL_ID}
    .gg-offence-panel-title {

        font-size:
            13px;

    }


    #${UIController.CONFIG.CLOSE_BUTTON_ID} {

        flex-basis:
            38px;

        width:
            38px;

        height:
            38px;

        min-width:
            38px;

        min-height:
            38px;

        font-size:
            23px;

    }


    #${UIController.CONFIG.STATUS_ID} {

        min-height:
            36px;

        padding:
            6px 13px;

        font-size:
            11px;

    }


    #${UIController.CONFIG.PANEL_ID}
    .gg-offence-panel-body {

        padding:
            12px;

        gap:
            14px;

    }


    /* --------------------------------------------------------
       MOBILE OFFENCE LAUNCHER

       Avoid:
           upper-right Leaflet controls
           bottom navigation / device safe area
    -------------------------------------------------------- */

    #${UIController.CONFIG.BUTTON_ID} {

        top:
            auto;

        right:
            10px;

        bottom:
            max(
                150px,
                calc(
                    env(safe-area-inset-bottom) +
                    130px
                )
            );

        left:
            auto;

        min-width:
            104px;

        max-width:
            calc(100vw - 20px);

        height:
            42px;

        min-height:
            42px;

        padding:
            0 12px;

        border-radius:
            13px;

        font-size:
            12px;

    }


    /* --------------------------------------------------------
       CASE DETAILS MOBILE
    -------------------------------------------------------- */

    .gg-offence-case-items {

        gap:
            7px;

    }


    .gg-offence-case-item-box {

        padding:
            9px 10px;

        border-radius:
            7px;

    }


    .gg-offence-case-item-label {

        font-size:
            9.5px;

    }


    .gg-offence-case-item-value {

        font-size:
            12.5px;

        line-height:
            1.4;

    }


    .gg-offence-detail-actions {

        gap:
            7px;

        margin-top:
            9px;

    }


    .gg-offence-detail-action,
    .gg-offence-detail-action-box {

        min-height:
            42px;

        padding:
            9px 10px;

        border-radius:
            7px;

    }


    .gg-offence-detail-action-label {

        font-size:
            10.5px;

    }


    .gg-offence-detail-action-arrow {

        font-size:
            20px;

    }


}



/* ============================================================
   VERY SMALL MOBILE
============================================================ */

@media (
    max-width:
    420px
) {


    #${UIController.CONFIG.PANEL_ID} {

        top:
            max(
                5px,
                env(safe-area-inset-top)
            );

        right:
            5px;

        bottom:
            max(
                5px,
                env(safe-area-inset-bottom)
            );

        left:
            5px;

        border-radius:
            12px;

    }


    #${UIController.CONFIG.PANEL_ID}
    .gg-offence-panel-body {

        padding:
            10px;

        gap:
            12px;

    }


    #${UIController.CONFIG.PANEL_ID}
    .gg-offence-panel-header {

        min-height:
            50px;

    }


    #${UIController.CONFIG.BUTTON_ID} {

        top:
            auto;

        right:
            8px;

        bottom:
            max(
                125px,
                calc(
                    env(safe-area-inset-bottom) +
                    110px
                )
            );

        left:
            auto;

        min-width:
            96px;

        height:
            40px;

        min-height:
            40px;

        padding:
            0 10px;

        font-size:
            11px;

    }


}



/* ============================================================
   LANDSCAPE MOBILE / VERY SHORT VIEWPORT
============================================================ */

@media (
    max-height:
    520px
) {


    #${UIController.CONFIG.PANEL_ID} {

        top:
            4px;

        right:
            4px;

        bottom:
            4px;

        border-radius:
            10px;

    }


    #${UIController.CONFIG.PANEL_ID}
    .gg-offence-panel-header {

        min-height:
            46px;

    }


    #${UIController.CONFIG.STATUS_ID} {

        min-height:
            32px;

        padding-top:
            5px;

        padding-bottom:
            5px;

    }


    #${UIController.CONFIG.PANEL_ID}
    .gg-offence-panel-body {

        padding:
            9px;

        gap:
            10px;

    }


    /*
     * Short landscape screens cannot safely use a large
     * bottom analytics offset.
     */

    #${UIController.CONFIG.BUTTON_ID} {

        top:
            auto;

        right:
            8px;

        bottom:
            72px;

    }


}



/* ============================================================
   ABSOLUTE WIDTH SAFETY

   No generated case / accused / witness / seizure element
   may expand the offence panel outside the viewport.
============================================================ */

#${UIController.CONFIG.PANEL_ID} div,
#${UIController.CONFIG.PANEL_ID} section,
#${UIController.CONFIG.PANEL_ID} button {

    max-width:
        100%;

}



#${UIController.CONFIG.PANEL_ID} {

    overflow-wrap:
        anywhere;

}



/* ============================================================
   END OFFENCE RESPONSIVE UI
============================================================ */

        `;



    /* ==========================================================
       ADD STYLE TO DOCUMENT
    ========================================================== */

    document
        .head
        .appendChild(
            style
        );



    /* ==========================================================
       DEBUG
    ========================================================== */

    console.log(

        "🎨 Offence styles injected — viewport-safe panel + relocated launcher + professional case details"

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

/* ===========================================================
   CREATE PANEL
=========================================================== */

/* ===========================================================
   CREATE OFFENCE ANALYSIS PANEL

   CURRENT DESIGN
   -----------------------------------------------------------

   Runtime hierarchy:

       ANALYSIS MODE
            ↓
       PARENT
            ↓
       CHILD
            ↓
       CASES
            ↓
       CASE DETAILS
            ↓
       FIELD DETAILS


   GIS INTERACTION
   -----------------------------------------------------------

   GIS / map interaction is required only until:

       PARENT selection

   After Parent selection:

       CHILD
       CASES
       CASE DETAILS
       FIELD DETAILS

   are controlled from this panel.

   Child polygons may still be rendered/highlighted on the map,
   but should be:

       interactive: false


   COMPATIBILITY
   -----------------------------------------------------------

   Existing important IDs are preserved:

       CONFIG.SOURCE_BUTTON_ID
       CONFIG.TARGET_BUTTON_ID
       CONFIG.CLEAR_BUTTON_ID
       CONFIG.CLOSE_BUTTON_ID
       CONFIG.STATUS_ID

       gg-offence-case-results
       gg-case-result-list
       gg-offence-case-details

   This allows existing controller / renderer logic to continue
   working while the new Parent → Child UI is introduced.
=========================================================== */

createPanel:
function () {


    /* =======================================================
       PREVENT DUPLICATE PANEL
    ======================================================= */

    if (

        document.getElementById(

            UIController
                .CONFIG
                .PANEL_ID

        )

    ) {

        return document.getElementById(

            UIController
                .CONFIG
                .PANEL_ID

        );

    }



    /* =======================================================
       CREATE PANEL ROOT
    ======================================================= */

    const panel =
        document.createElement(
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



    /* =======================================================
       PANEL CONTENT
    ======================================================= */

    panel.innerHTML =
`

<!-- =========================================================
     PANEL HEADER
========================================================= -->

<div
    class="gg-offence-panel-header"
>

    <div
        class="gg-offence-panel-title"
    >

        <span
            aria-hidden="true"
        >
            🌍
        </span>

        <span>
            OFFENCE SPATIAL ANALYSIS
        </span>

    </div>


    <button

        id="${UIController.CONFIG.CLOSE_BUTTON_ID}"

        type="button"

        title="Close Offence Spatial Analysis"

        aria-label="Close Offence Spatial Analysis"

    >

        ✕

    </button>

</div>



<!-- =========================================================
     STATUS / CURRENT INSTRUCTION
========================================================= -->

<div

    id="${UIController.CONFIG.STATUS_ID}"

    data-state="ready"

    role="status"

    aria-live="polite"

>

    Select an analysis mode.

</div>



<!-- =========================================================
     SCROLLABLE PANEL BODY

     EVERYTHING BELOW THIS POINT SCROLLS TOGETHER:

         Analysis Mode
              ↓
         Offence Source / Target Area
              ↓
         Related Target / Source Areas
              ↓
         Cases
              ↓
         Case Details
              ↓
         Field Details
              ↓
         Clear Analysis
========================================================= -->

<div
    class="gg-offence-panel-body"
>



    <!-- =====================================================
         ANALYSIS MODE
    ====================================================== -->

    <section

        id="gg-offence-mode-section"

        class="gg-offence-section"

        aria-label="Analysis Mode"

    >


        <div
            class="gg-offence-section-title"
        >

            ANALYSIS MODE

        </div>


        <div
            class="gg-offence-panel-actions"
        >


            <!-- =============================================
                 SOURCE → TARGET
            ============================================== -->

            <button

                id="${UIController.CONFIG.SOURCE_BUTTON_ID}"

                type="button"

                class="gg-offence-action-button"

                data-mode="source"

                title="Analyse Source to Target"

                aria-pressed="false"

            >

                <span
                    class="gg-offence-action-icon"
                    aria-hidden="true"
                >

                    🟢

                </span>


                <span>
                    Source → Target
                </span>

            </button>



            <!-- =============================================
                 TARGET → SOURCE
            ============================================== -->

            <button

                id="${UIController.CONFIG.TARGET_BUTTON_ID}"

                type="button"

                class="gg-offence-action-button"

                data-mode="target"

                title="Analyse Target to Source"

                aria-pressed="false"

            >

                <span
                    class="gg-offence-action-icon"
                    aria-hidden="true"
                >

                    🔵

                </span>


                <span>
                    Target → Source
                </span>

            </button>


        </div>

    </section>



    <!-- =====================================================
         SELECTED OFFENCE AREA

         INTERNAL ARCHITECTURE NAME:
             PARENT

         VISIBLE NAME IS DYNAMIC:

         SOURCE → TARGET
             OFFENCE SOURCE AREA

         TARGET → SOURCE
             OFFENCE TARGET AREA

         This area is selected from GIS / MAP.
    ====================================================== -->

    <section

        id="gg-offence-parent-section"

        class="gg-offence-section"

        aria-label="Selected Offence Area"

    >


        <div

            id="gg-offence-parent-title"

            class="gg-offence-section-title"

        >

            OFFENCE AREA

        </div>


        <div

            id="gg-offence-parent-content"

            class="gg-offence-parent-content"

        >


            <div
                class="gg-offence-empty"
            >

                Select an analysis mode,
                then select an offence area
                from the map.

            </div>


        </div>

    </section>



    <!-- =====================================================
         RELATED OFFENCE AREAS

         INTERNAL ARCHITECTURE NAME:
             CHILD

         VISIBLE NAME IS DYNAMIC:

         SOURCE → TARGET
             OFFENCE TARGET AREA

         TARGET → SOURCE
             OFFENCE SOURCE AREA

         IMPORTANT:

         ALL relationship children appear here,
         including children without GIS.

         Child cards are ALWAYS CLICKABLE in this panel.

         Child polygons on the map are visual only and
         remain:

             interactive: false

         Clicking a child:
             CHILD
                ↓
             MATCHING CASES
    ====================================================== -->

    <section

        id="gg-offence-child-section"

        class="gg-offence-section"

        aria-label="Related Offence Areas"

    >


        <div

            id="gg-offence-child-title"

            class="gg-offence-section-title"

        >

            RELATED OFFENCE AREA

        </div>


        <div

            id="gg-offence-child-list"

            class="gg-offence-child-list"

        >


            <div
                class="gg-offence-empty"
            >

                Select an offence area
                from the map to view
                related areas.

            </div>


        </div>

    </section>



    <!-- =====================================================
         CASE RESULTS

         Populated when a CHILD CARD is clicked.

         CHILD
             ↓
         CASES

         Every rendered case card is clickable.

         Existing compatibility IDs retained:

             gg-offence-case-results
             gg-case-result-list
    ====================================================== -->

    <section

        id="gg-offence-case-section"

        class="gg-offence-section"

        aria-label="Matching Offence Cases"

    >


        <!-- ===============================================
             CASE SECTION HEADER
        ================================================ -->

        <div
            class="gg-offence-section-header"
        >


            <div
                class="gg-offence-section-title"
            >

                CASES

            </div>


            <span

                id="gg-offence-case-count"

                class="gg-offence-section-count"

            ></span>


        </div>



        <!-- ===============================================
             BACK TO RELATED AREAS

             CASES
                ↓ BACK
             CHILD

             IMPORTANT:

             This does NOT reset the selected GIS parent.

             Parent and complete child list remain preserved.
        ================================================ -->

        <button

            id="gg-offence-back-to-children"

            type="button"

            class="gg-offence-back-button"

            style="display:none;"

            title="Back to Related Areas"

        >

            ← Back to Related Areas

        </button>



        <!-- ===============================================
             CASE RESULTS CONTAINER
        ================================================ -->

        <div

            id="gg-offence-case-results"

            class="gg-offence-case-results"

        >


            <div

                id="gg-case-result-list"

                class="gg-offence-case-list"

            >


                <div
                    class="gg-offence-empty"
                >

                    Select a related offence area
                    to view matching cases.

                </div>


            </div>


        </div>


    </section>



    <!-- =====================================================
         CASE DETAILS

         Populated when a CASE CARD is clicked.

         CHILD
             ↓
         CASES
             ↓
         CASE DETAILS

         Individual detail fields may themselves be
         clickable/expandable.

         Existing compatibility ID retained:

             gg-offence-case-details
    ====================================================== -->

    <section

        id="gg-offence-case-details-section"

        class="gg-offence-section"

        aria-label="Case Details"

    >


        <div
            class="gg-offence-section-title"
        >

            CASE DETAILS

        </div>



        <!-- ===============================================
             BACK TO CASES

             CASE DETAILS
                 ↓ BACK
             CASES

             Current child and parent remain preserved.
        ================================================ -->

        <button

            id="gg-offence-back-to-cases"

            type="button"

            class="gg-offence-back-button"

            style="display:none;"

            title="Back to Cases"

        >

            ← Back to Cases

        </button>



        <!-- ===============================================
             CASE DETAILS CONTAINER
        ================================================ -->

        <div

            id="gg-offence-case-details"

            class="gg-offence-case-details-container"

        >


            <div
                class="gg-offence-empty"
            >

                Select a case to view
                complete offence details.

            </div>


        </div>


    </section>



    <!-- =====================================================
         FIELD DETAILS

         Populated when a clickable / expandable field
         inside CASE DETAILS is selected.

         CHILD
             ↓
         CASES
             ↓
         CASE DETAILS
             ↓
         FIELD DETAILS

         NO GIS interaction occurs at this level.
    ====================================================== -->

    <section

        id="gg-offence-field-details-section"

        class="gg-offence-section"

        aria-label="Field Details"

    >


        <div
            class="gg-offence-section-title"
        >

            FIELD DETAILS

        </div>



        <!-- ===============================================
             BACK TO CASE DETAILS

             FIELD DETAILS
                  ↓ BACK
             CASE DETAILS
        ================================================ -->

        <button

            id="gg-offence-back-to-case-details"

            type="button"

            class="gg-offence-back-button"

            style="display:none;"

            title="Back to Case Details"

        >

            ← Back to Case Details

        </button>



        <!-- ===============================================
             FIELD DETAILS CONTENT
        ================================================ -->

        <div

            id="gg-offence-field-details"

            class="gg-offence-field-details"

        >


            <div
                class="gg-offence-empty"
            >

                Select a field from
                Case Details to view
                complete information.

            </div>


        </div>


    </section>



    <!-- =====================================================
         CLEAR ANALYSIS

         GLOBAL RESET.

         This remains at the bottom of the complete
         scrollable panel.
    ====================================================== -->

    <section

        id="gg-offence-clear-section"

        class="gg-offence-section gg-offence-clear-section"

        aria-label="Clear Analysis"

    >


        <button

            id="${UIController.CONFIG.CLEAR_BUTTON_ID}"

            type="button"

            class="gg-offence-action-button gg-offence-clear-button"

            title="Clear Offence Spatial Analysis"

        >


            <span

                class="gg-offence-action-icon"

                aria-hidden="true"

            >

                🔴

            </span>


            <span>
                Clear Analysis
            </span>


        </button>


    </section>



</div>
`;


    /* =======================================================
       ADD PANEL TO DOCUMENT
    ======================================================= */

    document
        .body
        .appendChild(
            panel
        );



    /* =======================================================
       RETURN CREATED PANEL
    ======================================================= */

    return panel;


},
/* ===========================================================
   TOGGLE RELATED TARGETS
=========================================================== */



       /* ===========================================================
   TOGGLE CASE RESULTS
=========================================================== */
/* ===========================================================
   UPDATE CASE RESULTS PANEL

   Responsibilities

   ✓ Store expanded state
   ✓ Show / Hide CASE RESULTS
   ✓ Update toggle arrow
=========================================================== */


/* ===========================================================
   TOGGLE CASE RESULTS

   Responsibilities

   ✓ Manual expand/collapse only
   ✓ Update panel visibility
   ✓ Update toggle arrow
=========================================================== */



       /* ===========================================================
   BACK TO PARENT SOURCES
=========================================================== */

/* ===========================================================
   BACK TO PARENT SOURCES

   Responsibilities

   ✓ Restore parent source map
   ✓ Reset UI state
   ✓ Reinitialize SOURCE MODE
   ✓ Hide case results
=========================================================== */

/* ===========================================================
   BACK TO PARENT SOURCES

   Responsibilities

   ✓ Restore parent source map
   ✓ Reset UI state
   ✓ Reinitialize SOURCE MODE
   ✓ Hide case results
   ✓ Clear selected case
   ✓ Reset CASE DETAILS
=========================================================== */

/* ===========================================================
   BACK TO PARENT SOURCES

   Responsibilities

   ✓ Restore parent source map
   ✓ Reset UI state
   ✓ Clear drill-down state
   ✓ Reinitialize SOURCE MODE
   ✓ Hide case results
   ✓ Clear selected case
   ✓ Reset CASE DETAILS
=========================================================== */


        /* ====================================================
           CAPTURE DOM REFERENCES

           Keeps all UI references in one place.

           Expected Part 1 structure:

           UIController.elements = {
               ...
           };
        ==================================================== */

/* ===========================================================
   CAPTURE DOM REFERENCES

   CURRENT OFFENCE UI ARCHITECTURE
   -----------------------------------------------------------

   PANEL
      ↓
   ANALYSIS MODE
      ↓
   PARENT
      ↓
   CHILD
      ↓
   CASES
      ↓
   CASE DETAILS
      ↓
   FIELD DETAILS
      ↓
   CLEAR ANALYSIS


   IMPORTANT
   -----------------------------------------------------------

   GIS / map interaction ends at PARENT selection.

   After the parent is selected:

       CHILD
       CASES
       CASE DETAILS
       FIELD DETAILS

   are handled through the panel UI.

   Child polygons may still be rendered/highlighted by the
   SpatialRenderer, but they should remain:

       interactive: false


   REMOVED LEGACY REFERENCES
   -----------------------------------------------------------

   The following old DOM references are intentionally removed:

       sourceMode
       selectedSource
       relatedTargetToggle
       relatedTargetList
       caseResultsToggle
       sourceBackButton

   They belonged to the previous Source-specific / toggle-based
   UI architecture and no longer exist in createPanel().
=========================================================== */

captureElements:
function () {


    /* =======================================================
       RESET ELEMENT REFERENCE OBJECT

       Rebuild references from the current DOM every time this
       function runs.

       This prevents stale DOM references if the offence panel
       is ever destroyed and recreated.
    ======================================================= */

    UIController.elements =
        {};


    const elements =
        UIController.elements;



    /* =======================================================
       MAIN UI
    ======================================================= */

    elements.mainButton =
        document.getElementById(

            UIController
                .CONFIG
                .BUTTON_ID

        );


    elements.panel =
        document.getElementById(

            UIController
                .CONFIG
                .PANEL_ID

        );


    elements.closeButton =
        document.getElementById(

            UIController
                .CONFIG
                .CLOSE_BUTTON_ID

        );


    elements.status =
        document.getElementById(

            UIController
                .CONFIG
                .STATUS_ID

        );



    /* =======================================================
       ANALYSIS MODE

       SOURCE → TARGET
       TARGET → SOURCE
    ======================================================= */

    elements.modeSection =
        document.getElementById(
            "gg-offence-mode-section"
        );


    elements.sourceButton =
        document.getElementById(

            UIController
                .CONFIG
                .SOURCE_BUTTON_ID

        );


    elements.targetButton =
        document.getElementById(

            UIController
                .CONFIG
                .TARGET_BUTTON_ID

        );



    /* =======================================================
       SELECTED OFFENCE AREA

       INTERNAL ROLE:
           PARENT

       SOURCE → TARGET
           Visible heading:
               OFFENCE SOURCE AREA

           Area type:
               Village

       TARGET → SOURCE
           Visible heading:
               OFFENCE TARGET AREA

           Area type:
               Range

       Parent selection continues to happen through
       GIS / map click.

       IMPORTANT:
       "parentTitle" is the dynamic visible heading.
    ======================================================= */

    elements.parentSection =
        document.getElementById(
            "gg-offence-parent-section"
        );


    elements.parentTitle =
        document.getElementById(
            "gg-offence-parent-title"
        );


    elements.parentContent =
        document.getElementById(
            "gg-offence-parent-content"
        );



    /* =======================================================
       RELATED OFFENCE AREAS

       INTERNAL ROLE:
           CHILD

       SOURCE → TARGET
           Visible heading:
               OFFENCE TARGET AREA

           Area type:
               Range

       TARGET → SOURCE
           Visible heading:
               OFFENCE SOURCE AREA

           Area type:
               Village

       ALL relationship children are displayed in this panel.

       GIS availability does NOT determine whether a child
       appears here.

       GIS found:
           child polygon may be rendered/highlighted.

       GIS not found:
           no polygon is rendered,
           but child remains in this panel.

       Child cards are clickable HERE.

       Child GIS polygons remain visual only:
           interactive: false

       IMPORTANT:
       "childTitle" is the dynamic visible heading.
    ======================================================= */

    elements.childSection =
        document.getElementById(
            "gg-offence-child-section"
        );


    elements.childTitle =
        document.getElementById(
            "gg-offence-child-title"
        );


    elements.childList =
        document.getElementById(
            "gg-offence-child-list"
        );



    /* =======================================================
       CASES

       CHILD CARD
           ↓
       MATCHING OFFENCE CASES

       The case list is replaced whenever another child
       is selected.

       Parent and complete child collection remain preserved.
    ======================================================= */

    elements.caseSection =
        document.getElementById(
            "gg-offence-case-section"
        );


    elements.caseCount =
        document.getElementById(
            "gg-offence-case-count"
        );


    elements.caseResults =
        document.getElementById(
            "gg-offence-case-results"
        );


    elements.caseResultList =
        document.getElementById(
            "gg-case-result-list"
        );


    elements.backToChildren =
        document.getElementById(
            "gg-offence-back-to-children"
        );



    /* =======================================================
       CASE DETAILS

       CASE CARD
           ↓
       CASE DETAILS

       Selecting another case replaces the currently displayed
       case details while preserving:

           selected parent
           selected child
           child collection
           current case collection
    ======================================================= */

    elements.caseDetailsSection =
        document.getElementById(
            "gg-offence-case-details-section"
        );


    elements.caseDetails =
        document.getElementById(
            "gg-offence-case-details"
        );


    elements.backToCases =
        document.getElementById(
            "gg-offence-back-to-cases"
        );



    /* =======================================================
       FIELD DETAILS

       CASE DETAILS FIELD
           ↓
       FIELD DETAILS

       This is the final panel drill-down level.

       No GIS selection or map interaction occurs here.
    ======================================================= */

    elements.fieldDetailsSection =
        document.getElementById(
            "gg-offence-field-details-section"
        );


    elements.fieldDetails =
        document.getElementById(
            "gg-offence-field-details"
        );


    elements.backToCaseDetails =
        document.getElementById(
            "gg-offence-back-to-case-details"
        );



    /* =======================================================
       CLEAR ANALYSIS

       Global reset control.

       This clears the current offence spatial analysis
       according to the existing clearAnalysis() logic.
    ======================================================= */

    elements.clearSection =
        document.getElementById(
            "gg-offence-clear-section"
        );


    elements.clearButton =
        document.getElementById(

            UIController
                .CONFIG
                .CLEAR_BUTTON_ID

        );



    /* =======================================================
       RETURN CURRENT DOM REFERENCES

       EXPECTED REFERENCES:

           mainButton
           panel
           closeButton
           status

           modeSection
           sourceButton
           targetButton

           parentSection
           parentTitle
           parentContent

           childSection
           childTitle
           childList

           caseSection
           caseCount
           caseResults
           caseResultList
           backToChildren

           caseDetailsSection
           caseDetails
           backToCases

           fieldDetailsSection
           fieldDetails
           backToCaseDetails

           clearSection
           clearButton
    ======================================================= */

    return elements;


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

/* ===========================================================
   BIND UI EVENTS

   CURRENT OFFENCE UI ARCHITECTURE
   -----------------------------------------------------------

   MAIN BUTTON
       ↓
   Open / Close Panel


   ANALYSIS MODE
       ↓
   SOURCE → TARGET
       ↓
   activateSource()

   TARGET → SOURCE
       ↓
   activateTarget()


   PARENT
       ↓
   Selected directly from GIS / map polygon.

   No static DOM event is bound here.


   CHILD
       ↓
   Child cards are generated dynamically after a parent
   is selected.

   Their click handlers are attached when the child cards
   themselves are created.

   IMPORTANT:

   Child MAP polygons remain:

       interactive: false


   CASES
       ↓
   Back to Children


   CASE DETAILS
       ↓
   Back to Cases


   FIELD DETAILS
       ↓
   Back to Case Details


   CLEAR
       ↓
   clearAnalysis()


   REMOVED LEGACY EVENTS
   -----------------------------------------------------------

   The following old event bindings are intentionally removed:

       relatedTargetToggle
       caseResultsToggle
       sourceBackButton

   and therefore this function no longer calls:

       toggleRelatedTargets()
       toggleCases()
       backToSources()
/* ===========================================================
   BACK TO CHILDREN

   CURRENT PANEL ARCHITECTURE
   -----------------------------------------------------------

   Navigation:

       CASES
         ↓
       CHILD


   IMPORTANT
   -----------------------------------------------------------

   This is PANEL NAVIGATION ONLY.

   It does NOT:

       - clear the selected parent
       - re-render parent GIS polygons
       - call SpatialRenderer.clear()
       - call renderAllSources()
       - call renderAllTargets()
       - change activeMode
       - require another map click
       - rebuild SpatialEngine
       - rebuild Store


   PARENT LIFETIME
   -----------------------------------------------------------

   The currently selected parent remains authoritative until:

       1. another parent polygon is selected

          OR

       2. CLEAR ANALYSIS is pressed


   CHILD NAVIGATION
   -----------------------------------------------------------

   When returning from CASES → CHILD:

       ✓ parent remains selected
       ✓ child list remains populated
       ✓ child cards remain available

   The previously selected child is released because the user
   is returning to the child-selection level.

   Therefore:

       currentChild = null


   CASE BRANCH
   -----------------------------------------------------------

   Since no child is currently selected after returning:

       currentSpatialCases = []
       currentSpatialContext = {}
       currentCase = null
       currentField = null

   Case / details / field panels are reset.

=========================================================== */

backToChildren:
function () {


    try {


        /* ===================================================
           VALIDATE CURRENT PARENT

           Normally this function is reachable only after a
           parent has already been selected.

           Do not destroy anything if somehow called without
           a parent.
        =================================================== */

        if (
            !UIController.currentParent
        ) {


            UIController.setStatus(

                "No parent is currently selected.",

                "ready"

            );


            return false;


        }



        /* ===================================================
           RESET CURRENT CHILD SELECTION

           IMPORTANT:

           We are NOT clearing currentChildren.

           currentChildren contains the children belonging to
           the selected parent and must remain available.

           Only the currently selected child is released.
        =================================================== */

        UIController.currentChild =
            null;



        /* ===================================================
           RESET CASE BRANCH

           Cases belong to a particular selected child.

           Once we return to CHILD level there is no active
           child, therefore the case branch must be cleared.
        =================================================== */

        UIController.currentSpatialCases =
            [];


        UIController.currentSpatialContext =
            {};


        UIController.currentCase =
            null;


        UIController.currentField =
            null;



        /* ===================================================
           REMOVE ACTIVE CHILD CARD HIGHLIGHT

           Child cards themselves remain in the DOM.

           Only the selected state is removed so the user may
           choose another child.
        =================================================== */

        if (
            UIController.elements
                ?.childList
        ) {


            UIController.elements
                .childList
                .querySelectorAll(
                    ".gg-offence-child-card"
                )
                .forEach(

                    function (
                        card
                    ) {


                        card.classList.remove(
                            "gg-selected-child"
                        );


                    }

                );


        }



        /* ===================================================
           SHOW CHILD SECTION

           The existing child list is preserved.

           DO NOT rebuild it here.

           It was already populated when the parent was
           selected.
        =================================================== */

        if (
            UIController.elements
                ?.childSection
        ) {


            UIController.elements
                .childSection
                .style
                .display =
                    "";


        }



        /* ===================================================
           RESET CASE RESULTS

           Cases must be reloaded when another child is
           selected.
        =================================================== */

        if (
            UIController.elements
                ?.caseResultList
        ) {


            UIController.elements
                .caseResultList
                .innerHTML =
                    `
                    <div class="gg-offence-empty">

                        Select a child to view
                        matching offence cases.

                    </div>
                    `;


        }



        /* ===================================================
           RESET CASE COUNT
        =================================================== */

        if (
            UIController.elements
                ?.caseCount
        ) {


            UIController.elements
                .caseCount
                .textContent =
                    "";


        }



        /* ===================================================
           HIDE CASE SECTION

           We have returned to CHILD selection level.
        =================================================== */

        if (
            UIController.elements
                ?.caseSection
        ) {


            UIController.elements
                .caseSection
                .style
                .display =
                    "none";


        }



        /* ===================================================
           RESET CASE DETAILS

           Any previously selected case belonged to the
           previously selected child.
        =================================================== */

        if (
            UIController.elements
                ?.caseDetails
        ) {


            UIController.elements
                .caseDetails
                .innerHTML =
                    `
                    <div class="gg-offence-empty">

                        Select a case to view details.

                    </div>
                    `;


            UIController.elements
                .caseDetails
                .scrollTop =
                    0;


        }



        /* ===================================================
           HIDE CASE DETAILS SECTION
        =================================================== */

        if (
            UIController.elements
                ?.caseDetailsSection
        ) {


            UIController.elements
                .caseDetailsSection
                .style
                .display =
                    "none";


        }



        /* ===================================================
           RESET FIELD DETAILS

           Field details belong to the previously selected
           case and therefore cannot survive child navigation.
        =================================================== */

        if (
            UIController.elements
                ?.fieldDetails
        ) {


            UIController.elements
                .fieldDetails
                .innerHTML =
                    `
                    <div class="gg-offence-empty">

                        Select a field from case details
                        to view complete information.

                    </div>
                    `;


            UIController.elements
                .fieldDetails
                .scrollTop =
                    0;


        }



        /* ===================================================
           HIDE FIELD DETAILS SECTION
        =================================================== */

        if (
            UIController.elements
                ?.fieldDetailsSection
        ) {


            UIController.elements
                .fieldDetailsSection
                .style
                .display =
                    "none";


        }



        /* ===================================================
           PRESERVE PARENT SECTION

           Explicitly keep it available.

           Nothing inside parentContent is changed.
        =================================================== */

        if (
            UIController.elements
                ?.parentSection
        ) {


            UIController.elements
                .parentSection
                .style
                .display =
                    "";


        }



        /* ===================================================
           STATUS

           Mode-aware wording keeps this generic for both:

               SOURCE → TARGET
               TARGET → SOURCE
        =================================================== */

        const childCount =

            Array.isArray(
                UIController.currentChildren
            )

                ? UIController
                    .currentChildren
                    .length

                : 0;



        UIController.setStatus(

            childCount > 0

                ? (
                    childCount +
                    " child" +
                    (
                        childCount === 1
                            ? ""
                            : "ren"
                    ) +
                    " available. Select a child."
                )

                : "Select a child.",

            "ready"

        );



        /* ===================================================
           SCROLL CHILD SECTION INTO VIEW

           Panel navigation only.

           Does not move/zoom the Leaflet map.
        =================================================== */

        UIController.elements
            ?.childSection
            ?.scrollIntoView?.(

                {

                    block:
                        "start",

                    behavior:
                        "smooth"

                }

            );



        console.log(

            "⬅ Offence panel → CHILD level",

            {

                mode:
                    UIController.activeMode,

                parent:
                    UIController.currentParent,

                children:
                    childCount

            }

        );



        return true;


    }


    catch (
        error
    ) {


        UIController.lastError =
            error;


        UIController.setStatus(

            "Unable to return to child selection.",

            "error"

        );


        console.error(

            "❌ Offence backToChildren() failed:",

            error

        );


        return false;


    }


},

       /* ===========================================================
   SELECT CHILD

   CURRENT OFFENCE PANEL ARCHITECTURE
   -----------------------------------------------------------

   PARENT
      ↓
   CHILD              ← THIS FUNCTION
      ↓
   CASES
      ↓
   CASE DETAILS
      ↓
   FIELD DETAILS


   RESPONSIBILITIES
   -----------------------------------------------------------

   ✓ Preserve selected parent

   ✓ Preserve complete child list

   ✓ Replace current selected child

   ✓ Highlight selected child card

   ✓ Reset previous case selection

   ✓ Reset previous case details

   ✓ Reset previous field details

   ✓ Load / display cases belonging to selected child

   ✓ Keep all further navigation inside the panel


   IMPORTANT
   -----------------------------------------------------------

   This function does NOT:

       - clear the selected parent
       - require another map click
       - render parent polygons again
       - rebuild SpatialEngine
       - rebuild Store
       - change analysis mode
       - make child polygons interactive


   CHILD MAP POLYGON
   -----------------------------------------------------------

   SpatialRenderer may visually highlight the selected child.

   However child polygons must remain:

       interactive: false

=========================================================== */

selectChild:
function (
    child,
    card = null
) {


    /* =======================================================
       VALIDATE CHILD
    ======================================================= */

    if (
        !child
    ) {


        UIController.setStatus(

            "Unable to select child.",

            "error"

        );


        return false;


    }



    /* =======================================================
       VALIDATE PARENT

       A child cannot exist in the current workflow without
       an authoritative selected parent.
    ======================================================= */

    if (
        !UIController.currentParent
    ) {


        UIController.setStatus(

            "Select a parent from the map first.",

            "ready"

        );


        return false;


    }



    try {


        /* ===================================================
           STORE SELECTED CHILD

           IMPORTANT:

           DO NOT modify:

               currentParent
               currentChildren

           They remain authoritative until another parent is
           selected or CLEAR ANALYSIS is pressed.
        =================================================== */

        UIController.currentChild =
            child;



        /* ===================================================
           RESET EVERYTHING BELOW CHILD

           Changing child invalidates:

               previous cases
               previous selected case
               previous case details
               previous selected field
               previous field details

           Parent + child collection remain untouched.
        =================================================== */

        UIController.currentSpatialCases =
            [];


        UIController.currentSpatialContext =
            {};


        UIController.currentCase =
            null;


        UIController.currentField =
            null;



        /* ===================================================
           REMOVE PREVIOUS CHILD HIGHLIGHT
        =================================================== */

        if (
            UIController.elements
                ?.childList
        ) {


            UIController.elements
                .childList
                .querySelectorAll(
                    ".gg-offence-child-card"
                )
                .forEach(

                    function (
                        childCard
                    ) {


                        childCard.classList.remove(
                            "gg-selected-child"
                        );


                    }

                );


        }



        /* ===================================================
           HIGHLIGHT CURRENT CHILD CARD

           Prefer the card supplied directly by the click
           handler.

           This avoids searching the DOM unnecessarily.
        =================================================== */

        if (
            card
        ) {


            card.classList.add(
                "gg-selected-child"
            );


        }



        /* ===================================================
           RESET CASE RESULTS UI

           We are about to replace the previous child's cases.
        =================================================== */

        if (
            UIController.elements
                ?.caseResultList
        ) {


            UIController.elements
                .caseResultList
                .innerHTML =
                    `
                    <div class="gg-offence-empty">

                        Loading matching offence cases...

                    </div>
                    `;


        }



        /* ===================================================
           RESET CASE COUNT
        =================================================== */

        if (
            UIController.elements
                ?.caseCount
        ) {


            UIController.elements
                .caseCount
                .textContent =
                    "";


        }



        /* ===================================================
           RESET CASE DETAILS
        =================================================== */

        if (
            UIController.elements
                ?.caseDetails
        ) {


            UIController.elements
                .caseDetails
                .innerHTML =
                    `
                    <div class="gg-offence-empty">

                        Select a case to view details.

                    </div>
                    `;


            UIController.elements
                .caseDetails
                .scrollTop =
                    0;


        }



        /* ===================================================
           HIDE CASE DETAILS

           It becomes visible again when a particular case is
           selected.
        =================================================== */

        if (
            UIController.elements
                ?.caseDetailsSection
        ) {


            UIController.elements
                .caseDetailsSection
                .style
                .display =
                    "none";


        }



        /* ===================================================
           RESET FIELD DETAILS
        =================================================== */

        if (
            UIController.elements
                ?.fieldDetails
        ) {


            UIController.elements
                .fieldDetails
                .innerHTML =
                    `
                    <div class="gg-offence-empty">

                        Select a field from case details
                        to view complete information.

                    </div>
                    `;


            UIController.elements
                .fieldDetails
                .scrollTop =
                    0;


        }



        /* ===================================================
           HIDE FIELD DETAILS
        =================================================== */

        if (
            UIController.elements
                ?.fieldDetailsSection
        ) {


            UIController.elements
                .fieldDetailsSection
                .style
                .display =
                    "none";


        }



        /* ===================================================
           SHOW CASE SECTION

           The CASES section becomes the active downstream
           section after a child has been selected.
        =================================================== */

        if (
            UIController.elements
                ?.caseSection
        ) {


            UIController.elements
                .caseSection
                .style
                .display =
                    "";


        }



        /* ===================================================
           CHILD DISPLAY NAME
        =================================================== */

        const childName =

            child?.name ||

            child?.label ||

            child?.title ||

            child?.range ||

            child?.village ||

            child?.id ||

            "Selected child";



        /* ===================================================
           UPDATE STATUS
        =================================================== */

        UIController.setStatus(

            childName +
            " selected. Loading offence cases...",

            "loading"

        );



        /* ===================================================
           GET CASES

           NEW DESIGN PRINCIPLE
           ---------------------------------------------------

           The selected child should already contain, or be
           associated with, the offence cases calculated from
           the selected parent/child relationship.

           We first support direct case arrays.

           This keeps CHILD → CASE navigation independent of
           GIS interaction.
        =================================================== */

        let cases =
            [];



        /* ===================================================
           DIRECT CHILD CASE ARRAY
        =================================================== */

        if (
            Array.isArray(
                child.cases
            )
        ) {


            cases =
                child.cases;


        }



        /* ===================================================
           ALTERNATIVE:
           OFFENCE CASES PROPERTY
        =================================================== */

        else if (
            Array.isArray(
                child.offenceCases
            )
        ) {


            cases =
                child.offenceCases;


        }



        /* ===================================================
           ALTERNATIVE:
           MATCHING CASES PROPERTY
        =================================================== */

        else if (
            Array.isArray(
                child.matchingCases
            )
        ) {


            cases =
                child.matchingCases;


        }



        /* ===================================================
           ALTERNATIVE:
           CASCADES PROPERTY

           Some existing offence structures may carry the
           matched POR cascades directly.
        =================================================== */

        else if (
            Array.isArray(
                child.cascades
            )
        ) {


            cases =
                child.cascades;


        }



        /* ===================================================
           OPTIONAL CHILD CASE RESOLVER

           If cases are not directly attached to the child,
           allow the SpatialEngine to resolve the relationship.

           IMPORTANT:

           This is DATA LOOKUP only.

           It is NOT another GIS/map selection operation.
        =================================================== */

        if (
            cases.length === 0
        ) {


            const SpatialEngine =
                UIController
                    .getSpatialEngine();


            if (
                SpatialEngine &&
                typeof
                SpatialEngine.getCasesForPair ===
                "function"
            ) {


                const result =
                    SpatialEngine
                        .getCasesForPair(

                            UIController
                                .currentParent,

                            child,

                            UIController
                                .activeMode

                        );


                if (
                    Array.isArray(
                        result
                    )
                ) {


                    cases =
                        result;


                }


            }


        }



        /* ===================================================
           STORE CURRENT CASE COLLECTION
        =================================================== */

        UIController.currentSpatialCases =
            Array.isArray(
                cases
            )

                ? cases

                : [];



        /* ===================================================
           STORE CURRENT PANEL CONTEXT

           This represents the currently selected relationship:

               mode
               parent
               child

           No map interaction is required from this point.
        =================================================== */

        UIController.currentSpatialContext =
            {

                mode:
                    UIController.activeMode,

                parent:
                    UIController.currentParent,

                child:
                    UIController.currentChild

            };



        /* ===================================================
           OPTIONAL MAP VISUAL HIGHLIGHT

           IMPORTANT:

           This is VISUAL ONLY.

           The child polygon must remain non-interactive.

           We deliberately do NOT call:

               SpatialRenderer.clear()

           because that could destroy the authoritative parent
           map state.

           Renderer implementations may optionally expose:

               highlightChild()

           If it does not exist, panel operation continues
           normally.
        =================================================== */

        const SpatialRenderer =
            UIController
                .getSpatialRenderer();


        if (
            SpatialRenderer &&
            typeof
            SpatialRenderer.highlightChild ===
            "function"
        ) {


            try {


                SpatialRenderer
                    .highlightChild(

                        child,

                        {

                            interactive:
                                false,

                            mode:
                                UIController.activeMode,

                            parent:
                                UIController.currentParent

                        }

                    );


            }


            catch (
                highlightError
            ) {


                console.warn(

                    "⚠ Child polygon highlight failed:",

                    highlightError

                );


            }


        }



        /* ===================================================
           NO CASES
        =================================================== */

        if (
            UIController.currentSpatialCases
                .length ===
            0
        ) {


            if (
                UIController.elements
                    ?.caseResultList
            ) {


                UIController.elements
                    .caseResultList
                    .innerHTML =
                        `
                        <div class="gg-offence-empty">

                            No matching offence cases found
                            for this child.

                        </div>
                        `;


            }



            if (
                UIController.elements
                    ?.caseCount
            ) {


                UIController.elements
                    .caseCount
                    .textContent =
                        "0 cases";


            }



            UIController.setStatus(

                "No offence cases found for " +
                childName +
                ".",

                "ready"

            );



            UIController.elements
                ?.caseSection
                ?.scrollIntoView?.(

                    {

                        block:
                            "start",

                        behavior:
                            "smooth"

                    }

                );



            return [];


        }



        /* ===================================================
           RENDER CASES

           showSpatialCases() is responsible for displaying
           the current case collection.

           IMPORTANT:

           Under the new architecture this should eventually
           be the controller's panel renderer and must not
           delegate back into an old Cascade UI.
        =================================================== */

        if (
            typeof
            UIController.showSpatialCases ===
            "function"
        ) {


            UIController
                .showSpatialCases(

                    UIController
                        .currentSpatialCases,

                    UIController
                        .currentSpatialContext

                );


        }

        else {


            console.error(

                "❌ OffenceUIController.showSpatialCases() unavailable"

            );


            return false;


        }



        /* ===================================================
           UPDATE CASE COUNT
        =================================================== */

        const caseCount =
            UIController
                .currentSpatialCases
                .length;


        if (
            UIController.elements
                ?.caseCount
        ) {


            UIController.elements
                .caseCount
                .textContent =

                caseCount +

                " case" +

                (
                    caseCount === 1
                        ? ""
                        : "s"
                );


        }



        /* ===================================================
           STATUS
        =================================================== */

        UIController.setStatus(

            caseCount +
            " offence case" +
            (
                caseCount === 1
                    ? ""
                    : "s"
            ) +
            " found for " +
            childName +
            ".",

            "success"

        );



        /* ===================================================
           SCROLL CASE SECTION INTO VIEW

           Panel only.

           Leaflet map is not moved.
        =================================================== */

        UIController.elements
            ?.caseSection
            ?.scrollIntoView?.(

                {

                    block:
                        "start",

                    behavior:
                        "smooth"

                }

            );



        console.log(

            "➡ Offence CHILD selected",

            {

                mode:
                    UIController.activeMode,

                parent:
                    UIController.currentParent,

                child:
                    UIController.currentChild,

                cases:
                    caseCount

            }

        );



        return UIController
            .currentSpatialCases;


    }


    catch (
        error
    ) {


        UIController.lastError =
            error;


        UIController.setStatus(

            error?.message ||
            "Unable to select child.",

            "error"

        );


        console.error(

            "❌ Offence selectChild() failed:",

            error

        );


        return false;


    }


},

bindEvents:
function () {


    const elements =
        UIController.elements;


    if (
        !elements
    ) {

        console.warn(
            "⚠ OffenceUIController cannot bind events: elements unavailable"
        );

        return false;

    }



    /* =======================================================
       MAIN OFFENCE BUTTON

       Opens / closes the complete Offence Analysis panel.
    ======================================================= */

    if (
        elements.mainButton
    ) {

        elements.mainButton.onclick =
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



    /* =======================================================
       CLOSE BUTTON

       IMPORTANT:

       Closing the panel does NOT clear the current analysis.

       Map rendering and current analysis state remain intact.

       CLEAR ANALYSIS is responsible for explicitly resetting
       the analysis.
    ======================================================= */

    if (
        elements.closeButton
    ) {

        elements.closeButton.onclick =
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



    /* =======================================================
       SOURCE → TARGET MODE

       Runtime flow:

           User clicks SOURCE → TARGET
                    ↓
           activateSource()
                    ↓
           prepareSpatialSystem()
                    ↓
           renderAllSources()
                    ↓
           Source parent polygons become interactive
                    ↓
           User selects SOURCE parent on map
                    ↓
           Parent panel populated
                    ↓
           Related TARGET children populated
                    ↓
           Child polygons may be highlighted/rendered
           but remain non-interactive
    ======================================================= */

    if (
        elements.sourceButton
    ) {

        elements.sourceButton.onclick =
            async function (
                event
            ) {


                event
                    ?.preventDefault?.();


                event
                    ?.stopPropagation?.();


                if (
                    UIController.preparing ===
                    true
                ) {

                    return;

                }


                if (
                    typeof
                    UIController.activateSource ===
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



    /* =======================================================
       TARGET → SOURCE MODE

       Runtime flow:

           User clicks TARGET → SOURCE
                    ↓
           activateTarget()
                    ↓
           prepareSpatialSystem()
                    ↓
           renderAllTargets()
                    ↓
           Target parent polygons become interactive
                    ↓
           User selects TARGET parent on map
                    ↓
           Parent panel populated
                    ↓
           Related SOURCE children populated
                    ↓
           Child polygons may be highlighted/rendered
           but remain non-interactive
    ======================================================= */

    if (
        elements.targetButton
    ) {

        elements.targetButton.onclick =
            async function (
                event
            ) {


                event
                    ?.preventDefault?.();


                event
                    ?.stopPropagation?.();


                if (
                    UIController.preparing ===
                    true
                ) {

                    return;

                }


                if (
                    typeof
                    UIController.activateTarget ===
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



    /* =======================================================
       BACK TO CHILDREN

       Current position:

           CASES

       Action:

           CASES
              ↓
           CHILD

       IMPORTANT:

       This does NOT return to the GIS parent-selection stage.

       The currently selected parent remains selected.

       The current child list remains available.

       No map click is required.
    ======================================================= */

    if (
        elements.backToChildren
    ) {

        elements.backToChildren.onclick =
            function (
                event
            ) {


                event
                    ?.preventDefault?.();


                event
                    ?.stopPropagation?.();


                if (
                    typeof
                    UIController.backToChildren ===
                    "function"
                ) {

                    UIController
                        .backToChildren();

                }

                else {

                    console.error(
                        "❌ OffenceUIController.backToChildren() unavailable"
                    );

                }


            };

    }



    /* =======================================================
       BACK TO CASES

       Current position:

           CASE DETAILS

       Action:

           CASE DETAILS
                ↓
              CASES

       The selected parent and child remain unchanged.

       No GIS interaction occurs.
    ======================================================= */

    if (
        elements.backToCases
    ) {

        elements.backToCases.onclick =
            function (
                event
            ) {


                event
                    ?.preventDefault?.();


                event
                    ?.stopPropagation?.();


                if (
                    typeof
                    UIController.backToCases ===
                    "function"
                ) {

                    UIController
                        .backToCases();

                }

                else {

                    console.error(
                        "❌ OffenceUIController.backToCases() unavailable"
                    );

                }


            };

    }



    /* =======================================================
       BACK TO CASE DETAILS

       Current position:

           FIELD DETAILS

       Action:

           FIELD DETAILS
                 ↓
           CASE DETAILS

       Current case remains selected.

       No GIS interaction occurs.
    ======================================================= */

    if (
        elements.backToCaseDetails
    ) {

        elements.backToCaseDetails.onclick =
            function (
                event
            ) {


                event
                    ?.preventDefault?.();


                event
                    ?.stopPropagation?.();


                if (
                    typeof
                    UIController.backToCaseDetails ===
                    "function"
                ) {

                    UIController
                        .backToCaseDetails();

                }

                else {

                    console.error(
                        "❌ OffenceUIController.backToCaseDetails() unavailable"
                    );

                }


            };

    }



    /* =======================================================
       CLEAR ANALYSIS

       Complete analysis reset.

       Expected responsibility of clearAnalysis():

           ✓ Clear offence spatial rendering

           ✓ Reset activeMode

           ✓ Reset current parent

           ✓ Reset current children

           ✓ Reset selected child

           ✓ Reset current cases

           ✓ Reset selected case

           ✓ Reset selected field

           ✓ Reset Parent panel

           ✓ Reset Child panel

           ✓ Reset Cases panel

           ✓ Reset Case Details panel

           ✓ Reset Field Details panel

           ✓ Reset active mode buttons

       This does NOT destroy:

           Store
           SpatialEngine
           Spatial indexes
           GIS base data
    ======================================================= */

    if (
        elements.clearButton
    ) {

        elements.clearButton.onclick =
            function (
                event
            ) {


                event
                    ?.preventDefault?.();


                event
                    ?.stopPropagation?.();


                if (
                    typeof
                    UIController.clearAnalysis ===
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



    /* =======================================================
       IMPORTANT:
       NO PARENT CLICK BINDING HERE

       Parent selection is performed by SpatialRenderer through
       the interactive parent GIS polygons.

       SOURCE → TARGET:
           SOURCE village polygon = interactive

       TARGET → SOURCE:
           TARGET range polygon = interactive

       SpatialRenderer should call the appropriate controller
       parent-selection method after the polygon is selected.
    ======================================================= */



    /* =======================================================
       IMPORTANT:
       NO CHILD CLICK BINDING HERE

       Child cards do not exist when bindEvents() initially
       runs.

       They are dynamically generated after a parent has been
       selected.

       Therefore each generated child card should receive its
       click handler during child-list rendering.

       Example architecture:

           renderChildren(children)
                   ↓
           create child card
                   ↓
           card.onclick
                   ↓
           selectChild(child)


       Child map polygons remain:

           interactive: false
    ======================================================= */



    /* =======================================================
       IMPORTANT:
       NO CASE CARD CLICK BINDING HERE

       Case cards are also dynamically generated.

       Their click handler belongs where the cards are created:

           renderCases(cases)
                 ↓
           create case card
                 ↓
           card.onclick
                 ↓
           selectCase(caseData, card)
    ======================================================= */



    /* =======================================================
       IMPORTANT:
       NO CASE FIELD CLICK BINDING HERE

       Expandable case fields are dynamically generated when
       CASE DETAILS is rendered.

       Their click handlers should be attached when the field
       rows are created:

           showCaseDetails(caseData)
                    ↓
           create field row
                    ↓
           field.onclick
                    ↓
           showFieldDetails(...)
    ======================================================= */



    return true;


},
/* ===========================================================
   SELECT RELATED TARGET

   Called when the user clicks a target in SOURCE MODE.

   Responsibilities

   ✓ Remember selected target
   ✓ Highlight selected button
   ✓ Delegate processing to SpatialRenderer
=========================================================== */

/* ===========================================================
   SELECT CHILD

   NEW PANEL DESIGN
   -----------------------------------------------------------

   Called when the user clicks a CHILD card.

   Runtime flow:

       PARENT
          ↓
       CHILD
          ↓
       CASES

   IMPORTANT ARCHITECTURE
   -----------------------------------------------------------

   GIS interaction ends at PARENT selection.

   Therefore this function:

   ✓ Preserves selected parent
   ✓ Preserves complete child list
   ✓ Stores selected child
   ✓ Highlights selected child
   ✓ Clears previous case selection
   ✓ Clears previous case details
   ✓ Clears previous field selection
   ✓ Clears previous field details
   ✓ Resolves cases from child data / relationship
   ✓ Opens CASES
   ✓ Keeps CHILD visible
   ✓ Does NOT require a map click
   ✓ Does NOT select a child polygon
   ✓ Does NOT make child polygon interactive
   ✓ Does NOT rebuild SpatialEngine
   ✓ Does NOT re-render parent GIS polygons

=========================================================== */

selectChild:
function (
    child,
    card = null
) {


    /* ============================================
       VALIDATE CHILD
    ============================================ */

    if (
        !child
    ) {

        console.warn(
            "⚠ selectChild(): child unavailable"
        );


        return false;

    }


    /* ============================================
       PRESERVE PARENT

       IMPORTANT:

       Do NOT modify:

           currentParent
           currentSource
           currentChildren
           currentTargets
           activeMode

       Parent remains selected until another
       parent polygon is clicked on the map.
    ============================================ */


    /* ============================================
       STORE SELECTED CHILD
    ============================================ */

    UIController.currentChild =
        child;


    /*
     * Compatibility with the previous
     * SOURCE → TARGET implementation.
     *
     * In SOURCE mode the child may still
     * conceptually be the target.
     *
     * This is state compatibility only.
     *
     * NO GIS operation is performed here.
     */

    if (
        UIController.activeMode ===
        "source"
    ) {

        UIController.currentTarget =
            child;

    }


    /* ============================================
       CLEAR PREVIOUS CHILD-SPECIFIC CASE STATE

       A different child may previously have
       been selected.

       Never allow cases from child A to remain
       visible while child B is active.
    ============================================ */

    UIController.currentSpatialCases =
        [];


    UIController.currentSpatialContext =
        {};


    /* ============================================
       CLEAR PREVIOUS CASE
    ============================================ */

    UIController.currentCase =
        null;


    /* ============================================
       CLEAR PREVIOUS FIELD
    ============================================ */

    UIController.currentField =
        null;


    UIController.currentFieldKey =
        null;


    UIController.currentFieldValue =
        null;


    /* ============================================
       HIGHLIGHT SELECTED CHILD

       First remove any previous child highlight.
    ============================================ */

    const childList =
        UIController.elements
            ?.childList;


    if (
        childList
    ) {

        childList
            .querySelectorAll(
                ".gg-offence-child-card"
            )
            .forEach(

                function (
                    childCard
                ) {

                    childCard
                        .classList
                        .remove(
                            "gg-selected-child"
                        );


                    childCard
                        .setAttribute(
                            "aria-selected",
                            "false"
                        );

                }

            );


        /*
         * Migration compatibility.
         *
         * Remove the old related-target
         * highlight if any old class remains.
         */

        childList
            .querySelectorAll(
                ".gg-related-target-item"
            )
            .forEach(

                function (
                    childCard
                ) {

                    childCard
                        .classList
                        .remove(
                            "gg-related-target-active"
                        );


                    childCard
                        .setAttribute(
                            "aria-selected",
                            "false"
                        );

                }

            );

    }


    /* ============================================
       APPLY SELECTED CHILD HIGHLIGHT

       Preferred:

           card passed directly from click handler

       Fallback:

           locate using data-child-key
    ============================================ */

    let selectedCard =
        card;


    if (
        !selectedCard &&
        childList
    ) {


        const childKey =

            child?.key ||

            child?.id ||

            child?.name ||

            child?.label ||

            child?.title ||

            "";


        if (
            childKey
        ) {

            /*
             * Avoid placing an unescaped arbitrary
             * value directly into a selector.
             */

            const childCards =
                Array.from(
                    childList.children
                );


            selectedCard =
                childCards.find(

                    function (
                        candidate
                    ) {

                        return (

                            candidate
                                ?.dataset
                                ?.childKey ===
                            String(
                                childKey
                            )

                        );

                    }

                ) ||
                null;

        }

    }


    if (
        selectedCard
    ) {

        selectedCard
            .classList
            .add(
                "gg-selected-child"
            );


        selectedCard
            .setAttribute(
                "aria-selected",
                "true"
            );

    }


    /* ============================================
       RESET CASE RESULTS UI

       We are about to load the cases belonging
       to the newly selected child.
    ============================================ */

    const caseResultList =
        UIController.elements
            ?.caseResultList;


    if (
        caseResultList
    ) {

        caseResultList.innerHTML =
            `
            <div class="gg-offence-empty">

                Loading matching offence cases...

            </div>
            `;


        caseResultList.scrollTop =
            0;

    }


    /* ============================================
       RESET CASE DETAILS
    ============================================ */

    const caseDetails =
        UIController.elements
            ?.caseDetails;


    if (
        caseDetails
    ) {

        caseDetails.innerHTML =
            `
            <div class="gg-offence-empty">

                Select a case to view complete
                offence details.

            </div>
            `;


        caseDetails.scrollTop =
            0;

    }


    /* ============================================
       RESET FIELD DETAILS
    ============================================ */

    const fieldDetails =
        UIController.elements
            ?.fieldDetails;


    if (
        fieldDetails
    ) {

        fieldDetails.innerHTML =
            `
            <div class="gg-offence-empty">

                Select a field from CASE DETAILS
                to view its complete content.

            </div>
            `;


        fieldDetails.scrollTop =
            0;

    }


    /* ============================================
       HIDE CASE DETAILS

       A case has not yet been selected for this
       child.
    ============================================ */

    const caseDetailsSection =
        UIController.elements
            ?.caseDetailsSection;


    if (
        caseDetailsSection
    ) {

        caseDetailsSection
            .style
            .display =
                "none";

    }


    /* ============================================
       HIDE FIELD DETAILS
    ============================================ */

    const fieldDetailsSection =
        UIController.elements
            ?.fieldDetailsSection;


    if (
        fieldDetailsSection
    ) {

        fieldDetailsSection
            .style
            .display =
                "none";

    }


    /* ============================================
       SHOW CASES SECTION
    ============================================ */

    const casesSection =
        UIController.elements
            ?.casesSection;


    if (
        casesSection
    ) {

        casesSection
            .style
            .display =
                "";

    }


    /* ============================================
       SHOW CASE RESULTS CONTAINER
    ============================================ */

    const caseResults =
        UIController.elements
            ?.caseResults;


    if (
        caseResults
    ) {

        caseResults
            .style
            .display =
                "";

    }


    /* ============================================
       UPDATE CURRENT VIEW
    ============================================ */

    UIController.currentView =
        "cases";


    /* ============================================
       BUILD CHILD CONTEXT

       This context travels with the case list.

       It contains UI/data relationship state,
       not a new GIS selection.
    ============================================ */

    const parent =

        UIController.currentParent ||

        (
            UIController.activeMode ===
            "source"

                ? UIController.currentSource

                : UIController.currentTarget

        ) ||

        null;


    const context = {

        mode:
            UIController.activeMode,

        parent:
            parent,

        child:
            child,

        parentKey:

            parent?.key ||

            parent?.id ||

            parent?.name ||

            parent?.label ||

            null,

        childKey:

            child?.key ||

            child?.id ||

            child?.name ||

            child?.label ||

            null

    };


    UIController.currentSpatialContext =
        context;


    /* ============================================
       UPDATE STATUS
    ============================================ */

    const childName =

        child?.name ||

        child?.label ||

        child?.title ||

        child?.id ||

        "selected child";


    UIController
        .setStatus(

            "Loading offence cases for " +
            childName +
            "...",

            "loading"

        );


    /* ============================================
       RESOLVE CHILD CASES

       IMPORTANT:

       CHILD → CASES is no longer a GIS action.

       We first use cases already carried by the
       child object.

       Supported structures:

           child.cases
           child.caseList
           child.offenceCases
           child.matchedCases
           child.cascades

       This allows the renderer/controller that
       created the CHILD list to attach the
       authoritative case collection directly.
    ============================================ */

    let cases =
        [];


    if (
        Array.isArray(
            child.cases
        )
    ) {

        cases =
            child.cases;

    }

    else if (
        Array.isArray(
            child.caseList
        )
    ) {

        cases =
            child.caseList;

    }

    else if (
        Array.isArray(
            child.offenceCases
        )
    ) {

        cases =
            child.offenceCases;

    }

    else if (
        Array.isArray(
            child.matchedCases
        )
    ) {

        cases =
            child.matchedCases;

    }

    else if (
        Array.isArray(
            child.cascades
        )
    ) {

        cases =
            child.cascades;

    }


    /* ============================================
       OPTIONAL RELATIONSHIP LOOKUP

       If child cards do not directly carry cases,
       allow a dedicated NON-GIS resolver.

       Preferred future API:

           UIController.resolveCasesForChild()

       This keeps relationship lookup separate
       from map rendering.
    ============================================ */

    if (
        !cases.length &&
        typeof
        UIController.resolveCasesForChild ===
        "function"
    ) {

        try {

            const resolved =
                UIController
                    .resolveCasesForChild(

                        child,

                        parent,

                        context

                    );


            /*
             * Support synchronous resolver.
             *
             * If your resolver later becomes async,
             * selectChild() should then be converted
             * to async.
             */

            if (
                Array.isArray(
                    resolved
                )
            ) {

                cases =
                    resolved;

            }

        }

        catch (
            error
        ) {

            console.error(

                "❌ Unable to resolve cases for child:",

                error

            );

        }

    }


    /* ============================================
       CASES FOUND

       Delegate rendering to the controller's
       case rendering function.
    ============================================ */

    if (
        cases.length > 0
    ) {

        if (
            typeof
            UIController.showSpatialCases ===
            "function"
        ) {

            UIController
                .showSpatialCases(

                    cases,

                    context

                );

        }

        else {

            UIController.currentSpatialCases =
                cases;


            UIController
                .setStatus(

                    cases.length +
                    " offence case" +
                    (
                        cases.length === 1
                            ? ""
                            : "s"
                    ) +
                    " found.",

                    "success"

                );

        }

    }


    /* ============================================
       NO CASES FOUND
    ============================================ */

    else {

        UIController.currentSpatialCases =
            [];


        if (
            caseResultList
        ) {

            caseResultList.innerHTML =
                `
                <div class="gg-offence-empty">

                    No matching offence cases
                    found for this child.

                </div>
                `;

        }


        UIController
            .setStatus(

                "No offence cases found for " +
                childName +
                ".",

                "ready"

            );

    }


    /* ============================================
       SCROLL TO CASES

       PANEL navigation only.

       No map pan.
       No map zoom.
       No polygon click.
    ============================================ */

    if (
        casesSection
    ) {

        casesSection
            .scrollIntoView?.(

                {
                    block:
                        "nearest",

                    behavior:
                        "smooth"
                }

            );

    }


    /* ============================================
       DEBUG
    ============================================ */

    console.log(

        "➡ Offence navigation: CHILD → CASES",

        {

            mode:
                UIController.activeMode,

            parent:
                parent,

            child:
                child,

            caseCount:
                cases.length,

            currentView:
                UIController.currentView

        }

    );


    return cases;


},
       /* ===========================================================
   OPEN SOURCE MODE PANEL

   Called by:

       Renderer.selectSource()

   Responsibilities

   ✓ Show SOURCE MODE
   ✓ Remember selected source
   ✓ Store related targets
   ✓ Populate target list
   ✓ Reset case section
=========================================================== */

/* ===========================================================
   OPEN PARENT PANEL

   NEW OFFENCE PANEL DESIGN
   -----------------------------------------------------------

   Called after a PARENT polygon is selected on the map.

   Supported modes:

       SOURCE → TARGET

           Parent:
               Source Village

           Children:
               Target Ranges


       TARGET → SOURCE

           Parent:
               Target Range

           Children:
               Source Villages


   GIS BOUNDARY
   -----------------------------------------------------------

   GIS / map interaction is used only to select the PARENT.

   After this function receives:

       parent
       children

   all further navigation is panel/data driven:

       CHILD
          ↓
       CASES
          ↓
       CASE DETAILS
          ↓
       FIELD DETAILS


   Responsibilities

   ✓ Store selected parent
   ✓ Store complete child collection
   ✓ Preserve current analysis mode
   ✓ Populate PARENT section
   ✓ Populate CHILD section
   ✓ Make CHILD cards clickable
   ✓ Reset previous child selection
   ✓ Reset previous cases
   ✓ Reset previous case selection
   ✓ Reset previous field selection
   ✓ Hide CASES
   ✓ Hide CASE DETAILS
   ✓ Hide FIELD DETAILS
   ✓ No child GIS interaction
   ✓ No child polygon click required
   ✓ No SpatialRenderer call from child cards

=========================================================== */

openParentPanel:
function (
    parent,
    children = [],
    context = {}
) {


    const elements =
        UIController.elements;



    /* ========================================================
       VALIDATE
    ======================================================== */

    if (
        !elements ||
        !parent
    ) {

        console.warn(
            "⚠ openParentPanel(): UI elements or parent unavailable"
        );

        return false;

    }



    /* ========================================================
       GET SPATIAL RENDERER
    ======================================================== */

    const SpatialRenderer =
        GG
            ?.Offence
            ?.SpatialRenderer;



    /* ========================================================
       NORMALIZE CURRENT MODE

       SOURCE
           OFFENCE SOURCE AREA
                    ↓
           OFFENCE TARGET AREA


       TARGET
           OFFENCE TARGET AREA
                    ↓
           OFFENCE SOURCE AREA
    ======================================================== */

const rawMode =

    context.mode ||

    SpatialRenderer?.mode ||

    UIController.currentMode ||

    "";


    const mode =
        String(
            rawMode
        )
            .trim()
            .toLowerCase();



    const isSourceMode =
        mode ===
        "source";


    const isTargetMode =
        mode ===
        "target";



    /* ========================================================
       NORMALIZE CHILDREN

       IMPORTANT:

       This receives ALL relationship children.

       DO NOT filter children here based on GIS.

       Therefore:

           GIS child
               → shown in panel

           NON-GIS child
               → ALSO shown in panel

       GIS filtering belongs only to SpatialRenderer polygon
       rendering logic.
    ======================================================== */

    const childList =
        Array.isArray(
            children
        )
            ? children
            : [];



    /* ========================================================
       RESOLVE VISIBLE SECTION HEADINGS

       IMPORTANT:

       We DO NOT display:

           PARENT
           CHILD

       Those are only internal architecture concepts.
    ======================================================== */

    const parentHeading =

        isSourceMode
            ? "OFFENCE SOURCE AREA"
            :
        isTargetMode
            ? "OFFENCE TARGET AREA"
            :
        "OFFENCE AREA";


    const childHeading =

        isSourceMode
            ? "OFFENCE TARGET AREA"
            :
        isTargetMode
            ? "OFFENCE SOURCE AREA"
            :
        "RELATED OFFENCE AREA";



    /* ========================================================
       RESOLVE DISPLAY AREA TYPES

       SOURCE → TARGET

           Parent = Village
           Child  = Range


       TARGET → SOURCE

           Parent = Range
           Child  = Village
    ======================================================== */

    const parentType =

        context.parentType ||

        (
            isSourceMode
                ? "Village"
                :
            isTargetMode
                ? "Range"
                :
            "Area"
        );


    const childType =

        context.childType ||

        (
            isSourceMode
                ? "Range"
                :
            isTargetMode
                ? "Village"
                :
            "Area"
        );



    /* ========================================================
       STORE CURRENT PANEL STATE

       THIS IS A NEW PARENT SELECTION.

       Therefore:

           currentParent
               → replaced

           currentChildren
               → replaced

           currentChild
               → reset

           currentCases
               → reset

           currentCase
               → reset

           currentField
               → reset


       IMPORTANT:

       Once this parent has been selected, clicking different
       children MUST NOT replace currentParent/currentChildren.

       They remain until:

           1. another GIS parent is selected
           OR
           2. Clear Analysis is used
    ======================================================== */

    UIController.currentParent =
        parent;


    UIController.currentChildren =
        childList;


    UIController.currentMode =
        mode;


    UIController.currentParentType =
        parentType;


    UIController.currentChildType =
        childType;


    UIController.currentChild =
        null;


    UIController.currentCase =
        null;


    UIController.currentField =
        null;


    UIController.currentSpatialCases =
        [];


    UIController.currentSpatialContext =
        null;



    /* ========================================================
       ENSURE PANEL IS OPEN
    ======================================================== */

    if (
        elements.panel
    ) {

        elements
            .panel
            .classList
            .add(
                "gg-offence-panel-open"
            );


        elements
            .panel
            .setAttribute(
                "aria-hidden",
                "false"
            );

    }



    /* ========================================================
       UPDATE DYNAMIC PARENT HEADING
    ======================================================== */

    if (
        elements.parentTitle
    ) {

        elements
            .parentTitle
            .textContent =
                parentHeading;

    }



    /* ========================================================
       UPDATE DYNAMIC CHILD HEADING
    ======================================================== */

    if (
        elements.childTitle
    ) {

        elements
            .childTitle
            .textContent =
                childHeading;

    }



    /* ========================================================
       SHOW PARENT SECTION
    ======================================================== */

    if (
        elements.parentSection
    ) {

        elements
            .parentSection
            .style
            .display =
                "";

    }



    /* ========================================================
       RESOLVE PARENT INFORMATION
    ======================================================== */

    const parentName =

        parent.name ||

        parent.cleanName ||

        parent.label ||

        parent.title ||

        parent.id ||

        parent.key ||

        "Unknown";


    const parentCount =

        Number(

            parent.offenceCount ??

            parent.caseCount ??

            parent.count ??

            0

        );



    /* ========================================================
       POPULATE PARENT CARD

       SOURCE → TARGET EXAMPLE:

           OFFENCE SOURCE AREA

           📍 Bairiguri
           Village                 15 cases


       TARGET → SOURCE EXAMPLE:

           OFFENCE TARGET AREA

           📍 WestDamanpur
           Range                   80 cases
    ======================================================== */

    if (
        elements.parentContent
    ) {

        elements
            .parentContent
            .innerHTML =
                "";


        const parentCard =
            document.createElement(
                "div"
            );


        parentCard.className =
            "gg-offence-parent-card";



        /* ----------------------------------------------------
           PARENT MAIN
        ---------------------------------------------------- */

        const parentMain =
            document.createElement(
                "div"
            );


        parentMain.className =
            "gg-offence-parent-main";



        /* ----------------------------------------------------
           PARENT NAME
        ---------------------------------------------------- */

        const parentNameElement =
            document.createElement(
                "div"
            );


        parentNameElement.className =
            "gg-offence-parent-name";


        parentNameElement.textContent =
            `📍 ${parentName}`;



        /* ----------------------------------------------------
           PARENT TYPE
        ---------------------------------------------------- */

        const parentTypeElement =
            document.createElement(
                "div"
            );


        parentTypeElement.className =
            "gg-offence-parent-type";


        parentTypeElement.textContent =
            parentType;



        parentMain.appendChild(
            parentNameElement
        );


        parentMain.appendChild(
            parentTypeElement
        );


        parentCard.appendChild(
            parentMain
        );



        /* ----------------------------------------------------
           PARENT CASE COUNT
        ---------------------------------------------------- */

        const parentCountElement =
            document.createElement(
                "div"
            );


        parentCountElement.className =
            "gg-offence-parent-count";


        parentCountElement.textContent =

            `${parentCount} case${
                parentCount === 1
                    ? ""
                    : "s"
            }`;


        parentCard.appendChild(
            parentCountElement
        );



        /* ----------------------------------------------------
           APPEND PARENT CARD
        ---------------------------------------------------- */

        elements
            .parentContent
            .appendChild(
                parentCard
            );

    }



    /* ========================================================
       SHOW CHILD SECTION
    ======================================================== */

    if (
        elements.childSection
    ) {

        elements
            .childSection
            .style
            .display =
                "";

    }



    /* ========================================================
       CLEAR CHILD LIST
    ======================================================== */

    if (
        elements.childList
    ) {

        elements
            .childList
            .innerHTML =
                "";

    }



    /* ========================================================
       NO CHILDREN
    ======================================================== */

    if (
        elements.childList &&
        !childList.length
    ) {

        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "gg-offence-empty";


        empty.textContent =

            isSourceMode
                ? "No related offence target areas found."
                :
            isTargetMode
                ? "No related offence source areas found."
                :
            "No related offence areas found.";


        elements
            .childList
            .appendChild(
                empty
            );

    }



    /* ========================================================
       POPULATE ALL RELATIONSHIP CHILDREN

       IMPORTANT ARCHITECTURE:

                   RELATIONSHIPS
                        │
                        ▼
                 ALL CHILDREN
                        │
              ┌─────────┴─────────┐
              │                   │
              ▼                   ▼
            PANEL               GIS
              │                   │
          SHOW ALL          GIS AVAILABLE?
          CHILDREN            │       │
                              YES      NO
                               │        │
                             render    nothing
                             polygon
                               │
                         interactive:false


       Therefore NO GIS filtering occurs here.
    ======================================================== */

    if (
        elements.childList &&
        childList.length
    ) {

        childList.forEach(

            function (
                child,
                index
            ) {


                if (
                    !child
                ) {

                    return;

                }



                /* =================================================
                   CHILD NAME
                ================================================= */

                const childName =

                    child.name ||

                    child.cleanName ||

                    child.label ||

                    child.title ||

                    child.id ||

                    child.key ||

                    `Area ${index + 1}`;



                /* =================================================
                   CHILD CASE COUNT

                   Prefer relationship-specific offence count.

                   This is important because:

                       Bairiguri
                           ↓
                       WestDamanpur = 13

                   while WestDamanpur itself may have a much
                   larger total offence count across all sources.
                ================================================= */

                const childCount =

                    Number(

                        child.relation
                            ?.offenceCount ??

                        child.offenceCount ??

                        child.caseCount ??

                        child.count ??

                        0

                    );



                /* =================================================
                   CREATE CLICKABLE CHILD CARD
                ================================================= */

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "gg-offence-child-item";



                /* =================================================
                   CHILD DATA
                ================================================= */

                button.dataset.index =
                    String(
                        index
                    );


                button.dataset.child =

                    child.key ||

                    child.canonicalId ||

                    child.id ||

                    child.cleanName ||

                    child.name ||

                    "";



                /* =================================================
                   CHILD MAIN CONTAINER
                ================================================= */

                const childMain =
                    document.createElement(
                        "div"
                    );


                childMain.className =
                    "gg-offence-child-main";



                /* =================================================
                   CHILD NAME
                ================================================= */

                const childNameElement =
                    document.createElement(
                        "div"
                    );


                childNameElement.className =
                    "gg-offence-child-name";


                childNameElement.textContent =
                    childName;



                /* =================================================
                   CHILD TYPE

                   SOURCE → TARGET
                       Range

                   TARGET → SOURCE
                       Village
                ================================================= */

                const childTypeElement =
                    document.createElement(
                        "div"
                    );


                childTypeElement.className =
                    "gg-offence-child-type";


                childTypeElement.textContent =
                    childType;



                childMain.appendChild(
                    childNameElement
                );


                childMain.appendChild(
                    childTypeElement
                );


                button.appendChild(
                    childMain
                );



                /* =================================================
                   CHILD CASE COUNT
                ================================================= */

                const countElement =
                    document.createElement(
                        "div"
                    );


                countElement.className =
                    "gg-offence-child-count";


                countElement.textContent =

                    `${childCount} case${
                        childCount === 1
                            ? ""
                            : "s"
                    }`;


                button.appendChild(
                    countElement
                );



                /* =================================================
                   CHILD CLICK

                   IMPORTANT:

                   CHILD selection occurs ONLY through panel.

                   Do NOT perform another independent case lookup.

                   Use the existing SpatialRenderer functions:

                   SOURCE MODE
                       selectTargetForSource()

                   TARGET MODE
                       selectSourceForTarget()

                   Those functions already resolve the authoritative
                   Source ↔ Target case relationship.
                ================================================= */

                button.onclick =
                    function (
                        event
                    ) {


                        event
                            ?.preventDefault?.();


                        event
                            ?.stopPropagation?.();



                        /* =========================================
                           VALIDATE RENDERER
                        ========================================= */

                        if (
                            !SpatialRenderer
                        ) {

                            console.error(
                                "❌ SpatialRenderer unavailable for child selection"
                            );

                            return;

                        }



                        /* =========================================
                           STORE CURRENT CHILD

                           DO NOT CHANGE:

                               currentParent
                               currentChildren

                           They must remain preserved.
                        ========================================= */

                        UIController.currentChild =
                            child;


                        UIController.currentCase =
                            null;


                        UIController.currentField =
                            null;



                        /* =========================================
                           CLEAR PREVIOUS CHILD VISUAL SELECTION
                        ========================================= */

                        if (
                            elements.childList
                        ) {

                            elements
                                .childList
                                .querySelectorAll(
                                    ".gg-offence-child-item"
                                )
                                .forEach(

                                    function (
                                        item
                                    ) {

                                        item
                                            .classList
                                            .remove(
                                                "gg-offence-child-selected"
                                            );

                                    }

                                );

                        }



                        /* =========================================
                           SELECT CURRENT CHILD CARD
                        ========================================= */

                        button
                            .classList
                            .add(
                                "gg-offence-child-selected"
                            );



                        /* =========================================
                           SOURCE → TARGET

                           Parent:
                               Offence Source Area
                               Village

                           Child:
                               Offence Target Area
                               Range
                        ========================================= */

                        if (
                            mode ===
                            "source"
                        ) {

                            if (
                                typeof
                                SpatialRenderer
                                    .selectTargetForSource ===
                                "function"
                            ) {

                                const cases =

                                    SpatialRenderer
                                        .selectTargetForSource(
                                            child
                                        );


                                console.log(

                                    "🎯 Panel Offence Target Area selected:",

                                    childName,

                                    "→",

                                    Array.isArray(
                                        cases
                                    )
                                        ? cases.length
                                        : 0,

                                    "cases"

                                );


                                return;

                            }


                            console.error(
                                "❌ SpatialRenderer.selectTargetForSource() unavailable"
                            );


                            return;

                        }



                        /* =========================================
                           TARGET → SOURCE

                           Parent:
                               Offence Target Area
                               Range

                           Child:
                               Offence Source Area
                               Village
                        ========================================= */

                        if (
                            mode ===
                            "target"
                        ) {

                            if (
                                typeof
                                SpatialRenderer
                                    .selectSourceForTarget ===
                                "function"
                            ) {

                                const cases =

                                    SpatialRenderer
                                        .selectSourceForTarget(
                                            child
                                        );


                                console.log(

                                    "🏡 Panel Offence Source Area selected:",

                                    childName,

                                    "→",

                                    Array.isArray(
                                        cases
                                    )
                                        ? cases.length
                                        : 0,

                                    "cases"

                                );


                                return;

                            }


                            console.error(
                                "❌ SpatialRenderer.selectSourceForTarget() unavailable"
                            );


                            return;

                        }



                        /* =========================================
                           FALLBACK

                           Protect against UI / Renderer mode
                           synchronization differences.
                        ========================================= */

                        const rendererMode =

                            String(
                                SpatialRenderer.mode ||
                                ""
                            )
                                .trim()
                                .toUpperCase();



                        if (
                            rendererMode ===
                            "SOURCE" &&
                            typeof
                            SpatialRenderer
                                .selectTargetForSource ===
                            "function"
                        ) {

                            SpatialRenderer
                                .selectTargetForSource(
                                    child
                                );


                            return;

                        }



                        if (
                            rendererMode ===
                            "TARGET" &&
                            typeof
                            SpatialRenderer
                                .selectSourceForTarget ===
                            "function"
                        ) {

                            SpatialRenderer
                                .selectSourceForTarget(
                                    child
                                );


                            return;

                        }



                        console.warn(

                            "⚠ Unable to determine child selection mode",

                            {

                                panelMode:
                                    mode,

                                rendererMode:
                                    SpatialRenderer.mode,

                                parent:
                                    UIController.currentParent,

                                child:
                                    child

                            }

                        );

                    };



                /* =================================================
                   APPEND CHILD CARD
                ================================================= */

                elements
                    .childList
                    .appendChild(
                        button
                    );


            }

        );

    }



    /* ========================================================
       RESET CASE SECTION

       A NEW GIS PARENT has just been selected.

       Therefore previous child cases must disappear.

       Cases will be populated when one of the new child cards
       is clicked.
    ======================================================== */

    if (
        elements.caseSection
    ) {

        elements
            .caseSection
            .style
            .display =
                "none";

    }


    if (
        elements.caseResults
    ) {

        elements
            .caseResults
            .style
            .display =
                "none";

    }


    if (
        elements.caseCount
    ) {

        elements
            .caseCount
            .textContent =
                "";

    }


    if (
        elements.caseResultList
    ) {

        elements
            .caseResultList
            .innerHTML =
                `
                <div class="gg-offence-empty">
                    Select a related offence area
                    to view matching offence cases.
                </div>
                `;

    }


    if (
        elements.backToChildren
    ) {

        elements
            .backToChildren
            .style
            .display =
                "none";

    }



    /* ========================================================
       RESET CASE DETAILS

       New parent invalidates previously selected case.
    ======================================================== */

    if (
        elements.caseDetailsSection
    ) {

        elements
            .caseDetailsSection
            .style
            .display =
                "none";

    }


    if (
        elements.caseDetails
    ) {

        elements
            .caseDetails
            .innerHTML =
                `
                <div class="gg-offence-empty">
                    Select a case to view details.
                </div>
                `;

    }


    if (
        elements.backToCases
    ) {

        elements
            .backToCases
            .style
            .display =
                "none";

    }



    /* ========================================================
       RESET FIELD DETAILS

       New parent invalidates previously selected field.
    ======================================================== */

    if (
        elements.fieldDetailsSection
    ) {

        elements
            .fieldDetailsSection
            .style
            .display =
                "none";

    }


    if (
        elements.fieldDetails
    ) {

        elements
            .fieldDetails
            .innerHTML =
                `
                <div class="gg-offence-empty">
                    Select a field from Case Details
                    to view complete information.
                </div>
                `;

    }


    if (
        elements.backToCaseDetails
    ) {

        elements
            .backToCaseDetails
            .style
            .display =
                "none";

    }



    /* ========================================================
       STATUS

       SOURCE → TARGET

           Bairiguri selected.
           Choose an offence target area.


       TARGET → SOURCE

           WestDamanpur selected.
           Choose an offence source area.
    ======================================================== */

    if (
        typeof
        UIController.setStatus ===
        "function"
    ) {

        const instruction =

            isSourceMode
                ? `${parentName} selected. Choose an offence target area.`
                :
            isTargetMode
                ? `${parentName} selected. Choose an offence source area.`
                :
            `${parentName} selected. Choose a related offence area.`;


        UIController.setStatus(

            instruction,

            "success"

        );

    }



    /* ========================================================
       DEBUG
    ======================================================== */

    console.log(

        "📍 Offence parent selected",

        {

            mode:
                mode,

            parentHeading:
                parentHeading,

            parent:
                parent,

            parentName:
                parentName,

            parentType:
                parentType,

            parentCaseCount:
                parentCount,

            childHeading:
                childHeading,

            childType:
                childType,

            childCount:
                childList.length,

            childCaseTotal:

                childList.reduce(

                    function (
                        total,
                        child
                    ) {

                        return (

                            total +

                            Number(

                                child
                                    ?.relation
                                    ?.offenceCount ??

                                child
                                    ?.offenceCount ??

                                child
                                    ?.caseCount ??

                                child
                                    ?.count ??

                                0

                            )

                        );

                    },

                    0

                ),

            children:
                childList

        }

    );



    /* ========================================================
       RETURN ALL RELATIONSHIP CHILDREN
    ======================================================== */

    return childList;


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


/* ============================================================
   SHOW SPATIAL CASE RESULTS

   Called by:

       Renderer.showCases()

============================================================ */

/* ===========================================================
   SHOW SPATIAL CASES

   Responsibilities

   ✓ Store current cases
   ✓ Store current context
   ✓ Expand CASE RESULTS
   ✓ Update toggle arrow
   ✓ Show results container
   ✓ Clear previous case selection
   ✓ Render case cards
   ✓ Scroll results to top
=========================================================== */



/* ===========================================================
   SELECT CASE

   Responsibilities

   ✓ Validate
   ✓ Store current case
   ✓ Highlight selected card
   ✓ Show case details
=========================================================== */
/* ===========================================================
   HIGHLIGHT SELECTED CASE

   NEW PANEL DESIGN
   -----------------------------------------------------------

   Responsibilities

   ✓ Remove highlight from previous case
   ✓ Highlight only the currently selected case card
   ✓ Keep parent unchanged
   ✓ Keep child unchanged
   ✓ Keep case list unchanged
   ✓ No GIS operation
   ✓ No SpatialRenderer operation
   ✓ No map interaction

=========================================================== */

highlightSelectedCase:
function (
    card
) {

    /* ============================================
       GET CASE RESULTS CONTAINER

       Prefer the CASE list itself so we do not
       accidentally affect unrelated UI elements.
    ============================================ */

    const caseResultList =
        UIController.elements
            ?.caseResultList;


    /* ============================================
       REMOVE PREVIOUS CASE HIGHLIGHT
    ============================================ */

    if (
        caseResultList
    ) {

        caseResultList
            .querySelectorAll(
                ".gg-offence-case-card"
            )
            .forEach(

                function (
                    caseCard
                ) {

                    caseCard
                        .classList
                        .remove(
                            "gg-selected-case"
                        );


                    caseCard
                        .setAttribute(
                            "aria-selected",
                            "false"
                        );

                }

            );

    }

    else {

        /*
         * Safe fallback if element references have
         * not yet been captured.
         */

        document
            .querySelectorAll(
                ".gg-offence-case-card"
            )
            .forEach(

                function (
                    caseCard
                ) {

                    caseCard
                        .classList
                        .remove(
                            "gg-selected-case"
                        );


                    caseCard
                        .setAttribute(
                            "aria-selected",
                            "false"
                        );

                }

            );

    }


    /* ============================================
       NO CARD PROVIDED

       This is valid when we only want to remove
       the previous visual selection.
    ============================================ */

    if (
        !card
    ) {

        return true;

    }


    /* ============================================
       VALIDATE CARD
    ============================================ */

    if (
        !card.classList
    ) {

        console.warn(
            "⚠ highlightSelectedCase(): invalid case card",
            card
        );

        return false;

    }


    /* ============================================
       HIGHLIGHT CURRENT CASE
    ============================================ */

    card
        .classList
        .add(
            "gg-selected-case"
        );


    card
        .setAttribute(
            "aria-selected",
            "true"
        );


    return true;

},


showFieldDetails:
function (
    title,
    value,
    context = {}
) {


    /* =======================================================
       REFRESH DOM REFERENCES
    ======================================================= */

    if (
        typeof
        UIController.captureElements ===
        "function"
    ) {

        UIController.captureElements();

    }


    const elements =
        UIController.elements ||
        {};


    const container =
        elements.fieldDetails;


    const section =
        elements.fieldDetailsSection;


    if (
        !container
    ) {

        console.error(
            "❌ showFieldDetails(): Field Details container unavailable"
        );

        return false;

    }



    /* =======================================================
       VALUE CHECK

       Empty / meaningless values are never displayed.
    ======================================================= */

    function hasValue(
        item
    ) {


        if (
            item === null ||
            item === undefined
        ) {

            return false;

        }


        if (
            typeof item ===
            "string"
        ) {

            const text =
                item.trim();


            if (
                !text
            ) {

                return false;

            }


            const normalized =
                text.toLowerCase();


            if (

                normalized ===
                    "null" ||

                normalized ===
                    "undefined" ||

                normalized ===
                    "n/a" ||

                normalized ===
                    "na" ||

                normalized ===
                    "none" ||

                normalized ===
                    "nil" ||

                normalized ===
                    "not available" ||

                normalized ===
                    "not applicable" ||

                text ===
                    "-" ||

                text ===
                    "--"

            ) {

                return false;

            }


            return true;

        }


        if (
            Array.isArray(
                item
            )
        ) {

            return item.some(
                hasValue
            );

        }


        if (
            typeof item ===
            "object"
        ) {

            return Object
                .values(
                    item
                )
                .some(
                    hasValue
                );

        }


        return true;


    }



    /* =======================================================
       ESCAPE HTML
    ======================================================= */

    function escapeHTML(
        item
    ) {


        return String(
            item ?? ""
        )

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );


    }



    /* =======================================================
       NORMALIZE KEY

       Used only for matching equivalent database field names.

       Examples:

           father_name
           fatherName
           Father Name

       all become:

           FATHERNAME
    ======================================================= */

    function normalizeKey(
        key
    ) {


        return String(
            key ||
            ""
        )

            .trim()

            .toUpperCase()

            .replace(
                /[^A-Z0-9]/g,
                ""
            );


    }



    /* =======================================================
       HUMANIZE GENERIC FIELD NAME
    ======================================================= */

    function humanize(
        key
    ) {


        return String(
            key ||
            ""
        )

            .replace(
                /_/g,
                " "
            )

            .replace(
                /([a-z])([A-Z])/g,
                "$1 $2"
            )

            .replace(
                /\s+/g,
                " "
            )

            .trim()

            .replace(

                /\b\w/g,

                function (
                    character
                ) {

                    return character
                        .toUpperCase();

                }

            );


    }



    /* =======================================================
       GET FIRST MATCHING OBJECT VALUE

       This provides compatibility with different field naming
       styles in your offence dataset.

       Example:

           accusedName
           Accused Name
           accused_name
           name

       can all resolve to ACCUSED NAME.
    ======================================================= */

    function getFirstValue(
        object,
        aliases
    ) {


        if (

            !object ||

            typeof object !==
                "object"

        ) {

            return null;

        }


        const entries =
            Object.entries(
                object
            );


        for (
            const alias
            of aliases
        ) {


            const wanted =
                normalizeKey(
                    alias
                );


            for (
                const [
                    key,
                    item
                ]
                of entries
            ) {


                if (
                    normalizeKey(
                        key
                    ) ===
                    wanted
                ) {


                    if (
                        hasValue(
                            item
                        )
                    ) {

                        return item;

                    }


                }


            }


        }


        return null;


    }



    /* =======================================================
       FORMAT SIMPLE VALUE
    ======================================================= */

    function formatSimpleValue(
        item
    ) {


        if (
            !hasValue(
                item
            )
        ) {

            return "";

        }


        if (
            Array.isArray(
                item
            )
        ) {


            return item

                .filter(
                    hasValue
                )

                .filter(

                    function (
                        entry
                    ) {

                        return (

                            entry === null ||

                            typeof entry !==
                                "object"

                        );

                    }

                )

                .join(
                    ", "
                );


        }


        if (
            typeof item ===
            "object"
        ) {

            return "";

        }


        return String(
            item
        ).trim();


    }



    /* =======================================================
       PROFESSIONAL INFORMATION ROW
    ======================================================= */

    function row(
        label,
        item
    ) {


        if (
            !hasValue(
                item
            )
        ) {

            return "";

        }


        const formatted =
            formatSimpleValue(
                item
            );


        if (
            !hasValue(
                formatted
            )
        ) {

            return "";

        }


        return `
            <div class="gg-offence-field-info-row">

                <div class="gg-offence-field-info-label">

                    ${escapeHTML(
                        label
                    )}

                </div>

                <div class="gg-offence-field-info-value">

                    ${escapeHTML(
                        formatted
                    )}

                </div>

            </div>
        `;


    }



    /* =======================================================
       DETERMINE FIELD CATEGORY

       We use both:

           context.key
           title

       because Case Details may call this using either one.
    ======================================================= */

    const categoryText =
        normalizeKey(

            context.key ||

            title ||

            ""

        );


    const isAccusedCategory =

        categoryText ===
            "ACCUSED" ||

        categoryText ===
            "ACCUSEDS" ||

        categoryText ===
            "ACCUSEDDETAIL" ||

        categoryText ===
            "ACCUSEDDETAILS";


    const isWitnessCategory =

        categoryText ===
            "WITNESS" ||

        categoryText ===
            "WITNESSES" ||

        categoryText ===
            "WITNESSDETAIL" ||

        categoryText ===
            "WITNESSDETAILS";



    /* =======================================================
       ACCUSED STRICT PROFESSIONAL RENDERER

       DISPLAY ONLY:

           1. Sl No.
           2. Accused Name
           3. Age
           4. Father Name
           5. Address

       NOTHING ELSE FROM THE ACCUSED OBJECT IS DISPLAYED.
    ======================================================= */

    function renderAccused(
        accused,
        index
    ) {


        if (

            !accused ||

            typeof accused !==
                "object" ||

            Array.isArray(
                accused
            )

        ) {

            return "";

        }



        /* ---------------------------------------------------
           SL NO.

           Prefer stored serial number.

           If absent, use array position + 1.
        --------------------------------------------------- */

        const storedSlNo =
            getFirstValue(

                accused,

                [
                    "slNo",
                    "sl_no",
                    "sl no",
                    "serialNo",
                    "serial_no",
                    "serial number",
                    "serialNumber",
                    "srNo",
                    "sr_no",
                    "sr no"
                ]

            );


        const slNo =

            hasValue(
                storedSlNo
            )

                ? storedSlNo

                : index + 1;



        /* ---------------------------------------------------
           ACCUSED NAME
        --------------------------------------------------- */

        const accusedName =
            getFirstValue(

                accused,

                [
                    "accusedName",
                    "accused_name",
                    "accused name",
                    "name",
                    "fullName",
                    "full_name",
                    "full name"
                ]

            );



        /* ---------------------------------------------------
           AGE
        --------------------------------------------------- */

        const age =
            getFirstValue(

                accused,

                [
                    "age",
                    "accusedAge",
                    "accused_age",
                    "accused age"
                ]

            );



        /* ---------------------------------------------------
           FATHER NAME
        --------------------------------------------------- */

        const fatherName =
            getFirstValue(

                accused,

                [
                    "fatherName",
                    "father_name",
                    "father name",
                    "fathersName",
                    "fathers_name",
                    "father's name",
                    "father",
                    "s/o",
                    "sonOf",
                    "son_of"
                ]

            );



        /* ---------------------------------------------------
           ADDRESS
        --------------------------------------------------- */

        const address =
            getFirstValue(

                accused,

                [
                    "address",
                    "accusedAddress",
                    "accused_address",
                    "accused address",
                    "fullAddress",
                    "full_address",
                    "full address",
                    "residentialAddress",
                    "residential_address",
                    "residential address"
                ]

            );



        /* ---------------------------------------------------
           BUILD ONLY APPROVED FIELDS
        --------------------------------------------------- */

        let output =
            "";


        output +=
            row(
                "Sl No.",
                slNo
            );


        output +=
            row(
                "Accused Name",
                accusedName
            );


        output +=
            row(
                "Age",
                age
            );


        output +=
            row(
                "Father Name",
                fatherName
            );


        output +=
            row(
                "Address",
                address
            );


        return output;


    }



    /* =======================================================
       WITNESS STRICT PROFESSIONAL RENDERER

       DISPLAY ONLY:

           1. Sl No.
           2. Witness Name
           3. Age
           4. Father Name
           5. Address

       NOTHING ELSE FROM THE WITNESS OBJECT IS DISPLAYED.
    ======================================================= */

    function renderWitness(
        witness,
        index
    ) {


        if (

            !witness ||

            typeof witness !==
                "object" ||

            Array.isArray(
                witness
            )

        ) {

            return "";

        }



        /* ---------------------------------------------------
           SL NO.
        --------------------------------------------------- */

        const storedSlNo =
            getFirstValue(

                witness,

                [
                    "slNo",
                    "sl_no",
                    "sl no",
                    "serialNo",
                    "serial_no",
                    "serial number",
                    "serialNumber",
                    "srNo",
                    "sr_no",
                    "sr no"
                ]

            );


        const slNo =

            hasValue(
                storedSlNo
            )

                ? storedSlNo

                : index + 1;



        /* ---------------------------------------------------
           WITNESS NAME
        --------------------------------------------------- */

        const witnessName =
            getFirstValue(

                witness,

                [
                    "witnessName",
                    "witness_name",
                    "witness name",
                    "name",
                    "fullName",
                    "full_name",
                    "full name"
                ]

            );



        /* ---------------------------------------------------
           AGE
        --------------------------------------------------- */

        const age =
            getFirstValue(

                witness,

                [
                    "age",
                    "witnessAge",
                    "witness_age",
                    "witness age"
                ]

            );



        /* ---------------------------------------------------
           FATHER NAME
        --------------------------------------------------- */

        const fatherName =
            getFirstValue(

                witness,

                [
                    "fatherName",
                    "father_name",
                    "father name",
                    "fathersName",
                    "fathers_name",
                    "father's name",
                    "father",
                    "s/o",
                    "sonOf",
                    "son_of"
                ]

            );



        /* ---------------------------------------------------
           ADDRESS
        --------------------------------------------------- */

        const address =
            getFirstValue(

                witness,

                [
                    "address",
                    "witnessAddress",
                    "witness_address",
                    "witness address",
                    "fullAddress",
                    "full_address",
                    "full address",
                    "residentialAddress",
                    "residential_address",
                    "residential address"
                ]

            );



        /* ---------------------------------------------------
           BUILD ONLY APPROVED FIELDS
        --------------------------------------------------- */

        let output =
            "";


        output +=
            row(
                "Sl No.",
                slNo
            );


        output +=
            row(
                "Witness Name",
                witnessName
            );


        output +=
            row(
                "Age",
                age
            );


        output +=
            row(
                "Father Name",
                fatherName
            );


        output +=
            row(
                "Address",
                address
            );


        return output;


    }



    /* =======================================================
       GENERIC INTERNAL / TECHNICAL FIELDS

       Used for NON-ACCUSED and NON-WITNESS categories such as:

           Seizure
           Seized Articles

       Accused/Witness DO NOT use this generic renderer.
    ======================================================= */

    const hiddenKeys =
        new Set([

            "id",

            "caseId",

            "porKey",

            "documentId",

            "importSource",

            "importVersion",

            "importedAt",

            "createdAt",

            "updatedAt",

            "timestamp",

            "gisResolved",

            "rangeGISResolved",

            "canonicalId",

            "cleanName",

            "searchTokens",

            "relation",

            "key"

        ]);



    function isHiddenKey(
        key
    ) {


        const normalized =
            normalizeKey(
                key
            );


        for (
            const hiddenKey
            of hiddenKeys
        ) {


            if (
                normalizeKey(
                    hiddenKey
                ) ===
                normalized
            ) {

                return true;

            }


        }


        return false;


    }



    /* =======================================================
       GENERIC OBJECT RENDERER

       IMPORTANT:

       Used only for OTHER field categories.

       ACCUSED and WITNESSES bypass this completely.
    ======================================================= */

    function renderObject(
        object
    ) {


        if (

            !object ||

            typeof object !==
                "object" ||

            Array.isArray(
                object
            )

        ) {

            return "";

        }


        let output =
            "";


        Object
            .entries(
                object
            )
            .forEach(

                function (
                    [
                        key,
                        item
                    ]
                ) {


                    /* -------------------------------------------
                       INTERNAL FIELD
                    ------------------------------------------- */

                    if (
                        isHiddenKey(
                            key
                        )
                    ) {

                        return;

                    }



                    /* -------------------------------------------
                       EMPTY FIELD
                    ------------------------------------------- */

                    if (
                        !hasValue(
                            item
                        )
                    ) {

                        return;

                    }



                    /* -------------------------------------------
                       SIMPLE VALUE
                    ------------------------------------------- */

                    if (
                        typeof item !==
                            "object"
                    ) {


                        output +=
                            row(

                                humanize(
                                    key
                                ),

                                item

                            );


                        return;

                    }



                    /* -------------------------------------------
                       SIMPLE ARRAY
                    ------------------------------------------- */

                    if (

                        Array.isArray(
                            item
                        ) &&

                        item.every(

                            function (
                                entry
                            ) {

                                return (

                                    entry === null ||

                                    typeof entry !==
                                        "object"

                                );

                            }

                        )

                    ) {


                        const text =
                            item

                                .filter(
                                    hasValue
                                )

                                .join(
                                    ", "
                                );


                        if (
                            hasValue(
                                text
                            )
                        ) {


                            output +=
                                row(

                                    humanize(
                                        key
                                    ),

                                    text

                                );


                        }


                        return;

                    }



                    /* -------------------------------------------
                       NESTED OBJECT
                    ------------------------------------------- */

                    if (

                        item &&

                        typeof item ===
                            "object" &&

                        !Array.isArray(
                            item
                        )

                    ) {


                        const nested =
                            renderObject(
                                item
                            );


                        if (
                            nested
                        ) {


                            output +=
                                `
                                    <div class="gg-offence-field-nested">

                                        <div class="gg-offence-field-nested-title">

                                            ${escapeHTML(
                                                humanize(
                                                    key
                                                )
                                            )}

                                        </div>

                                        ${nested}

                                    </div>
                                `;


                        }


                        return;

                    }



                    /* -------------------------------------------
                       ARRAY OF OBJECTS
                    ------------------------------------------- */

                    if (
                        Array.isArray(
                            item
                        )
                    ) {


                        const nestedObjects =
                            item.filter(
                                hasValue
                            );


                        nestedObjects.forEach(

                            function (
                                nestedItem,
                                nestedIndex
                            ) {


                                if (

                                    nestedItem &&

                                    typeof nestedItem ===
                                        "object"

                                ) {


                                    const nested =
                                        renderObject(
                                            nestedItem
                                        );


                                    if (
                                        nested
                                    ) {


                                        output +=
                                            `
                                                <div class="gg-offence-field-nested">

                                                    <div class="gg-offence-field-nested-title">

                                                        ${escapeHTML(
                                                            humanize(
                                                                key
                                                            )
                                                        )}

                                                        ${
                                                            nestedObjects.length > 1

                                                                ? ` ${nestedIndex + 1}`

                                                                : ""
                                                        }

                                                    </div>

                                                    ${nested}

                                                </div>
                                            `;


                                    }


                                }


                            }

                        );


                    }


                }

            );


        return output;


    }



    /* =======================================================
       BUILD FIELD DETAILS BODY
    ======================================================= */

    let body =
        "";



    /* =======================================================
       ACCUSED

       STRICT WHITELIST MODE.

       This branch intentionally runs BEFORE the generic
       array/object renderer.

       Therefore no unwanted accused properties can leak into
       the visible panel.
    ======================================================= */

    if (
        isAccusedCategory
    ) {


        const accusedList =

            Array.isArray(
                value
            )

                ? value.filter(
                    hasValue
                )

                : (

                    value &&
                    typeof value ===
                        "object"

                        ? [
                            value
                        ]

                        : []

                );


        accusedList.forEach(

            function (
                accused,
                index
            ) {


                const rendered =
                    renderAccused(
                        accused,
                        index
                    );


                if (
                    !rendered
                ) {

                    return;

                }


                body +=
                    `
                        <div class="gg-offence-field-group">

                            <div class="gg-offence-field-group-title">

                                ACCUSED ${index + 1}

                            </div>

                            ${rendered}

                        </div>
                    `;


            }

        );


    }



    /* =======================================================
       WITNESSES

       STRICT WHITELIST MODE.

       Exactly the same professional structure as ACCUSED.
    ======================================================= */

    else if (
        isWitnessCategory
    ) {


        const witnessList =

            Array.isArray(
                value
            )

                ? value.filter(
                    hasValue
                )

                : (

                    value &&
                    typeof value ===
                        "object"

                        ? [
                            value
                        ]

                        : []

                );


        witnessList.forEach(

            function (
                witness,
                index
            ) {


                const rendered =
                    renderWitness(
                        witness,
                        index
                    );


                if (
                    !rendered
                ) {

                    return;

                }


                body +=
                    `
                        <div class="gg-offence-field-group">

                            <div class="gg-offence-field-group-title">

                                WITNESS ${index + 1}

                            </div>

                            ${rendered}

                        </div>
                    `;


            }

        );


    }



    /* =======================================================
       OTHER ARRAY CATEGORIES

       Example:

           seizedArticles
    ======================================================= */

    else if (
        Array.isArray(
            value
        )
    ) {


        const meaningful =
            value.filter(
                hasValue
            );


        meaningful.forEach(

            function (
                item,
                index
            ) {


                if (

                    item &&

                    typeof item ===
                        "object"

                ) {


                    const rendered =
                        renderObject(
                            item
                        );


                    if (
                        rendered
                    ) {


                        body +=
                            `
                                <div class="gg-offence-field-group">

                                    ${
                                        meaningful.length > 1

                                            ? `
                                                <div class="gg-offence-field-group-title">

                                                    ${escapeHTML(
                                                        title ||
                                                        "DETAIL"
                                                    )}

                                                    ${index + 1}

                                                </div>
                                            `

                                            : ""
                                    }

                                    ${rendered}

                                </div>
                            `;


                    }


                    return;

                }



                if (
                    hasValue(
                        item
                    )
                ) {


                    body +=
                        `
                            <div class="gg-offence-field-text">

                                ${escapeHTML(
                                    item
                                )}

                            </div>
                        `;


                }


            }

        );


    }



    /* =======================================================
       OTHER OBJECT CATEGORIES

       Example:

           seizure
    ======================================================= */

    else if (

        value &&

        typeof value ===
            "object"

    ) {


        const rendered =
            renderObject(
                value
            );


        if (
            rendered
        ) {


            body =
                `
                    <div class="gg-offence-field-group">

                        ${rendered}

                    </div>
                `;


        }


    }



    /* =======================================================
       SIMPLE VALUE
    ======================================================= */

    else if (
        hasValue(
            value
        )
    ) {


        body =
            `
                <div class="gg-offence-field-text">

                    ${escapeHTML(
                        value
                    )}

                </div>
            `;


    }



    /* =======================================================
       EMPTY FALLBACK
    ======================================================= */

    if (
        !body.trim()
    ) {


        body =
            `
                <div class="gg-offence-empty">

                    No details available.

                </div>
            `;


    }



    /* =======================================================
       RENDER FIELD DETAILS
    ======================================================= */

    container.innerHTML =
        `
            <div class="gg-offence-field-selected-title">

                ${escapeHTML(
                    title ||
                    "DETAILS"
                )}

            </div>

            <div class="gg-offence-field-details-content">

                ${body}

            </div>
        `;



    /* =======================================================
       STORE CURRENT FIELD

       Parent / children / cases / current case remain intact.
    ======================================================= */

    UIController.currentField = {

        title:
            title,

        value:
            value,

        key:
            context.key ||
            null,

        caseData:
            context.caseData ||
            UIController.currentCase ||
            null

    };



    /* =======================================================
       SHOW FIELD DETAILS SECTION
    ======================================================= */

    if (
        section
    ) {


        section
            .style
            .display =
                "";


    }



    /* =======================================================
       STABLE INTERNAL PANEL SCROLL

       ONLY:

           .gg-offence-panel-body

       is allowed to move.

       Never use scrollIntoView().
    ======================================================= */

    const panelBody =

        elements.panel

            ?.querySelector(
                ".gg-offence-panel-body"
            )

        ||

        document.querySelector(
            "#gg-offence-analysis-panel .gg-offence-panel-body"
        );



    if (
        panelBody &&
        section
    ) {


        const bodyRect =
            panelBody
                .getBoundingClientRect();


        const sectionRect =
            section
                .getBoundingClientRect();


        const topOffset =
            8;


        const targetScrollTop =

            panelBody.scrollTop +

            (
                sectionRect.top -
                bodyRect.top
            ) -

            topOffset;


        const maxScrollTop =

            Math.max(

                0,

                panelBody.scrollHeight -
                panelBody.clientHeight

            );


        const safeScrollTop =

            Math.max(

                0,

                Math.min(

                    targetScrollTop,

                    maxScrollTop

                )

            );


        panelBody.scrollTop =
            safeScrollTop;


    }



    /* =======================================================
       DEBUG
    ======================================================= */

    console.log(

        "📄 Professional FIELD DETAILS rendered",

        {

            title:
                title ||
                "DETAILS",

            key:
                context.key ||
                null,

            category:

                isAccusedCategory

                    ? "ACCUSED"

                    : isWitnessCategory

                        ? "WITNESSES"

                        : "GENERAL",

            strictPersonFields:

                isAccusedCategory ||
                isWitnessCategory,

            panelScrollStable:
                Boolean(
                    panelBody
                )

        }

    );



    return true;


},
   /* ===========================================================
   SHOW CASE DETAILS

   NEW PANEL DESIGN
   -----------------------------------------------------------

   Navigation:

       PARENT
          ↓
       CHILD
          ↓
       CASES
          ↓
       CASE DETAILS
          ↓
       FIELD DETAILS

   Responsibilities

   ✓ Render selected offence case
   ✓ Preserve parent
   ✓ Preserve selected child
   ✓ Preserve case list
   ✓ Render available case fields
   ✓ Make populated fields clickable
   ✓ Delegate field expansion to selectField()
   ✓ Reset previous FIELD DETAILS
   ✓ No GIS operation
   ✓ No map interaction
   ✓ No SpatialRenderer operation

=========================================================== */

showCaseDetails:
function (
    caseData
) {


    /* =======================================================
       VALIDATE CASE
    ======================================================= */

    if (
        !caseData
    ) {

        console.warn(
            "⚠ showCaseDetails(): caseData unavailable"
        );

        return false;

    }



    /* =======================================================
       REFRESH DOM REFERENCES
    ======================================================= */

    if (
        typeof
        UIController.captureElements ===
        "function"
    ) {

        UIController.captureElements();

    }


    const elements =
        UIController.elements ||
        {};


    const container =
        elements.caseDetails;


    const section =
        elements.caseDetailsSection;


    if (
        !container
    ) {

        console.error(
            "❌ showCaseDetails(): case details container unavailable"
        );

        return false;

    }



    /* =======================================================
       PRESERVE CURRENT DRILL-DOWN STATE

       Parent      → preserved
       Children    → preserved
       Case list   → preserved

       Only selected case changes.
    ======================================================= */

    UIController.currentCase =
        caseData;


    UIController.currentField =
        null;



    /* =======================================================
       RESOLVE PRIMARY CASE RECORD
    ======================================================= */

    let record =
        caseData;


    if (

        caseData.case &&

        typeof caseData.case ===
            "object" &&

        !Array.isArray(
            caseData.case
        )

    ) {

        record =
            caseData.case;

    }

    else if (

        Array.isArray(
            caseData.cases
        ) &&

        caseData.cases.length > 0 &&

        caseData.cases[0] &&

        typeof caseData.cases[0] ===
            "object"

    ) {

        record =
            caseData.cases[0];

    }



    /* =======================================================
       HAS MEANINGFUL VALUE

       Missing values are completely omitted.

       NO:
           empty box
           empty heading
           N/A
           -
           undefined
           null
    ======================================================= */

    function hasValue(
        value
    ) {


        if (
            value === null ||
            value === undefined
        ) {

            return false;

        }


        if (
            typeof value ===
            "string"
        ) {

            const text =
                value.trim();


            if (
                !text
            ) {

                return false;

            }


            const normalized =
                text.toLowerCase();


            if (

                normalized ===
                    "null" ||

                normalized ===
                    "undefined" ||

                normalized ===
                    "n/a" ||

                normalized ===
                    "na" ||

                normalized ===
                    "none" ||

                normalized ===
                    "nil" ||

                normalized ===
                    "not available" ||

                normalized ===
                    "not applicable" ||

                text ===
                    "-" ||

                text ===
                    "--"

            ) {

                return false;

            }


            return true;

        }


        if (
            Array.isArray(
                value
            )
        ) {

            return value.some(
                hasValue
            );

        }


        if (
            typeof value ===
            "object"
        ) {

            return Object
                .values(
                    value
                )
                .some(
                    hasValue
                );

        }


        return true;


    }



    /* =======================================================
       FIRST AVAILABLE VALUE
    ======================================================= */

    function firstValue(
        ...values
    ) {


        for (
            const value
            of values
        ) {

            if (
                hasValue(
                    value
                )
            ) {

                return value;

            }

        }


        return "";

    }



    /* =======================================================
       HTML ESCAPE
    ======================================================= */

    function escapeHTML(
        value
    ) {


        return String(
            value ?? ""
        )

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );


    }



    /* =======================================================
       FORMAT SIMPLE VALUE

       IMPORTANT:
       Never dump raw JSON into CASE DETAILS.
    ======================================================= */

    function formatValue(
        value
    ) {


        if (
            !hasValue(
                value
            )
        ) {

            return "";

        }



        /* ---------------------------------------------------
           ARRAY
        --------------------------------------------------- */

        if (
            Array.isArray(
                value
            )
        ) {


            const values =
                value

                    .map(

                        function (
                            item
                        ) {


                            if (
                                !hasValue(
                                    item
                                )
                            ) {

                                return "";

                            }


                            if (

                                item &&

                                typeof item ===
                                    "object"

                            ) {

                                return firstValue(

                                    item.name,

                                    item.label,

                                    item.title,

                                    item.value,

                                    item.description

                                );

                            }


                            return item;


                        }

                    )

                    .filter(
                        hasValue
                    );


            return values
                .join(
                    ", "
                );

        }



        /* ---------------------------------------------------
           OBJECT
        --------------------------------------------------- */

        if (
            typeof value ===
                "object"
        ) {


            return firstValue(

                value.name,

                value.label,

                value.title,

                value.value,

                value.description

            );


        }



        /* ---------------------------------------------------
           SIMPLE VALUE
        --------------------------------------------------- */

        return String(
            value
        ).trim();


    }



    /* =======================================================
       DATE FORMATTER
    ======================================================= */

    function formatDate(
        value
    ) {


        if (
            !hasValue(
                value
            )
        ) {

            return "";

        }



        /* ---------------------------------------------------
           FIRESTORE TIMESTAMP
        --------------------------------------------------- */

        if (

            value &&

            typeof value ===
                "object"

        ) {


            if (
                typeof value.toDate ===
                    "function"
            ) {

                try {


                    const date =
                        value.toDate();


                    return date
                        .toLocaleDateString(

                            "en-IN",

                            {

                                day:
                                    "2-digit",

                                month:
                                    "short",

                                year:
                                    "numeric"

                            }

                        );


                }

                catch (
                    error
                ) {

                    // Continue.

                }

            }



            if (
                typeof value.seconds ===
                    "number"
            ) {

                try {


                    const date =
                        new Date(

                            value.seconds *
                            1000

                        );


                    return date
                        .toLocaleDateString(

                            "en-IN",

                            {

                                day:
                                    "2-digit",

                                month:
                                    "short",

                                year:
                                    "numeric"

                            }

                        );


                }

                catch (
                    error
                ) {

                    // Continue.

                }

            }


        }



        /* ---------------------------------------------------
           NORMAL DATE
        --------------------------------------------------- */

        try {


            const date =

                value instanceof Date

                    ? value

                    : new Date(
                        value
                    );


            if (
                !Number.isNaN(
                    date.getTime()
                )
            ) {


                return date
                    .toLocaleDateString(

                        "en-IN",

                        {

                            day:
                                "2-digit",

                            month:
                                "short",

                            year:
                                "numeric"

                        }

                    );


            }


        }

        catch (
            error
        ) {

            // Preserve original value.

        }


        return formatValue(
            value
        );


    }



    /* =======================================================
       CREATE ONE CASE FIELD BOX

       EVERY CASE FIELD IS ITS OWN BOX.

       Example:

       ┌─────────────────────────────┐
       │ OFFENCE DATE                │
       │ 25 Dec 2007                 │
       └─────────────────────────────┘

       Missing value = box omitted completely.
    ======================================================= */

    function createCaseItem(
        label,
        value,
        options = {}
    ) {


        if (
            !hasValue(
                value
            )
        ) {

            return "";

        }


        let formatted =
            value;


        if (
            options.date ===
                true
        ) {

            formatted =
                formatDate(
                    value
                );

        }

        else {

            formatted =
                formatValue(
                    value
                );

        }


        if (
            !hasValue(
                formatted
            )
        ) {

            return "";

        }


        return `
            <div class="gg-offence-case-item-box">

                <div class="gg-offence-case-item-label">

                    ${escapeHTML(
                        label
                    )}

                </div>

                <div class="gg-offence-case-item-value">

                    ${escapeHTML(
                        formatted
                    )}

                </div>

            </div>
        `;


    }



    /* =======================================================
       POR NUMBER
    ======================================================= */

    const porNo =

        firstValue(

            caseData.porNo,

            record.porNo,

            record.porNumber,

            record.PORNo,

            record["POR No"],

            record["POR No."],

            caseData.porKey

        );



    /* =======================================================
       OFFENCE DATE
    ======================================================= */

    const offenceDate =

        firstValue(

            record.offenceDate,

            record.dateOfOffence,

            record.offence_date,

            record["Offence Date"],

            record["Date of Offence"]

        );



    /* =======================================================
       NATURE OF OFFENCE
    ======================================================= */

    const natureOfOffence =

        firstValue(

            record.natureOfOffence,

            record.offenceNature,

            record.nature,

            record["Nature of Offence"],

            record.offenceType

        );



    /* =======================================================
       ACT
    ======================================================= */

    const act =

        firstValue(

            record.act,

            record.Act,

            record.actName,

            record["Act"]

        );



    /* =======================================================
       SECTION
    ======================================================= */

    const sectionValue =

        firstValue(

            record.section,

            record.Section,

            record.sections,

            record.sectionOfAct,

            record["Section"]

        );



    /* =======================================================
       ACT / SECTION
    ======================================================= */

    let actSection =
        "";


    if (

        hasValue(
            act
        ) &&

        hasValue(
            sectionValue
        )

    ) {


        const formattedSection =
            formatValue(
                sectionValue
            );


        actSection =

            `${formatValue(act)} · ` +

            (

                /^section\b/i.test(
                    formattedSection
                )

                    ? formattedSection

                    : `Section ${formattedSection}`

            );


    }

    else if (
        hasValue(
            act
        )
    ) {


        actSection =
            formatValue(
                act
            );


    }

    else if (
        hasValue(
            sectionValue
        )
    ) {


        const formattedSection =
            formatValue(
                sectionValue
            );


        actSection =

            /^section\b/i.test(
                formattedSection
            )

                ? formattedSection

                : `Section ${formattedSection}`;


    }



    /* =======================================================
       CASE STATUS
    ======================================================= */

    const caseStatus =

        firstValue(

            record.caseStatus,

            record.status,

            record.case_status,

            record["Case Status"]

        );



    /* =======================================================
       COURT
    ======================================================= */

    const court =

        firstValue(

            record.court,

            record.courtName,

            record.nameOfCourt,

            record["Court"],

            record["Name of Court"]

        );



    /* =======================================================
       CR NUMBER
    ======================================================= */

    const crNo =

        firstValue(

            record.crNo,

            record.CRNo,

            record.crNumber,

            record.crNoNumber,

            record["CR No"],

            record["CR No."],

            record["CR Number"]

        );



    /* =======================================================
       NEXT HEARING
    ======================================================= */

    const nextHearing =

        firstValue(

            record.nextHearingDate,

            record.nextHearing,

            record.hearingDate,

            record["Next Hearing Date"],

            record["Next Hearing"]

        );



    /* =======================================================
       PURPOSE OF HEARING
    ======================================================= */

    const hearingPurpose =

        firstValue(

            record.purposeOfHearing,

            record.hearingPurpose,

            record.purpose,

            record["Purpose of Hearing"]

        );



    /* =======================================================
       ENQUIRY OFFICER
    ======================================================= */

    const enquiryOfficer =

        firstValue(

            record.enquiryOfficer,

            record.enquiryOfficerName,

            record.inquiryOfficer,

            record.inquiryOfficerName,

            record.investigatingOfficer,

            record.ioName,

            record["Enquiry Officer"],

            record["Inquiry Officer"]

        );



    /* =======================================================
       ACCUSED
    ======================================================= */

    const accused =

        firstValue(

            caseData.accused,

            record.accused,

            record.accusedDetails,

            record.accusedPersons,

            record.accusedList

        );



    /* =======================================================
       WITNESSES
    ======================================================= */

    const witnesses =

        firstValue(

            caseData.witnesses,

            caseData.witness,

            record.witnesses,

            record.witness,

            record.witnessDetails,

            record.witnessList,

            record.witnessesForNextHearing,

            record.witnessesForEvidenceInNextHearingDate,

            record["Witnesses"],

            record["Witness"]

        );



    /* =======================================================
       SEIZURE DETAILS
    ======================================================= */

    const seizure =

        firstValue(

            caseData.seizure,

            caseData.seizureDetails,

            record.seizure,

            record.seizureDetails,

            record.seizureMemo,

            record.seizureInformation,

            record["Seizure Details"]

        );



    /* =======================================================
       SEIZED ARTICLES
    ======================================================= */

    const seizedArticles =

        firstValue(

            caseData.seizedArticles,

            caseData.articlesSeized,

            record.seizedArticles,

            record.articlesSeized,

            record.seizedArticle,

            record.seizedItems,

            record.articleSeized,

            record["Articles Seized"],

            record["Seized Articles"]

        );



    /* =======================================================
       BUILD ORDINARY CASE INFORMATION BOXES

       EACH FIELD = SEPARATE BOX
    ======================================================= */

    let summaryHTML =
        "";


    summaryHTML +=
        createCaseItem(

            "POR No.",

            porNo

        );


    summaryHTML +=
        createCaseItem(

            "Offence Date",

            offenceDate,

            {
                date:
                    true
            }

        );


    summaryHTML +=
        createCaseItem(

            "Nature of Offence",

            natureOfOffence

        );


    summaryHTML +=
        createCaseItem(

            "Act / Section",

            actSection

        );


    summaryHTML +=
        createCaseItem(

            "Case Status",

            caseStatus

        );


    summaryHTML +=
        createCaseItem(

            "Court",

            court

        );


    summaryHTML +=
        createCaseItem(

            "CR No.",

            crNo

        );


    summaryHTML +=
        createCaseItem(

            "Next Hearing",

            nextHearing,

            {
                date:
                    true
            }

        );


    summaryHTML +=
        createCaseItem(

            "Purpose of Hearing",

            hearingPurpose

        );


    summaryHTML +=
        createCaseItem(

            "Enquiry Officer",

            enquiryOfficer

        );



    /* =======================================================
       BUILD CLICKABLE DETAIL BOXES

       REQUIRED ORDER:

           ACCUSED
           WITNESSES
           SEIZURE DETAILS
           SEIZED ARTICLES

       Only show category when meaningful data exists.
    ======================================================= */

    const expandable =
        [];


    if (
        hasValue(
            accused
        )
    ) {


        expandable.push({

            key:
                "accused",

            label:
                "ACCUSED",

            value:
                accused

        });


    }


    if (
        hasValue(
            witnesses
        )
    ) {


        expandable.push({

            key:
                "witnesses",

            label:
                "WITNESSES",

            value:
                witnesses

        });


    }


    if (
        hasValue(
            seizure
        )
    ) {


        expandable.push({

            key:
                "seizure",

            label:
                "SEIZURE DETAILS",

            value:
                seizure

        });


    }


    if (
        hasValue(
            seizedArticles
        )
    ) {


        expandable.push({

            key:
                "seizedArticles",

            label:
                "SEIZED ARTICLES",

            value:
                seizedArticles

        });


    }



    /* =======================================================
       BUILD COMPLETE CASE DETAILS HTML
    ======================================================= */

    let html =
        "";



    /* -------------------------------------------------------
       CASE INFORMATION BOXES
    ------------------------------------------------------- */

    if (
        summaryHTML.trim()
    ) {


        html +=
            `
                <div class="gg-offence-case-items">

                    ${summaryHTML}

                </div>
            `;


    }



    /* -------------------------------------------------------
       CLICKABLE DETAIL BOXES

       These visually follow the ordinary case boxes.
    ------------------------------------------------------- */

    if (
        expandable.length
    ) {


        html +=
            `
                <div class="gg-offence-detail-actions">
            `;


        expandable.forEach(

            function (
                item
            ) {


                html +=
                    `
                        <button

                            type="button"

                            class="
                                gg-offence-detail-action
                                gg-offence-detail-action-box
                            "

                            data-offence-field="${escapeHTML(
                                item.key
                            )}">

                            <span
                                class="gg-offence-detail-action-label">

                                ${escapeHTML(
                                    item.label
                                )}

                            </span>

                            <span
                                class="gg-offence-detail-action-arrow"

                                aria-hidden="true">

                                ›

                            </span>

                        </button>
                    `;


            }

        );


        html +=
            `
                </div>
            `;


    }



    /* =======================================================
       EMPTY FALLBACK
    ======================================================= */

    if (
        !html.trim()
    ) {


        html =
            `
                <div class="gg-offence-empty">

                    No case details available.

                </div>
            `;


    }



    /* =======================================================
       RENDER CASE DETAILS
    ======================================================= */

    container.innerHTML =
        html;



    /* =======================================================
       SHOW CASE DETAILS SECTION
    ======================================================= */

    if (
        section
    ) {


        section
            .style
            .display =
                "";


    }



    /* =======================================================
       RESET PREVIOUS FIELD DETAILS

       New case selected:

           previous ACCUSED
           previous WITNESSES
           previous SEIZURE
           previous SEIZED ARTICLES

       must disappear.

       Parent / children / case list remain preserved.
    ======================================================= */

    if (
        elements.fieldDetailsSection
    ) {


        elements
            .fieldDetailsSection
            .style
            .display =
                "none";


    }


    if (
        elements.fieldDetails
    ) {


        elements
            .fieldDetails
            .innerHTML =
                "";


    }



    /* =======================================================
       BIND CLICKABLE DETAIL BOXES

       ACCUSED
           ↓
       FIELD DETAILS

       WITNESSES
           ↓
       FIELD DETAILS

       SEIZURE DETAILS
           ↓
       FIELD DETAILS

       SEIZED ARTICLES
           ↓
       FIELD DETAILS
    ======================================================= */

    container
        .querySelectorAll(
            "[data-offence-field]"
        )
        .forEach(

            function (
                button
            ) {


                button.onclick =
                    function (
                        event
                    ) {


                        event
                            ?.preventDefault?.();


                        event
                            ?.stopPropagation?.();


                        const key =
                            button
                                .dataset
                                .offenceField;


                        if (
                            !key
                        ) {

                            return;

                        }


                        const selected =
                            expandable.find(

                                function (
                                    item
                                ) {

                                    return (
                                        item.key ===
                                        key
                                    );

                                }

                            );


                        if (
                            !selected
                        ) {

                            return;

                        }



                        /* ---------------------------------------
                           STORE CURRENT FIELD
                        --------------------------------------- */

                        UIController.currentField =
                            selected;



                        /* ---------------------------------------
                           OPEN FIELD DETAILS
                        --------------------------------------- */

                        if (
                            typeof
                            UIController.showFieldDetails ===
                                "function"
                        ) {


                            UIController.showFieldDetails(

                                selected.label,

                                selected.value,

                                {

                                    key:
                                        selected.key,

                                    caseData:
                                        caseData,

                                    record:
                                        record

                                }

                            );


                        }

                        else {


                            console.error(

                                "❌ UIController.showFieldDetails() unavailable"

                            );


                        }


                    };


            }

        );



    /* =======================================================
       STABLE INTERNAL PANEL SCROLL

       ONLY .gg-offence-panel-body scrolls.

       Do NOT:
           scroll window
           scroll document
           move map
           use scrollIntoView()
    ======================================================= */

    const panelBody =

        elements.panel

            ?.querySelector(
                ".gg-offence-panel-body"
            )

        ||

        document.querySelector(
            "#gg-offence-analysis-panel .gg-offence-panel-body"
        );



    if (
        panelBody &&
        section
    ) {


        const bodyRect =
            panelBody
                .getBoundingClientRect();


        const sectionRect =
            section
                .getBoundingClientRect();


        const offset =
            8;


        const targetScrollTop =

            panelBody.scrollTop +

            (
                sectionRect.top -
                bodyRect.top
            ) -

            offset;


        const maxScrollTop =

            Math.max(

                0,

                panelBody.scrollHeight -
                panelBody.clientHeight

            );


        const safeScrollTop =

            Math.max(

                0,

                Math.min(

                    targetScrollTop,

                    maxScrollTop

                )

            );


        panelBody.scrollTop =
            safeScrollTop;


    }



    /* =======================================================
       DEBUG
    ======================================================= */

    console.log(

        "📋 CASE DETAILS rendered",

        {

            porNo:
                porNo ||
                null,

            offenceDate:
                offenceDate ||
                null,

            natureOfOffence:
                natureOfOffence ||
                null,

            caseStatus:
                caseStatus ||
                null,

            expandableSections:

                expandable.map(

                    function (
                        item
                    ) {

                        return item.label;

                    }

                ),

            separateCaseBoxes:
                true,

            accusedAvailable:
                hasValue(
                    accused
                ),

            witnessesAvailable:
                hasValue(
                    witnesses
                ),

            seizureAvailable:
                hasValue(
                    seizure
                ),

            seizedArticlesAvailable:
                hasValue(
                    seizedArticles
                ),

            panelScrollStable:
                Boolean(
                    panelBody
                )

        }

    );



    return true;


},

   /* ===========================================================
   SELECT FIELD

   NEW PANEL DESIGN
   -----------------------------------------------------------

   Navigation:

       PARENT
          ↓
       CHILD
          ↓
       CASES
          ↓
       CASE DETAILS
          ↓
       FIELD DETAILS

   Responsibilities

   ✓ Store selected field
   ✓ Preserve selected parent
   ✓ Preserve selected child
   ✓ Preserve current case list
   ✓ Preserve selected case
   ✓ Preserve CASE DETAILS
   ✓ Highlight selected field row
   ✓ Populate FIELD DETAILS
   ✓ Show FIELD DETAILS section
   ✓ Update navigation state
   ✓ No GIS operation
   ✓ No map interaction
   ✓ No SpatialRenderer operation

=========================================================== */

selectField:
function (
    key,
    value,
    caseData = null,
    row = null
) {

    /* ============================================
       VALIDATE FIELD KEY
    ============================================ */

    if (
        key === null ||
        key === undefined ||
        String(key).trim() ===
            ""
    ) {

        console.warn(
            "⚠ selectField(): invalid field key",
            key
        );

        return false;

    }


    /* ============================================
       USE CURRENT CASE IF CASE WAS NOT PASSED
    ============================================ */

    const selectedCase =
        caseData ||
        UIController.currentCase ||
        null;


    if (
        !selectedCase
    ) {

        console.warn(
            "⚠ selectField(): no current case available"
        );

        return false;

    }


    /* ============================================
       STORE FIELD STATE

       IMPORTANT:

       Nothing above FIELD DETAILS is reset.

       We deliberately preserve:

           current parent
           current child
           current children
           currentSpatialCases
           currentSpatialContext
           currentCase
    ============================================ */

    UIController.currentField =
        {
            key:
                key,

            value:
                value,

            caseData:
                selectedCase
        };


    UIController.currentFieldKey =
        key;


    UIController.currentFieldValue =
        value;


    /* ============================================
       REMOVE PREVIOUS FIELD HIGHLIGHT
    ============================================ */

    const caseDetails =
        UIController.elements
            ?.caseDetails;


    if (
        caseDetails
    ) {

        caseDetails
            .querySelectorAll(
                ".gg-case-details-row"
            )
            .forEach(

                function (
                    fieldRow
                ) {

                    fieldRow
                        .classList
                        .remove(
                            "gg-selected-field"
                        );


                    fieldRow
                        .setAttribute(
                            "aria-selected",
                            "false"
                        );

                }

            );

    }


    /* ============================================
       HIGHLIGHT CURRENT FIELD
    ============================================ */

    if (
        row &&
        row.classList
    ) {

        row
            .classList
            .add(
                "gg-selected-field"
            );


        row
            .setAttribute(
                "aria-selected",
                "true"
            );

    }


    /* ============================================
       GET FIELD DETAILS CONTAINER
    ============================================ */

    const fieldDetails =
        UIController.elements
            ?.fieldDetails;


    if (
        !fieldDetails
    ) {

        console.warn(
            "⚠ FIELD DETAILS container unavailable"
        );

        return false;

    }


    /* ============================================
       FORMAT FIELD LABEL
    ============================================ */

    function formatFieldLabel(
        fieldKey
    ) {

        return String(
            fieldKey ||
            "Field"
        )

            .replace(
                /_/g,
                " "
            )

            .replace(
                /([a-z])([A-Z])/g,
                "$1 $2"
            )

            .replace(
                /\s+/g,
                " "
            )

            .trim()

            .replace(
                /\b\w/g,

                function (
                    character
                ) {

                    return character
                        .toUpperCase();

                }

            );

    }


    /* ============================================
       CREATE SAFE VALUE RENDERER

       We use textContent rather than injecting
       offence data through innerHTML.

       This safely handles arbitrary text from
       the offence dataset.
    ============================================ */

    function createValueElement(
        fieldValue
    ) {

        const valueContainer =
            document
                .createElement(
                    "div"
                );


        valueContainer.className =
            "gg-field-details-value";


        /* ----------------------------------------
           NULL / UNDEFINED
        ---------------------------------------- */

        if (
            fieldValue === null ||
            fieldValue === undefined
        ) {

            valueContainer.textContent =
                "No value available.";

            return valueContainer;

        }


        /* ----------------------------------------
           ARRAY
        ---------------------------------------- */

        if (
            Array.isArray(
                fieldValue
            )
        ) {

            if (
                fieldValue.length ===
                0
            ) {

                valueContainer.textContent =
                    "No value available.";

                return valueContainer;

            }


            const list =
                document
                    .createElement(
                        "div"
                    );


            list.className =
                "gg-field-details-list";


            fieldValue
                .forEach(

                    function (
                        item,
                        index
                    ) {

                        const itemElement =
                            document
                                .createElement(
                                    "div"
                                );


                        itemElement.className =
                            "gg-field-details-list-item";


                        if (
                            item &&
                            typeof item ===
                                "object"
                        ) {

                            let itemText;


                            try {

                                itemText =
                                    JSON.stringify(
                                        item,
                                        null,
                                        2
                                    );

                            }

                            catch (
                                error
                            ) {

                                itemText =
                                    String(
                                        item
                                    );

                            }


                            itemElement.textContent =
                                itemText;

                        }

                        else {

                            itemElement.textContent =
                                String(
                                    item
                                );

                        }


                        itemElement.dataset.index =
                            String(
                                index
                            );


                        list.appendChild(
                            itemElement
                        );

                    }

                );


            valueContainer.appendChild(
                list
            );


            return valueContainer;

        }


        /* ----------------------------------------
           OBJECT
        ---------------------------------------- */

        if (
            typeof fieldValue ===
                "object"
        ) {

            const pre =
                document
                    .createElement(
                        "pre"
                    );


            pre.className =
                "gg-field-details-object";


            try {

                pre.textContent =
                    JSON.stringify(
                        fieldValue,
                        null,
                        2
                    );

            }

            catch (
                error
            ) {

                pre.textContent =
                    String(
                        fieldValue
                    );

            }


            valueContainer.appendChild(
                pre
            );


            return valueContainer;

        }


        /* ----------------------------------------
           STRING / NUMBER / BOOLEAN
        ---------------------------------------- */

        const text =
            String(
                fieldValue
            );


        valueContainer.textContent =
            text.trim() !==
                ""

                ? text

                : "No value available.";


        return valueContainer;

    }


    /* ============================================
       CLEAR PREVIOUS FIELD DETAILS
    ============================================ */

    fieldDetails.innerHTML =
        "";


    /* ============================================
       CREATE FIELD DETAILS WRAPPER
    ============================================ */

    const wrapper =
        document
            .createElement(
                "div"
            );


    wrapper.className =
        "gg-field-details";


    /* ============================================
       FIELD HEADER
    ============================================ */

    const header =
        document
            .createElement(
                "div"
            );


    header.className =
        "gg-field-details-header";


    /* ============================================
       FIELD LABEL
    ============================================ */

    const label =
        document
            .createElement(
                "div"
            );


    label.className =
        "gg-field-details-label";


    label.textContent =
        formatFieldLabel(
            key
        );


    /* ============================================
       OPTIONAL TECHNICAL KEY

       Useful because the displayed label may be:

           Offence Date

       while actual source field remains:

           offenceDate

       This does not modify the source data.
    ============================================ */

    const keyElement =
        document
            .createElement(
                "div"
            );


    keyElement.className =
        "gg-field-details-key";


    keyElement.textContent =
        String(
            key
        );


    header.appendChild(
        label
    );


    header.appendChild(
        keyElement
    );


    /* ============================================
       COMPLETE FIELD VALUE
    ============================================ */

    const completeValue =
        createValueElement(
            value
        );


    /* ============================================
       BUILD FIELD DETAILS
    ============================================ */

    wrapper.appendChild(
        header
    );


    wrapper.appendChild(
        completeValue
    );


    fieldDetails.appendChild(
        wrapper
    );


    /* ============================================
       SHOW FIELD DETAILS SECTION
    ============================================ */

    const fieldDetailsSection =
        UIController.elements
            ?.fieldDetailsSection;


    if (
        fieldDetailsSection
    ) {

        fieldDetailsSection
            .style
            .display =
                "";

    }


    /* ============================================
       CURRENT NAVIGATION VIEW
    ============================================ */

    UIController.currentView =
        "field-details";


    /* ============================================
       RESET FIELD DETAILS SCROLL
    ============================================ */

    fieldDetails.scrollTop =
        0;


    /* ============================================
       UPDATE STATUS
    ============================================ */

    if (
        typeof
        UIController.setStatus ===
            "function"
    ) {

        UIController
            .setStatus(

                "Viewing " +
                formatFieldLabel(
                    key
                ) +
                ".",

                "success"

            );

    }


    /* ============================================
       SCROLL FIELD DETAILS INTO VIEW

       PANEL ONLY.

       This does NOT pan/zoom the Leaflet map.
    ============================================ */

    if (
        fieldDetailsSection
    ) {

        fieldDetailsSection
            .scrollIntoView?.(

                {
                    block:
                        "nearest",

                    behavior:
                        "smooth"
                }

            );

    }

    else {

        fieldDetails
            .scrollIntoView?.(

                {
                    block:
                        "nearest",

                    behavior:
                        "smooth"
                }

            );

    }


    console.log(

        "📋 Offence field selected:",

        {
            key:
                key,

            value:
                value,

            currentView:
                UIController.currentView
        }

    );


    return true;

},

   /* ===========================================================
   BACK TO CASE DETAILS

   NEW PANEL DESIGN
   -----------------------------------------------------------

   Navigation:

       FIELD DETAILS
              ↓
       CASE DETAILS

   Responsibilities

   ✓ Preserve selected parent
   ✓ Preserve selected child
   ✓ Preserve child list
   ✓ Preserve current case list
   ✓ Preserve selected case
   ✓ Preserve CASE DETAILS content
   ✓ Clear only selected field state
   ✓ Remove selected field highlight
   ✓ Hide FIELD DETAILS section
   ✓ Return current view to CASE DETAILS
   ✓ No GIS operation
   ✓ No map interaction
   ✓ No SpatialRenderer operation

=========================================================== */

backToCaseDetails:
function () {

    /* ============================================
       REQUIRE CURRENT CASE

       CASE DETAILS belongs to currentCase.

       If no case exists, there is nothing valid
       to return to.
    ============================================ */

    if (
        !UIController.currentCase
    ) {

        console.warn(
            "⚠ backToCaseDetails(): no current case selected"
        );

        return false;

    }


    /* ============================================
       CLEAR ONLY FIELD SELECTION STATE

       IMPORTANT:

       Do NOT clear:

           currentCase
           currentSpatialCases
           currentSpatialContext
           currentChild
           currentChildren
           currentParent
           currentSource
           currentTarget
    ============================================ */

    UIController.currentField =
        null;


    UIController.currentFieldKey =
        null;


    UIController.currentFieldValue =
        null;


    /* ============================================
       REMOVE SELECTED FIELD HIGHLIGHT

       CASE DETAILS itself remains intact.
    ============================================ */

    const caseDetails =
        UIController.elements
            ?.caseDetails;


    if (
        caseDetails
    ) {

        caseDetails
            .querySelectorAll(
                ".gg-case-details-row"
            )
            .forEach(

                function (
                    row
                ) {

                    row
                        .classList
                        .remove(
                            "gg-selected-field"
                        );


                    row
                        .setAttribute(
                            "aria-selected",
                            "false"
                        );

                }

            );

    }


    /* ============================================
       RESET FIELD DETAILS CONTENT

       We clear only the expanded field content.

       The section is hidden immediately afterward.
    ============================================ */

    const fieldDetails =
        UIController.elements
            ?.fieldDetails;


    if (
        fieldDetails
    ) {

        fieldDetails.innerHTML =
            `
            <div class="gg-offence-empty">

                Select a field from CASE DETAILS
                to view its complete content.

            </div>
            `;


        fieldDetails.scrollTop =
            0;

    }


    /* ============================================
       HIDE FIELD DETAILS SECTION
    ============================================ */

    const fieldDetailsSection =
        UIController.elements
            ?.fieldDetailsSection;


    if (
        fieldDetailsSection
    ) {

        fieldDetailsSection
            .style
            .display =
                "none";

    }


    /* ============================================
       ENSURE CASE DETAILS REMAINS VISIBLE
    ============================================ */

    const caseDetailsSection =
        UIController.elements
            ?.caseDetailsSection;


    if (
        caseDetailsSection
    ) {

        caseDetailsSection
            .style
            .display =
                "";

    }


    /* ============================================
       UPDATE NAVIGATION STATE
    ============================================ */

    UIController.currentView =
        "case-details";


    /* ============================================
       UPDATE STATUS

       Try to identify current POR/case number
       without changing the case object.
    ============================================ */

    if (
        typeof
        UIController.setStatus ===
            "function"
    ) {

        const caseData =
            UIController.currentCase;


        const porNumber =

            caseData?.porNo ||

            caseData?.POR_NO ||

            caseData?.porNumber ||

            caseData?.por ||

            caseData?.caseNo ||

            caseData?.caseNumber ||

            null;


        UIController
            .setStatus(

                porNumber

                    ? (
                        "Viewing offence case " +
                        porNumber +
                        "."
                    )

                    : "Viewing offence case details.",

                "success"

            );

    }


    /* ============================================
       SCROLL BACK TO CASE DETAILS

       PANEL NAVIGATION ONLY.

       This does NOT pan or zoom the map.
    ============================================ */

    if (
        caseDetailsSection
    ) {

        caseDetailsSection
            .scrollIntoView?.(

                {
                    block:
                        "nearest",

                    behavior:
                        "smooth"
                }

            );

    }

    else if (
        caseDetails
    ) {

        caseDetails
            .scrollIntoView?.(

                {
                    block:
                        "nearest",

                    behavior:
                        "smooth"
                }

            );

    }


    console.log(

        "↩ Offence navigation: FIELD DETAILS → CASE DETAILS",

        {
            currentView:
                UIController.currentView,

            currentCase:
                UIController.currentCase
        }

    );


    return true;

},

   /* ===========================================================
   BACK TO CASES

   NEW PANEL DESIGN
   -----------------------------------------------------------

   Navigation:

       CASE DETAILS
            ↓
       CASES

   Responsibilities

   ✓ Preserve selected parent
   ✓ Preserve child list
   ✓ Preserve selected child
   ✓ Preserve current case list
   ✓ Clear selected case
   ✓ Clear selected case-card highlight
   ✓ Clear selected field state
   ✓ Reset CASE DETAILS
   ✓ Reset FIELD DETAILS
   ✓ Hide CASE DETAILS section
   ✓ Hide FIELD DETAILS section
   ✓ Keep CASES section visible
   ✓ No GIS operation
   ✓ No map interaction
   ✓ No SpatialRenderer operation

=========================================================== */

backToCases:
function () {

    /* ============================================
       PRESERVE CURRENT CASE LIST

       IMPORTANT:

       Do NOT modify:

           currentSpatialCases
           currentSpatialContext
           currentParent
           currentChild
           currentChildren
           currentSource
           currentTarget

       We are only moving upward one UI level:

           CASE DETAILS
                  ↓
               CASES
    ============================================ */


    /* ============================================
       CLEAR SELECTED CASE
    ============================================ */

    UIController.currentCase =
        null;


    /* ============================================
       CLEAR FIELD-LEVEL STATE

       Any field selection belongs to the case
       being exited.
    ============================================ */

    UIController.currentField =
        null;


    UIController.currentFieldKey =
        null;


    UIController.currentFieldValue =
        null;


    /* ============================================
       REMOVE SELECTED CASE CARD HIGHLIGHT

       IMPORTANT:

       Do NOT delete or rebuild case cards.

       The current case list remains exactly
       where it is.
    ============================================ */

    const caseResultList =
        UIController.elements
            ?.caseResultList;


    if (
        caseResultList
    ) {

        caseResultList
            .querySelectorAll(
                ".gg-offence-case-card"
            )
            .forEach(

                function (
                    card
                ) {

                    card
                        .classList
                        .remove(
                            "gg-selected-case"
                        );


                    card
                        .setAttribute(
                            "aria-selected",
                            "false"
                        );

                }

            );

    }


    /* ============================================
       RESET CASE DETAILS CONTENT
    ============================================ */

    const caseDetails =
        UIController.elements
            ?.caseDetails;


    if (
        caseDetails
    ) {

        caseDetails.innerHTML =
            `
            <div class="gg-offence-empty">

                Select a case above to view
                complete offence details.

            </div>
            `;


        caseDetails.scrollTop =
            0;

    }


    /* ============================================
       RESET FIELD DETAILS CONTENT
    ============================================ */

    const fieldDetails =
        UIController.elements
            ?.fieldDetails;


    if (
        fieldDetails
    ) {

        fieldDetails.innerHTML =
            `
            <div class="gg-offence-empty">

                Select a field from CASE DETAILS
                to view its complete content.

            </div>
            `;


        fieldDetails.scrollTop =
            0;

    }


    /* ============================================
       HIDE FIELD DETAILS SECTION
    ============================================ */

    const fieldDetailsSection =
        UIController.elements
            ?.fieldDetailsSection;


    if (
        fieldDetailsSection
    ) {

        fieldDetailsSection
            .style
            .display =
                "none";

    }


    /* ============================================
       HIDE CASE DETAILS SECTION

       We are returning to the CASES level.
    ============================================ */

    const caseDetailsSection =
        UIController.elements
            ?.caseDetailsSection;


    if (
        caseDetailsSection
    ) {

        caseDetailsSection
            .style
            .display =
                "none";

    }


    /* ============================================
       ENSURE CASES SECTION IS VISIBLE

       The existing case cards are preserved.
    ============================================ */

    const casesSection =
        UIController.elements
            ?.casesSection;


    if (
        casesSection
    ) {

        casesSection
            .style
            .display =
                "";

    }


    /* ============================================
       ENSURE CASE RESULTS CONTAINER IS VISIBLE

       Compatibility with current element naming.
    ============================================ */

    const caseResults =
        UIController.elements
            ?.caseResults;


    if (
        caseResults
    ) {

        caseResults
            .style
            .display =
                "";

    }


    /* ============================================
       UPDATE CURRENT PANEL VIEW
    ============================================ */

    UIController.currentView =
        "cases";


    /* ============================================
       DETERMINE EXISTING CASE COUNT

       We use the already cached case collection.

       NO case lookup is performed here.
    ============================================ */

    const cases =

        Array.isArray(
            UIController.currentSpatialCases
        )

            ? UIController.currentSpatialCases

            : [];


    const caseCount =
        cases.length;


    /* ============================================
       UPDATE STATUS
    ============================================ */

    if (
        typeof
        UIController.setStatus ===
            "function"
    ) {

        if (
            caseCount > 0
        ) {

            UIController
                .setStatus(

                    caseCount +
                    " offence case" +
                    (
                        caseCount === 1
                            ? ""
                            : "s"
                    ) +
                    " available. Select a case.",

                    "success"

                );

        }

        else {

            UIController
                .setStatus(

                    "No offence cases available for the selected child.",

                    "ready"

                );

        }

    }


    /* ============================================
       SCROLL BACK TO CASES

       PANEL SCROLL ONLY.

       This does NOT:

           pan map
           zoom map
           highlight parent
           highlight child
           query SpatialEngine
           call SpatialRenderer
    ============================================ */

    if (
        casesSection
    ) {

        casesSection
            .scrollIntoView?.(

                {
                    block:
                        "nearest",

                    behavior:
                        "smooth"
                }

            );

    }

    else if (
        caseResults
    ) {

        caseResults
            .scrollIntoView?.(

                {
                    block:
                        "nearest",

                    behavior:
                        "smooth"
                }

            );

    }


    /* ============================================
       DEBUG
    ============================================ */

    console.log(

        "↩ Offence navigation: CASE DETAILS → CASES",

        {

            currentView:
                UIController.currentView,

            parent:
                UIController.currentParent ||
                UIController.currentSource ||
                UIController.currentTarget ||
                null,

            child:
                UIController.currentChild ||
                null,

            caseCount:
                caseCount,

            currentCase:
                UIController.currentCase

        }

    );


    return true;

},

   /* ===========================================================
   BACK TO CHILDREN

   NEW PANEL DESIGN
   -----------------------------------------------------------

   Navigation:

       CASES
          ↓
       CHILD

   Responsibilities

   ✓ Preserve active analysis mode
   ✓ Preserve selected parent
   ✓ Preserve complete child list
   ✓ Clear selected child
   ✓ Clear child-specific cases
   ✓ Clear selected case
   ✓ Clear selected field
   ✓ Reset CASES
   ✓ Reset CASE DETAILS
   ✓ Reset FIELD DETAILS
   ✓ Hide CASES
   ✓ Hide CASE DETAILS
   ✓ Hide FIELD DETAILS
   ✓ Show CHILD section
   ✓ No GIS operation
   ✓ No map click required
   ✓ No SpatialRenderer operation
   ✓ No parent-map restoration

=========================================================== */

backToChildren:
function () {


    /* ============================================
       IMPORTANT NAVIGATION RULE

       DO NOT MODIFY:

           activeMode
           currentParent
           currentChildren

       The selected parent remains active.

       Example:

           Parent:
               Falakata Village

           Children:
               Madarihat Range
               Jaldapara Range
               Chilapata Range

       Returning from CASES must bring the user
       back to those SAME children.

       No GIS lookup or map rendering is required.
    ============================================ */


    /* ============================================
       CLEAR SELECTED CHILD

       We are leaving the currently selected
       child and returning to the parent's
       complete child collection.
    ============================================ */

    UIController.currentChild =
        null;


    /*
     * Compatibility state.
     *
     * Some earlier SOURCE → TARGET implementation
     * may still use currentTarget as the selected
     * child.
     *
     * Do NOT clear currentSource/currentParent.
     */

    UIController.currentTarget =
        null;


    /* ============================================
       CLEAR CHILD-SPECIFIC CASE STATE

       These cases belong to the child that
       we are leaving.
    ============================================ */

    UIController.currentSpatialCases =
        [];


    UIController.currentSpatialContext =
        {};


    /* ============================================
       CLEAR SELECTED CASE
    ============================================ */

    UIController.currentCase =
        null;


    /* ============================================
       CLEAR FIELD STATE
    ============================================ */

    UIController.currentField =
        null;


    UIController.currentFieldKey =
        null;


    UIController.currentFieldValue =
        null;


    /* ============================================
       REMOVE CHILD SELECTION HIGHLIGHT

       IMPORTANT:

       Child cards themselves are preserved.

       We only remove the currently selected
       visual state.
    ============================================ */

    const childList =
        UIController.elements
            ?.childList;


    if (
        childList
    ) {

        childList
            .querySelectorAll(
                ".gg-offence-child-card"
            )
            .forEach(

                function (
                    card
                ) {

                    card
                        .classList
                        .remove(
                            "gg-selected-child"
                        );


                    card
                        .setAttribute(
                            "aria-selected",
                            "false"
                        );

                }

            );

    }


    /* ============================================
       COMPATIBILITY:
       OLD RELATED TARGET ITEM CLASS

       During migration some child cards may
       still use:

           .gg-related-target-item

       Support them without restoring the old
       navigation architecture.
    ============================================ */

    if (
        childList
    ) {

        childList
            .querySelectorAll(
                ".gg-related-target-item"
            )
            .forEach(

                function (
                    card
                ) {

                    card
                        .classList
                        .remove(
                            "gg-related-target-active"
                        );


                    card
                        .setAttribute(
                            "aria-selected",
                            "false"
                        );

                }

            );

    }


    /* ============================================
       RESET CASE RESULTS

       Do NOT retain cases belonging to the
       previously selected child.
    ============================================ */

    const caseResultList =
        UIController.elements
            ?.caseResultList;


    if (
        caseResultList
    ) {

        caseResultList.innerHTML =
            `
            <div class="gg-offence-empty">

                Select a child above to view
                matching offence cases.

            </div>
            `;


        caseResultList.scrollTop =
            0;

    }


    /* ============================================
       RESET CASE DETAILS
    ============================================ */

    const caseDetails =
        UIController.elements
            ?.caseDetails;


    if (
        caseDetails
    ) {

        caseDetails.innerHTML =
            `
            <div class="gg-offence-empty">

                Select a case to view complete
                offence details.

            </div>
            `;


        caseDetails.scrollTop =
            0;

    }


    /* ============================================
       RESET FIELD DETAILS
    ============================================ */

    const fieldDetails =
        UIController.elements
            ?.fieldDetails;


    if (
        fieldDetails
    ) {

        fieldDetails.innerHTML =
            `
            <div class="gg-offence-empty">

                Select a field from CASE DETAILS
                to view its complete content.

            </div>
            `;


        fieldDetails.scrollTop =
            0;

    }


    /* ============================================
       HIDE FIELD DETAILS SECTION
    ============================================ */

    const fieldDetailsSection =
        UIController.elements
            ?.fieldDetailsSection;


    if (
        fieldDetailsSection
    ) {

        fieldDetailsSection
            .style
            .display =
                "none";

    }


    /* ============================================
       HIDE CASE DETAILS SECTION
    ============================================ */

    const caseDetailsSection =
        UIController.elements
            ?.caseDetailsSection;


    if (
        caseDetailsSection
    ) {

        caseDetailsSection
            .style
            .display =
                "none";

    }


    /* ============================================
       HIDE CASES SECTION
    ============================================ */

    const casesSection =
        UIController.elements
            ?.casesSection;


    if (
        casesSection
    ) {

        casesSection
            .style
            .display =
                "none";

    }


    /* ============================================
       COMPATIBILITY:
       HIDE CASE RESULTS CONTAINER
    ============================================ */

    const caseResults =
        UIController.elements
            ?.caseResults;


    if (
        caseResults
    ) {

        caseResults
            .style
            .display =
                "none";

    }


    /* ============================================
       SHOW CHILD SECTION

       This section already contains the children
       belonging to the selected parent.

       DO NOT rebuild from GIS here.
    ============================================ */

    const childSection =
        UIController.elements
            ?.childSection;


    if (
        childSection
    ) {

        childSection
            .style
            .display =
                "";

    }


    /* ============================================
       ENSURE CHILD LIST IS VISIBLE
    ============================================ */

    if (
        childList
    ) {

        childList
            .style
            .display =
                "";

    }


    /* ============================================
       UPDATE CURRENT VIEW
    ============================================ */

    UIController.currentView =
        "children";


    /* ============================================
       DETERMINE PRESERVED CHILD COUNT

       Preferred new state:

           currentChildren

       Compatibility fallback:

           currentTargets
    ============================================ */

    const children =

        Array.isArray(
            UIController.currentChildren
        )

            ? UIController.currentChildren

            : (

                Array.isArray(
                    UIController.currentTargets
                )

                    ? UIController.currentTargets

                    : []

            );


    const childCount =
        children.length;


    /* ============================================
       UPDATE STATUS
    ============================================ */

    if (
        typeof
        UIController.setStatus ===
            "function"
    ) {

        if (
            childCount > 0
        ) {

            UIController
                .setStatus(

                    childCount +
                    " child" +
                    (
                        childCount === 1
                            ? ""
                            : "ren"
                    ) +
                    " available. Select a child.",

                    "success"

                );

        }

        else {

            UIController
                .setStatus(

                    "No children available for the selected parent.",

                    "ready"

                );

        }

    }


    /* ============================================
       SCROLL CHILD SECTION INTO VIEW

       UI navigation only.

       NO MAP MOVEMENT.
    ============================================ */

    if (
        childSection
    ) {

        childSection
            .scrollIntoView?.(

                {
                    block:
                        "nearest",

                    behavior:
                        "smooth"
                }

            );

    }

    else if (
        childList
    ) {

        childList
            .scrollIntoView?.(

                {
                    block:
                        "nearest",

                    behavior:
                        "smooth"
                }

            );

    }


    /* ============================================
       DEBUG

       Parent must still exist here.
    ============================================ */

    console.log(

        "↩ Offence navigation: CASES → CHILDREN",

        {

            currentView:
                UIController.currentView,

            activeMode:
                UIController.activeMode,

            parent:
                UIController.currentParent ||
                UIController.currentSource ||
                null,

            childCount:
                childCount,

            selectedChild:
                UIController.currentChild,

            caseCount:
                UIController
                    .currentSpatialCases
                    ?.length ||
                0,

            currentCase:
                UIController.currentCase

        }

    );


    return true;


},
/* ===========================================================
   SELECT CASE

   NEW PANEL DESIGN
   -----------------------------------------------------------

   Navigation:

       PARENT
          ↓
       CHILD
          ↓
       CASES
          ↓
       CASE DETAILS

   Responsibilities

   ✓ Preserve selected parent
   ✓ Preserve selected child
   ✓ Preserve child list
   ✓ Preserve current case list
   ✓ Store selected case
   ✓ Highlight selected case card
   ✓ Populate CASE DETAILS
   ✓ Reset FIELD DETAILS from previous case
   ✓ Show CASE DETAILS section
   ✓ Keep CASES available for Back navigation
   ✓ No GIS operation
   ✓ No map click
   ✓ No parent/child map reset

=========================================================== */

selectCase:
function (
    caseData,
    card = null
) {

    /* ============================================
       VALIDATE CASE
    ============================================ */

    if (
        !caseData ||
        typeof caseData !==
            "object"
    ) {

        console.warn(
            "⚠ selectCase(): invalid case data",
            caseData
        );

        return false;

    }


    /* ============================================
       STORE CURRENT CASE

       IMPORTANT:

       Do NOT modify:

       currentParent
       currentSource
       currentTarget
       currentChild
       currentChildren
       currentSpatialCases
       currentSpatialContext

       The complete parent → child → case chain
       remains intact.
    ============================================ */

    UIController.currentCase =
        caseData;


    /* ============================================
       CLEAR PREVIOUS FIELD SELECTION

       A field selected from the previous case
       must never remain active after another
       case is selected.
    ============================================ */

    UIController.currentField =
        null;


    UIController.currentFieldKey =
        null;


    UIController.currentFieldValue =
        null;


    /* ============================================
       HIGHLIGHT SELECTED CASE CARD
    ============================================ */

    if (
        typeof
        UIController.highlightSelectedCase ===
            "function"
    ) {

        UIController
            .highlightSelectedCase(
                card
            );

    }

    else {

        /*
         * Safe fallback.
         *
         * This keeps case selection working even
         * if highlightSelectedCase() has not yet
         * been added/replaced.
         */

        document
            .querySelectorAll(
                ".gg-offence-case-card"
            )
            .forEach(

                function (
                    caseCard
                ) {

                    caseCard
                        .classList
                        .remove(
                            "gg-selected-case"
                        );

                }

            );


        if (
            card &&
            card.classList
        ) {

            card
                .classList
                .add(
                    "gg-selected-case"
                );

        }

    }


    /* ============================================
       RESET FIELD DETAILS

       CASE DETAILS belongs to the newly selected
       case.

       Therefore any expanded field belonging to
       the previous case must be cleared.
    ============================================ */

    const fieldDetails =
        UIController.elements
            ?.fieldDetails;


    if (
        fieldDetails
    ) {

        fieldDetails.innerHTML =
            `
            <div class="gg-offence-empty">

                Select a field from CASE DETAILS
                to view its complete content.

            </div>
            `;

    }


    /* ============================================
       HIDE FIELD DETAILS SECTION

       It will be shown again only when the user
       selects a field from CASE DETAILS.
    ============================================ */

    const fieldDetailsSection =
        UIController.elements
            ?.fieldDetailsSection;


    if (
        fieldDetailsSection
    ) {

        fieldDetailsSection
            .style
            .display =
                "none";

    }


    /* ============================================
       POPULATE CASE DETAILS

       No business logic should be performed here.

       showCaseDetails() owns rendering of the
       selected case.
    ============================================ */

    if (
        typeof
        UIController.showCaseDetails ===
            "function"
    ) {

        UIController
            .showCaseDetails(
                caseData
            );

    }

    else {

        console.error(
            "❌ OffenceUIController.showCaseDetails() unavailable"
        );

        return false;

    }


    /* ============================================
       SHOW CASE DETAILS SECTION

       Depending on your createPanel() structure,
       caseDetailsSection is the complete section,
       while caseDetails is the content container.
    ============================================ */

    const caseDetailsSection =
        UIController.elements
            ?.caseDetailsSection;


    if (
        caseDetailsSection
    ) {

        caseDetailsSection
            .style
            .display =
                "";

    }


    /* ============================================
       UPDATE CURRENT VIEW

       This is UI navigation state only.

       It does NOT alter GIS/map state.
    ============================================ */

    UIController.currentView =
        "case-details";


    /* ============================================
       UPDATE STATUS
    ============================================ */

    if (
        typeof
        UIController.setStatus ===
            "function"
    ) {

        const porNumber =

            caseData.porNo ||

            caseData.POR_NO ||

            caseData.porNumber ||

            caseData.por ||

            caseData.caseNo ||

            caseData.caseNumber ||

            null;


        UIController
            .setStatus(

                porNumber

                    ? (
                        "Viewing offence case " +
                        porNumber +
                        "."
                    )

                    : "Viewing offence case details.",

                "success"

            );

    }


    /* ============================================
       SCROLL CASE DETAILS INTO VIEW

       This affects only the panel UI.

       It does NOT move or alter the Leaflet map.
    ============================================ */

    const caseDetails =
        UIController.elements
            ?.caseDetails;


    if (
        caseDetailsSection
    ) {

        caseDetailsSection
            .scrollIntoView?.(

                {
                    block:
                        "nearest",

                    behavior:
                        "smooth"
                }

            );

    }

    else if (
        caseDetails
    ) {

        caseDetails
            .scrollIntoView?.(

                {
                    block:
                        "nearest",

                    behavior:
                        "smooth"
                }

            );

    }


    console.log(

        "📄 Offence case selected:",

        {
            caseData:
                caseData,

            currentView:
                UIController.currentView
        }

    );


    return true;

},
/* ===========================================================
   HIGHLIGHT SELECTED CASE

   Responsibilities

   ✓ Remove previous highlight
   ✓ Highlight selected case only
=========================================================== */



       /* ===========================================================
   SHOW CASE DETAILS

   Responsibilities

   ✓ Render selected offence case
   ✓ Populate CASE DETAILS panel
   ✓ No business logic
   ✓ No selection logic
=========================================================== */



       /* ===========================================================
   CLEAR CASE SELECTION
=========================================================== */

/* ===========================================================
   CLEAR CASE SELECTION

   Responsibilities

   ✓ Reset current case
   ✓ Remove selected highlight
   ✓ Reset CASE DETAILS
   ✓ Scroll details to top
=========================================================== */

clearCaseSelection:
function () {

    /* ============================================
       RESET CURRENT CASE
    ============================================ */

    UIController.currentCase =
        null;

    /* ============================================
       REMOVE CARD HIGHLIGHT
    ============================================ */

    document

        .querySelectorAll(
            ".gg-offence-case-card"
        )

        .forEach(

            function (
                card
            ) {

                card.classList.remove(
                    "gg-selected-case"
                );

            }

        );

    /* ============================================
       GET DETAILS CONTAINER
    ============================================ */

    const container =

        UIController.elements
            ?.caseDetails;

    if (
        !container
    ) {

        return false;

    }

    /* ============================================
       RESET DETAILS PANEL
    ============================================ */

    container.innerHTML =

        `
        <div class="gg-offence-empty">

            Select a case above to view complete
            offence details.

        </div>
        `;

    /* ============================================
       SCROLL TO TOP
    ============================================ */

    container.scrollTop = 0;

    return true;

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

/* ===========================================================
   CLEAR ANALYSIS

   Responsibilities

   ✓ Clear spatial renderer
   ✓ Reset active mode
   ✓ Clear selected case
   ✓ Reset CASE DETAILS
   ✓ Update status
=========================================================== */

/* ===========================================================
   CLEAR ANALYSIS

   Responsibilities

   ✓ Clear spatial renderer
   ✓ Reset controller state
   ✓ Reset active mode
   ✓ Collapse CASE RESULTS
   ✓ Clear CASE RESULTS
   ✓ Clear selected case
   ✓ Reset CASE DETAILS
   ✓ Update status
=========================================================== */

clearAnalysis:
function () {

    try {

        const SpatialRenderer =
            UIController
                .getSpatialRenderer();

        /* ========================================
           CLEAR MAP
        ======================================== */

        if (

            SpatialRenderer &&

            typeof
            SpatialRenderer.clear ===
            "function"

        ) {

            SpatialRenderer.clear();

        }

        /* ========================================
           RESET INTERNAL STATE
        ======================================== */

        UIController.activeMode =
            null;

        UIController.currentSource =
            null;

        UIController.currentTargets =
            [];

        UIController.currentSpatialCases =
            [];

        UIController.currentSpatialContext =
            {};

        UIController.currentCase =
            null;

        /* ========================================
           RESET ACTIVE MODE BUTTONS
        ======================================== */

        UIController.updateActiveModeUI(
            null
        );

        /* ========================================
           COLLAPSE CASE RESULTS PANEL
        ======================================== */

        UIController.updateCaseResultsPanel(
            false
        );

        /* ========================================
           RESET CASE RESULTS
        ======================================== */

        if (
            UIController.elements
                ?.caseResultList
        ) {

            UIController.elements
                .caseResultList
                .innerHTML =

                `
                <div class="gg-offence-empty">

                    Select a
                    <b>Source → Target</b>
                    or
                    <b>Target → Source</b>
                    pair to view matching offence cases.

                </div>
                `;

        }

        /* ========================================
           CLEAR CASE SELECTION
        ======================================== */

        if (

            typeof
            UIController
                .clearCaseSelection ===
            "function"

        ) {

            UIController
                .clearCaseSelection();

        }

        /* ========================================
           UPDATE STATUS
        ======================================== */

        UIController.setStatus(

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

        UIController.lastError =
            error;

        UIController.setStatus(

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

/* ===========================================================
   SHOW SPATIAL CASES

   CURRENT OFFENCE UI ARCHITECTURE
   -----------------------------------------------------------

   PARENT
      ↓
   CHILD
      ↓
   CASES                  ← THIS FUNCTION
      ↓
   CASE DETAILS
      ↓
   FIELD DETAILS


   PURPOSE
   -----------------------------------------------------------

   Render the offence cases belonging to the currently
   selected:

       PARENT + CHILD

   relationship.


   IMPORTANT
   -----------------------------------------------------------

   This function is PANEL UI ONLY.

   It does NOT:

       - perform GIS lookup
       - require map interaction
       - change currentParent
       - change currentChildren
       - change currentChild
       - clear map layers
       - rebuild SpatialEngine
       - rebuild Store
       - render parent polygons
       - render child polygons
       - delegate to CascadeUI


   STATE OWNERSHIP
   -----------------------------------------------------------

   Preserved:

       activeMode
       currentParent
       currentChildren
       currentChild


   Replaced:

       currentSpatialCases
       currentSpatialContext


   Reset:

       currentCase
       currentField


   CASE CARD CLICK
   -----------------------------------------------------------

   Every generated case card calls:

       UIController.selectCase(
           caseData,
           card
       );

=========================================================== */

showSpatialCases:
function (
    cases,
    context = {}
) {


    /* =======================================================
       NORMALIZE CASE COLLECTION
    ======================================================= */

    const list =
        Array.isArray(
            cases
        )
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



    /* =======================================================
       ENSURE CURRENT DOM REFERENCES

       The panel may have been recreated, so always make sure
       we are working against the current DOM.
    ======================================================= */

    if (
        typeof
        UIController.captureElements ===
        "function"
    ) {

        UIController.captureElements();

    }


    const elements =
        UIController.elements ||
        {};



    /* =======================================================
       STORE CURRENT CASE STATE

       IMPORTANT:

       Selecting a CHILD replaces only:

           current child
           current case collection
           current case
           current field

       Parent and complete child collection remain preserved.
    ======================================================= */

    UIController.currentSpatialCases =
        list;


    UIController.currentCases =
        list;


    UIController.currentSpatialContext =
        context;


    UIController.currentCaseContext =
        context;


    UIController.currentCase =
        null;


    UIController.currentField =
        null;



    /* =======================================================
       SYNCHRONIZE CURRENT CHILD

       The child may be supplied by different callers under
       slightly different context properties.

       Preserve the existing child when the context does not
       explicitly provide one.
    ======================================================= */

    const contextChild =

        context.child ||

        context.selectedChild ||

        context.target ||

        context.source ||

        null;


    if (
        contextChild
    ) {

        UIController.currentChild =
            contextChild;

    }



    /* =======================================================
       SHOW CASE SECTION
    ======================================================= */

    if (
        elements.caseSection
    ) {

        elements
            .caseSection
            .style
            .display =
                "";

    }


    if (
        elements.caseResults
    ) {

        elements
            .caseResults
            .style
            .display =
                "";

    }



    /* =======================================================
       HIDE LOWER DRILL-DOWN SECTIONS

       CHILD
          ↓
       CASES

       Therefore a new child selection must close any previous:

           CASE DETAILS
           FIELD DETAILS
    ======================================================= */

    if (
        elements.caseDetailsSection
    ) {

        elements
            .caseDetailsSection
            .style
            .display =
                "none";

    }


    if (
        elements.fieldDetailsSection
    ) {

        elements
            .fieldDetailsSection
            .style
            .display =
                "none";

    }



    /* =======================================================
       RESET OLD CASE DETAILS
    ======================================================= */

    if (
        elements.caseDetails
    ) {

        elements
            .caseDetails
            .innerHTML =
                `
                <div class="gg-offence-empty">
                    Select a case to view details.
                </div>
                `;

    }


    if (
        elements.fieldDetails
    ) {

        elements
            .fieldDetails
            .innerHTML =
                `
                <div class="gg-offence-empty">
                    Select a field to view details.
                </div>
                `;

    }



    /* =======================================================
       UPDATE CASE COUNT

       This is the count currently appearing correctly in
       your panel.
    ======================================================= */

    if (
        elements.caseCount
    ) {

        elements
            .caseCount
            .textContent =

                `${list.length} case${
                    list.length === 1
                        ? ""
                        : "s"
                }`;

    }



    /* =======================================================
       VALIDATE CASE LIST CONTAINER

       THIS IS THE IMPORTANT DOM CONTAINER:

           #gg-case-result-list

       The count can work even when this reference is missing,
       which explains the behaviour you are currently seeing.
    ======================================================= */

    const caseResultList =

        elements.caseResultList ||

        document.getElementById(
            "gg-case-result-list"
        );


    if (
        !caseResultList
    ) {

        console.error(

            "❌ CASE LIST CONTAINER NOT FOUND: #gg-case-result-list"

        );


        UIController.setStatus?.(

            "Case list container unavailable.",

            "error"

        );


        console.groupEnd();


        return false;

    }



    /* =======================================================
       CLEAR PREVIOUS CASE LIST

       Switching CHILD:

           Child A
              ↓
           15 cases

       then

           Child B
              ↓
           20 cases

       must REPLACE the previous case list.
    ======================================================= */

    caseResultList.innerHTML =
        "";



    /* =======================================================
       NO CASES
    ======================================================= */

    if (
        !list.length
    ) {

        caseResultList.innerHTML =
            `
            <div class="gg-offence-empty">

                No matching offence cases found.

            </div>
            `;


        UIController.setStatus?.(

            "No offence cases found.",

            "ready"

        );


        console.log(
            "No cases to render."
        );


        console.groupEnd();


        return false;

    }



    /* =======================================================
       RENDER EVERY RELATED CASE

       Each resolved cascade becomes one clickable CASE card.
    ======================================================= */

    list.forEach(

        function (
            caseData,
            index
        ) {


            if (
                !caseData
            ) {

                return;

            }



            /* =================================================
               RESOLVE CASE / POR NUMBER

               Current spatial cascades commonly expose:

                   porNo
                   porKey
                   caseId

               Additional fallbacks are retained for safety.
            ================================================= */

            const porNo =

                caseData.porNo ||

                caseData.porKey ||

                caseData.POR_NO ||

                caseData.por ||

                caseData.caseNo ||

                caseData.caseNumber ||

                caseData.caseId ||

                `Case ${index + 1}`;



            /* =================================================
               RESOLVE OPTIONAL SECONDARY INFORMATION
            ================================================= */

            const caseObject =

                caseData.case ||

                {};


            const offenceDate =

                caseObject.offenceDate ||

                caseObject.date ||

                caseData.offenceDate ||

                caseData.date ||

                "";


            const targetName =

                caseData.targetRange?.name ||

                caseData.targetRange?.cleanName ||

                caseData.targetName ||

                "";


            const sourceNames =

                Array.isArray(
                    caseData.sourceVillages
                )

                    ? caseData.sourceVillages

                        .map(

                            function (
                                item
                            ) {

                                return (

                                    item?.name ||

                                    item?.cleanName ||

                                    item?.villageName ||

                                    ""

                                );

                            }

                        )

                        .filter(Boolean)

                        .join(", ")

                    : "";



            /* =================================================
               CREATE CASE CARD
            ================================================= */

            const card =
                document.createElement(
                    "button"
                );


            card.type =
                "button";


            card.className =
                "gg-offence-case-card";


            card.dataset.caseIndex =
                String(
                    index
                );


            card.dataset.caseId =

                caseData.caseId ||

                caseData.porKey ||

                caseData.porNo ||

                "";



            /* =================================================
               CASE CARD CONTENT
            ================================================= */

            const title =
                document.createElement(
                    "div"
                );


            title.className =
                "gg-offence-case-card-title";


            title.textContent =
                porNo;


            card.appendChild(
                title
            );



            /* =================================================
               OPTIONAL META ROW

               Do not manufacture data.

               Show only information already available in the
               resolved cascade.
            ================================================= */

            const metaParts =
                [];


            if (
                offenceDate
            ) {

                metaParts.push(
                    String(
                        offenceDate
                    )
                );

            }


            if (
                sourceNames
            ) {

                metaParts.push(
                    sourceNames
                );

            }


            if (
                targetName
            ) {

                metaParts.push(
                    targetName
                );

            }


            if (
                metaParts.length
            ) {

                const meta =
                    document.createElement(
                        "div"
                    );


                meta.className =
                    "gg-offence-case-card-meta";


                meta.textContent =
                    metaParts.join(
                        " • "
                    );


                card.appendChild(
                    meta
                );

            }



            /* =================================================
               CLICK CASE

               CASE
                  ↓
               CASE DETAILS
            ================================================= */

            card.onclick =
                function (
                    event
                ) {


                    event
                        ?.preventDefault?.();


                    event
                        ?.stopPropagation?.();



                    /* ------------------------------------------
                       STORE SELECTED CASE
                    ------------------------------------------ */

                    UIController.currentCase =
                        caseData;



                    /* ------------------------------------------
                       SELECT CASE THROUGH EXISTING CONTROLLER

                       This preserves your existing:

                           highlightSelectedCase()
                           showCaseDetails()
                           scrolling

                       logic.
                    ------------------------------------------ */

                    if (
                        typeof
                        UIController.selectCase ===
                        "function"
                    ) {

                        UIController.selectCase(

                            caseData,

                            card

                        );

                    }


                    else if (
                        typeof
                        UIController.showCaseDetails ===
                        "function"
                    ) {

                        UIController.showCaseDetails(
                            caseData
                        );

                    }


                    else {

                        console.error(

                            "❌ No case-detail handler available."

                        );

                    }


                };



            /* =================================================
               ADD CASE TO LIST
            ================================================= */

            caseResultList.appendChild(
                card
            );


        }

    );



    /* =======================================================
       STATUS
    ======================================================= */

    UIController.setStatus?.(

        `${list.length} offence case${
            list.length === 1
                ? ""
                : "s"
        } found.`,

        "success"

    );



    /* =======================================================
       SCROLL CASE SECTION INTO VIEW

       Panel remains the scrolling container.
    ======================================================= */

    elements.caseSection
        ?.scrollIntoView?.(

            {

                block:
                    "nearest",

                behavior:
                    "smooth"

            }

        );



    /* =======================================================
       DEBUG VALIDATION

       The two numbers below MUST now be identical.

       Example:

           Resolved cases: 15
           Rendered case cards: 15
    ======================================================= */

    console.log(

        "📂 Offence CASES rendered",

        {

            mode:

                context.mode ||

                UIController.currentMode ||

                "",

            parent:

                UIController.currentParent ||

                null,

            child:

                UIController.currentChild ||

                null,

            resolvedCases:
                list.length,

            renderedCaseCards:

                caseResultList
                    .querySelectorAll(
                        ".gg-offence-case-card"
                    )
                    .length

        }

    );


    console.groupEnd();


    return list;


}


/* ========================================================
   CLOSE UIController OBJECT
======================================================== */

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
