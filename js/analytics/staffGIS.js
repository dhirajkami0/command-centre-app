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
/*=========================================================
  StaffGIS
  Jurisdiction Resolver
=========================================================*/

StaffGIS.getJurisdiction =

function (

    profile

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !profile

    ) {

        return null;

    }

    const result =

        {};

    /*----------------------------------
      GPS Spatial Lookup
    ----------------------------------*/

    const lat =

        profile.location?.lat;

    const lng =

        profile.location?.lon;

    if (

        lat != null &&

        lng != null &&

        GG.GISBusiness

    ) {

        const feature =

            GG.GISBusiness
                .findContainingCompartment(

                    lat,

                    lng

                );

        if (

            feature

        ) {

            const p =

                feature.properties ||

                {};

            result.source =

                "SPATIAL";

            result.feature =

                feature;

            result.division =

                p.division ||

                "";

            result.range =

                p.range ||

                "";

            result.beat =

                p.beat ||

                "";

            result.compartment =

                p.compartment ||

                "";

            result.assignedDivision =

                profile.assignment?.division ||

                "";

            result.assignedRange =

                profile.assignment?.range ||

                "";

            result.assignedBeat =

                profile.assignment?.beat ||

                "";

            result.assignedArea =

                profile.assignment?.assignedCompartment ||

                profile.assignment?.assignedArea ||

                "";

            return result;

        }

    }

    /*----------------------------------
      Live Assigned Area
    ----------------------------------*/

    const live =

        GG.StaffHydrator.getLiveStaff(

            profile.identity?.cleanName

        );

    if (

        live

    ) {

        result.source =

            "LIVE";

        result.feature =

            null;

        result.division =

            live.division ||

            "";

        result.range =

            live.range ||

            "";

        result.beat =

            live.beat ||

            "";

        result.compartment =

            live.compartment ||

            "";

        return result;

    }

    /*----------------------------------
      Posting
    ----------------------------------*/

    result.source =

        "POSTING";

    result.feature =

        null;

    result.division =

        profile.posting?.division ||

        "";

    result.range =

        profile.posting?.range ||

        "";

    result.beat =

        profile.posting?.beat ||

        "";

    result.compartment =

        "";

    return result;

};
  /*=========================================================
  StaffGIS
  Assignment Validation
=========================================================*/

StaffGIS.isInsideAssignedArea =

function (

    cleanName

) {

    /*----------------------------------
      Locate Staff
    ----------------------------------*/

    const result =

        StaffGIS.locate(

            cleanName

        );

    if (

        !result ||

        !result.profile

    ) {

        return null;

    }

    const profile =

        result.profile;

    const spatial =

        profile.spatial ||

        {};

    /*----------------------------------
      Assigned Duty
    ----------------------------------*/

    const assigned =

        profile.assignment ||

        {};

    const assignedArea =

        (

            assigned.assignedCompartment ||

            assigned.assignedArea ||

            assigned.compartment ||

            ""

        )

        .trim()

        .toUpperCase();

    /*----------------------------------
      Current Spatial
    ----------------------------------*/

    const currentArea =

        (

            spatial.compartment ||

            ""

        )

        .trim()

        .toUpperCase();

    /*----------------------------------
      Compare
    ----------------------------------*/

    const inside =

        assignedArea !== "" &&

        currentArea !== "" &&

        assignedArea === currentArea;

    /*----------------------------------
      Return
    ----------------------------------*/

    return {

        staff:

            profile.identity?.name ||

            cleanName,

        inside:

            inside,

        assigned:

            {

                division:

                    assigned.division ||

                    "",

                range:

                    assigned.range ||

                    "",

                beat:

                    assigned.beat ||

                    "",

                compartment:

                    assignedArea

            },

        current:

            {

                division:

                    spatial.division ||

                    "",

                range:

                    spatial.range ||

                    "",

                beat:

                    spatial.beat ||

                    "",

                compartment:

                    currentArea

            }

    };

};
  /*=========================================================
  StaffGIS
  Posting Validation
=========================================================*/

StaffGIS.isInsidePosting =

function (

    cleanName

) {

    /*----------------------------------
      Locate Staff
    ----------------------------------*/

    const result =

        StaffGIS.locate(

            cleanName

        );

    if (

        !result ||

        !result.profile

    ) {

        return null;

    }

    const profile =

        result.profile;

    const spatial =

        profile.spatial ||

        {};

    const posting =

        profile.posting ||

        {};

    /*----------------------------------
      Normalize
    ----------------------------------*/

    const normalize =

        function (

            value

        ) {

            return String(

                value ||

                ""

            )

                .trim()

                .toUpperCase();

        };

    /*----------------------------------
      Compare
    ----------------------------------*/

    const divisionMatch =

        normalize(

            posting.division

        ) ===

        normalize(

            spatial.division

        );

    const rangeMatch =

        normalize(

            posting.range

        ) ===

        normalize(

            spatial.range

        );

    const beatMatch =

        normalize(

            posting.beat

        ) ===

        normalize(

            spatial.beat

        );

    /*----------------------------------
      Return
    ----------------------------------*/

    return {

        staff:

            profile.identity?.name ||

            cleanName,

        inside:

            divisionMatch &&

            rangeMatch &&

            beatMatch,

        posting: {

            division:

                posting.division ||

                "",

            range:

                posting.range ||

                "",

            beat:

                posting.beat ||

                ""

        },

        current: {

            division:

                spatial.division ||

                "",

            range:

                spatial.range ||

                "",

            beat:

                spatial.beat ||

                "",

            compartment:

                spatial.compartment ||

                ""

        },

        matches: {

            division:

                divisionMatch,

            range:

                rangeMatch,

            beat:

                beatMatch

        }

    };

};
  /*=========================================================
  StaffGIS
  Nearby Staff
=========================================================*/

StaffGIS.getNearbyStaff =

function (

    cleanName,

    radiusMeters =

        500

) {

    /*----------------------------------
      Locate Staff
    ----------------------------------*/

    const result =

        StaffGIS.locate(

            cleanName

        );

    if (

        !result ||

        !result.profile

    ) {

        return [];

    }

    const profile =

        result.profile;

    const lat =

        Number(

            profile.location?.lat

        );

    const lng =

        Number(

            profile.location?.lon

        );

    if (

        !lat ||

        !lng ||

        typeof turf ===

        "undefined"

    ) {

        return [];

    }

    /*----------------------------------
      Live Staff
    ----------------------------------*/

    const liveStaff =

        GG.GISBusiness
            .getLiveStaff();

    const origin =

        turf.point(

            [

                lng,

                lat

            ]

        );

    const nearby =

        [];

    /*----------------------------------
      Scan
    ----------------------------------*/

    Object.values(

        liveStaff

    ).forEach(

        function (

            live

        ) {

            if (

                !live ||

                live.cleanName ===

                profile.identity.cleanName

            ) {

                return;

            }

            if (

                live.lat == null ||

                live.lng == null

            ) {

                return;

            }

            const target =

                turf.point(

                    [

                        Number(

                            live.lng

                        ),

                        Number(

                            live.lat

                        )

                    ]

                );

            const distance =

                turf.distance(

                    origin,

                    target,

                    {

                        units:

                            "meters"

                    }

                );

            if (

                distance <=

                radiusMeters

            ) {

                nearby.push(

                    {

                        cleanName:

                            live.cleanName,

                        name:

                            live.name,

                        distance:

                            Math.round(

                                distance

                            ),

                        duty:

                            live.dutyType ||

                            "",

                        team:

                            live.team ||

                            "",

                        lat:

                            live.lat,

                        lng:

                            live.lng

                    }

                );

            }

        }

    );

    /*----------------------------------
      Sort
    ----------------------------------*/

    nearby.sort(

        function (

            a,

            b

        ) {

            return (

                a.distance -

                b.distance

            );

        }

    );

    /*----------------------------------
      Return
    ----------------------------------*/

    return nearby;

};
  /*=========================================================
  StaffGIS
  Movement Summary
=========================================================*/

StaffGIS.getMovementSummary =

function (

    cleanName

) {

    /*----------------------------------
      Locate Staff
    ----------------------------------*/

    const result =

        StaffGIS.locate(

            cleanName

        );

    if (

        !result ||

        !result.profile

    ) {

        return null;

    }

    const profile =

        result.profile;

    const spatial =

        profile.spatial ||

        {};

    const posting =

        profile.posting ||

        {};

    const assignment =

        profile.assignment ||

        {};

    const gps =

        profile.gps ||

        {};

    const location =

        profile.location ||

        {};

    /*----------------------------------
      Posting Check
    ----------------------------------*/

    const postingStatus =

        StaffGIS.isInsidePosting(

            cleanName

        );

    /*----------------------------------
      Assignment Check
    ----------------------------------*/

    const assignmentStatus =

        StaffGIS.isInsideAssignedArea(

            cleanName

        );

    /*----------------------------------
      Return
    ----------------------------------*/

    return {

        cleanName:

            profile.identity?.cleanName ||

            "",

        name:

            profile.identity?.name ||

            "",

        dutyActive:

            assignment.dutyActive ||

            false,

        dutyType:

            assignment.dutyType ||

            "",

        assignedArea:

            assignment.assignedCompartment ||

            assignment.assignedArea ||

            "",

        posting: {

            division:

                posting.division ||

                "",

            range:

                posting.range ||

                "",

            beat:

                posting.beat ||

                ""

        },

        current: {

            division:

                spatial.division ||

                "",

            range:

                spatial.range ||

                "",

            beat:

                spatial.beat ||

                "",

            compartment:

                spatial.compartment ||

                ""

        },

        gps: {

            lat:

                location.lat ||

                0,

            lng:

                location.lon ||

                0,

            speed:

                gps.speed ||

                0,

            heading:

                gps.heading ||

                0,

            accuracy:

                gps.accuracy ||

                0,

            lastSeen:

                gps.lastSeen ||

                ""

        },

        insidePosting:

            postingStatus ?

            postingStatus.inside :

            false,

        insideAssignment:

            assignmentStatus ?

            assignmentStatus.inside :

            false

    };

};

  /*=========================================================
  StaffGIS
  Operational Status
=========================================================*/

StaffGIS.getOperationalStatus =

function (

    cleanName

) {

    /*----------------------------------
      Locate
    ----------------------------------*/

    const result =

        StaffGIS.locate(

            cleanName

        );

    if (

        !result ||

        !result.profile

    ) {

        return null;

    }

    const profile =

        result.profile;

    /*----------------------------------
      Helpers
    ----------------------------------*/

    const posting =

        StaffGIS.isInsidePosting(

            cleanName

        );

    const assignment =

        StaffGIS.isInsideAssignedArea(

            cleanName

        );

    const nearby =

        StaffGIS.getNearbyStaff(

            cleanName,

            500

        );

    /*----------------------------------
      Return
    ----------------------------------*/

    return {

        cleanName:

            profile.identity?.cleanName ||

            "",

        name:

            profile.identity?.name ||

            "",

        designation:

            profile.identity?.designation ||

            "",

        dutyActive:

            profile.assignment?.dutyActive ||

            false,

        dutyType:

            profile.assignment?.dutyType ||

            "",

        assignedArea:

            profile.assignment?.assignedCompartment ||

            profile.assignment?.assignedArea ||

            "",

        currentCompartment:

            profile.spatial?.compartment ||

            "",

        currentBeat:

            profile.spatial?.beat ||

            "",

        currentRange:

            profile.spatial?.range ||

            "",

        currentDivision:

            profile.spatial?.division ||

            "",

        insidePosting:

            posting ?

            posting.inside :

            false,

        insideAssignment:

            assignment ?

            assignment.inside :

            false,

        speed:

            profile.gps?.speed ||

            0,

        heading:

            profile.gps?.heading ||

            0,

        accuracy:

            profile.gps?.accuracy ||

            0,

        nearbyStaff:

            nearby.length,

        nearby:

            nearby

    };

};
  /*=========================================================
  GIS Query
  Staff Inside Compartment
=========================================================*/

GISQuery.findStaffInsideCompartment =

function (

    compartment

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !compartment

    ) {

        return [];

    }

    compartment =

        String(

            compartment

        )

        .trim()

        .toUpperCase();

    const live =

        GG.GISBusiness
        .getLiveStaff();

    const results =

        [];

    /*----------------------------------
      Scan Live Staff
    ----------------------------------*/

    Object.values(

        live

    ).forEach(

        function (

            item

        ) {

            const profile =

                GG
                .StaffHydrator
                .hydrate(

                    item.cleanName

                );

            if (

                !profile

            ) {

                return;

            }

            const located =

                GG
                .StaffGIS
                .locate(

                    item.cleanName

                );

            const current =

                located?.profile
                    ?.spatial
                    ?.compartment ||

                "";

            if (

                current
                .toUpperCase() ===

                compartment

            ) {

                results.push(

                    located.profile

                );

            }

        }

    );

    /*----------------------------------
      Return
    ----------------------------------*/

    return results;

};
  /*=========================================================
  GIS Query
  Staff Inside Beat
=========================================================*/

GISQuery.findStaffInsideBeat =

function (

    beat

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !beat

    ) {

        return [];

    }

    beat =

        String(

            beat

        )

        .trim()

        .toUpperCase();

    const live =

        GG.GISBusiness
            .getLiveStaff();

    const results =

        [];

    /*----------------------------------
      Scan Live Staff
    ----------------------------------*/

    Object.values(

        live

    ).forEach(

        function (

            item

        ) {

            const located =

                GG
                    .StaffGIS
                    .locate(

                        item.cleanName

                    );

            if (

                !located ||

                !located.profile

            ) {

                return;

            }

            const currentBeat =

                String(

                    located.profile
                        .spatial
                        ?.beat ||

                    ""

                )

                .trim()

                .toUpperCase();

            if (

                currentBeat ===

                beat

            ) {

                results.push(

                    located.profile

                );

            }

        }

    );

    /*----------------------------------
      Return
    ----------------------------------*/

    return results;

};
  /*=========================================================
  GIS Query
  Nearest Compartment
=========================================================*/

GISQuery.findNearestCompartment =

function (

    lat,

    lng

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        lat == null ||

        lng == null ||

        typeof turf ===

        "undefined"

    ) {

        return null;

    }

    const point =

        turf.point([

            Number(lng),

            Number(lat)

        ]);

    let nearest =

        null;

    let minDistance =

        Infinity;

    /*----------------------------------
      Scan Compartments
    ----------------------------------*/

    GG.GISBusiness

        .getCompartments()

        .forEach(

            function (

                feature

            ) {

                try {

                    const center =

                        turf.centroid(

                            feature

                        );

                    const distance =

                        turf.distance(

                            point,

                            center,

                            {

                                units:

                                    "meters"

                            }

                        );

                    if (

                        distance <

                        minDistance

                    ) {

                        minDistance =

                            distance;

                        nearest =

                            feature;

                    }

                }

                catch (

                    e

                ) {}

            }

        );

    /*----------------------------------
      Return
    ----------------------------------*/

    if (

        !nearest

    ) {

        return null;

    }

    return {

        feature:

            nearest,

        distance:

            Math.round(

                minDistance

            ),

        properties:

            nearest.properties ||

            {}

    };

};
  /*=========================================================
  GIS Query
  Hierarchy
=========================================================*/

GISQuery.getHierarchy =

function (

    value

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !value

    ) {

        return null;

    }

    value =

        String(

            value

        )

        .trim();

    /*----------------------------------
      Search Entity
    ----------------------------------*/

    const entity =

        GG.GISEntities.search(

            value

        );

    if (

        !entity

    ) {

        return null;

    }

    const p =

        entity.properties ||

        {};

    /*----------------------------------
      Return
    ----------------------------------*/

    return {

        division:

            p.division ||

            "",

        range:

            p.range ||

            "",

        beat:

            p.beat ||

            "",

        compartment:

            p.compartment ||

            "",

        village:

            p.village ||

            "",

        feature:

            entity

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
