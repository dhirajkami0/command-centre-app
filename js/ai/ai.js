(function (window) {

    "use strict";

    /*=========================================================
      CALL AI (GEMINI)
    =========================================================*/

    window.callAI = async function (request = {}) {

        const endpoint =

            window.GreenGuardAI
                ?.Config
                ?.API
                ?.ASK_AI;

        if (!endpoint) {

            throw new Error(

                "ASK_AI endpoint is not configured."

            );

        }

        const response = await fetch(

            endpoint,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(request)

            }

        );

        const data = await response.json();

        if (

            !response.ok ||

            data.success === false

        ) {

            throw new Error(

                data.error ||

                "Gemini request failed."

            );

        }

        return data;

    };

})(window);
