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

/*=========================================================
 HELPER FUNCTIONS
=========================================================*/

/*----------------------------------
  Get Staff List
----------------------------------*/

StaffQuery.getStaff = function (

    request

) {

    const staff =

        Array.isArray(

            request?.entities?.staff

        )

            ? request.entities.staff

            : [];

    return staff.map(

        function (

            profile

        ) {

            const cleanName =

                String(

                    profile?.identity?.cleanName ||

                    profile?.cleanName ||

                    ""

                )

                .trim()

                .toUpperCase();

            if (

                cleanName &&

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

            return profile;

        }

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

GG.queryStaffGPS = async function (

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

                StaffQuery.getStaff(

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

                StaffQuery.getStaff(

                    request

                );

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

                StaffQuery.getStaff(

                    request

                ).filter(

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

                StaffQuery.getStaff(

                    request

                ).filter(

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

                StaffQuery.getStaff(

                    request

                ).filter(

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

GG.queryStaffSummary = async function (

    request

) {

    return StaffQuery.execute(

        request,

        async function (

            request

        ) {

            const profiles =

                StaffQuery.ensureStaff(

                    request

                );

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
                          Patrol Analytics
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

            const profiles =

                StaffQuery.ensureStaff(

                    request

                );

            const summary = {};

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

                        ) > 0

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

            const profiles =

                StaffQuery.ensureStaff(

                    request

                );

            const summary = {};

            profiles.forEach(

                function (

                    profile

                ) {

                    const designation =

                        profile.identity?.designation ||

                        "UNASSIGNED";

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

                        ) > 0

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

            const profiles =

                StaffQuery.ensureStaff(

                    request

                );

            const directory = {};

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

                        phone:

                            profile.identity?.phone ||

                            "",

                        email:

                            profile.identity?.email ||

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

                        speed:

                            profile.gps?.speed ??

                            null,

                        lastSeen:

                            profile.gps?.lastSeen ??

                            null,

                        distanceKm:

                            profile.analytics?.distanceKm ??

                            0,

                        pointCount:

                            profile.analytics?.pointCount ??

                            0

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

            const profiles =

                StaffQuery.ensureStaff(

                    request

                );

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

            const profiles =

                StaffQuery.ensureStaff(

                    request

                );

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

            const profiles =

                StaffQuery.ensureStaff(

                    request

                );

            const directory = {};

            profiles.forEach(

                function (

                    profile

                ) {

                    const beat =

                        profile.posting?.beat ||

                        "UNASSIGNED";

                    if (

                        !directory[beat]

                    ) {

                        directory[beat] = {

                            beat:

                                beat,

                            totalStaff:

                                0,

                            staff: []

                        };

                    }

                    const group =

                        directory[beat];

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

            const profiles =

                StaffQuery.ensureStaff(

                    request

                );

            const directory = {};

            profiles.forEach(

                function (

                    profile

                ) {

                    const designation =

                        profile.identity?.designation ||

                        "UNASSIGNED";

                    if (

                        !directory[designation]

                    ) {

                        directory[designation] = {

                            designation:

                                designation,

                            totalStaff:

                                0,

                            staff: []

                        };

                    }

                    const group =

                        directory[designation];

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

            const staff =

                StaffQuery.ensureStaff(

                    request

                );

            const patrolling =

                staff.filter(

                    function (

                        profile

                    ) {

                        return (

                            profile.assignment?.dutyActive ===

                            true &&

                            String(

                                profile.assignment?.dutyType ||

                                ""

                            )

                            .trim()

                            .toUpperCase()

                            .includes(

                                "PATROL"

                            )

                        );

                    }

                );

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
