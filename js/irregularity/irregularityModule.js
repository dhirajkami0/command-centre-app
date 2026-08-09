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

GGIrregularity.resolveGIS =
function(
    latitude,
    longitude
){

    if(
        typeof window.resolveCurrentGIS !==
        "function"
    ){

        throw new Error(
            "resolveCurrentGIS() is not available."
        );

    }


    const gis =
        window.resolveCurrentGIS(
            latitude,
            longitude
        );


    if(
        !gis
    ){

        throw new Error(
            "Unable to resolve GIS location."
        );

    }


    return gis;

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
   CREATE FIRESTORE DOCUMENT
   ============================================================ */

GGIrregularity.createDocument =
async function(
    payload
){

    const collectionRef =
        window.fb.collection(
            window.db,
            GGIrregularity.COLLECTION
        );


    /*
     * Firestore auto-generated document ID.
     */

    const documentRef =
        window.fb.doc(
            collectionRef
        );


    payload.firestore_id =
        documentRef.id;


    await window.fb.setDoc(
        documentRef,
        payload
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
   SAVE
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
           FIREBASE
           ==================================================== */

        await GGIrregularity.waitForFirebase();


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
           CREATE FIRESTORE DOCUMENT
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

           Firestore document already exists.

           Therefore media can safely use:

               payload.firestore_id
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


                /*
                 * IMPORTANT:
                 *
                 * The observation itself has already been
                 * successfully saved.
                 *
                 * Do NOT delete it.
                 */

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
           FINAL RESULT
           ==================================================== */

        const result = {

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
