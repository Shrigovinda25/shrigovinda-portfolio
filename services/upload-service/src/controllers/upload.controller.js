'use strict';

const uploadService = require('../services/upload.service');
const logger = require('../../../../shared/utils/logger');

async function uploadResume(req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file provided. Send a PDF in the "resume" field.' });
        }

        const url = await uploadService.uploadToStorage(req.file, 'resumes');
        logger.info(`[UploadController] Resume uploaded by user: ${req.user?.uid}`);

        res.status(200).json({
            success: true,
            message: 'Resume uploaded successfully.',
            data: { url, filename: req.file.originalname, size: req.file.size },
        });
    } catch (err) {
        next(err);
    }
}

async function uploadProjectImage(req, res, next) {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file provided. Send an image in the "image" field.' });
        }

        const url = await uploadService.uploadToStorage(req.file, 'project-images');
        logger.info(`[UploadController] Project image uploaded by user: ${req.user?.uid}`);

        res.status(200).json({
            success: true,
            message: 'Image uploaded successfully.',
            data: { url, filename: req.file.originalname, size: req.file.size },
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { uploadResume, uploadProjectImage };
