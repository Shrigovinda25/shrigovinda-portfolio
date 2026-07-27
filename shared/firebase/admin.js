'use strict';

const admin = require('firebase-admin');

/**
 * Singleton Firebase Admin SDK initializer.
 * Reads credentials from environment:
 *   Option A: FIREBASE_SERVICE_ACCOUNT (JSON string in env var)
 *   Option B: GOOGLE_APPLICATION_CREDENTIALS (path to serviceAccountKey.json)
 */
function initializeFirebaseAdmin() {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    let credential;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            credential = admin.credential.cert(serviceAccount);
        } catch (err) {
            throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT JSON: ' + err.message);
        }
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // ADC — will auto-pick up the file path
        credential = admin.credential.applicationDefault();
    } else {
        throw new Error(
            'No Firebase credentials found. Set FIREBASE_SERVICE_ACCOUNT (JSON string) ' +
            'or GOOGLE_APPLICATION_CREDENTIALS (file path) in your .env file.'
        );
    }

    return admin.initializeApp({
        credential,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
}

// Initialize on first require
initializeFirebaseAdmin();

module.exports = {
    admin,
    db: () => admin.firestore(),
    auth: () => admin.auth(),
    storage: () => admin.storage(),
};
