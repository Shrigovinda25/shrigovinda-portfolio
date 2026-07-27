'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const { db } = require('../../../../shared/firebase/admin');
const { sanitizeText } = require('../../../../shared/utils/sanitize');
const logger = require('../../../../shared/utils/logger');
const nodemailer = require('nodemailer');

// ─── Firestore ────────────────────────────────────────────────────────────────

/**
 * Stores a contact message in Firestore.
 * Uses Admin SDK — bypasses client-side security rules (server is trusted).
 * @param {{ name, email, message, userAgent, ip }} data
 */
async function storeMessage(data) {
    const firestore = db();
    await firestore.collection('messages').add({
        name:      sanitizeText(data.name),
        email:     sanitizeText(data.email),
        message:   sanitizeText(data.message),
        userAgent: data.userAgent || '',
        ip:        data.ip || '',
        timestamp: firestore.constructor.FieldValue
            ? firestore.constructor.FieldValue.serverTimestamp()
            : new Date(),
        createdAt: new Date().toISOString(),
    });
    logger.info(`[ContactService] Message stored in Firestore from: ${data.email}`);
}

// ─── Email ─────────────────────────────────────────────────────────────────────

let _transporter = null;

function getTransporter() {
    if (_transporter) return _transporter;
    _transporter = nodemailer.createTransport({
        host:   process.env.SMTP_HOST || 'smtp.gmail.com',
        port:   parseInt(process.env.SMTP_PORT, 10) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
    return _transporter;
}

/**
 * Sends an email notification to the portfolio owner.
 * Silently skips if ENABLE_EMAIL_NOTIFICATIONS !== 'true'.
 * @param {{ name, email, message }} data
 */
async function sendEmailNotification(data) {
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'true') {
        logger.info('[ContactService] Email notifications disabled. Skipping.');
        return;
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        logger.warn('[ContactService] SMTP credentials not configured. Skipping email.');
        return;
    }

    const recipient = process.env.CONTACT_RECIPIENT_EMAIL || process.env.SMTP_USER;

    const mailOptions = {
        from:    `"Portfolio Contact" <${process.env.SMTP_USER}>`,
        to:      recipient,
        replyTo: data.email,
        subject: `New Contact Message from ${data.name} — Portfolio`,
        text: `
New contact message received on your portfolio!

Name:    ${data.name}
Email:   ${data.email}
Message:
${data.message}

---
Sent via shrigovinda.netlify.app Contact Service
        `.trim(),
        html: `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #0a0a0f; color: #e2e8f0; padding: 24px;">
  <div style="max-width: 560px; margin: 0 auto; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px;">
    <h2 style="color: #a78bfa; margin-top: 0;">📨 New Portfolio Message</h2>
    <p><strong>From:</strong> ${sanitizeText(data.name)}</p>
    <p><strong>Email:</strong> <a href="mailto:${sanitizeText(data.email)}" style="color: #818cf8;">${sanitizeText(data.email)}</a></p>
    <hr style="border-color: rgba(255,255,255,0.1);">
    <p style="white-space: pre-wrap;">${sanitizeText(data.message)}</p>
    <hr style="border-color: rgba(255,255,255,0.1);">
    <p style="font-size: 0.75rem; color: #64748b;">Sent via shrigovinda.netlify.app Contact Service</p>
  </div>
</body>
</html>
        `.trim(),
    };

    await getTransporter().sendMail(mailOptions);
    logger.info(`[ContactService] Email notification sent to ${recipient}`);
}

// ─── Main Entry ────────────────────────────────────────────────────────────────

/**
 * Processes a contact form submission end-to-end.
 * 1. Store to Firestore
 * 2. Send email notification (if enabled)
 *
 * @param {{ name, email, message, userAgent, ip }} data
 */
async function processContact(data) {
    // Run store and email in parallel — email failure doesn't block storage
    const [, emailResult] = await Promise.allSettled([
        storeMessage(data),
        sendEmailNotification(data),
    ]);

    if (emailResult.status === 'rejected') {
        logger.warn(`[ContactService] Email send failed (non-critical): ${emailResult.reason?.message}`);
    }
}

module.exports = { processContact, storeMessage, sendEmailNotification };
