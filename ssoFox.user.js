// ==UserScript==
// @name         Satbayev Fixes
// @namespace    https://github.com/arprge/satbayev-firefox-fixes
// @version      3.3.0
// @description  Fixes Firefox password autofill on SSO and improves schedule readability
// @description:ru Фиксы багов отображения сайта университета на фаерфоксе
// @author       Alan
// @match        *://*.satbayev.university/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=satbayev.university
// @grant        GM_addStyle
// @run-at       document-start
// @license      MIT
// @updateURL    https://raw.githubusercontent.com/arprge/satbayev-firefox-fixes/refs/heads/main/ssoFox.user.js
// @downloadURL  https://raw.githubusercontent.com/arprge/satbayev-firefox-fixes/refs/heads/main/ssoFox.user.js
// @homepageURL  https://github.com/arprge/satbayev-firefox-fixes
// @supportURL   https://github.com/arprge/satbayev-firefox-fixes/issues
// ==/UserScript==

(() => {
    'use strict';

    const host = window.location.hostname;

    // =================================================================
    // 1. SSO PASSWORD MANAGER FIX
    // =================================================================
    if (host.startsWith('sso.') || host.includes('.sso.')) {
        function fixFormAttributes() {
            const loginInput = document.querySelector('input[name="login"]');
            const passwordInput = document.querySelector('input[name="password"]');

            if (loginInput) {
                if (loginInput.autocomplete !== 'username') {
                    loginInput.autocomplete = 'username';
                }
                if (loginInput.form?.getAttribute('autocomplete') === 'off') {
                    loginInput.form.removeAttribute('autocomplete');
                }
            }

            if (passwordInput && passwordInput.autocomplete !== 'current-password') {
                passwordInput.autocomplete = 'current-password';
            }

            return Boolean(loginInput && passwordInput);
        }

        const observer = new MutationObserver(() => {
            fixFormAttributes();
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['autocomplete'],
        });

        fixFormAttributes();

        // Keep watching briefly after load in case a JS framework re-hydrates the form,
        // then disconnect so the page stays lightweight.
        window.addEventListener(
            'load',
            () => {
                fixFormAttributes();
                setTimeout(() => observer.disconnect(), 2000);
            },
            { once: true }
        );
    }

    // =================================================================
    // 2. SCHEDULE READABILITY IMPROVEMENTS
    // =================================================================
    if (host.startsWith('stud.') || host.includes('.stud.')) {
        const scheduleCSS = `
            /* Increase font size for all lesson text elements */
            rs-schedule .block-schedule .schedule-grid .schedule-table tbody tr td .lesson,
            rs-schedule .block-schedule .schedule-grid .schedule-table tbody tr td .lesson :is(p, span, div) {
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

        if (typeof GM_addStyle === 'function') {
            GM_addStyle(scheduleCSS);
        } else {
            const style = document.createElement('style');
            style.textContent = scheduleCSS;
            (document.head || document.documentElement).appendChild(style);
        }
    }
})();
