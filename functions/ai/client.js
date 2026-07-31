"use strict";

/*=========================================================
  GEMINI
=========================================================*/

const {
    GoogleGenAI
} = require("@google/genai");

/*=========================================================
  FIREBASE SECRETS
=========================================================*/

const {
    defineSecret
} = require("firebase-functions/params");

/*=========================================================
  GEMINI SECRET
=========================================================*/

const GEMINI_API_KEY =
    defineSecret(
        "GEMINI_API_KEY"
    );

/*=========================================================
  GEMINI CLIENT
=========================================================*/

function createGeminiClient() {

    const key =
        GEMINI_API_KEY.value();

    if (!key) {

        throw new Error(
            "GEMINI_API_KEY is not configured."
        );

    }

    return new GoogleGenAI({

        apiKey: key

    });

}

/*=========================================================
  EXPORTS
=========================================================*/

module.exports = {

    GEMINI_API_KEY,

    createGeminiClient

};