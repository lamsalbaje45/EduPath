import assert from 'node:assert/strict';
import test from 'node:test';
import jwt from 'jsonwebtoken';

import { authenticateToken } from '../middleware/auth.js';

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

    assert.equal(res.statusCode, 200);
    assert.equal(nextCalled, true);
    assert.equal(req.user.id, '66d7c4a9ab9e11a0d4aa1234');
    assert.equal(req.user.role, 'student');
});
