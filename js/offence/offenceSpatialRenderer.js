/* ============================================================
   🚨 GREENGUARD OFFENCE SPATIAL RENDERER
   File:
   js/offence/offenceSpatialRenderer.js

   Version:
   2.0.0

   PURPOSE
   ------------------------------------------------------------
   Leaflet rendering layer for Offence Spatial Analysis.

   Architecture:

   OffenceDataLoader
        ↓
   OffenceStore
        ↓
   OffenceSpatialEngine
        ↓
   OffenceSpatialRenderer
        ↓
   Leaflet Map


   ============================================================
   CORE INTERACTION DESIGN
   ============================================================


   SOURCE MODE
   ------------------------------------------------------------

   OFFENCE → SOURCE
        ↓
   Render ALL Source Villages
        ↓
   Parent Source Layer remains permanently interactive
        ↓
   Click Source Village A
        ↓
   Highlight Source Village A
        ↓
   Render ALL Target Ranges related to Source A
        ↓
   Click Related Target
        ↓
   Show Related POR Cases


   Click Source Village B
        ↓
   Remove previous Source selection
        ↓
   Remove previous related Target polygons
        ↓
   Keep ALL parent Source polygons
        ↓
   Highlight Source Village B
        ↓
   Render ALL Target Ranges related to Source B


   IMPORTANT:

   Parent Source polygons are NEVER destroyed during
   SOURCE-mode drill-down.

   This guarantees:

   - Tooltip continues working
   - Mouseover continues working
   - Every Source polygon remains clickable
   - User can move Source A → Source B → Source C
     without reloading the application


   ============================================================


   TARGET MODE
   ------------------------------------------------------------

   OFFENCE → TARGET
        ↓
   Render ALL Target Ranges
        ↓
   Parent Target Layer remains permanently interactive
        ↓
   Click Target Range A
        ↓
   Highlight Target Range A
        ↓
   Render ALL Source Villages related to Target A
        ↓
   Click Related Source
        ↓
   Show Related POR Cases


   Click Target Range B
        ↓
   Remove previous Target selection
        ↓
   Remove previous related Source polygons
        ↓
   Keep ALL parent Target polygons
        ↓
   Highlight Target Range B
        ↓
   Render ALL Source Villages related to Target B


   IMPORTANT:

   Parent Target polygons are NEVER destroyed during
   TARGET-mode drill-down.


   ============================================================
   LAYER ARCHITECTURE
   ============================================================

   Five independent Leaflet layer groups are used.


   1. parentSourceLayer

      Contains:
      ALL Source Village polygons

      Used in:
      SOURCE mode

      Lifecycle:
      Created when SOURCE button is clicked.
      Remains intact while different Source villages
      are selected.


   2. parentTargetLayer

      Contains:
      ALL Target Range polygons

      Used in:
      TARGET mode

      Lifecycle:
      Created when TARGET button is clicked.
      Remains intact while different Target ranges
      are selected.


   3. relatedSourceLayer

      Contains:
      Source Villages related to the currently
      selected Target Range.

      Used in:
      TARGET mode drill-down.


   4. relatedTargetLayer

      Contains:
      Target Ranges related to the currently
      selected Source Village.

      Used in:
      SOURCE mode drill-down.


   5. selectionLayer

      Contains:
      Visual highlight of currently selected
      parent Source or Target polygon.

      IMPORTANT:
      Selection layer is VISUAL ONLY.

      It must NEVER intercept pointer events.


   ============================================================
   MODE TRANSITIONS
   ============================================================

   SOURCE BUTTON
        ↓
   Clear complete previous spatial state
        ↓
   mode = SOURCE
        ↓
   Render ALL parent Sources


   TARGET BUTTON
        ↓
   Clear complete previous spatial state
        ↓
   mode = TARGET
        ↓
   Render ALL parent Targets


   SOURCE MODE:
   Source A → Target(s)
   Source B → fresh Target(s)
   Source C → fresh Target(s)


   TARGET MODE:
   Target A → Source(s)
   Target B → fresh Source(s)
   Target C → fresh Source(s)


============================================================ */

(function () {

  "use strict";


  /* ============================================================
     🌐 GLOBAL NAMESPACE
  ============================================================ */

  window.GG =
    window.GG ||
    {};


  window.GG.Offence =
    window.GG.Offence ||
    {};


  const Offence =
    window.GG.Offence;


  /* ============================================================
     🚨 RENDERER OBJECT
  ============================================================ */

  const Renderer = {

    VERSION:
      "2.0.0",


    initialized:
      false,


    ready:
      false,


    /* ==========================================================
       CURRENT MODE

       null
       SOURCE
       TARGET
    ========================================================== */

    mode:
      null,


    /* ==========================================================
       CURRENT SELECTION STATE
    ========================================================== */

    selectedSourceId:
      null,


    selectedTargetKey:
      null,


    /* ==========================================================
       LEAFLET MAP REFERENCE
    ========================================================== */

    map:
      null,


    /* ==========================================================
       PERMANENT PARENT LAYERS
    ========================================================== */


    /*
     * SOURCE MODE
     *
     * Contains ALL source villages.
     *
     * This layer MUST remain untouched when a source
     * village is selected.
     *
     * This is the main fix for:
     *
     * "Polygon clickable only once"
     *
     * because selecting one source must not destroy
     * or recreate all other source polygons.
     */

    parentSourceLayer:
      null,


    /*
     * TARGET MODE
     *
     * Contains ALL target ranges.
     *
     * This layer MUST remain untouched when a target
     * range is selected.
     */

    parentTargetLayer:
      null,


    /* ==========================================================
       RELATIONSHIP / DRILL-DOWN LAYERS
    ========================================================== */


    /*
     * TARGET MODE:
     *
     * Selected Target
     *      ↓
     * Related Source Villages
     *
     * These polygons are clickable so the user can reach
     * the related POR cases.
     */

    relatedSourceLayer:
      null,


    /*
     * SOURCE MODE:
     *
     * Selected Source
     *      ↓
     * Related Target Ranges
     *
     * These polygons are clickable so the user can reach
     * the related POR cases.
     */

    relatedTargetLayer:
      null,


    /* ==========================================================
       SELECTION LAYER
    ========================================================== */


    /*
     * Contains the selected Source or Target highlight.
     *
     * IMPORTANT:
     *
     * This is a visual overlay only.
     *
     * pointer-events must be disabled at pane level.
     *
     * Otherwise the duplicate selected polygon can sit above
     * the original parent polygon and intercept mouse events.
     */

    selectionLayer:
      null,


    /* ==========================================================
       FEATURE INDEXES

       These indexes contain RAW GeoJSON features.

       They avoid repeatedly scanning all GIS data whenever
       the user clicks a polygon.
    ========================================================== */


    /*
     * Key:
     *
     * VILLAGE_CODE::NORMALIZED_VILLAGE_NAME
     *
     * Example:
     *
     * 307221N091::SALKUMAR
     */

    villageFeatureIndex:
      new Map(),


    /*
     * Key:
     *
     * NORMALIZED_RANGE_NAME
     *
     * Example:
     *
     * HAMILTONGANJ
     *
     * One Range may contain multiple GIS polygons.
     */

    rangeFeatureIndex:
      new Map(),


    /* ==========================================================
       RENDERED PARENT LAYER INDEXES
    ========================================================== */


    /*
     * Permanent SOURCE polygon index.
     *
     * Key:
     * canonical Source Village ID
     */

    renderedParentSourceLayers:
      new Map(),


    /*
     * Permanent TARGET polygon index.
     *
     * Key:
     * normalized Target Range name
     */

    renderedParentTargetLayers:
      new Map(),


    /* ==========================================================
       RENDERED RELATED LAYER INDEXES
    ========================================================== */


    /*
     * Current related Sources rendered after
     * selecting a Target.
     */

    renderedRelatedSourceLayers:
      new Map(),


    /*
     * Current related Targets rendered after
     * selecting a Source.
     */

    renderedRelatedTargetLayers:
      new Map(),


    /* ==========================================================
       CURRENT DATA STATE
    ========================================================== */


    /*
     * In SOURCE mode:
     *
     * Holds all parent Source Villages.
     *
     * In TARGET drill-down:
     *
     * May hold current related Source Villages.
     *
     * Later functions will keep parent and related data
     * separated where required.
     */

    currentSources:
      [],


    /*
     * In TARGET mode:
     *
     * Holds all parent Target Ranges.
     *
     * In SOURCE drill-down:
     *
     * May hold current related Target Ranges.
     */

    currentTargets:
      [],


    /*
     * POR cases for currently selected
     * Source ↔ Target relationship.
     */

    currentCases:
      [],


    /* ==========================================================
       CONFIGURATION
    ========================================================== */

    config: {


      /* ========================================================
         LEAFLET PANES
      ======================================================== */


      /*
       * Permanent Source Village polygons.
       */

      parentSourcePane:
        "offenceParentSourcePane",


      /*
       * Permanent Target Range polygons.
       */

      parentTargetPane:
        "offenceParentTargetPane",


      /*
       * Related Source polygons.
       *
       * TARGET → Sources
       */

      relatedSourcePane:
        "offenceRelatedSourcePane",


      /*
       * Related Target polygons.
       *
       * SOURCE → Targets
       */

      relatedTargetPane:
        "offenceRelatedTargetPane",


      /*
       * Selected polygon visual highlight.
       */

      selectionPane:
        "offenceSelectionPane",


      /* ========================================================
         PANE Z-INDEX
      ======================================================== */


      /*
       * Relationship polygons are placed below the active
       * parent polygons.
       *
       * This prevents a large related polygon from blocking
       * clicks on parent polygons.
       */

      relatedSourcePaneZIndex:
        450,


      relatedTargetPaneZIndex:
        450,


      /*
       * Parent polygons remain above relationship polygons.
       *
       * Therefore:
       *
       * SOURCE mode
       * → every Source Village stays clickable
       *
       * TARGET mode
       * → every Target Range stays clickable
       */

      parentSourcePaneZIndex:
        470,


      parentTargetPaneZIndex:
        470,


      /*
       * Selection is visually highest.
       *
       * Its pointer-events will be NONE.
       *
       * Therefore it cannot block interaction.
       */

      selectionPaneZIndex:
        480,


      /* ========================================================
         SOURCE HEAT OPACITY
      ======================================================== */

      sourceFillOpacityMin:
        0.12,


      sourceFillOpacityMax:
        0.68,


      /* ========================================================
         TARGET HEAT OPACITY
      ======================================================== */

      targetFillOpacityMin:
        0.12,


      targetFillOpacityMax:
        0.68

    }

  };


  /* ============================================================
     🧹 NORMALIZE TEXT
  ============================================================ */

  Renderer.normalizeText =
    function (
      value
    ) {

      return String(
        value ||
        ""
      )
      .trim()
      .toUpperCase()
      .replace(
        /[^A-Z0-9]+/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();

    };


  /* ============================================================
     🏡 GET VILLAGE IDENTITY FROM FEATURE

     Canonical format:

     VILLAGE_CODE::NORMALIZED_VILLAGE_NAME

     Example:

     307221N091::SALKUMAR
  ============================================================ */

  Renderer.getVillageFeatureIdentity =
    function (
      feature
    ) {

      const p =
        feature
          ?.properties
        ||
        {};


      const code =

        p.Village_Code ||

        p.Vill_LGD ||

        p.Vill_Code ||

        p.village_code ||

        "";


      const name =

        p.Village_Name ||

        p.Vill_name ||

        p.Vill_Name ||

        p.village_name ||

        p.name ||

        "";


      const cleanName =
        Renderer.normalizeText(
          name
        );


      if (
        !code ||
        !cleanName
      ) {

        return null;

      }


      return (

        String(
          code
        )
        .trim()

        +

        "::"

        +

        cleanName

      );

    };


  /* ============================================================
     🌲 GET RANGE NAME FROM GIS FEATURE

     Supports current GreenGuard GIS property variants.
  ============================================================ */

  Renderer.getRangeNameFromFeature =
    function (
      feature
    ) {

      const p =
        feature
          ?.properties
        ||
        {};


      return (

        p.range ||

        p.Range ||

        p.RANGE ||

        p.rangeName ||

        p.Range_Name ||

        p.RANGE_NAME ||

        p.range_name ||

        ""

      );

    };


  /* ============================================================
     🗺 GET LEAFLET MAP
  ============================================================ */

  Renderer.getMap =
    function () {

      /*
       * Return cached map when available.
       */

      if (
        Renderer.map
      ) {

        return Renderer.map;

      }


      /*
       * GreenGuard currently exposes the Leaflet map
       * through window.map.
       */

      if (
        window.map
      ) {

        Renderer.map =
          window.map;


        return Renderer.map;

      }


      return null;

    };


  /* ============================================================
     🧠 GET SPATIAL ENGINE
  ============================================================ */

  Renderer.getSpatialEngine =
    function () {

      return (

        window.GG
          ?.Offence
          ?.SpatialEngine

        ||

        null

      );

    };/* ============================================================
   🏗 ENSURE LEAFLET MAP PANE

   PURPOSE
   ------------------------------------------------------------
   Creates a Leaflet pane if it does not already exist.

   Supports:

   - Custom z-index
   - Custom pointer-events behavior

   POINTER EVENT DESIGN
   ------------------------------------------------------------

   Parent panes:
      pointerEvents = "auto"

   Related panes:
      pointerEvents = "auto"

   Selection pane:
      pointerEvents = "none"

   IMPORTANT
   ------------------------------------------------------------
   The Selection pane is visual-only.

   This prevents the highlighted duplicate polygon from
   blocking mouseover, tooltip, and click events on the
   original interactive polygon underneath it.
============================================================ */

Renderer.ensurePane =
  function (
    paneName,
    zIndex,
    pointerEvents = "auto"
  ) {

    /* ========================================================
       GET MAP
    ======================================================== */

    const map =
      Renderer.getMap();


    if (
      !map
    ) {

      return null;

    }


    /* ========================================================
       GET EXISTING PANE
    ======================================================== */

    let pane =
      map.getPane(
        paneName
      );


    /* ========================================================
       CREATE PANE IF MISSING
    ======================================================== */

    if (
      !pane
    ) {

      pane =
        map.createPane(
          paneName
        );

    }


    /* ========================================================
       SET Z-INDEX
    ======================================================== */

    pane.style.zIndex =
      String(
        zIndex
      );


    /* ========================================================
       SET POINTER EVENT BEHAVIOR
    ======================================================== */

    pane.style.pointerEvents =
      pointerEvents;


    return pane;

  };


/* ============================================================
   🏗 CREATE LEAFLET LAYERS

   NEW 5-LAYER ARCHITECTURE
   ------------------------------------------------------------

   1. parentSourceLayer
      ALL source polygons in SOURCE mode.

   2. parentTargetLayer
      ALL target polygons in TARGET mode.

   3. relatedSourceLayer
      Sources related to selected Target.

   4. relatedTargetLayer
      Targets related to selected Source.

   5. selectionLayer
      Visual selected polygon highlight.


   IMPORTANT
   ------------------------------------------------------------

   All layer groups remain attached to the map.

   clearLayers() controls their contents.

   This avoids repeatedly:

      add layer
      remove layer
      recreate layer

   during every polygon click.


   INTERACTION DESIGN
   ------------------------------------------------------------

   SOURCE MODE:

   parentSourceLayer
      → interactive

   relatedTargetLayer
      → interactive for Source → Target → Cases

   selectionLayer
      → visual only


   TARGET MODE:

   parentTargetLayer
      → interactive

   relatedSourceLayer
      → interactive for Target → Source → Cases

   selectionLayer
      → visual only
============================================================ */

Renderer.createLayers =
  function () {

    /* ========================================================
       GET MAP
    ======================================================== */

    const map =
      Renderer.getMap();


    /* ========================================================
       VALIDATE LEAFLET
    ======================================================== */

    if (
      !map ||
      typeof L ===
        "undefined"
    ) {

      console.warn(
        "⚠ OffenceSpatialRenderer.createLayers: Leaflet map unavailable"
      );


      return false;

    }


    /* ========================================================
       CREATE PARENT SOURCE PANE

       SOURCE mode:
       ALL Source Villages.

       Must remain interactive.
    ======================================================== */

    Renderer.ensurePane(

      Renderer
        .config
        .parentSourcePane,

      Renderer
        .config
        .parentSourcePaneZIndex,

      "auto"

    );


    /* ========================================================
       CREATE PARENT TARGET PANE

       TARGET mode:
       ALL Target Ranges.

       Must remain interactive.
    ======================================================== */

    Renderer.ensurePane(

      Renderer
        .config
        .parentTargetPane,

      Renderer
        .config
        .parentTargetPaneZIndex,

      "auto"

    );


    /* ========================================================
       CREATE RELATED SOURCE PANE

       TARGET mode drill-down:

       Target
          ↓
       Related Sources

       Related Sources remain interactive because clicking
       one must open the Source ↔ Target case relationship.
    ======================================================== */

    Renderer.ensurePane(

      Renderer
        .config
        .relatedSourcePane,

      Renderer
        .config
        .relatedSourcePaneZIndex,

      "auto"

    );


    /* ========================================================
       CREATE RELATED TARGET PANE

       SOURCE mode drill-down:

       Source
          ↓
       Related Targets

       Related Targets remain interactive because clicking
       one must open the Source ↔ Target case relationship.
    ======================================================== */

    Renderer.ensurePane(

      Renderer
        .config
        .relatedTargetPane,

      Renderer
        .config
        .relatedTargetPaneZIndex,

      "auto"

    );


    /* ========================================================
       CREATE SELECTION PANE

       VISUAL ONLY.

       pointerEvents = none

       This is critical.

       The selected duplicate polygon is rendered here.
       It must NEVER block the original parent polygon.
    ======================================================== */

    Renderer.ensurePane(

      Renderer
        .config
        .selectionPane,

      Renderer
        .config
        .selectionPaneZIndex,

      "none"

    );


    /* ========================================================
       CREATE PARENT SOURCE LAYER
    ======================================================== */

    Renderer.parentSourceLayer =

      Renderer.parentSourceLayer

      ||

      L.layerGroup();


    /* ========================================================
       CREATE PARENT TARGET LAYER
    ======================================================== */

    Renderer.parentTargetLayer =

      Renderer.parentTargetLayer

      ||

      L.layerGroup();


    /* ========================================================
       CREATE RELATED SOURCE LAYER
    ======================================================== */

    Renderer.relatedSourceLayer =

      Renderer.relatedSourceLayer

      ||

      L.layerGroup();


    /* ========================================================
       CREATE RELATED TARGET LAYER
    ======================================================== */

    Renderer.relatedTargetLayer =

      Renderer.relatedTargetLayer

      ||

      L.layerGroup();


    /* ========================================================
       CREATE SELECTION LAYER
    ======================================================== */

    Renderer.selectionLayer =

      Renderer.selectionLayer

      ||

      L.layerGroup();


    /* ========================================================
       ATTACH PARENT SOURCE LAYER TO MAP

       Do not attach twice.
    ======================================================== */

    if (
      !map.hasLayer(
        Renderer.parentSourceLayer
      )
    ) {

      Renderer
        .parentSourceLayer
        .addTo(
          map
        );

    }


    /* ========================================================
       ATTACH PARENT TARGET LAYER TO MAP
    ======================================================== */

    if (
      !map.hasLayer(
        Renderer.parentTargetLayer
      )
    ) {

      Renderer
        .parentTargetLayer
        .addTo(
          map
        );

    }


    /* ========================================================
       ATTACH RELATED SOURCE LAYER TO MAP
    ======================================================== */

    if (
      !map.hasLayer(
        Renderer.relatedSourceLayer
      )
    ) {

      Renderer
        .relatedSourceLayer
        .addTo(
          map
        );

    }


    /* ========================================================
       ATTACH RELATED TARGET LAYER TO MAP
    ======================================================== */

    if (
      !map.hasLayer(
        Renderer.relatedTargetLayer
      )
    ) {

      Renderer
        .relatedTargetLayer
        .addTo(
          map
        );

    }


    /* ========================================================
       ATTACH SELECTION LAYER TO MAP
    ======================================================== */

    if (
      !map.hasLayer(
        Renderer.selectionLayer
      )
    ) {

      Renderer
        .selectionLayer
        .addTo(
          map
        );

    }


    /* ========================================================
       SUCCESS
    ======================================================== */

    return true;

  };


/* ============================================================
   🔎 VERIFY LAYER ARCHITECTURE

   Internal helper.

   Useful for debugging the five-layer lifecycle.
============================================================ */

Renderer.getLayerState =
  function () {

    const map =
      Renderer.getMap();


    return {

      mapAvailable:
        !!map,


      parentSourceLayer:

        !!Renderer
          .parentSourceLayer,


      parentSourceOnMap:

        !!(
          map &&
          Renderer.parentSourceLayer &&
          map.hasLayer(
            Renderer.parentSourceLayer
          )
        ),


      parentTargetLayer:

        !!Renderer
          .parentTargetLayer,


      parentTargetOnMap:

        !!(
          map &&
          Renderer.parentTargetLayer &&
          map.hasLayer(
            Renderer.parentTargetLayer
          )
        ),


      relatedSourceLayer:

        !!Renderer
          .relatedSourceLayer,


      relatedSourceOnMap:

        !!(
          map &&
          Renderer.relatedSourceLayer &&
          map.hasLayer(
            Renderer.relatedSourceLayer
          )
        ),


      relatedTargetLayer:

        !!Renderer
          .relatedTargetLayer,


      relatedTargetOnMap:

        !!(
          map &&
          Renderer.relatedTargetLayer &&
          map.hasLayer(
            Renderer.relatedTargetLayer
          )
        ),


      selectionLayer:

        !!Renderer
          .selectionLayer,


      selectionOnMap:

        !!(
          map &&
          Renderer.selectionLayer &&
          map.hasLayer(
            Renderer.selectionLayer
          )
        )

    };

  };

 /* ============================================================
   🏡 BUILD VILLAGE FEATURE INDEX

   PURPOSE
   ------------------------------------------------------------
   Builds a fast lookup between canonical Source Village IDs
   and their raw GeoJSON polygon features.

   INDEX KEY
   ------------------------------------------------------------

   VILLAGE_CODE::NORMALIZED_VILLAGE_NAME

   Example:

   307221N091::SALKUMAR


   SOURCE PRIORITY
   ------------------------------------------------------------

   1. window.__villageBoundaryGeoJSON
   2. window.villageBoundaryGeoJSON
   3. Existing Leaflet villageBoundaryLayer


   IMPORTANT
   ------------------------------------------------------------
   One village may theoretically contain multiple polygon
   features.

   Therefore each index value is an ARRAY of features.
============================================================ */

Renderer.buildVillageFeatureIndex =
  function () {

    /* ========================================================
       RESET EXISTING INDEX
    ======================================================== */

    Renderer
      .villageFeatureIndex
      .clear();


    let features =
      [];


    /* ========================================================
       PRIMARY RAW GEOJSON SOURCE
    ======================================================== */

    const raw =

      window.__villageBoundaryGeoJSON

      ||

      window.villageBoundaryGeoJSON

      ||

      null;


    if (
      Array.isArray(
        raw
          ?.features
      )
    ) {

      features =
        raw.features;

    }


    /* ========================================================
       FALLBACK:
       EXISTING LEAFLET VILLAGE BOUNDARY LAYER
    ======================================================== */

    if (
      !features.length &&
      window.villageBoundaryLayer
        ?.getLayers
    ) {

      features =

        window
          .villageBoundaryLayer
          .getLayers()

          .map(

            layer =>

              layer.feature

          )

          .filter(
            Boolean
          );

    }


    /* ========================================================
       BUILD INDEX
    ======================================================== */

    features.forEach(

      feature => {

        const id =
          Renderer
            .getVillageFeatureIdentity(
              feature
            );


        if (
          !id
        ) {

          return;

        }


        /* ----------------------------------------------------
           CREATE FEATURE GROUP IF FIRST OCCURRENCE
        ---------------------------------------------------- */

        if (
          !Renderer
            .villageFeatureIndex
            .has(
              id
            )
        ) {

          Renderer
            .villageFeatureIndex
            .set(
              id,
              []
            );

        }


        /* ----------------------------------------------------
           ADD FEATURE TO VILLAGE GROUP
        ---------------------------------------------------- */

        Renderer
          .villageFeatureIndex
          .get(
            id
          )
          .push(
            feature
          );

      }

    );


    return Renderer
      .villageFeatureIndex
      .size;

  };


/* ============================================================
   🌲 BUILD RANGE FEATURE INDEX

   PURPOSE
   ------------------------------------------------------------
   Builds a fast lookup between normalized Target Range names
   and their GIS polygon features.

   DATA SOURCE
   ------------------------------------------------------------

   window.allGISFeatures


   INDEX KEY
   ------------------------------------------------------------

   NORMALIZED_RANGE_NAME

   Example:

   HAMILTONGANJ


   IMPORTANT
   ------------------------------------------------------------
   One Range may contain multiple GIS features.

   All matching features are stored together.
============================================================ */

Renderer.buildRangeFeatureIndex =
  function () {

    /* ========================================================
       RESET EXISTING INDEX
    ======================================================== */

    Renderer
      .rangeFeatureIndex
      .clear();


    const features =

      Array.isArray(
        window.allGISFeatures
      )

      ?

      window.allGISFeatures

      :

      [];


    /* ========================================================
       BUILD RANGE INDEX
    ======================================================== */

    features.forEach(

      feature => {

        const rangeName =
          Renderer
            .getRangeNameFromFeature(
              feature
            );


        const key =
          Renderer
            .normalizeText(
              rangeName
            );


        if (
          !key
        ) {

          return;

        }


        /* ----------------------------------------------------
           CREATE RANGE FEATURE GROUP
        ---------------------------------------------------- */

        if (
          !Renderer
            .rangeFeatureIndex
            .has(
              key
            )
        ) {

          Renderer
            .rangeFeatureIndex
            .set(
              key,
              []
            );

        }


        /* ----------------------------------------------------
           ADD GIS FEATURE
        ---------------------------------------------------- */

        Renderer
          .rangeFeatureIndex
          .get(
            key
          )
          .push(
            feature
          );

      }

    );


    return Renderer
      .rangeFeatureIndex
      .size;

  };


/* ============================================================
   🔥 CALCULATE HEAT INTENSITY

   RETURNS
   ------------------------------------------------------------

   Number between:

   0 → 1


   SCALING
   ------------------------------------------------------------

   Square-root scaling is used.

   This prevents one very high offence-count polygon from
   visually suppressing all lower-count polygons.
============================================================ */

Renderer.getIntensity =
  function (
    count,
    maxCount
  ) {

    const value =
      Number(
        count
      )
      ||
      0;


    const max =
      Number(
        maxCount
      )
      ||
      1;


    if (
      value <= 0
    ) {

      return 0;

    }


    return Math.min(

      1,

      Math.sqrt(

        value /
        max

      )

    );

  };


/* ============================================================
   🎨 SOURCE HEAT STYLE

   Used for:

   - Parent Source Villages
   - Related Source Villages
   - Selected Source highlight
============================================================ */

Renderer.getSourceStyle =
  function (
    count,
    maxCount,
    selected
  ) {

    const intensity =
      Renderer.getIntensity(

        count,

        maxCount

      );


    const opacityMin =
      Renderer
        .config
        .sourceFillOpacityMin;


    const opacityMax =
      Renderer
        .config
        .sourceFillOpacityMax;


    const fillOpacity =

      opacityMin

      +

      (
        (
          opacityMax -
          opacityMin
        )

        *

        intensity
      );


    return {

      color:

        selected

        ?

        "#7F1D1D"

        :

        "#9F1239",


      weight:

        selected

        ?

        3

        :

        1.4,


      opacity:
        0.95,


      fillColor:

        selected

        ?

        "#B91C1C"

        :

        "#BE123C",


      fillOpacity:

        selected

        ?

        0.72

        :

        fillOpacity

    };

  };


/* ============================================================
   🎨 TARGET HEAT STYLE

   Used for:

   - Parent Target Ranges
   - Related Target Ranges
   - Selected Target highlight
============================================================ */

Renderer.getTargetStyle =
  function (
    count,
    maxCount,
    selected
  ) {

    const intensity =
      Renderer.getIntensity(

        count,

        maxCount

      );


    const opacityMin =
      Renderer
        .config
        .targetFillOpacityMin;


    const opacityMax =
      Renderer
        .config
        .targetFillOpacityMax;


    const fillOpacity =

      opacityMin

      +

      (
        (
          opacityMax -
          opacityMin
        )

        *

        intensity
      );


    return {

      color:

        selected

        ?

        "#1E3A8A"

        :

        "#1D4ED8",


      weight:

        selected

        ?

        3

        :

        1.6,


      opacity:
        0.95,


      fillColor:

        selected

        ?

        "#2563EB"

        :

        "#3B82F6",


      fillOpacity:

        selected

        ?

        0.68

        :

        fillOpacity

    };

  };


/* ============================================================
   🏷 CREATE SOURCE TOOLTIP

   Used for:

   - Parent Source polygons
   - Related Source polygons
============================================================ */

Renderer.createSourceTooltip =
  function (
    source
  ) {

    return `

      <div
        style="
          font-family:Segoe UI;
          min-width:180px;
          line-height:1.5;
        "
      >

        <div
          style="
            font-size:14px;
            font-weight:700;
            margin-bottom:5px;
          "
        >

          🏡 ${source.name}

        </div>


        <div>

          <b>Offence Cases:</b>

          ${source.offenceCount || 0}

        </div>


        <div>

          <b>Target Ranges:</b>

          ${
            source
              .targetRanges
              ?.length
            ||
            0
          }

        </div>


        <div>

          <b>Village Code:</b>

          ${source.villageCode || "-"}

        </div>

      </div>

    `;

  };


/* ============================================================
   🏷 CREATE TARGET TOOLTIP

   Used for:

   - Parent Target polygons
   - Related Target polygons
============================================================ */

Renderer.createTargetTooltip =
  function (
    target
  ) {

    return `

      <div
        style="
          font-family:Segoe UI;
          min-width:180px;
          line-height:1.5;
        "
      >

        <div
          style="
            font-size:14px;
            font-weight:700;
            margin-bottom:5px;
          "
        >

          🎯 ${target.name}

        </div>


        <div>

          <b>Offence Cases:</b>

          ${target.offenceCount || 0}

        </div>


        <div>

          <b>Source Villages:</b>

          ${
            target
              .sourceVillageIds
              ?.length
            ||
            0
          }

        </div>

      </div>

    `;

  };


/* ============================================================
   🧹 CLEAR PARENT SOURCE POLYGONS

   IMPORTANT
   ------------------------------------------------------------

   DO NOT call this when selecting another Source Village.

   This function is used only when:

   - Switching away from SOURCE mode
   - Full Renderer.clear()
   - Rebuilding the complete SOURCE parent heatmap


   SOURCE DRILL-DOWN
   ------------------------------------------------------------

   Source A
      ↓
   Source B

   MUST NOT call this function.

   All parent Source polygons must remain interactive.
============================================================ */

Renderer.clearParentSources =
  function () {

    Renderer
      .parentSourceLayer
      ?.clearLayers?.();


    Renderer
      .renderedParentSourceLayers
      .clear();

  };


/* ============================================================
   🧹 CLEAR PARENT TARGET POLYGONS

   IMPORTANT
   ------------------------------------------------------------

   DO NOT call this when selecting another Target Range.

   Used only when:

   - Switching away from TARGET mode
   - Full Renderer.clear()
   - Rebuilding complete TARGET parent heatmap
============================================================ */

Renderer.clearParentTargets =
  function () {

    Renderer
      .parentTargetLayer
      ?.clearLayers?.();


    Renderer
      .renderedParentTargetLayers
      .clear();

  };


/* ============================================================
   🧹 CLEAR RELATED SOURCE POLYGONS

   TARGET MODE
   ------------------------------------------------------------

   Target A selected
      ↓
   Related Sources A rendered

   Target B selected
      ↓
   THIS FUNCTION clears Related Sources A
      ↓
   Related Sources B rendered


   Parent Target polygons remain untouched.
============================================================ */

Renderer.clearRelatedSources =
  function () {

    Renderer
      .relatedSourceLayer
      ?.clearLayers?.();


    Renderer
      .renderedRelatedSourceLayers
      .clear();

  };


/* ============================================================
   🧹 CLEAR RELATED TARGET POLYGONS

   SOURCE MODE
   ------------------------------------------------------------

   Source A selected
      ↓
   Related Targets A rendered

   Source B selected
      ↓
   THIS FUNCTION clears Related Targets A
      ↓
   Related Targets B rendered


   Parent Source polygons remain untouched.
============================================================ */

Renderer.clearRelatedTargets =
  function () {

    Renderer
      .relatedTargetLayer
      ?.clearLayers?.();


    Renderer
      .renderedRelatedTargetLayers
      .clear();

  };


/* ============================================================
   🧹 CLEAR SELECTION HIGHLIGHT

   Removes only the selected parent highlight.

   Does NOT remove:

   - Parent Sources
   - Parent Targets
   - Related Sources
   - Related Targets
============================================================ */

Renderer.clearSelection =
  function () {

    Renderer
      .selectionLayer
      ?.clearLayers?.();

  };


/* ============================================================
   🧹 CLEAR SOURCE-MODE DRILL-DOWN

   Keeps ALL parent Source polygons.

   Clears only:

   - Related Targets
   - Selection highlight
   - Selected Source ID
   - Selected Target key
   - Current cases


   USE CASE
   ------------------------------------------------------------

   Source A
      ↓
   Targets A

   Then Source B clicked:

   clearSourceDrillDown()
      ↓
   Parent Sources remain
      ↓
   Targets A removed
      ↓
   Selection A removed
      ↓
   Source B selected
      ↓
   Targets B rendered
============================================================ */

Renderer.clearSourceDrillDown =
  function () {

    Renderer
      .clearRelatedTargets();


    Renderer
      .clearSelection();


    Renderer.selectedSourceId =
      null;


    Renderer.selectedTargetKey =
      null;


    Renderer.currentTargets =
      [];


    Renderer.currentCases =
      [];

  };

   Renderer.applyModePaneInteraction =
  function (
    mode
  ) {

    /* ========================================================
       GET MAP
    ======================================================== */

    const map =
      Renderer.getMap();


    if (
      !map
    ) {

      return false;

    }


    /* ========================================================
       GET ALL OFFENCE PANES
    ======================================================== */

    const parentSourcePane =
      map.getPane(
        Renderer
          .config
          .parentSourcePane
      );


    const parentTargetPane =
      map.getPane(
        Renderer
          .config
          .parentTargetPane
      );


    const relatedSourcePane =
      map.getPane(
        Renderer
          .config
          .relatedSourcePane
      );


    const relatedTargetPane =
      map.getPane(
        Renderer
          .config
          .relatedTargetPane
      );


    const selectionPane =
      map.getPane(
        Renderer
          .config
          .selectionPane
      );


    /* ========================================================
       NORMALIZE MODE
    ======================================================== */

    const activeMode =
      String(
        mode ||
        Renderer.mode ||
        ""
      )
      .trim()
      .toUpperCase();


    /* ========================================================
       SOURCE MODE

       Interactive hierarchy:

       Parent Sources
            ↓
       Related Targets

       Inactive TARGET parent Canvas MUST NOT intercept
       pointer events.

       Related Sources belong to TARGET mode and therefore
       must also be inactive.
    ======================================================== */

    if (
      activeMode ===
      "SOURCE"
    ) {

      if (
        parentSourcePane
      ) {

        parentSourcePane
          .style
          .pointerEvents =
            "auto";

      }


      if (
        parentTargetPane
      ) {

        parentTargetPane
          .style
          .pointerEvents =
            "none";

      }


      if (
        relatedSourcePane
      ) {

        relatedSourcePane
          .style
          .pointerEvents =
            "none";

      }


      if (
        relatedTargetPane
      ) {

        relatedTargetPane
          .style
          .pointerEvents =
            "auto";

      }


      if (
        selectionPane
      ) {

        selectionPane
          .style
          .pointerEvents =
            "none";

      }


      return true;

    }


    /* ========================================================
       TARGET MODE

       Interactive hierarchy:

       Parent Targets
            ↓
       Related Sources

       Inactive SOURCE parent Canvas MUST NOT intercept
       pointer events.

       Related Targets belong to SOURCE mode and therefore
       must also be inactive.
    ======================================================== */

    if (
      activeMode ===
      "TARGET"
    ) {

      if (
        parentSourcePane
      ) {

        parentSourcePane
          .style
          .pointerEvents =
            "none";

      }


      if (
        parentTargetPane
      ) {

        parentTargetPane
          .style
          .pointerEvents =
            "auto";

      }


      if (
        relatedSourcePane
      ) {

        relatedSourcePane
          .style
          .pointerEvents =
            "auto";

      }


      if (
        relatedTargetPane
      ) {

        relatedTargetPane
          .style
          .pointerEvents =
            "none";

      }


      if (
        selectionPane
      ) {

        selectionPane
          .style
          .pointerEvents =
            "none";

      }


      return true;

    }


    /* ========================================================
       NO ACTIVE MODE

       Disable every offence interaction.

       Useful during clear / reset / shutdown.
    ======================================================== */

    if (
      parentSourcePane
    ) {

      parentSourcePane
        .style
        .pointerEvents =
          "none";

    }


    if (
      parentTargetPane
    ) {

      parentTargetPane
        .style
        .pointerEvents =
          "none";

    }


    if (
      relatedSourcePane
    ) {

      relatedSourcePane
        .style
        .pointerEvents =
          "none";

    }


    if (
      relatedTargetPane
    ) {

      relatedTargetPane
        .style
        .pointerEvents =
          "none";

    }


    if (
      selectionPane
    ) {

      selectionPane
        .style
        .pointerEvents =
          "none";

    }


    return true;

  };

/* ============================================================
   🧹 CLEAR TARGET-MODE DRILL-DOWN

   Keeps ALL parent Target polygons.

   Clears only:

   - Related Sources
   - Selection highlight
   - Selected Target key
   - Selected Source ID
   - Current cases
============================================================ */

Renderer.clearTargetDrillDown =
  function () {

    Renderer
      .clearRelatedSources();


    Renderer
      .clearSelection();


    Renderer.selectedTargetKey =
      null;


    Renderer.selectedSourceId =
      null;


    Renderer.currentSources =
      [];


    Renderer.currentCases =
      [];

  };


/* ============================================================
   🧹 CLEAR CURRENT DRILL-DOWN ONLY

   Automatically determines which relationship layer
   should be cleared based on the current mode.

   Parent polygons remain untouched.
============================================================ */

Renderer.clearDrillDown =
  function () {

    if (
      Renderer.mode ===
      "SOURCE"
    ) {

      Renderer
        .clearSourceDrillDown();


      return;

    }


    if (
      Renderer.mode ===
      "TARGET"
    ) {

      Renderer
        .clearTargetDrillDown();


      return;

    }


    /* --------------------------------------------------------
       UNKNOWN / NO MODE

       Safely clear both relationship layers.
    -------------------------------------------------------- */

    Renderer
      .clearRelatedSources();


    Renderer
      .clearRelatedTargets();


    Renderer
      .clearSelection();


    Renderer.selectedSourceId =
      null;


    Renderer.selectedTargetKey =
      null;


    Renderer.currentCases =
      [];

  };


/* ============================================================
   🧹 CLEAR COMPLETE OFFENCE SPATIAL STATE

   Used when:

   - CLEAR button clicked
   - Switching SOURCE → TARGET
   - Switching TARGET → SOURCE
   - Full renderer reset


   REMOVES
   ------------------------------------------------------------

   Parent Sources
   Parent Targets
   Related Sources
   Related Targets
   Selection highlight

   RESETS
   ------------------------------------------------------------

   Mode
   Selected Source
   Selected Target
   Current Sources
   Current Targets
   Current Cases


   IMPORTANT
   ------------------------------------------------------------

   Layer GROUPS remain attached to the Leaflet map.

   Only their polygon contents are removed.

   This preserves the stable five-layer architecture.
============================================================ */

/* ============================================================
   🧹 CLEAR COMPLETE SPATIAL RENDERER STATE

   PURPOSE
   ------------------------------------------------------------

   Clears all offence spatial rendering and runtime selection
   state.

   This resets:

   - Parent Source polygons
   - Parent Target polygons
   - Related Source polygons
   - Related Target polygons
   - Selection overlay
   - Selected Source
   - Selected Target
   - Current Source data
   - Current Target data
   - Current Case data
   - Current Case relationship context
   - Active Renderer mode


   IMPORTANT
   ------------------------------------------------------------

   This does NOT:

   - Destroy the Renderer object
   - Destroy Leaflet panes
   - Destroy persistent layer groups
   - Clear GIS feature indexes
   - Clear Offence Store
   - Clear SpatialEngine

   It only resets the current spatial visualization state.
============================================================ */

Renderer.clear =
  function () {

    /* ========================================================
       CLEAR ALL FIVE LAYER CONTENTS
    ======================================================== */

    Renderer
      .clearParentSources();


    Renderer
      .clearParentTargets();


    Renderer
      .clearRelatedSources();


    Renderer
      .clearRelatedTargets();


    Renderer
      .clearSelection();


    /* ========================================================
       RESET SELECTION STATE
    ======================================================== */

    Renderer.selectedSourceId =
      null;


    Renderer.selectedTargetKey =
      null;


    /* ========================================================
       RESET CURRENT SPATIAL DATA
    ======================================================== */

    Renderer.currentSources =
      [];


    Renderer.currentTargets =
      [];


    /* ========================================================
       RESET CURRENT CASE DATA

       currentCases contains the cases resolved for the latest:

       Source
          ↓
       Target

       or:

       Target
          ↓
       Source

       relationship.
    ======================================================== */

    Renderer.currentCases =
      [];


    /* ========================================================
       RESET CURRENT CASE CONTEXT

       This context is created by:

       Renderer.showCases()

       and can contain:

       - mode
       - relationship
       - source
       - target
       - sourceId
       - targetKey
       - sourceName
       - targetName
       - caseCount
    ======================================================== */

    Renderer.currentCaseContext =
      null;


    /* ========================================================
       RESET MODE

       After a complete clear there is no active spatial mode.

       renderAllSources() will later set:

       Renderer.mode = "SOURCE"

       renderAllTargets() will later set:

       Renderer.mode = "TARGET"
    ======================================================== */

    Renderer.mode =
      null;

  };


/* ============================================================
   🔄 REFRESH RAW GIS FEATURE INDEXES

   Rebuilds:

   Village Feature Index
   Range Feature Index

   Does NOT render polygons.

   Does NOT change current mode.

   Does NOT clear Leaflet layers.
============================================================ */

Renderer.rebuildIndexes =
  function () {

    const villages =
      Renderer
        .buildVillageFeatureIndex();


    const ranges =
      Renderer
        .buildRangeFeatureIndex();


    return {

      villageFeatures:
        villages,


      rangeGroups:
        ranges

    };

  };

 /* ============================================================
   🏡 RENDER ONE SOURCE VILLAGE

   ROLE-AWARE VERSION
   ------------------------------------------------------------

   Supported roles:

   PARENT
      Used by SOURCE mode.

      The Source polygon is added to:

      parentSourceLayer

      It remains permanently interactive while SOURCE mode
      is active.


   RELATED
      Used by TARGET mode drill-down.

      Selected Target
           ↓
      Related Source Villages

      The Source polygon is added to:

      relatedSourceLayer

      Clicking it opens the Source ↔ Target case relationship.


   SELECTED
      Used only as a visual highlight.

      The Source polygon is added to:

      selectionLayer

      It is NON-INTERACTIVE.

      Therefore it cannot block:
      - parent Source clicks
      - tooltips
      - mouseover
      - mouseout
============================================================ */

Renderer.renderSource =
  function (
    source,
    maxCount,
    options = {}
  ) {

    /* ========================================================
       VALIDATE MAP AND SOURCE
    ======================================================== */

    const map =
      Renderer.getMap();


    if (
      !map ||
      !source ||
      typeof L ===
        "undefined"
    ) {

      return null;

    }


    /* ========================================================
       RESOLVE SOURCE ID
    ======================================================== */

    const sourceId =

      source.canonicalId

      ||

      source.id;


    if (
      !sourceId
    ) {

      return null;

    }


    /* ========================================================
       GET SOURCE GIS FEATURES
    ======================================================== */

    const features =
      Renderer
        .villageFeatureIndex
        .get(
          sourceId
        );


    if (
      !features ||
      !features.length
    ) {

      return null;

    }


    /* ========================================================
       RESOLVE RENDER ROLE
    ======================================================== */

    const role =
      String(
        options.role ||
        "PARENT"
      )
      .trim()
      .toUpperCase();


    /* ========================================================
       RESOLVE LAYER / PANE / INDEX

       Defaults to PARENT.
    ======================================================== */

    let parentLayer =
      Renderer.parentSourceLayer;


    let paneName =
      Renderer
        .config
        .parentSourcePane;


    let renderedIndex =
      Renderer
        .renderedParentSourceLayers;


    let interactive =
      true;


    /* ========================================================
       RELATED SOURCE

       TARGET
          ↓
       SOURCE
    ======================================================== */

    if (
      role ===
      "RELATED"
    ) {

      parentLayer =
        Renderer.relatedSourceLayer;


      paneName =
        Renderer
          .config
          .relatedSourcePane;


      renderedIndex =
        Renderer
          .renderedRelatedSourceLayers;


      interactive =
        true;

    }


    /* ========================================================
       SELECTED SOURCE

       Visual only.
    ======================================================== */

    else if (
      role ===
      "SELECTED"
    ) {

      parentLayer =
        Renderer.selectionLayer;


      paneName =
        Renderer
          .config
          .selectionPane;


      /*
       * Selection polygons are not tracked in the normal
       * rendered indexes.
       */

      renderedIndex =
        null;


      interactive =
        false;

    }


    /* ========================================================
       VALIDATE DESTINATION LAYER
    ======================================================== */

    if (
      !parentLayer
    ) {

      console.warn(
        "⚠ Source destination layer unavailable:",
        role,
        source.name
      );


      return null;

    }


    /* ========================================================
       CREATE GEOJSON LAYER
    ======================================================== */

    const geoLayer =
      L.geoJSON(

        {

          type:
            "FeatureCollection",


          features:
            features

        },

        {

          pane:
            paneName,


          /*
           * PARENT and RELATED polygons are interactive.
           *
           * SELECTED polygon is visual only.
           */

          interactive:
            interactive,


          style:
            function () {

              return Renderer
                .getSourceStyle(

                  source.offenceCount,

                  maxCount,

                  role ===
                    "SELECTED"

                );

            },


          onEachFeature:
            function (
              feature,
              layer
            ) {

              /* ==================================================
                 SELECTED POLYGON

                 No tooltip.
                 No hover.
                 No click.

                 It is visual only.
              ================================================== */

              if (
                role ===
                "SELECTED"
              ) {

                return;

              }


              /* ==================================================
                 TOOLTIP
              ================================================== */

              layer.bindTooltip(

                Renderer
                  .createSourceTooltip(
                    source
                  ),

                {

                  sticky:
                    true,


                  direction:
                    "top",


                  opacity:
                    0.95

                }

              );


              /* ==================================================
                 MOUSEOVER
              ================================================== */

              layer.on(

                "mouseover",

                function () {

                  layer.setStyle({

                    weight:
                      3,


                    fillOpacity:
                      0.78

                  });

                }

              );


              /* ==================================================
                 MOUSEOUT
              ================================================== */

              layer.on(

                "mouseout",

                function () {

                  geoLayer.resetStyle(
                    layer
                  );

                }

              );


              /* ==================================================
                 CLICK

                 Behavior depends on role.

                 PARENT:
                    SOURCE mode parent selection.

                 RELATED:
                    TARGET mode Source → Cases.
              ================================================== */

              layer.on(

                "click",

                function (
                  e
                ) {

                  if (
                    e
                  ) {

                    L
                      .DomEvent
                      .stopPropagation(
                        e
                      );

                  }


                  /* ----------------------------------------------
                     PARENT SOURCE CLICK

                     SOURCE MODE:

                     Source
                        ↓
                     Related Targets
                  ---------------------------------------------- */

                  if (
                    role ===
                    "PARENT"
                  ) {

                    Renderer
                      .handleSourceClick(
                        source,
                        "PARENT"
                      );


                    return;

                  }


                  /* ----------------------------------------------
                     RELATED SOURCE CLICK

                     TARGET MODE:

                     Target
                        ↓
                     Related Source
                        ↓
                     Cases
                  ---------------------------------------------- */

                  if (
                    role ===
                    "RELATED"
                  ) {

                    Renderer
                      .handleSourceClick(
                        source,
                        "RELATED"
                      );

                  }

                }

              );

            }

        }

      );


    /* ========================================================
       ADD TO CORRECT LAYER GROUP
    ======================================================== */

    geoLayer.addTo(
      parentLayer
    );


    /* ========================================================
       REGISTER RENDERED POLYGON

       SELECTED overlays are intentionally not registered.
    ======================================================== */

    if (
      renderedIndex
    ) {

      renderedIndex.set(
        sourceId,
        geoLayer
      );

    }


    return geoLayer;

  };


/* ============================================================
   🎯 RENDER ONE TARGET RANGE

   ROLE-AWARE VERSION
   ------------------------------------------------------------

   Supported roles:

   PARENT
      Used by TARGET mode.

      The Target polygon is added to:

      parentTargetLayer

      It remains permanently interactive while TARGET mode
      is active.


   RELATED
      Used by SOURCE mode drill-down.

      Selected Source
           ↓
      Related Target Ranges

      The Target polygon is added to:

      relatedTargetLayer

      Clicking it opens the Source ↔ Target case relationship.


   SELECTED
      Used only as a visual highlight.

      The Target polygon is added to:

      selectionLayer

      It is NON-INTERACTIVE.
============================================================ */

Renderer.renderTarget =
  function (
    target,
    maxCount,
    options = {}
  ) {

    /* ========================================================
       VALIDATE TARGET
    ======================================================== */

    if (
      !target ||
      typeof L ===
        "undefined"
    ) {

      return null;

    }


    /* ========================================================
       RESOLVE TARGET KEY
    ======================================================== */

    const targetKey =
      Renderer
        .normalizeText(

          target.cleanName

          ||

          target.name

        );


    if (
      !targetKey
    ) {

      return null;

    }


    /* ========================================================
       GET TARGET GIS FEATURES
    ======================================================== */

    const features =
      Renderer
        .rangeFeatureIndex
        .get(
          targetKey
        );


    if (
      !features ||
      !features.length
    ) {

      return null;

    }


    /* ========================================================
       RESOLVE RENDER ROLE
    ======================================================== */

    const role =
      String(
        options.role ||
        "PARENT"
      )
      .trim()
      .toUpperCase();


    /* ========================================================
       RESOLVE LAYER / PANE / INDEX

       Defaults to PARENT.
    ======================================================== */

    let parentLayer =
      Renderer.parentTargetLayer;


    let paneName =
      Renderer
        .config
        .parentTargetPane;


    let renderedIndex =
      Renderer
        .renderedParentTargetLayers;


    let interactive =
      true;


    /* ========================================================
       RELATED TARGET

       SOURCE
          ↓
       TARGET
    ======================================================== */

    if (
      role ===
      "RELATED"
    ) {

      parentLayer =
        Renderer.relatedTargetLayer;


      paneName =
        Renderer
          .config
          .relatedTargetPane;


      renderedIndex =
        Renderer
          .renderedRelatedTargetLayers;


      interactive =
        true;

    }


    /* ========================================================
       SELECTED TARGET

       Visual only.
    ======================================================== */

    else if (
      role ===
      "SELECTED"
    ) {

      parentLayer =
        Renderer.selectionLayer;


      paneName =
        Renderer
          .config
          .selectionPane;


      renderedIndex =
        null;


      interactive =
        false;

    }


    /* ========================================================
       VALIDATE DESTINATION LAYER
    ======================================================== */

    if (
      !parentLayer
    ) {

      console.warn(
        "⚠ Target destination layer unavailable:",
        role,
        target.name
      );


      return null;

    }


    /* ========================================================
       CREATE GEOJSON LAYER
    ======================================================== */

    const geoLayer =
      L.geoJSON(

        {

          type:
            "FeatureCollection",


          features:
            features

        },

        {

          pane:
            paneName,


          interactive:
            interactive,


          style:
            function () {

              return Renderer
                .getTargetStyle(

                  target.offenceCount,

                  maxCount,

                  role ===
                    "SELECTED"

                );

            },


          onEachFeature:
            function (
              feature,
              layer
            ) {

              /* ==================================================
                 SELECTED TARGET

                 Visual only.
              ================================================== */

              if (
                role ===
                "SELECTED"
              ) {

                return;

              }


              /* ==================================================
                 TOOLTIP
              ================================================== */

              layer.bindTooltip(

                Renderer
                  .createTargetTooltip(
                    target
                  ),

                {

                  sticky:
                    true,


                  direction:
                    "top",


                  opacity:
                    0.95

                }

              );


              /* ==================================================
                 MOUSEOVER
              ================================================== */

              layer.on(

                "mouseover",

                function () {

                  layer.setStyle({

                    weight:
                      3,


                    fillOpacity:
                      0.78

                  });

                }

              );


              /* ==================================================
                 MOUSEOUT
              ================================================== */

              layer.on(

                "mouseout",

                function () {

                  geoLayer.resetStyle(
                    layer
                  );

                }

              );


              /* ==================================================
                 CLICK

                 PARENT:
                    TARGET mode parent selection.

                 RELATED:
                    SOURCE mode Target → Cases.
              ================================================== */

              layer.on(

                "click",

                function (
                  e
                ) {

                  if (
                    e
                  ) {

                    L
                      .DomEvent
                      .stopPropagation(
                        e
                      );

                  }


                  /* ----------------------------------------------
                     PARENT TARGET CLICK

                     TARGET MODE:

                     Target
                        ↓
                     Related Sources
                  ---------------------------------------------- */

                  if (
                    role ===
                    "PARENT"
                  ) {

                    Renderer
                      .handleTargetClick(
                        target,
                        "PARENT"
                      );


                    return;

                  }


                  /* ----------------------------------------------
                     RELATED TARGET CLICK

                     SOURCE MODE:

                     Source
                        ↓
                     Related Target
                        ↓
                     Cases
                  ---------------------------------------------- */

                  if (
                    role ===
                    "RELATED"
                  ) {

                    Renderer
                      .handleTargetClick(
                        target,
                        "RELATED"
                      );

                  }

                }

              );

            }

        }

      );


    /* ========================================================
       ADD TO CORRECT LAYER GROUP
    ======================================================== */

    geoLayer.addTo(
      parentLayer
    );


    /* ========================================================
       REGISTER RENDERED POLYGON
    ======================================================== */

    if (
      renderedIndex
    ) {

      renderedIndex.set(
        targetKey,
        geoLayer
      );

    }


    return geoLayer;

  };


   /* ============================================================
   🔥 HARD RESET LEAFLET LAYER GROUPS

   USE ONLY WHEN SWITCHING / REACTIVATING PARENT MODE

   SOURCE ↔ TARGET

   PURPOSE
   ------------------------------------------------------------
   Completely destroys the old Leaflet LayerGroups and creates
   fresh groups.

   This is stronger than:

   layerGroup.clearLayers()

   because the LayerGroup objects themselves are also removed
   from the map and discarded.
============================================================ */

Renderer.hardResetLayerGroups =
  function () {

    const map =
      Renderer.getMap();


    if (
      !map
    ) {

      return false;

    }


    /* ========================================================
       REMOVE OLD GROUPS FROM MAP
    ======================================================== */

    [
      Renderer.parentSourceLayer,
      Renderer.parentTargetLayer,
      Renderer.relatedSourceLayer,
      Renderer.relatedTargetLayer,
      Renderer.selectionLayer
    ]
    .forEach(

      layerGroup => {

        if (
          layerGroup &&
          map.hasLayer(
            layerGroup
          )
        ) {

          map.removeLayer(
            layerGroup
          );

        }

      }

    );


    /* ========================================================
       CLEAR OLD GROUP CONTENT
    ======================================================== */

    Renderer
      .parentSourceLayer
      ?.clearLayers?.();


    Renderer
      .parentTargetLayer
      ?.clearLayers?.();


    Renderer
      .relatedSourceLayer
      ?.clearLayers?.();


    Renderer
      .relatedTargetLayer
      ?.clearLayers?.();


    Renderer
      .selectionLayer
      ?.clearLayers?.();


    /* ========================================================
       DISCARD OLD LAYER GROUP REFERENCES
    ======================================================== */

    Renderer.parentSourceLayer =
      null;


    Renderer.parentTargetLayer =
      null;


    Renderer.relatedSourceLayer =
      null;


    Renderer.relatedTargetLayer =
      null;


    Renderer.selectionLayer =
      null;


    /* ========================================================
       CLEAR RENDERED GEOJSON REFERENCES
    ======================================================== */

    Renderer
      .renderedParentSourceLayers
      .clear();


    Renderer
      .renderedParentTargetLayers
      .clear();


    Renderer
      .renderedRelatedSourceLayers
      .clear();


    Renderer
      .renderedRelatedTargetLayers
      .clear();


    /* ========================================================
       RESET SELECTION / DATA STATE
    ======================================================== */

    Renderer.selectedSourceId =
      null;


    Renderer.selectedTargetKey =
      null;


    Renderer.currentSources =
      [];


    Renderer.currentTargets =
      [];


    Renderer.currentCases =
      [];


    /* ========================================================
       CREATE COMPLETELY FRESH LAYER GROUPS
    ======================================================== */

    const created =
      Renderer.createLayers();


    console.log(
      "🔥 Offence Leaflet layer groups hard reset",
      Renderer.getLayerState?.()
    );


    return created;

  };
 /* ============================================================
   🏡 RENDER ALL PARENT SOURCE VILLAGES

   USED BY
   ------------------------------------------------------------
   OFFENCE → SOURCE

   BEHAVIOUR
   ------------------------------------------------------------
   1. Clear complete previous spatial state.
   2. Set mode = SOURCE.
   3. Rebuild village feature index.
   4. Render ALL valid Source Villages as PARENT polygons.
   5. Parent Source polygons remain permanently interactive
      until mode is changed or CLEAR is clicked.

   IMPORTANT
   ------------------------------------------------------------
   Selecting Source A, B, C later MUST NOT call this function.

   Parent Source polygons are rendered once for SOURCE mode.
============================================================ */

/* ============================================================
   🏡 RENDER ALL PARENT SOURCE VILLAGES

   USED BY
   ------------------------------------------------------------
   OFFENCE → SOURCE

   IMPORTANT MODE-SWITCH BEHAVIOUR
   ------------------------------------------------------------

   When entering SOURCE mode:

   TARGET MODE
        ↓
   HARD CLEAR ALL OFFENCE LEAFLET POLYGONS
        ↓
   CLEAR ALL RENDERED LAYER INDEXES
        ↓
   RESET SELECTION / DRILL-DOWN STATE
        ↓
   MODE = SOURCE
        ↓
   CREATE FRESH PARENT SOURCE POLYGONS

   This ensures Leaflet Canvas interactive targets are freshly
   registered after TARGET → SOURCE mode switching.

   Within SOURCE mode:

   Source A → Source B

   does NOT call this function.

   selectSource() clears only drill-down layers, so all parent
   Source polygons remain interactive.
============================================================ */

/* ============================================================
   🏡 RENDER ALL PARENT SOURCE VILLAGES

   USED BY
   ------------------------------------------------------------
   OFFENCE → SOURCE

   FLOW
   ------------------------------------------------------------

   SOURCE button
        ↓
   hardResetLayerGroups()
        ↓
   Remove old Leaflet LayerGroups
        ↓
   Discard old LayerGroup references
        ↓
   Clear rendered layer indexes
        ↓
   Create fresh five-layer architecture
        ↓
   mode = SOURCE
        ↓
   Rebuild Village Feature Index
        ↓
   Get all Source Villages
        ↓
   Render fresh Parent Source polygons

   IMPORTANT
   ------------------------------------------------------------

   This function is used when activating SOURCE mode.

   It performs a FULL Leaflet layer lifecycle reset.

   It is NOT used when switching:

   Source A
      ↓
   Source B

   That flow is handled by:

   selectSource()

   which must clear only Source drill-down layers while
   preserving all Parent Source polygons.

============================================================ */

Renderer.renderAllSources =
  function () {

    /* ========================================================
       GET SPATIAL ENGINE
    ======================================================== */

    const Spatial =
      Renderer
        .getSpatialEngine();


    /* ========================================================
       GET MAP
    ======================================================== */

    const map =
      Renderer
        .getMap();


    /* ========================================================
       VALIDATE DEPENDENCIES
    ======================================================== */

    if (
      !Spatial ||
      !map
    ) {

      console.warn(
        "⚠ OffenceSpatialRenderer: SOURCE dependencies unavailable"
      );


      return [];

    }


    /* ========================================================
       VALIDATE SPATIAL ENGINE READINESS

       SOURCE polygons should only be rendered when the
       SpatialEngine has completed its build.
    ======================================================== */

    if (
      Spatial.ready !==
      true
    ) {

      console.warn(
        "⚠ OffenceSpatialRenderer: SpatialEngine not ready for SOURCE mode"
      );


      return [];

    }


    /* ========================================================
       HARD RESET LEAFLET LAYER GROUPS

       IMPORTANT:

       This replaces the previous pattern:

       createLayers()
           ↓
       clearLayers()

       with:

       remove old LayerGroups
           ↓
       discard old references
           ↓
       clear rendered indexes
           ↓
       create completely fresh LayerGroups

       This is required to recover Leaflet Canvas interaction
       correctly after:

       SOURCE
          ↓
       TARGET
          ↓
       SOURCE

    ======================================================== */

    if (
      !Renderer
        .hardResetLayerGroups()
    ) {

      console.warn(
        "⚠ OffenceSpatialRenderer: SOURCE hard layer reset failed"
      );


      return [];

    }


    /* ========================================================
       ACTIVATE SOURCE MODE

       IMPORTANT:

       Set mode BEFORE creating Source polygons.

       All newly-created click handlers will therefore operate
       against SOURCE mode.
    ======================================================== */

    Renderer.mode =
      "SOURCE";

Renderer.applyModePaneInteraction(
  "SOURCE"
);
    /* ========================================================
       RESET SOURCE MODE STATE

       hardResetLayerGroups() should already reset these.

       They are explicitly reset here as a defensive guarantee
       for SOURCE mode activation.
    ======================================================== */

    Renderer.selectedSourceId =
      null;


    Renderer.selectedTargetKey =
      null;


    Renderer.currentSources =
      [];


    Renderer.currentTargets =
      [];


    Renderer.currentCases =
      [];


    /* ========================================================
       REBUILD VILLAGE FEATURE INDEX

       This ensures the renderer uses the currently available
       village boundary GeoJSON.

       Canonical Source ID format:

       VILLAGE_CODE::CLEAN_VILLAGE_NAME

       Example:

       307248::BANCHUKAMARI

    ======================================================== */

    const villageFeatureCount =
      Renderer
        .buildVillageFeatureIndex();


    if (
      !villageFeatureCount
    ) {

      console.warn(
        "⚠ OffenceSpatialRenderer: No village GIS features available"
      );


      return [];

    }


    /* ========================================================
       GET ALL SOURCE VILLAGES FROM SPATIAL ENGINE
    ======================================================== */

    const allSources =

      Spatial
        .getSourceVillages?.()

      ||

      [];


    /* ========================================================
       VALIDATE SOURCE DATA
    ======================================================== */

    if (
      !Array.isArray(
        allSources
      ) ||
      !allSources.length
    ) {

      console.warn(
        "⚠ OffenceSpatialRenderer: No Source villages available"
      );


      return [];

    }


    /* ========================================================
       KEEP ONLY GIS-RESOLVED SOURCE VILLAGES

       SpatialEngine may contain Source villages that cannot
       currently be matched to a village boundary polygon.

       Only render Sources whose canonical ID exists in:

       Renderer.villageFeatureIndex

    ======================================================== */

    const sources =

      allSources.filter(

        source => {

          if (
            !source
          ) {

            return false;

          }


          const sourceId =

            source.canonicalId

            ||

            source.id;


          if (
            !sourceId
          ) {

            return false;

          }


          return Renderer
            .villageFeatureIndex
            .has(
              sourceId
            );

        }

      );


    /* ========================================================
       VALIDATE RENDERABLE SOURCES
    ======================================================== */

    if (
      !sources.length
    ) {

      console.warn(
        "⚠ OffenceSpatialRenderer: No GIS-resolved Source villages"
      );


      return [];

    }


    /* ========================================================
       CALCULATE SOURCE HEAT SCALE

       Highest offence count becomes maximum visual intensity.

       Minimum maxCount = 1 prevents division-by-zero.
    ======================================================== */

    const maxCount =
      Math.max(

        1,

        ...sources.map(

          source =>

            Number(
              source.offenceCount
            )

            ||

            0

        )

      );


    /* ========================================================
       STORE CURRENT PARENT SOURCE DATA

       In SOURCE mode:

       currentSources
           =
       complete Parent Source collection

       This collection must survive:

       Source A
           ↓
       Source B
           ↓
       Source C

       Only related Targets should change during drill-down.
    ======================================================== */

    Renderer.currentSources =
      sources;


    Renderer.currentTargets =
      [];


    Renderer.currentCases =
      [];


    /* ========================================================
       RENDER FRESH PARENT SOURCE POLYGONS

       role = PARENT

       Each Source polygon must be created fresh after a mode
       switch so Leaflet registers fresh interaction handlers:

       - mouseover
       - mouseout
       - tooltip
       - click

       Parent Sources are stored in:

       renderedParentSourceLayers

    ======================================================== */

    sources.forEach(

      source => {

        Renderer.renderSource(

          source,

          maxCount,

          {

            role:
              "PARENT"

          }

        );

      }

    );


    /* ========================================================
       VALIDATE RENDER RESULT
    ======================================================== */

    const renderedCount =
      Renderer
        .renderedParentSourceLayers
        .size;


    /* ========================================================
       DIAGNOSTIC
    ======================================================== */

    console.log(

      "🚨 SOURCE MODE READY",

      {

        mode:
          Renderer.mode,

        sourceData:
          allSources.length,

        gisResolvedSources:
          sources.length,

        renderedParentSources:
          renderedCount,

        villageFeatureGroups:
          Renderer
            .villageFeatureIndex
            .size,

        parentSourceLayerOnMap:
          map.hasLayer(
            Renderer.parentSourceLayer
          ),

        relatedTargets:
          Renderer
            .renderedRelatedTargetLayers
            .size,

        selectedSourceId:
          Renderer.selectedSourceId

      }

    );


    /* ========================================================
       WARN IF RENDER COUNT DOES NOT MATCH
    ======================================================== */

    if (
      renderedCount !==
      sources.length
    ) {

      console.warn(

        "⚠ SOURCE render count mismatch",

        {

          expected:
            sources.length,

          rendered:
            renderedCount

        }

      );

    }


    /* ========================================================
       RETURN PARENT SOURCE DATA
    ======================================================== */

    return sources;

  };


/* ============================================================
   🎯 RENDER ALL PARENT TARGET RANGES

   USED BY
   ------------------------------------------------------------
   OFFENCE → TARGET

   BEHAVIOUR
   ------------------------------------------------------------
   1. Clear complete previous spatial state.
   2. Set mode = TARGET.
   3. Rebuild Range feature index.
   4. Render ALL GIS-resolved Target Ranges as PARENT polygons.
   5. Parent Targets remain interactive during drill-down.
============================================================ */

Renderer.renderAllTargets =
  function () {

    const Spatial =
      Renderer
        .getSpatialEngine();


    const map =
      Renderer.getMap();


    if (
      !Spatial ||
      !map
    ) {

      console.warn(
        "⚠ OffenceSpatialRenderer: TARGET dependencies unavailable"
      );


      return [];

    }


    /* ========================================================
       ENSURE FIVE-LAYER ARCHITECTURE EXISTS
    ======================================================== */

    if (
      !Renderer.createLayers()
    ) {

      return [];

    }


    /* ========================================================
       CLEAR PREVIOUS MODE
    ======================================================== */

    Renderer.clear();


    /* ========================================================
       ACTIVATE TARGET MODE
    ======================================================== */

    Renderer.mode =
      "TARGET";

Renderer.applyModePaneInteraction(
  "TARGET"
);
    /* ========================================================
       REBUILD RANGE FEATURE INDEX
    ======================================================== */

    Renderer
      .buildRangeFeatureIndex();


    /* ========================================================
       GET ALL SPATIAL TARGET RANGES
    ======================================================== */

    const allTargets =

      Spatial
        .getTargetRanges?.()

      ||

      [];


    /* ========================================================
       KEEP ONLY GIS-RESOLVED TARGETS
    ======================================================== */

    const targets =

      allTargets.filter(

        target => {

          if (
            target.gisResolved !==
            true
          ) {

            return false;

          }


          const targetKey =
            Renderer
              .normalizeText(

                target.cleanName

                ||

                target.name

              );


          if (
            !targetKey
          ) {

            return false;

          }


          return Renderer
            .rangeFeatureIndex
            .has(
              targetKey
            );

        }

      );


    /* ========================================================
       CALCULATE HEAT SCALE
    ======================================================== */

    const maxCount =
      Math.max(

        1,

        ...targets.map(

          target =>

            target.offenceCount

            ||

            0

        )

      );


    /* ========================================================
       STORE CURRENT PARENT TARGETS
    ======================================================== */

    Renderer.currentTargets =
      targets;


    Renderer.currentSources =
      [];


    Renderer.currentCases =
      [];


    /* ========================================================
       RENDER ALL TARGETS AS PERMANENT PARENTS
    ======================================================== */

    targets.forEach(

      target => {

        Renderer.renderTarget(

          target,

          maxCount,

          {
            role:
              "PARENT"
          }

        );

      }

    );


    console.log(

      "🚨 Offence TARGET parent heatmap rendered:",

      targets.length,

      "ranges"

    );


    return targets;

  };


/* ============================================================
   🏡 HANDLE SOURCE POLYGON CLICK

   ROLE ROUTING
   ------------------------------------------------------------

   PARENT SOURCE
      SOURCE mode
         ↓
      selectSource()
         ↓
      Render ALL related Targets


   RELATED SOURCE
      TARGET mode
         ↓
      selectSourceForTarget()
         ↓
      Show Source ↔ Target cases
============================================================ */

Renderer.handleSourceClick =
  function (
    source,
    role = "PARENT"
  ) {

    if (
      !source
    ) {

      return [];

    }


    const normalizedRole =
      String(
        role ||
        "PARENT"
      )
      .trim()
      .toUpperCase();


    /* ========================================================
       SOURCE MODE PARENT CLICK
    ======================================================== */

    if (
      Renderer.mode ===
        "SOURCE" &&
      normalizedRole ===
        "PARENT"
    ) {

      return Renderer
        .selectSource(
          source
        );

    }


    /* ========================================================
       TARGET MODE RELATED SOURCE CLICK
    ======================================================== */

    if (
      Renderer.mode ===
        "TARGET" &&
      normalizedRole ===
        "RELATED"
    ) {

      return Renderer
        .selectSourceForTarget(
          source
        );

    }


    return [];

  };


/* ============================================================
   🎯 HANDLE TARGET POLYGON CLICK

   ROLE ROUTING
   ------------------------------------------------------------

   PARENT TARGET
      TARGET mode
         ↓
      selectTarget()
         ↓
      Render ALL related Sources


   RELATED TARGET
      SOURCE mode
         ↓
      selectTargetForSource()
         ↓
      Show Source ↔ Target cases
============================================================ */

Renderer.handleTargetClick =
  function (
    target,
    role = "PARENT"
  ) {

    if (
      !target
    ) {

      return [];

    }


    const normalizedRole =
      String(
        role ||
        "PARENT"
      )
      .trim()
      .toUpperCase();


    /* ========================================================
       TARGET MODE PARENT CLICK
    ======================================================== */

    if (
      Renderer.mode ===
        "TARGET" &&
      normalizedRole ===
        "PARENT"
    ) {

      return Renderer
        .selectTarget(
          target
        );

    }


    /* ========================================================
       SOURCE MODE RELATED TARGET CLICK
    ======================================================== */

    if (
      Renderer.mode ===
        "SOURCE" &&
      normalizedRole ===
        "RELATED"
    ) {

      return Renderer
        .selectTargetForSource(
          target
        );

    }


    return [];

  };


/* ============================================================
   SOURCE MODE
   🏡 SELECT PARENT SOURCE → RENDER ALL RELATED TARGETS

   REPEATED CLICK BEHAVIOUR
   ------------------------------------------------------------

   Source A clicked
      ↓
   Parent Sources remain untouched
      ↓
   Render ALL Targets of Source A


   Source B clicked
      ↓
   Parent Sources remain untouched
      ↓
   Clear Targets of Source A
      ↓
   Clear Source A highlight
      ↓
   Highlight Source B
      ↓
   Render ALL Targets of Source B


   MANY-TO-MANY SUPPORT
   ------------------------------------------------------------

   One Source can have:

   Source A
      ├── Target 1
      ├── Target 2
      ├── Target 3
      └── Target N

   ALL relationships returned by SpatialEngine are rendered.
============================================================ */

/* ============================================================
   SELECT SOURCE PARENT

   MODE:
       SOURCE → TARGET

   FLOW:
       User clicks SOURCE polygon on map
               ↓
       Source becomes PARENT
               ↓
       Resolve related TARGETS
               ↓
       Targets become CHILDREN
               ↓
       Child polygons may be highlighted on map
               ↓
       Child polygons are NON-INTERACTIVE
               ↓
       UIController.openParentPanel()
               ↓
       Further navigation happens inside panel only:

           CHILD
             ↓
           CASES
             ↓
           CASE DETAILS
             ↓
           FIELD DETAILS

   IMPORTANT
   ------------------------------------------------------------

   GIS interaction ends after PARENT selection.

   CHILD selection is handled by the UI panel.

============================================================ */

Renderer.selectSource =
    function (
        source
    ) {


        const Spatial =
            Renderer
                .getSpatialEngine();


        /* ====================================================
           VALIDATE
        ==================================================== */

        if (
            !Spatial ||
            !source ||
            Renderer.mode !==
                "SOURCE"
        ) {

            return [];

        }


        /* ====================================================
           RESOLVE SOURCE ID
        ==================================================== */

        const sourceId =

            source.canonicalId ||

            source.id;


        if (
            !sourceId
        ) {

            return [];

        }


        /* ====================================================
           CLEAR PREVIOUS SOURCE DRILL-DOWN

           IMPORTANT:

           Parent SOURCE layer remains available.

           This clears only the previous selected-parent
           drill-down state / child rendering.
        ==================================================== */

        Renderer
            .clearSourceDrillDown();


        /* ====================================================
           RESET CURRENT RENDERER STATE

           New parent means everything below the previous
           parent is invalid.
        ==================================================== */

        Renderer.selectedSourceId =
            sourceId;


        Renderer.selectedTargetKey =
            null;


        Renderer.currentTargets =
            [];


        Renderer.currentCases =
            [];


        /* ====================================================
           HIGHLIGHT SELECTED SOURCE PARENT

           This is the GIS-selected PARENT.
        ==================================================== */

        Renderer.renderSource(

            source,

            source.offenceCount ||
                1,

            {
                role:
                    "SELECTED"
            }

        );


        /* ====================================================
           GET SOURCE → TARGET RELATIONSHIPS
        ==================================================== */

        const relations =

            Spatial
                .getTargetsForSource?.(
                    sourceId
                ) ||

            [];


        /* ====================================================
           GET MASTER TARGET LIST
        ==================================================== */

        const allTargets =

            Spatial
                .getTargetRanges?.() ||

            [];


        /* ====================================================
           BUILD CHILD TARGET OBJECTS

           Each resulting target becomes a CHILD in the
           new UI architecture.

           Relationship offenceCount is preserved because
           CHILD cards can display:

               Madarihat Range       12 cases
               Jaldapara Range        7 cases
        ==================================================== */

        const targets =

            relations

                .map(

                    function (
                        relation
                    ) {


                        const relationKey =

                            Renderer
                                .normalizeText(

                                    relation.targetKey ||

                                    relation.targetName ||

                                    relation.name

                                );


                        if (
                            !relationKey
                        ) {

                            return null;

                        }


                        /* ====================================
                           FIND CANONICAL TARGET
                        ==================================== */

                        const target =

                            allTargets.find(

                                function (
                                    item
                                ) {


                                    const itemKey =

                                        Renderer
                                            .normalizeText(

                                                item.cleanName ||

                                                item.name

                                            );


                                    return (

                                        itemKey ===
                                        relationKey

                                    );


                                }

                            );


                        if (
                            !target
                        ) {

                            return null;

                        }


                        /* ====================================
                           BUILD CHILD OBJECT
                        ==================================== */

                        return {

                            ...target,


                            key:

                                relation.targetKey ||

                                target.key ||

                                target.id ||

                                target.cleanName ||

                                target.name,


                            offenceCount:

                                relation.offenceCount ??

                                target.offenceCount ??

                                0,


                            /*
                             * Keep complete relationship.
                             *
                             * This may be required later when
                             * CHILD selection resolves cases.
                             */

                            relation:
                                relation

                        };


                    }

                )


                /* ============================================
                   REMOVE UNRESOLVED TARGET OBJECTS
                ============================================ */

                .filter(
                    Boolean
                )


                /* ============================================
                   KEEP GIS-RESOLVED CHILDREN

                   Child GIS geometry is still useful for:

                       polygon highlight
                       visual relationship

                   But child polygon interaction is disabled
                   below.
                ============================================ */

                .filter(

                    function (
                        target
                    ) {


                        if (
                            target.gisResolved !==
                            true
                        ) {

                            return false;

                        }


                        const targetKey =

                            Renderer
                                .normalizeText(

                                    target.cleanName ||

                                    target.name

                                );


                        return Renderer
                            .rangeFeatureIndex
                            .has(
                                targetKey
                            );


                    }

                );


        /* ====================================================
           RELATED CHILD HEAT SCALE
        ==================================================== */

        const maxCount =

            Math.max(

                1,

                ...targets.map(

                    function (
                        target
                    ) {

                        return (

                            target.offenceCount ||

                            0

                        );

                    }

                )

            );


        /* ====================================================
           STORE CURRENT CHILD TARGETS

           Renderer compatibility:

               currentTargets

           New UIController terminology:

               children
        ==================================================== */

        Renderer.currentTargets =
            targets;


        /* ====================================================
           RENDER CHILD TARGET POLYGONS

           IMPORTANT — CURRENT DESIGN:

           Child polygons may remain visually highlighted.

           They MUST NOT become the next GIS interaction.

           CHILD selection happens from the panel.

           Therefore:

               interactive: false

           is passed explicitly.

           renderTarget() should respect this flag when
           creating/updating its Leaflet layer.
        ==================================================== */

        targets.forEach(

            function (
                target
            ) {


                Renderer.renderTarget(

                    target,

                    maxCount,

                    {
                        role:
                            "RELATED",

                        interactive:
                            false
                    }

                );


            }

        );


        /* ====================================================
           UPDATE NEW PARENT / CHILD PANEL

           SOURCE → TARGET

               parent:
                   source village

               children:
                   related target ranges

           This replaces the OLD:

               openSourceModePanel()

           architecture.
        ==================================================== */

        if (

            GG
                ?.Offence
                ?.UIController
                ?.openParentPanel &&

            typeof
            GG
                .Offence
                .UIController
                .openParentPanel ===
                "function"

        ) {


            GG
                .Offence
                .UIController
                .openParentPanel(

                    source,

                    Renderer.currentTargets

                );


        }

        else {


            console.error(

                "❌ OffenceUIController.openParentPanel() unavailable"

            );


        }


        /* ====================================================
           STATUS / DEBUG
        ==================================================== */

        console.log(

            "🏡 Source parent selected:",

            source.name,

            "→",

            targets.length,

            "target children",

            targets.map(

                function (
                    target
                ) {

                    return {

                        name:
                            target.name,

                        offenceCount:
                            target.offenceCount

                    };

                }

            )

        );


        /* ====================================================
           RETURN CHILDREN
        ==================================================== */

        return targets;


    };

/* ============================================================
   TARGET MODE
   🎯 SELECT PARENT TARGET → RENDER ALL RELATED SOURCES

   REPEATED CLICK BEHAVIOUR
   ------------------------------------------------------------

   Target A clicked
      ↓
   Parent Targets remain untouched
      ↓
   Render ALL Sources of Target A


   Target B clicked
      ↓
   Parent Targets remain untouched
      ↓
   Clear Sources of Target A
      ↓
   Clear Target A highlight
      ↓
   Highlight Target B
      ↓
   Render ALL Sources of Target B


   MANY-TO-MANY SUPPORT
   ------------------------------------------------------------

   One Target can have:

   Target A
      ├── Source 1
      ├── Source 2
      ├── Source 3
      └── Source N
============================================================ */

Renderer.selectTarget =
    function (
        target
    ) {

        const Spatial =
            Renderer
                .getSpatialEngine();


        /* ========================================================
           VALIDATE STATE
        ======================================================== */

        if (
            !Spatial ||
            !target ||
            Renderer.mode !==
                "TARGET"
        ) {

            return [];

        }


        /* ========================================================
           RESOLVE TARGET NAME / KEY
        ======================================================== */

        const targetName =
            target.name;


        const targetKey =
            Renderer
                .normalizeText(

                    target.cleanName ||

                    targetName

                );


        if (
            !targetName ||
            !targetKey
        ) {

            return [];

        }


        /* ========================================================
           CLEAR ONLY PREVIOUS TARGET DRILL-DOWN

           IMPORTANT:

           Parent TARGET layer remains available.

           This clears only:

           - previous selected-parent highlight
           - previous related SOURCE children
           - previous child/case drill-down state
        ======================================================== */

        Renderer
            .clearTargetDrillDown();


        /* ========================================================
           SET NEW TARGET PARENT SELECTION

           A NEW parent invalidates everything below the
           previously selected parent.
        ======================================================== */

        Renderer.selectedTargetKey =
            targetKey;


        Renderer.selectedSourceId =
            null;


        Renderer.currentSources =
            [];


        Renderer.currentCases =
            [];


        /* ========================================================
           RENDER VISUAL TARGET PARENT SELECTION

           SELECTED is visual only.
        ======================================================== */

        Renderer.renderTarget(

            target,

            target.offenceCount ||
                1,

            {
                role:
                    "SELECTED",

                interactive:
                    false
            }

        );


        /* ========================================================
           GET TARGET → SOURCE RELATIONSHIPS
        ======================================================== */

        const relations =

            Spatial
                .getSourcesForTarget?.(
                    targetName
                ) ||

            [];


        /* ========================================================
           BUILD CHILD SOURCE OBJECTS

           TARGET → SOURCE

           Parent:
               selected target range

           Children:
               related source villages
        ======================================================== */

        const sources =

            relations

                .map(

                    function (
                        relation
                    ) {

                        const sourceId =

                            relation.sourceId ||

                            relation.canonicalId ||

                            relation.id;


                        if (
                            !sourceId
                        ) {

                            return null;

                        }


                        const source =

                            Spatial
                                .getSourceVillage?.(
                                    sourceId
                                );


                        if (
                            !source
                        ) {

                            return null;

                        }


                        return {

                            ...source,


                            offenceCount:

                                relation.offenceCount ??

                                source.offenceCount ??

                                0,


                            /*
                             * Preserve the complete relationship.
                             *
                             * This remains available when the
                             * CHILD card is selected from panel.
                             */

                            relation:
                                relation

                        };

                    }

                )

                .filter(
                    Boolean
                )

                /* =================================================
                   KEEP ONLY GIS-RESOLVED SOURCE CHILDREN

                   GIS is used here only to render/highlight the
                   related children.

                   The child polygons themselves are NOT clickable.
                ================================================= */

                .filter(

                    function (
                        source
                    ) {

                        const sourceId =

                            source.canonicalId ||

                            source.id;


                        if (
                            !sourceId
                        ) {

                            return false;

                        }


                        return Renderer
                            .villageFeatureIndex
                            .has(
                                sourceId
                            );

                    }

                );


        /* ========================================================
           CALCULATE CHILD SOURCE HEAT SCALE
        ======================================================== */

        const maxCount =

            Math.max(

                1,

                ...sources.map(

                    function (
                        source
                    ) {

                        return (

                            source.offenceCount ||

                            0

                        );

                    }

                )

            );


        /* ========================================================
           STORE CURRENT CHILD SOURCES
        ======================================================== */

        Renderer.currentSources =
            sources;


        /* ========================================================
           RENDER ALL SOURCE CHILD POLYGONS

           CRITICAL CURRENT DESIGN:

           CHILD polygons are visual only.

           They MUST always be:

               interactive: false

           Child selection happens from the CHILD section
           of the panel — never from the map.
        ======================================================== */

        sources.forEach(

            function (
                source
            ) {

                Renderer.renderSource(

                    source,

                    maxCount,

                    {
                        role:
                            "RELATED",

                        interactive:
                            false
                    }

                );

            }

        );


        /* ========================================================
           POPULATE NEW PARENT / CHILD PANEL

           TARGET → SOURCE

           PARENT:
               selected target range

           CHILD:
               all related source villages

           IMPORTANT:

           This is the missing symmetrical operation corresponding
           to Renderer.selectSource().
        ======================================================== */

        if (

            GG
                ?.Offence
                ?.UIController
                ?.openParentPanel &&

            typeof
            GG
                .Offence
                .UIController
                .openParentPanel ===
                "function"

        ) {

            GG
                .Offence
                .UIController
                .openParentPanel(

                    target,

                    Renderer.currentSources

                );

        }

        else {

            console.error(

                "❌ OffenceUIController.openParentPanel() unavailable"

            );

        }


        /* ========================================================
           STATUS / DEBUG
        ======================================================== */

        console.log(

            "🎯 Target parent selected:",

            targetName,

            "→",

            sources.length,

            "source children",

            sources.map(

                function (
                    source
                ) {

                    return {

                        name:
                            source.name,

                        offenceCount:
                            source.offenceCount

                    };

                }

            )

        );


        /* ========================================================
           RETURN CHILDREN
        ======================================================== */

        return sources;

    };

 /* ============================================================
   SOURCE MODE
   🎯 SELECT RELATED TARGET → GET CASES

   FLOW
   ------------------------------------------------------------

   SOURCE MODE
      ↓
   Parent Source selected
      ↓
   Related Targets rendered
      ↓
   Related Target clicked
      ↓
   Source + Target relationship
      ↓
   Related POR cases


   IMPORTANT
   ------------------------------------------------------------

   This function does NOT clear:

   - Parent Sources
   - Related Targets
   - Selected Source highlight

   Therefore the current spatial context remains visible
   while case information is displayed.
============================================================ */

Renderer.selectTargetForSource =
    function (
        target
    ) {

        const Spatial =
            Renderer.getSpatialEngine();


        /* ========================================================
           VALIDATE STATE
        ======================================================== */

        if (

            !Spatial ||

            !target ||

            Renderer.mode !==
                "SOURCE" ||

            !Renderer.selectedSourceId

        ) {

            return [];

        }


        /* ========================================================
           RESOLVE TARGET NAME
        ======================================================== */

        const targetName =

            target.name ||

            target.cleanName ||

            "";


        if (
            !targetName
        ) {

            return [];

        }


        /* ========================================================
           STORE SELECTED TARGET
        ======================================================== */

        Renderer.selectedTargetKey =

            Renderer.normalizeText(

                target.key ||

                target.id ||

                targetName

            );


        /* ========================================================
           GET SOURCE ↔ TARGET CASES
        ======================================================== */

        const cases =

            Spatial
                .getCasesForSourceTarget?.(

                    Renderer.selectedSourceId,

                    targetName

                )

            ||

            [];


        /* ========================================================
           STORE CURRENT STATE
        ======================================================== */

        Renderer.currentCases =
            cases;


        Renderer.currentCaseContext = {

            direction:
                "SOURCE_TO_TARGET",

            mode:
                "SOURCE",

            sourceId:
                Renderer.selectedSourceId,

            targetName,

            targetKey:
                Renderer.selectedTargetKey

        };


        /* ========================================================
           DEBUG
        ======================================================== */

        console.log(

            "🎯 Related Target selected:",

            targetName,

            "← Source:",

            Renderer.selectedSourceId,

            "→",

            cases.length,

            "cases"

        );


        /* ========================================================
           DISPLAY CASES
        ======================================================== */

        Renderer.showCases(

            cases,

            Renderer.currentCaseContext

        );


        return cases;

    };


/* ============================================================
   TARGET MODE
   🏡 SELECT RELATED SOURCE → GET CASES

   FLOW
   ------------------------------------------------------------

   TARGET MODE
      ↓
   Parent Target selected
      ↓
   Related Sources rendered
      ↓
   Related Source clicked
      ↓
   Source + Target relationship
      ↓
   Related POR cases


   IMPORTANT
   ------------------------------------------------------------

   This function does NOT clear:

   - Parent Targets
   - Related Sources
   - Selected Target highlight
============================================================ */

Renderer.selectSourceForTarget =
    function (
        source
    ) {

        const Spatial =
            Renderer.getSpatialEngine();


        /* ========================================================
           VALIDATE STATE
        ======================================================== */

        if (

            !Spatial ||

            !source ||

            Renderer.mode !==
                "TARGET" ||

            !Renderer.selectedTargetKey

        ) {

            return [];

        }


        /* ========================================================
           RESOLVE SOURCE ID
        ======================================================== */

        const sourceId =

            source.canonicalId ||

            source.id;


        if (
            !sourceId
        ) {

            return [];

        }


        /* ========================================================
           STORE SELECTED SOURCE
        ======================================================== */

        Renderer.selectedSourceId =
            sourceId;


        /* ========================================================
           RESOLVE TARGET OBJECT
        ======================================================== */

        const targets =

            Spatial
                .getTargetRanges?.()

            ||

            [];


        const target =

            targets.find(

                item => {

                    const itemKey =

                        Renderer
                            .normalizeText(

                                item.key ||

                                item.id ||

                                item.cleanName ||

                                item.name

                            );


                    return (

                        itemKey ===
                        Renderer.selectedTargetKey

                    );

                }

            );


        if (
            !target
        ) {

            console.warn(

                "⚠ Selected Target could not be resolved:",

                Renderer.selectedTargetKey

            );

            return [];

        }


        /* ========================================================
           GET SOURCE ↔ TARGET CASES
        ======================================================== */

        const cases =

            Spatial
                .getCasesForSourceTarget?.(

                    sourceId,

                    target.name

                )

            ||

            [];


        /* ========================================================
           STORE CURRENT STATE
        ======================================================== */

        Renderer.currentCases =
            cases;


        Renderer.currentCaseContext = {

            direction:
                "TARGET_TO_SOURCE",

            mode:
                "TARGET",

            sourceId,

            sourceName:

                source.name ||

                source.cleanName ||

                "",

            targetName:
                target.name,

            targetKey:
                Renderer.selectedTargetKey

        };


        /* ========================================================
           DEBUG
        ======================================================== */

        console.log(

            "🏡 Related Source selected:",

            source.name,

            "→ Target:",

            target.name,

            "→",

            cases.length,

            "cases"

        );


        /* ========================================================
           DISPLAY CASES
        ======================================================== */

        Renderer.showCases(

            cases,

            Renderer.currentCaseContext

        );


        return cases;

    };

/* ============================================================
   📋 SHOW SPATIAL CASES

   PURPOSE
   ------------------------------------------------------------

   Central integration point between:

   SpatialRenderer
        ↓
   Case UI


   INTEGRATION PRIORITY
   ------------------------------------------------------------

   1. GG.Offence.UI.showSpatialCases()

   2. GG.Offence.UIController.showSpatialCases()

   3. window.showOffenceSpatialCases()

   4. Console fallback


   IMPORTANT
   ------------------------------------------------------------

   This keeps SpatialRenderer independent from the final
   case-detail UI implementation.

   A future CasePanel or CaseController can be connected here
   without changing spatial rendering.
============================================================ */

Renderer.showCases =
    function (
        cases,
        context = {}
    ) {

        const safeCases =

            Array.isArray(
                cases
            )

                ? cases

                : [];


        /* ========================================================
           STORE CURRENT STATE
        ======================================================== */

        Renderer.currentCases =
            safeCases;


        Renderer.currentCaseContext =
            context || {};


        /* ========================================================
           SYNCHRONIZE UI STATE
        ======================================================== */

        if (

            GG
                ?.Offence
                ?.UIController

        ) {

            GG
                .Offence
                .UIController
                .casePanelExpanded =
                true;

        }


        /* ========================================================
           DEBUG
        ======================================================== */

        console.log(

            "🚨 Offence Spatial Cases",

            {

                context,

                count:
                    safeCases.length,

                cases:
                    safeCases

            }

        );


        /* ========================================================
           PRIMARY UI

           Legacy UI support
        ======================================================== */

        if (

            typeof
            Offence
                ?.UI
                ?.showSpatialCases ===
            "function"

        ) {

            try {

                Offence
                    .UI
                    .showSpatialCases(

                        safeCases,

                        context

                    );

                return safeCases;

            }

            catch (
                error
            ) {

                console.error(

                    "❌ Offence.UI.showSpatialCases failed",

                    error

                );

            }

        }


        /* ========================================================
           UI CONTROLLER

           Current SOURCE MODE implementation
        ======================================================== */

        if (

            typeof
            Offence
                ?.UIController
                ?.showSpatialCases ===
            "function"

        ) {

            try {

                Offence
                    .UIController
                    .showSpatialCases(

                        safeCases,

                        context

                    );

                return safeCases;

            }

            catch (
                error
            ) {

                console.error(

                    "❌ Offence.UIController.showSpatialCases failed",

                    error

                );

            }

        }


        /* ========================================================
           OPTIONAL GLOBAL HOOK
        ======================================================== */

        if (

            typeof
            window
                .showOffenceSpatialCases ===
            "function"

        ) {

            try {

                window
                    .showOffenceSpatialCases(

                        safeCases,

                        context

                    );

                return safeCases;

            }

            catch (
                error
            ) {

                console.error(

                    "❌ showOffenceSpatialCases failed",

                    error

                );

            }

        }


        /* ========================================================
           NO CONNECTED UI
        ======================================================== */

        console.log(

            "ℹ Spatial case UI not connected yet.",

            "Cases available in:",

            "GG.Offence.SpatialRenderer.currentCases"

        );


        return safeCases;

    };

/* ============================================================
   ⚖️ SHOW SPATIAL CASES

   PURPOSE
   ------------------------------------------------------------

   Final bridge between:

   SpatialRenderer
        ↓
   Source ↔ Target relationship
        ↓
   Resolved matching cases
        ↓
   GG.Offence.UI.showSpatialCases()
        ↓
   Case Results Panel
        ↓
   Full POR-authoritative Case Cascade


   RESPONSIBILITY
   ------------------------------------------------------------

   SpatialRenderer does NOT render:

   - Case detail cards
   - Accused details
   - Witness details
   - Seizure details
   - Seized article details

   It only passes the resolved cases and spatial relationship
   context to the Offence UI layer.
============================================================ */

Renderer.showCases =
  function (
    cases,
    context = {}
  ) {

    /* ========================================================
       NORMALIZE CASE ARRAY
    ======================================================== */

    const resolvedCases =

      Array.isArray(
        cases
      )

        ?

        cases.filter(
          Boolean
        )

        :

        [];


    /* ========================================================
       BUILD CANONICAL SPATIAL CONTEXT

       This allows both directions to use the same Case UI:

       SOURCE
          ↓
       TARGET
          ↓
       CASES

       and

       TARGET
          ↓
       SOURCE
          ↓
       CASES
    ======================================================== */

    const resolvedContext = {

      /* ------------------------------------------------------
         ACTIVE RENDERER MODE
      ------------------------------------------------------ */

      mode:

        context.mode

        ||

        Renderer.mode

        ||

        null,


      /* ------------------------------------------------------
         COMPLETE SOURCE OBJECT
      ------------------------------------------------------ */

      source:

        context.source

        ||

        null,


      /* ------------------------------------------------------
         COMPLETE TARGET OBJECT
      ------------------------------------------------------ */

      target:

        context.target

        ||

        null,


      /* ------------------------------------------------------
         SOURCE CANONICAL ID
      ------------------------------------------------------ */

      sourceId:

        context.sourceId

        ||

        context.source
          ?.canonicalId

        ||

        context.source
          ?.id

        ||

        Renderer.selectedSourceId

        ||

        null,


      /* ------------------------------------------------------
         TARGET CANONICAL KEY
      ------------------------------------------------------ */

      targetKey:

        context.targetKey

        ||

        context.target
          ?.key

        ||

        context.target
          ?.id

        ||

        Renderer.selectedTargetKey

        ||

        null,


      /* ------------------------------------------------------
         SOURCE DISPLAY NAME
      ------------------------------------------------------ */

      sourceName:

        context.sourceName

        ||

        context.source
          ?.name

        ||

        null,


      /* ------------------------------------------------------
         TARGET DISPLAY NAME
      ------------------------------------------------------ */

      targetName:

        context.targetName

        ||

        context.target
          ?.name

        ||

        null,


      /* ------------------------------------------------------
         RELATIONSHIP DIRECTION

         Examples:

         SOURCE_TO_TARGET
         TARGET_TO_SOURCE
      ------------------------------------------------------ */

      relationship:

        context.relationship

        ||

        context.direction

        ||

        "SOURCE_TARGET",


      /* ------------------------------------------------------
         TOTAL MATCHING CASES
      ------------------------------------------------------ */

      caseCount:

        resolvedCases.length

    };


    /* ========================================================
       STORE CURRENT CASE STATE

       Keeps the latest selected spatial relationship available
       to the Renderer and future UI navigation.
    ======================================================== */

    Renderer.currentCases =
      resolvedCases;


    Renderer.currentCaseContext =
      resolvedContext;


    /* ========================================================
       DEBUG
    ======================================================== */

    console.log(

      "⚖️ Offence spatial cases resolved",

      {

        mode:

          resolvedContext.mode,


        relationship:

          resolvedContext.relationship,


        source:

          resolvedContext.sourceName

          ||

          resolvedContext.sourceId,


        target:

          resolvedContext.targetName

          ||

          resolvedContext.targetKey,


        caseCount:

          resolvedCases.length

      }

    );


    /* ========================================================
       GET OFFENCE UI

       Expected canonical API:

       GG.Offence.UI.showSpatialCases(
         cases,
         context
       )
    ======================================================== */

    const OffenceUI =

      window.GG
        ?.Offence
        ?.UI

      ||

      null;


    /* ========================================================
       CALL NEW OFFENCE CASE UI
    ======================================================== */

    if (

      OffenceUI

      &&

      typeof OffenceUI
        .showSpatialCases ===
        "function"

    ) {

      try {

        return OffenceUI
          .showSpatialCases(

            resolvedCases,

            resolvedContext

          );

      }

      catch (
        error
      ) {

        console.error(

          "❌ OffenceSpatialRenderer.showCases: " +
          "GG.Offence.UI.showSpatialCases() failed",

          error

        );


        return {

          success:
            false,

          reason:
            "SPATIAL_CASE_UI_ERROR",

          error:
            error,

          cases:
            resolvedCases,

          context:
            resolvedContext

        };

      }

    }


    /* ========================================================
       OPTIONAL GLOBAL FALLBACK

       Useful during development before the final Offence UI
       case panel is installed.

       If this function exists:

       window.showOffenceSpatialCases()

       it will receive the same canonical arguments.
    ======================================================== */

    if (

      typeof window
        .showOffenceSpatialCases ===
        "function"

    ) {

      try {

        return window
          .showOffenceSpatialCases(

            resolvedCases,

            resolvedContext

          );

      }

      catch (
        error
      ) {

        console.error(

          "❌ Global showOffenceSpatialCases() failed",

          error

        );


        return {

          success:
            false,

          reason:
            "GLOBAL_SPATIAL_CASE_UI_ERROR",

          error:
            error,

          cases:
            resolvedCases,

          context:
            resolvedContext

        };

      }

    }


    /* ========================================================
       UI NOT YET AVAILABLE

       This is expected until:

       GG.Offence.UI.showSpatialCases()

       is added.

       The resolved case data is still preserved in:

       Renderer.currentCases
       Renderer.currentCaseContext
    ======================================================== */

    console.warn(

      "⚠ Spatial cases resolved but Case Results UI is not installed",

      {

        expectedFunction:

          "GG.Offence.UI.showSpatialCases",


        caseCount:

          resolvedCases.length,


        context:

          resolvedContext

      }

    );


    /* ========================================================
       RETURN RESULT

       This allows console testing even before the Case Results
       Panel is implemented.
    ======================================================== */

    return {

      success:
        true,

      rendered:
        false,

      reason:
        "SPATIAL_CASE_UI_NOT_INSTALLED",

      caseCount:
        resolvedCases.length,

      cases:
        resolvedCases,

      context:
        resolvedContext

    };

  };


/* ============================================================
   📊 GET RENDERER STATS

   PURPOSE
   ------------------------------------------------------------

   Provides complete runtime diagnostics for:

   - Renderer state
   - Current mode
   - Five-layer architecture
   - Parent polygons
   - Related polygons
   - Current selection
   - Current cases
============================================================ */

/* ============================================================
   📊 GET RENDERER STATS

   PURPOSE
   ------------------------------------------------------------

   Provides complete runtime diagnostics for:

   - Renderer state
   - Current mode
   - Five-layer architecture
   - Parent polygons
   - Related polygons
   - Current Source / Target data
   - Current Case data
   - Current Case relationship context
   - Current spatial selection
   - Leaflet layer state
============================================================ */

Renderer.getStats =
  function () {

    /* ========================================================
       GET MAP
    ======================================================== */

    const map =
      Renderer.getMap();


    /* ========================================================
       RETURN COMPLETE RUNTIME STATE
    ======================================================== */

    return {

      /* ======================================================
         RENDERER STATE
      ====================================================== */

      version:
        Renderer.VERSION,


      initialized:
        Renderer.initialized,


      ready:
        Renderer.ready,


      mode:
        Renderer.mode,


      /* ======================================================
         FEATURE INDEXES

         Village Feature Groups
         ----------------------
         Canonical village GIS feature groups available for
         Source rendering.

         Range Feature Groups
         --------------------
         Canonical range GIS feature groups available for
         Target rendering.
      ====================================================== */

      villageFeatureGroups:
        Renderer
          .villageFeatureIndex
          .size,


      rangeFeatureGroups:
        Renderer
          .rangeFeatureIndex
          .size,


      /* ======================================================
         PARENT RENDER COUNTS

         SOURCE MODE:
         renderedParentSources = all Source polygons.

         TARGET MODE:
         renderedParentTargets = all Target polygons.
      ====================================================== */

      renderedParentSources:
        Renderer
          .renderedParentSourceLayers
          .size,


      renderedParentTargets:
        Renderer
          .renderedParentTargetLayers
          .size,


      /* ======================================================
         RELATED RENDER COUNTS

         SOURCE MODE:
         Source selected
             ↓
         renderedRelatedTargets

         TARGET MODE:
         Target selected
             ↓
         renderedRelatedSources
      ====================================================== */

      renderedRelatedSources:
        Renderer
          .renderedRelatedSourceLayers
          .size,


      renderedRelatedTargets:
        Renderer
          .renderedRelatedTargetLayers
          .size,


      /* ======================================================
         CURRENT SPATIAL DATA
      ====================================================== */

      currentSources:
        Renderer
          .currentSources
          .length,


      currentTargets:
        Renderer
          .currentTargets
          .length,


      /* ======================================================
         CURRENT CASE DATA

         Populated after the complete relationship is selected:

         Source
            ↓
         Target
            ↓
         Cases

         or:

         Target
            ↓
         Source
            ↓
         Cases
      ====================================================== */

      currentCases:
        Renderer
          .currentCases
          .length,


      /* ======================================================
         CURRENT CASE CONTEXT

         Created by:

         Renderer.showCases()

         Expected structure:

         {
           mode,
           relationship,
           source,
           target,
           sourceId,
           targetKey,
           sourceName,
           targetName,
           caseCount
         }

         This is intentionally returned as the complete object
         for runtime diagnostics.
      ====================================================== */

      currentCaseContext:

        Renderer.currentCaseContext

        ||

        null,


      /* ======================================================
         CURRENT SPATIAL SELECTION
      ====================================================== */

      selectedSourceId:
        Renderer
          .selectedSourceId,


      selectedTargetKey:
        Renderer
          .selectedTargetKey,


      /* ======================================================
         MAP LAYER STATE

         These confirm whether each persistent Leaflet layer
         group is currently attached to the map.

         NOTE:

         A layer group being attached to the map does NOT mean
         that it contains rendered polygons.

         Polygon counts are reported separately above.
      ====================================================== */

      parentSourceOnMap:

        !!(
          map

          &&

          Renderer.parentSourceLayer

          &&

          map.hasLayer(
            Renderer.parentSourceLayer
          )
        ),


      parentTargetOnMap:

        !!(
          map

          &&

          Renderer.parentTargetLayer

          &&

          map.hasLayer(
            Renderer.parentTargetLayer
          )
        ),


      relatedSourceOnMap:

        !!(
          map

          &&

          Renderer.relatedSourceLayer

          &&

          map.hasLayer(
            Renderer.relatedSourceLayer
          )
        ),


      relatedTargetOnMap:

        !!(
          map

          &&

          Renderer.relatedTargetLayer

          &&

          map.hasLayer(
            Renderer.relatedTargetLayer
          )
        ),


      selectionOnMap:

        !!(
          map

          &&

          Renderer.selectionLayer

          &&

          map.hasLayer(
            Renderer.selectionLayer
          )
        )

    };

  };


/* ============================================================
   🚀 INITIALIZE SPATIAL RENDERER

   PURPOSE
   ------------------------------------------------------------

   Initializes:

   - Leaflet map reference
   - Five custom panes
   - Five persistent layer groups
   - Village feature index
   - Range feature index


   IMPORTANT
   ------------------------------------------------------------

   init() does NOT automatically render SOURCE or TARGET mode.

   Rendering is controlled by UIController:

   SOURCE button
      ↓
   renderAllSources()


   TARGET button
      ↓
   renderAllTargets()
============================================================ */

Renderer.init =
  function () {

    /* ========================================================
       ALREADY INITIALIZED

       Re-ensure layers in case Leaflet map state changed.
    ======================================================== */

    if (
      Renderer.initialized
    ) {

      Renderer
        .createLayers();


      return Renderer;

    }


    /* ========================================================
       GET MAP
    ======================================================== */

    const map =
      Renderer.getMap();


    if (
      !map
    ) {

      console.warn(

        "⚠ OffenceSpatialRenderer.init: map unavailable"

      );


      return Renderer;

    }


    /* ========================================================
       CREATE FIVE-LAYER ARCHITECTURE
    ======================================================== */

    if (
      !Renderer.createLayers()
    ) {

      console.warn(

        "⚠ OffenceSpatialRenderer.init: layer creation failed"

      );


      return Renderer;

    }


    /* ========================================================
       BUILD GIS INDEXES
    ======================================================== */

    Renderer
      .rebuildIndexes();


    /* ========================================================
       MARK INITIALIZED
    ======================================================== */

    Renderer.initialized =
      true;


    Renderer.ready =
      true;


    /* ========================================================
       DEBUG
    ======================================================== */

    console.log(

      "🚨 OffenceSpatialRenderer Ready",

      Renderer.getStats()

    );


    return Renderer;

  };


/* ============================================================
   🔄 RESET RENDERER

   PURPOSE
   ------------------------------------------------------------

   Clears rendered spatial state while preserving the Renderer
   object itself.

   Useful for debugging or rebuilding GIS indexes.
============================================================ */

Renderer.reset =
  function () {

    /* ========================================================
       CLEAR CURRENT SPATIAL DISPLAY
    ======================================================== */

    Renderer.clear();


    /* ========================================================
       CLEAR GIS INDEXES
    ======================================================== */

    Renderer
      .villageFeatureIndex
      .clear();


    Renderer
      .rangeFeatureIndex
      .clear();


    /* ========================================================
       REBUILD INDEXES
    ======================================================== */

    Renderer
      .rebuildIndexes();


    return Renderer;

  };


/* ============================================================
   🌐 REGISTER SPATIAL RENDERER
============================================================ */

Offence.SpatialRenderer =
  Renderer;


/* ============================================================
   🔥 MODULE LOADED
============================================================ */

console.log(

  "🚨 OffenceSpatialRenderer Loaded",

  Renderer.VERSION

);


})();
