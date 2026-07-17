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

AI.detectIntent = async function (

    request = {}

) {
    AI.init();

    try {

        /*----------------------------------
          Build Prompt
        ----------------------------------*/

const prompt =
    AIIntentPrompt.build(request);
        /*----------------------------------
          Call API
        ----------------------------------*/

        const response =

            await AI.callAPI(

                prompt

            );

        /*----------------------------------
          Validate
        ----------------------------------*/

        if (

            !AI.validateResponse(

                response

            )

        ) {

            throw new Error(

                "Invalid AI response."

            );

        }

        /*----------------------------------
          Normalize
        ----------------------------------*/

        return AI.normalizeIntent(

            response

        );

    }

    catch (err) {

        console.error(

            err

        );

        throw err;

    }

};
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

AI.buildIntentPrompt = function (

    query,

    localIntent = null

) {

    return {

        type: "intent",

        question:

            String(

                query || ""

            ).trim(),

        localIntent:

            localIntent

    };

};
/*=========================================================
 CALL API
=========================================================*/

/*=========================================================
 CALL API
=========================================================*/

AI.callAPI = async function (prompt) {

    console.log("AI Prompt:");
    console.log(prompt);

    const response = await fetch(

        GG.Config.API.DETECT_INTENT,

        {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                prompt: prompt

            })

        }

    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(

            data.error ||

            "Detect Intent API failed."

        );

    }

    if (data.success === false) {

        throw new Error(

            data.error ||

            "AI request failed."

        );

    }

    return data;

};
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
