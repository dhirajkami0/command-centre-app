GreenGuardAI.Controller = {};

GreenGuardAI.Controller.ask = async function(query){

    await ensureAnalyticsReady();

    query = AnalyticsEngine.normalizeQuery(query);

    const intent =
        AnalyticsEngine.detectIntent(query);

    const entities =
        AnalyticsEngine.extractEntities(query);

    const result =
        AnalyticsEngine.route(intent,entities);

    return Formatter.format(result);

};
