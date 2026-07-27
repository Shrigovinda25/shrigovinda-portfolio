'use strict';

const { storage } = require('../../../../shared/firebase/admin');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const logger = require('../../../../shared/utils/logger');

/**
 * Upload a file buffer to Firebase Storage.
 * @param {Express.Multer.File} file - The multer file object (memory storage)
 * @param {string} folder - Storage folder path (e.g. 'resumes', 'project-images')
 * @returns {Promise<string>} Public download URL
 */
async function uploadToStorage(file, folder) {
    const bucket = storage().bucket();

    // Generate a unique filename to prevent overwrites
    const ext      = path.extname(file.originalname) || '';
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${folder}/${basename}_${uuidv4()}${ext}`;

    const fileRef = bucket.file(filename);

    await fileRef.save(file.buffer, {
        metadata: {
            contentType:  file.mimetype,
            cacheControl: 'public, max-age=31536000', // 1 year cache
        },
        resumable: false, // Use single upload for files < 5MB
    });

    // Make the file publicly readable
    await fileRef.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
    logger.info(`[UploadService] File uploaded: ${publicUrl}`);

    return publicUrl;
}

module.exports = { uploadToStorage };
