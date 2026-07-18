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

    GG.AIIntentPrompt

) {

    console.warn(

        "[GreenGuardAI] AI Intent Prompt already loaded."

    );

    return;

}

/*=========================================================
 MODULE
=========================================================*/

const AIIntentPrompt = {};

/*=========================================================
 INFO
=========================================================*/

AIIntentPrompt.VERSION =

    "1.0.0";

AIIntentPrompt.initialized =

    false;

/*=========================================================
 INIT
=========================================================*/

AIIntentPrompt.init = function () {

    if (

        AIIntentPrompt.initialized

    ) {

        return;

    }

    AIIntentPrompt.initialized =

        true;

    console.log(

        "%cGreenGuard AI Intent Prompt Ready",

        "color:#673AB7;font-weight:bold;"

    );

};
/*=========================================================
 BUILD PROMPT
=========================================================*/

AIIntentPrompt.build = function (

    request = {}

) {

    AIIntentPrompt.init();

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        typeof request !== "object" ||

        request === null

    ) {

        request = {};

    }

    /*----------------------------------
      Build Prompt Sections
    ----------------------------------*/

    let prompt = "";

    prompt +=

        AIIntentPrompt.buildIdentity();

    prompt +=

        AIIntentPrompt.buildBusiness(

            request.business

        );

    prompt +=

        AIIntentPrompt.buildRules(

            request.rules

        );

    prompt +=

        AIIntentPrompt.buildRequest(

            request

        );

    prompt +=

        AIIntentPrompt.buildReturnSchema();

    /*----------------------------------
      Return
    ----------------------------------*/

    return prompt;

};
/*=========================================================
 BUILD IDENTITY
=========================================================*/

AIIntentPrompt.buildIdentity = function () {

    return `

=========================================================
IDENTITY
=========================================================

You are GreenGuard Intent Selector.

Your only responsibility is to classify the user's intent.

You are NOT a chatbot.

You are NOT an assistant.

You are NOT allowed to answer the user.

You are NOT allowed to explain anything.

You are NOT allowed to generate reports.

You are NOT allowed to summarize.

You are NOT allowed to reason beyond intent classification.

You must choose exactly ONE domain.

You must choose exactly ONE intent.

You must classify using ONLY the supplied Business Registry.

`;

}; 

 /*=========================================================
 BUILD BUSINESS REGISTRY
=========================================================*/

/*=========================================================
 BUILD BUSINESS REGISTRY
=========================================================*/

AIIntentPrompt.buildBusiness = function (

    business = {}

) {

    /*----------------------------------
      Normalize Registry
    ----------------------------------*/

    const domains =

        Array.isArray(

            business.domains

        )

            ? business.domains

            : [];


    const intents =

        Array.isArray(

            business.intents

        )

            ? business.intents

            : [];


    const entityTypes =

        Array.isArray(

            business.entityTypes

        )

            ? business.entityTypes

            : [];


    /*----------------------------------
      Staff Semantic Definitions

      These definitions provide semantic
      guidance to the AI.

      Canonical intent values still come
      exclusively from BusinessRegistry.
    ----------------------------------*/

    const staffDefinitions =

        GG.StaffIntentDefinitions &&

        typeof GG.StaffIntentDefinitions === "object"

            ? GG.StaffIntentDefinitions

            : {};


    /*----------------------------------
      Build Allowed Intent Registry

      Example:

      staffProfile
      Definition: ...

      staffContact
      Definition: ...
    ----------------------------------*/

    const intentRegistry =

        intents.map(

            function (

                intent

            ) {

                const definition =

                    staffDefinitions[

                        intent

                    ];


                /*--------------------------
                  Intent With Definition
                --------------------------*/

                if (

                    definition

                ) {

                    return (

                        intent +

                        "\nDefinition: " +

                        definition

                    );

                }


                /*--------------------------
                  Intent Without Definition

                  Important for future
                  GIS / Wildlife / Patrol /
                  Legal / Analytics / Report
                  intents.

                  Never remove the intent
                  simply because it does not
                  yet have a definition.
                --------------------------*/

                return intent;

            }

        );


    /*----------------------------------
      Build Prompt
    ----------------------------------*/

    return `

=========================================================
BUSINESS REGISTRY
=========================================================

Use ONLY the following Business Registry.

The intent names listed below are canonical runtime values.

You MUST return the intent name EXACTLY as written.

Never convert camelCase intent names to UPPER_SNAKE_CASE.

Never invent a new domain.

Never invent a new intent.

Never invent a new entity type.

---------------------------------------------------------
ALLOWED DOMAINS
---------------------------------------------------------

${domains.join("\n")}

---------------------------------------------------------
ALLOWED INTENTS AND SEMANTIC DEFINITIONS
---------------------------------------------------------

${intentRegistry.join("\n\n")}

---------------------------------------------------------
ALLOWED ENTITY TYPES
---------------------------------------------------------

${entityTypes.join("\n")}

`;

};

 /*=========================================================
 BUILD REQUEST
=========================================================*/

AIIntentPrompt.buildRequest = function (

    request = {}

) {

    return `

=========================================================
CURRENT REQUEST
=========================================================

Original Query

${request.query || ""}

---------------------------------------------------------

Normalized Query

${request.normalizedQuery || ""}

---------------------------------------------------------

Local Intent

${JSON.stringify(

    request.localIntent || {},

    null,

    2

)}

---------------------------------------------------------

Extracted Entities

${JSON.stringify(

    request.extractedEntities || {},

    null,

    2

)}

---------------------------------------------------------

Request Payload

${JSON.stringify(

    request,

    null,

    2

)}

`;

};

 /*=========================================================
 BUILD RETURN SCHEMA
=========================================================*/

AIIntentPrompt.buildReturnSchema = function () {

    return `

=========================================================
RETURN FORMAT
=========================================================

Return ONLY a valid JSON object.

Do NOT return Markdown.

Do NOT wrap the JSON inside code blocks.

Do NOT add any explanation.

The JSON must contain the following fields.

success
    Type    : Boolean

domain
    Type    : String
    Value   : Must be one of the supplied Domains or "UNKNOWN"

intent
    Type    : String
    Value   : Must be one of the supplied Intents or "UNKNOWN"

confidence
    Type    : Number
    Range   : 0.0 to 1.0

entities
    Type    : Object
    Value   : Keys must use only the supplied Entity Types

Example Structure

{
    "success": true,
    "domain": "...",
    "intent": "...",
    "confidence": 0.95,
    "entities": {
    }
}

=========================================================
END
=========================================================

`;

};
 /*=========================================================
 REGISTER
=========================================================*/

GG.AIIntentPrompt =

    AIIntentPrompt;

console.log(

    "%cGreenGuard AI Intent Prompt Loaded",

    "color:#673AB7;font-weight:bold;"

);

})(window);
