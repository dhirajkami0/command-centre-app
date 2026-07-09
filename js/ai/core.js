/*!
 * GreenGuard AI
 * core.js
 * Version : 1.0.0
 * Production Safe
 *
 * Depends:
 *   GreenGuardAI.Config
 *   GreenGuardAI.Cache
 *   GreenGuardAI.Context
 *   GreenGuardAI.Router
 */

(function (window) {

    "use strict";

    /*----------------------------------------------------------
      Namespace
    ----------------------------------------------------------*/

    window.GreenGuardAI =
        window.GreenGuardAI || {};

    if (window.GreenGuardAI.Core) {

        console.warn(
            "[GreenGuardAI] Core already loaded."
        );

        return;

    }

    /*----------------------------------------------------------
      Dependency Check
    ----------------------------------------------------------*/

    if (!window.GreenGuardAI.Config) {

        console.error(
            "[GreenGuardAI] Config module missing."
        );

        return;

    }

    if (!window.GreenGuardAI.Cache) {

        console.error(
            "[GreenGuardAI] Cache module missing."
        );

        return;

    }

    if (!window.GreenGuardAI.Context) {

        console.error(
            "[GreenGuardAI] Context module missing."
        );

        return;

    }

    if (!window.GreenGuardAI.Router) {

        console.error(
            "[GreenGuardAI] Router module missing."
        );

        return;

    }

    const Config =
        window.GreenGuardAI.Config;

    const Cache =
        window.GreenGuardAI.Cache;

    const Context =
        window.GreenGuardAI.Context;

    const Router =
        window.GreenGuardAI.Router;

    const Core = {};

    /*----------------------------------------------------------
      Private State
    ----------------------------------------------------------*/

    let ready = false;

    let busy = false;

    let requestCount = 0;

    let responseCount = 0;

    let lastRequest = null;

    let lastResponse = null;

    let lastError = null;

    let currentAbort = null;

    let history = [];
    /*----------------------------------------------------------
      INITIALIZATION
    ----------------------------------------------------------*/

Core.init = async function () {

    if (ready)
        return true;

    try {

        /*----------------------------------
          Cache
        ----------------------------------*/

        await Cache.init();

        /*----------------------------------
          Context
        ----------------------------------*/

        await Context.init();

        /*----------------------------------
          Router
        ----------------------------------*/

        await Router.init();

        /*----------------------------------
          Core Ready
        ----------------------------------*/

        ready = true;

        Config.log(
            "Core",
            "Initialized"
        );

        return true;

    }

    catch (err) {

        lastError = err;

        Config.error(
            "Core.init",
            err
        );

        return false;

    }

};
    /*----------------------------------------------------------
      STATUS
    ----------------------------------------------------------*/

    Core.isReady = function () {

        return ready;

    };



    Core.isBusy = function () {

        return busy;

    };



    /*----------------------------------------------------------
      REQUEST COUNTERS
    ----------------------------------------------------------*/

    Core.requestCount = function () {

        return requestCount;

    };



    Core.responseCount = function () {

        return responseCount;

    };



    /*----------------------------------------------------------
      LAST REQUEST
    ----------------------------------------------------------*/

    Core.lastRequest = function () {

        return Config.clone(
            lastRequest
        );

    };



    /*----------------------------------------------------------
      LAST RESPONSE
    ----------------------------------------------------------*/

    Core.lastResponse = function () {

        return Config.clone(
            lastResponse
        );

    };



    /*----------------------------------------------------------
      LAST ERROR
    ----------------------------------------------------------*/

    Core.lastError = function () {

        return lastError;

    };



    /*----------------------------------------------------------
      HISTORY
    ----------------------------------------------------------*/

    Core.history = function () {

        return Config.clone(
            history
        );

    };



    /*----------------------------------------------------------
      CLEAR HISTORY
    ----------------------------------------------------------*/

    Core.clearHistory = function () {

        history.length = 0;

    };

     /*----------------------------------------------------------
      BUILD REQUEST
    ----------------------------------------------------------*/

  Core.buildRequest = async function (

    query,

    options = {}

) {

    if (

        typeof query !== "string"

    ) {

        throw new Error(

            "Query must be a string."

        );

    }

    query =

        query.trim();

    if (

        !query.length

    ) {

        throw new Error(

            "Query cannot be empty."

        );

    }

    /*----------------------------------
      Legacy Router
      (Context / Tools Only)
    ----------------------------------*/

    const route =

        await Router.route(

            query

        );

    /*----------------------------------
      Context Snapshot
    ----------------------------------*/

    const context =

        await Context.snapshot();

    /*----------------------------------
      Build Request

      NOTE:
      Intent will be detected later by
      Controller -> IntentManager.
    ----------------------------------*/

    const request = {

        id:

            Config.uuid(),

        timestamp:

            Date.now(),

        query:

            query,

        detectedIntent:

            null,

        intent:

            null,

        domain:

            null,

        entities:

            {},

        confidence:

            0,

        score:

            route?.score ||

            0,

        route:

            route,

        context:

            context,

        options:

            Config.clone(

                options

            )

    };

    /*----------------------------------
      Diagnostics
    ----------------------------------*/

    if (

        Config.DEBUG?.ENABLED

    ) {

        console.group(

            "📦 CORE BUILD REQUEST"

        );

        console.log(

            "File:",

            "core.js"

        );

        console.log(

            "Query:",

            request.query

        );

        console.log(

            "Legacy Route:",

            route

        );

        console.log(

            "Context:",

            context

        );

        console.log(

            "Request:",

            request

        );

        console.groupEnd();

    }

    /*----------------------------------
      Save Last Request
    ----------------------------------*/

    lastRequest =

        Config.clone(

            request

        );

    requestCount++;

    history.push({

        id:

            request.id,

        query:

            request.query,

        intent:

            request.intent,

        timestamp:

            request.timestamp

    });

    while (

        history.length >

        Config.CHAT.MAX_HISTORY

    ) {

        history.shift();

    }

    return request;

};

    function cacheKey(request) {

    return [

        request.intent,

        request.query

    ]

    .join("::")

    .toLowerCase();

}


    /*----------------------------------------------------------
      GET CACHED RESPONSE
    ----------------------------------------------------------*/

    Core.getCachedResponse = async function (

        request

    ) {

        try {

            const key =

                cacheKey(

                    request

                );

            const cached =

                await Cache.get(

                    key

                );

            if (

                cached

            ) {

                Config.log(

                    "Core",

                    "Cache Hit",

                    key

                );

                return cached;

            }

            return null;

        }

        catch (err) {

            Config.error(

                "Core.getCachedResponse",

                err

            );

            return null;

        }

    };



    /*----------------------------------------------------------
      SAVE RESPONSE TO CACHE
    ----------------------------------------------------------*/

    Core.setCachedResponse = async function (

        request,

        response

    ) {

        try {

            const key =

                cacheKey(

                    request

                );

            await Cache.set(

                key,

                response,

                Config.CACHE.TTL

            );

            return true;

        }

        catch (err) {

            Config.error(

                "Core.setCachedResponse",

                err

            );

            return false;

        }

    };

Core.callAI = async function (request) {
    busy = true;

    try {
        const cached =
            await Core.getCachedResponse(
                request
            );

        if (cached) {
            console.group(
                "⚡ CORE CACHE"
            );

            console.log(
                "Cache Hit"
            );

            console.log(
                "Cache Key:",
                cacheKey(
                    request
                )
            );

            console.log(
                "Intent:",
                request.detectedIntent?.intent ||
                request.intent
            );

            console.log(
                "Request:",
                request
            );

            console.log(
                "Cached Response:",
                cached
            );

            console.groupEnd();

            lastResponse =
                Config.clone(
                    cached
                );

            return cached;
        }

        /*------------------------------------------
          LOCAL AI CONTROLLER
        ------------------------------------------*/

        const Controller =
            window.GreenGuardAI.Controller;

        if (
            !Controller ||
            typeof Controller.ask !==
            "function"
        ) {
            throw new Error(
                "Controller unavailable."
            );
        }

        const localResponse =
            await Controller.ask(
                request
            );

        console.log(
            "Pipeline Selected:",
            localResponse?.local
                ? "LOCAL"
                : "CLOUD"
        );

        console.group(
            "🟢 LOCAL PIPELINE"
        );
        console.log(
            "Controller Response:",
            localResponse
        );
        console.log(
            "Success:",
            localResponse?.success
        );
        console.log(
            "Local:",
            localResponse?.local
        );
        console.log(
            "Intent:",
            localResponse?.intent
        );
        console.log(
            "Domain:",
            localResponse?.domain
        );
        console.groupEnd();

        /*------------------------------------------
          LOCAL SUCCESS
        ------------------------------------------*/

        if (
            localResponse &&
            localResponse.success &&
            localResponse.local !== false
        ) {
            /*----------------------------------
              Normalize Local Response
            ----------------------------------*/

            localResponse.answer =
                localResponse.formatted?.markdown ||
                localResponse.formatted?.html ||
                localResponse.message ||
                "";
            localResponse.cached =
                false;
            localResponse.timestamp =
                Date.now();
            localResponse.requestId =
                request.id;
            localResponse.raw =
                localResponse.raw ||
                localResponse;

            localResponse.intent =
                request.detectedIntent?.intent ||
                localResponse.intent;
            localResponse.domain =
                request.detectedIntent?.domain ||
                localResponse.domain;
            localResponse.detectedIntent =
                request.detectedIntent;

            /*----------------------------------
              Cache
            ----------------------------------*/

            await Core.setCachedResponse(
                request,
                localResponse
            );

            console.group(
                "🏁 FINAL LOCAL RESPONSE"
            );
            console.log(
                "Intent:",
                localResponse.intent
            );
            console.log(
                "Domain:",
                localResponse.domain
            );
            console.log(
                "Cards:",
                localResponse.cards?.length || 0
            );
            console.log(
                "Sections:",
                localResponse.sections?.length || 0
            );
            console.log(
                "Markdown:",
                !!localResponse.formatted?.markdown
            );
            console.log(
                "HTML:",
                !!localResponse.formatted?.html
            );
            console.log(
                "Formatter:",
                localResponse.formatted?.module
            );
            console.log(
                "Cached:",
                localResponse.cached
            );
            console.groupEnd();

            responseCount++;

            lastResponse =
                Config.clone(
                    localResponse
                );

            console.group(
                "🏆 PIPELINE SUMMARY"
            );
            console.table({
                Query:
                    request.query,
                Intent:
                    localResponse.intent,
                Domain:
                    localResponse.domain,
                Source:
                    "LOCAL",
                Module:
                    localResponse.module,
                Formatter:
                    localResponse.formatted?.module,
                Cards:
                    localResponse.cards?.length || 0,
                Sections:
                    localResponse.sections?.length || 0,
                Markdown:
                    !!localResponse.formatted?.markdown,
                HTML:
                    !!localResponse.formatted?.html
            });
            console.groupEnd();

            return localResponse;
        }

        /*------------------------------------------
          CLOUD AI
        ------------------------------------------*/

        console.group(
            "☁ CLOUD FALLBACK"
        );
        console.log(
            "Detected Intent:",
            request.detectedIntent
        );
        console.log(
            "Request:",
            request
        );
        console.groupEnd();

        let result =
            await window.callAI({
                query:
                    request.query,
                intent:
                    request.detectedIntent ||
                    request.intent,
                toolResults: {}
            });

        if (
            result.tool_calls &&
            result.tool_calls.length
        ) {
            const toolResults = {};

            for (
                const tool of
                result.tool_calls
            ) {
                try {
                    toolResults[
                        tool.name
                    ] =
                        await GreenGuardAI.Tools.execute(
                            tool.name,
                            tool.arguments || {}
                        );
                }
                catch (e) {
                    toolResults[
                        tool.name
                    ] = {
                        error:
                            e.message
                    };
                }
            }

            result =
                await window.callAI({
                    query:
                        request.query,
                    intent:
                        request.detectedIntent ||
                        request.intent,
                    toolResults
                });
        }

        const response = {
            success: true,
            timestamp:
                Date.now(),
            requestId:
                request.id,
            intent:
                request.detectedIntent?.intent ||
                request.intent,
            domain:
                request.detectedIntent?.domain ||
                request.domain,
            confidence:
                request.detectedIntent?.confidence ||
                request.confidence ||
                0,
            detectedIntent:
                request.detectedIntent ||
                null,
            answer:
                result.reply ||
                result.answer ||
                result.content ||
                result.message ||
                (
                    typeof result === "string"
                        ? result
                        : JSON.stringify(
                            result,
                            null,
                            2
                        )
                ),
            raw:
                result,
            cached:
                false,
            local:
                false
        };

        await Core.setCachedResponse(
            request,
            response
        );

        responseCount++;

        lastResponse =
            Config.clone(
                response
            );

        console.group(
            "🏆 PIPELINE SUMMARY"
        );
        console.table({
            Query:
                request.query,
            Intent:
                response.intent,
            Domain:
                response.domain,
            Source:
                "CLOUD",
            Confidence:
                response.confidence
        });
        console.groupEnd();

        return response;
    }
    catch (err) {
        lastError = err;
        Config.error(
            "Core.callAI",
            err
        );
        return {
            success: false,
            error:
                err.message
        };
    }
    finally {
        busy = false;
    }
};

/*----------------------------------------------------------
  PUBLIC API
----------------------------------------------------------*/

Core.ask = async function (
    query,
    options = {}
) {
    const started =
        Date.now();

    console.group(
        "🟢 CORE.ASK"
    );

    console.log(
        "File:",
        "core.js"
    );

    console.log(
        "Function:",
        "Core.ask"
    );

    console.log(
        "Query:",
        query
    );

    console.log(
        "Options:",
        options
    );

    try {
        /*----------------------------------
          Build Request
        ----------------------------------*/

        const request =
            await Core.buildRequest(
                query,
                options
            );

        console.log(
            "📦 Request Built:",
            request
        );

        /*----------------------------------
          Call AI Pipeline
        ----------------------------------*/

        const response =
            await Core.callAI(
                request
            );

        console.log(
            "📥 Response:",
            response
        );

        console.log(
            "⏱ Execution:",
            Date.now() -
            started,
            "ms"
        );

        console.groupEnd();

        return response;
    }
    catch (
        err
    ) {
        lastError =
            err;

        Config.error(
            "Core.ask",
            err
        );

        console.error(
            "❌ Core.ask Error:",
            err
        );

        console.log(
            "⏱ Failed After:",
            Date.now() -
            started,
            "ms"
        );

        console.groupEnd();

        return {
            success: false,
            error:
                err.message ||
                String(
                    err
                )
        };
    }
};

    /*----------------------------------------------------------
      CANCEL
    ----------------------------------------------------------*/

    Core.cancel = function () {

        if (

            currentAbort &&

            typeof currentAbort.abort === "function"

        ) {

            currentAbort.abort();

        }

        busy = false;

    };



    /*----------------------------------------------------------
      RESET
    ----------------------------------------------------------*/

    Core.reset = function () {

        busy = false;

        requestCount = 0;

        responseCount = 0;

        lastRequest = null;

        lastResponse = null;

        lastError = null;

        currentAbort = null;

        history.length = 0;

    };



    /*----------------------------------------------------------
      INFO
    ----------------------------------------------------------*/

    Core.info = function () {

        return {

            ready:

                ready,

            busy:

                busy,

            requests:

                requestCount,

            responses:

                responseCount,

            history:

                history.length,

            lastIntent:

                lastRequest

                    ? lastRequest.intent

                    : null

        };

    };



    /*----------------------------------------------------------
      AUTO INITIALIZE
    ----------------------------------------------------------*/

    Core.init()

        .then(() => {

            Config.log(

                "Core",

                "Ready"

            );

        })

        .catch((err) => {

            Config.error(

                "Core",

                err

            );

        });



    /*----------------------------------------------------------
      REGISTER
    ----------------------------------------------------------*/

    window.GreenGuardAI.Core =

        Core;



    console.log(

        "%cGreenGuard AI Core Loaded",

        "color:#ff6600;font-weight:bold;"

    );

})(window);
