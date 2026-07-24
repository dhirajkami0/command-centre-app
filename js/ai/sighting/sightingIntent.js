/*!
 * GreenGuard AI
 * sightingIntent.js
 *
 * Version: 1.0.0
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Local business-intent detector for:
 *
 * - Elephant sightings
 * - Human-Elephant Conflict (HEC)
 * - Movement monitoring
 * - Depredation
 * - Elephant driving
 * - Village exposure
 * - Conflict risk
 * - Hotspots
 * - Temporal analytics
 * - Spatial analytics
 * - Mitigation decision support
 * - Operational duty support
 * - Management summaries
 *
 * ARCHITECTURE
 * ---------------------------------------------------------
 *
 * Core.ask()
 *      ↓
 * Controller.ask()
 *      ↓
 * IntentManager.detect()
 *      ↓
 * IntentManager.detectLocal()
 *      ↓
 * SightingIntent.detect()
 *      ↓
 * SightingRouter
 *      ↓
 * SightingQuery / Analytics
 *      ↓
 * SightingFormatter
 *
 * IMPORTANT
 * ---------------------------------------------------------
 * This module ONLY:
 *
 * - classifies intent
 * - extracts entities
 * - extracts parameters
 * - establishes analytical context
 *
 * It DOES NOT:
 *
 * - read Firestore
 * - update Firestore
 * - resolve sightings
 * - move markers
 * - calculate analytics
 * - render responses
 * - enforce permissions
 */

(function (window) {

    "use strict";


    /*=====================================================
      NAMESPACE
    =====================================================*/

    const GG =

        window.GreenGuardAI =

        window.GreenGuardAI || {};


    /*=====================================================
      PREVENT DOUBLE LOADING
    =====================================================*/

    if (

        GG.SightingIntent

    ) {

        console.warn(

            "[GreenGuardAI] SightingIntent already loaded."

        );

        return;

    }


    /*=====================================================
      MODULE
    =====================================================*/

    const SightingIntent = {};


    SightingIntent.VERSION =

        "1.0.0";


    SightingIntent.DOMAIN =

        "sighting";


    /*=====================================================
      CANONICAL INTENTS
    =====================================================*/

    const INTENTS = Object.freeze({

        /*-------------------------------------------------
          BASIC SIGHTING
        -------------------------------------------------*/

        SIGHTING_PROFILE:

            "sightingProfile",

        SIGHTING_LIST:

            "sightingList",
SIGHTING_COUNT:

    "sightingCount",

        SIGHTING_LATEST:

            "sightingLatest",

        SIGHTING_ACTIVE:

            "sightingActive",

        SIGHTING_ACTIVE_COUNT:

            "sightingActiveCount",

        SIGHTING_RESOLVED:

            "sightingResolved",

        SIGHTING_MOVED:

            "sightingMoved",

        SIGHTING_DRIVEN:

            "sightingDriven",


        /*-------------------------------------------------
          LOCATION
        -------------------------------------------------*/

        SIGHTING_LOCATION:

            "sightingLocation",

        SIGHTING_NEAREST:

            "sightingNearest",

        SIGHTING_NEARBY:

            "sightingNearby",

        SIGHTING_DIVISION:

            "sightingDivision",

        SIGHTING_RANGE:

            "sightingRange",

        SIGHTING_BEAT:

            "sightingBeat",

        SIGHTING_COMPARTMENT:

            "sightingCompartment",

        SIGHTING_VILLAGE:

            "sightingVillage",


        /*-------------------------------------------------
          ELEPHANT / HERD
        -------------------------------------------------*/

        SIGHTING_HERD:

            "sightingHerd",

        SIGHTING_HERD_COUNT:

            "sightingHerdCount",

        SIGHTING_ELEPHANT_COUNT:

            "sightingElephantCount",


        /*-------------------------------------------------
          MOVEMENT
        -------------------------------------------------*/

        SIGHTING_MOVEMENT:

            "sightingMovement",

        SIGHTING_DIRECTION:

            "sightingDirection",

        SIGHTING_MOVEMENT_HISTORY:

            "sightingMovementHistory",

        SIGHTING_MOVEMENT_TREND:

            "sightingMovementTrend",


        /*-------------------------------------------------
          DEPREDATION
        -------------------------------------------------*/

        HEC_DEPREDATION:

            "hecDepredation",

        HEC_DEPREDATION_COUNT:

            "hecDepredationCount",

        HEC_DEPREDATION_HISTORY:

            "hecDepredationHistory",

        HEC_DEPREDATION_TREND:

            "hecDepredationTrend",

        HEC_DEPREDATION_HOTSPOT:

            "hecDepredationHotspot",


        /*-------------------------------------------------
          DRIVING
        -------------------------------------------------*/

        HEC_DRIVING:

            "hecDriving",

        HEC_DRIVING_HISTORY:

            "hecDrivingHistory",

        HEC_DRIVING_EFFECTIVENESS:

            "hecDrivingEffectiveness",


        /*-------------------------------------------------
          RISK
        -------------------------------------------------*/

        HEC_RISK:

            "hecRisk",

        HEC_HIGH_RISK:

            "hecHighRisk",

        HEC_RISK_SUMMARY:

            "hecRiskSummary",

        HEC_RISK_RANKING:

            "hecRiskRanking",

        HEC_RISK_TREND:

            "hecRiskTrend",


        /*-------------------------------------------------
          VILLAGE / COMMUNITY EXPOSURE
        -------------------------------------------------*/

        HEC_VILLAGE_RISK:

            "hecVillageRisk",

        HEC_VILLAGE_EXPOSURE:

            "hecVillageExposure",

        HEC_NEAREST_VILLAGE:

            "hecNearestVillage",

        HEC_VILLAGE_CONFLICT_HISTORY:

            "hecVillageConflictHistory",

        HEC_VILLAGE_RANKING:

            "hecVillageRanking",


        /*-------------------------------------------------
          HOTSPOTS
        -------------------------------------------------*/

        HEC_HOTSPOT:

            "hecHotspot",

        HEC_RANGE_HOTSPOT:

            "hecRangeHotspot",

        HEC_BEAT_HOTSPOT:

            "hecBeatHotspot",

        HEC_COMPARTMENT_HOTSPOT:

            "hecCompartmentHotspot",

        HEC_VILLAGE_HOTSPOT:

            "hecVillageHotspot",


        /*-------------------------------------------------
          ANALYTICS
        -------------------------------------------------*/

        SIGHTING_ANALYTICS:

            "sightingAnalytics",

        SIGHTING_SUMMARY:

            "sightingSummary",

        SIGHTING_TREND:

            "sightingTrend",

        SIGHTING_FREQUENCY:

            "sightingFrequency",

        SIGHTING_TEMPORAL_ANALYSIS:

            "sightingTemporalAnalysis",

        SIGHTING_SPATIAL_ANALYSIS:

            "sightingSpatialAnalysis",

        SIGHTING_DAILY_ANALYSIS:

            "sightingDailyAnalysis",

        SIGHTING_WEEKLY_ANALYSIS:

            "sightingWeeklyAnalysis",

        SIGHTING_MONTHLY_ANALYSIS:

            "sightingMonthlyAnalysis",

        SIGHTING_YEARLY_ANALYSIS:

            "sightingYearlyAnalysis",

        SIGHTING_RANGE_ANALYSIS:

            "sightingRangeAnalysis",

        SIGHTING_BEAT_ANALYSIS:

            "sightingBeatAnalysis",

        SIGHTING_VILLAGE_ANALYSIS:

            "sightingVillageAnalysis",


        /*-------------------------------------------------
          HEC ANALYTICS
        -------------------------------------------------*/

        HEC_ANALYTICS:

            "hecAnalytics",

        HEC_SUMMARY:

            "hecSummary",

        HEC_TREND:

            "hecTrend",

        HEC_FREQUENCY:

            "hecFrequency",

        HEC_SPATIAL_ANALYSIS:

            "hecSpatialAnalysis",

        HEC_TEMPORAL_ANALYSIS:

            "hecTemporalAnalysis",


        /*-------------------------------------------------
          MITIGATION
        -------------------------------------------------*/

        HEC_MITIGATION:

            "hecMitigation",

        HEC_MITIGATION_PRIORITY:

            "hecMitigationPriority",

        HEC_MITIGATION_LOCATION:

            "hecMitigationLocation",

        HEC_MITIGATION_VILLAGE:

            "hecMitigationVillage",

        HEC_MITIGATION_RANGE:

            "hecMitigationRange",

        HEC_MITIGATION_EFFECTIVENESS:

            "hecMitigationEffectiveness",

        HEC_PREVENTION:

            "hecPrevention",

        HEC_EARLY_WARNING:

            "hecEarlyWarning",


        /*-------------------------------------------------
          OPERATIONAL SUPPORT
        -------------------------------------------------*/

        HEC_OPERATIONAL:

            "hecOperational",

        HEC_RESPONSE_PRIORITY:

            "hecResponsePriority",

        HEC_PATROL_PRIORITY:

            "hecPatrolPriority",

        HEC_DUTY_SUPPORT:

            "hecDutySupport",

        HEC_RESOURCE_PRIORITY:

            "hecResourcePriority",

        HEC_ALERT_PRIORITY:

            "hecAlertPriority",


        /*-------------------------------------------------
          MANAGEMENT / DECISION SUPPORT
        -------------------------------------------------*/

        HEC_MANAGEMENT_SUMMARY:

            "hecManagementSummary",

        HEC_DECISION_SUPPORT:

            "hecDecisionSupport",

        HEC_SITUATION_REPORT:

            "hecSituationReport"

    });


    SightingIntent.INTENTS =

        INTENTS;


    /*=====================================================
      NORMALIZATION
    =====================================================*/

    function normalize(

        value

    ) {

        if (

            value === undefined ||

            value === null

        ) {

            return "";

        }


        return String(value)

            .normalize("NFKD")

            .replace(

                /[\u0300-\u036f]/g,

                ""

            )

            .toUpperCase()

            .replace(

                /[?!.,;:()[\]{}]/g,

                " "

            )

            .replace(

                /[_\/\\-]+/g,

                " "

            )

            .replace(

                /\s+/g,

                " "

            )

            .trim();

    }


    function normalizeKey(

        value

    ) {

        return normalize(value)

            .replace(

                /\s+/g,

                ""

            );

    }


    /*=====================================================
      WORD / PHRASE MATCH
    =====================================================*/

    function containsPhrase(

        query,

        phrase

    ) {

        query = normalize(query);

        phrase = normalize(phrase);


        if (

            !query ||

            !phrase

        ) {

            return false;

        }


        return (

            " " +

            query +

            " "

        ).includes(

            " " +

            phrase +

            " "

        );

    }


    function containsAny(

        query,

        values

    ) {

        return values.some(

            value =>

                containsPhrase(

                    query,

                    value

                )

        );

    }


    /*=====================================================
      BUSINESS VOCABULARY
    =====================================================*/

    const WORDS = Object.freeze({

        ELEPHANT: [

            "ELEPHANT",

            "ELEPHANTS",

            "HERD",

            "HERDS",

            "TUSKER",

            "TUSKERS",

            "HATI"

        ],

        SIGHTING: [

            "SIGHTING",

            "SIGHTINGS",

            "SIGHTED",

            "SEEN",

            "SPOTTED"

        ],

        ACTIVE: [

            "ACTIVE",

            "CURRENT",

            "LIVE",

            "ONGOING"

        ],

        RESOLVED: [

            "RESOLVED",

            "CLOSED",

            "ENDED"

        ],

        LATEST: [

            "LATEST",

            "NEWEST",

            "RECENT",

            "LAST SIGHTING"

        ],

        COUNT: [

            "COUNT",

            "HOW MANY",

            "NUMBER OF",

            "TOTAL"

        ],

        LOCATION: [

            "LOCATION",

            "WHERE",

            "POSITION",

            "LOCATED"

        ],

        NEAREST: [

            "NEAREST",

            "CLOSEST"

        ],

        NEARBY: [

            "NEARBY",

            "NEAR ME",

            "AROUND ME",

            "CLOSE TO ME"

        ],

        MOVEMENT: [

            "MOVEMENT",

            "MOVING",

            "MOVED",

            "MOVE",

            "TRAVEL",

            "TRAVELLING"

        ],

        DIRECTION: [

            "DIRECTION",

            "HEADING",

            "MOVING TOWARDS",

            "MOVING TOWARD",

            "HEADED TOWARDS",

            "HEADED TOWARD"

        ],

        DEPREDATION: [

            "DEPREDATION",

            "CROP DAMAGE",

            "CROP RAID",

            "CROP RAIDING",

            "CROP LOSS",

            "PROPERTY DAMAGE",

            "HOUSE DAMAGE",

            "DAMAGE"

        ],

        DRIVING: [

            "DRIVING",

            "DRIVEN",

            "DRIVE ELEPHANT",

            "ELEPHANT DRIVING",

            "CHASED",

            "DRIVE OPERATION"

        ],

        HEC: [

            "HEC",

            "HUMAN ELEPHANT CONFLICT",

            "ELEPHANT CONFLICT",

            "MAN ELEPHANT CONFLICT",

            "CONFLICT"

        ],

        RISK: [

            "RISK",

            "DANGER",

            "THREAT",

            "VULNERABLE",

            "VULNERABILITY",

            "EXPOSURE"

        ],

        HIGH_RISK: [

            "HIGH RISK",

            "CRITICAL RISK",

            "HIGHEST RISK",

            "MOST DANGEROUS"

        ],

        HOTSPOT: [

            "HOTSPOT",

            "HOT SPOT",

            "HOTSPOTS",

            "HOT SPOTS",

            "CLUSTER",

            "CLUSTERS",

            "CONCENTRATION"

        ],

        ANALYTICS: [

            "ANALYSIS",

            "ANALYTICS",

            "ANALYSE",

            "ANALYZE",

            "STATISTICS",

            "STATS",

            "PATTERN",

            "PATTERNS"

        ],

        TREND: [

            "TREND",

            "TRENDS",

            "INCREASING",

            "DECREASING",

            "CHANGE OVER TIME"

        ],

        FREQUENCY: [

            "FREQUENCY",

            "FREQUENT",

            "HOW OFTEN",

            "OCCURRENCE",

            "OCCURRENCES"

        ],

        HISTORY: [

            "HISTORY",

            "HISTORICAL",

            "PAST",

            "PREVIOUS"

        ],

        SUMMARY: [

            "SUMMARY",

            "SUMMARIZE",

            "OVERVIEW",

            "STATUS REPORT",

            "SITUATION"

        ],

        RANKING: [

            "RANK",

            "RANKING",

            "TOP",

            "MOST",

            "HIGHEST",

            "WORST"

        ],

        MITIGATION: [

            "MITIGATION",

            "MITIGATE",

            "REDUCE CONFLICT",

            "CONTROL CONFLICT",

            "CONFLICT REDUCTION",

            "MANAGEMENT MEASURE",

            "MANAGEMENT MEASURES"

        ],

        PREVENTION: [

            "PREVENT",

            "PREVENTION",

            "AVOID CONFLICT",

            "REDUCE RISK"

        ],

        EARLY_WARNING: [

            "EARLY WARNING",

            "WARNING",

            "ALERT",

            "ALERTING",

            "ADVANCE WARNING"

        ],

        PRIORITY: [

            "PRIORITY",

            "PRIORITIZE",

            "PRIORITISE",

            "URGENT",

            "MOST URGENT",

            "FIRST RESPONSE",

            "ATTENTION FIRST"

        ],

        RESPONSE: [

            "RESPONSE",

            "RESPOND",

            "ACTION",

            "INTERVENTION"

        ],

        PATROL: [

            "PATROL",

            "PATROLLING",

            "PATROL TEAM"

        ],

        DUTY: [

            "DUTY",

            "DUTY TEAM",

            "ON DUTY",

            "DEPREDATION DUTY"

        ],

        RESOURCE: [

            "RESOURCE",

            "RESOURCES",

            "TEAM",

            "TEAMS",

            "MANPOWER",

            "VEHICLE",

            "VEHICLES"

        ],

        EFFECTIVENESS: [

            "EFFECTIVENESS",

            "EFFECTIVE",

            "WORKING",

            "SUCCESS",

            "SUCCESSFUL",

            "RESULT"

        ],

        VILLAGE: [

            "VILLAGE",

            "VILLAGES",

            "SETTLEMENT",

            "SETTLEMENTS"

        ],

        RANGE: [

            "RANGE",

            "RANGES"

        ],

        BEAT: [

            "BEAT",

            "BEATS"

        ],

        COMPARTMENT: [

            "COMPARTMENT",

            "COMPARTMENTS",

            "COMPT"

        ],

        DIVISION: [

            "DIVISION",

            "DIVISIONS"

        ],

        DAILY: [

            "TODAY",

            "DAILY",

            "DAY"

        ],

        WEEKLY: [

            "WEEK",

            "WEEKLY",

            "THIS WEEK",

            "LAST WEEK"

        ],

        MONTHLY: [

            "MONTH",

            "MONTHLY",

            "THIS MONTH",

            "LAST MONTH"

        ],

        YEARLY: [

            "YEAR",

            "YEARLY",

            "ANNUAL",

            "ANNUALLY",

            "THIS YEAR",

            "LAST YEAR"

        ]

    });


    /*=====================================================
      GIS ENTITY EXTRACTION
    =====================================================*/

    function extractGIS(

        query

    ) {

        const result = {};


        const GIS =

            GG.GISEntities;


        if (!GIS) {

            return result;

        }


        /*
         * Existing GIS indexes are authoritative.
         *
         * We inspect known GIS names and only attach
         * confirmed matches.
         */


        try {

            if (

                typeof GIS.getRangeNames ===

                "function"

            ) {

                const ranges =

                    GIS.getRangeNames();


                for (

                    const rangeKey of ranges

                ) {

                    if (

                        containsPhrase(

                            query,

                            rangeKey

                        ) ||

                        normalizeKey(query)

                            .includes(

                                normalizeKey(

                                    rangeKey

                                )

                            )

                    ) {

                        const feature =

                            typeof GIS.searchRange ===

                                "function"

                                ? GIS.searchRange(

                                    rangeKey

                                )

                                : null;


                        result.range =

                            feature?.properties?.range ||

                            rangeKey;


                        break;

                    }

                }

            }

        }

        catch (err) {

            // GIS extraction remains non-fatal.

        }


        /*
         * Range aliases such as EDPO / NMT.
         */

        const words =

            normalize(query)

                .split(" ");


        if (

            typeof GIS.resolveRangeAlias ===

            "function"

        ) {

            for (

                const word of words

            ) {

                const resolved =

                    GIS.resolveRangeAlias(

                        word

                    );


                if (

                    resolved &&

                    normalizeKey(resolved) !==

                    normalizeKey(word)

                ) {

                    result.range =

                        resolved;

                    break;

                }

            }

        }


        /*
         * Search complete phrases against generic GIS
         * search where possible.
         */

        const tokens =

            normalize(query)

                .split(" ");


        for (

            let length =

                Math.min(

                    5,

                    tokens.length

                );

            length >= 1;

            length--

        ) {

            for (

                let start = 0;

                start <=

                tokens.length -

                length;

                start++

            ) {

                const phrase =

                    tokens

                        .slice(

                            start,

                            start +

                            length

                        )

                        .join(" ");


                try {

                    const feature =

                        typeof GIS.search ===

                            "function"

                            ? GIS.search(

                                phrase

                            )

                            : null;


                    if (!feature) {

                        continue;

                    }


                    const p =

                        feature.properties ||

                        feature;


                    if (

                        p.division &&

                        !result.division

                    ) {

                        result.division =

                            p.division;

                    }


                    if (

                        p.range &&

                        !result.range

                    ) {

                        result.range =

                            p.range;

                    }


                    if (

                        p.beat &&

                        !result.beat

                    ) {

                        result.beat =

                            p.beat;

                    }


                    if (

                        (

                            p.compartment ||

                            p.name

                        ) &&

                        !result.compartment &&

                        containsAny(

                            query,

                            WORDS.COMPARTMENT

                        )

                    ) {

                        result.compartment =

                            p.compartment ||

                            p.name;

                    }

                }

                catch (err) {

                    // Continue.

                }

            }

        }


        return result;

    }


    /*=====================================================
      SIGHTING ID EXTRACTION
    =====================================================*/

    function extractSightingId(

        originalQuery

    ) {

        if (!originalQuery) {

            return "";

        }


        /*
         * Existing sighting IDs:
         *
         * BuxaTR_WEST-EastDamanpur-2/2
         *
         * Firestore:
         *
         * BuxaTR_WEST-EastDamanpur-2__2
         */

        const direct =

            String(originalQuery)

                .match(

                    /\b[A-Za-z0-9_]+-[A-Za-z0-9_]+-\d+(?:\/|__)\d+\b/i

                );


        if (direct) {

            return direct[0]

                .replace(

                    /__/g,

                    "/"

                );

        }


        /*
         * If SightingEntities is already loaded,
         * use its canonical IDs.
         */

        const Entities =

            GG.SightingEntities;


        if (

            Entities &&

            typeof Entities.getAll ===

                "function"

        ) {

            try {

                const all =

                    Entities.getAll();


                const normalizedQuery =

                    normalizeKey(

                        originalQuery

                    );


                const match =

                    all.find(

                        function (

                            sighting

                        ) {

                            return (

                                sighting.sightingId &&

                                normalizedQuery.includes(

                                    normalizeKey(

                                        sighting.sightingId

                                    )

                                )

                            );

                        }

                    );


                if (match) {

                    return match.sightingId;

                }

            }

            catch (err) {

                // Non-fatal.

            }

        }


        return "";

    }


    /*=====================================================
      KNOWN VILLAGE EXTRACTION
    =====================================================*/

    function extractVillage(

        query

    ) {

        const GIS =

            GG.GISEntities;


        if (!GIS) {

            return "";

        }


        const tokens =

            normalize(query)

                .split(" ");


        /*
         * Prefer longer phrases.
         */

        for (

            let length =

                Math.min(

                    6,

                    tokens.length

                );

            length >= 1;

            length--

        ) {

            for (

                let start = 0;

                start <=

                tokens.length -

                length;

                start++

            ) {

                const phrase =

                    tokens

                        .slice(

                            start,

                            start +

                            length

                        )

                        .join(" ");


                try {

                    if (

                        typeof GIS
                            .searchCanonicalVillage ===

                            "function"

                    ) {

                        const village =

                            GIS.searchCanonicalVillage(

                                phrase

                            );


                        if (village) {

                            return (

                                village.name ||

                                village.village ||

                                phrase

                            );

                        }

                    }

                }

                catch (err) {

                    // Continue.

                }

            }

        }


        return "";

    }


    /*=====================================================
      SIGHTING-DATA LOCATION EXTRACTION

      Important because nearestVillage may not necessarily
      be a canonical GIS village.
    =====================================================*/

    function extractKnownSightingLocation(

        query

    ) {

        const Entities =

            GG.SightingEntities;


        if (

            !Entities ||

            typeof Entities.getAll !==

                "function"

        ) {

            return {};

        }


        try {

            const all =

                Entities.getAll();


            const queryKey =

                normalizeKey(query);


            let best = null;

            let bestLength = 0;


            all.forEach(

                function (

                    sighting

                ) {

                    const candidates = [

                        [

                            "village",

                            sighting.village

                        ],

                        [

                            "nearestVillage",

                            sighting.nearestVillage

                        ],

                        [

                            "compartment",

                            sighting.compartment

                        ],

                        [

                            "beat",

                            sighting.beat

                        ],

                        [

                            "range",

                            sighting.range

                        ],

                        [

                            "division",

                            sighting.division

                        ]

                    ];


                    candidates.forEach(

                        function (

                            candidate

                        ) {

                            const field =

                                candidate[0];


                            const value =

                                candidate[1];


                            if (!value) {

                                return;

                            }


                            const key =

                                normalizeKey(

                                    value

                                );


                            if (

                                key.length >= 3 &&

                                queryKey.includes(

                                    key

                                ) &&

                                key.length >

                                bestLength

                            ) {

                                best = {

                                    field:

                                        field,

                                    value:

                                        value

                                };


                                bestLength =

                                    key.length;

                            }

                        }

                    );

                }

            );


            if (best) {

                return {

                    [

                        best.field

                    ]:

                        best.value

                };

            }

        }

        catch (err) {

            // Non-fatal.

        }


        return {};

    }


    /*=====================================================
      TIME ENTITY EXTRACTION
    =====================================================*/

    function extractTime(

        query

    ) {

        const result = {};


        if (

            containsPhrase(

                query,

                "TODAY"

            )

        ) {

            result.period =

                "today";

        }

        else if (

            containsPhrase(

                query,

                "YESTERDAY"

            )

        ) {

            result.period =

                "yesterday";

        }

        else if (

            containsPhrase(

                query,

                "THIS WEEK"

            )

        ) {

            result.period =

                "thisWeek";

        }

        else if (

            containsPhrase(

                query,

                "LAST WEEK"

            )

        ) {

            result.period =

                "lastWeek";

        }

        else if (

            containsPhrase(

                query,

                "THIS MONTH"

            )

        ) {

            result.period =

                "thisMonth";

        }

        else if (

            containsPhrase(

                query,

                "LAST MONTH"

            )

        ) {

            result.period =

                "lastMonth";

        }

        else if (

            containsPhrase(

                query,

                "THIS YEAR"

            )

        ) {

            result.period =

                "thisYear";

        }

        else if (

            containsPhrase(

                query,

                "LAST YEAR"

            )

        ) {

            result.period =

                "lastYear";

        }


        const days =

            normalize(query)

                .match(

                    /\b(?:LAST|PAST)\s+(\d+)\s+DAYS?\b/

                );


        if (days) {

            result.lastDays =

                Number(

                    days[1]

                );

        }


        return result;

    }


    /*=====================================================
      RADIUS EXTRACTION
    =====================================================*/

    function extractRadius(

        query

    ) {

        const km =

            normalize(query)

                .match(

                    /\b(\d+(?:\.\d+)?)\s*(KM|KILOMETER|KILOMETERS|KILOMETRE|KILOMETRES)\b/

                );


        if (km) {

            return (

                Number(

                    km[1]

                ) *

                1000

            );

        }


        const metres =

            normalize(query)

                .match(

                    /\b(\d+(?:\.\d+)?)\s*(M|METER|METERS|METRE|METRES)\b/

                );


        if (metres) {

            return Number(

                metres[1]

            );

        }


        return null;

    }


    /*=====================================================
      HERD COUNT EXTRACTION
    =====================================================*/

    function extractHerdThreshold(

        query

    ) {

        const match =

            normalize(query)

                .match(

                    /\b(?:MORE THAN|OVER|ABOVE|AT LEAST)\s+(\d+)\s+(?:ELEPHANTS?|HERD)\b/

                );


        if (!match) {

            return null;

        }


        return Number(

            match[1]

        );

    }


    /*=====================================================
      CONTEXT EXTRACTION
    =====================================================*/

    function extractContext(

        query

    ) {

        return {

            currentUserScope:

                containsAny(

                    query,

                    [

                        "MY RANGE",

                        "MY BEAT",

                        "MY DIVISION",

                        "MY AREA",

                        "MY JURISDICTION"

                    ]

                ),

            currentLocation:

                containsAny(

                    query,

                    [

                        "NEAR ME",

                        "AROUND ME",

                        "CLOSE TO ME",

                        "MY LOCATION"

                    ]

                ),

            operational:

                containsAny(

                    query,

                    [

                        ...WORDS.DUTY,

                        ...WORDS.RESPONSE,

                        ...WORDS.PATROL,

                        ...WORDS.PRIORITY

                    ]

                ),

            analytical:

                containsAny(

                    query,

                    [

                        ...WORDS.ANALYTICS,

                        ...WORDS.TREND,

                        ...WORDS.HOTSPOT,

                        ...WORDS.FREQUENCY,

                        ...WORDS.RANKING

                    ]

                ),

            mitigation:

                containsAny(

                    query,

                    [

                        ...WORDS.MITIGATION,

                        ...WORDS.PREVENTION,

                        ...WORDS.EARLY_WARNING

                    ]

                )

        };

    }


    /*=====================================================
      RESULT BUILDER
    =====================================================*/

    function createResult(

        intent,

        confidence,

        entities = {},

        parameters = {},

        context = {}

    ) {

        return {

            success:

                true,

            source:

                "local",

            provider:

                "SightingIntent",

            domain:

                SightingIntent.DOMAIN,

            intent:

                intent,

            confidence:

                Math.min(

                    1,

                    Math.max(

                        0,

                        Number(

                            confidence

                        ) ||

                        0

                    )

                ),

            entities:

                entities,

            parameters:

                parameters,

            context:

                context

        };

    }


    /*=====================================================
      DETERMINE INTENT
    =====================================================*/

function determineIntent(

    query,

    entities,

    context

) {

    const has =

        function (

            group

        ) {

            return containsAny(

                query,

                group

            );

        };


    const elephant =

        has(

            WORDS.ELEPHANT

        );


    const sighting =

        has(

            WORDS.SIGHTING

        );


    const hec =

        has(

            WORDS.HEC

        );


    const analytics =

        has(

            WORDS.ANALYTICS

        );


    const trend =

        has(

            WORDS.TREND

        );


    const hotspot =

        has(

            WORDS.HOTSPOT

        );


    const ranking =

        has(

            WORDS.RANKING

        );


    const risk =

        has(

            WORDS.RISK

        );


    const mitigation =

        has(

            WORDS.MITIGATION

        );


    const prevention =

        has(

            WORDS.PREVENTION

        );


    const priority =

        has(

            WORDS.PRIORITY

        );


    const depredation =

        has(

            WORDS.DEPREDATION

        );


    const driving =

        has(

            WORDS.DRIVING

        );


    const movement =

        has(

            WORDS.MOVEMENT

        );


    const direction =

        has(

            WORDS.DIRECTION

        );


    const history =

        has(

            WORDS.HISTORY

        );


    const frequency =

        has(

            WORDS.FREQUENCY

        );


    const summary =

        has(

            WORDS.SUMMARY

        );


    const count =

        has(

            WORDS.COUNT

        );


    const effectiveness =

        has(

            WORDS.EFFECTIVENESS

        );


    /*=================================================
      MITIGATION / DECISION SUPPORT

      Highest specificity.
    =================================================*/

    if (

        mitigation &&

        effectiveness

    ) {

        return [

            INTENTS
                .HEC_MITIGATION_EFFECTIVENESS,

            0.98

        ];

    }


    if (

        driving &&

        effectiveness

    ) {

        return [

            INTENTS
                .HEC_DRIVING_EFFECTIVENESS,

            0.98

        ];

    }


    if (

        mitigation &&

        entities.village

    ) {

        return [

            INTENTS
                .HEC_MITIGATION_VILLAGE,

            0.97

        ];

    }


    if (

        mitigation &&

        entities.range

    ) {

        return [

            INTENTS
                .HEC_MITIGATION_RANGE,

            0.97

        ];

    }


    if (

        mitigation &&

        (

            entities.beat ||

            entities.compartment

        )

    ) {

        return [

            INTENTS
                .HEC_MITIGATION_LOCATION,

            0.96

        ];

    }


    if (

        mitigation &&

        priority

    ) {

        return [

            INTENTS
                .HEC_MITIGATION_PRIORITY,

            0.98

        ];

    }


    if (

        mitigation

    ) {

        return [

            INTENTS
                .HEC_MITIGATION,

            0.95

        ];

    }


    if (

        prevention

    ) {

        return [

            INTENTS
                .HEC_PREVENTION,

            0.94

        ];

    }


    if (

        has(

            WORDS.EARLY_WARNING

        )

    ) {

        return [

            INTENTS
                .HEC_EARLY_WARNING,

            0.95

        ];

    }


    /*=================================================
      OPERATIONAL PRIORITY
    =================================================*/

    if (

        priority &&

        has(

            WORDS.PATROL

        )

    ) {

        return [

            INTENTS
                .HEC_PATROL_PRIORITY,

            0.97

        ];

    }


    if (

        priority &&

        has(

            WORDS.RESOURCE

        )

    ) {

        return [

            INTENTS
                .HEC_RESOURCE_PRIORITY,

            0.96

        ];

    }


    if (

        priority &&

        has(

            WORDS.RESPONSE

        )

    ) {

        return [

            INTENTS
                .HEC_RESPONSE_PRIORITY,

            0.97

        ];

    }


    if (

        priority &&

        has(

            WORDS.EARLY_WARNING

        )

    ) {

        return [

            INTENTS
                .HEC_ALERT_PRIORITY,

            0.96

        ];

    }


    if (

        has(

            WORDS.DUTY

        ) &&

        (

            elephant ||

            sighting ||

            hec ||

            depredation

        )

    ) {

        return [

            INTENTS
                .HEC_DUTY_SUPPORT,

            0.94

        ];

    }


    /*=================================================
      DEPREDATION
    =================================================*/

    if (

        depredation &&

        hotspot

    ) {

        return [

            INTENTS
                .HEC_DEPREDATION_HOTSPOT,

            0.98

        ];

    }


    if (

        depredation &&

        trend

    ) {

        return [

            INTENTS
                .HEC_DEPREDATION_TREND,

            0.97

        ];

    }


    if (

        depredation &&

        history

    ) {

        return [

            INTENTS
                .HEC_DEPREDATION_HISTORY,

            0.96

        ];

    }


    if (

        depredation &&

        count

    ) {

        return [

            INTENTS
                .HEC_DEPREDATION_COUNT,

            0.97

        ];

    }


    if (

        depredation

    ) {

        return [

            INTENTS
                .HEC_DEPREDATION,

            0.95

        ];

    }


    /*=================================================
      DRIVING
    =================================================*/

    if (

        driving &&

        history

    ) {

        return [

            INTENTS
                .HEC_DRIVING_HISTORY,

            0.96

        ];

    }


    if (

        driving

    ) {

        return [

            INTENTS
                .HEC_DRIVING,

            0.94

        ];

    }


    /*=================================================
      HOTSPOTS
    =================================================*/

    if (

        hotspot

    ) {

        if (

            entities.village

        ) {

            return [

                INTENTS
                    .HEC_VILLAGE_HOTSPOT,

                0.98

            ];

        }


        if (

            entities.compartment

        ) {

            return [

                INTENTS
                    .HEC_COMPARTMENT_HOTSPOT,

                0.98

            ];

        }


        if (

            entities.beat

        ) {

            return [

                INTENTS
                    .HEC_BEAT_HOTSPOT,

                0.98

            ];

        }


        if (

            entities.range

        ) {

            return [

                INTENTS
                    .HEC_RANGE_HOTSPOT,

                0.98

            ];

        }


        return [

            INTENTS
                .HEC_HOTSPOT,

            0.96

        ];

    }


    /*=================================================
      VILLAGE / RISK
    =================================================*/

    if (

        has(

            WORDS.HIGH_RISK

        )

    ) {

        return [

            INTENTS
                .HEC_HIGH_RISK,

            0.98

        ];

    }


    if (

        risk &&

        ranking

    ) {

        return [

            INTENTS
                .HEC_RISK_RANKING,

            0.97

        ];

    }


    if (

        risk &&

        trend

    ) {

        return [

            INTENTS
                .HEC_RISK_TREND,

            0.97

        ];

    }


    if (

        risk &&

        summary

    ) {

        return [

            INTENTS
                .HEC_RISK_SUMMARY,

            0.96

        ];

    }


    if (

        entities.village &&

        risk

    ) {

        return [

            INTENTS
                .HEC_VILLAGE_RISK,

            0.98

        ];

    }


    if (

        entities.village &&

        history

    ) {

        return [

            INTENTS
                .HEC_VILLAGE_CONFLICT_HISTORY,

            0.96

        ];

    }


    if (

        has(

            WORDS.VILLAGE

        ) &&

        ranking

    ) {

        return [

            INTENTS
                .HEC_VILLAGE_RANKING,

            0.95

        ];

    }


    if (

        has(

            WORDS.VILLAGE

        ) &&

        has(

            WORDS.NEAREST

        )

    ) {

        return [

            INTENTS
                .HEC_NEAREST_VILLAGE,

            0.98

        ];

    }


    if (

        has(

            WORDS.VILLAGE

        ) &&

        containsPhrase(

            query,

            "EXPOSURE"

        )

    ) {

        return [

            INTENTS
                .HEC_VILLAGE_EXPOSURE,

            0.96

        ];

    }


    if (

        risk

    ) {

        return [

            INTENTS
                .HEC_RISK,

            0.91

        ];

    }


    /*=================================================
      MOVEMENT
    =================================================*/

    if (

        movement &&

        history

    ) {

        return [

            INTENTS
                .SIGHTING_MOVEMENT_HISTORY,

            0.97

        ];

    }


    if (

        movement &&

        trend

    ) {

        return [

            INTENTS
                .SIGHTING_MOVEMENT_TREND,

            0.97

        ];

    }


    if (

        direction

    ) {

        return [

            INTENTS
                .SIGHTING_DIRECTION,

            0.96

        ];

    }


    if (

        movement

    ) {

        return [

            INTENTS
                .SIGHTING_MOVEMENT,

            0.94

        ];

    }


    /*=================================================
      TEMPORAL / SPATIAL ANALYTICS
    =================================================*/

    if (

        analytics ||

        trend ||

        frequency ||

        hec

    ) {

        if (

            has(

                WORDS.DAILY

            ) &&

            analytics

        ) {

            return [

                INTENTS
                    .SIGHTING_DAILY_ANALYSIS,

                0.96

            ];

        }


        if (

            has(

                WORDS.WEEKLY

            ) &&

            analytics

        ) {

            return [

                INTENTS
                    .SIGHTING_WEEKLY_ANALYSIS,

                0.96

            ];

        }


        if (

            has(

                WORDS.MONTHLY

            ) &&

            analytics

        ) {

            return [

                INTENTS
                    .SIGHTING_MONTHLY_ANALYSIS,

                0.96

            ];

        }


        if (

            has(

                WORDS.YEARLY

            ) &&

            analytics

        ) {

            return [

                INTENTS
                    .SIGHTING_YEARLY_ANALYSIS,

                0.96

            ];

        }


        if (

            entities.range &&

            analytics

        ) {

            return [

                INTENTS
                    .SIGHTING_RANGE_ANALYSIS,

                0.97

            ];

        }


        if (

            entities.beat &&

            analytics

        ) {

            return [

                INTENTS
                    .SIGHTING_BEAT_ANALYSIS,

                0.97

            ];

        }


        if (

            entities.village &&

            analytics

        ) {

            return [

                INTENTS
                    .SIGHTING_VILLAGE_ANALYSIS,

                0.97

            ];

        }


        if (

            frequency

        ) {

            return [

                hec

                    ? INTENTS
                        .HEC_FREQUENCY

                    : INTENTS
                        .SIGHTING_FREQUENCY,

                0.94

            ];

        }


        if (

            trend

        ) {

            return [

                hec

                    ? INTENTS
                        .HEC_TREND

                    : INTENTS
                        .SIGHTING_TREND,

                0.95

            ];

        }


        if (

            containsPhrase(

                query,

                "SPATIAL"

            )

        ) {

            return [

                hec

                    ? INTENTS
                        .HEC_SPATIAL_ANALYSIS

                    : INTENTS
                        .SIGHTING_SPATIAL_ANALYSIS,

                0.96

            ];

        }


        if (

            containsPhrase(

                query,

                "TEMPORAL"

            )

        ) {

            return [

                hec

                    ? INTENTS
                        .HEC_TEMPORAL_ANALYSIS

                    : INTENTS
                        .SIGHTING_TEMPORAL_ANALYSIS,

                0.96

            ];

        }


        if (

            hec &&

            summary

        ) {

            return [

                INTENTS
                    .HEC_SUMMARY,

                0.95

            ];

        }


        if (

            hec

        ) {

            return [

                INTENTS
                    .HEC_ANALYTICS,

                0.90

            ];

        }


        if (

            analytics

        ) {

            return [

                INTENTS
                    .SIGHTING_ANALYTICS,

                0.92

            ];

        }

    }


    /*=================================================
      BASIC SIGHTING
    =================================================*/

    if (

        entities.sightingId

    ) {

        if (

            has(

                WORDS.LOCATION

            )

        ) {

            return [

                INTENTS
                    .SIGHTING_LOCATION,

                0.99

            ];

        }


        return [

            INTENTS
                .SIGHTING_PROFILE,

            0.99

        ];

    }


    if (

        has(

            WORDS.NEARBY

        )

    ) {

        return [

            INTENTS
                .SIGHTING_NEARBY,

            0.97

        ];

    }


    if (

        has(

            WORDS.NEAREST

        ) &&

        (

            elephant ||

            sighting

        )

    ) {

        return [

            INTENTS
                .SIGHTING_NEAREST,

            0.97

        ];

    }


    if (

        has(

            WORDS.LATEST

        )

    ) {

        return [

            INTENTS
                .SIGHTING_LATEST,

            0.96

        ];

    }


    if (

        has(

            WORDS.RESOLVED

        )

    ) {

        return [

            INTENTS
                .SIGHTING_RESOLVED,

            0.96

        ];

    }


    if (

        containsPhrase(

            query,

            "MOVED"

        )

    ) {

        return [

            INTENTS
                .SIGHTING_MOVED,

            0.97

        ];

    }


    if (

        containsPhrase(

            query,

            "DRIVEN"

        )

    ) {

        return [

            INTENTS
                .SIGHTING_DRIVEN,

            0.97

        ];

    }


    /*=================================================
      ACTIVE SIGHTING COUNT

      Example:
      "How many active elephant sightings are there?"

      This means number of ACTIVE sighting records,
      not number of elephants.
    =================================================*/

    if (

        has(

            WORDS.ACTIVE

        ) &&

        count

    ) {

        return [

            INTENTS
                .SIGHTING_ACTIVE_COUNT,

            0.98

        ];

    }


    if (

        has(

            WORDS.ACTIVE

        )

    ) {

        return [

            INTENTS
                .SIGHTING_ACTIVE,

            0.96

        ];

    }


    /*=================================================
      SIGHTING RECORD COUNT

      IMPORTANT:
      This MUST come before elephant-count detection.

      Examples:

      "How many elephant sightings are there?"
          -> sightingCount

      "How many sightings are there?"
          -> sightingCount

      "Sighting count"
          -> sightingCount

      "Total sightings"
          -> sightingCount

      ELEPHANT is only the subject/species here.
      The noun being counted is SIGHTING.
    =================================================*/

    /*=================================================
      COUNT SEMANTIC DISAMBIGUATION

      Distinguish:

      SIGHTING_COUNT
          = number of sighting records/events

      SIGHTING_ELEPHANT_COUNT
          = number of elephants observed
    =================================================*/

    const explicitSightingRecord =

        containsPhrase(

            query,

            "SIGHTING"

        ) ||

        containsPhrase(

            query,

            "SIGHTINGS"

        );


    const explicitElephantCount =

        containsPhrase(

            query,

            "HOW MANY ELEPHANTS"

        ) ||

        containsPhrase(

            query,

            "TOTAL ELEPHANTS"

        ) ||

        containsPhrase(

            query,

            "ELEPHANT COUNT"

        ) ||

        containsPhrase(

            query,

            "NUMBER OF ELEPHANTS"

        );


    /*---------------------------------------------
      SIGHTING RECORD COUNT
    ---------------------------------------------*/

    if (

        count &&

        explicitSightingRecord

    ) {

        return [

            INTENTS
                .SIGHTING_COUNT,

            0.98

        ];

    }


    /*---------------------------------------------
      ELEPHANT COUNT
    ---------------------------------------------*/

    if (

        explicitElephantCount

    ) {

        return [

            INTENTS
                .SIGHTING_ELEPHANT_COUNT,

            0.97

        ];

    }


    /*---------------------------------------------
      ELEPHANT COUNT FALLBACK
    ---------------------------------------------*/

    if (

        count &&

        elephant &&

        !explicitSightingRecord

    ) {

        return [

            INTENTS
                .SIGHTING_ELEPHANT_COUNT,

            0.94

        ];

    }


    /*=================================================
      ELEPHANT COUNT

      These queries ask for the NUMBER OF ELEPHANTS,
      not the number of sighting records.

      Examples:

      "How many elephants were seen?"
          -> sightingElephantCount

      "How many elephants are there?"
          -> sightingElephantCount

      "Elephant count"
          -> sightingElephantCount

      "Total elephants seen"
          -> sightingElephantCount
    =================================================*/

    if (

        containsPhrase(

            query,

            "HOW MANY ELEPHANTS"

        )

    ) {

        return [

            INTENTS
                .SIGHTING_ELEPHANT_COUNT,

            0.97

        ];

    }


    if (

        count &&

        elephant

    ) {

        return [

            INTENTS
                .SIGHTING_ELEPHANT_COUNT,

            0.94

        ];

    }


    /*=================================================
      HERD SIZE
    =================================================*/

    if (

        containsPhrase(

            query,

            "HERD SIZE"

        )

    ) {

        return [

            INTENTS
                .SIGHTING_HERD,

            0.96

        ];

    }


    /*=================================================
      LOCATION-SCOPED SIGHTINGS
    =================================================*/

    if (

        entities.compartment

    ) {

        return [

            INTENTS
                .SIGHTING_COMPARTMENT,

            0.92

        ];

    }


    if (

        entities.beat

    ) {

        return [

            INTENTS
                .SIGHTING_BEAT,

            0.92

        ];

    }


    if (

        entities.range

    ) {

        return [

            INTENTS
                .SIGHTING_RANGE,

            0.92

        ];

    }


    if (

        entities.division

    ) {

        return [

            INTENTS
                .SIGHTING_DIVISION,

            0.92

        ];

    }


    if (

        entities.village

    ) {

        return [

            INTENTS
                .SIGHTING_VILLAGE,

            0.92

        ];

    }


    /*=================================================
      SUMMARY
    =================================================*/

    if (

        summary &&

        (

            elephant ||

            sighting

        )

    ) {

        return [

            INTENTS
                .SIGHTING_SUMMARY,

            0.92

        ];

    }


    /*=================================================
      GENERIC SIGHTING LIST
    =================================================*/

    if (

        elephant ||

        sighting

    ) {

        return [

            INTENTS
                .SIGHTING_LIST,

            0.86

        ];

    }


    /*
     * HEC alone is meaningful but deliberately below
     * HIGH_CONFIDENCE so Gemini may refine it.
     */

    if (

        hec

    ) {

        return [

            INTENTS
                .HEC_SUMMARY,

            0.82

        ];

    }


    /*=================================================
      NO SIGHTING INTENT
    =================================================*/

    return [

        null,

        0

    ];

}


    /*=====================================================
      DETECT
    =====================================================*/

    SightingIntent.detect =

        function (

            originalQuery

        ) {

            const started =

                Date.now();


            const query =

                normalize(

                    originalQuery

                );


            if (!query) {

                return {

                    success:

                        false,

                    source:

                        "local",

                    provider:

                        "SightingIntent",

                    domain:

                        "unknown",

                    intent:

                        "unknown",

                    confidence:

                        0,

                    entities:

                        {},

                    parameters:

                        {},

                    context:

                        {}

                };

            }


            /*---------------------------------------------
              ENTITY EXTRACTION
            ---------------------------------------------*/

            const entities = {};


            const sightingId =

                extractSightingId(

                    originalQuery

                );


            if (sightingId) {

                entities.sightingId =

                    sightingId;

            }


            Object.assign(

                entities,

                extractGIS(

                    query

                )

            );


            const village =

                extractVillage(

                    query

                );


            if (village) {

                entities.village =

                    village;

            }


            /*
             * Existing sighting data can supplement GIS
             * extraction.
             */

            Object.assign(

                entities,

                extractKnownSightingLocation(

                    query

                )

            );


            /*---------------------------------------------
              PARAMETERS
            ---------------------------------------------*/

            const parameters =

                extractTime(

                    query

                );


            const radius =

                extractRadius(

                    query

                );


            if (

                radius !== null

            ) {

                parameters.radiusMeters =

                    radius;

            }


            const herdThreshold =

                extractHerdThreshold(

                    query

                );


            if (

                herdThreshold !== null

            ) {

                parameters.minHerd =

                    herdThreshold;

            }


            if (

                containsAny(

                    query,

                    WORDS.ACTIVE

                )

            ) {

                parameters.active =

                    true;

            }


            if (

                containsAny(

                    query,

                    WORDS.RESOLVED

                )

            ) {

                parameters.resolved =

                    true;

            }


            if (

                containsPhrase(

                    query,

                    "MOVED"

                )

            ) {

                parameters.moved =

                    true;

            }


            if (

                containsPhrase(

                    query,

                    "DRIVEN"

                )

            ) {

                parameters.driven =

                    true;

            }


            if (

                containsAny(

                    query,

                    WORDS.DEPREDATION

                )

            ) {

                parameters.depredation =

                    true;

            }


            if (

                containsAny(

                    query,

                    WORDS.DRIVING

                )

            ) {

                parameters.driving =

                    true;

            }


            if (

                containsAny(

                    query,

                    WORDS.HIGH_RISK

                )

            ) {

                parameters.highRisk =

                    true;

            }


            /*---------------------------------------------
              CONTEXT
            ---------------------------------------------*/

            const context =

                extractContext(

                    query

                );


            /*---------------------------------------------
              INTENT
            ---------------------------------------------*/

            const [

                intent,

                confidence

            ] =

                determineIntent(

                    query,

                    entities,

                    context

                );


            /*---------------------------------------------
              NO SIGHTING INTENT
            ---------------------------------------------*/

            if (!intent) {

                return {

                    success:

                        false,

                    source:

                        "local",

                    provider:

                        "SightingIntent",

                    domain:

                        "unknown",

                    intent:

                        "unknown",

                    confidence:

                        0,

                    entities:

                        {},

                    parameters:

                        {},

                    context:

                        {},

                    metadata: {

                        detectorTime:

                            Date.now() -

                            started

                    }

                };

            }


            /*---------------------------------------------
              RESULT
            ---------------------------------------------*/

            const result =

                createResult(

                    intent,

                    confidence,

                    entities,

                    parameters,

                    context

                );


            result.metadata = {

                detectorTime:

                    Date.now() -

                    started,

                version:

                    SightingIntent.VERSION

            };


            return result;

        };


    /*=====================================================
      BACKWARD/DIAGNOSTIC HELPERS
    =====================================================*/

    SightingIntent.normalize =

        normalize;


    SightingIntent.extractGIS =

        extractGIS;


    SightingIntent.extractVillage =

        extractVillage;


    SightingIntent.extractSightingId =

        extractSightingId;


    SightingIntent.extractTime =

        extractTime;


    SightingIntent.getIntents =

        function () {

            return {

                ...INTENTS

            };

        };


    /*=====================================================
      REGISTER
    =====================================================*/

    GG.SightingIntent =

        Object.freeze(

            SightingIntent

        );


    if (

        GG.Config?.DEBUG?.ENABLED

    ) {

        console.log(

            "%cGreenGuard SightingIntent Loaded",

            "color:#008000;font-weight:bold;",

            SightingIntent.VERSION

        );

    }


})(window);
