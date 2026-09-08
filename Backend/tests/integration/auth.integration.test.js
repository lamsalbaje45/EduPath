import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';

import supertest from 'supertest';

import { app } from '../../app.js';
import { createUser } from '../helpers/authHelpers.js';
import { clearTestDb, startTestDb, stopTestDb } from '../helpers/testDb.js';

before(startTestDb);
after(stopTestDb);
beforeEach(clearTestDb);

const request = supertest(app);

test('POST /api/auth/register creates a student account and returns a token without the password hash', async () => {
    const res = await request.post('/api/auth/register').send({
        fullName: 'Bajen Lamsal',
        email: 'bajen@example.com',
        password: 'Sup3rSecret!',
        role: 'student',
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.user.email, 'bajen@example.com');
    assert.equal('passwordHash' in res.body.data.user, false);
    assert.ok(res.body.data.token);
});

test('POST /api/auth/register rejects a password missing the required character classes', async () => {
    const res = await request.post('/api/auth/register').send({
        fullName: 'Bajen Lamsal',
        email: 'weakpass@example.com',
        password: 'alllowercase1',
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.errors.some((error) => error.field === 'password'));
});

test('POST /api/auth/register rejects a duplicate email with a 409', async () => {
    await createUser({ email: 'duplicate@example.com' });

    const res = await request.post('/api/auth/register').send({
        fullName: 'Another User',
        email: 'duplicate@example.com',
        password: 'Sup3rSecret!',
    });

    assert.equal(res.status, 409);
});

test('POST /api/auth/login rejects an unknown email and a wrong password', async () => {
    await createUser({ email: 'login@example.com', password: 'CorrectPass1!' });

    const unknownEmail = await request.post('/api/auth/login').send({
        email: 'nobody@example.com',
        password: 'CorrectPass1!',
    });
    const wrongPassword = await request.post('/api/auth/login').send({
        email: 'login@example.com',
        password: 'WrongPass1!',
    });

    assert.equal(unknownEmail.status, 401);
    assert.equal(wrongPassword.status, 401);
});

test('POST /api/auth/login rejects a suspended account even with the correct password', async () => {
    await createUser({ email: 'suspended@example.com', password: 'CorrectPass1!', accountStatus: 'suspended' });

    const res = await request.post('/api/auth/login').send({
        email: 'suspended@example.com',
        password: 'CorrectPass1!',
    });

    assert.equal(res.status, 403);
});

test('POST /api/auth/login succeeds with correct credentials and returns a usable token', async () => {
    await createUser({ email: 'good@example.com', password: 'CorrectPass1!' });

    const res = await request.post('/api/auth/login').send({
        email: 'good@example.com',
        password: 'CorrectPass1!',
    });

    assert.equal(res.status, 200);
    assert.ok(res.body.data.token);

    const me = await request.get('/api/auth/me').set('Authorization', `Bearer ${res.body.data.token}`);
    assert.equal(me.status, 200);
    assert.equal(me.body.data.email, 'good@example.com');
});

test('GET /api/auth/me requires a bearer token', async () => {
    const res = await request.get('/api/auth/me');

    assert.equal(res.status, 401);
});

test('PATCH /api/auth/change-password rejects a wrong current password and accepts a correct one', async () => {
    await createUser({ email: 'change@example.com', password: 'OldPass1!' });
    const login = await request.post('/api/auth/login').send({ email: 'change@example.com', password: 'OldPass1!' });
    const token = login.body.data.token;

    const wrongCurrent = await request
        .patch('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'NotTheCurrentPass1!', newPassword: 'NewPass1!' });

    assert.equal(wrongCurrent.status, 401);

    const success = await request
        .patch('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'OldPass1!', newPassword: 'NewPass1!' });

    assert.equal(success.status, 200);

    const loginWithNewPassword = await request
        .post('/api/auth/login')
        .send({ email: 'change@example.com', password: 'NewPass1!' });

    assert.equal(loginWithNewPassword.status, 200);
});

test('password reset flow: request a token, confirm it, and log in with the new password', async () => {
    await createUser({ email: 'reset@example.com', password: 'OldPass1!' });

    const requestReset = await request.post('/api/auth/password-reset/request').send({ email: 'reset@example.com' });
    assert.equal(requestReset.status, 200);
    assert.ok(requestReset.body.data.resetToken);

    const confirmReset = await request.post('/api/auth/password-reset/confirm').send({
        token: requestReset.body.data.resetToken,
        newPassword: 'ResetPass1!',
    });
    assert.equal(confirmReset.status, 200);

    const loginAfterReset = await request
        .post('/api/auth/login')
        .send({ email: 'reset@example.com', password: 'ResetPass1!' });

    assert.equal(loginAfterReset.status, 200);
});

test('POST /api/auth/logout succeeds for an authenticated user', async () => {
    await createUser({ email: 'logout@example.com', password: 'OldPass1!' });
    const loginRes = await request.post('/api/auth/login').send({ email: 'logout@example.com', password: 'OldPass1!' });

    const res = await request.post('/api/auth/logout').set('Authorization', `Bearer ${loginRes.body.data.token}`);

    assert.equal(res.status, 200);
});
