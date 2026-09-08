import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';

import supertest from 'supertest';

import { app } from '../../app.js';
import { authHeader, createAuthenticatedUser } from '../helpers/authHelpers.js';
import { createClassDoc } from '../helpers/fixtures.js';
import { clearTestDb, startTestDb, stopTestDb } from '../helpers/testDb.js';

before(startTestDb);
after(stopTestDb);
beforeEach(clearTestDb);

const request = supertest(app);

test('GET /api/classes lists classes without authentication', async () => {
    await createClassDoc({ classTitle: 'Intro to Node' });

    const res = await request.get('/api/classes');

    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.data[0].classTitle, 'Intro to Node');
});

test('POST /api/classes rejects a student role and allows an instructor', async () => {
    const student = await createAuthenticatedUser({ role: 'student' });
    const instructor = await createAuthenticatedUser({ role: 'instructor' });

    const forbidden = await request
        .post('/api/classes')
        .set(authHeader(student.token))
        .send({ classTitle: 'React Basics', instructorOrOrganization: 'Acme Academy' });

    const allowed = await request
        .post('/api/classes')
        .set(authHeader(instructor.token))
        .send({ classTitle: 'React Basics', instructorOrOrganization: 'Acme Academy' });

    assert.equal(forbidden.status, 403);
    assert.equal(allowed.status, 201);
    assert.equal(allowed.body.data.approvalStatus, 'pending');
    assert.equal(allowed.body.data.owner, String(instructor.user._id));
});

test('POST /api/classes rejects an invalid mode value', async () => {
    const { token } = await createAuthenticatedUser({ role: 'instructor' });

    const res = await request
        .post('/api/classes')
        .set(authHeader(token))
        .send({ classTitle: 'React Basics', instructorOrOrganization: 'Acme Academy', mode: 'in_person' });

    assert.equal(res.status, 400);
});

test('PATCH /api/classes/:id rejects a non-owning instructor and allows the owner', async () => {
    const owner = await createAuthenticatedUser({ role: 'instructor' });
    const otherInstructor = await createAuthenticatedUser({ role: 'instructor' });
    const onlineClass = await createClassDoc({ owner: owner.user._id });

    const forbidden = await request
        .patch(`/api/classes/${onlineClass._id}`)
        .set(authHeader(otherInstructor.token))
        .send({ price: 0 });

    const allowed = await request
        .patch(`/api/classes/${onlineClass._id}`)
        .set(authHeader(owner.token))
        .send({ price: 25 });

    assert.equal(forbidden.status, 403);
    assert.equal(allowed.status, 200);
    assert.equal(allowed.body.data.price, 25);
});

test('DELETE /api/classes/:id rejects a non-owner and allows an admin', async () => {
    const owner = await createAuthenticatedUser({ role: 'instructor' });
    const otherInstructor = await createAuthenticatedUser({ role: 'instructor' });
    const admin = await createAuthenticatedUser({ role: 'admin' });
    const onlineClass = await createClassDoc({ owner: owner.user._id });

    const forbidden = await request.delete(`/api/classes/${onlineClass._id}`).set(authHeader(otherInstructor.token));
    assert.equal(forbidden.status, 403);

    const allowed = await request.delete(`/api/classes/${onlineClass._id}`).set(authHeader(admin.token));
    assert.equal(allowed.status, 200);

    const afterDelete = await request.get(`/api/classes/${onlineClass._id}`);
    assert.equal(afterDelete.status, 404);
});

test('PATCH /api/classes/:id/approval is restricted to admins', async () => {
    const owner = await createAuthenticatedUser({ role: 'instructor' });
    const admin = await createAuthenticatedUser({ role: 'admin' });
    const onlineClass = await createClassDoc({ owner: owner.user._id, approvalStatus: 'pending' });

    const forbidden = await request
        .patch(`/api/classes/${onlineClass._id}/approval`)
        .set(authHeader(owner.token))
        .send({ approvalStatus: 'rejected' });

    const allowed = await request
        .patch(`/api/classes/${onlineClass._id}/approval`)
        .set(authHeader(admin.token))
        .send({ approvalStatus: 'rejected' });

    assert.equal(forbidden.status, 403);
    assert.equal(allowed.status, 200);
    assert.equal(allowed.body.data.approvalStatus, 'rejected');
});
