/* =========================================================
   GreenGuard
   Offence Intelligence Module

   File:
   js/offence/offenceTargetEngine.js

   Purpose:
   - Build TARGET offence hotspot dataset
   - Aggregate seizure / offence locations
   - Group repeated target locations
   - Count UNIQUE offences per target
   - Preserve linked Case IDs
   - Preserve linked seizure records
   - Prepare TARGET data for heatmap
   - Prepare TARGET data for click drill-down

   IMPORTANT:
   - NO Leaflet rendering
   - NO heatmap rendering
   - NO popup rendering
   - NO geocoding API calls

   Dependencies:
   1. offenceConstants.js
   2. offenceNormalizer.js
   3. offenceStore.js
   4. offenceGeocoder.js
   5. offenceSourceEngine.js (not directly required)
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
       2. DEPENDENCIES
       ===================================================== */

    const Constants =
        GG.Offence.Constants;

    const Store =
        GG.Offence.Store;

    const Geocoder =
        GG.Offence.Geocoder;


    if (!Constants) {

        console.error(
            "[OffenceTargetEngine] OffenceConstants unavailable."
        );

        return;

    }


    if (!Store) {

        console.error(
            "[OffenceTargetEngine] OffenceStore unavailable."
        );

        return;

    }


    if (!Geocoder) {

        console.error(
            "[OffenceTargetEngine] OffenceGeocoder unavailable."
        );

        return;

    }


    /* =====================================================
       3. MODULE
       ===================================================== */

    const TargetEngine = {};


    /* =====================================================
       4. MODULE INFO
       ===================================================== */

    TargetEngine.VERSION =
        "1.0.0";

    TargetEngine.initialized =
        false;


    /* =====================================================
       5. TARGET HOTSPOTS

       Final structure:

       [
           {
               id,
               key,
               type: "TARGET",

               name,
               address,

               latitude,
               longitude,

               offenceCount,
               seizureCount,
               heatWeight,

               caseIds: [],
               seizureIds: [],

               cases: [],
               seizures: []
           }
       ]
       ===================================================== */

    TargetEngine.hotspots =
        [];


    /* =====================================================
       6. PRIMARY HOTSPOT INDEX

       hotspot key
            ↓
       hotspot object
       ===================================================== */

    TargetEngine.index =
        new Map();


    /* =====================================================
       7. CASE INDEX

       CaseID
           ↓
       [
           targetHotspot,
           ...
       ]
       ===================================================== */

    TargetEngine.caseIndex =
        new Map();


    /* =====================================================
       8. SEIZURE INDEX

       SeizureID
           ↓
       targetHotspot
       ===================================================== */

    TargetEngine.seizureIndex =
        new Map();


    /* =====================================================
       9. INITIALIZE
       ===================================================== */

    TargetEngine.init =
        function () {

            if (
                TargetEngine.initialized
            ) {

                return TargetEngine;

            }


            TargetEngine.initialized =
                true;


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(
                    "🔥 OffenceTargetEngine Ready"
                );

            }


            return TargetEngine;

        };


    /* =====================================================
       10. NORMALIZE KEY
       ===================================================== */

    TargetEngine.normalizeKey =
        function (

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
            )

                .trim()

                .replace(
                    /\s+/g,
                    " "
                )

                .toUpperCase();

        };


    /* =====================================================
       11. VALIDATE COORDINATES
       ===================================================== */

    TargetEngine.isValidCoordinate =
        function (

            latitude,

            longitude

        ) {

            return Geocoder
                .isValidCoordinate(

                    latitude,

                    longitude

                );

        };


    /* =====================================================
       12. CREATE COORDINATE KEY

       Small coordinate differences are rounded to
       5 decimal places.

       This helps prevent accidental duplicate points.
       ===================================================== */

    TargetEngine.createCoordinateKey =
        function (

            latitude,

            longitude

        ) {

            if (
                !TargetEngine
                    .isValidCoordinate(

                        latitude,

                        longitude

                    )
            ) {

                return "";

            }


            return (

                Number(
                    latitude
                ).toFixed(
                    5
                ) +

                "|" +

                Number(
                    longitude
                ).toFixed(
                    5
                )

            );

        };


    /* =====================================================
       13. CREATE HOTSPOT KEY

       Primary grouping:
       normalized target location text

       Fallback:
       coordinates

       Example:

       "Buxa Tiger Reserve"
       repeated in 15 offences
              ↓
       ONE TARGET HOTSPOT
       ===================================================== */

    TargetEngine.createHotspotKey =
        function (

            location

        ) {

            if (!location) {

                return "";

            }


            const address =

                TargetEngine
                    .normalizeKey(

                        location
                            .normalizedAddress ||

                        location
                            .rawAddress ||

                        location
                            .name

                    );


            if (
                address
            ) {

                return (

                    "TARGET::" +

                    address

                );

            }


            const coordinateKey =

                TargetEngine
                    .createCoordinateKey(

                        location.latitude,

                        location.longitude

                    );


            if (
                coordinateKey
            ) {

                return (

                    "TARGET::COORD::" +

                    coordinateKey

                );

            }


            return "";

        };


    /* =====================================================
       14. CREATE HOTSPOT ID
       ===================================================== */

    TargetEngine.createHotspotId =
        function (

            key

        ) {

            return (

                "OFFENCE_TARGET_" +

                String(
                    key ||
                    ""
                )

                    .replace(
                        /[^A-Z0-9]+/gi,
                        "_"
                    )

                    .replace(
                        /^_+|_+$/g,
                        ""
                    )

            );

        };


    /* =====================================================
       15. ADD UNIQUE VALUE
       ===================================================== */

    TargetEngine.addUnique =
        function (

            array,

            value

        ) {

            if (
                !Array.isArray(
                    array
                )
            ) {

                return;

            }


            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {

                return;

            }


            const key =

                TargetEngine
                    .normalizeKey(

                        value

                    );


            const exists =

                array.some(

                    function (

                        existing

                    ) {

                        return (

                            TargetEngine
                                .normalizeKey(

                                    existing

                                ) ===

                            key

                        );

                    }

                );


            if (
                !exists
            ) {

                array.push(

                    value

                );

            }

        };


    /* =====================================================
       16. ADD UNIQUE OBJECT
       ===================================================== */

    TargetEngine.addUniqueObject =
        function (

            array,

            object,

            keyGetter

        ) {

            if (
                !Array.isArray(
                    array
                ) ||
                !object
            ) {

                return;

            }


            const key =

                TargetEngine
                    .normalizeKey(

                        keyGetter(
                            object
                        )

                    );


            if (
                !key
            ) {

                return;

            }


            const exists =

                array.some(

                    function (

                        existing

                    ) {

                        return (

                            TargetEngine
                                .normalizeKey(

                                    keyGetter(
                                        existing
                                    )

                                ) ===

                            key

                        );

                    }

                );


            if (
                !exists
            ) {

                array.push(

                    object

                );

            }

        };


    /* =====================================================
       17. CREATE EMPTY TARGET HOTSPOT
       ===================================================== */

    TargetEngine.createHotspot =
        function (

            location

        ) {

            const key =

                TargetEngine
                    .createHotspotKey(

                        location

                    );


            return {

                id:

                    TargetEngine
                        .createHotspotId(

                            key

                        ),

                key:

                    key,

                type:

                    Constants
                        .LOCATION_TYPE
                        .TARGET,

                name:

                    location.name ||

                    location.rawAddress ||

                    "Unknown Target",

                address:

                    location.rawAddress ||

                    location.name ||

                    "",

                normalizedAddress:

                    location.normalizedAddress ||

                    TargetEngine
                        .normalizeKey(

                            location.rawAddress ||

                            location.name

                        ),

                latitude:

                    Number(
                        location.latitude
                    ),

                longitude:

                    Number(
                        location.longitude
                    ),

                geocodeStatus:

                    location.geocodeStatus ||

                    null,

                offenceCount:

                    0,

                seizureCount:

                    0,

                heatWeight:

                    0,

                caseIds:

                    [],

                seizureIds:

                    [],

                cases:

                    [],

                seizures:

                    []

            };

        };


    /* =====================================================
       18. ADD CASE TO HOTSPOT
       ===================================================== */

    TargetEngine.addCase =
        function (

            hotspot,

            caseRecord

        ) {

            if (
                !hotspot ||
                !caseRecord
            ) {

                return;

            }


            if (
                caseRecord.caseId
            ) {

                TargetEngine
                    .addUnique(

                        hotspot.caseIds,

                        caseRecord.caseId

                    );

            }


            TargetEngine
                .addUniqueObject(

                    hotspot.cases,

                    caseRecord,

                    function (

                        item

                    ) {

                        return (

                            item.caseId ||

                            item.porNo

                        );

                    }

                );

        };


    /* =====================================================
       19. ADD SEIZURE TO HOTSPOT
       ===================================================== */

    TargetEngine.addSeizure =
        function (

            hotspot,

            seizure

        ) {

            if (
                !hotspot ||
                !seizure
            ) {

                return;

            }


            if (
                seizure.seizureId
            ) {

                TargetEngine
                    .addUnique(

                        hotspot.seizureIds,

                        seizure.seizureId

                    );

            }


            TargetEngine
                .addUniqueObject(

                    hotspot.seizures,

                    seizure,

                    function (

                        item

                    ) {

                        return (

                            item.seizureId ||

                            [

                                item.caseId,

                                item.seizureDate,

                                item.placeOfSeizure

                            ].join(
                                "|"
                            )

                        );

                    }

                );

        };


    /* =====================================================
       20. ADD RESOLVED TARGET

       Expected:

       {
           location: {...},
           seizure: {...}
       }
       ===================================================== */

    TargetEngine.addResolvedTarget =
        function (

            resolvedTarget,

            caseRecord

        ) {

            if (
                !resolvedTarget ||
                !resolvedTarget.location
            ) {

                return null;

            }


            const location =

                resolvedTarget.location;


            /* -------------------------
               Ignore unresolved location
               ------------------------- */

            if (
                !TargetEngine
                    .isValidCoordinate(

                        location.latitude,

                        location.longitude

                    )
            ) {

                return null;

            }


            /* -------------------------
               Build hotspot key
               ------------------------- */

            const key =

                TargetEngine
                    .createHotspotKey(

                        location

                    );


            if (
                !key
            ) {

                return null;

            }


            /* -------------------------
               Get/Create hotspot
               ------------------------- */

            let hotspot =

                TargetEngine.index
                    .get(
                        key
                    );


            if (
                !hotspot
            ) {

                hotspot =

                    TargetEngine
                        .createHotspot(

                            location

                        );


                TargetEngine.index
                    .set(

                        key,

                        hotspot

                    );


                TargetEngine.hotspots
                    .push(

                        hotspot

                    );

            }


            /* -------------------------
               Add case
               ------------------------- */

            TargetEngine
                .addCase(

                    hotspot,

                    caseRecord

                );


            /* -------------------------
               Add seizure
               ------------------------- */

            TargetEngine
                .addSeizure(

                    hotspot,

                    resolvedTarget.seizure

                );


            /*
             * IMPORTANT:
             *
             * offenceCount = UNIQUE CASES
             *
             * seizureCount = UNIQUE SEIZURE RECORDS
             *
             * Therefore one case containing several
             * seized items does not artificially increase
             * the offence count.
             */

            hotspot.offenceCount =

                hotspot.caseIds.length;


            hotspot.seizureCount =

                hotspot.seizures.length;


            hotspot.heatWeight =

                hotspot.offenceCount;


            return hotspot;

        };


    /* =====================================================
       21. BUILD TARGET HOTSPOTS

       Input:
       resolved contexts from OffenceGeocoder.resolveAll()
       ===================================================== */

    TargetEngine.build =
        function (

            resolvedContexts = []

        ) {

            TargetEngine.reset();


            if (
                !Array.isArray(
                    resolvedContexts
                )
            ) {

                return [];

            }


            for (

                const context

                of resolvedContexts

            ) {

                if (
                    !context ||
                    !context.case
                ) {

                    continue;

                }


                for (

                    const target

                    of (
                        context.targets ||
                        []
                    )

                ) {

                    TargetEngine
                        .addResolvedTarget(

                            target,

                            context.case

                        );

                }

            }


            TargetEngine
                .rebuildIndexes();


            TargetEngine
                .calculateHeatWeights();


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(

                    "🔥 OffenceTargetEngine Built",

                    TargetEngine.getStats()

                );

            }


            return TargetEngine.hotspots;

        };


    /* =====================================================
       22. BUILD DIRECTLY FROM STORE

       Store
         ↓
       Geocoder
         ↓
       TargetEngine
       ===================================================== */

    TargetEngine.buildFromStore =
        async function () {

            const resolvedContexts =

                await Geocoder
                    .resolveAll();


            return TargetEngine
                .build(

                    resolvedContexts

                );

        };


    /* =====================================================
       23. CALCULATE HEAT WEIGHTS

       Actual offence count is preserved.

       heatWeight is normalized 0 → 1.
       ===================================================== */

    TargetEngine.calculateHeatWeights =
        function () {

            if (
                TargetEngine.hotspots
                    .length === 0
            ) {

                return;

            }


            const maxCount =

                Math.max(

                    ...TargetEngine.hotspots
                        .map(

                            function (

                                hotspot

                            ) {

                                return (

                                    hotspot.offenceCount ||

                                    0

                                );

                            }

                        )

                );


            for (

                const hotspot

                of TargetEngine.hotspots

            ) {

                hotspot.heatWeight =

                    maxCount > 0

                        ? hotspot.offenceCount /
                          maxCount

                        : 0;

            }

        };


    /* =====================================================
       24. REBUILD LOOKUP INDEXES
       ===================================================== */

    TargetEngine.rebuildIndexes =
        function () {

            TargetEngine.caseIndex
                .clear();


            TargetEngine.seizureIndex
                .clear();


            for (

                const hotspot

                of TargetEngine.hotspots

            ) {

                /* -------------------------
                   Case Index
                   ------------------------- */

                for (

                    const caseId

                    of hotspot.caseIds

                ) {

                    const key =

                        TargetEngine
                            .normalizeKey(

                                caseId

                            );


                    if (
                        !TargetEngine.caseIndex
                            .has(
                                key
                            )
                    ) {

                        TargetEngine.caseIndex
                            .set(

                                key,

                                []

                            );

                    }


                    TargetEngine.caseIndex
                        .get(
                            key
                        )
                        .push(

                            hotspot

                        );

                }


                /* -------------------------
                   Seizure Index
                   ------------------------- */

                for (

                    const seizureId

                    of hotspot.seizureIds

                ) {

                    TargetEngine.seizureIndex
                        .set(

                            TargetEngine
                                .normalizeKey(

                                    seizureId

                                ),

                            hotspot

                        );

                }

            }

        };


    /* =====================================================
       25. GET ALL HOTSPOTS
       ===================================================== */

    TargetEngine.getHotspots =
        function () {

            return TargetEngine.hotspots;

        };


    /* =====================================================
       26. GET HOTSPOT BY ID
       ===================================================== */

    TargetEngine.getHotspotById =
        function (

            id

        ) {

            const normalizedId =

                TargetEngine
                    .normalizeKey(

                        id

                    );


            return (

                TargetEngine.hotspots
                    .find(

                        function (

                            hotspot

                        ) {

                            return (

                                TargetEngine
                                    .normalizeKey(

                                        hotspot.id

                                    ) ===

                                normalizedId

                            );

                        }

                    ) ||

                null

            );

        };


    /* =====================================================
       27. GET TARGETS BY CASE ID
       ===================================================== */

    TargetEngine.getByCaseId =
        function (

            caseId

        ) {

            return (

                TargetEngine.caseIndex
                    .get(

                        TargetEngine
                            .normalizeKey(

                                caseId

                            )

                    ) ||

                []

            );

        };


    /* =====================================================
       28. GET TARGET BY SEIZURE ID
       ===================================================== */

    TargetEngine.getBySeizureId =
        function (

            seizureId

        ) {

            return (

                TargetEngine.seizureIndex
                    .get(

                        TargetEngine
                            .normalizeKey(

                                seizureId

                            )

                    ) ||

                null

            );

        };


    /* =====================================================
       29. GET HEATMAP DATA

       Leaflet.heat-compatible structure:

       [
           [lat, lng, intensity],
           ...
       ]
       ===================================================== */

    TargetEngine.getHeatmapData =
        function () {

            return TargetEngine.hotspots

                .filter(

                    function (

                        hotspot

                    ) {

                        return TargetEngine
                            .isValidCoordinate(

                                hotspot.latitude,

                                hotspot.longitude

                            );

                    }

                )

                .map(

                    function (

                        hotspot

                    ) {

                        return [

                            hotspot.latitude,

                            hotspot.longitude,

                            hotspot.heatWeight

                        ];

                    }

                );

        };


    /* =====================================================
       30. GET MARKER DATA

       Full objects for clickable target markers.
       ===================================================== */

    TargetEngine.getMarkerData =
        function () {

            return TargetEngine.hotspots

                .filter(

                    function (

                        hotspot

                    ) {

                        return TargetEngine
                            .isValidCoordinate(

                                hotspot.latitude,

                                hotspot.longitude

                            );

                    }

                );

        };


    /* =====================================================
       31. GET CASCADE DATA

       TARGET CLICK FLOW:

       Target hotspot
            ↓
       Offence count
            ↓
       Cases at location
            ↓
       Case details
            ↓
       Accused details
            ↓
       Seizure details
       ===================================================== */

    TargetEngine.getCascadeData =
        function (

            hotspotId

        ) {

            const hotspot =

                TargetEngine
                    .getHotspotById(

                        hotspotId

                    );


            if (
                !hotspot
            ) {

                return null;

            }


            const cases = [];


            for (

                const caseId

                of hotspot.caseIds

            ) {

                const context =

                    Store
                        .getCaseContext(

                            caseId

                        );


                if (
                    context
                ) {

                    cases.push(

                        context

                    );

                }

            }


            return {

                hotspot:

                    hotspot,

                offenceCount:

                    hotspot.offenceCount,

                seizureCount:

                    hotspot.seizureCount,

                caseIds:

                    hotspot.caseIds,

                seizureIds:

                    hotspot.seizureIds,

                cases:

                    cases

            };

        };


    /* =====================================================
       32. GET STATS
       ===================================================== */

    TargetEngine.getStats =
        function () {

            const totalOffences =

                TargetEngine.hotspots
                    .reduce(

                        function (

                            total,

                            hotspot

                        ) {

                            return (

                                total +

                                hotspot.offenceCount

                            );

                        },

                        0

                    );


            const totalSeizures =

                TargetEngine.hotspots
                    .reduce(

                        function (

                            total,

                            hotspot

                        ) {

                            return (

                                total +

                                hotspot.seizureCount

                            );

                        },

                        0

                    );


            return {

                hotspots:

                    TargetEngine.hotspots
                        .length,

                totalOffences:

                    totalOffences,

                totalSeizures:

                    totalSeizures,

                linkedCases:

                    TargetEngine.caseIndex
                        .size,

                linkedSeizures:

                    TargetEngine.seizureIndex
                        .size

            };

        };


    /* =====================================================
       33. RESET
       ===================================================== */

    TargetEngine.reset =
        function () {

            TargetEngine.hotspots =
                [];


            TargetEngine.index
                .clear();


            TargetEngine.caseIndex
                .clear();


            TargetEngine.seizureIndex
                .clear();


            return true;

        };


    /* =====================================================
       34. EXPORT
       ===================================================== */

    GG.Offence.TargetEngine =
        TargetEngine;


    /* =====================================================
       35. INITIALIZE
       ===================================================== */

    TargetEngine.init();


    /* =====================================================
       36. READY LOG
       ===================================================== */

    if (
        Constants.DEBUG
            ?.ENABLED
    ) {

        console.log(

            "🔥 OffenceTargetEngine Loaded",

            TargetEngine

        );

    }


})();
