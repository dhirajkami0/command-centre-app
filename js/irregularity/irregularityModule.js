/* ============================================================
   🌲 GREENGUARD
   IRREGULARITY / OFFENCE / OBSERVATION MODULE
   ============================================================

   PURPOSE
   ------------------------------------------------------------
   Patrol observations / irregularities / offences.

   CURRENT VERSION
   ------------------------------------------------------------
   • FIRESTORE ONLY
   • No Apps Script
   • No callBackend()
   • No Firebase initialization here
   • Uses existing window.db
   • Uses existing window.fb
   • Uses ONLY window.resolveCurrentGIS()
   • No duplicate GIS resolver
   • No duplicate media uploader
   • Does not modify Wildlife
   • Does not modify Elephant
   • Does not modify Patrol

   FIRESTORE
   ------------------------------------------------------------
   Collection:

       irregularities

   Document ID:

       Auto-generated Firestore ID
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
        value ===
        "" ||

        value ===
        null ||

        value ===
        undefined
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
     * Existing application Firebase instance.
     *
     * DO NOT initialize Firebase here.
     */

    if(
        window.db &&
        window.fb
    ){

        return true;

    }


    /*
     * Reuse existing application readiness function
     * if it is already available.
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
            )

    };

};


/* ============================================================
   CURRENT GPS
   ============================================================ */

GGIrregularity.getGPS =
function(){

    /*
     * Reuse GPS state already maintained by GreenGuard.
     *
     * No new GPS watcher is created here.
     */

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
                gps.lon ??
                gps.lng ??
                gps.longitude
            );


        if(
            latitude !==
            null &&

            longitude !==
            null
        ){

            return {

                latitude:
                    latitude,

                longitude:
                    longitude,

                accuracy:
                    GGIrregularity.number(
                        gps.accuracy
                    )

            };

        }

    }


    return {

        latitude:
            null,

        longitude:
            null,

        accuracy:
            null

    };

};


/* ============================================================
   GIS RESOLVER
   ============================================================

   IMPORTANT
   ------------------------------------------------------------
   ONLY:

       window.resolveCurrentGIS()

   No other GIS resolver is used.
   ============================================================ */

GGIrregularity.resolveGIS =
function(
    latitude,
    longitude
){

    /* ========================================================
       NO VALID GPS
       ======================================================== */

    if(
        !Number.isFinite(
            latitude
        ) ||

        !Number.isFinite(
            longitude
        )
    ){

        return {

            division:
                "",

            range:
                "",

            beat:
                "",

            compartment:
                "",

            village:
                "",

            villageCode:
                "",

            block:
                "",

            nearestPoint:
                "",

            distanceMeters:
                null,

            gps:
                "",

            type:
                "GPS"

        };

    }


    /* ========================================================
       EXISTING GIS FUNCTION MUST EXIST
       ======================================================== */

    if(
        typeof window.resolveCurrentGIS !==
        "function"
    ){

        console.warn(
            "⚠ window.resolveCurrentGIS() is not available."
        );


        return {

            division:
                "",

            range:
                "",

            beat:
                "",

            compartment:
                "",

            village:
                "",

            villageCode:
                "",

            block:
                "",

            nearestPoint:
                "",

            distanceMeters:
                null,

            gps:
                `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,

            type:
                "GPS"

        };

    }


    /* ========================================================
       RESOLVE USING EXISTING FUNCTION
       ======================================================== */

    let result =
        null;


    try{

        result =
            window.resolveCurrentGIS(
                latitude,
                longitude
            );

    }
    catch(error){

        console.error(
            "❌ Irregularity GIS resolution failed:",
            error
        );

    }


    if(
        !result ||
        typeof result !==
        "object"
    ){

        result =
            {};

    }


    /* ========================================================
       NORMALIZE EXISTING GIS RESULT
       ======================================================== */

    const division =
        GGIrregularity.text(
            result.division
        );


    const range =
        GGIrregularity.text(
            result.range
        );


    const beat =
        GGIrregularity.text(
            result.beat
        );


    const compartment =
        GGIrregularity.text(
            result.compartment
        );


    const village =
        GGIrregularity.text(
            result.village
        );


    const villageCode =
        GGIrregularity.text(
            result.villageCode
        );


    const block =
        GGIrregularity.text(
            result.block
        );


    const nearestPoint =
        GGIrregularity.text(
            result.nearestPoint
        );


    const distanceMeters =
        GGIrregularity.number(
            result.distanceMeters
        );


    /* ========================================================
       LOCATION TYPE
       ======================================================== */

    let type =
        "GPS";


    if(
        compartment ||
        beat ||
        range ||
        division
    ){

        type =
            "FOREST";

    }
    else if(
        village
    ){

        type =
            "VILLAGE";

    }


    /* ========================================================
       FINAL GIS OBJECT
       ======================================================== */

    return {

        division:
            division,

        range:
            range,

        beat:
            beat,

        compartment:
            compartment,

        village:
            village,

        villageCode:
            villageCode,

        block:
            block,

        nearestPoint:
            nearestPoint,

        distanceMeters:
            distanceMeters,

        gps:
            `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,

        type:
            type

    };

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

        fire_cause:
            GGIrregularity.text(
                formData.fire_cause
            ),


        /* ====================================================
           ENCROACHMENT
           ==================================================== */

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
   BUILD FIRESTORE PAYLOAD
   ============================================================ */

GGIrregularity.buildPayload =
function(
    formData
){

    const user =
        GGIrregularity.getUserContext();


    /* ========================================================
       CURRENT GPS
       ======================================================== */

    const gps =
        GGIrregularity.getGPS();


    /* ========================================================
       EXISTING GIS
       ======================================================== */

    const gis =
        GGIrregularity.resolveGIS(
            gps.latitude,
            gps.longitude
        );


    /* ========================================================
       CATEGORY
       ======================================================== */

    const type =
        GGIrregularity.text(
            formData.type
        )
        .toUpperCase();


    const meta =
        GGIrregularity.TYPE_META[type] ||
        GGIrregularity.TYPE_META.GENERAL_OBSERVATION;


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
            gis.villageCode ||
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

        gps_location:
            gis.gps ||
            "",


        /* ====================================================
           LOCATION
           ==================================================== */

        location_type:
            gis.type ||
            "GPS",

        nearest_point:
            gis.nearestPoint ||
            "",

        distance_from_nearest_point:
            gis.distanceMeters ??
            null,


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
           ----------------------------------------------------
           Reserved for later integration with the EXISTING
           GreenGuard Storage/media pipeline.

           No fake upload is performed here.
           ==================================================== */

        photo_url:
            "",

        video_url:
            "",

        audio_url:
            "",

        media_status:
            "NONE",


        /* ====================================================
           TIMESTAMPS
           ==================================================== */

        created_at:
            window.fb.serverTimestamp(),

        updated_at:
            window.fb.serverTimestamp()

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
       BUILD PAYLOAD
       ======================================================== */

    const payload =
        GGIrregularity.buildPayload(
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
       DOCUMENT ID
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
       SUCCESS LOG
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
                payload.longitude

        }
    );


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
            "Saving...";

    }


    try{

        /* ====================================================
           SAVE
           ==================================================== */

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


        alert(
            "✅ Irregularity / Observation saved."
        );


        /* ====================================================
           RESET FORM
           ==================================================== */

        form.reset();


        /* ====================================================
           RESET DYNAMIC FIELDS
           ==================================================== */

        GGIrregularity.updateFields();


        /* ====================================================
           CLOSE MODAL IF PRESENT
           ==================================================== */

        GGIrregularity.close();


    }
    catch(error){

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
            "ggIrregularityType"
        );


    const selectedType =
        GGIrregularity.text(
            typeElement?.value
        )
        .toUpperCase();


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
            "ggIrregularityType"
        );


    if(
        typeSelect
    ){

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
         * Avoid duplicate submit listeners if the module
         * is initialized more than once.
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
