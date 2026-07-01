(function (window) {

"use strict";

window.GreenGuardAI = window.GreenGuardAI || {};

const Controller = {};

Controller.ensureAnalyticsReady = async function () {

    const AE = window.GreenGuardAI.AnalyticsEngine;

    if (AE.loaded) return;

    if (AE.loading) {

        while (AE.loading) {
            await new Promise(r => setTimeout(r,100));
        }

        return;

    }

    await AE.build();

};

Controller.ask = async function (query) {

    await Controller.ensureAnalyticsReady();

    query =
        window.GreenGuardAI.AnalyticsEngine.normalizeQuery(query);

    const intent =
        window.GreenGuardAI.AnalyticsEngine.detectStaffIntent(query);

    const result =
        window.GreenGuardAI.AnalyticsEngine.routeStaffIntent(query);

    return result;

};

window.GreenGuardAI.Controller = Controller;

})(window);
