"use strict";

/*
==========================================================
 GreenGuard AI Responder
==========================================================
*/

const Responder = {};

/*----------------------------------------------------------
Success
----------------------------------------------------------*/

Responder.success = function({

    query,

    intent,

    reply,

    toolCalls,

    usage,

    planner

}){

    return{

        success:true,

        query,

        intent,

        planner:planner||null,

        tool_calls:toolCalls||[],

        usage:usage||null,

        reply:reply||""

    };

};

/*----------------------------------------------------------
Error
----------------------------------------------------------*/

Responder.error=function(message){

    return{

        success:false,

        error:message||"Unknown Error"

    };

};

/*----------------------------------------------------------
Tool Call Response
----------------------------------------------------------*/

Responder.toolCalls=function({

    query,

    intent,

    planner,

    toolCalls

}){

    return{

        success:true,

        query,

        intent,

        planner,

        tool_calls:toolCalls

    };

};

module.exports=Responder;