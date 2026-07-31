"use strict";

const TaskPlanner = {};

/*----------------------------------------------------------
Task Catalog
----------------------------------------------------------*/

TaskPlanner.catalog = [

{
name:"getGIS",
keywords:[
"beat",
"range",
"division",
"compartment",
"map",
"area",
"polygon"
]
},

{
name:"getAnalytics",
keywords:[
"coverage",
"analytics",
"distance",
"ranking",
"monthly",
"compare",
"patrol"
]
},

{
name:"knowledge",
keywords:[
"act",
"section",
"guideline",
"sop",
"protocol",
"ntca",
"court",
"judgement",
"judgment",
"research",
"circular"
]
},

{
name:"getLiveStaff",
keywords:[
"staff",
"officer",
"duty",
"profile",
"employee"
]
},

{
name:"generateReport",
keywords:[
"report",
"briefing",
"summary",
"pdf"
]
}

];

/*----------------------------------------------------------
Build Tasks
----------------------------------------------------------*/

TaskPlanner.build=function(query){

query=String(query).toLowerCase();

const tasks=[];

for(const item of TaskPlanner.catalog){

for(const word of item.keywords){

if(query.includes(word)){

if(!tasks.includes(item.name)){

tasks.push(item.name);

}

break;

}

}

}

return tasks;

};

/*----------------------------------------------------------
Need RAG
----------------------------------------------------------*/

TaskPlanner.needKnowledge=function(tasks){

return tasks.includes("knowledge");

};

module.exports=TaskPlanner;