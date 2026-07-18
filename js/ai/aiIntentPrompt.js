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
 BUILD RULES
=========================================================*/

AIIntentPrompt.buildRules = function (

    rules = {}

) {

    /*----------------------------------
      Normalize Rules
    ----------------------------------*/

    if (

        !rules ||

        typeof rules !== "object"

    ) {

        rules = {};

    }

    /*----------------------------------
      Build Classification Rules
    ----------------------------------*/

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

13. The selected domain MUST be one of the supplied Allowed Domains.

14. The selected intent MUST be one of the supplied Allowed Intents.

15. Return the canonical intent value EXACTLY as it appears in the Allowed Intents registry.

16. Intent names are canonical runtime values.

17. NEVER convert camelCase canonical intent values into UPPER_SNAKE_CASE.

18. Determine the user's PRIMARY requested information or action before selecting an intent.

19. Select the MOST SPECIFIC allowed intent whose semantic definition matches the user's request.

20. A named entity identifies the subject of the request. The presence of a staff name does NOT automatically make the request a staff profile request.

21. A general profile intent must be used only when the user requests general profile, identity, details, or overall information and no more specific information is requested.

22. If the user requests one specific attribute, status, relationship, action, or information category, select the corresponding specific intent instead of a general profile intent.

23. Interpret semantically equivalent natural-language expressions according to their meaning. Exact keyword matching is NOT required.

24. For staff-domain requests, distinguish carefully between profile, contact, role, designation, posting, current location, duty, assignment, team, GPS, patrol, status, directory, count, summary, and analytics intents according to their supplied semantic definitions.

25. A request about communicating with, contacting, calling, reaching, getting in touch with, speaking with, or obtaining communication details for a staff member must be classified using the specific contact-related intent supplied in the registry, not the general profile intent.

26. Current physical location and official organizational posting are different concepts and must use their respective specific intents.

27. Duty status and general staff status are different concepts and must use their respective specific intents.

28. Individual staff requests and aggregate, directory, count, list, or summary requests are different and must use their respective specific intents.

29. If the local intent is successful, valid, and correctly represents the user's request, preserve that intent.

30. Do not replace a correct high-confidence local intent merely because another intent is semantically related.

31. Replace or improve a local intent only when the AI-selected intent is a clearly better and more specific semantic match.

32. If the local intent failed, is unknown, or has insufficient confidence, independently classify the request using the supplied Business Registry.

33. If multiple intents appear possible, select the most specific intent corresponding to the information or action explicitly requested by the user.

34. Semantic definitions are classification guidance. The returned intent value must still be the exact canonical intent name from the Allowed Intents registry.

35. If no supplied intent correctly represents the request, return "UNKNOWN".

36. Confidence must be a number between 0.0 and 1.0.

37. Return JSON ONLY.

38. Do NOT return Markdown.

39. Do NOT wrap JSON inside code blocks.

40. Do NOT include any text before or after the JSON.

---------------------------------------------------------
CURRENT RUNTIME RULES
---------------------------------------------------------

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
