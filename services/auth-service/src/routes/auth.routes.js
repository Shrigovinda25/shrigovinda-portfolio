'use strict';

const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// ── Signup ────────────────────────────────────────────────────────────────────
router.post(
    '/signup',
    [
        body('email').isEmail().withMessage('Valid email required.').normalizeEmail({ gmail_remove_dots: false }),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
        body('displayName').optional().trim().isLength({ max: 80 }).escape(),
    ],
    validateRequest,
    authController.signup
);

// ── Login (exchange email+password for Firebase ID token via REST API) ────────
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Valid email required.').normalizeEmail({ gmail_remove_dots: false }),
        body('password').notEmpty().withMessage('Password is required.'),
    ],
    validateRequest,
    authController.login
);

// ── Logout (revoke refresh tokens) ───────────────────────────────────────────
router.post('/logout', authController.logout);

// ── Verify Token ──────────────────────────────────────────────────────────────
router.get('/verify', authController.verifyToken);

// ── Get Current User ──────────────────────────────────────────────────────────
router.get('/me', authController.getMe);

module.exports = router;
