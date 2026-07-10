/*!
 * GreenGuard AI
 * router.js
 * Version : 1.0.0
 * Production Safe
 *
 * Depends:
 *   GreenGuardAI.Config
 *   GreenGuardAI.Cache
 *   GreenGuardAI.Context
 */

(function (window) {

    "use strict";

    /*----------------------------------------------------------
      Namespace
    ----------------------------------------------------------*/

    window.GreenGuardAI =
        window.GreenGuardAI || {};

    if (window.GreenGuardAI.Router) {

        console.warn(
            "[GreenGuardAI] Router already loaded."
        );

        return;

    }

    /*----------------------------------------------------------
      Dependency Check
    ----------------------------------------------------------*/

    if (!window.GreenGuardAI.Config) {

        console.error(
            "[GreenGuardAI] Config module missing."
        );

        return;

    }

    if (!window.GreenGuardAI.Cache) {

        console.error(
            "[GreenGuardAI] Cache module missing."
        );

        return;

    }

    if (!window.GreenGuardAI.Context) {

        console.error(
            "[GreenGuardAI] Context module missing."
        );

        return;

    }

    const Config =
        window.GreenGuardAI.Config;

    const Cache =
        window.GreenGuardAI.Cache;

    const Context =
        window.GreenGuardAI.Context;

    const Router = {};

    /*----------------------------------------------------------
      Private State
    ----------------------------------------------------------*/

    let ready = false;

    let lastIntent = null;

    let lastRoute = null;

    let lastQuery = "";

    let lastScore = 0;

    let lastContext = null;

    /*----------------------------------------------------------
      Route Constants
    ----------------------------------------------------------*/

    const ROUTES = Object.freeze({

        GENERAL:
            "general",

        OPERATIONAL:
            "operational",

        PATROL:
            "patrol",

        GIS:
            "gis",

        ANALYTICS:
            "analytics",

        WILDLIFE:
            "wildlife",

        SPECIES:
            "species",

        LEGAL:
            "legal",

        REPORT:
            "report",

        MAP:
            "map",

        STAFF:
            "staff",

        SEARCH:
            "search",

        UNKNOWN:
            "unknown"

    });

    Router.ROUTES = ROUTES;

    /*----------------------------------------------------------
      Route Priority
    ----------------------------------------------------------*/

    const PRIORITY = Object.freeze({

        legal: 100,

        wildlife: 95,

        species: 95,

        patrol: 90,

        operational: 85,

        analytics: 80,

        gis: 75,

        report: 70,

        map: 60,

        staff: 50,

        search: 40,

        general: 10,

        unknown: 0

    });

    /*----------------------------------------------------------
      Initialization
    ----------------------------------------------------------*/

    Router.init = async function () {

        if (ready)
            return true;

        try {

            await Cache.init();

            await Context.init();

            ready = true;

            Config.log(
                "Router",
                "Initialized"
            );

            return true;

        }

        catch (err) {

            Config.error(
                "Router.init",
                err
            );

            return false;

        }

    };

    /*----------------------------------------------------------
      Status
    ----------------------------------------------------------*/

    Router.isReady = function () {

        return ready;

    };

    /*----------------------------------------------------------
      Last Route
    ----------------------------------------------------------*/

    Router.lastRoute = function () {

        return lastRoute;

    };

    /*----------------------------------------------------------
      Last Intent
    ----------------------------------------------------------*/

    Router.lastIntent = function () {

        return lastIntent;

    };

    /*----------------------------------------------------------
      Last Score
    ----------------------------------------------------------*/

    Router.lastScore = function () {

        return lastScore;

    };

    /*----------------------------------------------------------
      Last Query
    ----------------------------------------------------------*/

    Router.lastQuery = function () {

        return lastQuery;

    };

    /*----------------------------------------------------------
      Last Context
    ----------------------------------------------------------*/

    Router.lastContext = function () {

        return Config.clone(
            lastContext
        );

    };
      /*----------------------------------------------------------
      INTENTS
    ----------------------------------------------------------*/

    const INTENTS = Object.freeze({

        GENERAL: "general",

        OPERATIONAL: "operational",

        STAFF: "staff",

        PATROL: "patrol",

        GIS: "gis",

        MAP: "map",

        ANALYTICS: "analytics",

        REPORT: "report",

        WILDLIFE: "wildlife",

        SPECIES: "species",

        LEGAL: "legal",

        SEARCH: "search",

        UNKNOWN: "unknown"

    });

    Router.INTENTS = INTENTS;

     /*----------------------------------------------------------
      KEYWORDS : GENERAL
    ----------------------------------------------------------*/

    const KEYWORDS = {};

    KEYWORDS.general = [

        "hello",

        "hi",

        "hey",

        "help",

        "what",

        "who",

        "where",

        "when",

        "why",

        "how",

        "status",

        "information",

        "details",

        "show",

        "display",

        "list",

        "find",

        "search",

        "locate",

        "open",

        "view",

        "summary",

        "overview",

        "dashboard",

        "green guard",

        "greenguard",

        "command centre",

        "command center",

        "forest",

        "btr",

        "division",

        "range",

        "beat",

        "compartment"

    ];

    Object.freeze(

        KEYWORDS.general

    );
      /*----------------------------------------------------------
      KEYWORDS : STAFF
    ----------------------------------------------------------*/

    KEYWORDS.staff = [

        "staff",

        "employee",

        "forest guard",

        "forest watcher",

        "forester",

        "beat officer",

        "range officer",

        "team",

        "team leader",

        "officer",

        "personnel",

        "patrolling staff",

        "field staff",

        "on duty",

        "duty",

        "active",

        "inactive",

        "online",

        "offline",

        "location",

        "current location",

        "last location",

        "gps",

        "live staff",

        "live location",

        "attendance",

        "who is on duty",

        "who is online",

        "who is active",

        "staff status",

        "staff list",

        "staff performance",

        "staff movement",

        "mobile",

        "phone",

        "profile"

    ];

    Object.freeze(

        KEYWORDS.staff

    );
      /*----------------------------------------------------------
      KEYWORDS : PATROL
    ----------------------------------------------------------*/

    KEYWORDS.patrol = [

        "patrol",

        "patrolling",

        "track",

        "tracks",

        "tracking",

        "gps",

        "route",

        "path",

        "movement",

        "travel",

        "journey",

        "visited",

        "visited grids",

        "coverage",

        "covered area",

        "coverage percentage",

        "distance",

        "distance covered",

        "walk",

        "walking",

        "drive",

        "driving",

        "speed",

        "heading",

        "bearing",

        "accuracy",

        "location history",

        "history",

        "timeline",

        "session",

        "active session",

        "patrol session",

        "duty session",

        "kml",

        "export kml",

        "download kml",

        "share kml",

        "track points",

        "gps points",

        "break track",

        "start patrol",

        "stop patrol",

        "resume patrol",

        "patrol report",

        "today patrol",

        "current patrol",

        "patrol status",

        "patrol performance"

    ];

    Object.freeze(

        KEYWORDS.patrol

    );

    /*----------------------------------------------------------
      KEYWORDS : GIS
    ----------------------------------------------------------*/

    KEYWORDS.gis = [

        "gis",

        "map",

        "maps",

        "mapping",

        "leaflet",

        "satellite",

        "imagery",

        "hybrid",

        "terrain",

        "forest map",

        "compartment",

        "compartments",

        "beat",

        "beats",

        "range",

        "ranges",

        "division",

        "divisions",

        "polygon",

        "boundary",

        "boundaries",

        "geojson",

        "geometry",

        "feature",

        "features",

        "grid",

        "grids",

        "cell",

        "cells",

        "visited cell",

        "coverage grid",

        "layer",

        "layers",

        "overlay",

        "marker",

        "markers",

        "coordinate",

        "coordinates",

        "latitude",

        "longitude",

        "bbox",

        "extent",

        "area",

        "buffer",

        "intersection",

        "spatial",

        "location",

        "zoom",

        "center",

        "heatmap",

        "cluster"

    ];

    Object.freeze(

        KEYWORDS.gis

    );

     /*----------------------------------------------------------
      KEYWORDS : ANALYTICS
    ----------------------------------------------------------*/

    KEYWORDS.analytics = [

        "analytics",

        "analysis",

        "statistics",

        "stats",

        "summary",

        "overview",

        "performance",

        "dashboard",

        "report",

        "reports",

        "monthly",

        "daily",

        "weekly",

        "yearly",

        "today",

        "yesterday",

        "coverage",

        "coverage percentage",

        "covered area",

        "visited",

        "visited cells",

        "visited grids",

        "patrol efficiency",

        "efficiency",

        "productivity",

        "distance",

        "distance covered",

        "sessions",

        "session count",

        "staff performance",

        "live staff",

        "active staff",

        "compartment summary",

        "beat summary",

        "range summary",

        "division summary",

        "heatmap",

        "trend",

        "trends",

        "comparison",

        "compare",

        "growth",

        "progress",

        "target",

        "achievement",

        "monthly status",

        "realtime analytics",

        "analytics summary",
        "most visited",
"least visited",
"top compartment",
"top compartments",
"ranking",
"rank",
"visit ranking",
"compartment ranking",
"highest coverage",
"lowest coverage",
"top 10",
"most patrol",
"patrol ranking"

    ];

    Object.freeze(

        KEYWORDS.analytics

    );

     /*----------------------------------------------------------
      KEYWORDS : REPORT
    ----------------------------------------------------------*/

    KEYWORDS.report = [

        "report",

        "reports",

        "generate report",

        "create report",

        "download report",

        "export report",

        "share report",

        "pdf",

        "excel",

        "csv",

        "print",

        "summary report",

        "daily report",

        "weekly report",

        "monthly report",

        "annual report",

        "patrol report",

        "coverage report",

        "staff report",

        "duty report",

        "incident report",

        "wildlife report",

        "elephant report",

        "fire report",

        "analytics report",

        "performance report",

        "gis report",

        "map report",

        "kml report",

        "geojson report",

        "attendance report",

        "movement report",

        "activity report",

        "inspection report",

        "field report",

        "forest report",

        "case report",

        "seizure report",

        "intelligence report",

        "brief",

        "briefing",

        "document",

        "generate pdf",

        "export pdf",

        "save report"

    ];

    Object.freeze(

        KEYWORDS.report

    );

     /*----------------------------------------------------------
      KEYWORDS : WILDLIFE
    ----------------------------------------------------------*/

    KEYWORDS.wildlife = [

        "wildlife",

        "animal",

        "animals",

        "species",

        "mammal",

        "bird",

        "reptile",

        "amphibian",

        "fish",

        "elephant",

        "tiger",

        "leopard",

        "gaur",

        "bison",

        "rhino",

        "deer",

        "hog deer",

        "sambar",

        "barking deer",

        "wild boar",

        "python",

        "cobra",

        "king cobra",

        "monitor lizard",

        "tortoise",

        "turtle",

        "pangolin",

        "hornbill",

        "peacock",

        "owl",

        "eagle",

        "vulture",

        "rescued",

        "rescue",

        "release",

        "capture",

        "conflict",

        "human wildlife conflict",

        "depredation",

        "crop damage",

        "livestock",

        "attack",

        "death",

        "injured",

        "injury",

        "carcass",

        "poaching",

        "poacher",

        "snare",

        "trap",

        "illegal hunting",

        "wildlife crime",

        "sighting",

        "sightings",

        "camera trap",

        "footprint",

        "pugmark",

        "scat",

        "nest",

        "habitat",

        "migration",

        "movement",

        "corridor",

        "forest",

        "reserve",

        "national park",

        "sanctuary",

        "btr",

        "buxa"

    ];

    Object.freeze(

        KEYWORDS.wildlife

    );

     /*----------------------------------------------------------
      KEYWORDS : SPECIES
    ----------------------------------------------------------*/

    KEYWORDS.species = [

        "species",

        "identify",

        "identification",

        "identify species",

        "scientific name",

        "common name",

        "taxonomy",

        "classification",

        "family",

        "genus",

        "order",

        "subspecies",

        "flora",

        "fauna",

        "fish",

        "bird",

        "mammal",

        "reptile",

        "amphibian",

        "insect",

        "plant",

        "tree",

        "grass",

        "bamboo",

        "fungus",

        "mushroom",

        "endangered",

        "critically endangered",

        "vulnerable",

        "near threatened",

        "least concern",

        "iucn",

        "red list",

        "wildlife protection act",

        "wlpa",

        "schedule i",

        "schedule ii",

        "schedule iii",

        "schedule iv",

        "schedule v",

        "schedule vi",

        "protected",

        "protection status",

        "legal status",

        "native",

        "introduced",

        "invasive",

        "endemic",

        "distribution",

        "habitat",

        "behaviour",

        "behavior",

        "diet",

        "breeding",

        "breeding season",

        "conservation",

        "threat",

        "threatened",

        "population",

        "range",

        "occurrence",

        "channa",

        "mahseer",

        "elephas",

        "panthera",

        "bos",

        "cervus",

        "axis"

    ];

    Object.freeze(

        KEYWORDS.species

    );

     /*----------------------------------------------------------
      KEYWORDS : LEGAL
    ----------------------------------------------------------*/

    KEYWORDS.legal = [

        "law",

        "legal",

        "legality",

        "court",

        "court case",

        "case",

        "criminal case",

        "forest offence",

        "forest offense",

        "wildlife offence",

        "wildlife offense",

        "offence",

        "offense",

        "crime",

        "prosecution",

        "prosecute",

        "investigation",

        "investigate",

        "evidence",

        "witness",

        "statement",

        "confession",

        "accused",

        "suspect",

        "arrest",

        "detention",

        "seizure",

        "seized",

        "confiscation",

        "por",

        "p.o.r",

        "offence report",

        "offence register",

        "cr",

        "case record",

        "charge",

        "chargesheet",

        "charge sheet",

        "fir",

        "complaint",

        "forest act",

        "indian forest act",

        "wildlife protection act",

        "wlpa",

        "forest conservation act",

        "biodiversity act",

        "schedule i",

        "schedule ii",

        "schedule iii",

        "schedule iv",

        "schedule v",

        "schedule vi",

        "section",

        "rule",

        "penalty",

        "punishment",

        "fine",

        "imprisonment",

        "bail",

        "summons",

        "warrant",

        "magistrate",

        "judge",

        "high court",

        "supreme court",

        "tribunal",

        "notification",

        "gazette",

        "legal opinion",

        "legal advice",

        "conviction",

        "acquittal",

        "judgment",

        "judgement"

    ];

    Object.freeze(

        KEYWORDS.legal

    );

     /*----------------------------------------------------------
      KEYWORDS : SEARCH
    ----------------------------------------------------------*/

    KEYWORDS.search = [

        "search",

        "find",

        "locate",

        "lookup",

        "look up",

        "show",

        "display",

        "list",

        "filter",

        "query",

        "where",

        "which",

        "who",

        "what",

        "when",

        "nearest",

        "nearby",

        "inside",

        "within",

        "around",

        "contains",

        "match",

        "matching",

        "similar",

        "all",

        "any",

        "exact",

        "recent",

        "latest",

        "today",

        "yesterday",

        "this week",

        "this month",

        "current",

        "active",

        "inactive",

        "online",

        "offline",

        "staff",

        "patrol",

        "track",

        "compartment",

        "beat",

        "range",

        "division",

        "grid",

        "cell",

        "map",

        "wildlife",

        "species",

        "case",

        "report",

        "analytics",

        "incident",

        "fire",

        "elephant",

        "gps",

        "history",

        "session",

        "por",

        "document",

        "record",

        "records"

    ];

    Object.freeze(

        KEYWORDS.search

    );



    Object.freeze(

        KEYWORDS

    );

     /*----------------------------------------------------------
      NORMALIZE QUERY
    ----------------------------------------------------------*/

    function normalizeQuery(query) {

        if (

            query === undefined ||

            query === null

        )

            return "";

        return String(query)

            .toLowerCase()

            .trim()

            .replace(/\s+/g, " ")

            .replace(/[^\w\s]/g, "");

    }



    /*----------------------------------------------------------
      TOKENIZE
    ----------------------------------------------------------*/

    function tokenize(query) {

        query = normalizeQuery(query);

        if (!query)
            return [];

        return query

            .split(" ")

            .filter(Boolean);

    }



    /*----------------------------------------------------------
      CONTAINS KEYWORD
    ----------------------------------------------------------*/

    function containsKeyword(

        query,

        keywords

    ) {

        query = normalizeQuery(query);

        if (!query)
            return false;

        for (

            const keyword of keywords

        ) {

            if (

                query.includes(

                    normalizeQuery(

                        keyword

                    )

                )

            ) {

                return true;

            }

        }

        return false;

    }



    /*----------------------------------------------------------
      COUNT KEYWORDS
    ----------------------------------------------------------*/

    function countKeywords(

        query,

        keywords

    ) {

        query = normalizeQuery(query);

        let score = 0;

        for (

            const keyword of keywords

        ) {

            if (

                query.includes(

                    normalizeQuery(

                        keyword

                    )

                )

            ) {

                score++;

            }

        }

        return score;

    }



    /*----------------------------------------------------------
      TOKEN EXISTS
    ----------------------------------------------------------*/

    function hasToken(

        tokens,

        value

    ) {

        return tokens.includes(

            normalizeQuery(

                value

            )

        );

    }



    /*----------------------------------------------------------
      UNIQUE TOKENS
    ----------------------------------------------------------*/

    function uniqueTokens(

        tokens

    ) {

        return [

            ...new Set(tokens)

        ];

    }

     /*----------------------------------------------------------
      SCORE INTENT
    ----------------------------------------------------------*/

    function scoreIntent(query) {

        query = normalizeQuery(query);

        const scores = {};

        Object.keys(INTENTS).forEach(key => {

            const intent =

                INTENTS[key];

            const words =

                KEYWORDS[intent];

            if (!words) {

                scores[intent] = 0;

                return;

            }

            scores[intent] =

                countKeywords(

                    query,

                    words

                );

        });

        return scores;

    }



    /*----------------------------------------------------------
      BEST INTENT
    ----------------------------------------------------------*/

    function bestIntent(scores) {

        let best =

            INTENTS.GENERAL;

        let bestScore = 0;

        Object.entries(scores)

            .forEach(

                ([intent, score]) => {

                    const priority =

                        PRIORITY[intent] || 0;

                    const weighted =

                        score * 100 +

                        priority;

                    if (

                        weighted >

                        bestScore

                    ) {

                        bestScore =

                            weighted;

                        best =

                            intent;

                    }

                }

            );

        return {

            intent: best,

            score:

                scores[best] || 0

        };

    }



    /*----------------------------------------------------------
      DETECT INTENT
    ----------------------------------------------------------*/

    Router.detectIntent = function (

        query

    ) {

        query =

            normalizeQuery(query);
if(
   /most visited|least visited|top compartment|top compartments|ranking|rank|highest coverage|lowest coverage|most patrol|patrol ranking|no patrol|without patrol|never visited|unvisited|inactive/i.test(query)
){

    return {
        query,
        intent: INTENTS.ANALYTICS,
        score: 999,
        scores:{
            analytics:999
        }
    };

}
        const scores =

            scoreIntent(query);

        const result =

            bestIntent(scores);

        lastQuery =

            query;

        lastIntent =

            result.intent;

        lastScore =

            result.score;

        lastRoute =

            result.intent;

        return {

            query,

            intent:

                result.intent,

            score:

                result.score,

            scores

        };

    };


     /*----------------------------------------------------------
      BUILD CONTEXT
    ----------------------------------------------------------*/

    Router.buildContext = async function (

        intent

    ) {

        const context = {};

        switch (intent) {

            case INTENTS.STAFF:

                context.profile =
                   Context.getProfile();

                context.liveStaff =
                    Context.getLiveStaff();

                break;

            case INTENTS.PATROL:

               context.profile =
    Context.getProfile();

context.duty =
    Context.getDuty();

                context.patrol =
                    Context.getPatrol();

                context.location =
                    Context.getLocation();

                break;

            case INTENTS.GIS:

                context.selection =
                    Context.getSelection();

                context.gis =
                    Context.getGIS();

                break;

            case INTENTS.ANALYTICS:

                context.analytics =
                    Context.getAnalytics();

                context.selection =
                    Context.getSelection();

                break;

            case INTENTS.WILDLIFE:

                context.selection =
                    Context.getSelection();

                context.gis =
                    Context.getGIS();

                context.location =
                    Context.getLocation();

                break;

            case INTENTS.SPECIES:

                context.profile =
                     Context.getProfile();

                break;

            case INTENTS.LEGAL:

                context.profile =
                      Context.getProfile();

                context.selection =
                    Context.getSelection();

                break;

            case INTENTS.REPORT:

                context.profile =
                     Context.getProfile();

                context.duty =
                    Context.getDuty();

                context.liveStaff =
                    Context.getLiveStaff();

                context.analytics =
                    Context.getAnalytics();

                context.patrol =
                    Context.getPatrol();

                break;

            default:

                context.profile =
                      Context.getProfile();

                context.selection =
                    Context.getSelection();

        }

        lastContext =

            Config.clone(

                context

            );

        return context;

    };

Router.resolveTools = function(query, intent){

    query = normalizeQuery(query);

    const tools = [];

    if(intent === INTENTS.ANALYTICS){

        if(
            /monthly|coverage|analytics|statistics|summary/.test(query)
        ){
            tools.push("getMonthlyStatus");
        }

       if(
    /most visited|least visited|top compartment|top compartments|ranking|rank|highest coverage|lowest coverage|most patrol|patrol ranking|no patrol|without patrol|never visited|unvisited|inactive/i.test(query)
){
            tools.push(
                "getCompartmentVisitBreakdown"
            );
        }

    }

    return [...new Set(tools)];

};

/*----------------------------------------------------------
ROUTE
----------------------------------------------------------*/


     /*----------------------------------------------------------
      RESET
    ----------------------------------------------------------*/

    Router.reset = function () {

        lastIntent = null;

        lastRoute = null;

        lastQuery = "";

        lastScore = 0;

        lastContext = null;

    };



    /*----------------------------------------------------------
      REFRESH
    ----------------------------------------------------------*/

    Router.refresh = async function (

        query

    ) {

        Router.reset();

        return await Router.route(

            query

        );

    };



    /*----------------------------------------------------------
      INFO
    ----------------------------------------------------------*/

    Router.info = function () {

        return {

            ready:

                ready,

            lastIntent:

                lastIntent,

            lastRoute:

                lastRoute,

            lastQuery:

                lastQuery,

            lastScore:

                lastScore,

            routes:

                Object.values(

                    ROUTES

                )

        };

    };



    /*----------------------------------------------------------
      AUTO INITIALIZE
    ----------------------------------------------------------*/

    Router.init()

        .then(() => {

            Config.log(

                "Router",

                "Ready"

            );

        })

        .catch((err) => {

            Config.error(

                "Router",

                err

            );

        });



    /*----------------------------------------------------------
      REGISTER
    ----------------------------------------------------------*/

    window.GreenGuardAI.Router =

        Router;



    console.log(

        "%cGreenGuard AI Router Loaded",

        "color:#0066cc;font-weight:bold;"

    );

})(window);
