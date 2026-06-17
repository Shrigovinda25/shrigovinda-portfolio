'use strict';

const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// ─────────────────────────────────────────────
// 1. Remove Express fingerprinting
// ─────────────────────────────────────────────
app.disable('x-powered-by');

// ─────────────────────────────────────────────
// 2. Security Headers Middleware
// ─────────────────────────────────────────────
const CSP = [
    "default-src 'self'",
    // Scripts: self + Lucide CDN + Firebase SDK (gstatic) + Google Translate
    "script-src 'self' 'unsafe-inline' https://unpkg.com https://www.gstatic.com https://translate.google.com https://translate.googleapis.com",
    // Styles: self + inline (used heavily) + Google Fonts
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    // Fonts: self + Google Fonts assets
    "font-src 'self' https://fonts.gstatic.com",
    // Images: self + data URIs + HTTPS (for external project images)
    "img-src 'self' data: https:",
    // Connections: Firebase Firestore, Analytics, Auth
    "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://firebaselogging.googleapis.com",
    // No iframes, objects, or plugins
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
].join('; ');

app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', CSP);
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
    // HSTS — only send over HTTPS in production
    if (IS_PROD) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    next();
});

// ─────────────────────────────────────────────
// 3. Rate Limiting
// ─────────────────────────────────────────────
// Global limiter: 200 requests per 15 minutes
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again later.' },
});

// Strict limiter for any future API endpoints: 20 req / 15 min
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many API requests. Please try again later.' },
});

app.use(globalLimiter);
app.use('/api/', apiLimiter);

// ─────────────────────────────────────────────
// 4. Request Body Size Limits
// ─────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ─────────────────────────────────────────────
// 5. Secure Static File Serving
// ─────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public'), {
    dotfiles: 'deny',           // Block .env, .git, etc.
    etag: true,
    index: 'index.html',
    setHeaders: (res, filePath) => {
        // PDFs: open inline, not as attachment
        if (filePath.endsWith('.pdf')) {
            res.setHeader('Content-Disposition', 'inline');
            res.setHeader('Content-Type', 'application/pdf');
        }
        // Cache static assets for 1 day, but always revalidate HTML
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        } else {
            res.setHeader('Cache-Control', 'public, max-age=86400');
        }
    }
}));

// ─────────────────────────────────────────────
// 6. 404 Handler — never expose stack traces
// ─────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─────────────────────────────────────────────
// 7. Global Error Handler
// ─────────────────────────────────────────────
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    console.error(`[ERROR] ${new Date().toISOString()} ${req.method} ${req.url} — ${err.message}`);
    // Never expose error details to the client
    res.status(500).json({ error: 'An internal error occurred.' });
});

// ─────────────────────────────────────────────
// 8. Start
// ─────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`[INFO] ${new Date().toISOString()} — Server running at http://localhost:${PORT}`);
    console.log(`[INFO] Environment: ${process.env.NODE_ENV || 'development'}`);
});
