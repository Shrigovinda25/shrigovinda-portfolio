'use strict';

const { validationResult } = require('express-validator');

/**
 * Middleware: checks express-validator results.
 * If validation failed, returns 422 with error details.
 * Otherwise calls next().
 */
function validateContact(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            error: errors.array()[0].msg, // Return first error message
            errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
        });
    }
    next();
}

module.exports = validateContact;
