/* ============================================================
   🌲 GREENGUARD
   IRREGULARITY UI / MODAL INTEGRATION
   ============================================================

   File:
       js/irregularity/irregularityUI.js

   RESPONSIBILITY
   ------------------------------------------------------------
   • Create / reuse Irregularity modal
   • Build manual-input form
   • Open / close modal
   • Set date/time defaults
   • Preserve existing sighting selector flow

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
   Handled by:

       irregularityModule.js

   GPS:
       window.latestGps
       navigator.geolocation fallback

   GIS:
       window.resolveCurrentGIS()

   ============================================================ */


/* ============================================================
   NAMESPACE
   ============================================================ */

window.GGIrregularity =
    window.GGIrregularity || {};


/* ============================================================
   UI NAMESPACE
   ============================================================ */

GGIrregularity.UI =
    GGIrregularity.UI || {};


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
            "irregularity-form-modal"
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
        "irregularity-form-modal";


    modal.style.cssText =

        "display:none;" +
        "position:fixed;" +
        "top:0;" +
        "left:0;" +
        "width:100%;" +
        "height:100%;" +
        "background:rgba(0,0,0,0.85);" +
        "backdrop-filter:blur(4px);" +
        "-webkit-backdrop-filter:blur(4px);" +
        "z-index:5001;" +
        "overflow-y:auto;" +
        "padding:10px;" +
        "box-sizing:border-box;" +
        "-webkit-overflow-scrolling:touch;";


    /* ========================================================
       INNER CONTAINER
       ======================================================== */

    const container =
        document.createElement(
            "div"
        );


    container.id =
        "irregularity-form-container";


    container.style.cssText =

        "background:#f4f4f4;" +
        "border-radius:15px;" +
        "padding:20px;" +
        "max-width:480px;" +
        "width:100%;" +
        "margin:20px auto;" +
        "font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;" +
        "border-top:8px solid #1b5e20;" +
        "box-shadow:0 10px 25px rgba(0,0,0,0.3);" +
        "box-sizing:border-box;" +
        "position:relative;";


    /* ========================================================
       HEADER
       ======================================================== */

    const header =
        document.createElement(
            "div"
        );


    header.style.cssText =

        "display:flex;" +
        "justify-content:space-between;" +
        "align-items:center;" +
        "width:100%;" +
        "box-sizing:border-box;" +
        "margin-bottom:8px;";


    /* ========================================================
       TITLE
       ======================================================== */

    const title =
        document.createElement(
            "h3"
        );


    title.textContent =
        "⚠️ Irregularity / Offence / Observation";


    title.style.cssText =

        "margin:0;" +
        "padding:0;" +
        "color:#1b5e20;" +
        "font-size:18px;" +
        "font-weight:800;" +
        "line-height:1.25;" +
        "flex:1;" +
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

        "flex:0 0 auto;" +
        "width:36px;" +
        "height:36px;" +
        "border:none;" +
        "border-radius:50%;" +
        "background:transparent;" +
        "font-size:26px;" +
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

        "margin:12px 0;" +
        "border:0;" +
        "border-top:1px solid #ddd;";


    /* ========================================================
       FORM HOST
       ======================================================== */

    const formHost =
        document.createElement(
            "div"
        );


    formHost.id =
        "gg-irregularity-form-host";


    formHost.style.cssText =

        "width:100%;" +
        "box-sizing:border-box;" +
        "margin:0;" +
        "padding:0;";


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
       RETURN
       ======================================================== */

    return modal;

};


/* ============================================================
   OPEN IRREGULARITY FORM
   ============================================================ */

async function openIrregularityForm(){

    console.group(
        "⚠️ openIrregularityForm START"
    );


    /* ========================================================
       CLOSE EXISTING SIGHTING SELECTOR
       ======================================================== */

    if(
        typeof closeSightingSelector ===
        "function"
    ){

        closeSightingSelector();

    }


    /* ========================================================
       OBSERVATION TYPE
       ======================================================== */

    window.currentObservationType =
        "IRREGULARITY";


    window.isEditingIrregularity =
        false;


    window.currentIrregularityId =
        null;


    /* ========================================================
       RESET EXISTING IRREGULARITY STATE
       ======================================================== */

    if(
        GGIrregularity.State &&
        typeof GGIrregularity.State.reset ===
        "function"
    ){

        GGIrregularity.State.reset();

    }


    /* ========================================================
       ENSURE MODAL
       ======================================================== */

    const modal =
        GGIrregularity.UI.ensureModal();


    /* ========================================================
       FORM HOST
       ======================================================== */

    const formHost =
        document.getElementById(
            "gg-irregularity-form-host"
        );


    if(
        !formHost
    ){

        console.error(
            "❌ Irregularity form host not found."
        );


        console.groupEnd();

        return;

    }


    /* ========================================================
       BUILD MANUAL-INPUT FORM
       ======================================================== */

    if(
        !GGIrregularity.Form ||
        typeof GGIrregularity.Form.build !==
        "function"
    ){

        console.error(
            "❌ GGIrregularity.Form.build() not available."
        );


        console.groupEnd();

        return;

    }


    formHost.innerHTML =
        GGIrregularity.Form.build();


    /* ========================================================
       SHOW MODAL
       ======================================================== */

    modal.style.display =
        "block";


    modal.style.visibility =
        "visible";


    modal.style.opacity =
        "1";


    /* ========================================================
       PREVENT BACKGROUND PAGE SCROLL
       ======================================================== */

    document.body.style.overflow =
        "hidden";


    /* ========================================================
       DATE / TIME DEFAULTS
       ======================================================== */

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


    /* ========================================================
       SAFE FIELD SETTER
       ======================================================== */

    const setValue =
        function(
            id,
            value
        ){

            const element =
                document.getElementById(
                    id
                );


            if(
                element
            ){

                element.value =
                    value ??
                    "";

            }

        };


    /* ========================================================
       DATE

       MANUAL FIELD
       Automatically defaulted to today's date.
       User can change it.
       ======================================================== */

    setValue(
        "gg-irregularity-incident_date",
        date
    );


    /* ========================================================
       TIME

       MANUAL FIELD
       Automatically defaulted to current time.
       User can change it.
       ======================================================== */

    setValue(
        "gg-irregularity-incident_time",
        hours +
        ":" +
        minutes
    );


    /* ========================================================
       INITIALIZE FORM BEHAVIOUR
       ========================================================

       IMPORTANT:

       irregularityModule.js owns the submit listener.

       We do NOT add:

           form.onsubmit

       here.

       This prevents duplicate Firestore submissions.
       ======================================================== */

    if(
        typeof GGIrregularity.init ===
        "function"
    ){

        GGIrregularity.init();

    }


    /* ========================================================
       CATEGORY FIELD
       ======================================================== */

    const categorySelect =
        document.getElementById(
            "gg-irregularity-type"
        );


    /* ========================================================
       CATEGORY STATE
       ======================================================== */

    if(
        categorySelect
    ){

        if(
            GGIrregularity.State &&
            typeof GGIrregularity.State.setCategory ===
            "function"
        ){

            GGIrregularity.State.setCategory(
                categorySelect.value ||
                ""
            );

        }

    }


    /* ========================================================
       INITIAL CATEGORY VISIBILITY
       ======================================================== */

    if(
        typeof GGIrregularity.updateFields ===
        "function"
    ){

        GGIrregularity.updateFields();

    }


    /* ========================================================
       FOCUS CATEGORY
       ======================================================== */

    if(
        categorySelect
    ){

        setTimeout(
            function(){

                try{

                    categorySelect.focus();

                }
                catch(
                    error
                ){

                    console.warn(
                        "⚠ Unable to focus irregularity category:",
                        error
                    );

                }

            },
            100
        );

    }


    /* ========================================================
       DEBUG

       NO GPS IS READ HERE.
       NO GIS IS RESOLVED HERE.
       ======================================================== */

    console.log(
        "⚠️ Irregularity form OPEN"
    );


    console.log(
        "📝 Manual fields ready."
    );


    console.log(
        "📍 GPS/GIS will be resolved only during submit."
    );


    console.groupEnd();

}


/* ============================================================
   CLOSE IRREGULARITY FORM
   ============================================================ */

function closeIrregularityForm(){

    const modal =
        document.getElementById(
            "irregularity-form-modal"
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


    /* ========================================================
       RESET IRREGULARITY STATE
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

}


/* ============================================================
   UI NAMESPACE ALIASES
   ============================================================ */

GGIrregularity.UI.open =
    openIrregularityForm;


GGIrregularity.UI.close =
    closeIrregularityForm;


/* ============================================================
   GLOBAL FUNCTIONS
   ============================================================ */

window.openIrregularityForm =
    openIrregularityForm;


window.closeIrregularityForm =
    closeIrregularityForm;


/* ============================================================
   END
   ============================================================ */
