/*=========================================================
  GreenGuard AI
  GIS Entities

  Version:
  2.0.0

  PURPOSE
  ---------------------------------------------------------
  Provides canonical GIS entity lookup for GreenGuard.

  BACKWARD COMPATIBILITY
  ---------------------------------------------------------
  Existing API preserved:

      GG.GISEntities.build()
      GG.GISEntities.ready()
      GG.GISEntities.search()

  Existing search() contract remains:

      search(name)
          -> ONE matching entity / feature
          -> null when not found

  OFFENCE GIS EXTENSIONS
  ---------------------------------------------------------
  Added:

      resolveRangeAlias()
      searchRange()
      searchRangeFeatures()
      searchRangeFeatureCollection()

      searchCompartment()
      searchCompartmentFeatures()

      getRangeNames()
      getRangeFeatureCount()

      reset()
      rebuild()

  IMPORTANT
  ---------------------------------------------------------
  index.ranges continues storing ONE feature.

  index.rangeGroups stores ALL features belonging
  to a range.

  Therefore existing consumers are not forced to
  handle arrays.
=========================================================*/

window.GreenGuardAI =
    window.GreenGuardAI || {};


(function (

    GG

) {

    "use strict";


    const GISEntities = {};


    GISEntities.VERSION =

        "2.0.0";


    /*
     * Internal index.
     *
     * This variable remains private.
     */

    let index =

        null;


    /*=====================================================
      NAME NORMALIZER
    =====================================================*/


    /*
     * Preserve the existing GreenGuard canonical
     * normalization contract.
     *
     * This function intentionally does NOT contain
     * offence range aliases such as:
     *
     * NMT -> Nimati
     * WRVK -> WestRajabhatkhawa
     *
     * Those aliases belong to resolveRangeAlias().
     *
     * Keeping them separate prevents offence-specific
     * abbreviations from affecting unrelated GIS,
     * Staff, AI, or search modules.
     */

    GG.normalizeName =
        function (

            value

        ) {

            if (

                value == null

            ) {

                return "";

            }


            let text =

                String(

                    value

                )

                    .normalize(

                        "NFKD"

                    )

                    .replace(

                        /[\u0300-\u036f]/g,

                        ""

                    )

                    .toUpperCase()

                    .trim();


            /*---------------------------------------------
              Common Symbols
            ---------------------------------------------*/

            text =

                text

                    .replace(

                        /&/g,

                        "AND"

                    )

                    .replace(

                        /[(){}\[\].,_\-\/\\]/g,

                        " "

                    )

                    .replace(

                        /\s+/g,

                        " "

                    )

                    .trim();


            /*---------------------------------------------
              Known Existing GreenGuard Aliases
            ---------------------------------------------*/

            const aliases = {

                "BTR W":

                    "BTR WEST",

                "BTRW":

                    "BTR WEST",

                "BTR WEST":

                    "BTR WEST",

                "BTR WEST DIVISION":

                    "BTR WEST",

                "BTR WEST RANGE":

                    "BTR WEST",

                "BTR WEST CIRCLE":

                    "BTR WEST",

                "BTR WEST FOREST DIVISION":

                    "BTR WEST",


                "BTR E":

                    "BTR EAST",

                "BTRE":

                    "BTR EAST",

                "BTR EAST":

                    "BTR EAST"

            };


            if (

                aliases[
                    text
                ]

            ) {

                text =

                    aliases[
                        text
                    ];

            }


            /*---------------------------------------------
              Canonical Key
            ---------------------------------------------*/

            return text.replace(

                /\s+/g,

                ""

            );

        };


    /*=====================================================
      INTERNAL HELPERS
    =====================================================*/


    /*
     * Add a feature to a grouped index.
     *
     * Example:
     *
     * rangeGroups.NIMATI = [
     *     Nimati-East feature,
     *     Nimati-West feature,
     *     Poro-West feature
     * ]
     */

    GISEntities.addToGroup =
        function (

            group,

            key,

            value

        ) {

            if (

                !group ||

                !key ||

                !value

            ) {

                return;

            }


            if (

                !Array.isArray(

                    group[
                        key
                    ]

                )

            ) {

                group[
                    key
                ] = [];

            }


            /*
             * Avoid duplicate object references.
             */

            if (

                !group[
                    key
                ].includes(

                    value

                )

            ) {

                group[
                    key
                ].push(

                    value

                );

            }

        };


    /*
     * Convert an array of GeoJSON Features into
     * a standard FeatureCollection.
     *
     * This is useful for Leaflet:
     *
     * L.geoJSON(
     *     featureCollection
     * )
     */

    GISEntities.createFeatureCollection =
        function (

            features

        ) {

            return {

                type:

                    "FeatureCollection",

                features:

                    Array.isArray(

                        features

                    )

                        ? features.filter(

                            function (

                                feature

                            ) {

                                return (

                                    feature &&

                                    feature.type ===
                                        "Feature" &&

                                    feature.geometry

                                );

                            }

                        )

                        : []

            };

        };


    /*=====================================================
      BUILD
    =====================================================*/


    GISEntities.build =
        function () {

            /*
             * Preserve original cached build behavior.
             */

            if (

                index

            ) {

                return index;

            }


            /*
             * Existing indexes are preserved.
             *
             * New grouped indexes are additive.
             */

index = {

    /*
     * Existing single-result indexes.
     *
     * IMPORTANT:
     * These remain unchanged for backward
     * compatibility.
     */

    divisions:

        {},

    ranges:

        {},

    beats:

        {},

    compartments:

        {},


    /*
     * OLD POINT-BASED VILLAGES
     *
     * Source:
     * window.__villageCache
     *
     * Existing generic search() continues
     * using this index.
     */

    villages:

        {},


    /*
     * Existing grouped GIS indexes.
     */

    divisionGroups:

        {},

    rangeGroups:

        {},

    beatGroups:

        {},

    compartmentGroups:

        {},


    /*
     * NEW POLYGON-BASED CANONICAL VILLAGES
     *
     * Source:
     * window.__villageBoundaryCache
     *
     * Key:
     * normalized canonical village name
     *
     * Example:
     *
     * SALKUMAR
     *      -> canonical Salkumar object
     */

    canonicalVillages:

        {},


    /*
     * VILLAGES GROUPED BY SOURCE CODE
     *
     * IMPORTANT:
     * One Village_Code may belong to more than
     * one canonical village name.
     *
     * Example:
     *
     * 307144N151
     *      -> [
     *           Raja Bhat Khawa,
     *           Raja Bhat Khawa Madhya
     *         ]
     */

    villagesByCode:

        {},


    /*
     * VILLAGES GROUPED BY BLOCK
     *
     * Example:
     *
     * KALCHINI
     *      -> [
     *           village,
     *           village,
     *           ...
     *         ]
     */

    villagesByBlock:

        {},


    /*
     * CANONICAL VILLAGE GROUPS
     *
     * Key:
     * normalized village name
     *
     * Supports cases where the same normalized
     * village name may occur more than once.
     */

    villageGroups:

        {}

};


            /*=================================================
              BUILD GIS FEATURE INDEXES
            =================================================*/


            (

                window.allGISFeatures ||

                []

            ).forEach(

                function (

                    feature

                ) {

                    if (

                        !feature

                    ) {

                        return;

                    }


                    const p =

                        feature.properties ||

                        {};


                    /*-----------------------------------------
                      DIVISION
                    -----------------------------------------*/

                    if (

                        p.division

                    ) {

                        const divisionKey =

                            GG.normalizeName(

                                p.division

                            );


                        if (

                            divisionKey

                        ) {

                            /*
                             * Preserve original behavior.
                             *
                             * Last matching feature remains
                             * available from the single index.
                             */

                            index.divisions[

                                divisionKey

                            ] = feature;


                            /*
                             * New grouped index.
                             */

                            GISEntities
                                .addToGroup(

                                    index.divisionGroups,

                                    divisionKey,

                                    feature

                                );

                        }

                    }


                    /*-----------------------------------------
                      RANGE
                    -----------------------------------------*/

                    if (

                        p.range

                    ) {

                        const rangeKey =

                            GG.normalizeName(

                                p.range

                            );


                        if (

                            rangeKey

                        ) {

                            /*
                             * IMPORTANT:
                             *
                             * Preserve original contract.
                             *
                             * Existing:
                             *
                             * GISEntities.search("Nimati")
                             *
                             * still returns ONE Feature.
                             */

                            index.ranges[

                                rangeKey

                            ] = feature;


                            /*
                             * New grouped range index.
                             *
                             * Example:
                             *
                             * NIMATI
                             *   -> Nimati-East
                             *   -> Nimati-West
                             *   -> Poro-West
                             */

                            GISEntities
                                .addToGroup(

                                    index.rangeGroups,

                                    rangeKey,

                                    feature

                                );

                        }

                    }


                    /*-----------------------------------------
                      BEAT
                    -----------------------------------------*/

                    if (

                        p.beat

                    ) {

                        const beatKey =

                            GG.normalizeName(

                                p.beat

                            );


                        if (

                            beatKey

                        ) {

                            /*
                             * Preserve original behavior.
                             */

                            index.beats[

                                beatKey

                            ] = feature;


                            /*
                             * Grouped beat index.
                             */

                            GISEntities
                                .addToGroup(

                                    index.beatGroups,

                                    beatKey,

                                    feature

                                );

                        }

                    }

                }

            );


            /*=================================================
              BUILD COMPARTMENT INDEX
            =================================================*/


            (

                window.allCompartmentFeatures ||

                []

            ).forEach(

                function (

                    feature

                ) {

                    if (

                        !feature

                    ) {

                        return;

                    }


                    const p =

                        feature.properties ||

                        {};


                    const name =

                        p.compartment ||

                        p.name;


                    if (

                        !name

                    ) {

                        return;

                    }


                    const compartmentKey =

                        GG.normalizeName(

                            name

                        );


                    if (

                        !compartmentKey

                    ) {

                        return;

                    }


                    /*
                     * Preserve original behavior.
                     */

                    index.compartments[

                        compartmentKey

                    ] = feature;


                    /*
                     * New grouped compartment index.
                     *
                     * Usually a compartment will contain
                     * one feature, but this safely supports
                     * multipart datasets.
                     */

                    GISEntities
                        .addToGroup(

                            index.compartmentGroups,

                            compartmentKey,

                            feature

                        );

                }

            );


            /*=================================================
              BUILD VILLAGE INDEX
            =================================================*/


            (

                window.__villageCache ||

                []

            ).forEach(

                function (

                    village

                ) {

                    if (

                        !village

                    ) {

                        return;

                    }


                    const name =

                        village.name ||

                        village.village;


                    if (

                        !name

                    ) {

                        return;

                    }


                    const villageKey =

                        GG.normalizeName(

                            name

                        );


                    if (

                        !villageKey

                    ) {

                        return;

                    }


                    /*
                     * Preserve original behavior.
                     */

                    index.villages[

                        villageKey

                    ] = village;

                }

            );

            /*=================================================
              BUILD CANONICAL POLYGON VILLAGE INDEXES
              -------------------------------------------------

              Source:
                  window.__villageBoundaryCache

              IMPORTANT:

              This is completely separate from:

                  window.__villageCache
                      ↓
                  index.villages

              The old point-based village index remains
              unchanged for backward compatibility.
            =================================================*/


            (

                window.__villageBoundaryCache ||

                []

            ).forEach(

                function (

                    village

                ) {

                    /*-----------------------------------------
                      SAFETY
                    -----------------------------------------*/

                    if (

                        !village

                    ) {

                        return;

                    }


                    /*-----------------------------------------
                      VILLAGE NAME
                    -----------------------------------------*/

                    const name =

                        village.name ||

                        village.village;


                    if (

                        !name

                    ) {

                        return;

                    }


                    /*-----------------------------------------
                      NORMALIZED VILLAGE NAME KEY
                    -----------------------------------------*/

                    const villageKey =

                        GG.normalizeName(

                            name

                        );


                    if (

                        !villageKey

                    ) {

                        return;

                    }


                    /*-----------------------------------------
                      CANONICAL VILLAGE SINGLE INDEX

                      Provides fast lookup by village name.

                      Example:

                      SALKUMAR
                          -> canonical Salkumar object

                      Existing value is preserved if the same
                      normalized name appears again.
                    -----------------------------------------*/

                    if (

                        !index.canonicalVillages[

                            villageKey

                        ]

                    ) {

                        index.canonicalVillages[

                            villageKey

                        ] = village;

                    }


                    /*-----------------------------------------
                      CANONICAL VILLAGE GROUP

                      Supports multiple canonical records with
                      the same normalized village name.
                    -----------------------------------------*/

                    GISEntities
                        .addToGroup(

                            index.villageGroups,

                            villageKey,

                            village

                        );


                    /*-----------------------------------------
                      VILLAGE CODE INDEX

                      IMPORTANT:

                      Village code is NOT assumed to be unique.

                      Example:

                      307144N151
                          -> Raja Bhat Khawa
                          -> Raja Bhat Khawa Madhya
                    -----------------------------------------*/

                    if (

                        village.villageCode

                    ) {

                        const codeKey =

                            String(

                                village.villageCode

                            )
                                .trim()
                                .toUpperCase();


                        if (

                            codeKey

                        ) {

                            GISEntities
                                .addToGroup(

                                    index.villagesByCode,

                                    codeKey,

                                    village

                                );

                        }

                    }


                    /*-----------------------------------------
                      BLOCK INDEX

                      Example:

                      KALCHINI
                          -> [all canonical Kalchini villages]
                    -----------------------------------------*/

                    if (

                        village.block

                    ) {

                        const blockKey =

                            GG.normalizeName(

                                village.block

                            );


                        if (

                            blockKey

                        ) {

                            GISEntities
                                .addToGroup(

                                    index.villagesByBlock,

                                    blockKey,

                                    village

                                );

                        }

                    }

                }

            );


            return index;

        };



    /*=====================================================
      READY
    =====================================================*/


    GISEntities.ready =
        function () {

            return !!index;

        };


    /*=====================================================
      RESET
    =====================================================*/


    /*
     * Useful when GIS data is loaded asynchronously.
     *
     * Example:
     *
     * allGISFeatures loaded
     *      ↓
     * GISEntities.rebuild()
     */

    GISEntities.reset =
        function () {

            index =

                null;


            return GISEntities;

        };


    /*=====================================================
      REBUILD
    =====================================================*/


    GISEntities.rebuild =
        function () {

            GISEntities
                .reset();


            return GISEntities
                .build();

        };


    /*=====================================================
      EXISTING GENERIC SEARCH
    =====================================================*/


    /*
     * IMPORTANT:
     *
     * This function intentionally preserves the original
     * return contract.
     *
     * It returns ONE entity / feature.
     *
     * Existing callers therefore remain compatible.
     */

    GISEntities.search =
        function (

            text

        ) {

            if (

                !text

            ) {

                return null;

            }


            if (

                !index

            ) {

                GISEntities
                    .build();

            }


            const key =

                GG.normalizeName(

                    text

                );


            return (

                index.divisions[
                    key
                ] ||

                index.ranges[
                    key
                ] ||

                index.beats[
                    key
                ] ||

                index.compartments[
                    key
                ] ||

                index.villages[
                    key
                ] ||

                null

            );

        };

    /*=====================================================
      SEARCH CANONICAL VILLAGE
      -----------------------------------------------------

      Returns ONE canonical polygon-based village.

      Example:

      searchCanonicalVillage(
          "Salkumar"
      )
    =====================================================*/


    GISEntities.searchCanonicalVillage =
        function (

            value

        ) {

            if (

                !value

            ) {

                return null;

            }


            if (

                !index

            ) {

                GISEntities
                    .build();

            }


            const key =

                GG.normalizeName(

                    value

                );


            return (

                index.canonicalVillages[

                    key

                ] ||

                null

            );

        };


    /*=====================================================
      SEARCH CANONICAL VILLAGE GROUP
      -----------------------------------------------------

      Returns ALL canonical villages matching the same
      normalized village name.
    =====================================================*/


    GISEntities.searchCanonicalVillageGroup =
        function (

            value

        ) {

            if (

                !value

            ) {

                return [];

            }


            if (

                !index

            ) {

                GISEntities
                    .build();

            }


            const key =

                GG.normalizeName(

                    value

                );


            const villages =

                index.villageGroups[

                    key

                ];


            return Array.isArray(

                villages

            )

                ? villages.slice()

                : [];

        };


    /*=====================================================
      SEARCH VILLAGES BY CODE
      -----------------------------------------------------

      Returns ARRAY.

      IMPORTANT:

      Village_Code is not guaranteed to uniquely identify
      one canonical village.

      Example:

      searchVillagesByCode(
          "307144N151"
      )

      returns:

      [
          Raja Bhat Khawa,
          Raja Bhat Khawa Madhya
      ]
    =====================================================*/


    GISEntities.searchVillagesByCode =
        function (

            value

        ) {

            if (

                value == null

            ) {

                return [];

            }


            if (

                !index

            ) {

                GISEntities
                    .build();

            }


            const key =

                String(

                    value

                )
                    .trim()
                    .toUpperCase();


            if (

                !key

            ) {

                return [];

            }


            const villages =

                index.villagesByCode[

                    key

                ];


            return Array.isArray(

                villages

            )

                ? villages.slice()

                : [];

        };


    /*=====================================================
      SEARCH VILLAGES BY BLOCK
      -----------------------------------------------------

      Returns all canonical villages belonging to a block.

      Example:

      searchVillagesByBlock(
          "Kalchini"
      )
    =====================================================*/


    GISEntities.searchVillagesByBlock =
        function (

            value

        ) {

            if (

                !value

            ) {

                return [];

            }


            if (

                !index

            ) {

                GISEntities
                    .build();

            }


            const key =

                GG.normalizeName(

                    value

                );


            const villages =

                index.villagesByBlock[

                    key

                ];


            return Array.isArray(

                villages

            )

                ? villages.slice()

                : [];

        };
    /*=====================================================
      OFFENCE RANGE ALIAS RESOLUTION
    =====================================================*/


    /*
     * Converts confirmed offence database range codes
     * into canonical GeoJSON range names.
     *
     * IMPORTANT:
     *
     * These aliases are intentionally NOT added to
     * GG.normalizeName().
     *
     * This keeps offence-specific abbreviations isolated
     * from the rest of GreenGuard.
     *
     * Confirmed mappings from current Buxa GIS:
     *
     * NMT
     *     -> Nimati
     *
     * WRVK
     *     -> WestRajabhatkhawa
     *
     * WDPO
     *     -> WestDamanpur
     *
     * PANA
     *     -> Pana
     *
     * HTG
     *     -> Hamiltonganj
     *
     * EDPO
     *     -> EastDamanpur
     *
     * ERVK
     *     -> EastRajabhatkhawa
     */

    GISEntities.resolveRangeAlias =
        function (

            value

        ) {

            if (

                value == null

            ) {

                return "";

            }


            const raw =

                String(

                    value

                )

                    .trim();


            if (

                !raw

            ) {

                return "";

            }


            const key =

                GG.normalizeName(

                    raw

                );


            const aliases = {

                /*
                 * Buxa Tiger Reserve West
                 */

                NMT:

                    "Nimati",

                WRVK:

                    "WestRajabhatkhawa",

                WDPO:

                    "WestDamanpur",

                PANA:

                    "Pana",

                HTG:

                    "Hamiltonganj",

                EDPO:

                    "EastDamanpur",

                ERVK:

                    "EastRajabhatkhawa"

            };


            return (

                aliases[
                    key
                ] ||

                raw

            );

        };


    /*=====================================================
      SEARCH SINGLE RANGE
    =====================================================*/


    /*
     * Returns ONE GeoJSON feature.
     *
     * Supports:
     *
     * searchRange("NMT")
     * searchRange("Nimati")
     *
     * Both resolve to the existing single-feature
     * range index.
     */

    GISEntities.searchRange =
        function (

            value

        ) {

            if (

                !value

            ) {

                return null;

            }


            if (

                !index

            ) {

                GISEntities
                    .build();

            }


            const resolved =

                GISEntities
                    .resolveRangeAlias(

                        value

                    );


            const key =

                GG.normalizeName(

                    resolved

                );


            return (

                index.ranges[
                    key
                ] ||

                null

            );

        };


    /*=====================================================
      SEARCH ALL RANGE FEATURES
    =====================================================*/


    /*
     * Returns ALL GIS features belonging to the range.
     *
     * Designed for OffenceMapRenderer.
     *
     * Example:
     *
     * searchRangeFeatures(
     *     "NMT"
     * )
     *
     * resolves:
     *
     * NMT
     *      ↓
     * Nimati
     *      ↓
     * [
     *     Nimati-East,
     *     Nimati-West,
     *     Poro-West
     * ]
     */

    GISEntities.searchRangeFeatures =
        function (

            value

        ) {

            if (

                !value

            ) {

                return [];

            }


            if (

                !index

            ) {

                GISEntities
                    .build();

            }


            const resolved =

                GISEntities
                    .resolveRangeAlias(

                        value

                    );


            const key =

                GG.normalizeName(

                    resolved

                );


            const features =

                index.rangeGroups[

                    key

                ];


            return Array.isArray(

                features

            )

                ? features.slice()

                : [];

        };


    /*=====================================================
      SEARCH RANGE FEATURE COLLECTION
    =====================================================*/


    /*
     * Returns a standard GeoJSON FeatureCollection.
     *
     * This is the preferred method for rendering the
     * COMPLETE range in Leaflet.
     *
     * Example:
     *
     * const collection =
     *
     *     GG.GISEntities
     *         .searchRangeFeatureCollection(
     *             "NMT"
     *         );
     *
     * L.geoJSON(
     *     collection
     * );
     */

    GISEntities.searchRangeFeatureCollection =
        function (

            value

        ) {

            const features =

                GISEntities
                    .searchRangeFeatures(

                        value

                    );


            return GISEntities
                .createFeatureCollection(

                    features

                );

        };


    /*=====================================================
      SEARCH SINGLE COMPARTMENT
    =====================================================*/


    /*
     * Returns ONE compartment GeoJSON feature.
     *
     * This keeps compartment resolution separate from
     * generic search and is useful for OffenceHeatmapEngine
     * and OffenceMapRenderer.
     */

    GISEntities.searchCompartment =
        function (

            value

        ) {

            if (

                !value

            ) {

                return null;

            }


            if (

                !index

            ) {

                GISEntities
                    .build();

            }


            const key =

                GG.normalizeName(

                    value

                );


            return (

                index.compartments[
                    key
                ] ||

                null

            );

        };


    /*=====================================================
      SEARCH ALL COMPARTMENT FEATURES
    =====================================================*/


    /*
     * Returns all matching compartment features.
     *
     * Usually one feature is expected.
     *
     * Multiple features are supported for future
     * multipart compartment datasets.
     */

    GISEntities.searchCompartmentFeatures =
        function (

            value

        ) {

            if (

                !value

            ) {

                return [];

            }


            if (

                !index

            ) {

                GISEntities
                    .build();

            }


            const key =

                GG.normalizeName(

                    value

                );


            const features =

                index.compartmentGroups[

                    key

                ];


            return Array.isArray(

                features

            )

                ? features.slice()

                : [];

        };


    /*=====================================================
      SEARCH COMPARTMENT FEATURE COLLECTION
    =====================================================*/


    GISEntities.searchCompartmentFeatureCollection =
        function (

            value

        ) {

            const features =

                GISEntities
                    .searchCompartmentFeatures(

                        value

                    );


            return GISEntities
                .createFeatureCollection(

                    features

                );

        };

GISEntities.findCompartmentAtPoint =
    function (
        lat,
        lon
    ) {

        lat =
            Number(lat);

        lon =
            Number(lon);


        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lon)
        ) {

            return null;

        }


        if (
            !window.turf ||
            typeof window.turf.booleanPointInPolygon !==
                "function"
        ) {

            console.warn(
                "⚠ Turf unavailable for compartment lookup"
            );

            return null;

        }


        const point =
            window.turf.point([
                lon,
                lat
            ]);


        const features =
            window.allCompartmentFeatures ||
            [];


        for (
            const feature of features
        ) {

            if (
                !feature ||
                !feature.geometry
            ) {

                continue;

            }


            try {

                if (
                    window.turf.booleanPointInPolygon(
                        point,
                        feature
                    )
                ) {

                    const p =
                        feature.properties ||
                        {};


                    return {

                        feature:
                            feature,

                        compartment:
                            p.compartment ||
                            p.name ||
                            "",

                        beat:
                            p.beat ||
                            "",

                        range:
                            p.range ||
                            "",

                        division:
                            p.division ||
                            "",

                        properties:
                            p

                    };

                }

            }

            catch (err) {

                console.warn(
                    "Compartment polygon test failed",
                    err
                );

            }

        }


        return null;

    };
   /* ============================================================
   🏡 FIND VILLAGE AT GPS POINT
   ------------------------------------------------------------
   AUTHORITATIVE SOURCE:
   window.__villageBoundaryGeoJSON

   Uses actual Polygon / MultiPolygon geometry.

   Returns:
   - village
   - block
   - district
   - villageCode
   - feature

   NO nearest-village guessing.
   NO Firestore read.
============================================================ */

GISEntities.findVillageAtPoint =
function(
    lat,
    lon
){

    lat =
        Number(lat);

    lon =
        Number(lon);


    // ========================================================
    // VALIDATE GPS
    // ========================================================

    if(
        !Number.isFinite(lat) ||
        !Number.isFinite(lon)
    ){

        return null;

    }


    // ========================================================
    // TURF
    // ========================================================

    if(
        !window.turf ||
        typeof turf.booleanPointInPolygon !==
            "function"
    ){

        return null;

    }


    // ========================================================
    // RAW AUTHORITATIVE VILLAGE POLYGONS
    // ========================================================

    const geojson =
        window.__villageBoundaryGeoJSON;

    const features =
        Array.isArray(
            geojson?.features
        )
        ? geojson.features
        : [];


    if(
        !features.length
    ){

        return null;

    }


    // ========================================================
    // GPS → TURF POINT
    //
    // GeoJSON order MUST be:
    // longitude, latitude
    // ========================================================

    const point =
        turf.point([
            lon,
            lat
        ]);


    // ========================================================
    // POINT-IN-POLYGON
    // ========================================================

    for(
        const feature
        of features
    ){

        if(
            !feature ||
            !feature.geometry
        ){

            continue;

        }


        const geometryType =
            feature.geometry.type;


        if(
            geometryType !== "Polygon" &&
            geometryType !== "MultiPolygon"
        ){

            continue;

        }


        let inside =
            false;


        try{

            inside =
                turf.booleanPointInPolygon(
                    point,
                    feature
                );

        }
        catch(err){

            continue;

        }


        if(
            !inside
        ){

            continue;

        }


        // ====================================================
        // FOUND ACTUAL CONTAINING VILLAGE
        // ====================================================

        const p =
            feature.properties ||
            {};


        const village =
            String(
                p.Vill_name ||
                p.Vill_Name ||
                p.Village_Name ||
                p.villageName ||
                p.village_name ||
                p.name ||
                ""
            ).trim();


        const block =
            String(
                p.Sub_dist ||
                p.Block ||
                p.block ||
                p.blockName ||
                p.block_name ||
                ""
            ).trim();


        const district =
            String(
                p.District ||
                p.district ||
                p.districtName ||
                ""
            ).trim();


        const villageCode =
            String(
                p.Vill_LGD ||
                p.villageCode ||
                p.village_code ||
                p.LGD_CODE ||
                ""
            ).trim();


        return {

            type:
                "VILLAGE",

            village,

            name:
                village,

            block,

            district,

            villageCode,

            latitude:
                lat,

            longitude:
                lon,

            properties:
                p,

            feature:
                feature

        };

    }


    // ========================================================
    // NOT INSIDE ANY VILLAGE POLYGON
    // ========================================================

    return null;

};
/* ============================================================
   📍 FIND NEAREST RECORDED VILLAGE GPS POINT
   ------------------------------------------------------------
   Searches existing Village Locations layer.

   Example:

   staff GPS
       ↓
   nearest recorded point
       ↓
   "Joler Tank"

   PERFORMANCE:
   Executed only when requested.
============================================================ */

/* ============================================================
   📍 FIND NEAREST RECORDED VILLAGE GPS POINT
   ------------------------------------------------------------
   Uses existing Village Locations marker layer.

   Existing marker structure:
   - GPS       → layer.getLatLng()
   - Name      → marker popup HTML
   - Distance  → Leaflet distanceTo()

   NO Firestore read.
   NO new listener.
   Called lazily from staff marker click.
============================================================ */

// =====================================================
// FIND NEAREST VILLAGE POINT
// =====================================================

// =====================================================
// FIND NEAREST VILLAGE LOCATION POINT
// Works from ANY GPS location
// =====================================================

// =====================================================
// FIND NEAREST VILLAGE LOCATION
// =====================================================

// =====================================================
// FIND NEAREST VILLAGE LOCATION
// (Lazy loads village_locations on first use)
// =====================================================

GISEntities.findNearestVillagePoint =
function(
    lat,
    lon
){

    lat =
        Number(lat);

    lon =
        Number(lon);

    if(

        !Number.isFinite(lat) ||

        !Number.isFinite(lon)

    ){

        return null;

    }

    // =====================================================
    // ENSURE CACHE (NON-BLOCKING)
    // =====================================================

    if(

        !Array.isArray(
            window.__villageLocationCache
        ) ||

        !window.__villageLocationCache.length

    ){

        // -----------------------------------------
        // Load only once in background
        // -----------------------------------------

        if(

            !window.__VILLAGE_LOCATION_LOADING__

        ){

            window.__VILLAGE_LOCATION_LOADING__ = true;

            Promise.resolve(

                loadVillageLocations()

            )

            .catch(function(err){

                console.error(

                    "❌ loadVillageLocations failed",

                    err

                );

            })

            .finally(function(){

                window.__VILLAGE_LOCATION_LOADING__ = false;

            });

        }

        // -----------------------------------------
        // Cache not ready yet
        // -----------------------------------------

        return null;

    }

    // =====================================================
    // CACHE READY
    // =====================================================

    const locations =

        window.__villageLocationCache;

    if(

        !Array.isArray(locations) ||

        !locations.length

    ){

        return null;

    }

    // =====================================================
    // ORIGIN
    // =====================================================

    const origin =

        L.latLng(
            lat,
            lon
        );

    let nearest =

        null;

    let bestDistance =

        Infinity;

    // =====================================================
    // SEARCH
    // =====================================================

    locations.forEach(

        function(point){

            const plat =

                Number(

                    point.lat ??

                    point.location?.lat

                );

            const plon =

                Number(

                    point.lon ??

                    point.location?.lon

                );

            if(

                !Number.isFinite(plat) ||

                !Number.isFinite(plon)

            ){

                return;

            }

            const distance =

                origin.distanceTo(

                    L.latLng(

                        plat,

                        plon

                    )

                );

            if(

                distance >=

                bestDistance

            ){

                return;

            }

            bestDistance =

                distance;

            nearest = {

                village :

                    point.village ||

                    "",

                pointName :

                    point.pointName ||

                    point.cleanName ||

                    point.village ||

                    point.id ||

                    "",

                villageCode :

                    point.villageCode ||

                    "",

                block :

                    point.block ||

                    "",

                latitude :

                    plat,

                longitude :

                    plon,

                distanceMeters :

                    Math.round(
                        distance
                    ),

                raw :

                    point

            };

        }

    );

    return nearest;

};

/* ============================================================
   🧭 RESOLVE COMPLETE CURRENT LOCATION
   ------------------------------------------------------------

   GPS
    │
    ├── Forest compartment
    │
    ├── Village polygon
    │
    └── Nearest recorded Village GPS point

============================================================ */

/* ============================================================
   🧭 RESOLVE COMPLETE CURRENT LOCATION
============================================================ */

GISEntities.resolveCurrentLocation =
function(
    lat,
    lon
){

    lat =
        Number(lat);

    lon =
        Number(lon);

    if(

        !Number.isFinite(lat) ||

        !Number.isFinite(lon)

    ){

        return null;

    }

    // =====================================================
    // FIND GIS
    // =====================================================

    const village =

        GISEntities.findVillageAtPoint(
            lat,
            lon
        );

    const compartment =

        GISEntities.findCompartmentAtPoint(
            lat,
            lon
        );

    const nearest =

        GISEntities.findNearestVillagePoint(
            lat,
            lon
        );

    // =====================================================
    // DISPLAY VARIABLES
    // =====================================================

    let displayVillage = "";

    let displayNearestPoint = "";

    let displayCompartment = "";

    let locationText = "";

    // =====================================================
    // CASE 1
    // INSIDE VILLAGE POLYGON
    //
    // Village        : LGD Village
    // Nearest Point  : Landmark
    // =====================================================

    if(

        village?.village

    ){

        displayVillage =

            village.village;

        displayNearestPoint =

            nearest?.pointName ||

            "";

        locationText =

            displayVillage;

    }

    // =====================================================
    // CASE 2
    // INSIDE FOREST COMPARTMENT
    //
    // Compartment    : Forest Compartment
    // Nearest Point  : Landmark
    // =====================================================

    else if(

        compartment?.compartment

    ){

        displayCompartment =

            compartment.compartment;

        displayNearestPoint =

            nearest?.pointName ||

            "";

        locationText =

            displayCompartment;

    }

    // =====================================================
    // CASE 3
    // OUTSIDE VILLAGE & COMPARTMENT
    //
    // Nearest Point : Landmark
    // =====================================================

    else{

        displayNearestPoint =

            nearest?.pointName ||

            "";

        locationText =

            displayNearestPoint ||

            "Unknown Location";

    }

    // =====================================================
    // RETURN
    // =====================================================

    return{

        // -------------------------------------------------
        // INPUT GPS
        // -------------------------------------------------

        lat :

            lat,

        lon :

            lon,

        // -------------------------------------------------
        // FOREST
        // -------------------------------------------------

        compartment :

            displayCompartment,

        beat :

            compartment?.beat ||

            "",

        range :

            compartment?.range ||

            "",

        division :

            compartment?.division ||

            "",

        // -------------------------------------------------
        // LGD VILLAGE
        // -------------------------------------------------

        village :

            displayVillage,

        villageCode :

            village?.villageCode ||

            "",

        block :

            village?.block ||

            "",

        // -------------------------------------------------
        // NEAREST LANDMARK
        // -------------------------------------------------

        nearestVillage :

            "",

        nearestPoint :

            displayNearestPoint,

        distanceMeters :

            nearest?.distanceMeters ??

            null,

        // -------------------------------------------------
        // DISPLAY
        // -------------------------------------------------

        text :

            locationText,

        // -------------------------------------------------
        // RAW RESULTS
        // -------------------------------------------------

        compartmentResult :

            compartment,

        villageResult :

            village,

        nearestPointResult :

            nearest

    };

};
    /*=====================================================
      REGISTER
    =====================================================*/

/*--------------------------------------------------
  Reset GIS Index

  Clears the cached GIS entity index.

  This does NOT modify:
  - window.allGISFeatures
  - window.allCompartmentFeatures
  - window.__villageCache

  It only clears the internal derived index.
--------------------------------------------------*/




/*--------------------------------------------------
  Rebuild GIS Index

  Required when GIS data is loaded after
  GISEntities.build() was previously called.

  This prevents an early empty/stale index from
  remaining authoritative for the page lifetime.
--------------------------------------------------*/


    /*
     * Freeze the public module exactly as before.
     *
     * Internal index data remains managed privately.
     */

    GG.GISEntities =

        Object.freeze(

            GISEntities

        );


})(

    window.GreenGuardAI

);
