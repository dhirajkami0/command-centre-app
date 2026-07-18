/* =========================================================
   GreenGuard
   Offence Intelligence Module

   File:
   js/offence/offenceSourceEngine.js

   Purpose:
   - Build SOURCE offence hotspot dataset
   - Aggregate accused source locations
   - Group repeated locations
   - Count offences per source
   - Preserve linked Case IDs
   - Preserve linked accused records
   - Prepare SOURCE data for heatmap
   - Prepare SOURCE data for click drill-down

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
            "[OffenceSourceEngine] OffenceConstants unavailable."
        );

        return;

    }


    if (!Store) {

        console.error(
            "[OffenceSourceEngine] OffenceStore unavailable."
        );

        return;

    }


    if (!Geocoder) {

        console.error(
            "[OffenceSourceEngine] OffenceGeocoder unavailable."
        );

        return;

    }


    /* =====================================================
       3. MODULE
       ===================================================== */

    const SourceEngine = {};


    /* =====================================================
       4. MODULE INFO
       ===================================================== */

    SourceEngine.VERSION =
        "1.0.0";


    SourceEngine.initialized =
        false;


    /* =====================================================
       5. SOURCE HOTSPOT DATA

       Final structure:

       [
           {
               id,
               type: "SOURCE",

               name,
               address,

               latitude,
               longitude,

               offenceCount,

               caseIds: [],

               cases: [],

               accused: [],

               suspectIds: [],

               heatWeight
           }
       ]
       ===================================================== */

    SourceEngine.hotspots =
        [];


    /* =====================================================
       6. SOURCE INDEX

       Hotspot ID
            ↓
       Source Hotspot
       ===================================================== */

    SourceEngine.index =
        new Map();


    /* =====================================================
       7. CASE → SOURCE INDEX

       CaseID
           ↓
       [
           sourceHotspot,
           ...
       ]
       ===================================================== */

    SourceEngine.caseIndex =
        new Map();


    /* =====================================================
       8. SUSPECT → SOURCE INDEX

       SuspectID
           ↓
       sourceHotspot
       ===================================================== */

    SourceEngine.suspectIndex =
        new Map();


    /* =====================================================
       9. INITIALIZE
       ===================================================== */

    SourceEngine.init =
        function () {

            if (
                SourceEngine.initialized
            ) {

                return SourceEngine;

            }


            SourceEngine.initialized =
                true;


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(
                    "🔥 OffenceSourceEngine Ready"
                );

            }


            return SourceEngine;

        };


    /* =====================================================
       10. NORMALIZE KEY
       ===================================================== */

    SourceEngine.normalizeKey =
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

    SourceEngine.isValidCoordinate =
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

       Coordinates are rounded so that tiny coordinate
       differences do not create unnecessary duplicate
       hotspots.

       Example:

       26.5452211
       89.4800412

       becomes:

       26.54522|89.48004
       ===================================================== */

    SourceEngine.createCoordinateKey =
        function (

            latitude,

            longitude

        ) {

            if (
                !SourceEngine
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

       Primary grouping strategy:

       SOURCE + normalized address

       Coordinate is used as fallback.

       This means:

       "Damanpur, Alipurduar"
       repeated 10 times
              ↓
       ONE SOURCE HOTSPOT
       ===================================================== */

    SourceEngine.createHotspotKey =
        function (

            location

        ) {

            if (!location) {

                return "";

            }


            const address =

                SourceEngine
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

                    "SOURCE::" +

                    address

                );

            }


            const coordinateKey =

                SourceEngine
                    .createCoordinateKey(

                        location.latitude,

                        location.longitude

                    );


            if (
                coordinateKey
            ) {

                return (

                    "SOURCE::COORD::" +

                    coordinateKey

                );

            }


            return "";

        };


    /* =====================================================
       14. CREATE HOTSPOT ID
       ===================================================== */

    SourceEngine.createHotspotId =
        function (

            key

        ) {

            return (

                "OFFENCE_SOURCE_" +

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

    SourceEngine.addUnique =
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

                SourceEngine
                    .normalizeKey(

                        value

                    );


            const exists =

                array.some(

                    function (

                        existing

                    ) {

                        return (

                            SourceEngine
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

       Used for cases and accused records.
       ===================================================== */

    SourceEngine.addUniqueObject =
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

                SourceEngine
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

                            SourceEngine
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
       17. CREATE EMPTY HOTSPOT
       ===================================================== */

    SourceEngine.createHotspot =
        function (

            location

        ) {

            const key =

                SourceEngine
                    .createHotspotKey(

                        location

                    );


            return {

                id:

                    SourceEngine
                        .createHotspotId(

                            key

                        ),

                key:

                    key,

                type:

                    Constants
                        .LOCATION_TYPE
                        .SOURCE,

                name:

                    location.name ||

                    location.rawAddress ||

                    "Unknown Source",

                address:

                    location.rawAddress ||

                    location.name ||

                    "",

                normalizedAddress:

                    location.normalizedAddress ||

                    SourceEngine
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

                heatWeight:

                    0,

                caseIds:

                    [],

                suspectIds:

                    [],

                cases:

                    [],

                accused:

                    []

            };

        };


    /* =====================================================
       18. ADD CASE TO HOTSPOT
       ===================================================== */

    SourceEngine.addCase =
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


            const caseId =

                caseRecord.caseId;


            if (
                caseId
            ) {

                SourceEngine
                    .addUnique(

                        hotspot.caseIds,

                        caseId

                    );

            }


            SourceEngine
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
       19. ADD ACCUSED TO HOTSPOT
       ===================================================== */

    SourceEngine.addAccused =
        function (

            hotspot,

            accused

        ) {

            if (
                !hotspot ||
                !accused
            ) {

                return;

            }


            if (
                accused.suspectId
            ) {

                SourceEngine
                    .addUnique(

                        hotspot.suspectIds,

                        accused.suspectId

                    );

            }


            SourceEngine
                .addUniqueObject(

                    hotspot.accused,

                    accused,

                    function (

                        item

                    ) {

                        return (

                            item.suspectId ||

                            [

                                item.name,

                                item.presentAddress,

                                item.permanentAddress

                            ].join(
                                "|"
                            )

                        );

                    }

                );

        };


    /* =====================================================
       20. ADD RESOLVED SOURCE

       resolvedSource format:

       {
           location: {...},
           accused: {...}
       }
       ===================================================== */

    SourceEngine.addResolvedSource =
        function (

            resolvedSource,

            caseRecord

        ) {

            if (
                !resolvedSource ||
                !resolvedSource.location
            ) {

                return null;

            }


            const location =

                resolvedSource.location;


            /* -------------------------
               Ignore unresolved location
               ------------------------- */

            if (
                !SourceEngine
                    .isValidCoordinate(

                        location.latitude,

                        location.longitude

                    )
            ) {

                return null;

            }


            /* -------------------------
               Create grouping key
               ------------------------- */

            const key =

                SourceEngine
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

                SourceEngine.index
                    .get(
                        key
                    );


            if (
                !hotspot
            ) {

                hotspot =

                    SourceEngine
                        .createHotspot(

                            location

                        );


                SourceEngine.index
                    .set(

                        key,

                        hotspot

                    );


                SourceEngine.hotspots
                    .push(

                        hotspot

                    );

            }


            /* -------------------------
               Link case
               ------------------------- */

            SourceEngine
                .addCase(

                    hotspot,

                    caseRecord

                );


            /* -------------------------
               Link accused
               ------------------------- */

            SourceEngine
                .addAccused(

                    hotspot,

                    resolvedSource.accused

                );


            /*
             * Offence count represents UNIQUE CASES,
             * not number of duplicate accused rows.
             *
             * Example:
             *
             * One case has 3 accused from same address.
             *
             * offenceCount = 1
             * accused.length = 3
             */

            hotspot.offenceCount =

                hotspot.caseIds.length;


            hotspot.heatWeight =

                hotspot.offenceCount;


            return hotspot;

        };


    /* =====================================================
       21. BUILD FROM RESOLVED CONTEXTS

       Input comes from:

       GG.Offence.Geocoder.resolveAll()
       ===================================================== */

    SourceEngine.build =
        function (

            resolvedContexts = []

        ) {

            SourceEngine.reset();


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

                    const source

                    of (
                        context.sources ||
                        []
                    )

                ) {

                    SourceEngine
                        .addResolvedSource(

                            source,

                            context.case

                        );

                }

            }


            SourceEngine
                .rebuildIndexes();


            SourceEngine
                .calculateHeatWeights();


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(

                    "🔥 OffenceSourceEngine Built",

                    SourceEngine.getStats()

                );

            }


            return SourceEngine.hotspots;

        };


    /* =====================================================
       22. BUILD DIRECTLY FROM STORE

       Full flow:

       Store
         ↓
       Geocoder
         ↓
       SourceEngine
       ===================================================== */

    SourceEngine.buildFromStore =
        async function () {

            const resolvedContexts =

                await Geocoder
                    .resolveAll();


            return SourceEngine
                .build(

                    resolvedContexts

                );

        };


    /* =====================================================
       23. CALCULATE HEAT WEIGHTS

       Heatmap libraries often work best with normalized
       values between 0 and 1.

       We preserve:
       - offenceCount = actual count
       - heatWeight   = normalized heat intensity
       ===================================================== */

    SourceEngine.calculateHeatWeights =
        function () {

            if (
                SourceEngine.hotspots
                    .length === 0
            ) {

                return;

            }


            const maxCount =

                Math.max(

                    ...SourceEngine.hotspots
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

                of SourceEngine.hotspots

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

    SourceEngine.rebuildIndexes =
        function () {

            SourceEngine.caseIndex
                .clear();


            SourceEngine.suspectIndex
                .clear();


            for (

                const hotspot

                of SourceEngine.hotspots

            ) {

                /* -------------------------
                   Case Index
                   ------------------------- */

                for (

                    const caseId

                    of hotspot.caseIds

                ) {

                    const key =

                        SourceEngine
                            .normalizeKey(

                                caseId

                            );


                    if (
                        !SourceEngine.caseIndex
                            .has(
                                key
                            )
                    ) {

                        SourceEngine.caseIndex
                            .set(

                                key,

                                []

                            );

                    }


                    SourceEngine.caseIndex
                        .get(
                            key
                        )
                        .push(

                            hotspot

                        );

                }


                /* -------------------------
                   Suspect Index
                   ------------------------- */

                for (

                    const suspectId

                    of hotspot.suspectIds

                ) {

                    SourceEngine.suspectIndex
                        .set(

                            SourceEngine
                                .normalizeKey(

                                    suspectId

                                ),

                            hotspot

                        );

                }

            }

        };


    /* =====================================================
       25. GET ALL HOTSPOTS
       ===================================================== */

    SourceEngine.getHotspots =
        function () {

            return SourceEngine.hotspots;

        };


    /* =====================================================
       26. GET HOTSPOT BY ID
       ===================================================== */

    SourceEngine.getHotspotById =
        function (

            id

        ) {

            const normalizedId =

                SourceEngine
                    .normalizeKey(

                        id

                    );


            return (

                SourceEngine.hotspots
                    .find(

                        function (

                            hotspot

                        ) {

                            return (

                                SourceEngine
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
       27. GET SOURCES BY CASE ID
       ===================================================== */

    SourceEngine.getByCaseId =
        function (

            caseId

        ) {

            return (

                SourceEngine.caseIndex
                    .get(

                        SourceEngine
                            .normalizeKey(

                                caseId

                            )

                    ) ||

                []

            );

        };


    /* =====================================================
       28. GET SOURCE BY SUSPECT ID
       ===================================================== */

    SourceEngine.getBySuspectId =
        function (

            suspectId

        ) {

            return (

                SourceEngine.suspectIndex
                    .get(

                        SourceEngine
                            .normalizeKey(

                                suspectId

                            )

                    ) ||

                null

            );

        };


    /* =====================================================
       29. GET HEATMAP DATA

       Output:

       [
           [lat, lon, weight],
           [lat, lon, weight]
       ]

       Ready for Leaflet.heat later.
       ===================================================== */

    SourceEngine.getHeatmapData =
        function () {

            return SourceEngine.hotspots

                .filter(

                    function (

                        hotspot

                    ) {

                        return SourceEngine
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

       Used later for clickable hotspot markers.

       Unlike heatmap data, this preserves the full
       hotspot object.
       ===================================================== */

    SourceEngine.getMarkerData =
        function () {

            return SourceEngine.hotspots

                .filter(

                    function (

                        hotspot

                    ) {

                        return SourceEngine
                            .isValidCoordinate(

                                hotspot.latitude,

                                hotspot.longitude

                            );

                    }

                );

        };


    /* =====================================================
       31. GET CASCADE DATA

       This is the foundation for:

       Click SOURCE hotspot
              ↓
       Show offence count
              ↓
       Show linked cases
              ↓
       Click case
              ↓
       Show accused
              ↓
       Show seizure
              ↓
       Show full offence details
       ===================================================== */

    SourceEngine.getCascadeData =
        function (

            hotspotId

        ) {

            const hotspot =

                SourceEngine
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

                caseIds:

                    hotspot.caseIds,

                suspectIds:

                    hotspot.suspectIds,

                cases:

                    cases

            };

        };


    /* =====================================================
       32. GET STATS
       ===================================================== */

    SourceEngine.getStats =
        function () {

            const totalOffences =

                SourceEngine.hotspots
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


            return {

                hotspots:

                    SourceEngine.hotspots
                        .length,

                totalOffences:

                    totalOffences,

                linkedCases:

                    SourceEngine.caseIndex
                        .size,

                linkedSuspects:

                    SourceEngine.suspectIndex
                        .size

            };

        };


    /* =====================================================
       33. RESET
       ===================================================== */

    SourceEngine.reset =
        function () {

            SourceEngine.hotspots =
                [];


            SourceEngine.index
                .clear();


            SourceEngine.caseIndex
                .clear();


            SourceEngine.suspectIndex
                .clear();


            return true;

        };


    /* =====================================================
       34. EXPORT
       ===================================================== */

    GG.Offence.SourceEngine =
        SourceEngine;


    /* =====================================================
       35. INITIALIZE
       ===================================================== */

    SourceEngine.init();


    /* =====================================================
       36. READY LOG
       ===================================================== */

    if (
        Constants.DEBUG
            ?.ENABLED
    ) {

        console.log(

            "🔥 OffenceSourceEngine Loaded",

            SourceEngine

        );

    }


})();
