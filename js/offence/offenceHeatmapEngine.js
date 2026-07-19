/* =========================================================
   GREENGUARD
   OFFENCE HEATMAP ENGINE
   Version 3.0.0

   AUTHORITATIVE RELATIONSHIP:
   POR / porKey

   SPATIAL RESOLUTION PRIORITY:
   POINT > COMPARTMENT > RANGE > UNMAPPED

   BUSINESS DATA:
   SourceEngine / TargetEngine hotspots remain canonical.

   SPATIAL DATA:
   Point / Compartment / Range representations are derived
   from canonical hotspots and GIS context.

   IMPORTANT:
   GIS polygons do NOT replace source/target hotspots.
   They are spatial representations of those hotspots.
   ========================================================= */

(function () {

    "use strict";


    window.GG =
        window.GG || {};


    GG.Offence =
        GG.Offence || {};


    const Offence =
        GG.Offence;


    const Constants =
        Offence.Constants || {};


    const HeatmapEngine = {

        VERSION:
            "3.0.0",


        initialized:
            false,


        building:
            false,


        ready:
            false,


        lastBuildAt:
            null,


        MODE: {

            SOURCE:
                "SOURCE",

            TARGET:
                "TARGET",

            BOTH:
                "BOTH"

        },


        mode:
            "BOTH",


        /*
         * Canonical business data.
         *
         * These arrays contain the ORIGINAL
         * SourceEngine / TargetEngine hotspots.
         */

        data: {

            resolvedContexts:
                [],

            sources:
                [],

            targets:
                [],

            links:
                []

        },


        /*
         * Spatial representations.
         *
         * These are separate from canonical
         * source/target hotspot data.
         */

        spatial: {

            sourcePoints:
                [],

            targetPoints:
                [],


            sourceCompartments:
                [],

            targetCompartments:
                [],


            sourceRanges:
                [],

            targetRanges:
                [],


            unmappedSources:
                [],

            unmappedTargets:
                []

        },


        /*
         * Relationship indexes.
         */

        hotspotIndex:
            new Map(),


        porIndex:
            new Map(),


        caseIndex:
            new Map(),


        /*
         * Spatial indexes.
         */

        compartmentIndex:
            new Map(),


        rangeIndex:
            new Map(),


        gisFeatureIndex:
            new Map()

    };


    /* =====================================================
       INITIALIZATION
       ===================================================== */


    HeatmapEngine.init =
        function () {

            if (
                HeatmapEngine.initialized
            ) {

                return HeatmapEngine;

            }


            HeatmapEngine.initialized =
                true;


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(

                    "🔥 OffenceHeatmapEngine Ready",

                    {

                        version:
                            HeatmapEngine.VERSION,

                        relationshipModel:
                            Constants.RELATIONSHIP
                                ?.MODEL ||
                            "POR_AUTHORITATIVE",

                        spatialPriority:
                            "POINT > COMPARTMENT > RANGE"

                    }

                );

            }


            return HeatmapEngine;

        };


    /* =====================================================
       NORMALIZATION
       ===================================================== */


    HeatmapEngine.normalizeKey =
        function (

            value

        ) {

            if (
                value === null ||
                value === undefined
            ) {

                return "";

            }


            return String(
                value
            )
                .trim()
                .toUpperCase();

        };


    HeatmapEngine.normalizeSpatialKey =
        function (

            value

        ) {

            if (
                value === null ||
                value === undefined
            ) {

                return "";

            }


            return String(
                value
            )
                .trim()
                .toUpperCase()
                .replace(
                    /[^A-Z0-9]/g,
                    ""
                );

        };


    HeatmapEngine.normalizePorKey =
        function (

            value

        ) {

            if (
                value === null ||
                value === undefined
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


    /*
     * Normalize known Range abbreviations.
     *
     * Extend aliases when required.
     */

    HeatmapEngine.normalizeRange =
        function (

            value

        ) {

            if (
                value === null ||
                value === undefined
            ) {

                return "";

            }


            let key =

                String(
                    value
                )
                    .trim()
                    .toUpperCase();


            /*
             * Remove obvious POR suffix contamination.
             *
             * Example:
             *
             * HTG-15OF2014-15
             *
             * becomes:
             *
             * HTG
             */

            const knownPrefix =

                key.match(

                    /^(WRVK|WDPO|EDPO|PANA|NMT|HTG|ERVK|HQM|MW|RE|AFR\s*\(W\)|WLMSQ[\s-]*I{1,2})/

                );


            if (
                knownPrefix
            ) {

                key =
                    knownPrefix[1];

            }


            key =
                key
                    .replace(
                        /\s+/g,
                        ""
                    );


            const aliases = {

                "WRVK":
                    "WESTRAJABHATKHAWA",

                "WDPO":
                    "WESTDAMANPUR",

                "EDPO":
                    "EASTDAMANPUR",

                "PANA":
                    "PANA",

                "NMT":
                    "NIMATI",

                "HTG":
                    "HAMILTONGANJ",

                "ERVK":
                    "EASTRAJABHATKHAWA",

                "HQM":
                    "HQM",

                "MW":
                    "MW",

                "RE":
                    "RE",

                "AFR(W)":
                    "AFRW",

                "AFRW":
                    "AFRW",

                "WLMSQ-I":
                    "WLMSQI",

                "WLMSQI":
                    "WLMSQI",

                "WLMSQ-II":
                    "WLMSQII",

                "WLMSQII":
                    "WLMSQII"

            };


            return (

                aliases[key] ||

                HeatmapEngine
                    .normalizeSpatialKey(
                        key
                    )

            );

        };


    /* =====================================================
       ARRAY HELPERS
       ===================================================== */


    HeatmapEngine.addUnique =
        function (

            array,

            value,

            normalizer

        ) {

            if (
                !Array.isArray(
                    array
                )
            ) {

                return;

            }


            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {

                return;

            }


            const normalize =

                typeof normalizer ===
                "function"

                    ? normalizer

                    : HeatmapEngine
                        .normalizeKey;


            const target =

                normalize(
                    value
                );


            if (
                !target
            ) {

                return;

            }


            const exists =

                array.some(

                    item =>

                        normalize(
                            item
                        ) ===
                        target

                );


            if (
                !exists
            ) {

                array.push(
                    value
                );

            }

        };


    HeatmapEngine.addUniqueObject =
        function (

            array,

            object,

            idGetter

        ) {

            if (
                !Array.isArray(
                    array
                ) ||
                !object
            ) {

                return;

            }


            const getId =

                typeof idGetter ===
                "function"

                    ? idGetter

                    : item =>
                        item?.id;


            const id =

                HeatmapEngine
                    .normalizeKey(

                        getId(
                            object
                        )

                    );


            if (
                !id
            ) {

                return;

            }


            const exists =

                array.some(

                    item =>

                        HeatmapEngine
                            .normalizeKey(

                                getId(
                                    item
                                )

                            ) ===
                        id

                );


            if (
                !exists
            ) {

                array.push(
                    object
                );

            }

        };


    HeatmapEngine.toArray =
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
                value === null ||
                value === undefined ||
                value === ""
            ) {

                return [];

            }


            return [
                value
            ];

        };


    /* =====================================================
       ID HELPERS
       ===================================================== */


    HeatmapEngine.getCaseId =
        function (

            item

        ) {

            return (

                item?.caseId ||

                item?.case_id ||

                item?.id ||

                ""

            );

        };


    HeatmapEngine.getAccusedId =
        function (

            item

        ) {

            return (

                item?.accusedId ||

                item?.accused_id ||

                item?.id ||

                ""

            );

        };


    HeatmapEngine.getWitnessId =
        function (

            item

        ) {

            return (

                item?.witnessId ||

                item?.witness_id ||

                item?.id ||

                ""

            );

        };


    HeatmapEngine.getSeizureId =
        function (

            item

        ) {

            return (

                item?.seizureId ||

                item?.seizure_id ||

                item?.id ||

                ""

            );

        };


    HeatmapEngine.getArticleId =
        function (

            item

        ) {

            return (

                item?.articleId ||

                item?.article_id ||

                item?.id ||

                ""

            );

        };


    HeatmapEngine.getHotspotId =
        function (

            hotspot

        ) {

            if (
                !hotspot
            ) {

                return "";

            }


            return (

                hotspot.id ||

                hotspot.hotspotId ||

                hotspot.key ||

                ""

            );

        };


    /* =====================================================
       POR EXTRACTION
       ===================================================== */


    HeatmapEngine.extractPorKey =
        function (

            item

        ) {

            if (
                !item
            ) {

                return "";

            }


            return HeatmapEngine
                .normalizePorKey(

                    item.porKey ||

                    item.por_key ||

                    item.porNo ||

                    item.por_no ||

                    item.POR ||

                    ""

                );

        };


    HeatmapEngine.extractPorNo =
        function (

            item

        ) {

            if (
                !item
            ) {

                return "";

            }


            return (

                item.porNo ||

                item.por_no ||

                item.POR ||

                ""

            );

        };


    /* =====================================================
       RELATION CREATION
       ===================================================== */


    HeatmapEngine.createPorRelation =
        function (

            porKey

        ) {

            return {

                porKey:
                    porKey,

                porNo:
                    "",


                cases:
                    [],

                accused:
                    [],

                witnesses:
                    [],

                seizures:
                    [],

                articles:
                    [],


                sources:
                    [],

                targets:
                    [],


                sourceSpatial:
                    [],

                targetSpatial:
                    []

            };

        };


    HeatmapEngine.getOrCreatePorRelation =
        function (

            rawPorKey

        ) {

            const porKey =

                HeatmapEngine
                    .normalizePorKey(
                        rawPorKey
                    );


            if (
                !porKey
            ) {

                return null;

            }


            if (
                !HeatmapEngine
                    .porIndex
                    .has(
                        porKey
                    )
            ) {

                HeatmapEngine
                    .porIndex
                    .set(

                        porKey,

                        HeatmapEngine
                            .createPorRelation(
                                porKey
                            )

                    );

            }


            return HeatmapEngine
                .porIndex
                .get(
                    porKey
                );

        };


    HeatmapEngine.createCaseRelation =
        function (

            caseId

        ) {

            return {

                caseId:
                    caseId,

                porKeys:
                    [],

                sources:
                    [],

                targets:
                    []

            };

        };


    HeatmapEngine.getOrCreateCaseRelation =
        function (

            rawCaseId

        ) {

            const caseId =

                HeatmapEngine
                    .normalizeKey(
                        rawCaseId
                    );


            if (
                !caseId
            ) {

                return null;

            }


            if (
                !HeatmapEngine
                    .caseIndex
                    .has(
                        caseId
                    )
            ) {

                HeatmapEngine
                    .caseIndex
                    .set(

                        caseId,

                        HeatmapEngine
                            .createCaseRelation(
                                rawCaseId
                            )

                    );

            }


            return HeatmapEngine
                .caseIndex
                .get(
                    caseId
                );

        };


    /* =====================================================
       HOTSPOT REGISTRATION
       ===================================================== */


    HeatmapEngine.registerHotspot =
        function (

            type,

            hotspot

        ) {

            if (
                !hotspot
            ) {

                return false;

            }


            const hotspotId =

                HeatmapEngine
                    .getHotspotId(
                        hotspot
                    );


            const key =

                HeatmapEngine
                    .normalizeKey(
                        hotspotId
                    );


            if (
                !key
            ) {

                return false;

            }


            HeatmapEngine
                .hotspotIndex
                .set(

                    key,

                    {

                        type:
                            type,

                        hotspot:
                            hotspot

                    }

                );


            return true;

        };


    HeatmapEngine.registerSourceHotspot =
        function (

            hotspot

        ) {

            if (
                !hotspot
            ) {

                return;

            }


            HeatmapEngine
                .registerHotspot(

                    "SOURCE",

                    hotspot

                );


            const porKeys =

                Array.isArray(
                    hotspot.porKeys
                )

                    ? hotspot.porKeys

                    : hotspot.porKey

                        ? [
                            hotspot.porKey
                        ]

                        : [];


            for (
                const rawPorKey
                of porKeys
            ) {

                const porKey =

                    HeatmapEngine
                        .normalizePorKey(
                            rawPorKey
                        );


                if (
                    !porKey
                ) {

                    continue;

                }


                const relation =

                    HeatmapEngine
                        .getOrCreatePorRelation(
                            porKey
                        );


                HeatmapEngine
                    .addUniqueObject(

                        relation.sources,

                        hotspot,

                        HeatmapEngine
                            .getHotspotId

                    );

            }


            const caseIds =

                Array.isArray(
                    hotspot.caseIds
                )

                    ? hotspot.caseIds

                    : [];


            for (
                const caseId
                of caseIds
            ) {

                const relation =

                    HeatmapEngine
                        .getOrCreateCaseRelation(
                            caseId
                        );


                if (
                    !relation
                ) {

                    continue;

                }


                HeatmapEngine
                    .addUniqueObject(

                        relation.sources,

                        hotspot,

                        HeatmapEngine
                            .getHotspotId

                    );


                for (
                    const porKey
                    of porKeys
                ) {

                    HeatmapEngine
                        .addUnique(

                            relation.porKeys,

                            HeatmapEngine
                                .normalizePorKey(
                                    porKey
                                ),

                            HeatmapEngine
                                .normalizePorKey

                        );

                }

            }

        };


    HeatmapEngine.registerTargetHotspot =
        function (

            hotspot

        ) {

            if (
                !hotspot
            ) {

                return;

            }


            HeatmapEngine
                .registerHotspot(

                    "TARGET",

                    hotspot

                );


            const porKeys =

                Array.isArray(
                    hotspot.porKeys
                )

                    ? hotspot.porKeys

                    : hotspot.porKey

                        ? [
                            hotspot.porKey
                        ]

                        : [];


            for (
                const rawPorKey
                of porKeys
            ) {

                const porKey =

                    HeatmapEngine
                        .normalizePorKey(
                            rawPorKey
                        );


                if (
                    !porKey
                ) {

                    continue;

                }


                const relation =

                    HeatmapEngine
                        .getOrCreatePorRelation(
                            porKey
                        );


                HeatmapEngine
                    .addUniqueObject(

                        relation.targets,

                        hotspot,

                        HeatmapEngine
                            .getHotspotId

                    );

            }


            const caseIds =

                Array.isArray(
                    hotspot.caseIds
                )

                    ? hotspot.caseIds

                    : [];


            for (
                const caseId
                of caseIds
            ) {

                const relation =

                    HeatmapEngine
                        .getOrCreateCaseRelation(
                            caseId
                        );


                if (
                    !relation
                ) {

                    continue;

                }


                HeatmapEngine
                    .addUniqueObject(

                        relation.targets,

                        hotspot,

                        HeatmapEngine
                            .getHotspotId

                    );


                for (
                    const porKey
                    of porKeys
                ) {

                    HeatmapEngine
                        .addUnique(

                            relation.porKeys,

                            HeatmapEngine
                                .normalizePorKey(
                                    porKey
                                ),

                            HeatmapEngine
                                .normalizePorKey

                        );

                }

            }

        };


    /* =====================================================
       GIS FEATURE HELPERS
       ===================================================== */


    HeatmapEngine.getGISFeatures =
        function () {

            /*
             * Support several existing GreenGuard
             * GIS storage locations.
             *
             * This prevents HeatmapEngine from being
             * tightly coupled to one GIS module.
             */

            const candidates = [

                GG.GIS
                    ?.features,

                GG.GIS
                    ?.data
                    ?.features,

                GG.Analytics
                    ?.gis,

                GG.AnalyticsEngine
                    ?.gis,

                window.gisFeatures,

                window.allGISFeatures

            ];


            for (
                const candidate
                of candidates
            ) {

                if (
                    Array.isArray(
                        candidate
                    )
                ) {

                    return candidate;

                }


                if (
                    candidate?.type ===
                    "FeatureCollection" &&
                    Array.isArray(
                        candidate.features
                    )
                ) {

                    return candidate.features;

                }

            }


            return [];

        };


    HeatmapEngine.getFeatureProperties =
        function (

            feature

        ) {

            return (

                feature?.properties ||

                feature?.data ||

                feature ||

                {}

            );

        };


    HeatmapEngine.getCompartmentName =
        function (

            feature

        ) {

            const p =

                HeatmapEngine
                    .getFeatureProperties(
                        feature
                    );


            return (

                p.Compartment ||

                p.compartment ||

                p.COMPARTMENT ||

                p.name ||

                ""

            );

        };


    HeatmapEngine.getRangeName =
        function (

            feature

        ) {

            const p =

                HeatmapEngine
                    .getFeatureProperties(
                        feature
                    );


            return (

                p.Range ||

                p.range ||

                p.RANGE ||

                ""

            );

        };


    HeatmapEngine.buildSpatialIndexes =
        function (

            features

        ) {

            HeatmapEngine
                .compartmentIndex
                .clear();


            HeatmapEngine
                .rangeIndex
                .clear();


            HeatmapEngine
                .gisFeatureIndex
                .clear();


            for (
                const feature
                of features
            ) {

                if (
                    !feature
                ) {

                    continue;

                }


                const properties =

                    HeatmapEngine
                        .getFeatureProperties(
                            feature
                        );


                const featureId =

                    feature.id ||

                    properties[
                        "GIS Feature ID"
                    ] ||

                    properties.gisFeatureId ||

                    "";


                if (
                    featureId
                ) {

                    HeatmapEngine
                        .gisFeatureIndex
                        .set(

                            HeatmapEngine
                                .normalizeKey(
                                    featureId
                                ),

                            feature

                        );

                }


                const compartment =

                    HeatmapEngine
                        .getCompartmentName(
                            feature
                        );


                const compartmentKey =

                    HeatmapEngine
                        .normalizeSpatialKey(
                            compartment
                        );


                if (
                    compartmentKey
                ) {

                    HeatmapEngine
                        .compartmentIndex
                        .set(

                            compartmentKey,

                            feature

                        );

                }


                const range =

                    HeatmapEngine
                        .getRangeName(
                            feature
                        );


                const rangeKey =

                    HeatmapEngine
                        .normalizeRange(
                            range
                        );


                if (
                    rangeKey
                ) {

                    if (
                        !HeatmapEngine
                            .rangeIndex
                            .has(
                                rangeKey
                            )
                    ) {

                        HeatmapEngine
                            .rangeIndex
                            .set(

                                rangeKey,

                                []

                            );

                    }


                    HeatmapEngine
                        .rangeIndex
                        .get(
                            rangeKey
                        )
                        .push(
                            feature
                        );

                }

            }


            return {

                features:
                    features.length,

                compartments:
                    HeatmapEngine
                        .compartmentIndex
                        .size,

                ranges:
                    HeatmapEngine
                        .rangeIndex
                        .size

            };

        };


    /* =====================================================
       POINT VALIDATION
       ===================================================== */


    HeatmapEngine.getCoordinates =
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


            /*
             * IMPORTANT:
             *
             * Number(undefined) becomes NaN.
             * Number(null) becomes 0.
             *
             * 0,0 is NOT a valid offence location
             * for this system and must not become
             * a Leaflet heat point.
             */

            if (
                !Number.isFinite(
                    latitude
                ) ||
                !Number.isFinite(
                    longitude
                ) ||
                latitude === 0 ||
                longitude === 0 ||
                latitude < -90 ||
                latitude > 90 ||
                longitude < -180 ||
                longitude > 180
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
       SPATIAL FIELD EXTRACTION
       ===================================================== */


    HeatmapEngine.extractCompartment =
        function (

            hotspot

        ) {

            if (
                !hotspot
            ) {

                return "";

            }


            return (

                hotspot.compartment ||

                hotspot.Compartment ||

                hotspot.targetCompartment ||

                hotspot.offenceCompartment ||

                hotspot.location
                    ?.compartment ||

                ""

            );

        };


    HeatmapEngine.extractRange =
        function (

            hotspot

        ) {

            if (
                !hotspot
            ) {

                return "";

            }


            return (

                hotspot.range ||

                hotspot.Range ||

                hotspot.rangeName ||

                hotspot.targetRange ||

                hotspot.offenceRange ||

                hotspot.location
                    ?.range ||

                ""

            );

        };


    /* =====================================================
       COMPARTMENT MATCHING
       ===================================================== */


    HeatmapEngine.findCompartmentFeature =
        function (

            rawCompartment

        ) {

            const key =

                HeatmapEngine
                    .normalizeSpatialKey(
                        rawCompartment
                    );


            if (
                !key
            ) {

                return null;

            }


            /*
             * Exact canonical match first.
             */

            if (
                HeatmapEngine
                    .compartmentIndex
                    .has(
                        key
                    )
            ) {

                return HeatmapEngine
                    .compartmentIndex
                    .get(
                        key
                    );

            }


            /*
             * Conservative fallback.
             *
             * Avoid broad fuzzy matching because
             * BL1 / BL2 names repeat across ranges.
             */

            for (
                const [
                    compartmentKey,
                    feature
                ]
                of HeatmapEngine
                    .compartmentIndex
            ) {

                if (
                    compartmentKey ===
                    key
                ) {

                    return feature;

                }

            }


            return null;

        };


    /* =====================================================
       RANGE MATCHING
       ===================================================== */


    HeatmapEngine.findRangeFeatures =
        function (

            rawRange

        ) {

            const key =

                HeatmapEngine
                    .normalizeRange(
                        rawRange
                    );


            if (
                !key
            ) {

                return [];

            }


            return (

                HeatmapEngine
                    .rangeIndex
                    .get(
                        key
                    ) ||

                []

            );

        };


    /* =====================================================
       SPATIAL RESOLUTION
       ===================================================== */


    HeatmapEngine.resolveSpatialRepresentation =
        function (

            hotspot,

            type

        ) {

            if (
                !hotspot
            ) {

                return {

                    type:
                        "UNMAPPED",

                    hotspot:
                        hotspot

                };

            }


            /*
             * PRIORITY 1
             * Exact GPS point.
             */

            const coordinates =

                HeatmapEngine
                    .getCoordinates(
                        hotspot
                    );


            if (
                coordinates
            ) {

                return {

                    spatialType:
                        "POINT",

                    type:
                        type,

                    hotspot:
                        hotspot,

                    latitude:
                        coordinates.latitude,

                    longitude:
                        coordinates.longitude,

                    heatWeight:
                        hotspot.heatWeight ||
                        1,

                    porKey:
                        hotspot.porKey ||
                        "",

                    porKeys:
                        hotspot.porKeys ||
                        [],

                    caseIds:
                        hotspot.caseIds ||
                        []

                };

            }


            /*
             * PRIORITY 2
             * Compartment polygon.
             */

            const compartment =

                HeatmapEngine
                    .extractCompartment(
                        hotspot
                    );


            if (
                compartment
            ) {

                const feature =

                    HeatmapEngine
                        .findCompartmentFeature(
                            compartment
                        );


                if (
                    feature
                ) {

                    return {

                        spatialType:
                            "COMPARTMENT",

                        type:
                            type,

                        hotspot:
                            hotspot,

                        compartment:
                            compartment,

                        feature:
                            feature,

                        heatWeight:
                            hotspot.heatWeight ||
                            1,

                        porKey:
                            hotspot.porKey ||
                            "",

                        porKeys:
                            hotspot.porKeys ||
                            [],

                        caseIds:
                            hotspot.caseIds ||
                            []

                    };

                }

            }


            /*
             * PRIORITY 3
             * Range polygon fallback.
             */

            const range =

                HeatmapEngine
                    .extractRange(
                        hotspot
                    );


            if (
                range
            ) {

                const features =

                    HeatmapEngine
                        .findRangeFeatures(
                            range
                        );


                if (
                    features.length
                ) {

                    return {

                        spatialType:
                            "RANGE",

                        type:
                            type,

                        hotspot:
                            hotspot,

                        range:
                            range,

                        rangeKey:
                            HeatmapEngine
                                .normalizeRange(
                                    range
                                ),

                        features:
                            features,

                        heatWeight:
                            hotspot.heatWeight ||
                            1,

                        porKey:
                            hotspot.porKey ||
                            "",

                        porKeys:
                            hotspot.porKeys ||
                            [],

                        caseIds:
                            hotspot.caseIds ||
                            []

                    };

                }

            }


            /*
             * No usable spatial representation.
             */

            return {

                spatialType:
                    "UNMAPPED",

                type:
                    type,

                hotspot:
                    hotspot,

                porKey:
                    hotspot.porKey ||
                    "",

                porKeys:
                    hotspot.porKeys ||
                    [],

                caseIds:
                    hotspot.caseIds ||
                    []

            };

        };


    /* =====================================================
       SPATIAL REGISTRATION
       ===================================================== */


    HeatmapEngine.registerSpatial =
        function (

            spatial,

            type

        ) {

            if (
                !spatial
            ) {

                return;

            }


            const isSource =

                type ===
                "SOURCE";


            switch (
                spatial.spatialType
            ) {

                case "POINT":

                    (

                        isSource

                            ? HeatmapEngine
                                .spatial
                                .sourcePoints

                            : HeatmapEngine
                                .spatial
                                .targetPoints

                    )
                        .push(
                            spatial
                        );

                    break;


                case "COMPARTMENT":

                    (

                        isSource

                            ? HeatmapEngine
                                .spatial
                                .sourceCompartments

                            : HeatmapEngine
                                .spatial
                                .targetCompartments

                    )
                        .push(
                            spatial
                        );

                    break;


                case "RANGE":

                    (

                        isSource

                            ? HeatmapEngine
                                .spatial
                                .sourceRanges

                            : HeatmapEngine
                                .spatial
                                .targetRanges

                    )
                        .push(
                            spatial
                        );

                    break;


                default:

                    (

                        isSource

                            ? HeatmapEngine
                                .spatial
                                .unmappedSources

                            : HeatmapEngine
                                .spatial
                                .unmappedTargets

                    )
                        .push(
                            spatial
                        );

            }


            const porKeys =

                spatial.porKeys?.length

                    ? spatial.porKeys

                    : spatial.porKey

                        ? [
                            spatial.porKey
                        ]

                        : [];


            for (
                const rawPorKey
                of porKeys
            ) {

                const relation =

                    HeatmapEngine
                        .getOrCreatePorRelation(
                            rawPorKey
                        );


                if (
                    !relation
                ) {

                    continue;

                }


                const collection =

                    isSource

                        ? relation
                            .sourceSpatial

                        : relation
                            .targetSpatial;


                collection.push(
                    spatial
                );

            }

        };


    /* =====================================================
       BUILD SPATIAL DATA
       ===================================================== */


    HeatmapEngine.buildSpatialData =
        function () {

            HeatmapEngine.spatial = {

                sourcePoints:
                    [],

                targetPoints:
                    [],

                sourceCompartments:
                    [],

                targetCompartments:
                    [],

                sourceRanges:
                    [],

                targetRanges:
                    [],

                unmappedSources:
                    [],

                unmappedTargets:
                    []

            };


            const features =

                HeatmapEngine
                    .getGISFeatures();


            HeatmapEngine
                .buildSpatialIndexes(
                    features
                );


            for (
                const hotspot
                of HeatmapEngine
                    .data
                    .sources
            ) {

                const spatial =

                    HeatmapEngine
                        .resolveSpatialRepresentation(

                            hotspot,

                            "SOURCE"

                        );


                HeatmapEngine
                    .registerSpatial(

                        spatial,

                        "SOURCE"

                    );

            }


            for (
                const hotspot
                of HeatmapEngine
                    .data
                    .targets
            ) {

                const spatial =

                    HeatmapEngine
                        .resolveSpatialRepresentation(

                            hotspot,

                            "TARGET"

                        );


                HeatmapEngine
                    .registerSpatial(

                        spatial,

                        "TARGET"

                    );

            }


            return HeatmapEngine
                .spatial;

        };


    /* =====================================================
       CASCADE HYDRATION
       ===================================================== */


    HeatmapEngine.mergeCascadeIntoPorRelation =
        function (

            relation,

            cascade

        ) {

            if (
                !relation ||
                !cascade
            ) {

                return relation;

            }


            if (
                cascade.porNo
            ) {

                relation.porNo =
                    cascade.porNo;

            }


            const groups = [

                [
                    "cases",
                    HeatmapEngine.getCaseId
                ],

                [
                    "accused",
                    HeatmapEngine.getAccusedId
                ],

                [
                    "witnesses",
                    HeatmapEngine.getWitnessId
                ],

                [
                    "seizures",
                    HeatmapEngine.getSeizureId
                ],

                [
                    "articles",
                    HeatmapEngine.getArticleId
                ]

            ];


            for (
                const [
                    field,
                    idGetter
                ]
                of groups
            ) {

                const items =

                    HeatmapEngine
                        .toArray(
                            cascade[field]
                        );


                for (
                    const item
                    of items
                ) {

                    HeatmapEngine
                        .addUniqueObject(

                            relation[field],

                            item,

                            idGetter

                        );

                }

            }


            return relation;

        };


    HeatmapEngine.getStoreCascadeByPor =
        function (

            porKey

        ) {

            const Store =

                Offence.Store;


            if (
                !Store
            ) {

                return null;

            }


            const methods = [

                "getPorCascade",

                "getCascadeData",

                "getPorCascadeData",

                "getByPor",

                "getByPorKey"

            ];


            for (
                const method
                of methods
            ) {

                if (
                    typeof Store[method] !==
                    "function"
                ) {

                    continue;

                }


                try {

                    const result =

                        Store[method](
                            porKey
                        );


                    if (
                        result
                    ) {

                        return result;

                    }

                }
                catch (
                    error
                ) {

                    /*
                     * Continue to next compatible
                     * Store method.
                     */

                }

            }


            return null;

        };


    HeatmapEngine.hydratePorRelation =
        function (

            relation

        ) {

            if (
                !relation
            ) {

                return relation;

            }


            const cascade =

                HeatmapEngine
                    .getStoreCascadeByPor(
                        relation.porKey
                    );


            if (
                cascade
            ) {

                HeatmapEngine
                    .mergeCascadeIntoPorRelation(

                        relation,

                        cascade

                    );

            }


            return relation;

        };


    HeatmapEngine.hydrateAllPorRelations =
        function () {

            let hydrated =
                0;


            let withoutCascade =
                0;


            for (
                const relation
                of HeatmapEngine
                    .porIndex
                    .values()
            ) {

                const cascade =

                    HeatmapEngine
                        .getStoreCascadeByPor(
                            relation.porKey
                        );


                if (
                    cascade
                ) {

                    HeatmapEngine
                        .mergeCascadeIntoPorRelation(

                            relation,

                            cascade

                        );


                    hydrated++;

                }
                else {

                    withoutCascade++;

                }

            }


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(

                    "[OffenceHeatmapEngine] POR relations hydrated",

                    {

                        totalPorKeys:
                            HeatmapEngine
                                .porIndex
                                .size,

                        hydrated:
                            hydrated,

                        withoutCascade:
                            withoutCascade

                    }

                );

            }


            return HeatmapEngine;

        };


    /* =====================================================
       INDEX MANAGEMENT
       ===================================================== */


    HeatmapEngine.resetIndexes =
        function () {

            HeatmapEngine
                .hotspotIndex
                .clear();


            HeatmapEngine
                .porIndex
                .clear();


            HeatmapEngine
                .caseIndex
                .clear();


            return HeatmapEngine;

        };


    HeatmapEngine.rebuildIndexes =
        function () {

            HeatmapEngine
                .resetIndexes();


            const sources =

                Array.isArray(
                    HeatmapEngine.data.sources
                )

                    ? HeatmapEngine.data.sources

                    : [];


            const targets =

                Array.isArray(
                    HeatmapEngine.data.targets
                )

                    ? HeatmapEngine.data.targets

                    : [];


            for (
                const source
                of sources
            ) {

                HeatmapEngine
                    .registerSourceHotspot(
                        source
                    );

            }


            for (
                const target
                of targets
            ) {

                HeatmapEngine
                    .registerTargetHotspot(
                        target
                    );

            }


            /*
             * Hydrate POR business relationships
             * BEFORE spatial registration.
             */

            HeatmapEngine
                .hydrateAllPorRelations();


            /*
             * Build POINT > COMPARTMENT > RANGE
             * spatial representations.
             */

            HeatmapEngine
                .buildSpatialData();


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(

                    "[OffenceHeatmapEngine] Indexes rebuilt",

                    {

                        hotspots:
                            HeatmapEngine
                                .hotspotIndex
                                .size,

                        porRelations:
                            HeatmapEngine
                                .porIndex
                                .size,

                        caseRelations:
                            HeatmapEngine
                                .caseIndex
                                .size,

                        sourcePoints:
                            HeatmapEngine
                                .spatial
                                .sourcePoints
                                .length,

                        sourceCompartments:
                            HeatmapEngine
                                .spatial
                                .sourceCompartments
                                .length,

                        sourceRanges:
                            HeatmapEngine
                                .spatial
                                .sourceRanges
                                .length,

                        targetPoints:
                            HeatmapEngine
                                .spatial
                                .targetPoints
                                .length,

                        targetCompartments:
                            HeatmapEngine
                                .spatial
                                .targetCompartments
                                .length,

                        targetRanges:
                            HeatmapEngine
                                .spatial
                                .targetRanges
                                .length

                    }

                );

            }


            return HeatmapEngine;

        };


    /* =====================================================
       BUILD
       ===================================================== */


    HeatmapEngine.build =
        function (

            sources,

            targets

        ) {

            if (
                HeatmapEngine.building
            ) {

                return HeatmapEngine
                    .getHeatmapData();

            }


            HeatmapEngine.building =
                true;


            HeatmapEngine.ready =
                false;


            try {

                HeatmapEngine.data = {

                    resolvedContexts:
                        [],

                    sources:
                        Array.isArray(
                            sources
                        )

                            ? sources.slice()

                            : [],

                    targets:
                        Array.isArray(
                            targets
                        )

                            ? targets.slice()

                            : [],

                    links:
                        []

                };


                HeatmapEngine
                    .rebuildIndexes();


                HeatmapEngine
                    .buildLinks();


                HeatmapEngine.ready =
                    true;


                HeatmapEngine.lastBuildAt =
                    Date.now();


                return HeatmapEngine
                    .getHeatmapData();

            }
            finally {

                HeatmapEngine.building =
                    false;

            }

        };


    /* =====================================================
       LINKS
       ===================================================== */


    HeatmapEngine.buildLinks =
        function () {

            const links =
                [];


            for (
                const relation
                of HeatmapEngine
                    .porIndex
                    .values()
            ) {

                if (
                    !relation.sources.length ||
                    !relation.targets.length
                ) {

                    continue;

                }


                for (
                    const source
                    of relation.sources
                ) {

                    for (
                        const target
                        of relation.targets
                    ) {

                        links.push({

                            porKey:
                                relation.porKey,

                            source:
                                source,

                            target:
                                target,

                            sourceId:
                                HeatmapEngine
                                    .getHotspotId(
                                        source
                                    ),

                            targetId:
                                HeatmapEngine
                                    .getHotspotId(
                                        target
                                    )

                        });

                    }

                }

            }


            HeatmapEngine.data.links =
                links;


            return links;

        };


    /* =====================================================
       QUERY API
       ===================================================== */


    HeatmapEngine.getSourcesByPor =
        function (

            porKey

        ) {

            return (

                HeatmapEngine
                    .getOrCreatePorRelation(
                        porKey
                    )
                    ?.sources ||

                []

            );

        };


    HeatmapEngine.getTargetsByPor =
        function (

            porKey

        ) {

            return (

                HeatmapEngine
                    .getOrCreatePorRelation(
                        porKey
                    )
                    ?.targets ||

                []

            );

        };


    HeatmapEngine.getByPor =
        function (

            porKey

        ) {

            return HeatmapEngine
                .porIndex
                .get(

                    HeatmapEngine
                        .normalizePorKey(
                            porKey
                        )

                ) ||

                null;

        };


    HeatmapEngine.getPorCascade =
        function (

            porKey

        ) {

            return HeatmapEngine
                .getByPor(
                    porKey
                );

        };


    HeatmapEngine.getHotspotById =
        function (

            hotspotId

        ) {

            return HeatmapEngine
                .hotspotIndex
                .get(

                    HeatmapEngine
                        .normalizeKey(
                            hotspotId
                        )

                ) ||

                null;

        };


    HeatmapEngine.getByCaseId =
        function (

            caseId

        ) {

            return HeatmapEngine
                .caseIndex
                .get(

                    HeatmapEngine
                        .normalizeKey(
                            caseId
                        )

                ) ||

                null;

        };


    HeatmapEngine.getSourceHotspots =
        function () {

            return Array.isArray(
                HeatmapEngine.data.sources
            )

                ? HeatmapEngine
                    .data
                    .sources

                : [];

        };


    HeatmapEngine.getTargetHotspots =
        function () {

            return Array.isArray(
                HeatmapEngine.data.targets
            )

                ? HeatmapEngine
                    .data
                    .targets

                : [];

        };


    HeatmapEngine.getLinks =
        function () {

            return Array.isArray(
                HeatmapEngine.data.links
            )

                ? HeatmapEngine
                    .data
                    .links

                : [];

        };


    /* =====================================================
       SPATIAL QUERY API
       ===================================================== */


    HeatmapEngine.getSourcePoints =
        function () {

            return HeatmapEngine
                .spatial
                .sourcePoints;

        };


    HeatmapEngine.getTargetPoints =
        function () {

            return HeatmapEngine
                .spatial
                .targetPoints;

        };


    HeatmapEngine.getSourceCompartments =
        function () {

            return HeatmapEngine
                .spatial
                .sourceCompartments;

        };


    HeatmapEngine.getTargetCompartments =
        function () {

            return HeatmapEngine
                .spatial
                .targetCompartments;

        };


    HeatmapEngine.getSourceRanges =
        function () {

            return HeatmapEngine
                .spatial
                .sourceRanges;

        };


    HeatmapEngine.getTargetRanges =
        function () {

            return HeatmapEngine
                .spatial
                .targetRanges;

        };


    HeatmapEngine.getUnmappedSources =
        function () {

            return HeatmapEngine
                .spatial
                .unmappedSources;

        };


    HeatmapEngine.getUnmappedTargets =
        function () {

            return HeatmapEngine
                .spatial
                .unmappedTargets;

        };


    /* =====================================================
       MODE
       ===================================================== */


    HeatmapEngine.getMode =
        function () {

            return HeatmapEngine.mode;

        };


    HeatmapEngine.setMode =
        function (

            mode

        ) {

            const normalized =

                HeatmapEngine
                    .normalizeKey(
                        mode
                    );


            if (
                normalized ===
                "SOURCE" ||
                normalized ===
                "TARGET" ||
                normalized ===
                "BOTH"
            ) {

                HeatmapEngine.mode =
                    normalized;

            }


            return HeatmapEngine.mode;

        };


    /* =====================================================
       HEATMAP OUTPUT
       ===================================================== */


    HeatmapEngine.getHeatmapData =
        function () {

            return {

                mode:
                    HeatmapEngine.mode,


                /*
                 * Canonical business hotspots.
                 */

                sources:
                    HeatmapEngine
                        .getSourceHotspots(),

                targets:
                    HeatmapEngine
                        .getTargetHotspots(),

                links:
                    HeatmapEngine
                        .getLinks(),


                /*
                 * Leaflet.heat-compatible point data.
                 */

                sourceHeat:

                    HeatmapEngine
                        .spatial
                        .sourcePoints
                        .map(

                            item => [

                                item.latitude,

                                item.longitude,

                                item.heatWeight ||
                                1

                            ]

                        ),


                targetHeat:

                    HeatmapEngine
                        .spatial
                        .targetPoints
                        .map(

                            item => [

                                item.latitude,

                                item.longitude,

                                item.heatWeight ||
                                1

                            ]

                        ),


                /*
                 * Polygon heat data.
                 */

                sourceCompartments:
                    HeatmapEngine
                        .spatial
                        .sourceCompartments,

                targetCompartments:
                    HeatmapEngine
                        .spatial
                        .targetCompartments,


                sourceRanges:
                    HeatmapEngine
                        .spatial
                        .sourceRanges,

                targetRanges:
                    HeatmapEngine
                        .spatial
                        .targetRanges,


                unmappedSources:
                    HeatmapEngine
                        .spatial
                        .unmappedSources,

                unmappedTargets:
                    HeatmapEngine
                        .spatial
                        .unmappedTargets

            };

        };


    /* =====================================================
       STATE
       ===================================================== */


    HeatmapEngine.getState =
        function () {

            return {

                version:
                    HeatmapEngine.VERSION,

                initialized:
                    HeatmapEngine.initialized,

                building:
                    HeatmapEngine.building,

                ready:
                    HeatmapEngine.ready,

                mode:
                    HeatmapEngine.mode,

                lastBuildAt:
                    HeatmapEngine.lastBuildAt,


                sources:
                    HeatmapEngine
                        .data
                        .sources
                        .length,

                targets:
                    HeatmapEngine
                        .data
                        .targets
                        .length,

                links:
                    HeatmapEngine
                        .data
                        .links
                        .length,


                hotspotIndex:
                    HeatmapEngine
                        .hotspotIndex
                        .size,

                porIndex:
                    HeatmapEngine
                        .porIndex
                        .size,

                caseIndex:
                    HeatmapEngine
                        .caseIndex
                        .size,


                spatial: {

                    sourcePoints:
                        HeatmapEngine
                            .spatial
                            .sourcePoints
                            .length,

                    sourceCompartments:
                        HeatmapEngine
                            .spatial
                            .sourceCompartments
                            .length,

                    sourceRanges:
                        HeatmapEngine
                            .spatial
                            .sourceRanges
                            .length,

                    unmappedSources:
                        HeatmapEngine
                            .spatial
                            .unmappedSources
                            .length,


                    targetPoints:
                        HeatmapEngine
                            .spatial
                            .targetPoints
                            .length,

                    targetCompartments:
                        HeatmapEngine
                            .spatial
                            .targetCompartments
                            .length,

                    targetRanges:
                        HeatmapEngine
                            .spatial
                            .targetRanges
                            .length,

                    unmappedTargets:
                        HeatmapEngine
                            .spatial
                            .unmappedTargets
                            .length

                }

            };

        };


    /* =====================================================
       CLEAR
       ===================================================== */


    HeatmapEngine.clear =
        function () {

            HeatmapEngine.data = {

                resolvedContexts:
                    [],

                sources:
                    [],

                targets:
                    [],

                links:
                    []

            };


            HeatmapEngine.spatial = {

                sourcePoints:
                    [],

                targetPoints:
                    [],

                sourceCompartments:
                    [],

                targetCompartments:
                    [],

                sourceRanges:
                    [],

                targetRanges:
                    [],

                unmappedSources:
                    [],

                unmappedTargets:
                    []

            };


            HeatmapEngine
                .hotspotIndex
                .clear();


            HeatmapEngine
                .porIndex
                .clear();


            HeatmapEngine
                .caseIndex
                .clear();


            HeatmapEngine
                .compartmentIndex
                .clear();


            HeatmapEngine
                .rangeIndex
                .clear();


            HeatmapEngine
                .gisFeatureIndex
                .clear();


            HeatmapEngine.ready =
                false;


            HeatmapEngine.building =
                false;


            HeatmapEngine.lastBuildAt =
                null;


            return HeatmapEngine;

        };


    /* =====================================================
       REGISTER MODULE
       ===================================================== */


    GG.Offence.HeatmapEngine =
        HeatmapEngine;


    HeatmapEngine.init();


})();
