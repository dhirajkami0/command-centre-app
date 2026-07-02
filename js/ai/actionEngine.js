(function (window) {

"use strict";

/*=========================================================
 NAMESPACE
=========================================================*/

const GG =
    window.GreenGuardAI =
    window.GreenGuardAI || {};

if (

    GG.ActionEngine

) {

    return;

}

const ActionEngine = {};

/*=========================================================
 ACTION REGISTRY
=========================================================*/

ActionEngine.registry =

    Object.create(

        null

    );

/*=========================================================
 REGISTER
=========================================================*/

ActionEngine.register = function (

    action,

    handler

) {

    if (

        typeof action !== "string"

    ) {

        return;

    }

    if (

        typeof handler !==

        "function"

    ) {

        return;

    }

    ActionEngine.registry[

        action

    ] = handler;

};

/*=========================================================
 EXECUTE
=========================================================*/

ActionEngine.execute = function (

    action

) {

    if (

        !action ||

        !action.type

    ) {

        return false;

    }

    const handler =

        ActionEngine.registry[

            action.type

        ];

    if (

        !handler

    ) {

        console.warn(

            "Unknown AI Action:",

            action.type

        );

        return false;

    }

    try {

        handler(

            action

        );

        return true;

    }

    catch (

        err

    ) {

        console.error(

            err

        );

        return false;

    }

};

/*=========================================================
 LISTENER
=========================================================*/

document.addEventListener(

    "GreenGuardAIAction",

    function (

        e

    ) {

        ActionEngine.execute(

            e.detail

        );

    }

);

/*=========================================================
 REGISTER
=========================================================*/

GG.ActionEngine =

    ActionEngine;

console.log(

    "%cGreenGuard Action Engine Loaded",

    "color:#009688;font-weight:bold;"

);

})(window);
