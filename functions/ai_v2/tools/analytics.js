"use strict";

/*
==========================================================
 GreenGuard AI v2
 Analytics Module
==========================================================
*/

const Registry = require("../registry");

const AnalyticsModule = {

    id: "analytics",

    version: "2.0.0",

    description:
        "Analytics, statistics and reporting tools.",

    tools: [

        {
            type: "function",
            function: {

                name: "getAnalytics",

                description:
                    "Return overall patrol analytics summary.",

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

                name: "analyticsQuery",

                description:
                    "Answer any analytics question using GreenGuard Analytics Engine.",

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
        },

        {
            type: "function",
            function: {

                name: "getMonthlyStatus",

                description:
                    "Return monthly patrol status including grids, coverage, patrol distance, staff and compartments.",

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

                description:
                    "Compare patrol statistics between two months.",

                parameters: {

                    type: "object",

                    properties: {

                        month1: {

                            type: "string",

                            description:
                                "First month."

                        },

                        month2: {

                            type: "string",

                            description:
                                "Second month."

                        }

                    },

                    required: [

                        "month1",

                        "month2"

                    ],

                    additionalProperties: false

                }

            }
        }

    ]

};

/*
----------------------------------------------------------
Register Module
----------------------------------------------------------
*/

Registry.register(

    AnalyticsModule

);

module.exports = AnalyticsModule;