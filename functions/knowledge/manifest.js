"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const Manifest = {};

Manifest.FILE = path.join(
    __dirname,
    "manifest.json"
);

Manifest.data = {};

/*----------------------------------------------------------
Load Manifest
----------------------------------------------------------*/

Manifest.load = function () {

    if (!fs.existsSync(Manifest.FILE)) {

        Manifest.data = {};

        return Manifest.data;

    }

    try {

        Manifest.data = JSON.parse(
            fs.readFileSync(
                Manifest.FILE,
                "utf8"
            )
        );

    } catch (e) {

        Manifest.data = {};

    }

    return Manifest.data;

};

/*----------------------------------------------------------
Save Manifest
----------------------------------------------------------*/

Manifest.save = function () {

    fs.writeFileSync(
        Manifest.FILE,
        JSON.stringify(
            Manifest.data,
            null,
            2
        )
    );

};

/*----------------------------------------------------------
Hash File
----------------------------------------------------------*/

Manifest.hashFile = function (

    filePath

) {

    const buffer =
        fs.readFileSync(filePath);

    return crypto
        .createHash("sha256")
        .update(buffer)
        .digest("hex");

};

/*----------------------------------------------------------
Has Changed
----------------------------------------------------------*/

Manifest.hasChanged = function (

    filePath

) {

    const hash =
        Manifest.hashFile(
            filePath
        );

    const key =
        path.basename(filePath);

    return (

        !Manifest.data[key] ||

        Manifest.data[key].hash !== hash

    );

};

/*----------------------------------------------------------
Update File
----------------------------------------------------------*/

Manifest.update = function (

    filePath,

    chunkCount = 0

) {

    const key =
        path.basename(filePath);

    Manifest.data[key] = {

        hash:
            Manifest.hashFile(
                filePath
            ),

        updated:
            new Date().toISOString(),

        chunks:
            chunkCount

    };

};

/*----------------------------------------------------------
Remove Deleted Files
----------------------------------------------------------*/

Manifest.clean = function (

    existingFiles = []

) {

    const keep =
        existingFiles.map(f =>
            path.basename(f.path)
        );

    for (

        const key of Object.keys(
            Manifest.data
        )

    ) {

        if (

            !keep.includes(key)

        ) {

            delete Manifest.data[key];

        }

    }

};

/*----------------------------------------------------------
Get Info
----------------------------------------------------------*/

Manifest.get = function (

    fileName

) {

    return (

        Manifest.data[fileName] ||

        null

    );

};

/*----------------------------------------------------------
Reset
----------------------------------------------------------*/

Manifest.reset = function () {

    Manifest.data = {};

};

/*----------------------------------------------------------
Statistics
----------------------------------------------------------*/

Manifest.stats = function () {

    return {

        documents:

            Object.keys(

                Manifest.data

            ).length,

        files:

            Manifest.data

    };

};

module.exports = Manifest;