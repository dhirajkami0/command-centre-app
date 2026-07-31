"use strict";

/*
==========================================================
 GreenGuard AI Planner v2
==========================================================
*/

const Planner = {};

Planner.RULES = [

{
    intent: "analytics",

    priority: 100,

    tools: [

        "analyticsQuery",
        "getAnalytics",
        "getMonthlyStatus",
        "compareMonths"

    ],

    keywords: [

        "analytics",
        "coverage",
        "patrol",
        "ranking",
        "statistics",
        "summary",
        "monthly",
        "performance",
        "beat",
        "range",
        "division",
        "compartment"

    ]

},

{
    intent: "patrol",

    priority: 90,

    tools: [

        "getPatrol",
        "predictPatrolPriority"

    ],

    keywords: [

        "patrol",
        "track",
        "gps",
        "route",
        "distance",
        "session"

    ]

},

{
    intent: "staff",

    priority: 80,

    tools: [

        "getProfile",
        "getDuty",
        "getLiveStaff"

    ],

    keywords: [

        "staff",
        "officer",
        "employee",
        "duty",
        "team",
        "profile"

    ]

},

{
    intent: "gis",

    priority: 70,

    tools: [

        "getGIS",
        "getSelection",
        "getLocation",
        "getArea",
        "getMapData"

    ],

    keywords: [

        "map",
        "location",
        "gps",
        "beat",
        "range",
        "division",
        "compartment",
        "area"

    ]

},

{
    intent: "wildlife",

    priority: 60,

    tools: [

        "searchSpecies",
        "getSightings",
        "predictElephantMovement",
        "getWeather"

    ],

    keywords: [

        "elephant",
        "species",
        "wildlife",
        "animal",
        "herd",
        "movement",
        "sighting"

    ]

},

{
    intent: "legal",

    priority: 50,

    tools: [

        "searchLegal",
        "searchCourtCases",
        "searchResearch"

    ],

    keywords: [

        "legal",
        "wlpa",
        "section",
        "act",
        "court",
        "judgement",
        "offence"

    ]

}

];

/*
----------------------------------------------------------
Detect All Intents
----------------------------------------------------------
*/

Planner.detect = function(query=""){

    query =
    String(query).toLowerCase();

    const intents = [];

    for(const rule of Planner.RULES){

        let score = 0;

        for(const word of rule.keywords){

            if(query.includes(word)){

                score++;

            }

        }

        if(score>0){

            intents.push({

                intent:rule.intent,

                priority:rule.priority,

                score,

                tools:rule.tools

            });

        }

    }

    intents.sort((a,b)=>{

        if(b.score!==a.score){

            return b.score-a.score;

        }

        return b.priority-a.priority;

    });

    return intents;

};

/*
----------------------------------------------------------
Primary Intent
----------------------------------------------------------
*/

Planner.detectIntent=function(query){

    const list=

    Planner.detect(query);

    if(!list.length){

        return "general";

    }

    return list[0].intent;

};

/*
----------------------------------------------------------
Tool Recommendation
----------------------------------------------------------
*/

Planner.recommendTools=function(query){

    const list=

    Planner.detect(query);

    const tools=[];

    const used={};

    for(const item of list){

        for(const t of item.tools){

            if(!used[t]){

                used[t]=true;

                tools.push(t);

            }

        }

    }

    return tools;

};

/*
----------------------------------------------------------
Context Builder
----------------------------------------------------------
*/

Planner.buildContext=function({

    query,

    intent,

    context

}){

    return{

        query,

        intent,

        context,

        planner:{

            intents:

            Planner.detect(query),

            recommendedTools:

            Planner.recommendTools(query)

        }

    };

};

module.exports=Planner;