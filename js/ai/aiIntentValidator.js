(function (window) {

"use strict";

/*=========================================================
 NAMESPACE
=========================================================*/

const GG =

    window.GreenGuardAI =

    window.GreenGuardAI || {};

/*=========================================================
 PREVENT DOUBLE LOADING
=========================================================*/

if (

    GG.AIIntentValidator

) {

    console.warn(

        "[GreenGuardAI] AI Intent Validator already loaded."

    );

    return;

}

/*=========================================================
 MODULE
=========================================================*/

const AIIntentValidator = {};

/*=========================================================
 INFO
=========================================================*/

AIIntentValidator.VERSION =

    "1.0.0";

AIIntentValidator.initialized =

    false;

/*=========================================================
 INIT
=========================================================*/

AIIntentValidator.init = function () {

    if (

        AIIntentValidator.initialized

    ) {

        return;

    }

    AIIntentValidator.initialized =

        true;

    console.log(

        "%cGreenGuard AI Intent Validator Ready",

        "color:#009688;font-weight:bold;"

    );

};
/*=========================================================
 VALIDATE INTENT
=========================================================*/

AIIntentValidator.validate = function (

    intent = {}

) {

    AIIntentValidator.init();

    /*----------------------------------
      Validate Input
    ----------------------------------*/

    if (

        !intent ||

        typeof intent !== "object" ||

        Array.isArray(

            intent

        )

    ) {

        return AIIntentValidator.createInvalidIntent(

            "Invalid AI response."

        );

    }

    /*----------------------------------
      Validate Individual Fields
    ----------------------------------*/

    const domain =

        AIIntentValidator.validateDomain(

            intent.domain

        );

/*----------------------------------
  Validate Registry Intent

  Example:
  STAFF_CONTACT
----------------------------------*/

const detectedIntent =

    AIIntentValidator.validateIntent(

        intent.intent

    );

/*----------------------------------
  Convert To Runtime Intent

  Example:
  STAFF_CONTACT
        ->
  staffContact
----------------------------------*/

const runtimeIntent =

    AIIntentValidator.normalizeRuntimeIntent(

        detectedIntent,

        domain

    );

const confidence =

    AIIntentValidator.validateConfidence(

        intent.confidence

    );

    const entities =

        AIIntentValidator.validateEntities(

            intent.entities

        );

    /*----------------------------------
      Build Canonical Intent
    ----------------------------------*/

return {

    success: true,

    source:

        intent.source ||

        "ai",

    provider:

        intent.provider ||

        "Gemini",

    domain,

    /*----------------------------------
      Canonical Runtime Intent
    ----------------------------------*/

    intent:

        runtimeIntent,

    /*----------------------------------
      Original Registry Intent
    ----------------------------------*/

    registryIntent:

        detectedIntent,

    validated:

        true,

    confidence,

    entities,

    raw:

        intent


    };

};
  /*=========================================================
 VALIDATE DOMAIN
=========================================================*/

/*=========================================================
 VALIDATE DOMAIN
=========================================================*/

AIIntentValidator.validateDomain = function (

    domain = ""

) {

    AIIntentValidator.init();

    const value =

        String(

            domain || ""

        ).trim();

    if (

        !value

    ) {

        return "UNKNOWN";

    }

    const registry =

        GG.BusinessRegistry || {};

    const domains =

        Array.isArray(

            registry.domains

        )

            ? registry.domains

            : [];

    /*----------------------------------
      Exact Canonical Match

      Example:
      staff -> staff
    ----------------------------------*/

    if (

        domains.includes(

            value

        )

    ) {

        return value;

    }

    /*----------------------------------
      Case-Insensitive Match

      Example:
      STAFF -> staff
      Staff -> staff
    ----------------------------------*/

    const normalized =

        domains.find(

            item =>

                String(item)

                    .toLowerCase() ===

                value.toLowerCase()

        );

    if (

        normalized

    ) {

        return normalized;

    }

    console.warn(

        "[AIIntentValidator] Invalid Domain:",

        domain

    );

    return "UNKNOWN";

};
  /*=========================================================
 VALIDATE INTENT
=========================================================*/

/*=========================================================
 VALIDATE INTENT
=========================================================*/

/*=========================================================
 VALIDATE INTENT

 IMPORTANT:
 BusinessRegistry contains canonical runtime intent values:

 staffProfile
 staffContact
 staffPosting
 staffLocation
 whoIsOnDuty
 ...

These values MUST NOT be converted to uppercase.

This validator:
  1. Accepts exact canonical values.
  2. Accepts case-insensitive matches safely.
  3. Converts legacy CONSTANT_STYLE values where possible.
  4. Returns the canonical registry value.
=========================================================*/

AIIntentValidator.validateIntent = function (

    intent = ""

) {

    AIIntentValidator.init();

    /*----------------------------------
      Normalize Input
    ----------------------------------*/

    const rawIntent =

        String(

            intent || ""

        ).trim();

    if (

        !rawIntent

    ) {

        return "UNKNOWN";

    }

    /*----------------------------------
      Business Registry
    ----------------------------------*/

    const registry =

        GG.BusinessRegistry || {};

    const intents =

        Array.isArray(

            registry.intents

        )

            ? registry.intents

            : [];

    /*----------------------------------
      No Registry
    ----------------------------------*/

    if (

        !intents.length

    ) {

        console.warn(

            "[AIIntentValidator] Intent registry unavailable."

        );

        return "UNKNOWN";

    }

    /*----------------------------------
      1. Exact Canonical Match

      Example:
      staffContact -> staffContact
    ----------------------------------*/

    if (

        intents.includes(

            rawIntent

        )

    ) {

        return rawIntent;

    }

    /*----------------------------------
      2. Case-Insensitive Match

      Example:
      STAFFCONTACT -> staffContact
      staffcontact -> staffContact
    ----------------------------------*/

    const lowerIntent =

        rawIntent.toLowerCase();

    const caseInsensitiveMatch =

        intents.find(

            function (

                canonicalIntent

            ) {

                return (

                    String(

                        canonicalIntent

                    ).toLowerCase() ===

                    lowerIntent

                );

            }

        );

    if (

        caseInsensitiveMatch

    ) {

        return caseInsensitiveMatch;

    }

    /*----------------------------------
      3. Legacy CONSTANT_STYLE Match

      Example:
      STAFF_PROFILE
          ↓
      staffProfile

      STAFF_CONTACT
          ↓
      staffContact

      WHO_IS_ON_DUTY
          ↓
      whoIsOnDuty
    ----------------------------------*/

    const normalizedLegacy =

        rawIntent

            .toLowerCase()

            .split("_")

            .filter(Boolean)

            .map(

                function (

                    part,

                    index

                ) {

                    if (

                        index === 0

                    ) {

                        return part;

                    }

                    return (

                        part.charAt(0)

                            .toUpperCase() +

                        part.slice(1)

                    );

                }

            )

            .join("");

    const legacyMatch =

        intents.find(

            function (

                canonicalIntent

            ) {

                return (

                    String(

                        canonicalIntent

                    ).toLowerCase() ===

                    normalizedLegacy.toLowerCase()

                );

            }

        );

    if (

        legacyMatch

    ) {

        return legacyMatch;

    }

    /*----------------------------------
      Invalid
    ----------------------------------*/

    console.warn(

        "[AIIntentValidator] Invalid Intent:",

        rawIntent

    );

    return "UNKNOWN";

};
/*=========================================================
 NORMALIZE RUNTIME INTENT

 Converts AI / Business Registry intent keys
 into canonical runtime intent values.

 Example:

 STAFF_PROFILE
        ->
 staffProfile

 STAFF_CONTACT
        ->
 staffContact

 Local pipeline is NOT affected.
=========================================================*/

AIIntentValidator.normalizeRuntimeIntent = function (

    intent = "",

    domain = ""

) {

    AIIntentValidator.init();

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !intent ||

        typeof intent !== "string"

    ) {

        return intent;

    }

    /*----------------------------------
      Normalize Inputs
    ----------------------------------*/

    const value =

        intent.trim();

    const normalizedDomain =

        String(

            domain || ""

        )

        .trim()

        .toUpperCase();

    /*----------------------------------
      STAFF DOMAIN

      Use StaffConstants as the
      authoritative runtime mapping.
    ----------------------------------*/

    if (

        normalizedDomain === "STAFF"

    ) {

        const INTENTS =

            GG.StaffConstants
                ?.INTENTS;

        if (

            !INTENTS

        ) {

            console.warn(

                "[AIIntentValidator] StaffConstants.INTENTS unavailable."

            );

            return value;

        }

        /*------------------------------
          Already Canonical

          staffProfile
          staffContact
          staffDuty
          etc.
        ------------------------------*/

        if (

            Object.values(

                INTENTS

            ).includes(

                value

            )

        ) {

            return value;

        }

        /*------------------------------
          AI Constant Key

          STAFF_PROFILE
          STAFF_CONTACT
          etc.
        ------------------------------*/

        const key =

            value.toUpperCase();

        if (

            Object.prototype
                .hasOwnProperty.call(

                    INTENTS,

                    key

                )

        ) {

            return INTENTS[

                key

            ];

        }

    }

    /*----------------------------------
      Other Domains

      Keep Current Intent
    ----------------------------------*/

    return value;

};
  /*=========================================================
 VALIDATE ENTITIES
=========================================================*/

/*=========================================================
 VALIDATE ENTITIES
=========================================================*/

AIIntentValidator.validateEntities = function (

    entities = {}

) {

    AIIntentValidator.init();

    if (

        !entities ||

        typeof entities !== "object" ||

        Array.isArray(

            entities

        )

    ) {

        return {};

    }

    const registry =

        GG.BusinessRegistry || {};

    const entityTypes =

        Array.isArray(

            registry.entityTypes

        )

            ? registry.entityTypes

            : [];

    const validated = {};

    Object.keys(

        entities

    ).forEach(

        function (

            type

        ) {

            /*------------------------------
              Exact Match
            ------------------------------*/

            let canonicalType =

                entityTypes.includes(

                    type

                )

                    ? type

                    : null;

            /*------------------------------
              Case-Insensitive Match
            ------------------------------*/

            if (

                !canonicalType

            ) {

                canonicalType =

                    entityTypes.find(

                        item =>

                            String(item)

                                .toLowerCase() ===

                            String(type)

                                .toLowerCase()

                    );

            }

            /*------------------------------
              Normalized Match

              CLEAN_NAME -> cleanName
            ------------------------------*/

            if (

                !canonicalType

            ) {

                const normalizedInput =

                    String(type)

                        .replace(

                            /[^a-zA-Z0-9]/g,

                            ""

                        )

                        .toLowerCase();

                canonicalType =

                    entityTypes.find(

                        item =>

                            String(item)

                                .replace(

                                    /[^a-zA-Z0-9]/g,

                                    ""

                                )

                                .toLowerCase() ===

                            normalizedInput

                    );

            }

            if (

                canonicalType

            ) {

                validated[

                    canonicalType

                ] =

                    entities[type];

            }

            else {

                console.warn(

                    "[AIIntentValidator] Invalid Entity Type:",

                    type

                );

            }

        }

    );

    return validated;

};

  /*=========================================================
 VALIDATE CONFIDENCE
=========================================================*/

AIIntentValidator.validateConfidence = function (

    confidence = 0

) {

    AIIntentValidator.init();

    /*----------------------------------
      Convert
    ----------------------------------*/

    confidence =

        Number(

            confidence

        );

    /*----------------------------------
      Invalid Number
    ----------------------------------*/

    if (

        !Number.isFinite(

            confidence

        )

    ) {

        return 0;

    }

    /*----------------------------------
      Clamp
    ----------------------------------*/

    confidence =

        Math.max(

            0,

            Math.min(

                1,

                confidence

            )

        );

    return confidence;

};

  /*=========================================================
 CREATE INVALID INTENT
=========================================================*/

AIIntentValidator.createInvalidIntent = function (

    message = "Invalid AI intent."

) {

    return {

        success: false,

        validated: false,

        validatorError: true,

        source: "AIIntentValidator",

        provider: "Gemini",

        domain: "UNKNOWN",

        intent: "UNKNOWN",

        confidence: 0,

        entities: {},

        raw: null,

        error: String(

            message

        )

    };

};
  /*=========================================================
 REGISTER
=========================================================*/

GG.AIIntentValidator =

    AIIntentValidator;

console.log(

    "%cGreenGuard AI Intent Validator Loaded",

    "color:#009688;font-weight:bold;"

);

})(window);
