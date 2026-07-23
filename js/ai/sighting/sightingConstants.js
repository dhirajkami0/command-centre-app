/*!
 * GreenGuard AI
 * sightingConstants.js
 *
 * Version: 1.0.0
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Central constants and vocabulary for the GreenGuard
 * Elephant Sighting Intelligence module.
 *
 * OPERATIONAL PURPOSE
 * ---------------------------------------------------------
 * Supports:
 *
 * - Elephant sighting intelligence
 * - Depredation duty
 * - Elephant driving duty
 * - Human-elephant conflict monitoring
 * - Active sighting monitoring
 * - Movement monitoring
 * - Village-risk awareness
 * - Multi-user operation
 * - Multi-range operation
 * - Multi-beat operation
 * - Multi-sighting operation
 *
 * IMPORTANT ARCHITECTURE
 * ---------------------------------------------------------
 *
 * This module DOES NOT:
 *
 * - read Firestore
 * - determine current user
 * - determine access permissions
 * - resolve GIS polygons
 * - calculate distances
 * - calculate conflict risk
 * - render responses
 * - update sightings
 *
 * Those responsibilities belong to:
 *
 * SightingEntities
 * SightingQuery
 * SightingIntent
 * SightingRouter
 * SightingFormatter
 * GISEntities
 * StaffHydrator
 * ConflictRiskEngine (future)
 *
 * A sighting belongs to its operational/spatial context.
 * It is NOT owned exclusively by the staff member who
 * originally reported it.
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

        GG.SightingConstants

    ) {

        console.warn(

            "[GreenGuardAI] SightingConstants already loaded."

        );

        return;

    }


    /*=====================================================
      MODULE
    =====================================================*/

    const SightingConstants = {};


    /*=====================================================
      VERSION
    =====================================================*/

    SightingConstants.VERSION =

        "1.0.0";


    /*=====================================================
      DOMAIN
    =====================================================*/

    SightingConstants.DOMAIN =

        "sighting";


    /*=====================================================
      COLLECTIONS
    =====================================================*/

    SightingConstants.COLLECTIONS =

        Object.freeze({

            SIGHTINGS:

                "elephant_sightings",

            COUNTERS:

                "elephant_sighting_counters"

        });


    /*=====================================================
      INTENTS

      IMPORTANT
      -----------------------------------------------------

      Values are canonical runtime intent names.

      CONSTANT KEYS:
          SIGHTING_ACTIVE_LIST

      Runtime value:
          sightingActiveList

      This follows the same pattern used by the existing
      GreenGuard intent architecture.
    =====================================================*/

    SightingConstants.INTENTS =

        Object.freeze({


            /*---------------------------------------------
              BASIC SIGHTING
            ---------------------------------------------*/

            SIGHTING_DETAILS:

                "sightingDetails",

            SIGHTING_LATEST:

                "sightingLatest",

            SIGHTING_LIST:

                "sightingList",

            SIGHTING_COUNT:

                "sightingCount",


            /*---------------------------------------------
              ACTIVE SIGHTINGS
            ---------------------------------------------*/

            SIGHTING_ACTIVE_LIST:

                "sightingActiveList",

            SIGHTING_ACTIVE_COUNT:

                "sightingActiveCount",

            SIGHTING_ACTIVE_NEARBY:

                "sightingActiveNearby",


            /*---------------------------------------------
              LOCATION / GIS
            ---------------------------------------------*/

            SIGHTING_BY_DIVISION:

                "sightingByDivision",

            SIGHTING_BY_RANGE:

                "sightingByRange",

            SIGHTING_BY_BEAT:

                "sightingByBeat",

            SIGHTING_BY_COMPARTMENT:

                "sightingByCompartment",

            SIGHTING_BY_VILLAGE:

                "sightingByVillage",

            SIGHTING_NEAREST_VILLAGE:

                "sightingNearestVillage",

            SIGHTING_NEAREST_USER:

                "sightingNearestUser",

            SIGHTING_LOCATION:

                "sightingLocation",


            /*---------------------------------------------
              ELEPHANT / HERD
            ---------------------------------------------*/

            SIGHTING_HERD:

                "sightingHerd",

            SIGHTING_HERD_SIZE:

                "sightingHerdSize",


            /*---------------------------------------------
              MOVEMENT
            ---------------------------------------------*/

            SIGHTING_MOVEMENT:

                "sightingMovement",

            SIGHTING_DIRECTION:

                "sightingDirection",

            SIGHTING_MOVED_LIST:

                "sightingMovedList",

            SIGHTING_LAST_LOCATION:

                "sightingLastLocation",


            /*---------------------------------------------
              DRIVING
            ---------------------------------------------*/

            SIGHTING_DRIVING:

                "sightingDriving",

            SIGHTING_DRIVEN_LIST:

                "sightingDrivenList",


            /*---------------------------------------------
              DEPREDATION
            ---------------------------------------------*/

            SIGHTING_DEPREDATION:

                "sightingDepredation",

            SIGHTING_DEPREDATION_LIST:

                "sightingDepredationList",


            /*---------------------------------------------
              CONFLICT / RISK
            ---------------------------------------------*/

            SIGHTING_HIGH_RISK:

                "sightingHighRisk",

            SIGHTING_VILLAGE_RISK:

                "sightingVillageRisk",

            SIGHTING_CONFLICT_HISTORY:

                "sightingConflictHistory",

            SIGHTING_PRIORITY:

                "sightingPriority",

            SIGHTING_THREATENED_VILLAGES:

                "sightingThreatenedVillages",


            /*---------------------------------------------
              LIFECYCLE
            ---------------------------------------------*/

            SIGHTING_RESOLVED_LIST:

                "sightingResolvedList",

            SIGHTING_STATUS:

                "sightingStatus",


            /*---------------------------------------------
              REPORTER / STAFF CONTEXT
            ---------------------------------------------*/

            SIGHTING_REPORTED_BY:

                "sightingReportedBy",

            SIGHTING_UPDATED_BY:

                "sightingUpdatedBy",


            /*---------------------------------------------
              OPERATIONAL SUMMARY
            ---------------------------------------------*/

            SIGHTING_SUMMARY:

                "sightingSummary",

            SIGHTING_OPERATIONAL_SUMMARY:

                "sightingOperationalSummary",

            SIGHTING_CONFLICT_SUMMARY:

                "sightingConflictSummary"

        });


    /*=====================================================
      ENTITY TYPES

      These describe entities extracted from natural
      language.

      They do NOT perform the actual lookup.
    =====================================================*/

    SightingConstants.ENTITY_TYPES =

        Object.freeze({

            SIGHTING:

                "sighting",

            SIGHTING_ID:

                "sightingId",

            DIVISION:

                "division",

            RANGE:

                "range",

            BEAT:

                "beat",

            COMPARTMENT:

                "compartment",

            VILLAGE:

                "village",

            LOCATION:

                "location",

            DIRECTION:

                "direction",

            STATUS:

                "status",

            STAFF:

                "staff",

            USER:

                "user",

            HERD:

                "herd",

            RISK:

                "risk",

            DATE:

                "date",

            TIME:

                "time",

            DISTANCE:

                "distance"

        });


    /*=====================================================
      SIGHTING STATUS

      These reflect the lifecycle currently used by the
      GreenGuard sighting system.
    =====================================================*/

    SightingConstants.STATUS =

        Object.freeze({

            ACTIVE:

                "ACTIVE",

            MOVED:

                "MOVED",

            DRIVEN:

                "DRIVEN",

            RESOLVED:

                "RESOLVED"

        });


    /*=====================================================
      MARKER STATES

      MOVED sightings currently remain active and visible
      but are represented as STATIC_GREY.
    =====================================================*/

    SightingConstants.MARKER_STATE =

        Object.freeze({

            ACTIVE:

                "ACTIVE",

            STATIC_GREY:

                "STATIC_GREY",

            RESOLVED:

                "RESOLVED"

        });


    /*=====================================================
      ACTIVE STATUS GROUP

      These statuses may still represent operationally
      relevant sightings.

      Final filtering remains SightingQuery's job.
    =====================================================*/

    SightingConstants.ACTIVE_STATUSES =

        Object.freeze([

            "ACTIVE",

            "MOVED",

            "DRIVEN"

        ]);


    /*=====================================================
      CLOSED STATUS GROUP
    =====================================================*/

    SightingConstants.CLOSED_STATUSES =

        Object.freeze([

            "RESOLVED"

        ]);


    /*=====================================================
      DIRECTIONS

      Canonical movement directions.

      SightingIntent may normalize user language into
      these values.
    =====================================================*/

    SightingConstants.DIRECTIONS =

        Object.freeze({

            NORTH:

                "NORTH",

            NORTH_EAST:

                "NORTH_EAST",

            EAST:

                "EAST",

            SOUTH_EAST:

                "SOUTH_EAST",

            SOUTH:

                "SOUTH",

            SOUTH_WEST:

                "SOUTH_WEST",

            WEST:

                "WEST",

            NORTH_WEST:

                "NORTH_WEST",

            UNKNOWN:

                "UNKNOWN"

        });


    /*=====================================================
      RISK LEVELS

      Constants only.

      Risk calculation must NOT happen here.
    =====================================================*/

    SightingConstants.RISK_LEVELS =

        Object.freeze({

            LOW:

                "LOW",

            MEDIUM:

                "MEDIUM",

            HIGH:

                "HIGH",

            CRITICAL:

                "CRITICAL",

            UNKNOWN:

                "UNKNOWN"

        });


    /*=====================================================
      FIELD MAP

      Canonical mapping to the fields currently being
      stored in elephant_sightings.

      Additional legacy aliases can later be handled by
      SightingEntities without changing the rest of the
      AI pipeline.
    =====================================================*/

    SightingConstants.FIELDS =

        Object.freeze({


            /*---------------------------------------------
              IDENTITY
            ---------------------------------------------*/

            ID:

                "sighting_id",

            FIRESTORE_ID:

                "firestore_id",

            PARENT_ID:

                "parent_id",


            /*---------------------------------------------
              TIME
            ---------------------------------------------*/

            SIGHTING_DATETIME:

                "sighting_datetime",

            CREATED_AT:

                "created_at",

            UPDATED_AT:

                "updated_at",

            RESOLVED_AT:

                "resolved_at",

            FINANCIAL_YEAR:

                "financial_year",


            /*---------------------------------------------
              GPS
            ---------------------------------------------*/

            LATITUDE:

                "lat",

            LONGITUDE:

                "lon",

            LOCATION:

                "location",


            /*---------------------------------------------
              GIS
            ---------------------------------------------*/

            DIVISION:

                "gis_division",

            RANGE:

                "gis_range",

            BEAT:

                "gis_beat",

            COMPARTMENT:

                "gis_compartment",


            /*---------------------------------------------
              GIS IDENTIFIERS
            ---------------------------------------------*/

            DIVISION_CODE:

                "division_code",

            RANGE_CODE:

                "range_code",


            /*---------------------------------------------
              COUNTER NUMBERS
            ---------------------------------------------*/

            RANGE_SIGHTING_NO:

                "range_sighting_no",

            DIVISION_SIGHTING_NO:

                "division_sighting_no",


            /*---------------------------------------------
              OFFICIAL VILLAGE
            ---------------------------------------------*/

            VILLAGE:

                "village",

            VILLAGE_CODE:

                "village_code",

            VILLAGE_LGD:

                "village_lgd",

            VILLAGE_DISTRICT:

                "village_district",

            VILLAGE_SUBDISTRICT:

                "village_subdistrict",

            VILLAGE_PINCODE:

                "village_pincode",


            /*---------------------------------------------
              NEAREST NAMED LOCATION
            ---------------------------------------------*/

            NEAREST_VILLAGE:

                "nearest_village",

            NEAREST_LOCATION:

                "nearest_location",

            NEAREST_VILLAGE_DISTANCE_M:

                "nearest_village_distance_m",

            NEAREST_LOCATION_DISTANCE_M:

                "nearest_location_distance_m",

            NEAREST_VILLAGE_DISTANCE_KM:

                "nearest_village_distance_km",

            NEAREST_VILLAGE_RISK:

                "nearest_village_risk",

            NEAREST_LOCATION_RISK:

                "nearest_location_risk",

            NEAREST_VILLAGE_CONFLICT_HISTORY:

                "nearest_village_conflict_history",

            NEAREST_LOCATION_CONFLICT_HISTORY:

                "nearest_location_conflict_history",

            NEAREST_LOCATION_PHONE:

                "nearest_location_phone",

            NEAREST_LOCATION_WHATSAPP:

                "nearest_location_whatsapp",


            /*---------------------------------------------
              ELEPHANT / HERD
            ---------------------------------------------*/

            HERD:

                "herd",

            HERD_SIZE:

                "herd_size",


            /*---------------------------------------------
              MOVEMENT
            ---------------------------------------------*/

            DIRECTION:

                "direction",

            MOVEMENT_DIRECTION:

                "movement_direction",


            /*---------------------------------------------
              DEPREDATION / DRIVING
            ---------------------------------------------*/

            DEPREDATION:

                "depredation",

            INVOLVED:

                "involved",

            DRIVING:

                "driving",

            REMARKS:

                "remarks",


            /*---------------------------------------------
              LIFECYCLE
            ---------------------------------------------*/

            STATUS:

                "status",

            ACTIVE:

                "active",

            MARKER_VISIBLE:

                "marker_visible",

            MARKER_STATE:

                "marker_state",


            /*---------------------------------------------
              REPORTING / UPDATE STAFF

              These fields support multi-user operation.

              SightingEntities should tolerate them being
              absent in older documents.
            ---------------------------------------------*/

            REPORTED_BY:

                "reported_by",

            REPORTED_BY_ID:

                "reported_by_id",

            UPDATED_BY:

                "updated_by",

            UPDATED_BY_ID:

                "updated_by_id"

        });


    /*=====================================================
      KEYWORDS

      IMPORTANT
      -----------------------------------------------------

      Keep keywords reasonably specific.

      Avoid very generic words such as:

          SHOW
          LIST
          DETAILS
          WHERE
          STAFF

      by themselves.

      Generic keywords caused collisions in the Staff
      intent system previously.

      SightingIntent should combine these groups with
      entities/context before assigning final confidence.
    =====================================================*/

    SightingConstants.KEYWORDS =

        Object.freeze({


            /*---------------------------------------------
              CORE ELEPHANT / SIGHTING
            ---------------------------------------------*/

            SIGHTING:

                Object.freeze([

                    "ELEPHANT SIGHTING",

                    "ELEPHANT SIGHTINGS",

                    "SIGHTING",

                    "SIGHTINGS",

                    "ELEPHANT LOCATION",

                    "ELEPHANT LOCATIONS",

                    "ELEPHANT POSITION",

                    "ELEPHANT POSITIONS"

                ]),


            /*---------------------------------------------
              ACTIVE
            ---------------------------------------------*/

            ACTIVE:

                Object.freeze([

                    "ACTIVE ELEPHANT",

                    "ACTIVE ELEPHANTS",

                    "ACTIVE SIGHTING",

                    "ACTIVE SIGHTINGS",

                    "CURRENT ELEPHANT",

                    "CURRENT ELEPHANTS",

                    "CURRENT SIGHTING",

                    "CURRENT SIGHTINGS"

                ]),


            /*---------------------------------------------
              LATEST
            ---------------------------------------------*/

            LATEST:

                Object.freeze([

                    "LATEST SIGHTING",

                    "LATEST ELEPHANT SIGHTING",

                    "LAST SIGHTING",

                    "MOST RECENT SIGHTING",

                    "RECENT SIGHTING",

                    "RECENT ELEPHANT SIGHTING"

                ]),


            /*---------------------------------------------
              MOVEMENT
            ---------------------------------------------*/

            MOVEMENT:

                Object.freeze([

                    "ELEPHANT MOVEMENT",

                    "HERD MOVEMENT",

                    "MOVEMENT DIRECTION",

                    "MOVING DIRECTION",

                    "MOVING TOWARDS",

                    "MOVED",

                    "LAST LOCATION",

                    "LAST SEEN"

                ]),


            /*---------------------------------------------
              DRIVING
            ---------------------------------------------*/

            DRIVING:

                Object.freeze([

                    "ELEPHANT DRIVING",

                    "DRIVING ELEPHANT",

                    "DRIVING ELEPHANTS",

                    "DRIVING OPERATION",

                    "ELEPHANT DRIVING DUTY",

                    "DRIVEN"

                ]),


            /*---------------------------------------------
              DEPREDATION
            ---------------------------------------------*/

            DEPREDATION:

                Object.freeze([

                    "DEPREDATION",

                    "ELEPHANT DEPREDATION",

                    "DEPREDATION DUTY",

                    "CROP DEPREDATION",

                    "CROP DAMAGE",

                    "ELEPHANT DAMAGE"

                ]),


            /*---------------------------------------------
              HERD
            ---------------------------------------------*/

            HERD:

                Object.freeze([

                    "HERD",

                    "HERD SIZE",

                    "ELEPHANT HERD",

                    "ELEPHANT HERDS",

                    "NUMBER OF ELEPHANTS",

                    "HOW MANY ELEPHANTS"

                ]),


            /*---------------------------------------------
              VILLAGE
            ---------------------------------------------*/

            VILLAGE:

                Object.freeze([

                    "NEAREST VILLAGE",

                    "NEAR VILLAGE",

                    "VILLAGE NEAR ELEPHANT",

                    "ELEPHANT NEAR VILLAGE",

                    "VILLAGE AT RISK",

                    "THREATENED VILLAGE",

                    "THREATENED VILLAGES"

                ]),


            /*---------------------------------------------
              RISK / CONFLICT
            ---------------------------------------------*/

            RISK:

                Object.freeze([

                    "HIGH RISK SIGHTING",

                    "HIGH RISK SIGHTINGS",

                    "ELEPHANT RISK",

                    "CONFLICT RISK",

                    "VILLAGE RISK",

                    "HIGH RISK VILLAGE",

                    "HIGH RISK VILLAGES",

                    "CONFLICT HISTORY",

                    "ELEPHANT CONFLICT",

                    "HUMAN ELEPHANT CONFLICT"

                ]),


            /*---------------------------------------------
              PRIORITY
            ---------------------------------------------*/

            PRIORITY:

                Object.freeze([

                    "PRIORITY SIGHTING",

                    "PRIORITY SIGHTINGS",

                    "HIGHEST PRIORITY SIGHTING",

                    "MOST URGENT SIGHTING",

                    "URGENT ELEPHANT SIGHTING"

                ]),


            /*---------------------------------------------
              RESOLVED
            ---------------------------------------------*/

            RESOLVED:

                Object.freeze([

                    "RESOLVED SIGHTING",

                    "RESOLVED SIGHTINGS",

                    "CLOSED SIGHTING",

                    "CLOSED SIGHTINGS"

                ]),


            /*---------------------------------------------
              GIS FILTER LANGUAGE
            ---------------------------------------------*/

            DIVISION:

                Object.freeze([

                    "DIVISION SIGHTING",

                    "DIVISION SIGHTINGS",

                    "ELEPHANTS IN DIVISION"

                ]),

            RANGE:

                Object.freeze([

                    "RANGE SIGHTING",

                    "RANGE SIGHTINGS",

                    "ELEPHANTS IN RANGE"

                ]),

            BEAT:

                Object.freeze([

                    "BEAT SIGHTING",

                    "BEAT SIGHTINGS",

                    "ELEPHANTS IN BEAT"

                ]),

            COMPARTMENT:

                Object.freeze([

                    "COMPARTMENT SIGHTING",

                    "COMPARTMENT SIGHTINGS",

                    "ELEPHANTS IN COMPARTMENT"

                ]),


            /*---------------------------------------------
              NEAR CURRENT USER
            ---------------------------------------------*/

            NEAR_ME:

                Object.freeze([

                    "ELEPHANT NEAR ME",

                    "ELEPHANTS NEAR ME",

                    "SIGHTING NEAR ME",

                    "SIGHTINGS NEAR ME",

                    "NEAREST ELEPHANT",

                    "NEAREST SIGHTING"

                ]),


            /*---------------------------------------------
              REPORTER
            ---------------------------------------------*/

            REPORTER:

                Object.freeze([

                    "WHO REPORTED",

                    "REPORTED BY",

                    "SIGHTING REPORTED BY",

                    "WHO REPORTED THE SIGHTING"

                ])

        });


    /*=====================================================
      DIRECTION ALIASES

      Used later by SightingIntent / entity extraction.

      This is vocabulary normalization only.
    =====================================================*/

    SightingConstants.DIRECTION_ALIASES =

        Object.freeze({

            N:

                "NORTH",

            NORTH:

                "NORTH",

            NE:

                "NORTH_EAST",

            NORTHEAST:

                "NORTH_EAST",

            "NORTH EAST":

                "NORTH_EAST",

            E:

                "EAST",

            EAST:

                "EAST",

            SE:

                "SOUTH_EAST",

            SOUTHEAST:

                "SOUTH_EAST",

            "SOUTH EAST":

                "SOUTH_EAST",

            S:

                "SOUTH",

            SOUTH:

                "SOUTH",

            SW:

                "SOUTH_WEST",

            SOUTHWEST:

                "SOUTH_WEST",

            "SOUTH WEST":

                "SOUTH_WEST",

            W:

                "WEST",

            WEST:

                "WEST",

            NW:

                "NORTH_WEST",

            NORTHWEST:

                "NORTH_WEST",

            "NORTH WEST":

                "NORTH_WEST"

        });


    /*=====================================================
      STATUS ALIASES

      Natural-language normalization only.

      Does not modify Firestore.
    =====================================================*/

    SightingConstants.STATUS_ALIASES =

        Object.freeze({

            ACTIVE:

                "ACTIVE",

            CURRENT:

                "ACTIVE",

            LIVE:

                "ACTIVE",

            MOVED:

                "MOVED",

            MOVING:

                "MOVED",

            DRIVEN:

                "DRIVEN",

            RESOLVED:

                "RESOLVED",

            CLOSED:

                "RESOLVED"

        });


    /*=====================================================
      OPERATIONAL CONTEXT TYPES

      These are NOT permission rules.

      They describe contexts that SightingQuery may use
      when interpreting a request.
    =====================================================*/

    SightingConstants.CONTEXT =

        Object.freeze({

            GLOBAL:

                "global",

            DIVISION:

                "division",

            RANGE:

                "range",

            BEAT:

                "beat",

            COMPARTMENT:

                "compartment",

            VILLAGE:

                "village",

            NEAR_USER:

                "nearUser",

            CURRENT_DUTY:

                "currentDuty",

            THREATENED_AREA:

                "threatenedArea"

        });


    /*=====================================================
      QUERY SCOPES

      Scope describes what the query is asking for.

      Actual authorization remains outside Constants.
    =====================================================*/

    SightingConstants.SCOPES =

        Object.freeze({

            ALL:

                "all",

            CURRENT:

                "current",

            ACTIVE:

                "active",

            RESOLVED:

                "resolved",

            NEARBY:

                "nearby",

            JURISDICTION:

                "jurisdiction",

            THREATENED:

                "threatened",

            HIGH_RISK:

                "highRisk"

        });


    /*=====================================================
      SORT MODES

      Used later by SightingQuery.

      Constants only.
    =====================================================*/

    SightingConstants.SORT =

        Object.freeze({

            NEWEST:

                "newest",

            OLDEST:

                "oldest",

            NEAREST:

                "nearest",

            HIGHEST_RISK:

                "highestRisk",

            LARGEST_HERD:

                "largestHerd",

            MOST_RECENT_UPDATE:

                "mostRecentUpdate"

        });


    /*=====================================================
      DEFAULTS

      These are query defaults, not security rules.
    =====================================================*/

    SightingConstants.DEFAULTS =

        Object.freeze({

            MAX_RESULTS:

                100,

            DEFAULT_LIMIT:

                20,

            DEFAULT_SORT:

                "newest",

            ACTIVE_ONLY:

                false,

            INCLUDE_RESOLVED:

                false

        });


    /*=====================================================
      MULTI-USER PRINCIPLES

      Metadata only.

      This explicitly documents the runtime architecture
      without implementing access rules here.
    =====================================================*/

    SightingConstants.MULTI_USER =

        Object.freeze({

            ENABLED:

                true,

            SIGHTING_OWNED_BY_REPORTER:

                false,

            SUPPORT_MULTIPLE_REPORTERS:

                true,

            SUPPORT_MULTIPLE_UPDATERS:

                true,

            SUPPORT_MULTIPLE_RANGES:

                true,

            SUPPORT_MULTIPLE_BEATS:

                true,

            SUPPORT_MULTIPLE_ACTIVE_SIGHTINGS:

                true,

            USE_CURRENT_USER_CONTEXT:

                true,

            USE_CURRENT_DUTY_CONTEXT:

                true,

            USE_SPATIAL_CONTEXT:

                true

        });


    /*=====================================================
      OPERATIONAL FEATURES

      Feature flags for future integration.

      These do not implement the feature.
    =====================================================*/

    SightingConstants.FEATURES =

        Object.freeze({

            ACTIVE_MONITORING:

                true,

            MOVEMENT_TRACKING:

                true,

            VILLAGE_PROXIMITY:

                true,

            VILLAGE_RISK:

                true,

            CONFLICT_HISTORY:

                true,

            DEPREDATION_SUPPORT:

                true,

            DRIVING_SUPPORT:

                true,

            MULTI_USER:

                true,

            MULTI_JURISDICTION:

                true,

            THREATENED_JURISDICTION:

                true,

            STAFF_INTEGRATION:

                true,

            GIS_INTEGRATION:

                true,

            PATROL_INTEGRATION:

                true,

            CONFLICT_RISK_ENGINE:

                false

        });


    /*=====================================================
      HELPER
      GET ALL INTENTS
    =====================================================*/

    SightingConstants.getIntents =

        function () {

            return Object.values(

                SightingConstants.INTENTS

            );

        };


    /*=====================================================
      HELPER
      IS VALID INTENT
    =====================================================*/

    SightingConstants.isValidIntent =

        function (

            value

        ) {

            if (

                !value

            ) {

                return false;

            }


            return Object.values(

                SightingConstants.INTENTS

            ).includes(

                value

            );

        };


    /*=====================================================
      HELPER
      IS ACTIVE STATUS
    =====================================================*/

    SightingConstants.isActiveStatus =

        function (

            value

        ) {

            if (

                !value

            ) {

                return false;

            }


            const status =

                String(

                    value

                )

                    .trim()

                    .toUpperCase();


            return SightingConstants
                .ACTIVE_STATUSES
                .includes(

                    status

                );

        };


    /*=====================================================
      HELPER
      IS CLOSED STATUS
    =====================================================*/

    SightingConstants.isClosedStatus =

        function (

            value

        ) {

            if (

                !value

            ) {

                return false;

            }


            const status =

                String(

                    value

                )

                    .trim()

                    .toUpperCase();


            return SightingConstants
                .CLOSED_STATUSES
                .includes(

                    status

                );

        };


    /*=====================================================
      HELPER
      NORMALIZE STATUS
    =====================================================*/

    SightingConstants.normalizeStatus =

        function (

            value

        ) {

            if (

                value == null

            ) {

                return "";

            }


            const raw =

                String(

                    value

                )

                    .trim()

                    .toUpperCase();


            return (

                SightingConstants
                    .STATUS_ALIASES[
                        raw
                    ] ||

                raw

            );

        };


    /*=====================================================
      HELPER
      NORMALIZE DIRECTION
    =====================================================*/

    SightingConstants.normalizeDirection =

        function (

            value

        ) {

            if (

                value == null

            ) {

                return "";

            }


            const raw =

                String(

                    value

                )

                    .trim()

                    .toUpperCase()

                    .replace(

                        /[_-]+/g,

                        " "

                    )

                    .replace(

                        /\s+/g,

                        " "

                    );


            return (

                SightingConstants
                    .DIRECTION_ALIASES[
                        raw
                    ] ||

                raw.replace(

                    /\s+/g,

                    "_"

                )

            );

        };


    /*=====================================================
      HELPER
      GET FIELD NAME
    =====================================================*/

    SightingConstants.getField =

        function (

            key

        ) {

            if (

                !key

            ) {

                return null;

            }


            return (

                SightingConstants
                    .FIELDS[
                        key
                    ] ||

                null

            );

        };


    /*=====================================================
      HELPER
      GET KEYWORDS
    =====================================================*/

    SightingConstants.getKeywords =

        function (

            group

        ) {

            if (

                !group

            ) {

                return [];

            }


            const values =

                SightingConstants
                    .KEYWORDS[
                        group
                    ];


            return Array.isArray(

                values

            )

                ? values.slice()

                : [];

        };


    /*=====================================================
      HELPER
      GET ALL KEYWORDS
    =====================================================*/

    SightingConstants.getAllKeywords =

        function () {

            const result = [];


            Object.values(

                SightingConstants.KEYWORDS

            ).forEach(

                function (

                    group

                ) {

                    if (

                        !Array.isArray(

                            group

                        )

                    ) {

                        return;

                    }


                    group.forEach(

                        function (

                            keyword

                        ) {

                            if (

                                !result.includes(

                                    keyword

                                )

                            ) {

                                result.push(

                                    keyword

                                );

                            }

                        }

                    );

                }

            );


            return result;

        };


    /*=====================================================
      FREEZE MODULE
    =====================================================*/

    Object.freeze(

        SightingConstants

    );


    /*=====================================================
      REGISTER
    =====================================================*/

    GG.SightingConstants =

        SightingConstants;


    /*=====================================================
      OPTIONAL DEBUG
    =====================================================*/

    if (

        GG.Config?.DEBUG?.ENABLED

    ) {

        console.log(

            "%cGreenGuard SightingConstants Loaded",

            "color:#008000;font-weight:bold;",

            {

                version:

                    SightingConstants.VERSION,

                domain:

                    SightingConstants.DOMAIN,

                intents:

                    Object.keys(

                        SightingConstants.INTENTS

                    ).length,

                fields:

                    Object.keys(

                        SightingConstants.FIELDS

                    ).length,

                keywordGroups:

                    Object.keys(

                        SightingConstants.KEYWORDS

                    ).length,

                multiUser:

                    SightingConstants.MULTI_USER.ENABLED

            }

        );

    }


})(window);
