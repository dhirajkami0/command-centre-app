"use strict";

module.exports = [

    {
        type: "function",
        function: {
            name: "getProfile",
            description: "Get logged in user profile.",
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
            name: "getDuty",
            description: "Get current duty status.",
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
            name: "getLiveStaff",
            description: "Get live staff list.",
            parameters: {
                type: "object",
                properties: {},
                additionalProperties: false
            }
        }
    }

];