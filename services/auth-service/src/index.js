'use strict';

require('dotenv').config();
const express      = require('express');
const helmet       = require('helmet');
const morgan       = require('morgan');
const cors         = require('cors');
const rateLimit    = require('express-rate-limit');
const logger       = require('../../../shared/utils/logger');
const errorHandler = require('../../../shared/middleware/errorHandler');
const authRoutes   = require('./routes/auth.routes');

const app  = express();
const PORT = process.env.PORT || 3001;

app.disable('x-powered-by');
app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error(`CORS: Origin '${origin}' not allowed.`));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());

app.use(express.json({ limit: '10kb' }));
app.use(morgan('combined', { stream: logger.morganStream }));

// Strict rate limit for auth endpoints — 10 requests / 15 min
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many auth requests. Please wait before trying again.' },
});
app.use(authLimiter);

app.get('/health', (req, res) => {
    res.json({ success: true, service: 'auth-service', status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/', authRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Auth Service running on http://localhost:${PORT}`);
});

module.exports = app;
