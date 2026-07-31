"use strict";

module.exports = [

{
    type: "function",
    function: {
        name: "getAnalytics",
        description: "Get patrol analytics.",
        parameters: {
            type: "object",
            properties: {},
            additionalProperties: false
        }
    }
},

{
    type: "function",
    function: {
        name: "getMonthlyStatus",
        description: "Get current monthly patrol statistics including grids, compartments, coverage, area, patrol distance and live staff.",
        parameters: {
            type: "object",
            properties: {},
            additionalProperties: false
        }
    }
},

{
    type: "function",
    function: {
        name: "compareMonths",
        description: "Compare patrol statistics between two months.",
        parameters: {
            type: "object",
            properties: {

                month1: {
                    type: "string"
                },

                month2: {
                    type: "string"
                }

            },

            required: [

                "month1",

                "month2"

            ],

            additionalProperties: false

        }
    }
},

{
    type: "function",
    function: {

        name: "analyticsQuery",

        description:
        "Answer any patrol analytics question including staff, beat, range, division, patrol ranking, coverage, patrol sessions, patrol history and operational statistics.",

        parameters: {

            type: "object",

            properties: {

                query: {

                    type: "string",

                    description:
                    "Analytics question."

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