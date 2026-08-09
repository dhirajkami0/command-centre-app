/* ============================================================
   🌲 GREENGUARD
   IRREGULARITY GIS ADAPTER
   ============================================================

   File:
       js/irregularity/irregularityGIS.js

   IMPORTANT
   ------------------------------------------------------------
   This module does NOT create a GIS system.

   It uses ONLY the existing global:

       window.resolveCurrentGIS(lat, lon)

   Existing GIS functions remain untouched:

       findVillageAtPoint()
       findCompartmentAtPoint()
       findNearestVillagePoint()

   No duplicate GIS resolver.
   No GIS data loading.
   No Firestore.
   No Apps Script.
   ============================================================ */


/* ============================================================
   NAMESPACE
   ============================================================ */

window.GGIrregularity =
    window.GGIrregularity || {};


GGIrregularity.GIS =
    GGIrregularity.GIS || {};


/* ============================================================
   RESOLVE CURRENT LOCATION
   ============================================================ */

GGIrregularity.GIS.resolve =
function(
    lat,
    lon
){

    /* ========================================================
       NORMALIZE GPS
       ======================================================== */

    lat =
        Number(
            lat
        );

    lon =
        Number(
            lon
        );


    /* ========================================================
       INVALID GPS
       ======================================================== */

    if(

        !Number.isFinite(
            lat
        ) ||

        !Number.isFinite(
            lon
        )

    ){

        return null;

    }


    /* ========================================================
       EXISTING GLOBAL GIS RESOLVER
       ======================================================== */

    if(

        typeof window.resolveCurrentGIS !==
        "function"

    ){

        console.error(
            "❌ resolveCurrentGIS() is not available."
        );

        return null;

    }


    /* ========================================================
       CALL EXISTING RESOLVER
       ======================================================== */

    let gis =
        null;


    try{

        gis =
            window.resolveCurrentGIS(
                lat,
                lon
            );

    }
    catch(
        error
    ){

        console.error(
            "❌ Existing GIS resolver failed:",
            error
        );

        return null;

    }


    /* ========================================================
       RESOLVER RETURNED NOTHING
       ======================================================== */

    if(
        !gis ||
        typeof gis !==
        "object"
    ){

        console.warn(
            "⚠ GIS resolver returned no location."
        );

        return {

            lat:
                lat,

            lon:
                lon,

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

            nearestVillage:
                "",

            nearestPoint:
                "",

            distanceMeters:
                null,

            text:
                "Unknown Location",

            compartmentResult:
                null,

            villageResult:
                null,

            nearestPointResult:
                null

        };

    }


    /* ========================================================
       RETURN THE EXISTING GIS RESULT
       ========================================================

       Do not rebuild or reinterpret the GIS hierarchy.

       The global resolver already returns:

           lat
           lon
           compartment
           beat
           range
           division
           village
           villageCode
           block
           nearestVillage
           nearestPoint
           distanceMeters
           text
           compartmentResult
           villageResult
           nearestPointResult

       We simply preserve it.
       ======================================================== */

    return {

        lat:
            gis.lat ??
            lat,

        lon:
            gis.lon ??
            lon,

        compartment:
            gis.compartment ||
            "",

        beat:
            gis.beat ||
            "",

        range:
            gis.range ||
            "",

        division:
            gis.division ||
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
            "Unknown Location",

        compartmentResult:
            gis.compartmentResult ||
            null,

        villageResult:
            gis.villageResult ||
            null,

        nearestPointResult:
            gis.nearestPointResult ||
            null

    };

};


/* ============================================================
   RESOLVE FROM EXISTING GPS OBJECT
   ============================================================ */

GGIrregularity.GIS.resolveGPS =
function(
    gps
){

    if(
        !gps ||
        typeof gps !==
        "object"
    ){

        return null;

    }


    const lat =
        Number(
            gps.lat ??
            gps.latitude
        );


    const lon =
        Number(
            gps.lon ??
            gps.lng ??
            gps.longitude
        );


    return GGIrregularity.GIS.resolve(
        lat,
        lon
    );

};


/* ============================================================
   BUILD FIRESTORE LOCATION FIELDS
   ============================================================

   This creates only the location fields required by the
   Irregularity Firestore document.

   It does NOT save anything.
   ============================================================ */

GGIrregularity.GIS.toFirestore =
function(
    gis
){

    if(
        !gis
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

            village_code:
                "",

            block:
                "",

            latitude:
                null,

            longitude:
                null,

            gps_accuracy:
                null,

            gps_location:
                "",

            location_type:
                "GPS",

            nearest_point:
                "",

            distance_from_nearest_point:
                null

        };

    }


    /* ========================================================
       LOCATION TYPE
       ======================================================== */

    let locationType =
        "GPS";


    if(
        gis.compartment
    ){

        locationType =
            "FOREST";

    }
    else if(
        gis.village
    ){

        locationType =
            "VILLAGE";

    }


    /* ========================================================
       GPS TEXT
       ======================================================== */

    const latitude =
        Number(
            gis.lat
        );


    const longitude =
        Number(
            gis.lon
        );


    let gpsLocation =
        "";


    if(

        Number.isFinite(
            latitude
        ) &&

        Number.isFinite(
            longitude
        )

    ){

        gpsLocation =
            `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

    }


    /* ========================================================
       RETURN FIRESTORE LOCATION OBJECT
       ======================================================== */

    return {

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

        village_code:
            gis.villageCode ||
            "",

        block:
            gis.block ||
            "",

        latitude:
            Number.isFinite(
                latitude
            )
                ? latitude
                : null,

        longitude:
            Number.isFinite(
                longitude
            )
                ? longitude
                : null,

        gps_accuracy:
            null,

        gps_location:
            gpsLocation,

        location_type:
            locationType,

        nearest_point:
            gis.nearestPoint ||
            "",

        distance_from_nearest_point:
            gis.distanceMeters ??
            null

    };

};


/* ============================================================
   END
   ============================================================ */
