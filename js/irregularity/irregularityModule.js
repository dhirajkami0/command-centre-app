/* ============================================================
   🌲 GREENGUARD
   IRREGULARITY / OFFENCE / OBSERVATION MODULE
   ============================================================

   FILE:
       js/irregularity/irregularityModule.js

   PURPOSE:
       Save patrol irregularities / offences / observations
       directly to Firestore.

   ============================================================
   IMPORTANT ARCHITECTURE
   ============================================================

   FIRESTORE ONLY
   ------------------------------------------------------------
   • No Apps Script
   • No callBackend()
   • No Firebase initialization here
   • Uses existing window.db
   • Uses existing window.fb

   GPS
   ------------------------------------------------------------
   1. Use window.latestGps first.
   2. If unavailable, use navigator.geolocation.
   3. Update window.latestGps after live GPS.

   GIS
   ------------------------------------------------------------
   ONLY:

       window.resolveCurrentGIS(
           latitude,
           longitude
       )

   No duplicate GIS resolver.

   USER
   ------------------------------------------------------------
   Uses existing:

       window.userProfile

   MEDIA
   ------------------------------------------------------------
   Uses:
       GGIrregularity.Media.upload()
       GGIrregularity.Media.updateFirestore()

   No Firebase initialization here.
   No competing media uploader.

   FIRESTORE
   ------------------------------------------------------------
   Collection:

       irregularities

   Document ID:

       Firestore auto-generated ID

   FLOW
   ------------------------------------------------------------

       Manual Form
            ↓
       Get GPS
            ↓
       resolveCurrentGIS()
            ↓
       Build complete payload
            ↓
       Create Firestore document
            ↓
       Get auto-generated Firestore ID
            ↓
       Upload Photo / Video / Audio
            ↓
       Update SAME Firestore document
            ↓
       Success

   ============================================================ */


/* ============================================================
   GLOBAL NAMESPACE
   ============================================================ */

window.GGIrregularity =
    window.GGIrregularity || {};


/* ============================================================
   FIRESTORE COLLECTION
   ============================================================ */

GGIrregularity.COLLECTION =
    "irregularities";


/* ============================================================
   MODULE IDENTIFIERS
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
   IRREGULARITY TYPES
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
   DISPLAY METADATA
   ============================================================ */

GGIrregularity.TYPE_META = {

    ILLICIT_FELLING: {

        icon:
            "🌳",

        title:
            "Illicit Felling"

    },


    ILLEGAL_TIMBER_FOREST_PRODUCE: {

        icon:
            "🪵",

        title:
            "Illegal Timber / Forest Produce"

    },


    ILLEGAL_MINING_EARTH_CUTTING: {

        icon:
            "🚜",

        title:
            "Illegal Mining / Earth Cutting"

    },


    ILLEGAL_FISHING: {

        icon:
            "🎣",

        title:
            "Illegal Fishing"

    },


    ILLEGAL_GRAZING: {

        icon:
            "🐄",

        title:
            "Illegal Grazing"

    },


    FOREST_FIRE: {

        icon:
            "🔥",

        title:
            "Forest Fire"

    },


    ENCROACHMENT: {

        icon:
            "🚧",

        title:
            "Encroachment"

    },


    ILLEGAL_STRUCTURE_OCCUPATION: {

        icon:
            "🏗️",

        title:
            "Illegal Structure / Occupation"

    },


    POACHING: {

        icon:
            "🏹",

        title:
            "Poaching"

    },


    ILLEGAL_ENTRY_TRESPASSING: {

        icon:
            "🚪",

        title:
            "Illegal Entry / Trespassing"

    },


    WILDLIFE_INJURY: {

        icon:
            "🐾",

        title:
            "Wildlife Injury"

    },


    WILDLIFE_DEATH: {

        icon:
            "☠️",

        title:
            "Wildlife Death"

    },


    GENERAL_OBSERVATION: {

        icon:
            "👁️",

        title:
            "General Observation"

    }

};


/* ============================================================
   SAFE TEXT
   ============================================================ */

GGIrregularity.text =
function(
    value
){

    return String(
        value ?? ""
    ).trim();

};


/* ============================================================
   SAFE NUMBER
   ============================================================ */

GGIrregularity.number =
function(
    value
){

    if(

        value === "" ||

        value === null ||

        value === undefined

    ){

        return null;

    }


    const number =
        Number(
            value
        );


    return Number.isFinite(
        number
    )
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
     *
     * GreenGuard already owns Firebase initialization.
     */

    if(

        window.db &&

        window.fb

    ){

        return true;

    }


    /*
     * Reuse existing application readiness function.
     */

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
   CURRENT USER CONTEXT
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

   FLOW:

       window.latestGps
             ↓
       if unavailable
             ↓
       navigator.geolocation
             ↓
       update window.latestGps

   No GPS watcher is created.

   ============================================================ */

GGIrregularity.getGPS =
async function(){

    /* ========================================================
       FIRST:
       EXISTING GREENGUARD GPS CACHE
       ======================================================== */

    const candidates = [

        window.latestGps,

        window.latestGPS,

        window.currentGps,

        window.currentGPS,

        window.lastGps,

        window.lastGPS

    ];


    for(

        const gps of candidates

    ){

        if(

            !gps ||

            typeof gps !==
            "object"

        ){

            continue;

        }


        const latitude =
            GGIrregularity.number(
                gps.lat ??
                gps.latitude
            );


        const longitude =
            GGIrregularity.number(
                gps.lng ??
                gps.lon ??
                gps.longitude
            );


        if(

            latitude !== null &&

            longitude !== null &&

            latitude !== 0 &&

            longitude !== 0

        ){

            return {

                latitude:
                    latitude,

                longitude:
                    longitude,

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
       FALLBACK:
       DEVICE GPS
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

    catch(
        error
    ){

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
            position
                ?.coords
                ?.latitude
        );


    const longitude =
        GGIrregularity.number(
            position
                ?.coords
                ?.longitude
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


    const gps = {

        lat:
            latitude,

        lng:
            longitude,

        accuracy:
            position
                ?.coords
                ?.accuracy,

        speed:
            position
                ?.coords
                ?.speed,

        heading:
            position
                ?.coords
                ?.heading,

        timestamp:
            Date.now()

    };


    /* ========================================================
       UPDATE EXISTING GPS CACHE
       ======================================================== */

    window.latestGps =
        gps;


    return {

        latitude:
            latitude,

        longitude:
            longitude,

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
            gps.timestamp

    };

};


/* ============================================================
   GIS RESOLVER
   ============================================================

   IMPORTANT:

   THIS IS THE ONLY GIS RESOLVER USED BY THIS MODULE.

       window.resolveCurrentGIS(
           latitude,
           longitude
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
        gis ||
        {};


    const normalized = {

        latitude:
            latitude,

        longitude:
            longitude,

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

        village_code:
            GGIrregularity.text(
                gis.villageCode
            ),

        block:
            GGIrregularity.text(
                gis.block
            ),

        nearest_point:
            GGIrregularity.text(
                gis.nearestPoint
            ),

        distance_meters:
            gis.distanceMeters ??
            null,

        text:
            GGIrregularity.text(
                gis.text
            )

    };


    /* ========================================================
       LOCATION TYPE
       ======================================================== */

    if(

        normalized.village

    ){

        normalized.location_type =
            "VILLAGE";

    }

    else if(

        normalized.compartment

    ){

        normalized.location_type =
            "FOREST_COMPARTMENT";

    }

    else if(

        normalized.nearest_point

    ){

        normalized.location_type =
            "NEAREST_POINT";

    }

    else{

        normalized.location_type =
            "GPS";

    }


    /* ========================================================
       GPS LOCATION TEXT
       ======================================================== */

    normalized.gps_location =
        latitude +
        ", " +
        longitude;


    return normalized;

};


/* ============================================================
   BUILD CATEGORY-SPECIFIC DETAILS
   ============================================================ */

GGIrregularity.buildDetails =
function(
    formData
){

    return {

        /* ====================================================
           ILLICIT FELLING
           ==================================================== */

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


        /* ====================================================
           ILLEGAL TIMBER / FOREST PRODUCE
           ==================================================== */

        timber_type:
            GGIrregularity.text(
                formData.timber_type
            ),

        timber_quantity:
            GGIrregularity.text(
                formData.timber_quantity
            ),


        /* ====================================================
           ILLEGAL MINING / EARTH CUTTING
           ==================================================== */

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


        /* ====================================================
           ILLEGAL FISHING
           ==================================================== */

        fishing_location:
            GGIrregularity.text(
                formData.fishing_location
            ),

        fishing_method:
            GGIrregularity.text(
                formData.fishing_method
            ),


        /* ====================================================
           ILLEGAL GRAZING
           ==================================================== */

        grazing_area:
            GGIrregularity.text(
                formData.grazing_area
            ),


        /* ====================================================
           FOREST FIRE
           ==================================================== */

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


        /* ====================================================
           ENCROACHMENT
           ==================================================== */

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


        /* ====================================================
           ILLEGAL STRUCTURE / OCCUPATION
           ==================================================== */

        structure_type:
            GGIrregularity.text(
                formData.structure_type
            ),

        structure_description:
            GGIrregularity.text(
                formData.structure_description
            ),


        /* ====================================================
           POACHING
           ==================================================== */

        poaching_species:
            GGIrregularity.text(
                formData.poaching_species
            ),

        poaching_method:
            GGIrregularity.text(
                formData.poaching_method
            ),


        /* ====================================================
           ILLEGAL ENTRY / TRESPASSING
           ==================================================== */

        trespasser_count:
            GGIrregularity.number(
                formData.trespasser_count
            ),

        trespassing_description:
            GGIrregularity.text(
                formData.trespassing_description
            ),


        /* ====================================================
           WILDLIFE INJURY
           ==================================================== */

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


        /* ====================================================
           WILDLIFE DEATH
           ==================================================== */

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


        /* ====================================================
           GENERAL OBSERVATION
           ==================================================== */

        observation:
            GGIrregularity.text(
                formData.observation
            ),


        /* ====================================================
           COMMON REMARKS
           ==================================================== */

        remarks:
            GGIrregularity.text(
                formData.remarks
            )

    };

};


/* ============================================================
   CHECK WHETHER IRREGULARITY MEDIA EXISTS
   ============================================================ */

GGIrregularity.hasMedia =
function(){

    const photoInput =
        document.getElementById(
            "gg-irregularity-photo"
        );


    const videoInput =
        document.getElementById(
            "gg-irregularity-video"
        );


    const audioInput =
        document.getElementById(
            "gg-irregularity-audio"
        );


    const photo =
        photoInput?.files?.[0] ||
        null;


    const video =
        videoInput?.files?.[0] ||
        null;


    const audio =
        audioInput?.files?.[0] ||
        null;


    return !!(
        photo ||
        video ||
        audio
    );

};


/* ============================================================
   BUILD FIRESTORE PAYLOAD
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

       Existing GreenGuard GPS first.
       Device GPS only if necessary.
       ======================================================== */

    const gps =
        await GGIrregularity.getGPS();


    /* ========================================================
       GIS

       ONLY window.resolveCurrentGIS()
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

    const type =
        GGIrregularity.text(
            formData.type
        ).toUpperCase();


    if(

        !type

    ){

        throw new Error(
            "Irregularity type is required."
        );

    }


    const meta =
        GGIrregularity.TYPE_META[type] ||
        GGIrregularity.TYPE_META.GENERAL_OBSERVATION;


    /* ========================================================
       TIMESTAMP
       ======================================================== */

    const serverTimestamp =
        window.fb.serverTimestamp();


    /* ========================================================
       MEDIA INITIAL STATUS
       ======================================================== */

    const hasMedia =
        GGIrregularity.hasMedia();


    /* ========================================================
       FINAL PAYLOAD
       ======================================================== */

    return {

        /* ====================================================
           CORE
           ==================================================== */

        module:
            GGIrregularity.MODULE,

        record_type:
            GGIrregularity.RECORD_TYPE,

        category:
            type,

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


        /* ====================================================
           SESSION
           ==================================================== */

        session_id:
            user.sessionId,


        /* ====================================================
           GIS ADMINISTRATIVE HIERARCHY
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
            gis.village_code ||
            "",

        block:
            gis.block ||
            "",


        /* ====================================================
           GPS
           ==================================================== */

        latitude:
            gps.latitude,

        longitude:
            gps.longitude,

        gps_accuracy:
            gps.accuracy,

        gps_speed:
            gps.speed,

        gps_heading:
            gps.heading,

        gps_timestamp:
            gps.timestamp,

        gps_location:
            gis.gps_location,


        /* ====================================================
           LOCATION
           ==================================================== */

        location_type:
            gis.location_type,

        location_text:
            gis.text,

        nearest_point:
            gis.nearest_point,

        distance_from_nearest_point:
            gis.distance_meters,


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
           CATEGORY DETAILS
           ==================================================== */

        details:
            GGIrregularity.buildDetails(
                formData
            ),


        /* ====================================================
           MEDIA

           Actual files are NOT stored in Firestore.

           The media module uploads them to Firebase Storage
           after the Firestore document has been created.

           These fields are populated after upload.
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
            serverTimestamp,

        updated_at:
            serverTimestamp

    };

};


/* ============================================================
   SAVE TO FIRESTORE
   ============================================================ */

GGIrregularity.save =
async function(
    formData
){

    /* ========================================================
       FIREBASE
       ======================================================== */

    await GGIrregularity.waitForFirebase();


    /* ========================================================
       BUILD COMPLETE PAYLOAD

       manual form fields
            +
       GPS
            +
       GIS
            +
       user context
            +
       media placeholders
       ======================================================== */

    const payload =
        await GGIrregularity.buildPayload(
            formData
        );


    /* ========================================================
       COLLECTION
       ======================================================== */

    const collectionRef =
        window.fb.collection(
            window.db,
            GGIrregularity.COLLECTION
        );


    /* ========================================================
       AUTO-GENERATED DOCUMENT ID
       ======================================================== */

    const documentRef =
        window.fb.doc(
            collectionRef
        );


    /* ========================================================
       STORE DOCUMENT ID INSIDE DOCUMENT
       ======================================================== */

    payload.firestore_id =
        documentRef.id;


    /* ========================================================
       FIRESTORE WRITE
       ======================================================== */

    await window.fb.setDoc(
        documentRef,
        payload
    );


    /* ========================================================
       SUCCESS — FIRESTORE METADATA
       ======================================================== */

    console.log(
        "✅ IRREGULARITY SAVED TO FIRESTORE",
        {

            firestore_id:
                documentRef.id,

            category:
                payload.category,

            category_label:
                payload.category_label,

            reported_by:
                payload.reported_by,

            division:
                payload.division,

            range:
                payload.range,

            beat:
                payload.beat,

            compartment:
                payload.compartment,

            village:
                payload.village,

            latitude:
                payload.latitude,

            longitude:
                payload.longitude,

            location_type:
                payload.location_type,

            media_status:
                payload.media_status

        }
    );


    /* ========================================================
       MEDIA UPLOAD
       ========================================================

       IMPORTANT:

       Firestore document already exists.

       Therefore the auto-generated ID is now known.

       The media module can safely use:

           payload.firestore_id

       to create the Storage path.

       ======================================================== */

    if(

        GGIrregularity.hasMedia()

    ){

        try{

            console.log(
                "📦 Starting Irregularity media upload..."
            );


            /* ==================================================
               VERIFY MEDIA MODULE
               ================================================== */

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


            /* ==================================================
               UPLOAD
               ================================================== */

            const mediaResult =
                await GGIrregularity.Media.upload(
                    payload
                );


            /* ==================================================
               UPDATE SAME FIRESTORE DOCUMENT
               ================================================== */

            if(

                mediaResult &&

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


            /* ==================================================
               UPDATE RETURN PAYLOAD
               ================================================== */

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
                "✅ IRREGULARITY MEDIA COMPLETED",
                {

                    firestore_id:
                        documentRef.id,

                    photo:
                        !!payload.photo_url,

                    video:
                        !!payload.video_url,

                    audio:
                        !!payload.audio_url,

                    media_status:
                        payload.media_status

                }
            );

        }

        catch(
            mediaError
        ){

            /* ==================================================
               IMPORTANT

               The Firestore irregularity itself has already
               been successfully saved.

               Do NOT delete it just because media failed.

               Mark media as FAILED on the SAME document.
               ================================================== */

            console.error(
                "❌ Irregularity media upload failed:",
                mediaError
            );


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
                updateError
            ){

                console.error(
                    "❌ Unable to update media failure status:",
                    updateError
                );

            }


            /*
             * Do not hide the successful Firestore save.
             *
             * Return the Firestore document result so the UI
             * knows the observation itself was saved.
             */

            console.warn(
                "⚠ Irregularity saved, but media upload failed."
            );

        }

    }


    /* ========================================================
       FINAL RETURN
       ======================================================== */

    return {

        firestoreId:
            documentRef.id,

        payload:
            payload

    };

};


/* ============================================================
   FORM DATA SUBMIT
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

        return;

    }


    /* ========================================================
       FORM DATA

       ONLY visible/manual fields are collected here.

       GPS / GIS / user fields are NOT taken from the form.

       buildPayload() adds them automatically.
       ======================================================== */

    const formData =
        Object.fromEntries(
            new FormData(
                form
            ).entries()
        );


    /* ========================================================
       CATEGORY REQUIRED
       ======================================================== */

    if(

        !GGIrregularity.text(
            formData.type
        )

    ){

        alert(
            "Please select Irregularity / Offence / Observation type."
        );

        return;

    }


    /* ========================================================
       DATE REQUIRED
       ======================================================== */

    if(

        !GGIrregularity.text(
            formData.incident_date
        )

    ){

        alert(
            "Please select incident date."
        );

        return;

    }


    /* ========================================================
       TIME REQUIRED
       ======================================================== */

    if(

        !GGIrregularity.text(
            formData.incident_time
        )

    ){

        alert(
            "Please select incident time."
        );

        return;

    }


    /* ========================================================
       SUBMIT BUTTON
       ======================================================== */

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

        /* ====================================================
           SAVE
           ==================================================== */

        if(

            submitButton

        ){

            submitButton.textContent =
                "Saving...";

        }


        const result =
            await GGIrregularity.save(
                formData
            );


        /* ====================================================
           SUCCESS
           ==================================================== */

        console.log(
            "📌 Irregularity Firestore ID:",
            result.firestoreId
        );


        const mediaStatus =
            result
                ?.payload
                ?.media_status ||
            "NONE";


        if(

            mediaStatus ===
            "FAILED"

        ){

            alert(
                "✅ Irregularity / Observation saved.\n\n" +
                "⚠️ Media upload failed. The observation is safely stored in Firestore."
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
           RESET DYNAMIC CATEGORY FIELDS
           ==================================================== */

        GGIrregularity.updateFields();


        /* ====================================================
           CLOSE MODAL
           ==================================================== */

        GGIrregularity.close();


        return result;

    }

    catch(
        error
    ){

        console.error(
            "❌ Irregularity save failed:",
            error
        );


        alert(
            "❌ Unable to save irregularity.\n\n" +
            (
                error?.message ||
                "Unknown error"
            )
        );


        throw error;

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

    /*
     * The form generator creates:
     *
     *     id="gg-irregularity-type"
     *
     * Therefore use the actual generated ID.
     */

    const typeElement =
        document.getElementById(
            "gg-irregularity-type"
        );


    const selectedType =
        GGIrregularity.text(
            typeElement?.value
        ).toUpperCase();


    /* ========================================================
       HIDE ALL CATEGORY GROUPS
       ======================================================== */

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


    /* ========================================================
       SHOW SELECTED CATEGORY
       ======================================================== */

    if(

        selectedType

    ){

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

    }

};


/* ============================================================
   OPEN MODAL
   ============================================================ */

GGIrregularity.open =
function(){

    const modal =
        document.getElementById(
            "ggIrregularityModal"
        );


    if(

        !modal

    ){

        console.warn(
            "⚠ ggIrregularityModal not found."
        );

        return;

    }


    modal.style.display =
        "flex";


    GGIrregularity.updateFields();

};


/* ============================================================
   CLOSE MODAL
   ============================================================ */

GGIrregularity.close =
function(){

    const modal =
        document.getElementById(
            "ggIrregularityModal"
        );


    if(

        modal

    ){

        modal.style.display =
            "none";

    }

};


/* ============================================================
   INITIALIZE
   ============================================================ */

GGIrregularity.init =
function(){

    /* ========================================================
       CATEGORY SELECT
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
       FORM
       ======================================================== */

    const form =
        document.getElementById(
            "ggIrregularityForm"
        );


    if(

        form

    ){

        /*
         * Avoid duplicate submit listeners.
         */

        if(

            !form.__ggIrregularitySubmitBound

        ){

            form.__ggIrregularitySubmitBound =
                true;


            form.addEventListener(
                "submit",
                function(
                    event
                ){

                    event.preventDefault();

                    GGIrregularity.submit();

                }
            );

        }

    }


    /* ========================================================
       INITIAL FIELD STATE
       ======================================================== */

    GGIrregularity.updateFields();

};


/* ============================================================
   START
   ============================================================ */

if(

    document.readyState ===
    "loading"

){

    document.addEventListener(
        "DOMContentLoaded",
        function(){

            GGIrregularity.init();

        },
        {
            once:
                true
        }
    );

}
else{

    GGIrregularity.init();

}


/* ============================================================
   END
   ============================================================ */
