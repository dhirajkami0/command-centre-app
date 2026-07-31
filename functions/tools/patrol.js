"use strict";

module.exports = [

{
    type: "function",
    function: {

        name: "getPatrol",

        description:
            "Get current patrol summary.",

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

        name: "predictPatrolPriority",

        description:
            "Recommend patrol priority areas using analytics and GIS.",

        parameters: {

            type: "object",

            properties: {},

            additionalProperties: false

        }

    }

}

];