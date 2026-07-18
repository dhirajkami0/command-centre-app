/* =========================================================
   GreenGuard
   Offence Intelligence Module

   File:
   js/offence/offenceCascadeRenderer.js

   Purpose:
   - Render offence hotspot cascade UI
   - Show SOURCE and TARGET hotspot details
   - Show linked offence cases
   - Allow case selection
   - Show selected case details
   - Show accused persons
   - Show seizures
   - Show related SOURCE hotspots
   - Show related TARGET hotspots
   - Support back navigation
   - Keep UI separate from CascadeController

   Dependencies:
   1. offenceConstants.js
   2. offenceCascadeController.js

   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       1. NAMESPACE
       ===================================================== */

    window.GG =
        window.GG ||
        {};

    GG.Offence =
        GG.Offence ||
        {};


    /* =====================================================
       2. DEPENDENCIES
       ===================================================== */

    const Constants =
        GG.Offence.Constants;

    const CascadeController =
        GG.Offence.CascadeController;


    if (!Constants) {

        console.error(
            "[OffenceCascadeRenderer] Constants unavailable."
        );

        return;

    }


    if (!CascadeController) {

        console.error(
            "[OffenceCascadeRenderer] CascadeController unavailable."
        );

        return;

    }


    /* =====================================================
       3. MODULE
       ===================================================== */

    const CascadeRenderer = {};


    CascadeRenderer.VERSION =
        "1.0.0";

    CascadeRenderer.initialized =
        false;

    CascadeRenderer._eventsBound =
        false;


    /* =====================================================
       4. CONFIGURATION
       ===================================================== */

    CascadeRenderer.CONFIG = {

        panelId:
            "offenceCascadePanel",

        contentId:
            "offenceCascadeContent",

        className:
            "offence-cascade-panel"

    };


    /* =====================================================
       5. INITIALIZE
       ===================================================== */

    CascadeRenderer.init =
        function () {

            if (
                CascadeRenderer.initialized
            ) {

                return CascadeRenderer;

            }


            CascadeRenderer
                .createPanel();


            CascadeRenderer
                .bindEvents();


            CascadeRenderer.initialized =
                true;


            if (
                Constants.DEBUG
                    ?.ENABLED
            ) {

                console.log(
                    "🔥 OffenceCascadeRenderer Ready"
                );

            }


            return CascadeRenderer;

        };


    /* =====================================================
       6. CREATE PANEL
       ===================================================== */

    CascadeRenderer.createPanel =
        function () {

            let panel =

                document.getElementById(

                    CascadeRenderer
                        .CONFIG
                        .panelId

                );


            if (panel) {

                return panel;

            }


            panel =

                document.createElement(

                    "div"

                );


            panel.id =

                CascadeRenderer
                    .CONFIG
                    .panelId;


            panel.className =

                CascadeRenderer
                    .CONFIG
                    .className;


            panel.innerHTML = `

                <div class="offence-cascade-header">

                    <div class="offence-cascade-title">
                        Offence Intelligence
                    </div>

                    <button
                        type="button"
                        class="offence-cascade-close"
                        data-offence-action="close"
                        aria-label="Close"
                    >
                        ×
                    </button>

                </div>

                <div
                    id="${CascadeRenderer.CONFIG.contentId}"
                    class="offence-cascade-content"
                >
                </div>

            `;


            panel.style.display =
                "none";


            document.body.appendChild(

                panel

            );


            return panel;

        };


    /* =====================================================
       7. GET PANEL
       ===================================================== */

    CascadeRenderer.getPanel =
        function () {

            return document.getElementById(

                CascadeRenderer
                    .CONFIG
                    .panelId

            );

        };


    /* =====================================================
       8. GET CONTENT
       ===================================================== */

    CascadeRenderer.getContent =
        function () {

            return document.getElementById(

                CascadeRenderer
                    .CONFIG
                    .contentId

            );

        };


    /* =====================================================
       9. BIND EVENTS
       ===================================================== */

    CascadeRenderer.bindEvents =
        function () {

            if (
                CascadeRenderer._eventsBound
            ) {

                return;

            }


            CascadeRenderer._eventsBound =
                true;


            /* -------------------------
               Hotspot opened
               ------------------------- */

            window.addEventListener(

                CascadeController
                    .EVENTS
                    .OPENED,

                CascadeRenderer
                    .handleCascadeOpened

            );


            /* -------------------------
               Case selected
               ------------------------- */

            window.addEventListener(

                CascadeController
                    .EVENTS
                    .CASE_SELECTED,

                CascadeRenderer
                    .handleCaseSelected

            );


            /* -------------------------
               Accused selected
               ------------------------- */

            window.addEventListener(

                CascadeController
                    .EVENTS
                    .ACCUSED_SELECTED,

                CascadeRenderer
                    .handleAccusedSelected

            );


            /* -------------------------
               Seizure selected
               ------------------------- */

            window.addEventListener(

                CascadeController
                    .EVENTS
                    .SEIZURE_SELECTED,

                CascadeRenderer
                    .handleSeizureSelected

            );


            /* -------------------------
               Closed
               ------------------------- */

            window.addEventListener(

                CascadeController
                    .EVENTS
                    .CLOSED,

                CascadeRenderer
                    .hide

            );


            /* -------------------------
               Click delegation
               ------------------------- */

            const panel =

                CascadeRenderer
                    .getPanel();


            if (panel) {

                panel.addEventListener(

                    "click",

                    CascadeRenderer
                        .handleClick

                );

            }

        };


    /* =====================================================
       10. HANDLE CASCADE OPENED
       ===================================================== */

    CascadeRenderer.handleCascadeOpened =
        function (

            event

        ) {

            const data =

                event?.detail ||
                {};


            CascadeRenderer
                .renderHotspot(

                    data

                );


            CascadeRenderer
                .show();

        };


    /* =====================================================
       11. HANDLE CASE SELECTED
       ===================================================== */

    CascadeRenderer.handleCaseSelected =
        function (

            event

        ) {

            CascadeRenderer
                .renderCase(

                    event?.detail ||
                    {}

                );


            CascadeRenderer
                .show();

        };


    /* =====================================================
       12. HANDLE ACCUSED SELECTED
       ===================================================== */

    CascadeRenderer.handleAccusedSelected =
        function (

            event

        ) {

            CascadeRenderer
                .renderAccused(

                    event?.detail ||
                    {}

                );

        };


    /* =====================================================
       13. HANDLE SEIZURE SELECTED
       ===================================================== */

    CascadeRenderer.handleSeizureSelected =
        function (

            event

        ) {

            CascadeRenderer
                .renderSeizure(

                    event?.detail ||
                    {}

                );

        };


    /* =====================================================
       14. HANDLE CLICK
       ===================================================== */

    CascadeRenderer.handleClick =
        function (

            event

        ) {

            const target =

                event.target.closest(

                    "[data-offence-action]"

                );


            if (!target) {

                return;

            }


            const action =

                target.dataset
                    .offenceAction;


            /* -------------------------
               Close
               ------------------------- */

            if (
                action === "close"
            ) {

                CascadeController
                    .close();

                return;

            }


            /* -------------------------
               Select Case
               ------------------------- */

            if (
                action === "select-case"
            ) {

                const caseId =

                    target.dataset
                        .caseId;


                CascadeController
                    .selectCase(

                        caseId

                    );

                return;

            }


            /* -------------------------
               Select Accused
               ------------------------- */

            if (
                action === "select-accused"
            ) {

                const accusedId =

                    target.dataset
                        .accusedId;


                CascadeController
                    .selectAccused(

                        accusedId

                    );

                return;

            }


            /* -------------------------
               Select Seizure
               ------------------------- */

            if (
                action === "select-seizure"
            ) {

                const seizureId =

                    target.dataset
                        .seizureId;


                CascadeController
                    .selectSeizure(

                        seizureId

                    );

                return;

            }


            /* -------------------------
               Back to hotspot
               ------------------------- */

            if (
                action === "back-hotspot"
            ) {

                CascadeController
                    .backToHotspot();


                CascadeRenderer
                    .renderHotspot(

                        CascadeController
                            .buildHotspotPayload()

                    );

                return;

            }


            /* -------------------------
               Back to case
               ------------------------- */

            if (
                action === "back-case"
            ) {

                CascadeController
                    .backToCase();


                CascadeRenderer
                    .renderCase(

                        CascadeController
                            .buildCasePayload()

                    );

            }

        };


    /* =====================================================
       15. RENDER HOTSPOT
       ===================================================== */

    CascadeRenderer.renderHotspot =
        function (

            data = {}

        ) {

            const content =

                CascadeRenderer
                    .getContent();


            if (!content) {

                return;

            }


            const type =

                data.entryType ||

                "UNKNOWN";


            const hotspot =

                data.hotspot ||

                {};


            const cases =

                Array.isArray(
                    data.cases
                )

                    ? data.cases

                    : [];


            const typeLabel =

                type === "SOURCE"

                    ? "Offence Source"

                    : type === "TARGET"

                        ? "Offence Target"

                        : "Offence Hotspot";


            let html = `

                <div class="offence-cascade-section">

                    <div class="offence-cascade-type offence-type-${CascadeRenderer.escape(type)}">

                        ${CascadeRenderer.escape(typeLabel)}

                    </div>

                    <h3 class="offence-cascade-location">

                        ${CascadeRenderer.escape(
                            CascadeRenderer.getHotspotName(
                                hotspot
                            )
                        )}

                    </h3>

                    <div class="offence-cascade-stats">

                        <div class="offence-stat">

                            <span class="offence-stat-value">
                                ${Number(
                                    data.caseCount ||
                                    cases.length ||
                                    0
                                )}
                            </span>

                            <span class="offence-stat-label">
                                Cases
                            </span>

                        </div>

                        <div class="offence-stat">

                            <span class="offence-stat-value">
                                ${Number(
                                    data.offenceCount ||
                                    0
                                )}
                            </span>

                            <span class="offence-stat-label">
                                Offences
                            </span>

                        </div>

                        <div class="offence-stat">

                            <span class="offence-stat-value">
                                ${Number(
                                    data.seizureCount ||
                                    0
                                )}
                            </span>

                            <span class="offence-stat-label">
                                Seizures
                            </span>

                        </div>

                    </div>

                </div>

            `;


            html += `

                <div class="offence-cascade-section">

                    <div class="offence-section-title">
                        Linked Cases
                    </div>

            `;


            if (
                cases.length === 0
            ) {

                html += `

                    <div class="offence-empty">
                        No linked cases found.
                    </div>

                `;

            }

            else {

                html += `

                    <div class="offence-case-list">

                `;


                cases.forEach(

                    function (

                        caseRecord,

                        index

                    ) {

                        const caseId =

                            CascadeRenderer
                                .getCaseId(

                                    caseRecord

                                );


                        const caseTitle =

                            CascadeRenderer
                                .getCaseTitle(

                                    caseRecord,

                                    index

                                );


                        html += `

                            <button
                                type="button"
                                class="offence-case-item"
                                data-offence-action="select-case"
                                data-case-id="${CascadeRenderer.escapeAttribute(caseId)}"
                            >

                                <span class="offence-case-title">

                                    ${CascadeRenderer.escape(caseTitle)}

                                </span>

                                <span class="offence-case-arrow">
                                    ›
                                </span>

                            </button>

                        `;

                    }

                );


                html += `

                    </div>

                `;

            }


            html += `

                </div>

            `;


            content.innerHTML =
                html;

        };


    /* =====================================================
       16. RENDER CASE
       ===================================================== */

    CascadeRenderer.renderCase =
        function (

            data = {}

        ) {

            const content =

                CascadeRenderer
                    .getContent();


            if (!content) {

                return;

            }


            const caseRecord =

                data.case ||
                {};


            const accused =

                Array.isArray(
                    data.accused
                )

                    ? data.accused

                    : [];


            const seizures =

                Array.isArray(
                    data.seizures
                )

                    ? data.seizures

                    : [];


            const sources =

                Array.isArray(
                    data.sourceHotspots
                )

                    ? data.sourceHotspots

                    : [];


            const targets =

                Array.isArray(
                    data.targetHotspots
                )

                    ? data.targetHotspots

                    : [];


            let html = `

                <button
                    type="button"
                    class="offence-back-button"
                    data-offence-action="back-hotspot"
                >
                    ← Back to Hotspot
                </button>

                <div class="offence-cascade-section">

                    <div class="offence-section-title">
                        Case Details
                    </div>

                    ${CascadeRenderer.renderObjectFields(
                        caseRecord
                    )}

                </div>

            `;


            /* -------------------------
               Accused
               ------------------------- */

            html += `

                <div class="offence-cascade-section">

                    <div class="offence-section-title">

                        Accused (${accused.length})

                    </div>

            `;


            if (
                accused.length === 0
            ) {

                html += `

                    <div class="offence-empty">
                        No accused records available.
                    </div>

                `;

            }

            else {

                accused.forEach(

                    function (

                        person,

                        index

                    ) {

                        const accusedId =

                            CascadeRenderer
                                .getAccusedId(

                                    person

                                );


                        const name =

                            person.name ||

                            person.accusedName ||

                            "Accused " +
                            (
                                index + 1
                            );


                        html += `

                            <button
                                type="button"
                                class="offence-cascade-list-item"
                                data-offence-action="select-accused"
                                data-accused-id="${CascadeRenderer.escapeAttribute(accusedId)}"
                            >

                                ${CascadeRenderer.escape(name)}

                                <span>›</span>

                            </button>

                        `;

                    }

                );

            }


            html += `

                </div>

            `;


            /* -------------------------
               Seizures
               ------------------------- */

            html += `

                <div class="offence-cascade-section">

                    <div class="offence-section-title">

                        Seizures (${seizures.length})

                    </div>

            `;


            if (
                seizures.length === 0
            ) {

                html += `

                    <div class="offence-empty">
                        No seizure records available.
                    </div>

                `;

            }

            else {

                seizures.forEach(

                    function (

                        seizure,

                        index

                    ) {

                        const seizureId =

                            CascadeRenderer
                                .getSeizureId(

                                    seizure

                                );


                        const title =

                            seizure.item ||

                            seizure.seizureItem ||

                            seizure.category ||

                            "Seizure " +
                            (
                                index + 1
                            );


                        html += `

                            <button
                                type="button"
                                class="offence-cascade-list-item"
                                data-offence-action="select-seizure"
                                data-seizure-id="${CascadeRenderer.escapeAttribute(seizureId)}"
                            >

                                ${CascadeRenderer.escape(title)}

                                <span>›</span>

                            </button>

                        `;

                    }

                );

            }


            html += `

                </div>

            `;


            /* -------------------------
               Source Locations
               ------------------------- */

            html +=

                CascadeRenderer
                    .renderRelatedHotspots(

                        "Source Locations",

                        sources

                    );


            /* -------------------------
               Target Locations
               ------------------------- */

            html +=

                CascadeRenderer
                    .renderRelatedHotspots(

                        "Target Locations",

                        targets

                    );


            content.innerHTML =
                html;

        };


    /* =====================================================
       17. RENDER ACCUSED
       ===================================================== */

    CascadeRenderer.renderAccused =
        function (

            data = {}

        ) {

            const content =

                CascadeRenderer
                    .getContent();


            if (!content) {

                return;

            }


            const accused =

                data.selectedAccused ||
                {};


            content.innerHTML = `

                <button
                    type="button"
                    class="offence-back-button"
                    data-offence-action="back-case"
                >
                    ← Back to Case
                </button>

                <div class="offence-cascade-section">

                    <div class="offence-section-title">
                        Accused Details
                    </div>

                    ${CascadeRenderer.renderObjectFields(
                        accused
                    )}

                </div>

            `;

        };


    /* =====================================================
       18. RENDER SEIZURE
       ===================================================== */

    CascadeRenderer.renderSeizure =
        function (

            data = {}

        ) {

            const content =

                CascadeRenderer
                    .getContent();


            if (!content) {

                return;

            }


            const seizure =

                data.selectedSeizure ||
                {};


            content.innerHTML = `

                <button
                    type="button"
                    class="offence-back-button"
                    data-offence-action="back-case"
                >
                    ← Back to Case
                </button>

                <div class="offence-cascade-section">

                    <div class="offence-section-title">
                        Seizure Details
                    </div>

                    ${CascadeRenderer.renderObjectFields(
                        seizure
                    )}

                </div>

            `;

        };


    /* =====================================================
       19. RENDER RELATED HOTSPOTS
       ===================================================== */

    CascadeRenderer.renderRelatedHotspots =
        function (

            title,

            hotspots

        ) {

            if (
                !Array.isArray(
                    hotspots
                ) ||
                hotspots.length === 0
            ) {

                return "";

            }


            let html = `

                <div class="offence-cascade-section">

                    <div class="offence-section-title">

                        ${CascadeRenderer.escape(title)}

                        (${hotspots.length})

                    </div>

            `;


            hotspots.forEach(

                function (

                    hotspot

                ) {

                    html += `

                        <div class="offence-related-hotspot">

                            ${CascadeRenderer.escape(
                                CascadeRenderer.getHotspotName(
                                    hotspot
                                )
                            )}

                        </div>

                    `;

                }

            );


            html += `

                </div>

            `;


            return html;

        };


    /* =====================================================
       20. RENDER OBJECT FIELDS
       ===================================================== */

    CascadeRenderer.renderObjectFields =
        function (

            record

        ) {

            if (
                !record ||
                typeof record !==
                    "object"
            ) {

                return `

                    <div class="offence-empty">
                        No details available.
                    </div>

                `;

            }


            const entries =

                Object.entries(

                    record

                )

                    .filter(

                        function (

                            entry

                        ) {

                            const value =

                                entry[1];


                            return (

                                value !== null &&

                                value !== undefined &&

                                value !== "" &&

                                typeof value !==
                                    "object"

                            );

                        }

                    );


            if (
                entries.length === 0
            ) {

                return `

                    <div class="offence-empty">
                        No details available.
                    </div>

                `;

            }


            return entries

                .map(

                    function (

                        entry

                    ) {

                        const key =

                            entry[0];

                        const value =

                            entry[1];


                        return `

                            <div class="offence-detail-row">

                                <div class="offence-detail-label">

                                    ${CascadeRenderer.escape(
                                        CascadeRenderer.formatLabel(
                                            key
                                        )
                                    )}

                                </div>

                                <div class="offence-detail-value">

                                    ${CascadeRenderer.escape(
                                        String(
                                            value
                                        )
                                    )}

                                </div>

                            </div>

                        `;

                    }

                )

                .join("");

        };


    /* =====================================================
       21. GET HOTSPOT NAME
       ===================================================== */

    CascadeRenderer.getHotspotName =
        function (

            hotspot = {}

        ) {

            return (

                hotspot.name ||

                hotspot.location ||

                hotspot.place ||

                hotspot.address ||

                hotspot.village ||

                hotspot.hotspotId ||

                "Unknown Location"

            );

        };


    /* =====================================================
       22. GET CASE ID
       ===================================================== */

    CascadeRenderer.getCaseId =
        function (

            record = {}

        ) {

            return (

                record.caseId ||

                record.caseID ||

                record.case_id ||

                record.porNo ||

                record.porNumber ||

                record.id ||

                ""

            );

        };


    /* =====================================================
       23. GET CASE TITLE
       ===================================================== */

    CascadeRenderer.getCaseTitle =
        function (

            record = {},

            index = 0

        ) {

            return (

                record.caseNumber ||

                record.caseNo ||

                record.porNo ||

                record.porNumber ||

                record.caseId ||

                record.id ||

                "Case " +
                (
                    index + 1
                )

            );

        };


    /* =====================================================
       24. GET ACCUSED ID
       ===================================================== */

    CascadeRenderer.getAccusedId =
        function (

            record = {}

        ) {

            return (

                record.accusedId ||

                record.accusedID ||

                record.accused_id ||

                record.id ||

                record.name ||

                record.accusedName ||

                ""

            );

        };


    /* =====================================================
       25. GET SEIZURE ID
       ===================================================== */

    CascadeRenderer.getSeizureId =
        function (

            record = {}

        ) {

            return (

                record.seizureId ||

                record.seizureID ||

                record.seizure_id ||

                record.id ||

                [

                    record.caseId ||
                    "",

                    record.seizureDate ||
                    "",

                    record.placeOfSeizure ||
                    ""

                ].join("|")

            );

        };


    /* =====================================================
       26. FORMAT LABEL
       ===================================================== */

    CascadeRenderer.formatLabel =
        function (

            value

        ) {

            return String(

                value || ""

            )

                .replace(
                    /([a-z])([A-Z])/g,
                    "$1 $2"
                )

                .replace(
                    /_/g,
                    " "
                )

                .replace(
                    /\b\w/g,
                    function (
                        char
                    ) {

                        return char
                            .toUpperCase();

                    }
                );

        };


    /* =====================================================
       27. ESCAPE HTML
       ===================================================== */

    CascadeRenderer.escape =
        function (

            value

        ) {

            return String(

                value ??
                ""

            )

                .replace(
                    /&/g,
                    "&amp;"
                )

                .replace(
                    /</g,
                    "&lt;"
                )

                .replace(
                    />/g,
                    "&gt;"
                )

                .replace(
                    /"/g,
                    "&quot;"
                )

                .replace(
                    /'/g,
                    "&#039;"
                );

        };


    /* =====================================================
       28. ESCAPE ATTRIBUTE
       ===================================================== */

    CascadeRenderer.escapeAttribute =
        function (

            value

        ) {

            return CascadeRenderer
                .escape(

                    value

                );

        };


    /* =====================================================
       29. SHOW
       ===================================================== */

    CascadeRenderer.show =
        function () {

            const panel =

                CascadeRenderer
                    .getPanel();


            if (!panel) {

                return;

            }


            panel.style.display =
                "block";


            panel.classList.add(

                "is-open"

            );

        };


    /* =====================================================
       30. HIDE
       ===================================================== */

    CascadeRenderer.hide =
        function () {

            const panel =

                CascadeRenderer
                    .getPanel();


            if (!panel) {

                return;

            }


            panel.classList.remove(

                "is-open"

            );


            panel.style.display =
                "none";

        };


    /* =====================================================
       31. DESTROY
       ===================================================== */

    CascadeRenderer.destroy =
        function () {

            const panel =

                CascadeRenderer
                    .getPanel();


            if (panel) {

                panel.remove();

            }


            CascadeRenderer.initialized =
                false;


            CascadeRenderer._eventsBound =
                false;

        };


    /* =====================================================
       32. EXPORT
       ===================================================== */

    GG.Offence.CascadeRenderer =
        CascadeRenderer;


    /* =====================================================
       33. AUTO INITIALIZE
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(

            "DOMContentLoaded",

            function () {

                CascadeRenderer
                    .init();

            },

            {
                once:
                    true
            }

        );

    }

    else {

        CascadeRenderer
            .init();

    }


    /* =====================================================
       34. READY LOG
       ===================================================== */

    if (
        Constants.DEBUG
            ?.ENABLED
    ) {

        console.log(
            "🔥 OffenceCascadeRenderer Loaded"
        );

    }


})();
