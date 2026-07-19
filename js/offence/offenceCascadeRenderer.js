/* =========================================================
   GreenGuard
   Offence Intelligence Module

   File:
   js/offence/offenceMapRenderer.js

   Version:
   2.0.0

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
   - DOES render hotspot interaction markers
   - DOES emit hotspot-click events

   This module DOES NOT:

   - access Firestore
   - geocode
   - normalize offence records
   - resolve case relationships
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
        "2.0.0";


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

            if (
                MapRenderer.initialized
            ) {

                if (
                    map &&
                    !MapRenderer.map
                ) {

                    MapRenderer
                        .setMap(
                            map
                        );

                }


                return MapRenderer;

            }


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


            MapRenderer
                .createLayers();


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
                            MapRenderer.currentMode

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
                options.source
            ) {

                Object.assign(

                    MapRenderer
                        .CONFIG
                        .source,

                    options.source

                );

            }


            if (
                options.target
            ) {

                Object.assign(

                    MapRenderer
                        .CONFIG
                        .target,

                    options.target

                );

            }


            if (
                options.interaction
            ) {

                Object.assign(

                    MapRenderer
                        .CONFIG
                        .interaction,

                    options.interaction

                );

            }


            if (
                options.hotspotMarker
            ) {

                Object.assign(

                    MapRenderer
                        .CONFIG
                        .hotspotMarker,

                    options.hotspotMarker

                );

            }

        };


    /* =====================================================
       9. RESOLVE MAP

       Supports common GreenGuard map globals.

       Prefer explicit:
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
                        "function"
                ) {

                    return candidate;

                }

            }


            return null;

        };


    /* =====================================================
       10. SET MAP
       ===================================================== */

    MapRenderer.setMap =
        function (
            map
        ) {

            if (!map) {

                return false;

            }


            if (
                MapRenderer.map ===
                    map
            ) {

                return true;

            }


            MapRenderer
                .removeLayers();


            MapRenderer.map =
                map;


            MapRenderer
                .createLayers();


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
       ===================================================== */

    MapRenderer.createLayers =
        function () {

            if (
                !MapRenderer.map
            ) {

                return false;

            }


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

            MapRenderer
                .render();

        };


    /* =====================================================
       15. HANDLE DATA READY
       ===================================================== */

    MapRenderer.handleDataReady =
        function () {

            MapRenderer
                .render();

        };


    /* =====================================================
       16. RENDER

       Main rendering entry point.
       ===================================================== */

    MapRenderer.render =
        function (
            options = {}
        ) {

            if (
                !MapRenderer.initialized
            ) {

                MapRenderer
                    .init();

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


            if (
                options.mode
            ) {

                MapRenderer.currentMode =

                    MapRenderer
                        .normalizeMode(
                            options.mode
                        );

            }


            const sourceHotspots =

                MapRenderer
                    .getSourceHotspots();


            const targetHotspots =

                MapRenderer
                    .getTargetHotspots();


            MapRenderer
                .clearRenderedLayers();


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
                    targetHotspots.length

            };


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
       19. RENDER SOURCE
       ===================================================== */

    MapRenderer.renderSource =
        function (
            hotspots
        ) {

            if (
                !Array.isArray(
                    hotspots
                )
            ) {

                return;

            }


            const heatPoints =
                [];


            for (
                const hotspot
                of hotspots
            ) {

                const coordinates =

                    MapRenderer
                        .getCoordinates(
                            hotspot
                        );


                if (!coordinates) {

                    continue;

                }


                const intensity =

                    MapRenderer
                        .getIntensity(
                            hotspot
                        );


                heatPoints.push([

                    coordinates.lat,

                    coordinates.lng,

                    intensity

                ]);


                MapRenderer
                    .createInteractionMarker(

                        hotspot,

                        MapRenderer.TYPE_SOURCE,

                        coordinates,

                        MapRenderer
                            .layers
                            .sourceInteraction

                    );

            }


            /*
             * Heat layer.
             */

            if (
                typeof L.heatLayer ===
                    "function" &&
                heatPoints.length > 0
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


                MapRenderer.layers.source.addLayer(

                    MapRenderer
                        .layers
                        .sourceHeat

                );

            }


            /*
             * Fallback visible markers if Leaflet.heat
             * is unavailable.
             */

            else {

                MapRenderer
                    .renderFallbackMarkers(

                        hotspots,

                        "SOURCE",

                        MapRenderer
                            .layers
                            .sourceMarkers

                    );

            }

        };


    /* =====================================================
       20. RENDER TARGET
       ===================================================== */

    MapRenderer.renderTarget =
        function (
            hotspots
        ) {

            if (
                !Array.isArray(
                    hotspots
                )
            ) {

                return;

            }


            const heatPoints =
                [];


            for (
                const hotspot
                of hotspots
            ) {

                const coordinates =

                    MapRenderer
                        .getCoordinates(
                            hotspot
                        );


                if (!coordinates) {

                    continue;

                }


                const intensity =

                    MapRenderer
                        .getIntensity(
                            hotspot
                        );


                heatPoints.push([

                    coordinates.lat,

                    coordinates.lng,

                    intensity

                ]);


                MapRenderer
                    .createInteractionMarker(

                        hotspot,

                        MapRenderer.TYPE_TARGET,

                        coordinates,

                        MapRenderer
                            .layers
                            .targetInteraction

                    );

            }


            if (
                typeof L.heatLayer ===
                    "function" &&
                heatPoints.length > 0
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


                MapRenderer.layers.target.addLayer(

                    MapRenderer
                        .layers
                        .targetHeat

                );

            }


            else {

                MapRenderer
                    .renderFallbackMarkers(

                        hotspots,

                        "TARGET",

                        MapRenderer
                            .layers
                            .targetMarkers

                    );

            }

        };


    /* =====================================================
       21. TYPE CONSTANTS
       ===================================================== */

    MapRenderer.TYPE_SOURCE =
        "SOURCE";


    MapRenderer.TYPE_TARGET =
        "TARGET";


    /* =====================================================
       22. CREATE INTERACTION MARKER

       Heat layers themselves do not reliably expose
       individual hotspot click events.

       Transparent circle markers provide click targets.
       ===================================================== */

    MapRenderer.createInteractionMarker =
        function (
            hotspot,
            type,
            coordinates,
            layer
        ) {

            if (
                !hotspot ||
                !coordinates ||
                !layer
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

                    if (
                        event?.originalEvent
                    ) {

                        L.DomEvent.stopPropagation(
                            event.originalEvent
                        );

                    }


                    MapRenderer
                        .handleHotspotClick(

                            hotspot,

                            type,

                            event

                        );

                }

            );


            marker.on(

                "mouseover",

                function () {

                    MapRenderer
                        .dispatchEvent(

                            "offence:hotspot-hover",

                            {

                                hotspotId:

                                    MapRenderer
                                        .getHotspotId(
                                            hotspot,
                                            type
                                        ),

                                type:
                                    type,

                                hotspot:
                                    hotspot

                            }

                        );

                }

            );


            marker.addTo(
                layer
            );


            return marker;

        };


    /* =====================================================
       23. HANDLE HOTSPOT CLICK

       IMPORTANT:

       This is the bridge:

       Map
           ↓
       MapRenderer
           ↓
       offence:hotspot-click
           ↓
       CascadeController.openHotspot()
           ↓
       POR cascade
       ===================================================== */

    MapRenderer.handleHotspotClick =
        function (
            hotspot,
            type,
            event = null
        ) {

            const hotspotId =

                MapRenderer
                    .getHotspotId(

                        hotspot,

                        type

                    );


            if (!hotspotId) {

                if (
                    Constants.DEBUG
                        ?.ENABLED
                ) {

                    console.warn(

                        "[OffenceMapRenderer] Hotspot has no ID.",

                        hotspot

                    );

                }


                return false;

            }


            const coordinates =

                MapRenderer
                    .getCoordinates(
                        hotspot
                    );


            const latlng =

                event?.latlng ||

                (

                    coordinates

                        ? {

                            lat:
                                coordinates.lat,

                            lng:
                                coordinates.lng

                        }

                        : null

                );


            const detail = {

                hotspotId:
                    hotspotId,

                type:
                    type,

                hotspot:
                    hotspot,

                porKey:

                    hotspot.porKey ||

                    null,

                porKeys:

                    Array.isArray(
                        hotspot.porKeys
                    )

                        ? [...hotspot.porKeys]

                        : [],

                latlng:
                    latlng

            };


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


            return true;

        };


    /* =====================================================
       24. GET HOTSPOT ID
       ===================================================== */

    MapRenderer.getHotspotId =
        function (
            hotspot,
            type = ""
        ) {

            if (!hotspot) {

                return "";

            }


            const directId =

                hotspot.hotspotId ||

                hotspot.id;


            if (directId) {

                return String(
                    directId
                );

            }


            const coordinates =

                MapRenderer
                    .getCoordinates(
                        hotspot
                    );


            const locationKey =

                hotspot.locationKey ||

                hotspot.location ||

                hotspot.place ||

                hotspot.village ||

                hotspot.address ||

                "";


            const porKey =

                hotspot.porKey ||

                (

                    Array.isArray(
                        hotspot.porKeys
                    )

                        ? hotspot.porKeys
                            .join("|")

                        : ""

                );


            if (
                coordinates
            ) {

                return [

                    type ||
                    hotspot.type ||
                    "HOTSPOT",

                    coordinates.lat,

                    coordinates.lng,

                    locationKey,

                    porKey

                ].join(
                    "::"
                );

            }


            if (
                locationKey ||
                porKey
            ) {

                return [

                    type ||
                    hotspot.type ||
                    "HOTSPOT",

                    locationKey,

                    porKey

                ].join(
                    "::"
                );

            }


            return "";

        };


    /* =====================================================
       25. GET COORDINATES
       ===================================================== */

    MapRenderer.getCoordinates =
        function (
            hotspot
        ) {

            if (!hotspot) {

                return null;

            }


            let lat =

                hotspot.latitude ??

                hotspot.lat ??

                hotspot.location?.latitude ??

                hotspot.location?.lat ??

                hotspot.coordinates?.latitude ??

                hotspot.coordinates?.lat;


            let lng =

                hotspot.longitude ??

                hotspot.lng ??

                hotspot.lon ??

                hotspot.location?.longitude ??

                hotspot.location?.lng ??

                hotspot.location?.lon ??

                hotspot.coordinates?.longitude ??

                hotspot.coordinates?.lng ??
                
                hotspot.coordinates?.lon;


            /*
             * GeoJSON style:
             *
             * coordinates: [lng, lat]
             */

            if (
                Array.isArray(
                    hotspot.coordinates
                ) &&
                hotspot.coordinates.length >=
                    2
            ) {

                lng =
                    hotspot.coordinates[0];


                lat =
                    hotspot.coordinates[1];

            }


            lat =
                Number(
                    lat
                );


            lng =
                Number(
                    lng
                );


            if (
                !Number.isFinite(
                    lat
                ) ||
                !Number.isFinite(
                    lng
                )
            ) {

                return null;

            }


            if (
                lat < -90 ||
                lat > 90 ||
                lng < -180 ||
                lng > 180
            ) {

                return null;

            }


            return {

                lat:
                    lat,

                lng:
                    lng

            };

        };


    /* =====================================================
       26. GET INTENSITY

       Uses hotspot aggregate counts.

       Heat intensity normalized to 0..1.
       ===================================================== */

    MapRenderer.getIntensity =
        function (
            hotspot
        ) {

            if (!hotspot) {

                return 0.25;

            }


            const raw =

                Number(

                    hotspot.weight ??

                    hotspot.intensity ??

                    hotspot.score ??

                    hotspot.offenceCount ??

                    hotspot.caseCount ??

                    hotspot.count ??

                    1

                );


            if (
                !Number.isFinite(
                    raw
                )
            ) {

                return 0.25;

            }


            /*
             * Log scaling prevents a hotspot with many
             * records from overwhelming all others.
             */

            const normalized =

                Math.log10(
                    raw + 1
                ) /
                2;


            return Math.max(

                0.15,

                Math.min(
                    1,
                    normalized
                )

            );

        };


    /* =====================================================
       27. FALLBACK MARKERS

       Used if Leaflet.heat plugin is unavailable.
       ===================================================== */

    MapRenderer.renderFallbackMarkers =
        function (
            hotspots,
            type,
            layer
        ) {

            if (
                !Array.isArray(
                    hotspots
                ) ||
                !layer
            ) {

                return;

            }


            for (
                const hotspot
                of hotspots
            ) {

                const coordinates =

                    MapRenderer
                        .getCoordinates(
                            hotspot
                        );


                if (!coordinates) {

                    continue;

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
                                    .hotspotMarker
                                    .radius,

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

                                MapRenderer
                                    .CONFIG
                                    .hotspotMarker
                                    .fillOpacity,

                            interactive:
                                true

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

                                event

                            );

                    }

                );


                marker.bindTooltip(

                    MapRenderer
                        .getHotspotLabel(
                            hotspot,
                            type
                        ),

                    {

                        direction:
                            "top"

                    }

                );


                marker.addTo(
                    layer
                );

            }

        };


    /* =====================================================
       28. GET HOTSPOT LABEL
       ===================================================== */

    MapRenderer.getHotspotLabel =
        function (
            hotspot,
            type
        ) {

            const location =

                hotspot?.name ||

                hotspot?.locationName ||

                hotspot?.place ||

                hotspot?.village ||

                hotspot?.address ||

                hotspot?.locationKey ||

                "Unknown Location";


            const count =

                hotspot?.caseCount ??

                hotspot?.offenceCount ??

                hotspot?.count ??

                0;


            const label =

                type ===
                    MapRenderer.MODE.SOURCE

                    ? "Source"

                    : type ===
                        MapRenderer.MODE.TARGET

                        ? "Target"

                        : "Hotspot";


            return [

                label,

                location,

                count
                    ? "(" + count + ")"
                    : ""

            ]
                .filter(
                    Boolean
                )
                .join(
                    " · "
                );

        };


    /* =====================================================
       29. SET MODE
       ===================================================== */

    MapRenderer.setMode =
        function (
            mode
        ) {

            MapRenderer.currentMode =

                MapRenderer
                    .normalizeMode(
                        mode
                    );


            if (
                MapRenderer.initialized
            ) {

                MapRenderer
                    .render();

            }


            return MapRenderer.currentMode;

        };


    /* =====================================================
       30. NORMALIZE MODE
       ===================================================== */

    MapRenderer.normalizeMode =
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


            if (
                value ===
                    MapRenderer.MODE.SOURCE
            ) {

                return MapRenderer.MODE.SOURCE;

            }


            if (
                value ===
                    MapRenderer.MODE.TARGET
            ) {

                return MapRenderer.MODE.TARGET;

            }


            return MapRenderer.MODE.ALL;

        };


    /* =====================================================
       31. SHOW SOURCE
       ===================================================== */

    MapRenderer.showSource =
        function () {

            return MapRenderer
                .setMode(
                    MapRenderer.MODE.SOURCE
                );

        };


    /* =====================================================
       32. SHOW TARGET
       ===================================================== */

    MapRenderer.showTarget =
        function () {

            return MapRenderer
                .setMode(
                    MapRenderer.MODE.TARGET
                );

        };


    /* =====================================================
       33. SHOW ALL
       ===================================================== */

    MapRenderer.showAll =
        function () {

            return MapRenderer
                .setMode(
                    MapRenderer.MODE.ALL
                );

        };


    /* =====================================================
       34. SHOW
       ===================================================== */

    MapRenderer.show =
        function () {

            if (
                !MapRenderer.map ||
                !MapRenderer.layers.root
            ) {

                return false;

            }


            if (
                !MapRenderer.map.hasLayer(
                    MapRenderer.layers.root
                )
            ) {

                MapRenderer.layers.root.addTo(
                    MapRenderer.map
                );

            }


            MapRenderer.visible =
                true;


            return true;

        };


    /* =====================================================
       35. HIDE
       ===================================================== */

    MapRenderer.hide =
        function () {

            if (
                !MapRenderer.map ||
                !MapRenderer.layers.root
            ) {

                return false;

            }


            if (
                MapRenderer.map.hasLayer(
                    MapRenderer.layers.root
                )
            ) {

                MapRenderer.map.removeLayer(
                    MapRenderer.layers.root
                );

            }


            MapRenderer.visible =
                false;


            return true;

        };


    /* =====================================================
       36. TOGGLE
       ===================================================== */

    MapRenderer.toggle =
        function () {

            if (
                MapRenderer.visible
            ) {

                MapRenderer
                    .hide();

            }

            else {

                MapRenderer
                    .show();

            }


            return MapRenderer.visible;

        };


    /* =====================================================
       37. CLEAR RENDERED LAYERS
       ===================================================== */

    MapRenderer.clearRenderedLayers =
        function () {

            if (
                MapRenderer.layers.sourceHeat &&
                MapRenderer.layers.source
            ) {

                MapRenderer.layers.source.removeLayer(

                    MapRenderer
                        .layers
                        .sourceHeat

                );


                MapRenderer.layers.sourceHeat =
                    null;

            }


            if (
                MapRenderer.layers.targetHeat &&
                MapRenderer.layers.target
            ) {

                MapRenderer.layers.target.removeLayer(

                    MapRenderer
                        .layers
                        .targetHeat

                );


                MapRenderer.layers.targetHeat =
                    null;

            }


            MapRenderer.layers
                .sourceInteraction
                ?.clearLayers();


            MapRenderer.layers
                .targetInteraction
                ?.clearLayers();


            MapRenderer.layers
                .sourceMarkers
                ?.clearLayers();


            MapRenderer.layers
                .targetMarkers
                ?.clearLayers();

        };


    /* =====================================================
       38. CLEAR
       ===================================================== */

    MapRenderer.clear =
        function () {

            MapRenderer
                .clearRenderedLayers();


            return true;

        };


    /* =====================================================
       39. REMOVE LAYERS
       ===================================================== */

    MapRenderer.removeLayers =
        function () {

            if (
                MapRenderer.map &&
                MapRenderer.layers.root &&
                MapRenderer.map.hasLayer(
                    MapRenderer.layers.root
                )
            ) {

                MapRenderer.map.removeLayer(

                    MapRenderer
                        .layers
                        .root

                );

            }


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

        };


    /* =====================================================
       40. FIT TO HOTSPOTS
       ===================================================== */

    MapRenderer.fitBounds =
        function (
            type = "ALL"
        ) {

            if (
                !MapRenderer.map
            ) {

                return false;

            }


            const mode =

                MapRenderer
                    .normalizeMode(
                        type
                    );


            let hotspots =
                [];


            if (
                mode ===
                    MapRenderer.MODE.SOURCE
            ) {

                hotspots =

                    MapRenderer
                        .getSourceHotspots();

            }

            else if (
                mode ===
                    MapRenderer.MODE.TARGET
            ) {

                hotspots =

                    MapRenderer
                        .getTargetHotspots();

            }

            else {

                hotspots = [

                    ...MapRenderer
                        .getSourceHotspots(),

                    ...MapRenderer
                        .getTargetHotspots()

                ];

            }


            const points =
                [];


            for (
                const hotspot
                of hotspots
            ) {

                const coordinates =

                    MapRenderer
                        .getCoordinates(
                            hotspot
                        );


                if (coordinates) {

                    points.push([

                        coordinates.lat,

                        coordinates.lng

                    ]);

                }

            }


            if (
                points.length ===
                    0
            ) {

                return false;

            }


            if (
                points.length ===
                    1
            ) {

                MapRenderer.map.setView(

                    points[0],

                    Math.max(

                        MapRenderer.map
                            .getZoom(),

                        14

                    )

                );


                return true;

            }


            MapRenderer.map.fitBounds(

                L.latLngBounds(
                    points
                ),

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
       41. GET STATUS
       ===================================================== */

    MapRenderer.getStatus =
        function () {

            return {

                version:
                    MapRenderer.VERSION,

                initialized:
                    MapRenderer.initialized,

                visible:
                    MapRenderer.visible,

                mode:
                    MapRenderer.currentMode,

                mapAvailable:
                    !!MapRenderer.map,

                sourceCount:

                    MapRenderer
                        .getSourceHotspots()
                        .length,

                targetCount:

                    MapRenderer
                        .getTargetHotspots()
                        .length

            };

        };


    /* =====================================================
       42. DISPATCH EVENT
       ===================================================== */

    MapRenderer.dispatchEvent =
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
       43. REFRESH
       ===================================================== */

    MapRenderer.refresh =
        function () {

            return MapRenderer
                .render({

                    show:
                        MapRenderer.visible

                });

        };


    /* =====================================================
       44. DESTROY
       ===================================================== */

    MapRenderer.destroy =
        function () {

            MapRenderer
                .unbindEvents();


            MapRenderer
                .removeLayers();


            MapRenderer.map =
                null;


            MapRenderer.initialized =
                false;


            MapRenderer.visible =
                false;


            return true;

        };


    /* =====================================================
       45. EXPORT
       ===================================================== */

    GG.Offence.MapRenderer =
        MapRenderer;


    /* =====================================================
       46. READY LOG

       Do NOT auto-render here.

       Main application should initialize after:
       - Leaflet map exists
       - offence data loaded
       - HeatmapEngine built
       ===================================================== */

    if (
        Constants.DEBUG
            ?.ENABLED
    ) {

        console.log(

            "🔥 OffenceMapRenderer Loaded",

            {

                version:
                    MapRenderer.VERSION,

                connector:
                    "POR",

                module:
                    MapRenderer

            }

        );

    }


})();
