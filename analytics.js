(function() {
    'use strict';

    // Configuration
    var TRACKING_ENDPOINT = 'https://lightgreen-partridge-835006.hostingersite.com/track.php';
    var COUNTRY_API = 'https://ipapi.co/json/';

    // Get current page URL
    var currentUrl = window.location.href;

    // Function to get country from IP
    function getCountry(callback) {
        // Try to get country from IP geolocation API
        var xhr = new XMLHttpRequest();
        xhr.open('GET', COUNTRY_API, true);
        xhr.timeout = 3000; // 3 second timeout

        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    callback(data.country_code || null);
                } catch (e) {
                    callback(null);
                }
            } else {
                callback(null);
            }
        };

        xhr.onerror = function() {
            callback(null);
        };

        xhr.ontimeout = function() {
            callback(null);
        };

        xhr.send();
    }

    // Function to send tracking data
    function sendTrackingData(country) {
        var data = {
            url: currentUrl,
            country: country
        };

        var xhr = new XMLHttpRequest();
        xhr.open('POST', TRACKING_ENDPOINT, true);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onload = function() {
            if (xhr.status === 200) {
                console.log('[Analytics] Visit tracked successfully');
            } else if (xhr.status === 403) {
                console.warn('[Analytics] Domain is blocked from tracking');
            } else {
                console.error('[Analytics] Failed to track visit (Status: ' + xhr.status + ')');
                try {
                    var response = JSON.parse(xhr.responseText);
                    if (response.details) {
                        console.error('[Analytics] Error details:', response.details);
                    }
                } catch (e) {
                    console.error('[Analytics] Response:', xhr.responseText);
                }
            }
        };

        xhr.onerror = function() {
            console.error('[Analytics] Network error while tracking visit');
        };

        xhr.send(JSON.stringify(data));
    }

    // Initialize tracking
    function initTracking() {
        // Get country and send tracking data
        getCountry(function(country) {
            sendTrackingData(country);
        });
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTracking);
    } else {
        initTracking();
    }

})();
