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
case "staffdesignation":

    return formatStaffDesignation(result);

case "designationsummary":

    return formatDesignationSummary(result);
case "staffstrength":

    return formatStaffStrengthSummary(result);
case "staffdirectory":

    return formatStaffStrengthSummary(result);
     case "rolewisestrength":

    return formatRoleWiseStrength(result);

case "designationwisestrength":

    return formatDesignationWiseStrength(result);         
case "staffrole":

    return formatStaffRole(result);
case "staffposting":
    return formatStaffPosting(result);

case "stafflocation":
    return formatStaffLocation(result);

case "staffpatrol":

    return formatStaffPatrol(result);

case "patroldistance":

    return formatPatrolDistance(result);

case "patroldutytype":

    return formatPatrolDutyType(result);

case "patrolsession":

    return formatPatrolSession(result);

case "patrolpointcount":

    return formatPatrolPointCount(result);

case "patrolstarted":

    return formatPatrolStarted(result);

case "patrolended":

    return formatPatrolEnded(result);

case "patrolduration":

    return formatPatrolDuration(result);

case "patrolstatus":

    return formatPatrolStatus(result);

case "patrolsource":

    return formatPatrolSource(result);

case "patrolleader":

    return formatPatrolLeader(result);

case "patrolteam":

    return formatPatrolTeam(result);

case "patrolbeat":

    return formatPatrolBeat(result);

case "patrolrange":

    return formatPatrolRange(result);

case "patroldivision":

    return formatPatrolDivision(result);

case "patrolcompartment":

    return formatPatrolCompartment(result);

case "patrolcompartments":

    return formatPatrolCompartments(result);

case "patroltrack":

    return formatPatrolTrack(result);

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

    return formatDrawPatrol(result);
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
function formatPatrolCompartments(r){

    const p =
        r.data?.[0];

    if(!p){
        return "❌ Staff not found.";
    }

    const compartments =
        p.patrolCompartments ||
        p.latestPatrol?.compartments ||
        [];

    return [

        "📍 VISITED COMPARTMENTS",

        "",

        "Name : " +
        (p.name || "-"),

        "",

        Array.isArray(compartments) &&
        compartments.length

            ? compartments.join("\n")

            : "No compartment data"

    ].join("\n");

}

    /*----------------------------------------------------------
STAFF STRENGTH SUMMARY
----------------------------------------------------------*/

function formatStaffStrengthSummary(result){

    const data =
        result.data || {};

    const staff =
        Array.isArray(
            data.staff
        )
        ? data.staff
        : [];

    if(!staff.length){

        return "❌ No matching staff found.";

    }

    const first =
        staff[0];

    const out = [];

    out.push(
        "👥 STAFF STRENGTH"
    );

    out.push("");

    if(first.circle){

        out.push(
            "Circle : " +
            first.circle
        );

    }

    if(first.division){

        out.push(
            "Division : " +
            first.division
        );

    }

    if(first.range){

        out.push(
            "Range : " +
            first.range
        );

    }

    if(first.beat){

        out.push(
            "Beat : " +
            first.beat
        );

    }

    out.push("");

    out.push(
        "Total Staff : " +
        (
            data.total || 0
        )
    );

    out.push(
        "Active : " +
        (
            data.active || 0
        )
    );

    out.push(
        "Inactive : " +
        (
            data.inactive || 0
        )
    );

    out.push("");

    out.push(
        "ROLE SUMMARY"
    );

    out.push("");

    Object.entries(

        data.roles || {}

    ).forEach(function(r){

        out.push(

            r[0] +

            " : " +

            r[1]

        );

    });

    out.push("");

    out.push(
        "DESIGNATION SUMMARY"
    );

    out.push("");

    Object.entries(

        data.designations || {}

    ).forEach(function(d){

        out.push(

            d[0] +

            " : " +

            d[1]

        );

    });

    out.push("");

    out.push(
        "STAFF"
    );

    out.push("");

    staff.forEach(function(p,index){

        out.push(

            (index+1)+". "+

            (p.name || "-")

        );

        out.push(

            "   " +

            (
                p.designation || "-"
            ) +

            " | " +

            (
                p.role || "-"
            )

        );

        out.push(

            "   " +

            (
                p.beat || "-"
            )

        );

        out.push("");

    });

    return out.join("\n");

}

    
    /*----------------------------------------------------------
ROLE WISE STAFF
----------------------------------------------------------*/

function formatRoleWiseStrength(result){

    const rows =

        Array.isArray(result.data)

            ? result.data

            : [];

    if(!rows.length){

        return "❌ No matching staff found.";

    }

    const out = [];

    out.push(
        "👥 ROLE WISE STAFF"
    );

    out.push("");

    rows.forEach(function(r){

        out.push(

            r.role +

            " : " +

            r.total

        );

        out.push(

            "   Active : " +

            r.active

        );

        out.push(

            "   Inactive : " +

            r.inactive

        );

        out.push("");

    });

    return out.join("\n");

}


/*----------------------------------------------------------
DESIGNATION WISE STAFF
----------------------------------------------------------*/

function formatDesignationWiseStrength(result){

    const rows =

        Array.isArray(result.data)

            ? result.data

            : [];

    if(!rows.length){

        return "❌ No matching staff found.";

    }

    const out = [];

    out.push(
        "👮 DESIGNATION WISE STAFF"
    );

    out.push("");

    rows.forEach(function(r){

        out.push(

            r.designation +

            " : " +

            r.total

        );

        out.push(

            "   Active : " +

            r.active

        );

        out.push(

            "   Inactive : " +

            r.inactive

        );

        out.push("");

    });

    return out.join("\n");

}
    
    function formatStaffDesignation(r){

    const p =
        r.data?.[0];

    if(!p){

        return "❌ Staff not found.";

    }

    return [

        "👤 DESIGNATION",

        "",

        "Name : " +
        (
            p.name ||
            "-"
        ),

        "",

        "Designation : " +
        (
            p.designation ||
            "-"
        )

    ].join("\n");

}
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
DESIGNATION SUMMARY
----------------------------------------------------------*/

function formatDesignationSummary(result){

    const data =
        result.data || {};

    const staff =
        Array.isArray(data.staff)
            ? data.staff
            : [];

    if(!staff.length){

        return "❌ No matching staff found.";

    }

    const first =
        staff[0];

    const designation =
        first.designation || "-";

    const lines = [];

    lines.push("👮 DESIGNATION SUMMARY");

    lines.push("");

    lines.push(
        "Designation : " +
        designation
    );

    if(first.circle){

        lines.push(
            "Circle : " +
            first.circle
        );

    }

    if(first.division){

        lines.push(
            "Division : " +
            first.division
        );

    }

    if(first.range){

        lines.push(
            "Range : " +
            first.range
        );

    }

    if(first.beat){

        lines.push(
            "Beat : " +
            first.beat
        );

    }

    lines.push("");

    lines.push(
        "Total : " +
        data.total
    );

    lines.push("");

    staff.forEach(function(s,index){

        lines.push(

            (index+1)+". "+

            (s.name || "-")

        );

    });

    return lines.join("\n");

}
/*----------------------------------------------------------
STAFF ROLE
----------------------------------------------------------*/

function formatStaffRole(r){

    const p =
        r.data?.[0];

    if(!p){

        return "❌ Staff not found.";

    }

    return [

        "👤 ROLE",

        "",

        "Name : " +
        (
            p.name ||
            "-"
        ),

        "",

        "Role : " +
        (
            p.role ||
            "-"
        )

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

    const range =
        p.range ||
        patrol.range ||
        "-";

    const division =
        p.division ||
        patrol.division ||
        "-";

    const compartment =
        p.compartment ||
        patrol.compartment ||
        "-";

    const compartments =
        p.patrolCompartments ||
        patrol.compartments ||
        [];

    const started =
        p.patrolStartedAt ||
        patrol.startedAt ||
        "-";

    const ended =
        p.patrolEndedAt ||
        patrol.endedAt ||
        "-";

    const status =
        p.patrolStatus ||
        p.status ||
        patrol.status ||
        "-";

    const dutyType =
        p.patrolDutyType ||
        p.dutyType ||
        patrol.dutyType ||
        "-";

    const pointCount =
        p.patrolPointCount ??
        patrol.pointCount ??
        0;

    const source =
        p.patrolSource ||
        p.source ||
        patrol.source ||
        "-";

    const updated =
        p.updatedAt ||
        patrol.updatedAt ||
        p.lastSeen ||
        "-";

    const track =
        p.patrolTrack ||
        patrol.simplifiedTrack ||
        patrol.track ||
        [];

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
        dutyType,

        "Status : " +
        status,

        "",

        "Leader : " +
        leader,

        "Team : " +
        team,

        "",

        "Division : " +
        division,

        "Range : " +
        range,

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

        "Point Count : " +
        pointCount,

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

        "",

        "Source : " +
        source,

        "Last Updated : " +
        updated,

        "",

        "Visited Compartments : " +
        (
            Array.isArray(compartments)
                ? compartments.join(", ")
                : "-"
        ),

        "Track Points : " +
        (
            Array.isArray(track)
                ? track.length
                : 0
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
    function formatPatrolDistance(r){

    const p=r.data?.[0];

    if(!p) return "❌ Staff not found.";

    return [

        "🚶 PATROL DISTANCE",

        "",

        "Name : "+p.name,

        "",

        "Distance : "+Number(
            p.patrolDistanceKm ??
            p.latestPatrol?.distanceKm ??
            0
        ).toFixed(2)+" km"

    ].join("\n");

}
    function formatPatrolSession(r){

    const p=r.data?.[0];

    if(!p) return "❌ Staff not found.";

    return [

        "🛰 PATROL SESSION",

        "",

        "Name : "+p.name,

        "",

        "Session : "+(
            p.patrolSessionId ??
            p.latestPatrol?.sessionId ??
            "-"
        )

    ].join("\n");

}
    function formatPatrolPointCount(r){

    const p=r.data?.[0];

    if(!p) return "❌ Staff not found.";

    return [

        "📍 PATROL POINTS",

        "",

        "Name : "+p.name,

        "",

        "Point Count : "+(
            p.patrolPointCount ??
            p.latestPatrol?.pointCount ??
            0
        )

    ].join("\n");

}

    function formatPatrolStarted(r){

    const p=r.data?.[0];

    if(!p) return "❌ Staff not found.";

    return [

        "▶ PATROL START",

        "",

        "Name : "+p.name,

        "",

        "Started : "+(
            p.patrolStartedAt ??
            p.latestPatrol?.startedAt ??
            "-"
        )

    ].join("\n");

}
    
    function formatPatrolEnded(r){

    const p=r.data?.[0];

    if(!p) return "❌ Staff not found.";

    return [

        "⏹ PATROL END",

        "",

        "Name : "+p.name,

        "",

        "Ended : "+(
            p.patrolEndedAt ??
            p.latestPatrol?.endedAt ??
            "-"
        )

    ].join("\n");

}
    
    function formatPatrolStatus(r){

    const p=r.data?.[0];

    if(!p) return "❌ Staff not found.";

    return [

        "🟢 PATROL STATUS",

        "",

        "Name : "+p.name,

        "",

        "Status : "+(
            p.patrolStatus ??
            p.status ??
            "-"
        )

    ].join("\n");

}
    function formatPatrolSource(r){

    const p=r.data?.[0];

    if(!p) return "❌ Staff not found.";

    return [

        "📡 PATROL SOURCE",

        "",

        "Name : "+p.name,

        "",

        "Source : "+(
            p.patrolSource ??
            p.source ??
            "-"
        )

    ].join("\n");

}
    
    function formatPatrolLeader(r){

    const p=r.data?.[0];

    if(!p) return "❌ Staff not found.";

    return [

        "👮 PATROL LEADER",

        "",

        "Leader : "+(
            p.patrolLeader ??
            p.leader ??
            "-"
        )

    ].join("\n");

}
    
    function formatPatrolTeam(r){

    const p=r.data?.[0];

    if(!p) return "❌ Staff not found.";

    return [

        "👥 PATROL TEAM",

        "",

        "Team : "+(
            p.patrolTeam ??
            p.team ??
            "-"
        )

    ].join("\n");

}
    
    function formatPatrolBeat(r){

    const p=r.data?.[0];

    if(!p) return "❌ Staff not found.";

    return "📍 Beat : "+(
        p.beat ??
        p.latestPatrol?.beat ??
        "-"
    );

}
    
    function formatPatrolRange(r){

    const p=r.data?.[0];

    if(!p) return "❌ Staff not found.";

    return "🌲 Range : "+(
        p.range ??
        p.latestPatrol?.range ??
        "-"
    );

}
    
    function formatPatrolDivision(r){

    const p=r.data?.[0];

    if(!p) return "❌ Staff not found.";

    return "🗺 Division : "+(
        p.division ??
        p.latestPatrol?.division ??
        "-"
    );

}
    
    function formatPatrolCompartment(r){

    const p=r.data?.[0];

    if(!p) return "❌ Staff not found.";

    return "📍 Compartment : "+(
        p.compartment ??
        p.latestPatrol?.compartment ??
        "-"
    );

}
    
    function formatPatrolTrack(r){

    const p=r.data?.[0];

    if(!p) return "❌ Staff not found.";

    return [

        "🛰 TRACK",

        "",

        "Track Points : "+(

            Array.isArray(p.patrolTrack)

                ? p.patrolTrack.length

                : 0

        )

    ].join("\n");

}
    
    function formatPatrolDutyType(r){

    const p=r.data?.[0];

    if(!p) return "❌ Staff not found.";

    return [

        "🟢 DUTY TYPE",

        "",

        "Duty Type : "+(
            p.patrolDutyType ??
            p.dutyType ??
            "-"
        )

    ].join("\n");

}
    function formatPatrolDuration(r){

    const p=r.data?.[0];

    if(!p) return "❌ Staff not found.";

    return [

        "⏱ PATROL DURATION",

        "",

        "Started : "+(
            p.patrolStartedAt ??
            "-"
        ),

        "Ended : "+(
            p.patrolEndedAt ??
            "-"
        )

    ].join("\n");

}/*----------------------------------------------------------
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
DRAW PATROL
----------------------------------------------------------*/

/*----------------------------------------------------------
DRAW PATROL
----------------------------------------------------------*/

function formatDrawPatrol(r){

    let p = null;

    if(Array.isArray(r.data)){

        p = r.data[0];

    }
    else{

        p = r.data || r;

    }

    if(!p){

        return "🛰 Patrol track opened.";

    }

    const patrol =
        p.latestPatrol || p;

    return [

        "🛰 PATROL TRACK",

        "",

        "Drawing patrol for",

        "",

        p.name ||
        patrol.name ||
        "-",

        "",

        "Session : " +
        (
            p.patrolSessionId ||
            patrol.sessionId ||
            "-"
        ),

        "Beat : " +
        (
            p.beat ||
            patrol.beat ||
            "-"
        ),

        "Compartment : " +
        (
            p.compartment ||
            patrol.compartment ||
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
