"use strict";

/*
-------------------------------------------------------
GreenGuard AI Tool Registry
-------------------------------------------------------
Every tool module exports:

module.exports = {

    tools : [ ... ]

};

The registry automatically merges all tool definitions.

Only this file needs updating when a completely new
tool module (not a new tool inside an existing module)
is introduced.
-------------------------------------------------------
*/

const Staff =
require("./tools/staff");

const Patrol =
require("./tools/patrol");

const GIS =
require("./tools/gis");

const Analytics =
require("./tools/analytics");

/*
Future modules

const Wildlife =
require("./tools/wildlife");

const Reports =
require("./tools/reports");

const Weather =
require("./tools/weather");

const Court =
require("./tools/court");

const Research =
require("./tools/research");
*/

const Modules = [

    Staff,

    Patrol,

    GIS,

    Analytics

];

/*
-------------------------------------------------------
Return merged OpenAI tool definitions
-------------------------------------------------------
*/

function getTools() {

    const tools = [];

    for (const module of Modules) {

        if (

            !module ||

            !Array.isArray(module.tools)

        ) {

            continue;

        }

        for (const tool of module.tools) {

            if (

                tool &&

                tool.type === "function"

            ) {

                tools.push(tool);

            }

        }

    }

    return tools;

}

/*
-------------------------------------------------------
Return tool names
Useful for debugging
-------------------------------------------------------
*/

function getToolNames() {

    return getTools().map(

        t =>

        t.function.name

    );

}

/*
-------------------------------------------------------
Find tool by name
-------------------------------------------------------
*/

function find(name) {

    return getTools().find(

        t =>

        t.function.name === name

    );

}

/*
-------------------------------------------------------
Tool exists?
-------------------------------------------------------
*/

function has(name) {

    return !!find(name);

}

/*
-------------------------------------------------------
Export
-------------------------------------------------------
*/

module.exports = {

    getTools,

    getToolNames,

    find,

    has

};