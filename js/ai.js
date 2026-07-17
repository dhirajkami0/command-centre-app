(function (window) {

    "use strict";

    window.callAI = async function (

        request,

        endpoint = "ASK_AI"

    ) {

        const url =

            GG.Config?.API?.[endpoint];

        if (

            !url

        ) {

            throw new Error(

                "AI endpoint not configured: " +

                endpoint

            );

        }

        if (

            GG.Config?.DEBUG?.ENABLED

        ) {

            console.group(

                "🧠 window.callAI"

            );

            console.log(

                "Endpoint:",

                endpoint

            );

            console.log(

                "URL:",

                url

            );

            console.log(

                "Request:"

            );

            console.dir(

                request

            );

            console.groupEnd();

        }

        const res =

            await fetch(

                url,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":

                            "application/json"

                    },

                    body: JSON.stringify(

                        request

                    )

                }

            );

        let data = {};

        try {

            data =

                await res.json();

        }

        catch (

            err

        ) {

            throw new Error(

                "Invalid JSON response."

            );

        }

        if (

            !res.ok ||

            !data.success

        ) {

            throw new Error(

                data.error ||

                "AI request failed."

            );

        }

        return data;

    };

})(window);
