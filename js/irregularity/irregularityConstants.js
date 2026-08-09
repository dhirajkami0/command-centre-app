/* ============================================================
   🌲 GREENGUARD
   IRREGULARITY CONSTANTS
   ============================================================

   File:
       js/irregularity/irregularityConstants.js

   Purpose:
       Central constants for the
       Irregularity / Offence / Observation module.

   IMPORTANT
   ------------------------------------------------------------
   • No Firebase initialization
   • No Firestore calls
   • No Apps Script
   • No GIS resolver
   • No GPS watcher
   • No UI logic
   • No modification of existing modules
   ============================================================ */


/* ============================================================
   GLOBAL NAMESPACE
   ============================================================ */

window.GGIrregularity =
    window.GGIrregularity || {};


/* ============================================================
   FIRESTORE
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
   CATEGORY TYPES
   ============================================================ */

GGIrregularity.TYPES = {

    /* --------------------------------------------------------
       FOREST OFFENCES
       -------------------------------------------------------- */

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


    /* --------------------------------------------------------
       FIRE / LAND
       -------------------------------------------------------- */

    FIRE:
        "FOREST_FIRE",

    ENCROACHMENT:
        "ENCROACHMENT",

    STRUCTURE:
        "ILLEGAL_STRUCTURE_OCCUPATION",


    /* --------------------------------------------------------
       WILDLIFE / SECURITY
       -------------------------------------------------------- */

    POACHING:
        "POACHING",

    TRESPASSING:
        "ILLEGAL_ENTRY_TRESPASSING",

    WILDLIFE_INJURY:
        "WILDLIFE_INJURY",

    WILDLIFE_DEATH:
        "WILDLIFE_DEATH",


    /* --------------------------------------------------------
       GENERAL
       -------------------------------------------------------- */

    OBSERVATION:
        "GENERAL_OBSERVATION"

};


/* ============================================================
   CATEGORY DISPLAY INFORMATION
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
   CATEGORY ORDER
   ============================================================ */

GGIrregularity.CATEGORY_ORDER = [

    GGIrregularity.TYPES.FELLING,

    GGIrregularity.TYPES.TIMBER,

    GGIrregularity.TYPES.MINING,

    GGIrregularity.TYPES.FISHING,

    GGIrregularity.TYPES.GRAZING,

    GGIrregularity.TYPES.FIRE,

    GGIrregularity.TYPES.ENCROACHMENT,

    GGIrregularity.TYPES.STRUCTURE,

    GGIrregularity.TYPES.POACHING,

    GGIrregularity.TYPES.TRESPASSING,

    GGIrregularity.TYPES.WILDLIFE_INJURY,

    GGIrregularity.TYPES.WILDLIFE_DEATH,

    GGIrregularity.TYPES.OBSERVATION

];


/* ============================================================
   CATEGORY GROUP IDS
   ============================================================ */

GGIrregularity.GROUPS = {

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
   COMMON FIELD NAMES
   ============================================================ */

GGIrregularity.FIELDS = {

    TYPE:
        "type",

    INCIDENT_DATE:
        "incident_date",

    INCIDENT_TIME:
        "incident_time",

    REMARKS:
        "remarks",


    /* --------------------------------------------------------
       FELLING
       -------------------------------------------------------- */

    FELLING_COMPARTMENT:
        "felling_compartment",

    NUMBER_OF_FELLING:
        "number_of_felling",

    SPECIES_FELLED:
        "species_felled",


    /* --------------------------------------------------------
       TIMBER / FOREST PRODUCE
       -------------------------------------------------------- */

    TIMBER_TYPE:
        "timber_type",

    TIMBER_QUANTITY:
        "timber_quantity",


    /* --------------------------------------------------------
       MINING
       -------------------------------------------------------- */

    MINING_COMPARTMENT:
        "mining_compartment",

    MINING_AREA:
        "mining_area",

    MINING_TYPE:
        "mining_type",


    /* --------------------------------------------------------
       FISHING
       -------------------------------------------------------- */

    FISHING_LOCATION:
        "fishing_location",

    FISHING_METHOD:
        "fishing_method",


    /* --------------------------------------------------------
       GRAZING
       -------------------------------------------------------- */

    GRAZING_AREA:
        "grazing_area",


    /* --------------------------------------------------------
       FIRE
       -------------------------------------------------------- */

    FIRE_AREA:
        "fire_area",

    FIRE_CAUSE:
        "fire_cause",


    /* --------------------------------------------------------
       ENCROACHMENT
       -------------------------------------------------------- */

    ENCROACHED_AREA:
        "encroached_area",

    ENCROACHMENT_TYPE:
        "encroachment_type",


    /* --------------------------------------------------------
       STRUCTURE
       -------------------------------------------------------- */

    STRUCTURE_TYPE:
        "structure_type",

    STRUCTURE_DESCRIPTION:
        "structure_description",


    /* --------------------------------------------------------
       POACHING
       -------------------------------------------------------- */

    POACHING_SPECIES:
        "poaching_species",

    POACHING_METHOD:
        "poaching_method",


    /* --------------------------------------------------------
       TRESPASSING
       -------------------------------------------------------- */

    TRESPASSER_COUNT:
        "trespasser_count",

    TRESPASSING_DESCRIPTION:
        "trespassing_description",


    /* --------------------------------------------------------
       WILDLIFE INJURY
       -------------------------------------------------------- */

    INJURED_SPECIES:
        "injured_species",

    INJURED_AGE:
        "injured_age",

    INJURED_SEX:
        "injured_sex",

    INJURY_DETAILS:
        "injury_details",


    /* --------------------------------------------------------
       WILDLIFE DEATH
       -------------------------------------------------------- */

    DEAD_SPECIES:
        "dead_species",

    DEAD_SEX:
        "dead_sex",

    DEAD_AGE:
        "dead_age",

    DEAD_MEASUREMENT:
        "dead_measurement",


    /* --------------------------------------------------------
       GENERAL OBSERVATION
       -------------------------------------------------------- */

    OBSERVATION:
        "observation"

};


/* ============================================================
   LOCATION FIELD NAMES
   ============================================================ */

GGIrregularity.LOCATION_FIELDS = {

    DIVISION:
        "division",

    RANGE:
        "range",

    BEAT:
        "beat",

    COMPARTMENT:
        "compartment",

    VILLAGE:
        "village",

    VILLAGE_CODE:
        "village_code",

    BLOCK:
        "block",

    LATITUDE:
        "latitude",

    LONGITUDE:
        "longitude",

    GPS_ACCURACY:
        "gps_accuracy",

    GPS_LOCATION:
        "gps_location",

    LOCATION_TYPE:
        "location_type",

    NEAREST_POINT:
        "nearest_point",

    DISTANCE_FROM_NEAREST_POINT:
        "distance_from_nearest_point"

};


/* ============================================================
   MEDIA FIELD NAMES
   ============================================================ */

GGIrregularity.MEDIA_FIELDS = {

    PHOTO_URL:
        "photo_url",

    VIDEO_URL:
        "video_url",

    AUDIO_URL:
        "audio_url",

    MEDIA_STATUS:
        "media_status"

};


/* ============================================================
   MEDIA STATUS
   ============================================================ */

GGIrregularity.MEDIA_STATUS = {

    NONE:
        "NONE",

    PENDING:
        "PENDING",

    COMPLETE:
        "COMPLETE",

    FAILED:
        "FAILED"

};


/* ============================================================
   FIRESTORE TIMESTAMP FIELDS
   ============================================================ */

GGIrregularity.TIMESTAMP_FIELDS = {

    CREATED_AT:
        "created_at",

    UPDATED_AT:
        "updated_at"

};


/* ============================================================
   DEFAULT VALUES
   ============================================================ */

GGIrregularity.DEFAULTS = {

    STATUS:
        GGIrregularity.STATUS.ACTIVE,

    MEDIA_STATUS:
        GGIrregularity.MEDIA_STATUS.NONE,

    LOCATION_TYPE:
        "GPS"

};


/* ============================================================
   END
   ============================================================ */
