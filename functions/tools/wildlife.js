"use strict";

module.exports = [

{
    type: "function",
    function: {

        name: "searchSpecies",

        description:
            "Search wildlife species.",

        parameters: {

            type: "object",

            properties: {

                name: {

                    type: "string",

                    description:
                        "Species name"

                }

            },

            required: [

                "name"

            ],

            additionalProperties: false

        }

    }

},

{
    type: "function",
    function: {

        name: "getSightings",

        description:
            "Get current elephant sightings.",

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

        name: "getWeather",

        description:
            "Get current weather.",

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

        name: "getVillages",

        description:
            "Get village database.",

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

        name: "predictElephantMovement",

        description:
            "Predict elephant movement using sightings and GIS.",

        parameters: {

            type: "object",

            properties: {},

            additionalProperties: false

        }

    }

}

];