(function (window) {

"use strict";

/*=========================================================
 GREENGUARD AI
=========================================================*/

const GG =
    window.GreenGuardAI =
    window.GreenGuardAI || {};

/*=========================================================
 DEPENDENCIES
=========================================================*/

const StaffConstants =
    GG.StaffConstants;

if (

    !StaffConstants

) {

    throw new Error(

        "StaffConstants not loaded."

    );

}

/*=========================================================
 MODULE
=========================================================*/

const StaffFormatter = {};

/*=========================================================
 VERSION
=========================================================*/

StaffFormatter.VERSION =

    "1.0.0";

/*=========================================================
 STATUS
=========================================================*/

StaffFormatter.loaded =

    false;

StaffFormatter.loading =

    false;

/*=========================================================
 CACHE
=========================================================*/

StaffFormatter.cache =

    new Map();

StaffFormatter.lastRequest =

    null;

StaffFormatter.lastResult =

    null;

/*=========================================================
 CLEAR CACHE
=========================================================*/

StaffFormatter.clearCache = function () {

    StaffFormatter.cache.clear();

};

/*=========================================================
 CREATE RESPONSE
=========================================================*/

StaffFormatter.createResponse = function (

    request = {}

) {

    return {

        success:

            false,

        source:

            request.source ||

            "LOCAL",

        module:

            "StaffFormatter",

        intent:

            request.intent ||

            "",

        confidence:

            request.confidence ||

            0,

        markdown:

            "",

        html:

            "",

        cards:

            [],

        tables:

            [],

        sections:

            [],

        message:

            "",

        metadata: {

            version:

                StaffFormatter.VERSION,

            createdAt:

                Date.now(),

            executionTime:

                0

        }

    };

};

/*=========================================================
 INITIALIZE
=========================================================*/

StaffFormatter.initialize = function () {

    StaffFormatter.loaded =

        true;

    StaffFormatter.loading =

        false;

    return true;

};/*=========================================================
 MASTER FORMATTER
=========================================================*/

StaffFormatter.format = function (

    response

) {

    const started =

        Date.now();

    /*----------------------------------
      Create Result
    ----------------------------------*/

    const result =

        StaffFormatter.createResponse(

            response

        );

    StaffFormatter.lastRequest =

        response;

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !response ||

        typeof response !== "object"

    ) {

        result.message =

            "Invalid formatter response.";

        return result;

    }

    /*----------------------------------
      Route
    ----------------------------------*/

    switch (

        response.intent

    ) {

        case StaffConstants.INTENTS.STAFF_PROFILE:

            return StaffFormatter.formatProfile(

                response

            );

        case StaffConstants.INTENTS.STAFF_DIRECTORY:

            return StaffFormatter.formatDirectory(

                response

            );
case StaffConstants.INTENTS.STAFF_ASSIGNMENT:

    return StaffFormatter.formatStaffAssignment(

        response

    );
        case StaffConstants.INTENTS.STAFF_POSTING:

            return StaffFormatter.formatPosting(

                response

            );

        case StaffConstants.INTENTS.STAFF_LOCATION:

            return StaffFormatter.formatLocation(

                response

            );

        case StaffConstants.INTENTS.STAFF_DUTY:

            return StaffFormatter.formatDuty(

                response

            );

        case StaffConstants.INTENTS.STAFF_GPS:

            return StaffFormatter.formatGPS(

                response

            );

        case StaffConstants.INTENTS.STAFF_TEAM:

            return StaffFormatter.formatTeam(

                response

            );

        case StaffConstants.INTENTS.STAFF_STRENGTH:

            return StaffFormatter.formatStrength(

                response

            );

        case StaffConstants.INTENTS.STAFF_ANALYTICS:

            return StaffFormatter.formatAnalytics(

                response

            );

        default:

            result.success =

                false;

            result.message =

                "Formatter not available for intent: " +

                response.intent;

            result.metadata.executionTime =

                Date.now() -

                started;

            StaffFormatter.lastResult =

                result;

            return result;

    }

};/*=========================================================
 FORMAT PROFILE
=========================================================*/

/*=========================================================
 FORMAT STAFF PROFILE
=========================================================*/

StaffFormatter.formatProfile = function (

    response

) {

    const result =

        StaffFormatter.createResponse(

            response

        );

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !response ||

        !response.success ||

        !response.data

    ) {

        result.message =

            response?.message ||

            "Staff profile not found.";

        return result;

    }

    const profile =

        response.data;

    console.log(

        "FORMAT PROFILE",

        profile

    );

    console.log(

        "IDENTITY",

        profile.identity

    );

    /*----------------------------------
      Display Name
    ----------------------------------*/

    const displayName =

        profile.identity?.name ||

        profile.identity?.rawName ||

        profile.identity?.cleanName ||

        "-";

    /*----------------------------------
      Markdown
    ----------------------------------*/

    result.markdown = [

        "# 👤 STAFF PROFILE",

        "",

        "**Name:** " +

            displayName,

        "**Role:** " +

            (

                profile.identity?.role ||

                "-"

            ),

        "**Designation:** " +

            (

                profile.identity?.designation ||

                "-"

            ),

        "**Phone:** " +

            (

                profile.identity?.phone ||

                "-"

            ),

        "**Email:** " +

            (

                profile.identity?.email ||

                "-"

            ),

        "",

        "## 📍 Posting",

        "",

        "**Circle:** " +

            (

                profile.posting?.circle ||

                "-"

            ),

        "**Division:** " +

            (

                profile.posting?.division ||

                "-"

            ),

        "**Range:** " +

            (

                profile.posting?.range ||

                "-"

            ),

        "**Beat:** " +

            (

                profile.posting?.beat ||

                "-"

            ),

        "",

        "## 🚓 Duty",

        "",

        "**Duty:** " +

            (

                profile.assignment?.dutyType ||

                "-"

            ),

        "**Status:** " +

            (

                profile.assignment?.status ||

                "-"

            ),

        "**Active:** " +

            (

                profile.assignment?.dutyActive

                    ? "YES"

                    : "NO"

            ),

        "",

        "## 📡 GPS",

        "",

        "**Location:** " +

            (

                profile.location?.location ||

                "-"

            ),

        "**Latitude:** " +

            (

                profile.location?.lat ??

                "-"

            ),

        "**Longitude:** " +

            (

                profile.location?.lon ??

                "-"

            ),

        "**Accuracy:** " +

            (

                profile.gps?.accuracy ??

                "-"

            ),

        "**Speed:** " +

            (

                profile.gps?.speed ??

                "-"

            ),

        "",

        "## 👥 Team",

        "",

        "**Leader:** " +

            (

                profile.teamInfo?.leader ||

                "-"

            ),

        "**Team:** " +

            (

                profile.teamInfo?.team ||

                "-"

            )

    ].join(

        "\n"

    );

    /*----------------------------------
      Cards
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-profile",

        title:

            displayName,

        data:

            profile

    });

    /*----------------------------------
      Sections
    ----------------------------------*/

    result.sections.push({

        title:

            "Profile",

        data:

            profile

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.intent =

        StaffConstants.INTENTS.STAFF_PROFILE;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.success =

        true;

    result.message =

        "Profile formatted.";

    return result;

};

 StaffFormatter.formatStaffAssignment = function (

    response

) {

    const a =

        response.assignment;

    if (

        !a

    ) {

        return "Assignment not found.";

    }

    let text =

        "";

    text +=

        a.name + "\n\n";

    text +=

        "Assigned Area\n";

    text +=

        (a.assignedCompartment || "—") + "\n\n";

    text +=

        "Duty Type\n";

    text +=

        (a.dutyType || "—") + "\n\n";

    text +=

        "Duty Status\n";

    text +=

        (a.status || "—");

    return text;

};
 /*=========================================================
 FORMAT DIRECTORY
=========================================================*/

StaffFormatter.formatDirectory = function (

    response

) {

    const result =

        StaffFormatter.createResponse(

            response

        );

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !response ||

        !response.success ||

        !Array.isArray(

            response.staff

        )

    ) {

        result.message =

            response?.message ||

            "No staff found.";

        return result;

    }

    const staff =

        response.staff;

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [

        "# 👥 STAFF DIRECTORY",

        "",

        "**Total Staff:** " +

        staff.length,

        ""

    ];

    staff.forEach(

        function (

            person,

            index

        ) {

            lines.push(

                (

                    index + 1

                ) +

                ". **" +

                (

                    person.rawName ||

                    person.name ||

                    "-"

                ) +

                "**"

            );

            lines.push(

                "   • Role: " +

                (

                    person.role ||

                    "-"

                )

            );

            lines.push(

                "   • Division: " +

                (

                    person.division ||

                    "-"

                )

            );

            lines.push(

                "   • Range: " +

                (

                    person.range ||

                    "-"

                )

            );

            lines.push(

                "   • Beat: " +

                (

                    person.beat ||

                    "-"

                )

            );

            lines.push(

                "   • Phone: " +

                (

                    person.phone ||

                    "-"

                )

            );

            lines.push("");

        }

    );

    result.markdown =

        lines.join(

            "\n"

        );

    /*----------------------------------
      Table
    ----------------------------------*/

    result.tables.push({

        title:

            "Staff Directory",

        columns: [

            "Name",

            "Role",

            "Division",

            "Range",

            "Beat",

            "Phone"

        ],

        rows:

            staff.map(

                function (

                    person

                ) {

                    return [

                        person.rawName ||

                        person.name ||

                        "",

                        person.role ||

                        "",

                        person.division ||

                        "",

                        person.range ||

                        "",

                        person.beat ||

                        "",

                        person.phone ||

                        ""

                    ];

                }

            )

    });

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-directory",

        title:

            "Staff Directory",

        total:

            staff.length,

        data:

            staff

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Directory",

        data:

            staff

    });

    result.success =

        true;

    result.message =

        "Directory formatted.";

    return result;

};/*=========================================================
 FORMAT POSTING
=========================================================*/

StaffFormatter.formatPosting = function (

    response

) {

    const result =

        StaffFormatter.createResponse(

            response

        );

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !response ||

        !response.success ||

        !response.posting

    ) {

        result.message =

            response?.message ||

            "Posting details not found.";

        return result;

    }

    const posting =

        response.posting;

    /*----------------------------------
      Markdown
    ----------------------------------*/

    result.markdown = [

        "# 📍 STAFF POSTING",

        "",

        "**Name:** " +

            (

                posting.rawName ||

                posting.name ||

                "-"

            ),

        "**Role:** " +

            (

                posting.role ||

                "-"

            ),

        "**Designation:** " +

            (

                posting.designation ||

                "-"

            ),

        "",

        "## 🌳 Administrative Posting",

        "",

        "**Circle:** " +

            (

                posting.circle ||

                "-"

            ),

        "**Division:** " +

            (

                posting.division ||

                "-"

            ),

        "**Range:** " +

            (

                posting.range ||

                "-"

            ),

        "**Beat:** " +

            (

                posting.beat ||

                "-"

            ),

        "",

        "## 🚓 Current Assignment",

        "",

        "**Compartment:** " +

            (

                posting.assignedCompartment ||

                "-"

            ),

        "**Duty Type:** " +

            (

                posting.dutyType ||

                "-"

            ),

        "**Status:** " +

            (

                posting.status ||

                "-"

            ),

        "**Duty Active:** " +

            (

                posting.dutyActive

                    ? "YES"

                    : "NO"

            ),

        "",

        "## 👥 Team",

        "",

        "**Leader:** " +

            (

                posting.leader ||

                "-"

            ),

        "**Team:** " +

            (

                posting.team ||

                "-"

            ),

        "",

        "## 📡 Current Location",

        "",

        "**Location:** " +

            (

                posting.location ||

                "-"

            ),

        "**Latitude:** " +

            (

                posting.latitude ??

                "-"

            ),

        "**Longitude:** " +

            (

                posting.longitude ??

                "-"

            )

    ].join(

        "\n"

    );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-posting",

        title:

            posting.rawName ||

            posting.name ||

            "Staff Posting",

        data:

            posting

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Posting",

        data:

            posting

    });

    result.success =

        true;

    result.message =

        "Posting formatted.";

    return result;

};/*=========================================================
 FORMAT LOCATION
=========================================================*/

StaffFormatter.formatLocation = function (

    response

) {

    const result =

        StaffFormatter.createResponse(

            response

        );

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !response ||

        !response.success ||

        !response.location

    ) {

        result.message =

            response?.message ||

            "Location information not found.";

        return result;

    }

    const location =

        response.location;

    /*----------------------------------
      Markdown
    ----------------------------------*/

    result.markdown = [

        "# 📡 STAFF LOCATION",

        "",

        "**Name:** " +

            (

                location.rawName ||

                location.name ||

                "-"

            ),

        "**Role:** " +

            (

                location.role ||

                "-"

            ),

        "**Designation:** " +

            (

                location.designation ||

                "-"

            ),

        "",

        "## 🌳 Administrative Posting",

        "",

        "**Circle:** " +

            (

                location.circle ||

                "-"

            ),

        "**Division:** " +

            (

                location.division ||

                "-"

            ),

        "**Range:** " +

            (

                location.range ||

                "-"

            ),

        "**Beat:** " +

            (

                location.beat ||

                "-"

            ),

        "",

        "## 📍 Live Location",

        "",

        "**Location:** " +

            (

                location.location ||

                "-"

            ),

        "**Latitude:** " +

            (

                location.latitude ??

                "-"

            ),

        "**Longitude:** " +

            (

                location.longitude ??

                "-"

            ),

        "",

        "## 📡 GPS",

        "",

        "**Accuracy:** " +

            (

                location.accuracy ??

                "-"

            ),

        "**Speed:** " +

            (

                location.speed ??

                "-"

            ),

        "**Heading:** " +

            (

                location.heading ??

                "-"

            ),

        "**Last Seen:** " +

            (

                location.lastSeen ||

                "-"

            ),

        "",

        "## 🚓 Duty",

        "",

        "**Duty Type:** " +

            (

                location.dutyType ||

                "-"

            ),

        "**Status:** " +

            (

                location.status ||

                "-"

            ),

        "**Duty Active:** " +

            (

                location.dutyActive

                    ? "YES"

                    : "NO"

            )

    ].join(

        "\n"

    );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-location",

        title:

            location.rawName ||

            location.name ||

            "Staff Location",

        data:

            location

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Location",

        data:

            location

    });

    result.success =

        true;

    result.message =

        "Location formatted.";

    return result;

};/*=========================================================
 FORMAT DUTY
=========================================================*/

StaffFormatter.formatDuty = function (

    response

) {

    const result =

        StaffFormatter.createResponse(

            response

        );

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !response ||

        !response.success ||

        !response.duty

    ) {

        result.message =

            response?.message ||

            "Duty information not found.";

        return result;

    }

    const duty =

        response.duty;

    /*----------------------------------
      Markdown
    ----------------------------------*/

    result.markdown = [

        "# 🚓 STAFF DUTY",

        "",

        "**Name:** " +

            (

                duty.rawName ||

                duty.name ||

                "-"

            ),

        "**Role:** " +

            (

                duty.role ||

                "-"

            ),

        "**Designation:** " +

            (

                duty.designation ||

                "-"

            ),

        "",

        "## 🌳 Posting",

        "",

        "**Circle:** " +

            (

                duty.circle ||

                "-"

            ),

        "**Division:** " +

            (

                duty.division ||

                "-"

            ),

        "**Range:** " +

            (

                duty.range ||

                "-"

            ),

        "**Beat:** " +

            (

                duty.beat ||

                "-"

            ),

        "",

        "## 🚓 Duty Information",

        "",

        "**Duty Type:** " +

            (

                duty.dutyType ||

                "-"

            ),

        "**Status:** " +

            (

                duty.status ||

                "-"

            ),

        "**Duty Active:** " +

            (

                duty.dutyActive

                    ? "YES"

                    : "NO"

            ),

        "**Last Duty End:** " +

            (

                duty.lastDutyEnd ||

                "-"

            ),

        "",

        "## 👥 Team",

        "",

        "**Leader:** " +

            (

                duty.leader ||

                "-"

            ),

        "**Team:** " +

            (

                duty.team ||

                "-"

            ),

        "",

        "## 📡 Live GPS",

        "",

        "**Location:** " +

            (

                duty.location ||

                "-"

            ),

        "**Latitude:** " +

            (

                duty.latitude ??

                "-"

            ),

        "**Longitude:** " +

            (

                duty.longitude ??

                "-"

            ),

        "**Accuracy:** " +

            (

                duty.accuracy ??

                "-"

            ),

        "**Speed:** " +

            (

                duty.speed ??

                "-"

            ),

        "**Last Seen:** " +

            (

                duty.lastSeen ||

                "-"

            )

    ].join(

        "\n"

    );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-duty",

        title:

            duty.rawName ||

            duty.name ||

            "Staff Duty",

        data:

            duty

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Duty",

        data:

            duty

    });

    result.success =

        true;

    result.message =

        "Duty formatted.";

    return result;

};/*=========================================================
 FORMAT GPS
=========================================================*/

StaffFormatter.formatGPS = function (

    response

) {

    const result =

        StaffFormatter.createResponse(

            response

        );

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !response ||

        !response.success ||

        !response.gps

    ) {

        result.message =

            response?.message ||

            "GPS information not found.";

        return result;

    }

    const gps =

        response.gps;

    /*----------------------------------
      Markdown
    ----------------------------------*/

    result.markdown = [

        "# 📡 STAFF GPS",

        "",

        "**Name:** " +

            (

                gps.rawName ||

                gps.name ||

                "-"

            ),

        "**Role:** " +

            (

                gps.role ||

                "-"

            ),

        "**Designation:** " +

            (

                gps.designation ||

                "-"

            ),

        "",

        "## 📍 Current Location",

        "",

        "**Location:** " +

            (

                gps.location ||

                "-"

            ),

        "**Latitude:** " +

            (

                gps.latitude ??

                "-"

            ),

        "**Longitude:** " +

            (

                gps.longitude ??

                "-"

            ),

        "",

        "## 📡 GPS Details",

        "",

        "**Accuracy:** " +

            (

                gps.accuracy ??

                "-"

            ),

        "**Speed:** " +

            (

                gps.speed ??

                "-"

            ),

        "**Heading:** " +

            (

                gps.heading ??

                "-"

            ),

        "**Turn Angle:** " +

            (

                gps.turnAngle ??

                "-"

            ),

        "**Turn Rate:** " +

            (

                gps.turnRate ??

                "-"

            ),

        "**Last Seen:** " +

            (

                gps.lastSeen ||

                "-"

            ),

        "**Updated At:** " +

            (

                gps.updatedAt ||

                "-"

            ),

        "",

        "## 🚓 Duty",

        "",

        "**Duty Type:** " +

            (

                gps.dutyType ||

                "-"

            ),

        "**Duty Active:** " +

            (

                gps.dutyActive

                    ? "YES"

                    : "NO"

            ),

        "**Status:** " +

            (

                gps.status ||

                "-"

            ),

        "",

        "## 🌳 Posting",

        "",

        "**Circle:** " +

            (

                gps.circle ||

                "-"

            ),

        "**Division:** " +

            (

                gps.division ||

                "-"

            ),

        "**Range:** " +

            (

                gps.range ||

                "-"

            ),

        "**Beat:** " +

            (

                gps.beat ||

                "-"

            ),

        "",

        "## 👥 Team",

        "",

        "**Leader:** " +

            (

                gps.leader ||

                "-"

            ),

        "**Team:** " +

            (

                gps.team ||

                "-"

            ),

        "",

        "## 📈 Tracking",

        "",

        "**Session ID:** " +

            (

                gps.sessionId ||

                "-"

            ),

        "**Source:** " +

            (

                gps.source ||

                "-"

            ),

        "",

        "## 📊 Analytics",

        "",

        "**Distance:** " +

            (

                gps.distanceKm ??

                0

            ) +

            " km",

        "**GPS Points:** " +

            (

                gps.pointCount ??

                0

            )

    ].join(

        "\n"

    );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-gps",

        title:

            gps.rawName ||

            gps.name ||

            "Staff GPS",

        data:

            gps

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "GPS",

        data:

            gps

    });

    result.success =

        true;

    result.message =

        "GPS formatted.";

    return result;

};/*=========================================================
 FORMAT TEAM
=========================================================*/

StaffFormatter.formatTeam = function (

    response

) {

    const result =

        StaffFormatter.createResponse(

            response

        );

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !response ||

        !response.success ||

        !response.team

    ) {

        result.message =

            response?.message ||

            "Team information not found.";

        return result;

    }

    const team =

        response.team;

    /*----------------------------------
      Markdown
    ----------------------------------*/

    result.markdown = [

        "# 👥 STAFF TEAM",

        "",

        "**Name:** " +

            (

                team.rawName ||

                team.name ||

                "-"

            ),

        "**Role:** " +

            (

                team.role ||

                "-"

            ),

        "**Designation:** " +

            (

                team.designation ||

                "-"

            ),

        "",

        "## 👥 Team Information",

        "",

        "**Leader:** " +

            (

                team.leader ||

                "-"

            ),

        "**Team:** " +

            (

                team.team ||

                "-"

            ),

        "",

        "## 🌳 Administrative Posting",

        "",

        "**Circle:** " +

            (

                team.circle ||

                "-"

            ),

        "**Division:** " +

            (

                team.division ||

                "-"

            ),

        "**Range:** " +

            (

                team.range ||

                "-"

            ),

        "**Beat:** " +

            (

                team.beat ||

                "-"

            ),

        "**Compartment:** " +

            (

                team.assignedCompartment ||

                "-"

            ),

        "",

        "## 🚓 Duty",

        "",

        "**Duty Type:** " +

            (

                team.dutyType ||

                "-"

            ),

        "**Status:** " +

            (

                team.status ||

                "-"

            ),

        "**Duty Active:** " +

            (

                team.dutyActive

                    ? "YES"

                    : "NO"

            ),

        "",

        "## 📡 Live GPS",

        "",

        "**Location:** " +

            (

                team.location ||

                "-"

            ),

        "**Latitude:** " +

            (

                team.latitude ??

                "-"

            ),

        "**Longitude:** " +

            (

                team.longitude ??

                "-"

            ),

        "**Accuracy:** " +

            (

                team.accuracy ??

                "-"

            ),

        "**Speed:** " +

            (

                team.speed ??

                "-"

            ),

        "",

        "## 📈 Patrol Statistics",

        "",

        "**Distance:** " +

            (

                team.distanceKm ??

                0

            ) +

            " km",

        "**GPS Points:** " +

            (

                team.pointCount ??

                0

            ),

        "**Session Started:** " +

            (

                team.startedAt ||

                "-"

            ),

        "**Session Ended:** " +

            (

                team.endedAt ||

                "-"

            )

    ].join(

        "\n"

    );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-team",

        title:

            team.rawName ||

            team.name ||

            "Staff Team",

        data:

            team

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Team",

        data:

            team

    });

    result.success =

        true;

    result.message =

        "Team formatted.";

    return result;

};/*=========================================================
 FORMAT STRENGTH
=========================================================*/

StaffFormatter.formatStrength = function (

    response

) {

    const result =

        StaffFormatter.createResponse(

            response

        );

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !response ||

        !response.success ||

        !response.summary

    ) {

        result.message =

            response?.message ||

            "Staff strength not available.";

        return result;

    }

    const summary =

        response.summary;

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [

        "# 👥 STAFF STRENGTH",

        "",

        "**Total Staff:** " +

        (

            summary.total ||

            0

        ),

        "",

        "**Active Staff:** " +

        (

            summary.active ||

            0

        ),

        "",

        "**Inactive Staff:** " +

        (

            summary.inactive ||

            0

        ),

        "",

        "**Active %:** " +

        (

            summary.statistics?.activePercentage ??

            0

        ) +

        "%",

        "",

        "**Inactive %:** " +

        (

            summary.statistics?.inactivePercentage ??

            0

        ) +

        "%",

        "",

        "## 👮 By Role",

        ""

    ];

    Object.entries(

        summary.byRole ||

        {}

    ).forEach(

        function (

            [

                role,

                count

            ]

        ) {

            lines.push(

                "- " +

                role +

                ": " +

                count

            );

        }

    );

    lines.push("");

    lines.push(

        "## 🌳 By Division"

    );

    lines.push("");

    Object.entries(

        summary.byDivision ||

        {}

    ).forEach(

        function (

            [

                division,

                count

            ]

        ) {

            lines.push(

                "- " +

                division +

                ": " +

                count

            );

        }

    );

    lines.push("");

    lines.push(

        "## 🌲 By Range"

    );

    lines.push("");

    Object.entries(

        summary.byRange ||

        {}

    ).forEach(

        function (

            [

                range,

                count

            ]

        ) {

            lines.push(

                "- " +

                range +

                ": " +

                count

            );

        }

    );

    lines.push("");

    lines.push(

        "## 📍 By Beat"

    );

    lines.push("");

    Object.entries(

        summary.byBeat ||

        {}

    ).forEach(

        function (

            [

                beat,

                count

            ]

        ) {

            lines.push(

                "- " +

                beat +

                ": " +

                count

            );

        }

    );

    result.markdown =

        lines.join(

            "\n"

        );

    /*----------------------------------
      Dashboard Card
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-strength",

        title:

            "Staff Strength",

        total:

            summary.total,

        active:

            summary.active,

        inactive:

            summary.inactive,

        data:

            summary

    });

    /*----------------------------------
      Summary Table
    ----------------------------------*/

    result.tables.push({

        title:

            "Strength Summary",

        columns: [

            "Metric",

            "Value"

        ],

        rows: [

            [

                "Total Staff",

                summary.total

            ],

            [

                "Active Staff",

                summary.active

            ],

            [

                "Inactive Staff",

                summary.inactive

            ],

            [

                "Active %",

                summary.statistics?.activePercentage +

                "%"

            ],

            [

                "Inactive %",

                summary.statistics?.inactivePercentage +

                "%"

            ]

        ]

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Strength Summary",

        data:

            summary

    });

    result.success =

        true;

    result.message =

        "Strength formatted.";

    return result;

};/*=========================================================
 FORMAT ANALYTICS
=========================================================*/

StaffFormatter.formatAnalytics = function (

    response

) {

    const result =

        StaffFormatter.createResponse(

            response

        );

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !response ||

        !response.success ||

        !response.analytics

    ) {

        result.message =

            response?.message ||

            "Analytics not available.";

        return result;

    }

    const analytics =

        response.analytics;

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [

        "# 📊 STAFF ANALYTICS",

        "",

        "## 👥 Staff",

        "",

        "**Total Staff:** " +

        (

            analytics.totalStaff ||

            0

        ),

        "",

        "**Active Staff:** " +

        (

            analytics.activeStaff ||

            0

        ),

        "",

        "**Inactive Staff:** " +

        (

            analytics.inactiveStaff ||

            0

        ),

        "",

        "## 🚓 Patrol",

        "",

        "**Total Distance:** " +

        (

            analytics.totalDistance ||

            0

        ) +

        " km",

        "",

        "**Average Distance:** " +

        (

            analytics.averageDistance ||

            0

        ) +

        " km",

        "",

        "**Sessions:** " +

        (

            analytics.totalSessions ||

            0

        ),

        "",

        "## 📡 GPS",

        "",

        "**Total Points:** " +

        (

            analytics.totalPoints ||

            0

        ),

        "",

        "**Average Points:** " +

        (

            analytics.averagePoints ||

            0

        ),

        "",

        "## 🚓 Duty",

        "",

        "**Active Duty:** " +

        (

            analytics.activeDuty ||

            0

        ),

        "",

        "**Inactive Duty:** " +

        (

            analytics.inactiveDuty ||

            0

        ),

        "",

        "## 👮 Role Distribution",

        ""

    ];

    Object.entries(

        analytics.byRole ||

        {}

    ).forEach(

        function (

            [

                role,

                count

            ]

        ) {

            lines.push(

                "- " +

                role +

                ": " +

                count

            );

        }

    );

    lines.push("");

    lines.push(

        "## 🌳 Division Distribution"

    );

    lines.push("");

    Object.entries(

        analytics.byDivision ||

        {}

    ).forEach(

        function (

            [

                division,

                count

            ]

        ) {

            lines.push(

                "- " +

                division +

                ": " +

                count

            );

        }

    );

    lines.push("");

    lines.push(

        "## 🌲 Range Distribution"

    );

    lines.push("");

    Object.entries(

        analytics.byRange ||

        {}

    ).forEach(

        function (

            [

                range,

                count

            ]

        ) {

            lines.push(

                "- " +

                range +

                ": " +

                count

            );

        }

    );

    lines.push("");

    lines.push(

        "## 📍 Beat Distribution"

    );

    lines.push("");

    Object.entries(

        analytics.byBeat ||

        {}

    ).forEach(

        function (

            [

                beat,

                count

            ]

        ) {

            lines.push(

                "- " +

                beat +

                ": " +

                count

            );

        }

    );

    result.markdown =

        lines.join(

            "\n"

        );

    /*----------------------------------
      Dashboard Card
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-analytics",

        title:

            "Staff Analytics",

        data:

            analytics

    });

    /*----------------------------------
      Summary Table
    ----------------------------------*/

    result.tables.push({

        title:

            "Analytics Summary",

        columns: [

            "Metric",

            "Value"

        ],

        rows: [

            [

                "Total Staff",

                analytics.totalStaff

            ],

            [

                "Active Staff",

                analytics.activeStaff

            ],

            [

                "Inactive Staff",

                analytics.inactiveStaff

            ],

            [

                "Distance (km)",

                analytics.totalDistance

            ],

            [

                "Average Distance",

                analytics.averageDistance

            ],

            [

                "Sessions",

                analytics.totalSessions

            ],

            [

                "GPS Points",

                analytics.totalPoints

            ],

            [

                "Average Points",

                analytics.averagePoints

            ]

        ]

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Analytics",

        data:

            analytics

    });

    result.success =

        true;

    result.message =

        "Analytics formatted.";

    return result;

};/*=========================================================
 REGISTER
=========================================================*/

GG.formatStaffResponse = function (

    response

) {

    return StaffFormatter.format(

        response

    );

};

/*=========================================================
 INITIALIZE
=========================================================*/

StaffFormatter.initialize();

/*=========================================================
 EXPORT
=========================================================*/

GG.StaffFormatter =

    StaffFormatter;

console.log(

    "%cStaff Formatter Loaded",

    "color:#008000;font-weight:bold;"

);

})(window);
