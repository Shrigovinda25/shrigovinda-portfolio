'use strict';

/**
 * Sanitize & escape utilities — shared across services.
 * Prevents stored XSS when user-submitted data is later rendered as HTML.
 */

/**
 * Escapes HTML special characters in a string.
 * @param {string} str - Raw user input
 * @returns {string} HTML-escaped string
 */
function sanitizeText(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .trim();
}

/**
 * Sanitizes an object's string values recursively (one level deep).
 * @param {object} obj
 * @returns {object}
 */
function sanitizeObject(obj) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
        result[key] = typeof value === 'string' ? sanitizeText(value) : value;
    }
    return result;
}

module.exports = { sanitizeText, sanitizeObject };
