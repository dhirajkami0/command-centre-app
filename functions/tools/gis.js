"use strict";

module.exports = [

{
    type: "function",
    function: {
        name: "getGIS",
        description: "Get current GIS selection.",
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
        name: "getLocation",
        description: "Get current GPS location.",
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
        name: "getSelection",
        description: "Get selected division, range, beat or compartment.",
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
        name: "getMapData",
        description: "Get current operational map data.",
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
        name: "getArea",
        description: "Calculate area of a division, range, beat or compartment.",
        parameters: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "Division, Range, Beat or Compartment name."
                }
            },
            required: ["name"],
            additionalProperties: false
        }
    }
}

];