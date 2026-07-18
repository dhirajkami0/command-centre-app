/* =========================================================
   GreenGuard
   Offence Intelligence Module

   File:
   js/offence/offenceConstants.js

   Purpose:
   Central constants and configuration for:
   - Offence Heat Map
   - Source locations (accused origin/address)
   - Target locations (offence/seizure place)
   - Source → Target linkage
   - Cascading map click data
   - Future offence analytics

   IMPORTANT:
   This file contains NO business logic.
   This file contains NO Leaflet rendering.
   This file contains NO Firestore queries.
   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       1. GLOBAL NAMESPACE
       ===================================================== */

    window.GG =
        window.GG ||
        {};

    GG.Offence =
        GG.Offence ||
        {};


    /* =====================================================
       2. CONSTANTS OBJECT
       ===================================================== */

    const OffenceConstants = {};


    /* =====================================================
       3. MODULE INFORMATION
       ===================================================== */

    OffenceConstants.MODULE = {

        NAME:
            "OffenceIntelligence",

        VERSION:
            "1.0.0"

    };


    /* =====================================================
       4. LOCATION TYPES

       SOURCE:
       Where accused/offender comes from.

       TARGET:
       Where offence/seizure occurred.
       ===================================================== */

    OffenceConstants.LOCATION_TYPE = {

        SOURCE:
            "SOURCE",

        TARGET:
            "TARGET"

    };


    /* =====================================================
       5. MAP LAYERS
       ===================================================== */

    OffenceConstants.LAYERS = {

        SOURCE_HEATMAP:
            "offenceSourceHeatmap",

        TARGET_HEATMAP:
            "offenceTargetHeatmap",

        SOURCE_MARKERS:
            "offenceSourceMarkers",

        TARGET_MARKERS:
            "offenceTargetMarkers",

        FLOW_LINES:
            "offenceFlowLines"

    };


    /* =====================================================
       6. DATASETS

       Logical names only.

       Actual Firestore collection names can later
       be mapped by the data loader.
       ===================================================== */

    OffenceConstants.DATASETS = {

        CASES:
            "cases",

        ACCUSED:
            "accused",

        SEIZURES:
            "seizures"

    };


    /* =====================================================
       7. JOIN KEYS

       Used for joining:

       CASE
          ↓
       ACCUSED / SUSPECT
          ↓
       SEIZURE
       ===================================================== */

    OffenceConstants.JOIN_KEYS = {

        CASE_ID:
            "caseId",

        POR_NO:
            "porNo",

        SUSPECT_ID:
            "suspectId",

        SEIZURE_ID:
            "seizureId"

    };


    /* =====================================================
       8. CANONICAL CASE FIELDS
       ===================================================== */

    OffenceConstants.CASE_FIELDS = {

        CASE_ID:
            "caseId",

        POR_NO:
            "porNo",

        CR_NO:
            "crNo",

        RANGE:
            "range",

        OFFENCE_DATE:
            "offenceDate",

        NATURE:
            "natureOfOffence",

        ACT:
            "act",

        SECTION:
            "section",

        ARTICLES_SEIZED:
            "articlesSeized",

        CASE_STATUS:
            "caseStatus",

        VERDICT:
            "verdict",

        SENTENCE:
            "sentence"

    };


    /* =====================================================
       9. CANONICAL ACCUSED FIELDS
       ===================================================== */

    OffenceConstants.ACCUSED_FIELDS = {

        SUSPECT_ID:
            "suspectId",

        NAME:
            "name",

        ALIAS:
            "alias",

        FATHER_NAME:
            "fatherName",

        PERMANENT_ADDRESS:
            "permanentAddress",

        PRESENT_ADDRESS:
            "presentAddress",

        PRIMARY_OCCUPATION:
            "primaryOccupation",

        TOTAL_CASES:
            "totalCases",

        OFFENCE_RECORD:
            "offenceRecord",

        PAST_OFFENCE_HISTORY:
            "pastOffenceHistory",

        PHOTO:
            "photo"

    };


    /* =====================================================
       10. CANONICAL SEIZURE FIELDS
       ===================================================== */

    OffenceConstants.SEIZURE_FIELDS = {

        SEIZURE_ID:
            "seizureId",

        CASE_ID:
            "caseId",

        POR_NO:
            "porNo",

        DATE:
            "seizureDate",

        TIME:
            "seizureTime",

        PLACE:
            "placeOfSeizure",

        REMARKS:
            "remarks"

    };


    /* =====================================================
       11. SOURCE LOCATION FIELDS

       Priority order for locating offender origin.
       ===================================================== */

    OffenceConstants.SOURCE_LOCATION_FIELDS = [

        "presentAddress",

        "permanentAddress"

    ];


    /* =====================================================
       12. TARGET LOCATION FIELDS

       Primary offence location comes from seizure place.
       ===================================================== */

    OffenceConstants.TARGET_LOCATION_FIELDS = [

        "placeOfSeizure"

    ];


    /* =====================================================
       13. CANONICAL LOCATION OBJECT

       Every geocoded source or target should eventually
       follow this structure.

       Example:

       {
           id: "",
           type: "SOURCE",
           name: "",
           rawAddress: "",
           normalizedAddress: "",
           latitude: null,
           longitude: null,
           caseIds: [],
           offenceCount: 0
       }
       ===================================================== */

    OffenceConstants.LOCATION_FIELDS = {

        ID:
            "id",

        TYPE:
            "type",

        NAME:
            "name",

        RAW_ADDRESS:
            "rawAddress",

        NORMALIZED_ADDRESS:
            "normalizedAddress",

        LATITUDE:
            "latitude",

        LONGITUDE:
            "longitude",

        CASE_IDS:
            "caseIds",

        OFFENCE_COUNT:
            "offenceCount"

    };


    /* =====================================================
       14. SOURCE → TARGET FLOW OBJECT

       Represents offender movement / offence linkage.

       SOURCE
          ↓
       TARGET

       One source may connect to many targets.
       One target may receive many sources.
       ===================================================== */

    OffenceConstants.FLOW_FIELDS = {

        ID:
            "id",

        CASE_ID:
            "caseId",

        SOURCE_ID:
            "sourceId",

        TARGET_ID:
            "targetId",

        SOURCE_LAT:
            "sourceLat",

        SOURCE_LNG:
            "sourceLng",

        TARGET_LAT:
            "targetLat",

        TARGET_LNG:
            "targetLng",

        OFFENCE_DATE:
            "offenceDate",

        OFFENCE_TYPE:
            "offenceType"

    };


    /* =====================================================
       15. HEATMAP CONFIGURATION
       ===================================================== */

    OffenceConstants.HEATMAP = {

        SOURCE: {

            ENABLED:
                true,

            RADIUS:
                25,

            BLUR:
                20,

            MAX_ZOOM:
                17

        },

        TARGET: {

            ENABLED:
                true,

            RADIUS:
                30,

            BLUR:
                22,

            MAX_ZOOM:
                17

        }

    };


    /* =====================================================
       16. HEAT WEIGHT

       offenceCount will normally determine intensity.

       Future options:
       - repeat offender score
       - offence severity
       - recent offence weighting
       ===================================================== */

    OffenceConstants.WEIGHT = {

        MIN:
            0.1,

        MAX:
            1,

        DEFAULT:
            0.5

    };


    /* =====================================================
       17. CLICK / CASCADE LEVELS

       Clicking heat areas will progressively reveal
       detailed information.
       ===================================================== */

    OffenceConstants.CASCADE = {

        SOURCE: [

            "LOCATION",

            "ACCUSED",

            "CASES",

            "TARGETS",

            "CASE_DETAIL"

        ],

        TARGET: [

            "LOCATION",

            "CASES",

            "ACCUSED",

            "SOURCES",

            "CASE_DETAIL"

        ]

    };


    /* =====================================================
       18. FILTER TYPES
       ===================================================== */

    OffenceConstants.FILTERS = {

        DATE_FROM:
            "dateFrom",

        DATE_TO:
            "dateTo",

        RANGE:
            "range",

        OFFENCE_TYPE:
            "offenceType",

        ACT:
            "act",

        SECTION:
            "section",

        CASE_STATUS:
            "caseStatus",

        LOCATION_TYPE:
            "locationType"

    };


    /* =====================================================
       19. MAP DISPLAY MODES
       ===================================================== */

    OffenceConstants.MAP_MODE = {

        BOTH:
            "BOTH",

        SOURCE_ONLY:
            "SOURCE_ONLY",

        TARGET_ONLY:
            "TARGET_ONLY",

        FLOW:
            "FLOW"

    };


    /* =====================================================
       20. DEFAULT MAP MODE

       Both SOURCE and TARGET heatmaps visible.
       ===================================================== */

    OffenceConstants.DEFAULT_MAP_MODE =
        OffenceConstants.MAP_MODE.BOTH;


    /* =====================================================
       21. GEOCODING STATUS

       Needed because addresses and seizure places
       initially exist as text.
       ===================================================== */

    OffenceConstants.GEOCODE_STATUS = {

        PENDING:
            "PENDING",

        RESOLVED:
            "RESOLVED",

        FAILED:
            "FAILED",

        MANUAL:
            "MANUAL"

    };


    /* =====================================================
       22. DATA UPDATE STRATEGY

       Offence records can increase every day.

       Incremental mode means we should not rebuild
       the complete historical dataset every refresh.
       ===================================================== */

    OffenceConstants.UPDATE = {

        MODE:
            "INCREMENTAL",

        CASE_ID_DEDUPLICATION:
            true,

        AUTO_REBUILD_HEATMAP:
            true,

        PRESERVE_GEOCODE_CACHE:
            true

    };


    /* =====================================================
       23. CACHE KEYS
       ===================================================== */

    OffenceConstants.CACHE = {

        CASES:
            "offence_cases",

        ACCUSED:
            "offence_accused",

        SEIZURES:
            "offence_seizures",

        SOURCES:
            "offence_sources",

        TARGETS:
            "offence_targets",

        FLOWS:
            "offence_flows",

        GEOCODES:
            "offence_geocodes"

    };


    /* =====================================================
       24. EVENTS

       Other modules can listen to these events.
       ===================================================== */

    OffenceConstants.EVENTS = {

        DATA_LOADED:
            "offence:dataLoaded",

        DATA_UPDATED:
            "offence:dataUpdated",

        HEATMAP_RENDERED:
            "offence:heatmapRendered",

        SOURCE_CLICKED:
            "offence:sourceClicked",

        TARGET_CLICKED:
            "offence:targetClicked",

        CASE_SELECTED:
            "offence:caseSelected",

        FILTER_CHANGED:
            "offence:filterChanged"

    };


    /* =====================================================
       25. DEBUG
       ===================================================== */

    OffenceConstants.DEBUG = {

        ENABLED:
            true,

        LOG_DATA:
            true,

        LOG_GEOCODING:
            true,

        LOG_HEATMAP:
            true,

        LOG_CLICKS:
            true

    };


    /* =====================================================
       26. FREEZE CONSTANTS
       ===================================================== */

    Object.freeze(
        OffenceConstants.LOCATION_TYPE
    );

    Object.freeze(
        OffenceConstants.MAP_MODE
    );

    Object.freeze(
        OffenceConstants.GEOCODE_STATUS
    );


    /* =====================================================
       27. EXPORT
       ===================================================== */

    GG.Offence.Constants =
        OffenceConstants;


    /* =====================================================
       28. READY LOG
       ===================================================== */

    if (
        OffenceConstants.DEBUG.ENABLED
    ) {

        console.log(
            "🔥 OffenceConstants Loaded",
            OffenceConstants
        );

    }


})();
