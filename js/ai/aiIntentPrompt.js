(function (window) {

"use strict";

/*=========================================================
 NAMESPACE
=========================================================*/

const GG =

    window.GreenGuardAI =

    window.GreenGuardAI || {};

/*=========================================================
 PREVENT DOUBLE LOADING
=========================================================*/

if (

    GG.AIIntentPrompt

) {

    console.warn(

        "[GreenGuardAI] AI Intent Prompt already loaded."

    );

    return;

}

/*=========================================================
 MODULE
=========================================================*/

const AIIntentPrompt = {};

/*=========================================================
 INFO
=========================================================*/

AIIntentPrompt.VERSION =

    "1.0.0";

AIIntentPrompt.initialized =

    false;

/*=========================================================
 INIT
=========================================================*/

AIIntentPrompt.init = function () {

    if (

        AIIntentPrompt.initialized

    ) {

        return;

    }

    AIIntentPrompt.initialized =

        true;

    console.log(

        "%cGreenGuard AI Intent Prompt Ready",

        "color:#673AB7;font-weight:bold;"

    );

};

/*=========================================================
 REGISTER
=========================================================*/

GG.AIIntentPrompt =

    AIIntentPrompt;

console.log(

    "%cGreenGuard AI Intent Prompt Loaded",

    "color:#673AB7;font-weight:bold;"

);

})(window);
