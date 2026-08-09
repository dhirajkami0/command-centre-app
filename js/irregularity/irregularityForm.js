/* ============================================================
   🌲 GREENGUARD
   IRREGULARITY / OFFENCE / OBSERVATION FORM
   ============================================================

   File:
       js/irregularity/irregularityForm.js

   PURPOSE
   ------------------------------------------------------------
   Builds ONLY the fields that the patrol user must manually
   enter.

   AUTOMATIC SYSTEM DATA IS NOT SHOWN IN THIS FORM.

   At submission, irregularityModule.js is responsible for
   resolving and adding:

       • GPS
       • latitude
       • longitude
       • GPS accuracy
       • GIS
       • division
       • range
       • beat
       • compartment
       • village
       • villageCode
       • block
       • nearestPoint
       • distanceMeters
       • location text
       • reported_by
       • reported_by_phone
       • reported_by_role
       • created_at
       • updated_at

   IMPORTANT
   ------------------------------------------------------------
   • Uses GGIrregularity constants
   • Does NOT initialize Firebase
   • Does NOT resolve GIS
   • Does NOT create GPS tracking
   • Does NOT use Apps Script
   • Does NOT use callBackend()
   • Save is handled by GGIrregularity.submit()
   • Existing Wildlife / Elephant UI is untouched
   ============================================================ */


/* ============================================================
   NAMESPACE
   ============================================================ */

window.GGIrregularity =
    window.GGIrregularity || {};


/* ============================================================
   FORM NAMESPACE
   ============================================================ */

GGIrregularity.Form =
    GGIrregularity.Form || {};


/* ============================================================
   ESCAPE HTML
   ============================================================ */

GGIrregularity.Form.escape =
function(
    value
){

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
            options.placeholder ||
            ""
        );


    const value =
        GGIrregularity.Form.escape(
            options.value ||
            ""
        );


    /* ========================================================
       SELECT
       ======================================================== */

    if(
        type ===
        "select"
    ){

        const optionList =
            options.options ||
            [];


        const optionHtml =
            optionList
                .map(
                    function(
                        item
                    ){

                        const optionValue =
                            typeof item ===
                            "string"
                                ? item
                                : item.value;


                        const optionLabel =
                            typeof item ===
                            "string"
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

                    <option
                        value=""
                    >
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
        type ===
        "textarea"
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
                "🚧 Encroachment"
        },

        {
            value:
                GGIrregularity.TYPES.STRUCTURE,

            label:
                "🏗️ Illegal Structure / Occupation"
        },

        {
            value:
                GGIrregularity.TYPES.POACHING,

            label:
                "🏹 Poaching"
        },

        {
            value:
                GGIrregularity.TYPES.TRESPASSING,

            label:
                "🚪 Illegal Entry / Trespassing"
        },

        {
            value:
                GGIrregularity.TYPES.WILDLIFE_INJURY,

            label:
                "🐾 Wildlife Injury"
        },

        {
            value:
                GGIrregularity.TYPES.WILDLIFE_DEATH,

            label:
                "☠️ Wildlife Death"
        },

        {
            value:
                GGIrregularity.TYPES.OBSERVATION,

            label:
                "👁️ General Observation"
        }

    ];

};


/* ============================================================
   CATEGORY SELECT
   ============================================================ */

GGIrregularity.Form.categorySelect =
function(){

    return GGIrregularity.Form.field(

        "Irregularity / Offence / Observation",

        "type",

        "select",

        {

            required:
                true,

            options:
                GGIrregularity.Form.categoryOptions()

        }

    );

};


/* ============================================================
   COMMON INCIDENT FIELDS
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

            ${GGIrregularity.Form.field(
                "Incident Date",
                "incident_date",
                "date",
                {
                    required:
                        true
                }
            )}

            ${GGIrregularity.Form.field(
                "Incident Time",
                "incident_time",
                "time",
                {
                    required:
                        true
                }
            )}

        </div>

    `;

};


/* ============================================================
   ILLICIT FELLING
   ============================================================ */

GGIrregularity.Form.felling =
function(){

    return `

        <div
            data-irregularity-group="ILLICIT_FELLING"
            style="display:none;"
        >

            ${GGIrregularity.Form.field(
                "Felling Compartment",
                "felling_compartment",
                "text",
                {
                    placeholder:
                        "Compartment"
                }
            )}

            ${GGIrregularity.Form.field(
                "No. of Trees Felled",
                "number_of_felling",
                "number",
                {
                    min:
                        "0",

                    placeholder:
                        "Number of trees"
                }
            )}

            ${GGIrregularity.Form.field(
                "Species Felled",
                "species_felled",
                "text",
                {
                    placeholder:
                        "Species"
                }
            )}

        </div>

    `;

};


/* ============================================================
   ILLEGAL TIMBER / FOREST PRODUCE
   ============================================================ */

GGIrregularity.Form.timber =
function(){

    return `

        <div
            data-irregularity-group="ILLEGAL_TIMBER_FOREST_PRODUCE"
            style="display:none;"
        >

            ${GGIrregularity.Form.field(
                "Timber / Forest Produce",
                "timber_type",
                "text",
                {
                    placeholder:
                        "Type of timber / forest produce"
                }
            )}

            ${GGIrregularity.Form.field(
                "Quantity",
                "timber_quantity",
                "text",
                {
                    placeholder:
                        "Quantity / measurement"
                }
            )}

        </div>

    `;

};


/* ============================================================
   ILLEGAL MINING / EARTH CUTTING
   ============================================================ */

GGIrregularity.Form.mining =
function(){

    return `

        <div
            data-irregularity-group="ILLEGAL_MINING_EARTH_CUTTING"
            style="display:none;"
        >

            ${GGIrregularity.Form.field(
                "Mining / Earth Cutting Compartment",
                "mining_compartment",
                "text",
                {
                    placeholder:
                        "Compartment"
                }
            )}

            ${GGIrregularity.Form.field(
                "Area",
                "mining_area",
                "text",
                {
                    placeholder:
                        "Area / extent"
                }
            )}

            ${GGIrregularity.Form.field(
                "Mining / Cutting Type",
                "mining_type",
                "text",
                {
                    placeholder:
                        "Mining / earth cutting details"
                }
            )}

        </div>

    `;

};


/* ============================================================
   ILLEGAL FISHING
   ============================================================ */

GGIrregularity.Form.fishing =
function(){

    return `

        <div
            data-irregularity-group="ILLEGAL_FISHING"
            style="display:none;"
        >

            ${GGIrregularity.Form.field(
                "Fishing Location / Water Body",
                "fishing_location",
                "text",
                {
                    placeholder:
                        "River / stream / water body"
                }
            )}

            ${GGIrregularity.Form.field(
                "Fishing Method",
                "fishing_method",
                "text",
                {
                    placeholder:
                        "Method / gear used"
                }
            )}

        </div>

    `;

};


/* ============================================================
   ILLEGAL GRAZING
   ============================================================ */

GGIrregularity.Form.grazing =
function(){

    return `

        <div
            data-irregularity-group="ILLEGAL_GRAZING"
            style="display:none;"
        >

            ${GGIrregularity.Form.field(
                "Grazing Area / Details",
                "grazing_area",
                "text",
                {
                    placeholder:
                        "Estimated area / grazing details"
                }
            )}

        </div>

    `;

};


/* ============================================================
   FOREST FIRE
   ============================================================ */

GGIrregularity.Form.fire =
function(){

    return `

        <div
            data-irregularity-group="FOREST_FIRE"
            style="display:none;"
        >

            ${GGIrregularity.Form.field(
                "Fire Compartment / Area",
                "fire_area",
                "text",
                {
                    placeholder:
                        "Compartment / affected area"
                }
            )}

            ${GGIrregularity.Form.field(
                "Area Affected",
                "fire_affected_area",
                "text",
                {
                    placeholder:
                        "Estimated affected area"
                }
            )}

            ${GGIrregularity.Form.field(
                "Probable Cause",
                "fire_cause",
                "text",
                {
                    placeholder:
                        "If known"
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
            style="display:none;"
        >

            ${GGIrregularity.Form.field(
                "Encroachment Compartment",
                "encroached_compartment",
                "text",
                {
                    placeholder:
                        "Compartment"
                }
            )}

            ${GGIrregularity.Form.field(
                "Area Encroached",
                "encroached_area",
                "text",
                {
                    placeholder:
                        "Area encroached"
                }
            )}

            ${GGIrregularity.Form.field(
                "Encroachment Type",
                "encroachment_type",
                "text",
                {
                    placeholder:
                        "Cultivation / occupation / other"
                }
            )}

        </div>

    `;

};


/* ============================================================
   ILLEGAL STRUCTURE / OCCUPATION
   ============================================================ */

GGIrregularity.Form.structure =
function(){

    return `

        <div
            data-irregularity-group="ILLEGAL_STRUCTURE_OCCUPATION"
            style="display:none;"
        >

            ${GGIrregularity.Form.field(
                "Structure Type",
                "structure_type",
                "text",
                {
                    placeholder:
                        "House / shed / road / other"
                }
            )}

            ${GGIrregularity.Form.field(
                "Description",
                "structure_description",
                "textarea",
                {
                    rows:
                        3,

                    placeholder:
                        "Describe the structure / occupation"
                }
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
            style="display:none;"
        >

            ${GGIrregularity.Form.field(
                "Species",
                "poaching_species",
                "text",
                {
                    placeholder:
                        "Species, if known"
                }
            )}

            ${GGIrregularity.Form.field(
                "Poaching Method / Evidence",
                "poaching_method",
                "text",
                {
                    placeholder:
                        "Method / evidence observed"
                }
            )}

        </div>

    `;

};


/* ============================================================
   ILLEGAL ENTRY / TRESPASSING
   ============================================================ */

GGIrregularity.Form.trespassing =
function(){

    return `

        <div
            data-irregularity-group="ILLEGAL_ENTRY_TRESPASSING"
            style="display:none;"
        >

            ${GGIrregularity.Form.field(
                "No. of Trespassers",
                "trespasser_count",
                "number",
                {
                    min:
                        "0"
                }
            )}

            ${GGIrregularity.Form.field(
                "Details",
                "trespassing_description",
                "textarea",
                {
                    rows:
                        3,

                    placeholder:
                        "Describe entry / trespassing observed"
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
            style="display:none;"
        >

            ${GGIrregularity.Form.field(
                "Species",
                "injured_species",
                "text",
                {
                    placeholder:
                        "Species"
                }
            )}


            <div
                style="
                    display:grid;
                    grid-template-columns:
                        minmax(0,1fr)
                        minmax(0,1fr);
                    gap:8px;
                "
            >

                ${GGIrregularity.Form.field(
                    "Age",
                    "injured_age",
                    "text",
                    {
                        placeholder:
                            "Age"
                    }
                )}

                ${GGIrregularity.Form.field(
                    "Sex",
                    "injured_sex",
                    "text",
                    {
                        placeholder:
                            "Sex"
                    }
                )}

            </div>


            ${GGIrregularity.Form.field(
                "Injury Details",
                "injury_details",
                "textarea",
                {
                    rows:
                        3,

                    placeholder:
                        "Describe injury"
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
            style="display:none;"
        >

            ${GGIrregularity.Form.field(
                "Species",
                "dead_species",
                "text",
                {
                    placeholder:
                        "Species"
                }
            )}


            <div
                style="
                    display:grid;
                    grid-template-columns:
                        minmax(0,1fr)
                        minmax(0,1fr);
                    gap:8px;
                "
            >

                ${GGIrregularity.Form.field(
                    "Sex",
                    "dead_sex",
                    "text",
                    {
                        placeholder:
                            "Sex"
                    }
                )}

                ${GGIrregularity.Form.field(
                    "Age",
                    "dead_age",
                    "text",
                    {
                        placeholder:
                            "Age"
                    }
                )}

            </div>


            ${GGIrregularity.Form.field(
                "Measurement",
                "dead_measurement",
                "text",
                {
                    placeholder:
                        "Body / carcass measurement"
                }
            )}

        </div>

    `;

};


/* ============================================================
   GENERAL OBSERVATION
   ============================================================ */

GGIrregularity.Form.observation =
function(){

    return `

        <div
            data-irregularity-group="GENERAL_OBSERVATION"
            style="display:none;"
        >

            ${GGIrregularity.Form.field(
                "Observation",
                "observation",
                "textarea",
                {
                    rows:
                        4,

                    placeholder:
                        "Describe the observation"
                }
            )}

        </div>

    `;

};


/* ============================================================
   COMMON REMARKS
   ============================================================ */

GGIrregularity.Form.remarks =
function(){

    return GGIrregularity.Form.field(

        "Remarks",

        "remarks",

        "textarea",

        {

            rows:
                3,

            placeholder:
                "Additional remarks"

        }

    );

};


/* ============================================================
   MEDIA INPUT SECTION
   ============================================================

   IMPORTANT
   ------------------------------------------------------------
   We are NOT inventing a new media uploader here.

   The actual existing GreenGuard media uploader should be
   connected by the submit module using the application's
   existing Storage/media functions.

   Therefore this section only provides the user's intent/
   attachment slots and does not initialize Firebase Storage.
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
                    margin:0 0 8px 0;
                    color:#1b5e20;
                    font-size:12px;
                    font-weight:800;
                "
            >
                🎬 MEDIA
            </div>


            <div
                style="
                    display:grid;
                    grid-template-columns:
                        repeat(
                            3,
                            minmax(0,1fr)
                        );
                    gap:7px;
                "
            >

                <button
                    type="button"
                    id="gg-irregularity-photo"
                    data-media-type="photo"
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
                    📷 Photo
                </button>


                <button
                    type="button"
                    id="gg-irregularity-video"
                    data-media-type="video"
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
                    🎥 Video
                </button>


                <button
                    type="button"
                    id="gg-irregularity-audio"
                    data-media-type="audio"
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
                    🎙 Audio
                </button>

            </div>


            <div
                id="gg-irregularity-media-status"
                style="
                    margin-top:7px;
                    color:#607d8b;
                    font-size:10px;
                    line-height:1.3;
                "
            >
                No media selected.
            </div>

        </div>

    `;

};


/* ============================================================
   BUILD FORM
   ============================================================ */

GGIrregularity.Form.build =
function(){

    return `

        <form
            id="ggIrregularityForm"
            autocomplete="off"
            novalidate
            style="
                width:100%;
                box-sizing:border-box;
                margin:0;
                padding:0;
            "
        >

            <!-- ============================================
                 HEADER
                 ============================================ -->

            <div
                style="
                    display:flex;
                    align-items:center;
                    width:100%;
                    box-sizing:border-box;
                    margin:0 0 12px 0;
                    padding:10px 12px;
                    border-radius:8px;
                    background:#2e7d32;
                    color:#ffffff;
                "
            >

                <span
                    style="
                        font-size:17px;
                        line-height:1;
                        flex:0 0 auto;
                    "
                >
                    ⚠️
                </span>

                <span
                    style="
                        margin-left:7px;
                        font-size:14px;
                        font-weight:800;
                        line-height:1.2;
                    "
                >
                    IRREGULARITY / OFFENCE / OBSERVATION
                </span>

            </div>


            <!-- ============================================
                 CATEGORY
                 ============================================ -->

            ${GGIrregularity.Form.categorySelect()}


            <!-- ============================================
                 DATE / TIME
                 ============================================ -->

            ${GGIrregularity.Form.commonFields()}


            <!-- ============================================
                 CATEGORY-SPECIFIC FIELDS
                 ============================================ -->

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


            <!-- ============================================
                 REMARKS
                 ============================================ -->

            ${GGIrregularity.Form.remarks()}


            <!-- ============================================
                 MEDIA
                 ============================================ -->

            ${GGIrregularity.Form.media()}


            <!-- ============================================
                 SAVE BUTTON
                 ============================================ -->

            <button
                id="ggIrregularitySubmit"
                type="submit"
                style="
                    width:100%;
                    box-sizing:border-box;
                    min-height:42px;
                    margin:4px 0 0 0;
                    padding:9px 12px;
                    border:none;
                    border-radius:8px;
                    background:#2e7d32;
                    color:#ffffff;
                    font-size:13px;
                    font-weight:800;
                    cursor:pointer;
                    touch-action:manipulation;
                    -webkit-tap-highlight-color:transparent;
                "
            >
                SAVE OBSERVATION
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
        typeof container ===
        "string"
    ){

        container =
            document.getElementById(
                container
            );

    }


    if(
        !container
    ){

        console.warn(
            "⚠ Irregularity form container not found."
        );

        return false;

    }


    container.innerHTML =
        GGIrregularity.Form.build();


    /*
     * GGIrregularity.init()
     * is responsible for binding:
     *
     * • category switching
     * • submit
     * • media controls
     *
     * It must NOT create another GPS/GIS resolver.
     */

    if(
        typeof GGIrregularity.init ===
        "function"
    ){

        GGIrregularity.init();

    }


    return true;

};


/* ============================================================
   OPTIONAL GLOBAL HELPER
   ============================================================ */

window.mountIrregularityForm =
function(
    container
){

    return GGIrregularity.Form.mount(
        container
    );

};


/* ============================================================
   END
   ============================================================ */
