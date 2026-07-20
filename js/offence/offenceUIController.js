/* ============================================================
   🚨 GREENGUARD OFFENCE UI CONTROLLER
   File:
   js/offence/offenceUIController.js

   Version:
   3.0.0

   Architecture:
   ------------------------------------------------------------
   OffenceDataLoader
        ↓
   OffenceStore
        ↓
   OffenceSpatialEngine
        ↓
   OffenceSpatialRenderer
        ↓
   OffenceUIController

   Purpose:
   ------------------------------------------------------------
   Provides one professional map control:

       🚨 OFFENCE

   Clicking opens:

       ┌──────────────────────┐
       │ 🚨 OFFENCE ANALYSIS  │
       │                      │
       │ 🏡 SOURCE            │
       │ 🎯 TARGET            │
       │ 🧹 CLEAR             │
       │ ✕ CLOSE              │
       └──────────────────────┘

   SOURCE
       ↓
   renderAllSources()
       ↓
   Source village click
       ↓
   Related target ranges
       ↓
   Target click
       ↓
   Related POR cases

   TARGET
       ↓
   renderAllTargets()
       ↓
   Target range click
       ↓
   Related source villages
       ↓
   Source click
       ↓
   Related POR cases

   IMPORTANT:
   ------------------------------------------------------------
   This controller DOES NOT use:

   Offence.Geocoder
   Offence.SourceEngine
   Offence.TargetEngine
   Offence.HeatmapEngine
   Offence.MapRenderer

============================================================ */

(function () {

  "use strict";


  /* ============================================================
     🌐 GLOBAL NAMESPACE
  ============================================================ */

  window.GG =
    window.GG || {};


  GG.Offence =
    GG.Offence || {};


  /* ============================================================
     🚨 CONTROLLER
  ============================================================ */

  const UI =
    GG.Offence.UIController =
      GG.Offence.UIController || {};


  UI.VERSION =
    "3.0.0";


  /* ============================================================
     🔥 STATE
  ============================================================ */

  UI.initialized =
    false;


  UI.ready =
    false;


  UI.panelOpen =
    false;


  UI.activeMode =
    null;


  UI.button =
    null;


  UI.panel =
    null;


  UI.statusElement =
    null;


  UI.sourceButton =
    null;


  UI.targetButton =
    null;


  UI.clearButton =
    null;


  UI.closeButton =
    null;


  /* ============================================================
     🗺 GET MAP
  ============================================================ */

  UI.getMap =
    function () {

      return (

        window.map

        ||

        window.leafletMap

        ||

        GG.map

        ||

        GG.Map

        ||

        null

      );

    };


  /* ============================================================
     🧠 GET SPATIAL ENGINE
  ============================================================ */

  UI.getSpatialEngine =
    function () {

      return (

        GG
          ?.Offence
          ?.SpatialEngine

        ||

        null

      );

    };


  /* ============================================================
     🎨 GET SPATIAL RENDERER
  ============================================================ */

  UI.getSpatialRenderer =
    function () {

      return (

        GG
          ?.Offence
          ?.SpatialRenderer

        ||

        null

      );

    };


  /* ============================================================
     🧹 REMOVE OLD OFFENCE UI

     Removes old controller-created DOM elements if they still
     exist from the previous architecture.

     Add additional OLD IDs here only if your old controller
     used different IDs.
  ============================================================ */

  UI.removeLegacyUI =
    function () {

      const legacyIds = [

        "offenceControl",

        "offence-control",

        "offenceButton",

        "offence-button",

        "offenceMenu",

        "offence-menu",

        "offencePanel",

        "offence-panel",

        "offenceAnalysisPanel"

      ];


      legacyIds.forEach(

        function (
          id
        ) {

          const element =

            document
              .getElementById(
                id
              );


          if (
            element
          ) {

            try {

              element.remove();

            }

            catch (
              err
            ) {

              console.warn(

                "⚠ Unable to remove legacy offence UI:",

                id,

                err

              );

            }

          }

        }

      );

    };


  /* ============================================================
     🎨 INJECT CSS
  ============================================================ */

  UI.injectStyles =
    function () {

      if (

        document
          .getElementById(
            "gg-offence-ui-v3-style"
          )

      ) {

        return;

      }


      const style =

        document
          .createElement(
            "style"
          );


      style.id =
        "gg-offence-ui-v3-style";


      style.textContent = `

        /* =====================================================
           OFFENCE CONTROL WRAPPER
        ===================================================== */

        #gg-offence-control {

          position: fixed;

          right: 16px;

          top: 155px;

          z-index: 10050;

          display: flex;

          flex-direction: column;

          align-items: flex-end;

          gap: 8px;

          font-family:
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            Arial,
            sans-serif;

          pointer-events: none;

        }


        /* =====================================================
           MAIN OFFENCE BUTTON
        ===================================================== */

        #gg-offence-main-button {

          pointer-events: auto;

          min-width: 112px;

          height: 42px;

          padding: 0 14px;

          border: none;

          border-radius: 10px;

          background: #ffffff;

          box-shadow:
            0 3px 12px
            rgba(
              0,
              0,
              0,
              0.22
            );

          color: #202124;

          font-size: 13px;

          font-weight: 700;

          letter-spacing: 0.3px;

          cursor: pointer;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 7px;

          user-select: none;

          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease,
            background 0.15s ease;

        }


        #gg-offence-main-button:hover {

          transform:
            translateY(-1px);

          box-shadow:
            0 5px 16px
            rgba(
              0,
              0,
              0,
              0.28
            );

        }


        #gg-offence-main-button.gg-active {

          background: #263238;

          color: #ffffff;

        }


        /* =====================================================
           PANEL
        ===================================================== */

        #gg-offence-analysis-panel {

          pointer-events: auto;

          width: 220px;

          padding: 0;

          overflow: hidden;

          background:
            rgba(
              255,
              255,
              255,
              0.98
            );

          border-radius: 12px;

          box-shadow:
            0 6px 24px
            rgba(
              0,
              0,
              0,
              0.28
            );

          opacity: 0;

          visibility: hidden;

          transform:
            translateY(-6px)
            scale(0.98);

          transform-origin:
            top right;

          transition:
            opacity 0.16s ease,
            transform 0.16s ease,
            visibility 0.16s ease;

        }


        #gg-offence-analysis-panel.gg-open {

          opacity: 1;

          visibility: visible;

          transform:
            translateY(0)
            scale(1);

        }


        /* =====================================================
           PANEL HEADER
        ===================================================== */

        .gg-offence-panel-header {

          display: flex;

          align-items: center;

          justify-content: space-between;

          padding: 12px 12px 10px 14px;

          border-bottom:
            1px solid
            rgba(
              0,
              0,
              0,
              0.08
            );

        }


        .gg-offence-panel-title {

          font-size: 13px;

          font-weight: 800;

          color: #263238;

          letter-spacing: 0.25px;

        }


        .gg-offence-header-close {

          width: 28px;

          height: 28px;

          padding: 0;

          border: none;

          border-radius: 50%;

          background: transparent;

          color: #546e7a;

          font-size: 17px;

          cursor: pointer;

        }


        .gg-offence-header-close:hover {

          background:
            rgba(
              0,
              0,
              0,
              0.07
            );

        }


        /* =====================================================
           STATUS
        ===================================================== */

        #gg-offence-status {

          padding: 8px 14px;

          font-size: 11px;

          line-height: 1.4;

          color: #607d8b;

          background: #f7f9fa;

          border-bottom:
            1px solid
            rgba(
              0,
              0,
              0,
              0.06
            );

        }


        /* =====================================================
           ACTIONS
        ===================================================== */

        .gg-offence-actions {

          padding: 9px;

          display: flex;

          flex-direction: column;

          gap: 7px;

        }


        .gg-offence-action {

          width: 100%;

          min-height: 40px;

          padding: 9px 12px;

          border: 1px solid
            rgba(
              0,
              0,
              0,
              0.08
            );

          border-radius: 9px;

          background: #ffffff;

          color: #263238;

          font-size: 13px;

          font-weight: 700;

          text-align: left;

          cursor: pointer;

          display: flex;

          align-items: center;

          gap: 9px;

          transition:
            background 0.15s ease,
            border-color 0.15s ease,
            transform 0.15s ease;

        }


        .gg-offence-action:hover {

          background: #f5f7f8;

          transform:
            translateX(-1px);

        }


        .gg-offence-action.gg-selected {

          background: #eceff1;

          border-color: #607d8b;

        }


        .gg-offence-action-icon {

          width: 22px;

          text-align: center;

          font-size: 16px;

        }


        /* =====================================================
           FOOTER
        ===================================================== */

        .gg-offence-panel-footer {

          padding: 9px;

          border-top:
            1px solid
            rgba(
              0,
              0,
              0,
              0.07
            );

        }


        #gg-offence-clear-button {

          color: #b71c1c;

        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (
          max-width: 700px
        ) {

          #gg-offence-control {

            right: 10px;

            top: 145px;

          }


          #gg-offence-analysis-panel {

            width: 205px;

          }


          #gg-offence-main-button {

            min-width: 104px;

          }

        }

      `;


      document
        .head
        .appendChild(
          style
        );

    };


  /* ============================================================
     🏗 CREATE UI
  ============================================================ */

  UI.createUI =
    function () {

      /* ========================================================
         PREVENT DUPLICATE UI
      ======================================================== */

      const existing =

        document
          .getElementById(
            "gg-offence-control"
          );


      if (
        existing
      ) {

        return existing;

      }


      /* ========================================================
         CONTROL WRAPPER
      ======================================================== */

      const control =

        document
          .createElement(
            "div"
          );


      control.id =
        "gg-offence-control";


      /* ========================================================
         MAIN BUTTON
      ======================================================== */

      const mainButton =

        document
          .createElement(
            "button"
          );


      mainButton.id =
        "gg-offence-main-button";


      mainButton.type =
        "button";


      mainButton.innerHTML =

        "<span>🚨</span>" +

        "<span>OFFENCE</span>";


      mainButton.title =
        "Open Offence Spatial Analysis";


      /* ========================================================
         PANEL
      ======================================================== */

      const panel =

        document
          .createElement(
            "div"
          );


      panel.id =
        "gg-offence-analysis-panel";


      panel.innerHTML = `

        <div class="gg-offence-panel-header">

          <div class="gg-offence-panel-title">

            🚨 OFFENCE ANALYSIS

          </div>

          <button
            type="button"
            id="gg-offence-header-close"
            class="gg-offence-header-close"
            title="Close"
          >

            ✕

          </button>

        </div>


        <div id="gg-offence-status">

          Ready for spatial analysis

        </div>


        <div class="gg-offence-actions">

          <button
            type="button"
            id="gg-offence-source-button"
            class="gg-offence-action"
          >

            <span class="gg-offence-action-icon">
              🏡
            </span>

            <span>
              SOURCE
            </span>

          </button>


          <button
            type="button"
            id="gg-offence-target-button"
            class="gg-offence-action"
          >

            <span class="gg-offence-action-icon">
              🎯
            </span>

            <span>
              TARGET
            </span>

          </button>

        </div>


        <div class="gg-offence-panel-footer">

          <button
            type="button"
            id="gg-offence-clear-button"
            class="gg-offence-action"
          >

            <span class="gg-offence-action-icon">
              🧹
            </span>

            <span>
              CLEAR
            </span>

          </button>

        </div>

      `;


      /* ========================================================
         ADD TO CONTROL
      ======================================================== */

      control
        .appendChild(
          mainButton
        );


      control
        .appendChild(
          panel
        );


      /* ========================================================
         ADD TO DOCUMENT
      ======================================================== */

      document
        .body
        .appendChild(
          control
        );


      /* ========================================================
         CACHE REFERENCES
      ======================================================== */

      UI.button =
        mainButton;


      UI.panel =
        panel;


      UI.statusElement =

        document
          .getElementById(
            "gg-offence-status"
          );


      UI.sourceButton =

        document
          .getElementById(
            "gg-offence-source-button"
          );


      UI.targetButton =

        document
          .getElementById(
            "gg-offence-target-button"
          );


      UI.clearButton =

        document
          .getElementById(
            "gg-offence-clear-button"
          );


      UI.closeButton =

        document
          .getElementById(
            "gg-offence-header-close"
          );


      return control;

    };


  /* ============================================================
     📊 SET STATUS
  ============================================================ */

  UI.setStatus =
    function (
      message
    ) {

      if (
        UI.statusElement
      ) {

        UI.statusElement.textContent =
          message;

      }

    };


  /* ============================================================
     🎯 SET ACTIVE MODE
  ============================================================ */

  UI.setActiveMode =
    function (
      mode
    ) {

      UI.activeMode =
        mode || null;


      if (
        UI.sourceButton
      ) {

        UI.sourceButton
          .classList
          .toggle(

            "gg-selected",

            mode ===
              "SOURCE"

          );

      }


      if (
        UI.targetButton
      ) {

        UI.targetButton
          .classList
          .toggle(

            "gg-selected",

            mode ===
              "TARGET"

          );

      }


      if (
        UI.button
      ) {

        UI.button
          .classList
          .toggle(

            "gg-active",

            !!mode

          );

      }

    };


  /* ============================================================
     📂 OPEN PANEL
  ============================================================ */

  UI.open =
    function () {

      if (
        !UI.panel
      ) {

        return;

      }


      UI.panelOpen =
        true;


      UI.panel
        .classList
        .add(
          "gg-open"
        );


      UI.refreshStatus();

    };


  /* ============================================================
     📁 CLOSE PANEL

     IMPORTANT:
     Closing panel does NOT clear polygons.

     User can close the menu and continue viewing analysis.
  ============================================================ */

  UI.close =
    function () {

      if (
        !UI.panel
      ) {

        return;

      }


      UI.panelOpen =
        false;


      UI.panel
        .classList
        .remove(
          "gg-open"
        );

    };


  /* ============================================================
     🔄 TOGGLE PANEL
  ============================================================ */

  UI.toggle =
    function () {

      if (
        UI.panelOpen
      ) {

        UI.close();

      }

      else {

        UI.open();

      }

    };


  /* ============================================================
     📊 REFRESH STATUS
  ============================================================ */

  UI.refreshStatus =
    function () {

      const Spatial =

        UI
          .getSpatialEngine();


      if (
        !Spatial
      ) {

        UI.setStatus(

          "SpatialEngine unavailable"

        );

        return;

      }


      if (
        Spatial.ready !==
        true
      ) {

        UI.setStatus(

          "Preparing offence spatial data..."

        );

        return;

      }


      const sources =

        Spatial
          .getSourceVillages?.()

        ||

        [];


      const targets =

        Spatial
          .getTargetRanges?.()

        ||

        [];


      UI.setStatus(

        sources.length +

        " source villages • " +

        targets
          .filter(
            target =>
              target.gisResolved ===
              true
          )
          .length +

        " mapped target ranges"

      );

    };


  /* ============================================================
     ⏳ ENSURE SPATIAL ENGINE READY
  ============================================================ */

  UI.ensureSpatialReady =
    async function () {

      const Spatial =

        UI
          .getSpatialEngine();


      if (
        !Spatial
      ) {

        console.error(

          "❌ OffenceSpatialEngine unavailable"

        );


        UI.setStatus(

          "SpatialEngine unavailable"

        );


        return false;

      }


      /* ========================================================
         ALREADY READY
      ======================================================== */

      if (

        Spatial.ready ===
          true

        &&

        Spatial
          .porSpatialIndex
          ?.size > 0

      ) {

        return true;

      }


      /* ========================================================
         START STORE-AWARE BUILD
      ======================================================== */

      if (

        typeof
        Spatial
          .waitForStoreAndBuild ===
        "function"

      ) {

        Spatial
          .waitForStoreAndBuild();

      }


      UI.setStatus(

        "Preparing offence spatial data..."

      );


      /* ========================================================
         WAIT FOR READY

         Maximum:
         120 × 250 ms = 30 seconds
      ======================================================== */

      for (
        let attempt = 0;
        attempt < 120;
        attempt++
      ) {

        if (

          Spatial.ready ===
            true

          &&

          Spatial
            .porSpatialIndex
            ?.size > 0

        ) {

          UI.refreshStatus();


          return true;

        }


        await new Promise(

          resolve =>

            setTimeout(
              resolve,
              250
            )

        );

      }


      console.warn(

        "⚠ OffenceSpatialEngine ready timeout"

      );


      UI.setStatus(

        "Offence spatial data not ready"

      );


      return false;

    };


  /* ============================================================
     🎨 ENSURE RENDERER READY
  ============================================================ */

  UI.ensureRendererReady =
    function () {

      const Renderer =

        UI
          .getSpatialRenderer();


      if (
        !Renderer
      ) {

        console.error(

          "❌ OffenceSpatialRenderer unavailable"

        );


        UI.setStatus(

          "SpatialRenderer unavailable"

        );


        return null;

      }


      /* ========================================================
         INITIALIZE RENDERER IF REQUIRED
      ======================================================== */

      if (
        Renderer.initialized !==
        true
      ) {

        try {

          Renderer.init();

        }

        catch (
          err
        ) {

          console.error(

            "❌ OffenceSpatialRenderer init failed:",

            err

          );


          UI.setStatus(

            "Renderer initialization failed"

          );


          return null;

        }

      }


      return Renderer;

    };


  /* ============================================================
     🏡 SHOW SOURCE MODE
  ============================================================ */

  UI.showSources =
    async function () {

      try {

        UI.setStatus(

          "Loading source villages..."

        );


        const ready =

          await UI
            .ensureSpatialReady();


        if (
          !ready
        ) {

          return [];

        }


        const Renderer =

          UI
            .ensureRendererReady();


        if (
          !Renderer
        ) {

          return [];

        }


        /* ======================================================
           AUTHORITATIVE SOURCE RENDER
        ====================================================== */

        const sources =

          Renderer
            .renderAllSources();


        UI.setActiveMode(

          "SOURCE"

        );


        const count =

          Array.isArray(
            sources
          )

            ? sources.length

            : 0;


        UI.setStatus(

          count +

          " source villages • click a village to view target ranges"

        );


        console.log(

          "🚨 Offence UI SOURCE mode:",

          count,

          "villages"

        );


        return sources;

      }

      catch (
        err
      ) {

        console.error(

          "❌ Offence SOURCE mode failed:",

          err

        );


        UI.setStatus(

          "Source analysis failed"

        );


        return [];

      }

    };


  /* ============================================================
     🎯 SHOW TARGET MODE
  ============================================================ */

  UI.showTargets =
    async function () {

      try {

        UI.setStatus(

          "Loading target ranges..."

        );


        const ready =

          await UI
            .ensureSpatialReady();


        if (
          !ready
        ) {

          return [];

        }


        const Renderer =

          UI
            .ensureRendererReady();


        if (
          !Renderer
        ) {

          return [];

        }


        /* ======================================================
           AUTHORITATIVE TARGET RENDER
        ====================================================== */

        const targets =

          Renderer
            .renderAllTargets();


        UI.setActiveMode(

          "TARGET"

        );


        const count =

          Array.isArray(
            targets
          )

            ? targets.length

            : 0;


        UI.setStatus(

          count +

          " target ranges • click a range to view source villages"

        );


        console.log(

          "🚨 Offence UI TARGET mode:",

          count,

          "ranges"

        );


        return targets;

      }

      catch (
        err
      ) {

        console.error(

          "❌ Offence TARGET mode failed:",

          err

        );


        UI.setStatus(

          "Target analysis failed"

        );


        return [];

      }

    };


  /* ============================================================
     🧹 CLEAR ANALYSIS
  ============================================================ */

  UI.clear =
    function () {

      try {

        const Renderer =

          UI
            .getSpatialRenderer();


        if (

          Renderer

          &&

          typeof
          Renderer.clear ===
          "function"

        ) {

          Renderer.clear();

        }


        UI.setActiveMode(

          null

        );


        UI.refreshStatus();


        console.log(

          "🧹 Offence spatial analysis cleared"

        );

      }

      catch (
        err
      ) {

        console.error(

          "❌ Offence clear failed:",

          err

        );

      }

    };


  /* ============================================================
     🔗 BIND EVENTS
  ============================================================ */

  UI.bindEvents =
    function () {

      /* ========================================================
         MAIN BUTTON
      ======================================================== */

      UI.button
        ?.addEventListener(

          "click",

          function (
            event
          ) {

            event
              .stopPropagation();


            UI.toggle();

          }

        );


      /* ========================================================
         SOURCE
      ======================================================== */

      UI.sourceButton
        ?.addEventListener(

          "click",

          function (
            event
          ) {

            event
              .stopPropagation();


            UI.showSources();

          }

        );


      /* ========================================================
         TARGET
      ======================================================== */

      UI.targetButton
        ?.addEventListener(

          "click",

          function (
            event
          ) {

            event
              .stopPropagation();


            UI.showTargets();

          }

        );


      /* ========================================================
         CLEAR
      ======================================================== */

      UI.clearButton
        ?.addEventListener(

          "click",

          function (
            event
          ) {

            event
              .stopPropagation();


            UI.clear();

          }

        );


      /* ========================================================
         CLOSE
      ======================================================== */

      UI.closeButton
        ?.addEventListener(

          "click",

          function (
            event
          ) {

            event
              .stopPropagation();


            UI.close();

          }

        );


      /* ========================================================
         PREVENT PANEL CLICK FROM PROPAGATING TO MAP
      ======================================================== */

      UI.panel
        ?.addEventListener(

          "click",

          function (
            event
          ) {

            event
              .stopPropagation();

          }

        );

    };


  /* ============================================================
     🚀 INITIALIZE
  ============================================================ */

  UI.init =
    function () {

      if (
        UI.initialized
      ) {

        return UI;

      }


      /* ========================================================
         REMOVE OLD UI
      ======================================================== */

      UI.removeLegacyUI();


      /* ========================================================
         CSS
      ======================================================== */

      UI.injectStyles();


      /* ========================================================
         CREATE UI
      ======================================================== */

      UI.createUI();


      /* ========================================================
         BIND EVENTS
      ======================================================== */

      UI.bindEvents();


      /* ========================================================
         INITIALIZE RENDERER

         This builds GIS indexes but renders nothing.
      ======================================================== */

      const Renderer =

        UI
          .getSpatialRenderer();


      if (

        Renderer

        &&

        Renderer.initialized !==
        true

      ) {

        try {

          Renderer.init();

        }

        catch (
          err
        ) {

          console.warn(

            "⚠ OffenceSpatialRenderer startup init delayed:",

            err

          );

        }

      }


      /* ========================================================
         ENSURE STORE-AWARE SPATIAL BUILD

         Does NOT render polygons.

         SpatialEngine handles its own wait lifecycle.
      ======================================================== */

      const Spatial =

        UI
          .getSpatialEngine();


      if (

        Spatial

        &&

        typeof
        Spatial
          .waitForStoreAndBuild ===
        "function"

      ) {

        Spatial
          .waitForStoreAndBuild();

      }


      /* ========================================================
         READY
      ======================================================== */

      UI.initialized =
        true;


      UI.ready =
        true;


      UI.refreshStatus();


      console.log(

        "🚨 OffenceUIController Ready",

        {

          version:
            UI.VERSION,

          initialized:
            UI.initialized,

          ready:
            UI.ready

        }

      );


      return UI;

    };


  /* ============================================================
     📊 STATS
  ============================================================ */

  UI.getStats =
    function () {

      const Spatial =

        UI
          .getSpatialEngine();


      const Renderer =

        UI
          .getSpatialRenderer();


      return {

        version:
          UI.VERSION,

        initialized:
          UI.initialized,

        ready:
          UI.ready,

        panelOpen:
          UI.panelOpen,

        activeMode:
          UI.activeMode,

        spatialReady:
          Spatial?.ready === true,

        porCount:
          Spatial
            ?.porSpatialIndex
            ?.size

          ||

          0,

        sourceVillages:
          Spatial
            ?.getSourceVillages
            ?.()
            ?.length

          ||

          0,

        targetRanges:
          Spatial
            ?.getTargetRanges
            ?.()
            ?.length

          ||

          0,

        rendererReady:
          Renderer?.ready === true

      };

    };


  /* ============================================================
     🔥 COMPATIBILITY ALIAS

     Your SpatialRenderer.showCases() currently checks:

         GG.Offence.UI.showSpatialCases()

     Keep existing GG.Offence.UI untouched if another module
     already owns it.

     We only expose the controller separately.
  ============================================================ */

  GG.Offence.UIController =
    UI;


  /* ============================================================
     🚀 AUTO INIT

     DOM only.

     Does not render SOURCE or TARGET polygons.
  ============================================================ */

  function autoInit() {

    try {

      UI.init();

    }

    catch (
      err
    ) {

      console.error(

        "❌ OffenceUIController initialization failed:",

        err

      );

    }

  }


  if (
    document.readyState ===
    "loading"
  ) {

    document
      .addEventListener(

        "DOMContentLoaded",

        autoInit,

        {
          once:
            true
        }

      );

  }

  else {

    setTimeout(

      autoInit,

      0

    );

  }


})();
