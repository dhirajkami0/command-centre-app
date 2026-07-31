"use strict";

/*=========================================================
  IMPORTS
=========================================================*/

const {

    createGeminiClient

} = require("./client");

const {

    GENERAL_SYSTEM_PROMPT

} = require("./systemPrompt");

const {

    validateAnswer

} = require("./answerValidator");

const {

    normalizeAnswer

} = require("./answerNormalize");

/*=========================================================
  MODEL
=========================================================*/

const MODEL =

    process.env.GEMINI_MODEL ||

    "gemini-2.5-flash";

/*=========================================================
  BUILD PROMPT
=========================================================*/

function buildPrompt(

    question,

    context = ""

) {

    return `SYSTEM INSTRUCTIONS

${GENERAL_SYSTEM_PROMPT}

----------------------------------------

CONTEXT

${context || "No additional context provided."}

----------------------------------------

USER REQUEST

${question}`;

}

/*=========================================================
  RETRIEVE CONTEXT
=========================================================*/

async function retrieveContext(

    question

) {

    /*
        Phase 5

        RAG

        Knowledge Base

        Firestore

        Vector Search
    */

    return "";

}

/*=========================================================
  ASK
=========================================================*/

async function ask(

    question

) {

    if (

        typeof question !== "string" ||

        !question.trim()

    ) {

        throw new Error(

            "Question is required."

        );

    }

    try {

        /*----------------------------------
          Gemini Client
        ----------------------------------*/

        const client =

            createGeminiClient();

        /*----------------------------------
          Retrieve Context
        ----------------------------------*/

        const context =

            await retrieveContext(

                question

            );

        /*----------------------------------
          Build Prompt
        ----------------------------------*/

        const prompt =

            buildPrompt(

                question.trim(),

                context

            );

        /*----------------------------------
          Gemini
        ----------------------------------*/

        const response =

            await client.models.generateContent({

                model:

                    MODEL,

                contents:

                    prompt

            });

        /*----------------------------------
          Extract Answer
        ----------------------------------*/

        const answer =

            typeof response.text === "function"

                ? response.text()

                : response.text;

        if (

            !answer ||

            typeof answer !== "string"

        ) {

            throw new Error(

                "Empty Gemini response."

            );

        }

        /*----------------------------------
          Build Result
        ----------------------------------*/

        const result = {

            provider:

                "Gemini",

            domain:

                "general",

            answer:

                answer.trim(),

            confidence:

                1

        };

        /*----------------------------------
          Validate
        ----------------------------------*/

        if (

            !validateAnswer(

                result

            )

        ) {

            throw new Error(

                "Invalid AI answer."

            );

        }

        /*----------------------------------
          Normalize
        ----------------------------------*/

        return normalizeAnswer(

            result

        );

    }

    catch (

        err

    ) {

        console.error(

            "[Gemini Ask]",

            err

        );

        throw err;

    }

}

/*=========================================================
  EXPORTS
=========================================================*/

module.exports = {

    ask,

    retrieveContext,

    buildPrompt

};