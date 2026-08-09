/* ============================================================
   🌲 GREENGUARD
   IRREGULARITY STATE
   ============================================================ */

(function (window) {

    "use strict";


    window.GreenGuard =
        window.GreenGuard ||
        {};


    const GG =
        window.GreenGuard;


    if (
        GG.IrregularityState
    ) {

        console.warn(
            "⚠️ IrregularityState already loaded."
        );

        return;

    }


    // ========================================================
    // DEFAULT STATE
    // ========================================================

    const state = {

        // ----------------------------------------------------
        // FORM
        // ----------------------------------------------------

        formOpen:
            false,

        formMode:
            "CREATE",


        // ----------------------------------------------------
        // INCIDENT
        // ----------------------------------------------------

        incidentType:
            "",

        incidentId:
            "",


        // ----------------------------------------------------
        // GPS
        // ----------------------------------------------------

        latitude:
            null,

        longitude:
            null,

        accuracy:
            null,


        // ----------------------------------------------------
        // GIS
        // ----------------------------------------------------

        circle:
            "",

        division:
            "",

        range:
            "",

        beat:
            "",

        compartment:
            "",


        divisionCode:
            "",

        rangeCode:
            "",

        beatCode:
            "",

        compartmentCode:
            "",


        resolvedLocation:
            "",


        // ----------------------------------------------------
        // STAFF
        // ----------------------------------------------------

        sightedBy:
            "",

        phone:
            "",


        // ----------------------------------------------------
        // DUTY
        // ----------------------------------------------------

        dutyActive:
            false,

        sessionId:
            "",


        // ----------------------------------------------------
        // MEDIA
        // ----------------------------------------------------

        photo:
            null,

        video:
            null,

        audio:
            null,


        // ----------------------------------------------------
        // DETAILS
        // ----------------------------------------------------

        details:
            {},


        // ----------------------------------------------------
        // REMARKS
        // ----------------------------------------------------

        remarks:
            "",


        // ----------------------------------------------------
        // STATUS
        // ----------------------------------------------------

        status:
            "OPEN",


        // ----------------------------------------------------
        // SUBMISSION
        // ----------------------------------------------------

        submitting:
            false,

        lastError:
            null

    };


    // ========================================================
    // MEDIA RESET
    // ========================================================

    function resetMedia() {

        state.photo =
            null;

        state.video =
            null;

        state.audio =
            null;

    }


    // ========================================================
    // RESET
    // ========================================================

    function reset() {

        state.formOpen =
            false;

        state.formMode =
            "CREATE";

        state.incidentType =
            "";

        state.incidentId =
            "";

        state.latitude =
            null;

        state.longitude =
            null;

        state.accuracy =
            null;

        state.circle =
            "";

        state.division =
            "";

        state.range =
            "";

        state.beat =
            "";

        state.compartment =
            "";

        state.divisionCode =
            "";

        state.rangeCode =
            "";

        state.beatCode =
            "";

        state.compartmentCode =
            "";

        state.resolvedLocation =
            "";

        state.sightedBy =
            "";

        state.phone =
            "";

        state.dutyActive =
            false;

        state.sessionId =
            "";

        resetMedia();

        state.details =
            {};

        state.remarks =
            "";

        state.status =
            "OPEN";

        state.submitting =
            false;

        state.lastError =
            null;

    }


    // ========================================================
    // OPEN FORM
    // ========================================================

    function open(
        type
    ) {

        reset();

        state.formOpen =
            true;

        state.incidentType =
            String(
                type ||
                ""
            )
            .trim()
            .toUpperCase();

    }


    // ========================================================
    // CLOSE FORM
    // ========================================================

    function close() {

        state.formOpen =
            false;

        state.submitting =
            false;

    }


    // ========================================================
    // SET DETAILS
    // ========================================================

    function setDetail(
        key,
        value
    ) {

        state.details[
            key
        ] =
            value;

    }


    // ========================================================
    // PUBLIC API
    // ========================================================

    GG.IrregularityState = {

        state:

            state,


        reset:

            reset,


        open:

            open,


        close:

            close,


        resetMedia:

            resetMedia,


        setDetail:

            setDetail

    };


    window.IrregularityState =
        GG.IrregularityState;


    console.log(
        "✅ GreenGuard IrregularityState loaded."
    );


})(window);
