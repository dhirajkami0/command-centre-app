"use strict";

const FastRouter = {};

FastRouter.rules = [

{
intent:"staff",
words:[
"staff",
"employee",
"officer",
"team leader",
"live staff",
"profile",
"duty"
]
},

{
intent:"analytics",
words:[
"coverage",
"analytics",
"statistics",
"ranking",
"distance",
"patrol summary",
"heatmap",
"monthly"
]
},

{
intent:"patrol",
words:[
"patrol",
"track",
"gps",
"route",
"session"
]
},

{
intent:"gis",
words:[
"beat",
"range",
"division",
"compartment",
"area",
"polygon",
"gis",
"map"
]
},

{
intent:"legal",
words:[
"section",
"wlpa",
"wildlife protection act",
"forest act",
"court",
"schedule",
"offence",
"penalty",
"punishment"
]
},

{
intent:"knowledge",
words:[
"sop",
"guideline",
"research",
"circular",
"ntca",
"protocol"
]
},

{
intent:"wildlife",
words:[
"species",
"elephant",
"tiger",
"rhino",
"animal",
"bird"
]
},

{
intent:"report",
words:[
"report",
"pdf",
"briefing",
"summary"
]
}

];

/*----------------------------------------------------------*/

FastRouter.detect=function(query){

query=String(query).toLowerCase();

for(const rule of FastRouter.rules){

for(const word of rule.words){

if(query.includes(word)){

return{

intent:rule.intent,

confidence:1

};

}

}

}

return{

intent:null,

confidence:0

};

};

module.exports=FastRouter;