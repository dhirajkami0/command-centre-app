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
  EXTRA BUILT-IN TOOLS
----------------------------------------------------------*/

Tools.register(

    "getLocation",

    async ()=>{

        return GreenGuardAI
            .Context
            .getLocation();

    }

);

Tools.register(

    "getSelection",

    async ()=>{

        return GreenGuardAI
            .Context
            .getSelection();

    }

);

Tools.register(

    "searchSpecies",

    async (

        args = {}

    )=>{

        if(

            typeof window.searchSpecies ===

            "function"

        ){

            return await window.searchSpecies(

                args.name || ""

            );

        }

        return {

            error:

                "searchSpecies not implemented"

        };

    }

);

Tools.register(

    "searchLegal",

    async (

        args = {}

    )=>{

        if(

            typeof window.searchLegal ===

            "function"

        ){

            return await window.searchLegal(

                args.query || ""

            );

        }

        return {

            error:

                "searchLegal not implemented"

        };

    }

);
    /*----------------------------------------------------------
  OPERATIONAL TOOLS
----------------------------------------------------------*/

Tools.register(

    "getSightings",

    async ()=>{

        return await window.callBackend(

            "getSightings"

        );

    }

);

Tools.register(

    "getWeather",

    async ()=>{

        return await window.callBackend(

            "getWeatherFull"

        );

    }

);

Tools.register(

    "getVillages",

    async ()=>{

        return await window.callBackend(

            "getVillages"

        );

    }

);

Tools.register(

    "getMapData",

    async ()=>{

        return await window.callBackend(

            "getMapData"

        );

    }

);
/*----------------------------------------------------------
  EXPORT
----------------------------------------------------------*/

window.GreenGuardAI.Tools =
    Tools;

})(window);
