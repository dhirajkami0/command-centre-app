"use strict";

const fs = require("fs");
const path = require("path");
const pdf = require("pdf-parse");

const OpenAIService =
require("../services/openai");

const Loader =
require("../knowledge/loader");

const Chunker =
require("../knowledge/chunker");

const Embeddings =
require("../knowledge/embeddings");

const VectorStore =
require("../knowledge/vectorStore");

const Manifest =
require("../knowledge/manifest");

const DOCUMENTS_DIR =
path.join(
    __dirname,
    "..",
    "documents"
);

const VECTOR_FILE =
path.join(
    __dirname,
    "..",
    "knowledge",
    "vectorStore.json"
);

/*----------------------------------------------------------
Read Document
----------------------------------------------------------*/

async function readDocument(file){

    const ext =
    path.extname(file.path)
    .toLowerCase();

    if(ext === ".pdf"){

        const buffer =
        fs.readFileSync(file.path);

        const parsed =
        await pdf(buffer);

        return parsed.text;

    }

    return Loader.readText(
        file.path
    );

}

/*----------------------------------------------------------
Remove Old Vectors
----------------------------------------------------------*/

function removeVectors(documentName){

    VectorStore.store =
    VectorStore.store.filter(

        item =>

        item.document !==

        documentName

    );

}

/*----------------------------------------------------------
Build Knowledge
----------------------------------------------------------*/

async function ingest(apiKey){

    console.log("");

    console.log(
        "========== KNOWLEDGE BUILD =========="
    );

    const client =
    OpenAIService.createClient(
        apiKey
    );

    Manifest.load();

    VectorStore.load(
        VECTOR_FILE
    );

    const docs =
    Loader.load(
        DOCUMENTS_DIR
    );

    Manifest.clean(
        docs
    );

    let processed = 0;

    let skipped = 0;

    for(

        const doc of docs

    ){

        if(

            !Manifest.hasChanged(

                doc.path

            )

        ){

            console.log(

                "✓ Skip",

                doc.name

            );

            skipped++;

            continue;

        }

        console.log(

            "→ Index",

            doc.name

        );

        const text =
        await readDocument(
            doc
        );

        const chunks =
        Chunker.chunk(
            text
        );

        const embedded =
        await Embeddings.embedBatch(

            client,

            chunks

        );

        removeVectors(
            doc.name
        );

        for(

            const chunk of embedded

        ){

            VectorStore.add([{

                document:
                    doc.name,

                chunk:
                    chunk.id,

                text:
                    chunk.text,

                embedding:
                    chunk.embedding

            }]);

        }

        Manifest.update(

            doc.path,

            embedded.length

        );

        processed++;

    }

    Manifest.save();

    VectorStore.save(
        VECTOR_FILE
    );

    console.log("");

    console.log(
        "Processed:",
        processed
    );

    console.log(
        "Skipped:",
        skipped
    );

    console.log(
        "Vectors:",
        VectorStore.count()
    );

    console.log("");

    console.log(
        "Knowledge Build Complete"
    );

}

module.exports = ingest;