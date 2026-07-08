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

const StaffRouter =

    GG.StaffRouter;

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

if (

    !StaffRouter

) {

    throw new Error(

        "StaffRouter not loaded."

    );

}

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

    "1.0.0";

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

                StaffQuery.VERSION,

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

    /*----------------------------------
      Validate
    ----------------------------------*/

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

    /*----------------------------------
      Create Response
    ----------------------------------*/

    const response =

        StaffQuery.createResponse(

            request

        );

    /*----------------------------------
      Cache Key
    ----------------------------------*/

    const cacheKey =

        JSON.stringify({

            intent:

                request.intent,

            parameters:

                request.parameters

        });

    /*----------------------------------
      Cache Lookup
    ----------------------------------*/

    const cached =

        StaffQuery.getCache(

            cacheKey

        );

    if (

        cached

    ) {

        cached.metadata.cache =

            true;

        return cached;

    }

    try {

        /*----------------------------------
          Execute Handler
        ----------------------------------*/

        response.data =

            await handler(

                request

            );

        response.success =

            true;

        response.count =

            Array.isArray(

                response.data

            )

                ? response.data.length

                : response.data

                    ? 1

                    : 0;

        StaffQuery.statistics.successes++;

    }

    catch (

        error

    ) {

        response.success =

            false;

        response.errors.push(

            error.message

        );

        StaffQuery.statistics.failures++;

    }

    /*----------------------------------
      Metadata
    ----------------------------------*/

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

    /*----------------------------------
      Save Cache
    ----------------------------------*/

    StaffQuery.lastQuery =

        request;

    StaffQuery.lastResult =

        response;

    StaffQuery.setCache(

        cacheKey,

        response

    );

    return response;

};

 /*=========================================================
 HELPER FUNCTIONS
=========================================================*/

/*----------------------------------
  Get Staff List
----------------------------------*/

StaffQuery.getStaff = function (

    request

) {

    return (

        request?.entities?.staff ||

        []

    );

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

};

/*----------------------------------
  Ensure Single Staff
----------------------------------*/

StaffQuery.ensureSingleStaff = function (

    request

) {

    const staff =

        StaffQuery.getStaff(

            request

        );

    if (

        staff.length === 0

    ) {

        throw new Error(

            "No staff found."

        );

    }

    if (

        staff.length > 1

    ) {

        throw new Error(

            "Multiple staff matched."

        );

    }

    return staff[0];

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

GG.queryStaffContact = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return profile.contact ||

                null;

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

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return {

                role:

                    profile.identity?.role ||

                    null

            };

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

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return {

                designation:

                    profile.identity?.designation ||

                    null

            };

        }

    );

};

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

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return profile.posting ||

                null;

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

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return {

                circle:

                    profile.posting?.circle ||

                    null

            };

        }

    );

};

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

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return {

                division:

                    profile.posting?.division ||

                    null

            };

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

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return {

                range:

                    profile.posting?.range ||

                    null

            };

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

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return {

                beat:

                    profile.posting?.beat ||

                    null

            };

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

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return profile.assignment ||

                null;

        }

    );

};

/*----------------------------------
  Duty Status
----------------------------------*/

GG.queryStaffDutyStatus = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return {

                dutyStatus:

                    profile.assignment?.dutyStatus ||

                    null

            };

        }

    );

};

/*----------------------------------
  Duty Type
----------------------------------*/

GG.queryStaffDutyType = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return {

                dutyType:

                    profile.assignment?.dutyType ||

                    null

            };

        }

    );

};

/*----------------------------------
  Duty Started
----------------------------------*/

GG.queryStaffDutyStarted = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return {

                dutyStarted:

                    profile.assignment?.dutyStarted ||

                    null

            };

        }

    );

};

/*----------------------------------
  Duty Ended
----------------------------------*/

GG.queryStaffDutyEnded = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return {

                dutyEnded:

                    profile.assignment?.dutyEnded ||

                    null

            };

        }

    );

};

/*----------------------------------
  Duty Active
----------------------------------*/

GG.queryStaffDutyActive = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return {

                dutyActive:

                    profile.assignment?.dutyActive ||

                    false

            };

        }

    );

};

/*----------------------------------
  Last Duty
----------------------------------*/

GG.queryStaffLastDuty = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return {

                lastDuty:

                    profile.assignment?.lastDuty ||

                    null

            };

        }

    );

};

/*----------------------------------
  Assignment
----------------------------------*/

GG.queryStaffAssignment = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return profile.assignment ||

                null;

        }

    );

};

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

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return profile.teamInfo ||

                null;

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

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return {

                leader:

                    profile.teamInfo?.leader ||

                    null

            };

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

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return (

                profile.teamInfo?.members ||

                []

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

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return {

                team:

                    profile.teamInfo?.team ||

                    null,

                leader:

                    profile.teamInfo?.leader ||

                    null,

                members:

                    profile.teamInfo?.members ||

                    []

            };

        }

    );

};

 /*=========================================================
 GPS QUERIES
=========================================================*/

/*----------------------------------
  Staff GPS
----------------------------------*/

GG.queryStaffGPS = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return (

                profile.gps ||

                null

            );

        }

    );

};

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

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return {

                speed:

                    profile.gps?.speed ??

                    null

            };

        }

    );

};
/*=========================================================
 STAFF LOCATION
=========================================================*/

GG.queryStaffLocation = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return {

                latitude:

                    profile.gps?.latitude ??

                    null,

                longitude:

                    profile.gps?.longitude ??

                    null,

                location:

                    profile.gps?.location ??

                    null,

                fixTime:

                    profile.gps?.fixTime ??

                    null,

                address:

                    profile.gps?.address ??

                    null,

                gps:

                    profile.gps ||

                    null

            };

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

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return {

                heading:

                    profile.gps?.heading ??

                    null

            };

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

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return {

                accuracy:

                    profile.gps?.accuracy ??

                    null

            };

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

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return (

                profile.analytics ||

                {}

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

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return {

                distance:

                    profile.analytics?.distance ??

                    null

            };

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

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return {

                patrolPoints:

                    profile.analytics?.patrolPoints ??

                    null

            };

        }

    );

};

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

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return {

                patrolStart:

                    profile.analytics?.patrolStart ??

                    null

            };

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

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return {

                patrolEnd:

                    profile.analytics?.patrolEnd ??

                    null

            };

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

            const profile =

                StaffQuery.ensureSingleStaff(

                    request

                );

            return {

                patrolDuration:

                    profile.analytics?.patrolDuration ??

                    null

            };

        }

    );

};

 /*=========================================================
 STRENGTH & CONTROL ROOM QUERIES
=========================================================*/

/*----------------------------------
  Staff Strength
----------------------------------*/

GG.queryStaffStrength = async function (

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

                strength:

                    staff.length,

                staff

            };

        }

    );

};

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

                StaffQuery.getStaff(

                    request

                ).filter(

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

            return StaffQuery.getStaff(

                request

            ).filter(

                function (

                    profile

                ) {

                    return (

                        profile.assignment?.dutyActive ===

                        true

                    );

                }

            );

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

            return StaffQuery.getStaff(

                request

            ).filter(

                function (

                    profile

                ) {

                    return (

                        profile.assignment?.dutyActive !==

                        true

                    );

                }

            );

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

                StaffQuery.getStaff(

                    request

                );

            return {

                total:

                    staff.length,

                active:

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

                inactive:

                    staff.filter(

                        function (

                            profile

                        ) {

                            return (

                                profile.assignment?.dutyActive !==

                                true

                            );

                        }

                    ).length

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

            return StaffQuery.getStaff(

                request

            ).filter(

                function (

                    profile

                ) {

                    return (

                        profile.identity?.role ===

                        "TEAM_LEADER"

                    );

                }

            );

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

            return StaffQuery.getStaff(

                request

            ).filter(

                function (

                    profile

                ) {

                    return Number(

                        profile.gps?.speed ||

                        0

                    ) > 0;

                }

            );

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

            return StaffQuery.getStaff(

                request

            ).filter(

                function (

                    profile

                ) {

                    return Number(

                        profile.gps?.speed ||

                        0

                    ) <= 0;

                }

            );

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

    return GG.queryMovingStaff(

        request

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
