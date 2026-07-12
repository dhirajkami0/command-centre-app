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

    StaffGIS.locate = function (

        cleanName

    ) {

        if (

            !Staff ||

            typeof Staff.hydrate !==

            "function"

        ) {

            return null;

        }

        const profile =

            Staff.hydrate(

                cleanName

            );

        if (

            !profile

        ) {

            return null;

        }

        return {

            profile:

                profile,

            jurisdiction:

                StaffGIS.getJurisdiction(

                    profile

                )

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
