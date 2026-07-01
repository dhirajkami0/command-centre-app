(function (window) {

    "use strict";

    window.GreenGuardAI =
        window.GreenGuardAI || {};

    const AnalyticsEngine =
        window.GreenGuardAI.AnalyticsEngine = window.GreenGuardAI.AnalyticsEngine || {};

    /*----------------------------------------------------------
    NORMALIZE QUERY
    ----------------------------------------------------------*/
    AnalyticsEngine.normalizeQuery = function (query) {
        return String(query || "")
            .trim()
            .toUpperCase();
    };

    /*----------------------------------------------------------
    HAS VALUE
    ----------------------------------------------------------*/
    AnalyticsEngine.hasValue = function (value) {
        return value !== undefined &&
               value !== null &&
               String(value).trim() !== "";
    };

    /*----------------------------------------------------------
    STAFF ENTITY EXTRACTION
    ----------------------------------------------------------*/
    AnalyticsEngine.extractStaffEntities = function (query) {
        const filters = {
            staff: AnalyticsEngine.extractStaff(query),
            circle: AnalyticsEngine.extractCircle(query),
            division: AnalyticsEngine.extractDivision(query),
            range: AnalyticsEngine.extractRange(query),
            beat: AnalyticsEngine.extractBeat(query),
            designation: AnalyticsEngine.extractDesignation(query),
            role: AnalyticsEngine.extractRole(query),
            dutyActive: AnalyticsEngine.extractDuty(query),
            dutyType: AnalyticsEngine.extractDutyType(query),
            leader: AnalyticsEngine.extractLeader(query),
            team: AnalyticsEngine.extractTeam(query),
            compartment: AnalyticsEngine.extractCompartment(query),
            date: AnalyticsEngine.extractDate(query)
        };

        console.log("🧩 Staff Entities", filters);

        return filters;
    };

    /*----------------------------------------------------------
    EXTRACT STAFF
    ----------------------------------------------------------*/
    AnalyticsEngine.extractStaff = function (query) {
        const text = AnalyticsEngine.normalizeQuery(query);
        const index = AnalyticsEngine.staffSearchIndex || {};

        let best = "";
        let bestLength = 0;

        Object.keys(index).forEach(function (key) {
            if (text.includes(key)) {
                if (key.length > bestLength) {
                    best = key;
                    bestLength = key.length;
                }
            }
        });

        if (!best) {
            return "";
        }
        return index[best];
    };

    /*----------------------------------------------------------
    EXTRACT CIRCLE
    ----------------------------------------------------------*/
    AnalyticsEngine.extractCircle = function (query) {
        const text = AnalyticsEngine.normalizeQuery(query);
        const index = AnalyticsEngine.circleIndex || {};

        let result = "";

        Object.keys(index).some(function (name) {
            if (text.includes(String(name).toUpperCase())) {
                result = name;
                return true;
            }
            return false;
        });

        return result;
    };

    /*----------------------------------------------------------
    EXTRACT DIVISION
    ----------------------------------------------------------*/
    AnalyticsEngine.extractDivision = function (query) {
        const text = AnalyticsEngine.normalizeQuery(query);
        const index = AnalyticsEngine.divisionIndex || {};

        let result = "";

        Object.keys(index).some(function (name) {
            if (text.includes(String(name).toUpperCase())) {
                result = name;
                return true;
            }
            return false;
        });

        return result;
    };

    /*----------------------------------------------------------
    EXTRACT RANGE
    ----------------------------------------------------------*/
    AnalyticsEngine.extractRange = function (query) {
        const text = AnalyticsEngine.normalizeQuery(query);
        const index = AnalyticsEngine.rangeIndex || {};

        let result = "";

        Object.keys(index).some(function (name) {
            if (text.includes(String(name).toUpperCase())) {
                result = name;
                return true;
            }
            return false;
        });

        return result;
    };

    /*----------------------------------------------------------
    EXTRACT BEAT
    ----------------------------------------------------------*/
    AnalyticsEngine.extractBeat = function (query) {
        const text = AnalyticsEngine.normalizeQuery(query);
        const index = AnalyticsEngine.beatIndex || {};

        let result = "";
        let longest = 0;

        Object.keys(index).forEach(function (name) {
            const upper = String(name).toUpperCase();
            if (text.includes(upper)) {
                if (upper.length > longest) {
                    longest = upper.length;
                    result = name;
                }
            }
        });

        return result;
    };

    /*----------------------------------------------------------
    PLACEHOLDER EXTRACTORS
    ----------------------------------------------------------*/
    /*----------------------------------------------------------
EXTRACT DESIGNATION
----------------------------------------------------------*/

AnalyticsEngine.extractDesignation = function (query) {

    const text =
        AnalyticsEngine.normalizeQuery(query);

    const aliases =
        AnalyticsEngine.designationAliases || {};

    for (const code in aliases) {

        const list = aliases[code];

        for (let i = 0; i < list.length; i++) {

            if (

                text.includes(

                    String(list[i]).toUpperCase()

                )

            ) {

                return code;

            }

        }

    }

    return "";

};
    /*----------------------------------------------------------
EXTRACT ROLE
----------------------------------------------------------*/

AnalyticsEngine.extractRole = function (query) {

    const text =
        AnalyticsEngine.normalizeQuery(query);

    const aliases =
        AnalyticsEngine.roleAliases || {};

    for (const code in aliases) {

        const list =
            aliases[code];

        for (let i = 0; i < list.length; i++) {

            if (

                text.includes(

                    String(list[i]).toUpperCase()

                )

            ) {

                return code;

            }

        }

    }

    return "";

};
/*----------------------------------------------------------
EXTRACT DUTY STATUS
----------------------------------------------------------*/

AnalyticsEngine.extractDuty = function (query) {

    const text =
        AnalyticsEngine.normalizeQuery(query);

    if (

        /\b(ON DUTY|ACTIVE|LIVE|CURRENT DUTY)\b/.test(text)

    ) {

        return true;

    }

    if (

        /\b(OFF DUTY|INACTIVE)\b/.test(text)

    ) {

        return false;

    }

    return null;

};
  /*----------------------------------------------------------
EXTRACT DUTY TYPE
----------------------------------------------------------*/

AnalyticsEngine.extractDutyType = function (query) {

    const text =
        AnalyticsEngine.normalizeQuery(query);

    if (

        text.includes("FOOT")

    ) {

        return "Foot Patrolling";

    }

    if (

        text.includes("VEHICLE")

    ) {

        return "Vehicle Patrolling";

    }

    if (

        text.includes("DEPREDATION")

    ) {

        return "Depredation Duty";

    }

    if (

        text.includes("ENQUIRY")

    ) {

        return "Enquiry";

    }

    if (

        text.includes("NAKA")

    ) {

        return "Naka Duty";

    }

    return "";

};
  /*----------------------------------------------------------
EXTRACT LEADER
----------------------------------------------------------*/

AnalyticsEngine.extractLeader = function (query) {

    const text =
        AnalyticsEngine.normalizeQuery(query);

    const rows =
        Object.values(
            AnalyticsEngine.staffIndex || {}
        );

    let best = "";
    let longest = 0;

    rows.forEach(function (staff) {

        if (!staff.name) return;

        const name =
            AnalyticsEngine.normalizeQuery(
                staff.name
            );

        if (

            text.includes(name)

        ){

            if (

                /TEAM|UNDER|LEADER/i.test(text)

            ){

                if (

                    name.length > longest

                ){

                    longest = name.length;

                    best = staff.cleanName || staff.name;

                }

            }

        }

    });

    return best;

};
  /*----------------------------------------------------------
EXTRACT TEAM
----------------------------------------------------------*/

AnalyticsEngine.extractTeam = function (query) {

    const text =
        AnalyticsEngine.normalizeQuery(query);

    const rows =
        Object.values(
            AnalyticsEngine.staffIndex || {}
        );

    let best = "";
    let longest = 0;

    rows.forEach(function (staff) {

        if (!staff.team) return;

        const team =
            AnalyticsEngine.normalizeQuery(
                staff.team
            );

        if (

            text.includes(team)

        ){

            if (

                team.length > longest

            ){

                longest = team.length;

                best = staff.team;

            }

        }

    });

    return best;

};
  
  /*----------------------------------------------------------
EXTRACT COMPARTMENT
----------------------------------------------------------*/

AnalyticsEngine.extractCompartment = function (query) {

    const text =
        AnalyticsEngine.normalizeQuery(query);

    const rows =
        Object.values(
            AnalyticsEngine.staffIndex || {}
        );

    const seen = {};

    let best = "";
    let longest = 0;

    rows.forEach(function (staff) {

        const c =
            String(
                staff.compartment || ""
            ).trim();

        if (!c) return;

        if (seen[c]) return;

        seen[c] = true;

        const upper =
            c.toUpperCase();

        if (

            text.includes(upper)

        ){

            if (

                upper.length > longest

            ){

                longest = upper.length;

                best = c;

            }

        }

    });

    return best;

};
  /*----------------------------------------------------------
EXTRACT DATE
----------------------------------------------------------*/

AnalyticsEngine.extractDate = function (query) {

    const text =
        AnalyticsEngine.normalizeQuery(query);

    if (text.includes("TODAY")) {

        return {

            type: "today"

        };

    }

    if (text.includes("YESTERDAY")) {

        return {

            type: "yesterday"

        };

    }

    if (

        text.includes("THIS WEEK")

    ){

        return {

            type: "thisWeek"

        };

    }

    if (

        text.includes("LAST WEEK")

    ){

        return {

            type: "lastWeek"

        };

    }

    if (

        text.includes("THIS MONTH")

    ){

        return {

            type: "thisMonth"

        };

    }

    if (

        text.includes("LAST MONTH")

    ){

        return {

            type: "lastMonth"

        };

    }

    const m =
        text.match(

            /\b(\d{4})-(\d{2})-(\d{2})\b/

        );

    if (m) {

        return {

            type: "date",

            value: m[0]

        };

    }

    return null;

};
})(window);
