import { ROLES } from '../config/roles.js';
import { sendError } from '../utils/apiResponse.js';

function isAdmin(user) {
    return Boolean(user && user.role === ROLES.ADMIN);
}

function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return sendError(res, {
                status: 401,
                message: 'Authentication required.',
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return sendError(res, {
                status: 403,
                message: 'Not authorized for this action.',
            });
        }

        return next();
    };
}

const requireAdmin = requireRole(ROLES.ADMIN);

function requireOwnershipOrAdmin(getOwnerId, fieldName = 'ownerId') {
    return (req, res, next) => {
        if (!req.user) {
            return sendError(res, {
                status: 401,
                message: 'Authentication required.',
            });
        }

        if (isAdmin(req.user)) {
            return next();
        }

        const ownerId = getOwnerId(req);

        if (!ownerId) {
            return sendError(res, {
                status: 403,
                message: `Missing ${fieldName} for ownership check.`,
            });
        }

        if (String(ownerId) !== String(req.user.id)) {
            return sendError(res, {
                status: 403,
                message: 'You do not have permission to modify this resource.',
            });
        }

        return next();
    };
}

function requireStudentSelf(req, res, next) {
    if (!req.user) {
        return sendError(res, {
            status: 401,
            message: 'Authentication required.',
        });
    }

    const targetUserId = req.params.userId || req.params.id;

    if (isAdmin(req.user)) {
        return next();
    }

    if (!targetUserId || String(targetUserId) !== String(req.user.id)) {
        return sendError(res, {
            status: 403,
            message: 'You can only access your own student data.',
        });
    }

    return next();
}

export {
    isAdmin,
    requireAdmin,
    requireOwnershipOrAdmin,
    requireRole,
    requireStudentSelf,
};
