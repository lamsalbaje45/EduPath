import assert from 'node:assert/strict';
import test from 'node:test';

import { errorHandler } from '../middleware/errorHandler.js';

function createResponse() {
    return {
        headersSent: false,
        statusCode: 200,
        payload: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.payload = payload;
            return this;
        },
    };
}

const request = { method: 'GET', originalUrl: '/api/test' };

test('error handler returns frontend-friendly MongoDB duplicate key errors', () => {
    const res = createResponse();
    const error = { code: 11000, keyValue: { email: 'student@example.com' } };

    errorHandler(error, request, res, () => {});

    assert.equal(res.statusCode, 409);
    assert.equal(res.payload.success, false);
    assert.equal(res.payload.message, 'A record with this value already exists.');
    assert.deepEqual(res.payload.errors, [{ field: 'email', message: 'email must be unique.' }]);
});

test('error handler returns field details for invalid MongoDB IDs', () => {
    const res = createResponse();
    const error = { name: 'CastError', path: '_id' };

    errorHandler(error, request, res, () => {});

    assert.equal(res.statusCode, 400);
    assert.equal(res.payload.success, false);
    assert.deepEqual(res.payload.errors, [{ field: '_id', message: 'A valid ID is required.' }]);
});

test('error handler does not expose unknown server errors', () => {
    const res = createResponse();
    const error = new Error('database password leaked');

    errorHandler(error, request, res, () => {});

    assert.equal(res.statusCode, 500);
    assert.equal(res.payload.success, false);
    assert.equal(res.payload.message, 'An unexpected error occurred.');
});
