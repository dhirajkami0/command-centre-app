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
                        p.division
                            .toUpperCase()
                    ] = feature;

                }

                if (

                    p.range

                ) {

                    index.ranges[
                        p.range
                            .toUpperCase()
                    ] = feature;

                }

                if (

                    p.beat

                ) {

                    index.beats[
                        p.beat
                            .toUpperCase()
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
                        name
                            .toUpperCase()
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
                        name
                            .toUpperCase()
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

GG.normalizeName = function (

    value

) {

    if (

        value == null

    ) {

        return "";

    }

    return String(

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

        .trim()

        .replace(

            /[&]/g,

            " AND "

        )

        .replace(

            /[-_/.,()'"]/g,

            " "

        )

        .replace(

            /\s+/g,

            " "

        )

        .replace(

            /\s/g,

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
