/*=========================================================
  GreenGuard AI
  Staff GIS Bridge
=========================================================*/

window.GreenGuardAI =
    window.GreenGuardAI || {};

(function (

    GG

) {

    "use strict";

    const StaffGIS = {};

    StaffGIS.VERSION =

        "1.0.0";

    const Staff =

        GG.StaffHydrator;

    const GIS =

        GG.GISBusiness;

    /*--------------------------------------------------
      Ready
    --------------------------------------------------*/

    StaffGIS.ready = function () {

        return !!(

            Staff &&

            GIS

        );

    };

    /*--------------------------------------------------
      Current Position
    --------------------------------------------------*/

    StaffGIS.getPosition = function (

        profile

    ) {

        if (

            !profile

        ) {

            return null;

        }

        const gps =

            profile.gps ||

            {};

        const lat =

            gps.latitude ??

            gps.lat;

        const lng =

            gps.longitude ??

            gps.lng;

        if (

            lat == null ||

            lng == null

        ) {

            return null;

        }

        return {

            lat:

                Number(

                    lat

                ),

            lng:

                Number(

                    lng

                )

        };

    };

    /*--------------------------------------------------
      Current Compartment
    --------------------------------------------------*/

    StaffGIS.getCompartment = function (

        profile

    ) {

        const p =

            StaffGIS.getPosition(

                profile

            );

        if (

            !p

        ) {

            return null;

        }

        return GIS.findContainingCompartment(

            p.lat,

            p.lng

        );

    };

    /*--------------------------------------------------
      Current Jurisdiction
    --------------------------------------------------*/

    StaffGIS.getJurisdiction = function (

        profile

    ) {

        const feature =

            StaffGIS.getCompartment(

                profile

            );

        if (

            !feature

        ) {

            return null;

        }

        const p =

            feature.properties ||

            {};

        return {

            division:

                p.division ||

                null,

            range:

                p.range ||

                null,

            beat:

                p.beat ||

                null,

            compartment:

                p.compartment ||

                p.name ||

                null,

            feature:

                feature

        };

    };

    /*--------------------------------------------------
      Hydrated Staff
    --------------------------------------------------*/

StaffGIS.locate =

function (

    cleanName

) {

    /*----------------------------------
      Validate Hydrator
    ----------------------------------*/

    if (

        !Staff ||

        typeof Staff.hydrate !==

        "function"

    ) {

        return null;

    }

    /*----------------------------------
      Hydrate Staff
    ----------------------------------*/

    const profile =

        Staff.hydrate(

            cleanName

        );

    if (

        !profile

    ) {

        return null;

    }

    /*----------------------------------
      Resolve GIS Jurisdiction
    ----------------------------------*/

    const jurisdiction =

        StaffGIS.getJurisdiction(

            profile

        );

    /*----------------------------------
      Attach Spatial Information
    ----------------------------------*/

    profile.spatial =

        profile.spatial ||

        {};

    profile.spatial.valid =

        !!jurisdiction;

    profile.spatial.updatedAt =

        Date.now();

    if (

        jurisdiction

    ) {

        profile.spatial.division =

            jurisdiction.division ||

            "";

        profile.spatial.range =

            jurisdiction.range ||

            "";

        profile.spatial.beat =

            jurisdiction.beat ||

            "";

        profile.spatial.compartment =

            jurisdiction.compartment ||

            "";

        profile.spatial.feature =

            jurisdiction.feature ||

            null;

        profile.spatial.source =

            jurisdiction.source ||

            "GIS";

    }

    else {

        profile.spatial.division =

            "";

        profile.spatial.range =

            "";

        profile.spatial.beat =

            "";

        profile.spatial.compartment =

            "";

        profile.spatial.feature =

            null;

        profile.spatial.source =

            "UNKNOWN";

    }

    /*----------------------------------
      Return
    ----------------------------------*/

    return {

        profile:

            profile,

        jurisdiction:

            jurisdiction

    };

};

    /*--------------------------------------------------
      Export
    --------------------------------------------------*/

    GG.StaffGIS =

        Object.freeze(

            StaffGIS

        );

    console.log(

        "Staff GIS Loaded",

        StaffGIS.VERSION

    );

})(

    window.GreenGuardAI);
