'use strict';

/**
 * Shared constants used across all services.
 * Ports here are used only for local development.
 * In production each service is deployed independently.
 */

const SERVICE_PORTS = {
    GATEWAY:   process.env.GATEWAY_PORT   || 8080,
    AUTH:      process.env.AUTH_PORT      || 3001,
    CONTACT:   process.env.CONTACT_PORT   || 3002,
    PORTFOLIO: process.env.PORTFOLIO_PORT || 3003,
    UPLOAD:    process.env.UPLOAD_PORT    || 3004,
    AI:        process.env.AI_PORT        || 3005,
    FRONTEND:  process.env.PORT           || 3000,
};

const RATE_LIMITS = {
    GLOBAL: { windowMs: 15 * 60 * 1000, max: 200 },
    API:    { windowMs: 15 * 60 * 1000, max: 20  },
    AUTH:   { windowMs: 15 * 60 * 1000, max: 10  },
};

const COLLECTIONS = {
    MESSAGES: 'messages',
    USERS:    'users',
};

module.exports = { SERVICE_PORTS, RATE_LIMITS, COLLECTIONS };
