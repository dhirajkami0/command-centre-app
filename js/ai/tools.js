(function (window) {

"use strict";

window.GreenGuardAI =
    window.GreenGuardAI || {};

const Tools = {};

const registry = {};

Tools.register = function (

    name,

    fn

){

    registry[name] = fn;

};

Tools.execute = async function (

    name,

    args = {}

){

    if(

        !registry[name]

    ){

        throw new Error(

            "Unknown tool: " + name

        );

    }

    return await registry[name](

        args

    );

};

Tools.list = function(){

    return Object.keys(

        registry

    );

};

/*----------------------------------------------------------
  REGISTER BUILT-IN TOOLS
----------------------------------------------------------*/

Tools.register(

    "getProfile",

    async ()=>{

        return GreenGuardAI
            .Context
            .getProfile();

    }

);

Tools.register(

    "getDuty",

    async ()=>{

        return GreenGuardAI
            .Context
            .getDuty();

    }

);

Tools.register(

    "getLiveStaff",

    async ()=>{

        return GreenGuardAI
            .Context
            .getLiveStaff();

    }

);

Tools.register(

    "getPatrol",

    async ()=>{

        return GreenGuardAI
            .Context
            .getPatrol();

    }

);

Tools.register(

    "getGIS",

    async ()=>{

        return GreenGuardAI
            .Context
            .getGIS();

    }

);

Tools.register(

    "getAnalytics",

    async ()=>{

        return GreenGuardAI
            .Context
            .getAnalytics();

    }

);

/*----------------------------------------------------------
  EXPORT
----------------------------------------------------------*/

window.GreenGuardAI.Tools =
    Tools;

})(window);
