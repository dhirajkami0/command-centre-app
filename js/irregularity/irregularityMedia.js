/* ============================================================
   🌲 GREENGUARD
   IRREGULARITY MEDIA MODULE
   ============================================================

   FILE:
       js/irregularity/irregularityMedia.js

   PURPOSE:
       Photo / Video / Audio handling for:

           IRREGULARITY
           OFFENCE
           OBSERVATION

   MEDIA FLOW:

       PHOTO
          ↓
       Preview
          ↓
       Change / Remove
          ↓
       Firebase Storage

       VIDEO
          ↓
       Preview
          ↓
       Change / Remove
          ↓
       Firebase Storage

       AUDIO
          ↓
       Native Android recorder
          OR
       Browser MediaRecorder fallback
          ↓
       Preview
          ↓
       Record Again / Remove
          ↓
       Firebase Storage

   IMPORTANT
   ------------------------------------------------------------
   • Does NOT initialize Firebase
   • Does NOT create Firebase app
   • Does NOT create Storage instance
   • Uses existing window.storage
   • Uses existing window.fb
   • Does NOT modify window.latestGps
   • Does NOT resolve GIS
   • Does NOT modify Wildlife
   • Does NOT modify Elephant
   • Does NOT create another submit handler

   ============================================================ */


/* ============================================================
   GLOBAL NAMESPACE
   ============================================================ */

window.GGIrregularity =
    window.GGIrregularity || {};


GGIrregularity.Media =
    GGIrregularity.Media || {};


/* ============================================================
   CONSTANTS
   ============================================================ */

GGIrregularity.Media.ROOT =
    "irregularities";

GGIrregularity.Media.TYPE =
    "irregularity";


/* ============================================================
   MEDIA STATE
   ============================================================ */

GGIrregularity.Media._objectUrls =
    GGIrregularity.Media._objectUrls || {

        photo: null,

        video: null,

        audio: null

    };


GGIrregularity.Media._audioRecorder =
    null;


GGIrregularity.Media._audioChunks =
    [];


GGIrregularity.Media._recording =
    false;


GGIrregularity.Media._nativeAudioUri =
    null;


GGIrregularity.Media._nativeAudioActive =
    false;


/* ============================================================
   SAFE TEXT
   ============================================================ */

GGIrregularity.Media.safeText =
function(value){

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
     * NEVER initialize Firebase here.
     */

    if(
        window.db &&
        window.fb &&
        window.storage
    ){

        return;

    }


    if(
        typeof window.waitForFirebaseReady ===
        "function"
    ){

        await window.waitForFirebaseReady();

    }


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
   VALIDATE STORAGE API
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


    const requiredFunctions = [

        "ref",

        "uploadBytes",

        "getDownloadURL"

    ];


    requiredFunctions.forEach(
        function(name){

            if(
                typeof window.fb[name] !==
                "function"
            ){

                throw new Error(
                    "Firebase Storage function unavailable: " +
                    name
                );

            }

        }
    );

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
   REVOKE OBJECT URL
   ============================================================ */

GGIrregularity.Media._revoke =
function(type){

    const url =
        GGIrregularity.Media._objectUrls?.[type];


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


    if(
        GGIrregularity.Media._objectUrls
    ){

        GGIrregularity.Media._objectUrls[type] =
            null;

    }

};


/* ============================================================
   ASSIGN FILE TO INPUT
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

        const dataTransfer =
            new DataTransfer();


        dataTransfer.items.add(
            file
        );


        input.files =
            dataTransfer.files;


        return true;

    }
    catch(error){

        console.warn(
            "⚠ Unable to assign media file:",
            error
        );


        return false;

    }

};


/* ============================================================
   STORAGE ROOT
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


    let financialYear =
        GGIrregularity.Media.safeText(
            payload?.financial_year
        );


    if(
        !financialYear
    ){

        const now =
            new Date();


        const year =
            now.getFullYear();


        const month =
            now.getMonth() + 1;


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


    return {

        financialYear:
            financialYear,

        root:
            GGIrregularity.Media.ROOT +
            "/" +
            financialYear +
            "/" +
            firestoreId

    };

};


/* ============================================================
   PHOTO PREVIEW
   ============================================================ */

GGIrregularity.Media.previewPhoto =
function(input){

    const file =
        input?.files?.[0] ||
        null;


    if(
        !file
    ){

        return;

    }


    if(
        !file.type.startsWith("image/")
    ){

        alert(
            "Please select a valid image."
        );

        input.value = "";

        return;

    }


    GGIrregularity.Media._revoke(
        "photo"
    );


    const preview =
        document.getElementById(
            "gg-irregularity-photo-preview"
        );


    const image =
        document.getElementById(
            "gg-irregularity-photo-preview-img"
        );


    if(
        !preview ||
        !image
    ){

        return;

    }


    const url =
        URL.createObjectURL(
            file
        );


    GGIrregularity.Media._objectUrls.photo =
        url;


    image.src =
        url;


    preview.style.display =
        "block";


    console.log(
        "📷 Irregularity photo ready:",
        file.name
    );

};


/* ============================================================
   REMOVE PHOTO
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


    const preview =
        document.getElementById(
            "gg-irregularity-photo-preview"
        );


    const image =
        document.getElementById(
            "gg-irregularity-photo-preview-img"
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

};


/* ============================================================
   VIDEO PREVIEW
   ============================================================ */

GGIrregularity.Media.previewVideo =
function(input){

    const file =
        input?.files?.[0] ||
        null;


    if(
        !file
    ){

        return;

    }


    if(
        !file.type.startsWith("video/")
    ){

        alert(
            "Please select a valid video."
        );

        input.value = "";

        return;

    }


    GGIrregularity.Media._revoke(
        "video"
    );


    const preview =
        document.getElementById(
            "gg-irregularity-video-preview"
        );


    const player =
        document.getElementById(
            "gg-irregularity-video-preview-player"
        );


    if(
        !preview ||
        !player
    ){

        return;

    }


    const url =
        URL.createObjectURL(
            file
        );


    GGIrregularity.Media._objectUrls.video =
        url;


    player.src =
        url;


    player.load();


    preview.style.display =
        "block";


    console.log(
        "🎥 Irregularity video ready:",
        file.name
    );

};


/* ============================================================
   REMOVE VIDEO
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


    const preview =
        document.getElementById(
            "gg-irregularity-video-preview"
        );


    const player =
        document.getElementById(
            "gg-irregularity-video-preview-player"
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


        player.load();

    }


    if(
        preview
    ){

        preview.style.display =
            "none";

    }

};


/* ============================================================
   AUDIO PREVIEW
   ============================================================ */

GGIrregularity.Media.previewAudio =
function(input){

    const file =
        input?.files?.[0] ||
        null;


    if(
        !file
    ){

        return;

    }


    if(
        !file.type.startsWith("audio/")
    ){

        alert(
            "Please select a valid audio file."
        );

        input.value = "";

        return;

    }


    GGIrregularity.Media._nativeAudioUri =
        null;


    GGIrregularity.Media._revoke(
        "audio"
    );


    const preview =
        document.getElementById(
            "gg-irregularity-audio-preview"
        );


    const player =
        document.getElementById(
            "gg-irregularity-audio-preview-player"
        );


    if(
        !preview ||
        !player
    ){

        return;

    }


    const url =
        URL.createObjectURL(
            file
        );


    GGIrregularity.Media._objectUrls.audio =
        url;


    player.src =
        url;


    player.load();


    preview.style.display =
        "block";


    console.log(
        "🎙 Irregularity audio ready:",
        file.name
    );

};


/* ============================================================
   NATIVE AUDIO RECORDER
   ============================================================ */

GGIrregularity.Media.recordAudio =
async function(){

    /*
     * Prevent double invocation.
     */

    if(
        GGIrregularity.Media._recording ||
        GGIrregularity.Media._nativeAudioActive
    ){

        return;

    }


    /* ========================================================
       NATIVE ANDROID
       ======================================================== */

    if(
        typeof window.Android !==
        "undefined" &&
        typeof window.Android.startVoiceRecorder ===
        "function"
    ){

        console.log(
            "🎙 Launching native GreenGuard audio recorder..."
        );


        GGIrregularity.Media._nativeAudioActive =
            true;


        window.currentIrregularityAudioType =
            "irregularity";


        window.currentSightingAudioType =
            "irregularity";


        try{

            window.Android.startVoiceRecorder();

            return;

        }
        catch(error){

            console.error(
                "❌ Native audio recorder failed:",
                error
            );


            GGIrregularity.Media._nativeAudioActive =
                false;

        }

    }


    /* ========================================================
       BROWSER FALLBACK
       ======================================================== */

    if(
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !==
        "function"
    ){

        alert(
            "Audio recording is not supported on this device."
        );

        return;

    }


    let stream =
        null;


    try{

        stream =
            await navigator.mediaDevices.getUserMedia(
                {
                    audio:true
                }
            );


        const mimeCandidates = [

            "audio/mp4",

            "audio/webm;codecs=opus",

            "audio/webm",

            "audio/ogg;codecs=opus"

        ];


        let mimeType =
            "";


        if(
            typeof MediaRecorder.isTypeSupported ===
            "function"
        ){

            for(
                const candidate of
                mimeCandidates
            ){

                if(
                    MediaRecorder.isTypeSupported(
                        candidate
                    )
                ){

                    mimeType =
                        candidate;

                    break;

                }

            }

        }


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


        GGIrregularity.Media._audioRecorder =
            recorder;


        GGIrregularity.Media._audioChunks =
            [];


        GGIrregularity.Media._recording =
            true;


        recorder.ondataavailable =
        function(event){

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


        recorder.onerror =
        function(event){

            console.error(
                "❌ Irregularity audio recorder error:",
                event
            );

        };


        recorder.onstop =
        function(){

            try{

                const type =
                    recorder.mimeType ||
                    mimeType ||
                    "audio/webm";


                const extension =
                    type.includes("mp4")
                        ? "m4a"
                        : type.includes("ogg")
                            ? "ogg"
                            : "webm";


                const blob =
                    new Blob(
                        GGIrregularity.Media
                            ._audioChunks,
                        {
                            type:
                                type
                        }
                    );


                const file =
                    new File(
                        [blob],
                        "irregularity_audio_" +
                        Date.now() +
                        "." +
                        extension,
                        {
                            type:
                                type,

                            lastModified:
                                Date.now()
                        }
                    );


                const input =
                    document.getElementById(
                        "gg-irregularity-audio"
                    );


                GGIrregularity.Media
                    ._setInputFile(
                        input,
                        file
                    );


                GGIrregularity.Media
                    .previewAudio(
                        input
                    );


                console.log(
                    "✅ Browser audio recording ready:",
                    file.name
                );

            }
            catch(error){

                console.error(
                    "❌ Audio processing failed:",
                    error
                );

            }
            finally{

                stream
                    ?.getTracks
                    ?.()
                    .forEach(
                        function(track){

                            try{

                                track.stop();

                            }
                            catch(_){

                            }

                        }
                    );


                GGIrregularity.Media._recording =
                    false;


                GGIrregularity.Media._audioRecorder =
                    null;


                GGIrregularity.Media._audioChunks =
                    [];

            }

        };


        recorder.start();


        console.log(
            "🎙 Browser audio recording started"
        );


        const button =
            document.querySelector(
                "#ggIrregularityForm button[onclick*='recordAudio']"
            );


        if(
            button
        ){

            button.textContent =
                "⏹ STOP RECORDING";


            button.onclick =
            function(){

                if(
                    recorder.state ===
                    "recording"
                ){

                    recorder.stop();

                    button.textContent =
                        "🎙 RECORD AUDIO";

                }

            };

        }


        recorder.__ggStartedAt =
            Date.now();


        const timer =
            setInterval(
                function(){

                    if(
                        !GGIrregularity.Media
                            ._recording
                    ){

                        clearInterval(
                            timer
                        );

                        return;

                    }


                    if(
                        recorder.state !==
                        "recording"
                    ){

                        clearInterval(
                            timer
                        );

                        return;

                    }


                    const elapsed =
                        Math.floor(
                            (
                                Date.now() -
                                recorder.__ggStartedAt
                            ) /
                            1000
                        );


                    if(
                        elapsed >= 60
                    ){

                        recorder.stop();


                        clearInterval(
                            timer
                        );

                    }

                },
                500
            );

    }
    catch(error){

        console.error(
            "❌ Unable to start browser audio:",
            error
        );


        stream
            ?.getTracks
            ?.()
            .forEach(
                function(track){

                    try{

                        track.stop();

                    }
                    catch(_){

                    }

                }
            );


        GGIrregularity.Media._recording =
            false;


        GGIrregularity.Media._audioRecorder =
            null;


        alert(
            "Unable to start audio recording. Please allow microphone access."
        );

    }

};


/* ============================================================
   NATIVE AUDIO RESULT
   ------------------------------------------------------------
   Android calls:

       window.onNativeAudioRecorded(uri)

   We preserve any existing Wildlife / Elephant handler.
   ============================================================ */

GGIrregularity.Media._previousNativeAudioHandler =
    window.onNativeAudioRecorded;


/* ============================================================
   HANDLE NATIVE AUDIO
   ============================================================ */

GGIrregularity.Media.handleNativeAudio =
function(uri){

    try{

        console.log(
            "🎙 Native Irregularity audio received:",
            uri
        );


        GGIrregularity.Media
            ._nativeAudioActive =
            false;


        if(
            !uri
        ){

            console.warn(
                "⚠ Native audio recording cancelled."
            );

            return;

        }


        /*
         * Store URI.
         *
         * This is important because Android's native
         * AudioActivity may return a file/content URI rather
         * than a browser File object.
         */

        GGIrregularity.Media
            ._nativeAudioUri =
            String(uri);


        /*
         * Remove previous browser object URL.
         */

        GGIrregularity.Media._revoke(
            "audio"
        );


        /*
         * Update audio player directly.
         */

        const preview =
            document.getElementById(
                "gg-irregularity-audio-preview"
            );


        const player =
            document.getElementById(
                "gg-irregularity-audio-preview-player"
            );


        if(
            player
        ){

            player.src =
                String(uri);

            player.load();

        }


        if(
            preview
        ){

            preview.style.display =
                "block";

        }


        console.log(
            "✅ Native Irregularity audio preview ready."
        );

    }
    catch(error){

        console.error(
            "❌ Native Irregularity audio processing failed:",
            error
        );

    }

};


/* ============================================================
   INSTALL CALLBACK SAFELY
   ============================================================ */

window.onNativeAudioRecorded =
function(uri){

    /*
     * Irregularity requested native audio.
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
     * Otherwise preserve existing
     * Wildlife / Elephant behavior.
     */

    if(
        typeof GGIrregularity.Media
            ._previousNativeAudioHandler ===
        "function"
    ){

        try{

            GGIrregularity.Media
                ._previousNativeAudioHandler(
                    uri
                );

        }
        catch(error){

            console.error(
                "❌ Existing native audio handler failed:",
                error
            );

        }

    }

};


/* ============================================================
   RECORD AGAIN
   ============================================================ */

GGIrregularity.Media.recordAgain =
function(){

    GGIrregularity.Media.removeAudio();

    setTimeout(
        function(){

            GGIrregularity.Media
                .recordAudio();

        },
        100
    );

};


/* ============================================================
   REMOVE AUDIO
   ============================================================ */

GGIrregularity.Media.removeAudio =
function(){

    /*
     * Stop browser recorder.
     */

    if(
        GGIrregularity.Media._audioRecorder &&
        GGIrregularity.Media._recording
    ){

        try{

            GGIrregularity.Media
                ._audioRecorder
                .stop();

        }
        catch(_){

        }

    }


    GGIrregularity.Media._recording =
        false;


    GGIrregularity.Media._nativeAudioActive =
        false;


    GGIrregularity.Media._nativeAudioUri =
        null;


    GGIrregularity.Media._revoke(
        "audio"
    );


    const input =
        document.getElementById(
            "gg-irregularity-audio"
        );


    const preview =
        document.getElementById(
            "gg-irregularity-audio-preview"
        );


    const player =
        document.getElementById(
            "gg-irregularity-audio-preview-player"
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


        player.load();

    }


    if(
        preview
    ){

        preview.style.display =
            "none";

    }


    window.currentIrregularityAudioType =
        null;


    window.currentSightingAudioType =
        null;


    console.log(
        "🗑 Irregularity audio removed."
    );

};


/* ============================================================
   CLEAR ALL MEDIA
   ============================================================ */

GGIrregularity.Media.clearFormMedia =
function(){

    GGIrregularity.Media.removePhoto();

    GGIrregularity.Media.removeVideo();

    GGIrregularity.Media.removeAudio();

};


/* ============================================================
   GET FORM MEDIA
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


    const photo =
        photoInput?.files?.[0] ||
        null;


    const video =
        videoInput?.files?.[0] ||
        null;


    const audio =
        audioInput?.files?.[0] ||
        null;


    return {

        photo:

            photo,

        video:

            video,

        audio:

            audio,

        nativeAudioUri:

            GGIrregularity.Media
                ._nativeAudioUri ||
            null

    };

};


/* ============================================================
   HAS MEDIA
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
   UPLOAD NORMAL FILE / BLOB
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
        !mediaFile
    ){

        return null;

    }


    if(
        !(mediaFile instanceof Blob)
    ){

        return null;

    }


    const fileName =
        GGIrregularity.Media.safeFileName(
            mediaFile.name,
            fallbackName
        );


    const storagePath =
        storageRoot +
        "/" +
        mediaType +
        "/" +
        Date.now() +
        "_" +
        fileName;


    const storageRef =
        window.fb.ref(
            window.storage,
            storagePath
        );


    const metadata = {

        contentType:
            mediaFile.type ||
            "application/octet-stream",

        contentDisposition:
            "attachment; filename=\"" +
            fileName +
            "\"",

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

            name:
                fileName,

            size:
                mediaFile.size,

            type:
                mediaFile.type,

            path:
                storagePath
        }
    );


    const uploadResult =
        await window.fb.uploadBytes(
            storageRef,
            mediaFile,
            metadata
        );


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


    /*
     * First try fetching the native URI.
     *
     * This works when Android exposes the returned URI
     * to the WebView.
     */

    let response;


    try{

        response =
            await fetch(
                String(uri)
            );

    }
    catch(error){

        console.error(
            "❌ Unable to access native audio URI:",
            error
        );


        throw new Error(
            "Native audio file could not be accessed."
        );

    }


    if(
        !response.ok
    ){

        throw new Error(
            "Native audio file could not be read."
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


    const extension =
        mimeType.includes("webm")
            ? "webm"
            : mimeType.includes("ogg")
                ? "ogg"
                : "m4a";


    const file =
        new File(
            [blob],
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


    return GGIrregularity.Media.uploadBlob(

        file,

        "audio",

        storageRoot,

        "audio." + extension,

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

        await GGIrregularity.Media
            .waitForFirebase();


        GGIrregularity.Media
            .validateStorage();


        const storageInfo =
            GGIrregularity.Media
                .getStorageRoot(
                    payload
                );


        console.log(
            "📁 Storage root:",
            storageInfo.root
        );


        const formMedia =
            GGIrregularity.Media
                .getFormMedia();


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
            formMedia.photo
        ){

            const uploadedPhoto =
                await GGIrregularity.Media
                    .uploadBlob(

                        formMedia.photo,

                        "photo",

                        storageInfo.root,

                        "photo.jpg",

                        payload

                    );


            if(
                uploadedPhoto
            ){

                result.photo_url =
                    uploadedPhoto.url;


                result.photo_storage_path =
                    uploadedPhoto.path;

            }

        }


        /* ====================================================
           VIDEO
           ==================================================== */

        if(
            formMedia.video
        ){

            const uploadedVideo =
                await GGIrregularity.Media
                    .uploadBlob(

                        formMedia.video,

                        "video",

                        storageInfo.root,

                        "video.mp4",

                        payload

                    );


            if(
                uploadedVideo
            ){

                result.video_url =
                    uploadedVideo.url;


                result.video_storage_path =
                    uploadedVideo.path;

            }

        }


        /* ====================================================
           AUDIO — NORMAL FILE
           ==================================================== */

        if(
            formMedia.audio
        ){

            const uploadedAudio =
                await GGIrregularity.Media
                    .uploadBlob(

                        formMedia.audio,

                        "audio",

                        storageInfo.root,

                        "audio.m4a",

                        payload

                    );


            if(
                uploadedAudio
            ){

                result.audio_url =
                    uploadedAudio.url;


                result.audio_storage_path =
                    uploadedAudio.path;

            }

        }


        /* ====================================================
           AUDIO — NATIVE URI
           ==================================================== */

        else if(
            formMedia.nativeAudioUri
        ){

            console.log(
                "🎙 Uploading native Android audio URI..."
            );


            const uploadedNativeAudio =
                await GGIrregularity.Media
                    .uploadNativeAudio(

                        formMedia.nativeAudioUri,

                        storageInfo.root,

                        payload

                    );


            if(
                uploadedNativeAudio
            ){

                result.audio_url =
                    uploadedNativeAudio.url;


                result.audio_storage_path =
                    uploadedNativeAudio.path;

            }

        }


        /* ====================================================
           MEDIA STATUS
           ==================================================== */

        const mediaCount =

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
            mediaCount > 0
                ? "COMPLETE"
                : "NONE";


        console.log(
            "📦 FINAL IRREGULARITY MEDIA:",
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


    const irregularityRef =
        window.fb.doc(
            window.db,
            "irregularities",
            firestoreId
        );


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
   CLEAR FORM MEDIA
   ============================================================ */

GGIrregularity.Media.clearForm =
function(){

    GGIrregularity.Media
        .clearFormMedia();

};


/* ============================================================
   DEBUG HELPER
   ============================================================ */

GGIrregularity.Media.debug =
function(){

    const media =
        GGIrregularity.Media
            .getFormMedia();


    console.log(
        "🔎 IRREGULARITY MEDIA DEBUG",
        {

            photo:
                media.photo
                    ? {
                        name:
                            media.photo.name,

                        type:
                            media.photo.type,

                        size:
                            media.photo.size
                    }
                    : null,

            video:
                media.video
                    ? {
                        name:
                            media.video.name,

                        type:
                            media.video.type,

                        size:
                            media.video.size
                    }
                    : null,

            audio:
                media.audio
                    ? {
                        name:
                            media.audio.name,

                        type:
                            media.audio.type,

                        size:
                            media.audio.size
                    }
                    : null,

            nativeAudioUri:
                media.nativeAudioUri

        }
    );


    return media;

};


/* ============================================================
   READY
   ============================================================ */

console.log(
    "✅ GGIrregularity.Media loaded",
    {
        photo:
            typeof GGIrregularity.Media.previewPhoto,

        video:
            typeof GGIrregularity.Media.previewVideo,

        audio:
            typeof GGIrregularity.Media.recordAudio,

        upload:
            typeof GGIrregularity.Media.upload,

        nativeRecorder:
            typeof window.Android?.startVoiceRecorder
    }
);


/* ============================================================
   END
   ============================================================ */
