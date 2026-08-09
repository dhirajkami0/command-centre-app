/* ============================================================
   🌲 GREENGUARD
   IRREGULARITY / OFFENCE / OBSERVATION
   CONSTANTS
   ============================================================ */

(function (window) {

    "use strict";


    // ========================================================
    // GLOBAL NAMESPACE
    // ========================================================

    window.GreenGuard =
        window.GreenGuard ||
        {};


    const GG =
        window.GreenGuard;


    // ========================================================
    // PREVENT DOUBLE LOAD
    // ========================================================

    if (
        GG.IrregularityConstants
    ) {

        console.warn(
            "⚠️ IrregularityConstants already loaded."
        );

        return;

    }


    // ========================================================
    // VERSION
    // ========================================================

    const IrregularityConstants = {

        VERSION:
            "1.0.0",


        MODULE:
            "PATROL_IRREGULARITY",


        // ====================================================
        // FIRESTORE
        // ====================================================

        FIRESTORE_COLLECTION:
            "patrol_irregularities",


        // ====================================================
        // MEDIA ROOT
        // ====================================================

        STORAGE_ROOT:
            "patrol_irregularities",


        // ====================================================
        // STATUS
        // ====================================================

        STATUS: {

            OPEN:
                "OPEN",

            VERIFIED:
                "VERIFIED",

            ACTION_TAKEN:
                "ACTION_TAKEN",

            CLOSED:
                "CLOSED"

        },


        // ====================================================
        // INCIDENT TYPES
        // ====================================================

        TYPES: {

            ILLICIT_FELLING: {

                code:
                    "ILLICIT_FELLING",

                label:
                    "Illicit Felling",

                icon:
                    "🌳",

                category:
                    "FOREST_OFFENCE"

            },


            ILLEGAL_FOREST_PRODUCE: {

                code:
                    "ILLEGAL_FOREST_PRODUCE",

                label:
                    "Illegal Timber / Forest Produce",

                icon:
                    "🪵",

                category:
                    "FOREST_OFFENCE"

            },


            ILLEGAL_MINING: {

                code:
                    "ILLEGAL_MINING",

                label:
                    "Illegal Mining / Earth Cutting",

                icon:
                    "🚜",

                category:
                    "FOREST_OFFENCE"

            },


            ILLEGAL_FISHING: {

                code:
                    "ILLEGAL_FISHING",

                label:
                    "Illegal Fishing",

                icon:
                    "🎣",

                category:
                    "FOREST_OFFENCE"

            },


            ILLEGAL_GRAZING: {

                code:
                    "ILLEGAL_GRAZING",

                label:
                    "Illegal Grazing",

                icon:
                    "🐄",

                category:
                    "FOREST_OFFENCE"

            },


            FOREST_FIRE: {

                code:
                    "FOREST_FIRE",

                label:
                    "Forest Fire",

                icon:
                    "🔥",

                category:
                    "ENVIRONMENT"

            },


            ENCROACHMENT: {

                code:
                    "ENCROACHMENT",

                label:
                    "Encroachment",

                icon:
                    "🚧",

                category:
                    "FOREST_OFFENCE"

            },


            ILLEGAL_STRUCTURE: {

                code:
                    "ILLEGAL_STRUCTURE",

                label:
                    "Illegal Structure / Occupation",

                icon:
                    "🏗️",

                category:
                    "FOREST_OFFENCE"

            },


            ILLEGAL_ENTRY: {

                code:
                    "ILLEGAL_ENTRY",

                label:
                    "Illegal Entry / Trespassing",

                icon:
                    "🚷",

                category:
                    "FOREST_OFFENCE"

            },


            POACHING: {

                code:
                    "POACHING",

                label:
                    "Poaching",

                icon:
                    "🏹",

                category:
                    "WILDLIFE_OFFENCE"

            },


            WILDLIFE_INJURY: {

                code:
                    "WILDLIFE_INJURY",

                label:
                    "Wildlife Injury",

                icon:
                    "🐾",

                category:
                    "WILDLIFE"

            },


            WILDLIFE_DEATH: {

                code:
                    "WILDLIFE_DEATH",

                label:
                    "Wildlife Death",

                icon:
                    "☠️",

                category:
                    "WILDLIFE"

            },


            GENERAL_OBSERVATION: {

                code:
                    "GENERAL_OBSERVATION",

                label:
                    "General Observation",

                icon:
                    "👁️",

                category:
                    "OBSERVATION"

            }

        },


        // ====================================================
        // TYPE ORDER
        // ====================================================

        TYPE_ORDER: [

            "ILLICIT_FELLING",

            "ILLEGAL_FOREST_PRODUCE",

            "ILLEGAL_MINING",

            "ILLEGAL_FISHING",

            "ILLEGAL_GRAZING",

            "FOREST_FIRE",

            "ENCROACHMENT",

            "ILLEGAL_STRUCTURE",

            "ILLEGAL_ENTRY",

            "POACHING",

            "WILDLIFE_INJURY",

            "WILDLIFE_DEATH",

            "GENERAL_OBSERVATION"

        ],


        // ====================================================
        // CATEGORY LABELS
        // ====================================================

        CATEGORIES: {

            FOREST_OFFENCE:
                "Forest Offence",

            WILDLIFE_OFFENCE:
                "Wildlife Protection",

            WILDLIFE:
                "Wildlife",

            ENVIRONMENT:
                "Environment",

            OBSERVATION:
                "Observation"

        },


        // ====================================================
        // COMMON MEDIA TYPES
        // ====================================================

        MEDIA_TYPES: [

            "photo",

            "video",

            "audio"

        ],


        // ====================================================
        // UNITS
        // ====================================================

        AREA_UNITS: [

            "HECTARE",

            "ACRE",

            "SQ_METER"

        ],


        QUANTITY_UNITS: [

            "NUMBER",

            "KG",

            "CFT",

            "BUNDLE",

            "OTHER"

        ],


        // ====================================================
        // COMMON ENTRY TYPES
        // ====================================================

        ENTRY_TYPES: [

            "PERSON",

            "GROUP",

            "VEHICLE",

            "LIVESTOCK"

        ],


        // ====================================================
        // COMMON BOOLEAN OPTIONS
        // ====================================================

        YES_NO: [

            "Yes",

            "No"

        ],


        // ====================================================
        // FIRE STATUS
        // ====================================================

        FIRE_STATUS: [

            "ACTIVE",

            "SMOULDERING",

            "UNDER_CONTROL",

            "EXTINGUISHED"

        ],


        // ====================================================
        // FIRE TYPES
        // ====================================================

        FIRE_TYPES: [

            "GROUND",

            "SURFACE",

            "CROWN",

            "OTHER"

        ],


        // ====================================================
        // WILDLIFE AGE
        // ====================================================

        AGE_CLASSES: [

            "Adult",

            "Sub-adult",

            "Juvenile",

            "Unknown"

        ],


        // ====================================================
        // SEX
        // ====================================================

        SEX: [

            "Male",

            "Female",

            "Unknown"

        ],


        // ====================================================
        // CONDITION
        // ====================================================

        CONDITIONS: [

            "Critical",

            "Serious",

            "Moderate",

            "Stable",

            "Unknown"

        ]


    };


    // ========================================================
    // FREEZE IMPORTANT CONFIG
    // ========================================================

    try {

        Object.freeze(
            IrregularityConstants.TYPES
        );

        Object.freeze(
            IrregularityConstants.STATUS
        );

    }
    catch (error) {

        console.warn(
            "⚠️ Could not freeze irregularity constants:",
            error
        );

    }


    // ========================================================
    // EXPORT
    // ========================================================

    GG.IrregularityConstants =
        IrregularityConstants;


    window.IrregularityConstants =
        IrregularityConstants;


    console.log(
        "✅ GreenGuard IrregularityConstants loaded:",
        {
            version:
                IrregularityConstants.VERSION,

            types:
                IrregularityConstants.TYPE_ORDER.length,

            collection:
                IrregularityConstants.FIRESTORE_COLLECTION

        }
    );


})(window);
