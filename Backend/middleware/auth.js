import jwt from 'jsonwebtoken';
import { sendError } from '../utils/apiResponse.js';

function getJwtSecret() {
    return process.env.JWT_SECRET || 'development-secret';
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers?.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return sendError(res, {
            status: 401,
            message: 'Authentication token is required.',
        });
    }

    try {
        const decoded = jwt.verify(token, getJwtSecret());

        req.user = {
            id: decoded.id || decoded._id,
            role: decoded.role,
            email: decoded.email,
        };

        return next();
    } catch (error) {
        return sendError(res, {
            status: 401,
            message: 'Invalid or expired token.',
        });
    }
}

function optionalAuth(req, res, next) {
    const authHeader = req.headers?.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, getJwtSecret());
        req.user = {
            id: decoded.id || decoded._id,
            role: decoded.role,
            email: decoded.email,
        };
    } catch (error) {
        req.user = null;
    }

    return next();
}

export { authenticateToken, optionalAuth };
