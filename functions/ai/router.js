"use strict";

const Router = {};

/*----------------------------------------------------------
Knowledge Keywords
----------------------------------------------------------*/

Router.KEYWORDS = {

    legal: [

        "section",

        "wlpa",

        "wildlife protection act",

        "indian forest act",

        "forest conservation act",

        "forest rights act",

        "act",

        "rule",

        "offence",

        "offense",

        "penalty",

        "punishment",

        "schedule",

        "bailable",

        "non bailable",

        "seizure",

        "arrest"

    ],

    sop: [

        "sop",

        "protocol",

        "procedure",

        "camera trap",

        "elephant driving",

        "tranquilization",

        "patrolling guideline"

    ],

    guideline: [

        "guideline",

        "ntca",

        "moefcc",

        "circular",

        "notification"

    ],

    court: [

        "court",

        "judgement",

        "judgment",

        "supreme court",

        "high court",

        "tribunal"

    ],

    research: [

        "research",

        "paper",

        "journal",

        "study",

        "publication"

    ]

};

/*----------------------------------------------------------
Contains Keyword
----------------------------------------------------------*/

Router.contains = function (

    query,

    words

) {

    query =

        String(query)

        .toLowerCase();

    return words.some(

        word =>

        query.includes(

            word

        )

    );

};

/*----------------------------------------------------------
Need Knowledge
----------------------------------------------------------*/

Router.needKnowledge = function (

    query

) {

    for (

        const category of

        Object.keys(

            Router.KEYWORDS

        )

    ) {

        if (

            Router.contains(

                query,

                Router.KEYWORDS[category]

            )

        ) {

            return {

                enabled: true,

                category

            };

        }

    }

    return {

        enabled: false,

        category: null

    };

};

module.exports = Router;