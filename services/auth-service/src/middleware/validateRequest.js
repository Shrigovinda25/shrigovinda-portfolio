'use strict';

const { validationResult } = require('express-validator');

function validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            error: errors.array()[0].msg,
            errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
        });
    }
    next();
}

module.exports = validateRequest;
