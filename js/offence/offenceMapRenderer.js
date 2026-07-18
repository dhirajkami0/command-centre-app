/* =========================================================
   GreenGuard
   Offence Intelligence Module

   File:
   js/offence/offenceMapRenderer.js

   Purpose:
   - Render SOURCE offence heatmap
   - Render TARGET offence heatmap
   - Show SOURCE + TARGET simultaneously
   - Create clickable hotspot interaction markers
   - Support SOURCE / TARGET / BOTH modes
   - Handle heatmap refresh
   - Emit hotspot click events
   - Keep Leaflet logic separate from data engines

   Dependencies:
   1. Leaflet
   2. Leaflet.heat
   3. offenceConstants.js
   4. offenceHeatmapEngine.js

   IMPORTANT:
   - Does NOT load offence data
   - Does NOT geocode
   - Does NOT aggregate offences
   - Does NOT build cascade HTML
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


    /* =====================================================
       3. MODULE
       ===================================================== */

    const MapRenderer = {};


    /* =====================================================
       4. MODULE INFO
       ===================================================== */

    MapRenderer.VERSION =
        "1.0.0";

    MapRenderer.initialized =
        false;

    MapRenderer.rendered =
        false;


    /* =====================================================
       5. MAP REFERENCE
       ===================================================== */

    MapRenderer.map =
        null;


    /* =====================================================
       6. LEAFLET LAYERS

       sourceHeatLayer
           SOURCE intensity visualization

       targetHeatLayer
           TARGET intensity visualization

       sourceMarkerLayer
           clickable SOURCE hotspots

       targetMarkerLayer
           clickable TARGET hotspots
       ===================================================== */

    MapRenderer.layers = {

        sourceHeatLayer:
            null,

        targetHeatLayer:
            null,

        sourceMarkerLayer:
            null,

        targetMarkerLayer:
            null

    };


    /* =====================================================
       7. CONFIGURATION

       NOTE:
       Heat layer gradients intentionally differ so
       SOURCE and TARGET can be visually distinguished.

       Change these later from OffenceConstants if desired.
       ===================================================== */

    MapRenderer.config = {

        source: {

            radius:
                28,

            blur:
                22,

            maxZoom:
                17,

            minOpacity:
                0.25,

            gradient: {

                0.20:
                    "#2b83ba",

                0.40:
                    "#00a6ca",

                0.60:
                    "#00ccbc",

                0.80:
                    "#90eb9d",

                1.00:
                    "#ffff8c"

            }

        },


        target: {

            radius:
                28,

            blur:
                22,

            maxZoom:
                17,

            minOpacity:
                0.25,

            gradient: {

                0.20:
                    "#ffffb2",

                0.40:
                    "#fecc5c",

                0.60:
                    "#fd8d3c",

                0.80:
                    "#f03b20",

                1.00:
                    "#bd0026"

            }

        },


        marker: {

            radius:
                18,

            fillOpacity:
                0.01,

            opacity:
                0

        }

    };


    /* =====================================================
       8. INITIALIZE

       Usage:

       GG.Offence.MapRenderer.init(map);

       OR:

       GG.Offence.MapRenderer.init();

       if window.map exists.
       ===================================================== */

    MapRenderer.init =
        function (

            leafletMap = null

        ) {

            if (
                MapRenderer.initialized &&
                MapRenderer.map
            ) {

                return MapRenderer;

            }


            /* -------------------------
               Validate Leaflet
               ------------------------- */

            if (
                typeof window.L ===
                "undefined"
            ) {

                console.error(

                    "[OffenceMapRenderer] Leaflet unavailable."

                );


                return null;

            }


            /* -------------------------
               Resolve map
               ------------------------- */

            MapRenderer.map =

                leafletMap ||

                window.map ||

                null;


            if (
                !MapRenderer.map
            ) {

                console.error(

                    "[OffenceMapRenderer] Leaflet map unavailable."

                );


                return null;

            }


            /* -------------------------
               Validate Leaflet.heat
               ------------------------- */

            if (
                typeof L.heatLayer !==
                "function"
            ) {

                console.error(

                    "[OffenceMapRenderer] Leaflet.heat plugin unavailable."

                );


                return null;

            }


            /* -------------------------
               Create interaction groups
               ------------------------- */

            MapRenderer.layers
                .sourceMarkerLayer =

                L.layerGroup();


            MapRenderer.layers
                .targetMarkerLayer =

                L.layerGroup();


            MapRenderer.initialized =
                true;


            /* -------------------------
               Register events
               ------------------------- */

            MapRenderer
                .bindEvents();


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(

                    "🔥 OffenceMapRenderer Ready"

                );

            }


            return MapRenderer;

        };


    /* =====================================================
       9. BIND EVENTS
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


            /* -------------------------
               Heatmap data updated
               ------------------------- */

            window.addEventListener(

                Constants.EVENTS
                    ?.HEATMAP_UPDATED ||

                "offence:heatmap-updated",

                function () {

                    if (
                        MapRenderer.initialized
                    ) {

                        MapRenderer
                            .render();

                    }

                }

            );


            /* -------------------------
               Mode changed
               ------------------------- */

            window.addEventListener(

                "offence:heatmap-mode-changed",

                function () {

                    if (
                        MapRenderer.initialized
                    ) {

                        MapRenderer
                            .applyMode();

                    }

                }

            );

        };


    /* =====================================================
       10. CREATE SOURCE HEAT LAYER
       ===================================================== */

    MapRenderer.createSourceHeatLayer =
        function (

            heatData = []

        ) {

            return L.heatLayer(

                heatData,

                {

                    radius:

                        MapRenderer.config
                            .source
                            .radius,

                    blur:

                        MapRenderer.config
                            .source
                            .blur,

                    maxZoom:

                        MapRenderer.config
                            .source
                            .maxZoom,

                    minOpacity:

                        MapRenderer.config
                            .source
                            .minOpacity,

                    gradient:

                        MapRenderer.config
                            .source
                            .gradient

                }

            );

        };


    /* =====================================================
       11. CREATE TARGET HEAT LAYER
       ===================================================== */

    MapRenderer.createTargetHeatLayer =
        function (

            heatData = []

        ) {

            return L.heatLayer(

                heatData,

                {

                    radius:

                        MapRenderer.config
                            .target
                            .radius,

                    blur:

                        MapRenderer.config
                            .target
                            .blur,

                    maxZoom:

                        MapRenderer.config
                            .target
                            .maxZoom,

                    minOpacity:

                        MapRenderer.config
                            .target
                            .minOpacity,

                    gradient:

                        MapRenderer.config
                            .target
                            .gradient

                }

            );

        };


    /* =====================================================
       12. RENDER

       Main rendering function.

       HeatmapEngine
            ↓
       SOURCE heat
       TARGET heat
            ↓
       interaction markers
            ↓
       apply display mode
       ===================================================== */

    MapRenderer.render =
        function () {

            if (
                !MapRenderer.initialized
            ) {

                const initialized =

                    MapRenderer
                        .init();


                if (
                    !initialized
                ) {

                    return false;

                }

            }


            /* -------------------------
               Remove existing layers
               ------------------------- */

            MapRenderer
                .clearLayers();


            /* -------------------------
               Get all data

               Always retrieve BOTH here.

               applyMode() controls visibility.
               ------------------------- */

            const heatData =

                HeatmapEngine
                    .getHeatData(

                        HeatmapEngine
                            .MODE
                            .BOTH

                    );


            const markerData =

                HeatmapEngine
                    .getMarkerData(

                        HeatmapEngine
                            .MODE
                            .BOTH

                    );


            /* -------------------------
               Create SOURCE heat
               ------------------------- */

            MapRenderer.layers
                .sourceHeatLayer =

                MapRenderer
                    .createSourceHeatLayer(

                        heatData.sources ||

                        []

                    );


            /* -------------------------
               Create TARGET heat
               ------------------------- */

            MapRenderer.layers
                .targetHeatLayer =

                MapRenderer
                    .createTargetHeatLayer(

                        heatData.targets ||

                        []

                    );


            /* -------------------------
               Recreate marker groups
               ------------------------- */

            MapRenderer.layers
                .sourceMarkerLayer =

                L.layerGroup();


            MapRenderer.layers
                .targetMarkerLayer =

                L.layerGroup();


            /* -------------------------
               Build SOURCE markers
               ------------------------- */

            MapRenderer
                .buildSourceMarkers(

                    markerData.sources ||

                    []

                );


            /* -------------------------
               Build TARGET markers
               ------------------------- */

            MapRenderer
                .buildTargetMarkers(

                    markerData.targets ||

                    []

                );


            /* -------------------------
               Apply current mode
               ------------------------- */

            MapRenderer
                .applyMode();


            MapRenderer.rendered =
                true;


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(

                    "🔥 Offence Map Rendered",

                    {

                        sourceHeatPoints:

                            heatData.sources
                                ?.length ||
                            0,

                        targetHeatPoints:

                            heatData.targets
                                ?.length ||
                            0,

                        sourceMarkers:

                            markerData.sources
                                ?.length ||
                            0,

                        targetMarkers:

                            markerData.targets
                                ?.length ||
                            0,

                        mode:

                            HeatmapEngine
                                .getMode()

                    }

                );

            }


            return true;

        };


    /* =====================================================
       13. BUILD SOURCE MARKERS
       ===================================================== */

    MapRenderer.buildSourceMarkers =
        function (

            hotspots = []

        ) {

            if (
                !Array.isArray(
                    hotspots
                )
            ) {

                return;

            }


            for (

                const hotspot

                of hotspots

            ) {

                const marker =

                    MapRenderer
                        .createInteractionMarker(

                            hotspot,

                            HeatmapEngine
                                .MODE
                                .SOURCE

                        );


                if (
                    marker
                ) {

                    marker.addTo(

                        MapRenderer.layers
                            .sourceMarkerLayer

                    );

                }

            }

        };


    /* =====================================================
       14. BUILD TARGET MARKERS
       ===================================================== */

    MapRenderer.buildTargetMarkers =
        function (

            hotspots = []

        ) {

            if (
                !Array.isArray(
                    hotspots
                )
            ) {

                return;

            }


            for (

                const hotspot

                of hotspots

            ) {

                const marker =

                    MapRenderer
                        .createInteractionMarker(

                            hotspot,

                            HeatmapEngine
                                .MODE
                                .TARGET

                        );


                if (
                    marker
                ) {

                    marker.addTo(

                        MapRenderer.layers
                            .targetMarkerLayer

                    );

                }

            }

        };


    /* =====================================================
       15. CREATE INTERACTION MARKER

       Heat layers themselves are canvas-based and
       do not provide individual hotspot click events.

       Therefore we create invisible CircleMarkers
       above the heatmap.

       User clicks heat area
             ↓
       Invisible marker receives click
             ↓
       Hotspot ID resolved
             ↓
       Cascade event emitted
       ===================================================== */

    MapRenderer.createInteractionMarker =
        function (

            hotspot,

            type

        ) {

            if (
                !hotspot
            ) {

                return null;

            }


            const latitude =

                Number(

                    hotspot.latitude

                );


            const longitude =

                Number(

                    hotspot.longitude

                );


            if (

                !Number.isFinite(
                    latitude
                ) ||

                !Number.isFinite(
                    longitude
                )

            ) {

                return null;

            }


            const marker =

                L.circleMarker(

                    [

                        latitude,

                        longitude

                    ],

                    {

                        radius:

                            MapRenderer.config
                                .marker
                                .radius,

                        opacity:

                            MapRenderer.config
                                .marker
                                .opacity,

                        fillOpacity:

                            MapRenderer.config
                                .marker
                                .fillOpacity,

                        interactive:

                            true,

                        bubblingMouseEvents:

                            false

                    }

                );


            /* -------------------------
               Attach metadata
               ------------------------- */

            marker._offenceHotspotId =

                hotspot.id;


            marker._offenceHotspotType =

                type;


            /* -------------------------
               Click
               ------------------------- */

            marker.on(

                "click",

                function (

                    event

                ) {

                    MapRenderer
                        .handleHotspotClick(

                            hotspot,

                            type,

                            event

                        );

                }

            );


            return marker;

        };


    /* =====================================================
       16. HANDLE HOTSPOT CLICK
       ===================================================== */

    MapRenderer.handleHotspotClick =
        function (

            hotspot,

            type,

            leafletEvent = null

        ) {

            if (
                !hotspot
            ) {

                return;

            }


            const cascade =

                HeatmapEngine
                    .getCascadeData(

                        hotspot.id

                    );


            const detail = {

                hotspotId:

                    hotspot.id,

                type:

                    type,

                hotspot:

                    hotspot,

                cascade:

                    cascade,

                latlng:

                    leafletEvent
                        ?.latlng ||

                    {

                        lat:

                            hotspot.latitude,

                        lng:

                            hotspot.longitude

                    }

            };


            /* -------------------------
               Emit unified click event
               ------------------------- */

            MapRenderer
                .dispatchEvent(

                    Constants.EVENTS
                        ?.HOTSPOT_CLICK ||

                    "offence:hotspot-click",

                    detail

                );


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(

                    "🔥 Offence Hotspot Click",

                    detail

                );

            }

        };


    /* =====================================================
       17. APPLY DISPLAY MODE
       ===================================================== */

    MapRenderer.applyMode =
        function () {

            if (
                !MapRenderer.map
            ) {

                return false;

            }


            const mode =

                HeatmapEngine
                    .getMode();


            /* -------------------------
               First remove all offence
               rendering layers
               ------------------------- */

            MapRenderer
                .removeLayer(

                    MapRenderer.layers
                        .sourceHeatLayer

                );


            MapRenderer
                .removeLayer(

                    MapRenderer.layers
                        .targetHeatLayer

                );


            MapRenderer
                .removeLayer(

                    MapRenderer.layers
                        .sourceMarkerLayer

                );


            MapRenderer
                .removeLayer(

                    MapRenderer.layers
                        .targetMarkerLayer

                );


            /* =================================================
               SOURCE MODE
               ================================================= */

            if (

                mode ===
                HeatmapEngine.MODE.SOURCE

            ) {

                MapRenderer
                    .addLayer(

                        MapRenderer.layers
                            .sourceHeatLayer

                    );


                MapRenderer
                    .addLayer(

                        MapRenderer.layers
                            .sourceMarkerLayer

                    );

            }


            /* =================================================
               TARGET MODE
               ================================================= */

            else if (

                mode ===
                HeatmapEngine.MODE.TARGET

            ) {

                MapRenderer
                    .addLayer(

                        MapRenderer.layers
                            .targetHeatLayer

                    );


                MapRenderer
                    .addLayer(

                        MapRenderer.layers
                            .targetMarkerLayer

                    );

            }


            /* =================================================
               BOTH MODE

               Heat layers first.

               Interaction marker groups afterwards.
               ================================================= */

            else {

                MapRenderer
                    .addLayer(

                        MapRenderer.layers
                            .sourceHeatLayer

                    );


                MapRenderer
                    .addLayer(

                        MapRenderer.layers
                            .targetHeatLayer

                    );


                MapRenderer
                    .addLayer(

                        MapRenderer.layers
                            .sourceMarkerLayer

                    );


                MapRenderer
                    .addLayer(

                        MapRenderer.layers
                            .targetMarkerLayer

                    );

            }


            MapRenderer
                .dispatchEvent(

                    "offence:map-mode-applied",

                    {

                        mode:
                            mode

                    }

                );


            return true;

        };


    /* =====================================================
       18. ADD LAYER SAFELY
       ===================================================== */

    MapRenderer.addLayer =
        function (

            layer

        ) {

            if (
                !layer ||
                !MapRenderer.map
            ) {

                return;

            }


            if (
                !MapRenderer.map
                    .hasLayer(
                        layer
                    )
            ) {

                layer.addTo(

                    MapRenderer.map

                );

            }

        };


    /* =====================================================
       19. REMOVE LAYER SAFELY
       ===================================================== */

    MapRenderer.removeLayer =
        function (

            layer

        ) {

            if (
                !layer ||
                !MapRenderer.map
            ) {

                return;

            }


            if (
                MapRenderer.map
                    .hasLayer(
                        layer
                    )
            ) {

                MapRenderer.map
                    .removeLayer(

                        layer

                    );

            }

        };


    /* =====================================================
       20. CLEAR RENDERED LAYERS

       Removes old Leaflet layers before rebuilding.
       ===================================================== */

    MapRenderer.clearLayers =
        function () {

            MapRenderer
                .removeLayer(

                    MapRenderer.layers
                        .sourceHeatLayer

                );


            MapRenderer
                .removeLayer(

                    MapRenderer.layers
                        .targetHeatLayer

                );


            MapRenderer
                .removeLayer(

                    MapRenderer.layers
                        .sourceMarkerLayer

                );


            MapRenderer
                .removeLayer(

                    MapRenderer.layers
                        .targetMarkerLayer

                );


            if (
                MapRenderer.layers
                    .sourceMarkerLayer &&
                typeof MapRenderer.layers
                    .sourceMarkerLayer
                    .clearLayers ===
                    "function"
            ) {

                MapRenderer.layers
                    .sourceMarkerLayer
                    .clearLayers();

            }


            if (
                MapRenderer.layers
                    .targetMarkerLayer &&
                typeof MapRenderer.layers
                    .targetMarkerLayer
                    .clearLayers ===
                    "function"
            ) {

                MapRenderer.layers
                    .targetMarkerLayer
                    .clearLayers();

            }


            MapRenderer.layers
                .sourceHeatLayer =
                null;


            MapRenderer.layers
                .targetHeatLayer =
                null;

        };


    /* =====================================================
       21. REFRESH MAP

       Rebuild data first, then renderer automatically
       receives heatmap-updated event.

       Can also be called manually.
       ===================================================== */

    MapRenderer.refresh =
        async function () {

            const result =

                await HeatmapEngine
                    .refresh();


            if (
                result
                    ?.success !== true
            ) {

                return result;

            }


            /*
             * HeatmapEngine.build() emits the update event.
             * bindEvents() normally calls render().
             *
             * If the event architecture is changed later,
             * this remains safe because render() can also
             * be called manually.
             */


            return result;

        };


    /* =====================================================
       22. SHOW SOURCE
       ===================================================== */

    MapRenderer.showSource =
        function () {

            HeatmapEngine
                .setMode(

                    HeatmapEngine
                        .MODE
                        .SOURCE

                );

        };


    /* =====================================================
       23. SHOW TARGET
       ===================================================== */

    MapRenderer.showTarget =
        function () {

            HeatmapEngine
                .setMode(

                    HeatmapEngine
                        .MODE
                        .TARGET

                );

        };


    /* =====================================================
       24. SHOW BOTH
       ===================================================== */

    MapRenderer.showBoth =
        function () {

            HeatmapEngine
                .setMode(

                    HeatmapEngine
                        .MODE
                        .BOTH

                );

        };


    /* =====================================================
       25. HIDE ALL OFFENCE LAYERS
       ===================================================== */

    MapRenderer.hide =
        function () {

            MapRenderer
                .removeLayer(

                    MapRenderer.layers
                        .sourceHeatLayer

                );


            MapRenderer
                .removeLayer(

                    MapRenderer.layers
                        .targetHeatLayer

                );


            MapRenderer
                .removeLayer(

                    MapRenderer.layers
                        .sourceMarkerLayer

                );


            MapRenderer
                .removeLayer(

                    MapRenderer.layers
                        .targetMarkerLayer

                );

        };


    /* =====================================================
       26. SHOW CURRENT MODE
       ===================================================== */

    MapRenderer.show =
        function () {

            MapRenderer
                .applyMode();

        };


    /* =====================================================
       27. FIT MAP TO OFFENCE HOTSPOTS
       ===================================================== */

    MapRenderer.fitBounds =
        function () {

            if (
                !MapRenderer.map
            ) {

                return false;

            }


            const markerData =

                HeatmapEngine
                    .getMarkerData(

                        HeatmapEngine
                            .MODE
                            .BOTH

                    );


            const points = [];


            for (

                const hotspot

                of (

                    markerData.sources ||

                    []

                )

            ) {

                const lat =

                    Number(
                        hotspot.latitude
                    );


                const lng =

                    Number(
                        hotspot.longitude
                    );


                if (

                    Number.isFinite(
                        lat
                    ) &&

                    Number.isFinite(
                        lng
                    )

                ) {

                    points.push(

                        [

                            lat,

                            lng

                        ]

                    );

                }

            }


            for (

                const hotspot

                of (

                    markerData.targets ||

                    []

                )

            ) {

                const lat =

                    Number(
                        hotspot.latitude
                    );


                const lng =

                    Number(
                        hotspot.longitude
                    );


                if (

                    Number.isFinite(
                        lat
                    ) &&

                    Number.isFinite(
                        lng
                    )

                ) {

                    points.push(

                        [

                            lat,

                            lng

                        ]

                    );

                }

            }


            if (
                points.length === 0
            ) {

                return false;

            }


            const bounds =

                L.latLngBounds(

                    points

                );


            MapRenderer.map
                .fitBounds(

                    bounds,

                    {

                        padding:

                            [

                                30,

                                30

                            ]

                    }

                );


            return true;

        };


    /* =====================================================
       28. GET LAYER STATUS
       ===================================================== */

    MapRenderer.getLayerStatus =
        function () {

            const map =

                MapRenderer.map;


            return {

                initialized:

                    MapRenderer.initialized,

                rendered:

                    MapRenderer.rendered,

                mode:

                    HeatmapEngine
                        .getMode(),

                sourceHeatVisible:

                    !!(

                        map &&

                        MapRenderer.layers
                            .sourceHeatLayer &&

                        map.hasLayer(

                            MapRenderer.layers
                                .sourceHeatLayer

                        )

                    ),

                targetHeatVisible:

                    !!(

                        map &&

                        MapRenderer.layers
                            .targetHeatLayer &&

                        map.hasLayer(

                            MapRenderer.layers
                                .targetHeatLayer

                        )

                    ),

                sourceMarkersVisible:

                    !!(

                        map &&

                        MapRenderer.layers
                            .sourceMarkerLayer &&

                        map.hasLayer(

                            MapRenderer.layers
                                .sourceMarkerLayer

                        )

                    ),

                targetMarkersVisible:

                    !!(

                        map &&

                        MapRenderer.layers
                            .targetMarkerLayer &&

                        map.hasLayer(

                            MapRenderer.layers
                                .targetMarkerLayer

                        )

                    )

            };

        };


    /* =====================================================
       29. DISPATCH EVENT
       ===================================================== */

    MapRenderer.dispatchEvent =
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

                        "[OffenceMapRenderer] Event dispatch failed",

                        eventName,

                        error

                    );

                }

            }

        };


    /* =====================================================
       30. DESTROY

       Useful if map is recreated.
       ===================================================== */

    MapRenderer.destroy =
        function () {

            MapRenderer
                .clearLayers();


            MapRenderer.map =
                null;


            MapRenderer.initialized =
                false;


            MapRenderer.rendered =
                false;


            return true;

        };


    /* =====================================================
       31. EXPORT
       ===================================================== */

    GG.Offence.MapRenderer =
        MapRenderer;


    /* =====================================================
       32. READY LOG
       ===================================================== */

    if (
        Constants.DEBUG
            ?.ENABLED
    ) {

        console.log(

            "🔥 OffenceMapRenderer Loaded",

            MapRenderer

        );

    }


})();
