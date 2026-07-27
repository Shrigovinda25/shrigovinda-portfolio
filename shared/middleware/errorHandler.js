'use strict';

const logger = require('../utils/logger');

/**
 * Centralized Express error handler.
 * Must be registered LAST with app.use() in every service.
 * Never exposes internal error details to the client.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
    const status = err.status || err.statusCode || 500;
    const isClientError = status >= 400 && status < 500;

    // Always log the full error server-side
    logger.error(`[${status}] ${req.method} ${req.originalUrl} — ${err.message}`);
    if (!isClientError) {
        logger.error(err.stack);
    }

    // Safe client response — never leak stack traces
    const message = isClientError
        ? err.message
        : 'An internal server error occurred. Please try again later.';

    res.status(status).json({
        success: false,
        error: message,
    });
}

module.exports = errorHandler;
