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

const StaffFormatter =

    GG.StaffFormatter =

    GG.StaffFormatter || {};

/*=========================================================
 VERSION
=========================================================*/

StaffFormatter.VERSION =

    StaffConstants.VERSION;

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
 FORMATTER REGISTRY
=========================================================*/

StaffFormatter.registry =

    new Map();

/*=========================================================
 STATISTICS
=========================================================*/

StaffFormatter.statistics = {

    totalRequests: 0,

    cacheHits: 0,

    formattedResponses: 0,

    formatterErrors: 0,

    lastFormattedAt: null

};

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

                StaffConstants.VERSION,

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

    if (

        StaffFormatter.loaded

    ) {

        return true;

    }

    StaffFormatter.loading =

        true;

    StaffFormatter.cache.clear();

    StaffFormatter.statistics.totalRequests =

        0;

    StaffFormatter.statistics.cacheHits =

        0;

    StaffFormatter.statistics.formattedResponses =

        0;

    StaffFormatter.statistics.formatterErrors =

        0;

    StaffFormatter.statistics.lastFormattedAt =

        null;

    StaffFormatter.loaded =

        true;

    StaffFormatter.loading =

        false;

    return true;

};
StaffFormatter.debugFormatter = function (name, formatter, response) {
    console.group("🎨 " + name);
    console.log("Intent:", response.intent);
    console.log("Input:", response);
    console.time(name);
    
    const result = formatter(response);
    
    console.timeEnd(name);
    console.log("Output:", result);
    console.groupEnd();
    
    return result;
};
 
 /*=========================================================
 FORMAT
=========================================================*/
StaffFormatter.format = function (response) {
    StaffFormatter.statistics.totalRequests++;
    StaffFormatter.statistics.lastFormattedAt = Date.now();
    StaffFormatter.lastRequest = response;

    /*----------------------------------
      Validate
    ----------------------------------*/
    if (!response || typeof response !== "object") {
        const result = StaffFormatter.createResponse();
        result.message = "Invalid formatter response.";
        StaffFormatter.statistics.formatterErrors++;
        StaffFormatter.lastResult = result;
        return result;
    }

    const formatter =

    StaffFormatter.registry.get(

        response.intent

    );

if (

    typeof formatter === "function"

) {

    console.group(

        "🟢 FORMATTER DISPATCH"

    );

    console.log(

        "Intent:",

        response.intent

    );

    console.log(

        "Formatter:",

        formatter.name

    );

    console.log(

        "Response:",

        response

    );

    console.log(

        "Data:",

        response.data

    );

    console.log(

        "Groups:",

        response.data?.length

    );

    console.log(

        "Staff:",

        response.data?.[0]?.staff?.length

    );

    console.groupEnd();

    const result =

        formatter(

            response

        );

    StaffFormatter.statistics.formattedResponses++;

    StaffFormatter.lastResult =

        result;

    return result;

}

    switch (response.intent) {
        /*=================================================
          SEARCH
        =================================================*/
        case StaffConstants.INTENTS.STAFF_DIRECTORY:
            return StaffFormatter.debugFormatter("formatDirectory", StaffFormatter.formatDirectory, response);

        /*=================================================
          PROFILE
        =================================================*/
        case StaffConstants.INTENTS.STAFF_PROFILE:
            return StaffFormatter.debugFormatter("formatProfile", StaffFormatter.formatProfile, response);
        case StaffConstants.INTENTS.STAFF_CONTACT:
            return StaffFormatter.debugFormatter("formatContact", StaffFormatter.formatContact, response);
        case StaffConstants.INTENTS.STAFF_DESIGNATION:
            return StaffFormatter.debugFormatter("formatDesignation", StaffFormatter.formatDesignation, response);
        case StaffConstants.INTENTS.STAFF_ROLE:
            return StaffFormatter.debugFormatter("formatRole", StaffFormatter.formatRole, response);

        /*=================================================
          POSTING
        =================================================*/
        case StaffConstants.INTENTS.STAFF_POSTING:
            return StaffFormatter.debugFormatter("formatPosting", StaffFormatter.formatPosting, response);
        case StaffConstants.INTENTS.STAFF_CIRCLE:
            return StaffFormatter.debugFormatter("formatCircle", StaffFormatter.formatCircle, response);
        case StaffConstants.INTENTS.STAFF_DIVISION:
            return StaffFormatter.debugFormatter("formatDivision", StaffFormatter.formatDivision, response);
        case StaffConstants.INTENTS.STAFF_RANGE:
            return StaffFormatter.debugFormatter("formatRange", StaffFormatter.formatRange, response);
        case StaffConstants.INTENTS.STAFF_BEAT:
            return StaffFormatter.debugFormatter("formatBeat", StaffFormatter.formatBeat, response);

        /*=================================================
          LOCATION
        =================================================*/
        case StaffConstants.INTENTS.STAFF_LOCATION:
            return StaffFormatter.debugFormatter("formatLocation", StaffFormatter.formatLocation, response);

        /*=================================================
          DUTY
        =================================================*/
        case StaffConstants.INTENTS.STAFF_DUTY:
            return StaffFormatter.debugFormatter("formatDuty", StaffFormatter.formatDuty, response);
        case StaffConstants.INTENTS.STAFF_DUTY_STATUS:
            return StaffFormatter.debugFormatter("formatDutyStatus", StaffFormatter.formatDutyStatus, response);
        case StaffConstants.INTENTS.STAFF_DUTY_TYPE:
            return StaffFormatter.debugFormatter("formatDutyType", StaffFormatter.formatDutyType, response);
        case StaffConstants.INTENTS.STAFF_DUTY_STARTED:
            return StaffFormatter.debugFormatter("formatDutyStarted", StaffFormatter.formatDutyStarted, response);
        case StaffConstants.INTENTS.STAFF_DUTY_ENDED:
            return StaffFormatter.debugFormatter("formatDutyEnded", StaffFormatter.formatDutyEnded, response);
        case StaffConstants.INTENTS.STAFF_ASSIGNMENT:
            return StaffFormatter.debugFormatter("formatStaffAssignment", StaffFormatter.formatStaffAssignment, response);

        /*=================================================
          TEAM
        =================================================*/
        case StaffConstants.INTENTS.STAFF_TEAM:
            return StaffFormatter.debugFormatter("formatTeam", StaffFormatter.formatTeam, response);
        case StaffConstants.INTENTS.STAFF_LEADER:
            return StaffFormatter.debugFormatter("formatLeader", StaffFormatter.formatLeader, response);

        /*=================================================
          GPS
        =================================================*/
        case StaffConstants.INTENTS.STAFF_GPS:
            return StaffFormatter.debugFormatter("formatGPS", StaffFormatter.formatGPS, response);

        /*=================================================
          ANALYTICS
        =================================================*/
        case StaffConstants.INTENTS.STAFF_ANALYTICS:
            return StaffFormatter.debugFormatter("formatAnalytics", StaffFormatter.formatAnalytics, response);
        case StaffConstants.INTENTS.STAFF_DISTANCE:
            return StaffFormatter.debugFormatter("formatDistance", StaffFormatter.formatDistance, response);
        case StaffConstants.INTENTS.STAFF_PATROL_POINTS:
            return StaffFormatter.debugFormatter("formatPatrolPoints", StaffFormatter.formatPatrolPoints, response);
        case StaffConstants.INTENTS.STAFF_PATROL_START:
            return StaffFormatter.debugFormatter("formatPatrolStart", StaffFormatter.formatPatrolStart, response);
        case StaffConstants.INTENTS.STAFF_PATROL_END:
            return StaffFormatter.debugFormatter("formatPatrolEnd", StaffFormatter.formatPatrolEnd, response);
        case StaffConstants.INTENTS.STAFF_PATROL_DURATION:
            return StaffFormatter.debugFormatter("formatPatrolDuration", StaffFormatter.formatPatrolDuration, response);

        /*=================================================
          SUMMARY
        =================================================*/
        case StaffConstants.INTENTS.STAFF_SUMMARY:
            return StaffFormatter.debugFormatter("formatStaffSummary", StaffFormatter.formatStaffSummary, response);
        case StaffConstants.INTENTS.STAFF_JURISDICTION_SUMMARY:
            return StaffFormatter.debugFormatter("formatJurisdictionSummary", StaffFormatter.formatJurisdictionSummary, response);
        case StaffConstants.INTENTS.STAFF_DESIGNATION_SUMMARY:
            return StaffFormatter.debugFormatter("formatDesignationSummary", StaffFormatter.formatDesignationSummary, response);
        case StaffConstants.INTENTS.STAFF_CIRCLE_DIRECTORY:
            return StaffFormatter.debugFormatter("formatCircleDirectory", StaffFormatter.formatCircleDirectory, response);
        case StaffConstants.INTENTS.STAFF_DIVISION_DIRECTORY:
            return StaffFormatter.debugFormatter("formatDivisionDirectory", StaffFormatter.formatDivisionDirectory, response);
        case StaffConstants.INTENTS.STAFF_RANGE_DIRECTORY:
            return StaffFormatter.debugFormatter("formatRangeDirectory", StaffFormatter.formatRangeDirectory, response);
        case StaffConstants.INTENTS.STAFF_BEAT_DIRECTORY:
            return StaffFormatter.debugFormatter("formatBeatDirectory", StaffFormatter.formatBeatDirectory, response);
        case StaffConstants.INTENTS.STAFF_DESIGNATION_DIRECTORY:
            return StaffFormatter.debugFormatter("formatDesignationDirectory", StaffFormatter.formatDesignationDirectory, response);

        /*=================================================
          STATUS
        =================================================*/
        case StaffConstants.INTENTS.ACTIVE_STAFF_COUNT:
            return StaffFormatter.debugFormatter("formatActiveStaffCount", StaffFormatter.formatActiveStaffCount, response);
        case StaffConstants.INTENTS.ACTIVE_STAFF_LIST:
            return StaffFormatter.debugFormatter("formatActiveStaffList", StaffFormatter.formatActiveStaffList, response);
        case StaffConstants.INTENTS.INACTIVE_STAFF_LIST:
            return StaffFormatter.debugFormatter("formatInactiveStaffList", StaffFormatter.formatInactiveStaffList, response);
        case StaffConstants.INTENTS.DUTY_SUMMARY:
            return StaffFormatter.debugFormatter("formatDutySummary", StaffFormatter.formatDutySummary, response);
        case StaffConstants.INTENTS.TEAM_LEADER_LIST:
            return StaffFormatter.debugFormatter("formatTeamLeaderList", StaffFormatter.formatTeamLeaderList, response);
        case StaffConstants.INTENTS.MOVING_STAFF:
            return StaffFormatter.debugFormatter("formatMovingStaff", StaffFormatter.formatMovingStaff, response);
        case StaffConstants.INTENTS.STATIONARY_STAFF:
            return StaffFormatter.debugFormatter("formatStationaryStaff", StaffFormatter.formatStationaryStaff, response);

        /*=================================================
          CONTROL ROOM
        =================================================*/
        case StaffConstants.INTENTS.WHO_IS_ON_DUTY:
            return StaffFormatter.debugFormatter("formatWhoIsOnDuty", StaffFormatter.formatWhoIsOnDuty, response);
        case StaffConstants.INTENTS.WHO_IS_PATROLLING:
            return StaffFormatter.debugFormatter("formatWhoIsPatrolling", StaffFormatter.formatWhoIsPatrolling, response);

        /*=================================================
          DEFAULT
        =================================================*/
        default:
        {
            const result = StaffFormatter.createResponse(response);
            result.success = false;
            result.message = "Formatter not available for intent: " + response.intent;
            StaffFormatter.statistics.formatterErrors++;
            StaffFormatter.lastResult = result;
            return result;
        }
    }
};


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

        "**Designation:** " +

            (

                identity.designation ||

                "-"

            ),

        "**Role:** " +

            (

                identity.role ||

                "-"

            ),

        "",

        "## 📞 Contact",

        "",

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

        data: {

            identity:

                identity,

            posting:

                posting

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Profile",

        data: {

            identity:

                identity,

            posting:

                posting

        }

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

        "Staff profile formatted successfully.";

    return result;

};
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

    /*----------------------------------
      Canonical Profile
    ----------------------------------*/

    const profile =

        response.data;

    const identity =

        profile.identity ||

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

        "# 📞 STAFF CONTACT",

        "",

        "**Name:** " +

            displayName,

        "**Designation:** " +

            (

                identity.designation ||

                "-"

            ),

        "**Phone:** " +

            (

                identity.phone ||

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

            "staff-contact",

        title:

            displayName,

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            phone:

                identity.phone ||

                ""

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Contact",

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            phone:

                identity.phone ||

                ""

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

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

        "Contact formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT ROLE
=========================================================*/

StaffFormatter.formatRole = function (

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

            "Role information not found.";

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

        "# 👤 STAFF ROLE",

        "",

        "**Name:** " +

            displayName,

        "**Role:** " +

            (

                identity.role ||

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

            "staff-role",

        title:

            displayName,

        data: {

            name:

                displayName,

            role:

                identity.role ||

                ""

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Role",

        data: {

            name:

                displayName,

            role:

                identity.role ||

                ""

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_ROLE;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Role formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT DESIGNATION
=========================================================*/

StaffFormatter.formatDesignation = function (

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

            "Designation information not found.";

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

        "# 🏷️ STAFF DESIGNATION",

        "",

        "**Name:** " +

            displayName,

        "**Designation:** " +

            (

                identity.designation ||

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

            "staff-designation",

        title:

            displayName,

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                ""

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Designation",

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                ""

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_DESIGNATION;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Designation formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT CIRCLE
=========================================================*/

StaffFormatter.formatCircle = function (

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

            "Circle information not found.";

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

        "# 🌳 STAFF CIRCLE",

        "",

        "**Name:** " +

            displayName,

        "**Designation:** " +

            (

                identity.designation ||

                "-"

            ),

        "**Circle:** " +

            (

                posting.circle ||

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

            "staff-circle",

        title:

            displayName,

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            circle:

                posting.circle ||

                ""

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Circle",

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            circle:

                posting.circle ||

                ""

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_CIRCLE;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Circle formatted successfully.";

    return result;

};/*=========================================================
 FORMAT DIVISION
=========================================================*/

StaffFormatter.formatDivision = function (

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

            "Division information not found.";

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

        "# 🌲 STAFF DIVISION",

        "",

        "**Name:** " +

            displayName,

        "**Designation:** " +

            (

                identity.designation ||

                "-"

            ),

        "**Circle:** " +

            (

                posting.circle ||

                "-"

            ),

        "**Division:** " +

            (

                posting.division ||

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

            "staff-division",

        title:

            displayName,

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            circle:

                posting.circle ||

                "",

            division:

                posting.division ||

                ""

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Division",

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            circle:

                posting.circle ||

                "",

            division:

                posting.division ||

                ""

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_DIVISION;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Division formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT RANGE
=========================================================*/

StaffFormatter.formatRange = function (

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

            "Range information not found.";

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

        "# 🌲 STAFF RANGE",

        "",

        "**Name:** " +

            displayName,

        "**Designation:** " +

            (

                identity.designation ||

                "-"

            ),

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

            )

    ].join(

        "\n"

    );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-range",

        title:

            displayName,

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            circle:

                posting.circle ||

                "",

            division:

                posting.division ||

                "",

            range:

                posting.range ||

                ""

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Range",

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            circle:

                posting.circle ||

                "",

            division:

                posting.division ||

                "",

            range:

                posting.range ||

                ""

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_RANGE;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Range formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT BEAT
=========================================================*/

StaffFormatter.formatBeat = function (

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

            "Beat information not found.";

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

        "# 🌳 STAFF BEAT",

        "",

        "**Name:** " +

            displayName,

        "**Designation:** " +

            (

                identity.designation ||

                "-"

            ),

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

            )

    ].join(

        "\n"

    );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-beat",

        title:

            displayName,

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            circle:

                posting.circle ||

                "",

            division:

                posting.division ||

                "",

            range:

                posting.range ||

                "",

            beat:

                posting.beat ||

                ""

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Beat",

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            circle:

                posting.circle ||

                "",

            division:

                posting.division ||

                "",

            range:

                posting.range ||

                "",

            beat:

                posting.beat ||

                ""

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_BEAT;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Beat formatted successfully.";

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

            "Posting information not found.";

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

        "# 🌳 STAFF POSTING",

        "",

        "**Name:** " +

            displayName,

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

            displayName,

        data: {

            posting:

                posting

        }

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

    /*----------------------------------
      Metadata
    ----------------------------------*/

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

    /*----------------------------------
      Canonical Profile
    ----------------------------------*/

    const profile =

        response.data;

    const identity =

        profile.identity ||

        {};

    const location =

        profile.location ||

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

        "# 📍 STAFF LOCATION",

        "",

        "**Name:** " +

            displayName,

        "**Designation:** " +

            (

                identity.designation ||

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

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-location",

        title:

            displayName,

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            latitude:

                location.lat ??

                null,

            longitude:

                location.lon ??

                null

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Location",

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            latitude:

                location.lat ??

                null,

            longitude:

                location.lon ??

                null

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

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

        "Location formatted successfully.";

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

    /*----------------------------------
      Canonical Profile
    ----------------------------------*/

    const profile =

        response.data;

    const identity =

        profile.identity ||

        {};

    const assignment =

        profile.assignment ||

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

        "# 🚓 STAFF DUTY",

        "",

        "**Name:** " +

            displayName,

        "**Designation:** " +

            (

                identity.designation ||

                "-"

            ),

        "**Duty Status:** " +

            (

                assignment.status ||

                "-"

            ),

        "**Duty Type:** " +

            (

                assignment.dutyType ||

                "-"

            ),

        "**Assignment:** " +

            (

                assignment.assignedCompartment ||

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

            displayName,

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            status:

                assignment.status ||

                "",

            dutyType:

                assignment.dutyType ||

                "",

            assignment:

                assignment.assignedCompartment ||

                ""

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Duty",

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            status:

                assignment.status ||

                "",

            dutyType:

                assignment.dutyType ||

                "",

            assignment:

                assignment.assignedCompartment ||

                ""

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

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

        "Duty formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT DUTY STATUS
=========================================================*/

StaffFormatter.formatDutyStatus = function (

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

            "Duty status not found.";

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

    const assignment =

        profile.assignment ||

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

        "# ✅ DUTY STATUS",

        "",

        "**Name:** " +

            displayName,

        "**Designation:** " +

            (

                identity.designation ||

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

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-duty-status",

        title:

            displayName,

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            status:

                assignment.status ||

                "",

            dutyActive:

                assignment.dutyActive ??

                false

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Duty Status",

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            status:

                assignment.status ||

                "",

            dutyActive:

                assignment.dutyActive ??

                false

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_DUTY_STATUS;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Duty status formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT DUTY TYPE
=========================================================*/

StaffFormatter.formatDutyType = function (

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

            "Duty type not found.";

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

    const assignment =

        profile.assignment ||

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

        "# 🚓 DUTY TYPE",

        "",

        "**Name:** " +

            displayName,

        "**Designation:** " +

            (

                identity.designation ||

                "-"

            ),

        "**Duty Type:** " +

            (

                assignment.dutyType ||

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

            "staff-duty-type",

        title:

            displayName,

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            dutyType:

                assignment.dutyType ||

                ""

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Duty Type",

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            dutyType:

                assignment.dutyType ||

                ""

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_DUTY_TYPE;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Duty type formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT DUTY STARTED
=========================================================*/

StaffFormatter.formatDutyStarted = function (

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

            "Duty start information not found.";

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

    const assignment =

        profile.assignment ||

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
      Human Readable Time
    ----------------------------------*/

    const startedAt =

        assignment.startedAt;

    const startedText =

        startedAt

            ? new Date(

                startedAt

            ).toLocaleString(

                "en-IN",

                {

                    dateStyle:

                        "medium",

                    timeStyle:

                        "short"

                }

            )

            : "-";

    /*----------------------------------
      Markdown
    ----------------------------------*/

    result.markdown = [

        "# 🟢 DUTY STARTED",

        "",

        "**Name:** " +

            displayName,

        "**Designation:** " +

            (

                identity.designation ||

                "-"

            ),

        "**Duty Type:** " +

            (

                assignment.dutyType ||

                "-"

            ),

        "**Started:** " +

            startedText

    ].join(

        "\n"

    );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-duty-started",

        title:

            displayName,

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            dutyType:

                assignment.dutyType ||

                "",

            startedAt:

                startedText

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Duty Started",

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            dutyType:

                assignment.dutyType ||

                "",

            startedAt:

                startedText

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_DUTY_STARTED;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Duty start formatted successfully.";

    return result;

};

 /*=========================================================
 FORMAT DUTY ENDED
=========================================================*/

StaffFormatter.formatDutyEnded = function (

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

            "Duty end information not found.";

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

    const assignment =

        profile.assignment ||

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
      Human Readable Time
    ----------------------------------*/

    const endedAt =

        assignment.endedAt;

    const endedText =

        endedAt

            ? new Date(

                endedAt

            ).toLocaleString(

                "en-IN",

                {

                    dateStyle:

                        "medium",

                    timeStyle:

                        "short"

                }

            )

            : "-";

    /*----------------------------------
      Markdown
    ----------------------------------*/

    result.markdown = [

        "# 🔴 DUTY ENDED",

        "",

        "**Name:** " +

            displayName,

        "**Designation:** " +

            (

                identity.designation ||

                "-"

            ),

        "**Duty Type:** " +

            (

                assignment.dutyType ||

                "-"

            ),

        "**Ended:** " +

            endedText

    ].join(

        "\n"

    );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-duty-ended",

        title:

            displayName,

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            dutyType:

                assignment.dutyType ||

                "",

            endedAt:

                endedText

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Duty Ended",

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            dutyType:

                assignment.dutyType ||

                "",

            endedAt:

                endedText

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_DUTY_ENDED;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Duty end formatted successfully.";

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

    const assignment =

        profile.assignment ||

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
      Assignment
    ----------------------------------*/

    const assignedTo =

        assignment.assignedCompartment ||

        assignment.assignment ||

        "-";

    /*----------------------------------
      Markdown
    ----------------------------------*/

    result.markdown = [

        "# 📋 STAFF ASSIGNMENT",

        "",

        "**Name:** " +

            displayName,

        "**Designation:** " +

            (

                identity.designation ||

                "-"

            ),

        "**Duty Type:** " +

            (

                assignment.dutyType ||

                "-"

            ),

        "**Assigned To:** " +

            assignedTo

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

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            dutyType:

                assignment.dutyType ||

                "",

            assignment:

                assignedTo

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Assignment",

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            dutyType:

                assignment.dutyType ||

                "",

            assignment:

                assignedTo

        }

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

        "Assignment formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT LEADER
=========================================================*/

StaffFormatter.formatLeader = function (

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

            "Leader information not found.";

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

    const teamInfo =

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

        "# 👨‍💼 TEAM LEADER",

        "",

        "**Name:** " +

            displayName,

        "**Designation:** " +

            (

                identity.designation ||

                "-"

            ),

        "**Leader:** " +

            (

                teamInfo.leader ||

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

            "staff-leader",

        title:

            displayName,

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            leader:

                teamInfo.leader ||

                ""

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Leader",

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            leader:

                teamInfo.leader ||

                ""

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_LEADER;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Leader formatted successfully.";

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

    /*----------------------------------
      Canonical Profile
    ----------------------------------*/

    const profile =

        response.data;

    const identity =

        profile.identity ||

        {};

    const teamInfo =

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

        "# 👥 STAFF TEAM",

        "",

        "**Name:** " +

            displayName,

        "**Designation:** " +

            (

                identity.designation ||

                "-"

            ),

        "**Team:** " +

            (

                teamInfo.team ||

                "-"

            ),

        "**Leader:** " +

            (

                teamInfo.leader ||

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

            displayName,

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            team:

                teamInfo.team ||

                "",

            leader:

                teamInfo.leader ||

                ""

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Team",

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            team:

                teamInfo.team ||

                "",

            leader:

                teamInfo.leader ||

                ""

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

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

        "Team formatted successfully.";

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

    /*----------------------------------
      Canonical Profile
    ----------------------------------*/

    const profile =

        response.data;

    const identity =

        profile.identity ||

        {};

    const location =

        profile.location ||

        {};

    const gps =

        profile.gps ||

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
      Human Readable Time
    ----------------------------------*/

    const lastSeen =

        gps.lastSeen ||

        gps.timestamp ||

        gps.updatedAt;

    const lastSeenText =

        lastSeen

            ? new Date(

                lastSeen

            ).toLocaleString(

                "en-IN",

                {

                    dateStyle:

                        "medium",

                    timeStyle:

                        "short"

                }

            )

            : "-";

    /*----------------------------------
      Markdown
    ----------------------------------*/

    result.markdown = [

        "# 📡 STAFF GPS",

        "",

        "**Name:** " +

            displayName,

        "**Designation:** " +

            (

                identity.designation ||

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

        "**Last Seen:** " +

            lastSeenText

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

            displayName,

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            latitude:

                location.lat ??

                null,

            longitude:

                location.lon ??

                null,

            lastSeen:

                lastSeenText

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "GPS",

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            latitude:

                location.lat ??

                null,

            longitude:

                location.lon ??

                null,

            lastSeen:

                lastSeenText

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

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

        "GPS formatted successfully.";

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

        !response.data

    ) {

        result.message =

            response?.message ||

            "Analytics information not found.";

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

        "# 📊 STAFF ANALYTICS",

        "",

        "**Name:** " +

            displayName,

        "**Designation:** " +

            (

                identity.designation ||

                "-"

            ),

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

        "**Duration:** " +

            (

                analytics.duration ||

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

            "staff-analytics",

        title:

            displayName,

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            distanceKm:

                analytics.distanceKm ??

                0,

            pointCount:

                analytics.pointCount ??

                0,

            duration:

                analytics.duration ||

                ""

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Analytics",

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            distanceKm:

                analytics.distanceKm ??

                0,

            pointCount:

                analytics.pointCount ??

                0,

            duration:

                analytics.duration ||

                ""

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

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

        "Analytics formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT DISTANCE
=========================================================*/

StaffFormatter.formatDistance = function (

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

            "Distance information not found.";

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

        "# 📏 DISTANCE COVERED",

        "",

        "**Name:** " +

            displayName,

        "**Designation:** " +

            (

                identity.designation ||

                "-"

            ),

        "**Distance:** " +

            (

                analytics.distanceKm ??

                0

            ) +

            " km"

    ].join(

        "\n"

    );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-distance",

        title:

            displayName,

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            distanceKm:

                analytics.distanceKm ??

                0

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Distance",

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            distanceKm:

                analytics.distanceKm ??

                0

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_DISTANCE;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Distance formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT PATROL POINTS
=========================================================*/

StaffFormatter.formatPatrolPoints = function (

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

            "Patrol point information not found.";

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

        "# 📍 PATROL POINTS",

        "",

        "**Name:** " +

            displayName,

        "**Designation:** " +

            (

                identity.designation ||

                "-"

            ),

        "**Patrol Points:** " +

            (

                analytics.pointCount ??

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

            "staff-patrol-points",

        title:

            displayName,

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            pointCount:

                analytics.pointCount ??

                0

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Patrol Points",

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            pointCount:

                analytics.pointCount ??

                0

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_PATROL_POINTS;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Patrol points formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT PATROL START
=========================================================*/

StaffFormatter.formatPatrolStart = function (

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

            "Patrol start information not found.";

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
      Human Readable Time
    ----------------------------------*/

    const startedAt =

        analytics.startedAt;

    const startedText =

        startedAt

            ? new Date(

                startedAt

            ).toLocaleString(

                "en-IN",

                {

                    dateStyle:

                        "medium",

                    timeStyle:

                        "short"

                }

            )

            : "-";

    /*----------------------------------
      Markdown
    ----------------------------------*/

    result.markdown = [

        "# 🚶 PATROL START",

        "",

        "**Name:** " +

            displayName,

        "**Designation:** " +

            (

                identity.designation ||

                "-"

            ),

        "**Patrol Started:** " +

            startedText

    ].join(

        "\n"

    );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-patrol-start",

        title:

            displayName,

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            startedAt:

                startedText

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Patrol Start",

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            startedAt:

                startedText

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_PATROL_START;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Patrol start formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT PATROL END
=========================================================*/

StaffFormatter.formatPatrolEnd = function (

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

            "Patrol end information not found.";

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
      Human Readable Time
    ----------------------------------*/

    const endedAt =

        analytics.endedAt;

    const endedText =

        endedAt

            ? new Date(

                endedAt

            ).toLocaleString(

                "en-IN",

                {

                    dateStyle:

                        "medium",

                    timeStyle:

                        "short"

                }

            )

            : "-";

    /*----------------------------------
      Markdown
    ----------------------------------*/

    result.markdown = [

        "# 🏁 PATROL END",

        "",

        "**Name:** " +

            displayName,

        "**Designation:** " +

            (

                identity.designation ||

                "-"

            ),

        "**Patrol Ended:** " +

            endedText

    ].join(

        "\n"

    );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-patrol-end",

        title:

            displayName,

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            endedAt:

                endedText

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Patrol End",

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            endedAt:

                endedText

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_PATROL_END;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Patrol end formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT PATROL DURATION
=========================================================*/

StaffFormatter.formatPatrolDuration = function (

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

            "Patrol duration information not found.";

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
      Duration
    ----------------------------------*/

    const duration =

        analytics.duration ||

        "-";

    /*----------------------------------
      Markdown
    ----------------------------------*/

    result.markdown = [

        "# ⏱️ PATROL DURATION",

        "",

        "**Name:** " +

            displayName,

        "**Designation:** " +

            (

                identity.designation ||

                "-"

            ),

        "**Duration:** " +

            duration

    ].join(

        "\n"

    );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-patrol-duration",

        title:

            displayName,

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            duration:

                duration

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Patrol Duration",

        data: {

            name:

                displayName,

            designation:

                identity.designation ||

                "",

            duration:

                duration

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_PATROL_DURATION;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Patrol duration formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT STAFF SUMMARY
=========================================================*/

StaffFormatter.formatStaffSummary = function (

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

            "Staff summary not available.";

        return result;

    }

    /*----------------------------------
      Summary
    ----------------------------------*/

    const summary =

        response.data;

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [

        "# 👥 STAFF SUMMARY",

        "",

        "**Total Staff:** " +

            summary.length,

        ""

    ];

    summary.forEach(

        function (

            staff,

            index

        ) {

            lines.push(

                "## " +

                (

                    index + 1

                ) +

                ". " +

                (

                    staff.name ||

                    "-"

                )

            );

            lines.push(

                "**Designation:** " +

                (

                    staff.designation ||

                    "-"

                )

            );

            lines.push(

                "**Role:** " +

                (

                    staff.role ||

                    "-"

                )

            );

            lines.push(

                "**Duty:** " +

                (

                    staff.dutyType ||

                    "-"

                )

            );

            lines.push(

                "**Status:** " +

                (

                    staff.dutyStatus ||

                    "-"

                )

            );

            lines.push(

                "**Circle:** " +

                (

                    staff.circle ||

                    "-"

                )

            );

            lines.push(

                "**Division:** " +

                (

                    staff.division ||

                    "-"

                )

            );

            lines.push(

                "**Range:** " +

                (

                    staff.range ||

                    "-"

                )

            );

            lines.push(

                "**Beat:** " +

                (

                    staff.beat ||

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
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-summary",

        title:

            "Staff Summary",

        data: {

            total:

                summary.length,

            staff:

                summary

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Staff Summary",

        data: {

            total:

                summary.length,

            staff:

                summary

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_SUMMARY;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Staff summary formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT JURISDICTION SUMMARY
=========================================================*/

StaffFormatter.formatJurisdictionSummary = function (

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

            "Jurisdiction summary not available.";

        return result;

    }

    const summary =

        response.data;

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [

        "# 🌳 JURISDICTION SUMMARY",

        "",

        "**Total Jurisdictions:** " +

            summary.length,

        ""

    ];

    summary.forEach(

        function (

            item,

            index

        ) {

            lines.push(

                "## " +

                (

                    index + 1

                )

            );

            lines.push(

                "**Circle:** " +

                (

                    item.circle ||

                    "-"

                )

            );

            lines.push(

                "**Division:** " +

                (

                    item.division ||

                    "-"

                )

            );

            lines.push(

                "**Range:** " +

                (

                    item.range ||

                    "-"

                )

            );

            lines.push(

                "**Beat:** " +

                (

                    item.beat ||

                    "-"

                )

            );

            lines.push(

                "**Total Staff:** " +

                (

                    item.totalStaff ??

                    0

                )

            );

            lines.push(

                "**Active Staff:** " +

                (

                    item.activeStaff ??

                    0

                )

            );

            lines.push(

                "**Inactive Staff:** " +

                (

                    item.inactiveStaff ??

                    0

                )

            );

            lines.push(

                "**Moving Staff:** " +

                (

                    item.movingStaff ??

                    0

                )

            );

            lines.push(

                "**Stationary Staff:** " +

                (

                    item.stationaryStaff ??

                    0

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
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "jurisdiction-summary",

        title:

            "Jurisdiction Summary",

        data: {

            total:

                summary.length,

            jurisdictions:

                summary

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Jurisdiction Summary",

        data: {

            total:

                summary.length,

            jurisdictions:

                summary

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_JURISDICTION_SUMMARY;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Jurisdiction summary formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT DESIGNATION SUMMARY
=========================================================*/

StaffFormatter.formatDesignationSummary = function (

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

            "Designation summary not available.";

        return result;

    }

    const summary =

        response.data;

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [

        "# 👥 DESIGNATION SUMMARY",

        "",

        "**Total Designations:** " +

            summary.length,

        ""

    ];

    summary.forEach(

        function (

            item,

            index

        ) {

            lines.push(

                "## " +

                (

                    index + 1

                ) +

                ". " +

                (

                    item.designation ||

                    "-"

                )

            );

            lines.push(

                "**Total Staff:** " +

                (

                    item.totalStaff ??

                    0

                )

            );

            lines.push(

                "**Active Staff:** " +

                (

                    item.activeStaff ??

                    0

                )

            );

            lines.push(

                "**Inactive Staff:** " +

                (

                    item.inactiveStaff ??

                    0

                )

            );

            lines.push(

                "**Moving Staff:** " +

                (

                    item.movingStaff ??

                    0

                )

            );

            lines.push(

                "**Stationary Staff:** " +

                (

                    item.stationaryStaff ??

                    0

                )

            );

            lines.push(

                "**Distance Covered:** " +

                (

                    item.totalDistanceKm ??

                    0

                ) +

                " km"

            );

            lines.push(

                "**Patrol Points:** " +

                (

                    item.totalPatrolPoints ??

                    0

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
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "designation-summary",

        title:

            "Designation Summary",

        data: {

            total:

                summary.length,

            designations:

                summary

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Designation Summary",

        data: {

            total:

                summary.length,

            designations:

                summary

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_DESIGNATION_SUMMARY;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Designation summary formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT CIRCLE DIRECTORY
=========================================================*/

StaffFormatter.formatCircleDirectory = function (

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

            "Circle directory not available.";

        return result;

    }

    const directory =

        response.data;

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [

        "# 🌳 CIRCLE DIRECTORY",

        "",

        "**Total Circles:** " +

            directory.length,

        ""

    ];

    directory.forEach(

        function (

            group,

            index

        ) {

            lines.push(

                "## " +

                (

                    index + 1

                ) +

                ". " +

                (

                    group.circle ||

                    "UNASSIGNED"

                )

            );

            lines.push(

                "**Staff Count:** " +

                (

                    group.totalStaff ||

                    0

                )

            );

            lines.push("");

            (

                group.staff ||

                []

            ).forEach(

                function (

                    staff

                ) {

                    lines.push(

                        "- **" +

                        (

                            staff.name ||

                            "-"

                        ) +

                        "** (" +

                        (

                            staff.designation ||

                            "-"

                        ) +

                        ")"

                    );

                }

            );

            lines.push("");

        }

    );

    result.markdown =

        lines.join(

            "\n"

        );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "circle-directory",

        title:

            "Circle Directory",

        data: {

            total:

                directory.length,

            circles:

                directory

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Circle Directory",

        data: {

            total:

                directory.length,

            circles:

                directory

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_CIRCLE_DIRECTORY;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Circle directory formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT DIVISION DIRECTORY
=========================================================*/

StaffFormatter.formatDivisionDirectory = function (

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

            "Division directory not available.";

        return result;

    }

    const directory =

        response.data;

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [

        "# 🌲 DIVISION DIRECTORY",

        "",

        "**Total Divisions:** " +

            directory.length,

        ""

    ];

    directory.forEach(

        function (

            group,

            index

        ) {

            lines.push(

                "## " +

                (

                    index + 1

                ) +

                ". " +

                (

                    group.division ||

                    "UNASSIGNED"

                )

            );

            lines.push(

                "**Staff Count:** " +

                (

                    group.totalStaff ||

                    0

                )

            );

            lines.push("");

            (

                group.staff ||

                []

            ).forEach(

                function (

                    staff

                ) {

                    lines.push(

                        "- **" +

                        (

                            staff.name ||

                            "-"

                        ) +

                        "** (" +

                        (

                            staff.designation ||

                            "-"

                        ) +

                        ")"

                    );

                }

            );

            lines.push("");

        }

    );

    result.markdown =

        lines.join(

            "\n"

        );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "division-directory",

        title:

            "Division Directory",

        data: {

            total:

                directory.length,

            divisions:

                directory

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Division Directory",

        data: {

            total:

                directory.length,

            divisions:

                directory

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_DIVISION_DIRECTORY;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Division directory formatted successfully.";

    return result;

};

 /*=========================================================
 FORMAT RANGE DIRECTORY
=========================================================*/

StaffFormatter.formatRangeDirectory = function (

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

            "Range directory not available.";

        return result;

    }

    const directory =

        response.data;

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [

        "# 🌲 RANGE DIRECTORY",

        "",

        "**Total Ranges:** " +

            directory.length,

        ""

    ];

    directory.forEach(

        function (

            group,

            index

        ) {

            lines.push(

                "## " +

                (

                    index + 1

                ) +

                ". " +

                (

                    group.range ||

                    "UNASSIGNED"

                )

            );

            lines.push(

                "**Staff Count:** " +

                (

                    group.totalStaff ||

                    0

                )

            );

            lines.push("");

            (

                group.staff ||

                []

            ).forEach(

                function (

                    staff

                ) {

                    lines.push(

                        "- **" +

                        (

                            staff.name ||

                            "-"

                        ) +

                        "** (" +

                        (

                            staff.designation ||

                            "-"

                        ) +

                        ")"

                    );

                }

            );

            lines.push("");

        }

    );

    result.markdown =

        lines.join(

            "\n"

        );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "range-directory",

        title:

            "Range Directory",

        data: {

            total:

                directory.length,

            ranges:

                directory

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Range Directory",

        data: {

            total:

                directory.length,

            ranges:

                directory

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_RANGE_DIRECTORY;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Range directory formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT BEAT DIRECTORY
=========================================================*/

StaffFormatter.formatBeatDirectory = function (

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

            "Beat directory not available.";

        return result;

    }

    const directory =

        response.data;

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [

        "# 🌿 BEAT DIRECTORY",

        "",

        "**Total Beats:** " +

            directory.length,

        ""

    ];

    directory.forEach(

        function (

            group,

            index

        ) {

            lines.push(

                "## " +

                (

                    index + 1

                ) +

                ". " +

                (

                    group.beat ||

                    "UNASSIGNED"

                )

            );

            lines.push(

                "**Staff Count:** " +

                (

                    group.totalStaff ||

                    0

                )

            );

            lines.push("");

            (

                group.staff ||

                []

            ).forEach(

                function (

                    staff

                ) {

                    lines.push(

                        "- **" +

                        (

                            staff.name ||

                            "-"

                        ) +

                        "** (" +

                        (

                            staff.designation ||

                            "-"

                        ) +

                        ")"

                    );

                }

            );

            lines.push("");

        }

    );

    result.markdown =

        lines.join(

            "\n"

        );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "beat-directory",

        title:

            "Beat Directory",

        data: {

            total:

                directory.length,

            beats:

                directory

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Beat Directory",

        data: {

            total:

                directory.length,

            beats:

                directory

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_BEAT_DIRECTORY;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Beat directory formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT DESIGNATION DIRECTORY
=========================================================*/

StaffFormatter.formatDesignationDirectory = function (

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

            "Designation directory not available.";

        return result;

    }

    /*----------------------------------
      Directory
    ----------------------------------*/

    const directory =

        response.data;

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [

        "# 👤 DESIGNATION DIRECTORY",

        "",

        "**Total Designations:** " +

            directory.length,

        ""

    ];

    directory.forEach(

        function (

            group,

            index

        ) {

            if (

                !group ||

                typeof group !== "object"

            ) {

                return;

            }

            const designation =

                String(

                    group.designation ||

                    "UNASSIGNED"

                );

            const staffList =

                Array.isArray(

                    group.staff

                )

                    ?

                    group.staff

                    :

                    [];

            lines.push(

                "## " +

                (

                    index + 1

                ) +

                ". " +

                designation

            );

            lines.push(

                "**Staff Count:** " +

                staffList.length

            );

            lines.push(

                ""

            );

            staffList.forEach(

                function (

                    staff,

                    staffIndex

                ) {

                    if (

                        !staff ||

                        typeof staff !== "object"

                    ) {

                        return;

                    }

                    const name =

                        staff.cleanName ||

                        staff.name ||

                        "-";

                    const role =

                        staff.role ||

                        "-";

                    const range =

                        staff.range ||

                        "-";

                    const beat =

                        staff.beat ||

                        "-";

                    lines.push(

                        (

                            staffIndex + 1

                        ) +

                        ". **" +

                        name +

                        "**"

                    );

                    lines.push(

                        "   • Role : " +

                        role

                    );

                    lines.push(

                        "   • Range : " +

                        range

                    );

                    lines.push(

                        "   • Beat : " +

                        beat

                    );

                    lines.push(

                        ""

                    );

                }

            );

            if (

                index <

                directory.length - 1

            ) {

                lines.push(

                    "---"

                );

                lines.push(

                    ""

                );

            }

        }

    );

    result.markdown =

        lines.join(

            "\n"

        );

    /*----------------------------------
      Cards
    ----------------------------------*/

    result.cards.push({

        type:

            "designation-directory",

        title:

            "Designation Directory",

        data: {

            total:

                directory.length,

            designations:

                directory

        }

    });

    /*----------------------------------
      Sections
    ----------------------------------*/

    result.sections.push({

        title:

            "Designation Directory",

        data: {

            total:

                directory.length,

            designations:

                directory

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_DESIGNATION_DIRECTORY;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Designation directory formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT ACTIVE STAFF COUNT
=========================================================*/

StaffFormatter.formatActiveStaffCount = function (

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

            "Active staff count not available.";

        return result;

    }

    const count =

        response.data.count ??

        0;

    /*----------------------------------
      Markdown
    ----------------------------------*/

    result.markdown = [

        "# 🟢 ACTIVE STAFF",

        "",

        "**Active Staff Count:** " +

            count

    ].join(

        "\n"

    );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "active-staff-count",

        title:

            "Active Staff",

        data: {

            count:

                count

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Active Staff",

        data: {

            count:

                count

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.ACTIVE_STAFF_COUNT;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Active staff count formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT ACTIVE STAFF LIST
=========================================================*/

StaffFormatter.formatActiveStaffList = function (

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

            "Active staff list not available.";

        return result;

    }

    const staff =

        response.data.staff ||

        [];

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [

        "# 🟢 ACTIVE STAFF LIST",

        "",

        "**Total Active Staff:** " +

            (

                response.data.count ??

                staff.length

            ),

        ""

    ];

    staff.forEach(

        function (

            profile,

            index

        ) {

            lines.push(

                "## " +

                (

                    index + 1

                ) +

                ". " +

                (

                    profile.identity?.name ||

                    "-"

                )

            );

            lines.push(

                "**Designation:** " +

                (

                    profile.identity?.designation ||

                    "-"

                )

            );

            lines.push(

                "**Duty:** " +

                (

                    profile.assignment?.dutyType ||

                    "-"

                )

            );

            lines.push(

                "**Beat:** " +

                (

                    profile.posting?.beat ||

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
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "active-staff-list",

        title:

            "Active Staff",

        data: {

            count:

                response.data.count ??

                staff.length,

            staff:

                staff

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Active Staff",

        data: {

            count:

                response.data.count ??

                staff.length,

            staff:

                staff

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.ACTIVE_STAFF_LIST;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Active staff list formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT INACTIVE STAFF LIST
=========================================================*/

StaffFormatter.formatInactiveStaffList = function (

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

            "Inactive staff list not available.";

        return result;

    }

    const staff =

        response.data.staff ||

        [];

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [

        "# ⚪ INACTIVE STAFF LIST",

        "",

        "**Total Inactive Staff:** " +

            (

                response.data.count ??

                staff.length

            ),

        ""

    ];

    staff.forEach(

        function (

            profile,

            index

        ) {

            lines.push(

                "## " +

                (

                    index + 1

                ) +

                ". " +

                (

                    profile.identity?.name ||

                    "-"

                )

            );

            lines.push(

                "**Designation:** " +

                (

                    profile.identity?.designation ||

                    "-"

                )

            );

            lines.push(

                "**Last Duty:** " +

                (

                    profile.assignment?.lastDutyEnd ||

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
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "inactive-staff-list",

        title:

            "Inactive Staff",

        data: {

            count:

                response.data.count ??

                staff.length,

            staff:

                staff

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Inactive Staff",

        data: {

            count:

                response.data.count ??

                staff.length,

            staff:

                staff

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.INACTIVE_STAFF_LIST;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Inactive staff list formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT DUTY SUMMARY
=========================================================*/

StaffFormatter.formatDutySummary = function (

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

            "Duty summary not available.";

        return result;

    }

    const summary =

        response.data;

    /*----------------------------------
      Markdown
    ----------------------------------*/

    result.markdown = [

        "# 🚓 DUTY SUMMARY",

        "",

        "**Total Staff:** " +

            (

                summary.total ??

                0

            ),

        "**Active Staff:** " +

            (

                summary.active ??

                0

            ),

        "**Inactive Staff:** " +

            (

                summary.inactive ??

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

            "duty-summary",

        title:

            "Duty Summary",

        data: {

            total:

                summary.total ??

                0,

            active:

                summary.active ??

                0,

            inactive:

                summary.inactive ??

                0

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Duty Summary",

        data: {

            total:

                summary.total ??

                0,

            active:

                summary.active ??

                0,

            inactive:

                summary.inactive ??

                0

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.DUTY_SUMMARY;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Duty summary formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT MOVING STAFF
=========================================================*/

StaffFormatter.formatMovingStaff = function (

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

            "Moving staff not available.";

        return result;

    }

    const staff =

        response.data.staff ||

        [];

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [

        "# 🚶 MOVING STAFF",

        "",

        "**Total Moving Staff:** " +

            (

                response.data.count ??

                staff.length

            ),

        ""

    ];

    staff.forEach(

        function (

            profile,

            index

        ) {

            lines.push(

                "## " +

                (

                    index + 1

                ) +

                ". " +

                (

                    profile.identity?.name ||

                    "-"

                )

            );

            lines.push(

                "**Designation:** " +

                (

                    profile.identity?.designation ||

                    "-"

                )

            );

            lines.push(

                "**Speed:** " +

                (

                    profile.gps?.speed ??

                    0

                ) +

                " km/h"

            );

            lines.push(

                "**Duty:** " +

                (

                    profile.assignment?.dutyType ||

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
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "moving-staff",

        title:

            "Moving Staff",

        data: {

            count:

                response.data.count ??

                staff.length,

            staff:

                staff

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Moving Staff",

        data: {

            count:

                response.data.count ??

                staff.length,

            staff:

                staff

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.MOVING_STAFF;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Moving staff formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT STATIONARY STAFF
=========================================================*/

StaffFormatter.formatStationaryStaff = function (

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

            "Stationary staff not available.";

        return result;

    }

    const staff =

        response.data.staff ||

        [];

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [

        "# 🛑 STATIONARY STAFF",

        "",

        "**Total Stationary Staff:** " +

            (

                response.data.count ??

                staff.length

            ),

        ""

    ];

    staff.forEach(

        function (

            profile,

            index

        ) {

            lines.push(

                "## " +

                (

                    index + 1

                ) +

                ". " +

                (

                    profile.identity?.name ||

                    "-"

                )

            );

            lines.push(

                "**Designation:** " +

                (

                    profile.identity?.designation ||

                    "-"

                )

            );

            lines.push(

                "**Speed:** " +

                (

                    profile.gps?.speed ??

                    0

                ) +

                " km/h"

            );

            lines.push(

                "**Duty:** " +

                (

                    profile.assignment?.dutyType ||

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
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "stationary-staff",

        title:

            "Stationary Staff",

        data: {

            count:

                response.data.count ??

                staff.length,

            staff:

                staff

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Stationary Staff",

        data: {

            count:

                response.data.count ??

                staff.length,

            staff:

                staff

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STATIONARY_STAFF;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Stationary staff formatted successfully.";

    return result;

};
 /*=========================================================
 FORMAT WHO IS ON DUTY
=========================================================*/

StaffFormatter.formatWhoIsOnDuty = function (

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

            "No staff currently on duty.";

        return result;

    }

    const staff =

        response.data.staff ||

        [];

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [

        "# 🚓 WHO IS ON DUTY",

        "",

        "**Total Staff On Duty:** " +

            (

                response.data.count ??

                staff.length

            ),

        ""

    ];

    staff.forEach(

        function (

            profile,

            index

        ) {

            lines.push(

                "## " +

                (

                    index + 1

                ) +

                ". " +

                (

                    profile.identity?.name ||

                    "-"

                )

            );

            lines.push(

                "**Designation:** " +

                (

                    profile.identity?.designation ||

                    "-"

                )

            );

            lines.push(

                "**Duty Type:** " +

                (

                    profile.assignment?.dutyType ||

                    "-"

                )

            );

            lines.push(

                "**Beat:** " +

                (

                    profile.posting?.beat ||

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
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "who-is-on-duty",

        title:

            "Who Is On Duty",

        data: {

            count:

                response.data.count ??

                staff.length,

            staff:

                staff

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Who Is On Duty",

        data: {

            count:

                response.data.count ??

                staff.length,

            staff:

                staff

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.WHO_IS_ON_DUTY;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Who is on duty formatted successfully.";

    return result;

};/*=========================================================
 FORMAT WHO IS PATROLLING
=========================================================*/

StaffFormatter.formatWhoIsPatrolling = function (

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

            "No staff currently patrolling.";

        return result;

    }

    const staff =

        response.data.staff ||

        [];

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [

        "# 🚶 WHO IS PATROLLING",

        "",

        "**Total Patrolling Staff:** " +

            (

                response.data.count ??

                staff.length

            ),

        ""

    ];

    staff.forEach(

        function (

            profile,

            index

        ) {

            lines.push(

                "## " +

                (

                    index + 1

                ) +

                ". " +

                (

                    profile.identity?.name ||

                    "-"

                )

            );

            lines.push(

                "**Designation:** " +

                (

                    profile.identity?.designation ||

                    "-"

                )

            );

            lines.push(

                "**Duty Type:** " +

                (

                    profile.assignment?.dutyType ||

                    "-"

                )

            );

            lines.push(

                "**Beat:** " +

                (

                    profile.posting?.beat ||

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
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "who-is-patrolling",

        title:

            "Who Is Patrolling",

        data: {

            count:

                response.data.count ??

                staff.length,

            staff:

                staff

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Who Is Patrolling",

        data: {

            count:

                response.data.count ??

                staff.length,

            staff:

                staff

        }

    });

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.WHO_IS_PATROLLING;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Who is patrolling formatted successfully.";

    return result;

};
 /*=========================================================
 MODULE INFORMATION
=========================================================*/

/*----------------------------------
  Status
----------------------------------*/

StaffFormatter.getStatus = function () {

    return {

        loaded:

            StaffFormatter.loaded,

        loading:

            StaffFormatter.loading,

        version:

            StaffFormatter.VERSION,

        formatterCount:

            Object.keys(

                StaffFormatter

            ).filter(

                function (

                    key

                ) {

                    return (

                        typeof StaffFormatter[

                            key

                        ] ===

                        "function" &&

                        key.startsWith(

                            "format"

                        )

                    );

                }

            ).length

    };

};

/*----------------------------------
  Reset
----------------------------------*/

StaffFormatter.reset = function () {

    StaffFormatter.loaded =

        false;

    StaffFormatter.loading =

        false;

    return StaffFormatter.initialize();

};

/*=========================================================
 AUTO INITIALIZATION
=========================================================*/

StaffFormatter.initialize();

/*=========================================================
 EXPORT
=========================================================*/

GG.StaffFormatter =

    StaffFormatter;

/*=========================================================
 MODULE LOADED
=========================================================*/

console.log(

    "✅ StaffFormatter Loaded",

    StaffFormatter.VERSION

);

})(

    window

);
