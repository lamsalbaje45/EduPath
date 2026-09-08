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

test('GET and PATCH /api/users/me retrieve and update the caller\'s own account', async () => {
    const { token } = await createAuthenticatedUser({ role: 'student', fullName: 'Original Name' });

    const before1 = await request.get('/api/users/me').set(authHeader(token));
    assert.equal(before1.status, 200);
    assert.equal(before1.body.data.fullName, 'Original Name');

    const updated = await request
        .patch('/api/users/me')
        .set(authHeader(token))
        .send({ fullName: 'Updated Name' });

    assert.equal(updated.status, 200);
    assert.equal(updated.body.data.fullName, 'Updated Name');
});

test('GET /api/users is restricted to admins', async () => {
    const student = await createAuthenticatedUser({ role: 'student' });
    const admin = await createAuthenticatedUser({ role: 'admin' });

    const forbidden = await request.get('/api/users').set(authHeader(student.token));
    const allowed = await request.get('/api/users').set(authHeader(admin.token));

    assert.equal(forbidden.status, 403);
    assert.equal(allowed.status, 200);
    assert.ok(allowed.body.data.length >= 2);
});

test('PATCH /api/users/:id/status and /role are restricted to admins', async () => {
    const target = await createAuthenticatedUser({ role: 'student' });
    const admin = await createAuthenticatedUser({ role: 'admin' });

    const forbiddenStatus = await request
        .patch(`/api/users/${target.user._id}/status`)
        .set(authHeader(target.token))
        .send({ accountStatus: 'suspended' });
    assert.equal(forbiddenStatus.status, 403);

    const allowedStatus = await request
        .patch(`/api/users/${target.user._id}/status`)
        .set(authHeader(admin.token))
        .send({ accountStatus: 'suspended' });
    assert.equal(allowedStatus.status, 200);
    assert.equal(allowedStatus.body.data.accountStatus, 'suspended');

    const allowedRole = await request
        .patch(`/api/users/${target.user._id}/role`)
        .set(authHeader(admin.token))
        .send({ role: 'employer' });
    assert.equal(allowedRole.status, 200);
    assert.equal(allowedRole.body.data.role, 'employer');
});

test('DELETE /api/users/:id is restricted to admins', async () => {
    const target = await createAuthenticatedUser({ role: 'student' });
    const otherStudent = await createAuthenticatedUser({ role: 'student' });
    const admin = await createAuthenticatedUser({ role: 'admin' });

    const forbidden = await request.delete(`/api/users/${target.user._id}`).set(authHeader(otherStudent.token));
    assert.equal(forbidden.status, 403);

    const allowed = await request.delete(`/api/users/${target.user._id}`).set(authHeader(admin.token));
    assert.equal(allowed.status, 200);
});

test('GET and PATCH /api/students/me manage the student profile', async () => {
    const { token } = await createAuthenticatedUser({ role: 'student' });

    const profile = await request.get('/api/students/me').set(authHeader(token));
    assert.equal(profile.status, 200);
    assert.deepEqual(profile.body.data.studentProfile.skills, []);

    const updated = await request
        .patch('/api/students/me')
        .set(authHeader(token))
        .send({ skills: ['React', 'Node'], currentCourse: 'Computer Science' });

    assert.equal(updated.status, 200);
    assert.deepEqual(updated.body.data.studentProfile.skills, ['React', 'Node']);
    assert.equal(updated.body.data.studentProfile.currentCourse, 'Computer Science');
});

test('GET /api/students/:id enforces requireStudentSelf', async () => {
    const self = await createAuthenticatedUser({ role: 'student' });
    const otherStudent = await createAuthenticatedUser({ role: 'student' });
    const admin = await createAuthenticatedUser({ role: 'admin' });

    const forbidden = await request.get(`/api/students/${self.user._id}`).set(authHeader(otherStudent.token));
    assert.equal(forbidden.status, 403);

    const ownAccess = await request.get(`/api/students/${self.user._id}`).set(authHeader(self.token));
    assert.equal(ownAccess.status, 200);

    const adminAccess = await request.get(`/api/students/${self.user._id}`).set(authHeader(admin.token));
    assert.equal(adminAccess.status, 200);
});

test('saved items: add, list, and remove a saved college', async () => {
    const { token } = await createAuthenticatedUser({ role: 'student' });
    const college = await createCollegeDoc({ collegeName: 'Saved College' });

    const initial = await request.get('/api/students/me/saved').set(authHeader(token));
    assert.equal(initial.status, 200);
    assert.deepEqual(initial.body.data.colleges, []);

    const add = await request
        .post(`/api/students/me/saved/colleges/${college._id}`)
        .set(authHeader(token));
    assert.equal(add.status, 200);

    const afterAdd = await request.get('/api/students/me/saved').set(authHeader(token));
    assert.equal(afterAdd.body.data.colleges.length, 1);
    assert.equal(afterAdd.body.data.colleges[0]._id, String(college._id));

    const remove = await request
        .delete(`/api/students/me/saved/colleges/${college._id}`)
        .set(authHeader(token));
    assert.equal(remove.status, 200);

    const afterRemove = await request.get('/api/students/me/saved').set(authHeader(token));
    assert.deepEqual(afterRemove.body.data.colleges, []);
});

test('saved items rejects an unsupported item type', async () => {
    const { token } = await createAuthenticatedUser({ role: 'student' });

    const res = await request
        .post('/api/students/me/saved/bookmarks/507f1f77bcf86cd799439011')
        .set(authHeader(token));

    assert.equal(res.status, 400);
});
