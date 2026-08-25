function notFoundHandler(req, res) {
    return res.status(404).json({
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
}

function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
    console.error(error);

    if (res.headersSent) {
        return next(error);
    }

    const status = error.statusCode || error.status || 500;

    return res.status(status).json({
        message: status >= 500 ? 'An unexpected error occurred.' : error.message,
    });
}

export { errorHandler, notFoundHandler };
