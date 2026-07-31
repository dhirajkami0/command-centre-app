"use strict";

const OpenAI = require("openai");

const OpenAIService = {};

let client = null;

/*----------------------------------------------------------
Create Client
----------------------------------------------------------*/

OpenAIService.createClient = function (apiKey) {

    if (client) {

        return client;

    }

    client = new OpenAI({

        apiKey

    });

    return client;

};

/*----------------------------------------------------------
Ask
----------------------------------------------------------*/

OpenAIService.ask = async function (

    client,

    model,

    systemPrompt,

    query,

    toolSummary

) {

    const response =

    await client.chat.completions.create({

        model,

        messages: [

            {

                role: "system",

                content: systemPrompt

            },

            {

                role: "user",

                content:

                    "User question:\n\n" +

                    query +

                    "\n\nAvailable tool results:\n\n" +

                    JSON.stringify(

                        toolSummary,

                        null,

                        2

                    )

            }

        ]

    });

    return (

        response?.choices?.[0]?.message?.content ||

        ""

    );

};

/*----------------------------------------------------------
Ask With Tools
----------------------------------------------------------*/

OpenAIService.askWithTools = async function (

    client,

    model,

    messages,

    tools

) {

    return await client.chat.completions.create({

        model,

        messages,

        tools,

        tool_choice: "auto"

    });

};

module.exports = OpenAIService;