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

if (GG.AI) {

    console.warn(

        "[GreenGuardAI] AI Provider already loaded."

    );

    return;

}

const AI = {};

/*=========================================================
 INFO
=========================================================*/

AI.VERSION = "1.0.0";

AI.PROVIDER =

    GG.Config?.AI?.PROVIDER ||

    "Unknown";

/*=========================================================
 INITIALIZE
=========================================================*/

AI.initialized = false;

/*=========================================================
 INIT
=========================================================*/

AI.init = function () {

    if (AI.initialized) {

        return;

    }

    AI.initialized = true;

    console.log(

        "%cGreenGuard AI Provider Ready",

        "color:#0080ff;font-weight:bold;"

    );

};

/*=========================================================
 DETECT INTENT
=========================================================*/

/*=========================================================
 DETECT INTENT
=========================================================*/


/*=========================================================
 ASK AI
=========================================================*/
/*=========================================================
 ASK AI
=========================================================*/

AI.ask = async function (

    question

) {

    AI.init();

    if (

        typeof question !== "string" ||

        !question.trim()

    ) {

        throw new Error(

            "Question is required."

        );

    }

    /*----------------------------------
      Core
    ----------------------------------*/

    const Core =

        GG.Core;

    if (

        !Core ||

        typeof Core.buildRequest !== "function" ||

        typeof Core.callAI !== "function"

    ) {

        throw new Error(

            "AI Core unavailable."

        );

    }

    /*----------------------------------
      Build Request
    ----------------------------------*/

    const request =

        await Core.buildRequest(

            question.trim()

        );

    /*----------------------------------
      Execute Through Core
    ----------------------------------*/

    return await Core.callAI(

        request

    );

};/*=========================================================
 SEARCH
=========================================================*/

AI.search = async function (

    query

) {

    AI.init();

    throw new Error(

        "AI.search() not implemented."

    );

};

/*=========================================================
 EMBEDDINGS
=========================================================*/

AI.embed = async function (

    text

) {

    AI.init();

    throw new Error(

        "AI.embed() not implemented."

    );

};
/*=========================================================
 DETECT INTENT
=========================================================*/

/*=========================================================
 DETECT INTENT
=========================================================*/

AI.detectIntent = async function (

    request = {}

) {

    AI.init();

    try {

        console.group(

            "🧠 AI.detectIntent"

        );

        console.log(

            "Request:",

            request

        );


        /*=================================================
          VALIDATE REQUEST
        =================================================*/

        if (

            !request ||

            typeof request !== "object" ||

            Array.isArray(

                request

            )

        ) {

            throw new Error(

                "Invalid AI intent request."

            );

        }


        if (

            typeof request.query !== "string" ||

            !request.query.trim()

        ) {

            throw new Error(

                "AI intent query is required."

            );

        }


        /*=================================================
          BUSINESS REGISTRY

          This is the authoritative runtime registry.

          Gemini may SELECT from this registry.

          Gemini may NOT create new values.
        =================================================*/

        const business =

            GG.BusinessRegistry;


        if (

            !business ||

            typeof business !== "object"

        ) {

            throw new Error(

                "BusinessRegistry unavailable."

            );

        }


        const domains =

            Array.isArray(

                business.domains

            )

                ? Array.from(

                    business.domains

                )

                : [];


        const intents =

            Array.isArray(

                business.intents

            )

                ? Array.from(

                    business.intents

                )

                : [];


        const entityTypes =

            Array.isArray(

                business.entityTypes

            )

                ? Array.from(

                    business.entityTypes

                )

                : [];


        if (

            !domains.length

        ) {

            throw new Error(

                "BusinessRegistry contains no domains."

            );

        }


        if (

            !intents.length

        ) {

            throw new Error(

                "BusinessRegistry contains no intents."

            );

        }


        /*=================================================
          BUILD RUNTIME RULES
        =================================================*/

        const rules = {

            classifyOnly:

                true,

            allowNewDomain:

                false,

            allowNewIntent:

                false,

            allowNewEntityType:

                false,

            allowReasoning:

                false

        };


        /*=================================================
          EXTRACT LOCAL ENTITIES

          Preserve entities already found by the local
          deterministic extraction layer.
        =================================================*/

        const extractedEntities =

            request.extractedEntities &&

            typeof request.extractedEntities === "object"

                ? request.extractedEntities

                : request.localIntent?.entities &&

                  typeof request.localIntent.entities === "object"

                    ? request.localIntent.entities

                    : {};


        /*=================================================
          NORMALIZED QUERY
        =================================================*/

        const normalizedQuery =

            request.normalizedQuery ||

            request.query

                .trim()

                .toUpperCase();


        /*=================================================
          BUILD FRONTEND AI INTENT REQUEST
        =================================================*/

        const intentRequest = {

            query:

                request.query.trim(),

            normalizedQuery:

                normalizedQuery,

            localIntent:

                request.localIntent &&

                typeof request.localIntent === "object"

                    ? request.localIntent

                    : {},

            extractedEntities:

                extractedEntities,

            business: {

                domains:

                    domains,

                intents:

                    intents,

                entityTypes:

                    entityTypes

            },

            rules:

                rules

        };


        /*=================================================
          BUILD SEMANTIC PROMPT

          AIIntentPrompt.build() adds semantic definitions
          from StaffIntentDefinitions.

          Example:

          staffProfile
          Definition: General identity/profile...

          staffContact
          Definition: Contact/call/reach/communicate...
        =================================================*/

        if (

            GG.AIIntentPrompt &&

            typeof GG.AIIntentPrompt.build ===

                "function"

        ) {

            intentRequest.prompt =

                GG.AIIntentPrompt.build(

                    intentRequest

                );

        }


        /*=================================================
          DEBUG

          Useful while testing.
        =================================================*/

        console.log(

            "Business Registry:",

            {

                domains:

                    domains.length,

                intents:

                    intents.length,

                entityTypes:

                    entityTypes.length

            }

        );


        console.log(

            "Intent Request:",

            intentRequest

        );


        /*=================================================
          CALL CLOUD FUNCTION

          IMPORTANT:

          Send the COMPLETE request.

          Do NOT reduce this back to only:
          {
              query,
              localIntent
          }
console.log(
    "🚀 FINAL CLOUD INTENT PAYLOAD:",
    intentRequest
);

console.log(
    "🚀 BUSINESS SENT:",
    intentRequest.business
);

console.log(
    "🚀 DOMAINS SENT:",
    intentRequest.business?.domains
);

console.log(
    "🚀 INTENTS SENT:",
    intentRequest.business?.intents
);

console.log(
    "🚀 INTENT COUNT:",
    intentRequest.business?.intents?.length
);
        =================================================*/

        const response =

            await window.callAI(

                intentRequest,

                "DETECT_INTENT"

            );


        console.log(

            "Raw Response:",

            response

        );


        /*=================================================
          VALIDATE RESPONSE STRUCTURE
        =================================================*/

        if (

            !AI.validateResponse(

                response

            )

        ) {

            throw new Error(

                "Invalid AI response."

            );

        }


        /*=================================================
          FRONTEND REGISTRY ENFORCEMENT

          Even though the backend also validates the
          registry, enforce it again before allowing
          the intent into IntentManager.

          This provides defense in depth.
        =================================================*/

        const canonicalDomain =

            domains.find(

                function (

                    domain

                ) {

                    return (

                        String(

                            domain

                        ).toLowerCase() ===

                        String(

                            response.domain

                        ).toLowerCase()

                    );

                }

            );


        const canonicalIntent =

            intents.find(

                function (

                    intent

                ) {

                    return (

                        String(

                            intent

                        ).toLowerCase() ===

                        String(

                            response.intent

                        ).toLowerCase()

                    );

                }

            );


        /*=================================================
          REJECT INVENTED DOMAIN
        =================================================*/

        if (

            !canonicalDomain

        ) {

            throw new Error(

                "AI returned unregistered domain: " +

                response.domain

            );

        }


        /*=================================================
          REJECT INVENTED INTENT
        =================================================*/

        if (

            !canonicalIntent

        ) {

            throw new Error(

                "AI returned unregistered intent: " +

                response.intent

            );

        }


        /*=================================================
          FORCE EXACT CANONICAL VALUES

          Example:

          Gemini:
              STAFFCONTACT

          Runtime:
              staffContact

          Result:
              staffContact

          But:

          Gemini:
              staffCommunicationInfo

          Result:
              REJECTED

          No semantic alias is invented here.
        =================================================*/

        response.domain =

            canonicalDomain;


        response.intent =

            canonicalIntent;


        /*=================================================
          NORMALIZE
        =================================================*/

        const normalized =

            AI.normalizeIntent(

                response

            );


        /*=================================================
          FINAL CANONICAL SAFETY CHECK
        =================================================*/

        normalized.domain =

            canonicalDomain;


        normalized.intent =

            canonicalIntent;


        console.log(

            "Normalized:",

            normalized

        );


        console.groupEnd();


        return normalized;

    }

    catch (

        err

    ) {

        console.error(

            "AI.detectIntent:",

            err

        );


        console.groupEnd();


        return {

            success:

                false,

            source:

                "ai",

            provider:

                AI.PROVIDER,

            domain:

                "unknown",

            intent:

                "unknown",

            confidence:

                0,

            entities:

                {},

            raw:

                err.message

        };

    }

};
/*=========================================================
 SUMMARIZE
=========================================================*/

AI.summarize = async function (

    data

) {

    AI.init();

    throw new Error(

        "AI.summarize() not implemented."

    );

};

/*=========================================================
 BUILD INTENT PROMPT
=========================================================*/


/*=========================================================
 CALL API
=========================================================*/

/*=========================================================
 CALL API
=========================================================*/

/*=========================================================
 VALIDATE RESPONSE
=========================================================*/

AI.validateResponse = function (

    response

) {

    if (

        !response ||

        typeof response !== "object"

    ) {

        return false;

    }

    if (

        typeof response.intent !== "string"

    ) {

        return false;

    }

    if (

        typeof response.domain !== "string"

    ) {

        return false;

    }

    if (

        typeof response.entities !== "object"

    ) {

        return false;

    }

    if (

        typeof response.confidence !== "number"

    ) {

        return false;

    }

    return true;

};

/*=========================================================
 NORMALIZE INTENT
=========================================================*/

AI.normalizeIntent = function (

    response

) {

    return {

        success:

            response.success !== false,

        source:

            response.source ||

            "ai",

        provider:

            response.provider ||

            AI.PROVIDER,

      domain:

    response.domain ||

    GG.Config
        .ROUTER
        .DEFAULT_DOMAIN,

        intent:

            response.intent ||

            "unknown",

        entities:

            response.entities ||

            {},

        confidence:

            Number(

                response.confidence || 0

            ),

        raw:

            response.raw ||

            null

    };

};

/*=========================================================
 REGISTER
=========================================================*/

GG.AI = AI;

if (

    GG.Config?.DEBUG?.ENABLED

) {

    console.log(

        "%cGreenGuard AI Provider Loaded",

        "color:#0066ff;font-weight:bold;"

    );

}

})(window);
