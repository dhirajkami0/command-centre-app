/* ============================================================
   🌲 GREENGUARD
   IRREGULARITY UI / MODAL INTEGRATION
   ============================================================

   FILE:
       js/irregularity/irregularityUI.js

   RESPONSIBILITY
   ------------------------------------------------------------
   • Create / reuse Irregularity modal
   • Build manual-input form
   • Open / close modal
   • Set date/time defaults
   • Preserve existing sighting selector flow
   • Connect UI to GGIrregularity module

   NOT RESPONSIBLE FOR
   ------------------------------------------------------------
   • GPS acquisition
   • GIS resolution
   • Firebase initialization
   • Firestore writing
   • Apps Script
   • Media upload
   • Wildlife
   • Elephant

   GPS / GIS / PROFILE / FIRESTORE
   ------------------------------------------------------------
   Handled only by:

       irregularityModule.js

   GPS:
       window.latestGps
       navigator.geolocation fallback

   GIS:
       window.resolveCurrentGIS()

   MEDIA:
       irregularityMedia.js

   ============================================================ */


/* ============================================================
   GLOBAL NAMESPACE
   ============================================================ */

window.GGIrregularity =
    window.GGIrregularity || {};


/* ============================================================
   UI NAMESPACE
   ============================================================ */

GGIrregularity.UI =
    GGIrregularity.UI || {};


/* ============================================================
   CONSTANTS
   ============================================================ */

GGIrregularity.UI.MODAL_ID =
    "irregularity-form-modal";


GGIrregularity.UI.CONTAINER_ID =
    "irregularity-form-container";


GGIrregularity.UI.FORM_HOST_ID =
    "gg-irregularity-form-host";


/* ============================================================
   OPEN / CLOSE FLOW GUARDS

   Prevent:
   • double tap
   • repeated click
   • overlapping modal construction
   • overlapping close/open transitions

   ============================================================ */

GGIrregularity.UI.__opening =
    false;

GGIrregularity.UI.__closing =
    false;


/* ============================================================
   ENSURE MODAL
   ============================================================ */

GGIrregularity.UI.ensureModal =
function(){

    /* ========================================================
       REUSE EXISTING MODAL
       ======================================================== */

    let modal =
        document.getElementById(
            GGIrregularity.UI.MODAL_ID
        );


    if(
        modal
    ){

        return modal;

    }


    /* ========================================================
       CREATE MODAL
       ======================================================== */

    modal =
        document.createElement(
            "div"
        );


    modal.id =
        GGIrregularity.UI.MODAL_ID;


    modal.setAttribute(
        "role",
        "dialog"
    );


    modal.setAttribute(
        "aria-modal",
        "true"
    );


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    modal.setAttribute(
        "aria-labelledby",
        "gg-irregularity-title"
    );


    modal.style.cssText =

        "display:none;" +
        "position:fixed;" +
        "inset:0;" +
        "width:100%;" +
        "height:100%;" +
        "background:rgba(0,0,0,0.82);" +
        "backdrop-filter:blur(4px);" +
        "-webkit-backdrop-filter:blur(4px);" +
        "z-index:5001;" +
        "overflow-y:auto;" +
        "overflow-x:hidden;" +
        "padding:10px;" +
        "box-sizing:border-box;" +
        "-webkit-overflow-scrolling:touch;" +
        "overscroll-behavior:contain;";


    /* ========================================================
       INNER CONTAINER
       ======================================================== */

    const container =
        document.createElement(
            "div"
        );


    container.id =
        GGIrregularity.UI.CONTAINER_ID;


    container.style.cssText =

        "background:#f4f4f4;" +
        "border-radius:15px;" +
        "padding:18px;" +
        "max-width:480px;" +
        "width:100%;" +
        "margin:20px auto;" +
        "font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;" +
        "border-top:7px solid #1b5e20;" +
        "box-shadow:0 10px 25px rgba(0,0,0,0.3);" +
        "box-sizing:border-box;" +
        "position:relative;" +
        "overflow:visible;";


    /* ========================================================
       HEADER
       ======================================================== */

    const header =
        document.createElement(
            "div"
        );


    header.style.cssText =

        "display:flex;" +
        "align-items:center;" +
        "justify-content:space-between;" +
        "gap:8px;" +
        "width:100%;" +
        "box-sizing:border-box;" +
        "margin:0 0 8px 0;" +
        "padding:0;";


    /* ========================================================
       TITLE
       ======================================================== */

    const title =
        document.createElement(
            "h3"
        );


    title.id =
        "gg-irregularity-title";


    title.textContent =
        "⚠️ Irregularity / Offence / Observation";


    title.style.cssText =

        "margin:0;" +
        "padding:0;" +
        "color:#1b5e20;" +
        "font-size:18px;" +
        "font-weight:800;" +
        "line-height:1.25;" +
        "flex:1 1 auto;" +
        "min-width:0;";


    /* ========================================================
       CLOSE BUTTON
       ======================================================== */

    const closeButton =
        document.createElement(
            "button"
        );


    closeButton.type =
        "button";


    closeButton.innerHTML =
        "&times;";


    closeButton.title =
        "Close";


    closeButton.setAttribute(
        "aria-label",
        "Close Irregularity form"
    );


    closeButton.style.cssText =

        "flex:0 0 36px;" +
        "width:36px;" +
        "height:36px;" +
        "border:none;" +
        "border-radius:50%;" +
        "background:transparent;" +
        "font-size:27px;" +
        "font-weight:400;" +
        "cursor:pointer;" +
        "padding:0;" +
        "color:#555;" +
        "line-height:36px;" +
        "text-align:center;" +
        "touch-action:manipulation;" +
        "-webkit-tap-highlight-color:transparent;";


    closeButton.onclick =
        function(
            event
        ){

            event.preventDefault();

            event.stopPropagation();

            GGIrregularity.UI.close();

        };


    /* ========================================================
       HEADER ASSEMBLY
       ======================================================== */

    header.appendChild(
        title
    );


    header.appendChild(
        closeButton
    );


    /* ========================================================
       SEPARATOR
       ======================================================== */

    const hr =
        document.createElement(
            "hr"
        );


    hr.style.cssText =

        "margin:10px 0 14px 0;" +
        "border:0;" +
        "border-top:1px solid #ddd;" +
        "height:1px;";


    /* ========================================================
       FORM HOST
       ======================================================== */

    const formHost =
        document.createElement(
            "div"
        );


    formHost.id =
        GGIrregularity.UI.FORM_HOST_ID;


    formHost.style.cssText =

        "width:100%;" +
        "box-sizing:border-box;" +
        "margin:0;" +
        "padding:0;" +
        "overflow:visible;";


    /* ========================================================
       ASSEMBLE
       ======================================================== */

    container.appendChild(
        header
    );


    container.appendChild(
        hr
    );


    container.appendChild(
        formHost
    );


    modal.appendChild(
        container
    );


    document.body.appendChild(
        modal
    );


    /* ========================================================
       BACKDROP CLICK
       ======================================================== */

    modal.addEventListener(
        "click",
        function(
            event
        ){

            if(
                event.target ===
                modal
            ){

                GGIrregularity.UI.close();

            }

        }
    );


    /* ========================================================
       ESC KEY
       ======================================================== */

    if(
        !modal.__ggIrregularityEscapeBound
    ){

        modal.__ggIrregularityEscapeBound =
            true;


        document.addEventListener(
            "keydown",
            function(
                event
            ){

                if(
                    event.key !==
                    "Escape"
                ){

                    return;

                }


                if(
                    modal.style.display !==
                    "none"
                ){

                    GGIrregularity.UI.close();

                }

            }
        );

    }


    /* ========================================================
       RETURN
       ======================================================== */

    return modal;

};


/* ============================================================
   BUILD FORM
   ============================================================ */

GGIrregularity.UI.buildForm =
function(){

    const formHost =
        document.getElementById(
            GGIrregularity.UI.FORM_HOST_ID
        );


    if(
        !formHost
    ){

        console.error(
            "❌ Irregularity form host not found."
        );

        return false;

    }


    /* ========================================================
       FORM BUILDER MUST EXIST
       ======================================================== */

    if(
        !GGIrregularity.Form ||
        typeof GGIrregularity.Form.build !==
        "function"
    ){

        console.error(
            "❌ GGIrregularity.Form.build() not available."
        );

        return false;

    }


    /* ========================================================
       BUILD MANUAL FORM ONLY
       ======================================================== */

    const html =
        GGIrregularity.Form.build();


    if(
        typeof html !==
        "string"
    ){

        console.error(
            "❌ GGIrregularity.Form.build() did not return HTML."
        );

        return false;

    }


    /*
     * Build while the modal is hidden.
     * This prevents the user seeing a partially-created form.
     */

    formHost.innerHTML =
        html;


    return true;

};


/* ============================================================
   LOCAL DATE

   Do NOT use toISOString() here because that can shift the
   displayed date around midnight depending on timezone.

   ============================================================ */

GGIrregularity.UI.getLocalDate =
function(){

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        )
        .padStart(
            2,
            "0"
        );


    return (

        year +
        "-" +
        month +
        "-" +
        day

    );

};


/* ============================================================
   LOCAL TIME
   ============================================================ */

GGIrregularity.UI.getLocalTime =
function(){

    const now =
        new Date();


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


    return (

        hours +
        ":" +
        minutes

    );

};


/* ============================================================
   SAFE FIELD SETTER
   ============================================================ */

GGIrregularity.UI.setValue =
function(
    id,
    value
){

    const element =
        document.getElementById(
            id
        );


    if(
        !element
    ){

        return false;

    }


    element.value =
        value ??
        "";


    return true;

};


/* ============================================================
   RESET FORM STATE
   ============================================================ */

GGIrregularity.UI.resetState =
function(){

    window.currentObservationType =
        "IRREGULARITY";


    window.isEditingIrregularity =
        false;


    window.currentIrregularityId =
        null;


    /*
     * IMPORTANT:
     *
     * Do NOT reset:
     *
     *     window.latestGps
     *
     * Do NOT modify:
     *
     *     window.resolveCurrentGIS
     *
     * GPS is application-level state.
     */

    if(
        GGIrregularity.State &&
        typeof GGIrregularity.State.reset ===
        "function"
    ){

        GGIrregularity.State.reset();

    }

};


/* ============================================================
   SET DEFAULTS
   ============================================================ */

GGIrregularity.UI.setDefaults =
function(){

    /* ========================================================
       DATE
       ======================================================== */

    GGIrregularity.UI.setValue(
        "gg-irregularity-incident_date",
        GGIrregularity.UI.getLocalDate()
    );


    /* ========================================================
       TIME
       ======================================================== */

    GGIrregularity.UI.setValue(
        "gg-irregularity-incident_time",
        GGIrregularity.UI.getLocalTime()
    );

};


/* ============================================================
   INITIALIZE FORM
   ============================================================ */

GGIrregularity.UI.initializeForm =
function(){

    /* ========================================================
       CATEGORY
       ======================================================== */

    const categorySelect =
        document.getElementById(
            "gg-irregularity-type"
        );


    if(
        categorySelect
    ){

        if(
            !categorySelect.__ggIrregularityUIBound
        ){

            categorySelect.__ggIrregularityUIBound =
                true;


            categorySelect.addEventListener(
                "change",
                function(){

                    if(
                        GGIrregularity.State &&
                        typeof GGIrregularity.State
                            .setCategory ===
                        "function"
                    ){

                        GGIrregularity.State
                            .setCategory(
                                categorySelect.value ||
                                ""
                            );

                    }


                    if(
                        typeof GGIrregularity
                            .updateFields ===
                        "function"
                    ){

                        GGIrregularity
                            .updateFields();

                    }

                }
            );

        }


        /* ====================================================
           INITIAL CATEGORY STATE
           ==================================================== */

        if(
            GGIrregularity.State &&
            typeof GGIrregularity.State
                .setCategory ===
            "function"
        ){

            GGIrregularity.State
                .setCategory(
                    categorySelect.value ||
                    ""
                );

        }

    }


    /* ========================================================
       MODULE INITIALIZATION

       The module owns the ONLY submit handler.

       UI does NOT create:

           form.onsubmit

       and does NOT create another submit listener.

       ======================================================== */

    if(
        typeof GGIrregularity.init ===
        "function"
    ){

        GGIrregularity.init();

    }


    /*
     * IMPORTANT:
     *
     * GGIrregularity.init() is the module's initialization
     * owner. Do not call updateFields() a second time here.
     *
     * This prevents duplicate category rendering work during
     * every form opening.
     */

    return true;

};


/* ============================================================
   OPEN IRREGULARITY FORM
   ============================================================ */

async function openIrregularityForm(){

    /* ========================================================
       FAST RE-ENTRY GUARD
       ======================================================== */

    const modalAlreadyOpen =
        document.getElementById(
            GGIrregularity.UI.MODAL_ID
        );


    if(
        GGIrregularity.UI.__opening
    ){

        return false;

    }


    if(
        modalAlreadyOpen &&
        modalAlreadyOpen.style.display ===
        "block"
    ){

        const category =
            document.getElementById(
                "gg-irregularity-type"
            );


        if(
            category
        ){

            requestAnimationFrame(
                function(){

                    try{

                        category.focus({
                            preventScroll:true
                        });

                    }
                    catch(
                        error
                    ){

                        category.focus();

                    }

                }
            );

        }

        return true;

    }


    GGIrregularity.UI.__opening =
        true;


    console.group(
        "⚠️ openIrregularityForm START"
    );


    try{

        /* ====================================================
           OBSERVATION TYPE
           ==================================================== */

        window.currentObservationType =
            "IRREGULARITY";


        window.isEditingIrregularity =
            false;


        window.currentIrregularityId =
            null;


        /* ====================================================
           RESET IRREGULARITY STATE
           ==================================================== */

        GGIrregularity.UI.resetState();


        /* ====================================================
           ENSURE MODAL

           IMPORTANT:

           The sighting selector is NOT closed yet.

           This prevents a blank screen while the Irregularity
           form is being constructed.
           ==================================================== */

        const modal =
            GGIrregularity.UI.ensureModal();


        if(
            !modal
        ){

            throw new Error(
                "Unable to create Irregularity modal."
            );

        }


        /* ====================================================
           KEEP MODAL HIDDEN DURING BUILD
           ==================================================== */

        modal.style.display =
            "none";

        modal.style.visibility =
            "hidden";

        modal.style.opacity =
            "0";


        /* ====================================================
           BUILD MANUAL FORM
           ==================================================== */

        const built =
            GGIrregularity.UI.buildForm();


        if(
            !built
        ){

            throw new Error(
                "Unable to build Irregularity form."
            );

        }


        /* ====================================================
           DEFAULT DATE / TIME
           ==================================================== */

        GGIrregularity.UI.setDefaults();


        /* ====================================================
           INITIALIZE FORM ONCE
           ==================================================== */

        GGIrregularity.UI.initializeForm();


        /* ====================================================
           ATOMIC UI SWITCH

           The old selector remains visible until the new
           Irregularity form is completely ready.

           Then both transitions happen in the next browser
           paint frame.

           This eliminates the blank-screen gap.
           ==================================================== */

        await new Promise(
            function(resolve){

                requestAnimationFrame(
                    function(){

                        try{

                            modal.style.display =
                                "block";


                            modal.style.visibility =
                                "visible";


                            modal.style.opacity =
                                "1";


                            modal.setAttribute(
                                "aria-hidden",
                                "false"
                            );


                            document.body.style.overflow =
                                "hidden";


                            /* --------------------------------
                               CLOSE OLD SELECTOR ONLY NOW
                               -------------------------------- */

                            if(
                                typeof closeSightingSelector ===
                                "function"
                            ){

                                closeSightingSelector();

                            }

                        }
                        finally{

                            resolve();

                        }

                    }
                );

            }
        );


        /* ====================================================
           FOCUS WITHOUT FORCED SCROLL
           ==================================================== */

        const categorySelect =
            document.getElementById(
                "gg-irregularity-type"
            );


        if(
            categorySelect
        ){

            requestAnimationFrame(
                function(){

                    try{

                        categorySelect.focus({
                            preventScroll:true
                        });

                    }
                    catch(
                        error
                    ){

                        try{

                            categorySelect.focus();

                        }
                        catch(
                            focusError
                        ){

                            console.warn(
                                "⚠ Unable to focus Irregularity category:",
                                focusError
                            );

                        }

                    }

                }
            );

        }


        /* ====================================================
           READY
           ==================================================== */

        console.log(
            "⚠️ Irregularity form OPEN"
        );


        console.log(
            "📝 Manual fields initialized."
        );


        console.log(
            "📍 GPS is NOT collected while opening form."
        );


        console.log(
            "🗺 GIS is NOT resolved while opening form."
        );


        console.log(
            "📍 GPS/GIS will be resolved only during SAVE."
        );


        console.groupEnd();


        return true;

    }
    catch(
        error
    ){

        console.error(
            "❌ Unable to open Irregularity form:",
            error
        );


        document.body.style.overflow =
            "";


        console.groupEnd();


        alert(
            "Unable to open Irregularity form.\n\n" +
            (
                error?.message ||
                "Unknown error"
            )
        );


        return false;

    }
    finally{

        GGIrregularity.UI.__opening =
            false;

    }

}


/* ============================================================
   CLOSE IRREGULARITY FORM
   ============================================================ */

function closeIrregularityForm(){

    /* ========================================================
       CANCEL ANY OPENING GUARD
       ======================================================== */

    GGIrregularity.UI.__opening =
        false;


    GGIrregularity.UI.__closing =
        true;


    const modal =
        document.getElementById(
            GGIrregularity.UI.MODAL_ID
        );


    /* ========================================================
       HIDE MODAL
       ======================================================== */

    if(
        modal
    ){

        modal.style.display =
            "none";


        modal.style.visibility =
            "hidden";


        modal.style.opacity =
            "0";


        modal.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    /* ========================================================
       RESTORE PAGE SCROLL
       ======================================================== */

    document.body.style.overflow =
        "";


    /* ========================================================
       RESET EDITING STATE
       ======================================================== */

    window.isEditingIrregularity =
        false;


    window.currentIrregularityId =
        null;


    window.currentObservationType =
        null;


    /* ========================================================
       RESET MODULE STATE
       ======================================================== */

    if(
        GGIrregularity.State &&
        typeof GGIrregularity.State.reset ===
        "function"
    ){

        GGIrregularity.State.reset();

    }


    console.log(
        "⚠️ Irregularity form CLOSED"
    );


    GGIrregularity.UI.__closing =
        false;

}


/* ============================================================
   SINGLE UI OPEN
   ============================================================ */

GGIrregularity.UI.open =
    openIrregularityForm;


/* ============================================================
   SINGLE UI CLOSE
   ============================================================ */

GGIrregularity.UI.close =
    closeIrregularityForm;


/* ============================================================
   IMPORTANT INTEGRATION

   The Firestore module may expose GGIrregularity.close().

   Make it point to the SAME modal closer.

   This prevents the situation where:

       SAVE succeeds
           ↓
       module calls GGIrregularity.close()
           ↓
       different modal ID is searched
           ↓
       modal remains open

   There is still only ONE actual modal.
   ============================================================ */

GGIrregularity.close =
    closeIrregularityForm;


/* ============================================================
   GLOBAL FUNCTIONS
   ============================================================ */

window.openIrregularityForm =
    openIrregularityForm;


window.closeIrregularityForm =
    closeIrregularityForm;


/* ============================================================
   OPTIONAL INITIAL SETUP

   Do NOT automatically open anything.

   Do NOT acquire GPS.

   Do NOT resolve GIS.

   Do NOT initialize Firebase.

   Do NOT reload the application.

   ============================================================ */

if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        function(){

            /*
             * Only ensure namespace/UI readiness.
             *
             * The actual modal is created when the user
             * opens Irregularity.
             */

            GGIrregularity.UI.ready =
                true;

        },
        {
            once:
                true
        }
    );

}
else{

    GGIrregularity.UI.ready =
        true;

}


/* ============================================================
   END
   ============================================================ */
