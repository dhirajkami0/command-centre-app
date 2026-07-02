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
/*----------------------------------------------------------
GIS RESOLVER ENGINE
----------------------------------------------------------*/

AnalyticsEngine.gisHierarchy = {

    circles : {},

    divisions : {},

    ranges : {},

    beats : {},

    compartments : {}

};

AnalyticsEngine.gisSearchIndex = {};    AnalyticsEngine.clear = function () {
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
BUILD GIS HIERARCHY
----------------------------------------------------------*/

AnalyticsEngine.buildGISHierarchy = function(){

    AnalyticsEngine.gisHierarchy = {

        circles : {},

        divisions : {},

        ranges : {},

        beats : {},

        compartments : {}

    };

    AnalyticsEngine.gisSearchIndex = {};

    const features =
        window.allGISFeatures ||

        window.allCompartmentFeatures ||

        [];

    features.forEach(function(feature){

        const p =
            feature.properties || {};

        const circle =
            String(
                p.circle ||
                p.Circle ||
                "BTR"
            ).trim();

        const division =
            String(
                p.division ||
                p.Division ||
                ""
            ).trim();

        const range =
            String(
                p.range ||
                p.Range ||
                ""
            ).trim();

        const beat =
            String(
                p.beat ||
                p.Beat ||
                ""
            ).trim();

        const compartment =
            String(

                p.compartment ||

                p.Compartment ||

                ""

            ).trim();

        if(circle){

            AnalyticsEngine.gisHierarchy
                .circles[circle] = {

                name : circle

            };

        }

        if(division){

            AnalyticsEngine.gisHierarchy
                .divisions[division] = {

                name :

                    division,

                circle :

                    circle

            };

        }

        if(range){

            AnalyticsEngine.gisHierarchy
                .ranges[range] = {

                name :

                    range,

                division :

                    division,

                circle :

                    circle

            };

        }

        if(beat){

            AnalyticsEngine.gisHierarchy
                .beats[beat] = {

                name :

                    beat,

                range :

                    range,

                division :

                    division,

                circle :

                    circle

            };

        }

        if(compartment){

            AnalyticsEngine.gisHierarchy
                .compartments[compartment] = {

                name :

                    compartment,

                beat :

                    beat,

                range :

                    range,

                division :

                    division,

                circle :

                    circle

            };

        }

    });

    console.log(

        "✅ GIS Hierarchy Built",

        {

            circles :

                Object.keys(

                    AnalyticsEngine.gisHierarchy.circles

                ).length,

            divisions :

                Object.keys(

                    AnalyticsEngine.gisHierarchy.divisions

                ).length,

            ranges :

                Object.keys(

                    AnalyticsEngine.gisHierarchy.ranges

                ).length,

            beats :

                Object.keys(

                    AnalyticsEngine.gisHierarchy.beats

                ).length,

            compartments :

                Object.keys(

                    AnalyticsEngine.gisHierarchy.compartments

                ).length

        }

    );

};
    /*----------------------------------------------------------
NORMALIZE GIS KEY
----------------------------------------------------------*/

AnalyticsEngine.normalizeGISKey = function(value){

    value =
        String(value || "")
        .trim()

        /* Split CamelCase */

        .replace(
            /([a-z])([A-Z])/g,
            "$1 $2"
        )

        /* Hyphen */

        .replace(
            /[-_]/g,
            " "
        )

        /* Upper */

        .toUpperCase()

        /* Remove punctuation */

        .replace(
            /[^A-Z0-9 ]/g,
            " "
        )

        /* Remove suffixes */

        .replace(
            /\b(BEAT|RANGE|DIVISION|CIRCLE|COMPARTMENT)\b/g,
            " "
        )

        /* Collapse */

        .replace(
            /\s+/g,
            " "
        )

        .trim();

    return value;

};
    /*----------------------------------------------------------
CREATE SEARCH KEYS
----------------------------------------------------------*/

AnalyticsEngine.createGISKeys = function(value){

    const keys =
        new Set();

    const canonical =

        AnalyticsEngine.normalizeGISKey(
            value
        );

    if(!canonical){

        return [];

    }

    keys.add(canonical);

    /*----------------------------------
    Reverse words
    ----------------------------------*/

    const words =
        canonical.split(" ");

    if(words.length > 1){

        keys.add(

            words
                .slice()
                .reverse()
                .join(" ")

        );

    }

    /*----------------------------------
    Remove spaces
    ----------------------------------*/

    keys.add(

        canonical.replace(
            /\s+/g,
            ""
        )

    );

    /*----------------------------------
    Hyphen
    ----------------------------------*/

    keys.add(

        canonical.replace(
            /\s+/g,
            "-"
        )

    );

    return Array.from(keys);

};

    /*----------------------------------------------------------
BUILD GIS SEARCH INDEX
----------------------------------------------------------*/

AnalyticsEngine.buildGISSearchIndex = function(){

    AnalyticsEngine.gisSearchIndex = {};

    [

        "circles",

        "divisions",

        "ranges",

        "beats",

        "compartments"

    ]

    .forEach(function(level){

        Object.values(

            AnalyticsEngine.gisHierarchy[level]

        )

        .forEach(function(item){

            AnalyticsEngine

                .createGISKeys(

                    item.name

                )

                .forEach(function(key){

                    AnalyticsEngine
                        .gisSearchIndex[key] = {

                        level :

                            level,

                        value :

                            item.name,

                        data :

                            item

                    };

                });

        });

    });

    console.log(

        "✅ GIS Search Index",

        Object.keys(

            AnalyticsEngine.gisSearchIndex

        ).length

    );

};

    
    /*----------------------------------------------------------
RESOLVE JURISDICTION
----------------------------------------------------------*/

/*----------------------------------------------------------
ENRICH STAFF PROFILE FROM GIS
----------------------------------------------------------*/

AnalyticsEngine.enrichStaffProfile = function(profile){

    if(!profile){

        return profile;

    }

    /*----------------------------------
    Already complete
    ----------------------------------*/

    if(

        profile.circle &&

        profile.division &&

        profile.range &&

        profile.beat

    ){

        return profile;

    }

    let gis = null;

    /*----------------------------------
    Try Beat
    ----------------------------------*/

    if(

        profile.beat &&

        AnalyticsEngine.gisHierarchy.beats[
            profile.beat
        ]

    ){

        gis =

            AnalyticsEngine
                .gisHierarchy
                .beats[
                    profile.beat
                ];

    }

    /*----------------------------------
    Try Compartment
    ----------------------------------*/

    if(

        !gis &&

        profile.compartment &&

        AnalyticsEngine
            .gisHierarchy
            .compartments[
                profile.compartment
            ]

    ){

        gis =

            AnalyticsEngine
                .gisHierarchy
                .compartments[
                    profile.compartment
                ];

    }

    if(!gis){

        return profile;

    }

    profile.circle =

        profile.circle ||

        gis.circle ||

        "";

    profile.division =

        profile.division ||

        gis.division ||

        "";

    profile.range =

        profile.range ||

        gis.range ||

        "";

    profile.beat =

        profile.beat ||

        gis.beat ||

        "";

    return profile;

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
/*----------------------------------------------------------
LOAD ANALYTICS DATASET
----------------------------------------------------------*/

AnalyticsEngine.load = async function () {

    /*----------------------------------
      Already Loaded
    ----------------------------------*/

    if (AnalyticsEngine.loaded) {

        return AnalyticsEngine.dataset;

    }

    /*----------------------------------
      Another Build Running
    ----------------------------------*/

    if (AnalyticsEngine.loading) {

        while (AnalyticsEngine.loading) {

            await new Promise(resolve =>
                setTimeout(resolve, 100)
            );

        }

        return AnalyticsEngine.dataset;

    }

    /*----------------------------------
      Start Loading
    ----------------------------------*/

    AnalyticsEngine.loading = true;

    try {

        /*----------------------------------
          Reset Indexes
        ----------------------------------*/

        AnalyticsEngine.dataset = [];

        AnalyticsEngine.datasetMap = {};

        AnalyticsEngine.sessionIndex = {};

        AnalyticsEngine.latestSessionIndex = {};

        AnalyticsEngine.staffIndex = {};

        AnalyticsEngine.staffSearchIndex = {};

        AnalyticsEngine.searchIndex = {};

        AnalyticsEngine.compartmentIndex = {};

        AnalyticsEngine.beatIndex = {};

        AnalyticsEngine.rangeIndex = {};

        AnalyticsEngine.divisionIndex = {};

        AnalyticsEngine.gisHierarchy = {};

        AnalyticsEngine.gisSearchIndex = {};

        console.time(
            "AnalyticsEngine.build"
        );

        /*----------------------------------
          Build Analytics
        ----------------------------------*/

        AnalyticsEngine.dataset =
            await AnalyticsEngine.build();

        window.analyticsDataset =
            AnalyticsEngine.dataset;

        /*----------------------------------
          Build Complete
        ----------------------------------*/

        AnalyticsEngine.loaded = true;

        AnalyticsEngine.lastLoaded =
            Date.now();

        console.timeEnd(
            "AnalyticsEngine.build"
        );

        console.log(
            "✅ Analytics Loaded"
        );

        console.log(
            "Dataset:",
            AnalyticsEngine.dataset.length
        );

        console.log(
            "Sessions:",
            Object.keys(
                AnalyticsEngine.sessionIndex
            ).length
        );

        console.log(
            "Latest Sessions:",
            Object.keys(
                AnalyticsEngine.latestSessionIndex
            ).length
        );

        console.log(
            "Staff:",
            Object.keys(
                AnalyticsEngine.staffIndex
            ).length
        );

        console.log(
            "GIS:",
            Object.keys(
                AnalyticsEngine.gisSearchIndex
            ).length
        );

        return AnalyticsEngine.dataset;

    }

    catch (err) {

        AnalyticsEngine.loaded = false;

        console.error(
            "❌ AnalyticsEngine.load",
            err
        );

        throw err;

    }

    finally {

        AnalyticsEngine.loading = false;

    }

};    AnalyticsEngine.buildMaster = function () {
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

    const {
        dataset,
        datasetMap
    } = AnalyticsEngine.buildMaster();

    AnalyticsEngine.datasetMap =
        datasetMap;

    AnalyticsEngine.buildBaseIndexes(
        dataset
    );

    AnalyticsEngine.buildGISHierarchy();

    AnalyticsEngine.buildGISSearchIndex();

    await AnalyticsEngine.mergeAnalytics(
        dataset,
        datasetMap
    );

    await AnalyticsEngine.mergeStaffProfiles(
        dataset,
        datasetMap
    );

    await AnalyticsEngine.mergeLiveStaff(
        dataset,
        datasetMap
    );

    await AnalyticsEngine.mergeHistory(
        dataset,
        datasetMap
    );

    await AnalyticsEngine.mergePatrolTracks(
        dataset,
        datasetMap
    );

    AnalyticsEngine.buildSearchIndexes();

    AnalyticsEngine.dataset =
        dataset;

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
AnalyticsEngine.enrichStaffProfile(
    profile
);
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

// ======================================
// KEEP RAW LIVE OBJECT
// ======================================

profile.live = live;

// ======================================
// MERGE LIVE STAFF INTO PROFILE
// ======================================

Object.assign(profile, {

    dutyActive:
        !!live.dutyActive,

    dutyType:
        live.dutyType || "",

    status:
        live.status || "",

    lat:
        Number(
            live.lat ??
            live.latitude ??
            0
        ),

    lon:
        Number(
            live.lon ??
            live.lng ??
            live.longitude ??
            0
        ),

    location:
        live.location || "",

    speed:
        Number(
            live.speed || 0
        ),

    heading:
        Number(
            live.heading || 0
        ),

    accuracy:
        Number(
            live.accuracy || 0
        ),

    battery:
        live.battery ?? "",

    sessionId:
        live.sessionId || "",

    source:
        live.source || "",

    team:
        live.team || "",

    leader:
        live.leader || "",

    compartment:
        live.compartment || "",

    lastSeen:
        Number(
            live.lastSeen || 0
        ),

    updatedAt:

        live.updatedAt ||

        live.timestamp ||

        live.lastUpdate ||

        0

});
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

               profile.patrols.push(patrol);

const patrolTime = Number(
    patrol.updatedAt ??
    patrol.startedAt ??
    patrol.createdAt ??
    0
);

const latestTime = Number(
    profile.latestPatrol?.updatedAt ??
    profile.latestPatrol?.startedAt ??
    profile.latestPatrol?.createdAt ??
    0
);

if (

    !profile.latestPatrol ||

    patrolTime > latestTime

){

profile.latestPatrol = patrol;

Object.assign(profile,{

    patrolSessionId :
        patrol.sessionId || "",

    patrolStatus :
        patrol.status || "",

    patrolDutyActive :
        !!patrol.dutyActive,

    patrolDutyType :
        patrol.dutyType || "",

    patrolStartedAt :
        patrol.startedAt || null,

    patrolEndedAt :
        patrol.endedAt || null,

    patrolCreatedAt :
        patrol.createdAt || null,

    patrolUpdatedAt :
        patrol.updatedAt || null,

    patrolDistanceKm :
        Number(
            patrol.distanceKm || 0
        ),

    patrolPointCount :
        Number(
            patrol.pointCount || 0
        ),

    patrolSource :
        patrol.source || "",

    patrolLeader :
        patrol.leader || "",

    patrolTeam :
        patrol.team || "",

    patrolBeat :
        patrol.beat || "",

    patrolRange :
        patrol.range || "",

    patrolDivision :
        patrol.division || "",

    patrolCompartment :
        patrol.compartment || "",

    patrolCompartments :
        patrol.compartments || [],

    patrolTrack :
        patrol.simplifiedTrack || [],

    patrolTrackPoints :
        patrol.points || []

});

AnalyticsEngine.enrichStaffProfile(
    profile
);

}

profile.analytics.patrols++;

profile.analytics.distanceKm += Number(
    patrol.distanceKm || 0
);

profile.analytics.coverage += Number(
    patrol.coverage || 0
);

profile.analytics.visits += Number(
    patrol.visits || 1
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
NEW STAFF ROUTER
----------------------------------------------------------*/




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

    /*----------------------------------------------------------
      PATROL OF SPECIFIC STAFF
    ----------------------------------------------------------*/

    const patrolByName =
        originalQuery.match(
            /\b(show|draw|open|latest|last)\b.*?\bpatrol\b(?:\s+(?:of|for))?\s+(.+)$/i
        );

    if (patrolByName) {

        const action =
            patrolByName[1]
                .toLowerCase();

        const staffName =
            patrolByName[2]
                .trim();

        const staff =
            AnalyticsEngine.queryStaff(
                staffName
            );

        if (staff.length) {

            return {

                intent:
                    action === "draw"
                        ? "drawPatrol"
                        : action === "open"
                        ? "openPatrol"
                        : "staffPatrol",

                type: "staff",

                confidence: 1,

                data: staff

            };

        }

        const session =
            AnalyticsEngine.querySession(
                staffName
            );

        if (session) {

            return {

                intent: "session",

                type: "patrol",

                confidence: 1,

                data: session

            };

        }

        return {

            intent: "staffPatrol",

            type: "staff",

            confidence: 0,

            data: []

        };

    }

    /*----------------------------------------------------------
      GENERIC LATEST PATROL
    ----------------------------------------------------------*/

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

AnalyticsEngine.queryLatestSession()        };

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
/*----------------------------------------------------------
STAFF KNOWLEDGE + SUB INTENT
----------------------------------------------------------*/



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
/*=========================================================
 BUILD INTENT
=========================================================*/
/*=========================================================
 BUILD INTENT
=========================================================*/

AnalyticsEngine.buildIntent = function (

    query

) {

    /*
        Future

        Staff
        Wildlife
        GIS
        Patrol
        Legal
        Reports
    */

    /*----------------------------------
      STAFF
    ----------------------------------*/

    const staff =

        AnalyticsEngine.buildStaffIntent(

            query

        );

    if (

        staff.confidence >= 0.80

    ) {

        return staff;

    }

    /*----------------------------------
      FUTURE DOMAINS
    ----------------------------------

    const wildlife =

        AnalyticsEngine.buildWildlifeIntent(

            query

        );

    if (

        wildlife.confidence >= 0.80

    ) {

        return wildlife;

    }

    const gis =

        AnalyticsEngine.buildGISIntent(

            query

        );

    if (

        gis.confidence >= 0.80

    ) {

        return gis;

    }

    const legal =

        AnalyticsEngine.buildLegalIntent(

            query

        );

    if (

        legal.confidence >= 0.80

    ) {

        return legal;

    }

    ----------------------------------*/

    /*----------------------------------
      DEFAULT
    ----------------------------------*/

    return staff;

};
   /*=========================================================
 ROUTE INTENT
=========================================================*/

AnalyticsEngine.routeIntent = function (

    intent

) {

    if (

        !intent ||

        typeof intent !== "object"

    ) {

        return {

            success: false,

            source: "router",

            domain: "system",

            intent: "invalid",

            confidence: 0,

            entities: {},

            data: {

                success: false,

                message: "Invalid intent."

            }

        };

    }

    switch (

        intent.domain

    ) {

        /*=================================================
          STAFF
        =================================================*/

        case "staff":

            return AnalyticsEngine.routeStaffIntent(

                intent

            );

        /*=================================================
          WILDLIFE
        =================================================*/

        case "wildlife":

            if (

                typeof AnalyticsEngine.routeWildlifeIntent ===

                "function"

            ) {

                return AnalyticsEngine.routeWildlifeIntent(

                    intent

                );

            }

            break;

        /*=================================================
          GIS
        =================================================*/

        case "gis":

            if (

                typeof AnalyticsEngine.routeGISIntent ===

                "function"

            ) {

                return AnalyticsEngine.routeGISIntent(

                    intent

                );

            }

            break;

        /*=================================================
          PATROL
        =================================================*/

        case "patrol":

            if (

                typeof AnalyticsEngine.routePatrolIntent ===

                "function"

            ) {

                return AnalyticsEngine.routePatrolIntent(

                    intent

                );

            }

            break;

        /*=================================================
          LEGAL
        =================================================*/

        case "legal":

            if (

                typeof AnalyticsEngine.routeLegalIntent ===

                "function"

            ) {

                return AnalyticsEngine.routeLegalIntent(

                    intent

                );

            }

            break;

        /*=================================================
          ANALYTICS
        =================================================*/

        case "analytics":

            if (

                typeof AnalyticsEngine.routeAnalyticsIntent ===

                "function"

            ) {

                return AnalyticsEngine.routeAnalyticsIntent(

                    intent

                );

            }

            break;

        /*=================================================
          REPORT
        =================================================*/

        case "report":

            if (

                typeof AnalyticsEngine.routeReportIntent ===

                "function"

            ) {

                return AnalyticsEngine.routeReportIntent(

                    intent

                );

            }

            break;

        /*=================================================
          GENERAL
        =================================================*/

        case "general":

            return {

                success: true,

                source:

                    intent.source ||

                    "router",

                provider:

                    intent.provider ||

                    "local",

                domain: "general",

                intent:

                    intent.intent ||

                    "general",

                confidence:

                    intent.confidence ||

                    1,

                entities:

                    intent.entities ||

                    {},

                data: {

                    success: true,

                    answer:

                        intent.answer ||

                        "I understand your question."

                }

            };

    }

    /*=====================================================
      UNKNOWN DOMAIN
    =====================================================*/

    return {

        success: false,

        source: "router",

        provider:

            intent.provider ||

            "local",

        domain:

            intent.domain ||

            "unknown",

        intent:

            intent.intent ||

            "unknown",

        confidence:

            intent.confidence ||

            0,

        entities:

            intent.entities ||

            {},

        data: {

            success: false,

            message:

                "Unknown domain: " +

                (

                    intent.domain ||

                    "unknown"

                )

        }

    };

};
/*=========================================================
 REFRESH
=========================================================*/

AnalyticsEngine.refresh = async function () {

    AnalyticsEngine.clear();

    return await AnalyticsEngine.load();

};   
    window.GreenGuardAI.AnalyticsEngine = AnalyticsEngine;
})(window);
