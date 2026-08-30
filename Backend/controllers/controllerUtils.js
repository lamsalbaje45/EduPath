import mongoose from 'mongoose';
import { sendCreated, sendError, sendPaginated, sendSuccess } from '../utils/apiResponse.js';

function asyncHandler(handler) {
    return function wrappedController(req, res, next) {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
}

function isDatabaseConnected() {
    return mongoose.connection.readyState === 1;
}

export { asyncHandler, isDatabaseConnected, sendCreated, sendError, sendPaginated, sendSuccess };
