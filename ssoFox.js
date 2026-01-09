// ==UserScript==
// @name         Satbayev University SSO & Schedule Fixes
// @namespace    https://github.com/arprge/satbayev-firefox-fixes
// @version      3.2.1
// @description  Fixes Firefox password autofill on SSO and improves schedule readability
// @description:ru Фиксы багов сайта университета на фаерфоксе
// @author       Alan
// @match        *://*.satbayev.university/*
// @grant        GM_addStyle
// @run-at       document-start
// @license      MIT
// @homepageURL  https://github.com/arprge/satbayev-firefox-fixes
// @supportURL   https://github.com/arprge/satbayev-firefox-fixes/issues
// ==/UserScript==

(function () {
    'use strict';

    const currentHost = window.location.hostname;

    // =================================================================
    // SSO PASSWORD MANAGER FIX
    // =================================================================
    if (currentHost.includes("sso")) {
        
        /**
         * Applies `autocomplete` attributes to the SSO login form.
         * @returns {boolean} True when both inputs exist on the page
         */
        function fixFormAttributes() {
            const loginInput = document.querySelector('input[name="login"]');
            const passwordInput = document.querySelector('input[name="password"]');

            if (loginInput && loginInput.getAttribute('autocomplete') !== 'username') {
                loginInput.setAttribute('autocomplete', 'username');
            }

            if (passwordInput && passwordInput.getAttribute('autocomplete') !== 'current-password') {
                passwordInput.setAttribute('autocomplete', 'current-password');
            }

            return !!(loginInput && passwordInput);
        }

        const observer = new MutationObserver(() => {
            if (fixFormAttributes()) {
                observer.disconnect();
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        if (fixFormAttributes()) {
            observer.disconnect();
        }
    }

    // =================================================================
    // SCHEDULE READABILITY IMPROVEMENTS
    // =================================================================
    // Enhances the student schedule page by increasing font sizes
    // and improving layout for better readability
    if (currentHost.includes("stud")) {
        const scheduleCSS = `
            /* Increase font size for all lesson text elements */
            rs-schedule .block-schedule .schedule-grid .schedule-table tbody tr td .lesson,
            rs-schedule .block-schedule .schedule-grid .schedule-table tbody tr td .lesson p,
            rs-schedule .block-schedule .schedule-grid .schedule-table tbody tr td .lesson span,
            rs-schedule .block-schedule .schedule-grid .schedule-table tbody tr td .lesson div {
                font-size: 16px !important;
                line-height: 1.2 !important;
            }

            /* Improve lesson cell layout */
            rs-schedule .block-schedule .schedule-grid .schedule-table tbody tr td .lesson {
                padding: 4px !important;
                height: auto !important;
                min-height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
            }

            /* Adjust paragraph spacing */
            rs-schedule .block-schedule .schedule-grid .schedule-table tbody tr td .lesson p {
                margin-bottom: 2px !important;
            }

            /* Make lesson blocks more prominent */
            rs-schedule .block-schedule .schedule-grid .schedule-table tbody tr td .lesson ._block {
                font-weight: 630 !important;
            }
        `;

        // Apply styles using GM_addStyle if available, otherwise use standard method
        if (typeof GM_addStyle !== "undefined") {
            GM_addStyle(scheduleCSS);
        } else {
            const styleElement = document.createElement('style');
            styleElement.textContent = scheduleCSS;
            document.head.appendChild(styleElement);
        }
    }

})();