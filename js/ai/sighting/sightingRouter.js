/*!
 * GreenGuard AI
 * sightingRouter.js
 *
 * Version: 1.1.0
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Canonical business router for Elephant Sighting / HEC.
 *
 * PIPELINE
 * ---------------------------------------------------------
 *
 * Core.ask()
 *      ↓
 * Controller.ask()
 *      ↓
 * IntentManager.detect()
 *      ↓
 * SightingIntent
 *      ↓
 * AIDispatcher
 *      ↓
 * SightingRouter.route()
 *      ↓
 * SightingQuery
 *      ↓
 * SightingFormatter
 *
 * IMPORTANT
 * ---------------------------------------------------------
 *
 * This router:
 *
 * - DOES NOT detect intent
 * - DOES NOT extract entities
 * - DOES NOT read Firestore directly
 * - DOES NOT calculate GIS
 * - DOES NOT format markdown
 *
 * It only maps:
 *
 * canonical / legacy intent
 *          ↓
 * SightingQuery handler
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

        GG.SightingRouter

    ) {

        console.warn(

            "[GreenGuardAI] SightingRouter already loaded."

        );

        return;

    }


    /*=========================================================
      DEPENDENCIES
    =========================================================*/

    const SightingConstants =

        GG.SightingConstants || {};


    /*=========================================================
      MODULE
    =========================================================*/

    const SightingRouter = {};


    /*=========================================================
      VERSION
    =========================================================*/

    SightingRouter.VERSION =

        "1.1.0";


    /*=========================================================
      DOMAIN
    =========================================================*/

    SightingRouter.DOMAIN =

        SightingConstants.DOMAIN ||

        "sighting";


    /*=========================================================
      STATUS
    =========================================================*/

    SightingRouter.initialized =

        false;


    /*
     * Compatibility with AIDispatcher.dispatchSighting().
     *
     * AIDispatcher may inspect:
     *
     *     SightingRouter.loaded
     *
     * Therefore expose it explicitly.
     */

    SightingRouter.loaded =

        false;


    SightingRouter.lastRequest =

        null;


    SightingRouter.lastResponse =

        null;


    SightingRouter.lastIntent =

        null;


    SightingRouter.lastHandler =

        null;


    SightingRouter.lastCanonicalIntent =

        null;


    /*=========================================================
      STATISTICS
    =========================================================*/

    SightingRouter.statistics = {

        routed:

            0,

        successes:

            0,

        failures:

            0,

        unknownIntent:

            0,

        missingHandler:

            0,

        totalExecutionTime:

            0,

        averageExecutionTime:

            0

    };


    /*=========================================================
      ROUTE TABLE
    =========================================================*/

    SightingRouter.routes =

        new Map();


    /*=========================================================
      NORMALIZE INTENT KEY
    =========================================================*/

    /*
     * All of the following normalize to a stable key:
     *
     * sightingActiveList
     * SIGHTING_ACTIVE_LIST
     * sighting-active-list
     * sighting active list
     *
     * IMPORTANT:
     *
     * camelCase is split before uppercasing.
     *
     * Therefore:
     *
     * sightingActiveList
     *
     * becomes:
     *
     * SIGHTING_ACTIVE_LIST
     */

    SightingRouter.normalizeIntentKey = function (

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
      GET CANONICAL INTENT
    =========================================================*/

    SightingRouter.getCanonicalIntent = function (

        constantName,

        fallbackValue = ""

    ) {

        const intents =

            SightingConstants.INTENTS ||

            {};


        const value =

            intents[

                constantName

            ];


        if (

            typeof value ===

                "string" &&

            value.trim()

        ) {

            return value.trim();

        }


        if (

            fallbackValue

        ) {

            return String(

                fallbackValue

            ).trim();

        }


        return String(

            constantName ||

            ""

        ).trim();

    };


    /*=========================================================
      REGISTER ROUTE
    =========================================================*/

    SightingRouter.register = function (

        intent,

        handlerName,

        canonicalIntent = null

    ) {

        if (

            !intent ||

            !handlerName

        ) {

            return false;

        }


        const key =

            SightingRouter
                .normalizeIntentKey(

                    intent

                );


        if (

            !key

        ) {

            return false;

        }


        const canonical =

            canonicalIntent ||

            String(

                intent

            ).trim();


        SightingRouter.routes.set(

            key,

            {

                intent:

                    canonical,

                alias:

                    String(

                        intent

                    ).trim(),

                handler:

                    String(

                        handlerName

                    ).trim()

            }

        );


        return true;

    };


    /*=========================================================
      REGISTER CONSTANT ROUTE
    =========================================================*/

    /*
     * Registers:
     *
     * 1. Canonical SightingConstants value
     * 2. Constant-style name
     * 3. Optional compatibility aliases
     *
     * Example:
     *
     * SIGHTING_ACTIVE_LIST
     *      ↓
     * sightingActiveList
     *
     * aliases:
     *
     * sightingActive
     * SIGHTING_ACTIVE
     *
     * All resolve to:
     *
     * sightingActiveList
     */

    SightingRouter.registerConstant = function (

        constantName,

        handlerName,

        aliases = [],

        fallbackValue = ""

    ) {

        const canonicalIntent =

            SightingRouter
                .getCanonicalIntent(

                    constantName,

                    fallbackValue

                );


        /*----------------------------------
          Canonical Value
        ----------------------------------*/

        SightingRouter.register(

            canonicalIntent,

            handlerName,

            canonicalIntent

        );


        /*----------------------------------
          Constant-Style Alias
        ----------------------------------*/

        SightingRouter.register(

            constantName,

            handlerName,

            canonicalIntent

        );


        /*----------------------------------
          Compatibility Aliases
        ----------------------------------*/

        for (

            const alias of aliases

        ) {

            if (

                !alias

            ) {

                continue;

            }


            SightingRouter.register(

                alias,

                handlerName,

                canonicalIntent

            );

        }


        return true;

    };


    /*=========================================================
      BUILD ROUTES
    =========================================================*/

    SightingRouter.buildRoutes = function () {


        SightingRouter.routes.clear();


        /*=====================================================
          CURRENT CANONICAL SIGHTING CONSTANTS
        =====================================================*/


        /*=====================================================
          DETAILS / LIST / COUNT
        =====================================================*/

        SightingRouter.registerConstant(

            "SIGHTING_DETAILS",

            "querySightingDetails",

            [

                "SIGHTINGDETAILS",

                "sightingDetails"

            ],

            "sightingDetails"

        );


        SightingRouter.registerConstant(

            "SIGHTING_LATEST",

            "queryLatestSighting",

            [

                "SIGHTINGLATEST",

                "sightingLatest"

            ],

            "sightingLatest"

        );


        SightingRouter.registerConstant(

            "SIGHTING_LIST",

            "querySightingList",

            [

                "SIGHTINGLIST",

                "sightingList",

                "SIGHTING_SEARCH",

                "sightingSearch",

                "SIGHTING_HISTORY",

                "sightingHistory",

                "SIGHTING_RECENT",

                "sightingRecent"

            ],

            "sightingList"

        );


        SightingRouter.registerConstant(

            "SIGHTING_COUNT",

            "querySightingCount",

            [

                "SIGHTINGCOUNT",

                "sightingCount"

            ],

            "sightingCount"

        );


        /*=====================================================
          ACTIVE
        =====================================================*/

        SightingRouter.registerConstant(

            "SIGHTING_ACTIVE_LIST",

            "queryActiveSightings",

            [

                /*
                 * IMPORTANT LEGACY COMPATIBILITY
                 *
                 * Current SightingIntent previously returned:
                 *
                 *     sightingActive
                 *
                 * Keep accepting it.
                 */

                "sightingActive",

                "SIGHTING_ACTIVE",

                "SIGHTING_ACTIVE_LIST",

                "activeSightings"

            ],

            "sightingActiveList"

        );


        SightingRouter.registerConstant(

            "SIGHTING_ACTIVE_COUNT",

            "querySightingCount",

            [

                "sightingActiveCount",

                "SIGHTING_ACTIVE_COUNT"

            ],

            "sightingActiveCount"

        );


        SightingRouter.registerConstant(

            "SIGHTING_ACTIVE_NEARBY",

            "querySightingsNearLocation",

            [

                "sightingActiveNearby",

                "SIGHTING_ACTIVE_NEARBY",

                "SIGHTING_NEAR_LOCATION",

                "sightingNearLocation"

            ],

            "sightingActiveNearby"

        );


        /*=====================================================
          JURISDICTION
        =====================================================*/

        SightingRouter.registerConstant(

            "SIGHTING_BY_DIVISION",

            "queryDivisionSightings",

            [

                "SIGHTING_DIVISION",

                "sightingDivision",

                "sightingByDivision"

            ],

            "sightingByDivision"

        );


        SightingRouter.registerConstant(

            "SIGHTING_BY_RANGE",

            "queryRangeSightings",

            [

                "SIGHTING_RANGE",

                "sightingRange",

                "sightingByRange"

            ],

            "sightingByRange"

        );


        SightingRouter.registerConstant(

            "SIGHTING_BY_BEAT",

            "queryBeatSightings",

            [

                "SIGHTING_BEAT",

                "sightingBeat",

                "sightingByBeat"

            ],

            "sightingByBeat"

        );


        SightingRouter.registerConstant(

            "SIGHTING_BY_COMPARTMENT",

            "queryCompartmentSightings",

            [

                "SIGHTING_COMPARTMENT",

                "sightingCompartment",

                "sightingByCompartment"

            ],

            "sightingByCompartment"

        );


        SightingRouter.registerConstant(

            "SIGHTING_BY_VILLAGE",

            "queryVillageSightings",

            [

                "SIGHTING_VILLAGE",

                "sightingVillage",

                "SIGHTING_NEAR_VILLAGE",

                "sightingNearVillage",

                "sightingByVillage"

            ],

            "sightingByVillage"

        );


        /*=====================================================
          NEAREST / LOCATION
        =====================================================*/

        SightingRouter.registerConstant(

            "SIGHTING_NEAREST_VILLAGE",

            "querySightingsNearVillage",

            [

                "sightingNearestVillage"

            ],

            "sightingNearestVillage"

        );


        SightingRouter.registerConstant(

            "SIGHTING_NEAREST_USER",

            "querySightingsNearLocation",

            [

                "sightingNearestUser"

            ],

            "sightingNearestUser"

        );


        SightingRouter.registerConstant(

            "SIGHTING_LOCATION",

            "querySightingLocation",

            [

                "SIGHTINGLOCATION",

                "sightingLocation"

            ],

            "sightingLocation"

        );


        /*=====================================================
          HERD
        =====================================================*/

        SightingRouter.registerConstant(

            "SIGHTING_HERD",

            "queryHerdSightings",

            [

                "SIGHTINGHERD",

                "sightingHerd",

                "SIGHTING_SINGLE_ELEPHANT",

                "sightingSingleElephant"

            ],

            "sightingHerd"

        );


        SightingRouter.registerConstant(

            "SIGHTING_HERD_SIZE",

            "querySightingHerdSize",

            [

                "SIGHTINGHERDSIZE",

                "sightingHerdSize",

                "SIGHTING_ELEPHANT_COUNT",

                "sightingElephantCount"

            ],

            "sightingHerdSize"

        );


        /*=====================================================
          MOVEMENT
        =====================================================*/

        SightingRouter.registerConstant(

            "SIGHTING_MOVEMENT",

            "querySightingMovement",

            [

                "SIGHTINGMOVEMENT",

                "sightingMovement",

                "SIGHTING_MOVEMENT_HISTORY",

                "sightingMovementHistory",

                "SIGHTING_MOVEMENT_SUMMARY",

                "sightingMovementSummary"

            ],

            "sightingMovement"

        );


        SightingRouter.registerConstant(

            "SIGHTING_DIRECTION",

            "querySightingMovementDirection",

            [

                "sightingDirection",

                "SIGHTING_DIRECTION",

                "SIGHTING_MOVEMENT_DIRECTION",

                "sightingMovementDirection"

            ],

            "sightingDirection"

        );


        SightingRouter.registerConstant(

            "SIGHTING_MOVED_LIST",

            "queryMovedSightings",

            [

                "sightingMovedList",

                "SIGHTING_MOVED",

                "sightingMoved"

            ],

            "sightingMovedList"

        );


        SightingRouter.registerConstant(

            "SIGHTING_LAST_LOCATION",

            "querySightingLocation",

            [

                "sightingLastLocation"

            ],

            "sightingLastLocation"

        );


        /*=====================================================
          DRIVING / DRIVEN
        =====================================================*/

        SightingRouter.registerConstant(

            "SIGHTING_DRIVING",

            "querySightingMovement",

            [

                "sightingDriving"

            ],

            "sightingDriving"

        );


        SightingRouter.registerConstant(

            "SIGHTING_DRIVEN_LIST",

            "queryDrivenSightings",

            [

                "sightingDrivenList",

                "SIGHTING_DRIVEN",

                "sightingDriven"

            ],

            "sightingDrivenList"

        );


        /*=====================================================
          DEPREDATION
        =====================================================*/

        SightingRouter.registerConstant(

            "SIGHTING_DEPREDATION",

            "queryDepredationSummary",

            [

                "sightingDepredation",

                "DEPREDATION_SUMMARY",

                "hecDepredation"

            ],

            "sightingDepredation"

        );


        SightingRouter.registerConstant(

            "SIGHTING_DEPREDATION_LIST",

            "queryDepredationHistory",

            [

                "sightingDepredationList",

                "DEPREDATION_HISTORY"

            ],

            "sightingDepredationList"

        );


        /*=====================================================
          RISK
        =====================================================*/

        SightingRouter.registerConstant(

            "SIGHTING_HIGH_RISK",

            "querySightingRiskAssessment",

            [

                "sightingHighRisk",

                "HEC_RISK",

                "HEC_RISK_ANALYSIS",

                "sightingRisk"

            ],

            "sightingHighRisk"

        );


        SightingRouter.registerConstant(

            "SIGHTING_VILLAGE_RISK",

            "queryHECVillageRisk",

            [

                "sightingVillageRisk",

                "HEC_VILLAGE_RISK"

            ],

            "sightingVillageRisk"

        );


        SightingRouter.registerConstant(

            "SIGHTING_CONFLICT_HISTORY",

            "queryHECHistory",

            [

                "sightingConflictHistory",

                "HEC_HISTORY"

            ],

            "sightingConflictHistory"

        );


        SightingRouter.registerConstant(

            "SIGHTING_PRIORITY",

            "querySightingResponsePriority",

            [

                "sightingPriority",

                "SIGHTING_RESPONSE_PRIORITY",

                "SIGHTING_RISK_PRIORITY",

                "HEC_RESPONSE_PRIORITY"

            ],

            "sightingPriority"

        );


        SightingRouter.registerConstant(

            "SIGHTING_THREATENED_VILLAGES",

            "queryHECVillageRisk",

            [

                "sightingThreatenedVillages"

            ],

            "sightingThreatenedVillages"

        );


        /*=====================================================
          RESOLVED / STATUS
        =====================================================*/

        SightingRouter.registerConstant(

            "SIGHTING_RESOLVED_LIST",

            "queryResolvedSightings",

            [

                "sightingResolvedList",

                "SIGHTING_RESOLVED",

                "sightingResolved",

                "SIGHTING_INACTIVE",

                "sightingInactive"

            ],

            "sightingResolvedList"

        );


        SightingRouter.registerConstant(

            "SIGHTING_STATUS",

            "querySightingStatus",

            [

                "SIGHTINGSTATUS",

                "sightingStatus",

                "SIGHTING_LIFECYCLE",

                "sightingLifecycle"

            ],

            "sightingStatus"

        );


        /*=====================================================
          REPORTING STAFF
        =====================================================*/

        SightingRouter.registerConstant(

            "SIGHTING_REPORTED_BY",

            "querySightingsByStaff",

            [

                "sightingReportedBy",

                "SIGHTING_BY_STAFF",

                "sightingByStaff",

                "SIGHTING_MY",

                "sightingMy",

                "SIGHTING_MY_ACTIVE",

                "sightingMyActive"

            ],

            "sightingReportedBy"

        );


        SightingRouter.registerConstant(

            "SIGHTING_UPDATED_BY",

            "querySightingsByStaff",

            [

                "sightingUpdatedBy"

            ],

            "sightingUpdatedBy"

        );


        /*=====================================================
          SUMMARY
        =====================================================*/

        SightingRouter.registerConstant(

            "SIGHTING_SUMMARY",

            "querySightingSummary",

            [

                "SIGHTINGSUMMARY",

                "sightingSummary",

                "HEC_SUMMARY"

            ],

            "sightingSummary"

        );


        SightingRouter.registerConstant(

            "SIGHTING_OPERATIONAL_SUMMARY",

            "querySightingOperationalSummary",

            [

                "SIGHTINGOPERATIONALSUMMARY",

                "sightingOperationalSummary",

                "HEC_OPERATIONAL_ADVICE",

                "HEC_RESPONSE"

            ],

            "sightingOperationalSummary"

        );


        SightingRouter.registerConstant(

            "SIGHTING_CONFLICT_SUMMARY",

            "queryHECSummary",

            [

                "sightingConflictSummary"

            ],

            "sightingConflictSummary"

        );


        /*=====================================================
          LEGACY ANALYTICS COMPATIBILITY
        =====================================================*/

        /*
         * These are intentionally retained so older
         * SightingIntent / AI cache / Gemini results
         * do not suddenly fail after migration.
         */


        /*-----------------------------------------------------
          GIS Analytics
        -----------------------------------------------------*/

        SightingRouter.register(

            "SIGHTING_DIVISION_ANALYTICS",

            "querySightingDivisionAnalytics",

            "SIGHTING_DIVISION_ANALYTICS"

        );


        SightingRouter.register(

            "SIGHTING_RANGE_ANALYTICS",

            "querySightingRangeAnalytics",

            "SIGHTING_RANGE_ANALYTICS"

        );


        SightingRouter.register(

            "SIGHTING_BEAT_ANALYTICS",

            "querySightingBeatAnalytics",

            "SIGHTING_BEAT_ANALYTICS"

        );


        SightingRouter.register(

            "SIGHTING_COMPARTMENT_ANALYTICS",

            "querySightingCompartmentAnalytics",

            "SIGHTING_COMPARTMENT_ANALYTICS"

        );


        SightingRouter.register(

            "SIGHTING_VILLAGE_ANALYTICS",

            "querySightingVillageAnalytics",

            "SIGHTING_VILLAGE_ANALYTICS"

        );


        /*-----------------------------------------------------
          Staff Analytics
        -----------------------------------------------------*/

        SightingRouter.register(

            "SIGHTING_STAFF_ANALYTICS",

            "querySightingStaffAnalytics",

            "SIGHTING_STAFF_ANALYTICS"

        );


        SightingRouter.register(

            "SIGHTING_TEAM_ANALYTICS",

            "querySightingTeamAnalytics",

            "SIGHTING_TEAM_ANALYTICS"

        );


        /*-----------------------------------------------------
          Time
        -----------------------------------------------------*/

        SightingRouter.register(

            "SIGHTING_TODAY",

            "querySightingsToday",

            "SIGHTING_TODAY"

        );


        SightingRouter.register(

            "SIGHTING_YESTERDAY",

            "querySightingsYesterday",

            "SIGHTING_YESTERDAY"

        );


        SightingRouter.register(

            "SIGHTING_WEEK",

            "querySightingsThisWeek",

            "SIGHTING_WEEK"

        );


        SightingRouter.register(

            "SIGHTING_MONTH",

            "querySightingsThisMonth",

            "SIGHTING_MONTH"

        );


        SightingRouter.register(

            "SIGHTING_FINANCIAL_YEAR",

            "querySightingsFinancialYear",

            "SIGHTING_FINANCIAL_YEAR"

        );


        SightingRouter.register(

            "SIGHTING_TIME_ANALYTICS",

            "querySightingTimeAnalytics",

            "SIGHTING_TIME_ANALYTICS"

        );


        SightingRouter.register(

            "SIGHTING_TREND",

            "querySightingTrend",

            "SIGHTING_TREND"

        );


        /*-----------------------------------------------------
          HEC
        -----------------------------------------------------*/

        SightingRouter.register(

            "HEC_HOTSPOTS",

            "queryHECHotspots",

            "HEC_HOTSPOTS"

        );


        SightingRouter.register(

            "HEC_TREND",

            "queryHECTrend",

            "HEC_TREND"

        );


        SightingRouter.register(

            "HEC_RANGE_RISK",

            "queryHECRangeRisk",

            "HEC_RANGE_RISK"

        );


        SightingRouter.register(

            "HEC_BEAT_RISK",

            "queryHECBeatRisk",

            "HEC_BEAT_RISK"

        );


        SightingRouter.register(

            "HEC_COMPARTMENT_RISK",

            "queryHECCompartmentRisk",

            "HEC_COMPARTMENT_RISK"

        );


        SightingRouter.register(

            "HEC_MITIGATION",

            "queryHECMitigation",

            "HEC_MITIGATION"

        );


        SightingRouter.register(

            "HEC_MITIGATION_PRIORITY",

            "queryHECMitigationPriority",

            "HEC_MITIGATION_PRIORITY"

        );


        SightingRouter.register(

            "HEC_PREVENTION",

            "queryHECPrevention",

            "HEC_PREVENTION"

        );


        /*-----------------------------------------------------
          Depredation Analytics
        -----------------------------------------------------*/

        SightingRouter.register(

            "DEPREDATION_ANALYTICS",

            "queryDepredationAnalytics",

            "DEPREDATION_ANALYTICS"

        );


        SightingRouter.register(

            "DEPREDATION_HOTSPOTS",

            "queryDepredationHotspots",

            "DEPREDATION_HOTSPOTS"

        );


        SightingRouter.register(

            "DEPREDATION_RISK",

            "queryDepredationRisk",

            "DEPREDATION_RISK"

        );


        SightingRouter.register(

            "DEPREDATION_TREND",

            "queryDepredationTrend",

            "DEPREDATION_TREND"

        );


        /*-----------------------------------------------------
          Operational
        -----------------------------------------------------*/

        SightingRouter.register(

            "SIGHTING_NEAREST_STAFF",

            "querySightingNearestStaff",

            "SIGHTING_NEAREST_STAFF"

        );


        SightingRouter.register(

            "SIGHTING_RESPONSE_STAFF",

            "querySightingResponseStaff",

            "SIGHTING_RESPONSE_STAFF"

        );


        /*-----------------------------------------------------
          General Analytics
        -----------------------------------------------------*/

        SightingRouter.register(

            "SIGHTING_ANALYTICS",

            "querySightingAnalytics",

            "SIGHTING_ANALYTICS"

        );


        SightingRouter.register(

            "SIGHTING_HOTSPOTS",

            "querySightingHotspots",

            "SIGHTING_HOTSPOTS"

        );


        SightingRouter.register(

            "SIGHTING_FREQUENCY",

            "querySightingFrequency",

            "SIGHTING_FREQUENCY"

        );


        SightingRouter.register(

            "SIGHTING_RISK_ANALYTICS",

            "querySightingRiskAnalytics",

            "SIGHTING_RISK_ANALYTICS"

        );


        SightingRouter.register(

            "SIGHTING_CONFLICT_ANALYTICS",

            "querySightingConflictAnalytics",

            "SIGHTING_CONFLICT_ANALYTICS"

        );


        SightingRouter.register(

            "SIGHTING_RISK_ASSESSMENT",

            "querySightingRiskAssessment",

            "SIGHTING_RISK_ASSESSMENT"

        );


        SightingRouter.register(

            "SIGHTING_PRIORITY_ANALYSIS",

            "querySightingPriorityAnalysis",

            "SIGHTING_PRIORITY_ANALYSIS"

        );


        SightingRouter.register(

            "SIGHTING_DECISION_SUPPORT",

            "querySightingDecisionSupport",

            "SIGHTING_DECISION_SUPPORT"

        );


        return SightingRouter.routes;

    };


    /*=========================================================
      REGISTER ROUTES
    =========================================================*/

    /*
     * AIDispatcher.dispatchSighting() may call this.
     *
     * Safe to call repeatedly.
     */

    SightingRouter.registerRoutes = function () {

        SightingRouter.buildRoutes();

        SightingRouter.initialized =

            true;

        SightingRouter.loaded =

            true;


        return SightingRouter.routes;

    };


    /*=========================================================
      INITIALIZE
    =========================================================*/

    SightingRouter.init = function () {

        if (

            SightingRouter.initialized ===

            true

        ) {

            return true;

        }


        SightingRouter.buildRoutes();


        SightingRouter.initialized =

            true;


        SightingRouter.loaded =

            true;


        if (

            GG.Config?.DEBUG?.ENABLED

        ) {

            console.log(

                "%cGreenGuard SightingRouter Ready",

                "color:#008000;font-weight:bold;",

                SightingRouter.routes.size,

                "route keys"

            );

        }


        return true;

    };


    /*=========================================================
      INITIALIZE ALIAS
    =========================================================*/

    /*
     * Your AIDispatcher currently supports:
     *
     *     SightingRouter.initialize()
     *
     * Preserve that contract.
     */

    SightingRouter.initialize = function () {

        return SightingRouter.init();

    };


    /*=========================================================
      RESOLVE INTENT
    =========================================================*/

    SightingRouter.resolveIntent = function (

        request

    ) {

        if (

            !request ||

            typeof request !==

            "object"

        ) {

            return "";

        }


        /*
         * Prefer request.intent because AIDispatcher
         * already normalizes detectedIntent into it.
         */

        return (

            request.intent ||

            request.detectedIntent?.intent ||

            ""

        );

    };


    /*=========================================================
      RESOLVE ROUTE
    =========================================================*/

    SightingRouter.resolveRoute = function (

        intent

    ) {

        SightingRouter.init();


        const key =

            SightingRouter
                .normalizeIntentKey(

                    intent

                );


        if (

            !key

        ) {

            return null;

        }


        return (

            SightingRouter.routes.get(

                key

            ) ||

            null

        );

    };


    /*=========================================================
      RESOLVE HANDLER
    =========================================================*/

    SightingRouter.resolveHandler = function (

        route

    ) {

        if (

            !route ||

            !route.handler

        ) {

            return null;

        }


        const handlerName =

            route.handler;


        /*-----------------------------------------------------
          CONTRACT 1

          Global GreenGuardAI query function:

          GG.queryActiveSightings()
        -----------------------------------------------------*/

        if (

            typeof GG[

                handlerName

            ] ===

            "function"

        ) {

            return {

                name:

                    handlerName,

                source:

                    "GreenGuardAI",

                fn:

                    GG[

                        handlerName

                    ]

            };

        }


        /*-----------------------------------------------------
          CONTRACT 2

          Module method:

          GG.SightingQuery.queryActiveSightings()
        -----------------------------------------------------*/

        if (

            GG.SightingQuery &&

            typeof GG.SightingQuery[

                handlerName

            ] ===

            "function"

        ) {

            return {

                name:

                    handlerName,

                source:

                    "SightingQuery",

                fn:

                    GG.SightingQuery[

                        handlerName

                    ].bind(

                        GG.SightingQuery

                    )

            };

        }


        return null;

    };


    /*=========================================================
      CAN HANDLE
    =========================================================*/

    SightingRouter.canHandle = function (

        request

    ) {

        SightingRouter.init();


        const intent =

            typeof request ===

                "string"

                ? request

                : SightingRouter
                    .resolveIntent(

                        request

                    );


        const route =

            SightingRouter
                .resolveRoute(

                    intent

                );


        if (

            !route

        ) {

            return false;

        }


        return !!SightingRouter
            .resolveHandler(

                route

            );

    };


    /*=========================================================
      CREATE FAILURE RESPONSE
    =========================================================*/

    SightingRouter.createFailureResponse = function (

        request,

        message,

        code

    ) {

        return {

            success:

                false,

            local:

                true,

            source:

                "LOCAL",

            provider:

                "SightingRouter",

            module:

                "SightingRouter",

            domain:

                request?.domain ||

                SightingRouter.DOMAIN,

            intent:

                SightingRouter
                    .resolveIntent(

                        request

                    ) ||

                null,

            confidence:

                Number(

                    request?.confidence ||

                    request
                        ?.detectedIntent
                        ?.confidence ||

                    0

                ),

            query:

                request?.originalQuery ||

                request?.query ||

                "",

            entities:

                request?.entities ||

                {},

            parameters:

                request?.parameters ||

                {},

            context:

                request?.context ||

                {},

            detectedIntent:

                request?.detectedIntent ||

                null,

            data:

                null,

            count:

                0,

            message:

                message ||

                "Sighting request could not be routed.",

            errorCode:

                code ||

                "SIGHTING_ROUTER_ERROR",

            metadata: {

                version:

                    SightingRouter.VERSION,

                router:

                    "SightingRouter",

                timestamp:

                    Date.now()

            }

        };

    };


    /*=========================================================
      NORMALIZE SUCCESS RESPONSE
    =========================================================*/

    SightingRouter.normalizeResponse = function (

        response,

        request,

        route,

        handler,

        started

    ) {

        /*
         * Do not destroy formatter/query output.
         *
         * Add only missing canonical metadata.
         */

        if (

            response === null ||

            response === undefined

        ) {

            return response;

        }


        /*
         * Some query handlers could theoretically
         * return an array. Preserve it rather than
         * mutating an Array as the final response.
         */

        if (

            typeof response !==

                "object" ||

            Array.isArray(

                response

            )

        ) {

            return {

                success:

                    true,

                local:

                    true,

                source:

                    "LOCAL",

                provider:

                    "SightingRouter",

                module:

                    "SightingRouter",

                domain:

                    SightingRouter.DOMAIN,

                intent:

                    route.intent,

                data:

                    response,

                request:

                    request,

                detectedIntent:

                    request.detectedIntent ||

                    null,

                metadata: {

                    version:

                        SightingRouter.VERSION,

                    router:

                        "SightingRouter",

                    handler:

                        handler.name,

                    handlerSource:

                        handler.source,

                    executionTime:

                        Date.now() -

                        started

                }

            };

        }


        response.success =

            response.success !==

            false;


        response.local =

            response.local !==

            false;


        response.source =

            response.source ||

            "LOCAL";


        response.provider =

            response.provider ||

            "SightingRouter";


        response.module =

            response.module ||

            "SightingRouter";


        response.domain =

            response.domain ||

            SightingRouter.DOMAIN;


        response.intent =

            response.intent ||

            route.intent;


        response.query =

            response.query ||

            request.query ||

            "";


        response.entities =

            response.entities ||

            request.entities ||

            {};


        response.parameters =

            response.parameters ||

            request.parameters ||

            {};


        response.context =

            response.context ||

            request.context ||

            {};


        response.detectedIntent =

            response.detectedIntent ||

            request.detectedIntent ||

            null;


        response.request =

            response.request ||

            request;


        response.metadata =

            response.metadata ||

            {};


        response.metadata.version =

            response.metadata.version ||

            SightingRouter.VERSION;


        response.metadata.router =

            response.metadata.router ||

            "SightingRouter";


        response.metadata.handler =

            response.metadata.handler ||

            handler.name;


        response.metadata.handlerSource =

            response.metadata.handlerSource ||

            handler.source;


        response.metadata.canonicalIntent =

            response.metadata.canonicalIntent ||

            route.intent;


        response.metadata.executionTime =

            response.metadata.executionTime ??

            (

                Date.now() -

                started

            );


        return response;

    };


    /*=========================================================
      ROUTE
    =========================================================*/

    SightingRouter.route = async function (

        request

    ) {

        SightingRouter.init();


        const started =

            Date.now();


        SightingRouter.statistics.routed++;


        try {


            /*=================================================
              VALIDATE REQUEST
            =================================================*/

            if (

                !request ||

                typeof request !==

                "object"

            ) {

                throw new Error(

                    "Invalid sighting request."

                );

            }


            /*=================================================
              NORMALIZE REQUEST CONTAINERS
            =================================================*/

            request.entities =

                request.entities ||

                {};


            request.parameters =

                request.parameters ||

                {};


            request.context =

                request.context ||

                {};


            request.domain =

                request.domain ||

                SightingRouter.DOMAIN;


            /*=================================================
              RESOLVE INTENT
            =================================================*/

            const incomingIntent =

                SightingRouter
                    .resolveIntent(

                        request

                    );


            if (

                !incomingIntent

            ) {

                SightingRouter
                    .statistics
                    .unknownIntent++;


                return SightingRouter
                    .createFailureResponse(

                        request,

                        "Sighting intent missing.",

                        "SIGHTING_INTENT_MISSING"

                    );

            }


            SightingRouter.lastIntent =

                incomingIntent;


            /*=================================================
              RESOLVE ROUTE
            =================================================*/

            const route =

                SightingRouter
                    .resolveRoute(

                        incomingIntent

                    );


            if (

                !route

            ) {

                SightingRouter
                    .statistics
                    .unknownIntent++;


                return SightingRouter
                    .createFailureResponse(

                        request,

                        "Unsupported sighting intent: " +

                        incomingIntent,

                        "SIGHTING_INTENT_UNSUPPORTED"

                    );

            }


            SightingRouter.lastCanonicalIntent =

                route.intent;


            /*=================================================
              RESOLVE QUERY HANDLER
            =================================================*/

            const handler =

                SightingRouter
                    .resolveHandler(

                        route

                    );


            if (

                !handler

            ) {

                SightingRouter
                    .statistics
                    .missingHandler++;


                return SightingRouter
                    .createFailureResponse(

                        request,

                        "Sighting query handler unavailable: " +

                        route.handler,

                        "SIGHTING_HANDLER_MISSING"

                    );

            }


            /*=================================================
              CANONICAL REQUEST

              Preserve all IntentManager data.

              IMPORTANT:

              We canonicalize request.intent here.

              Example:

              incoming:
                  sightingActive

              canonical:
                  sightingActiveList
            =================================================*/

            const routedRequest = {

                ...request,

                domain:

                    SightingRouter.DOMAIN,

                intent:

                    route.intent ||

                    incomingIntent,

                entities: {

                    ...(request.entities || {})

                },

                parameters: {

                    ...(request.parameters || {})

                },

                context: {

                    ...(request.context || {})

                }

            };


            /*
             * Preserve original detector intent for
             * diagnostics and backward compatibility.
             */

            routedRequest.originalIntent =

                request.originalIntent ||

                incomingIntent;


            SightingRouter.lastRequest =

                routedRequest;


            SightingRouter.lastHandler =

                handler.name;


            /*=================================================
              DEBUG
            =================================================*/

            if (

                GG.Config?.DEBUG?.ENABLED

            ) {

                console.group(

                    "🐘 SIGHTING ROUTER"

                );


                console.log(

                    "Incoming Intent:",

                    incomingIntent

                );


                console.log(

                    "Canonical Intent:",

                    route.intent

                );


                console.log(

                    "Handler:",

                    handler.name

                );


                console.log(

                    "Handler Source:",

                    handler.source

                );


                console.log(

                    "Entities:",

                    routedRequest.entities

                );


                console.log(

                    "Parameters:",

                    routedRequest.parameters

                );


                console.log(

                    "Context:",

                    routedRequest.context

                );


                console.groupEnd();

            }


            /*=================================================
              EXECUTE QUERY
            =================================================*/

            let response =

                await handler.fn(

                    routedRequest

                );


            /*=================================================
              VALIDATE RESPONSE
            =================================================*/

            if (

                response === undefined

            ) {

                throw new Error(

                    "Sighting query handler returned undefined."

                );

            }


            /*=================================================
              NORMALIZE RESPONSE METADATA

              IMPORTANT:

              This does NOT format the response again.

              SightingQuery / SightingFormatter output is
              preserved.
            =================================================*/

            response =

                SightingRouter
                    .normalizeResponse(

                        response,

                        routedRequest,

                        route,

                        handler,

                        started

                    );


            SightingRouter.lastResponse =

                response;


            if (

                response?.success ===

                true

            ) {

                SightingRouter
                    .statistics
                    .successes++;

            }

            else {

                SightingRouter
                    .statistics
                    .failures++;

            }


            return response;


        }

        catch (

            error

        ) {


            SightingRouter
                .statistics
                .failures++;


            console.error(

                "❌ SightingRouter Error:",

                error

            );


            return SightingRouter
                .createFailureResponse(

                    request,

                    error?.message ||

                    "Sighting router execution failed.",

                    "SIGHTING_ROUTER_EXCEPTION"

                );


        }

        finally {


            const executionTime =

                Date.now() -

                started;


            SightingRouter
                .statistics
                .totalExecutionTime +=

                executionTime;


            SightingRouter
                .statistics
                .averageExecutionTime =

                SightingRouter
                    .statistics
                    .totalExecutionTime /

                Math.max(

                    1,

                    SightingRouter
                        .statistics
                        .routed

                );

        }

    };


    /*=========================================================
      DISPATCH ALIAS
    =========================================================*/

    SightingRouter.dispatch = async function (

        request

    ) {

        return SightingRouter.route(

            request

        );

    };


    /*=========================================================
      HANDLE ALIAS
    =========================================================*/

    SightingRouter.handle = async function (

        request

    ) {

        return SightingRouter.route(

            request

        );

    };


    /*=========================================================
      GET ROUTE
    =========================================================*/

    SightingRouter.getRoute = function (

        intent

    ) {

        return SightingRouter
            .resolveRoute(

                intent

            );

    };


    /*=========================================================
      GET HANDLER NAME
    =========================================================*/

    SightingRouter.getHandlerName = function (

        intent

    ) {

        const route =

            SightingRouter
                .resolveRoute(

                    intent

                );


        return (

            route?.handler ||

            null

        );

    };


    /*=========================================================
      GET CANONICAL INTENT FOR ALIAS
    =========================================================*/

    SightingRouter.resolveCanonicalIntent = function (

        intent

    ) {

        const route =

            SightingRouter
                .resolveRoute(

                    intent

                );


        return (

            route?.intent ||

            null

        );

    };


    /*=========================================================
      GET REGISTERED INTENTS
    =========================================================*/

    SightingRouter.getRegisteredIntents = function () {

        SightingRouter.init();


        return Array.from(

            SightingRouter.routes.values()

        )

            .map(

                function (

                    route

                ) {

                    return route.intent;

                }

            )

            .filter(

                function (

                    value,

                    index,

                    array

                ) {

                    return (

                        array.indexOf(

                            value

                        ) ===

                        index

                    );

                }

            );

    };


    /*=========================================================
      GET ROUTES
    =========================================================*/

    SightingRouter.getRoutes = function () {

        SightingRouter.init();


        return Array.from(

            SightingRouter.routes.entries()

        )

            .map(

                function (

                    entry

                ) {

                    return {

                        key:

                            entry[0],

                        intent:

                            entry[1].intent,

                        alias:

                            entry[1].alias,

                        handler:

                            entry[1].handler

                    };

                }

            );

    };


    /*=========================================================
      VALIDATE ROUTES
    =========================================================*/

    SightingRouter.validateRoutes = function () {

        SightingRouter.init();


        const result = [];


        const seen =

            new Set();


        for (

            const route of

                SightingRouter.routes.values()

        ) {


            const uniqueKey =

                route.intent +

                "::" +

                route.handler;


            if (

                seen.has(

                    uniqueKey

                )

            ) {

                continue;

            }


            seen.add(

                uniqueKey

            );


            const handler =

                SightingRouter
                    .resolveHandler(

                        route

                    );


            result.push({

                intent:

                    route.intent,

                handler:

                    route.handler,

                available:

                    !!handler,

                source:

                    handler?.source ||

                    ""

            });

        }


        return result;

    };


    /*=========================================================
      GET MISSING HANDLERS
    =========================================================*/

    SightingRouter.getMissingHandlers = function () {

        return SightingRouter
            .validateRoutes()

            .filter(

                function (

                    route

                ) {

                    return (

                        route.available !==

                        true

                    );

                }

            );

    };


    /*=========================================================
      VALIDATE CURRENT CONSTANTS
    =========================================================*/

    /*
     * Shows whether every current
     * SightingConstants.INTENTS value resolves.
     */

    SightingRouter.validateConstants = function () {

        SightingRouter.init();


        const intents =

            SightingConstants.INTENTS ||

            {};


        return Object.entries(

            intents

        ).map(

            function (

                entry

            ) {

                const constantName =

                    entry[0];


                const intentValue =

                    entry[1];


                const route =

                    SightingRouter
                        .resolveRoute(

                            intentValue

                        );


                const handler =

                    route

                        ? SightingRouter
                            .resolveHandler(

                                route

                            )

                        : null;


                return {

                    constant:

                        constantName,

                    intent:

                        intentValue,

                    registered:

                        !!route,

                    canonicalIntent:

                        route?.intent ||

                        null,

                    handler:

                        route?.handler ||

                        null,

                    handlerAvailable:

                        !!handler

                };

            }

        );

    };


    /*=========================================================
      GET UNREGISTERED CONSTANTS
    =========================================================*/

    SightingRouter.getUnregisteredConstants = function () {

        return SightingRouter
            .validateConstants()

            .filter(

                function (

                    item

                ) {

                    return (

                        item.registered !==

                        true

                    );

                }

            );

    };


    /*=========================================================
      GET STATUS
    =========================================================*/

    SightingRouter.getStatus = function () {

        SightingRouter.init();


        const validation =

            SightingRouter
                .validateRoutes();


        const constantsValidation =

            SightingRouter
                .validateConstants();


        const available =

            validation.filter(

                function (

                    item

                ) {

                    return item.available;

                }

            ).length;


        const missing =

            validation.length -

            available;


        const constantsRegistered =

            constantsValidation.filter(

                function (

                    item

                ) {

                    return item.registered;

                }

            ).length;


        return {

            loaded:

                SightingRouter.loaded,

            initialized:

                SightingRouter.initialized,

            version:

                SightingRouter.VERSION,

            domain:

                SightingRouter.DOMAIN,

            routeKeys:

                SightingRouter.routes.size,

            canonicalRoutes:

                validation.length,

            availableHandlers:

                available,

            missingHandlers:

                missing,

            sightingConstants:

                constantsValidation.length,

            registeredConstants:

                constantsRegistered,

            unregisteredConstants:

                constantsValidation.length -

                constantsRegistered,

            lastIntent:

                SightingRouter.lastIntent,

            lastCanonicalIntent:

                SightingRouter
                    .lastCanonicalIntent,

            lastHandler:

                SightingRouter.lastHandler,

            statistics: {

                ...SightingRouter.statistics

            }

        };

    };


    /*=========================================================
      RESET
    =========================================================*/

    SightingRouter.reset = function () {


        SightingRouter.routes.clear();


        SightingRouter.initialized =

            false;


        SightingRouter.loaded =

            false;


        SightingRouter.lastRequest =

            null;


        SightingRouter.lastResponse =

            null;


        SightingRouter.lastIntent =

            null;


        SightingRouter.lastCanonicalIntent =

            null;


        SightingRouter.lastHandler =

            null;


        SightingRouter.statistics = {

            routed:

                0,

            successes:

                0,

            failures:

                0,

            unknownIntent:

                0,

            missingHandler:

                0,

            totalExecutionTime:

                0,

            averageExecutionTime:

                0

        };


        return SightingRouter.init();

    };


    /*=========================================================
      INITIALIZE
    =========================================================*/

    SightingRouter.init();


    /*=========================================================
      EXPORT
    =========================================================*/

    GG.SightingRouter =

        SightingRouter;


    /*=========================================================
      MODULE LOADED
    =========================================================*/

    if (

        GG.Config?.DEBUG?.ENABLED

    ) {

        console.log(

            "%cGreenGuard SightingRouter Loaded",

            "color:#008000;font-weight:bold;",

            SightingRouter.VERSION

        );

    }


})(window);
