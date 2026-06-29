(function (window) {
    "use strict";

    window.GreenGuardAI = window.GreenGuardAI || {};

    const AnalyticsEngine = {};

    AnalyticsEngine.dataset = [];
    AnalyticsEngine.datasetMap = {};
    AnalyticsEngine.beatIndex = {};
    AnalyticsEngine.rangeIndex = {};
    AnalyticsEngine.divisionIndex = {};
    AnalyticsEngine.staffIndex = {};
    AnalyticsEngine.staffSearchIndex = {};
    AnalyticsEngine.sessionIndex = {};
    AnalyticsEngine.latestSessionIndex = {}; // Added for Improvement 4
    AnalyticsEngine.compartmentIndex = {};
    AnalyticsEngine.searchIndex = {};
    AnalyticsEngine.loaded = false;
    AnalyticsEngine.loading = false;
    AnalyticsEngine.lastLoaded = 0;
    AnalyticsEngine.version = "2.0.0";

    AnalyticsEngine.clear = function () {
        AnalyticsEngine.dataset = [];
        AnalyticsEngine.datasetMap = {};
        AnalyticsEngine.staffSearchIndex = {};
        AnalyticsEngine.beatIndex = {};
        AnalyticsEngine.rangeIndex = {};
        AnalyticsEngine.divisionIndex = {};
        AnalyticsEngine.staffIndex = {};
        AnalyticsEngine.sessionIndex = {};
        AnalyticsEngine.latestSessionIndex = {}; // Added for Improvement 4
        AnalyticsEngine.compartmentIndex = {};
        AnalyticsEngine.searchIndex = {};
        AnalyticsEngine.loaded = false;
        AnalyticsEngine.lastLoaded = 0;
        window.analyticsDataset = [];
    };

    AnalyticsEngine.getDataset = function () { return AnalyticsEngine.dataset; };
    AnalyticsEngine.isLoaded = function () { return AnalyticsEngine.loaded; };
    AnalyticsEngine.getStats = function () {
        return {
            loaded: AnalyticsEngine.loaded,
            loading: AnalyticsEngine.loading,
            version: AnalyticsEngine.version,
            lastLoaded: AnalyticsEngine.lastLoaded,
            records: AnalyticsEngine.dataset.length
        };
    };
    /*----------------------------------------------------------
INACTIVE COMPARTMENTS
----------------------------------------------------------*/

AnalyticsEngine.queryInactiveCompartments = function () {

    return AnalyticsEngine.dataset.filter(

        row =>

            Number(
                row.coverage || 0
            ) === 0

    ).sort(

        (a, b) =>

            a.compartment.localeCompare(
                b.compartment
            )

    );

};

    AnalyticsEngine.getSummary = function () { return AnalyticsEngine.summary; };
    AnalyticsEngine.getSession = function(sessionId) { return AnalyticsEngine.sessionIndex[sessionId] || null; };

    // Improvement 4: Helper for latest session
    AnalyticsEngine.getLatestSession = function(cleanName){
        return AnalyticsEngine.latestSessionIndex[
            String(cleanName || "")
                .toUpperCase()
        ] || null;
    };

    /*----------------------------------------------------------
    UTILITIES: MATCHES, RANK, AND INDEXING
    ----------------------------------------------------------*/
    function matches(query, terms) { return terms.some(term => query.includes(term)); }
    function normalizeKey(value) { return String(value || "").trim().toUpperCase().replace(/[\s_-]+/g, ""); }

    AnalyticsEngine.rank = function(items, field, descending = true) {
        return [...items].sort((a, b) => {
            return descending
                ? Number(b[field] || 0) - Number(a[field] || 0)
                : Number(a[field] || 0) - Number(b[field] || 0);
        });
    };

    AnalyticsEngine.indexRow = function(row) {
        const beat = String(row.beat || "").toUpperCase();
        const range = String(row.range || "").toUpperCase();
        const division = String(row.division || "").toUpperCase();
        const compKey = String(row.compartment || "").trim().toUpperCase().replace(/\s+/g, "_");

        if (beat) (AnalyticsEngine.beatIndex[beat] ||= []).push(row);
        if (range) (AnalyticsEngine.rangeIndex[range] ||= []).push(row);
        if (division) (AnalyticsEngine.divisionIndex[division] ||= []).push(row);
        if (compKey) AnalyticsEngine.compartmentIndex[compKey] = row;
    };

    AnalyticsEngine.buildBaseIndexes = function(dataset) {
        AnalyticsEngine.beatIndex = {};
        AnalyticsEngine.rangeIndex = {};
        AnalyticsEngine.divisionIndex = {};
        AnalyticsEngine.compartmentIndex = {};
        dataset.forEach(AnalyticsEngine.indexRow);
    };

    AnalyticsEngine.buildSearchIndexes = function() {
        AnalyticsEngine.searchIndex = {};
        Object.entries(AnalyticsEngine.beatIndex).forEach(([k, v]) => AnalyticsEngine.searchIndex[k] = { type: "beat", data: v });
        Object.entries(AnalyticsEngine.rangeIndex).forEach(([k, v]) => AnalyticsEngine.searchIndex[k] = { type: "range", data: v });
        Object.entries(AnalyticsEngine.divisionIndex).forEach(([k, v]) => AnalyticsEngine.searchIndex[k] = { type: "division", data: v });
        Object.entries(AnalyticsEngine.compartmentIndex).forEach(([k, v]) => AnalyticsEngine.searchIndex[v.compartment.toUpperCase()] = { type: "compartment", data: v });
    };

    /*----------------------------------------------------------
    LOAD ANALYTICS DATASET
    ----------------------------------------------------------*/
AnalyticsEngine.load = async function () {

    if (

        AnalyticsEngine.loading

    ) {

        return AnalyticsEngine.dataset;

    }

    if (

        AnalyticsEngine.loaded

    ) {

        return AnalyticsEngine.dataset;

    }

    AnalyticsEngine.loading = true;

    try {

        AnalyticsEngine.sessionIndex = {};

        AnalyticsEngine.latestSessionIndex = {};

        AnalyticsEngine.staffIndex = {};

        AnalyticsEngine.searchIndex = {};

        AnalyticsEngine.compartmentIndex = {};

        AnalyticsEngine.beatIndex = {};

        AnalyticsEngine.rangeIndex = {};

        AnalyticsEngine.divisionIndex = {};

        console.time(

            "AnalyticsEngine.build"

        );

        AnalyticsEngine.dataset =

            await AnalyticsEngine.build();

        window.analyticsDataset =

            AnalyticsEngine.dataset;

        AnalyticsEngine.loaded = true;

        AnalyticsEngine.lastLoaded =

            Date.now();

        console.timeEnd(

            "AnalyticsEngine.build"

        );

        console.log(

            "Sessions:",

            Object.keys(

                AnalyticsEngine.sessionIndex

            ).length

        );

        console.log(

            "Latest:",

            Object.keys(

                AnalyticsEngine.latestSessionIndex

            ).length

        );

        return AnalyticsEngine.dataset;

    }

    finally {

        AnalyticsEngine.loading = false;

    }

};

    AnalyticsEngine.buildMaster = function () {
        const dataset = [];
        const datasetMap = {};
        const masterGrid = window.masterGrid || {};
        for (const gridId of Object.keys(masterGrid)) {
            const g = masterGrid[gridId] || {};
            const row = {
                gridId, compartment: g.compartment || "", beat: g.beat || "", range: g.range || "", division: g.division || "",
                totalCells: Number(g.totalCells || 0), coveredCells: 0, coverage: 0, visits: 0, patrolDistanceKm: 0,
                analytics: {}, liveStaff: [], assignedStaff: [], patrolHistory: [], tracks: [],
                summary: { patrols: 0, patrolDistanceKm: 0, liveStaff: 0, assignedStaff: 0, coveredCells: 0, totalCells: 0, coverage: 0 }
            };
            dataset.push(row);
            datasetMap[gridId] = row;
        }
        return { dataset, datasetMap };
    };

    AnalyticsEngine.build = async function () {
        const { dataset, datasetMap } = AnalyticsEngine.buildMaster();
        AnalyticsEngine.datasetMap = datasetMap;

        AnalyticsEngine.buildBaseIndexes(dataset);

        await AnalyticsEngine.mergeAnalytics(dataset, datasetMap);
        await AnalyticsEngine.mergeStaffProfiles(dataset, datasetMap);
        await AnalyticsEngine.mergeLiveStaff(dataset, datasetMap);
        await AnalyticsEngine.mergeHistory(dataset, datasetMap);
        await AnalyticsEngine.mergePatrolTracks(dataset, datasetMap);

        AnalyticsEngine.buildSearchIndexes();
        AnalyticsEngine.dataset = dataset;
        AnalyticsEngine.aggregate();
        return dataset;
    };

    /*----------------------------------------------------------
    MERGE FUNCTIONS
    ----------------------------------------------------------*/
    AnalyticsEngine.mergeAnalytics = async function (dataset, datasetMap) {
        try {
            const monthKey = `${new Date().getFullYear()}_${String(new Date().getMonth() + 1).padStart(2, "0")}`;
            const gridIds = Object.keys(datasetMap);
            for (let i = 0; i < gridIds.length; i += 40) {
                const batch = gridIds.slice(i, i + 40);
                const snaps = await Promise.allSettled(batch.map(id => window.fb.getDoc(window.fb.doc(window.db, "analytics_rebuild", monthKey, "compartments", id))));
                snaps.forEach((res, idx) => {
                    if (res.status === "fulfilled" && res.value.exists()) {
                        const row = datasetMap[batch[idx]];
                        const a = res.value.data();
                        row.visits = Number(a.visitCount || 0);
                        row.coveredCells = Number(a.totalCovered || Object.keys(a.visitedCells || {}).length || 0);
                        row.coverage = row.totalCells > 0 ? (row.coveredCells / row.totalCells) * 100 : 0;
                        row.patrolDistanceKm = Number(a.distanceMeters || 0) / 1000;
                        Object.assign(row.summary, { coveredCells: row.coveredCells, totalCells: row.totalCells, coverage: row.coverage, patrols: row.visits, patrolDistanceKm: row.patrolDistanceKm });
                    }
                });
            }
        } catch (err) { console.error("Analytics merge failed", err); }
    };

   /*----------------------------------------------------------
MERGE STAFF PROFILES
----------------------------------------------------------*/

AnalyticsEngine.mergeStaffProfiles = async function () {

    try {

        AnalyticsEngine.staffIndex = {};

        AnalyticsEngine.staffSearchIndex = {};

        const snap =
            await window.fb.getDocs(

                window.fb.collection(

                    window.db,

                    "staff_profiles"

                )

            );

        snap.forEach(doc => {

            const s =
                doc.data() || {};

          const cleanName =
    String(

        s.cleanName ||

        s.name ||

        doc.id ||

        ""

    )
    .trim()
    .toUpperCase();

if (!cleanName) {

    return;

}

/*----------------------------------
NORMALIZE NAME + DESIGNATION
----------------------------------*/

const rawName =
    String(
        s.name || ""
    ).trim();

let profileName =
    rawName;

let profileDesignation =
    String(
        s.designation || ""
    ).trim();

if (

    !profileDesignation &&

    rawName.includes(",")

) {

    const parts =
        rawName.split(",");

    profileName =
        parts.shift().trim();

    profileDesignation =
        parts.join(",").trim();

}

const profile = {

    id:
        doc.id,

    cleanName,

    name:
        profileName,

    designation:
        profileDesignation,

    role:
        s.role || "",

    phone:
        s.phone || "",

    email:
        s.email || "",

    beat:
        s.beat || "",

    range:
        s.range || "",

    division:
        s.division || "",

    circle:
        s.circle || "",

    station:
        s.station || "",

    employeeId:
        s.employeeId || "",

    live:
        null,

    latestPatrol:
        null,

    patrols:
        [],

    analytics: {

        patrols: 0,

        distanceKm: 0,

        coverage: 0,

        visits: 0

    },

    assignedCompartments:
        []

};

AnalyticsEngine.staffIndex[
    cleanName
] = profile;

/*----------------------------------
DEBUG
----------------------------------*/

if (

    cleanName ===

    "SACHIN CHHETRI"

) {

    console.log(

        "NORMALIZED STAFF",

        {

            rawName,

            profileName,

            profileDesignation,

            profile

        }

    );

}

/*----------------------------------
SEARCH INDEX
----------------------------------*/

            /*----------------------------------
            SEARCH INDEX
            ----------------------------------*/

            [

                cleanName,

                profile.name,

                profile.designation,

                profile.role,

                profile.phone,

                profile.email,

                profile.beat,

                profile.range,

                profile.division,

                profile.circle,

                profile.station,

                profile.employeeId

            ]

            .filter(Boolean)

            .forEach(value => {

                const key =

                    normalizeKey(
                        value
                    );

                if (!key) {
                    return;
                }

                (

                    AnalyticsEngine.staffSearchIndex[
                        key
                    ] ||= []

                ).push(profile);

            });

            /*----------------------------------
            ASSIGNED COMPARTMENTS
            ----------------------------------*/

            const beatKey =

                String(

                    profile.beat || ""

                )
                .trim()
                .toUpperCase();

            const rows =

                AnalyticsEngine.beatIndex[
                    beatKey
                ] || [];

            rows.forEach(row => {

                row.summary.assignedStaff++;

                row.assignedStaff.push({

                    cleanName:
                        profile.cleanName,

                    name:
                        profile.name,

                    designation:
                        profile.designation,

                    role:
                        profile.role,

                    phone:
                        profile.phone,

                    beat:
                        profile.beat,

                    range:
                        profile.range,

                    division:
                        profile.division

                });

                profile.assignedCompartments.push(

                    row.compartment

                );

            });

        });

        console.log(

            "✅ Staff Profiles:",

            Object.keys(

                AnalyticsEngine.staffIndex

            ).length

        );

    }

    catch (err) {

        console.error(

            "❌ mergeStaffProfiles",

            err

        );

    }

};

/*----------------------------------------------------------
MERGE LIVE STAFF
----------------------------------------------------------*/

AnalyticsEngine.mergeLiveStaff = async function () {

    try {

        const snap =
            await window.fb.getDocs(

                window.fb.collection(

                    window.db,

                    "live_staff"

                )

            );

        snap.forEach(doc => {

            const live =
                doc.data() || {};

            const cleanName =

                String(

                    live.cleanName ||

                    live.name ||

                    doc.id ||

                    ""

                )
                .trim()
                .toUpperCase();

            if (!cleanName) {
                return;
            }

            const profile =
                AnalyticsEngine.staffIndex[
                    cleanName
                ];

            if (!profile) {
                return;
            }

            profile.live = {

                latitude:
                    Number(
                        live.latitude ||
                        live.lat ||
                        0
                    ),

                longitude:
                    Number(
                        live.longitude ||
                        live.lng ||
                        live.lon ||
                        0
                    ),

                accuracy:
                    Number(
                        live.accuracy ||
                        0
                    ),

                speed:
                    Number(
                        live.speed ||
                        0
                    ),

                heading:
                    Number(
                        live.heading ||
                        0
                    ),

                location:
                    live.location || "",

                dutyActive:
                    !!live.dutyActive,

                dutyType:
                    live.dutyType || "",

                sessionId:
                    live.sessionId || "",

                battery:
                    live.battery || "",

                updatedAt:

                    live.updatedAt ||

                    live.timestamp ||

                    live.lastUpdate ||

                    0,

                raw:
                    live

            };

            /*----------------------------------
            UPDATE BEAT SUMMARY
            ----------------------------------*/

            const rows =

                AnalyticsEngine.beatIndex[
                    String(
                        profile.beat || ""
                    )
                    .trim()
                    .toUpperCase()
                ] || [];

            rows.forEach(row => {

                row.liveStaff.push(profile);

                row.summary.liveStaff++;

            });

        });

        console.log(

            "✅ Live Staff merged"

        );

    }

    catch (err) {

        console.error(

            "❌ mergeLiveStaff",

            err

        );

    }

};

    AnalyticsEngine.mergeHistory = async function (dataset, datasetMap) {
        try {
            const snap = await window.fb.getDocs(window.fb.collection(window.db, "history"));
            snap.forEach(doc => {
                const h = doc.data() || {};
                (h.compartments || []).forEach(name => {
                    const row = AnalyticsEngine.compartmentIndex[String(name).trim().toUpperCase().replace(/\s+/g, "_")];
                    if (row) row.patrolHistory.push(h);
                });
            });
        } catch (err) { console.error("❌ mergeHistory", err); }
    };

 /*----------------------------------------------------------
MERGE PATROL TRACKS
----------------------------------------------------------*/

AnalyticsEngine.mergePatrolTracks = async function () {

    try {

        const snap =

            await window.fb.getDocs(

                window.fb.collection(

                    window.db,

                    "patrol_tracks"

                )

            );

        snap.forEach(doc => {

            const patrol =
                doc.data() || {};

            const cleanName =

                String(

                    patrol.cleanName ||

                    patrol.staff ||

                    patrol.staffName ||

                    patrol.name ||

                    ""

                )
                .trim()
                .toUpperCase();

            if (

                patrol.sessionId

            ) {

                AnalyticsEngine.sessionIndex[
                    patrol.sessionId
                ] = patrol;

            }

            if (

                cleanName

            ) {

                const old =

                    AnalyticsEngine.latestSessionIndex[
                        cleanName
                    ];

                const newTime =

                    Number(

                        patrol.updatedAt ||

                        patrol.endTime ||

                        patrol.startTime ||

                        0

                    );

                const oldTime =

                    Number(

                        old?.updatedAt ||

                        old?.endTime ||

                        old?.startTime ||

                        0

                    );

                if (

                    !old ||

                    newTime > oldTime

                ) {

                    AnalyticsEngine.latestSessionIndex[
                        cleanName
                    ] = patrol;

                }

            }

            const profile =

                AnalyticsEngine.staffIndex[
                    cleanName
                ];

            if (

                profile

            ) {

                profile.patrols.push(
                    patrol
                );

                if (

                    !profile.latestPatrol ||

                    Number(

                        patrol.updatedAt ||

                        patrol.endTime ||

                        patrol.startTime ||

                        0

                    )

                    >

                    Number(

                        profile.latestPatrol.updatedAt ||

                        profile.latestPatrol.endTime ||

                        profile.latestPatrol.startTime ||

                        0

                    )

                ) {

                    profile.latestPatrol =
                        patrol;

                }

                profile.analytics.patrols++;

                profile.analytics.distanceKm +=

                    Number(

                        patrol.distanceKm ||

                        patrol.distance ||

                        0

                    );

                profile.analytics.coverage +=

                    Number(

                        patrol.coverage ||

                        0

                    );

                profile.analytics.visits +=

                    Number(

                        patrol.visits ||

                        1

                    );

            }

            const compartments =

                Array.isArray(

                    patrol.compartments

                )

                ?

                patrol.compartments

                :

                (

                    patrol.compartment

                    ?

                    [

                        patrol.compartment

                    ]

                    :

                    []

                );

            compartments.forEach(name => {

                const row =

                    AnalyticsEngine.compartmentIndex[
                        String(name)
                        .trim()
                        .toUpperCase()
                        .replace(/\s+/g, "_")
                    ];

                if (

                    row

                ) {

                    row.tracks.push(
                        patrol
                    );

                }

            });

        });

        console.log(

            "✅ Patrol Tracks merged"

        );

    }

    catch (err) {

        console.error(

            "❌ mergePatrolTracks",

            err

        );

    }

};

    /*----------------------------------------------------------
    AGGREGATION
    ----------------------------------------------------------*/
    AnalyticsEngine.aggregate = function () {
        const d = AnalyticsEngine.dataset;
        const beat = {}, range = {}, division = {};
        d.forEach(row => {
            aggregateLevel(beat, row.beat, row);
            aggregateLevel(range, row.range, row);
            aggregateLevel(division, row.division, row);
        });

        const totalC = d.reduce((s, r) => s + r.coveredCells, 0);
        const totalA = d.reduce((s, r) => s + r.totalCells, 0);

        AnalyticsEngine.summary = {
            beat, range, division, generatedAt: Date.now(),
            global: AnalyticsEngine.queryStatistics(totalC, totalA)
        };
    };

    function aggregateLevel(target, key, row) {
        key = String(key || "").trim();
        if (!key) return;
        target[key] ||= { name: key, compartments: 0, visits: 0, coveredCells: 0, totalCells: 0, patrolDistanceKm: 0, assignedStaff: 0, liveStaff: 0, patrolSessions: 0, completedPatrols: 0, coverage: 0 };
        const i = target[key];
        i.compartments++; i.visits += row.visits; i.coveredCells += row.coveredCells; i.totalCells += row.totalCells; i.patrolDistanceKm += row.patrolDistanceKm;
        i.assignedStaff += row.assignedStaff.length; i.liveStaff += row.liveStaff.length; i.patrolSessions += row.tracks.length; i.completedPatrols += row.patrolHistory.length;
        i.coverage = i.totalCells > 0 ? (i.coveredCells / i.totalCells) * 100 : 0;
    }

    /*----------------------------------------------------------
    QUERY ENGINE
    ----------------------------------------------------------*/
    AnalyticsEngine.keywords = {
        mostVisited: ["most visited", "highest visit"], leastVisited: ["least visited"],
        coverage: ["highest coverage", "best coverage"], inactive: ["inactive", "no patrol", "never visited"],
        distance: ["highest distance", "farthest patrol"], staff: ["top staff", "best staff"],
        stats: ["monthly summary", "dashboard", "analytics overview", "btr statistics"]
    };

AnalyticsEngine.query = function (query) {

    const originalQuery =
        String(query || "").trim();

    const q =
        originalQuery.toLowerCase();

    /*----------------------------------------------------------
      PATROL SESSION
    ----------------------------------------------------------*/

    const sessionMatch =

        originalQuery.match(

            /[A-Z ]+_[0-9]{6,}/i

        );

    if (

        sessionMatch

    ) {

        return {

            intent: "session",

            type: "patrol",

            confidence: 1,

            data:

                AnalyticsEngine.querySession(

                    sessionMatch[0]

                )

        };

    }

   if (

    /\b(latest|last|today'?s|today)\s+patrol\b/i.test(

        originalQuery

    )

) {

    return {

        intent: "session",

        type: "patrol",

        confidence: 1,

        data:

            AnalyticsEngine.queryLatestSession()

    };

}

       

    const patrolByName =

        originalQuery.match(

            /(show|latest|open|draw)\s+(.+?)\s+patrol/i

        );

    if (

        patrolByName

    ) {

        const action =

            patrolByName[1]
                .toLowerCase();

        const search =

            patrolByName[2];

        if (

            action === "draw"

        ) {

            return {

                intent: "drawPatrol",

                type: "patrol",

                confidence: 1,

                data:

                    AnalyticsEngine.openPatrol(

                        search

                    )

            };

        }

        return {

            intent: "session",

            type: "patrol",

            confidence: 1,

            data:

                AnalyticsEngine.querySession(

                    search

                )

        };

    }

    /*----------------------------------------------------------
      HIGHEST COVERAGE
    ----------------------------------------------------------*/

    if (

        q.includes("highest coverage") ||

        q.includes("best coverage")

    ) {

        if (

            q.includes("beat")

        ) {

            return {

                intent: "highestBeatCoverage",

                type: "analytics",

                confidence: 1,

                data:

                    AnalyticsEngine.rank(

                        Object.values(

                            AnalyticsEngine.summary.beat

                        ),

                        "coverage"

                    )[0]

            };

        }

        if (

            q.includes("range")

        ) {

            return {

                intent: "highestRangeCoverage",

                type: "analytics",

                confidence: 1,

                data:

                    AnalyticsEngine.rank(

                        Object.values(

                            AnalyticsEngine.summary.range

                        ),

                        "coverage"

                    )[0]

            };

        }

        if (

            q.includes("division")

        ) {

            return {

                intent: "highestDivisionCoverage",

                type: "analytics",

                confidence: 1,

                data:

                    AnalyticsEngine.rank(

                        Object.values(

                            AnalyticsEngine.summary.division

                        ),

                        "coverage"

                    )[0]

            };

        }

        return {

            intent: "highestCoverage",

            type: "analytics",

            confidence: 1,

            data:

                AnalyticsEngine.rank(

                    AnalyticsEngine.dataset,

                    "coverage"

                )[0]

        };

    }

    /*----------------------------------------------------------
      MOST VISITED
    ----------------------------------------------------------*/

    if (

        q.includes("most visited") ||

        q.includes("highest visit")

    ) {

        return {

            intent: "mostVisited",

            type: "analytics",

            confidence: 1,

            data:

                AnalyticsEngine.rank(

                    AnalyticsEngine.dataset,

                    "visits"

                )[0]

        };

    }

    /*----------------------------------------------------------
      NO PATROL
    ----------------------------------------------------------*/

    if (

        q.includes("no patrol") ||

        q.includes("inactive") ||

        q.includes("never visited") ||

        q.includes("unvisited")

    ) {

        return {

            intent: "inactive",

            type: "analytics",

            confidence: 1,

            data:

                AnalyticsEngine.queryInactiveCompartments()

        };

    }

    /*----------------------------------------------------------
      PATROL RANKING
    ----------------------------------------------------------*/

    if (

        q.includes("patrol ranking") ||

        q.includes("show patrol ranking")

    ) {

        return {

            intent: "patrolRanking",

            type: "analytics",

            confidence: 1,

            data:

                AnalyticsEngine.rank(

                    AnalyticsEngine.dataset,

                    "patrolDistanceKm"

                )

        };

    }

    /*----------------------------------------------------------
      BEAT RANKING
    ----------------------------------------------------------*/

    if (

        q.includes("beat ranking")

    ) {

        return {

            intent: "beatRanking",

            type: "analytics",

            confidence: 1,

            data:

                AnalyticsEngine.rank(

                    Object.values(

                        AnalyticsEngine.summary.beat

                    ),

                    "coverage"

                )

        };

    }

    /*----------------------------------------------------------
      RANGE RANKING
    ----------------------------------------------------------*/

    if (

        q.includes("range ranking")

    ) {

        return {

            intent: "rangeRanking",

            type: "analytics",

            confidence: 1,

            data:

                AnalyticsEngine.rank(

                    Object.values(

                        AnalyticsEngine.summary.range

                    ),

                    "coverage"

                )

        };

    }

    /*----------------------------------------------------------
      DIVISION RANKING
    ----------------------------------------------------------*/

    if (

        q.includes("division ranking")

    ) {

        return {

            intent: "divisionRanking",

            type: "analytics",

            confidence: 1,

            data:

                AnalyticsEngine.rank(

                    Object.values(

                        AnalyticsEngine.summary.division

                    ),

                    "coverage"

                )

        };

    }

    /*----------------------------------------------------------
      STAFF SEARCH
    ----------------------------------------------------------*/

/*----------------------------------------------------------
STAFF KNOWLEDGE
----------------------------------------------------------*/

/*----------------------------------------------------------
STAFF KNOWLEDGE
----------------------------------------------------------*/
/*----------------------------------------------------------
STAFF KNOWLEDGE
----------------------------------------------------------*/
/*----------------------------------------------------------
STAFF KNOWLEDGE
----------------------------------------------------------*/

/*----------------------------------------------------------
STAFF KNOWLEDGE + SUB INTENT
----------------------------------------------------------*/
const staffSubIntent = (function () {

    /* Contact */

    if (/\b(phone|mobile|contact|cell|tel|telephone|number|no)\b/i.test(originalQuery))
        return "staffPhone";

    if (/\b(email|mail)\b/i.test(originalQuery))
        return "staffEmail";

    /* Administrative posting */

    if (/\b(posted|posting)\b/i.test(originalQuery))
        return "staffPosting";

    if (/\bbeat\b/i.test(originalQuery))
        return "staffBeat";

    if (/\brange\b/i.test(originalQuery))
        return "staffRange";

    if (/\bdivision\b/i.test(originalQuery))
        return "staffDivision";

    if (/\bcircle\b/i.test(originalQuery))
        return "staffCircle";

    if (/\bstation\b/i.test(originalQuery))
        return "staffStation";

    /* Role */

    if (/\b(role|designation|post)\b/i.test(originalQuery))
        return "staffRole";

    /* Duty */

    if (/\bduty\b/i.test(originalQuery))
        return "staffDuty";

    /* Live GPS */

    if (/\b(location|gps|live|where now|current location)\b/i.test(originalQuery))
        return "staffLocation";

    /* Patrol */

    if (/\bpatrol\b/i.test(originalQuery))
        return "staffPatrol";

    /* Employee */

    if (/\b(employee|employee id|emp id|emp|id)\b/i.test(originalQuery))
        return "staffEmployeeId";

    return "staffProfile";

})();

/*-----------------------------------------
Try full query first
-----------------------------------------*/

let staffProfile =
    AnalyticsEngine.queryStaff(
        originalQuery
    );

/*-----------------------------------------
Extract only person's name
-----------------------------------------*/

if (!staffProfile.length) {

    const cleaned =

        originalQuery

        .replace(
            /\b(phone|mobile|contact|cell|tel|telephone|number|no|email|mail|beat|range|division|role|designation|post|profile|details|show|tell|about|who|what|which|where|is|of|the|posted|in|employee|emp|id)\b/gi,
            " "
        )

        .replace(/\s+/g, " ")

        .trim();

    if (cleaned) {

        staffProfile =
            AnalyticsEngine.queryStaff(
                cleaned
            );

    }

}

if (staffProfile.length) {

    return {

        intent: staffSubIntent,

        type: "staff",

        confidence: 1,

        data: staffProfile

    };

}

    /*----------------------------------------------------------
      SEARCH INDEX
    ----------------------------------------------------------*/

    const searchKey =

        normalizeKey(

            q

        );

    const result =

        Object.entries(

            AnalyticsEngine.searchIndex

        ).find(

            ([k]) =>

                k.includes(

                    searchKey

                )

        );

    if (

        result

    ) {

        return {

            intent: "search",

            type:

                result[1].type,

            data:

                result[1].data

        };

    }

    return null;

};
/*----------------------------------------------------------
STAFF KNOWLEDGE ENGINE
----------------------------------------------------------*/

AnalyticsEngine.queryStaff = function (query) {

    query = String(query || "")
        .toUpperCase()

        .replace(
            /\b(WHO|IS|SHOW|PROFILE|DETAILS|TELL|ME|ABOUT|PHONE|PH|PHNO|MOBILE|CONTACT|CELL|TEL|TELEPHONE|NUMBER|NO|EMAIL|MAIL|BEAT|RANGE|DIVISION|ROLE|DESIGNATION|POST|STATION|CIRCLE|EMPLOYEE|EMP|ID|OF|THE|WHAT|WHICH|WHERE|POSTED|IN)\b/g,
            " "
        )

        .replace(/[^A-Z0-9 ]/g, " ")

        .replace(/\s+/g, " ")

        .trim();

    if (!query) {
        return [];
    }

    const words = query.split(" ").filter(Boolean);

    return Object.values(AnalyticsEngine.staffIndex).filter(profile => {

        const text = [
            profile.cleanName,
            profile.name,
            profile.designation,
            profile.role,
            profile.phone,
            profile.email,
            profile.beat,
            profile.range,
            profile.division,
            profile.circle,
            profile.station,
            profile.employeeId
        ]
        .filter(Boolean)
        .join(" ")
        .toUpperCase();

        return words.every(word => text.includes(word));

    });

};
/*----------------------------------------------------------
LATEST SESSION
----------------------------------------------------------*/

/*----------------------------------------------------------
LATEST SESSION
----------------------------------------------------------*/

AnalyticsEngine.queryLatestSession = function () {

    const sessions =

        Object.values(

            AnalyticsEngine.latestSessionIndex

        );

    if (

        !sessions.length

    ) {

        return null;

    }

    sessions.sort(

        (a, b) =>

            Number(

                b.updatedAt ||

                b.endTime ||

                b.startTime ||

                0

            )

            -

            Number(

                a.updatedAt ||

                a.endTime ||

                a.startTime ||

                0

            )

    );

    return sessions[0];

};
    /*----------------------------------------------------------
DRAW PATROL TRACK
----------------------------------------------------------*/

AnalyticsEngine.drawPatrolTrack = function(session){

    if(

        !session

    ){

        return {

            success:false,

            error:"Patrol session not found."

        };

    }

    if(

        typeof window.drawPatrolTrack === "function"

    ){

        window.drawPatrolTrack(

            session

        );

    }

    return {

        success:true,

        action:"drawPatrolTrack",

        sessionId:

            session.sessionId,

        session

    };

};

/*----------------------------------------------------------
OPEN PATROL
----------------------------------------------------------*/

/*----------------------------------------------------------
OPEN PATROL
----------------------------------------------------------*/

AnalyticsEngine.openPatrol = function (search) {

    const session =

        AnalyticsEngine.querySession(

            search

        );

    if (

        !session

    ) {

        return {

            success: false,

            error: "Patrol session not found."

        };

    }

    return AnalyticsEngine.drawPatrolTrack(

        session

    );

};
    AnalyticsEngine.queryTopStaff = () => {
        const staff = {};
        AnalyticsEngine.dataset.forEach(row => {
            row.tracks.forEach(t => {
                if(!t.cleanName) return;
                const item = staff[t.cleanName] ||= { name: t.cleanName, patrols: 0, distanceKm: 0 };
                item.patrols++;
                item.distanceKm += Number(t.distanceKm || 0);
            });
        });
        return AnalyticsEngine.rank(Object.values(staff), "distanceKm");
    };

    AnalyticsEngine.queryStatistics = (totalCovered, totalCells) => {
        const d = AnalyticsEngine.dataset;
        return {
            compartments: d.length, visited: d.filter(r => r.visits > 0).length, inactive: d.filter(r => r.visits === 0).length,
            totalVisits: d.reduce((a, b) => a + b.visits, 0), totalDistanceKm: d.reduce((a, b) => a + b.patrolDistanceKm, 0),
            liveStaff: d.reduce((a, b) => a + b.liveStaff.length, 0), assignedStaff: d.reduce((a, b) => a + b.assignedStaff.length, 0),
            completedPatrols: d.reduce((a, b) => a + b.patrolHistory.length, 0), activePatrols: d.reduce((a, b) => a + b.tracks.length, 0),
            coveragePercent: totalCells > 0 ? (totalCovered / totalCells) * 100 : 0
        };
    };

    AnalyticsEngine.refresh = async () => { AnalyticsEngine.clear(); return await AnalyticsEngine.load(); };
    window.GreenGuardAI.AnalyticsEngine = AnalyticsEngine;
})(window);
