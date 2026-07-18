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

/*=========================================================
 BUILD RULES
=========================================================*/

AIIntentPrompt.buildRules = function (

    rules = {}

) {

    /*----------------------------------
      Normalize Runtime Rules
    ----------------------------------*/

    rules =

        rules &&

        typeof rules === "object"

            ? rules

            : {};

    /*----------------------------------
      Runtime Flags
    ----------------------------------*/

    const classifyOnly =

        rules.classifyOnly !== false;

    const allowNewDomain =

        rules.allowNewDomain === true;

    const allowNewIntent =

        rules.allowNewIntent === true;

    const allowNewEntityType =

        rules.allowNewEntityType === true;

    const allowReasoning =

        rules.allowReasoning === true;

    /*----------------------------------
      Build Rules
    ----------------------------------*/

    return `

=========================================================
RULES
=========================================================

You are an INTENT CLASSIFIER ONLY.

Your task is to determine the user's actual semantic intent
and select the single best matching domain and intent from
the supplied Business Registry.

You must follow all rules below.

---------------------------------------------------------
A. CLASSIFICATION RESPONSIBILITY
---------------------------------------------------------

1. Your ONLY responsibility is intent classification.

2. NEVER answer the user's question.

3. NEVER perform the requested action.

4. NEVER generate a report.

5. NEVER summarize the requested subject.

6. NEVER provide explanations, recommendations, or advice.

7. NEVER include classification reasoning in the response.

8. Analyze the meaning and purpose of the user's request,
   not merely individual keywords.

9. Determine what information or operation the user is
   actually requesting.

10. Different natural-language expressions that request
    the same underlying operation must map to the same
    canonical intent.

11. Do not classify a request as a broad or generic intent
    when a more specific supplied intent accurately
    represents the user's requested operation.

12. Prefer the most specific valid intent supported by
    the meaning of the complete query.

---------------------------------------------------------
B. BUSINESS REGISTRY IS AUTHORITATIVE
---------------------------------------------------------

13. The supplied Business Registry is the ONLY authoritative
    source of valid domains, intents, and entity types.

14. Select EXACTLY ONE domain from the supplied Domains.

15. Select EXACTLY ONE intent from the supplied Intents.

16. The selected intent must represent the user's actual
    requested operation as precisely as possible.

17. NEVER invent a domain.

18. NEVER invent an intent.

19. NEVER invent an entity type.

20. NEVER infer that a domain or intent exists merely
    because its name sounds appropriate.

21. If a value is not present in the supplied Business
    Registry, it must not be returned.

---------------------------------------------------------
C. CANONICAL VALUE PRESERVATION
---------------------------------------------------------

22. Return domain values using the EXACT canonical spelling
    and casing supplied in the Business Registry.

23. Return intent values using the EXACT canonical spelling
    and casing supplied in the Business Registry.

24. Return entity type keys using the EXACT canonical
    spelling and casing supplied in the Business Registry.

25. NEVER convert canonical values to uppercase.

26. NEVER convert canonical values to lowercase unless
    that is exactly how they appear in the Business Registry.

27. NEVER convert camelCase values into CONSTANT_CASE.

28. NEVER convert CONSTANT_CASE values into another format
    unless the supplied Business Registry itself uses that
    other format.

29. NEVER add underscores, spaces, hyphens, prefixes,
    or suffixes to a registry value.

30. Copy the selected domain, intent, and entity type names
    exactly from the supplied Business Registry.

---------------------------------------------------------
D. SEMANTIC INTENT SELECTION
---------------------------------------------------------

31. Classify according to the user's requested outcome.

32. Determine the primary operation the user wants performed.

33. Distinguish between intents that refer to the same entity
    but request different information or operations.

34. The presence of a person's name, place, designation,
    jurisdiction, or other entity does NOT by itself determine
    the intent.

35. Entities identify the subject of the request.
    The intent identifies what the user wants to know or do
    regarding that subject.

36. Do not automatically select a general profile,
    information, search, or summary intent merely because
    a named entity appears in the query.

37. When multiple supplied intents appear potentially relevant,
    select the intent whose semantic purpose most closely
    matches the requested outcome.

38. Prefer a specific operational intent over a general intent
    when the query clearly requests that specific operation.

39. Prefer a general intent only when the query genuinely asks
    for broad or general information and no more specific
    supplied intent accurately applies.

40. Interpret paraphrases, indirect wording, conversational
    wording, and natural-language variations according to
    their semantic meaning.

41. Do not require the user to use the exact words contained
    in an intent name.

42. Do not rely exclusively on keyword matching.

43. Consider the complete query before selecting the intent.

---------------------------------------------------------
E. LOCAL INTENT HANDLING
---------------------------------------------------------

44. The Local Intent is evidence from the deterministic
    local classifier.

45. If the Local Intent is successful, valid, and accurately
    represents the user's requested operation, preserve it.

46. Do not replace a correct Local Intent merely because
    another intent is semantically related.

47. If the Local Intent failed, is UNKNOWN, is invalid,
    or does not accurately represent the user's requested
    operation, independently select the best valid intent
    from the Business Registry.

48. If the Local Intent is ambiguous, use the complete user
    query to determine the most precise valid intent.

49. Improve or replace the Local Intent only when another
    supplied intent is clearly a better semantic match.

50. When preserving a Local Intent, return its canonical
    registry value exactly as supplied.

---------------------------------------------------------
F. DOMAIN SELECTION
---------------------------------------------------------

51. Select the domain that owns the chosen intent.

52. The domain and intent must be logically compatible.

53. Do not select a domain merely because an entity associated
    with that domain appears in the query.

54. Determine the domain from the primary requested operation.

55. If the Business Registry or request context provides
    domain-to-intent relationships, respect those relationships.

---------------------------------------------------------
G. ENTITY EXTRACTION
---------------------------------------------------------

56. Extract only entities explicitly stated in the query
    or clearly supported by the request context.

57. NEVER fabricate an entity value.

58. NEVER fabricate missing personal, operational,
    geographic, or analytical information.

59. Entity keys must use only entity types supplied in
    the Business Registry.

60. Preserve entity values accurately.

61. Do not use an entity value as a substitute for selecting
    the correct intent.

62. If no valid entities are present, return an empty object.

---------------------------------------------------------
H. CONFIDENCE
---------------------------------------------------------

63. Confidence must be a number between 0.0 and 1.0.

64. Use high confidence only when one supplied intent clearly
    matches the requested operation.

65. Reduce confidence when multiple supplied intents are
    genuinely plausible.

66. Do not use high confidence merely because the query
    contains a recognizable entity.

67. Confidence represents certainty in the classification,
    not certainty that the entity exists in the database.

---------------------------------------------------------
I. UNKNOWN HANDLING
---------------------------------------------------------

68. Return "UNKNOWN" only when no valid supplied domain or
    intent can reasonably represent the user's request.

69. Do not invent a new intent to avoid returning "UNKNOWN".

70. Do not force an unrelated registry intent when no valid
    semantic match exists.

71. If the domain can be identified but no valid intent can
    be identified, the intent must be "UNKNOWN".

---------------------------------------------------------
J. OUTPUT CONTRACT
---------------------------------------------------------

72. Return JSON ONLY.

73. Return exactly one classification result.

74. Do NOT return Markdown.

75. Do NOT wrap the JSON in a code block.

76. Do NOT include explanatory text before the JSON.

77. Do NOT include explanatory text after the JSON.

78. Do NOT include reasoning or chain-of-thought.

79. The response must be a valid JSON object.

80. The JSON must conform to the required return schema
    supplied elsewhere in this prompt.

---------------------------------------------------------
CURRENT RUNTIME RULES
---------------------------------------------------------

Classify Only          : ${classifyOnly}

Allow New Domain       : ${allowNewDomain}

Allow New Intent       : ${allowNewIntent}

Allow New Entity Type  : ${allowNewEntityType}

Allow Reasoning        : ${allowReasoning}

---------------------------------------------------------
FINAL CLASSIFICATION PRIORITY
---------------------------------------------------------

When selecting the final intent, apply this priority:

1. Understand the complete semantic meaning of the query.

2. Determine the specific outcome or operation requested.

3. Identify the relevant entities separately from the intent.

4. Find the most specific matching intent in the supplied
   Business Registry.

5. Verify that the selected intent is actually present in
   the Business Registry.

6. Return the EXACT canonical registry value without changing
   its spelling, casing, or naming convention.

7. Select the compatible domain.

8. Preserve a correct Local Intent when it already represents
   the requested operation accurately.

9. Use "UNKNOWN" rather than inventing an unsupported value.

=========================================================
END RULES
=========================================================

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
