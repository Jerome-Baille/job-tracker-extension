/**
 * Shared utilities for job page parsers.
 * Exposes helpers on window.JobParserUtils for use by individual parser files.
 */
(function () {
    'use strict';

    /**
     * Safely query an element and return its trimmed text content.
     * @param {string} selector - CSS selector
     * @param {Document|Element} ctx - Context element (default: document)
     * @param {string} fallback - Fallback value if not found
     * @returns {string}
     */
    function getText(selector, ctx = document, fallback = '') {
        const el = ctx.querySelector(selector);
        return el ? el.textContent.trim() : fallback;
    }

    /**
     * Build a selector from a space-separated class list and return matching element's text.
     * @param {string} classList - Space-separated class names
     * @param {string} fallback - Fallback value if not found
     * @returns {string}
     */
    function getByClassList(classList, fallback = '') {
        const selector = '.' + classList.trim().split(/\s+/).join('.');
        return getText(selector, document, fallback);
    }

    /**
     * Normalize text for accent-insensitive, case-insensitive matching.
     * @param {string} s - Input string
     * @returns {string}
     */
    function normalize(s) {
        return (s || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Expose utilities globally
    window.JobParserUtils = {
        getText,
        getByClassList,
        normalize
    };

    // Initialize parsers registry
    window.JobParsers = window.JobParsers || {};
})();
