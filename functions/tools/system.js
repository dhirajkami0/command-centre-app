"use strict";

module.exports = [

{
    type: "function",
    function: {

        name: "runDiagnostics",

        description:
            "Run complete GreenGuard AI diagnostics.",

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

        name: "systemHealth",

        description:
            "Return health of all GreenGuard AI modules.",

        parameters: {

            type: "object",

            properties: {},

            additionalProperties: false

        }

    }

}

];