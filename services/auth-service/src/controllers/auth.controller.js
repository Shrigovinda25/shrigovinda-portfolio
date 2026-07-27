'use strict';

const authService = require('../services/auth.service');
const logger = require('../../../../shared/utils/logger');

async function signup(req, res, next) {
    try {
        const { email, password, displayName } = req.body;
        const result = await authService.signup({ email, password, displayName });
        res.status(201).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const result = await authService.login({ email, password });
        res.status(200).json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

async function logout(req, res, next) {
    try {
        const authHeader = req.headers['authorization'] || '';
        const idToken = authHeader.replace('Bearer ', '');
        if (!idToken) {
            return res.status(400).json({ success: false, error: 'No token provided.' });
        }
        await authService.logout(idToken);
        res.status(200).json({ success: true, message: 'Logged out successfully.' });
    } catch (err) {
        next(err);
    }
}

async function verifyToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'] || '';
        const idToken = authHeader.replace('Bearer ', '');
        if (!idToken) {
            return res.status(401).json({ success: false, error: 'No token provided.' });
        }
        const decoded = await authService.verifyToken(idToken);
        res.status(200).json({ success: true, data: decoded });
    } catch (err) {
        const error = new Error('Invalid or expired token.');
        error.status = 403;
        next(error);
    }
}

async function getMe(req, res, next) {
    try {
        const authHeader = req.headers['authorization'] || '';
        const idToken = authHeader.replace('Bearer ', '');
        if (!idToken) {
            return res.status(401).json({ success: false, error: 'No token provided.' });
        }
        const user = await authService.getUserFromToken(idToken);
        res.status(200).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
}

module.exports = { signup, login, logout, verifyToken, getMe };
