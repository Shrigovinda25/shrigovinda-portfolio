'use strict';

/**
 * Lightweight structured logger.
 * Each service also plugs in Morgan for HTTP request logging.
 * Level methods: info, warn, error, debug
 */

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const CURRENT_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL] ?? LOG_LEVELS.info;

function timestamp() {
    return new Date().toISOString();
}

function log(level, message) {
    if (LOG_LEVELS[level] < CURRENT_LEVEL) return;
    const prefix = `[${timestamp()}] [${level.toUpperCase()}]`;
    if (level === 'error') {
        console.error(`${prefix} ${message}`);
    } else if (level === 'warn') {
        console.warn(`${prefix} ${message}`);
    } else {
        console.log(`${prefix} ${message}`);
    }
}

const logger = {
    info:  (msg) => log('info', msg),
    warn:  (msg) => log('warn', msg),
    error: (msg) => log('error', msg),
    debug: (msg) => log('debug', msg),

    /**
     * Returns a Morgan-compatible stream that pipes HTTP logs through this logger.
     */
    morganStream: {
        write: (message) => log('info', message.trim()),
    },
};

module.exports = logger;
