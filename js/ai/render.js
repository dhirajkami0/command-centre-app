/*!
 * GreenGuard AI
 * render.js
 * Version : 1.0.0
 * Production Safe
 *
 * Depends:
 *   GreenGuardAI.Config
 */

(function(window){

"use strict";

/*----------------------------------------------------------
  Namespace
----------------------------------------------------------*/

window.GreenGuardAI =
    window.GreenGuardAI || {};

if(window.GreenGuardAI.Render){

    console.warn(
        "[GreenGuardAI] Render already loaded."
    );

    return;

}

/*----------------------------------------------------------
  Dependency Check
----------------------------------------------------------*/

if(!window.GreenGuardAI.Config){

    console.error(
        "[GreenGuardAI] Config missing."
    );

    return;

}

const Config =
    window.GreenGuardAI.Config;

const Render = {};

/*----------------------------------------------------------
  Private State
----------------------------------------------------------*/

let ready=false;

let container=null;

let messageCount=0;

let lastMessage=null;

let autoScroll=true;

let markdownEnabled=true;

     /*----------------------------------------------------------
      INIT
    ----------------------------------------------------------*/

    Render.init = function (

        element

    ) {

        if (ready)
            return true;

        if (

            typeof element ===

            "string"

        ) {

            container =

                document.getElementById(

                    element

                );

        }

        else {

            container =

                element;

        }

        if (!container) {

            Config.error(

                "Render",

                "Container not found."

            );

            return false;

        }

        ready = true;

        Config.log(

            "Render",

            "Initialized"

        );

        return true;

    };

/*=========================================================
 MASTER RENDERER
=========================================================*/

Render.render = function (response) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !response ||

        typeof response !== "object"

    ) {

        return Render.renderError({

            message:

                "Invalid response."

        });

    }

    /*----------------------------------
      Failed Response
    ----------------------------------*/

    if (

        response.success === false

    ) {

        return Render.renderError(

            response

        );

    }

    /*----------------------------------
      Cards
    ----------------------------------*/

    if (

        Array.isArray(

            response.cards

        ) &&

        response.cards.length

    ) {

        Render.renderCards(

            response.cards

        );

    }

    /*----------------------------------
      Tables
    ----------------------------------*/

    if (

        Array.isArray(

            response.tables

        ) &&

        response.tables.length

    ) {

        Render.renderTable(

            response.tables

        );

    }

    /*----------------------------------
      Sections
    ----------------------------------*/

    if (

        Array.isArray(

            response.sections

        ) &&

        response.sections.length

    ) {

        Render.renderSections(

            response.sections

        );

    }

    /*----------------------------------
      Analytics
    ----------------------------------*/

    if (

        response.analytics

    ) {

        Render.renderAnalytics(

            response.analytics

        );

    }

    /*----------------------------------
      Map
    ----------------------------------*/

    if (

        response.map

    ) {

        Render.renderMap(

            response.map

        );

    }

    /*----------------------------------
      Charts
    ----------------------------------*/

    if (

        response.chart

    ) {

        Render.renderChart(

            response.chart

        );

    }

    /*----------------------------------
      Action Buttons
    ----------------------------------*/

    if (

        Array.isArray(

            response.buttons

        ) &&

        response.buttons.length

    ) {

        Render.renderButtons(

            response.buttons

        );

    }

    /*----------------------------------
      Markdown / Text
    ----------------------------------*/

    if (

        response.markdown

    ) {

        Render.renderText(

            response.markdown

        );

    }

    else if (

        response.message

    ) {

        Render.renderText(

            response.message

        );

    }

};
  /*=========================================================
 RENDER TEXT
=========================================================*/

Render.renderText = function (

    text,

    role = "assistant"

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        text === undefined ||

        text === null

    ) {

        return null;

    }

    /*----------------------------------
      Normalize
    ----------------------------------*/

    if (

        typeof text !== "string"

    ) {

        text =

            String(

                text

            );

    }

    text =

        text.trim();

    if (

        !text

    ) {

        return null;

    }

    /*----------------------------------
      Render
    ----------------------------------*/

    const message =

        Render.appendMessage(

            role,

            text

        );

    /*----------------------------------
      Copy Button
    ----------------------------------*/

    if (

        message

    ) {

        Render.enableCopy(

            message,

            text

        );

    }

    return message;

};
  /*=========================================================
 RENDER CARDS
=========================================================*/

Render.renderCards = function (

    cards

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !Array.isArray(

            cards

        ) ||

        !cards.length

    ) {

        return;

    }

    /*----------------------------------
      Render Each Card
    ----------------------------------*/

    cards.forEach(

        function (

            card

        ) {

            if (

                !card ||

                typeof card !== "object"

            ) {

                return;

            }

            switch (

                card.type

            ) {

                /*==================================
                  STAFF
                ==================================*/

                case "staff-profile":

                    Render.renderStaffProfile(

                        card

                    );

                    break;

                case "staff-directory":

                    Render.renderStaffDirectory(

                        card

                    );

                    break;

                case "staff-posting":

                    Render.renderStaffPosting(

                        card

                    );

                    break;

                case "staff-location":

                    Render.renderStaffLocation(

                        card

                    );

                    break;

                case "staff-duty":

                    Render.renderStaffDuty(

                        card

                    );

                    break;

                case "staff-gps":

                    Render.renderStaffGPS(

                        card

                    );

                    break;

                case "staff-team":

                    Render.renderStaffTeam(

                        card

                    );

                    break;

                case "staff-strength":

                    Render.renderStaffStrength(

                        card

                    );

                    break;

                case "staff-analytics":

                    Render.renderStaffAnalytics(

                        card

                    );

                    break;

                /*==================================
                  GIS
                ==================================*/

                case "gis":

                    Render.renderGIS(

                        card

                    );

                    break;

                /*==================================
                  Wildlife
                ==================================*/

                case "wildlife":

                    Render.renderWildlife(

                        card

                    );

                    break;

                /*==================================
                  Patrol
                ==================================*/

                case "patrol":

                    Render.renderPatrol(

                        card

                    );

                    break;

                /*==================================
                  Fire
                ==================================*/

                case "fire":

                    Render.renderFire(

                        card

                    );

                    break;

                /*==================================
                  Generic
                ==================================*/

                default:

                    Render.renderUnknownCard(

                        card

                    );

                    break;

            }

        }

    );

};/*=========================================================
 RENDER GENERIC CARD
=========================================================*/

Render.renderCard = function (

    options = {}

) {

    /*----------------------------------
      Create Card
    ----------------------------------*/

    const card =

        document.createElement(

            "div"

        );

    card.className =

        "gg-ai-card";

    /*----------------------------------
      Header
    ----------------------------------*/

    if (

        options.title ||

        options.icon

    ) {

        const header =

            document.createElement(

                "div"

            );

        header.className =

            "gg-ai-card-header";

        header.innerHTML =

            (

                options.icon || ""

            ) +

            "<span>" +

            escapeHTML(

                options.title || ""

            ) +

            "</span>";

        card.appendChild(

            header

        );

    }

    /*----------------------------------
      Body
    ----------------------------------*/

    const body =

        document.createElement(

            "div"

        );

    body.className =

        "gg-ai-card-body";

    /*----------------------------------
      Custom HTML
    ----------------------------------*/

    if (

        options.html

    ) {

        body.innerHTML =

            options.html;

    }

    /*----------------------------------
      Text
    ----------------------------------*/

    else if (

        options.text

    ) {

        body.innerHTML =

            markdown(

                options.text

            );

    }

    card.appendChild(

        body

    );

    /*----------------------------------
      Footer
    ----------------------------------*/

    if (

        options.footer

    ) {

        const footer =

            document.createElement(

                "div"

            );

        footer.className =

            "gg-ai-card-footer";

        footer.innerHTML =

            options.footer;

        card.appendChild(

            footer

        );

    }

    /*----------------------------------
      Add To Container
    ----------------------------------*/

    if (

        container

    ) {

        container.appendChild(

            card

        );

        messageCount++;

        lastMessage =

            card;

        Render.autoScroll();

    }

    return card;

};
  /*=========================================================
 RENDER STAFF PROFILE
=========================================================*/

Render.renderStaffProfile = function (

    card

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !card ||

        !card.data

    ) {

        return;

    }

    const profile =

        card.data;

    /*----------------------------------
      Build HTML
    ----------------------------------*/

    const html = [

        "<table class='gg-ai-table'>",

        "<tr>",

        "<td><strong>Name</strong></td>",

        "<td>" +

        escapeHTML(

            profile.identity?.rawName ||

            "-"

        ) +

        "</td>",

        "</tr>",

        "<tr>",

        "<td><strong>Role</strong></td>",

        "<td>" +

        escapeHTML(

            profile.identity?.role ||

            "-"

        ) +

        "</td>",

        "</tr>",

        "<tr>",

        "<td><strong>Designation</strong></td>",

        "<td>" +

        escapeHTML(

            profile.identity?.designation ||

            "-"

        ) +

        "</td>",

        "</tr>",

        "<tr>",

        "<td><strong>Phone</strong></td>",

        "<td>" +

        escapeHTML(

            profile.identity?.phone ||

            "-"

        ) +

        "</td>",

        "</tr>",

        "<tr>",

        "<td><strong>Email</strong></td>",

        "<td>" +

        escapeHTML(

            profile.identity?.email ||

            "-"

        ) +

        "</td>",

        "</tr>",

        "<tr>",

        "<td><strong>Division</strong></td>",

        "<td>" +

        escapeHTML(

            profile.posting?.division ||

            "-"

        ) +

        "</td>",

        "</tr>",

        "<tr>",

        "<td><strong>Range</strong></td>",

        "<td>" +

        escapeHTML(

            profile.posting?.range ||

            "-"

        ) +

        "</td>",

        "</tr>",

        "<tr>",

        "<td><strong>Beat</strong></td>",

        "<td>" +

        escapeHTML(

            profile.posting?.beat ||

            "-"

        ) +

        "</td>",

        "</tr>",

        "<tr>",

        "<td><strong>Duty</strong></td>",

        "<td>" +

        escapeHTML(

            profile.assignment?.dutyType ||

            "-"

        ) +

        "</td>",

        "</tr>",

        "<tr>",

        "<td><strong>Status</strong></td>",

        "<td>" +

        escapeHTML(

            profile.assignment?.status ||

            "-"

        ) +

        "</td>",

        "</tr>",

        "</table>"

    ].join("");

    /*----------------------------------
      Render Generic Card
    ----------------------------------*/

    return Render.renderCard({

        icon:

            "👤",

        title:

            card.title ||

            "Staff Profile",

        html:

            html

    });

};/*=========================================================
 RENDER TABLE
=========================================================*/

Render.renderTable = function (

    tables

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !Array.isArray(

            tables

        ) ||

        !tables.length

    ) {

        return;

    }

    /*----------------------------------
      Render Each Table
    ----------------------------------*/

    tables.forEach(

        function (

            table

        ) {

            if (

                !table ||

                !Array.isArray(

                    table.columns

                )

            ) {

                return;

            }

            /*------------------------------
              HTML
            ------------------------------*/

            const html = [];

            html.push(

                "<table class='gg-ai-table'>"

            );

            /*------------------------------
              Header
            ------------------------------*/

            html.push(

                "<thead><tr>"

            );

            table.columns.forEach(

                function (

                    column

                ) {

                    html.push(

                        "<th>" +

                        escapeHTML(

                            column

                        ) +

                        "</th>"

                    );

                }

            );

            html.push(

                "</tr></thead>"

            );

            /*------------------------------
              Body
            ------------------------------*/

            html.push(

                "<tbody>"

            );

            (

                table.rows ||

                []

            ).forEach(

                function (

                    row

                ) {

                    html.push(

                        "<tr>"

                    );

                    row.forEach(

                        function (

                            cell

                        ) {

                            html.push(

                                "<td>" +

                                escapeHTML(

                                    cell ??

                                    ""

                                ) +

                                "</td>"

                            );

                        }

                    );

                    html.push(

                        "</tr>"

                    );

                }

            );

            html.push(

                "</tbody>"

            );

            html.push(

                "</table>"

            );

            /*------------------------------
              Render Card
            ------------------------------*/

            Render.renderCard({

                icon:

                    "📋",

                title:

                    table.title ||

                    "Table",

                html:

                    html.join("")

            });

        }

    );

};/*=========================================================
 RENDER SECTIONS
=========================================================*/

Render.renderSections = function (

    sections

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !Array.isArray(

            sections

        ) ||

        !sections.length

    ) {

        return;

    }

    /*----------------------------------
      Render Each Section
    ----------------------------------*/

    sections.forEach(

        function (

            section

        ) {

            if (

                !section ||

                typeof section !== "object"

            ) {

                return;

            }

            const html = [];

            html.push(

                "<div class='gg-ai-section'>"

            );

            /*------------------------------
              Data
            ------------------------------*/

            const data =

                section.data ||

                {};

            Object.keys(

                data

            ).forEach(

                function (

                    key

                ) {

                    const value =

                        data[key];

                    /* Skip Objects */

                    if (

                        value &&

                        typeof value ===

                        "object"

                    ) {

                        return;

                    }

                    html.push(

                        "<div class='gg-ai-row'>"

                    );

                    html.push(

                        "<span class='gg-ai-label'>"

                    );

                    html.push(

                        escapeHTML(

                            key

                        )

                    );

                    html.push(

                        "</span>"

                    );

                    html.push(

                        "<span class='gg-ai-value'>"

                    );

                    html.push(

                        escapeHTML(

                            value ??

                            "-"

                        )

                    );

                    html.push(

                        "</span>"

                    );

                    html.push(

                        "</div>"

                    );

                }

            );

            html.push(

                "</div>"

            );

            /*------------------------------
              Render
            ------------------------------*/

            Render.renderCard({

                icon:

                    "📄",

                title:

                    section.title ||

                    "Section",

                html:

                    html.join("")

            });

        }

    );

};/*=========================================================
 RENDER ANALYTICS
=========================================================*/

Render.renderAnalytics = function (

    analytics

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !analytics ||

        typeof analytics !== "object"

    ) {

        return;

    }

    /*----------------------------------
      HTML
    ----------------------------------*/

    const html = [];

    html.push(

        "<div class='gg-ai-analytics'>"

    );

    Object.entries(

        analytics

    ).forEach(

        function (

            [

                key,

                value

            ]

        ) {

            /*--------------------------
              Skip Objects
            --------------------------*/

            if (

                value &&

                typeof value === "object"

            ) {

                return;

            }

            html.push(

                "<div class='gg-ai-metric'>"

            );

            html.push(

                "<div class='gg-ai-metric-label'>"

            );

            html.push(

                escapeHTML(key)

            );

            html.push(

                "</div>"

            );

            html.push(

                "<div class='gg-ai-metric-value'>"

            );

            html.push(

                escapeHTML(

                    value ??

                    "-"

                )

            );

            html.push(

                "</div>"

            );

            html.push(

                "</div>"

            );

        }

    );

    html.push(

        "</div>"

    );

    /*----------------------------------
      Render
    ----------------------------------*/

    Render.renderCard({

        icon:

            "📊",

        title:

            "Analytics",

        html:

            html.join("")

    });

};/*=========================================================
 RENDER BUTTONS
=========================================================*/

Render.renderButtons = function (

    buttons

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !Array.isArray(

            buttons

        ) ||

        !buttons.length

    ) {

        return;

    }

    /*----------------------------------
      Wrapper
    ----------------------------------*/

    const wrapper =

        document.createElement(

            "div"

        );

    wrapper.className =

        "gg-ai-buttons";

    /*----------------------------------
      Buttons
    ----------------------------------*/

    buttons.forEach(

        function (

            button

        ) {

            if (

                !button ||

                typeof button !== "object"

            ) {

                return;

            }

            const btn =

                document.createElement(

                    "button"

                );

            btn.className =

                "gg-ai-action-button";

            btn.innerHTML =

                (

                    button.icon ||

                    ""

                ) +

                " " +

                escapeHTML(

                    button.label ||

                    "Button"

                );

            btn.onclick =

                function () {

                    if (

                        typeof button.onClick ===

                        "function"

                    ) {

                        button.onClick(

                            button

                        );

                    }

                    else if (

                        button.action

                    ) {

                        document.dispatchEvent(

                            new CustomEvent(

                                "GreenGuardAIAction",

                                {

                                    detail:

                                        button

                                }

                            )

                        );

                    }

                };

            wrapper.appendChild(

                btn

            );

        }

    );

    /*----------------------------------
      Add To Chat
    ----------------------------------*/

    if (

        container

    ) {

        container.appendChild(

            wrapper

        );

        messageCount++;

        lastMessage =

            wrapper;

        Render.autoScroll();

    }

    return wrapper;

};/*=========================================================
 RENDER ERROR
=========================================================*/

Render.renderError = function (

    error

) {

    /*----------------------------------
      Normalize
    ----------------------------------*/

    let title =

        "Request Failed";

    let message =

        "Unknown error.";

    if (

        typeof error ===

        "string"

    ) {

        message =

            error;

    }

    else if (

        error &&

        typeof error ===

        "object"

    ) {

        title =

            error.title ||

            title;

        message =

            error.message ||

            message;

    }

    /*----------------------------------
      Build HTML
    ----------------------------------*/

    const html = [

        "<div class='gg-ai-error'>",

        "<div class='gg-ai-error-icon'>",

        "❌",

        "</div>",

        "<div class='gg-ai-error-message'>",

        escapeHTML(

            message

        ),

        "</div>",

        "</div>"

    ].join("");

    /*----------------------------------
      Render
    ----------------------------------*/

    return Render.renderCard({

        icon:

            "⚠️",

        title:

            title,

        html:

            html

    });

};
  /*=========================================================
 RENDER STAFF INFO CARD
=========================================================*/

Render.renderStaffInfoCard = function (

    options = {}

) {

    /*----------------------------------
      Normalize
    ----------------------------------*/

    const title =

        options.title ||

        "Staff Information";

    const icon =

        options.icon ||

        "👤";

    const fields =

        Array.isArray(

            options.fields

        )

            ? options.fields

            : [];

    /*----------------------------------
      HTML
    ----------------------------------*/

    const html = [];

    html.push(

        "<div class='gg-ai-info-card'>"

    );

    fields.forEach(

        function (

            field

        ) {

            html.push(

                "<div class='gg-ai-info-row'>"

            );

            html.push(

                "<div class='gg-ai-info-label'>"

            );

            html.push(

                escapeHTML(

                    field.label ||

                    ""

                )

            );

            html.push(

                "</div>"

            );

            html.push(

                "<div class='gg-ai-info-value'>"

            );

            html.push(

                escapeHTML(

                    field.value ??

                    "-"

                )

            );

            html.push(

                "</div>"

            );

            html.push(

                "</div>"

            );

        }

    );

    html.push(

        "</div>"

    );

    /*----------------------------------
      Render
    ----------------------------------*/

    return Render.renderCard({

        icon:

            icon,

        title:

            title,

        html:

            html.join("")

    });

};/*=========================================================
 RENDER STAFF POSTING
=========================================================*/

Render.renderStaffPosting = function (

    card

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !card ||

        !card.data

    ) {

        return;

    }

    const posting =

        card.data;

    /*----------------------------------
      Build Fields
    ----------------------------------*/

    const fields = [

        {

            label:

                "Name",

            value:

                posting.rawName ||

                posting.name ||

                "-"

        },

        {

            label:

                "Role",

            value:

                posting.role ||

                "-"

        },

        {

            label:

                "Designation",

            value:

                posting.designation ||

                "-"

        },

        {

            label:

                "Circle",

            value:

                posting.circle ||

                "-"

        },

        {

            label:

                "Division",

            value:

                posting.division ||

                "-"

        },

        {

            label:

                "Range",

            value:

                posting.range ||

                "-"

        },

        {

            label:

                "Beat",

            value:

                posting.beat ||

                "-"

        },

        {

            label:

                "Compartment",

            value:

                posting.assignedCompartment ||

                "-"

        },

        {

            label:

                "Duty",

            value:

                posting.dutyType ||

                "-"

        },

        {

            label:

                "Status",

            value:

                posting.status ||

                "-"

        },

        {

            label:

                "Team",

            value:

                posting.team ||

                "-"

        },

        {

            label:

                "Leader",

            value:

                posting.leader ||

                "-"

        },

        {

            label:

                "Location",

            value:

                posting.location ||

                "-"

        }

    ];

    /*----------------------------------
      Render
    ----------------------------------*/

    return Render.renderStaffInfoCard({

        title:

            card.title ||

            "Staff Posting",

        icon:

            "📍",

        fields:

            fields

    });

};/*=========================================================
 RENDER STAFF LOCATION
=========================================================*/

Render.renderStaffLocation = function (

    card

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !card ||

        !card.data

    ) {

        return;

    }

    const location =

        card.data;

    /*----------------------------------
      Build Fields
    ----------------------------------*/

    const fields = [

        {

            label:

                "Name",

            value:

                location.rawName ||

                location.name ||

                "-"

        },

        {

            label:

                "Role",

            value:

                location.role ||

                "-"

        },

        {

            label:

                "Designation",

            value:

                location.designation ||

                "-"

        },

        {

            label:

                "Circle",

            value:

                location.circle ||

                "-"

        },

        {

            label:

                "Division",

            value:

                location.division ||

                "-"

        },

        {

            label:

                "Range",

            value:

                location.range ||

                "-"

        },

        {

            label:

                "Beat",

            value:

                location.beat ||

                "-"

        },

        {

            label:

                "Location",

            value:

                location.location ||

                "-"

        },

        {

            label:

                "Latitude",

            value:

                location.latitude ??

                "-"

        },

        {

            label:

                "Longitude",

            value:

                location.longitude ??

                "-"

        },

        {

            label:

                "Accuracy",

            value:

                location.accuracy ??

                "-"

        },

        {

            label:

                "Speed",

            value:

                location.speed ??

                "-"

        },

        {

            label:

                "Heading",

            value:

                location.heading ??

                "-"

        },

        {

            label:

                "Last Seen",

            value:

                location.lastSeen ||

                "-"

        },

        {

            label:

                "Duty",

            value:

                location.dutyType ||

                "-"

        },

        {

            label:

                "Status",

            value:

                location.status ||

                "-"

        }

    ];

    /*----------------------------------
      Render
    ----------------------------------*/

    return Render.renderStaffInfoCard({

        title:

            card.title ||

            "Staff Location",

        icon:

            "📍",

        fields:

            fields

    });

};/*=========================================================
 RENDER STAFF DUTY
=========================================================*/

Render.renderStaffDuty = function (

    card

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !card ||

        !card.data

    ) {

        return;

    }

    const duty =

        card.data;

    /*----------------------------------
      Build Fields
    ----------------------------------*/

    const fields = [

        {

            label:

                "Name",

            value:

                duty.rawName ||

                duty.name ||

                "-"

        },

        {

            label:

                "Role",

            value:

                duty.role ||

                "-"

        },

        {

            label:

                "Designation",

            value:

                duty.designation ||

                "-"

        },

        {

            label:

                "Circle",

            value:

                duty.circle ||

                "-"

        },

        {

            label:

                "Division",

            value:

                duty.division ||

                "-"

        },

        {

            label:

                "Range",

            value:

                duty.range ||

                "-"

        },

        {

            label:

                "Beat",

            value:

                duty.beat ||

                "-"

        },

        {

            label:

                "Duty Type",

            value:

                duty.dutyType ||

                "-"

        },

        {

            label:

                "Duty Status",

            value:

                duty.status ||

                "-"

        },

        {

            label:

                "Duty Active",

            value:

                duty.dutyActive

                    ? "YES"

                    : "NO"

        },

        {

            label:

                "Last Duty End",

            value:

                duty.lastDutyEnd ||

                "-"

        },

        {

            label:

                "Team",

            value:

                duty.team ||

                "-"

        },

        {

            label:

                "Leader",

            value:

                duty.leader ||

                "-"

        },

        {

            label:

                "Current Location",

            value:

                duty.location ||

                "-"

        },

        {

            label:

                "Latitude",

            value:

                duty.latitude ??

                "-"

        },

        {

            label:

                "Longitude",

            value:

                duty.longitude ??

                "-"

        },

        {

            label:

                "Accuracy",

            value:

                duty.accuracy ??

                "-"

        },

        {

            label:

                "Speed",

            value:

                duty.speed ??

                "-"

        },

        {

            label:

                "Last Seen",

            value:

                duty.lastSeen ||

                "-"

        }

    ];

    /*----------------------------------
      Render
    ----------------------------------*/

    return Render.renderStaffInfoCard({

        title:

            card.title ||

            "Staff Duty",

        icon:

            "🚓",

        fields:

            fields

    });

};
  /*=========================================================
 RENDER STAFF GPS
=========================================================*/

Render.renderStaffGPS = function (

    card

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !card ||

        !card.data

    ) {

        return;

    }

    const gps =

        card.data;

    /*----------------------------------
      Build Fields
    ----------------------------------*/

    const fields = [

        {

            label:

                "Name",

            value:

                gps.rawName ||

                gps.name ||

                "-"

        },

        {

            label:

                "Role",

            value:

                gps.role ||

                "-"

        },

        {

            label:

                "Designation",

            value:

                gps.designation ||

                "-"

        },

        {

            label:

                "Current Location",

            value:

                gps.location ||

                "-"

        },

        {

            label:

                "Latitude",

            value:

                gps.latitude ??

                "-"

        },

        {

            label:

                "Longitude",

            value:

                gps.longitude ??

                "-"

        },

        {

            label:

                "Accuracy",

            value:

                gps.accuracy ??

                "-"

        },

        {

            label:

                "Speed",

            value:

                gps.speed ??

                "-"

        },

        {

            label:

                "Heading",

            value:

                gps.heading ??

                "-"

        },

        {

            label:

                "Turn Angle",

            value:

                gps.turnAngle ??

                "-"

        },

        {

            label:

                "Turn Rate",

            value:

                gps.turnRate ??

                "-"

        },

        {

            label:

                "Last Seen",

            value:

                gps.lastSeen ||

                "-"

        },

        {

            label:

                "Updated At",

            value:

                gps.updatedAt ||

                "-"

        },

        {

            label:

                "Duty Type",

            value:

                gps.dutyType ||

                "-"

        },

        {

            label:

                "Duty Active",

            value:

                gps.dutyActive

                    ? "YES"

                    : "NO"

        },

        {

            label:

                "Status",

            value:

                gps.status ||

                "-"

        },

        {

            label:

                "Circle",

            value:

                gps.circle ||

                "-"

        },

        {

            label:

                "Division",

            value:

                gps.division ||

                "-"

        },

        {

            label:

                "Range",

            value:

                gps.range ||

                "-"

        },

        {

            label:

                "Beat",

            value:

                gps.beat ||

                "-"

        },

        {

            label:

                "Leader",

            value:

                gps.leader ||

                "-"

        },

        {

            label:

                "Team",

            value:

                gps.team ||

                "-"

        },

        {

            label:

                "Session ID",

            value:

                gps.sessionId ||

                "-"

        },

        {

            label:

                "GPS Source",

            value:

                gps.source ||

                "-"

        },

        {

            label:

                "Distance",

            value:

                (gps.distanceKm ?? 0) +

                " km"

        },

        {

            label:

                "GPS Points",

            value:

                gps.pointCount ??

                0

        }

    ];

    /*----------------------------------
      Render
    ----------------------------------*/

    return Render.renderStaffInfoCard({

        title:

            card.title ||

            "Staff GPS",

        icon:

            "📡",

        fields:

            fields

    });

};
  /*=========================================================
 RENDER STAFF TEAM
=========================================================*/

Render.renderStaffTeam = function (

    card

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !card ||

        !card.data

    ) {

        return;

    }

    const team =

        card.data;

    /*----------------------------------
      Build Fields
    ----------------------------------*/

    const fields = [

        {

            label:

                "Name",

            value:

                team.rawName ||

                team.name ||

                "-"

        },

        {

            label:

                "Role",

            value:

                team.role ||

                "-"

        },

        {

            label:

                "Designation",

            value:

                team.designation ||

                "-"

        },

        {

            label:

                "Leader",

            value:

                team.leader ||

                "-"

        },

        {

            label:

                "Team",

            value:

                team.team ||

                "-"

        },

        {

            label:

                "Circle",

            value:

                team.circle ||

                "-"

        },

        {

            label:

                "Division",

            value:

                team.division ||

                "-"

        },

        {

            label:

                "Range",

            value:

                team.range ||

                "-"

        },

        {

            label:

                "Beat",

            value:

                team.beat ||

                "-"

        },

        {

            label:

                "Compartment",

            value:

                team.assignedCompartment ||

                "-"

        },

        {

            label:

                "Duty Type",

            value:

                team.dutyType ||

                "-"

        },

        {

            label:

                "Duty Status",

            value:

                team.status ||

                "-"

        },

        {

            label:

                "Duty Active",

            value:

                team.dutyActive

                    ? "YES"

                    : "NO"

        },

        {

            label:

                "Current Location",

            value:

                team.location ||

                "-"

        },

        {

            label:

                "Latitude",

            value:

                team.latitude ??

                "-"

        },

        {

            label:

                "Longitude",

            value:

                team.longitude ??

                "-"

        },

        {

            label:

                "Accuracy",

            value:

                team.accuracy ??

                "-"

        },

        {

            label:

                "Speed",

            value:

                team.speed ??

                "-"

        },

        {

            label:

                "Distance",

            value:

                (team.distanceKm ?? 0) +

                " km"

        },

        {

            label:

                "GPS Points",

            value:

                team.pointCount ??

                0

        },

        {

            label:

                "Session Started",

            value:

                team.startedAt ||

                "-"

        },

        {

            label:

                "Session Ended",

            value:

                team.endedAt ||

                "-"

        }

    ];

    /*----------------------------------
      Render
    ----------------------------------*/

    return Render.renderStaffInfoCard({

        title:

            card.title ||

            "Staff Team",

        icon:

            "👥",

        fields:

            fields

    });

};
  /*=========================================================
 RENDER STAFF STRENGTH
=========================================================*/

Render.renderStaffStrength = function (

    card

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !card ||

        !card.data

    ) {

        return;

    }

    const summary =

        card.data;

    /*----------------------------------
      HTML
    ----------------------------------*/

    const html = [];

    html.push(

        "<div class='gg-ai-strength'>"

    );

    html.push(

        "<div class='gg-ai-strength-grid'>"

    );

    /*----------------------------------
      KPI Cards
    ----------------------------------*/

    [

        {

            label:

                "Total Staff",

            value:

                summary.total ?? 0

        },

        {

            label:

                "Active",

            value:

                summary.active ?? 0

        },

        {

            label:

                "Inactive",

            value:

                summary.inactive ?? 0

        },

        {

            label:

                "Active %",

            value:

                (

                    summary.statistics
                        ?.activePercentage ??

                    0

                ) + "%"

        },

        {

            label:

                "Inactive %",

            value:

                (

                    summary.statistics
                        ?.inactivePercentage ??

                    0

                ) + "%"

        }

    ].forEach(

        function (

            item

        ) {

            html.push(

                "<div class='gg-ai-kpi'>"

            );

            html.push(

                "<div class='gg-ai-kpi-value'>"

            );

            html.push(

                escapeHTML(

                    item.value

                )

            );

            html.push(

                "</div>"

            );

            html.push(

                "<div class='gg-ai-kpi-label'>"

            );

            html.push(

                escapeHTML(

                    item.label

                )

            );

            html.push(

                "</div>"

            );

            html.push(

                "</div>"

            );

        }

    );

    html.push(

        "</div>"

    );

    html.push(

        "</div>"

    );

    /*----------------------------------
      Summary Card
    ----------------------------------*/

    Render.renderCard({

        icon:

            "👥",

        title:

            card.title ||

            "Staff Strength",

        html:

            html.join("")

    });

    /*----------------------------------
      By Role
    ----------------------------------*/

    if (

        summary.byRole

    ) {

        Render.renderTable([{

            title:

                "By Role",

            columns: [

                "Role",

                "Count"

            ],

            rows:

                Object.entries(

                    summary.byRole

                )

        }]);

    }

    /*----------------------------------
      By Division
    ----------------------------------*/

    if (

        summary.byDivision

    ) {

        Render.renderTable([{

            title:

                "By Division",

            columns: [

                "Division",

                "Count"

            ],

            rows:

                Object.entries(

                    summary.byDivision

                )

        }]);

    }

    /*----------------------------------
      By Range
    ----------------------------------*/

    if (

        summary.byRange

    ) {

        Render.renderTable([{

            title:

                "By Range",

            columns: [

                "Range",

                "Count"

            ],

            rows:

                Object.entries(

                    summary.byRange

                )

        }]);

    }

    /*----------------------------------
      By Beat
    ----------------------------------*/

    if (

        summary.byBeat

    ) {

        Render.renderTable([{

            title:

                "By Beat",

            columns: [

                "Beat",

                "Count"

            ],

            rows:

                Object.entries(

                    summary.byBeat

                )

        }]);

    }

};
/*=========================================================
 RENDER STAFF ANALYTICS
=========================================================*/

Render.renderStaffAnalytics = function (

    card

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !card ||

        !card.data

    ) {

        return;

    }

    const analytics =

        card.data;

    /*----------------------------------
      KPI Dashboard
    ----------------------------------*/

    Render.renderAnalytics({

        "Total Staff":

            analytics.totalStaff ?? 0,

        "Active Staff":

            analytics.activeStaff ?? 0,

        "Inactive Staff":

            analytics.inactiveStaff ?? 0,

        "Total Distance (km)":

            analytics.totalDistance ?? 0,

        "Average Distance":

            analytics.averageDistance ?? 0,

        "Sessions":

            analytics.totalSessions ?? 0,

        "GPS Points":

            analytics.totalPoints ?? 0,

        "Average Points":

            analytics.averagePoints ?? 0,

        "Active Duty":

            analytics.activeDuty ?? 0,

        "Inactive Duty":

            analytics.inactiveDuty ?? 0

    });

    /*----------------------------------
      Role Distribution
    ----------------------------------*/

    if (

        analytics.byRole

    ) {

        Render.renderTable([{

            title:

                "Role Distribution",

            columns: [

                "Role",

                "Count"

            ],

            rows:

                Object.entries(

                    analytics.byRole

                )

        }]);

    }

    /*----------------------------------
      Division Distribution
    ----------------------------------*/

    if (

        analytics.byDivision

    ) {

        Render.renderTable([{

            title:

                "Division Distribution",

            columns: [

                "Division",

                "Count"

            ],

            rows:

                Object.entries(

                    analytics.byDivision

                )

        }]);

    }

    /*----------------------------------
      Range Distribution
    ----------------------------------*/

    if (

        analytics.byRange

    ) {

        Render.renderTable([{

            title:

                "Range Distribution",

            columns: [

                "Range",

                "Count"

            ],

            rows:

                Object.entries(

                    analytics.byRange

                )

        }]);

    }

    /*----------------------------------
      Beat Distribution
    ----------------------------------*/

    if (

        analytics.byBeat

    ) {

        Render.renderTable([{

            title:

                "Beat Distribution",

            columns: [

                "Beat",

                "Count"

            ],

            rows:

                Object.entries(

                    analytics.byBeat

                )

        }]);

    }

};/*=========================================================
 RENDER UNKNOWN CARD
=========================================================*/

Render.renderUnknownCard = function (

    card

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !card ||

        typeof card !== "object"

    ) {

        return;

    }

    /*----------------------------------
      HTML
    ----------------------------------*/

    const html = [];

    html.push(

        "<div class='gg-ai-unknown-card'>"

    );

    html.push(

        "<div class='gg-ai-warning'>"

    );

    html.push(

        "No renderer is available for this card."

    );

    html.push(

        "</div>"

    );

    html.push(

        "<hr>"

    );

    html.push(

        "<pre>"

    );

    html.push(

        escapeHTML(

            JSON.stringify(

                card,

                null,

                2

            )

        )

    );

    html.push(

        "</pre>"

    );

    html.push(

        "</div>"

    );

    /*----------------------------------
      Render
    ----------------------------------*/

    return Render.renderCard({

        icon:

            "❓",

        title:

            card.type ||

            "Unknown Card",

        html:

            html.join("")

    });

};/*=========================================================
 RENDER ACTIONS
=========================================================*/

Render.renderActions = function (

    actions

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !Array.isArray(

            actions

        ) ||

        !actions.length

    ) {

        return;

    }

    /*----------------------------------
      Execute
    ----------------------------------*/

    actions.forEach(

        function (

            action

        ) {

            if (

                !action ||

                typeof action !== "object"

            ) {

                return;

            }

            document.dispatchEvent(

                new CustomEvent(

                    "GreenGuardAIAction",

                    {

                        detail:

                            action

                    }

                )

            );

        }

    );

};/*=========================================================
 RENDER MAP
=========================================================*/

Render.renderMap = function (

    map

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !map ||

        typeof map !== "object"

    ) {

        return;

    }

    /*----------------------------------
      HTML
    ----------------------------------*/

    const html = [];

    html.push(

        "<div class='gg-ai-map'>"

    );

    html.push(

        "<div class='gg-ai-map-summary'>"

    );

    html.push(

        "<div><strong>Layer:</strong> " +

        escapeHTML(

            map.layer ||

            "-"

        ) +

        "</div>"

    );

    html.push(

        "<div><strong>Title:</strong> " +

        escapeHTML(

            map.title ||

            "-"

        ) +

        "</div>"

    );

    html.push(

        "<div><strong>Items:</strong> " +

        escapeHTML(

            map.count ??

            0

        ) +

        "</div>"

    );

    html.push(

        "</div>"

    );

    html.push(

        "<div class='gg-ai-map-actions'>"

    );

    html.push(

        "<button class='gg-ai-map-open'>"

    );

    html.push(

        "🗺 Open on Map"

    );

    html.push(

        "</button>"

    );

    html.push(

        "</div>"

    );

    html.push(

        "</div>"

    );

    /*----------------------------------
      Render Card
    ----------------------------------*/

    const card =

        Render.renderCard({

            icon:

                "🗺",

            title:

                map.title ||

                "Map",

            html:

                html.join("")

        });

    /*----------------------------------
      Open Button
    ----------------------------------*/

    const button =

        card.querySelector(

            ".gg-ai-map-open"

        );

    if (

        button

    ) {

        button.onclick =

            function () {

                document.dispatchEvent(

                    new CustomEvent(

                        "GreenGuardAIAction",

                        {

                            detail:{

                                type:

                                    "show-map",

                                map:

                                    map

                            }

                        }

                    )

                );

            };

    }

    return card;

};/*=========================================================
 RENDER CHART
=========================================================*/

Render.renderChart = function (

    chart

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !chart ||

        typeof chart !== "object"

    ) {

        return;

    }

    /*----------------------------------
      HTML
    ----------------------------------*/

    const html = [];

    html.push(

        "<div class='gg-ai-chart'>"

    );

    html.push(

        "<div class='gg-ai-chart-summary'>"

    );

    html.push(

        "<div><strong>Chart Type:</strong> " +

        escapeHTML(

            chart.type ||

            "Unknown"

        ) +

        "</div>"

    );

    html.push(

        "<div><strong>Series:</strong> " +

        escapeHTML(

            chart.series?.length ||

            0

        ) +

        "</div>"

    );

    html.push(

        "<div><strong>Labels:</strong> " +

        escapeHTML(

            chart.labels?.length ||

            0

        ) +

        "</div>"

    );

    html.push(

        "</div>"

    );

    html.push(

        "<div class='gg-ai-chart-placeholder'>"

    );

    html.push(

        "📊 Chart Preview"

    );

    html.push(

        "</div>"

    );

    html.push(

        "<div class='gg-ai-chart-actions'>"

    );

    html.push(

        "<button class='gg-ai-chart-open'>"

    );

    html.push(

        "📈 Open Chart"

    );

    html.push(

        "</button>"

    );

    html.push(

        "</div>"

    );

    html.push(

        "</div>"

    );

    /*----------------------------------
      Render Card
    ----------------------------------*/

    const card =

        Render.renderCard({

            icon:

                "📊",

            title:

                chart.title ||

                "Analytics Chart",

            html:

                html.join("")

        });

    /*----------------------------------
      Open Button
    ----------------------------------*/

    const button =

        card.querySelector(

            ".gg-ai-chart-open"

        );

    if (

        button

    ) {

        button.onclick =

            function () {

                document.dispatchEvent(

                    new CustomEvent(

                        "GreenGuardAIAction",

                        {

                            detail:{

                                type:

                                    "show-chart",

                                chart:

                                    chart

                            }

                        }

                    )

                );

            };

    }

    return card;

};/*=========================================================
 RENDER TIMELINE
=========================================================*/

Render.renderTimeline = function (

    timeline

) {

    /*----------------------------------
      Validate
    ----------------------------------*/

    if (

        !timeline ||

        !Array.isArray(

            timeline.events

        )

    ) {

        return;

    }

    /*----------------------------------
      HTML
    ----------------------------------*/

    const html = [];

    html.push(

        "<div class='gg-ai-timeline'>"

    );

    timeline.events.forEach(

        function (

            event

        ) {

            html.push(

                "<div class='gg-ai-timeline-item'>"

            );

            html.push(

                "<div class='gg-ai-timeline-icon'>"

            );

            html.push(

                escapeHTML(

                    event.icon ||

                    "•"

                )

            );

            html.push(

                "</div>"

            );

            html.push(

                "<div class='gg-ai-timeline-content'>"

            );

            html.push(

                "<div class='gg-ai-timeline-title'>"

            );

            html.push(

                escapeHTML(

                    event.title ||

                    ""

                )

            );

            html.push(

                "</div>"

            );

            html.push(

                "<div class='gg-ai-timeline-time'>"

            );

            html.push(

                escapeHTML(

                    event.time ||

                    ""

                )

            );

            html.push(

                "</div>"

            );

            if (

                event.description

            ) {

                html.push(

                    "<div class='gg-ai-timeline-description'>"

                );

                html.push(

                    escapeHTML(

                        event.description

                    )

                );

                html.push(

                    "</div>"

                );

            }

            html.push(

                "</div>"

            );

            html.push(

                "</div>"

            );

        }

    );

    html.push(

        "</div>"

    );

    /*----------------------------------
      Render Card
    ----------------------------------*/

    return Render.renderCard({

        icon:

            "🕒",

        title:

            timeline.title ||

            "Timeline",

        html:

            html.join("")

    });

};/*=========================================================
 RENDER REGISTRY
=========================================================*/

Render.registry = Object.create(

    null

);

/*=========================================================
 REGISTER RENDERER
=========================================================*/

Render.register = function (

    type,

    renderer

) {

    if (

        typeof type !== "string"

    ) {

        return;

    }

    if (

        typeof renderer !==

        "function"

    ) {

        return;

    }

    Render.registry[

        type

    ] = renderer;

};

/*=========================================================
 GET RENDERER
=========================================================*/

Render.getRenderer = function (

    type

) {

    return (

        Render.registry[

            type

        ] ||

        null

    );

};
    /*----------------------------------------------------------
      STATUS
    ----------------------------------------------------------*/

    Render.isReady = function () {

        return ready;

    };



    /*----------------------------------------------------------
      CONTAINER
    ----------------------------------------------------------*/

    Render.container = function () {

        return container;

    };



    /*----------------------------------------------------------
      CLEAR
    ----------------------------------------------------------*/

    Render.clear = function () {

        if (!container)
            return;

        container.innerHTML = "";

        messageCount = 0;

        lastMessage = null;

    };



    /*----------------------------------------------------------
      AUTO SCROLL
    ----------------------------------------------------------*/

    Render.setAutoScroll = function (

        value

    ) {

        autoScroll = !!value;

    };



    Render.autoScroll = function () {

        if (

            !container ||

            !autoScroll

        )

            return;

        container.scrollTop =

            container.scrollHeight;

    };

     /*----------------------------------------------------------
      ESCAPE HTML
    ----------------------------------------------------------*/

    function escapeHTML(text) {

        if (

            text === undefined ||

            text === null

        ) {

            return "";

        }

        return String(text)

            .replace(/&/g, "&amp;")

            .replace(/</g, "&lt;")

            .replace(/>/g, "&gt;")

            .replace(/"/g, "&quot;")

            .replace(/'/g, "&#39;");

    }



    /*----------------------------------------------------------
      SIMPLE MARKDOWN
    ----------------------------------------------------------*/

    function markdown(text) {

        text = escapeHTML(text);

        if (!markdownEnabled)
            return text;

        return text

            .replace(
                /\*\*(.*?)\*\*/g,
                "<strong>$1</strong>"
            )

            .replace(
                /\*(.*?)\*/g,
                "<em>$1</em>"
            )

            .replace(
                /`([^`]+)`/g,
                "<code>$1</code>"
            )

            .replace(
                /\n/g,
                "<br>"
            );

    }



    /*----------------------------------------------------------
      CREATE MESSAGE
    ----------------------------------------------------------*/

    function createMessage(

        role,

        text

    ) {

        const div =

            document.createElement(

                "div"

            );

       div.className =

    "gg-ai-message gg-ai-" +

    role;

div.dataset.role =

    role;

div.dataset.raw =

    text;

div.innerHTML =

    markdown(text);

        return div;

    }



    /*----------------------------------------------------------
      APPEND MESSAGE
    ----------------------------------------------------------*/

    Render.appendMessage = function (

        role,

        text

    ) {

        if (!container)
            return null;

        const message =

            createMessage(

                role,

                text

            );

        container.appendChild(

            message

        );

        messageCount++;

        lastMessage =

            message;

        Render.autoScroll();

        return message;

    };

     /*----------------------------------------------------------
      UPDATE MESSAGE
    ----------------------------------------------------------*/

    Render.updateMessage = function (

        element,

        text

    ) {

        if (

            !element

        )

            return;

       element.dataset.raw =

    text;

element.innerHTML =

    markdown(text);

        Render.autoScroll();

    };



    /*----------------------------------------------------------
      APPEND STREAM
    ----------------------------------------------------------*/

    Render.appendStream = function (

        element,

        chunk

    ) {

        if (

            !element

        )

            return;

       const current =

    element.dataset.raw ||

    element.textContent ||

    "";

        const updated =

            current + chunk;

        element.dataset.raw =

            updated;

        element.innerHTML =

            markdown(

                updated

            );

        Render.autoScroll();

    };



    /*----------------------------------------------------------
      TYPING INDICATOR
    ----------------------------------------------------------*/

    let typingElement = null;



    Render.showTyping = function () {

        if (

            typingElement ||

            !container

        )

            return;

        typingElement =

            document.createElement(

                "div"

            );

        typingElement.className =

            "gg-ai-message gg-ai-system gg-ai-typing";

        typingElement.innerHTML =

            "<span></span><span></span><span></span>";

        container.appendChild(

            typingElement

        );

        Render.autoScroll();

    };



    /*----------------------------------------------------------
      HIDE TYPING
    ----------------------------------------------------------*/

    Render.hideTyping = function () {

        if (

            !typingElement

        )

            return;

        typingElement.remove();

        typingElement = null;

    };



    /*----------------------------------------------------------
      MESSAGE COUNT
    ----------------------------------------------------------*/

    Render.messageCount = function () {

        return messageCount;

    };



    /*----------------------------------------------------------
      LAST MESSAGE
    ----------------------------------------------------------*/

    Render.lastMessage = function () {

        return lastMessage;

    };

     /*----------------------------------------------------------
      ERROR MESSAGE
    ----------------------------------------------------------*/

    Render.error = function (

        text

    ) {

        return Render.appendMessage(

            "error",

            "❌ " + text

        );

    };



    /*----------------------------------------------------------
      SUCCESS MESSAGE
    ----------------------------------------------------------*/

    Render.success = function (

        text

    ) {

        return Render.appendMessage(

            "success",

            "✅ " + text

        );

    };



    /*----------------------------------------------------------
      SYSTEM MESSAGE
    ----------------------------------------------------------*/

    Render.system = function (

        text

    ) {

        return Render.appendMessage(

            "system",

            text

        );

    };



    /*----------------------------------------------------------
      COPY BUTTON
    ----------------------------------------------------------*/

    Render.enableCopy = function (

        element,

        text

    ) {

        if (

            !element

        )

            return;

        const btn =

            document.createElement(

                "button"

            );

        btn.className =

            "gg-ai-copy";

        btn.textContent =

            "Copy";

        btn.onclick = async function () {

            try {

                await navigator.clipboard.writeText(

                    text

                );

                btn.textContent =

                    "Copied";

                setTimeout(

                    function () {

                        btn.textContent =

                            "Copy";

                    },

                    1500

                );

            }

            catch (err) {

                Config.error(

                    "Render.copy",

                    err

                );

            }

        };

        element.appendChild(

            btn

        );

    };



    /*----------------------------------------------------------
      DOWNLOAD MARKDOWN
    ----------------------------------------------------------*/

    Render.downloadMarkdown = function (

        filename,

        text

    ) {

        const blob =

            new Blob(

                [text],

                {

                    type:

                        "text/markdown"

                }

            );

        const url =

            URL.createObjectURL(

                blob

            );

        const a =

            document.createElement(

                "a"

            );

        a.href = url;

        a.download =

            filename ||

            "chat.md";

        a.click();

        URL.revokeObjectURL(

            url

        );

    };



    /*----------------------------------------------------------
      RESET
    ----------------------------------------------------------*/

    Render.reset = function () {

        Render.clear();

        typingElement = null;

        messageCount = 0;

        lastMessage = null;

    };



    /*----------------------------------------------------------
      INFO
    ----------------------------------------------------------*/

    Render.info = function () {

        return {

            ready:

                ready,

            messages:

                messageCount,

            autoScroll:

                autoScroll,

            markdown:

                markdownEnabled

        };

    };



    /*----------------------------------------------------------
      REGISTER
    ----------------------------------------------------------*/

    window.GreenGuardAI.Render =

        Render;



    console.log(

        "%cGreenGuard AI Render Loaded",

        "color:#8a2be2;font-weight:bold;"

    );

})(window);
