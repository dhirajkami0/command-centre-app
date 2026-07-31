"use strict";

const {

    GoogleGenAI

} = require("@google/genai");

const {

    defineSecret

} = require("firebase-functions/params");

const GEMINI_API_KEY =

    defineSecret(

        "GEMINI_API_KEY"

    );

function createGeminiClient() {

    return new GoogleGenAI({

        apiKey:

            GEMINI_API_KEY.value()

    });

}

module.exports = {

    GEMINI_API_KEY,

    createGeminiClient

};