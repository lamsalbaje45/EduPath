import mongoose from 'mongoose';

function asyncHandler(handler) {
    return function wrappedController(req, res, next) {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
}

function sendSuccess(res, { status = 200, message, data, meta, ...extra }) {
    return res.status(status).json({
        message,
        ...(data !== undefined ? { data } : {}),
        ...(meta !== undefined ? { meta } : {}),
        ...extra,
    });
}

function isDatabaseConnected() {
    return mongoose.connection.readyState === 1;
}

export { asyncHandler, isDatabaseConnected, sendSuccess };
