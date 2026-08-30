/**
 * Shared API response helpers.
 *
 * Successful responses always include `success`, `message`, and (when
 * applicable) `data`. Failed responses include `success: false`, a simple
 * message, and optional field-level `errors` for clients to display.
 */
function sendSuccess(res, { status = 200, message = 'Request completed successfully.', data, meta, ...extra } = {}) {
    return res.status(status).json({
        success: true,
        message,
        ...(data !== undefined ? { data } : {}),
        ...(meta !== undefined ? { meta } : {}),
        ...extra,
    });
}

function sendCreated(res, { message = 'Resource created successfully.', data, ...extra } = {}) {
    return sendSuccess(res, { status: 201, message, data, ...extra });
}

function sendPaginated(res, { message = 'Records retrieved successfully.', data = [], meta, ...extra } = {}) {
    return sendSuccess(res, { message, data, meta, ...extra });
}

function sendError(res, { status = 500, message = 'An unexpected error occurred.', errors, ...extra } = {}) {
    return res.status(status).json({
        success: false,
        message,
        ...(errors !== undefined ? { errors } : {}),
        ...extra,
    });
}

export { sendCreated, sendError, sendPaginated, sendSuccess };
