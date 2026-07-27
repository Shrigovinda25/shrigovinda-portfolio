'use strict';

require('dotenv').config();
const express      = require('express');
const helmet       = require('helmet');
const morgan       = require('morgan');
const cors         = require('cors');
const rateLimit    = require('express-rate-limit');
const logger       = require('../../../shared/utils/logger');
const errorHandler = require('../../../shared/middleware/errorHandler');
const uploadRoutes = require('./routes/upload.routes');

const app  = express();
const PORT = process.env.PORT || 3004;

app.disable('x-powered-by');
app.use(helmet());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error(`CORS: Origin '${origin}' not allowed.`));
    },
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());

// Note: body parsers are NOT used here — multer handles multipart/form-data
app.use(morgan('combined', { stream: logger.morganStream }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // Strict: only 10 uploads per 15 min
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Upload rate limit exceeded. Please wait before uploading again.' },
});
app.use(limiter);

app.get('/health', (req, res) => {
    res.json({ success: true, service: 'upload-service', status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/', uploadRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Upload Service running on http://localhost:${PORT}`);
});

module.exports = app;
