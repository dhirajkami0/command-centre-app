"use strict";

/*
==========================================================
 GreenGuard AI v2
 Module Loader
==========================================================
*/

let loaded = false;

function load() {

    if (loaded) {
        return;
    }

    loaded = true;

    /*
    ------------------------------------------------------
    Load Modules
    ------------------------------------------------------
    */

    require("./tools/staff");

    require("./tools/gis");

    /*
    Future Modules

    require("./tools/analytics");

    require("./tools/patrol");

    require("./tools/wildlife");

    require("./tools/legal");

    require("./tools/reports");

    require("./tools/system");

    */

    console.log(
        "GreenGuard AI v2 modules loaded."
    );

}

module.exports = {

    load

};