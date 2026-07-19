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

        GG.Offence.DataLoader

    ) {

        console.warn(

            "[GreenGuardAI] Offence Data Loader already loaded."

        );

        return;

    }


    /*=========================================================
      MODULE
    =========================================================*/

    const DataLoader = {};


    /*=========================================================
      VERSION
    =========================================================*/

    DataLoader.VERSION =

        "2.1.0";


    /*=========================================================
      STATE
    =========================================================*/

    DataLoader.initialized =

        false;


    DataLoader.loading =

        false;


    DataLoader.loaded =

        false;


    DataLoader.lastLoadedAt =

        null;


    DataLoader.lastError =

        null;


    DataLoader.lastResult =

        null;


    /*=========================================================
      CONFIGURATION

      IMPORTANT:

      DataLoader only loads raw Firestore collections.

      POR relationship resolution belongs to:

      offenceNormalizer.js
              ↓
      offenceStore.js

      Authoritative business connector:

      POR No.
              ↓
      normalized POR key

    =========================================================*/

    DataLoader.COLLECTIONS = {

        CASES:

            "offence_cases",

        ACCUSED:

            "offence_accused",

        WITNESSES:

            "offence_witnesses",

        SEIZURES:

            "offence_seizures",

        SEIZED_ARTICLES:

            "offence_seized_articles"

    };


    /*=========================================================
      OPTIONAL BACKEND CONFIGURATION

      Firestore is the primary source.

      BACKEND_ACTION is retained only for compatibility.

    =========================================================*/

    DataLoader.BACKEND_ACTION =

        "getOffenceData";


    DataLoader.SOURCE =

        "firestore";


    DataLoader.AUTO_LOAD =

        false;


    /*=========================================================
      INITIALIZE
    =========================================================*/

    DataLoader.init = function () {

        if (

            DataLoader.initialized

        ) {

            return;

        }


        DataLoader.initialized =

            true;


        console.log(

            "%cOffence Data Loader Ready",

            "color:#d32f2f;font-weight:bold;"

        );


        console.log(

            "[OffenceDataLoader] Version:",

            DataLoader.VERSION

        );


        console.log(

            "[OffenceDataLoader] Source:",

            DataLoader.SOURCE

        );


        console.log(

            "[OffenceDataLoader] Collections:",

            DataLoader.COLLECTIONS

        );


        if (

            DataLoader.AUTO_LOAD

        ) {

            DataLoader

                .load()

                .catch(

                    function (

                        error

                    ) {

                        console.error(

                            "[OffenceDataLoader] Auto load failed:",

                            error

                        );

                    }

                );

        }

    };


    /*=========================================================
      GET STORE
    =========================================================*/

    DataLoader.getStore = function () {

        const Store =

            GG.Offence.Store;


        if (

            !Store

        ) {

            throw new Error(

                "OffenceStore unavailable."

            );

        }


        if (

            typeof Store.build !==

            "function"

        ) {

            throw new Error(

                "OffenceStore.build() unavailable."

            );

        }


        return Store;

    };


    /*=========================================================
      GET FIREBASE MODULAR HELPERS

      GreenGuard Firebase architecture:

      window.fb
          ├── collection()
          ├── getDocs()
          └── other modular Firebase functions

    =========================================================*/

    DataLoader.getFirebase = function () {

        return window.fb || null;

    };


    /*=========================================================
      GET FIRESTORE

      GreenGuard Firestore architecture:

      window.db
          ↓
      Firebase modular Firestore instance

    =========================================================*/

    DataLoader.getFirestore = function () {

        return window.db || null;

    };


    /*=========================================================
      VALIDATE FIREBASE

      This follows the same modular Firebase pattern used by
      the existing GreenGuard StaffEntities module.

    =========================================================*/

    DataLoader.validateFirebase = function () {

        const fb =

            DataLoader.getFirebase();


        const db =

            DataLoader.getFirestore();


        if (

            !fb

        ) {

            throw new Error(

                "Firebase SDK not initialized."

            );

        }


        if (

            !db

        ) {

            throw new Error(

                "Firestore database unavailable."

            );

        }


        if (

            typeof fb.collection !==

            "function"

        ) {

            throw new Error(

                "Firebase collection() unavailable."

            );

        }


        if (

            typeof fb.getDocs !==

            "function"

        ) {

            throw new Error(

                "Firebase getDocs() unavailable."

            );

        }


        return {

            fb,

            db

        };

    };


    /*=========================================================
      ENSURE ARRAY
    =========================================================*/

    DataLoader.ensureArray = function (

        value

    ) {

        if (

            Array.isArray(

                value

            )

        ) {

            return value;

        }


        return [];

    };


    /*=========================================================
      PARSE JSON

      Retained for compatibility with manual/backend loading.

    =========================================================*/

    DataLoader.parseJSON = function (

        value

    ) {

        if (

            typeof value !==

            "string"

        ) {

            return value;

        }


        const trimmed =

            value.trim();


        if (

            !trimmed

        ) {

            return {};

        }


        try {

            return JSON.parse(

                trimmed

            );

        }

        catch (

            error

        ) {

            console.warn(

                "[OffenceDataLoader] Response is not valid JSON."

            );


            return value;

        }

    };


    /*=========================================================
      UNWRAP RESPONSE

      Supported:

      {
          cases: [],
          accused: [],
          witnesses: [],
          seizures: [],
          seizedArticles: []
      }

      OR

      {
          data: {
              ...
          }
      }

      OR

      {
          result: {
              ...
          }
      }

    =========================================================*/

    DataLoader.unwrapResponse = function (

        response

    ) {

        let data =

            DataLoader

                .parseJSON(

                    response

                );


        if (

            !data ||

            typeof data !==

            "object"

        ) {

            return {};

        }


        if (

            data.data &&

            typeof data.data ===

            "object" &&

            !Array.isArray(

                data.data

            )

        ) {

            data =

                data.data;

        }

        else if (

            data.result &&

            typeof data.result ===

            "object" &&

            !Array.isArray(

                data.result

            )

        ) {

            data =

                data.result;

        }


        return data;

    };


    /*=========================================================
      EXTRACT DATASETS

      Canonical output:

      {
          cases: [],
          accused: [],
          witnesses: [],
          seizures: [],
          seizedArticles: []
      }

    =========================================================*/

    DataLoader.extractData = function (

        response

    ) {

        const data =

            DataLoader

                .unwrapResponse(

                    response

                );


        /*----------------------------------
          Cases
        ----------------------------------*/

        const cases =

            data.cases ||

            data.caseData ||

            data.caseRecords ||

            data.offenceCases ||

            data.offence_cases ||

            [];


        /*----------------------------------
          Accused
        ----------------------------------*/

        const accused =

            data.accused ||

            data.accusedData ||

            data.accusedRecords ||

            data.offenceAccused ||

            data.offence_accused ||

            data.suspects ||

            [];


        /*----------------------------------
          Witnesses
        ----------------------------------*/

        const witnesses =

            data.witnesses ||

            data.witnessData ||

            data.witnessRecords ||

            data.offenceWitnesses ||

            data.offence_witnesses ||

            [];


        /*----------------------------------
          Seizures
        ----------------------------------*/

        const seizures =

            data.seizures ||

            data.seizureData ||

            data.seizureRecords ||

            data.offenceSeizures ||

            data.offence_seizures ||

            [];


        /*----------------------------------
          Seized Articles
        ----------------------------------*/

        const seizedArticles =

            data.seizedArticles ||

            data.seizedArticleData ||

            data.seizedArticleRecords ||

            data.articles ||

            data.offenceSeizedArticles ||

            data.offence_seized_articles ||

            [];


        return {

            cases:

                DataLoader.ensureArray(

                    cases

                ),

            accused:

                DataLoader.ensureArray(

                    accused

                ),

            witnesses:

                DataLoader.ensureArray(

                    witnesses

                ),

            seizures:

                DataLoader.ensureArray(

                    seizures

                ),

            seizedArticles:

                DataLoader.ensureArray(

                    seizedArticles

                )

        };

    };


    /*=========================================================
      VALIDATE DATASETS
    =========================================================*/

    DataLoader.validateData = function (

        data

    ) {

        if (

            !data ||

            typeof data !==

            "object"

        ) {

            return {

                valid:

                    false,

                error:

                    "Invalid offence data."

            };

        }


        const requiredDatasets = [

            "cases",

            "accused",

            "witnesses",

            "seizures",

            "seizedArticles"

        ];


        for (

            let i = 0;

            i < requiredDatasets.length;

            i++

        ) {

            const datasetName =

                requiredDatasets[i];


            if (

                !Array.isArray(

                    data[datasetName]

                )

            ) {

                return {

                    valid:

                        false,

                    error:

                        datasetName +

                        " dataset is invalid."

                };

            }

        }


        return {

            valid:

                true,

            error:

                null

        };

    };


    /*=========================================================
      SNAPSHOT TO ARRAY

      IMPORTANT:

      Firestore document ID is preserved as:

          id

      Existing document fields are also retained.

    =========================================================*/

    DataLoader.snapshotToArray = function (

        snapshot

    ) {

        const records = [];


        if (

            !snapshot

        ) {

            return records;

        }


        snapshot.forEach(

            function (

                doc

            ) {

                const data =

                    doc.data() ||

                    {};


                records.push({

                    ...data,

                    id:

                        doc.id

                });

            }

        );


        return records;

    };


    /*=========================================================
      FETCH FIRESTORE COLLECTION

      IMPORTANT:

      Firebase v9+ modular API.

      Correct:

          fb.collection(
              db,
              collectionName
          )

          fb.getDocs(
              collectionReference
          )

      NOT:

          db.collection(...).get()

    =========================================================*/

    DataLoader.fetchCollection = async function (

        collectionName

    ) {

        const startedAt =

            Date.now();


        const {

            fb,

            db

        } =

            DataLoader

                .validateFirebase();


        const collectionReference =

            fb.collection(

                db,

                collectionName

            );


        const snapshot =

            await fb.getDocs(

                collectionReference

            );


        const records =

            DataLoader

                .snapshotToArray(

                    snapshot

                );


        console.log(

            "[OffenceDataLoader] Collection loaded:",

            {

                collection:

                    collectionName,

                records:

                    records.length,

                duration:

                    Date.now() -

                    startedAt

            }

        );


        return records;

    };


    /*=========================================================
      FETCH FROM FIRESTORE

      All five collections are fetched in parallel.

    =========================================================*/

    DataLoader.fetchFromFirestore = async function () {

        /*----------------------------------
          Validate Firebase First
        ----------------------------------*/

        DataLoader

            .validateFirebase();


        const collections =

            DataLoader.COLLECTIONS;


        console.log(

            "🔥 Fetching Offence Data From Firestore",

            collections

        );


        const [

            cases,

            accused,

            witnesses,

            seizures,

            seizedArticles

        ] =

            await Promise.all([

                DataLoader

                    .fetchCollection(

                        collections.CASES

                    ),

                DataLoader

                    .fetchCollection(

                        collections.ACCUSED

                    ),

                DataLoader

                    .fetchCollection(

                        collections.WITNESSES

                    ),

                DataLoader

                    .fetchCollection(

                        collections.SEIZURES

                    ),

                DataLoader

                    .fetchCollection(

                        collections.SEIZED_ARTICLES

                    )

            ]);


        const result = {

            cases:

                cases,

            accused:

                accused,

            witnesses:

                witnesses,

            seizures:

                seizures,

            seizedArticles:

                seizedArticles

        };


        console.log(

            "🔥 Firestore Offence Data Loaded",

            {

                cases:

                    result.cases.length,

                accused:

                    result.accused.length,

                witnesses:

                    result.witnesses.length,

                seizures:

                    result.seizures.length,

                seizedArticles:

                    result.seizedArticles.length

            }

        );


        return result;

    };


    /*=========================================================
      FETCH DATA

      Firestore is authoritative data source.

      This function replaces dependence on old backend loading.

    =========================================================*/

    DataLoader.fetchFromBackend = async function () {

        return DataLoader

            .fetchFromFirestore();

    };


    /*=========================================================
      GET DATASET COUNTS
    =========================================================*/

    DataLoader.getCounts = function (

        data

    ) {

        data =

            data ||

            {};


        return {

            cases:

                DataLoader

                    .ensureArray(

                        data.cases

                    )

                    .length,

            accused:

                DataLoader

                    .ensureArray(

                        data.accused

                    )

                    .length,

            witnesses:

                DataLoader

                    .ensureArray(

                        data.witnesses

                    )

                    .length,

            seizures:

                DataLoader

                    .ensureArray(

                        data.seizures

                    )

                    .length,

            seizedArticles:

                DataLoader

                    .ensureArray(

                        data.seizedArticles

                    )

                    .length

        };

    };


    /*=========================================================
      DISPATCH EVENT
    =========================================================*/

    DataLoader.dispatchEvent = function (

        eventName,

        detail = {}

    ) {

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

            console.warn(

                "[OffenceDataLoader] Event dispatch failed:",

                eventName,

                error

            );

        }

    };


    /*=========================================================
      LOAD DATA INTO STORE

      DataLoader does NOT resolve relationships.

      Store receives all five datasets.

      Next architecture:

      DataLoader
          ↓
      Normalizer
          ↓
      POR normalization
          ↓
      Store
          ↓
      POR indexes

      IMPORTANT:

      OffenceStore authoritative build API:

          Store.build(data)

    =========================================================*/

    DataLoader.loadIntoStore = function (

        data

    ) {

        const Store =

            DataLoader

                .getStore();


        const validation =

            DataLoader

                .validateData(

                    data

                );


        if (

            !validation.valid

        ) {

            throw new Error(

                validation.error

            );

        }


        const counts =

            DataLoader

                .getCounts(

                    data

                );


        console.log(

            "🔥 Building Offence Store",

            counts

        );


        return Store

            .build(

                data

            );

    };


    /*=========================================================
      GET STORE STATS SAFELY
    =========================================================*/

    DataLoader.getStoreStats = function () {

        const Store =

            GG.Offence.Store;


        if (

            Store &&

            typeof Store.getStats ===

            "function"

        ) {

            return Store

                .getStats();

        }


        return {

            cases:

                0,

            accused:

                0,

            witnesses:

                0,

            seizures:

                0,

            seizedArticles:

                0

        };

    };


    /*=========================================================
      LOAD

      Full initial load.

    =========================================================*/

    DataLoader.load = async function (

        options = {}

    ) {

        if (

            DataLoader.loading

        ) {

            console.warn(

                "[OffenceDataLoader] Load already in progress."

            );


            return DataLoader

                .lastResult;

        }


        DataLoader.loading =

            true;


        DataLoader.lastError =

            null;


        const startedAt =

            Date.now();


        try {

            console.group(

                "🔥 OFFENCE DATA LOAD"

            );


            /*----------------------------------
              Fetch Firestore
            ----------------------------------*/

            const response =

                await DataLoader

                    .fetchFromFirestore();


            /*----------------------------------
              Extract Canonical Shape
            ----------------------------------*/

            const data =

                DataLoader

                    .extractData(

                        response

                    );


            const counts =

                DataLoader

                    .getCounts(

                        data

                    );


            console.log(

                "Extracted Offence Data:",

                counts

            );


            /*----------------------------------
              Validate
            ----------------------------------*/

            const validation =

                DataLoader

                    .validateData(

                        data

                    );


            if (

                !validation.valid

            ) {

                throw new Error(

                    validation.error

                );

            }


            /*----------------------------------
              Build Store
            ----------------------------------*/

            const storeResult =

                await Promise.resolve(

                    DataLoader

                        .loadIntoStore(

                            data

                        )

                );


            /*----------------------------------
              Store Stats
            ----------------------------------*/

            const stats =

                DataLoader

                    .getStoreStats();


            /*----------------------------------
              Update State
            ----------------------------------*/

            DataLoader.loaded =

                true;


            DataLoader.lastLoadedAt =

                Date.now();


            DataLoader.lastResult = {

                success:

                    true,

                source:

                    "firestore",

                version:

                    DataLoader.VERSION,

                counts:

                    counts,

                stats:

                    stats,

                storeResult:

                    storeResult,

                duration:

                    Date.now() -

                    startedAt

            };


            /*----------------------------------
              Events
            ----------------------------------*/

            DataLoader

                .dispatchEvent(

                    "offence:data-loaded",

                    {

                        counts:

                            counts,

                        stats:

                            stats,

                        source:

                            "firestore"

                    }

                );


            DataLoader

                .dispatchEvent(

                    "offence:data-updated",

                    {

                        counts:

                            counts,

                        stats:

                            stats,

                        source:

                            "firestore"

                    }

                );


            console.log(

                "🔥 Offence Data Loaded",

                DataLoader.lastResult

            );


            return DataLoader

                .lastResult;

        }

        catch (

            error

        ) {

            DataLoader.loaded =

                false;


            DataLoader.lastError =

                error;


            DataLoader.lastResult = {

                success:

                    false,

                source:

                    "firestore",

                version:

                    DataLoader.VERSION,

                error:

                    error.message,

                duration:

                    Date.now() -

                    startedAt

            };


            console.error(

                "[OffenceDataLoader] Load failed:",

                error

            );


            DataLoader

                .dispatchEvent(

                    "offence:data-error",

                    {

                        error:

                            error.message,

                        source:

                            "firestore"

                    }

                );


            throw error;

        }

        finally {

            DataLoader.loading =

                false;


            console.groupEnd();

        }

    };


    /*=========================================================
      UPDATE / REFRESH DATA

      Re-fetch all five Firestore collections.

      Store.build() is authoritative and rebuilds the complete
      POR-connected store from the latest raw collections.

    =========================================================*/

    DataLoader.update = async function () {

        if (

            DataLoader.loading

        ) {

            console.warn(

                "[OffenceDataLoader] Update skipped. Load in progress."

            );


            return DataLoader

                .lastResult;

        }


        DataLoader.loading =

            true;


        DataLoader.lastError =

            null;


        const startedAt =

            Date.now();


        try {

            console.group(

                "🔥 OFFENCE DATA UPDATE"

            );


            const response =

                await DataLoader

                    .fetchFromFirestore();


            const data =

                DataLoader

                    .extractData(

                        response

                    );


            const validation =

                DataLoader

                    .validateData(

                        data

                    );


            if (

                !validation.valid

            ) {

                throw new Error(

                    validation.error

                );

            }


            const Store =

                DataLoader

                    .getStore();


            /*
             * Full Firestore refresh is authoritative.
             *
             * Rebuild the Store from all five datasets so
             * indexes and POR relationships cannot retain
             * stale records from a previous load.
             */

            const storeResult =

                await Promise.resolve(

                    Store

                        .build(

                            data

                        )

                );


            const counts =

                DataLoader

                    .getCounts(

                        data

                    );


            const stats =

                DataLoader

                    .getStoreStats();


            DataLoader.loaded =

                true;


            DataLoader.lastLoadedAt =

                Date.now();


            DataLoader.lastResult = {

                success:

                    true,

                source:

                    "firestore",

                version:

                    DataLoader.VERSION,

                counts:

                    counts,

                stats:

                    stats,

                storeResult:

                    storeResult,

                duration:

                    Date.now() -

                    startedAt

            };


            DataLoader

                .dispatchEvent(

                    "offence:data-updated",

                    {

                        counts:

                            counts,

                        stats:

                            stats,

                        source:

                            "firestore"

                    }

                );


            console.log(

                "🔥 Offence Data Updated",

                DataLoader.lastResult

            );


            return DataLoader

                .lastResult;

        }

        catch (

            error

        ) {

            DataLoader.lastError =

                error;


            DataLoader.lastResult = {

                success:

                    false,

                source:

                    "firestore",

                version:

                    DataLoader.VERSION,

                error:

                    error.message,

                duration:

                    Date.now() -

                    startedAt

            };


            console.error(

                "[OffenceDataLoader] Update failed:",

                error

            );


            DataLoader

                .dispatchEvent(

                    "offence:data-error",

                    {

                        error:

                            error.message,

                        source:

                            "firestore"

                    }

                );


            throw error;

        }

        finally {

            DataLoader.loading =

                false;


            console.groupEnd();

        }

    };


    /*=========================================================
      REFRESH ALIAS
    =========================================================*/

    DataLoader.refresh = function () {

        return DataLoader

            .update();

    };


    /*=========================================================
      REFRESH ACTIVE UI

      Kept for compatibility.

      Normally UI listens to:

          offence:data-updated

    =========================================================*/

    DataLoader.refreshActiveUI = async function () {

        const UIController =

            GG.Offence

                .UIController;


        if (

            !UIController ||

            !UIController.active ||

            typeof UIController.refresh !==

            "function"

        ) {

            return;

        }


        await UIController

            .refresh();

    };


    /*=========================================================
      GET STATUS
    =========================================================*/

    DataLoader.getStatus = function () {

        return {

            version:

                DataLoader.VERSION,

            source:

                DataLoader.SOURCE,

            initialized:

                DataLoader.initialized,

            loading:

                DataLoader.loading,

            loaded:

                DataLoader.loaded,

            lastLoadedAt:

                DataLoader.lastLoadedAt,

            lastError:

                DataLoader.lastError

                    ? DataLoader

                        .lastError

                        .message

                    : null,

            collections:

                {

                    ...DataLoader.COLLECTIONS

                },

            stats:

                DataLoader

                    .getStoreStats(),

            lastResult:

                DataLoader.lastResult

        };

    };


    /*=========================================================
      RESET
    =========================================================*/

    DataLoader.reset = function () {

        DataLoader.loaded =

            false;


        DataLoader.loading =

            false;


        DataLoader.lastLoadedAt =

            null;


        DataLoader.lastError =

            null;


        DataLoader.lastResult =

            null;


        if (

            typeof GG.Offence.Store

                ?.reset ===

            "function"

        ) {

            GG.Offence.Store

                .reset();

        }


        DataLoader

            .dispatchEvent(

                "offence:data-reset",

                {

                    source:

                        "firestore"

                }

            );


        console.log(

            "[OffenceDataLoader] Reset complete."

        );

    };


    /*=========================================================
      REGISTER
    =========================================================*/

    GG.Offence.DataLoader =

        DataLoader;


    /*=========================================================
      AUTO INIT
    =========================================================*/

    DataLoader.init();


})(window);
