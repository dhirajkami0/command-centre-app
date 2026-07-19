/* =========================================================
   GreenGuard
   Offence Intelligence Module

   File:
   js/offence/offenceMapRenderer.js

   Version:
   2.1.0

   PURPOSE:
   ---------------------------------------------------------
   Render offence intelligence hotspots on the Leaflet map.

   Supports:

   SOURCE HEATMAP
       → accused / source origin locations

   TARGET HEATMAP
       → offence / seizure / destination / target locations


   ARCHITECTURE:
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
   Leaflet Heat Layer / Hotspot Marker
       ↓
   hotspot click
       ↓
   offence:hotspot-click
       ↓
   OffenceCascadeController
       ↓
   POR-authoritative cascade
       ↓
   OffenceCascadeRenderer


   AUTHORITATIVE RELATIONSHIP:
   ---------------------------------------------------------

   POR No / Ref POR No
       ↓
   normalized porKey
       ↓
   Cases / Accused / Witnesses /
   Seizures / Seized Articles /
   SOURCE / TARGET


   IMPORTANT:
   ---------------------------------------------------------

   This module:

   - DOES render Leaflet layers
   - DOES render SOURCE heatmaps
   - DOES render TARGET heatmaps
   - DOES create hotspot interaction markers
   - DOES emit hotspot-click events
   - DOES pass POR information to cascade layer

   This module DOES NOT:

   - access Firestore
   - geocode addresses
   - normalize offence records
   - resolve POR relationships
   - build cascade UI
   - manipulate CascadeController state

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


    const HeatmapEngine =
        GG.Offence.HeatmapEngine;


    if (!Constants) {

        console.error(
            "[OffenceMapRenderer] OffenceConstants unavailable."
        );

        return;

    }


    if (!HeatmapEngine) {

        console.error(
            "[OffenceMapRenderer] OffenceHeatmapEngine unavailable."
        );

        return;

    }


    if (
        typeof window.L ===
        "undefined"
    ) {

        console.error(
            "[OffenceMapRenderer] Leaflet unavailable."
        );

        return;

    }


    /* =====================================================
       3. MODULE
       ===================================================== */

    const MapRenderer = {};


    MapRenderer.VERSION =
        "2.1.0";


    MapRenderer.initialized =
        false;


    MapRenderer.visible =
        false;


    MapRenderer.currentMode =
        "ALL";


    MapRenderer.map =
        null;


    MapRenderer._eventsBound =
        false;


    /* =====================================================
       4. MODES
       ===================================================== */

    MapRenderer.MODE =
        Object.freeze({

            ALL:
                "ALL",

            SOURCE:
                "SOURCE",

            TARGET:
                "TARGET"

        });


    MapRenderer.TYPE_SOURCE =
        "SOURCE";


    MapRenderer.TYPE_TARGET =
        "TARGET";


    /* =====================================================
       5. CONFIGURATION
       ===================================================== */

    MapRenderer.CONFIG = {

        source: {

            radius:
                28,

            blur:
                22,

            maxZoom:
                17,

            minOpacity:
                0.35

        },


        target: {

            radius:
                30,

            blur:
                24,

            maxZoom:
                17,

            minOpacity:
                0.35

        },


        interaction: {

            radius:
                18,

            fillOpacity:
                0.01,

            opacity:
                0.01,

            weight:
                1

        },


        hotspotMarker: {

            radius:
                7,

            weight:
                2,

            opacity:
                0.8,

            fillOpacity:
                0.45

        }

    };


    /* =====================================================
       6. LAYER REFERENCES
       ===================================================== */

    MapRenderer.layers = {

        root:
            null,

        source:
            null,

        target:
            null,

        sourceHeat:
            null,

        targetHeat:
            null,

        sourceInteraction:
            null,

        targetInteraction:
            null,

        sourceMarkers:
            null,

        targetMarkers:
            null

    };


    /* =====================================================
       7. INITIALIZE
       ===================================================== */

    MapRenderer.init =
        function (
            map = null,
            options = {}
        ) {

            /*
             * Already initialized.
             *
             * Allow a map to be attached later if the module
             * was initialized before Leaflet map creation.
             */

            if (
                MapRenderer.initialized
            ) {

                if (
                    map &&
                    MapRenderer.map !==
                        map
                ) {

                    MapRenderer
                        .setMap(
                            map
                        );

                }


                return MapRenderer;

            }


            /*
             * Apply optional runtime configuration.
             */

            if (
                options &&
                typeof options ===
                    "object"
            ) {

                MapRenderer
                    .applyOptions(
                        options
                    );

            }


            /*
             * Resolve Leaflet map.
             */

            const resolvedMap =

                map ||

                MapRenderer
                    .resolveMap();


            if (!resolvedMap) {

                console.warn(
                    "[OffenceMapRenderer] Leaflet map not available yet."
                );


                return MapRenderer;

            }


            MapRenderer.map =
                resolvedMap;


            /*
             * Build offence-specific Leaflet layer hierarchy.
             */

            MapRenderer
                .createLayers();


            /*
             * Listen for offence engine updates.
             */

            MapRenderer
                .bindEvents();


            MapRenderer.initialized =
                true;


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(

                    "🔥 OffenceMapRenderer Ready",

                    {

                        version:
                            MapRenderer.VERSION,

                        mode:
                            MapRenderer.currentMode,

                        mapAvailable:
                            !!MapRenderer.map,

                        connector:
                            "POR"

                    }

                );

            }


            return MapRenderer;

        };


    /* =====================================================
       8. APPLY OPTIONS
       ===================================================== */

    MapRenderer.applyOptions =
        function (
            options = {}
        ) {

            if (
                options.source &&
                typeof options.source ===
                    "object"
            ) {

                Object.assign(

                    MapRenderer
                        .CONFIG
                        .source,

                    options.source

                );

            }


            if (
                options.target &&
                typeof options.target ===
                    "object"
            ) {

                Object.assign(

                    MapRenderer
                        .CONFIG
                        .target,

                    options.target

                );

            }


            if (
                options.interaction &&
                typeof options.interaction ===
                    "object"
            ) {

                Object.assign(

                    MapRenderer
                        .CONFIG
                        .interaction,

                    options.interaction

                );

            }


            if (
                options.hotspotMarker &&
                typeof options.hotspotMarker ===
                    "object"
            ) {

                Object.assign(

                    MapRenderer
                        .CONFIG
                        .hotspotMarker,

                    options.hotspotMarker

                );

            }


            return MapRenderer.CONFIG;

        };


    /* =====================================================
       9. RESOLVE MAP

       Supports common GreenGuard map globals.

       Preferred initialization:

       GG.Offence.MapRenderer.init(map)

       ===================================================== */

    MapRenderer.resolveMap =
        function () {

            const candidates = [

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
                        "function" &&
                    typeof candidate.hasLayer ===
                        "function"
                ) {

                    return candidate;

                }

            }


            return null;

        };


    /* =====================================================
       10. SET MAP

       Allows the Leaflet map to be attached or replaced
       after this module has loaded.

       ===================================================== */

    MapRenderer.setMap =
        function (
            map
        ) {

            if (!map) {

                return false;

            }


            if (
                typeof map.addLayer !==
                    "function" ||
                typeof map.removeLayer !==
                    "function"
            ) {

                console.error(
                    "[OffenceMapRenderer] Invalid Leaflet map instance."
                );

                return false;

            }


            if (
                MapRenderer.map ===
                    map
            ) {

                return true;

            }


            /*
             * Remove layers from previous map.
             */

            MapRenderer
                .removeLayers();


            MapRenderer.map =
                map;


            /*
             * Recreate offence layer structure.
             */

            MapRenderer
                .createLayers();


            /*
             * Restore visibility if offence heatmap was active.
             */

            if (
                MapRenderer.visible
            ) {

                MapRenderer
                    .show();

            }


            return true;

        };


    /* =====================================================
       11. CREATE LAYERS

       Layer hierarchy:

       root
       ├── source
       │   ├── sourceHeat
       │   ├── sourceInteraction
       │   └── sourceMarkers
       │
       └── target
           ├── targetHeat
           ├── targetInteraction
           └── targetMarkers

       ===================================================== */

    MapRenderer.createLayers =
        function () {

            if (
                !MapRenderer.map
            ) {

                return false;

            }


            /*
             * Remove any existing offence layers before
             * rebuilding the hierarchy.
             */

            MapRenderer
                .removeLayers();


            MapRenderer.layers.root =

                L.layerGroup();


            MapRenderer.layers.source =

                L.layerGroup();


            MapRenderer.layers.target =

                L.layerGroup();


            MapRenderer.layers.sourceInteraction =

                L.layerGroup();


            MapRenderer.layers.targetInteraction =

                L.layerGroup();


            MapRenderer.layers.sourceMarkers =

                L.layerGroup();


            MapRenderer.layers.targetMarkers =

                L.layerGroup();


            /*
             * SOURCE children.
             */

            MapRenderer.layers.source.addLayer(

                MapRenderer
                    .layers
                    .sourceInteraction

            );


            MapRenderer.layers.source.addLayer(

                MapRenderer
                    .layers
                    .sourceMarkers

            );


            /*
             * TARGET children.
             */

            MapRenderer.layers.target.addLayer(

                MapRenderer
                    .layers
                    .targetInteraction

            );


            MapRenderer.layers.target.addLayer(

                MapRenderer
                    .layers
                    .targetMarkers

            );


            /*
             * Add SOURCE and TARGET groups to root.
             */

            MapRenderer.layers.root.addLayer(

                MapRenderer
                    .layers
                    .source

            );


            MapRenderer.layers.root.addLayer(

                MapRenderer
                    .layers
                    .target

            );


            return true;

        };


    /* =====================================================
       12. BIND EVENTS

       MapRenderer reacts to:

       offence:heatmap-updated
           → HeatmapEngine rebuilt hotspot data

       offence:data-ready
           → offence data pipeline completed

       ===================================================== */

    MapRenderer.bindEvents =
        function () {

            if (
                MapRenderer._eventsBound
            ) {

                return;

            }


            MapRenderer._eventsBound =
                true;


            /*
             * Heatmap rebuilt.
             */

            window.addEventListener(

                Constants.EVENTS
                    ?.HEATMAP_UPDATED ||

                "offence:heatmap-updated",

                MapRenderer
                    .handleHeatmapUpdated

            );


            /*
             * Offence data ready.
             */

            window.addEventListener(

                Constants.EVENTS
                    ?.DATA_READY ||

                "offence:data-ready",

                MapRenderer
                    .handleDataReady

            );

        };


    /* =====================================================
       13. UNBIND EVENTS
       ===================================================== */

    MapRenderer.unbindEvents =
        function () {

            if (
                !MapRenderer._eventsBound
            ) {

                return;

            }


            window.removeEventListener(

                Constants.EVENTS
                    ?.HEATMAP_UPDATED ||

                "offence:heatmap-updated",

                MapRenderer
                    .handleHeatmapUpdated

            );


            window.removeEventListener(

                Constants.EVENTS
                    ?.DATA_READY ||

                "offence:data-ready",

                MapRenderer
                    .handleDataReady

            );


            MapRenderer._eventsBound =
                false;

        };


    /* =====================================================
       14. HANDLE HEATMAP UPDATED
       ===================================================== */

    MapRenderer.handleHeatmapUpdated =
        function () {

            /*
             * Only render if a map has already been attached.
             */

            if (
                !MapRenderer.map
            ) {

                return;

            }


            MapRenderer
                .render({

                    show:
                        MapRenderer.visible

                });

        };


    /* =====================================================
       15. HANDLE DATA READY
       ===================================================== */

    MapRenderer.handleDataReady =
        function () {

            /*
             * Data may become ready before Leaflet map.
             * Try resolving the map again.
             */

            if (
                !MapRenderer.map
            ) {

                const resolvedMap =

                    MapRenderer
                        .resolveMap();


                if (
                    resolvedMap
                ) {

                    MapRenderer.map =
                        resolvedMap;


                    MapRenderer
                        .createLayers();

                }

            }


            if (
                !MapRenderer.map
            ) {

                return;

            }


            MapRenderer
                .render({

                    show:
                        MapRenderer.visible

                });

        };


    /* =====================================================
       16. RENDER

       MAIN RENDERING ENTRY POINT

       Reads hotspot aggregates from:

       GG.Offence.HeatmapEngine

       Depending on mode:

       ALL
           → SOURCE + TARGET

       SOURCE
           → SOURCE only

       TARGET
           → TARGET only

       ===================================================== */

    MapRenderer.render =
        function (
            options = {}
        ) {

            /*
             * Initialize lazily if required.
             */

            if (
                !MapRenderer.initialized
            ) {

                MapRenderer
                    .init();

            }


            /*
             * Map may have become available after module load.
             */

            if (
                !MapRenderer.map
            ) {

                const resolvedMap =

                    MapRenderer
                        .resolveMap();


                if (
                    resolvedMap
                ) {

                    MapRenderer.map =
                        resolvedMap;


                    MapRenderer
                        .createLayers();


                    MapRenderer.initialized =
                        true;

                }

            }


            if (
                !MapRenderer.map
            ) {

                return {

                    success:
                        false,

                    reason:
                        "MAP_UNAVAILABLE"

                };

            }


            /*
             * Ensure layers exist.
             */

            if (
                !MapRenderer.layers.root
            ) {

                MapRenderer
                    .createLayers();

            }


            /*
             * Optional mode override.
             */

            if (
                options.mode
            ) {

                MapRenderer.currentMode =

                    MapRenderer
                        .normalizeMode(
                            options.mode
                        );

            }


            /*
             * Get latest hotspot aggregates.
             */

            const sourceHotspots =

                MapRenderer
                    .getSourceHotspots();


            const targetHotspots =

                MapRenderer
                    .getTargetHotspots();


            /*
             * Remove previous heatmap rendering.
             */

            MapRenderer
                .clearRenderedLayers();


            /*
             * SOURCE.
             */

            if (
                MapRenderer.currentMode ===
                    MapRenderer.MODE.ALL ||

                MapRenderer.currentMode ===
                    MapRenderer.MODE.SOURCE
            ) {

                MapRenderer
                    .renderSource(
                        sourceHotspots
                    );

            }


            /*
             * TARGET.
             */

            if (
                MapRenderer.currentMode ===
                    MapRenderer.MODE.ALL ||

                MapRenderer.currentMode ===
                    MapRenderer.MODE.TARGET
            ) {

                MapRenderer
                    .renderTarget(
                        targetHotspots
                    );

            }


            /*
             * Show root layer unless explicitly disabled.
             */

            if (
                options.show !==
                    false
            ) {

                MapRenderer
                    .show();

            }


            const result = {

                success:
                    true,

                mode:
                    MapRenderer.currentMode,

                sourceCount:
                    sourceHotspots.length,

                targetCount:
                    targetHotspots.length,

                visible:
                    MapRenderer.visible

            };


            /*
             * Notify UIController and other consumers.
             */

            MapRenderer
                .dispatchEvent(

                    Constants.EVENTS
                        ?.MAP_RENDERED ||

                    "offence:map-rendered",

                    result

                );


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(

                    "🔥 Offence Heatmap Rendered",

                    result

                );

            }


            return result;

        };


    /* =====================================================
       17. GET SOURCE HOTSPOTS

       Supports current and fallback HeatmapEngine APIs.

       Preferred:
       HeatmapEngine.getSourceHotspots()

       Fallback:
       HeatmapEngine.getHotspots("SOURCE")

       ===================================================== */

    MapRenderer.getSourceHotspots =
        function () {

            let hotspots =
                [];


            if (
                typeof HeatmapEngine.getSourceHotspots ===
                    "function"
            ) {

                hotspots =

                    HeatmapEngine
                        .getSourceHotspots() ||

                    [];

            }


            else if (
                typeof HeatmapEngine.getHotspots ===
                    "function"
            ) {

                hotspots =

                    HeatmapEngine
                        .getHotspots(
                            "SOURCE"
                        ) ||

                    [];

            }


            else if (
                Array.isArray(
                    HeatmapEngine.sourceHotspots
                )
            ) {

                hotspots =
                    HeatmapEngine.sourceHotspots;

            }


            return Array.isArray(
                hotspots
            )
                ? hotspots
                : [];

        };


    /* =====================================================
       18. GET TARGET HOTSPOTS

       Preferred:
       HeatmapEngine.getTargetHotspots()

       Fallback:
       HeatmapEngine.getHotspots("TARGET")

       ===================================================== */

    MapRenderer.getTargetHotspots =
        function () {

            let hotspots =
                [];


            if (
                typeof HeatmapEngine.getTargetHotspots ===
                    "function"
            ) {

                hotspots =

                    HeatmapEngine
                        .getTargetHotspots() ||

                    [];

            }


            else if (
                typeof HeatmapEngine.getHotspots ===
                    "function"
            ) {

                hotspots =

                    HeatmapEngine
                        .getHotspots(
                            "TARGET"
                        ) ||

                    [];

            }


            else if (
                Array.isArray(
                    HeatmapEngine.targetHotspots
                )
            ) {

                hotspots =
                    HeatmapEngine.targetHotspots;

            }


            return Array.isArray(
                hotspots
            )
                ? hotspots
                : [];

        };


    /* =====================================================
       PART 1 END

       PART 2 CONTINUES WITH:

       19. renderSource()
       20. renderTarget()
       21. createInteractionMarker()
       22. handleHotspotClick()
       23. POR payload construction
       24. getHotspotId()
       25. getCoordinates()

       DO NOT ADD:

       })();

       HERE.

       PART 2 CONTINUES INSIDE THE SAME IIFE.
       ===================================================== */

     /* =====================================================
       19. RENDER SOURCE

       SOURCE hotspots represent:

       accused / offender origin locations

       Examples:

       - accused address
       - village
       - residential location
       - known source location

       ===================================================== */

    MapRenderer.renderSource =
        function (
            hotspots = []
        ) {

            if (
                !MapRenderer.layers.source
            ) {

                return {

                    success:
                        false,

                    rendered:
                        0

                };

            }


            if (
                !Array.isArray(
                    hotspots
                )
            ) {

                hotspots =
                    [];

            }


            const heatPoints =
                [];


            let rendered =
                0;


            hotspots.forEach(

                function (
                    hotspot,
                    index
                ) {

                    const coordinates =

                        MapRenderer
                            .getCoordinates(
                                hotspot
                            );


                    if (
                        !coordinates
                    ) {

                        return;

                    }


                    const lat =
                        coordinates.lat;


                    const lng =
                        coordinates.lng;


                    const intensity =

                        MapRenderer
                            .getHotspotIntensity(
                                hotspot
                            );


                    /*
                     * Leaflet.heat format:
                     *
                     * [
                     *     latitude,
                     *     longitude,
                     *     intensity
                     * ]
                     */

                    heatPoints.push([

                        lat,

                        lng,

                        intensity

                    ]);


                    /*
                     * Invisible / nearly invisible clickable
                     * interaction marker.
                     *
                     * Heat layers themselves do not provide
                     * reliable click interaction.
                     */

                    const interactionMarker =

                        MapRenderer
                            .createInteractionMarker(

                                hotspot,

                                MapRenderer.TYPE_SOURCE,

                                index

                            );


                    if (
                        interactionMarker &&
                        MapRenderer
                            .layers
                            .sourceInteraction
                    ) {

                        MapRenderer
                            .layers
                            .sourceInteraction
                            .addLayer(
                                interactionMarker
                            );

                    }


                    /*
                     * Optional visible hotspot marker.
                     */

                    if (
                        MapRenderer
                            .shouldRenderVisibleMarker(
                                hotspot
                            )
                    ) {

                        const visibleMarker =

                            MapRenderer
                                .createVisibleHotspotMarker(

                                    hotspot,

                                    MapRenderer.TYPE_SOURCE,

                                    index

                                );


                        if (
                            visibleMarker &&
                            MapRenderer
                                .layers
                                .sourceMarkers
                        ) {

                            MapRenderer
                                .layers
                                .sourceMarkers
                                .addLayer(
                                    visibleMarker
                                );

                        }

                    }


                    rendered++;

                }

            );


            /*
             * Create Leaflet heat layer if plugin exists.
             */

            if (
                heatPoints.length > 0 &&
                typeof L.heatLayer ===
                    "function"
            ) {

                MapRenderer.layers.sourceHeat =

                    L.heatLayer(

                        heatPoints,

                        {

                            radius:
                                MapRenderer
                                    .CONFIG
                                    .source
                                    .radius,

                            blur:
                                MapRenderer
                                    .CONFIG
                                    .source
                                    .blur,

                            maxZoom:
                                MapRenderer
                                    .CONFIG
                                    .source
                                    .maxZoom,

                            minOpacity:
                                MapRenderer
                                    .CONFIG
                                    .source
                                    .minOpacity

                        }

                    );


                /*
                 * Heat layer should remain below interaction
                 * and visible marker layers.
                 */

                MapRenderer
                    .layers
                    .source
                    .addLayer(

                        MapRenderer
                            .layers
                            .sourceHeat

                    );


                /*
                 * Re-add interaction layers so they stay
                 * above the heat layer.
                 */

                MapRenderer
                    .layers
                    .source
                    .removeLayer(

                        MapRenderer
                            .layers
                            .sourceInteraction

                    );


                MapRenderer
                    .layers
                    .source
                    .removeLayer(

                        MapRenderer
                            .layers
                            .sourceMarkers

                    );


                MapRenderer
                    .layers
                    .source
                    .addLayer(

                        MapRenderer
                            .layers
                            .sourceInteraction

                    );


                MapRenderer
                    .layers
                    .source
                    .addLayer(

                        MapRenderer
                            .layers
                            .sourceMarkers

                    );

            }


            /*
             * Fallback:
             *
             * If Leaflet.heat is unavailable, visible
             * circle markers still allow hotspot display
             * and interaction.
             */

            else if (
                heatPoints.length > 0 &&
                typeof L.heatLayer !==
                    "function"
            ) {

                console.warn(
                    "[OffenceMapRenderer] Leaflet.heat plugin unavailable. SOURCE rendered using markers only."
                );


                hotspots.forEach(

                    function (
                        hotspot,
                        index
                    ) {

                        const marker =

                            MapRenderer
                                .createVisibleHotspotMarker(

                                    hotspot,

                                    MapRenderer.TYPE_SOURCE,

                                    index,

                                    true

                                );


                        if (
                            marker
                        ) {

                            MapRenderer
                                .layers
                                .sourceMarkers
                                .addLayer(
                                    marker
                                );

                        }

                    }

                );

            }


            return {

                success:
                    true,

                rendered:
                    rendered,

                heatPoints:
                    heatPoints.length

            };

        };


    /* =====================================================
       20. RENDER TARGET

       TARGET hotspots represent:

       offence / seizure / target locations

       Examples:

       - place of offence
       - seizure location
       - destination
       - target location

       ===================================================== */

    MapRenderer.renderTarget =
        function (
            hotspots = []
        ) {

            if (
                !MapRenderer.layers.target
            ) {

                return {

                    success:
                        false,

                    rendered:
                        0

                };

            }


            if (
                !Array.isArray(
                    hotspots
                )
            ) {

                hotspots =
                    [];

            }


            const heatPoints =
                [];


            let rendered =
                0;


            hotspots.forEach(

                function (
                    hotspot,
                    index
                ) {

                    const coordinates =

                        MapRenderer
                            .getCoordinates(
                                hotspot
                            );


                    if (
                        !coordinates
                    ) {

                        return;

                    }


                    const lat =
                        coordinates.lat;


                    const lng =
                        coordinates.lng;


                    const intensity =

                        MapRenderer
                            .getHotspotIntensity(
                                hotspot
                            );


                    heatPoints.push([

                        lat,

                        lng,

                        intensity

                    ]);


                    /*
                     * Clickable target hotspot.
                     */

                    const interactionMarker =

                        MapRenderer
                            .createInteractionMarker(

                                hotspot,

                                MapRenderer.TYPE_TARGET,

                                index

                            );


                    if (
                        interactionMarker &&
                        MapRenderer
                            .layers
                            .targetInteraction
                    ) {

                        MapRenderer
                            .layers
                            .targetInteraction
                            .addLayer(
                                interactionMarker
                            );

                    }


                    /*
                     * Optional visible target marker.
                     */

                    if (
                        MapRenderer
                            .shouldRenderVisibleMarker(
                                hotspot
                            )
                    ) {

                        const visibleMarker =

                            MapRenderer
                                .createVisibleHotspotMarker(

                                    hotspot,

                                    MapRenderer.TYPE_TARGET,

                                    index

                                );


                        if (
                            visibleMarker &&
                            MapRenderer
                                .layers
                                .targetMarkers
                        ) {

                            MapRenderer
                                .layers
                                .targetMarkers
                                .addLayer(
                                    visibleMarker
                                );

                        }

                    }


                    rendered++;

                }

            );


            if (
                heatPoints.length > 0 &&
                typeof L.heatLayer ===
                    "function"
            ) {

                MapRenderer.layers.targetHeat =

                    L.heatLayer(

                        heatPoints,

                        {

                            radius:
                                MapRenderer
                                    .CONFIG
                                    .target
                                    .radius,

                            blur:
                                MapRenderer
                                    .CONFIG
                                    .target
                                    .blur,

                            maxZoom:
                                MapRenderer
                                    .CONFIG
                                    .target
                                    .maxZoom,

                            minOpacity:
                                MapRenderer
                                    .CONFIG
                                    .target
                                    .minOpacity

                        }

                    );


                MapRenderer
                    .layers
                    .target
                    .addLayer(

                        MapRenderer
                            .layers
                            .targetHeat

                    );


                /*
                 * Keep clickable layers above heat layer.
                 */

                MapRenderer
                    .layers
                    .target
                    .removeLayer(

                        MapRenderer
                            .layers
                            .targetInteraction

                    );


                MapRenderer
                    .layers
                    .target
                    .removeLayer(

                        MapRenderer
                            .layers
                            .targetMarkers

                    );


                MapRenderer
                    .layers
                    .target
                    .addLayer(

                        MapRenderer
                            .layers
                            .targetInteraction

                    );


                MapRenderer
                    .layers
                    .target
                    .addLayer(

                        MapRenderer
                            .layers
                            .targetMarkers

                    );

            }


            else if (
                heatPoints.length > 0 &&
                typeof L.heatLayer !==
                    "function"
            ) {

                console.warn(
                    "[OffenceMapRenderer] Leaflet.heat plugin unavailable. TARGET rendered using markers only."
                );


                hotspots.forEach(

                    function (
                        hotspot,
                        index
                    ) {

                        const marker =

                            MapRenderer
                                .createVisibleHotspotMarker(

                                    hotspot,

                                    MapRenderer.TYPE_TARGET,

                                    index,

                                    true

                                );


                        if (
                            marker
                        ) {

                            MapRenderer
                                .layers
                                .targetMarkers
                                .addLayer(
                                    marker
                                );

                        }

                    }

                );

            }


            return {

                success:
                    true,

                rendered:
                    rendered,

                heatPoints:
                    heatPoints.length

            };

        };


    /* =====================================================
       21. CREATE INTERACTION MARKER

       Heat layers are visual only.

       A transparent Leaflet circleMarker is created over
       each hotspot to capture clicks.

       ===================================================== */

    MapRenderer.createInteractionMarker =
        function (
            hotspot,
            type,
            index = 0
        ) {

            const coordinates =

                MapRenderer
                    .getCoordinates(
                        hotspot
                    );


            if (
                !coordinates
            ) {

                return null;

            }


            const marker =

                L.circleMarker(

                    [

                        coordinates.lat,

                        coordinates.lng

                    ],

                    {

                        radius:
                            MapRenderer
                                .CONFIG
                                .interaction
                                .radius,

                        fillOpacity:
                            MapRenderer
                                .CONFIG
                                .interaction
                                .fillOpacity,

                        opacity:
                            MapRenderer
                                .CONFIG
                                .interaction
                                .opacity,

                        weight:
                            MapRenderer
                                .CONFIG
                                .interaction
                                .weight,

                        interactive:
                            true,

                        bubblingMouseEvents:
                            false

                    }

                );


            marker.on(

                "click",

                function (
                    event
                ) {

                    MapRenderer
                        .handleHotspotClick(

                            hotspot,

                            type,

                            event,

                            index

                        );

                }

            );


            /*
             * Store metadata directly on Leaflet layer.
             */

            marker.__ggOffenceHotspot =
                hotspot;


            marker.__ggOffenceType =
                type;


            marker.__ggOffenceIndex =
                index;


            return marker;

        };


    /* =====================================================
       22. CREATE VISIBLE HOTSPOT MARKER

       These markers supplement the heat layer and make
       individual hotspots easier to discover.

       ===================================================== */

    MapRenderer.createVisibleHotspotMarker =
        function (
            hotspot,
            type,
            index = 0,
            fallbackMode = false
        ) {

            const coordinates =

                MapRenderer
                    .getCoordinates(
                        hotspot
                    );


            if (
                !coordinates
            ) {

                return null;

            }


            const intensity =

                MapRenderer
                    .getHotspotIntensity(
                        hotspot
                    );


            const baseRadius =

                MapRenderer
                    .CONFIG
                    .hotspotMarker
                    .radius;


            /*
             * Slightly scale marker based on hotspot
             * intensity, with an upper limit.
             */

            const radius =

                Math.min(

                    baseRadius +
                    Math.sqrt(
                        Math.max(
                            intensity,
                            1
                        )
                    ),

                    18

                );


            const marker =

                L.circleMarker(

                    [

                        coordinates.lat,

                        coordinates.lng

                    ],

                    {

                        radius:
                            fallbackMode
                                ? radius + 2
                                : radius,

                        weight:
                            MapRenderer
                                .CONFIG
                                .hotspotMarker
                                .weight,

                        opacity:
                            MapRenderer
                                .CONFIG
                                .hotspotMarker
                                .opacity,

                        fillOpacity:
                            fallbackMode
                                ? 0.6
                                : MapRenderer
                                    .CONFIG
                                    .hotspotMarker
                                    .fillOpacity,

                        interactive:
                            true,

                        bubblingMouseEvents:
                            false

                    }

                );


            marker.on(

                "click",

                function (
                    event
                ) {

                    MapRenderer
                        .handleHotspotClick(

                            hotspot,

                            type,

                            event,

                            index

                        );

                }

            );


            /*
             * Tooltip provides quick context without
             * replacing the full cascade UI.
             */

            const tooltipText =

                MapRenderer
                    .buildHotspotTooltip(

                        hotspot,

                        type

                    );


            if (
                tooltipText
            ) {

                marker.bindTooltip(

                    tooltipText,

                    {

                        direction:
                            "top",

                        sticky:
                            true

                    }

                );

            }


            marker.__ggOffenceHotspot =
                hotspot;


            marker.__ggOffenceType =
                type;


            return marker;

        };


    /* =====================================================
       23. HANDLE HOTSPOT CLICK

       This is the bridge:

       MapRenderer
           ↓
       offence:hotspot-click
           ↓
       CascadeController

       POR is passed as authoritative relationship data.

       ===================================================== */

    MapRenderer.handleHotspotClick =
        function (
            hotspot,
            type,
            leafletEvent = null,
            index = 0
        ) {

            if (
                !hotspot
            ) {

                return null;

            }


            const coordinates =

                MapRenderer
                    .getCoordinates(
                        hotspot
                    );


            const porKeys =

                MapRenderer
                    .getPorKeys(
                        hotspot
                    );


            const primaryPorKey =

                MapRenderer
                    .getPrimaryPorKey(
                        hotspot,
                        porKeys
                    );


            const hotspotId =

                MapRenderer
                    .getHotspotId(

                        hotspot,

                        type,

                        index

                    );


            const payload = {

                hotspotId:
                    hotspotId,

                type:
                    MapRenderer
                        .normalizeHotspotType(
                            type
                        ),

                hotspot:
                    hotspot,

                /*
                 * POR-authoritative connector.
                 */

                porKey:
                    primaryPorKey,

                porKeys:
                    porKeys,

                /*
                 * Convenience aliases.
                 */

                refPorNo:
                    MapRenderer
                        .getRefPorNo(
                            hotspot
                        ),

                porNo:
                    MapRenderer
                        .getRefPorNo(
                            hotspot
                        ),

                /*
                 * Coordinates.
                 */

                lat:
                    coordinates
                        ?.lat ??
                    null,

                lng:
                    coordinates
                        ?.lng ??
                    null,

                latlng:
                    leafletEvent
                        ?.latlng ||

                    (
                        coordinates
                            ? {
                                lat:
                                    coordinates.lat,

                                lng:
                                    coordinates.lng
                            }
                            : null
                    ),

                /*
                 * Original Leaflet event is intentionally
                 * included for consumers that need it.
                 */

                leafletEvent:
                    leafletEvent,

                timestamp:
                    Date.now()

            };


            /*
             * Dispatch canonical event.
             */

            MapRenderer
                .dispatchEvent(

                    Constants.EVENTS
                        ?.HOTSPOT_CLICK ||

                    Constants.EVENTS
                        ?.HOTSPOT_CLICKED ||

                    "offence:hotspot-click",

                    payload

                );


            /*
             * Optional direct controller integration.
             *
             * Event-driven integration remains preferred.
             *
             * Direct invocation is only used when explicitly
             * supported by the controller and it has not
             * declared itself event-bound.
             */

            const CascadeController =

                GG.Offence
                    .CascadeController;


            if (
                CascadeController &&
                CascadeController
                    .DIRECT_MAP_INTEGRATION ===
                    true &&
                typeof CascadeController
                    .handleHotspotClick ===
                    "function"
            ) {

                try {

                    CascadeController
                        .handleHotspotClick(
                            payload
                        );

                }

                catch (
                    error
                ) {

                    console.error(

                        "[OffenceMapRenderer] CascadeController hotspot handling failed.",

                        error

                    );

                }

            }


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(

                    "🔥 Offence Hotspot Click",

                    {

                        hotspotId:
                            payload.hotspotId,

                        type:
                            payload.type,

                        porKey:
                            payload.porKey,

                        porKeys:
                            payload.porKeys,

                        lat:
                            payload.lat,

                        lng:
                            payload.lng

                    }

                );

            }


            return payload;

        };


    /* =====================================================
       24. GET POR KEYS

       POR is the authoritative connector.

       Supports hotspot structures containing:

       porKey
       porKeys
       normalizedPor
       normalizedPorNo
       refPorNo
       porNo
       casePorNo
       records[].porKey

       ===================================================== */

    MapRenderer.getPorKeys =
        function (
            hotspot
        ) {

            if (
                !hotspot ||
                typeof hotspot !==
                    "object"
            ) {

                return [];

            }


            const values =
                [];


            /*
             * Explicit porKeys.
             */

            if (
                Array.isArray(
                    hotspot.porKeys
                )
            ) {

                hotspot
                    .porKeys
                    .forEach(

                        function (
                            value
                        ) {

                            values.push(
                                value
                            );

                        }

                    );

            }


            /*
             * Direct POR fields.
             */

            values.push(

                hotspot.porKey,

                hotspot.normalizedPor,

                hotspot.normalizedPorNo,

                hotspot.refPorNo,

                hotspot.refPORNo,

                hotspot.porNo,

                hotspot.casePorNo

            );


            /*
             * Associated records.
             */

            const recordCollections = [

                hotspot.records,

                hotspot.items,

                hotspot.cases,

                hotspot.accused,

                hotspot.seizures,

                hotspot.witnesses

            ];


            recordCollections.forEach(

                function (
                    collection
                ) {

                    if (
                        !Array.isArray(
                            collection
                        )
                    ) {

                        return;

                    }


                    collection.forEach(

                        function (
                            record
                        ) {

                            if (
                                !record ||
                                typeof record !==
                                    "object"
                            ) {

                                return;

                            }


                            values.push(

                                record.porKey,

                                record.normalizedPor,

                                record.normalizedPorNo,

                                record.refPorNo,

                                record.refPORNo,

                                record.porNo

                            );

                        }

                    );

                }

            );


            /*
             * Normalize and deduplicate.
             */

            const normalized =
                [];


            const seen =
                new Set();


            values.forEach(

                function (
                    value
                ) {

                    const porKey =

                        MapRenderer
                            .normalizePorKey(
                                value
                            );


                    if (
                        !porKey ||
                        seen.has(
                            porKey
                        )
                    ) {

                        return;

                    }


                    seen.add(
                        porKey
                    );


                    normalized.push(
                        porKey
                    );

                }

            );


            return normalized;

        };


    /* =====================================================
       25. GET PRIMARY POR KEY
       ===================================================== */

    MapRenderer.getPrimaryPorKey =
        function (
            hotspot,
            porKeys = null
        ) {

            const direct =

                MapRenderer
                    .normalizePorKey(

                        hotspot
                            ?.porKey ||

                        hotspot
                            ?.normalizedPor ||

                        hotspot
                            ?.normalizedPorNo

                    );


            if (
                direct
            ) {

                return direct;

            }


            const keys =

                Array.isArray(
                    porKeys
                )

                    ? porKeys

                    : MapRenderer
                        .getPorKeys(
                            hotspot
                        );


            return keys.length > 0
                ? keys[0]
                : "";

        };


    /* =====================================================
       26. NORMALIZE POR KEY

       Prefer canonical normalizer when available.

       IMPORTANT:
       This helper does not establish relationships.
       It only creates a safe comparison representation.

       ===================================================== */

    MapRenderer.normalizePorKey =
        function (
            value
        ) {

            if (
                value ===
                    undefined ||
                value ===
                    null
            ) {

                return "";

            }


            /*
             * Prefer OffenceNormalizer.
             */

            const Normalizer =

                GG.Offence
                    .Normalizer;


            if (
                Normalizer
            ) {

                if (
                    typeof Normalizer.normalizePorKey ===
                        "function"
                ) {

                    try {

                        return String(

                            Normalizer
                                .normalizePorKey(
                                    value
                                ) || ""

                        ).trim();

                    }

                    catch (
                        error
                    ) {

                        /*
                         * Continue with local fallback.
                         */

                    }

                }


                if (
                    typeof Normalizer.normalizePorNo ===
                        "function"
                ) {

                    try {

                        return String(

                            Normalizer
                                .normalizePorNo(
                                    value
                                ) || ""

                        ).trim();

                    }

                    catch (
                        error
                    ) {

                        /*
                         * Continue with local fallback.
                         */

                    }

                }

            }


            /*
             * Prefer Constants helper if available.
             */

            if (
                typeof Constants.normalizePorKey ===
                    "function"
            ) {

                try {

                    return String(

                        Constants
                            .normalizePorKey(
                                value
                            ) || ""

                    ).trim();

                }

                catch (
                    error
                ) {

                    /*
                     * Continue with fallback.
                     */

                }

            }


            /*
             * Safe local normalization.
             *
             * Preserve POR semantic structure while removing
             * inconsistent spacing and case differences.
             */

            return String(
                value
            )
                .replace(
                    /\r?\n/g,
                    " "
                )
                .replace(
                    /\s+/g,
                    " "
                )
                .trim()
                .toUpperCase();

        };


    /* =====================================================
       27. GET REF POR NUMBER

       Returns display-friendly POR number.

       This is separate from normalized porKey.

       ===================================================== */

    MapRenderer.getRefPorNo =
        function (
            hotspot
        ) {

            if (
                !hotspot
            ) {

                return "";

            }


            const value =

                hotspot.refPorNo ||

                hotspot.refPORNo ||

                hotspot.porNo ||

                hotspot.casePorNo ||

                hotspot.por ||

                "";


            if (
                value
            ) {

                return String(
                    value
                ).trim();

            }


            /*
             * Look inside associated records.
             */

            const collections = [

                hotspot.records,

                hotspot.items,

                hotspot.cases,

                hotspot.accused,

                hotspot.seizures

            ];


            for (
                const collection
                of collections
            ) {

                if (
                    !Array.isArray(
                        collection
                    )
                ) {

                    continue;

                }


                for (
                    const record
                    of collection
                ) {

                    const recordValue =

                        record
                            ?.refPorNo ||

                        record
                            ?.refPORNo ||

                        record
                            ?.porNo;


                    if (
                        recordValue
                    ) {

                        return String(
                            recordValue
                        ).trim();

                    }

                }

            }


            return "";

        };


    /* =====================================================
       28. GET HOTSPOT ID
       ===================================================== */

    MapRenderer.getHotspotId =
        function (
            hotspot,
            type,
            index = 0
        ) {

            if (
                hotspot
            ) {

                const explicitId =

                    hotspot.hotspotId ||

                    hotspot.id ||

                    hotspot.locationId ||

                    hotspot.clusterId ||

                    hotspot.key;


                if (
                    explicitId
                ) {

                    return String(
                        explicitId
                    );

                }

            }


            const coordinates =

                MapRenderer
                    .getCoordinates(
                        hotspot
                    );


            const latPart =

                coordinates
                    ? Number(
                        coordinates.lat
                    ).toFixed(
                        6
                    )
                    : "NA";


            const lngPart =

                coordinates
                    ? Number(
                        coordinates.lng
                    ).toFixed(
                        6
                    )
                    : "NA";


            return [

                "OFFENCE",

                MapRenderer
                    .normalizeHotspotType(
                        type
                    ),

                latPart,

                lngPart,

                index

            ].join(
                "-"
            );

        };


    /* =====================================================
       29. GET COORDINATES

       Supports common hotspot structures:

       hotspot.lat / hotspot.lng
       hotspot.latitude / hotspot.longitude
       hotspot.location.lat / lng
       hotspot.coordinates.lat / lng
       hotspot.geo.lat / lng
       hotspot.position.lat / lng

       Also supports GeoJSON:
       [longitude, latitude]

       ===================================================== */

    MapRenderer.getCoordinates =
        function (
            hotspot
        ) {

            if (
                !hotspot ||
                typeof hotspot !==
                    "object"
            ) {

                return null;

            }


            const candidates = [

                {

                    lat:
                        hotspot.lat,

                    lng:
                        hotspot.lng

                },

                {

                    lat:
                        hotspot.latitude,

                    lng:
                        hotspot.longitude

                },

                {

                    lat:
                        hotspot.location
                            ?.lat,

                    lng:
                        hotspot.location
                            ?.lng

                },

                {

                    lat:
                        hotspot.location
                            ?.latitude,

                    lng:
                        hotspot.location
                            ?.longitude

                },

                {

                    lat:
                        hotspot.coordinates
                            ?.lat,

                    lng:
                        hotspot.coordinates
                            ?.lng

                },

                {

                    lat:
                        hotspot.geo
                            ?.lat,

                    lng:
                        hotspot.geo
                            ?.lng

                },

                {

                    lat:
                        hotspot.position
                            ?.lat,

                    lng:
                        hotspot.position
                            ?.lng

                }

            ];


            for (
                const candidate
                of candidates
            ) {

                const lat =
                    Number(
                        candidate.lat
                    );


                const lng =
                    Number(
                        candidate.lng
                    );


                if (
                    MapRenderer
                        .isValidCoordinate(
                            lat,
                            lng
                        )
                ) {

                    return {

                        lat:
                            lat,

                        lng:
                            lng

                    };

                }

            }


            /*
             * GeoJSON coordinate array:
             *
             * [longitude, latitude]
             */

            const coordinateArrays = [

                hotspot.coordinates,

                hotspot.geometry
                    ?.coordinates,

                hotspot.location
                    ?.coordinates

            ];


            for (
                const coordinates
                of coordinateArrays
            ) {

                if (
                    !Array.isArray(
                        coordinates
                    ) ||
                    coordinates.length <
                        2
                ) {

                    continue;

                }


                const lng =
                    Number(
                        coordinates[0]
                    );


                const lat =
                    Number(
                        coordinates[1]
                    );


                if (
                    MapRenderer
                        .isValidCoordinate(
                            lat,
                            lng
                        )
                ) {

                    return {

                        lat:
                            lat,

                        lng:
                            lng

                    };

                }

            }


            return null;

        };


    /* =====================================================
       30. VALIDATE COORDINATES
       ===================================================== */

    MapRenderer.isValidCoordinate =
        function (
            lat,
            lng
        ) {

            if (
                !Number.isFinite(
                    lat
                ) ||
                !Number.isFinite(
                    lng
                )
            ) {

                return false;

            }


            if (
                lat < -90 ||
                lat > 90
            ) {

                return false;

            }


            if (
                lng < -180 ||
                lng > 180
            ) {

                return false;

            }


            /*
             * Reject common empty coordinate placeholder.
             */

            if (
                lat === 0 &&
                lng === 0
            ) {

                return false;

            }


            return true;

        };


    /* =====================================================
       PART 2 END

       PART 3 CONTINUES WITH:

       31. getHotspotIntensity()
       32. shouldRenderVisibleMarker()
       33. buildHotspotTooltip()
       34. normalizeHotspotType()
       35. normalizeMode()
       36. setMode()
       37. show()
       38. hide()
       39. toggle()
       40. clearRenderedLayers()
       41. removeLayers()
       42. refresh()
       43. fitToHotspots()
       44. dispatchEvent()
       45. getState()
       46. destroy()
       47. expose module
       48. close IIFE

       DO NOT ADD })(); HERE.
       ===================================================== */
     /* =====================================================
       19. RENDER SOURCE

       SOURCE hotspots represent:

       accused / offender origin locations

       Examples:

       - accused address
       - village
       - residential location
       - known source location

       ===================================================== */

    MapRenderer.renderSource =
        function (
            hotspots = []
        ) {

            if (
                !MapRenderer.layers.source
            ) {

                return {

                    success:
                        false,

                    rendered:
                        0

                };

            }


            if (
                !Array.isArray(
                    hotspots
                )
            ) {

                hotspots =
                    [];

            }


            const heatPoints =
                [];


            let rendered =
                0;


            hotspots.forEach(

                function (
                    hotspot,
                    index
                ) {

                    const coordinates =

                        MapRenderer
                            .getCoordinates(
                                hotspot
                            );


                    if (
                        !coordinates
                    ) {

                        return;

                    }


                    const lat =
                        coordinates.lat;


                    const lng =
                        coordinates.lng;


                    const intensity =

                        MapRenderer
                            .getHotspotIntensity(
                                hotspot
                            );


                    /*
                     * Leaflet.heat format:
                     *
                     * [
                     *     latitude,
                     *     longitude,
                     *     intensity
                     * ]
                     */

                    heatPoints.push([

                        lat,

                        lng,

                        intensity

                    ]);


                    /*
                     * Invisible / nearly invisible clickable
                     * interaction marker.
                     *
                     * Heat layers themselves do not provide
                     * reliable click interaction.
                     */

                    const interactionMarker =

                        MapRenderer
                            .createInteractionMarker(

                                hotspot,

                                MapRenderer.TYPE_SOURCE,

                                index

                            );


                    if (
                        interactionMarker &&
                        MapRenderer
                            .layers
                            .sourceInteraction
                    ) {

                        MapRenderer
                            .layers
                            .sourceInteraction
                            .addLayer(
                                interactionMarker
                            );

                    }


                    /*
                     * Optional visible hotspot marker.
                     */

                    if (
                        MapRenderer
                            .shouldRenderVisibleMarker(
                                hotspot
                            )
                    ) {

                        const visibleMarker =

                            MapRenderer
                                .createVisibleHotspotMarker(

                                    hotspot,

                                    MapRenderer.TYPE_SOURCE,

                                    index

                                );


                        if (
                            visibleMarker &&
                            MapRenderer
                                .layers
                                .sourceMarkers
                        ) {

                            MapRenderer
                                .layers
                                .sourceMarkers
                                .addLayer(
                                    visibleMarker
                                );

                        }

                    }


                    rendered++;

                }

            );


            /*
             * Create Leaflet heat layer if plugin exists.
             */

            if (
                heatPoints.length > 0 &&
                typeof L.heatLayer ===
                    "function"
            ) {

                MapRenderer.layers.sourceHeat =

                    L.heatLayer(

                        heatPoints,

                        {

                            radius:
                                MapRenderer
                                    .CONFIG
                                    .source
                                    .radius,

                            blur:
                                MapRenderer
                                    .CONFIG
                                    .source
                                    .blur,

                            maxZoom:
                                MapRenderer
                                    .CONFIG
                                    .source
                                    .maxZoom,

                            minOpacity:
                                MapRenderer
                                    .CONFIG
                                    .source
                                    .minOpacity

                        }

                    );


                /*
                 * Heat layer should remain below interaction
                 * and visible marker layers.
                 */

                MapRenderer
                    .layers
                    .source
                    .addLayer(

                        MapRenderer
                            .layers
                            .sourceHeat

                    );


                /*
                 * Re-add interaction layers so they stay
                 * above the heat layer.
                 */

                MapRenderer
                    .layers
                    .source
                    .removeLayer(

                        MapRenderer
                            .layers
                            .sourceInteraction

                    );


                MapRenderer
                    .layers
                    .source
                    .removeLayer(

                        MapRenderer
                            .layers
                            .sourceMarkers

                    );


                MapRenderer
                    .layers
                    .source
                    .addLayer(

                        MapRenderer
                            .layers
                            .sourceInteraction

                    );


                MapRenderer
                    .layers
                    .source
                    .addLayer(

                        MapRenderer
                            .layers
                            .sourceMarkers

                    );

            }


            /*
             * Fallback:
             *
             * If Leaflet.heat is unavailable, visible
             * circle markers still allow hotspot display
             * and interaction.
             */

            else if (
                heatPoints.length > 0 &&
                typeof L.heatLayer !==
                    "function"
            ) {

                console.warn(
                    "[OffenceMapRenderer] Leaflet.heat plugin unavailable. SOURCE rendered using markers only."
                );


                hotspots.forEach(

                    function (
                        hotspot,
                        index
                    ) {

                        const marker =

                            MapRenderer
                                .createVisibleHotspotMarker(

                                    hotspot,

                                    MapRenderer.TYPE_SOURCE,

                                    index,

                                    true

                                );


                        if (
                            marker
                        ) {

                            MapRenderer
                                .layers
                                .sourceMarkers
                                .addLayer(
                                    marker
                                );

                        }

                    }

                );

            }


            return {

                success:
                    true,

                rendered:
                    rendered,

                heatPoints:
                    heatPoints.length

            };

        };


    /* =====================================================
       20. RENDER TARGET

       TARGET hotspots represent:

       offence / seizure / target locations

       Examples:

       - place of offence
       - seizure location
       - destination
       - target location

       ===================================================== */

    MapRenderer.renderTarget =
        function (
            hotspots = []
        ) {

            if (
                !MapRenderer.layers.target
            ) {

                return {

                    success:
                        false,

                    rendered:
                        0

                };

            }


            if (
                !Array.isArray(
                    hotspots
                )
            ) {

                hotspots =
                    [];

            }


            const heatPoints =
                [];


            let rendered =
                0;


            hotspots.forEach(

                function (
                    hotspot,
                    index
                ) {

                    const coordinates =

                        MapRenderer
                            .getCoordinates(
                                hotspot
                            );


                    if (
                        !coordinates
                    ) {

                        return;

                    }


                    const lat =
                        coordinates.lat;


                    const lng =
                        coordinates.lng;


                    const intensity =

                        MapRenderer
                            .getHotspotIntensity(
                                hotspot
                            );


                    heatPoints.push([

                        lat,

                        lng,

                        intensity

                    ]);


                    /*
                     * Clickable target hotspot.
                     */

                    const interactionMarker =

                        MapRenderer
                            .createInteractionMarker(

                                hotspot,

                                MapRenderer.TYPE_TARGET,

                                index

                            );


                    if (
                        interactionMarker &&
                        MapRenderer
                            .layers
                            .targetInteraction
                    ) {

                        MapRenderer
                            .layers
                            .targetInteraction
                            .addLayer(
                                interactionMarker
                            );

                    }


                    /*
                     * Optional visible target marker.
                     */

                    if (
                        MapRenderer
                            .shouldRenderVisibleMarker(
                                hotspot
                            )
                    ) {

                        const visibleMarker =

                            MapRenderer
                                .createVisibleHotspotMarker(

                                    hotspot,

                                    MapRenderer.TYPE_TARGET,

                                    index

                                );


                        if (
                            visibleMarker &&
                            MapRenderer
                                .layers
                                .targetMarkers
                        ) {

                            MapRenderer
                                .layers
                                .targetMarkers
                                .addLayer(
                                    visibleMarker
                                );

                        }

                    }


                    rendered++;

                }

            );


            if (
                heatPoints.length > 0 &&
                typeof L.heatLayer ===
                    "function"
            ) {

                MapRenderer.layers.targetHeat =

                    L.heatLayer(

                        heatPoints,

                        {

                            radius:
                                MapRenderer
                                    .CONFIG
                                    .target
                                    .radius,

                            blur:
                                MapRenderer
                                    .CONFIG
                                    .target
                                    .blur,

                            maxZoom:
                                MapRenderer
                                    .CONFIG
                                    .target
                                    .maxZoom,

                            minOpacity:
                                MapRenderer
                                    .CONFIG
                                    .target
                                    .minOpacity

                        }

                    );


                MapRenderer
                    .layers
                    .target
                    .addLayer(

                        MapRenderer
                            .layers
                            .targetHeat

                    );


                /*
                 * Keep clickable layers above heat layer.
                 */

                MapRenderer
                    .layers
                    .target
                    .removeLayer(

                        MapRenderer
                            .layers
                            .targetInteraction

                    );


                MapRenderer
                    .layers
                    .target
                    .removeLayer(

                        MapRenderer
                            .layers
                            .targetMarkers

                    );


                MapRenderer
                    .layers
                    .target
                    .addLayer(

                        MapRenderer
                            .layers
                            .targetInteraction

                    );


                MapRenderer
                    .layers
                    .target
                    .addLayer(

                        MapRenderer
                            .layers
                            .targetMarkers

                    );

            }


            else if (
                heatPoints.length > 0 &&
                typeof L.heatLayer !==
                    "function"
            ) {

                console.warn(
                    "[OffenceMapRenderer] Leaflet.heat plugin unavailable. TARGET rendered using markers only."
                );


                hotspots.forEach(

                    function (
                        hotspot,
                        index
                    ) {

                        const marker =

                            MapRenderer
                                .createVisibleHotspotMarker(

                                    hotspot,

                                    MapRenderer.TYPE_TARGET,

                                    index,

                                    true

                                );


                        if (
                            marker
                        ) {

                            MapRenderer
                                .layers
                                .targetMarkers
                                .addLayer(
                                    marker
                                );

                        }

                    }

                );

            }


            return {

                success:
                    true,

                rendered:
                    rendered,

                heatPoints:
                    heatPoints.length

            };

        };


    /* =====================================================
       21. CREATE INTERACTION MARKER

       Heat layers are visual only.

       A transparent Leaflet circleMarker is created over
       each hotspot to capture clicks.

       ===================================================== */

    MapRenderer.createInteractionMarker =
        function (
            hotspot,
            type,
            index = 0
        ) {

            const coordinates =

                MapRenderer
                    .getCoordinates(
                        hotspot
                    );


            if (
                !coordinates
            ) {

                return null;

            }


            const marker =

                L.circleMarker(

                    [

                        coordinates.lat,

                        coordinates.lng

                    ],

                    {

                        radius:
                            MapRenderer
                                .CONFIG
                                .interaction
                                .radius,

                        fillOpacity:
                            MapRenderer
                                .CONFIG
                                .interaction
                                .fillOpacity,

                        opacity:
                            MapRenderer
                                .CONFIG
                                .interaction
                                .opacity,

                        weight:
                            MapRenderer
                                .CONFIG
                                .interaction
                                .weight,

                        interactive:
                            true,

                        bubblingMouseEvents:
                            false

                    }

                );


            marker.on(

                "click",

                function (
                    event
                ) {

                    MapRenderer
                        .handleHotspotClick(

                            hotspot,

                            type,

                            event,

                            index

                        );

                }

            );


            /*
             * Store metadata directly on Leaflet layer.
             */

            marker.__ggOffenceHotspot =
                hotspot;


            marker.__ggOffenceType =
                type;


            marker.__ggOffenceIndex =
                index;


            return marker;

        };


    /* =====================================================
       22. CREATE VISIBLE HOTSPOT MARKER

       These markers supplement the heat layer and make
       individual hotspots easier to discover.

       ===================================================== */

    MapRenderer.createVisibleHotspotMarker =
        function (
            hotspot,
            type,
            index = 0,
            fallbackMode = false
        ) {

            const coordinates =

                MapRenderer
                    .getCoordinates(
                        hotspot
                    );


            if (
                !coordinates
            ) {

                return null;

            }


            const intensity =

                MapRenderer
                    .getHotspotIntensity(
                        hotspot
                    );


            const baseRadius =

                MapRenderer
                    .CONFIG
                    .hotspotMarker
                    .radius;


            /*
             * Slightly scale marker based on hotspot
             * intensity, with an upper limit.
             */

            const radius =

                Math.min(

                    baseRadius +
                    Math.sqrt(
                        Math.max(
                            intensity,
                            1
                        )
                    ),

                    18

                );


            const marker =

                L.circleMarker(

                    [

                        coordinates.lat,

                        coordinates.lng

                    ],

                    {

                        radius:
                            fallbackMode
                                ? radius + 2
                                : radius,

                        weight:
                            MapRenderer
                                .CONFIG
                                .hotspotMarker
                                .weight,

                        opacity:
                            MapRenderer
                                .CONFIG
                                .hotspotMarker
                                .opacity,

                        fillOpacity:
                            fallbackMode
                                ? 0.6
                                : MapRenderer
                                    .CONFIG
                                    .hotspotMarker
                                    .fillOpacity,

                        interactive:
                            true,

                        bubblingMouseEvents:
                            false

                    }

                );


            marker.on(

                "click",

                function (
                    event
                ) {

                    MapRenderer
                        .handleHotspotClick(

                            hotspot,

                            type,

                            event,

                            index

                        );

                }

            );


            /*
             * Tooltip provides quick context without
             * replacing the full cascade UI.
             */

            const tooltipText =

                MapRenderer
                    .buildHotspotTooltip(

                        hotspot,

                        type

                    );


            if (
                tooltipText
            ) {

                marker.bindTooltip(

                    tooltipText,

                    {

                        direction:
                            "top",

                        sticky:
                            true

                    }

                );

            }


            marker.__ggOffenceHotspot =
                hotspot;


            marker.__ggOffenceType =
                type;


            return marker;

        };


    /* =====================================================
       23. HANDLE HOTSPOT CLICK

       This is the bridge:

       MapRenderer
           ↓
       offence:hotspot-click
           ↓
       CascadeController

       POR is passed as authoritative relationship data.

       ===================================================== */

    MapRenderer.handleHotspotClick =
        function (
            hotspot,
            type,
            leafletEvent = null,
            index = 0
        ) {

            if (
                !hotspot
            ) {

                return null;

            }


            const coordinates =

                MapRenderer
                    .getCoordinates(
                        hotspot
                    );


            const porKeys =

                MapRenderer
                    .getPorKeys(
                        hotspot
                    );


            const primaryPorKey =

                MapRenderer
                    .getPrimaryPorKey(
                        hotspot,
                        porKeys
                    );


            const hotspotId =

                MapRenderer
                    .getHotspotId(

                        hotspot,

                        type,

                        index

                    );


            const payload = {

                hotspotId:
                    hotspotId,

                type:
                    MapRenderer
                        .normalizeHotspotType(
                            type
                        ),

                hotspot:
                    hotspot,

                /*
                 * POR-authoritative connector.
                 */

                porKey:
                    primaryPorKey,

                porKeys:
                    porKeys,

                /*
                 * Convenience aliases.
                 */

                refPorNo:
                    MapRenderer
                        .getRefPorNo(
                            hotspot
                        ),

                porNo:
                    MapRenderer
                        .getRefPorNo(
                            hotspot
                        ),

                /*
                 * Coordinates.
                 */

                lat:
                    coordinates
                        ?.lat ??
                    null,

                lng:
                    coordinates
                        ?.lng ??
                    null,

                latlng:
                    leafletEvent
                        ?.latlng ||

                    (
                        coordinates
                            ? {
                                lat:
                                    coordinates.lat,

                                lng:
                                    coordinates.lng
                            }
                            : null
                    ),

                /*
                 * Original Leaflet event is intentionally
                 * included for consumers that need it.
                 */

                leafletEvent:
                    leafletEvent,

                timestamp:
                    Date.now()

            };


            /*
             * Dispatch canonical event.
             */

            MapRenderer
                .dispatchEvent(

                    Constants.EVENTS
                        ?.HOTSPOT_CLICK ||

                    Constants.EVENTS
                        ?.HOTSPOT_CLICKED ||

                    "offence:hotspot-click",

                    payload

                );


            /*
             * Optional direct controller integration.
             *
             * Event-driven integration remains preferred.
             *
             * Direct invocation is only used when explicitly
             * supported by the controller and it has not
             * declared itself event-bound.
             */

            const CascadeController =

                GG.Offence
                    .CascadeController;


            if (
                CascadeController &&
                CascadeController
                    .DIRECT_MAP_INTEGRATION ===
                    true &&
                typeof CascadeController
                    .handleHotspotClick ===
                    "function"
            ) {

                try {

                    CascadeController
                        .handleHotspotClick(
                            payload
                        );

                }

                catch (
                    error
                ) {

                    console.error(

                        "[OffenceMapRenderer] CascadeController hotspot handling failed.",

                        error

                    );

                }

            }


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(

                    "🔥 Offence Hotspot Click",

                    {

                        hotspotId:
                            payload.hotspotId,

                        type:
                            payload.type,

                        porKey:
                            payload.porKey,

                        porKeys:
                            payload.porKeys,

                        lat:
                            payload.lat,

                        lng:
                            payload.lng

                    }

                );

            }


            return payload;

        };


    /* =====================================================
       24. GET POR KEYS

       POR is the authoritative connector.

       Supports hotspot structures containing:

       porKey
       porKeys
       normalizedPor
       normalizedPorNo
       refPorNo
       porNo
       casePorNo
       records[].porKey

       ===================================================== */

    MapRenderer.getPorKeys =
        function (
            hotspot
        ) {

            if (
                !hotspot ||
                typeof hotspot !==
                    "object"
            ) {

                return [];

            }


            const values =
                [];


            /*
             * Explicit porKeys.
             */

            if (
                Array.isArray(
                    hotspot.porKeys
                )
            ) {

                hotspot
                    .porKeys
                    .forEach(

                        function (
                            value
                        ) {

                            values.push(
                                value
                            );

                        }

                    );

            }


            /*
             * Direct POR fields.
             */

            values.push(

                hotspot.porKey,

                hotspot.normalizedPor,

                hotspot.normalizedPorNo,

                hotspot.refPorNo,

                hotspot.refPORNo,

                hotspot.porNo,

                hotspot.casePorNo

            );


            /*
             * Associated records.
             */

            const recordCollections = [

                hotspot.records,

                hotspot.items,

                hotspot.cases,

                hotspot.accused,

                hotspot.seizures,

                hotspot.witnesses

            ];


            recordCollections.forEach(

                function (
                    collection
                ) {

                    if (
                        !Array.isArray(
                            collection
                        )
                    ) {

                        return;

                    }


                    collection.forEach(

                        function (
                            record
                        ) {

                            if (
                                !record ||
                                typeof record !==
                                    "object"
                            ) {

                                return;

                            }


                            values.push(

                                record.porKey,

                                record.normalizedPor,

                                record.normalizedPorNo,

                                record.refPorNo,

                                record.refPORNo,

                                record.porNo

                            );

                        }

                    );

                }

            );


            /*
             * Normalize and deduplicate.
             */

            const normalized =
                [];


            const seen =
                new Set();


            values.forEach(

                function (
                    value
                ) {

                    const porKey =

                        MapRenderer
                            .normalizePorKey(
                                value
                            );


                    if (
                        !porKey ||
                        seen.has(
                            porKey
                        )
                    ) {

                        return;

                    }


                    seen.add(
                        porKey
                    );


                    normalized.push(
                        porKey
                    );

                }

            );


            return normalized;

        };


    /* =====================================================
       25. GET PRIMARY POR KEY
       ===================================================== */

    MapRenderer.getPrimaryPorKey =
        function (
            hotspot,
            porKeys = null
        ) {

            const direct =

                MapRenderer
                    .normalizePorKey(

                        hotspot
                            ?.porKey ||

                        hotspot
                            ?.normalizedPor ||

                        hotspot
                            ?.normalizedPorNo

                    );


            if (
                direct
            ) {

                return direct;

            }


            const keys =

                Array.isArray(
                    porKeys
                )

                    ? porKeys

                    : MapRenderer
                        .getPorKeys(
                            hotspot
                        );


            return keys.length > 0
                ? keys[0]
                : "";

        };


    /* =====================================================
       26. NORMALIZE POR KEY

       Prefer canonical normalizer when available.

       IMPORTANT:
       This helper does not establish relationships.
       It only creates a safe comparison representation.

       ===================================================== */

    MapRenderer.normalizePorKey =
        function (
            value
        ) {

            if (
                value ===
                    undefined ||
                value ===
                    null
            ) {

                return "";

            }


            /*
             * Prefer OffenceNormalizer.
             */

            const Normalizer =

                GG.Offence
                    .Normalizer;


            if (
                Normalizer
            ) {

                if (
                    typeof Normalizer.normalizePorKey ===
                        "function"
                ) {

                    try {

                        return String(

                            Normalizer
                                .normalizePorKey(
                                    value
                                ) || ""

                        ).trim();

                    }

                    catch (
                        error
                    ) {

                        /*
                         * Continue with local fallback.
                         */

                    }

                }


                if (
                    typeof Normalizer.normalizePorNo ===
                        "function"
                ) {

                    try {

                        return String(

                            Normalizer
                                .normalizePorNo(
                                    value
                                ) || ""

                        ).trim();

                    }

                    catch (
                        error
                    ) {

                        /*
                         * Continue with local fallback.
                         */

                    }

                }

            }


            /*
             * Prefer Constants helper if available.
             */

            if (
                typeof Constants.normalizePorKey ===
                    "function"
            ) {

                try {

                    return String(

                        Constants
                            .normalizePorKey(
                                value
                            ) || ""

                    ).trim();

                }

                catch (
                    error
                ) {

                    /*
                     * Continue with fallback.
                     */

                }

            }


            /*
             * Safe local normalization.
             *
             * Preserve POR semantic structure while removing
             * inconsistent spacing and case differences.
             */

            return String(
                value
            )
                .replace(
                    /\r?\n/g,
                    " "
                )
                .replace(
                    /\s+/g,
                    " "
                )
                .trim()
                .toUpperCase();

        };


    /* =====================================================
       27. GET REF POR NUMBER

       Returns display-friendly POR number.

       This is separate from normalized porKey.

       ===================================================== */

    MapRenderer.getRefPorNo =
        function (
            hotspot
        ) {

            if (
                !hotspot
            ) {

                return "";

            }


            const value =

                hotspot.refPorNo ||

                hotspot.refPORNo ||

                hotspot.porNo ||

                hotspot.casePorNo ||

                hotspot.por ||

                "";


            if (
                value
            ) {

                return String(
                    value
                ).trim();

            }


            /*
             * Look inside associated records.
             */

            const collections = [

                hotspot.records,

                hotspot.items,

                hotspot.cases,

                hotspot.accused,

                hotspot.seizures

            ];


            for (
                const collection
                of collections
            ) {

                if (
                    !Array.isArray(
                        collection
                    )
                ) {

                    continue;

                }


                for (
                    const record
                    of collection
                ) {

                    const recordValue =

                        record
                            ?.refPorNo ||

                        record
                            ?.refPORNo ||

                        record
                            ?.porNo;


                    if (
                        recordValue
                    ) {

                        return String(
                            recordValue
                        ).trim();

                    }

                }

            }


            return "";

        };


    /* =====================================================
       28. GET HOTSPOT ID
       ===================================================== */

    MapRenderer.getHotspotId =
        function (
            hotspot,
            type,
            index = 0
        ) {

            if (
                hotspot
            ) {

                const explicitId =

                    hotspot.hotspotId ||

                    hotspot.id ||

                    hotspot.locationId ||

                    hotspot.clusterId ||

                    hotspot.key;


                if (
                    explicitId
                ) {

                    return String(
                        explicitId
                    );

                }

            }


            const coordinates =

                MapRenderer
                    .getCoordinates(
                        hotspot
                    );


            const latPart =

                coordinates
                    ? Number(
                        coordinates.lat
                    ).toFixed(
                        6
                    )
                    : "NA";


            const lngPart =

                coordinates
                    ? Number(
                        coordinates.lng
                    ).toFixed(
                        6
                    )
                    : "NA";


            return [

                "OFFENCE",

                MapRenderer
                    .normalizeHotspotType(
                        type
                    ),

                latPart,

                lngPart,

                index

            ].join(
                "-"
            );

        };


    /* =====================================================
       29. GET COORDINATES

       Supports common hotspot structures:

       hotspot.lat / hotspot.lng
       hotspot.latitude / hotspot.longitude
       hotspot.location.lat / lng
       hotspot.coordinates.lat / lng
       hotspot.geo.lat / lng
       hotspot.position.lat / lng

       Also supports GeoJSON:
       [longitude, latitude]

       ===================================================== */

    MapRenderer.getCoordinates =
        function (
            hotspot
        ) {

            if (
                !hotspot ||
                typeof hotspot !==
                    "object"
            ) {

                return null;

            }


            const candidates = [

                {

                    lat:
                        hotspot.lat,

                    lng:
                        hotspot.lng

                },

                {

                    lat:
                        hotspot.latitude,

                    lng:
                        hotspot.longitude

                },

                {

                    lat:
                        hotspot.location
                            ?.lat,

                    lng:
                        hotspot.location
                            ?.lng

                },

                {

                    lat:
                        hotspot.location
                            ?.latitude,

                    lng:
                        hotspot.location
                            ?.longitude

                },

                {

                    lat:
                        hotspot.coordinates
                            ?.lat,

                    lng:
                        hotspot.coordinates
                            ?.lng

                },

                {

                    lat:
                        hotspot.geo
                            ?.lat,

                    lng:
                        hotspot.geo
                            ?.lng

                },

                {

                    lat:
                        hotspot.position
                            ?.lat,

                    lng:
                        hotspot.position
                            ?.lng

                }

            ];


            for (
                const candidate
                of candidates
            ) {

                const lat =
                    Number(
                        candidate.lat
                    );


                const lng =
                    Number(
                        candidate.lng
                    );


                if (
                    MapRenderer
                        .isValidCoordinate(
                            lat,
                            lng
                        )
                ) {

                    return {

                        lat:
                            lat,

                        lng:
                            lng

                    };

                }

            }


            /*
             * GeoJSON coordinate array:
             *
             * [longitude, latitude]
             */

            const coordinateArrays = [

                hotspot.coordinates,

                hotspot.geometry
                    ?.coordinates,

                hotspot.location
                    ?.coordinates

            ];


            for (
                const coordinates
                of coordinateArrays
            ) {

                if (
                    !Array.isArray(
                        coordinates
                    ) ||
                    coordinates.length <
                        2
                ) {

                    continue;

                }


                const lng =
                    Number(
                        coordinates[0]
                    );


                const lat =
                    Number(
                        coordinates[1]
                    );


                if (
                    MapRenderer
                        .isValidCoordinate(
                            lat,
                            lng
                        )
                ) {

                    return {

                        lat:
                            lat,

                        lng:
                            lng

                    };

                }

            }


            return null;

        };


    /* =====================================================
       30. VALIDATE COORDINATES
       ===================================================== */

    MapRenderer.isValidCoordinate =
        function (
            lat,
            lng
        ) {

            if (
                !Number.isFinite(
                    lat
                ) ||
                !Number.isFinite(
                    lng
                )
            ) {

                return false;

            }


            if (
                lat < -90 ||
                lat > 90
            ) {

                return false;

            }


            if (
                lng < -180 ||
                lng > 180
            ) {

                return false;

            }


            /*
             * Reject common empty coordinate placeholder.
             */

            if (
                lat === 0 &&
                lng === 0
            ) {

                return false;

            }


            return true;

        };


    /* =====================================================
       PART 2 END

       PART 3 CONTINUES WITH:

       31. getHotspotIntensity()
       32. shouldRenderVisibleMarker()
       33. buildHotspotTooltip()
       34. normalizeHotspotType()
       35. normalizeMode()
       36. setMode()
       37. show()
       38. hide()
       39. toggle()
       40. clearRenderedLayers()
       41. removeLayers()
       42. refresh()
       43. fitToHotspots()
       44. dispatchEvent()
       45. getState()
       46. destroy()
       47. expose module
       48. close IIFE

       DO NOT ADD })(); HERE.
       ===================================================== */
