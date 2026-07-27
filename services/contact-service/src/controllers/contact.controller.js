'use strict';

const contactService = require('../services/contact.service');
const logger = require('../../../../shared/utils/logger');

/**
 * POST /submit
 * Controller — delegates to service, returns JSON response.
 */
async function submit(req, res, next) {
    try {
        const { name, email, message } = req.body;
        const userAgent = (req.headers['user-agent'] || '').substring(0, 200);
        const ip = req.ip || req.connection?.remoteAddress || 'unknown';

        logger.info(`[ContactController] New submission from IP: ${ip}, email: ${email}`);

        await contactService.processContact({ name, email, message, userAgent, ip });

        res.status(200).json({
            success: true,
            message: 'Your message has been received. Thank you for reaching out!',
        });
    } catch (err) {
        next(err);
    }
}

module.exports = { submit };
