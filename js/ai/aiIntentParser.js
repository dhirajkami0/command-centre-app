(function (window) {

"use strict";

/*=========================================================
 NAMESPACE
=========================================================*/

const GG =

    window.GreenGuardAI =

    window.GreenGuardAI || {};

/*=========================================================
 PREVENT DOUBLE LOADING
=========================================================*/

if (

    GG.AIIntentParser

) {

    console.warn(

        "[GreenGuardAI] AI Intent Parser already loaded."

    );

    return;

}

/*=========================================================
 MODULE
=========================================================*/

const AIIntentParser = {};

/*=========================================================
 INFO
=========================================================*/

AIIntentParser.VERSION =

    "1.0.0";

AIIntentParser.initialized =

    false;

/*=========================================================
 INIT
=========================================================*/

AIIntentParser.init = function () {

    if (

        AIIntentParser.initialized

    ) {

        return;

    }

    AIIntentParser.initialized =

        true;

    console.log(

        "%cGreenGuard AI Intent Parser Ready",

        "color:#3F51B5;font-weight:bold;"

    );

};
/*=========================================================
 PARSE RESPONSE
=========================================================*/

AIIntentParser.parse = function (

    response = ""

) {

    AIIntentParser.init();

    /*----------------------------------
      Normalize
    ----------------------------------*/

    if (

        response === undefined ||

        response === null

    ) {

        response = "";

    }

    response =

        String(

            response

        ).trim();

    /*----------------------------------
      Empty Response
    ----------------------------------*/

    if (

        !response

    ) {

        return AIIntentParser.createError(

            "Empty AI response."

        );

    }

    /*----------------------------------
      Extract JSON
    ----------------------------------*/

    const json =

        AIIntentParser.extractJSON(

            response

        );

    /*----------------------------------
      Safe Parse
    ----------------------------------*/

    return AIIntentParser.safeParse(

        json

    );

};
  /*=========================================================
 EXTRACT JSON
=========================================================*/

AIIntentParser.extractJSON = function (

    response = ""

) {

    /*----------------------------------
      Normalize
    ----------------------------------*/

    response =

        String(

            response || ""

        ).trim();

    /*----------------------------------
      Markdown JSON Block

      ```json
      {
      }
      ```
    ----------------------------------*/

    const markdown =

        response.match(

            /```(?:json)?\s*([\s\S]*?)\s*```/i

        );

    if (

        markdown &&

        markdown[1]

    ) {

        return markdown[1].trim();

    }

    /*----------------------------------
      Raw JSON Object
    ----------------------------------*/

    if (

        response.startsWith("{") &&

        response.endsWith("}")

    ) {

        return response;

    }

    /*----------------------------------
      Embedded JSON

      Text...

      {

      }

      More Text...
    ----------------------------------*/

    const start =

        response.indexOf("{");

    const end =

        response.lastIndexOf("}");

    if (

        start >= 0 &&

        end > start

    ) {

        return response.substring(

            start,

            end + 1

        );

    }

    /*----------------------------------
      Nothing Found
    ----------------------------------*/

    return "";

};

  /*=========================================================
 SAFE PARSE JSON
=========================================================*/

AIIntentParser.safeParse = function (

    json = ""

) {

    /*----------------------------------
      Empty JSON
    ----------------------------------*/

    if (

        !json ||

        typeof json !== "string"

    ) {

        return AIIntentParser.createError(

            "No JSON found."

        );

    }

    /*----------------------------------
      Parse
    ----------------------------------*/

    try {

        const result =

            JSON.parse(

                json

            );

        /*------------------------------
          Must Be Object
        ------------------------------*/

        if (

            !result ||

            typeof result !== "object" ||

            Array.isArray(

                result

            )

        ) {

            return AIIntentParser.createError(

                "Invalid JSON object."

            );

        }

        return result;

    }

    /*----------------------------------
      Parse Error
    ----------------------------------*/

    catch (

        err

    ) {

        return AIIntentParser.createError(

            err.message ||

            "JSON parse failed."

        );

    }

};

  /*=========================================================
 CREATE PARSER ERROR
=========================================================*/

AIIntentParser.createError = function (

    message = "Unknown parser error."

) {

    return {

        success: false,

        parserError: true,

        source: "AIIntentParser",

        provider: "Gemini",

        domain: "UNKNOWN",

        intent: "UNKNOWN",

        confidence: 0,

        entities: {},

        raw: null,

        error: String(

            message

        )

    };

};
/*=========================================================
 REGISTER
=========================================================*/

GG.AIIntentParser =

    AIIntentParser;

console.log(

    "%cGreenGuard AI Intent Parser Loaded",

    "color:#3F51B5;font-weight:bold;"

);

})(window);
