/* =========================================================
   GreenGuard
   Offence Intelligence Module

   File:
   js/offence/offenceConstants.js

   Purpose:
   - Central configuration for Offence Intelligence
   - Define Firestore collection names
   - Define canonical dataset names
   - Define POR-authoritative relationship keys
   - Define canonical field names
   - Define SOURCE and TARGET location rules
   - Define heatmap configuration
   - Define cascading click hierarchy
   - Define cache keys
   - Define module events
   - Define update and debugging configuration

   AUTHORITATIVE RELATIONSHIP DESIGN:

   POR No / porKey
          │
          ├── offence_cases
          │
          ├── offence_accused
          │       │
          │       └── SOURCE LOCATION
          │
          ├── offence_witnesses
          │
          └── offence_seizures
                  │
                  ├── TARGET LOCATION
                  │
                  └── offence_seized_articles
                          │
                          └── linked by SeizureID

   IMPORTANT:

   POR No is the authoritative cross-collection connector.

   CaseID:
   - May exist
   - May be missing
   - May not match
   - Is secondary metadata

   SeizureID:
   - Authoritative connector between
     offence_seizures and offence_seized_articles.

   This file contains:
   - NO business logic
   - NO Firestore queries
   - NO Leaflet rendering
   - NO heatmap rendering
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
            "2.0.0",

        RELATIONSHIP_MODEL:
            "POR_AUTHORITATIVE"

    };


    /* =====================================================
       4. FIRESTORE COLLECTIONS

       These names MUST match Firestore exactly.
       ===================================================== */

    OffenceConstants.COLLECTIONS = {

        CASES:
            "offence_cases",

        ACCUSED:
            "offence_accused",

        WITNESSES:
            "offence_witnesses",

        SEIZURES:
            "offence_seizures",

        SEIZED_ARTICLES:
            "offence_seized_articles"

    };


    /* =====================================================
       5. LOGICAL DATASETS

       Internal dataset identifiers.

       These are NOT Firestore collection names.
       ===================================================== */

    OffenceConstants.DATASETS = {

        CASES:
            "cases",

        ACCUSED:
            "accused",

        WITNESSES:
            "witnesses",

        SEIZURES:
            "seizures",

        SEIZED_ARTICLES:
            "seizedArticles"

    };


    /* =====================================================
       6. RELATIONSHIP MODEL

       POR is authoritative.

       CASE ID remains secondary.

       SeizureID connects seizure → articles.
       ===================================================== */

    OffenceConstants.RELATIONSHIP = {

        AUTHORITATIVE_KEY:
            "porKey",

        AUTHORITATIVE_RAW_FIELD:
            "porNo",

        CASE_SECONDARY_KEY:
            "caseId",

        SEIZURE_ARTICLE_KEY:
            "seizureId",

        MODEL:
            "POR_AUTHORITATIVE"

    };


    /* =====================================================
       7. JOIN KEYS

       Canonical relationship fields used across modules.
       ===================================================== */

    OffenceConstants.JOIN_KEYS = {

        POR_KEY:
            "porKey",

        POR_NO:
            "porNo",

        REF_POR_NO:
            "refPorNo",

        CASE_ID:
            "caseId",

        ACCUSED_ID:
            "accusedId",

        WITNESS_ID:
            "witnessId",

        SEIZURE_ID:
            "seizureId",

        ARTICLE_ID:
            "articleId"

    };


    /* =====================================================
       8. LOCATION TYPES

       SOURCE:
       Origin/address of accused/offender.

       TARGET:
       Place where offence/seizure occurred.
       ===================================================== */

    OffenceConstants.LOCATION_TYPE = {

        SOURCE:
            "SOURCE",

        TARGET:
            "TARGET"

    };


    /* =====================================================
       9. MAP LAYERS
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
            "offenceFlowLines",

        SOURCE_CLUSTER:
            "offenceSourceCluster",

        TARGET_CLUSTER:
            "offenceTargetCluster"

    };


    /* =====================================================
       10. CANONICAL CASE FIELDS
       ===================================================== */

    OffenceConstants.CASE_FIELDS = {

        CASE_ID:
            "caseId",

        POR_KEY:
            "porKey",

        POR_NO:
            "porNo",

        REF_POR_NO:
            "refPorNo",

        CR_NO:
            "crNo",

        ALTERNATE_CR_NO:
            "alternateCrNo",

        FILLING_NUMBER:
            "fillingNumber",

        RANGE:
            "range",

        COURT:
            "court",

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

        EO_NAME_DESIGNATION:
            "nameAndDesignationOfEO",

        POR_STATUS:
            "porStatus",

        POR_SUBMISSION_DATE:
            "porSubmissionDate",

        CASE_STATUS:
            "caseStatus",

        NEXT_HEARING_DATE:
            "nextHearingDate",

        PURPOSE_OF_HEARING:
            "purposeOfHearing",

        WITNESSES_NEXT_HEARING:
            "witnessesForEvidenceInNextHearingDate",

        VERDICT:
            "verdict",

        SENTENCE:
            "sentence",

        JUDGMENT_PDF:
            "judgmentPdf",

        VERIFICATION_STATUS:
            "verificationStatus",

        MISMATCHES:
            "mismatches",

        CASE_DOCUMENTS_PDF:
            "caseDocumentsPdf",

        EMAIL_STATUS:
            "emailStatus"

    };


    /* =====================================================
       11. CANONICAL ACCUSED FIELDS
       ===================================================== */

    OffenceConstants.ACCUSED_FIELDS = {

        ACCUSED_ID:
            "accusedId",

        POR_KEY:
            "porKey",

        POR_NO:
            "porNo",

        REF_POR_NO:
            "refPorNo",

        CASE_ID:
            "caseId",

        SL_NO:
            "slNo",

        NAME:
            "name",

        AGE:
            "age",

        FATHER_NAME:
            "fatherName",

        ADDRESS:
            "address",

        ADDRESS_OF_ACCUSED:
            "addressOfAccused",

        PRESENT_ADDRESS:
            "presentAddress",

        PERMANENT_ADDRESS:
            "permanentAddress",

        CONTACT_NO:
            "contactNo",

        ALTERNATE_CONTACT_NO:
            "alternateContactNo",

        PAST_OFFENCE_HISTORY:
            "pastOffenceHistory",

        PHOTO:
            "accusedPhoto",

        AADHAAR_CARD:
            "aadhaarCard",

        VOTER_CARD:
            "voterCard",

        DRIVING_LICENCE:
            "drivingLicence",

        PAN_CARD:
            "panCard",

        OTHER_ID:
            "otherId",

        ARREST_STATUS:
            "arrestStatus"

    };


    /* =====================================================
       12. CANONICAL WITNESS FIELDS
       ===================================================== */

    OffenceConstants.WITNESS_FIELDS = {

        WITNESS_ID:
            "witnessId",

        POR_KEY:
            "porKey",

        POR_NO:
            "porNo",

        REF_POR_NO:
            "refPorNo",

        CASE_ID:
            "caseId",

        SL_NO:
            "slNo",

        NAME:
            "name",

        FULL_ADDRESS:
            "fullAddress",

        PRESENT_PLACE_OF_POSTING:
            "presentPlaceOfPosting",

        CONTACT_NO:
            "contactNo",

        PENDING_EVIDENCE_BEFORE_CHARGE:
            "witnessWithPendingEvidenceBeforeCharge",

        PENDING_EVIDENCE_AFTER_CHARGE:
            "witnessWithPendingEvidenceAfterCharge",

        EVIDENCE_COMPLETED:
            "witnessWithEvidenceCompleted",

        EMAIL:
            "email",

        VILLAGE:
            "village",

        STREET_LANE:
            "streetLane",

        POST_OFFICE:
            "postOffice",

        DISTRICT:
            "district",

        PIN_CODE:
            "pinCode"

    };


    /* =====================================================
       13. CANONICAL SEIZURE FIELDS
       ===================================================== */

    OffenceConstants.SEIZURE_FIELDS = {

        SEIZURE_ID:
            "seizureId",

        POR_KEY:
            "porKey",

        POR_NO:
            "porNo",

        REF_POR_NO:
            "refPorNo",

        CASE_ID:
            "caseId",

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
       14. CANONICAL SEIZED ARTICLE FIELDS
       ===================================================== */

    OffenceConstants.SEIZED_ARTICLE_FIELDS = {

        ARTICLE_ID:
            "articleId",

        SEIZURE_ID:
            "seizureId",

        POR_KEY:
            "porKey",

        POR_NO:
            "porNo",

        REF_POR_NO:
            "refPorNo",

        CASE_ID:
            "caseId",

        SL_NO:
            "slNo",

        DESCRIPTION:
            "articleDescription",

        QUANTITY:
            "quantity",

        MEASUREMENT:
            "measurement",

        VOLUME:
            "volume",

        SOURCE:
            "source"

    };


    /* =====================================================
       15. POR FIELD CANDIDATES

       Used by Normalizer/Store when identifying POR values.

       porKey should already be generated by Normalizer,
       but these aliases support imported legacy records.
       ===================================================== */

    OffenceConstants.POR_FIELDS = [

        "porNo",

        "refPorNo",

        "porNumber",

        "refPORNo",

        "PORNo",

        "RefPORNo"

    ];


    /* =====================================================
       16. ID FIELD CANDIDATES
       ===================================================== */

    OffenceConstants.ID_FIELDS = {

        CASES: [

            "caseId",

            "CaseID",

            "id"

        ],

        ACCUSED: [

            "accusedId",

            "AccusedID",

            "id"

        ],

        WITNESSES: [

            "witnessId",

            "WitnessID",

            "id"

        ],

        SEIZURES: [

            "seizureId",

            "SeizureID",

            "id"

        ],

        SEIZED_ARTICLES: [

            "articleId",

            "ArticleID",

            "id"

        ]

    };


    /* =====================================================
       17. SOURCE LOCATION FIELDS

       SOURCE HEATMAP:

       Accused origin / residential address.

       Priority order matters.
       ===================================================== */

    OffenceConstants.SOURCE_LOCATION_FIELDS = [

        "address",

        "addressOfAccused",

        "fullAddress",

        "presentAddress",

        "permanentAddress",

        "village"

    ];


    /* =====================================================
       18. TARGET LOCATION FIELDS

       TARGET HEATMAP:

       Primary target comes from seizure place.
       ===================================================== */

    OffenceConstants.TARGET_LOCATION_FIELDS = [

        "placeOfSeizure",

        "seizurePlace",

        "place",

        "location",

        "address"

    ];


    /* =====================================================
       19. CANONICAL LOCATION OBJECT

       Used by OffenceGeocoder and heatmap modules.

       {
           id,
           type,
           name,
           rawAddress,
           normalizedAddress,
           latitude,
           longitude,
           porKey,
           porNo,
           caseIds,
           offenceCount,
           geocodeStatus
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

        POR_KEY:
            "porKey",

        POR_NO:
            "porNo",

        CASE_IDS:
            "caseIds",

        OFFENCE_COUNT:
            "offenceCount",

        GEOCODE_STATUS:
            "geocodeStatus"

    };


    /* =====================================================
       20. SOURCE → TARGET FLOW OBJECT

       POR-authoritative spatial relationship.

       SOURCE
          │
          │ POR
          ▼
       TARGET

       CaseID is retained as secondary metadata.
       ===================================================== */

    OffenceConstants.FLOW_FIELDS = {

        ID:
            "id",

        POR_KEY:
            "porKey",

        POR_NO:
            "porNo",

        CASE_IDS:
            "caseIds",

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
       21. CASCADE DATA KEYS

       Standard object structure returned from Store /
       Geocoder / Heatmap click pipeline.
       ===================================================== */

    OffenceConstants.CASCADE_FIELDS = {

        POR_KEY:
            "porKey",

        POR_NO:
            "porNo",

        CASE:
            "case",

        CASES:
            "cases",

        CASE_IDS:
            "caseIds",

        ACCUSED:
            "accused",

        WITNESSES:
            "witnesses",

        SEIZURES:
            "seizures",

        SEIZED_ARTICLES:
            "seizedArticles",

        SOURCES:
            "sources",

        TARGETS:
            "targets",

        COUNTS:
            "counts"

    };


    /* =====================================================
       22. CASCADE DISPLAY LEVELS

       Clicking a SOURCE hotspot:

       LOCATION
          ↓
       ACCUSED
          ↓
       POR
          ↓
       CASES
          ↓
       WITNESSES
          ↓
       SEIZURES
          ↓
       SEIZED ARTICLES
          ↓
       TARGETS

       Clicking a TARGET hotspot:

       LOCATION
          ↓
       SEIZURE
          ↓
       SEIZED ARTICLES
          ↓
       POR
          ↓
       CASES
          ↓
       ACCUSED
          ↓
       WITNESSES
          ↓
       SOURCES
       ===================================================== */

    OffenceConstants.CASCADE = {

        SOURCE: [

            "LOCATION",

            "ACCUSED",

            "POR",

            "CASES",

            "WITNESSES",

            "SEIZURES",

            "SEIZED_ARTICLES",

            "TARGETS",

            "CASE_DETAIL"

        ],

        TARGET: [

            "LOCATION",

            "SEIZURE",

            "SEIZED_ARTICLES",

            "POR",

            "CASES",

            "ACCUSED",

            "WITNESSES",

            "SOURCES",

            "CASE_DETAIL"

        ]

    };


    /* =====================================================
       23. HEATMAP CONFIGURATION

       These are display defaults.

       Actual heat intensity should be calculated by the
       heatmap engine.
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
                17,

            MIN_OPACITY:
                0.25

        },

        TARGET: {

            ENABLED:
                true,

            RADIUS:
                30,

            BLUR:
                22,

            MAX_ZOOM:
                17,

            MIN_OPACITY:
                0.25

        }

    };


    /* =====================================================
       24. HEAT WEIGHT CONFIGURATION

       Heatmap engine can use:
       - offence count
       - accused count
       - seizure count
       - repeat offender score
       - recency
       - severity

       Default remains offence-count based.
       ===================================================== */

    OffenceConstants.WEIGHT = {

        MIN:
            0.1,

        MAX:
            1,

        DEFAULT:
            0.5,

        STRATEGY:
            "OFFENCE_COUNT"

    };


    /* =====================================================
       25. AGGREGATION

       Controls how identical/resolved locations are grouped.
       ===================================================== */

    OffenceConstants.AGGREGATION = {

        SOURCE_BY:
            "NORMALIZED_LOCATION",

        TARGET_BY:
            "NORMALIZED_LOCATION",

        MERGE_CASE_IDS:
            true,

        MERGE_POR_KEYS:
            true,

        COUNT_UNIQUE_POR:
            true

    };


    /* =====================================================
       26. FILTER TYPES
       ===================================================== */

    OffenceConstants.FILTERS = {

        DATE_FROM:
            "dateFrom",

        DATE_TO:
            "dateTo",

        RANGE:
            "range",

        POR_NO:
            "porNo",

        POR_KEY:
            "porKey",

        OFFENCE_TYPE:
            "offenceType",

        ACT:
            "act",

        SECTION:
            "section",

        CASE_STATUS:
            "caseStatus",

        ARREST_STATUS:
            "arrestStatus",

        LOCATION_TYPE:
            "locationType"

    };


    /* =====================================================
       27. MAP DISPLAY MODES
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
       28. DEFAULT MAP MODE
       ===================================================== */

    OffenceConstants.DEFAULT_MAP_MODE =
        OffenceConstants
            .MAP_MODE
            .BOTH;


    /* =====================================================
       29. GEOCODING STATUS
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
       30. DATA UPDATE STRATEGY

       POR deduplication is authoritative.

       CaseID deduplication remains available but is not
       used as the primary relationship rule.
       ===================================================== */

    OffenceConstants.UPDATE = {

        MODE:
            "INCREMENTAL",

        POR_DEDUPLICATION:
            true,

        CASE_ID_DEDUPLICATION:
            false,

        SEIZURE_ID_DEDUPLICATION:
            true,

        ARTICLE_ID_DEDUPLICATION:
            true,

        AUTO_REBUILD_HEATMAP:
            true,

        PRESERVE_GEOCODE_CACHE:
            true

    };


    /* =====================================================
       31. CACHE KEYS

       Browser-side cache namespaces.

       These are separate from Firestore collection names.
       ===================================================== */

    OffenceConstants.CACHE = {

        CASES:
            "offence_cache_cases",

        ACCUSED:
            "offence_cache_accused",

        WITNESSES:
            "offence_cache_witnesses",

        SEIZURES:
            "offence_cache_seizures",

        SEIZED_ARTICLES:
            "offence_cache_seized_articles",

        POR_CASCADES:
            "offence_cache_por_cascades",

        SOURCES:
            "offence_cache_sources",

        TARGETS:
            "offence_cache_targets",

        FLOWS:
            "offence_cache_flows",

        GEOCODES:
            "offence_geocodes"

    };


    /* =====================================================
       32. STORE INDEX NAMES

       Standard names for OffenceStore indexes.

       POR indexes are primary.
       ===================================================== */

    OffenceConstants.INDEXES = {

        CASE_BY_ID:
            "caseById",

        CASES_BY_POR:
            "casesByPor",

        ACCUSED_BY_ID:
            "accusedById",

        ACCUSED_BY_POR:
            "accusedByPor",

        WITNESS_BY_ID:
            "witnessById",

        WITNESSES_BY_POR:
            "witnessesByPor",

        SEIZURE_BY_ID:
            "seizureById",

        SEIZURES_BY_POR:
            "seizuresByPor",

        ARTICLE_BY_ID:
            "articleById",

        ARTICLES_BY_POR:
            "articlesByPor",

        ARTICLES_BY_SEIZURE:
            "articlesBySeizure",

        CASCADE_BY_POR:
            "cascadeByPor"

    };


    /* =====================================================
       33. EVENTS

       Modules may listen for these events.
       ===================================================== */

    OffenceConstants.EVENTS = {

        DATA_LOADING:
            "offence:dataLoading",

        DATA_LOADED:
            "offence:dataLoaded",

        DATA_NORMALIZED:
            "offence:dataNormalized",

        STORE_READY:
            "offence:storeReady",

        DATA_UPDATED:
            "offence:dataUpdated",

        GEOCODING_STARTED:
            "offence:geocodingStarted",

        GEOCODING_COMPLETE:
            "offence:geocodingComplete",

        HEATMAP_RENDERED:
            "offence:heatmapRendered",

        SOURCE_CLICKED:
            "offence:sourceClicked",

        TARGET_CLICKED:
            "offence:targetClicked",

        POR_SELECTED:
            "offence:porSelected",

        CASE_SELECTED:
            "offence:caseSelected",

        ACCUSED_SELECTED:
            "offence:accusedSelected",

        WITNESS_SELECTED:
            "offence:witnessSelected",

        SEIZURE_SELECTED:
            "offence:seizureSelected",

        ARTICLE_SELECTED:
            "offence:articleSelected",

        FILTER_CHANGED:
            "offence:filterChanged"

    };


    /* =====================================================
       34. DEBUG
       ===================================================== */

    OffenceConstants.DEBUG = {

        ENABLED:
            true,

        LOG_DATA:
            true,

        LOG_NORMALIZATION:
            true,

        LOG_STORE:
            true,

        LOG_RELATIONSHIPS:
            true,

        LOG_GEOCODING:
            true,

        LOG_HEATMAP:
            true,

        LOG_CLICKS:
            true

    };


    /* =====================================================
       35. FREEZE HELPER
       ===================================================== */

    function freezeObject(
        object
    ) {

        if (
            object &&
            typeof object ===
            "object"
        ) {

            Object.freeze(
                object
            );

        }

    }


    /* =====================================================
       36. FREEZE CONSTANT GROUPS
       ===================================================== */

    freezeObject(
        OffenceConstants.MODULE
    );


    freezeObject(
        OffenceConstants.COLLECTIONS
    );


    freezeObject(
        OffenceConstants.DATASETS
    );


    freezeObject(
        OffenceConstants.RELATIONSHIP
    );


    freezeObject(
        OffenceConstants.JOIN_KEYS
    );


    freezeObject(
        OffenceConstants.LOCATION_TYPE
    );


    freezeObject(
        OffenceConstants.LAYERS
    );


    freezeObject(
        OffenceConstants.CASE_FIELDS
    );


    freezeObject(
        OffenceConstants.ACCUSED_FIELDS
    );


    freezeObject(
        OffenceConstants.WITNESS_FIELDS
    );


    freezeObject(
        OffenceConstants.SEIZURE_FIELDS
    );


    freezeObject(
        OffenceConstants.SEIZED_ARTICLE_FIELDS
    );


    freezeObject(
        OffenceConstants.POR_FIELDS
    );


    freezeObject(
        OffenceConstants.ID_FIELDS
            .CASES
    );


    freezeObject(
        OffenceConstants.ID_FIELDS
            .ACCUSED
    );


    freezeObject(
        OffenceConstants.ID_FIELDS
            .WITNESSES
    );


    freezeObject(
        OffenceConstants.ID_FIELDS
            .SEIZURES
    );


    freezeObject(
        OffenceConstants.ID_FIELDS
            .SEIZED_ARTICLES
    );


    freezeObject(
        OffenceConstants.ID_FIELDS
    );


    freezeObject(
        OffenceConstants.SOURCE_LOCATION_FIELDS
    );


    freezeObject(
        OffenceConstants.TARGET_LOCATION_FIELDS
    );


    freezeObject(
        OffenceConstants.LOCATION_FIELDS
    );


    freezeObject(
        OffenceConstants.FLOW_FIELDS
    );


    freezeObject(
        OffenceConstants.CASCADE_FIELDS
    );


    freezeObject(
        OffenceConstants.CASCADE
            .SOURCE
    );


    freezeObject(
        OffenceConstants.CASCADE
            .TARGET
    );


    freezeObject(
        OffenceConstants.CASCADE
    );


    freezeObject(
        OffenceConstants.HEATMAP
            .SOURCE
    );


    freezeObject(
        OffenceConstants.HEATMAP
            .TARGET
    );


    freezeObject(
        OffenceConstants.HEATMAP
    );


    freezeObject(
        OffenceConstants.WEIGHT
    );


    freezeObject(
        OffenceConstants.AGGREGATION
    );


    freezeObject(
        OffenceConstants.FILTERS
    );


    freezeObject(
        OffenceConstants.MAP_MODE
    );


    freezeObject(
        OffenceConstants.GEOCODE_STATUS
    );


    freezeObject(
        OffenceConstants.UPDATE
    );


    freezeObject(
        OffenceConstants.CACHE
    );


    freezeObject(
        OffenceConstants.INDEXES
    );


    freezeObject(
        OffenceConstants.EVENTS
    );


    freezeObject(
        OffenceConstants.DEBUG
    );


    /* =====================================================
       37. EXPORT

       Do NOT freeze OffenceConstants itself.

       Keeping the root object extensible allows future
       modules to add optional configuration without
       replacing the namespace.
       ===================================================== */

    GG.Offence.Constants =
        OffenceConstants;


    /* =====================================================
       38. READY LOG
       ===================================================== */

    if (
        OffenceConstants.DEBUG
            .ENABLED
    ) {

        console.log(

            "🔥 OffenceConstants Loaded",

            {

                version:

                    OffenceConstants
                        .MODULE
                        .VERSION,

                relationshipModel:

                    OffenceConstants
                        .RELATIONSHIP
                        .MODEL,

                authoritativeKey:

                    OffenceConstants
                        .RELATIONSHIP
                        .AUTHORITATIVE_KEY,

                collections:

                    OffenceConstants
                        .COLLECTIONS

            }

        );

    }


})();
