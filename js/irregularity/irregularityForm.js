/* ============================================================
   🌲 GREENGUARD
   IRREGULARITY / OFFENCE / OBSERVATION FORM
   ============================================================

   FILE:
       js/irregularity/irregularityForm.js

   PURPOSE
   ------------------------------------------------------------
   Builds ONLY the fields that the patrol user must manually
   enter.

   AUTOMATIC SYSTEM DATA IS NOT SHOWN IN THIS FORM.

   At submission, irregularityModule.js adds:

       GPS
       latitude
       longitude
       GPS accuracy
       GIS
       division
       range
       beat
       compartment
       village
       villageCode
       block
       nearestPoint
       distanceMeters
       location text
       reported_by
       reported_by_phone
       reported_by_role
       created_at
       updated_at

   IMPORTANT
   ------------------------------------------------------------
   • No Firebase initialization
   • No GIS resolver
   • No GPS tracking
   • No Apps Script
   • No callBackend()
   • No duplicate submit handler
   • Save handled by irregularityModule.js
   • Existing Wildlife / Elephant UI untouched

   ============================================================ */


/* ============================================================
   NAMESPACE
   ============================================================ */

window.GGIrregularity =
    window.GGIrregularity || {};


GGIrregularity.Form =
    GGIrregularity.Form || {};


/* ============================================================
   HTML ESCAPE
   ============================================================ */

GGIrregularity.Form.escape =
function(value){

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


/* ============================================================
   FIELD WRAPPER
   ============================================================ */

GGIrregularity.Form.field =
function(
    label,
    name,
    type,
    options = {}
){

    const required =
        options.required
            ? "required"
            : "";

    const placeholder =
        GGIrregularity.Form.escape(
            options.placeholder || ""
        );

    const value =
        GGIrregularity.Form.escape(
            options.value || ""
        );


    /* ========================================================
       SELECT
       ======================================================== */

    if(
        type === "select"
    ){

        const optionList =
            options.options || [];


        const optionHtml =
            optionList
            .map(
                function(item){

                    const optionValue =
                        typeof item === "string"
                            ? item
                            : item.value;

                    const optionLabel =
                        typeof item === "string"
                            ? item
                            : item.label;


                    return `
                        <option
                            value="${GGIrregularity.Form.escape(
                                optionValue
                            )}"
                        >
                            ${GGIrregularity.Form.escape(
                                optionLabel
                            )}
                        </option>
                    `;

                }
            )
            .join("");


        return `

            <div
                class="gg-irregularity-field"
                style="
                    width:100%;
                    box-sizing:border-box;
                    margin:0 0 10px 0;
                "
            >

                <label
                    for="gg-irregularity-${GGIrregularity.Form.escape(name)}"
                    style="
                        display:block;
                        margin:0 0 5px 0;
                        color:#37474f;
                        font-size:12px;
                        font-weight:700;
                        line-height:1.25;
                    "
                >
                    ${GGIrregularity.Form.escape(label)}
                </label>


                <select
                    id="gg-irregularity-${GGIrregularity.Form.escape(name)}"
                    name="${GGIrregularity.Form.escape(name)}"
                    ${required}
                    style="
                        width:100%;
                        box-sizing:border-box;
                        min-height:38px;
                        padding:8px 10px;
                        border:1px solid #cfd8dc;
                        border-radius:7px;
                        background:#ffffff;
                        color:#263238;
                        font-size:13px;
                        outline:none;
                    "
                >

                    <option value="">
                        Select
                    </option>

                    ${optionHtml}

                </select>

            </div>

        `;

    }


    /* ========================================================
       TEXTAREA
       ======================================================== */

    if(
        type === "textarea"
    ){

        return `

            <div
                class="gg-irregularity-field"
                style="
                    width:100%;
                    box-sizing:border-box;
                    margin:0 0 10px 0;
                "
            >

                <label
                    for="gg-irregularity-${GGIrregularity.Form.escape(name)}"
                    style="
                        display:block;
                        margin:0 0 5px 0;
                        color:#37474f;
                        font-size:12px;
                        font-weight:700;
                        line-height:1.25;
                    "
                >
                    ${GGIrregularity.Form.escape(label)}
                </label>


                <textarea
                    id="gg-irregularity-${GGIrregularity.Form.escape(name)}"
                    name="${GGIrregularity.Form.escape(name)}"
                    ${required}
                    placeholder="${placeholder}"
                    rows="${options.rows || 3}"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:8px 10px;
                        border:1px solid #cfd8dc;
                        border-radius:7px;
                        background:#ffffff;
                        color:#263238;
                        font-size:13px;
                        line-height:1.35;
                        resize:vertical;
                        outline:none;
                    "
                >${value}</textarea>

            </div>

        `;

    }


    /* ========================================================
       NORMAL INPUT
       ======================================================== */

    return `

        <div
            class="gg-irregularity-field"
            style="
                width:100%;
                box-sizing:border-box;
                margin:0 0 10px 0;
            "
        >

            <label
                for="gg-irregularity-${GGIrregularity.Form.escape(name)}"
                style="
                    display:block;
                    margin:0 0 5px 0;
                    color:#37474f;
                    font-size:12px;
                    font-weight:700;
                    line-height:1.25;
                "
            >
                ${GGIrregularity.Form.escape(label)}
            </label>


            <input
                id="gg-irregularity-${GGIrregularity.Form.escape(name)}"
                name="${GGIrregularity.Form.escape(name)}"
                type="${GGIrregularity.Form.escape(type)}"
                ${required}
                value="${value}"
                placeholder="${placeholder}"
                ${options.min !== undefined
                    ? `min="${GGIrregularity.Form.escape(options.min)}"`
                    : ""}
                style="
                    width:100%;
                    box-sizing:border-box;
                    min-height:38px;
                    padding:8px 10px;
                    border:1px solid #cfd8dc;
                    border-radius:7px;
                    background:#ffffff;
                    color:#263238;
                    font-size:13px;
                    outline:none;
                "
            >

        </div>

    `;

};


/* ============================================================
   CATEGORY OPTIONS
   ============================================================ */

GGIrregularity.Form.categoryOptions =
function(){

    return [

        {
            value:
                GGIrregularity.TYPES.FELLING,

            label:
                "🌳 Illicit Felling"
        },

        {
            value:
                GGIrregularity.TYPES.TIMBER,

            label:
                "🪵 Illegal Timber / Forest Produce"
        },

        {
            value:
                GGIrregularity.TYPES.MINING,

            label:
                "🚜 Illegal Mining / Earth Cutting"
        },

        {
            value:
                GGIrregularity.TYPES.FISHING,

            label:
                "🎣 Illegal Fishing"
        },

        {
            value:
                GGIrregularity.TYPES.GRAZING,

            label:
                "🐄 Illegal Grazing"
        },

        {
            value:
                GGIrregularity.TYPES.FIRE,

            label:
                "🔥 Forest Fire"
        },

        {
            value:
                GGIrregularity.TYPES.ENCROACHMENT,

            label:
                "🏠 Encroachment"
        },

        {
            value:
                GGIrregularity.TYPES.STRUCTURE,

            label:
                "🏗 Illegal Structure / Occupation"
        },

        {
            value:
                GGIrregularity.TYPES.POACHING,

            label:
                "🪤 Poaching"
        },

        {
            value:
                GGIrregularity.TYPES.TRESPASSING,

            label:
                "🚫 Trespassing"
        },

        {
            value:
                GGIrregularity.TYPES.WILDLIFE_INJURY,

            label:
                "🦌 Wildlife Injury"
        },

        {
            value:
                GGIrregularity.TYPES.WILDLIFE_DEATH,

            label:
                "🦴 Wildlife Death"
        },

        {
            value:
                GGIrregularity.TYPES.OBSERVATION,

            label:
                "👁 General Observation"
        }

    ];

};


/* ============================================================
   CATEGORY SELECT
   ============================================================ */

GGIrregularity.Form.categorySelect =
function(){

    return GGIrregularity.Form.field(
        "Observation / Irregularity Type",
        "category",
        "select",
        {
            required:true,
            options:
                GGIrregularity.Form
                    .categoryOptions()
        }
    )
    .replace(
        'id="gg-irregularity-category"',
        'id="ggIrregularityType"'
    );

};


/* ============================================================
   COMMON DATE / TIME
   ============================================================ */

GGIrregularity.Form.commonFields =
function(){

    return `

        <div
            style="
                display:grid;
                grid-template-columns:
                    minmax(0,1fr)
                    minmax(0,1fr);
                gap:8px;
                width:100%;
            "
        >

            <div>

                ${GGIrregularity.Form.field(
                    "Incident Date",
                    "incident_date",
                    "date",
                    {
                        required:true
                    }
                )}

            </div>


            <div>

                ${GGIrregularity.Form.field(
                    "Incident Time",
                    "incident_time",
                    "time",
                    {
                        required:true
                    }
                )}

            </div>

        </div>

    `;

};


/* ============================================================
   FELLING
   ============================================================ */

/* ============================================================
   FELLING
   ============================================================ */

GGIrregularity.Form.felling =
function(){

    return `

        <div
            data-irregularity-group="ILLICIT_FELLING"
            style="
                display:none;
            "
        >

            ${GGIrregularity.Form.field(
                "Species / Tree Type",
                "felling_species",
                "text",
                {
                    placeholder:
                        "e.g. Sal, Teak"
                }
            )}

            ${GGIrregularity.Form.field(
                "Approx. Number of Trees",
                "felling_tree_count",
                "number",
                {
                    min:0
                }
            )}

            ${GGIrregularity.Form.field(
                "Approx. Volume",
                "felling_volume",
                "text",
                {
                    placeholder:
                        "e.g. 2.5 m³"
                }
            )}

        </div>

    `;

};


/* ============================================================
   TIMBER
   ============================================================ */

GGIrregularity.Form.timber =
function(){

    return `

        <div
            data-irregularity-group="ILLEGAL_TIMBER_FOREST_PRODUCE"
            style="
                display:none;
            "
        >

            ${GGIrregularity.Form.field(
                "Forest Produce",
                "timber_produce",
                "text",
                {
                    placeholder:
                        "Timber / firewood / bamboo etc."
                }
            )}

            ${GGIrregularity.Form.field(
                "Approx. Quantity",
                "timber_quantity",
                "text",
                {
                    placeholder:
                        "Quantity / volume"
                }
            )}

            ${GGIrregularity.Form.field(
                "Vehicle / Mode of Transport",
                "timber_vehicle",
                "text",
                {
                    placeholder:
                        "Vehicle number if available"
                }
            )}

        </div>

    `;

};


/* ============================================================
   MINING
   ============================================================ */

GGIrregularity.Form.mining =
function(){

    return `

        <div
            data-irregularity-group="ILLEGAL_MINING_EARTH_CUTTING"
            style="
                display:none;
            "
        >

            ${GGIrregularity.Form.field(
                "Material / Activity",
                "mining_material",
                "text",
                {
                    placeholder:
                        "Stone / sand / earth etc."
                }
            )}

            ${GGIrregularity.Form.field(
                "Approx. Area / Quantity",
                "mining_quantity",
                "text"
            )}

            ${GGIrregularity.Form.field(
                "Machinery / Vehicle",
                "mining_machinery",
                "text"
            )}

        </div>

    `;

};


/* ============================================================
   FISHING
   ============================================================ */

GGIrregularity.Form.fishing =
function(){

    return `

        <div
            data-irregularity-group="ILLEGAL_FISHING"
            style="
                display:none;
            "
        >

            ${GGIrregularity.Form.field(
                "Water Body",
                "fishing_water_body",
                "text"
            )}

            ${GGIrregularity.Form.field(
                "Fishing Method",
                "fishing_method",
                "text"
            )}

            ${GGIrregularity.Form.field(
                "Equipment / Net",
                "fishing_equipment",
                "text"
            )}

        </div>

    `;

};


/* ============================================================
   GRAZING
   ============================================================ */

GGIrregularity.Form.grazing =
function(){

    return `

        <div
            data-irregularity-group="ILLEGAL_GRAZING"
            style="
                display:none;
            "
        >

            ${GGIrregularity.Form.field(
                "Animal Type",
                "grazing_animal_type",
                "text"
            )}

            ${GGIrregularity.Form.field(
                "Approx. Number",
                "grazing_count",
                "number",
                {
                    min:0
                }
            )}

            ${GGIrregularity.Form.field(
                "Owner / Village if Known",
                "grazing_owner",
                "text"
            )}

        </div>

    `;

};


/* ============================================================
   FIRE
   ============================================================ */

GGIrregularity.Form.fire =
function(){

    return `

        <div
            data-irregularity-group="FOREST_FIRE"
            style="
                display:none;
            "
        >

            ${GGIrregularity.Form.field(
                "Fire Type",
                "fire_type",
                "text",
                {
                    placeholder:
                        "Ground fire / crown fire / smoke etc."
                }
            )}

            ${GGIrregularity.Form.field(
                "Approx. Area Affected",
                "fire_area",
                "text",
                {
                    placeholder:
                        "e.g. 2 hectares"
                }
            )}

            ${GGIrregularity.Form.field(
                "Fire Status",
                "fire_status",
                "select",
                {
                    options:[
                        {
                            value:
                                "ACTIVE",

                            label:
                                "Active"
                        },

                        {
                            value:
                                "CONTROLLED",

                            label:
                                "Controlled"
                        },

                        {
                            value:
                                "EXTINGUISHED",

                            label:
                                "Extinguished"
                        }
                    ]
                }
            )}

        </div>

    `;

};


/* ============================================================
   ENCROACHMENT
   ============================================================ */

GGIrregularity.Form.encroachment =
function(){

    return `

        <div
            data-irregularity-group="ENCROACHMENT"
            style="
                display:none;
            "
        >

            ${GGIrregularity.Form.field(
                "Nature of Encroachment",
                "encroachment_nature",
                "text"
            )}

            ${GGIrregularity.Form.field(
                "Approx. Area",
                "encroachment_area",
                "text"
            )}

            ${GGIrregularity.Form.field(
                "Structure / Cultivation Details",
                "encroachment_details",
                "textarea",
                {
                    rows:3
                }
            )}

        </div>

    `;

};


/* ============================================================
   STRUCTURE
   ============================================================ */

GGIrregularity.Form.structure =
function(){

    return `

        <div
            data-irregularity-group="ILLEGAL_STRUCTURE_OCCUPATION"
            style="
                display:none;
            "
        >

            ${GGIrregularity.Form.field(
                "Structure Type",
                "structure_type",
                "text"
            )}

            ${GGIrregularity.Form.field(
                "Approx. Size",
                "structure_size",
                "text"
            )}

            ${GGIrregularity.Form.field(
                "Purpose / Use",
                "structure_purpose",
                "text"
            )}

        </div>

    `;

};


/* ============================================================
   POACHING
   ============================================================ */

GGIrregularity.Form.poaching =
function(){

    return `

        <div
            data-irregularity-group="POACHING"
            style="
                display:none;
            "
        >

            ${GGIrregularity.Form.field(
                "Target Species",
                "poaching_species",
                "text"
            )}

            ${GGIrregularity.Form.field(
                "Evidence / Method",
                "poaching_method",
                "textarea",
                {
                    rows:3
                }
            )}

        </div>

    `;

};


/* ============================================================
   TRESPASSING
   ============================================================ */

GGIrregularity.Form.trespassing =
function(){

    return `

        <div
            data-irregularity-group="TRESPASSING"
            style="
                display:none;
            "
        >

            ${GGIrregularity.Form.field(
                "Purpose / Activity",
                "trespassing_activity",
                "text"
            )}

            ${GGIrregularity.Form.field(
                "Persons / Vehicle Details",
                "trespassing_persons",
                "textarea",
                {
                    rows:3
                }
            )}

        </div>

    `;

};


/* ============================================================
   WILDLIFE INJURY
   ============================================================ */

GGIrregularity.Form.wildlifeInjury =
function(){

    return `

        <div
            data-irregularity-group="WILDLIFE_INJURY"
            style="
                display:none;
            "
        >

            ${GGIrregularity.Form.field(
                "Species",
                "wildlife_injury_species",
                "text"
            )}

            ${GGIrregularity.Form.field(
                "Condition / Injury",
                "wildlife_injury_condition",
                "textarea",
                {
                    rows:3
                }
            )}

        </div>

    `;

};


/* ============================================================
   WILDLIFE DEATH
   ============================================================ */

GGIrregularity.Form.wildlifeDeath =
function(){

    return `

        <div
            data-irregularity-group="WILDLIFE_DEATH"
            style="
                display:none;
            "
        >

            ${GGIrregularity.Form.field(
                "Species",
                "wildlife_death_species",
                "text"
            )}

            ${GGIrregularity.Form.field(
                "Condition / Suspected Cause",
                "wildlife_death_condition",
                "textarea",
                {
                    rows:3
                }
            )}

        </div>

    `;

};


/* ============================================================
   OBSERVATION
   ============================================================ */

GGIrregularity.Form.observation =
function(){

    return `

        <div
            data-irregularity-group="GENERAL_OBSERVATION"
            style="
                display:none;
            "
        >

            ${GGIrregularity.Form.field(
                "Observation",
                "observation_text",
                "textarea",
                {
                    rows:4,
                    placeholder:
                        "Describe the observation..."
                }
            )}

        </div>

    `;

};


/* ============================================================
   REMARKS
   ============================================================ */

GGIrregularity.Form.remarks =
function(){

    return `

        <div
            style="
                width:100%;
                box-sizing:border-box;
                margin-top:2px;
            "
        >

            ${GGIrregularity.Form.field(
                "Remarks",
                "remarks",
                "textarea",
                {
                    rows:4,
                    placeholder:
                        "Additional remarks..."
                }
            )}

        </div>

    `;

};





/* ============================================================
   MEDIA UI
   ============================================================ */

GGIrregularity.Form.media =
function(){

    return `

        <div
            class="gg-irregularity-media"
            style="
                width:100%;
                box-sizing:border-box;
                margin:10px 0;
                padding:10px;
                border:1px solid #dfe8df;
                border-radius:8px;
                background:#f8faf8;
            "
        >

            <div
                style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    gap:8px;
                    margin-bottom:8px;
                "
            >

                <div
                    style="
                        color:#1b5e20;
                        font-size:12px;
                        font-weight:800;
                    "
                >
                    📎 MEDIA
                </div>

                <div
                    id="gg-irregularity-media-status"
                    style="
                        color:#607d8b;
                        font-size:10px;
                        text-align:right;
                    "
                >
                    No media selected.
                </div>

            </div>


            <!-- ==================================================
                 PHOTO INPUT
                 ================================================== -->

            <input
                id="gg-irregularity-photo"
                name="photo"
                type="file"
                accept="image/*"
                capture="environment"
                style="
                    position:absolute;
                    width:1px;
                    height:1px;
                    opacity:0;
                    pointer-events:none;
                "
            >


            <!-- ==================================================
                 VIDEO INPUT
                 ================================================== -->

            <input
                id="gg-irregularity-video"
                name="video"
                type="file"
                accept="video/*"
                capture="environment"
                style="
                    position:absolute;
                    width:1px;
                    height:1px;
                    opacity:0;
                    pointer-events:none;
                "
            >


            <!-- ==================================================
                 AUDIO FILE INPUT
                 ================================================== -->

            <input
                id="gg-irregularity-audio"
                name="audio"
                type="file"
                accept="audio/*"
                style="
                    position:absolute;
                    width:1px;
                    height:1px;
                    opacity:0;
                    pointer-events:none;
                "
            >


            <!-- ==================================================
                 MAIN MEDIA BUTTONS
                 ================================================== -->

            <div
                style="
                    display:grid;
                    grid-template-columns:
                        minmax(0,1fr)
                        minmax(0,1fr)
                        minmax(0,1fr);
                    gap:7px;
                    width:100%;
                "
            >

                <button
                    type="button"
                    id="gg-irregularity-photo-btn"
                    onclick="
                        document
                            .getElementById(
                                'gg-irregularity-photo'
                            )
                            ?.click();
                    "
                    style="
                        min-height:38px;
                        border:1px solid #c8d6c8;
                        border-radius:7px;
                        background:#ffffff;
                        color:#1b5e20;
                        font-size:11px;
                        font-weight:700;
                        cursor:pointer;
                        touch-action:manipulation;
                    "
                >
                    📷 PHOTO
                </button>


                <button
                    type="button"
                    id="gg-irregularity-video-btn"
                    onclick="
                        document
                            .getElementById(
                                'gg-irregularity-video'
                            )
                            ?.click();
                    "
                    style="
                        min-height:38px;
                        border:1px solid #c8d6c8;
                        border-radius:7px;
                        background:#ffffff;
                        color:#1b5e20;
                        font-size:11px;
                        font-weight:700;
                        cursor:pointer;
                        touch-action:manipulation;
                    "
                >
                    🎥 VIDEO
                </button>


                <button
                    type="button"
                    id="gg-irregularity-record-audio"
                    onclick="
                        GGIrregularity.Media.recordAudio();
                    "
                    style="
                        min-height:38px;
                        border:1px solid #c8d6c8;
                        border-radius:7px;
                        background:#ffffff;
                        color:#1b5e20;
                        font-size:11px;
                        font-weight:700;
                        cursor:pointer;
                        touch-action:manipulation;
                    "
                >
                    🎙 RECORD AUDIO
                </button>

            </div>


            <!-- ==================================================
                 PHOTO PREVIEW
                 ================================================== -->

            <div
                id="gg-irregularity-photo-preview"
                style="
                    display:none;
                    margin-top:9px;
                    padding:8px;
                    border:1px solid #d7e2d7;
                    border-radius:7px;
                    background:#ffffff;
                "
            >

                <div
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:space-between;
                        gap:8px;
                        margin-bottom:6px;
                    "
                >

                    <strong
                        style="
                            color:#37474f;
                            font-size:11px;
                        "
                    >
                        📷 Photo Preview
                    </strong>


                    <div
                        style="
                            display:flex;
                            gap:5px;
                        "
                    >

                        <button
                            type="button"
                            onclick="
                                document
                                    .getElementById(
                                        'gg-irregularity-photo'
                                    )
                                    ?.click();
                            "
                            style="
                                border:1px solid #c8d6c8;
                                border-radius:6px;
                                background:#ffffff;
                                color:#1b5e20;
                                font-size:10px;
                                padding:5px 8px;
                            "
                        >
                            CHANGE
                        </button>


                        <button
                            type="button"
                            onclick="
                                GGIrregularity.Media
                                    .removePhoto();
                            "
                            style="
                                border:1px solid #efcaca;
                                border-radius:6px;
                                background:#fffafa;
                                color:#c62828;
                                font-size:10px;
                                padding:5px 8px;
                            "
                        >
                            REMOVE
                        </button>

                    </div>

                </div>


                <img
                    id="gg-irregularity-photo-preview-img"
                    alt="Photo preview"
                    style="
                        display:block;
                        width:100%;
                        max-height:220px;
                        object-fit:contain;
                        border-radius:6px;
                        background:#f4f6f4;
                    "
                >

            </div>


            <!-- ==================================================
                 VIDEO PREVIEW
                 ================================================== -->

            <div
                id="gg-irregularity-video-preview"
                style="
                    display:none;
                    margin-top:9px;
                    padding:8px;
                    border:1px solid #d7e2d7;
                    border-radius:7px;
                    background:#ffffff;
                "
            >

                <div
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:space-between;
                        gap:8px;
                        margin-bottom:6px;
                    "
                >

                    <strong
                        style="
                            color:#37474f;
                            font-size:11px;
                        "
                    >
                        🎥 Video Preview
                    </strong>


                    <div
                        style="
                            display:flex;
                            gap:5px;
                        "
                    >

                        <button
                            type="button"
                            onclick="
                                document
                                    .getElementById(
                                        'gg-irregularity-video'
                                    )
                                    ?.click();
                            "
                            style="
                                border:1px solid #c8d6c8;
                                border-radius:6px;
                                background:#ffffff;
                                color:#1b5e20;
                                font-size:10px;
                                padding:5px 8px;
                            "
                        >
                            CHANGE
                        </button>


                        <button
                            type="button"
                            onclick="
                                GGIrregularity.Media
                                    .removeVideo();
                            "
                            style="
                                border:1px solid #efcaca;
                                border-radius:6px;
                                background:#fffafa;
                                color:#c62828;
                                font-size:10px;
                                padding:5px 8px;
                            "
                        >
                            REMOVE
                        </button>

                    </div>

                </div>


                <video
                    id="gg-irregularity-video-preview-player"
                    controls
                    playsinline
                    preload="metadata"
                    style="
                        display:block;
                        width:100%;
                        max-height:240px;
                        border-radius:6px;
                        background:#111111;
                    "
                ></video>

            </div>


            <!-- ==================================================
                 AUDIO PREVIEW
                 ================================================== -->

            <div
                id="gg-irregularity-audio-preview"
                style="
                    display:none;
                    margin-top:9px;
                    padding:8px;
                    border:1px solid #d7e2d7;
                    border-radius:7px;
                    background:#ffffff;
                "
            >

                <div
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:space-between;
                        gap:8px;
                        margin-bottom:6px;
                    "
                >

                    <strong
                        style="
                            color:#37474f;
                            font-size:11px;
                        "
                    >
                        🎙 Audio Preview
                    </strong>


                    <div
                        style="
                            display:flex;
                            gap:5px;
                        "
                    >

                        <button
                            type="button"
                            onclick="
                                GGIrregularity.Media
                                    .recordAgain();
                            "
                            style="
                                border:1px solid #c8d6c8;
                                border-radius:6px;
                                background:#ffffff;
                                color:#1b5e20;
                                font-size:10px;
                                padding:5px 8px;
                            "
                        >
                            RECORD AGAIN
                        </button>


                        <button
                            type="button"
                            onclick="
                                GGIrregularity.Media
                                    .removeAudio();
                            "
                            style="
                                border:1px solid #efcaca;
                                border-radius:6px;
                                background:#fffafa;
                                color:#c62828;
                                font-size:10px;
                                padding:5px 8px;
                            "
                        >
                            REMOVE
                        </button>

                    </div>

                </div>


                <audio
                    id="gg-irregularity-audio-preview-player"
                    controls
                    preload="metadata"
                    style="
                        display:block;
                        width:100%;
                    "
                ></audio>


                <div
                    id="gg-irregularity-audio-timer"
                    style="
                        margin-top:5px;
                        color:#78909c;
                        font-size:10px;
                    "
                >
                </div>

            </div>

        </div>

    `;

};

/* ============================================================
   MEDIA INPUT EVENTS
   ============================================================ */

GGIrregularity.Form.bindMediaEvents =
function(){

    const photoInput =
        document.getElementById(
            "gg-irregularity-photo"
        );


    const videoInput =
        document.getElementById(
            "gg-irregularity-video"
        );


    const audioInput =
        document.getElementById(
            "gg-irregularity-audio"
        );


    /* ========================================================
       PHOTO
       ======================================================== */

    if(
        photoInput &&
        !photoInput.dataset.ggBound
    ){

        photoInput.addEventListener(
            "change",
            function(){

                GGIrregularity.Media
                    .previewPhoto(
                        photoInput
                    );

            }
        );


        photoInput.dataset.ggBound =
            "1";

    }


    /* ========================================================
       VIDEO
       ======================================================== */

    if(
        videoInput &&
        !videoInput.dataset.ggBound
    ){

        videoInput.addEventListener(
            "change",
            function(){

                GGIrregularity.Media
                    .previewVideo(
                        videoInput
                    );

            }
        );


        videoInput.dataset.ggBound =
            "1";

    }


    /* ========================================================
       AUDIO FILE
       ======================================================== */

    if(
        audioInput &&
        !audioInput.dataset.ggBound
    ){

        audioInput.addEventListener(
            "change",
            function(){

                GGIrregularity.Media
                    .previewAudio(
                        audioInput
                    );

            }
        );


        audioInput.dataset.ggBound =
            "1";

    }

};


/* ============================================================
   MEDIA STATUS
   ============================================================ */

GGIrregularity.Form.updateMediaStatus =
function(
    forcedStatus
){

    const status =
        document.getElementById(
            "gg-irregularity-media-status"
        );


    if(
        !status
    ){

        return;

    }


    if(
        forcedStatus ===
        "recording"
    ){

        status.textContent =
            "🎙 Recording audio...";


        status.style.color =
            "#c62828";


        return;

    }


    const media =
        GGIrregularity.Media
            .getFormMedia();


    const items = [];


    if(
        media.photo
    ){

        items.push(
            "Photo"
        );

    }


    if(
        media.video
    ){

        items.push(
            "Video"
        );

    }


    if(
        media.audio ||
        media.nativeAudioUri
    ){

        items.push(
            "Audio"
        );

    }


    if(
        items.length === 0
    ){

        status.textContent =
            "No media selected.";


        status.style.color =
            "#607d8b";


        return;

    }


    status.textContent =
        items.join(
            " + "
        ) +
        " selected";


    status.style.color =
        "#2e7d32";

};


/* ============================================================
   RESET MEDIA
   ============================================================ */

GGIrregularity.Form.resetMedia =
function(){

    /*
     * Stop browser recorder if active.
     */

    if(
        GGIrregularity.Media
            ._audioRecorder
    ){

        try{

            const recorder =
                GGIrregularity.Media
                    ._audioRecorder;


            if(
                recorder.state ===
                "recording"
            ){

                recorder.stop();

            }

        }
        catch(_){

        }

    }


    if(
        GGIrregularity.Media
            ._audioTimer
    ){

        clearInterval(
            GGIrregularity.Media
                ._audioTimer
        );


        GGIrregularity.Media
            ._audioTimer =
            null;

    }


    GGIrregularity.Media._revoke(
        "photo"
    );


    GGIrregularity.Media._revoke(
        "video"
    );


    GGIrregularity.Media._revoke(
        "audio"
    );


    GGIrregularity.Media
        ._audioRecorder =
        null;


    GGIrregularity.Media
        ._audioChunks =
        [];


    GGIrregularity.Media
        ._recording =
        false;


    GGIrregularity.Media
        ._nativeAudioActive =
        false;


    GGIrregularity.Media
        ._nativeAudioUri =
        null;


    window.currentIrregularityAudioType =
        null;


    const ids = [

        "gg-irregularity-photo",

        "gg-irregularity-video",

        "gg-irregularity-audio"

    ];


    ids.forEach(
        function(id){

            const input =
                document.getElementById(
                    id
                );


            if(
                input
            ){

                input.value =
                    "";

            }

        }
    );


    const photoImage =
        document.getElementById(
            "gg-irregularity-photo-preview-img"
        );


    if(
        photoImage
    ){

        photoImage.removeAttribute(
            "src"
        );

    }


    const photoPreview =
        document.getElementById(
            "gg-irregularity-photo-preview"
        );


    if(
        photoPreview
    ){

        photoPreview.style.display =
            "none";

    }


    const videoPlayer =
        document.getElementById(
            "gg-irregularity-video-preview-player"
        );


    if(
        videoPlayer
    ){

        try{

            videoPlayer.pause();

        }
        catch(_){

        }


        videoPlayer.removeAttribute(
            "src"
        );


        try{

            videoPlayer.load();

        }
        catch(_){

        }

    }


    const videoPreview =
        document.getElementById(
            "gg-irregularity-video-preview"
        );


    if(
        videoPreview
    ){

        videoPreview.style.display =
            "none";

    }


    const audioPlayer =
        document.getElementById(
            "gg-irregularity-audio-preview-player"
        );


    if(
        audioPlayer
    ){

        try{

            audioPlayer.pause();

        }
        catch(_){

        }


        audioPlayer.removeAttribute(
            "src"
        );


        try{

            audioPlayer.load();

        }
        catch(_){

        }

    }


    const audioPreview =
        document.getElementById(
            "gg-irregularity-audio-preview"
        );


    if(
        audioPreview
    ){

        audioPreview.style.display =
            "none";

    }


    const timer =
        document.getElementById(
            "gg-irregularity-audio-timer"
        );


    if(
        timer
    ){

        timer.textContent =
            "";

    }


    GGIrregularity.Form
        .updateMediaStatus();

};


/* ============================================================
   SET DEFAULT DATE / TIME
   ============================================================ */

GGIrregularity.Form.setDateTimeDefaults =
function(){

    const now =
        new Date();


    const date =
        now
            .toISOString()
            .slice(
                0,
                10
            );


    const hours =
        String(
            now.getHours()
        )
        .padStart(
            2,
            "0"
        );


    const minutes =
        String(
            now.getMinutes()
        )
        .padStart(
            2,
            "0"
        );


    const dateInput =
        document.getElementById(
            "gg-irregularity-incident_date"
        );


    const timeInput =
        document.getElementById(
            "gg-irregularity-incident_time"
        );


    if(
        dateInput
    ){

        dateInput.value =
            date;

    }


    if(
        timeInput
    ){

        timeInput.value =
            hours +
            ":" +
            minutes;

    }

};


/* ============================================================
   CATEGORY VISIBILITY
   ============================================================ */

GGIrregularity.Form.updateCategoryFields =
function(){

    const category =
        document.getElementById(
            "ggIrregularityType"
        )?.value ||
        "";


    document
        .querySelectorAll(
            "[data-irregularity-group]"
        )
        .forEach(
            function(group){

                group.style.display =
                    "none";

            }
        );


    if(
        !category
    ){

        return;

    }


    const group =
        document.querySelector(
            '[data-irregularity-group="' +
            CSS.escape(category) +
            '"]'
        );


    if(
        group
    ){

        group.style.display =
            "block";

    }

};


/* ============================================================
   READ FORM VALUES
   ============================================================ */

GGIrregularity.Form.collect =
function(){

    const form =
        document.getElementById(
            "gg-irregularity-form"
        );


    if(
        !form
    ){

        throw new Error(
            "Irregularity form not found."
        );

    }


    const formData =
        new FormData(
            form
        );


    const data = {};


    formData.forEach(
        function(value,key){

            /*
             * Ignore actual media files.
             * Media is collected by GGIrregularity.Media.
             */

            if(
                key === "photo" ||
                key === "video" ||
                key === "audio"
            ){

                return;

            }


            if(
                value instanceof File
            ){

                return;

            }


            data[key] =
                typeof value ===
                "string"

                    ? value.trim()

                    : value;

        }
    );


    /*
     * Normalise numeric fields.
     */

    if(
        data.felling_tree_count !==
        undefined
    ){

        const value =
            Number(
                data.felling_tree_count
            );


        data.felling_tree_count =
            Number.isFinite(
                value
            )
                ? value
                : null;

    }


    if(
        data.grazing_count !==
        undefined
    ){

        const value =
            Number(
                data.grazing_count
            );


        data.grazing_count =
            Number.isFinite(
                value
            )
                ? value
                : null;

    }


    /*
     * Preserve the common field names expected
     * by irregularityModule.js.
     */

    return data;

};


/* ============================================================
   FORM VALIDATION
   ============================================================ */

GGIrregularity.Form.validate =
function(){

    const form =
        document.getElementById(
            "gg-irregularity-form"
        );


    if(
        !form
    ){

        return {

            valid:false,

            message:
                "Irregularity form not found."

        };

    }


    const category =
        document.getElementById(
            "ggIrregularityType"
        )?.value ||
        "";


    if(
        !category
    ){

        return {

            valid:false,

            message:
                "Please select the observation / irregularity type."

        };

    }


    const date =
        document.getElementById(
            "gg-irregularity-incident_date"
        )?.value ||
        "";


    const time =
        document.getElementById(
            "gg-irregularity-incident_time"
        )?.value ||
        "";


    if(
        !date
    ){

        return {

            valid:false,

            message:
                "Please select the incident date."

        };

    }


    if(
        !time
    ){

        return {

            valid:false,

            message:
                "Please select the incident time."

        };

    }


    /*
     * Use native HTML validation for any
     * additional required fields.
     */

    if(
        !form.checkValidity()
    ){

        try{

            form.reportValidity();

        }
        catch(_){

        }


        return {

            valid:false,

            message:
                "Please complete the required fields."

        };

    }


    return {

        valid:true,

        message:
            ""

    };

};


/* ============================================================
   BUILD FORM HTML
   ============================================================ */

GGIrregularity.Form.build =
function(){

    return `

        <form
            id="gg-irregularity-form"
            autocomplete="off"
            novalidate
            style="
                width:100%;
                box-sizing:border-box;
            "
        >




            <!-- =================================================
                 CATEGORY
                 ================================================= -->

            ${GGIrregularity.Form.categorySelect()}


            <!-- =================================================
                 DATE / TIME
                 ================================================= -->

            ${GGIrregularity.Form.commonFields()}


            <!-- =================================================
                 CATEGORY-SPECIFIC FIELDS
                 ================================================= -->

            ${GGIrregularity.Form.felling()}

            ${GGIrregularity.Form.timber()}

            ${GGIrregularity.Form.mining()}

            ${GGIrregularity.Form.fishing()}

            ${GGIrregularity.Form.grazing()}

            ${GGIrregularity.Form.fire()}

            ${GGIrregularity.Form.encroachment()}

            ${GGIrregularity.Form.structure()}

            ${GGIrregularity.Form.poaching()}

            ${GGIrregularity.Form.trespassing()}

            ${GGIrregularity.Form.wildlifeInjury()}

            ${GGIrregularity.Form.wildlifeDeath()}

            ${GGIrregularity.Form.observation()}


            <!-- =================================================
                 REMARKS
                 ================================================= -->

            ${GGIrregularity.Form.remarks()}


            <!-- =================================================
                 MEDIA
                 ================================================= -->

            ${GGIrregularity.Form.media()}


            <!-- =================================================
                 SUBMIT
                 ================================================= -->

            <button
                type="submit"
                id="gg-irregularity-submit"
                style="
                    width:100%;
                    min-height:44px;
                    margin-top:4px;
                    border:0;
                    border-radius:8px;
                    background:#2e7d32;
                    color:#ffffff;
                    font-size:13px;
                    font-weight:800;
                    cursor:pointer;
                    touch-action:manipulation;
                "
            >
                SAVE IRREGULARITY
            </button>


            <!-- =================================================
                 CANCEL
                 ================================================= -->

            <button
                type="button"
                id="gg-irregularity-cancel"
                style="
                    width:100%;
                    min-height:38px;
                    margin-top:7px;
                    border:1px solid #cfd8dc;
                    border-radius:8px;
                    background:#ffffff;
                    color:#455a64;
                    font-size:12px;
                    font-weight:700;
                    cursor:pointer;
                    touch-action:manipulation;
                "
            >
                CANCEL
            </button>

        </form>

    `;

};


/* ============================================================
   MOUNT FORM
   ============================================================ */

GGIrregularity.Form.mount =
function(
    container
){

    if(
        !container
    ){

        console.error(
            "❌ Irregularity form container not found."
        );


        return false;

    }


    /*
     * Do not create duplicate forms.
     */

    const existing =
        container.querySelector(
            "#gg-irregularity-form"
        );


    if(
        existing
    ){

        GGIrregularity.Form
            .bind();

        return true;

    }


    container.innerHTML =
        GGIrregularity.Form.build();


    GGIrregularity.Form
        .bind();


    return true;

};


/* ============================================================
   BIND FORM EVENTS
   ============================================================ */

GGIrregularity.Form.bind =
function(){

    const form =
        document.getElementById(
            "gg-irregularity-form"
        );


    if(
        !form
    ){

        return false;

    }


    /*
     * Prevent duplicate submit listeners.
     */

    if(
        !form.dataset.ggSubmitBound
    ){

        form.addEventListener(
            "submit",
            async function(event){

                event.preventDefault();
                event.stopPropagation();


                /*
                 * Let irregularityModule.js own the actual
                 * Firestore save.
                 */

                if(
                    typeof GGIrregularity
                        .submit ===
                    "function"
                ){

                    await GGIrregularity
                        .submit();

                    return;

                }


                if(
                    typeof GGIrregularity
                        .Module
                        ?.submit ===
                    "function"
                ){

                    await GGIrregularity
                        .Module
                        .submit();

                    return;

                }


                console.error(
                    "❌ GGIrregularity.submit() is unavailable."
                );


                alert(
                    "Irregularity module is not ready."
                );

            }
        );


        form.dataset.ggSubmitBound =
            "1";

    }


    /*
     * Category selector.
     */

    const category =
        document.getElementById(
            "ggIrregularityType"
        );


    if(
        category &&
        !category.dataset.ggBound
    ){

        category.addEventListener(
            "change",
            function(){

                GGIrregularity.Form
                    .updateCategoryFields();

            }
        );


        category.dataset.ggBound =
            "1";

    }


    /*
     * Cancel.
     */

    const cancel =
        document.getElementById(
            "gg-irregularity-cancel"
        );


    if(
        cancel &&
        !cancel.dataset.ggBound
    ){

        cancel.addEventListener(
            "click",
            function(){

                if(
                    typeof window
                        .closeIrregularityForm ===
                    "function"
                ){

                    window
                        .closeIrregularityForm();

                }

            }
        );


        cancel.dataset.ggBound =
            "1";

    }


    /*
     * Media.
     */

    GGIrregularity.Form
        .bindMediaEvents();


    GGIrregularity.Form
        .setDateTimeDefaults();


    GGIrregularity.Form
        .updateCategoryFields();


    GGIrregularity.Form
        .updateMediaStatus();


    return true;

};


/* ============================================================
   OPEN / RESET FORM
   ============================================================ */

GGIrregularity.Form.reset =
function(){

    const form =
        document.getElementById(
            "gg-irregularity-form"
        );


    if(
        form
    ){

        try{

            form.reset();

        }
        catch(_){

        }

    }


    GGIrregularity.Form
        .resetMedia();


    GGIrregularity.Form
        .setDateTimeDefaults();


    GGIrregularity.Form
        .updateCategoryFields();


    GGIrregularity.Form
        .updateMediaStatus();

};


/* ============================================================
   CLOSE FORM
   ============================================================ */

GGIrregularity.Form.close =
function(){

    GGIrregularity.Form
        .reset();

};


/* ============================================================
   INITIALIZE FORM CONTAINER
   ============================================================ */

GGIrregularity.Form.init =
function(){

    /*
     * Existing UI may already contain the modal.
     * Find the dedicated irregularity form container.
     */

    const container =
        document.getElementById(
            "irregularity-form-container"
        );


    if(
        container
    ){

        GGIrregularity.Form
            .mount(
                container
            );


        return true;

    }


    /*
     * Alternative container used by some versions
     * of the UI.
     */

    const alternative =
        document.getElementById(
            "irregularityFormContainer"
        );


    if(
        alternative
    ){

        GGIrregularity.Form
            .mount(
                alternative
            );


        return true;

    }


    console.warn(
        "⚠️ Irregularity form container not found. UI will mount it when opened."
    );


    return false;

};


/* ============================================================
   GLOBAL FORM HELPERS
   ============================================================ */

window.openGGIrregularityForm =
function(){

    if(
        typeof window
            .openIrregularityForm ===
        "function"
    ){

        window
            .openIrregularityForm();

        return;

    }


    console.warn(
        "⚠️ openIrregularityForm() is not available."
    );

};


/* ============================================================
   INITIALIZE WHEN DOM READY
   ============================================================ */

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        function(){

            try{

                GGIrregularity.Form
                    .init();

            }
            catch(error){

                console.error(
                    "❌ Irregularity Form initialization failed:",
                    error
                );

            }

        },
        {
            once:true
        }
    );

}
else{

    try{

        GGIrregularity.Form
            .init();

    }
    catch(error){

        console.error(
            "❌ Irregularity Form initialization failed:",
            error
        );

    }

}


/* ============================================================
   END irregularityForm.js
   ============================================================ */


/* ============================================================
   EXISTING MEDIA PIPELINE COMPATIBILITY
   ============================================================ */

/*
 * Some existing GreenGuard code may call these names directly.
 * Keep them available without creating another upload pipeline.
 */


/* ============================================================
   PHOTO
   ============================================================ */

GGIrregularity.Media.changePhoto =
function(){

    const input =
        document.getElementById(
            "gg-irregularity-photo"
        );


    if(
        input
    ){

        input.click();

    }

};


/* ============================================================
   VIDEO
   ============================================================ */

GGIrregularity.Media.changeVideo =
function(){

    const input =
        document.getElementById(
            "gg-irregularity-video"
        );


    if(
        input
    ){

        input.click();

    }

};


/* ============================================================
   AUDIO FILE
   ============================================================ */

GGIrregularity.Media.selectAudio =
function(){

    const input =
        document.getElementById(
            "gg-irregularity-audio"
        );


    if(
        input
    ){

        input.click();

    }

};


/* ============================================================
   AUDIO STOP
   ============================================================ */

GGIrregularity.Media.stopRecording =
function(){

    const recorder =
        GGIrregularity.Media
            ._audioRecorder;


    if(
        recorder &&
        recorder.state ===
        "recording"
    ){

        try{

            recorder.stop();

        }
        catch(error){

            console.warn(
                "⚠ Unable to stop audio recorder:",
                error
            );

        }


        return;

    }


    /*
     * Native recorder is controlled by Android.
     * There is deliberately no competing native implementation
     * here.
     */

    if(
        GGIrregularity.Media
            ._nativeAudioActive
    ){

        console.log(
            "🎙 Native audio recorder is active."
        );

    }

};


/* ============================================================
   MEDIA SUMMARY
   ============================================================ */

GGIrregularity.Media.getSummary =
function(){

    const media =
        GGIrregularity.Media
            .getFormMedia();


    return {

        hasPhoto:
            !!media.photo,

        hasVideo:
            !!media.video,

        hasAudio:
            !!(
                media.audio ||
                media.nativeAudioUri
            ),

        photo:
            media.photo,

        video:
            media.video,

        audio:
            media.audio,

        nativeAudioUri:
            media.nativeAudioUri

    };

};


/* ============================================================
   MEDIA VALIDATION
   ============================================================ */

GGIrregularity.Media.validate =
function(){

    const media =
        GGIrregularity.Media
            .getFormMedia();


    /*
     * No media is valid.
     */

    if(
        !media.photo &&
        !media.video &&
        !media.audio &&
        !media.nativeAudioUri
    ){

        return {

            valid:true,

            message:""

        };

    }


    /*
     * Photo.
     */

    if(
        media.photo &&
        !media.photo.type.startsWith(
            "image/"
        )
    ){

        return {

            valid:false,

            message:
                "Invalid photo file."

        };

    }


    /*
     * Video.
     */

    if(
        media.video &&
        !media.video.type.startsWith(
            "video/"
        )
    ){

        return {

            valid:false,

            message:
                "Invalid video file."

        };

    }


    /*
     * Audio.
     */

    if(
        media.audio &&
        !media.audio.type.startsWith(
            "audio/"
        )
    ){

        return {

            valid:false,

            message:
                "Invalid audio file."

        };

    }


    return {

        valid:true,

        message:""

    };

};


/* ============================================================
   BEFORE SUBMIT MEDIA CHECK
   ============================================================ */

GGIrregularity.Form.validateMedia =
function(){

    const result =
        GGIrregularity.Media
            .validate();


    if(
        !result.valid
    ){

        alert(
            result.message
        );


        return false;

    }


    return true;

};


/* ============================================================
   COMPLETE FORM VALIDATION
   ============================================================ */

GGIrregularity.Form.validateBeforeSubmit =
function(){

    const formResult =
        GGIrregularity.Form
            .validate();


    if(
        !formResult.valid
    ){

        if(
            formResult.message
        ){

            alert(
                formResult.message
            );

        }


        return false;

    }


    if(
        !GGIrregularity.Form
            .validateMedia()
    ){

        return false;

    }


    return true;

};


/* ============================================================
   SUBMIT BUTTON STATE
   ============================================================ */

GGIrregularity.Form.setSubmitting =
function(
    state
){

    const button =
        document.getElementById(
            "gg-irregularity-submit"
        );


    if(
        !button
    ){

        return;

    }


    if(
        state
    ){

        button.disabled =
            true;


        button.dataset.originalText =
            button.textContent;


        button.textContent =
            "SAVING...";


        button.style.opacity =
            "0.65";


        button.style.cursor =
            "wait";

    }
    else{

        button.disabled =
            false;


        button.textContent =
            button.dataset.originalText ||
            "SAVE IRREGULARITY";


        button.style.opacity =
            "1";


        button.style.cursor =
            "pointer";

    }

};


/* ============================================================
   FORM DATA SNAPSHOT
   ============================================================ */

GGIrregularity.Form.getSnapshot =
function(){

    let data = {};


    try{

        data =
            GGIrregularity.Form
                .collect();

    }
    catch(error){

        console.error(
            "❌ Unable to collect Irregularity form:",
            error
        );

    }


    return {

        form:
            data,

        media:
            GGIrregularity.Media
                .getSummary()

    };

};


/* ============================================================
   DEBUG HELPER
   ============================================================ */

GGIrregularity.Form.debug =
function(){

    const snapshot =
        GGIrregularity.Form
            .getSnapshot();


    console.log(
        "=============================="
    );


    console.log(
        "⚠️ IRREGULARITY FORM DEBUG"
    );


    console.log(
        "=============================="
    );


    console.log(
        "FORM:",
        snapshot.form
    );


    console.log(
        "MEDIA:",
        snapshot.media
    );


    console.log(
        "GPS:",
        window.latestGps
    );


    console.log(
        "GIS:",
        typeof window.resolveCurrentGIS
    );


    console.log(
        "FIREBASE DB:",
        !!window.db
    );


    console.log(
        "FIREBASE STORAGE:",
        !!window.storage
    );


    console.log(
        "MODULE:",
        typeof GGIrregularity.submit
    );


    console.log(
        "=============================="
    );


    return snapshot;

};


/* ============================================================
   FINAL INITIALIZATION CHECK
   ============================================================ */

GGIrregularity.Form.ready =
function(){

    return {

        form:
            !!document.getElementById(
                "gg-irregularity-form"
            ),

        media:
            !!document.getElementById(
                "gg-irregularity-photo"
            ) &&
            !!document.getElementById(
                "gg-irregularity-video"
            ) &&
            !!document.getElementById(
                "gg-irregularity-audio"
            ),

        photoPreview:
            !!document.getElementById(
                "gg-irregularity-photo-preview"
            ),

        videoPreview:
            !!document.getElementById(
                "gg-irregularity-video-preview"
            ),

        audioPreview:
            !!document.getElementById(
                "gg-irregularity-audio-preview"
            ),

        module:
            typeof GGIrregularity.submit ===
            "function",

        gis:
            typeof window.resolveCurrentGIS ===
            "function",

        gps:
            !!window.latestGps

    };

};


/* ============================================================
   FINAL CONSOLE MESSAGE
   ============================================================ */

console.log(
    "✅ GGIrregularity.Form loaded."
);


console.log(
    "📎 Irregularity media UI:",
    {
        photo:
            typeof GGIrregularity.Media.previewPhoto,

        video:
            typeof GGIrregularity.Media.previewVideo,

        audio:
            typeof GGIrregularity.Media.recordAudio,

        upload:
            typeof GGIrregularity.Media.upload,

        updateFirestore:
            typeof GGIrregularity.Media.updateFirestore

    }
);


/* ============================================================
   END OF irregularityForm.js
   ============================================================ */
