import { sendError } from '../utils/apiResponse.js';

function createError(status, message, errors) {
    const error = new Error(message);
    error.status = status;
    error.errors = errors;
    return error;
}

function normalizeError(error) {
    if (error?.name === 'ValidationError') {
        const errors = Object.values(error.errors || {}).map((item) => ({
            field: item.path || 'unknown',
            message: item.message,
        }));
        return createError(400, 'Validation failed.', errors);
    }

    if (error?.name === 'CastError') {
        return createError(400, 'Invalid resource ID.', [{
            field: error.path || 'id',
            message: 'A valid ID is required.',
        }]);
    }

    if (error?.code === 11000) {
        const fields = Object.keys(error.keyValue || {});
        const field = fields[0] || 'field';
        return createError(409, 'A record with this value already exists.', [{
            field,
            message: `${field} must be unique.`,
        }]);
    }

    if (error?.name === 'JsonWebTokenError' || error?.name === 'TokenExpiredError') {
        return createError(401, 'Invalid or expired token.');
    }

    if (error?.name === 'UnauthorizedError') {
        return createError(401, 'Authentication is required.');
    }

    if (error?.status === 401 || error?.statusCode === 401) {
        return createError(401, error.message || 'Authentication is required.');
    }

    if (error?.status === 403 || error?.statusCode === 403) {
        return createError(403, error.message || 'You do not have permission to perform this action.');
    }

    return error;
}

function notFoundHandler(req, res) {
    return sendError(res, {
        status: 404,
        message: 'Route not found.',
    });
}

function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
    const normalizedError = normalizeError(error);
    const status = normalizedError.statusCode || normalizedError.status || 500;

    if (res.headersSent) {
        return next(normalizedError);
    }

    console.error({
        status,
        method: req.method,
        path: req.originalUrl,
        message: normalizedError.message,
        stack: normalizedError.stack,
    });

    return sendError(res, {
        status,
        message: status >= 500 ? 'An unexpected error occurred.' : normalizedError.message,
        ...(normalizedError.errors ? { errors: normalizedError.errors } : {}),
    });
}

export { errorHandler, normalizeError, notFoundHandler };
