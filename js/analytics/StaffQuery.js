(function (

    window

) {

"use strict";

/*=========================================================
 GREENGUARD AI
=========================================================*/

const GG =

    window.GreenGuardAI =

    window.GreenGuardAI ||

    {};

/*=========================================================
 DEPENDENCIES
=========================================================*/

const StaffConstants =

    GG.StaffConstants;

const StaffEntities =

    GG.StaffEntities;

const StaffIntent =

    GG.StaffIntent;

/*=========================================================
 VALIDATE DEPENDENCIES
=========================================================*/

if (

    !StaffConstants

) {

    throw new Error(

        "StaffConstants not loaded."

    );

}

if (

    !StaffEntities

) {

    throw new Error(

        "StaffEntities not loaded."

    );

}

if (

    !StaffIntent

) {

    throw new Error(

        "StaffIntent not loaded."

    );

}

/*=========================================================
 NOTE
=========================================================*/

/*
    StaffQuery.js intentionally DOES NOT depend on
    StaffRouter.

    Dependency chain:

        StaffConstants
              ↓
        StaffEntities
              ↓
        StaffIntent
              ↓
        StaffQuery
              ↓
        GG.queryStaffProfile()
        GG.queryStaffContact()
        GG.queryStaffPosting()
              ↓
        StaffRouter
              ↓
        AIDispatcher
              ↓
        Controller
              ↓
        Core

    Therefore DO NOT validate or reference
    GG.StaffRouter inside this file.
*/
/*=========================================================
 MODULE
=========================================================*/

const StaffQuery =

    GG.StaffQuery =

    GG.StaffQuery ||

    {};

/*=========================================================
 VERSION
=========================================================*/

StaffQuery.VERSION =
    StaffConstants.VERSION;

 /*=========================================================
 MODULE STATUS
=========================================================*/

StaffQuery.loaded =

    false;

StaffQuery.loading =

    false;

/*=========================================================
 CACHE
=========================================================*/

StaffQuery.cache =

    new Map();

StaffQuery.lastQuery =

    null;

StaffQuery.lastResult =

    null;

/*=========================================================
 STATISTICS
=========================================================*/

StaffQuery.statistics = {

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
 CONFIGURATION
=========================================================*/

StaffQuery.MAX_CACHE_SIZE =

    500;

StaffQuery.CACHE_ENABLED =

    true;

 /*=========================================================
 INITIALIZE
=========================================================*/

StaffQuery.initialize = function () {

    if (

        StaffQuery.loaded

    ) {

        return true;

    }

    if (

        StaffQuery.loading

    ) {

        return false;

    }

    StaffQuery.loading =

        true;

    /*----------------------------------
      Reset Cache
    ----------------------------------*/

    StaffQuery.cache.clear();

    /*----------------------------------
      Reset Statistics
    ----------------------------------*/

    StaffQuery.statistics.queries =

        0;

    StaffQuery.statistics.cacheHits =

        0;

    StaffQuery.statistics.cacheMisses =

        0;

    StaffQuery.statistics.successes =

        0;

    StaffQuery.statistics.failures =

        0;

    StaffQuery.statistics.totalExecutionTime =

        0;

    StaffQuery.statistics.averageExecutionTime =

        0;

    StaffQuery.lastQuery =

        null;

    StaffQuery.lastResult =

        null;

    /*----------------------------------
      Ready
    ----------------------------------*/

    StaffQuery.loaded =

        true;

    StaffQuery.loading =

        false;

    console.log(

        "✅ StaffQuery Ready"

    );

    return true;

};

 /*=========================================================
 CREATE RESPONSE
=========================================================*/

/*=========================================================
 CREATE RESPONSE
=========================================================*/

StaffQuery.createResponse = function (

    request = {}

) {

    return {

        success:

            false,

        source:

            "LOCAL",

        domain:

            StaffConstants.DOMAIN ||

            "STAFF",

        intent:

            request.intent ||

            null,

        confidence:

            request.confidence ||

            0,

        query:

            request.originalQuery ||

            "",

        entities:

            request.entities ||

            {},

        parameters:

            request.parameters ||

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

                StaffConstants.VERSION,

            module:

                "StaffQuery",

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

/*----------------------------------
  Get Cache
----------------------------------*/

StaffQuery.getCache = function (

    key

) {

    if (

        !StaffQuery.CACHE_ENABLED ||

        !key

    ) {

        return null;

    }

    const cached =

        StaffQuery.cache.get(

            key

        );

    if (

        cached

    ) {

        StaffQuery.statistics.cacheHits++;

        return cached;

    }

    StaffQuery.statistics.cacheMisses++;

    return null;

};

/*----------------------------------
  Set Cache
----------------------------------*/

StaffQuery.setCache = function (

    key,

    value

) {

    if (

        !StaffQuery.CACHE_ENABLED ||

        !key

    ) {

        return;

    }

    if (

        StaffQuery.cache.size >=

        StaffQuery.MAX_CACHE_SIZE

    ) {

        const firstKey =

            StaffQuery.cache.keys()

                .next()

                .value;

        StaffQuery.cache.delete(

            firstKey

        );

    }

    StaffQuery.cache.set(

        key,

        value

    );

};

/*----------------------------------
  Clear Cache
----------------------------------*/

StaffQuery.clearCache = function () {

    StaffQuery.cache.clear();

};

/*----------------------------------
  Has Cache
----------------------------------*/

StaffQuery.hasCache = function (

    key

) {

    if (

        !StaffQuery.CACHE_ENABLED

    ) {

        return false;

    }

    return StaffQuery.cache.has(

        key

    );

};
StaffQuery.resolveReferenceStaff = function (
    request
) {

    request = request || {};

    const parameters =
        request.parameters || {};

    const entities =
        request.entities || {};

    /*----------------------------------
      1. Named Staff
    ----------------------------------*/

    if (

        Array.isArray(
            entities.staff
        ) &&

        entities.staff.length > 0

    ) {

        return StaffQuery.ensureSingleStaff(
            request
        );

    }

    /*----------------------------------
      2. SELF
    ----------------------------------*/

    if (

        parameters.reference ===
        "SELF"

    ) {

        return StaffQuery.getCurrentUser();

    }

    /*----------------------------------
      3. AUTO
    ----------------------------------*/

    return StaffQuery.getCurrentUser();

};
StaffQuery.getCurrentUser = function () {

    /*----------------------------------
      Logged-in User
    ----------------------------------*/

    if (

        !window.userProfile ||

        !window.userProfile.cleanName

    ) {

        throw new Error(

            "Current user unavailable."

        );

    }

    /*----------------------------------
      Runtime Hydrated Profile
    ----------------------------------*/

    const profile =

        GreenGuardAI
            .StaffHydrator
            .hydrate(

                window.userProfile.cleanName

            );

    if (

        !profile

    ) {

        throw new Error(

            "Current user not found."

        );

    }

    return profile;

};
    /*=========================================================
  Circle Count
=========================================================*/

GG.queryCircleCount = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            /*----------------------------------
              Filter Staff
            ----------------------------------*/

            const staff =

                StaffQuery.filterStaff(

                    request

                );

            /*----------------------------------
              Count Summary
            ----------------------------------*/

            const summary =

                StaffQuery.buildCount(

                    staff

                );

            /*----------------------------------
              Return
            ----------------------------------*/

            return {

                jurisdiction:

                    "CIRCLE",

                circle:

                    request.parameters?.circle ||

                    "",

                count:

                    summary.count,

                activeStaff:

                    summary.activeStaff,

                inactiveStaff:

                    summary.inactiveStaff,

                movingStaff:

                    summary.movingStaff,

                stationaryStaff:

                    summary.stationaryStaff,

                totalDistanceKm:

                    summary.totalDistanceKm,

                totalPatrolPoints:

                    summary.totalPatrolPoints,

                staff:

                    staff

            };

        }

    );

};
 /*=========================================================
 EXECUTE QUERY
=========================================================*/

StaffQuery.execute = async function (

    request,

    handler

) {

    const started =

        Date.now();

    StaffQuery.statistics.queries++;

    console.log(
        "===================================="
    );

    console.log(
        "StaffQuery.execute()"
    );

    console.log(
        "REQUEST"
    );

    console.log(
        request
    );

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

        StaffQuery.createResponse(

            request

        );

    /*----------------------------------
      Preserve Canonical Request
    ----------------------------------*/

    response.request =

        request;

    response.intent =

        request.intent;

    response.domain =

        request.domain;

    response.entities =

        request.entities ||

        {};

    response.parameters =

        request.parameters ||

        {};

    response.context =

        request.context ||

        {};

    const cacheKey = JSON.stringify({

        intent:

            request.intent,

        entities:

            request.entities ||

            {},

        parameters:

            request.parameters ||

            {},

        normalizedQuery:

            request.normalizedQuery ||

            request.query ||

            ""

    });

    console.log(
        "CACHE KEY"
    );

    console.log(
        cacheKey
    );

    console.log(
        "CACHE SIZE"
    );

    console.log(
        StaffQuery.cache.size
    );

    console.log(
        "CACHE KEYS"
    );

    console.log(
        [...StaffQuery.cache.keys()]
    );

    const cached =

        StaffQuery.getCache(

            cacheKey

        );

    if (

        cached &&

        cached.success === true

    ) {

        console.log(

            "✅ CACHE HIT"

        );

        const cachedResponse =

            structuredClone(

                cached

            );

        cachedResponse.metadata =

            cachedResponse.metadata ||

            {};

        cachedResponse.metadata.cache =

            true;

        cachedResponse.request =

            request;

        cachedResponse.intent =

            request.intent;

        cachedResponse.domain =

            request.domain;

        cachedResponse.entities =

            request.entities ||

            {};

        cachedResponse.parameters =

            request.parameters ||

            {};

        cachedResponse.context =

            request.context ||

            {};

        return cachedResponse;

    }

    if (

        cached &&

        cached.success !== true

    ) {

        console.warn(

            "🗑 Removing Failed Cache",

            cacheKey

        );

        StaffQuery.cache.delete(

            cacheKey

        );

    }

    try {

        console.log(
            "CALLING HANDLER"
        );

        const result =

            await handler(

                request

            );

        console.log(
            "HANDLER RESULT"
        );

        console.log(
            result
        );

        console.log(
            "HANDLER RESULT LENGTH"
        );

        console.log(

            Array.isArray(

                result

            )

                ?

                result.length

                :

                null

        );

        response.data =

            result;

        /*----------------------------------
          Preserve Canonical Request
        ----------------------------------*/

        response.request =

            request;

        response.intent =

            request.intent;

        response.domain =

            request.domain;

        response.entities =

            request.entities ||

            {};

        response.parameters =

            request.parameters ||

            {};

        response.context =

            request.context ||

            {};

        console.log(
            "RESPONSE.DATA"
        );

        console.log(
            response.data
        );

        console.log(
            "RESPONSE.DATA LENGTH"
        );

        console.log(

            Array.isArray(

                response.data

            )

                ?

                response.data.length

                :

                null

        );

        if (

            Array.isArray(

                result

            )

        ) {

            response.staffList =

                result;

        }

        else if (

            result &&

            typeof result ===

            "object"

        ) {

            response.staff =

                result;

        }

        response.success =

            true;

        response.count =

            Array.isArray(

                result

            )

                ?

                result.length

                :

                result

                    ?

                    1

                    :

                    0;

        StaffQuery.statistics.successes++;

    }

    catch (

        error

    ) {

        console.error(
            "HANDLER ERROR"
        );

        console.error(
            error
        );

        response.success =

            false;

        response.errors.push(

            error.message

        );

        StaffQuery.statistics.failures++;

    }

    response.metadata.executionTime =

        Date.now() -

        started;

    StaffQuery.statistics.totalExecutionTime +=

        response.metadata.executionTime;

    StaffQuery.statistics.averageExecutionTime =

        StaffQuery.statistics.totalExecutionTime /

        Math.max(

            1,

            StaffQuery.statistics.queries

        );

    StaffQuery.lastQuery =

        request;

    StaffQuery.lastResult =

        response;

    console.log(
        "CACHE STORE DATA"
    );

    console.log(
        response.data
    );

    console.log(
        "CACHE STORE LENGTH"
    );

    console.log(

        Array.isArray(

            response.data

        )

            ?

            response.data.length

            :

            null

    );

    if (
        response.success === true
    ) {

        StaffQuery.setCache(

            cacheKey,

            structuredClone(

                response

            )

        );

    }

    console.log(
        "RETURN RESPONSE"
    );

    console.log(
        response
    );

    console.log(
        "RETURN DATA"
    );

    console.log(
        response.data
    );

    console.log(
        "RETURN DATA LENGTH"
    );

    console.log(

        Array.isArray(

            response.data

        )

            ?

            response.data.length

            :

            null

    );

    console.log(
        "===================================="
    );

    /*----------------------------------
      Preserve Canonical Request
    ----------------------------------*/

    response.request =

        request;

    response.intent =

        request.intent;

    response.domain =

        request.domain;

    response.entities =

        request.entities ||

        {};

    response.parameters =

        request.parameters ||

        {};

    response.context =

        request.context ||

        {};

    return response;

};

    /*=========================================================
  Nearby Staff
=========================================================*/

GG.queryNearbyStaff = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            /*----------------------------------
              Reference Staff
            ----------------------------------*/

const reference =
    StaffQuery.resolveReferenceStaff(
        request
    );

            /*----------------------------------
              Reference Coordinates
            ----------------------------------*/

            const refLat =

                Number(

                    reference.location?.lat ??

                    reference.gps?.lat

                );

            const refLon =

                Number(

                    reference.location?.lon ??

                    reference.gps?.lon

                );

            if (

                !Number.isFinite(

                    refLat

                ) ||

                !Number.isFinite(

                    refLon

                ) ||

                refLat === 0 ||

                refLon === 0

            ) {

                throw new Error(

                    "Reference staff has no valid GPS location."

                );

            }

            /*----------------------------------
              Live Staff Only
            ----------------------------------*/

            const staff =

                StaffQuery

                    .ensureAllStaff()

                    .filter(

                        function (

                            profile

                        ) {

                            if (

                                !profile

                            ) {

                                return false;

                            }

                            /* Skip self */

                            if (

                                profile.identity?.cleanName ===

                                reference.identity?.cleanName

                            ) {

                                return false;

                            }

                            /* Duty Active */

                            if (

                                profile.assignment?.dutyActive !== true

                            ) {

                                return false;

                            }

                            const lat =

                                Number(

                                    profile.location?.lat ??

                                    profile.gps?.lat

                                );

                            const lon =

                                Number(

                                    profile.location?.lon ??

                                    profile.gps?.lon

                                );

                            if (

                                !Number.isFinite(

                                    lat

                                ) ||

                                !Number.isFinite(

                                    lon

                                )

                            ) {

                                return false;

                            }

                            if (

                                lat === 0 ||

                                lon === 0

                            ) {

                                return false;

                            }

                            const lastSeen =

                                Number(

                                    profile.gps?.lastSeen ??

                                    profile.gps?.updatedAt ??

                                    0

                                );

                            if (

                                lastSeen <= 0

                            ) {

                                return false;

                            }

                            return true;

                        }

                    );

            /*----------------------------------
              Haversine Distance
            ----------------------------------*/

            function distanceKm(

                lat1,

                lon1,

                lat2,

                lon2

            ) {

                const R =

                    6371;

                const toRad =

                    Math.PI /

                    180;

                const dLat =

                    (

                        lat2 -

                        lat1

                    ) *

                    toRad;

                const dLon =

                    (

                        lon2 -

                        lon1

                    ) *

                    toRad;

                const a =

                    Math.sin(

                        dLat / 2

                    ) ** 2 +

                    Math.cos(

                        lat1 * toRad

                    ) *

                    Math.cos(

                        lat2 * toRad

                    ) *

                    Math.sin(

                        dLon / 2

                    ) ** 2;

                return (

                    2 *

                    R *

                    Math.atan2(

                        Math.sqrt(

                            a

                        ),

                        Math.sqrt(

                            1 - a

                        )

                    )

                );

            }

            /*----------------------------------
              Build Nearby List
            ----------------------------------*/

            const nearby =

                staff.map(

                    function (

                        profile

                    ) {

                        const lat =

                            Number(

                                profile.location?.lat ??

                                profile.gps?.lat

                            );

                        const lon =

                            Number(

                                profile.location?.lon ??

                                profile.gps?.lon

                            );

                        return {

                            profile:

                                profile,

                            distanceKm:

                                distanceKm(

                                    refLat,

                                    refLon,

                                    lat,

                                    lon

                                )

                        };

                    }

                );

            /*----------------------------------
              Sort Nearest First
            ----------------------------------*/

            nearby.sort(

                function (

                    a,

                    b

                ) {

                    return (

                        a.distanceKm -

                        b.distanceKm

                    );

                }

            );

            /*----------------------------------
              Return
            ----------------------------------*/

            return {

                reference:

                    reference,

                count:

                    nearby.length,

                staff:

                    nearby

            };

        }

    );

};
 /*=========================================================
 HELPER FUNCTIONS
=========================================================*/
/*=========================================================
  GET VALID STAFF
=========================================================*/

StaffQuery.getValidStaff = function () {

    return StaffQuery
        .ensureAllStaff()
        .filter(

            function (

                profile

            ) {

                if (

                    !profile

                ) {

                    return false;

                }

                /*----------------------------------
                  Must have identity
                ----------------------------------*/

                if (

                    !profile.identity

                ) {

                    return false;

                }

                /*----------------------------------
                  Must have designation
                ----------------------------------*/

                const designation =

                    String(

                        profile.identity
                            ?.designation ||

                        ""

                    )

                    .trim();

                if (

                    designation.length === 0

                ) {

                    return false;

                }

                return true;

            }

        );

};/*----------------------------------
  Get Staff List
----------------------------------*/

/*=========================================================
 HELPER FUNCTIONS
=========================================================*/

/*----------------------------------
  Get Staff List
----------------------------------*/

StaffQuery.getStaff = function (
    request
) {
    /*----------------------------------
      Get Staff References
    ----------------------------------*/

    const staff =
        Array.isArray(
            request?.entities?.staff
        )
            ? request.entities.staff
            : [];

    /*----------------------------------
      Hydrate Staff
    ----------------------------------*/

    return staff
        .map(
            function (
                item
            ) {
                let cleanName =
                    "";
                /*----------------------------------
                  String
                ----------------------------------*/

                if (
                    typeof item ===
                    "string"
                ) {
                    cleanName =
                        item;
                }
                /*----------------------------------
                  Staff Object
                ----------------------------------*/

                else if (
                    item &&
                    typeof item ===
                    "object"
                ) {
                    cleanName =
                        item.identity
                            ?.cleanName ||
                        item.cleanName ||
                        item.identity
                            ?.name ||
                        item.name ||
                        "";
                }

                cleanName =
                    String(
                        cleanName
                    )
                        .trim()
                        .toUpperCase();

                if (
                    cleanName ===
                    ""
                ) {
                    return null;
                }

                /*----------------------------------
                  Hydrate + GIS
                ----------------------------------*/
                if (
                    GG.StaffGIS &&
                    typeof GG.StaffGIS.locate ===
                    "function"
                ) {
                    const located =
                        GG.StaffGIS.locate(
                            cleanName
                        );
                    if (
                        located &&
                        located.profile
                    ) {
                        return located.profile;
                    }
                }

                /*----------------------------------
                  Hydrator Fallback
                ----------------------------------*/
                if (
                    GG.StaffHydrator &&
                    typeof GG.StaffHydrator
                        .getHydratedStaff ===
                    "function"
                ) {
                    const hydrated =
                        GG.StaffHydrator
                            .getHydratedStaff(
                                cleanName
                            );
                    if (
                        hydrated
                    ) {
                        return hydrated;
                    }
                }

                /*----------------------------------
                  Fallback
                ----------------------------------*/

                return item;
            }
        )
        .filter(
            function (
                profile
            ) {
                return !!profile;
            }
        );
};
    /*----------------------------------
  Get All Staff
----------------------------------*/

StaffQuery.getAllStaff = function () {

    const staff =

        Array.isArray(

            StaffEntities.staff

        )

            ? StaffEntities.staff

            : [];

    return staff.map(

        function (

            profile

        ) {

            const cleanName =

                profile?.identity

                    ?.cleanName;

            if (

                !cleanName

            ) {

                return profile;

            }

            /*----------------------------------
              GIS + Hydrated Profile
            ----------------------------------*/

            if (

                GreenGuardAI.StaffGIS &&

                typeof GreenGuardAI
                    .StaffGIS
                    .locate ===

                "function"

            ) {

                const located =

                    GreenGuardAI
                        .StaffGIS
                        .locate(

                            cleanName

                        );

                if (

                    located &&

                    located.profile

                ) {

                    return located.profile;

                }

            }

            /*----------------------------------
              Hydrator Fallback
            ----------------------------------*/

            if (

                GreenGuardAI
                    .StaffHydrator &&

                typeof GreenGuardAI
                    .StaffHydrator
                    .hydrate ===

                "function"

            ) {

                return (

                    GreenGuardAI
                        .StaffHydrator
                        .hydrate(

                            cleanName

                        )

                );

            }

            /*----------------------------------
              Original Profile Fallback
            ----------------------------------*/

            return profile;

        }

    );

};

/*----------------------------------
  Ensure All Staff
----------------------------------*/

StaffQuery.ensureAllStaff = function () {

    const staff =

        StaffQuery.getAllStaff();

    if (

        staff.length === 0

    ) {

        throw new Error(

            "No staff available."

        );

    }

    return staff;

};
/*----------------------------------
  Get Single Staff
----------------------------------*/

StaffQuery.getProfile = function (

    request

) {

    const staff =

        StaffQuery.getStaff(

            request

        );

    return (

        staff.length > 0

            ? staff[0]

            : null

    );

};
GG.queryStaffCount = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            const staff =

                StaffQuery.filterStaff(

                    request

                );

            const designationSummary =

                {};

            staff.forEach(

                function (

                    profile

                ) {

                    const designation =

                        String(

                            profile.identity?.designation ||

                            "UNASSIGNED"

                        )

                        .trim();

                    designationSummary[designation] =

                        (

                            designationSummary[designation] ||

                            0

                        ) + 1;

                }

            );

            return {

                count:

                    staff.length,

                designationSummary:

                    designationSummary,

                staff:

                    staff

            };

        }

    );

};
/*----------------------------------
  Has Staff
----------------------------------*/

StaffQuery.hasStaff = function (

    request

) {

    return (

        StaffQuery.getStaff(

            request

        ).length > 0

    );

};

/*----------------------------------
  Ensure Staff
----------------------------------*/

StaffQuery.ensureStaff = function (

    request

) {

    if (

        !StaffQuery.hasStaff(

            request

        )

    ) {

        throw new Error(

            "No staff found."

        );

    }

    return StaffQuery.getStaff(

        request

    );

};

/*----------------------------------
  Ensure Single Staff
----------------------------------*/

StaffQuery.ensureSingleStaff = function (

    request

) {

    const started =

        Date.now();

    console.group(

        "👤 StaffQuery.ensureSingleStaff"

    );

    console.log(

        "File:",

        "staffQuery.js"

    );

    console.log(

        "Function:",

        "StaffQuery.ensureSingleStaff"

    );

    console.log(

        "Request:",

        request

    );

    /*----------------------------------
      Get Staff
    ----------------------------------*/

    const staff =

        StaffQuery.getStaff(

            request

        );

    console.log(

        "Matched Staff:",

        staff

    );

    console.log(

        "Count:",

        Array.isArray(

            staff

        )

            ? staff.length

            : 0

    );

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !Array.isArray(

            staff

        )

    ) {

        console.groupEnd();

        throw new Error(

            "StaffQuery.getStaff() must return an array."

        );

    }

    if (

        staff.length === 0

    ) {

        console.groupEnd();

        throw new Error(

            "No staff found."

        );

    }

    if (

        staff.length > 1

    ) {

        console.groupEnd();

        throw new Error(

            "Multiple staff matched."

        );

    }

    /*----------------------------------
      Canonical Staff
    ----------------------------------*/

    const canonical =

        staff[0];

    console.log(

        "Canonical Staff:",

        canonical

    );

    console.log(

        "Identity:",

        canonical.identity

    );

    console.log(

        "Posting:",

        canonical.posting

    );

    console.log(

        "Assignment:",

        canonical.assignment

    );

    console.log(

        "GPS:",

        canonical.gps

    );

    console.log(

        "Analytics:",

        canonical.analytics

    );

    console.log(

        "Execution:",

        Date.now() -

        started,

        "ms"

    );

    console.groupEnd();

    /*----------------------------------
      Return Canonical Object
    ----------------------------------*/

    return canonical;

};
/*----------------------------------
  Get Parameters
----------------------------------*/

StaffQuery.getParameters = function (

    request

) {

    return (

        request?.parameters ||

        {}

    );

};

/*----------------------------------
  Get Intent
----------------------------------*/

StaffQuery.getIntent = function (

    request

) {

    return (

        request?.intent ||

        null

    );

};

 /*=========================================================
 SEARCH QUERIES
=========================================================*/

/*----------------------------------
  Staff Search
----------------------------------*/

GG.queryStaffSearch = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            StaffQuery.ensureStaff(

                request

            );

            return StaffQuery.getStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Staff Directory
----------------------------------*/

GG.queryStaffDirectory = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.getStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Staff Exists
----------------------------------*/

GG.queryStaffExists = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            const staff =

                StaffQuery.getStaff(

                    request

                );

            return {

                exists:

                    staff.length > 0,

                count:

                    staff.length,

                staff

            };

        }

    );

};

/*----------------------------------
  Staff By Name
----------------------------------*/

GG.queryStaffByName = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            StaffQuery.ensureStaff(

                request

            );

            return StaffQuery.getStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Staff By Phone
----------------------------------*/

GG.queryStaffByPhone = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            StaffQuery.ensureStaff(

                request

            );

            return StaffQuery.getStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Staff By Role
----------------------------------*/

GG.queryStaffByRole = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            StaffQuery.ensureStaff(

                request

            );

            return StaffQuery.getStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Staff By Designation
----------------------------------*/

GG.queryStaffByDesignation = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            StaffQuery.ensureStaff(

                request

            );

            return StaffQuery.getStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Staff By Leader
----------------------------------*/

GG.queryStaffByLeader = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            StaffQuery.ensureStaff(

                request

            );

            return StaffQuery.getStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Staff By Team
----------------------------------*/

GG.queryStaffByTeam = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            StaffQuery.ensureStaff(

                request

            );

            return StaffQuery.getStaff(

                request

            );

        }

    );

};

 /*=========================================================
 PROFILE QUERIES
=========================================================*/

/*----------------------------------
  Staff Profile
----------------------------------*/

GG.queryStaffProfile = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Staff Contact
----------------------------------*/

/*----------------------------------
  Staff Contact
----------------------------------*/

/*=========================================================
 PROFILE QUERIES
=========================================================*/

/*----------------------------------
  Staff Contact
----------------------------------*/

GG.queryStaffContact = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Staff Role
----------------------------------*/

GG.queryStaffRole = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Staff Designation
----------------------------------*/

GG.queryStaffDesignation = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*=========================================================
 POSTING QUERIES
=========================================================*/

/*----------------------------------
  Staff Posting
----------------------------------*/


/*=========================================================
 POSTING QUERIES
=========================================================*/

/*----------------------------------
  Staff Posting
----------------------------------*/

GG.queryStaffPosting = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Staff Circle
----------------------------------*/

GG.queryStaffCircle = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Staff Division
----------------------------------*/


/*----------------------------------
  Staff Range
----------------------------------*/


/*----------------------------------
  Staff Beat
----------------------------------*/



/*=========================================================
 POSTING QUERIES
=========================================================*/

/*----------------------------------
  Staff Division
----------------------------------*/

GG.queryStaffDivision = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Staff Range
----------------------------------*/

GG.queryStaffRange = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Staff Beat
----------------------------------*/

GG.queryStaffBeat = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*=========================================================
 DUTY QUERIES
=========================================================*/

/*----------------------------------
  Staff Duty
----------------------------------*/

GG.queryStaffDuty = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Staff Duty Status
----------------------------------*/


/*----------------------------------
  Staff Duty Type
----------------------------------*/



/*----------------------------------
  Staff Duty Started
----------------------------------*/



/*----------------------------------
  Staff Duty Ended
----------------------------------*/



/*----------------------------------
  Staff Assignment
----------------------------------*/


/*=========================================================
 DUTY QUERIES
=========================================================*/

/*----------------------------------
  Staff Duty Status
----------------------------------*/

GG.queryStaffDutyStatus = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Staff Duty Type
----------------------------------*/

GG.queryStaffDutyType = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Staff Duty Started
----------------------------------*/

GG.queryStaffDutyStarted = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Staff Duty Ended
----------------------------------*/

GG.queryStaffDutyEnded = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Staff Duty Active
----------------------------------*/

GG.queryStaffDutyActive = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Staff Last Duty
----------------------------------*/

GG.queryStaffLastDuty = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Staff Assignment
----------------------------------*/

GG.queryStaffAssignment = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*=========================================================
 TEAM QUERIES
=========================================================*/

/*----------------------------------
  Staff Team
----------------------------------*/
/*=========================================================
 TEAM QUERIES
=========================================================*/

/*----------------------------------
  Staff Team
----------------------------------*/

/*=========================================================
 TEAM QUERIES
=========================================================*/

/*----------------------------------
  Staff Team
----------------------------------*/

GG.queryStaffTeam = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Team Leader
----------------------------------*/

GG.queryStaffLeader = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Team Members
----------------------------------*/

GG.queryTeamMembers = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Team Information
----------------------------------*/

GG.queryTeamInformation = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*=========================================================
 GPS QUERIES
=========================================================*/

/*----------------------------------
  Staff GPS
----------------------------------*/



/*----------------------------------
  Staff Speed
----------------------------------*/

GG.queryStaffSpeed = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Staff Location
----------------------------------*/

GG.queryStaffLocation = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Staff Heading
----------------------------------*/

GG.queryStaffHeading = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Staff Accuracy
----------------------------------*/

GG.queryStaffAccuracy = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};
/*=========================================================
 PATROL ANALYTICS QUERIES
=========================================================*/

/*----------------------------------
  Staff Analytics
----------------------------------*/

GG.queryStaffAnalytics = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Patrol Distance
----------------------------------*/

GG.queryStaffDistance = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Patrol Points
----------------------------------*/

GG.queryStaffPatrolPoints = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Patrol Start
----------------------------------*/


/*----------------------------------
  Patrol End
----------------------------------*/



/*----------------------------------
  Patrol Duration
----------------------------------*/


/*----------------------------------
  Patrol Start
----------------------------------*/

GG.queryStaffPatrolStart = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Patrol End
----------------------------------*/

GG.queryStaffPatrolEnd = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};

/*----------------------------------
  Patrol Duration
----------------------------------*/

GG.queryStaffPatrolDuration = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            return StaffQuery.ensureSingleStaff(

                request

            );

        }

    );

};
/*=========================================================
 STRENGTH & CONTROL ROOM QUERIES
=========================================================*/

/*----------------------------------
  Staff Strength
----------------------------------*/



/*----------------------------------
  Active Staff Count
----------------------------------*/

GG.queryActiveStaffCount = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            const active =
StaffQuery.ensureAllStaff().filter(

                    function (

                        profile

                    ) {

                        return (

                            profile.assignment?.dutyActive ===

                            true

                        );

                    }

                );

            return {

                count:

                    active.length

            };

        }

    );

};

/*----------------------------------
  Active Staff List
----------------------------------*/

GG.queryActiveStaffList = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            const active =

StaffQuery.ensureAllStaff().filter(

                    function (

                        profile

                    ) {

                        return (

                            profile.assignment?.dutyActive ===

                            true

                        );

                    }

                );

            return {

                count:

                    active.length,

                staff:

                    active

            };

        }

    );

};

/*----------------------------------
  Inactive Staff List
----------------------------------*/

GG.queryInactiveStaffList = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            const inactive =

StaffQuery.ensureAllStaff().filter(

                    function (

                        profile

                    ) {

                        return (

                            profile.assignment?.dutyActive !==

                            true

                        );

                    }

                );

            return {

                count:

                    inactive.length,

                staff:

                    inactive

            };

        }

    );

};

/*----------------------------------
  Duty Summary
----------------------------------*/

GG.queryDutySummary = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            const staff =

                StaffQuery.ensureAllStaff()

            const active =

                staff.filter(

                    profile =>

                        profile.assignment?.dutyActive ===

                        true

                );

            const inactive =

                staff.filter(

                    profile =>

                        profile.assignment?.dutyActive !==

                        true

                );

            return {

                total:

                    staff.length,

                active:

                    active.length,

                inactive:

                    inactive.length,

                activeStaff:

                    active,

                inactiveStaff:

                    inactive

            };

        }

    );

};

/*----------------------------------
  Team Leader List
----------------------------------*/
GG.queryTeamLeaderList = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            const leaders =

                StaffQuery.ensureAllStaff()

                .filter(

                    function (

                        profile

                    ) {

                        return (

                            String(

                                profile.identity?.role ||

                                ""

                            )

                            .trim()

                            .toUpperCase() ===

                            "TEAM_LEADER"

                        );

                    }

                );

            return {

                count:

                    leaders.length,

                staff:

                    leaders

            };

        }

    );

};
    /*----------------------------------
  Moving Staff
----------------------------------*/

GG.queryMovingStaff = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            const moving =

                StaffQuery.ensureAllStaff().filter(

                    function (

                        profile

                    ) {

                        return (

                            Number(

                                profile.gps?.speed ??

                                0

                            ) > 0

                        );

                    }

                );

            return {

                count:

                    moving.length,

                staff:

                    moving

            };

        }

    );

};

/*----------------------------------
  Stationary Staff
----------------------------------*/

GG.queryStationaryStaff = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            const stationary =

                StaffQuery.ensureAllStaff().filter(

                    function (

                        profile

                    ) {

                        return (

                            Number(

                                profile.gps?.speed ??

                                0

                            ) <= 0

                        );

                    }

                );

            return {

                count:

                    stationary.length,

                staff:

                    stationary

            };

        }

    );

};
/*=========================================================
 SUMMARY QUERIES
=========================================================*/

/*----------------------------------
  Staff Summary
----------------------------------*/

/*----------------------------------
  Staff Summary
----------------------------------*/

GG.queryStaffSummary = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            /*----------------------------------
              Entire Staff Collection
            ----------------------------------*/

            const profiles =

                StaffQuery.ensureAllStaff();

            /*----------------------------------
              Build Summary
            ----------------------------------*/

            return profiles.map(

                function (

                    profile

                ) {

                    return {

                        /*----------------------------------
                          Identity
                        ----------------------------------*/

                        cleanName:

                            profile.identity?.cleanName ||

                            "",

                        rawName:

                            profile.identity?.rawName ||

                            "",

                        name:

                            profile.identity?.name ||

                            "",

                        phone:

                            profile.identity?.phone ||

                            "",

                        email:

                            profile.identity?.email ||

                            "",

                        role:

                            profile.identity?.role ||

                            "",

                        designation:

                            profile.identity?.designation ||

                            "",

                        type:

                            profile.identity?.type ||

                            "",

                        /*----------------------------------
                          Posting
                        ----------------------------------*/

                        circle:

                            profile.posting?.circle ||

                            "",

                        division:

                            profile.posting?.division ||

                            "",

                        range:

                            profile.posting?.range ||

                            "",

                        beat:

                            profile.posting?.beat ||

                            "",

                        /*----------------------------------
                          Assignment
                        ----------------------------------*/

                        dutyType:

                            profile.assignment?.dutyType ||

                            "",

                        dutyActive:

                            profile.assignment?.dutyActive ??

                            false,

                        dutyStatus:

                            profile.assignment?.status ||

                            "",

                        assignedCompartment:

                            profile.assignment?.assignedCompartment ||

                            "",

                        /*----------------------------------
                          Team
                        ----------------------------------*/

                        leader:

                            profile.teamInfo?.leader ||

                            "",

                        team:

                            profile.teamInfo?.team ||

                            "",

                        /*----------------------------------
                          Location
                        ----------------------------------*/

                        latitude:

                            profile.location?.lat ??

                            null,

                        longitude:

                            profile.location?.lon ??

                            null,

                        location:

                            profile.location?.location ||

                            "",

                        /*----------------------------------
                          GPS
                        ----------------------------------*/

                        speed:

                            profile.gps?.speed ??

                            null,

                        heading:

                            profile.gps?.heading ??

                            null,

                        accuracy:

                            profile.gps?.accuracy ??

                            null,

                        lastSeen:

                            profile.gps?.lastSeen ??

                            null,

                        /*----------------------------------
                          Analytics
                        ----------------------------------*/

                        distanceKm:

                            profile.analytics?.distanceKm ??

                            0,

                        pointCount:

                            profile.analytics?.pointCount ??

                            0,

                        startedAt:

                            profile.analytics?.startedAt ??

                            null,

                        endedAt:

                            profile.analytics?.endedAt ??

                            null

                    };

                }

            );

        }

    );

};
StaffQuery.buildSummary = function (

    staff

) {

    staff =

        Array.isArray(

            staff

        )

            ? staff

            : [];

    const summary = {

        totalStaff:

            staff.length,

        activeStaff:

            0,

        inactiveStaff:

            0,

        movingStaff:

            0,

        stationaryStaff:

            0,

        totalDistanceKm:

            0,

        totalPatrolPoints:

            0,

        designationSummary:

            {},

        roleSummary:

            {},

        staff:

            staff

    };

    staff.forEach(

        function (

            profile

        ) {

            /*----------------------------------
              Duty
            ----------------------------------*/

            if (

                profile.assignment?.dutyActive ===

                true

            ) {

                summary.activeStaff++;

            }

            else {

                summary.inactiveStaff++;

            }

            /*----------------------------------
              Movement
            ----------------------------------*/

            if (

                Number(

                    profile.gps?.speed ||

                    0

                ) >

                0

            ) {

                summary.movingStaff++;

            }

            else {

                summary.stationaryStaff++;

            }

            /*----------------------------------
              Analytics
            ----------------------------------*/

            summary.totalDistanceKm +=

                Number(

                    profile.analytics?.distanceKm ||

                    0

                );

            summary.totalPatrolPoints +=

                Number(

                    profile.analytics?.pointCount ||

                    0

                );

            /*----------------------------------
              Designation
            ----------------------------------*/

            const designation =

                String(

                    profile.identity?.designation ||

                    "UNASSIGNED"

                )

                .trim();

            summary.designationSummary[designation] =

                (

                    summary.designationSummary[designation] ||

                    0

                ) + 1;

            /*----------------------------------
              Role
            ----------------------------------*/

            const role =

                String(

                    profile.identity?.role ||

                    "UNKNOWN"

                )

                .trim();

            summary.roleSummary[role] =

                (

                    summary.roleSummary[role] ||

                    0

                ) + 1;

        }

    );

    return summary;

};
StaffQuery.buildDesignationSummary = function (

    staff

) {

    staff =

        Array.isArray(

            staff

        )

            ? staff

            : [];

    const summary =

        {};

    staff.forEach(

        function (

            profile

        ) {

            const designation =

                String(

                    profile.identity?.designation ||

                    "UNASSIGNED"

                )

                .trim();

            if (

                !summary[designation]

            ) {

                summary[designation] = {

                    designation:

                        designation,

                    totalStaff:

                        0,

                    activeStaff:

                        0,

                    inactiveStaff:

                        0,

                    movingStaff:

                        0,

                    stationaryStaff:

                        0,

                    totalDistanceKm:

                        0,

                    totalPatrolPoints:

                        0,

                    staff: []

                };

            }

            const item =

                summary[designation];

            item.totalStaff++;

            if (

                profile.assignment?.dutyActive ===

                true

            ) {

                item.activeStaff++;

            }

            else {

                item.inactiveStaff++;

            }

            if (

                Number(

                    profile.gps?.speed ||

                    0

                ) >

                0

            ) {

                item.movingStaff++;

            }

            else {

                item.stationaryStaff++;

            }

            item.totalDistanceKm +=

                Number(

                    profile.analytics?.distanceKm ||

                    0

                );

            item.totalPatrolPoints +=

                Number(

                    profile.analytics?.pointCount ||

                    0

                );

            item.staff.push(

                profile

            );

        }

    );

    return Object.values(

        summary

    );

};
    StaffQuery.buildDesignationSummary = function (

    staff

) {

    staff =

        Array.isArray(

            staff

        )

            ? staff

            : [];

    const summary =

        {};

    staff.forEach(

        function (

            profile

        ) {

            const designation =

                String(

                    profile.identity?.designation ||

                    "UNASSIGNED"

                )

                .trim();

            if (

                !summary[designation]

            ) {

                summary[designation] = {

                    designation:

                        designation,

                    totalStaff:

                        0,

                    activeStaff:

                        0,

                    inactiveStaff:

                        0,

                    movingStaff:

                        0,

                    stationaryStaff:

                        0,

                    totalDistanceKm:

                        0,

                    totalPatrolPoints:

                        0,

                    staff: []

                };

            }

            const item =

                summary[designation];

            item.totalStaff++;

            if (

                profile.assignment?.dutyActive ===

                true

            ) {

                item.activeStaff++;

            }

            else {

                item.inactiveStaff++;

            }

            if (

                Number(

                    profile.gps?.speed ||

                    0

                ) >

                0

            ) {

                item.movingStaff++;

            }

            else {

                item.stationaryStaff++;

            }

            item.totalDistanceKm +=

                Number(

                    profile.analytics?.distanceKm ||

                    0

                );

            item.totalPatrolPoints +=

                Number(

                    profile.analytics?.pointCount ||

                    0

                );

            item.staff.push(

                profile

            );

        }

    );

    return Object.values(

        summary

    );

};
StaffQuery.buildDirectory = function (

    key,

    staff

) {

    staff =

        Array.isArray(

            staff

        )

            ? staff

            : [];

    const directory =

        {};

    staff.forEach(

        function (

            profile

        ) {

            let value =

                "";

            switch (

                key

            ) {

                case "circle":

                    value =

                        profile.posting?.circle;

                    break;

                case "division":

                    value =

                        profile.posting?.division;

                    break;

                case "range":

                    value =

                        profile.posting?.range;

                    break;

                case "beat":

                    value =

                        profile.posting?.beat;

                    break;

                case "designation":

                    value =

                        profile.identity?.designation;

                    break;

                default:

                    value =

                        "";

            }

            value =

                String(

                    value ||

                    "UNASSIGNED"

                )

                .trim();

            if (

                !directory[value]

            ) {

                directory[value] = {

                    [key]:

                        value,

                    totalStaff:

                        0,

                    activeStaff:

                        0,

                    inactiveStaff:

                        0,

                    movingStaff:

                        0,

                    stationaryStaff:

                        0,

                    totalDistanceKm:

                        0,

                    totalPatrolPoints:

                        0,

                    staff: []

                };

            }

            const group =

                directory[value];

            group.totalStaff++;

            if (

                profile.assignment?.dutyActive ===

                true

            ) {

                group.activeStaff++;

            }

            else {

                group.inactiveStaff++;

            }

            if (

                Number(

                    profile.gps?.speed ||

                    0

                ) >

                0

            ) {

                group.movingStaff++;

            }

            else {

                group.stationaryStaff++;

            }

            group.totalDistanceKm +=

                Number(

                    profile.analytics?.distanceKm ||

                    0

                );

            group.totalPatrolPoints +=

                Number(

                    profile.analytics?.pointCount ||

                    0

                );

            group.staff.push(

                profile

            );

        }

    );

    return Object.values(

        directory

    );

};    
StaffQuery.buildCount = function (

    staff

) {

    staff =

        Array.isArray(

            staff

        )

            ? staff

            : [];

    return {

        count:

            staff.length,

        activeStaff:

            staff.filter(

                function (

                    profile

                ) {

                    return (

                        profile.assignment?.dutyActive ===

                        true

                    );

                }

            ).length,

        inactiveStaff:

            staff.filter(

                function (

                    profile

                ) {

                    return (

                        profile.assignment?.dutyActive !==

                        true

                    );

                }

            ).length,

        movingStaff:

            staff.filter(

                function (

                    profile

                ) {

                    return (

                        Number(

                            profile.gps?.speed ||

                            0

                        ) >

                        0

                    );

                }

            ).length,

        stationaryStaff:

            staff.filter(

                function (

                    profile

                ) {

                    return (

                        Number(

                            profile.gps?.speed ||

                            0

                        ) <=

                        0

                    );

                }

            ).length,

        totalDistanceKm:

            staff.reduce(

                function (

                    total,

                    profile

                ) {

                    return (

                        total +

                        Number(

                            profile.analytics?.distanceKm ||

                            0

                        )

                    );

                },

                0

            ),

        totalPatrolPoints:

            staff.reduce(

                function (

                    total,

                    profile

                ) {

                    return (

                        total +

                        Number(

                            profile.analytics?.pointCount ||

                            0

                        )

                    );

                },

                0

            )

    };

};
StaffQuery.buildAnalytics = function (

    staff

) {

    staff =

        Array.isArray(

            staff

        )

            ? staff

            : [];

    const analytics = {

        totalStaff:

            staff.length,

        activeStaff:

            0,

        inactiveStaff:

            0,

        movingStaff:

            0,

        stationaryStaff:

            0,

        totalDistanceKm:

            0,

        averageDistanceKm:

            0,

        totalPatrolPoints:

            0,

        averagePatrolPoints:

            0,

        maxDistanceKm:

            0,

        maxPatrolPoints:

            0,

        liveGps:

            0,

        dutyPercentage:

            0,

        movementPercentage:

            0

    };

    staff.forEach(

        function (

            profile

        ) {

            const distance =

                Number(

                    profile.analytics?.distanceKm ||

                    0

                );

            const points =

                Number(

                    profile.analytics?.pointCount ||

                    0

                );

            const speed =

                Number(

                    profile.gps?.speed ||

                    0

                );

            analytics.totalDistanceKm +=

                distance;

            analytics.totalPatrolPoints +=

                points;

            analytics.maxDistanceKm =

                Math.max(

                    analytics.maxDistanceKm,

                    distance

                );

            analytics.maxPatrolPoints =

                Math.max(

                    analytics.maxPatrolPoints,

                    points

                );

            if (

                profile.assignment?.dutyActive ===

                true

            ) {

                analytics.activeStaff++;

            }

            else {

                analytics.inactiveStaff++;

            }

            if (

                speed >

                0

            ) {

                analytics.movingStaff++;

            }

            else {

                analytics.stationaryStaff++;

            }

            if (

                profile.gps?.timestamp ||

                profile.gps?.lastSeen

            ) {

                analytics.liveGps++;

            }

        }

    );

    if (

        analytics.totalStaff >

        0

    ) {

        analytics.averageDistanceKm =

            analytics.totalDistanceKm /

            analytics.totalStaff;

        analytics.averagePatrolPoints =

            analytics.totalPatrolPoints /

            analytics.totalStaff;

        analytics.dutyPercentage =

            (

                analytics.activeStaff /

                analytics.totalStaff

            ) * 100;

        analytics.movementPercentage =

            (

                analytics.movingStaff /

                analytics.totalStaff

            ) * 100;

    }

    return analytics;

};
    StaffQuery.buildJurisdictionSummary = function (

    level,

    staff

) {

    staff =

        Array.isArray(

            staff

        )

            ? staff

            : [];

    const summary =

        {};

    staff.forEach(

        function (

            profile

        ) {

            let jurisdiction =

                "";

            switch (

                level

            ) {

                case "circle":

                    jurisdiction =

                        profile.posting?.circle;

                    break;

                case "division":

                    jurisdiction =

                        profile.posting?.division;

                    break;

                case "range":

                    jurisdiction =

                        profile.posting?.range;

                    break;

                case "beat":

                    jurisdiction =

                        profile.posting?.beat;

                    break;

                default:

                    jurisdiction =

                        "UNKNOWN";

            }

            jurisdiction =

                String(

                    jurisdiction ||

                    "UNASSIGNED"

                )

                .trim();

            if (

                !summary[jurisdiction]

            ) {

                summary[jurisdiction] = {

                    [level]:

                        jurisdiction,

                    totalStaff:

                        0,

                    activeStaff:

                        0,

                    inactiveStaff:

                        0,

                    movingStaff:

                        0,

                    stationaryStaff:

                        0,

                    totalDistanceKm:

                        0,

                    totalPatrolPoints:

                        0

                };

            }

            const item =

                summary[jurisdiction];

            item.totalStaff++;

            if (

                profile.assignment?.dutyActive ===

                true

            ) {

                item.activeStaff++;

            }

            else {

                item.inactiveStaff++;

            }

            if (

                Number(

                    profile.gps?.speed ||

                    0

                ) >

                0

            ) {

                item.movingStaff++;

            }

            else {

                item.stationaryStaff++;

            }

            item.totalDistanceKm +=

                Number(

                    profile.analytics?.distanceKm ||

                    0

                );

            item.totalPatrolPoints +=

                Number(

                    profile.analytics?.pointCount ||

                    0

                );

        }

    );

    return Object.values(

        summary

    );

};


    StaffQuery.buildProfileResponse = function (

    profile

) {

    if (

        !profile

    ) {

        return null;

    }

    return {

        /*----------------------------------
          Identity
        ----------------------------------*/

        cleanName:

            profile.identity?.cleanName ||

            "",

        rawName:

            profile.identity?.rawName ||

            "",

        name:

            profile.identity?.name ||

            "",

        designation:

            profile.identity?.designation ||

            "",

        role:

            profile.identity?.role ||

            "",

        phone:

            profile.identity?.phone ||

            "",

        email:

            profile.identity?.email ||

            "",

        /*----------------------------------
          Posting
        ----------------------------------*/

        circle:

            profile.posting?.circle ||

            "",

        division:

            profile.posting?.division ||

            "",

        range:

            profile.posting?.range ||

            "",

        beat:

            profile.posting?.beat ||

            "",

        /*----------------------------------
          Assignment
        ----------------------------------*/

        assignedCompartment:

            profile.assignment?.assignedCompartment ||

            "",

        dutyType:

            profile.assignment?.dutyType ||

            "",

        dutyStatus:

            profile.assignment?.status ||

            "",

        dutyActive:

            profile.assignment?.dutyActive ??

            false,

        leader:

            profile.assignment?.leader ||

            "",

        /*----------------------------------
          Team
        ----------------------------------*/

        team:

            profile.teamInfo?.team ||

            "",

        teamLeader:

            profile.teamInfo?.leader ||

            "",

        /*----------------------------------
          Location
        ----------------------------------*/

        latitude:

            profile.location?.lat ??

            null,

        longitude:

            profile.location?.lon ??

            null,

        location:

            profile.location?.location ||

            "",

        /*----------------------------------
          GPS
        ----------------------------------*/

        speed:

            profile.gps?.speed ??

            0,

        heading:

            profile.gps?.heading ??

            0,

        accuracy:

            profile.gps?.accuracy ??

            0,

        timestamp:

            profile.gps?.timestamp ??

            null,

        lastSeen:

            profile.gps?.lastSeen ??

            "",

        updatedAt:

            profile.gps?.updatedAt ??

            null,

        /*----------------------------------
          Analytics
        ----------------------------------*/

        distanceKm:

            profile.analytics?.distanceKm ??

            0,

        pointCount:

            profile.analytics?.pointCount ??

            0,

        startedAt:

            profile.analytics?.startedAt ??

            null,

        endedAt:

            profile.analytics?.endedAt ??

            null

    };

};
    /*----------------------------------
  Jurisdiction Summary
----------------------------------*/

GG.queryJurisdictionSummary = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            /*----------------------------------
              Entire Staff Collection
            ----------------------------------*/

            const profiles =

                StaffQuery.ensureAllStaff();

            /*----------------------------------
              Build Summary
            ----------------------------------*/

            const summary =

                {};

            profiles.forEach(

                function (

                    profile

                ) {

                    const circle =

                        profile.posting?.circle ||

                        "UNASSIGNED";

                    const division =

                        profile.posting?.division ||

                        "UNASSIGNED";

                    const range =

                        profile.posting?.range ||

                        "UNASSIGNED";

                    const beat =

                        profile.posting?.beat ||

                        "UNASSIGNED";

                    const key =

                        [

                            circle,

                            division,

                            range,

                            beat

                        ].join(

                            "|"

                        );

                    if (

                        !summary[key]

                    ) {

                        summary[key] = {

                            circle,

                            division,

                            range,

                            beat,

                            totalStaff: 0,

                            activeStaff: 0,

                            inactiveStaff: 0,

                            movingStaff: 0,

                            stationaryStaff: 0

                        };

                    }

                    const item =

                        summary[key];

                    item.totalStaff++;

                    if (

                        profile.assignment?.dutyActive

                    ) {

                        item.activeStaff++;

                    }

                    else {

                        item.inactiveStaff++;

                    }

                    if (

                        Number(

                            profile.gps?.speed ||

                            0

                        ) >

                        0

                    ) {

                        item.movingStaff++;

                    }

                    else {

                        item.stationaryStaff++;

                    }

                }

            );

            return Object.values(

                summary

            );

        }

    );

};
/*----------------------------------
  Designation Summary
----------------------------------*/

GG.queryDesignationSummary = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            /*----------------------------------
              Entire Staff Collection
            ----------------------------------*/

            const profiles =

                StaffQuery.ensureAllStaff();

            /*----------------------------------
              Build Summary
            ----------------------------------*/

            const summary =

                {};

            profiles.forEach(

                function (

                    profile

                ) {

                    const designation =

    String(

        profile.identity?.designation ||

        "UNASSIGNED"

    )

    .trim();

                    if (

                        !summary[designation]

                    ) {

                        summary[designation] = {

                            designation:

                                designation,

                            totalStaff:

                                0,

                            activeStaff:

                                0,

                            inactiveStaff:

                                0,

                            movingStaff:

                                0,

                            stationaryStaff:

                                0,

                            totalDistanceKm:

                                0,

                            totalPatrolPoints:

                                0

                        };

                    }

                    const item =

                        summary[designation];

                    item.totalStaff++;

                    if (

                        profile.assignment?.dutyActive ===

                        true

                    ) {

                        item.activeStaff++;

                    }

                    else {

                        item.inactiveStaff++;

                    }

                    if (

                        Number(

                            profile.gps?.speed ||

                            0

                        ) >

                        0

                    ) {

                        item.movingStaff++;

                    }

                    else {

                        item.stationaryStaff++;

                    }

                    item.totalDistanceKm +=

                        Number(

                            profile.analytics?.distanceKm ||

                            0

                        );

                    item.totalPatrolPoints +=

                        Number(

                            profile.analytics?.pointCount ||

                            0

                        );

                }

            );

            return Object.values(

                summary

            );

        }

    );

};

/*----------------------------------
  Circle Directory
----------------------------------*/

GG.queryCircleDirectory = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            /*----------------------------------
              Requested Circle
            ----------------------------------*/

            const requestedCircle =

                String(

                    request.parameters?.circle ||

                    ""

                )

                .trim()

                .toUpperCase();

            /*----------------------------------
              Profiles
            ----------------------------------*/

            const profiles =

                StaffQuery
                    .ensureAllStaff()

                    .filter(

                        function (

                            profile

                        ) {

                            if (

                                requestedCircle === ""

                            ) {

                                return true;

                            }

                            return (

                                String(

                                    profile.posting?.circle ||

                                    ""

                                )

                                .trim()

                                .toUpperCase()

                                ===

                                requestedCircle

                            );

                        }

                    );

            /*----------------------------------
              Directory
            ----------------------------------*/

            const directory =

                {};

            profiles.forEach(

                function (

                    profile

                ) {

                    const circle =

                        profile.posting?.circle ||

                        "UNASSIGNED";

                    if (

                        !directory[circle]

                    ) {

                        directory[circle] = {

                            circle:

                                circle,

                            totalStaff:

                                0,

                            staff: []

                        };

                    }

                    const group =

                        directory[circle];

                    group.totalStaff++;

                    group.staff.push({

                        /*----------------------------------
                          Identity
                        ----------------------------------*/

                        cleanName:

                            profile.identity?.cleanName ||

                            "",

                        rawName:

                            profile.identity?.rawName ||

                            "",

                        name:

                            profile.identity?.name ||

                            "",

                        role:

                            profile.identity?.role ||

                            "",

                        designation:

                            profile.identity?.designation ||

                            "",

                        type:

                            profile.identity?.type ||

                            "",

                        phone:

                            profile.identity?.phone ||

                            "",

                        email:

                            profile.identity?.email ||

                            "",

                        /*----------------------------------
                          Posting
                        ----------------------------------*/

                        circle:

                            profile.posting?.circle ||

                            "",

                        division:

                            profile.posting?.division ||

                            "",

                        range:

                            profile.posting?.range ||

                            "",

                        beat:

                            profile.posting?.beat ||

                            "",

                        /*----------------------------------
                          Assignment
                        ----------------------------------*/

                        assignedCompartment:

                            profile.assignment?.assignedCompartment ||

                            "",

                        dutyType:

                            profile.assignment?.dutyType ||

                            "",

                        dutyStatus:

                            profile.assignment?.status ||

                            "",

                        dutyActive:

                            profile.assignment?.dutyActive ??

                            false,

                        /*----------------------------------
                          Team
                        ----------------------------------*/

                        leader:

                            profile.teamInfo?.leader ||

                            "",

                        team:

                            profile.teamInfo?.team ||

                            "",

                        /*----------------------------------
                          Location
                        ----------------------------------*/

                        latitude:

                            profile.location?.lat ??

                            null,

                        longitude:

                            profile.location?.lon ??

                            null,

                        location:

                            profile.location?.location ||

                            "",

                        /*----------------------------------
                          GPS
                        ----------------------------------*/

                        speed:

                            profile.gps?.speed ??

                            null,

                        heading:

                            profile.gps?.heading ??

                            null,

                        accuracy:

                            profile.gps?.accuracy ??

                            null,

                        lastSeen:

                            profile.gps?.lastSeen ??

                            null,

                        timestamp:

                            profile.gps?.timestamp ??

                            null,

                        updatedAt:

                            profile.gps?.updatedAt ??

                            null,

                        /*----------------------------------
                          Analytics
                        ----------------------------------*/

                        distanceKm:

                            profile.analytics?.distanceKm ??

                            0,

                        pointCount:

                            profile.analytics?.pointCount ??

                            0,

                        startedAt:

                            profile.analytics?.startedAt ??

                            null,

                        endedAt:

                            profile.analytics?.endedAt ??

                            null

                    });

                }

            );

            return Object.values(

                directory

            );

        }

    );

};

    /*=========================================================
  FILTER STAFF
=========================================================*/

StaffQuery.filterStaff = function (

    request

) {

    /*----------------------------------
      Parameters
    ----------------------------------*/

    request =
        request || {};

    const parameters =
        request.parameters || {};

    /*----------------------------------
      Start With Entire Dataset
    ----------------------------------*/

    let staff =
        StaffQuery.getValidStaff();

/*----------------------------------
  Staff Name (Single Staff Only)
----------------------------------*/

if (

    parameters.isSingle === true &&

    Array.isArray(

        request.entities?.staff

    ) &&

    request.entities.staff.length > 0

) {

    const names =

        new Set(

            request.entities.staff.map(

                function (

                    profile

                ) {

                    return String(

                        profile.identity
                            ?.cleanName ||

                        ""

                    )

                    .trim()

                    .toUpperCase();

                }

            )

        );

    staff =

        staff.filter(

            function (

                profile

            ) {

                return names.has(

                    String(

                        profile.identity
                            ?.cleanName ||

                        ""

                    )

                    .trim()

                    .toUpperCase()

                );

            }

        );

}

    /*----------------------------------
      Designation
    ----------------------------------*/

    if (

        parameters.designation

    ) {

        const designation =
            String(

                parameters.designation

            )

            .trim()

            .toUpperCase();

        staff =
            staff.filter(

                function (

                    profile

                ) {

                    return (

                        String(

                            profile.identity
                                ?.designation ||

                            ""

                        )

                        .trim()

                        .toUpperCase()

                        ===

                        designation

                    );

                }

            );

    }

    /*----------------------------------
      Circle
    ----------------------------------*/

    if (

        parameters.circle

    ) {

        const circle =
            String(

                parameters.circle

            )

            .trim()

            .toUpperCase();

        staff =
            staff.filter(

                function (

                    profile

                ) {

                    return (

                        String(

                            profile.posting
                                ?.circle ||

                            ""

                        )

                        .trim()

                        .toUpperCase()

                        ===

                        circle

                    );

                }

            );

    }

    /*----------------------------------
      Division
    ----------------------------------*/

    if (

        parameters.division

    ) {

        const division =
            String(

                parameters.division

            )

            .trim()

            .toUpperCase();

        staff =
            staff.filter(

                function (

                    profile

                ) {

                    return (

                        String(

                            profile.posting
                                ?.division ||

                            ""

                        )

                        .trim()

                        .toUpperCase()

                        ===

                        division

                    );

                }

            );

    }

    /*----------------------------------
      Range
    ----------------------------------*/

    if (

        parameters.range

    ) {

        const range =
            String(

                parameters.range

            )

            .trim()

            .toUpperCase();

        staff =
            staff.filter(

                function (

                    profile

                ) {

                    return (

                        String(

                            profile.posting
                                ?.range ||

                            ""

                        )

                        .trim()

                        .toUpperCase()

                        ===

                        range

                    );

                }

            );

    }

    /*----------------------------------
      Beat
    ----------------------------------*/

    if (

        parameters.beat

    ) {

        const beat =
            String(

                parameters.beat

            )

            .trim()

            .toUpperCase();

        staff =
            staff.filter(

                function (

                    profile

                ) {

                    return (

                        String(

                            profile.posting
                                ?.beat ||

                            ""

                        )

                        .trim()

                        .toUpperCase()

                        ===

                        beat

                    );

                }

            );

    }

    /*----------------------------------
      Compartment
    ----------------------------------*/

    if (

        parameters.compartment

    ) {

        const compartment =
            String(

                parameters.compartment

            )

            .trim()

            .toUpperCase();

        staff =
            staff.filter(

                function (

                    profile

                ) {

                    return (

                        String(

                            profile.assignment
                                ?.assignedCompartment ||

                            ""

                        )

                        .trim()

                        .toUpperCase()

                        ===

                        compartment

                    );

                }

            );

    }

    /*----------------------------------
      Duty Active
    ----------------------------------*/

    if (

        typeof parameters.dutyActive ===

        "boolean"

    ) {

        staff =
            staff.filter(

                function (

                    profile

                ) {

                    return (

                        !!profile.assignment
                            ?.dutyActive

                        ===

                        parameters.dutyActive

                    );

                }

            );

    }

    /*----------------------------------
      Moving
    ----------------------------------*/

    if (

        parameters.moving === true

    ) {

        staff =
            staff.filter(

                function (

                    profile

                ) {

                    return (

                        Number(

                            profile.gps
                                ?.speed ||

                            0

                        ) > 0

                    );

                }

            );

    }

    /*----------------------------------
      Stationary
    ----------------------------------*/

    if (

        parameters.stationary === true

    ) {

        staff =
            staff.filter(

                function (

                    profile

                ) {

                    return (

                        Number(

                            profile.gps
                                ?.speed ||

                            0

                        ) <= 0

                    );

                }

            );

    }

    /*----------------------------------
      Team Leader
    ----------------------------------*/

    if (

        parameters.teamLeader === true

    ) {

        staff =
            staff.filter(

                function (

                    profile

                ) {

                    return (

                        String(

                            profile.identity
                                ?.role ||

                            ""

                        )

                        .trim()

                        .toUpperCase()

                        ===

                        "TEAM_LEADER"

                    );

                }

            );

    }

    /*----------------------------------
      Sort
    ----------------------------------*/

    staff.sort(

        function (

            a,

            b

        ) {

            return String(

                a.identity
                    ?.cleanName ||

                ""

            ).localeCompare(

                String(

                    b.identity
                        ?.cleanName ||

                    ""

                )

            );

        }

    );

    return staff;

};
    /*----------------------------------
  Division Directory
----------------------------------*/

GG.queryDivisionDirectory = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            /*----------------------------------
              Requested Division
            ----------------------------------*/

            const requestedDivision =

                String(

                    request.parameters?.division ||

                    ""

                )

                .trim()

                .toUpperCase();

            /*----------------------------------
              Profiles
            ----------------------------------*/

            const profiles =

                StaffQuery
                    .ensureAllStaff()

                    .filter(

                        function (

                            profile

                        ) {

                            if (

                                requestedDivision === ""

                            ) {

                                return true;

                            }

                            return (

                                String(

                                    profile.posting?.division ||

                                    ""

                                )

                                .trim()

                                .toUpperCase()

                                ===

                                requestedDivision

                            );

                        }

                    );

            /*----------------------------------
              Directory
            ----------------------------------*/

            const directory = {};

            profiles.forEach(

                function (

                    profile

                ) {

                    const division =

                        profile.posting?.division ||

                        "UNASSIGNED";

                    if (

                        !directory[division]

                    ) {

                        directory[division] = {

                            division:

                                division,

                            totalStaff:

                                0,

                            staff: []

                        };

                    }

                    const group =

                        directory[division];

                    group.totalStaff++;

                    group.staff.push({

                        /*----------------------------------
                          Identity
                        ----------------------------------*/

                        cleanName:

                            profile.identity?.cleanName ||

                            "",

                        rawName:

                            profile.identity?.rawName ||

                            "",

                        name:

                            profile.identity?.name ||

                            "",

                        role:

                            profile.identity?.role ||

                            "",

                        designation:

                            profile.identity?.designation ||

                            "",

                        type:

                            profile.identity?.type ||

                            "",

                        phone:

                            profile.identity?.phone ||

                            "",

                        email:

                            profile.identity?.email ||

                            "",

                        /*----------------------------------
                          Posting
                        ----------------------------------*/

                        circle:

                            profile.posting?.circle ||

                            "",

                        range:

                            profile.posting?.range ||

                            "",

                        beat:

                            profile.posting?.beat ||

                            "",

                        /*----------------------------------
                          Assignment
                        ----------------------------------*/

                        assignedCompartment:

                            profile.assignment?.assignedCompartment ||

                            "",

                        dutyType:

                            profile.assignment?.dutyType ||

                            "",

                        dutyStatus:

                            profile.assignment?.status ||

                            "",

                        dutyActive:

                            profile.assignment?.dutyActive ??

                            false,

                        /*----------------------------------
                          Team
                        ----------------------------------*/

                        leader:

                            profile.teamInfo?.leader ||

                            "",

                        team:

                            profile.teamInfo?.team ||

                            "",

                        /*----------------------------------
                          Location
                        ----------------------------------*/

                        latitude:

                            profile.location?.lat ??

                            null,

                        longitude:

                            profile.location?.lon ??

                            null,

                        location:

                            profile.location?.location ||

                            "",

                        /*----------------------------------
                          GPS
                        ----------------------------------*/

                        speed:

                            profile.gps?.speed ??

                            null,

                        heading:

                            profile.gps?.heading ??

                            null,

                        accuracy:

                            profile.gps?.accuracy ??

                            null,

                        lastSeen:

                            profile.gps?.lastSeen ??

                            null,

                        timestamp:

                            profile.gps?.timestamp ??

                            null,

                        updatedAt:

                            profile.gps?.updatedAt ??

                            null,

                        /*----------------------------------
                          Analytics
                        ----------------------------------*/

                        distanceKm:

                            profile.analytics?.distanceKm ??

                            0,

                        pointCount:

                            profile.analytics?.pointCount ??

                            0,

                        startedAt:

                            profile.analytics?.startedAt ??

                            null,

                        endedAt:

                            profile.analytics?.endedAt ??

                            null

                    });

                }

            );

            return Object.values(

                directory

            );

        }

    );

};
    /*----------------------------------
  Range Directory
----------------------------------*/

GG.queryRangeDirectory = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            /*----------------------------------
              Requested Range
            ----------------------------------*/

            const requestedRange =

                String(

                    request.parameters?.range ||

                    ""

                )

                .trim()

                .toUpperCase();

            /*----------------------------------
              Profiles
            ----------------------------------*/

            const profiles =

                StaffQuery
                    .ensureAllStaff()

                    .filter(

                        function (

                            profile

                        ) {

                            if (

                                requestedRange === ""

                            ) {

                                return true;

                            }

                            return (

                                String(

                                    profile.posting?.range ||

                                    ""

                                )

                                .trim()

                                .toUpperCase()

                                ===

                                requestedRange

                            );

                        }

                    );

            /*----------------------------------
              Directory
            ----------------------------------*/

            const directory = {};

            profiles.forEach(

                function (

                    profile

                ) {

                    const range =

                        profile.posting?.range ||

                        "UNASSIGNED";

                    if (

                        !directory[range]

                    ) {

                        directory[range] = {

                            range:

                                range,

                            totalStaff:

                                0,

                            staff: []

                        };

                    }

                    const group =

                        directory[range];

                    group.totalStaff++;

                    group.staff.push({

                        cleanName:

                            profile.identity?.cleanName ||

                            "",

                        rawName:

                            profile.identity?.rawName ||

                            "",

                        name:

                            profile.identity?.name ||

                            "",

                        role:

                            profile.identity?.role ||

                            "",

                        designation:

                            profile.identity?.designation ||

                            "",

                        type:

                            profile.identity?.type ||

                            "",

                        phone:

                            profile.identity?.phone ||

                            "",

                        email:

                            profile.identity?.email ||

                            "",

                        circle:

                            profile.posting?.circle ||

                            "",

                        division:

                            profile.posting?.division ||

                            "",

                        beat:

                            profile.posting?.beat ||

                            "",

                        assignedCompartment:

                            profile.assignment?.assignedCompartment ||

                            "",

                        dutyType:

                            profile.assignment?.dutyType ||

                            "",

                        dutyStatus:

                            profile.assignment?.status ||

                            "",

                        dutyActive:

                            profile.assignment?.dutyActive ??

                            false,

                        leader:

                            profile.teamInfo?.leader ||

                            "",

                        team:

                            profile.teamInfo?.team ||

                            "",

                        latitude:

                            profile.location?.lat ??

                            null,

                        longitude:

                            profile.location?.lon ??

                            null,

                        location:

                            profile.location?.location ||

                            "",

                        speed:

                            profile.gps?.speed ??

                            null,

                        heading:

                            profile.gps?.heading ??

                            null,

                        accuracy:

                            profile.gps?.accuracy ??

                            null,

                        lastSeen:

                            profile.gps?.lastSeen ??

                            null,

                        distanceKm:

                            profile.analytics?.distanceKm ??

                            0,

                        pointCount:

                            profile.analytics?.pointCount ??

                            0,

                        startedAt:

                            profile.analytics?.startedAt ??

                            null,

                        endedAt:

                            profile.analytics?.endedAt ??

                            null

                    });

                }

            );

            return Object.values(

                directory

            );

        }

    );

};
GG.queryActiveStaffList = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            request.parameters.dutyActive =

                true;

            const staff =

                StaffQuery.filterStaff(

                    request

                );

            return {

                count:

                    staff.length,

                staff:

                    staff

            };

        }

    );

};
    /*----------------------------------
  Beat Directory
----------------------------------*/

GG.queryBeatDirectory = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            const staff =

                StaffQuery.filterStaff(

                    request

                );

            return [

                {

                    beat:

                        request.parameters?.beat ||

                        "",

                    totalStaff:

                        staff.length,

                    staff:

                        staff

                }

            ];

        }

    );

};    /*----------------------------------
  Designation Directory
----------------------------------*/

GG.queryDesignationDirectory = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            console.group(

                "📄 QUERY DESIGNATION DIRECTORY"

            );

            console.log(

                "REQUEST"

            );

            console.dir(

                request,

                {

                    depth: null

                }

            );

            const profiles =

                StaffQuery.filterStaff(

                    request

                );

            console.log(

                "FILTERED STAFF COUNT:",

                profiles.length

            );

            console.table(

                profiles.map(

                    function (

                        profile

                    ) {

                        return {

                            Name:

                                profile.identity?.cleanName,

                            Designation:

                                profile.identity?.designation,

                            Role:

                                profile.identity?.role,

                            Circle:

                                profile.posting?.circle,

                            Division:

                                profile.posting?.division,

                            Range:

                                profile.posting?.range,

                            Beat:

                                profile.posting?.beat

                        };

                    }

                )

            );

/*----------------------------------
  Resolve Designation
----------------------------------*/

let designation = "";

/* 1. Request parameter */

if (
    request.parameters?.designation
) {

    designation =
        String(
            request.parameters.designation
        ).trim();

}

/* 2. First staff profile */

else if (

    request.parameters?.staff?.identity?.designation

) {

    designation =
        String(
            request.parameters
                .staff
                .identity
                .designation
        ).trim();

}

/* 3. Infer from filtered result */

else if (

    profiles.length > 0

) {

    designation =
        String(

            profiles[0]
                .identity
                ?.designation ||

            ""

        ).trim();

}

/* 4. Final fallback */

if (

    designation === ""

) {

    designation =

        "UNASSIGNED";

}

            const result =

                [

                    {

                        designation:

                            designation,

                        totalStaff:

                            profiles.length,

                        staff:

                            profiles

                    }

                ];

            console.log(

                "RETURN OBJECT"

            );

            console.dir(

                result,

                {

                    depth: null

                }

            );

            console.log(

                "RETURN STAFF LENGTH:",

                result[0].staff.length

            );

            console.groupEnd();

            return result;

        }

    );

};

GG.queryDesignationCount = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            const profiles =

                StaffQuery.filterStaff(

                    request

                );

            return [

                {

                    designation:

                        request.parameters?.designation ||

                        null,

                    circle:

                        request.parameters?.circle ||

                        null,

                    division:

                        request.parameters?.division ||

                        null,

                    range:

                        request.parameters?.range ||

                        null,

                    beat:

                        request.parameters?.beat ||

                        null,

                    totalStaff:

                        profiles.length,

                    staff:

                        profiles

                }

            ];

        }

    );

};
/*----------------------------------
  Who Is On Duty
----------------------------------*/

GG.queryWhoIsOnDuty = async function (

    request

) {

    return GG.queryActiveStaffList(

        request

    );

};

/*----------------------------------
  Who Is Patrolling
----------------------------------*/

GG.queryWhoIsPatrolling = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            /*----------------------------------
              Entire Staff Collection
            ----------------------------------*/

            const staff =

                StaffQuery.ensureAllStaff();

            /*----------------------------------
              Filter Patrolling Staff
            ----------------------------------*/

            const patrolling =

                staff.filter(

                    function (

                        profile

                    ) {

                        const assignment =

                            profile.assignment ||

                            {};

                        const dutyType =

                            String(

                                assignment.dutyType ||

                                ""

                            )

                            .trim()

                            .toUpperCase();

                        return (

                            assignment.dutyActive ===

                                true &&

                            dutyType.includes(

                                "PATROL"

                            )

                        );

                    }

                );

            /*----------------------------------
              Result
            ----------------------------------*/

            return {

                count:

                    patrolling.length,

                staff:

                    patrolling

            };

        }

    );

};
 /*=========================================================
 MODULE INFORMATION
=========================================================*/

/*----------------------------------
  Status
----------------------------------*/

StaffQuery.getStatus = function () {

    return {

        loaded:

            StaffQuery.loaded,

        loading:

            StaffQuery.loading,

        version:

            StaffQuery.VERSION,

        cacheSize:

            StaffQuery.cache.size,

        statistics:

            {

                ...StaffQuery.statistics

            }

    };

};

/*----------------------------------
  Reset
----------------------------------*/

StaffQuery.reset = function () {

    StaffQuery.clearCache();

    StaffQuery.loaded =

        false;

    StaffQuery.loading =

        false;

    StaffQuery.lastQuery =

        null;

    StaffQuery.lastResult =

        null;

    return StaffQuery.initialize();

};

/*=========================================================
 AUTO INITIALIZATION
=========================================================*/

StaffQuery.initialize();

/*=========================================================
 EXPORT
=========================================================*/

GG.StaffQuery =

    StaffQuery;

/*=========================================================
 MODULE LOADED
=========================================================*/

console.log(

    "✅ StaffQuery Loaded",

    StaffQuery.VERSION

);

})(

    window

);
