"use strict";

/*=========================================================
 IMPORTS
=========================================================*/

const {

    GEMINI_API_KEY,

    createGeminiClient

} = require("./client");

/*=========================================================
 INTENT ENGINE
=========================================================*/

const {

    INTENT_PROMPT

} = require("./prompts");

const {

    validateIntent

} = require("./validator");

const {

    normalizeIntent

} = require("./normalize");

const {

    detectIntent

} = require("./detectIntent");

/*=========================================================
 CONVERSATION ENGINE
=========================================================*/

const {

    ask,

    retrieveContext,

    buildPrompt

} = require("./ask");

/*=========================================================
 EXPORTS
=========================================================*/

module.exports = {

    /*----------------------------------
      Gemini
    ----------------------------------*/

    GEMINI_API_KEY,

    createGeminiClient,

    /*----------------------------------
      Intent Engine
    ----------------------------------*/

    INTENT_PROMPT,

    validateIntent,

    normalizeIntent,

    detectIntent,

    /*----------------------------------
      Conversation Engine
    ----------------------------------*/

    ask,

    retrieveContext,

    buildPrompt

};