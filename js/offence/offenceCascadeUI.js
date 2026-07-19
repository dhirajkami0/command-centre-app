/* =========================================================
   GreenGuard
   OFFENCE CASCADE UI
   Version: 1.0.0

   PURPOSE
   ---------------------------------------------------------
   Independent offence navigation UI.

   DOES NOT depend on:
   - Leaflet polygon click
   - Canvas click
   - GIS pointer ownership
   - MapRenderer.handlePolygonClick()

   FLOW
   ---------------------------------------------------------
   OFFENCE FLOW
       ↓
   SOURCE / TARGET
       ↓
   LOCATION / HOTSPOT
       ↓
   CascadeController
       ↓
   POR
       ↓
   CASE
       ↓
   CASE DETAILS

   TARGET:
   Uses GIS-resolved target polygons.

   SOURCE:
   Uses source hotspots directly until source GIS
   is available.
   ========================================================= */

(function () {

    "use strict";


    // =====================================================
    // 1. NAMESPACE
    // =====================================================

    window.GG =
        window.GG ||
        {};


    GG.Offence =
        GG.Offence ||
        {};


    const OffenceCascadeUI = {};


    // =====================================================
    // 2. VERSION
    // =====================================================

    OffenceCascadeUI.VERSION =
        "1.0.0";


    // =====================================================
    // 3. STATE
    // =====================================================

    OffenceCascadeUI.state = {

        initialized:
            false,

        open:
            false,

        mode:
            null,

        selectedItem:
            null

    };


    // =====================================================
    // 4. ELEMENT IDS
    // =====================================================

    OffenceCascadeUI.IDS = {

        launcher:
            "offenceFlowLauncher",

        panel:
            "offenceFlowPanel",

        title:
            "offenceFlowTitle",

        breadcrumb:
            "offenceFlowBreadcrumb",

        content:
            "offenceFlowContent"

    };


    // =====================================================
    // 5. SAFE HTML
    // =====================================================

    OffenceCascadeUI.escapeHtml =
        function (
            value
        ) {

            return String(
                value ?? ""
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


    // =====================================================
    // 6. CREATE UI
    // =====================================================

    OffenceCascadeUI.createUI =
        function () {

            // =============================================
            // LAUNCHER
            // =============================================

            if (
                !document.getElementById(
                    OffenceCascadeUI
                        .IDS
                        .launcher
                )
            ) {

                const launcher =
                    document.createElement(
                        "button"
                    );


                launcher.id =
                    OffenceCascadeUI
                        .IDS
                        .launcher;


                launcher.type =
                    "button";


                launcher.innerHTML =
                    "🔥 OFFENCE FLOW";


                launcher.style.cssText = `

                    position:fixed;

                    right:18px;

                    bottom:90px;

                    z-index:999990;

                    background:
                        linear-gradient(
                            135deg,
                            #ff1744,
                            #b71c1c
                        );

                    color:white;

                    border:
                        1px solid
                        rgba(
                            255,
                            255,
                            255,
                            0.25
                        );

                    border-radius:
                        12px;

                    padding:
                        11px 16px;

                    font-size:
                        12px;

                    font-weight:
                        800;

                    letter-spacing:
                        0.4px;

                    cursor:
                        pointer;

                    box-shadow:
                        0 6px 22px
                        rgba(
                            255,
                            23,
                            68,
                            0.35
                        );

                `;


                launcher.addEventListener(

                    "click",

                    function (
                        event
                    ) {

                        event
                            .preventDefault();

                        event
                            .stopPropagation();


                        OffenceCascadeUI
                            .toggle();

                    }

                );


                document
                    .body
                    .appendChild(
                        launcher
                    );

            }


            // =============================================
            // PANEL
            // =============================================

            if (
                !document.getElementById(
                    OffenceCascadeUI
                        .IDS
                        .panel
                )
            ) {

                const panel =
                    document.createElement(
                        "div"
                    );


                panel.id =
                    OffenceCascadeUI
                        .IDS
                        .panel;


                panel.style.cssText = `

                    display:none;

                    position:fixed;

                    top:85px;

                    right:12px;

                    width:
                        min(
                            390px,
                            94vw
                        );

                    max-height:
                        82vh;

                    overflow-y:auto;

                    z-index:999999;

                    background:
                        linear-gradient(
                            180deg,
                            rgba(
                                10,
                                15,
                                18,
                                0.98
                            ),
                            rgba(
                                5,
                                8,
                                10,
                                0.99
                            )
                        );

                    color:white;

                    border:
                        2px solid
                        #ff1744;

                    border-radius:
                        18px;

                    padding:
                        16px;

                    box-shadow:
                        0 0 25px
                        rgba(
                            255,
                            23,
                            68,
                            0.30
                        );

                    font-family:
                        Arial,
                        sans-serif;

                `;


                panel.innerHTML = `

                    <div
                        style="
                            display:flex;
                            align-items:center;
                            justify-content:
                                space-between;
                            gap:10px;
                            margin-bottom:12px;
                        "
                    >

                        <div>

                            <div
                                id="
                                    ${OffenceCascadeUI.IDS.title}
                                "
                                style="
                                    font-size:20px;
                                    font-weight:800;
                                    color:#ff5252;
                                "
                            >
                                🔥 OFFENCE FLOW
                            </div>

                            <div
                                id="
                                    ${OffenceCascadeUI.IDS.breadcrumb}
                                "
                                style="
                                    margin-top:4px;
                                    font-size:11px;
                                    color:#b0bec5;
                                "
                            >
                                Select investigation path
                            </div>

                        </div>


                        <button

                            id="
                                offenceFlowClose
                            "

                            type="
                                button
                            "

                            style="
                                width:34px;
                                height:34px;
                                border:0;
                                border-radius:10px;
                                background:#ff1744;
                                color:white;
                                cursor:pointer;
                                font-weight:bold;
                            "

                        >
                            ✕
                        </button>

                    </div>


                    <div

                        id="
                            ${OffenceCascadeUI.IDS.content}
                        "

                    ></div>

                `;


                document
                    .body
                    .appendChild(
                        panel
                    );


                document
                    .getElementById(
                        "offenceFlowClose"
                    )
                    ?.addEventListener(

                        "click",

                        function (
                            event
                        ) {

                            event
                                .preventDefault();

                            event
                                .stopPropagation();


                            OffenceCascadeUI
                                .close();

                        }

                    );

            }


            return true;

        };


    // =====================================================
    // 7. GET ELEMENT
    // =====================================================

    OffenceCascadeUI.getPanel =
        function () {

            return document
                .getElementById(
                    OffenceCascadeUI
                        .IDS
                        .panel
                );

        };


    OffenceCascadeUI.getContent =
        function () {

            return document
                .getElementById(
                    OffenceCascadeUI
                        .IDS
                        .content
                );

        };


    // =====================================================
    // 8. SET HEADER
    // =====================================================

    OffenceCascadeUI.setHeader =
        function (
            title,
            breadcrumb
        ) {

            const titleEl =
                document.getElementById(
                    OffenceCascadeUI
                        .IDS
                        .title
                );


            const breadcrumbEl =
                document.getElementById(
                    OffenceCascadeUI
                        .IDS
                        .breadcrumb
                );


            if (
                titleEl
            ) {

                titleEl.textContent =
                    title ||
                    "🔥 OFFENCE FLOW";

            }


            if (
                breadcrumbEl
            ) {

                breadcrumbEl.textContent =
                    breadcrumb ||
                    "";

            }

        };


    // =====================================================
    // 9. OPEN
    // =====================================================

    OffenceCascadeUI.open =
        function () {

            const panel =
                OffenceCascadeUI
                    .getPanel();


            if (
                !panel
            ) {

                return false;

            }


            OffenceCascadeUI
                .state
                .open =
                    true;


            panel.style.display =
                "block";


            OffenceCascadeUI
                .showHome();


            return true;

        };


    // =====================================================
    // 10. CLOSE
    // =====================================================

    OffenceCascadeUI.close =
        function () {

            const panel =
                OffenceCascadeUI
                    .getPanel();


            if (
                panel
            ) {

                panel.style.display =
                    "none";

            }


            OffenceCascadeUI
                .state
                .open =
                    false;


            return true;

        };


    // =====================================================
    // 11. TOGGLE
    // =====================================================

    OffenceCascadeUI.toggle =
        function () {

            if (
                OffenceCascadeUI
                    .state
                    .open
            ) {

                return OffenceCascadeUI
                    .close();

            }


            return OffenceCascadeUI
                .open();

        };


    // =====================================================
    // 12. HOME
    // =====================================================

OffenceCascadeUI.showHome =
    function () {

        // =============================================
        // 1. RESET STATE
        // =============================================

        OffenceCascadeUI.state.mode =
            null;

        OffenceCascadeUI.state.selectedItem =
            null;


        // =============================================
        // 2. HEADER
        // =============================================

        OffenceCascadeUI.setHeader(

            "🔥 OFFENCE FLOW",

            "Select investigation path"

        );


        // =============================================
        // 3. CONTENT
        // =============================================

        const content =
            OffenceCascadeUI.getContent();


        if (!content) {

            console.error(
                "[OffenceCascadeUI] Content container not found"
            );

            return false;

        }


        // =============================================
        // 4. RENDER SOURCE / TARGET
        // =============================================

        content.innerHTML = `

            <div
                style="
                    display:grid;
                    grid-template-columns:1fr 1fr;
                    gap:12px;
                    margin-top:14px;
                "
            >

                <button
                    id="offenceSourceBtn"
                    type="button"
                    style="
                        display:block;
                        width:100%;
                        min-height:80px;
                        padding:16px 10px;

                        border:
                            1px solid #ff9100;

                        border-radius:14px;

                        background:
                            rgba(
                                255,
                                145,
                                0,
                                0.14
                            );

                        color:#ffb74d;

                        font-size:14px;
                        font-weight:800;

                        cursor:pointer;

                        pointer-events:auto;

                        position:relative;

                        z-index:10;
                    "
                >

                    🏠 SOURCE

                    <div
                        style="
                            font-size:10px;
                            font-weight:normal;
                            opacity:0.75;
                            margin-top:6px;
                        "
                    >
                        Accused origin
                    </div>

                </button>


                <button
                    id="offenceTargetBtn"
                    type="button"
                    style="
                        display:block;
                        width:100%;
                        min-height:80px;
                        padding:16px 10px;

                        border:
                            1px solid #00e5ff;

                        border-radius:14px;

                        background:
                            rgba(
                                0,
                                229,
                                255,
                                0.12
                            );

                        color:#00e5ff;

                        font-size:14px;
                        font-weight:800;

                        cursor:pointer;

                        pointer-events:auto;

                        position:relative;

                        z-index:10;
                    "
                >

                    🎯 TARGET

                    <div
                        style="
                            font-size:10px;
                            font-weight:normal;
                            opacity:0.75;
                            margin-top:6px;
                        "
                    >
                        Offence location
                    </div>

                </button>

            </div>

        `;


        // =============================================
        // 5. GET BUTTONS
        // =============================================

        const sourceButton =
            document.getElementById(
                "offenceSourceBtn"
            );


        const targetButton =
            document.getElementById(
                "offenceTargetBtn"
            );


        console.log(

            "🔥 Offence Home Buttons",

            {

                source:
                    !!sourceButton,

                target:
                    !!targetButton,

                content:
                    content

            }

        );


        // =============================================
        // 6. SOURCE CLICK
        // =============================================

        if (sourceButton) {

            sourceButton.onclick =
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();


                    console.log(
                        "🏠 SOURCE FLOW CLICK"
                    );


                    OffenceCascadeUI.showSource();

                };

        }


        // =============================================
        // 7. TARGET CLICK
        // =============================================

        if (targetButton) {

            targetButton.onclick =
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();


                    console.log(
                        "🎯 TARGET FLOW CLICK"
                    );


                    OffenceCascadeUI.showTarget();

                };

        }


        return true;

    };

    // =====================================================
    // 13. TARGET VIEW
    // =====================================================

    OffenceCascadeUI.showTarget =
        function () {

            const HeatmapEngine =
                GG.Offence
                    ?.HeatmapEngine;


            if (
                !HeatmapEngine
            ) {

                console.error(
                    "[OffenceCascadeUI] HeatmapEngine unavailable"
                );

                return;

            }


            OffenceCascadeUI
                .state
                .mode =
                    "TARGET";


            OffenceCascadeUI
                .setHeader(

                    "🎯 TARGET LOCATIONS",

                    "Offence Flow → Target → GIS"

                );


            const spatial =

                HeatmapEngine
                    .getSpatialHeatmapData();


            const polygons =

                Array.isArray(
                    spatial?.targetPolygons
                )

                    ? spatial
                        .targetPolygons

                    : [];


            OffenceCascadeUI
                .renderLocationList(

                    polygons,

                    "TARGET"

                );

        };


    // =====================================================
    // 14. SOURCE VIEW
    // =====================================================

    OffenceCascadeUI.showSource =
        function () {

            const HeatmapEngine =
                GG.Offence
                    ?.HeatmapEngine;


            if (
                !HeatmapEngine
            ) {

                console.error(
                    "[OffenceCascadeUI] HeatmapEngine unavailable"
                );

                return;

            }


            OffenceCascadeUI
                .state
                .mode =
                    "SOURCE";


            OffenceCascadeUI
                .setHeader(

                    "🏠 SOURCE LOCATIONS",

                    "Offence Flow → Source"

                );


            let hotspots = [];


            if (

                typeof HeatmapEngine
                    .getSourceHotspots ===
                    "function"

            ) {

                hotspots =

                    HeatmapEngine
                        .getSourceHotspots() ||

                    [];

            }


            OffenceCascadeUI
                .renderLocationList(

                    hotspots,

                    "SOURCE"

                );

        };


    // =====================================================
    // 15. RENDER LOCATION LIST
    // =====================================================

    OffenceCascadeUI.renderLocationList =
        function (
            items,
            type
        ) {

            const content =
                OffenceCascadeUI
                    .getContent();


            if (
                !content
            ) {

                return;

            }


            const normalizedType =

                String(
                    type ||
                    ""
                )
                    .trim()
                    .toUpperCase();


            if (
                !Array.isArray(
                    items
                ) ||
                items.length === 0
            ) {

                content.innerHTML = `

                    <button
                        id="
                            offenceFlowBack
                        "
                        type="
                            button
                        "
                        style="
                            margin-bottom:12px;
                            padding:8px 12px;
                            border:0;
                            border-radius:8px;
                            background:#263238;
                            color:white;
                            cursor:pointer;
                        "
                    >
                        ← BACK
                    </button>


                    <div
                        style="
                            padding:25px;
                            text-align:center;
                            color:#90a4ae;
                        "
                    >

                        No ${normalizedType}
                        locations available.

                    </div>

                `;


                OffenceCascadeUI
                    .bindBackButton();


                return;

            }


            const sorted =

                items
                    .slice()
                    .sort(

                        (
                            a,
                            b
                        ) => {

                            const nameA =

                                OffenceCascadeUI
                                    .getItemName(
                                        a
                                    );


                            const nameB =

                                OffenceCascadeUI
                                    .getItemName(
                                        b
                                    );


                            return nameA
                                .localeCompare(
                                    nameB
                                );

                        }

                    );


            let html = `

                <button

                    id="
                        offenceFlowBack
                    "

                    type="
                        button
                    "

                    style="
                        margin-bottom:12px;
                        padding:8px 12px;
                        border:0;
                        border-radius:8px;
                        background:#263238;
                        color:white;
                        cursor:pointer;
                    "

                >
                    ← BACK
                </button>


                <div
                    style="
                        display:flex;
                        flex-direction:column;
                        gap:8px;
                    "
                >

            `;


            sorted.forEach(

                (
                    item,
                    index
                ) => {

                    const name =

                        OffenceCascadeUI
                            .getItemName(
                                item
                            );


                    const spatialType =

                        item.spatialType ||

                        item.resolutionType ||

                        item.resolution ||

                        (
                            normalizedType ===
                            "TARGET"

                                ? "RANGE"

                                : "SOURCE"
                        );


                    const porCount =

                        Array.isArray(
                            item.porKeys
                        )

                            ? item
                                .porKeys
                                .length

                            : 0;


                    html += `

                        <button

                            type="
                                button
                            "

                            data-offence-index="
                                ${index}
                            "

                            style="
                                width:100%;
                                padding:12px;
                                text-align:left;
                                border:
                                    1px solid
                                    ${
                                        normalizedType ===
                                        "TARGET"

                                            ? "#00e5ff"

                                            : "#ff9100"
                                    };
                                border-radius:10px;
                                background:
                                    rgba(
                                        255,
                                        255,
                                        255,
                                        0.04
                                    );
                                color:white;
                                cursor:pointer;
                            "

                        >

                            <div
                                style="
                                    font-size:14px;
                                    font-weight:800;
                                "
                            >

                                ${
                                    OffenceCascadeUI
                                        .escapeHtml(
                                            name
                                        )
                                }

                            </div>


                            <div
                                style="
                                    margin-top:4px;
                                    font-size:10px;
                                    color:#90a4ae;
                                "
                            >

                                ${
                                    OffenceCascadeUI
                                        .escapeHtml(
                                            spatialType
                                        )
                                }

                                ${
                                    porCount > 0

                                        ? " • " +
                                          porCount +
                                          " POR"

                                        : ""
                                }

                            </div>

                        </button>

                    `;

                }

            );


            html += `

                </div>

            `;


            content.innerHTML =
                html;


            OffenceCascadeUI
                .bindBackButton();


            const buttons =

                content.querySelectorAll(
                    "[data-offence-index]"
                );


            buttons.forEach(

                button => {

                    button.addEventListener(

                        "click",

                        function (
                            event
                        ) {

                            event
                                .preventDefault();

                            event
                                .stopPropagation();


                            const index =

                                Number(

                                    button
                                        .getAttribute(
                                            "data-offence-index"
                                        )

                                );


                            const item =
                                sorted[
                                    index
                                ];


                            OffenceCascadeUI
                                .selectItem(

                                    item,

                                    normalizedType

                                );

                        }

                    );

                }

            );

        };


    // =====================================================
    // 16. GET ITEM NAME
    // =====================================================

    OffenceCascadeUI.getItemName =
        function (
            item
        ) {

            if (
                !item
            ) {

                return "Unknown";

            }


            return String(

                item.name ||

                item.range ||

                item.compartment ||

                item.location ||

                item.source ||

                item.target ||

                item.hotspotName ||

                item.key ||

                item.hotspotId ||

                "Unknown"

            ).trim();

        };


    // =====================================================
    // 17. SELECT ITEM
    // =====================================================

    OffenceCascadeUI.selectItem =
        function (
            item,
            type
        ) {

            if (
                !item
            ) {

                return {

                    success:
                        false,

                    reason:
                        "ITEM_REQUIRED"

                };

            }


            const CascadeController =

                GG.Offence
                    ?.CascadeController;


            if (
                !CascadeController
            ) {

                console.error(

                    "[OffenceCascadeUI] CascadeController unavailable"

                );


                return {

                    success:
                        false,

                    reason:
                        "CASCADE_CONTROLLER_UNAVAILABLE"

                };

            }


            const normalizedType =

                String(
                    type ||
                    item.type ||
                    ""
                )
                    .trim()
                    .toUpperCase();


            const hotspotId =

                item.hotspotId ||

                item.id ||

                item.key ||

                null;


            if (
                !hotspotId
            ) {

                console.warn(

                    "[OffenceCascadeUI] Item has no hotspot ID",

                    item

                );


                return {

                    success:
                        false,

                    reason:
                        "HOTSPOT_ID_REQUIRED"

                };

            }


            const spatialType =

                item.spatialType ||

                item.resolutionType ||

                item.resolution ||

                null;


            const spatialName =

                item.range ||

                item.compartment ||

                item.name ||

                null;


            OffenceCascadeUI
                .state
                .selectedItem =
                    item;


            console.log(

                "🔥 OFFENCE FLOW SELECT",

                {

                    hotspotId:
                        hotspotId,

                    type:
                        normalizedType,

                    spatialType:
                        spatialType,

                    spatialName:
                        spatialName,

                    porCount:

                        Array.isArray(
                            item.porKeys
                        )

                            ? item
                                .porKeys
                                .length

                            : 0

                }

            );


            // =============================================
            // DIRECT CASCADE CALL
            //
            // NO MAP CLICK REQUIRED.
            // =============================================

            const result =

                CascadeController
                    .openHotspot(

                        hotspotId,

                        normalizedType,

                        {

                            hotspot:
                                item,

                            polygon:
                                item,

                            spatialType:
                                spatialType,

                            spatialName:
                                spatialName,

                            latlng:
                                null

                        }

                    );


            console.log(

                "🔥 OFFENCE CASCADE RESULT",

                result

            );


            // =============================================
            // SHOW SELECTED SUMMARY
            // =============================================

            if (
                result?.success
            ) {

                OffenceCascadeUI
                    .showSelected(

                        item,

                        normalizedType,

                        result.data

                    );

            }


            return result;

        };


    // =====================================================
    // 18. SHOW SELECTED
    // =====================================================

    OffenceCascadeUI.showSelected =
        function (
            item,
            type,
            payload
        ) {

            const content =
                OffenceCascadeUI
                    .getContent();


            if (
                !content
            ) {

                return;

            }


            const name =

                OffenceCascadeUI
                    .getItemName(
                        item
                    );


            const porKeys =

                payload?.porKeys ||

                item?.porKeys ||

                [];


            const cases =

                payload?.cases ||

                [];


            OffenceCascadeUI
                .setHeader(

                    type === "TARGET"

                        ? "🎯 " + name

                        : "🏠 " + name,

                    "Offence Flow → " +
                    type +
                    " → " +
                    name

                );


            content.innerHTML = `

                <button

                    id="
                        offenceSelectedBack
                    "

                    type="
                        button
                    "

                    style="
                        margin-bottom:12px;
                        padding:8px 12px;
                        border:0;
                        border-radius:8px;
                        background:#263238;
                        color:white;
                        cursor:pointer;
                    "

                >
                    ← BACK
                </button>


                <div
                    style="
                        padding:14px;
                        border:
                            1px solid
                            rgba(
                                255,
                                255,
                                255,
                                0.12
                            );
                        border-radius:12px;
                        background:
                            rgba(
                                255,
                                255,
                                255,
                                0.04
                            );
                    "
                >

                    <div
                        style="
                            font-size:18px;
                            font-weight:800;
                        "
                    >

                        ${
                            OffenceCascadeUI
                                .escapeHtml(
                                    name
                                )
                        }

                    </div>


                    <div
                        style="
                            margin-top:8px;
                            font-size:12px;
                            color:#90a4ae;
                        "
                    >

                        POR Relationships:
                        ${porKeys.length}

                    </div>


                    <div
                        style="
                            margin-top:4px;
                            font-size:12px;
                            color:#90a4ae;
                        "
                    >

                        Cases:
                        ${
                            Array.isArray(
                                cases
                            )

                                ? cases.length

                                : 0
                        }

                    </div>

                </div>


                <div
                    style="
                        margin-top:12px;
                        padding:12px;
                        border-radius:10px;
                        background:
                            rgba(
                                0,
                                229,
                                255,
                                0.06
                            );
                        font-size:11px;
                        color:#b0bec5;
                    "
                >

                    CascadeController is now
                    holding the selected hotspot
                    context.

                    Existing POR / CASE /
                    ACCUSED / WITNESS cascade
                    listeners can continue from
                    this state.

                </div>

            `;


            document
                .getElementById(
                    "offenceSelectedBack"
                )
                ?.addEventListener(

                    "click",

                    function (
                        event
                    ) {

                        event
                            .stopPropagation();


                        if (
                            type ===
                            "TARGET"
                        ) {

                            OffenceCascadeUI
                                .showTarget();

                        }

                        else {

                            OffenceCascadeUI
                                .showSource();

                        }

                    }

                );

        };


    // =====================================================
    // 19. BACK BUTTON
    // =====================================================

    OffenceCascadeUI.bindBackButton =
        function () {

            document
                .getElementById(
                    "offenceFlowBack"
                )
                ?.addEventListener(

                    "click",

                    function (
                        event
                    ) {

                        event
                            .preventDefault();

                        event
                            .stopPropagation();


                        OffenceCascadeUI
                            .showHome();

                    }

                );

        };


    // =====================================================
    // 20. INITIALIZE
    // =====================================================

    OffenceCascadeUI.init =
        function () {

            if (
                OffenceCascadeUI
                    .state
                    .initialized
            ) {

                return true;

            }


            OffenceCascadeUI
                .createUI();


            OffenceCascadeUI
                .state
                .initialized =
                    true;


            console.log(

                "✅ OffenceCascadeUI Ready",

                {

                    version:
                        OffenceCascadeUI
                            .VERSION

                }

            );


            return true;

        };


    // =====================================================
    // 21. PUBLIC API
    // =====================================================

    GG.Offence
        .CascadeUI =
            OffenceCascadeUI;


    // =====================================================
    // 22. AUTO INITIALIZE
    // =====================================================

    function initializeWhenReady() {

        if (
            document.readyState ===
            "loading"
        ) {

            document.addEventListener(

                "DOMContentLoaded",

                function () {

                    OffenceCascadeUI
                        .init();

                },

                {
                    once:
                        true
                }

            );

        }

        else {

            OffenceCascadeUI
                .init();

        }

    }


    initializeWhenReady();


})();
