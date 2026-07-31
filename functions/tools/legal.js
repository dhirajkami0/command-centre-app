"use strict";

module.exports = [

{
    type: "function",
    function: {

        name: "searchLegal",

        description:
            "Search Wildlife Protection Act, Indian Forest Act, Forest Conservation Act and related legal provisions.",

        parameters: {

            type: "object",

            properties: {

                query: {

                    type: "string",

                    description:
                        "Legal question."

                }

            },

            required: [

                "query"

            ],

            additionalProperties: false

        }

    }

},

{
    type: "function",
    function: {

        name: "searchCourtCases",

        description:
            "Search important forest and wildlife court judgements.",

        parameters: {

            type: "object",

            properties: {

                query: {

                    type: "string",

                    description:
                        "Court case search."

                }

            },

            required: [

                "query"

            ],

            additionalProperties: false

        }

    }

},

{
    type: "function",
    function: {

        name: "searchResearch",

        description:
            "Search wildlife, ecology and conservation research papers.",

        parameters: {

            type: "object",

            properties: {

                query: {

                    type: "string",

                    description:
                        "Research topic."

                }

            },

            required: [

                "query"

            ],

            additionalProperties: false

        }

    }

}

];