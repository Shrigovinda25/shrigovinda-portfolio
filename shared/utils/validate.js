'use strict';

/**
 * Shared validation constants and helpers.
 * Mirrors the limits enforced in Firestore security rules.
 */

const LIMITS = {
    name:    { min: 2,  max: 100 },
    email:   { min: 3,  max: 254 },
    message: { min: 10, max: 2000 },
    fileName: { max: 255 },
};

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

/**
 * Validates a contact form payload.
 * @param {{ name: string, email: string, message: string }} data
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateContactPayload(data) {
    const errors = [];
    const { name = '', email = '', message = '' } = data;

    if (name.length < LIMITS.name.min)  errors.push(`Name must be at least ${LIMITS.name.min} characters.`);
    if (name.length > LIMITS.name.max)  errors.push(`Name must be under ${LIMITS.name.max} characters.`);
    if (!EMAIL_REGEX.test(email))       errors.push('Please enter a valid email address.');
    if (email.length > LIMITS.email.max) errors.push('Email address is too long.');
    if (message.length < LIMITS.message.min) errors.push(`Message must be at least ${LIMITS.message.min} characters.`);
    if (message.length > LIMITS.message.max) errors.push(`Message must be under ${LIMITS.message.max} characters.`);

    return { valid: errors.length === 0, errors };
}

module.exports = { LIMITS, EMAIL_REGEX, validateContactPayload };
