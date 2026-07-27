'use strict';

const express = require('express');
const { resumeUpload, imageUpload } = require('../middleware/multer.config');
const uploadController = require('../controllers/upload.controller');
const authGuard = require('../../../../shared/middleware/authGuard');

const router = express.Router();

/**
 * POST /resume
 * Upload a resume PDF to Firebase Storage.
 * Requires: Authorization: Bearer <firebase-id-token>
 * Body: multipart/form-data with field name 'resume' (PDF only)
 */
router.post(
    '/resume',
    authGuard, // Requires authentication
    resumeUpload.single('resume'),
    uploadController.uploadResume
);

/**
 * POST /project-image
 * Upload a project image to Firebase Storage.
 * Requires: Authorization: Bearer <firebase-id-token>
 * Body: multipart/form-data with field name 'image' (JPEG, PNG, WebP, GIF)
 */
router.post(
    '/project-image',
    authGuard,
    imageUpload.single('image'),
    uploadController.uploadProjectImage
);

module.exports = router;
