// ==UserScript==
// @name         Satbayev Fixes
// @namespace    https://github.com/arprge/satbayev-firefox-fixes
// @version      3.3.1
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

    // Bail out on non-HTML responses (e.g. raw JSON endpoints)
    if (document.contentType && !document.contentType.includes('html')) {
        return;
    }

    const { hostname } = window.location;
    const isSubdomain = (prefix) =>
        hostname.startsWith(`${prefix}.`) || hostname.includes(`.${prefix}.`);

    // =================================================================
    // 1. SSO PASSWORD MANAGER FIX
    // =================================================================
    const initSsoAutofillFix = () => {
        const MAX_REWRITES = 20;
        let rewrites = 0;

        const fixFormAttributes = () => {
            const loginInput = document.querySelector('input[name="login"]');
            const passwordInput = document.querySelector('input[name="password"]');

            let mutated = false;

            if (loginInput && loginInput.autocomplete !== 'username') {
                loginInput.autocomplete = 'username';
                mutated = true;
            }

            if (passwordInput && passwordInput.autocomplete !== 'current-password') {
                passwordInput.autocomplete = 'current-password';
                mutated = true;
            }

            const forms = new Set([loginInput?.form, passwordInput?.form].filter(Boolean));
            for (const form of forms) {
                if (form.getAttribute('autocomplete') === 'off') {
                    form.removeAttribute('autocomplete');
                    mutated = true;
                }
            }

            if (mutated) {
                rewrites += 1;
            }
        };

        const observer = new MutationObserver(() => {
            fixFormAttributes();
            if (rewrites >= MAX_REWRITES) {
                observer.disconnect();
            }
        });

        const startObserving = () => {
            const root = document.documentElement;
            if (!root) return false;

            observer.observe(root, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['autocomplete'],
            });
            fixFormAttributes();
            return true;
        };

        if (!startObserving()) {
            document.addEventListener('DOMContentLoaded', startObserving, { once: true });
        }

        // Keep watching briefly after load in case a JS framework re-hydrates the form,
        // then disconnect so the page stays lightweight.
        const scheduleDisconnect = () => {
            fixFormAttributes();
            setTimeout(() => observer.disconnect(), 2000);
        };

        if (document.readyState === 'complete') {
            scheduleDisconnect();
        } else {
            window.addEventListener('load', scheduleDisconnect, { once: true });
        }
    };

    // =================================================================
    // 2. SCHEDULE READABILITY IMPROVEMENTS
    // =================================================================
    const initScheduleStyles = () => {
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

        const injectStyle = (css) => {
            if (typeof GM_addStyle === 'function') {
                GM_addStyle(css);
                return;
            }

            const target = document.head || document.documentElement;
            if (!target) {
                document.addEventListener('DOMContentLoaded', () => injectStyle(css), { once: true });
                return;
            }

            const style = document.createElement('style');
            style.textContent = css;
            target.appendChild(style);
        };

        injectStyle(scheduleCSS);
    };

    if (isSubdomain('sso')) {
        initSsoAutofillFix();
    }

    if (isSubdomain('stud')) {
        initScheduleStyles();
    }
})();
