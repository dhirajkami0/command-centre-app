/* ============================================================
   🚨 GREENGUARD OFFENCE SPATIAL ENGINE
   File:
   js/analytics/offenceSpatialEngine.js

   Version:
   1.0.0

   PURPOSE
   ------------------------------------------------------------
   Builds the authoritative polygon relationship model:

   SOURCE
   Accused Address
        ↓
   Canonical Village
        ↓
   POR
        ↓
   Canonical Target Range

   TARGET
   Canonical Target Range
        ↓
   POR
        ↓
   Canonical Source Village


   IMPORTANT
   ------------------------------------------------------------
   This module DOES NOT:

   - render Leaflet polygons
   - modify villageBoundaryLayer
   - modify SourceEngine
   - modify TargetEngine
   - modify HeatmapEngine
   - geocode external addresses
   - duplicate GeoJSON geometry
   - mutate offence Store records


   AUTHORITATIVE CONNECTOR
   ------------------------------------------------------------
   POR KEY


   PRIMARY INDEXES
   ------------------------------------------------------------

   sourceVillageIndex

     canonicalVillageId
       →
     source village aggregate


   targetRangeIndex

     canonicalRangeName
       →
     target range aggregate


   sourceToTargetIndex

     canonicalVillageId
       →
     Map(
       canonicalRangeName
         →
       relationship aggregate
     )


   targetToSourceIndex

     canonicalRangeName
       →
     Map(
       canonicalVillageId
         →
       relationship aggregate
     )


   porSpatialIndex

     porKey
       →
     complete spatial relationship


   DESIGN PRINCIPLE
   ------------------------------------------------------------
   One POR is counted ONCE per source-village / target-range
   relationship.

   Multiple accused from the same village in the same POR
   do NOT artificially increase offence count.

   Multiple accused from different villages in the same POR
   may create multiple source-village relationships.

============================================================ */


(function () {

  "use strict";


  /* ============================================================
     🌐 GLOBAL NAMESPACE
  ============================================================ */

  window.GG =
    window.GG ||
    {};


  GG.Offence =
    GG.Offence ||
    {};


  const Offence =
    GG.Offence;


  /* ============================================================
     🚨 ENGINE
  ============================================================ */

  const OffenceSpatialEngine = {

    VERSION:
      "1.0.0",


    MODULE_NAME:
      "OffenceSpatialEngine",


    AUTHORITATIVE_CONNECTOR:
      "POR",


    initialized:
      false,


    ready:
      false,


    building:
      false,


    lastBuiltAt:
      null,


    lastBuildDuration:
      0,


    /* ========================================================
       📦 PRIMARY INDEXES
    ======================================================== */

    sourceVillageIndex:
      new Map(),


    targetRangeIndex:
      new Map(),


    sourceToTargetIndex:
      new Map(),


    targetToSourceIndex:
      new Map(),


    porSpatialIndex:
      new Map(),


    /* ========================================================
       📦 SECONDARY INDEXES
    ======================================================== */

    villageNameIndex:
      new Map(),


    villageCodeIndex:
      new Map(),


    rangeNameIndex:
      new Map(),


    unresolvedSourceIndex:
      new Map(),


    unresolvedTargetIndex:
      new Map(),


    /* ========================================================
       📊 STATS
    ======================================================== */

    stats: {

      totalPor:
        0,

      spatialPor:
        0,

      sourceResolvedPor:
        0,

      targetResolvedPor:
        0,

      fullyResolvedPor:
        0,

      unresolvedSourcePor:
        0,

      unresolvedTargetPor:
        0,

      sourceVillages:
        0,

      targetRanges:
        0,

      sourceTargetLinks:
        0,

      villageRecords:
        0

    },


    /* ========================================================
       🔤 SAFE STRING
    ======================================================== */

    safeString: function (
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

    },


    /* ========================================================
       🔤 NORMALIZE GENERAL TEXT
    ======================================================== */

    normalizeText: function (
      value
    ) {

      return this
        .safeString(
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
        .replace(
          /&/g,
          " AND "
        )
        .replace(
          /[^A-Z0-9]+/g,
          " "
        )
        .replace(
          /\s+/g,
          " "
        )
        .trim();

    },


    /* ========================================================
       🔤 NORMALIZE COMPACT TEXT

       Useful for matching:

       RAJA BHAT KHAWA
       RAJABHATKHWA
       RAJA-BHAT-KHAWA

    ======================================================== */

    normalizeCompact: function (
      value
    ) {

      return this
        .normalizeText(
          value
        )
        .replace(
          /\s+/g,
          ""
        );

    },


    /* ========================================================
       🔗 NORMALIZE POR
    ======================================================== */

    normalizePorKey: function (
      value
    ) {

      const Normalizer =
        Offence
          ?.Normalizer;


      if (
        typeof Normalizer
          ?.normalizePor ===
        "function"
      ) {

        try {

          return Normalizer
            .normalizePor(
              value
            );

        }

        catch (
          err
        ) {}

      }


      return this
        .safeString(
          value
        )
        .toUpperCase()
        .replace(
          /\s+/g,
          " "
        )
        .trim();

    },


    /* ========================================================
       🏡 GET CANONICAL VILLAGES
    ======================================================== */

    getCanonicalVillages: function () {

      return Array.isArray(
        window
          .__villageBoundaryCache
      )
        ? window
            .__villageBoundaryCache
        : [];

    },


    /* ========================================================
       🗺 GET GIS ENTITIES
    ======================================================== */

    getGISEntities: function () {

      return (

        window
          .GreenGuardAI
          ?.GISEntities

        ||

        window
          .GG
          ?.GISEntities

        ||

        null

      );

    },


    /* ========================================================
       🚨 GET OFFENCE STORE
    ======================================================== */

    getStore: function () {

      return (

        Offence
          ?.Store

        ||

        null

      );

    },


    /* ========================================================
       📚 GET POR CASCADES
    ======================================================== */

    getStoreCascades: function () {

      const Store =
        this.getStore();


      if (
        !Store
      ) {

        return [];

      }


      try {

        if (
          typeof Store
            .getCaseCascades ===
          "function"
        ) {

          const result =
            Store
              .getCaseCascades();


          if (
            Array.isArray(
              result
            )
          ) {

            return result;

          }

        }

      }

      catch (
        err
      ) {}


      try {

        if (
          typeof Store
            .getAllCascades ===
          "function"
        ) {

          const result =
            Store
              .getAllCascades();


          if (
            Array.isArray(
              result
            )
          ) {

            return result;

          }

        }

      }

      catch (
        err
      ) {}


      return [];

    },


    /* ========================================================
       🔗 EXTRACT POR KEY
    ======================================================== */

    extractPorKey: function (
      cascade
    ) {

      if (
        !cascade
      ) {

        return "";

      }


      return this
        .normalizePorKey(

          cascade
            .porKey

          ||

          cascade
            .porNo

          ||

          cascade
            .case
            ?.porKey

          ||

          cascade
            .case
            ?.porNo

          ||

          cascade
            .case
            ?.refPorNo

        );

    },


    /* ========================================================
       🔗 EXTRACT DISPLAY POR NUMBER
    ======================================================== */

    extractPorNo: function (
      cascade
    ) {

      return this
        .safeString(

          cascade
            ?.porNo

          ||

          cascade
            ?.case
            ?.porNo

          ||

          cascade
            ?.case
            ?.refPorNo

          ||

          cascade
            ?.porKey

        );

    },


    /* ========================================================
       🆔 EXTRACT CASE ID
    ======================================================== */

    extractCaseId: function (
      caseRecord
    ) {

      return this
        .safeString(

          caseRecord
            ?.caseId

          ||

          caseRecord
            ?.id

          ||

          caseRecord
            ?.documentId

        );

    },


    /* ========================================================
       👤 EXTRACT ACCUSED ID
    ======================================================== */

    extractAccusedId: function (
      accused
    ) {

      return this
        .safeString(

          accused
            ?.accusedId

          ||

          accused
            ?.id

          ||

          accused
            ?.documentId

        );

    },


    /* ========================================================
       🏠 EXTRACT ACCUSED ADDRESS
    ======================================================== */

    extractAccusedAddress: function (
      accused
    ) {

      return this
        .safeString(

          accused
            ?.address

          ||

          accused
            ?.addressOfAccused

          ||

          accused
            ?.fullAddress

          ||

          accused
            ?.presentAddress

          ||

          accused
            ?.permanentAddress

        );

    },


    /* ========================================================
       🏗 BUILD VILLAGE SEARCH INDEXES
    ======================================================== */

    buildVillageIndexes: function () {

      this
        .villageNameIndex
        .clear();


      this
        .villageCodeIndex
        .clear();


      const villages =
        this
          .getCanonicalVillages();


      this
        .stats
        .villageRecords =
        villages
          .length;


      villages
        .forEach(

          village => {

            if (
              !village
            ) {

              return;

            }


            const canonicalId =
              this
                .safeString(

                  village
                    .canonicalId

                  ||

                  village
                    .id

                );


            if (
              !canonicalId
            ) {

              return;

            }


            const names =
              new Set();


            const addName =
              value => {

                const normalized =
                  this
                    .normalizeText(
                      value
                    );


                if (
                  normalized
                ) {

                  names
                    .add(
                      normalized
                    );

                }


                const compact =
                  this
                    .normalizeCompact(
                      value
                    );


                if (
                  compact
                ) {

                  names
                    .add(
                      compact
                    );

                }

              };


            addName(
              village
                .name
            );


            addName(
              village
                .cleanName
            );


            if (
              Array.isArray(
                village
                  .aliases
              )
            ) {

              village
                .aliases
                .forEach(
                  addName
                );

            }


            names
              .forEach(

                nameKey => {

                  if (
                    !this
                      .villageNameIndex
                      .has(
                        nameKey
                      )
                  ) {

                    this
                      .villageNameIndex
                      .set(
                        nameKey,
                        []
                      );

                  }


                  this
                    .villageNameIndex
                    .get(
                      nameKey
                    )
                    .push(
                      village
                    );

                }

              );


            const villageCode =
              this
                .normalizeText(

                  village
                    .villageCode

                );


            if (
              villageCode
            ) {

              if (
                !this
                  .villageCodeIndex
                  .has(
                    villageCode
                  )
              ) {

                this
                  .villageCodeIndex
                  .set(
                    villageCode,
                    []
                  );

              }


              this
                .villageCodeIndex
                .get(
                  villageCode
                )
                .push(
                  village
                );

            }

          }

        );

    },


    /* ========================================================
       🏡 SCORE VILLAGE AGAINST ADDRESS

       IMPORTANT
       --------------------------------------------------------
       This is deterministic local matching.

       It prefers the longest matching village name.

       Example:

       Address:
       "Vill-Kolabari,Salkumar, P.O-Kolabari"

       Candidate:
       SALKUMAR

       Result:
       Canonical Salkumar village.

    ======================================================== */

    scoreVillageMatch: function (
      address,
      village
    ) {

      if (
        !address ||
        !village
      ) {

        return 0;

      }


      const normalizedAddress =
        this
          .normalizeText(
            address
          );


      const compactAddress =
        this
          .normalizeCompact(
            address
          );


      if (
        !normalizedAddress
      ) {

        return 0;

      }


      const candidateNames =
        [];


      if (
        village
          .name
      ) {

        candidateNames
          .push(
            village
              .name
          );

      }


      if (
        village
          .cleanName
      ) {

        candidateNames
          .push(
            village
              .cleanName
          );

      }


      if (
        Array.isArray(
          village
            .aliases
        )
      ) {

        candidateNames
          .push(
            ...village
              .aliases
          );

      }


      let bestScore =
        0;


      candidateNames
        .forEach(

          candidate => {

            const normalizedName =
              this
                .normalizeText(
                  candidate
                );


            const compactName =
              this
                .normalizeCompact(
                  candidate
                );


            if (
              !normalizedName
            ) {

              return;

            }


            /*
             Exact normalized address
            */

            if (
              normalizedAddress ===
              normalizedName
            ) {

              bestScore =
                Math.max(
                  bestScore,
                  10000 +
                  normalizedName
                    .length
                );


              return;

            }


            /*
             Word-safe village match
            */

            const paddedAddress =
              " " +
              normalizedAddress +
              " ";


            const paddedName =
              " " +
              normalizedName +
              " ";


            if (
              paddedAddress
                .includes(
                  paddedName
                )
            ) {

              bestScore =
                Math.max(
                  bestScore,
                  5000 +
                  normalizedName
                    .length
                );

            }


            /*
             Compact fallback

             Avoid extremely short names because they
             may create false matches.
            */

            if (
              compactName
                .length >=
              5

              &&

              compactAddress
                .includes(
                  compactName
                )
            ) {

              bestScore =
                Math.max(
                  bestScore,
                  2000 +
                  compactName
                    .length
                );

            }

          }

        );


      return bestScore;

    },


    /* ========================================================
       🏡 RESOLVE ADDRESS → CANONICAL VILLAGE
    ======================================================== */

    resolveVillageFromAddress:
      function (
        address
      ) {

        const rawAddress =
          this
            .safeString(
              address
            );


        if (
          !rawAddress
        ) {

          return null;

        }


        const villages =
          this
            .getCanonicalVillages();


        let bestVillage =
          null;


        let bestScore =
          0;


        villages
          .forEach(

            village => {

              const score =
                this
                  .scoreVillageMatch(
                    rawAddress,
                    village
                  );


              if (
                score >
                bestScore
              ) {

                bestScore =
                  score;


                bestVillage =
                  village;

              }

            }

          );


        if (
          !bestVillage ||
          bestScore <= 0
        ) {

          return null;

        }


        return {

          village:
            bestVillage,

          canonicalId:
            this
              .safeString(

                bestVillage
                  .canonicalId

                ||

                bestVillage
                  .id

              ),

          villageCode:
            this
              .safeString(
                bestVillage
                  .villageCode
              ),

          name:
            this
              .safeString(
                bestVillage
                  .name
              ),

          cleanName:
            this
              .safeString(
                bestVillage
                  .cleanName
              ),

          score:
            bestScore,

          address:
            rawAddress

        };

    },


    /* ========================================================
       🗺 RESOLVE TARGET RANGE FROM CASE

       PRIORITY
       --------------------------------------------------------

       1. rangeCanonical
       2. range
       3. rangeRaw
       4. rangeCode

       Then pass through GISEntities.resolveRangeAlias()
       where available.

    ======================================================== */

    resolveTargetRange:
      function (
        caseRecord
      ) {

        if (
          !caseRecord
        ) {

          return null;

        }


        const candidates =
          [

            caseRecord
              .rangeCanonical,

            caseRecord
              .range,

            caseRecord
              .rangeRaw,

            caseRecord
              .rangeCode

          ]
          .map(
            value =>
              this
                .safeString(
                  value
                )
          )
          .filter(
            Boolean
          );


        if (
          !candidates
            .length
        ) {

          return null;

        }


        const GIS =
          this
            .getGISEntities();


        for (
          const candidate
          of
          candidates
        ) {

          let resolved =
            candidate;


          if (
            GIS &&
            typeof GIS
              .resolveRangeAlias ===
            "function"
          ) {

            try {

              const aliasResult =
                GIS
                  .resolveRangeAlias(
                    candidate
                  );


              if (
                aliasResult
              ) {

                if (
                  typeof aliasResult ===
                  "string"
                ) {

                  resolved =
                    aliasResult;

                }

                else {

                  resolved =

                    aliasResult
                      .name

                    ||

                    aliasResult
                      .range

                    ||

                    aliasResult
                      .canonicalName

                    ||

                    aliasResult
                      .rangeCanonical

                    ||

                    candidate;

                }

              }

            }

            catch (
              err
            ) {}

          }


          /*
           Verify range against GIS if possible
          */

          if (
            GIS &&
            typeof GIS
              .searchRangeFeatures ===
            "function"
          ) {

            try {

              const features =
                GIS
                  .searchRangeFeatures(
                    resolved
                  );


              if (
                Array.isArray(
                  features
                )
                &&
                features
                  .length
              ) {

                const firstRange =
                  this
                    .safeString(

                      features[0]
                        ?.properties
                        ?.range

                    );


                return {

                  name:
                    firstRange ||
                    resolved,

                  cleanName:
                    this
                      .normalizeText(

                        firstRange ||
                        resolved

                      ),

                  raw:
                    candidate,

                  gisResolved:
                    true,

                  featureCount:
                    features
                      .length

                };

              }

            }

            catch (
              err
            ) {}

          }


          /*
           Case may already be marked GIS resolved.
          */

          if (
            caseRecord
              .rangeGISResolved ===
            true

            &&

            resolved
          ) {

            return {

              name:
                resolved,

              cleanName:
                this
                  .normalizeText(
                    resolved
                  ),

              raw:
                candidate,

              gisResolved:
                true,

              featureCount:
                null

            };

          }

        }


        /*
         Keep first available range as unresolved fallback.
        */

        const fallback =
          candidates[0];


        return {

          name:
            fallback,

          cleanName:
            this
              .normalizeText(
                fallback
              ),

          raw:
            fallback,

          gisResolved:
            false,

          featureCount:
            0

        };

    },


    /* ========================================================
       🏗 CREATE POR SPATIAL RELATION
    ======================================================== */

    createPorSpatialRelation:
      function (
        cascade
      ) {

        const porKey =
          this
            .extractPorKey(
              cascade
            );


        if (
          !porKey
        ) {

          return null;

        }


        const porNo =
          this
            .extractPorNo(
              cascade
            );


        const caseRecord =

          cascade
            ?.case

          ||

          (
            Array.isArray(
              cascade
                ?.cases
            )
              ? cascade
                  .cases[0]
              : null
          )

          ||

          null;


        return {

          porKey:
            porKey,

          porNo:
            porNo,

          caseId:
            this
              .extractCaseId(
                caseRecord
              ),

          case:
            caseRecord,

          cases:
            Array.isArray(
              cascade
                ?.cases
            )
              ? cascade
                  .cases
              : (
                  caseRecord
                    ? [caseRecord]
                    : []
                ),

          accused:
            Array.isArray(
              cascade
                ?.accused
            )
              ? cascade
                  .accused
              : [],

          sourceVillages:
            [],

          targetRange:
            null,

          sourceResolved:
            false,

          targetResolved:
            false,

          fullyResolved:
            false,

          cascade:
            cascade

        };

    },


    /* ========================================================
       🏡 RESOLVE ALL SOURCE VILLAGES FOR POR
    ======================================================== */

    resolvePorSources:
      function (
        relation
      ) {

        if (
          !relation
        ) {

          return [];

        }


        const unique =
          new Map();


        relation
          .accused
          .forEach(

            accused => {

              const address =
                this
                  .extractAccusedAddress(
                    accused
                  );


              if (
                !address
              ) {

                return;

              }


              const resolved =
                this
                  .resolveVillageFromAddress(
                    address
                  );


              if (
                !resolved
              ) {

                return;

              }


              const canonicalId =
                resolved
                  .canonicalId;


              if (
                !canonicalId
              ) {

                return;

              }


              if (
                !unique
                  .has(
                    canonicalId
                  )
              ) {

                unique
                  .set(

                    canonicalId,

                    {

                      canonicalId:
                        canonicalId,

                      villageCode:
                        resolved
                          .villageCode,

                      name:
                        resolved
                          .name,

                      cleanName:
                        resolved
                          .cleanName,

                      village:
                        resolved
                          .village,

                      addresses:
                        [],

                      accusedIds:
                        [],

                      accused:
                        [],

                      matchScores:
                        []

                    }

                  );

              }


              const source =
                unique
                  .get(
                    canonicalId
                  );


              if (
                !source
                  .addresses
                  .includes(
                    address
                  )
              ) {

                source
                  .addresses
                  .push(
                    address
                  );

              }


              const accusedId =
                this
                  .extractAccusedId(
                    accused
                  );


              if (
                accusedId &&
                !source
                  .accusedIds
                  .includes(
                    accusedId
                  )
              ) {

                source
                  .accusedIds
                  .push(
                    accusedId
                  );

              }


              if (
                accused
              ) {

                source
                  .accused
                  .push(
                    accused
                  );

              }


              source
                .matchScores
                .push(
                  resolved
                    .score
                );

            }

          );


        return Array.from(
          unique
            .values()
        );

    },


    /* ========================================================
       🎯 RESOLVE TARGET RANGE FOR POR
    ======================================================== */

    resolvePorTarget:
      function (
        relation
      ) {

        if (
          !relation
        ) {

          return null;

        }


        const caseCandidates =
          [];


        if (
          relation
            .case
        ) {

          caseCandidates
            .push(
              relation
                .case
            );

        }


        if (
          Array.isArray(
            relation
              .cases
          )
        ) {

          relation
            .cases
            .forEach(

              item => {

                if (
                  item &&
                  !caseCandidates
                    .includes(
                      item
                    )
                ) {

                  caseCandidates
                    .push(
                      item
                    );

                }

              }

            );

        }


        for (
          const caseRecord
          of
          caseCandidates
        ) {

          const target =
            this
              .resolveTargetRange(
                caseRecord
              );


          if (
            target
          ) {

            return target;

          }

        }


        return null;

    },


    /* ========================================================
       🏡 REGISTER SOURCE VILLAGE
    ======================================================== */

    registerSourceVillage:
      function (
        source,
        relation
      ) {

        if (
          !source ||
          !relation
        ) {

          return;

        }


        const id =
          source
            .canonicalId;


        if (
          !id
        ) {

          return;

        }


        if (
          !this
            .sourceVillageIndex
            .has(
              id
            )
        ) {

          this
            .sourceVillageIndex
            .set(

              id,

              {

                id:
                  id,

                canonicalId:
                  id,

                villageCode:
                  source
                    .villageCode,

                name:
                  source
                    .name,

                cleanName:
                  source
                    .cleanName,

                village:
                  source
                    .village,

                offenceCount:
                  0,

                porKeys:
                  [],

                porNos:
                  [],

                caseIds:
                  [],

                accusedIds:
                  [],

                addresses:
                  [],

                targetRanges:
                  [],

                relations:
                  []

              }

            );

        }


        const aggregate =
          this
            .sourceVillageIndex
            .get(
              id
            );


        /*
         POR is authoritative count.

         Same POR must not increase count twice.
        */

        if (
          !aggregate
            .porKeys
            .includes(
              relation
                .porKey
            )
        ) {

          aggregate
            .porKeys
            .push(
              relation
                .porKey
            );


          aggregate
            .offenceCount++;

        }


        if (
          relation
            .porNo &&
          !aggregate
            .porNos
            .includes(
              relation
                .porNo
            )
        ) {

          aggregate
            .porNos
            .push(
              relation
                .porNo
            );

        }


        if (
          relation
            .caseId &&
          !aggregate
            .caseIds
            .includes(
              relation
                .caseId
            )
        ) {

          aggregate
            .caseIds
            .push(
              relation
                .caseId
            );

        }


        source
          .accusedIds
          .forEach(

            accusedId => {

              if (
                !aggregate
                  .accusedIds
                  .includes(
                    accusedId
                  )
              ) {

                aggregate
                  .accusedIds
                  .push(
                    accusedId
                  );

              }

            }

          );


        source
          .addresses
          .forEach(

            address => {

              if (
                !aggregate
                  .addresses
                  .includes(
                    address
                  )
              ) {

                aggregate
                  .addresses
                  .push(
                    address
                  );

              }

            }

          );


        const targetName =
          relation
            .targetRange
            ?.name;


        if (
          targetName &&
          !aggregate
            .targetRanges
            .includes(
              targetName
            )
        ) {

          aggregate
            .targetRanges
            .push(
              targetName
            );

        }


        aggregate
          .relations
          .push(
            relation
          );

    },


    /* ========================================================
       🎯 REGISTER TARGET RANGE
    ======================================================== */

    registerTargetRange:
      function (
        target,
        relation
      ) {

        if (
          !target ||
          !relation
        ) {

          return;

        }


        const key =
          target
            .cleanName

          ||

          this
            .normalizeText(
              target
                .name
            );


        if (
          !key
        ) {

          return;

        }


        if (
          !this
            .targetRangeIndex
            .has(
              key
            )
        ) {

          this
            .targetRangeIndex
            .set(

              key,

              {

                id:
                  key,

                key:
                  key,

                name:
                  target
                    .name,

                cleanName:
                  key,

                gisResolved:
                  target
                    .gisResolved,

                featureCount:
                  target
                    .featureCount,

                offenceCount:
                  0,

                porKeys:
                  [],

                porNos:
                  [],

                caseIds:
                  [],

                sourceVillageIds:
                  [],

                relations:
                  []

              }

            );

        }


        const aggregate =
          this
            .targetRangeIndex
            .get(
              key
            );


        if (
          !aggregate
            .porKeys
            .includes(
              relation
                .porKey
            )
        ) {

          aggregate
            .porKeys
            .push(
              relation
                .porKey
            );


          aggregate
            .offenceCount++;

        }


        if (
          relation
            .porNo &&
          !aggregate
            .porNos
            .includes(
              relation
                .porNo
            )
        ) {

          aggregate
            .porNos
            .push(
              relation
                .porNo
            );

        }


        if (
          relation
            .caseId &&
          !aggregate
            .caseIds
            .includes(
              relation
                .caseId
            )
        ) {

          aggregate
            .caseIds
            .push(
              relation
                .caseId
            );

        }


        relation
          .sourceVillages
          .forEach(

            source => {

              if (
                !aggregate
                  .sourceVillageIds
                  .includes(
                    source
                      .canonicalId
                  )
              ) {

                aggregate
                  .sourceVillageIds
                  .push(
                    source
                      .canonicalId
                  );

              }

            }

          );


        aggregate
          .relations
          .push(
            relation
          );

    },


    /* ========================================================
       🔗 REGISTER SOURCE → TARGET LINK
    ======================================================== */

    registerSourceTargetLink:
      function (
        source,
        target,
        relation
      ) {

        if (
          !source ||
          !target ||
          !relation
        ) {

          return;

        }


        const sourceId =
          source
            .canonicalId;


        const targetKey =
          target
            .cleanName

          ||

          this
            .normalizeText(
              target
                .name
            );


        if (
          !sourceId ||
          !targetKey
        ) {

          return;

        }


        /* ----------------------------------------------------
           SOURCE → TARGET
        ---------------------------------------------------- */

        if (
          !this
            .sourceToTargetIndex
            .has(
              sourceId
            )
        ) {

          this
            .sourceToTargetIndex
            .set(
              sourceId,
              new Map()
            );

        }


        const sourceMap =
          this
            .sourceToTargetIndex
            .get(
              sourceId
            );


        if (
          !sourceMap
            .has(
              targetKey
            )
        ) {

          sourceMap
            .set(

              targetKey,

              {

                sourceId:
                  sourceId,

                sourceName:
                  source
                    .name,

                targetKey:
                  targetKey,

                targetName:
                  target
                    .name,

                offenceCount:
                  0,

                porKeys:
                  [],

                porNos:
                  [],

                caseIds:
                  [],

                relations:
                  []

              }

            );

        }


        const forward =
          sourceMap
            .get(
              targetKey
            );


        if (
          !forward
            .porKeys
            .includes(
              relation
                .porKey
            )
        ) {

          forward
            .porKeys
            .push(
              relation
                .porKey
            );


          forward
            .offenceCount++;

        }


        if (
          relation
            .porNo &&
          !forward
            .porNos
            .includes(
              relation
                .porNo
            )
        ) {

          forward
            .porNos
            .push(
              relation
                .porNo
            );

        }


        if (
          relation
            .caseId &&
          !forward
            .caseIds
            .includes(
              relation
                .caseId
            )
        ) {

          forward
            .caseIds
            .push(
              relation
                .caseId
            );

        }


        forward
          .relations
          .push(
            relation
          );


        /* ----------------------------------------------------
           TARGET → SOURCE
        ---------------------------------------------------- */

        if (
          !this
            .targetToSourceIndex
            .has(
              targetKey
            )
        ) {

          this
            .targetToSourceIndex
            .set(
              targetKey,
              new Map()
            );

        }


        const targetMap =
          this
            .targetToSourceIndex
            .get(
              targetKey
            );


        if (
          !targetMap
            .has(
              sourceId
            )
        ) {

          targetMap
            .set(

              sourceId,

              {

                targetKey:
                  targetKey,

                targetName:
                  target
                    .name,

                sourceId:
                  sourceId,

                sourceName:
                  source
                    .name,

                offenceCount:
                  0,

                porKeys:
                  [],

                porNos:
                  [],

                caseIds:
                  [],

                relations:
                  []

              }

            );

        }


        const reverse =
          targetMap
            .get(
              sourceId
            );


        if (
          !reverse
            .porKeys
            .includes(
              relation
                .porKey
            )
        ) {

          reverse
            .porKeys
            .push(
              relation
                .porKey
            );


          reverse
            .offenceCount++;

        }


        if (
          relation
            .porNo &&
          !reverse
            .porNos
            .includes(
              relation
                .porNo
            )
        ) {

          reverse
            .porNos
            .push(
              relation
                .porNo
            );

        }


        if (
          relation
            .caseId &&
          !reverse
            .caseIds
            .includes(
              relation
                .caseId
            )
        ) {

          reverse
            .caseIds
            .push(
              relation
                .caseId
            );

        }


        reverse
          .relations
          .push(
            relation
          );

    },


    /* ========================================================
       ❌ REGISTER UNRESOLVED SOURCE
    ======================================================== */

    registerUnresolvedSource:
      function (
        relation
      ) {

        if (
          !relation
        ) {

          return;

        }


        this
          .unresolvedSourceIndex
          .set(
            relation
              .porKey,
            relation
          );

    },


    /* ========================================================
       ❌ REGISTER UNRESOLVED TARGET
    ======================================================== */

    registerUnresolvedTarget:
      function (
        relation
      ) {

        if (
          !relation
        ) {

          return;

        }


        this
          .unresolvedTargetIndex
          .set(
            relation
              .porKey,
            relation
          );

    },


    /* ========================================================
       🧹 RESET
    ======================================================== */

    reset: function () {

      this
        .sourceVillageIndex
        .clear();


      this
        .targetRangeIndex
        .clear();


      this
        .sourceToTargetIndex
        .clear();


      this
        .targetToSourceIndex
        .clear();


      this
        .porSpatialIndex
        .clear();


      this
        .villageNameIndex
        .clear();


      this
        .villageCodeIndex
        .clear();


      this
        .rangeNameIndex
        .clear();


      this
        .unresolvedSourceIndex
        .clear();


      this
        .unresolvedTargetIndex
        .clear();


      this
        .stats = {

          totalPor:
            0,

          spatialPor:
            0,

          sourceResolvedPor:
            0,

          targetResolvedPor:
            0,

          fullyResolvedPor:
            0,

          unresolvedSourcePor:
            0,

          unresolvedTargetPor:
            0,

          sourceVillages:
            0,

          targetRanges:
            0,

          sourceTargetLinks:
            0,

          villageRecords:
            0

        };


      this.ready =
        false;

    },


    /* ========================================================
       🏗 BUILD
    ======================================================== */

    build: function () {

      if (
        this
          .building
      ) {

        console.warn(
          "⚠ OffenceSpatialEngine build already running"
        );


        return false;

      }


      const started =
        performance
          .now();


      this.building =
        true;


      try {

        this
          .reset();


        /* ----------------------------------------------------
           BUILD VILLAGE LOOKUP INDEXES
        ---------------------------------------------------- */

        this
          .buildVillageIndexes();


        /* ----------------------------------------------------
           GET AUTHORITATIVE POR CASCADES
        ---------------------------------------------------- */

        const cascades =
          this
            .getStoreCascades();


        this
          .stats
          .totalPor =
          cascades
            .length;


        /* ----------------------------------------------------
           BUILD EACH POR RELATIONSHIP
        ---------------------------------------------------- */

        cascades
          .forEach(

            cascade => {

              const relation =
                this
                  .createPorSpatialRelation(
                    cascade
                  );


              if (
                !relation
              ) {

                return;

              }


              /* ----------------------------------------------
                 RESOLVE SOURCE VILLAGES
              ---------------------------------------------- */

              relation
                .sourceVillages =
                this
                  .resolvePorSources(
                    relation
                  );


              relation
                .sourceResolved =
                relation
                  .sourceVillages
                  .length >
                0;


              /* ----------------------------------------------
                 RESOLVE TARGET RANGE
              ---------------------------------------------- */

              relation
                .targetRange =
                this
                  .resolvePorTarget(
                    relation
                  );


              relation
                .targetResolved =
                !!(
                  relation
                    .targetRange
                  &&
                  relation
                    .targetRange
                    .name
                );


              relation
                .fullyResolved =
                (
                  relation
                    .sourceResolved
                  &&
                  relation
                    .targetResolved
                );


              /* ----------------------------------------------
                 SAVE AUTHORITATIVE POR SPATIAL RECORD
              ---------------------------------------------- */

              this
                .porSpatialIndex
                .set(
                  relation
                    .porKey,
                  relation
                );


              /* ----------------------------------------------
                 SOURCE INDEX
              ---------------------------------------------- */

              if (
                relation
                  .sourceResolved
              ) {

                this
                  .stats
                  .sourceResolvedPor++;


                relation
                  .sourceVillages
                  .forEach(

                    source => {

                      this
                        .registerSourceVillage(
                          source,
                          relation
                        );

                    }

                  );

              }

              else {

                this
                  .stats
                  .unresolvedSourcePor++;


                this
                  .registerUnresolvedSource(
                    relation
                  );

              }


              /* ----------------------------------------------
                 TARGET INDEX
              ---------------------------------------------- */

              if (
                relation
                  .targetResolved
              ) {

                this
                  .stats
                  .targetResolvedPor++;


                this
                  .registerTargetRange(
                    relation
                      .targetRange,
                    relation
                  );

              }

              else {

                this
                  .stats
                  .unresolvedTargetPor++;


                this
                  .registerUnresolvedTarget(
                    relation
                  );

              }


              /* ----------------------------------------------
                 BIDIRECTIONAL SOURCE ↔ TARGET INDEX
              ---------------------------------------------- */

              if (
                relation
                  .fullyResolved
              ) {

                this
                  .stats
                  .fullyResolvedPor++;


                relation
                  .sourceVillages
                  .forEach(

                    source => {

                      this
                        .registerSourceTargetLink(

                          source,

                          relation
                            .targetRange,

                          relation

                        );

                    }

                  );

              }


              if (
                relation
                  .sourceResolved
                ||
                relation
                  .targetResolved
              ) {

                this
                  .stats
                  .spatialPor++;

              }

            }

          );


        /* ----------------------------------------------------
           FINAL STATS
        ---------------------------------------------------- */

        this
          .stats
          .sourceVillages =
          this
            .sourceVillageIndex
            .size;


        this
          .stats
          .targetRanges =
          this
            .targetRangeIndex
            .size;


        let linkCount =
          0;


        this
          .sourceToTargetIndex
          .forEach(

            targetMap => {

              linkCount +=
                targetMap
                  .size;

            }

          );


        this
          .stats
          .sourceTargetLinks =
          linkCount;


        /* ----------------------------------------------------
           READY
        ---------------------------------------------------- */

        this.ready =
          true;


        this.initialized =
          true;


        this.lastBuiltAt =
          new Date();


        this.lastBuildDuration =
          Math.round(

            performance
              .now()

            -

            started

          );


        console.log(
          "✅ OffenceSpatialEngine built",
          this.getStats()
        );


        /* ----------------------------------------------------
           EVENT
        ---------------------------------------------------- */

        try {

          window
            .dispatchEvent(

              new CustomEvent(

                "greenguard:offence-spatial-ready",

                {

                  detail: {

                    version:
                      this.VERSION,

                    stats:
                      this.getStats()

                  }

                }

              )

            );

        }

        catch (
          err
        ) {}


        return true;

      }

      catch (
        err
      ) {

        console.error(
          "❌ OffenceSpatialEngine build failed:",
          err
        );


        this.ready =
          false;


        return false;

      }

      finally {

        this.building =
          false;

      }

    },


    /* ========================================================
       🔄 REBUILD
    ======================================================== */

    rebuild: function () {

      return this
        .build();

    },

     /* ============================================================
   🚨 WAIT FOR OFFENCE STORE AND BUILD SPATIAL ENGINE

   PURPOSE
   ------------------------------------------------------------
   SpatialEngine depends on Offence.Store POR cascades.

   During application startup the SpatialEngine script may load
   before Offence.Store has completed building.

   This function waits asynchronously until the Store contains
   POR cascades, then performs exactly one authoritative rebuild.

   IMPORTANT
   ------------------------------------------------------------
   - Does NOT block UI
   - Does NOT use a synchronous loop
   - Does NOT rebuild repeatedly once ready
   - Safe if Store is already ready
============================================================ */

SpatialEngine.waitForStoreAndBuild =
  function () {

    /* ========================================================
       ALREADY READY
    ======================================================== */

    if (
      SpatialEngine.ready === true &&
      SpatialEngine.porSpatialIndex?.size > 0
    ) {

      console.log(
        "🚨 OffenceSpatialEngine already ready:",
        SpatialEngine.porSpatialIndex.size,
        "PORs"
      );

      return;

    }


    /* ========================================================
       PREVENT DUPLICATE WAIT LOOPS
    ======================================================== */

    if (
      SpatialEngine.__storeWaitActive === true
    ) {

      return;

    }


    SpatialEngine.__storeWaitActive =
      true;


    let attempts =
      0;


    const MAX_ATTEMPTS =
      120;


    const INTERVAL_MS =
      500;


    console.log(
      "⏳ OffenceSpatialEngine waiting for Offence Store..."
    );


    const timer =
      setInterval(

        function () {

          attempts++;


          try {

            const Store =
              window.GG
                ?.Offence
                ?.Store;


            /* ==================================================
               STORE MODULE NOT AVAILABLE YET
            ================================================== */

            if (
              !Store
            ) {

              return;

            }


            /* ==================================================
               STORE NOT READY YET
            ================================================== */

            if (
              Store.ready !== true
            ) {

              return;

            }


            /* ==================================================
               GET POR CASCADES
            ================================================== */

const cascades =
  SpatialEngine
    .getStoreCascades();


            /* ==================================================
               STORE READY BUT DATA NOT POPULATED YET
            ================================================== */

            if (
              !Array.isArray(
                cascades
              ) ||
              cascades.length === 0
            ) {

              return;

            }


            /* ==================================================
               STORE IS AUTHORITATIVELY READY
            ================================================== */

            clearInterval(
              timer
            );


            SpatialEngine.__storeWaitActive =
              false;


            console.log(

              "🔥 Offence Store ready →",

              cascades.length,

              "POR cascades"

            );


            /* ==================================================
               BUILD SPATIAL ENGINE
            ================================================== */

            const result =
              SpatialEngine.rebuild();


            /* ==================================================
               SUPPORT ASYNC REBUILD IF IMPLEMENTATION CHANGES
            ================================================== */

            if (
              result &&
              typeof result.then ===
              "function"
            ) {

              result

                .then(

                  function () {

                    console.log(

                      "✅ OffenceSpatialEngine automatic build complete",

                      SpatialEngine.getStats?.()

                    );

                  }

                )

                .catch(

                  function (
                    err
                  ) {

                    console.error(

                      "❌ OffenceSpatialEngine automatic build failed:",

                      err

                    );

                  }

                );

            }

            else {

              console.log(

                "✅ OffenceSpatialEngine automatic build complete",

                SpatialEngine.getStats?.()

              );

            }

          }


          catch (
            err
          ) {

            console.error(

              "❌ OffenceSpatialEngine startup wait error:",

              err

            );

          }


          /* ====================================================
             TIMEOUT SAFETY

             120 × 500 ms = 60 seconds.

             We stop polling instead of leaving a permanent
             background interval running.
          ==================================================== */

          if (
            attempts >=
            MAX_ATTEMPTS
          ) {

            clearInterval(
              timer
            );


            SpatialEngine.__storeWaitActive =
              false;


            console.warn(

              "⚠ OffenceSpatialEngine Store wait timeout after",

              attempts,

              "attempts"

            );

          }

        },

        INTERVAL_MS

      );

  };

    /* ========================================================
       🏡 GET ALL SOURCE VILLAGES
    ======================================================== */

    getSourceVillages:
      function () {

        return Array.from(

          this
            .sourceVillageIndex
            .values()

        )
        .sort(

          (
            a,
            b
          ) =>

            b
              .offenceCount

            -

            a
              .offenceCount

        );

    },


    /* ========================================================
       🎯 GET ALL TARGET RANGES
    ======================================================== */

    getTargetRanges:
      function () {

        return Array.from(

          this
            .targetRangeIndex
            .values()

        )
        .sort(

          (
            a,
            b
          ) =>

            b
              .offenceCount

            -

            a
              .offenceCount

        );

    },


    /* ========================================================
       🏡 GET SOURCE VILLAGE
    ======================================================== */

    getSourceVillage:
      function (
        canonicalId
      ) {

        return (

          this
            .sourceVillageIndex
            .get(
              canonicalId
            )

          ||

          null

        );

    },


    /* ========================================================
       🎯 GET TARGET RANGE
    ======================================================== */

    getTargetRange:
      function (
        rangeName
      ) {

        const key =
          this
            .normalizeText(
              rangeName
            );


        return (

          this
            .targetRangeIndex
            .get(
              key
            )

          ||

          null

        );

    },


    /* ========================================================
       🔗 GET POR SPATIAL RELATION
    ======================================================== */

    getByPor:
      function (
        porNo
      ) {

        const key =
          this
            .normalizePorKey(
              porNo
            );


        return (

          this
            .porSpatialIndex
            .get(
              key
            )

          ||

          null

        );

    },


    /* ========================================================
       ➡ GET TARGETS FOR SOURCE
    ======================================================== */

    getTargetsForSource:
      function (
        canonicalVillageId
      ) {

        const targetMap =
          this
            .sourceToTargetIndex
            .get(
              canonicalVillageId
            );


        if (
          !targetMap
        ) {

          return [];

        }


        return Array.from(

          targetMap
            .values()

        )
        .sort(

          (
            a,
            b
          ) =>

            b
              .offenceCount

            -

            a
              .offenceCount

        );

    },


    /* ========================================================
       ⬅ GET SOURCES FOR TARGET
    ======================================================== */

    getSourcesForTarget:
      function (
        rangeName
      ) {

        const targetKey =
          this
            .normalizeText(
              rangeName
            );


        const sourceMap =
          this
            .targetToSourceIndex
            .get(
              targetKey
            );


        if (
          !sourceMap
        ) {

          return [];

        }


        return Array.from(

          sourceMap
            .values()

        )
        .sort(

          (
            a,
            b
          ) =>

            b
              .offenceCount

            -

            a
              .offenceCount

        );

    },


    /* ========================================================
       📁 GET CASES FOR SOURCE → TARGET
    ======================================================== */

    getCasesForSourceTarget:
      function (
        canonicalVillageId,
        rangeName
      ) {

        const targetKey =
          this
            .normalizeText(
              rangeName
            );


        const targetMap =
          this
            .sourceToTargetIndex
            .get(
              canonicalVillageId
            );


        if (
          !targetMap
        ) {

          return [];

        }


        const link =
          targetMap
            .get(
              targetKey
            );


        if (
          !link
        ) {

          return [];

        }


        return link
          .relations
          .map(

            relation => ({

              porKey:
                relation
                  .porKey,

              porNo:
                relation
                  .porNo,

              caseId:
                relation
                  .caseId,

              case:
                relation
                  .case,

              cases:
                relation
                  .cases,

              accused:
                relation
                  .accused,

              sourceVillages:
                relation
                  .sourceVillages,

              targetRange:
                relation
                  .targetRange

            })

          );

    },


    /* ========================================================
       📁 GET CASES FOR TARGET → SOURCE

       Same relationship, opposite navigation direction.

    ======================================================== */

    getCasesForTargetSource:
      function (
        rangeName,
        canonicalVillageId
      ) {

        return this
          .getCasesForSourceTarget(

            canonicalVillageId,

            rangeName

          );

    },


    /* ========================================================
       ❌ GET UNRESOLVED SOURCES
    ======================================================== */

    getUnresolvedSources:
      function () {

        return Array.from(

          this
            .unresolvedSourceIndex
            .values()

        );

    },


    /* ========================================================
       ❌ GET UNRESOLVED TARGETS
    ======================================================== */

    getUnresolvedTargets:
      function () {

        return Array.from(

          this
            .unresolvedTargetIndex
            .values()

        );

    },


    /* ========================================================
       📊 GET STATS
    ======================================================== */

    getStats:
      function () {

        return {

          version:
            this.VERSION,

          ready:
            this.ready,

          initialized:
            this.initialized,

          totalPor:
            this
              .stats
              .totalPor,

          spatialPor:
            this
              .stats
              .spatialPor,

          sourceResolvedPor:
            this
              .stats
              .sourceResolvedPor,

          targetResolvedPor:
            this
              .stats
              .targetResolvedPor,

          fullyResolvedPor:
            this
              .stats
              .fullyResolvedPor,

          unresolvedSourcePor:
            this
              .stats
              .unresolvedSourcePor,

          unresolvedTargetPor:
            this
              .stats
              .unresolvedTargetPor,

          sourceVillages:
            this
              .stats
              .sourceVillages,

          targetRanges:
            this
              .stats
              .targetRanges,

          sourceTargetLinks:
            this
              .stats
              .sourceTargetLinks,

          villageRecords:
            this
              .stats
              .villageRecords,

          porSpatialIndex:
            this
              .porSpatialIndex
              .size,

          lastBuiltAt:
            this
              .lastBuiltAt,

          lastBuildDuration:
            this
              .lastBuildDuration

        };

    },


    /* ========================================================
       🧪 DEBUG
    ======================================================== */

    debug:
      function () {

        console.group(
          "🚨 OffenceSpatialEngine Debug"
        );


        console.log(
          "Version:",
          this.VERSION
        );


        console.log(
          "Ready:",
          this.ready
        );


        console.log(
          "Stats:",
          this.getStats()
        );


        console.log(
          "Source Villages:",
          this.getSourceVillages()
        );


        console.log(
          "Target Ranges:",
          this.getTargetRanges()
        );


        console.log(
          "Source → Target Index:",
          this
            .sourceToTargetIndex
        );


        console.log(
          "Target → Source Index:",
          this
            .targetToSourceIndex
        );


        console.log(
          "POR Spatial Index:",
          this
            .porSpatialIndex
        );


        console.log(
          "Unresolved Sources:",
          this.getUnresolvedSources()
        );


        console.log(
          "Unresolved Targets:",
          this.getUnresolvedTargets()
        );


        console.groupEnd();


        return this
          .getStats();

    }

  };


  /* ============================================================
     🌐 REGISTER MODULE
  ============================================================ */

  Offence
    .SpatialEngine =
    OffenceSpatialEngine;


  /*
   Optional direct GreenGuardAI alias.

   This keeps the module discoverable in the same pattern
   as your other analytics modules.
  */

  window.GreenGuardAI =
    window.GreenGuardAI ||
    {};


  window
    .GreenGuardAI
    .OffenceSpatialEngine =
    OffenceSpatialEngine;


  /* ============================================================
     🚀 INIT

     IMPORTANT
     ------------------------------------------------------------
     Do NOT automatically build here.

     The village canonical cache and offence Store may load
     asynchronously.

     Build must be triggered only after:

     1. Offence.Store.ready === true
     2. window.__villageBoundaryCache contains canonical villages
     3. GISEntities is available

  ============================================================ */

  OffenceSpatialEngine
    .initialized =
    true;


  console.log(
    "🚨 OffenceSpatialEngine loaded",
    OffenceSpatialEngine.VERSION
  );


  /* ============================================================
     🚀 START STORE-AWARE SPATIAL INITIALIZATION
  ============================================================ */

  OffenceSpatialEngine
    .waitForStoreAndBuild();


})();
