/* =========================================================
   GreenGuard
   Offence Intelligence Module

   File:
   js/offence/offenceNormalizer.js

   Purpose:
   Normalize raw offence datasets into canonical objects.

   Input:
   - Case records
   - Accused / suspect records
   - Seizure records

   Output:
   - Canonical case objects
   - Canonical accused objects
   - Canonical seizure objects

   IMPORTANT:
   - NO Leaflet rendering
   - NO geocoding
   - NO Firestore queries
   - NO heatmap logic
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
       2. DEPENDENCY
       ===================================================== */

    const Constants =
        GG.Offence.Constants;

    if (!Constants) {

        console.error(
            "[OffenceNormalizer] OffenceConstants unavailable."
        );

        return;

    }


    /* =====================================================
       3. NORMALIZER OBJECT
       ===================================================== */

    const OffenceNormalizer = {};


    /* =====================================================
       4. MODULE INFO
       ===================================================== */

    OffenceNormalizer.VERSION =
        "1.0.0";


    /* =====================================================
       5. BASIC VALUE NORMALIZER
       ===================================================== */

    OffenceNormalizer.cleanValue = function (

        value

    ) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }

        if (
            typeof value === "string"
        ) {

            return value
                .replace(/\s+/g, " ")
                .trim();

        }

        return value;

    };


    /* =====================================================
       6. STRING NORMALIZER
       ===================================================== */

    OffenceNormalizer.cleanString = function (

        value

    ) {

        const cleaned =
            OffenceNormalizer.cleanValue(
                value
            );

        if (
            cleaned === ""
        ) {

            return "";

        }

        return String(
            cleaned
        ).trim();

    };


    /* =====================================================
       7. NUMBER NORMALIZER
       ===================================================== */

    OffenceNormalizer.cleanNumber = function (

        value,

        fallback = 0

    ) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return fallback;

        }

        const number =
            Number(
                value
            );

        return Number.isFinite(
            number
        )
            ? number
            : fallback;

    };


    /* =====================================================
       8. GET FIELD

       Supports multiple possible raw column names.

       Example:

       getField(record, [
           "CaseID",
           "Case ID",
           "caseId"
       ])
       ===================================================== */

    OffenceNormalizer.getField = function (

        record,

        aliases = []

    ) {

        if (
            !record ||
            typeof record !== "object"
        ) {

            return "";

        }

        for (
            const key
            of aliases
        ) {

            if (
                Object.prototype
                    .hasOwnProperty
                    .call(
                        record,
                        key
                    )
            ) {

                const value =
                    record[
                        key
                    ];

                if (
                    value !== null &&
                    value !== undefined &&
                    value !== ""
                ) {

                    return value;

                }

            }

        }

        return "";

    };


    /* =====================================================
       9. NORMALIZE DATE

       Preserves original date string.

       We do NOT force JavaScript Date conversion here
       because source data may use DD/MM/YYYY.

       Example:
       21/03/2023
       ===================================================== */

    OffenceNormalizer.normalizeDate = function (

        value

    ) {

        return OffenceNormalizer.cleanString(
            value
        );

    };


    /* =====================================================
       10. NORMALIZE ADDRESS
       ===================================================== */

    OffenceNormalizer.normalizeAddress = function (

        value

    ) {

        let address =
            OffenceNormalizer.cleanString(
                value
            );

        if (!address) {

            return "";

        }

        address =
            address
                .replace(/\s*,\s*/g, ", ")
                .replace(/,+/g, ",")
                .replace(/\s+/g, " ")
                .trim();

        return address;

    };


    /* =====================================================
       11. NORMALIZE CASE ID
       ===================================================== */

    OffenceNormalizer.normalizeCaseId = function (

        value

    ) {

        return OffenceNormalizer.cleanString(
            value
        );

    };


    /* =====================================================
       12. NORMALIZE POR NUMBER
       ===================================================== */

    OffenceNormalizer.normalizePorNo = function (

        value

    ) {

        return OffenceNormalizer.cleanString(
            value
        );

    };


    /* =====================================================
       13. NORMALIZE CASE RECORD
       ===================================================== */

    OffenceNormalizer.normalizeCase = function (

        raw = {}

    ) {

        const caseId =

            OffenceNormalizer.normalizeCaseId(

                OffenceNormalizer.getField(

                    raw,

                    [
                        "CaseID",
                        "Case ID",
                        "caseId",
                        "case_id"
                    ]

                )

            );


        const porNo =

            OffenceNormalizer.normalizePorNo(

                OffenceNormalizer.getField(

                    raw,

                    [
                        "POR No",
                        "POR NO",
                        "POR Number",
                        "porNo",
                        "por_no"
                    ]

                )

            );


        return {

            caseId:

                caseId,

            porNo:

                porNo,

            crNo:

                OffenceNormalizer.cleanString(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "CR No",
                            "CR NO",
                            "CR Number",
                            "crNo"
                        ]

                    )

                ),

            range:

                OffenceNormalizer.cleanString(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "Range",
                            "range"
                        ]

                    )

                ),

            offenceDate:

                OffenceNormalizer.normalizeDate(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "Offence Date",
                            "Offense Date",
                            "offenceDate",
                            "offenseDate"
                        ]

                    )

                ),

            natureOfOffence:

                OffenceNormalizer.cleanString(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "Nature of Offence",
                            "Nature Of Offence",
                            "Nature of Offense",
                            "natureOfOffence",
                            "offenceType"
                        ]

                    )

                ),

            act:

                OffenceNormalizer.cleanString(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "Act",
                            "ACT",
                            "act"
                        ]

                    )

                ),

            section:

                OffenceNormalizer.cleanString(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "Section",
                            "SECTION",
                            "section"
                        ]

                    )

                ),

            articlesSeized:

                OffenceNormalizer.cleanString(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "Articles Seized",
                            "Article Seized",
                            "articlesSeized"
                        ]

                    )

                ),

            caseStatus:

                OffenceNormalizer.cleanString(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "Case Status",
                            "Status",
                            "caseStatus"
                        ]

                    )

                ),

            verdict:

                OffenceNormalizer.cleanString(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "Verdict of the Case",
                            "Verdict",
                            "verdict"
                        ]

                    )

                ),

            sentence:

                OffenceNormalizer.cleanString(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "Sentence",
                            "sentence"
                        ]

                    )

                ),

            raw:

                raw

        };

    };


    /* =====================================================
       14. NORMALIZE ACCUSED RECORD
       ===================================================== */

    OffenceNormalizer.normalizeAccused = function (

        raw = {}

    ) {

        return {

            suspectId:

                OffenceNormalizer.cleanString(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "Suspect ID",
                            "SuspectID",
                            "suspectId",
                            "suspect_id"
                        ]

                    )

                ),

            name:

                OffenceNormalizer.cleanString(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "Name of Accused",
                            "Accused Name",
                            "Name",
                            "name"
                        ]

                    )

                ),

            alias:

                OffenceNormalizer.cleanString(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "Alias",
                            "alias"
                        ]

                    )

                ),

            fatherName:

                OffenceNormalizer.cleanString(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "Father's Name",
                            "Father Name",
                            "Fathers Name",
                            "fatherName"
                        ]

                    )

                ),

            permanentAddress:

                OffenceNormalizer.normalizeAddress(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "Permanent Address",
                            "PermanentAddress",
                            "permanentAddress"
                        ]

                    )

                ),

            presentAddress:

                OffenceNormalizer.normalizeAddress(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "Present Address",
                            "PresentAddress",
                            "presentAddress"
                        ]

                    )

                ),

            primaryOccupation:

                OffenceNormalizer.cleanString(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "Primary Occupation",
                            "Occupation",
                            "primaryOccupation"
                        ]

                    )

                ),

            totalCases:

                OffenceNormalizer.cleanNumber(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "Total WDPO Cases",
                            "Total Cases",
                            "totalCases"
                        ]

                    ),

                    0

                ),

            offenceRecord:

                OffenceNormalizer.cleanString(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "Offence Record",
                            "Offense Record",
                            "offenceRecord"
                        ]

                    )

                ),

            pastOffenceHistory:

                OffenceNormalizer.cleanString(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "Past Offence History",
                            "Past Offense History",
                            "pastOffenceHistory"
                        ]

                    )

                ),

            photo:

                OffenceNormalizer.cleanString(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "Photo Link",
                            "Photo",
                            "photo"
                        ]

                    )

                ),

            raw:

                raw

        };

    };


    /* =====================================================
       15. NORMALIZE SEIZURE RECORD
       ===================================================== */

    OffenceNormalizer.normalizeSeizure = function (

        raw = {}

    ) {

        return {

            seizureId:

                OffenceNormalizer.cleanString(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "SeizureID",
                            "Seizure ID",
                            "seizureId",
                            "seizure_id"
                        ]

                    )

                ),

            caseId:

                OffenceNormalizer.normalizeCaseId(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "CaseID",
                            "Case ID",
                            "caseId",
                            "case_id"
                        ]

                    )

                ),

            porNo:

                OffenceNormalizer.normalizePorNo(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "Ref POR No",
                            "POR No",
                            "POR Number",
                            "porNo"
                        ]

                    )

                ),

            seizureDate:

                OffenceNormalizer.normalizeDate(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "Seizure Date",
                            "Date of Seizure",
                            "seizureDate"
                        ]

                    )

                ),

            seizureTime:

                OffenceNormalizer.cleanString(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "Seizure Time",
                            "Time of Seizure",
                            "seizureTime"
                        ]

                    )

                ),

            placeOfSeizure:

                OffenceNormalizer.normalizeAddress(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "Place of Seizure",
                            "Seizure Place",
                            "Place",
                            "placeOfSeizure"
                        ]

                    )

                ),

            remarks:

                OffenceNormalizer.cleanString(

                    OffenceNormalizer.getField(

                        raw,

                        [
                            "Remarks",
                            "Remark",
                            "remarks"
                        ]

                    )

                ),

            raw:

                raw

        };

    };


    /* =====================================================
       16. NORMALIZE CASE COLLECTION
       ===================================================== */

    OffenceNormalizer.normalizeCases = function (

        records = []

    ) {

        if (
            !Array.isArray(
                records
            )
        ) {

            return [];

        }

        const result = [];

        const seen =
            new Set();


        for (
            const raw
            of records
        ) {

            const item =
                OffenceNormalizer.normalizeCase(
                    raw
                );

            /*
             * Do not discard records merely because
             * CaseID is unavailable.
             */

            const key =

                item.caseId ||

                item.porNo;


            if (
                Constants.UPDATE
                    .CASE_ID_DEDUPLICATION &&
                key
            ) {

                if (
                    seen.has(
                        key
                    )
                ) {

                    continue;

                }

                seen.add(
                    key
                );

            }


            result.push(
                item
            );

        }


        return result;

    };


    /* =====================================================
       17. NORMALIZE ACCUSED COLLECTION
       ===================================================== */

    OffenceNormalizer.normalizeAccusedCollection =
        function (

            records = []

        ) {

            if (
                !Array.isArray(
                    records
                )
            ) {

                return [];

            }


            return records.map(

                function (
                    raw
                ) {

                    return OffenceNormalizer
                        .normalizeAccused(
                            raw
                        );

                }

            );

        };


    /* =====================================================
       18. NORMALIZE SEIZURE COLLECTION
       ===================================================== */

    OffenceNormalizer.normalizeSeizures = function (

        records = []

    ) {

        if (
            !Array.isArray(
                records
            )
        ) {

            return [];

        }


        const result = [];

        const seen =
            new Set();


        for (
            const raw
            of records
        ) {

            const item =
                OffenceNormalizer
                    .normalizeSeizure(
                        raw
                    );


            const key =

                item.seizureId ||

                [
                    item.caseId,
                    item.seizureDate,
                    item.placeOfSeizure
                ].join(
                    "|"
                );


            if (
                key &&
                seen.has(
                    key
                )
            ) {

                continue;

            }


            if (
                key
            ) {

                seen.add(
                    key
                );

            }


            result.push(
                item
            );

        }


        return result;

    };


    /* =====================================================
       19. NORMALIZE ALL DATASETS
       ===================================================== */

    OffenceNormalizer.normalizeAll = function (

        data = {}

    ) {

        const cases =

            OffenceNormalizer
                .normalizeCases(

                    data.cases ||

                    []

                );


        const accused =

            OffenceNormalizer
                .normalizeAccusedCollection(

                    data.accused ||

                    []

                );


        const seizures =

            OffenceNormalizer
                .normalizeSeizures(

                    data.seizures ||

                    []

                );


        const result = {

            cases:

                cases,

            accused:

                accused,

            seizures:

                seizures,

            stats: {

                cases:

                    cases.length,

                accused:

                    accused.length,

                seizures:

                    seizures.length

            }

        };


        if (
            Constants.DEBUG
                ?.LOG_DATA
        ) {

            console.log(

                "🔥 OffenceNormalizer.normalizeAll",

                result.stats

            );

        }


        return result;

    };


    /* =====================================================
       20. VALIDATE CANONICAL DATA
       ===================================================== */

    OffenceNormalizer.validate = function (

        data = {}

    ) {

        const errors = [];


        if (
            !Array.isArray(
                data.cases
            )
        ) {

            errors.push(
                "cases must be an array"
            );

        }


        if (
            !Array.isArray(
                data.accused
            )
        ) {

            errors.push(
                "accused must be an array"
            );

        }


        if (
            !Array.isArray(
                data.seizures
            )
        ) {

            errors.push(
                "seizures must be an array"
            );

        }


        return {

            valid:

                errors.length === 0,

            errors:

                errors

        };

    };


    /* =====================================================
       21. EXPORT
       ===================================================== */

    GG.Offence.Normalizer =
        OffenceNormalizer;


    /* =====================================================
       22. READY LOG
       ===================================================== */

    if (
        Constants.DEBUG
            ?.ENABLED
    ) {

        console.log(
            "🔥 OffenceNormalizer Loaded",
            OffenceNormalizer
        );

    }


})();
