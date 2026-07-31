"use strict";

const { onRequest } =
    require("firebase-functions/v2/https");

/*=========================================================
  GEMINI AI MODULE
=========================================================*/

const {

    GEMINI_API_KEY

} = require("./ai/client");

const AI =

    require("./ai"); // Updated to a standard supporting current tool calling

/*----------------------------------------------------------
  TOOL DEFINITIONS
----------------------------------------------------------*/

const TOOLS = [

{
    type: "function",
    function: {
        name: "getProfile",
        description: "Get logged in user profile.",
       parameters: {
    type: "object",
    properties: {},
    additionalProperties: false
}
    }
},

{
    type: "function",
    function: {
        name: "getDuty",
        description: "Get current duty status.",
       parameters: {
    type: "object",
    properties: {},
    additionalProperties: false
}
    }
},

{
    type: "function",
    function: {
        name: "getLiveStaff",
        description: "Get live staff list.",
       parameters: {
    type: "object",
    properties: {},
    additionalProperties: false
}
    }
},

{
    type: "function",
    function: {
        name: "getPatrol",
        description: "Get patrol summary.",
       parameters: {
    type: "object",
    properties: {},
    additionalProperties: false
}
    }
},

{
    type: "function",
    function: {
        name: "getAnalytics",
        description: "Get patrol analytics.",
      parameters: {
    type: "object",
    properties: {},
    additionalProperties: false
}
    }
},

{
    type: "function",
    function: {
        name: "getGIS",
        description: "Get current GIS selection.",
       parameters: {
    type: "object",
    properties: {},
    additionalProperties: false
}
    }
},

{
    type: "function",
    function: {
        name: "getLocation",
        description: "Get current GPS location.",
       parameters: {
    type: "object",
    properties: {},
    additionalProperties: false
}
    }
},

{
    type: "function",
    function: {
        name: "getSelection",
        description: "Get selected division/range/beat/compartment.",
      parameters: {
    type: "object",
    properties: {},
    additionalProperties: false
}
    }
},

{
    type: "function",
    function: {
        name: "searchSpecies",
        description: "Search wildlife species.",
       parameters: {

    type: "object",

    properties: {

        name: {

            type: "string",

            description:
                "Species name"

        }

    },

    required: [

        "name"

    ],

    additionalProperties: false

}
    }
},

{
    type: "function",
    function: {
        name: "searchLegal",
        description: "Search Wildlife Protection Act.",
      parameters: {

    type: "object",

    properties: {

        query: {

            type: "string",

            description:
                "Legal question"

        }

    },

    required: [

        "query"

    ],

    additionalProperties: false

}
    }
}
,

{
    type: "function",
    function: {

        name: "getSightings",

        description:
            "Get current elephant sightings.",

       parameters: {
    type: "object",
    properties: {},
    additionalProperties: false
}

    }

},

{
    type: "function",
    function: {

        name: "getWeather",

        description:
            "Get current weather.",

      parameters: {
    type: "object",
    properties: {},
    additionalProperties: false
}

    }

},

{
    type: "function",
    function: {

        name: "getVillages",

        description:
            "Get village database.",

       parameters: {
    type: "object",
    properties: {},
    additionalProperties: false
}

    }

},

{
    type: "function",
    function: {

        name: "getMapData",

        description:
            "Get current operational map data.",

       parameters: {
    type: "object",
    properties: {},
    additionalProperties: false
}

    }

},
{
    type: "function",
    function: {

        name: "getArea",

        description:
            "Calculate area of a division, range, beat or compartment.",

        parameters: {

            type: "object",

            properties: {

                name: {

                    type: "string",

                    description:
                        "Division, Range, Beat or Compartment name."

                }

            },

            required: [

                "name"

            ],

            additionalProperties: false

        }

    }

},
{
  type: "function",
  function: {
    name: "getMonthlyStatus",
    description: "Get current monthly patrol statistics including grids, compartments, coverage, area, patrol distance and live staff.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  }
},
{
  type: "function",
  function: {
    name: "compareMonths",
    description: "Compare patrol statistics between two months.",
    parameters: {
      type: "object",
      properties: {
        month1: { type: "string" },
        month2: { type: "string" }
      },
      required: ["month1","month2"],
      additionalProperties: false
    }
  }
},
{
  type: "function",
  function: {
    name: "runDiagnostics",
    description: "Run complete GreenGuard AI diagnostics.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  }
},
{
  type: "function",
  function: {
    name: "systemHealth",
    description: "Return health of all AI modules.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  }
},
{
  type: "function",
  function: {
    name: "generateDailyReport",
    description: "Generate daily patrol report.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  }
},
{
  type: "function",
  function: {
    name: "generateMonthlyReport",
    description: "Generate monthly patrol report.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  }
},
{
  type: "function",
  function: {
    name: "searchCourtCases",
    description: "Search important forest and wildlife court judgements.",
    parameters: {
      type: "object",
      properties: {
        query:{type:"string"}
      },
      required:["query"],
      additionalProperties:false
    }
  }
},
{
  type: "function",
  function: {
    name: "generateDFOBriefing",
    description: "Generate DFO operational briefing.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  }
},
{
    type: "function",
    function: {

        name: "analyticsQuery",

        description:
            "Answer any patrol analytics question including most visited compartment, least visited compartment, highest coverage, lowest coverage, beat statistics, range statistics, division statistics, staff statistics, patrol ranking, no patrol compartments, patrol distance, patrol sessions, patrol history and all operational analytics.",

        parameters: {

            type: "object",

            properties: {

                query: {

                    type: "string",

                    description:
                        "The user's analytics question."

                }

            },

            required: [

                "query"

            ],

            additionalProperties: false

        }

    }

},
{
  type: "function",
  function: {
    name: "searchResearch",
    description: "Search research papers on wildlife, ecology and conservation.",
    parameters: {
      type: "object",
      properties: {
        query:{type:"string"}
      },
      required:["query"],
      additionalProperties:false
    }
  }
},
{
  type: "function",
  function: {
    name: "predictElephantMovement",
    description: "Predict elephant movement using sightings and GIS.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties:false
    }
  }
},
{
  type: "function",
  function: {
    name: "predictPatrolPriority",
    description: "Recommend patrol priority areas.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties:false
    }
  }
}
];
/*----------------------------------------------------------
  SYSTEM PROMPT
----------------------------------------------------------*/

const SYSTEM_PROMPT = `
You are GreenGuard AI.

You assist Forest Department officers.

Always answer using available tool results.
For any patrol analytics question, always use analyticsQuery instead of individual analytics tools.
Never invent operational data.

If a question requires live information, GIS information, patrol statistics, wildlife information, weather, village information or area calculations, call the appropriate tool.

If several tools are needed, call all of them before answering.

Reply in concise professional English.

When numerical values are returned, present them clearly using units.
`;



/*----------------------------------------------------------
  HELPERS
----------------------------------------------------------*/

function json(value) { return JSON.stringify(value, null, 2); }
function safe(value) { return value || {}; }
function success(data) { return { success: true, ...data }; }
function failure(message) { return { success: false, error: message }; }

/*=========================================================
  ASK AI
  GEMINI CLOUD FALLBACK
=========================================================*/

/*=========================================================
  ASK AI
  GEMINI CLOUD FALLBACK
=========================================================*/

exports.askAI = onRequest(

    {

        secrets: [

            GEMINI_API_KEY

        ],

        cors: true,

        timeoutSeconds: 120,

        memory: "512MiB"

    },

    async (

        req,

        res

    ) => {

        /*----------------------------------
          CORS
        ----------------------------------*/

        res.set(

            "Access-Control-Allow-Origin",

            "*"

        );

        res.set(

            "Access-Control-Allow-Headers",

            "Content-Type"

        );

        res.set(

            "Access-Control-Allow-Methods",

            "POST, OPTIONS"

        );

        /*----------------------------------
          OPTIONS
        ----------------------------------*/

        if (

            req.method === "OPTIONS"

        ) {

            return res

                .status(204)

                .send("");

        }

        /*----------------------------------
          POST Only
        ----------------------------------*/

        if (

            req.method !== "POST"

        ) {

            return res

                .status(405)

                .json({

                    success: false,

                    error: "POST only"

                });

        }

        try {

            /*----------------------------------
              Query
            ----------------------------------*/

            const query =

                String(

                    req.body?.query ||

                    req.body?.question ||

                    ""

                ).trim();

            if (

                !query

            ) {

                return res

                    .status(400)

                    .json({

                        success: false,

                        error: "Query missing"

                    });

            }

            /*----------------------------------
              Gemini Answer
            ----------------------------------*/

            const result =

                await AI.ask(

                    query

                );

            /*----------------------------------
              Frontend-Compatible Response
            ----------------------------------*/

            return res.json({

                success: true,

                source: "cloud",

                provider:

                    result.provider ||

                    "Gemini",

                domain:

                    result.domain ||

                    "general",

                query:

                    query,

                reply:

                    result.answer ||

                    result.reply ||

                    "",

                answer:

                    result.answer ||

                    result.reply ||

                    "",

                confidence:

                    result.confidence ??

                    1

            });

        }

        catch (

            err

        ) {

            console.error(

                "[askAI]",

                err

            );

            return res

                .status(500)

                .json({

                    success: false,

                    error:

                        err.message ||

                        "Gemini request failed."

                });

        }

    }

);

/*----------------------------------------------------------
 ASK
----------------------------------------------------------*/

exports.ask = onRequest(
{
    secrets: [


    GEMINI_API_KEY

],
    cors: true,
    timeoutSeconds: 120,
    memory: "512MiB"
},
async (req, res) => {

    res.set(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.set(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    res.set(
        "Access-Control-Allow-Methods",
        "POST, OPTIONS"
    );

    if (req.method === "OPTIONS") {

        return res
            .status(204)
            .send("");

    }

    if (req.method !== "POST") {

        return res
            .status(405)
            .json({

                success: false,

                error: "POST only"

            });

    }

    try {

        const question =

            String(

                req.body?.question ||

                req.body?.query ||

                ""

            ).trim();

        const result =

            await AI.ask(

                question

            );

        return res.json(

            result

        );

    }

    catch (err) {

        console.error(err);

        return res
            .status(500)
            .json({

                success: false,

                error: err.message

            });

    }

});
/*----------------------------------------------------------
 DETECT INTENT
----------------------------------------------------------*/

/*----------------------------------------------------------
 DETECT INTENT
----------------------------------------------------------*/

exports.detectIntent = onRequest(

    {

        secrets: [

            GEMINI_API_KEY

        ],

        cors: true,

        timeoutSeconds: 60,

        memory: "256MiB"

    },

    async (

        req,

        res

    ) => {

        /*----------------------------------
          CORS
        ----------------------------------*/

        res.set(

            "Access-Control-Allow-Origin",

            "*"

        );

        res.set(

            "Access-Control-Allow-Headers",

            "Content-Type"

        );

        res.set(

            "Access-Control-Allow-Methods",

            "POST, OPTIONS"

        );

        /*----------------------------------
          OPTIONS
        ----------------------------------*/

        if (

            req.method === "OPTIONS"

        ) {

            return res

                .status(204)

                .send("");

        }

        /*----------------------------------
          POST ONLY
        ----------------------------------*/

        if (

            req.method !== "POST"

        ) {

            return res

                .status(405)

                .json({

                    success: false,

                    error: "POST only"

                });

        }

        try {

            /*----------------------------------
              Validate Request Body
            ----------------------------------*/

            const body =

                req.body &&

                typeof req.body === "object"

                    ? req.body

                    : {};

            /*----------------------------------
              Query
            ----------------------------------*/

            const query =

                String(

                    body.query ||

                    ""

                ).trim();

            if (

                !query

            ) {

                return res

                    .status(400)

                    .json({

                        success: false,

                        error:

                            "Query missing"

                    });

            }

            /*----------------------------------
              Build Complete Intent Request

              IMPORTANT:

              The frontend BusinessRegistry is
              authoritative.

              Do NOT reduce this request to only
              query + localIntent.

              Gemini must select an intent only
              from business.intents.
            ----------------------------------*/

            const intentRequest = {

                query:

                    query,

                normalizedQuery:

                    String(

                        body.normalizedQuery ||

                        query

                    ).trim(),

                localIntent:

                    body.localIntent &&

                    typeof body.localIntent ===
                        "object"

                        ? body.localIntent

                        : null,

                extractedEntities:

                    body.extractedEntities &&

                    typeof body.extractedEntities ===
                        "object"

                        ? body.extractedEntities

                        : {},

                business:

                    body.business &&

                    typeof body.business ===
                        "object"

                        ? body.business

                        : {},

                rules:

                    body.rules &&

                    typeof body.rules ===
                        "object"

                        ? body.rules

                        : {},

                prompt:

                    typeof body.prompt ===
                        "string"

                        ? body.prompt

                        : ""

            };

            /*----------------------------------
              Validate Business Registry
            ----------------------------------*/

            if (

                !Array.isArray(

                    intentRequest
                        .business
                        .domains

                ) ||

                intentRequest
                    .business
                    .domains
                    .length === 0

            ) {

                throw new Error(

                    "Business Registry contains no allowed domains."

                );

            }

            if (

                !Array.isArray(

                    intentRequest
                        .business
                        .intents

                ) ||

                intentRequest
                    .business
                    .intents
                    .length === 0

            ) {

                throw new Error(

                    "Business Registry contains no allowed intents."

                );

            }

            /*----------------------------------
              Debug

              Remove or wrap with DEBUG later.
            ----------------------------------*/

            console.log(

                "[detectIntent] Business Registry:",

                {

                    domains:

                        intentRequest
                            .business
                            .domains
                            .length,

                    intents:

                        intentRequest
                            .business
                            .intents
                            .length,

                    entityTypes:

                        Array.isArray(

                            intentRequest
                                .business
                                .entityTypes

                        )

                            ? intentRequest
                                .business
                                .entityTypes
                                .length

                            : 0

                }

            );

            /*----------------------------------
              Detect Intent

              Pass COMPLETE request object.
            ----------------------------------*/

            const result =

                await AI.detectIntent(

                    intentRequest

                );

            /*----------------------------------
              Response
            ----------------------------------*/

            return res.json(

                result

            );

        }

        catch (

            err

        ) {

            console.error(

                "[detectIntent]",

                err

            );

            return res

                .status(500)

                .json({

                    success: false,

                    error:

                        err.message ||

                        "Intent detection failed."

                });

        }

    }

);