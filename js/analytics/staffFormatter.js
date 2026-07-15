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

        /*----------------------------------
          Status
        ----------------------------------*/

        success:

            false,

        source:

            request.source ||

            "LOCAL",

        module:

            "StaffFormatter",

        /*----------------------------------
          Canonical Request
        ----------------------------------*/

        request:

            request.request ||

            request,

        intent:

            request.intent ||

            "",

        domain:

            request.domain ||

            "",

        confidence:

            Number(

                request.confidence ||

                0

            ),

        entities:

            request.entities ||

            {},

        parameters:

            request.parameters ||

            {},

        context:

            request.context ||

            {},

        /*----------------------------------
          Data
        ----------------------------------*/

        data:

            request.data ||

            null,

        raw:

            request.raw ||

            null,

        /*----------------------------------
          Output
        ----------------------------------*/

        title:

            "",

        message:

            "",

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

        /*----------------------------------
          Diagnostics
        ----------------------------------*/

        formatter:

            "",

        metadata: {

            version:

                StaffConstants.VERSION,

            createdAt:

                Date.now(),

            executionTime:

                0,

            cache:

                request.metadata?.cache ||

                false

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
StaffFormatter.formatStaffNearby = function (
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
            "Nearby staff not found.";
        return result;
    }

    /*----------------------------------
      Data
    ----------------------------------*/

    const data =
        response.data;

    const reference =
        data.reference ||
        {};

    const nearby =
        Array.isArray(
            data.staff
        )
            ? data.staff
            : [];

    const identity =
        reference.identity ||
        {};

    const spatial =
        reference.spatial ||
        {};

    const displayName =
        identity.name ||
        identity.cleanName ||
        "-";

    /*----------------------------------
      Query Based Intro
    ----------------------------------*/
    const query =
        String(
            response.request?.query ||
            response.request?.normalizedQuery ||
            ""
        )
            .toUpperCase();

    const parameters =
        response.request?.parameters ||
        {};
    const referenceType =
        parameters.reference ||
        "";
    const isSingle =
        parameters.isSingle === true;

    /*----------------------------------
      Dynamic Intro
    ----------------------------------*/
    let intro =
        "Nearby staff around " +
        displayName +
        ".";

    /*----------------------------------
      Reference Staff
    ----------------------------------*/
    if (
        isSingle
    ) {
        if (
            query.includes(
                "NEAREST"
            ) ||
            query.includes(
                "CLOSEST"
            )
        ) {
            intro =
                "The closest staff to " +
                displayName +
                " are:";
        } else if (
            query.includes(
                "AROUND"
            )
        ) {
            intro =
                "The following staff are operating around " +
                displayName +
                ":";
        } else if (
            query.includes(
                "WHO IS NEAR"
            )
        ) {
            intro =
                "The following staff are near " +
                displayName +
                ":";
        } else {
            intro =
                "Nearby staff around " +
                displayName +
                ":";
        }
    }

    /*----------------------------------
      Logged-in User
    ----------------------------------*/
    else if (
        referenceType ===
        "SELF"
    ) {
        if (
            query.includes(
                "NEAREST"
            ) ||
            query.includes(
                "CLOSEST"
            )
        ) {
            intro =
                "The closest staff to your current location are:";
        } else {
            intro =
                "The following staff are operating near your current location:";
        }
    }

    /*----------------------------------
      Generic Nearby
    ----------------------------------*/
    else {
        if (
            query.includes(
                "NEAREST"
            ) ||
            query.includes(
                "CLOSEST"
            )
        ) {
            intro =
                "These are the closest available staff members:";
        } else {
            intro =
                "Nearby staff based on the current live GPS positions:";
        }
    }

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const md = [];

    md.push(
        "# 👥 NEARBY STAFF"
    );

    md.push("");

    md.push(
        intro
    );

    md.push("");

    if (
        spatial.valid ||
        spatial.compartment ||
        spatial.beat ||
        spatial.range ||
        spatial.division
    ) {
        md.push(
            "**Current Position**"
        );
        md.push("");
        if (
            spatial.compartment
        ) {
            md.push(
                "• " +
                spatial.compartment
            );
        }
        if (
            spatial.beat
        ) {
            md.push(
                "• " +
                spatial.beat
            );
        }
        if (
            spatial.range
        ) {
            md.push(
                "• " +
                spatial.range
            );
        }
        if (
            spatial.division
        ) {
            md.push(
                "• " +
                spatial.division
            );
        }
        md.push("");
    }

    md.push(
        nearby.length === 1
            ? "**1 staff member is nearby.**"
            : "**" +
            nearby.length +
            " staff members are nearby.**"
    );

    md.push("");

    if (
        nearby.length === 0
    ) {
        md.push(
            "_No nearby staff found._"
        );
    } else {
        nearby.forEach(
            function (
                item,
                index
            ) {
                const profile =
                    item.profile ||
                    {};
                const identity =
                    profile.identity ||
                    {};
                const spatial =
                    profile.spatial ||
                    {};
                const distanceText =
                    item.distanceKm < 1
                        ?
                        Math.round(
                            item.distanceKm *
                            1000
                        ) +
                        " m"
                        :
                        item.distanceKm.toFixed(
                            2
                        ) +
                        " km";
                
                const rangeText = spatial.range || "-";
                const beatText = spatial.beat || "-";

                md.push(
                    "## " +
                    (
                        index +
                        1
                    ) +
                    ". " +
                    (
                        identity.name ||
                        identity.cleanName ||
                        "-"
                    ) +
                    " (" +
                    (
                        identity.designation ||
                        "-"
                    ) +
                    ")"
                );
                md.push("");
                md.push(
                    "• Distance : " +
                    distanceText
                );
                md.push(
                    "• " +
                    rangeText
                );
                md.push(
                    "• " +
                    beatText
                );
                md.push(
                    "• " +
                    (
                        spatial.compartment ||
                        "-"
                    )
                );
                md.push("");
            }
        );
    }

    result.markdown =
        md.join(
            "\n"
        );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({
        type:
            "staff-nearby",
        title:
            displayName,
        data: {
            reference:
                reference,
            nearby:
                nearby,
            count:
                nearby.length
        }
    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({
        title:
            "Nearby Staff",
        data: {
            reference:
                reference,
            nearby:
                nearby,
            count:
                nearby.length
        }
    });

    /*----------------------------------
      Response
    ----------------------------------*/

    result.data =
        data;
    result.success =
        true;
    result.intent =
        StaffConstants.INTENTS.STAFF_NEARBY;
    result.source =
        response.source ||
        "LOCAL";
    result.confidence =
        response.confidence ||
        1;
    result.message =
        "Nearby staff formatted successfully.";

    return result;
};
 /*=========================================================
  CIRCLE COUNT
=========================================================*/


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
  DIRECTORIES
=================================================*/

case StaffConstants.INTENTS.STAFF_DIRECTORY:
case StaffConstants.INTENTS.STAFF_CIRCLE_DIRECTORY:
case StaffConstants.INTENTS.STAFF_DIVISION_DIRECTORY:
case StaffConstants.INTENTS.STAFF_RANGE_DIRECTORY:
case StaffConstants.INTENTS.STAFF_BEAT_DIRECTORY:
case StaffConstants.INTENTS.STAFF_ACTIVE_LIST:
case StaffConstants.INTENTS.STAFF_INACTIVE_LIST:
case StaffConstants.INTENTS.STAFF_MOVING:
case StaffConstants.INTENTS.STAFF_STATIONARY:
case StaffConstants.INTENTS.STAFF_TEAM_LEADER_LIST:

    return StaffFormatter.debugFormatter(

        "formatDirectory",

        StaffFormatter.formatDirectory,

        response

    );

case StaffConstants.INTENTS.STAFF_DESIGNATION_DIRECTORY:

    return StaffFormatter.debugFormatter(

        "formatDesignationDirectory",

        StaffFormatter.formatDesignationDirectory,

        response

    );
case StaffConstants.INTENTS.STAFF_CIRCLE_COUNT:

    return StaffFormatter.debugFormatter(

        "formatCircleCount",

        StaffFormatter.formatCircleCount,

        response

    );
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
case StaffConstants.INTENTS.STAFF_NEARBY:
    return StaffFormatter.debugFormatter(

        "formatStaffNearby",

        StaffFormatter.formatStaffNearby,

        response

    );
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
case StaffConstants.INTENTS.STAFF_JURISDICTION_SUMMARY:
case StaffConstants.INTENTS.STAFF_DESIGNATION_SUMMARY:

    return StaffFormatter.debugFormatter(

        "formatSummary",

        StaffFormatter.formatSummary,

        response

    );
        /*=================================================
          COUNTS
        =================================================*/
        case StaffConstants.INTENTS.STAFF_COUNT:
        case StaffConstants.INTENTS.STAFF_CIRCLE_COUNT:
        case StaffConstants.INTENTS.STAFF_DIVISION_COUNT:
        case StaffConstants.INTENTS.STAFF_RANGE_COUNT:
        case StaffConstants.INTENTS.STAFF_BEAT_COUNT:
        case StaffConstants.INTENTS.STAFF_DESIGNATION_COUNT:
            return StaffFormatter.debugFormatter(
                "formatCount",
                StaffFormatter.formatCount,
                response
            );

        /*=================================================
          STATUS
        =================================================*/
        case StaffConstants.INTENTS.ACTIVE_STAFF_COUNT:
case StaffConstants.INTENTS.STAFF_COUNT:

    return StaffFormatter.debugFormatter(

        "formatCount",

        StaffFormatter.formatCount,

        response

    );
case StaffConstants.INTENTS.DUTY_SUMMARY:

    return StaffFormatter.debugFormatter(

        "formatSummary",

        StaffFormatter.formatSummary,

        response

    );

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
StaffFormatter.formatSummary = function (

    response

) {

    const result =

        StaffFormatter.createResponse(

            response

        );

    const data =

        response.data ||

        {};

    const totalStaff =

        Number(

            data.totalStaff ??

            data.count ??

            0

        );

    const activeStaff =

        Number(

            data.activeStaff ??

            0

        );

    const inactiveStaff =

        Number(

            data.inactiveStaff ??

            0

        );

    const movingStaff =

        Number(

            data.movingStaff ??

            0

        );

    const stationaryStaff =

        Number(

            data.stationaryStaff ??

            0

        );

    const distanceKm =

        Number(

            data.totalDistanceKm ??

            0

        );

    const patrolPoints =

        Number(

            data.totalPatrolPoints ??

            0

        );

    result.success =

        true;

    result.title =

        "Staff Summary";

    result.message =
`# 👥 STAFF SUMMARY

**Total Staff:** ${totalStaff}

• Active Staff : ${activeStaff}

• Inactive Staff : ${inactiveStaff}

• Moving Staff : ${movingStaff}

• Stationary Staff : ${stationaryStaff}

• Distance : ${distanceKm.toFixed(2)} km

• Patrol Points : ${patrolPoints}`;

    result.data =

        data;

    return result;

};
StaffFormatter.formatCount = function (

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

            "Count not available.";

        return result;

    }

    /*----------------------------------
      Aggregate Data
    ----------------------------------*/

    const data =

        Array.isArray(

            response.data

        )

            ?

            (

                response.data[0] ||

                {}

            )

            :

            response.data;

    const count =

        Number(

            data.count ??

            data.totalStaff ??

            0

        );

    const active =

        Number(

            data.activeStaff ??

            0

        );

    const inactive =

        Number(

            data.inactiveStaff ??

            0

        );

    const moving =

        Number(

            data.movingStaff ??

            0

        );

    const stationary =

        Number(

            data.stationaryStaff ??

            0

        );

    const circle =

        data.circle ||

        "";

    const division =

        data.division ||

        "";

    const range =

        data.range ||

        "";

    const beat =

        data.beat ||

        "";

    const compartment =

        data.compartment ||

        "";

    const jurisdiction =

        compartment ||

        beat ||

        range ||

        division ||

        circle ||

        "All Jurisdictions";

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [

        "# 👥 STAFF COUNT",

        "",

        "**Jurisdiction:** " +

            jurisdiction,

        "",

        "**Total Staff:** " +

            count

    ];

    if (

        active ||

        inactive

    ) {

        lines.push(

            ""

        );

        lines.push(

            "• Active : " +

            active

        );

        lines.push(

            "• Inactive : " +

            inactive

        );

    }

    if (

        moving ||

        stationary

    ) {

        lines.push(

            ""

        );

        lines.push(

            "• Moving : " +

            moving

        );

        lines.push(

            "• Stationary : " +

            stationary

        );

    }

    if (

        data.designationSummary &&

        typeof data.designationSummary ===

        "object"

    ) {

        lines.push(

            ""

        );

        lines.push(

            "## DESIGNATIONS"

        );

        Object.entries(

            data.designationSummary

        ).forEach(

            function (

                entry

            ) {

                lines.push(

                    "• " +

                    entry[0] +

                    " : " +

                    entry[1]

                );

            }

        );

    }

    result.markdown =

        lines.join(

            "\n"

        );

    /*----------------------------------
      Cards
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-count",

        title:

            "Staff Count",

        data:

            data

    });

    /*----------------------------------
      Sections
    ----------------------------------*/

    result.sections.push({

        title:

            "Staff Count",

        data:

            data

    });

    /*----------------------------------
      Preserve Data
    ----------------------------------*/

    result.data =

        data;

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        response.intent ||

        StaffConstants.INTENTS.STAFF_COUNT;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Staff count formatted successfully.";

    return result;

};
 StaffFormatter.formatStaffDirectory
 = function (

    response

) {

    const result =

        StaffFormatter.createResponse(

            response

        );

    const groups =

        Array.isArray(

            response.data

        )

            ? response.data

            : [];

    let text =

        "# 👤 STAFF DIRECTORY\n\n";

    if (

        groups.length ===

        0

    ) {

        result.success =

            true;

        result.message =

            text +

            "No staff found.";

        result.data =

            groups;

        return result;

    }

    groups.forEach(

        function (

            group,

            index

        ) {

            const title =

                group.circle ||

                group.division ||

                group.range ||

                group.beat ||

                group.designation ||

                "GROUP";

            text +=

`## ${index + 1}. ${title}

**Total Staff:** ${group.totalStaff}

`;

            (

                group.staff ||

                []

            ).forEach(

                function (

                    profile,

                    i

                ) {

                    text +=

`${i + 1}. **${profile.identity?.name || profile.name || ""}**

   • Designation : ${profile.identity?.designation || profile.designation || ""}

   • Role : ${profile.identity?.role || profile.role || ""}

   • Circle : ${profile.posting?.circle || profile.circle || ""}

   • Division : ${profile.posting?.division || profile.division || ""}

   • Range : ${profile.posting?.range || profile.range || ""}

   • Beat : ${profile.posting?.beat || profile.beat || ""}

   • Duty : ${profile.assignment?.status || profile.dutyStatus || ""}

   • Active : ${profile.assignment?.dutyActive ?? profile.dutyActive ? "YES" : "NO"}

   • Speed : ${profile.gps?.speed ?? profile.speed ?? 0}

   • Distance : ${profile.analytics?.distanceKm ?? profile.distanceKm ?? 0} km

`;

                }

            );

            text +=

"\n";

        }

    );

    result.success =

        true;

    result.title =

        "Staff Directory";

    result.message =

        text;

    result.data =

        groups;

    return result;

};
 /*=========================================================
 FORMAT STAFF PROFILE
=========================================================*/

StaffFormatter.formatStaffProfile = function (

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

StaffFormatter.formatStaffContact = function (

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

StaffFormatter.formatStaffRole = function (

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

StaffFormatter.formatStaffDesignation
 = function (

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

StaffFormatter.formatStaffCircle
 = function (

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

StaffFormatter.formatStaffDivision
 = function (

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

StaffFormatter.formatStaffRange = function (

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

StaffFormatter.formatStaffBeat
 = function (

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

StaffFormatter.formatStaffPosting = function (

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

StaffFormatter.formatStaffLocation = function (
    response
) {
    const type =
    response.parameters?.locationType ||
    "FULL";

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

    const posting =
        profile.posting ||
        {};

    const spatial =
        profile.spatial ||
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
      Build reusable sentences
    ----------------------------------*/

    const postingPlace = [
        posting.beat,
        posting.range,
        posting.division
    ].filter(Boolean).join(", ");

    const currentPlace = [
        spatial.compartment,
        spatial.beat
            ? "under " +
              spatial.beat
            : "",
        spatial.range,
        spatial.division
    ].filter(Boolean).join(", ");

    const businessLocation =
        displayName +
        (
            postingPlace
                ? " posted at " +
                  postingPlace
                : ""
        ) +
        (
            currentPlace
                ? " is currently in " +
                  currentPlace
                : ""
        ) +
        ".";

    /*----------------------------------
      Live Coordinates
      (Prefer GPS, fallback to Location)
    ----------------------------------*/

    const latitude =
        gps.lat ??
        location.lat ??
        "-";

    const longitude =
        gps.lon ??
        location.lon ??
        "-";

    /*----------------------------------
      Last Seen
    ----------------------------------*/

    const lastSeen =
        gps.lastSeen ||
        gps.timestamp ||
        gps.updatedAt ||
        "-";

    const lastSeenText =
        lastSeen !== "-"
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

  switch (
    type
){
case "CURRENT":

    result.markdown = [

        "# 📍 STAFF LOCATION",

        "",

        businessLocation,

        "",

        "GPS Coordinates",

        "",

        "Latitude  : " + latitude,

        "Longitude : " + longitude,

        "",

        "Accuracy  : " + (gps.accuracy ?? "-") + " m",

        "Speed     : " + (gps.speed ?? "-") + " km/h",

        "Heading   : " + (gps.heading ?? "-") + "°",

        "",

        "Last Seen : " + lastSeenText

    ].join("\n");

    break;

        case "POSTING":
            result.markdown = ["# 📍 STAFF POSTING", "", displayName + (postingPlace ? " posted at " + postingPlace : "") + "."].join("\n");
            break;

        case "GPS":
            result.markdown = ["# 📍 STAFF LOCATION", "", businessLocation, "", "GPS Coordinates", "", "Latitude  : " + latitude, "Longitude : " + longitude, "", "Accuracy  : " + (gps.accuracy ?? "-") + " m", "Speed     : " + (gps.speed ?? "-") + " km/h", "Heading   : " + (gps.heading ?? "-") + "°", "", "Last Seen : " + lastSeenText].join("\n");
            break;

        case "LAST_SEEN":
            result.markdown = ["# 📍 LAST SEEN", "", businessLocation, "", "Last Seen : " + lastSeenText].join("\n");
            break;
case "LIVE":
    result.markdown = [
    "# 📍 LIVE LOCATION",
    "",
    businessLocation
].join("\n");

break;
    case "TRACK":
    result.markdown = [
    "# 📍 LIVE TRACK",
    "",
    businessLocation
].join("\n");

break;
    case "AREA":
    result.markdown = [
    "# 📍 CURRENT AREA",
    "",
    displayName +
    " is currently in " +
    (
        spatial.compartment ||
        "-"
    ) +
    "."
].join("\n");

break;
    case "BEAT":
    result.markdown = [
    "# 📍 CURRENT BEAT",
    "",
    displayName +
    " is currently in " +
    (
        spatial.beat ||
        "-"
    ) +
    "."
].join("\n");

break;
    case "RANGE":
    result.markdown = [
    "# 📍 CURRENT RANGE",
    "",
    displayName +
    " is currently in " +
    (
        spatial.range ||
        "-"
    ) +
    "."
].join("\n");

break;
    case "DIVISION":
    result.markdown = [
    "# 📍 CURRENT DIVISION",
    "",
    displayName +
    " is currently in " +
    (
        spatial.division ||
        "-"
    ) +
    "."
].join("\n");

break;
        default:
            result.markdown = ["# 📍 STAFF LOCATION", "", businessLocation, "", "GPS Coordinates", "", "Latitude  : " + latitude, "Longitude : " + longitude, "", "Accuracy  : " + (gps.accuracy ?? "-") + " m", "Speed     : " + (gps.speed ?? "-") + " km/h", "Heading   : " + (gps.heading ?? "-") + "°", "", "Last Seen : " + lastSeenText].join("\n");
            break;
    }

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
                latitude,
            longitude:
                longitude,
            currentDivision:
                spatial.division || "",
            currentRange:
                spatial.range || "",
            currentBeat:
                spatial.beat || "",
            currentCompartment:
                spatial.compartment || "",
            spatialSource:
                spatial.source || "",
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
                "",
            lastSeen:
                lastSeenText
        }
    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({
        title:
            "Current Location",
        data: {
            name:
                displayName,
            designation:
                identity.designation ||
                "",
            latitude:
                latitude,
            longitude:
                longitude,
            currentDivision:
                spatial.division || "",
            currentRange:
                spatial.range || "",
            currentBeat:
                spatial.beat || "",
            currentCompartment:
                spatial.compartment || "",
            spatialSource:
                spatial.source || "",
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
                "",
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

 StaffFormatter.formatStaffAssignment = function (

    response

) {

    const type =

        response.parameters?.assignmentView ||

        "FULL";

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

const duty =

    profile.duty ||

    {};

const displayName =

    identity.name ||

    identity.rawName ||

    identity.cleanName ||

    "-";

/*----------------------------------
  Assignment Hierarchy
----------------------------------*/

const assignedCompartment =

    assignment.compartment ||

    assignment.assignedCompartment ||

    "-";

const assignedBeat =

    assignment.beat ||

    posting.beat ||

    "-";

const assignedRange =

    assignment.range ||

    posting.range ||

    "-";

const assignedDivision =

    assignment.division ||

    posting.division ||

    "-";

const assignedCircle =

    assignment.circle ||

    posting.circle ||

    "-";

/*----------------------------------
  Assigned To
----------------------------------*/

const assignedTo =

    assignedCompartment !== "-"

        ? assignedCompartment

        : assignedBeat !== "-"

        ? assignedBeat

        : assignedRange !== "-"

        ? assignedRange

        : assignedDivision !== "-"

        ? assignedDivision

        : "-";

/*----------------------------------
  Duty
----------------------------------*/

const dutyType =

    duty.dutyType ||

    duty.type ||

    assignment.dutyType ||

    "-";


  console.log(
    "PROFILE:",
    profile
);

console.log(
    "ASSIGNMENT:",
    assignment
);

console.log(
    "COMPARTMENT:",
    assignment.compartment
);

console.log(
    "BEAT:",
    assignment.beat
);

console.log(
    "RANGE:",
    assignment.range
);

console.log(
    "DIVISION:",
    assignment.division
);

console.log(
    "ASSIGNED TO:",
    assignedTo
);
    /*----------------------------------
      Business Sentence
    ----------------------------------*/

const assignmentSentence =

    displayName +

    " is assigned for " +

    dutyType +

    " duty at " +

    assignedTo +

    ".";

    /*----------------------------------
      Markdown
    ----------------------------------*/

switch (

    type

) {

    case "DUTY_TYPE":

        result.markdown = [

            "# 🚔 DUTY TYPE",

            "",

            "Name         : " +

            displayName,

            "",

            "Duty Type    : " +

            dutyType,



            "Assigned To  : " +

            assignedTo,

            "Compartment  : " +



            assignedBeat

        ].join(

            "\n"

        );

        break;

    case "COMPARTMENT":

        result.markdown = [

            "# 🚔 ASSIGNED COMPARTMENT",

            "",

            "Name         : " +

            displayName,

            "",

            "Assigned To  : " +

            assignedTo,



            "Beat         : " +

            assignedBeat,

            "Range        : " +

            assignedRange,

            "Division     : " +

            assignedDivision,

            "Circle       : " +

            assignedCircle,

            "",

            "Duty Type    : " +

            dutyType



        ].join(

            "\n"

        );

        break;

    case "BEAT":

        result.markdown = [

            "# 🚔 ASSIGNED BEAT",

            "",

            "Name         : " +

            displayName,

            "",

            "Assigned To  : " +

            assignedTo,

            "Beat         : " +

            assignedBeat,



            "Range        : " +

            assignedRange,

            "Division     : " +

            assignedDivision,

            "Circle       : " +

            assignedCircle,

            "",

            "Duty Type    : " +

            dutyType



        ].join(

            "\n"

        );

        break;

    case "RANGE":

        result.markdown = [

            "# 🚔 ASSIGNED RANGE",

            "",

            "Name         : " +

            displayName,

            "",

            "Assigned To  : " +

            assignedTo,

            "Range        : " +

            assignedRange,

            "Beat         : " +

            assignedBeat,



            "Division     : " +

            assignedDivision,

            "Circle       : " +

            assignedCircle,

            "",

            "Duty Type    : " +

            dutyType



        ].join(

            "\n"

        );

        break;

    case "DIVISION":

        result.markdown = [

            "# 🚔 ASSIGNED DIVISION",

            "",

            "Name         : " +

            displayName,

            "",

            "Assigned To  : " +

            assignedTo,

            "Division     : " +

            assignedDivision,

            "Range        : " +

            assignedRange,

            "Beat         : " +

            assignedBeat,



            "Circle       : " +

            assignedCircle,

            "",

            "Duty Type    : " +

            dutyType



        ].join(

            "\n"

        );

        break;

    default:

        result.markdown = [

            "# 🚔 DUTY ASSIGNMENT",

            "",

            assignmentSentence,

            "",

            "Duty Type    : " +

            dutyType,



            "Assigned To  : " +

            assignedTo,



            "Beat         : " +

            assignedBeat,

            "Range        : " +

            assignedRange,

            "Division     : " +

            assignedDivision,

            "Circle       : " +

            assignedCircle

        ].join(

            "\n"

        );

        break;

}
/*----------------------------------
  Card
----------------------------------*/

result.cards.push({

    type:

        "staff-assignment",

    title:

        displayName,

    data: {

        /*----------------------------------
          Identity
        ----------------------------------*/

        name:

            displayName,

        designation:

            identity.designation ||

            "",

        /*----------------------------------
          Duty
        ----------------------------------*/

        dutyType:

            dutyType,

        

        /*----------------------------------
          Assignment
        ----------------------------------*/

        assignedTo:

            assignedTo,



        assignedBeat:

            assignedBeat,

        assignedRange:

            assignedRange,

        assignedDivision:

            assignedDivision,

        assignedCircle:

            assignedCircle,

        /*----------------------------------
          Administrative Posting
        ----------------------------------*/

        postingBeat:

            posting.beat ||

            "",

        postingRange:

            posting.range ||

            "",

        postingDivision:

            posting.division ||

            "",

        postingCircle:

            posting.circle ||

            ""

    }

});

/*----------------------------------
  Section
----------------------------------*/

result.sections.push({

    title:

        "Duty Assignment",

    data: {

        /*----------------------------------
          Identity
        ----------------------------------*/

        name:

            displayName,

        designation:

            identity.designation ||

            "",

        /*----------------------------------
          Duty
        ----------------------------------*/

        dutyType:

            dutyType,

        

        /*----------------------------------
          Assignment
        ----------------------------------*/

        assignedTo:

            assignedTo,



        assignedBeat:

            assignedBeat,

        assignedRange:

            assignedRange,

        assignedDivision:

            assignedDivision,

        assignedCircle:

            assignedCircle,

        /*----------------------------------
          Administrative Posting
        ----------------------------------*/

        postingBeat:

            posting.beat ||

            "",

        postingRange:

            posting.range ||

            "",

        postingDivision:

            posting.division ||

            "",

        postingCircle:

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

StaffFormatter.formatStaffDutyStatus
 = function (

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

StaffFormatter.formatStaffDutyStart
 = function (

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

StaffFormatter.formatStaffDutyEnd
 = function (

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


 /*=========================================================
 FORMAT ANALYTICS
=========================================================*/

StaffFormatter.formatStaffAnalytics = function (

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

StaffFormatter.formatStaffDistance = function (

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

StaffFormatter.formatStaffPatrolPoints
 = function (

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

StaffFormatter.formatStaffPatrolStart = function (

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

StaffFormatter.formatStaffPatrolEnd
 = function (

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

StaffFormatter.formatStaffPatrolDuration = function (

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

StaffFormatter.formatStaffJurisdictionSummary = function (

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

StaffFormatter.formatStaffDesignationSummary
 = function (

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

StaffFormatter.formatStaffCircleDirectory = function (

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

StaffFormatter.formatStaffDivisionDirectory = function (

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

StaffFormatter.formatStaffRangeDirectory = function (

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

StaffFormatter.formatStaffBeatDirectory
 = function (

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

StaffFormatter.formatStaffDesignationDirectory = function (

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
  DEBUG
----------------------------------*/

console.group(

    "📄 FORMAT DESIGNATION DIRECTORY"

);

console.log(

    "Response"

);

console.dir(

    response,

    {

        depth: null

    }

);

console.log(

    "Directory"

);

console.dir(

    directory,

    {

        depth: null

    }

);

console.log(

    "Groups:",

    directory.length

);

directory.forEach(

    function (

        group,

        index

    ) {

        console.group(

            "Group " +

            (

                index + 1

            )

        );

        console.log(

            "Designation:",

            group.designation

        );

        console.log(

            "TotalStaff:",

            group.totalStaff

        );

        console.log(

            "Staff Array Exists:",

            Array.isArray(

                group.staff

            )

        );

        console.log(

            "Staff Length:",

            Array.isArray(

                group.staff

            )

                ?

                group.staff.length

                :

                0

        );

        console.dir(

            group.staff,

            {

                depth: null

            }

        );

        console.groupEnd();

    }

);

console.groupEnd();
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

                typeof group !==

                "object"

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

                    profile,

                    staffIndex

                ) {

                    if (

                        !profile ||

                        typeof profile !==

                        "object"

                    ) {

                        return;

                    }

                    const identity =

                        profile.identity ||

                        {};

                    const posting =

                        profile.posting ||

                        {};

                    lines.push(

                        (

                            staffIndex + 1

                        ) +

                        ". **" +

                        (

                            identity.cleanName ||

                            "-"

                        ) +

                        "**"

                    );

                    lines.push(

                        "   • Designation : " +

                        (

                            identity.designation ||

                            "-"

                        )

                    );

                    lines.push(

                        "   • Role : " +

                        (

                            identity.role ||

                            "-"

                        )

                    );

                    lines.push(

                        "   • Circle : " +

                        (

                            posting.circle ||

                            "-"

                        )

                    );

                    lines.push(

                        "   • Division : " +

                        (

                            posting.division ||

                            "-"

                        )

                    );

                    lines.push(

                        "   • Range : " +

                        (

                            posting.range ||

                            "-"

                        )

                    );

                    lines.push(

                        "   • Beat : " +

                        (

                            posting.beat ||

                            "-"

                        )

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
      Preserve Data
    ----------------------------------*/

    result.data =

        directory;

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS
            .STAFF_DESIGNATION_DIRECTORY;

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
/*=========================================================
  DESIGNATION COUNT
=========================================================*/

StaffFormatter.formatDesignationCount = function (

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

            "Designation count not available.";

        return result;

    }

    /*----------------------------------
      Aggregate Data
    ----------------------------------*/

    const data =

        Array.isArray(

            response.data

        )

            ?

            (

                response.data[0] ||

                {}

            )

            :

            response.data;

    const designation =

        data.designation ||

        "UNASSIGNED";

    const circle =

        data.circle ||

        "";

    const division =

        data.division ||

        "";

    const range =

        data.range ||

        "";

    const beat =

        data.beat ||

        "";

    const compartment =

        data.compartment ||

        "";

    const count =

        Number(

            data.count ??

            data.totalStaff ??

            0

        );

    const staffList =

        Array.isArray(

            data.staff

        )

            ?

            data.staff

            :

            [];

    /*----------------------------------
      Jurisdiction
    ----------------------------------*/

    const jurisdiction =

        compartment ||

        beat ||

        range ||

        division ||

        circle ||

        "All Jurisdictions";

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [

        "# 👤 DESIGNATION COUNT",

        "",

        "**Designation:** " +

            designation,

        "",

        "**Jurisdiction:** " +

            jurisdiction,

        "",

        "**Total Staff:** " +

            count

    ];

    if (

        staffList.length >

        0

    ) {

        lines.push(

            ""

        );

        staffList.forEach(

            function (

                profile,

                index

            ) {

                if (

                    !profile ||

                    typeof profile !==

                    "object"

                ) {

                    return;

                }

                const identity =

                    profile.identity ||

                    {};

                const posting =

                    profile.posting ||

                    {};

                lines.push(

                    (

                        index + 1

                    ) +

                    ". **" +

                    (

                        identity.cleanName ||

                        "-"

                    ) +

                    "**"

                );

                lines.push(

                    "   • Designation : " +

                    (

                        identity.designation ||

                        "-"

                    )

                );

                lines.push(

                    "   • Role : " +

                    (

                        identity.role ||

                        "-"

                    )

                );

                lines.push(

                    "   • Circle : " +

                    (

                        posting.circle ||

                        "-"

                    )

                );

                lines.push(

                    "   • Division : " +

                    (

                        posting.division ||

                        "-"

                    )

                );

                lines.push(

                    "   • Range : " +

                    (

                        posting.range ||

                        "-"

                    )

                );

                lines.push(

                    "   • Beat : " +

                    (

                        posting.beat ||

                        "-"

                    )

                );

                lines.push(

                    ""

                );

            }

        );

    }

    else {

        lines.push(

            ""

        );

        lines.push(

            "_No staff found._"

        );

    }

    result.markdown =

        lines.join(

            "\n"

        );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-designation-count",

        title:

            designation +

            " Count",

        data: {

            designation:

                designation,

            circle:

                circle,

            division:

                division,

            range:

                range,

            beat:

                beat,

            compartment:

                compartment,

            jurisdiction:

                jurisdiction,

            count:

                count,

            totalStaff:

                count,

            staff:

                staffList

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Designation Count",

        data: {

            designation:

                designation,

            circle:

                circle,

            division:

                division,

            range:

                range,

            beat:

                beat,

            compartment:

                compartment,

            jurisdiction:

                jurisdiction,

            count:

                count,

            totalStaff:

                count,

            staff:

                staffList

        }

    });

    /*----------------------------------
      Preserve Data
    ----------------------------------*/

    result.data =

        data;

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS
            .STAFF_DESIGNATION_COUNT;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Designation count formatted successfully.";

    return result;

};
/*=========================================================
  CIRCLE COUNT
=========================================================*/

StaffFormatter.formatStaffCircleCount = function (

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

            "Circle count not found.";

        return result;

    }

    /*----------------------------------
      Data
    ----------------------------------*/

    const data =

        response.data;

    const circle =

        data.circle ||

        "-";

    const count =

        Number(

            data.count || 0

        );

    const staff =

        Array.isArray(

            data.staff

        )

            ? data.staff

            : [];

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [];

    lines.push(

        "# 👤 CIRCLE COUNT"

    );

    lines.push("");

    lines.push(

        "**Circle:** " +

        circle

    );

    lines.push(

        "**Total Staff:** " +

        count

    );

    if (

        staff.length > 0

    ) {

        lines.push("");

        staff.forEach(

            function (

                profile,

                index

            ) {

                const identity =

                    profile.identity ||

                    profile;

                const posting =

                    profile.posting ||

                    profile;

                lines.push(

                    (index + 1) +

                    ". **" +

                    (

                        identity.cleanName ||

                        identity.name ||

                        "-"

                    ) +

                    "**"

                );

                lines.push(

                    "   • Designation : " +

                    (

                        identity.designation ||

                        "-"

                    )

                );

                lines.push(

                    "   • Division : " +

                    (

                        posting.division ||

                        "-"

                    )

                );

                lines.push(

                    "   • Range : " +

                    (

                        posting.range ||

                        "-"

                    )

                );

                lines.push(

                    "   • Beat : " +

                    (

                        posting.beat ||

                        "-"

                    )

                );

            }

        );

    }

    else {

        lines.push("");

        lines.push(

            "_No staff found._"

        );

    }

    result.markdown =

        lines.join(

            "\n"

        );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-circle-count",

        title:

            circle +

            " Count",

        data: {

            circle:

                circle,

            count:

                count,

            staff:

                staff

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Circle Count",

        data: {

            circle:

                circle,

            count:

                count,

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

        StaffConstants.INTENTS
            .STAFF_CIRCLE_COUNT;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Circle count formatted successfully.";

    return result;

};

 /*=========================================================
  DIVISION COUNT
=========================================================*/

StaffFormatter.formatDivisionCount = function (

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

            "Division count not found.";

        return result;

    }

    /*----------------------------------
      Data
    ----------------------------------*/

    const data =

        response.data;

    const division =

        data.division ||

        "-";

    const count =

        Number(

            data.count || 0

        );

    const staff =

        Array.isArray(

            data.staff

        )

            ? data.staff

            : [];

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [];

    lines.push(

        "# 👤 DIVISION COUNT"

    );

    lines.push("");

    lines.push(

        "**Division:** " +

        division

    );

    lines.push(

        "**Total Staff:** " +

        count

    );

    if (

        staff.length > 0

    ) {

        lines.push("");

        staff.forEach(

            function (

                profile,

                index

            ) {

                const identity =

                    profile.identity ||

                    profile;

                const posting =

                    profile.posting ||

                    profile;

                lines.push(

                    (index + 1) +

                    ". **" +

                    (

                        identity.cleanName ||

                        identity.name ||

                        "-"

                    ) +

                    "**"

                );

                lines.push(

                    "   • Designation : " +

                    (

                        identity.designation ||

                        "-"

                    )

                );

                lines.push(

                    "   • Range : " +

                    (

                        posting.range ||

                        "-"

                    )

                );

                lines.push(

                    "   • Beat : " +

                    (

                        posting.beat ||

                        "-"

                    )

                );

            }

        );

    }

    else {

        lines.push("");

        lines.push(

            "_No staff found._"

        );

    }

    result.markdown =

        lines.join(

            "\n"

        );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-division-count",

        title:

            division +

            " Count",

        data: {

            division:

                division,

            count:

                count,

            staff:

                staff

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Division Count",

        data: {

            division:

                division,

            count:

                count,

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

        StaffConstants.INTENTS
            .STAFF_DIVISION_COUNT;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Division count formatted successfully.";

    return result;

};

 /*=========================================================
  RANGE COUNT
=========================================================*/

StaffFormatter.formatRangeCount = function (

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

            "Range count not found.";

        return result;

    }

    /*----------------------------------
      Data
    ----------------------------------*/

    const data =

        response.data;

    const range =

        data.range ||

        "-";

    const count =

        Number(

            data.count || 0

        );

    const staff =

        Array.isArray(

            data.staff

        )

            ? data.staff

            : [];

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [];

    lines.push(

        "# 👤 RANGE COUNT"

    );

    lines.push("");

    lines.push(

        "**Range:** " +

        range

    );

    lines.push(

        "**Total Staff:** " +

        count

    );

    if (

        staff.length > 0

    ) {

        lines.push("");

        staff.forEach(

            function (

                profile,

                index

            ) {

                const identity =

                    profile.identity ||

                    profile;

                const posting =

                    profile.posting ||

                    profile;

                lines.push(

                    (index + 1) +

                    ". **" +

                    (

                        identity.cleanName ||

                        identity.name ||

                        "-"

                    ) +

                    "**"

                );

                lines.push(

                    "   • Designation : " +

                    (

                        identity.designation ||

                        "-"

                    )

                );

                lines.push(

                    "   • Beat : " +

                    (

                        posting.beat ||

                        "-"

                    )

                );

                lines.push(

                    "   • Division : " +

                    (

                        posting.division ||

                        "-"

                    )

                );

            }

        );

    }

    else {

        lines.push("");

        lines.push(

            "_No staff found._"

        );

    }

    result.markdown =

        lines.join(

            "\n"

        );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-range-count",

        title:

            range +

            " Count",

        data: {

            range:

                range,

            count:

                count,

            staff:

                staff

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Range Count",

        data: {

            range:

                range,

            count:

                count,

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

        StaffConstants.INTENTS
            .STAFF_RANGE_COUNT;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Range count formatted successfully.";

    return result;

};

 /*=========================================================
  BEAT COUNT
=========================================================*/

StaffFormatter.formatBeatCount = function (

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

            "Beat count not found.";

        return result;

    }

    /*----------------------------------
      Data
    ----------------------------------*/

    const data =

        response.data;

    const beat =

        data.beat ||

        "-";

    const count =

        Number(

            data.count || 0

        );

    const staff =

        Array.isArray(

            data.staff

        )

            ? data.staff

            : [];

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [];

    lines.push(

        "# 👤 BEAT COUNT"

    );

    lines.push("");

    lines.push(

        "**Beat:** " +

        beat

    );

    lines.push(

        "**Total Staff:** " +

        count

    );

    if (

        staff.length > 0

    ) {

        lines.push("");

        staff.forEach(

            function (

                profile,

                index

            ) {

                const identity =

                    profile.identity ||

                    profile;

                const posting =

                    profile.posting ||

                    profile;

                lines.push(

                    (index + 1) +

                    ". **" +

                    (

                        identity.cleanName ||

                        identity.name ||

                        "-"

                    ) +

                    "**"

                );

                lines.push(

                    "   • Designation : " +

                    (

                        identity.designation ||

                        "-"

                    )

                );

                lines.push(

                    "   • Range : " +

                    (

                        posting.range ||

                        "-"

                    )

                );

                lines.push(

                    "   • Division : " +

                    (

                        posting.division ||

                        "-"

                    )

                );

                lines.push(

                    "   • Circle : " +

                    (

                        posting.circle ||

                        "-"

                    )

                );

            }

        );

    }

    else {

        lines.push("");

        lines.push(

            "_No staff found._"

        );

    }

    result.markdown =

        lines.join(

            "\n"

        );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-beat-count",

        title:

            beat +

            " Count",

        data: {

            beat:

                beat,

            count:

                count,

            staff:

                staff

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Beat Count",

        data: {

            beat:

                beat,

            count:

                count,

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

        StaffConstants.INTENTS
            .STAFF_BEAT_COUNT;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Beat count formatted successfully.";

    return result;

};
 /*=========================================================
  STAFF COUNT
=========================================================*/

StaffFormatter.formatStaffCount = function (

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

            "Staff count not found.";

        return result;

    }

    /*----------------------------------
      Data
    ----------------------------------*/

    const data =

        response.data;

    const count =

        Number(

            data.count || 0

        );

    const staff =

        Array.isArray(

            data.staff

        )

            ? data.staff

            : [];

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [];

    lines.push(

        "# 👤 STAFF COUNT"

    );

    lines.push("");

    lines.push(

        "**Total Staff:** " +

        count

    );

    if (

        staff.length > 0

    ) {

        lines.push("");

        staff.forEach(

            function (

                profile,

                index

            ) {

                const identity =

                    profile.identity ||

                    profile;

                const posting =

                    profile.posting ||

                    profile;

                lines.push(

                    (index + 1) +

                    ". **" +

                    (

                        identity.cleanName ||

                        identity.name ||

                        "-"

                    ) +

                    "**"

                );

                lines.push(

                    "   • Designation : " +

                    (

                        identity.designation ||

                        "-"

                    )

                );

                lines.push(

                    "   • Range : " +

                    (

                        posting.range ||

                        "-"

                    )

                );

                lines.push(

                    "   • Beat : " +

                    (

                        posting.beat ||

                        "-"

                    )

                );

            }

        );

    }

    else {

        lines.push("");

        lines.push(

            "_No staff found._"

        );

    }

    result.markdown =

        lines.join(

            "\n"

        );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "staff-count",

        title:

            "Staff Count",

        data: {

            count:

                count,

            staff:

                staff

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Staff Count",

        data: {

            count:

                count,

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

        StaffConstants.INTENTS
            .STAFF_COUNT;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Staff count formatted successfully.";

    return result;

};
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

StaffFormatter.formatStaffActiveList = function (

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
 FORMAT TEAM LEADER LIST
=========================================================*/

StaffFormatter.formatStaffTeamLeaderList = function (

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

            "Team leader list not available.";

        return result;

    }

    /*----------------------------------
      Data
    ----------------------------------*/

    const staff =

        response.data.staff ||

        [];

    const count =

        response.data.count ??

        staff.length;

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [

        "# 👮 TEAM LEADER DIRECTORY",

        "",

        "**Total Team Leaders:** " +

            count,

        ""

    ];

    staff.forEach(

        function (

            profile,

            index

        ) {

            const identity =

                profile.identity ||

                profile;

            const posting =

                profile.posting ||

                profile;

            const assignment =

                profile.assignment ||

                profile;

            const gps =

                profile.gps ||

                profile;

            const analytics =

                profile.analytics ||

                profile;

            lines.push(

                "## " +

                (

                    index + 1

                ) +

                ". " +

                (

                    identity.name ||

                    identity.cleanName ||

                    "-"

                )

            );

            lines.push(

                "**Designation:** " +

                (

                    identity.designation ||

                    "-"

                )

            );

            lines.push(

                "**Role:** " +

                (

                    identity.role ||

                    "TEAM LEADER"

                )

            );

            lines.push(

                "**Circle:** " +

                (

                    posting.circle ||

                    "-"

                )

            );

            lines.push(

                "**Division:** " +

                (

                    posting.division ||

                    "-"

                )

            );

            lines.push(

                "**Range:** " +

                (

                    posting.range ||

                    "-"

                )

            );

            lines.push(

                "**Beat:** " +

                (

                    posting.beat ||

                    "-"

                )

            );

            lines.push(

                "**Duty:** " +

                (

                    assignment.dutyType ||

                    "-"

                )

            );

            lines.push(

                "**Status:** " +

                (

                    assignment.status ||

                    assignment.dutyStatus ||

                    "-"

                )

            );

            lines.push(

                "**Speed:** " +

                (

                    gps.speed ??

                    0

                )

            );

            lines.push(

                "**Distance:** " +

                (

                    analytics.distanceKm ??

                    0

                ) +

                " km"

            );

            lines.push("");

        }

    );

    if (

        staff.length === 0

    ) {

        lines.push(

            "_No Team Leaders found._"

        );

    }

    result.markdown =

        lines.join(

            "\n"

        );

    /*----------------------------------
      Card
    ----------------------------------*/

    result.cards.push({

        type:

            "team-leader-list",

        title:

            "Team Leaders",

        data: {

            count:

                count,

            staff:

                staff

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections.push({

        title:

            "Team Leaders",

        data: {

            count:

                count,

            staff:

                staff

        }

    });

    /*----------------------------------
      Preserve Data
    ----------------------------------*/

    result.data =

        response.data;

    /*----------------------------------
      Metadata
    ----------------------------------*/

    result.success =

        true;

    result.intent =

        StaffConstants.INTENTS.STAFF_TEAM_LEADER_LIST;

    result.confidence =

        response.confidence ||

        1;

    result.source =

        response.source ||

        "LOCAL";

    result.message =

        "Team leader list formatted successfully.";

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

StaffFormatter.formatStaffDutySummary = function (

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

StaffFormatter.formatStaffMoving = function (

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

StaffFormatter.formatStaffStationary
 = function (

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

    response = {}

) {

    /*----------------------------------
      Create Response
    ----------------------------------*/

    const result =

        StaffFormatter.createResponse(

            response

        );

    /*----------------------------------
      Normalize Data
    ----------------------------------*/

    const data =

        response.data ||

        response ||

        {};

    const staff =

        Array.isArray(

            data.staff

        )

            ? data.staff

            : [];

    const count =

        data.count ??

        staff.length;

    /*----------------------------------
      No Data
    ----------------------------------*/

    if (

        staff.length === 0

    ) {

        result.success =

            false;

        result.intent =

            StaffConstants.INTENTS.WHO_IS_ON_DUTY;

        result.confidence =

            response.confidence ||

            1;

        result.source =

            response.source ||

            "LOCAL";

        result.message =

            "No staff currently on duty.";

        result.markdown =

            "# 🚓 WHO IS ON DUTY\n\nNo staff currently on duty.";

        return result;

    }

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [

        "# 🚓 WHO IS ON DUTY",

        "",

        "**Total Staff On Duty:** " +

            count,

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

                    profile.assignment?.beat ||

                    "-"

                )

            );

            lines.push(

                "**Range:** " +

                (

                    profile.posting?.range ||

                    profile.assignment?.range ||

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

                count,

            staff:

                staff

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections =

        result.sections ||

        [];

    result.sections.push({

        title:

            "Who Is On Duty",

        data: {

            count:

                count,

            staff:

                staff

        }

    });

    /*----------------------------------
      Response Data
    ----------------------------------*/

    result.data =

        data;

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

};
/*=========================================================
  FORMAT WHO IS PATROLLING
=========================================================*/

StaffFormatter.formatWhoIsPatrolling = function (

    response = {}

) {

    /*----------------------------------
      Create Response
    ----------------------------------*/

    const result =

        StaffFormatter.createResponse(

            response

        );

    /*----------------------------------
      Normalize Data
    ----------------------------------*/

    const data =

        response.data ||

        response ||

        {};

    const staff =

        Array.isArray(

            data.staff

        )

            ? data.staff

            : [];

    const count =

        data.count ??

        staff.length;

    /*----------------------------------
      No Data
    ----------------------------------*/

    if (

        staff.length === 0

    ) {

        result.success =

            false;

        result.intent =

            StaffConstants.INTENTS.WHO_IS_PATROLLING;

        result.confidence =

            response.confidence ||

            1;

        result.source =

            response.source ||

            "LOCAL";

        result.message =

            "No staff currently patrolling.";

        result.markdown =

            "# 🚶 WHO IS PATROLLING\n\nNo staff currently patrolling.";

        return result;

    }

    /*----------------------------------
      Markdown
    ----------------------------------*/

    const lines = [

        "# 🚶 WHO IS PATROLLING",

        "",

        "**Total Patrolling Staff:** " +

            count,

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

                    profile.assignment?.beat ||

                    "-"

                )

            );

            lines.push(

                "**Range:** " +

                (

                    profile.posting?.range ||

                    profile.assignment?.range ||

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

                count,

            staff:

                staff

        }

    });

    /*----------------------------------
      Section
    ----------------------------------*/

    result.sections =

        result.sections ||

        [];

    result.sections.push({

        title:

            "Who Is Patrolling",

        data: {

            count:

                count,

            staff:

                staff

        }

    });

    /*----------------------------------
      Response Data
    ----------------------------------*/

    result.data =

        data;

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
