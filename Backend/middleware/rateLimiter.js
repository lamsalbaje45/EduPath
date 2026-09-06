import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/apiResponse.js';

function buildLimiter({ windowMs, max, message }) {
    return rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => sendError(res, { status: 429, message }),
    });
}

// Guards login/register/password-reset against brute-force and credential-stuffing attempts.
const authLimiter = buildLimiter({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many authentication attempts. Please try again in a few minutes.',
});

// Guards inquiry/application creation against spam and mass-submission abuse.
const writeLimiter = buildLimiter({
    windowMs: 10 * 60 * 1000,
    max: 30,
    message: 'Too many requests. Please slow down and try again shortly.',
});

export { authLimiter, writeLimiter };
