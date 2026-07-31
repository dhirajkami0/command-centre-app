"use strict";

const Chunker = {};

/*----------------------------------------------------------
Configuration
----------------------------------------------------------*/

Chunker.DEFAULT_CHUNK_SIZE = 1200;

Chunker.DEFAULT_OVERLAP = 200;

/*----------------------------------------------------------
Normalize Text
----------------------------------------------------------*/

Chunker.normalize = function (text = "") {

    return String(text)

        .replace(/\r/g, "")

        .replace(/\t/g, " ")

        .replace(/\n{3,}/g, "\n\n")

        .replace(/[ ]{2,}/g, " ")

        .trim();

};

/*----------------------------------------------------------
Split Into Paragraphs
----------------------------------------------------------*/

Chunker.paragraphs = function (text = "") {

    return Chunker

        .normalize(text)

        .split(/\n\s*\n/)

        .map(p => p.trim())

        .filter(Boolean);

};

/*----------------------------------------------------------
Chunk
----------------------------------------------------------*/

Chunker.chunk = function (

    text,

    options = {}

) {

    const chunkSize =

        options.chunkSize ||

        Chunker.DEFAULT_CHUNK_SIZE;

    const overlap =

        options.overlap ||

        Chunker.DEFAULT_OVERLAP;

    const paragraphs =

        Chunker.paragraphs(text);

    const chunks = [];

    let buffer = "";

    let index = 0;

    for (

        const paragraph of paragraphs

    ) {

        if (

            (buffer + "\n\n" + paragraph)

            .length <= chunkSize

        ) {

            if (buffer.length) {

                buffer += "\n\n";

            }

            buffer += paragraph;

            continue;

        }

        if (

            buffer.length

        ) {

            chunks.push({

                id:

                    ++index,
