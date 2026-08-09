/* ============================================================
   🌲 GREENGUARD
   IRREGULARITY MEDIA MODULE
   ============================================================

   FILE:
       js/irregularity/irregularityMedia.js

   PURPOSE:
       Photo / Video / Audio handling for
       Irregularity / Offence / Observation.

   IMPORTANT
   ------------------------------------------------------------
   • Uses EXISTING Firebase
   • Uses EXISTING window.storage
   • Uses EXISTING window.db
   • Uses EXISTING window.fb
   • NO Firebase initialization
   • NO Apps Script
   • NO new Firebase app
   • NO new Storage instance
   • Does NOT modify Wildlife
   • Does NOT modify Elephant
   • Does NOT modify window.latestGps
   • Does NOT resolve GIS

   MEDIA:
       Photo
       Video
       Audio recording / audio file

   STORAGE:
       irregularities/
           {financialYear}/
               {firestoreId}/
                   photo/
                   video/
                   audio/

   FIRESTORE MEDIA FIELDS:
       photo_url
       video_url
       audio_url
       photo_storage_path
       video_storage_path
       audio_storage_path
       media_status
       media_updated_at

   ============================================================ */


/* ============================================================
   GLOBAL NAMESPACE
   ============================================================ */

window.GGIrregularity =
    window.GGIrregularity || {};


window.GGIrregularity.Media =
    window.GGIrregularity.Media || {};


const GGIrregularity =
    window.GGIrregularity;


/* ============================================================
   CONSTANTS
   ============================================================ */

GGIrregularity.Media.ROOT =
    "irregularities";


GGIrregularity.Media.TYPE =
    "irregularity";


/* ============================================================
   INTERNAL STATE
   ============================================================ */

GGIrregularity.Media._photoObjectURL =
    null;


GGIrregularity.Media._videoObjectURL =
    null;


GGIrregularity.Media._audioObjectURL =
    null;


GGIrregularity.Media._audioRecorder =
    null;


GGIrregularity.Media._audioStream =
    null;


GGIrregularity.Media._audioChunks =
    [];


GGIrregularity.Media._audioTimer =
    null;


GGIrregularity.Media._audioStartedAt =
    null;


GGIrregularity.Media._recording =
    false;


GGIrregularity.Media._nativeAudioActive =
    false;


GGIrregularity.Media._nativeAudioUri =
    null;


/*
 * Maximum browser-recorded audio duration.
 *
 * This is intentionally generous so normal field
 * observations are not interrupted.
 */

GGIrregularity.Media.MAX_AUDIO_SECONDS =
    300;


/* ============================================================
   SAFE TEXT
   ============================================================ */

GGIrregularity.Media.safeText =
function(
    value
){

    return String(
        value ?? ""
    ).trim();

};


/* ============================================================
   WAIT FOR EXISTING FIREBASE
   ============================================================ */

GGIrregularity.Media.waitForFirebase =
async function(){

    /*
     * Existing GreenGuard Firebase already ready.
     */

    if(
        window.db &&
        window.fb &&
        window.storage
    ){

        return;

    }


    /*
     * Use existing readiness function if available.
     */

    if(
        typeof window.waitForFirebaseReady ===
        "function"
    ){

        await window.waitForFirebaseReady();

    }


    /*
     * Final validation.
     */

    if(
        !window.db ||
        !window.fb
    ){

        throw new Error(
            "Firebase is not initialized."
        );

    }


    if(
        !window.storage
    ){

        throw new Error(
            "Firebase Storage is not initialized."
        );

    }

};


/* ============================================================
   VALIDATE EXISTING FIREBASE STORAGE API
   ============================================================ */

GGIrregularity.Media.validateStorage =
function(){

    if(
        !window.storage
    ){

        throw new Error(
            "Firebase Storage is not initialized."
        );

    }


    if(
        !window.fb
    ){

        throw new Error(
            "Firebase functions are not available."
        );

    }


    if(
        typeof window.fb.ref !==
        "function"
    ){

        throw new Error(
            "Firebase Storage ref() is unavailable."
        );

    }


    if(
        typeof window.fb.uploadBytes !==
        "function"
    ){

        throw new Error(
            "Firebase Storage uploadBytes() is unavailable."
        );

    }


    if(
        typeof window.fb.uploadString !==
        "function"
    ){

        throw new Error(
            "Firebase Storage uploadString() is unavailable."
        );

    }


    if(
        typeof window.fb.getDownloadURL !==
        "function"
    ){

        throw new Error(
            "Firebase Storage getDownloadURL() is unavailable."
        );

    }

};


/* ============================================================
   SAFE FILE NAME
   ============================================================ */

GGIrregularity.Media.safeFileName =
function(
    fileName,
    fallbackName
){

    return String(
        fileName ||
        fallbackName ||
        "media"
    )
    .trim()
    .replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
    );

};


/* ============================================================
   BUILD STORAGE ROOT
   ============================================================ */

GGIrregularity.Media.getStorageRoot =
function(
    payload
){

    const firestoreId =
        GGIrregularity.Media.safeText(
            payload?.firestore_id
        );


    if(
        !firestoreId
    ){

        throw new Error(
            "Irregularity Firestore ID is not available for media upload."
        );

    }


    /* ========================================================
       FINANCIAL YEAR
       ======================================================== */

    let financialYear =
        GGIrregularity.Media.safeText(
            payload?.financial_year
        );


    /* ========================================================
       CURRENT INDIAN FINANCIAL YEAR
       ======================================================== */

    if(
        !financialYear
    ){

        const now =
            new Date();


        const year =
            now.getFullYear();


        const month =
            now.getMonth() + 1;


        /*
         * April → March
         */

        if(
            month >= 4
        ){

            financialYear =
                year +
                "-" +
                String(
                    year + 1
                );

        }
        else{

            financialYear =
                String(
                    year - 1
                ) +
                "-" +
                year;

        }

    }


    /* ========================================================
       SAME EXISTING STORAGE ROOT
       ======================================================== */

    const root =
        GGIrregularity.Media.ROOT +
        "/" +
        financialYear +
        "/" +
        firestoreId;


    return {

        financialYear:
            financialYear,

        root:
            root

    };

};


/* ============================================================
   REVOKE OBJECT URL
   ============================================================ */

GGIrregularity.Media._revoke =
function(
    type
){

    let property;


    if(
        type === "photo"
    ){

        property =
            "_photoObjectURL";

    }
    else if(
        type === "video"
    ){

        property =
            "_videoObjectURL";

    }
    else if(
        type === "audio"
    ){

        property =
            "_audioObjectURL";

    }
    else{

        return;

    }


    const url =
        GGIrregularity.Media[property];


    if(
        url
    ){

        try{

            URL.revokeObjectURL(
                url
            );

        }
        catch(_){

        }

    }


    GGIrregularity.Media[property] =
        null;

};


/* ============================================================
   STOP AUDIO STREAM
   ============================================================ */

GGIrregularity.Media._stopAudioStream =
function(){

    const stream =
        GGIrregularity.Media
            ._audioStream;


    if(
        stream &&
        typeof stream.getTracks ===
        "function"
    ){

        try{

            stream
                .getTracks()
                .forEach(
                    function(track){

                        try{

                            track.stop();

                        }
                        catch(_){

                        }

                    }
                );

        }
        catch(_){

        }

    }


    GGIrregularity.Media._audioStream =
        null;

};


/* ============================================================
   CLEAR AUDIO TIMER
   ============================================================ */

GGIrregularity.Media._clearAudioTimer =
function(){

    if(
        GGIrregularity.Media
            ._audioTimer
    ){

        clearInterval(
            GGIrregularity.Media
                ._audioTimer
        );

    }


    GGIrregularity.Media._audioTimer =
        null;


    GGIrregularity.Media._audioStartedAt =
        null;

};


/* ============================================================
   UPDATE MEDIA STATUS SAFELY
   ============================================================ */

GGIrregularity.Media._updateFormStatus =
function(
    state
){

    if(
        GGIrregularity.Form &&
        typeof GGIrregularity.Form
            .updateMediaStatus ===
        "function"
    ){

        try{

            GGIrregularity.Form
                .updateMediaStatus(
                    state
                );

        }
        catch(error){

            console.warn(
                "⚠ Unable to update Irregularity media status:",
                error
            );

        }

    }

};


/* ============================================================
   SET RECORD BUTTON STATE
   ============================================================ */

GGIrregularity.Media._setRecordButton =
function(
    recording
){

    const button =
        document.getElementById(
            "gg-irregularity-record-audio"
        );


    if(
        !button
    ){

        return;

    }


    if(
        recording
    ){

        button.textContent =
            "⏹ STOP AUDIO";


        button.style.background =
            "#ffebee";


        button.style.color =
            "#c62828";


        button.style.borderColor =
            "#ef9a9a";

    }
    else{

        button.textContent =
            "🎙 RECORD AUDIO";


        button.style.background =
            "#ffffff";


        button.style.color =
            "#1b5e20";


        button.style.borderColor =
            "#c8d6c8";

    }

};


/* ============================================================
   GET CURRENT FORM MEDIA
   ============================================================ */

GGIrregularity.Media.getFormMedia =
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


    return {

        photo:
            photoInput?.files?.[0] ||
            null,

        video:
            videoInput?.files?.[0] ||
            null,

        audio:
            audioInput?.files?.[0] ||
            null,

        nativeAudioUri:
            GGIrregularity.Media
                ._nativeAudioUri ||
            null

    };

};


/* ============================================================
   CHECK MEDIA
   ============================================================ */

GGIrregularity.Media.hasMedia =
function(){

    const media =
        GGIrregularity.Media
            .getFormMedia();


    return !!(
        media.photo ||
        media.video ||
        media.audio ||
        media.nativeAudioUri
    );

};


/* ============================================================
   END PART 1/4
   ============================================================ */

/* ============================================================
   PHOTO — PREVIEW
   ============================================================ */

GGIrregularity.Media.previewPhoto =
function(
    input
){

    const file =
        input?.files?.[0] ||
        null;


    if(
        !file
    ){

        return;

    }


    /* ========================================================
       VALIDATE IMAGE
       ======================================================== */

    if(
        !file.type ||
        !file.type.startsWith(
            "image/"
        )
    ){

        alert(
            "Please select a valid image."
        );


        input.value =
            "";


        return;

    }


    /* ========================================================
       CLEAR OLD OBJECT URL
       ======================================================== */

    GGIrregularity.Media._revoke(
        "photo"
    );


    /* ========================================================
       CREATE PREVIEW URL
       ======================================================== */

    const url =
        URL.createObjectURL(
            file
        );


    GGIrregularity.Media
        ._photoObjectURL =
        url;


    /* ========================================================
       PREVIEW ELEMENT
       ======================================================== */

    const image =
        document.getElementById(
            "gg-irregularity-photo-preview-img"
        );


    const preview =
        document.getElementById(
            "gg-irregularity-photo-preview"
        );


    if(
        image
    ){

        image.src =
            url;

    }


    if(
        preview
    ){

        preview.style.display =
            "block";

    }


    /* ========================================================
       UPDATE STATUS
       ======================================================== */

    GGIrregularity.Media
        ._updateFormStatus();

};


/* ============================================================
   PHOTO — CHANGE
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
   PHOTO — REMOVE
   ============================================================ */

GGIrregularity.Media.removePhoto =
function(){

    GGIrregularity.Media._revoke(
        "photo"
    );


    const input =
        document.getElementById(
            "gg-irregularity-photo"
        );


    const image =
        document.getElementById(
            "gg-irregularity-photo-preview-img"
        );


    const preview =
        document.getElementById(
            "gg-irregularity-photo-preview"
        );


    if(
        input
    ){

        input.value =
            "";

    }


    if(
        image
    ){

        image.removeAttribute(
            "src"
        );

    }


    if(
        preview
    ){

        preview.style.display =
            "none";

    }


    GGIrregularity.Media
        ._updateFormStatus();

};


/* ============================================================
   VIDEO — PREVIEW
   ============================================================ */

GGIrregularity.Media.previewVideo =
function(
    input
){

    const file =
        input?.files?.[0] ||
        null;


    if(
        !file
    ){

        return;

    }


    /* ========================================================
       VALIDATE VIDEO
       ======================================================== */

    if(
        !file.type ||
        !file.type.startsWith(
            "video/"
        )
    ){

        alert(
            "Please select a valid video."
        );


        input.value =
            "";


        return;

    }


    /* ========================================================
       CLEAR OLD URL
       ======================================================== */

    GGIrregularity.Media._revoke(
        "video"
    );


    /* ========================================================
       CREATE PREVIEW
       ======================================================== */

    const url =
        URL.createObjectURL(
            file
        );


    GGIrregularity.Media
        ._videoObjectURL =
        url;


    const player =
        document.getElementById(
            "gg-irregularity-video-preview-player"
        );


    const preview =
        document.getElementById(
            "gg-irregularity-video-preview"
        );


    if(
        player
    ){

        player.src =
            url;


        try{

            player.load();

        }
        catch(_){

        }

    }


    if(
        preview
    ){

        preview.style.display =
            "block";

    }


    GGIrregularity.Media
        ._updateFormStatus();

};


/* ============================================================
   VIDEO — CHANGE
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
   VIDEO — REMOVE
   ============================================================ */

GGIrregularity.Media.removeVideo =
function(){

    GGIrregularity.Media._revoke(
        "video"
    );


    const input =
        document.getElementById(
            "gg-irregularity-video"
        );


    const player =
        document.getElementById(
            "gg-irregularity-video-preview-player"
        );


    const preview =
        document.getElementById(
            "gg-irregularity-video-preview"
        );


    if(
        input
    ){

        input.value =
            "";

    }


    if(
        player
    ){

        try{

            player.pause();

        }
        catch(_){

        }


        player.removeAttribute(
            "src"
        );


        try{

            player.load();

        }
        catch(_){

        }

    }


    if(
        preview
    ){

        preview.style.display =
            "none";

    }


    GGIrregularity.Media
        ._updateFormStatus();

};


/* ============================================================
   AUDIO — SHOW PREVIEW
   ============================================================ */

GGIrregularity.Media._showAudioPreview =
function(
    source
){

    if(
        !source
    ){

        return;

    }


    const player =
        document.getElementById(
            "gg-irregularity-audio-preview-player"
        );


    const preview =
        document.getElementById(
            "gg-irregularity-audio-preview"
        );


    if(
        !player
    ){

        return;

    }


    /*
     * Remove previous preview URL if this is
     * a browser-created object URL.
     */

    if(
        source instanceof Blob
    ){

        GGIrregularity.Media._revoke(
            "audio"
        );


        const url =
            URL.createObjectURL(
                source
            );


        GGIrregularity.Media
            ._audioObjectURL =
            url;


        player.src =
            url;

    }
    else{

        player.src =
            String(
                source
            );

    }


    try{

        player.load();

    }
    catch(_){

    }


    if(
        preview
    ){

        preview.style.display =
            "block";

    }


    GGIrregularity.Media
        ._updateFormStatus();

};


/* ============================================================
   AUDIO — PREVIEW SELECTED FILE
   ============================================================ */

GGIrregularity.Media.previewAudio =
function(
    input
){

    const file =
        input?.files?.[0] ||
        null;


    if(
        !file
    ){

        return;

    }


    /* ========================================================
       VALIDATE AUDIO
       ======================================================== */

    if(
        !file.type ||
        !file.type.startsWith(
            "audio/"
        )
    ){

        alert(
            "Please select a valid audio file."
        );


        input.value =
            "";


        return;

    }


    GGIrregularity.Media
        ._nativeAudioUri =
        null;


    GGIrregularity.Media
        ._showAudioPreview(
            file
        );

};


/* ============================================================
   AUDIO — SELECT AUDIO FILE
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
   AUDIO — SET FILE INTO INPUT
   ============================================================ */

GGIrregularity.Media._setInputFile =
function(
    input,
    file
){

    if(
        !input ||
        !file
    ){

        return false;

    }


    try{

        /*
         * DataTransfer allows a browser-generated
         * recording Blob/File to become the actual
         * <input type="file"> value.
         */

        const transfer =
            new DataTransfer();


        transfer.items.add(
            file
        );


        input.files =
            transfer.files;


        return true;

    }
    catch(error){

        console.warn(
            "⚠ Could not assign recorded audio to file input:",
            error
        );


        return false;

    }

};


/* ============================================================
   AUDIO — START BROWSER RECORDING
   ============================================================ */

GGIrregularity.Media.startBrowserRecording =
async function(){

    /* ========================================================
       ALREADY RECORDING
       ======================================================== */

    if(
        GGIrregularity.Media
            ._recording
    ){

        return;

    }


    /* ========================================================
       BROWSER SUPPORT
       ======================================================== */

    if(
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices
            .getUserMedia !==
        "function"
    ){

        alert(
            "Audio recording is not supported on this device/browser."
        );


        return;

    }


    if(
        typeof MediaRecorder ===
        "undefined"
    ){

        alert(
            "Audio recording is not supported on this browser."
        );


        return;

    }


    let stream =
        null;


    try{

        /* ====================================================
           MICROPHONE
           ==================================================== */

        stream =
            await navigator.mediaDevices
                .getUserMedia(
                    {
                        audio:true
                    }
                );


        GGIrregularity.Media
            ._audioStream =
            stream;


        /* ====================================================
           SELECT BEST SUPPORTED FORMAT
           ==================================================== */

        const mimeCandidates = [

            "audio/mp4",

            "audio/webm;codecs=opus",

            "audio/webm",

            "audio/ogg;codecs=opus"

        ];


        let mimeType =
            "";


        if(
            typeof MediaRecorder
                .isTypeSupported ===
            "function"
        ){

            for(
                const candidate of
                mimeCandidates
            ){

                try{

                    if(
                        MediaRecorder
                            .isTypeSupported(
                                candidate
                            )
                    ){

                        mimeType =
                            candidate;


                        break;

                    }

                }
                catch(_){

                }

            }

        }


        /* ====================================================
           CREATE RECORDER
           ==================================================== */

        const recorder =
            mimeType

                ? new MediaRecorder(
                    stream,
                    {
                        mimeType:
                            mimeType
                    }
                )

                : new MediaRecorder(
                    stream
                );


        GGIrregularity.Media
            ._audioRecorder =
            recorder;


        GGIrregularity.Media
            ._audioChunks =
            [];


        GGIrregularity.Media
            ._recording =
            true;


        GGIrregularity.Media
            ._audioStartedAt =
            Date.now();


        GGIrregularity.Media
            ._setRecordButton(
                true
            );


        GGIrregularity.Media
            ._updateFormStatus(
                "recording"
            );


        /* ====================================================
           DATA
           ==================================================== */

        recorder.ondataavailable =
        function(
            event
        ){

            if(
                event.data &&
                event.data.size > 0
            ){

                GGIrregularity.Media
                    ._audioChunks
                    .push(
                        event.data
                    );

            }

        };


        /* ====================================================
           ERROR
           ==================================================== */

        recorder.onerror =
        function(
            event
        ){

            console.error(
                "❌ Irregularity audio recorder error:",
                event
            );

        };


        /* ====================================================
           STOP
           ==================================================== */

        recorder.onstop =
        function(){

            try{

                const finalMime =
                    recorder.mimeType ||
                    mimeType ||
                    "audio/webm";


                const extension =
                    finalMime.includes(
                        "mp4"
                    )

                        ? "m4a"

                        : finalMime.includes(
                            "ogg"
                        )

                            ? "ogg"

                            : "webm";


                const blob =
                    new Blob(
                        GGIrregularity.Media
                            ._audioChunks,
                        {
                            type:
                                finalMime
                        }
                    );


                if(
                    !blob.size
                ){

                    throw new Error(
                        "Audio recording is empty."
                    );

                }


                const file =
                    new File(
                        [blob],
                        "irregularity_audio_" +
                        Date.now() +
                        "." +
                        extension,
                        {
                            type:
                                finalMime,

                            lastModified:
                                Date.now()
                        }
                    );


                /* ============================================
                   PUT RECORDED AUDIO INTO EXISTING INPUT
                   ============================================ */

                const input =
                    document.getElementById(
                        "gg-irregularity-audio"
                    );


                GGIrregularity.Media
                    ._setInputFile(
                        input,
                        file
                    );


                /* ============================================
                   PREVIEW
                   ============================================ */

                GGIrregularity.Media
                    ._showAudioPreview(
                        file
                    );


                console.log(
                    "✅ Irregularity audio recording ready:",
                    {
                        name:
                            file.name,

                        size:
                            file.size,

                        type:
                            file.type
                    }
                );

            }
            catch(error){

                console.error(
                    "❌ Failed to create audio recording:",
                    error
                );


                alert(
                    "Audio recording could not be prepared."
                );

            }
            finally{

                GGIrregularity.Media
                    ._stopAudioStream();


                GGIrregularity.Media
                    ._clearAudioTimer();


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
                    ._setRecordButton(
                        false
                    );


                GGIrregularity.Media
                    ._updateFormStatus();

            }

        };


        /* ====================================================
           START
           ==================================================== */

        recorder.start(
            1000
        );


        console.log(
            "🎙 Irregularity audio recording started."
        );


        /* ====================================================
           TIMER
           ==================================================== */

        const timer =
            document.getElementById(
                "gg-irregularity-audio-timer"
            );


        GGIrregularity.Media
            ._audioTimer =
            setInterval(
                function(){

                    if(
                        !GGIrregularity.Media
                            ._recording
                    ){

                        return;

                    }


                    const elapsed =
                        Math.floor(
                            (
                                Date.now() -
                                GGIrregularity.Media
                                    ._audioStartedAt
                            ) /
                            1000
                        );


                    if(
                        timer
                    ){

                        timer.textContent =
                            "Recording " +
                            elapsed +
                            "s";

                    }


                    /* ========================================
                       SAFETY MAXIMUM
                       ======================================== */

                    if(
                        elapsed >=
                        GGIrregularity.Media
                            .MAX_AUDIO_SECONDS
                    ){

                        GGIrregularity.Media
                            .stopRecording();

                    }

                },
                500
            );

    }
    catch(error){

        console.error(
            "❌ Unable to start microphone:",
            error
        );


        GGIrregularity.Media
            ._stopAudioStream();


        GGIrregularity.Media
            ._clearAudioTimer();


        GGIrregularity.Media
            ._audioRecorder =
            null;


        GGIrregularity.Media
            ._recording =
            false;


        GGIrregularity.Media
            ._setRecordButton(
                false
            );


        GGIrregularity.Media
            ._updateFormStatus();


        if(
            error?.name ===
            "NotAllowedError"
        ){

            alert(
                "Microphone permission was denied. Please allow microphone access and try again."
            );

        }
        else{

            alert(
                "Unable to start audio recording."
            );

        }

    }

};


/* ============================================================
   AUDIO — STOP RECORDING
   ============================================================ */

GGIrregularity.Media.stopRecording =
function(){

    const recorder =
        GGIrregularity.Media
            ._audioRecorder;


    if(
        !recorder
    ){

        return;

    }


    if(
        recorder.state !==
        "recording"
    ){

        return;

    }


    console.log(
        "⏹ Stopping Irregularity audio recording..."
    );


    try{

        recorder.stop();

    }
    catch(error){

        console.error(
            "❌ Unable to stop audio recording:",
            error
        );


        GGIrregularity.Media
            ._stopAudioStream();


        GGIrregularity.Media
            ._clearAudioTimer();


        GGIrregularity.Media
            ._audioRecorder =
            null;


        GGIrregularity.Media
            ._recording =
            false;


        GGIrregularity.Media
            ._setRecordButton(
                false
            );

    }

};


/* ============================================================
   AUDIO — RECORD / STOP TOGGLE
   ============================================================ */

GGIrregularity.Media.recordAudio =
async function(){

    /*
     * If already recording, the same button becomes
     * STOP AUDIO.
     */

    if(
        GGIrregularity.Media
            ._recording
    ){

        GGIrregularity.Media
            .stopRecording();


        return;

    }


    /*
     * Native Android recorder is optional.
     *
     * Existing Android integration can be used if it
     * already exposes startVoiceRecorder().
     *
     * We do NOT require it.
     */

    if(
        window.Android &&
        typeof window.Android
            .startVoiceRecorder ===
        "function"
    ){

        try{

            GGIrregularity.Media
                ._nativeAudioActive =
                true;


            window.currentIrregularityAudioType =
                "irregularity";


            window.Android
                .startVoiceRecorder();


            GGIrregularity.Media
                ._updateFormStatus(
                    "recording"
                );


            return;

        }
        catch(error){

            console.warn(
                "⚠ Native audio recorder failed; using browser recorder:",
                error
            );


            GGIrregularity.Media
                ._nativeAudioActive =
                false;


            window.currentIrregularityAudioType =
                null;

        }

    }


    /*
     * Browser fallback.
     */

    await GGIrregularity.Media
        .startBrowserRecording();

};


/* ============================================================
   AUDIO — RECORD AGAIN
   ============================================================ */

GGIrregularity.Media.recordAgain =
function(){

    /*
     * Remove existing recording first.
     */

    GGIrregularity.Media
        .removeAudio();


    /*
     * Start again after the DOM has updated.
     */

    setTimeout(
        function(){

            GGIrregularity.Media
                .recordAudio();

        },
        120
    );

};


/* ============================================================
   AUDIO — REMOVE
   ============================================================ */

GGIrregularity.Media.removeAudio =
function(){

    /* ========================================================
       STOP ACTIVE RECORDER
       ======================================================== */

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
        catch(_){

        }

    }


    /* ========================================================
       STOP STREAM
       ======================================================== */

    GGIrregularity.Media
        ._stopAudioStream();


    /* ========================================================
       TIMER
       ======================================================== */

    GGIrregularity.Media
        ._clearAudioTimer();


    /* ========================================================
       OBJECT URL
       ======================================================== */

    GGIrregularity.Media
        ._revoke(
            "audio"
        );


    /* ========================================================
       STATE
       ======================================================== */

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


    /* ========================================================
       INPUT
       ======================================================== */

    const input =
        document.getElementById(
            "gg-irregularity-audio"
        );


    if(
        input
    ){

        input.value =
            "";

    }


    /* ========================================================
       PLAYER
       ======================================================== */

    const player =
        document.getElementById(
            "gg-irregularity-audio-preview-player"
        );


    if(
        player
    ){

        try{

            player.pause();

        }
        catch(_){

        }


        player.removeAttribute(
            "src"
        );


        try{

            player.load();

        }
        catch(_){

        }

    }


    /* ========================================================
       PREVIEW
       ======================================================== */

    const preview =
        document.getElementById(
            "gg-irregularity-audio-preview"
        );


    if(
        preview
    ){

        preview.style.display =
            "none";

    }


    /* ========================================================
       TIMER
       ======================================================== */

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


    GGIrregularity.Media
        ._setRecordButton(
            false
        );


    GGIrregularity.Media
        ._updateFormStatus();

};


/* ============================================================
   AUDIO — NATIVE ANDROID CALLBACK
   ============================================================ */

GGIrregularity.Media.handleNativeAudio =
function(
    uri
){

    GGIrregularity.Media
        ._nativeAudioActive =
        false;


    window.currentIrregularityAudioType =
        null;


    if(
        !uri
    ){

        GGIrregularity.Media
            ._nativeAudioUri =
            null;


        GGIrregularity.Media
            ._updateFormStatus();


        return;

    }


    GGIrregularity.Media
        ._nativeAudioUri =
        String(
            uri
        );


    /*
     * Hide browser recording state.
     */

    GGIrregularity.Media
        ._recording =
        false;


    GGIrregularity.Media
        ._setRecordButton(
            false
        );


    /*
     * Preview native URI.
     */

    const player =
        document.getElementById(
            "gg-irregularity-audio-preview-player"
        );


    const preview =
        document.getElementById(
            "gg-irregularity-audio-preview"
        );


    if(
        player
    ){

        player.src =
            String(
                uri
            );


        try{

            player.load();

        }
        catch(_){

        }

    }


    if(
        preview
    ){

        preview.style.display =
            "block";

    }


    GGIrregularity.Media
        ._updateFormStatus();

};


/* ============================================================
   PRESERVE EXISTING NATIVE AUDIO CALLBACK
   ============================================================ */

if(
    !window.__ggIrregularityNativeAudioCallbackInstalled
){

    const existingCallback =
        window.onNativeAudioRecorded;


    window.onNativeAudioRecorded =
    function(
        uri
    ){

        /*
         * Only consume the callback when
         * Irregularity requested the recorder.
         */

        if(
            window.currentIrregularityAudioType ===
            "irregularity"
        ){

            GGIrregularity.Media
                .handleNativeAudio(
                    uri
                );


            return;

        }


        /*
         * Existing Wildlife / Elephant callback
         * continues to work.
         */

        if(
            typeof existingCallback ===
            "function"
        ){

            try{

                existingCallback(
                    uri
                );

            }
            catch(error){

                console.error(
                    "❌ Existing native audio callback failed:",
                    error
                );

            }

        }

    };


    window.__ggIrregularityNativeAudioCallbackInstalled =
        true;

}


/* ============================================================
   END PART 2/4
   ============================================================ */
/* ============================================================
   UPLOAD BLOB / FILE
   ============================================================ */

GGIrregularity.Media.uploadBlob =
async function(
    mediaFile,
    mediaType,
    storageRoot,
    fallbackName,
    payload
){

    if(
        !mediaFile ||
        !(mediaFile instanceof Blob)
    ){

        return null;

    }


    /* ========================================================
       FILE NAME
       ======================================================== */

    const fileName =
        GGIrregularity.Media.safeFileName(
            mediaFile.name,
            fallbackName
        );


    /* ========================================================
       STORAGE PATH
       ======================================================== */

    const storagePath =
        storageRoot +
        "/" +
        mediaType +
        "/" +
        Date.now() +
        "_" +
        fileName;


    /* ========================================================
       EXISTING FIREBASE STORAGE REF
       ======================================================== */

    const storageRef =
        window.fb.ref(
            window.storage,
            storagePath
        );


    /* ========================================================
       CONTENT TYPE
       ======================================================== */

    let contentType =
        mediaFile.type ||
        "application/octet-stream";


    if(
        mediaType ===
        "audio" &&
        !contentType.startsWith(
            "audio/"
        )
    ){

        contentType =
            "audio/mp4";

    }


    /* ========================================================
       METADATA
       ======================================================== */

    const metadata = {

        contentType:
            contentType,

        customMetadata: {

            observationType:
                "IRREGULARITY",

            firestoreId:
                GGIrregularity.Media.safeText(
                    payload?.firestore_id
                ),

            category:
                GGIrregularity.Media.safeText(
                    payload?.category
                ),

            mediaType:
                mediaType,

            source:
                "GreenGuard"

        }

    };


    console.log(
        "⬆️ Uploading Irregularity media:",
        {
            mediaType:
                mediaType,

            fileName:
                fileName,

            size:
                mediaFile.size,

            type:
                contentType,

            path:
                storagePath

        }
    );


    /* ========================================================
       EXISTING uploadBytes()
       ======================================================== */

    const uploadResult =
        await window.fb.uploadBytes(
            storageRef,
            mediaFile,
            metadata
        );


    /* ========================================================
       EXISTING getDownloadURL()
       ======================================================== */

    const url =
        await window.fb.getDownloadURL(
            uploadResult.ref
        );


    console.log(
        "✅ Irregularity media uploaded:",
        {
            mediaType:
                mediaType,

            path:
                storagePath,

            url:
                url

        }
    );


    return {

        url:
            url,

        path:
            storagePath

    };

};


/* ============================================================
   UPLOAD NATIVE AUDIO URI
   ============================================================ */

GGIrregularity.Media.uploadNativeAudio =
async function(
    uri,
    storageRoot,
    payload
){

    if(
        !uri
    ){

        return null;

    }


    console.log(
        "⬆️ Reading native Irregularity audio:",
        uri
    );


    let response;


    try{

        response =
            await fetch(
                String(
                    uri
                )
            );

    }
    catch(error){

        console.error(
            "❌ Native audio URI could not be opened:",
            error
        );


        throw new Error(
            "Native audio recording could not be accessed."
        );

    }


    if(
        !response.ok
    ){

        throw new Error(
            "Native audio recording could not be read."
        );

    }


    const blob =
        await response.blob();


    if(
        !blob ||
        !blob.size
    ){

        throw new Error(
            "Native audio recording is empty."
        );

    }


    const mimeType =
        blob.type ||
        "audio/mp4";


    let extension =
        "m4a";


    if(
        mimeType.includes(
            "webm"
        )
    ){

        extension =
            "webm";

    }
    else if(
        mimeType.includes(
            "ogg"
        )
    ){

        extension =
            "ogg";

    }
    else if(
        mimeType.includes(
            "wav"
        )
    ){

        extension =
            "wav";

    }


    const file =
        new File(
            [
                blob
            ],
            "irregularity_audio_" +
            Date.now() +
            "." +
            extension,
            {
                type:
                    mimeType,

                lastModified:
                    Date.now()
            }
        );


    return GGIrregularity.Media
        .uploadBlob(
            file,
            "audio",
            storageRoot,
            "audio." +
                extension,
            payload
        );

};


/* ============================================================
   UPLOAD ALL MEDIA
   ============================================================ */

GGIrregularity.Media.upload =
async function(
    payload
){

    console.group(
        "📦 IRREGULARITY MEDIA UPLOAD"
    );


    try{

        /* ====================================================
           EXISTING FIREBASE
           ==================================================== */

        await GGIrregularity.Media
            .waitForFirebase();


        GGIrregularity.Media
            .validateStorage();


        /* ====================================================
           STORAGE ROOT
           ==================================================== */

        const storageInfo =
            GGIrregularity.Media
                .getStorageRoot(
                    payload
                );


        /* ====================================================
           CURRENT MEDIA
           ==================================================== */

        const media =
            GGIrregularity.Media
                .getFormMedia();


        /* ====================================================
           RESULT
           ==================================================== */

        const result = {

            photo_url:
                "",

            video_url:
                "",

            audio_url:
                "",

            photo_storage_path:
                "",

            video_storage_path:
                "",

            audio_storage_path:
                "",

            media_status:
                "NONE"

        };


        /* ====================================================
           PHOTO
           ==================================================== */

        if(
            media.photo
        ){

            console.log(
                "📷 Uploading Irregularity photo..."
            );


            const uploaded =
                await GGIrregularity.Media
                    .uploadBlob(
                        media.photo,
                        "photo",
                        storageInfo.root,
                        "photo.jpg",
                        payload
                    );


            if(
                uploaded
            ){

                result.photo_url =
                    uploaded.url;


                result.photo_storage_path =
                    uploaded.path;

            }

        }


        /* ====================================================
           VIDEO
           ==================================================== */

        if(
            media.video
        ){

            console.log(
                "🎥 Uploading Irregularity video..."
            );


            const uploaded =
                await GGIrregularity.Media
                    .uploadBlob(
                        media.video,
                        "video",
                        storageInfo.root,
                        "video.mp4",
                        payload
                    );


            if(
                uploaded
            ){

                result.video_url =
                    uploaded.url;


                result.video_storage_path =
                    uploaded.path;

            }

        }


        /* ====================================================
           AUDIO FILE
           ==================================================== */

        if(
            media.audio
        ){

            console.log(
                "🎙 Uploading Irregularity audio file..."
            );


            const uploaded =
                await GGIrregularity.Media
                    .uploadBlob(
                        media.audio,
                        "audio",
                        storageInfo.root,
                        "audio.m4a",
                        payload
                    );


            if(
                uploaded
            ){

                result.audio_url =
                    uploaded.url;


                result.audio_storage_path =
                    uploaded.path;

            }

        }


        /* ====================================================
           NATIVE AUDIO URI
           ==================================================== */

        else if(
            media.nativeAudioUri
        ){

            console.log(
                "🎙 Uploading native Irregularity audio..."
            );


            const uploaded =
                await GGIrregularity.Media
                    .uploadNativeAudio(
                        media.nativeAudioUri,
                        storageInfo.root,
                        payload
                    );


            if(
                uploaded
            ){

                result.audio_url =
                    uploaded.url;


                result.audio_storage_path =
                    uploaded.path;

            }

        }


        /* ====================================================
           MEDIA STATUS
           ==================================================== */

        const count =

            (
                result.photo_url
                    ? 1
                    : 0
            ) +

            (
                result.video_url
                    ? 1
                    : 0
            ) +

            (
                result.audio_url
                    ? 1
                    : 0
            );


        result.media_status =
            count > 0
                ? "COMPLETE"
                : "NONE";


        console.log(
            "📦 Irregularity media upload result:",
            result
        );


        console.groupEnd();


        return result;

    }
    catch(error){

        console.error(
            "❌ Irregularity media upload failed:",
            error
        );


        console.groupEnd();


        throw error;

    }

};


/* ============================================================
   UPDATE FIRESTORE MEDIA FIELDS
   ============================================================ */

GGIrregularity.Media.updateFirestore =
async function(
    firestoreId,
    mediaResult
){

    /* ========================================================
       VALIDATE FIRESTORE
       ======================================================== */

    if(
        !window.db ||
        !window.fb
    ){

        throw new Error(
            "Firebase is not initialized."
        );

    }


    if(
        !firestoreId
    ){

        throw new Error(
            "Irregularity Firestore ID is missing."
        );

    }


    /* ========================================================
       EXISTING IRREGULARITY DOCUMENT
       ======================================================== */

    const irregularityRef =
        window.fb.doc(
            window.db,
            "irregularities",
            firestoreId
        );


    /* ========================================================
       SAME MEDIA FIELDS AS EXISTING PIPELINE
       ======================================================== */

    await window.fb.updateDoc(
        irregularityRef,
        {

            photo_url:
                mediaResult?.photo_url ||
                "",

            video_url:
                mediaResult?.video_url ||
                "",

            audio_url:
                mediaResult?.audio_url ||
                "",

            photo_storage_path:
                mediaResult?.photo_storage_path ||
                "",

            video_storage_path:
                mediaResult?.video_storage_path ||
                "",

            audio_storage_path:
                mediaResult?.audio_storage_path ||
                "",

            media_status:
                mediaResult?.media_status ||
                "NONE",

            media_updated_at:
                window.fb.serverTimestamp(),

            updated_at:
                window.fb.serverTimestamp()

        }
    );


    console.log(
        "✅ Irregularity Firestore media fields updated:",
        {
            firestoreId:
                firestoreId,

            mediaResult:
                mediaResult

        }
    );

};


/* ============================================================
   MEDIA EVENTS
   ============================================================ */

GGIrregularity.Media.bindEvents =
function(){

    /* ========================================================
       PHOTO INPUT
       ======================================================== */

    const photoInput =
        document.getElementById(
            "gg-irregularity-photo"
        );


    if(
        photoInput &&
        !photoInput.dataset.ggMediaBound
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


        photoInput.dataset.ggMediaBound =
            "1";

    }


    /* ========================================================
       VIDEO INPUT
       ======================================================== */

    const videoInput =
        document.getElementById(
            "gg-irregularity-video"
        );


    if(
        videoInput &&
        !videoInput.dataset.ggMediaBound
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


        videoInput.dataset.ggMediaBound =
            "1";

    }


    /* ========================================================
       AUDIO INPUT
       ======================================================== */

    const audioInput =
        document.getElementById(
            "gg-irregularity-audio"
        );


    if(
        audioInput &&
        !audioInput.dataset.ggMediaBound
    ){

        audioInput.addEventListener(
            "change",
            function(){

                /*
                 * Selecting an audio file replaces
                 * any previous native recording.
                 */

                GGIrregularity.Media
                    ._nativeAudioUri =
                    null;


                GGIrregularity.Media
                    .previewAudio(
                        audioInput
                    );

            }
        );


        audioInput.dataset.ggMediaBound =
            "1";

    }


    /* ========================================================
       RECORD BUTTON
       ======================================================== */

    const recordButton =
        document.getElementById(
            "gg-irregularity-record-audio"
        );


    if(
        recordButton &&
        !recordButton.dataset.ggMediaBound
    ){

        recordButton.addEventListener(
            "click",
            function(){

                GGIrregularity.Media
                    .recordAudio();

            }
        );


        recordButton.dataset.ggMediaBound =
            "1";

    }


    /* ========================================================
       INITIAL BUTTON STATE
       ======================================================== */

    GGIrregularity.Media
        ._setRecordButton(
            false
        );


    console.log(
        "✅ Irregularity media events bound."
    );

};


/* ============================================================
   RESET ALL MEDIA
   ============================================================ */

GGIrregularity.Media.reset =
function(){

    /* ========================================================
       STOP RECORDER
       ======================================================== */

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
        catch(_){

        }

    }


    /* ========================================================
       STOP STREAM
       ======================================================== */

    GGIrregularity.Media
        ._stopAudioStream();


    /* ========================================================
       TIMER
       ======================================================== */

    GGIrregularity.Media
        ._clearAudioTimer();


    /* ========================================================
       OBJECT URLS
       ======================================================== */

    GGIrregularity.Media
        ._revoke(
            "photo"
        );


    GGIrregularity.Media
        ._revoke(
            "video"
        );


    GGIrregularity.Media
        ._revoke(
            "audio"
        );


    /* ========================================================
       STATE
       ======================================================== */

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


    /* ========================================================
       PHOTO INPUT
       ======================================================== */

    const photoInput =
        document.getElementById(
            "gg-irregularity-photo"
        );


    if(
        photoInput
    ){

        photoInput.value =
            "";

    }


    /* ========================================================
       PHOTO PREVIEW
       ======================================================== */

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


    /* ========================================================
       VIDEO INPUT
       ======================================================== */

    const videoInput =
        document.getElementById(
            "gg-irregularity-video"
        );


    if(
        videoInput
    ){

        videoInput.value =
            "";

    }


    /* ========================================================
       VIDEO PREVIEW
       ======================================================== */

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


    /* ========================================================
       AUDIO INPUT
       ======================================================== */

    const audioInput =
        document.getElementById(
            "gg-irregularity-audio"
        );


    if(
        audioInput
    ){

        audioInput.value =
            "";

    }


    /* ========================================================
       AUDIO PREVIEW
       ======================================================== */

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


    /* ========================================================
       TIMER
       ======================================================== */

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


    /* ========================================================
       BUTTON
       ======================================================== */

    GGIrregularity.Media
        ._setRecordButton(
            false
        );


    GGIrregularity.Media
        ._updateFormStatus();

};


/* ============================================================
   FINAL MEDIA STATUS
   ============================================================ */

GGIrregularity.Media.getStatus =
function(){

    const media =
        GGIrregularity.Media
            .getFormMedia();


    const status = {

        photo:
            !!media.photo,

        video:
            !!media.video,

        audio:
            !!(
                media.audio ||
                media.nativeAudioUri
            ),

        nativeAudio:
            !!media.nativeAudioUri,

        recording:
            !!GGIrregularity.Media
                ._recording

    };


    status.hasMedia =
        !!(
            status.photo ||
            status.video ||
            status.audio
        );


    return status;

};


/* ============================================================
   END PART 3/4
   ============================================================ */

/* ============================================================
   PART 4/4
   FINAL INITIALIZATION + COMPATIBILITY
   ============================================================ */


/* ============================================================
   MEDIA BUTTON HELPERS
   ============================================================ */

/*
 * These global helpers are intentionally small.
 *
 * They allow HTML onclick handlers to use the same
 * existing GGIrregularity.Media functions.
 */

window.ggIrregularityChangePhoto =
function(){

    GGIrregularity.Media
        .changePhoto();

};


window.ggIrregularityRemovePhoto =
function(){

    GGIrregularity.Media
        .removePhoto();

};


window.ggIrregularityChangeVideo =
function(){

    GGIrregularity.Media
        .changeVideo();

};


window.ggIrregularityRemoveVideo =
function(){

    GGIrregularity.Media
        .removeVideo();

};


window.ggIrregularityRecordAudio =
function(){

    GGIrregularity.Media
        .recordAudio();

};


window.ggIrregularityStopAudio =
function(){

    GGIrregularity.Media
        .stopRecording();

};


window.ggIrregularityRecordAgain =
function(){

    GGIrregularity.Media
        .recordAgain();

};


window.ggIrregularityRemoveAudio =
function(){

    GGIrregularity.Media
        .removeAudio();

};


window.ggIrregularitySelectAudio =
function(){

    GGIrregularity.Media
        .selectAudio();

};


/* ============================================================
   MEDIA UI VISIBILITY
   ============================================================ */

GGIrregularity.Media.updateControls =
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


    const photo =
        photoInput?.files?.[0] ||
        null;


    const video =
        videoInput?.files?.[0] ||
        null;


    const audio =
        audioInput?.files?.[0] ||
        null;


    const nativeAudio =
        GGIrregularity.Media
            ._nativeAudioUri ||
        null;


    /* ========================================================
       PHOTO CONTROLS
       ======================================================== */

    const photoActions =
        document.getElementById(
            "gg-irregularity-photo-actions"
        );


    if(
        photoActions
    ){

        photoActions.style.display =
            photo
                ? "flex"
                : "none";

    }


    /* ========================================================
       VIDEO CONTROLS
       ======================================================== */

    const videoActions =
        document.getElementById(
            "gg-irregularity-video-actions"
        );


    if(
        videoActions
    ){

        videoActions.style.display =
            video
                ? "flex"
                : "none";

    }


    /* ========================================================
       AUDIO CONTROLS
       ======================================================== */

    const audioActions =
        document.getElementById(
            "gg-irregularity-audio-actions"
        );


    if(
        audioActions
    ){

        audioActions.style.display =
            (
                audio ||
                nativeAudio
            )
                ? "flex"
                : "none";

    }


    /* ========================================================
       AUDIO FILE BUTTON
       ======================================================== */

    const selectAudioButton =
        document.getElementById(
            "gg-irregularity-select-audio"
        );


    if(
        selectAudioButton
    ){

        selectAudioButton.style.display =
            GGIrregularity.Media
                ._recording
                ? "none"
                : "inline-flex";

    }


    /* ========================================================
       RECORD BUTTON
       ======================================================== */

    const recordButton =
        document.getElementById(
            "gg-irregularity-record-audio"
        );


    if(
        recordButton
    ){

        recordButton.style.display =
            "inline-flex";

    }

};


/* ============================================================
   WRAP STATUS UPDATE
   ============================================================ */

GGIrregularity.Media._originalUpdateFormStatus =
    GGIrregularity.Media._originalUpdateFormStatus ||
    GGIrregularity.Media._updateFormStatus;


GGIrregularity.Media._updateFormStatus =
function(
    state
){

    if(
        typeof GGIrregularity.Media
            ._originalUpdateFormStatus ===
        "function"
    ){

        try{

            GGIrregularity.Media
                ._originalUpdateFormStatus(
                    state
                );

        }
        catch(error){

            console.warn(
                "⚠ Media status UI update failed:",
                error
            );

        }

    }


    try{

        GGIrregularity.Media
            .updateControls();

    }
    catch(error){

        console.warn(
            "⚠ Media controls update failed:",
            error
        );

    }

};


/* ============================================================
   WRAP PREVIEW FUNCTIONS
   ============================================================ */

/*
 * Make sure preview operations also refresh
 * the action buttons.
 */

GGIrregularity.Media._originalPreviewPhoto =
    GGIrregularity.Media._originalPreviewPhoto ||
    GGIrregularity.Media.previewPhoto;


GGIrregularity.Media.previewPhoto =
function(
    input
){

    const result =
        GGIrregularity.Media
            ._originalPreviewPhoto(
                input
            );


    GGIrregularity.Media
        .updateControls();


    return result;

};


GGIrregularity.Media._originalPreviewVideo =
    GGIrregularity.Media._originalPreviewVideo ||
    GGIrregularity.Media.previewVideo;


GGIrregularity.Media.previewVideo =
function(
    input
){

    const result =
        GGIrregularity.Media
            ._originalPreviewVideo(
                input
            );


    GGIrregularity.Media
        .updateControls();


    return result;

};


GGIrregularity.Media._originalPreviewAudio =
    GGIrregularity.Media._originalPreviewAudio ||
    GGIrregularity.Media.previewAudio;


GGIrregularity.Media.previewAudio =
function(
    input
){

    const result =
        GGIrregularity.Media
            ._originalPreviewAudio(
                input
            );


    GGIrregularity.Media
        .updateControls();


    return result;

};


/* ============================================================
   WRAP REMOVE FUNCTIONS
   ============================================================ */

GGIrregularity.Media._originalRemovePhoto =
    GGIrregularity.Media._originalRemovePhoto ||
    GGIrregularity.Media.removePhoto;


GGIrregularity.Media.removePhoto =
function(){

    const result =
        GGIrregularity.Media
            ._originalRemovePhoto();


    GGIrregularity.Media
        .updateControls();


    return result;

};


GGIrregularity.Media._originalRemoveVideo =
    GGIrregularity.Media._originalRemoveVideo ||
    GGIrregularity.Media.removeVideo;


GGIrregularity.Media.removeVideo =
function(){

    const result =
        GGIrregularity.Media
            ._originalRemoveVideo();


    GGIrregularity.Media
        .updateControls();


    return result;

};


GGIrregularity.Media._originalRemoveAudio =
    GGIrregularity.Media._originalRemoveAudio ||
    GGIrregularity.Media.removeAudio;


GGIrregularity.Media.removeAudio =
function(){

    const result =
        GGIrregularity.Media
            ._originalRemoveAudio();


    GGIrregularity.Media
        .updateControls();


    return result;

};


/* ============================================================
   WRAP RECORDING
   ============================================================ */

GGIrregularity.Media._originalRecordAudio =
    GGIrregularity.Media._originalRecordAudio ||
    GGIrregularity.Media.recordAudio;


GGIrregularity.Media.recordAudio =
async function(){

    const result =
        await GGIrregularity.Media
            ._originalRecordAudio();


    GGIrregularity.Media
        .updateControls();


    return result;

};


/* ============================================================
   WRAP RECORD AGAIN
   ============================================================ */

GGIrregularity.Media._originalRecordAgain =
    GGIrregularity.Media._originalRecordAgain ||
    GGIrregularity.Media.recordAgain;


GGIrregularity.Media.recordAgain =
function(){

    const result =
        GGIrregularity.Media
            ._originalRecordAgain();


    GGIrregularity.Media
        .updateControls();


    return result;

};


/* ============================================================
   WRAP RESET
   ============================================================ */

GGIrregularity.Media._originalReset =
    GGIrregularity.Media._originalReset ||
    GGIrregularity.Media.reset;


GGIrregularity.Media.reset =
function(){

    const result =
        GGIrregularity.Media
            ._originalReset();


    GGIrregularity.Media
        .updateControls();


    return result;

};


/* ============================================================
   BIND MEDIA EVENTS SAFELY
   ============================================================ */

GGIrregularity.Media.init =
function(){

    try{

        GGIrregularity.Media
            .bindEvents();

    }
    catch(error){

        console.error(
            "❌ Irregularity Media event binding failed:",
            error
        );

    }


    try{

        GGIrregularity.Media
            .updateControls();

    }
    catch(error){

        console.warn(
            "⚠ Irregularity Media controls could not be initialized:",
            error
        );

    }


    console.log(
        "✅ GGIrregularity.Media initialized."
    );


    return true;

};


/* ============================================================
   DELAYED INIT
   ============================================================ */

GGIrregularity.Media._domReadyHandler =
function(){

    try{

        GGIrregularity.Media
            .init();

    }
    catch(error){

        console.error(
            "❌ GGIrregularity.Media init error:",
            error
        );

    }

};


if(
    document.readyState ===
    "loading"
){

    document.addEventListener(
        "DOMContentLoaded",
        GGIrregularity.Media
            ._domReadyHandler,
        {
            once:true
        }
    );

}
else{

    /*
     * The script can load before the modal/form is
     * dynamically inserted, so initialize now and
     * initialize again when the form opens through
     * irregularityUI.js.
     */

    GGIrregularity.Media
        ._domReadyHandler();

}


/* ============================================================
   RE-BIND WHEN IRREGULARITY FORM IS OPENED
   ============================================================ */

GGIrregularity.Media.refresh =
function(){

    try{

        GGIrregularity.Media
            .bindEvents();

    }
    catch(error){

        console.warn(
            "⚠ Irregularity media rebind failed:",
            error
        );

    }


    try{

        GGIrregularity.Media
            .updateControls();

    }
    catch(error){

        console.warn(
            "⚠ Irregularity media control refresh failed:",
            error
        );

    }

};


/* ============================================================
   GLOBAL REFRESH HELPER
   ============================================================ */

window.refreshIrregularityMedia =
function(){

    GGIrregularity.Media
        .refresh();

};


/* ============================================================
   DEBUG
   ============================================================ */

GGIrregularity.Media.debug =
function(){

    const media =
        GGIrregularity.Media
            .getFormMedia();


    const status =
        GGIrregularity.Media
            .getStatus();


    console.group(
        "⚠️ IRREGULARITY MEDIA DEBUG"
    );


    console.log(
        "Photo:",
        media.photo
    );


    console.log(
        "Video:",
        media.video
    );


    console.log(
        "Audio:",
        media.audio
    );


    console.log(
        "Native Audio URI:",
        media.nativeAudioUri
    );


    console.log(
        "Status:",
        status
    );


    console.log(
        "Firebase Storage:",
        !!window.storage
    );


    console.log(
        "Firebase DB:",
        !!window.db
    );


    console.log(
        "Firebase API:",
        !!window.fb
    );


    console.groupEnd();


    return {

        media:
            media,

        status:
            status,

        firebase:
            {

                storage:
                    !!window.storage,

                db:
                    !!window.db,

                fb:
                    !!window.fb

            }

    };

};


/* ============================================================
   FINAL SAFETY CHECK
   ============================================================ */

(function(){

    const requiredFunctions = [

        "getStorageRoot",

        "uploadBlob",

        "upload",

        "updateFirestore",

        "previewPhoto",

        "changePhoto",

        "removePhoto",

        "previewVideo",

        "changeVideo",

        "removeVideo",

        "recordAudio",

        "stopRecording",

        "recordAgain",

        "removeAudio",

        "getFormMedia"

    ];


    const missing =
        requiredFunctions.filter(
            function(name){

                return typeof GGIrregularity.Media[name] !==
                    "function";

            }
        );


    if(
        missing.length
    ){

        console.error(
            "❌ GGIrregularity.Media missing functions:",
            missing
        );

    }
    else{

        console.log(
            "✅ GGIrregularity.Media — all required functions available."
        );

    }

})();


/* ============================================================
   FINAL LOAD MESSAGE
   ============================================================ */

console.log(
    "=================================================="
);


console.log(
    "✅ irregularityMedia.js FULLY LOADED"
);


console.log(
    "📷 Photo:",
    typeof GGIrregularity.Media.previewPhoto
);


console.log(
    "🎥 Video:",
    typeof GGIrregularity.Media.previewVideo
);


console.log(
    "🎙 Audio:",
    typeof GGIrregularity.Media.recordAudio
);


console.log(
    "⬆️ Upload:",
    typeof GGIrregularity.Media.upload
);


console.log(
    "🔥 Firestore Update:",
    typeof GGIrregularity.Media.updateFirestore
);


console.log(
    "=================================================="
);


/* ============================================================
   END irregularityMedia.js
   ============================================================ */
