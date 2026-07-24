/*!
 * GreenGuard AI
 * sightingFormatter.js
 *
 * Version: 1.0.0
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Canonical presentation layer for the GreenGuard
 * Elephant Sighting / HEC domain.
 *
 * PIPELINE
 * ---------------------------------------------------------
 *
 * Core.ask()
 *      ↓
 * Controller.ask()
 *      ↓
 * IntentManager
 *      ↓
 * SightingIntent
 *      ↓
 * AIDispatcher
 *      ↓
 * SightingRouter
 *      ↓
 * SightingQuery
 *      ↓
 * SightingFormatter
 *      ↓
 * Render / Panel
 *
 * RESPONSIBILITY
 * ---------------------------------------------------------
 *
 * SightingFormatter:
 *
 * - receives SightingQuery response
 * - preserves canonical data
 * - formats human-readable output
 * - formats lists
 * - formats summaries
 * - formats HEC intelligence
 * - formats movement information
 * - formats operational information
 * - formats analytics
 *
 * DOES NOT:
 *
 * - read Firestore
 * - write Firestore
 * - change sighting status
 * - resolve GIS polygons
 * - detect intent
 * - calculate authoritative business analytics
 *
 * IMPORTANT
 * ---------------------------------------------------------
 *
 * Query layer owns DATA.
 * Formatter layer owns PRESENTATION.
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

        GG.SightingFormatter

    ) {

        console.warn(

            "[GreenGuardAI] SightingFormatter already loaded."

        );

        return;

    }


    /*=========================================================
      MODULE
    =========================================================*/


    const SightingFormatter = {};


    /*=========================================================
      VERSION
    =========================================================*/


    SightingFormatter.VERSION =

        "1.0.0";


    /*=========================================================
      CONSTANTS
    =========================================================*/


    const Constants =

        GG.SightingConstants ||

        {};


    const INTENTS =

        Constants.INTENTS ||

        {};


    /*=========================================================
      STATUS
    =========================================================*/


    SightingFormatter.initialized =

        false;


    SightingFormatter.lastInput =

        null;


    SightingFormatter.lastOutput =

        null;


    /*=========================================================
      STATISTICS
    =========================================================*/


    SightingFormatter.statistics = {

        formatted:

            0,

        successes:

            0,

        failures:

            0,

        fallbacks:

            0,

        totalExecutionTime:

            0,

        averageExecutionTime:

            0

    };


    /*=========================================================
      FORMATTER REGISTRY
    =========================================================*/


    SightingFormatter.formatters =

        new Map();


    /*=========================================================
      INITIALIZE
    =========================================================*/


    SightingFormatter.init = function () {

        if (

            SightingFormatter.initialized

        ) {

            return true;

        }


        SightingFormatter.buildRegistry();


        SightingFormatter.initialized =

            true;


        if (

            GG.Config?.DEBUG?.ENABLED

        ) {

            console.log(

                "%cGreenGuard SightingFormatter Ready",

                "color:#008000;font-weight:bold;",

                SightingFormatter.formatters.size,

                "formatters"

            );

        }


        return true;

    };


    /*=========================================================
      SAFE STRING
    =========================================================*/


    SightingFormatter.safeString = function (

        value,

        fallback = ""

    ) {

        if (

            value === undefined ||

            value === null

        ) {

            return fallback;

        }


        const text =

            String(

                value

            ).trim();


        return (

            text ||

            fallback

        );

    };


    /*=========================================================
      SAFE NUMBER
    =========================================================*/


    SightingFormatter.safeNumber = function (

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


    /*=========================================================
      SAFE ARRAY
    =========================================================*/


    SightingFormatter.safeArray = function (

        value

    ) {

        return Array.isArray(

            value

        )

            ? value

            : [];

    };


    /*=========================================================
      ESCAPE MARKDOWN
    =========================================================*/


    SightingFormatter.escapeMarkdown = function (

        value

    ) {

        let text =

            SightingFormatter.safeString(

                value

            );


        if (

            !text

        ) {

            return "";

        }


        /*
         * Keep this deliberately conservative.
         *
         * We do not want values coming from Firestore
         * to unexpectedly create Markdown structure.
         */


        return text.replace(

            /([\\`*_{}\[\]()#+.!|>])/g,

            "\\$1"

        );

    };


    /*=========================================================
      DISPLAY VALUE
    =========================================================*/


    SightingFormatter.display = function (

        value,

        fallback = "Not available"

    ) {

        if (

            value === undefined ||

            value === null ||

            value === ""

        ) {

            return fallback;

        }


        return String(

            value

        );

    };


    /*=========================================================
      NORMALIZE INTENT KEY
    =========================================================*/


    SightingFormatter.normalizeIntentKey = function (

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

            .replace(

                /([a-z0-9])([A-Z])/g,

                "$1_$2"

            )

            .replace(

                /[\s\-]+/g,

                "_"

            )

            .replace(

                /_+/g,

                "_"

            )

            .toUpperCase();

    };


    /*=========================================================
      REGISTER FORMATTER
    =========================================================*/


    SightingFormatter.register = function (

        intent,

        formatterName

    ) {

        if (

            !intent ||

            !formatterName

        ) {

            return false;

        }


        const key =

            SightingFormatter
                .normalizeIntentKey(

                    intent

                );


        if (

            !key

        ) {

            return false;

        }


        SightingFormatter.formatters.set(

            key,

            formatterName

        );


        return true;

    };


    /*=========================================================
      REGISTER CONSTANT
    =========================================================*/


    SightingFormatter.registerConstant = function (

        constantName,

        formatterName

    ) {

        const canonical =

            INTENTS[

                constantName

            ] ||

            constantName;


        /*
         * Register both:
         *
         * SIGHTING_ACTIVE
         *
         * and:
         *
         * sightingActive
         */


        SightingFormatter.register(

            constantName,

            formatterName

        );


        SightingFormatter.register(

            canonical,

            formatterName

        );


        return true;

    };


    /*=========================================================
      BUILD FORMATTER REGISTRY
    =========================================================*/


    SightingFormatter.buildRegistry = function () {


        SightingFormatter.formatters.clear();


        /*=====================================================
          SINGLE / DETAILS
        =====================================================*/


        [

            "SIGHTING_DETAILS",

            "SIGHTING_STATUS",

            "SIGHTING_LIFECYCLE",

            "SIGHTING_LOCATION",

            "SIGHTING_HERD_SIZE",

            "SIGHTING_MOVEMENT",

            "SIGHTING_MOVEMENT_DIRECTION"

        ].forEach(

            function (

                intent

            ) {

                SightingFormatter
                    .registerConstant(

                        intent,

                        "formatSightingDetails"

                    );

            }

        );


        /*=====================================================
          LISTS
        =====================================================*/


        [

            "SIGHTING_SEARCH",

            "SIGHTING_LIST",

            "SIGHTING_HISTORY",

            "SIGHTING_RECENT",

            "SIGHTING_ACTIVE",

            "SIGHTING_INACTIVE",

            "SIGHTING_RESOLVED",

            "SIGHTING_MOVED",

            "SIGHTING_DRIVEN",

            "SIGHTING_SINGLE_ELEPHANT",

            "SIGHTING_HERD",

            "SIGHTING_MOVEMENT_HISTORY",

            "SIGHTING_NEAR_LOCATION",

            "SIGHTING_NEAR_VILLAGE",

            "SIGHTING_VILLAGE",

            "SIGHTING_DIVISION",

            "SIGHTING_RANGE",

            "SIGHTING_BEAT",

            "SIGHTING_COMPARTMENT",

            "SIGHTING_BY_STAFF",

            "SIGHTING_MY",

            "SIGHTING_MY_ACTIVE",

            "SIGHTING_TODAY",

            "SIGHTING_YESTERDAY",

            "SIGHTING_WEEK",

            "SIGHTING_MONTH",

            "SIGHTING_FINANCIAL_YEAR"

        ].forEach(

            function (

                intent

            ) {

                SightingFormatter
                    .registerConstant(

                        intent,

                        "formatSightingList"

                    );

            }

        );


        /*=====================================================
          LATEST
        =====================================================*/


        SightingFormatter.registerConstant(

            "SIGHTING_LATEST",

            "formatLatestSighting"

        );


        /*=====================================================
          COUNT
        =====================================================*/


        [

            "SIGHTING_COUNT",

            "SIGHTING_ELEPHANT_COUNT",

            "SIGHTING_FREQUENCY"

        ].forEach(

            function (

                intent

            ) {

                SightingFormatter
                    .registerConstant(

                        intent,

                        "formatCount"

                    );

            }

        );


        /*=====================================================
          SUMMARY / ANALYTICS
        =====================================================*/


        [

            "SIGHTING_SUMMARY",

            "SIGHTING_MOVEMENT_SUMMARY",

            "SIGHTING_DIVISION_ANALYTICS",

            "SIGHTING_RANGE_ANALYTICS",

            "SIGHTING_BEAT_ANALYTICS",

            "SIGHTING_COMPARTMENT_ANALYTICS",

            "SIGHTING_VILLAGE_ANALYTICS",

            "SIGHTING_STAFF_ANALYTICS",

            "SIGHTING_TEAM_ANALYTICS",

            "SIGHTING_TIME_ANALYTICS",

            "SIGHTING_TREND",

            "SIGHTING_ANALYTICS",

            "SIGHTING_RISK_ANALYTICS",

            "SIGHTING_CONFLICT_ANALYTICS"

        ].forEach(

            function (

                intent

            ) {

                SightingFormatter
                    .registerConstant(

                        intent,

                        "formatAnalytics"

                    );

            }

        );


        /*=====================================================
          HEC
        =====================================================*/


        [

            "HEC_SUMMARY",

            "HEC_RISK",

            "HEC_RISK_ANALYSIS",

            "HEC_TREND",

            "HEC_HISTORY",

            "HEC_VILLAGE_RISK",

            "HEC_RANGE_RISK",

            "HEC_BEAT_RISK",

            "HEC_COMPARTMENT_RISK"

        ].forEach(

            function (

                intent

            ) {

                SightingFormatter
                    .registerConstant(

                        intent,

                        "formatHEC"

                    );

            }

        );


        /*=====================================================
          HOTSPOTS
        =====================================================*/


        [

            "HEC_HOTSPOTS",

            "SIGHTING_HOTSPOTS",

            "DEPREDATION_HOTSPOTS"

        ].forEach(

            function (

                intent

            ) {

                SightingFormatter
                    .registerConstant(

                        intent,

                        "formatHotspots"

                    );

            }

        );


        /*=====================================================
          MITIGATION
        =====================================================*/


        [

            "HEC_MITIGATION",

            "HEC_MITIGATION_PRIORITY",

            "HEC_PREVENTION",

            "HEC_RESPONSE",

            "HEC_RESPONSE_PRIORITY",

            "HEC_OPERATIONAL_ADVICE"

        ].forEach(

            function (

                intent

            ) {

                SightingFormatter
                    .registerConstant(

                        intent,

                        "formatMitigation"

                    );

            }

        );


        /*=====================================================
          DEPREDATION
        =====================================================*/


        [

            "DEPREDATION_SUMMARY",

            "DEPREDATION_ANALYTICS",

            "DEPREDATION_HISTORY",

            "DEPREDATION_RISK",

            "DEPREDATION_TREND"

        ].forEach(

            function (

                intent

            ) {

                SightingFormatter
                    .registerConstant(

                        intent,

                        "formatDepredation"

                    );

            }

        );


        /*=====================================================
          OPERATIONAL
        =====================================================*/


        [

            "SIGHTING_RESPONSE_PRIORITY",

            "SIGHTING_NEAREST_STAFF",

            "SIGHTING_RESPONSE_STAFF",

            "SIGHTING_OPERATIONAL_SUMMARY",

            "SIGHTING_RISK_PRIORITY",

            "SIGHTING_RISK_ASSESSMENT",

            "SIGHTING_PRIORITY_ANALYSIS",

            "SIGHTING_DECISION_SUPPORT"

        ].forEach(

            function (

                intent

            ) {

                SightingFormatter
                    .registerConstant(

                        intent,

                        "formatOperational"

                    );

            }

        );


        return SightingFormatter.formatters;

    };


    /*=========================================================
      GET INTENT
    =========================================================*/


    SightingFormatter.getIntent = function (

        response,

        request

    ) {

        return (

            response?.intent ||

            request?.intent ||

            response?.request?.intent ||

            response?.detectedIntent?.intent ||

            request?.detectedIntent?.intent ||

            ""

        );

    };


    /*=========================================================
      GET DATA
    =========================================================*/


    SightingFormatter.getData = function (

        response

    ) {

        if (

            !response

        ) {

            return null;

        }


        if (

            Object.prototype
                .hasOwnProperty
                .call(

                    response,

                    "data"

                )

        ) {

            return response.data;

        }


        return null;

    };


    /*=========================================================
      EXTRACT SIGHTING ARRAY
    =========================================================*/


    SightingFormatter.getSightings = function (

        data

    ) {

        if (

            Array.isArray(

                data

            )

        ) {

            return data;

        }


        if (

            !data ||

            typeof data !==

            "object"

        ) {

            return [];

        }


        const candidates = [

            data.sightings,

            data.records,

            data.items,

            data.results,

            data.activeSightings,

            data.recentSightings,

            data.history

        ];


        for (

            const candidate of candidates

        ) {

            if (

                Array.isArray(

                    candidate

                )

            ) {

                return candidate;

            }

        }


        return [];

    };


    /*=========================================================
      EXTRACT ONE SIGHTING
    =========================================================*/


    SightingFormatter.getSingleSighting = function (

        data

    ) {

        if (

            !data

        ) {

            return null;

        }


        if (

            Array.isArray(

                data

            )

        ) {

            return (

                data[0] ||

                null

            );

        }


        if (

            typeof data !==

            "object"

        ) {

            return null;

        }


        return (

            data.sighting ||

            data.record ||

            data.latest ||

            data.item ||

            data

        );

    };


    /*=========================================================
      CANONICAL FIELD HELPERS
    =========================================================*/


    SightingFormatter.getSightingID = function (

        sighting

    ) {

        return (

            sighting?.sighting_id ||

            sighting?.sightingId ||

            sighting?.id ||

            sighting?.identity?.sightingId ||

            ""

        );

    };


// ================================================
// ONE SIGHTING'S STATUS
// ================================================

SightingFormatter.getStatus = function (

    sighting

) {

    const status =

        sighting?.status ??

        sighting?.lifecycle?.status ??

        "";


    if (

        status === null ||

        status === undefined

    ) {

        return "";

    }


    if (

        typeof status ===
        "object"

    ) {

        return "";

    }


    return String(

        status

    )

        .trim()

        .toUpperCase();

};


// ================================================
// FORMATTER MODULE STATUS
// ================================================

SightingFormatter.getModuleStatus = function () {

    SightingFormatter.init();


    const validation =

        SightingFormatter
            .validateRegistry();


    const available =

        validation.filter(

            function (

                item

            ) {

                return item.available;

            }

        ).length;


    return {

        loaded:

            true,

        initialized:

            SightingFormatter.initialized,

        version:

            SightingFormatter.VERSION,

        registeredIntents:

            SightingFormatter
                .formatters
                .size,

        availableFormatters:

            available,

        missingFormatters:

            validation.length -

            available,

        statistics: {

            ...SightingFormatter.statistics

        }

    };

};


    SightingFormatter.getDivision = function (

        sighting

    ) {

        return (

            sighting?.gis_division ||

            sighting?.division ||

            sighting?.gis?.division ||

            sighting?.location?.division ||

            ""

        );

    };


    SightingFormatter.getRange = function (

        sighting

    ) {

        return (

            sighting?.gis_range ||

            sighting?.range ||

            sighting?.gis?.range ||

            sighting?.location?.range ||

            ""

        );

    };


    SightingFormatter.getBeat = function (

        sighting

    ) {

        return (

            sighting?.gis_beat ||

            sighting?.beat ||

            sighting?.gis?.beat ||

            sighting?.location?.beat ||

            ""

        );

    };


    SightingFormatter.getCompartment = function (

        sighting

    ) {

        return (

            sighting?.gis_compartment ||

            sighting?.compartment ||

            sighting?.compt ||

            sighting?.gis?.compartment ||

            sighting?.location?.compartment ||

            ""

        );

    };


    SightingFormatter.getVillage = function (

        sighting

    ) {

        return (

            sighting?.nearest_village ||

            sighting?.nearest_location ||

            sighting?.village ||

            sighting?.location?.nearestVillage ||

            ""

        );

    };


    SightingFormatter.getVillageDistance = function (

        sighting

    ) {

        const value =

            sighting
                ?.nearest_village_distance_m ??

            sighting
                ?.nearest_location_distance_m ??

            sighting
                ?.nearestVillageDistance ??

            sighting
                ?.location
                ?.nearestVillageDistanceM;


        const number =

            Number(

                value

            );


        return Number.isFinite(

            number

        )

            ? number

            : null;

    };


    SightingFormatter.getRisk = function (

        sighting

    ) {

        return (

            sighting?.nearest_village_risk ||

            sighting?.nearest_location_risk ||

            sighting?.risk ||

            sighting?.riskLevel ||

            sighting?.hec?.risk ||

            ""

        );

    };


    SightingFormatter.getHerdSize = function (

        sighting

    ) {

        const value =

            sighting?.herd ??

            sighting?.herd_size ??

            sighting?.herdSize ??

            sighting?.elephant_count ??

            sighting?.elephantCount ??
            null;


        const number =

            Number(

                value

            );


        return Number.isFinite(

            number

        )

            ? number

            : null;

    };


    SightingFormatter.getLat = function (

        sighting

    ) {

        const value =

            sighting?.lat ??

            sighting?.latitude ??

            sighting?.gps?.lat ??

            sighting?.location?.lat;


        const number =

            Number(

                value

            );


        return Number.isFinite(

            number

        )

            ? number

            : null;

    };


    SightingFormatter.getLon = function (

        sighting

    ) {

        const value =

            sighting?.lon ??

            sighting?.lng ??

            sighting?.longitude ??

            sighting?.gps?.lon ??

            sighting?.gps?.lng ??

            sighting?.location?.lon;


        const number =

            Number(

                value

            );


        return Number.isFinite(

            number

        )

            ? number

            : null;

    };


    SightingFormatter.getReporter = function (

        sighting

    ) {

        return (

            sighting?.reported_by ||

            sighting?.reportedBy ||

            sighting?.staff_name ||

            sighting?.staffName ||

            sighting?.reporter?.name ||

            sighting?.staff?.name ||

            ""

        );

    };


    SightingFormatter.getTimestamp = function (

        sighting

    ) {

        return (

            sighting?.sighting_time ||

            sighting?.sightingTime ||

            sighting?.timestamp ||

            sighting?.created_at ||

            sighting?.createdAt ||

            sighting?.time ||

            null

        );

    };


    /*=========================================================
      FORMAT DATE TIME
    =========================================================*/


    SightingFormatter.formatDateTime = function (

        value

    ) {

        if (

            value === undefined ||

            value === null ||

            value === ""

        ) {

            return "";

        }


        try {


            let raw =

                value;


            /*
             * Firestore Timestamp support.
             */


            if (

                value &&

                typeof value.toDate ===

                "function"

            ) {

                raw =

                    value.toDate();

            }


            else if (

                value &&

                typeof value.seconds ===

                "number"

            ) {

                raw =

                    new Date(

                        value.seconds *

                        1000

                    );

            }


            const date =

                raw instanceof Date

                    ? raw

                    : new Date(

                        raw

                    );


            if (

                Number.isNaN(

                    date.getTime()

                )

            ) {

                return String(

                    value

                );

            }


            return date.toLocaleString(

                "en-IN"

            );


        }

        catch (

            error

        ) {

            return String(

                value

            );

        }

    };


    /*=========================================================
      FORMAT DISTANCE
    =========================================================*/


    SightingFormatter.formatDistance = function (

        meters

    ) {

        const value =

            Number(

                meters

            );


        if (

            !Number.isFinite(

                value

            )

        ) {

            return "";

        }


        if (

            value < 1000

        ) {

            return (

                Math.round(

                    value

                ) +

                " m"

            );

        }


        return (

            (

                value /

                1000

            ).toFixed(

                2

            ) +

            " km"

        );

    };


    /*=========================================================
      TITLE FROM INTENT
    =========================================================*/


    SightingFormatter.getTitle = function (

        intent

    ) {

        const key =

            SightingFormatter
                .normalizeIntentKey(

                    intent

                );


        const titles = {

            SIGHTING_ACTIVE:

                "Active Elephant Sightings",

            SIGHTING_RECENT:

                "Recent Elephant Sightings",

            SIGHTING_HISTORY:

                "Elephant Sighting History",

            SIGHTING_RESOLVED:

                "Resolved Elephant Sightings",

            SIGHTING_MOVED:

                "Moved Elephant Sightings",

            SIGHTING_DRIVEN:

                "Driven Elephant Sightings",

            SIGHTING_TODAY:

                "Today's Elephant Sightings",

            SIGHTING_YESTERDAY:

                "Yesterday's Elephant Sightings",

            SIGHTING_WEEK:

                "Elephant Sightings This Week",

            SIGHTING_MONTH:

                "Elephant Sightings This Month",

            SIGHTING_SUMMARY:

                "Elephant Sighting Summary",

            SIGHTING_ANALYTICS:

                "Elephant Sighting Analytics",

            SIGHTING_HOTSPOTS:

                "Elephant Sighting Hotspots",

            HEC_SUMMARY:

                "Human-Elephant Conflict Summary",

            HEC_RISK:

                "Human-Elephant Conflict Risk",

            HEC_RISK_ANALYSIS:

                "Human-Elephant Conflict Risk Analysis",

            HEC_HOTSPOTS:

                "Human-Elephant Conflict Hotspots",

            HEC_MITIGATION:

                "HEC Mitigation",

            HEC_MITIGATION_PRIORITY:

                "HEC Mitigation Priorities",

            HEC_PREVENTION:

                "HEC Prevention",

            HEC_RESPONSE:

                "HEC Response",

            HEC_RESPONSE_PRIORITY:

                "HEC Response Priority",

            HEC_OPERATIONAL_ADVICE:

                "HEC Operational Guidance",

            DEPREDATION_SUMMARY:

                "Depredation Summary",

            DEPREDATION_ANALYTICS:

                "Depredation Analytics",

            DEPREDATION_HISTORY:

                "Depredation History",

            DEPREDATION_HOTSPOTS:

                "Depredation Hotspots",

            DEPREDATION_RISK:

                "Depredation Risk",

            SIGHTING_RESPONSE_PRIORITY:

                "Elephant Response Priority",

            SIGHTING_NEAREST_STAFF:

                "Nearest Response Staff",

            SIGHTING_RESPONSE_STAFF:

                "Response Staff",

            SIGHTING_OPERATIONAL_SUMMARY:

                "Elephant Operational Summary",

            SIGHTING_DECISION_SUPPORT:

                "Elephant Conflict Decision Support"

        };


        if (

            titles[

                key

            ]

        ) {

            return titles[

                key

            ];

        }


        if (

            !key

        ) {

            return "Elephant Sighting";

        }


        return key

            .split(

                "_"

            )

            .filter(

                Boolean

            )

            .map(

                function (

                    part

                ) {

                    return (

                        part.charAt(

                            0

                        ) +

                        part
                            .slice(

                                1

                            )
                            .toLowerCase()

                    );

                }

            )

            .join(

                " "

            );

    };


    /*=========================================================
      FORMAT ONE SIGHTING LINE
    =========================================================*/


    SightingFormatter.formatSightingLine = function (

        sighting,

        index = null

    ) {

        if (

            !sighting ||

            typeof sighting !==

            "object"

        ) {

            return "";

        }


        const id =

            SightingFormatter
                .getSightingID(

                    sighting

                );


        const status =

            SightingFormatter
                .getStatus(

                    sighting

                );


        const range =

            SightingFormatter
                .getRange(

                    sighting

                );


        const beat =

            SightingFormatter
                .getBeat(

                    sighting

                );


        const compartment =

            SightingFormatter
                .getCompartment(

                    sighting

                );


        const village =

            SightingFormatter
                .getVillage(

                    sighting

                );


        const distance =

            SightingFormatter
                .getVillageDistance(

                    sighting

                );


        const herd =

            SightingFormatter
                .getHerdSize(

                    sighting

                );


        const risk =

            SightingFormatter
                .getRisk(

                    sighting

                );


        const locationParts = [

            compartment,

            beat,

            range

        ].filter(

            Boolean

        );


        let line =

            "";


        if (

            index !== null

        ) {

            line +=

                String(

                    index + 1

                ) +

                ". ";

        }


        if (

            id

        ) {

            line +=

                "**" +

                SightingFormatter
                    .escapeMarkdown(

                        id

                    ) +

                "**";

        }

        else {

            line +=

                "**Elephant sighting**";

        }


        if (

            status

        ) {

            line +=

                " — " +

                SightingFormatter
                    .escapeMarkdown(

                        status

                    );

        }


        if (

            locationParts.length >

            0

        ) {

            line +=

                " — " +

                locationParts

                    .map(

                        SightingFormatter
                            .escapeMarkdown

                    )

                    .join(

                        ", "

                    );

        }


        if (

            village

        ) {

            line +=

                " — nearest location: " +

                SightingFormatter
                    .escapeMarkdown(

                        village

                    );


            if (

                distance !== null

            ) {

                line +=

                    " (" +

                    SightingFormatter
                        .formatDistance(

                            distance

                        ) +

                    ")";

            }

        }


        if (

            herd !== null

        ) {

            line +=

                " — elephants: " +

                herd;

        }


        if (

            risk

        ) {

            line +=

                " — risk: " +

                SightingFormatter
                    .escapeMarkdown(

                        risk

                    );

        }


        return line;

    };


    /*=========================================================
      FORMAT SINGLE SIGHTING DETAILS
    =========================================================*/


    SightingFormatter.formatSightingDetails = function (

        response,

        request

    ) {

        const data =

            SightingFormatter
                .getData(

                    response

                );


        const sighting =

            SightingFormatter
                .getSingleSighting(

                    data

                );


        if (

            !sighting

        ) {

            return {

                markdown:

                    "No matching elephant sighting was found.",

                message:

                    "No matching elephant sighting was found."

            };

        }


        const id =

            SightingFormatter
                .getSightingID(

                    sighting

                );


        const status =

            SightingFormatter
                .getStatus(

                    sighting

                );


        const division =

            SightingFormatter
                .getDivision(

                    sighting

                );


        const range =

            SightingFormatter
                .getRange(

                    sighting

                );


        const beat =

            SightingFormatter
                .getBeat(

                    sighting

                );


        const compartment =

            SightingFormatter
                .getCompartment(

                    sighting

                );


        const village =

            SightingFormatter
                .getVillage(

                    sighting

                );


        const distance =

            SightingFormatter
                .getVillageDistance(

                    sighting

                );


        const risk =

            SightingFormatter
                .getRisk(

                    sighting

                );


        const herd =

            SightingFormatter
                .getHerdSize(

                    sighting

                );


        const reporter =

            SightingFormatter
                .getReporter(

                    sighting

                );


        const timestamp =

            SightingFormatter
                .formatDateTime(

                    SightingFormatter
                        .getTimestamp(

                            sighting

                        )

                );


        const lat =

            SightingFormatter
                .getLat(

                    sighting

                );


        const lon =

            SightingFormatter
                .getLon(

                    sighting

                );


        const lines = [

            "### Elephant Sighting",

            "",

            id

                ? "**Sighting ID:** " +
                    SightingFormatter.escapeMarkdown(
                        id
                    )

                : "",

            status

                ? "**Status:** " +
                    SightingFormatter.escapeMarkdown(
                        status
                    )

                : "",

            herd !== null

                ? "**Elephants:** " +
                    herd

                : "",

            division

                ? "**Division:** " +
                    SightingFormatter.escapeMarkdown(
                        division
                    )

                : "",

            range

                ? "**Range:** " +
                    SightingFormatter.escapeMarkdown(
                        range
                    )

                : "",

            beat

                ? "**Beat:** " +
                    SightingFormatter.escapeMarkdown(
                        beat
                    )

                : "",

            compartment

                ? "**Compartment:** " +
                    SightingFormatter.escapeMarkdown(
                        compartment
                    )

                : "",

            village

                ? "**Nearest location:** " +
                    SightingFormatter.escapeMarkdown(
                        village
                    )

                : "",

            distance !== null

                ? "**Distance from nearest location:** " +
                    SightingFormatter.formatDistance(
                        distance
                    )

                : "",

            risk

                ? "**HEC risk:** " +
                    SightingFormatter.escapeMarkdown(
                        risk
                    )

                : "",

            (

                lat !== null &&

                lon !== null

            )

                ? "**GPS:** " +
                    lat.toFixed(5) +
                    ", " +
                    lon.toFixed(5)

                : "",

            timestamp

                ? "**Reported:** " +
                    SightingFormatter.escapeMarkdown(
                        timestamp
                    )

                : "",

            reporter

                ? "**Reported by:** " +
                    SightingFormatter.escapeMarkdown(
                        reporter
                    )

                : ""

        ].filter(

            function (

                line

            ) {

                return line !== "";

            }

        );


        return {

            markdown:

                lines.join(

                    "\n"

                ),

            message:

                id

                    ? "Elephant sighting " +
                        id

                    : "Elephant sighting details"

        };

    };


    /*=========================================================
      FORMAT SIGHTING LIST
    =========================================================*/


    SightingFormatter.formatSightingList = function (

        response,

        request

    ) {

        const intent =

            SightingFormatter
                .getIntent(

                    response,

                    request

                );


        const title =

            SightingFormatter
                .getTitle(

                    intent

                );


        const sightings =

            SightingFormatter
                .getSightings(

                    SightingFormatter
                        .getData(

                            response

                        )

                );


        if (

            sightings.length ===

            0

        ) {

            return {

                markdown:

                    "### " +

                    title +

                    "\n\nNo matching elephant sightings were found.",

                message:

                    "No matching elephant sightings were found."

            };

        }


        const lines = [

            "### " + title,

            "",

            "**Total:** " +
                sightings.length,

            ""

        ];


        sightings.forEach(

            function (

                sighting,

                index

            ) {

                const line =

                    SightingFormatter
                        .formatSightingLine(

                            sighting,

                            index

                        );


                if (

                    line

                ) {

                    lines.push(

                        line

                    );

                }

            }

        );


        return {

            markdown:

                lines.join(

                    "\n"

                ),

            message:

                sightings.length +

                " elephant sighting" +

                (

                    sightings.length ===

                    1

                        ? ""

                        : "s"

                ) +

                " found."

        };

    };


    /*=========================================================
      FORMAT LATEST SIGHTING
    =========================================================*/


    SightingFormatter.formatLatestSighting = function (

        response,

        request

    ) {

        return SightingFormatter
            .formatSightingDetails(

                response,

                request

            );

    };


    /*=========================================================
      FORMAT COUNT
    =========================================================*/


/*=========================================================
  FORMAT COUNT
=========================================================*/

SightingFormatter.formatCount = function (

    response,

    request

) {

    /*---------------------------------------------
      DATA
    ---------------------------------------------*/

    const data =

        SightingFormatter
            .getData(

                response

            );


    /*---------------------------------------------
      INTENT
    ---------------------------------------------*/

    const intent =

        SightingFormatter
            .getIntent(

                response,

                request

            );


    const intentKey =

        SightingFormatter
            .normalizeIntentKey(

                intent

            );


    /*---------------------------------------------
      COUNT
    ---------------------------------------------*/

    let count =

        response?.count;


    if (

        data &&

        typeof data ===
        "object" &&

        !Array.isArray(

            data

        )

    ) {

        /*
         * Prefer intent-specific canonical fields.
         *
         * This prevents elephant totals and
         * sighting-record totals from being
         * confused at presentation level.
         */

        if (

            intentKey ===
            "SIGHTING_ELEPHANT_COUNT"

        ) {

            count =

                data.elephantCount ??

                data.totalElephants ??

                data.totalSeen ??

                data.count ??

                data.total ??

                count;

        }

        else if (

            intentKey ===
            "SIGHTING_COUNT"

        ) {

            count =

                data.totalSightings ??

                data.sightingCount ??

                data.count ??

                data.total ??

                count;

        }

        else {

            count =

                data.count ??

                data.total ??

                data.totalSightings ??

                data.elephantCount ??

                count;

        }

    }


    /*
     * Array data represents records.
     *
     * Only use array length when the query layer
     * has not already supplied a canonical count.
     */

    if (

        Array.isArray(

            data

        ) &&

        (

            count === undefined ||

            count === null

        )

    ) {

        count =

            data.length;

    }


    count =

        SightingFormatter
            .safeNumber(

                count,

                0

            );


    /*---------------------------------------------
      PRESENTATION
    ---------------------------------------------*/

    let title =

        "Elephant Sightings";


    let label =

        "Total Sightings";


    let messageLabel =

        "elephant sightings";


    /*
     * Total number of elephant individuals.
     */

    if (

        intentKey ===
        "SIGHTING_ELEPHANT_COUNT"

    ) {

        title =

            "Elephants Sighted";


        label =

            "Total Elephants";


        messageLabel =

            "elephants sighted";

    }


    /*
     * Total number of sighting records/events.
     */

    else if (

        intentKey ===
        "SIGHTING_COUNT"

    ) {

        title =

            "Elephant Sightings";


        label =

            "Total Sightings";


        messageLabel =

            "elephant sightings";

    }


    /*
     * Other count-type intents such as frequency.
     */

    else {

        title =

            SightingFormatter
                .getTitle(

                    intent

                );


        label =

            "Count";


        messageLabel =

            "records";

    }


    /*---------------------------------------------
      MARKDOWN
    ---------------------------------------------*/

    const markdown =

        "### " +

        title +

        "\n\n**" +

        label +

        ":** " +

        count;


    /*---------------------------------------------
      MESSAGE
    ---------------------------------------------*/

    const message =

        count +

        " " +

        messageLabel;


    /*---------------------------------------------
      RESULT
    ---------------------------------------------*/

    return {

        markdown:

            markdown,

        message:

            message

    };

};


    /*=========================================================
      GENERIC OBJECT → MARKDOWN
    =========================================================*/


    SightingFormatter.objectToMarkdown = function (

        object,

        options = {}

    ) {

        if (

            !object ||

            typeof object !==

            "object"

        ) {

            return "";

        }


        const ignored =

            new Set([

                "sightings",

                "records",

                "items",

                "results",

                "staff",

                "hotspots",

                "recommendations",

                "mitigation",

                "actions",

                "priorities"

            ]);


        const lines = [];


        Object.keys(

            object

        ).forEach(

            function (

                key

            ) {

                if (

                    ignored.has(

                        key

                    )

                ) {

                    return;

                }


                const value =

                    object[

                        key

                    ];


                if (

                    value === undefined ||

                    value === null ||

                    value === ""

                ) {

                    return;

                }


                if (

                    typeof value ===

                    "object"

                ) {

                    return;

                }


                const label =

                    key

                        .replace(

                            /([a-z])([A-Z])/g,

                            "$1 $2"

                        )

                        .replace(

                            /_/g,

                            " "

                        )

                        .replace(

                            /\b\w/g,

                            function (

                                char

                            ) {

                                return char
                                    .toUpperCase();

                            }

                        );


                lines.push(

                    "**" +

                    SightingFormatter
                        .escapeMarkdown(

                            label

                        ) +

                    ":** " +

                    SightingFormatter
                        .escapeMarkdown(

                            value

                        )

                );

            }

        );


        return lines.join(

            "\n"

        );

    };


    /*=========================================================
      FORMAT ANALYTICS
    =========================================================*/


    SightingFormatter.formatAnalytics = function (

        response,

        request

    ) {

        const data =

            SightingFormatter
                .getData(

                    response

                );


        const title =

            SightingFormatter
                .getTitle(

                    SightingFormatter
                        .getIntent(

                            response,

                            request

                        )

                );


        if (

            !data

        ) {

            return {

                markdown:

                    "### " +
                    title +
                    "\n\nNo analytics data is available.",

                message:

                    "No analytics data is available."

            };

        }


        const lines = [

            "### " + title,

            ""

        ];


        if (

            typeof data ===

            "object" &&

            !Array.isArray(

                data

            )

        ) {

            const summary =

                SightingFormatter
                    .objectToMarkdown(

                        data

                    );


            if (

                summary

            ) {

                lines.push(

                    summary

                );

            }


            const sightings =

                SightingFormatter
                    .getSightings(

                        data

                    );


            if (

                sightings.length >

                0

            ) {

                lines.push(

                    "",

                    "#### Sightings",

                    ""

                );


                sightings.forEach(

                    function (

                        sighting,

                        index

                    ) {

                        lines.push(

                            SightingFormatter
                                .formatSightingLine(

                                    sighting,

                                    index

                                )

                        );

                    }

                );

            }

        }

        else if (

            Array.isArray(

                data

            )

        ) {

            data.forEach(

                function (

                    item,

                    index

                ) {

                    if (

                        item &&

                        typeof item ===

                        "object"

                    ) {

                        lines.push(

                            SightingFormatter
                                .formatSightingLine(

                                    item,

                                    index

                                )

                        );

                    }

                }

            );

        }


        return {

            markdown:

                lines.join(

                    "\n"

                ),

            message:

                title

        };

    };


    /*=========================================================
      FORMAT HEC
    =========================================================*/


    SightingFormatter.formatHEC = function (

        response,

        request

    ) {

        const data =

            SightingFormatter
                .getData(

                    response

                );


        const title =

            SightingFormatter
                .getTitle(

                    SightingFormatter
                        .getIntent(

                            response,

                            request

                        )

                );


        if (

            !data

        ) {

            return {

                markdown:

                    "### " +
                    title +
                    "\n\nNo HEC intelligence is available for this query.",

                message:

                    "No HEC intelligence is available."

            };

        }


        const lines = [

            "### " + title,

            ""

        ];


        const summary =

            SightingFormatter
                .objectToMarkdown(

                    data

                );


        if (

            summary

        ) {

            lines.push(

                summary

            );

        }


        const sightings =

            SightingFormatter
                .getSightings(

                    data

                );


        if (

            sightings.length >

            0

        ) {

            lines.push(

                "",

                "#### Relevant Sightings",

                ""

            );


            sightings.forEach(

                function (

                    sighting,

                    index

                ) {

                    lines.push(

                        SightingFormatter
                            .formatSightingLine(

                                sighting,

                                index

                            )

                    );

                }

            );

        }


        return {

            markdown:

                lines.join(

                    "\n"

                ),

            message:

                title

        };

    };


    /*=========================================================
      EXTRACT HOTSPOTS
    =========================================================*/


    SightingFormatter.getHotspots = function (

        data

    ) {

        if (

            Array.isArray(

                data

            )

        ) {

            return data;

        }


        if (

            !data ||

            typeof data !==

            "object"

        ) {

            return [];

        }


        const candidates = [

            data.hotspots,

            data.locations,

            data.areas,

            data.ranked,

            data.results

        ];


        for (

            const candidate of candidates

        ) {

            if (

                Array.isArray(

                    candidate

                )

            ) {

                return candidate;

            }

        }


        return [];

    };


    /*=========================================================
      FORMAT HOTSPOTS
    =========================================================*/


    SightingFormatter.formatHotspots = function (

        response,

        request

    ) {

        const data =

            SightingFormatter
                .getData(

                    response

                );


        const title =

            SightingFormatter
                .getTitle(

                    SightingFormatter
                        .getIntent(

                            response,

                            request

                        )

                );


        const hotspots =

            SightingFormatter
                .getHotspots(

                    data

                );


        if (

            hotspots.length ===

            0

        ) {

            return {

                markdown:

                    "### " +
                    title +
                    "\n\nNo hotspot data is available.",

                message:

                    "No hotspot data is available."

            };

        }


        const lines = [

            "### " + title,

            ""

        ];


        hotspots.forEach(

            function (

                hotspot,

                index

            ) {

                if (

                    hotspot === undefined ||

                    hotspot === null

                ) {

                    return;

                }


                if (

                    typeof hotspot !==

                    "object"

                ) {

                    lines.push(

                        (

                            index + 1

                        ) +

                        ". " +

                        SightingFormatter
                            .escapeMarkdown(

                                hotspot

                            )

                    );


                    return;

                }


                const name =

                    hotspot.name ||

                    hotspot.location ||

                    hotspot.village ||

                    hotspot.compartment ||

                    hotspot.beat ||

                    hotspot.range ||

                    hotspot.area ||

                    "Area";


                const count =

                    hotspot.count ??

                    hotspot.sightings ??

                    hotspot.incidents ??
                    null;


                const risk =

                    hotspot.risk ||

                    hotspot.riskLevel ||

                    hotspot.level ||

                    "";


                let line =

                    (

                        index + 1

                    ) +

                    ". **" +

                    SightingFormatter
                        .escapeMarkdown(

                            name

                        ) +

                    "**";


                if (

                    count !== null

                ) {

                    line +=

                        " — " +

                        count +

                        " event" +

                        (

                            Number(

                                count

                            ) ===

                            1

                                ? ""

                                : "s"

                        );

                }


                if (

                    risk

                ) {

                    line +=

                        " — risk: " +

                        SightingFormatter
                            .escapeMarkdown(

                                risk

                            );

                }


                lines.push(

                    line

                );

            }

        );


        return {

            markdown:

                lines.join(

                    "\n"

                ),

            message:

                hotspots.length +

                " hotspot" +

                (

                    hotspots.length ===

                    1

                        ? ""

                        : "s"

                ) +

                " identified."

        };

    };


    /*=========================================================
      GET RECOMMENDATIONS
    =========================================================*/


    SightingFormatter.getRecommendations = function (

        data

    ) {

        if (

            !data

        ) {

            return [];

        }


        if (

            Array.isArray(

                data

            )

        ) {

            return data;

        }


        if (

            typeof data !==

            "object"

        ) {

            return [];

        }


        const candidates = [

            data.recommendations,

            data.mitigation,

            data.actions,

            data.priorities,

            data.responseActions,

            data.advice

        ];


        for (

            const candidate of candidates

        ) {

            if (

                Array.isArray(

                    candidate

                )

            ) {

                return candidate;

            }

        }


        return [];

    };


    /*=========================================================
      FORMAT RECOMMENDATION
    =========================================================*/


    SightingFormatter.formatRecommendation = function (

        item,

        index

    ) {

        if (

            item === undefined ||

            item === null

        ) {

            return "";

        }


        if (

            typeof item !==

            "object"

        ) {

            return (

                (

                    index + 1

                ) +

                ". " +

                SightingFormatter
                    .escapeMarkdown(

                        item

                    )

            );

        }


        const title =

            item.title ||

            item.action ||

            item.name ||

            item.recommendation ||

            item.measure ||

            "Action";


        const priority =

            item.priority ||

            item.risk ||

            item.level ||

            "";


        const reason =

            item.reason ||

            item.description ||

            item.details ||

            "";


        let line =

            (

                index + 1

            ) +

            ". **" +

            SightingFormatter
                .escapeMarkdown(

                    title

                ) +

            "**";


        if (

            priority

        ) {

            line +=

                " — " +

                SightingFormatter
                    .escapeMarkdown(

                        priority

                    );

        }


        if (

            reason

        ) {

            line +=

                ": " +

                SightingFormatter
                    .escapeMarkdown(

                        reason

                    );

        }


        return line;

    };


    /*=========================================================
      FORMAT MITIGATION
    =========================================================*/


    SightingFormatter.formatMitigation = function (

        response,

        request

    ) {

        const data =

            SightingFormatter
                .getData(

                    response

                );


        const title =

            SightingFormatter
                .getTitle(

                    SightingFormatter
                        .getIntent(

                            response,

                            request

                        )

                );


        if (

            !data

        ) {

            return {

                markdown:

                    "### " +
                    title +
                    "\n\nNo mitigation recommendation is available.",

                message:

                    "No mitigation recommendation is available."

            };

        }


        const lines = [

            "### " + title,

            ""

        ];


        const summary =

            SightingFormatter
                .objectToMarkdown(

                    data

                );


        if (

            summary

        ) {

            lines.push(

                summary,

                ""

            );

        }


        const recommendations =

            SightingFormatter
                .getRecommendations(

                    data

                );


        if (

            recommendations.length >

            0

        ) {

            lines.push(

                "#### Recommended Actions",

                ""

            );


            recommendations.forEach(

                function (

                    recommendation,

                    index

                ) {

                    const line =

                        SightingFormatter
                            .formatRecommendation(

                                recommendation,

                                index

                            );


                    if (

                        line

                    ) {

                        lines.push(

                            line

                        );

                    }

                }

            );

        }


        return {

            markdown:

                lines.join(

                    "\n"

                ),

            message:

                title

        };

    };


    /*=========================================================
      FORMAT DEPREDATION
    =========================================================*/


    SightingFormatter.formatDepredation = function (

        response,

        request

    ) {

        const data =

            SightingFormatter
                .getData(

                    response

                );


        const title =

            SightingFormatter
                .getTitle(

                    SightingFormatter
                        .getIntent(

                            response,

                            request

                        )

                );


        if (

            !data

        ) {

            return {

                markdown:

                    "### " +
                    title +
                    "\n\nNo depredation data is available.",

                message:

                    "No depredation data is available."

            };

        }


        const lines = [

            "### " + title,

            ""

        ];


        const summary =

            SightingFormatter
                .objectToMarkdown(

                    data

                );


        if (

            summary

        ) {

            lines.push(

                summary

            );

        }


        const sightings =

            SightingFormatter
                .getSightings(

                    data

                );


        if (

            sightings.length >

            0

        ) {

            lines.push(

                "",

                "#### Related Sightings",

                ""

            );


            sightings.forEach(

                function (

                    sighting,

                    index

                ) {

                    lines.push(

                        SightingFormatter
                            .formatSightingLine(

                                sighting,

                                index

                            )

                    );

                }

            );

        }


        return {

            markdown:

                lines.join(

                    "\n"

                ),

            message:

                title

        };

    };


    /*=========================================================
      FORMAT OPERATIONAL
    =========================================================*/


    SightingFormatter.formatOperational = function (

        response,

        request

    ) {

        const data =

            SightingFormatter
                .getData(

                    response

                );


        const title =

            SightingFormatter
                .getTitle(

                    SightingFormatter
                        .getIntent(

                            response,

                            request

                        )

                );


        if (

            !data

        ) {

            return {

                markdown:

                    "### " +
                    title +
                    "\n\nNo operational data is available.",

                message:

                    "No operational data is available."

            };

        }


        const lines = [

            "### " + title,

            ""

        ];


        const summary =

            SightingFormatter
                .objectToMarkdown(

                    data

                );


        if (

            summary

        ) {

            lines.push(

                summary

            );

        }


        /*----------------------------------
          Recommendations / Priorities
        ----------------------------------*/


        const recommendations =

            SightingFormatter
                .getRecommendations(

                    data

                );


        if (

            recommendations.length >

            0

        ) {

            lines.push(

                "",

                "#### Priority Actions",

                ""

            );


            recommendations.forEach(

                function (

                    item,

                    index

                ) {

                    const line =

                        SightingFormatter
                            .formatRecommendation(

                                item,

                                index

                            );


                    if (

                        line

                    ) {

                        lines.push(

                            line

                        );

                    }

                }

            );

        }


        /*----------------------------------
          Relevant Sightings
        ----------------------------------*/


        const sightings =

            SightingFormatter
                .getSightings(

                    data

                );


        if (

            sightings.length >

            0

        ) {

            lines.push(

                "",

                "#### Relevant Sightings",

                ""

            );


            sightings.forEach(

                function (

                    sighting,

                    index

                ) {

                    lines.push(

                        SightingFormatter
                            .formatSightingLine(

                                sighting,

                                index

                            )

                    );

                }

            );

        }


        /*----------------------------------
          Staff
        ----------------------------------*/


        if (

            Array.isArray(

                data.staff

            ) &&

            data.staff.length >

            0

        ) {

            lines.push(

                "",

                "#### Response Staff",

                ""

            );


            data.staff.forEach(

                function (

                    staff,

                    index

                ) {

                    const profile =

                        staff?.profile ||

                        staff;


                    const name =

                        profile?.identity?.name ||

                        profile?.identity?.cleanName ||

                        profile?.name ||

                        profile?.cleanName ||

                        "Staff";


                    const designation =

                        profile?.identity?.designation ||

                        profile?.designation ||

                        "";


                    const distance =

                        staff?.distanceKm;


                    let line =

                        (

                            index + 1

                        ) +

                        ". **" +

                        SightingFormatter
                            .escapeMarkdown(

                                name

                            ) +

                        "**";


                    if (

                        designation

                    ) {

                        line +=

                            " — " +

                            SightingFormatter
                                .escapeMarkdown(

                                    designation

                                );

                    }


                    if (

                        Number.isFinite(

                            Number(

                                distance

                            )

                        )

                    ) {

                        line +=

                            " — " +

                            Number(

                                distance

                            ).toFixed(

                                2

                            ) +

                            " km";

                    }


                    lines.push(

                        line

                    );

                }

            );

        }


        return {

            markdown:

                lines.join(

                    "\n"

                ),

            message:

                title

        };

    };


    /*=========================================================
      GENERIC FALLBACK
    =========================================================*/


    SightingFormatter.formatGeneric = function (

        response,

        request

    ) {

        SightingFormatter
            .statistics
            .fallbacks++;


        const data =

            SightingFormatter
                .getData(

                    response

                );


        const title =

            SightingFormatter
                .getTitle(

                    SightingFormatter
                        .getIntent(

                            response,

                            request

                        )

                );


        if (

            data === undefined ||

            data === null

        ) {

            return {

                markdown:

                    response?.message ||

                    "No sighting information is available.",

                message:

                    response?.message ||

                    "No sighting information is available."

            };

        }


        const sightings =

            SightingFormatter
                .getSightings(

                    data

                );


        if (

            sightings.length >

            0

        ) {

            return SightingFormatter
                .formatSightingList(

                    response,

                    request

                );

        }


        if (

            typeof data ===

            "object"

        ) {

            const summary =

                SightingFormatter
                    .objectToMarkdown(

                        data

                    );


            return {

                markdown:

                    "### " +

                    title +

                    (

                        summary

                            ? "\n\n" +
                                summary

                            : ""

                    ),

                message:

                    title

            };

        }


        return {

            markdown:

                "### " +

                title +

                "\n\n" +

                SightingFormatter
                    .escapeMarkdown(

                        data

                    ),

            message:

                String(

                    data

                )

        };

    };


    /*=========================================================
      FORMAT ERROR
    =========================================================*/


    SightingFormatter.formatError = function (

        response

    ) {

        let message =

            response?.message ||

            "";


        if (

            !message &&

            Array.isArray(

                response?.errors

            ) &&

            response.errors.length >

            0

        ) {

            message =

                response.errors[0];

        }


        if (

            !message

        ) {

            message =

                "Unable to process the elephant sighting request.";

        }


        return {

            markdown:

                SightingFormatter
                    .escapeMarkdown(

                        message

                    ),

            message:

                message

        };

    };


    /*=========================================================
      RESOLVE FORMATTER
    =========================================================*/


    SightingFormatter.resolveFormatter = function (

        intent

    ) {

        SightingFormatter.init();


        const key =

            SightingFormatter
                .normalizeIntentKey(

                    intent

                );


        const formatterName =

            SightingFormatter
                .formatters
                .get(

                    key

                );


        if (

            !formatterName

        ) {

            return {

                name:

                    "formatGeneric",

                fn:

                    SightingFormatter
                        .formatGeneric

            };

        }


        const fn =

            SightingFormatter[

                formatterName

            ];


        if (

            typeof fn !==

            "function"

        ) {

            return {

                name:

                    "formatGeneric",

                fn:

                    SightingFormatter
                        .formatGeneric

            };

        }


        return {

            name:

                formatterName,

            fn:

                fn

        };

    };


    /*=========================================================
      CREATE OUTPUT RESPONSE
    =========================================================*/


    SightingFormatter.createOutput = function (

        response,

        formatted,

        formatterName,

        started

    ) {

        /*
         * Preserve the entire query response.
         *
         * This is important because Render, Controller,
         * Dispatcher, debugging tools, and future AI modules
         * may depend on:
         *
         * response.data
         * response.entities
         * response.parameters
         * response.context
         * response.metadata
         */


        const output = {

            ...(response || {})

        };


        output.success =

            response?.success !==

            false;


        output.source =

            response?.source ||

            "LOCAL";


        output.module =

            "SightingFormatter";


        output.domain =

            response?.domain ||

            Constants.DOMAIN ||

            "sighting";


        output.data =

            response?.data ??

            null;


        output.markdown =

            formatted?.markdown ||

            "";


        output.message =

            formatted?.message ||

            response?.message ||

            "";


        output.metadata = {

            ...(response?.metadata || {}),

            formatter:

                formatterName,

            formatterVersion:

                SightingFormatter.VERSION,

            formatterTime:

                Date.now() -

                started

        };


        return output;

    };


    /*=========================================================
      MAIN FORMAT
    =========================================================*/


    SightingFormatter.format = function (

        response,

        request = null

    ) {

        SightingFormatter.init();


        const started =

            Date.now();


        SightingFormatter
            .statistics
            .formatted++;


        SightingFormatter.lastInput =

            response;


        try {


            /*=================================================
              VALIDATE
            =================================================*/


            if (

                !response ||

                typeof response !==

                "object"

            ) {

                throw new Error(

                    "Invalid SightingQuery response."

                );

            }


            /*=================================================
              QUERY FAILURE
            =================================================*/


            if (

                response.success ===

                false

            ) {

                const formatted =

                    SightingFormatter
                        .formatError(

                            response

                        );


                const output =

                    SightingFormatter
                        .createOutput(

                            response,

                            formatted,

                            "formatError",

                            started

                        );


                SightingFormatter.lastOutput =

                    output;


                SightingFormatter
                    .statistics
                    .successes++;


                return output;

            }


            /*=================================================
              INTENT
            =================================================*/


            const intent =

                SightingFormatter
                    .getIntent(

                        response,

                        request

                    );


            /*=================================================
              RESOLVE FORMATTER
            =================================================*/


            const formatter =

                SightingFormatter
                    .resolveFormatter(

                        intent

                    );


            /*=================================================
              FORMAT
            =================================================*/


            const formatted =

                formatter.fn(

                    response,

                    request ||

                    response.request ||

                    null

                );


            /*=================================================
              CREATE CANONICAL OUTPUT
            =================================================*/


            const output =

                SightingFormatter
                    .createOutput(

                        response,

                        formatted,

                        formatter.name,

                        started

                    );


            SightingFormatter.lastOutput =

                output;


            SightingFormatter
                .statistics
                .successes++;


            return output;


        }

        catch (

            error

        ) {


            SightingFormatter
                .statistics
                .failures++;


            if (

                GG.Config?.DEBUG?.ENABLED

            ) {

                console.error(

                    "❌ SightingFormatter Error:",

                    error

                );

            }


            const fallbackResponse = {

                ...(response || {}),

                success:

                    false,

                message:

                    error.message ||

                    "Sighting formatting failed."

            };


            const formatted =

                SightingFormatter
                    .formatError(

                        fallbackResponse

                    );


            const output =

                SightingFormatter
                    .createOutput(

                        fallbackResponse,

                        formatted,

                        "formatError",

                        started

                    );


            SightingFormatter.lastOutput =

                output;


            return output;


        }

        finally {


            const executionTime =

                Date.now() -

                started;


            SightingFormatter
                .statistics
                .totalExecutionTime +=

                executionTime;


            SightingFormatter
                .statistics
                .averageExecutionTime =

                SightingFormatter
                    .statistics
                    .totalExecutionTime /

                Math.max(

                    1,

                    SightingFormatter
                        .statistics
                        .formatted

                );

        }

    };


    /*=========================================================
      FORMAT RESPONSE ALIAS
    =========================================================*/


    SightingFormatter.formatResponse = function (

        response,

        request = null

    ) {

        return SightingFormatter
            .format(

                response,

                request

            );

    };


    /*=========================================================
      CAN FORMAT
    =========================================================*/


    SightingFormatter.canFormat = function (

        intent

    ) {

        SightingFormatter.init();


        const key =

            SightingFormatter
                .normalizeIntentKey(

                    intent

                );


        return SightingFormatter
            .formatters
            .has(

                key

            );

    };


    /*=========================================================
      GET FORMATTER NAME
    =========================================================*/


    SightingFormatter.getFormatterName = function (

        intent

    ) {

        const formatter =

            SightingFormatter
                .resolveFormatter(

                    intent

                );


        return formatter.name;

    };


    /*=========================================================
      GET REGISTERED INTENTS
    =========================================================*/


    SightingFormatter.getRegisteredIntents = function () {

        SightingFormatter.init();


        return Array.from(

            SightingFormatter
                .formatters
                .keys()

        );

    };


    /*=========================================================
      VALIDATE REGISTRY
    =========================================================*/


    SightingFormatter.validateRegistry = function () {

        SightingFormatter.init();


        const results = [];


        for (

            const [

                intent,

                formatterName

            ] of

                SightingFormatter
                    .formatters
                    .entries()

        ) {

            results.push({

                intent:

                    intent,

                formatter:

                    formatterName,

                available:

                    typeof SightingFormatter[

                        formatterName

                    ] ===

                    "function"

            });

        }


        return results;

    };


    /*=========================================================
      GET MISSING FORMATTERS
    =========================================================*/


    SightingFormatter.getMissingFormatters = function () {

        return SightingFormatter
            .validateRegistry()

            .filter(

                function (

                    item

                ) {

                    return (

                        item.available !==

                        true

                    );

                }

            );

    };


    /*=========================================================
      GET STATUS
    =========================================================*/





    /*=========================================================
      RESET
    =========================================================*/


    SightingFormatter.reset = function () {


        SightingFormatter
            .formatters
            .clear();


        SightingFormatter.initialized =

            false;


        SightingFormatter.lastInput =

            null;


        SightingFormatter.lastOutput =

            null;


        SightingFormatter.statistics = {

            formatted:

                0,

            successes:

                0,

            failures:

                0,

            fallbacks:

                0,

            totalExecutionTime:

                0,

            averageExecutionTime:

                0

        };


        return SightingFormatter.init();

    };


    /*=========================================================
      INITIALIZE
    =========================================================*/


    SightingFormatter.init();


    /*=========================================================
      EXPORT
    =========================================================*/


    GG.SightingFormatter =

        SightingFormatter;


    /*=========================================================
      MODULE LOADED
    =========================================================*/


    if (

        GG.Config?.DEBUG?.ENABLED

    ) {

        console.log(

            "%cGreenGuard SightingFormatter Loaded",

            "color:#008000;font-weight:bold;",

            SightingFormatter.VERSION

        );

    }


})(window);
