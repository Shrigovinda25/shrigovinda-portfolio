'use strict';

const express = require('express');
const aiController = require('../controllers/ai.controller');

const router = express.Router();

// ── Status ────────────────────────────────────────────────────────────────────
router.get('/status', aiController.getStatus);

// ── Chat (placeholder) ────────────────────────────────────────────────────────
router.post('/chat', aiController.chat);

// ── Summarize (placeholder) ───────────────────────────────────────────────────
router.post('/summarize', aiController.summarize);

module.exports = router;
