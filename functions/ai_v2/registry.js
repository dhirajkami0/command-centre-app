"use strict";

/*
==========================================================
 GreenGuard AI v2
 Tool Registry
==========================================================
*/

class ToolRegistry {

    constructor(){

        this.modules = [];

    }

    register(module){

        if(!module){

            return;

        }

        this.modules.push(module);

    }

    getModules(){

        return [...this.modules];

    }

    getTools(){

        const tools=[];

        for(const module of this.modules){

            if(

                !module ||

                !Array.isArray(module.tools)

            ){

                continue;

            }

            tools.push(...module.tools);

        }

        return tools;

    }

    getToolNames(){

        return this

        .getTools()

        .map(

            t=>t.function.name

        );

    }

    findTool(name){

        return this

        .getTools()

        .find(

            t=>

            t.function.name===name

        );

    }

    has(name){

        return !!this.findTool(name);

    }

}

module.exports =

new ToolRegistry();