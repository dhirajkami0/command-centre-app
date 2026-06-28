(function (window) {
    "use strict";

    window.GreenGuardAI = window.GreenGuardAI || {};

    const Tools = {};

    const registry = {};

    Tools.register = function (name, fn) {
        registry[name] = fn;
    };

    Tools.execute = async function(name, args = {}) {
        const tool = registry[name];
        if (!tool) {
            throw new Error("Unknown tool: " + name);
        }
        try {
            return await tool(args);
        }
        catch(err) {
            console.error("Tool failed:", name, err);
            return {
                success: false,
                tool: name,
                error: err.message || String(err)
            };
        }
    };

    Tools.list = function() {
        return Object.keys(registry).sort();
    };

    /*----------------------------------------------------------
      ANALYTICS ENGINE
    ----------------------------------------------------------*/

    Tools.register(
        "analyticsQuery",
        async (args = {}) => {
            const query = String(args.query || "");
            const engine = window.GreenGuardAI?.AnalyticsEngine;

            if (!engine) {
                return {
                    success: false,
                    error: "AnalyticsEngine not loaded."
                };
            }

            if (!engine.isLoaded()) {
                await engine.load();
            }

            const result = engine.query(query);

            return {
                success: true,
                source: "AnalyticsEngine",
                query,
                result
            };
        }
    );

    /*----------------------------------------------------------
      REGISTER BUILT-IN TOOLS
    ----------------------------------------------------------*/

    Tools.register(
        "getProfile",
        async () => {
            return GreenGuardAI.Context.getProfile();
        }
    );

    Tools.register(
        "getDuty",
        async () => {
            return GreenGuardAI.Context.getDuty();
        }
    );

    Tools.register(
        "getLiveStaff",
        async () => {
            return GreenGuardAI.Context.getLiveStaff();
        }
    );

    Tools.register(
        "getPatrol",
        async () => {
            return GreenGuardAI.Context.getPatrol();
        }
    );

    Tools.register(
        "getGIS",
        async () => {
            return GreenGuardAI.Context.getGIS();
        }
    );

    Tools.register(
        "getAnalytics",
        async () => {
            return GreenGuardAI.Context.getAnalytics();
        }
    );

    /*----------------------------------------------------------
      EXTRA BUILT-IN TOOLS
    ----------------------------------------------------------*/

    Tools.register(
        "getLocation",
        async () => {
            return GreenGuardAI.Context.getLocation();
        }
    );

    Tools.register(
        "getSelection",
        async () => {
            return GreenGuardAI.Context.getSelection();
        }
    );

    /*----------------------------------------------------------
      OPERATIONAL TOOLS
    ----------------------------------------------------------*/

    Tools.register(
        "getSightings",
        async () => {
            return await window.callBackend("getSightings");
        }
    );

    Tools.register(
        "getWeather",
        async () => {
            return await window.callBackend("getWeatherFull");
        }
    );

    Tools.register(
        "getVillages",
        async () => {
            return await window.callBackend("getVillages");
        }
    );

    Tools.register(
        "getMapData",
        async () => {
            return await window.callBackend("getMapData");
        }
    );

    Tools.register(
        "getArea",
        async (args = {}) => {
            const name = (args.name || "").trim().toUpperCase();
            let feature = null;

            feature = (window.allCompartmentFeatures || []).find(f =>
                String(f.properties.compartment || f.properties.Compartment)
                .trim()
                .toUpperCase() === name
            );

            if (!feature) {
                feature = (window.allGISFeatures || []).find(f =>
                    String(
                        f.properties.Range || f.properties.range ||
                        f.properties.Beat || f.properties.beat ||
                        f.properties.Division || f.properties.division
                    )
                    .trim()
                    .toUpperCase() === name
                );
            }

            if (!feature) {
                return {
                    success: false,
                    error: "Polygon not found."
                };
            }

            const sqm = turf.area(feature);
            return {
                success: true,
                areaSqM: sqm,
                areaHa: sqm / 10000,
                areaSqKm: sqm / 1000000
            };
        }
    );

    /*----------------------------------------------------------
      ADVANCED OPERATIONAL TOOLS
    ----------------------------------------------------------*/

    Tools.register(
        "getMonthlyStatus",
        async () => {
            return GreenGuardAI.Context.getMonthlyStatus();
        }
    );

    Tools.register(
        "compareMonths",
        async (args = {}) => {
            return GreenGuardAI.Context.compareMonths(args);
        }
    );

    Tools.register(
        "getCoverage",
        async () => {
            return GreenGuardAI.Context.getCoverage();
        }
    );

    Tools.register(
        "getHeatmap",
        async () => {
            return GreenGuardAI.Context.getHeatmap();
        }
    );

    Tools.register(
        "getPatrolRanking",
        async () => {
            return GreenGuardAI.Context.getPatrolRanking();
        }
    );

    /*----------------------------------------------------------
      REPORTS
    ----------------------------------------------------------*/

    Tools.register(
        "generateDailyReport",
        async () => {
            return GreenGuardAI.Context.generateDailyReport();
        }
    );

    Tools.register(
        "generateMonthlyReport",
        async () => {
            return GreenGuardAI.Context.generateMonthlyReport();
        }
    );

    Tools.register(
        "generateDFOBriefing",
        async () => {
            return GreenGuardAI.Context.generateDFOBriefing();
        }
    );

    /*----------------------------------------------------------
      LEGAL
    ----------------------------------------------------------*/

    Tools.register(
        "searchCourtCases",
        async (args = {}) => {
            return GreenGuardAI.Context.searchCourtCases(args);
        }
    );

    /*----------------------------------------------------------
      RESEARCH
    ----------------------------------------------------------*/

    Tools.register(
        "searchResearch",
        async (args = {}) => {
            return GreenGuardAI.Context.searchResearch(args);
        }
    );

    /*----------------------------------------------------------
      WILDLIFE
    ----------------------------------------------------------*/

    Tools.register(
        "predictElephantMovement",
        async () => {
            return GreenGuardAI.Context.predictElephantMovement();
        }
    );

    Tools.register(
        "predictPatrolPriority",
        async () => {
            return GreenGuardAI.Context.predictPatrolPriority();
        }
    );

    /*----------------------------------------------------------
      SYSTEM
    ----------------------------------------------------------*/

    Tools.register(
        "runDiagnostics",
        async () => {
            return GreenGuardAI.Context.runDiagnostics();
        }
    );

    Tools.register(
        "systemHealth",
        async () => {
            return GreenGuardAI.Context.systemHealth();
        }
    );

    /*----------------------------------------------------------
      EXPORT
    ----------------------------------------------------------*/

    window.GreenGuardAI.Tools = Tools;

})(window);
