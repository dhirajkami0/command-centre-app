"use strict";

const TaskPlanner =
require("./taskPlanner");

const Workflow = {};

/*----------------------------------------------------------
Build Workflow
----------------------------------------------------------*/

Workflow.build = function (

    route = {},

    planner = {}

) {

    const query =

        planner.query ||

        "";

    const tasks =

        TaskPlanner.build(

            query

        );

    const steps = [];

    const add = function (

        type,

        tool,

        priority = 100

    ) {

        if (

            steps.find(

                s =>

                s.tool === tool

            )

        ) {

            return;

        }

        steps.push({

            type,

            tool,

            priority

        });

    };

    /*--------------------------------------
      Multi-step Task Planning
    --------------------------------------*/

    for (

        const task of tasks

    ) {

        switch (

            task

        ) {

            case "getGIS":

                add(

                    "tool",

                    "getGIS",

                    10

                );

                add(

                    "tool",

                    "getArea",

                    11

                );

                break;

            case "getAnalytics":

                add(

                    "tool",

                    "getAnalytics",

                    20

                );

                break;

            case "knowledge":

                add(

                    "knowledge",

                    "rag",

                    30

                );

                break;

            case "getLiveStaff":

                add(

                    "tool",

                    "getProfile",

                    40

                );

                add(

                    "tool",

                    "getDuty",

                    41

                );

                add(

                    "tool",

                    "getLiveStaff",

                    42

                );

                break;

            case "generateReport":

                add(

                    "tool",

                    "generateMonthlyReport",

                    50

                );

                break;

        }

    }

    /*--------------------------------------
      Intent Fallback
    --------------------------------------*/

    if (

        steps.length === 0

    ) {

        switch (

            route.intent

        ) {

            case "staff":

                add(

                    "tool",

                    "getProfile",

                    40

                );

                add(

                    "tool",

                    "getDuty",

                    41

                );

                add(

                    "tool",

                    "getLiveStaff",

                    42

                );

                break;

            case "patrol":

                add(

                    "tool",

                    "getPatrol",

                    20

                );

                break;

            case "analytics":

                add(

                    "tool",

                    "getAnalytics",

                    20

                );

                break;

            case "gis":

                add(

                    "tool",

                    "getGIS",

                    10

                );

                add(

                    "tool",

                    "getArea",

                    11

                );

                break;

            case "wildlife":

                add(

                    "tool",

                    "searchSpecies",

                    30

                );

                add(

                    "knowledge",

                    "rag",

                    31

                );

                break;

            case "legal":

                add(

                    "knowledge",

                    "rag",

                    30

                );

                add(

                    "tool",

                    "searchLegal",

                    31

                );

                break;

            case "knowledge":

                add(

                    "knowledge",

                    "rag",

                    30

                );

                break;

            case "report":

                add(

                    "tool",

                    "generateDailyReport",

                    50

                );

                break;

            case "system":

                add(

                    "tool",

                    "systemHealth",

                    60

                );

                break;

        }

    }

    /*--------------------------------------
      Execution Order
    --------------------------------------*/

    steps.sort(

        (a, b) =>

            a.priority -

            b.priority

    );

    return {

        intent:

            route.intent ||

            "general",

        confidence:

            route.confidence ||

            0,

        planner,

        tasks,

        steps

    };

};

/*----------------------------------------------------------
Need Knowledge
----------------------------------------------------------*/

Workflow.needKnowledge = function (

    workflow

) {

    return workflow.steps.some(

        step =>

        step.type ===

        "knowledge"

    );

};

/*----------------------------------------------------------
Need Tool
----------------------------------------------------------*/

Workflow.needTool = function (

    workflow,

    tool

) {

    return workflow.steps.some(

        step =>

        step.tool === tool

    );

};

/*----------------------------------------------------------
Tool List
----------------------------------------------------------*/

Workflow.tools = function (

    workflow

) {

    return workflow.steps

        .filter(

            step =>

            step.type ===

            "tool"

        )

        .map(

            step =>

            step.tool

        );

};

/*----------------------------------------------------------
Knowledge List
----------------------------------------------------------*/

Workflow.knowledge = function (

    workflow

) {

    return workflow.steps

        .filter(

            step =>

            step.type ===

            "knowledge"

        )

        .map(

            step =>

            step.tool

        );

};

/*----------------------------------------------------------
Debug
----------------------------------------------------------*/

Workflow.debug = function (

    workflow

) {

    console.log("");

    console.log(

        "========== WORKFLOW =========="

    );

    console.log(

        JSON.stringify(

            workflow,

            null,

            2

        )

    );

    console.log(

        "=============================="

    );

};

module.exports = Workflow;