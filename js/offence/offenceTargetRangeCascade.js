// ==================================================
// 🔥 OFFENCE TARGET RANGE CASCADE
//
// DESIGN:
//
// ALL STORE POR KEYS
//      ↓
// EXTRACT RANGE CODE FROM POR
//      ↓
// 7 CANONICAL TARGET RANGE BUCKETS
//      ↓
// MAP CLICK
//      ↓
// GIS RANGE
//      ↓
// TARGET RANGE BUCKET
//      ↓
// ALL PORs / CASES FOR THAT RANGE
//      ↓
// EXISTING CASCADE CONTROLLER
//
// TARGET RANGES:
//
// NMT   → Nimati
// WDPO  → WestDamanpur
// EDPO  → EastDamanpur
// HTG   → HamiltonGanj
// WRVK  → WestRajabhatkhawa
// ERVK  → EastRajabhatkhawa
// PANA  → Pana
// ==================================================

(() => {

    // ==================================================
    // 1. MODULE REFERENCES
    // ==================================================

    const O =
        GG.Offence;

    const Store =
        O.Store;

    const CascadeController =
        O.CascadeController;


    // ==================================================
    // 2. VALIDATE
    // ==================================================

    if (
        !window.map
    ) {

        console.error(
            "❌ MAP NOT AVAILABLE"
        );

        return;

    }


    if (
        !Store
    ) {

        console.error(
            "❌ OFFENCE STORE NOT AVAILABLE"
        );

        return;

    }


    if (
        !CascadeController
    ) {

        console.error(
            "❌ CASCADE CONTROLLER NOT AVAILABLE"
        );

        return;

    }


    if (
        typeof turf ===
        "undefined"
    ) {

        console.error(
            "❌ TURF NOT AVAILABLE"
        );

        return;

    }


    // ==================================================
    // 3. REMOVE OLD MAP CLICK HANDLERS
    // ==================================================

    if (
        window.__offenceDirectCascadeClick
    ) {

        window.map.off(

            "click",

            window.__offenceDirectCascadeClick

        );

        window.__offenceDirectCascadeClick =
            null;

    }


    if (
        window.__offenceRangeCascadeClick
    ) {

        window.map.off(

            "click",

            window.__offenceRangeCascadeClick

        );

        window.__offenceRangeCascadeClick =
            null;

    }


    // ==================================================
    // 4. CANONICAL 7 TARGET RANGES
    // ==================================================

    const TARGET_RANGES = {

        // ==============================================
        // NIMATI
        // ==============================================

        NMT: {

            code:
                "NMT",

            name:
                "Nimati",

            gisNames: [

                "NIMATI",
                "NMT"

            ]

        },


        // ==============================================
        // WEST DAMANPUR
        // ==============================================

        WDPO: {

            code:
                "WDPO",

            name:
                "WestDamanpur",

            gisNames: [

                "WESTDAMANPUR",
                "WEST DAMANPUR",
                "WDPO"

            ]

        },


        // ==============================================
        // EAST DAMANPUR
        // ==============================================

        EDPO: {

            code:
                "EDPO",

            name:
                "EastDamanpur",

            gisNames: [

                "EASTDAMANPUR",
                "EAST DAMANPUR",
                "EDPO"

            ]

        },


        // ==============================================
        // HAMILTON GANJ
        // ==============================================

        HTG: {

            code:
                "HTG",

            name:
                "HamiltonGanj",

            gisNames: [

                "HAMILTONGANJ",
                "HAMILTON GANJ",
                "HTG"

            ]

        },


        // ==============================================
        // WEST RAJABHATKHAWA
        // ==============================================

        WRVK: {

            code:
                "WRVK",

            name:
                "WestRajabhatkhawa",

            gisNames: [

                "WESTRAJABHATKHAWA",
                "WEST RAJABHATKHAWA",
                "WRVK"

            ]

        },


        // ==============================================
        // EAST RAJABHATKHAWA
        // ==============================================

        ERVK: {

            code:
                "ERVK",

            name:
                "EastRajabhatkhawa",

            gisNames: [

                "EASTRAJABHATKHAWA",
                "EAST RAJABHATKHAWA",
                "ERVK"

            ]

        },


        // ==============================================
        // PANA
        // ==============================================

        PANA: {

            code:
                "PANA",

            name:
                "Pana",

            gisNames: [

                "PANA"

            ]

        }

    };


    // ==================================================
    // 5. NORMALIZE TEXT
    // ==================================================

    function normalizeText(

        value

    ) {

        return String(

            value ||

            ""

        )
            .trim()

            .toUpperCase()

            .replace(

                /[^A-Z0-9]/g,

                ""

            );

    }


    // ==================================================
    // 6. EXTRACT TARGET RANGE CODE FROM POR KEY
    //
    // Examples:
    //
    // 32/NMT OF 2017-18
    //      ↓
    // NMT
    //
    // 68/HTG OF 2019-20
    //      ↓
    // HTG
    //
    // 10/WDPO OF 2020-21
    //      ↓
    // WDPO
    //
    // 1/PANA OF 2024-25
    //      ↓
    // PANA
    // ==================================================

    function extractRangeCodeFromPor(

        porKey

    ) {

        const value =

            String(

                porKey ||

                ""

            )
                .trim()

                .toUpperCase();


        if (
            !value
        ) {

            return null;

        }


        // ==============================================
        // CHECK EACH KNOWN TARGET CODE
        // ==============================================

        for (

            const code

            of Object.keys(

                TARGET_RANGES

            )

        ) {

            const escapedCode =

                code.replace(

                    /[.*+?^${}()|[\]\\]/g,

                    "\\$&"

                );


            const pattern =

                new RegExp(

                    "(?:^|[/\\s_-])" +

                    escapedCode +

                    "(?=\\s|$|OF|[-_/])",

                    "i"

                );


            if (

                pattern.test(

                    value

                )

            ) {

                return code;

            }

        }


        // ==============================================
        // FALLBACK
        //
        // Extract code between "/" and "OF"
        // ==============================================

        const match =

            value.match(

                /\/\s*([A-Z0-9_-]+)\s+(?:OF|\/)/i

            );


        if (

            match &&

            match[1]

        ) {

            const candidate =

                normalizeText(

                    match[1]

                );


            if (

                TARGET_RANGES[

                    candidate

                ]

            ) {

                return candidate;

            }

        }


        return null;

    }


    // ==================================================
    // 7. BUILD TARGET RANGE → POR INDEX
    //
    // AUTHORITATIVE SOURCE:
    //
    // Store.getAllPorKeys()
    //
    // TARGET ENGINE ADDRESS TEXT IS NOT USED.
    // ==================================================

    function buildTargetRangeIndex() {

        const index =

            new Map();


        const unmapped = [];


        // ==============================================
        // INITIALIZE ALL 7 TARGET BUCKETS
        // ==============================================

        for (

            const code

            of Object.keys(

                TARGET_RANGES

            )

        ) {

            index.set(

                code,

                {

                    code:
                        code,

                    name:

                        TARGET_RANGES[
                            code
                        ]
                            .name,

                    porKeys:
                        [],

                    cases:
                        []

                }

            );

        }


        // ==============================================
        // GET ALL POR KEYS
        // ==============================================

        const allPorKeys =

            typeof Store
                .getAllPorKeys ===
                "function"

                ? Store
                    .getAllPorKeys()

                : [];


        console.log(

            "📁 TOTAL STORE POR KEYS:",

            allPorKeys.length

        );


        // ==============================================
        // DISTRIBUTE PORs
        // ==============================================

        for (

            const porKey

            of allPorKeys

        ) {

            const code =

                extractRangeCodeFromPor(

                    porKey

                );


            // ==========================================
            // UNMAPPED / LEGACY POR CODE
            // ==========================================

            if (

                !code ||

                !index.has(

                    code

                )

            ) {

                unmapped.push(

                    porKey

                );


                continue;

            }


            // ==========================================
            // TARGET RANGE BUCKET
            // ==========================================

            const bucket =

                index.get(

                    code

                );


            bucket
                .porKeys
                .push(

                    porKey

                );


            // ==========================================
            // GET CASES FOR POR
            // ==========================================

            try {

                const cases =

                    Store
                        .getCasesByPor(

                            porKey

                        ) ||

                    [];


                for (

                    const caseRecord

                    of cases

                ) {

                    if (

                        !bucket
                            .cases
                            .includes(

                                caseRecord

                            )

                    ) {

                        bucket
                            .cases
                            .push(

                                caseRecord

                            );

                    }

                }

            }

            catch (

                error

            ) {

                console.warn(

                    "⚠ CASE LOOKUP FAILED:",

                    porKey,

                    error

                );

            }

        }


        // ==============================================
        // REMOVE DUPLICATE POR KEYS
        // ==============================================

        for (

            const bucket

            of index.values()

        ) {

            bucket.porKeys =

                [

                    ...new Set(

                        bucket
                            .porKeys

                    )

                ];

        }


        return {

            index:
                index,

            unmapped:
                unmapped,

            totalPorKeys:
                allPorKeys.length

        };

    }


    // ==================================================
    // 8. BUILD RANGE INDEX
    // ==================================================

    const rangeIndexResult =

        buildTargetRangeIndex();


    // ==============================================
    // EXPOSE FOR DEBUGGING
    // ==============================================

    window.__offenceTargetRangeIndex =

        rangeIndexResult
            .index;


    window.__offenceUnmappedPorKeys =

        rangeIndexResult
            .unmapped;


    window.__offenceTargetRanges =

        TARGET_RANGES;


    // ==================================================
    // 9. BUILD DISTRIBUTION TABLE
    // ==================================================

    const distribution = [];


    for (

        const [

            code,

            bucket

        ]

        of rangeIndexResult
            .index
            .entries()

    ) {

        distribution.push({

            code:
                code,

            range:
                bucket.name,

            porCount:

                bucket
                    .porKeys
                    .length,

            caseCount:

                bucket
                    .cases
                    .length

        });

    }


    // ==================================================
    // 10. PRINT TARGET DISTRIBUTION
    // ==================================================

    console.log(
        "=========================================="
    );


    console.log(
        "🎯 7 TARGET RANGE DISTRIBUTION"
    );


    console.table(

        distribution

    );


    console.log(

        "📁 TOTAL STORE POR KEYS:",

        rangeIndexResult
            .totalPorKeys

    );


    const assignedCount =

        distribution.reduce(

            (

                total,

                row

            ) =>

                total +

                row.porCount,

            0

        );


    console.log(

        "✅ ASSIGNED TO 7 TARGET RANGES:",

        assignedCount

    );


    console.log(

        "⚠ UNMAPPED POR KEYS:",

        rangeIndexResult
            .unmapped
            .length

    );


    console.log(

        "⚠ UNMAPPED SAMPLE:",

        rangeIndexResult
            .unmapped
            .slice(

                0,

                30

            )

    );


    console.log(

        "📊 ACCOUNTING CHECK:",

        {

            total:

                rangeIndexResult
                    .totalPorKeys,

            assigned:

                assignedCount,

            unmapped:

                rangeIndexResult
                    .unmapped
                    .length,

            accounted:

                assignedCount +

                rangeIndexResult
                    .unmapped
                    .length

        }

    );


    // ==================================================
    // 11. RESOLVE GIS LOCATION FROM MAP CLICK
    // ==================================================

    function resolveLocation(

        latlng

    ) {

        const point =

            turf.point([

                latlng.lng,

                latlng.lat

            ]);


        let gisFeature =
            null;


        let compartmentFeature =
            null;


        // ==============================================
        // FIND GIS FEATURE
        // ==============================================

        for (

            const feature

            of (

                window.allGISFeatures ||

                []

            )

        ) {

            try {

                if (

                    turf.booleanPointInPolygon(

                        point,

                        feature

                    )

                ) {

                    gisFeature =
                        feature;


                    break;

                }

            }

            catch (

                error

            ) {

                // Ignore malformed GIS feature

            }

        }


        // ==============================================
        // FIND COMPARTMENT FEATURE
        // ==============================================

        for (

            const feature

            of (

                window.allCompartmentFeatures ||

                []

            )

        ) {

            try {

                if (

                    turf.booleanPointInPolygon(

                        point,

                        feature

                    )

                ) {

                    compartmentFeature =
                        feature;


                    break;

                }

            }

            catch (

                error

            ) {

                // Ignore malformed compartment feature

            }

        }


        // ==============================================
        // PROPERTIES
        // ==============================================

        const gp =

            gisFeature
                ?.properties ||

            {};


        const cp =

            compartmentFeature
                ?.properties ||

            {};


        // ==============================================
        // RETURN LOCATION
        // ==============================================

        return {

            division:

                cp.Division ||

                cp.division ||

                gp.Division ||

                gp.division ||

                null,


            range:

                cp.Range ||

                cp.range ||

                gp.Range ||

                gp.range ||

                null,


            beat:

                cp.Beat ||

                cp.beat ||

                gp.Beat ||

                gp.beat ||

                null,


            compartment:

                cp.Compartment ||

                cp.compartment ||

                cp.compartmen ||

                null,


            gisFeature:
                gisFeature,


            compartmentFeature:
                compartmentFeature

        };

    }


    // ==================================================
    // 12. GIS RANGE NAME → CANONICAL TARGET CODE
    // ==================================================

    function resolveTargetCodeFromGISRange(

        rangeName

    ) {

        const normalizedRange =

            normalizeText(

                rangeName

            );


        if (

            !normalizedRange

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

            const candidates =

                [

                    config.name,

                    code,

                    ...(

                        config.gisNames ||

                        []

                    )

                ];


            for (

                const candidate

                of candidates

            ) {

                if (

                    normalizeText(

                        candidate

                    ) ===

                    normalizedRange

                ) {

                    return code;

                }

            }

        }


        return null;

    }


    // ==================================================
    // 13. MAP CLICK HANDLER
    // ==================================================

    window.__offenceRangeCascadeClick =

        function (

            e

        ) {

            try {

                console.log(
                    "=========================================="
                );


                console.log(

                    "🔥 OFFENCE TARGET MAP CLICK",

                    {

                        lat:
                            e.latlng.lat,

                        lng:
                            e.latlng.lng

                    }

                );


                // ==========================================
                // 13A. RESOLVE GIS LOCATION
                // ==========================================

                const location =

                    resolveLocation(

                        e.latlng

                    );


                console.log(

                    "🌍 CLICKED GIS LOCATION:",

                    {

                        division:
                            location.division,

                        range:
                            location.range,

                        beat:
                            location.beat,

                        compartment:
                            location.compartment

                    }

                );


                // ==========================================
                // 13B. REQUIRE GIS RANGE
                // ==========================================

                if (

                    !location.range

                ) {

                    console.log(

                        "ℹ️ NO GIS RANGE AT CLICK"

                    );


                    return;

                }


                // ==========================================
                // 13C. GIS RANGE → TARGET CODE
                // ==========================================

                const targetCode =

                    resolveTargetCodeFromGISRange(

                        location.range

                    );


                console.log(

                    "🎯 TARGET RANGE CODE:",

                    targetCode

                );


                if (

                    !targetCode

                ) {

                    console.warn(

                        "⚠ GIS RANGE IS NOT ONE OF 7 TARGET RANGES:",

                        location.range

                    );


                    return;

                }


                // ==========================================
                // 13D. GET TARGET RANGE BUCKET
                // ==========================================

                const bucket =

                    window
                        .__offenceTargetRangeIndex
                        .get(

                            targetCode

                        );


                if (

                    !bucket

                ) {

                    console.warn(

                        "⚠ TARGET RANGE BUCKET NOT FOUND:",

                        targetCode

                    );


                    return;

                }


                // ==========================================
                // 13E. GET ALL POR KEYS FOR TARGET RANGE
                // ==========================================

                const porKeys =

                    bucket
                        .porKeys;


                console.log(

                    "📁 RANGE POR KEYS:",

                    porKeys

                );


                console.log(

                    "📊 TARGET RANGE COUNTS:",

                    {

                        targetCode:
                            targetCode,

                        range:
                            bucket.name,

                        porCount:

                            porKeys
                                .length,

                        caseCount:

                            bucket
                                .cases
                                .length

                    }

                );


                // ==========================================
                // 13F. NO POR DATA
                // ==========================================

                if (

                    !porKeys.length

                ) {

                    console.log(

                        "ℹ️ TARGET RANGE HAS NO POR DATA"

                    );


                    return;

                }


                // ==========================================
                // 13G. BUILD AGGREGATED TARGET RANGE HOTSPOT
                // ==========================================

                const hotspotId =

                    "TARGET_RANGE_" +

                    targetCode;


                const hotspot = {

                    id:
                        hotspotId,


                    hotspotId:
                        hotspotId,


                    key:

                        "TARGET::RANGE::" +

                        targetCode,


                    type:
                        "TARGET",


                    targetCode:
                        targetCode,


                    name:
                        bucket.name,


                    range:
                        bucket.name,


                    division:
                        location.division,


                    beat:
                        location.beat,


                    compartment:
                        location.compartment,


                    spatialType:
                        "RANGE",


                    spatialName:
                        bucket.name,


                    porKeys:
                        porKeys,


                    porCount:

                        porKeys
                            .length,


                    caseCount:

                        bucket
                            .cases
                            .length

                };


                // ==========================================
                // 13H. DEBUG
                // ==========================================

                console.log(

                    "🔥 OPENING TARGET RANGE CASCADE:",

                    {

                        hotspotId:
                            hotspotId,

                        targetCode:
                            targetCode,

                        range:
                            bucket.name,

                        porCount:

                            porKeys
                                .length,

                        caseCount:

                            bucket
                                .cases
                                .length

                    }

                );


                // ==========================================
                // 13I. OPEN EXISTING CASCADE
                //
                // SIGNATURE:
                //
                // openHotspot(
                //     hotspotId,
                //     entryType,
                //     options
                // )
                // ==========================================

                const result =

                    CascadeController
                        .openHotspot(

                            hotspotId,

                            "TARGET",

                            {

                                // ==========================
                                // AGGREGATED TARGET
                                // ==========================

                                hotspot:
                                    hotspot,


                                // ==========================
                                // ACTUAL GIS FEATURE
                                // ==========================

                                polygon:

                                    location
                                        .gisFeature,


                                // ==========================
                                // TARGET RESOLUTION
                                // ==========================

                                spatialType:
                                    "RANGE",


                                // ==========================
                                // TARGET RANGE NAME
                                // ==========================

                                spatialName:
                                    bucket.name,


                                // ==========================
                                // ALL PORs IN THIS RANGE
                                // ==========================

                                porKeys:
                                    porKeys,


                                // ==========================
                                // ORIGINAL MAP CLICK
                                // ==========================

                                latlng:
                                    e.latlng

                            }

                        );


                // ==========================================
                // 13J. RESULT
                // ==========================================

                console.log(

                    "✅ CASCADE RESULT:",

                    result

                );


                // ==========================================
                // 13K. STATE
                // ==========================================

                console.log(

                    "🔥 CASCADE STATE:",

                    CascadeController
                        .getState()

                );


                // ==========================================
                // 13L. SUCCESS
                // ==========================================

                if (

                    result
                        ?.success ===
                    true

                ) {

                    console.log(

                        "🎉 TARGET RANGE CASCADE OPENED"

                    );

                }

                else {

                    console.warn(

                        "⚠ CASCADE FAILED:",

                        result
                            ?.reason ||

                        "UNKNOWN_REASON"

                    );

                }


                console.log(
                    "=========================================="
                );

            }

            catch (

                error

            ) {

                console.error(

                    "❌ TARGET RANGE CLICK FAILED",

                    error

                );

            }

        };


    // ==================================================
    // 14. REGISTER MAP CLICK
    // ==================================================

    window.map.on(

        "click",

        window.__offenceRangeCascadeClick

    );


    // ==================================================
    // 15. READY
    // ==================================================

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

})();
