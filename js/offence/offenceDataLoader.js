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
      INFO
    =========================================================*/

    DataLoader.VERSION =

        "1.0.0";


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
    =========================================================*/

    /*
     * Change this only if your backend action/function
     * has a different name.
     */

    DataLoader.BACKEND_ACTION =

        "getOffenceData";


    /*
     * Auto-load when application starts.
     *
     * Keep FALSE initially until getOffenceData exists
     * in your backend.
     */

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


        if (

            DataLoader.AUTO_LOAD

        ) {

            DataLoader.load()

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

            typeof Store.load !==

            "function"

        ) {

            throw new Error(

                "OffenceStore.load() unavailable."

            );

        }


        return Store;

    };


    /*=========================================================
      NORMALIZE ARRAY
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
      PARSE JSON IF REQUIRED
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

                "[OffenceDataLoader] Response is not JSON string."

            );


            return value;

        }

    };


    /*=========================================================
      UNWRAP BACKEND RESPONSE
    =========================================================*/

    DataLoader.unwrapResponse = function (

        response

    ) {

        let data =

            DataLoader.parseJSON(

                response

            );


        if (

            !data ||

            typeof data !==

            "object"

        ) {

            return {};

        }


        /*
         * Supported response shapes:
         *
         * {
         *     cases: [],
         *     accused: [],
         *     seizures: []
         * }
         *
         * {
         *     data: {
         *         cases: [],
         *         accused: [],
         *         seizures: []
         *     }
         * }
         *
         * {
         *     result: {
         *         cases: [],
         *         accused: [],
         *         seizures: []
         *     }
         * }
         *
         * {
         *     success: true,
         *     data: {...}
         * }
         */


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
    =========================================================*/

    DataLoader.extractData = function (

        response

    ) {

        const data =

            DataLoader

                .unwrapResponse(

                    response

                );


        /*
         * Canonical output expected by OffenceStore:
         *
         * {
         *     cases: [],
         *     accused: [],
         *     seizures: []
         * }
         *
         * A few aliases are accepted so backend naming
         * can evolve without breaking the frontend.
         */


        const cases =

            data.cases ||

            data.caseData ||

            data.caseRecords ||

            data.offenceCases ||

            [];


        const accused =

            data.accused ||

            data.accusedData ||

            data.accusedRecords ||

            data.suspects ||

            [];


        const seizures =

            data.seizures ||

            data.seizureData ||

            data.seizureRecords ||

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

            seizures:

                DataLoader.ensureArray(

                    seizures

                )

        };

    };


    /*=========================================================
      VALIDATE DATA
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


        if (

            !Array.isArray(

                data.cases

            )

        ) {

            return {

                valid:

                    false,

                error:

                    "Cases dataset is invalid."

            };

        }


        if (

            !Array.isArray(

                data.accused

            )

        ) {

            return {

                valid:

                    false,

                error:

                    "Accused dataset is invalid."

            };

        }


        if (

            !Array.isArray(

                data.seizures

            )

        ) {

            return {

                valid:

                    false,

                error:

                    "Seizures dataset is invalid."

            };

        }


        return {

            valid:

                true,

            error:

                null

        };

    };


    /*=========================================================
      CALL BACKEND
    =========================================================*/

/*=========================================================
  FIRESTORE COLLECTIONS
=========================================================*/

DataLoader.COLLECTIONS = {

    CASES:

        "offence_cases",

    ACCUSED:

        "offence_accused",

    SEIZURES:

        "offence_seizures"

};


/*=========================================================
  GET FIRESTORE
=========================================================*/

DataLoader.getFirestore = function () {

    const db =

        window.db ||

        GG.db ||

        GG.Firebase?.db ||

        null;


    if (

        !db

    ) {

        throw new Error(

            "Firestore database unavailable."

        );

    }


    return db;

};


/*=========================================================
  SNAPSHOT TO ARRAY
=========================================================*/

DataLoader.snapshotToArray = function (

    snapshot

) {

    const records = [];


    snapshot.forEach(

        function (

            doc

        ) {

            records.push({

                id:

                    doc.id,

                ...doc.data()

            });

        }

    );


    return records;

};


/*=========================================================
  FETCH FROM FIRESTORE
=========================================================*/

DataLoader.fetchFromFirestore = async function () {

    const db =

        DataLoader

            .getFirestore();


    const collections =

        DataLoader.COLLECTIONS;


    console.log(

        "🔥 Fetching Offence Data From Firestore",

        collections

    );


    /*----------------------------------
      Fetch Collections In Parallel
    ----------------------------------*/

    const [

        caseSnapshot,

        accusedSnapshot,

        seizureSnapshot

    ] =

        await Promise.all([

            db.collection(

                collections.CASES

            ).get(),


            db.collection(

                collections.ACCUSED

            ).get(),


            db.collection(

                collections.SEIZURES

            ).get()

        ]);


    /*----------------------------------
      Convert Snapshots
    ----------------------------------*/

    const cases =

        DataLoader

            .snapshotToArray(

                caseSnapshot

            );


    const accused =

        DataLoader

            .snapshotToArray(

                accusedSnapshot

            );


    const seizures =

        DataLoader

            .snapshotToArray(

                seizureSnapshot

            );


    console.log(

        "🔥 Firestore Offence Data",

        {

            cases:

                cases.length,

            accused:

                accused.length,

            seizures:

                seizures.length

        }

    );


    return {

        cases:

            cases,

        accused:

            accused,

        seizures:

            seizures

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


        console.log(

            "🔥 Loading Offence Store",

            {

                cases:

                    data.cases.length,

                accused:

                    data.accused.length,

                seizures:

                    data.seizures.length

            }

        );


        const result =

            Store.load(

                data

            );


        return result;

    };


    /*=========================================================
      REFRESH ACTIVE INTELLIGENCE
    =========================================================*/

    DataLoader.refreshActiveUI = async function () {

        const UIController =

            GG.Offence

                .UIController;


        if (

            !UIController

        ) {

            return;

        }


        if (

            !UIController.active

        ) {

            return;

        }


        if (

            typeof UIController.refresh !==

            "function"

        ) {

            return;

        }


        /*
         * UIController already listens for store update
         * events in some configurations.
         *
         * Therefore this function is kept available but
         * is NOT automatically called by load().
         *
         * This prevents duplicate heatmap rebuilds.
         */

        await UIController

            .refresh();

    };


    /*=========================================================
      LOAD
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
              Fetch
            ----------------------------------*/

            const response =

                await DataLoader

                    .fetchFromBackend();


            console.log(

                "Raw Response:",

                response

            );


            /*----------------------------------
              Extract
            ----------------------------------*/

            const data =

                DataLoader

                    .extractData(

                        response

                    );


            console.log(

                "Extracted Data:",

                {

                    cases:

                        data.cases.length,

                    accused:

                        data.accused.length,

                    seizures:

                        data.seizures.length

                }

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
              Load Store
            ----------------------------------*/

            const storeResult =

                DataLoader

                    .loadIntoStore(

                        data

                    );


            /*----------------------------------
              Stats
            ----------------------------------*/

            const stats =

                GG.Offence.Store

                    .getStats();


            /*----------------------------------
              State
            ----------------------------------*/

            DataLoader.loaded =

                true;


            DataLoader.lastLoadedAt =

                Date.now();


            DataLoader.lastResult = {

                success:

                    true,

                stats:

                    stats,

                storeResult:

                    storeResult,

                duration:

                    Date.now() -

                    startedAt

            };


            /*----------------------------------
              Notify Application
            ----------------------------------*/

            DataLoader

                .dispatchEvent(

                    "offence:data-loaded",

                    {

                        stats:

                            stats

                    }

                );


            DataLoader

                .dispatchEvent(

                    "offence:data-updated",

                    {

                        stats:

                            stats

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

                            error.message

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
      UPDATE
    =========================================================*/

    DataLoader.update = async function () {

        if (

            DataLoader.loading

        ) {

            return DataLoader

                .lastResult;

        }


        const response =

            await DataLoader

                .fetchFromBackend();


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


        let result;


        /*
         * Prefer incremental Store.update()
         * if available.
         *
         * Otherwise perform full Store.load().
         */

        if (

            typeof Store.update ===

            "function"

        ) {

            result =

                Store.update(

                    data

                );

        }

        else {

            result =

                Store.load(

                    data

                );

        }


        DataLoader.loaded =

            true;


        DataLoader.lastLoadedAt =

            Date.now();


        DataLoader.lastResult = {

            success:

                true,

            stats:

                Store.getStats(),

            storeResult:

                result

        };


        DataLoader

            .dispatchEvent(

                "offence:data-updated",

                {

                    stats:

                        Store.getStats()

                }

            );


        return DataLoader

            .lastResult;

    };


    /*=========================================================
      GET STATUS
    =========================================================*/

    DataLoader.getStatus = function () {

        return {

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

            backendAction:

                DataLoader

                    .BACKEND_ACTION,

            stats:

                GG.Offence.Store

                    ?.getStats?.() ||

                {

                    cases: 0,

                    accused: 0,

                    seizures: 0

                }

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

                "offence:data-reset"

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
