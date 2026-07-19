/* =========================================================
   GreenGuard
   Offence Intelligence Module

   File:
   js/offence/offenceMapRenderer.js

   Version:
   2.2.0

   Purpose:
   - Render SOURCE offence heatmap
   - Render TARGET offence heatmap
   - Render SOURCE + TARGET simultaneously
   - Create clickable hotspot interaction markers
   - Support SOURCE / TARGET / BOTH modes
   - Handle heatmap refresh
   - Emit POR-authoritative hotspot click events
   - Keep Leaflet rendering separate from data engines

   AUTHORITATIVE RELATIONSHIP CONNECTOR:
   POR / Ref POR No
   normalized internally as:
   porKey

   ARCHITECTURE:

   OffenceStore
        ↓
   OffenceSourceEngine
   OffenceTargetEngine
        ↓
   OffenceHeatmapEngine
        ↓
   OffenceMapRenderer
        ↓
   offence:hotspot-click
        ↓
   OffenceCascadeController
        ↓
   POR / porKey relationship resolution
        ↓
   OffenceCascadeRenderer

   IMPORTANT:

   - CaseID is NOT the authoritative cross-collection connector.
   - SeizureID is NOT the authoritative cross-collection connector.
   - POR / porKey is authoritative.
   - CaseID and SeizureID remain record identifiers.
   - This renderer DOES NOT resolve offence relationships.
   - This renderer DOES NOT build cascade HTML.
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

    const MapRenderer =
        {};


    /* =====================================================
       4. MODULE INFO
       ===================================================== */

    MapRenderer.VERSION =
        "2.2.0";


    MapRenderer.CONNECTOR =
        "POR";


    MapRenderer.AUTHORITATIVE_CONNECTOR =
        "porKey";


    MapRenderer.initialized =
        false;


    MapRenderer.rendered =
        false;


    MapRenderer.visible =
        false;


    MapRenderer._eventsBound =
        false;


    /* =====================================================
       5. MAP REFERENCE
       ===================================================== */

    MapRenderer.map =
        null;


    /* =====================================================
       6. MODES
       ===================================================== */

    MapRenderer.MODE = {

        SOURCE:
            "SOURCE",

        TARGET:
            "TARGET",

        BOTH:
            "BOTH"

    };


    /* =====================================================
       7. LAYERS
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
       8. CONFIGURATION
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
                20,

            opacity:
                0,

            fillOpacity:
                0.01

        }

    };


    /* =====================================================
       9. DEBUG
       ===================================================== */

    MapRenderer.debug =
        function (

            ...args

        ) {

            if (

                Constants.DEBUG
                    ?.ENABLED

            ) {

                console.log(

                    "[OffenceMapRenderer]",

                    ...args

                );

            }

        };


    /* =====================================================
       10. INITIALIZE
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
               Marker groups
               ------------------------- */

            MapRenderer.layers
                .sourceMarkerLayer =

                L.layerGroup();


            MapRenderer.layers
                .targetMarkerLayer =

                L.layerGroup();


            MapRenderer.initialized =
                true;


            MapRenderer
                .bindEvents();


            MapRenderer.debug(

                "Ready",

                {

                    version:
                        MapRenderer.VERSION,

                    connector:
                        MapRenderer.CONNECTOR,

                    authoritativeConnector:
                        MapRenderer.AUTHORITATIVE_CONNECTOR

                }

            );


            return MapRenderer;

        };


    /* =====================================================
       11. BIND EVENTS
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
               Heatmap rebuilt
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
       12. CREATE SOURCE HEAT LAYER
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
       13. CREATE TARGET HEAT LAYER
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
       14. GET MODE
       ===================================================== */

    MapRenderer.getMode =
        function () {

            if (

                typeof HeatmapEngine
                    .getMode ===
                "function"

            ) {

                return HeatmapEngine
                    .getMode();

            }


            return (

                HeatmapEngine
                    .MODE
                    ?.BOTH ||

                MapRenderer.MODE.BOTH

            );

        };


    /* =====================================================
       15. GET BOTH MODE
       ===================================================== */

    MapRenderer.getBothMode =
        function () {

            return (

                HeatmapEngine
                    .MODE
                    ?.BOTH ||

                MapRenderer.MODE.BOTH

            );

        };


    /* =====================================================
       16. RENDER
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


            MapRenderer
                .clearLayers();


            /* -------------------------
               Get heat data
               ------------------------- */

            let heatData = {

                sources:
                    [],

                targets:
                    []

            };


            if (

                typeof HeatmapEngine
                    .getHeatData ===
                "function"

            ) {

                heatData =

                    HeatmapEngine
                        .getHeatData(

                            MapRenderer
                                .getBothMode()

                        ) ||

                    heatData;

            }


            /* -------------------------
               Get marker data
               ------------------------- */

            let markerData = {

                sources:
                    [],

                targets:
                    []

            };


            if (

                typeof HeatmapEngine
                    .getMarkerData ===
                "function"

            ) {

                markerData =

                    HeatmapEngine
                        .getMarkerData(

                            MapRenderer
                                .getBothMode()

                        ) ||

                    markerData;

            }


            /* -------------------------
               SOURCE heat
               ------------------------- */

            MapRenderer.layers
                .sourceHeatLayer =

                MapRenderer
                    .createSourceHeatLayer(

                        heatData.sources ||

                        []

                    );


            /* -------------------------
               TARGET heat
               ------------------------- */

            MapRenderer.layers
                .targetHeatLayer =

                MapRenderer
                    .createTargetHeatLayer(

                        heatData.targets ||

                        []

                    );


            /* -------------------------
               Marker groups
               ------------------------- */

            MapRenderer.layers
                .sourceMarkerLayer =

                L.layerGroup();


            MapRenderer.layers
                .targetMarkerLayer =

                L.layerGroup();


            /* -------------------------
               SOURCE markers
               ------------------------- */

            MapRenderer
                .buildSourceMarkers(

                    markerData.sources ||

                    []

                );


            /* -------------------------
               TARGET markers
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


            MapRenderer.visible =
                true;


            MapRenderer.debug(

                "Rendered",

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

                        MapRenderer
                            .getMode()

                }

            );


            MapRenderer
                .dispatchEvent(

                    "offence:map-rendered",

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

                            0

                    }

                );


            return true;

        };


    /* =====================================================
       17. BUILD SOURCE MARKERS
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
                                ?.SOURCE ||

                            MapRenderer.MODE.SOURCE

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
       18. BUILD TARGET MARKERS
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
                                ?.TARGET ||

                            MapRenderer.MODE.TARGET

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
       19. GET HOTSPOT COORDINATES
       ===================================================== */

    MapRenderer.getCoordinates =
        function (

            hotspot

        ) {

            if (

                !hotspot

            ) {

                return null;

            }


            const latitude =

                Number(

                    hotspot.latitude ??

                    hotspot.lat ??

                    hotspot.location
                        ?.latitude ??

                    hotspot.location
                        ?.lat

                );


            const longitude =

                Number(

                    hotspot.longitude ??

                    hotspot.lng ??

                    hotspot.lon ??

                    hotspot.location
                        ?.longitude ??

                    hotspot.location
                        ?.lng ??

                    hotspot.location
                        ?.lon

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


            return {

                latitude:
                    latitude,

                longitude:
                    longitude

            };

        };


    /* =====================================================
       20. NORMALIZE POR KEY

       Fallback normalization only.

       The authoritative porKey should normally already
       come from OffenceNormalizer / Store / Engines.
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


            return String(
                value
            )
                .trim()
                .toUpperCase()
                .replace(
                    /\s+/g,
                    ""
                );

        };


    /* =====================================================
       21. GET REF POR NO
       ===================================================== */

    MapRenderer.getRefPorNo =
        function (

            record

        ) {

            if (

                !record

            ) {

                return "";

            }


            return String(

                record.refPorNo ??

                record.refPORNo ??

                record.refPor ??

                record.porNo ??

                record.PORNo ??

                record["Ref POR No"] ??

                record["POR No"] ??

                ""

            ).trim();

        };


    /* =====================================================
       22. EXTRACT POR KEYS

       A hotspot may represent multiple offence records.
       Therefore it may contain one OR multiple POR keys.
       ===================================================== */

    MapRenderer.extractPorKeys =
        function (

            hotspot

        ) {

            if (

                !hotspot

            ) {

                return [];

            }


            const keys =
                new Set();


            function addKey(

                value

            ) {

                const key =

                    MapRenderer
                        .normalizePorKey(

                            value

                        );


                if (

                    key

                ) {

                    keys.add(
                        key
                    );

                }

            }


            /* -------------------------
               Direct porKey
               ------------------------- */

            addKey(

                hotspot.porKey

            );


            /* -------------------------
               Direct POR number
               ------------------------- */

            addKey(

                MapRenderer
                    .getRefPorNo(

                        hotspot

                    )

            );


            /* -------------------------
               porKeys array
               ------------------------- */

            if (

                Array.isArray(
                    hotspot.porKeys
                )

            ) {

                hotspot.porKeys
                    .forEach(

                        addKey

                    );

            }


            /* -------------------------
               POR number arrays
               ------------------------- */

            const porArrays = [

                hotspot.refPorNos,

                hotspot.porNos,

                hotspot.pors

            ];


            porArrays
                .forEach(

                    function (

                        values

                    ) {

                        if (

                            Array.isArray(
                                values
                            )

                        ) {

                            values
                                .forEach(

                                    addKey

                                );

                        }

                    }

                );


            /* -------------------------
               Nested records
               ------------------------- */

            const recordArrays = [

                hotspot.records,

                hotspot.items,

                hotspot.cases,

                hotspot.accused,

                hotspot.witnesses,

                hotspot.seizures,

                hotspot.articles,

                hotspot.seizedArticles

            ];


            recordArrays
                .forEach(

                    function (

                        records

                    ) {

                        if (

                            !Array.isArray(
                                records
                            )

                        ) {

                            return;

                        }


                        records
                            .forEach(

                                function (

                                    record

                                ) {

                                    if (

                                        !record

                                    ) {

                                        return;

                                    }


                                    addKey(

                                        record.porKey

                                    );


                                    addKey(

                                        MapRenderer
                                            .getRefPorNo(

                                                record

                                            )

                                    );

                                }

                            );

                    }

                );


            return Array.from(
                keys
            );

        };


    /* =====================================================
       23. GET PRIMARY POR KEY
       ===================================================== */

    MapRenderer.getPrimaryPorKey =
        function (

            hotspot

        ) {

            const porKeys =

                MapRenderer
                    .extractPorKeys(

                        hotspot

                    );


            return (

                porKeys[0] ||

                ""

            );

        };


    /* =====================================================
       24. CREATE INTERACTION MARKER
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

                        coordinates.latitude,

                        coordinates.longitude

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

                hotspot.id ||

                hotspot.hotspotId ||

                null;


            marker._offenceHotspotType =
                type;


            marker._offencePorKeys =

                MapRenderer
                    .extractPorKeys(

                        hotspot

                    );


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
       25. HANDLE HOTSPOT CLICK

       IMPORTANT:

       MapRenderer does NOT resolve relationships.

       It only emits:

       hotspot
       hotspotId
       type
       porKey
       porKeys
       coordinates

       CascadeController then resolves:

       POR
        ↓
       Cases
       Accused
       Witnesses
       Seizures
       Seized Articles
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

                return false;

            }


            const porKeys =

                MapRenderer
                    .extractPorKeys(

                        hotspot

                    );


            const primaryPorKey =

                porKeys[0] ||

                "";


            const coordinates =

                MapRenderer
                    .getCoordinates(

                        hotspot

                    );


            const detail = {

                hotspotId:

                    hotspot.id ||

                    hotspot.hotspotId ||

                    null,

                type:
                    type,

                hotspot:
                    hotspot,

                /*
                 * Authoritative relationship connector.
                 */

                porKey:
                    primaryPorKey,

                porKeys:
                    porKeys,

                /*
                 * Raw POR retained for display/debugging.
                 */

                refPorNo:

                    MapRenderer
                        .getRefPorNo(

                            hotspot

                        ),

                /*
                 * Map coordinates.
                 */

                latlng:

                    leafletEvent
                        ?.latlng ||

                    (

                        coordinates

                            ? {

                                lat:

                                    coordinates
                                        .latitude,

                                lng:

                                    coordinates
                                        .longitude

                            }

                            : null

                    ),

                /*
                 * Explicit connector metadata.
                 */

                connector:
                    MapRenderer.CONNECTOR,

                authoritativeConnector:

                    MapRenderer
                        .AUTHORITATIVE_CONNECTOR

            };


            MapRenderer
                .dispatchEvent(

                    Constants.EVENTS
                        ?.HOTSPOT_CLICK ||

                    "offence:hotspot-click",

                    detail

                );


            MapRenderer.debug(

                "Hotspot Click",

                detail

            );


            return detail;

        };


    /* =====================================================
       26. APPLY DISPLAY MODE
       ===================================================== */

    MapRenderer.applyMode =
        function () {

            if (

                !MapRenderer.map

            ) {

                return false;

            }


            const mode =

                MapRenderer
                    .getMode();


            /* -------------------------
               Remove everything first
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


            const SOURCE_MODE =

                HeatmapEngine
                    .MODE
                    ?.SOURCE ||

                MapRenderer.MODE.SOURCE;


            const TARGET_MODE =

                HeatmapEngine
                    .MODE
                    ?.TARGET ||

                MapRenderer.MODE.TARGET;


            /* -------------------------
               SOURCE
               ------------------------- */

            if (

                mode ===
                SOURCE_MODE

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


            /* -------------------------
               TARGET
               ------------------------- */

            else if (

                mode ===
                TARGET_MODE

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


            /* -------------------------
               BOTH
               ------------------------- */

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


            MapRenderer.visible =
                true;


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
       27. ADD LAYER SAFELY
       ===================================================== */

    MapRenderer.addLayer =
        function (

            layer

        ) {

            if (

                !layer ||

                !MapRenderer.map

            ) {

                return false;

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


            return true;

        };


    /* =====================================================
       28. REMOVE LAYER SAFELY
       ===================================================== */

    MapRenderer.removeLayer =
        function (

            layer

        ) {

            if (

                !layer ||

                !MapRenderer.map

            ) {

                return false;

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


            return true;

        };


    /* =====================================================
       29. CLEAR LAYERS
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


            return true;

        };


    /* =====================================================
       30. REFRESH
       ===================================================== */

    MapRenderer.refresh =
        async function () {

            if (

                typeof HeatmapEngine
                    .refresh !==
                "function"

            ) {

                return {

                    success:
                        false,

                    reason:
                        "HEATMAP_REFRESH_UNAVAILABLE"

                };

            }


            try {

                const result =

                    await HeatmapEngine
                        .refresh();


                /*
                 * HeatmapEngine normally emits
                 * offence:heatmap-updated.
                 *
                 * That event triggers render().
                 */


                return result;

            }

            catch (

                error

            ) {

                console.error(

                    "[OffenceMapRenderer] Refresh failed.",

                    error

                );


                return {

                    success:
                        false,

                    error:
                        error

                };

            }

        };


    /* =====================================================
       31. SHOW SOURCE
       ===================================================== */

    MapRenderer.showSource =
        function () {

            if (

                typeof HeatmapEngine
                    .setMode ===
                "function"

            ) {

                HeatmapEngine
                    .setMode(

                        HeatmapEngine
                            .MODE
                            ?.SOURCE ||

                        MapRenderer.MODE.SOURCE

                    );

            }


            MapRenderer.visible =
                true;


            return true;

        };


    /* =====================================================
       32. SHOW TARGET
       ===================================================== */

    MapRenderer.showTarget =
        function () {

            if (

                typeof HeatmapEngine
                    .setMode ===
                "function"

            ) {

                HeatmapEngine
                    .setMode(

                        HeatmapEngine
                            .MODE
                            ?.TARGET ||

                        MapRenderer.MODE.TARGET

                    );

            }


            MapRenderer.visible =
                true;


            return true;

        };


    /* =====================================================
       33. SHOW BOTH
       ===================================================== */

    MapRenderer.showBoth =
        function () {

            if (

                typeof HeatmapEngine
                    .setMode ===
                "function"

            ) {

                HeatmapEngine
                    .setMode(

                        HeatmapEngine
                            .MODE
                            ?.BOTH ||

                        MapRenderer.MODE.BOTH

                    );

            }


            MapRenderer.visible =
                true;


            return true;

        };


    /* =====================================================
       34. HIDE
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


            MapRenderer.visible =
                false;


            return true;

        };


    /* =====================================================
       35. SHOW
       ===================================================== */

    MapRenderer.show =
        function () {

            if (

                !MapRenderer.rendered

            ) {

                return MapRenderer
                    .render();

            }


            MapRenderer.visible =
                true;


            return MapRenderer
                .applyMode();

        };


    /* =====================================================
       36. TOGGLE
       ===================================================== */

    MapRenderer.toggle =
        function (

            force = null

        ) {

            if (

                force ===
                true

            ) {

                MapRenderer.show();

                return true;

            }


            if (

                force ===
                false

            ) {

                MapRenderer.hide();

                return false;

            }


            if (

                MapRenderer.visible

            ) {

                MapRenderer.hide();

                return false;

            }


            MapRenderer.show();

            return true;

        };


    /* =====================================================
       37. FIT MAP TO HOTSPOTS
       ===================================================== */

    MapRenderer.fitBounds =
        function () {

            if (

                !MapRenderer.map

            ) {

                return false;

            }


            if (

                typeof HeatmapEngine
                    .getMarkerData !==
                "function"

            ) {

                return false;

            }


            const markerData =

                HeatmapEngine
                    .getMarkerData(

                        MapRenderer
                            .getBothMode()

                    ) ||

                {

                    sources:
                        [],

                    targets:
                        []

                };


            const points =
                [];


            const hotspots =

                []

                    .concat(

                        markerData.sources ||

                        []

                    )

                    .concat(

                        markerData.targets ||

                        []

                    );


            for (

                const hotspot

                of hotspots

            ) {

                const coordinates =

                    MapRenderer
                        .getCoordinates(

                            hotspot

                        );


                if (

                    coordinates

                ) {

                    points.push(

                        [

                            coordinates.latitude,

                            coordinates.longitude

                        ]

                    );

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

                MapRenderer.map
                    .setView(

                        points[0],

                        14

                    );


                return true;

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

                            ],

                        maxZoom:
                            15

                    }

                );


            return true;

        };


    /* =====================================================
       38. GET LAYER STATUS
       ===================================================== */

    MapRenderer.getLayerStatus =
        function () {

            const map =

                MapRenderer.map;


            return {

                version:

                    MapRenderer.VERSION,

                connector:

                    MapRenderer.CONNECTOR,

                authoritativeConnector:

                    MapRenderer
                        .AUTHORITATIVE_CONNECTOR,

                initialized:

                    MapRenderer.initialized,

                rendered:

                    MapRenderer.rendered,

                visible:

                    MapRenderer.visible,

                mode:

                    MapRenderer
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
       39. DISPATCH EVENT
       ===================================================== */

    MapRenderer.dispatchEvent =
        function (

            eventName,

            detail = {}

        ) {

            if (

                !eventName

            ) {

                return false;

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


                return true;

            }

            catch (

                error

            ) {

                console.warn(

                    "[OffenceMapRenderer] Event dispatch failed.",

                    eventName,

                    error

                );


                return false;

            }

        };


    /* =====================================================
       40. DESTROY
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


            MapRenderer.visible =
                false;


            return true;

        };


    /* =====================================================
       41. EXPORT
       ===================================================== */

    GG.Offence.MapRenderer =
        MapRenderer;


    /* =====================================================
       42. READY LOG
       ===================================================== */

    console.log(

        "🔥 OffenceMapRenderer Loaded",

        {

            version:

                MapRenderer.VERSION,

            connector:

                MapRenderer.CONNECTOR,

            authoritativeConnector:

                MapRenderer
                    .AUTHORITATIVE_CONNECTOR,

            module:

                MapRenderer

        }

    );


})();
