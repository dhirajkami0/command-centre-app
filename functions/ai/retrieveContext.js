"use strict";

/*=========================================================
 IMPORTS
=========================================================*/

const {

    getStaffContext

} = require("./contextBuilders/staff");

/*
===========================================================
 FUTURE IMPORTS
===========================================================

const {

    getWildlifeContext

} = require("./contextBuilders/wildlife");

const {

    getGISContext

} = require("./contextBuilders/gis");

const {

    getPatrolContext

} = require("./contextBuilders/patrol");

const {

    getLegalContext

} = require("./contextBuilders/legal");

const {

    getAnalyticsContext

} = require("./contextBuilders/analytics");

const {

    getReportContext

} = require("./contextBuilders/report");

*/

/*=========================================================
 RETRIEVE CONTEXT
=========================================================*/

async function retrieveContext(

    intent

) {

    if (

        !intent ||

        typeof intent !== "object"

    ) {

        return "";

    }

    switch (

        intent.domain

    ) {

        /*=================================================
          STAFF
        =================================================*/

        case "staff":

            return await getStaffContext(

                intent

            );

        /*=================================================
          WILDLIFE
        =================================================*/

        case "wildlife":

            return "";

        /*=================================================
          GIS
        =================================================*/

        case "gis":

            return "";

        /*=================================================
          PATROL
        =================================================*/

        case "patrol":

            return "";

        /*=================================================
          LEGAL
        =================================================*/

        case "legal":

            return "";

        /*=================================================
          ANALYTICS
        =================================================*/

        case "analytics":

            return "";

        /*=================================================
          REPORT
        =================================================*/

        case "report":

            return "";

        default:

            return "";

    }

}

/*=========================================================
 EXPORTS
=========================================================*/

module.exports = {

    retrieveContext

};