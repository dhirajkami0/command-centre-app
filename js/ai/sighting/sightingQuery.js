/*!
 * GreenGuard AI
 * sightingQuery.js
 *
 * Version:
 * 1.0.0
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Read/query/business-analysis layer for elephant sightings.
 *
 * PIPELINE
 * ---------------------------------------------------------
 *
 * Core.ask()
 *      ↓
 * Controller
 *      ↓
 * IntentManager
 *      ↓
 * AIDispatcher
 *      ↓
 * SightingRouter
 *      ↓
 * SightingQuery
 *      ↓
 * SightingFormatter
 *
 * DATA AUTHORITY
 * ---------------------------------------------------------
 *
 * Primary:
 *
 *     GG.SightingEntities
 *
 * Runtime fallback:
 *
 *     Firestore elephant_sightings
 *
 * GIS:
 *
 *     GG.GISEntities
 *
 * Staff:
 *
 *     GG.StaffEntities
 *     GG.StaffHydrator
 *
 * IMPORTANT
 * ---------------------------------------------------------
 *
 * THIS MODULE IS READ ONLY.
 *
 * It does NOT:
 *
 * - create sightings
 * - increment counters
 * - update sighting status
 * - resolve sightings
 * - move sightings
 * - modify village risk
 * - write Firestore
 *
 * Operational writes remain outside the AI query layer.
 */

(function (

    window

) {

    "use strict";


    /*=========================================================
      NAMESPACE
    =========================================================*/

    const GG =

        window.GreenGuardAI =

        window.GreenGuardAI || {};


    /*=========================================================
      PREVENT DOUBLE LOADING
    =========================================================*/

    if (

        GG.SightingQuery

    ) {

        console.warn(

            "[GreenGuardAI] SightingQuery already loaded."

        );

        return;

    }


    /*=========================================================
      DEPENDENCIES
    =========================================================*/

    const SightingConstants =

        GG.SightingConstants ||

        {};


    const SightingEntities =

        GG.SightingEntities ||

        {};


    /*=========================================================
      MODULE
    =========================================================*/

    const SightingQuery = {};


    SightingQuery.VERSION =

        "1.0.0";


    SightingQuery.loaded =

        false;


    SightingQuery.loading =

        false;


    SightingQuery.lastQuery =

        null;


    SightingQuery.lastResult =

        null;


    /*=========================================================
      CACHE CONFIGURATION
    =========================================================*/

    /*
     * Sighting responses are dynamic.
     *
     * ACTIVE / MOVED / RESOLVED state may change.
     *
     * Therefore response caching is disabled by default.
     */

    SightingQuery.CACHE_ENABLED =

        false;


    SightingQuery.MAX_CACHE_SIZE =

        100;


    SightingQuery.cache =

        new Map();


    /*=========================================================
      STATISTICS
    =========================================================*/

    SightingQuery.statistics = {

        queries:

            0,

        cacheHits:

            0,

        cacheMisses:

            0,

        successes:

            0,

        failures:

            0,

        totalExecutionTime:

            0,

        averageExecutionTime:

            0

    };


    /*=========================================================
      INITIALIZE
    =========================================================*/

    SightingQuery.initialize =
        function () {

            if (

                SightingQuery.loaded

            ) {

                return true;

            }


            if (

                SightingQuery.loading

            ) {

                return false;

            }


            SightingQuery.loading =

                true;


            /*---------------------------------------------
              Reset Cache
            ---------------------------------------------*/

            SightingQuery.cache.clear();


            /*---------------------------------------------
              Reset Statistics
            ---------------------------------------------*/

            SightingQuery.statistics.queries =

                0;


            SightingQuery.statistics.cacheHits =

                0;


            SightingQuery.statistics.cacheMisses =

                0;


            SightingQuery.statistics.successes =

                0;


            SightingQuery.statistics.failures =

                0;


            SightingQuery.statistics.totalExecutionTime =

                0;


            SightingQuery.statistics.averageExecutionTime =

                0;


            SightingQuery.lastQuery =

                null;


            SightingQuery.lastResult =

                null;


            /*---------------------------------------------
              Ready
            ---------------------------------------------*/

            SightingQuery.loaded =

                true;


            SightingQuery.loading =

                false;


            if (

                GG.Config?.DEBUG?.ENABLED

            ) {

                console.log(

                    "✅ SightingQuery Ready"

                );

            }


            return true;

        };


    /*=========================================================
      CREATE RESPONSE
    =========================================================*/

    SightingQuery.createResponse =
        function (

            request = {}

        ) {

            return {

                success:

                    false,

                source:

                    "LOCAL",

                domain:

                    SightingConstants.DOMAIN ||

                    "sighting",

                intent:

                    request.intent ||

                    null,

                confidence:

                    request.confidence ||

                    0,

                query:

                    request.originalQuery ||

                    request.query ||

                    "",

                entities:

                    request.entities ||

                    {},

                parameters:

                    request.parameters ||

                    {},

                context:

                    request.context ||

                    {},

                data:

                    null,

                count:

                    0,

                message:

                    "",

                warnings:

                    [],

                errors:

                    [],

                metadata: {

                    version:

                        SightingQuery.VERSION,

                    module:

                        "SightingQuery",

                    startedAt:

                        Date.now(),

                    executionTime:

                        0,

                    cache:

                        false

                }

            };

        };


    /*=========================================================
      CACHE HELPERS
    =========================================================*/

    SightingQuery.getCache =
        function (

            key

        ) {

            if (

                !SightingQuery.CACHE_ENABLED ||

                !key

            ) {

                return null;

            }


            const cached =

                SightingQuery.cache.get(

                    key

                );


            if (

                cached

            ) {

                SightingQuery.statistics.cacheHits++;


                return cached;

            }


            SightingQuery.statistics.cacheMisses++;


            return null;

        };


    SightingQuery.setCache =
        function (

            key,

            value

        ) {

            if (

                !SightingQuery.CACHE_ENABLED ||

                !key

            ) {

                return;

            }


            if (

                SightingQuery.cache.size >=

                SightingQuery.MAX_CACHE_SIZE

            ) {

                const firstKey =

                    SightingQuery.cache
                        .keys()
                        .next()
                        .value;


                SightingQuery.cache.delete(

                    firstKey

                );

            }


            SightingQuery.cache.set(

                key,

                value

            );

        };


    SightingQuery.clearCache =
        function () {

            SightingQuery.cache.clear();

        };


    SightingQuery.hasCache =
        function (

            key

        ) {

            if (

                !SightingQuery.CACHE_ENABLED

            ) {

                return false;

            }


            return SightingQuery.cache.has(

                key

            );

        };


    /*=========================================================
      GENERIC HELPERS
    =========================================================*/

    SightingQuery.normalize =
        function (

            value

        ) {

            if (

                value === undefined ||

                value === null

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

                )

                .replace(

                    /[_\-\/\\]/g,

                    ""

                );

        };


    SightingQuery.toNumber =
        function (

            value,

            fallback = 0

        ) {

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


    SightingQuery.toBoolean =
        function (

            value

        ) {

            return (

                value === true ||

                value === 1 ||

                value === "1" ||

                String(

                    value

                ).toUpperCase() ===

                    "TRUE"

            );

        };


    /*=========================================================
      TIMESTAMP NORMALIZATION
    =========================================================*/

    SightingQuery.getTimestamp =
        function (

            value

        ) {

            if (

                value === undefined ||

                value === null ||

                value === ""

            ) {

                return 0;

            }


            /*---------------------------------------------
              Firestore Timestamp
            ---------------------------------------------*/

            if (

                typeof value.toMillis ===

                "function"

            ) {

                try {

                    return value.toMillis();

                }

                catch (

                    error

                ) {}

            }


            /*---------------------------------------------
              Firestore seconds
            ---------------------------------------------*/

            if (

                typeof value ===

                    "object" &&

                Number.isFinite(

                    Number(

                        value.seconds

                    )

                )

            ) {

                return (

                    Number(

                        value.seconds

                    ) *

                    1000

                );

            }


            /*---------------------------------------------
              Number
            ---------------------------------------------*/

            if (

                Number.isFinite(

                    Number(

                        value

                    )

                )

            ) {

                const number =

                    Number(

                        value

                    );


                /*
                 * Seconds → milliseconds.
                 */

                if (

                    number > 0 &&

                    number < 100000000000

                ) {

                    return number * 1000;

                }


                return number;

            }


            /*---------------------------------------------
              Date String
            ---------------------------------------------*/

            const parsed =

                Date.parse(

                    value

                );


            return Number.isFinite(

                parsed

            )

                ? parsed

                : 0;

        };


    /*=========================================================
      SIGHTING TIMESTAMP
    =========================================================*/

    SightingQuery.getSightingTimestamp =
        function (

            sighting

        ) {

            if (

                !sighting

            ) {

                return 0;

            }


            return SightingQuery.getTimestamp(

                sighting.sighting_datetime ??

                sighting.sightingDatetime ??

                sighting.created_at ??

                sighting.createdAt ??

                sighting.timestamp ??

                sighting.time ??

                sighting.date ??

                0

            );

        };


    /*=========================================================
      CANONICAL FIELD ACCESSORS
    =========================================================*/

    SightingQuery.getSightingID =
        function (

            sighting

        ) {

            return String(

                sighting?.sighting_id ??

                sighting?.sightingId ??

                sighting?.id ??

                ""

            ).trim();

        };


    SightingQuery.getFirestoreID =
        function (

            sighting

        ) {

            return String(

                sighting?.firestore_id ??

                sighting?.firestoreId ??

                sighting?.documentId ??

                sighting?.docId ??

                ""

            ).trim();

        };


    SightingQuery.getStatus =
        function (

            sighting

        ) {

            return String(

                sighting?.status ??

                "ACTIVE"

            )

                .trim()

                .toUpperCase();

        };


    SightingQuery.isActive =
        function (

            sighting

        ) {

            if (

                sighting?.active === false

            ) {

                return false;

            }


            const status =

                SightingQuery.getStatus(

                    sighting

                );


            return (

                status !== "RESOLVED" &&

                status !== "CLOSED" &&

                status !== "EXPIRED"

            );

        };


    SightingQuery.getDivision =
        function (

            sighting

        ) {

            return String(

                sighting?.gis_division ??

                sighting?.division ??

                sighting?.division_code ??

                ""

            ).trim();

        };


    SightingQuery.getRange =
        function (

            sighting

        ) {

            return String(

                sighting?.gis_range ??

                sighting?.range ??

                sighting?.range_code ??

                ""

            ).trim();

        };


    SightingQuery.getBeat =
        function (

            sighting

        ) {

            return String(

                sighting?.gis_beat ??

                sighting?.beat ??

                ""

            ).trim();

        };


    SightingQuery.getCompartment =
        function (

            sighting

        ) {

            return String(

                sighting?.gis_compartment ??

                sighting?.compartment ??

                sighting?.compt ??

                ""

            ).trim();

        };


    SightingQuery.getVillage =
        function (

            sighting

        ) {

            return String(

                sighting?.village ??

                sighting?.official_village ??

                sighting?.nearest_village ??

                sighting?.nearest_location ??

                ""

            ).trim();

        };


    SightingQuery.getNearestVillage =
        function (

            sighting

        ) {

            return String(

                sighting?.nearest_village ??

                sighting?.nearest_location ??

                ""

            ).trim();

        };


    SightingQuery.getVillageCode =
        function (

            sighting

        ) {

            return String(

                sighting?.village_lgd ??

                sighting?.village_code ??

                sighting?.villageCode ??

                ""

            ).trim();

        };


    SightingQuery.getLatitude =
        function (

            sighting

        ) {

            return SightingQuery.toNumber(

                sighting?.lat ??

                sighting?.latitude ??

                sighting?.gps?.lat,

                NaN

            );

        };


    SightingQuery.getLongitude =
        function (

            sighting

        ) {

            return SightingQuery.toNumber(

                sighting?.lon ??

                sighting?.lng ??

                sighting?.longitude ??

                sighting?.gps?.lon,

                NaN

            );

        };


    SightingQuery.getHerdSize =
        function (

            sighting

        ) {

            return SightingQuery.toNumber(

                sighting?.herd ??

                sighting?.herd_size ??

                sighting?.elephant_count ??

                sighting?.count ??

                sighting?.number_of_elephants ??

                0,

                0

            );

        };


    SightingQuery.getRisk =
        function (

            sighting

        ) {

            return String(

                sighting?.nearest_village_risk ??

                sighting?.nearest_location_risk ??

                sighting?.risk_level ??

                sighting?.riskLevel ??

                ""

            ).trim();

        };


    SightingQuery.getConflictHistory =
        function (

            sighting

        ) {

            return SightingQuery.toNumber(

                sighting?.nearest_village_conflict_history ??

                sighting?.nearest_location_conflict_history ??

                sighting?.conflict_history ??

                sighting?.conflictHistory ??

                0,

                0

            );

        };


    SightingQuery.getVillageDistanceMeters =
        function (

            sighting

        ) {

            return SightingQuery.toNumber(

                sighting?.nearest_village_distance_m ??

                sighting?.nearest_location_distance_m ??

                sighting?.nearest_village_distance ??

                sighting?.distanceMeters ??

                0,

                0

            );

        };


    SightingQuery.getDirection =
        function (

            sighting

        ) {

            return String(

                sighting?.movement_direction ??

                sighting?.direction ??

                sighting?.move_direction ??

                ""

            ).trim();

        };


    /*=========================================================
      GET ENTITY STORE
    =========================================================*/

    SightingQuery.getEntityArray =
        function () {

            const entities =

                GG.SightingEntities;


            if (

                !entities

            ) {

                return [];

            }


            /*---------------------------------------------
              Preferred API
            ---------------------------------------------*/

            const getters = [

                "getAll",

                "getSightings",

                "all",

                "list"

            ];


            for (

                const name of getters

            ) {

                if (

                    typeof entities[name] ===

                    "function"

                ) {

                    try {

                        const result =

                            entities[name]();


                        if (

                            Array.isArray(

                                result

                            )

                        ) {

                            return result.slice();

                        }

                    }

                    catch (

                        error

                    ) {}

                }

            }


            /*---------------------------------------------
              Public Arrays
            ---------------------------------------------*/

            const arrays = [

                entities.sightings,

                entities.entities,

                entities.items,

                entities.data,

                entities.cache

            ];


            for (

                const array of arrays

            ) {

                if (

                    Array.isArray(

                        array

                    )

                ) {

                    return array.slice();

                }

            }


            /*---------------------------------------------
              Map
            ---------------------------------------------*/

            if (

                entities.cache instanceof Map

            ) {

                return Array.from(

                    entities.cache.values()

                );

            }


            return [];

        };


    /*=========================================================
      FIRESTORE READ FALLBACK
    =========================================================*/

    SightingQuery.readFirestore =
        async function () {

            /*
             * IMPORTANT:
             *
             * READ ONLY.
             */

            try {

                if (

                    window.fb &&

                    window.db &&

                    typeof window.fb.collection ===

                        "function" &&

                    typeof window.fb.getDocs ===

                        "function"

                ) {

                    const ref =

                        window.fb.collection(

                            window.db,

                            "elephant_sightings"

                        );


                    const snapshot =

                        await window.fb.getDocs(

                            ref

                        );


                    const rows = [];


                    snapshot.forEach(

                        function (

                            document

                        ) {

                            rows.push({

                                firestore_id:

                                    document.id,

                                ...document.data()

                            });

                        }

                    );


                    return rows;

                }

            }

            catch (

                error

            ) {

                console.warn(

                    "[SightingQuery] Firestore read fallback failed:",

                    error

                );

            }


            return [];

        };


    /*=========================================================
      GET ALL SIGHTINGS
    =========================================================*/

    SightingQuery.getAllSightings =
        async function () {

            /*---------------------------------------------
              Entity Layer First
            ---------------------------------------------*/

            let sightings =

                SightingQuery.getEntityArray();


            if (

                sightings.length > 0

            ) {

                return sightings;

            }


            /*---------------------------------------------
              Entity Refresh / Load
            ---------------------------------------------*/

            const entities =

                GG.SightingEntities;


            if (

                entities

            ) {

                const loaders = [

                    "load",

                    "refresh",

                    "initialize"

                ];


                for (

                    const loader of loaders

                ) {

                    if (

                        typeof entities[loader] ===

                        "function"

                    ) {

                        try {

                            await entities[loader]();


                            sightings =

                                SightingQuery
                                    .getEntityArray();


                            if (

                                sightings.length > 0

                            ) {

                                return sightings;

                            }

                        }

                        catch (

                            error

                        ) {}

                    }

                }

            }


            /*---------------------------------------------
              Firestore Fallback
            ---------------------------------------------*/

            sightings =

                await SightingQuery
                    .readFirestore();


            return Array.isArray(

                sightings

            )

                ? sightings

                : [];

        };


    /*=========================================================
      ENSURE SIGHTINGS
    =========================================================*/

    SightingQuery.ensureSightings =
        async function () {

            const sightings =

                await SightingQuery
                    .getAllSightings();


            if (

                sightings.length === 0

            ) {

                throw new Error(

                    "No elephant sightings available."

                );

            }


            return sightings;

        };


    /*=========================================================
      GET CURRENT USER
    =========================================================*/

    SightingQuery.getCurrentUser =
        function () {

            if (

                !window.userProfile

            ) {

                return null;

            }


            const cleanName =

                window.userProfile.cleanName ||

                window.userProfile.name ||

                "";


            if (

                cleanName &&

                GG.StaffHydrator

            ) {

                try {

                    if (

                        typeof GG.StaffHydrator.hydrate ===

                        "function"

                    ) {

                        const profile =

                            GG.StaffHydrator.hydrate(

                                cleanName

                            );


                        if (

                            profile

                        ) {

                            return profile;

                        }

                    }

                }

                catch (

                    error

                ) {}

            }


            return window.userProfile;

        };


    /*=========================================================
      CURRENT USER JURISDICTION
    =========================================================*/

    SightingQuery.getCurrentJurisdiction =
        function () {

            const profile =

                SightingQuery
                    .getCurrentUser();


            if (

                !profile

            ) {

                return null;

            }


            return {

                cleanName:

                    profile.identity?.cleanName ||

                    profile.cleanName ||

                    profile.name ||

                    "",

                role:

                    profile.identity?.role ||

                    profile.role ||

                    "",

                designation:

                    profile.identity?.designation ||

                    profile.designation ||

                    "",

                circle:

                    profile.posting?.circle ||

                    profile.circle ||

                    "",

                division:

                    profile.posting?.division ||

                    profile.division ||

                    "",

                range:

                    profile.posting?.range ||

                    profile.range ||

                    "",

                beat:

                    profile.posting?.beat ||

                    profile.beat ||

                    "",

                compartment:

                    profile.posting?.compartment ||

                    profile.compartment ||

                    ""

            };

        };


    /*=========================================================
      PARAMETER HELPERS
    =========================================================*/

    SightingQuery.getParameters =
        function (

            request

        ) {

            return (

                request?.parameters ||

                {}

            );

        };


    SightingQuery.getEntities =
        function (

            request

        ) {

            return (

                request?.entities ||

                {}

            );

        };


    SightingQuery.getIntent =
        function (

            request

        ) {

            return (

                request?.intent ||

                null

            );

        };


    /*=========================================================
      GET FILTER VALUE
    =========================================================*/

    SightingQuery.getFilterValue =
        function (

            request,

            names

        ) {

            const parameters =

                request?.parameters ||

                {};


            const entities =

                request?.entities ||

                {};


            for (

                const name of names

            ) {

                const parameter =

                    parameters[name];


                if (

                    parameter !== undefined &&

                    parameter !== null &&

                    parameter !== ""

                ) {

                    return Array.isArray(

                        parameter

                    )

                        ? parameter[0]

                        : parameter;

                }


                const entity =

                    entities[name];


                if (

                    entity !== undefined &&

                    entity !== null &&

                    entity !== ""

                ) {

                    if (

                        Array.isArray(

                            entity

                        )

                    ) {

                        const first =

                            entity[0];


                        if (

                            first &&

                            typeof first ===

                                "object"

                        ) {

                            return (

                                first.value ??

                                first.name ??

                                first.label ??

                                first.code ??

                                ""

                            );

                        }


                        return first;

                    }


                    if (

                        typeof entity ===

                        "object"

                    ) {

                        return (

                            entity.value ??

                            entity.name ??

                            entity.label ??

                            entity.code ??

                            ""

                        );

                    }


                    return entity;

                }

            }


            return "";

        };


    /*=========================================================
      DATE RANGE
    =========================================================*/

    SightingQuery.resolveDateRange =
        function (

            request

        ) {

            const parameters =

                request?.parameters ||

                {};


            const entities =

                request?.entities ||

                {};


            const now =

                Date.now();


            let start =

                SightingQuery.getTimestamp(

                    parameters.startDate ??

                    parameters.from ??

                    parameters.start ??

                    entities.startDate ??

                    entities.from ??

                    0

                );


            let end =

                SightingQuery.getTimestamp(

                    parameters.endDate ??

                    parameters.to ??

                    parameters.end ??

                    entities.endDate ??

                    entities.to ??

                    0

                );


            const period =

                String(

                    parameters.period ??

                    entities.period ??

                    ""

                )

                    .trim()

                    .toUpperCase();


            if (

                !start &&

                period

            ) {

                const day =

                    24 *

                    60 *

                    60 *

                    1000;


                if (

                    period === "TODAY"

                ) {

                    const date =

                        new Date();


                    date.setHours(

                        0,

                        0,

                        0,

                        0

                    );


                    start =

                        date.getTime();

                }


                else if (

                    period === "YESTERDAY"

                ) {

                    const date =

                        new Date();


                    date.setHours(

                        0,

                        0,

                        0,

                        0

                    );


                    end =

                        date.getTime();


                    start =

                        end -

                        day;

                }


                else if (

                    period === "LAST_24_HOURS" ||

                    period === "24_HOURS"

                ) {

                    start =

                        now -

                        day;

                }


                else if (

                    period === "LAST_48_HOURS" ||

                    period === "48_HOURS"

                ) {

                    start =

                        now -

                        (

                            2 *

                            day

                        );

                }


                else if (

                    period === "LAST_7_DAYS" ||

                    period === "WEEK"

                ) {

                    start =

                        now -

                        (

                            7 *

                            day

                        );

                }


                else if (

                    period === "LAST_30_DAYS" ||

                    period === "MONTH"

                ) {

                    start =

                        now -

                        (

                            30 *

                            day

                        );

                }

            }


            return {

                start:

                    start ||

                    0,

                end:

                    end ||

                    now

            };

        };


    /*=========================================================
      MATCH TEXT
    =========================================================*/

    SightingQuery.matches =
        function (

            actual,

            expected

        ) {

            if (

                expected === undefined ||

                expected === null ||

                expected === ""

            ) {

                return true;

            }


            return (

                SightingQuery.normalize(

                    actual

                ) ===

                SightingQuery.normalize(

                    expected

                )

            );

        };


    /*=========================================================
      FILTER SIGHTINGS
    =========================================================*/

    SightingQuery.filterSightings =
        async function (

            request = {}

        ) {

            let sightings =

                await SightingQuery
                    .getAllSightings();


            const division =

                SightingQuery.getFilterValue(

                    request,

                    [

                        "division",

                        "gis_division"

                    ]

                );


            const range =

                SightingQuery.getFilterValue(

                    request,

                    [

                        "range",

                        "gis_range"

                    ]

                );


            const beat =

                SightingQuery.getFilterValue(

                    request,

                    [

                        "beat",

                        "gis_beat"

                    ]

                );


            const compartment =

                SightingQuery.getFilterValue(

                    request,

                    [

                        "compartment",

                        "compt",

                        "gis_compartment"

                    ]

                );


            const village =

                SightingQuery.getFilterValue(

                    request,

                    [

                        "village",

                        "nearestVillage",

                        "nearest_village",

                        "nearestLocation"

                    ]

                );


            const status =

                SightingQuery.getFilterValue(

                    request,

                    [

                        "status",

                        "sightingStatus"

                    ]

                );


            const sightingID =

                SightingQuery.getFilterValue(

                    request,

                    [

                        "sightingId",

                        "sighting_id",

                        "id"

                    ]

                );


            const risk =

                SightingQuery.getFilterValue(

                    request,

                    [

                        "risk",

                        "riskLevel",

                        "risk_level"

                    ]

                );


            const dateRange =

                SightingQuery.resolveDateRange(

                    request

                );


            /*---------------------------------------------
              GIS
            ---------------------------------------------*/

            if (

                division

            ) {

                sightings =

                    sightings.filter(

                        function (

                            sighting

                        ) {

                            return SightingQuery.matches(

                                SightingQuery.getDivision(

                                    sighting

                                ),

                                division

                            );

                        }

                    );

            }


            if (

                range

            ) {

                sightings =

                    sightings.filter(

                        function (

                            sighting

                        ) {

                            return SightingQuery.matches(

                                SightingQuery.getRange(

                                    sighting

                                ),

                                range

                            );

                        }

                    );

            }


            if (

                beat

            ) {

                sightings =

                    sightings.filter(

                        function (

                            sighting

                        ) {

                            return SightingQuery.matches(

                                SightingQuery.getBeat(

                                    sighting

                                ),

                                beat

                            );

                        }

                    );

            }


            if (

                compartment

            ) {

                sightings =

                    sightings.filter(

                        function (

                            sighting

                        ) {

                            return SightingQuery.matches(

                                SightingQuery.getCompartment(

                                    sighting

                                ),

                                compartment

                            );

                        }

                    );

            }


            /*---------------------------------------------
              Village
            ---------------------------------------------*/

            if (

                village

            ) {

                sightings =

                    sightings.filter(

                        function (

                            sighting

                        ) {

                            return (

                                SightingQuery.matches(

                                    SightingQuery.getVillage(

                                        sighting

                                    ),

                                    village

                                ) ||

                                SightingQuery.matches(

                                    SightingQuery.getNearestVillage(

                                        sighting

                                    ),

                                    village

                                )

                            );

                        }

                    );

            }


            /*---------------------------------------------
              Status
            ---------------------------------------------*/

            if (

                status

            ) {

                sightings =

                    sightings.filter(

                        function (

                            sighting

                        ) {

                            return SightingQuery.matches(

                                SightingQuery.getStatus(

                                    sighting

                                ),

                                status

                            );

                        }

                    );

            }


            /*---------------------------------------------
              Sighting ID
            ---------------------------------------------*/

            if (

                sightingID

            ) {

                sightings =

                    sightings.filter(

                        function (

                            sighting

                        ) {

                            return (

                                SightingQuery.matches(

                                    SightingQuery.getSightingID(

                                        sighting

                                    ),

                                    sightingID

                                ) ||

                                SightingQuery.matches(

                                    SightingQuery.getFirestoreID(

                                        sighting

                                    ),

                                    sightingID

                                )

                            );

                        }

                    );

            }


            /*---------------------------------------------
              Risk
            ---------------------------------------------*/

            if (

                risk

            ) {

                sightings =

                    sightings.filter(

                        function (

                            sighting

                        ) {

                            return SightingQuery.matches(

                                SightingQuery.getRisk(

                                    sighting

                                ),

                                risk

                            );

                        }

                    );

            }


            /*---------------------------------------------
              Active Parameter
            ---------------------------------------------*/

            if (

                request?.parameters?.active === true

            ) {

                sightings =

                    sightings.filter(

                        SightingQuery.isActive

                    );

            }


            if (

                request?.parameters?.active === false

            ) {

                sightings =

                    sightings.filter(

                        function (

                            sighting

                        ) {

                            return !SightingQuery.isActive(

                                sighting

                            );

                        }

                    );

            }


            /*---------------------------------------------
              Date
            ---------------------------------------------*/

            if (

                dateRange.start > 0

            ) {

                sightings =

                    sightings.filter(

                        function (

                            sighting

                        ) {

                            const timestamp =

                                SightingQuery
                                    .getSightingTimestamp(

                                        sighting

                                    );


                            return (

                                timestamp >=

                                    dateRange.start &&

                                timestamp <=

                                    dateRange.end

                            );

                        }

                    );

            }


            /*---------------------------------------------
              Newest First
            ---------------------------------------------*/

            sightings.sort(

                function (

                    a,

                    b

                ) {

                    return (

                        SightingQuery
                            .getSightingTimestamp(

                                b

                            ) -

                        SightingQuery
                            .getSightingTimestamp(

                                a

                            )

                    );

                }

            );


            return sightings;

        };


    /*=========================================================
      FIND SIGHTING BY ID
    =========================================================*/

    SightingQuery.findByID =
        async function (

            value

        ) {

            if (

                !value

            ) {

                return null;

            }


            const sightings =

                await SightingQuery
                    .getAllSightings();


            const key =

                SightingQuery.normalize(

                    value

                );


            return (

                sightings.find(

                    function (

                        sighting

                    ) {

                        return (

                            SightingQuery.normalize(

                                SightingQuery
                                    .getSightingID(

                                        sighting

                                    )

                            ) === key ||

                            SightingQuery.normalize(

                                SightingQuery
                                    .getFirestoreID(

                                        sighting

                                    )

                            ) === key

                        );

                    }

                ) ||

                null

            );

        };


    /*=========================================================
      BUILD SUMMARY
    =========================================================*/

    SightingQuery.buildSummary =
        function (

            sightings

        ) {

            sightings =

                Array.isArray(

                    sightings

                )

                    ? sightings

                    : [];


            let active =

                0;


            let moved =

                0;


            let resolved =

                0;


            let totalElephants =

                0;


            let highRisk =

                0;


            let conflictHistory =

                0;


            sightings.forEach(

                function (

                    sighting

                ) {

                    const status =

                        SightingQuery.getStatus(

                            sighting

                        );


                    if (

                        status === "RESOLVED"

                    ) {

                        resolved++;

                    }

                    else if (

                        status === "MOVED" ||

                        status.startsWith(

                            "DRIVEN"

                        )

                    ) {

                        moved++;

                    }

                    else if (

                        SightingQuery.isActive(

                            sighting

                        )

                    ) {

                        active++;

                    }


                    totalElephants +=

                        SightingQuery.getHerdSize(

                            sighting

                        );


                    if (

                        SightingQuery
                            .getRisk(

                                sighting

                            )
                            .toUpperCase() ===

                        "HIGH"

                    ) {

                        highRisk++;

                    }


                    conflictHistory +=

                        SightingQuery
                            .getConflictHistory(

                                sighting

                            );

                }

            );


            return {

                count:

                    sightings.length,

                active:

                    active,

                moved:

                    moved,

                resolved:

                    resolved,

                totalElephants:

                    totalElephants,

                highRiskSightings:

                    highRisk,

                cumulativeConflictHistory:

                    conflictHistory

            };

        };


    /*=========================================================
      GROUP BY
    =========================================================*/

    SightingQuery.groupBy =
        function (

            sightings,

            resolver

        ) {

            const groups =

                new Map();


            (

                sightings ||

                []

            ).forEach(

                function (

                    sighting

                ) {

                    let key =

                        resolver(

                            sighting

                        );


                    key =

                        String(

                            key ||

                            "UNKNOWN"

                        ).trim();


                    if (

                        !groups.has(

                            key

                        )

                    ) {

                        groups.set(

                            key,

                            []

                        );

                    }


                    groups
                        .get(

                            key

                        )
                        .push(

                            sighting

                        );

                }

            );


            return Array.from(

                groups.entries()

            )

                .map(

                    function (

                        [

                            name,

                            records

                        ]

                    ) {

                        return {

                            name:

                                name,

                            count:

                                records.length,

                            summary:

                                SightingQuery
                                    .buildSummary(

                                        records

                                    ),

                            sightings:

                                records

                        };

                    }

                )

                .sort(

                    function (

                        a,

                        b

                    ) {

                        return (

                            b.count -

                            a.count

                        );

                    }

                );

        };


    /*=========================================================
      RISK SCORE
    =========================================================*/

    SightingQuery.calculateRiskScore =
        function (

            sighting

        ) {

            let score =

                0;


            const risk =

                SightingQuery
                    .getRisk(

                        sighting

                    )
                    .toUpperCase();


            if (

                risk === "HIGH"

            ) {

                score +=

                    40;

            }

            else if (

                risk === "MEDIUM" ||

                risk === "MODERATE"

            ) {

                score +=

                    25;

            }

            else if (

                risk === "LOW"

            ) {

                score +=

                    10;

            }


            const history =

                SightingQuery
                    .getConflictHistory(

                        sighting

                    );


            score +=

                Math.min(

                    25,

                    history *

                    2.5

                );


            const distance =

                SightingQuery
                    .getVillageDistanceMeters(

                        sighting

                    );


            if (

                distance > 0

            ) {

                if (

                    distance <= 100

                ) {

                    score +=

                        25;

                }

                else if (

                    distance <= 500

                ) {

                    score +=

                        20;

                }

                else if (

                    distance <= 1000

                ) {

                    score +=

                        10;

                }

            }


            const herd =

                SightingQuery
                    .getHerdSize(

                        sighting

                    );


            if (

                herd >= 10

            ) {

                score +=

                    10;

            }

            else if (

                herd >= 5

            ) {

                score +=

                    5;

            }


            return Math.min(

                100,

                Math.round(

                    score

                )

            );

        };


    /*=========================================================
      BUILD HEC RISK RECORD
    =========================================================*/

    SightingQuery.buildHECRiskRecord =
        function (

            sighting

        ) {

            return {

                sighting:

                    sighting,

                sightingId:

                    SightingQuery
                        .getSightingID(

                            sighting

                        ),

                riskScore:

                    SightingQuery
                        .calculateRiskScore(

                            sighting

                        ),

                riskLevel:

                    SightingQuery
                        .getRisk(

                            sighting

                        ),

                conflictHistory:

                    SightingQuery
                        .getConflictHistory(

                            sighting

                        ),

                village:

                    SightingQuery
                        .getNearestVillage(

                            sighting

                        ) ||

                    SightingQuery
                        .getVillage(

                            sighting

                        ),

                distanceMeters:

                    SightingQuery
                        .getVillageDistanceMeters(

                            sighting

                        ),

                herdSize:

                    SightingQuery
                        .getHerdSize(

                            sighting

                        ),

                division:

                    SightingQuery
                        .getDivision(

                            sighting

                        ),

                range:

                    SightingQuery
                        .getRange(

                            sighting

                        ),

                beat:

                    SightingQuery
                        .getBeat(

                            sighting

                        ),

                compartment:

                    SightingQuery
                        .getCompartment(

                            sighting

                        ),

                status:

                    SightingQuery
                        .getStatus(

                            sighting

                        )

            };

        };


    /*=========================================================
      BUILD MITIGATION RECOMMENDATION
    =========================================================*/

    SightingQuery.buildMitigation =
        function (

            record

        ) {

            const actions = [];


            if (

                record.distanceMeters > 0 &&

                record.distanceMeters <= 500

            ) {

                actions.push(

                    "Prioritize village-side monitoring and rapid field response."

                );

            }


            if (

                record.riskLevel
                    .toUpperCase() ===

                "HIGH"

            ) {

                actions.push(

                    "Treat the nearest settlement as a high-priority HEC location."

                );

            }


            if (

                record.conflictHistory >= 5

            ) {

                actions.push(

                    "Use previous conflict history when planning deployment and mitigation."

                );

            }


            if (

                record.herdSize >= 5

            ) {

                actions.push(

                    "Consider additional staff support because a larger herd is involved."

                );

            }


            if (

                record.status === "ACTIVE"

            ) {

                actions.push(

                    "Maintain active observation until movement or resolution is confirmed."

                );

            }


            if (

                record.status === "MOVED"

            ) {

                actions.push(

                    "Monitor the reported movement direction and likely adjoining conflict locations."

                );

            }


            if (

                actions.length === 0

            ) {

                actions.push(

                    "Continue field monitoring and update the sighting when conditions change."

                );

            }


            return {

                ...record,

                actions:

                    actions

            };

        };


    /*=========================================================
      EXECUTE
    =========================================================*/

    SightingQuery.execute =
        async function (

            request,

            handler

        ) {

            const started =

                Date.now();


            SightingQuery.statistics.queries++;


            if (

                !request

            ) {

                throw new Error(

                    "Request is required."

                );

            }


            if (

                typeof handler !==

                "function"

            ) {

                throw new Error(

                    "Query handler missing."

                );

            }


            const response =

                SightingQuery.createResponse(

                    request

                );


            /*---------------------------------------------
              Preserve Canonical Request
            ---------------------------------------------*/

            response.request =

                request;


            response.intent =

                request.intent;


            response.domain =

                request.domain ||

                SightingConstants.DOMAIN ||

                "sighting";


            response.entities =

                request.entities ||

                {};


            response.parameters =

                request.parameters ||

                {};


            response.context =

                request.context ||

                {};


            /*---------------------------------------------
              Dynamic data — no response cache
            ---------------------------------------------*/

            try {

                const result =

                    await handler(

                        request

                    );


                response.data =

                    result;


                response.success =

                    true;


                if (

                    Array.isArray(

                        result

                    )

                ) {

                    response.sightings =

                        result;


                    response.count =

                        result.length;

                }

                else if (

                    result &&

                    typeof result ===

                        "object"

                ) {

                    response.sighting =

                        result;


                    /*
                     * Respect explicit result count where
                     * supplied by analytics queries.
                     */

                    response.count =

                        Number.isFinite(

                            Number(

                                result.count

                            )

                        )

                            ? Number(

                                result.count

                            )

                            : 1;

                }

                else {

                    response.count =

                        result === null ||

                        result === undefined

                            ? 0

                            : 1;

                }


                SightingQuery.statistics.successes++;

            }

            catch (

                error

            ) {

                response.success =

                    false;


                response.errors.push(

                    error.message

                );


                SightingQuery.statistics.failures++;


                if (

                    GG.Config?.DEBUG?.ENABLED

                ) {

                    console.error(

                        "[SightingQuery]",

                        error

                    );

                }

            }


            response.metadata.executionTime =

                Date.now() -

                started;


            SightingQuery.statistics.totalExecutionTime +=

                response.metadata.executionTime;


            SightingQuery.statistics.averageExecutionTime =

                SightingQuery.statistics.totalExecutionTime /

                Math.max(

                    1,

                    SightingQuery.statistics.queries

                );


            SightingQuery.lastQuery =

                request;


            SightingQuery.lastResult =

                response;


            return response;

        };


    /*=========================================================
      BASIC SIGHTING QUERIES
    =========================================================*/

    GG.querySightingSearch =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    return SightingQuery
                        .filterSightings(

                            request

                        );

                }

            );

        };


    GG.querySightingList =

        GG.querySightingSearch;


    GG.querySightings =

        GG.querySightingSearch;


    /*=========================================================
      SIGHTING DETAILS
    =========================================================*/

    GG.querySightingDetails =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const id =

                        SightingQuery
                            .getFilterValue(

                                request,

                                [

                                    "sightingId",

                                    "sighting_id",

                                    "id"

                                ]

                            );


                    if (

                        id

                    ) {

                        const sighting =

                            await SightingQuery
                                .findByID(

                                    id

                                );


                        if (

                            !sighting

                        ) {

                            throw new Error(

                                "Sighting not found."

                            );

                        }


                        return sighting;

                    }


                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                request

                            );


                    if (

                        sightings.length === 0

                    ) {

                        throw new Error(

                            "Sighting not found."

                        );

                    }


                    return sightings[0];

                }

            );

        };


    /*=========================================================
      ACTIVE SIGHTINGS
    =========================================================*/

    GG.queryActiveSightings =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                request

                            );


                    return sightings.filter(

                        SightingQuery.isActive

                    );

                }

            );

        };


    /*=========================================================
      MOVED SIGHTINGS
    =========================================================*/

    GG.queryMovedSightings =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                request

                            );


                    return sightings.filter(

                        function (

                            sighting

                        ) {

                            const status =

                                SightingQuery
                                    .getStatus(

                                        sighting

                                    );


                            return (

                                status === "MOVED" ||

                                status.startsWith(

                                    "DRIVEN"

                                )

                            );

                        }

                    );

                }

            );

        };


    /*=========================================================
      RESOLVED SIGHTINGS
    =========================================================*/

    GG.queryResolvedSightings =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                request

                            );


                    return sightings.filter(

                        function (

                            sighting

                        ) {

                            return (

                                SightingQuery
                                    .getStatus(

                                        sighting

                                    ) ===

                                "RESOLVED"

                            );

                        }

                    );

                }

            );

        };


    /*=========================================================
      SIGHTING COUNT
    =========================================================*/

    GG.querySightingCount =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                request

                            );


                    return {

                        ...SightingQuery
                            .buildSummary(

                                sightings

                            ),

                        sightings:

                            sightings

                    };

                }

            );

        };


    /*=========================================================
      SIGHTING SUMMARY
    =========================================================*/

    GG.querySightingSummary =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                request

                            );


                    return {

                        summary:

                            SightingQuery
                                .buildSummary(

                                    sightings

                                ),

                        byDivision:

                            SightingQuery
                                .groupBy(

                                    sightings,

                                    SightingQuery
                                        .getDivision

                                ),

                        byRange:

                            SightingQuery
                                .groupBy(

                                    sightings,

                                    SightingQuery
                                        .getRange

                                ),

                        byBeat:

                            SightingQuery
                                .groupBy(

                                    sightings,

                                    SightingQuery
                                        .getBeat

                                ),

                        sightings:

                            sightings,

                        count:

                            sightings.length

                    };

                }

            );

        };


    /*=========================================================
      RANGE SIGHTINGS
    =========================================================*/

    GG.queryRangeSightings =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    return SightingQuery
                        .filterSightings(

                            request

                        );

                }

            );

        };


    /*=========================================================
      BEAT SIGHTINGS
    =========================================================*/

    GG.queryBeatSightings =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    return SightingQuery
                        .filterSightings(

                            request

                        );

                }

            );

        };


    /*=========================================================
      COMPARTMENT SIGHTINGS
    =========================================================*/

    GG.queryCompartmentSightings =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    return SightingQuery
                        .filterSightings(

                            request

                        );

                }

            );

        };


    /*=========================================================
      VILLAGE SIGHTINGS
    =========================================================*/

    GG.queryVillageSightings =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    return SightingQuery
                        .filterSightings(

                            request

                        );

                }

            );

        };


    /*=========================================================
      HERD SUMMARY
    =========================================================*/

    GG.querySightingHerd =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                request

                            );


                    const rows =

                        sightings.map(

                            function (

                                sighting

                            ) {

                                return {

                                    sightingId:

                                        SightingQuery
                                            .getSightingID(

                                                sighting

                                            ),

                                    herdSize:

                                        SightingQuery
                                            .getHerdSize(

                                                sighting

                                            ),

                                    status:

                                        SightingQuery
                                            .getStatus(

                                                sighting

                                            ),

                                    range:

                                        SightingQuery
                                            .getRange(

                                                sighting

                                            ),

                                    beat:

                                        SightingQuery
                                            .getBeat(

                                                sighting

                                            ),

                                    compartment:

                                        SightingQuery
                                            .getCompartment(

                                                sighting

                                            ),

                                    village:

                                        SightingQuery
                                            .getNearestVillage(

                                                sighting

                                            ),

                                    sighting:

                                        sighting

                                };

                            }

                        );


                    return {

                        count:

                            rows.length,

                        totalElephants:

                            rows.reduce(

                                function (

                                    total,

                                    row

                                ) {

                                    return (

                                        total +

                                        row.herdSize

                                    );

                                },

                                0

                            ),

                        sightings:

                            rows

                    };

                }

            );

        };


    /*=========================================================
      MOVEMENT
    =========================================================*/

    GG.querySightingMovement =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                request

                            );


                    return sightings.map(

                        function (

                            sighting

                        ) {

                            return {

                                sightingId:

                                    SightingQuery
                                        .getSightingID(

                                            sighting

                                        ),

                                status:

                                    SightingQuery
                                        .getStatus(

                                            sighting

                                        ),

                                direction:

                                    SightingQuery
                                        .getDirection(

                                            sighting

                                        ),

                                lat:

                                    SightingQuery
                                        .getLatitude(

                                            sighting

                                        ),

                                lon:

                                    SightingQuery
                                        .getLongitude(

                                            sighting

                                        ),

                                division:

                                    SightingQuery
                                        .getDivision(

                                            sighting

                                        ),

                                range:

                                    SightingQuery
                                        .getRange(

                                            sighting

                                        ),

                                beat:

                                    SightingQuery
                                        .getBeat(

                                            sighting

                                        ),

                                compartment:

                                    SightingQuery
                                        .getCompartment(

                                            sighting

                                        ),

                                village:

                                    SightingQuery
                                        .getNearestVillage(

                                            sighting

                                        ),

                                sighting:

                                    sighting

                            };

                        }

                    );

                }

            );

        };


    /*=========================================================
      NEAREST VILLAGE
    =========================================================*/

    GG.querySightingNearestVillage =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                request

                            );


                    return sightings.map(

                        function (

                            sighting

                        ) {

                            return {

                                sightingId:

                                    SightingQuery
                                        .getSightingID(

                                            sighting

                                        ),

                                village:

                                    SightingQuery
                                        .getNearestVillage(

                                            sighting

                                        ) ||

                                    SightingQuery
                                        .getVillage(

                                            sighting

                                        ),

                                villageCode:

                                    SightingQuery
                                        .getVillageCode(

                                            sighting

                                        ),

                                distanceMeters:

                                    SightingQuery
                                        .getVillageDistanceMeters(

                                            sighting

                                        ),

                                riskLevel:

                                    SightingQuery
                                        .getRisk(

                                            sighting

                                        ),

                                conflictHistory:

                                    SightingQuery
                                        .getConflictHistory(

                                            sighting

                                        ),

                                sighting:

                                    sighting

                            };

                        }

                    );

                }

            );

        };


    /*=========================================================
      HEC RISK
    =========================================================*/

    GG.queryHECRisk =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                request

                            );


                    const records =

                        sightings

                            .map(

                                SightingQuery
                                    .buildHECRiskRecord

                            )

                            .sort(

                                function (

                                    a,

                                    b

                                ) {

                                    return (

                                        b.riskScore -

                                        a.riskScore

                                    );

                                }

                            );


                    return {

                        count:

                            records.length,

                        highestRisk:

                            records[0] ||

                            null,

                        sightings:

                            records

                    };

                }

            );

        };


    /*=========================================================
      HEC PRIORITY
    =========================================================*/

    GG.queryHECPriority =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                request

                            );


                    const priorities =

                        sightings

                            .filter(

                                SightingQuery.isActive

                            )

                            .map(

                                SightingQuery
                                    .buildHECRiskRecord

                            )

                            .sort(

                                function (

                                    a,

                                    b

                                ) {

                                    return (

                                        b.riskScore -

                                        a.riskScore

                                    );

                                }

                            );


                    return {

                        count:

                            priorities.length,

                        highestPriority:

                            priorities[0] ||

                            null,

                        priorities:

                            priorities

                    };

                }

            );

        };


    /*=========================================================
      HEC MITIGATION
    =========================================================*/

    GG.queryHECMitigation =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                request

                            );


                    const recommendations =

                        sightings

                            .filter(

                                SightingQuery.isActive

                            )

                            .map(

                                function (

                                    sighting

                                ) {

                                    const record =

                                        SightingQuery
                                            .buildHECRiskRecord(

                                                sighting

                                            );


                                    return SightingQuery
                                        .buildMitigation(

                                            record

                                        );

                                }

                            )

                            .sort(

                                function (

                                    a,

                                    b

                                ) {

                                    return (

                                        b.riskScore -

                                        a.riskScore

                                    );

                                }

                            );


                    return {

                        count:

                            recommendations.length,

                        highestPriority:

                            recommendations[0] ||

                            null,

                        recommendations:

                            recommendations

                    };

                }

            );

        };


    /*=========================================================
      CONFLICT HOTSPOTS
    =========================================================*/

    GG.queryHECHotspots =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                request

                            );


                    const groups =

                        SightingQuery.groupBy(

                            sightings,

                            function (

                                sighting

                            ) {

                                return (

                                    SightingQuery
                                        .getNearestVillage(

                                            sighting

                                        ) ||

                                    SightingQuery
                                        .getVillage(

                                            sighting

                                        ) ||

                                    SightingQuery
                                        .getCompartment(

                                            sighting

                                        ) ||

                                    SightingQuery
                                        .getBeat(

                                            sighting

                                        ) ||

                                    "UNKNOWN"

                                );

                            }

                        );


                    const hotspots =

                        groups

                            .map(

                                function (

                                    group

                                ) {

                                    const riskScores =

                                        group.sightings.map(

                                            SightingQuery
                                                .calculateRiskScore

                                        );


                                    return {

                                        location:

                                            group.name,

                                        sightingCount:

                                            group.count,

                                        activeSightings:

                                            group.summary.active,

                                        totalElephants:

                                            group.summary.totalElephants,

                                        highRiskSightings:

                                            group.summary.highRiskSightings,

                                        conflictHistory:

                                            group.summary
                                                .cumulativeConflictHistory,

                                        maxRiskScore:

                                            riskScores.length

                                                ? Math.max(

                                                    ...riskScores

                                                )

                                                : 0,

                                        sightings:

                                            group.sightings

                                    };

                                }

                            )

                            .sort(

                                function (

                                    a,

                                    b

                                ) {

                                    if (

                                        b.maxRiskScore !==

                                        a.maxRiskScore

                                    ) {

                                        return (

                                            b.maxRiskScore -

                                            a.maxRiskScore

                                        );

                                    }


                                    return (

                                        b.sightingCount -

                                        a.sightingCount

                                    );

                                }

                            );


                    return {

                        count:

                            hotspots.length,

                        highestHotspot:

                            hotspots[0] ||

                            null,

                        hotspots:

                            hotspots

                    };

                }

            );

        };


    /*=========================================================
      RANGE ANALYTICS
    =========================================================*/

    GG.querySightingRangeAnalytics =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                request

                            );


                    const ranges =

                        SightingQuery.groupBy(

                            sightings,

                            SightingQuery
                                .getRange

                        );


                    return {

                        count:

                            ranges.length,

                        ranges:

                            ranges

                    };

                }

            );

        };


    /*=========================================================
      BEAT ANALYTICS
    =========================================================*/

    GG.querySightingBeatAnalytics =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                request

                            );


                    const beats =

                        SightingQuery.groupBy(

                            sightings,

                            SightingQuery
                                .getBeat

                        );


                    return {

                        count:

                            beats.length,

                        beats:

                            beats

                    };

                }

            );

        };


    /*=========================================================
      COMPARTMENT ANALYTICS
    =========================================================*/

    GG.querySightingCompartmentAnalytics =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                request

                            );


                    const compartments =

                        SightingQuery.groupBy(

                            sightings,

                            SightingQuery
                                .getCompartment

                        );


                    return {

                        count:

                            compartments.length,

                        compartments:

                            compartments

                    };

                }

            );

        };


    /*=========================================================
      VILLAGE ANALYTICS
    =========================================================*/

    GG.querySightingVillageAnalytics =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                request

                            );


                    const villages =

                        SightingQuery.groupBy(

                            sightings,

                            function (

                                sighting

                            ) {

                                return (

                                    SightingQuery
                                        .getNearestVillage(

                                            sighting

                                        ) ||

                                    SightingQuery
                                        .getVillage(

                                            sighting

                                        )

                                );

                            }

                        );


                    return {

                        count:

                            villages.length,

                        villages:

                            villages

                    };

                }

            );

        };


    /*=========================================================
      TEMPORAL ANALYTICS
    =========================================================*/

    GG.querySightingTemporalAnalytics =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                request

                            );


                    const hourly =

                        {};


                    const daily =

                        {};


                    const monthly =

                        {};


                    sightings.forEach(

                        function (

                            sighting

                        ) {

                            const timestamp =

                                SightingQuery
                                    .getSightingTimestamp(

                                        sighting

                                    );


                            if (

                                !timestamp

                            ) {

                                return;

                            }


                            const date =

                                new Date(

                                    timestamp

                                );


                            const hour =

                                String(

                                    date.getHours()

                                ).padStart(

                                    2,

                                    "0"

                                );


                            const day =

                                date
                                    .toISOString()
                                    .slice(

                                        0,

                                        10

                                    );


                            const month =

                                day.slice(

                                    0,

                                    7

                                );


                            hourly[hour] =

                                (

                                    hourly[hour] ||

                                    0

                                ) + 1;


                            daily[day] =

                                (

                                    daily[day] ||

                                    0

                                ) + 1;


                            monthly[month] =

                                (

                                    monthly[month] ||

                                    0

                                ) + 1;

                        }

                    );


                    return {

                        count:

                            sightings.length,

                        hourly:

                            hourly,

                        daily:

                            daily,

                        monthly:

                            monthly,

                        sightings:

                            sightings

                    };

                }

            );

        };


    /*=========================================================
      DEPREDATION ANALYTICS
    =========================================================*/

    GG.queryDepredationAnalytics =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                request

                            );


                    const depredation =

                        sightings.filter(

                            function (

                                sighting

                            ) {

                                const value =

                                    sighting.depredation ??

                                    sighting.crop_damage ??

                                    sighting.property_damage ??

                                    sighting.damage;


                                if (

                                    value === undefined ||

                                    value === null ||

                                    value === ""

                                ) {

                                    return false;

                                }


                                if (

                                    typeof value ===

                                    "boolean"

                                ) {

                                    return value;

                                }


                                const text =

                                    String(

                                        value

                                    )

                                        .trim()

                                        .toUpperCase();


                                return (

                                    text !== "" &&

                                    text !== "NO" &&

                                    text !== "NONE" &&

                                    text !== "FALSE" &&

                                    text !== "0"

                                );

                            }

                        );


                    return {

                        count:

                            depredation.length,

                        totalSightings:

                            sightings.length,

                        percentage:

                            sightings.length

                                ? Number(

                                    (

                                        depredation.length /

                                        sightings.length *

                                        100

                                    ).toFixed(

                                        2

                                    )

                                )

                                : 0,

                        byVillage:

                            SightingQuery
                                .groupBy(

                                    depredation,

                                    function (

                                        sighting

                                    ) {

                                        return (

                                            SightingQuery
                                                .getNearestVillage(

                                                    sighting

                                                ) ||

                                            SightingQuery
                                                .getVillage(

                                                    sighting

                                                )

                                        );

                                    }

                                ),

                        sightings:

                            depredation

                    };

                }

            );

        };


    /*=========================================================
      DRIVING / RESPONSE ANALYTICS
    =========================================================*/

    GG.queryDrivingAnalytics =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                request

                            );


                    const driving =

                        sightings.filter(

                            function (

                                sighting

                            ) {

                                const status =

                                    SightingQuery
                                        .getStatus(

                                            sighting

                                        );


                                return (

                                    status.startsWith(

                                        "DRIVEN"

                                    ) ||

                                    sighting.driving ||

                                    sighting.driving_team ||

                                    sighting.drivingTeam

                                );

                            }

                        );


                    return {

                        count:

                            driving.length,

                        byRange:

                            SightingQuery
                                .groupBy(

                                    driving,

                                    SightingQuery
                                        .getRange

                                ),

                        byBeat:

                            SightingQuery
                                .groupBy(

                                    driving,

                                    SightingQuery
                                        .getBeat

                                ),

                        sightings:

                            driving

                    };

                }

            );

        };


    /*=========================================================
      EARLY WARNING
    =========================================================*/

    GG.querySightingEarlyWarning =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                request

                            );


                    const warnings =

                        sightings

                            .filter(

                                SightingQuery.isActive

                            )

                            .map(

                                SightingQuery
                                    .buildHECRiskRecord

                            )

                            .filter(

                                function (

                                    record

                                ) {

                                    return (

                                        record.riskScore >= 50 ||

                                        (

                                            record.distanceMeters >

                                                0 &&

                                            record.distanceMeters <=

                                                1000

                                        ) ||

                                        record.riskLevel
                                            .toUpperCase() ===

                                            "HIGH"

                                    );

                                }

                            )

                            .sort(

                                function (

                                    a,

                                    b

                                ) {

                                    return (

                                        b.riskScore -

                                        a.riskScore

                                    );

                                }

                            );


                    return {

                        count:

                            warnings.length,

                        critical:

                            warnings.filter(

                                function (

                                    warning

                                ) {

                                    return (

                                        warning.riskScore >=

                                        75

                                    );

                                }

                            ),

                        warnings:

                            warnings

                    };

                }

            );

        };


    /*=========================================================
      CURRENT OPERATIONAL SITUATION
    =========================================================*/

    GG.querySightingSituation =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                request

                            );


                    const active =

                        sightings.filter(

                            SightingQuery.isActive

                        );


                    const risks =

                        active

                            .map(

                                SightingQuery
                                    .buildHECRiskRecord

                            )

                            .sort(

                                function (

                                    a,

                                    b

                                ) {

                                    return (

                                        b.riskScore -

                                        a.riskScore

                                    );

                                }

                            );


                    return {

                        summary:

                            SightingQuery
                                .buildSummary(

                                    sightings

                                ),

                        activeSightings:

                            active,

                        highestRisk:

                            risks[0] ||

                            null,

                        riskPriorities:

                            risks,

                        byRange:

                            SightingQuery
                                .groupBy(

                                    active,

                                    SightingQuery
                                        .getRange

                                ),

                        byBeat:

                            SightingQuery
                                .groupBy(

                                    active,

                                    SightingQuery
                                        .getBeat

                                ),

                        byVillage:

                            SightingQuery
                                .groupBy(

                                    active,

                                    function (

                                        sighting

                                    ) {

                                        return (

                                            SightingQuery
                                                .getNearestVillage(

                                                    sighting

                                                ) ||

                                            SightingQuery
                                                .getVillage(

                                                    sighting

                                                )

                                        );

                                    }

                                ),

                        count:

                            sightings.length

                    };

                }

            );

        };


    /*=========================================================
      USER / JURISDICTION SIGHTINGS
    =========================================================*/

    GG.queryMySightings =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const jurisdiction =

                        SightingQuery
                            .getCurrentJurisdiction();


                    if (

                        !jurisdiction

                    ) {

                        throw new Error(

                            "Current user jurisdiction unavailable."

                        );

                    }


                    const scopedRequest = {

                        ...request,

                        parameters: {

                            ...(request.parameters || {})

                        }

                    };


                    /*
                     * Narrowest available posting wins.
                     *
                     * Different beat/range users therefore
                     * receive the operational sightings
                     * relevant to their own jurisdiction.
                     */

                    if (

                        jurisdiction.compartment

                    ) {

                        scopedRequest.parameters.compartment =

                            jurisdiction.compartment;

                    }

                    else if (

                        jurisdiction.beat

                    ) {

                        scopedRequest.parameters.beat =

                            jurisdiction.beat;

                    }

                    else if (

                        jurisdiction.range

                    ) {

                        scopedRequest.parameters.range =

                            jurisdiction.range;

                    }

                    else if (

                        jurisdiction.division

                    ) {

                        scopedRequest.parameters.division =

                            jurisdiction.division;

                    }


                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                scopedRequest

                            );


                    return {

                        jurisdiction:

                            jurisdiction,

                        count:

                            sightings.length,

                        sightings:

                            sightings

                    };

                }

            );

        };


    /*=========================================================
      ACTIVE SIGHTINGS FOR CURRENT USER JURISDICTION
    =========================================================*/

    GG.queryMyActiveSightings =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const jurisdiction =

                        SightingQuery
                            .getCurrentJurisdiction();


                    if (

                        !jurisdiction

                    ) {

                        throw new Error(

                            "Current user jurisdiction unavailable."

                        );

                    }


                    const scopedRequest = {

                        ...request,

                        parameters: {

                            ...(request.parameters || {}),

                            active:

                                true

                        }

                    };


                    if (

                        jurisdiction.compartment

                    ) {

                        scopedRequest.parameters.compartment =

                            jurisdiction.compartment;

                    }

                    else if (

                        jurisdiction.beat

                    ) {

                        scopedRequest.parameters.beat =

                            jurisdiction.beat;

                    }

                    else if (

                        jurisdiction.range

                    ) {

                        scopedRequest.parameters.range =

                            jurisdiction.range;

                    }

                    else if (

                        jurisdiction.division

                    ) {

                        scopedRequest.parameters.division =

                            jurisdiction.division;

                    }


                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                scopedRequest

                            );


                    return {

                        jurisdiction:

                            jurisdiction,

                        count:

                            sightings.length,

                        sightings:

                            sightings

                    };

                }

            );

        };


    /*=========================================================
      RESPONSE / DUTY PRIORITY

      Supports depredation duty and HEC mitigation.
    =========================================================*/

    GG.querySightingResponsePriority =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                request

                            );


                    const priorities =

                        sightings

                            .filter(

                                SightingQuery.isActive

                            )

                            .map(

                                function (

                                    sighting

                                ) {

                                    const record =

                                        SightingQuery
                                            .buildHECRiskRecord(

                                                sighting

                                            );


                                    return {

                                        ...record,

                                        mitigation:

                                            SightingQuery
                                                .buildMitigation(

                                                    record

                                                )
                                                .actions

                                    };

                                }

                            )

                            .sort(

                                function (

                                    a,

                                    b

                                ) {

                                    return (

                                        b.riskScore -

                                        a.riskScore

                                    );

                                }

                            );


                    return {

                        count:

                            priorities.length,

                        firstPriority:

                            priorities[0] ||

                            null,

                        priorities:

                            priorities

                    };

                }

            );

        };


    /*=========================================================
      GIS CONTEXT FOR A SIGHTING
    =========================================================*/

    GG.querySightingGIS =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                request

                            );


                    return sightings.map(

                        function (

                            sighting

                        ) {

                            const lat =

                                SightingQuery
                                    .getLatitude(

                                        sighting

                                    );


                            const lon =

                                SightingQuery
                                    .getLongitude(

                                        sighting

                                    );


                            let compartment =

                                null;


                            if (

                                Number.isFinite(

                                    lat

                                ) &&

                                Number.isFinite(

                                    lon

                                ) &&

                                GG.GISEntities &&

                                typeof GG.GISEntities
                                    .findCompartmentAtPoint ===

                                    "function"

                            ) {

                                try {

                                    compartment =

                                        GG.GISEntities
                                            .findCompartmentAtPoint(

                                                lat,

                                                lon

                                            );

                                }

                                catch (

                                    error

                                ) {}

                            }


                            return {

                                sightingId:

                                    SightingQuery
                                        .getSightingID(

                                            sighting

                                        ),

                                lat:

                                    lat,

                                lon:

                                    lon,

                                division:

                                    SightingQuery
                                        .getDivision(

                                            sighting

                                        ),

                                range:

                                    SightingQuery
                                        .getRange(

                                            sighting

                                        ),

                                beat:

                                    SightingQuery
                                        .getBeat(

                                            sighting

                                        ),

                                compartment:

                                    SightingQuery
                                        .getCompartment(

                                            sighting

                                        ),

                                resolvedCompartment:

                                    compartment,

                                village:

                                    SightingQuery
                                        .getVillage(

                                            sighting

                                        ),

                                nearestVillage:

                                    SightingQuery
                                        .getNearestVillage(

                                            sighting

                                        ),

                                villageLGD:

                                    SightingQuery
                                        .getVillageCode(

                                            sighting

                                        ),

                                sighting:

                                    sighting

                            };

                        }

                    );

                }

            );

        };


    /*=========================================================
      TREND
    =========================================================*/

    GG.querySightingTrend =
        async function (

            request

        ) {

            return GG.querySightingTemporalAnalytics(

                request

            );

        };


    /*=========================================================
      HOTSPOT ALIAS
    =========================================================*/

    GG.querySightingHotspots =
        async function (

            request

        ) {

            return GG.queryHECHotspots(

                request

            );

        };


    /*=========================================================
      RISK ALIAS
    =========================================================*/

    GG.querySightingRisk =
        async function (

            request

        ) {

            return GG.queryHECRisk(

                request

            );

        };


    /*=========================================================
      MITIGATION ALIAS
    =========================================================*/

    GG.querySightingMitigation =
        async function (

            request

        ) {

            return GG.queryHECMitigation(

                request

            );

        };


    /*=========================================================
      ANALYTICS MASTER
    =========================================================*/

    GG.querySightingAnalytics =
        async function (

            request

        ) {

            return SightingQuery.execute(

                request,

                async function (

                    request

                ) {

                    const sightings =

                        await SightingQuery
                            .filterSightings(

                                request

                            );


                    const risks =

                        sightings

                            .map(

                                SightingQuery
                                    .buildHECRiskRecord

                            )

                            .sort(

                                function (

                                    a,

                                    b

                                ) {

                                    return (

                                        b.riskScore -

                                        a.riskScore

                                    );

                                }

                            );


                    return {

                        summary:

                            SightingQuery
                                .buildSummary(

                                    sightings

                                ),

                        byDivision:

                            SightingQuery
                                .groupBy(

                                    sightings,

                                    SightingQuery
                                        .getDivision

                                ),

                        byRange:

                            SightingQuery
                                .groupBy(

                                    sightings,

                                    SightingQuery
                                        .getRange

                                ),

                        byBeat:

                            SightingQuery
                                .groupBy(

                                    sightings,

                                    SightingQuery
                                        .getBeat

                                ),

                        byCompartment:

                            SightingQuery
                                .groupBy(

                                    sightings,

                                    SightingQuery
                                        .getCompartment

                                ),

                        byVillage:

                            SightingQuery
                                .groupBy(

                                    sightings,

                                    function (

                                        sighting

                                    ) {

                                        return (

                                            SightingQuery
                                                .getNearestVillage(

                                                    sighting

                                                ) ||

                                            SightingQuery
                                                .getVillage(

                                                    sighting

                                                )

                                        );

                                    }

                                ),

                        highestRisk:

                            risks[0] ||

                            null,

                        riskRanking:

                            risks,

                        sightings:

                            sightings,

                        count:

                            sightings.length

                    };

                }

            );

        };


    /*=========================================================
      MODULE STATUS
    =========================================================*/

    SightingQuery.getStatus =
        function () {

            return {

                loaded:

                    SightingQuery.loaded,

                loading:

                    SightingQuery.loading,

                version:

                    SightingQuery.VERSION,

                cacheSize:

                    SightingQuery.cache.size,

                entityCount:

                    SightingQuery
                        .getEntityArray()
                        .length,

                statistics: {

                    ...SightingQuery.statistics

                }

            };

        };


    /*=========================================================
      RESET
    =========================================================*/

    SightingQuery.reset =
        function () {

            SightingQuery.clearCache();


            SightingQuery.loaded =

                false;


            SightingQuery.loading =

                false;


            SightingQuery.lastQuery =

                null;


            SightingQuery.lastResult =

                null;


            return SightingQuery.initialize();

        };


    /*=========================================================
      AUTO INITIALIZATION
    =========================================================*/

    SightingQuery.initialize();


    /*=========================================================
      EXPORT
    =========================================================*/

    GG.SightingQuery =

        SightingQuery;


    /*=========================================================
      MODULE LOADED
    =========================================================*/

    if (

        GG.Config?.DEBUG?.ENABLED

    ) {

        console.log(

            "✅ SightingQuery Loaded",

            SightingQuery.VERSION

        );

    }


})(

    window

);
