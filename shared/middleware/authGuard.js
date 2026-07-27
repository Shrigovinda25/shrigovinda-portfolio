'use strict';

const { auth } = require('../firebase/admin');
const logger = require('../utils/logger');

/**
 * Auth Guard Middleware — verifies Firebase ID tokens from Authorization header.
 * Usage: router.use(authGuard) on any protected route.
 *
 * Expects: Authorization: Bearer <firebase-id-token>
 */
async function authGuard(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: 'Missing or invalid Authorization header. Expected: Bearer <token>',
        });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await auth().verifyIdToken(idToken);
        req.user = decodedToken; // Attach decoded user to request
        next();
    } catch (err) {
        logger.warn(`[AuthGuard] Token verification failed: ${err.message}`);
        return res.status(403).json({
            success: false,
            error: 'Invalid or expired token. Please log in again.',
        });
    }
}

module.exports = authGuard;
