"use strict";

/*
==========================================================
GreenGuard AI v2
AI Kernel
==========================================================
*/

const Registry =
require("./registry");
const Loader =
require("./loader");
class AIKernel{

    constructor(){

        this.version="2.0.0";

        this.initialized=false;

    }

    /*
    ---------------------------------------
    Initialize
    ---------------------------------------
    */

    init(){

    if(this.initialized){

        return;

    }

    Loader.load();

    this.initialized = true;
        console.log(

            "GreenGuard AI Kernel",

            this.version,

            "initialized"

        );

    }

    /*
    ---------------------------------------
    Registered Modules
    ---------------------------------------
    */

    modules(){

        return Registry.getModules();

    }

    /*
    ---------------------------------------
    OpenAI Tool List
    ---------------------------------------
    */

    tools(){

        return Registry.getTools();

    }

    /*
    ---------------------------------------
    Tool Names
    ---------------------------------------
    */

    toolNames(){

        return Registry.getToolNames();

    }

    /*
    ---------------------------------------
    Find Tool
    ---------------------------------------
    */

    tool(name){

        return Registry.findTool(name);

    }

    /*
    ---------------------------------------
    Exists?
    ---------------------------------------
    */

    hasTool(name){

        return Registry.has(name);

    }

    /*
    ---------------------------------------
    Version
    ---------------------------------------
    */

    info(){

        return{

            version:this.version,

            initialized:this.initialized,

            moduleCount:

                Registry

                .getModules()

                .length,

            toolCount:

                Registry

                .getTools()

                .length

        };

    }

}

module.exports=

new AIKernel();