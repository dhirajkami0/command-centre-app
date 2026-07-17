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

AIIntentPrompt.buildBusiness = function (

    business = {}

) {

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

    return `

=========================================================
BUSINESS REGISTRY
=========================================================

Use ONLY the following Business Registry.

Never invent new values.

Allowed Domains

${domains.join("\n")}

---------------------------------------------------------

Allowed Intents

${intents.join("\n")}

---------------------------------------------------------

Allowed Entity Types

${entityTypes.join("\n")}

`;

};

 /*=========================================================
 BUILD RULES
=========================================================*/

AIIntentPrompt.buildRules = function (

    rules = {}

) {

    return `

=========================================================
RULES
=========================================================

You must strictly follow these rules.

1. Your ONLY responsibility is intent classification.

2. NEVER answer the user's question.

3. NEVER generate reports.

4. NEVER summarize.

5. NEVER explain your reasoning.

6. NEVER invent a domain.

7. NEVER invent an intent.

8. NEVER invent an entity type.

9. NEVER invent entities that are not supported by the user's query.

10. Use ONLY the supplied Business Registry.

11. Choose EXACTLY ONE domain.

12. Choose EXACTLY ONE intent.

13. If the local intent is already correct, return the same intent.

14. Improve the intent ONLY if you have higher confidence.

15. If no valid intent exists, return "UNKNOWN".

16. Confidence must be between 0.0 and 1.0.

17. Return JSON ONLY.

18. Do NOT return Markdown.

19. Do NOT wrap JSON inside code blocks.

20. Do NOT include any text before or after the JSON.

---------------------------------------------------------

Current Runtime Rules

Classify Only      : ${rules.classifyOnly === true}

Allow New Domain   : ${rules.allowNewDomain === true}

Allow New Intent   : ${rules.allowNewIntent === true}

Allow Entity Types : ${rules.allowNewEntityType === true}

Allow Reasoning    : ${rules.allowReasoning === true}

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
