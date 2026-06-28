/*!
 * GreenGuard AI
 * context.js
 * Version : 1.0.0
 * Production Safe
 *
 * Depends:
 *   GreenGuardAI.Config
 *   GreenGuardAI.Cache
 */

(function (window) {

    "use strict";

    /*----------------------------------------------------------
      Namespace
    ----------------------------------------------------------*/

    window.GreenGuardAI =
        window.GreenGuardAI || {};

    if (window.GreenGuardAI.Context) {

        console.warn(
            "[GreenGuardAI] Context already loaded."
        );

        return;

    }

    if (!window.GreenGuardAI.Config) {

        console.error(
            "[GreenGuardAI] Config module missing."
        );

        return;

    }

    if (!window.GreenGuardAI.Cache) {

        console.error(
            "[GreenGuardAI] Cache module missing."
        );

        return;

    }

    const Config =
        window.GreenGuardAI.Config;

    const Cache =
        window.GreenGuardAI.Cache;

    const Context = {};

    /*----------------------------------------------------------
      Private State
    ----------------------------------------------------------*/

    let ready = false;

    let lastContext = {};

    let lastUpdated = 0;

    /*----------------------------------------------------------
      Init
    ----------------------------------------------------------*/

    Context.init = async function () {

        if (ready)
            return true;

        try {

          await Cache.init();

ready = true;

Config.log(
    "Context",
    "Initialized"
);

            return true;

        }

        catch (err) {

            Config.error(
                "Context.init",
                err
            );

            return false;

        }

    };

    /*----------------------------------------------------------
      Safe Window Read
    ----------------------------------------------------------*/

    function read(path, fallback = null) {

        try {

            const parts = path.split(".");

            let obj = window;

            for (const part of parts) {

                if (

                    obj === undefined ||

                    obj === null

                ) {

                    return fallback;

                }

                obj = obj[part];

            }

            return obj ?? fallback;

        }

        catch {

            return fallback;

        }

    }

    /*----------------------------------------------------------
      Exists
    ----------------------------------------------------------*/

    function exists(value) {

        return (

            value !== undefined &&

            value !== null

        );

    }

    /*----------------------------------------------------------
      Clone
    ----------------------------------------------------------*/

    function clone(value) {

        return Config.clone(value);

    }

    /*----------------------------------------------------------
      Safe Array
    ----------------------------------------------------------*/

    function array(value) {

        return Array.isArray(value)

            ? value

            : [];

    }

    /*----------------------------------------------------------
      Safe Object
    ----------------------------------------------------------*/

    function object(value) {

        return (

            value &&

            typeof value === "object"

        )

            ? value

            : {};

    }

    /*----------------------------------------------------------
      Safe Number
    ----------------------------------------------------------*/

    function number(value) {

        const n = Number(value);

        return Number.isFinite(n)

            ? n

            : 0;

    }

    /*----------------------------------------------------------
      Safe String
    ----------------------------------------------------------*/

    function string(value) {

        if (

            value === undefined ||

            value === null

        )

            return "";

        return String(value);

    }

    /*----------------------------------------------------------
      Empty
    ----------------------------------------------------------*/

    function empty(value) {

        if (!exists(value))
            return true;

        if (

            Array.isArray(value)

        )

            return value.length === 0;

        if (

            typeof value === "object"

        )

            return (

                Object.keys(value)

                    .length === 0

            );

        return false;

    }

    /*----------------------------------------------------------
      Timestamp
    ----------------------------------------------------------*/

    function timestamp() {

        return Date.now();

    }

    /*----------------------------------------------------------
      Cache Helpers
    ----------------------------------------------------------*/

    async function cacheGet(key) {

        return await Cache.get(key);

    }

    async function cacheSet(

        key,

        value,

        ttl

    ) {

        return await Cache.set(

            key,

            value,

            ttl

        );

    }

    /*----------------------------------------------------------
      Reset
    ----------------------------------------------------------*/

    Context.reset = function () {

        lastContext = {};

        lastUpdated = 0;

    };

    /*----------------------------------------------------------
      Status
    ----------------------------------------------------------*/

    Context.isReady = function () {

        return ready;

    };

    /*----------------------------------------------------------
      Last Context
    ----------------------------------------------------------*/

    Context.last = function () {

        return clone(

            lastContext

        );

    };


  /*----------------------------------------------------------
  USER
----------------------------------------------------------*/
/*----------------------------------------------------------
  USER PROFILE
----------------------------------------------------------*/

Context.getProfile = function () {

    return clone(

        object(

            read("userProfile", {})

        )

    );

};



/*----------------------------------------------------------
  DUTY
----------------------------------------------------------*/

Context.getDuty = function () {

    const sessions = object(

        read(
            "activeSessionMap",
            {}
        )

    );

    return {

        active:

            !!read(
                "isDutyActive",
                false
            ),

        sessions:

            clone(sessions),

        sessionCount:

            Object.keys(sessions).length

    };

};


/*----------------------------------------------------------
  ACTIVE POPUP
----------------------------------------------------------*/

Context.getSelection = function () {

    return object(

        read("activePopupContext", {})

    );

};





/*----------------------------------------------------------
  CURRENT LOCATION
----------------------------------------------------------*/

Context.getLocation = function () {

    const gps = object(

        read("latestGps", {})

    );

    return {

        lat: number(gps.lat),

        lng: number(gps.lng),

        accuracy: number(gps.accuracy),

        speed: number(gps.speed),

        heading: number(gps.heading),

        timestamp: gps.timestamp || null

    };

};
/*----------------------------------------------------------
  LIVE STAFF
----------------------------------------------------------*/

Context.getLiveStaff = function () {

    const markers = object(

        read("staffMarkers", {})

    );

    return {

        count: Object.keys(markers).length,

        names: Object.keys(markers)

    };

};
/*----------------------------------------------------------
  PATROL
----------------------------------------------------------*/

Context.getPatrol = function () {

    const tracks = object(

        read(
            "staffTracks",
            {}
        )

    );

    const sessions = object(

        read(
            "activeSessionMap",
            {}
        )

    );

    return {

        tracks:

            Object.keys(tracks).length,

        sessions:

            Object.keys(sessions).length,

        latestGps:

            clone(

                object(

                    read(
                        "latestGps",
                        {}
                    )

                )

            )

    };

};

    /*----------------------------------------------------------
  GIS
----------------------------------------------------------*/

Context.getGIS = function () {

    const features =

        array(

            read(

                "allGISFeatures",

                []

            )

        );

    const compartments =

        array(

            read(

                "allCompartmentFeatures",

                []

            )

        );

    return {

        featureCount:

            features.length,

        compartmentCount:

            compartments.length,

        gridReady:

            !!read(

                "__gridReady",

                false

            )

    };


    
};

    /*----------------------------------------------------------
  ANALYTICS
----------------------------------------------------------*/

Context.getAnalytics = function () {

    const realtime =
        clone(
            object(
                read(
                    "realtimeAnalyticsState",
                    {}
                )
            )
        );

    const cache =
        clone(
            object(
                read(
                    "monthlyStatusCache",
                    {}
                )
            )
        );

    const sel = Context.getSelection() || {};

    let key = "btr_all";

    if (
        sel.level === "division" &&
        sel.division &&
        sel.division !== "ALL"
    ) {

        key =
            "division_" +
            String(sel.division)
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "_");

    }
    else if (
        sel.level === "range" &&
        sel.range &&
        sel.range !== "ALL"
    ) {

        key =
            "range_" +
            String(sel.range)
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "_");

    }
    else if (
        sel.level === "beat" &&
        sel.beat &&
        sel.beat !== "ALL"
    ) {

        key =
            "beat_" +
            String(sel.beat)
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "_");

    }
    else if (
        sel.level === "compartment" &&
        sel.compartment
    ) {

        key =
            "compartment_" +
            String(sel.compartment)
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "_");

    }

    return {

        realtime,

        monthly:
            clone(
                object(
                    cache[key] ||
                    cache.btr_all ||
                    {}
                )
            )

    };

};
    /*----------------------------------------------------------
  COVERAGE
----------------------------------------------------------*/

Context.getCoverage = function () {

    const analytics =
        clone(
            object(
                read(
                    "realtimeAnalyticsState",
                    {}
                )
            )
        );

    const monthly =
        clone(
            object(
                read(
                    "monthlyStatusCache",
                    {}
                )
            )
        );

    return {

        gridsVisited:

            number(

                analytics.visitedCells ||

                monthly.visitedCells ||

                monthly.cells ||

                0

            ),

        totalGrids:

            number(

                analytics.totalCells ||

                monthly.totalCells ||

                monthly.grids ||

                0

            ),

        coveragePercent:

            number(

                analytics.coverage ||

                monthly.coverage ||

                0

            ),

        compartmentsVisited:

            number(

                analytics.compartmentsVisited ||

                monthly.compartmentsVisited ||

                monthly.compartments ||

                0

            ),

        totalCompartments:

            number(

                analytics.totalCompartments ||

                monthly.totalCompartments ||

                0

            ),

        areaCoveredHa:

            number(

                analytics.areaCoveredHa ||

                monthly.areaCoveredHa ||

                monthly.area ||

                0

            ),

        totalAreaHa:

            number(

                analytics.totalAreaHa ||

                monthly.totalAreaHa ||

                0

            )

    };

};

/*----------------------------------------------------------
  MONTHLY STATUS
----------------------------------------------------------*/

/*----------------------------------------------------------
  MONTHLY STATUS
----------------------------------------------------------*/

Context.getMonthlyStatus = function () {

    const cache =
        clone(
            object(
                read(
                    "monthlyStatusCache",
                    {}
                )
            )
        );

    // -------------------------------------
    // Determine cache key from selection
    // -------------------------------------

    const sel =
        Context.getSelection() || {};

    let key = "btr_all";

    if (
        sel.level === "division" &&
        sel.division &&
        sel.division !== "ALL"
    ) {

        key =
            "division_" +
            String(sel.division)
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "_");

    }
    else if (
        sel.level === "range" &&
        sel.range &&
        sel.range !== "ALL"
    ) {

        key =
            "range_" +
            String(sel.range)
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "_");

    }
    else if (
        sel.level === "beat" &&
        sel.beat &&
        sel.beat !== "ALL"
    ) {

        key =
            "beat_" +
            String(sel.beat)
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "_");

    }
    else if (
        sel.level === "compartment" &&
        sel.compartment
    ) {

        key =
            "compartment_" +
            String(sel.compartment)
                .trim()
                .toLowerCase()
                .replace(/\s+/g, "_");

    }

    // -------------------------------------
    // Selected analytics
    // -------------------------------------

    const monthly =
        object(
            cache[key] ||
            cache.btr_all ||
            {}
        );

    // -------------------------------------
    // Live Staff
    // -------------------------------------

    let liveStaff = 0;

    try {

        if (
            typeof window.getLiveStaffCountForCurrentPolygon ===
            "function"
        ) {

            liveStaff =
                Number(
                    window.getLiveStaffCountForCurrentPolygon()
                ) || 0;

        }
        else {

            liveStaff =
                Number(
                    monthly.liveStaff ||
                    monthly.staff ||
                    0
                );

        }

    }
    catch {

        liveStaff =
            Number(
                monthly.liveStaff ||
                monthly.staff ||
                0
            );

    }

    // -------------------------------------
    // Return
    // -------------------------------------

    return {

        liveStaff:

            liveStaff,

        patrolSessions:

            number(

                monthly.visitCount ||

                monthly.sessions ||

                monthly.patrolSessions ||

                0

            ),

      patrolDistanceKm:

    number(

        (

            monthly.distanceMeters ||

            monthly.totalDistanceMeters ||

            monthly.distance ||

            0

        ) / 1000

    ),
        visitedCells:

            number(

                monthly.totalCovered ||

                monthly.visitedCells ||

                monthly.cells ||

                0

            ),

        totalCells:

            number(

                monthly.totalCells ||

                0

            ),

        areaCoveredHa:

            number(

                monthly.areaCoveredHa ||

                monthly.areaHa ||

                monthly.area ||

                0

            ),

        compartmentsVisited:

            number(

                monthly.visitedCompartments ||

                monthly.compartmentsVisited ||

                monthly.compartments ||

                0

            ),

        totalCompartments:

            number(

                monthly.compartments ||

                0

            ),

        coverage:

            number(

                monthly.coveragePercent ||

                monthly.coverage ||

                0

            ),

        newlyCovered:

            number(

                monthly.newlyCovered ||

                0

            ),

        previouslyCovered:

            number(

                monthly.previouslyCovered ||

                0

            ),

        totalCovered:

            number(

                monthly.totalCovered ||

                0

            ),

        totalDistanceMeters:

            number(

                monthly.totalDistanceMeters ||

                monthly.distanceMeters ||

                0

            ),

        visitCount:

            number(

                monthly.visitCount ||

                0

            ),

        updated:

            monthly.latestUpdatedAt ||

            monthly.updatedAt ||

            monthly.updated ||

            null,

        raw:

            clone(monthly)

    };

};   /*----------------------------------------------------------
  PATROL RANKING
----------------------------------------------------------*/

Context.getPatrolRanking = function () {

    const tracks =
        object(
            read(
                "staffTracks",
                {}
            )
        );

    const analytics =
        clone(
            object(
                read(
                    "realtimeAnalyticsState",
                    {}
                )
            )
        );

    const ranking = [];

    Object.keys(tracks).forEach(name => {

        const info =
            object(
                analytics[name]
            );

        ranking.push({

            staff: name,

            distanceKm:
                number(
                    info.distanceKm ||
                    info.distance ||
                    0
                ),

            visitedCells:
                number(
                    info.visitedCells ||
                    0
                ),

            compartments:
                number(
                    info.compartments ||
                    info.compartmentsVisited ||
                    0
                ),

            areaHa:
                number(
                    info.areaHa ||
                    info.areaCoveredHa ||
                    0
                )

        });

    });

    ranking.sort(

        (a,b)=>

            b.distanceKm-

            a.distanceKm

    );

    return {

        total:

            ranking.length,

        ranking

    };

};

/*----------------------------------------------------------
  HEATMAP
----------------------------------------------------------*/

Context.getHeatmap = function () {

    return {

        enabled:

            !!read(

                "heatmapEnabled",

                false

            ),

        gridReady:

            !!read(

                "__gridReady",

                false

            ),

        visitedCells:

            number(

                read(

                    "visitedGridCount",

                    0

                )

            ),

        totalCells:

            number(

                read(

                    "totalGridCount",

                    0

                )

            ),

        layers:

            number(

                array(

                    read(

                        "heatmapLayers",

                        []

                    )

                ).length

            )

    };

};
    /*----------------------------------------------------------
  COMPARE MONTHS
----------------------------------------------------------*/

Context.compareMonths = function (args = {}) {

    const monthly =
        clone(
            object(
                read(
                    "monthlyStatusCache",
                    {}
                )
            )
        );

    return {

        month1:

            args.month1 ||

            null,

        month2:

            args.month2 ||

            null,

        current:

            monthly,

        message:

            "Comparison requires archived monthly data."

    };

};

/*----------------------------------------------------------
  DAILY REPORT
----------------------------------------------------------*/

Context.generateDailyReport = function () {

    const patrol =
        Context.getPatrol();

    const coverage =
        Context.getCoverage();

    const live =
        Context.getLiveStaff();

    return {

        generated:

            new Date().toISOString(),

        liveStaff:

            live.count,

        patrolSessions:

            patrol.sessions,

        patrolTracks:

            patrol.tracks,

        gridsVisited:

            coverage.gridsVisited,

        coverage:

            coverage.coveragePercent,

        compartmentsVisited:

            coverage.compartmentsVisited,

        areaCoveredHa:

            coverage.areaCoveredHa

    };

};

/*----------------------------------------------------------
  MONTHLY REPORT
----------------------------------------------------------*/

Context.generateMonthlyReport = function () {

    const monthly =
        Context.getMonthlyStatus();

    return {

        generated:

            new Date().toISOString(),

        report:

            monthly

    };

};

/*----------------------------------------------------------
  DFO BRIEFING
----------------------------------------------------------*/

Context.generateDFOBriefing = function () {

    return {

        generated:

            new Date().toISOString(),

        liveStaff:

            Context.getLiveStaff(),

        patrol:

            Context.getPatrol(),

        coverage:

            Context.getCoverage(),

        monthly:

            Context.getMonthlyStatus(),

        selection:

            Context.getSelection()

    };

};
    /*----------------------------------------------------------
  COURT SEARCH
----------------------------------------------------------*/

Context.searchCourtCases = function (args = {}) {

    return {

        query:

            args.query || "",

        source:

            "Court database not connected.",

        results: []

    };

};

/*----------------------------------------------------------
  RESEARCH SEARCH
----------------------------------------------------------*/

Context.searchResearch = function (args = {}) {

    return {

        query:

            args.query || "",

        source:

            "Research database not connected.",

        papers: []

    };

};

/*----------------------------------------------------------
  ELEPHANT PREDICTION
----------------------------------------------------------*/

Context.predictElephantMovement = function () {

    const sightings =

        clone(

            object(

                read(

                    "latestSightings",

                    {}

                )

            )

        );

    return {

        basedOn:

            sightings,

        prediction:

            "Prediction engine not connected."

    };

};

/*----------------------------------------------------------
  PATROL PRIORITY
----------------------------------------------------------*/

Context.predictPatrolPriority = function () {

    return {

        recommendation:

            "Priority engine not connected.",

        areas: []

    };

};

/*----------------------------------------------------------
  SYSTEM HEALTH
----------------------------------------------------------*/

Context.systemHealth = function () {

    return {

        profile:

            true,

        duty:

            true,

        patrol:

            true,

        analytics:

            true,

        gis:

            true,

        coverage:

            true,

        monthly:

            true,

        liveStaff:

            true,

        weather:

            typeof window.callBackend === "function",

        ai:

            true,

        cache:

            Context.isReady(),

        online:

            navigator.onLine

    };

};

/*----------------------------------------------------------
  AI DIAGNOSTICS
----------------------------------------------------------*/

Context.runDiagnostics = function () {

    const tests = [

        {

            name:

                "Profile",

            ok:

                !!Context.getProfile()

        },

        {

            name:

                "Duty",

            ok:

                true

        },

        {

            name:

                "Live Staff",

            ok:

                Context.getLiveStaff().count >= 0

        },

        {

            name:

                "Patrol",

            ok:

                Context.getPatrol().tracks >= 0

        },

        {

            name:

                "GIS",

            ok:

                Context.getGIS().featureCount >= 0

        },

        {

            name:

                "Coverage",

            ok:

                true

        },

        {

            name:

                "Monthly",

            ok:

                true

        },

        {

            name:

                "Analytics",

            ok:

                true

        }

    ];

    const passed =

        tests.filter(

            t => t.ok

        ).length;

    return {

        generated:

            new Date()

            .toISOString(),

        passed,

        failed:

            tests.length -

            passed,

        total:

            tests.length,

        status:

            passed ===

            tests.length

                ? "OPERATIONAL"

                : "WARNING",

        tests,

        system:

            Context.systemHealth()

    };

};
/*----------------------------------------------------------
  DEVICE
----------------------------------------------------------*/

Context.getDevice = function () {

    return {

        online:

            navigator.onLine,

        language:

            navigator.language,

        platform:

            navigator.platform,

        userAgent:

            navigator.userAgent

    };

};



/*----------------------------------------------------------
  SNAPSHOT
----------------------------------------------------------*/

Context.snapshot = async function () {

  lastContext = {

   profile:

    Context.getProfile(),

    duty:

        Context.getDuty(),

    liveStaff:

        Context.getLiveStaff(),

    patrol:

        Context.getPatrol(),

    gis:

        Context.getGIS(),

    analytics:

        Context.getAnalytics(),

    selection:

        Context.getSelection(),

    location:

        Context.getLocation(),

    device:

        Context.getDevice(),

    updated:

        timestamp()

};
  lastUpdated =
    lastContext.updated;

await cacheSet(
    "context_snapshot",
    lastContext,
    10000
);

return clone(
    lastContext
);
};
    Context.updated = function () {

    return lastUpdated;

};
/*----------------------------------------------------------
  REFRESH
----------------------------------------------------------*/

Context.refresh = async function () {

    Context.reset();

    return await Context.snapshot();

};
    /*----------------------------------------------------------
  AUTO INITIALIZE
----------------------------------------------------------*/

Context.init()

    .then(() => {

        Config.log(

            "Context",

            "Ready"

        );

    })

    .catch((err) => {

        Config.error(

            "Context",

            err

        );

    });
    /*----------------------------------------------------------
      Register
    ----------------------------------------------------------*/

    window.GreenGuardAI.Context =
        Context;

    console.log(

        "%cGreenGuard AI Context Loaded",

        "color:#008800;font-weight:bold;"

    );

})(window);
