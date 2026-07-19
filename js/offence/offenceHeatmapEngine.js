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

                    item.porNo ||

                    item.refPorNo ||

                    item.por_no ||

                    item.por ||

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

                item.refPorNo ||

                item.por_no ||

                item.por ||

                item.porKey ||

                ""

            );

        };


    /* =====================================================
       POR RELATION CREATION
       ===================================================== */


    HeatmapEngine.createPorRelation =
        function (

            porKey

        ) {

            const normalizedPorKey =

                HeatmapEngine
                    .normalizePorKey(
                        porKey
                    );


            if (
                !normalizedPorKey
            ) {

                return null;

            }


            return {

                porKey:
                    normalizedPorKey,


                porNo:
                    "",


                /*
                 * Canonical business entities.
                 */

                cases:
                    [],

                accused:
                    [],

                witnesses:
                    [],

                seizures:
                    [],

                seizedArticles:
                    [],


                /*
                 * Canonical hotspot relations.
                 */

                sources:
                    [],

                targets:
                    [],


                /*
                 * Cross references.
                 */

                caseIds:
                    [],

                accusedIds:
                    [],

                witnessIds:
                    [],

                seizureIds:
                    [],

                articleIds:
                    []

            };

        };


    HeatmapEngine.getOrCreatePorRelation =
        function (

            porKey

        ) {

            const normalizedPorKey =

                HeatmapEngine
                    .normalizePorKey(
                        porKey
                    );


            if (
                !normalizedPorKey
            ) {

                return null;

            }


            if (
                HeatmapEngine
                    .porIndex
                    .has(
                        normalizedPorKey
                    )
            ) {

                return HeatmapEngine
                    .porIndex
                    .get(
                        normalizedPorKey
                    );

            }


            const relation =

                HeatmapEngine
                    .createPorRelation(
                        normalizedPorKey
                    );


            if (
                relation
            ) {

                HeatmapEngine
                    .porIndex
                    .set(

                        normalizedPorKey,

                        relation

                    );

            }


            return relation;

        };


    /* =====================================================
       CASE RELATION CREATION
       ===================================================== */


    HeatmapEngine.createCaseRelation =
        function (

            caseId

        ) {

            const normalizedCaseId =

                HeatmapEngine
                    .normalizeKey(
                        caseId
                    );


            if (
                !normalizedCaseId
            ) {

                return null;

            }


            return {

                caseId:
                    caseId,


                porKeys:
                    [],


                sources:
                    [],

                targets:
                    [],


                accused:
                    [],

                witnesses:
                    [],

                seizures:
                    [],

                seizedArticles:
                    []

            };

        };


    HeatmapEngine.getOrCreateCaseRelation =
        function (

            caseId

        ) {

            const normalizedCaseId =

                HeatmapEngine
                    .normalizeKey(
                        caseId
                    );


            if (
                !normalizedCaseId
            ) {

                return null;

            }


            if (
                HeatmapEngine
                    .caseIndex
                    .has(
                        normalizedCaseId
                    )
            ) {

                return HeatmapEngine
                    .caseIndex
                    .get(
                        normalizedCaseId
                    );

            }


            const relation =

                HeatmapEngine
                    .createCaseRelation(
                        caseId
                    );


            if (
                relation
            ) {

                HeatmapEngine
                    .caseIndex
                    .set(

                        normalizedCaseId,

                        relation

                    );

            }


            return relation;

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


    /* =====================================================
       SOURCE HOTSPOT REGISTRATION
       ===================================================== */


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


    /* =====================================================
       TARGET HOTSPOT REGISTRATION
       ===================================================== */


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
       STORE ACCESS
       ===================================================== */


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


            const normalizedPorKey =

                HeatmapEngine
                    .normalizePorKey(
                        porKey
                    );


            if (
                !normalizedPorKey
            ) {

                return null;

            }


            try {

                if (
                    typeof Store
                        .getCascadeByPor ===
                    "function"
                ) {

                    return Store
                        .getCascadeByPor(
                            normalizedPorKey
                        );

                }


                if (
                    typeof Store
                        .getPorCascade ===
                    "function"
                ) {

                    return Store
                        .getPorCascade(
                            normalizedPorKey
                        );

                }

            }
            catch (
                error
            ) {

                console.warn(

                    "[OffenceHeatmapEngine] Store POR cascade lookup failed.",

                    {

                        porKey:
                            normalizedPorKey,

                        error:
                            error

                    }

                );

            }


            return null;

        };


    /* =====================================================
       MERGE STORE CASCADE INTO POR RELATION
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


            /*
             * POR number.
             */

            relation.porNo =

                cascade.porNo ||

                cascade.refPorNo ||

                relation.porNo ||

                relation.porKey;


            /*
             * Cases.
             */

            const cases =

                HeatmapEngine
                    .toArray(

                        cascade.cases ||

                        cascade.case

                    );


            for (
                const record
                of cases
            ) {

                if (
                    !record
                ) {

                    continue;

                }


                HeatmapEngine
                    .addUniqueObject(

                        relation.cases,

                        record,

                        HeatmapEngine
                            .getCaseId

                    );


                HeatmapEngine
                    .addUnique(

                        relation.caseIds,

                        HeatmapEngine
                            .getCaseId(
                                record
                            )

                    );

            }


            /*
             * Accused.
             */

            const accused =

                HeatmapEngine
                    .toArray(
                        cascade.accused
                    );


            for (
                const record
                of accused
            ) {

                if (
                    !record
                ) {

                    continue;

                }


                HeatmapEngine
                    .addUniqueObject(

                        relation.accused,

                        record,

                        HeatmapEngine
                            .getAccusedId

                    );


                HeatmapEngine
                    .addUnique(

                        relation.accusedIds,

                        HeatmapEngine
                            .getAccusedId(
                                record
                            )

                    );

            }


            /*
             * Witnesses.
             */

            const witnesses =

                HeatmapEngine
                    .toArray(
                        cascade.witnesses
                    );


            for (
                const record
                of witnesses
            ) {

                if (
                    !record
                ) {

                    continue;

                }


                HeatmapEngine
                    .addUniqueObject(

                        relation.witnesses,

                        record,

                        HeatmapEngine
                            .getWitnessId

                    );


                HeatmapEngine
                    .addUnique(

                        relation.witnessIds,

                        HeatmapEngine
                            .getWitnessId(
                                record
                            )

                    );

            }


            /*
             * Seizures.
             */

            const seizures =

                HeatmapEngine
                    .toArray(
                        cascade.seizures
                    );


            for (
                const record
                of seizures
            ) {

                if (
                    !record
                ) {

                    continue;

                }


                HeatmapEngine
                    .addUniqueObject(

                        relation.seizures,

                        record,

                        HeatmapEngine
                            .getSeizureId

                    );


                HeatmapEngine
                    .addUnique(

                        relation.seizureIds,

                        HeatmapEngine
                            .getSeizureId(
                                record
                            )

                    );

            }


            /*
             * Seized articles.
             */

            const seizedArticles =

                HeatmapEngine
                    .toArray(

                        cascade.seizedArticles ||

                        cascade.articles

                    );


            for (
                const record
                of seizedArticles
            ) {

                if (
                    !record
                ) {

                    continue;

                }


                HeatmapEngine
                    .addUniqueObject(

                        relation.seizedArticles,

                        record,

                        HeatmapEngine
                            .getArticleId

                    );


                HeatmapEngine
                    .addUnique(

                        relation.articleIds,

                        HeatmapEngine
                            .getArticleId(
                                record
                            )

                    );

            }


            return relation;

        };
       /* =====================================================
       POR RELATION HYDRATION
       ===================================================== */


    HeatmapEngine.hydratePorRelation =
        function (

            porKey

        ) {

            const normalizedPorKey =

                HeatmapEngine
                    .normalizePorKey(
                        porKey
                    );


            if (
                !normalizedPorKey
            ) {

                return null;

            }


            const relation =

                HeatmapEngine
                    .getOrCreatePorRelation(
                        normalizedPorKey
                    );


            if (
                !relation
            ) {

                return null;

            }


            const cascade =

                HeatmapEngine
                    .getStoreCascadeByPor(
                        normalizedPorKey
                    );


            if (
                !cascade
            ) {

                return relation;

            }


            HeatmapEngine
                .mergeCascadeIntoPorRelation(

                    relation,

                    cascade

                );


            return relation;

        };


    HeatmapEngine.hydrateAllPorRelations =
        function () {

            let hydrated =
                0;


            let withoutCascade =
                0;


            const porKeys =

                Array.from(

                    HeatmapEngine
                        .porIndex
                        .keys()

                );


            for (
                const porKey
                of porKeys
            ) {

                const cascade =

                    HeatmapEngine
                        .getStoreCascadeByPor(
                            porKey
                        );


                if (
                    !cascade
                ) {

                    withoutCascade++;

                    continue;

                }


                const relation =

                    HeatmapEngine
                        .porIndex
                        .get(
                            porKey
                        );


                if (
                    !relation
                ) {

                    continue;

                }


                HeatmapEngine
                    .mergeCascadeIntoPorRelation(

                        relation,

                        cascade

                    );


                hydrated++;

            }


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(

                    "[OffenceHeatmapEngine] POR relations hydrated",

                    {

                        totalPorKeys:
                            porKeys.length,

                        hydrated:
                            hydrated,

                        withoutCascade:
                            withoutCascade

                    }

                );

            }


            return {

                totalPorKeys:
                    porKeys.length,

                hydrated:
                    hydrated,

                withoutCascade:
                    withoutCascade

            };

        };


    /* =====================================================
       INDEX RESET
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


    /* =====================================================
       REBUILD RELATIONSHIP INDEXES
       ===================================================== */


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


            /*
             * Register source hotspots.
             */

            for (
                const source
                of sources
            ) {

                HeatmapEngine
                    .registerSourceHotspot(
                        source
                    );

            }


            /*
             * Register target hotspots.
             */

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
             * from the canonical OffenceStore.
             */

            HeatmapEngine
                .hydrateAllPorRelations();


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
                                .size

                    }

                );

            }


            return HeatmapEngine;

        };


    /* =====================================================
       POR RELATION LOOKUPS
       ===================================================== */


    HeatmapEngine.getSourcesByPor =
        function (

            porKey

        ) {

            const key =

                HeatmapEngine
                    .normalizePorKey(
                        porKey
                    );


            const relation =

                HeatmapEngine
                    .porIndex
                    .get(
                        key
                    );


            return (

                relation?.sources ||

                []

            );

        };


    HeatmapEngine.getTargetsByPor =
        function (

            porKey

        ) {

            const key =

                HeatmapEngine
                    .normalizePorKey(
                        porKey
                    );


            const relation =

                HeatmapEngine
                    .porIndex
                    .get(
                        key
                    );


            return (

                relation?.targets ||

                []

            );

        };


    HeatmapEngine.getByPor =
        function (

            porKey

        ) {

            const key =

                HeatmapEngine
                    .normalizePorKey(
                        porKey
                    );


            if (
                !key
            ) {

                return null;

            }


            return (

                HeatmapEngine
                    .porIndex
                    .get(
                        key
                    ) ||

                null

            );

        };


    HeatmapEngine.getPorCascade =
        function (

            porKey

        ) {

            const relation =

                HeatmapEngine
                    .getByPor(
                        porKey
                    );


            if (
                relation
            ) {

                return relation;

            }


            /*
             * Fallback directly to Store.
             */

            return HeatmapEngine
                .getStoreCascadeByPor(
                    porKey
                );

        };


    /* =====================================================
       HOTSPOT LOOKUP
       ===================================================== */


    HeatmapEngine.getHotspotById =
        function (

            hotspotId

        ) {

            const key =

                HeatmapEngine
                    .normalizeKey(
                        hotspotId
                    );


            if (
                !key
            ) {

                return null;

            }


            return (

                HeatmapEngine
                    .hotspotIndex
                    .get(
                        key
                    ) ||

                null

            );

        };


    /* =====================================================
       CASE LOOKUP
       ===================================================== */


    HeatmapEngine.getByCaseId =
        function (

            caseId

        ) {

            const key =

                HeatmapEngine
                    .normalizeKey(
                        caseId
                    );


            if (
                !key
            ) {

                return null;

            }


            return (

                HeatmapEngine
                    .caseIndex
                    .get(
                        key
                    ) ||

                null

            );

        };


    /* =====================================================
       CANONICAL HOTSPOT GETTERS
       ===================================================== */


    HeatmapEngine.getSourceHotspots =
        function () {

            return Array.isArray(
                HeatmapEngine.data.sources
            )

                ? HeatmapEngine.data.sources

                : [];

        };


    HeatmapEngine.getTargetHotspots =
        function () {

            return Array.isArray(
                HeatmapEngine.data.targets
            )

                ? HeatmapEngine.data.targets

                : [];

        };


    HeatmapEngine.getLinks =
        function () {

            return Array.isArray(
                HeatmapEngine.data.links
            )

                ? HeatmapEngine.data.links

                : [];

        };


    /* =====================================================
       GIS ENTITY ACCESS
       ===================================================== */


    HeatmapEngine.getGISEntities =
        function () {

            return (

                GG.GISEntities ||

                window.GreenGuardAI
                    ?.GISEntities ||

                null

            );

        };


    HeatmapEngine.ensureGISEntitiesReady =
        function () {

            const GISEntities =

                HeatmapEngine
                    .getGISEntities();


            if (
                !GISEntities
            ) {

                return false;

            }


            try {

                if (
                    typeof GISEntities.ready ===
                    "function" &&
                    GISEntities.ready()
                ) {

                    return true;

                }


                if (
                    typeof GISEntities.build ===
                    "function"
                ) {

                    GISEntities.build();

                }


                if (
                    typeof GISEntities.ready ===
                    "function"
                ) {

                    return !!GISEntities
                        .ready();

                }


                return true;

            }
            catch (
                error
            ) {

                console.warn(

                    "[OffenceHeatmapEngine] GISEntities initialization failed.",

                    error

                );


                return false;

            }

        };


    /* =====================================================
       GIS FEATURE COLLECTION
       ===================================================== */


    HeatmapEngine.getGISFeatures =
        function () {

            const features =
                [];


            const seen =

                new Set();


            const addFeature =
                function (

                    feature

                ) {

                    if (
                        !feature ||
                        typeof feature !==
                        "object"
                    ) {

                        return;

                    }


                    /*
                     * Accept individual GeoJSON Features.
                     */

                    if (
                        feature.type ===
                        "Feature"
                    ) {

                        if (
                            !seen.has(
                                feature
                            )
                        ) {

                            seen.add(
                                feature
                            );


                            features.push(
                                feature
                            );

                        }


                        return;

                    }


                    /*
                     * Accept GeoJSON FeatureCollections.
                     */

                    if (
                        feature.type ===
                        "FeatureCollection" &&
                        Array.isArray(
                            feature.features
                        )
                    ) {

                        for (
                            const child
                            of feature.features
                        ) {

                            addFeature(
                                child
                            );

                        }

                    }

                };


            const addCollection =
                function (

                    collection

                ) {

                    if (
                        !collection
                    ) {

                        return;

                    }


                    if (
                        Array.isArray(
                            collection
                        )
                    ) {

                        for (
                            const item
                            of collection
                        ) {

                            addFeature(
                                item
                            );

                        }


                        return;

                    }


                    addFeature(
                        collection
                    );

                };


            /*
             * Canonical GIS sources currently used
             * by the GreenGuard application.
             *
             * IMPORTANT:
             *
             * allGISFeatures:
             *     Division / Range / Beat polygons.
             *
             * allCompartmentFeatures:
             *     Compartment polygons.
             */

            const candidates = [

                window.allGISFeatures,

                window.allCompartmentFeatures,

                window.gisFeatures,

                window.GIS_FEATURES,

                window.__gisFeatures,

                GG.allGISFeatures,

                GG.GISFeatures,

                GG.GIS
                    ?.features

            ];


            for (
                const candidate
                of candidates
            ) {

                addCollection(
                    candidate
                );

            }


            return features;

        };


    /* =====================================================
       GIS FEATURE PROPERTY HELPERS
       ===================================================== */


    HeatmapEngine.getFeatureProperties =
        function (

            feature

        ) {

            if (
                !feature
            ) {

                return {};

            }


            return (

                feature.properties ||

                feature.feature
                    ?.properties ||

                {}

            );

        };


    HeatmapEngine.getCompartmentName =
        function (

            feature

        ) {

            const properties =

                HeatmapEngine
                    .getFeatureProperties(
                        feature
                    );


            return (

                properties.compartment ||

                properties.compartmentName ||

                properties.compartment_name ||

                properties.comp ||

                /*
                 * allCompartmentFeatures may use
                 * generic name as the compartment.
                 */

                properties.name ||

                ""

            );

        };


    HeatmapEngine.getRangeName =
        function (

            feature

        ) {

            const properties =

                HeatmapEngine
                    .getFeatureProperties(
                        feature
                    );


            return (

                properties.range ||

                properties.rangeName ||

                properties.range_name ||

                properties.forestRange ||

                properties.forest_range ||

                ""

            );

        };
       /* =====================================================
       BUILD SPATIAL GIS INDEXES
       ===================================================== */


    HeatmapEngine.buildSpatialIndexes =
        function () {

            HeatmapEngine
                .compartmentIndex
                .clear();


            HeatmapEngine
                .rangeIndex
                .clear();


            HeatmapEngine
                .gisFeatureIndex
                .clear();


            const features =

                HeatmapEngine
                    .getGISFeatures();


            for (
                const feature
                of features
            ) {

                if (
                    !feature
                ) {

                    continue;

                }


                const compartmentName =

                    HeatmapEngine
                        .getCompartmentName(
                            feature
                        );


                const rangeName =

                    HeatmapEngine
                        .getRangeName(
                            feature
                        );


                /*
                 * -----------------------------------------
                 * COMPARTMENT INDEX
                 * -----------------------------------------
                 */

                if (
                    compartmentName
                ) {

                    const compartmentKey =

                        HeatmapEngine
                            .normalizeSpatialKey(
                                compartmentName
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


                        HeatmapEngine
                            .gisFeatureIndex
                            .set(

                                "COMPARTMENT::" +
                                compartmentKey,

                                feature

                            );

                    }

                }


                /*
                 * -----------------------------------------
                 * RANGE INDEX
                 * -----------------------------------------
                 *
                 * Multiple GIS features can belong to the
                 * same Range.
                 *
                 * Therefore rangeIndex stores arrays.
                 */

                if (
                    rangeName
                ) {

                    const rangeKey =

                        HeatmapEngine
                            .normalizeRange(
                                rangeName
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


                        const rangeFeatures =

                            HeatmapEngine
                                .rangeIndex
                                .get(
                                    rangeKey
                                );


                        if (
                            !rangeFeatures
                                .includes(
                                    feature
                                )
                        ) {

                            rangeFeatures
                                .push(
                                    feature
                                );

                        }


                        HeatmapEngine
                            .gisFeatureIndex
                            .set(

                                "RANGE::" +
                                rangeKey,

                                rangeFeatures

                            );

                    }

                }

            }


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(

                    "[OffenceHeatmapEngine] Spatial GIS indexes built",

                    {

                        gisFeatures:
                            features.length,

                        compartments:
                            HeatmapEngine
                                .compartmentIndex
                                .size,

                        ranges:
                            HeatmapEngine
                                .rangeIndex
                                .size

                    }

                );

            }


            return {

                gisFeatures:
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
       COORDINATE RESOLUTION
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


            /*
             * IMPORTANT:
             *
             * Number(undefined) becomes NaN.
             *
             * Number(null) becomes 0.
             *
             * Therefore we must first obtain the raw
             * coordinate values before converting them.
             */

            const rawLatitude =

                hotspot.latitude ??

                hotspot.lat ??

                hotspot.location
                    ?.latitude ??

                hotspot.location
                    ?.lat ??

                hotspot.coordinates
                    ?.latitude ??

                hotspot.coordinates
                    ?.lat;


            const rawLongitude =

                hotspot.longitude ??

                hotspot.lng ??

                hotspot.lon ??

                hotspot.location
                    ?.longitude ??

                hotspot.location
                    ?.lng ??

                hotspot.location
                    ?.lon ??

                hotspot.coordinates
                    ?.longitude ??

                hotspot.coordinates
                    ?.lng ??

                hotspot.coordinates
                    ?.lon;


            /*
             * Missing values must NOT become 0,0.
             */

            if (
                rawLatitude === null ||
                rawLatitude === undefined ||
                rawLatitude === "" ||
                rawLongitude === null ||
                rawLongitude === undefined ||
                rawLongitude === ""
            ) {

                return null;

            }


            const latitude =

                Number(
                    rawLatitude
                );


            const longitude =

                Number(
                    rawLongitude
                );


            /*
             * Reject invalid coordinates.
             */

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


            /*
             * Reject default / placeholder 0,0.
             *
             * This is critical for the offence pipeline.
             *
             * Source and Target engines may contain
             * latitude: 0 and longitude: 0 when no actual
             * GPS coordinate exists.
             *
             * Such records must fall through to:
             *
             * COMPARTMENT
             * or
             * RANGE
             */

            if (
                latitude === 0 &&
                longitude === 0
            ) {

                return null;

            }


            /*
             * Reject impossible latitude / longitude.
             */

            if (
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
                    longitude,

                /*
                 * Convenience aliases for consumers such
                 * as Leaflet renderers.
                 */

                lat:
                    latitude,

                lng:
                    longitude

            };

        };


    /* =====================================================
       COMPARTMENT EXTRACTION FROM HOTSPOT
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


            /*
             * Prefer explicit structured fields.
             */

            const explicit =

                hotspot.compartment ||

                hotspot.compartmentName ||

                hotspot.compartment_name ||

                hotspot.location
                    ?.compartment ||

                hotspot.context
                    ?.compartment ||

                hotspot.gis
                    ?.compartment ||

                "";


            if (
                explicit
            ) {

                return String(
                    explicit
                )
                    .trim();

            }


            /*
             * Try address / location text.
             *
             * Examples:
             *
             * WRVK-9 Compartment
             * Compartment 9
             * Compartment No. 9
             */

            const text =

                String(

                    hotspot.address ||

                    hotspot.name ||

                    hotspot.locationName ||

                    hotspot.location
                        ?.name ||

                    ""

                );


            if (
                !text
            ) {

                return "";

            }


            const patterns = [

                /*
                 * WRVK-9 Compartment
                 */

                /([A-Z0-9()\/\s-]+?)\s+COMPARTMENT\b/i,


                /*
                 * Compartment No. 9
                 */

                /\bCOMPARTMENT\s*(?:NO\.?|NUMBER)?\s*[-:]?\s*([A-Z0-9\/-]+)/i,


                /*
                 * Compartment 9
                 */

                /\bCOMPARTMENT\s+([A-Z0-9\/-]+)/i

            ];


            for (
                const pattern
                of patterns
            ) {

                const match =

                    text.match(
                        pattern
                    );


                if (
                    match &&
                    match[1]
                ) {

                    return String(
                        match[1]
                    )
                        .trim();

                }

            }


            return "";

        };


    /* =====================================================
       RANGE EXTRACTION FROM HOTSPOT
       ===================================================== */


    HeatmapEngine.extractRange =
        function (

            hotspot

        ) {

            if (
                !hotspot
            ) {

                return "";

            }


            /*
             * Prefer explicit structured Range field.
             */

            const explicit =

                hotspot.range ||

                hotspot.rangeName ||

                hotspot.range_name ||

                hotspot.forestRange ||

                hotspot.location
                    ?.range ||

                hotspot.context
                    ?.range ||

                hotspot.gis
                    ?.range ||

                "";


            if (
                explicit
            ) {

                return String(
                    explicit
                )
                    .trim();

            }


            /*
             * Attempt to infer Range from POR keys.
             *
             * Example:
             *
             * 07/NMT
             * 53/WRVK
             * 56/EDPO OF 2019-20
             */

            const porValues =

                [];


            if (
                hotspot.porKey
            ) {

                porValues.push(
                    hotspot.porKey
                );

            }


            if (
                Array.isArray(
                    hotspot.porKeys
                )
            ) {

                porValues.push(
                    ...hotspot.porKeys
                );

            }


            if (
                Array.isArray(
                    hotspot.porNos
                )
            ) {

                porValues.push(
                    ...hotspot.porNos
                );

            }


            const knownRanges = [

                "WRVK",

                "WDPO",

                "EDPO",

                "PANA",

                "NMT",

                "HTG",

                "ERVK",

                "HQM",

                "MW",

                "RE",

                "AFR(W)",

                "WLMSQ-I",

                "WLMSQ-II"

            ];


            for (
                const value
                of porValues
            ) {

                const text =

                    String(
                        value
                    )
                        .toUpperCase();


                for (
                    const range
                    of knownRanges
                ) {

                    if (
                        text.includes(
                            range
                        )
                    ) {

                        return range;

                    }

                }

            }


            /*
             * Final fallback:
             * inspect hotspot address/name.
             */

            const text =

                String(

                    hotspot.address ||

                    hotspot.name ||

                    hotspot.locationName ||

                    ""

                )
                    .toUpperCase();


            for (
                const range
                of knownRanges
            ) {

                if (
                    text.includes(
                        range
                    )
                ) {

                    return range;

                }

            }


            return "";

        };


    /* =====================================================
       COMPARTMENT FEATURE LOOKUP
       ===================================================== */


    HeatmapEngine.findCompartmentFeature =
        function (

            rawCompartment

        ) {

            if (
                !rawCompartment
            ) {

                return null;

            }


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
             * -----------------------------------------
             * PRIORITY 1
             * GreenGuard canonical GISEntities.
             * -----------------------------------------
             *
             * GISEntities indexes:
             *
             * window.allCompartmentFeatures
             *
             * and uses the application's shared
             * GG.normalizeName() normalization.
             */

            const GISEntities =

                HeatmapEngine
                    .getGISEntities();


            if (
                GISEntities &&
                typeof GISEntities.search ===
                "function"
            ) {

                try {

                    HeatmapEngine
                        .ensureGISEntitiesReady();


                    const entityFeature =

                        GISEntities
                            .search(
                                rawCompartment
                            );


                    /*
                     * Generic GISEntities.search() can
                     * return another GIS entity type.
                     *
                     * Validate that the result represents
                     * a compartment before accepting it.
                     */

                    if (
                        entityFeature
                    ) {

                        const properties =

                            HeatmapEngine
                                .getFeatureProperties(
                                    entityFeature
                                );


                        const compartmentName =

                            properties.compartment ||

                            properties.compartmentName ||

                            properties.compartment_name ||

                            properties.comp;


                        if (
                            compartmentName
                        ) {

                            return entityFeature;

                        }


                        /*
                         * allCompartmentFeatures may use
                         * properties.name instead.
                         *
                         * Only accept generic name when its
                         * normalized value exactly matches
                         * the requested compartment.
                         */

                        if (
                            properties.name &&
                            HeatmapEngine
                                .normalizeSpatialKey(
                                    properties.name
                                ) ===
                            key
                        ) {

                            return entityFeature;

                        }

                    }

                }
                catch (
                    error
                ) {

                    /*
                     * Fall through to local GIS index.
                     */

                    if (
                        Constants.DEBUG
                            ?.ENABLED
                    ) {

                        console.warn(

                            "[OffenceHeatmapEngine] GISEntities compartment lookup failed.",

                            {

                                compartment:
                                    rawCompartment,

                                error:
                                    error

                            }

                        );

                    }

                }

            }


            /*
             * -----------------------------------------
             * PRIORITY 2
             * Local compartment index.
             * -----------------------------------------
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
             * -----------------------------------------
             * PRIORITY 3
             * Flexible normalized comparison.
             * -----------------------------------------
             *
             * Useful for values such as:
             *
             * WRVK-9
             * WRVK 9
             * WRVK9
             */

            for (
                const [
                    compartmentKey,
                    feature
                ]
                of HeatmapEngine
                    .compartmentIndex
                    .entries()
            ) {

                if (
                    compartmentKey ===
                    key
                ) {

                    return feature;

                }


                if (
                    compartmentKey
                        .includes(
                            key
                        ) ||
                    key
                        .includes(
                            compartmentKey
                        )
                ) {

                    return feature;

                }

            }


            return null;

        };


    /* =====================================================
       RANGE FEATURE LOOKUP
       ===================================================== */


    HeatmapEngine.findRangeFeatures =
        function (

            rawRange

        ) {

            if (
                !rawRange
            ) {

                return [];

            }


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


            /*
             * -----------------------------------------
             * PRIORITY 1
             * Local Range index.
             * -----------------------------------------
             *
             * This can return multiple polygons belonging
             * to the same Range.
             */

            const indexedFeatures =

                HeatmapEngine
                    .rangeIndex
                    .get(
                        key
                    ) ||

                [];


            if (
                indexedFeatures.length
            ) {

                return indexedFeatures;

            }


            /*
             * -----------------------------------------
             * PRIORITY 2
             * GreenGuard GISEntities.
             * -----------------------------------------
             */

            const GISEntities =

                HeatmapEngine
                    .getGISEntities();


            if (
                GISEntities &&
                typeof GISEntities.search ===
                "function"
            ) {

                try {

                    HeatmapEngine
                        .ensureGISEntitiesReady();


                    /*
                     * First try the original Range value.
                     */

                    let entityFeature =

                        GISEntities
                            .search(
                                rawRange
                            );


                    /*
                     * If abbreviation lookup failed,
                     * try normalized canonical Range.
                     */

                    if (
                        !entityFeature &&
                        key !== rawRange
                    ) {

                        entityFeature =

                            GISEntities
                                .search(
                                    key
                                );

                    }


                    if (
                        entityFeature
                    ) {

                        const entityRange =

                            HeatmapEngine
                                .getRangeName(
                                    entityFeature
                                );


                        /*
                         * Only accept a feature that has
                         * an identifiable Range.
                         */

                        if (
                            entityRange
                        ) {

                            return [
                                entityFeature
                            ];

                        }

                    }

                }
                catch (
                    error
                ) {

                    if (
                        Constants.DEBUG
                            ?.ENABLED
                    ) {

                        console.warn(

                            "[OffenceHeatmapEngine] GISEntities Range lookup failed.",

                            {

                                range:
                                    rawRange,

                                normalizedRange:
                                    key,

                                error:
                                    error

                            }

                        );

                    }

                }

            }


            /*
             * -----------------------------------------
             * PRIORITY 3
             * Flexible local Range comparison.
             * -----------------------------------------
             */

            for (
                const [
                    rangeKey,
                    features
                ]
                of HeatmapEngine
                    .rangeIndex
                    .entries()
            ) {

                if (
                    rangeKey ===
                    key
                ) {

                    return features;

                }

            }


            return [];

        };

     /* =====================================================
       SPATIAL REPRESENTATION RESOLUTION
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

                    spatialType:
                        "UNMAPPED",

                    type:
                        type,

                    hotspot:
                        hotspot

                };

            }


            /*
             * =============================================
             * PRIORITY 1
             * VALID GPS POINT
             * =============================================
             *
             * Only genuine coordinates are accepted.
             *
             * 0,0 is rejected by getCoordinates().
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


                    lat:
                        coordinates.latitude,

                    lng:
                        coordinates.longitude,


                    heatWeight:

                        Number(
                            hotspot.heatWeight
                        ) ||

                        Number(
                            hotspot.offenceCount
                        ) ||

                        1,


                    porKey:
                        hotspot.porKey ||
                        "",


                    porKeys:

                        Array.isArray(
                            hotspot.porKeys
                        )

                            ? hotspot.porKeys
                                .slice()

                            : hotspot.porKey

                                ? [
                                    hotspot.porKey
                                ]

                                : [],


                    caseIds:

                        Array.isArray(
                            hotspot.caseIds
                        )

                            ? hotspot.caseIds
                                .slice()

                            : []

                };

            }


            /*
             * =============================================
             * PRIORITY 2
             * COMPARTMENT GEOJSON
             * =============================================
             *
             * If no valid GPS exists, attempt to resolve
             * an exact compartment polygon.
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


                        /*
                         * Canonical GeoJSON feature.
                         */

                        feature:
                            feature,


                        /*
                         * Convenience alias for renderers.
                         */

                        features:
                            [
                                feature
                            ],


                        heatWeight:

                            Number(
                                hotspot.heatWeight
                            ) ||

                            Number(
                                hotspot.offenceCount
                            ) ||

                            1,


                        porKey:
                            hotspot.porKey ||
                            "",


                        porKeys:

                            Array.isArray(
                                hotspot.porKeys
                            )

                                ? hotspot.porKeys
                                    .slice()

                                : hotspot.porKey

                                    ? [
                                        hotspot.porKey
                                    ]

                                    : [],


                        caseIds:

                            Array.isArray(
                                hotspot.caseIds
                            )

                                ? hotspot.caseIds
                                    .slice()

                                : []

                    };

                }

            }


            /*
             * =============================================
             * PRIORITY 3
             * RANGE GEOJSON
             * =============================================
             *
             * If no point or compartment can be resolved,
             * use the Range polygon(s).
             *
             * This is particularly important for Source
             * offences because all offence cases may have
             * a Range even when no GPS exists.
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
                    Array.isArray(
                        features
                    ) &&
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


                        /*
                         * A Range may resolve to one or
                         * multiple GeoJSON features.
                         */

                        features:
                            features,


                        /*
                         * Convenience alias when exactly
                         * one Range feature is available.
                         */

                        feature:

                            features.length ===
                            1

                                ? features[0]

                                : null,


                        heatWeight:

                            Number(
                                hotspot.heatWeight
                            ) ||

                            Number(
                                hotspot.offenceCount
                            ) ||

                            1,


                        porKey:
                            hotspot.porKey ||
                            "",


                        porKeys:

                            Array.isArray(
                                hotspot.porKeys
                            )

                                ? hotspot.porKeys
                                    .slice()

                                : hotspot.porKey

                                    ? [
                                        hotspot.porKey
                                    ]

                                    : [],


                        caseIds:

                            Array.isArray(
                                hotspot.caseIds
                            )

                                ? hotspot.caseIds
                                    .slice()

                                : []

                    };

                }

            }


            /*
             * =============================================
             * PRIORITY 4
             * UNMAPPED
             * =============================================
             */

            return {

                spatialType:
                    "UNMAPPED",

                type:
                    type,

                hotspot:
                    hotspot,


                attemptedCompartment:
                    compartment ||
                    "",


                attemptedRange:
                    range ||
                    "",


                porKey:
                    hotspot.porKey ||
                    "",


                porKeys:

                    Array.isArray(
                        hotspot.porKeys
                    )

                        ? hotspot.porKeys
                            .slice()

                        : hotspot.porKey

                            ? [
                                hotspot.porKey
                            ]

                            : [],


                caseIds:

                    Array.isArray(
                        hotspot.caseIds
                    )

                        ? hotspot.caseIds
                            .slice()

                        : []

            };

        };


    /* =====================================================
       REGISTER SPATIAL REPRESENTATION
       ===================================================== */


    HeatmapEngine.registerSpatial =
        function (

            spatial,

            type

        ) {

            if (
                !spatial
            ) {

                return false;

            }


            const normalizedType =

                HeatmapEngine
                    .normalizeKey(
                        type
                    );


            const spatialType =

                HeatmapEngine
                    .normalizeKey(
                        spatial.spatialType
                    );


            /*
             * =============================================
             * SOURCE
             * =============================================
             */

            if (
                normalizedType ===
                "SOURCE"
            ) {

                if (
                    spatialType ===
                    "POINT"
                ) {

                    HeatmapEngine
                        .spatial
                        .sourcePoints
                        .push(
                            spatial
                        );


                    return true;

                }


                if (
                    spatialType ===
                    "COMPARTMENT"
                ) {

                    HeatmapEngine
                        .spatial
                        .sourceCompartments
                        .push(
                            spatial
                        );


                    return true;

                }


                if (
                    spatialType ===
                    "RANGE"
                ) {

                    HeatmapEngine
                        .spatial
                        .sourceRanges
                        .push(
                            spatial
                        );


                    return true;

                }


                HeatmapEngine
                    .spatial
                    .unmappedSources
                    .push(
                        spatial
                    );


                return true;

            }


            /*
             * =============================================
             * TARGET
             * =============================================
             */

            if (
                normalizedType ===
                "TARGET"
            ) {

                if (
                    spatialType ===
                    "POINT"
                ) {

                    HeatmapEngine
                        .spatial
                        .targetPoints
                        .push(
                            spatial
                        );


                    return true;

                }


                if (
                    spatialType ===
                    "COMPARTMENT"
                ) {

                    HeatmapEngine
                        .spatial
                        .targetCompartments
                        .push(
                            spatial
                        );


                    return true;

                }


                if (
                    spatialType ===
                    "RANGE"
                ) {

                    HeatmapEngine
                        .spatial
                        .targetRanges
                        .push(
                            spatial
                        );


                    return true;

                }


                HeatmapEngine
                    .spatial
                    .unmappedTargets
                    .push(
                        spatial
                    );


                return true;

            }


            return false;

        };


    /* =====================================================
       RESET SPATIAL DATA
       ===================================================== */


    HeatmapEngine.resetSpatial =
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


            return HeatmapEngine.spatial;

        };


    /* =====================================================
       BUILD SPATIAL DATA
       ===================================================== */


    HeatmapEngine.buildSpatialData =
        function () {

            /*
             * Always start from a clean derived spatial
             * representation.
             */

            HeatmapEngine
                .resetSpatial();


            /*
             * Ensure canonical GISEntities is available.
             *
             * Failure here is not fatal because the local
             * GIS indexes can still be used.
             */

            HeatmapEngine
                .ensureGISEntitiesReady();


            /*
             * Build local indexes from:
             *
             * allGISFeatures
             * allCompartmentFeatures
             */

            HeatmapEngine
                .buildSpatialIndexes();


            /*
             * =============================================
             * SOURCE HOTSPOTS
             * =============================================
             */

            const sources =

                HeatmapEngine
                    .getSourceHotspots();


            for (
                const hotspot
                of sources
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


            /*
             * =============================================
             * TARGET HOTSPOTS
             * =============================================
             */

            const targets =

                HeatmapEngine
                    .getTargetHotspots();


            for (
                const hotspot
                of targets
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


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(

                    "[OffenceHeatmapEngine] Spatial data built",

                    {

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

                );

            }


            return HeatmapEngine.spatial;

        };


    /* =====================================================
       SPATIAL DATA GETTERS
       ===================================================== */


    HeatmapEngine.getSpatialData =
        function () {

            return HeatmapEngine.spatial;

        };


    HeatmapEngine.getSourcePoints =
        function () {

            return (

                HeatmapEngine
                    .spatial
                    .sourcePoints ||

                []

            );

        };


    HeatmapEngine.getTargetPoints =
        function () {

            return (

                HeatmapEngine
                    .spatial
                    .targetPoints ||

                []

            );

        };


    HeatmapEngine.getSourceCompartments =
        function () {

            return (

                HeatmapEngine
                    .spatial
                    .sourceCompartments ||

                []

            );

        };


    HeatmapEngine.getTargetCompartments =
        function () {

            return (

                HeatmapEngine
                    .spatial
                    .targetCompartments ||

                []

            );

        };


    HeatmapEngine.getSourceRanges =
        function () {

            return (

                HeatmapEngine
                    .spatial
                    .sourceRanges ||

                []

            );

        };


    HeatmapEngine.getTargetRanges =
        function () {

            return (

                HeatmapEngine
                    .spatial
                    .targetRanges ||

                []

            );

        };


    HeatmapEngine.getUnmappedSources =
        function () {

            return (

                HeatmapEngine
                    .spatial
                    .unmappedSources ||

                []

            );

        };


    HeatmapEngine.getUnmappedTargets =
        function () {

            return (

                HeatmapEngine
                    .spatial
                    .unmappedTargets ||

                []

            );

        };

     /* =====================================================
       SPATIAL SUMMARY
       ===================================================== */


    HeatmapEngine.getSpatialStats =
        function () {

            const spatial =

                HeatmapEngine.spatial ||

                {};


            const sourcePoints =

                Array.isArray(
                    spatial.sourcePoints
                )

                    ? spatial.sourcePoints

                    : [];


            const targetPoints =

                Array.isArray(
                    spatial.targetPoints
                )

                    ? spatial.targetPoints

                    : [];


            const sourceCompartments =

                Array.isArray(
                    spatial.sourceCompartments
                )

                    ? spatial.sourceCompartments

                    : [];


            const targetCompartments =

                Array.isArray(
                    spatial.targetCompartments
                )

                    ? spatial.targetCompartments

                    : [];


            const sourceRanges =

                Array.isArray(
                    spatial.sourceRanges
                )

                    ? spatial.sourceRanges

                    : [];


            const targetRanges =

                Array.isArray(
                    spatial.targetRanges
                )

                    ? spatial.targetRanges

                    : [];


            const unmappedSources =

                Array.isArray(
                    spatial.unmappedSources
                )

                    ? spatial.unmappedSources

                    : [];


            const unmappedTargets =

                Array.isArray(
                    spatial.unmappedTargets
                )

                    ? spatial.unmappedTargets

                    : [];


            return {

                source: {

                    total:

                        sourcePoints.length +

                        sourceCompartments.length +

                        sourceRanges.length +

                        unmappedSources.length,


                    points:
                        sourcePoints.length,


                    compartments:
                        sourceCompartments.length,


                    ranges:
                        sourceRanges.length,


                    unmapped:
                        unmappedSources.length

                },


                target: {

                    total:

                        targetPoints.length +

                        targetCompartments.length +

                        targetRanges.length +

                        unmappedTargets.length,


                    points:
                        targetPoints.length,


                    compartments:
                        targetCompartments.length,


                    ranges:
                        targetRanges.length,


                    unmapped:
                        unmappedTargets.length

                }

            };

        };


    /* =====================================================
       HEAT POINT CONVERSION
       ===================================================== */


    HeatmapEngine.createHeatPoint =
        function (

            spatial

        ) {

            if (
                !spatial
            ) {

                return null;

            }


            if (
                spatial.spatialType !==
                "POINT"
            ) {

                return null;

            }


            const latitude =

                Number(

                    spatial.latitude ??

                    spatial.lat

                );


            const longitude =

                Number(

                    spatial.longitude ??

                    spatial.lng

                );


            /*
             * Reject invalid coordinates and 0,0.
             */

            if (
                !Number.isFinite(
                    latitude
                ) ||

                !Number.isFinite(
                    longitude
                ) ||

                (
                    latitude === 0 &&
                    longitude === 0
                )
            ) {

                return null;

            }


            let weight =

                Number(
                    spatial.heatWeight
                );


            if (
                !Number.isFinite(
                    weight
                ) ||

                weight <= 0
            ) {

                weight =
                    1;

            }


            return [

                latitude,

                longitude,

                weight

            ];

        };


    /* =====================================================
       POINT HEATMAP DATA
       ===================================================== */


    HeatmapEngine.getSourceHeatPoints =
        function () {

            return HeatmapEngine
                .getSourcePoints()
                .map(

                    HeatmapEngine
                        .createHeatPoint

                )
                .filter(
                    Boolean
                );

        };


    HeatmapEngine.getTargetHeatPoints =
        function () {

            return HeatmapEngine
                .getTargetPoints()
                .map(

                    HeatmapEngine
                        .createHeatPoint

                )
                .filter(
                    Boolean
                );

        };


    /* =====================================================
       POLYGON REPRESENTATION HELPERS
       ===================================================== */


    HeatmapEngine.createPolygonEntry =
        function (

            spatial

        ) {

            if (
                !spatial
            ) {

                return null;

            }


            const spatialType =

                HeatmapEngine
                    .normalizeKey(
                        spatial.spatialType
                    );


            if (
                spatialType !==
                "COMPARTMENT" &&

                spatialType !==
                "RANGE"
            ) {

                return null;

            }


            let features =

                [];


            if (
                Array.isArray(
                    spatial.features
                )
            ) {

                features =

                    spatial.features
                        .filter(
                            Boolean
                        );

            }


            if (
                !features.length &&
                spatial.feature
            ) {

                features =

                    [
                        spatial.feature
                    ];

            }


            if (
                !features.length
            ) {

                return null;

            }


            return {

                spatialType:
                    spatial.spatialType,


                type:
                    spatial.type,


                hotspot:
                    spatial.hotspot,


                feature:

                    features.length ===
                    1

                        ? features[0]

                        : null,


                features:
                    features,


                compartment:
                    spatial.compartment ||
                    "",


                range:
                    spatial.range ||
                    "",


                heatWeight:

                    Number(
                        spatial.heatWeight
                    ) ||

                    1,


                porKey:
                    spatial.porKey ||
                    "",


                porKeys:

                    Array.isArray(
                        spatial.porKeys
                    )

                        ? spatial.porKeys
                            .slice()

                        : [],


                caseIds:

                    Array.isArray(
                        spatial.caseIds
                    )

                        ? spatial.caseIds
                            .slice()

                        : []

            };

        };


    /* =====================================================
       SOURCE POLYGON DATA
       ===================================================== */


    HeatmapEngine.getSourceCompartmentPolygons =
        function () {

            return HeatmapEngine
                .getSourceCompartments()
                .map(

                    HeatmapEngine
                        .createPolygonEntry

                )
                .filter(
                    Boolean
                );

        };


    HeatmapEngine.getSourceRangePolygons =
        function () {

            return HeatmapEngine
                .getSourceRanges()
                .map(

                    HeatmapEngine
                        .createPolygonEntry

                )
                .filter(
                    Boolean
                );

        };


    /* =====================================================
       TARGET POLYGON DATA
       ===================================================== */


    HeatmapEngine.getTargetCompartmentPolygons =
        function () {

            return HeatmapEngine
                .getTargetCompartments()
                .map(

                    HeatmapEngine
                        .createPolygonEntry

                )
                .filter(
                    Boolean
                );

        };


    HeatmapEngine.getTargetRangePolygons =
        function () {

            return HeatmapEngine
                .getTargetRanges()
                .map(

                    HeatmapEngine
                        .createPolygonEntry

                )
                .filter(
                    Boolean
                );

        };


    /* =====================================================
       ALL SOURCE POLYGONS
       ===================================================== */


    HeatmapEngine.getSourcePolygons =
        function () {

            return [

                ...HeatmapEngine
                    .getSourceCompartmentPolygons(),

                ...HeatmapEngine
                    .getSourceRangePolygons()

            ];

        };


    /* =====================================================
       ALL TARGET POLYGONS
       ===================================================== */


    HeatmapEngine.getTargetPolygons =
        function () {

            return [

                ...HeatmapEngine
                    .getTargetCompartmentPolygons(),

                ...HeatmapEngine
                    .getTargetRangePolygons()

            ];

        };

    /* =====================================================
       NORMALIZE GIS NAME
       ===================================================== */

    /* =====================================================
       NORMALIZE GIS NAME
       ===================================================== */

    HeatmapEngine.normalizeGISName =
        function (

            value

        ) {

            /*
             * =============================================
             * NULL / EMPTY GUARD
             * =============================================
             */

            if (
                value == null
            ) {

                return "";

            }


            const rawValue =

                String(
                    value
                )
                    .trim();


            if (
                !rawValue
            ) {

                return "";

            }


            /*
             * =============================================
             * CANONICAL GREENGUARD NORMALIZER
             * =============================================
             *
             * GG.normalizeName() is the authoritative
             * normalizer used by GISEntities.
             *
             * HeatmapEngine must use the same normalization
             * contract whenever it is available.
             */

            if (
                typeof GG.normalizeName ===
                "function"
            ) {

                try {

                    const normalized =

                        GG.normalizeName(
                            rawValue
                        );


                    if (
                        normalized
                    ) {

                        return normalized;

                    }

                }

                catch (
                    error
                ) {

                    /*
                     * Do not fail spatial resolution because
                     * the shared normalizer failed.
                     *
                     * Continue through the local fallback.
                     */

                    if (
                        Constants.DEBUG
                            ?.ENABLED
                    ) {

                        console.warn(

                            "[OffenceHeatmapEngine] " +
                            "GG.normalizeName() failed. " +
                            "Using local GIS normalization.",

                            {

                                value:
                                    rawValue,

                                error:
                                    error

                            }

                        );

                    }

                }

            }


            /*
             * =============================================
             * LOCAL FALLBACK NORMALIZATION
             * =============================================
             *
             * This fallback mirrors the canonical
             * GISEntities normalization strategy.
             *
             * Examples:
             *
             * BTR_W
             *      → BTR W
             *      → BUXATR WEST
             *      → BUXATRWEST
             *
             * BuxaTR_West
             *      → BUXATR WEST
             *      → BUXATRWEST
             *
             * BTR_E
             *      → BTR E
             *      → BUXATR EAST
             *      → BUXATREAST
             *
             * BuxaTR_East
             *      → BUXATR EAST
             *      → BUXATREAST
             *
             * WRVK
             *      → WRVK
             *
             * WDPO
             *      → WDPO
             *
             * PANA
             *      → PANA
             */

            let text =

                rawValue

                    .normalize(
                        "NFKD"
                    )

                    .replace(
                        /[\u0300-\u036f]/g,
                        ""
                    )

                    .toUpperCase()

                    .trim();


            /*
             * =============================================
             * NORMALIZE SYMBOLS
             * =============================================
             *
             * Underscore is intentionally converted to
             * whitespace here.
             *
             * Therefore:
             *
             * BTR_W
             *      → BTR W
             *
             * BuxaTR_West
             *      → BUXATR WEST
             */

            text =

                text

                    .replace(
                        /&/g,
                        "AND"
                    )

                    .replace(
                        /[(){}\[\].,_\-\/\\]/g,
                        " "
                    )

                    .replace(
                        /\s+/g,
                        " "
                    )

                    .trim();


            /*
             * =============================================
             * CANONICAL GIS ALIASES
             * =============================================
             *
             * IMPORTANT:
             *
             * Multiple historical naming conventions
             * resolve to one canonical identity.
             *
             * WEST:
             *
             * BTR_W
             * BTRW
             * BTR WEST
             * BuxaTR_West
             * Buxa TR West
             * Buxa Tiger Reserve West
             *
             *          ↓
             *
             * BUXATRWEST
             *
             *
             * EAST:
             *
             * BTR_E
             * BTRE
             * BTR EAST
             * BuxaTR_East
             * Buxa TR East
             * Buxa Tiger Reserve East
             *
             *          ↓
             *
             * BUXATREAST
             */

            const aliases = {


                /*
                 * =========================================
                 * BUXA TIGER RESERVE WEST
                 * =========================================
                 */

                "BTR W":

                    "BUXATR WEST",


                "BTRW":

                    "BUXATR WEST",


                "BTR WEST":

                    "BUXATR WEST",


                "BTR WEST DIVISION":

                    "BUXATR WEST",


                "BTR WEST FOREST DIVISION":

                    "BUXATR WEST",


                "BTR WEST RANGE":

                    "BUXATR WEST",


                "BTR WEST CIRCLE":

                    "BUXATR WEST",


                /*
                 * BuxaTR_West becomes
                 * BUXATR WEST before alias lookup.
                 */

                "BUXATR WEST":

                    "BUXATR WEST",


                "BUXA TR WEST":

                    "BUXATR WEST",


                "BUXA TIGER RESERVE WEST":

                    "BUXATR WEST",


                "BUXA TIGER RESERVE WEST DIVISION":

                    "BUXATR WEST",


                "BUXA TIGER RESERVE WEST FOREST DIVISION":

                    "BUXATR WEST",


                /*
                 * =========================================
                 * BUXA TIGER RESERVE EAST
                 * =========================================
                 */

                "BTR E":

                    "BUXATR EAST",


                "BTRE":

                    "BUXATR EAST",


                "BTR EAST":

                    "BUXATR EAST",


                "BTR EAST DIVISION":

                    "BUXATR EAST",


                "BTR EAST FOREST DIVISION":

                    "BUXATR EAST",


                "BTR EAST RANGE":

                    "BUXATR EAST",


                "BTR EAST CIRCLE":

                    "BUXATR EAST",


                /*
                 * BuxaTR_East becomes
                 * BUXATR EAST before alias lookup.
                 */

                "BUXATR EAST":

                    "BUXATR EAST",


                "BUXA TR EAST":

                    "BUXATR EAST",


                "BUXA TIGER RESERVE EAST":

                    "BUXATR EAST",


                "BUXA TIGER RESERVE EAST DIVISION":

                    "BUXATR EAST",


                "BUXA TIGER RESERVE EAST FOREST DIVISION":

                    "BUXATR EAST"

            };


            /*
             * =============================================
             * APPLY ALIAS
             * =============================================
             */

            if (
                Object.prototype
                    .hasOwnProperty
                    .call(
                        aliases,
                        text
                    )
            ) {

                text =

                    aliases[
                        text
                    ];

            }


            /*
             * =============================================
             * REMOVE GENERIC GIS SUFFIX
             * =============================================
             *
             * This is intentionally conservative.
             *
             * Do NOT remove RANGE from arbitrary range
             * names because the actual GeoJSON property
             * may depend on it.
             *
             * Known BTR aliases have already been handled
             * above.
             */


            /*
             * =============================================
             * FINAL CANONICAL KEY
             * =============================================
             *
             * Remove whitespace only after alias resolution.
             *
             * Examples:
             *
             * BTR_W
             *      → BUXATRWEST
             *
             * BuxaTR_West
             *      → BUXATRWEST
             *
             * BTR_E
             *      → BUXATREAST
             *
             * BuxaTR_East
             *      → BUXATREAST
             *
             * WRVK
             *      → WRVK
             *
             * WLMSQ-II
             *      → WLMSQII
             */

            return text

                .replace(
                    /\s+/g,
                    ""
                );

        };
    /* =====================================================
       POLYGON AGGREGATION
       ===================================================== */


    HeatmapEngine.aggregatePolygonEntries =
        function (

            entries

        ) {

            const result =

                new Map();


            for (
                const entry
                of (
                    Array.isArray(
                        entries
                    )

                        ? entries

                        : []
                )
            ) {

                if (
                    !entry
                ) {

                    continue;

                }


                const spatialType =

                    HeatmapEngine
                        .normalizeKey(
                            entry.spatialType
                        );


                const name =

                    spatialType ===
                    "COMPARTMENT"

                        ? entry.compartment

                        : entry.range;


                const normalizedName =

                    HeatmapEngine
                        .normalizeGISName(
                            name
                        );


                if (
                    !normalizedName
                ) {

                    continue;

                }


                const key =

                    spatialType +

                    "::" +

                    normalizedName;


                if (
                    !result.has(
                        key
                    )
                ) {

                    result.set(

                        key,

                        {

                            key:
                                key,


                            spatialType:
                                entry.spatialType,


                            type:
                                entry.type,


                            name:
                                name,


                            compartment:

                                spatialType ===
                                "COMPARTMENT"

                                    ? name

                                    : "",


                            range:

                                spatialType ===
                                "RANGE"

                                    ? name

                                    : "",


                            features:

                                Array.isArray(
                                    entry.features
                                )

                                    ? entry.features
                                        .slice()

                                    : [],


                            heatWeight:
                                0,


                            offenceCount:
                                0,


                            hotspotCount:
                                0,


                            hotspots:
                                [],


                            porKeys:
                                [],


                            caseIds:
                                []

                        }

                    );

                }


                const aggregate =

                    result.get(
                        key
                    );


                aggregate.hotspotCount +=
                    1;


                aggregate.heatWeight +=

                    Number(
                        entry.heatWeight
                    ) ||

                    1;


                aggregate.offenceCount +=

                    Number(
                        entry.hotspot
                            ?.offenceCount
                    ) ||

                    1;


                if (
                    entry.hotspot
                ) {

                    HeatmapEngine
                        .addUniqueObject(

                            aggregate.hotspots,

                            entry.hotspot,

                            HeatmapEngine
                                .getHotspotId

                        );

                }


                for (
                    const porKey
                    of (
                        Array.isArray(
                            entry.porKeys
                        )

                            ? entry.porKeys

                            : []
                    )
                ) {

                    HeatmapEngine
                        .addUnique(

                            aggregate.porKeys,

                            porKey,

                            HeatmapEngine
                                .normalizePorKey

                        );

                }


                for (
                    const caseId
                    of (
                        Array.isArray(
                            entry.caseIds
                        )

                            ? entry.caseIds

                            : []
                    )
                ) {

                    HeatmapEngine
                        .addUnique(

                            aggregate.caseIds,

                            caseId,

                            HeatmapEngine
                                .normalizeKey

                        );

                }

            }


            return Array.from(
                result.values()
            );

        };


    /* =====================================================
       AGGREGATED SOURCE POLYGONS
       ===================================================== */


    HeatmapEngine.getAggregatedSourcePolygons =
        function () {

            return HeatmapEngine
                .aggregatePolygonEntries(

                    HeatmapEngine
                        .getSourcePolygons()

                );

        };


    /* =====================================================
       AGGREGATED TARGET POLYGONS
       ===================================================== */


    HeatmapEngine.getAggregatedTargetPolygons =
        function () {

            return HeatmapEngine
                .aggregatePolygonEntries(

                    HeatmapEngine
                        .getTargetPolygons()

                );

        };


    /* =====================================================
       CANONICAL SPATIAL OUTPUT
       ===================================================== */


    HeatmapEngine.getSpatialHeatmapData =
        function () {

            return {

                /*
                 * Leaflet.heat-compatible point arrays.
                 */

                sourceHeat:

                    HeatmapEngine
                        .getSourceHeatPoints(),


                targetHeat:

                    HeatmapEngine
                        .getTargetHeatPoints(),


                /*
                 * Individual polygon representations.
                 */

                sourceCompartments:

                    HeatmapEngine
                        .getSourceCompartmentPolygons(),


                targetCompartments:

                    HeatmapEngine
                        .getTargetCompartmentPolygons(),


                sourceRanges:

                    HeatmapEngine
                        .getSourceRangePolygons(),


                targetRanges:

                    HeatmapEngine
                        .getTargetRangePolygons(),


                /*
                 * Aggregated polygon heat layers.
                 *
                 * These are intended for MapRenderer.
                 */

                sourcePolygons:

                    HeatmapEngine
                        .getAggregatedSourcePolygons(),


                targetPolygons:

                    HeatmapEngine
                        .getAggregatedTargetPolygons(),


                /*
                 * Diagnostic data.
                 */

                unmappedSources:

                    HeatmapEngine
                        .getUnmappedSources(),


                unmappedTargets:

                    HeatmapEngine
                        .getUnmappedTargets(),


                stats:

                    HeatmapEngine
                        .getSpatialStats()

            };

        };


    /* =====================================================
       BUILD SOURCE → TARGET LINKS
       ===================================================== */


    HeatmapEngine.buildLinks =
        function () {

            const links =

                [];


            const seen =

                new Set();


            for (
                const [
                    porKey,
                    relation
                ]
                of HeatmapEngine
                    .porIndex
                    .entries()
            ) {

                if (
                    !relation
                ) {

                    continue;

                }


                const sources =

                    Array.isArray(
                        relation.sources
                    )

                        ? relation.sources

                        : [];


                const targets =

                    Array.isArray(
                        relation.targets
                    )

                        ? relation.targets

                        : [];


                /*
                 * A POR relationship may have only a
                 * source or only a target.
                 *
                 * A visual link requires both.
                 */

                if (
                    !sources.length ||

                    !targets.length
                ) {

                    continue;

                }


                for (
                    const source
                    of sources
                ) {

                    const sourceId =

                        HeatmapEngine
                            .getHotspotId(
                                source
                            );


                    if (
                        !sourceId
                    ) {

                        continue;

                    }


                    for (
                        const target
                        of targets
                    ) {

                        const targetId =

                            HeatmapEngine
                                .getHotspotId(
                                    target
                                );


                        if (
                            !targetId
                        ) {

                            continue;

                        }


                        const linkKey =

                            HeatmapEngine
                                .normalizeKey(
                                    porKey
                                ) +

                            "::" +

                            HeatmapEngine
                                .normalizeKey(
                                    sourceId
                                ) +

                            "::" +

                            HeatmapEngine
                                .normalizeKey(
                                    targetId
                                );


                        if (
                            seen.has(
                                linkKey
                            )
                        ) {

                            continue;

                        }


                        seen.add(
                            linkKey
                        );


                        links.push({

                            id:
                                linkKey,


                            porKey:
                                porKey,


                            porNo:

                                relation.porNo ||

                                porKey,


                            sourceId:
                                sourceId,


                            targetId:
                                targetId,


                            source:
                                source,


                            target:
                                target

                        });

                    }

                }

            }


            HeatmapEngine.data.links =

                links;


            return links;

        };

     /* =====================================================
       GET SOURCE HOTSPOTS BY POR
       ===================================================== */


    HeatmapEngine.getSourcesByPor =
        function (

            porKey

        ) {

            const key =

                HeatmapEngine
                    .normalizePorKey(
                        porKey
                    );


            if (
                !key
            ) {

                return [];

            }


            const relation =

                HeatmapEngine
                    .porIndex
                    .get(
                        key
                    );


            if (
                !relation
            ) {

                return [];

            }


            return Array.isArray(
                relation.sources
            )

                ? relation.sources

                : [];

        };


    /* =====================================================
       GET TARGET HOTSPOTS BY POR
       ===================================================== */


    HeatmapEngine.getTargetsByPor =
        function (

            porKey

        ) {

            const key =

                HeatmapEngine
                    .normalizePorKey(
                        porKey
                    );


            if (
                !key
            ) {

                return [];

            }


            const relation =

                HeatmapEngine
                    .porIndex
                    .get(
                        key
                    );


            if (
                !relation
            ) {

                return [];

            }


            return Array.isArray(
                relation.targets
            )

                ? relation.targets

                : [];

        };


    /* =====================================================
       GET RELATION BY POR
       ===================================================== */


    HeatmapEngine.getByPor =
        function (

            porKey

        ) {

            const key =

                HeatmapEngine
                    .normalizePorKey(
                        porKey
                    );


            if (
                !key
            ) {

                return null;

            }


            return (

                HeatmapEngine
                    .porIndex
                    .get(
                        key
                    ) ||

                null

            );

        };


    /* =====================================================
       GET POR CASCADE
       ===================================================== */


    HeatmapEngine.getPorCascade =
        function (

            porKey

        ) {

            const key =

                HeatmapEngine
                    .normalizePorKey(
                        porKey
                    );


            if (
                !key
            ) {

                return null;

            }


            const relation =

                HeatmapEngine
                    .porIndex
                    .get(
                        key
                    );


            if (
                relation
            ) {

                return relation;

            }


            /*
             * Fallback directly to OffenceStore.
             *
             * POR remains the authoritative connector.
             */

            return HeatmapEngine
                .getStoreCascadeByPor(
                    key
                );

        };


    /* =====================================================
       GET HOTSPOT BY ID
       ===================================================== */


    HeatmapEngine.getHotspotById =
        function (

            hotspotId

        ) {

            const key =

                HeatmapEngine
                    .normalizeKey(
                        hotspotId
                    );


            if (
                !key
            ) {

                return null;

            }


            const entry =

                HeatmapEngine
                    .hotspotIndex
                    .get(
                        key
                    );


            if (
                !entry
            ) {

                return null;

            }


            return entry;

        };


    /* =====================================================
       GET RELATION BY CASE ID
       ===================================================== */


    HeatmapEngine.getByCaseId =
        function (

            caseId

        ) {

            const key =

                HeatmapEngine
                    .normalizeKey(
                        caseId
                    );


            if (
                !key
            ) {

                return null;

            }


            return (

                HeatmapEngine
                    .caseIndex
                    .get(
                        key
                    ) ||

                null

            );

        };


    /* =====================================================
       GET SOURCE HOTSPOTS
       ===================================================== */


    HeatmapEngine.getSourceHotspots =
        function () {

            return Array.isArray(
                HeatmapEngine.data
                    ?.sources
            )

                ? HeatmapEngine
                    .data
                    .sources

                : [];

        };


    /* =====================================================
       GET TARGET HOTSPOTS
       ===================================================== */


    HeatmapEngine.getTargetHotspots =
        function () {

            return Array.isArray(
                HeatmapEngine.data
                    ?.targets
            )

                ? HeatmapEngine
                    .data
                    .targets

                : [];

        };


    /* =====================================================
       GET LINKS
       ===================================================== */


    HeatmapEngine.getLinks =
        function () {

            return Array.isArray(
                HeatmapEngine.data
                    ?.links
            )

                ? HeatmapEngine
                    .data
                    .links

                : [];

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


            switch (
                normalized
            ) {

                case "SOURCE":

                    HeatmapEngine.mode =

                        HeatmapEngine
                            .MODE
                            .SOURCE;

                    break;


                case "TARGET":

                    HeatmapEngine.mode =

                        HeatmapEngine
                            .MODE
                            .TARGET;

                    break;


                case "ALL":

                case "BOTH":

                default:

                    HeatmapEngine.mode =

                        HeatmapEngine
                            .MODE
                            .BOTH;

                    break;

            }


            return HeatmapEngine.mode;

        };


    /* =====================================================
       CANONICAL HEATMAP OUTPUT
       ===================================================== */


    HeatmapEngine.getHeatmapData =
        function () {

            const spatial =

                HeatmapEngine
                    .getSpatialHeatmapData();


            const mode =

                HeatmapEngine.mode;


            /*
             * Canonical hotspot arrays remain available.
             *
             * These arrays are authoritative business
             * intelligence objects.
             */

            const sources =

                HeatmapEngine
                    .getSourceHotspots();


            const targets =

                HeatmapEngine
                    .getTargetHotspots();


            const links =

                HeatmapEngine
                    .getLinks();


            /*
             * Mode filtering applies to renderable output.
             */

            let sourceHeat =

                spatial.sourceHeat;


            let targetHeat =

                spatial.targetHeat;


            let sourcePolygons =

                spatial.sourcePolygons;


            let targetPolygons =

                spatial.targetPolygons;


            if (
                mode ===
                HeatmapEngine.MODE.SOURCE
            ) {

                targetHeat =
                    [];

                targetPolygons =
                    [];

            }


            if (
                mode ===
                HeatmapEngine.MODE.TARGET
            ) {

                sourceHeat =
                    [];

                sourcePolygons =
                    [];

            }


            return {

                /*
                 * Current visualization mode.
                 */

                mode:
                    mode,


                /*
                 * Canonical business hotspots.
                 */

                sources:
                    sources,


                targets:
                    targets,


                /*
                 * POR-authoritative source-target links.
                 */

                links:
                    links,


                /*
                 * Leaflet.heat-compatible point data.
                 */

                sourceHeat:
                    sourceHeat,


                targetHeat:
                    targetHeat,


                /*
                 * Polygon fallback data.
                 *
                 * Priority was already resolved as:
                 *
                 * POINT
                 *   ↓
                 * COMPARTMENT
                 *   ↓
                 * RANGE
                 */

                sourcePolygons:
                    sourcePolygons,


                targetPolygons:
                    targetPolygons,


                /*
                 * Detailed polygon categories.
                 */

                sourceCompartments:

                    mode ===
                    HeatmapEngine.MODE.TARGET

                        ? []

                        : spatial
                            .sourceCompartments,


                targetCompartments:

                    mode ===
                    HeatmapEngine.MODE.SOURCE

                        ? []

                        : spatial
                            .targetCompartments,


                sourceRanges:

                    mode ===
                    HeatmapEngine.MODE.TARGET

                        ? []

                        : spatial
                            .sourceRanges,


                targetRanges:

                    mode ===
                    HeatmapEngine.MODE.SOURCE

                        ? []

                        : spatial
                            .targetRanges,


                /*
                 * Diagnostics.
                 */

                unmappedSources:
                    spatial.unmappedSources,


                unmappedTargets:
                    spatial.unmappedTargets,


                spatialStats:
                    spatial.stats,


                ready:
                    HeatmapEngine.ready

            };

        };


    /* =====================================================
       ENGINE STATE
       ===================================================== */


    HeatmapEngine.getState =
        function () {

            const sources =

                HeatmapEngine
                    .getSourceHotspots();


            const targets =

                HeatmapEngine
                    .getTargetHotspots();


            const links =

                HeatmapEngine
                    .getLinks();


            const spatialStats =

                HeatmapEngine
                    .getSpatialStats();


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


                /*
                 * Canonical hotspot counts.
                 */

                sourceHotspots:
                    sources.length,


                targetHotspots:
                    targets.length,


                /*
                 * POR relationship indexes.
                 */

                hotspotIndex:
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


                links:
                    links.length,


                /*
                 * Spatial rendering state.
                 */

                spatial:
                    spatialStats,


                sourcePoints:

                    spatialStats
                        .source
                        .points,


                sourceCompartments:

                    spatialStats
                        .source
                        .compartments,


                sourceRanges:

                    spatialStats
                        .source
                        .ranges,


                unmappedSources:

                    spatialStats
                        .source
                        .unmapped,


                targetPoints:

                    spatialStats
                        .target
                        .points,


                targetCompartments:

                    spatialStats
                        .target
                        .compartments,


                targetRanges:

                    spatialStats
                        .target
                        .ranges,


                unmappedTargets:

                    spatialStats
                        .target
                        .unmapped

            };

        };


    /* =====================================================
       CLEAR
       ===================================================== */


    HeatmapEngine.clear =
        function () {

            /*
             * Canonical engine data.
             */

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


            /*
             * Relationship indexes.
             */

            HeatmapEngine
                .hotspotIndex
                .clear();


            HeatmapEngine
                .porIndex
                .clear();


            HeatmapEngine
                .caseIndex
                .clear();


            /*
             * Spatial indexes.
             *
             * These indexes are rebuilt from current GIS
             * globals during the next spatial build.
             */

            if (
                HeatmapEngine
                    .spatialIndex
                    ?.compartments
            ) {

                HeatmapEngine
                    .spatialIndex
                    .compartments
                    .clear();

            }


            if (
                HeatmapEngine
                    .spatialIndex
                    ?.ranges
            ) {

                HeatmapEngine
                    .spatialIndex
                    .ranges
                    .clear();

            }


            /*
             * Derived spatial output.
             */

            HeatmapEngine
                .resetSpatial();


            /*
             * Runtime state.
             */

            HeatmapEngine.ready =
                false;


            HeatmapEngine.building =
                false;


            HeatmapEngine.lastBuildAt =
                null;


            return HeatmapEngine;

        };


    /* =====================================================
       REBUILD INDEXES
       ===================================================== */


    HeatmapEngine.rebuildIndexes =
        function () {

            HeatmapEngine
                .resetIndexes();


            const sources =

                HeatmapEngine
                    .getSourceHotspots();


            const targets =

                HeatmapEngine
                    .getTargetHotspots();


            /*
             * =============================================
             * REGISTER SOURCES
             * =============================================
             */

            for (
                const source
                of sources
            ) {

                HeatmapEngine
                    .registerSourceHotspot(
                        source
                    );

            }


            /*
             * =============================================
             * REGISTER TARGETS
             * =============================================
             */

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
             * =============================================
             * HYDRATE BUSINESS DATA BY POR
             * =============================================
             */

            HeatmapEngine
                .hydrateAllPorRelations();


            /*
             * =============================================
             * BUILD SOURCE → TARGET POR LINKS
             * =============================================
             */

            HeatmapEngine
                .buildLinks();


            /*
             * =============================================
             * BUILD GIS SPATIAL REPRESENTATION
             * =============================================
             *
             * Every hotspot is resolved using:
             *
             * 1. Valid GPS point
             * 2. Compartment GeoJSON
             * 3. Range GeoJSON
             * 4. Unmapped
             */

            HeatmapEngine
                .buildSpatialData();


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                const spatialStats =

                    HeatmapEngine
                        .getSpatialStats();


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


                        links:

                            HeatmapEngine
                                .getLinks()
                                .length,


                        sourcePoints:

                            spatialStats
                                .source
                                .points,


                        sourceCompartments:

                            spatialStats
                                .source
                                .compartments,


                        sourceRanges:

                            spatialStats
                                .source
                                .ranges,


                        targetPoints:

                            spatialStats
                                .target
                                .points,


                        targetCompartments:

                            spatialStats
                                .target
                                .compartments,


                        targetRanges:

                            spatialStats
                                .target
                                .ranges

                    }

                );

            }


            return HeatmapEngine;

        };

     /* =====================================================
       BUILD ENGINE
       ===================================================== */


    HeatmapEngine.build =
        async function (

            options = {}

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


            const startedAt =

                Date.now();


            try {


                /*
                 * =========================================
                 * RESOLVE DEPENDENCIES
                 * =========================================
                 */

                const SourceEngine =

                    GG.Offence
                        .SourceEngine;


                const TargetEngine =

                    GG.Offence
                        .TargetEngine;


                if (
                    !SourceEngine
                ) {

                    throw new Error(

                        "OffenceSourceEngine unavailable."

                    );

                }


                if (
                    !TargetEngine
                ) {

                    throw new Error(

                        "OffenceTargetEngine unavailable."

                    );

                }


                /*
                 * =========================================
                 * INITIALIZE ENGINES
                 * =========================================
                 */

                if (
                    typeof SourceEngine.init ===
                    "function"
                ) {

                    SourceEngine
                        .init();

                }


                if (
                    typeof TargetEngine.init ===
                    "function"
                ) {

                    TargetEngine
                        .init();

                }


                /*
                 * =========================================
                 * OPTIONAL SOURCE / TARGET BUILD
                 * =========================================
                 *
                 * UIController may already have built both
                 * engines.
                 *
                 * Rebuilding is therefore optional.
                 */

                if (
                    options.buildEngines ===
                    true
                ) {

                    if (
                        typeof SourceEngine
                            .buildFromStore ===
                        "function"
                    ) {

                        await SourceEngine
                            .buildFromStore();

                    }

                    else if (
                        typeof SourceEngine
                            .build ===
                        "function"
                    ) {

                        await SourceEngine
                            .build();

                    }


                    if (
                        typeof TargetEngine
                            .buildFromStore ===
                        "function"
                    ) {

                        await TargetEngine
                            .buildFromStore();

                    }

                    else if (
                        typeof TargetEngine
                            .build ===
                        "function"
                    ) {

                        await TargetEngine
                            .build();

                    }

                }


                /*
                 * =========================================
                 * GET CANONICAL HOTSPOTS
                 * =========================================
                 */

                const sources =

                    typeof SourceEngine
                        .getHotspots ===
                    "function"

                        ? SourceEngine
                            .getHotspots()

                        : [];


                const targets =

                    typeof TargetEngine
                        .getHotspots ===
                    "function"

                        ? TargetEngine
                            .getHotspots()

                        : [];


                /*
                 * =========================================
                 * RESET CANONICAL DATA
                 * =========================================
                 *
                 * IMPORTANT:
                 *
                 * Do NOT call clear() after assigning
                 * sources and targets because clear()
                 * empties canonical data.
                 */

                HeatmapEngine.data = {

                    resolvedContexts:
                        [],


                    sources:

                        Array.isArray(
                            sources
                        )

                            ? sources
                                .slice()

                            : [],


                    targets:

                        Array.isArray(
                            targets
                        )

                            ? targets
                                .slice()

                            : [],


                    links:
                        []

                };


                /*
                 * =========================================
                 * REBUILD RELATIONSHIP + SPATIAL INDEXES
                 * =========================================
                 */

                HeatmapEngine
                    .rebuildIndexes();


                /*
                 * =========================================
                 * ENGINE READY
                 * =========================================
                 */

                HeatmapEngine.ready =
                    true;


                HeatmapEngine.lastBuildAt =
                    Date.now();


                const result =

                    HeatmapEngine
                        .getHeatmapData();


                if (
                    Constants.DEBUG
                        ?.ENABLED
                ) {

                    const spatialStats =

                        HeatmapEngine
                            .getSpatialStats();


                    console.log(

                        "🔥 OffenceHeatmapEngine Built",

                        {

                            version:
                                HeatmapEngine.VERSION,


                            sourceHotspots:

                                HeatmapEngine
                                    .getSourceHotspots()
                                    .length,


                            targetHotspots:

                                HeatmapEngine
                                    .getTargetHotspots()
                                    .length,


                            sourcePoints:

                                spatialStats
                                    .source
                                    .points,


                            sourceCompartments:

                                spatialStats
                                    .source
                                    .compartments,


                            sourceRanges:

                                spatialStats
                                    .source
                                    .ranges,


                            unmappedSources:

                                spatialStats
                                    .source
                                    .unmapped,


                            targetPoints:

                                spatialStats
                                    .target
                                    .points,


                            targetCompartments:

                                spatialStats
                                    .target
                                    .compartments,


                            targetRanges:

                                spatialStats
                                    .target
                                    .ranges,


                            unmappedTargets:

                                spatialStats
                                    .target
                                    .unmapped,


                            porRelations:

                                HeatmapEngine
                                    .porIndex
                                    .size,


                            links:

                                HeatmapEngine
                                    .getLinks()
                                    .length,


                            duration:

                                Date.now() -
                                startedAt

                        }

                    );

                }


                return result;

            }

            catch (
                error
            ) {

                HeatmapEngine.ready =
                    false;


                console.error(

                    "[OffenceHeatmapEngine] Build failed.",

                    error

                );


                throw error;

            }

            finally {

                HeatmapEngine.building =
                    false;

            }

        };


    /* =====================================================
       BUILD FROM ENGINES
       ===================================================== */


    HeatmapEngine.buildFromEngines =
        async function () {

            return HeatmapEngine
                .build({

                    buildEngines:
                        false

                });

        };


    /* =====================================================
       BUILD FROM STORE
       ===================================================== */


    HeatmapEngine.buildFromStore =
        async function () {

            return HeatmapEngine
                .build({

                    buildEngines:
                        true

                });

        };


    /* =====================================================
       REFRESH
       ===================================================== */


    HeatmapEngine.refresh =
        async function (

            options = {}

        ) {

            return HeatmapEngine
                .build(

                    options

                );

        };


    /* =====================================================
       REBUILD SPATIAL DATA ONLY
       ===================================================== */


    HeatmapEngine.refreshSpatial =
        function () {

            /*
             * Useful when GIS GeoJSON loads after the
             * offence intelligence pipeline.
             *
             * No offence data needs to be rebuilt.
             */

            HeatmapEngine
                .buildSpatialData();


            return HeatmapEngine
                .getSpatialHeatmapData();

        };


    /* =====================================================
       GIS READY REFRESH
       ===================================================== */


    HeatmapEngine.handleGISReady =
        function () {

            if (
                !HeatmapEngine.ready
            ) {

                return false;

            }


            try {

                HeatmapEngine
                    .refreshSpatial();


                /*
                 * Notify renderer that spatial data changed.
                 */

                HeatmapEngine
                    .dispatchEvent(

                        Constants.EVENTS
                            ?.HEATMAP_UPDATED ||

                        "offence:heatmap-updated",

                        {

                            source:
                                "GIS_READY",


                            heatmap:

                                HeatmapEngine
                                    .getHeatmapData(),


                            state:

                                HeatmapEngine
                                    .getState()

                        }

                    );


                return true;

            }

            catch (
                error
            ) {

                console.error(

                    "[OffenceHeatmapEngine] GIS refresh failed.",

                    error

                );


                return false;

            }

        };


    /* =====================================================
       EVENT DISPATCH
       ===================================================== */


    HeatmapEngine.dispatchEvent =
        function (

            eventName,

            detail = {}

        ) {

            if (
                !eventName
            ) {

                return false;

            }


            if (
                typeof window
                    .dispatchEvent !==
                "function"
            ) {

                return false;

            }


            try {

                window
                    .dispatchEvent(

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

                    "[OffenceHeatmapEngine] Event dispatch failed.",

                    error

                );


                return false;

            }

        };


    /* =====================================================
       DISPATCH UPDATED
       ===================================================== */


    HeatmapEngine.dispatchUpdated =
        function (

            source = "BUILD"

        ) {

            return HeatmapEngine
                .dispatchEvent(

                    Constants.EVENTS
                        ?.HEATMAP_UPDATED ||

                    "offence:heatmap-updated",

                    {

                        source:
                            source,


                        heatmap:

                            HeatmapEngine
                                .getHeatmapData(),


                        state:

                            HeatmapEngine
                                .getState()

                    }

                );

        };


    /* =====================================================
       FULL BUILD + DISPATCH
       ===================================================== */


    HeatmapEngine.buildAndDispatch =
        async function (

            options = {}

        ) {

            const result =

                await HeatmapEngine
                    .build(
                        options
                    );


            HeatmapEngine
                .dispatchUpdated(
                    "BUILD"
                );


            return result;

        };


    /* =====================================================
       GIS EVENT BINDING
       ===================================================== */


    HeatmapEngine._gisEventsBound =
        false;


    HeatmapEngine.bindGISEvents =
        function () {

            if (
                HeatmapEngine
                    ._gisEventsBound
            ) {

                return HeatmapEngine;

            }


            /*
             * Different parts of GreenGuard may announce
             * GIS availability using different events.
             *
             * All listeners call the same safe refresh.
             */

            const events = [

                "gis:ready",

                "gis:data-ready",

                "gis:loaded",

                "greenguard:gis-ready"

            ];


            for (
                const eventName
                of events
            ) {

                window
                    .addEventListener(

                        eventName,

                        HeatmapEngine
                            .handleGISReady

                    );

            }


            HeatmapEngine
                ._gisEventsBound =
                true;


            return HeatmapEngine;

        };


    /* =====================================================
       GIS EVENT UNBINDING
       ===================================================== */


    HeatmapEngine.unbindGISEvents =
        function () {

            if (
                !HeatmapEngine
                    ._gisEventsBound
            ) {

                return HeatmapEngine;

            }


            const events = [

                "gis:ready",

                "gis:data-ready",

                "gis:loaded",

                "greenguard:gis-ready"

            ];


            for (
                const eventName
                of events
            ) {

                window
                    .removeEventListener(

                        eventName,

                        HeatmapEngine
                            .handleGISReady

                    );

            }


            HeatmapEngine
                ._gisEventsBound =
                false;


            return HeatmapEngine;

        };


    /* =====================================================
       INITIALIZE
       ===================================================== */


    HeatmapEngine.init =
        function () {

            if (
                HeatmapEngine.initialized
            ) {

                /*
                 * Ensure GIS listeners exist even when
                 * init() is called more than once.
                 */

                HeatmapEngine
                    .bindGISEvents();


                return HeatmapEngine;

            }


            HeatmapEngine.initialized =
                true;


            /*
             * Prepare GIS entity index if available.
             */

            HeatmapEngine
                .ensureGISEntitiesReady();


            /*
             * Bind late-GIS refresh support.
             */

            HeatmapEngine
                .bindGISEvents();


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

                            [
                                "POINT",
                                "COMPARTMENT",
                                "RANGE",
                                "UNMAPPED"
                            ]

                    }

                );

            }


            return HeatmapEngine;

        };


    /* =====================================================
       DESTROY
       ===================================================== */


    HeatmapEngine.destroy =
        function () {

            HeatmapEngine
                .unbindGISEvents();


            HeatmapEngine
                .clear();


            HeatmapEngine.initialized =
                false;


            return HeatmapEngine;

        };
       /* =====================================================
       EXPORT MODULE
       ===================================================== */


    GG.Offence.HeatmapEngine =

        HeatmapEngine;


    /* =====================================================
       AUTO INITIALIZE
       ===================================================== */


    HeatmapEngine
        .init();


    /* =====================================================
       READY LOG
       ===================================================== */


    if (
        Constants.DEBUG
            ?.ENABLED
    ) {

        console.log(

            "🔥 OffenceHeatmapEngine Module Loaded",

            {

                version:
                    HeatmapEngine.VERSION,


                initialized:
                    HeatmapEngine.initialized,


                authoritativeConnector:
                    "POR",


                spatialPriority:

                    [
                        "POINT",
                        "COMPARTMENT",
                        "RANGE",
                        "UNMAPPED"
                    ],


                gisEntityIntegration:

                    !!GG.GISEntities,


                capabilities: {

                    pointHeatmap:
                        true,

                    compartmentPolygon:
                        true,

                    rangePolygon:
                        true,

                    porCascade:
                        true,

                    sourceTargetLinks:
                        true,

                    lateGISRefresh:
                        true

                }

            }

        );

    }


})(

    window.GreenGuardAI

);
