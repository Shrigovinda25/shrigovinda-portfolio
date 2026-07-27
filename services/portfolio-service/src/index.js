'use strict';

require('dotenv').config();
const express    = require('express');
const helmet     = require('helmet');
const morgan     = require('morgan');
const cors       = require('cors');
const rateLimit  = require('express-rate-limit');
const logger     = require('../../../shared/utils/logger');
const errorHandler = require('../../../shared/middleware/errorHandler');
const portfolioRoutes = require('./routes/portfolio.routes');

const app  = express();
const PORT = process.env.PORT || 3003;

app.disable('x-powered-by');
app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error(`CORS: Origin '${origin}' not allowed.`));
    },
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
}));
app.options('*', cors());

app.use(express.json({ limit: '5kb' }));
app.use(morgan('combined', { stream: logger.morganStream }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ success: true, service: 'portfolio-service', status: 'healthy', timestamp: new Date().toISOString() });
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/', portfolioRoutes);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Portfolio Service running on http://localhost:${PORT}`);
});

module.exports = app;
