import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';

import supertest from 'supertest';

import { app } from '../../app.js';
import { authHeader, createAuthenticatedUser } from '../helpers/authHelpers.js';
import { createOpportunityDoc } from '../helpers/fixtures.js';
import { clearTestDb, startTestDb, stopTestDb } from '../helpers/testDb.js';

before(startTestDb);
after(stopTestDb);
beforeEach(clearTestDb);

const request = supertest(app);

test('GET /api/opportunities lists opportunities without authentication', async () => {
    await createOpportunityDoc({ title: 'Backend Intern' });

    const res = await request.get('/api/opportunities');

    assert.equal(res.status, 200);
    assert.equal(res.body.data.length, 1);
    assert.equal(res.body.data[0].title, 'Backend Intern');
});

test('POST /api/opportunities rejects a student role and allows an employer', async () => {
    const student = await createAuthenticatedUser({ role: 'student' });
    const employer = await createAuthenticatedUser({ role: 'employer' });

    const forbidden = await request
        .post('/api/opportunities')
        .set(authHeader(student.token))
        .send({ title: 'Frontend Dev', companyName: 'Acme', type: 'job' });

    const allowed = await request
        .post('/api/opportunities')
        .set(authHeader(employer.token))
        .send({ title: 'Frontend Dev', companyName: 'Acme', type: 'job' });

    assert.equal(forbidden.status, 403);
    assert.equal(allowed.status, 201);
    assert.equal(allowed.body.data.approvalStatus, 'pending');
    assert.equal(allowed.body.data.employer, String(employer.user._id));
});

test('POST /api/opportunities rejects an invalid type value', async () => {
    const { token } = await createAuthenticatedUser({ role: 'employer' });

    const res = await request
        .post('/api/opportunities')
        .set(authHeader(token))
        .send({ title: 'Odd Job', companyName: 'Acme', type: 'volunteer' });

    assert.equal(res.status, 400);
});

test('PATCH /api/opportunities/:id rejects a non-owning employer and allows the owner', async () => {
    const owner = await createAuthenticatedUser({ role: 'employer' });
    const otherEmployer = await createAuthenticatedUser({ role: 'employer' });
    const opportunity = await createOpportunityDoc({ employer: owner.user._id });

    const forbidden = await request
        .patch(`/api/opportunities/${opportunity._id}`)
        .set(authHeader(otherEmployer.token))
        .send({ location: 'Hijacked' });

    const allowed = await request
        .patch(`/api/opportunities/${opportunity._id}`)
        .set(authHeader(owner.token))
        .send({ location: 'Remote' });

    assert.equal(forbidden.status, 403);
    assert.equal(allowed.status, 200);
    assert.equal(allowed.body.data.location, 'Remote');
});

test('DELETE /api/opportunities/:id rejects a non-owner and allows an admin', async () => {
    const owner = await createAuthenticatedUser({ role: 'employer' });
    const otherEmployer = await createAuthenticatedUser({ role: 'employer' });
    const admin = await createAuthenticatedUser({ role: 'admin' });
    const opportunity = await createOpportunityDoc({ employer: owner.user._id });

    const forbidden = await request
        .delete(`/api/opportunities/${opportunity._id}`)
        .set(authHeader(otherEmployer.token));
    assert.equal(forbidden.status, 403);

    const allowed = await request.delete(`/api/opportunities/${opportunity._id}`).set(authHeader(admin.token));
    assert.equal(allowed.status, 200);

    const afterDelete = await request.get(`/api/opportunities/${opportunity._id}`);
    assert.equal(afterDelete.status, 404);
});

test('PATCH /api/opportunities/:id/approval is restricted to admins', async () => {
    const owner = await createAuthenticatedUser({ role: 'employer' });
    const admin = await createAuthenticatedUser({ role: 'admin' });
    const opportunity = await createOpportunityDoc({ employer: owner.user._id, approvalStatus: 'pending' });

    const forbidden = await request
        .patch(`/api/opportunities/${opportunity._id}/approval`)
        .set(authHeader(owner.token))
        .send({ approvalStatus: 'approved' });

    const allowed = await request
        .patch(`/api/opportunities/${opportunity._id}/approval`)
        .set(authHeader(admin.token))
        .send({ approvalStatus: 'approved' });

    assert.equal(forbidden.status, 403);
    assert.equal(allowed.status, 200);
    assert.equal(allowed.body.data.approvalStatus, 'approved');
});
