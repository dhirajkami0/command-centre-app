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

    const detectedIntent =

        AIIntentValidator.validateIntent(

            intent.intent

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

        intent:

            detectedIntent,
validated: true,
        confidence,

        entities,

        raw:

            intent

    };

};
  /*=========================================================
 VALIDATE DOMAIN
=========================================================*/

AIIntentValidator.validateDomain = function (

    domain = ""

) {

    AIIntentValidator.init();

    /*----------------------------------
      Normalize
    ----------------------------------*/

    domain =

        String(

            domain || ""

        )

        .trim()

        .toUpperCase();

    /*----------------------------------
      Business Registry
    ----------------------------------*/

    const registry =

        GG.BusinessRegistry || {};

    const domains =

        registry.domains || [];

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        domains.includes(

            domain

        )

    ) {

        return domain;

    }

    /*----------------------------------
      Invalid
    ----------------------------------*/

    console.warn(

        "[AIIntentValidator] Invalid Domain:",

        domain

    );

    return "UNKNOWN";

};

  /*=========================================================
 VALIDATE INTENT
=========================================================*/

AIIntentValidator.validateIntent = function (

    intent = ""

) {

    AIIntentValidator.init();

    /*----------------------------------
      Normalize
    ----------------------------------*/

    intent =

        String(

            intent || ""

        )

        .trim()

        .toUpperCase();

    /*----------------------------------
      Business Registry
    ----------------------------------*/

    const registry =

        GG.BusinessRegistry || {};

    const intents =

        registry.intents || [];

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        intents.includes(

            intent

        )

    ) {

        return intent;

    }

    /*----------------------------------
      Invalid
    ----------------------------------*/

    console.warn(

        "[AIIntentValidator] Invalid Intent:",

        intent

    );

    return "UNKNOWN";

};

  /*=========================================================
 VALIDATE ENTITIES
=========================================================*/

AIIntentValidator.validateEntities = function (

    entities = {}

) {

    AIIntentValidator.init();

    /*----------------------------------
      Validate Input
    ----------------------------------*/

    if (

        !entities ||

        typeof entities !== "object" ||

        Array.isArray(

            entities

        )

    ) {

        return {};

    }

    /*----------------------------------
      Business Registry
    ----------------------------------*/

    const registry =

        GG.BusinessRegistry || {};

    const entityTypes =

        registry.entityTypes || [];

    /*----------------------------------
      Canonical Entities
    ----------------------------------*/

    const validated = {};

    /*----------------------------------
      Validate Entity Types
    ----------------------------------*/

    Object.keys(

        entities

    ).forEach(

        function (

            type

        ) {

            const normalizedType =

                String(

                    type || ""

                )

                .trim()

                .toUpperCase();

            if (

                entityTypes.includes(

                    normalizedType

                )

            ) {

                validated[

                    normalizedType

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
