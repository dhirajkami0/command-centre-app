/*!
 * GreenGuard AI
 * formatter.js
 * Version : 1.0.0
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

            case "nopatrol":
                return formatNoPatrol(result);

            case "topstaff":
                return formatTopStaff(result);

            case "ranking":
                return formatRanking(result);

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

};

/*----------------------------------------------------------
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

    let text =
        "📉 Least Visited Compartments\n\n";

    rows.forEach(

        (x,i)=>{

            text +=

                (i+1)+". "+x.compartment+

                " ("+

                x.visits+

                " visits)\n";

        }

    );

    return text;

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

        d.beat ||

        d.range ||

        d.division ||

        "-",

        "",

        "Coverage : "+

        Number(

            d.coverage || 0

        ).toFixed(2)+"%",

        "Visited Cells : "+

        (

            d.coveredCells || 0

        )+"/"+(

            d.totalCells || 0

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

    rows.forEach(

        c=>{

            txt +=

                "• "+

                c.compartment+

                "\n";

        }

    );

    return txt;

}

/*----------------------------------------------------------
TOP STAFF
----------------------------------------------------------*/

function formatTopStaff(r){

    const rows =
        r.data || [];

    let txt =
        "👮 Top Patrol Staff\n\n";

    rows.forEach(

        (s,i)=>{

            txt +=

                (i+1)+". "+

                s.name+

                " ("+

                Number(

                    s.distanceKm || 0

                ).toFixed(2)+

                " km)\n";

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

    rows.forEach(

        (x,i)=>{

            txt +=

                (i+1)+". "+

                (

                    x.compartment ||

                    x.beat ||

                    x.range ||

                    x.division

                )+

                "\n";

        }

    );

    return txt;

}

/*----------------------------------------------------------
SUMMARY
----------------------------------------------------------*/

function formatSummary(s){

    return [

        "📊 Analytics Summary",

        "",

        "Compartments : "+

        (s.totalCompartments || 0),

        "Visited : "+

        (s.visitedCompartments || 0),

        "Coverage : "+

        Number(

            s.averageCoverage || 0

        ).toFixed(2)+"%",

        "Distance : "+

        Number(

            s.totalDistanceKm || 0

        ).toFixed(2)+" km",

        "Visits : "+

        (s.totalVisits || 0)

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
