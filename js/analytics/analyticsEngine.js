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
AnalyticsEngine.buildGISHierarchy();
        AnalyticsEngine.buildGISSearchIndex();
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

const staffIntent =
    AnalyticsEngine.detectStaffIntent(
        originalQuery
    );

if (staffIntent !== "unknown") {

    const result =
        AnalyticsEngine.routeStaffIntent(
            originalQuery
        );

    if (
        result &&
        result.success
    ) {

        return {

            intent:
                result.intent,

            type:
                "staff",

            confidence:
                1,

            data:
                result.data

        };

    }

}
/*----------------------------------------------------------
DESIGNATION DETECTION
----------------------------------------------------------*/

const upperQuery =
    originalQuery.toUpperCase();

let requestedDesignation =
    null;

const designationAliases =
    AnalyticsEngine.designationAliases || {};

for (

    const code in designationAliases

) {

    const aliases =
        designationAliases[code];

    if (

        aliases.some(function(alias){

            alias =
                String(alias)
                .toUpperCase();

            if (

                alias.length <= 3

            ) {

                return new RegExp(

                    "\\b" +

                    alias +

                    "\\b"

                ).test(

                    upperQuery

                );

            }

            return upperQuery.includes(

                alias

            );

        })

    ) {

        requestedDesignation =
            code;

        break;

    }

}
    
const staffSubIntent = (function () {

    /* Profile */

    if (
        /\b(profile|details|information|about|who is)\b/i.test(originalQuery)
    ) {
        return "staffProfile";
    }

    /* Contact */

    if (
        /\b(phone|mobile|contact|cell|tel|telephone|number|no)\b/i.test(originalQuery)
    ) {
        return "staffPhone";
    }

    if (
        /\b(email|mail)\b/i.test(originalQuery)
    ) {
        return "staffEmail";
    }

    /* Posting */

    if (
        /\b(posting|posted|place of posting|where posted|posting details)\b/i.test(originalQuery)
    ) {
        return "staffPosting";
    }

    if (
        /\bbeat\b/i.test(originalQuery)
    ) {
        return "staffBeat";
    }

    if (
        /\brange\b/i.test(originalQuery)
    ) {
        return "staffRange";
    }

    if (
        /\bdivision\b/i.test(originalQuery)
    ) {
        return "staffDivision";
    }

    if (
        /\bcircle\b/i.test(originalQuery)
    ) {
        return "staffCircle";
    }

    if (
        /\bstation\b/i.test(originalQuery)
    ) {
        return "staffStation";
    }
/*--------------------------------------------------
DESIGNATION
--------------------------------------------------*/

if (
    /\b(designation|designation name)\b/i.test(originalQuery)
) {
    return "staffDesignation";
}

/*--------------------------------------------------
ROLE
--------------------------------------------------*/

if (
    /\b(role|user role|permission|access level)\b/i.test(originalQuery)
) {
    return "staffRole";
}

/*--------------------------------------------------
RANK / POST
--------------------------------------------------*/

if (
    /\b(rank|post)\b/i.test(originalQuery)
) {
    return "staffDesignation";
}
    /* Duty */

    if (
        /\b(duty|on duty|off duty|working|status)\b/i.test(originalQuery)
    ) {
        return "staffDuty";
    }

    /* Live Location */

    if (
        /\b(where|location|gps|coordinates|current location|live location|latitude|longitude|lat|lon|accuracy|speed|heading)\b/i.test(originalQuery)
    ) {
        return "staffLocation";
    }

     /*--------------------------------------------------
    PATROL SUB INTENTS
    --------------------------------------------------*/

    if (
        /\b(distance|covered|coverage|km|kilometre|kilometer|walked|travelled|traveled)\b/i.test(originalQuery)
    ) {
        return "patrolDistance";
    }

    if (
        /\b(duty type|patrol type|type)\b/i.test(originalQuery)
    ) {
        return "patrolDutyType";
    }

    if (
        /\b(session id|session)\b/i.test(originalQuery)
    ) {
        return "patrolSession";
    }

    if (
        /\b(point count|points|track points|gps points)\b/i.test(originalQuery)
    ) {
        return "patrolPointCount";
    }

    if (
        /\b(start|started|start time|begin|beginning)\b/i.test(originalQuery)
    ) {
        return "patrolStarted";
    }

    if (
        /\b(end|ended|finish|finished|end time|completed)\b/i.test(originalQuery)
    ) {
        return "patrolEnded";
    }

    if (
        /\b(duration|time taken|patrol duration)\b/i.test(originalQuery)
    ) {
        return "patrolDuration";
    }

    if (
        /\b(status|patrol status)\b/i.test(originalQuery)
    ) {
        return "patrolStatus";
    }

    if (
        /\b(source|device source)\b/i.test(originalQuery)
    ) {
        return "patrolSource";
    }

    if (
        /\b(team)\b/i.test(originalQuery)
    ) {
        return "patrolTeam";
    }

    if (
        /\b(leader|team leader)\b/i.test(originalQuery)
    ) {
        return "patrolLeader";
    }

    if (
        /\b(beat)\b/i.test(originalQuery)
    ) {
        return "patrolBeat";
    }

    if (
        /\b(range)\b/i.test(originalQuery)
    ) {
        return "patrolRange";
    }

    if (
        /\b(division)\b/i.test(originalQuery)
    ) {
        return "patrolDivision";
    }

    if (
        /\b(compartment|current compartment)\b/i.test(originalQuery)
    ) {
        return "patrolCompartment";
    }

    if (
        /\b(compartments|visited compartments)\b/i.test(originalQuery)
    ) {
        return "patrolCompartments";
    }

    if (
        /\b(track|route|path|trajectory|simplified track)\b/i.test(originalQuery)
    ) {
        return "patrolTrack";
    }

    if (
        /\b(latest patrol|last patrol|patrol)\b/i.test(originalQuery)
    ) {
        return "staffPatrol";
    }
    
    /* Team */

    if (
        /\b(team|leader|team leader)\b/i.test(originalQuery)
    ) {
        return "staffTeam";
    }

    /* Device */

    if (
        /\b(source|battery)\b/i.test(originalQuery)
    ) {
        return "staffDevice";
    }

    /* Employee */

    if (
        /\b(employee|employee id|emp id|emp|id)\b/i.test(originalQuery)
    ) {
        return "staffEmployeeId";
    }

    return "staffProfile";

})();

/*-----------------------------------------
Try full query first
-----------------------------------------*/

let staffProfile =
    AnalyticsEngine.queryStaff(
        originalQuery
    );
/*----------------------------------------------------------
DESIGNATION SEARCH
----------------------------------------------------------*/

if (

    requestedDesignation

) {

    const filters =

        AnalyticsEngine
            .extractJurisdictionFilters(
                originalQuery
            );

    filters.designation =
        requestedDesignation;

    if (

        /\bON\s+DUTY\b/i.test(
            originalQuery
        )

    ) {

        filters.dutyActive =
            true;

    }

    if (

        /\bOFF\s+DUTY\b/i.test(
            originalQuery
        )

    ) {

        filters.dutyActive =
            false;

    }

    return {

        intent:
            "designationSummary",

        type:
            "staff",

        confidence:
            1,

        data:
            AnalyticsEngine
                .getDesignationSummary(
                    filters
                )

    };

}
/*----------------------------------------------------------
STAFF DIRECTORY LIST
----------------------------------------------------------*/

if (/\b(all staff|staff list|list all staff|show all staff)\b/i.test(originalQuery)) {

    const filters = {};

    const text = upperQuery;

    /*----------------------------------
    Circle
    ----------------------------------*/

    Object.keys(AnalyticsEngine.gisHierarchy.circles || {}).some(function (name) {

        if (
            text.includes(name.toUpperCase()) ||
            AnalyticsEngine.normalizeGISKey(text)
                .includes(AnalyticsEngine.normalizeGISKey(name))
        ) {
            filters.circle = name;
            return true;
        }

        return false;

    });

    /*----------------------------------
    Division
    ----------------------------------*/

    Object.keys(AnalyticsEngine.divisionIndex || {}).some(function (name) {

        if (
            text.includes(name.toUpperCase()) ||
            AnalyticsEngine.normalizeGISKey(text)
                .includes(AnalyticsEngine.normalizeGISKey(name))
        ) {
            filters.division = name;
            return true;
        }

        return false;

    });

    /*----------------------------------
    Range
    ----------------------------------*/

    Object.keys(AnalyticsEngine.rangeIndex || {}).some(function (name) {

        if (
            text.includes(name.toUpperCase()) ||
            AnalyticsEngine.normalizeGISKey(text)
                .includes(AnalyticsEngine.normalizeGISKey(name))
        ) {
            filters.range = name;
            return true;
        }

        return false;

    });

    /*----------------------------------
    Beat
    ----------------------------------*/

    Object.keys(AnalyticsEngine.beatIndex || {}).some(function (name) {

        if (
            text.includes(name.toUpperCase()) ||
            AnalyticsEngine.normalizeGISKey(text)
                .includes(AnalyticsEngine.normalizeGISKey(name))
        ) {
            filters.beat = name;
            return true;
        }

        return false;

    });

    /*----------------------------------
    Designation
    ----------------------------------*/

    for (const code in AnalyticsEngine.designationAliases) {

        const aliases =
            AnalyticsEngine.designationAliases[code];

        if (
            aliases.some(function (a) {

                return text.includes(a.toUpperCase());

            })
        ) {

            filters.designation = code;

            break;

        }

    }

    /*----------------------------------
    Role
    ----------------------------------*/

    for (const role in AnalyticsEngine.roleAliases) {

        const aliases =
            AnalyticsEngine.roleAliases[role];

        if (
            aliases.some(function (a) {

                return text.includes(a.toUpperCase());

            })
        ) {

            filters.role = role;

            break;

        }

    }

    /*----------------------------------
    Duty
    ----------------------------------*/

    if (/\bON\s+DUTY\b/i.test(originalQuery)) {

        filters.dutyActive = true;

    }

    if (/\bOFF\s+DUTY\b/i.test(originalQuery)) {

        filters.dutyActive = false;

    }

    return {

        intent: "staffDirectory",

        type: "staff",

        confidence: 1,

        data: AnalyticsEngine.queryStaffDirectory(filters)

    };

}
    /*----------------------------------------------------------
STAFF STRENGTH KEYWORDS
----------------------------------------------------------*/

const strengthIntent =
    /\b(staff\s+strength|strength|manpower|workforce|employee\s+strength|designation.?wise|role.?wise|staff\s+distribution|designation\s+distribution|role\s+distribution|how\s+many|count|total)\b/i;
const listIntent =
    /\b(show|list|display|give|fetch|find|who\s+are|which)\b/i;
const summaryIntent =

    strengthIntent.test(

        originalQuery

    );

const listingIntent = false;
    
    /*----------------------------------------------------------
STAFF STRENGTH SEARCH
----------------------------------------------------------*/

if (

    !requestedDesignation &&

    (

        summaryIntent ||

        listingIntent

    )

) {

    const filters =

        AnalyticsEngine
            .extractRoleFilters(
                originalQuery
            );

    /*----------------------------------
    Designation
    ----------------------------------*/

    for (

        const code in

        AnalyticsEngine.designationAliases

    ) {

        const aliases =

            AnalyticsEngine
                .designationAliases[
                    code
                ];

        if (

            aliases.some(

                a =>

                upperQuery.includes(a)

            )

        ) {

            filters.designation =
                code;

            break;

        }

    }

    /*----------------------------------
    Active / Inactive
    ----------------------------------*/

    if (

        /\bON\s+DUTY\b/i.test(
            originalQuery
        ) ||

        /\bACTIVE\b/i.test(
            originalQuery
        )

    ) {

        filters.dutyActive =
            true;

    }

    if (

        /\bOFF\s+DUTY\b/i.test(
            originalQuery
        ) ||

        /\bINACTIVE\b/i.test(
            originalQuery
        )

    ) {

        filters.dutyActive =
            false;

    }

    /*----------------------------------
    Role Wise
    ----------------------------------*/

    if (

        /\bROLE.?WISE\b/i.test(
            originalQuery
        )

    ) {

return {

    intent:

        "roleWiseStrength",

    type:

        "staff",

    confidence:

        1,

    data:

        AnalyticsEngine
            .getRoleWiseSummary(
                filters
            )

};

    }

    /*----------------------------------
    Designation Wise
    ----------------------------------*/

    if (

        /\bDESIGNATION.?WISE\b/i.test(
            originalQuery
        )

    ) {

return {

    intent:

        "designationWiseStrength",

    type:

        "staff",

    confidence:

        1,

    data:

        AnalyticsEngine
            .getDesignationWiseSummary(
                filters
            )

};

    }

    /*----------------------------------
    Default
    ----------------------------------*/

    return {

        intent:

            "staffStrength",

        type:

            "staff",

        confidence:

            1,

        data:

            AnalyticsEngine
                .getStaffStrengthSummary(
                    filters
                )

    };

}
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
if (
    staffProfile.length &&
    staffSubIntent === "staffPatrol"
) {

    return {

        intent: "staffPatrol",

        type: "staff",

        confidence: 1,

        data: staffProfile

    };

}
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
if (
    String(profile.cleanName || "")
        .toUpperCase()
        .includes(query)
) {
    return true;
}const score =
    words.filter(
        w => text.includes(w)
    ).length;

return score >= Math.min(2, words.length);
    });

};
/*----------------------------------------------------------
LATEST SESSION
----------------------------------------------------------*/
/*----------------------------------------------------------
DESIGNATION ALIASES
----------------------------------------------------------*/

/*----------------------------------------------------------
DESIGNATION ALIASES
----------------------------------------------------------*/

/*----------------------------------------------------------
DESIGNATION ALIASES
----------------------------------------------------------*/

AnalyticsEngine.designationAliases = {

    /*----------------------------------
    FOREST RANGER
    ----------------------------------*/

    FR : [

        "FR",

        "FOREST RANGER",

        "FOREST RANGERS",

        "RANGER"

    ],

    /*----------------------------------
    DEPUTY RANGER
    ----------------------------------*/

    DR : [

        "DR",

        "DR/FR",

        "DR-FR",

        "DEPUTY RANGER",

        "DEPUTY RANGERS"

    ],

    /*----------------------------------
    FOREST GUARD
    ----------------------------------*/

    FG : [

        "FG",

        "FOREST GUARD",

        "FOREST GUARDS",

        "GUARD"

    ],

    /*----------------------------------
    BANASHRAMIK
    ----------------------------------*/

    BS : [

        "BS",

        "BANASHRAMIK",

        "BANA SHRAMIK"

    ],

    /*----------------------------------
    BANASAHAYAK
    ----------------------------------*/

    BNS : [

        "BNS",

        "BANASAHAYAK",

        "BANASAHAYK",

        "BANASAYAHAK",

        "BANASHAYAK",

        "BANA SAHAYAK",

        "BANA SAHAYK"

    ],

    /*----------------------------------
    ARANYA SATHI
    ----------------------------------*/

    AS : [

        "AS",

        "ARANYA SATHI",

        "ARANYASATHI",

        "ARANYA-SATHI"

    ],

    /*----------------------------------
    FOREST VOLUNTEER
    ----------------------------------*/

    FV : [

        "FV",

        "FOREST VOLUNTEER",

        "FOREST VOLUNTEERS",

        "VOLUNTEER"

    ],

    /*----------------------------------
    DL
    ----------------------------------*/

    DL : [

        "DL"

    ],

    /*----------------------------------
    PDL
    ----------------------------------*/

    PDL : [

        "PDL"

    ],

    /*----------------------------------
    DRIVER
    ----------------------------------*/

    DRIVER : [

        "DRIVER",

        "VEHICLE DRIVER",

        "VEHICLE DRIVERS"

    ]

};/*----------------------------------------------------------
JURISDICTION ALIASES
----------------------------------------------------------*/

AnalyticsEngine.jurisdictionAliases = {

    ranges : {

        "WEST DAMANPUR" : [

            "WEST DAMANPUR",

            "WESTDAMANPUR",

            "WEST DAMANPUR RANGE",

            "WDPO",

            "WDP"

        ],

        "EAST DAMANPUR" : [

            "EAST DAMANPUR",

            "EASTDAMANPUR",

            "EAST DAMANPUR RANGE",

            "EDPO",

            "EDP"

        ]

    },

    divisions : {

        "BTR_W" : [

            "BTR_W",

            "BTR WEST",

            "BTRWEST",

            "WEST DIVISION"

        ],

        "BTR_E" : [

            "BTR_E",

            "BTR EAST",

            "BTREAST",

            "EAST DIVISION"

        ]

    },

    circles : {

        "BTR" : [

            "BTR",

            "BUXA TIGER RESERVE",

            "BUXA"

        ]

    }

};
/*----------------------------------------------------------
NORMALIZE DESIGNATION
----------------------------------------------------------*/
/*----------------------------------------------------------
NORMALIZE DESIGNATION
----------------------------------------------------------*/

AnalyticsEngine.normalizeDesignation = function(value){

    value =
        String(value || "")
        .toUpperCase()
        .trim()
        .replace(/\./g,"")
        .replace(/\s+/g," ");

    if(!value){
        return "";
    }

    /*----------------------------------
    FR
    ----------------------------------*/

    if(
        value === "FR" ||
        value === "FOREST RANGER" ||
        value === "FOREST RANGERS"
    ){
        return "FR";
    }

    /*----------------------------------
    DR
    ----------------------------------*/

    if(
        value === "DR" ||
        value === "DR/FR" ||
        value === "DEPUTY RANGER" ||
        value === "DEPUTY RANGERS"
    ){
        return "DR";
    }

    /*----------------------------------
    FG
    ----------------------------------*/

    if(
        value === "FG" ||
        value === "FOREST GUARD" ||
        value === "FOREST GUARDS"
    ){
        return "FG";
    }

    /*----------------------------------
    BS
    ----------------------------------*/

    if(
        value === "BS" ||
        value === "BANASHRAMIK" ||
        value === "BANA SHRAMIK"
    ){
        return "BS";
    }

    /*----------------------------------
    BNS
    ----------------------------------*/

    if(
        value === "BNS" ||
        value === "BANASAHAYAK" ||
        value === "BANASAHAYK" ||
        value === "BANASAYAHAK" ||
        value === "BANASHAYAK" ||
        value === "BANA SAHAYAK" ||
        value === "BANA SAHAYK"
    ){
        return "BNS";
    }

    /*----------------------------------
    AS
    ----------------------------------*/

    if(
        value === "AS" ||
        value === "ARANYA SATHI" ||
        value === "ARANYASATHI"
    ){
        return "AS";
    }

    /*----------------------------------
    FV
    ----------------------------------*/

    if(
        value === "FV" ||
        value === "FOREST VOLUNTEER" ||
        value === "FOREST VOLUNTEERS"
    ){
        return "FV";
    }

    /*----------------------------------
    DL
    ----------------------------------*/

    if(
        value === "DL"
    ){
        return "DL";
    }

    /*----------------------------------
    PDL
    ----------------------------------*/

    if(
        value === "PDL"
    ){
        return "PDL";
    }

    /*----------------------------------
    DRIVER
    ----------------------------------*/

    if(
        value === "DRIVER" ||
        value === "VEHICLE DRIVER" ||
        value === "VEHICLE DRIVERS"
    ){
        return "DRIVER";
    }

    return value;

};
/*----------------------------------------------------------
MATCH JURISDICTION
Returns the ACTUAL stored Firestore value
----------------------------------------------------------*/

/*----------------------------------------------------------
QUERY DESIGNATION
----------------------------------------------------------*/

/*----------------------------------------------------------
QUERY DESIGNATION
----------------------------------------------------------*/

AnalyticsEngine.queryDesignation = function(filters){

    filters =
        filters || {};

    const designation =

        AnalyticsEngine
            .normalizeDesignation(

                filters.designation

            );

    return Object
        .values(

            AnalyticsEngine.staffIndex

        )
        .filter(function(p){

            /*----------------------------------
            DESIGNATION
            ----------------------------------*/

            if(

                designation &&

                AnalyticsEngine
                    .normalizeDesignation(

                        p.designation

                    ) !== designation

            ){

                return false;

            }

            /*----------------------------------
            CIRCLE
            ----------------------------------*/
const gis =

    AnalyticsEngine.resolveJurisdiction(

        JSON.stringify(filters)

    );

if(

    gis.circle &&

    p.circle !== gis.circle

){

    return false;

}

if(

    gis.division &&

    p.division !== gis.division

){

    return false;

}

if(

    gis.range &&

    p.range !== gis.range

){

    return false;

}

if(

    gis.beat &&

    p.beat !== gis.beat

){

    return false;

}

if(

    gis.compartment &&

    p.compartment !== gis.compartment

){

    return false;

}
            /*----------------------------------
            DUTY STATUS
            ----------------------------------*/

            if(

                typeof filters.dutyActive ===
                "boolean"

            ){

                if(

                    !!p.dutyActive !==
                    filters.dutyActive

                ){

                    return false;

                }

            }

            /*----------------------------------
            ROLE
            ----------------------------------*/

            if(

                filters.role &&

                String(

                    p.role || ""

                )
                .trim()
                .toUpperCase()

                !==

                String(

                    filters.role || ""

                )
                .trim()
                .toUpperCase()

            ){

                return false;

            }

            return true;

        });

};

/*----------------------------------------------------------
DESIGNATION SUMMARY
----------------------------------------------------------*/

AnalyticsEngine.getDesignationSummary = function(filters){

    const rows =

        AnalyticsEngine
        .queryDesignation(

            filters

        );

    const summary = {};

    rows.forEach(function(p){

        const d =

            AnalyticsEngine
            .normalizeDesignation(

                p.designation

            );

        summary[d] =
            (
                summary[d] || 0
            ) + 1;

    });

    return {

        total :

            rows.length,

        summary :

            summary,

        staff :

            rows

    };

};
/*----------------------------------------------------------
NORMALIZE PLACE NAME
----------------------------------------------------------*/

AnalyticsEngine.normalizePlaceName = function(value){

    return String(value || "")

        .toUpperCase()

        .replace(/[-_]/g," ")

        .replace(/\b(BEAT|RANGE|DIVISION|CIRCLE)\b/g," ")

        .replace(/\s+/g," ")

        .trim();

};


/*----------------------------------------------------------
PLACE MATCH
----------------------------------------------------------*/

AnalyticsEngine.placeMatches = function(query, place){

    const q =
        AnalyticsEngine.normalizePlaceName(query);

    const p =
        AnalyticsEngine.normalizePlaceName(place);

    if(!p){
        return false;
    }

    if(q.includes(p)){
        return true;
    }

    const qWords =
        q.split(" ").filter(Boolean);

    const pWords =
        p.split(" ").filter(Boolean);

    return pWords.every(

        word =>

            qWords.includes(word)

    );

};
/*----------------------------------------------------------
EXTRACT JURISDICTION FILTERS
----------------------------------------------------------*/
/*----------------------------------------------------------
EXTRACT JURISDICTION FILTERS
----------------------------------------------------------*/

/*----------------------------------------------------------
EXTRACT JURISDICTION FILTERS
----------------------------------------------------------*/

/*----------------------------------------------------------
QUERY STAFF STRENGTH
----------------------------------------------------------*/

/*----------------------------------------------------------
STAFF STRENGTH QUERY
----------------------------------------------------------*/

AnalyticsEngine.queryStaffStrength = function(filters){

    filters =
        filters || {};

    /*----------------------------------
    Resolve GIS hierarchy
    ----------------------------------*/

    const gis =

        AnalyticsEngine.resolveJurisdiction(

            JSON.stringify(filters)

        );

    return Object

        .values(

            AnalyticsEngine.staffIndex

        )

        .filter(function(profile){

            /*----------------------------------
            ROLE
            ----------------------------------*/

            if(

                filters.role &&

                AnalyticsEngine.normalizeRole(

                    profile.role

                ) !==

                AnalyticsEngine.normalizeRole(

                    filters.role

                )

            ){

                return false;

            }

            /*----------------------------------
            DESIGNATION
            ----------------------------------*/

            if(

                filters.designation &&

                AnalyticsEngine.normalizeDesignation(

                    profile.designation

                ) !==

                AnalyticsEngine.normalizeDesignation(

                    filters.designation

                )

            ){

                return false;

            }

            /*----------------------------------
            CIRCLE
            ----------------------------------*/

            if(

                gis.circle &&

                profile.circle !==

                gis.circle

            ){

                return false;

            }

            /*----------------------------------
            DIVISION
            ----------------------------------*/

            if(

                gis.division &&

                profile.division !==

                gis.division

            ){

                return false;

            }

            /*----------------------------------
            RANGE
            ----------------------------------*/

            if(

                gis.range &&

                profile.range !==

                gis.range

            ){

                return false;

            }

            /*----------------------------------
            BEAT
            ----------------------------------*/

            if(

                gis.beat &&

                profile.beat !==

                gis.beat

            ){

                return false;

            }

            /*----------------------------------
            COMPARTMENT
            ----------------------------------*/

            if(

                gis.compartment &&

                profile.compartment !==

                gis.compartment

            ){

                return false;

            }

            /*----------------------------------
            DUTY
            ----------------------------------*/

            if(

                typeof filters.dutyActive ===
                "boolean"

            ){

                if(

                    !!profile.dutyActive !==

                    filters.dutyActive

                ){

                    return false;

                }

            }

            return true;

        });

};
    
 /*----------------------------------------------------------
STAFF DIRECTORY
----------------------------------------------------------*/
/*----------------------------------------------------------
STAFF DIRECTORY
Purpose:
Return a filtered list of staff.

Supported Filters

{
    circle,
    division,
    range,
    beat,
    designation,
    role,
    dutyActive,
    dutyType,
    leader,
    team
}
----------------------------------------------------------*/

AnalyticsEngine.queryStaffDirectory = function (filters = {}) {

    let rows =
        Object.values(
            AnalyticsEngine.staffIndex || {}
        );

    /*----------------------------------
    Circle
    ----------------------------------*/

    if (filters.circle) {

        const value =
            String(filters.circle)
            .trim()
            .toUpperCase();

        rows =
            rows.filter(function (s) {

                return String(
                    s.circle || ""
                )
                .trim()
                .toUpperCase() === value;

            });

    }

    /*----------------------------------
    Division
    ----------------------------------*/

    if (filters.division) {

        const value =
            String(filters.division)
            .trim()
            .toUpperCase();

        rows =
            rows.filter(function (s) {

                return String(
                    s.division || ""
                )
                .trim()
                .toUpperCase() === value;

            });

    }

    /*----------------------------------
    Range
    ----------------------------------*/

    if (filters.range) {

        const value =
            String(filters.range)
            .trim()
            .toUpperCase();

        rows =
            rows.filter(function (s) {

                return String(
                    s.range || ""
                )
                .trim()
                .toUpperCase() === value;

            });

    }

    /*----------------------------------
    Beat
    ----------------------------------*/

    if (filters.beat) {

        const value =
            String(filters.beat)
            .trim()
            .toUpperCase();

        rows =
            rows.filter(function (s) {

                return String(
                    s.beat || ""
                )
                .trim()
                .toUpperCase() === value;

            });

    }

    /*----------------------------------
    Designation
    ----------------------------------*/

    if (filters.designation) {

        const value =
            AnalyticsEngine.normalizeDesignation(
                filters.designation
            );

        rows =
            rows.filter(function (s) {

                return AnalyticsEngine
                    .normalizeDesignation(

                        s.designation ||

                        s.designationCode ||

                        ""

                    ) === value;

            });

    }

    /*----------------------------------
    Role
    ----------------------------------*/

    if (filters.role) {

        const value =
            AnalyticsEngine.normalizeRole(
                filters.role
            );

        rows =
            rows.filter(function (s) {

                return AnalyticsEngine
                    .normalizeRole(

                        s.role || ""

                    ) === value;

            });

    }

    /*----------------------------------
    Duty Active
    ----------------------------------*/

    if (filters.dutyActive === true) {

        rows =
            rows.filter(function (s) {

                return !!s.dutyActive;

            });

    }

    if (filters.dutyActive === false) {

        rows =
            rows.filter(function (s) {

                return !s.dutyActive;

            });

    }

    /*----------------------------------
    Duty Type
    ----------------------------------*/

    if (filters.dutyType) {

        const value =
            String(filters.dutyType)
            .trim()
            .toUpperCase();

        rows =
            rows.filter(function (s) {

                return String(
                    s.dutyType || ""
                )
                .trim()
                .toUpperCase() === value;

            });

    }

    /*----------------------------------
    Team Leader
    ----------------------------------*/

    if (filters.leader) {

        const value =
            String(filters.leader)
            .trim()
            .toUpperCase();

        rows =
            rows.filter(function (s) {

                return String(
                    s.leader || ""
                )
                .trim()
                .toUpperCase() === value;

            });

    }

    /*----------------------------------
    Team
    ----------------------------------*/

    if (filters.team) {

        const value =
            String(filters.team)
            .trim()
            .toUpperCase();

        rows =
            rows.filter(function (s) {

                return String(
                    s.team || ""
                )
                .trim()
                .toUpperCase()
                .includes(value);

            });

    }

    /*----------------------------------
    Sort
    ----------------------------------*/

    rows.sort(function (a, b) {

        return String(
            a.name || ""
        ).localeCompare(

            String(
                b.name || ""
            )

        );

    });

    /*----------------------------------
    Result
    ----------------------------------*/

    return {

        success: true,

        total: rows.length,

        rows: rows,

        filters: filters

    };

};    /*----------------------------------------------------------
STAFF STRENGTH SUMMARY
----------------------------------------------------------*/

AnalyticsEngine.getStaffStrengthSummary = function(filters){

    const rows =

        AnalyticsEngine
            .queryStaffStrength(
                filters
            );

    const roles = {};

    const designations = {};

    rows.forEach(function(p){

        const role =

            AnalyticsEngine
                .normalizeRole(
                    p.role
                );

        roles[role] =
            (
                roles[role] || 0
            ) + 1;

        const desig =

            AnalyticsEngine
                .normalizeDesignation(
                    p.designation
                );

        designations[desig] =
            (
                designations[desig] || 0
            ) + 1;

    });

    return {

        total :
            rows.length,

        active :
            rows.filter(
                x => x.dutyActive
            ).length,

        inactive :
            rows.filter(
                x => !x.dutyActive
            ).length,

        roles :
            roles,

        designations :
            designations,

        staff :
            rows

    };

};
    /*----------------------------------------------------------
ROLE WISE SUMMARY
----------------------------------------------------------*/

AnalyticsEngine.getRoleWiseSummary = function(filters){

    filters =
        filters || {};

    const rows =
        AnalyticsEngine.queryStaffStrength(
            filters
        );

    const roles = {};

    rows.forEach(function(p){

        const role =
            AnalyticsEngine.normalizeRole(
                p.role
            );

        if(!roles[role]){

            roles[role] = {

                role : role,

                total : 0,

                active : 0,

                inactive : 0,

                staff : []

            };

        }

        roles[role].total++;

        if(p.dutyActive){

            roles[role].active++;

        }else{

            roles[role].inactive++;

        }

        roles[role].staff.push(p);

    });

    return Object
        .values(roles)
        .sort(function(a,b){

            return b.total-a.total;

        });

};


/*----------------------------------------------------------
DESIGNATION WISE SUMMARY
----------------------------------------------------------*/

AnalyticsEngine.getDesignationWiseSummary = function(filters){

    filters =
        filters || {};

    const rows =
        AnalyticsEngine.queryStaffStrength(
            filters
        );

    const designations = {};

    rows.forEach(function(p){

        const d =
            AnalyticsEngine.normalizeDesignation(
                p.designation
            );

        if(!designations[d]){

            designations[d] = {

                designation : d,

                total : 0,

                active : 0,

                inactive : 0,

                staff : []

            };

        }

        designations[d].total++;

        if(p.dutyActive){

            designations[d].active++;

        }else{

            designations[d].inactive++;

        }

        designations[d].staff.push(p);

    });

    return Object
        .values(designations)
        .sort(function(a,b){

            return b.total-a.total;

        });

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

    AnalyticsEngine.refresh = async () => { AnalyticsEngine.clear(); return await AnalyticsEngine.load(); };
    window.GreenGuardAI.AnalyticsEngine = AnalyticsEngine;
})(window);
