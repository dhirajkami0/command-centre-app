/* =========================================================
   GreenGuard
   Offence Intelligence Module

   File:
   js/offence/offenceStore.js

   Purpose:
   Central in-memory store for normalized offence data.

   Responsibilities:
   - Store normalized cases
   - Store normalized accused records
   - Store normalized seizure records
   - Build CaseID indexes
   - Build POR indexes
   - Build SuspectID indexes
   - Build SeizureID indexes
   - Support fast SOURCE / TARGET lookup
   - Support incremental daily data updates

   IMPORTANT:
   - NO Leaflet rendering
   - NO geocoding
   - NO heatmap rendering
   - NO Firestore queries
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

    const Normalizer =
        GG.Offence.Normalizer;


    if (!Constants) {

        console.error(
            "[OffenceStore] OffenceConstants unavailable."
        );

        return;

    }


    if (!Normalizer) {

        console.error(
            "[OffenceStore] OffenceNormalizer unavailable."
        );

        return;

    }


    /* =====================================================
       3. STORE OBJECT
       ===================================================== */

    const OffenceStore = {};


    /* =====================================================
       4. MODULE INFO
       ===================================================== */

    OffenceStore.VERSION =
        "1.0.0";


    /* =====================================================
       5. INITIALIZED STATE
       ===================================================== */

    OffenceStore.initialized =
        false;


    /* =====================================================
       6. PRIMARY DATASETS
       ===================================================== */

    OffenceStore.data = {

        cases: [],

        accused: [],

        seizures: []

    };


    /* =====================================================
       7. INDEXES

       Maps provide fast O(1) lookup.

       IMPORTANT:

       Some indexes contain ONE record.

       Others contain ARRAYS because one POR or CaseID
       can potentially be linked to multiple records.
       ===================================================== */

    OffenceStore.index = {

        caseById:
            new Map(),

        casesByPor:
            new Map(),

        accusedBySuspectId:
            new Map(),

        accusedByCaseId:
            new Map(),

        accusedByPor:
            new Map(),

        seizureById:
            new Map(),

        seizuresByCaseId:
            new Map(),

        seizuresByPor:
            new Map()

    };


    /* =====================================================
       8. INITIALIZE
       ===================================================== */

    OffenceStore.init = function () {

        if (
            OffenceStore.initialized
        ) {

            return OffenceStore;

        }


        OffenceStore.initialized =
            true;


        if (
            Constants.DEBUG
                ?.ENABLED
        ) {

            console.log(
                "🔥 OffenceStore Ready"
            );

        }


        return OffenceStore;

    };


    /* =====================================================
       9. NORMALIZE KEY

       Used only for index comparison.

       Does NOT modify stored values.
       ===================================================== */

    OffenceStore.normalizeKey = function (

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


    /* =====================================================
       10. ADD VALUE TO ARRAY MAP

       Example:

       CaseID
          ↓
       [
           seizure1,
           seizure2
       ]
       ===================================================== */

    OffenceStore.addToArrayMap = function (

        map,

        key,

        value

    ) {

        key =
            OffenceStore.normalizeKey(
                key
            );


        if (!key) {

            return;

        }


        if (
            !map.has(
                key
            )
        ) {

            map.set(
                key,
                []
            );

        }


        map.get(
            key
        ).push(
            value
        );

    };


    /* =====================================================
       11. CLEAR INDEXES
       ===================================================== */

    OffenceStore.clearIndexes = function () {

        Object.values(

            OffenceStore.index

        ).forEach(

            function (

                index

            ) {

                if (

                    index instanceof Map

                ) {

                    index.clear();

                }

            }

        );

    };


    /* =====================================================
       12. BUILD CASE INDEXES
       ===================================================== */

    OffenceStore.buildCaseIndexes =
        function () {

            for (

                const record

                of OffenceStore.data.cases

            ) {

                /* -------------------------
                   CaseID
                   ------------------------- */

                const caseId =

                    OffenceStore.normalizeKey(

                        record.caseId

                    );


                if (
                    caseId
                ) {

                    OffenceStore.index
                        .caseById
                        .set(

                            caseId,

                            record

                        );

                }


                /* -------------------------
                   POR
                   ------------------------- */

                const porNo =

                    OffenceStore.normalizeKey(

                        record.porNo

                    );


                if (
                    porNo
                ) {

                    OffenceStore.addToArrayMap(

                        OffenceStore.index
                            .casesByPor,

                        porNo,

                        record

                    );

                }

            }

        };


    /* =====================================================
       13. BUILD ACCUSED INDEXES
       ===================================================== */

    OffenceStore.buildAccusedIndexes =
        function () {

            for (

                const record

                of OffenceStore.data.accused

            ) {

                /* -------------------------
                   SuspectID
                   ------------------------- */

                const suspectId =

                    OffenceStore.normalizeKey(

                        record.suspectId

                    );


                if (
                    suspectId
                ) {

                    OffenceStore.index
                        .accusedBySuspectId
                        .set(

                            suspectId,

                            record

                        );

                }


                /*
                 * Accused records may contain linkage
                 * fields in the original/raw document
                 * even if those fields are not part of
                 * the canonical accused object.
                 */

                const raw =

                    record.raw ||

                    {};


                /* -------------------------
                   CaseID
                   ------------------------- */

                const caseId =

                    OffenceStore.normalizeKey(

                        Normalizer.getField(

                            raw,

                            [
                                "CaseID",
                                "Case ID",
                                "caseId",
                                "case_id"
                            ]

                        )

                    );


                if (
                    caseId
                ) {

                    OffenceStore.addToArrayMap(

                        OffenceStore.index
                            .accusedByCaseId,

                        caseId,

                        record

                    );

                }


                /* -------------------------
                   POR
                   ------------------------- */

                const porNo =

                    OffenceStore.normalizeKey(

                        Normalizer.getField(

                            raw,

                            [
                                "Ref POR No",
                                "POR No",
                                "POR NO",
                                "POR Number",
                                "porNo"
                            ]

                        )

                    );


                if (
                    porNo
                ) {

                    OffenceStore.addToArrayMap(

                        OffenceStore.index
                            .accusedByPor,

                        porNo,

                        record

                    );

                }

            }

        };


    /* =====================================================
       14. BUILD SEIZURE INDEXES
       ===================================================== */

    OffenceStore.buildSeizureIndexes =
        function () {

            for (

                const record

                of OffenceStore.data.seizures

            ) {

                /* -------------------------
                   SeizureID
                   ------------------------- */

                const seizureId =

                    OffenceStore.normalizeKey(

                        record.seizureId

                    );


                if (
                    seizureId
                ) {

                    OffenceStore.index
                        .seizureById
                        .set(

                            seizureId,

                            record

                        );

                }


                /* -------------------------
                   CaseID
                   ------------------------- */

                if (
                    record.caseId
                ) {

                    OffenceStore.addToArrayMap(

                        OffenceStore.index
                            .seizuresByCaseId,

                        record.caseId,

                        record

                    );

                }


                /* -------------------------
                   POR
                   ------------------------- */

                if (
                    record.porNo
                ) {

                    OffenceStore.addToArrayMap(

                        OffenceStore.index
                            .seizuresByPor,

                        record.porNo,

                        record

                    );

                }

            }

        };


    /* =====================================================
       15. REBUILD ALL INDEXES
       ===================================================== */

    OffenceStore.rebuildIndexes =
        function () {

            OffenceStore.clearIndexes();


            OffenceStore
                .buildCaseIndexes();


            OffenceStore
                .buildAccusedIndexes();


            OffenceStore
                .buildSeizureIndexes();


            if (
                Constants.DEBUG
                    ?.LOG_DATA
            ) {

                console.log(

                    "🔥 OffenceStore Indexes Rebuilt",

                    {

                        cases:

                            OffenceStore.index
                                .caseById
                                .size,

                        por:

                            OffenceStore.index
                                .casesByPor
                                .size,

                        suspects:

                            OffenceStore.index
                                .accusedBySuspectId
                                .size,

                        seizures:

                            OffenceStore.index
                                .seizureById
                                .size

                    }

                );

            }

        };


    /* =====================================================
       16. LOAD DATA

       Expected input:

       {
           cases: [],
           accused: [],
           seizures: []
       }

       Raw records are normalized here.
       ===================================================== */

    OffenceStore.load = function (

        rawData = {}

    ) {

        OffenceStore.init();


        const normalized =

            Normalizer.normalizeAll(

                rawData

            );


        const validation =

            Normalizer.validate(

                normalized

            );


        if (
            !validation.valid
        ) {

            console.error(

                "[OffenceStore] Invalid data",

                validation.errors

            );


            return {

                success:
                    false,

                errors:
                    validation.errors

            };

        }


        OffenceStore.data.cases =

            normalized.cases;


        OffenceStore.data.accused =

            normalized.accused;


        OffenceStore.data.seizures =

            normalized.seizures;


        OffenceStore
            .rebuildIndexes();


        OffenceStore.dispatchEvent(

            Constants.EVENTS
                .DATA_LOADED,

            OffenceStore.getStats()

        );


        return {

            success:
                true,

            stats:
                OffenceStore.getStats()

        };

    };


    /* =====================================================
       17. GET CASE BY CASE ID
       ===================================================== */

    OffenceStore.getCaseById =
        function (

            caseId

        ) {

            const key =

                OffenceStore.normalizeKey(

                    caseId

                );


            if (!key) {

                return null;

            }


            return (

                OffenceStore.index
                    .caseById
                    .get(
                        key
                    ) ||

                null

            );

        };


    /* =====================================================
       18. GET CASES BY POR
       ===================================================== */

    OffenceStore.getCasesByPor =
        function (

            porNo

        ) {

            const key =

                OffenceStore.normalizeKey(

                    porNo

                );


            if (!key) {

                return [];

            }


            return (

                OffenceStore.index
                    .casesByPor
                    .get(
                        key
                    ) ||

                []

            );

        };


    /* =====================================================
       19. GET ACCUSED BY SUSPECT ID
       ===================================================== */

    OffenceStore.getAccusedBySuspectId =
        function (

            suspectId

        ) {

            const key =

                OffenceStore.normalizeKey(

                    suspectId

                );


            if (!key) {

                return null;

            }


            return (

                OffenceStore.index
                    .accusedBySuspectId
                    .get(
                        key
                    ) ||

                null

            );

        };


    /* =====================================================
       20. GET ACCUSED BY CASE ID
       ===================================================== */

    OffenceStore.getAccusedByCaseId =
        function (

            caseId

        ) {

            const key =

                OffenceStore.normalizeKey(

                    caseId

                );


            if (!key) {

                return [];

            }


            return (

                OffenceStore.index
                    .accusedByCaseId
                    .get(
                        key
                    ) ||

                []

            );

        };


    /* =====================================================
       21. GET ACCUSED BY POR
       ===================================================== */

    OffenceStore.getAccusedByPor =
        function (

            porNo

        ) {

            const key =

                OffenceStore.normalizeKey(

                    porNo

                );


            if (!key) {

                return [];

            }


            return (

                OffenceStore.index
                    .accusedByPor
                    .get(
                        key
                    ) ||

                []

            );

        };


    /* =====================================================
       22. GET SEIZURE BY ID
       ===================================================== */

    OffenceStore.getSeizureById =
        function (

            seizureId

        ) {

            const key =

                OffenceStore.normalizeKey(

                    seizureId

                );


            if (!key) {

                return null;

            }


            return (

                OffenceStore.index
                    .seizureById
                    .get(
                        key
                    ) ||

                null

            );

        };


    /* =====================================================
       23. GET SEIZURES BY CASE ID
       ===================================================== */

    OffenceStore.getSeizuresByCaseId =
        function (

            caseId

        ) {

            const key =

                OffenceStore.normalizeKey(

                    caseId

                );


            if (!key) {

                return [];

            }


            return (

                OffenceStore.index
                    .seizuresByCaseId
                    .get(
                        key
                    ) ||

                []

            );

        };


    /* =====================================================
       24. GET SEIZURES BY POR
       ===================================================== */

    OffenceStore.getSeizuresByPor =
        function (

            porNo

        ) {

            const key =

                OffenceStore.normalizeKey(

                    porNo

                );


            if (!key) {

                return [];

            }


            return (

                OffenceStore.index
                    .seizuresByPor
                    .get(
                        key
                    ) ||

                []

            );

        };


    /* =====================================================
       25. GET COMPLETE CASE CONTEXT

       This is important for future map clicks.

       CASE
          ↓
       ACCUSED
          ↓
       SEIZURES

       Returns everything linked to one case.
       ===================================================== */

    OffenceStore.getCaseContext =
        function (

            caseId

        ) {

            const caseRecord =

                OffenceStore.getCaseById(

                    caseId

                );


            if (
                !caseRecord
            ) {

                return null;

            }


            let accused =

                OffenceStore.getAccusedByCaseId(

                    caseRecord.caseId

                );


            let seizures =

                OffenceStore.getSeizuresByCaseId(

                    caseRecord.caseId

                );


            /*
             * Fallback to POR linkage when
             * direct CaseID linkage is unavailable.
             */

            if (
                accused.length === 0 &&
                caseRecord.porNo
            ) {

                accused =

                    OffenceStore.getAccusedByPor(

                        caseRecord.porNo

                    );

            }


            if (
                seizures.length === 0 &&
                caseRecord.porNo
            ) {

                seizures =

                    OffenceStore.getSeizuresByPor(

                        caseRecord.porNo

                    );

            }


            return {

                case:

                    caseRecord,

                accused:

                    accused,

                seizures:

                    seizures

            };

        };


    /* =====================================================
       26. GET ALL CASE CONTEXTS
       ===================================================== */

    OffenceStore.getAllCaseContexts =
        function () {

            const result = [];


            for (

                const caseRecord

                of OffenceStore.data.cases

            ) {

                if (
                    !caseRecord.caseId
                ) {

                    continue;

                }


                const context =

                    OffenceStore
                        .getCaseContext(

                            caseRecord.caseId

                        );


                if (
                    context
                ) {

                    result.push(

                        context

                    );

                }

            }


            return result;

        };


    /* =====================================================
       27. MERGE UNIQUE RECORDS

       Used by incremental daily updates.
       ===================================================== */

    OffenceStore.mergeUnique =
        function (

            existing = [],

            incoming = [],

            keyBuilder

        ) {

            const map =
                new Map();


            for (

                const item

                of existing

            ) {

                const key =

                    keyBuilder(
                        item
                    );


                if (
                    key
                ) {

                    map.set(

                        OffenceStore
                            .normalizeKey(
                                key
                            ),

                        item

                    );

                }

            }


            for (

                const item

                of incoming

            ) {

                const key =

                    keyBuilder(
                        item
                    );


                if (
                    key
                ) {

                    /*
                     * Incoming record replaces older
                     * version of the same logical record.
                     */

                    map.set(

                        OffenceStore
                            .normalizeKey(
                                key
                            ),

                        item

                    );

                }

            }


            return Array.from(

                map.values()

            );

        };


    /* =====================================================
       28. INCREMENTAL UPDATE

       Designed for daily growing offence data.

       Existing history is preserved.

       New or updated records are merged.
       ===================================================== */

    OffenceStore.update = function (

        rawData = {}

    ) {

        OffenceStore.init();


        const normalized =

            Normalizer.normalizeAll(

                rawData

            );


        /* -------------------------
           Cases
           ------------------------- */

        OffenceStore.data.cases =

            OffenceStore.mergeUnique(

                OffenceStore.data.cases,

                normalized.cases,

                function (

                    item

                ) {

                    return (

                        item.caseId ||

                        item.porNo

                    );

                }

            );


        /* -------------------------
           Accused
           ------------------------- */

        OffenceStore.data.accused =

            OffenceStore.mergeUnique(

                OffenceStore.data.accused,

                normalized.accused,

                function (

                    item

                ) {

                    return (

                        item.suspectId ||

                        [

                            item.name,

                            item.permanentAddress

                        ].join(
                            "|"
                        )

                    );

                }

            );


        /* -------------------------
           Seizures
           ------------------------- */

        OffenceStore.data.seizures =

            OffenceStore.mergeUnique(

                OffenceStore.data.seizures,

                normalized.seizures,

                function (

                    item

                ) {

                    return (

                        item.seizureId ||

                        [

                            item.caseId,

                            item.seizureDate,

                            item.placeOfSeizure

                        ].join(
                            "|"
                        )

                    );

                }

            );


        /* -------------------------
           Rebuild Indexes
           ------------------------- */

        OffenceStore
            .rebuildIndexes();


        /* -------------------------
           Event
           ------------------------- */

        OffenceStore.dispatchEvent(

            Constants.EVENTS
                .DATA_UPDATED,

            OffenceStore.getStats()

        );


        return {

            success:
                true,

            stats:
                OffenceStore.getStats()

        };

    };


    /* =====================================================
       29. GET STATS
       ===================================================== */

    OffenceStore.getStats =
        function () {

            return {

                cases:

                    OffenceStore.data
                        .cases
                        .length,

                accused:

                    OffenceStore.data
                        .accused
                        .length,

                seizures:

                    OffenceStore.data
                        .seizures
                        .length,

                caseIds:

                    OffenceStore.index
                        .caseById
                        .size,

                porNumbers:

                    OffenceStore.index
                        .casesByPor
                        .size,

                suspectIds:

                    OffenceStore.index
                        .accusedBySuspectId
                        .size,

                seizureIds:

                    OffenceStore.index
                        .seizureById
                        .size

            };

        };


    /* =====================================================
       30. GET RAW STORE DATA
       ===================================================== */

    OffenceStore.getData =
        function () {

            return OffenceStore.data;

        };


    /* =====================================================
       31. RESET STORE
       ===================================================== */

    OffenceStore.reset =
        function () {

            OffenceStore.data = {

                cases: [],

                accused: [],

                seizures: []

            };


            OffenceStore
                .clearIndexes();


            return true;

        };


    /* =====================================================
       32. DISPATCH EVENT
       ===================================================== */

    OffenceStore.dispatchEvent =
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

                        "[OffenceStore] Event dispatch failed",

                        eventName,

                        error

                    );

                }

            }

        };


    /* =====================================================
       33. EXPORT
       ===================================================== */

    GG.Offence.Store =
        OffenceStore;


    /* =====================================================
       34. INITIALIZE
       ===================================================== */

    OffenceStore.init();


    /* =====================================================
       35. READY LOG
       ===================================================== */

    if (
        Constants.DEBUG
            ?.ENABLED
    ) {

        console.log(

            "🔥 OffenceStore Loaded",

            OffenceStore

        );

    }


})();
