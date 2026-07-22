/* =========================================================
   GreenGuard AI
   accusedAddressResolver.js

   Purpose:

   Raw accused address
        ↓
   Normalize complete address
        ↓
   Parse PO / PS / PIN / District
        ↓
   Detect GeoJSON/LGD village name ANYWHERE in address
        ↓
   Preserve ALL LGD candidates having that village name
        ↓
   Administrative scoring
        ↓
   Case → target forest range
        ↓
   Forest proximity scoring
        ↓
   Resolve correct Vill_LGD
        ↓
   Confidence / evidence / audit

   Important design rule:

   Example:

   Lohar Line, Salbari T.G.,
   PS Kalchini, Alipurduar

   SALBARI is detected even though the complete settlement
   is not exactly "Salbari".

   If several GeoJSON villages are called Salbari,
   ALL Salbari LGDs remain candidates.

   The resolver then uses:

   PIN
   District
   PS
   PO
   Block
   target forest range
   village → forest distance

   to determine which Salbari is intended.

   Dependencies:

   - GreenGuardAI.Offence.Store
   - window.__villageBoundaryCache
   - window.__villageBoundaryGeoJSON
   - window.allGISFeatures
   - window.allCompartmentFeatures
   - turf

========================================================= */

(function (global) {

    "use strict";


    /* =====================================================
       NAMESPACE
    ===================================================== */

    const GG =
        global.GreenGuardAI =
        global.GreenGuardAI || {};


    const Resolver = {};


    /* =====================================================
       VERSION
    ===================================================== */

    Resolver.VERSION =
        "1.1.0";


    /* =====================================================
       SCORING CONFIGURATION
    ===================================================== */

    Resolver.SCORE = {

        /*
         * Village-name evidence
         */

        EXACT_NAME: 100,

        ALIAS: 90,

        ADDRESS_VILLAGE_NAME: 90,

        ADDRESS_VILLAGE_ALIAS: 80,

        PREFIX_LOCALITY: 70,


        /*
         * Administrative evidence
         */

        PIN: 80,

        DISTRICT: 60,

        PS: 55,

        PO: 45,

        BLOCK: 35,


        /*
         * Existing forest metadata
         */

        FOREST_RANGE_METADATA: 35,

        FOREST_BEAT_METADATA: 45,

        FOREST_COMPARTMENT_METADATA: 55,


        /*
         * Spatial relationship to offence target range
         */

        SPATIAL_VERY_NEAR: 35,   // <= 5 km

        SPATIAL_NEAR: 25,        // <= 15 km

        SPATIAL_MODERATE: 15,    // <= 30 km

        SPATIAL_FAR: 5,          // <= 60 km


        /*
         * Contradictions
         */

        WRONG_PIN: -120,

        WRONG_DISTRICT: -90,

        WRONG_PS: -40

    };


    /* =====================================================
       NORMALIZATION
    ===================================================== */

    Resolver.normalize = function (
        value
    ) {

        return String(
            value || ""
        )

            .normalize(
                "NFKD"
            )

            .replace(
                /[\u0300-\u036f]/g,
                ""
            )

            .toUpperCase()


            /* ---------------------------------------------
               District spelling normalization
            --------------------------------------------- */

            .replace(
                /COOCHBEHER/g,
                "COOCH BEHAR"
            )

            .replace(
                /COOCHBIHAR/g,
                "COOCH BEHAR"
            )

            .replace(
                /COOCHBEHAR/g,
                "COOCH BEHAR"
            )

            .replace(
                /KOCHBIHAR/g,
                "COOCH BEHAR"
            )

            .replace(
                /KOCH BIHAR/g,
                "COOCH BEHAR"
            )

            .replace(
                /ALIFURDUAR/g,
                "ALIPURDUAR"
            )


            /* ---------------------------------------------
               Common locality abbreviations
            --------------------------------------------- */

            .replace(
                /\bT\.?\s*G\.?\b/g,
                " TEA GARDEN "
            )

            .replace(
                /\bTEA\s+GARDEN\b/g,
                " TEA GARDEN "
            )

            .replace(
                /\bF\.?\s*V\.?\b/g,
                " FOREST VILLAGE "
            )


            /* ---------------------------------------------
               General cleanup
            --------------------------------------------- */

            .replace(
                /[^A-Z0-9]+/g,
                " "
            )

            .replace(
                /\s+/g,
                " "
            )

            .trim();

    };


    /* =====================================================
       NORMALIZED EQUALITY
    ===================================================== */

    Resolver.same = function (
        a,
        b
    ) {

        const A =
            Resolver.normalize(
                a
            );

        const B =
            Resolver.normalize(
                b
            );


        return (
            !!A &&
            !!B &&
            A === B
        );

    };


    /* =====================================================
       NORMALIZED PHRASE MATCH

       Prevents:

       SALBARI

       from accidentally matching:

       UTTARSALBARI

       because matching happens on normalized word
       boundaries.
    ===================================================== */

    Resolver.containsPhrase = function (
        haystack,
        needle
    ) {

        const H =
            Resolver.normalize(
                haystack
            );

        const N =
            Resolver.normalize(
                needle
            );


        if (
            !H ||
            !N
        ) {

            return false;

        }


        return (

            (
                " " +
                H +
                " "
            )

                .includes(

                    " " +
                    N +
                    " "

                )

        );

    };


    /* =====================================================
       ADDRESS PARSER
    ===================================================== */

/* =========================================================
   ACCUSED ADDRESS PARSER
   =========================================================

   DESIGN RULE

   1. Explicit administrative fields are extracted:
        PO
        PS
        DISTRICT
        BLOCK
        PIN

   2. Those exact occurrences are REMOVED from village
      candidate-generating text.

   3. Everything remaining unlabelled stays available for
      village-name matching.

   EXAMPLE A

       Salbari, PO-Malbazar

       candidateSegments:
           ["Salbari"]

       po:
           "Malbazar"


   EXAMPLE B

       Malbazar, PO-Salbari

       candidateSegments:
           ["Malbazar"]

       po:
           "Salbari"


   EXAMPLE C

       Lohar Line,
       Salbari T.G.,
       Kalchini,
       Alipurduar

       candidateSegments:
           [
               "Lohar Line",
               "Salbari T.G.",
               "Kalchini",
               "Alipurduar"
           ]

       All four are SEARCHABLE.

       Only names actually matching the village index
       become village candidates.


   EXAMPLE D

       Lohar Line,
       Salbari T.G.,
       PS-Kalchini,
       Dist-Alipurduar

       candidateSegments:
           [
               "Lohar Line",
               "Salbari T.G."
           ]

       ps:
           Kalchini

       district:
           Alipurduar

       Kalchini and Alipurduar CANNOT create village
       candidates from those labelled occurrences.

========================================================= */

Resolver.parseAddress = function (
    address
) {

    const raw =
        String(
            address || ""
        )
        .replace(/\r?\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();


    const result = {

        raw,

        /* ---------------------------------------------
           Candidate-generating information
        --------------------------------------------- */

        settlement:
            "",

        locality:
            "",

        candidateText:
            "",

        candidateSegments:
            [],

        unclassifiedSegments:
            [],


        /* ---------------------------------------------
           Administrative evidence

           NEVER independently generate village
           candidates from these fields.
        --------------------------------------------- */

        po:
            "",

        ps:
            "",

        district:
            "",

        block:
            "",

        pin:
            "",


        /* ---------------------------------------------
           Diagnostics
        --------------------------------------------- */

        administrativeText:
            [],

        excludedSegments:
            []

    };


    if (!raw) {

        return result;

    }


    /* =================================================
       HELPERS
    ================================================= */

    function clean(
        value
    ) {

        return String(
            value || ""
        )

        .replace(
            /^[\s,;:.+\-–—/]+/,
            ""
        )

        .replace(
            /[\s,;:.+\-–—/]+$/,
            ""
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();

    }


    function saveAdmin(
        field,
        value,
        source
    ) {

        const cleaned =
            clean(
                value
            );


        if (!cleaned) {

            return;

        }


        /*
         * Keep first explicit value.
         */

        if (
            !result[field]
        ) {

            result[field] =
                cleaned;

        }


        result
            .administrativeText
            .push({

                field:
                    field,

                value:
                    cleaned,

                source:
                    String(
                        source || ""
                    )
                    .trim()

            });


        result
            .excludedSegments
            .push(
                cleaned
            );

    }


    /* =================================================
       PRE-NORMALIZATION
    ================================================= */

    let working =
        raw

        .replace(
            /[;|]+/g,
            ","
        )

        /*
         * Standardize VILL labels.

         * IMPORTANT:
         * We remove the LABEL only.
         * Its value remains searchable.
         */

        .replace(
            /\b(?:VILLAGE|VILL\.?|VIL\.?)\s*(?:[:=+\-/]+\s*)?/gi,
            ""
        );


    /* =================================================
       ADMINISTRATIVE LABEL DEFINITIONS
    ================================================= */

    const adminLabelPattern =

        "(?:" +

            "P\\.?\\s*O\\.?" +

            "|" +

            "POST\\s+OFFICE" +

            "|" +

            "P\\.?\\s*S\\.?" +

            "|" +

            "POLICE\\s+STATION" +

            "|" +

            "DISTRICT" +

            "|" +

            "DIST\\.?" +

            "|" +

            "DT\\.?" +

            "|" +

            "BLOCK" +

            "|" +

            "BLK\\.?" +

        ")";


    /* =================================================
       EXTRACT EXPLICIT ADMINISTRATIVE FIELDS

       This works even when fields are not separated
       cleanly by commas:

       Atiabari P.O-Salbari P.S-Kalchini Dist-Alipurduar
    ================================================= */

    const adminRegex =
        new RegExp(

            "(" +

                "P\\.?\\s*O\\.?" +

                "|" +

                "POST\\s+OFFICE" +

                "|" +

                "P\\.?\\s*S\\.?" +

                "|" +

                "POLICE\\s+STATION" +

                "|" +

                "DISTRICT" +

                "|" +

                "DIST\\.?" +

                "|" +

                "DT\\.?" +

                "|" +

                "BLOCK" +

                "|" +

                "BLK\\.?" +

            ")" +

            "\\s*" +

            "(?:[:=+\\-/]+\\s*)?" +

            "(.+?)" +

            "(?=" +

                "\\s*,?\\s*" +

                adminLabelPattern +

                "|" +

                "," +

                "|" +

                "$" +

            ")",

            "gi"

        );


    working =
        working.replace(

            adminRegex,

            function (
                full,
                label,
                value
            ) {

                const normalizedLabel =
                    String(
                        label || ""
                    )
                    .toUpperCase()
                    .replace(
                        /[^A-Z]/g,
                        ""
                    );


                let field =
                    "";


                if (
                    normalizedLabel === "PO" ||
                    normalizedLabel === "POSTOFFICE"
                ) {

                    field =
                        "po";

                }

                else if (
                    normalizedLabel === "PS" ||
                    normalizedLabel ===
                        "POLICESTATION"
                ) {

                    field =
                        "ps";

                }

                else if (
                    normalizedLabel ===
                        "DISTRICT" ||
                    normalizedLabel ===
                        "DIST" ||
                    normalizedLabel ===
                        "DT"
                ) {

                    field =
                        "district";

                }

                else if (
                    normalizedLabel ===
                        "BLOCK" ||
                    normalizedLabel ===
                        "BLK"
                ) {

                    field =
                        "block";

                }


                if (field) {

                    saveAdmin(
                        field,
                        value,
                        full
                    );

                }


                /*
                 * Remove the complete labelled
                 * occurrence from candidate text.
                 */

                return ",";

            }

        );


    /* =================================================
       EXTRACT PIN

       Six-digit Indian PIN is administrative evidence.
       It cannot become village candidate text.
    ================================================= */

    working =
        working.replace(

            /\b([1-9][0-9]{5})\b/g,

            function (
                full,
                pin
            ) {

                if (
                    !result.pin
                ) {

                    result.pin =
                        pin;

                }


                result
                    .administrativeText
                    .push({

                        field:
                            "pin",

                        value:
                            pin,

                        source:
                            full

                    });


                result
                    .excludedSegments
                    .push(
                        pin
                    );


                return ",";

            }

        );


    /* =================================================
       CLEAN REMAINING TEXT
    ================================================= */

    working =
        working

        .replace(
            /,+/g,
            ","
        )

        .replace(
            /\s*,\s*/g,
            ","
        )

        .replace(
            /^,+|,+$/g,
            ""
        )

        .replace(
            /\s+/g,
            " "
        )

        .trim();


    /* =================================================
       REMAINING UNLABELLED SEGMENTS

       THESE ARE THE ONLY SEGMENTS ALLOWED TO CREATE
       VILLAGE CANDIDATES.
    ================================================= */

    const segments =
        working

        .split(",")

        .map(
            clean
        )

        .filter(Boolean);


    result.candidateSegments =
        segments.slice();


    result.unclassifiedSegments =
        segments.slice();


    /*
     * Preserve combined representation for existing
     * resolver functions.
     */

    result.candidateText =
        segments.join(
            ", "
        );


    result.settlement =
        result.candidateText;


    return result;

};


    /* =====================================================
       DATA ACCESS
    ===================================================== */

    Resolver.getVillages = function () {

        return Array.isArray(
            global.__villageBoundaryCache
        )

            ? global.__villageBoundaryCache

            : [];

    };


    Resolver.getVillageGeoJSON = function () {

        return (

            global.__villageBoundaryGeoJSON ||

            null

        );

    };


    Resolver.getCases = function () {

        return (

            GG?.Offence
                ?.Store
                ?.data
                ?.cases ||

            []

        );

    };


    Resolver.getAccused = function () {

        return (

            GG?.Offence
                ?.Store
                ?.data
                ?.accused ||

            []

        );

    };

     /* =====================================================
       VILLAGE INDEXES

       Creates:

       byName
       byCode
       byPIN
       byDistrict
       byPS
       byPO
       byBlock

       IMPORTANT:

       byName is a MULTI-MAP.

       Therefore:

       SALBARI
           ↓
       [
           Salbari LGD-A,
           Salbari LGD-B,
           Salbari LGD-C
       ]

       We deliberately DO NOT collapse duplicate village
       names here.

    ===================================================== */

    Resolver.index = null;


/* =========================================================
   BUILD VILLAGE / ADMINISTRATIVE INDEXES
   =========================================================

   PRODUCTION DESIGN
   ---------------------------------------------------------

   A place-name can legitimately occur at multiple levels.

   Example:
       ALIPURDUAR

   It may appear as:
       village/settlement name
       PO
       PS
       block
       subdivision
       district

   Therefore:

       NEVER blacklist a word because it is also
       an administrative name.

   Instead maintain STRICTLY SEPARATE indexes.

   ---------------------------------------------------------

   byName
       ONLY actual village/settlement names
       + cleanName
       + genuine aliases

   byDistrict
       district evidence

   byBlock
       block evidence

   bySubdivision
       subdivision evidence

   bySubdistrictLGD
       subdistrict LGD evidence

   byPS
       police-station evidence

   byPO
       post-office evidence

   byPIN
       PIN evidence

   Forest metadata is also separately indexed.

   ---------------------------------------------------------

   CRITICAL:

   searchTokens MUST NOT enter byName.

   Otherwise:

       JALPAIGURI

   could return hundreds of villages merely because
   those villages are situated in Jalpaiguri district.

   ========================================================= */

/* =========================================================
   BUILD VILLAGE INDEXES
   =========================================================

   DESIGN RULE

   VILLAGE IDENTITY:
       name
       cleanName
       aliases[]

   ADMINISTRATIVE EVIDENCE:
       district
       block
       subdivision
       policeStation
       postOffice
       pinCode

   ABSOLUTELY NEVER:
       searchTokens[] -> byName

   Because searchTokens contains:
       village
       LGD
       block
       district
       state
       country

   Therefore using searchTokens for byName would make:

       JALPAIGURI -> hundreds of villages
       ALIPURDUAR -> hundreds of villages
       KALCHINI   -> entire block

   which is incorrect.

   ========================================================= */

Resolver.buildIndexes = function (
    force = false
) {

    /* =====================================================
       RETURN EXISTING INDEX
       ===================================================== */

    if (
        Resolver.index &&
        !force
    ) {

        return Resolver.index;

    }


    /* =====================================================
       GET CANONICAL VILLAGES
       ===================================================== */

    const villages =
        Resolver.getVillages() || [];


    /* =====================================================
       CREATE CLEAN INDEX OBJECT
       ===================================================== */

    const index = {

        /* -----------------------------------------------
           VILLAGE IDENTITY
           ----------------------------------------------- */

        byName:
            new Map(),

        byCode:
            new Map(),


        /* -----------------------------------------------
           ADMINISTRATIVE HIERARCHY
           ----------------------------------------------- */

        byDistrict:
            new Map(),

        byBlock:
            new Map(),

        bySubdivision:
            new Map(),

        byPS:
            new Map(),

        byPO:
            new Map(),

        byPIN:
            new Map(),


        /* -----------------------------------------------
           OPTIONAL GOVERNMENT CODES
           ----------------------------------------------- */

        byDistrictLGD:
            new Map(),

        bySubdistrictLGD:
            new Map(),


        /* -----------------------------------------------
           STATS
           ----------------------------------------------- */

        stats: {

            villages:
                0,

            names:
                0,

            aliases:
                0,

            codes:
                0,

            districts:
                0,

            blocks:
                0,

            subdivisions:
                0,

            policeStations:
                0,

            postOffices:
                0,

            pins:
                0

        }

    };


    /* =====================================================
       HELPERS
       ===================================================== */

    function safeString(
        value
    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }


        return String(
            value
        ).trim();

    }


    function normalize(
        value
    ) {

        const raw =
            safeString(
                value
            );


        if (!raw) {

            return "";

        }


        return Resolver.normalize(
            raw
        );

    }


    /* =====================================================
       ADD UNIQUE RECORD TO MULTI-MAP
       ===================================================== */

    function addToMultiMap(
        map,
        rawKey,
        village
    ) {

        if (
            !(map instanceof Map) ||
            !village
        ) {

            return false;

        }


        const key =
            normalize(
                rawKey
            );


        if (!key) {

            return false;

        }


        let bucket =
            map.get(
                key
            );


        if (!bucket) {

            bucket = [];

            map.set(
                key,
                bucket
            );

        }


        /*
         * Deduplicate by villageCode first.
         *
         * If code unavailable, fall back to canonical ID.
         */

        const villageCode =
            safeString(
                village.villageCode ||
                village.Vill_LGD
            );


        const canonicalId =
            safeString(
                village.canonicalId ||
                village.id
            );


        const exists =
            bucket.some(

                existing => {

                    const existingCode =
                        safeString(
                            existing.villageCode ||
                            existing.Vill_LGD
                        );


                    const existingId =
                        safeString(
                            existing.canonicalId ||
                            existing.id
                        );


                    if (
                        villageCode &&
                        existingCode
                    ) {

                        return (
                            villageCode ===
                            existingCode
                        );

                    }


                    if (
                        canonicalId &&
                        existingId
                    ) {

                        return (
                            canonicalId ===
                            existingId
                        );

                    }


                    return (
                        existing ===
                        village
                    );

                }

            );


        if (exists) {

            return false;

        }


        bucket.push(
            village
        );


        return true;

    }


    /* =====================================================
       ADD SINGLE CODE LOOKUP
       ===================================================== */

    function addCode(
        map,
        rawCode,
        village
    ) {

        const code =
            safeString(
                rawCode
            );


        if (
            !code ||
            !village
        ) {

            return false;

        }


        /*
         * LGD codes must not be passed through normal
         * place-name normalization.
         */

        const key =
            code
                .toUpperCase()
                .replace(
                    /\s+/g,
                    ""
                );


        if (!key) {

            return false;

        }


        if (
            !map.has(
                key
            )
        ) {

            map.set(
                key,
                village
            );

            return true;

        }


        return false;

    }


    /* =====================================================
       ADD VILLAGE NAME

       CRITICAL:
       ONLY actual village identity enters byName.
       ===================================================== */

    function addVillageName(
        rawName,
        village,
        source
    ) {

        const name =
            safeString(
                rawName
            );


        if (!name) {

            return false;

        }


        const key =
            normalize(
                name
            );


        if (!key) {

            return false;

        }


        /*
         * No district/block/PS/PO logic here.
         *
         * If a village genuinely has the same name as
         * a district or block, that is perfectly valid.
         *
         * Example:
         *
         *     village.name = "Kalchini"
         *
         * Then:
         *
         *     byName["KALCHINI"]
         *
         * is valid.
         *
         * We determine validity from SOURCE FIELD,
         * not from the word itself.
         */


        const added =
            addToMultiMap(
                index.byName,
                key,
                village
            );


        if (added) {

            index.stats.names++;

            if (
                source ===
                "ALIAS"
            ) {

                index.stats.aliases++;

            }

        }


        return added;

    }


    /* =====================================================
       BUILD INDEX
       ===================================================== */

    for (
        const village
        of villages
    ) {

        if (!village) {

            continue;

        }


        index.stats.villages++;


        /* =================================================
           1. VILLAGE IDENTITY
           ================================================= */


        /* -------------------------------------------------
           CANONICAL NAME

           Actual canonical structure:
               village.name
           ------------------------------------------------- */

        const villageName =
            safeString(
                village.name
            );


        if (villageName) {

            addVillageName(
                villageName,
                village,
                "NAME"
            );

        }


        /* -------------------------------------------------
           CLEAN NAME

           Actual canonical structure:
               village.cleanName

           Usually normalized form of name.
           Safe because it is explicitly a village field.
           ------------------------------------------------- */

        const cleanName =
            safeString(
                village.cleanName
            );


        if (
            cleanName &&
            normalize(cleanName) !==
            normalize(villageName)
        ) {

            addVillageName(
                cleanName,
                village,
                "CLEAN_NAME"
            );

        }


        /* -------------------------------------------------
           GENUINE VILLAGE ALIASES ONLY
           ------------------------------------------------- */

        const aliases =
            Array.isArray(
                village.aliases
            )
                ? village.aliases
                : [];


        for (
            const alias
            of aliases
        ) {

            const aliasText =
                safeString(
                    alias
                );


            if (!aliasText) {

                continue;

            }


            addVillageName(
                aliasText,
                village,
                "ALIAS"
            );

        }


        /* =================================================
           IMPORTANT — SEARCH TOKENS ARE NOT VILLAGE NAMES

           DO NOT ADD:

               village.searchTokens

           to byName.

           searchTokens can contain:

               village name
               clean name
               village code
               block
               district
               state
               country

           Therefore this intentionally does NOTHING:

               village.searchTokens

           ================================================= */


        /* =================================================
           2. VILLAGE LGD CODE
           ================================================= */

        const villageCode =
            safeString(

                village.villageCode ||

                village.Vill_LGD ||

                village.villageLGD ||

                ""

            );


        if (villageCode) {

            if (
                addCode(
                    index.byCode,
                    villageCode,
                    village
                )
            ) {

                index.stats.codes++;

            }

        }


        /* =================================================
           3. DISTRICT
           ================================================= */

        const district =
            safeString(
                village.district
            );


        if (district) {

            addToMultiMap(
                index.byDistrict,
                district,
                village
            );

        }


        /* =================================================
           4. BLOCK / SUBDISTRICT
           ================================================= */

        const block =
            safeString(
                village.block
            );


        if (block) {

            addToMultiMap(
                index.byBlock,
                block,
                village
            );

        }


        /*
         * subdivision is separate if available.
         */

        const subdivision =
            safeString(
                village.subdivision
            );


        if (subdivision) {

            addToMultiMap(
                index.bySubdivision,
                subdivision,
                village
            );

        }


        /* =================================================
           5. POLICE STATION
           ================================================= */

        const policeStation =
            safeString(

                village.policeStation ||

                village.ps ||

                ""

            );


        if (policeStation) {

            addToMultiMap(
                index.byPS,
                policeStation,
                village
            );

        }


        /* =================================================
           6. POST OFFICE
           ================================================= */

        const postOffice =
            safeString(

                village.postOffice ||

                village.po ||

                ""

            );


        if (postOffice) {

            addToMultiMap(
                index.byPO,
                postOffice,
                village
            );

        }


        /* =================================================
           7. PIN CODE
           ================================================= */

        const pinCode =
            safeString(

                village.pinCode ||

                village.pincode ||

                village.pin ||

                ""

            );


        if (pinCode) {

            /*
             * PIN should remain a literal numeric key.
             */

            const pinKey =
                pinCode.replace(
                    /\D/g,
                    ""
                );


            if (pinKey) {

                addToMultiMap(
                    index.byPIN,
                    pinKey,
                    village
                );

            }

        }


        /* =================================================
           8. DISTRICT LGD
           ================================================= */

        const districtLGD =
            safeString(
                village.districtLGD
            );


        if (districtLGD) {

            addToMultiMap(
                index.byDistrictLGD,
                districtLGD,
                village
            );

        }


        /* =================================================
           9. SUBDISTRICT LGD
           ================================================= */

        const subdistrictLGD =
            safeString(
                village.subdistrictLGD
            );


        if (subdistrictLGD) {

            addToMultiMap(
                index.bySubdistrictLGD,
                subdistrictLGD,
                village
            );

        }

    }


    /* =====================================================
       CALCULATE UNIQUE ADMINISTRATIVE COUNTS
       ===================================================== */

    index.stats.districts =
        index.byDistrict.size;


    index.stats.blocks =
        index.byBlock.size;


    index.stats.subdivisions =
        index.bySubdivision.size;


    index.stats.policeStations =
        index.byPS.size;


    index.stats.postOffices =
        index.byPO.size;


    index.stats.pins =
        index.byPIN.size;


    /*
     * Actual number of unique normalized village-name keys.
     */

    index.stats.nameKeys =
        index.byName.size;


    index.stats.codeKeys =
        index.byCode.size;


    /* =====================================================
       REGISTER INDEX
       ===================================================== */

    Resolver.index =
        index;


    /* =====================================================
       PRODUCTION DIAGNOSTIC
       ===================================================== */

    console.log(
        "🏡 AccusedAddressResolver STRICT village indexes built",
        {

            villages:
                index.stats.villages,

            nameKeys:
                index.byName.size,

            nameEntries:
                index.stats.names,

            aliases:
                index.stats.aliases,

            codes:
                index.byCode.size,

            districts:
                index.byDistrict.size,

            blocks:
                index.byBlock.size,

            subdivisions:
                index.bySubdivision.size,

            policeStations:
                index.byPS.size,

            postOffices:
                index.byPO.size,

            pins:
                index.byPIN.size

        }
    );


    return index;

};

    /* =====================================================
       GET VILLAGE BY LGD
    ===================================================== */

    Resolver.getVillageByCode = function (
        code
    ) {

        if (!Resolver.index) {

            Resolver.buildIndexes();

        }


        return (

            Resolver.index
                .byCode
                .get(
                    String(
                        code || ""
                    )
                ) ||

            null

        );

    };


    /* =====================================================
       GET ALL VILLAGES HAVING SAME NAME

       Example:

       getVillagesByName("Salbari")

       may return:

       [
           LGD-A,
           LGD-B,
           LGD-C
       ]

    ===================================================== */

    Resolver.getVillagesByName = function (
        name
    ) {

        if (!Resolver.index) {

            Resolver.buildIndexes();

        }


        const key =
            Resolver.normalize(
                name
            );


        return (

            Resolver.index
                .byName
                .get(
                    key
                ) ||

            []

        );

    };


    /* =====================================================
       VERIFIED ADDRESS RESOLUTIONS

       These are authoritative contextual mappings that we
       already established manually.

       IMPORTANT:

       Never create:

           SALBARI = LGD X

       globally.

       The key must contain context whenever duplicate village
       names exist.

    ===================================================== */

    Resolver.VERIFIED = [

        /* -------------------------------------------------
           PANBARI
           PS Samuktala
           District Alipurduar
        ------------------------------------------------- */

        {
            village:
                "Panbari",

            ps:
                "Samuktala",

            district:
                "Alipurduar",

            villageCode:
                "307313",

            confidence:
                "VERIFIED"
        },


        /* -------------------------------------------------
           NATAbari
           PS Tufanganj
        ------------------------------------------------- */

        {
            village:
                "Natabari",

            ps:
                "Tufanganj",

            district:
                "Cooch Behar",

            villageCode:
                "308332",

            confidence:
                "VERIFIED"
        },


        /* -------------------------------------------------
           PANAGURI
           PS Dinhata
        ------------------------------------------------- */

        {
            village:
                "Panaguri",

            ps:
                "Dinhata",

            district:
                "Cooch Behar",

            villageCode:
                "308494",

            confidence:
                "VERIFIED"
        },


        /* -------------------------------------------------
           RANGAMATI F.V.

           Manually resolved earlier as:

           Rangamati Tea Garden
           LGD 307131
           PS Kalchini
           District Alipurduar
        ------------------------------------------------- */

        {
            village:
                "Rangamati",

            aliases: [
                "Rangamati F V",
                "Rangamati Forest Village",
                "Rangamati Tea Garden"
            ],

            ps:
                "Kalchini",

            district:
                "Alipurduar",

            villageCode:
                "307131",

            confidence:
                "VERIFIED"
        }

    ];


    /* =====================================================
       FIND VERIFIED RESOLUTION

       A verified mapping is applied only when the contextual
       evidence agrees.

    ===================================================== */

    Resolver.findVerifiedResolution = function (
        parsed,
        matchedVillageName
    ) {

        const villageName =
            Resolver.normalize(
                matchedVillageName
            );


        if (!villageName)
            return null;


        for (
            const rule
            of Resolver.VERIFIED
        ) {

            const names = [

                rule.village,

                ...(
                    Array.isArray(
                        rule.aliases
                    )
                        ? rule.aliases
                        : []
                )

            ]
                .map(
                    Resolver.normalize
                )
                .filter(Boolean);


            if (
                !names.includes(
                    villageName
                )
            ) {

                continue;

            }


            /*
             * PS must agree if both are available.
             */

            if (
                rule.ps &&
                parsed.ps &&
                !Resolver.same(
                    rule.ps,
                    parsed.ps
                )
            ) {

                continue;

            }


            /*
             * District must agree if both are available.
             */

            if (
                rule.district &&
                parsed.district &&
                !Resolver.same(
                    rule.district,
                    parsed.district
                )
            ) {

                continue;

            }


            return rule;

        }


        return null;

    };


    /* =====================================================
       POR NORMALIZATION
    ===================================================== */

    Resolver.normalizePor = function (
        value
    ) {

        return String(
            value || ""
        )

            .toUpperCase()

            .replace(
                /\s+/g,
                ""
            )

            .replace(
                /[^A-Z0-9/.-]/g,
                ""
            )

            .trim();

    };


    /* =====================================================
       CASE INDEX
    ===================================================== */

    Resolver.caseIndex =
        null;


    Resolver.buildCaseIndex = function () {

        const cases =
            Resolver.getCases();


        const map =
            new Map();


        for (
            const caseRecord
            of cases
        ) {

            if (!caseRecord)
                continue;


            const values = [

                caseRecord.porKey,

                caseRecord.porNo,

                caseRecord.refPorNo,

                caseRecord.normalizedPor

            ];


            for (
                const value
                of values
            ) {

                const key =
                    Resolver.normalizePor(
                        value
                    );


                if (!key)
                    continue;


                if (
                    !map.has(
                        key
                    )
                ) {

                    map.set(
                        key,
                        caseRecord
                    );

                }

            }

        }


        Resolver.caseIndex =
            map;


        return map;

    };


    /* =====================================================
       GET CASE FOR ACCUSED
    ===================================================== */

    Resolver.getCaseForAccused = function (
        accused
    ) {

        if (!Resolver.caseIndex) {

            Resolver.buildCaseIndex();

        }


        const values = [

            accused?.porKey,

            accused?.porNo,

            accused?.refPorNo,

            accused?.sourceRefPorNo,

            accused?.normalizedPor

        ];


        for (
            const value
            of values
        ) {

            const key =
                Resolver.normalizePor(
                    value
                );


            if (!key)
                continue;


            const found =
                Resolver.caseIndex
                    .get(
                        key
                    );


            if (found) {

                return found;

            }

        }


        /*
         * Secondary caseId lookup.
         */

        const caseId =
            String(
                accused?.caseId ||
                accused?.sourceCaseId ||
                ""
            )
                .trim();


        if (caseId) {

            const cases =
                Resolver.getCases();


            const found =
                cases.find(
                    x =>
                        String(
                            x?.caseId ||
                            x?.id ||
                            x?.documentId ||
                            ""
                        ) === caseId
                );


            if (found) {

                return found;

            }

        }


        return null;

    };


/* =========================================================
   ACCUSED ADDRESS RESOLVER
   GENERATE CANDIDATES
   =========================================================

   DESIGN
   ------

   1. Explicit administrative fields are NOT village
      candidates from that labelled occurrence.

      Example:

          Salbari, PO-Malbazar, PS-Kalchini,
          Dist-Alipurduar

      Village search:
          Salbari

      Evidence:
          PO       = Malbazar
          PS       = Kalchini
          District = Alipurduar


   2. Unlabelled address components CAN be village
      candidates if they match the village/LGD database.

      Example:

          Salbari, Malbazar, Jalpaiguri

      If all exist in village database:

          candidate position 0 = Salbari
          candidate position 1 = Malbazar
          candidate position 2 = Jalpaiguri


   3. First genuine village-name match has positional
      priority.

      Example:

          Salbari, Malbazar, Jalpaiguri

      With no stronger labelled administrative evidence:

          SALBARI is the primary village-name candidate.


   4. Non-matching locality text before the first actual
      village match becomes locality.

      Example:

          Lohar Line, Salbari T.G.,
          PS-Kalchini, Dist-Alipurduar

      Interpretation:

          locality            = Lohar Line
          settlement          = Salbari T.G.
          village name        = Salbari
          PS                  = Kalchini
          district            = Alipurduar


   5. Settlement qualifiers are normalized for lookup.

          Salbari T.G.       -> Salbari
          Salbari T.E.       -> Salbari
          Salbari Tea Garden -> Salbari
          Rangamati F.V.     -> Rangamati
          Rangamati Forest Village -> Rangamati


   6. Parenthetical locality is separated.

          Salbari (Neech Line)

      becomes:

          village lookup = Salbari
          locality       = Neech Line


   7. If one segment contains locality + known village:

          Lohar Line Salbari T.G.

      known village phrase SALBARI may still be detected.


   8. NO arbitrary substring explosion.

      We do NOT generate hundreds of combinations.


   9. Duplicate village names remain separate LGDs.

      Example:

          SALBARI LGD A
          SALBARI LGD B
          SALBARI LGD C

      All survive candidate generation.

      Later:
          PS / PO / District / Block
          forest metadata
          target range
          target beat
          target compartment
          spatial distance/intersection

      determine WHICH SALBARI.


   10. IMPORTANT SEPARATION

       Stage A:
           determine likely VILLAGE NAME from address

       Stage B:
           determine correct LGD for that village name

========================================================= */


/* =========================================================
   GENERATE VILLAGE CANDIDATES
   =========================================================

   DESIGN PRINCIPLES

   1. Village candidates come ONLY from unlabelled address
      segments / explicit village-settlement text.

   2. PO / PS / District / PIN / Block values are NEVER
      converted into village candidates merely because their
      text happens to match a village name.

   3. Administrative fields are EVIDENCE only.

   4. Address order matters.

      Example:

          Salbari, Malbazar, Jalpaiguri

      Search order:

          Salbari
          Malbazar
          Jalpaiguri

      If Salbari is a valid village-name match, it receives
      higher positional priority than later matches.

   5. Example:

          Malbazar, Salbari, Jalpaiguri

      Malbazar is tested FIRST.

      If Malbazar itself is a valid village/settlement name,
      it becomes the primary village-name candidate.

   6. Example:

          Jalpaiguri, Malbazar, Salbari

      Jalpaiguri is tested FIRST as a VILLAGE NAME.

      It must NOT expand into all villages having
      district = Jalpaiguri.

   7. Example:

          Salbari, PO-Malbazar

      Candidate:
          Salbari

      Evidence:
          PO = Malbazar

      Malbazar MUST NOT become a village candidate.

   8. Example:

          Malbazar, PO-Salbari

      Candidate:
          Malbazar

      Evidence:
          PO = Salbari

      Salbari MUST NOT become a village candidate.

   9. Example:

          Lohar Line,
          Salbari T.G.,
          PS-Kalchini,
          Dist-Alipurduar

      Search:
          Lohar Line
          Salbari T.G.

      Expected village:
          Salbari

      Evidence:
          PS Kalchini
          District Alipurduar

   10. Locality words such as:

          Lohar Line
          Neech Line
          Gudam Line
          Pakaline
          4 No Dhura

       may be retained as locality evidence but do not
       override a later genuine village-name match.

   11. Candidate generation does NOT finally decide between
       duplicate villages having the same normalized name.

       Duplicate resolution belongs to:

           administrative scoring
           +
           forest metadata
           +
           target-range spatial distance.

   ========================================================= */

Resolver.generateCandidates = function (
    accused,
    parsedInput = null
) {

    /* =====================================================
       VALIDATION
       ===================================================== */

    if (!accused) {

        return {

            accused:
                null,

            parsed:
                null,

            address:
                "",

            candidateSegments:
                [],

            primarySegment:
                "",

            primaryVillage:
                "",

            candidates:
                [],

            candidateCount:
                0,

            reason:
                "NO_ACCUSED"

        };

    }


    /* =====================================================
       ENSURE INDEX
       ===================================================== */

    if (!Resolver.index) {

        Resolver.buildIndexes();

    }


    /* =====================================================
       ADDRESS
       ===================================================== */

    const address =

        String(

            accused.addressOfAccused ||

            accused.address ||

            accused.accusedAddress ||

            accused.residentialAddress ||

            ""

        ).trim();


    if (!address) {

        return {

            accused,

            parsed:
                null,

            address:
                "",

            candidateSegments:
                [],

            primarySegment:
                "",

            primaryVillage:
                "",

            candidates:
                [],

            candidateCount:
                0,

            reason:
                "NO_ADDRESS"

        };

    }


    /* =====================================================
       PARSE ADDRESS
       ===================================================== */

    const parsed =

        parsedInput ||

        Resolver.parseAddress(
            address
        ) ||

        {};


    /* =====================================================
       NORMALIZATION HELPERS
       ===================================================== */

    function normalize(
        value
    ) {

        return Resolver.normalize(
            value || ""
        );

    }


    function safeString(
        value
    ) {

        return String(
            value ?? ""
        ).trim();

    }


    /* =====================================================
       NORMALIZE SETTLEMENT EXPRESSION

       We want:

           Salbari T.G.
                 ↓
           SALBARI

           Salbari T.E.
                 ↓
           SALBARI

           Salbari Tea Garden
                 ↓
           SALBARI

           Salbari (Neech Line)
                 ↓
           SALBARI

       BUT the original segment remains available as
       evidence.
       ===================================================== */

    function normalizeSettlementExpression(
        value
    ) {

        let text =
            safeString(
                value
            );


        if (!text)
            return "";


        /*
         * Remove leading village labels.
         */

        text =
            text.replace(
                /^\s*(?:VILLAGE|VILL|VIL|V)\s*[-:.]?\s*/i,
                ""
            );


        /*
         * Remove parenthetical locality.
         *
         * Salbari (Neech Line)
         *       ↓
         * Salbari
         */

        text =
            text.replace(
                /\([^)]*\)/g,
                " "
            );


        /*
         * Remove Tea Garden suffix variants.
         *
         * We first try the base settlement because our
         * canonical LGD name may simply be SALBARI.
         */

        text =
            text.replace(
                /\b(?:T\s*\.?\s*G\s*\.?|T\s*\.?\s*E\s*\.?|TEA\s+GARDEN|TEA\s+ESTATE)\b/gi,
                " "
            );


        text =
            text.replace(
                /\s+/g,
                " "
            )
            .replace(
                /^[,\s.-]+|[,\s.-]+$/g,
                ""
            )
            .trim();


        return text;

    }


    /* =====================================================
       ADMINISTRATIVE LABEL DETECTOR

       Anything explicitly labelled as one of these fields
       MUST NOT enter village candidate generation.
       ===================================================== */

    function isAdministrativeSegment(
        segment
    ) {

        const raw =
            safeString(
                segment
            );


        if (!raw)
            return true;


        return (

            /^\s*(?:P\s*\.?\s*O\s*\.?|POST\s+OFFICE)\s*[-:=+]?/i
                .test(raw)

            ||

            /^\s*(?:P\s*\.?\s*S\s*\.?|POLICE\s+STATION)\s*[-:=+]?/i
                .test(raw)

            ||

            /^\s*(?:DIST(?:RICT)?|DISTT)\s*[-:=+]?/i
                .test(raw)

            ||

            /^\s*(?:PIN|PINCODE|POSTAL\s+CODE)\s*[-:=+]?/i
                .test(raw)

            ||

            /^\s*(?:BLOCK|BLK)\s*[-:=+]?/i
                .test(raw)

            ||

            /^\s*(?:SUBDIVISION|SUB\s*DIVISION|SUBDIV)\s*[-:=+]?/i
                .test(raw)

        );

    }


    /* =====================================================
       GET CANDIDATE SEGMENTS

       parseAddress() should already provide the authoritative
       unlabelled candidate segments.

       We DO NOT rebuild candidates from PO/PS/District.
       ===================================================== */

    let candidateSegments = [];


    if (
        Array.isArray(
            parsed.candidateSegments
        )
    ) {

        candidateSegments =
            parsed.candidateSegments
                .map(
                    safeString
                )
                .filter(Boolean);

    }


    /* =====================================================
       FALLBACK

       For compatibility with older parseAddress versions.

       This fallback splits the raw address but explicitly
       removes labelled administrative segments.
       ===================================================== */

    if (
        !candidateSegments.length
    ) {

        candidateSegments =
            address
                .split(
                    /[,;]+/
                )
                .map(
                    safeString
                )
                .filter(Boolean)
                .filter(
                    segment =>
                        !isAdministrativeSegment(
                            segment
                        )
                );

    }


    /* =====================================================
       REMOVE DUPLICATE SEGMENTS WHILE PRESERVING ORDER
       ===================================================== */

    {

        const seen =
            new Set();


        candidateSegments =
            candidateSegments.filter(
                segment => {

                    const key =
                        normalize(
                            segment
                        );


                    if (!key)
                        return false;


                    if (
                        seen.has(
                            key
                        )
                    ) {

                        return false;

                    }


                    seen.add(
                        key
                    );


                    return true;

                }
            );

    }


    /* =====================================================
       CANDIDATE RESULT COLLECTION
       ===================================================== */

    const candidates = [];

    const candidateByCode =
        new Map();


    /* =====================================================
       ADD CANDIDATE

       Same LGD may be found through several expressions.
       Keep ONE candidate but preserve its strongest /
       earliest positional evidence.
       ===================================================== */

    function addCandidate(
        village,
        evidence
    ) {

        if (!village)
            return;


        const villageCode =
            safeString(

                village.villageCode ||

                village.Vill_LGD ||

                village.vill_LGD ||

                village.lgdCode ||

                village.LGD ||

                ""

            );


        /*
         * LGD is preferred as identity.
         *
         * Fallback identity protects records where LGD is
         * temporarily unavailable.
         */

        const identity =

            villageCode ||

            [

                normalize(
                    village.name ||
                    village.cleanName
                ),

                normalize(
                    village.block
                ),

                normalize(
                    village.district
                )

            ].join("|");


        if (!identity)
            return;


        const existing =
            candidateByCode.get(
                identity
            );


        if (existing) {

            /*
             * Preserve all discovery evidence.
             */

            if (
                !Array.isArray(
                    existing.matchEvidence
                )
            ) {

                existing.matchEvidence = [];

            }


            existing.matchEvidence.push(
                evidence
            );


            /*
             * Earlier address position always wins.
             */

            if (
                Number.isFinite(
                    evidence.segmentIndex
                ) &&
                (
                    !Number.isFinite(
                        existing.segmentIndex
                    )
                    ||
                    evidence.segmentIndex <
                    existing.segmentIndex
                )
            ) {

                existing.segmentIndex =
                    evidence.segmentIndex;

                existing.candidatePosition =
                    evidence.candidatePosition;

                existing.matchedSegment =
                    evidence.segment;

                existing.matchedExpression =
                    evidence.expression;

                existing.matchType =
                    evidence.matchType;

            }


            /*
             * Exact name match is stronger than derived /
             * phrase match at same position.
             */

            const strength = {

                EXACT:
                    4,

                NORMALIZED_EXACT:
                    3,

                SETTLEMENT_BASE:
                    2,

                PHRASE:
                    1

            };


            if (
                (
                    strength[
                        evidence.matchType
                    ] || 0
                )
                >
                (
                    strength[
                        existing.matchType
                    ] || 0
                )
            ) {

                existing.matchType =
                    evidence.matchType;

                existing.matchedExpression =
                    evidence.expression;

            }


            return;

        }


        const candidate = {

            ...village,


            /* -----------------------------------------
               Stable identity
               ----------------------------------------- */

            villageCode,

            Vill_LGD:
                villageCode,


            /* -----------------------------------------
               Matching metadata
               ----------------------------------------- */

            matchedSegment:
                evidence.segment,

            matchedExpression:
                evidence.expression,

            normalizedMatchedExpression:
                normalize(
                    evidence.expression
                ),

            matchType:
                evidence.matchType,

            segmentIndex:
                evidence.segmentIndex,

            candidatePosition:
                evidence.candidatePosition,

            addressPosition:
                evidence.segmentIndex,


            /* -----------------------------------------
               Positional evidence

               First address segment gets strongest
               positional priority.
               ----------------------------------------- */

            positionScore:

                Math.max(
                    0,
                    100 -
                    (
                        evidence.segmentIndex *
                        20
                    )
                ),


            /* -----------------------------------------
               Administrative evidence copied separately.

               IMPORTANT:
               these fields DO NOT create the candidate.
               ----------------------------------------- */

            addressPO:
                parsed.po || "",

            addressPS:
                parsed.ps || "",

            addressDistrict:
                parsed.district || "",

            addressPIN:
                parsed.pin || "",

            addressBlock:
                parsed.block || "",


            matchEvidence: [
                evidence
            ]

        };


        candidateByCode.set(
            identity,
            candidate
        );


        candidates.push(
            candidate
        );

    }


    /* =====================================================
       EXACT LOOKUP HELPER

       IMPORTANT:

       Resolver.getVillagesByName() MUST search only the
       village-name index.

       It must NOT return villages merely because district,
       PS, PO or block matches the expression.
       ===================================================== */

    function lookupExact(
        expression
    ) {

        const value =
            safeString(
                expression
            );


        if (!value)
            return [];


        const found =
            Resolver.getVillagesByName(
                value
            );


        return Array.isArray(
            found
        )
            ? found
            : [];

    }


    /* =====================================================
       SEARCH EACH UNLABELLED SEGMENT IN ADDRESS ORDER
       ===================================================== */

    const segmentDiagnostics = [];


    for (
        let segmentIndex = 0;
        segmentIndex < candidateSegments.length;
        segmentIndex++
    ) {

        const segment =
            candidateSegments[
                segmentIndex
            ];


        if (
            !segment ||
            isAdministrativeSegment(
                segment
            )
        ) {

            continue;

        }


        const expressions = [];


        /* -------------------------------------------------
           ORIGINAL EXPRESSION
           ------------------------------------------------- */

        expressions.push({

            value:
                segment,

            type:
                "EXACT"

        });


        /* -------------------------------------------------
           CLEAN SETTLEMENT EXPRESSION

           Salbari T.G.
                 ↓
           Salbari
           ------------------------------------------------- */

        const settlementBase =
            normalizeSettlementExpression(
                segment
            );


        if (
            settlementBase &&
            normalize(
                settlementBase
            ) !==
            normalize(
                segment
            )
        ) {

            expressions.push({

                value:
                    settlementBase,

                type:
                    "SETTLEMENT_BASE"

            });

        }


        /* -------------------------------------------------
           If parser already extracted settlement and this
           segment contains it, allow that expression.

           This is useful for:

               Lohar Line, Salbari T.G.

           parsed.settlement = Salbari T.G.
           ------------------------------------------------- */

        const parsedSettlement =
            safeString(
                parsed.settlement
            );


        if (
            parsedSettlement &&
            (
                normalize(
                    segment
                ).includes(
                    normalize(
                        parsedSettlement
                    )
                )
                ||
                normalize(
                    parsedSettlement
                ).includes(
                    normalize(
                        segment
                    )
                )
            )
        ) {

            expressions.push({

                value:
                    parsedSettlement,

                type:
                    "NORMALIZED_EXACT"

            });


            const parsedSettlementBase =
                normalizeSettlementExpression(
                    parsedSettlement
                );


            if (
                parsedSettlementBase
            ) {

                expressions.push({

                    value:
                        parsedSettlementBase,

                    type:
                        "SETTLEMENT_BASE"

                });

            }

        }


        /* -------------------------------------------------
           DEDUP EXPRESSIONS
           ------------------------------------------------- */

        const uniqueExpressions = [];

        const expressionKeys =
            new Set();


        for (
            const expression
            of expressions
        ) {

            const key =
                normalize(
                    expression.value
                );


            if (
                !key ||
                expressionKeys.has(
                    key
                )
            ) {

                continue;

            }


            expressionKeys.add(
                key
            );


            uniqueExpressions.push(
                expression
            );

        }


        /* -------------------------------------------------
           LOOKUP
           ------------------------------------------------- */

        let segmentMatchCount =
            0;


        const diagnostic = {

            segment,

            segmentIndex,

            expressions:
                [],

            matchCount:
                0

        };


        for (
            const expression
            of uniqueExpressions
        ) {

            const matches =
                lookupExact(
                    expression.value
                );


            diagnostic.expressions.push({

                expression:
                    expression.value,

                type:
                    expression.type,

                matches:
                    matches.length

            });


            if (
                !matches.length
            ) {

                continue;

            }


            for (
                const village
                of matches
            ) {

                addCandidate(
                    village,
                    {

                        segment,

                        expression:
                            expression.value,

                        matchType:
                            expression.type,

                        segmentIndex,

                        candidatePosition:
                            segmentIndex

                    }
                );


                segmentMatchCount++;

            }

        }


        diagnostic.matchCount =
            segmentMatchCount;


        segmentDiagnostics.push(
            diagnostic
        );

    }


    /* =====================================================
       DETERMINE PRIMARY MATCHED SEGMENT

       Find the EARLIEST address segment that actually
       produced a village-name candidate.

       This is critical.

       Example:

           Lohar Line,
           Salbari T.G.,
           Kalchini,
           Alipurduar

       Lohar Line -> no village match
       Salbari    -> match

       therefore primary segment = Salbari T.G.
       ===================================================== */

    let primarySegmentIndex =
        null;


    for (
        const candidate
        of candidates
    ) {

        if (
            !Number.isFinite(
                candidate.segmentIndex
            )
        ) {

            continue;

        }


        if (
            primarySegmentIndex === null
            ||
            candidate.segmentIndex <
            primarySegmentIndex
        ) {

            primarySegmentIndex =
                candidate.segmentIndex;

        }

    }


    const primarySegment =

        primarySegmentIndex !== null

            ? candidateSegments[
                primarySegmentIndex
            ] || ""

            : "";


    /* =====================================================
       MARK PRIMARY-SEGMENT CANDIDATES

       All duplicate villages matching the first successful
       settlement remain alive.

       Example:

           Salbari

       If multiple genuine SALBARI villages exist:

           Salbari LGD A
           Salbari LGD B
           Salbari LGD C

       DO NOT select one here.

       Later administrative + spatial scoring resolves them.
       ===================================================== */

    for (
        const candidate
        of candidates
    ) {

        candidate.isPrimarySegment =

            primarySegmentIndex !== null

            &&

            candidate.segmentIndex ===
                primarySegmentIndex;


        candidate.primaryPositionBonus =

            candidate.isPrimarySegment

                ? 100

                : Math.max(
                    0,
                    60 -
                    (
                        candidate.segmentIndex *
                        15
                    )
                );

    }


    /* =====================================================
       SORT CANDIDATES

       1. Earlier address segment
       2. Exact match strength
       3. Original order

       Administrative/spatial scoring happens later.
       ===================================================== */

    const matchStrength = {

        EXACT:
            4,

        NORMALIZED_EXACT:
            3,

        SETTLEMENT_BASE:
            2,

        PHRASE:
            1

    };


    candidates.sort(
        (
            a,
            b
        ) => {

            const aPos =
                Number.isFinite(
                    a.segmentIndex
                )
                    ? a.segmentIndex
                    : 9999;


            const bPos =
                Number.isFinite(
                    b.segmentIndex
                )
                    ? b.segmentIndex
                    : 9999;


            if (
                aPos !== bPos
            ) {

                return aPos - bPos;

            }


            const aStrength =
                matchStrength[
                    a.matchType
                ] || 0;


            const bStrength =
                matchStrength[
                    b.matchType
                ] || 0;


            if (
                aStrength !==
                bStrength
            ) {

                return (
                    bStrength -
                    aStrength
                );

            }


            return 0;

        }
    );


    /* =====================================================
       PRIMARY VILLAGE

       This is only the first candidate by ADDRESS POSITION.

       It is NOT necessarily the final resolved LGD when
       duplicate same-name villages exist.
       ===================================================== */

    const primaryCandidate =

        candidates.find(
            candidate =>
                candidate.isPrimarySegment
        )

        ||

        candidates[0]

        ||

        null;


    const primaryVillage =

        primaryCandidate

            ? (
                primaryCandidate.name ||

                primaryCandidate.cleanName ||

                ""
            )

            : "";


    /* =====================================================
       RESULT
       ===================================================== */

    return {

        accused,

        parsed,

        address,


        /* ---------------------------------------------
           Address interpretation
           --------------------------------------------- */

        candidateSegments,

        segmentDiagnostics,

        primarySegmentIndex,

        primarySegment,

        primaryVillage,


        /* ---------------------------------------------
           Locality evidence
           --------------------------------------------- */

        locality:
            parsed.locality || "",

        settlement:
            parsed.settlement || "",


        /* ---------------------------------------------
           Administrative evidence

           EVIDENCE ONLY.
           --------------------------------------------- */

        po:
            parsed.po || "",

        ps:
            parsed.ps || "",

        district:
            parsed.district || "",

        pin:
            parsed.pin || "",

        block:
            parsed.block || "",


        /* ---------------------------------------------
           Village candidates
           --------------------------------------------- */

        candidates,

        candidateCount:
            candidates.length,


        /* ---------------------------------------------
           Diagnostics
           --------------------------------------------- */

        reason:

            candidates.length

                ? "VILLAGE_NAME_CANDIDATES_FOUND"

                : "NO_VILLAGE_NAME_MATCH"

    };

};


    /* =====================================================
       DEBUG: FIND VILLAGE NAMES INSIDE ONE ADDRESS

       Useful from console:

       GreenGuardAI.AccusedAddressResolver
           .debugAddress(
               "Lohar Line, Salbari T.G., PS Kalchini, Alipurduar"
           );

    ===================================================== */

    Resolver.debugAddress = function (
        address
    ) {

        const parsed =
            Resolver.parseAddress(
                address
            );


        const candidates =
            Resolver.generateCandidates(
                parsed
            );


        const output =
            candidates.map(
                c => ({

                    address:
                        parsed.raw,

                    settlement:
                        parsed.settlement,

                    matchedVillage:
                        c.matchedName,

                    officialVillage:
                        c.village?.name,

                    Vill_LGD:
                        c.village?.villageCode,

                    block:
                        c.village?.block,

                    PS:
                        c.village?.policeStation,

                    PO:
                        c.village?.postOffice,

                    PIN:
                        c.village?.pinCode,

                    district:
                        c.village?.district,

                    method:
                        c.method,

                    baseScore:
                        c.baseScore,

                    verified:
                        c.verified

                })
            );


        console.table(
            output
        );


        return {

            parsed,

            candidates,

            output

        };

    };

     /* =====================================================
       ADMINISTRATIVE SCORING

       Candidate village has already been found by name.

       Example:

       SALBARI
          ↓
       LGD A
       LGD B
       LGD C

       Now determine which candidate agrees with:

       PIN
       District
       PS
       PO
       Block

       Contradictions are also important.

       Example:

       accused:
       Salbari, PS Kalchini, Alipurduar

       candidate:
       Salbari, PS Cooch Behar

       That candidate must lose points.

    ===================================================== */


    Resolver.scoreAdministrative = function (
        candidate,
        parsed
    ) {

        const village =
            candidate?.village;


        if (!village) {

            return {
                score: 0,
                evidence: []
            };

        }


        let score =
            Number(
                candidate.baseScore ||
                0
            );


        const evidence =
            [];


        /* =================================================
           VILLAGE NAME EVIDENCE
        ================================================= */

        evidence.push({

            type:
                candidate.method ||
                "VILLAGE_MATCH",

            value:
                candidate.matchedName ||
                village.name ||
                "",

            score:
                Number(
                    candidate.baseScore ||
                    0
                )

        });


        /* =================================================
           VERIFIED CONTEXTUAL RESOLUTION

           These are mappings we have already manually
           established.

           Example:

           Panbari
           + PS Samuktala
           + Alipurduar
               ↓
           LGD 307313

           Give very strong support.

           We still retain evidence explaining why.
        ================================================= */

        if (
            candidate.verified === true
        ) {

            const verifiedBonus =
                250;


            score +=
                verifiedBonus;


            evidence.push({

                type:
                    "VERIFIED_CONTEXT",

                value:
                    candidate
                        .verifiedRule
                        ?.villageCode ||
                    village.villageCode,

                score:
                    verifiedBonus

            });

        }


        /* =================================================
           PIN MATCH

           PIN is one of the strongest administrative
           discriminators.

           Exact match:
               +80

           Explicit contradictory PIN:
               -120
        ================================================= */

        if (
            parsed.pin
        ) {

            const accusedPIN =
                String(
                    parsed.pin ||
                    ""
                )
                    .trim();


            const villagePIN =
                String(
                    village.pinCode ||
                    ""
                )
                    .trim();


            if (
                villagePIN
            ) {

                if (
                    accusedPIN ===
                    villagePIN
                ) {

                    score +=
                        Resolver.SCORE.PIN;


                    evidence.push({

                        type:
                            "PIN_MATCH",

                        accused:
                            accusedPIN,

                        candidate:
                            villagePIN,

                        score:
                            Resolver.SCORE.PIN

                    });

                }

                else {

                    score +=
                        Resolver.SCORE.WRONG_PIN;


                    evidence.push({

                        type:
                            "PIN_CONFLICT",

                        accused:
                            accusedPIN,

                        candidate:
                            villagePIN,

                        score:
                            Resolver.SCORE.WRONG_PIN

                    });

                }

            }

        }


        /* =================================================
           DISTRICT

           Example:

           accused:
           Salbari, Alipurduar

           Candidate A:
           Salbari, Alipurduar
               +60

           Candidate B:
           Salbari, Jalpaiguri
               -90
        ================================================= */

        if (
            parsed.district
        ) {

            const accusedDistrict =
                Resolver.normalize(
                    parsed.district
                );


            const villageDistrict =
                Resolver.normalize(
                    village.district
                );


            if (
                accusedDistrict &&
                villageDistrict
            ) {

                if (
                    accusedDistrict ===
                    villageDistrict
                ) {

                    score +=
                        Resolver.SCORE.DISTRICT;


                    evidence.push({

                        type:
                            "DISTRICT_MATCH",

                        accused:
                            parsed.district,

                        candidate:
                            village.district,

                        score:
                            Resolver.SCORE.DISTRICT

                    });

                }

                else {

                    score +=
                        Resolver.SCORE.WRONG_DISTRICT;


                    evidence.push({

                        type:
                            "DISTRICT_CONFLICT",

                        accused:
                            parsed.district,

                        candidate:
                            village.district,

                        score:
                            Resolver.SCORE.WRONG_DISTRICT

                    });

                }

            }

        }


        /* =================================================
           POLICE STATION

           Very important for duplicate village names.

           Example:

           Salbari + PS Kalchini

           should strongly prefer the Salbari associated
           with Kalchini.

           Explicit PS conflict:
               -40
        ================================================= */

        if (
            parsed.ps
        ) {

            const accusedPS =
                Resolver.normalize(
                    parsed.ps
                );


            const villagePS =
                Resolver.normalize(
                    village.policeStation
                );


            if (
                accusedPS &&
                villagePS
            ) {

                if (
                    accusedPS ===
                    villagePS
                ) {

                    score +=
                        Resolver.SCORE.PS;


                    evidence.push({

                        type:
                            "PS_MATCH",

                        accused:
                            parsed.ps,

                        candidate:
                            village.policeStation,

                        score:
                            Resolver.SCORE.PS

                    });

                }

                else {

                    score +=
                        Resolver.SCORE.WRONG_PS;


                    evidence.push({

                        type:
                            "PS_CONFLICT",

                        accused:
                            parsed.ps,

                        candidate:
                            village.policeStation,

                        score:
                            Resolver.SCORE.WRONG_PS

                    });

                }

            }

        }


        /* =================================================
           POST OFFICE

           PO is supporting evidence.

           We currently reward an exact PO match.

           We do NOT heavily punish a mismatch because:

           - one village can use another nearby PO
           - historical addresses may contain old PO names
           - PO spelling varies
        ================================================= */

        if (
            parsed.po
        ) {

            const accusedPO =
                Resolver.normalize(
                    parsed.po
                );


            const villagePO =
                Resolver.normalize(
                    village.postOffice
                );


            if (
                accusedPO &&
                villagePO &&
                accusedPO ===
                    villagePO
            ) {

                score +=
                    Resolver.SCORE.PO;


                evidence.push({

                    type:
                        "PO_MATCH",

                    accused:
                        parsed.po,

                    candidate:
                        village.postOffice,

                    score:
                        Resolver.SCORE.PO

                });

            }

        }


        /* =================================================
           BLOCK

           Address parser does not always provide block.

           But if later we enrich parsed.block, this scoring
           automatically works.
        ================================================= */

        if (
            parsed.block
        ) {

            const accusedBlock =
                Resolver.normalize(
                    parsed.block
                );


            const villageBlock =
                Resolver.normalize(
                    village.block
                );


            if (
                accusedBlock &&
                villageBlock &&
                accusedBlock ===
                    villageBlock
            ) {

                score +=
                    Resolver.SCORE.BLOCK;


                evidence.push({

                    type:
                        "BLOCK_MATCH",

                    accused:
                        parsed.block,

                    candidate:
                        village.block,

                    score:
                        Resolver.SCORE.BLOCK

                });

            }

        }


        /* =================================================
           RETURN
        ================================================= */

        return {

            score,

            evidence

        };

    };


    /* =====================================================
       SCORE ALL ADMINISTRATIVE CANDIDATES
    ===================================================== */

    Resolver.scoreAdministrativeCandidates = function (
        candidates,
        parsed
    ) {

        const scored =
            [];


        for (
            const candidate
            of candidates || []
        ) {

            const admin =
                Resolver.scoreAdministrative(
                    candidate,
                    parsed
                );


            scored.push({

                ...candidate,

                administrativeScore:
                    admin.score,

                score:
                    admin.score,

                evidence: [
                    ...admin.evidence
                ]

            });

        }


        scored.sort(
            (a, b) =>
                b.score -
                a.score
        );


        return scored;

    };


    /* =====================================================
       ADMINISTRATIVE SCORE GAP

       This does NOT make the final decision.

       It tells the spatial stage how strongly the
       administrative evidence already distinguishes the
       candidates.
    ===================================================== */

    Resolver.getAdministrativeGap = function (
        candidates
    ) {

        if (
            !Array.isArray(
                candidates
            ) ||
            candidates.length === 0
        ) {

            return 0;

        }


        if (
            candidates.length === 1
        ) {

            return Infinity;

        }


        const sorted =
            [...candidates]
                .sort(
                    (a, b) =>
                        (
                            b.administrativeScore ||
                            b.score ||
                            0
                        ) -
                        (
                            a.administrativeScore ||
                            a.score ||
                            0
                        )
                );


        const first =
            Number(
                sorted[0]
                    ?.administrativeScore ??
                sorted[0]
                    ?.score ??
                0
            );


        const second =
            Number(
                sorted[1]
                    ?.administrativeScore ??
                sorted[1]
                    ?.score ??
                0
            );


        return (
            first -
            second
        );

    };


    /* =====================================================
       ADMINISTRATIVE DEBUGGER

       Example:

       GreenGuardAI.AccusedAddressResolver
           .debugAdministrative(
               "Lohar Line, Salbari T.G., PS Kalchini, Alipurduar"
           );

    ===================================================== */

    Resolver.debugAdministrative = function (
        address
    ) {

        const parsed =
            Resolver.parseAddress(
                address
            );


        const candidates =
            Resolver.generateCandidates(
                parsed
            );


        const scored =
            Resolver.scoreAdministrativeCandidates(
                candidates,
                parsed
            );


        const rows =
            scored.map(
                x => ({

                    matchedVillage:
                        x.matchedName,

                    canonicalVillage:
                        x.village?.name,

                    Vill_LGD:
                        x.village?.villageCode,

                    block:
                        x.village?.block,

                    PS:
                        x.village?.policeStation,

                    PO:
                        x.village?.postOffice,

                    PIN:
                        x.village?.pinCode,

                    district:
                        x.village?.district,

                    verified:
                        x.verified === true,

                    administrativeScore:
                        x.administrativeScore,

                    evidence:
                        (
                            x.evidence ||
                            []
                        )
                            .map(
                                e =>
                                    e.type
                            )
                            .join(
                                " | "
                            )

                })
            );


        console.group(
            "🏡 ADMINISTRATIVE ADDRESS RESOLUTION"
        );


        console.log(
            "Address:",
            address
        );


        console.log(
            "Parsed:",
            parsed
        );


        console.log(
            "Candidate count:",
            scored.length
        );


        console.table(
            rows
        );


        console.log(
            "Top-two score gap:",
            Resolver.getAdministrativeGap(
                scored
            )
        );


        console.groupEnd();


        return {

            parsed,

            candidates:
                scored,

            rows

        };

    };


    /* =====================================================
       FOREST METADATA SCORING

       Some canonical village records may already contain:

       forestRange
       forestBeat
       forestCompartment

       If these agree with the offence case's target forest
       jurisdiction, they are useful evidence.

       Actual geometry/distance scoring comes in PART 4.
    ===================================================== */

    Resolver.scoreForestMetadata = function (
        candidate,
        target
    ) {

        const village =
            candidate?.village;


        if (
            !village ||
            !target
        ) {

            return {

                score: 0,

                evidence: []

            };

        }


        let score =
            0;


        const evidence =
            [];


        /* =================================================
           RANGE
        ================================================= */

        if (
            target.range &&
            village.forestRange &&
            Resolver.same(
                target.range,
                village.forestRange
            )
        ) {

            score +=
                Resolver.SCORE
                    .FOREST_RANGE_METADATA;


            evidence.push({

                type:
                    "FOREST_RANGE_METADATA_MATCH",

                target:
                    target.range,

                candidate:
                    village.forestRange,

                score:
                    Resolver.SCORE
                        .FOREST_RANGE_METADATA

            });

        }


        /* =================================================
           BEAT
        ================================================= */

        if (
            target.beat &&
            village.forestBeat &&
            Resolver.same(
                target.beat,
                village.forestBeat
            )
        ) {

            score +=
                Resolver.SCORE
                    .FOREST_BEAT_METADATA;


            evidence.push({

                type:
                    "FOREST_BEAT_METADATA_MATCH",

                target:
                    target.beat,

                candidate:
                    village.forestBeat,

                score:
                    Resolver.SCORE
                        .FOREST_BEAT_METADATA

            });

        }


        /* =================================================
           COMPARTMENT
        ================================================= */

        if (
            target.compartment &&
            village.forestCompartment &&
            Resolver.same(
                target.compartment,
                village.forestCompartment
            )
        ) {

            score +=
                Resolver.SCORE
                    .FOREST_COMPARTMENT_METADATA;


            evidence.push({

                type:
                    "FOREST_COMPARTMENT_METADATA_MATCH",

                target:
                    target.compartment,

                candidate:
                    village.forestCompartment,

                score:
                    Resolver.SCORE
                        .FOREST_COMPARTMENT_METADATA

            });

        }


        return {

            score,

            evidence

        };

    };

     /* =====================================================
       TARGET FOREST CONTEXT

       Accused
          ↓
       POR / case
          ↓
       target forest range
          ↓
       allGISFeatures
          ↓
       target range polygon

       This is NOT used to override strong contradictory
       administrative evidence.

       It is used to distinguish otherwise plausible
       duplicate village names.

    ===================================================== */


    /* =====================================================
       NORMALIZE FOREST RANGE NAME
    ===================================================== */

    Resolver.normalizeRangeName = function (
        value
    ) {

        return Resolver.normalize(
            value
        )

            .replace(
                /\bRANGE\b/g,
                " "
            )

            .replace(
                /\s+/g,
                " "
            )

            .trim();

    };


    /* =====================================================
       NORMALIZE FOREST BEAT NAME
    ===================================================== */

    Resolver.normalizeBeatName = function (
        value
    ) {

        return Resolver.normalize(
            value
        )

            .replace(
                /\bBEAT\b/g,
                " "
            )

            .replace(
                /\s+/g,
                " "
            )

            .trim();

    };


    /* =====================================================
       NORMALIZE COMPARTMENT NAME
    ===================================================== */

    Resolver.normalizeCompartmentName = function (
        value
    ) {

        return Resolver.normalize(
            value
        )

            .replace(
                /\bCOMPARTMENT\b/g,
                " "
            )

            .replace(
                /\bCOMP\b/g,
                " "
            )

            .replace(
                /\s+/g,
                " "
            )

            .trim();

    };


    /* =====================================================
       GET TARGET FOREST CONTEXT FROM CASE

       Your case records currently contain fields such as:

       range
       rangeCanonical
       rangeRaw
       rangeGISResolved
       division

       We deliberately prefer the GIS-resolved/canonical
       value when available.

    ===================================================== */

Resolver.getTargetContext = function (
    caseRecord
) {

    if (!caseRecord) {

        return null;

    }


    /* =================================================
       TARGET FOREST RANGE

       IMPORTANT:

       rangeGISResolved is a BOOLEAN status flag in the
       offence case schema. It is NOT the range name.

       Authoritative preference:

       1. rangeCanonical
       2. range
       3. rangeRaw
       4. rangeCode
    ================================================= */

    const range =

        caseRecord.rangeCanonical ||

        caseRecord.range ||

        caseRecord.rangeRaw ||

        caseRecord.rangeCode ||

        "";


    /* =================================================
       DIVISION
    ================================================= */

    const division =

        caseRecord.divisionCanonical ||

        caseRecord.division ||

        "";


    /* =================================================
       OPTIONAL TARGET BEAT
    ================================================= */

    const beat =

        caseRecord.beatCanonical ||

        caseRecord.beat ||

        caseRecord.targetBeat ||

        "";


    /* =================================================
       OPTIONAL TARGET COMPARTMENT
    ================================================= */

    const compartment =

        caseRecord.compartment ||

        caseRecord.targetCompartment ||

        "";


    /* =================================================
       BUILD CONTEXT
    ================================================= */

    return {

        range,

        division,

        beat,

        compartment,


        normalizedRange:

            Resolver.normalizeRangeName(
                range
            ),


        normalizedDivision:

            Resolver.normalize(
                division
            ),


        normalizedBeat:

            Resolver.normalizeBeatName(
                beat
            ),


        normalizedCompartment:

            Resolver.normalizeCompartmentName(
                compartment
            ),


        rangeCode:

            caseRecord.rangeCode ||

            "",


        rangeRaw:

            caseRecord.rangeRaw ||

            "",


        rangeCanonical:

            caseRecord.rangeCanonical ||

            "",


        rangeGISResolved:

            caseRecord.rangeGISResolved === true,


        porNo:

            caseRecord.porNo ||

            caseRecord.refPorNo ||

            "",


        caseId:

            caseRecord.caseId ||

            caseRecord.id ||

            ""

    };

};


    /* =====================================================
       GIS ACCESS
    ===================================================== */

    Resolver.getGISFeatures = function () {

        return Array.isArray(
            global.allGISFeatures
        )

            ? global.allGISFeatures

            : [];

    };


    Resolver.getCompartmentFeatures = function () {

        return Array.isArray(
            global.allCompartmentFeatures
        )

            ? global.allCompartmentFeatures

            : [];

    };


    /* =====================================================
       SAFE GIS PROPERTY ACCESS
    ===================================================== */

    Resolver.getGISRangeName = function (
        feature
    ) {

        const p =
            feature?.properties ||
            {};


        return (

            p.range ||

            p.Range ||

            p.RANGE ||

            p.rangeName ||

            ""

        );

    };


    Resolver.getGISDivisionName = function (
        feature
    ) {

        const p =
            feature?.properties ||
            {};


        return (

            p.division ||

            p.Division ||

            p.DIVISION ||

            ""

        );

    };


    Resolver.getGISBeatName = function (
        feature
    ) {

        const p =
            feature?.properties ||
            {};


        return (

            p.beat ||

            p.Beat ||

            p.BEAT ||

            ""

        );

    };


    Resolver.getGISCompartmentName = function (
        feature
    ) {

        const p =
            feature?.properties ||
            {};


        return (

            p.compartment ||

            p.Compartment ||

            p.COMPARTMENT ||

            p.Name ||

            ""

        );

    };


    /* =====================================================
       FIND TARGET RANGE FEATURES

       allGISFeatures currently contains your beat polygons
       with properties including:

       division
       beat
       range

       Therefore the target range can consist of MULTIPLE
       beat polygons.

       We intentionally return ALL features whose range
       matches the POR target range.

    ===================================================== */

    Resolver.findTargetRangeFeatures = function (
        target
    ) {

        if (
            !target ||
            !target.normalizedRange
        ) {

            return [];

        }


        const features =
            Resolver.getGISFeatures();


        let matches =
            features.filter(
                feature => {

                    const range =
                        Resolver.normalizeRangeName(
                            Resolver.getGISRangeName(
                                feature
                            )
                        );


                    if (
                        !range ||
                        range !==
                            target.normalizedRange
                    ) {

                        return false;

                    }


                    /*
                     * If case division is known, use it as
                     * an additional guard where possible.
                     */

                    if (
                        target.normalizedDivision
                    ) {

                        const division =
                            Resolver.normalize(
                                Resolver.getGISDivisionName(
                                    feature
                                )
                            );


                        if (
                            division &&
                            division !==
                                target.normalizedDivision
                        ) {

                            return false;

                        }

                    }


                    return true;

                }
            );


        /* =================================================
           FALLBACK

           If exact range matching fails because of naming
           differences, allow contained range-name matching.

           Example:

           case:
           "Gorumara North"

           GIS:
           "Gorumara North Range"

           normalizeRangeName() normally already fixes this,
           but this fallback handles other minor differences.
        ================================================= */

        if (
            matches.length === 0
        ) {

            matches =
                features.filter(
                    feature => {

                        const range =
                            Resolver.normalizeRangeName(
                                Resolver.getGISRangeName(
                                    feature
                                )
                            );


                        if (!range)
                            return false;


                        return (

                            range.includes(
                                target.normalizedRange
                            ) ||

                            target.normalizedRange.includes(
                                range
                            )

                        );

                    }
                );

        }


        return matches;

    };


    /* =====================================================
       FIND TARGET BEAT FEATURES

       If a case later contains target beat information,
       beat geometry is even more precise than range.

    ===================================================== */

    Resolver.findTargetBeatFeatures = function (
        target
    ) {

        if (
            !target ||
            !target.normalizedBeat
        ) {

            return [];

        }


        return Resolver
            .getGISFeatures()
            .filter(
                feature => {

                    const beat =
                        Resolver.normalizeBeatName(
                            Resolver.getGISBeatName(
                                feature
                            )
                        );


                    if (
                        beat !==
                        target.normalizedBeat
                    ) {

                        return false;

                    }


                    if (
                        target.normalizedRange
                    ) {

                        const range =
                            Resolver.normalizeRangeName(
                                Resolver.getGISRangeName(
                                    feature
                                )
                            );


                        if (
                            range &&
                            range !==
                                target.normalizedRange
                        ) {

                            return false;

                        }

                    }


                    return true;

                }
            );

    };


    /* =====================================================
       FIND TARGET COMPARTMENT FEATURES
    ===================================================== */

    Resolver.findTargetCompartmentFeatures = function (
        target
    ) {

        if (
            !target ||
            !target.normalizedCompartment
        ) {

            return [];

        }


        return Resolver
            .getCompartmentFeatures()
            .filter(
                feature => {

                    const compartment =
                        Resolver
                            .normalizeCompartmentName(
                                Resolver
                                    .getGISCompartmentName(
                                        feature
                                    )
                            );


                    if (
                        compartment !==
                        target.normalizedCompartment
                    ) {

                        return false;

                    }


                    if (
                        target.normalizedRange
                    ) {

                        const range =
                            Resolver.normalizeRangeName(
                                Resolver.getGISRangeName(
                                    feature
                                )
                            );


                        if (
                            range &&
                            range !==
                                target.normalizedRange
                        ) {

                            return false;

                        }

                    }


                    return true;

                }
            );

    };


    /* =====================================================
       TARGET GEOMETRY PRIORITY

       Compartment > Beat > Range

       Most of your current cases appear to identify range,
       so normally this will return the range's beat polygons.

    ===================================================== */

    Resolver.getTargetFeatures = function (
        target
    ) {

        if (!target) {

            return {

                level:
                    "NONE",

                features:
                    []

            };

        }


        const compartments =
            Resolver
                .findTargetCompartmentFeatures(
                    target
                );


        if (
            compartments.length
        ) {

            return {

                level:
                    "COMPARTMENT",

                features:
                    compartments

            };

        }


        const beats =
            Resolver
                .findTargetBeatFeatures(
                    target
                );


        if (
            beats.length
        ) {

            return {

                level:
                    "BEAT",

                features:
                    beats

            };

        }


        const ranges =
            Resolver
                .findTargetRangeFeatures(
                    target
                );


        if (
            ranges.length
        ) {

            return {

                level:
                    "RANGE",

                features:
                    ranges

            };

        }


        return {

            level:
                "NONE",

            features:
                []

        };

    };


    /* =====================================================
       VILLAGE GEOJSON INDEX

       __villageBoundaryGeoJSON contains the actual village
       polygons.

       We index those polygons by Vill_LGD / villageCode.

    ===================================================== */

    Resolver.villageGeometryIndex =
        null;


    Resolver.buildVillageGeometryIndex = function () {

        const geojson =
            Resolver.getVillageGeoJSON();


        const map =
            new Map();


        const features =
            Array.isArray(
                geojson?.features
            )

                ? geojson.features

                : [];


        for (
            const feature
            of features
        ) {

            const p =
                feature?.properties ||
                {};


            const code =
                String(

                    p.Vill_LGD ||

                    p.vill_lgd ||

                    p.VILL_LGD ||

                    p.villageCode ||

                    p.VILLAGECODE ||

                    p.village_code ||

                    ""

                )
                    .trim();


            if (!code)
                continue;


            if (
                !map.has(
                    code
                )
            ) {

                map.set(
                    code,
                    []
                );

            }


            map.get(
                code
            )
                .push(
                    feature
                );

        }


        Resolver.villageGeometryIndex =
            map;


        console.log(
            "🗺 Village geometry index built",
            {
                LGDs:
                    map.size,

                polygons:
                    features.length
            }
        );


        return map;

    };


    /* =====================================================
       GET VILLAGE POLYGONS BY LGD
    ===================================================== */

    Resolver.getVillageFeaturesByCode = function (
        villageCode
    ) {

        if (
            !Resolver.villageGeometryIndex
        ) {

            Resolver
                .buildVillageGeometryIndex();

        }


        return (

            Resolver
                .villageGeometryIndex
                .get(
                    String(
                        villageCode ||
                        ""
                    )
                ) ||

            []

        );

    };


    /* =====================================================
       SAFE TURF
    ===================================================== */

    Resolver.hasTurf = function () {

        return !!(
            global.turf &&
            typeof global.turf.distance ===
                "function"
        );

    };


    /* =====================================================
       FEATURE CENTER

       Uses pointOnFeature when available because it is safer
       for irregular polygons than a raw centroid.

    ===================================================== */

    Resolver.getFeaturePoint = function (
        feature
    ) {

        if (
            !feature ||
            !global.turf
        ) {

            return null;

        }


        try {

            if (
                typeof global.turf
                    .pointOnFeature ===
                    "function"
            ) {

                return global.turf
                    .pointOnFeature(
                        feature
                    );

            }

        }
        catch (error) {

            /* continue */

        }


        try {

            if (
                typeof global.turf.centroid ===
                    "function"
            ) {

                return global.turf
                    .centroid(
                        feature
                    );

            }

        }
        catch (error) {

            /* continue */

        }


        return null;

    };


    /* =====================================================
       POLYGON INTERSECTION TEST
    ===================================================== */

    Resolver.featuresIntersect = function (
        a,
        b
    ) {

        if (
            !a ||
            !b ||
            !global.turf
        ) {

            return false;

        }


        /* ---------------------------------------------
           Direct polygon intersection
        --------------------------------------------- */

        try {

            if (
                typeof global.turf
                    .booleanIntersects ===
                    "function"
            ) {

                return global.turf
                    .booleanIntersects(
                        a,
                        b
                    );

            }

        }
        catch (error) {

            /* continue */

        }


        /* ---------------------------------------------
           Fallback:
           village representative point inside target
        --------------------------------------------- */

        try {

            const point =
                Resolver.getFeaturePoint(
                    a
                );


            if (
                point &&
                typeof global.turf
                    .booleanPointInPolygon ===
                    "function"
            ) {

                return global.turf
                    .booleanPointInPolygon(
                        point,
                        b
                    );

            }

        }
        catch (error) {

            /* continue */

        }


        return false;

    };


    /* =====================================================
       APPROXIMATE FEATURE DISTANCE

       IMPORTANT DESIGN:

       0 km when polygons intersect.

       Otherwise use representative points.

       This is sufficient for RANKING duplicate villages.

       We are not claiming this as cadastral/legal boundary
       distance.

    ===================================================== */

    Resolver.distanceBetweenFeaturesKm = function (
        a,
        b
    ) {

        if (
            !a ||
            !b ||
            !Resolver.hasTurf()
        ) {

            return Infinity;

        }


        if (
            Resolver.featuresIntersect(
                a,
                b
            )
        ) {

            return 0;

        }


        const pointA =
            Resolver.getFeaturePoint(
                a
            );


        const pointB =
            Resolver.getFeaturePoint(
                b
            );


        if (
            !pointA ||
            !pointB
        ) {

            return Infinity;

        }


        try {

            return global.turf.distance(

                pointA,

                pointB,

                {
                    units:
                        "kilometers"
                }

            );

        }
        catch (error) {

            return Infinity;

        }

    };


    /* =====================================================
       MINIMUM VILLAGE → TARGET FOREST DISTANCE

       A target range contains several beat polygons.

       Village may also contain multiple polygons.

       We calculate the minimum relationship:

       village polygon(s)
             ↕
       target forest polygon(s)

    ===================================================== */

    Resolver.getVillageTargetDistanceKm = function (
        villageCode,
        targetFeatures
    ) {

        const villageFeatures =
            Resolver
                .getVillageFeaturesByCode(
                    villageCode
                );


        if (
            villageFeatures.length === 0 ||
            !Array.isArray(
                targetFeatures
            ) ||
            targetFeatures.length === 0
        ) {

            return Infinity;

        }


        let minimum =
            Infinity;


        for (
            const villageFeature
            of villageFeatures
        ) {

            for (
                const targetFeature
                of targetFeatures
            ) {

                const distance =
                    Resolver
                        .distanceBetweenFeaturesKm(
                            villageFeature,
                            targetFeature
                        );


                if (
                    Number.isFinite(
                        distance
                    ) &&
                    distance < minimum
                ) {

                    minimum =
                        distance;

                }


                /*
                 * Cannot beat intersection.
                 */

                if (
                    minimum === 0
                ) {

                    return 0;

                }

            }

        }


        return minimum;

    };


    /* =====================================================
       SPATIAL SCORE FROM DISTANCE

       Your requested principle:

       Village near the target forest gets priority over
       another same-name village much farther away.

    ===================================================== */

    Resolver.getSpatialDistanceScore = function (
        distanceKm
    ) {

        if (
            !Number.isFinite(
                distanceKm
            )
        ) {

            return 0;

        }


        if (
            distanceKm <= 5
        ) {

            return Resolver.SCORE
                .SPATIAL_VERY_NEAR;

        }


        if (
            distanceKm <= 15
        ) {

            return Resolver.SCORE
                .SPATIAL_NEAR;

        }


        if (
            distanceKm <= 30
        ) {

            return Resolver.SCORE
                .SPATIAL_MODERATE;

        }


        if (
            distanceKm <= 60
        ) {

            return Resolver.SCORE
                .SPATIAL_FAR;

        }


        return 0;

    };


    /* =====================================================
       SCORE ONE CANDIDATE AGAINST TARGET FOREST
    ===================================================== */

    Resolver.scoreSpatialCandidate = function (
        candidate,
        targetInfo
    ) {

        const village =
            candidate?.village;


        if (
            !village
        ) {

            return candidate;

        }


        let score =
            Number(
                candidate.score ||
                0
            );


        const evidence = [

            ...(
                candidate.evidence ||
                []
            )

        ];


        /* =================================================
           FOREST METADATA
        ================================================= */

        const metadata =
            Resolver.scoreForestMetadata(

                candidate,

                targetInfo?.target

            );


        score +=
            metadata.score;


        evidence.push(
            ...metadata.evidence
        );


        /* =================================================
           ACTUAL SPATIAL DISTANCE
        ================================================= */

        let distanceKm =
            Infinity;


        let spatialScore =
            0;


        if (
            targetInfo?.features?.length
        ) {

            distanceKm =
                Resolver
                    .getVillageTargetDistanceKm(

                        village.villageCode,

                        targetInfo.features

                    );


            spatialScore =
                Resolver
                    .getSpatialDistanceScore(
                        distanceKm
                    );


            score +=
                spatialScore;


            if (
                Number.isFinite(
                    distanceKm
                )
            ) {

                evidence.push({

                    type:
                        distanceKm === 0
                            ? "TARGET_FOREST_INTERSECTION"
                            : "TARGET_FOREST_DISTANCE",

                    targetLevel:
                        targetInfo.level,

                    targetRange:
                        targetInfo
                            ?.target
                            ?.range ||
                        "",

                    distanceKm:
                        Number(
                            distanceKm.toFixed(
                                3
                            )
                        ),

                    score:
                        spatialScore

                });

            }

        }


        return {

            ...candidate,

            score,

            finalScore:
                score,

            spatialScore,

            targetDistanceKm:
                distanceKm,

            targetLevel:
                targetInfo?.level ||
                "NONE",

            evidence

        };

    };


    /* =====================================================
       SCORE ALL CANDIDATES AGAINST TARGET FOREST
    ===================================================== */

    Resolver.scoreSpatialCandidates = function (
        candidates,
        target
    ) {

        const targetSet =
            Resolver.getTargetFeatures(
                target
            );


        const targetInfo = {

            target,

            level:
                targetSet.level,

            features:
                targetSet.features

        };


        const output =
            (
                candidates ||
                []
            )
                .map(
                    candidate =>
                        Resolver
                            .scoreSpatialCandidate(
                                candidate,
                                targetInfo
                            )
                );


        output.sort(
            (a, b) => {

                const scoreDifference =
                    (
                        b.finalScore ||
                        b.score ||
                        0
                    ) -
                    (
                        a.finalScore ||
                        a.score ||
                        0
                    );


                if (
                    scoreDifference !== 0
                ) {

                    return scoreDifference;

                }


                /*
                 * Tie-breaker:
                 * physically nearer candidate wins.
                 */

                const distanceA =
                    Number.isFinite(
                        a.targetDistanceKm
                    )
                        ? a.targetDistanceKm
                        : Infinity;


                const distanceB =
                    Number.isFinite(
                        b.targetDistanceKm
                    )
                        ? b.targetDistanceKm
                        : Infinity;


                return (
                    distanceA -
                    distanceB
                );

            }
        );


        return {

            targetInfo,

            candidates:
                output

        };

    };


    /* =====================================================
       FULL CANDIDATE SCORING FOR ONE ACCUSED

       This combines:

       village-name matching
       +
       administrative evidence
       +
       case target forest
       +
       spatial proximity

    ===================================================== */

    Resolver.buildScoredCandidates = function (
        accused
    ) {

        const address =

            accused?.addressOfAccused ||

            accused?.address ||

            accused?.location ||

            "";


        const parsed =
            Resolver.parseAddress(
                address
            );


        const rawCandidates =
            Resolver.generateCandidates(
                parsed
            );


        const administrative =
            Resolver
                .scoreAdministrativeCandidates(
                    rawCandidates,
                    parsed
                );


        const caseRecord =
            Resolver.getCaseForAccused(
                accused
            );


        const target =
            Resolver.getTargetContext(
                caseRecord
            );


        const spatial =
            Resolver.scoreSpatialCandidates(
                administrative,
                target
            );


        return {

            accused,

            address,

            parsed,

            caseRecord,

            target,

            targetInfo:
                spatial.targetInfo,

            candidates:
                spatial.candidates

        };

    };


    /* =====================================================
       DEBUG ONE ACCUSED'S SPATIAL RESOLUTION

       Console example:

       const A =
           GreenGuardAI.Offence.Store.data.accused
               .find(x =>
                   String(x.addressOfAccused || "")
                       .toLowerCase()
                       .includes("salbari")
               );

       GreenGuardAI.AccusedAddressResolver
           .debugSpatial(A);

    ===================================================== */

    Resolver.debugSpatial = function (
        accused
    ) {

        const result =
            Resolver.buildScoredCandidates(
                accused
            );


        console.group(
            "🌲 ACCUSED ADDRESS SPATIAL RESOLUTION"
        );


        console.log(
            "Accused:",
            accused?.nameOfAccused ||
            accused?.name ||
            ""
        );


        console.log(
            "Address:",
            result.address
        );


        console.log(
            "Parsed:",
            result.parsed
        );


        console.log(
            "POR:",
            accused?.porNo ||
            accused?.refPorNo ||
            ""
        );


        console.log(
            "Case:",
            result.caseRecord
        );


        console.log(
            "Target:",
            result.target
        );


        console.log(
            "Target geometry:",
            {
                level:
                    result.targetInfo?.level,

                features:
                    result.targetInfo
                        ?.features
                        ?.length ||
                    0
            }
        );


        const rows =
            result.candidates.map(
                candidate => ({

                    matchedVillage:
                        candidate.matchedName,

                    canonicalVillage:
                        candidate.village?.name,

                    Vill_LGD:
                        candidate.village
                            ?.villageCode,

                    block:
                        candidate.village?.block,

                    PS:
                        candidate.village
                            ?.policeStation,

                    district:
                        candidate.village
                            ?.district,

                    administrativeScore:
                        candidate
                            .administrativeScore,

                    spatialScore:
                        candidate.spatialScore,

                    distanceKm:
                        Number.isFinite(
                            candidate.targetDistanceKm
                        )
                            ? Number(
                                candidate
                                    .targetDistanceKm
                                    .toFixed(2)
                            )
                            : null,

                    finalScore:
                        candidate.finalScore,

                    verified:
                        candidate.verified === true,

                    evidence:
                        (
                            candidate.evidence ||
                            []
                        )
                            .map(
                                e => e.type
                            )
                            .join(" | ")

                })
            );


        console.table(
            rows
        );


        console.groupEnd();


        return result;

    };
       /* =====================================================
       FINAL DECISION CONFIGURATION
    ===================================================== */

    Resolver.DECISION = {

        /*
         * Minimum score required before a candidate can
         * normally become RESOLVED.
         */
        MIN_RESOLVED_SCORE: 100,

        /*
         * Difference between winner and runner-up.
         *
         * If two duplicate villages remain very close,
         * do not force a resolution.
         */
        HIGH_GAP: 70,

        MEDIUM_GAP: 35,

        MIN_SAFE_GAP: 20,

        /*
         * Verified contextual rules are authoritative
         * when the rule itself matched PS/district context.
         */
        VERIFIED_ALWAYS_RESOLVE: true

    };


    /* =====================================================
       GET CANDIDATE SCORE
    ===================================================== */

    Resolver.getCandidateScore = function (
        candidate
    ) {

        return Number(

            candidate?.finalScore ??

            candidate?.score ??

            candidate?.administrativeScore ??

            0

        );

    };


    /* =====================================================
       GET WINNER / RUNNER-UP GAP
    ===================================================== */

    Resolver.getScoreGap = function (
        candidates
    ) {

        if (
            !Array.isArray(
                candidates
            ) ||
            candidates.length === 0
        ) {

            return 0;

        }


        if (
            candidates.length === 1
        ) {

            return Infinity;

        }


        const first =
            Resolver.getCandidateScore(
                candidates[0]
            );


        const second =
            Resolver.getCandidateScore(
                candidates[1]
            );


        return (
            first -
            second
        );

    };


    /* =====================================================
       EXPLICIT ADMINISTRATIVE SUPPORT

       Determines whether the winning candidate is supported
       by actual address evidence such as:

       PIN
       District
       PS
       PO
       verified contextual rule
    ===================================================== */

    Resolver.getAdministrativeSupport = function (
        candidate
    ) {

        const types =
            new Set(

                (
                    candidate?.evidence ||
                    []
                )
                    .map(
                        item =>
                            item?.type
                    )
                    .filter(Boolean)

            );


        return {

            verified:
                types.has(
                    "VERIFIED_CONTEXT"
                ),

            pin:
                types.has(
                    "PIN_MATCH"
                ),

            district:
                types.has(
                    "DISTRICT_MATCH"
                ),

            ps:
                types.has(
                    "PS_MATCH"
                ),

            po:
                types.has(
                    "PO_MATCH"
                ),

            block:
                types.has(
                    "BLOCK_MATCH"
                ),

            forest:
                types.has(
                    "TARGET_FOREST_DISTANCE"
                ) ||
                types.has(
                    "TARGET_FOREST_INTERSECTION"
                ),

            pinConflict:
                types.has(
                    "PIN_CONFLICT"
                ),

            districtConflict:
                types.has(
                    "DISTRICT_CONFLICT"
                ),

            psConflict:
                types.has(
                    "PS_CONFLICT"
                )

        };

    };


    /* =====================================================
       COUNT STRONG ADMINISTRATIVE SIGNALS
    ===================================================== */

    Resolver.countAdministrativeSignals = function (
        support
    ) {

        if (!support)
            return 0;


        let count =
            0;


        if (support.pin)
            count++;


        if (support.district)
            count++;


        if (support.ps)
            count++;


        if (support.po)
            count++;


        if (support.block)
            count++;


        return count;

    };


    /* =====================================================
       CONFIDENCE CALCULATION

       HIGH
       MEDIUM
       LOW
       NONE

       Forest proximity can help distinguish duplicate
       villages, but HIGH confidence normally requires
       administrative support or a verified contextual rule.
    ===================================================== */

    Resolver.determineConfidence = function (
        candidates
    ) {

        if (
            !Array.isArray(
                candidates
            ) ||
            candidates.length === 0
        ) {

            return "NONE";

        }


        const winner =
            candidates[0];


        const score =
            Resolver.getCandidateScore(
                winner
            );


        const gap =
            Resolver.getScoreGap(
                candidates
            );


        const support =
            Resolver.getAdministrativeSupport(
                winner
            );


        const adminSignals =
            Resolver.countAdministrativeSignals(
                support
            );


        /* =================================================
           VERIFIED
        ================================================= */

        if (
            support.verified
        ) {

            return "HIGH";

        }


        /* =================================================
           EXPLICIT PIN + OTHER SUPPORT
        ================================================= */

        if (
            support.pin &&
            (
                support.district ||
                support.ps
            )
        ) {

            return "HIGH";

        }


        /* =================================================
           DISTRICT + PS

           Very strong combination for same-name villages.
        ================================================= */

        if (
            support.district &&
            support.ps &&
            gap >=
                Resolver.DECISION
                    .MIN_SAFE_GAP
        ) {

            return "HIGH";

        }


        /* =================================================
           MULTIPLE ADMIN SIGNALS + LARGE GAP
        ================================================= */

        if (
            adminSignals >= 2 &&
            gap >=
                Resolver.DECISION
                    .MEDIUM_GAP
        ) {

            return "HIGH";

        }


        /* =================================================
           ONE ADMIN SIGNAL + FOREST + LARGE GAP
        ================================================= */

        if (
            adminSignals >= 1 &&
            support.forest &&
            gap >=
                Resolver.DECISION
                    .MEDIUM_GAP
        ) {

            return "HIGH";

        }


        /* =================================================
           ONE ADMIN SIGNAL + SAFE GAP
        ================================================= */

        if (
            adminSignals >= 1 &&
            gap >=
                Resolver.DECISION
                    .MIN_SAFE_GAP
        ) {

            return "MEDIUM";

        }


        /* =================================================
           FOREST PROXIMITY ONLY

           Useful, but not automatically HIGH confidence.
        ================================================= */

        if (
            support.forest &&
            gap >=
                Resolver.DECISION
                    .HIGH_GAP
        ) {

            return "MEDIUM";

        }


        if (
            score >=
                Resolver.DECISION
                    .MIN_RESOLVED_SCORE
        ) {

            return "LOW";

        }


        return "NONE";

    };


    /* =====================================================
       SHOULD WINNER BE ACCEPTED?

       Important:

       Highest score != automatically resolved.

       Duplicate village names with weak evidence remain
       AMBIGUOUS.
    ===================================================== */

    Resolver.shouldResolveWinner = function (
        candidates
    ) {

        if (
            !Array.isArray(
                candidates
            ) ||
            candidates.length === 0
        ) {

            return false;

        }


        const winner =
            candidates[0];


        const score =
            Resolver.getCandidateScore(
                winner
            );


        const support =
            Resolver.getAdministrativeSupport(
                winner
            );


        const gap =
            Resolver.getScoreGap(
                candidates
            );


        /* =================================================
           VERIFIED CONTEXT
        ================================================= */

        if (
            Resolver.DECISION
                .VERIFIED_ALWAYS_RESOLVE &&
            support.verified
        ) {

            return true;

        }


        /* =================================================
           ONLY ONE CANDIDATE

           Exact village identification can resolve when
           there is no competing LGD and no strong conflict.
        ================================================= */

        if (
            candidates.length === 1
        ) {

            if (
                support.pinConflict ||
                support.districtConflict
            ) {

                return false;

            }


            return (
                score >=
                Resolver.DECISION
                    .MIN_RESOLVED_SCORE
            );

        }


        /* =================================================
           DUPLICATE VILLAGE NAME

           Explicit contradictory PIN or district is a major
           warning.
        ================================================= */

        if (
            support.pinConflict ||
            support.districtConflict
        ) {

            return false;

        }


        /* =================================================
           PIN MATCH
        ================================================= */

        if (
            support.pin &&
            gap >=
                Resolver.DECISION
                    .MIN_SAFE_GAP
        ) {

            return true;

        }


        /* =================================================
           DISTRICT + PS
        ================================================= */

        if (
            support.district &&
            support.ps &&
            gap >=
                Resolver.DECISION
                    .MIN_SAFE_GAP
        ) {

            return true;

        }


        /* =================================================
           DISTRICT/PS + FOREST PROXIMITY

           This is particularly important for your Salbari
           design.

           Example:

           Salbari A:
             Alipurduar
             Kalchini
             near target forest

           Salbari B:
             another jurisdiction
             far from target forest

           A wins.
        ================================================= */

        if (
            (
                support.district ||
                support.ps
            ) &&
            support.forest &&
            gap >=
                Resolver.DECISION
                    .MIN_SAFE_GAP
        ) {

            return true;

        }


        /* =================================================
           FOREST ONLY

           Require a substantially larger gap because forest
           proximity alone is weaker than explicit address
           evidence.
        ================================================= */

        if (
            support.forest &&
            gap >=
                Resolver.DECISION
                    .HIGH_GAP
        ) {

            return true;

        }


        return false;

    };


    /* =====================================================
       LOCALITY EXTRACTION

       Preserve address information around the canonical
       village name.

       Examples:

       Panbari Lohar Dangi
           canonical = Panbari
           locality  = Lohar Dangi

       Lohar Line, Salbari T.G.
           canonical = Salbari
           locality  = Lohar Line / Tea Garden

       Original address is ALWAYS preserved separately.
    ===================================================== */

    Resolver.extractLocality = function (
        parsed,
        winner
    ) {

        if (
            !parsed ||
            !winner
        ) {

            return "";

        }


        const matchedName =
            Resolver.normalize(

                winner.matchedName ||

                winner.village?.name ||

                ""

            );


        if (!matchedName)
            return "";


        let settlement =
            Resolver.normalize(
                parsed.settlement
            );


        /*
         * If the parser stopped too early or produced no useful
         * settlement, use the address segment before PS/PO/DIST.
         */

        if (!settlement) {

            settlement =
                Resolver.normalize(
                    parsed.raw
                );

        }


        if (!settlement)
            return "";


        const villageWords =
            matchedName

                .split(
                    " "
                )

                .filter(Boolean);


        const settlementWords =
            settlement

                .split(
                    " "
                )

                .filter(Boolean);


        let position =
            -1;


        for (
            let i = 0;
            i <=
                settlementWords.length -
                villageWords.length;
            i++
        ) {

            const phrase =
                settlementWords

                    .slice(
                        i,
                        i +
                        villageWords.length
                    )

                    .join(
                        " "
                    );


            if (
                phrase ===
                matchedName
            ) {

                position =
                    i;

                break;

            }

        }


        if (
            position < 0
        ) {

            return "";

        }


        const before =
            settlementWords

                .slice(
                    0,
                    position
                )

                .join(
                    " "
                );


        const after =
            settlementWords

                .slice(
                    position +
                    villageWords.length
                )

                .join(
                    " "
                );


        /* =================================================
           Clean administrative/generic suffixes from locality
        ================================================= */

        const generic =
            new Set([
                "VILL",
                "VILLAGE"
            ]);


        const localityParts =
            [];


        if (
            before &&
            !generic.has(
                before
            )
        ) {

            localityParts.push(
                before
            );

        }


        if (
            after
        ) {

            localityParts.push(
                after
            );

        }


        return localityParts

            .filter(Boolean)

            .join(
                " / "
            )

            .trim();

    };


    /* =====================================================
       CANDIDATE SUMMARY

       Keeps the full result manageable while preserving
       enough information for audit/review.
    ===================================================== */

    Resolver.summarizeCandidate = function (
        candidate
    ) {

        if (!candidate)
            return null;


        return {

            matchedVillage:
                candidate.matchedName ||
                "",

            canonicalVillage:
                candidate.village?.name ||
                "",

            Vill_LGD:
                String(
                    candidate.village
                        ?.villageCode ||
                    ""
                ),

            block:
                candidate.village?.block ||
                "",

            PS:
                candidate.village
                    ?.policeStation ||
                "",

            PO:
                candidate.village
                    ?.postOffice ||
                "",

            PIN:
                candidate.village
                    ?.pinCode ||
                "",

            district:
                candidate.village
                    ?.district ||
                "",

            method:
                candidate.method ||
                "",

            verified:
                candidate.verified === true,

            administrativeScore:
                candidate.administrativeScore ??
                null,

            spatialScore:
                candidate.spatialScore ??
                0,

            targetDistanceKm:
                Number.isFinite(
                    candidate.targetDistanceKm
                )
                    ? Number(
                        candidate
                            .targetDistanceKm
                            .toFixed(3)
                    )
                    : null,

            finalScore:
                Resolver.getCandidateScore(
                    candidate
                ),

            evidence:
                (
                    candidate.evidence ||
                    []
                )
                    .map(
                        item => ({
                            ...item
                        })
                    )

        };

    };


    /* =====================================================
       BUILD CANONICAL RESOLVED RESULT
    ===================================================== */

    Resolver.buildResolvedResult = function (
        context
    ) {

        const candidates =
            context?.candidates ||
            [];


        const winner =
            candidates[0] ||
            null;


        const runnerUp =
            candidates[1] ||
            null;


        const confidence =
            Resolver.determineConfidence(
                candidates
            );


        const resolved =
            Resolver.shouldResolveWinner(
                candidates
            );


        const locality =
            winner
                ? Resolver.extractLocality(
                    context.parsed,
                    winner
                )
                : "";


        const accused =
            context.accused ||
            {};


        const caseRecord =
            context.caseRecord ||
            null;


        const target =
            context.target ||
            null;


        /* =================================================
           NO CANDIDATES
        ================================================= */

        if (!winner) {

            return {

                accusedIndex:
                    context.accusedIndex ??
                    null,

                accusedId:
                    accused.accusedId ||
                    accused.id ||
                    accused.documentId ||
                    "",

                accusedName:
                    accused.nameOfAccused ||
                    accused.name ||
                    "",

                porNo:
                    accused.porNo ||
                    accused.refPorNo ||
                    accused.sourceRefPorNo ||
                    "",

                originalAddress:
                    context.address ||
                    "",

                extractedSettlement:
                    context.parsed
                        ?.settlement ||
                    "",

                canonicalVillage:
                    "",

                locality:
                    "",

                Vill_LGD:
                    "",

                block:
                    "",

                PS:
                    context.parsed
                        ?.ps ||
                    "",

                PO:
                    context.parsed
                        ?.po ||
                    "",

                PIN:
                    context.parsed
                        ?.pin ||
                    "",

                district:
                    context.parsed
                        ?.district ||
                    "",

                targetRange:
                    target?.range ||
                    "",

                targetLevel:
                    context.targetInfo
                        ?.level ||
                    "NONE",

                status:
                    "UNRESOLVED",

                confidence:
                    "NONE",

                score:
                    0,

                scoreGap:
                    0,

                candidateCount:
                    0,

                winner:
                    null,

                runnerUp:
                    null,

                candidates:
                    [],

                reason:
                    "NO_VILLAGE_CANDIDATE",

                caseRecord:
                    caseRecord

            };

        }


        /* =================================================
           RESOLVED / AMBIGUOUS
        ================================================= */

        const winnerSummary =
            Resolver.summarizeCandidate(
                winner
            );


        const runnerUpSummary =
            Resolver.summarizeCandidate(
                runnerUp
            );


        const scoreGap =
            Resolver.getScoreGap(
                candidates
            );


        const status =
            resolved
                ? "RESOLVED"
                : "AMBIGUOUS";


        return {

            accusedIndex:
                context.accusedIndex ??
                null,

            accusedId:
                accused.accusedId ||
                accused.id ||
                accused.documentId ||
                "",

            accusedName:
                accused.nameOfAccused ||
                accused.name ||
                "",

            porNo:
                accused.porNo ||
                accused.refPorNo ||
                accused.sourceRefPorNo ||
                "",


            /* ---------------------------------------------
               ORIGINAL DATA — NEVER DESTROY
            --------------------------------------------- */

            originalAddress:
                context.address ||
                "",

            extractedSettlement:
                context.parsed
                    ?.settlement ||
                "",


            /* ---------------------------------------------
               CANONICAL RESOLUTION
            --------------------------------------------- */

            canonicalVillage:
                resolved
                    ? winner.village
                        ?.name ||
                      ""
                    : "",

            matchedVillage:
                winner.matchedName ||
                "",

            locality:
                resolved
                    ? locality
                    : "",

            Vill_LGD:
                resolved
                    ? String(
                        winner.village
                            ?.villageCode ||
                        ""
                    )
                    : "",


            /* ---------------------------------------------
               CANONICAL ADMINISTRATIVE DATA

               When resolved, use canonical village metadata.

               Parsed values remain available in `parsed`.
            --------------------------------------------- */

            block:
                resolved
                    ? winner.village
                        ?.block ||
                      ""
                    : "",

            PS:
                resolved
                    ? winner.village
                        ?.policeStation ||
                      context.parsed
                        ?.ps ||
                      ""
                    : context.parsed
                        ?.ps ||
                      "",

            PO:
                resolved
                    ? winner.village
                        ?.postOffice ||
                      context.parsed
                        ?.po ||
                      ""
                    : context.parsed
                        ?.po ||
                      "",

            PIN:
                resolved
                    ? winner.village
                        ?.pinCode ||
                      context.parsed
                        ?.pin ||
                      ""
                    : context.parsed
                        ?.pin ||
                      "",

            district:
                resolved
                    ? winner.village
                        ?.district ||
                      context.parsed
                        ?.district ||
                      ""
                    : context.parsed
                        ?.district ||
                      "",


            /* ---------------------------------------------
               CASE / FOREST CONTEXT
            --------------------------------------------- */

            targetRange:
                target?.range ||
                "",

            targetDivision:
                target?.division ||
                "",

            targetBeat:
                target?.beat ||
                "",

            targetCompartment:
                target?.compartment ||
                "",

            targetLevel:
                context.targetInfo
                    ?.level ||
                "NONE",

            targetFeatureCount:
                context.targetInfo
                    ?.features
                    ?.length ||
                0,

            targetDistanceKm:
                Number.isFinite(
                    winner.targetDistanceKm
                )
                    ? Number(
                        winner
                            .targetDistanceKm
                            .toFixed(3)
                    )
                    : null,


            /* ---------------------------------------------
               DECISION
            --------------------------------------------- */

            status,

            confidence:
                resolved
                    ? confidence
                    : (
                        confidence === "NONE"
                            ? "LOW"
                            : confidence
                    ),

            score:
                Resolver.getCandidateScore(
                    winner
                ),

            scoreGap:
                Number.isFinite(
                    scoreGap
                )
                    ? scoreGap
                    : null,

            candidateCount:
                candidates.length,

            method:
                winner.method ||
                "",

            verified:
                winner.verified === true,


            /* ---------------------------------------------
               AUDIT TRAIL
            --------------------------------------------- */

            winner:
                winnerSummary,

            runnerUp:
                runnerUpSummary,

            candidates:
                candidates
                    .slice(
                        0,
                        10
                    )
                    .map(
                        Resolver.summarizeCandidate
                    ),

            evidence:
                winnerSummary
                    ?.evidence ||
                [],

            parsed:
                {
                    ...context.parsed
                },

            caseRecord:
                caseRecord,

            reason:
                resolved
                    ? "WINNER_ACCEPTED"
                    : "INSUFFICIENT_SEPARATION"

        };

    };


    /* =====================================================
       RESOLVE ONE ACCUSED
    ===================================================== */

    Resolver.resolveOne = function (
        accused,
        accusedIndex = null
    ) {

        if (!accused) {

            return null;

        }


        const context =
            Resolver.buildScoredCandidates(
                accused
            );


        context.accusedIndex =
            accusedIndex;


        return Resolver.buildResolvedResult(
            context
        );

    };


    /* =====================================================
       DEBUG ONE RESOLUTION
    ===================================================== */

    Resolver.debugOne = function (
        accused
    ) {

        const result =
            Resolver.resolveOne(
                accused
            );


        console.group(
            "🏡 ACCUSED ADDRESS FINAL DECISION"
        );


        console.log(
            "Accused:",
            result?.accusedName
        );


        console.log(
            "POR:",
            result?.porNo
        );


        console.log(
            "Original address:",
            result?.originalAddress
        );


        console.log(
            "Matched village:",
            result?.matchedVillage
        );


        console.log(
            "Status:",
            result?.status
        );


        console.log(
            "Confidence:",
            result?.confidence
        );


        console.log(
            "Canonical village:",
            result?.canonicalVillage
        );


        console.log(
            "Vill_LGD:",
            result?.Vill_LGD
        );


        console.log(
            "Target range:",
            result?.targetRange
        );


        console.log(
            "Target distance km:",
            result?.targetDistanceKm
        );


        console.log(
            "Winner:",
            result?.winner
        );


        console.log(
            "Runner-up:",
            result?.runnerUp
        );


        console.table(

            (
                result?.candidates ||
                []
            )
                .map(
                    candidate => ({

                        matchedVillage:
                            candidate.matchedVillage,

                        canonicalVillage:
                            candidate.canonicalVillage,

                        Vill_LGD:
                            candidate.Vill_LGD,

                        block:
                            candidate.block,

                        PS:
                            candidate.PS,

                        district:
                            candidate.district,

                        admin:
                            candidate.administrativeScore,

                        spatial:
                            candidate.spatialScore,

                        distanceKm:
                            candidate.targetDistanceKm,

                        final:
                            candidate.finalScore,

                        verified:
                            candidate.verified

                    })
                )

        );


        console.groupEnd();


        return result;

    };

     /* =====================================================
       PART 6
       PRODUCTION BATCH RESOLUTION + AUDIT + REGISTRATION
    ===================================================== */


    /* =====================================================
       RUNTIME RESULT STATE
    ===================================================== */

    Resolver.results = [];

    Resolver.resolved = [];

    Resolver.ambiguous = [];

    Resolver.unresolved = [];

    Resolver.lastRunAt = null;

    Resolver.lastRunDuration = null;

    Resolver.lastRunStats = null;


    /* =====================================================
       GET ALL ACCUSED

       Authoritative source:

       GreenGuardAI.Offence.Store

       Current expected count = 837
    ===================================================== */

    Resolver.getAccused = function () {

        const Store =
            global.GreenGuardAI
                ?.Offence
                ?.Store;


        if (!Store) {

            console.error(
                "❌ Offence.Store not available."
            );

            return [];

        }


        if (
            typeof Store.getAccused ===
            "function"
        ) {

            const accused =
                Store.getAccused();


            if (
                Array.isArray(
                    accused
                )
            ) {

                return accused;

            }

        }


        if (
            Array.isArray(
                Store.data?.accused
            )
        ) {

            return Store.data.accused;

        }


        return [];

    };


    /* =====================================================
       CHECK STORE READY
    ===================================================== */

    Resolver.isStoreReady = function () {

        const Store =
            global.GreenGuardAI
                ?.Offence
                ?.Store;


        if (!Store)
            return false;


        const accused =
            Resolver.getAccused();


        return (
            Store.ready === true &&
            accused.length > 0
        );

    };


    /* =====================================================
       RESET RESULTS
    ===================================================== */

    Resolver.resetResults = function () {

        Resolver.results = [];

        Resolver.resolved = [];

        Resolver.ambiguous = [];

        Resolver.unresolved = [];

        Resolver.lastRunAt = null;

        Resolver.lastRunDuration = null;

        Resolver.lastRunStats = null;


        global.__resolvedAccusedAddresses =
            Resolver.results;


        global.__resolvedAccusedVillages =
            Resolver.resolved;


        global.__ambiguousAccusedVillages =
            Resolver.ambiguous;


        global.__unresolvedAccusedVillages =
            Resolver.unresolved;


        return true;

    };


    /* =====================================================
       BUILD RUN STATISTICS
    ===================================================== */

    Resolver.buildStats = function () {

        const results =
            Resolver.results ||
            [];


        const resolved =
            results.filter(
                item =>
                    item?.status ===
                    "RESOLVED"
            );


        const ambiguous =
            results.filter(
                item =>
                    item?.status ===
                    "AMBIGUOUS"
            );


        const unresolved =
            results.filter(
                item =>
                    item?.status ===
                    "UNRESOLVED"
            );


        const high =
            resolved.filter(
                item =>
                    item?.confidence ===
                    "HIGH"
            );


        const medium =
            resolved.filter(
                item =>
                    item?.confidence ===
                    "MEDIUM"
            );


        const low =
            resolved.filter(
                item =>
                    item?.confidence ===
                    "LOW"
            );


        const withTarget =
            results.filter(
                item =>
                    item?.targetRange
            );


        const withTargetGeometry =
            results.filter(
                item =>
                    item?.targetFeatureCount > 0
            );


        const withDistance =
            results.filter(
                item =>
                    Number.isFinite(
                        item?.targetDistanceKm
                    )
            );


        const duplicateCandidates =
            results.filter(
                item =>
                    item?.candidateCount > 1
            );


        const verified =
            resolved.filter(
                item =>
                    item?.verified === true
            );


        const stats = {

            total:
                results.length,

            resolved:
                resolved.length,

            ambiguous:
                ambiguous.length,

            unresolved:
                unresolved.length,

            highConfidence:
                high.length,

            mediumConfidence:
                medium.length,

            lowConfidence:
                low.length,

            verified:
                verified.length,

            multipleCandidateCases:
                duplicateCandidates.length,

            withTargetRange:
                withTarget.length,

            withTargetGeometry:
                withTargetGeometry.length,

            withSpatialDistance:
                withDistance.length,

            resolutionRate:
                results.length
                    ? Number(
                        (
                            resolved.length /
                            results.length *
                            100
                        ).toFixed(2)
                    )
                    : 0

        };


        Resolver.lastRunStats =
            stats;


        return stats;

    };


    /* =====================================================
       RESOLVE ALL ACCUSED

       This is the main production function.

       Usage:

       const R =
           GreenGuardAI.AccusedAddressResolver;

       R.resolveAll();
    ===================================================== */

    Resolver.resolveAll = function (
        options = {}
    ) {

        const started =
            performance.now();


        console.group(
            "🏡 ACCUSED ADDRESS RESOLVER"
        );


        console.log(
            "Starting production resolution..."
        );


        const accused =
            Resolver.getAccused();


        console.log(
            "Accused records:",
            accused.length
        );


        /* =================================================
           STORE NOT READY
        ================================================= */

        if (
            accused.length === 0
        ) {

            console.error(
                "❌ No accused records available."
            );


            console.error(
                "Load Offence.DataLoader first:"
            );


            console.log(
                "await GreenGuardAI.Offence.DataLoader.load();"
            );


            console.groupEnd();


            return {

                success:
                    false,

                reason:
                    "NO_ACCUSED_DATA",

                results:
                    []

            };

        }


        /* =================================================
           PREPARE INDEXES
        ================================================= */

        try {

            if (
                typeof Resolver
                    .buildVillageIndex ===
                    "function"
            ) {

                Resolver
                    .buildVillageIndex();

            }

        }
        catch (error) {

            console.warn(
                "⚠ Village index build warning:",
                error
            );

        }


        try {

            Resolver
                .buildVillageGeometryIndex();

        }
        catch (error) {

            console.warn(
                "⚠ Village geometry index warning:",
                error
            );

        }


        /* =================================================
           RESET PREVIOUS RUN
        ================================================= */

        Resolver.resetResults();


        const results = [];


        /* =================================================
           PROCESS ALL ACCUSED
        ================================================= */

        for (
            let index = 0;
            index < accused.length;
            index++
        ) {

            const record =
                accused[index];


            try {

                const result =
                    Resolver.resolveOne(
                        record,
                        index
                    );


                if (result) {

                    results.push(
                        result
                    );

                }

            }
            catch (error) {

                console.error(
                    "❌ Resolver error",
                    {
                        index,

                        accused:
                            record
                                ?.nameOfAccused ||
                            record?.name ||
                            "",

                        porNo:
                            record?.porNo ||
                            record?.refPorNo ||
                            "",

                        error
                    }
                );


                /*
                 * Never allow one bad address to terminate
                 * the complete 837-record batch.
                 */

                results.push({

                    accusedIndex:
                        index,

                    accusedId:
                        record?.accusedId ||
                        record?.id ||
                        record?.documentId ||
                        "",

                    accusedName:
                        record?.nameOfAccused ||
                        record?.name ||
                        "",

                    porNo:
                        record?.porNo ||
                        record?.refPorNo ||
                        record?.sourceRefPorNo ||
                        "",

                    originalAddress:
                        record?.addressOfAccused ||
                        record?.address ||
                        record?.location ||
                        "",

                    canonicalVillage:
                        "",

                    Vill_LGD:
                        "",

                    status:
                        "UNRESOLVED",

                    confidence:
                        "NONE",

                    candidateCount:
                        0,

                    reason:
                        "RESOLVER_EXCEPTION",

                    error:
                        String(
                            error?.message ||
                            error
                        )

                });

            }

        }


        /* =================================================
           SAVE RESULTS
        ================================================= */

        Resolver.results =
            results;


        Resolver.resolved =
            results.filter(
                item =>
                    item.status ===
                    "RESOLVED"
            );


        Resolver.ambiguous =
            results.filter(
                item =>
                    item.status ===
                    "AMBIGUOUS"
            );


        Resolver.unresolved =
            results.filter(
                item =>
                    item.status ===
                    "UNRESOLVED"
            );


        /* =================================================
           GLOBAL DEBUG ACCESS

           These are intentionally available in console.
        ================================================= */

        global.__resolvedAccusedAddresses =
            Resolver.results;


        global.__resolvedAccusedVillages =
            Resolver.resolved;


        global.__ambiguousAccusedVillages =
            Resolver.ambiguous;


        global.__unresolvedAccusedVillages =
            Resolver.unresolved;


        const duration =
            performance.now() -
            started;


        Resolver.lastRunAt =
            new Date();


        Resolver.lastRunDuration =
            duration;


        const stats =
            Resolver.buildStats();


        console.log(
            "========================================"
        );


        console.log(
            "✅ ACCUSED ADDRESS RESOLUTION COMPLETE"
        );


        console.log(
            "========================================"
        );


        console.table(
            stats
        );


        console.log(
            "Duration:",
            Math.round(
                duration
            ),
            "ms"
        );


        console.log(
            "Results:",
            Resolver.results
        );


        console.log(
            "Resolved:",
            Resolver.resolved
        );


        console.log(
            "Ambiguous:",
            Resolver.ambiguous
        );


        console.log(
            "Unresolved:",
            Resolver.unresolved
        );


        console.groupEnd();


        return {

            success:
                true,

            stats,

            duration,

            results:
                Resolver.results,

            resolved:
                Resolver.resolved,

            ambiguous:
                Resolver.ambiguous,

            unresolved:
                Resolver.unresolved

        };

    };


    /* =====================================================
       COMPACT AUDIT ROW
    ===================================================== */

    Resolver.toAuditRow = function (
        result
    ) {

        return {

            index:
                result?.accusedIndex,

            accused:
                result?.accusedName,

            POR:
                result?.porNo,

            address:
                result?.originalAddress,

            extracted:
                result?.extractedSettlement,

            matched:
                result?.matchedVillage,

            canonicalVillage:
                result?.canonicalVillage,

            locality:
                result?.locality,

            Vill_LGD:
                result?.Vill_LGD,

            block:
                result?.block,

            PS:
                result?.PS,

            PO:
                result?.PO,

            PIN:
                result?.PIN,

            district:
                result?.district,

            targetRange:
                result?.targetRange,

            distanceKm:
                result?.targetDistanceKm,

            candidates:
                result?.candidateCount,

            score:
                result?.score,

            gap:
                result?.scoreGap,

            status:
                result?.status,

            confidence:
                result?.confidence,

            reason:
                result?.reason

        };

    };


    /* =====================================================
       FULL AUDIT
    ===================================================== */

    Resolver.audit = function () {

        console.group(
            "🏡 RESOLVED ACCUSED ADDRESS AUDIT"
        );


        if (
            !Resolver.results.length
        ) {

            console.warn(
                "⚠ No resolver results."
            );


            console.log(
                "Run Resolver.resolveAll() first."
            );


            console.groupEnd();


            return [];

        }


        const stats =
            Resolver.buildStats();


        console.log(
            "📊 RESOLUTION SUMMARY"
        );


        console.table(
            stats
        );


        console.log(
            "📍 ALL RESULTS"
        );


        const rows =
            Resolver.results.map(
                Resolver.toAuditRow
            );


        console.table(
            rows
        );


        console.log(
            "⚠️ NEEDS REVIEW:",
            Resolver.ambiguous.length +
            Resolver.unresolved.length
        );


        console.groupEnd();


        return rows;

    };


    /* =====================================================
       RESOLVED ONLY
    ===================================================== */

    Resolver.showResolved = function () {

        const rows =
            Resolver.resolved.map(
                Resolver.toAuditRow
            );


        console.log(
            "✅ RESOLVED:",
            rows.length
        );


        console.table(
            rows
        );


        return rows;

    };


    /* =====================================================
       AMBIGUOUS ONLY
    ===================================================== */

    Resolver.showAmbiguous = function () {

        const rows =
            Resolver.ambiguous.map(
                Resolver.toAuditRow
            );


        console.log(
            "⚠️ AMBIGUOUS:",
            rows.length
        );


        console.table(
            rows
        );


        return rows;

    };


    /* =====================================================
       UNRESOLVED ONLY
    ===================================================== */

    Resolver.showUnresolved = function () {

        const rows =
            Resolver.unresolved.map(
                Resolver.toAuditRow
            );


        console.log(
            "❌ UNRESOLVED:",
            rows.length
        );


        console.table(
            rows
        );


        return rows;

    };


    /* =====================================================
       ALL RECORDS REQUIRING REVIEW
    ===================================================== */

    Resolver.showNeedsReview = function () {

        const review =
            Resolver.results.filter(
                result =>
                    result.status !==
                    "RESOLVED"
            );


        const rows =
            review.map(
                Resolver.toAuditRow
            );


        console.log(
            "⚠️ NEEDS REVIEW:",
            rows.length
        );


        console.table(
            rows
        );


        return rows;

    };


    /* =====================================================
       SEARCH RESULTS BY ADDRESS / VILLAGE / ACCUSED

       Example:

       R.search("salbari")
       R.search("panbari")
       R.search("kalchini")
    ===================================================== */

    Resolver.search = function (
        query
    ) {

        const q =
            Resolver.normalize(
                query
            );


        if (!q)
            return [];


        const matches =
            Resolver.results.filter(
                result => {

                    const text =
                        Resolver.normalize(
                            [

                                result.accusedName,

                                result.originalAddress,

                                result.extractedSettlement,

                                result.matchedVillage,

                                result.canonicalVillage,

                                result.locality,

                                result.Vill_LGD,

                                result.block,

                                result.PS,

                                result.PO,

                                result.PIN,

                                result.district,

                                result.targetRange

                            ]
                                .filter(Boolean)
                                .join(" ")
                        );


                    return text.includes(
                        q
                    );

                }
            );


        console.log(
            `🔎 SEARCH "${query}":`,
            matches.length
        );


        console.table(
            matches.map(
                Resolver.toAuditRow
            )
        );


        return matches;

    };


    /* =====================================================
       INSPECT ALL ACCUSED ADDRESSES CONTAINING A VILLAGE

       IMPORTANT FOR YOUR SALBARI TEST.

       This searches ORIGINAL accused addresses, not only
       successfully resolved results.
    ===================================================== */

    Resolver.inspectVillageName = function (
        villageName
    ) {

        const name =
            Resolver.normalize(
                villageName
            );


        const accused =
            Resolver.getAccused();


        const matches =
            accused

                .map(
                    (record, index) => ({

                        index,

                        accused:
                            record?.nameOfAccused ||
                            record?.name ||
                            "",

                        POR:
                            record?.porNo ||
                            record?.refPorNo ||
                            record?.sourceRefPorNo ||
                            "",

                        address:
                            record?.addressOfAccused ||
                            record?.address ||
                            record?.location ||
                            "",

                        record

                    })
                )

                .filter(
                    item =>
                        Resolver.normalize(
                            item.address
                        )
                            .includes(
                                name
                            )
                );


        console.log(
            `🏘 ACCUSED ADDRESSES CONTAINING "${villageName}":`,
            matches.length
        );


        console.table(

            matches.map(
                item => ({

                    index:
                        item.index,

                    accused:
                        item.accused,

                    POR:
                        item.POR,

                    address:
                        item.address

                })
            )

        );


        return matches;

    };


    /* =====================================================
       INSPECT ALL GEOJSON / CANONICAL VILLAGES WITH NAME

       Example:

       R.inspectVillageCandidates("Salbari");
    ===================================================== */

    Resolver.inspectVillageCandidates = function (
        villageName
    ) {

        const normalized =
            Resolver.normalize(
                villageName
            );


        const villages =
            Resolver.getVillages();


        const matches =
            villages.filter(
                village => {

                    const canonical =
                        Resolver.normalize(
                            village?.name
                        );


                    if (
                        canonical ===
                        normalized
                    ) {

                        return true;

                    }


                    const aliases =
                        Array.isArray(
                            village?.aliases
                        )
                            ? village.aliases
                            : [];


                    return aliases.some(
                        alias =>
                            Resolver.normalize(
                                alias
                            ) ===
                            normalized
                    );

                }
            );


        console.log(
            `🗺 VILLAGE CANDIDATES "${villageName}":`,
            matches.length
        );


        console.table(

            matches.map(
                village => ({

                    village:
                        village.name,

                    Vill_LGD:
                        village.villageCode,

                    block:
                        village.block,

                    PS:
                        village.policeStation,

                    PO:
                        village.postOffice,

                    PIN:
                        village.pinCode,

                    district:
                        village.district,

                    forestDivision:
                        village.forestDivision,

                    forestRange:
                        village.forestRange,

                    forestBeat:
                        village.forestBeat,

                    aliases:
                        Array.isArray(
                            village.aliases
                        )
                            ? village.aliases.join(
                                " | "
                            )
                            : village.aliases

                })
            )

        );


        return matches;

    };


    /* =====================================================
       SPECIAL DUPLICATE-VILLAGE AUDIT

       Finds resolved records where multiple LGD candidates
       existed.

       These are especially important because this is where
       PS / district / PIN / forest proximity did the actual
       disambiguation.
    ===================================================== */

    Resolver.auditDuplicateVillageResolutions =
        function () {

            const matches =
                Resolver.results.filter(
                    result =>
                        result.candidateCount > 1
                );


            console.log(
                "🏘 DUPLICATE-VILLAGE RESOLUTIONS:",
                matches.length
            );


            console.table(

                matches.map(
                    result => ({

                        accused:
                            result.accusedName,

                        POR:
                            result.porNo,

                        address:
                            result.originalAddress,

                        matched:
                            result.matchedVillage,

                        canonical:
                            result.canonicalVillage,

                        Vill_LGD:
                            result.Vill_LGD,

                        PS:
                            result.PS,

                        district:
                            result.district,

                        targetRange:
                            result.targetRange,

                        distanceKm:
                            result.targetDistanceKm,

                        candidates:
                            result.candidateCount,

                        score:
                            result.score,

                        gap:
                            result.scoreGap,

                        status:
                            result.status,

                        confidence:
                            result.confidence

                    })
                )

            );


            return matches;

        };


    /* =====================================================
       SALBARI AUDIT

       This is specifically useful for the design we have
       been discussing.

       It shows:

       original address
       accused
       POR
       canonical Salbari
       LGD
       PS
       district
       target range
       forest distance
       winner/runner-up
    ===================================================== */

    Resolver.auditSalbari = function () {

        const allAccused =
            Resolver.inspectVillageName(
                "SALBARI"
            );


        const indexes =
            new Set(
                allAccused.map(
                    item =>
                        item.index
                )
            );


        const results =
            Resolver.results.filter(
                result =>
                    indexes.has(
                        result.accusedIndex
                    )
            );


        console.log(
            "🌲 SALBARI RESOLUTION AUDIT"
        );


        console.table(

            results.map(
                result => ({

                    accused:
                        result.accusedName,

                    POR:
                        result.porNo,

                    address:
                        result.originalAddress,

                    canonicalVillage:
                        result.canonicalVillage,

                    Vill_LGD:
                        result.Vill_LGD,

                    locality:
                        result.locality,

                    PS:
                        result.PS,

                    PO:
                        result.PO,

                    PIN:
                        result.PIN,

                    district:
                        result.district,

                    targetRange:
                        result.targetRange,

                    distanceKm:
                        result.targetDistanceKm,

                    candidateCount:
                        result.candidateCount,

                    score:
                        result.score,

                    scoreGap:
                        result.scoreGap,

                    status:
                        result.status,

                    confidence:
                        result.confidence,

                    runnerUpVillage:
                        result.runnerUp
                            ?.canonicalVillage ||
                        "",

                    runnerUpLGD:
                        result.runnerUp
                            ?.Vill_LGD ||
                        "",

                    runnerUpDistance:
                        result.runnerUp
                            ?.targetDistanceKm ??
                        null

                })
            )

        );


        return results;

    };


    /* =====================================================
       DEBUG BY ACCUSED INDEX

       Example:

       R.debugIndex(50);
    ===================================================== */

    Resolver.debugIndex = function (
        index
    ) {

        const accused =
            Resolver.getAccused();


        const record =
            accused[index];


        if (!record) {

            console.error(
                "❌ Accused index not found:",
                index
            );

            return null;

        }


        return Resolver.debugOne(
            record
        );

    };


    /* =====================================================
       DEBUG BY ACCUSED NAME
    ===================================================== */

    Resolver.debugAccused = function (
        name
    ) {

        const normalized =
            Resolver.normalize(
                name
            );


        const accused =
            Resolver.getAccused();


        const matches =
            accused.filter(
                record =>
                    Resolver.normalize(
                        record?.nameOfAccused ||
                        record?.name ||
                        ""
                    )
                        .includes(
                            normalized
                        )
            );


        console.log(
            `👤 ACCUSED MATCHES "${name}":`,
            matches.length
        );


        if (
            matches.length === 0
        ) {

            return [];

        }


        if (
            matches.length === 1
        ) {

            return Resolver.debugOne(
                matches[0]
            );

        }


        console.table(

            matches.map(
                record => ({

                    accused:
                        record?.nameOfAccused ||
                        record?.name,

                    POR:
                        record?.porNo ||
                        record?.refPorNo,

                    address:
                        record?.addressOfAccused ||
                        record?.address

                })
            )

        );


        return matches;

    };


    /* =====================================================
       DEBUG FIRST ADDRESS CONTAINING TEXT

       Example:

       R.debugAddress("Salbari");
       R.debugAddress("Panbari");
    ===================================================== */

    Resolver.debugAddress = function (
        text
    ) {

        const normalized =
            Resolver.normalize(
                text
            );


        const accused =
            Resolver.getAccused();


        const matches =
            accused.filter(
                record =>
                    Resolver.normalize(

                        record?.addressOfAccused ||

                        record?.address ||

                        record?.location ||

                        ""

                    )
                        .includes(
                            normalized
                        )
            );


        console.log(
            `📍 ADDRESS MATCHES "${text}":`,
            matches.length
        );


        console.table(

            matches.map(
                record => ({

                    accused:
                        record?.nameOfAccused ||
                        record?.name,

                    POR:
                        record?.porNo ||
                        record?.refPorNo,

                    address:
                        record?.addressOfAccused ||
                        record?.address ||
                        record?.location

                })
            )

        );


        if (
            matches.length === 1
        ) {

            return Resolver.debugOne(
                matches[0]
            );

        }


        return matches;

    };


    /* =====================================================
       GET RESULT BY ACCUSED INDEX
    ===================================================== */

    Resolver.getResult = function (
        index
    ) {

        return Resolver.results.find(
            result =>
                result.accusedIndex ===
                index
        ) || null;

    };


    /* =====================================================
       GET RESULT BY ACCUSED ID
    ===================================================== */

    Resolver.getResultById = function (
        accusedId
    ) {

        const id =
            String(
                accusedId ||
                ""
            );


        return Resolver.results.find(
            result =>
                String(
                    result.accusedId ||
                    ""
                ) === id
        ) || null;

    };


    /* =====================================================
       GET RESULTS BY POR
    ===================================================== */

    Resolver.getResultsByPor = function (
        porNo
    ) {

        const normalized =
            Resolver.normalize(
                porNo
            );


        return Resolver.results.filter(
            result =>
                Resolver.normalize(
                    result.porNo
                ) ===
                normalized
        );

    };


    /* =====================================================
       GET STATUS
    ===================================================== */

    Resolver.getStatus = function () {

        return {

            version:
                Resolver.VERSION ||
                "1.0.0",

            registered:
                true,

            storeReady:
                Resolver.isStoreReady(),

            accusedCount:
                Resolver
                    .getAccused()
                    .length,

            villageCount:
                Resolver
                    .getVillages()
                    .length,

            villageGeoJSONFeatures:
                Resolver
                    .getVillageGeoJSON()
                    ?.features
                    ?.length ||
                0,

            gisFeatures:
                Resolver
                    .getGISFeatures()
                    .length,

            compartmentFeatures:
                Resolver
                    .getCompartmentFeatures()
                    .length,

            turf:
                Resolver.hasTurf(),

            hasRun:
                Resolver.results.length > 0,

            results:
                Resolver.results.length,

            resolved:
                Resolver.resolved.length,

            ambiguous:
                Resolver.ambiguous.length,

            unresolved:
                Resolver.unresolved.length,

            lastRunAt:
                Resolver.lastRunAt,

            lastRunDuration:
                Resolver.lastRunDuration,

            stats:
                Resolver.lastRunStats

        };

    };


    /* =====================================================
       REGISTER MODULE
    ===================================================== */

    global.GreenGuardAI =
        global.GreenGuardAI ||
        {};


    global.GreenGuardAI
        .AccusedAddressResolver =
        Resolver;


    /* =====================================================
       READY LOG
    ===================================================== */

    console.log(
        "✅ GreenGuardAI.AccusedAddressResolver loaded",
        {
            version:
                Resolver.VERSION ||
                "1.0.0",

            methods:
                Object.keys(
                    Resolver
                )
                    .filter(
                        key =>
                            typeof Resolver[key] ===
                            "function"
                    )
                    .length
        }
    );


    /* =====================================================
       CLOSE MODULE WRAPPER
    ===================================================== */

})(window);
