'use strict';

/**
 * AI Service Controller — Placeholder Implementation
 * ───────────────────────────────────────────────────
 * Replace mock responses with real OpenAI/Gemini calls when ready.
 *
 * Future integration:
 *   - OpenAI: require('openai')
 *   - Gemini: require('@google/generative-ai')
 */

function getStatus(req, res) {
    res.json({
        success: true,
        data: {
            status:  'placeholder',
            message: 'AI Service is ready. Real AI integration coming soon.',
            capabilities: {
                chat:      false, // Set to true when wired up
                summarize: false,
                vision:    false,
            },
            planned: {
                providers: ['OpenAI GPT-4o', 'Google Gemini'],
                useCases: [
                    'Portfolio chatbot assistant',
                    'Project description generator',
                    'Resume optimization suggestions',
                ],
            },
        },
    });
}

function chat(req, res) {
    const { message } = req.body || {};

    if (!message || typeof message !== 'string') {
        return res.status(400).json({
            success: false,
            error: 'Message field is required.',
        });
    }

    // TODO: Replace with real AI call
    // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // const completion = await openai.chat.completions.create({ ... });

    res.json({
        success: true,
        data: {
            reply: `[AI Placeholder] You said: "${message}". Real AI integration coming soon!`,
            model: 'placeholder-v1',
            note:  'This is a placeholder response. Wire up OpenAI or Gemini to activate.',
        },
    });
}

function summarize(req, res) {
    const { text } = req.body || {};

    if (!text || typeof text !== 'string') {
        return res.status(400).json({
            success: false,
            error: 'Text field is required.',
        });
    }

    res.json({
        success: true,
        data: {
            summary: `[Placeholder] Text of length ${text.length} received. Real summarization coming soon.`,
            model:   'placeholder-v1',
        },
    });
}

module.exports = { getStatus, chat, summarize };
