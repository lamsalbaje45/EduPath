import jwt from 'jsonwebtoken';
import { sendError } from '../utils/apiResponse.js';
import { User } from '../models/user.js';

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;

    if (secret) {
        return secret;
    }

    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be set in production.');
    }

    return 'development-secret';
}

async function authenticateToken(req, res, next) {
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
        const userId = decoded.id || decoded._id;

        const user = await User.findById(userId).select('role email accountStatus').lean();

        if (!user) {
            return sendError(res, { status: 401, message: 'Account no longer exists.' });
        }

        if (user.accountStatus !== 'active') {
            return sendError(res, {
                status: 403,
                message: `Your account is ${user.accountStatus}. Please contact support.`,
            });
        }

        req.user = {
            id: userId,
            role: user.role,
            email: user.email,
        };

        return next();
    } catch (error) {
        return sendError(res, {
            status: 401,
            message: 'Invalid or expired token.',
        });
    }
}

async function optionalAuth(req, res, next) {
    const authHeader = req.headers?.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, getJwtSecret());
        const userId = decoded.id || decoded._id;
        const user = await User.findById(userId).select('role email accountStatus').lean();

        req.user = user && user.accountStatus === 'active'
            ? { id: userId, role: user.role, email: user.email }
            : null;
    } catch (error) {
        req.user = null;
    }

    return next();
}

export { authenticateToken, getJwtSecret, optionalAuth };
