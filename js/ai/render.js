/*!
 * GreenGuard AI
 * render.js
 * Version : 1.0.0
 * Production Safe
 *
 * Depends:
 *   GreenGuardAI.Config
 */

(function(window){

"use strict";

/*----------------------------------------------------------
  Namespace
----------------------------------------------------------*/

window.GreenGuardAI =
    window.GreenGuardAI || {};

if(window.GreenGuardAI.Render){

    console.warn(
        "[GreenGuardAI] Render already loaded."
    );

    return;

}

/*----------------------------------------------------------
  Dependency Check
----------------------------------------------------------*/

if(!window.GreenGuardAI.Config){

    console.error(
        "[GreenGuardAI] Config missing."
    );

    return;

}

const Config =
    window.GreenGuardAI.Config;

const Render = {};

/*----------------------------------------------------------
  Private State
----------------------------------------------------------*/

let ready=false;

let container=null;

let messageCount=0;

let lastMessage=null;

let autoScroll=true;

let markdownEnabled=true;

     /*----------------------------------------------------------
      INIT
    ----------------------------------------------------------*/

    Render.init = function (

        element

    ) {

        if (ready)
            return true;

        if (

            typeof element ===

            "string"

        ) {

            container =

                document.getElementById(

                    element

                );

        }

        else {

            container =

                element;

        }

        if (!container) {

            Config.error(

                "Render",

                "Container not found."

            );

            return false;

        }

        ready = true;

        Config.log(

            "Render",

            "Initialized"

        );

        return true;

    };



    /*----------------------------------------------------------
      STATUS
    ----------------------------------------------------------*/

    Render.isReady = function () {

        return ready;

    };



    /*----------------------------------------------------------
      CONTAINER
    ----------------------------------------------------------*/

    Render.container = function () {

        return container;

    };



    /*----------------------------------------------------------
      CLEAR
    ----------------------------------------------------------*/

    Render.clear = function () {

        if (!container)
            return;

        container.innerHTML = "";

        messageCount = 0;

        lastMessage = null;

    };



    /*----------------------------------------------------------
      AUTO SCROLL
    ----------------------------------------------------------*/

    Render.setAutoScroll = function (

        value

    ) {

        autoScroll = !!value;

    };



    Render.autoScroll = function () {

        if (

            !container ||

            !autoScroll

        )

            return;

        container.scrollTop =

            container.scrollHeight;

    };

     /*----------------------------------------------------------
      ESCAPE HTML
    ----------------------------------------------------------*/

    function escapeHTML(text) {

        if (

            text === undefined ||

            text === null

        ) {

            return "";

        }

        return String(text)

            .replace(/&/g, "&amp;")

            .replace(/</g, "&lt;")

            .replace(/>/g, "&gt;")

            .replace(/"/g, "&quot;")

            .replace(/'/g, "&#39;");

    }



    /*----------------------------------------------------------
      SIMPLE MARKDOWN
    ----------------------------------------------------------*/

    function markdown(text) {

        text = escapeHTML(text);

        if (!markdownEnabled)
            return text;

        return text

            .replace(
                /\*\*(.*?)\*\*/g,
                "<strong>$1</strong>"
            )

            .replace(
                /\*(.*?)\*/g,
                "<em>$1</em>"
            )

            .replace(
                /`([^`]+)`/g,
                "<code>$1</code>"
            )

            .replace(
                /\n/g,
                "<br>"
            );

    }



    /*----------------------------------------------------------
      CREATE MESSAGE
    ----------------------------------------------------------*/

    function createMessage(

        role,

        text

    ) {

        const div =

            document.createElement(

                "div"

            );

       div.className =

    "gg-ai-message gg-ai-" +

    role;

div.dataset.role =

    role;

div.dataset.raw =

    text;

div.innerHTML =

    markdown(text);

        return div;

    }



    /*----------------------------------------------------------
      APPEND MESSAGE
    ----------------------------------------------------------*/

    Render.appendMessage = function (

        role,

        text

    ) {

        if (!container)
            return null;

        const message =

            createMessage(

                role,

                text

            );

        container.appendChild(

            message

        );

        messageCount++;

        lastMessage =

            message;

        Render.autoScroll();

        return message;

    };

     /*----------------------------------------------------------
      UPDATE MESSAGE
    ----------------------------------------------------------*/

    Render.updateMessage = function (

        element,

        text

    ) {

        if (

            !element

        )

            return;

       element.dataset.raw =

    text;

element.innerHTML =

    markdown(text);

        Render.autoScroll();

    };



    /*----------------------------------------------------------
      APPEND STREAM
    ----------------------------------------------------------*/

    Render.appendStream = function (

        element,

        chunk

    ) {

        if (

            !element

        )

            return;

       const current =

    element.dataset.raw ||

    element.textContent ||

    "";

        const updated =

            current + chunk;

        element.dataset.raw =

            updated;

        element.innerHTML =

            markdown(

                updated

            );

        Render.autoScroll();

    };



    /*----------------------------------------------------------
      TYPING INDICATOR
    ----------------------------------------------------------*/

    let typingElement = null;



    Render.showTyping = function () {

        if (

            typingElement ||

            !container

        )

            return;

        typingElement =

            document.createElement(

                "div"

            );

        typingElement.className =

            "gg-ai-message gg-ai-system gg-ai-typing";

        typingElement.innerHTML =

            "<span></span><span></span><span></span>";

        container.appendChild(

            typingElement

        );

        Render.autoScroll();

    };



    /*----------------------------------------------------------
      HIDE TYPING
    ----------------------------------------------------------*/

    Render.hideTyping = function () {

        if (

            !typingElement

        )

            return;

        typingElement.remove();

        typingElement = null;

    };



    /*----------------------------------------------------------
      MESSAGE COUNT
    ----------------------------------------------------------*/

    Render.messageCount = function () {

        return messageCount;

    };



    /*----------------------------------------------------------
      LAST MESSAGE
    ----------------------------------------------------------*/

    Render.lastMessage = function () {

        return lastMessage;

    };

     /*----------------------------------------------------------
      ERROR MESSAGE
    ----------------------------------------------------------*/

    Render.error = function (

        text

    ) {

        return Render.appendMessage(

            "error",

            "❌ " + text

        );

    };



    /*----------------------------------------------------------
      SUCCESS MESSAGE
    ----------------------------------------------------------*/

    Render.success = function (

        text

    ) {

        return Render.appendMessage(

            "success",

            "✅ " + text

        );

    };



    /*----------------------------------------------------------
      SYSTEM MESSAGE
    ----------------------------------------------------------*/

    Render.system = function (

        text

    ) {

        return Render.appendMessage(

            "system",

            text

        );

    };



    /*----------------------------------------------------------
      COPY BUTTON
    ----------------------------------------------------------*/

    Render.enableCopy = function (

        element,

        text

    ) {

        if (

            !element

        )

            return;

        const btn =

            document.createElement(

                "button"

            );

        btn.className =

            "gg-ai-copy";

        btn.textContent =

            "Copy";

        btn.onclick = async function () {

            try {

                await navigator.clipboard.writeText(

                    text

                );

                btn.textContent =

                    "Copied";

                setTimeout(

                    function () {

                        btn.textContent =

                            "Copy";

                    },

                    1500

                );

            }

            catch (err) {

                Config.error(

                    "Render.copy",

                    err

                );

            }

        };

        element.appendChild(

            btn

        );

    };



    /*----------------------------------------------------------
      DOWNLOAD MARKDOWN
    ----------------------------------------------------------*/

    Render.downloadMarkdown = function (

        filename,

        text

    ) {

        const blob =

            new Blob(

                [text],

                {

                    type:

                        "text/markdown"

                }

            );

        const url =

            URL.createObjectURL(

                blob

            );

        const a =

            document.createElement(

                "a"

            );

        a.href = url;

        a.download =

            filename ||

            "chat.md";

        a.click();

        URL.revokeObjectURL(

            url

        );

    };



    /*----------------------------------------------------------
      RESET
    ----------------------------------------------------------*/

    Render.reset = function () {

        Render.clear();

        typingElement = null;

        messageCount = 0;

        lastMessage = null;

    };



    /*----------------------------------------------------------
      INFO
    ----------------------------------------------------------*/

    Render.info = function () {

        return {

            ready:

                ready,

            messages:

                messageCount,

            autoScroll:

                autoScroll,

            markdown:

                markdownEnabled

        };

    };


/*----------------------------------------------------------
  AUTO INITIALIZE
----------------------------------------------------------*/

Render.init(

    "gg-ai-messages"

);
    /*----------------------------------------------------------
      REGISTER
    ----------------------------------------------------------*/

    window.GreenGuardAI.Render =

        Render;



    console.log(

        "%cGreenGuard AI Render Loaded",

        "color:#8a2be2;font-weight:bold;"

    );

})(window);
