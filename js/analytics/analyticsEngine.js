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
        if (AnalyticsEngine.loading || AnalyticsEngine.loaded) return AnalyticsEngine.dataset;
        AnalyticsEngine.loading = true;
        try {
            console.time("AnalyticsEngine.build");
            AnalyticsEngine.dataset = await AnalyticsEngine.build();
            window.analyticsDataset = AnalyticsEngine.dataset;
            AnalyticsEngine.loaded = true;
            AnalyticsEngine.lastLoaded = Date.now();
            console.timeEnd("AnalyticsEngine.build");
            return AnalyticsEngine.dataset;
        } finally { AnalyticsEngine.loading = false; }
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

    AnalyticsEngine.mergeStaffProfiles = async function (dataset, datasetMap) {
        try {
            AnalyticsEngine.staffIndex = {};
            const snap = await window.fb.getDocs(window.fb.collection(window.db, "staff_profiles"));
            snap.forEach(doc => {
                const staff = doc.data() || {};
                (AnalyticsEngine.beatIndex[String(staff.beat || "").trim().toUpperCase()] || []).forEach(row => {
                    row.summary.assignedStaff++;
                    row.assignedStaff.push({ name: staff.name || doc.id, role: staff.role || "", phone: staff.phone || "" });
                    (AnalyticsEngine.staffIndex[String(staff.cleanName || staff.name || doc.id).trim().toUpperCase()] ||= []).push(row);
                });
            });
        } catch (err) { console.error("staff_profiles merge failed", err); }
    };

    AnalyticsEngine.mergeLiveStaff = async function (dataset, datasetMap) {
        try {
            const snap = await window.fb.getDocs(window.fb.collection(window.db, "live_staff"));
            snap.forEach(doc => {
                const live = doc.data() || {};
                (AnalyticsEngine.staffIndex[String(live.cleanName || live.name || doc.id).trim().toUpperCase()] || []).forEach(row => {
                    row.liveStaff.push(live);
                    row.summary.liveStaff++;
                });
            });
        } catch (err) { console.error("❌ mergeLiveStaff", err); }
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

    AnalyticsEngine.mergePatrolTracks = async function (dataset, datasetMap) {
        try {
            const snap = await window.fb.getDocs(window.fb.collection(window.db, "patrol_tracks"));
            snap.forEach(doc => {
                const t = doc.data() || {};
                if (t.sessionId) {
                    AnalyticsEngine.sessionIndex[t.sessionId] = t;
                    
                    // Improvement 4: Build latest session index
                    const key = String(t.cleanName || t.name || "").toUpperCase();
                    if (key) {
                        const old = AnalyticsEngine.latestSessionIndex[key];
                        if (!old || Number(t.updatedAt || 0) > Number(old.updatedAt || 0)) {
                            AnalyticsEngine.latestSessionIndex[key] = t;
                        }
                    }
                }
                const comps = Array.isArray(t.compartments) ? t.compartments : (t.compartment ? [t.compartment] : []);
                comps.forEach(name => {
                    const row = AnalyticsEngine.compartmentIndex[String(name).trim().toUpperCase().replace(/\s+/g, "_")];
                    if (row) row.tracks.push(t);
                });
            });
        } catch (err) { console.error("❌ mergePatrolTracks", err); }
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

    if (

        q.includes("who") ||

        q.includes("where is") ||

        q.includes("staff")

    ) {

        return {

            intent: "staffSearch",

            type: "analytics",

            confidence: 1,

            data:

                AnalyticsEngine.queryStaff(

                    q.replace(

                        /who|where is|staff/g,

                        ""

                    ).trim()

                )

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
    AnalyticsEngine.queryStaff = (name) => {
        name = name.toUpperCase();
        return Object.entries(AnalyticsEngine.staffIndex).filter(([k]) => k.includes(name)).flatMap(([, r]) => r);
    };

    // Bug 2 Fix: Support both exact ID and search by name
AnalyticsEngine.querySession = function (search) {

    search = String(
        search || ""
    )
    .trim()
    .toUpperCase();

    if (
        !search
    ) {
        return null;
    }

    if (

        AnalyticsEngine.sessionIndex[search]

    ){

        return AnalyticsEngine.sessionIndex[
            search
        ];

    }

    const sessions =

        Object.values(

            AnalyticsEngine.sessionIndex

        );

    const matches =

        sessions.filter(

            s =>

                String(

                    s.sessionId ||

                    ""

                )
                .toUpperCase()
                .includes(search)

                ||

                String(

                    s.cleanName ||

                    s.staff ||

                    s.name ||

                    ""

                )
                .toUpperCase()
                .includes(search)

        );

    if(

        !matches.length

    ){

        return null;

    }

    matches.sort(

        (a,b)=>

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

    return matches[0];

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
