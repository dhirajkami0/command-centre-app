/* ============================================================
   🌲 GREENGUARD
   IRREGULARITY GIS RESOLVER
   ============================================================ */

(function (window) {

    "use strict";


    window.GreenGuard =
        window.GreenGuard ||
        {};


    const GG =
        window.GreenGuard;


    if (
        GG.IrregularityGIS
    ) {

        console.warn(
            "⚠️ IrregularityGIS already loaded."
        );

        return;

    }


    // ========================================================
    // NUMBER NORMALIZER
    // ========================================================

    function numberOrNull(
        value
    ) {

        const number =
            Number(
                value
            );


        return Number.isFinite(
            number
        )
            ? number
            : null;

    }


    // ========================================================
    // GET CURRENT PROFILE
    // ========================================================

    function getProfile() {

        return (
            window.userProfile ||
            {}
        );

    }


    // ========================================================
    // GET DUTY STATE
    // ========================================================

    function getDutyState() {

        return {

            active:
                !!(
                    window.isDutyActive ||
                    window.dutyActive
                ),

            sessionId:
                String(
                    window.currentSessionId ||
                    window.sessionId ||
                    window.GG_SESSION_ID ||
                    ""
                )
                .trim()

        };

    }


    // ========================================================
    // GPS FROM CURRENT MAP / APP STATE
    // ========================================================

    function getCurrentGPS() {

        // ----------------------------------------------------
        // Existing application values
        // ----------------------------------------------------

        const latitude =
            numberOrNull(
                window.currentLatitude ??
                window.currentLat ??
                window.lastLatitude
            );


        const longitude =
            numberOrNull(
                window.currentLongitude ??
                window.currentLon ??
                window.lastLongitude
            );


        const accuracy =
            numberOrNull(
                window.currentGPSAccuracy ??
                window.gpsAccuracy ??
                window.lastGPSAccuracy
            );


        if (
            latitude !== null &&
            longitude !== null
        ) {

            return {

                latitude:
                    latitude,

                longitude:
                    longitude,

                accuracy:
                    accuracy

            };

        }


        // ----------------------------------------------------
        // Browser fallback
        // ----------------------------------------------------

        return new Promise(
            function(resolve){

                if (
                    !navigator.geolocation
                ) {

                    resolve({

                        latitude:
                            null,

                        longitude:
                            null,

                        accuracy:
                            null

                    });

                    return;

                }


                navigator.geolocation
                    .getCurrentPosition(

                        function(position){

                            resolve({

                                latitude:
                                    numberOrNull(
                                        position.coords.latitude
                                    ),

                                longitude:
                                    numberOrNull(
                                        position.coords.longitude
                                    ),

                                accuracy:
                                    numberOrNull(
                                        position.coords.accuracy
                                    )

                            });

                        },

                        function(){

                            resolve({

                                latitude:
                                    null,

                                longitude:
                                    null,

                                accuracy:
                                    null

                            });

                        },

                        {

                            enableHighAccuracy:
                                true,

                            timeout:
                                10000,

                            maximumAge:
                                5000

                        }

                    );

            }
        );

    }


    // ========================================================
    // PROFILE GIS FALLBACK
    // ========================================================

    function getProfileGIS() {

        const profile =
            getProfile();


        return {

            division:
                profile.division ||
                profile.gis_division ||
                "",

            range:
                profile.range ||
                profile.gis_range ||
                "",

            beat:
                profile.beat ||
                profile.gis_beat ||
                "",

            compartment:
                profile.compartment ||
                profile.gis_compartment ||
                "",

            divisionCode:
                profile.divisionCode ||
                profile.division_code ||
                "",

            rangeCode:
                profile.rangeCode ||
                profile.range_code ||
                "",

            beatCode:
                profile.beatCode ||
                profile.beat_code ||
                "",

            compartmentCode:
                profile.compartmentCode ||
                profile.compartment_code ||
                ""

        };

    }


    // ========================================================
    // EXTRACT GIS FROM EXISTING GLOBAL CONTEXT
    // ========================================================

    function getExistingGIS() {

        const candidates = [

            window.currentGISContext,

            window.activeGISContext,

            window.activePopupContext,

            window.currentLocationContext,

            window.currentSightingGIS

        ];


        for (
            let i = 0;
            i < candidates.length;
            i++
        ) {

            const candidate =
                candidates[i];


            if (
                candidate &&
                typeof candidate ===
                    "object"
            ) {

                return {

                    division:
                        candidate.division ||
                        candidate.gis_division ||
                        "",

                    range:
                        candidate.range ||
                        candidate.gis_range ||
                        "",

                    beat:
                        candidate.beat ||
                        candidate.gis_beat ||
                        "",

                    compartment:
                        candidate.compartment ||
                        candidate.gis_compartment ||
                        "",

                    divisionCode:
                        candidate.divisionCode ||
                        candidate.division_code ||
                        "",

                    rangeCode:
                        candidate.rangeCode ||
                        candidate.range_code ||
                        "",

                    beatCode:
                        candidate.beatCode ||
                        candidate.beat_code ||
                        "",

                    compartmentCode:
                        candidate.compartmentCode ||
                        candidate.compartment_code ||
                        ""

                };

            }

        }


        return null;

    }


    // ========================================================
    // RESOLVE
    // ========================================================

    async function resolve() {

        const gps =
            await getCurrentGPS();


        const existingGIS =
            getExistingGIS();


        const profileGIS =
            getProfileGIS();


        const gis =
            existingGIS ||
            profileGIS;


        const result = {

            latitude:
                gps.latitude,

            longitude:
                gps.longitude,

            accuracy:
                gps.accuracy,

            division:
                gis.division ||
                "",

            range:
                gis.range ||
                "",

            beat:
                gis.beat ||
                "",

            compartment:
                gis.compartment ||
                "",

            divisionCode:
                gis.divisionCode ||
                "",

            rangeCode:
                gis.rangeCode ||
                "",

            beatCode:
                gis.beatCode ||
                "",

            compartmentCode:
                gis.compartmentCode ||
                ""

        };


        // ====================================================
        // STORE IN STATE
        // ====================================================

        if (
            GG.IrregularityState
        ) {

            const state =
                GG.IrregularityState.state;


            state.latitude =
                result.latitude;

            state.longitude =
                result.longitude;

            state.accuracy =
                result.accuracy;

            state.division =
                result.division;

            state.range =
                result.range;

            state.beat =
                result.beat;

            state.compartment =
                result.compartment;

            state.divisionCode =
                result.divisionCode;

            state.rangeCode =
                result.rangeCode;

            state.beatCode =
                result.beatCode;

            state.compartmentCode =
                result.compartmentCode;

        }


        return result;

    }


    // ========================================================
    // PUBLIC API
    // ========================================================

    GG.IrregularityGIS = {

        getCurrentGPS:
            getCurrentGPS,

        getProfileGIS:
            getProfileGIS,

        getExistingGIS:
            getExistingGIS,

        resolve:
            resolve,

        getDutyState:
            getDutyState

    };


    window.IrregularityGIS =
        GG.IrregularityGIS;


    console.log(
        "✅ GreenGuard IrregularityGIS loaded."
    );


})(window);
