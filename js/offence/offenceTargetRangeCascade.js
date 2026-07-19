/* =========================================================
   🔥 OFFENCE TARGET RANGE CASCADE

   FILE:
   js/offence/offenceTargetRangeCascade.js

   PURPOSE:

   MAP CLICK
       ↓
   GIS LOCATION RESOLUTION
       ↓
   TARGET RANGE
       ↓
   NMT / WDPO / EDPO / HTG / WRVK / ERVK / PANA
       ↓
   ALL PORs ASSIGNED TO RANGE
       ↓
   EXISTING CascadeController
       ↓
   EXISTING CascadeRenderer

   IMPORTANT:

   This module DOES NOT replace:

   - Offence Store
   - CascadeController
   - CascadeRenderer
   - GIS rendering
   - Heatmap rendering

   It is only the bridge:

   MAP → TARGET RANGE → PORs → CASCADE
========================================================= */


(() => {

    "use strict";


    /* =====================================================
       1. MODULE CONFIGURATION
    ===================================================== */

    const MODULE_NAME =

        "OffenceTargetRangeCascade";


    const VERSION =

        "3.0.0";


    const RETRY_INTERVAL =

        1000;


    const MAX_INIT_ATTEMPTS =

        120;


    /* =====================================================
       2. INTERNAL STATE
    ===================================================== */

    let initAttempts =

        0;


    let retryTimer =

        null;


    let initialized =

        false;


    /* =====================================================
       3. CANONICAL TARGET RANGES

       These are the ONLY seven TARGET buckets.

       POR range code
           ↓
       Canonical GIS target range
    ===================================================== */

    const TARGET_RANGES = {

        NMT: {

            code:
                "NMT",

            name:
                "Nimati",

            aliases: [

                "NMT",

                "NIMATI"

            ]

        },


        WDPO: {

            code:
                "WDPO",

            name:
                "WestDamanpur",

            aliases: [

                "WDPO",

                "WESTDAMANPUR",

                "WEST DAMANPUR",

                "WEST-DAMANPUR"

            ]

        },


        EDPO: {

            code:
                "EDPO",

            name:
                "EastDamanpur",

            aliases: [

                "EDPO",

                "EASTDAMANPUR",

                "EAST DAMANPUR",

                "EAST-DAMANPUR"

            ]

        },


        HTG: {

            code:
                "HTG",

            name:
                "HamiltonGanj",

            aliases: [

                "HTG",

                "HAMILTONGANJ",

                "HAMILTON GANJ",

                "HAMILTON-GANJ"

            ]

        },


        WRVK: {

            code:
                "WRVK",

            name:
                "WestRajabhatkhawa",

            aliases: [

                "WRVK",

                "WESTRAJABHATKHAWA",

                "WEST RAJABHATKHAWA",

                "WEST-RAJABHATKHAWA"

            ]

        },


        ERVK: {

            code:
                "ERVK",

            name:
                "EastRajabhatkhawa",

            aliases: [

                "ERVK",

                "EASTRAJABHATKHAWA",

                "EAST RAJABHATKHAWA",

                "EAST-RAJABHATKHAWA"

            ]

        },


        PANA: {

            code:
                "PANA",

            name:
                "Pana",

            aliases: [

                "PANA"

            ]

        }

    };


    /* =====================================================
       4. DEPENDENCY CHECK

       We DO NOT permanently fail when this JS file loads
       before the application is ready.

       Required:

       - Leaflet map
       - Turf
       - GG.Offence
       - Offence Store
       - CascadeController
       - GIS features

       If unavailable:
           initialization will retry later.
    ===================================================== */

    function getDependencyStatus() {

        return {

            map:

                !!window.map,


            turf:

                typeof window.turf !==
                "undefined",


            offence:

                !!window.GG
                    ?.Offence,


            store:

                !!window.GG
                    ?.Offence
                    ?.Store,


            storeReady:

                window.GG
                    ?.Offence
                    ?.Store
                    ?.ready ===
                true,


            cascadeController:

                !!window.GG
                    ?.Offence
                    ?.CascadeController,


            getAllPorKeys:

                typeof window.GG
                    ?.Offence
                    ?.Store
                    ?.getAllPorKeys ===
                "function",


            gis:

                Array.isArray(
                    window.allGISFeatures
                ) &&

                window.allGISFeatures.length >
                0,


            gisCount:

                window
                    .allGISFeatures
                    ?.length ||

                0,


            compartmentCount:

                window
                    .allCompartmentFeatures
                    ?.length ||

                0

        };

    }


    /* =====================================================
       5. ARE DEPENDENCIES READY?
    ===================================================== */

    function dependenciesReady() {

        const status =

            getDependencyStatus();


        return (

            status.map ===
                true &&

            status.turf ===
                true &&

            status.offence ===
                true &&

            status.store ===
                true &&

            status.storeReady ===
                true &&

            status.cascadeController ===
                true &&

            status.getAllPorKeys ===
                true &&

            status.gis ===
                true

        );

    }


    /* =====================================================
       6. NORMALIZE TEXT

       Used later for:

       - POR parsing
       - GIS range matching
       - aliases
       - fallback text matching
    ===================================================== */

    function normalizeText(
        value
    ) {

        return String(

            value ??

            ""

        )

            .trim()

            .toUpperCase()

            .replace(
                /\s+/g,
                " "
            );

    }


    /* =====================================================
       7. COMPACT TEXT

       Example:

       "West Damanpur"
           ↓
       "WESTDAMANPUR"

       Useful when GIS and POR naming formats differ.
    ===================================================== */

    function compactText(
        value
    ) {

        return normalizeText(
            value
        )

            .replace(
                /[^A-Z0-9]/g,
                ""
            );

    }


    /* =====================================================
       8. UNIQUE ARRAY HELPER
    ===================================================== */

    function unique(
        values
    ) {

        return [

            ...new Set(

                (

                    Array.isArray(
                        values
                    )

                        ? values

                        : []

                )

                    .filter(
                        Boolean
                    )

            )

        ];

    }


    /* =====================================================
       9. PUBLIC MODULE PLACEHOLDER

       This lets you inspect the module from Console:

       GG.Offence.TargetRangeCascade
    ===================================================== */

    window.GG =

        window.GG ||

        {};


    GG.Offence =

        GG.Offence ||

        {};


    const TargetRangeCascade = {

        VERSION:
            VERSION,


        MODULE_NAME:
            MODULE_NAME,


        initialized:
            false,


        ready:
            false,


        TARGET_RANGES:
            TARGET_RANGES,


        rangeIndex:

            new Map(),


        unmappedPorKeys:

            [],


        stats: {

            total:
                0,

            assigned:
                0,

            unmapped:
                0

        },


        getDependencyStatus:
            getDependencyStatus,


        dependenciesReady:
            dependenciesReady,


        normalizeText:
            normalizeText,


        compactText:
            compactText

    };


    /* =====================================================
       10. EXPOSE MODULE

       After this:

       GG.Offence.TargetRangeCascade

       is available globally.
    ===================================================== */

    GG.Offence.TargetRangeCascade =

        TargetRangeCascade;


    console.log(

        "🔥 OffenceTargetRangeCascade module loaded",

        {

            version:
                VERSION,

            initialized:
                initialized,

            dependencies:

                getDependencyStatus()

        }

    );


    /* =====================================================
       PART 1 END

       DO NOT CLOSE:

           })();

       HERE.

       PART 2 MUST BE PASTED DIRECTLY BELOW THIS LINE
       INSIDE THE SAME IIFE.
    ===================================================== */

     /* =====================================================
       11. EXTRACT CANONICAL RANGE CODE FROM POR

       Examples:

       32/NMT OF 2017-18
           → NMT

       10/WDPO OF 2020-21
           → WDPO

       152/EDPO OF 2015-16
           → EDPO

       68/HTG OF 2019-20
           → HTG

       39/WRVK OF 2017-18
           → WRVK

       49/ERVK OF 2013-14
           → ERVK

       1/PANA OF 2024-25
           → PANA

       Legacy / unknown codes:
           → null

       IMPORTANT:

       Only the seven canonical TARGET codes
       are assigned here.

       Unknown POR codes remain unmapped.
    ===================================================== */

    function extractRangeCodeFromPor(
        porKey
    ) {

        const text =

            normalizeText(
                porKey
            );


        if (
            !text
        ) {

            return null;

        }


        /* ---------------------------------------------
           Explicit canonical POR code matching
        --------------------------------------------- */

        const codePatterns = [

            {

                code:
                    "WDPO",

                pattern:
                    /(?:^|\/|\s)WDPO(?:\s|\/|$)/

            },


            {

                code:
                    "EDPO",

                pattern:
                    /(?:^|\/|\s)EDPO(?:\s|\/|$)/

            },


            {

                code:
                    "WRVK",

                pattern:
                    /(?:^|\/|\s)WRVK(?:\s|\/|$)/

            },


            {

                code:
                    "ERVK",

                pattern:
                    /(?:^|\/|\s)ERVK(?:\s|\/|$)/

            },


            {

                code:
                    "NMT",

                pattern:
                    /(?:^|\/|\s)NMT(?:\s|\/|$)/

            },


            {

                code:
                    "HTG",

                pattern:
                    /(?:^|\/|\s)HTG(?:\s|\/|$)/

            },


            {

                code:
                    "PANA",

                pattern:
                    /(?:^|\/|\s)PANA(?:\s|\/|$)/

            }

        ];


        for (
            const item
            of codePatterns
        ) {

            if (
                item.pattern.test(
                    text
                )
            ) {

                return item.code;

            }

        }


        /* ---------------------------------------------
           Fallback:

           Some POR values may contain full range names
           rather than the short code.
        --------------------------------------------- */

        const compact =

            compactText(
                text
            );


        for (
            const [
                code,
                config
            ]
            of Object.entries(
                TARGET_RANGES
            )
        ) {

            const aliases =

                config.aliases ||

                [];


            for (
                const alias
                of aliases
            ) {

                const compactAlias =

                    compactText(
                        alias
                    );


                if (
                    compactAlias &&
                    compact.includes(
                        compactAlias
                    )
                ) {

                    return code;

                }

            }

        }


        return null;

    }


    /* =====================================================
       12. EXPOSE POR RANGE EXTRACTOR
    ===================================================== */

    TargetRangeCascade
        .extractRangeCodeFromPor =

        extractRangeCodeFromPor;


    /* =====================================================
       13. CREATE EMPTY TARGET RANGE BUCKET

       Each of the seven TARGET ranges receives:

       {
           code,
           name,
           porKeys,
           porNos,
           caseIds,
           cases,
           offenceCount,
           caseCount
       }
    ===================================================== */

    function createRangeBucket(
        code
    ) {

        const config =

            TARGET_RANGES[
                code
            ];


        return {

            code:
                code,


            range:
                config?.name ||

                code,


            name:
                config?.name ||

                code,


            type:
                "TARGET",


            hotspotId:

                "TARGET_RANGE_" +
                code,


            id:

                "TARGET_RANGE_" +
                code,


            key:

                "TARGET_RANGE_" +
                code,


            spatialType:
                "RANGE",


            spatialName:

                config?.name ||

                code,


            porKeys:
                [],


            porNos:
                [],


            caseIds:
                [],


            cases:
                [],


            offenceCount:
                0,


            caseCount:
                0

        };

    }


    /* =====================================================
       14. CREATE ALL 7 EMPTY RANGE BUCKETS
    ===================================================== */

    function createEmptyRangeIndex() {

        const index =

            new Map();


        for (
            const code
            of Object.keys(
                TARGET_RANGES
            )
        ) {

            index.set(

                code,

                createRangeBucket(
                    code
                )

            );

        }


        return index;

    }


    /* =====================================================
       15. GET CASE ID

       Handles common case ID field variations.
    ===================================================== */

    function getCaseId(
        caseRecord
    ) {

        if (
            !caseRecord
        ) {

            return null;

        }


        return (

            caseRecord.caseId ||

            caseRecord.caseID ||

            caseRecord.id ||

            caseRecord._id ||

            null

        );

    }


    /* =====================================================
       16. GET POR NUMBER

       Prefer POR number from case data.

       Fallback:
           POR key itself.
    ===================================================== */

    function getPorNo(
        caseRecord,
        porKey
    ) {

        return (

            caseRecord?.porNo ||

            caseRecord?.porNumber ||

            caseRecord?.PORNo ||

            caseRecord?.POR_NO ||

            porKey ||

            null

        );

    }


    /* =====================================================
       17. GET CASES FOR POR

       Uses your existing canonical Offence Store.
    ===================================================== */

    function getCasesForPor(
        Store,
        porKey
    ) {

        if (
            !Store ||
            !porKey
        ) {

            return [];

        }


        let cases =
            [];


        if (
            typeof Store
                .getCasesByPor ===
            "function"
        ) {

            const result =

                Store
                    .getCasesByPor(
                        porKey
                    );


            if (
                Array.isArray(
                    result
                )
            ) {

                cases =
                    result;

            }

            else if (
                result
            ) {

                cases = [
                    result
                ];

            }

        }


        /* ---------------------------------------------
           Fallback to getCaseByPor()
        --------------------------------------------- */

        if (
            cases.length ===
                0 &&

            typeof Store
                .getCaseByPor ===
            "function"
        ) {

            const result =

                Store
                    .getCaseByPor(
                        porKey
                    );


            if (
                Array.isArray(
                    result
                )
            ) {

                cases =
                    result;

            }

            else if (
                result
            ) {

                cases = [
                    result
                ];

            }

        }


        return cases;

    }


    /* =====================================================
       18. BUILD 7 TARGET RANGE INDEX

       ALL STORE POR KEYS
           ↓
       Extract canonical target code
           ↓
       NMT
       WDPO
       EDPO
       HTG
       WRVK
       ERVK
       PANA
           ↓
       Unknown code
           ↓
       UNMAPPED

       Nothing is silently discarded.
    ===================================================== */

    function buildTargetRangeIndex(
        Store
    ) {

        const rangeIndex =

            createEmptyRangeIndex();


        const unmappedPorKeys =

            [];


        const allPorKeys =

            unique(

                Store
                    .getAllPorKeys()

            );


        console.log(
            "=========================================="
        );

        console.log(
            "🔥 BUILDING 7 TARGET RANGE INDEX"
        );

        console.log(

            "📁 TOTAL STORE POR KEYS:",

            allPorKeys.length

        );


        /* ---------------------------------------------
           Process every POR
        --------------------------------------------- */

        for (
            const porKey
            of allPorKeys
        ) {

            const code =

                extractRangeCodeFromPor(
                    porKey
                );


            /* -----------------------------------------
               Unknown / legacy POR
            ----------------------------------------- */

            if (
                !code ||
                !rangeIndex.has(
                    code
                )
            ) {

                unmappedPorKeys
                    .push(
                        porKey
                    );


                continue;

            }


            const bucket =

                rangeIndex.get(
                    code
                );


            /* -----------------------------------------
               Add POR key
            ----------------------------------------- */

            bucket
                .porKeys
                .push(
                    porKey
                );


            /* -----------------------------------------
               Resolve cases
            ----------------------------------------- */

            const cases =

                getCasesForPor(

                    Store,

                    porKey

                );


            /* -----------------------------------------
               If Store returns no case record,
               preserve POR itself.

               This ensures the cascade can still
               navigate by POR.
            ----------------------------------------- */

            if (
                cases.length ===
                0
            ) {

                bucket
                    .porNos
                    .push(
                        porKey
                    );

            }


            /* -----------------------------------------
               Add all case relationships
            ----------------------------------------- */

            for (
                const caseRecord
                of cases
            ) {

                if (
                    !caseRecord
                ) {

                    continue;

                }


                bucket
                    .cases
                    .push(
                        caseRecord
                    );


                const caseId =

                    getCaseId(
                        caseRecord
                    );


                if (
                    caseId
                ) {

                    bucket
                        .caseIds
                        .push(
                            caseId
                        );

                }


                const porNo =

                    getPorNo(

                        caseRecord,

                        porKey

                    );


                if (
                    porNo
                ) {

                    bucket
                        .porNos
                        .push(
                            porNo
                        );

                }

            }

        }


        /* =================================================
           19. FINALIZE EACH RANGE BUCKET
        ================================================= */

        for (
            const [
                code,
                bucket
            ]
            of rangeIndex
        ) {

            bucket.porKeys =

                unique(
                    bucket.porKeys
                );


            bucket.porNos =

                unique(
                    bucket.porNos
                );


            bucket.caseIds =

                unique(
                    bucket.caseIds
                );


            /* -----------------------------------------
               Deduplicate case objects by ID.

               Cases without an ID are preserved.
            ----------------------------------------- */

            const caseMap =

                new Map();


            const casesWithoutId =

                [];


            for (
                const caseRecord
                of bucket.cases
            ) {

                const caseId =

                    getCaseId(
                        caseRecord
                    );


                if (
                    caseId
                ) {

                    if (
                        !caseMap.has(
                            String(
                                caseId
                            )
                        )
                    ) {

                        caseMap.set(

                            String(
                                caseId
                            ),

                            caseRecord

                        );

                    }

                }

                else {

                    casesWithoutId
                        .push(
                            caseRecord
                        );

                }

            }


            bucket.cases = [

                ...caseMap.values(),

                ...casesWithoutId

            ];


            bucket.offenceCount =

                bucket
                    .porKeys
                    .length;


            bucket.caseCount =

                bucket
                    .cases
                    .length;


            /* -----------------------------------------
               If one POR = one case in current Store,
               caseCount may match porCount.

               If not, caseCount remains independently
               calculated.
            ----------------------------------------- */

            rangeIndex.set(

                code,

                bucket

            );

        }


        /* =================================================
           20. ACCOUNTING
        ================================================= */

        const assigned =

            Array.from(

                rangeIndex.values()

            )

                .reduce(

                    (
                        total,
                        bucket
                    ) =>

                        total +

                        bucket
                            .porKeys
                            .length,

                    0

                );


        const total =

            allPorKeys.length;


        const unmapped =

            unmappedPorKeys.length;


        const accounted =

            assigned +

            unmapped;


        /* =================================================
           21. SAVE MODULE STATE
        ================================================= */

        TargetRangeCascade.rangeIndex =

            rangeIndex;


        TargetRangeCascade.unmappedPorKeys =

            unmappedPorKeys;


        TargetRangeCascade.stats = {

            total:
                total,

            assigned:
                assigned,

            unmapped:
                unmapped,

            accounted:
                accounted

        };


        /* ---------------------------------------------
           Legacy globals retained for compatibility
           with your existing console-tested code.
        --------------------------------------------- */

        window.__offenceTargetRangeIndex =

            rangeIndex;


        window.__offenceUnmappedPorKeys =

            unmappedPorKeys;


        /* =================================================
           22. DEBUG TABLE
        ================================================= */

        const distribution =

            Array.from(

                rangeIndex.values()

            )

                .map(

                    bucket => ({

                        code:
                            bucket.code,

                        range:
                            bucket.range,

                        porCount:

                            bucket
                                .porKeys
                                .length,

                        caseCount:

                            bucket
                                .cases
                                .length

                    })

                );


        console.log(
            "=========================================="
        );

        console.log(
            "🎯 TARGET RANGE DISTRIBUTION"
        );


        console.table(
            distribution
        );


        console.log(

            "📁 TOTAL STORE POR KEYS:",

            total

        );


        console.log(

            "✅ ASSIGNED TO 7 TARGET RANGES:",

            assigned

        );


        console.log(

            "⚠ UNMAPPED POR KEYS:",

            unmapped

        );


        console.log(

            "⚠ UNMAPPED SAMPLE:",

            unmappedPorKeys
                .slice(
                    0,
                    30
                )

        );


        console.log(

            "📊 ACCOUNTING CHECK:",

            {

                total:
                    total,

                assigned:
                    assigned,

                unmapped:
                    unmapped,

                accounted:
                    accounted

            }

        );


        console.log(
            "=========================================="
        );


        /* =================================================
           23. ACCOUNTING SAFETY CHECK
        ================================================= */

        if (
            accounted !==
            total
        ) {

            console.error(

                "❌ TARGET RANGE ACCOUNTING MISMATCH",

                {

                    total:
                        total,

                    assigned:
                        assigned,

                    unmapped:
                        unmapped,

                    accounted:
                        accounted

                }

            );

        }


        return {

            rangeIndex:
                rangeIndex,

            unmappedPorKeys:
                unmappedPorKeys,

            stats:

                {

                    total:
                        total,

                    assigned:
                        assigned,

                    unmapped:
                        unmapped,

                    accounted:
                        accounted

                }

        };

    }


    /* =====================================================
       24. EXPOSE INDEX BUILDER
    ===================================================== */

    TargetRangeCascade
        .buildTargetRangeIndex =

        buildTargetRangeIndex;


    /* =====================================================
       25. GET RANGE BUCKET BY CODE
    ===================================================== */

    function getRangeBucket(
        code
    ) {

        const normalizedCode =

            normalizeText(
                code
            );


        return (

            TargetRangeCascade
                .rangeIndex
                .get(
                    normalizedCode
                ) ||

            null

        );

    }


    TargetRangeCascade
        .getRangeBucket =

        getRangeBucket;


    /* =====================================================
       26. GET ALL RANGE BUCKETS
    ===================================================== */

    function getAllRangeBuckets() {

        return Array.from(

            TargetRangeCascade
                .rangeIndex
                .values()

        );

    }


    TargetRangeCascade
        .getAllRangeBuckets =

        getAllRangeBuckets;


    /* =====================================================
       PART 2 END

       At this point we have:

       Offence Store
           ↓
       All POR keys
           ↓
       Seven TARGET buckets
           ↓
       rangeIndex

       PART 3 WILL ADD:

       MAP CLICK
           ↓
       Turf point-in-polygon
           ↓
       GIS division/range/beat/compartment
           ↓
       Canonical target code
           ↓
       NMT / WDPO / EDPO / HTG /
       WRVK / ERVK / PANA

       DO NOT ADD:

           })();

       YET.
    ===================================================== */


     /* =====================================================
       27. SAFE FEATURE PROPERTY READER

       GIS files may use slightly different property names.

       This helper checks multiple possible field names.
    ===================================================== */

    function getFeatureProperty(
        feature,
        keys
    ) {

        if (
            !feature ||
            !feature.properties
        ) {

            return null;

        }


        const properties =

            feature.properties;


        for (
            const key
            of keys
        ) {

            const value =

                properties[
                    key
                ];


            if (
                value !==
                    undefined &&

                value !==
                    null &&

                String(
                    value
                ).trim() !==
                    ""
            ) {

                return value;

            }

        }


        return null;

    }


    /* =====================================================
       28. FIND GIS FEATURE AT CLICKED POINT

       Uses:

       window.allGISFeatures

       The feature may represent:

       - Division
       - Range
       - Beat

       We search all matching polygons and choose the
       most useful feature containing RANGE information.
    ===================================================== */

    function findGISFeatureAtPoint(
        lat,
        lng
    ) {

        const features =

            Array.isArray(
                window.allGISFeatures
            )

                ? window.allGISFeatures

                : [];


        if (
            features.length ===
            0
        ) {

            return null;

        }


        const point =

            turf.point([

                Number(
                    lng
                ),

                Number(
                    lat
                )

            ]);


        const matches =

            [];


        for (
            const feature
            of features
        ) {

            if (
                !feature ||
                !feature.geometry
            ) {

                continue;

            }


            try {

                if (
                    turf.booleanPointInPolygon(

                        point,

                        feature

                    )
                ) {

                    matches.push(
                        feature
                    );

                }

            }

            catch (
                error
            ) {

                // Ignore invalid GIS geometry.

            }

        }


        if (
            matches.length ===
            0
        ) {

            return null;

        }


        /* ---------------------------------------------
           Prefer a feature containing an explicit
           RANGE property.
        --------------------------------------------- */

        const rangeFeature =

            matches.find(

                feature => {

                    return !!getFeatureProperty(

                        feature,

                        [

                            "range",

                            "Range",

                            "RANGE",

                            "range_name",

                            "Range_Name",

                            "RANGE_NAME",

                            "rangeName",

                            "RangeName"

                        ]

                    );

                }

            );


        if (
            rangeFeature
        ) {

            return rangeFeature;

        }


        /* ---------------------------------------------
           Otherwise prefer the smallest matching
           polygon.

           This normally gives the most specific GIS
           feature when polygons are nested.
        --------------------------------------------- */

        let bestFeature =

            matches[
                0
            ];


        let bestArea =

            Infinity;


        for (
            const feature
            of matches
        ) {

            try {

                const area =

                    turf.area(
                        feature
                    );


                if (
                    area <
                    bestArea
                ) {

                    bestArea =
                        area;


                    bestFeature =
                        feature;

                }

            }

            catch (
                error
            ) {

                // Keep current best feature.

            }

        }


        return bestFeature;

    }


    /* =====================================================
       29. FIND COMPARTMENT AT CLICKED POINT

       Uses:

       window.allCompartmentFeatures

       Compartment is useful for debug/context.

       TARGET assignment itself remains RANGE based.
    ===================================================== */

    function findCompartmentAtPoint(
        lat,
        lng
    ) {

        const features =

            Array.isArray(
                window.allCompartmentFeatures
            )

                ? window.allCompartmentFeatures

                : [];


        if (
            features.length ===
            0
        ) {

            return null;

        }


        const point =

            turf.point([

                Number(
                    lng
                ),

                Number(
                    lat
                )

            ]);


        for (
            const feature
            of features
        ) {

            if (
                !feature ||
                !feature.geometry
            ) {

                continue;

            }


            try {

                if (
                    turf.booleanPointInPolygon(

                        point,

                        feature

                    )
                ) {

                    return feature;

                }

            }

            catch (
                error
            ) {

                // Ignore invalid compartment geometry.

            }

        }


        return null;

    }


    /* =====================================================
       30. EXTRACT GIS LOCATION CONTEXT

       Produces:

       {
           division,
           range,
           beat,
           compartment,
           gisFeature,
           compartmentFeature
       }

       This follows the same spatial-click approach that
       already worked in your Console test.
    ===================================================== */

    function resolveLocation(
        lat,
        lng
    ) {

        const gisFeature =

            findGISFeatureAtPoint(

                lat,

                lng

            );


        const compartmentFeature =

            findCompartmentAtPoint(

                lat,

                lng

            );


        /* ---------------------------------------------
           GIS FEATURE PROPERTIES
        --------------------------------------------- */

        const division =

            getFeatureProperty(

                gisFeature,

                [

                    "division",

                    "Division",

                    "DIVISION",

                    "division_name",

                    "Division_Name",

                    "DIVISION_NAME",

                    "divisionName"

                ]

            );


        const range =

            getFeatureProperty(

                gisFeature,

                [

                    "range",

                    "Range",

                    "RANGE",

                    "range_name",

                    "Range_Name",

                    "RANGE_NAME",

                    "rangeName",

                    "RangeName"

                ]

            );


        const beat =

            getFeatureProperty(

                gisFeature,

                [

                    "beat",

                    "Beat",

                    "BEAT",

                    "beat_name",

                    "Beat_Name",

                    "BEAT_NAME",

                    "beatName",

                    "BeatName"

                ]

            );


        /* ---------------------------------------------
           COMPARTMENT NAME
        --------------------------------------------- */

        const compartment =

            getFeatureProperty(

                compartmentFeature,

                [

                    "compartment",

                    "Compartment",

                    "COMPARTMENT",

                    "compartment_name",

                    "Compartment_Name",

                    "COMPARTMENT_NAME",

                    "compartmentName",

                    "name",

                    "Name",

                    "NAME",

                    "compt",

                    "Compt",

                    "COMPT"

                ]

            );


        return {

            lat:
                Number(
                    lat
                ),


            lng:
                Number(
                    lng
                ),


            division:
                division ||
                null,


            range:
                range ||
                null,


            beat:
                beat ||
                null,


            compartment:
                compartment ||
                null,


            gisFeature:
                gisFeature,


            compartmentFeature:
                compartmentFeature

        };

    }


    /* =====================================================
       31. RESOLVE TARGET CODE FROM GIS RANGE

       Examples:

       Nimati
           → NMT

       WestDamanpur
           → WDPO

       EastDamanpur
           → EDPO

       HamiltonGanj
           → HTG

       WestRajabhatkhawa
           → WRVK

       EastRajabhatkhawa
           → ERVK

       Pana
           → PANA
    ===================================================== */

    function resolveTargetCodeFromGISRange(
        rangeName
    ) {

        if (
            !rangeName
        ) {

            return null;

        }


        const normalized =

            normalizeText(
                rangeName
            );


        const compact =

            compactText(
                rangeName
            );


        /* ---------------------------------------------
           Direct canonical code
        --------------------------------------------- */

        if (
            TARGET_RANGES[
                normalized
            ]
        ) {

            return normalized;

        }


        /* ---------------------------------------------
           Match aliases
        --------------------------------------------- */

        for (
            const [
                code,
                config
            ]
            of Object.entries(
                TARGET_RANGES
            )
        ) {

            const aliases =

                config.aliases ||

                [];


            for (
                const alias
                of aliases
            ) {

                const aliasNormalized =

                    normalizeText(
                        alias
                    );


                const aliasCompact =

                    compactText(
                        alias
                    );


                if (

                    normalized ===
                        aliasNormalized ||

                    compact ===
                        aliasCompact

                ) {

                    return code;

                }

            }

        }


        /* ---------------------------------------------
           Conservative contains fallback

           Useful if GIS range value contains extra text:

           "Nimati Range"
           "West Damanpur Range"
        --------------------------------------------- */

        for (
            const [
                code,
                config
            ]
            of Object.entries(
                TARGET_RANGES
            )
        ) {

            const candidates = [

                config.name,

                ...(config.aliases || [])

            ];


            for (
                const candidate
                of candidates
            ) {

                const candidateCompact =

                    compactText(
                        candidate
                    );


                if (
                    candidateCompact &&

                    (

                        compact.includes(
                            candidateCompact
                        ) ||

                        candidateCompact.includes(
                            compact
                        )

                    )
                ) {

                    return code;

                }

            }

        }


        return null;

    }


    /* =====================================================
       32. FALLBACK TARGET RESOLUTION FROM FULL LOCATION

       Primary rule:

           GIS RANGE → TARGET

       Fallback:

           If the selected GIS feature does not expose
           its range correctly, inspect beat and
           compartment text.

       This DOES NOT change the target model.

       The final TARGET is still one of seven ranges.
    ===================================================== */

    function resolveTargetCodeFromLocation(
        location
    ) {

        if (
            !location
        ) {

            return null;

        }


        /* ---------------------------------------------
           Priority 1:
           Explicit GIS range
        --------------------------------------------- */

        const directRangeCode =

            resolveTargetCodeFromGISRange(

                location.range

            );


        if (
            directRangeCode
        ) {

            return directRangeCode;

        }


        /* ---------------------------------------------
           Priority 2:
           Combined spatial context
        --------------------------------------------- */

        const combinedText =

            [

                location.range,

                location.beat,

                location.compartment

            ]

                .filter(
                    Boolean
                )

                .join(
                    " "
                );


        const combinedCompact =

            compactText(
                combinedText
            );


        if (
            !combinedCompact
        ) {

            return null;

        }


        for (
            const [
                code,
                config
            ]
            of Object.entries(
                TARGET_RANGES
            )
        ) {

            const candidates = [

                config.name,

                ...(config.aliases || [])

            ];


            for (
                const candidate
                of candidates
            ) {

                const candidateCompact =

                    compactText(
                        candidate
                    );


                if (
                    candidateCompact &&

                    combinedCompact.includes(
                        candidateCompact
                    )
                ) {

                    return code;

                }

            }

        }


        return null;

    }


    /* =====================================================
       33. EXPOSE SPATIAL FUNCTIONS

       Useful for Console testing:

       GG.Offence.TargetRangeCascade.resolveLocation(...)

       GG.Offence.TargetRangeCascade
           .resolveTargetCodeFromGISRange(...)
    ===================================================== */

    TargetRangeCascade
        .findGISFeatureAtPoint =

        findGISFeatureAtPoint;


    TargetRangeCascade
        .findCompartmentAtPoint =

        findCompartmentAtPoint;


    TargetRangeCascade
        .resolveLocation =

        resolveLocation;


    TargetRangeCascade
        .resolveTargetCodeFromGISRange =

        resolveTargetCodeFromGISRange;


    TargetRangeCascade
        .resolveTargetCodeFromLocation =

        resolveTargetCodeFromLocation;


    /* =====================================================
       34. DEBUG SPATIAL CLICK

       This does NOT open the cascade.

       It only resolves:

       CLICK
           ↓
       GIS
           ↓
       TARGET CODE

       Useful for debugging.
    ===================================================== */

    function debugSpatialLocation(
        lat,
        lng
    ) {

        const location =

            resolveLocation(

                lat,

                lng

            );


        const targetCode =

            resolveTargetCodeFromLocation(

                location

            );


        const result = {

            lat:
                lat,


            lng:
                lng,


            division:
                location
                    ?.division ||
                null,


            range:
                location
                    ?.range ||
                null,


            beat:
                location
                    ?.beat ||
                null,


            compartment:
                location
                    ?.compartment ||
                null,


            targetCode:
                targetCode,


            targetRange:

                targetCode

                    ? TARGET_RANGES[
                        targetCode
                    ]?.name

                    : null,


            hasGISFeature:

                !!location
                    ?.gisFeature,


            hasCompartment:

                !!location
                    ?.compartmentFeature

        };


        console.log(
            "=========================================="
        );


        console.log(
            "🔥 OFFENCE MAP SPATIAL CLICK"
        );


        console.table(
            result
        );


        console.log(

            "GIS FEATURE:",

            location
                ?.gisFeature

        );


        console.log(

            "COMPARTMENT FEATURE:",

            location
                ?.compartmentFeature

        );


        console.log(
            "=========================================="
        );


        return {

            ...result,

            location:
                location

        };

    }


    TargetRangeCascade
        .debugSpatialLocation =

        debugSpatialLocation;


    /* =====================================================
       PART 3 END

       We now have:

       MAP COORDINATES
           ↓
       Turf point-in-polygon
           ↓
       GIS Location
           ↓
       Range
           ↓
       Canonical TARGET code

       PART 4 WILL ADD THE CRITICAL WORKING FLOW:

       MAP CLICK
           ↓
       Resolve TARGET range
           ↓
       Get that range's POR bucket
           ↓
       Build synthetic TARGET_RANGE hotspot
           ↓
       CascadeController.openHotspot()
           ↓
       Existing cascading panel opens

       It will also bind/unbind the Leaflet map click
       safely so duplicate handlers are not created.

       DO NOT ADD:

           })();

       YET.
    ===================================================== */

     /* =====================================================
       35. BUILD TARGET RANGE HOTSPOT

       Converts one canonical TARGET range bucket into
       the hotspot structure expected by the existing:

           CascadeController.openHotspot()

       Example:

           HTG
               ↓
           TARGET_RANGE_HTG
               ↓
           All HTG POR keys
               ↓
           Existing CascadeController
    ===================================================== */

    function buildTargetRangeHotspot(
        code,
        bucket,
        location
    ) {

        const config =

            TARGET_RANGES[
                code
            ];


        if (
            !config ||
            !bucket
        ) {

            return null;

        }


        const hotspotId =

            "TARGET_RANGE_" +
            code;


        return {

            /* -----------------------------------------
               Canonical identity
            ----------------------------------------- */

            id:
                hotspotId,


            hotspotId:
                hotspotId,


            key:
                hotspotId,


            /* -----------------------------------------
               Entry type
            ----------------------------------------- */

            type:
                "TARGET",


            /* -----------------------------------------
               Display information
            ----------------------------------------- */

            name:
                config.name,


            range:
                config.name,


            rangeCode:
                code,


            /* -----------------------------------------
               Spatial context
            ----------------------------------------- */

            spatialType:
                "RANGE",


            spatialName:
                config.name,


            division:

                location
                    ?.division ||

                null,


            beat:

                location
                    ?.beat ||

                null,


            compartment:

                location
                    ?.compartment ||

                null,


            /* -----------------------------------------
               Click coordinates

               These are NOT offence coordinates.

               They represent where the user clicked
               inside the TARGET range.
            ----------------------------------------- */

            latitude:

                location
                    ?.lat ??

                null,


            longitude:

                location
                    ?.lng ??

                null,


            /* -----------------------------------------
               POR relationships

               This is the critical cascade input.
            ----------------------------------------- */

            porKey:

                bucket
                    .porKeys
                    ?.length ===
                1

                    ? bucket
                        .porKeys[
                            0
                        ]

                    : null,


            porKeys:

                Array.isArray(
                    bucket.porKeys
                )

                    ? [
                        ...bucket.porKeys
                    ]

                    : [],


            porNos:

                Array.isArray(
                    bucket.porNos
                )

                    ? [
                        ...bucket.porNos
                    ]

                    : [],


            /* -----------------------------------------
               Case relationships
            ----------------------------------------- */

            caseIds:

                Array.isArray(
                    bucket.caseIds
                )

                    ? [
                        ...bucket.caseIds
                    ]

                    : [],


            cases:

                Array.isArray(
                    bucket.cases
                )

                    ? [
                        ...bucket.cases
                    ]

                    : [],


            /* -----------------------------------------
               Counts
            ----------------------------------------- */

            offenceCount:

                bucket
                    .porKeys
                    ?.length ||

                0,


            caseCount:

                bucket
                    .cases
                    ?.length ||

                0

        };

    }


    TargetRangeCascade
        .buildTargetRangeHotspot =

        buildTargetRangeHotspot;


    /* =====================================================
       36. BUILD TARGET RANGE POLYGON CONTEXT

       CascadeController.handleHotspotEvent() and
       openHotspot() can preserve polygon/spatial context.

       We provide a lightweight synthetic polygon object.

       IMPORTANT:

       This is NOT a Leaflet polygon.

       It is cascade metadata describing the selected
       GIS TARGET range.
    ===================================================== */

    function buildTargetRangePolygon(
        code,
        bucket,
        location
    ) {

        const config =

            TARGET_RANGES[
                code
            ];


        const hotspotId =

            "TARGET_RANGE_" +
            code;


        return {

            id:
                hotspotId,


            hotspotId:
                hotspotId,


            key:
                hotspotId,


            type:
                "TARGET",


            name:

                config
                    ?.name ||

                code,


            range:

                config
                    ?.name ||

                code,


            rangeCode:
                code,


            spatialType:
                "RANGE",


            resolutionType:
                "RANGE",


            resolution:
                "RANGE",


            spatialName:

                config
                    ?.name ||

                code,


            division:

                location
                    ?.division ||

                null,


            beat:

                location
                    ?.beat ||

                null,


            compartment:

                location
                    ?.compartment ||

                null,


            porKey:

                bucket
                    ?.porKeys
                    ?.length ===
                1

                    ? bucket
                        .porKeys[
                            0
                        ]

                    : null,


            porKeys:

                Array.isArray(
                    bucket?.porKeys
                )

                    ? [
                        ...bucket.porKeys
                    ]

                    : []

        };

    }


    TargetRangeCascade
        .buildTargetRangePolygon =

        buildTargetRangePolygon;


    /* =====================================================
       37. OPEN TARGET RANGE CASCADE

       This is the main bridge:

       TARGET RANGE
           ↓
       Range Bucket
           ↓
       Synthetic TARGET hotspot
           ↓
       CascadeController.openHotspot()
           ↓
       Existing CascadeRenderer

       This DOES NOT create a new cascade system.
    ===================================================== */

    function openTargetRangeCascade(
        code,
        location,
        leafletEvent
    ) {

        const normalizedCode =

            normalizeText(
                code
            );


        /* ---------------------------------------------
           Validate canonical TARGET
        --------------------------------------------- */

        const config =

            TARGET_RANGES[
                normalizedCode
            ];


        if (
            !config
        ) {

            console.warn(

                "⚠ UNKNOWN TARGET RANGE CODE",

                normalizedCode

            );


            return {

                success:
                    false,

                reason:
                    "UNKNOWN_TARGET_RANGE"

            };

        }


        /* ---------------------------------------------
           Get range bucket
        --------------------------------------------- */

        const bucket =

            getRangeBucket(
                normalizedCode
            );


        if (
            !bucket
        ) {

            console.warn(

                "⚠ TARGET RANGE BUCKET NOT FOUND",

                normalizedCode

            );


            return {

                success:
                    false,

                reason:
                    "TARGET_BUCKET_NOT_FOUND"

            };

        }


        /* ---------------------------------------------
           Empty bucket protection
        --------------------------------------------- */

        if (
            !Array.isArray(
                bucket.porKeys
            ) ||

            bucket.porKeys.length ===
                0
        ) {

            console.warn(

                "ℹ️ NO POR CASES FOR TARGET RANGE",

                {

                    code:
                        normalizedCode,

                    range:
                        config.name

                }

            );


            return {

                success:
                    false,

                reason:
                    "NO_POR_FOR_TARGET_RANGE"

            };

        }


        /* ---------------------------------------------
           Build canonical synthetic hotspot
        --------------------------------------------- */

        const hotspot =

            buildTargetRangeHotspot(

                normalizedCode,

                bucket,

                location

            );


        /* ---------------------------------------------
           Build spatial polygon metadata
        --------------------------------------------- */

        const polygon =

            buildTargetRangePolygon(

                normalizedCode,

                bucket,

                location

            );


        if (
            !hotspot
        ) {

            return {

                success:
                    false,

                reason:
                    "HOTSPOT_BUILD_FAILED"

            };

        }


        /* ---------------------------------------------
           Click coordinates
        --------------------------------------------- */

        const latlng =

            location

                ? {

                    lat:
                        location.lat,

                    lng:
                        location.lng

                }

                : null;


        console.log(
            "=========================================="
        );


        console.log(

            "🔥 OPENING TARGET RANGE CASCADE",

            {

                code:
                    normalizedCode,

                range:
                    config.name,

                hotspotId:
                    hotspot.hotspotId,

                porCount:
                    hotspot
                        .porKeys
                        .length,

                caseCount:
                    hotspot
                        .cases
                        .length,

                location:
                    location

            }

        );


        /* =================================================
           38. OPEN EXISTING CASCADE

           IMPORTANT:

           We pass the synthetic hotspot itself in options.

           Your CascadeController.openHotspot() needs:

               hotspotId
               entryType
               options.hotspot

           Without options.hotspot, a synthetic range ID
           may produce:

               HOTSPOT_NOT_FOUND

           because TARGET_RANGE_HTG etc. do not exist
           inside TargetEngine.idIndex.

           Passing the hotspot preserves the aggregated
           POR relationships.
        ================================================= */

        let result;


        try {

            result =

                GG.Offence
                    .CascadeController
                    .openHotspot(

                        hotspot.hotspotId,

                        "TARGET",

                        {

                            hotspot:
                                hotspot,


                            polygon:
                                polygon,


                            latlng:
                                latlng,


                            spatialType:
                                "RANGE",


                            spatialName:
                                config.name,


                            porKey:
                                hotspot.porKey,


                            porKeys:
                                hotspot.porKeys,


                            leafletEvent:
                                leafletEvent ||

                                null

                        }

                    );

        }

        catch (
            error
        ) {

            console.error(

                "❌ TARGET RANGE CASCADE OPEN ERROR",

                error

            );


            return {

                success:
                    false,

                reason:
                    "CASCADE_OPEN_EXCEPTION",

                error:
                    error

            };

        }


        console.log(

            "✅ CASCADE RESULT:",

            result

        );


        console.log(

            "🔥 CASCADE STATE:",

            GG.Offence
                .CascadeController
                .getState
                ?.()

        );


        /* =================================================
           39. FORCE RENDERER DISPLAY IF NECESSARY

           Normally CascadeController dispatches its event
           and CascadeRenderer reacts automatically.

           show() is used only as a safe UI fallback when
           the controller successfully opens the cascade.
        ================================================= */

        if (
            result?.success ===
            true
        ) {

            const Renderer =

                GG.Offence
                    ?.CascadeRenderer;


            if (
                Renderer
            ) {

                try {

                    if (
                        typeof Renderer
                            .show ===
                        "function"
                    ) {

                        Renderer
                            .show();

                    }


                    if (
                        typeof Renderer
                            .render ===
                        "function"
                    ) {

                        Renderer
                            .render();

                    }

                }

                catch (
                    error
                ) {

                    console.warn(

                        "⚠ CASCADE OPENED BUT RENDER FALLBACK FAILED",

                        error

                    );

                }

            }

        }


        return result;

    }


    TargetRangeCascade
        .openTargetRangeCascade =

        openTargetRangeCascade;


    /* =====================================================
       40. MAIN MAP CLICK HANDLER

       MAP CLICK
           ↓
       Resolve GIS location
           ↓
       Resolve canonical TARGET range
           ↓
       Find target range bucket
           ↓
       Open existing cascade
    ===================================================== */

    function handleMapClick(
        event
    ) {

        if (
            !event ||
            !event.latlng
        ) {

            return;

        }


        const lat =

            Number(
                event.latlng.lat
            );


        const lng =

            Number(
                event.latlng.lng
            );


        if (
            !Number.isFinite(
                lat
            ) ||

            !Number.isFinite(
                lng
            )
        ) {

            return;

        }


        console.log(

            "🔥 OFFENCE TARGET MAP CLICK",

            {

                lat:
                    lat,

                lng:
                    lng

            }

        );


        /* ---------------------------------------------
           Resolve spatial GIS context
        --------------------------------------------- */

        const location =

            resolveLocation(

                lat,

                lng

            );


        console.log(

            "🔥 CLICKED GIS LOCATION:",

            {

                division:
                    location
                        ?.division,

                range:
                    location
                        ?.range,

                beat:
                    location
                        ?.beat,

                compartment:
                    location
                        ?.compartment

            }

        );


        /* ---------------------------------------------
           No GIS feature
        --------------------------------------------- */

        if (
            !location ||
            !location.gisFeature
        ) {

            console.log(

                "ℹ️ CLICK OUTSIDE KNOWN GIS TARGET AREA"

            );


            return;

        }


        /* ---------------------------------------------
           Resolve one of seven TARGET ranges
        --------------------------------------------- */

        const targetCode =

            resolveTargetCodeFromLocation(

                location

            );


        if (
            !targetCode
        ) {

            console.log(

                "ℹ️ GIS LOCATION IS NOT MAPPED TO A TARGET RANGE",

                {

                    range:
                        location.range,

                    beat:
                        location.beat,

                    compartment:
                        location.compartment

                }

            );


            return;

        }


        const bucket =

            getRangeBucket(
                targetCode
            );


        console.log(

            "🎯 RESOLVED TARGET RANGE",

            {

                code:
                    targetCode,

                range:

                    TARGET_RANGES[
                        targetCode
                    ]?.name,

                porCount:

                    bucket
                        ?.porKeys
                        ?.length ||

                    0,

                caseCount:

                    bucket
                        ?.cases
                        ?.length ||

                    0

            }

        );


        /* ---------------------------------------------
           Open cascade
        --------------------------------------------- */

        return openTargetRangeCascade(

            targetCode,

            location,

            event

        );

    }


    TargetRangeCascade
        .handleMapClick =

        handleMapClick;


    /* =====================================================
       41. UNBIND PREVIOUS MAP HANDLER

       Important during:

       - hot reload
       - script reload
       - manual reinitialization

       Prevents duplicate cascade openings.
    ===================================================== */

    function unbindMapClick() {

        if (
            !window.map
        ) {

            return false;

        }


        if (
            window.__offenceRangeCascadeClick
        ) {

            window.map.off(

                "click",

                window.__offenceRangeCascadeClick

            );

        }


        window.__offenceRangeCascadeClick =

            null;


        return true;

    }


    TargetRangeCascade
        .unbindMapClick =

        unbindMapClick;


    /* =====================================================
       42. BIND MAP CLICK

       Stores handler globally for compatibility with
       your existing working Console implementation:

           window.__offenceRangeCascadeClick
    ===================================================== */

    function bindMapClick() {

        if (
            !window.map
        ) {

            console.warn(
                "⚠ MAP NOT AVAILABLE FOR CASCADE BIND"
            );


            return false;

        }


        /* ---------------------------------------------
           Remove previous instance
        --------------------------------------------- */

        unbindMapClick();


        /* ---------------------------------------------
           Register canonical handler
        --------------------------------------------- */

        window.__offenceRangeCascadeClick =

            function (
                event
            ) {

                return handleMapClick(
                    event
                );

            };


        window.map.on(

            "click",

            window.__offenceRangeCascadeClick

        );


        console.log(

            "✅ OFFENCE TARGET RANGE MAP CLICK BOUND",

            {

                handler:

                    typeof window
                        .__offenceRangeCascadeClick

            }

        );


        return true;

    }


    TargetRangeCascade
        .bindMapClick =

        bindMapClick;


    /* =====================================================
       43. MANUAL RANGE OPEN

       Allows Console testing without clicking the map.

       Example:

       GG.Offence.TargetRangeCascade
           .openRange("HTG");

       This should open all HamiltonGanj PORs.
    ===================================================== */

    function openRange(
        code
    ) {

        const normalizedCode =

            normalizeText(
                code
            );


        if (
            !TARGET_RANGES[
                normalizedCode
            ]
        ) {

            console.warn(

                "⚠ INVALID TARGET RANGE",

                code

            );


            return {

                success:
                    false,

                reason:
                    "INVALID_TARGET_RANGE"

            };

        }


        return openTargetRangeCascade(

            normalizedCode,

            {

                lat:
                    null,

                lng:
                    null,

                division:
                    null,

                range:

                    TARGET_RANGES[
                        normalizedCode
                    ].name,

                beat:
                    null,

                compartment:
                    null,

                gisFeature:
                    null,

                compartmentFeature:
                    null

            },

            null

        );

    }


    TargetRangeCascade
        .openRange =

        openRange;


    /* =====================================================
       PART 4 END

       We now have the complete functional flow:

       MAP CLICK
           ↓
       handleMapClick()
           ↓
       resolveLocation()
           ↓
       resolveTargetCodeFromLocation()
           ↓
       getRangeBucket()
           ↓
       buildTargetRangeHotspot()
           ↓
       CascadeController.openHotspot()
           ↓
       CascadeRenderer

       PART 5 WILL COMPLETE THE FILE:

       - init()
       - dependency retry
       - build range index
       - bind map click
       - public status/debug methods
       - auto initialization
       - final })();

       DO NOT CLOSE THE IIFE YET.
    ===================================================== */

     /* =====================================================
       44. CLEAR RETRY TIMER
    ===================================================== */

    function clearRetryTimer() {

        if (
            retryTimer
        ) {

            clearTimeout(
                retryTimer
            );


            retryTimer =
                null;

        }

    }


    /* =====================================================
       45. SCHEDULE INITIALIZATION RETRY

       The permanent JS file may load before:

       - Leaflet map
       - Turf
       - Offence Store
       - CascadeController
       - GIS data

       Instead of permanently failing, retry until the
       application dependencies are ready.
    ===================================================== */

    function scheduleRetry() {

        if (
            initialized
        ) {

            return;

        }


        if (
            retryTimer
        ) {

            return;

        }


        if (
            initAttempts >=
            MAX_INIT_ATTEMPTS
        ) {

            console.error(
                "=========================================="
            );


            console.error(
                "❌ OFFENCE TARGET RANGE CASCADE INIT TIMEOUT"
            );


            console.error(

                "DEPENDENCY STATUS:",

                getDependencyStatus()

            );


            console.error(
                "=========================================="
            );


            return;

        }


        retryTimer =

            setTimeout(

                function () {

                    retryTimer =
                        null;


                    init();

                },

                RETRY_INTERVAL

            );

    }


    /* =====================================================
       46. MAIN INITIALIZATION

       Correct startup order:

       JS file loaded
           ↓
       Dependencies ready?
           ↓
       NO → retry
           ↓
       YES
           ↓
       Offence Store
           ↓
       Build 7 TARGET range index
           ↓
       Bind Leaflet map click
           ↓
       Module READY
    ===================================================== */

    function init(
        options = {}
    ) {

        const force =

            options.force ===
            true;


        /* ---------------------------------------------
           Already initialized
        --------------------------------------------- */

        if (
            initialized &&
            !force
        ) {

            return {

                success:
                    true,

                alreadyInitialized:
                    true,

                ready:
                    TargetRangeCascade.ready,

                stats:
                    TargetRangeCascade.stats

            };

        }


        /* ---------------------------------------------
           Force reinitialization

           Useful if offence Store was rebuilt and the
           7-range index needs rebuilding.
        --------------------------------------------- */

        if (
            force
        ) {

            clearRetryTimer();


            if (
                window.map &&
                window.__offenceRangeCascadeClick
            ) {

                window.map.off(

                    "click",

                    window.__offenceRangeCascadeClick

                );

            }


            window.__offenceRangeCascadeClick =

                null;


            initialized =
                false;


            TargetRangeCascade.initialized =
                false;


            TargetRangeCascade.ready =
                false;

        }


        initAttempts++;


        /* =================================================
           47. WAIT FOR DEPENDENCIES
        ================================================= */

        if (
            !dependenciesReady()
        ) {

            const status =

                getDependencyStatus();


            console.log(

                "⏳ OFFENCE TARGET RANGE CASCADE WAITING",

                {

                    attempt:
                        initAttempts,

                    map:
                        status.map,

                    turf:
                        status.turf,

                    offence:
                        status.offence,

                    store:
                        status.store,

                    storeReady:
                        status.storeReady,

                    cascadeController:
                        status.cascadeController,

                    gisCount:
                        status.gisCount,

                    compartmentCount:
                        status.compartmentCount

                }

            );


            scheduleRetry();


            return {

                success:
                    false,

                ready:
                    false,

                reason:
                    "DEPENDENCIES_NOT_READY",

                retrying:
                    true,

                dependencyStatus:
                    status

            };

        }


        /* =================================================
           48. DEPENDENCIES READY
        ================================================= */

        clearRetryTimer();


        const O =

            GG.Offence;


        const Store =

            O.Store;


        const CascadeController =

            O.CascadeController;


        console.log(
            "=========================================="
        );


        console.log(
            "🔥 INITIALIZING OFFENCE TARGET RANGE CASCADE"
        );


        console.log(

            "DEPENDENCIES:",

            {

                map:
                    !!window.map,

                turf:
                    typeof turf !==
                    "undefined",

                storeReady:
                    Store.ready ===
                    true,

                cascadeController:
                    !!CascadeController,

                gisCount:
                    window
                        .allGISFeatures
                        ?.length ||
                    0,

                compartmentCount:
                    window
                        .allCompartmentFeatures
                        ?.length ||
                    0

            }

        );


        /* =================================================
           49. BUILD TARGET RANGE INDEX

           This processes ALL Store POR keys.

           Example expected accounting:

           TOTAL STORE POR KEYS
                   ↓
           7 TARGET RANGES
                   +
           UNMAPPED
                   =
           TOTAL
        ================================================= */

        let buildResult;


        try {

            buildResult =

                buildTargetRangeIndex(
                    Store
                );

        }

        catch (
            error
        ) {

            console.error(

                "❌ TARGET RANGE INDEX BUILD FAILED",

                error

            );


            TargetRangeCascade.ready =
                false;


            return {

                success:
                    false,

                ready:
                    false,

                reason:
                    "INDEX_BUILD_FAILED",

                error:
                    error

            };

        }


        /* =================================================
           50. VERIFY INDEX

           Exactly seven canonical TARGET buckets should
           always exist, even if one bucket has zero PORs.
        ================================================= */

        if (
            !buildResult ||
            !(buildResult.rangeIndex instanceof Map)
        ) {

            console.error(
                "❌ INVALID TARGET RANGE INDEX"
            );


            return {

                success:
                    false,

                ready:
                    false,

                reason:
                    "INVALID_RANGE_INDEX"

            };

        }


        if (
            buildResult.rangeIndex.size !==
            7
        ) {

            console.warn(

                "⚠ TARGET RANGE INDEX DOES NOT CONTAIN 7 RANGES",

                {

                    size:
                        buildResult
                            .rangeIndex
                            .size

                }

            );

        }


        /* =================================================
           51. BIND MAP CLICK

           Remove any previous handler and register the
           current canonical handler.
        ================================================= */

        const mapBound =

            bindMapClick();


        if (
            !mapBound
        ) {

            console.error(
                "❌ TARGET RANGE MAP CLICK BIND FAILED"
            );


            TargetRangeCascade.ready =
                false;


            return {

                success:
                    false,

                ready:
                    false,

                reason:
                    "MAP_BIND_FAILED"

            };

        }


        /* =================================================
           52. MARK INITIALIZED
        ================================================= */

        initialized =
            true;


        TargetRangeCascade.initialized =
            true;


        TargetRangeCascade.ready =
            true;


        TargetRangeCascade.initializedAt =

            new Date();


        window.__offenceTargetRangeCascadeReady =

            true;


        /* =================================================
           53. FINAL DISTRIBUTION TABLE
        ================================================= */

        const finalDistribution =

            getAllRangeBuckets()

                .map(

                    bucket => ({

                        code:
                            bucket.code,

                        range:
                            bucket.range,

                        porCount:

                            bucket
                                .porKeys
                                ?.length ||

                            0,

                        caseCount:

                            bucket
                                .cases
                                ?.length ||

                            0

                    })

                );


        console.log(
            "=========================================="
        );


        console.log(
            "🎯 7 TARGET RANGE CASCADE DISTRIBUTION"
        );


        console.table(
            finalDistribution
        );


        console.log(

            "📊 ACCOUNTING:",

            TargetRangeCascade.stats

        );


        console.log(

            "🗺 MAP CLICK HANDLER:",

            typeof window
                .__offenceRangeCascadeClick

        );


        console.log(
            "=========================================="
        );


        console.log(
            "✅ 7 TARGET RANGE CASCADE READY"
        );


        console.log(
            "🎯 NMT  → Nimati"
        );


        console.log(
            "🎯 WDPO → WestDamanpur"
        );


        console.log(
            "🎯 EDPO → EastDamanpur"
        );


        console.log(
            "🎯 HTG  → HamiltonGanj"
        );


        console.log(
            "🎯 WRVK → WestRajabhatkhawa"
        );


        console.log(
            "🎯 ERVK → EastRajabhatkhawa"
        );


        console.log(
            "🎯 PANA → Pana"
        );


        console.log(
            "👉 CLICK A TARGET RANGE ON THE MAP"
        );


        console.log(
            "=========================================="
        );


        return {

            success:
                true,

            ready:
                true,

            stats:
                TargetRangeCascade.stats,

            rangeIndex:
                TargetRangeCascade.rangeIndex

        };

    }


    /* =====================================================
       54. EXPOSE INIT

       Permanent module API:

       GG.Offence.TargetRangeCascade.init()

       Force rebuild:

       GG.Offence.TargetRangeCascade.init({
           force: true
       });
    ===================================================== */

    TargetRangeCascade.init =

        init;


    /* =====================================================
       55. PUBLIC REBUILD

       Use this when the Offence Store has been rebuilt
       and you want to refresh POR distribution without
       reloading the entire page.
    ===================================================== */

    function rebuild() {

        console.log(
            "🔥 REBUILDING OFFENCE TARGET RANGE CASCADE"
        );


        return init({

            force:
                true

        });

    }


    TargetRangeCascade.rebuild =

        rebuild;


    /* =====================================================
       56. PUBLIC STATUS

       Console:

       GG.Offence.TargetRangeCascade.getStatus()
    ===================================================== */

    function getStatus() {

        return {

            version:
                VERSION,


            initialized:
                TargetRangeCascade
                    .initialized,


            ready:
                TargetRangeCascade
                    .ready,


            initializedAt:
                TargetRangeCascade
                    .initializedAt ||

                null,


            initAttempts:
                initAttempts,


            dependencies:
                getDependencyStatus(),


            stats:
                TargetRangeCascade
                    .stats,


            rangeCount:
                TargetRangeCascade
                    .rangeIndex
                    ?.size ||

                0,


            mapHandler:

                typeof window
                    .__offenceRangeCascadeClick,


            mapClickBound:

                !!(

                    window.map &&

                    window
                        .__offenceRangeCascadeClick

                )

        };

    }


    TargetRangeCascade.getStatus =

        getStatus;


    /* =====================================================
       57. PUBLIC DEBUG

       Console:

       GG.Offence.TargetRangeCascade.debug()
    ===================================================== */

    function debug() {

        const status =

            getStatus();


        console.log(
            "=========================================="
        );


        console.log(
            "🔥 OFFENCE TARGET RANGE CASCADE DEBUG"
        );


        console.log(

            "STATUS:",

            status

        );


        console.log(
            "🎯 RANGE DISTRIBUTION"
        );


        console.table(

            getAllRangeBuckets()

                .map(

                    bucket => ({

                        code:
                            bucket.code,

                        range:
                            bucket.range,

                        porCount:

                            bucket
                                .porKeys
                                ?.length ||

                            0,

                        caseCount:

                            bucket
                                .cases
                                ?.length ||

                            0

                    })

                )

        );


        console.log(

            "⚠ UNMAPPED POR COUNT:",

            TargetRangeCascade
                .unmappedPorKeys
                ?.length ||

            0

        );


        console.log(

            "⚠ UNMAPPED SAMPLE:",

            TargetRangeCascade
                .unmappedPorKeys
                ?.slice(
                    0,
                    30
                ) ||

            []

        );


        console.log(
            "=========================================="
        );


        return status;

    }


    TargetRangeCascade.debug =

        debug;


    /* =====================================================
       58. PUBLIC DESTROY

       Removes only this module's map click handler.

       It does NOT destroy:

       - map
       - Offence Store
       - CascadeController
       - CascadeRenderer
    ===================================================== */

    function destroy() {

        clearRetryTimer();


        unbindMapClick();


        initialized =
            false;


        TargetRangeCascade.initialized =
            false;


        TargetRangeCascade.ready =
            false;


        window.__offenceTargetRangeCascadeReady =

            false;


        console.log(
            "🛑 OFFENCE TARGET RANGE CASCADE DESTROYED"
        );


        return {

            success:
                true

        };

    }


    TargetRangeCascade.destroy =

        destroy;


    /* =====================================================
       59. GLOBAL INITIALIZER COMPATIBILITY

       This allows:

       window.initOffenceTargetRangeCascade();

       Useful if another startup module wants to
       explicitly initialize this module.
    ===================================================== */

    window.initOffenceTargetRangeCascade =

        function (
            options = {}
        ) {

            return TargetRangeCascade
                .init(
                    options
                );

        };


    /* =====================================================
       60. AUTO INITIALIZATION

       When this JS file loads:

       Dependencies ready
           → initialize immediately

       Dependencies not ready
           → init() schedules retry

       Therefore the permanent file behaves like the
       working Console code once the application is ready.
    ===================================================== */

    init();


})(); // END OFFENCE TARGET RANGE CASCADE MODULE
