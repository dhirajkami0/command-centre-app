/* ============================================================
   🌲 GREENGUARD
   IRREGULARITY MEDIA MODULE
   ============================================================

   FILE:
       js/irregularity/irregularityMedia.js

   PURPOSE:
       Upload Irregularity / Offence / Observation media
       to the EXISTING GreenGuard Firebase Storage system.

   SUPPORTED:
       • Photo
       • Video
       • Audio

   IMPORTANT
   ------------------------------------------------------------
   • No Firebase initialization
   • No Apps Script
   • No new Firebase app
   • No new Storage instance
   • Uses existing window.storage
   • Uses existing window.db
   • Uses existing window.fb
   • Does NOT modify Wildlife
   • Does NOT modify Elephant
   • Does NOT modify window.latestGps
   • Does NOT resolve GIS

   FIRESTORE MEDIA FIELDS:
       photo_url
       video_url
       audio_url
       photo_storage_path
       video_storage_path
       audio_storage_path
       media_status

   STORAGE:
       irregularities/
           {financialYear}/
               {firestoreId}/
                   photo/
                   video/
                   audio/

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
   ============================================================

   IMPORTANT:
   ------------------------------------------------------------
   We NEVER initialize Firebase here.

   We only wait for the existing GreenGuard Firebase system.

   ============================================================ */

GGIrregularity.Media.waitForFirebase =
async function(){

    /* ========================================================
       ALREADY READY
       ======================================================== */

    if(
        window.db &&
        window.fb &&
        window.storage
    ){

        return;

    }


    /* ========================================================
       USE EXISTING READINESS FUNCTION
       ======================================================== */

    if(
        typeof window.waitForFirebaseReady ===
        "function"
    ){

        await window.waitForFirebaseReady();

    }


    /* ========================================================
       FINAL VALIDATION
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
       ROOT
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
   UPLOAD FILE / BLOB
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


    /* ========================================================
       FILE / BLOB
       ======================================================== */

    if(
        mediaFile instanceof Blob
    ){

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


        /* ====================================================
           EXISTING DOWNLOAD BEHAVIOUR
           ==================================================== */

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
            "⬆️ Irregularity media upload:",
            {

                mediaType:
                    mediaType,

                storagePath:
                    storagePath,

                size:
                    mediaFile.size,

                mime:
                    mediaFile.type

            }
        );


        /* ====================================================
           UPLOAD
           ==================================================== */

        const uploadResult =
            await window.fb.uploadBytes(
                storageRef,
                mediaFile,
                metadata
            );


        /* ====================================================
           DOWNLOAD URL
           ==================================================== */

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

    }


    /* ========================================================
       DATA URL
       ======================================================== */

    if(
        typeof mediaFile ===
        "string" &&
        mediaFile.startsWith(
            "data:"
        )
    ){

        const fileName =
            GGIrregularity.Media.safeFileName(
                fallbackName,
                mediaType + ".bin"
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


        /* ====================================================
           CONTENT TYPE
           ==================================================== */

        let contentType =
            "application/octet-stream";


        if(
            mediaType ===
            "photo"
        ){

            contentType =
                "image/jpeg";

        }
        else if(
            mediaType ===
            "video"
        ){

            contentType =
                "video/mp4";

        }
        else if(
            mediaType ===
            "audio"
        ){

            contentType =
                "audio/mp4";

        }


        /* ====================================================
           METADATA
           ==================================================== */

        const metadata = {

            contentType:
                contentType,

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
            "⬆️ Uploading Irregularity data URL:",
            mediaType
        );


        const uploadResult =
            await window.fb.uploadString(
                storageRef,
                mediaFile,
                "data_url",
                metadata
            );


        const url =
            await window.fb.getDownloadURL(
                uploadResult.ref
            );


        return {

            url:
                url,

            path:
                storagePath

        };

    }


    /* ========================================================
       UNSUPPORTED
       ======================================================== */

    console.warn(
        "⚠ Unsupported Irregularity media:",
        mediaFile
    );


    return null;

};


/* ============================================================
   GET MEDIA FROM FORM
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
            null

    };

};


/* ============================================================
   CHECK WHETHER MEDIA EXISTS
   ============================================================ */

GGIrregularity.Media.hasMedia =
function(){

    const media =
        GGIrregularity.Media.getFormMedia();


    return !!(
        media.photo ||
        media.video ||
        media.audio
    );

};


/* ============================================================
   UPLOAD ALL IRREGULARITY MEDIA
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
           FIREBASE
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


        console.log(
            "📁 Irregularity Storage Root:",
            storageInfo.root
        );


        /* ====================================================
           FORM MEDIA
           ==================================================== */

        const formMedia =
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
           AUDIO
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
           MEDIA COUNT
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


        /* ====================================================
           STATUS
           ==================================================== */

        result.media_status =
            mediaCount > 0
                ? "COMPLETE"
                : "NONE";


        /* ====================================================
           RESULT
           ==================================================== */

        console.log(
            "📦 IRREGULARITY MEDIA RESULT:",
            result
        );


        console.groupEnd();


        return result;

    }
    catch(
        error
    ){

        console.error(
            "❌ Irregularity media upload failed:",
            error
        );


        console.groupEnd();


        throw error;

    }

};


/* ============================================================
   UPDATE IRREGULARITY FIRESTORE MEDIA
   ============================================================ */

GGIrregularity.Media.updateFirestore =
async function(
    firestoreId,
    mediaResult
){

    /* ========================================================
       VALIDATE FIREBASE
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
       DOCUMENT
       ======================================================== */

    const irregularityRef =
        window.fb.doc(
            window.db,
            "irregularities",
            firestoreId
        );


    /* ========================================================
       UPDATE SAME DOCUMENT
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

            collection:
                "irregularities",

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

    const inputIds = [

        "gg-irregularity-photo",

        "gg-irregularity-video",

        "gg-irregularity-audio"

    ];


    inputIds.forEach(
        function(
            id
        ){

            const input =
                document.getElementById(
                    id
                );


            if(
                input
            ){

                input.value =
                    "";

            }

        }
    );


    const status =
        document.getElementById(
            "gg-irregularity-media-status"
        );


    if(
        status
    ){

        status.textContent =
            "No media selected.";

    }

};


/* ============================================================
   END
   ============================================================ */
