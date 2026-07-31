"use strict";

const Embeddings =
require("./embeddings");

const VectorStore =
require("./vectorStore");

const Retriever = {};

/*----------------------------------------------------------
Configuration
----------------------------------------------------------*/

Retriever.DEFAULT_TOP_K = 5;

/*----------------------------------------------------------
Retrieve
----------------------------------------------------------*/

Retriever.retrieve = async function (

    client,

    query,

    options = {}

) {

    const topK =

        options.topK ||

        Retriever.DEFAULT_TOP_K;

    const embedding =

        await Embeddings.embed(

            client,

            query

        );

    const matches =

        VectorStore.search(

            embedding,

            Embeddings.cosineSimilarity,

            topK

        );

    return matches;

};

/*----------------------------------------------------------
Build Context
----------------------------------------------------------*/

Retriever.buildContext = function (

    matches = []

) {

    if (

        !matches.length

    ) {

        return "";

    }

    const parts = [];

    for (

        const item of matches

    ) {

        parts.push(

            [
                "DOCUMENT: " +

                (item.document ||

                 "Unknown"),

                "CHUNK: " +

                (item.chunk ||

                 item.id ||

                 ""),

                "SCORE: " +

                Number(

                    item.score ||

                    0

                ).toFixed(4),

                "",

                item.text ||

                ""

            ].join("\n")

        );

    }

    return parts.join(

        "\n\n----------------------------------------\n\n"

    );

};

/*----------------------------------------------------------
Retrieve + Context
----------------------------------------------------------*/

Retriever.retrieveContext = async function (

    client,

    query,

    options = {}

) {

    const matches =

        await Retriever.retrieve(

            client,

            query,

            options

        );

    return {

        matches,

        context:

            Retriever.buildContext(

                matches

            )

    };

};

/*----------------------------------------------------------
Debug
----------------------------------------------------------*/

Retriever.debug = async function (

    client,

    query

) {

    const result =

        await Retriever.retrieveContext(

            client,

            query

        );

    console.log(

        "\n========== RAG ==========\n"

    );

    console.log(

        result.context

    );

    console.log(

        "\n=========================\n"

    );

    return result;

};

module.exports = Retriever;