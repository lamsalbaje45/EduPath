import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';

import { authenticateToken } from '../middleware/auth.js';
import { User } from '../models/user.js';

function withMockedUser(userRecord, callback) {
    const originalFindById = User.findById;
    User.findById = () => ({
        select: () => ({
            lean: async () => userRecord,
        }),
    });

    return Promise.resolve(callback()).finally(() => {
        User.findById = originalFindById;
    });
}

function createMockResponse() {
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

test('authenticateToken rejects missing authorization header', async () => {
    const req = { headers: {} };
    const res = {
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

    let nextCalled = false;
    const next = () => {
        nextCalled = true;
    };

    await authenticateToken(req, res, next);

    assert.equal(res.statusCode, 401);
    assert.equal(res.payload.success, false);
    assert.equal(nextCalled, false);
    assert.equal(res.payload.message, 'Authentication token is required.');
});

test('authenticateToken accepts valid bearer token and attaches user', async () => {
    process.env.JWT_SECRET = 'development-secret';
    const token = jwt.sign({ id: '66d7c4a9ab9e11a0d4aa1234', role: 'student' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createMockResponse();

    let nextCalled = false;
    const next = () => {
        nextCalled = true;
    };

    await withMockedUser(
        { role: 'student', email: 'student@example.com', accountStatus: 'active' },
        () => authenticateToken(req, res, next)
    );

    assert.equal(res.statusCode, 200);
    assert.equal(nextCalled, true);
    assert.equal(req.user.id, '66d7c4a9ab9e11a0d4aa1234');
    assert.equal(req.user.role, 'student');
});

test('authenticateToken rejects a suspended account even with a valid token', async () => {
    process.env.JWT_SECRET = 'development-secret';
    const token = jwt.sign({ id: '66d7c4a9ab9e11a0d4aa1234', role: 'student' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createMockResponse();

    let nextCalled = false;
    const next = () => {
        nextCalled = true;
    };

    await withMockedUser(
        { role: 'student', email: 'student@example.com', accountStatus: 'suspended' },
        () => authenticateToken(req, res, next)
    );

    assert.equal(res.statusCode, 403);
    assert.equal(nextCalled, false);
    assert.equal(res.payload.success, false);
});

test('authenticateToken rejects a token whose account no longer exists', async () => {
    process.env.JWT_SECRET = 'development-secret';
    const token = jwt.sign({ id: '66d7c4a9ab9e11a0d4aa1234', role: 'student' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createMockResponse();

    let nextCalled = false;
    const next = () => {
        nextCalled = true;
    };

    await withMockedUser(null, () => authenticateToken(req, res, next));

    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
});
