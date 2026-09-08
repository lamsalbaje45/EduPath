import assert from 'node:assert/strict';
import test from 'node:test';

import { sendCreated, sendError, sendPaginated, sendSuccess } from '../utils/apiResponse.js';

function createRes() {
    return {
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

test('sendSuccess defaults to status 200 with a default message', () => {
    const res = createRes();

    sendSuccess(res, { data: { id: 1 } });

    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.success, true);
    assert.equal(res.payload.message, 'Request completed successfully.');
    assert.deepEqual(res.payload.data, { id: 1 });
});

test('sendSuccess omits data and meta keys when not provided', () => {
    const res = createRes();

    sendSuccess(res, {});

    assert.equal('data' in res.payload, false);
    assert.equal('meta' in res.payload, false);
});

test('sendSuccess forwards extra fields onto the payload', () => {
    const res = createRes();

    sendSuccess(res, { data: [], filters: { city: 'Pune' } });

    assert.deepEqual(res.payload.filters, { city: 'Pune' });
});

test('sendCreated responds with status 201 and a created message', () => {
    const res = createRes();

    sendCreated(res, { data: { id: 'abc' } });

    assert.equal(res.statusCode, 201);
    assert.equal(res.payload.success, true);
    assert.equal(res.payload.message, 'Resource created successfully.');
    assert.deepEqual(res.payload.data, { id: 'abc' });
});

test('sendPaginated defaults data to an empty array and includes meta', () => {
    const res = createRes();

    sendPaginated(res, { meta: { page: 1, total: 0 } });

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.payload.data, []);
    assert.deepEqual(res.payload.meta, { page: 1, total: 0 });
});

test('sendError defaults to status 500 with a generic message', () => {
    const res = createRes();

    sendError(res, {});

    assert.equal(res.statusCode, 500);
    assert.equal(res.payload.success, false);
    assert.equal(res.payload.message, 'An unexpected error occurred.');
    assert.equal('errors' in res.payload, false);
});

test('sendError attaches validation errors and a custom status', () => {
    const res = createRes();

    sendError(res, {
        status: 400,
        message: 'Validation failed',
        errors: [{ field: 'email', message: 'Invalid email' }],
    });

    assert.equal(res.statusCode, 400);
    assert.equal(res.payload.success, false);
    assert.deepEqual(res.payload.errors, [{ field: 'email', message: 'Invalid email' }]);
});
