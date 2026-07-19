/* =========================================================
   GreenGuard
   Offence Intelligence Module

   File:
   js/offence/offenceHeatmapEngine.js

   Version:
   2.0.0

   Purpose:
   - Coordinate SOURCE and TARGET hotspot engines
   - Build SOURCE and TARGET heatmap datasets
   - Maintain POR-authoritative spatial relationships
   - Prepare Leaflet.heat-compatible datasets
   - Preserve full hotspot metadata
   - Provide unified hotspot lookup
   - Provide POR-based cascade lookup
   - Provide secondary CaseID lookup
   - Build SOURCE → TARGET relationships by POR
   - Support incremental refresh

   AUTHORITATIVE RELATIONSHIP:

   SOURCE
   Accused Address
        │
        │
      porKey
        │
        ▼
   POR CASCADE
        │
        ├── Cases
        ├── Accused
        ├── Witnesses
        ├── Seizures
        └── Seized Articles
               │
               ▼
             TARGET
        Place of Seizure

   IMPORTANT:

   POR / porKey is the authoritative connector.

   CaseID:
   - May exist
   - May be missing
   - May be mismatched
   - Is secondary metadata only

   SeizureID:
   - Connects seizure → seized articles

   This module performs:
   - NO direct Leaflet rendering
   - NO popup HTML generation
   - NO DOM manipulation
   - NO Firestore queries
   - NO external geocoding API calls

   Dependencies:
   1. offenceConstants.js
   2. offenceStore.js
   3. offenceGeocoder.js
   4. offenceSourceEngine.js
   5. offenceTargetEngine.js
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


    const Store =
        GG.Offence.Store;


    const Geocoder =
        GG.Offence.Geocoder;


    const SourceEngine =
        GG.Offence.SourceEngine;


    const TargetEngine =
        GG.Offence.TargetEngine;


    if (!Constants) {

        console.error(
            "[OffenceHeatmapEngine] OffenceConstants unavailable."
        );

        return;

    }


    if (!Store) {

        console.error(
            "[OffenceHeatmapEngine] OffenceStore unavailable."
        );

        return;

    }


    if (!Geocoder) {

        console.error(
            "[OffenceHeatmapEngine] OffenceGeocoder unavailable."
        );

        return;

    }


    if (!SourceEngine) {

        console.error(
            "[OffenceHeatmapEngine] OffenceSourceEngine unavailable."
        );

        return;

    }


    if (!TargetEngine) {

        console.error(
            "[OffenceHeatmapEngine] OffenceTargetEngine unavailable."
        );

        return;

    }


    /* =====================================================
       3. MODULE
       ===================================================== */

    const HeatmapEngine = {};


    /* =====================================================
       4. MODULE INFORMATION
       ===================================================== */

    HeatmapEngine.VERSION =
        "2.0.0";


    HeatmapEngine.initialized =
        false;


    HeatmapEngine.building =
        false;


    HeatmapEngine.ready =
        false;


    HeatmapEngine.lastBuildAt =
        null;


    /* =====================================================
       5. DISPLAY MODES
       ===================================================== */

    HeatmapEngine.MODE =
        Object.freeze({

            SOURCE:
                "SOURCE",

            TARGET:
                "TARGET",

            BOTH:
                "BOTH",

            FLOW:
                "FLOW"

        });


    /* =====================================================
       6. CURRENT DISPLAY MODE
       ===================================================== */

    HeatmapEngine.mode =
        Constants.DEFAULT_MAP_MODE ||
        HeatmapEngine.MODE.BOTH;


    /* =====================================================
       7. MASTER SPATIAL DATA
       ===================================================== */

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


    /* =====================================================
       8. HOTSPOT INDEX

       hotspotId
           ↓
       {
           type,
           hotspot
       }
       ===================================================== */

    HeatmapEngine.hotspotIndex =
        new Map();


    /* =====================================================
       9. POR RELATION INDEX

       AUTHORITATIVE INDEX

       porKey
          ↓
       {
           porKey,
           porNo,

           cases: [],
           accused: [],
           witnesses: [],
           seizures: [],
           seizedArticles: [],

           sources: [],
           targets: []
       }

       This is the PRIMARY relationship index.
       ===================================================== */

    HeatmapEngine.porIndex =
        new Map();


    /* =====================================================
       10. CASE RELATION INDEX

       SECONDARY INDEX ONLY

       CaseID
          ↓
       {
           caseId,
           case,
           porKeys: [],
           sources: [],
           targets: []
       }

       CaseID is NOT used as the authoritative
       SOURCE → TARGET connector.
       ===================================================== */

    HeatmapEngine.caseIndex =
        new Map();


    /* =====================================================
       11. INITIALIZE
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
                            "POR_AUTHORITATIVE"

                    }

                );

            }


            return HeatmapEngine;

        };
       /* =====================================================
       12. NORMALIZE GENERIC KEY
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

                .replace(
                    /\s+/g,
                    " "
                )

                .toUpperCase();

        };


    /* =====================================================
       13. NORMALIZE POR KEY

       POR is the authoritative relationship connector.

       Prefer already-normalized porKey values supplied
       by OffenceNormalizer / OffenceStore.

       This function is a safe fallback only.

       IMPORTANT:
       - NO fuzzy matching
       - NO CaseID substitution
       ===================================================== */

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
       14. ADD UNIQUE VALUE
       ===================================================== */

    HeatmapEngine.addUnique =
        function (

            array,

            value,

            normalizer =
                HeatmapEngine.normalizeKey

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


            const key =

                normalizer(
                    value
                );


            if (!key) {

                return;

            }


            const exists =

                array.some(

                    function (
                        existing
                    ) {

                        return (

                            normalizer(
                                existing
                            ) ===
                            key

                        );

                    }

                );


            if (!exists) {

                array.push(
                    value
                );

            }

        };


    /* =====================================================
       15. ADD UNIQUE OBJECT

       Used for:
       - cases
       - accused
       - witnesses
       - seizures
       - seized articles
       - source hotspots
       - target hotspots
       ===================================================== */

    HeatmapEngine.addUniqueObject =
        function (

            array,

            object,

            keyGetter

        ) {

            if (
                !Array.isArray(
                    array
                ) ||
                !object ||
                typeof keyGetter !==
                "function"
            ) {

                return;

            }


            const objectKey =

                HeatmapEngine
                    .normalizeKey(

                        keyGetter(
                            object
                        )

                    );


            if (!objectKey) {

                return;

            }


            const exists =

                array.some(

                    function (
                        existing
                    ) {

                        const existingKey =

                            HeatmapEngine
                                .normalizeKey(

                                    keyGetter(
                                        existing
                                    )

                                );


                        return (

                            existingKey ===
                            objectKey

                        );

                    }

                );


            if (!exists) {

                array.push(
                    object
                );

            }

        };


    /* =====================================================
       16. GET CASE ID

       CaseID is secondary metadata only.
       ===================================================== */

    HeatmapEngine.getCaseId =
        function (

            caseRecord

        ) {

            if (!caseRecord) {

                return "";

            }


            return (

                caseRecord.caseId ||

                caseRecord.CaseID ||

                caseRecord.id ||

                ""

            );

        };


    /* =====================================================
       17. GET ACCUSED ID
       ===================================================== */

    HeatmapEngine.getAccusedId =
        function (

            accused

        ) {

            if (!accused) {

                return "";

            }


            return (

                accused.accusedId ||

                accused.AccusedID ||

                accused.id ||

                ""

            );

        };


    /* =====================================================
       18. GET WITNESS ID
       ===================================================== */

    HeatmapEngine.getWitnessId =
        function (

            witness

        ) {

            if (!witness) {

                return "";

            }


            return (

                witness.witnessId ||

                witness.WitnessID ||

                witness.id ||

                ""

            );

        };


    /* =====================================================
       19. GET SEIZURE ID
       ===================================================== */

    HeatmapEngine.getSeizureId =
        function (

            seizure

        ) {

            if (!seizure) {

                return "";

            }


            return (

                seizure.seizureId ||

                seizure.SeizureID ||

                seizure.id ||

                ""

            );

        };


    /* =====================================================
       20. GET ARTICLE ID
       ===================================================== */

    HeatmapEngine.getArticleId =
        function (

            article

        ) {

            if (!article) {

                return "";

            }


            return (

                article.articleId ||

                article.ArticleID ||

                article.id ||

                ""

            );

        };


    /* =====================================================
       21. GET HOTSPOT ID
       ===================================================== */

    HeatmapEngine.getHotspotId =
        function (

            hotspot

        ) {

            if (!hotspot) {

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
       22. EXTRACT POR KEY FROM RECORD

       Priority:
       1. porKey
       2. refPorKey
       3. normalizedPor
       4. refPorNo
       5. porNo

       POR remains authoritative.
       ===================================================== */

    HeatmapEngine.extractPorKey =
        function (

            record

        ) {

            if (!record) {

                return "";

            }


            const raw =

                record.porKey ||

                record.refPorKey ||

                record.normalizedPor ||

                record.refPorNo ||

                record.porNo ||

                "";


            return HeatmapEngine
                .normalizePorKey(
                    raw
                );

        };


    /* =====================================================
       23. EXTRACT DISPLAY POR NUMBER
       ===================================================== */

    HeatmapEngine.extractPorNo =
        function (

            record

        ) {

            if (!record) {

                return "";

            }


            return (

                record.porNo ||

                record.refPorNo ||

                record.PORNo ||

                record["POR No"] ||

                record["Ref POR No"] ||

                ""

            );

        };


    /* =====================================================
       24. CREATE EMPTY POR RELATION

       This is the central intelligence object.

       One POR may connect:

       POR
        ├── Case
        ├── Accused
        ├── Witnesses
        ├── Seizures
        ├── Seized Articles
        ├── Source Hotspots
        └── Target Hotspots
       ===================================================== */

    HeatmapEngine.createPorRelation =
        function (

            porKey,

            porNo =
                ""

        ) {

            const normalizedPorKey =

                HeatmapEngine
                    .normalizePorKey(
                        porKey
                    );


            return {

                porKey:
                    normalizedPorKey,

                porNo:
                    porNo || "",

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

                sources:
                    [],

                targets:
                    []

            };

        };


    /* =====================================================
       25. GET OR CREATE POR RELATION
       ===================================================== */

    HeatmapEngine.getOrCreatePorRelation =
        function (

            porKey,

            porNo =
                ""

        ) {

            const key =

                HeatmapEngine
                    .normalizePorKey(
                        porKey
                    );


            if (!key) {

                return null;

            }


            let relation =

                HeatmapEngine.porIndex
                    .get(
                        key
                    );


            if (!relation) {

                relation =

                    HeatmapEngine
                        .createPorRelation(

                            key,

                            porNo

                        );


                HeatmapEngine.porIndex
                    .set(

                        key,

                        relation

                    );

            }


            /*
             * Preserve a human-readable POR number
             * when it becomes available later.
             */

            if (
                !relation.porNo &&
                porNo
            ) {

                relation.porNo =
                    porNo;

            }


            return relation;

        };


    /* =====================================================
       26. CREATE EMPTY CASE RELATION

       SECONDARY lookup only.

       CaseID does NOT determine SOURCE ↔ TARGET linkage.
       ===================================================== */

    HeatmapEngine.createCaseRelation =
        function (

            caseId

        ) {

            return {

                caseId:
                    caseId,

                case:
                    null,

                porKeys:
                    [],

                sources:
                    [],

                targets:
                    []

            };

        };


    /* =====================================================
       27. GET OR CREATE CASE RELATION
       ===================================================== */

    HeatmapEngine.getOrCreateCaseRelation =
        function (

            caseId

        ) {

            const key =

                HeatmapEngine
                    .normalizeKey(
                        caseId
                    );


            if (!key) {

                return null;

            }


            let relation =

                HeatmapEngine.caseIndex
                    .get(
                        key
                    );


            if (!relation) {

                relation =

                    HeatmapEngine
                        .createCaseRelation(
                            caseId
                        );


                HeatmapEngine.caseIndex
                    .set(

                        key,

                        relation

                    );

            }


            return relation;

        };


    /* =====================================================
       28. REGISTER HOTSPOT

       Adds SOURCE or TARGET hotspot to unified lookup.
       ===================================================== */

    HeatmapEngine.registerHotspot =
        function (

            type,

            hotspot

        ) {

            if (!hotspot) {

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


            if (!key) {

                return false;

            }


            HeatmapEngine.hotspotIndex
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
       29. REGISTER SOURCE HOTSPOT RELATIONSHIPS

       SOURCE hotspot
            ↓
       porKeys[]
            ↓
       POR relation index

       CaseIDs are registered only as secondary metadata.
       ===================================================== */

    HeatmapEngine.registerSourceHotspot =
        function (

            hotspot

        ) {

            if (!hotspot) {

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


                if (!porKey) {

                    continue;

                }


                const relation =

                    HeatmapEngine
                        .getOrCreatePorRelation(
                            porKey
                        );


                if (!relation) {

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


                if (!relation) {

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
       30. REGISTER TARGET HOTSPOT RELATIONSHIPS

       TARGET hotspot
            ↓
       porKeys[]
            ↓
       POR relation index

       This is what allows:

       SOURCE hotspot
            │
            │ same porKey
            ▼
       TARGET hotspot

       without requiring matching CaseID.
       ===================================================== */

    HeatmapEngine.registerTargetHotspot =
        function (

            hotspot

        ) {

            if (!hotspot) {

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


                if (!porKey) {

                    continue;

                }


                const relation =

                    HeatmapEngine
                        .getOrCreatePorRelation(
                            porKey
                        );


                if (!relation) {

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


                if (!relation) {

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
       31. NORMALIZE ARRAY

       Safe helper used when Store APIs may return:
       - array
       - null
       - undefined
       - single object
       ===================================================== */

    HeatmapEngine.toArray =
        function (

            value

        ) {

            if (
                value === null ||
                value === undefined
            ) {

                return [];

            }


            if (
                Array.isArray(
                    value
                )
            ) {

                return value;

            }


            return [
                value
            ];

        };


    /* =====================================================
       32. MERGE CASCADE INTO POR RELATION

       Hydrates the authoritative POR relation with:

       - cases
       - accused
       - witnesses
       - seizures
       - seizedArticles

       IMPORTANT:

       SOURCE and TARGET hotspots are NOT replaced here.

       They were already registered by:

       registerSourceHotspot()
       registerTargetHotspot()

       This function adds the business/case datasets
       associated with the same authoritative POR.
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


            /* ---------------------------------------------
               CASES
               --------------------------------------------- */

            const cases =

                HeatmapEngine
                    .toArray(

                        cascade.cases ||

                        cascade.case ||

                        []

                    );


            for (
                const caseRecord
                of cases
            ) {

                if (!caseRecord) {

                    continue;

                }


                HeatmapEngine
                    .addUniqueObject(

                        relation.cases,

                        caseRecord,

                        function (
                            item
                        ) {

                            return (

                                HeatmapEngine
                                    .getCaseId(
                                        item
                                    ) ||

                                HeatmapEngine
                                    .extractPorKey(
                                        item
                                    )

                            );

                        }

                    );


                /*
                 * Build secondary CaseID index.
                 *
                 * CaseID is useful for lookup,
                 * but NOT authoritative for joining
                 * SOURCE and TARGET.
                 */

                const caseId =

                    HeatmapEngine
                        .getCaseId(
                            caseRecord
                        );


                if (caseId) {

                    const caseRelation =

                        HeatmapEngine
                            .getOrCreateCaseRelation(
                                caseId
                            );


                    if (caseRelation) {

                        caseRelation.case =
                            caseRecord;


                        HeatmapEngine
                            .addUnique(

                                caseRelation.porKeys,

                                relation.porKey,

                                HeatmapEngine
                                    .normalizePorKey

                            );

                    }

                }

            }


            /* ---------------------------------------------
               ACCUSED
               --------------------------------------------- */

            const accused =

                HeatmapEngine
                    .toArray(

                        cascade.accused ||

                        cascade.accusedPersons ||

                        []

                    );


            for (
                const accusedRecord
                of accused
            ) {

                if (!accusedRecord) {

                    continue;

                }


                HeatmapEngine
                    .addUniqueObject(

                        relation.accused,

                        accusedRecord,

                        function (
                            item
                        ) {

                            return (

                                HeatmapEngine
                                    .getAccusedId(
                                        item
                                    ) ||

                                [
                                    item.nameOfAccused,
                                    item.name,
                                    item.addressOfAccused,
                                    item.address
                                ]
                                    .filter(
                                        Boolean
                                    )
                                    .join(
                                        "|"
                                    )

                            );

                        }

                    );

            }


            /* ---------------------------------------------
               WITNESSES
               --------------------------------------------- */

            const witnesses =

                HeatmapEngine
                    .toArray(

                        cascade.witnesses ||

                        cascade.witness ||

                        []

                    );


            for (
                const witnessRecord
                of witnesses
            ) {

                if (!witnessRecord) {

                    continue;

                }


                HeatmapEngine
                    .addUniqueObject(

                        relation.witnesses,

                        witnessRecord,

                        function (
                            item
                        ) {

                            return (

                                HeatmapEngine
                                    .getWitnessId(
                                        item
                                    ) ||

                                [
                                    item.nameOfWitness,
                                    item.name,
                                    item.contactNo
                                ]
                                    .filter(
                                        Boolean
                                    )
                                    .join(
                                        "|"
                                    )

                            );

                        }

                    );

            }


            /* ---------------------------------------------
               SEIZURES
               --------------------------------------------- */

            const seizures =

                HeatmapEngine
                    .toArray(

                        cascade.seizures ||

                        cascade.seizure ||

                        []

                    );


            for (
                const seizureRecord
                of seizures
            ) {

                if (!seizureRecord) {

                    continue;

                }


                HeatmapEngine
                    .addUniqueObject(

                        relation.seizures,

                        seizureRecord,

                        function (
                            item
                        ) {

                            return (

                                HeatmapEngine
                                    .getSeizureId(
                                        item
                                    ) ||

                                [
                                    item.placeOfSeizure,
                                    item.seizureDate,
                                    item.seizureTime
                                ]
                                    .filter(
                                        Boolean
                                    )
                                    .join(
                                        "|"
                                    )

                            );

                        }

                    );

            }


            /* ---------------------------------------------
               SEIZED ARTICLES
               --------------------------------------------- */

            const seizedArticles =

                HeatmapEngine
                    .toArray(

                        cascade.seizedArticles ||

                        cascade.articles ||

                        cascade.seized_articles ||

                        []

                    );


            for (
                const articleRecord
                of seizedArticles
            ) {

                if (!articleRecord) {

                    continue;

                }


                HeatmapEngine
                    .addUniqueObject(

                        relation.seizedArticles,

                        articleRecord,

                        function (
                            item
                        ) {

                            return (

                                HeatmapEngine
                                    .getArticleId(
                                        item
                                    ) ||

                                [
                                    item.seizureId,
                                    item.articleDescription,
                                    item.slNo
                                ]
                                    .filter(
                                        Boolean
                                    )
                                    .join(
                                        "|"
                                    )

                            );

                        }

                    );

            }


            return relation;

        };


    /* =====================================================
       33. GET POR CASCADE FROM STORE

       Supports the Store APIs already used in the
       GreenGuard offence architecture.

       Preferred order:

       1. Store.getCascadeByPor()
       2. Store.getPorCascade()
       3. Store.getByPor()

       POR is always passed as the authoritative key.
       ===================================================== */

    HeatmapEngine.getStoreCascadeByPor =
        function (

            porKey

        ) {

            const key =

                HeatmapEngine
                    .normalizePorKey(
                        porKey
                    );


            if (!key) {

                return null;

            }


            try {


                if (
                    typeof Store.getCascadeByPor ===
                    "function"
                ) {

                    const result =

                        Store
                            .getCascadeByPor(
                                key
                            );


                    if (result) {

                        return result;

                    }

                }


                if (
                    typeof Store.getPorCascade ===
                    "function"
                ) {

                    const result =

                        Store
                            .getPorCascade(
                                key
                            );


                    if (result) {

                        return result;

                    }

                }


                if (
                    typeof Store.getByPor ===
                    "function"
                ) {

                    const result =

                        Store
                            .getByPor(
                                key
                            );


                    if (result) {

                        return result;

                    }

                }


            }

            catch (
                error
            ) {

                console.error(

                    "[OffenceHeatmapEngine] POR cascade lookup failed.",

                    {

                        porKey:
                            key,

                        error:
                            error

                    }

                );

            }


            return null;

        };


    /* =====================================================
       34. HYDRATE SINGLE POR RELATION

       Takes one porKey and enriches its relation using
       OffenceStore.

       Existing SOURCE/TARGET hotspot links remain intact.
       ===================================================== */

    HeatmapEngine.hydratePorRelation =
        function (

            porKey

        ) {

            const key =

                HeatmapEngine
                    .normalizePorKey(
                        porKey
                    );


            if (!key) {

                return null;

            }


            const relation =

                HeatmapEngine
                    .getOrCreatePorRelation(
                        key
                    );


            if (!relation) {

                return null;

            }


            const cascade =

                HeatmapEngine
                    .getStoreCascadeByPor(
                        key
                    );


            if (!cascade) {

                return relation;

            }


            /*
             * Preserve display POR number.
             */

            const cascadePorNo =

                cascade.porNo ||

                cascade.refPorNo ||

                HeatmapEngine
                    .extractPorNo(
                        cascade.case
                    ) ||

                "";


            if (
                !relation.porNo &&
                cascadePorNo
            ) {

                relation.porNo =
                    cascadePorNo;

            }


            HeatmapEngine
                .mergeCascadeIntoPorRelation(

                    relation,

                    cascade

                );


            return relation;

        };


    /* =====================================================
       35. HYDRATE ALL POR RELATIONS

       Every POR already discovered through SOURCE or TARGET
       hotspots is hydrated from OffenceStore.

       Example:

       SOURCE
       Accused Address
             │
             │ POR 53/HTG of 2025-26
             ▼
       porIndex
             │
             ├── Case
             ├── Accused
             ├── Witness
             ├── Seizure
             └── Seized Articles
             │
             ▼
       TARGET
       Place of Seizure
       ===================================================== */

    HeatmapEngine.hydrateAllPorRelations =
        function () {

            const porKeys =

                Array.from(
                    HeatmapEngine
                        .porIndex
                        .keys()
                );


            let hydrated =
                0;


            let withoutCascade =
                0;


            for (
                const porKey
                of porKeys
            ) {

                const cascade =

                    HeatmapEngine
                        .getStoreCascadeByPor(
                            porKey
                        );


                if (!cascade) {

                    withoutCascade++;

                    continue;

                }


                const relation =

                    HeatmapEngine
                        .getOrCreatePorRelation(
                            porKey
                        );


                if (!relation) {

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
       36. RESET RELATION INDEXES

       Clears derived indexes before rebuilding.

       Does NOT clear OffenceStore.
       Does NOT clear SourceEngine.
       Does NOT clear TargetEngine.
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


            HeatmapEngine.data.links =
                [];


            return HeatmapEngine;

        };


    /* =====================================================
       37. REBUILD HOTSPOT AND RELATION INDEXES

       SOURCE and TARGET datasets are indexed here.

       Then POR cascades are hydrated from OffenceStore.
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


            /* ---------------------------------------------
               REGISTER SOURCES
               --------------------------------------------- */

            for (
                const source
                of sources
            ) {

                HeatmapEngine
                    .registerSourceHotspot(
                        source
                    );

            }


            /* ---------------------------------------------
               REGISTER TARGETS
               --------------------------------------------- */

            for (
                const target
                of targets
            ) {

                HeatmapEngine
                    .registerTargetHotspot(
                        target
                    );

            }


            /* ---------------------------------------------
               HYDRATE BUSINESS DATA BY POR
               --------------------------------------------- */

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
       38. GET SOURCE HOTSPOTS FOR POR
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


            if (!key) {

                return [];

            }


            const relation =

                HeatmapEngine
                    .porIndex
                    .get(
                        key
                    );


            if (!relation) {

                return [];

            }


            return relation.sources ||
                [];

        };


    /* =====================================================
       39. GET TARGET HOTSPOTS FOR POR
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


            if (!key) {

                return [];

            }


            const relation =

                HeatmapEngine
                    .porIndex
                    .get(
                        key
                    );


            if (!relation) {

                return [];

            }


            return relation.targets ||
                [];

        };


    /* =====================================================
       40. GET FULL POR RELATION

       Primary click-cascade lookup.

       Returns:

       {
           porKey,
           porNo,
           cases,
           accused,
           witnesses,
           seizures,
           seizedArticles,
           sources,
           targets
       }
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


            if (!key) {

                return null;

            }


            let relation =

                HeatmapEngine
                    .porIndex
                    .get(
                        key
                    );


            /*
             * If this POR was not discovered through a
             * hotspot, try to hydrate it directly from Store.
             */

            if (!relation) {

                relation =

                    HeatmapEngine
                        .hydratePorRelation(
                            key
                        );

            }


            return relation ||
                null;

        };


    /* =====================================================
       41. GET FULL POR CASCADE

       Semantic alias for UI/controller usage.
       ===================================================== */

    HeatmapEngine.getPorCascade =
        function (

            porKey

        ) {

            return HeatmapEngine
                .getByPor(
                    porKey
                );

        };


    /* =====================================================
       42. GET HOTSPOT BY ID
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


            if (!key) {

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
       43. GET SECONDARY CASE RELATION

       This lookup is supported for UI convenience.

       IMPORTANT:

       It must NOT be used to determine whether a SOURCE
       and TARGET belong together.

       POR remains authoritative.
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


            if (!key) {

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
       44. GET SOURCE HOTSPOTS
       ===================================================== */

    HeatmapEngine.getSourceHotspots =
        function () {

            return Array.isArray(
                HeatmapEngine.data.sources
            )
                ? HeatmapEngine.data.sources
                : [];

        };


    /* =====================================================
       45. GET TARGET HOTSPOTS
       ===================================================== */

    HeatmapEngine.getTargetHotspots =
        function () {

            return Array.isArray(
                HeatmapEngine.data.targets
            )
                ? HeatmapEngine.data.targets
                : [];

        };


    /* =====================================================
       46. GET LINKS
       ===================================================== */

    HeatmapEngine.getLinks =
        function () {

            return Array.isArray(
                HeatmapEngine.data.links
            )
                ? HeatmapEngine.data.links
                : [];

        };


    /* =====================================================
       47. GET CURRENT MODE
       ===================================================== */

    HeatmapEngine.getMode =
        function () {

            return HeatmapEngine.mode;

        };


    /* =====================================================
       48. SET CURRENT MODE
       ===================================================== */

    HeatmapEngine.setMode =
        function (
            mode
        ) {

            const normalized =

                String(
                    mode || ""
                )
                    .trim()
                    .toUpperCase();


            if (
                !Object.values(
                    HeatmapEngine.MODE
                )
                    .includes(
                        normalized
                    )
            ) {

                console.warn(

                    "[OffenceHeatmapEngine] Invalid mode:",

                    mode

                );


                return HeatmapEngine.mode;

            }


            HeatmapEngine.mode =
                normalized;


            return HeatmapEngine.mode;

        };


    /* =====================================================
       49. GET HEATMAP DATA

       Used by OffenceMapRenderer.

       Returns both raw hotspot arrays and Leaflet.heat
       compatible point arrays.

       ===================================================== */

    HeatmapEngine.getHeatmapData =
        function () {

            return {

                mode:
                    HeatmapEngine.mode,

                sources:
                    HeatmapEngine
                        .getSourceHotspots(),

                targets:
                    HeatmapEngine
                        .getTargetHotspots(),

                links:
                    HeatmapEngine
                        .getLinks(),

                sourceHeat:
                    HeatmapEngine
                        .getSourceHotspots()
                        .map(
                            function (
                                hotspot
                            ) {

                                const lat =

                                    Number(

                                        hotspot.lat ??

                                        hotspot.latitude

                                    );


                                const lng =

                                    Number(

                                        hotspot.lng ??

                                        hotspot.lon ??

                                        hotspot.longitude

                                    );


                                const intensity =

                                    Number(

                                        hotspot.intensity ??

                                        hotspot.weight ??

                                        hotspot.count ??

                                        1

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


                                return [

                                    lat,

                                    lng,

                                    Number.isFinite(
                                        intensity
                                    ) &&
                                    intensity > 0

                                        ? intensity

                                        : 1

                                ];

                            }
                        )
                        .filter(
                            Boolean
                        ),

                targetHeat:
                    HeatmapEngine
                        .getTargetHotspots()
                        .map(
                            function (
                                hotspot
                            ) {

                                const lat =

                                    Number(

                                        hotspot.lat ??

                                        hotspot.latitude

                                    );


                                const lng =

                                    Number(

                                        hotspot.lng ??

                                        hotspot.lon ??

                                        hotspot.longitude

                                    );


                                const intensity =

                                    Number(

                                        hotspot.intensity ??

                                        hotspot.weight ??

                                        hotspot.count ??

                                        1

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


                                return [

                                    lat,

                                    lng,

                                    Number.isFinite(
                                        intensity
                                    ) &&
                                    intensity > 0

                                        ? intensity

                                        : 1

                                ];

                            }
                        )
                        .filter(
                            Boolean
                        )

            };

        };


    /* =====================================================
       50. GET STATE

       Debug / UI state snapshot.
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

                resolvedContexts:

                    Array.isArray(
                        HeatmapEngine.data.resolvedContexts
                    )

                        ? HeatmapEngine
                            .data
                            .resolvedContexts
                            .length

                        : 0,

                sources:

                    HeatmapEngine
                        .getSourceHotspots()
                        .length,

                targets:

                    HeatmapEngine
                        .getTargetHotspots()
                        .length,

                links:

                    HeatmapEngine
                        .getLinks()
                        .length,

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

                authoritativeConnector:
                    "porKey"

            };

        };


    /* =====================================================
       51. CLEAR

       Clears derived heatmap/index state only.

       Does NOT clear Firestore-loaded OffenceStore data.

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


            HeatmapEngine
                .hotspotIndex
                .clear();


            HeatmapEngine
                .porIndex
                .clear();


            HeatmapEngine
                .caseIndex
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
       52. EXPOSE MODULE

       IMPORTANT:
       Makes the engine available to:

       GG.Offence.HeatmapEngine

       OffenceMapRenderer
       OffenceCascadeController
       OffenceUIController

       ===================================================== */

    GG.Offence.HeatmapEngine =
        HeatmapEngine;


    /* =====================================================
       53. INITIALIZE MODULE
       ===================================================== */

    HeatmapEngine
        .init();


    /* =====================================================
       54. MODULE LOADED
       ===================================================== */

    if (
        Constants.DEBUG
            ?.ENABLED
    ) {

        console.log(

            "🔥 OffenceHeatmapEngine Loaded",

            {

                version:
                    HeatmapEngine.VERSION,

                authoritativeConnector:
                    "porKey",

                relationshipModel:

                    Constants.RELATIONSHIP
                        ?.MODEL ||

                    "POR_AUTHORITATIVE"

            }

        );

    }


})();
