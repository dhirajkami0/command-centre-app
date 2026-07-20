/* =========================================================
   GreenGuard
   Offence Intelligence Module

   File:
   js/offence/offenceMapRenderer.js

   Version:
   3.0.0

   Purpose:
   - Render SOURCE offence point heatmap
   - Render TARGET offence point heatmap
   - Render SOURCE compartment/range polygons
   - Render TARGET compartment/range polygons
   - Support POINT → COMPARTMENT → RANGE spatial hierarchy
   - Render SOURCE + TARGET simultaneously
   - Create clickable point hotspot interaction markers
   - Create clickable GIS polygon interaction layers
   - Support SOURCE / TARGET / BOTH modes
   - Handle heatmap refresh
   - Emit POR-authoritative hotspot click events
   - Keep Leaflet rendering separate from data engines

   AUTHORITATIVE RELATIONSHIP CONNECTOR:

   POR / Ref POR No

   normalized internally as:

   porKey


   SPATIAL RESOLUTION MODEL:

   1. POINT
      Exact latitude / longitude available.

   2. COMPARTMENT
      No valid point available but offence location
      resolves to a known compartment GeoJSON feature.

   3. RANGE
      No valid point or compartment available but
      offence record resolves to a known range GeoJSON
      feature.

   4. UNMAPPED
      No point, compartment, or range can be resolved.


   GIS SOURCE:

   GreenGuardAI.GISEntities
   window.allGISFeatures
   window.allCompartmentFeatures


   ARCHITECTURE:

   OffenceStore
        ↓
   OffenceSourceEngine
   OffenceTargetEngine
        ↓
   OffenceHeatmapEngine v3
        ↓
   Spatial Resolution
        │
        ├── POINT
        │      ↓
        │   Leaflet.heat
        │
        ├── COMPARTMENT
        │      ↓
        │   GeoJSON Polygon
        │
        └── RANGE
               ↓
            GeoJSON Polygon
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

   - POR / porKey is authoritative.
   - CaseID is NOT the authoritative
     cross-collection connector.
   - SeizureID is NOT the authoritative
     cross-collection connector.
   - CaseID and SeizureID remain record identifiers.
   - GIS names are NOT relationship connectors.
   - Compartments and ranges are spatial render targets.
   - This renderer DOES NOT resolve offence relationships.
   - This renderer DOES NOT build cascade HTML.
   - This renderer DOES NOT decide POINT vs COMPARTMENT
     vs RANGE.
   - Spatial resolution belongs to OffenceHeatmapEngine.
   - This renderer consumes canonical HeatmapEngine output.

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


    if (
        !Constants
    ) {

        console.error(

            "[OffenceMapRenderer] " +
            "OffenceConstants unavailable."

        );

        return;

    }


    if (
        !HeatmapEngine
    ) {

        console.error(

            "[OffenceMapRenderer] " +
            "OffenceHeatmapEngine unavailable."

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
        "3.0.0";


    MapRenderer.CONNECTOR =
        "POR";


    MapRenderer.AUTHORITATIVE_CONNECTOR =
        "porKey";


    MapRenderer.SPATIAL_MODEL =
        "POINT_COMPARTMENT_RANGE";


    MapRenderer.initialized =
        false;


    MapRenderer.rendered =
        false;


    MapRenderer.visible =
        false;


    MapRenderer.rendering =
        false;


    MapRenderer.lastRenderAt =
        null;


    MapRenderer._eventsBound =
        false;


    MapRenderer._eventHandlers =
        {};


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
       7. SPATIAL RESOLUTION TYPES
       ===================================================== */

    MapRenderer.RESOLUTION = {

        POINT:
            "POINT",

        COMPARTMENT:
            "COMPARTMENT",

        RANGE:
            "RANGE",

        UNMAPPED:
            "UNMAPPED"

    };


    /* =====================================================
       8. LAYERS

       IMPORTANT:

       Point heat layers:
       - sourceHeatLayer
       - targetHeatLayer

       Invisible point interaction markers:
       - sourceMarkerLayer
       - targetMarkerLayer

       GIS polygon layers:
       - sourcePolygonLayer
       - targetPolygonLayer

       Polygon layers contain both:
       - COMPARTMENT polygons
       - RANGE polygons

       HeatmapEngine determines the spatial resolution.
       Renderer only draws the supplied data.
       ===================================================== */

    MapRenderer.layers = {

        sourceHeatLayer:
            null,

        targetHeatLayer:
            null,

        sourceMarkerLayer:
            null,

        targetMarkerLayer:
            null,

        sourcePolygonLayer:
            null,

        targetPolygonLayer:
            null

    };


    /* =====================================================
       9. CONFIGURATION
       ===================================================== */

    MapRenderer.config = {

        /* -------------------------------------------------
           SOURCE POINT HEATMAP
           ------------------------------------------------- */

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


        /* -------------------------------------------------
           TARGET POINT HEATMAP
           ------------------------------------------------- */

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


        /* -------------------------------------------------
           INVISIBLE INTERACTION MARKERS

           Used only for point-based hotspot clicks.
           ------------------------------------------------- */

        marker: {

            radius:
                20,

            opacity:
                0,

            fillOpacity:
                0.01

        },


        /* -------------------------------------------------
           SOURCE GIS POLYGONS

           Used for compartment/range fallback rendering.
           ------------------------------------------------- */

        sourcePolygon: {

            weight:
                2,

            opacity:
                0.85,

            fillOpacity:
                0.35,

            color:
                "#2b83ba",

            fillColor:
                "#00ccbc"

        },


        /* -------------------------------------------------
           TARGET GIS POLYGONS
           ------------------------------------------------- */

        targetPolygon: {

            weight:
                2,

            opacity:
                0.90,

            fillOpacity:
                0.40,

            color:
                "#bd0026",

            fillColor:
                "#fd8d3c"

        },


        /* -------------------------------------------------
           POLYGON HEAT INTENSITY

           Polygon fill opacity is dynamically scaled
           using aggregated heatWeight/offenceCount.

           These are safety bounds.
           ------------------------------------------------- */

        polygonHeat: {

    minFillOpacity:
        0.65,

    maxFillOpacity:
        0.95,

    minWeight:
        2,

    maxWeight:
        5,

    targetGradient: {

        0.20:
            "#FFD600",  // Strong Yellow

        0.40:
            "#FF9800",  // Vivid Orange

        0.60:
            "#FF3D00",  // Orange Red

        0.80:
            "#E60000",  // Strong Red

        1.00:
            "#7A0000"   // Deep Dark Red

    }

}

    };


    /* =====================================================
       10. DEBUG
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
       11. INITIALIZE
       ===================================================== */

    MapRenderer.init =
        function (

            leafletMap = null

        ) {

            /*
             * Already initialized with a valid map.
             */

            if (

                MapRenderer.initialized &&

                MapRenderer.map

            ) {

                return MapRenderer;

            }


            /* -------------------------------------------------
               Validate Leaflet
               ------------------------------------------------- */

            if (

                typeof window.L ===
                "undefined"

            ) {

                console.error(

                    "[OffenceMapRenderer] " +
                    "Leaflet unavailable."

                );

                return null;

            }


            /* -------------------------------------------------
               Resolve Leaflet map
               ------------------------------------------------- */

            MapRenderer.map =

                leafletMap ||

                window.map ||

                null;


            if (

                !MapRenderer.map

            ) {

                console.error(

                    "[OffenceMapRenderer] " +
                    "Leaflet map unavailable."

                );

                return null;

            }


            /* -------------------------------------------------
               Leaflet.heat

               Point heatmap rendering requires
               L.heatLayer.

               IMPORTANT:

               Polygon rendering does NOT require
               Leaflet.heat.

               Therefore failure of Leaflet.heat should
               not completely disable the renderer.
               ------------------------------------------------- */

            if (

                typeof L.heatLayer !==
                "function"

            ) {

                console.warn(

                    "[OffenceMapRenderer] " +
                    "Leaflet.heat unavailable. " +
                    "Point heat layers will be skipped. " +
                    "GIS polygon layers remain available."

                );

            }


            /* -------------------------------------------------
               Create canonical layer groups
               ------------------------------------------------- */

            MapRenderer.layers
                .sourceMarkerLayer =

                L.layerGroup();


            MapRenderer.layers
                .targetMarkerLayer =

                L.layerGroup();


            MapRenderer.layers
                .sourcePolygonLayer =

                L.layerGroup();


            MapRenderer.layers
                .targetPolygonLayer =

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

                        MapRenderer
                            .AUTHORITATIVE_CONNECTOR,

                    spatialModel:

                        MapRenderer
                            .SPATIAL_MODEL,

                    leafletHeat:

                        typeof L.heatLayer ===
                        "function"

                }

            );


            return MapRenderer;

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


            /* -------------------------------------------------
               HEATMAP UPDATED
               ------------------------------------------------- */

            MapRenderer._eventHandlers
                .heatmapUpdated =

                function () {

                    if (

                        MapRenderer.initialized

                    ) {

                        MapRenderer
                            .render();

                    }

                };


            window.addEventListener(

                Constants.EVENTS
                    ?.HEATMAP_UPDATED ||

                "offence:heatmap-updated",

                MapRenderer
                    ._eventHandlers
                    .heatmapUpdated

            );


            /* -------------------------------------------------
               MODE CHANGED
               ------------------------------------------------- */

            MapRenderer._eventHandlers
                .modeChanged =

                function () {

                    if (

                        MapRenderer.initialized

                    ) {

                        MapRenderer
                            .applyMode();

                    }

                };


            window.addEventListener(

                "offence:heatmap-mode-changed",

                MapRenderer
                    ._eventHandlers
                    .modeChanged

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

                return true;

            }


            if (

                MapRenderer
                    ._eventHandlers
                    .heatmapUpdated

            ) {

                window.removeEventListener(

                    Constants.EVENTS
                        ?.HEATMAP_UPDATED ||

                    "offence:heatmap-updated",

                    MapRenderer
                        ._eventHandlers
                        .heatmapUpdated

                );

            }


            if (

                MapRenderer
                    ._eventHandlers
                    .modeChanged

            ) {

                window.removeEventListener(

                    "offence:heatmap-mode-changed",

                    MapRenderer
                        ._eventHandlers
                        .modeChanged

                );

            }


            MapRenderer._eventHandlers =
                {};


            MapRenderer._eventsBound =
                false;


            return true;

        };


    /* =====================================================
       14. NORMALIZE ARRAY

       HeatmapEngine v3 methods should return arrays.

       This helper protects the renderer from:
       - null
       - undefined
       - Set
       - Map
       - iterable values
       ===================================================== */

    MapRenderer.toArray =
        function (

            value

        ) {

            if (

                Array.isArray(
                    value
                )

            ) {

                return value;

            }


            if (

                value instanceof Set

            ) {

                return Array.from(
                    value
                );

            }


            if (

                value instanceof Map

            ) {

                return Array.from(

                    value.values()

                );

            }


            if (

                value &&

                typeof value[
                    Symbol.iterator
                ] ===
                "function" &&

                typeof value !==
                "string"

            ) {

                try {

                    return Array.from(
                        value
                    );

                }

                catch (
                    error
                ) {

                    return [];

                }

            }


            return [];

        };


    /* =====================================================
       15. VALID NUMBER
       ===================================================== */

    MapRenderer.toFiniteNumber =
        function (

            value,

            fallback = null

        ) {

            if (

                value ===
                null ||

                value ===
                undefined ||

                value ===
                ""

            ) {

                return fallback;

            }


            const number =

                Number(
                    value
                );


            return Number.isFinite(
                number
            )

                ? number

                : fallback;

        };


    /* =====================================================
       16. GET HOTSPOT COORDINATES

       IMPORTANT FIX:

       The previous implementation returned:

       {
           latitude,
           longitude
       }

       while some test code expected:

       {
           lat,
           lng
       }

       v3 returns BOTH aliases:

       {
           latitude,
           longitude,
           lat,
           lng
       }

       Also:

       latitude = 0
       longitude = 0

       is treated as unresolved for offence mapping.

       This prevents unresolved geocoder placeholders
       from being rendered at 0,0.
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

                MapRenderer
                    .toFiniteNumber(

                        hotspot.latitude ??

                        hotspot.lat ??

                        hotspot.coordinates
                            ?.latitude ??

                        hotspot.coordinates
                            ?.lat ??

                        hotspot.location
                            ?.latitude ??

                        hotspot.location
                            ?.lat,

                        null

                    );


            const longitude =

                MapRenderer
                    .toFiniteNumber(

                        hotspot.longitude ??

                        hotspot.lng ??

                        hotspot.lon ??

                        hotspot.coordinates
                            ?.longitude ??

                        hotspot.coordinates
                            ?.lng ??

                        hotspot.coordinates
                            ?.lon ??

                        hotspot.location
                            ?.longitude ??

                        hotspot.location
                            ?.lng ??

                        hotspot.location
                            ?.lon,

                        null

                    );


            if (

                latitude ===
                null ||

                longitude ===
                null

            ) {

                return null;

            }


            /*
             * Reject geocoder placeholder:
             *
             * 0,0
             */

            if (

                latitude ===
                0 &&

                longitude ===
                0

            ) {

                return null;

            }


            /*
             * Geographic coordinate validation.
             */

            if (

                latitude <
                -90 ||

                latitude >
                90 ||

                longitude <
                -180 ||

                longitude >
                180

            ) {

                return null;

            }


            return {

                latitude:
                    latitude,

                longitude:
                    longitude,

                lat:
                    latitude,

                lng:
                    longitude

            };

        };


    /* =====================================================
       17. NORMALIZE SPATIAL RESOLUTION
       ===================================================== */

    MapRenderer.normalizeResolution =
        function (

            value

        ) {

            const normalized =

                String(

                    value ||

                    ""

                )

                    .trim()

                    .toUpperCase();


            if (

                normalized ===
                MapRenderer.RESOLUTION.POINT

            ) {

                return MapRenderer
                    .RESOLUTION
                    .POINT;

            }


            if (

                normalized ===
                MapRenderer.RESOLUTION.COMPARTMENT

            ) {

                return MapRenderer
                    .RESOLUTION
                    .COMPARTMENT;

            }


            if (

                normalized ===
                MapRenderer.RESOLUTION.RANGE

            ) {

                return MapRenderer
                    .RESOLUTION
                    .RANGE;

            }


            return MapRenderer
                .RESOLUTION
                .UNMAPPED;

        };


    /* =====================================================
       18. GET MODE
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
                    .mode ||

                HeatmapEngine
                    .MODE
                    ?.BOTH ||

                MapRenderer
                    .MODE
                    .BOTH

            );

        };


    /* =====================================================
       19. GET BOTH MODE
       ===================================================== */

    MapRenderer.getBothMode =
        function () {

            return (

                HeatmapEngine
                    .MODE
                    ?.BOTH ||

                MapRenderer
                    .MODE
                    .BOTH

            );

        };


    /* =====================================================
       20. GET CANONICAL HEATMAP DATA

       OffenceHeatmapEngine v3 is authoritative.

       Expected canonical output can contain:

       {
           mode,

           sources,
           targets,

           sourceHeat,
           targetHeat,

           sourcePoints,
           targetPoints,

           sourcePolygons,
           targetPolygons,

           sourceCompartments,
           targetCompartments,

           sourceRanges,
           targetRanges,

           links
       }

       The renderer does NOT spatially resolve hotspots.
       It only normalizes the returned contract.
       ===================================================== */

    MapRenderer.getCanonicalData =
        function () {

            let data =
                null;


            /*
             * Primary v3 API.
             */

            if (

                typeof HeatmapEngine
                    .getHeatmapData ===
                "function"

            ) {

                try {

                    data =

                        HeatmapEngine
                            .getHeatmapData(

                                MapRenderer
                                    .getBothMode()

                            );

                }

                catch (
                    error
                ) {

                    console.error(

                        "[OffenceMapRenderer] " +
                        "getHeatmapData() failed.",

                        error

                    );

                }

            }


            /*
             * Spatial API fallback.
             */

            if (

                !data &&

                typeof HeatmapEngine
                    .getSpatialHeatmapData ===
                "function"

            ) {

                try {

                    data =

                        HeatmapEngine
                            .getSpatialHeatmapData(

                                MapRenderer
                                    .getBothMode()

                            );

                }

                catch (
                    error
                ) {

                    console.error(

                        "[OffenceMapRenderer] " +
                        "getSpatialHeatmapData() failed.",

                        error

                    );

                }

            }


            data =
                data ||
                {};


            /*
             * Canonical raw hotspots.
             */

            const sources =

                MapRenderer
                    .toArray(

                        data.sources ??

                        (

                            typeof HeatmapEngine
                                .getSourceHotspots ===
                            "function"

                                ? HeatmapEngine
                                    .getSourceHotspots()

                                : []

                        )

                    );


            const targets =

                MapRenderer
                    .toArray(

                        data.targets ??

                        (

                            typeof HeatmapEngine
                                .getTargetHotspots ===
                            "function"

                                ? HeatmapEngine
                                    .getTargetHotspots()

                                : []

                        )

                    );


            /*
             * Canonical POINT-resolved records.
             */

            const sourcePoints =

                MapRenderer
                    .toArray(

                        data.sourcePoints ??

                        data.points
                            ?.sources ??

                        data.spatial
                            ?.sourcePoints ??

                        []

                    );


            const targetPoints =

                MapRenderer
                    .toArray(

                        data.targetPoints ??

                        data.points
                            ?.targets ??

                        data.spatial
                            ?.targetPoints ??

                        []

                    );


            /*
             * Canonical COMPARTMENT records.
             */

            const sourceCompartments =

                MapRenderer
                    .toArray(

                        data.sourceCompartments ??

                        data.compartments
                            ?.sources ??

                        data.spatial
                            ?.sourceCompartments ??

                        []

                    );


            const targetCompartments =

                MapRenderer
                    .toArray(

                        data.targetCompartments ??

                        data.compartments
                            ?.targets ??

                        data.spatial
                            ?.targetCompartments ??

                        []

                    );


            /*
             * Canonical RANGE fallback records.
             */

            const sourceRanges =

                MapRenderer
                    .toArray(

                        data.sourceRanges ??

                        data.ranges
                            ?.sources ??

                        data.spatial
                            ?.sourceRanges ??

                        []

                    );


            const targetRanges =

                MapRenderer
                    .toArray(

                        data.targetRanges ??

                        data.ranges
                            ?.targets ??

                        data.spatial
                            ?.targetRanges ??

                        []

                    );


            /*
             * Canonical aggregated polygon records.
             *
             * Prefer aggregated polygons generated by
             * HeatmapEngine because multiple offences may
             * resolve to the same compartment/range.
             */

            const sourcePolygons =

                MapRenderer
                    .toArray(

                        data.sourcePolygons ??

                        data.polygons
                            ?.sources ??

                        data.spatial
                            ?.sourcePolygons ??

                        []

                    );


            const targetPolygons =

                MapRenderer
                    .toArray(

                        data.targetPolygons ??

                        data.polygons
                            ?.targets ??

                        data.spatial
                            ?.targetPolygons ??

                        []

                    );


            /*
             * Point heat arrays.
             *
             * These may already be Leaflet.heat arrays:
             *
             * [lat, lng, intensity]
             *
             * or may contain point objects.
             *
             * Conversion is handled later.
             */

            const sourceHeat =

                MapRenderer
                    .toArray(

                        data.sourceHeat ??

                        data.heat
                            ?.sources ??

                        []

                    );


            const targetHeat =

                MapRenderer
                    .toArray(

                        data.targetHeat ??

                        data.heat
                            ?.targets ??

                        []

                    );


            return {

                mode:

                    data.mode ||

                    MapRenderer
                        .getMode(),

                sources:
                    sources,

                targets:
                    targets,

                sourceHeat:
                    sourceHeat,

                targetHeat:
                    targetHeat,

                sourcePoints:
                    sourcePoints,

                targetPoints:
                    targetPoints,

                sourceCompartments:
                    sourceCompartments,

                targetCompartments:
                    targetCompartments,

                sourceRanges:
                    sourceRanges,

                targetRanges:
                    targetRanges,

                sourcePolygons:
                    sourcePolygons,

                targetPolygons:
                    targetPolygons,

                links:

                    MapRenderer
                        .toArray(

                            data.links ??

                            (

                                typeof HeatmapEngine
                                    .getLinks ===
                                "function"

                                    ? HeatmapEngine
                                        .getLinks()

                                    : []

                            )

                        ),

                raw:
                    data

            };

        };


    /* =====================================================
       END OF PART 1

       NEXT PART:

       21. Heat intensity normalization
       22. Convert point → Leaflet.heat format
       23. Build canonical source heat data
       24. Build canonical target heat data
       25. Create source heat layer
       26. Create target heat layer
       27. GeoJSON feature extraction
       28. Polygon feature validation
       29. Polygon heat styling
       30. Source polygon styling
       31. Target polygon styling

       DO NOT close the IIFE here.
       Part 2 continues directly below.
       ===================================================== */

     /* =====================================================
       21. NORMALIZE HEAT INTENSITY
       ===================================================== */

    MapRenderer.normalizeHeatIntensity =
        function (

            value,

            fallback = 1

        ) {

            const number =

                MapRenderer
                    .toFiniteNumber(

                        value,

                        fallback

                    );


            if (

                number ===
                null

            ) {

                return fallback;

            }


            /*
             * Leaflet.heat accepts arbitrary positive
             * intensity values.
             *
             * We only prevent negative / invalid values.
             */

            return Math.max(

                0,

                number

            );

        };


    /* =====================================================
       22. GET HOTSPOT HEAT WEIGHT
       ===================================================== */

    MapRenderer.getHeatWeight =
        function (

            item,

            fallback = 1

        ) {

            if (

                !item

            ) {

                return fallback;

            }


            return MapRenderer
                .normalizeHeatIntensity(

                    item.heatWeight ??

                    item.weight ??

                    item.intensity ??

                    item.offenceCount ??

                    item.count ??

                    fallback,

                    fallback

                );

        };


    /* =====================================================
       23. CONVERT POINT TO LEAFLET.HEAT FORMAT

       Supported inputs:

       [lat, lng]
       [lat, lng, intensity]

       or canonical hotspot / point object.

       Output:

       [lat, lng, intensity]

       Invalid coordinates return null.
       ===================================================== */

    MapRenderer.toHeatPoint =
        function (

            item

        ) {

            if (

                !item

            ) {

                return null;

            }


            /* -------------------------------------------------
               Existing Leaflet.heat array
               ------------------------------------------------- */

            if (

                Array.isArray(
                    item
                )

            ) {

                const latitude =

                    MapRenderer
                        .toFiniteNumber(

                            item[0],

                            null

                        );


                const longitude =

                    MapRenderer
                        .toFiniteNumber(

                            item[1],

                            null

                        );


                const intensity =

                    MapRenderer
                        .normalizeHeatIntensity(

                            item[2] ??

                            1,

                            1

                        );


                if (

                    latitude ===
                    null ||

                    longitude ===
                    null

                ) {

                    return null;

                }


                if (

                    latitude ===
                    0 &&

                    longitude ===
                    0

                ) {

                    return null;

                }


                if (

                    latitude <
                    -90 ||

                    latitude >
                    90 ||

                    longitude <
                    -180 ||

                    longitude >
                    180

                ) {

                    return null;

                }


                return [

                    latitude,

                    longitude,

                    intensity

                ];

            }


            /* -------------------------------------------------
               Canonical point / hotspot object
               ------------------------------------------------- */

            const coordinates =

                MapRenderer
                    .getCoordinates(
                        item
                    );


            if (

                !coordinates

            ) {

                return null;

            }


            return [

                coordinates.latitude,

                coordinates.longitude,

                MapRenderer
                    .getHeatWeight(

                        item,

                        1

                    )

            ];

        };


    /* =====================================================
       24. BUILD POINT HEAT DATA

       Priority:

       1. Explicit HeatmapEngine sourceHeat / targetHeat
       2. Explicit spatial sourcePoints / targetPoints

       IMPORTANT:

       Raw source/target hotspots are NOT used as a
       fallback here.

       Why:

       HeatmapEngine v3 already decided whether each
       hotspot resolves as:

       POINT
       COMPARTMENT
       RANGE
       UNMAPPED

       A RANGE-resolved hotspot may still contain
       latitude: 0 / longitude: 0 placeholders.

       Renderer must not override HeatmapEngine's
       spatial resolution decision.
       ===================================================== */

    MapRenderer.buildPointHeatData =
        function (

            heatData,

            pointData

        ) {

            const explicitHeat =

                MapRenderer
                    .toArray(
                        heatData
                    );


            const explicitPoints =

                MapRenderer
                    .toArray(
                        pointData
                    );


            const input =

                explicitHeat.length

                    ? explicitHeat

                    : explicitPoints;


            const output =
                [];


            for (

                const item
                of input

            ) {

                const point =

                    MapRenderer
                        .toHeatPoint(
                            item
                        );


                if (

                    point

                ) {

                    output.push(
                        point
                    );

                }

            }


            return output;

        };


    /* =====================================================
       25. GET SOURCE POINT HEAT DATA
       ===================================================== */

    MapRenderer.getSourceHeatData =
        function (

            canonicalData = null

        ) {

            const data =

                canonicalData ||

                MapRenderer
                    .getCanonicalData();


            return MapRenderer
                .buildPointHeatData(

                    data.sourceHeat,

                    data.sourcePoints

                );

        };


    /* =====================================================
       26. GET TARGET POINT HEAT DATA
       ===================================================== */

    MapRenderer.getTargetHeatData =
        function (

            canonicalData = null

        ) {

            const data =

                canonicalData ||

                MapRenderer
                    .getCanonicalData();


            return MapRenderer
                .buildPointHeatData(

                    data.targetHeat,

                    data.targetPoints

                );

        };


    /* =====================================================
       27. CREATE SOURCE HEAT LAYER
       ===================================================== */

    MapRenderer.createSourceHeatLayer =
        function (

            heatData = []

        ) {

            /*
             * Remove old source heat layer first.
             */

            if (

                MapRenderer.layers
                    .sourceHeatLayer

            ) {

                MapRenderer
                    .removeLayer(

                        MapRenderer.layers
                            .sourceHeatLayer

                    );


                MapRenderer.layers
                    .sourceHeatLayer =
                    null;

            }


            /*
             * Leaflet.heat unavailable.
             *
             * Polygon rendering can still continue.
             */

            if (

                typeof window.L ===
                    "undefined" ||

                typeof L.heatLayer !==
                    "function"

            ) {

                return null;

            }


            const points =

                MapRenderer
                    .toArray(
                        heatData
                    )

                    .map(

                        item =>

                            MapRenderer
                                .toHeatPoint(
                                    item
                                )

                    )

                    .filter(
                        Boolean
                    );


            if (

                !points.length

            ) {

                return null;

            }


            MapRenderer.layers
                .sourceHeatLayer =

                L.heatLayer(

                    points,

                    {

                        radius:

                            MapRenderer
                                .config
                                .source
                                .radius,

                        blur:

                            MapRenderer
                                .config
                                .source
                                .blur,

                        maxZoom:

                            MapRenderer
                                .config
                                .source
                                .maxZoom,

                        minOpacity:

                            MapRenderer
                                .config
                                .source
                                .minOpacity,

                        gradient:

                            MapRenderer
                                .config
                                .source
                                .gradient

                    }

                );


            return MapRenderer.layers
                .sourceHeatLayer;

        };


    /* =====================================================
       28. CREATE TARGET HEAT LAYER
       ===================================================== */

    MapRenderer.createTargetHeatLayer =
        function (

            heatData = []

        ) {

            /*
             * Remove old target heat layer first.
             */

            if (

                MapRenderer.layers
                    .targetHeatLayer

            ) {

                MapRenderer
                    .removeLayer(

                        MapRenderer.layers
                            .targetHeatLayer

                    );


                MapRenderer.layers
                    .targetHeatLayer =
                    null;

            }


            if (

                typeof window.L ===
                    "undefined" ||

                typeof L.heatLayer !==
                    "function"

            ) {

                return null;

            }


            const points =

                MapRenderer
                    .toArray(
                        heatData
                    )

                    .map(

                        item =>

                            MapRenderer
                                .toHeatPoint(
                                    item
                                )

                    )

                    .filter(
                        Boolean
                    );


            if (

                !points.length

            ) {

                return null;

            }


            MapRenderer.layers
                .targetHeatLayer =

                L.heatLayer(

                    points,

                    {

                        radius:

                            MapRenderer
                                .config
                                .target
                                .radius,

                        blur:

                            MapRenderer
                                .config
                                .target
                                .blur,

                        maxZoom:

                            MapRenderer
                                .config
                                .target
                                .maxZoom,

                        minOpacity:

                            MapRenderer
                                .config
                                .target
                                .minOpacity,

                        gradient:

                            MapRenderer
                                .config
                                .target
                                .gradient

                    }

                );


            return MapRenderer.layers
                .targetHeatLayer;

        };


    /* =====================================================
       29. GET GEOJSON FEATURE FROM POLYGON ENTRY

       HeatmapEngine v3 aggregated polygon entries may
       expose their GeoJSON through different canonical
       wrappers depending on resolution stage.

       Supported:

       entry.feature
       entry.geoJSON
       entry.geojson
       entry.geometryFeature
       entry.gisFeature
       entry.spatialFeature

       or the entry itself may already be:

       {
           type: "Feature",
           geometry: ...
       }
       ===================================================== */

    /* =====================================================
       GET POLYGON FEATURE

       Resolves the actual GeoJSON Feature associated with
       an aggregated HeatmapEngine spatial polygon.

       Resolution order:

       1. Polygon object is already a GeoJSON Feature
       2. Embedded feature / GIS feature
       3. Embedded GeoJSON
       4. HeatmapEngine spatial entry feature
       5. GreenGuard GISEntities lookup

       This keeps MapRenderer aligned with:

       HeatmapEngine v3
           ↓
       POINT / COMPARTMENT / RANGE
           ↓
       GISEntities
           ↓
       Actual GeoJSON Feature
       ===================================================== */

/*=========================================================
  Resolve Polygon GeoJSON

  Supports:

  1. Embedded GeoJSON
  2. Compartment resolution through GISEntities
  3. Range resolution through GISEntities

  Return contract:

      GeoJSON Feature
          OR
      GeoJSON FeatureCollection
          OR
      null
=========================================================*/

MapRenderer.getPolygonFeature =
    function (

        polygon

    ) {

        if (

            !polygon

        ) {

            return null;

        }


        /*
         * ------------------------------------------------
         * 1. DIRECT GEOJSON FEATURE
         * ------------------------------------------------
         */

        if (

            polygon.type ===
                "Feature" &&

            polygon.geometry

        ) {

            return polygon;

        }


        /*
         * ------------------------------------------------
         * 2. DIRECT GEOJSON FEATURE COLLECTION
         * ------------------------------------------------
         */

        if (

            polygon.type ===
                "FeatureCollection" &&

            Array.isArray(
                polygon.features
            )

        ) {

            return polygon;

        }


        /*
         * ------------------------------------------------
         * 3. EMBEDDED FEATURE
         * ------------------------------------------------
         */

        const embeddedCandidates = [

            polygon.feature,

            polygon.geoJSON,

            polygon.geojson,

            polygon.gisFeature

        ];


        for (

            const candidate
            of embeddedCandidates

        ) {

            if (

                candidate &&

                (

                    (
                        candidate.type ===
                            "Feature" &&

                        candidate.geometry
                    )

                    ||

                    (
                        candidate.type ===
                            "FeatureCollection" &&

                        Array.isArray(
                            candidate.features
                        )
                    )

                )

            ) {

                return candidate;

            }

        }


        /*
         * ------------------------------------------------
         * 4. GIS ENTITIES
         * ------------------------------------------------
         */

        const GIS =

            GG.GISEntities;


        if (

            !GIS

        ) {

            return null;

        }


        /*
         * Determine spatial type.
         */

        const spatialType =

            String(

                polygon.spatialType ||

                polygon.resolutionType ||

                polygon.resolution ||

                polygon.type ||

                ""

            )

                .trim()

                .toUpperCase();


        /*
         * ------------------------------------------------
         * 5. COMPARTMENT
         * ------------------------------------------------
         *
         * Priority:
         *
         * explicit compartment
         * compartmentName
         * name
         *
         * Only execute when polygon is actually a
         * compartment-level spatial entry.
         */

        if (

            spatialType ===
                "COMPARTMENT"

        ) {

            const compartmentName =

                polygon.compartment ||

                polygon.compartmentName ||

                polygon.name ||

                "";


            if (

                compartmentName

            ) {

                /*
                 * Preferred complete FeatureCollection.
                 */

                if (

                    typeof GIS
                        .searchCompartmentFeatureCollection ===
                        "function"

                ) {

                    const collection =

                        GIS
                            .searchCompartmentFeatureCollection(

                                compartmentName

                            );


                    if (

                        collection &&

                        Array.isArray(
                            collection.features
                        ) &&

                        collection.features.length > 0

                    ) {

                        return collection;

                    }

                }


                /*
                 * Fallback single feature.
                 */

                if (

                    typeof GIS
                        .searchCompartment ===
                        "function"

                ) {

                    const feature =

                        GIS
                            .searchCompartment(

                                compartmentName

                            );


                    if (

                        feature

                    ) {

                        return feature;

                    }

                }

            }

        }


        /*
         * ------------------------------------------------
         * 6. RANGE
         * ------------------------------------------------
         *
         * HeatmapEngine aggregated range entries:
         *
         * {
         *     key: "RANGE::NMT",
         *     spatialType: "RANGE",
         *     range: "NMT",
         *     name: "NMT"
         * }
         *
         * Resolve:
         *
         * NMT
         *   ↓
         * Nimati
         *   ↓
         * FeatureCollection containing all
         * Nimati GIS features.
         */

        if (

            spatialType ===
                "RANGE"

        ) {

            let rangeName =

                polygon.range ||

                polygon.rangeName ||

                polygon.name ||

                "";


            /*
             * Defensive fallback:
             *
             * RANGE::NMT
             *      ↓
             * NMT
             */

            if (

                !rangeName &&

                typeof polygon.key ===
                    "string" &&

                polygon.key
                    .toUpperCase()
                    .startsWith(
                        "RANGE::"
                    )

            ) {

                rangeName =

                    polygon.key
                        .substring(
                            7
                        );

            }


            if (

                rangeName

            ) {

                /*
                 * Preferred:
                 *
                 * Return complete range FeatureCollection.
                 */

                if (

                    typeof GIS
                        .searchRangeFeatureCollection ===
                        "function"

                ) {

                    const collection =

                        GIS
                            .searchRangeFeatureCollection(

                                rangeName

                            );


                    if (

                        collection &&

                        Array.isArray(
                            collection.features
                        ) &&

                        collection.features.length > 0

                    ) {

                        return collection;

                    }

                }


                /*
                 * Fallback:
                 *
                 * Build FeatureCollection from grouped
                 * range features.
                 */

                if (

                    typeof GIS
                        .searchRangeFeatures ===
                        "function"

                ) {

                    const features =

                        GIS
                            .searchRangeFeatures(

                                rangeName

                            );


                    if (

                        Array.isArray(
                            features
                        ) &&

                        features.length > 0

                    ) {

                        return {

                            type:
                                "FeatureCollection",

                            features:
                                features

                        };

                    }

                }


                /*
                 * Final fallback:
                 *
                 * Existing single-feature range lookup.
                 */

                if (

                    typeof GIS
                        .searchRange ===
                        "function"

                ) {

                    const feature =

                        GIS
                            .searchRange(

                                rangeName

                            );


                    if (

                        feature

                    ) {

                        return feature;

                    }

                }

            }

        }


        /*
         * ------------------------------------------------
         * 7. GENERIC GIS FALLBACK
         * ------------------------------------------------
         *
         * Preserve compatibility for older polygon
         * structures.
         */

        const genericName =

            polygon.compartment ||

            polygon.compartmentName ||

            polygon.range ||

            polygon.rangeName ||

            polygon.name ||

            "";


        if (

            genericName &&

            typeof GIS.search ===
                "function"

        ) {

            const feature =

                GIS.search(

                    genericName

                );


            if (

                feature &&

                feature.geometry

            ) {

                return feature;

            }

        }


        return null;

    };


    /* =====================================================
       30. VALIDATE POLYGON FEATURE
       ===================================================== */

    MapRenderer.isValidPolygonFeature =
        function (

            feature

        ) {

            if (

                !feature ||

                feature.type !==
                    "Feature" ||

                !feature.geometry

            ) {

                return false;

            }


            const geometryType =

                feature.geometry
                    .type;


            if (

                geometryType !==
                    "Polygon" &&

                geometryType !==
                    "MultiPolygon"

            ) {

                return false;

            }


            if (

                !Array.isArray(

                    feature.geometry
                        .coordinates

                ) ||

                !feature.geometry
                    .coordinates
                    .length

            ) {

                return false;

            }


            return true;

        };


    /* =====================================================
       31. GET POLYGON RESOLUTION

       Prefer explicit HeatmapEngine metadata.

       Aggregated entries should normally expose either:

       resolution
       resolutionType
       spatialResolution
       level
       gisLevel
       type

       IMPORTANT:

       "SOURCE" / "TARGET" are not spatial resolutions.
       ===================================================== */

    MapRenderer.getPolygonResolution =
        function (

            entry

        ) {

            if (

                !entry

            ) {

                return MapRenderer
                    .RESOLUTION
                    .UNMAPPED;

            }


            const candidates = [

                entry.resolution,

                entry.resolutionType,

                entry.spatialResolution,

                entry.spatialType,

                entry.level,

                entry.gisLevel,

                entry.locationLevel

            ];


            for (

                const candidate
                of candidates

            ) {

                const resolution =

                    MapRenderer
                        .normalizeResolution(
                            candidate
                        );


                if (

                    resolution !==
                    MapRenderer
                        .RESOLUTION
                        .UNMAPPED

                ) {

                    return resolution;

                }

            }


            /*
             * Infer from known compartment/range metadata.
             */

            if (

                entry.compartment ||

                entry.compartmentName ||

                entry.compartmentKey

            ) {

                return MapRenderer
                    .RESOLUTION
                    .COMPARTMENT;

            }


            if (

                entry.range ||

                entry.rangeName ||

                entry.rangeKey

            ) {

                return MapRenderer
                    .RESOLUTION
                    .RANGE;

            }


            return MapRenderer
                .RESOLUTION
                .UNMAPPED;

        };

/* =====================================================
   HANDLE POLYGON CLICK

   TARGET GIS is currently authoritative for map polygons.

   SOURCE GIS may be added later.

   IMPORTANT:
   Polygon click does NOT resolve case relationships here.
   It only emits the complete POR-linked polygon context.

   CascadeController remains responsible for:
   POR → Cases → Accused → Witnesses →
   Seizures → Articles
   ===================================================== */

MapRenderer.handlePolygonClick =

    function (

        polygon,

        type,

        leafletEvent = null

    ) {

        try {

            // =============================================
            // 1. VALIDATE
            // =============================================

            if (
                !polygon
            ) {

                return {

                    success:
                        false,

                    reason:
                        "POLYGON_REQUIRED"

                };

            }


            // =============================================
            // 2. NORMALIZE TYPE
            // =============================================

            const normalizedType =

                String(

                    type ||

                    polygon.type ||

                    ""

                )
                    .trim()
                    .toUpperCase();


            if (

                normalizedType !==
                    "SOURCE" &&

                normalizedType !==
                    "TARGET"

            ) {

                return {

                    success:
                        false,

                    reason:
                        "INVALID_POLYGON_TYPE"

                };

            }


            // =============================================
            // 3. CANONICAL HOTSPOT ID
            // =============================================

            const hotspotId =

                polygon.hotspotId ||

                polygon.id ||

                polygon.key ||

                null;


            if (
                !hotspotId
            ) {

                return {

                    success:
                        false,

                    reason:
                        "HOTSPOT_ID_REQUIRED"

                };

            }


            // =============================================
            // 4. SPATIAL CONTEXT
            // =============================================

            const spatialType =

                polygon.spatialType ||

                polygon.resolutionType ||

                polygon.resolution ||

                null;


            const spatialName =

                polygon.range ||

                polygon.compartment ||

                polygon.name ||

                null;


            // =============================================
            // 5. POR RELATIONSHIP CONTEXT
            // =============================================

            const porKeys =

                Array.isArray(
                    polygon.porKeys
                )

                    ? polygon
                        .porKeys
                        .slice()

                    : [];


            // =============================================
            // 6. CLICK LOCATION
            // =============================================

            const latlng =

                leafletEvent
                    ?.latlng ||

                null;


            // =============================================
            // 7. BUILD CANONICAL EVENT DETAIL
            //
            // polygon and hotspot intentionally reference
            // the aggregated polygon.
            //
            // CascadeController.openHotspot() already
            // supports this contract.
            // =============================================

            const detail = {

                hotspotId:
                    hotspotId,

                type:
                    normalizedType,

                hotspot:
                    polygon,

                polygon:
                    polygon,

                porKeys:
                    porKeys,

                spatialType:
                    spatialType,

                spatialName:
                    spatialName,

                latlng:
                    latlng,

                leafletEvent:
                    leafletEvent

            };


            // =============================================
            // 8. DEBUG
            // =============================================

            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(

                    "🔥 Offence Polygon Event Dispatch",

                    {

                        hotspotId:
                            hotspotId,

                        type:
                            normalizedType,

                        hasHotspot:
                            true,

                        hasPolygon:
                            true,

                        spatialType:
                            spatialType,

                        spatialName:
                            spatialName,

                        porCount:
                            porKeys.length,

                        latlng:
                            latlng

                    }

                );

            }


            // =============================================
            // 9. DISPATCH EXISTING HOTSPOT EVENT
            //
            // IMPORTANT:
            // Use the SAME event name already consumed by
            // CascadeController.bindEvents().
            // =============================================

            window.dispatchEvent(

                new CustomEvent(

                    "offence:hotspot-click",

                    {

                        detail:
                            detail

                    }

                )

            );


            return {

                success:
                    true,

                data:
                    detail

            };

        }

        catch (
            error
        ) {

            console.error(

                "[OffenceMapRenderer] handlePolygonClick failed",

                error

            );


            return {

                success:
                    false,

                reason:
                    "POLYGON_CLICK_FAILED",

                error:
                    error

            };

        }

    };
    /* =====================================================
       32. GET POLYGON COUNT

       Used for polygon heat intensity.

       Aggregated polygon entries may expose:

       offenceCount
       hotspotCount
       count
       total
       sourceCount
       targetCount

       If unavailable, fallback to related hotspot arrays.
       ===================================================== */

    MapRenderer.getPolygonCount =
        function (

            entry

        ) {

            if (

                !entry

            ) {

                return 0;

            }


            const direct =

                MapRenderer
                    .toFiniteNumber(

                        entry.offenceCount ??

                        entry.hotspotCount ??

                        entry.count ??

                        entry.total ??

                        entry.sourceCount ??

                        entry.targetCount,

                        null

                    );


            if (

                direct !==
                null

            ) {

                return Math.max(

                    0,

                    direct

                );

            }


            const possibleArrays = [

                entry.hotspots,

                entry.sources,

                entry.targets,

                entry.entries,

                entry.items,

                entry.offences

            ];


            for (

                const value
                of possibleArrays

            ) {

                const array =

                    MapRenderer
                        .toArray(
                            value
                        );


                if (

                    array.length

                ) {

                    return array.length;

                }

            }


            return 1;

        };


    /* =====================================================
       33. GET POLYGON HEAT WEIGHT
       ===================================================== */

MapRenderer.getPolygonHeatWeight =
    function (
        entry
    ) {

        if (
            !entry
        ) {

            return 0;

        }


        /*
         * Polygon heat intensity is based primarily
         * on aggregated offence/case count.
         *
         * getPolygonCount() checks:
         *
         * offenceCount
         * hotspotCount
         * count
         * total
         * sourceCount
         * targetCount
         *
         * and finally related hotspot arrays.
         */

        const count =

            MapRenderer
                .getPolygonCount(
                    entry
                );


        if (
            count >
            0
        ) {

            return count;

        }


        /*
         * Fallback only when no usable count exists.
         */

        const explicit =

            MapRenderer
                .toFiniteNumber(

                    entry.heatWeight ??
                    entry.weight ??
                    entry.intensity,

                    0

                );


        return Math.max(

            0,

            explicit

        );

    };

    /* =====================================================
       34. GET MAX POLYGON HEAT WEIGHT

       Used to normalize polygon intensity within the
       current SOURCE or TARGET polygon collection.
       ===================================================== */

    MapRenderer.getMaxPolygonHeatWeight =
        function (

            entries

        ) {

            const polygons =

                MapRenderer
                    .toArray(
                        entries
                    );


            let max =
                0;


            for (

                const entry
                of polygons

            ) {

                const weight =

                    MapRenderer
                        .getPolygonHeatWeight(
                            entry
                        );


                if (

                    weight >
                    max

                ) {

                    max =
                        weight;

                }

            }


            return max > 0

                ? max

                : 1;

        };


    /* =====================================================
       35. NORMALIZE POLYGON INTENSITY

       Returns 0 → 1.
       ===================================================== */

    MapRenderer.normalizePolygonIntensity =
        function (

            entry,

            maxWeight

        ) {

            const weight =

                MapRenderer
                    .getPolygonHeatWeight(
                        entry
                    );


            const maximum =

                Map.maxPolygonWeight =
                    Math.max(

                        1,

                        MapRenderer
                            .toFiniteNumber(

                                maxWeight,

                                1

                            )

                    );


            if (

                weight <=
                0

            ) {

                return 0;

            }


            return Math.min(

                1,

                weight /
                maximum

            );

        };


    /* =====================================================
       36. INTERPOLATE NUMBER

       Used for polygon opacity and border weight.
       ===================================================== */

    MapRenderer.interpolateNumber =
        function (

            minimum,

            maximum,

            intensity

        ) {

            const normalized =

                Math.max(

                    0,

                    Math.min(

                        1,

                        MapRenderer
                            .toFiniteNumber(

                                intensity,

                                0

                            )

                    )

                );


            return (

                minimum +

                (

                    maximum -
                    minimum

                ) *

                normalized

            );

        };


    /* =====================================================
       37. CREATE POLYGON STYLE

       Polygon heat is represented by:

       - fill opacity
       - border weight

       SOURCE and TARGET retain separate visual identity.
       ===================================================== */

MapRenderer.createPolygonStyle =
    function (

        entry,

        type,

        maxWeight = 1

    ) {

        const isTarget =

            String(
                type ||
                ""
            )
                .toUpperCase() ===
            "TARGET";


        const baseConfig =

            isTarget

                ? MapRenderer
                    .config
                    .targetPolygon

                : MapRenderer
                    .config
                    .sourcePolygon;


        const heatConfig =

            MapRenderer
                .config
                .polygonHeat;


        /*
         * Normalize polygon offence count
         * against the highest-count polygon.
         *
         * 0 = lowest intensity
         * 1 = highest intensity
         */

const intensity =

    MapRenderer
        .normalizePolygonIntensity(

            entry,

            maxWeight

        );


/* =============================================
   TEMPORARY POLYGON HEAT DEBUG
   ============================================= */

console.log(

    "🔥 POLYGON HEAT DEBUG",

    {

        name:
            entry.range ||
            entry.compartment ||
            entry.name,

        type:
            type,

        isTarget:
            isTarget,

        offenceCount:
            entry.offenceCount,

        hotspotCount:
            entry.hotspotCount,

        heatWeight:
            entry.heatWeight,

        calculatedCount:
            MapRenderer
                .getPolygonCount(
                    entry
                ),

        calculatedWeight:
            MapRenderer
                .getPolygonHeatWeight(
                    entry
                ),

        maxWeight:
            maxWeight,

        intensity:
            intensity,

        fillColor:
            isTarget

                ? MapRenderer
                    .getTargetPolygonHeatColor(
                        intensity
                    )

                : baseConfig
                    .fillColor

    }

);


        /*
         * Dynamic fill opacity.
         */

        const fillOpacity =

            MapRenderer
                .interpolateNumber(

                    heatConfig
                        .minFillOpacity,

                    heatConfig
                        .maxFillOpacity,

                    intensity

                );


        /*
         * Dynamic border thickness.
         */

        const weight =

            MapRenderer
                .interpolateNumber(

                    heatConfig
                        .minWeight,

                    heatConfig
                        .maxWeight,

                    intensity

                );


        /*
         * TARGET:
         * Dynamic high-contrast heat color
         * based on offence-count intensity.
         *
         * SOURCE:
         * Keep existing configured color.
         */

        const fillColor =

            isTarget

                ? MapRenderer
                    .getTargetPolygonHeatColor(

                        intensity

                    )

                : baseConfig
                    .fillColor;


        return {

            color:

                baseConfig
                    .color,

            fillColor:

                fillColor,

            opacity:

                isTarget
                    ? 1.00
                    : baseConfig
                        .opacity,

            fillOpacity:

                isTarget

                    ? Math.max(
                        0.80,
                        fillOpacity
                    )

                    : fillOpacity,

            weight:

                weight

        };

    };


    /* =====================================================
       38. CREATE SOURCE POLYGON STYLE
       ===================================================== */

    MapRenderer.createSourcePolygonStyle =
        function (

            entry,

            maxWeight = 1

        ) {

            return MapRenderer
                .createPolygonStyle(

                    entry,

                    "SOURCE",

                    maxWeight

                );

        };


    /* =====================================================
       39. CREATE TARGET POLYGON STYLE
       ===================================================== */

    MapRenderer.createTargetPolygonStyle =
        function (

            entry,

            maxWeight = 1

        ) {

            return MapRenderer
                .createPolygonStyle(

                    entry,

                    "TARGET",

                    maxWeight

                );

        };


    /* =====================================================
       40. GET POLYGON NAME
       ===================================================== */

    MapRenderer.getPolygonName =
        function (

            entry

        ) {

            if (

                !entry

            ) {

                return "";

            }


            const feature =

                MapRenderer
                    .getPolygonFeature(
                        entry
                    );


            const properties =

                feature
                    ?.properties ||

                {};


            return String(

                entry.name ??

                entry.locationName ??

                entry.compartmentName ??

                entry.compartment ??

                entry.rangeName ??

                entry.range ??

                properties.compartment ??

                properties.range ??

                properties.name ??

                ""

            )
                .trim();

        };


    /* =====================================================
       41. GET POLYGON POR KEYS

       POR remains authoritative.

       Aggregated polygon entries may represent multiple
       offences and therefore multiple POR keys.
       ===================================================== */

    MapRenderer.getPolygonPorKeys =
        function (

            entry

        ) {

            if (

                !entry

            ) {

                return [];

            }


            const result =
                [];


            const seen =
                new Set();


            const add =

                function (

                    value

                ) {

                    const key =

                        MapRenderer
                            .normalizePorKey(
                                value
                            );


                    if (

                        !key ||

                        seen.has(
                            key
                        )

                    ) {

                        return;

                    }


                    seen.add(
                        key
                    );


                    result.push(
                        key
                    );

                };


            const directKeys =

                MapRenderer
                    .toArray(

                        entry.porKeys

                    );


            for (

                const value
                of directKeys

            ) {

                add(
                    value
                );

            }


            add(

                entry.porKey

            );


            const hotspots = [

                ...MapRenderer
                    .toArray(
                        entry.hotspots
                    ),

                ...MapRenderer
                    .toArray(
                        entry.sources
                    ),

                ...MapRenderer
                    .toArray(
                        entry.targets
                    ),

                ...MapRenderer
                    .toArray(
                        entry.entries
                    ),

                ...MapRenderer
                    .toArray(
                        entry.items
                    )

            ];


            for (

                const hotspot
                of hotspots

            ) {

                const keys =

                    MapRenderer
                        .extractPorKeys(
                            hotspot
                        );


                for (

                    const key
                    of keys

                ) {

                    add(
                        key
                    );

                }

            }


            return result;

        };


    /* =====================================================
       END OF PART 2

       NEXT PART:

       42. normalizePorKey
       43. getRefPorNo
       44. extractPorKeys
       45. getPrimaryPorKey
       46. Build source point interaction markers
       47. Build target point interaction markers
       48. Create interaction marker
       49. Build source polygon layers
       50. Build target polygon layers
       51. Create individual polygon layer
       52. Polygon tooltip
       53. Polygon click → POR cascade event

       IMPORTANT:
       Do NOT close the IIFE.
       Part 3 continues directly below.
       ===================================================== */

     /* =====================================================
       42. NORMALIZE POR KEY
       ===================================================== */

    MapRenderer.normalizePorKey =
        function (

            value

        ) {

            if (

                value ===
                    null ||

                value ===
                    undefined

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
                    " "
                );

        };


    /* =====================================================
       43. GET REF POR NUMBER

       Extract the human-readable POR reference.

       POR / Ref POR No remains the authoritative
       relationship connector.

       Supported canonical aliases are retained only for
       compatibility with normalized offence records.
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

                hotspot.porNo ??

                hotspot.refPorNo ??

                hotspot.refPORNo ??

                hotspot.porNumber ??

                hotspot.POR_NO ??

                hotspot["POR No"] ??

                hotspot["Ref POR No"] ??

                hotspot.porKey ??

                "";


            return String(
                value
            )
                .trim();

        };


    /* =====================================================
       44. EXTRACT POR KEYS

       A hotspot may be linked to one or more PORs.

       Priority:

       1. hotspot.porKeys
       2. hotspot.porKey
       3. hotspot.porNos
       4. hotspot.porNo / Ref POR No

       Output is normalized and unique.
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


            const result =
                [];


            const seen =
                new Set();


            const add =

                function (

                    value

                ) {

                    const key =

                        MapRenderer
                            .normalizePorKey(
                                value
                            );


                    if (

                        !key ||

                        seen.has(
                            key
                        )

                    ) {

                        return;

                    }


                    seen.add(
                        key
                    );


                    result.push(
                        key
                    );

                };


            /* -------------------------------------------------
               Canonical POR key array
               ------------------------------------------------- */

            const porKeys =

                MapRenderer
                    .toArray(

                        hotspot.porKeys

                    );


            for (

                const porKey
                of porKeys

            ) {

                add(
                    porKey
                );

            }


            /* -------------------------------------------------
               Canonical primary POR key
               ------------------------------------------------- */

            add(

                hotspot.porKey

            );


            /* -------------------------------------------------
               Human-readable POR numbers
               ------------------------------------------------- */

            const porNos =

                MapRenderer
                    .toArray(

                        hotspot.porNos

                    );


            for (

                const porNo
                of porNos

            ) {

                add(
                    porNo
                );

            }


            /* -------------------------------------------------
               Single POR fallback
               ------------------------------------------------- */

            add(

                MapRenderer
                    .getRefPorNo(
                        hotspot
                    )

            );


            return result;

        };


    /* =====================================================
       45. GET PRIMARY POR KEY

       Used for the primary cascade request when one
       interaction object contains multiple PORs.

       The complete porKeys array is still included in
       the dispatched event.
       ===================================================== */

    MapRenderer.getPrimaryPorKey =
        function (

            hotspot

        ) {

            if (

                !hotspot

            ) {

                return "";

            }


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
       46. GET HOTSPOT ID
       ===================================================== */

    MapRenderer.getHotspotId =
        function (

            hotspot

        ) {

            if (

                !hotspot

            ) {

                return "";

            }


            return String(

                hotspot.id ??

                hotspot.hotspotId ??

                hotspot.key ??

                ""

            )
                .trim();

        };


    /* =====================================================
       47. CREATE POINT INTERACTION MARKER

       Leaflet.heat layers themselves are not practical
       click targets.

       Therefore an almost-transparent circle marker is
       created for every POINT-resolved hotspot.

       The marker carries the canonical hotspot object.

       Clicking it dispatches the POR-authoritative
       offence:hotspot-click event.
       ===================================================== */

    MapRenderer.createInteractionMarker =
        function (

            hotspot,

            type

        ) {

            if (

                !hotspot ||

                typeof window.L ===
                    "undefined"

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


            const normalizedType =

                String(

                    type ||

                    hotspot.type ||

                    ""

                )

                    .trim()

                    .toUpperCase();


            const marker =

                L.circleMarker(

                    [

                        coordinates.latitude,

                        coordinates.longitude

                    ],

                    {

                        radius:

                            MapRenderer
                                .config
                                .marker
                                .radius,

                        opacity:

                            MapRenderer
                                .config
                                .marker
                                .opacity,

                        fillOpacity:

                            MapRenderer
                                .config
                                .marker
                                .fillOpacity,

                        interactive:
                            true,

                        bubblingMouseEvents:
                            false

                    }

                );


            /*
             * Preserve canonical offence metadata directly
             * on the Leaflet marker.
             */

            marker.__offenceHotspot =
                hotspot;


            marker.__offenceType =
                normalizedType;


            marker.__offenceResolution =
                MapRenderer
                    .RESOLUTION
                    .POINT;


            marker.on(

                "click",

                function (

                    event

                ) {

                    if (

                        event
                            ?.originalEvent

                    ) {

                        L.DomEvent
                            .stopPropagation(

                                event.originalEvent

                            );

                    }


                    MapRenderer
                        .handleHotspotClick(

                            hotspot,

                            normalizedType,

                            {

                                resolution:

                                    MapRenderer
                                        .RESOLUTION
                                        .POINT,

                                leafletEvent:
                                    event,

                                layer:
                                    marker

                            }

                        );

                }

            );


            return marker;

        };


    /* =====================================================
       48. BUILD SOURCE POINT INTERACTION MARKERS

       IMPORTANT:

       Only POINT-resolved source entries are used.

       Raw SourceEngine hotspots must not automatically
       become point markers because HeatmapEngine v3 may
       have resolved them to RANGE or COMPARTMENT.
       ===================================================== */

    MapRenderer.buildSourceMarkers =
        function (

            sourcePoints = []

        ) {

            if (

                typeof window.L ===
                "undefined"

            ) {

                return 0;

            }


            if (

                !MapRenderer.layers
                    .sourceMarkerLayer

            ) {

                MapRenderer.layers
                    .sourceMarkerLayer =

                    L.layerGroup();

            }


            MapRenderer.layers
                .sourceMarkerLayer
                .clearLayers();


            const points =

                MapRenderer
                    .toArray(
                        sourcePoints
                    );


            let count =
                0;


            for (

                const point
                of points

            ) {

                /*
                 * A raw Leaflet.heat array does not carry
                 * enough POR metadata for cascade clicks.
                 */

                if (

                    Array.isArray(
                        point
                    )

                ) {

                    continue;

                }


                const marker =

                    MapRenderer
                        .createInteractionMarker(

                            point,

                            "SOURCE"

                        );


                if (

                    !marker

                ) {

                    continue;

                }


                MapRenderer.layers
                    .sourceMarkerLayer
                    .addLayer(
                        marker
                    );


                count++;

            }


            return count;

        };


    /* =====================================================
       49. BUILD TARGET POINT INTERACTION MARKERS
       ===================================================== */

    MapRenderer.buildTargetMarkers =
        function (

            targetPoints = []

        ) {

            if (

                typeof window.L ===
                "undefined"

            ) {

                return 0;

            }


            if (

                !MapRenderer.layers
                    .targetMarkerLayer

            ) {

                MapRenderer.layers
                    .targetMarkerLayer =

                    L.layerGroup();

            }


            MapRenderer.layers
                .targetMarkerLayer
                .clearLayers();


            const points =

                MapRenderer
                    .toArray(
                        targetPoints
                    );


            let count =
                0;


            for (

                const point
                of points

            ) {

                if (

                    Array.isArray(
                        point
                    )

                ) {

                    continue;

                }


                const marker =

                    MapRenderer
                        .createInteractionMarker(

                            point,

                            "TARGET"

                        );


                if (

                    !marker

                ) {

                    continue;

                }


                MapRenderer.layers
                    .targetMarkerLayer
                    .addLayer(
                        marker
                    );


                count++;

            }


            return count;

        };


    /* =====================================================
       50. GET POLYGON HOTSPOTS

       Aggregated polygon entries may expose the
       contributing hotspots under different canonical
       properties.

       Return a unique array using hotspot ID where
       possible.
       ===================================================== */

    MapRenderer.getPolygonHotspots =
        function (

            entry

        ) {

            if (

                !entry

            ) {

                return [];

            }


            const candidates = [

                ...MapRenderer
                    .toArray(
                        entry.hotspots
                    ),

                ...MapRenderer
                    .toArray(
                        entry.sources
                    ),

                ...MapRenderer
                    .toArray(
                        entry.targets
                    ),

                ...MapRenderer
                    .toArray(
                        entry.entries
                    ),

                ...MapRenderer
                    .toArray(
                        entry.items
                    ),

                ...MapRenderer
                    .toArray(
                        entry.offences
                    )

            ];


            const output =
                [];


            const seen =
                new Set();


            for (

                const hotspot
                of candidates

            ) {

                if (

                    !hotspot

                ) {

                    continue;

                }


                const id =

                    MapRenderer
                        .getHotspotId(
                            hotspot
                        );


                const key =

                    id ||

                    JSON.stringify(

                        MapRenderer
                            .extractPorKeys(
                                hotspot
                            )

                    );


                if (

                    key &&

                    seen.has(
                        key
                    )

                ) {

                    continue;

                }


                if (

                    key

                ) {

                    seen.add(
                        key
                    );

                }


                output.push(
                    hotspot
                );

            }


            return output;

        };


    /* =====================================================
       51. GET POLYGON PRIMARY HOTSPOT

       Used only as the interaction payload anchor.

       The complete aggregated polygon entry remains
       available in event metadata.
       ===================================================== */

    MapRenderer.getPolygonPrimaryHotspot =
        function (

            entry

        ) {

            if (

                !entry

            ) {

                return null;

            }


            const hotspots =

                MapRenderer
                    .getPolygonHotspots(
                        entry
                    );


            if (

                hotspots.length

            ) {

                return hotspots[0];

            }


            /*
             * The aggregated polygon itself may already
             * carry porKey / porKeys.
             */

            if (

                MapRenderer
                    .getPolygonPorKeys(
                        entry
                    )
                    .length

            ) {

                return entry;

            }


            return null;

        };


    /* =====================================================
       52. BUILD POLYGON TOOLTIP TEXT

       Keep tooltip concise.

       Detailed offence information belongs to the
       CascadeRenderer after click.
       ===================================================== */

    MapRenderer.buildPolygonTooltip =
        function (

            entry,

            type

        ) {

            const name =

                MapRenderer
                    .getPolygonName(
                        entry
                    );


            const resolution =

                MapRenderer
                    .getPolygonResolution(
                        entry
                    );


            const count =

                MapRenderer
                    .getPolygonCount(
                        entry
                    );


            const normalizedType =

                String(

                    type ||

                    ""

                )
                    .toUpperCase();


            const parts =
                [];


            if (

                name

            ) {

                parts.push(
                    name
                );

            }


            if (

                resolution !==
                MapRenderer
                    .RESOLUTION
                    .UNMAPPED

            ) {

                parts.push(
                    resolution
                );

            }


            parts.push(

                normalizedType ===
                    "TARGET"

                    ? (
                        count +
                        " target offence" +
                        (
                            count === 1
                                ? ""
                                : "s"
                        )
                    )

                    : (
                        count +
                        " source offence" +
                        (
                            count === 1
                                ? ""
                                : "s"
                        )
                    )

            );


            return parts.join(
                " • "
            );

        };


    /* =====================================================
       53. CREATE POLYGON INTERACTION LAYER

       One aggregated HeatmapEngine polygon entry becomes
       one Leaflet GeoJSON layer.

       The geometry comes from the GIS feature already
       resolved by HeatmapEngine.

       The renderer does NOT search GISEntities again.
       ===================================================== */

/*=========================================================
  Create Polygon Layer
=========================================================*/

/*=========================================================
  53. CREATE POLYGON INTERACTION LAYER

  Canonical flow:

  HeatmapEngine aggregated polygon entry
      ↓
  MapRenderer.getPolygonFeature()
      ↓
  GeoJSON Feature OR FeatureCollection
      ↓
  L.geoJSON()
      ↓
  One Leaflet parent layer containing one or more
  child polygon feature layers.

  IMPORTANT:
  - Supports both Feature and FeatureCollection.
  - FeatureCollection is passed intact to L.geoJSON().
  - Every child feature keeps the same aggregated
    offence polygon metadata.
  - Polygon styling uses SOURCE / TARGET style helpers.
  - maxWeight is preserved for heat-intensity styling.
  - Click drill-down remains attached to every child.
=========================================================*/

MapRenderer.createPolygonLayer =
    function (

        polygon,

        type,

        maxWeight = 1

    ) {

        /*---------------------------------------------
          1. Validate basic input
        ---------------------------------------------*/

        if (
            !polygon ||
            typeof window.L ===
                "undefined"
        ) {

            return null;

        }


        /*---------------------------------------------
          2. Resolve canonical GIS GeoJSON

          May return:

          Feature

          OR

          FeatureCollection

          IMPORTANT:

          TARGET GIS is currently available.

          SOURCE GIS may return null until source
          spatial GIS is added later.
        ---------------------------------------------*/

        const geoJSON =

            MapRenderer
                .getPolygonFeature(
                    polygon
                );


        if (
            !geoJSON
        ) {

            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.warn(

                    "[OffenceMapRenderer] Polygon GIS resolution failed",

                    {

                        key:
                            polygon.key,

                        name:
                            polygon.name,

                        range:
                            polygon.range,

                        compartment:
                            polygon.compartment,

                        spatialType:
                            polygon.spatialType,

                        resolutionType:
                            polygon.resolutionType,

                        resolution:
                            polygon.resolution

                    }

                );

            }


            return null;

        }


        /*---------------------------------------------
          3. Validate GeoJSON contract
        ---------------------------------------------*/

        const isFeature =

            (
                geoJSON.type ===
                    "Feature" &&

                geoJSON.geometry &&

                (
                    geoJSON.geometry.type ===
                        "Polygon" ||

                    geoJSON.geometry.type ===
                        "MultiPolygon"
                )
            );


        const isFeatureCollection =

            (
                geoJSON.type ===
                    "FeatureCollection" &&

                Array.isArray(
                    geoJSON.features
                ) &&

                geoJSON.features
                    .some(

                        function (
                            feature
                        ) {

                            return (

                                feature &&

                                feature.type ===
                                    "Feature" &&

                                feature.geometry &&

                                (
                                    feature.geometry.type ===
                                        "Polygon" ||

                                    feature.geometry.type ===
                                        "MultiPolygon"
                                )

                            );

                        }

                    )
            );


        if (
            !isFeature &&
            !isFeatureCollection
        ) {

            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.warn(

                    "[OffenceMapRenderer] Invalid polygon GeoJSON",

                    {

                        polygon:
                            polygon,

                        geoJSONType:
                            geoJSON.type,

                        geometryType:
                            geoJSON.geometry
                                ?.type,

                        featureCount:

                            Array.isArray(
                                geoJSON.features
                            )

                                ? geoJSON
                                    .features
                                    .length

                                : 0

                    }

                );

            }


            return null;

        }


        /*---------------------------------------------
          4. Normalize offence type
        ---------------------------------------------*/

        const normalizedType =

            String(

                type ||

                polygon.type ||

                ""

            )
                .trim()
                .toUpperCase();


        const isSource =

            normalizedType ===
                "SOURCE";


        const isTarget =

            normalizedType ===
                "TARGET";


        if (
            !isSource &&
            !isTarget
        ) {

            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.warn(

                    "[OffenceMapRenderer] Unknown polygon type",

                    {

                        type:
                            type,

                        polygonType:
                            polygon.type,

                        polygon:
                            polygon

                    }

                );

            }


            return null;

        }


        /*---------------------------------------------
          5. Normalize max heat weight
        ---------------------------------------------*/

        const safeMaxWeight =

            (
                Number.isFinite(
                    Number(
                        maxWeight
                    )
                ) &&

                Number(
                    maxWeight
                ) > 0
            )

                ? Number(
                    maxWeight
                )

                : 1;


        /*---------------------------------------------
          6. Build canonical polygon style
        ---------------------------------------------*/

        let style;


        try {

            if (
                isSource &&

                typeof MapRenderer
                    .createSourcePolygonStyle ===
                    "function"
            ) {

                style =

                    MapRenderer
                        .createSourcePolygonStyle(

                            polygon,

                            safeMaxWeight

                        );

            }


            else if (
                isTarget &&

                typeof MapRenderer
                    .createTargetPolygonStyle ===
                    "function"
            ) {

                style =

                    MapRenderer
                        .createTargetPolygonStyle(

                            polygon,

                            safeMaxWeight

                        );

            }

        }

        catch (
            error
        ) {

            console.error(

                "[OffenceMapRenderer] Polygon style creation failed",

                {

                    polygon:
                        polygon,

                    type:
                        normalizedType,

                    maxWeight:
                        safeMaxWeight,

                    error:
                        error

                }

            );

        }


        /*---------------------------------------------
          7. Safe fallback style
        ---------------------------------------------*/

        if (
            !style ||

            typeof style !==
                "object"
        ) {

            style = {

                weight:
                    2,

                opacity:
                    0.85,

                fillOpacity:
                    0.35

            };

        }


        /*---------------------------------------------
          8. Create Leaflet GeoJSON layer

          IMPORTANT:

          Pass complete FeatureCollection.

          One aggregated TARGET range may contain
          multiple underlying GIS beat features.

          Example:

          NMT  → 3 features
          WRVK → 4 features

          All child features represent ONE aggregated
          offence polygon interaction.
        ---------------------------------------------*/

        let layer;


        try {

            layer =

                L.geoJSON(

                    geoJSON,

                    {

                        /*---------------------------------
                          Apply same heat style to every
                          GIS feature belonging to the
                          aggregated polygon.
                        ---------------------------------*/

                        style:

                            function () {

                                return {

                                    ...style

                                };

                            },


                        /*---------------------------------
                          Attach offence metadata and
                          interaction to every child
                          Leaflet feature.
                        ---------------------------------*/

                        onEachFeature:

                            function (

                                feature,

                                featureLayer

                            ) {

                                /*-------------------------
                                  Aggregated offence entry
                                -------------------------*/

                                featureLayer
                                    .offencePolygon =

                                    polygon;


                                featureLayer
                                    .offenceType =

                                    normalizedType;


                                featureLayer
                                    .offenceSpatialType =

                                    polygon.spatialType ||

                                    polygon.resolutionType ||

                                    polygon.resolution ||

                                    "";


                                /*-------------------------
                                  Actual GIS feature

                                  Kept separately from the
                                  aggregated offence entry.
                                -------------------------*/

                                featureLayer
                                    .offenceGISFeature =

                                    feature;


                                /*-------------------------
                                  Polygon click

                                  IMPORTANT:

                                  Pass:

                                  polygon
                                  type
                                  Leaflet event

                                  The complete aggregated
                                  polygon is passed forward
                                  so its POR set can drive
                                  the cascade.
                                -------------------------*/

                                featureLayer.on(

                                    "click",

                                    function (
                                        event
                                    ) {

                                        /*-----------------
                                          Prevent map-level
                                          click propagation.
                                        -----------------*/

                                        if (
                                            event
                                                ?.originalEvent
                                        ) {

                                            L.DomEvent
                                                .stopPropagation(

                                                    event
                                                        .originalEvent

                                                );

                                        }


                                        /*-----------------
                                          Canonical polygon
                                          interaction path
                                        -----------------*/

                                        if (
                                            typeof MapRenderer
                                                .handlePolygonClick ===
                                                "function"
                                        ) {

                                            MapRenderer
                                                .handlePolygonClick(

                                                    polygon,

                                                    normalizedType,

                                                    event

                                                );


                                            return;

                                        }


                                        /*-----------------
                                          Legacy fallback

                                          Keep this so the
                                          existing flow does
                                          not break if the
                                          new polygon handler
                                          is unavailable.
                                        -----------------*/

                                        if (

                                            GG.Offence
                                                ?.UIController &&

                                            typeof GG.Offence
                                                .UIController
                                                .handleHotspotClick ===
                                                "function"

                                        ) {

                                            GG.Offence
                                                .UIController
                                                .handleHotspotClick(

                                                    polygon,

                                                    normalizedType,

                                                    event

                                                );

                                        }

                                    }

                                );

                            }

                    }

                );

        }

        catch (
            error
        ) {

            console.error(

                "[OffenceMapRenderer] Polygon layer creation failed",

                {

                    polygon:
                        polygon,

                    type:
                        normalizedType,

                    maxWeight:
                        safeMaxWeight,

                    geoJSONType:
                        geoJSON.type,

                    error:
                        error

                }

            );


            return null;

        }


        /*---------------------------------------------
          9. Validate created Leaflet layer
        ---------------------------------------------*/

        if (
            !layer
        ) {

            return null;

        }


        /*---------------------------------------------
          10. Store canonical metadata on parent layer

          This allows:

          parent.offencePolygon

          and:

          child.offencePolygon
        ---------------------------------------------*/

        layer.offencePolygon =

            polygon;


        layer.offenceType =

            normalizedType;


        layer.offenceSpatialType =

            polygon.spatialType ||

            polygon.resolutionType ||

            polygon.resolution ||

            "";


        layer.offenceGeoJSON =

            geoJSON;


        /*---------------------------------------------
          11. Store interaction metadata
        ---------------------------------------------*/

        layer.offenceInteraction = {

            type:
                normalizedType,

            key:
                polygon.key ||
                null,

            id:
                polygon.id ||
                polygon.hotspotId ||
                polygon.key ||
                null,

            porKey:
                polygon.porKey ||
                null,

            porKeys:

                Array.isArray(
                    polygon.porKeys
                )

                    ? polygon.porKeys

                    : []

        };


        /*---------------------------------------------
          12. Store FeatureCollection information
        ---------------------------------------------*/

        layer.offenceGISFeatureCount =

            geoJSON.type ===
                "FeatureCollection"

                ? geoJSON
                    .features
                    .length

                : 1;


        /*---------------------------------------------
          13. Debug
        ---------------------------------------------*/

        if (
            Constants.DEBUG
                ?.ENABLED
        ) {

            console.debug(

                "[OffenceMapRenderer] Polygon layer created",

                {

                    key:
                        polygon.key,

                    name:
                        polygon.name,

                    type:
                        normalizedType,

                    spatialType:

                        layer
                            .offenceSpatialType,

                    geoJSONType:
                        geoJSON.type,

                    featureCount:

                        layer
                            .offenceGISFeatureCount,

                    porCount:

                        Array.isArray(
                            polygon.porKeys
                        )

                            ? polygon
                                .porKeys
                                .length

                            : polygon.porKey

                                ? 1

                                : 0,

                    maxWeight:
                        safeMaxWeight

                }

            );

        }


        /*---------------------------------------------
          14. Return complete Leaflet GeoJSON layer
        ---------------------------------------------*/

        return layer;

    };


    /* =====================================================
       54. BUILD SOURCE POLYGON LAYERS

       sourcePolygons should already be aggregated by
       HeatmapEngine.

       Expected contents:

       COMPARTMENT polygons
       RANGE polygons

       If sourcePolygons is unavailable, the renderer
       can combine sourceCompartments + sourceRanges.
       ===================================================== */

    MapRenderer.buildSourcePolygons =
        function (

            sourcePolygons = [],

            sourceCompartments = [],

            sourceRanges = []

        ) {

            if (

                typeof window.L ===
                "undefined"

            ) {

                return 0;

            }


            if (

                !MapRenderer.layers
                    .sourcePolygonLayer

            ) {

                MapRenderer.layers
                    .sourcePolygonLayer =

                    L.layerGroup();

            }


            MapRenderer.layers
                .sourcePolygonLayer
                .clearLayers();


            let entries =

                MapRenderer
                    .toArray(
                        sourcePolygons
                    );


            /*
             * Fallback only when aggregated polygons were
             * not supplied.
             */

            if (

                !entries.length

            ) {

                entries = [

                    ...MapRenderer
                        .toArray(
                            sourceCompartments
                        ),

                    ...MapRenderer
                        .toArray(
                            sourceRanges
                        )

                ];

            }


            const maxWeight =

                MapRenderer
                    .getMaxPolygonHeatWeight(
                        entries
                    );


            let count =
                0;


            for (

                const entry
                of entries

            ) {

                const layer =

                    MapRenderer
                        .createPolygonLayer(

                            entry,

                            "SOURCE",

                            maxWeight

                        );


                if (

                    !layer

                ) {

                    continue;

                }


                MapRenderer.layers
                    .sourcePolygonLayer
                    .addLayer(
                        layer
                    );


                count++;

            }


            return count;

        };


    /* =====================================================
       55. BUILD TARGET POLYGON LAYERS
       ===================================================== */

    MapRenderer.buildTargetPolygons =
        function (

            targetPolygons = [],

            targetCompartments = [],

            targetRanges = []

        ) {

            if (

                typeof window.L ===
                "undefined"

            ) {

                return 0;

            }


            if (

                !MapRenderer.layers
                    .targetPolygonLayer

            ) {

                MapRenderer.layers
                    .targetPolygonLayer =

                    L.layerGroup();

            }


            MapRenderer.layers
                .targetPolygonLayer
                .clearLayers();


            let entries =

                MapRenderer
                    .toArray(
                        targetPolygons
                    );


            if (

                !entries.length

            ) {

                entries = [

                    ...MapRenderer
                        .toArray(
                            targetCompartments
                        ),

                    ...MapRenderer
                        .toArray(
                            targetRanges
                        )

                ];

            }


            const maxWeight =

                MapRenderer
                    .getMaxPolygonHeatWeight(
                        entries
                    );


            let count =
                0;


            for (

                const entry
                of entries

            ) {

                const layer =

                    MapRenderer
                        .createPolygonLayer(

                            entry,

                            "TARGET",

                            maxWeight

                        );


                if (

                    !layer

                ) {

                    continue;

                }


                MapRenderer.layers
                    .targetPolygonLayer
                    .addLayer(
                        layer
                    );


                count++;

            }


            return count;

        };


    /* =====================================================
       56. HANDLE HOTSPOT CLICK

       AUTHORITATIVE CONNECTOR:

       POR / porKey

       The renderer emits one normalized event.

       CascadeController remains responsible for resolving
       the complete POR relationship graph.

       For aggregated compartment/range polygons, multiple
       POR keys may exist.

       primary porKey:
       first authoritative POR used as interaction anchor.

       porKeys:
       complete set represented by the clicked polygon.
       ===================================================== */

    MapRenderer.handleHotspotClick =
        function (

            hotspot,

            type,

            metadata = {}

        ) {

            if (

                !hotspot

            ) {

                return false;

            }


            const normalizedType =

                String(

                    type ||

                    hotspot.type ||

                    ""

                )

                    .trim()

                    .toUpperCase();


            let porKeys =

                MapRenderer
                    .extractPorKeys(
                        hotspot
                    );


            /*
             * Polygon metadata may contain additional PORs
             * not present on the primary hotspot.
             */

            const metadataPorKeys =

                MapRenderer
                    .toArray(

                        metadata.porKeys

                    );


            const seen =

                new Set(
                    porKeys
                );


            for (

                const rawPorKey
                of metadataPorKeys

            ) {

                const porKey =

                    MapRenderer
                        .normalizePorKey(
                            rawPorKey
                        );


                if (

                    !porKey ||

                    seen.has(
                        porKey
                    )

                ) {

                    continue;

                }


                seen.add(
                    porKey
                );


                porKeys.push(
                    porKey
                );

            }


            const porKey =

                porKeys[0] ||

                MapRenderer
                    .getPrimaryPorKey(
                        hotspot
                    );


            if (

                !porKey

            ) {

                console.warn(

                    "[OffenceMapRenderer] " +
                    "Hotspot click ignored because " +
                    "no POR key is available.",

                    {

                        hotspot:
                            hotspot,

                        type:
                            normalizedType,

                        metadata:
                            metadata

                    }

                );


                return false;

            }


            const detail = {

                connector:

                    MapRenderer
                        .CONNECTOR,

                authoritativeConnector:

                    MapRenderer
                        .AUTHORITATIVE_CONNECTOR,

                porKey:
                    porKey,

                porKeys:
                    porKeys,

                porNo:

                    MapRenderer
                        .getRefPorNo(
                            hotspot
                        ) ||

                    porKey,

                type:
                    normalizedType,

                resolution:

                    metadata.resolution ||

                    MapRenderer
                        .RESOLUTION
                        .POINT,

                hotspot:
                    hotspot,

                hotspotId:

                    MapRenderer
                        .getHotspotId(
                            hotspot
                        ),

                polygonEntry:

                    metadata.polygonEntry ||

                    null,

                feature:

                    metadata.feature ||

                    null,

                layer:

                    metadata.layer ||

                    null,

                originalEvent:

                    metadata.leafletEvent ||

                    null

            };


            MapRenderer.debug(

                "Hotspot clicked",

                {

                    type:
                        detail.type,

                    resolution:
                        detail.resolution,

                    porKey:
                        detail.porKey,

                    porKeys:
                        detail.porKeys,

                    hotspotId:
                        detail.hotspotId

                }

            );


            /*
             * Canonical offence hotspot event.
             */

            MapRenderer
                .dispatchEvent(

                    Constants.EVENTS
                        ?.HOTSPOT_CLICK ||

                    "offence:hotspot-click",

                    detail

                );


            return true;

        };


    /* =====================================================
       END OF PART 3

       NEXT PART:

       57. addLayer
       58. removeLayer
       59. clearLayers
       60. render
       61. applyMode
       62. showSource
       63. showTarget
       64. showBoth
       65. hide / show / toggle
       66. refresh
       67. fitBounds
       68. getLayerStatus
       69. dispatchEvent
       70. destroy
       71. module registration

       IMPORTANT:
       Do NOT close the IIFE here.
       Part 4 continues directly below.
       ===================================================== 

       /* =====================================================
       57. ADD LAYER
       ===================================================== */

    MapRenderer.addLayer =
        function (

            layer

        ) {

            if (

                !MapRenderer.map ||

                !layer

            ) {

                return false;

            }


            if (

                typeof MapRenderer.map
                    .hasLayer ===
                    "function" &&

                MapRenderer.map
                    .hasLayer(
                        layer
                    )

            ) {

                return true;

            }


            try {

                layer.addTo(
                    MapRenderer.map
                );


                return true;

            }

            catch (
                error
            ) {

                console.error(

                    "[OffenceMapRenderer] " +
                    "Failed to add layer.",

                    error

                );


                return false;

            }

        };


    /* =====================================================
       58. REMOVE LAYER
       ===================================================== */

    MapRenderer.removeLayer =
        function (

            layer

        ) {

            if (

                !MapRenderer.map ||

                !layer

            ) {

                return false;

            }


            try {

                if (

                    typeof MapRenderer.map
                        .hasLayer ===
                        "function" &&

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

            }

            catch (
                error
            ) {

                console.error(

                    "[OffenceMapRenderer] " +
                    "Failed to remove layer.",

                    error

                );


                return false;

            }

        };


    /* =====================================================
       59. CLEAR LAYERS

       Removes all offence layers from the map and clears
       internal marker/polygon groups.

       Layer group objects themselves are preserved so the
       renderer can reuse them on refresh.
       ===================================================== */

    MapRenderer.clearLayers =
        function () {

            /* -------------------------------------------------
               Remove point heat layers
               ------------------------------------------------- */

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


            MapRenderer.layers
                .sourceHeatLayer =
                null;


            MapRenderer.layers
                .targetHeatLayer =
                null;


            /* -------------------------------------------------
               Remove interaction marker groups
               ------------------------------------------------- */

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


            /* -------------------------------------------------
               Remove GIS polygon groups
               ------------------------------------------------- */

            MapRenderer
                .removeLayer(

                    MapRenderer.layers
                        .sourcePolygonLayer

                );


            MapRenderer
                .removeLayer(

                    MapRenderer.layers
                        .targetPolygonLayer

                );


            if (

                MapRenderer.layers
                    .sourcePolygonLayer &&

                typeof MapRenderer.layers
                    .sourcePolygonLayer
                    .clearLayers ===
                    "function"

            ) {

                MapRenderer.layers
                    .sourcePolygonLayer
                    .clearLayers();

            }


            if (

                MapRenderer.layers
                    .targetPolygonLayer &&

                typeof MapRenderer.layers
                    .targetPolygonLayer
                    .clearLayers ===
                    "function"

            ) {

                MapRenderer.layers
                    .targetPolygonLayer
                    .clearLayers();

            }


            MapRenderer.rendered =
                false;


            MapRenderer.visible =
                false;


            return true;

        };


    /* =====================================================
       60. RENDER

       Canonical rendering pipeline:

       HeatmapEngine
           ↓
       getCanonicalData()
           │
           ├── sourcePoints
           │       ↓
           │   Leaflet.heat
           │   Interaction markers
           │
           ├── targetPoints
           │       ↓
           │   Leaflet.heat
           │   Interaction markers
           │
           ├── sourcePolygons
           │       ↓
           │   Compartment / Range GeoJSON
           │
           └── targetPolygons
                   ↓
               Compartment / Range GeoJSON

       IMPORTANT:

       The renderer never decides whether an offence is:

       POINT
       COMPARTMENT
       RANGE

       That decision belongs exclusively to
       OffenceHeatmapEngine v3.
       ===================================================== */

    MapRenderer.render =
        function () {

            if (

                MapRenderer.rendering

            ) {

                MapRenderer.debug(

                    "Render already in progress."

                );


                return false;

            }


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


            if (

                !MapRenderer.map

            ) {

                console.error(

                    "[OffenceMapRenderer] " +
                    "Cannot render without Leaflet map."

                );


                return false;

            }


            MapRenderer.rendering =
                true;


            try {

                /* -------------------------------------------------
                   Get canonical HeatmapEngine v3 output
                   ------------------------------------------------- */

                const data =

                    MapRenderer
                        .getCanonicalData();


                /* -------------------------------------------------
                   POINT HEAT DATA
                   ------------------------------------------------- */

                const sourceHeat =

                    MapRenderer
                        .getSourceHeatData(
                            data
                        );


                const targetHeat =

                    MapRenderer
                        .getTargetHeatData(
                            data
                        );


                /* -------------------------------------------------
                   Create Leaflet.heat layers
                   ------------------------------------------------- */

                MapRenderer
                    .createSourceHeatLayer(

                        sourceHeat

                    );


                MapRenderer
                    .createTargetHeatLayer(

                        targetHeat

                    );


                /* -------------------------------------------------
                   Build POINT interaction markers

                   Use canonical spatial point objects,
                   not sourceHeat/targetHeat arrays.

                   This preserves POR metadata.
                   ------------------------------------------------- */

                const sourceMarkerCount =

                    MapRenderer
                        .buildSourceMarkers(

                            data.sourcePoints

                        );


                const targetMarkerCount =

                    MapRenderer
                        .buildTargetMarkers(

                            data.targetPoints

                        );


                /* -------------------------------------------------
                   Build SOURCE polygons

                   Priority:
                   sourcePolygons

                   Fallback:
                   sourceCompartments + sourceRanges
                   ------------------------------------------------- */

                const sourcePolygonCount =

                    MapRenderer
                        .buildSourcePolygons(

                            data.sourcePolygons,

                            data.sourceCompartments,

                            data.sourceRanges

                        );


                /* -------------------------------------------------
                   Build TARGET polygons
                   ------------------------------------------------- */

                const targetPolygonCount =

                    MapRenderer
                        .buildTargetPolygons(

                            data.targetPolygons,

                            data.targetCompartments,

                            data.targetRanges

                        );


                /* -------------------------------------------------
                   Mark renderer ready before mode application.
                   ------------------------------------------------- */

                MapRenderer.rendered =
                    true;


                MapRenderer.lastRenderAt =
                    Date.now();


                /* -------------------------------------------------
                   Apply current HeatmapEngine mode
                   ------------------------------------------------- */

                MapRenderer
                    .applyMode();


                MapRenderer.debug(

                    "Rendered",

                    {

                        sourceHeatPoints:

                            sourceHeat.length,

                        targetHeatPoints:

                            targetHeat.length,

                        sourceMarkers:

                            sourceMarkerCount,

                        targetMarkers:

                            targetMarkerCount,

                        sourcePolygons:

                            sourcePolygonCount,

                        targetPolygons:

                            targetPolygonCount,

                        sourceCompartments:

                            data
                                .sourceCompartments
                                .length,

                        targetCompartments:

                            data
                                .targetCompartments
                                .length,

                        sourceRanges:

                            data
                                .sourceRanges
                                .length,

                        targetRanges:

                            data
                                .targetRanges
                                .length,

                        mode:

                            MapRenderer
                                .getMode()

                    }

                );


                return true;

            }

            catch (
                error
            ) {

                MapRenderer.rendered =
                    false;


                console.error(

                    "[OffenceMapRenderer] " +
                    "Render failed.",

                    error

                );


                return false;

            }

            finally {

                MapRenderer.rendering =
                    false;

            }

        };


    /* =====================================================
       61. APPLY MODE

       SOURCE:
       - source point heat
       - source point markers
       - source GIS polygons

       TARGET:
       - target point heat
       - target point markers
       - target GIS polygons

       BOTH:
       - all source layers
       - all target layers
       ===================================================== */

    MapRenderer.applyMode =
        function () {

            if (

                !MapRenderer.initialized ||

                !MapRenderer.map

            ) {

                return false;

            }


            const mode =

                String(

                    MapRenderer
                        .getMode() ||

                    MapRenderer
                        .MODE
                        .BOTH

                )

                    .trim()

                    .toUpperCase();


            if (

                mode ===
                MapRenderer.MODE.SOURCE

            ) {

                return MapRenderer
                    .showSource();

            }


            if (

                mode ===
                MapRenderer.MODE.TARGET

            ) {

                return MapRenderer
                    .showTarget();

            }


            return MapRenderer
                .showBoth();

        };


    /* =====================================================
       62. SHOW SOURCE
       ===================================================== */

    MapRenderer.showSource =
        function () {

            if (

                !MapRenderer.map

            ) {

                return false;

            }


            /* -------------------------------------------------
               Remove TARGET
               ------------------------------------------------- */

            MapRenderer
                .removeLayer(

                    MapRenderer.layers
                        .targetHeatLayer

                );


            MapRenderer
                .removeLayer(

                    MapRenderer.layers
                        .targetMarkerLayer

                );


            MapRenderer
                .removeLayer(

                    MapRenderer.layers
                        .targetPolygonLayer

                );


            /* -------------------------------------------------
               Add SOURCE
               ------------------------------------------------- */

            MapRenderer
                .addLayer(

                    MapRenderer.layers
                        .sourcePolygonLayer

                );


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


            MapRenderer.visible =
                true;


            return true;

        };


    /* =====================================================
       63. SHOW TARGET
       ===================================================== */

    MapRenderer.showTarget =
        function () {

            if (

                !MapRenderer.map

            ) {

                return false;

            }


            /* -------------------------------------------------
               Remove SOURCE
               ------------------------------------------------- */

            MapRenderer
                .removeLayer(

                    MapRenderer.layers
                        .sourceHeatLayer

                );


            MapRenderer
                .removeLayer(

                    MapRenderer.layers
                        .sourceMarkerLayer

                );


            MapRenderer
                .removeLayer(

                    MapRenderer.layers
                        .sourcePolygonLayer

                );


            /* -------------------------------------------------
               Add TARGET
               ------------------------------------------------- */

            MapRenderer
                .addLayer(

                    MapRenderer.layers
                        .targetPolygonLayer

                );


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


            MapRenderer.visible =
                true;


            return true;

        };


    /* =====================================================
       64. SHOW BOTH
       ===================================================== */

    MapRenderer.showBoth =
        function () {

            if (

                !MapRenderer.map

            ) {

                return false;

            }


            /*
             * Polygon layers first.
             *
             * Point heat and interaction markers are added
             * afterwards.
             */

            MapRenderer
                .addLayer(

                    MapRenderer.layers
                        .sourcePolygonLayer

                );


            MapRenderer
                .addLayer(

                    MapRenderer.layers
                        .targetPolygonLayer

                );


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


            MapRenderer.visible =
                true;


            return true;

        };


    /* =====================================================
       65. HIDE
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


            MapRenderer
                .removeLayer(

                    MapRenderer.layers
                        .sourcePolygonLayer

                );


            MapRenderer
                .removeLayer(

                    MapRenderer.layers
                        .targetPolygonLayer

                );


MapRenderer.visible =
    false;


// =============================================
// RESTORE NORMAL GIS INTERACTION
// =============================================

if (

    typeof window
        .setOffenceMapInteractionMode ===
        "function"

) {

    window
        .setOffenceMapInteractionMode(
            false
        );

}


return true;

};


    /* =====================================================
       66. SHOW
       ===================================================== */

/* =====================================================
   66. SHOW
   ===================================================== */

MapRenderer.show =
    function () {

        let result;


        // =============================================
        // 1. RENDER IF NOT YET RENDERED
        // =============================================

        if (

            !MapRenderer.rendered

        ) {

            result =

                MapRenderer
                    .render();

        }

        else {

            // =========================================
            // 2. APPLY CURRENT SOURCE/TARGET MODE
            // =========================================

            result =

                MapRenderer
                    .applyMode();

        }


        // =============================================
        // 3. GIVE MAP INTERACTION TO OFFENCE LAYERS
        //
        // Normal GIS remains visible,
        // but offence polygons receive pointer clicks.
        // =============================================

        if (

            typeof window
                .setOffenceMapInteractionMode ===
                "function"

        ) {

            window
                .setOffenceMapInteractionMode(
                    true
                );

        }


        // =============================================
        // 4. RETURN ORIGINAL RESULT
        // =============================================

        return result;

    };


    /* =====================================================
       67. TOGGLE
       ===================================================== */

    MapRenderer.toggle =
        function () {

            if (

                MapRenderer.visible

            ) {

                return MapRenderer
                    .hide();

            }


            return MapRenderer
                .show();

        };


    /* =====================================================
       68. REFRESH

       Rebuild all Leaflet rendering from the current
       canonical HeatmapEngine state.
       ===================================================== */

    MapRenderer.refresh =
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


            return MapRenderer
                .render();

        };


    /* =====================================================
       69. FIT BOUNDS

       Fits map to all currently available offence layers.

       Includes:

       - source point markers
       - target point markers
       - source polygons
       - target polygons

       Leaflet.heat layers do not expose useful bounds,
       therefore their corresponding point marker groups
       provide the point bounds.
       ===================================================== */

    MapRenderer.fitBounds =
        function (

            options = {}

        ) {

            if (

                !MapRenderer.map ||

                typeof window.L ===
                    "undefined"

            ) {

                return false;

            }


            const bounds =

                L.latLngBounds(
                    []
                );


            const extendLayerBounds =

                function (

                    layer

                ) {

                    if (

                        !layer

                    ) {

                        return;

                    }


                    /*
                     * GeoJSON / FeatureGroup / LayerGroup
                     * may expose getBounds().
                     */

                    if (

                        typeof layer
                            .getBounds ===
                        "function"

                    ) {

                        try {

                            const layerBounds =

                                layer
                                    .getBounds();


                            if (

                                layerBounds &&

                                typeof layerBounds
                                    .isValid ===
                                    "function" &&

                                layerBounds
                                    .isValid()

                            ) {

                                bounds.extend(
                                    layerBounds
                                );

                            }

                        }

                        catch (
                            error
                        ) {

                            /*
                             * Ignore invalid individual
                             * layer bounds.
                             */

                        }

                    }


                    /*
                     * LayerGroup fallback.
                     */

                    if (

                        typeof layer
                            .eachLayer ===
                        "function"

                    ) {

                        layer.eachLayer(

                            function (

                                child

                            ) {

                                if (

                                    typeof child
                                        .getLatLng ===
                                        "function"

                                ) {

                                    try {

                                        bounds.extend(

                                            child
                                                .getLatLng()

                                        );

                                    }

                                    catch (
                                        error
                                    ) {

                                        /*
                                         * Ignore invalid child.
                                         */

                                    }

                                }


                                if (

                                    typeof child
                                        .getBounds ===
                                        "function"

                                ) {

                                    try {

                                        const childBounds =

                                            child
                                                .getBounds();


                                        if (

                                            childBounds &&

                                            typeof childBounds
                                                .isValid ===
                                                "function" &&

                                            childBounds
                                                .isValid()

                                        ) {

                                            bounds.extend(
                                                childBounds
                                            );

                                        }

                                    }

                                    catch (
                                        error
                                    ) {

                                        /*
                                         * Ignore invalid child.
                                         */

                                    }

                                }

                            }

                        );

                    }

                };


            extendLayerBounds(

                MapRenderer.layers
                    .sourceMarkerLayer

            );


            extendLayerBounds(

                MapRenderer.layers
                    .targetMarkerLayer

            );


            extendLayerBounds(

                MapRenderer.layers
                    .sourcePolygonLayer

            );


            extendLayerBounds(

                MapRenderer.layers
                    .targetPolygonLayer

            );


            if (

                !bounds.isValid()

            ) {

                return false;

            }


            const fitOptions = {

                padding:

                    options.padding ||

                    [

                        30,

                        30

                    ],

                maxZoom:

                    options.maxZoom ??

                    15

            };


            MapRenderer.map
                .fitBounds(

                    bounds,

                    fitOptions

                );


            return true;

        };


    /* =====================================================
       70. GET LAYER COUNT
       ===================================================== */

    MapRenderer.getLayerCount =
        function (

            layer

        ) {

            if (

                !layer

            ) {

                return 0;

            }


            if (

                typeof layer
                    .getLayers ===
                "function"

            ) {

                try {

                    return layer
                        .getLayers()
                        .length;

                }

                catch (
                    error
                ) {

                    return 0;

                }

            }


            return 0;

        };


    /* =====================================================
       71. GET LAYER STATUS

       Useful for runtime diagnostics.
       ===================================================== */

    MapRenderer.getLayerStatus =
        function () {

            const map =

                MapRenderer.map;


            const hasLayer =

                function (

                    layer

                ) {

                    if (

                        !map ||

                        !layer ||

                        typeof map
                            .hasLayer !==
                            "function"

                    ) {

                        return false;

                    }


                    try {

                        return map
                            .hasLayer(
                                layer
                            );

                    }

                    catch (
                        error
                    ) {

                        return false;

                    }

                };


            return {

                version:

                    MapRenderer.VERSION,

                connector:

                    MapRenderer.CONNECTOR,

                authoritativeConnector:

                    MapRenderer
                        .AUTHORITATIVE_CONNECTOR,

                spatialModel:

                    MapRenderer
                        .SPATIAL_MODEL,

                initialized:

                    MapRenderer.initialized,

                rendered:

                    MapRenderer.rendered,

                rendering:

                    MapRenderer.rendering,

                visible:

                    MapRenderer.visible,

                mode:

                    MapRenderer
                        .getMode(),

                lastRenderAt:

                    MapRenderer
                        .lastRenderAt,

                leaflet:

                    typeof window.L ===
                    "object",

                leafletHeat:

                    typeof window.L
                        ?.heatLayer ===
                    "function",

                sourceHeatLayer:

                    !!MapRenderer.layers
                        .sourceHeatLayer,

                targetHeatLayer:

                    !!MapRenderer.layers
                        .targetHeatLayer,

                sourceHeatVisible:

                    hasLayer(

                        MapRenderer.layers
                            .sourceHeatLayer

                    ),

                targetHeatVisible:

                    hasLayer(

                        MapRenderer.layers
                            .targetHeatLayer

                    ),

                sourceMarkerCount:

                    MapRenderer
                        .getLayerCount(

                            MapRenderer.layers
                                .sourceMarkerLayer

                        ),

                targetMarkerCount:

                    MapRenderer
                        .getLayerCount(

                            MapRenderer.layers
                                .targetMarkerLayer

                        ),

                sourcePolygonCount:

                    MapRenderer
                        .getLayerCount(

                            MapRenderer.layers
                                .sourcePolygonLayer

                        ),

                targetPolygonCount:

                    MapRenderer
                        .getLayerCount(

                            MapRenderer.layers
                                .targetPolygonLayer

                        ),

                sourceMarkersVisible:

                    hasLayer(

                        MapRenderer.layers
                            .sourceMarkerLayer

                    ),

                targetMarkersVisible:

                    hasLayer(

                        MapRenderer.layers
                            .targetMarkerLayer

                    ),

                sourcePolygonsVisible:

                    hasLayer(

                        MapRenderer.layers
                            .sourcePolygonLayer

                    ),

                targetPolygonsVisible:

                    hasLayer(

                        MapRenderer.layers
                            .targetPolygonLayer

                    )

            };

        };


    /* =====================================================
       72. DISPATCH EVENT
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

                console.error(

                    "[OffenceMapRenderer] " +
                    "Event dispatch failed.",

                    {

                        eventName:
                            eventName,

                        error:
                            error

                    }

                );


                return false;

            }

        };


    /* =====================================================
       73. DESTROY
       ===================================================== */

    MapRenderer.destroy =
        function () {

            MapRenderer
                .hide();


            MapRenderer
                .unbindEvents();


            /*
             * Clear all group contents.
             */

            if (

                MapRenderer.layers
                    .sourceMarkerLayer

            ) {

                MapRenderer.layers
                    .sourceMarkerLayer
                    .clearLayers();

            }


            if (

                MapRenderer.layers
                    .targetMarkerLayer

            ) {

                MapRenderer.layers
                    .targetMarkerLayer
                    .clearLayers();

            }


            if (

                MapRenderer.layers
                    .sourcePolygonLayer

            ) {

                MapRenderer.layers
                    .sourcePolygonLayer
                    .clearLayers();

            }


            if (

                MapRenderer.layers
                    .targetPolygonLayer

            ) {

                MapRenderer.layers
                    .targetPolygonLayer
                    .clearLayers();

            }


            /*
             * Reset layer references.
             */

            MapRenderer.layers = {

                sourceHeatLayer:
                    null,

                targetHeatLayer:
                    null,

                sourceMarkerLayer:
                    null,

                targetMarkerLayer:
                    null,

                sourcePolygonLayer:
                    null,

                targetPolygonLayer:
                    null

            };


            MapRenderer.map =
                null;


            MapRenderer.initialized =
                false;


            MapRenderer.rendered =
                false;


            MapRenderer.visible =
                false;


            MapRenderer.rendering =
                false;


            MapRenderer.lastRenderAt =
                null;


            MapRenderer.debug(

                "Destroyed"

            );


            return true;

        };


    /* =====================================================
       74. REGISTER MODULE
       ===================================================== */

    GG.Offence.MapRenderer =
        MapRenderer;


    /* =====================================================
       75. MODULE READY LOG
       ===================================================== */

    MapRenderer.debug(

        "Module loaded",

        {

            version:

                MapRenderer.VERSION,

            connector:

                MapRenderer.CONNECTOR,

            authoritativeConnector:

                MapRenderer
                    .AUTHORITATIVE_CONNECTOR,

            spatialModel:

                MapRenderer
                    .SPATIAL_MODEL

        }

    );


})();


/* =========================================================
   END OF FILE
   offenceMapRenderer.js
   ========================================================= */
