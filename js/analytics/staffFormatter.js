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
 FORMAT
=========================================================*/

StaffFormatter.format = function (

    response

) {

    StaffFormatter.lastRequest =

        response;

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !response ||

        typeof response !== "object"

    ) {

        const result =

            StaffFormatter.createResponse();

        result.success =

            false;

        result.message =

            "Invalid formatter response.";

        StaffFormatter.lastResult =

            result;

        return result;

    }

    /*----------------------------------
      Route
    ----------------------------------*/

    switch (

        response.intent

    ) {

        /*=================================================
          STAFF IDENTITY
        =================================================*/

        case StaffConstants.INTENTS.STAFF_PROFILE:

            return StaffFormatter.formatProfile(

                response

            );

        case StaffConstants.INTENTS.STAFF_CONTACT:

            return StaffFormatter.formatContact(

                response

            );

        case StaffConstants.INTENTS.STAFF_DESIGNATION:

            return StaffFormatter.formatDesignation(

                response

            );

        case StaffConstants.INTENTS.STAFF_ROLE:

            return StaffFormatter.formatRole(

                response

            );

        /*=================================================
          STAFF DIRECTORY
        =================================================*/

        case StaffConstants.INTENTS.STAFF_DIRECTORY:

            return StaffFormatter.formatDirectory(

                response

            );

        /*=================================================
          STAFF POSTING
        =================================================*/

        case StaffConstants.INTENTS.STAFF_POSTING:

            return StaffFormatter.formatPosting(

                response

            );

        case StaffConstants.INTENTS.STAFF_CIRCLE:

            return StaffFormatter.formatCircle(

                response

            );

        case StaffConstants.INTENTS.STAFF_DIVISION:

            return StaffFormatter.formatDivision(

                response

            );

        case StaffConstants.INTENTS.STAFF_RANGE:

            return StaffFormatter.formatRange(

                response

            );

        case StaffConstants.INTENTS.STAFF_BEAT:

            return StaffFormatter.formatBeat(

                response

            );

        /*=================================================
          STAFF DUTY
        =================================================*/

        case StaffConstants.INTENTS.STAFF_DUTY:

            return StaffFormatter.formatDuty(

                response

            );

        case StaffConstants.INTENTS.STAFF_DUTY_STATUS:

            return StaffFormatter.formatDutyStatus(

                response

            );

        case StaffConstants.INTENTS.STAFF_DUTY_TYPE:

            return StaffFormatter.formatDutyType(

                response

            );

        case StaffConstants.INTENTS.STAFF_DUTY_STARTED:

            return StaffFormatter.formatDutyStarted(

                response

            );

        case StaffConstants.INTENTS.STAFF_DUTY_ENDED:

            return StaffFormatter.formatDutyEnded(

                response

            );

        case StaffConstants.INTENTS.STAFF_ASSIGNMENT:

            return StaffFormatter.formatStaffAssignment(

                response

            );

        /*=================================================
          STAFF TEAM
        =================================================*/

        case StaffConstants.INTENTS.STAFF_TEAM:

            return StaffFormatter.formatTeam(

                response

            );

        case StaffConstants.INTENTS.STAFF_LEADER:

            return StaffFormatter.formatLeader(

                response

            );

        /*=================================================
          STAFF LOCATION
        =================================================*/

        case StaffConstants.INTENTS.STAFF_LOCATION:

            return StaffFormatter.formatLocation(

                response

            );

        case StaffConstants.INTENTS.STAFF_GPS:

            return StaffFormatter.formatGPS(

                response

            );

        /*=================================================
          STAFF PATROL ANALYTICS
        =================================================*/

        case StaffConstants.INTENTS.STAFF_ANALYTICS:

            return StaffFormatter.formatAnalytics(

                response

            );

        case StaffConstants.INTENTS.STAFF_DISTANCE:

            return StaffFormatter.formatDistance(

                response

            );

        case StaffConstants.INTENTS.STAFF_PATROL_POINTS:

            return StaffFormatter.formatPatrolPoints(

                response

            );

        case StaffConstants.INTENTS.STAFF_PATROL_START:

            return StaffFormatter.formatPatrolStart(

                response

            );

        case StaffConstants.INTENTS.STAFF_PATROL_END:

            return StaffFormatter.formatPatrolEnd(

                response

            );

        case StaffConstants.INTENTS.STAFF_PATROL_DURATION:

            return StaffFormatter.formatPatrolDuration(

                response

            );

        /*=================================================
          STAFF STRENGTH
        =================================================*/

        case StaffConstants.INTENTS.STAFF_STRENGTH:

            return StaffFormatter.formatStrength(

                response

            );

        /*=================================================
          DEFAULT
        =================================================*/

        default:

        {

            const result =

                StaffFormatter.createResponse(

                    response

                );

            result.success =

                false;

            result.message =

                "Formatter not available for intent: " +

                response.intent;

            StaffFormatter.lastResult =

                result;

            return result;

        }

    }

};/*=========================================================
 FORMAT PROFILE
=========================================================*/

/*=========================================================
 FORMAT STAFF PROFILE
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

    /*----------------------------------
      Canonical Profile
    ----------------------------------*/

    const profile =

        response.data;

    const identity =

        profile.identity ||

        {};

    const posting =

        profile.posting ||

        {};

    const assignment =

        profile.assignment ||

        {};

    const location =

        profile.location ||

        {};

    const gps =

        profile.gps ||

        {};

    const team =

        profile.teamInfo ||

        {};

    const tracking =

        profile.tracking ||

        {};

    const analytics =

        profile.analytics ||

        {};

    /*----------------------------------
      Display Name
    ----------------------------------*/

    const displayName =

        identity.name ||

        identity.rawName ||

        identity.cleanName ||

        "-";

    /*----------------------------------
      Markdown
    ----------------------------------*/

    result.markdown = [

        "# 👤 STAFF PROFILE",

        "",

        "## 👤 Identity",

        "",

        "**Name:** " +

            displayName,

        "**Role:** " +

            (

                identity.role ||

                "-"

            ),

        "**Designation:** " +

            (

                identity.designation ||

                "-"

            ),

        "**Phone:** " +

            (

                identity.phone ||

                "-"

            ),

        "**Email:** " +

            (

                identity.email ||

                "-"

            ),

        "",

        "## 📍 Posting",

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

        "## 🚓 Assignment",

        "",

        "**Compartment:** " +

            (

                assignment.assignedCompartment ||

                "-"

            ),

        "**Duty Type:** " +

            (

                assignment.dutyType ||

                "-"

            ),

        "**Status:** " +

            (

                assignment.status ||

                "-"

            ),

        "**Duty Active:** " +

            (

                assignment.dutyActive

                    ? "YES"

                    : "NO"

            ),

        "",

        "## 📡 Current Location",

        "",

        "**Location:** " +

            (

                location.location ||

                "-"

            ),

        "**Latitude:** " +

            (

                location.lat ??

                "-"

            ),

        "**Longitude:** " +

            (

                location.lon ??

                "-"

            ),

        "",

        "## 📡 GPS",

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

        "**Last Seen:** " +

            (

                gps.lastSeen ||

                "-"

            ),

        "",

        "## 👥 Team",

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

        "**Members:** " +

            (

                Array.isArray(

                    team.teamMembers

                )

                    ? team.teamMembers.length

                    : 0

            ),

        "",

        "## 📈 Patrol Analytics",

        "",

        "**Distance:** " +

            (

                analytics.distanceKm ??

                0

            ) +

            " km",

        "**GPS Points:** " +

            (

                analytics.pointCount ??

                0

            ),

        "**Started:** " +

            (

                analytics.startedAt ||

                "-"

            ),

        "**Ended:** " +

            (

                analytics.endedAt ||

                "-"

            ),

        "",

        "## 🔄 Tracking",

        "",

        "**Session ID:** " +

            (

                tracking.sessionId ||

                "-"

            ),

        "**Source:** " +

            (

                tracking.source ||

                "-"

            ),

        "**Tracking ID:** " +

            (

                tracking.id ||

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

            "staff-profile",

        title:

            displayName,

        data:

            profile

    });

    /*----------------------------------
      Section
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

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_PROFILE;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Profile formatted.";

    return result;

};
/*=========================================================
 FORMAT STAFF ASSIGNMENT
=========================================================*/

StaffFormatter.formatStaffAssignment = function (

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

            "Assignment information not found.";

        return result;

    }

    /*----------------------------------
      Canonical Profile
    ----------------------------------*/

    const profile =

        response.data;

    const identity =

        profile.identity ||

        {};

    const posting =

        profile.posting ||

        {};

    const assignment =

        profile.assignment ||

        {};

    const team =

        profile.teamInfo ||

        {};

    /*----------------------------------
      Display Name
    ----------------------------------*/

    const displayName =

        identity.name ||

        identity.rawName ||

        identity.cleanName ||

        "-";

    /*----------------------------------
      Markdown
    ----------------------------------*/

    result.markdown = [

        "# 📋 STAFF ASSIGNMENT",

        "",

        "**Name:** " +

            displayName,

        "**Role:** " +

            (

                identity.role ||

                "-"

            ),

        "**Designation:** " +

            (

                identity.designation ||

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

        "## 🚓 Assignment",

        "",

        "**Assigned Compartment:** " +

            (

                assignment.assignedCompartment ||

                "-"

            ),

        "**Duty Type:** " +

            (

                assignment.dutyType ||

                "-"

            ),

        "**Status:** " +

            (

                assignment.status ||

                "-"

            ),

        "**Duty Active:** " +

            (

                assignment.dutyActive

                    ? "YES"

                    : "NO"

            ),

        "**Leader:** " +

            (

                assignment.leader ||

                team.leader ||

                "-"

            ),

        "**Team:** " +

            (

                assignment.team ||

                team.team ||

                "-"

            ),

        "**Last Duty End:** " +

            (

                assignment.lastDutyEnd ||

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

            "staff-assignment",

        title:

            displayName,

        data:

            profile

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Assignment",

        data:

            profile

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_ASSIGNMENT;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Assignment formatted.";

    return result;

};
 /*=========================================================
 FORMAT CONTACT
=========================================================*/

/*=========================================================
 FORMAT CONTACT
=========================================================*/

StaffFormatter.formatContact = function (

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

            "Contact information not found.";

        return result;

    }

    const profile =

        response.data;

    const identity =

        profile.identity ||

        {};

    /*----------------------------------
      Markdown
    ----------------------------------*/

    result.markdown = [

        "# ☎ STAFF CONTACT",

        "",

        "**Name:** " +

            (

                identity.name ||

                identity.rawName ||

                identity.cleanName ||

                "-"

            ),

        "",

        "**Phone:** " +

            (

                identity.phone ||

                "-"

            ),

        "",

        "**Email:** " +

            (

                identity.email ||

                "-"

            ),

        "",

        "**Role:** " +

            (

                identity.role ||

                "-"

            ),

        "",

        "**Designation:** " +

            (

                identity.designation ||

                "-"

            )

    ].join(

        "\n"

    );

    result.cards.push({

        type:

            "staff-contact",

        title:

            identity.name ||

            identity.rawName ||

            identity.cleanName ||

            "Contact",

        data:

            profile

    });

    result.sections.push({

        title:

            "Contact",

        data:

            profile

    });

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_CONTACT;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Contact formatted.";

    return result;

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

            response.data

        )

    ) {

        result.message =

            response?.message ||

            "No staff found.";

        return result;

    }

    const staff =

        response.data;

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

            const identity =

                person.identity ||

                {};

            const posting =

                person.posting ||

                {};

            lines.push(

                (

                    index + 1

                ) +

                ". **" +

                (

                    identity.name ||

                    identity.rawName ||

                    identity.cleanName ||

                    "-"

                ) +

                "**"

            );

            lines.push(

                "   • Role: " +

                (

                    identity.role ||

                    "-"

                )

            );

            lines.push(

                "   • Division: " +

                (

                    posting.division ||

                    "-"

                )

            );

            lines.push(

                "   • Range: " +

                (

                    posting.range ||

                    "-"

                )

            );

            lines.push(

                "   • Beat: " +

                (

                    posting.beat ||

                    "-"

                )

            );

            lines.push(

                "   • Phone: " +

                (

                    identity.phone ||

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

                    const identity =

                        person.identity ||

                        {};

                    const posting =

                        person.posting ||

                        {};

                    return [

                        identity.name ||

                        identity.rawName ||

                        identity.cleanName ||

                        "",

                        identity.role ||

                        "",

                        posting.division ||

                        "",

                        posting.range ||

                        "",

                        posting.beat ||

                        "",

                        identity.phone ||

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

    result.intent =

        StaffConstants.INTENTS.STAFF_DIRECTORY;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Directory formatted.";

    return result;

};
/*=========================================================
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

        !response.data

    ) {

        result.message =

            response?.message ||

            "Posting details not found.";

        return result;

    }

    const profile =

        response.data;

    const identity =

        profile.identity ||

        {};

    const posting =

        profile.posting ||

        {};

    const assignment =

        profile.assignment ||

        {};

    const location =

        profile.location ||

        {};

    const team =

        profile.teamInfo ||

        {};

    result.markdown = [

        "# 📍 STAFF POSTING",

        "",

        "**Name:** " +

            (

                identity.name ||

                identity.rawName ||

                identity.cleanName ||

                "-"

            ),

        "**Role:** " +

            (

                identity.role ||

                "-"

            ),

        "**Designation:** " +

            (

                identity.designation ||

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

                assignment.assignedCompartment ||

                "-"

            ),

        "**Duty Type:** " +

            (

                assignment.dutyType ||

                "-"

            ),

        "**Status:** " +

            (

                assignment.status ||

                "-"

            ),

        "**Duty Active:** " +

            (

                assignment.dutyActive

                    ? "YES"

                    : "NO"

            ),

        "",

        "## 👥 Team",

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

        "## 📡 Current Location",

        "",

        "**Location:** " +

            (

                location.location ||

                "-"

            ),

        "**Latitude:** " +

            (

                location.lat ??

                "-"

            ),

        "**Longitude:** " +

            (

                location.lon ??

                "-"

            )

    ].join(

        "\n"

    );

    result.cards.push({

        type:

            "staff-posting",

        title:

            identity.name ||

            identity.rawName ||

            identity.cleanName ||

            "Staff Posting",

        data:

            profile

    });

    result.sections.push({

        title:

            "Posting",

        data:

            profile

    });

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_POSTING;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Posting formatted.";

    return result;

};

/*=========================================================
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

        !response.data

    ) {

        result.message =

            response?.message ||

            "Location information not found.";

        return result;

    }

    const profile =

        response.data;

    const identity =

        profile.identity ||

        {};

    const posting =

        profile.posting ||

        {};

    const assignment =

        profile.assignment ||

        {};

    const location =

        profile.location ||

        {};

    const gps =

        profile.gps ||

        {};

    result.markdown = [

        "# 📡 STAFF LOCATION",

        "",

        "**Name:** " +

            (

                identity.name ||

                identity.rawName ||

                identity.cleanName ||

                "-"

            ),

        "**Role:** " +

            (

                identity.role ||

                "-"

            ),

        "**Designation:** " +

            (

                identity.designation ||

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

        "## 📍 Live Location",

        "",

        "**Location:** " +

            (

                location.location ||

                "-"

            ),

        "**Latitude:** " +

            (

                location.lat ??

                "-"

            ),

        "**Longitude:** " +

            (

                location.lon ??

                "-"

            ),

        "",

        "## 📡 GPS",

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

        "**Last Seen:** " +

            (

                gps.lastSeen ||

                "-"

            ),

        "",

        "## 🚓 Duty",

        "",

        "**Duty Type:** " +

            (

                assignment.dutyType ||

                "-"

            ),

        "**Status:** " +

            (

                assignment.status ||

                "-"

            ),

        "**Duty Active:** " +

            (

                assignment.dutyActive

                    ? "YES"

                    : "NO"

            )

    ].join(

        "\n"

    );

    result.cards.push({

        type:

            "staff-location",

        title:

            identity.name ||

            identity.rawName ||

            identity.cleanName ||

            "Staff Location",

        data:

            profile

    });

    result.sections.push({

        title:

            "Location",

        data:

            profile

    });

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_LOCATION;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Location formatted.";

    return result;

};
/*=========================================================
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

        !response.data

    ) {

        result.message =

            response?.message ||

            "Duty information not found.";

        return result;

    }

    const profile =

        response.data;

    const identity =

        profile.identity ||

        {};

    const posting =

        profile.posting ||

        {};

    const assignment =

        profile.assignment ||

        {};

    const location =

        profile.location ||

        {};

    const gps =

        profile.gps ||

        {};

    const team =

        profile.teamInfo ||

        {};

    result.markdown = [

        "# 🚓 STAFF DUTY",

        "",

        "**Name:** " +

            (

                identity.name ||

                identity.rawName ||

                identity.cleanName ||

                "-"

            ),

        "**Role:** " +

            (

                identity.role ||

                "-"

            ),

        "**Designation:** " +

            (

                identity.designation ||

                "-"

            ),

        "",

        "## 🌳 Posting",

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

        "## 🚓 Duty Information",

        "",

        "**Duty Type:** " +

            (

                assignment.dutyType ||

                "-"

            ),

        "**Status:** " +

            (

                assignment.status ||

                "-"

            ),

        "**Duty Active:** " +

            (

                assignment.dutyActive

                    ? "YES"

                    : "NO"

            ),

        "**Last Duty End:** " +

            (

                assignment.lastDutyEnd ||

                "-"

            ),

        "",

        "## 👥 Team",

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

        "## 📡 Live GPS",

        "",

        "**Location:** " +

            (

                location.location ||

                "-"

            ),

        "**Latitude:** " +

            (

                location.lat ??

                "-"

            ),

        "**Longitude:** " +

            (

                location.lon ??

                "-"

            ),

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

        "**Last Seen:** " +

            (

                gps.lastSeen ||

                "-"

            )

    ].join(

        "\n"

    );

    result.cards.push({

        type:

            "staff-duty",

        title:

            identity.name ||

            identity.rawName ||

            identity.cleanName ||

            "Staff Duty",

        data:

            profile

    });

    result.sections.push({

        title:

            "Duty",

        data:

            profile

    });

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_DUTY;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Duty formatted.";

    return result;

};

/*=========================================================
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

        !response.data

    ) {

        result.message =

            response?.message ||

            "GPS information not found.";

        return result;

    }

    const profile =

        response.data;

    const identity =

        profile.identity ||

        {};

    const posting =

        profile.posting ||

        {};

    const assignment =

        profile.assignment ||

        {};

    const location =

        profile.location ||

        {};

    const gps =

        profile.gps ||

        {};

    const team =

        profile.teamInfo ||

        {};

    const tracking =

        profile.tracking ||

        {};

    const analytics =

        profile.analytics ||

        {};

    result.markdown = [

        "# 📡 STAFF GPS",

        "",

        "**Name:** " +

            (

                identity.name ||

                identity.rawName ||

                identity.cleanName ||

                "-"

            ),

        "**Role:** " +

            (

                identity.role ||

                "-"

            ),

        "**Designation:** " +

            (

                identity.designation ||

                "-"

            ),

        "",

        "## 📍 Current Location",

        "",

        "**Location:** " +

            (

                location.location ||

                "-"

            ),

        "**Latitude:** " +

            (

                location.lat ??

                "-"

            ),

        "**Longitude:** " +

            (

                location.lon ??

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

                assignment.dutyType ||

                "-"

            ),

        "**Duty Active:** " +

            (

                assignment.dutyActive

                    ? "YES"

                    : "NO"

            ),

        "**Status:** " +

            (

                assignment.status ||

                "-"

            ),

        "",

        "## 🌳 Posting",

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

        "## 👥 Team",

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

        "## 📈 Tracking",

        "",

        "**Session ID:** " +

            (

                tracking.sessionId ||

                "-"

            ),

        "**Source:** " +

            (

                tracking.source ||

                "-"

            ),

        "**Tracking ID:** " +

            (

                tracking.id ||

                "-"

            ),

        "",

        "## 📊 Patrol Analytics",

        "",

        "**Distance:** " +

            (

                analytics.distanceKm ??

                0

            ) +

            " km",

        "**GPS Points:** " +

            (

                analytics.pointCount ??

                0

            ),

        "**Started:** " +

            (

                analytics.startedAt ||

                "-"

            ),

        "**Ended:** " +

            (

                analytics.endedAt ||

                "-"

            )

    ].join(

        "\n"

    );

    result.cards.push({

        type:

            "staff-gps",

        title:

            identity.name ||

            identity.rawName ||

            identity.cleanName ||

            "Staff GPS",

        data:

            profile

    });

    result.sections.push({

        title:

            "GPS",

        data:

            profile

    });

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_GPS;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "GPS formatted.";

    return result;

};
/*=========================================================
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

        !response.data

    ) {

        result.message =

            response?.message ||

            "Team information not found.";

        return result;

    }

    const profile =

        response.data;

    const identity =

        profile.identity ||

        {};

    const posting =

        profile.posting ||

        {};

    const assignment =

        profile.assignment ||

        {};

    const location =

        profile.location ||

        {};

    const gps =

        profile.gps ||

        {};

    const team =

        profile.teamInfo ||

        {};

    const analytics =

        profile.analytics ||

        {};

    result.markdown = [

        "# 👥 STAFF TEAM",

        "",

        "**Name:** " +

            (

                identity.name ||

                identity.rawName ||

                identity.cleanName ||

                "-"

            ),

        "**Role:** " +

            (

                identity.role ||

                "-"

            ),

        "**Designation:** " +

            (

                identity.designation ||

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

        "**Members:** " +

            (

                Array.isArray(

                    team.teamMembers

                )

                    ? team.teamMembers.length

                    : 0

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

        "**Compartment:** " +

            (

                assignment.assignedCompartment ||

                "-"

            ),

        "",

        "## 🚓 Duty",

        "",

        "**Duty Type:** " +

            (

                assignment.dutyType ||

                "-"

            ),

        "**Status:** " +

            (

                assignment.status ||

                "-"

            ),

        "**Duty Active:** " +

            (

                assignment.dutyActive

                    ? "YES"

                    : "NO"

            ),

        "",

        "## 📡 Live GPS",

        "",

        "**Location:** " +

            (

                location.location ||

                "-"

            ),

        "**Latitude:** " +

            (

                location.lat ??

                "-"

            ),

        "**Longitude:** " +

            (

                location.lon ??

                "-"

            ),

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

        "",

        "## 📈 Patrol Statistics",

        "",

        "**Distance:** " +

            (

                analytics.distanceKm ??

                0

            ) +

            " km",

        "**GPS Points:** " +

            (

                analytics.pointCount ??

                0

            ),

        "**Session Started:** " +

            (

                analytics.startedAt ||

                "-"

            ),

        "**Session Ended:** " +

            (

                analytics.endedAt ||

                "-"

            )

    ].join(

        "\n"

    );

    result.cards.push({

        type:

            "staff-team",

        title:

            identity.name ||

            identity.rawName ||

            identity.cleanName ||

            "Staff Team",

        data:

            profile

    });

    result.sections.push({

        title:

            "Team",

        data:

            profile

    });

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_TEAM;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Team formatted.";

    return result;

};
 /*=========================================================
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

};
 /*=========================================================
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

    result.intent =

        StaffConstants.INTENTS.STAFF_ANALYTICS;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Analytics formatted.";

    return result;

};
 /*=========================================================
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
