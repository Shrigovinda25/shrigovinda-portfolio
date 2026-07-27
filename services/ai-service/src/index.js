'use strict';

require('dotenv').config();
const express      = require('express');
const helmet       = require('helmet');
const morgan       = require('morgan');
const cors         = require('cors');
const rateLimit    = require('express-rate-limit');
const logger       = require('../../../shared/utils/logger');
const errorHandler = require('../../../shared/middleware/errorHandler');
const aiRoutes     = require('./routes/ai.routes');

const app  = express();
const PORT = process.env.PORT || 3005;

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

app.use(express.json({ limit: '20kb' }));
app.use(morgan('combined', { stream: logger.morganStream }));

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // AI is expensive — strict limit
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'AI rate limit exceeded. Please wait before sending another request.' },
});
app.use(limiter);

app.get('/health', (req, res) => {
    res.json({
        success: true,
        service: 'ai-service',
        status: 'healthy',
        mode: 'placeholder',
        timestamp: new Date().toISOString(),
    });
});

app.use('/', aiRoutes);

app.use((req, res) => {
    res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`AI Service running on http://localhost:${PORT}`);
    logger.info('Mode: placeholder (future OpenAI/Gemini integration)');
});

module.exports = app;
