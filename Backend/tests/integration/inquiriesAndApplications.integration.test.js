import assert from 'node:assert/strict';
import { after, before, beforeEach, test } from 'node:test';

import supertest from 'supertest';

import { app } from '../../app.js';
import { cloudinary } from '../../config/cloudinary.js';
import { CV } from '../../models/cv.js';
import { authHeader, createAuthenticatedUser } from '../helpers/authHelpers.js';
import { createCollegeDoc, createOpportunityDoc } from '../helpers/fixtures.js';
import { clearTestDb, startTestDb, stopTestDb } from '../helpers/testDb.js';

const hasCloudinaryCredentials = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

before(startTestDb);
after(stopTestDb);
beforeEach(clearTestDb);

const request = supertest(app);

test('POST /api/inquiries is restricted to students and requires a real target record', async () => {
    const student = await createAuthenticatedUser({ role: 'student' });
    const employer = await createAuthenticatedUser({ role: 'employer' });
    const college = await createCollegeDoc();

    const forbidden = await request
        .post('/api/inquiries')
        .set(authHeader(employer.token))
        .send({ targetType: 'college', targetRecord: college._id, message: 'Hello there' });
    assert.equal(forbidden.status, 403);

    const notFound = await request
        .post('/api/inquiries')
        .set(authHeader(student.token))
        .send({ targetType: 'college', targetRecord: '507f1f77bcf86cd799439011', message: 'Hello there' });
    assert.equal(notFound.status, 404);

    const created = await request
        .post('/api/inquiries')
        .set(authHeader(student.token))
        .send({ targetType: 'college', targetRecord: college._id, message: 'Is admission still open?' });
    assert.equal(created.status, 201);
    assert.equal(created.body.data.status, 'new');
});

test('inquiries are visible to the sender and the target owner, and hidden from unrelated users', async () => {
    const student = await createAuthenticatedUser({ role: 'student' });
    const owner = await createAuthenticatedUser({ role: 'college_admin' });
    const unrelatedAdmin = await createAuthenticatedUser({ role: 'college_admin' });
    const college = await createCollegeDoc({ owner: owner.user._id, collegeName: 'Owned College' });

    await request
        .post('/api/inquiries')
        .set(authHeader(student.token))
        .send({ targetType: 'college', targetRecord: college._id, message: 'Is admission still open?' });

    const mine = await request.get('/api/inquiries/me').set(authHeader(student.token));
    assert.equal(mine.status, 200);
    assert.equal(mine.body.data.length, 1);
    assert.equal(mine.body.data[0].targetName, 'Owned College');

    const receivedByOwner = await request.get('/api/inquiries/received').set(authHeader(owner.token));
    assert.equal(receivedByOwner.body.data.length, 1);

    const receivedByUnrelated = await request.get('/api/inquiries/received').set(authHeader(unrelatedAdmin.token));
    assert.equal(receivedByUnrelated.body.data.length, 0);

    const receivedByStudent = await request.get('/api/inquiries/received').set(authHeader(student.token));
    assert.equal(receivedByStudent.status, 403);
});

test('PATCH /api/inquiries/:id/status is restricted to the target owner or an admin', async () => {
    const student = await createAuthenticatedUser({ role: 'student' });
    const owner = await createAuthenticatedUser({ role: 'college_admin' });
    const unrelatedAdmin = await createAuthenticatedUser({ role: 'college_admin' });
    const college = await createCollegeDoc({ owner: owner.user._id });

    const created = await request
        .post('/api/inquiries')
        .set(authHeader(student.token))
        .send({ targetType: 'college', targetRecord: college._id, message: 'Is admission still open?' });
    const inquiryId = created.body.data._id;

    const forbidden = await request
        .patch(`/api/inquiries/${inquiryId}/status`)
        .set(authHeader(unrelatedAdmin.token))
        .send({ status: 'read' });
    assert.equal(forbidden.status, 403);

    const allowed = await request
        .patch(`/api/inquiries/${inquiryId}/status`)
        .set(authHeader(owner.token))
        .send({ status: 'read' });
    assert.equal(allowed.status, 200);
    assert.equal(allowed.body.data.status, 'read');
});

test('DELETE /api/inquiries/:id only allows the student to withdraw a still-new inquiry', async () => {
    const student = await createAuthenticatedUser({ role: 'student' });
    const owner = await createAuthenticatedUser({ role: 'college_admin' });
    const college = await createCollegeDoc({ owner: owner.user._id });

    const created = await request
        .post('/api/inquiries')
        .set(authHeader(student.token))
        .send({ targetType: 'college', targetRecord: college._id, message: 'Is admission still open?' });
    const inquiryId = created.body.data._id;

    await request.patch(`/api/inquiries/${inquiryId}/status`).set(authHeader(owner.token)).send({ status: 'read' });

    const tooLate = await request.delete(`/api/inquiries/${inquiryId}`).set(authHeader(student.token));
    assert.equal(tooLate.status, 403);
});

test('POST /api/applications is restricted to students, requires an active opportunity, and blocks duplicates', async () => {
    const student = await createAuthenticatedUser({ role: 'student' });
    const employer = await createAuthenticatedUser({ role: 'employer' });
    const activeOpportunity = await createOpportunityDoc({ employer: employer.user._id, status: 'active' });
    const closedOpportunity = await createOpportunityDoc({ employer: employer.user._id, status: 'closed' });

    const forbidden = await request
        .post('/api/applications')
        .set(authHeader(employer.token))
        .send({ opportunity: activeOpportunity._id });
    assert.equal(forbidden.status, 403);

    const closedRejected = await request
        .post('/api/applications')
        .set(authHeader(student.token))
        .send({ opportunity: closedOpportunity._id });
    assert.equal(closedRejected.status, 400);

    const created = await request
        .post('/api/applications')
        .set(authHeader(student.token))
        .send({ opportunity: activeOpportunity._id, coverMessage: 'I would love to join.' });
    assert.equal(created.status, 201);
    assert.equal(created.body.data.status, 'submitted');

    const duplicate = await request
        .post('/api/applications')
        .set(authHeader(student.token))
        .send({ opportunity: activeOpportunity._id });
    assert.equal(duplicate.status, 409);
});

test(
    'POST /api/applications accepts an uploaded PDF CV and skips the saved CV Maker snapshot',
    { skip: !hasCloudinaryCredentials && 'Requires CLOUDINARY_* env vars to run against real Cloudinary' },
    async () => {
        const student = await createAuthenticatedUser({ role: 'student' });
        const employer = await createAuthenticatedUser({ role: 'employer' });
        const opportunity = await createOpportunityDoc({ employer: employer.user._id, status: 'active' });

        await CV.create({ student: student.user._id, personalDetails: { summary: 'Saved CV summary' } });

        const created = await request
            .post('/api/applications')
            .set(authHeader(student.token))
            .field('opportunity', String(opportunity._id))
            .field('coverMessage', 'Please see my attached CV.')
            .attach('cvFile', Buffer.from('%PDF-1.4 fake pdf content for testing'), {
                filename: 'resume.pdf',
                contentType: 'application/pdf',
            });

        assert.equal(created.status, 201);
        assert.equal(created.body.data.manualCvFile.filename, 'resume.pdf');
        assert.match(created.body.data.manualCvFile.url, /^https:\/\/res\.cloudinary\.com\//);
        assert.equal(created.body.data.cvReference, undefined);
        assert.equal(created.body.data.cvSnapshot, undefined);

        await cloudinary.uploader.destroy(created.body.data.manualCvFile.publicId, { resource_type: 'raw' });
    }
);

test('POST /api/applications rejects a non-PDF CV upload', async () => {
    const student = await createAuthenticatedUser({ role: 'student' });
    const employer = await createAuthenticatedUser({ role: 'employer' });
    const opportunity = await createOpportunityDoc({ employer: employer.user._id, status: 'active' });

    const rejected = await request
        .post('/api/applications')
        .set(authHeader(student.token))
        .field('opportunity', String(opportunity._id))
        .attach('cvFile', Buffer.from('not a pdf'), { filename: 'resume.txt', contentType: 'text/plain' });

    assert.equal(rejected.status, 400);
});

test('applications are visible to the applicant and the owning employer, and hidden from unrelated employers', async () => {
    const student = await createAuthenticatedUser({ role: 'student' });
    const owner = await createAuthenticatedUser({ role: 'employer' });
    const unrelatedEmployer = await createAuthenticatedUser({ role: 'employer' });
    const opportunity = await createOpportunityDoc({ employer: owner.user._id, status: 'active' });

    await request
        .post('/api/applications')
        .set(authHeader(student.token))
        .send({ opportunity: opportunity._id });

    const mine = await request.get('/api/applications/me').set(authHeader(student.token));
    assert.equal(mine.body.data.length, 1);

    const receivedByOwner = await request.get('/api/applications/received').set(authHeader(owner.token));
    assert.equal(receivedByOwner.body.data.length, 1);

    const receivedByUnrelated = await request.get('/api/applications/received').set(authHeader(unrelatedEmployer.token));
    assert.equal(receivedByUnrelated.body.data.length, 0);
});

test('PATCH /api/applications/:id/status is restricted to the owning employer or an admin', async () => {
    const student = await createAuthenticatedUser({ role: 'student' });
    const owner = await createAuthenticatedUser({ role: 'employer' });
    const unrelatedEmployer = await createAuthenticatedUser({ role: 'employer' });
    const opportunity = await createOpportunityDoc({ employer: owner.user._id, status: 'active' });

    const created = await request
        .post('/api/applications')
        .set(authHeader(student.token))
        .send({ opportunity: opportunity._id });
    const applicationId = created.body.data._id;

    const forbidden = await request
        .patch(`/api/applications/${applicationId}/status`)
        .set(authHeader(unrelatedEmployer.token))
        .send({ status: 'shortlisted' });
    assert.equal(forbidden.status, 403);

    const allowed = await request
        .patch(`/api/applications/${applicationId}/status`)
        .set(authHeader(owner.token))
        .send({ status: 'shortlisted' });
    assert.equal(allowed.status, 200);
    assert.equal(allowed.body.data.status, 'shortlisted');
});

test('DELETE /api/applications/:id only allows withdrawal while still submitted', async () => {
    const student = await createAuthenticatedUser({ role: 'student' });
    const owner = await createAuthenticatedUser({ role: 'employer' });
    const opportunity = await createOpportunityDoc({ employer: owner.user._id, status: 'active' });

    const created = await request
        .post('/api/applications')
        .set(authHeader(student.token))
        .send({ opportunity: opportunity._id });
    const applicationId = created.body.data._id;

    await request
        .patch(`/api/applications/${applicationId}/status`)
        .set(authHeader(owner.token))
        .send({ status: 'reviewing' });

    const tooLate = await request.delete(`/api/applications/${applicationId}`).set(authHeader(student.token));
    assert.equal(tooLate.status, 403);
});
