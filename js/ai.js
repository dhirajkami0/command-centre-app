(function (window) {

    "use strict";

    window.callAI = async function (request) {

        const res = await fetch(

            "https://askai-ugffgukzca-uc.a.run.app",

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(request)

            }

        );

        const data = await res.json();

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
