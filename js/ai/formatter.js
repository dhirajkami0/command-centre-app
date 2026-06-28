/*!
 * GreenGuard AI
 * formatter.js
 * Version : 2.0.0
 */

(function (window) {

"use strict";

window.GreenGuardAI =
    window.GreenGuardAI || {};

if (
    window.GreenGuardAI.Formatter
) {
    return;
}

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
case "highestdistance":
    return formatHighestDistance(result);
            case "summary":
                return formatSummary(result);

            case "staffsearch":
                return formatStaffSearch(result);

            case "session":
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

function formatStaffSearch(r){

    const rows =
        r.data || [];

    if(

        !rows.length

    ){

        return

            "No matching staff found.";

    }

    let txt =
        "👮 Staff Search\n\n";

    rows.forEach(

        row=>{

            txt +=

                "• " +

                (

                    row.compartment ||

                    "-"

                ) +

                " (" +

                (

                    row.beat ||

                    "-"

                ) +

                ")\n";

        }

    );

    return txt;

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
