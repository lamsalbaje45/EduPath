import assert from 'node:assert/strict';
import test from 'node:test';

import { requireAdmin, requireOwnershipOrAdmin, requireStudentSelf } from '../middleware/authorization.js';

test('requireAdmin rejects non-admin users', async () => {
    const req = { user: { id: 'u1', role: 'student' } };
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

    await requireAdmin(req, res, next);

    assert.equal(res.statusCode, 403);
    assert.equal(res.payload.success, false);
    assert.equal(nextCalled, false);
});

test('requireAdmin allows admin users', async () => {
    const req = { user: { id: 'admin-1', role: 'admin' } };
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

    await requireAdmin(req, res, next);

    assert.equal(res.statusCode, 200);
    assert.equal(nextCalled, true);
});

test('requireOwnershipOrAdmin allows owner and rejects other user', async () => {
    const ownerReq = {
        user: { id: 'owner-1', role: 'employer' },
        params: { id: 'owner-1' },
    };
    const otherReq = {
        user: { id: 'different-user', role: 'employer' },
        params: { id: 'owner-1' },
    };

    const ownerRes = {
        statusCode: 200,
        payload: null,
        status(code) { this.statusCode = code; return this; },
        json(payload) { this.payload = payload; return this; },
    };
    const otherRes = {
        statusCode: 200,
        payload: null,
        status(code) { this.statusCode = code; return this; },
        json(payload) { this.payload = payload; return this; },
    };

    let ownerNextCalled = false;
    let otherNextCalled = false;

    await requireOwnershipOrAdmin((req) => req.params.id)(ownerReq, ownerRes, () => {
        ownerNextCalled = true;
    });

    await requireOwnershipOrAdmin((req) => req.params.id)(otherReq, otherRes, () => {
        otherNextCalled = true;
    });

    assert.equal(ownerRes.statusCode, 200);
    assert.equal(ownerNextCalled, true);
    assert.equal(otherRes.statusCode, 403);
    assert.equal(otherNextCalled, false);
});

test('requireStudentSelf allows own student route and rejects others', async () => {
    const selfReq = { user: { id: 'student-1', role: 'student' }, params: { id: 'student-1' } };
    const otherReq = { user: { id: 'student-2', role: 'student' }, params: { id: 'student-1' } };

    const selfRes = { statusCode: 200, payload: null, status(code) { this.statusCode = code; return this; }, json(payload) { this.payload = payload; return this; } };
    const otherRes = { statusCode: 200, payload: null, status(code) { this.statusCode = code; return this; }, json(payload) { this.payload = payload; return this; } };

    let selfNextCalled = false;
    let otherNextCalled = false;

    await requireStudentSelf(selfReq, selfRes, () => { selfNextCalled = true; });
    await requireStudentSelf(otherReq, otherRes, () => { otherNextCalled = true; });

    assert.equal(selfRes.statusCode, 200);
    assert.equal(selfNextCalled, true);
    assert.equal(otherRes.statusCode, 403);
    assert.equal(otherNextCalled, false);
});
