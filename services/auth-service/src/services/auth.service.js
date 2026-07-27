'use strict';

const { auth, admin } = require('../../../../shared/firebase/admin');
const logger = require('../../../../shared/utils/logger');

/**
 * Auth Service — Firebase Admin SDK operations.
 *
 * Note: Firebase Admin cannot verify plain passwords (that's a client-side op).
 * For the login flow, the client exchanges email+password for an ID token via
 * Firebase REST API (https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword).
 * The backend verifies the resulting ID token.
 */

async function signup({ email, password, displayName }) {
    const userRecord = await auth().createUser({
        email,
        password,
        displayName: displayName || email.split('@')[0],
        emailVerified: false,
    });

    logger.info(`[AuthService] New user created: ${userRecord.uid}`);

    return {
        uid:         userRecord.uid,
        email:       userRecord.email,
        displayName: userRecord.displayName,
        message:     'Account created. Please log in via the client to get your ID token.',
    };
}

async function login({ email, password }) {
    /**
     * Admin SDK does NOT support password sign-in.
     * This endpoint acts as a proxy to Firebase REST Auth API.
     * Client apps should ideally authenticate directly with Firebase SDK.
     * This route is provided for server-to-server or non-browser clients.
     */
    const apiKey = process.env.FIREBASE_WEB_API_KEY;
    if (!apiKey) {
        throw Object.assign(
            new Error('FIREBASE_WEB_API_KEY not configured. Server-side login unavailable.'),
            { status: 501 }
        );
    }

    const axios = require('axios');
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

    try {
        const response = await axios.post(url, {
            email,
            password,
            returnSecureToken: true,
        });

        const { idToken, refreshToken, localId, expiresIn } = response.data;
        logger.info(`[AuthService] Login successful for: ${email}`);

        return { idToken, refreshToken, uid: localId, expiresIn };
    } catch (axiosErr) {
        const firebaseError = axiosErr.response?.data?.error?.message || 'Login failed.';
        const err = new Error(firebaseError === 'INVALID_PASSWORD' || firebaseError === 'EMAIL_NOT_FOUND'
            ? 'Invalid email or password.'
            : firebaseError);
        err.status = 401;
        throw err;
    }
}

async function logout(idToken) {
    const decoded = await auth().verifyIdToken(idToken);
    await auth().revokeRefreshTokens(decoded.uid);
    logger.info(`[AuthService] Tokens revoked for user: ${decoded.uid}`);
}

async function verifyToken(idToken) {
    const decoded = await auth().verifyIdToken(idToken, true); // checkRevoked = true
    return {
        uid:   decoded.uid,
        email: decoded.email,
        name:  decoded.name,
        emailVerified: decoded.email_verified,
    };
}

async function getUserFromToken(idToken) {
    const decoded = await auth().verifyIdToken(idToken, true);
    const userRecord = await auth().getUser(decoded.uid);
    return {
        uid:          userRecord.uid,
        email:        userRecord.email,
        displayName:  userRecord.displayName,
        emailVerified: userRecord.emailVerified,
        createdAt:    userRecord.metadata.creationTime,
    };
}

module.exports = { signup, login, logout, verifyToken, getUserFromToken };
