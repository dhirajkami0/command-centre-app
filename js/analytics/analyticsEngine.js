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
    AnalyticsEngine.loaded = false;
    AnalyticsEngine.loading = false;
    AnalyticsEngine.lastLoaded = 0;
    AnalyticsEngine.version = "1.0.0";

    AnalyticsEngine.clear = function () {
        AnalyticsEngine.dataset = [];
        AnalyticsEngine.datasetMap = {};
        AnalyticsEngine.beatIndex = {};
        AnalyticsEngine.rangeIndex = {};
        AnalyticsEngine.divisionIndex = {};
        AnalyticsEngine.staffIndex = {};
        AnalyticsEngine.loaded = false;
        AnalyticsEngine.lastLoaded = 0;
        window.analyticsDataset = [];
    };

    AnalyticsEngine.getDataset = function () {
        return AnalyticsEngine.dataset;
    };

    AnalyticsEngine.isLoaded = function () {
        return AnalyticsEngine.loaded;
    };

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
    LOAD ANALYTICS DATASET
    ----------------------------------------------------------*/
    AnalyticsEngine.load = async function () {
        if (AnalyticsEngine.loading || AnalyticsEngine.loaded) {
            return AnalyticsEngine.dataset;
        }

        AnalyticsEngine.loading = true;
        try {
            console.time("AnalyticsEngine.build");
            AnalyticsEngine.dataset = await AnalyticsEngine.build();
            window.analyticsDataset = AnalyticsEngine.dataset;
            AnalyticsEngine.loaded = true;
            AnalyticsEngine.lastLoaded = Date.now();
            console.timeEnd("AnalyticsEngine.build");
            console.log("✅ Analytics Dataset Ready:", AnalyticsEngine.dataset.length, "records");
            return AnalyticsEngine.dataset;
        } finally {
            AnalyticsEngine.loading = false;
        }
    };

    /*----------------------------------------------------------
    BUILD MASTER DATASET
    ----------------------------------------------------------*/
    AnalyticsEngine.buildMaster = function () {
        console.log("📦 Building Master Dataset...");
        const dataset = [];
        const datasetMap = {};
        const masterGrid = window.masterGrid || {};
        const gridIds = Object.keys(masterGrid);

        for (const gridId of gridIds) {
            const g = masterGrid[gridId] || {};
            const row = {
                gridId,
                compartment: g.compartment || "",
                beat: g.beat || "",
                range: g.range || "",
                division: g.division || "",
                circle: g.circle || "",
                areaHa: Number(g.actualAreaHa || 0),
                totalCells: Number(g.totalCells || 0),
                coveredCells: 0,
                coverage: 0,
                visits: 0,
                patrolDistanceKm: 0,
                updatedAt: null,
                analytics: {},
                liveStaff: [],
                assignedStaff: [],
                patrolHistory: [],
                tracks: [],
                summary: {
                    patrols: 0,
                    patrolDistanceKm: 0,
                    liveStaff: 0,
                    assignedStaff: 0,
                    coveredCells: 0,
                    totalCells: 0,
                    coverage: 0
                }
            };
            dataset.push(row);
            datasetMap[gridId] = row;
        }
        return { dataset, datasetMap };
    };

    /*----------------------------------------------------------
    BUILD INDEXES
    ----------------------------------------------------------*/
    AnalyticsEngine.buildIndexes = function (dataset) {
        AnalyticsEngine.beatIndex = {};
        AnalyticsEngine.rangeIndex = {};
        AnalyticsEngine.divisionIndex = {};

        dataset.forEach(row => {
            const beat = String(row.beat || "").toUpperCase();
            const range = String(row.range || "").toUpperCase();
            const division = String(row.division || "").toUpperCase();

            if (beat) {
                (AnalyticsEngine.beatIndex[beat] ||= []).push(row);
            }
            if (range) {
                (AnalyticsEngine.rangeIndex[range] ||= []).push(row);
            }
            if (division) {
                (AnalyticsEngine.divisionIndex[division] ||= []).push(row);
            }
        });
    };

    /*----------------------------------------------------------
    BUILD DATASET (Main Orchestrator)
    ----------------------------------------------------------*/
    AnalyticsEngine.build = async function () {
        console.log("🚀 Building Analytics Dataset...");

        const { dataset, datasetMap } = AnalyticsEngine.buildMaster();
        AnalyticsEngine.datasetMap = datasetMap;

        await AnalyticsEngine.mergeAnalytics(dataset, datasetMap);

        // Build hierarchy indexes BEFORE staff merge
        AnalyticsEngine.buildIndexes(dataset);

        await AnalyticsEngine.mergeStaffProfiles(dataset, datasetMap);
        await AnalyticsEngine.mergeLiveStaff(dataset, datasetMap);
      await AnalyticsEngine.mergeHistory(

    dataset,

    datasetMap

);

        console.log("✅ Base Dataset Built:", dataset.length);
        return dataset;
    };

    /*----------------------------------------------------------
    MERGE ANALYTICS DATA (WITH BATCHING)
    ----------------------------------------------------------*/
    AnalyticsEngine.mergeAnalytics = async function (dataset, datasetMap) {
        try {
            const d = new Date();
            const monthKey = `${d.getFullYear()}_${String(d.getMonth() + 1).padStart(2, "0")}`;
            console.log("📥 Loading analytics_rebuild...");

            const gridIds = Object.keys(datasetMap);
            const BATCH = 40;

            for (let i = 0; i < gridIds.length; i += BATCH) {
                const batchIds = gridIds.slice(i, i + BATCH);
                const promises = batchIds.map(gridId =>
                    window.fb.getDoc(window.fb.doc(window.db, "analytics_rebuild", monthKey, "compartments", gridId))
                );

                const snaps = await Promise.allSettled(promises);

                snaps.forEach((result, index) => {
                    if (result.status !== "fulfilled" || !result.value.exists()) return;

                    const analytics = result.value.data() || {};
                    const gridId = batchIds[index];
                    const row = datasetMap[gridId];

                    if (!row) return;

                    row.coveredCells = Number(analytics.totalCovered || Object.keys(analytics.visitedCells || {}).length || 0);
                    row.visits = Number(analytics.visitCount || 0);
                    row.coverage = row.totalCells > 0 ? (row.coveredCells / row.totalCells) * 100 : 0;
                    row.patrolDistanceKm = Number(analytics.distanceMeters || 0) / 1000;
                    row.updatedAt = analytics.updatedAt?.toMillis?.() || (analytics.updatedAt?.seconds ? analytics.updatedAt.seconds * 1000 : 0);
                    
                    row.summary.coveredCells = row.coveredCells;
                    row.summary.totalCells = row.totalCells;
                    row.summary.coverage = row.coverage;
                    row.summary.patrols = row.visits;
                    row.summary.patrolDistanceKm = row.patrolDistanceKm;
                });
            }
            console.log("✅ analytics_rebuild merged.");
        } catch (err) {
            console.error("Analytics merge failed", err);
        }
    };

    /*----------------------------------------------------------
    MERGE STAFF PROFILES (WITH INDEXING)
    ----------------------------------------------------------*/
    AnalyticsEngine.mergeStaffProfiles = async function (dataset, datasetMap) {
        try {
            console.log("👥 Loading staff_profiles...");
            
            const beatIndex = AnalyticsEngine.beatIndex;

            const snap = await window.fb.getDocs(window.fb.collection(window.db, "staff_profiles"));

            snap.forEach(doc => {
                const staff = doc.data() || {};
                const beat = String(staff.beat || "").trim().toUpperCase();
                const rows = beatIndex[beat] || [];

                rows.forEach(row => {
                    row.summary.assignedStaff++;
                    row.assignedStaff.push({
                        name: staff.name || doc.id,
                        cleanName: staff.cleanName || "",
                        role: staff.role || "",
                        phone: staff.phone || "",
                        beat: staff.beat || "",
                        range: staff.range || "",
                        division: staff.division || ""
                    });

                    const key = String(staff.cleanName || staff.name || doc.id).trim().toUpperCase();
                    if (!AnalyticsEngine.staffIndex[key]) {
                        AnalyticsEngine.staffIndex[key] = [];
                    }
                    AnalyticsEngine.staffIndex[key].push(row);
                });
            });
            console.log("✅ staff_profiles merged.");
        } catch (err) {
            console.error("staff_profiles merge failed", err);
        }
    };

    /*----------------------------------------------------------
    MERGE LIVE STAFF
    ----------------------------------------------------------*/
    AnalyticsEngine.mergeLiveStaff = async function (dataset, datasetMap) {
        try {
            console.log("🛰 Loading live_staff...");
            const snap = await window.fb.getDocs(window.fb.collection(window.db, "live_staff"));

            snap.forEach(doc => {
                const live = doc.data() || {};
                const cleanName = String(live.cleanName || live.name || doc.id).trim().toUpperCase();

                const rows = AnalyticsEngine.staffIndex[cleanName] || [];

                rows.forEach(row => {
                    row.liveStaff.push({
                        id: doc.id,
                        cleanName,
                        rawName: live.rawName || live.name || "",
                        role: live.role || "",
                        phone: live.phone || "",
                        dutyActive: Boolean(live.dutyActive),
                        beat: live.beat || "",
                        range: live.range || "",
                        division: live.division || "",
                        compartment: live.compartment || "",
                        latitude: Number(live.lat || live.latitude || 0),
                        longitude: Number(live.lng || live.longitude || 0),
                        speed: Number(live.speed || 0),
                        heading: Number(live.heading || 0),
                        accuracy: Number(live.accuracy || 0),
                        fixTime: live.fixTime || null,
                        updatedAt: live.updatedAt || null
                    });
                    row.summary.liveStaff++;
                });
            });
            console.log("✅ live_staff merged.");
        } catch (err) {
            console.error("❌ mergeLiveStaff", err);
        }
    };
/*----------------------------------------------------------
MERGE HISTORY
----------------------------------------------------------*/

AnalyticsEngine.mergeHistory = async function (

    dataset,
    datasetMap

){

    try{

        console.log(
            "📜 Loading history..."
        );

        const snap =

            await window.fb.getDocs(

                window.fb.collection(

                    window.db,

                    "history"

                )

            );

        snap.forEach(doc=>{

            const history =
                doc.data() || {};

            const compartments =

                Array.isArray(
                    history.compartments
                )

                ?

                history.compartments

                :

                [];

            compartments.forEach(name=>{

                const compartment =

                    String(name)
                    .trim()
                    .toUpperCase();

                const row =

                    AnalyticsEngine.dataset.find(

                        r=>

                        String(
                            r.compartment
                        )
                        .trim()
                        .toUpperCase()

                        ===

                        compartment

                    );

                if(
                    !row
                ){
                    return;
                }

                row.patrolHistory.push({

                    sessionId:

                        history.sessionId ||

                        doc.id,

                    staff:

                        history.staffName ||

                        history.cleanName ||

                        history.user ||

                        "",

                    dutyType:

                        history.dutyType ||

                        "",

                    startTime:

                        history.startTime ||

                        null,

                    endTime:

                        history.endTime ||

                        null,

                    duration:

                        history.duration ||

                        0,

                    distanceMeters:

                        Number(

                            history.distanceMeters ||

                            0

                        ),

                    clipStatus:

                        history.clipStatus ||

                        "",

                    raw:

                        history

                });

            });

        });

        console.log(

            "✅ history merged."

        );

    }

    catch(err){

        console.error(

            "❌ mergeHistory",

            err

        );

    }

};
    /*----------------------------------------------------------
    REFRESH
    ----------------------------------------------------------*/
    AnalyticsEngine.refresh = async function () {
        AnalyticsEngine.clear();
        return await AnalyticsEngine.load();
    };

    window.GreenGuardAI.AnalyticsEngine = AnalyticsEngine;
})(window);
