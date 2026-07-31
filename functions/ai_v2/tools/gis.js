"use strict";

/*
==========================================================
 GreenGuard AI v2
 GIS Module
==========================================================
*/

const Registry =
require("../registry");

const GISModule = {

    id: "gis",

    version: "2.0.0",

    description:
        "GIS, map and location related AI tools.",

    tools: [

        {
            type: "function",
            function: {

                name: "getGIS",

                description:
                    "Get the current GIS context including division, range, beat, compartment and map selection.",

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

                description:
                    "Get the current GPS location of the logged in officer.",

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

                description:
                    "Return the currently selected Division, Range, Beat or Compartment on the operational map.",

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

                description:
                    "Return the current operational map including staff, sightings, patrol tracks and GIS layers.",

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

                description:
                    "Calculate the area of a Division, Range, Beat or Compartment.",

                parameters: {

                    type: "object",

                    properties: {

                        name: {

                            type: "string",

                            description:
                                "Division, Range, Beat or Compartment name."

                        }

                    },

                    required: [

                        "name"

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

    GISModule

);

module.exports =

GISModule;