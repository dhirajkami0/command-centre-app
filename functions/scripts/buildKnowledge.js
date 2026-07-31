"use strict";

const path = require("path");

const ingest = require("./ingest");

require("dotenv").config({

    path: path.join(

        __dirname,

        "..",

        ".env"

    )

});

async function main() {

    const apiKey =

        process.env.OPENAI_API_KEY;

    if (!apiKey) {

        throw new Error(

            "OPENAI_API_KEY missing in .env"

        );

    }

    await ingest(apiKey);

    console.log("");

    console.log("Knowledge Base Built Successfully.");

}

main()

.catch(console.error);