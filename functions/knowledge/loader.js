"use strict";

const fs = require("fs");
const path = require("path");

const Loader = {};

/*----------------------------------------------------------
Supported extensions
----------------------------------------------------------*/

Loader.extensions = [

    ".pdf",

    ".txt",

    ".md"

];

/*----------------------------------------------------------
List Documents
----------------------------------------------------------*/

Loader.list = function (

    directory

) {

    if (

        !fs.existsSync(

            directory

        )

    ) {

        return [];

    }

    return fs

        .readdirSync(

            directory

        )

        .filter(file =>

            Loader.extensions.includes(

                path.extname(file)

                    .toLowerCase()

            )

        )

        .map(file => ({

            name: file,

            path:

                path.join(

                    directory,

                    file

                )

        }));

};

/*----------------------------------------------------------
Read Text File
----------------------------------------------------------*/

Loader.readText = function (

    file

) {

    return fs.readFileSync(

        file,

        "utf8"

    );

};

/*----------------------------------------------------------
Load
----------------------------------------------------------*/

Loader.load = function (

    directory

) {

    const docs =

        Loader.list(

            directory

        );

    const result = [];

    for (

        const doc of docs

    ) {

        result.push({

            name:

                doc.name,

            path:

                doc.path

        });

    }

    return result;

};

module.exports = Loader;