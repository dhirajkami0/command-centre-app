(function (window) {

"use strict";

/*=========================================================
 NAMESPACE
=========================================================*/

const GG =
    window.GreenGuardAI =
    window.GreenGuardAI || {};

const ActionEngine =
    GG.ActionEngine;

if (

    !ActionEngine

) {

    console.error(

        "ActionEngine not loaded."

    );

    return;

}

/*=========================================================
 SHOW MAP
=========================================================*/

ActionEngine.register(

    "show-map",

    function (

        action

    ) {

        console.log(

            "AI Action:",

            action

        );

        if (

            GG.Map &&

            typeof GG.Map.show ===

            "function"

        ) {

            GG.Map.show(

                action.map ||

                action

            );

        }

    }

);

/*=========================================================
 HIGHLIGHT STAFF
=========================================================*/

ActionEngine.register(

    "highlight-staff",

    function (

        action

    ) {

        if (

            GG.Map &&

            typeof GG.Map.highlightStaff ===

            "function"

        ) {

            GG.Map.highlightStaff(

                action.staffId ||

                action.cleanName ||

                action.name

            );

        }

    }

);

/*=========================================================
 OPEN STAFF PROFILE
=========================================================*/

ActionEngine.register(

    "open-profile",

    function (

        action

    ) {

        if (

            GG.Panel &&

            typeof GG.Panel.openStaff ===

            "function"

        ) {

            GG.Panel.openStaff(

                action.staffId ||

                action.cleanName

            );

        }

    }

);

/*=========================================================
 COPY TEXT
=========================================================*/

ActionEngine.register(

    "copy",

    async function (

        action

    ) {

        if (

            !action.text

        ) {

            return;

        }

        try {

            await navigator.clipboard.writeText(

                action.text

            );

        }

        catch (

            err

        ) {

            console.error(

                err

            );

        }

    }

);

/*=========================================================
 SHARE
=========================================================*/

ActionEngine.register(

    "share",

    async function (

        action

    ) {

        if (

            !navigator.share

        ) {

            return;

        }

        try {

            await navigator.share({

                title:

                    action.title ||

                    "GreenGuard",

                text:

                    action.text ||

                    "",

                url:

                    action.url ||

                    ""

            });

        }

        catch (

            err

        ) {

            console.error(

                err

            );

        }

    }

);

console.log(

    "%cGreenGuard Action Handlers Loaded",

    "color:#4caf50;font-weight:bold;"

);
/*=========================================================
 SHOW PATROL TRACK
=========================================================*/

ActionEngine.register(

    "show-track",

    function (

        action

    ) {

        if (

            GG.Map &&

            typeof GG.Map.showTrack ===

            "function"

        ) {

            GG.Map.showTrack(

                action.track ||

                action.sessionId ||

                action

            );

        }

    }

);

/*=========================================================
 SHOW LIVE LOCATION
=========================================================*/

ActionEngine.register(

    "show-live-location",

    function (

        action

    ) {

        if (

            GG.Map &&

            typeof GG.Map.showLiveLocation ===

            "function"

        ) {

            GG.Map.showLiveLocation(

                action.staffId ||

                action.cleanName ||

                action.name

            );

        }

    }

);

/*=========================================================
 ZOOM RANGE
=========================================================*/

ActionEngine.register(

    "zoom-range",

    function (

        action

    ) {

        if (

            GG.Map &&

            typeof GG.Map.zoomRange ===

            "function"

        ) {

            GG.Map.zoomRange(

                action.range

            );

        }

    }

);

/*=========================================================
 ZOOM BEAT
=========================================================*/

ActionEngine.register(

    "zoom-beat",

    function (

        action

    ) {

        if (

            GG.Map &&

            typeof GG.Map.zoomBeat ===

            "function"

        ) {

            GG.Map.zoomBeat(

                action.beat

            );

        }

    }

);

/*=========================================================
 ZOOM COMPARTMENT
=========================================================*/

ActionEngine.register(

    "zoom-compartment",

    function (

        action

    ) {

        if (

            GG.Map &&

            typeof GG.Map.zoomCompartment ===

            "function"

        ) {

            GG.Map.zoomCompartment(

                action.compartment

            );

        }

    }

);

/*=========================================================
 SHOW PATROL
=========================================================*/

ActionEngine.register(

    "show-patrol",

    function (

        action

    ) {

        if (

            GG.Map &&

            typeof GG.Map.showPatrol ===

            "function"

        ) {

            GG.Map.showPatrol(

                action

            );

        }

    }

);

/*=========================================================
 SHOW FIRE
=========================================================*/

ActionEngine.register(

    "show-fire",

    function (

        action

    ) {

        if (

            GG.Map &&

            typeof GG.Map.showFire ===

            "function"

        ) {

            GG.Map.showFire(

                action

            );

        }

    }

);

/*=========================================================
 SHOW ELEPHANT
=========================================================*/

ActionEngine.register(

    "show-elephant",

    function (

        action

    ) {

        if (

            GG.Map &&

            typeof GG.Map.showElephant ===

            "function"

        ) {

            GG.Map.showElephant(

                action

            );

        }

    }

);

/*=========================================================
 SHOW CAMERA
=========================================================*/

ActionEngine.register(

    "show-camera",

    function (

        action

    ) {

        if (

            GG.Map &&

            typeof GG.Map.showCamera ===

            "function"

        ) {

            GG.Map.showCamera(

                action

            );

        }

    }

);

/*=========================================================
 DOWNLOAD KML
=========================================================*/

ActionEngine.register(

    "download-kml",

    function (

        action

    ) {

        if (

            GG.Download &&

            typeof GG.Download.kml ===

            "function"

        ) {

            GG.Download.kml(

                action

            );

        }

    }

);
})(window);
