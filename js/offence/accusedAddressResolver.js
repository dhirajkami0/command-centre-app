/* =========================================================
   GreenGuard AI
   AccusedAddressResolver.js

   Purpose:
   Raw accused address
        ↓
   Parse address
        ↓
   Generate village candidates
        ↓
   Score administrative evidence
        ↓
   Score offence forest-range proximity
        ↓
   Resolve Vill_LGD

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

    const GG =
        global.GreenGuardAI =
        global.GreenGuardAI || {};

    const Resolver = {};

    /* =====================================================
       CONFIGURATION
    ===================================================== */

    Resolver.VERSION = "1.0.0";

    Resolver.SCORE = {

        EXACT_NAME: 100,
        ALIAS: 90,
        PREFIX_LOCALITY: 70,

        PIN: 80,
        DISTRICT: 60,
        PS: 55,
        PO: 45,
        BLOCK: 35,

        FOREST_RANGE_METADATA: 35,
        FOREST_BEAT_METADATA: 45,
        FOREST_COMPARTMENT_METADATA: 55,

        SPATIAL_VERY_NEAR: 35,   // <= 5 km
        SPATIAL_NEAR: 25,        // <= 15 km
        SPATIAL_MODERATE: 15,    // <= 30 km
        SPATIAL_FAR: 5,          // <= 60 km

        WRONG_PIN: -120,
        WRONG_DISTRICT: -90,
        WRONG_PS: -40

    };


    /* =====================================================
       NORMALIZATION
    ===================================================== */

    Resolver.normalize = function (value) {

        return String(value || "")
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase()

            .replace(/COOCHBEHER/g, "COOCH BEHAR")
            .replace(/COOCHBIHAR/g, "COOCH BEHAR")
            .replace(/COOCHBEHAR/g, "COOCH BEHAR")

            .replace(/ALIFURDUAR/g, "ALIPURDUAR")

            .replace(/\bT\.?\s*G\.?\b/g, " TEA GARDEN ")
            .replace(/\bF\.?\s*V\.?\b/g, " FOREST VILLAGE ")

            .replace(/[^A-Z0-9]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    };


    Resolver.same = function (a, b) {

        const A = Resolver.normalize(a);
        const B = Resolver.normalize(b);

        return !!A && !!B && A === B;
    };


    /* =====================================================
       ADDRESS PARSER
    ===================================================== */

    Resolver.parseAddress = function (address) {

        const raw =
            String(address || "").trim();

        const result = {

            raw,

            settlement: "",
            locality: "",

            po: "",
            ps: "",
            pin: "",
            district: "",

            normalized:
                Resolver.normalize(raw)

        };

        if (!raw)
            return result;


        /* ---------------- PIN ---------------- */

        const pin =
            raw.match(
                /\b([1-9][0-9]{5})\b/
            );

        if (pin)
            result.pin = pin[1];


        /* ---------------- PO ---------------- */

        const po =
            raw.match(
                /\bP\.?\s*O\.?\s*[-.:+]*\s*([^,;]+)/i
            );

        if (po)
            result.po = po[1].trim();


        /* ---------------- PS ---------------- */

        const ps =
            raw.match(
                /\bP\.?\s*S\.?\s*[-.:+]*\s*([^,;]+)/i
            );

        if (ps)
            result.ps = ps[1].trim();


        /* ---------------- DISTRICT ---------------- */

        const district =
            raw.match(
                /\bDIST(?:RICT)?\.?\s*[-.:+]*\s*([^,;]+)/i
            );

        if (district) {

            result.district =
                district[1].trim();

        }
        else {

            const n =
                Resolver.normalize(raw);

            if (
                n.includes("ALIPURDUAR") ||
                /\bAPD\b/i.test(raw)
            ) {

                result.district =
                    "Alipurduar";

            }
            else if (
                n.includes("COOCH BEHAR")
            ) {

                result.district =
                    "Cooch Behar";

            }
            else if (
                n.includes("JALPAIGURI")
            ) {

                result.district =
                    "Jalpaiguri";
            }
        }


        /* =================================================
           SETTLEMENT PART

           Everything before PO / PS / DIST / PIN
        ================================================= */

        let settlementPart = raw;


        settlementPart =
            settlementPart.replace(
                /^\s*(VILLAGE|VILL|VIL)\s*[\.\-:+]*\s*/i,
                ""
            );


        settlementPart =
            settlementPart.replace(
                /^\s*VILL\s*\+\s*PO\s*[\.\-:+]*\s*/i,
                ""
            );


        const stopPatterns = [

            /\bP\.?\s*O\.?\b/i,
            /\bP\.?\s*S\.?\b/i,
            /\bPOST\s+OFFICE\b/i,
            /\bPOLICE\s+STATION\b/i,
            /\bDIST(?:RICT)?\b/i,
            /\bPIN(?:CODE)?\b/i,
            /\b[1-9][0-9]{5}\b/

        ];


        let stop =
            settlementPart.length;


        for (const pattern of stopPatterns) {

            const m =
                pattern.exec(
                    settlementPart
                );

            if (
                m &&
                m.index < stop
            ) {

                stop =
                    m.index;
            }
        }


        settlementPart =
            settlementPart
                .slice(0, stop)
                .replace(
                    /[\s,;:+\-]+$/g,
                    ""
                )
                .trim();


        result.settlement =
            settlementPart;


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

        return global.__villageBoundaryGeoJSON ||
            null;
    };


    Resolver.getCases = function () {

        return (
            GG?.Offence?.Store?.data?.cases ||
            []
        );
    };


    Resolver.getAccused = function () {

        return (
            GG?.Offence?.Store?.data?.accused ||
            []
        );
    };


    /* =====================================================
       BUILD INDEXES
    ===================================================== */

    Resolver.buildIndexes = function () {

        const villages =
            Resolver.getVillages();


        const byName =
            new Map();

        const byCode =
            new Map();


        for (const village of villages) {

            const name =
                Resolver.normalize(
                    village.name
                );

            const code =
                String(
                    village.villageCode || ""
                );


            if (code) {

                byCode.set(
                    code,
                    village
                );
            }


            if (name) {

                if (!byName.has(name)) {
                    byName.set(name, []);
                }

                byName
                    .get(name)
                    .push(village);
            }


            /* ---------------- aliases ---------------- */

            let aliases =
                village.aliases || [];


            if (
                typeof aliases === "string"
            ) {

                aliases =
                    aliases
                        .split(/[|;,]/)
                        .map(x => x.trim())
                        .filter(Boolean);
            }


            if (
                Array.isArray(aliases)
            ) {

                for (const alias of aliases) {

                    const key =
                        Resolver.normalize(
                            alias
                        );

                    if (!key)
                        continue;


                    if (!byName.has(key)) {
                        byName.set(key, []);
                    }


                    const arr =
                        byName.get(key);


                    if (
                        !arr.some(
                            x =>
                                String(
                                    x.villageCode
                                ) === code
                        )
                    ) {

                        arr.push(village);
                    }
                }
            }
        }


        Resolver.index = {
            byName,
            byCode
        };


        return Resolver.index;
    };


    /* =====================================================
       VERIFIED RESOLUTION INDEX
    ===================================================== */

    Resolver.buildVerifiedIndex = function () {

        const source =
            global.__resolvedAccusedVillages ||
            [];


        const map =
            new Map();


        for (const row of source) {

            if (
                row.accusedIndex === undefined ||
                row.accusedIndex === null
            ) {
                continue;
            }


            if (
                row.resolution !== "RESOLVED"
            ) {
                continue;
            }


            map.set(
                Number(row.accusedIndex),
                row
            );
        }


        Resolver.verifiedIndex =
            map;


        return map;
    };


    /* =====================================================
       CASE INDEX
    ===================================================== */

    Resolver.buildCaseIndex = function () {

        const cases =
            Resolver.getCases();


        const byCaseId =
            new Map();

        const byPor =
            new Map();


        for (const c of cases) {

            if (c.caseId) {

                byCaseId.set(
                    String(c.caseId),
                    c
                );
            }


            const por =
                Resolver.normalize(
                    c.porNo ||
                    c.refPorNo ||
                    c.porKey
                );


            if (por) {

                byPor.set(
                    por,
                    c
                );
            }
        }


        Resolver.caseIndex = {
            byCaseId,
            byPor
        };


        return Resolver.caseIndex;
    };


    Resolver.getCaseForAccused = function (
        accused
    ) {

        if (!Resolver.caseIndex) {
            Resolver.buildCaseIndex();
        }


        const id =
            accused.caseId ||
            accused.sourceCaseId;


        if (
            id &&
            Resolver.caseIndex
                .byCaseId
                .has(String(id))
        ) {

            return Resolver.caseIndex
                .byCaseId
                .get(String(id));
        }


        const por =
            Resolver.normalize(
                accused.porNo ||
                accused.refPorNo ||
                accused.sourceRefPorNo
            );


        if (
            por &&
            Resolver.caseIndex
                .byPor
                .has(por)
        ) {

            return Resolver.caseIndex
                .byPor
                .get(por);
        }


        return null;
    };


    /* =====================================================
       GENERATE VILLAGE CANDIDATES
    ===================================================== */

    Resolver.generateCandidates = function (
        parsed
    ) {

        if (!Resolver.index) {
            Resolver.buildIndexes();
        }


        const settlement =
            Resolver.normalize(
                parsed.settlement
            );


        if (!settlement)
            return [];


        const candidates =
            new Map();


        function add(
            village,
            method,
            baseScore
        ) {

            const code =
                String(
                    village.villageCode ||
                    ""
                );

            if (!code)
                return;


            const existing =
                candidates.get(code);


            if (
                !existing ||
                baseScore >
                    existing.baseScore
            ) {

                candidates.set(
                    code,
                    {
                        village,
                        method,
                        baseScore
                    }
                );
            }
        }


        /* =================================================
           EXACT / ALIAS INDEX
        ================================================= */

        const exact =
            Resolver.index
                .byName
                .get(settlement) ||
            [];


        for (const village of exact) {

            const exactOfficial =
                Resolver.same(
                    parsed.settlement,
                    village.name
                );


            add(
                village,
                exactOfficial
                    ? "EXACT_NAME"
                    : "ALIAS",
                exactOfficial
                    ? Resolver.SCORE.EXACT_NAME
                    : Resolver.SCORE.ALIAS
            );
        }


        /* =================================================
           LOCALITY PREFIX

           Panbari Lohar Dangi
                  ↓
           Panbari
        ================================================= */

        for (
            const [
                name,
                records
            ]
            of Resolver.index.byName
        ) {

            if (
                settlement.startsWith(
                    name + " "
                )
            ) {

                for (const village of records) {

                    add(
                        village,
                        "PREFIX_LOCALITY",
                        Resolver.SCORE
                            .PREFIX_LOCALITY
                    );
                }
            }
        }


        return [
            ...candidates.values()
        ];
    };


    /* =====================================================
       ADMINISTRATIVE SCORING
    ===================================================== */

    Resolver.scoreAdministrative =
        function (
            candidate,
            parsed
        ) {

        const village =
            candidate.village;

        let score =
            candidate.baseScore;

        const evidence = [];


        evidence.push({
            type:
                candidate.method,
            score:
                candidate.baseScore
        });


        /* ---------------- PIN ---------------- */

        if (
            parsed.pin &&
            village.pinCode
        ) {

            if (
                String(parsed.pin) ===
                String(village.pinCode)
            ) {

                score +=
                    Resolver.SCORE.PIN;

                evidence.push({
                    type: "PIN_MATCH",
                    score:
                        Resolver.SCORE.PIN
                });

            }
            else {

                score +=
                    Resolver.SCORE.WRONG_PIN;

                evidence.push({
                    type: "PIN_CONFLICT",
                    score:
                        Resolver.SCORE.WRONG_PIN
                });
            }
        }


        /* ---------------- DISTRICT ---------------- */

        if (
            parsed.district &&
            village.district
        ) {

            if (
                Resolver.same(
                    parsed.district,
                    village.district
                )
            ) {

                score +=
                    Resolver.SCORE.DISTRICT;

                evidence.push({
                    type:
                        "DISTRICT_MATCH",
                    score:
                        Resolver.SCORE.DISTRICT
                });

            }
            else {

                score +=
                    Resolver.SCORE
                        .WRONG_DISTRICT;

                evidence.push({
                    type:
                        "DISTRICT_CONFLICT",
                    score:
                        Resolver.SCORE
                            .WRONG_DISTRICT
                });
            }
        }


        /* ---------------- PS ---------------- */

        if (
            parsed.ps &&
            village.policeStation
        ) {

            if (
                Resolver.same(
                    parsed.ps,
                    village.policeStation
                )
            ) {

                score +=
                    Resolver.SCORE.PS;

                evidence.push({
                    type: "PS_MATCH",
                    score:
                        Resolver.SCORE.PS
                });

            }
        }


        /* ---------------- PO ---------------- */

        if (
            parsed.po &&
            village.postOffice
        ) {

            if (
                Resolver.same(
                    parsed.po,
                    village.postOffice
                )
            ) {

                score +=
                    Resolver.SCORE.PO;

                evidence.push({
                    type: "PO_MATCH",
                    score:
                        Resolver.SCORE.PO
                });
            }
        }


        return {
            ...candidate,
            score,
            evidence
        };
    };


    /* =====================================================
       TARGET FOREST RANGE FROM CASE
    ===================================================== */

    Resolver.getTargetRange = function (
        caseRecord
    ) {

        if (!caseRecord)
            return null;


        const rangeName =
            caseRecord.rangeGISResolved ||
            caseRecord.rangeCanonical ||
            caseRecord.range ||
            caseRecord.rangeRaw;


        if (!rangeName)
            return null;


        const target =
            Resolver.normalize(
                rangeName
            );


        const features =
            global.allGISFeatures ||
            [];


        const matches =
            features.filter(
                feature =>

                    Resolver.normalize(
                        feature?.properties
                            ?.range
                    ) === target
            );


        if (!matches.length)
            return null;


        /*
         * Multiple beats may belong to same range.
         * Dissolve if Turf supports it.
         */

        try {

            if (
                global.turf &&
                matches.length > 1
            ) {

                let merged =
                    matches[0];


                for (
                    let i = 1;
                    i < matches.length;
                    i++
                ) {

                    try {

                        merged =
                            global.turf.union(
                                merged,
                                matches[i]
                            ) || merged;

                    }
                    catch (_) {}
                }


                return merged;
            }

        }
        catch (_) {}


        return matches[0];
    };


    /* =====================================================
       GET VILLAGE POLYGON BY LGD
    ===================================================== */

    Resolver.getVillageFeature = function (
        villageCode
    ) {

        const fc =
            Resolver.getVillageGeoJSON();


        if (
            !fc ||
            !Array.isArray(fc.features)
        ) {
            return null;
        }


        const code =
            String(villageCode);


        return (
            fc.features.find(
                feature => {

                    const p =
                        feature.properties ||
                        {};

                    return String(
                        p.Vill_LGD ||
                        p.villageCode ||
                        p.VILLAGECODE ||
                        p.vill_lgd ||
                        ""
                    ) === code;

                }
            ) ||
            null
        );
    };


    /* =====================================================
       SPATIAL DISTANCE
    ===================================================== */

    Resolver.distanceToForestRange =
        function (
            villageCode,
            rangeFeature
        ) {

        if (
            !rangeFeature ||
            !global.turf
        ) {
            return null;
        }


        const villageFeature =
            Resolver.getVillageFeature(
                villageCode
            );


        if (!villageFeature)
            return null;


        try {

            /*
             * nearest-point distance from representative
             * point to range polygon.
             *
             * If village intersects range, distance = 0.
             */

            if (
                global.turf.booleanIntersects(
                    villageFeature,
                    rangeFeature
                )
            ) {

                return 0;
            }


            const point =
                global.turf.pointOnFeature(
                    villageFeature
                );


            const boundary =
                global.turf.polygonToLine(
                    rangeFeature
                );


            const nearest =
                global.turf.nearestPointOnLine(
                    boundary,
                    point,
                    {
                        units: "kilometers"
                    }
                );


            return Number(
                nearest.properties?.dist
            );

        }
        catch (_) {

            return null;
        }
    };


    /* =====================================================
       SPATIAL SCORING
    ===================================================== */

    Resolver.scoreSpatial =
        function (
            candidate,
            targetRange
        ) {

        if (!targetRange)
            return candidate;


        const code =
            candidate.village
                .villageCode;


        const distance =
            Resolver.distanceToForestRange(
                code,
                targetRange
            );


        candidate.distanceToTargetKm =
            distance;


        if (
            distance === null ||
            !Number.isFinite(distance)
        ) {

            return candidate;
        }


        let spatialScore = 0;


        if (distance <= 5) {

            spatialScore =
                Resolver.SCORE
                    .SPATIAL_VERY_NEAR;

        }
        else if (distance <= 15) {

            spatialScore =
                Resolver.SCORE
                    .SPATIAL_NEAR;

        }
        else if (distance <= 30) {

            spatialScore =
                Resolver.SCORE
                    .SPATIAL_MODERATE;

        }
        else if (distance <= 60) {

            spatialScore =
                Resolver.SCORE
                    .SPATIAL_FAR;
        }


        candidate.score +=
            spatialScore;


        candidate.evidence.push({

            type:
                "FOREST_RANGE_DISTANCE",

            distanceKm:
                Number(
                    distance.toFixed(2)
                ),

            score:
                spatialScore

        });


        return candidate;
    };


    /* =====================================================
       VERIFIED OVERRIDE
    ===================================================== */

    Resolver.resolveVerified =
        function (
            accusedIndex,
            accused,
            parsed
        ) {

        if (!Resolver.verifiedIndex) {
            Resolver.buildVerifiedIndex();
        }


        const verified =
            Resolver.verifiedIndex.get(
                accusedIndex
            );


        if (!verified)
            return null;


        return {

            accusedIndex,

            accusedId:
                accused.accusedId ||
                accused.id ||
                "",

            accusedName:
                accused.nameOfAccused ||
                accused.name ||
                "",

            porNo:
                accused.porNo ||
                accused.refPorNo ||
                "",

            originalAddress:
                parsed.raw,

            extractedSettlement:
                parsed.settlement,

            canonicalVillage:
                verified.canonicalVillage,

            locality:
                verified.locality || "",

            Vill_LGD:
                verified.resolvedLGD,

            district:
                verified.resolvedDistrict ||
                "",

            block:
                verified.resolvedBlock ||
                "",

            PS:
                verified.resolvedPS ||
                parsed.ps ||
                "",

            PO:
                parsed.po || "",

            PIN:
                parsed.pin || "",

            status:
                verified.alias
                    ? "RESOLVED_ALIAS"
                    : "RESOLVED_VERIFIED",

            confidence:
                "HIGH",

            resolutionMethod:
                "VERIFIED_OVERRIDE",

            evidence: [
                "Previously verified resolution"
            ],

            candidates: []

        };
    };


    /* =====================================================
       RESOLVE ONE ACCUSED
    ===================================================== */

    Resolver.resolveOne = function (
        accused,
        accusedIndex
    ) {

        const address =
            accused.address ||
            accused.addressOfAccused ||
            "";


        const parsed =
            Resolver.parseAddress(
                address
            );


        if (!address) {

            return {

                accusedIndex,

                accusedName:
                    accused.nameOfAccused ||
                    accused.name ||
                    "",

                originalAddress: "",

                extractedSettlement: "",

                canonicalVillage: "",

                Vill_LGD: "",

                status:
                    "NO_ADDRESS",

                confidence:
                    "NONE"

            };
        }


        /* ---------------- verified first ---------------- */

        const verified =
            Resolver.resolveVerified(
                accusedIndex,
                accused,
                parsed
            );


        if (verified)
            return verified;


        /* ---------------- candidates ---------------- */

        let candidates =
            Resolver.generateCandidates(
                parsed
            );


        if (!candidates.length) {

            return {

                accusedIndex,

                accusedId:
                    accused.accusedId ||
                    accused.id ||
                    "",

                accusedName:
                    accused.nameOfAccused ||
                    accused.name ||
                    "",

                porNo:
                    accused.porNo ||
                    accused.refPorNo ||
                    "",

                originalAddress:
                    address,

                extractedSettlement:
                    parsed.settlement,

                canonicalVillage: "",

                Vill_LGD: "",

                PO:
                    parsed.po,

                PS:
                    parsed.ps,

                PIN:
                    parsed.pin,

                district:
                    parsed.district,

                status:
                    "UNRESOLVED",

                confidence:
                    "NONE",

                candidates: []

            };
        }


        /* ---------------- admin scoring ---------------- */

        candidates =
            candidates.map(
                candidate =>
                    Resolver
                        .scoreAdministrative(
                            candidate,
                            parsed
                        )
            );


        /* ---------------- case context ---------------- */

        const caseRecord =
            Resolver.getCaseForAccused(
                accused
            );


        const targetRange =
            Resolver.getTargetRange(
                caseRecord
            );


        /* ---------------- spatial scoring ---------------- */

        if (
            targetRange &&
            candidates.length > 1
        ) {

            candidates =
                candidates.map(
                    candidate =>
                        Resolver.scoreSpatial(
                            candidate,
                            targetRange
                        )
                );
        }


        /* ---------------- sort ---------------- */

        candidates.sort(
            (a, b) =>
                b.score -
                a.score
        );


        const winner =
            candidates[0];


        const runnerUp =
            candidates[1] ||
            null;


        const margin =
            runnerUp
                ? winner.score -
                    runnerUp.score
                : Infinity;


        /* =================================================
           CONFIDENCE

           Unique candidate:
           HIGH if exact.
           MEDIUM if locality/prefix.

           Multiple candidates:
           require meaningful winning margin.
        ================================================= */

        let status;
        let confidence;


        if (
            candidates.length === 1
        ) {

            status =
                winner.method ===
                    "EXACT_NAME"
                    ? "EXACT_LGD"
                    : "RESOLVED_LOCALITY";


            confidence =
                winner.method ===
                    "EXACT_NAME"
                    ? "HIGH"
                    : "MEDIUM";

        }
        else if (
            winner.score >= 130 &&
            margin >= 30
        ) {

            status =
                "RESOLVED_DUPLICATE";

            confidence =
                margin >= 60
                    ? "HIGH"
                    : "MEDIUM";

        }
        else {

            status =
                "AMBIGUOUS";

            confidence =
                "LOW";
        }


        /* ---------------- locality ---------------- */

        let locality = "";


        if (
            winner.method ===
            "PREFIX_LOCALITY"
        ) {

            const canonical =
                String(
                    winner.village.name ||
                    ""
                );


            if (
                parsed.settlement
                    .toUpperCase()
                    .startsWith(
                        canonical.toUpperCase()
                    )
            ) {

                locality =
                    parsed.settlement
                        .slice(
                            canonical.length
                        )
                        .replace(
                            /^[\s,.-]+/,
                            ""
                        )
                        .trim();
            }
        }


        /* =================================================
           IMPORTANT:
           If ambiguous, do NOT expose winner as resolved LGD.
        ================================================= */

        const resolved =
            status !== "AMBIGUOUS";


        return {

            accusedIndex,

            accusedId:
                accused.accusedId ||
                accused.id ||
                "",

            accusedName:
                accused.nameOfAccused ||
                accused.name ||
                "",

            porNo:
                accused.porNo ||
                accused.refPorNo ||
                "",

            originalAddress:
                address,

            extractedSettlement:
                parsed.settlement,

            locality:
                resolved
                    ? locality
                    : "",

            canonicalVillage:
                resolved
                    ? winner.village.name
                    : "",

            Vill_LGD:
                resolved
                    ? String(
                        winner.village
                            .villageCode
                    )
                    : "",

            PO:
                parsed.po,

            PS:
                parsed.ps,

            PIN:
                parsed.pin,

            district:
                parsed.district,

            caseRange:
                caseRecord
                    ?.rangeGISResolved ||
                caseRecord
                    ?.rangeCanonical ||
                caseRecord
                    ?.range ||
                "",

            distanceToTargetKm:
                resolved
                    ? winner
                        .distanceToTargetKm ??
                        null
                    : null,

            status,

            confidence,

            resolutionMethod:
                resolved
                    ? winner.method
                    : "MULTIPLE_CANDIDATES",

            score:
                winner.score,

            winningMargin:
                Number.isFinite(margin)
                    ? margin
                    : null,

            evidence:
                winner.evidence,

            candidates:
                candidates.map(
                    c => ({

                        Vill_LGD:
                            String(
                                c.village
                                    .villageCode
                            ),

                        village:
                            c.village.name,

                        district:
                            c.village.district,

                        block:
                            c.village.block,

                        PS:
                            c.village
                                .policeStation,

                        PO:
                            c.village
                                .postOffice,

                        PIN:
                            c.village.pinCode,

                        distanceKm:
                            c.distanceToTargetKm ??
                            null,

                        score:
                            c.score,

                        evidence:
                            c.evidence

                    })
                )

        };
    };


    /* =====================================================
       RESOLVE ALL ACCUSED
    ===================================================== */

    Resolver.resolveAll = function () {

        Resolver.buildIndexes();
        Resolver.buildCaseIndex();
        Resolver.buildVerifiedIndex();


        const accused =
            Resolver.getAccused();


        const results =
            accused.map(
                (record, index) =>
                    Resolver.resolveOne(
                        record,
                        index
                    )
            );


        Resolver.results =
            results;


        global.__resolvedAccusedAddresses =
            results;


        return results;
    };


    /* =====================================================
       AUDIT
    ===================================================== */

    Resolver.audit = function () {

        const results =
            Resolver.results ||
            Resolver.resolveAll();


        console.log(
            "========================================"
        );

        console.log(
            "🏡 RESOLVED ACCUSED ADDRESS AUDIT"
        );

        console.log(
            "========================================"
        );


        console.table(
            results.map(
                r => ({

                    accused:
                        r.accusedName,

                    originalAddress:
                        r.originalAddress,

                    extracted:
                        r.extractedSettlement,

                    canonicalVillage:
                        r.canonicalVillage,

                    Vill_LGD:
                        r.Vill_LGD,

                    confidence:
                        r.confidence,

                    status:
                        r.status,

                    range:
                        r.caseRange || "",

                    distanceKm:
                        r.distanceToTargetKm ?? ""

                })
            )
        );


        const counts = {};


        for (const r of results) {

            counts[r.status] =
                (counts[r.status] || 0) +
                1;
        }


        console.log(
            "📊 RESOLUTION SUMMARY"
        );


        console.table(
            Object.entries(counts)
                .map(
                    ([status, count]) => ({
                        status,
                        count
                    })
                )
        );


        const problems =
            results.filter(
                r =>
                    r.status ===
                        "UNRESOLVED" ||
                    r.status ===
                        "AMBIGUOUS"
            );


        console.log(
            "⚠️ NEEDS REVIEW:",
            problems.length
        );


        console.table(
            problems.map(
                r => ({

                    accused:
                        r.accusedName,

                    address:
                        r.originalAddress,

                    extracted:
                        r.extractedSettlement,

                    district:
                        r.district,

                    PS:
                        r.PS,

                    PO:
                        r.PO,

                    PIN:
                        r.PIN,

                    range:
                        r.caseRange || "",

                    candidates:
                        r.candidates
                            ?.map(
                                c =>
                                    c.village +
                                    " [" +
                                    c.Vill_LGD +
                                    "] score=" +
                                    c.score
                            )
                            .join(" | ") ||
                        "",

                    status:
                        r.status

                })
            )
        );


        global.__accusedAddressProblems =
            problems;


        return {
            results,
            problems,
            counts
        };
    };


    /* =====================================================
       PUBLIC API
    ===================================================== */

    GG.AccusedAddressResolver =
        Resolver;


    console.log(
        "✅ AccusedAddressResolver loaded",
        Resolver.VERSION
    );

})(window);
