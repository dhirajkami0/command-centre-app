"use strict";

/*
==========================================================
 GreenGuard AI Executor
==========================================================
*/

const Executor = {};

/*
----------------------------------------------------------
Normalize Tool Calls
----------------------------------------------------------
*/

Executor.normalize = function (toolCalls = []) {

    const list = [];
    const seen = {};

    for (const call of toolCalls) {

        if (!call) continue;

        const name = String(call.name || "").trim();

        if (!name) continue;

        const args =
            call.arguments || {};

        const key =
            name +
            ":" +
            JSON.stringify(args);

        if (seen[key]) {
            continue;
        }

        seen[key] = true;

        list.push({

            id:
                call.id ||

                null,

            name,

            arguments: args

        });

    }

    return list;

};

/*
----------------------------------------------------------
Build Execution Plan
----------------------------------------------------------
*/

Executor.plan = function (toolCalls = []) {

    return Executor
        .normalize(toolCalls)
        .map((call, index) => ({

            step: index + 1,

            id: call.id,

            tool: call.name,

            arguments: call.arguments,

            status: "pending"

        }));

};

/*
----------------------------------------------------------
Merge Tool Results
----------------------------------------------------------
*/

Executor.mergeResults = function (toolResults = {}) {

    const merged = [];

    for (const key of Object.keys(toolResults)) {

        merged.push({

            tool: key,

            result: toolResults[key]

        });

    }

    return merged;

};

/*
----------------------------------------------------------
Build OpenAI Payload
----------------------------------------------------------
*/

Executor.buildPayload = function (query, toolResults) {

    return {

        query,

        tools:

        Executor.mergeResults(

            toolResults

        )

    };

};

module.exports = Executor;