'use strict';

const express = require('express');
const { body } = require('express-validator');
const contactController = require('../controllers/contact.controller');
const validateContact = require('../middleware/validateContact');

const router = express.Router();

/**
 * POST /submit
 * Validates, sanitizes, and stores a contact form submission.
 * Optionally sends an email notification to the portfolio owner.
 *
 * Body: { name: string, email: string, message: string }
 */
router.post(
    '/submit',
    [
        body('name')
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Name must be between 2 and 100 characters.')
            .escape(),
        body('email')
            .trim()
            .isEmail()
            .withMessage('Please provide a valid email address.')
            .isLength({ max: 254 })
            .withMessage('Email address is too long.')
            .normalizeEmail({ gmail_remove_dots: false }),
        body('message')
            .trim()
            .isLength({ min: 10, max: 2000 })
            .withMessage('Message must be between 10 and 2000 characters.')
            .escape(),
    ],
    validateContact,
    contactController.submit
);

module.exports = router;
