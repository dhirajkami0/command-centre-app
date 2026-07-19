(function (window) {

    "use strict";


    /*=========================================================
      NAMESPACE
    =========================================================*/

    const GG =

        window.GreenGuardAI =

        window.GreenGuardAI || {};


    GG.Offence =

        GG.Offence || {};


    /*=========================================================
      PREVENT DOUBLE LOADING
    =========================================================*/

    if (

        GG.Offence.Normalizer

    ) {

        console.warn(

            "[GreenGuardAI] Offence Normalizer already loaded."

        );

        return;

    }


    /*=========================================================
      MODULE
    =========================================================*/

    const Normalizer = {};


    /*=========================================================
      VERSION
    =========================================================*/

    Normalizer.VERSION =

        "2.0.0";


    /*=========================================================
      ENTITY TYPES
    =========================================================*/

    Normalizer.TYPES = {

        CASE:

            "case",

        ACCUSED:

            "accused",

        WITNESS:

            "witness",

        SEIZURE:

            "seizure",

        SEIZED_ARTICLE:

            "seized_article"

    };


    /*=========================================================
      BASIC STRING NORMALIZER

      Does NOT destroy original field values.

      Used only for canonical/index fields.
    =========================================================*/

    Normalizer.string = function (

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

            .replace(

                /\r?\n/g,

                " "

            )

            .replace(

                /\s+/g,

                " "

            )

            .trim();

    };


    /*=========================================================
      FIRST NON-EMPTY VALUE

      Allows compatibility with different historical field names.
    =========================================================*/

    Normalizer.firstValue = function (

        record,

        fields

    ) {

        if (

            !record ||

            typeof record !==

            "object"

        ) {

            return "";

        }


        for (

            let i = 0;

            i < fields.length;

            i++

        ) {

            const field =

                fields[i];


            if (

                record[field] !==

                    undefined &&

                record[field] !==

                    null

            ) {

                const value =

                    Normalizer

                        .string(

                            record[field]

                        );


                if (

                    value

                ) {

                    return value;

                }

            }

        }


        return "";

    };


    /*=========================================================
      NORMALIZE ID
    =========================================================*/

    Normalizer.normalizeId = function (

        value

    ) {

        return Normalizer

            .string(

                value

            );

    };


    /*=========================================================
      NORMALIZE POR NUMBER

      THIS IS THE MOST IMPORTANT FUNCTION IN THIS MODULE.

      POR No. is the authoritative business connector.

      Examples:

      "53/HTG of 2025-26"
              ↓
      "53/HTG OF 2025-26"

      " 53 / HTG   of 2025-26 "
              ↓
      "53/HTG OF 2025-26"

      Important:

      This normalization is intentionally conservative.

      It DOES NOT try to guess that:

      "10/P-15 of 2023-24"

      and

      "10/PANA of 2023-24"

      are the same POR.

      Such alias/mapping logic must be explicit, not guessed.
    =========================================================*/

    Normalizer.normalizePor = function (

        value

    ) {

        let por =

            Normalizer

                .string(

                    value

                );


        if (

            !por

        ) {

            return "";

        }


        por =

            por

                .toUpperCase()

                /*----------------------------------
                  Normalize Unicode dashes
                ----------------------------------*/

                .replace(

                    /[–—−]/g,

                    "-"

                )

                /*----------------------------------
                  Normalize slash spacing
                ----------------------------------*/

                .replace(

                    /\s*\/\s*/g,

                    "/"

                )

                /*----------------------------------
                  Normalize hyphen spacing
                ----------------------------------*/

                .replace(

                    /\s*-\s*/g,

                    "-"

                )

                /*----------------------------------
                  Normalize spaces
                ----------------------------------*/

                .replace(

                    /\s+/g,

                    " "

                )

                .trim();


        return por;

    };


    /*=========================================================
      NORMALIZE POR ALIAS

      Public alias.

      Other modules can use:

      GG.Offence.Normalizer.normalizePorNo(...)
    =========================================================*/

    Normalizer.normalizePorNo =

        Normalizer.normalizePor;


    /*=========================================================
      GET POR NUMBER FROM ANY ENTITY

      Cases normally:
          porNo

      Child collections normally:
          refPorNo

      Compatibility fallbacks included.
    =========================================================*/

    Normalizer.getPorNo = function (

        record

    ) {

        return Normalizer

            .firstValue(

                record,

                [

                    "refPorNo",

                    "porNo",

                    "por",

                    "PORNo",

                    "POR",

                    "refPORNo",

                    "refPor",

                    "referencePorNo"

                ]

            );

    };


    /*=========================================================
      GET POR KEY
    =========================================================*/

    Normalizer.getPorKey = function (

        record

    ) {

        return Normalizer

            .normalizePor(

                Normalizer

                    .getPorNo(

                        record

                    )

            );

    };


    /*=========================================================
      NORMALIZE BOOLEAN

      Preserves null when unknown.
    =========================================================*/

    Normalizer.boolean = function (

        value

    ) {

        if (

            value === true ||

            value === false

        ) {

            return value;

        }


        const normalized =

            Normalizer

                .string(

                    value

                )

                .toLowerCase();


        if (

            [

                "true",

                "yes",

                "y",

                "1"

            ].includes(

                normalized

            )

        ) {

            return true;

        }


        if (

            [

                "false",

                "no",

                "n",

                "0"

            ].includes(

                normalized

            )

        ) {

            return false;

        }


        return null;

    };


    /*=========================================================
      NORMALIZE NUMBER

      Returns null if unavailable.
    =========================================================*/

    Normalizer.number = function (

        value

    ) {

        if (

            value === null ||

            value === undefined ||

            value === ""

        ) {

            return null;

        }


        const number =

            Number(

                value

            );


        if (

            !Number.isFinite(

                number

            )

        ) {

            return null;

        }


        return number;

    };


    /*=========================================================
      NORMALIZE DATE

      IMPORTANT:

      Firestore Timestamp is preserved.

      String dates are kept as strings.

      We do not guess DD/MM/YYYY versus MM/DD/YYYY.
    =========================================================*/

    Normalizer.date = function (

        value

    ) {

        if (

            !value

        ) {

            return null;

        }


        /*----------------------------------
          Firestore Timestamp
        ----------------------------------*/

        if (

            typeof value.toDate ===

            "function"

        ) {

            try {

                return value

                    .toDate();

            }

            catch (

                error

            ) {

                return value;

            }

        }


        /*----------------------------------
          JavaScript Date
        ----------------------------------*/

        if (

            value instanceof Date

        ) {

            return value;

        }


        /*----------------------------------
          Preserve date string
        ----------------------------------*/

        return Normalizer

            .string(

                value

            );

    };


    /*=========================================================
      NORMALIZE ARRAY

      Useful if any imported field is already an array.
    =========================================================*/

    Normalizer.array = function (

        value

    ) {

        if (

            Array.isArray(

                value

            )

        ) {

            return value;

        }


        if (

            value === null ||

            value === undefined ||

            value === ""

        ) {

            return [];

        }


        return [

            value

        ];

    };


    /*=========================================================
      COPY RAW RECORD

      We preserve original Firestore fields.

      The normalized entity extends the original object.
    =========================================================*/

    Normalizer.copyRaw = function (

        record

    ) {

        if (

            !record ||

            typeof record !==

            "object"

        ) {

            return {};

        }


        return {

            ...record

        };

    };


    /*=========================================================
      GET DOCUMENT ID

      DataLoader adds Firestore document ID as:

          id
    =========================================================*/

    Normalizer.getDocumentId = function (

        record

    ) {

        return Normalizer

            .firstValue(

                record,

                [

                    "id",

                    "documentId",

                    "docId"

                ]

            );

    };


    /*=========================================================
      NORMALIZE CASE

      Firestore:
          offence_cases

      Important fields include:

          caseId
          porNo
          crNo
          fillingNumber
          range
          court
          offenceDate
          natureOfOffence
          act
          section
          articlesSeized
          nameAndDesignationOfEO
          porStatus
          porSubmissionDate
          caseStatus
          nextHearingDate
          purposeOfHearing
          witnessesForEvidenceInNextHearingDate
          verdictOfTheCase
          sentence
          judgmentPdf
          verificationStatus
          mismatches
          caseDocumentsPdf
          alternateCrNo
          emailStatus
    =========================================================*/

    Normalizer.normalizeCase = function (

        record

    ) {

        const raw =

            Normalizer

                .copyRaw(

                    record

                );


        const documentId =

            Normalizer

                .getDocumentId(

                    record

                );


        const caseId =

            Normalizer

                .firstValue(

                    record,

                    [

                        "caseId",

                        "CaseID",

                        "caseID",

                        "id"

                    ]

                );


        const porNo =

            Normalizer

                .firstValue(

                    record,

                    [

                        "porNo",

                        "refPorNo",

                        "PORNo",

                        "por"

                    ]

                );


        const porKey =

            Normalizer

                .normalizePor(

                    porNo

                );


        return {

            ...raw,


            /*----------------------------------
              Runtime Metadata
            ----------------------------------*/

            entityType:

                Normalizer.TYPES.CASE,

            documentId:

                documentId,

            id:

                documentId ||

                caseId,


            /*----------------------------------
              Identity
            ----------------------------------*/

            caseId:

                caseId,

            porNo:

                porNo,

            refPorNo:

                porNo,

            porKey:

                porKey,


            /*----------------------------------
              Case References
            ----------------------------------*/

            crNo:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "crNo",

                            "CRNo"

                        ]

                    ),

            alternateCrNo:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "alternateCrNo"

                        ]

                    ),

            fillingNumber:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "fillingNumber",

                            "filingNumber"

                        ]

                    ),


            /*----------------------------------
              Jurisdiction
            ----------------------------------*/

            range:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "range"

                        ]

                    ),

            court:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "court"

                        ]

                    ),


            /*----------------------------------
              Offence
            ----------------------------------*/

            offenceDate:

                Normalizer

                    .date(

                        record.offenceDate

                    ),

            natureOfOffence:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "natureOfOffence"

                        ]

                    ),

            act:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "act"

                        ]

                    ),

            section:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "section"

                        ]

                    ),

            articlesSeized:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "articlesSeized"

                        ]

                    ),


            /*----------------------------------
              Enquiry / POR
            ----------------------------------*/

            nameAndDesignationOfEO:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "nameAndDesignationOfEO",

                            "nameAndDesignationOfEo"

                        ]

                    ),

            porStatus:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "porStatus"

                        ]

                    ),

            porSubmissionDate:

                Normalizer

                    .date(

                        record.porSubmissionDate

                    ),


            /*----------------------------------
              Court Case
            ----------------------------------*/

            caseStatus:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "caseStatus"

                        ]

                    ),

            nextHearingDate:

                Normalizer

                    .date(

                        record.nextHearingDate

                    ),

            purposeOfHearing:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "purposeOfHearing"

                        ]

                    ),

            witnessesForEvidenceInNextHearingDate:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "witnessesForEvidenceInNextHearingDate"

                        ]

                    ),

            verdictOfTheCase:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "verdictOfTheCase",

                            "verdict"

                        ]

                    ),

            sentence:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "sentence"

                        ]

                    ),


            /*----------------------------------
              Documents / Verification
            ----------------------------------*/

            judgmentPdf:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "judgmentPdf",

                            "judgmentPDF"

                        ]

                    ),

            verificationStatus:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "verificationStatus"

                        ]

                    ),

            mismatches:

                record.mismatches ||

                "",

            caseDocumentsPdf:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "caseDocumentsPdf",

                            "caseDocumentsPDF"

                        ]

                    ),

            emailStatus:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "emailStatus"

                        ]

                    )

        };

    };


    /*=========================================================
      NORMALIZE ACCUSED

      Firestore:
          offence_accused

      Current structure:

          accusedId
          caseId
          refPorNo
          slNo
          name
          age
          fatherName
          address
          contactNo
          alternateContactNo
          pastOffenceHistory
          accusedPhoto
          aadhaarCard
          voterCard
          drivingLicence
          panCard
          otherId
          arrestStatus

      Address remains exactly one free-text field.
    =========================================================*/

    Normalizer.normalizeAccused = function (

        record

    ) {

        const raw =

            Normalizer

                .copyRaw(

                    record

                );


        const documentId =

            Normalizer

                .getDocumentId(

                    record

                );


        const accusedId =

            Normalizer

                .firstValue(

                    record,

                    [

                        "accusedId",

                        "AccusedID",

                        "id"

                    ]

                );


        const caseId =

            Normalizer

                .firstValue(

                    record,

                    [

                        "caseId",

                        "CaseID"

                    ]

                );


        const refPorNo =

            Normalizer

                .getPorNo(

                    record

                );


        return {

            ...raw,


            entityType:

                Normalizer.TYPES.ACCUSED,

            documentId:

                documentId,

            id:

                documentId ||

                accusedId,


            /*----------------------------------
              Identity
            ----------------------------------*/

            accusedId:

                accusedId,


            /*----------------------------------
              Relationship

              POR KEY IS AUTHORITATIVE
              caseId is retained as secondary reference
            ----------------------------------*/

            caseId:

                caseId,

            refPorNo:

                refPorNo,

            porNo:

                refPorNo,

            porKey:

                Normalizer

                    .normalizePor(

                        refPorNo

                    ),


            /*----------------------------------
              Accused Details
            ----------------------------------*/

            slNo:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "slNo"

                        ]

                    ),

            name:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "name",

                            "nameOfAccused"

                        ]

                    ),

            age:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "age"

                        ]

                    ),

            fatherName:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "fatherName",

                            "fathersName"

                        ]

                    ),

            address:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "address",

                            "addressOfAccused"

                        ]

                    ),

            contactNo:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "contactNo"

                        ]

                    ),

            alternateContactNo:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "alternateContactNo"

                        ]

                    ),

            pastOffenceHistory:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "pastOffenceHistory"

                        ]

                    ),


            /*----------------------------------
              Documents
            ----------------------------------*/

            accusedPhoto:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "accusedPhoto"

                        ]

                    ),

            aadhaarCard:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "aadhaarCard"

                        ]

                    ),

            voterCard:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "voterCard"

                        ]

                    ),

            drivingLicence:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "drivingLicence",

                            "drvingLicence"

                        ]

                    ),

            panCard:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "panCard"

                        ]

                    ),

            otherId:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "otherId"

                        ]

                    ),

            arrestStatus:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "arrestStatus"

                        ]

                    ),


            /*----------------------------------
              Existing / Future Location Object

              Do not geocode here.
            ----------------------------------*/

            location:

                record.location ||

                null

        };

    };


    /*=========================================================
      NORMALIZE WITNESS

      Firestore:
          offence_witnesses

      Current source fields:

          witnessId
          refPorNo
          caseId
          slNo
          name
          fullAddress
          presentPlaceOfPosting
          contactNo
          witnessWithPendingEvidenceBeforeChargeChief
          witnessWithPendingEvidenceAfterChargeChief
          witnessWithEvidenceCompleted
          email
          village
          streetLane
          postOffice
          district
          pinCode
    =========================================================*/

    Normalizer.normalizeWitness = function (

        record

    ) {

        const raw =

            Normalizer

                .copyRaw(

                    record

                );


        const documentId =

            Normalizer

                .getDocumentId(

                    record

                );


        const witnessId =

            Normalizer

                .firstValue(

                    record,

                    [

                        "witnessId",

                        "WitnessID",

                        "id"

                    ]

                );


        const refPorNo =

            Normalizer

                .getPorNo(

                    record

                );


        return {

            ...raw,


            entityType:

                Normalizer.TYPES.WITNESS,

            documentId:

                documentId,

            id:

                documentId ||

                witnessId,


            /*----------------------------------
              Identity
            ----------------------------------*/

            witnessId:

                witnessId,


            /*----------------------------------
              Relationship
            ----------------------------------*/

            caseId:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "caseId",

                            "CaseID"

                        ]

                    ),

            refPorNo:

                refPorNo,

            porNo:

                refPorNo,

            porKey:

                Normalizer

                    .normalizePor(

                        refPorNo

                    ),


            /*----------------------------------
              Witness Details
            ----------------------------------*/

            slNo:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "slNo"

                        ]

                    ),

            name:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "name",

                            "nameOfWitness"

                        ]

                    ),

            fullAddress:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "fullAddress",

                            "address"

                        ]

                    ),

            presentPlaceOfPosting:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "presentPlaceOfPosting"

                        ]

                    ),

            contactNo:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "contactNo"

                        ]

                    ),


            /*----------------------------------
              Evidence Status
            ----------------------------------*/

            witnessWithPendingEvidenceBeforeChargeChief:

                Normalizer

                    .boolean(

                        record

                            .witnessWithPendingEvidenceBeforeChargeChief

                    ),

            witnessWithPendingEvidenceAfterChargeChief:

                Normalizer

                    .boolean(

                        record

                            .witnessWithPendingEvidenceAfterChargeChief

                    ),

            witnessWithEvidenceCompleted:

                Normalizer

                    .boolean(

                        record

                            .witnessWithEvidenceCompleted

                    ),


            /*----------------------------------
              Contact / Address Components
            ----------------------------------*/

            email:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "email"

                        ]

                    ),

            village:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "village"

                        ]

                    ),

            streetLane:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "streetLane"

                        ]

                    ),

            postOffice:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "postOffice"

                        ]

                    ),

            district:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "district"

                        ]

                    ),

            pinCode:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "pinCode"

                        ]

                    )

        };

    };


    /*=========================================================
      NORMALIZE SEIZURE

      Firestore:
          offence_seizures

      Current structure:

          seizureId
          caseId
          refPorNo
          seizureDate
          seizureTime
          placeOfSeizure
          remarks
    =========================================================*/

    Normalizer.normalizeSeizure = function (

        record

    ) {

        const raw =

            Normalizer

                .copyRaw(

                    record

                );


        const documentId =

            Normalizer

                .getDocumentId(

                    record

                );


        const seizureId =

            Normalizer

                .firstValue(

                    record,

                    [

                        "seizureId",

                        "SeizureID",

                        "id"

                    ]

                );


        const refPorNo =

            Normalizer

                .getPorNo(

                    record

                );


        return {

            ...raw,


            entityType:

                Normalizer.TYPES.SEIZURE,

            documentId:

                documentId,

            id:

                documentId ||

                seizureId,


            /*----------------------------------
              Identity
            ----------------------------------*/

            seizureId:

                seizureId,


            /*----------------------------------
              Relationship
            ----------------------------------*/

            caseId:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "caseId",

                            "CaseID"

                        ]

                    ),

            refPorNo:

                refPorNo,

            porNo:

                refPorNo,

            porKey:

                Normalizer

                    .normalizePor(

                        refPorNo

                    ),


            /*----------------------------------
              Seizure Details
            ----------------------------------*/

            seizureDate:

                Normalizer

                    .date(

                        record.seizureDate

                    ),

            seizureTime:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "seizureTime"

                        ]

                    ),

            placeOfSeizure:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "placeOfSeizure"

                        ]

                    ),

            remarks:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "remarks"

                        ]

                    ),


            /*----------------------------------
              Existing / Future Geocoding

              Preserve if importer or resolver adds it.
            ----------------------------------*/

            location:

                record.location ||

                null

        };

    };


    /*=========================================================
      NORMALIZE SEIZED ARTICLE

      Firestore:
          offence_seized_articles

      Current source structure:

          articleId
          seizureId
          refPorNo
          slNo
          articleDescription
          quantity
          measurement
          volume
          source

      POR is authoritative for cross-collection cascade.

      seizureId remains available for direct
      seizure -> article relationship.
    =========================================================*/

    Normalizer.normalizeSeizedArticle = function (

        record

    ) {

        const raw =

            Normalizer

                .copyRaw(

                    record

                );


        const documentId =

            Normalizer

                .getDocumentId(

                    record

                );


        const articleId =

            Normalizer

                .firstValue(

                    record,

                    [

                        "articleId",

                        "ArticleID",

                        "id"

                    ]

                );


        const refPorNo =

            Normalizer

                .getPorNo(

                    record

                );


        return {

            ...raw,


            entityType:

                Normalizer.TYPES.SEIZED_ARTICLE,

            documentId:

                documentId,

            id:

                documentId ||

                articleId,


            /*----------------------------------
              Identity
            ----------------------------------*/

            articleId:

                articleId,


            /*----------------------------------
              Relationships
            ----------------------------------*/

            caseId:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "caseId",

                            "CaseID"

                        ]

                    ),

            seizureId:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "seizureId",

                            "SeizureID"

                        ]

                    ),

            refPorNo:

                refPorNo,

            porNo:

                refPorNo,

            porKey:

                Normalizer

                    .normalizePor(

                        refPorNo

                    ),


            /*----------------------------------
              Article Details
            ----------------------------------*/

            slNo:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "slNo"

                        ]

                    ),

            articleDescription:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "articleDescription",

                            "description"

                        ]

                    ),

            quantity:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "quantity"

                        ]

                    ),

            measurement:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "measurement"

                        ]

                    ),

            volume:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "volume"

                        ]

                    ),

            source:

                Normalizer

                    .firstValue(

                        record,

                        [

                            "source"

                        ]

                    )

        };

    };


    /*=========================================================
      NORMALIZE GENERIC ENTITY BY TYPE
    =========================================================*/

    Normalizer.normalize = function (

        type,

        record

    ) {

        switch (

            type

        ) {

            case Normalizer.TYPES.CASE:

                return Normalizer

                    .normalizeCase(

                        record

                    );


            case Normalizer.TYPES.ACCUSED:

                return Normalizer

                    .normalizeAccused(

                        record

                    );


            case Normalizer.TYPES.WITNESS:

                return Normalizer

                    .normalizeWitness(

                        record

                    );


            case Normalizer.TYPES.SEIZURE:

                return Normalizer

                    .normalizeSeizure(

                        record

                    );


            case Normalizer.TYPES.SEIZED_ARTICLE:

                return Normalizer

                    .normalizeSeizedArticle(

                        record

                    );


            default:

                console.warn(

                    "[OffenceNormalizer] Unknown entity type:",

                    type

                );


                return Normalizer

                    .copyRaw(

                        record

                    );

        }

    };


    /*=========================================================
      NORMALIZE COLLECTION

      Invalid values are skipped safely.
    =========================================================*/

    Normalizer.normalizeCollection = function (

        records,

        normalizerFunction

    ) {

        if (

            !Array.isArray(

                records

            )

        ) {

            return [];

        }


        if (

            typeof normalizerFunction !==

            "function"

        ) {

            return [];

        }


        const normalized = [];


        records.forEach(

            function (

                record

            ) {

                if (

                    !record ||

                    typeof record !==

                    "object"

                ) {

                    return;

                }


                try {

                    normalized.push(

                        normalizerFunction(

                            record

                        )

                    );

                }

                catch (

                    error

                ) {

                    console.error(

                        "[OffenceNormalizer] Record normalization failed:",

                        record,

                        error

                    );

                }

            }

        );


        return normalized;

    };


    /*=========================================================
      NORMALIZE ALL DATASETS

      Input from offenceDataLoader.js:

      {
          cases,
          accused,
          witnesses,
          seizures,
          seizedArticles
      }

      Output has exactly the same dataset structure.
    =========================================================*/

    Normalizer.normalizeAll = function (

        data

    ) {

        data =

            data ||

            {};


        const startedAt =

            Date.now();


        const result = {

            cases:

                Normalizer

                    .normalizeCollection(

                        data.cases,

                        Normalizer

                            .normalizeCase

                    ),

            accused:

                Normalizer

                    .normalizeCollection(

                        data.accused,

                        Normalizer

                            .normalizeAccused

                    ),

            witnesses:

                Normalizer

                    .normalizeCollection(

                        data.witnesses,

                        Normalizer

                            .normalizeWitness

                    ),

            seizures:

                Normalizer

                    .normalizeCollection(

                        data.seizures,

                        Normalizer

                            .normalizeSeizure

                    ),

            seizedArticles:

                Normalizer

                    .normalizeCollection(

                        data.seizedArticles,

                        Normalizer

                            .normalizeSeizedArticle

                    )

        };


        console.log(

            "🔥 Offence Data Normalized",

            {

                cases:

                    result.cases.length,

                accused:

                    result.accused.length,

                witnesses:

                    result.witnesses.length,

                seizures:

                    result.seizures.length,

                seizedArticles:

                    result.seizedArticles.length,

                duration:

                    Date.now() -

                    startedAt

            }

        );


        return result;

    };


    /*=========================================================
      ALIAS

      Store may call either:

          Normalizer.normalizeAll(data)

      OR

          Normalizer.normalizeData(data)
    =========================================================*/

    Normalizer.normalizeData =

        Normalizer.normalizeAll;


    /*=========================================================
      GET RELATIONSHIP KEY

      AUTHORITATIVE CONNECTOR = POR KEY
    =========================================================*/

    Normalizer.getRelationshipKey = function (

        record

    ) {

        if (

            !record

        ) {

            return "";

        }


        if (

            record.porKey

        ) {

            return Normalizer

                .normalizePor(

                    record.porKey

                );

        }


        return Normalizer

            .getPorKey(

                record

            );

    };


    /*=========================================================
      HAS VALID POR
    =========================================================*/

    Normalizer.hasPor = function (

        record

    ) {

        return Boolean(

            Normalizer

                .getRelationshipKey(

                    record

                )

        );

    };


    /*=========================================================
      BUILD POR DIAGNOSTIC

      Useful before Store indexing.
    =========================================================*/

    Normalizer.getPorStats = function (

        data

    ) {

        data =

            data ||

            {};


        function stats(

            records

        ) {

            records =

                Array.isArray(

                    records

                )

                    ? records

                    : [];


            let withPor =

                0;


            let withoutPor =

                0;


            const unique =

                new Set();


            records.forEach(

                function (

                    record

                ) {

                    const porKey =

                        Normalizer

                            .getRelationshipKey(

                                record

                            );


                    if (

                        porKey

                    ) {

                        withPor++;


                        unique.add(

                            porKey

                        );

                    }

                    else {

                        withoutPor++;

                    }

                }

            );


            return {

                total:

                    records.length,

                withPor:

                    withPor,

                withoutPor:

                    withoutPor,

                uniquePor:

                    unique.size

            };

        }


        return {

            cases:

                stats(

                    data.cases

                ),

            accused:

                stats(

                    data.accused

                ),

            witnesses:

                stats(

                    data.witnesses

                ),

            seizures:

                stats(

                    data.seizures

                ),

            seizedArticles:

                stats(

                    data.seizedArticles

                )

        };

    };


    /*=========================================================
      REGISTER
    =========================================================*/

    GG.Offence.Normalizer =

        Normalizer;


    /*=========================================================
      READY
    =========================================================*/

    console.log(

        "%cOffence Normalizer Ready",

        "color:#d32f2f;font-weight:bold;"

    );


    console.log(

        "[OffenceNormalizer] Version:",

        Normalizer.VERSION

    );


    console.log(

        "[OffenceNormalizer] Relationship strategy:",

        "POR KEY AUTHORITATIVE"

    );


})(window);
