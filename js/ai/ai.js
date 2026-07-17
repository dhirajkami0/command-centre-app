(function (window) {

    "use strict";

    const AI =

        window.GreenGuardAI ||= {};

    /*=========================================================
      DETECT INTENT
    =========================================================*/

    AI.detectIntent = async function (

        request = {}

    ) {
    console.trace("🧠 AI.detectIntent CALLED");
    console.dir(request);

        try {

            /*----------------------------------
              Build Prompt
            ----------------------------------*/

            const prompt =

                AIIntentPrompt.build(

                    request

                );

            /*----------------------------------
              Call Gemini
            ----------------------------------*/

            const response =

                await window.callAI(

                    prompt

                );

            /*----------------------------------
              Parse Response
            ----------------------------------*/

            const parsed =

                AIIntentParser.parse(

                    response

                );

            /*----------------------------------
              Validate Response
            ----------------------------------*/

            const validated =

                AIIntentValidator.validate(

                    parsed

                );

            return validated;

        }

        catch (

            error

        ) {

            console.error(

                "AI.detectIntent:",

                error

            );

            return AIIntentValidator.createInvalidIntent(

                error.message

            );

        }

    };

})(window);
