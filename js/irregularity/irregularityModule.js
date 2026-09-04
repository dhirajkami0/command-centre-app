/* ============================================================
   🌲 GREENGUARD
   IRREGULARITY / OFFENCE / OBSERVATION MODULE
   ============================================================

   FILE:
       js/irregularity/irregularityModule.js

   RESPONSIBILITY
   ------------------------------------------------------------
   • Collect manual form data
   • Get GPS at SAVE time only
   • Use existing window.latestGps first
   • Use navigator.geolocation only if needed
   • Use ONLY window.resolveCurrentGIS()
   • Merge automatic + manual + profile information
   • Save to Firestore
   • Generate Firestore auto-ID
   • Trigger existing Irregularity media module
   • Update the SAME Firestore document with media URLs

   NO:
   • Apps Script
   • callBackend()
   • Firebase initialization
   • second GPS system
   • second GIS resolver
   • Wildlife changes
   • Elephant changes

   ============================================================ */


/* ============================================================
   GLOBAL NAMESPACE
   ============================================================ */

window.GGIrregularity =
    window.GGIrregularity || {};


/* ============================================================
   COLLECTION
   ============================================================ */

GGIrregularity.COLLECTION =
    "irregularities";


/* ============================================================
   MODULE
   ============================================================ */

GGIrregularity.MODULE =
    "IRREGULARITY";


GGIrregularity.RECORD_TYPE =
    "IRREGULARITY_OFFENCE_OBSERVATION";


/* ============================================================
   STATUS
   ============================================================ */

GGIrregularity.STATUS = {

    ACTIVE:
        "ACTIVE",

    CLOSED:
        "CLOSED"

};


/* ============================================================
   CATEGORIES
   ============================================================ */

GGIrregularity.TYPES = {

    FELLING:
        "ILLICIT_FELLING",

    TIMBER:
        "ILLEGAL_TIMBER_FOREST_PRODUCE",

    MINING:
        "ILLEGAL_MINING_EARTH_CUTTING",

    FISHING:
        "ILLEGAL_FISHING",

    GRAZING:
        "ILLEGAL_GRAZING",

    FIRE:
        "FOREST_FIRE",

    ENCROACHMENT:
        "ENCROACHMENT",

    STRUCTURE:
        "ILLEGAL_STRUCTURE_OCCUPATION",

    POACHING:
        "POACHING",

    TRESPASSING:
        "ILLEGAL_ENTRY_TRESPASSING",

    WILDLIFE_INJURY:
        "WILDLIFE_INJURY",

    WILDLIFE_DEATH:
        "WILDLIFE_DEATH",

    OBSERVATION:
        "GENERAL_OBSERVATION"

};


/* ============================================================
   CATEGORY LABELS
   ============================================================ */

GGIrregularity.TYPE_META = {

    ILLICIT_FELLING: {
        icon: "🌳",
        title: "Illicit Felling"
    },

    ILLEGAL_TIMBER_FOREST_PRODUCE: {
        icon: "🪵",
        title: "Illegal Timber / Forest Produce"
    },

    ILLEGAL_MINING_EARTH_CUTTING: {
        icon: "🚜",
        title: "Illegal Mining / Earth Cutting"
    },

    ILLEGAL_FISHING: {
        icon: "🎣",
        title: "Illegal Fishing"
    },

    ILLEGAL_GRAZING: {
        icon: "🐄",
        title: "Illegal Grazing"
    },

    FOREST_FIRE: {
        icon: "🔥",
        title: "Forest Fire"
    },

    ENCROACHMENT: {
        icon: "🚧",
        title: "Encroachment"
    },

    ILLEGAL_STRUCTURE_OCCUPATION: {
        icon: "🏗️",
        title: "Illegal Structure / Occupation"
    },

    POACHING: {
        icon: "🏹",
        title: "Poaching"
    },

    ILLEGAL_ENTRY_TRESPASSING: {
        icon: "🚪",
        title: "Illegal Entry / Trespassing"
    },

    WILDLIFE_INJURY: {
        icon: "🐾",
        title: "Wildlife Injury"
    },

    WILDLIFE_DEATH: {
        icon: "☠️",
        title: "Wildlife Death"
    },

    GENERAL_OBSERVATION: {
        icon: "👁️",
        title: "General Observation"
    }

};


/* ============================================================
   SAFE TEXT
   ============================================================ */

GGIrregularity.text =
function(value){

    return String(
        value ?? ""
    ).trim();

};


/* ============================================================
   SAFE NUMBER
   ============================================================ */

GGIrregularity.number =
function(value){

    if(
        value === "" ||
        value === null ||
        value === undefined
    ){

        return null;

    }


    const number =
        Number(value);


    return Number.isFinite(number)
        ? number
        : null;

};


/* ============================================================
   FIREBASE READINESS
   ============================================================ */

GGIrregularity.waitForFirebase =
async function(){

    /*
     * DO NOT initialize Firebase here.
     * Reuse the existing GreenGuard Firebase system.
     */

    if(
        window.db &&
        window.fb
    ){

        return true;

    }


    if(
        typeof window.waitForFirebaseReady ===
        "function"
    ){

        await window.waitForFirebaseReady();

    }


    if(
        !window.db ||
        !window.fb
    ){

        throw new Error(
            "GreenGuard Firebase is not initialized."
        );

    }


    return true;

};


/* ============================================================
   USER PROFILE
   ============================================================ */

GGIrregularity.getUserContext =
function(){

    const profile =
        window.userProfile ||
        {};


    return {

        name:
            GGIrregularity.text(
                profile.rawName ||
                profile.cleanName ||
                profile.name
            ),

        phone:
            GGIrregularity.text(
                profile.phone
            ),

        role:
            GGIrregularity.text(
                profile.role
            ).toUpperCase(),

        designation:
            GGIrregularity.text(
                profile.designation
            ),

        division:
            GGIrregularity.text(
                profile.division
            ),

        range:
            GGIrregularity.text(
                profile.range
            ),

        beat:
            GGIrregularity.text(
                profile.beat
            ),

        circle:
            GGIrregularity.text(
                profile.circle
            ),

        sessionId:
            GGIrregularity.text(
                window.sessionId
            )

    };

};


/* ============================================================
   GPS
   ============================================================

   IMPORTANT:

   GPS is NOT collected while opening the form.

   GPS is collected only when SAVE is pressed.

   Priority:

       1. window.latestGps
       2. navigator.geolocation

   ============================================================ */

GGIrregularity.getGPS =
async function(){

    const gpsCandidates = [

        window.latestGps,

        window.latestGPS,

        window.currentGps,

        window.currentGPS,

        window.lastGps,

        window.lastGPS

    ];


    /* ========================================================
       EXISTING GPS CACHE
       ======================================================== */

    for(
        const gps of gpsCandidates
    ){

        if(
            !gps ||
            typeof gps !== "object"
        ){

            continue;

        }


        const lat =
            GGIrregularity.number(
                gps.lat ??
                gps.latitude
            );


        const lon =
            GGIrregularity.number(
                gps.lng ??
                gps.lon ??
                gps.longitude
            );


        if(
            lat !== null &&
            lon !== null &&
            lat !== 0 &&
            lon !== 0
        ){

            return {

                latitude:
                    lat,

                longitude:
                    lon,

                accuracy:
                    GGIrregularity.number(
                        gps.accuracy
                    ),

                speed:
                    GGIrregularity.number(
                        gps.speed
                    ),

                heading:
                    GGIrregularity.number(
                        gps.heading
                    ),

                timestamp:
                    gps.timestamp ||
                    Date.now()

            };

        }

    }


    /* ========================================================
       DEVICE GPS FALLBACK
       ======================================================== */

    if(
        !navigator.geolocation
    ){

        throw new Error(
            "GPS location is not available on this device."
        );

    }


    let position;


    try{

        position =
            await new Promise(
                function(
                    resolve,
                    reject
                ){

                    navigator.geolocation
                        .getCurrentPosition(

                            resolve,

                            reject,

                            {
                                enableHighAccuracy:
                                    true,

                                timeout:
                                    10000,

                                maximumAge:
                                    0
                            }

                        );

                }
            );

    }
    catch(error){

        console.warn(
            "⚠ Device GPS unavailable:",
            error
        );


        throw new Error(
            "GPS location not available."
        );

    }


    const latitude =
        GGIrregularity.number(
            position?.coords?.latitude
        );


    const longitude =
        GGIrregularity.number(
            position?.coords?.longitude
        );


    if(
        latitude === null ||
        longitude === null ||
        latitude === 0 ||
        longitude === 0
    ){

        throw new Error(
            "Invalid GPS coordinates."
        );

    }


    /* ========================================================
       UPDATE EXISTING GPS CACHE

       Do not create another GPS system.
       ======================================================== */

    window.latestGps = {

        lat:
            latitude,

        lng:
            longitude,

        accuracy:
            position.coords.accuracy,

        speed:
            position.coords.speed,

        heading:
            position.coords.heading,

        timestamp:
            Date.now()

    };


    return {

        latitude:
            latitude,

        longitude:
            longitude,

        accuracy:
            GGIrregularity.number(
                position.coords.accuracy
            ),

        speed:
            GGIrregularity.number(
                position.coords.speed
            ),

        heading:
            GGIrregularity.number(
                position.coords.heading
            ),

        timestamp:
            Date.now()

    };

};


/* ============================================================
   GIS
   ============================================================

   ONLY:

       window.resolveCurrentGIS(
           lat,
           lon
       )

   ============================================================ */

/* ============================================================
   IRREGULARITY — AUTHORITATIVE GIS RESOLVER
   ============================================================ */

GGIrregularity.resolveGIS =
function(
    lat,
    lon
){

    lat = Number(lat);
    lon = Number(lon);

    if(
        !Number.isFinite(lat) ||
        !Number.isFinite(lon)
    ){

        console.error(
            "❌ Invalid GPS for Irregularity GIS:",
            lat,
            lon
        );

        return {

            lat: lat,
            lon: lon,

            division: "",
            range: "",
            beat: "",
            compartment: "",

            village: "",
            villageCode: "",
            block: "",

            nearestPoint: "",
            distanceMeters: null,

            locationType: "GPS",
            text: "",

            compartmentResult: null,
            villageResult: null,
            nearestPointResult: null

        };

    }


    /* ========================================================
       USE THE SAME AUTHORITATIVE APPLICATION GIS RESOLVER
       ======================================================== */

    if(
        typeof window.resolveCurrentGIS !==
        "function"
    ){

        throw new Error(
            "Authoritative GIS resolver unavailable."
        );

    }


    let result;

    try{

        result =
            window.resolveCurrentGIS(
                lat,
                lon
            );

    }
    catch(error){

        console.error(
            "❌ resolveCurrentGIS failed:",
            error
        );

        throw error;

    }


    /* ========================================================
       NORMALIZE EMPTY RESULT SAFELY
       ======================================================== */

    result =
        result ||
        {};


    /* ========================================================
       IMPORTANT:
       DO NOT USE Leaflet layer globals here.

       The application already has the authoritative
       compartment spatial index:

       window.findCompartmentAtPoint()
       window.compartmentSpatialIndex

       resolveCurrentGIS() remains the first authority.
       ======================================================== */

    console.log(
        "🗺 Irregularity authoritative GIS:",
        {
            lat: lat,
            lon: lon,

            division:
                result.division || "",

            range:
                result.range || "",

            beat:
                result.beat || "",

            compartment:
                result.compartment || "",

            village:
                result.village || "",

            nearestPoint:
                result.nearestPoint || "",

            distanceMeters:
                result.distanceMeters ??
                null,

            compartmentResult:
                result.compartmentResult || null
        }
    );


    return result;

};

/* ============================================================
   NORMALIZE GIS
   ============================================================ */

GGIrregularity.normalizeGIS =
function(
    gis,
    latitude,
    longitude
){

    gis =
        gis || {};


    let locationType =
        "GPS";


    if(
        gis.village
    ){

        locationType =
            "VILLAGE";

    }
    else if(
        gis.compartment
    ){

        locationType =
            "FOREST_COMPARTMENT";

    }
    else if(
        gis.nearestPoint
    ){

        locationType =
            "NEAREST_POINT";

    }


    return {

        division:
            GGIrregularity.text(
                gis.division
            ),

        range:
            GGIrregularity.text(
                gis.range
            ),

        beat:
            GGIrregularity.text(
                gis.beat
            ),

        compartment:
            GGIrregularity.text(
                gis.compartment
            ),

        village:
            GGIrregularity.text(
                gis.village
            ),

        villageCode:
            GGIrregularity.text(
                gis.villageCode
            ),

        block:
            GGIrregularity.text(
                gis.block
            ),

        nearestPoint:
            GGIrregularity.text(
                gis.nearestPoint
            ),

        distanceMeters:
            gis.distanceMeters ??
            null,

        text:
            GGIrregularity.text(
                gis.text
            ),

        locationType:
            locationType,

        gpsLocation:
            latitude +
            ", " +
            longitude

    };

};


/* ============================================================
   CATEGORY DETAILS
   ============================================================ */

GGIrregularity.buildDetails =
function(formData){

    return {

        /* ----------------------------------------------------
           FELLING
           ---------------------------------------------------- */

        felling_compartment:
            GGIrregularity.text(
                formData.felling_compartment
            ),

        number_of_felling:
            GGIrregularity.number(
                formData.number_of_felling
            ),

        species_felled:
            GGIrregularity.text(
                formData.species_felled
            ),


        /* ----------------------------------------------------
           TIMBER
           ---------------------------------------------------- */

        timber_type:
            GGIrregularity.text(
                formData.timber_type
            ),

        timber_quantity:
            GGIrregularity.text(
                formData.timber_quantity
            ),


        /* ----------------------------------------------------
           MINING
           ---------------------------------------------------- */

        mining_compartment:
            GGIrregularity.text(
                formData.mining_compartment
            ),

        mining_area:
            GGIrregularity.text(
                formData.mining_area
            ),

        mining_type:
            GGIrregularity.text(
                formData.mining_type
            ),


        /* ----------------------------------------------------
           FISHING
           ---------------------------------------------------- */

        fishing_location:
            GGIrregularity.text(
                formData.fishing_location
            ),

        fishing_method:
            GGIrregularity.text(
                formData.fishing_method
            ),


        /* ----------------------------------------------------
           GRAZING
           ---------------------------------------------------- */

        grazing_area:
            GGIrregularity.text(
                formData.grazing_area
            ),


        /* ----------------------------------------------------
           FIRE
           ---------------------------------------------------- */

        fire_area:
            GGIrregularity.text(
                formData.fire_area
            ),

        fire_affected_area:
            GGIrregularity.text(
                formData.fire_affected_area
            ),

        fire_cause:
            GGIrregularity.text(
                formData.fire_cause
            ),


        /* ----------------------------------------------------
           ENCROACHMENT
           ---------------------------------------------------- */

        encroached_compartment:
            GGIrregularity.text(
                formData.encroached_compartment
            ),

        encroached_area:
            GGIrregularity.text(
                formData.encroached_area
            ),

        encroachment_type:
            GGIrregularity.text(
                formData.encroachment_type
            ),


        /* ----------------------------------------------------
           STRUCTURE
           ---------------------------------------------------- */

        structure_type:
            GGIrregularity.text(
                formData.structure_type
            ),

        structure_description:
            GGIrregularity.text(
                formData.structure_description
            ),


        /* ----------------------------------------------------
           POACHING
           ---------------------------------------------------- */

        poaching_species:
            GGIrregularity.text(
                formData.poaching_species
            ),

        poaching_method:
            GGIrregularity.text(
                formData.poaching_method
            ),


        /* ----------------------------------------------------
           TRESPASSING
           ---------------------------------------------------- */

        trespasser_count:
            GGIrregularity.number(
                formData.trespasser_count
            ),

        trespassing_description:
            GGIrregularity.text(
                formData.trespassing_description
            ),


        /* ----------------------------------------------------
           WILDLIFE INJURY
           ---------------------------------------------------- */

        injured_species:
            GGIrregularity.text(
                formData.injured_species
            ),

        injured_age:
            GGIrregularity.text(
                formData.injured_age
            ),

        injured_sex:
            GGIrregularity.text(
                formData.injured_sex
            ),

        injury_details:
            GGIrregularity.text(
                formData.injury_details
            ),


        /* ----------------------------------------------------
           WILDLIFE DEATH
           ---------------------------------------------------- */

        dead_species:
            GGIrregularity.text(
                formData.dead_species
            ),

        dead_sex:
            GGIrregularity.text(
                formData.dead_sex
            ),

        dead_age:
            GGIrregularity.text(
                formData.dead_age
            ),

        dead_measurement:
            GGIrregularity.text(
                formData.dead_measurement
            ),


        /* ----------------------------------------------------
           GENERAL OBSERVATION
           ---------------------------------------------------- */

        observation:
            GGIrregularity.text(
                formData.observation
            ),


        /* ----------------------------------------------------
           REMARKS
           ---------------------------------------------------- */

        remarks:
            GGIrregularity.text(
                formData.remarks
            )

    };

};


/* ============================================================
   MEDIA DETECTION
   ============================================================ */

GGIrregularity.hasMedia =
function(){

    const photo =
        document.getElementById(
            "gg-irregularity-photo"
        )?.files?.[0];


    const video =
        document.getElementById(
            "gg-irregularity-video"
        )?.files?.[0];


    const audio =
        document.getElementById(
            "gg-irregularity-audio"
        )?.files?.[0];


    return !!(
        photo ||
        video ||
        audio
    );

};


/* ============================================================
   BUILD COMPLETE FIRESTORE PAYLOAD
   ============================================================ */

GGIrregularity.buildPayload =
async function(
    formData
){

    /* ========================================================
       USER
       ======================================================== */

    const user =
        GGIrregularity.getUserContext();


    /* ========================================================
       GPS

       ONLY HERE
       ======================================================== */

    const gps =
        await GGIrregularity.getGPS();


    /* ========================================================
       GIS

       ONLY HERE
       ======================================================== */

    const rawGIS =
        GGIrregularity.resolveGIS(
            gps.latitude,
            gps.longitude
        );


    const gis =
        GGIrregularity.normalizeGIS(
            rawGIS,
            gps.latitude,
            gps.longitude
        );


    /* ========================================================
       CATEGORY
       ======================================================== */

    const category =
        GGIrregularity.text(
            formData.type
        ).toUpperCase();


    if(
        !category
    ){

        throw new Error(
            "Irregularity type is required."
        );

    }


    const meta =
        GGIrregularity.TYPE_META[category];


    if(
        !meta
    ){

        throw new Error(
            "Invalid irregularity category."
        );

    }


    /* ========================================================
       MEDIA STATUS
       ======================================================== */

    const hasMedia =
        GGIrregularity.hasMedia();


    /* ========================================================
       SERVER TIMESTAMP
       ======================================================== */

    const timestamp =
        window.fb.serverTimestamp();


    /* ========================================================
       PAYLOAD
       ======================================================== */

    return {

        /* ====================================================
           IDENTIFICATION
           ==================================================== */

        module:
            GGIrregularity.MODULE,

        record_type:
            GGIrregularity.RECORD_TYPE,

        category:
            category,

        category_label:
            meta.title,

        status:
            GGIrregularity.STATUS.ACTIVE,


        /* ====================================================
           REPORTER
           ==================================================== */

        reported_by:
            user.name,

        reported_by_phone:
            user.phone,

        reported_by_role:
            user.role,

        reported_by_designation:
            user.designation,

        session_id:
            user.sessionId,


        /* ====================================================
           GIS
           ==================================================== */

        division:
            gis.division ||
            user.division ||
            "",

        range:
            gis.range ||
            user.range ||
            "",

        beat:
            gis.beat ||
            user.beat ||
            "",

        compartment:
            gis.compartment ||
            "",

        village:
            gis.village ||
            "",

        village_code:
            gis.villageCode ||
            "",

        block:
            gis.block ||
            "",

        nearest_point:
            gis.nearestPoint ||
            "",

        distance_from_nearest_point:
            gis.distanceMeters ??
            null,

        location_type:
            gis.locationType,

        location_text:
            gis.text ||
            "",


        /* ====================================================
           GPS
           ==================================================== */

        latitude:
            gps.latitude,

        longitude:
            gps.longitude,

        gps_location:
            gis.gpsLocation,

        gps_accuracy:
            gps.accuracy,

        gps_speed:
            gps.speed,

        gps_heading:
            gps.heading,

        gps_timestamp:
            gps.timestamp,


        /* ====================================================
           INCIDENT DATE / TIME
           ==================================================== */

        incident_date:
            GGIrregularity.text(
                formData.incident_date
            ),

        incident_time:
            GGIrregularity.text(
                formData.incident_time
            ),


        /* ====================================================
           MANUAL CATEGORY DETAILS
           ==================================================== */

        details:
            GGIrregularity.buildDetails(
                formData
            ),


        /* ====================================================
           MEDIA PLACEHOLDERS
           ==================================================== */

        photo_url:
            "",

        video_url:
            "",

        audio_url:
            "",

        photo_storage_path:
            "",

        video_storage_path:
            "",

        audio_storage_path:
            "",

        media_status:
            hasMedia
                ? "PENDING"
                : "NONE",


        /* ====================================================
           TIMESTAMPS
           ==================================================== */

        created_at:
            timestamp,

        updated_at:
            timestamp

    };

};


/* ============================================================
   CREATE IRREGULARITY FIRESTORE DOCUMENT

   ID DESIGN
   ------------------------------------------------------------
   1. buildPayload() already resolves:
        GIS Division → User Profile Division
        GIS Range    → User Profile Range

   2. createDocument() uses ONLY those FINAL payload values.

   3. Division + Range are mandatory for ID generation.

   4. Financial Year:
        01 April → 31 March

   5. Separate Irregularity counters:
        Division counter
        Range counter

   6. Final visible ID:

        DIVISIONCODE-RANGECODE-RANGECOUNT/DIVISIONCOUNT

      Example:

        BuxaTR_WEST-EastDamanpur-7/7

   7. Firestore document ID:

        BuxaTR_WEST-EastDamanpur-7__7

   ============================================================ */

GGIrregularity.createDocument =
async function(
    payload
){

    // ========================================================
    // 1. WAIT FOR FIREBASE
    // ========================================================

    if(
        !window.db ||
        !window.fb
    ){

        if(
            typeof waitForFirebaseReady ===
            "function"
        ){

            await waitForFirebaseReady();

        }

    }


    // ========================================================
    // 2. FINAL FIREBASE VALIDATION
    // ========================================================

    if(
        !window.db ||
        !window.fb
    ){

        throw new Error(
            "Firebase is not initialized."
        );

    }


    // ========================================================
    // 3. EXISTING FIRESTORE INSTANCE
    // ========================================================

    const db =
        window.db;


    const {
        doc,
        runTransaction,
        serverTimestamp
    } =
        window.fb;


    if(
        typeof doc !==
        "function" ||

        typeof runTransaction !==
        "function" ||

        typeof serverTimestamp !==
        "function"
    ){

        throw new Error(
            "Required Firestore modules are unavailable."
        );

    }


    // ========================================================
    // 4. VALIDATE PAYLOAD
    // ========================================================

    if(
        !payload ||
        typeof payload !==
        "object"
    ){

        throw new Error(
            "Invalid Irregularity payload."
        );

    }


    // ========================================================
    // 5. DIVISION / RANGE
    //
    // PRIORITY:
    //
    // 1. GIS resolved values already present in payload
    // 2. window.userProfile fallback
    //
    // DO NOT RUN ANOTHER GIS RESOLVER HERE.
    // ========================================================

    const userProfile =
        window.userProfile ||
        {};


    const division =
        String(

            payload.gis_division ||

            payload.division ||

            payload.divisionCode ||

            payload.division_code ||

            userProfile.division ||

            ""

        ).trim();


    const range =
        String(

            payload.gis_range ||

            payload.range ||

            payload.rangeCode ||

            payload.range_code ||

            userProfile.range ||

            ""

        ).trim();


    // ========================================================
    // 6. KEEP EXISTING BEAT / COMPARTMENT
    // ========================================================

    const beat =
        String(

            payload.gis_beat ||

            payload.beat ||

            payload.beatName ||

            payload.beat_name ||

            ""

        ).trim();


    const compartment =
        String(

            payload.gis_compartment ||

            payload.compartment ||

            payload.compartmentName ||

            payload.compartment_name ||

            ""

        ).trim();


    // ========================================================
    // 7. DIVISION / RANGE REQUIRED FOR ID
    // ========================================================

    if(
        !division ||
        !range
    ){

        throw new Error(
            "GIS division/range missing and no userProfile division/range fallback available. Cannot generate Irregularity ID."
        );

    }


    // ========================================================
    // 8. CODE VALUES
    //
    // SAME AS SIGHTING FLOW
    // ========================================================

    const divisionCode =
        division;


    const rangeCode =
        range;


    // ========================================================
    // 9. FINANCIAL YEAR
    //
    // 1 APRIL → 31 MARCH
    //
    // April 2026 → March 2027 = 2026-27
    // ========================================================

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        now.getMonth();


    const startYear =
        month >= 3
            ? year
            : year - 1;


    const endYear =
        startYear + 1;


    const financialYear =
        startYear +
        "-" +
        String(
            endYear
        ).slice(
            -2
        );


    // ========================================================
    // 10. SAFE COUNTER KEYS
    // ========================================================

    const safeFY =
        financialYear.replace(
            /[^A-Za-z0-9_-]/g,
            "_"
        );


    const safeDivision =
        divisionCode.replace(
            /[^A-Za-z0-9_-]/g,
            "_"
        );


    const safeRange =
        rangeCode.replace(
            /[^A-Za-z0-9_-]/g,
            "_"
        );


    // ========================================================
    // 11. IRREGULARITY COUNTER COLLECTION
    //
    // SEPARATE FROM ELEPHANT / WILDLIFE
    // ========================================================

    const counterCollection =
        "irregularity_counters";


    // ========================================================
    // 12. DIVISION COUNTER
    //
    // FY + DIVISION
    // ========================================================

    const divisionCounterRef =
        doc(

            db,

            counterCollection,

            safeFY +
            "__" +
            safeDivision

        );


    // ========================================================
    // 13. RANGE COUNTER
    //
    // FY + DIVISION + RANGE
    // ========================================================

    const rangeCounterRef =
        doc(

            db,

            counterCollection,

            safeFY +
            "__" +
            safeDivision +
            "__" +
            safeRange

        );


    // ========================================================
    // 14. TRANSACTION
    //
    // SAME STRUCTURE AS SIGHTING:
    //
    // READ BOTH COUNTERS
    //       ↓
    // INCREMENT BOTH
    //       ↓
    // GENERATE FINAL ID
    //       ↓
    // WRITE COUNTERS
    //       ↓
    // WRITE IRREGULARITY
    // ========================================================

    const result =
        await runTransaction(

            db,

            async function(
                transaction
            ){

                // ==================================================
                // 14A. READ DIVISION COUNTER
                // ==================================================

                const divisionSnap =
                    await transaction.get(
                        divisionCounterRef
                    );


                // ==================================================
                // 14B. READ RANGE COUNTER
                // ==================================================

                const rangeSnap =
                    await transaction.get(
                        rangeCounterRef
                    );


                // ==================================================
                // 14C. EXISTING DIVISION COUNT
                // ==================================================

                const oldDivisionCount =
                    divisionSnap.exists()

                        ? Number(
                            divisionSnap
                                .data()
                                ?.count ||
                            0
                        )

                        : 0;


                // ==================================================
                // 14D. EXISTING RANGE COUNT
                // ==================================================

                const oldRangeCount =
                    rangeSnap.exists()

                        ? Number(
                            rangeSnap
                                .data()
                                ?.count ||
                            0
                        )

                        : 0;


                // ==================================================
                // 14E. COUNTER VALIDATION
                // ==================================================

                if(
                    !Number.isFinite(
                        oldDivisionCount
                    ) ||
                    oldDivisionCount < 0
                ){

                    throw new Error(
                        "Invalid Irregularity division counter."
                    );

                }


                if(
                    !Number.isFinite(
                        oldRangeCount
                    ) ||
                    oldRangeCount < 0
                ){

                    throw new Error(
                        "Invalid Irregularity range counter."
                    );

                }


                // ==================================================
                // 14F. INCREMENT
                // ==================================================

                const divisionCount =
                    oldDivisionCount + 1;


                const rangeCount =
                    oldRangeCount + 1;


                // ==================================================
                // 14G. FINAL ID COMPONENTS
                //
                // SAME AS ELEPHANT / WILDLIFE
                // ==================================================

                const idDivision =
                    divisionCode.replace(
                        /\s+/g,
                        ""
                    );


                const idRange =
                    rangeCode.replace(
                        /\s+/g,
                        ""
                    );


                // ==================================================
                // 14H. FINAL USER-FACING IRREGULARITY ID
                //
                // SAME PATTERN AS SIGHTING
                //
                // DIVISION-RANGE-RANGECOUNT/DIVISIONCOUNT
                // ==================================================

                const finalIrregularityID =
                    idDivision +
                    "-" +
                    idRange +
                    "-" +
                    rangeCount +
                    "/" +
                    divisionCount;


                // ==================================================
                // 14I. FIRESTORE DOCUMENT ID
                //
                // "/" → "__"
                //
                // USER ID:
                //
                // BuxaTR_WEST-EastDamanpur-7/7
                //
                // FIRESTORE:
                //
                // BuxaTR_WEST-EastDamanpur-7__7
                // ==================================================

                const firestoreDocumentID =
                    finalIrregularityID.replace(
                        /\//g,
                        "__"
                    );


                // ==================================================
                // 14J. EXISTING IRREGULARITY COLLECTION
                // ==================================================

                const irregularityRef =
                    doc(

                        db,

                        GGIrregularity.COLLECTION,

                        firestoreDocumentID

                    );


                // ==================================================
                // 14K. DIVISION COUNTER WRITE
                // ==================================================

                transaction.set(

                    divisionCounterRef,

                    {

                        type:
                            "division",

                        financialYear:
                            financialYear,

                        division:
                            division,

                        divisionCode:
                            divisionCode,

                        count:
                            divisionCount,

                        updatedAt:
                            serverTimestamp()

                    },

                    {

                        merge:
                            true

                    }

                );


                // ==================================================
                // 14L. RANGE COUNTER WRITE
                // ==================================================

                transaction.set(

                    rangeCounterRef,

                    {

                        type:
                            "range",

                        financialYear:
                            financialYear,

                        division:
                            division,

                        divisionCode:
                            divisionCode,

                        range:
                            range,

                        rangeCode:
                            rangeCode,

                        count:
                            rangeCount,

                        updatedAt:
                            serverTimestamp()

                    },

                    {

                        merge:
                            true

                    }

                );


                // ==================================================
                // 14M. IRREGULARITY WRITE
                //
                // IMPORTANT:
                //
                // KEEP ...payload
                //
                // Therefore category/details/media/GPS/etc.
                // remain exactly as created by buildPayload().
                // ==================================================

                transaction.set(

                    irregularityRef,

                    {

                        ...payload,


                        // ==========================================
                        // CATEGORY REMAINS FROM PAYLOAD
                        // ==========================================

                        category:
                            payload.category,


                        category_label:
                            payload.category_label,


                        // ==========================================
                        // CANONICAL ID
                        // ==========================================

                        irregularity_id:
                            finalIrregularityID,


                        firestore_id:
                            firestoreDocumentID,


                        // ==========================================
                        // FINANCIAL YEAR
                        // ==========================================

                        financial_year:
                            financialYear,


                        // ==========================================
                        // FINAL GIS / POSTING VALUES
                        // ==========================================

                        gis_division:
                            division,


                        gis_range:
                            range,


                        gis_beat:
                            beat,


                        gis_compartment:
                            compartment,


                        // ==========================================
                        // CODE VALUES
                        // ==========================================

                        division_code:
                            divisionCode,


                        range_code:
                            rangeCode,


                        // ==========================================
                        // COUNTERS
                        // ==========================================

                        range_irregularity_no:
                            rangeCount,


                        division_irregularity_no:
                            divisionCount,


                        // ==========================================
                        // TIMESTAMPS
                        // ==========================================

                        created_at:
                            serverTimestamp(),


                        updated_at:
                            serverTimestamp()

                    }

                );


                // ==================================================
                // 14N. TRANSACTION RESULT
                // ==================================================

                return {

                    firestoreId:
                        firestoreDocumentID,

                    irregularityId:
                        finalIrregularityID,

                    financialYear:
                        financialYear,

                    division:
                        division,

                    range:
                        range,

                    beat:
                        beat,

                    compartment:
                        compartment,

                    divisionCode:
                        divisionCode,

                    rangeCode:
                        rangeCode,

                    rangeCount:
                        rangeCount,

                    divisionCount:
                        divisionCount

                };

            }

        );


    // ========================================================
    // 15. VERIFY TRANSACTION
    // ========================================================

    if(
        !result ||
        !result.irregularityId ||
        !result.firestoreId
    ){

        throw new Error(
            "Firestore transaction completed without a valid Irregularity ID."
        );

    }


    // ========================================================
    // 16. WRITE GENERATED VALUES BACK TO PAYLOAD
    // ========================================================

    payload.irregularity_id =
        result.irregularityId;


    payload.firestore_id =
        result.firestoreId;


    payload.financial_year =
        result.financialYear;


    payload.division_code =
        result.divisionCode;


    payload.range_code =
        result.rangeCode;


    payload.range_irregularity_no =
        result.rangeCount;


    payload.division_irregularity_no =
        result.divisionCount;


    // ========================================================
    // 17. SUCCESS LOG
    // ========================================================

    console.log(
        "🔥 Irregularity Firestore saved:",
        result
    );


    console.table([

        {

            irregularityId:
                result.irregularityId,

            firestoreId:
                result.firestoreId,

            financialYear:
                result.financialYear,

            division:
                result.division,

            range:
                result.range,

            rangeNo:
                result.rangeCount,

            divisionNo:
                result.divisionCount

        }

    ]);


    // ========================================================
    // 18. RETURN SAME FIRESTORE DOCUMENT
    // ========================================================

    const documentRef =
        doc(

            db,

            GGIrregularity.COLLECTION,

            result.firestoreId

        );


    return documentRef;

};


/* ============================================================
   UPLOAD MEDIA
   ============================================================ */

GGIrregularity.uploadMedia =
async function(
    documentRef,
    payload
){

    if(
        !GGIrregularity.hasMedia()
    ){

        return {

            photo_url:
                "",

            video_url:
                "",

            audio_url:
                "",

            photo_storage_path:
                "",

            video_storage_path:
                "",

            audio_storage_path:
                "",

            media_status:
                "NONE"

        };

    }


    /* ========================================================
       MEDIA MODULE REQUIRED
       ======================================================== */

    if(
        !window.GGIrregularity ||
        !GGIrregularity.Media ||
        typeof GGIrregularity.Media.upload !==
        "function"
    ){

        throw new Error(
            "irregularityMedia.js is not loaded."
        );

    }


    /* ========================================================
       UPLOAD
       ======================================================== */

    const mediaResult =
        await GGIrregularity.Media.upload(
            payload
        );


    if(
        !mediaResult
    ){

        return {

            photo_url:
                "",

            video_url:
                "",

            audio_url:
                "",

            photo_storage_path:
                "",

            video_storage_path:
                "",

            audio_storage_path:
                "",

            media_status:
                "NONE"

        };

    }


    /* ========================================================
       UPDATE SAME DOCUMENT
       ======================================================== */

    if(
        typeof GGIrregularity.Media
            .updateFirestore ===
        "function"
    ){

        await GGIrregularity.Media
            .updateFirestore(
                documentRef.id,
                mediaResult
            );

    }
    else{

        /*
         * Safety fallback if media module only uploads.
         */

        await window.fb.updateDoc(
            documentRef,
            {

                photo_url:
                    mediaResult.photo_url ||
                    "",

                video_url:
                    mediaResult.video_url ||
                    "",

                audio_url:
                    mediaResult.audio_url ||
                    "",

                photo_storage_path:
                    mediaResult.photo_storage_path ||
                    "",

                video_storage_path:
                    mediaResult.video_storage_path ||
                    "",

                audio_storage_path:
                    mediaResult.audio_storage_path ||
                    "",

                media_status:
                    mediaResult.media_status ||
                    "COMPLETE",

                updated_at:
                    window.fb.serverTimestamp()

            }
        );

    }


    return mediaResult;

};
/* ============================================================
   IRREGULARITY PENDING-WRITE QUEUE
   ============================================================

   PURPOSE
   ------------------------------------------------------------
   Online:
       Existing Firestore save flow remains unchanged.

   Offline:
       Complete payload is persisted locally.
       No Firestore transaction is attempted.

   When online:
       Pending payload is replayed through the EXISTING
       GGIrregularity.createDocument() transaction.

   IMPORTANT
   ------------------------------------------------------------
   This is a separate queue.

   It is NOT the existing:
       irregularities_operational_cache_v1

   The operational cache remains untouched.
   ============================================================ */


const GG_IRREGULARITY_PENDING_KEY =
    "irregularities_pending_writes_v1";


/* ============================================================
   GET PENDING QUEUE
   ============================================================ */

async function ggGetPendingIrregularities(){

    try{

        if(
            !window.idbKeyval ||
            typeof window.idbKeyval.get !==
                "function"
        ){

            console.warn(
                "⚠ Irregularity pending queue IDB unavailable"
            );

            return [];

        }


        if(
            window.__GG_IDB_READY__ !== true &&
            window.__GG_IDB_READY_PROMISE__
        ){

            await
                window.__GG_IDB_READY_PROMISE__;

        }


        const queue =
            await window.idbKeyval.get(
                GG_IRREGULARITY_PENDING_KEY
            );


        if(
            !Array.isArray(queue)
        ){

            return [];

        }


        return queue;

    }
    catch(err){

        console.warn(
            "⚠ Irregularity pending queue READ failed:",
            err
        );

        return [];

    }

}


/* ============================================================
   SAVE PENDING QUEUE
   ============================================================ */

async function ggSavePendingIrregularities(
    queue
){

    try{

        if(
            !window.idbKeyval ||
            typeof window.idbKeyval.set !==
                "function"
        ){

            console.warn(
                "⚠ Irregularity pending queue IDB unavailable for save"
            );

            return false;

        }


        if(
            window.__GG_IDB_READY__ !== true &&
            window.__GG_IDB_READY_PROMISE__
        ){

            await
                window.__GG_IDB_READY_PROMISE__;

        }


        await window.idbKeyval.set(

            GG_IRREGULARITY_PENDING_KEY,

            Array.isArray(queue)
                ? queue
                : []

        );


        return true;

    }
    catch(err){

        console.error(
            "❌ Irregularity pending queue SAVE failed:",
            err
        );

        return false;

    }

}


/* ============================================================
   ADD ONE PENDING IRREGULARITY
   ============================================================ */
/* ============================================================
   IRREGULARITY PENDING QUEUE — ONLINE REPLAY
   ============================================================

   PURPOSE
   ------------------------------------------------------------
   Replays irregularities captured while offline.

   QUEUE ITEM SHAPE
   ------------------------------------------------------------

   {
       queue_id,
       queued_at,
       status,
       attempts,
       last_error,
       payload,
       media
   }

   REPLAY FLOW
   ------------------------------------------------------------

   PENDING
       ↓
   createDocument(payload)
       ↓
   Firestore document created
       ↓
   uploadMedia(documentRef, payload)
       ↓
   SUCCESS
       ↓
   remove ONLY that queue item

   FAILURE
       ↓
   keep queue item
   ↓
   attempts++
   ↓
   last_error updated
   ↓
   retry later

   IMPORTANT
   ------------------------------------------------------------
   The existing createDocument() remains authoritative for
   Firestore counters and official Irregularity IDs.

   No Firestore document is created while offline.

   A queue item is removed ONLY after its complete replay
   succeeds.
   ============================================================ */


/* ============================================================
   QUEUE UPDATE HELPER
   ============================================================ */

async function ggUpdatePendingIrregularity(
    queueId,
    changes
){

    try{

        const queue =
            await ggGetPendingIrregularities();


        if(
            !Array.isArray(queue)
        ){

            return false;

        }


        const index =
            queue.findIndex(
                item =>
                    String(
                        item?.queue_id || ""
                    ) ===
                    String(
                        queueId
                    )
            );


        if(
            index < 0
        ){

            console.warn(
                "⚠ Pending Irregularity not found:",
                queueId
            );

            return false;

        }


        queue[index] = {

            ...queue[index],

            ...changes

        };


        return await ggSavePendingIrregularities(
            queue
        );

    }
    catch(
        error
    ){

        console.error(
            "❌ Could not update pending Irregularity:",
            error
        );

        return false;

    }

}


/* ============================================================
   REMOVE ONE QUEUE ITEM
   ============================================================ */

async function ggRemovePendingIrregularity(
    queueId
){

    try{

        const queue =
            await ggGetPendingIrregularities();


        if(
            !Array.isArray(queue)
        ){

            return false;

        }


        const filtered =
            queue.filter(
                item =>
                    String(
                        item?.queue_id || ""
                    ) !==
                    String(
                        queueId
                    )
            );


        if(
            filtered.length ===
            queue.length
        ){

            console.warn(
                "⚠ Pending Irregularity already absent:",
                queueId
            );

            return true;

        }


        const saved =
            await ggSavePendingIrregularities(
                filtered
            );


        if(
            saved
        ){

            console.log(
                "🗑️ PENDING IRREGULARITY REMOVED:",
                queueId
            );

        }


        return saved;

    }
    catch(
        error
    ){

        console.error(
            "❌ Could not remove pending Irregularity:",
            error
        );

        return false;

    }

}


/* ============================================================
   SINGLE PENDING IRREGULARITY REPLAY
   ============================================================ */

async function ggReplayPendingIrregularity(
    pending
){

    if(
        !pending ||
        !pending.queue_id
    ){

        throw new Error(
            "Invalid pending Irregularity queue item."
        );

    }


    const queueId =
        String(
            pending.queue_id
        );


    console.group(
        "🔄 REPLAY IRREGULARITY:",
        queueId
    );


    try{

        /* ====================================================
           NETWORK GUARD
           ==================================================== */

        if(
            navigator.onLine !== true
        ){

            throw new Error(
                "Device is offline."
            );

        }


        /* ====================================================
           FIREBASE
           ==================================================== */

        await GGIrregularity.waitForFirebase();


        /* ====================================================
           QUEUED PAYLOAD
           ==================================================== */

        const payload =
            pending.payload;


        if(
            !payload ||
            typeof payload !==
            "object"
        ){

            throw new Error(
                "Pending Irregularity payload is missing."
            );

        }


        console.log(
            "📦 REPLAY PAYLOAD:",
            payload
        );


        /* ====================================================
           MARK PROCESSING

           This prevents another replay cycle from treating
           the same item as untouched while it is executing.
           ==================================================== */

        await ggUpdatePendingIrregularity(

            queueId,

            {

                status:
                    "PROCESSING",

                attempts:
                    Number(
                        pending.attempts || 0
                    ) + 1,

                last_error:
                    ""

            }

        );


        /* ====================================================
           CREATE FIRESTORE DOCUMENT

           IMPORTANT:
           ----------------------------------------------------
           Existing authoritative transaction.

           DO NOT replace this with addDoc/setDoc.

           createDocument() remains responsible for the official
           Irregularity number/counter transaction.
           ==================================================== */

        const documentRef =
            await GGIrregularity.createDocument(
                payload
            );


        if(
            !documentRef ||
            !documentRef.id
        ){

            throw new Error(
                "Firestore document reference was not returned."
            );

        }


        console.log(
            "✅ REPLAY FIRESTORE DOCUMENT CREATED:",
            documentRef.id
        );


        /* ====================================================
           MEDIA
           ==================================================== */

        const media =
            pending.media || {

                photo:
                    null,

                video:
                    null,

                audio:
                    null

            };


        const hasQueuedMedia =
            !!(
                media.photo ||
                media.video ||
                media.audio
            );


        if(
            hasQueuedMedia
        ){

            console.log(
                "📷 REPLAY QUEUED MEDIA:",
                {

                    photo:
                        !!media.photo,

                    video:
                        !!media.video,

                    audio:
                        !!media.audio

                }
            );


            /*
             * Restore the queued media into the media module's
             * existing offline media source.
             *
             * The media module already owns the actual media
             * handling/snapshot representation.
             */

            if(
                GGIrregularity.Media &&
                typeof GGIrregularity.Media.restoreOfflineMediaSnapshot ===
                    "function"
            ){

                await GGIrregularity.Media
                    .restoreOfflineMediaSnapshot(
                        media
                    );

            }
            else{

                /*
                 * If the uploaded media module exposes its
                 * snapshot under the existing generic restore
                 * function, use that instead.
                 *
                 * We deliberately do not silently mark the
                 * queue successful if queued media cannot be
                 * restored.
                 */

                throw new Error(
                    "Irregularity offline media restore function is unavailable."
                );

            }


            /* =================================================
               UPLOAD QUEUED MEDIA
               ================================================= */

            const mediaResult =
                await GGIrregularity.uploadMedia(
                    documentRef,
                    payload
                );


            console.log(
                "✅ REPLAY MEDIA UPLOAD COMPLETE:",
                mediaResult
            );


            /* =================================================
               UPDATE FIRESTORE MEDIA FIELDS

               uploadMedia() normally performs the appropriate
               media handling. Keep the returned payload fields
               available for the final status update.
               ================================================= */

            if(
                mediaResult &&
                typeof mediaResult ===
                "object"
            ){

                const mediaUpdate = {

                    photo_url:
                        mediaResult.photo_url ||
                        "",

                    video_url:
                        mediaResult.video_url ||
                        "",

                    audio_url:
                        mediaResult.audio_url ||
                        "",

                    photo_storage_path:
                        mediaResult.photo_storage_path ||
                        "",

                    video_storage_path:
                        mediaResult.video_storage_path ||
                        "",

                    audio_storage_path:
                        mediaResult.audio_storage_path ||
                        "",

                    media_status:
                        mediaResult.media_status ||
                        "NONE",

                    updated_at:
                        window.fb.serverTimestamp()

                };


                await window.fb.updateDoc(
                    documentRef,
                    mediaUpdate
                );


                console.log(
                    "✅ REPLAY MEDIA METADATA UPDATED:",
                    documentRef.id
                );

            }

        }
        else{

            console.log(
                "ℹ️ REPLAY HAS NO MEDIA:",
                queueId
            );

        }


        /* ====================================================
           COMPLETE SUCCESS
           ====================================================

           IMPORTANT:
           Queue removal occurs LAST.

           Therefore:

               Firestore failure
                    → queue retained

               Media failure
                    → queue retained

               Metadata failure
                    → queue retained

               Everything successful
                    → queue removed
           ==================================================== */

        const removed =
            await ggRemovePendingIrregularity(
                queueId
            );


        if(
            !removed
        ){

            throw new Error(
                "Irregularity succeeded but queue cleanup failed."
            );

        }


        console.log(
            "🎉 IRREGULARITY OFFLINE REPLAY COMPLETE:",
            {

                queueId:
                    queueId,

                firestoreId:
                    documentRef.id

            }
        );


        console.groupEnd();


        return {

            success:
                true,

            queueId:
                queueId,

            firestoreId:
                documentRef.id

        };

    }
    catch(
        error
    ){

        console.error(
            "❌ IRREGULARITY REPLAY FAILED:",
            queueId,
            error
        );


        /* ====================================================
           RETAIN QUEUE ITEM
           ==================================================== */

        try{

            const latestQueue =
                await ggGetPendingIrregularities();


            const latestItem =
                latestQueue.find(
                    item =>
                        String(
                            item?.queue_id || ""
                        ) ===
                        queueId
                );


            if(
                latestItem
            ){

                await ggUpdatePendingIrregularity(

                    queueId,

                    {

                        status:
                            "PENDING",

                        last_error:
                            String(
                                error?.message ||
                                error ||
                                "Unknown replay error"
                            )

                    }

                );

            }

        }
        catch(
            queueError
        ){

            console.error(
                "❌ Could not preserve replay failure state:",
                queueError
            );

        }


        console.groupEnd();


        return {

            success:
                false,

            queueId:
                queueId,

            error:
                String(
                    error?.message ||
                    error ||
                    "Unknown replay error"
                )

        };

    }

}


/* ============================================================
   SYNC ALL PENDING IRREGULARITIES
   ============================================================ */

async function syncPendingIrregularities(){

    console.group(
        "🌐 IRREGULARITY OFFLINE → ONLINE SYNC"
    );


    try{

        /* ====================================================
           NETWORK GUARD
           ==================================================== */

        if(
            navigator.onLine !== true
        ){

            console.log(
                "📴 Device still offline — sync skipped."
            );


            console.groupEnd();


            return {

                success:
                    false,

                skipped:
                    true,

                reason:
                    "offline"

            };

        }


        /* ====================================================
           READ QUEUE
           ==================================================== */

        const queue =
            await ggGetPendingIrregularities();


        if(
            !Array.isArray(queue) ||
            queue.length === 0
        ){

            console.log(
                "📭 NO PENDING IRREGULARITIES"
            );


            console.groupEnd();


            return {

                success:
                    true,

                processed:
                    0,

                remaining:
                    0

            };

        }


        console.log(
            "📦 PENDING IRREGULARITIES:",
            queue.length
        );


        /* ====================================================
           PROCESS ONE AT A TIME
           ====================================================

           IMPORTANT:

           Do not run Promise.all() here.

           Each createDocument() uses the authoritative
           Firestore counters.

           Sequential replay avoids unnecessary contention
           between queued counter transactions.
           ==================================================== */

        let successful =
            0;

        let failed =
            0;


        for(
            const pending of queue
        ){

            if(
                navigator.onLine !== true
            ){

                console.warn(
                    "📴 Connection lost during replay — stopping."
                );

                break;

            }


            /* =================================================
               SKIP ALREADY PROCESSING ITEMS

               This protects against duplicate execution if
               another sync invocation is currently handling
               an item.
               ================================================= */

            if(
                pending?.status ===
                "PROCESSING"
            ){

                console.warn(
                    "⏭️ SKIPPING PROCESSING ITEM:",
                    pending.queue_id
                );

                continue;

            }


            const result =
                await ggReplayPendingIrregularity(
                    pending
                );


            if(
                result.success
            ){

                successful++;

            }
            else{

                failed++;

            }

        }


        /* ====================================================
           FINAL QUEUE COUNT
           ==================================================== */

        const remainingQueue =
            await ggGetPendingIrregularities();


        console.log(
            "📊 IRREGULARITY SYNC RESULT:",
            {

                queuedBefore:
                    queue.length,

                successful:
                    successful,

                failed:
                    failed,

                remaining:
                    remainingQueue.length

            }
        );


        console.groupEnd();


        return {

            success:
                failed === 0,

            processed:
                successful,

            failed:
                failed,

            remaining:
                remainingQueue.length

        };

    }
    catch(
        error
    ){

        console.error(
            "❌ IRREGULARITY OFFLINE SYNC FAILED:",
            error
        );


        console.groupEnd();


        return {

            success:
                false,

            processed:
                0,

            failed:
                1,

            error:
                String(
                    error?.message ||
                    error
                )

        };

    }

}


/* ============================================================
   EXPOSE FOR CONSOLE / ONLINE HANDLER
   ============================================================ */

window.syncPendingIrregularities =
    syncPendingIrregularities;


/* ============================================================
   AUTOMATIC ONLINE TRIGGER
   ============================================================ */

window.addEventListener(
    "online",
    function(){

        console.log(
            "🌐 ONLINE EVENT → IRREGULARITY SYNC"
        );


        setTimeout(
            function(){

                syncPendingIrregularities()
                    .catch(
                        error => {

                            console.error(
                                "❌ Automatic Irregularity sync failed:",
                                error
                            );

                        }
                    );

            },
            1000
        );

    }
);
/* ============================================================
   ADD ONE PENDING IRREGULARITY
   ============================================================

   IMPORTANT
   ------------------------------------------------------------
   The payload and media are captured AT THE MOMENT OF OFFLINE
   SUBMISSION.

   This prevents loss of File / Blob references when the form
   is subsequently cleared or closed.
   ============================================================ */


/* ============================================================
   ADD ONE PENDING IRREGULARITY
   ============================================================

   QUEUE RECORD:

       {
           queue_id,
           queued_at,
           status,
           attempts,
           last_error,

           payload: {
               ...complete irregularity payload...
           },

           media: {
               photo,
               video,
               audio
           }
       }

   IMPORTANT
   ------------------------------------------------------------
   payload and media are deliberately stored separately.

   IndexedDB can structured-clone the File / Blob objects
   supplied by getOfflineMediaSnapshot().

   This avoids:

       payload: {
           payload: {...},
           media: {...}
       }

   and makes replay deterministic.
   ============================================================ */


async function ggQueueIrregularity(
    payload,
    media = null
){

    try{

        /* ====================================================
           VALIDATE PAYLOAD
           ==================================================== */

        if(
            !payload
        ){

            throw new Error(
                "Cannot queue empty irregularity payload."
            );

        }


        /* ====================================================
           READ EXISTING QUEUE
           ==================================================== */

        const queue =
            await ggGetPendingIrregularities();


        /* ====================================================
           GENERATE LOCAL QUEUE ID
           ==================================================== */

        const queueId =
            "IRR-OFFLINE-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(
                    2,
                    8
                );


        /* ====================================================
           NORMALIZE MEDIA OBJECT
           ====================================================

           Keep only the actual offline media snapshot.

           No object URLs.
           No base64.
           No Firebase URLs.
           ==================================================== */

        const offlineMedia = {

            photo:
                media?.photo ||
                null,

            video:
                media?.video ||
                null,

            audio:
                media?.audio ||
                null

        };


        /* ====================================================
           CREATE PENDING RECORD
           ==================================================== */

        const pendingRecord = {

            queue_id:
                queueId,

            queued_at:
                Date.now(),

            status:
                "PENDING",

            attempts:
                0,

            last_error:
                "",

            payload:
                payload,

            media:
                offlineMedia

        };


        /* ====================================================
           APPEND TO QUEUE
           ==================================================== */

        queue.push(
            pendingRecord
        );


        /* ====================================================
           PERSIST QUEUE
           ==================================================== */

        const saved =
            await ggSavePendingIrregularities(
                queue
            );


        if(
            !saved
        ){

            throw new Error(
                "Unable to persist offline irregularity."
            );

        }


        /* ====================================================
           DIAGNOSTIC
           ==================================================== */

        console.log(
            "📦 IRREGULARITY QUEUED OFFLINE:",
            {
                queue_id:
                    pendingRecord.queue_id,

                payload:
                    pendingRecord.payload,

                media:
                    {
                        photo:
                            pendingRecord.media.photo
                                ? {
                                    name:
                                        pendingRecord.media.photo.name,

                                    type:
                                        pendingRecord.media.photo.type,

                                    size:
                                        pendingRecord.media.photo.size
                                }
                                : null,

                        video:
                            pendingRecord.media.video
                                ? {
                                    name:
                                        pendingRecord.media.video.name,

                                    type:
                                        pendingRecord.media.video.type,

                                    size:
                                        pendingRecord.media.video.size
                                }
                                : null,

                        audio:
                            pendingRecord.media.audio
                                ? {
                                    name:
                                        pendingRecord.media.audio.name,

                                    type:
                                        pendingRecord.media.audio.type,

                                    size:
                                        pendingRecord.media.audio.size
                                }
                                : null
                    }
            }
        );


        return pendingRecord;

    }
    catch(err){

        console.error(
            "❌ Could not queue irregularity:",
            err
        );


        throw err;

    }

}


/* ============================================================
   PENDING QUEUE COUNT
   ============================================================ */

async function ggGetPendingIrregularityCount(){

    const queue =
        await ggGetPendingIrregularities();


    return queue.length;

}


/* ============================================================
   REMOVE ONE PENDING RECORD
   ============================================================ */

async function ggRemovePendingIrregularity(
    queueId
){

    try{

        const queue =
            await ggGetPendingIrregularities();


        const filtered =
            queue.filter(
                function(record){

                    return String(
                        record?.queue_id ||
                        ""
                    ) !==
                    String(
                        queueId ||
                        ""
                    );

                }
            );


        await ggSavePendingIrregularities(
            filtered
        );


        console.log(
            "🗑️ IRREGULARITY PENDING ITEM REMOVED:",
            queueId
        );


        return true;

    }
    catch(err){

        console.warn(
            "⚠ Could not remove pending irregularity:",
            err
        );

        return false;

    }

}


/* ============================================================
   DEBUG HELPER
   ============================================================ */

window.debugIrregularityPendingQueue =
async function(){

    const queue =
        await ggGetPendingIrregularities();


    console.group(
        "📦 IRREGULARITY PENDING QUEUE"
    );


    console.log(
        "Storage key:",
        GG_IRREGULARITY_PENDING_KEY
    );


    console.log(
        "Count:",
        queue.length
    );


    console.log(
        "Queue:",
        queue
    );


    console.groupEnd();


    return queue;

};

/* ============================================================
   GG IRREGULARITY SAVE
   ============================================================

   ONLINE
   ------------------------------------------------------------
   Existing behaviour remains:

       buildPayload()
            ↓
       waitForFirebase()
            ↓
       createDocument()
            ↓
       uploadMedia()
            ↓
       return Firestore result


   OFFLINE
   ------------------------------------------------------------
   New behaviour:

       buildPayload()
            ↓
       getOfflineMediaSnapshot()
            ↓
       ggQueueIrregularity(
           payload,
           media
       )
            ↓
       return offline result


   IMPORTANT
   ------------------------------------------------------------
   createDocument() remains untouched.

   It remains the authoritative Firestore transaction
   and official Irregularity ID generator.

   The offline branch NEVER calls it.
   ============================================================ */


GGIrregularity.save =
async function(
    formData
){

    console.group(
        "⚠️ GREENGUARD IRREGULARITY SAVE"
    );


    try{

        /* ====================================================
           COMPLETE PAYLOAD

           Manual form
               +
           GPS
               +
           GIS
               +
           Profile
               +
           timestamps
           ==================================================== */

        const payload =
            await GGIrregularity.buildPayload(
                formData
            );


        console.log(
            "📦 Irregularity payload prepared:",
            payload
        );


        /* ====================================================
           OFFLINE
           ====================================================

           IMPORTANT:

           Do NOT wait for Firebase.

           Do NOT call createDocument().

           Do NOT execute the Firestore transaction.

           Do NOT generate an official Firestore ID.
           ==================================================== */

        if(
            navigator.onLine !== true
        ){

            console.warn(
                "📴 OFFLINE — PREPARING IRREGULARITY QUEUE"
            );


            /* =================================================
               OFFLINE MEDIA SNAPSHOT
               =================================================

               Capture the actual File / Blob objects while
               they still exist in the form.

               Uses the existing irregularityMedia.js helper.

               No upload.
               No Firebase.
               No Firestore.
               ================================================= */

            let offlineMedia = {

                photo:
                    null,

                video:
                    null,

                audio:
                    null

            };


            if(
                window.GGIrregularity &&
                GGIrregularity.Media &&
                typeof
                    GGIrregularity.Media
                        .getOfflineMediaSnapshot ===
                    "function"
            ){

                offlineMedia =
                    await GGIrregularity.Media
                        .getOfflineMediaSnapshot();


                console.log(
                    "📸 OFFLINE IRREGULARITY MEDIA CAPTURED:",
                    {
                        photo:
                            offlineMedia?.photo
                                ? {
                                    name:
                                        offlineMedia.photo.name,

                                    type:
                                        offlineMedia.photo.type,

                                    size:
                                        offlineMedia.photo.size
                                }
                                : null,

                        video:
                            offlineMedia?.video
                                ? {
                                    name:
                                        offlineMedia.video.name,

                                    type:
                                        offlineMedia.video.type,

                                    size:
                                        offlineMedia.video.size
                                }
                                : null,

                        audio:
                            offlineMedia?.audio
                                ? {
                                    name:
                                        offlineMedia.audio.name,

                                    type:
                                        offlineMedia.audio.type,

                                    size:
                                        offlineMedia.audio.size
                                }
                                : null
                    }
                );

            }
            else{

                console.warn(
                    "⚠ getOfflineMediaSnapshot() unavailable — queuing without media"
                );

            }


            /* =================================================
               PERSIST COMPLETE OFFLINE RECORD
               ================================================= */

            const pending =
                await ggQueueIrregularity(
                    payload,
                    offlineMedia
                );


            console.log(
                "📦 IRREGULARITY SAVED TO PENDING QUEUE:",
                pending.queue_id
            );


            console.groupEnd();


            return {

                offline:
                    true,

                queued:
                    true,

                queueId:
                    pending.queue_id,

                firestoreId:
                    "",

                payload:
                    payload,

                media:
                    offlineMedia

            };

        }


        /* ====================================================
           FIREBASE
           ====================================================

           ONLINE ONLY.

           Existing online behaviour preserved.
           ==================================================== */

        await GGIrregularity.waitForFirebase();


        /* ====================================================
           CREATE FIRESTORE DOCUMENT
           ====================================================

           EXISTING AUTHORITATIVE TRANSACTION.

           DO NOT MODIFY createDocument().
           ==================================================== */

        const documentRef =
            await GGIrregularity.createDocument(
                payload
            );


        console.log(
            "✅ Irregularity Firestore document created:",
            documentRef.id
        );


        /* ====================================================
           MEDIA
           ====================================================

           ONLINE MEDIA PATH REMAINS UNCHANGED.
           ==================================================== */

        if(
            GGIrregularity.hasMedia()
        ){

            try{

                const mediaResult =
                    await GGIrregularity.uploadMedia(
                        documentRef,
                        payload
                    );


                /* ============================================
                   UPDATE RETURN PAYLOAD
                   ============================================ */

                payload.photo_url =
                    mediaResult?.photo_url ||
                    "";


                payload.video_url =
                    mediaResult?.video_url ||
                    "";


                payload.audio_url =
                    mediaResult?.audio_url ||
                    "";


                payload.photo_storage_path =
                    mediaResult?.photo_storage_path ||
                    "";


                payload.video_storage_path =
                    mediaResult?.video_storage_path ||
                    "";


                payload.audio_storage_path =
                    mediaResult?.audio_storage_path ||
                    "";


                payload.media_status =
                    mediaResult?.media_status ||
                    "NONE";


                console.log(
                    "✅ Irregularity media completed:",
                    mediaResult
                );

            }
            catch(
                mediaError
            ){

                console.error(
                    "❌ Irregularity media upload failed:",
                    mediaError
                );


                /* ============================================
                   OBSERVATION ALREADY EXISTS

                   Do NOT delete Firestore document.
                   ============================================ */

                try{

                    await window.fb.updateDoc(
                        documentRef,
                        {

                            media_status:
                                "FAILED",

                            media_error:
                                GGIrregularity.text(
                                    mediaError?.message
                                ),

                            updated_at:
                                window.fb.serverTimestamp()

                        }
                    );

                }
                catch(
                    statusError
                ){

                    console.error(
                        "❌ Could not update media failure status:",
                        statusError
                    );

                }


                payload.media_status =
                    "FAILED";

            }

        }


        /* ====================================================
           FINAL ONLINE RESULT
           ==================================================== */

        const result = {

            offline:
                false,

            queued:
                false,

            firestoreId:
                documentRef.id,

            payload:
                payload

        };


        console.log(
            "✅ IRREGULARITY SAVE COMPLETE:",
            result
        );


        console.groupEnd();


        return result;

    }
    catch(
        error
    ){

        console.error(
            "❌ IRREGULARITY SAVE FAILED:",
            error
        );


        console.groupEnd();


        throw error;

    }

};

/* ============================================================
   SUBMIT
   ============================================================ */

GGIrregularity.submit =
async function(){

    const form =
        document.getElementById(
            "ggIrregularityForm"
        );


    if(
        !form
    ){

        console.error(
            "❌ ggIrregularityForm not found."
        );

        return null;

    }


    /* ========================================================
       ONLY MANUAL FORM DATA

       No GPS.
       No GIS.
       No profile.

       Those are added by buildPayload().
       ======================================================== */

    const formData =
        Object.fromEntries(
            new FormData(
                form
            ).entries()
        );


    /* ========================================================
       REQUIRED CATEGORY
       ======================================================== */

    if(
        !GGIrregularity.text(
            formData.type
        )
    ){

        alert(
            "Please select Irregularity / Offence / Observation type."
        );

        return null;

    }


    /* ========================================================
       REQUIRED DATE
       ======================================================== */

    if(
        !GGIrregularity.text(
            formData.incident_date
        )
    ){

        alert(
            "Please select incident date."
        );

        return null;

    }


    /* ========================================================
       REQUIRED TIME
       ======================================================== */

    if(
        !GGIrregularity.text(
            formData.incident_time
        )
    ){

        alert(
            "Please select incident time."
        );

        return null;

    }


    const submitButton =
        document.getElementById(
            "ggIrregularitySubmit"
        );


    if(
        submitButton
    ){

        submitButton.disabled =
            true;

        submitButton.textContent =
            "Getting location...";

    }


    try{

        if(
            submitButton
        ){

            submitButton.textContent =
                "Saving...";

        }


        /* ====================================================
           SAVE
           ==================================================== */

        const result =
            await GGIrregularity.save(
                formData
            );


        /* ====================================================
           RESULT
           ==================================================== */

        const mediaStatus =
            result?.payload?.media_status ||
            "NONE";


        console.log(
            "📌 Irregularity ID:",
            result.firestoreId
        );


        /* ====================================================
           USER MESSAGE
           ==================================================== */

        if(
            mediaStatus ===
            "FAILED"
        ){

            alert(
                "✅ Irregularity / Observation saved.\n\n" +
                "⚠️ Media upload failed, but the observation is safely stored."
            );

        }
        else if(
            mediaStatus ===
            "COMPLETE"
        ){

            alert(
                "✅ Irregularity / Observation and media saved."
            );

        }
        else{

            alert(
                "✅ Irregularity / Observation saved."
            );

        }


        /* ====================================================
           RESET FORM
           ==================================================== */

        form.reset();


        /* ====================================================
           RESET CATEGORY VISIBILITY
           ==================================================== */

        if(
            typeof GGIrregularity.updateFields ===
            "function"
        ){

            GGIrregularity.updateFields();

        }


        /* ====================================================
           CLOSE EXISTING UI MODAL

           The UI module owns the actual modal.
           ==================================================== */

        if(
            typeof window.closeIrregularityForm ===
            "function"
        ){

            window.closeIrregularityForm();

        }
        else if(
            typeof GGIrregularity.close ===
            "function"
        ){

            GGIrregularity.close();

        }


        return result;

    }
    catch(
        error
    ){

        console.error(
            "❌ Unable to save irregularity:",
            error
        );


        alert(
            "❌ Unable to save irregularity.\n\n" +
            (
                error?.message ||
                "Unknown error"
            )
        );


        return null;

    }
    finally{

        if(
            submitButton
        ){

            submitButton.disabled =
                false;

            submitButton.textContent =
                "SAVE OBSERVATION";

        }

    }

};


/* ============================================================
   CATEGORY FIELD VISIBILITY
   ============================================================ */

GGIrregularity.updateFields =
function(){

    const typeElement =
        document.getElementById(
            "gg-irregularity-type"
        );


    const selectedType =
        GGIrregularity.text(
            typeElement?.value
        ).toUpperCase();


    document
        .querySelectorAll(
            "[data-irregularity-group]"
        )
        .forEach(
            function(
                element
            ){

                element.style.display =
                    "none";

            }
        );


    if(
        !selectedType
    ){

        return;

    }


    const group =
        document.querySelector(
            `[data-irregularity-group="${selectedType}"]`
        );


    if(
        group
    ){

        group.style.display =
            "block";

    }

};


/* ============================================================
   INITIALIZE
   ============================================================ */

GGIrregularity.init =
function(){

    /* ========================================================
       CATEGORY CHANGE
       ======================================================== */

    const typeSelect =
        document.getElementById(
            "gg-irregularity-type"
        );


    if(
        typeSelect &&
        !typeSelect.__ggIrregularityChangeBound
    ){

        typeSelect.__ggIrregularityChangeBound =
            true;


        typeSelect.addEventListener(
            "change",
            function(){

                GGIrregularity.updateFields();

            }
        );

    }


    /* ========================================================
       FORM SUBMIT

       ONE handler only.

       Guard prevents duplicate binding.
       ======================================================== */

    const form =
        document.getElementById(
            "ggIrregularityForm"
        );


    if(
        form &&
        !form.__ggIrregularitySubmitBound
    ){

        form.__ggIrregularitySubmitBound =
            true;


        form.addEventListener(
            "submit",
            function(event){

                event.preventDefault();


                if(
                    form.__ggIrregularitySubmitting
                ){

                    return;

                }


                form.__ggIrregularitySubmitting =
                    true;


                Promise.resolve(
                    GGIrregularity.submit()
                )
                .finally(
                    function(){

                        form.__ggIrregularitySubmitting =
                            false;

                    }
                );

            }
        );

    }


    /* ========================================================
       CATEGORY VISIBILITY
       ======================================================== */

    GGIrregularity.updateFields();

};


/* ============================================================
   START

   IMPORTANT:
   This does NOT open the form.
   This does NOT request GPS.
   This does NOT resolve GIS.
   This does NOT reload the application.
   ============================================================ */

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        function(){

            /*
             * Only initialize if the form already exists.
             *
             * The UI can also call GGIrregularity.init()
             * after dynamically creating the form.
             */

            const form =
                document.getElementById(
                    "ggIrregularityForm"
                );


            if(
                form
            ){

                GGIrregularity.init();

            }

        },
        {
            once:
                true
        }
    );

}
else{

    const form =
        document.getElementById(
            "ggIrregularityForm"
        );


    if(
        form
    ){

        GGIrregularity.init();

    }

}


/* ============================================================
   END
   ============================================================ */
