"use strict";

function normalizeIntent(
    intent,
    provider = "unknown"
) {

    return {

        success: true,

        source: "ai",

        provider,

        domain:
            intent.domain || "general",

        intent:
            intent.intent || "unknown",

        entities:
            intent.entities || {},

        confidence:
            Number(intent.confidence || 0),

        raw: intent

    };

}

module.exports = {

    normalizeIntent

};