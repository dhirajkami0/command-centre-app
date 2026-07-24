/*!
 * GreenGuard AI
 * sightingEntities.js
 *
 * Version: 1.0.0
 *
 * PURPOSE
 * ---------------------------------------------------------
 * Canonical entity/data layer for elephant sightings.
 *
 * SOURCE OF TRUTH
 * ---------------------------------------------------------
 * Firestore:
 *
 *     elephant_sightings
 *
 * ARCHITECTURE
 * ---------------------------------------------------------
 *
 * Firestore elephant_sightings
 *          ↓
 * SightingEntities.load()
 *          ↓
 * normalizeSightingDocument()
 *          ↓
 * Canonical Sighting Objects
 *          ↓
 * Search Indexes
 *          ↓
 * SightingIntent
 * SightingQuery
 * SightingRouter
 * SightingFormatter
 *
 * IMPORTANT
 * ---------------------------------------------------------
 * This module:
 *
 * - reads elephant_sightings
 * - normalizes legacy/current field names
 * - preserves raw Firestore data
 * - builds immutable canonical sighting objects
 * - indexes sightings by ID
 * - indexes by division/range/beat/compartment
 * - indexes by village
 * - indexes by reporter/updater
 * - indexes lifecycle status
 * - indexes active/resolved/moved/driven sightings
 * - supports multiple simultaneous sightings
 * - supports multiple users
 * - supports multiple ranges/beats/divisions
 * - provides spatial nearest-sighting helpers
 *
 * This module DOES NOT:
 *
 * - determine natural-language intent
 * - decide user permissions
 * - update Firestore
 * - render AI responses
 * - change sighting status
 * - calculate operational recommendations
 * - calculate new conflict-risk scores
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

        GG.SightingEntities

    ) {

        console.warn(

            "[GreenGuardAI] SightingEntities already loaded."

        );

        return;

    }


    /*=====================================================
      MODULE
    =====================================================*/

    const SightingEntities = {};


    /*=====================================================
      VERSION
    =====================================================*/

    SightingEntities.VERSION =

        "1.0.0";


    /*=====================================================
      INTERNAL STATE
    =====================================================*/

    let loaded = false;

    let loading = false;

    let loadPromise = null;

    let lastLoadedAt = 0;

    let lastError = null;


    /*=====================================================
      CANONICAL STORAGE
    =====================================================*/

    let sightings = [];


    /*=====================================================
      INTERNAL INDEX
    =====================================================*/

    let index = null;


    /*=====================================================
      EMPTY INDEX
    =====================================================*/

    function createEmptyIndex() {

        return {

            byId: {},

            byFirestoreId: {},

            byParentId: {},

            byFinancialYear: {},

            byDivision: {},

            byRange: {},

            byBeat: {},

            byCompartment: {},

            byVillage: {},

            byVillageCode: {},

            byVillageLGD: {},

            byNearestVillage: {},

            byReporter: {},

            byUpdater: {},

            byStatus: {},

            byMarkerState: {},

            byRisk: {},

            byDirection: {},

            active: [],

            resolved: [],

            moved: [],

            driven: [],

            depredation: [],

            driving: [],

            highRisk: [],

            withGPS: [],

            withoutGPS: []

        };

    }


    /*=====================================================
      BASIC HELPERS
    =====================================================*/

    function firstDefined() {

        for (

            let i = 0;

            i < arguments.length;

            i++

        ) {

            const value =

                arguments[i];


            if (

                value !== undefined &&

                value !== null

            ) {

                return value;

            }

        }


        return undefined;

    }


    function firstText() {

        for (

            let i = 0;

            i < arguments.length;

            i++

        ) {

            const value =

                arguments[i];


            if (

                value === undefined ||

                value === null

            ) {

                continue;

            }


            const text =

                String(value).trim();


            if (text) {

                return text;

            }

        }


        return "";

    }


    function toNumber(

        value,

        fallback = null

    ) {

        if (

            value === "" ||

            value === undefined ||

            value === null

        ) {

            return fallback;

        }


        const number =

            Number(value);


        return Number.isFinite(number)

            ? number

            : fallback;

    }


    function toInteger(

        value,

        fallback = null

    ) {

        const number =

            toNumber(

                value,

                fallback

            );


        if (

            number === null ||

            number === undefined

        ) {

            return fallback;

        }


        return Math.trunc(number);

    }


    function toBoolean(

        value,

        fallback = false

    ) {

        if (

            typeof value === "boolean"

        ) {

            return value;

        }


        if (

            typeof value === "number"

        ) {

            return value !== 0;

        }


        if (

            typeof value === "string"

        ) {

            const normalized =

                value

                    .trim()

                    .toUpperCase();


            if (

                [

                    "TRUE",

                    "YES",

                    "Y",

                    "1",

                    "ACTIVE",

                    "ON"

                ].includes(normalized)

            ) {

                return true;

            }


            if (

                [

                    "FALSE",

                    "NO",

                    "N",

                    "0",

                    "OFF",

                    "RESOLVED",

                    "CLOSED"

                ].includes(normalized)

            ) {

                return false;

            }

        }


        return fallback;

    }


    /*=====================================================
      NAME NORMALIZER
    =====================================================*/

    function normalizeName(

        value

    ) {

        if (

            value === undefined ||

            value === null

        ) {

            return "";

        }


        if (

            typeof GG.normalizeName ===

            "function"

        ) {

            try {

                return GG.normalizeName(

                    value

                );

            }

            catch (err) {

                // Fall through.

            }

        }


        return String(value)

            .normalize("NFKD")

            .replace(

                /[\u0300-\u036f]/g,

                ""

            )

            .toUpperCase()

            .replace(

                /&/g,

                "AND"

            )

            .replace(

                /[(){}\[\].,_\-\/\\]/g,

                " "

            )

            .replace(

                /\s+/g,

                ""

            )

            .trim();

    }


    /*=====================================================
      TEXT NORMALIZER
    =====================================================*/

    function normalizeText(

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

                /[^A-Z0-9]+/g,

                " "

            )

            .replace(

                /\s+/g,

                " "

            )

            .trim();

    }


    /*=====================================================
      FIRESTORE TIMESTAMP NORMALIZER
    =====================================================*/

    function normalizeTimestamp(

        value

    ) {

        if (

            value === undefined ||

            value === null ||

            value === ""

        ) {

            return null;

        }


        try {

            if (

                typeof value.toDate ===

                "function"

            ) {

                const date =

                    value.toDate();


                if (

                    date instanceof Date &&

                    !Number.isNaN(

                        date.getTime()

                    )

                ) {

                    return {

                        date:

                            date,

                        ms:

                            date.getTime(),

                        iso:

                            date.toISOString()

                    };

                }

            }


            if (

                typeof value.seconds ===

                "number"

            ) {

                const ms =

                    (

                        value.seconds *

                        1000

                    ) +

                    Math.floor(

                        Number(

                            value.nanoseconds ||

                            0

                        ) /

                        1000000

                    );


                const date =

                    new Date(ms);


                return {

                    date:

                        date,

                    ms:

                        ms,

                    iso:

                        date.toISOString()

                };

            }


            if (

                typeof value ===

                "number"

            ) {

                let ms = value;


                /*
                 * Support Unix seconds.
                 */

                if (

                    value > 0 &&

                    value < 100000000000

                ) {

                    ms =

                        value * 1000;

                }


                const date =

                    new Date(ms);


                if (

                    !Number.isNaN(

                        date.getTime()

                    )

                ) {

                    return {

                        date:

                            date,

                        ms:

                            date.getTime(),

                        iso:

                            date.toISOString()

                    };

                }

            }


            const date =

                new Date(value);


            if (

                !Number.isNaN(

                    date.getTime()

                )

            ) {

                return {

                    date:

                        date,

                    ms:

                        date.getTime(),

                    iso:

                        date.toISOString()

                };

            }

        }

        catch (err) {

            // Ignore malformed timestamps.

        }


        return null;

    }


    /*=====================================================
      GET TIMESTAMP VALUE
    =====================================================*/

    function timestampMS(

        value

    ) {

        const normalized =

            normalizeTimestamp(

                value

            );


        return normalized

            ? normalized.ms

            : 0;

    }


    /*=====================================================
      STATUS NORMALIZER
    =====================================================*/

    function normalizeStatus(

        value,

        active

    ) {

        const Constants =

            GG.SightingConstants;


        if (

            Constants &&

            typeof Constants.normalizeStatus ===

            "function"

        ) {

            const normalized =

                Constants.normalizeStatus(

                    value

                );


            if (normalized) {

                return normalized;

            }

        }


        let status =

            firstText(value)

                .toUpperCase();


        if (

            status === "CLOSED"

        ) {

            status = "RESOLVED";

        }


        if (

            status === "CURRENT" ||

            status === "LIVE"

        ) {

            status = "ACTIVE";

        }


        if (!status) {

            status =

                active === false

                    ? "RESOLVED"

                    : "ACTIVE";

        }


        return status;

    }


    /*=====================================================
      DIRECTION NORMALIZER
    =====================================================*/

    function normalizeDirection(

        value

    ) {

        if (!value) {

            return "";

        }


        const Constants =

            GG.SightingConstants;


        if (

            Constants &&

            typeof Constants.normalizeDirection ===

            "function"

        ) {

            return Constants

                .normalizeDirection(

                    value

                );

        }


        return String(value)

            .trim()

            .toUpperCase()

            .replace(

                /[\s-]+/g,

                "_"

            );

    }


    /*=====================================================
      RISK NORMALIZER
    =====================================================*/

    function normalizeRisk(

        value

    ) {

        if (

            value === undefined ||

            value === null

        ) {

            return "";

        }


        const raw =

            String(value)

                .trim()

                .toUpperCase();


        if (

            raw === "VERY HIGH" ||

            raw === "SEVERE"

        ) {

            return "CRITICAL";

        }


        if (

            [

                "LOW",

                "MEDIUM",

                "HIGH",

                "CRITICAL"

            ].includes(raw)

        ) {

            return raw;

        }


        return raw;

    }


    /*=====================================================
      FIRESTORE DOCUMENT ID FROM VISIBLE ID
    =====================================================*/

    function createFirestoreId(

        sightingId

    ) {

        if (!sightingId) {

            return "";

        }


        return String(

            sightingId

        ).replace(

            /\//g,

            "__"

        );

    }


    /*=====================================================
      VISIBLE ID FROM FIRESTORE DOCUMENT ID
    =====================================================*/

    function createVisibleId(

        firestoreId

    ) {

        if (!firestoreId) {

            return "";

        }


        return String(

            firestoreId

        ).replace(

            /__/g,

            "/"

        );

    }


    /*=====================================================
      HAVERSINE DISTANCE
    =====================================================*/

    function distanceMeters(

        lat1,

        lon1,

        lat2,

        lon2

    ) {

        lat1 = Number(lat1);

        lon1 = Number(lon1);

        lat2 = Number(lat2);

        lon2 = Number(lon2);


        if (

            !Number.isFinite(lat1) ||

            !Number.isFinite(lon1) ||

            !Number.isFinite(lat2) ||

            !Number.isFinite(lon2)

        ) {

            return null;

        }


        const R =

            6371000;


        const toRad =

            Math.PI /

            180;


        const φ1 =

            lat1 * toRad;


        const φ2 =

            lat2 * toRad;


        const Δφ =

            (

                lat2 -

                lat1

            ) * toRad;


        const Δλ =

            (

                lon2 -

                lon1

            ) * toRad;


        const a =

            Math.sin(

                Δφ / 2

            ) ** 2 +

            Math.cos(φ1) *

            Math.cos(φ2) *

            Math.sin(

                Δλ / 2

            ) ** 2;


        const c =

            2 *

            Math.atan2(

                Math.sqrt(a),

                Math.sqrt(

                    1 - a

                )

            );


        return R * c;

    }


    /*=====================================================
      ARRAY GROUP HELPER
    =====================================================*/

    function addToGroup(

        group,

        key,

        value

    ) {

        if (

            !group ||

            !key ||

            !value

        ) {

            return;

        }


        if (

            !Array.isArray(

                group[key]

            )

        ) {

            group[key] = [];

        }


        if (

            !group[key].includes(

                value

            )

        ) {

            group[key].push(

                value

            );

        }

    }


    /*=====================================================
      BOOLEAN-LIKE OPERATIONAL VALUE

      Used for depredation/driving fields which may contain
      booleans, YES/NO, counts, or descriptive strings.
    =====================================================*/

    function hasOperationalValue(

        value

    ) {

        if (

            value === undefined ||

            value === null ||

            value === ""

        ) {

            return false;

        }


        if (

            typeof value === "boolean"

        ) {

            return value;

        }


        if (

            typeof value === "number"

        ) {

            return value > 0;

        }


        const normalized =

            String(value)

                .trim()

                .toUpperCase();


        if (

            !normalized ||

            [

                "NO",

                "NONE",

                "FALSE",

                "0",

                "N/A",

                "NA",

                "NIL"

            ].includes(normalized)

        ) {

            return false;

        }


        return true;

    }


    /*=====================================================
      NORMALIZE ONE FIRESTORE DOCUMENT
    =====================================================*/

    SightingEntities.normalizeSightingDocument =

        function (

            data,

            firestoreId = ""

        ) {

            data =

                data &&

                typeof data === "object"

                    ? data

                    : {};


            /*---------------------------------------------
              IDENTITY
            ---------------------------------------------*/

            const sightingId =

                firstText(

                    data.sighting_id,

                    data.sightingId,

                    data.sightingID,

                    data.id,

                    createVisibleId(

                        firestoreId

                    )

                );


            const canonicalFirestoreId =

                firstText(

                    firestoreId,

                    data.firestore_id,

                    data.firestoreId,

                    createFirestoreId(

                        sightingId

                    )

                );


            const parentId =

                firstText(

                    data.parent_id,

                    data.parentId

                );


            /*---------------------------------------------
              ACTIVE / STATUS
            ---------------------------------------------*/

            const rawActive =

                firstDefined(

                    data.active,

                    data.is_active,

                    data.isActive

                );


            let active =

                rawActive === undefined

                    ? true

                    : toBoolean(

                        rawActive,

                        true

                    );


            const status =

                normalizeStatus(

                    firstText(

                        data.status,

                        data.sighting_status,

                        data.sightingStatus

                    ),

                    active

                );


            /*
             * RESOLVED is authoritative.
             */

            if (

                status === "RESOLVED"

            ) {

                active = false;

            }


            /*
             * ACTIVE / MOVED / DRIVEN sightings remain
             * operationally active unless explicitly
             * stored otherwise.
             */

            if (

                [

                    "ACTIVE",

                    "MOVED",

                    "DRIVEN"

                ].includes(status) &&

                rawActive === undefined

            ) {

                active = true;

            }


            /*---------------------------------------------
              MARKER
            ---------------------------------------------*/

            let markerVisible =

                toBoolean(

                    firstDefined(

                        data.marker_visible,

                        data.markerVisible

                    ),

                    active

                );


            if (

                status === "RESOLVED"

            ) {

                markerVisible = false;

            }


            let markerState =

                firstText(

                    data.marker_state,

                    data.markerState

                )

                    .toUpperCase();


            if (!markerState) {

                if (

                    status === "MOVED" ||

                    status === "DRIVEN"

                ) {

                    markerState =

                        "STATIC_GREY";

                }

                else if (

                    status === "RESOLVED"

                ) {

                    markerState =

                        "RESOLVED";

                }

                else {

                    markerState =

                        "ACTIVE";

                }

            }


            /*---------------------------------------------
              GPS
            ---------------------------------------------*/

            const lat =

                toNumber(

                    firstDefined(

                        data.lat,

                        data.latitude,

                        data.Latitude

                    )

                );


            const lon =

                toNumber(

                    firstDefined(

                        data.lon,

                        data.lng,

                        data.longitude,

                        data.Longitude

                    )

                );


            const hasGPS =

                Number.isFinite(lat) &&

                Number.isFinite(lon);


            /*---------------------------------------------
              GIS
            ---------------------------------------------*/

            const division =

                firstText(

                    data.gis_division,

                    data.division,

                    data.Division

                );


            const range =

                firstText(

                    data.gis_range,

                    data.range,

                    data.Range

                );


            const beat =

                firstText(

                    data.gis_beat,

                    data.beat,

                    data.Beat

                );


            const compartment =

                firstText(

                    data.gis_compartment,

                    data.compartment,

                    data.compt,

                    data.Compartment

                );


            /*---------------------------------------------
              OFFICIAL VILLAGE
            ---------------------------------------------*/

            const village =

                firstText(

                    data.village,

                    data.official_village,

                    data.officialVillage

                );


            const villageCode =

                firstText(

                    data.village_code,

                    data.villageCode

                );


            const villageLGD =

                firstText(

                    data.village_lgd,

                    data.villageLGD,

                    data.village_lgd_code,

                    data.lgd_code

                );


            const villageDistrict =

                firstText(

                    data.village_district,

                    data.villageDistrict

                );


            const villageSubdistrict =

                firstText(

                    data.village_subdistrict,

                    data.villageSubdistrict,

                    data.village_block,

                    data.block

                );


            const villagePincode =

                firstText(

                    data.village_pincode,

                    data.villagePincode,

                    data.pincode

                );


            /*---------------------------------------------
              NEAREST NAMED LOCATION
            ---------------------------------------------*/

            const nearestVillage =

                firstText(

                    data.nearest_village,

                    data.nearestVillage,

                    data.nearest_location,

                    data.nearestLocation

                );


            const nearestLocation =

                firstText(

                    data.nearest_location,

                    data.nearestLocation,

                    nearestVillage

                );


            const nearestDistanceM =

                toNumber(

                    firstDefined(

                        data.nearest_village_distance_m,

                        data.nearest_location_distance_m,

                        data.nearestVillageDistance,

                        data.nearestLocationDistance,

                        data.distanceMeters

                    )

                );


            let nearestDistanceKm =

                toNumber(

                    firstDefined(

                        data.nearest_village_distance_km,

                        data.nearest_location_distance_km,

                        data.nearestVillageDistanceKm

                    )

                );


            if (

                nearestDistanceKm === null &&

                nearestDistanceM !== null

            ) {

                nearestDistanceKm =

                    nearestDistanceM /

                    1000;

            }


            const nearestRisk =

                normalizeRisk(

                    firstText(

                        data.nearest_village_risk,

                        data.nearest_location_risk,

                        data.nearestVillageRisk,

                        data.risk,

                        data.risk_level

                    )

                );


            const conflictHistory =

                toInteger(

                    firstDefined(

                        data.nearest_village_conflict_history,

                        data.nearest_location_conflict_history,

                        data.nearestVillageConflictHistory,

                        data.conflict_history,

                        data.conflictHistory

                    ),

                    0

                );


            const nearestVillageLat =

                toNumber(

                    firstDefined(

                        data.nearest_village_lat,

                        data.nearest_location_lat,

                        data.nearestVillageLat

                    )

                );


            const nearestVillageLon =

                toNumber(

                    firstDefined(

                        data.nearest_village_lon,

                        data.nearest_location_lon,

                        data.nearestVillageLon

                    )

                );


            const nearestPhone =

                firstText(

                    data.nearest_location_phone,

                    data.nearest_village_phone,

                    data.nearestLocationPhone

                );


            const nearestWhatsapp =

                firstText(

                    data.nearest_location_whatsapp,

                    data.nearest_village_whatsapp,

                    data.nearestLocationWhatsapp

                );


            /*---------------------------------------------
              HERD
            ---------------------------------------------*/

            /*---------------------------------------------
              ELEPHANT / HERD COUNT

              Firestore source fields:
                  total_seen
                  m
                  f
                  calf
                  unidentified

              total_seen is authoritative when available.

              If total_seen is absent or zero, derive the
              herd size from composition.

              Existing legacy herd fields are retained as
              fallbacks for backward compatibility.
            ---------------------------------------------*/

            const maleCount =

                toInteger(

                    firstDefined(

                        data.m,

                        data.male,

                        data.males

                    ),

                    0

                );


            const femaleCount =

                toInteger(

                    firstDefined(

                        data.f,

                        data.female,

                        data.females

                    ),

                    0

                );


            const calfCount =

                toInteger(

                    firstDefined(

                        data.calf,

                        data.calves

                    ),

                    0

                );


            const unidentifiedCount =

                toInteger(

                    firstDefined(

                        data.unidentified,

                        data.unknown,

                        data.unknown_count

                    ),

                    0

                );


            const compositionTotal =

                maleCount +

                femaleCount +

                calfCount +

                unidentifiedCount;


            const explicitHerd =

                toInteger(

                    firstDefined(

                        data.total_seen,

                        data.totalSeen,

                        data.herd,

                        data.herd_size,

                        data.herdSize,

                        data.elephant_count,

                        data.elephantCount,

                        data.number_of_elephants

                    ),

                    0

                );


            const herd =

                explicitHerd > 0

                    ? explicitHerd

                    : compositionTotal;


            /*---------------------------------------------
              MOVEMENT
            ---------------------------------------------*/

            const direction =

                normalizeDirection(

                    firstText(

                        data.movement_direction,

                        data.direction,

                        data.move_direction,

                        data.moveDirection

                    )

                );


            /*---------------------------------------------
              DEPREDATION / DRIVING
            ---------------------------------------------*/

            const depredation =

                firstDefined(

                    data.depredation,

                    data.crop_damage,

                    data.cropDamage

                );


            const involved =

                firstDefined(

                    data.involved,

                    data.people_involved,

                    data.staff_involved

                );


            const driving =

                firstDefined(

                    data.driving,

                    data.elephant_driving,

                    data.driving_operation

                );


            const remarks =

                firstText(

                    data.remarks,

                    data.remark,

                    data.notes,

                    data.note

                );


            /*---------------------------------------------
              COUNTERS
            ---------------------------------------------*/

            const rangeNo =

                toInteger(

                    firstDefined(

                        data.range_sighting_no,

                        data.rangeNo,

                        data.range_no

                    )

                );


            const divisionNo =

                toInteger(

                    firstDefined(

                        data.division_sighting_no,

                        data.divisionNo,

                        data.division_no

                    )

                );


            /*---------------------------------------------
              FINANCIAL YEAR
            ---------------------------------------------*/

            const financialYear =

                firstText(

                    data.financial_year,

                    data.financialYear,

                    data.fy,

                    data.FY

                );


            /*---------------------------------------------
              STAFF / USER
            ---------------------------------------------*/

            const reportedBy =

                firstText(

                    data.reported_by,

                    data.reportedBy,

                    data.reporter,

                    data.staff_name,

                    data.staffName,

                    data.created_by,

                    data.createdBy

                );


            const reportedById =

                firstText(

                    data.reported_by_id,

                    data.reportedById,

                    data.reporter_id,

                    data.reporterId,

                    data.staff_id,

                    data.staffId,

                    data.created_by_id,

                    data.createdById

                );


            const updatedBy =

                firstText(

                    data.updated_by,

                    data.updatedBy,

                    data.last_updated_by,

                    data.lastUpdatedBy

                );


            const updatedById =

                firstText(

                    data.updated_by_id,

                    data.updatedById,

                    data.last_updated_by_id,

                    data.lastUpdatedById

                );


            /*---------------------------------------------
              TIME
            ---------------------------------------------*/

            const sightingTime =

                normalizeTimestamp(

                    firstDefined(

                        data.sighting_datetime,

                        data.sightingDateTime,

                        data.sighting_time,

                        data.sightingTime,

                        data.timestamp,

                        data.time,

                        data.date_time,

                        data.datetime

                    )

                );


            const createdTime =

                normalizeTimestamp(

                    firstDefined(

                        data.created_at,

                        data.createdAt,

                        data.timestamp,

                        data.time

                    )

                );


            const updatedTime =

                normalizeTimestamp(

                    firstDefined(

                        data.updated_at,

                        data.updatedAt,

                        data.last_updated_at,

                        data.lastUpdatedAt

                    )

                );


            const resolvedTime =

                normalizeTimestamp(

                    firstDefined(

                        data.resolved_at,

                        data.resolvedAt

                    )

                );


            /*---------------------------------------------
              LOCATION STRING
            ---------------------------------------------*/

            const location =

                firstText(

                    data.location,

                    (

                        hasGPS

                            ? lat + "," + lon

                            : ""

                    )

                );


            /*---------------------------------------------
              OPERATIONAL FLAGS
            ---------------------------------------------*/

            const hasDepredation =

                hasOperationalValue(

                    depredation

                );


            const hasDriving =

                hasOperationalValue(

                    driving

                ) ||

                status === "DRIVEN";


            const isMoved =

                status === "MOVED";


            const isDriven =

                status === "DRIVEN";


            const isResolved =

                status === "RESOLVED";


            const isActive =

                active === true &&

                !isResolved;


            const isHighRisk =

                [

                    "HIGH",

                    "CRITICAL"

                ].includes(

                    nearestRisk

                );


            /*---------------------------------------------
              SEARCH TOKENS
            ---------------------------------------------*/

            const searchParts = [

                sightingId,

                canonicalFirestoreId,

                parentId,

                financialYear,

                division,

                range,

                beat,

                compartment,

                village,

                villageCode,

                villageLGD,

                villageDistrict,

                villageSubdistrict,

                villagePincode,

                nearestVillage,

                nearestLocation,

                nearestRisk,

                status,

                markerState,

                direction,

                reportedBy,

                reportedById,

                updatedBy,

                updatedById,

                remarks

            ];


            const searchText =

                normalizeText(

                    searchParts

                        .filter(Boolean)

                        .join(" ")

                );


            const searchTokens =

                Array.from(

                    new Set(

                        searchText

                            .split(" ")

                            .filter(Boolean)

                    )

                );


            /*---------------------------------------------
              CANONICAL OBJECT
            ---------------------------------------------*/

            const canonical = {

                /*-----------------------------------------
                  Identity
                -----------------------------------------*/

                id:

                    sightingId,

                sightingId:

                    sightingId,

                firestoreId:

                    canonicalFirestoreId,

                parentId:

                    parentId,

                financialYear:

                    financialYear,


                /*-----------------------------------------
                  Counter Identity
                -----------------------------------------*/

                rangeNo:

                    rangeNo,

                divisionNo:

                    divisionNo,


                /*-----------------------------------------
                  GPS
                -----------------------------------------*/

                lat:

                    lat,

                lon:

                    lon,

                latitude:

                    lat,

                longitude:

                    lon,

                location:

                    location,

                hasGPS:

                    hasGPS,


                /*-----------------------------------------
                  GIS
                -----------------------------------------*/

                division:

                    division,

                range:

                    range,

                beat:

                    beat,

                compartment:

                    compartment,


                gis: Object.freeze({

                    division:

                        division,

                    range:

                        range,

                    beat:

                        beat,

                    compartment:

                        compartment

                }),


                /*-----------------------------------------
                  Official Village
                -----------------------------------------*/

                village:

                    village,

                villageCode:

                    villageCode,

                villageLGD:

                    villageLGD,

                villageDistrict:

                    villageDistrict,

                villageSubdistrict:

                    villageSubdistrict,

                villagePincode:

                    villagePincode,


                officialVillage:

                    Object.freeze({

                        name:

                            village,

                        code:

                            villageCode,

                        lgd:

                            villageLGD,

                        district:

                            villageDistrict,

                        subdistrict:

                            villageSubdistrict,

                        pincode:

                            villagePincode

                    }),


                /*-----------------------------------------
                  Nearest Named Location / Risk Point
                -----------------------------------------*/

                nearestVillage:

                    nearestVillage,

                nearestLocation:

                    nearestLocation,

                nearestVillageDistanceM:

                    nearestDistanceM,

                nearestLocationDistanceM:

                    nearestDistanceM,

                nearestVillageDistanceKm:

                    nearestDistanceKm,

                nearestRisk:

                    nearestRisk,

                conflictHistory:

                    conflictHistory,

                nearestVillageLat:

                    nearestVillageLat,

                nearestVillageLon:

                    nearestVillageLon,

                nearestLocationPhone:

                    nearestPhone,

                nearestLocationWhatsapp:

                    nearestWhatsapp,


                riskContext:

                    Object.freeze({

                        village:

                            nearestVillage,

                        location:

                            nearestLocation,

                        distanceM:

                            nearestDistanceM,

                        distanceKm:

                            nearestDistanceKm,

                        risk:

                            nearestRisk,

                        conflictHistory:

                            conflictHistory,

                        lat:

                            nearestVillageLat,

                        lon:

                            nearestVillageLon,

                        phone:

                            nearestPhone,

                        whatsapp:

                            nearestWhatsapp

                    }),


                /*-----------------------------------------
                  Elephant / Herd
                -----------------------------------------*/

                herd:

                    herd,

                herdSize:

                    herd,

                elephantCount:

                    herd,

                maleCount:

                    maleCount,

                femaleCount:

                    femaleCount,

                calfCount:

                    calfCount,

                unidentifiedCount:

                    unidentifiedCount,

                elephantComposition:

                    Object.freeze({

                        male:

                            maleCount,

                        female:

                            femaleCount,

                        calf:

                            calfCount,

                        unidentified:

                            unidentifiedCount,

                        total:

                            herd

                    }),


                /*-----------------------------------------
                  Movement
                -----------------------------------------*/

                direction:

                    direction,

                movementDirection:

                    direction,


                /*-----------------------------------------
                  Operational Fields
                -----------------------------------------*/

                depredation:

                    depredation,

                involved:

                    involved,

                driving:

                    driving,

                remarks:

                    remarks,


                /*-----------------------------------------
                  Lifecycle
                -----------------------------------------*/

                status:

                    status,

                active:

                    active,

                markerVisible:

                    markerVisible,

                markerState:

                    markerState,


                /*-----------------------------------------
                  Derived Lifecycle
                -----------------------------------------*/

                isActive:

                    isActive,

                isResolved:

                    isResolved,

                isMoved:

                    isMoved,

                isDriven:

                    isDriven,

                hasDepredation:

                    hasDepredation,

                hasDriving:

                    hasDriving,

                isHighRisk:

                    isHighRisk,


                /*-----------------------------------------
                  Staff / Multi-user
                -----------------------------------------*/

                reportedBy:

                    reportedBy,

                reportedById:

                    reportedById,

                updatedBy:

                    updatedBy,

                updatedById:

                    updatedById,


                reporter:

                    Object.freeze({

                        name:

                            reportedBy,

                        id:

                            reportedById

                    }),


                updater:

                    Object.freeze({

                        name:

                            updatedBy,

                        id:

                            updatedById

                    }),


                /*-----------------------------------------
                  Time
                -----------------------------------------*/

                sightingAt:

                    sightingTime

                        ? sightingTime.iso

                        : "",

                sightingAtMs:

                    sightingTime

                        ? sightingTime.ms

                        : 0,

                createdAt:

                    createdTime

                        ? createdTime.iso

                        : "",

                createdAtMs:

                    createdTime

                        ? createdTime.ms

                        : 0,

                updatedAt:

                    updatedTime

                        ? updatedTime.iso

                        : "",

                updatedAtMs:

                    updatedTime

                        ? updatedTime.ms

                        : 0,

                resolvedAt:

                    resolvedTime

                        ? resolvedTime.iso

                        : "",

                resolvedAtMs:

                    resolvedTime

                        ? resolvedTime.ms

                        : 0,


                /*-----------------------------------------
                  Search
                -----------------------------------------*/

                searchText:

                    searchText,

                searchTokens:

                    Object.freeze(

                        searchTokens

                    ),


                /*-----------------------------------------
                  Original Firestore Data

                  Shallow clone prevents callers from
                  directly mutating the source object.
                -----------------------------------------*/

                raw:

                    Object.freeze({

                        ...data

                    })

            };


            return Object.freeze(

                canonical

            );

        };


    /*=====================================================
      BUILD INDEXES
    =====================================================*/

    SightingEntities.buildIndexes =

        function (

            source = sightings

        ) {

            const nextIndex =

                createEmptyIndex();


            (

                Array.isArray(source)

                    ? source

                    : []

            ).forEach(

                function (

                    sighting

                ) {

                    if (!sighting) {

                        return;

                    }


                    /*-------------------------------------
                      ID
                    -------------------------------------*/

                    if (

                        sighting.sightingId

                    ) {

                        nextIndex.byId[

                            sighting.sightingId

                        ] = sighting;

                    }


                    if (

                        sighting.firestoreId

                    ) {

                        nextIndex.byFirestoreId[

                            sighting.firestoreId

                        ] = sighting;

                    }


                    /*-------------------------------------
                      GROUPS
                    -------------------------------------*/

                    addToGroup(

                        nextIndex.byParentId,

                        sighting.parentId,

                        sighting

                    );


                    addToGroup(

                        nextIndex.byFinancialYear,

                        normalizeName(

                            sighting.financialYear

                        ),

                        sighting

                    );


                    addToGroup(

                        nextIndex.byDivision,

                        normalizeName(

                            sighting.division

                        ),

                        sighting

                    );


                    addToGroup(

                        nextIndex.byRange,

                        normalizeName(

                            sighting.range

                        ),

                        sighting

                    );


                    addToGroup(

                        nextIndex.byBeat,

                        normalizeName(

                            sighting.beat

                        ),

                        sighting

                    );


                    addToGroup(

                        nextIndex.byCompartment,

                        normalizeName(

                            sighting.compartment

                        ),

                        sighting

                    );


                    addToGroup(

                        nextIndex.byVillage,

                        normalizeName(

                            sighting.village

                        ),

                        sighting

                    );


                    addToGroup(

                        nextIndex.byVillageCode,

                        normalizeName(

                            sighting.villageCode

                        ),

                        sighting

                    );


                    addToGroup(

                        nextIndex.byVillageLGD,

                        normalizeName(

                            sighting.villageLGD

                        ),

                        sighting

                    );


                    addToGroup(

                        nextIndex.byNearestVillage,

                        normalizeName(

                            sighting.nearestVillage

                        ),

                        sighting

                    );


                    addToGroup(

                        nextIndex.byReporter,

                        normalizeName(

                            sighting.reportedBy

                        ),

                        sighting

                    );


                    addToGroup(

                        nextIndex.byUpdater,

                        normalizeName(

                            sighting.updatedBy

                        ),

                        sighting

                    );


                    addToGroup(

                        nextIndex.byStatus,

                        normalizeName(

                            sighting.status

                        ),

                        sighting

                    );


                    addToGroup(

                        nextIndex.byMarkerState,

                        normalizeName(

                            sighting.markerState

                        ),

                        sighting

                    );


                    addToGroup(

                        nextIndex.byRisk,

                        normalizeName(

                            sighting.nearestRisk

                        ),

                        sighting

                    );


                    addToGroup(

                        nextIndex.byDirection,

                        normalizeName(

                            sighting.direction

                        ),

                        sighting

                    );


                    /*-------------------------------------
                      LIFECYCLE
                    -------------------------------------*/

                    if (

                        sighting.isActive

                    ) {

                        nextIndex.active.push(

                            sighting

                        );

                    }


                    if (

                        sighting.isResolved

                    ) {

                        nextIndex.resolved.push(

                            sighting

                        );

                    }


                    if (

                        sighting.isMoved

                    ) {

                        nextIndex.moved.push(

                            sighting

                        );

                    }


                    if (

                        sighting.isDriven

                    ) {

                        nextIndex.driven.push(

                            sighting

                        );

                    }


                    /*-------------------------------------
                      OPERATIONS
                    -------------------------------------*/

                    if (

                        sighting.hasDepredation

                    ) {

                        nextIndex.depredation.push(

                            sighting

                        );

                    }


                    if (

                        sighting.hasDriving

                    ) {

                        nextIndex.driving.push(

                            sighting

                        );

                    }


                    if (

                        sighting.isHighRisk

                    ) {

                        nextIndex.highRisk.push(

                            sighting

                        );

                    }


                    /*-------------------------------------
                      GPS
                    -------------------------------------*/

                    if (

                        sighting.hasGPS

                    ) {

                        nextIndex.withGPS.push(

                            sighting

                        );

                    }

                    else {

                        nextIndex.withoutGPS.push(

                            sighting

                        );

                    }

                }

            );


            index = nextIndex;


            return index;

        };


    /*=====================================================
      INTERNAL SORT NEWEST
    =====================================================*/

    function newestTime(

        sighting

    ) {

        return (

            sighting.updatedAtMs ||

            sighting.sightingAtMs ||

            sighting.createdAtMs ||

            0

        );

    }


    function sortNewest(

        values

    ) {

        return values

            .slice()

            .sort(

                function (

                    a,

                    b

                ) {

                    return (

                        newestTime(b) -

                        newestTime(a)

                    );

                }

            );

    }


    /*=====================================================
      WAIT FOR FIREBASE
    =====================================================*/

    SightingEntities.waitForFirebase =

        async function (

            timeout = 15000

        ) {

            const started =

                Date.now();


            while (true) {

                if (

                    window.db &&

                    window.fb &&

                    typeof window.fb.collection ===

                        "function" &&

                    typeof window.fb.getDocs ===

                        "function"

                ) {

                    return true;

                }


                if (

                    Date.now() -

                    started >

                    timeout

                ) {

                    throw new Error(

                        "Firebase initialization timeout while loading sightings."

                    );

                }


                await new Promise(

                    function (

                        resolve

                    ) {

                        setTimeout(

                            resolve,

                            100

                        );

                    }

                );

            }

        };


    /*=====================================================
      LOAD FROM FIRESTORE
    =====================================================*/

    SightingEntities.load =

        async function (

            options = {}

        ) {

            const force =

                options.force === true;


            /*---------------------------------------------
              Already Loaded
            ---------------------------------------------*/

            if (

                loaded &&

                !force

            ) {

                return sightings.slice();

            }


            /*---------------------------------------------
              Already Loading
            ---------------------------------------------*/

            if (

                loading &&

                loadPromise

            ) {

                return loadPromise;

            }


            loading = true;

            lastError = null;


            loadPromise =

                (

                    async function () {

                        try {

                            await SightingEntities

                                .waitForFirebase();


                            const collectionName =

                                GG.SightingConstants
                                    ?.COLLECTIONS
                                    ?.SIGHTINGS ||

                                "elephant_sightings";


                            const collectionRef =

                                window.fb.collection(

                                    window.db,

                                    collectionName

                                );


                            const snapshot =

                                await window.fb.getDocs(

                                    collectionRef

                                );


                            const normalized = [];


                            snapshot.forEach(

                                function (

                                    docSnapshot

                                ) {

                                    try {

                                        const canonical =

                                            SightingEntities
                                                .normalizeSightingDocument(

                                                    docSnapshot.data(),

                                                    docSnapshot.id

                                                );


                                        normalized.push(

                                            canonical

                                        );

                                    }

                                    catch (err) {

                                        console.error(

                                            "[SightingEntities] Failed to normalize sighting:",

                                            docSnapshot.id,

                                            err

                                        );

                                    }

                                }

                            );


                            sightings =

                                sortNewest(

                                    normalized

                                );


                            SightingEntities

                                .buildIndexes(

                                    sightings

                                );


                            loaded = true;

                            lastLoadedAt =

                                Date.now();


                            return sightings.slice();

                        }

                        catch (err) {

                            lastError = err;

                            loaded = false;


                            console.error(

                                "[SightingEntities] Load failed:",

                                err

                            );


                            throw err;

                        }

                        finally {

                            loading = false;

                            loadPromise = null;

                        }

                    }

                )();


            return loadPromise;

        };


    /*=====================================================
      BUILD FROM EXISTING DATA

      Useful if another part of GreenGuard already loaded
      elephant sightings and you do not want another
      Firestore read.
    =====================================================*/

    SightingEntities.buildFromData =

        function (

            records

        ) {

            if (

                !Array.isArray(records)

            ) {

                records = [];

            }


            const normalized =

                records

                    .map(

                        function (

                            record,

                            position

                        ) {

                            if (

                                !record

                            ) {

                                return null;

                            }


                            /*
                             * Already canonical.
                             */

                            if (

                                record.sightingId &&

                                record.raw &&

                                Object.isFrozen(

                                    record

                                )

                            ) {

                                return record;

                            }


                            const firestoreId =

                                firstText(

                                    record.firestoreId,

                                    record.firestore_id,

                                    record.docId,

                                    record.documentId

                                );


                            return SightingEntities

                                .normalizeSightingDocument(

                                    record,

                                    firestoreId ||

                                    ""

                                );

                        }

                    )

                    .filter(Boolean);


            sightings =

                sortNewest(

                    normalized

                );


            SightingEntities

                .buildIndexes(

                    sightings

                );


            loaded = true;

            loading = false;

            lastLoadedAt =

                Date.now();

            lastError = null;


            return sightings.slice();

        };


    /*=====================================================
      READY
    =====================================================*/

    SightingEntities.ready =

        function () {

            return loaded;

        };


    /*=====================================================
      IS LOADING
    =====================================================*/

    SightingEntities.isLoading =

        function () {

            return loading;

        };


    /*=====================================================
      ENSURE READY
    =====================================================*/

    SightingEntities.ensureReady =

        async function () {

            if (loaded) {

                return true;

            }


            await SightingEntities.load();


            return loaded;

        };


    /*=====================================================
      GET ALL
    =====================================================*/

    SightingEntities.getAll =

        function () {

            return sightings.slice();

        };


    /*=====================================================
      COUNT
    =====================================================*/

    SightingEntities.count =

        function () {

            return sightings.length;

        };


    /*=====================================================
      GET BY VISIBLE SIGHTING ID
    =====================================================*/

    SightingEntities.getById =

        function (

            value

        ) {

            if (!value) {

                return null;

            }


            if (!index) {

                SightingEntities

                    .buildIndexes();

            }


            const raw =

                String(value).trim();


            return (

                index.byId[raw] ||

                index.byFirestoreId[raw] ||

                index.byFirestoreId[

                    createFirestoreId(raw)

                ] ||

                index.byId[

                    createVisibleId(raw)

                ] ||

                null

            );

        };


    /*=====================================================
      GET BY FIRESTORE ID
    =====================================================*/

    SightingEntities.getByFirestoreId =

        function (

            value

        ) {

            if (!value) {

                return null;

            }


            if (!index) {

                SightingEntities

                    .buildIndexes();

            }


            const raw =

                String(value).trim();


            return (

                index.byFirestoreId[raw] ||

                null

            );

        };


    /*=====================================================
      GENERIC GROUP LOOKUP
    =====================================================*/

    function getGroup(

        group,

        value

    ) {

        if (!value) {

            return [];

        }


        if (!index) {

            SightingEntities

                .buildIndexes();

        }


        const key =

            normalizeName(value);


        const result =

            group[key];


        return Array.isArray(result)

            ? sortNewest(result)

            : [];

    }


    /*=====================================================
      BY FINANCIAL YEAR
    =====================================================*/

    SightingEntities.getByFinancialYear =

        function (

            value

        ) {

            if (!index) {

                SightingEntities

                    .buildIndexes();

            }


            return getGroup(

                index.byFinancialYear,

                value

            );

        };


    /*=====================================================
      BY DIVISION
    =====================================================*/

    SightingEntities.getByDivision =

        function (

            value

        ) {

            if (!index) {

                SightingEntities

                    .buildIndexes();

            }


            return getGroup(

                index.byDivision,

                value

            );

        };


    /*=====================================================
      BY RANGE
    =====================================================*/

    SightingEntities.getByRange =

        function (

            value

        ) {

            if (!index) {

                SightingEntities

                    .buildIndexes();

            }


            /*
             * Use existing GIS range alias resolver.

             * Example:
             *
             * EDPO -> EastDamanpur
             */

            let resolved = value;


            if (

                GG.GISEntities &&

                typeof GG.GISEntities
                    .resolveRangeAlias ===

                    "function"

            ) {

                resolved =

                    GG.GISEntities
                        .resolveRangeAlias(

                            value

                        );

            }


            return getGroup(

                index.byRange,

                resolved

            );

        };


    /*=====================================================
      BY BEAT
    =====================================================*/

    SightingEntities.getByBeat =

        function (

            value

        ) {

            if (!index) {

                SightingEntities

                    .buildIndexes();

            }


            return getGroup(

                index.byBeat,

                value

            );

        };


    /*=====================================================
      BY COMPARTMENT
    =====================================================*/

    SightingEntities.getByCompartment =

        function (

            value

        ) {

            if (!index) {

                SightingEntities

                    .buildIndexes();

            }


            return getGroup(

                index.byCompartment,

                value

            );

        };


    /*=====================================================
      BY OFFICIAL VILLAGE
    =====================================================*/

    SightingEntities.getByVillage =

        function (

            value

        ) {

            if (!index) {

                SightingEntities

                    .buildIndexes();

            }


            return getGroup(

                index.byVillage,

                value

            );

        };


    /*=====================================================
      BY VILLAGE CODE
    =====================================================*/

    SightingEntities.getByVillageCode =

        function (

            value

        ) {

            if (!index) {

                SightingEntities

                    .buildIndexes();

            }


            return getGroup(

                index.byVillageCode,

                value

            );

        };


    /*=====================================================
      BY VILLAGE LGD
    =====================================================*/

    SightingEntities.getByVillageLGD =

        function (

            value

        ) {

            if (!index) {

                SightingEntities

                    .buildIndexes();

            }


            return getGroup(

                index.byVillageLGD,

                value

            );

        };


    /*=====================================================
      BY NEAREST RISK VILLAGE
    =====================================================*/

    SightingEntities.getByNearestVillage =

        function (

            value

        ) {

            if (!index) {

                SightingEntities

                    .buildIndexes();

            }


            return getGroup(

                index.byNearestVillage,

                value

            );

        };


    /*=====================================================
      BY REPORTER
    =====================================================*/

    SightingEntities.getByReporter =

        function (

            value

        ) {

            if (!index) {

                SightingEntities

                    .buildIndexes();

            }


            return getGroup(

                index.byReporter,

                value

            );

        };


    /*=====================================================
      BY UPDATER
    =====================================================*/

    SightingEntities.getByUpdater =

        function (

            value

        ) {

            if (!index) {

                SightingEntities

                    .buildIndexes();

            }


            return getGroup(

                index.byUpdater,

                value

            );

        };


    /*=====================================================
      BY STATUS
    =====================================================*/

    SightingEntities.getByStatus =

        function (

            value

        ) {

            if (!index) {

                SightingEntities

                    .buildIndexes();

            }


            const status =

                normalizeStatus(

                    value,

                    true

                );


            return getGroup(

                index.byStatus,

                status

            );

        };


    /*=====================================================
      BY RISK
    =====================================================*/

    SightingEntities.getByRisk =

        function (

            value

        ) {

            if (!index) {

                SightingEntities

                    .buildIndexes();

            }


            return getGroup(

                index.byRisk,

                normalizeRisk(value)

            );

        };


    /*=====================================================
      BY DIRECTION
    =====================================================*/

    SightingEntities.getByDirection =

        function (

            value

        ) {

            if (!index) {

                SightingEntities

                    .buildIndexes();

            }


            return getGroup(

                index.byDirection,

                normalizeDirection(value)

            );

        };


    /*=====================================================
      ACTIVE
    =====================================================*/

    SightingEntities.getActive =

        function () {

            if (!index) {

                SightingEntities

                    .buildIndexes();

            }


            return sortNewest(

                index.active

            );

        };


    /*=====================================================
      RESOLVED
    =====================================================*/

    SightingEntities.getResolved =

        function () {

            if (!index) {

                SightingEntities

                    .buildIndexes();

            }


            return sortNewest(

                index.resolved

            );

        };


    /*=====================================================
      MOVED
    =====================================================*/

    SightingEntities.getMoved =

        function () {

            if (!index) {

                SightingEntities

                    .buildIndexes();

            }


            return sortNewest(

                index.moved

            );

        };


    /*=====================================================
      DRIVEN
    =====================================================*/

    SightingEntities.getDriven =

        function () {

            if (!index) {

                SightingEntities

                    .buildIndexes();

            }


            return sortNewest(

                index.driven

            );

        };


    /*=====================================================
      DEPREDATION
    =====================================================*/

    SightingEntities.getDepredation =

        function () {

            if (!index) {

                SightingEntities

                    .buildIndexes();

            }


            return sortNewest(

                index.depredation

            );

        };


    /*=====================================================
      DRIVING
    =====================================================*/

    SightingEntities.getDriving =

        function () {

            if (!index) {

                SightingEntities

                    .buildIndexes();

            }


            return sortNewest(

                index.driving

            );

        };


    /*=====================================================
      HIGH RISK
    =====================================================*/

    SightingEntities.getHighRisk =

        function () {

            if (!index) {

                SightingEntities

                    .buildIndexes();

            }


            return sortNewest(

                index.highRisk

            );

        };


    /*=====================================================
      LATEST
    =====================================================*/

    SightingEntities.getLatest =

        function (

            options = {}

        ) {

            let source =

                options.activeOnly === true

                    ? SightingEntities
                        .getActive()

                    : sightings.slice();


            source =

                sortNewest(source);


            return source.length

                ? source[0]

                : null;

        };


    /*=====================================================
      GET LATEST N
    =====================================================*/

    SightingEntities.getLatestMany =

        function (

            limit = 10,

            options = {}

        ) {

            limit =

                Math.max(

                    0,

                    Number(limit) ||

                    10

                );


            const source =

                options.activeOnly === true

                    ? SightingEntities
                        .getActive()

                    : sortNewest(

                        sightings

                    );


            return source.slice(

                0,

                limit

            );

        };


    /*=====================================================
      NEAREST SIGHTING
    =====================================================*/

    SightingEntities.findNearest =

        function (

            lat,

            lon,

            options = {}

        ) {

            lat = Number(lat);

            lon = Number(lon);


            if (

                !Number.isFinite(lat) ||

                !Number.isFinite(lon)

            ) {

                return null;

            }


            let source =

                options.activeOnly === false

                    ? sightings.slice()

                    : SightingEntities
                        .getActive();


            if (

                options.division

            ) {

                const key =

                    normalizeName(

                        options.division

                    );


                source =

                    source.filter(

                        function (

                            item

                        ) {

                            return (

                                normalizeName(

                                    item.division

                                ) === key

                            );

                        }

                    );

            }


            if (

                options.range

            ) {

                let range =

                    options.range;


                if (

                    GG.GISEntities &&

                    typeof GG.GISEntities
                        .resolveRangeAlias ===

                        "function"

                ) {

                    range =

                        GG.GISEntities
                            .resolveRangeAlias(

                                range

                            );

                }


                const key =

                    normalizeName(range);


                source =

                    source.filter(

                        function (

                            item

                        ) {

                            return (

                                normalizeName(

                                    item.range

                                ) === key

                            );

                        }

                    );

            }


            let nearest = null;

            let nearestDistance =

                Infinity;


            source.forEach(

                function (

                    sighting

                ) {

                    if (

                        !sighting.hasGPS

                    ) {

                        return;

                    }


                    const distance =

                        distanceMeters(

                            lat,

                            lon,

                            sighting.lat,

                            sighting.lon

                        );


                    if (

                        distance !== null &&

                        distance <

                        nearestDistance

                    ) {

                        nearestDistance =

                            distance;

                        nearest =

                            sighting;

                    }

                }

            );


            if (!nearest) {

                return null;

            }


            return {

                sighting:

                    nearest,

                distanceMeters:

                    Math.round(

                        nearestDistance

                    ),

                distanceKm:

                    Number(

                        (

                            nearestDistance /

                            1000

                        ).toFixed(3)

                    )

            };

        };


    /*=====================================================
      FIND NEARBY
    =====================================================*/

    SightingEntities.findNearby =

        function (

            lat,

            lon,

            radiusMeters = 5000,

            options = {}

        ) {

            lat = Number(lat);

            lon = Number(lon);

            radiusMeters =

                Number(radiusMeters);


            if (

                !Number.isFinite(lat) ||

                !Number.isFinite(lon) ||

                !Number.isFinite(

                    radiusMeters

                )

            ) {

                return [];

            }


            const source =

                options.activeOnly === false

                    ? sightings.slice()

                    : SightingEntities
                        .getActive();


            return source

                .map(

                    function (

                        sighting

                    ) {

                        if (

                            !sighting.hasGPS

                        ) {

                            return null;

                        }


                        const distance =

                            distanceMeters(

                                lat,

                                lon,

                                sighting.lat,

                                sighting.lon

                            );


                        if (

                            distance === null ||

                            distance >

                            radiusMeters

                        ) {

                            return null;

                        }


                        return {

                            sighting:

                                sighting,

                            distanceMeters:

                                Math.round(

                                    distance

                                ),

                            distanceKm:

                                Number(

                                    (

                                        distance /

                                        1000

                                    ).toFixed(3)

                                )

                        };

                    }

                )

                .filter(Boolean)

                .sort(

                    function (

                        a,

                        b

                    ) {

                        return (

                            a.distanceMeters -

                            b.distanceMeters

                        );

                    }

                );

        };


    /*=====================================================
      GENERIC SEARCH
    =====================================================*/

    SightingEntities.search =

        function (

            text,

            options = {}

        ) {

            if (!text) {

                return [];

            }


            const query =

                normalizeText(text);


            if (!query) {

                return [];

            }


            const tokens =

                query

                    .split(" ")

                    .filter(Boolean);


            let source =

                options.activeOnly === true

                    ? SightingEntities
                        .getActive()

                    : sightings.slice();


            const results =

                source

                    .map(

                        function (

                            sighting

                        ) {

                            let score = 0;


                            /*
                             * Exact sighting ID.
                             */

                            if (

                                normalizeText(

                                    sighting.sightingId

                                ) === query

                            ) {

                                score += 100;

                            }


                            /*
                             * Exact Firestore ID.
                             */

                            if (

                                normalizeText(

                                    sighting.firestoreId

                                ) === query

                            ) {

                                score += 100;

                            }


                            /*
                             * Exact GIS/location matches.
                             */

                            [

                                sighting.division,

                                sighting.range,

                                sighting.beat,

                                sighting.compartment,

                                sighting.village,

                                sighting.nearestVillage,

                                sighting.reportedBy

                            ].forEach(

                                function (

                                    value

                                ) {

                                    if (

                                        value &&

                                        normalizeText(

                                            value

                                        ) === query

                                    ) {

                                        score += 30;

                                    }

                                }

                            );


                            /*
                             * Full phrase.
                             */

                            if (

                                sighting.searchText

                                    .includes(query)

                            ) {

                                score += 20;

                            }


                            /*
                             * Token matching.
                             */

                            tokens.forEach(

                                function (

                                    token

                                ) {

                                    if (

                                        sighting.searchTokens

                                            .includes(token)

                                    ) {

                                        score += 5;

                                    }

                                }

                            );


                            return {

                                sighting:

                                    sighting,

                                score:

                                    score

                            };

                        }

                    )

                    .filter(

                        function (

                            item

                        ) {

                            return (

                                item.score > 0

                            );

                        }

                    )

                    .sort(

                        function (

                            a,

                            b

                        ) {

                            if (

                                b.score !==

                                a.score

                            ) {

                                return (

                                    b.score -

                                    a.score

                                );

                            }


                            return (

                                newestTime(

                                    b.sighting

                                ) -

                                newestTime(

                                    a.sighting

                                )

                            );

                        }

                    );


            const limit =

                Number(

                    options.limit

                );


            const finalResults =

                Number.isFinite(limit) &&

                limit >= 0

                    ? results.slice(

                        0,

                        limit

                    )

                    : results;


            if (

                options.withScore === true

            ) {

                return finalResults;

            }


            return finalResults.map(

                function (

                    item

                ) {

                    return item.sighting;

                }

            );

        };


    /*=====================================================
      FILTER

      General reusable filtering for SightingQuery.
    =====================================================*/

    SightingEntities.filter =

        function (

            criteria = {}

        ) {

            let result =

                sightings.slice();


            if (

                criteria.active === true

            ) {

                result =

                    result.filter(

                        item =>

                            item.isActive

                    );

            }


            if (

                criteria.resolved === true

            ) {

                result =

                    result.filter(

                        item =>

                            item.isResolved

                    );

            }


            if (

                criteria.status

            ) {

                const status =

                    normalizeStatus(

                        criteria.status,

                        true

                    );


                result =

                    result.filter(

                        item =>

                            item.status ===

                            status

                    );

            }


            const exactFields = [

                "division",

                "range",

                "beat",

                "compartment",

                "village",

                "nearestVillage",

                "reportedBy",

                "updatedBy",

                "financialYear"

            ];


            exactFields.forEach(

                function (

                    field

                ) {

                    if (

                        !criteria[field]

                    ) {

                        return;

                    }


                    let expected =

                        criteria[field];


                    if (

                        field === "range" &&

                        GG.GISEntities &&

                        typeof GG.GISEntities
                            .resolveRangeAlias ===

                            "function"

                    ) {

                        expected =

                            GG.GISEntities
                                .resolveRangeAlias(

                                    expected

                                );

                    }


                    const key =

                        normalizeName(

                            expected

                        );


                    result =

                        result.filter(

                            function (

                                item

                            ) {

                                return (

                                    normalizeName(

                                        item[field]

                                    ) === key

                                );

                            }

                        );

                }

            );


            if (

                criteria.risk

            ) {

                const risk =

                    normalizeRisk(

                        criteria.risk

                    );


                result =

                    result.filter(

                        item =>

                            item.nearestRisk ===

                            risk

                    );

            }


            if (

                criteria.highRisk === true

            ) {

                result =

                    result.filter(

                        item =>

                            item.isHighRisk

                    );

            }


            if (

                criteria.depredation === true

            ) {

                result =

                    result.filter(

                        item =>

                            item.hasDepredation

                    );

            }


            if (

                criteria.driving === true

            ) {

                result =

                    result.filter(

                        item =>

                            item.hasDriving

                    );

            }


            if (

                criteria.moved === true

            ) {

                result =

                    result.filter(

                        item =>

                            item.isMoved

                    );

            }


            if (

                criteria.driven === true

            ) {

                result =

                    result.filter(

                        item =>

                            item.isDriven

                    );

            }


            if (

                criteria.hasGPS === true

            ) {

                result =

                    result.filter(

                        item =>

                            item.hasGPS

                    );

            }


            if (

                Number.isFinite(

                    Number(

                        criteria.minHerd

                    )

                )

            ) {

                const minimum =

                    Number(

                        criteria.minHerd

                    );


                result =

                    result.filter(

                        item =>

                            Number(

                                item.herd

                            ) >= minimum

                    );

            }


            if (

                Number.isFinite(

                    Number(

                        criteria.maxHerd

                    )

                )

            ) {

                const maximum =

                    Number(

                        criteria.maxHerd

                    );


                result =

                    result.filter(

                        item =>

                            Number(

                                item.herd

                            ) <= maximum

                    );

            }


            if (

                criteria.from

            ) {

                const from =

                    timestampMS(

                        criteria.from

                    );


                if (from) {

                    result =

                        result.filter(

                            item =>

                                newestTime(

                                    item

                                ) >= from

                        );

                }

            }


            if (

                criteria.to

            ) {

                const to =

                    timestampMS(

                        criteria.to

                    );


                if (to) {

                    result =

                        result.filter(

                            item =>

                                newestTime(

                                    item

                                ) <= to

                        );

                }

            }


            result =

                sortNewest(result);


            if (

                Number.isFinite(

                    Number(

                        criteria.limit

                    )

                )

            ) {

                result =

                    result.slice(

                        0,

                        Math.max(

                            0,

                            Number(

                                criteria.limit

                            )

                        )

                    );

            }


            return result;

        };


    /*=====================================================
      GET OPERATIONAL SUMMARY
    =====================================================*/

    SightingEntities.getSummary =

        function () {

            if (!index) {

                SightingEntities

                    .buildIndexes();

            }


            const unique =

                function (

                    values

                ) {

                    return new Set(

                        values

                            .filter(Boolean)

                            .map(

                                normalizeName

                            )

                    ).size;

                };


            return {

                total:

                    sightings.length,

                active:

                    index.active.length,

                resolved:

                    index.resolved.length,

                moved:

                    index.moved.length,

                driven:

                    index.driven.length,

                depredation:

                    index.depredation.length,

                driving:

                    index.driving.length,

                highRisk:

                    index.highRisk.length,

                withGPS:

                    index.withGPS.length,

                withoutGPS:

                    index.withoutGPS.length,

                divisions:

                    unique(

                        sightings.map(

                            item =>

                                item.division

                        )

                    ),

                ranges:

                    unique(

                        sightings.map(

                            item =>

                                item.range

                        )

                    ),

                beats:

                    unique(

                        sightings.map(

                            item =>

                                item.beat

                        )

                    ),

                compartments:

                    unique(

                        sightings.map(

                            item =>

                                item.compartment

                        )

                    ),

                villages:

                    unique(

                        sightings.map(

                            item =>

                                item.village ||

                                item.nearestVillage

                        )

                    ),

                reporters:

                    unique(

                        sightings.map(

                            item =>

                                item.reportedBy

                        )

                    ),

                totalElephants:

                    sightings.reduce(

                        function (

                            total,

                            item

                        ) {

                            return (

                                total +

                                (

                                    Number(

                                        item.herd

                                    ) ||

                                    0

                                )

                            );

                        },

                        0

                    ),

                activeElephants:

                    index.active.reduce(

                        function (

                            total,

                            item

                        ) {

                            return (

                                total +

                                (

                                    Number(

                                        item.herd

                                    ) ||

                                    0

                                )

                            );

                        },

                        0

                    ),

                lastLoadedAt:

                    lastLoadedAt

            };

        };


    /*=====================================================
      GET INDEX STATS
    =====================================================*/

    SightingEntities.getStats =

        function () {

            if (!index) {

                SightingEntities

                    .buildIndexes();

            }


            return {

                version:

                    SightingEntities.VERSION,

                loaded:

                    loaded,

                loading:

                    loading,

                total:

                    sightings.length,

                ids:

                    Object.keys(

                        index.byId

                    ).length,

                firestoreIds:

                    Object.keys(

                        index.byFirestoreId

                    ).length,

                financialYears:

                    Object.keys(

                        index.byFinancialYear

                    ).length,

                divisions:

                    Object.keys(

                        index.byDivision

                    ).length,

                ranges:

                    Object.keys(

                        index.byRange

                    ).length,

                beats:

                    Object.keys(

                        index.byBeat

                    ).length,

                compartments:

                    Object.keys(

                        index.byCompartment

                    ).length,

                villages:

                    Object.keys(

                        index.byVillage

                    ).length,

                nearestVillages:

                    Object.keys(

                        index.byNearestVillage

                    ).length,

                reporters:

                    Object.keys(

                        index.byReporter

                    ).length,

                statuses:

                    Object.keys(

                        index.byStatus

                    ).length,

                active:

                    index.active.length,

                moved:

                    index.moved.length,

                driven:

                    index.driven.length,

                resolved:

                    index.resolved.length,

                highRisk:

                    index.highRisk.length,

                depredation:

                    index.depredation.length,

                driving:

                    index.driving.length,

                lastLoadedAt:

                    lastLoadedAt,

                error:

                    lastError

                        ? lastError.message

                        : null

            };

        };


    /*=====================================================
      REFRESH
    =====================================================*/

    SightingEntities.refresh =

        async function () {

            return SightingEntities.load({

                force: true

            });

        };


    /*=====================================================
      RESET
    =====================================================*/

    SightingEntities.reset =

        function () {

            loaded = false;

            loading = false;

            loadPromise = null;

            lastLoadedAt = 0;

            lastError = null;

            sightings = [];

            index = null;


            return true;

        };


    /*=====================================================
      REBUILD INDEX

      Does NOT reread Firestore.
    =====================================================*/

    SightingEntities.rebuild =

        function () {

            SightingEntities

                .buildIndexes(

                    sightings

                );


            return SightingEntities

                .getStats();

        };


    /*=====================================================
      PUBLIC ID HELPERS
    =====================================================*/

    SightingEntities.toFirestoreId =

        function (

            sightingId

        ) {

            return createFirestoreId(

                sightingId

            );

        };


    SightingEntities.toSightingId =

        function (

            firestoreId

        ) {

            return createVisibleId(

                firestoreId

            );

        };


    /*=====================================================
      PUBLIC DISTANCE HELPER
    =====================================================*/

    SightingEntities.distanceMeters =

        function (

            lat1,

            lon1,

            lat2,

            lon2

        ) {

            return distanceMeters(

                lat1,

                lon1,

                lat2,

                lon2

            );

        };


    /*=====================================================
      REGISTER
    =====================================================*/

    GG.SightingEntities =

        SightingEntities;


    /*=====================================================
      DEBUG
    =====================================================*/

    if (

        GG.Config?.DEBUG?.ENABLED

    ) {

        console.log(

            "%cGreenGuard SightingEntities Loaded",

            "color:#008000;font-weight:bold;",

            SightingEntities.VERSION

        );

    }


})(window);
