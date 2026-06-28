/*!
 * GreenGuard AI
 * panel.js
 * Version : 1.0.0
 * Production Safe
 *
 * Depends:
 *   GreenGuardAI.Config
 *   GreenGuardAI.Core
 *   GreenGuardAI.Render
 */

(function(window){

"use strict";

/*----------------------------------------------------------
  Namespace
----------------------------------------------------------*/

window.GreenGuardAI =
    window.GreenGuardAI || {};

if(window.GreenGuardAI.Panel){

    console.warn(
        "[GreenGuardAI] Panel already loaded."
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

if(!window.GreenGuardAI.Core){

    console.error(
        "[GreenGuardAI] Core missing."
    );

    return;

}

if(!window.GreenGuardAI.Render){

    console.error(
        "[GreenGuardAI] Render missing."
    );

    return;

}

const Config =
    window.GreenGuardAI.Config;

const Core =
    window.GreenGuardAI.Core;

const Render =
    window.GreenGuardAI.Render;

const Panel = {};

/*----------------------------------------------------------
  Private State
----------------------------------------------------------*/

let ready = false;

let opened = false;

let root = null;

let header = null;

let body = null;

let footer = null;

let messages = null;

let input = null;

let sendButton = null;

let closeButton = null;

let minimizeButton = null;

     /*----------------------------------------------------------
      CREATE UI
    ----------------------------------------------------------*/

    function createUI() {

        root =

            document.createElement(

                "div"

            );

        root.id =

            "gg-ai-panel";

        root.className =

            "gg-ai-panel";



        /*---------------- Header ----------------*/

        header =

            document.createElement(

                "div"

            );

        header.className =

            "gg-ai-header";



        const title =

            document.createElement(

                "div"

            );

        title.className =

            "gg-ai-title";

        title.textContent =

            "GreenGuard AI";



        minimizeButton =

            document.createElement(

                "button"

            );

        minimizeButton.className =

            "gg-ai-minimize";

        minimizeButton.innerHTML =

            "—";



        closeButton =

            document.createElement(

                "button"

            );

        closeButton.className =

            "gg-ai-close";

        closeButton.innerHTML =

            "✕";



        header.appendChild(

            title

        );

        header.appendChild(

            minimizeButton

        );

        header.appendChild(

            closeButton

        );



        /*---------------- Body ----------------*/

        body =

            document.createElement(

                "div"

            );

        body.className =

            "gg-ai-body";



        messages =

            document.createElement(

                "div"

            );

        messages.id =

            "gg-ai-messages";

        messages.className =

            "gg-ai-messages";



        body.appendChild(

            messages

        );



        /*---------------- Footer ----------------*/

        footer =

            document.createElement(

                "div"

            );

        footer.className =

            "gg-ai-footer";



        input =

            document.createElement(

                "textarea"

            );

        input.className =

            "gg-ai-input";

        input.placeholder =

            "Ask GreenGuard AI...";



        sendButton =

            document.createElement(

                "button"

            );

        sendButton.className =

            "gg-ai-send";

        sendButton.textContent =

            "Send";



        footer.appendChild(

            input

        );

        footer.appendChild(

            sendButton

        );



        /*---------------- Assemble ----------------*/

        root.appendChild(

            header

        );

        root.appendChild(

            body

        );

        root.appendChild(

            footer

        );



        document.body.appendChild(

            root

        );



        Render.init(

            messages

        );

    }

     /*----------------------------------------------------------
      INITIALIZE
    ----------------------------------------------------------*/

    Panel.init = function () {

        if (ready)
            return true;

        createUI();

        bindEvents();

        root.style.display =

            "none";

        ready = true;

        Config.log(

            "Panel",

            "Initialized"

        );

        return true;

    };



    /*----------------------------------------------------------
      OPEN
    ----------------------------------------------------------*/

    Panel.open = function () {

        if (!ready)
            Panel.init();

        root.style.display =

            "flex";

        opened = true;

       Render.autoScroll();

requestAnimationFrame(

    () => input.focus()

);

    };



    /*----------------------------------------------------------
      CLOSE
    ----------------------------------------------------------*/

    Panel.close = function () {

        if (!ready)
            return;

        root.style.display =

            "none";

        opened = false;

    };



    /*----------------------------------------------------------
      TOGGLE
    ----------------------------------------------------------*/

    Panel.toggle = function () {

        if (opened)

            Panel.close();

        else

            Panel.open();

    };



    /*----------------------------------------------------------
      MINIMIZE
    ----------------------------------------------------------*/

    Panel.minimize = function () {

        body.style.display =

            "none";

        footer.style.display =

            "none";

    };



    /*----------------------------------------------------------
      RESTORE
    ----------------------------------------------------------*/

    Panel.restore = function () {

        body.style.display =

            "";

        footer.style.display =

            "";

    };



    /*----------------------------------------------------------
      IS OPEN
    ----------------------------------------------------------*/

    Panel.isOpen = function () {

        return opened;

    };

     /*----------------------------------------------------------
      SEND MESSAGE
    ----------------------------------------------------------*/

    async function sendMessage() {

       const query =

    input.value.trim();

if (!query)
    return;

if (

    Core.isBusy()

) {

    return;

}

input.value = "";

Render.appendMessage(

    "user",

    query

);

Render.showTyping();

sendButton.disabled = true;

        try {

            const result =

                await Core.ask(

                    query

                );

            Render.hideTyping();

            if (

                result.success

            ) {

let answer;

if (

    window.GreenGuardAI.Formatter

) {

    answer =

        window.GreenGuardAI.Formatter.format(

            result.answer

        );

}

else {

    answer =

        typeof result.answer ===

        "string"

            ? result.answer

            : result.answer?.text ||

              result.answer?.message ||

              JSON.stringify(

                  result.answer,

                  null,

                  2

              );

}

const msg =

    Render.appendMessage(

        "assistant",

        answer

    );

Render.enableCopy(

    msg,

    answer

);

            }

            else {

               Render.error(

    result.error ||

    "AI request failed."

);

            }

        }

        catch (err) {

            Render.hideTyping();

            Render.error(

                err.message ||

                String(err)

            );

        }

        finally {

            sendButton.disabled = false;

            input.focus();

        }

    };



    /*----------------------------------------------------------
      BIND EVENTS
    ----------------------------------------------------------*/

    function bindEvents() {

        sendButton.onclick =

            sendMessage;



        input.addEventListener(

            "keydown",

            function(e){

                if(

                    e.key === "Enter" &&

                    !e.shiftKey

                ){

                    e.preventDefault();

                    sendMessage();

                }

            }

        );



        closeButton.onclick =

            function(){

                Panel.close();

            };



        minimizeButton.onclick =

            function(){

                if(

                    body.style.display ===

                    "none"

                ){

                    Panel.restore();

                }

                else{

                    Panel.minimize();

                }

            };

    }

     /*----------------------------------------------------------
      DESTROY
    ----------------------------------------------------------*/

    Panel.destroy = function () {

        if (

            root &&

            root.parentNode

        ) {

            root.parentNode.removeChild(

                root

            );

        }

        ready = false;

        opened = false;

        root = null;

        header = null;

        body = null;

        footer = null;

        messages = null;

        input = null;

        sendButton = null;

        closeButton = null;

        minimizeButton = null;

    };



    /*----------------------------------------------------------
      RESET
    ----------------------------------------------------------*/

    Panel.reset = function () {

        if (

            messages

        ) {

            Render.clear();

        }

        if (

            input

        ) {

            input.value = "";

        }

    };



    /*----------------------------------------------------------
      INFO
    ----------------------------------------------------------*/

    Panel.info = function () {

        return {

            ready:

                ready,

            opened:

                opened,

            messages:

                Render.messageCount(),

            busy:

                Core.isBusy()

        };

    };



    /*----------------------------------------------------------
      SHORTCUT
    ----------------------------------------------------------*/

    document.addEventListener(

        "keydown",

        function(e){

            if(

                e.ctrlKey &&

                e.shiftKey &&

                e.key === "A"

            ){

                e.preventDefault();

                Panel.toggle();

            }

        }

    );


    /*----------------------------------------------------------
      REGISTER
    ----------------------------------------------------------*/

    window.GreenGuardAI.Panel =

        Panel;



    /*----------------------------------------------------------
      AUTO INITIALIZE
    ----------------------------------------------------------*/

    function initializePanel() {

        try {

            Panel.init();

            Config.log(

                "Panel",

                "Ready"

            );

        }

        catch (err) {

            Config.error(

                "Panel.init",

                err

            );

        }

    }



    if (

        document.readyState ===

        "loading"

    ) {

        document.addEventListener(

            "DOMContentLoaded",

            initializePanel,

            {

                once: true

            }

        );

    }

    else {

        initializePanel();

    }



    /*----------------------------------------------------------
      LOADED
    ----------------------------------------------------------*/

    console.log(

        "%cGreenGuard AI Panel Loaded",

        "color:#009688;font-weight:bold;"

    );

})(window);
