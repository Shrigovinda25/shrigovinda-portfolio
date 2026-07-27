'use strict';

require('dotenv').config();
const express      = require('express');
const helmet       = require('helmet');
const morgan       = require('morgan');
const cors         = require('cors');
const rateLimit    = require('express-rate-limit');
const logger       = require('../../shared/utils/logger');
const errorHandler = require('../../shared/middleware/errorHandler');
const proxyRouter  = require('./routes/proxy');

const app  = express();
const PORT = process.env.PORT || 8080;

// ─── Security ────────────────────────────────────────────────────────────────
app.disable('x-powered-by');
app.use(helmet({
    contentSecurityPolicy: false, // Let individual services handle their own CSP
}));

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error(`CORS: Origin '${origin}' not allowed.`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.options('*', cors());

// ─── HTTP Logging ─────────────────────────────────────────────────────────────
app.use(morgan('combined', { stream: logger.morganStream }));

// ─── Global Rate Limiter ──────────────────────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests from this IP. Please try again later.' },
});
app.use(globalLimiter);

// ─── Gateway Health Check ─────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    const services = {
        auth:      process.env.AUTH_SERVICE_URL      || 'not configured',
        contact:   process.env.CONTACT_SERVICE_URL   || 'not configured',
        portfolio: process.env.PORTFOLIO_SERVICE_URL || 'not configured',
        upload:    process.env.UPLOAD_SERVICE_URL    || 'not configured',
        ai:        process.env.AI_SERVICE_URL        || 'not configured',
    };
    res.json({
        success: true,
        service: 'api-gateway',
        status:  'healthy',
        services,
        timestamp: new Date().toISOString(),
    });
});

// ─── API Proxy Routes ─────────────────────────────────────────────────────────
app.use('/api', proxyRouter);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: `Gateway: Route not found — ${req.method} ${req.originalUrl}`,
        hint:  'All API requests must be prefixed with /api/<service>',
    });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    logger.info(`API Gateway running on http://localhost:${PORT}`);
    logger.info(`Proxying to: auth=${process.env.AUTH_SERVICE_URL}, contact=${process.env.CONTACT_SERVICE_URL}, portfolio=${process.env.PORTFOLIO_SERVICE_URL}`);
});

module.exports = app;
