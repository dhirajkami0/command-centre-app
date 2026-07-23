/*!
 * GreenGuard AI
 * sightingRouter.js
 *
 * Version: 1.0.0
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Canonical business router for:
 *
 * - Elephant sightings
 * - Active sightings
 * - Sighting history
 * - Movement / driven / resolved sightings
 * - Range / beat / compartment sighting queries
 * - HEC analytics
 * - Human-Elephant Conflict mitigation
 * - Depredation analysis
 * - Risk / hotspot analysis
 * - Response prioritization
 * - Operational sighting intelligence
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
 * This module DOES NOT:
 *
 * - detect intent
 * - extract entities
 * - query Firestore directly
 * - calculate GIS polygons
 * - calculate analytics
 * - format final markdown
 *
 * It ONLY:
 *
 *      canonical intent
 *              ↓
 *      canonical query handler
 *
 * This keeps the Sighting domain aligned with the
 * existing GreenGuard Staff architecture.
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

        "1.0.0";


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


    SightingRouter.lastRequest =

        null;


    SightingRouter.lastResponse =

        null;


    SightingRouter.lastIntent =

        null;


    SightingRouter.lastHandler =

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
      REGISTER ROUTE
    =========================================================*/


    SightingRouter.register = function (

        intent,

        handlerName

    ) {

        if (

            !intent ||

            !handlerName

        ) {

            return false;

        }


        const canonicalIntent =

            String(

                intent

            ).trim();


        const key =

            SightingRouter
                .normalizeIntentKey(

                    canonicalIntent

                );


        if (

            !key

        ) {

            return false;

        }


        SightingRouter.routes.set(

            key,

            {

                intent:

                    canonicalIntent,

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


    SightingRouter.registerConstant = function (

        constantName,

        handlerName

    ) {

        const intents =

            SightingConstants.INTENTS ||

            {};


        /*
         * Preferred:
         *
         * INTENTS.SIGHTING_ACTIVE
         *      -> "sightingActive"
         *
         * Fallback:
         *
         * "SIGHTING_ACTIVE"
         *
         * This makes the router tolerant while the
         * Sighting domain is being integrated.
         */

        const canonicalIntent =

            intents[

                constantName

            ] ||

            constantName;


        /*----------------------------------
          Canonical Value
        ----------------------------------*/


        SightingRouter.register(

            canonicalIntent,

            handlerName

        );


        /*----------------------------------
          Constant-Style Alias
        ----------------------------------*/


        SightingRouter.register(

            constantName,

            handlerName

        );


        return true;

    };


    /*=========================================================
      BUILD ROUTES
    =========================================================*/


    SightingRouter.buildRoutes = function () {


        SightingRouter.routes.clear();


        /*=====================================================
          BASIC SIGHTING QUERIES
        =====================================================*/


        SightingRouter.registerConstant(

            "SIGHTING_SEARCH",

            "querySightingSearch"

        );


        SightingRouter.registerConstant(

            "SIGHTING_DETAILS",

            "querySightingDetails"

        );


        SightingRouter.registerConstant(

            "SIGHTING_LIST",

            "querySightingList"

        );


        SightingRouter.registerConstant(

            "SIGHTING_COUNT",

            "querySightingCount"

        );


        SightingRouter.registerConstant(

            "SIGHTING_SUMMARY",

            "querySightingSummary"

        );


        SightingRouter.registerConstant(

            "SIGHTING_HISTORY",

            "querySightingHistory"

        );


        SightingRouter.registerConstant(

            "SIGHTING_LATEST",

            "queryLatestSighting"

        );


        SightingRouter.registerConstant(

            "SIGHTING_RECENT",

            "queryRecentSightings"

        );


        /*=====================================================
          ACTIVE / LIFECYCLE
        =====================================================*/


        SightingRouter.registerConstant(

            "SIGHTING_ACTIVE",

            "queryActiveSightings"

        );


        SightingRouter.registerConstant(

            "SIGHTING_INACTIVE",

            "queryInactiveSightings"

        );


        SightingRouter.registerConstant(

            "SIGHTING_RESOLVED",

            "queryResolvedSightings"

        );


        SightingRouter.registerConstant(

            "SIGHTING_MOVED",

            "queryMovedSightings"

        );


        SightingRouter.registerConstant(

            "SIGHTING_DRIVEN",

            "queryDrivenSightings"

        );


        SightingRouter.registerConstant(

            "SIGHTING_STATUS",

            "querySightingStatus"

        );


        SightingRouter.registerConstant(

            "SIGHTING_LIFECYCLE",

            "querySightingLifecycle"

        );


        /*=====================================================
          ELEPHANT / HERD INFORMATION
        =====================================================*/


        SightingRouter.registerConstant(

            "SIGHTING_HERD_SIZE",

            "querySightingHerdSize"

        );


        SightingRouter.registerConstant(

            "SIGHTING_ELEPHANT_COUNT",

            "queryElephantCount"

        );


        SightingRouter.registerConstant(

            "SIGHTING_SINGLE_ELEPHANT",

            "querySingleElephantSightings"

        );


        SightingRouter.registerConstant(

            "SIGHTING_HERD",

            "queryHerdSightings"

        );


        /*=====================================================
          MOVEMENT
        =====================================================*/


        SightingRouter.registerConstant(

            "SIGHTING_MOVEMENT",

            "querySightingMovement"

        );


        SightingRouter.registerConstant(

            "SIGHTING_MOVEMENT_DIRECTION",

            "querySightingMovementDirection"

        );


        SightingRouter.registerConstant(

            "SIGHTING_MOVEMENT_HISTORY",

            "querySightingMovementHistory"

        );


        SightingRouter.registerConstant(

            "SIGHTING_MOVEMENT_SUMMARY",

            "querySightingMovementSummary"

        );


        /*=====================================================
          GIS / LOCATION
        =====================================================*/


        SightingRouter.registerConstant(

            "SIGHTING_LOCATION",

            "querySightingLocation"

        );


        SightingRouter.registerConstant(

            "SIGHTING_NEAR_LOCATION",

            "querySightingsNearLocation"

        );


        SightingRouter.registerConstant(

            "SIGHTING_NEAR_VILLAGE",

            "querySightingsNearVillage"

        );


        SightingRouter.registerConstant(

            "SIGHTING_VILLAGE",

            "queryVillageSightings"

        );


        SightingRouter.registerConstant(

            "SIGHTING_DIVISION",

            "queryDivisionSightings"

        );


        SightingRouter.registerConstant(

            "SIGHTING_RANGE",

            "queryRangeSightings"

        );


        SightingRouter.registerConstant(

            "SIGHTING_BEAT",

            "queryBeatSightings"

        );


        SightingRouter.registerConstant(

            "SIGHTING_COMPARTMENT",

            "queryCompartmentSightings"

        );


        /*=====================================================
          GIS ANALYTICS
        =====================================================*/


        SightingRouter.registerConstant(

            "SIGHTING_DIVISION_ANALYTICS",

            "querySightingDivisionAnalytics"

        );


        SightingRouter.registerConstant(

            "SIGHTING_RANGE_ANALYTICS",

            "querySightingRangeAnalytics"

        );


        SightingRouter.registerConstant(

            "SIGHTING_BEAT_ANALYTICS",

            "querySightingBeatAnalytics"

        );


        SightingRouter.registerConstant(

            "SIGHTING_COMPARTMENT_ANALYTICS",

            "querySightingCompartmentAnalytics"

        );


        SightingRouter.registerConstant(

            "SIGHTING_VILLAGE_ANALYTICS",

            "querySightingVillageAnalytics"

        );


        /*=====================================================
          STAFF / USER / OPERATIONAL
        =====================================================*/


        SightingRouter.registerConstant(

            "SIGHTING_BY_STAFF",

            "querySightingsByStaff"

        );


        SightingRouter.registerConstant(

            "SIGHTING_MY",

            "queryMySightings"

        );


        SightingRouter.registerConstant(

            "SIGHTING_MY_ACTIVE",

            "queryMyActiveSightings"

        );


        SightingRouter.registerConstant(

            "SIGHTING_STAFF_ANALYTICS",

            "querySightingStaffAnalytics"

        );


        SightingRouter.registerConstant(

            "SIGHTING_TEAM_ANALYTICS",

            "querySightingTeamAnalytics"

        );


        /*=====================================================
          TIME ANALYTICS
        =====================================================*/


        SightingRouter.registerConstant(

            "SIGHTING_TODAY",

            "querySightingsToday"

        );


        SightingRouter.registerConstant(

            "SIGHTING_YESTERDAY",

            "querySightingsYesterday"

        );


        SightingRouter.registerConstant(

            "SIGHTING_WEEK",

            "querySightingsThisWeek"

        );


        SightingRouter.registerConstant(

            "SIGHTING_MONTH",

            "querySightingsThisMonth"

        );


        SightingRouter.registerConstant(

            "SIGHTING_FINANCIAL_YEAR",

            "querySightingsFinancialYear"

        );


        SightingRouter.registerConstant(

            "SIGHTING_TIME_ANALYTICS",

            "querySightingTimeAnalytics"

        );


        SightingRouter.registerConstant(

            "SIGHTING_TREND",

            "querySightingTrend"

        );


        /*=====================================================
          HUMAN ELEPHANT CONFLICT
        =====================================================*/


        SightingRouter.registerConstant(

            "HEC_SUMMARY",

            "queryHECSummary"

        );


        SightingRouter.registerConstant(

            "HEC_RISK",

            "queryHECRisk"

        );


        SightingRouter.registerConstant(

            "HEC_RISK_ANALYSIS",

            "queryHECRiskAnalysis"

        );


        SightingRouter.registerConstant(

            "HEC_HOTSPOTS",

            "queryHECHotspots"

        );


        SightingRouter.registerConstant(

            "HEC_TREND",

            "queryHECTrend"

        );


        SightingRouter.registerConstant(

            "HEC_HISTORY",

            "queryHECHistory"

        );


        SightingRouter.registerConstant(

            "HEC_VILLAGE_RISK",

            "queryHECVillageRisk"

        );


        SightingRouter.registerConstant(

            "HEC_RANGE_RISK",

            "queryHECRangeRisk"

        );


        SightingRouter.registerConstant(

            "HEC_BEAT_RISK",

            "queryHECBeatRisk"

        );


        SightingRouter.registerConstant(

            "HEC_COMPARTMENT_RISK",

            "queryHECCompartmentRisk"

        );


        /*=====================================================
          HEC MITIGATION
        =====================================================*/


        SightingRouter.registerConstant(

            "HEC_MITIGATION",

            "queryHECMitigation"

        );


        SightingRouter.registerConstant(

            "HEC_MITIGATION_PRIORITY",

            "queryHECMitigationPriority"

        );


        SightingRouter.registerConstant(

            "HEC_PREVENTION",

            "queryHECPrevention"

        );


        SightingRouter.registerConstant(

            "HEC_RESPONSE",

            "queryHECResponse"

        );


        SightingRouter.registerConstant(

            "HEC_RESPONSE_PRIORITY",

            "queryHECResponsePriority"

        );


        SightingRouter.registerConstant(

            "HEC_OPERATIONAL_ADVICE",

            "queryHECOperationalAdvice"

        );


        /*=====================================================
          DEPREDATION
        =====================================================*/


        SightingRouter.registerConstant(

            "DEPREDATION_SUMMARY",

            "queryDepredationSummary"

        );


        SightingRouter.registerConstant(

            "DEPREDATION_ANALYTICS",

            "queryDepredationAnalytics"

        );


        SightingRouter.registerConstant(

            "DEPREDATION_HISTORY",

            "queryDepredationHistory"

        );


        SightingRouter.registerConstant(

            "DEPREDATION_HOTSPOTS",

            "queryDepredationHotspots"

        );


        SightingRouter.registerConstant(

            "DEPREDATION_RISK",

            "queryDepredationRisk"

        );


        SightingRouter.registerConstant(

            "DEPREDATION_TREND",

            "queryDepredationTrend"

        );


        /*=====================================================
          RESPONSE / FIELD OPERATIONS
        =====================================================*/


        SightingRouter.registerConstant(

            "SIGHTING_RESPONSE_PRIORITY",

            "querySightingResponsePriority"

        );


        SightingRouter.registerConstant(

            "SIGHTING_NEAREST_STAFF",

            "querySightingNearestStaff"

        );


        SightingRouter.registerConstant(

            "SIGHTING_RESPONSE_STAFF",

            "querySightingResponseStaff"

        );


        SightingRouter.registerConstant(

            "SIGHTING_OPERATIONAL_SUMMARY",

            "querySightingOperationalSummary"

        );


        SightingRouter.registerConstant(

            "SIGHTING_RISK_PRIORITY",

            "querySightingRiskPriority"

        );


        /*=====================================================
          ANALYTICS
        =====================================================*/


        SightingRouter.registerConstant(

            "SIGHTING_ANALYTICS",

            "querySightingAnalytics"

        );


        SightingRouter.registerConstant(

            "SIGHTING_HOTSPOTS",

            "querySightingHotspots"

        );


        SightingRouter.registerConstant(

            "SIGHTING_FREQUENCY",

            "querySightingFrequency"

        );


        SightingRouter.registerConstant(

            "SIGHTING_RISK_ANALYTICS",

            "querySightingRiskAnalytics"

        );


        SightingRouter.registerConstant(

            "SIGHTING_CONFLICT_ANALYTICS",

            "querySightingConflictAnalytics"

        );


        /*=====================================================
          PREDICTIVE / DECISION SUPPORT
        =====================================================*/


        SightingRouter.registerConstant(

            "SIGHTING_RISK_ASSESSMENT",

            "querySightingRiskAssessment"

        );


        SightingRouter.registerConstant(

            "SIGHTING_PRIORITY_ANALYSIS",

            "querySightingPriorityAnalysis"

        );


        SightingRouter.registerConstant(

            "SIGHTING_DECISION_SUPPORT",

            "querySightingDecisionSupport"

        );


        return SightingRouter.routes;

    };


    /*=========================================================
      INITIALIZE
    =========================================================*/


    SightingRouter.init = function () {

        if (

            SightingRouter.initialized

        ) {

            return true;

        }


        SightingRouter.buildRoutes();


        SightingRouter.initialized =

            true;


        if (

            GG.Config?.DEBUG?.ENABLED

        ) {

            console.log(

                "%cGreenGuard SightingRouter Ready",

                "color:#008000;font-weight:bold;",

                SightingRouter.routes.size,

                "routes"

            );

        }


        return true;

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
          Preferred Contract

          Existing StaffQuery architecture exposes business
          handlers on GG:

              GG.queryStaffCount()
              GG.queryNearbyStaff()

          SightingQuery follows the same pattern:

              GG.queryActiveSightings()
              GG.queryHECRisk()
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
          Module Method Fallback

          Also supports:

              GG.SightingQuery.queryActiveSightings()

          if a future SightingQuery version exposes handlers
          directly on the module.
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

            source:

                "LOCAL",

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
              RESOLVE INTENT
            =================================================*/


            const intent =

                SightingRouter
                    .resolveIntent(

                        request

                    );


            if (

                !intent

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

                intent;


            /*=================================================
              RESOLVE ROUTE
            =================================================*/


            const route =

                SightingRouter
                    .resolveRoute(

                        intent

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

                            intent,

                        "SIGHTING_INTENT_UNSUPPORTED"

                    );

            }


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

              Preserve the request produced by IntentManager.

              Do NOT throw away:
              - entities
              - parameters
              - context
              - confidence
              - detectedIntent
            =================================================*/


            const routedRequest = {

                ...request,

                domain:

                    request.domain ||

                    SightingRouter.DOMAIN,

                intent:

                    route.intent ||

                    intent,

                entities:

                    request.entities ||

                    {},

                parameters:

                    request.parameters ||

                    {},

                context:

                    request.context ||

                    {}

            };


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

                console.log(

                    "🐘 SightingRouter",

                    {

                        intent:

                            intent,

                        canonicalIntent:

                            route.intent,

                        handler:

                            handler.name,

                        handlerSource:

                            handler.source,

                        entities:

                            routedRequest.entities,

                        parameters:

                            routedRequest.parameters

                    }

                );

            }


            /*=================================================
              EXECUTE QUERY
            =================================================*/


            const response =

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


            SightingRouter.lastResponse =

                response;


            SightingRouter.statistics.successes++;


            return response;


        }

        catch (

            error

        ) {


            SightingRouter
                .statistics
                .failures++;


            if (

                GG.Config?.DEBUG?.ENABLED

            ) {

                console.error(

                    "❌ SightingRouter Error:",

                    error

                );

            }


            return SightingRouter
                .createFailureResponse(

                    request,

                    error.message,

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


    /*
     * Some GreenGuard routers may use:
     *
     *     router.route()
     *
     * while another dispatcher may expect:
     *
     *     router.dispatch()
     *
     * Supporting both is harmless and avoids coupling the
     * Sighting domain to one dispatcher implementation.
     */


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

                        handler:

                            entry[1].handler

                    };

                }

            );

    };


    /*=========================================================
      VALIDATE ROUTES
    =========================================================*/


    /*
     * Very useful during development.
     *
     * It checks whether every registered route has an
     * actual SightingQuery handler.
     *
     * IMPORTANT:
     *
     * This does NOT execute any query.
     * No Firestore writes.
     * No sighting changes.
     */


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
      GET STATUS
    =========================================================*/


    SightingRouter.getStatus = function () {

        SightingRouter.init();


        const validation =

            SightingRouter
                .validateRoutes();


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


        return {

            loaded:

                true,

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

            lastIntent:

                SightingRouter.lastIntent,

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


        SightingRouter.lastRequest =

            null;


        SightingRouter.lastResponse =

            null;


        SightingRouter.lastIntent =

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
