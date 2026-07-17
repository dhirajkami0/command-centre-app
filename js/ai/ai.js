(function (window) {

    "use strict";

    window.callAI = async function (

        request = {}

    ) {

        const endpoint =

            window.GreenGuardAI
                ?.Config
                ?.API
                ?.ASK_AI;

        if (

            !endpoint

        ) {

            throw new Error(

                "ASK_AI endpoint is not configured."

            );

        }

        const response = await fetch(

            endpoint,

            {

                method: "POST",

                headers: {

                    "Content-Type":

                        "application/json"

                },

                body:

                    JSON.stringify(

                        request

                    )

            }

        );

        let data = null;

        try {

            data =

                await response.json();

        }

        catch (

            error

        ) {

            throw new Error(

                "Invalid JSON response from AI."

            );

        }

        if (

            !response.ok

        ) {

            throw new Error(

                data?.error ||

                response.statusText ||

                "AI request failed."

            );

        }

        if (

            data?.success === false

        ) {

            throw new Error(

                data.error ||

                "AI request failed."

            );

        }

        return data;

    };

})(window);
