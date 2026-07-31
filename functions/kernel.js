const Registry =
require("./registry");

const SYSTEM_PROMPT =
require("./prompts/system");

const MODEL =
"gpt-4o";

async function run(

    client,

    body

){

    const query =
    String(

        body.query ||

        body.prompt ||

        ""

    ).trim();

    const context =
    body.context || {};

    const toolResults =
    body.toolResults || {};

    if(!query){

        return{

            success:false,

            error:"Query missing"

        };

    }

    /*
    ----------------------------------
    TOOL RESULTS ALREADY AVAILABLE
    ----------------------------------
    */

    if(

        Object.keys(

            toolResults

        ).length

    ){

        const completion =
        await client.chat.completions.create({

            model:MODEL,

            messages:[

                {

                    role:"system",

                    content:
                    SYSTEM_PROMPT

                },

                {

                    role:"user",

                    content:
                    JSON.stringify({

                        query,

                        context,

                        toolResults

                    })

                }

            ]

        });

        return{

            success:true,

            reply:

            completion

            .choices[0]

            .message

            .content

        };

    }

    /*
    ----------------------------------
    FIRST AI CALL
    ----------------------------------
    */

    const completion =
    await client.chat.completions.create({

        model:MODEL,

        messages:[

            {

                role:"system",

                content:
                SYSTEM_PROMPT

            },

            {

                role:"user",

                content:
                JSON.stringify({

                    query,

                    context

                })

            }

        ],

        tools:
        Registry.getTools(),

        tool_choice:
        "auto"

    });

    const message =
    completion.choices[0].message;

    if(

        message.tool_calls

    ){

        return{

            success:true,

            tool_calls:

            message.tool_calls.map(

                call=>({

                    id:call.id,

                    name:

                    call.function.name,

                    arguments:

                    JSON.parse(

                        call.function.arguments ||

                        "{}"

                    )

                })

            )

        };

    }

    return{

        success:true,

        reply:
        message.content

    };

}

module.exports={

    run

};