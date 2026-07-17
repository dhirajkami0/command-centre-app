/*!
 * GreenGuard AI
 * config.js
 * Version: 1.0.0
 * Production Safe
 */

(function (window) {

    "use strict";

    /*------------------------------------------------------------
      Create Global Namespace
    ------------------------------------------------------------*/

    window.GreenGuardAI = window.GreenGuardAI || {};

    /*------------------------------------------------------------
      Prevent Double Loading
    ------------------------------------------------------------*/

    if (window.GreenGuardAI.Config) {

        console.warn(
            "[GreenGuardAI] Config already loaded."
        );

        return;

    }

    const GG = {};

    /*------------------------------------------------------------
      APP INFO
    ------------------------------------------------------------*/

    GG.APP = Object.freeze({

        NAME: "GreenGuard Intelligence",

        VERSION: "2.0.0",

        BUILD: "2026.06.27",

        AUTHOR: "GreenGuard",

        ENVIRONMENT: "production"

    });

    /*------------------------------------------------------------
      DEBUG
    ------------------------------------------------------------*/

    GG.DEBUG = Object.freeze({

        ENABLED: false,

        LOG_AI: false,

        LOG_FIRESTORE: false,

        LOG_ROUTER: false,

        LOG_CONTEXT: false,

        LOG_CACHE: false

    });

    /*------------------------------------------------------------
      CLOUD FUNCTIONS
    ------------------------------------------------------------*/

    GG.API = (() => {

        const BASE =

            "https://us-central1-command-centre-86f62.cloudfunctions.net";

        return Object.freeze({

            BASE,

            /*----------------------------------
              New AI APIs
            ----------------------------------*/

            ASK:
                BASE + "/ask",

            ASK_AI:
                BASE + "/ask",

            DETECT_INTENT:
                BASE + "/detectIntent",

            /*----------------------------------
              Future
            ----------------------------------*/

            SEARCH:
                BASE + "/searchAI",

            EMBEDDING:
                BASE + "/embeddingAI",

            IMAGE:
                BASE + "/imageAI"

        });

    })();

    GG.AI = Object.freeze({

        ENABLED: true,

        PROVIDER: "Gemini",

        MODEL: "gemini-2.5-flash",

        INTENT_CONFIDENCE: 0.90,

        MAX_RETRIES: 2,

        REQUEST_TIMEOUT: 15000,

        CACHE_INTENTS: true,

        CACHE_RESPONSES: false

    });

    /*------------------------------------------------------------
      FIRESTORE COLLECTIONS
    ------------------------------------------------------------*/

    GG.COLLECTIONS = Object.freeze({

        LIVE_STAFF: "live_staff",

        PATROL_TRACKS: "patrol_tracks",

        AI_SESSIONS: "ai_sessions",

        AI_FEEDBACK: "ai_feedback",

        KNOWLEDGE: "knowledge",

        LEGAL_ACTS: "legal_acts",

        JUDGMENTS: "judgments",

        SPECIES: "species"

    });

    GG.INTENT = Object.freeze({

        LOCAL_ENABLED: true,

        AI_FALLBACK: true,

        UNKNOWN_THRESHOLD: 0.60,

        HIGH_CONFIDENCE: 0.90,

        MIN_AI_CONFIDENCE: 0.75

    });

    GG.ROUTER = Object.freeze({

        DEFAULT_DOMAIN: "staff",

        ENABLE_AI_ROUTING: true,

        ENABLE_MULTI_INTENT: true

    });

    GG.ANALYTICS = Object.freeze({

        AUTO_LOAD: true,

        AUTO_REFRESH: false,

        REFRESH_INTERVAL: 60000,

        BUILD_ON_STARTUP: true

    });

    /*------------------------------------------------------------
      CACHE
    ------------------------------------------------------------*/

    GG.CACHE = Object.freeze({

        ENABLED: true,

        DATABASE: "GG_AI_CACHE",

        VERSION: 1,

        STORE: "responses",

        MAX_MEMORY_ITEMS: 100,

        TTL: 30 * 60 * 1000,

        /* Intent Cache */

        INTENT_TTL: 24 * 60 * 60 * 1000,

        /* Response Cache */

        RESPONSE_TTL: 30 * 60 * 1000,

        /* Context Cache */

        CONTEXT_TTL: 5 * 60 * 1000

    });

    /*------------------------------------------------------------
      CHAT
    ------------------------------------------------------------*/

    GG.CHAT = Object.freeze({

        MAX_HISTORY: 20,

        MAX_PROMPT_LENGTH: 12000,

        MAX_RESPONSE_LENGTH: 40000,

        STREAMING: true,

        TEMPERATURE: 0.2

    });

    /*------------------------------------------------------------
      CONTEXT
    ------------------------------------------------------------*/

    GG.CONTEXT = Object.freeze({

        INCLUDE_USER: true,

        INCLUDE_DUTY: true,

        INCLUDE_MAP: true,

        INCLUDE_GPS: true,

        INCLUDE_PATROL: true,

        INCLUDE_ANALYTICS: true,

        INCLUDE_SIGHTINGS: true,

        INCLUDE_SELECTION: true

    });

    /*------------------------------------------------------------
      ROUTES
    ------------------------------------------------------------*/

    GG.ROUTES = Object.freeze({

        GENERAL: "general",

        OPERATIONAL: "operational",

        LEGAL: "legal",

        SPECIES: "species",

        REPORT: "report",

        GIS: "gis",

        PATROL: "patrol",

        ANALYTICS: "analytics"

    });

    /*------------------------------------------------------------
      UI
    ------------------------------------------------------------*/

    GG.UI = Object.freeze({

        PANEL_WIDTH: 420,

        PANEL_MIN_WIDTH: 360,

        PANEL_MAX_WIDTH: 550,

        AUTO_SCROLL: true,

        SHOW_TIMESTAMP: true,

        ANIMATION: true

    });

    /*------------------------------------------------------------
      PERFORMANCE
    ------------------------------------------------------------*/

    GG.PERFORMANCE = Object.freeze({

        MAX_STAFF_CONTEXT: 200,

        MAX_TRACK_POINTS: 300,

        MAX_SIGHTINGS: 100,

        MAX_COMPARTMENTS: 50,

        DEBOUNCE_MS: 250

    });

    /*------------------------------------------------------------
      SECURITY
    ------------------------------------------------------------*/

    GG.SECURITY = Object.freeze({

        SANITIZE_HTML: true,

        ESCAPE_MARKDOWN: true,

        ALLOW_IMAGES: true,

        ALLOW_HTML: false

    });

    /*------------------------------------------------------------
      FIREBASE HELPERS
    ------------------------------------------------------------*/

    GG.getFirestore = function () {

        return window.db || null;

    };

    GG.getFirebase = function () {

        return window.fb || null;

    };

    /*----------------------------------------------------------
      UTILITIES
    ----------------------------------------------------------*/

    GG.log = function (module, ...args) {

        if (!GG.DEBUG.ENABLED)
            return;

        console.log(
            "[AI][" + module + "]",
            ...args
        );

    };

    GG.warn = function (module, ...args) {

        console.warn(
            "[AI][" + module + "]",
            ...args
        );

    };

    GG.error = function (module, ...args) {

        console.error(
            "[AI][" + module + "]",
            ...args
        );

    };

    GG.isOnline = function () {

        return navigator.onLine;

    };

    GG.now = function () {

        return Date.now();

    };

    GG.sleep = function (ms) {

        return new Promise(

            resolve =>

                setTimeout(

                    resolve,

                    ms

                )

        );

    };

    /*----------------------------------------------------------
      UUID
    ----------------------------------------------------------*/

    GG.uuid = function () {

        if (

            window.crypto &&

            typeof window.crypto.randomUUID === "function"

        ) {

            return window.crypto.randomUUID();

        }

        return [

            "ai",

            Date.now(),

            Math.random()

                .toString(36)

                .substring(2, 10)

        ]

        .join("_");

    };

    /*----------------------------------------------------------
      CLONE
    ----------------------------------------------------------*/

    GG.clone = function (value) {

        try {

            if (

                typeof structuredClone ===

                "function"

            ) {

                return structuredClone(

                    value

                );

            }

        }

        catch (err) {}

        try {

            return JSON.parse(

                JSON.stringify(value)

            );

        }

        catch (err) {

            return value;

        }

    };

    GG.isFunction = function (fn) {

        return typeof fn === "function";

    };

    GG.exists = function (value) {

        return (

            value !== undefined &&

            value !== null

        );

    };

    GG.noop = function () {};

    /*------------------------------------------------------------
      REGISTER MODULE
    ------------------------------------------------------------*/

    window.GreenGuardAI.Config = GG;

    console.log(

        "%cGreenGuard AI Config Loaded",

        "color:#00aa00;font-weight:bold;",

        GG.APP.VERSION

    );

})(window);
