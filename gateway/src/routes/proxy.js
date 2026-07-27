'use strict';

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const logger = require('../../../shared/utils/logger');

const router = express.Router();

/**
 * Proxy factory — creates a proxy middleware for a given service.
 * @param {string} envKey - env var name for the service URL
 * @param {string} pathRewrite - the path prefix to strip (e.g. '/api/contact')
 */
function createProxy(envKey, pathRewrite) {
    const target = process.env[envKey];

    if (!target) {
        logger.warn(`[Gateway] ${envKey} is not set. Requests to this service will return 503.`);
        return (req, res) => {
            res.status(503).json({
                success: false,
                error: `Service unavailable: ${envKey} is not configured.`,
                hint:  `Set ${envKey} in your gateway .env file.`,
            });
        };
    }

    return createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: { [`^${pathRewrite}`]: '' },
        on: {
            proxyReq: (proxyReq, req) => {
                logger.debug(`[Gateway] → ${req.method} ${req.originalUrl} to ${target}`);
            },
            error: (err, req, res) => {
                logger.error(`[Gateway] Proxy error for ${req.originalUrl}: ${err.message}`);
                if (!res.headersSent) {
                    res.status(502).json({
                        success: false,
                        error: 'Service temporarily unavailable. Please try again later.',
                    });
                }
            },
        },
    });
}

// ── /api/auth/* → Auth Service ─────────────────────────────────────────────
router.use('/auth', createProxy('AUTH_SERVICE_URL', '/api/auth'));

// ── /api/contact/* → Contact Service ─────────────────────────────────────
router.use('/contact', createProxy('CONTACT_SERVICE_URL', '/api/contact'));

// ── /api/portfolio/* → Portfolio Service ─────────────────────────────────
router.use('/portfolio', createProxy('PORTFOLIO_SERVICE_URL', '/api/portfolio'));

// ── /api/upload/* → Upload Service ───────────────────────────────────────
router.use('/upload', createProxy('UPLOAD_SERVICE_URL', '/api/upload'));

// ── /api/ai/* → AI Service ───────────────────────────────────────────────
router.use('/ai', createProxy('AI_SERVICE_URL', '/api/ai'));

module.exports = router;
