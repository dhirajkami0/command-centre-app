"use strict";

const IntentClassifier = {};

/*----------------------------------------------------------
Categories
----------------------------------------------------------*/

IntentClassifier.CATEGORIES = [

    "staff",

    "patrol",

    "analytics",

    "gis",

    "wildlife",

    "legal",

    "knowledge",

    "report",

    "system",

    "general"

];

/*----------------------------------------------------------
Prompt
----------------------------------------------------------*/

IntentClassifier.prompt = function (

    query

) {

    return [

        {

            role: "system",

            content:

`You are an AI intent classifier.

Return ONLY JSON.

Example:

{
 "intent":"legal",
 "confidence":0.97
}

Valid intents:

staff
patrol
analytics
gis
wildlife
legal
knowledge
report
system
general`

        },

        {

            role:"user",

            content:query

        }

    ];

};

/*----------------------------------------------------------
Parse
----------------------------------------------------------*/

IntentClassifier.parse = function (

    text

) {

    try{

        return JSON.parse(text);

    }

    catch{

        return {

            intent:"general",

            confidence:0

        };

    }

};

module.exports = IntentClassifier;