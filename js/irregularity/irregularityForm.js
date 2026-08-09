/* ============================================================
   🌲 GREENGUARD
   PATROL IRREGULARITY FORM
   ============================================================ */

(function (window) {

    "use strict";


    window.GreenGuard =
        window.GreenGuard ||
        {};


    const GG =
        window.GreenGuard;


    if (
        GG.IrregularityForm
    ) {

        console.warn(
            "⚠️ IrregularityForm already loaded."
        );

        return;

    }


    const C =
        GG.IrregularityConstants;


    // ========================================================
    // HTML ESCAPE
    // ========================================================

    function escapeHTML(
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

    }


    // ========================================================
    // INPUT
    // ========================================================

    function input(
        id,
        label,
        type,
        required
    ) {

        return `

            <div class="gg-ir-field">

                <label
                    for="${id}"
                    class="gg-ir-label"
                >
                    ${escapeHTML(label)}
                    ${
                        required
                            ? " *"
                            : ""
                    }
                </label>

                <input
                    id="${id}"
                    name="${id}"
                    type="${type || "text"}"
                    class="gg-ir-input"
                    ${
                        required
                            ? "required"
                            : ""
                    }
                >

            </div>

        `;

    }


    // ========================================================
    // SELECT
    // ========================================================

    function select(
        id,
        label,
        options,
        required
    ) {

        let optionHTML =
            `<option value="">Select</option>`;


        (
            options ||
            []
        )
        .forEach(
            function(option){

                optionHTML += `

                    <option
                        value="${escapeHTML(option)}"
                    >
                        ${escapeHTML(option)}
                    </option>

                `;

            }
        );


        return `

            <div class="gg-ir-field">

                <label
                    for="${id}"
                    class="gg-ir-label"
                >
                    ${escapeHTML(label)}
                    ${
                        required
                            ? " *"
                            : ""
                    }
                </label>

                <select
                    id="${id}"
                    name="${id}"
                    class="gg-ir-input"
                    ${
                        required
                            ? "required"
                            : ""
                    }
                >

                    ${optionHTML}

                </select>

            </div>

        `;

    }


    // ========================================================
    // TEXTAREA
    // ========================================================

    function textarea(
        id,
        label,
        required
    ) {

        return `

            <div class="gg-ir-field">

                <label
                    for="${id}"
                    class="gg-ir-label"
                >
                    ${escapeHTML(label)}
                    ${
                        required
                            ? " *"
                            : ""
                    }
                </label>

                <textarea
                    id="${id}"
                    name="${id}"
                    class="gg-ir-input gg-ir-textarea"
                    ${
                        required
                            ? "required"
                            : ""
                    }
                ></textarea>

            </div>

        `;

    }


    // ========================================================
    // FILE
    // ========================================================

    function fileInput(
        id,
        label,
        accept,
        required
    ) {

        return `

            <div class="gg-ir-field">

                <label
                    for="${id}"
                    class="gg-ir-label"
                >
                    ${escapeHTML(label)}
                    ${
                        required
                            ? " *"
                            : ""
                    }
                </label>

                <input
                    id="${id}"
                    name="${id}"
                    type="file"
                    accept="${accept}"
                    class="gg-ir-input"
                    ${
                        required
                            ? "required"
                            : ""
                    }
                >

            </div>

        `;

    }


    // ========================================================
    // LOCATION DISPLAY
    // ========================================================

    function locationBlock() {

        return `

            <div
                class="gg-ir-location"
            >

                <div
                    class="gg-ir-section-title"
                >
                    📍 LOCATION OF INCIDENT
                </div>

                <div
                    id="gg-ir-location-status"
                    class="gg-ir-location-status"
                >
                    Waiting for GPS...
                </div>

                <div
                    class="gg-ir-gis-grid"
                >

                    <div>
                        <span>Division</span>
                        <strong id="gg-ir-division">—</strong>
                    </div>

                    <div>
                        <span>Range</span>
                        <strong id="gg-ir-range">—</strong>
                    </div>

                    <div>
                        <span>Beat</span>
                        <strong id="gg-ir-beat">—</strong>
                    </div>

                    <div>
                        <span>Compartment</span>
                        <strong id="gg-ir-compartment">—</strong>
                    </div>

                </div>

                <div
                    id="gg-ir-coordinates"
                    class="gg-ir-coordinates"
                >
                    GPS: —
                </div>

            </div>

        `;

    }


    // ========================================================
    // MEDIA
    // ========================================================

    function mediaBlock() {

        return `

            <div class="gg-ir-media">

                <div
                    class="gg-ir-section-title"
                >
                    🎬 MEDIA
                </div>

                ${fileInput(
                    "gg-ir-photo",
                    "Photo",
                    "image/*",
                    false
                )}

                ${fileInput(
                    "gg-ir-video",
                    "Video",
                    "video/*",
                    false
                )}

                ${fileInput(
                    "gg-ir-audio",
                    "Audio",
                    "audio/*",
                    false
                )}

            </div>

        `;

    }


    // ========================================================
    // COMMON FIELDS
    // ========================================================

    function commonFields() {

        const profile =
            window.userProfile ||
            {};


        return `

            <div class="gg-ir-common">

                ${input(
                    "gg-ir-sighted-by",
                    "Sighted By",
                    "text",
                    true
                )}

                ${input(
                    "gg-ir-phone",
                    "Phone",
                    "tel",
                    false
                )}

            </div>

        `;

    }


    // ========================================================
    // ILLICIT FELLING
    // ========================================================

    function illicitFelling() {

        return `

            ${input(
                "gg-ir-felling-count",
                "No. of Trees Felled",
                "number",
                true
            )}

            ${textarea(
                "gg-ir-felling-species",
                "Species Felled",
                true
            )}

            ${select(
                "gg-ir-felling-age",
                "Felling Condition",
                [
                    "Fresh",
                    "Old",
                    "Unknown"
                ],
                false
            )}

            ${select(
                "gg-ir-felling-stump",
                "Stump Present",
                C.YES_NO,
                false
            )}

        `;

    }


    // ========================================================
    // FOREST PRODUCE
    // ========================================================

    function forestProduce() {

        return `

            ${select(
                "gg-ir-produce-type",
                "Material",
                [
                    "Timber",
                    "Firewood",
                    "Bamboo",
                    "NTFP",
                    "Other"
                ],
                true
            )}

            ${input(
                "gg-ir-produce-species",
                "Species",
                "text",
                false
            )}

            ${input(
                "gg-ir-produce-quantity",
                "Quantity",
                "number",
                false
            )}

            ${select(
                "gg-ir-produce-unit",
                "Unit",
                C.QUANTITY_UNITS,
                false
            )}

            ${select(
                "gg-ir-produce-vehicle",
                "Vehicle Involved",
                C.YES_NO,
                false
            )}

            ${input(
                "gg-ir-produce-vehicle-no",
                "Vehicle Number",
                "text",
                false
            )}

        `;

    }


    // ========================================================
    // MINING
    // ========================================================

    function mining() {

        return `

            ${select(
                "gg-ir-mining-activity",
                "Activity",
                [
                    "Mining",
                    "Earth Cutting",
                    "Sand Extraction",
                    "Stone Extraction",
                    "Other"
                ],
                true
            )}

            ${input(
                "gg-ir-mining-area",
                "Area Affected",
                "number",
                true
            )}

            ${select(
                "gg-ir-mining-unit",
                "Area Unit",
                C.AREA_UNITS,
                true
            )}

            ${input(
                "gg-ir-mining-depth",
                "Approx. Depth",
                "number",
                false
            )}

            ${select(
                "gg-ir-mining-machinery",
                "Machinery Present",
                C.YES_NO,
                false
            )}

            ${input(
                "gg-ir-mining-machinery-details",
                "Machinery Details",
                "text",
                false
            )}

            ${input(
                "gg-ir-mining-vehicle",
                "Vehicle Number",
                "text",
                false
            )}

        `;

    }


    // ========================================================
    // FISHING
    // ========================================================

    function fishing() {

        return `

            ${select(
                "gg-ir-fishing-waterbody",
                "Waterbody",
                [
                    "River",
                    "Stream",
                    "Pond",
                    "Wetland",
                    "Other"
                ],
                true
            )}

            ${select(
                "gg-ir-fishing-method",
                "Fishing Method",
                [
                    "Net",
                    "Electrofishing",
                    "Poison",
                    "Other"
                ],
                true
            )}

            ${input(
                "gg-ir-fishing-persons",
                "Approx. Persons",
                "number",
                false
            )}

            ${input(
                "gg-ir-fishing-equipment",
                "Equipment Found",
                "text",
                false
            )}

            ${input(
                "gg-ir-fishing-species",
                "Fish / Species",
                "text",
                false
            )}

            ${input(
                "gg-ir-fishing-quantity",
                "Approx. Quantity",
                "number",
                false
            )}

        `;

    }


    // ========================================================
    // GRAZING
    // ========================================================

    function grazing() {

        return `

            ${select(
                "gg-ir-grazing-animal",
                "Livestock Type",
                [
                    "Cattle",
                    "Buffalo",
                    "Goat",
                    "Sheep",
                    "Other"
                ],
                true
            )}

            ${input(
                "gg-ir-grazing-number",
                "Approx. Number",
                "number",
                true
            )}

            ${input(
                "gg-ir-grazing-area",
                "Grazing Area",
                "number",
                false
            )}

            ${select(
                "gg-ir-grazing-owner",
                "Owner Identified",
                C.YES_NO,
                false
            )}

            ${input(
                "gg-ir-grazing-owner-details",
                "Owner Details",
                "text",
                false
            )}

        `;

    }


    // ========================================================
    // FIRE
    // ========================================================

    function fire() {

        return `

            ${select(
                "gg-ir-fire-status",
                "Fire Status",
                C.FIRE_STATUS,
                true
            )}

            ${input(
                "gg-ir-fire-area",
                "Area Affected",
                "number",
                true
            )}

            ${select(
                "gg-ir-fire-unit",
                "Area Unit",
                C.AREA_UNITS,
                true
            )}

            ${select(
                "gg-ir-fire-type",
                "Fire Type",
                C.FIRE_TYPES,
                false
            )}

            ${select(
                "gg-ir-fire-cause",
                "Cause",
                [
                    "Known",
                    "Suspected",
                    "Unknown"
                ],
                false
            )}

            ${textarea(
                "gg-ir-fire-cause-details",
                "Cause Details",
                false
            )}

        `;

    }


    // ========================================================
    // ENCROACHMENT
    // ========================================================

    function encroachment() {

        return `

            ${select(
                "gg-ir-enc-type",
                "Encroachment Type",
                [
                    "Agriculture",
                    "Structure",
                    "Settlement",
                    "Fencing",
                    "Road",
                    "Other"
                ],
                true
            )}

            ${input(
                "gg-ir-enc-area",
                "Area Encroached",
                "number",
                true
            )}

            ${select(
                "gg-ir-enc-unit",
                "Area Unit",
                C.AREA_UNITS,
                true
            )}

            ${select(
                "gg-ir-enc-nature",
                "Nature",
                [
                    "New",
                    "Existing",
                    "Expansion"
                ],
                false
            )}

            ${select(
                "gg-ir-enc-structure",
                "Structure Present",
                C.YES_NO,
                false
            )}

        `;

    }


    // ========================================================
    // ILLEGAL STRUCTURE
    // ========================================================

    function illegalStructure() {

        return `

            ${select(
                "gg-ir-structure-type",
                "Structure Type",
                [
                    "Hut",
                    "House",
                    "Shed",
                    "Fence",
                    "Road",
                    "Other"
                ],
                true
            )}

            ${input(
                "gg-ir-structure-area",
                "Approx. Area",
                "number",
                false
            )}

            ${select(
                "gg-ir-structure-status",
                "Construction Status",
                [
                    "New",
                    "Under Construction",
                    "Existing"
                ],
                false
            )}

            ${select(
                "gg-ir-structure-occupied",
                "Occupied",
                C.YES_NO,
                false
            )}

        `;

    }


    // ========================================================
    // ILLEGAL ENTRY
    // ========================================================

    function illegalEntry() {

        return `

            ${select(
                "gg-ir-entry-type",
                "Entry Type",
                C.ENTRY_TYPES,
                true
            )}

            ${input(
                "gg-ir-entry-number",
                "Approx. Number",
                "number",
                false
            )}

            ${input(
                "gg-ir-entry-purpose",
                "Purpose / Activity",
                "text",
                false
            )}

            ${input(
                "gg-ir-entry-vehicle",
                "Vehicle Number",
                "text",
                false
            )}

            ${select(
                "gg-ir-entry-direction",
                "Direction of Movement",
                [
                    "North",
                    "South",
                    "East",
                    "West",
                    "Unknown"
                ],
                false
            )}

            ${select(
                "gg-ir-entry-identified",
                "Identified",
                C.YES_NO,
                false
            )}

            ${textarea(
                "gg-ir-entry-details",
                "Person / Group Details",
                false
            )}

        `;

    }


    // ========================================================
    // POACHING
    // ========================================================

    function poaching() {

        return `

            ${select(
                "gg-ir-poaching-evidence",
                "Evidence Type",
                [
                    "Carcass",
                    "Trap",
                    "Weapon",
                    "Animal Part",
                    "Camp",
                    "Other"
                ],
                true
            )}

            ${input(
                "gg-ir-poaching-species",
                "Species",
                "text",
                false
            )}

            ${select(
                "gg-ir-poaching-trap",
                "Trap Found",
                C.YES_NO,
                false
            )}

            ${input(
                "gg-ir-poaching-trap-type",
                "Trap Type",
                "text",
                false
            )}

            ${textarea(
                "gg-ir-poaching-evidence-details",
                "Evidence Details",
                false
            )}

        `;

    }


    // ========================================================
    // WILDLIFE INJURY
    // ========================================================

    function wildlifeInjury() {

        return `

            ${input(
                "gg-ir-injury-species",
                "Species",
                "text",
                true
            )}

            ${select(
                "gg-ir-injury-age",
                "Age",
                C.AGE_CLASSES,
                false
            )}

            ${select(
                "gg-ir-injury-sex",
                "Sex",
                C.SEX,
                false
            )}

            ${select(
                "gg-ir-injury-type",
                "Injury Type",
                [
                    "Wound",
                    "Fracture",
                    "Trap Injury",
                    "Burn",
                    "Other"
                ],
                true
            )}

            ${input(
                "gg-ir-injury-location",
                "Injury Location",
                "text",
                false
            )}

            ${textarea(
                "gg-ir-injury-details",
                "Injury Details",
                true
            )}

            ${select(
                "gg-ir-injury-condition",
                "Condition",
                C.CONDITIONS,
                false
            )}

            ${select(
                "gg-ir-injury-mobility",
                "Mobility",
                [
                    "Mobile",
                    "Immobile",
                    "Unknown"
                ],
                false
            )}

            ${select(
                "gg-ir-injury-rescue",
                "Rescue Required",
                C.YES_NO,
                false
            )}

        `;

    }


    // ========================================================
    // WILDLIFE DEATH
    // ========================================================

    function wildlifeDeath() {

        return `

            ${input(
                "gg-ir-death-species",
                "Species",
                "text",
                true
            )}

            ${select(
                "gg-ir-death-sex",
                "Sex",
                C.SEX,
                false
            )}

            ${select(
                "gg-ir-death-age",
                "Age",
                C.AGE_CLASSES,
                false
            )}

            ${select(
                "gg-ir-death-condition",
                "Carcass Condition",
                [
                    "Fresh",
                    "Decomposed",
                    "Highly Decomposed"
                ],
                false
            )}

            ${select(
                "gg-ir-death-cause",
                "Cause",
                [
                    "Known",
                    "Suspected",
                    "Unknown"
                ],
                false
            )}

            ${textarea(
                "gg-ir-death-cause-details",
                "Cause Details",
                false
            )}

            ${input(
                "gg-ir-death-body-length",
                "Body Length",
                "number",
                false
            )}

            ${input(
                "gg-ir-death-chest-girth",
                "Chest Girth",
                "number",
                false
            )}

            ${input(
                "gg-ir-death-height",
                "Height",
                "number",
                false
            )}

            ${input(
                "gg-ir-death-weight",
                "Weight",
                "number",
                false
            )}

            ${select(
                "gg-ir-death-postmortem",
                "Post-mortem Required",
                C.YES_NO,
                false
            )}

        `;

    }


    // ========================================================
    // GENERAL OBSERVATION
    // ========================================================

    function generalObservation() {

        return `

            ${select(
                "gg-ir-observation-type",
                "Observation Type",
                [
                    "Suspicious Activity",
                    "Forest Condition",
                    "Wildlife Sign",
                    "Boundary Issue",
                    "Other"
                ],
                true
            )}

            ${textarea(
                "gg-ir-observation-description",
                "Description",
                true
            )}

        `;

    }


    // ========================================================
    // TYPE BODY
    // ========================================================

    function getTypeBody(
        type
    ) {

        switch (
            String(
                type ||
                ""
            )
            .trim()
            .toUpperCase()
        ) {

            case "ILLICIT_FELLING":
                return illicitFelling();


            case "ILLEGAL_FOREST_PRODUCE":
                return forestProduce();


            case "ILLEGAL_MINING":
                return mining();


            case "ILLEGAL_FISHING":
                return fishing();


            case "ILLEGAL_GRAZING":
                return grazing();


            case "FOREST_FIRE":
                return fire();


            case "ENCROACHMENT":
                return encroachment();


            case "ILLEGAL_STRUCTURE":
                return illegalStructure();


            case "ILLEGAL_ENTRY":
                return illegalEntry();


            case "POACHING":
                return poaching();


            case "WILDLIFE_INJURY":
                return wildlifeInjury();


            case "WILDLIFE_DEATH":
                return wildlifeDeath();


            case "GENERAL_OBSERVATION":
                return generalObservation();


            default:
                return "";

        }

    }


    // ========================================================
    // MAIN FORM HTML
    // ========================================================

    function render(
        type
    ) {

        const incident =
            C.TYPES[
                type
            ];


        if (
            !incident
        ) {

            return "";

        }


        const profile =
            window.userProfile ||
            {};


        return `

            <form
                id="gg-irregularity-form"
                class="gg-irregularity-form"
                novalidate
            >

                <div
                    class="gg-ir-header"
                >

                    <div
                        class="gg-ir-header-icon"
                    >
                        ${incident.icon}
                    </div>

                    <div>

                        <div
                            class="gg-ir-header-title"
                        >
                            ${escapeHTML(
                                incident.label
                            )}
                        </div>

                        <div
                            class="gg-ir-header-subtitle"
                        >
                            Patrol Irregularity /
                            Offence / Observation
                        </div>

                    </div>

                </div>


                <div
                    class="gg-ir-section"
                >

                    <div
                        class="gg-ir-section-title"
                    >
                        INCIDENT
                    </div>

                    ${commonFields()}

                </div>


                <div
                    class="gg-ir-section"
                >

                    <div
                        class="gg-ir-section-title"
                    >
                        ${incident.icon}
                        INCIDENT DETAILS
                    </div>

                    <div
                        id="gg-ir-type-fields"
                    >

                        ${getTypeBody(
                            type
                        )}

                    </div>

                </div>


                ${locationBlock()}


                ${mediaBlock()}


                <div
                    class="gg-ir-section"
                >

                    <div
                        class="gg-ir-section-title"
                    >
                        📝 REMARKS
                    </div>

                    ${textarea(
                        "gg-ir-remarks",
                        "Remarks",
                        false
                    )}

                </div>


                <div
                    class="gg-ir-actions"
                >

                    <button
                        type="button"
                        id="gg-ir-cancel"
                        class="gg-ir-btn gg-ir-btn-secondary"
                    >
                        CANCEL
                    </button>


                    <button
                        type="submit"
                        id="gg-ir-submit"
                        class="gg-ir-btn gg-ir-btn-primary"
                    >
                        SUBMIT INCIDENT
                    </button>

                </div>

            </form>

        `;

    }


    // ========================================================
    // PUBLIC API
    // ========================================================

    GG.IrregularityForm = {

        render:
            render,

        getTypeBody:
            getTypeBody,

        escapeHTML:
            escapeHTML

    };


    window.IrregularityForm =
        GG.IrregularityForm;


    console.log(
        "✅ GreenGuard IrregularityForm loaded."
    );


})(window);
