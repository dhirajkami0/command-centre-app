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
    Tools.register(

    "getArea",

    async (args = {}) => {

        const name =
            (args.name || "")
            .trim()
            .toUpperCase();

        let feature = null;

        feature =
            (window.allCompartmentFeatures || [])
            .find(f =>

                String(
                    f.properties.compartment ||
                    f.properties.Compartment
                )
                .trim()
                .toUpperCase() === name

            );

        if (!feature) {

            feature =
                (window.allGISFeatures || [])
                .find(f =>

                    String(
                        f.properties.Range ||
                        f.properties.range ||
                        f.properties.Beat ||
                        f.properties.beat ||
                        f.properties.Division ||
                        f.properties.division
                    )
                    .trim()
                    .toUpperCase() === name

                );
        }

        if (!feature) {

            return {
                success: false,
                error: "Polygon not found."
            };

        }

        const sqm =
            turf.area(feature);

        return {

            success: true,

            areaSqM:
                sqm,

            areaHa:
                sqm / 10000,

            areaSqKm:
                sqm / 1000000

        };

    }

);
/*----------------------------------------------------------
  EXPORT
----------------------------------------------------------*/

window.GreenGuardAI.Tools =
    Tools;

})(window);
