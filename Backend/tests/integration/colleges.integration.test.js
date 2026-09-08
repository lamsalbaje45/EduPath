import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';

import supertest from 'supertest';

import { app } from '../../app.js';
import { authHeader, createAuthenticatedUser } from '../helpers/authHelpers.js';
import { createCollegeDoc } from '../helpers/fixtures.js';
import { clearTestDb, startTestDb, stopTestDb } from '../helpers/testDb.js';

before(startTestDb);
after(stopTestDb);
beforeEach(clearTestDb);

const request = supertest(app);

test('GET /api/colleges lists colleges without authentication', async () => {
    await createCollegeDoc({ collegeName: 'MIT' });

    const res = await request.get('/api/colleges');

    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.data[0].collegeName, 'MIT');
});

test('GET /api/colleges/:id returns 404 for a missing college', async () => {
    const res = await request.get('/api/colleges/507f1f77bcf86cd799439011');

    assert.equal(res.status, 404);
});

test('POST /api/colleges requires authentication', async () => {
    const res = await request.post('/api/colleges').send({ collegeName: 'New College', city: 'Pune' });

    assert.equal(res.status, 401);
});

test('POST /api/colleges rejects a student role', async () => {
    const { token } = await createAuthenticatedUser({ role: 'student' });

    const res = await request
        .post('/api/colleges')
        .set(authHeader(token))
        .send({ collegeName: 'New College', city: 'Pune' });

    assert.equal(res.status, 403);
});

test('POST /api/colleges as a college_admin creates a pending, owned college', async () => {
    const { user, token } = await createAuthenticatedUser({ role: 'college_admin' });

    const res = await request
        .post('/api/colleges')
        .set(authHeader(token))
        .send({ collegeName: 'New College', city: 'Pune' });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.approvalStatus, 'pending');
    assert.equal(res.body.data.owner, String(user._id));
});

test('POST /api/colleges as an admin auto-approves the college', async () => {
    const { token } = await createAuthenticatedUser({ role: 'admin' });

    const res = await request
        .post('/api/colleges')
        .set(authHeader(token))
        .send({ collegeName: 'Admin College', city: 'Kathmandu' });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.approvalStatus, 'approved');
});

test('POST /api/colleges validates required fields', async () => {
    const { token } = await createAuthenticatedUser({ role: 'admin' });

    const res = await request.post('/api/colleges').set(authHeader(token)).send({});

    assert.equal(res.status, 400);
});

test('PATCH /api/colleges/:id allows the owner but rejects a different college_admin', async () => {
    const owner = await createAuthenticatedUser({ role: 'college_admin' });
    const otherAdmin = await createAuthenticatedUser({ role: 'college_admin' });
    const college = await createCollegeDoc({ owner: owner.user._id });

    const forbidden = await request
        .patch(`/api/colleges/${college._id}`)
        .set(authHeader(otherAdmin.token))
        .send({ city: 'Hijacked' });

    const allowed = await request
        .patch(`/api/colleges/${college._id}`)
        .set(authHeader(owner.token))
        .send({ city: 'Updated City' });

    assert.equal(forbidden.status, 403);
    assert.equal(allowed.status, 200);
    assert.equal(allowed.body.data.city, 'Updated City');
});

test('PATCH /api/colleges/:id allows an admin to update any college', async () => {
    const owner = await createAuthenticatedUser({ role: 'college_admin' });
    const admin = await createAuthenticatedUser({ role: 'admin' });
    const college = await createCollegeDoc({ owner: owner.user._id });

    const res = await request
        .patch(`/api/colleges/${college._id}`)
        .set(authHeader(admin.token))
        .send({ city: 'Admin Updated' });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.city, 'Admin Updated');
});

test('DELETE /api/colleges/:id rejects a non-owner and allows the owner', async () => {
    const owner = await createAuthenticatedUser({ role: 'college_admin' });
    const otherAdmin = await createAuthenticatedUser({ role: 'college_admin' });
    const college = await createCollegeDoc({ owner: owner.user._id });

    const forbidden = await request.delete(`/api/colleges/${college._id}`).set(authHeader(otherAdmin.token));
    assert.equal(forbidden.status, 403);

    const allowed = await request.delete(`/api/colleges/${college._id}`).set(authHeader(owner.token));
    assert.equal(allowed.status, 200);

    const afterDelete = await request.get(`/api/colleges/${college._id}`);
    assert.equal(afterDelete.status, 404);
});

test('PATCH /api/colleges/:id/approval is restricted to admins', async () => {
    const owner = await createAuthenticatedUser({ role: 'college_admin' });
    const admin = await createAuthenticatedUser({ role: 'admin' });
    const college = await createCollegeDoc({ owner: owner.user._id, approvalStatus: 'pending' });

    const forbidden = await request
        .patch(`/api/colleges/${college._id}/approval`)
        .set(authHeader(owner.token))
        .send({ approvalStatus: 'approved' });

    const allowed = await request
        .patch(`/api/colleges/${college._id}/approval`)
        .set(authHeader(admin.token))
        .send({ approvalStatus: 'approved' });

    assert.equal(forbidden.status, 403);
    assert.equal(allowed.status, 200);
    assert.equal(allowed.body.data.approvalStatus, 'approved');
});
