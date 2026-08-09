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
   COMMON INCIDENT DATE / TIME
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
                    required:true
                }
            )}

            ${GGIrregularity.Form.field(
                "Incident Time",
                "incident_time",
                "time",
                {
                    required:true
                }
            )}

        </div>

    `;

};


/* ============================================================
   🌳 ILLICIT FELLING
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
                    min:"0",
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
   🪵 ILLEGAL TIMBER / FOREST PRODUCE
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
   🚜 ILLEGAL MINING / EARTH CUTTING
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
   🎣 ILLEGAL FISHING
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
   🐄 ILLEGAL GRAZING
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
   🔥 FOREST FIRE
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
   🚧 ENCROACHMENT
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
   🏗️ ILLEGAL STRUCTURE / OCCUPATION
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
                    rows:3,
                    placeholder:
                        "Describe the structure / occupation"
                }
            )}

        </div>

    `;

};


/* ============================================================
   🏹 POACHING
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
   🚪 ILLEGAL ENTRY / TRESPASSING
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
                    min:"0"
                }
            )}

            ${GGIrregularity.Form.field(
                "Details",
                "trespassing_description",
                "textarea",
                {
                    rows:3,
                    placeholder:
                        "Describe entry / trespassing observed"
                }
            )}

        </div>

    `;

};


/* ============================================================
   🐾 WILDLIFE INJURY
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
                    rows:3,
                    placeholder:
                        "Describe injury"
                }
            )}

        </div>

    `;

};


/* ============================================================
   ☠️ WILDLIFE DEATH
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
   👁️ GENERAL OBSERVATION
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
                    rows:4,
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
            rows:3,

            placeholder:
                "Additional remarks"
        }

    );

};


/* ============================================================
   📷 MEDIA
   ============================================================

   IMPORTANT
   ------------------------------------------------------------
   These MUST be actual <input type="file"> elements.

   irregularityModule.js checks:

       element.files[0]

   Therefore buttons with the same IDs are incorrect.

   The visible labels act as the professional buttons while
   the actual file inputs remain visually hidden.

   IDs are preserved:

       gg-irregularity-photo
       gg-irregularity-video
       gg-irregularity-audio

   This keeps compatibility with the module.

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

            <!-- ====================================================
                 TITLE
                 ==================================================== -->

            <div
                style="
                    margin:0 0 8px 0;
                    color:#1b5e20;
                    font-size:12px;
                    font-weight:800;
                "
            >
                📎 MEDIA
            </div>


            <!-- ====================================================
                 MEDIA INPUT BUTTONS
                 ==================================================== -->

            <div
                style="
                    display:grid;
                    grid-template-columns:
                        repeat(
                            3,
                            minmax(0,1fr)
                        );
                    gap:7px;
                    width:100%;
                "
            >

                <!-- ==================================================
                     PHOTO
                     ================================================== -->

                <label
                    for="gg-irregularity-photo"
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        min-height:38px;
                        box-sizing:border-box;
                        border:1px solid #c8d6c8;
                        border-radius:7px;
                        background:#ffffff;
                        color:#1b5e20;
                        font-size:11px;
                        font-weight:700;
                        cursor:pointer;
                        text-align:center;
                        touch-action:manipulation;
                        -webkit-tap-highlight-color:transparent;
                    "
                >
                    📷 Photo
                </label>


                <input
                    id="gg-irregularity-photo"
                    name="photo"
                    type="file"
                    accept="image/*"
                    style="
                        position:absolute;
                        width:1px;
                        height:1px;
                        opacity:0;
                        pointer-events:none;
                    "
                >


                <!-- ==================================================
                     VIDEO
                     ================================================== -->

                <label
                    for="gg-irregularity-video"
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        min-height:38px;
                        box-sizing:border-box;
                        border:1px solid #c8d6c8;
                        border-radius:7px;
                        background:#ffffff;
                        color:#1b5e20;
                        font-size:11px;
                        font-weight:700;
                        cursor:pointer;
                        text-align:center;
                        touch-action:manipulation;
                        -webkit-tap-highlight-color:transparent;
                    "
                >
                    🎥 Video
                </label>


                <input
                    id="gg-irregularity-video"
                    name="video"
                    type="file"
                    accept="video/*"
                    style="
                        position:absolute;
                        width:1px;
                        height:1px;
                        opacity:0;
                        pointer-events:none;
                    "
                >


                <!-- ==================================================
                     AUDIO FILE
                     ================================================== -->

                <label
                    for="gg-irregularity-audio"
                    id="gg-irregularity-select-audio"
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        min-height:38px;
                        box-sizing:border-box;
                        border:1px solid #c8d6c8;
                        border-radius:7px;
                        background:#ffffff;
                        color:#1b5e20;
                        font-size:11px;
                        font-weight:700;
                        cursor:pointer;
                        text-align:center;
                        touch-action:manipulation;
                        -webkit-tap-highlight-color:transparent;
                    "
                >
                    🎙 Audio
                </label>


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

            </div>


            <!-- ====================================================
                 AUDIO RECORD BUTTON
                 ==================================================== -->

            <button
                type="button"
                id="gg-irregularity-record-audio"
                style="
                    width:100%;
                    min-height:38px;
                    margin-top:7px;
                    box-sizing:border-box;
                    border:1px solid #c8d6c8;
                    border-radius:7px;
                    background:#ffffff;
                    color:#1b5e20;
                    font-size:11px;
                    font-weight:700;
                    cursor:pointer;
                    touch-action:manipulation;
                    -webkit-tap-highlight-color:transparent;
                "
            >
                🎙 Record Audio
            </button>


            <!-- ====================================================
                 PHOTO PREVIEW
                 ==================================================== -->

            <div
                id="gg-irregularity-photo-preview"
                style="
                    display:none;
                    margin-top:8px;
                    padding:8px;
                    border:1px solid #dfe8df;
                    border-radius:7px;
                    background:#ffffff;
                "
            >

                <img
                    id="gg-irregularity-photo-preview-img"
                    alt="Irregularity photo preview"
                    style="
                        display:block;
                        width:100%;
                        max-height:220px;
                        object-fit:contain;
                        border-radius:6px;
                        background:#f5f5f5;
                    "
                >

                <div
                    id="gg-irregularity-photo-actions"
                    style="
                        display:none;
                        align-items:center;
                        gap:6px;
                        margin-top:7px;
                    "
                >

                    <button
                        type="button"
                        id="gg-irregularity-photo-remove"
                        style="
                            flex:1;
                            min-height:32px;
                            border:1px solid #d6bcbc;
                            border-radius:6px;
                            background:#fff;
                            color:#b71c1c;
                            font-size:11px;
                            font-weight:700;
                            cursor:pointer;
                        "
                    >
                        Remove Photo
                    </button>

                </div>

            </div>


            <!-- ====================================================
                 VIDEO PREVIEW
                 ==================================================== -->

            <div
                id="gg-irregularity-video-preview"
                style="
                    display:none;
                    margin-top:8px;
                    padding:8px;
                    border:1px solid #dfe8df;
                    border-radius:7px;
                    background:#ffffff;
                "
            >

                <video
                    id="gg-irregularity-video-preview-player"
                    controls
                    playsinline
                    style="
                        display:block;
                        width:100%;
                        max-height:220px;
                        border-radius:6px;
                        background:#000;
                    "
                ></video>


                <div
                    id="gg-irregularity-video-actions"
                    style="
                        display:none;
                        align-items:center;
                        gap:6px;
                        margin-top:7px;
                    "
                >

                    <button
                        type="button"
                        id="gg-irregularity-video-remove"
                        style="
                            flex:1;
                            min-height:32px;
                            border:1px solid #d6bcbc;
                            border-radius:6px;
                            background:#fff;
                            color:#b71c1c;
                            font-size:11px;
                            font-weight:700;
                            cursor:pointer;
                        "
                    >
                        Remove Video
                    </button>

                </div>

            </div>


            <!-- ====================================================
                 AUDIO PREVIEW
                 ==================================================== -->

            <div
                id="gg-irregularity-audio-preview"
                style="
                    display:none;
                    margin-top:8px;
                    padding:8px;
                    border:1px solid #dfe8df;
                    border-radius:7px;
                    background:#ffffff;
                "
            >

                <audio
                    id="gg-irregularity-audio-preview-player"
                    controls
                    style="
                        display:block;
                        width:100%;
                    "
                ></audio>


                <div
                    id="gg-irregularity-audio-actions"
                    style="
                        display:none;
                        align-items:center;
                        gap:6px;
                        margin-top:7px;
                    "
                >

                    <button
                        type="button"
                        id="gg-irregularity-audio-remove"
                        style="
                            flex:1;
                            min-height:32px;
                            border:1px solid #d6bcbc;
                            border-radius:6px;
                            background:#fff;
                            color:#b71c1c;
                            font-size:11px;
                            font-weight:700;
                            cursor:pointer;
                        "
                    >
                        Remove Audio
                    </button>

                </div>

            </div>


            <!-- ====================================================
                 MEDIA STATUS
                 ==================================================== -->

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
   MEDIA STATUS LISTENERS
   ============================================================ */

GGIrregularity.Form.bindMediaStatus =
function(){

    const photo =
        document.getElementById(
            "gg-irregularity-photo"
        );


    const video =
        document.getElementById(
            "gg-irregularity-video"
        );


    const audio =
        document.getElementById(
            "gg-irregularity-audio"
        );


    const status =
        document.getElementById(
            "gg-irregularity-media-status"
        );


    if(
        !status
    ){

        return;

    }


    const update =
    function(){

        const names = [];


        if(
            photo?.files?.length
        ){

            names.push(
                "📷 " +
                photo.files[0].name
            );

        }


        if(
            video?.files?.length
        ){

            names.push(
                "🎥 " +
                video.files[0].name
            );

        }


        if(
            audio?.files?.length
        ){

            names.push(
                "🎙 " +
                audio.files[0].name
            );

        }


        /*
         * Native audio recording does not
         * create a FileList, so also check
         * the existing Media module state.
         */

        const nativeAudio =
            GGIrregularity.Media &&
            GGIrregularity.Media
                ._nativeAudioUri;


        if(
            nativeAudio &&
            !audio?.files?.length
        ){

            names.push(
                "🎙 Recorded audio"
            );

        }


        /*
         * Active browser recording.
         */

        if(
            GGIrregularity.Media &&
            GGIrregularity.Media
                ._recording
        ){

            names.push(
                "🔴 Recording audio..."
            );

        }


        status.textContent =
            names.length
                ? names.join("  •  ")
                : "No media selected.";

    };


    if(
        photo &&
        !photo.__ggIrregularityMediaBound
    ){

        photo.__ggIrregularityMediaBound =
            true;

        photo.addEventListener(
            "change",
            update
        );

    }


    if(
        video &&
        !video.__ggIrregularityMediaBound
    ){

        video.__ggIrregularityMediaBound =
            true;

        video.addEventListener(
            "change",
            update
        );

    }


    if(
        audio &&
        !audio.__ggIrregularityMediaBound
    ){

        audio.__ggIrregularityMediaBound =
            true;

        audio.addEventListener(
            "change",
            update
        );

    }


    update();

};


/* ============================================================
   BUILD COMPLETE FORM
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
                 SAVE
                 ================================================= -->

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


<button
    id="ggIrregularityCancel"
    type="button"
    onclick="closeIrregularityForm()"
    style="
        width:100%;
        box-sizing:border-box;
        min-height:38px;
        margin:7px 0 0 0;
        padding:8px 12px;
        border:1px solid #cfd8dc;
        border-radius:8px;
        background:#ffffff;
        color:#455a64;
        font-size:12px;
        font-weight:700;
        cursor:pointer;
        touch-action:manipulation;
        -webkit-tap-highlight-color:transparent;
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
function(container){

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


    /* ========================================================
       INITIALIZE EXISTING MODULE

       This does NOT create another submit handler if the
       module's guard is working.

       ======================================================== */

    if(
        typeof GGIrregularity.init ===
        "function"
    ){

        GGIrregularity.init();

    }


    /* ========================================================
       MEDIA UI STATUS
       ======================================================== */

    if(
        typeof GGIrregularity.Form.bindMediaStatus ===
        "function"
    ){

        GGIrregularity.Form.bindMediaStatus();

    }


    /* ========================================================
       INITIALIZE EXISTING MEDIA MODULE
       
       IMPORTANT:
       The form has just been inserted into the DOM above.
       Media.init() therefore runs AFTER its required
       photo/video/audio elements exist.
       ======================================================== */

    if(
        GGIrregularity.Media &&
        typeof GGIrregularity.Media.init ===
        "function"
    ){

        try{

            GGIrregularity.Media.init();

        }
        catch(
            mediaInitError
        ){

            console.warn(
                "⚠ Irregularity Media init failed:",
                mediaInitError
            );

        }

    }


    return true;

};


/* ============================================================
GLOBAL MOUNT HELPER
============================================================ */

window.mountIrregularityForm =
function(container){

    return GGIrregularity.Form.mount(
        container
    );

};


/* ============================================================
   END
   ============================================================ */
