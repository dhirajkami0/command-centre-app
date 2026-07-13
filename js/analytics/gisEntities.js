/*=========================================================
  GreenGuard AI
  GIS Entities
=========================================================*/

window.GreenGuardAI =
    window.GreenGuardAI || {};

(function (

    GG

) {

    "use strict";

    const GISEntities = {};

    GISEntities.VERSION =

        "1.0.0";

    let index =

        null;

    /*--------------------------------------------------
      Build
    --------------------------------------------------*/

GISEntities.build = function () {

    if (

        index

    ) {

        return index;

    }

    index = {

        divisions: {},

        ranges: {},

        beats: {},

        compartments: {},

        villages: {}

    };

    (
        window.allGISFeatures ||

        []

    ).forEach(

        function (

            feature

        ) {

            const p =

                feature.properties ||

                {};

            if (

                p.division

            ) {

                index.divisions[

                    GG.normalizeName(

                        p.division

                    )

                ] = feature;

            }

            if (

                p.range

            ) {

                index.ranges[

                    GG.normalizeName(

                        p.range

                    )

                ] = feature;

            }

            if (

                p.beat

            ) {

                index.beats[

                    GG.normalizeName(

                        p.beat

                    )

                ] = feature;

            }

        }

    );

    (

        window.allCompartmentFeatures ||

        []

    ).forEach(

        function (

            feature

        ) {

            const p =

                feature.properties ||

                {};

            const name =

                p.compartment ||

                p.name;

            if (

                name

            ) {

                index.compartments[

                    GG.normalizeName(

                        name

                    )

                ] = feature;

            }

        }

    );

    (

        window.__villageCache ||

        []

    ).forEach(

        function (

            village

        ) {

            const name =

                village.name ||

                village.village;

            if (

                name

            ) {

                index.villages[

                    GG.normalizeName(

                        name

                    )

                ] = village;

            }

        }

    );

    return index;

};

    /*--------------------------------------------------
      Ready
    --------------------------------------------------*/

    GISEntities.ready = function () {

        return !!index;

    };

    /*--------------------------------------------------
      Search
    --------------------------------------------------*/

/*=========================================================
  GreenGuard AI
  Name Normalizer
=========================================================*/

/*=========================================================
  GreenGuard AI
  Name Normalizer
=========================================================*/

GG.normalizeName = function (

    value

) {

    if (

        value == null

    ) {

        return "";

    }

    let text =

        String(

            value

        )

        .normalize(

            "NFKD"

        )

        .replace(

            /[\u0300-\u036f]/g,

            ""

        )

        .toUpperCase()

        .trim();

    /*----------------------------------
      Common Symbols
    ----------------------------------*/

    text =

        text

            .replace(

                /&/g,

                "AND"

            )

            .replace(

                /[(){}\[\].,_\-\/\\]/g,

                " "

            )

            .replace(

                /\s+/g,

                " "

            )

            .trim();

    /*----------------------------------
      Known Aliases
    ----------------------------------*/

    const aliases = {

        "BTR W":

            "BTR WEST",

        "BTRW":

            "BTR WEST",

        "BTR WEST":

            "BTR WEST",

        "BTR WEST DIVISION":

            "BTR WEST",

        "BTR WEST RANGE":

            "BTR WEST",

        "BTR WEST CIRCLE":

            "BTR WEST",

        "BTR WEST FOREST DIVISION":

            "BTR WEST",

        "BTR E":

            "BTR EAST",

        "BTRE":

            "BTR EAST",

        "BTR EAST":

            "BTR EAST"

    };

    if (

        aliases[text]

    ) {

        text =

            aliases[text];

    }

    /*----------------------------------
      Canonical Key
    ----------------------------------*/

    return text.replace(

        /\s+/g,

        ""

    );

};

/*--------------------------------------------------
  Search
--------------------------------------------------*/

GISEntities.search = function (

    text

) {

    if (

        !text

    ) {

        return null;

    }

    if (

        !index

    ) {

        GISEntities.build();

    }

    text =

        GG.normalizeName(

            text

        );

    return (

        index.divisions[text] ||

        index.ranges[text] ||

        index.beats[text] ||

        index.compartments[text] ||

        index.villages[text] ||

        null

    );

};

    GG.GISEntities =

        Object.freeze(

            GISEntities

        );

})(

    window.GreenGuardAI
);
