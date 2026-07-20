/* ============================================================
   🚨 GREENGUARD OFFENCE SPATIAL RENDERER
   File:
   js/offence/offenceSpatialRenderer.js

   Version:
   1.0.0

   PURPOSE
   ------------------------------------------------------------
   Leaflet rendering layer for Offence Spatial Analysis.

   Architecture:

   Offence Store
        ↓
   OffenceSpatialEngine
        ↓
   OffenceSpatialRenderer
        ↓
   Leaflet Map

   MODES
   ------------------------------------------------------------

   SOURCE MODE

   All Source Villages
        ↓
   Click Source Village
        ↓
   Target Ranges For Source
        ↓
   Click Target
        ↓
   Cases


   TARGET MODE

   All Target Ranges
        ↓
   Click Target Range
        ↓
   Source Villages For Target
        ↓
   Click Source
        ↓
   Cases

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
      "1.0.0",


    initialized:
      false,


    ready:
      false,


    mode:
      null,


    selectedSourceId:
      null,


    selectedTargetKey:
      null,


    /* ==========================================================
       LEAFLET REFERENCES
    ========================================================== */

    map:
      null,


    sourceLayer:
      null,


    targetLayer:
      null,


    selectionLayer:
      null,


    /* ==========================================================
       FEATURE INDEXES

       These avoid repeatedly scanning all GeoJSON features.
    ========================================================== */

    villageFeatureIndex:
      new Map(),


    rangeFeatureIndex:
      new Map(),


    /* ==========================================================
       RENDERED LAYER INDEXES
    ========================================================== */

    renderedSourceLayers:
      new Map(),


    renderedTargetLayers:
      new Map(),


    /* ==========================================================
       CURRENT DATA
    ========================================================== */

    currentSources:
      [],


    currentTargets:
      [],


    currentCases:
      [],


    /* ==========================================================
       CONFIG
    ========================================================== */

    config: {

      /* --------------------------------------------------------
         PANES

         Keep offence analysis above ordinary GIS polygons.

         Staff marker pane remains untouched.
      -------------------------------------------------------- */

      sourcePane:
        "offenceSourcePane",


      targetPane:
        "offenceTargetPane",


      selectionPane:
        "offenceSelectionPane",


      sourcePaneZIndex:
        460,


      targetPaneZIndex:
        470,


      selectionPaneZIndex:
        480,


      /* --------------------------------------------------------
         OPACITY
      -------------------------------------------------------- */

      sourceFillOpacityMin:
        0.12,


      sourceFillOpacityMax:
        0.68,


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
     🗺 GET MAP
  ============================================================ */

  Renderer.getMap =
    function () {

      if (
        Renderer.map
      ) {

        return Renderer.map;

      }


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

    };


  /* ============================================================
     🏗 CREATE MAP PANE
  ============================================================ */

  Renderer.ensurePane =
    function (
      paneName,
      zIndex
    ) {

      const map =
        Renderer.getMap();


      if (
        !map
      ) {

        return null;

      }


      let pane =
        map.getPane(
          paneName
        );


      if (
        !pane
      ) {

        pane =
          map.createPane(
            paneName
          );

      }


      pane.style.zIndex =
        String(
          zIndex
        );


      pane.style.pointerEvents =
        "auto";


      return pane;

    };


  /* ============================================================
     🏗 CREATE LEAFLET LAYERS
  ============================================================ */

/* ============================================================
   🏗 CREATE LEAFLET LAYERS

   PURPOSE
   ------------------------------------------------------------
   Creates and attaches the three Offence Spatial Renderer
   layer groups:

   sourceLayer
      → Source village polygons

   targetLayer
      → Target range polygons

   selectionLayer
      → Selected/highlighted source or target polygon

   IMPORTANT
   ------------------------------------------------------------
   Layer groups are created only once.

   If they already exist, they are reused.

   All three layer groups are guaranteed to be attached
   to the current Leaflet map.
============================================================ */

Renderer.createLayers =
  function () {

    /* ========================================================
       GET LEAFLET MAP
    ======================================================== */

    const map =
      Renderer.getMap();


    /* ========================================================
       VALIDATE DEPENDENCIES
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
       CREATE / ENSURE SOURCE PANE

       Used for:
       Source village polygons
    ======================================================== */

    Renderer.ensurePane(

      Renderer
        .config
        .sourcePane,

      Renderer
        .config
        .sourcePaneZIndex

    );


    /* ========================================================
       CREATE / ENSURE TARGET PANE

       Used for:
       Target range polygons
    ======================================================== */

    Renderer.ensurePane(

      Renderer
        .config
        .targetPane,

      Renderer
        .config
        .targetPaneZIndex

    );


    /* ========================================================
       CREATE / ENSURE SELECTION PANE

       Used for:
       Selected source village
       Selected target range
    ======================================================== */

    Renderer.ensurePane(

      Renderer
        .config
        .selectionPane,

      Renderer
        .config
        .selectionPaneZIndex

    );


    /* ========================================================
       CREATE SOURCE LAYER GROUP

       Reuse existing layer if already created.
    ======================================================== */

    Renderer.sourceLayer =

      Renderer.sourceLayer

      ||

      L.layerGroup();


    /* ========================================================
       CREATE TARGET LAYER GROUP

       Reuse existing layer if already created.
    ======================================================== */

    Renderer.targetLayer =

      Renderer.targetLayer

      ||

      L.layerGroup();


    /* ========================================================
       CREATE SELECTION LAYER GROUP

       Reuse existing layer if already created.
    ======================================================== */

    Renderer.selectionLayer =

      Renderer.selectionLayer

      ||

      L.layerGroup();


    /* ========================================================
       ATTACH SOURCE LAYER TO MAP

       Do not add twice.
    ======================================================== */

    if (
      !map.hasLayer(
        Renderer.sourceLayer
      )
    ) {

      Renderer
        .sourceLayer
        .addTo(
          map
        );

    }


    /* ========================================================
       ATTACH TARGET LAYER TO MAP

       Required for:

       SOURCE
          ↓
       Click village
          ↓
       Related target ranges become visible
    ======================================================== */

    if (
      !map.hasLayer(
        Renderer.targetLayer
      )
    ) {

      Renderer
        .targetLayer
        .addTo(
          map
        );

    }


    /* ========================================================
       ATTACH SELECTION LAYER TO MAP

       Required for selected polygon highlighting.
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
     🏡 BUILD VILLAGE FEATURE INDEX

     RAW GEOJSON SOURCE PRIORITY:

     1. window.__villageBoundaryGeoJSON
     2. window.villageBoundaryGeoJSON
     3. Existing rendered villageBoundaryLayer

     Index key:

     VILLAGE_CODE::CLEAN_NAME
  ============================================================ */

  Renderer.buildVillageFeatureIndex =
    function () {

      Renderer
        .villageFeatureIndex
        .clear();


      let features =
        [];


      /* --------------------------------------------------------
         RAW GEOJSON
      -------------------------------------------------------- */

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


      /* --------------------------------------------------------
         FALLBACK:
         EXISTING LEAFLET VILLAGE LAYER
      -------------------------------------------------------- */

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


      /* --------------------------------------------------------
         BUILD INDEX
      -------------------------------------------------------- */

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

     Uses current GreenGuard GIS data:

     window.allGISFeatures

     One range can contain multiple feature polygons.
  ============================================================ */

  Renderer.buildRangeFeatureIndex =
    function () {

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

     Returns:
     0 → 1
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


      /*
       * Square-root scaling.
       *
       * Prevents one very high-count polygon from making
       * all smaller polygons visually indistinguishable.
       */

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

        pane:
          selected

          ?

          Renderer
            .config
            .selectionPane

          :

          Renderer
            .config
            .sourcePane,


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

        pane:
          selected

          ?

          Renderer
            .config
            .selectionPane

          :

          Renderer
            .config
            .targetPane,


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
     🏷 SOURCE TOOLTIP
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
     🏷 TARGET TOOLTIP
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
     🧹 CLEAR SOURCE LAYER
  ============================================================ */

  Renderer.clearSources =
    function () {

      Renderer
        .sourceLayer
        ?.clearLayers?.();


      Renderer
        .renderedSourceLayers
        .clear();


      Renderer.currentSources =
        [];

    };


  /* ============================================================
     🧹 CLEAR TARGET LAYER
  ============================================================ */

  Renderer.clearTargets =
    function () {

      Renderer
        .targetLayer
        ?.clearLayers?.();


      Renderer
        .renderedTargetLayers
        .clear();


      Renderer.currentTargets =
        [];

    };


  /* ============================================================
     🧹 CLEAR SELECTION
  ============================================================ */

  Renderer.clearSelection =
    function () {

      Renderer
        .selectionLayer
        ?.clearLayers?.();

    };


  /* ============================================================
     🧹 CLEAR ALL OFFENCE SPATIAL LAYERS
  ============================================================ */

  Renderer.clear =
    function () {

      Renderer
        .clearSources();


      Renderer
        .clearTargets();


      Renderer
        .clearSelection();


      Renderer.selectedSourceId =
        null;


      Renderer.selectedTargetKey =
        null;


      Renderer.currentCases =
        [];


      Renderer.mode =
        null;

    };


  /* ============================================================
     🏡 RENDER ONE SOURCE VILLAGE
  ============================================================ */

  Renderer.renderSource =
    function (
      source,
      maxCount,
      options = {}
    ) {

      const map =
        Renderer.getMap();


      if (
        !map ||
        !source
      ) {

        return null;

      }


      const sourceId =

        source.canonicalId

        ||

        source.id;


      if (
        !sourceId
      ) {

        return null;

      }


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


      const selected =
        options.selected ===
        true;


      const parentLayer =
        selected

        ?

        Renderer.selectionLayer

        :

        Renderer.sourceLayer;


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

              selected

              ?

              Renderer
                .config
                .selectionPane

              :

              Renderer
                .config
                .sourcePane,


            interactive:
              true,


            style:
              function () {

                return Renderer
                  .getSourceStyle(

                    source.offenceCount,

                    maxCount,

                    selected

                  );

              },


            onEachFeature:
              function (
                feature,
                layer
              ) {

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


                layer.on(

                  "mouseout",

                  function () {

                    geoLayer.resetStyle(
                      layer
                    );

                  }

                );


                layer.on(

                  "click",

                  function (
                    e
                  ) {

                    L
                      .DomEvent
                      .stopPropagation(
                        e
                      );


                    Renderer
                      .handleSourceClick(
                        source
                      );

                  }

                );

              }

          }

        );


      geoLayer.addTo(
        parentLayer
      );


      Renderer
        .renderedSourceLayers
        .set(
          sourceId,
          geoLayer
        );


      return geoLayer;

    };


  /* ============================================================
     🎯 RENDER ONE TARGET RANGE
  ============================================================ */

  Renderer.renderTarget =
    function (
      target,
      maxCount,
      options = {}
    ) {

      if (
        !target
      ) {

        return null;

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

        return null;

      }


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


      const selected =
        options.selected ===
        true;


      const parentLayer =
        selected

        ?

        Renderer.selectionLayer

        :

        Renderer.targetLayer;


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

              selected

              ?

              Renderer
                .config
                .selectionPane

              :

              Renderer
                .config
                .targetPane,


            interactive:
              true,


            style:
              function () {

                return Renderer
                  .getTargetStyle(

                    target.offenceCount,

                    maxCount,

                    selected

                  );

              },


            onEachFeature:
              function (
                feature,
                layer
              ) {

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


                layer.on(

                  "mouseout",

                  function () {

                    geoLayer.resetStyle(
                      layer
                    );

                  }

                );


                layer.on(

                  "click",

                  function (
                    e
                  ) {

                    L
                      .DomEvent
                      .stopPropagation(
                        e
                      );


                    Renderer
                      .handleTargetClick(
                        target
                      );

                  }

                );

              }

          }

        );


      geoLayer.addTo(
        parentLayer
      );


      Renderer
        .renderedTargetLayers
        .set(
          targetKey,
          geoLayer
        );


      return geoLayer;

    };


  /* ============================================================
     🏡 RENDER ALL SOURCE VILLAGES

     Used when user clicks:

     OFFENCE → SOURCE
  ============================================================ */

  Renderer.renderAllSources =
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
          "⚠ OffenceSpatialRenderer dependencies unavailable"
        );

        return [];

      }


      Renderer.clear();


      Renderer.mode =
        "SOURCE";


      Renderer.buildVillageFeatureIndex();


      const sources =
        Spatial
          .getSourceVillages()
          .filter(

            source => {

              const id =

                source.canonicalId

                ||

                source.id;


              return Renderer
                .villageFeatureIndex
                .has(
                  id
                );

            }

          );


      const maxCount =
        Math.max(

          1,

          ...sources.map(
            source =>
              source.offenceCount
              ||
              0
          )

        );


      Renderer.currentSources =
        sources;


      sources.forEach(

        source => {

          Renderer.renderSource(

            source,

            maxCount

          );

        }

      );


      Renderer
        .sourceLayer
        .addTo(
          map
        );


      console.log(

        "🚨 Offence SOURCE heatmap rendered:",

        sources.length,

        "villages"

      );


      return sources;

    };


  /* ============================================================
     🎯 RENDER ALL TARGET RANGES

     Used when user clicks:

     OFFENCE → TARGET
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
          "⚠ OffenceSpatialRenderer dependencies unavailable"
        );

        return [];

      }


      Renderer.clear();


      Renderer.mode =
        "TARGET";


      Renderer.buildRangeFeatureIndex();


      const targets =
        Spatial
          .getTargetRanges()
          .filter(

            target => {

              if (
                target.gisResolved !==
                true
              ) {

                return false;

              }


              const key =
                Renderer
                  .normalizeText(

                    target.cleanName

                    ||

                    target.name

                  );


              return Renderer
                .rangeFeatureIndex
                .has(
                  key
                );

            }

          );


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


      Renderer.currentTargets =
        targets;


      targets.forEach(

        target => {

          Renderer.renderTarget(

            target,

            maxCount

          );

        }

      );


      Renderer
        .targetLayer
        .addTo(
          map
        );


      console.log(

        "🚨 Offence TARGET heatmap rendered:",

        targets.length,

        "ranges"

      );


      return targets;

    };


  /* ============================================================
     🏡 HANDLE SOURCE CLICK
  ============================================================ */

  Renderer.handleSourceClick =
    function (
      source
    ) {

      if (
        !source
      ) {

        return;

      }


      if (
        Renderer.mode ===
        "SOURCE"
      ) {

        Renderer
          .selectSource(
            source
          );

        return;

      }


      if (
        Renderer.mode ===
        "TARGET"
      ) {

        Renderer
          .selectSourceForTarget(
            source
          );

      }

    };


  /* ============================================================
     🎯 HANDLE TARGET CLICK
  ============================================================ */

  Renderer.handleTargetClick =
    function (
      target
    ) {

      if (
        !target
      ) {

        return;

      }


      if (
        Renderer.mode ===
        "SOURCE"
      ) {

        Renderer
          .selectTargetForSource(
            target
          );

        return;

      }


      if (
        Renderer.mode ===
        "TARGET"
      ) {

        Renderer
          .selectTarget(
            target
          );

      }

    };


  /* ============================================================
     SOURCE MODE
     🏡 SELECT SOURCE → RENDER TARGETS
  ============================================================ */

  Renderer.selectSource =
    function (
      source
    ) {

      const Spatial =
        Renderer
          .getSpatialEngine();


      if (
        !Spatial ||
        !source
      ) {

        return [];

      }


      const sourceId =

        source.canonicalId

        ||

        source.id;


      Renderer.selectedSourceId =
        sourceId;


      Renderer.selectedTargetKey =
        null;


      Renderer.clearTargets();


      Renderer.clearSelection();


      /* --------------------------------------------------------
         HIGHLIGHT SELECTED SOURCE
      -------------------------------------------------------- */

      Renderer.renderSource(

        source,

        source.offenceCount ||
        1,

        {
          selected:
            true
        }

      );


      /* --------------------------------------------------------
         GET TARGET RELATIONSHIPS
      -------------------------------------------------------- */

      const relations =
        Spatial
          .getTargetsForSource(
            sourceId
          );


      /* --------------------------------------------------------
         CONVERT RELATIONSHIPS TO TARGET OBJECTS
      -------------------------------------------------------- */

      const targets =

        relations

        .map(

          relation => {

            const target =
              Spatial
                .getTargetRanges()
                .find(

                  item =>

                    Renderer
                      .normalizeText(
                        item.name
                      )

                    ===

                    Renderer
                      .normalizeText(
                        relation.targetName
                      )

                );


            if (
              !target
            ) {

              return null;

            }


            return {

              ...target,

              offenceCount:
                relation.offenceCount,

              relation:
                relation

            };

          }

        )

        .filter(
          Boolean
        )

        .filter(

          target =>

            target.gisResolved ===
            true

        );


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


      Renderer.currentTargets =
        targets;


      targets.forEach(

        target => {

          Renderer.renderTarget(

            target,

            maxCount

          );

        }

      );


      Renderer
        .targetLayer
        .addTo(
          Renderer.map
        );


      console.log(

        "🏡 Source selected:",

        source.name,

        "→",

        targets.length,

        "target ranges"

      );


      return targets;

    };


  /* ============================================================
     SOURCE MODE
     🎯 SELECT TARGET → SHOW CASES
  ============================================================ */

  Renderer.selectTargetForSource =
    function (
      target
    ) {

      const Spatial =
        Renderer
          .getSpatialEngine();


      if (
        !Spatial ||
        !Renderer.selectedSourceId
      ) {

        return [];

      }


      const targetName =
        target.name;


      Renderer.selectedTargetKey =
        Renderer
          .normalizeText(
            targetName
          );


      const cases =
        Spatial
          .getCasesForSourceTarget(

            Renderer
              .selectedSourceId,

            targetName

          );


      Renderer.currentCases =
        cases;


      Renderer.showCases(

        cases,

        {

          direction:
            "SOURCE_TO_TARGET",

          sourceId:
            Renderer
              .selectedSourceId,

          targetName:
            targetName

        }

      );


      return cases;

    };


  /* ============================================================
     TARGET MODE
     🎯 SELECT TARGET → RENDER SOURCES
  ============================================================ */

  Renderer.selectTarget =
    function (
      target
    ) {

      const Spatial =
        Renderer
          .getSpatialEngine();


      if (
        !Spatial ||
        !target
      ) {

        return [];

      }


      const targetName =
        target.name;


      Renderer.selectedTargetKey =
        Renderer
          .normalizeText(
            targetName
          );


      Renderer.selectedSourceId =
        null;


      Renderer.clearSources();


      Renderer.clearSelection();


      /* --------------------------------------------------------
         HIGHLIGHT SELECTED TARGET
      -------------------------------------------------------- */

      Renderer.renderTarget(

        target,

        target.offenceCount ||
        1,

        {
          selected:
            true
        }

      );


      /* --------------------------------------------------------
         GET SOURCE RELATIONSHIPS
      -------------------------------------------------------- */

      const relations =
        Spatial
          .getSourcesForTarget(
            targetName
          );


      const sources =

        relations

        .map(

          relation => {

            const source =
              Spatial
                .getSourceVillage(
                  relation.sourceId
                );


            if (
              !source
            ) {

              return null;

            }


            return {

              ...source,

              offenceCount:
                relation.offenceCount,

              relation:
                relation

            };

          }

        )

        .filter(
          Boolean
        );


      const maxCount =
        Math.max(

          1,

          ...sources.map(
            source =>
              source.offenceCount
              ||
              0
          )

        );


      Renderer.currentSources =
        sources;


      sources.forEach(

        source => {

          Renderer.renderSource(

            source,

            maxCount

          );

        }

      );


      Renderer
        .sourceLayer
        .addTo(
          Renderer.map
        );


      console.log(

        "🎯 Target selected:",

        targetName,

        "→",

        sources.length,

        "source villages"

      );


      return sources;

    };


  /* ============================================================
     TARGET MODE
     🏡 SELECT SOURCE → SHOW CASES
  ============================================================ */

  Renderer.selectSourceForTarget =
    function (
      source
    ) {

      const Spatial =
        Renderer
          .getSpatialEngine();


      if (
        !Spatial ||
        !Renderer.selectedTargetKey
      ) {

        return [];

      }


      const sourceId =

        source.canonicalId

        ||

        source.id;


      Renderer.selectedSourceId =
        sourceId;


      /*
       * Find original target name because
       * getCasesForSourceTarget expects target name.
       */

      const target =
        Spatial
          .getTargetRanges()
          .find(

            item =>

              Renderer
                .normalizeText(
                  item.name
                )

              ===

              Renderer
                .selectedTargetKey

          );


      if (
        !target
      ) {

        return [];

      }


      const cases =
        Spatial
          .getCasesForSourceTarget(

            sourceId,

            target.name

          );


      Renderer.currentCases =
        cases;


      Renderer.showCases(

        cases,

        {

          direction:
            "TARGET_TO_SOURCE",

          sourceId:
            sourceId,

          targetName:
            target.name

        }

      );


      return cases;

    };


  /* ============================================================
     📋 SHOW CASES

     Integration hook.

     If GreenGuard later provides:

     GG.Offence.UI.showSpatialCases()

     it will automatically use that.

     Until then it logs the result.
  ============================================================ */

  Renderer.showCases =
    function (
      cases,
      context = {}
    ) {

      console.log(
        "🚨 Offence Spatial Cases:",
        {
          context:
            context,

          count:
            cases.length,

          cases:
            cases
        }
      );


      /* --------------------------------------------------------
         FUTURE / OPTIONAL UI INTEGRATION
      -------------------------------------------------------- */

      if (
        typeof Offence
          ?.UI
          ?.showSpatialCases ===
        "function"
      ) {

        Offence
          .UI
          .showSpatialCases(

            cases,

            context

          );


        return;

      }


      /* --------------------------------------------------------
         OPTIONAL GLOBAL HOOK
      -------------------------------------------------------- */

      if (
        typeof window
          .showOffenceSpatialCases ===
        "function"
      ) {

        window
          .showOffenceSpatialCases(

            cases,

            context

          );

      }

    };


  /* ============================================================
     🔄 REFRESH INDEXES
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
     📊 GET STATS
  ============================================================ */

  Renderer.getStats =
    function () {

      return {

        version:
          Renderer.VERSION,

        initialized:
          Renderer.initialized,

        ready:
          Renderer.ready,

        mode:
          Renderer.mode,

        villageFeatureGroups:
          Renderer
            .villageFeatureIndex
            .size,

        rangeFeatureGroups:
          Renderer
            .rangeFeatureIndex
            .size,

        renderedSources:
          Renderer
            .renderedSourceLayers
            .size,

        renderedTargets:
          Renderer
            .renderedTargetLayers
            .size,

        currentSources:
          Renderer
            .currentSources
            .length,

        currentTargets:
          Renderer
            .currentTargets
            .length,

        currentCases:
          Renderer
            .currentCases
            .length,

        selectedSourceId:
          Renderer
            .selectedSourceId,

        selectedTargetKey:
          Renderer
            .selectedTargetKey

      };

    };


  /* ============================================================
     🚀 INITIALIZE
  ============================================================ */

  Renderer.init =
    function () {

      if (
        Renderer.initialized
      ) {

        return Renderer;

      }


      const map =
        Renderer.getMap();


      if (
        !map
      ) {

        console.warn(
          "⚠ OffenceSpatialRenderer: map unavailable"
        );

        return Renderer;

      }


      if (
        !Renderer.createLayers()
      ) {

        return Renderer;

      }


      Renderer.rebuildIndexes();


      Renderer.initialized =
        true;


      Renderer.ready =
        true;


      console.log(

        "🚨 OffenceSpatialRenderer Ready",

        Renderer.getStats()

      );


      return Renderer;

    };


  /* ============================================================
     🌐 REGISTER
  ============================================================ */

  Offence.SpatialRenderer =
    Renderer;


  console.log(

    "🚨 OffenceSpatialRenderer Loaded",

    Renderer.VERSION

  );

})();
