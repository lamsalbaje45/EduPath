import { sendError } from '../utils/apiResponse.js';

function notFoundHandler(req, res) {
    return sendError(res, {
        status: 404,
        message: 'Route not found.',
    });
}

function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
    console.error(error);

    if (res.headersSent) {
        return next(error);
    }

    const status = error.statusCode || error.status || 500;

    return sendError(res, {
        status,
        message: status >= 500 ? 'An unexpected error occurred.' : error.message,
    });
}

export { errorHandler, notFoundHandler };
