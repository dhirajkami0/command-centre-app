"use strict";

const IntentClassifier =
require("./intentClassifier");

const RouterAI = {};

/*----------------------------------------------------------
Configuration
----------------------------------------------------------*/

RouterAI.MODEL = "gpt-4o";

/*----------------------------------------------------------
Classify Intent
----------------------------------------------------------*/

RouterAI.classify = async function (

    client,

    query

) {

    const response =

        await client.chat.completions.create({

            model:

                RouterAI.MODEL,

            temperature: 0,

            response_format: {

                type: "json_object"

            },

            messages:

                IntentClassifier.prompt(

                    query

                )

        });

    const content =

        response

        ?.choices?.[0]

        ?.message?.content ||

        "{}";

    return IntentClassifier.parse(

        content

    );

};

/*----------------------------------------------------------
Route
----------------------------------------------------------*/

RouterAI.route = async function (

    client,

    query

){

    const FastRouter =
    require("./fastRouter");

    const fast =
    FastRouter.detect(query);

    if(

        fast.intent

    ){

        return fast;

    }

    return await RouterAI.classify(

        client,

        query

    );

};
/*----------------------------------------------------------
Need Knowledge
----------------------------------------------------------*/

RouterAI.needKnowledge = function (

    route

) {

    if (!route) {

        return false;

    }

    return [

        "legal",

        "knowledge",

        "wildlife"

    ].includes(

        String(

            route.intent

        ).toLowerCase()

    );

};

/*----------------------------------------------------------
Need Staff
----------------------------------------------------------*/

RouterAI.needStaff = function (

    route

) {

    return (

        route &&

        route.intent ===

        "staff"

    );

};

/*----------------------------------------------------------
Need Patrol
----------------------------------------------------------*/

RouterAI.needPatrol = function (

    route

) {

    return (

        route &&

        route.intent ===

        "patrol"

    );

};

/*----------------------------------------------------------
Need Analytics
----------------------------------------------------------*/

RouterAI.needAnalytics = function (

    route

) {

    return (

        route &&

        route.intent ===

        "analytics"

    );

};

/*----------------------------------------------------------
Need GIS
----------------------------------------------------------*/

RouterAI.needGIS = function (

    route

) {

    return (

        route &&

        route.intent ===

        "gis"

    );

};

/*----------------------------------------------------------
Need Report
----------------------------------------------------------*/

RouterAI.needReport = function (

    route

) {

    return (

        route &&

        route.intent ===

        "report"

    );

};

/*----------------------------------------------------------
Need System
----------------------------------------------------------*/

RouterAI.needSystem = function (

    route

) {

    return (

        route &&

        route.intent ===

        "system"

    );

};

module.exports = RouterAI;