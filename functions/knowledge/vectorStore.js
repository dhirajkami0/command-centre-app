"use strict";

const fs = require("fs");
const path = require("path");

const VectorStore = {};

VectorStore.store = [];

/*----------------------------------------------------------
Load Vector Store
----------------------------------------------------------*/

VectorStore.load = function (

    file

) {

    if (

        !fs.existsSync(file)

    ) {

        VectorStore.store = [];

        return [];

    }

    VectorStore.store =

        JSON.parse(

            fs.readFileSync(

                file,

                "utf8"

            )

        );

    return VectorStore.store;

};

/*----------------------------------------------------------
Save Vector Store
----------------------------------------------------------*/

VectorStore.save = function (

    file

) {

    fs.mkdirSync(

        path.dirname(file),

        {

            recursive: true

        }

    );

    fs.writeFileSync(

        file,

        JSON.stringify(

            VectorStore.store,

            null,

            2

        )

    );

};

/*----------------------------------------------------------
Add Documents
----------------------------------------------------------*/

VectorStore.add = function (

    items = []

) {

    VectorStore.store.push(

        ...items

    );

};

/*----------------------------------------------------------
Clear
----------------------------------------------------------*/

VectorStore.clear = function () {

    VectorStore.store = [];

};

/*----------------------------------------------------------
Get All
----------------------------------------------------------*/

VectorStore.all = function () {

    return VectorStore.store;

};

/*----------------------------------------------------------
Count
----------------------------------------------------------*/

VectorStore.count = function () {

    return VectorStore.store.length;

};

/*----------------------------------------------------------
Top K Similar
----------------------------------------------------------*/

VectorStore.search = function (

    embedding,

    cosineSimilarity,

    topK = 5

) {

    return VectorStore.store

        .map(item => ({

            ...item,

            score:

                cosineSimilarity(

                    embedding,

                    item.embedding

                )

        }))

        .sort(

            (a, b) =>

                b.score -

                a.score

        )

        .slice(

            0,

            topK

        );

};

module.exports = VectorStore;