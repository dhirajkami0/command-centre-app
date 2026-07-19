(function (window) {

    "use strict";


    /*=========================================================
      NAMESPACE
    =========================================================*/

    const GG =

        window.GreenGuardAI =

        window.GreenGuardAI || {};


    GG.Offence =

        GG.Offence || {};


    /*=========================================================
      PREVENT DOUBLE LOADING
    =========================================================*/

    if (

        GG.Offence.Store

    ) {

        console.warn(

            "[GreenGuardAI] Offence Store already loaded."

        );

        return;

    }


    /*=========================================================
      MODULE
    =========================================================*/

    const Store = {};


    /*=========================================================
      VERSION
    =========================================================*/

    Store.VERSION =

        "2.0.0";


    /*=========================================================
      STATE
    =========================================================*/

    Store.initialized =

        false;


    Store.ready =

        false;


    Store.building =

        false;


    Store.lastBuiltAt =

        null;


    Store.lastBuildDuration =

        0;


    Store.sourceData =

        null;


    /*=========================================================
      PRIMARY DATA COLLECTIONS

      These hold normalized canonical records.
    =========================================================*/

    Store.data = {

        cases: [],

        accused: [],

        witnesses: [],

        seizures: [],

        seizedArticles: []

    };


    /*=========================================================
      PRIMARY POR INDEXES

      POR KEY IS THE AUTHORITATIVE
      CROSS-COLLECTION CONNECTOR.

      casesByPor
          Map<porKey, Case[]>

      accusedByPor
          Map<porKey, Accused[]>

      witnessesByPor
          Map<porKey, Witness[]>

      seizuresByPor
          Map<porKey, Seizure[]>

      seizedArticlesByPor
          Map<porKey, Article[]>
    =========================================================*/

    Store.index = {

        casesByPor:

            new Map(),

        accusedByPor:

            new Map(),

        witnessesByPor:

            new Map(),

        seizuresByPor:

            new Map(),

        seizedArticlesByPor:

            new Map(),


        /*=====================================================
          DIRECT ID INDEXES
        =====================================================*/

        casesById:

            new Map(),

        accusedById:

            new Map(),

        witnessesById:

            new Map(),

        seizuresById:

            new Map(),

        seizedArticlesById:

            new Map(),


        /*=====================================================
          SECONDARY RELATIONSHIP INDEXES

          These are NOT authoritative cross-collection links.

          They exist for fast direct lookup where IDs are valid.
        =====================================================*/

        accusedByCaseId:

            new Map(),

        witnessesByCaseId:

            new Map(),

        seizuresByCaseId:

            new Map(),

        articlesByCaseId:

            new Map(),

        articlesBySeizureId:

            new Map()

    };


    /*=========================================================
      STATISTICS
    =========================================================*/

    Store.stats = {

        cases:

            0,

        accused:

            0,

        witnesses:

            0,

        seizures:

            0,

        seizedArticles:

            0,

        uniquePor:

            0,

        casesWithoutPor:

            0,

        accusedWithoutPor:

            0,

        witnessesWithoutPor:

            0,

        seizuresWithoutPor:

            0,

        seizedArticlesWithoutPor:

            0,

        duplicateCasePor:

            0,

        buildDuration:

            0

    };


    /*=========================================================
      GET NORMALIZER
    =========================================================*/

    Store.getNormalizer = function () {

        const Normalizer =

            GG.Offence

                ?.Normalizer;


        if (

            !Normalizer

        ) {

            throw new Error(

                "[OffenceStore] GG.Offence.Normalizer is not loaded."

            );

        }


        return Normalizer;

    };


    /*=========================================================
      SAFE ARRAY
    =========================================================*/

    Store.safeArray = function (

        value

    ) {

        return Array.isArray(

            value

        )

            ? value

            : [];

    };


    /*=========================================================
      SAFE STRING
    =========================================================*/

    Store.safeString = function (

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

        ).trim();

    };


    /*=========================================================
      NORMALIZE POR KEY

      Always delegates to OffenceNormalizer.
    =========================================================*/

    Store.normalizePor = function (

        value

    ) {

        const Normalizer =

            Store

                .getNormalizer();


        return Normalizer

            .normalizePor(

                value

            );

    };


    /*=========================================================
      GET POR KEY FROM RECORD
    =========================================================*/

    Store.getPorKey = function (

        record

    ) {

        if (

            !record

        ) {

            return "";

        }


        if (

            record.porKey

        ) {

            return Store

                .normalizePor(

                    record.porKey

                );

        }


        const Normalizer =

            Store

                .getNormalizer();


        return Normalizer

            .getPorKey(

                record

            );

    };


    /*=========================================================
      ADD TO MULTI-VALUE MAP

      Map<Key, Array<Record>>
    =========================================================*/

    Store.addToMultiMap = function (

        map,

        key,

        record

    ) {

        if (

            !(

                map instanceof Map

            )

        ) {

            return;

        }


        if (

            !key

        ) {

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


        map

            .get(

                key

            )

            .push(

                record

            );

    };


    /*=========================================================
      ADD TO SINGLE-VALUE MAP

      Map<Key, Record>

      If duplicate ID exists, latest record replaces previous.
    =========================================================*/

    Store.addToSingleMap = function (

        map,

        key,

        record

    ) {

        if (

            !(

                map instanceof Map

            )

        ) {

            return;

        }


        if (

            !key

        ) {

            return;

        }


        map.set(

            key,

            record

        );

    };


    /*=========================================================
      CLEAR MAP
    =========================================================*/

    Store.clearMap = function (

        map

    ) {

        if (

            map instanceof Map

        ) {

            map.clear();

        }

    };


    /*=========================================================
      RESET INDEXES
    =========================================================*/

    Store.resetIndexes = function () {

        Object

            .values(

                Store.index

            )

            .forEach(

                function (

                    map

                ) {

                    Store

                        .clearMap(

                            map

                        );

                }

            );

    };


    /*=========================================================
      RESET STATISTICS
    =========================================================*/

    Store.resetStats = function () {

        Store.stats = {

            cases:

                0,

            accused:

                0,

            witnesses:

                0,

            seizures:

                0,

            seizedArticles:

                0,

            uniquePor:

                0,

            casesWithoutPor:

                0,

            accusedWithoutPor:

                0,

            witnessesWithoutPor:

                0,

            seizuresWithoutPor:

                0,

            seizedArticlesWithoutPor:

                0,

            duplicateCasePor:

                0,

            buildDuration:

                0

        };

    };


    /*=========================================================
      RESET STORE
    =========================================================*/

    Store.reset = function () {

        Store.ready =

            false;


        Store.building =

            false;


        Store.initialized =

            false;


        Store.lastBuiltAt =

            null;


        Store.lastBuildDuration =

            0;


        Store.sourceData =

            null;


        Store.data = {

            cases: [],

            accused: [],

            witnesses: [],

            seizures: [],

            seizedArticles: []

        };


        Store

            .resetIndexes();


        Store

            .resetStats();


        console.log(

            "[OffenceStore] Store reset."

        );

    };


    /*=========================================================
      INDEX CASES

      POR is authoritative.

      Multiple cases with same POR are retained as arrays.

      This prevents accidental data loss if duplicate POR
      numbers exist in Firestore.
    =========================================================*/

    Store.indexCases = function (

        records

    ) {

        records =

            Store

                .safeArray(

                    records

                );


        records.forEach(

            function (

                record

            ) {

                if (

                    !record

                ) {

                    return;

                }


                const porKey =

                    Store

                        .getPorKey(

                            record

                        );


                const caseId =

                    Store

                        .safeString(

                            record.caseId ||

                            record.id ||

                            record.documentId

                        );


                /*----------------------------------
                  POR Index
                ----------------------------------*/

                if (

                    porKey

                ) {

                    Store

                        .addToMultiMap(

                            Store.index

                                .casesByPor,

                            porKey,

                            record

                        );

                }

                else {

                    Store.stats

                        .casesWithoutPor++;

                }


                /*----------------------------------
                  Case ID Index
                ----------------------------------*/

                if (

                    caseId

                ) {

                    Store

                        .addToSingleMap(

                            Store.index

                                .casesById,

                            caseId,

                            record

                        );

                }

            }

        );

    };


    /*=========================================================
      INDEX ACCUSED
    =========================================================*/

    Store.indexAccused = function (

        records

    ) {

        records =

            Store

                .safeArray(

                    records

                );


        records.forEach(

            function (

                record

            ) {

                if (

                    !record

                ) {

                    return;

                }


                const porKey =

                    Store

                        .getPorKey(

                            record

                        );


                const accusedId =

                    Store

                        .safeString(

                            record.accusedId ||

                            record.id ||

                            record.documentId

                        );


                const caseId =

                    Store

                        .safeString(

                            record.caseId

                        );


                /*----------------------------------
                  POR Index
                ----------------------------------*/

                if (

                    porKey

                ) {

                    Store

                        .addToMultiMap(

                            Store.index

                                .accusedByPor,

                            porKey,

                            record

                        );

                }

                else {

                    Store.stats

                        .accusedWithoutPor++;

                }


                /*----------------------------------
                  Accused ID Index
                ----------------------------------*/

                if (

                    accusedId

                ) {

                    Store

                        .addToSingleMap(

                            Store.index

                                .accusedById,

                            accusedId,

                            record

                        );

                }


                /*----------------------------------
                  Secondary Case ID Index
                ----------------------------------*/

                if (

                    caseId

                ) {

                    Store

                        .addToMultiMap(

                            Store.index

                                .accusedByCaseId,

                            caseId,

                            record

                        );

                }

            }

        );

    };


    /*=========================================================
      INDEX WITNESSES
    =========================================================*/

    Store.indexWitnesses = function (

        records

    ) {

        records =

            Store

                .safeArray(

                    records

                );


        records.forEach(

            function (

                record

            ) {

                if (

                    !record

                ) {

                    return;

                }


                const porKey =

                    Store

                        .getPorKey(

                            record

                        );


                const witnessId =

                    Store

                        .safeString(

                            record.witnessId ||

                            record.id ||

                            record.documentId

                        );


                const caseId =

                    Store

                        .safeString(

                            record.caseId

                        );


                /*----------------------------------
                  POR Index
                ----------------------------------*/

                if (

                    porKey

                ) {

                    Store

                        .addToMultiMap(

                            Store.index

                                .witnessesByPor,

                            porKey,

                            record

                        );

                }

                else {

                    Store.stats

                        .witnessesWithoutPor++;

                }


                /*----------------------------------
                  Witness ID Index
                ----------------------------------*/

                if (

                    witnessId

                ) {

                    Store

                        .addToSingleMap(

                            Store.index

                                .witnessesById,

                            witnessId,

                            record

                        );

                }


                /*----------------------------------
                  Secondary Case ID Index
                ----------------------------------*/

                if (

                    caseId

                ) {

                    Store

                        .addToMultiMap(

                            Store.index

                                .witnessesByCaseId,

                            caseId,

                            record

                        );

                }

            }

        );

    };


    /*=========================================================
      INDEX SEIZURES
    =========================================================*/

    Store.indexSeizures = function (

        records

    ) {

        records =

            Store

                .safeArray(

                    records

                );


        records.forEach(

            function (

                record

            ) {

                if (

                    !record

                ) {

                    return;

                }


                const porKey =

                    Store

                        .getPorKey(

                            record

                        );


                const seizureId =

                    Store

                        .safeString(

                            record.seizureId ||

                            record.id ||

                            record.documentId

                        );


                const caseId =

                    Store

                        .safeString(

                            record.caseId

                        );


                /*----------------------------------
                  POR Index
                ----------------------------------*/

                if (

                    porKey

                ) {

                    Store

                        .addToMultiMap(

                            Store.index

                                .seizuresByPor,

                            porKey,

                            record

                        );

                }

                else {

                    Store.stats

                        .seizuresWithoutPor++;

                }


                /*----------------------------------
                  Seizure ID Index
                ----------------------------------*/

                if (

                    seizureId

                ) {

                    Store

                        .addToSingleMap(

                            Store.index

                                .seizuresById,

                            seizureId,

                            record

                        );

                }


                /*----------------------------------
                  Secondary Case ID Index
                ----------------------------------*/

                if (

                    caseId

                ) {

                    Store

                        .addToMultiMap(

                            Store.index

                                .seizuresByCaseId,

                            caseId,

                            record

                        );

                }

            }

        );

    };


    /*=========================================================
      INDEX SEIZED ARTICLES
    =========================================================*/

    Store.indexSeizedArticles = function (

        records

    ) {

        records =

            Store

                .safeArray(

                    records

                );


        records.forEach(

            function (

                record

            ) {

                if (

                    !record

                ) {

                    return;

                }


                const porKey =

                    Store

                        .getPorKey(

                            record

                        );


                const articleId =

                    Store

                        .safeString(

                            record.articleId ||

                            record.id ||

                            record.documentId

                        );


                const seizureId =

                    Store

                        .safeString(

                            record.seizureId

                        );


                const caseId =

                    Store

                        .safeString(

                            record.caseId

                        );


                /*----------------------------------
                  POR Index

                  AUTHORITATIVE CROSS-COLLECTION LINK
                ----------------------------------*/

                if (

                    porKey

                ) {

                    Store

                        .addToMultiMap(

                            Store.index

                                .seizedArticlesByPor,

                            porKey,

                            record

                        );

                }

                else {

                    Store.stats

                        .seizedArticlesWithoutPor++;

                }


                /*----------------------------------
                  Article ID Index
                ----------------------------------*/

                if (

                    articleId

                ) {

                    Store

                        .addToSingleMap(

                            Store.index

                                .seizedArticlesById,

                            articleId,

                            record

                        );

                }


                /*----------------------------------
                  Direct Seizure ID Index

                  Useful for:

                  seizure
                      ↓
                  articles
                ----------------------------------*/

                if (

                    seizureId

                ) {

                    Store

                        .addToMultiMap(

                            Store.index

                                .articlesBySeizureId,

                            seizureId,

                            record

                        );

                }


                /*----------------------------------
                  Optional Case ID Index
                ----------------------------------*/

                if (

                    caseId

                ) {

                    Store

                        .addToMultiMap(

                            Store.index

                                .articlesByCaseId,

                            caseId,

                            record

                        );

                }

            }

        );

    };


    /*=========================================================
      BUILD UNIQUE POR SET
    =========================================================*/

    Store.getAllPorKeys = function () {

        const keys =

            new Set();


        [

            Store.index

                .casesByPor,

            Store.index

                .accusedByPor,

            Store.index

                .witnessesByPor,

            Store.index

                .seizuresByPor,

            Store.index

                .seizedArticlesByPor

        ]

            .forEach(

                function (

                    map

                ) {

                    map

                        .forEach(

                            function (

                                value,

                                key

                            ) {

                                if (

                                    key

                                ) {

                                    keys.add(

                                        key

                                    );

                                }

                            }

                        );

                }

            );


        return Array.from(

            keys

        );

    };


    /*=========================================================
      CALCULATE STATISTICS
    =========================================================*/

    Store.calculateStats = function () {

        Store.stats.cases =

            Store.data

                .cases

                .length;


        Store.stats.accused =

            Store.data

                .accused

                .length;


        Store.stats.witnesses =

            Store.data

                .witnesses

                .length;


        Store.stats.seizures =

            Store.data

                .seizures

                .length;


        Store.stats.seizedArticles =

            Store.data

                .seizedArticles

                .length;


        Store.stats.uniquePor =

            Store

                .getAllPorKeys()

                .length;


        Store.stats.duplicateCasePor =

            0;


        Store.index

            .casesByPor

            .forEach(

                function (

                    cases

                ) {

                    if (

                        cases.length >

                        1

                    ) {

                        Store.stats

                            .duplicateCasePor++;

                    }

                }

            );

    };


    /*=========================================================
      BUILD STORE

      Expected input:

      {
          cases: [],
          accused: [],
          witnesses: [],
          seizures: [],
          seizedArticles: []
      }

      The input can already be normalized.

      If normalize !== false, the store will pass the data
      through OffenceNormalizer.normalizeAll().
    =========================================================*/

    Store.build = function (

        data,

        options = {}

    ) {

        if (

            Store.building

        ) {

            console.warn(

                "[OffenceStore] Build already in progress."

            );


            return Store.data;

        }


        Store.building =

            true;


        Store.ready =

            false;


        const startedAt =

            Date.now();


        console.group(

            "🔥 OFFENCE STORE BUILD"

        );


        try {

            data =

                data ||

                {};


            Store.sourceData =

                data;


            /*----------------------------------
              Reset Previous Indexes
            ----------------------------------*/

            Store

                .resetIndexes();


            Store

                .resetStats();


            /*----------------------------------
              Normalize
            ----------------------------------*/

            let normalizedData;


            if (

                options.normalize ===

                false

            ) {

                normalizedData =

                    data;

            }

            else {

                const Normalizer =

                    Store

                        .getNormalizer();


                normalizedData =

                    Normalizer

                        .normalizeAll(

                            data

                        );

            }


            /*----------------------------------
              Save Canonical Data
            ----------------------------------*/

            Store.data = {

                cases:

                    Store

                        .safeArray(

                            normalizedData

                                .cases

                        ),

                accused:

                    Store

                        .safeArray(

                            normalizedData

                                .accused

                        ),

                witnesses:

                    Store

                        .safeArray(

                            normalizedData

                                .witnesses

                        ),

                seizures:

                    Store

                        .safeArray(

                            normalizedData

                                .seizures

                        ),

                seizedArticles:

                    Store

                        .safeArray(

                            normalizedData

                                .seizedArticles

                        )

            };


            /*----------------------------------
              Build Indexes
            ----------------------------------*/

            Store

                .indexCases(

                    Store.data

                        .cases

                );


            Store

                .indexAccused(

                    Store.data

                        .accused

                );


            Store

                .indexWitnesses(

                    Store.data

                        .witnesses

                );


            Store

                .indexSeizures(

                    Store.data

                        .seizures

                );


            Store

                .indexSeizedArticles(

                    Store.data

                        .seizedArticles

                );


            /*----------------------------------
              Statistics
            ----------------------------------*/

            Store

                .calculateStats();


            Store.lastBuildDuration =

                Date.now() -

                startedAt;


            Store.stats.buildDuration =

                Store.lastBuildDuration;


            Store.lastBuiltAt =

                new Date();


            Store.initialized =

                true;


            Store.ready =

                true;


            console.log(

                "✓ Offence Store built."

            );


            console.log(

                "Relationship strategy:",

                "POR KEY AUTHORITATIVE"

            );


            console.log(

                "Cases:",

                Store.stats.cases

            );


            console.log(

                "Accused:",

                Store.stats.accused

            );


            console.log(

                "Witnesses:",

                Store.stats.witnesses

            );


            console.log(

                "Seizures:",

                Store.stats.seizures

            );


            console.log(

                "Seized Articles:",

                Store.stats.seizedArticles

            );


            console.log(

                "Unique POR Keys:",

                Store.stats.uniquePor

            );


            console.log(

                "Cases without POR:",

                Store.stats.casesWithoutPor

            );


            console.log(

                "Accused without POR:",

                Store.stats.accusedWithoutPor

            );


            console.log(

                "Witnesses without POR:",

                Store.stats.witnessesWithoutPor

            );


            console.log(

                "Seizures without POR:",

                Store.stats.seizuresWithoutPor

            );


            console.log(

                "Articles without POR:",

                Store.stats.seizedArticlesWithoutPor

            );


            console.log(

                "Duplicate Case POR Keys:",

                Store.stats.duplicateCasePor

            );


            console.log(

                "Build Duration:",

                Store.lastBuildDuration,

                "ms"

            );


            return Store.data;

        }

        catch (

            error

        ) {

            Store.ready =

                false;


            Store.initialized =

                false;


            console.error(

                "[OffenceStore] Build failed:",

                error

            );


            throw error;

        }

        finally {

            Store.building =

                false;


            console.groupEnd();

        }

    };


    /*=========================================================
      INITIALIZE

      Alias for build().

      Allows:

      Store.init(data)

      or

      Store.build(data)
    =========================================================*/

    Store.init = function (

        data,

        options = {}

    ) {

        return Store

            .build(

                data,

                options

            );

    };


    /*=========================================================
      GET CASES BY POR
    =========================================================*/

    Store.getCasesByPor = function (

        porNo

    ) {

        const porKey =

            Store

                .normalizePor(

                    porNo

                );


        if (

            !porKey

        ) {

            return [];

        }


        return [

            ...(

                Store.index

                    .casesByPor

                    .get(

                        porKey

                    ) ||

                []

            )

        ];

    };


    /*=========================================================
      GET PRIMARY CASE BY POR

      Normally one POR = one case.

      If duplicate POR exists, returns first case.

      Use getCasesByPor() when duplicates must be inspected.
    =========================================================*/

    Store.getCaseByPor = function (

        porNo

    ) {

        const cases =

            Store

                .getCasesByPor(

                    porNo

                );


        return cases[0] ||

            null;

    };


    /*=========================================================
      GET ACCUSED BY POR
    =========================================================*/

    Store.getAccusedByPor = function (

        porNo

    ) {

        const porKey =

            Store

                .normalizePor(

                    porNo

                );


        return [

            ...(

                Store.index

                    .accusedByPor

                    .get(

                        porKey

                    ) ||

                []

            )

        ];

    };


    /*=========================================================
      GET WITNESSES BY POR
    =========================================================*/

    Store.getWitnessesByPor = function (

        porNo

    ) {

        const porKey =

            Store

                .normalizePor(

                    porNo

                );


        return [

            ...(

                Store.index

                    .witnessesByPor

                    .get(

                        porKey

                    ) ||

                []

            )

        ];

    };


    /*=========================================================
      GET SEIZURES BY POR
    =========================================================*/

    Store.getSeizuresByPor = function (

        porNo

    ) {

        const porKey =

            Store

                .normalizePor(

                    porNo

                );


        return [

            ...(

                Store.index

                    .seizuresByPor

                    .get(

                        porKey

                    ) ||

                []

            )

        ];

    };


    /*=========================================================
      GET SEIZED ARTICLES BY POR
    =========================================================*/

    Store.getSeizedArticlesByPor = function (

        porNo

    ) {

        const porKey =

            Store

                .normalizePor(

                    porNo

                );


        return [

            ...(

                Store.index

                    .seizedArticlesByPor

                    .get(

                        porKey

                    ) ||

                []

            )

        ];

    };


    /*=========================================================
      GET COMPLETE POR CASCADE

      THIS IS THE MAIN RELATIONSHIP FUNCTION.

      Example:

      Store.getCascadeByPor(
          "53/HTG of 2025-26"
      )

      Returns:

      {
          porNo,
          porKey,
          case,
          cases,
          accused,
          witnesses,
          seizures,
          seizedArticles,
          seizureGroups,
          counts
      }
    =========================================================*/

    Store.getCascadeByPor = function (

        porNo

    ) {

        const porKey =

            Store

                .normalizePor(

                    porNo

                );


        if (

            !porKey

        ) {

            return null;

        }


        const cases =

            Store

                .getCasesByPor(

                    porKey

                );


        const accused =

            Store

                .getAccusedByPor(

                    porKey

                );


        const witnesses =

            Store

                .getWitnessesByPor(

                    porKey

                );


        const seizures =

            Store

                .getSeizuresByPor(

                    porKey

                );


        const seizedArticles =

            Store

                .getSeizedArticlesByPor(

                    porKey

                );


        /*----------------------------------
          Group Articles Under Seizures

          POR remains authoritative.

          seizureId is used here only to provide
          convenient nested display.
        ----------------------------------*/

        const seizureGroups =

            seizures.map(

                function (

                    seizure

                ) {

                    const seizureId =

                        Store

                            .safeString(

                                seizure

                                    .seizureId

                            );


                    let articles = [];


                    if (

                        seizureId

                    ) {

                        articles = [

                            ...(

                                Store.index

                                    .articlesBySeizureId

                                    .get(

                                        seizureId

                                    ) ||

                                []

                            )

                        ];

                    }


                    return {

                        seizure:

                            seizure,

                        articles:

                            articles

                    };

                }

            );


        return {

            porNo:

                cases[0]

                    ?.porNo ||

                cases[0]

                    ?.refPorNo ||

                porNo,

            porKey:

                porKey,


            /*----------------------------------
              Primary Case
            ----------------------------------*/

            case:

                cases[0] ||

                null,


            /*----------------------------------
              All Matching Cases

              Important if duplicate POR exists.
            ----------------------------------*/

            cases:

                cases,


            /*----------------------------------
              Related Data
            ----------------------------------*/

            accused:

                accused,

            witnesses:

                witnesses,

            seizures:

                seizures,

            seizedArticles:

                seizedArticles,


            /*----------------------------------
              Nested Display Structure
            ----------------------------------*/

            seizureGroups:

                seizureGroups,


            /*----------------------------------
              Counts
            ----------------------------------*/

            counts: {

                cases:

                    cases.length,

                accused:

                    accused.length,

                witnesses:

                    witnesses.length,

                seizures:

                    seizures.length,

                seizedArticles:

                    seizedArticles.length

            }

        };

    };


    /*=========================================================
      ALIAS

      Useful for popup/cascade modules.
    =========================================================*/

    Store.getPorCascade =

        Store.getCascadeByPor;


    /*=========================================================
      GET CASE BY CASE ID
    =========================================================*/

    Store.getCaseById = function (

        caseId

    ) {

        caseId =

            Store

                .safeString(

                    caseId

                );


        if (

            !caseId

        ) {

            return null;

        }


        return Store.index

            .casesById

            .get(

                caseId

            ) ||

            null;

    };


    /*=========================================================
      GET ACCUSED BY ID
    =========================================================*/

    Store.getAccusedById = function (

        accusedId

    ) {

        accusedId =

            Store

                .safeString(

                    accusedId

                );


        return Store.index

            .accusedById

            .get(

                accusedId

            ) ||

            null;

    };


    /*=========================================================
      GET WITNESS BY ID
    =========================================================*/

    Store.getWitnessById = function (

        witnessId

    ) {

        witnessId =

            Store

                .safeString(

                    witnessId

                );


        return Store.index

            .witnessesById

            .get(

                witnessId

            ) ||

            null;

    };


    /*=========================================================
      GET SEIZURE BY ID
    =========================================================*/

    Store.getSeizureById = function (

        seizureId

    ) {

        seizureId =

            Store

                .safeString(

                    seizureId

                );


        return Store.index

            .seizuresById

            .get(

                seizureId

            ) ||

            null;

    };


    /*=========================================================
      GET ARTICLE BY ID
    =========================================================*/

    Store.getSeizedArticleById = function (

        articleId

    ) {

        articleId =

            Store

                .safeString(

                    articleId

                );


        return Store.index

            .seizedArticlesById

            .get(

                articleId

            ) ||

            null;

    };


    /*=========================================================
      GET ACCUSED BY CASE ID

      Secondary relationship only.
    =========================================================*/

    Store.getAccusedByCaseId = function (

        caseId

    ) {

        caseId =

            Store

                .safeString(

                    caseId

                );


        return [

            ...(

                Store.index

                    .accusedByCaseId

                    .get(

                        caseId

                    ) ||

                []

            )

        ];

    };


    /*=========================================================
      GET WITNESSES BY CASE ID
    =========================================================*/

    Store.getWitnessesByCaseId = function (

        caseId

    ) {

        caseId =

            Store

                .safeString(

                    caseId

                );


        return [

            ...(

                Store.index

                    .witnessesByCaseId

                    .get(

                        caseId

                    ) ||

                []

            )

        ];

    };


    /*=========================================================
      GET SEIZURES BY CASE ID
    =========================================================*/

    Store.getSeizuresByCaseId = function (

        caseId

    ) {

        caseId =

            Store

                .safeString(

                    caseId

                );


        return [

            ...(

                Store.index

                    .seizuresByCaseId

                    .get(

                        caseId

                    ) ||

                []

            )

        ];

    };


    /*=========================================================
      GET ARTICLES BY SEIZURE ID

      Direct child relationship.
    =========================================================*/

    Store.getArticlesBySeizureId = function (

        seizureId

    ) {

        seizureId =

            Store

                .safeString(

                    seizureId

                );


        return [

            ...(

                Store.index

                    .articlesBySeizureId

                    .get(

                        seizureId

                    ) ||

                []

            )

        ];

    };


    /*=========================================================
      GET COMPLETE CASCADE FROM CASE ID

      IMPORTANT:

      We first resolve the case.

      Then use its POR.

      We DO NOT primarily join child collections by caseId.
    =========================================================*/

    Store.getCascadeByCaseId = function (

        caseId

    ) {

        const caseRecord =

            Store

                .getCaseById(

                    caseId

                );


        if (

            !caseRecord

        ) {

            return null;

        }


        const porKey =

            Store

                .getPorKey(

                    caseRecord

                );


        if (

            !porKey

        ) {

            return {

                porNo:

                    "",

                porKey:

                    "",

                case:

                    caseRecord,

                cases:

                    [

                        caseRecord

                    ],

                accused:

                    [],

                witnesses:

                    [],

                seizures:

                    [],

                seizedArticles:

                    [],

                seizureGroups:

                    [],

                counts: {

                    cases:

                        1,

                    accused:

                        0,

                    witnesses:

                        0,

                    seizures:

                        0,

                    seizedArticles:

                        0

                }

            };

        }


        return Store

            .getCascadeByPor(

                porKey

            );

    };


    /*=========================================================
      GET COMPLETE CASCADE FROM ACCUSED

      accusedId
          ↓
      accused
          ↓
      POR
          ↓
      complete case cascade
    =========================================================*/

    Store.getCascadeByAccusedId = function (

        accusedId

    ) {

        const accused =

            Store

                .getAccusedById(

                    accusedId

                );


        if (

            !accused

        ) {

            return null;

        }


        const porKey =

            Store

                .getPorKey(

                    accused

                );


        if (

            !porKey

        ) {

            return null;

        }


        return Store

            .getCascadeByPor(

                porKey

            );

    };


    /*=========================================================
      GET COMPLETE CASCADE FROM SEIZURE
    =========================================================*/

    Store.getCascadeBySeizureId = function (

        seizureId

    ) {

        const seizure =

            Store

                .getSeizureById(

                    seizureId

                );


        if (

            !seizure

        ) {

            return null;

        }


        const porKey =

            Store

                .getPorKey(

                    seizure

                );


        if (

            !porKey

        ) {

            return null;

        }


        return Store

            .getCascadeByPor(

                porKey

            );

    };


    /*=========================================================
      GET COMPLETE CASCADE FROM ARTICLE
    =========================================================*/

    Store.getCascadeByArticleId = function (

        articleId

    ) {

        const article =

            Store

                .getSeizedArticleById(

                    articleId

                );


        if (

            !article

        ) {

            return null;

        }


        const porKey =

            Store

                .getPorKey(

                    article

                );


        if (

            !porKey

        ) {

            return null;

        }


        return Store

            .getCascadeByPor(

                porKey

            );

    };


    /*=========================================================
      GET ALL CASCADES

      One cascade per POR.

      Useful for:
          analytics
          heatmap
          offence aggregation
          source/target processing
    =========================================================*/

    Store.getAllCascades = function () {

        const porKeys =

            Store

                .getAllPorKeys();


        return porKeys

            .map(

                function (

                    porKey

                ) {

                    return Store

                        .getCascadeByPor(

                            porKey

                        );

                }

            )

            .filter(

                Boolean

            );

    };


    /*=========================================================
      GET CASE CASCADES ONLY

      Unlike getAllCascades(), this only returns PORs
      that exist in offence_cases.

      This should normally be used for authoritative
      offence analytics.
    =========================================================*/

    Store.getCaseCascades = function () {

        const cascades = [];


        Store.index

            .casesByPor

            .forEach(

                function (

                    cases,

                    porKey

                ) {

                    const cascade =

                        Store

                            .getCascadeByPor(

                                porKey

                            );


                    if (

                        cascade

                    ) {

                        cascades.push(

                            cascade

                        );

                    }

                }

            );


        return cascades;

    };


    /*=========================================================
      FIND ORPHAN POR DATA

      Finds child PORs which do not exist in offence_cases.

      Importers should already prevent most of these,
      but this gives frontend diagnostics.
    =========================================================*/

    Store.getOrphanPorData = function () {

        const validCasePor =

            new Set(

                Store.index

                    .casesByPor

                    .keys()

            );


        function findOrphans(

            map

        ) {

            const result = [];


            map

                .forEach(

                    function (

                        records,

                        porKey

                    ) {

                        if (

                            !validCasePor

                                .has(

                                    porKey

                                )

                        ) {

                            result.push(

                                {

                                    porKey:

                                        porKey,

                                    count:

                                        records.length,

                                    records:

                                        [

                                            ...records

                                        ]

                                }

                            );

                        }

                    }

                );


            return result;

        }


        return {

            accused:

                findOrphans(

                    Store.index

                        .accusedByPor

                ),

            witnesses:

                findOrphans(

                    Store.index

                        .witnessesByPor

                ),

            seizures:

                findOrphans(

                    Store.index

                        .seizuresByPor

                ),

            seizedArticles:

                findOrphans(

                    Store.index

                        .seizedArticlesByPor

                )

        };

    };


    /*=========================================================
      GET DUPLICATE CASE POR DATA

      A POR should normally resolve to one case.

      We do not silently delete duplicates.
    =========================================================*/

    Store.getDuplicateCasePor = function () {

        const duplicates = [];


        Store.index

            .casesByPor

            .forEach(

                function (

                    cases,

                    porKey

                ) {

                    if (

                        cases.length >

                        1

                    ) {

                        duplicates.push(

                            {

                                porKey:

                                    porKey,

                                count:

                                    cases.length,

                                cases:

                                    [

                                        ...cases

                                    ]

                            }

                        );

                    }

                }

            );


        return duplicates;

    };


    /*=========================================================
      HAS POR
    =========================================================*/

    Store.hasPor = function (

        porNo

    ) {

        const porKey =

            Store

                .normalizePor(

                    porNo

                );


        if (

            !porKey

        ) {

            return false;

        }


        return Store.index

            .casesByPor

            .has(

                porKey

            );

    };


    /*=========================================================
      GET RAW DATASET
    =========================================================*/

    Store.getData = function () {

        return Store.data;

    };


    /*=========================================================
      GET CASES
    =========================================================*/

    Store.getCases = function () {

        return [

            ...Store.data

                .cases

        ];

    };


    /*=========================================================
      GET ACCUSED
    =========================================================*/

    Store.getAccused = function () {

        return [

            ...Store.data

                .accused

        ];

    };


    /*=========================================================
      GET WITNESSES
    =========================================================*/

    Store.getWitnesses = function () {

        return [

            ...Store.data

                .witnesses

        ];

    };


    /*=========================================================
      GET SEIZURES
    =========================================================*/

    Store.getSeizures = function () {

        return [

            ...Store.data

                .seizures

        ];

    };


    /*=========================================================
      GET SEIZED ARTICLES
    =========================================================*/

    Store.getSeizedArticles = function () {

        return [

            ...Store.data

                .seizedArticles

        ];

    };


    /*=========================================================
      GET STATS
    =========================================================*/

    Store.getStats = function () {

        return {

            ...Store.stats,

            initialized:

                Store.initialized,

            ready:

                Store.ready,

            lastBuiltAt:

                Store.lastBuiltAt,

            lastBuildDuration:

                Store.lastBuildDuration

        };

    };


    /*=========================================================
      DEBUG SUMMARY
    =========================================================*/

    Store.debug = function () {

        console.group(

            "🔥 OFFENCE STORE DEBUG"

        );


        console.log(

            "Version:",

            Store.VERSION

        );


        console.log(

            "Initialized:",

            Store.initialized

        );


        console.log(

            "Ready:",

            Store.ready

        );


        console.log(

            "Stats:",

            Store

                .getStats()

        );


        console.log(

            "POR Keys:",

            Store

                .getAllPorKeys()

                .length

        );


        console.log(

            "Duplicate Case POR:",

            Store

                .getDuplicateCasePor()

        );


        console.log(

            "Orphan POR Data:",

            Store

                .getOrphanPorData()

        );


        console.groupEnd();


        return {

            stats:

                Store

                    .getStats(),

            duplicateCasePor:

                Store

                    .getDuplicateCasePor(),

            orphanPorData:

                Store

                    .getOrphanPorData()

        };

    };


    /*=========================================================
      REGISTER
    =========================================================*/

    GG.Offence.Store =

        Store;


    /*=========================================================
      READY
    =========================================================*/

    console.log(

        "%cOffence Store Ready",

        "color:#d32f2f;font-weight:bold;"

    );


    console.log(

        "[OffenceStore] Version:",

        Store.VERSION

    );


    console.log(

        "[OffenceStore] Relationship strategy:",

        "POR KEY AUTHORITATIVE"

    );


})(window);
