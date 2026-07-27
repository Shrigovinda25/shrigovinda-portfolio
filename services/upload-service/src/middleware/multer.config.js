'use strict';

const multer = require('multer');
const path   = require('path');

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024; // 10 MB

// ── Allowed MIME types ─────────────────────────────────────────────────────────
const ALLOWED_RESUME_MIME = ['application/pdf'];
const ALLOWED_IMAGE_MIME  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// ── Memory storage (files are streamed to Firebase Storage, not saved locally) ─
const storage = multer.memoryStorage();

function fileFilter(allowedMimes) {
    return (req, file, cb) => {
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(Object.assign(
                new Error(`Invalid file type: ${file.mimetype}. Allowed: ${allowedMimes.join(', ')}`),
                { status: 415 }
            ));
        }
    };
}

const resumeUpload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE, files: 1 },
    fileFilter: fileFilter(ALLOWED_RESUME_MIME),
});

const imageUpload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE, files: 1 },
    fileFilter: fileFilter(ALLOWED_IMAGE_MIME),
});

module.exports = { resumeUpload, imageUpload };
