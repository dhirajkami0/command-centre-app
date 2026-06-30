/*!
 * GreenGuard AI
 * formatter.js
 * Version : 2.0.0
 */

(function (window) {

"use strict";

window.GreenGuardAI =
    window.GreenGuardAI || {};

// Allow overwrite during development
window.GreenGuardAI.Formatter = null;

const Formatter = {};

/*----------------------------------------------------------
FORMAT ENTRY
----------------------------------------------------------*/

Formatter.format = function (result) {

    if (
        result === undefined ||
        result === null
    ) {
        return "";
    }

    if (
        typeof result === "string"
    ) {
        return result;
    }

    if (
        Array.isArray(result)
    ) {
        return formatArray(result);
    }

    if (
        result.success === false
    ) {
        return (
            result.error ||
            "Operation failed."
        );
    }

    if (
        result.intent
    ) {

      switch (

    String(
        result.intent
    ).toLowerCase()

) {

    case "mostvisited":
        return formatMostVisited(result);

    case "leastvisited":
        return formatLeastVisited(result);

    case "highestcoverage":
        return formatHighestCoverage(result);

    case "highestbeatcoverage":
        return formatHighestBeatCoverage(result);

    case "highestrangecoverage":
        return formatHighestRangeCoverage(result);

    case "highestdivisioncoverage":
        return formatHighestDivisionCoverage(result);

    case "inactive":
    case "nopatrol":
        return formatNoPatrol(result);

    case "highestdistance":
        return formatHighestDistance(result);

    case "topstaff":
        return formatTopStaff(result);

    case "patrolranking":
        return formatPatrolRanking(result);

    case "beatranking":
        return formatBeatRanking(result);

    case "rangeranking":
        return formatRangeRanking(result);

    case "divisionranking":
        return formatDivisionRanking(result);

    case "ranking":
        return formatRanking(result);

    case "statistics":
        return formatStatistics(result);

    case "summary":
        return formatSummary(result);
case "staffphone":
    return formatStaffPhone(result);

case "staffemail":
    return formatStaffEmail(result);

case "staffbeat":
    return formatStaffBeat(result);

case "staffrange":
    return formatStaffRange(result);

case "staffdivision":
    return formatStaffDivision(result);

case "staffrole":
    return formatStaffRole(result);

case "staffposting":
    return formatStaffPosting(result);

case "stafflocation":
    return formatStaffLocation(result);

case "staffpatrol":
    return formatStaffPatrol(result);

case "staffduty":
    return formatStaffDuty(result);

case "staffcircle":
    return formatStaffCircle(result);

case "staffstation":
    return formatStaffStation(result);

case "staffemployeeid":
    return formatStaffEmployeeId(result);

case "staffprofile":
case "staffsearch":
    return formatStaffProfile(result);
    case "session":
        return formatSession(result);

    case "drawpatrol":
        return formatSession(result);

    case "search":
        return formatSearch(result);

    default:
        break;

}

    }

    if (
        result.summary
    ) {

        return formatSummary(
            result.summary
        );

    }

    if (
        result.result
    ) {

        return Formatter.format(
            result.result
        );

    }

    return JSON.stringify(
        result,
        null,
        2
    );

};/*----------------------------------------------------------
MOST VISITED
----------------------------------------------------------*/

function formatMostVisited(r){

    const d =
        r.data || r;

    return [

        "🏆 Most Visited Compartment",

        "",

        "Compartment : " +
        (d.compartment || "-"),

        "Beat : " +
        (d.beat || "-"),

        "Range : " +
        (d.range || "-"),

        "Division : " +
        (d.division || "-"),

        "Visits : " +
        (d.visits || 0),

        "Coverage : " +
        Number(
            d.coverage || 0
        ).toFixed(2) + "%",

        "Distance : " +
        Number(
            d.patrolDistanceKm || 0
        ).toFixed(2) + " km"

    ].join("\n");

}

/*----------------------------------------------------------
LEAST VISITED
----------------------------------------------------------*/

function formatLeastVisited(r){

    const rows =
        r.data || [];

    let txt =
        "📉 Least Visited Compartments\n\n";

    rows.forEach(

        (x,i)=>{

            txt +=

                (i + 1) +

                ". " +

                x.compartment +

                " (" +

                (x.visits || 0) +

                " visits)\n";

        }

    );

    return txt;

}

/*----------------------------------------------------------
HIGHEST COVERAGE
----------------------------------------------------------*/

function formatHighestCoverage(r){

    const d =
        r.data || r;

    return [

        "🛰 Highest Coverage",

        "",

        d.compartment ||

        "-",

        "",

        "Beat : " +
        (d.beat || "-"),

        "Range : " +
        (d.range || "-"),

        "Division : " +
        (d.division || "-"),

        "",

        "Coverage : " +

        Number(

            d.coverage || 0

        ).toFixed(2) + "%",

        "Visited Cells : " +

        (

            d.coveredCells || 0

        ) +

        "/" +

        (

            d.totalCells || 0

        ),

        "Distance : " +

        Number(

            d.patrolDistanceKm || 0

        ).toFixed(2) +

        " km"

    ].join("\n");

}

/*----------------------------------------------------------
HIGHEST BEAT COVERAGE
----------------------------------------------------------*/

function formatHighestBeatCoverage(r){

    const d =
        r.data || r;

    return [

        "🟢 Highest Beat Coverage",

        "",

        d.name ||

        d.beat ||

        "-",

        "",

        "Coverage : " +

        Number(

            d.coverage || 0

        ).toFixed(2) +

        "%",

        "Visited Cells : " +

        (

            d.coveredCells || 0

        ) +

        "/" +

        (

            d.totalCells || 0

        ),

        "Compartments : " +

        (

            d.compartments || 0

        )

    ].join("\n");

}

/*----------------------------------------------------------
HIGHEST RANGE COVERAGE
----------------------------------------------------------*/

function formatHighestRangeCoverage(r){

    const d =
        r.data || r;

    return [

        "🟢 Highest Range Coverage",

        "",

        d.name ||

        d.range ||

        "-",

        "",

        "Coverage : " +

        Number(

            d.coverage || 0

        ).toFixed(2) +

        "%",

        "Visited Cells : " +

        (

            d.coveredCells || 0

        ) +

        "/" +

        (

            d.totalCells || 0

        ),

        "Compartments : " +

        (

            d.compartments || 0

        )

    ].join("\n");

}

/*----------------------------------------------------------
HIGHEST DIVISION COVERAGE
----------------------------------------------------------*/

function formatHighestDivisionCoverage(r){

    const d =
        r.data || r;

    return [

        "🟢 Highest Division Coverage",

        "",

        d.name ||

        d.division ||

        "-",

        "",

        "Coverage : " +

        Number(

            d.coverage || 0

        ).toFixed(2) +

        "%",

        "Visited Cells : " +

        (

            d.coveredCells || 0

        ) +

        "/" +

        (

            d.totalCells || 0

        ),

        "Compartments : " +

        (

            d.compartments || 0

        )

    ].join("\n");

}
    /*----------------------------------------------------------
NO PATROL
----------------------------------------------------------*/

function formatNoPatrol(r){

    const rows =
        r.data || [];

    if(
        !rows.length
    ){

        return
            "✅ Every compartment has patrol.";

    }

    let txt =
        "🚫 No Patrol Compartments\n\n";

    rows
        .slice(0,20)
        .forEach(

            c=>{

                txt +=

                    "• " +

                    (
                        c.compartment ||
                        "-"
                    ) +

                    "\n";

            }

        );

    if(

        rows.length > 20

    ){

        txt +=

            "\n... and " +

            (

                rows.length - 20

            ) +

            " more.";

    }

    txt +=

        "\n\nTotal : " +

        rows.length;

    return txt;

}

/*----------------------------------------------------------
HIGHEST DISTANCE
----------------------------------------------------------*/

function formatHighestDistance(r){

    const d =
        r.data || r;

    return [

        "🚶 Longest Patrol",

        "",

        d.compartment ||

        "-",

        "",

        "Distance : " +

        Number(

            d.patrolDistanceKm || 0

        ).toFixed(2) +

        " km",

        "Visits : " +

        (

            d.visits || 0

        )

    ].join("\n");

}

/*----------------------------------------------------------
TOP STAFF
----------------------------------------------------------*/

function formatTopStaff(r){

    const rows =
        r.data || [];

    let txt =
        "👮 Top Patrol Staff\n\n";

    rows
        .slice(0,10)
        .forEach(

            (s,i)=>{

                txt +=

                    (i+1)+". "+

                    (

                        s.name ||

                        "-"

                    )+

                    " — "+

                    Number(

                        s.distanceKm || 0

                    ).toFixed(2)+

                    " km\n";

            }

        );

    return txt;

}

/*----------------------------------------------------------
PATROL RANKING
----------------------------------------------------------*/

function formatPatrolRanking(r){

    const rows =
        r.data || [];

    let txt =
        "🏃 Patrol Ranking\n\n";

    rows
        .slice(0,10)
        .forEach(

            (x,i)=>{

                txt +=

                    (i+1)+". "+

                    (

                        x.compartment ||

                        "-"

                    )+

                    " — "+

                    Number(

                        x.patrolDistanceKm || 0

                    ).toFixed(2)+

                    " km\n";

            }

        );

    return txt;

}

/*----------------------------------------------------------
BEAT RANKING
----------------------------------------------------------*/

function formatBeatRanking(r){

    const rows =
        r.data || [];

    let txt =
        "🟢 Beat Ranking\n\n";

    rows
        .slice(0,10)
        .forEach(

            (x,i)=>{

                txt +=

                    (i+1)+". "+

                    x.name+

                    " ("+

                    Number(

                        x.coverage || 0

                    ).toFixed(2)+

                    "%)\n";

            }

        );

    return txt;

}

/*----------------------------------------------------------
RANGE RANKING
----------------------------------------------------------*/

function formatRangeRanking(r){

    const rows =
        r.data || [];

    let txt =
        "🟦 Range Ranking\n\n";

    rows
        .slice(0,10)
        .forEach(

            (x,i)=>{

                txt +=

                    (i+1)+". "+

                    x.name+

                    " ("+

                    Number(

                        x.coverage || 0

                    ).toFixed(2)+

                    "%)\n";

            }

        );

    return txt;

}

/*----------------------------------------------------------
DIVISION RANKING
----------------------------------------------------------*/

function formatDivisionRanking(r){

    const rows =
        r.data || [];

    let txt =
        "🟣 Division Ranking\n\n";

    rows
        .slice(0,10)
        .forEach(

            (x,i)=>{

                txt +=

                    (i+1)+". "+

                    x.name+

                    " ("+

                    Number(

                        x.coverage || 0

                    ).toFixed(2)+

                    "%)\n";

            }

        );

    return txt;

}
    /*----------------------------------------------------------
RANKING
----------------------------------------------------------*/

function formatRanking(r){

    const rows =
        r.data || [];

    let txt =
        "📊 Ranking\n\n";

    rows
        .slice(0,10)
        .forEach(

            (x,i)=>{

                txt +=

                    (i+1)+". "+

                    (

                        x.compartment ||

                        x.name ||

                        x.beat ||

                        x.range ||

                        x.division ||

                        "-"

                    );

                if(

                    x.coverage !== undefined

                ){

                    txt +=

                        " ("+

                        Number(

                            x.coverage || 0

                        ).toFixed(2)+

                        "%)";

                }

                txt += "\n";

            }

        );

    return txt;

}

/*----------------------------------------------------------
STATISTICS
----------------------------------------------------------*/

function formatStatistics(r){

    const s =
        r.data || r;

    return [

        "📊 Analytics Statistics",

        "",

        "Compartments : " +

        (s.compartments || 0),

        "Visited : " +

        (s.visited || 0),

        "Inactive : " +

        (s.inactive || 0),

        "Coverage : " +

        Number(

            s.coveragePercent || 0

        ).toFixed(2) +

        "%",

        "Total Visits : " +

        (s.totalVisits || 0),

        "Distance : " +

        Number(

            s.totalDistanceKm || 0

        ).toFixed(2) +

        " km",

        "Assigned Staff : " +

        (s.assignedStaff || 0),

        "Live Staff : " +

        (s.liveStaff || 0),

        "Active Patrols : " +

        (s.activePatrols || 0),

        "Completed Patrols : " +

        (s.completedPatrols || 0)

    ].join("\n");

}

/*----------------------------------------------------------
STAFF SEARCH
----------------------------------------------------------*/

/*----------------------------------------------------------
STAFF SEARCH
----------------------------------------------------------*/

function formatStaffProfile(r){

    const rows =
        Array.isArray(r.data)
            ? r.data
            : [];

    if(!rows.length){
        return "❌ No matching staff found.";
    }

    /*--------------------------------------------------
    SINGLE PROFILE
    --------------------------------------------------*/

    if(rows.length === 1){

        const p =
            rows[0];

        const analytics =
            p.analytics || {};

        const patrol =
            p.latestPatrol || {};

        const dutyStatus =
            p.dutyActive
                ? "🟢 Active"
                : "⚪ Inactive";

        const leader =
            p.leader ||
            p.patrolLeader ||
            patrol.leader ||
            "-";

        const team =
            p.team ||
            p.patrolTeam ||
            patrol.team ||
            "-";

        const session =
            p.patrolSessionId ||
            patrol.sessionId ||
            p.sessionId ||
            "-";

        const started =
            p.patrolStartedAt ||
            patrol.startedAt ||
            p.startedAt ||
            "-";

        const ended =
            p.patrolEndedAt ||
            patrol.endedAt ||
            "-";

        const distance =
            Number(
                p.patrolDistanceKm ??
                patrol.distanceKm ??
                analytics.distanceKm ??
                0
            );

        const beat =
            p.beat ||
            patrol.beat ||
            "-";

        const compartment =
            p.compartment ||
            patrol.compartment ||
            "-";

        const updated =
            p.updatedAt ||
            patrol.updatedAt ||
            p.lastSeen ||
            "-";

        return [

            "👤 STAFF PROFILE",

            "",

            "Name : " +
            (p.name || "-"),

            "Designation : " +
            (p.designation || "-"),

            "Role : " +
            (p.role || "-"),

            "Division : " +
            (p.division || "-"),

            "Range : " +
            (p.range || "-"),

            "Beat : " +
            beat,

            "Phone : " +
            (p.phone || "-"),

            "Email : " +
            (p.email || "-"),

            "",

            "Duty : " +
            dutyStatus,

            "Duty Type : " +
            (
                p.dutyType || "-"
            ),

            "Status : " +
            (
                p.status ||
                patrol.status ||
                "-"
            ),

            "",

            "Leader : " +
            leader,

            "Team : " +
            team,

            "Compartment : " +
            compartment,

            "Session : " +
            session,

            "",

            "Current Location : " +
            (
                p.location ||
                (
                    p.lat != null &&
                    p.lon != null
                        ? `${p.lat}, ${p.lon}`
                        : "-"
                )
            ),

            "Latitude : " +
            (
                p.lat ?? "-"
            ),

            "Longitude : " +
            (
                p.lon ?? "-"
            ),

            "Speed : " +
            Number(
                p.speed || 0
            ).toFixed(1) +
            " km/h",

            "Heading : " +
            Number(
                p.heading || 0
            ).toFixed(0) +
            "°",

            "Accuracy : " +
            (
                p.accuracy ?? "-"
            ),

            "Battery : " +
            (
                p.battery ?? "-"
            ),

            "Source : " +
            (
                p.source || "-"
            ),

            "Started : " +
            started,

            "Ended : " +
            ended,

            "Updated : " +
            updated,

            "",

            "Today's Patrols : " +
            (
                analytics.patrols || 0
            ),

            "Today's Distance : " +
            distance.toFixed(2) +
            " km",

            "Coverage : " +
            Number(
                analytics.coverage || 0
            ).toFixed(2) +
            "%",

            "Visits : " +
            (
                analytics.visits || 0
            ),

            "",

            "Latest Patrol : " +
            session,

            "Assigned Compartments : " +
            (
                p.assignedCompartments?.length ||
                p.compartments?.length ||
                0
            )

        ].join("\n");

    }

    /*--------------------------------------------------
    MULTIPLE STAFF
    --------------------------------------------------*/

    let txt =
        "👥 STAFF LIST\n\n";

    rows.forEach((p,i)=>{

        const patrol =
            p.latestPatrol || {};

        const beat =
            p.beat ||
            patrol.beat ||
            "-";

        const duty =
            p.dutyActive
                ? "🟢 Active"
                : "⚪ Inactive";

        txt +=
            (i+1) +
            ". " +
            (
                p.name ||
                "-"
            ) +
            "\n";

        txt +=
            "   Designation : " +
            (
                p.designation ||
                "-"
            ) +
            "\n";

        txt +=
            "   Role : " +
            (
                p.role ||
                "-"
            ) +
            "\n";

        txt +=
            "   Division : " +
            (
                p.division ||
                "-"
            ) +
            "\n";

        txt +=
            "   Range : " +
            (
                p.range ||
                "-"
            ) +
            "\n";

        txt +=
            "   Beat : " +
            beat +
            "\n";

        txt +=
            "   Phone : " +
            (
                p.phone ||
                "-"
            ) +
            "\n";

        txt +=
            "   Duty : " +
            duty +
            "\n";

        txt +=
            "   Duty Type : " +
            (
                p.dutyType ||
                "-"
            ) +
            "\n\n";

    });

    return txt;

}    /*----------------------------------------------------------
STAFF PHONE
----------------------------------------------------------*/

function formatStaffPhone(r){

    const p = r.data?.[0];

    if(!p){
        return "❌ Staff not found.";
    }

    return [

        "📞 PHONE NUMBER",

        "",

        p.name,

        "",

        p.phone || "Not Available"

    ].join("\n");

}

/*----------------------------------------------------------
STAFF EMAIL
----------------------------------------------------------*/

function formatStaffEmail(r){

    const p = r.data?.[0];

    if(!p){
        return "❌ Staff not found.";
    }

    return [

        "📧 EMAIL",

        "",

        p.name,

        "",

        p.email || "Not Available"

    ].join("\n");

}

/*----------------------------------------------------------
STAFF BEAT
----------------------------------------------------------*/

function formatStaffBeat(r){

    const p = r.data?.[0];

    if(!p){
        return "❌ Staff not found.";
    }

    return [

        "📍 BEAT",

        "",

        p.name,

        "",

        p.beat || "-"

    ].join("\n");

}

/*----------------------------------------------------------
STAFF RANGE
----------------------------------------------------------*/

function formatStaffRange(r){

    const p = r.data?.[0];

    if(!p){
        return "❌ Staff not found.";
    }

    return [

        "🌲 RANGE",

        "",

        p.name,

        "",

        p.range || "-"

    ].join("\n");

}

/*----------------------------------------------------------
STAFF DIVISION
----------------------------------------------------------*/

function formatStaffDivision(r){

    const p = r.data?.[0];

    if(!p){
        return "❌ Staff not found.";
    }

    return [

        "🗺 DIVISION",

        "",

        p.name,

        "",

        p.division || "-"

    ].join("\n");

}

/*----------------------------------------------------------
STAFF ROLE
----------------------------------------------------------*/

function formatStaffRole(r){

    const p = r.data?.[0];

    if(!p){
        return "❌ Staff not found.";
    }

    return [

        "👤 ROLE",

        "",

        p.name,

        "",

        p.role || p.designation || "-"

    ].join("\n");

}
    function formatStaffPosting(r){

    const p = r.data?.[0];

    if(!p){
        return "❌ Staff not found.";
    }

    return [

        "📍 POSTING DETAILS",

        "",

        p.name,

        "",

        "Beat : " + (p.beat || "-"),

        "Range : " + (p.range || "-"),

        "Division : " + (p.division || "-"),

        "Circle : " + (p.circle || "-")

    ].join("\n");

}

   function formatStaffLocation(r){

    const p = r.data?.[0];

    if(!p){
        return "❌ Staff not found.";
    }

    return [

        "📡 LIVE LOCATION",

        "",

        p.name,

        "",

        "Location : " +
        (
            p.location ||
            (
                p.lat && p.lon
                    ? `${p.lat}, ${p.lon}`
                    : "-"
            )
        ),

        "Latitude : " +
        (
            p.lat ?? "-"
        ),

        "Longitude : " +
        (
            p.lon ?? "-"
        ),

        "Accuracy : " +
        (
            p.accuracy ?? "-"
        ),

        "Speed : " +
        Number(
            p.speed || 0
        ).toFixed(1)
        +
        " km/h",

        "Heading : " +
        Number(
            p.heading || 0
        ).toFixed(0)
        +
        "°",

        "Status : " +
        (
            p.status || "-"
        ),

        "Source : " +
        (
            p.source || "-"
        ),

        "Session : " +
        (
            p.sessionId || "-"
        ),

        "Updated : " +
        (
            p.updatedAt || "-"
        )

    ].join("\n");

}
function formatStaffPatrol(r){

    const p =
        r.data?.[0];

    if(!p){
        return "❌ Staff not found.";
    }

    const patrol =
        p.latestPatrol || {};

    const distance =
        Number(
            p.patrolDistanceKm ??
            patrol.distanceKm ??
            p.analytics?.distanceKm ??
            0
        );

    const leader =
        p.leader ||
        p.patrolLeader ||
        patrol.leader ||
        "-";

    const team =
        p.team ||
        p.patrolTeam ||
        patrol.team ||
        "-";

    const session =
        p.patrolSessionId ||
        patrol.sessionId ||
        p.sessionId ||
        "-";

    const beat =
        p.beat ||
        patrol.beat ||
        "-";

    const compartment =
        p.compartment ||
        patrol.compartment ||
        "-";

    const started =
        p.patrolStartedAt ||
        patrol.startedAt ||
        "-";

    const ended =
        p.patrolEndedAt ||
        patrol.endedAt ||
        "-";

    return [

        "🛰 LATEST PATROL",

        "",

        "Name : " +
        (p.name || "-"),

        "",

        "Duty : " +
        (
            p.dutyActive
                ? "🟢 Active"
                : "⚪ Inactive"
        ),

        "Duty Type : " +
        (
            p.dutyType || "-"
        ),

        "Leader : " +
        leader,

        "Team : " +
        team,

        "Division : " +
        (
            p.division || "-"
        ),

        "Range : " +
        (
            p.range || "-"
        ),

        "Beat : " +
        beat,

        "Current Compartment : " +
        compartment,

        "",

        "Latest Session : " +
        session,

        "Patrol Distance : " +
        distance.toFixed(2) +
        " km",

        "Started : " +
        started,

        "Ended : " +
        ended,

        "",

        "Latitude : " +
        (
            p.lat ?? "-"
        ),

        "Longitude : " +
        (
            p.lon ?? "-"
        ),

        "Speed : " +
        Number(
            p.speed || 0
        ).toFixed(1) +
        " km/h",

        "Heading : " +
        Number(
            p.heading || 0
        ).toFixed(0) +
        "°",

        "Accuracy : " +
        (
            p.accuracy ?? "-"
        ),

        "Status : " +
        (
            p.status || "-"
        ),

        "Source : " +
        (
            p.source || "-"
        ),

        "Last Updated : " +
        (
            p.updatedAt ||
            p.lastSeen ||
            "-"
        )

    ].join("\n");

}
    function formatStaffCircle(r){

    const p = r.data?.[0];

    if(!p){
        return "❌ Staff not found.";
    }

    return [

        "⭕ CIRCLE",

        "",

        p.name,

        "",

        p.circle || "-"

    ].join("\n");

}
    function formatStaffStation(r){

    const p = r.data?.[0];

    if(!p){
        return "❌ Staff not found.";
    }

    return [

        "🏢 STATION",

        "",

        p.name,

        "",

        p.station || "-"

    ].join("\n");

}
    function formatStaffEmployeeId(r){

    const p = r.data?.[0];

    if(!p){
        return "❌ Staff not found.";
    }

    return [

        "🆔 EMPLOYEE ID",

        "",

        p.name,

        "",

        p.employeeId || "-"

    ].join("\n");

}
    /*----------------------------------------------------------
STAFF DUTY
----------------------------------------------------------*/

function formatStaffDuty(r){

    const p =
        r.data?.[0];

    if(!p){
        return "❌ Staff not found.";
    }

    const patrol =
        p.latestPatrol || {};

    const leader =
        p.leader ||
        p.patrolLeader ||
        patrol.leader ||
        "-";

    const team =
        p.team ||
        p.patrolTeam ||
        patrol.team ||
        "-";

    const session =
        p.patrolSessionId ||
        patrol.sessionId ||
        p.sessionId ||
        "-";

    const started =
        p.patrolStartedAt ||
        patrol.startedAt ||
        p.startedAt ||
        "-";

    const updated =
        p.updatedAt ||
        patrol.updatedAt ||
        p.lastSeen ||
        "-";

    const compartment =
        p.compartment ||
        patrol.compartment ||
        "-";

    const beat =
        p.beat ||
        patrol.beat ||
        "-";

    return [

        "🟢 DUTY STATUS",

        "",

        "Name : " +
        (p.name || "-"),

        "",

        "Duty : " +
        (
            p.dutyActive
                ? "🟢 Active"
                : "⚪ Inactive"
        ),

        "Duty Type : " +
        (
            p.dutyType || "-"
        ),

        "Status : " +
        (
            p.status ||
            patrol.status ||
            "-"
        ),

        "",

        "Leader : " +
        leader,

        "Team : " +
        team,

        "",

        "Division : " +
        (
            p.division || "-"
        ),

        "Range : " +
        (
            p.range || "-"
        ),

        "Beat : " +
        beat,

        "Compartment : " +
        compartment,

        "",

        "Session : " +
        session,

        "Started : " +
        started,

        "Last Seen : " +
        (
            p.lastSeen || "-"
        ),

        "Updated : " +
        updated,

        "",

        "Latitude : " +
        (
            p.lat ?? "-"
        ),

        "Longitude : " +
        (
            p.lon ?? "-"
        ),

        "Speed : " +
        Number(
            p.speed || 0
        ).toFixed(1) +
        " km/h",

        "Heading : " +
        Number(
            p.heading || 0
        ).toFixed(0) +
        "°",

        "Accuracy : " +
        (
            p.accuracy ?? "-"
        ),

        "Source : " +
        (
            p.source || "-"
        )

    ].join("\n");

}
/*----------------------------------------------------------
SESSION
----------------------------------------------------------*/

function formatSession(r){

    const s =
        r.data || r;

    if(

        !s

    ){

        return

            "Patrol session not found.";

    }

    return [

        "🛰 Patrol Session",

        "",

        "Staff : " +

        (

            s.cleanName ||

            s.name ||

            "-"

        ),

        "Session : " +

        (

            s.sessionId ||

            "-"

        ),

        "Beat : " +

        (

            s.beat ||

            "-"

        ),

        "Compartment : " +

        (

            s.compartment ||

            "-"

        ),

        "Status : " +

        (

            s.status ||

            "-"

        ),

        "Duty : " +

        (

            s.dutyType ||

            "-"

        )

    ].join("\n");

}

/*----------------------------------------------------------
SEARCH
----------------------------------------------------------*/

function formatSearch(r){

    const d =
        r.data || r;

    return JSON.stringify(

        d,

        null,

        2

    );

}

/*----------------------------------------------------------
SUMMARY
----------------------------------------------------------*/

function formatSummary(s){

    s =

        s.data ||

        s;

    return [

        "📊 Analytics Summary",

        "",

        "Compartments : "+

        (s.compartments ||

        s.totalCompartments ||

        0),

        "Visited : "+

        (s.visited ||

        s.visitedCompartments ||

        0),

        "Coverage : "+

        Number(

            s.coveragePercent ||

            s.averageCoverage ||

            0

        ).toFixed(2)+"%",

        "Distance : "+

        Number(

            s.totalDistanceKm ||

            0

        ).toFixed(2)+" km",

        "Visits : "+

        (

            s.totalVisits ||

            0

        )

    ].join("\n");

}

/*----------------------------------------------------------
ARRAY
----------------------------------------------------------*/

function formatArray(arr){

    return arr.map(

        x=>

        typeof x==="object"

        ?

        JSON.stringify(x)

        :

        String(x)

    ).join("\n");

}

/*----------------------------------------------------------
EXPORT
----------------------------------------------------------*/

window.GreenGuardAI.Formatter =
    Formatter;

console.log(

    "%cGreenGuard Formatter Loaded",

    "color:#00bcd4;font-weight:bold;"

);

})(window);
