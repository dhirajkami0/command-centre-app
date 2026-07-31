"use strict";

/*=========================================================
  IMPORTS
=========================================================*/

const {

    createGeminiClient

} = require("./client");

const {

    INTENT_PROMPT

} = require("./prompts");

const {

    validateIntent

} = require("./validator");

const {

    normalizeIntent

} = require("./normalize");


/*=========================================================
  PROVIDER
=========================================================*/

const AI_PROVIDER =

    "gemini";


/*=========================================================
  MODEL
=========================================================*/

const GEMINI_MODEL =

    process.env.GEMINI_MODEL ||

    "gemini-2.5-flash";


/*=========================================================
  NORMALIZE STRING ARRAY
=========================================================*/

function normalizeStringArray(

    value

) {

    if (

        !Array.isArray(

            value

        )

    ) {

        return [];

    }

    return value

        .filter(

            function (

                item

            ) {

                return (

                    typeof item ===

                        "string" &&

                    item.trim()

                );

            }

        )

        .map(

            function (

                item

            ) {

                return item.trim();

            }

        );

}


/*=========================================================
  FIND CANONICAL VALUE

  IMPORTANT:

  This function does NOT invent or translate intents.

  It only allows:

  1. Exact canonical match
  2. Case-insensitive recovery of an existing canonical value

  Example:

      staffContact
          ->
      staffContact

      STAFFCONTACT
          ->
      staffContact

  But:

      staffCommunicationInfo
          ->
      null

=========================================================*/

function findCanonicalValue(

    value,

    allowedValues = []

) {

    if (

        typeof value !== "string" ||

        !value.trim()

    ) {

        return null;

    }

    const rawValue =

        value.trim();


    /*----------------------------------
      Exact Match
    ----------------------------------*/

    const exactMatch =

        allowedValues.find(

            function (

                allowedValue

            ) {

                return (

                    allowedValue ===

                    rawValue

                );

            }

        );

    if (

        exactMatch

    ) {

        return exactMatch;

    }


    /*----------------------------------
      Case-Insensitive Match

      This recovers casing differences
      only.

      It does NOT map invented names.
    ----------------------------------*/

    const lowerValue =

        rawValue.toLowerCase();


    return (

        allowedValues.find(

            function (

                allowedValue

            ) {

                return (

                    allowedValue

                        .toLowerCase() ===

                    lowerValue

                );

            }

        ) ||

        null

    );

}


/*=========================================================
  VALIDATE AI OUTPUT AGAINST RUNTIME REGISTRY

  Gemini is ONLY allowed to select values supplied
  by the frontend Business Registry.

=========================================================*/

function validateAgainstRegistry(

    intent,

    business

) {

    const allowedDomains =

        normalizeStringArray(

            business.domains

        );


    const allowedIntents =

        normalizeStringArray(

            business.intents

        );


    /*----------------------------------
      Canonical Domain
    ----------------------------------*/

    const canonicalDomain =

        findCanonicalValue(

            intent.domain,

            allowedDomains

        );


    /*----------------------------------
      Canonical Intent
    ----------------------------------*/

    const canonicalIntent =

        findCanonicalValue(

            intent.intent,

            allowedIntents

        );


    /*----------------------------------
      Reject Invented Domain
    ----------------------------------*/

    if (

        !canonicalDomain

    ) {

        throw new Error(

            "Gemini returned an unsupported domain: " +

            String(

                intent.domain

            )

        );

    }


    /*----------------------------------
      Reject Invented Intent
    ----------------------------------*/

    if (

        !canonicalIntent

    ) {

        throw new Error(

            "Gemini returned an unsupported intent: " +

            String(

                intent.intent

            )

        );

    }


    /*----------------------------------
      Force Canonical Runtime Values
    ----------------------------------*/

    intent.domain =

        canonicalDomain;


    intent.intent =

        canonicalIntent;


    return intent;

}


/*=========================================================
  FILTER ENTITIES AGAINST RUNTIME REGISTRY
=========================================================*/

function filterEntities(

    entities,

    business

) {

    if (

        !entities ||

        typeof entities !== "object" ||

        Array.isArray(

            entities

        )

    ) {

        return {};

    }


    const allowedEntityTypes =

        normalizeStringArray(

            business.entityTypes

        );


    const filtered = {};


    Object.keys(

        entities

    ).forEach(

        function (

            key

        ) {

            const canonicalKey =

                findCanonicalValue(

                    key,

                    allowedEntityTypes

                );


            if (

                canonicalKey

            ) {

                filtered[

                    canonicalKey

                ] =

                    entities[key];

            }

        }

    );


    return filtered;

}


/*=========================================================
  DETECT INTENT
=========================================================*/

async function detectIntent(

    input,

    legacyLocalIntent = null

) {

    /*=====================================================
      REQUEST VARIABLES
    =====================================================*/

    let query = "";

    let normalizedQuery = "";

    let localIntent =

        legacyLocalIntent;

    let business = {};

    let rules = {};

    let extractedEntities = {};

    let runtimePrompt = "";


    /*=====================================================
      NEW OBJECT CALLER

      Expected frontend payload:

      {
          query,
          normalizedQuery,
          localIntent,
          business,
          rules,
          extractedEntities,
          prompt
      }

    =====================================================*/

    if (

        input &&

        typeof input === "object" &&

        !Array.isArray(

            input

        )

    ) {

        query =

            typeof input.query === "string"

                ? input.query

                : "";


        normalizedQuery =

            typeof input.normalizedQuery === "string"

                ? input.normalizedQuery

                : query;


        localIntent =

            input.localIntent &&

            typeof input.localIntent === "object"

                ? input.localIntent

                : null;


        business =

            input.business &&

            typeof input.business === "object"

                ? input.business

                : {};


        rules =

            input.rules &&

            typeof input.rules === "object"

                ? input.rules

                : {};


        extractedEntities =

            input.extractedEntities &&

            typeof input.extractedEntities === "object"

                ? input.extractedEntities

                : {};


        runtimePrompt =

            typeof input.prompt === "string"

                ? input.prompt.trim()

                : "";

    }


    /*=====================================================
      LEGACY STRING CALLER

      detectIntent(
          "query",
          localIntent
      )

    =====================================================*/

    else {

        query =

            typeof input === "string"

                ? input

                : "";


        normalizedQuery =

            query;

    }


    /*=====================================================
      VALIDATE QUERY
    =====================================================*/

    if (

        !query.trim()

    ) {

        throw new Error(

            "Query is required."

        );

    }


    query =

        query.trim();


    normalizedQuery =

        String(

            normalizedQuery ||

            query

        ).trim();


    /*=====================================================
      VALIDATE BUSINESS REGISTRY

      AI classification requires deterministic
      runtime values supplied by the frontend.

    =====================================================*/

    const allowedDomains =

        normalizeStringArray(

            business.domains

        );


    const allowedIntents =

        normalizeStringArray(

            business.intents

        );


    const allowedEntityTypes =

        normalizeStringArray(

            business.entityTypes

        );


    if (

        !allowedDomains.length

    ) {

        throw new Error(

            "Business Registry contains no allowed domains."

        );

    }


    if (

        !allowedIntents.length

    ) {

        throw new Error(

            "Business Registry contains no allowed intents."

        );

    }


    try {

        /*=================================================
          GEMINI CLIENT
        =================================================*/

        const client =

            createGeminiClient();


        /*=================================================
          BUILD DETERMINISTIC PAYLOAD

          This payload preserves the frontend registry.

          Gemini receives the ACTUAL allowed values.

        =================================================*/

        const userPayload = {

            query,

            normalizedQuery,

            localIntent:

                localIntent ||

                null,

            extractedEntities,

            business: {

                domains:

                    allowedDomains,

                intents:

                    allowedIntents,

                entityTypes:

                    allowedEntityTypes

            },

            rules: {

                classifyOnly:

                    rules.classifyOnly !== false,

                allowNewDomain:

                    false,

                allowNewIntent:

                    false,

                allowNewEntityType:

                    false,

                allowReasoning:

                    false

            }

        };


        /*=================================================
          BUILD GEMINI PROMPT
        =================================================*/

        let prompt =

`SYSTEM INSTRUCTIONS

${INTENT_PROMPT}

=========================================================
RUNTIME CLASSIFICATION REQUEST
=========================================================

The following JSON contains the authoritative runtime
Business Registry.

You MUST choose the domain and intent ONLY from the values
contained in this registry.

Return the canonical values EXACTLY as supplied.

Do not invent alternative intent names.

${JSON.stringify(
    userPayload,
    null,
    2
)}`;


        /*=================================================
          ATTACH FRONTEND GENERATED PROMPT

          If the frontend sends AIIntentPrompt.build()
          output, include it because it contains semantic
          definitions such as StaffIntentDefinitions.

        =================================================*/

        if (

            runtimePrompt

        ) {

            prompt +=

`

=========================================================
RUNTIME SEMANTIC CLASSIFICATION GUIDE
=========================================================

The following classification guide was generated from the
application's runtime Business Registry and semantic intent
definitions.

Use it to distinguish between similar canonical intents.

${runtimePrompt}`;

        }


        /*=================================================
          GEMINI INTENT DETECTION
        =================================================*/

        const response =

            await client.models.generateContent({

                model:

                    GEMINI_MODEL,

                contents:

                    prompt

            });


        /*=================================================
          EXTRACT CONTENT
        =================================================*/

        let content =

            typeof response.text ===

                "function"

                ? response.text()

                : response.text;


        if (

            !content ||

            typeof content !== "string"

        ) {

            throw new Error(

                "Empty Gemini intent response."

            );

        }


        /*=================================================
          CLEAN MARKDOWN JSON FENCES
        =================================================*/

        content =

            content

                .trim()

                .replace(

                    /^```json\s*/i,

                    ""

                )

                .replace(

                    /^```\s*/,

                    ""

                )

                .replace(

                    /\s*```$/,

                    ""

                )

                .trim();


        /*=================================================
          PARSE JSON
        =================================================*/

        let intent;


        try {

            intent =

                JSON.parse(

                    content

                );

        }

        catch (

            error

        ) {

            console.error(

                "[Gemini Intent Raw Response]",

                content

            );


            throw new Error(

                "Gemini returned invalid intent JSON."

            );

        }


        /*=================================================
          BASIC STRUCTURE VALIDATION
        =================================================*/

        if (

            !validateIntent(

                intent

            )

        ) {

            throw new Error(

                "Invalid intent structure."

            );

        }


        /*=================================================
          DETERMINISTIC REGISTRY VALIDATION

          CRITICAL:

          Gemini cannot create an intent here.

          If Gemini returns:

              staffCommunicationInfo

          and that value is not in:

              business.intents

          the result is rejected.

        =================================================*/

        intent =

            validateAgainstRegistry(

                intent,

                business

            );


        /*=================================================
          ENTITY REGISTRY ENFORCEMENT
        =================================================*/

        intent.entities =

            filterEntities(

                intent.entities,

                business

            );


        /*=================================================
          NORMALIZE RESPONSE
        =================================================*/

        const normalized =

            normalizeIntent(

                intent,

                AI_PROVIDER

            );


        /*=================================================
          FINAL POST-NORMALIZATION ENFORCEMENT

          Protect against normalizeIntent() changing
          canonical values.

        =================================================*/

        const finalIntent =

            validateAgainstRegistry(

                {

                    ...normalized

                },

                business

            );


        finalIntent.entities =

            filterEntities(

                finalIntent.entities,

                business

            );


        return finalIntent;

    }

    catch (

        err

    ) {

        console.error(

            "[Gemini Detect Intent]",

            err

        );


        throw err;

    }

}


/*=========================================================
  EXPORTS
=========================================================*/

module.exports = {

    detectIntent

};