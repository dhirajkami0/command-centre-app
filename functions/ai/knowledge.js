"use strict";

/*
==========================================================
 GreenGuard AI Knowledge Engine
==========================================================
*/

const path = require("path");

const Retriever =
require("../knowledge/retriever");

const VectorStore =
require("../knowledge/vectorStore");

const Knowledge = {};

Knowledge.initialized = false;

/*----------------------------------------------------------
Initialize
----------------------------------------------------------*/

Knowledge.init = function () {

    if (

        Knowledge.initialized

    ) {

        return;

    }

    const file = path.join(

        __dirname,

        "..",

        "knowledge",

        "vectorStore.json"

    );

    VectorStore.load(

        file

    );

    Knowledge.initialized = true;

};

/*----------------------------------------------------------
Search
----------------------------------------------------------*/

Knowledge.search = async function (

    client,

    query,

    options = {}

) {

    Knowledge.init();

    const result =

        await Retriever.retrieveContext(

            client,

            query,

            options

        );

    return {

        success: true,

        query,

        matches:

            result.matches,

        context:

            result.context

    };

};

/*----------------------------------------------------------
Has Knowledge
----------------------------------------------------------*/

Knowledge.hasKnowledge = function (

    result

) {

    return (

        result &&

        result.matches &&

        result.matches.length > 0

    );

};

/*----------------------------------------------------------
Build Prompt
----------------------------------------------------------*/

Knowledge.buildPrompt = function (

    systemPrompt,

    question,

    knowledgeContext

) {

    return [

        {

            role: "system",

            content:

                systemPrompt

        },

        {

            role: "system",

            content:

                "Use the following retrieved knowledge to answer accurately.\n\n" +

                knowledgeContext

        },

        {

            role: "user",

            content:

                question

        }

    ];

};

/*----------------------------------------------------------
Debug
----------------------------------------------------------*/

Knowledge.debug = async function (

    client,

    query

) {

    const result =

        await Knowledge.search(

            client,

            query

        );

    console.log(

        "\n========== KNOWLEDGE ==========\n"

    );

    console.log(

        result.context

    );

    console.log(

        "\n===============================\n"

    );

    return result;

};

module.exports = Knowledge;