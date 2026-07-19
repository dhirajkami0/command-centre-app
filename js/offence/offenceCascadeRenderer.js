/* =========================================================
   GreenGuard
   Offence Intelligence Module

   File:
   js/offence/offenceCascadeRenderer.js

   Version:
   2.1.0

   PURPOSE:
   ---------------------------------------------------------
   Render the interactive offence intelligence cascade UI.

   AUTHORITATIVE CONNECTOR:
   ---------------------------------------------------------
   POR No / Ref POR No
        ↓
   normalized porKey
        ↓
   Cases
        ↓
   Accused
   Witnesses
   Seizures
        ↓
   Seized Articles

   ARCHITECTURE:
   ---------------------------------------------------------

   OffenceMapRenderer
        ↓
   offence:hotspot-click
        ↓
   OffenceCascadeController
        ↓
   POR-authoritative cascade state
        ↓
   OffenceCascadeRenderer
        ↓
   Interactive Cascade Panel

   IMPORTANT:
   ---------------------------------------------------------

   This module:

   - DOES render cascade state
   - DOES render hotspot summary
   - DOES render POR relationships
   - DOES render case details
   - DOES render accused
   - DOES render witnesses
   - DOES render seizures
   - DOES render seized articles
   - DOES support cascade navigation

   This module DOES NOT:

   - access Firestore
   - geocode addresses
   - build heatmaps
   - normalize offence records
   - determine POR relationships
   - modify source data

   ========================================================= */

(function () {

    "use strict";


    /* =====================================================
       1. GLOBAL NAMESPACE
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
        GG.Offence.Constants ||
        {};


    const CascadeController =
        GG.Offence.CascadeController;


    if (!CascadeController) {

        console.error(
            "[OffenceCascadeRenderer] OffenceCascadeController unavailable."
        );

        return;

    }


    /* =====================================================
       3. MODULE
       ===================================================== */

    const CascadeRenderer = {};


    CascadeRenderer.VERSION =
        "2.1.0";


    CascadeRenderer.AUTHORITATIVE_CONNECTOR =
        "POR";


    CascadeRenderer.initialized =
        false;


    CascadeRenderer.visible =
        false;


    CascadeRenderer._eventsBound =
        false;


    CascadeRenderer.root =
        null;


    CascadeRenderer.content =
        null;


    CascadeRenderer.header =
        null;


    CascadeRenderer.title =
        null;


    CascadeRenderer.subtitle =
        null;


    CascadeRenderer.backButton =
        null;


    CascadeRenderer.closeButton =
        null;


    /* =====================================================
       4. DOM IDS
       ===================================================== */

    CascadeRenderer.IDS = {

        root:
            "offenceCascadePanel",

        header:
            "offenceCascadeHeader",

        backButton:
            "offenceCascadeBackButton",

        title:
            "offenceCascadeTitle",

        subtitle:
            "offenceCascadeSubtitle",

        closeButton:
            "offenceCascadeCloseButton",

        content:
            "offenceCascadeContent"

    };


    /* =====================================================
       5. LEVELS
       ===================================================== */

    CascadeRenderer.LEVEL =

        CascadeController.LEVEL ||

        Object.freeze({

            NONE:
                "NONE",

            HOTSPOT:
                "HOTSPOT",

            POR:
                "POR",

            CASE:
                "CASE",

            ACCUSED:
                "ACCUSED",

            WITNESS:
                "WITNESS",

            SEIZURE:
                "SEIZURE",

            ARTICLE:
                "ARTICLE"

        });


    /* =====================================================
       6. INITIALIZE
       ===================================================== */

    CascadeRenderer.init =
        function () {

            if (
                CascadeRenderer.initialized
            ) {

                return CascadeRenderer;

            }


            CascadeRenderer
                .injectStyles();


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

                    "🔥 OffenceCascadeRenderer Ready",

                    {

                        version:
                            CascadeRenderer.VERSION,

                        connector:
                            CascadeRenderer
                                .AUTHORITATIVE_CONNECTOR

                    }

                );

            }


            return CascadeRenderer;

        };


    /* =====================================================
       7. CREATE PANEL
       ===================================================== */

    CascadeRenderer.createPanel =
        function () {

            let root =

                document
                    .getElementById(
                        CascadeRenderer.IDS.root
                    );


            if (!root) {

                root =
                    document
                        .createElement(
                            "div"
                        );


                root.id =
                    CascadeRenderer.IDS.root;


                root.className =
                    "gg-offence-cascade-panel";


                root.innerHTML = `

                    <div
                        id="${CascadeRenderer.IDS.header}"
                        class="gg-offence-cascade-header"
                    >

                        <button
                            id="${CascadeRenderer.IDS.backButton}"
                            class="gg-offence-cascade-back"
                            type="button"
                            aria-label="Back"
                        >
                            ←
                        </button>


                        <div
                            class="gg-offence-cascade-heading"
                        >

                            <div
                                id="${CascadeRenderer.IDS.title}"
                                class="gg-offence-cascade-title"
                            >
                                Offence Intelligence
                            </div>


                            <div
                                id="${CascadeRenderer.IDS.subtitle}"
                                class="gg-offence-cascade-subtitle"
                            >
                                POR-linked intelligence
                            </div>

                        </div>


                        <button
                            id="${CascadeRenderer.IDS.closeButton}"
                            class="gg-offence-cascade-close"
                            type="button"
                            aria-label="Close"
                        >
                            ×
                        </button>

                    </div>


                    <div
                        id="${CascadeRenderer.IDS.content}"
                        class="gg-offence-cascade-content"
                    >
                    </div>

                `;


                document
                    .body
                    .appendChild(
                        root
                    );

            }


            CascadeRenderer.root =
                root;


            CascadeRenderer.header =

                document
                    .getElementById(
                        CascadeRenderer.IDS.header
                    );


            CascadeRenderer.backButton =

                document
                    .getElementById(
                        CascadeRenderer.IDS.backButton
                    );


            CascadeRenderer.title =

                document
                    .getElementById(
                        CascadeRenderer.IDS.title
                    );


            CascadeRenderer.subtitle =

                document
                    .getElementById(
                        CascadeRenderer.IDS.subtitle
                    );


            CascadeRenderer.closeButton =

                document
                    .getElementById(
                        CascadeRenderer.IDS.closeButton
                    );


            CascadeRenderer.content =

                document
                    .getElementById(
                        CascadeRenderer.IDS.content
                    );


            CascadeRenderer
                .bindPanelControls();


            return root;

        };


    /* =====================================================
       8. BIND PANEL CONTROLS
       ===================================================== */

    CascadeRenderer.bindPanelControls =
        function () {

            if (
                CascadeRenderer.closeButton
            ) {

                CascadeRenderer
                    .closeButton
                    .onclick =
                    function () {

                        if (
                            typeof CascadeController.close ===
                            "function"
                        ) {

                            CascadeController
                                .close();

                        }


                        CascadeRenderer
                            .hide();

                    };

            }


            if (
                CascadeRenderer.backButton
            ) {

                CascadeRenderer
                    .backButton
                    .onclick =
                    function () {

                        CascadeRenderer
                            .navigateBack();

                    };

            }

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


            const events =

                CascadeController.EVENTS ||
                {};


            const eventNames = [

                events.OPENED ||
                    "offence:cascade-opened",

                events.POR_SELECTED ||
                    "offence:cascade-por-selected",

                events.CASE_SELECTED ||
                    "offence:cascade-case-selected",

                events.ACCUSED_SELECTED ||
                    "offence:cascade-accused-selected",

                events.WITNESS_SELECTED ||
                    "offence:cascade-witness-selected",

                events.SEIZURE_SELECTED ||
                    "offence:cascade-seizure-selected",

                events.ARTICLE_SELECTED ||
                    "offence:cascade-article-selected",

                events.LEVEL_CHANGED ||
                    "offence:cascade-level-changed",

                events.UPDATED ||
                    "offence:cascade-updated"

            ];


            CascadeRenderer
                ._boundRenderHandler =
                CascadeRenderer
                    .handleCascadeEvent;


            [
                ...new Set(
                    eventNames
                        .filter(
                            Boolean
                        )
                )
            ]
                .forEach(

                    function (
                        eventName
                    ) {

                        window
                            .addEventListener(

                                eventName,

                                CascadeRenderer
                                    ._boundRenderHandler

                            );

                    }

                );


            CascadeRenderer
                ._boundClosedHandler =
                CascadeRenderer
                    .handleCascadeClosed;


            window
                .addEventListener(

                    events.CLOSED ||
                    "offence:cascade-closed",

                    CascadeRenderer
                        ._boundClosedHandler

                );

        };


    /* =====================================================
       10. HANDLE CASCADE EVENT
       ===================================================== */

    CascadeRenderer.handleCascadeEvent =
        function () {

            CascadeRenderer
                .render();

        };


    /* =====================================================
       11. HANDLE CLOSED
       ===================================================== */

    CascadeRenderer.handleCascadeClosed =
        function () {

            CascadeRenderer
                .hide();

        };


    /* =====================================================
       12. GET STATE
       ===================================================== */

    CascadeRenderer.getState =
        function () {

            if (
                typeof CascadeController
                    .getState ===
                    "function"
            ) {

                return (
                    CascadeController
                        .getState() ||
                    {}
                );

            }


            return (
                CascadeController.state ||
                {}
            );

        };


    /* =====================================================
       13. RENDER
       ===================================================== */

    CascadeRenderer.render =
        function (
            state = null
        ) {

            if (
                !CascadeRenderer.initialized
            ) {

                CascadeRenderer
                    .init();

            }


            state =
                state ||
                CascadeRenderer
                    .getState();


            if (
                !state ||
                state.open ===
                    false
            ) {

                CascadeRenderer
                    .hide();


                return {

                    success:
                        false,

                    reason:
                        "CASCADE_CLOSED"

                };

            }


            CascadeRenderer
                .show();


            CascadeRenderer
                .updateHeader(
                    state
                );


            CascadeRenderer
                .updateBackButton(
                    state
                );


            const level =

                CascadeRenderer
                    .normalizeLevel(
                        state.level
                    );


            let html =
                "";


            switch (
                level
            ) {

                case CascadeRenderer
                    .LEVEL
                    .HOTSPOT:

                    html =

                        CascadeRenderer
                            .renderHotspot(
                                state
                            );

                    break;


                case CascadeRenderer
                    .LEVEL
                    .POR:

                    html =

                        CascadeRenderer
                            .renderPor(
                                state
                            );

                    break;


                case CascadeRenderer
                    .LEVEL
                    .CASE:

                    html =

                        CascadeRenderer
                            .renderCase(
                                state
                            );

                    break;


                case CascadeRenderer
                    .LEVEL
                    .ACCUSED:

                    html =

                        CascadeRenderer
                            .renderAccused(
                                state
                            );

                    break;


                case CascadeRenderer
                    .LEVEL
                    .WITNESS:

                    html =

                        CascadeRenderer
                            .renderWitness(
                                state
                            );

                    break;


                case CascadeRenderer
                    .LEVEL
                    .SEIZURE:

                    html =

                        CascadeRenderer
                            .renderSeizure(
                                state
                            );

                    break;


                case CascadeRenderer
                    .LEVEL
                    .ARTICLE:

                    html =

                        CascadeRenderer
                            .renderArticle(
                                state
                            );

                    break;


                default:

                    html =

                        CascadeRenderer
                            .renderOverview(
                                state
                            );

            }


            if (
                CascadeRenderer.content
            ) {

                CascadeRenderer
                    .content
                    .innerHTML =
                    html;


                CascadeRenderer
                    .bindDynamicActions();

            }


            return {

                success:
                    true,

                level:
                    level

            };

        };


    /* =====================================================
       14. UPDATE HEADER
       ===================================================== */

    CascadeRenderer.updateHeader =
        function (
            state
        ) {

            const level =

                CascadeRenderer
                    .normalizeLevel(
                        state?.level
                    );


            const titles = {

                HOTSPOT:
                    "Offence Hotspot",

                POR:
                    "POR Intelligence",

                CASE:
                    "Case Details",

                ACCUSED:
                    "Accused Details",

                WITNESS:
                    "Witness Details",

                SEIZURE:
                    "Seizure Details",

                ARTICLE:
                    "Seized Article"

            };


            if (
                CascadeRenderer.title
            ) {

                CascadeRenderer
                    .title
                    .textContent =

                    titles[
                        level
                    ] ||

                    "Offence Intelligence";

            }


            const porNo =

                CascadeRenderer
                    .getCurrentPorNo(
                        state
                    );


            if (
                CascadeRenderer.subtitle
            ) {

                CascadeRenderer
                    .subtitle
                    .textContent =

                    porNo
                        ? "POR: " +
                            porNo
                        : "POR-linked intelligence";

            }

        };


    /* =====================================================
       15. UPDATE BACK BUTTON
       ===================================================== */

    CascadeRenderer.updateBackButton =
        function (
            state
        ) {

            if (
                !CascadeRenderer.backButton
            ) {

                return;

            }


            const level =

                CascadeRenderer
                    .normalizeLevel(
                        state?.level
                    );


            CascadeRenderer
                .backButton
                .style
                .visibility =

                (
                    level ===
                        CascadeRenderer
                            .LEVEL
                            .HOTSPOT ||

                    level ===
                        CascadeRenderer
                            .LEVEL
                            .NONE
                )

                    ? "hidden"

                    : "visible";

        };


    /* =====================================================
       16. RENDER HOTSPOT
       ===================================================== */

    CascadeRenderer.renderHotspot =
        function (
            state
        ) {

            const hotspot =

                state.hotspot ||
                {};


            const entryType =

                state.entryType ||
                hotspot.type ||
                "";


            const porKeys =

                CascadeRenderer
                    .toArray(

                        state.porKeys ||

                        hotspot.porKeys ||

                        hotspot.porKey

                    );


            const relations =

                CascadeRenderer
                    .getRelations(
                        state
                    );


            let html = `

                ${CascadeRenderer.renderBreadcrumb(
                    [
                        "Hotspot"
                    ]
                )}


                <div class="gg-offence-summary-card">

                    <div class="gg-offence-summary-label">
                        Intelligence Type
                    </div>

                    <div class="gg-offence-summary-value">
                        ${CascadeRenderer.escapeHtml(
                            entryType ||
                            "OFFENCE"
                        )}
                    </div>

                </div>


                ${CascadeRenderer.renderHotspotSummary(
                    hotspot
                )}


                <div class="gg-offence-section">

                    <div class="gg-offence-section-title">
                        Linked POR Records
                    </div>

            `;


            if (
                porKeys.length ===
                0
            ) {

                html +=

                    CascadeRenderer
                        .renderEmpty(
                            "No POR relationship found for this hotspot."
                        );

            }


            else {

                porKeys
                    .forEach(

                        function (
                            porKey
                        ) {

                            const relation =

                                CascadeRenderer
                                    .findRelationByPorKey(

                                        relations,

                                        porKey

                                    );


                            const porNo =

                                CascadeRenderer
                                    .getPorNo(

                                        relation ||

                                        {
                                            porKey:
                                                porKey
                                        }

                                    );


                            const caseCount =

                                CascadeRenderer
                                    .getRelationRecords(
                                        relation,
                                        "cases"
                                    )
                                    .length;


                            html += `

                                <button
                                    type="button"
                                    class="gg-offence-list-card"
                                    data-action="select-por"
                                    data-id="${CascadeRenderer.escapeAttribute(
                                        porKey
                                    )}"
                                >

                                    <div class="gg-offence-list-main">

                                        <div class="gg-offence-list-title">
                                            ${CascadeRenderer.escapeHtml(
                                                porNo ||
                                                porKey
                                            )}
                                        </div>

                                        <div class="gg-offence-list-meta">
                                            ${caseCount}
                                            linked case${caseCount === 1 ? "" : "s"}
                                        </div>

                                    </div>

                                    <div class="gg-offence-list-arrow">
                                        ›
                                    </div>

                                </button>

                            `;

                        }

                    );

            }


            html += `

                </div>

            `;


            return html;

        };


    /* =====================================================
       17. RENDER POR
       ===================================================== */

    CascadeRenderer.renderPor =
        function (
            state
        ) {

            const relation =

                state.currentPor ||

                state.selectedPor ||

                state.por ||

                {};


            const porKey =

                state.porKey ||

                relation.porKey ||

                relation.key ||

                "";


            const porNo =

                CascadeRenderer
                    .getPorNo(
                        relation
                    ) ||

                porKey;


            const cases =

                CascadeRenderer
                    .firstArray(

                        state.cases,

                        relation.cases,

                        relation.caseRecords

                    );


            const accused =

                CascadeRenderer
                    .firstArray(

                        state.accused,

                        relation.accused

                    );


            const witnesses =

                CascadeRenderer
                    .firstArray(

                        state.witnesses,

                        relation.witnesses

                    );


            const seizures =

                CascadeRenderer
                    .firstArray(

                        state.seizures,

                        relation.seizures

                    );


            const articles =

                CascadeRenderer
                    .firstArray(

                        state.articles,

                        state.seizedArticles,

                        relation.articles,

                        relation.seizedArticles

                    );


            let html = `

                ${CascadeRenderer.renderBreadcrumb(
                    [
                        "Hotspot",
                        porNo ||
                        "POR"
                    ]
                )}


                <div class="gg-offence-summary-card">

                    <div class="gg-offence-summary-label">
                        Ref POR No
                    </div>

                    <div class="gg-offence-summary-value">
                        ${CascadeRenderer.escapeHtml(
                            porNo ||
                            "Not available"
                        )}
                    </div>

                </div>


                ${CascadeRenderer.renderCountGrid({

                    Cases:
                        cases.length,

                    Accused:
                        accused.length,

                    Witnesses:
                        witnesses.length,

                    Seizures:
                        seizures.length,

                    Articles:
                        articles.length

                })}


                <div class="gg-offence-section">

                    <div class="gg-offence-section-title">
                        Cases
                    </div>

            `;


            if (
                cases.length ===
                0
            ) {

                html +=

                    CascadeRenderer
                        .renderEmpty(
                            "No linked cases found."
                        );

            }


            else {

                cases
                    .forEach(

                        function (
                            record
                        ) {

                            html +=

                                CascadeRenderer
                                    .renderCaseListItem(
                                        record
                                    );

                        }

                    );

            }


            html += `
                </div>
            `;


            html +=

                CascadeRenderer
                    .renderRelatedRecords(

                        "Accused",

                        accused,

                        "select-accused",

                        CascadeRenderer
                            .getAccusedId,

                        function (
                            record
                        ) {

                            return (
                                record.name ||

                                record.accusedName ||

                                record.Name ||

                                "Accused"
                            );

                        }

                    );


            html +=

                CascadeRenderer
                    .renderRelatedRecords(

                        "Witnesses",

                        witnesses,

                        "select-witness",

                        CascadeRenderer
                            .getWitnessId,

                        function (
                            record
                        ) {

                            return (
                                record.name ||

                                record.witnessName ||

                                record.Name ||

                                "Witness"
                            );

                        }

                    );


            html +=

                CascadeRenderer
                    .renderRelatedRecords(

                        "Seizures",

                        seizures,

                        "select-seizure",

                        CascadeRenderer
                            .getSeizureId,

                        function (
                            record
                        ) {

                            return (
                                record.seizureDescription ||

                                record.description ||

                                record.placeOfSeizure ||

                                "Seizure"
                            );

                        }

                    );


            return html;

        };


    /* =====================================================
       18. RENDER CASE
       ===================================================== */

    CascadeRenderer.renderCase =
        function (
            state
        ) {

            const record =

                state.currentCase ||

                state.selectedCase ||

                state.case ||

                {};


            const caseId =

                CascadeRenderer
                    .getCaseId(
                        record
                    );


            const porNo =

                CascadeRenderer
                    .getPorNo(
                        record
                    ) ||

                CascadeRenderer
                    .getCurrentPorNo(
                        state
                    );


            const accused =

                CascadeRenderer
                    .firstArray(

                        state.accused,

                        record.accused

                    );


            const witnesses =

                CascadeRenderer
                    .firstArray(

                        state.witnesses,

                        record.witnesses

                    );


            const seizures =

                CascadeRenderer
                    .firstArray(

                        state.seizures,

                        record.seizures

                    );


            let html = `

                ${CascadeRenderer.renderBreadcrumb(
                    [
                        "Hotspot",
                        porNo ||
                        "POR",
                        caseId ||
                        "Case"
                    ]
                )}


                ${CascadeRenderer.renderDetailCard(

                    "Case Information",

                    [

                        [
                            "Case ID",
                            caseId
                        ],

                        [
                            "Ref POR No",
                            porNo
                        ],

                        [
                            "Nature of Offence",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "natureOfOffence",
                                        "offenceNature",
                                        "Nature of Offence",
                                        "offence"
                                    ]

                                )

                        ],

                        [
                            "Offence Date",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "offenceDate",
                                        "dateOfOffence",
                                        "Offence Date"
                                    ]

                                )

                        ],

                        [
                            "Place of Offence",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "placeOfOffence",
                                        "offencePlace",
                                        "Place of Offence",
                                        "location"
                                    ]

                                )

                        ],

                        [
                            "Range",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "range",
                                        "Range"
                                    ]

                                )

                        ],

                        [
                            "Beat",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "beat",
                                        "Beat"
                                    ]

                                )

                        ],

                        [
                            "Case Status",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "caseStatus",
                                        "status",
                                        "Case Status"
                                    ]

                                )

                        ]

                    ]

                )}


                ${CascadeRenderer.renderCountGrid({

                    Accused:
                        accused.length,

                    Witnesses:
                        witnesses.length,

                    Seizures:
                        seizures.length

                })}

            `;


            html +=

                CascadeRenderer
                    .renderRelatedRecords(

                        "Accused",

                        accused,

                        "select-accused",

                        CascadeRenderer
                            .getAccusedId,

                        function (
                            item
                        ) {

                            return (
                                item.name ||

                                item.accusedName ||

                                item.Name ||

                                "Accused"
                            );

                        }

                    );


            html +=

                CascadeRenderer
                    .renderRelatedRecords(

                        "Witnesses",

                        witnesses,

                        "select-witness",

                        CascadeRenderer
                            .getWitnessId,

                        function (
                            item
                        ) {

                            return (
                                item.name ||

                                item.witnessName ||

                                item.Name ||

                                "Witness"
                            );

                        }

                    );


            html +=

                CascadeRenderer
                    .renderRelatedRecords(

                        "Seizures",

                        seizures,

                        "select-seizure",

                        CascadeRenderer
                            .getSeizureId,

                        function (
                            item
                        ) {

                            return (
                                item.seizureDescription ||

                                item.description ||

                                item.placeOfSeizure ||

                                "Seizure"
                            );

                        }

                    );


            return html;

        };


    /* =====================================================
       19. RENDER ACCUSED
       ===================================================== */

    CascadeRenderer.renderAccused =
        function (
            state
        ) {

            const record =

                state.currentAccused ||

                state.selectedAccused ||

                state.accusedRecord ||

                {};


            return `

                ${CascadeRenderer.renderBreadcrumb(
                    [
                        "Hotspot",
                        CascadeRenderer
                            .getCurrentPorNo(
                                state
                            ) ||
                        "POR",
                        "Accused"
                    ]
                )}


                ${CascadeRenderer.renderDetailCard(

                    "Accused Details",

                    [

                        [
                            "Accused ID",

                            CascadeRenderer
                                .getAccusedId(
                                    record
                                )

                        ],

                        [
                            "Name",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "name",
                                        "accusedName",
                                        "Name",
                                        "Name of Accused"
                                    ]

                                )

                        ],

                        [
                            "Ref POR No",

                            CascadeRenderer
                                .getPorNo(
                                    record
                                )

                        ],

                        [
                            "Father / Guardian",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "fatherName",
                                        "guardianName",
                                        "Father Name"
                                    ]

                                )

                        ],

                        [
                            "Address",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "fullAddress",
                                        "address",
                                        "Full Address"
                                    ]

                                )

                        ],

                        [
                            "Village",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "village",
                                        "Village"
                                    ]

                                )

                        ],

                        [
                            "District",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "district",
                                        "District"
                                    ]

                                )

                        ],

                        [
                            "Contact No",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "contactNo",
                                        "phone",
                                        "mobile",
                                        "Contact No"
                                    ]

                                )

                        ],

                        [
                            "Status",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "status",
                                        "accusedStatus",
                                        "Status"
                                    ]

                                )

                        ]

                    ]

                )}

            `;

        };


    /* =====================================================
       20. RENDER WITNESS
       ===================================================== */

    CascadeRenderer.renderWitness =
        function (
            state
        ) {

            const record =

                state.currentWitness ||

                state.selectedWitness ||

                state.witnessRecord ||

                {};


            return `

                ${CascadeRenderer.renderBreadcrumb(
                    [
                        "Hotspot",
                        CascadeRenderer
                            .getCurrentPorNo(
                                state
                            ) ||
                        "POR",
                        "Witness"
                    ]
                )}


                ${CascadeRenderer.renderDetailCard(

                    "Witness Details",

                    [

                        [
                            "Witness ID",

                            CascadeRenderer
                                .getWitnessId(
                                    record
                                )

                        ],

                        [
                            "Name",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "name",
                                        "witnessName",
                                        "Name",
                                        "Name of Witness"
                                    ]

                                )

                        ],

                        [
                            "Ref POR No",

                            CascadeRenderer
                                .getPorNo(
                                    record
                                )

                        ],

                        [
                            "Address",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "fullAddress",
                                        "address",
                                        "Full Address"
                                    ]

                                )

                        ],

                        [
                            "Present Posting",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "presentPlaceOfPosting",
                                        "posting",
                                        "Present Place of Posting"
                                    ]

                                )

                        ],

                        [
                            "Contact No",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "contactNo",
                                        "phone",
                                        "mobile",
                                        "Contact No"
                                    ]

                                )

                        ],

                        [
                            "Email",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "email",
                                        "Email"
                                    ]

                                )

                        ],

                        [
                            "Village",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "village",
                                        "Village"
                                    ]

                                )

                        ],

                        [
                            "District",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "district",
                                        "District"
                                    ]

                                )

                        ]

                    ]

                )}

            `;

        };


    /* =====================================================
       21. RENDER SEIZURE
       ===================================================== */

    CascadeRenderer.renderSeizure =
        function (
            state
        ) {

            const record =

                state.currentSeizure ||

                state.selectedSeizure ||

                state.seizure ||

                {};


            const seizureId =

                CascadeRenderer
                    .getSeizureId(
                        record
                    );


            const articles =

                CascadeRenderer
                    .firstArray(

                        state.articles,

                        state.seizedArticles,

                        record.articles,

                        record.seizedArticles

                    );


            let html = `

                ${CascadeRenderer.renderBreadcrumb(
                    [
                        "Hotspot",
                        CascadeRenderer
                            .getCurrentPorNo(
                                state
                            ) ||
                        "POR",
                        "Seizure"
                    ]
                )}


                ${CascadeRenderer.renderDetailCard(

                    "Seizure Details",

                    [

                        [
                            "Seizure ID",
                            seizureId
                        ],

                        [
                            "Ref POR No",

                            CascadeRenderer
                                .getPorNo(
                                    record
                                )

                        ],

                        [
                            "Seizure Date",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "seizureDate",
                                        "dateOfSeizure",
                                        "Seizure Date"
                                    ]

                                )

                        ],

                        [
                            "Place of Seizure",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "placeOfSeizure",
                                        "seizurePlace",
                                        "Place of Seizure"
                                    ]

                                )

                        ],

                        [
                            "Seized From",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "seizedFrom",
                                        "Seized From"
                                    ]

                                )

                        ],

                        [
                            "Remarks",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "remarks",
                                        "Remarks"
                                    ]

                                )

                        ]

                    ]

                )}


                <div class="gg-offence-section">

                    <div class="gg-offence-section-title">
                        Seized Articles
                        <span class="gg-offence-section-count">
                            ${articles.length}
                        </span>
                    </div>

            `;


            if (
                articles.length ===
                0
            ) {

                html +=

                    CascadeRenderer
                        .renderEmpty(
                            "No seized articles linked to this seizure."
                        );

            }


            else {

                articles
                    .forEach(

                        function (
                            article
                        ) {

                            const articleId =

                                CascadeRenderer
                                    .getArticleId(
                                        article
                                    );


                            const description =

                                CascadeRenderer
                                    .pick(

                                        article,

                                        [
                                            "articleDescription",
                                            "description",
                                            "Article Description"
                                        ]

                                    ) ||

                                "Seized Article";


                            html += `

                                <button
                                    type="button"
                                    class="gg-offence-list-card"
                                    data-action="select-article"
                                    data-id="${CascadeRenderer.escapeAttribute(
                                        articleId
                                    )}"
                                >

                                    <div class="gg-offence-list-main">

                                        <div class="gg-offence-list-title">
                                            ${CascadeRenderer.escapeHtml(
                                                description
                                            )}
                                        </div>


                                        <div class="gg-offence-list-meta">

                                            ${CascadeRenderer.escapeHtml(

                                                CascadeRenderer
                                                    .formatArticleQuantity(
                                                        article
                                                    )

                                            )}

                                        </div>

                                    </div>


                                    <div class="gg-offence-list-arrow">
                                        ›
                                    </div>

                                </button>

                            `;

                        }

                    );

            }


            html += `
                </div>
            `;


            return html;

        };


    /* =====================================================
       22. RENDER ARTICLE
       ===================================================== */

    CascadeRenderer.renderArticle =
        function (
            state
        ) {

            const record =

                state.currentArticle ||

                state.selectedArticle ||

                state.article ||

                {};


            return `

                ${CascadeRenderer.renderBreadcrumb(
                    [
                        "Hotspot",
                        CascadeRenderer
                            .getCurrentPorNo(
                                state
                            ) ||
                        "POR",
                        "Seizure",
                        "Article"
                    ]
                )}


                ${CascadeRenderer.renderDetailCard(

                    "Seized Article",

                    [

                        [
                            "Article ID",

                            CascadeRenderer
                                .getArticleId(
                                    record
                                )

                        ],

                        [
                            "Seizure ID",

                            CascadeRenderer
                                .getSeizureId(
                                    record
                                )

                        ],

                        [
                            "Ref POR No",

                            CascadeRenderer
                                .getPorNo(
                                    record
                                )

                        ],

                        [
                            "Article Description",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "articleDescription",
                                        "description",
                                        "Article Description"
                                    ]

                                )

                        ],

                        [
                            "Quantity",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "quantity",
                                        "Quantity"
                                    ]

                                )

                        ],

                        [
                            "Measurement",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "measurement",
                                        "Measurement"
                                    ]

                                )

                        ],

                        [
                            "Volume",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "volume",
                                        "Volume"
                                    ]

                                )

                        ],

                        [
                            "Source",

                            CascadeRenderer
                                .pick(

                                    record,

                                    [
                                        "source",
                                        "Source"
                                    ]

                                )

                        ]

                    ]

                )}

            `;

        };


    /* =====================================================
       23. RENDER OVERVIEW
       ===================================================== */

    CascadeRenderer.renderOverview =
        function () {

            return `

                <div class="gg-offence-empty">

                    <div class="gg-offence-empty-title">
                        Offence Intelligence
                    </div>

                    <div class="gg-offence-empty-text">
                        Select a source or target hotspot to view
                        POR-linked case intelligence.
                    </div>

                </div>

            `;

        };


    /* =====================================================
       24. HOTSPOT SUMMARY
       ===================================================== */

    CascadeRenderer.renderHotspotSummary =
        function (
            hotspot
        ) {

            if (!hotspot) {

                return "";

            }


            const location =

                hotspot.location ||

                hotspot.address ||

                hotspot.village ||

                hotspot.place ||

                hotspot.label ||

                "";


            const lat =

                hotspot.lat ??

                hotspot.latitude ??
                "";


            const lng =

                hotspot.lng ??

                hotspot.lon ??

                hotspot.longitude ??
                "";


            return CascadeRenderer
                .renderDetailCard(

                    "Hotspot Details",

                    [

                        [
                            "Location",
                            location
                        ],

                        [
                            "Latitude",
                            lat
                        ],

                        [
                            "Longitude",
                            lng
                        ],

                        [
                            "Linked Records",

                            hotspot.count ??

                            hotspot.caseCount ??

                            hotspot.total ??
                            ""
                        ]

                    ]

                );

        };


    /* =====================================================
       25. CASE LIST ITEM
       ===================================================== */

    CascadeRenderer.renderCaseListItem =
        function (
            record
        ) {

            const caseId =

                CascadeRenderer
                    .getCaseId(
                        record
                    );


            const title =

                CascadeRenderer
                    .pick(

                        record,

                        [
                            "caseTitle",
                            "natureOfOffence",
                            "offenceNature",
                            "Nature of Offence"
                        ]

                    ) ||

                caseId ||

                "Case";


            const meta =

                CascadeRenderer
                    .getPorNo(
                        record
                    ) ||

                "";


            return `

                <button
                    type="button"
                    class="gg-offence-list-card"
                    data-action="select-case"
                    data-id="${CascadeRenderer.escapeAttribute(
                        caseId
                    )}"
                >

                    <div class="gg-offence-list-main">

                        <div class="gg-offence-list-title">
                            ${CascadeRenderer.escapeHtml(
                                title
                            )}
                        </div>

                        <div class="gg-offence-list-meta">
                            ${CascadeRenderer.escapeHtml(
                                meta
                            )}
                        </div>

                    </div>

                    <div class="gg-offence-list-arrow">
                        ›
                    </div>

                </button>

            `;

        };


    /* =====================================================
       26. RELATED RECORDS
       ===================================================== */

    CascadeRenderer.renderRelatedRecords =
        function (
            title,
            records,
            action,
            idGetter,
            labelGetter
        ) {

            records =
                Array.isArray(
                    records
                )
                    ? records
                    : [];


            let html = `

                <div class="gg-offence-section">

                    <div class="gg-offence-section-title">

                        ${CascadeRenderer.escapeHtml(
                            title
                        )}

                        <span class="gg-offence-section-count">
                            ${records.length}
                        </span>

                    </div>

            `;


            if (
                records.length ===
                0
            ) {

                html +=

                    CascadeRenderer
                        .renderEmpty(
                            "No records available."
                        );

            }


            else {

                records
                    .forEach(

                        function (
                            record
                        ) {

                            const id =

                                idGetter(
                                    record
                                );


                            const label =

                                labelGetter(
                                    record
                                );


                            html += `

                                <button
                                    type="button"
                                    class="gg-offence-list-card"
                                    data-action="${CascadeRenderer.escapeAttribute(
                                        action
                                    )}"
                                    data-id="${CascadeRenderer.escapeAttribute(
                                        id
                                    )}"
                                >

                                    <div class="gg-offence-list-main">

                                        <div class="gg-offence-list-title">
                                            ${CascadeRenderer.escapeHtml(
                                                label
                                            )}
                                        </div>

                                        <div class="gg-offence-list-meta">
                                            ${CascadeRenderer.escapeHtml(
                                                CascadeRenderer
                                                    .getPorNo(
                                                        record
                                                    ) ||
                                                ""
                                            )}
                                        </div>

                                    </div>

                                    <div class="gg-offence-list-arrow">
                                        ›
                                    </div>

                                </button>

                            `;

                        }

                    );

            }


            html += `
                </div>
            `;


            return html;

        };


    /* =====================================================
       27. DETAIL CARD
       ===================================================== */

    CascadeRenderer.renderDetailCard =
        function (
            title,
            fields
        ) {

            const validFields =

                (
                    fields ||
                    []
                )
                    .filter(

                        function (
                            field
                        ) {

                            return (

                                field &&

                                field[1] !==
                                    undefined &&

                                field[1] !==
                                    null &&

                                String(
                                    field[1]
                                )
                                    .trim() !==
                                    ""

                            );

                        }

                    );


            if (
                validFields.length ===
                0
            ) {

                return "";

            }


            let html = `

                <div class="gg-offence-detail-card">

                    <div class="gg-offence-section-title">
                        ${CascadeRenderer.escapeHtml(
                            title
                        )}
                    </div>

            `;


            validFields
                .forEach(

                    function (
                        field
                    ) {

                        html += `

                            <div class="gg-offence-detail-row">

                                <div class="gg-offence-detail-label">
                                    ${CascadeRenderer.escapeHtml(
                                        field[0]
                                    )}
                                </div>

                                <div class="gg-offence-detail-value">
                                    ${CascadeRenderer.escapeHtml(
                                        CascadeRenderer
                                            .formatValue(
                                                field[1]
                                            )
                                    )}
                                </div>

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
       28. COUNT GRID
       ===================================================== */

    CascadeRenderer.renderCountGrid =
        function (
            counts
        ) {

            let html = `

                <div class="gg-offence-count-grid">

            `;


            Object
                .entries(
                    counts ||
                    {}
                )
                .forEach(

                    function (
                        entry
                    ) {

                        html += `

                            <div class="gg-offence-count-card">

                                <div class="gg-offence-count-value">
                                    ${CascadeRenderer.escapeHtml(
                                        entry[1]
                                    )}
                                </div>

                                <div class="gg-offence-count-label">
                                    ${CascadeRenderer.escapeHtml(
                                        entry[0]
                                    )}
                                </div>

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
       29. BREADCRUMB
       ===================================================== */

    CascadeRenderer.renderBreadcrumb =
        function (
            items
        ) {

            return `

                <div class="gg-offence-breadcrumb">

                    ${
                        (
                            items ||
                            []
                        )
                            .map(

                                function (
                                    item
                                ) {

                                    return (

                                        "<span>" +

                                        CascadeRenderer
                                            .escapeHtml(
                                                item
                                            ) +

                                        "</span>"

                                    );

                                }

                            )
                            .join(
                                "<b>›</b>"
                            )
                    }

                </div>

            `;

        };


    /* =====================================================
       30. EMPTY STATE
       ===================================================== */

    CascadeRenderer.renderEmpty =
        function (
            message
        ) {

            return `

                <div class="gg-offence-empty-inline">
                    ${CascadeRenderer.escapeHtml(
                        message
                    )}
                </div>

            `;

        };


    /* =====================================================
       31. DYNAMIC ACTIONS
       ===================================================== */

    CascadeRenderer.bindDynamicActions =
        function () {

            if (
                !CascadeRenderer.content
            ) {

                return;

            }


            CascadeRenderer
                .content
                .querySelectorAll(
                    "[data-action]"
                )
                .forEach(

                    function (
                        element
                    ) {

                        element
                            .addEventListener(

                                "click",

                                function () {

                                    const action =

                                        element
                                            .dataset
                                            .action;


                                    const id =

                                        element
                                            .dataset
                                            .id;


                                    CascadeRenderer
                                        .handleAction(

                                            action,

                                            id

                                        );

                                }

                            );

                    }

                );

        };


    /* =====================================================
       32. HANDLE ACTION
       ===================================================== */

    CascadeRenderer.handleAction =
        function (
            action,
            id
        ) {

            if (!id) {

                return;

            }


            switch (
                action
            ) {

                case "select-por":

                    if (
                        typeof CascadeController
                            .selectPor ===
                            "function"
                    ) {

                        CascadeController
                            .selectPor(
                                id
                            );

                    }

                    break;


                case "select-case":

                    if (
                        typeof CascadeController
                            .selectCase ===
                            "function"
                    ) {

                        CascadeController
                            .selectCase(
                                id
                            );

                    }

                    break;


                case "select-accused":

                    if (
                        typeof CascadeController
                            .selectAccused ===
                            "function"
                    ) {

                        CascadeController
                            .selectAccused(
                                id
                            );

                    }

                    break;


                case "select-witness":

                    if (
                        typeof CascadeController
                            .selectWitness ===
                            "function"
                    ) {

                        CascadeController
                            .selectWitness(
                                id
                            );

                    }

                    break;


                case "select-seizure":

                    if (
                        typeof CascadeController
                            .selectSeizure ===
                            "function"
                    ) {

                        CascadeController
                            .selectSeizure(
                                id
                            );

                    }

                    break;


                case "select-article":

                    if (
                        typeof CascadeController
                            .selectArticle ===
                            "function"
                    ) {

                        CascadeController
                            .selectArticle(
                                id
                            );

                    }

                    break;

            }

        };


    /* =====================================================
       33. NAVIGATE BACK
       ===================================================== */

    CascadeRenderer.navigateBack =
        function () {

            const state =

                CascadeRenderer
                    .getState();


            const level =

                CascadeRenderer
                    .normalizeLevel(
                        state?.level
                    );


            switch (
                level
            ) {

                case CascadeRenderer
                    .LEVEL
                    .ARTICLE:

                    if (
                        typeof CascadeController
                            .backToCase ===
                            "function"
                    ) {

                        CascadeController
                            .backToCase();

                    }

                    break;


                case CascadeRenderer
                    .LEVEL
                    .SEIZURE:

                case CascadeRenderer
                    .LEVEL
                    .ACCUSED:

                case CascadeRenderer
                    .LEVEL
                    .WITNESS:

                    if (
                        typeof CascadeController
                            .backToCase ===
                            "function"
                    ) {

                        CascadeController
                            .backToCase();

                    }

                    break;


                case CascadeRenderer
                    .LEVEL
                    .CASE:

                    if (
                        typeof CascadeController
                            .backToPor ===
                            "function"
                    ) {

                        CascadeController
                            .backToPor();

                    }

                    break;


                case CascadeRenderer
                    .LEVEL
                    .POR:

                    if (
                        typeof CascadeController
                            .backToHotspot ===
                            "function"
                    ) {

                        CascadeController
                            .backToHotspot();

                    }

                    break;

            }

        };


    /* =====================================================
       34. SHOW
       ===================================================== */

    CascadeRenderer.show =
        function () {

            if (
                !CascadeRenderer.root
            ) {

                CascadeRenderer
                    .createPanel();

            }


            if (
                CascadeRenderer.root
            ) {

                CascadeRenderer
                    .root
                    .classList
                    .add(
                        "gg-offence-cascade-visible"
                    );

            }


            CascadeRenderer.visible =
                true;

        };


    /* =====================================================
       35. HIDE
       ===================================================== */

    CascadeRenderer.hide =
        function () {

            if (
                CascadeRenderer.root
            ) {

                CascadeRenderer
                    .root
                    .classList
                    .remove(
                        "gg-offence-cascade-visible"
                    );

            }


            CascadeRenderer.visible =
                false;

        };


    /* =====================================================
       36. RELATION HELPERS
       ===================================================== */

    CascadeRenderer.getRelations =
        function (
            state
        ) {

            return CascadeRenderer
                .firstArray(

                    state?.relations,

                    state?.porRelations,

                    state?.hotspot?.relations

                );

        };


    CascadeRenderer.findRelationByPorKey =
        function (
            relations,
            porKey
        ) {

            const normalized =

                CascadeRenderer
                    .normalizePorKey(
                        porKey
                    );


            return (

                (
                    relations ||
                    []
                )
                    .find(

                        function (
                            relation
                        ) {

                            return (

                                CascadeRenderer
                                    .normalizePorKey(

                                        relation
                                            ?.porKey ||

                                        CascadeRenderer
                                            .getPorNo(
                                                relation
                                            )

                                    ) ===

                                normalized

                            );

                        }

                    ) ||

                null

            );

        };


    CascadeRenderer.getRelationRecords =
        function (
            relation,
            key
        ) {

            if (
                !relation
            ) {

                return [];

            }


            return Array.isArray(
                relation[
                    key
                ]
            )
                ? relation[
                    key
                ]
                : [];

        };


    /* =====================================================
       37. CURRENT POR
       ===================================================== */

    CascadeRenderer.getCurrentPorNo =
        function (
            state
        ) {

            return (

                CascadeRenderer
                    .getPorNo(

                        state
                            ?.currentPor

                    ) ||

                CascadeRenderer
                    .getPorNo(

                        state
                            ?.selectedPor

                    ) ||

                state
                    ?.porNo ||

                state
                    ?.refPorNo ||

                state
                    ?.porKey ||

                CascadeRenderer
                    .getPorNo(

                        state
                            ?.currentCase

                    ) ||

                ""

            );

        };


    /* =====================================================
       38. ID GETTERS
       ===================================================== */

    CascadeRenderer.getCaseId =
        function (
            record
        ) {

            return (

                record?.caseId ||

                record?.CaseID ||

                record?.id ||

                record?.docId ||

                ""

            );

        };


    CascadeRenderer.getAccusedId =
        function (
            record
        ) {

            return (

                record?.accusedId ||

                record?.AccusedID ||

                record?.id ||

                record?.docId ||

                ""

            );

        };


    CascadeRenderer.getWitnessId =
        function (
            record
        ) {

            return (

                record?.witnessId ||

                record?.WitnessID ||

                record?.id ||

                record?.docId ||

                ""

            );

        };


    CascadeRenderer.getSeizureId =
        function (
            record
        ) {

            return (

                record?.seizureId ||

                record?.SeizureID ||

                record?.id ||

                record?.docId ||

                ""

            );

        };


    CascadeRenderer.getArticleId =
        function (
            record
        ) {

            return (

                record?.articleId ||

                record?.ArticleID ||

                record?.id ||

                record?.docId ||

                ""

            );

        };


    /* =====================================================
       39. POR GETTER
       ===================================================== */

    CascadeRenderer.getPorNo =
        function (
            record
        ) {

            if (!record) {

                return "";

            }


            return (

                record.refPorNo ||

                record.refPORNo ||

                record.porNo ||

                record.PORNo ||

                record["Ref POR No"] ||

                record.porKey ||

                ""

            );

        };


    CascadeRenderer.normalizePorKey =
        function (
            value
        ) {

            if (
                typeof CascadeController
                    .normalizePorKey ===
                    "function"
            ) {

                return CascadeController
                    .normalizePorKey(
                        value
                    );

            }


            return String(
                value ||
                ""
            )
                .trim()
                .toUpperCase()
                .replace(
                    /\s+/g,
                    " "
                );

        };


    /* =====================================================
       40. GENERIC HELPERS
       ===================================================== */

    CascadeRenderer.normalizeLevel =
        function (
            level
        ) {

            return String(
                level ||
                "NONE"
            )
                .trim()
                .toUpperCase();

        };


    CascadeRenderer.toArray =
        function (
            value
        ) {

            if (
                Array.isArray(
                    value
                )
            ) {

                return value
                    .filter(
                        Boolean
                    );

            }


            if (
                value ===
                    undefined ||

                value ===
                    null ||

                value ===
                    ""
            ) {

                return [];

            }


            return [
                value
            ];

        };


    CascadeRenderer.firstArray =
        function (
            ...values
        ) {

            for (
                const value
                of values
            ) {

                if (
                    Array.isArray(
                        value
                    ) &&
                    value.length >
                        0
                ) {

                    return value;

                }

            }


            for (
                const value
                of values
            ) {

                if (
                    Array.isArray(
                        value
                    )
                ) {

                    return value;

                }

            }


            return [];

        };


    CascadeRenderer.pick =
        function (
            object,
            keys
        ) {

            if (
                !object
            ) {

                return "";

            }


            for (
                const key
                of keys
            ) {

                const value =
                    object[
                        key
                    ];


                if (
                    value !==
                        undefined &&

                    value !==
                        null &&

                    String(
                        value
                    )
                        .trim() !==
                        ""
                ) {

                    return value;

                }

            }


            return "";

        };


    CascadeRenderer.formatValue =
        function (
            value
        ) {

            if (
                value ===
                    undefined ||

                value ===
                    null
            ) {

                return "";

            }


            if (
                Array.isArray(
                    value
                )
            ) {

                return value
                    .join(
                        ", "
                    );

            }


            if (
                typeof value ===
                    "object"
            ) {

                try {

                    return JSON
                        .stringify(
                            value
                        );

                }

                catch (
                    error
                ) {

                    return String(
                        value
                    );

                }

            }


            return String(
                value
            );

        };


    CascadeRenderer.formatArticleQuantity =
        function (
            article
        ) {

            const values = [

                CascadeRenderer
                    .pick(
                        article,
                        [
                            "quantity",
                            "Quantity"
                        ]
                    ),

                CascadeRenderer
                    .pick(
                        article,
                        [
                            "measurement",
                            "Measurement"
                        ]
                    ),

                CascadeRenderer
                    .pick(
                        article,
                        [
                            "volume",
                            "Volume"
                        ]
                    )

            ]
                .filter(
                    Boolean
                );


            return values
                .join(
                    " • "
                );

        };


    /* =====================================================
       41. HTML ESCAPING
       ===================================================== */

    CascadeRenderer.escapeHtml =
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


    CascadeRenderer.escapeAttribute =
        function (
            value
        ) {

            return CascadeRenderer
                .escapeHtml(
                    value
                );

        };


    /* =====================================================
       42. INJECT STYLES
       ===================================================== */

    CascadeRenderer.injectStyles =
        function () {

            if (
                document
                    .getElementById(
                        "offenceCascadeRendererStyles"
                    )
            ) {

                return;

            }


            const style =

                document
                    .createElement(
                        "style"
                    );


            style.id =
                "offenceCascadeRendererStyles";


            style.textContent = `

                .gg-offence-cascade-panel {

                    position: fixed;

                    top: 72px;

                    right: 12px;

                    width: min(
                        420px,
                        calc(100vw - 24px)
                    );

                    max-height:
                        calc(100vh - 96px);

                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.98
                        );

                    border-radius:
                        14px;

                    box-shadow:
                        0 8px 32px
                        rgba(
                            0,
                            0,
                            0,
                            0.22
                        );

                    z-index:
                        10050;

                    overflow:
                        hidden;

                    display:
                        none;

                    font-family:
                        Arial,
                        sans-serif;

                }


                .gg-offence-cascade-visible {

                    display:
                        flex;

                    flex-direction:
                        column;

                }


                .gg-offence-cascade-header {

                    display:
                        flex;

                    align-items:
                        center;

                    gap:
                        10px;

                    padding:
                        12px;

                    border-bottom:
                        1px solid
                        rgba(
                            0,
                            0,
                            0,
                            0.1
                        );

                    flex-shrink:
                        0;

                }


                .gg-offence-cascade-heading {

                    flex:
                        1;

                    min-width:
                        0;

                }


                .gg-offence-cascade-title {

                    font-size:
                        16px;

                    font-weight:
                        700;

                }


                .gg-offence-cascade-subtitle {

                    font-size:
                        11px;

                    opacity:
                        0.65;

                    margin-top:
                        2px;

                    overflow:
                        hidden;

                    text-overflow:
                        ellipsis;

                    white-space:
                        nowrap;

                }


                .gg-offence-cascade-back,
                .gg-offence-cascade-close {

                    width:
                        34px;

                    height:
                        34px;

                    border:
                        none;

                    border-radius:
                        50%;

                    cursor:
                        pointer;

                    font-size:
                        20px;

                    background:
                        rgba(
                            0,
                            0,
                            0,
                            0.06
                        );

                }


                .gg-offence-cascade-content {

                    padding:
                        12px;

                    overflow-y:
                        auto;

                    overscroll-behavior:
                        contain;

                }


                .gg-offence-breadcrumb {

                    display:
                        flex;

                    flex-wrap:
                        wrap;

                    gap:
                        5px;

                    align-items:
                        center;

                    font-size:
                        11px;

                    opacity:
                        0.65;

                    margin-bottom:
                        10px;

                }


                .gg-offence-summary-card,
                .gg-offence-detail-card {

                    border:
                        1px solid
                        rgba(
                            0,
                            0,
                            0,
                            0.1
                        );

                    border-radius:
                        10px;

                    padding:
                        12px;

                    margin-bottom:
                        12px;

                }


                .gg-offence-summary-label {

                    font-size:
                        11px;

                    opacity:
                        0.65;

                }


                .gg-offence-summary-value {

                    font-size:
                        16px;

                    font-weight:
                        700;

                    margin-top:
                        4px;

                }


                .gg-offence-section {

                    margin:
                        14px 0;

                }


                .gg-offence-section-title {

                    font-size:
                        13px;

                    font-weight:
                        700;

                    margin-bottom:
                        8px;

                    display:
                        flex;

                    align-items:
                        center;

                    gap:
                        6px;

                }


                .gg-offence-section-count {

                    font-size:
                        10px;

                    padding:
                        2px 6px;

                    border-radius:
                        10px;

                    background:
                        rgba(
                            0,
                            0,
                            0,
                            0.08
                        );

                }


                .gg-offence-list-card {

                    width:
                        100%;

                    display:
                        flex;

                    align-items:
                        center;

                    text-align:
                        left;

                    border:
                        1px solid
                        rgba(
                            0,
                            0,
                            0,
                            0.08
                        );

                    border-radius:
                        9px;

                    padding:
                        10px;

                    margin-bottom:
                        7px;

                    background:
                        transparent;

                    cursor:
                        pointer;

                }


                .gg-offence-list-main {

                    flex:
                        1;

                    min-width:
                        0;

                }


                .gg-offence-list-title {

                    font-size:
                        13px;

                    font-weight:
                        600;

                }


                .gg-offence-list-meta {

                    font-size:
                        11px;

                    opacity:
                        0.65;

                    margin-top:
                        3px;

                }


                .gg-offence-list-arrow {

                    font-size:
                        22px;

                    opacity:
                        0.45;

                    padding-left:
                        8px;

                }


                .gg-offence-detail-row {

                    display:
                        grid;

                    grid-template-columns:
                        120px 1fr;

                    gap:
                        8px;

                    padding:
                        7px 0;

                    border-bottom:
                        1px solid
                        rgba(
                            0,
                            0,
                            0,
                            0.06
                        );

                }


                .gg-offence-detail-row:last-child {

                    border-bottom:
                        none;

                }


                .gg-offence-detail-label {

                    font-size:
                        11px;

                    opacity:
                        0.65;

                }


                .gg-offence-detail-value {

                    font-size:
                        12px;

                    word-break:
                        break-word;

                }


                .gg-offence-count-grid {

                    display:
                        grid;

                    grid-template-columns:
                        repeat(
                            auto-fit,
                            minmax(
                                72px,
                                1fr
                            )
                        );

                    gap:
                        7px;

                    margin-bottom:
                        12px;

                }


                .gg-offence-count-card {

                    text-align:
                        center;

                    padding:
                        9px 5px;

                    border-radius:
                        9px;

                    background:
                        rgba(
                            0,
                            0,
                            0,
                            0.045
                        );

                }


                .gg-offence-count-value {

                    font-size:
                        17px;

                    font-weight:
                        700;

                }


                .gg-offence-count-label {

                    font-size:
                        10px;

                    opacity:
                        0.65;

                    margin-top:
                        2px;

                }


                .gg-offence-empty,
                .gg-offence-empty-inline {

                    text-align:
                        center;

                    padding:
                        18px;

                    opacity:
                        0.65;

                    font-size:
                        12px;

                }


                .gg-offence-empty-title {

                    font-size:
                        15px;

                    font-weight:
                        700;

                    margin-bottom:
                        5px;

                }


                @media (
                    max-width: 600px
                ) {

                    .gg-offence-cascade-panel {

                        top:
                            auto;

                        right:
                            8px;

                        left:
                            8px;

                        bottom:
                            8px;

                        width:
                            auto;

                        max-height:
                            70vh;

                    }


                    .gg-offence-detail-row {

                        grid-template-columns:
                            100px 1fr;

                    }

                }

            `;


            document
                .head
                .appendChild(
                    style
                );

        };


    /* =====================================================
       43. DESTROY
       ===================================================== */

    CascadeRenderer.destroy =
        function () {

            if (
                CascadeRenderer.root &&
                CascadeRenderer.root.parentNode
            ) {

                CascadeRenderer
                    .root
                    .parentNode
                    .removeChild(
                        CascadeRenderer.root
                    );

            }


            CascadeRenderer.root =
                null;


            CascadeRenderer.content =
                null;


            CascadeRenderer.header =
                null;


            CascadeRenderer.title =
                null;


            CascadeRenderer.subtitle =
                null;


            CascadeRenderer.backButton =
                null;


            CascadeRenderer.closeButton =
                null;


            CascadeRenderer.visible =
                false;


            CascadeRenderer.initialized =
                false;


            return true;

        };


    /* =====================================================
       44. PUBLIC STATUS
       ===================================================== */

    CascadeRenderer.getState =
        function () {

            return {

                version:
                    CascadeRenderer.VERSION,

                initialized:
                    CascadeRenderer.initialized,

                visible:
                    CascadeRenderer.visible,

                authoritativeConnector:
                    CascadeRenderer
                        .AUTHORITATIVE_CONNECTOR,

                cascadeState:

                    typeof CascadeController
                        .getState ===
                        "function"

                        ? CascadeController
                            .getState()

                        : CascadeController
                            .state ||
                            null

            };

        };


    /* =====================================================
       45. EXPORT
       ===================================================== */

    GG.Offence.CascadeRenderer =
        CascadeRenderer;


    /* =====================================================
       46. AUTO INITIALIZE
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document
            .addEventListener(

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


    console.log(

        "🔥 OffenceCascadeRenderer Loaded",

        {

            version:
                CascadeRenderer.VERSION,

            connector:
                CascadeRenderer
                    .AUTHORITATIVE_CONNECTOR,

            module:
                CascadeRenderer

        }

    );


})();
