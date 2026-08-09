/* ============================================================
   🌲 GREENGUARD
   IRREGULARITY UI / MODAL INTEGRATION
   ============================================================

   File:
       js/irregularity/irregularityUI.js

   IMPORTANT
   ------------------------------------------------------------
   • Does NOT modify Elephant modal
   • Does NOT modify Wildlife modal
   • Does NOT create another GIS resolver
   • Uses window.resolveCurrentGIS()
   • Uses existing latestGps/latestGPS when available
   • Falls back to device GPS
   • Firestore saving remains inside irregularityModule.js
   ============================================================ */


/* ============================================================
   NAMESPACE
   ============================================================ */

window.GGIrregularity =
    window.GGIrregularity || {};


/* ============================================================
   CREATE MODAL
   ============================================================ */

GGIrregularity.UI =
    GGIrregularity.UI || {};


GGIrregularity.UI.ensureModal =
function(){

    let modal =
        document.getElementById(
            "irregularity-form-modal"
        );


    if(modal){

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
        "margin-bottom:8px;";


    const title =
        document.createElement(
            "h3"
        );


    title.textContent =
        "⚠️ Irregularity / Offence / Observation";


    title.style.cssText =

        "margin:0;" +
        "color:#1b5e20;" +
        "font-size:18px;" +
        "font-weight:800;" +
        "line-height:1.25;";


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


    closeButton.style.cssText =

        "font-size:24px;" +
        "border:none;" +
        "background:none;" +
        "cursor:pointer;" +
        "padding:5px;" +
        "color:#555;" +
        "line-height:1;";


    closeButton.onclick =
        function(){

            GGIrregularity.UI.close();

        };


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
        "box-sizing:border-box;";


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
        function(event){

            if(
                event.target ===
                modal
            ){

                GGIrregularity.UI.close();

            }

        }
    );


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
       CLOSE SIGHTING SELECTOR
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
       RESET STATE
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
       BUILD FORM
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


    document.body.style.overflow =
        "hidden";


    /* ========================================================
       USER PROFILE
       ======================================================== */

    const user =
        window.userProfile ||
        {};


    /* ========================================================
       GPS
       ======================================================== */

    let gps =
        window.latestGps ||
        window.latestGPS ||
        null;


    const hasValidGPS =
        gps &&
        Number.isFinite(
            Number(
                gps.lat ??
                gps.latitude
            )
        ) &&
        Number.isFinite(
            Number(
                gps.lng ??
                gps.lon ??
                gps.longitude
            )
        );


    /* ========================================================
       FALLBACK DEVICE GPS
       ======================================================== */

    if(
        !hasValidGPS
    ){

        try{

            const position =
                await new Promise(
                    function(
                        resolve,
                        reject
                    ){

                        if(
                            !navigator.geolocation
                        ){

                            reject(
                                new Error(
                                    "Geolocation not supported"
                                )
                            );

                            return;

                        }


                        navigator.geolocation.getCurrentPosition(

                            resolve,

                            reject,

                            {

                                enableHighAccuracy:
                                    true,

                                timeout:
                                    10000,

                                maximumAge:
                                    10000

                            }

                        );

                    }
                );


            gps = {

                lat:
                    position.coords.latitude,

                lng:
                    position.coords.longitude,

                accuracy:
                    position.coords.accuracy

            };


            window.latestGps =
                gps;


        }
        catch(
            error
        ){

            console.warn(
                "⚠ Unable to get current GPS:",
                error
            );


            gps = {

                lat:
                    "",

                lng:
                    "",

                accuracy:
                    null

            };

        }

    }


    /* ========================================================
       SAVE GPS INTO STATE
       ======================================================== */

    if(
        GGIrregularity.State &&
        typeof GGIrregularity.State.setGPS ===
        "function"
    ){

        GGIrregularity.State.setGPS(
            gps
        );

    }


    /* ========================================================
       RESOLVE GIS
       ======================================================== */

    const lat =
        Number(
            gps.lat ??
            gps.latitude
        );


    const lon =
        Number(
            gps.lng ??
            gps.lon ??
            gps.longitude
        );


    let gis =
        null;


    if(

        Number.isFinite(
            lat
        ) &&

        Number.isFinite(
            lon
        )

    ){

        /*
         * IMPORTANT:
         *
         * This is the ONLY GIS resolver.
         *
         * No new resolver is created here.
         */

        if(
            typeof window.resolveCurrentGIS ===
            "function"
        ){

            try{

                gis =
                    window.resolveCurrentGIS(
                        lat,
                        lon
                    );

            }
            catch(
                error
            ){

                console.error(
                    "❌ GIS resolution failed:",
                    error
                );

            }

        }
        else{

            console.error(
                "❌ window.resolveCurrentGIS() not available."
            );

        }

    }


    /* ========================================================
       SAVE GIS STATE
       ======================================================== */

    if(
        GGIrregularity.State &&
        typeof GGIrregularity.State.setGIS ===
        "function"
    ){

        GGIrregularity.State.setGIS(
            gis
        );

    }


    /* ========================================================
       DATE / TIME
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
       SET FIELD HELPER
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
       ======================================================== */

    setValue(
        "gg-irregularity-incident_date",
        date
    );


    /* ========================================================
       TIME
       ======================================================== */

    setValue(
        "gg-irregularity-incident_time",
        hours +
        ":" +
        minutes
    );


    /* ========================================================
       GPS HIDDEN FIELDS
       ======================================================== */

    setValue(
        "gg-irregularity-latitude",
        Number.isFinite(lat)
            ? lat
            : ""
    );


    setValue(
        "gg-irregularity-longitude",
        Number.isFinite(lon)
            ? lon
            : ""
    );


    /* ========================================================
       REPORTER
       ======================================================== */

    const reporter =
        user.rawName ||
        user.name ||
        "";


    const phone =
        user.phone ||
        "";


    /*
     * These are optional because the current form does not
     * require visible reporter fields.
     *
     * The Firestore module can use the same profile directly.
     */


    window.irregularityReporter = {

        name:
            reporter,

        phone:
            phone,

        designation:
            user.designation ||
            user.role ||
            "",

        beat:
            user.beat ||
            "",

        range:
            user.range ||
            "",

        division:
            user.division ||
            "",

        circle:
            user.circle ||
            "",

        sessionId:
            window.sessionId ||
            ""

    };


    /* ========================================================
       GIS DISPLAY
       ======================================================== */

    const locationText =
        gis?.text ||
        "";


    const locationField =
        document.getElementById(
            "gg-irregularity-location"
        );


    if(
        locationField
    ){

        locationField.value =
            locationText;

    }


    /* ========================================================
       CATEGORY CHANGE HANDLER
       ======================================================== */

    const categorySelect =
        document.getElementById(
            "gg-irregularity-type"
        );


    if(
        categorySelect
    ){

        categorySelect.addEventListener(
            "change",
            function(){

                if(
                    GGIrregularity.State &&
                    typeof GGIrregularity.State.setCategory ===
                    "function"
                ){

                    GGIrregularity.State.setCategory(
                        this.value
                    );

                }

            }
        );

    }


    /* ========================================================
       FORM SUBMIT
       ======================================================== */

    const form =
        document.getElementById(
            "ggIrregularityForm"
        );


    if(
        form
    ){

        form.onsubmit =
            async function(
                event
            ){

                event.preventDefault();

                event.stopPropagation();


                if(
                    GGIrregularity.State &&
                    typeof GGIrregularity.State.isSubmitting ===
                    "function" &&
                    GGIrregularity.State.isSubmitting()
                ){

                    return;

                }


                if(
                    GGIrregularity.State &&
                    typeof GGIrregularity.State.setSubmitting ===
                    "function"
                ){

                    GGIrregularity.State.setSubmitting(
                        true
                    );

                }


                try{

                    if(
                        typeof GGIrregularity.submit ===
                        "function"
                    ){

                        await GGIrregularity.submit(
                            form
                        );

                    }
                    else{

                        console.error(
                            "❌ GGIrregularity.submit() not available."
                        );

                    }

                }
                catch(
                    error
                ){

                    console.error(
                        "❌ Irregularity submission failed:",
                        error
                    );

                }
                finally{

                    if(
                        GGIrregularity.State &&
                        typeof GGIrregularity.State.setSubmitting ===
                        "function"
                    ){

                        GGIrregularity.State.setSubmitting(
                            false
                        );

                    }

                }

            };

    }


    /* ========================================================
       FOCUS
       ======================================================== */

    if(
        categorySelect
    ){

        setTimeout(
            function(){

                categorySelect.focus();

            },
            100
        );

    }


    console.log(
        "⚠️ Irregularity modal OPEN"
    );


    console.log(
        "📍 GPS:",
        gps
    );


    console.log(
        "🗺️ GIS:",
        gis
    );


    console.log(
        "👤 Reporter:",
        window.irregularityReporter
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


    if(
        modal
    ){

        modal.style.display =
            "none";

        modal.style.visibility =
            "hidden";

    }


    /*
     * Restore normal application scrolling.
     */

    document.body.style.overflow =
        "";


    window.isEditingIrregularity =
        false;


    window.currentIrregularityId =
        null;


    if(
        GGIrregularity.State &&
        typeof GGIrregularity.State.reset ===
        "function"
    ){

        GGIrregularity.State.reset();

    }


    console.log(
        "⚠️ Irregularity modal CLOSED"
    );

}


/* ============================================================
   NAMESPACE ALIASES
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
