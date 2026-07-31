"use strict";

/*=========================================================
 NORMALIZE AI ANSWER
=========================================================*/

function normalizeAnswer(

    answer

) {

    return {

        success:

            answer.success !== false,

        source:

            "ai",

        provider:

            answer.provider ||

            "OpenAI",

        domain:

            answer.domain ||

            "general",

        answer:

            answer.answer ||

            "",

        confidence:

            Number(

                answer.confidence || 0

            ),

        citations:

            answer.citations ||

            [],

        suggestions:

            answer.suggestions ||

            [],

        metadata:

            answer.metadata ||

            {},

        raw:

            answer

    };

}

/*=========================================================
 EXPORTS
=========================================================*/

module.exports = {

    normalizeAnswer

};