/* ============================================================
   🌲 GREENGUARD
   IRREGULARITY STATE MODULE
   ============================================================

   File:
       js/irregularity/irregularityState.js

   PURPOSE
   ------------------------------------------------------------
   Maintains temporary state for the
   Irregularity / Offence / Observation module.

   IMPORTANT
   ------------------------------------------------------------
   • No Firebase initialization
   • No Firestore writes
   • No Apps Script
   • No callBackend()
   • No GIS resolver
   • No GPS watcher
   • No modification of Wildlife / Elephant state
   • Uses only the GGIrregularity namespace
   ============================================================ */


/* ============================================================
   NAMESPACE
   ============================================================ */

window.GGIrregularity =
    window.GGIrregularity || {};


/* ============================================================
   STATE OBJECT
   ============================================================ */

GGIrregularity.State =
    GGIrregularity.State || {};


/* ============================================================
   INTERNAL STATE
   ============================================================ */

GGIrregularity.State.data = {

    /* --------------------------------------------------------
       FORM
       -------------------------------------------------------- */

    formOpen:
        false,

    selectedCategory:
        "",

    submitting:
        false,


    /* --------------------------------------------------------
       CURRENT GPS
       -------------------------------------------------------- */

    gps:
        null,


    /* --------------------------------------------------------
       CURRENT GIS
       -------------------------------------------------------- */

    gis:
        null,


    /* --------------------------------------------------------
       MEDIA
       -------------------------------------------------------- */

    photo:
        null,

    video:
        null,

    audio:
        null,


    /* --------------------------------------------------------
       LAST SAVED RECORD
       -------------------------------------------------------- */

    lastSavedId:
        null,

    lastSavedPayload:
        null

};


/* ============================================================
   RESET STATE
   ============================================================ */

GGIrregularity.State.reset =
function(){

    GGIrregularity.State.data = {

        formOpen:
            false,

        selectedCategory:
            "",

        submitting:
            false,

        gps:
            null,

        gis:
            null,

        photo:
            null,

        video:
            null,

        audio:
            null,

        lastSavedId:
            null,

        lastSavedPayload:
            null

    };


    return GGIrregularity.State.data;

};


/* ============================================================
   GET STATE
   ============================================================ */

GGIrregularity.State.get =
function(){

    return GGIrregularity.State.data;

};


/* ============================================================
   SET FORM OPEN
   ============================================================ */

GGIrregularity.State.setFormOpen =
function(
    value
){

    GGIrregularity.State.data.formOpen =
        Boolean(
            value
        );

};


/* ============================================================
   IS FORM OPEN
   ============================================================ */

GGIrregularity.State.isFormOpen =
function(){

    return Boolean(
        GGIrregularity.State.data.formOpen
    );

};


/* ============================================================
   SET CATEGORY
   ============================================================ */

GGIrregularity.State.setCategory =
function(
    category
){

    GGIrregularity.State.data.selectedCategory =
        String(
            category ||
            ""
        )
        .trim()
        .toUpperCase();


};


/* ============================================================
   GET CATEGORY
   ============================================================ */

GGIrregularity.State.getCategory =
function(){

    return (
        GGIrregularity.State.data.selectedCategory ||
        ""
    );

};


/* ============================================================
   SET SUBMITTING
   ============================================================ */

GGIrregularity.State.setSubmitting =
function(
    value
){

    GGIrregularity.State.data.submitting =
        Boolean(
            value
        );

};


/* ============================================================
   IS SUBMITTING
   ============================================================ */

GGIrregularity.State.isSubmitting =
function(){

    return Boolean(
        GGIrregularity.State.data.submitting
    );

};


/* ============================================================
   SET GPS
   ============================================================ */

GGIrregularity.State.setGPS =
function(
    gps
){

    if(
        !gps ||
        typeof gps !==
        "object"
    ){

        GGIrregularity.State.data.gps =
            null;

        return;

    }


    const latitude =
        Number(
            gps.latitude ??
            gps.lat
        );


    const longitude =
        Number(
            gps.longitude ??
            gps.lon ??
            gps.lng
        );


    if(

        !Number.isFinite(
            latitude
        ) ||

        !Number.isFinite(
            longitude
        )

    ){

        GGIrregularity.State.data.gps =
            null;

        return;

    }


    GGIrregularity.State.data.gps = {

        latitude:
            latitude,

        longitude:
            longitude,

        accuracy:
            Number.isFinite(
                Number(
                    gps.accuracy
                )
            )
                ? Number(
                    gps.accuracy
                )
                : null

    };

};


/* ============================================================
   GET GPS
   ============================================================ */

GGIrregularity.State.getGPS =
function(){

    return (
        GGIrregularity.State.data.gps ||
        null
    );

};


/* ============================================================
   SET GIS
   ============================================================ */

GGIrregularity.State.setGIS =
function(
    gis
){

    if(
        !gis ||
        typeof gis !==
        "object"
    ){

        GGIrregularity.State.data.gis =
            null;

        return;

    }


    GGIrregularity.State.data.gis = {

        lat:
            gis.lat ??
            null,

        lon:
            gis.lon ??
            null,

        division:
            gis.division ||
            "",

        range:
            gis.range ||
            "",

        beat:
            gis.beat ||
            "",

        compartment:
            gis.compartment ||
            "",

        village:
            gis.village ||
            "",

        villageCode:
            gis.villageCode ||
            "",

        block:
            gis.block ||
            "",

        nearestVillage:
            gis.nearestVillage ||
            "",

        nearestPoint:
            gis.nearestPoint ||
            "",

        distanceMeters:
            gis.distanceMeters ??
            null,

        text:
            gis.text ||
            "Unknown Location"

    };

};


/* ============================================================
   GET GIS
   ============================================================ */

GGIrregularity.State.getGIS =
function(){

    return (
        GGIrregularity.State.data.gis ||
        null
    );

};


/* ============================================================
   SET MEDIA
   ============================================================ */

GGIrregularity.State.setMedia =
function(
    type,
    value
){

    const mediaType =
        String(
            type ||
            ""
        )
        .trim()
        .toLowerCase();


    if(
        mediaType !==
        "photo" &&

        mediaType !==
        "video" &&

        mediaType !==
        "audio"
    ){

        return;

    }


    GGIrregularity.State.data[
        mediaType
    ] =
        value ||
        null;

};


/* ============================================================
   GET MEDIA
   ============================================================ */

GGIrregularity.State.getMedia =
function(
    type
){

    const mediaType =
        String(
            type ||
            ""
        )
        .trim()
        .toLowerCase();


    if(
        mediaType !==
        "photo" &&

        mediaType !==
        "video" &&

        mediaType !==
        "audio"
    ){

        return null;

    }


    return (
        GGIrregularity.State.data[
            mediaType
        ] ||
        null
    );

};


/* ============================================================
   CLEAR MEDIA
   ============================================================ */

GGIrregularity.State.clearMedia =
function(){

    GGIrregularity.State.data.photo =
        null;

    GGIrregularity.State.data.video =
        null;

    GGIrregularity.State.data.audio =
        null;

};


/* ============================================================
   SET LAST SAVED RECORD
   ============================================================ */

GGIrregularity.State.setLastSaved =
function(
    firestoreId,
    payload
){

    GGIrregularity.State.data.lastSavedId =
        firestoreId ||
        null;


    GGIrregularity.State.data.lastSavedPayload =
        payload ||
        null;

};


/* ============================================================
   GET LAST SAVED RECORD
   ============================================================ */

GGIrregularity.State.getLastSaved =
function(){

    return {

        firestoreId:
            GGIrregularity.State.data.lastSavedId,

        payload:
            GGIrregularity.State.data.lastSavedPayload

    };

};


/* ============================================================
   CLEAR LAST SAVED RECORD
   ============================================================ */

GGIrregularity.State.clearLastSaved =
function(){

    GGIrregularity.State.data.lastSavedId =
        null;

    GGIrregularity.State.data.lastSavedPayload =
        null;

};


/* ============================================================
   SNAPSHOT
   ============================================================

   Returns a safe copy of the current state.

   Useful for debugging without exposing the live state
   object for accidental mutation.
   ============================================================ */

GGIrregularity.State.snapshot =
function(){

    const state =
        GGIrregularity.State.data;


    return {

        formOpen:
            state.formOpen,

        selectedCategory:
            state.selectedCategory,

        submitting:
            state.submitting,

        gps:
            state.gps
                ? {
                    ...state.gps
                }
                : null,

        gis:
            state.gis
                ? {
                    ...state.gis
                }
                : null,

        photo:
            state.photo,

        video:
            state.video,

        audio:
            state.audio,

        lastSavedId:
            state.lastSavedId,

        lastSavedPayload:
            state.lastSavedPayload

    };

};


/* ============================================================
   DEBUG HELPER
   ============================================================ */

GGIrregularity.State.debug =
function(){

    console.log(
        "🌲 GGIrregularity State:",
        GGIrregularity.State.snapshot()
    );

};


/* ============================================================
   INITIAL STATE
   ============================================================ */

if(
    !GGIrregularity.State.data
){

    GGIrregularity.State.reset();

}


/* ============================================================
   END
   ============================================================ */
