import assert from 'node:assert/strict';
import test from 'node:test';

import {
    validateApplicationStatusBody,
    validateApprovalBody,
    validateClassBody,
    validateCollegeBody,
    validateInquiryCreateBody,
    validateLoginBody,
    validateOpportunityBody,
    validateRegisterBody,
    validateSavedItemParams,
    validateStudentProfileBody,
    validateUserRoleBody,
} from '../validators/requestValidators.js';

const VALID_OBJECT_ID = '507f1f77bcf86cd799439011';

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

async function run(validator, req) {
    const res = createRes();
    let nextCalled = false;

    await validator({ body: {}, params: {}, query: {}, ...req }, res, () => {
        nextCalled = true;
    });

    return { res, nextCalled };
}

test('validateRegisterBody accepts a well-formed registration payload', async () => {
    const { res, nextCalled } = await run(validateRegisterBody, {
        body: { fullName: 'Bajen Lamsal', email: 'bajen@example.com', password: 'supersecret', role: 'student' },
    });

    assert.equal(nextCalled, true);
    assert.equal(res.statusCode, 200);
});

test('validateRegisterBody rejects a short password and an admin role', async () => {
    const { res, nextCalled } = await run(validateRegisterBody, {
        body: { fullName: 'Bajen Lamsal', email: 'bajen@example.com', password: 'short', role: 'admin' },
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 400);
    const fields = res.payload.errors.map((error) => error.field);
    assert.ok(fields.includes('password'));
    assert.ok(fields.includes('role'));
});

test('validateRegisterBody rejects an invalid email', async () => {
    const { res, nextCalled } = await run(validateRegisterBody, {
        body: { fullName: 'Bajen Lamsal', email: 'not-an-email', password: 'supersecret' },
    });

    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 400);
});

test('validateLoginBody requires a non-empty password and a valid email', async () => {
    const missingPassword = await run(validateLoginBody, { body: { email: 'a@b.com', password: '' } });
    const valid = await run(validateLoginBody, { body: { email: 'a@b.com', password: 'anything' } });

    assert.equal(missingPassword.nextCalled, false);
    assert.equal(valid.nextCalled, true);
});

test('validateCollegeBody(true) requires collegeName and city on create', async () => {
    const { res, nextCalled } = await run(validateCollegeBody(true), { body: {} });

    assert.equal(nextCalled, false);
    const fields = res.payload.errors.map((error) => error.field);
    assert.ok(fields.includes('collegeName'));
    assert.ok(fields.includes('city'));
});

test('validateCollegeBody(false) allows a partial update payload', async () => {
    const { nextCalled } = await run(validateCollegeBody(false), { body: { description: 'Updated description' } });

    assert.equal(nextCalled, true);
});

test('validateCollegeBody rejects an invalid admissionStatus', async () => {
    const { res, nextCalled } = await run(validateCollegeBody(false), { body: { admissionStatus: 'maybe' } });

    assert.equal(nextCalled, false);
    assert.equal(res.payload.errors[0].field, 'admissionStatus');
});

test('validateOpportunityBody(true) requires title, companyName, and type', async () => {
    const { res, nextCalled } = await run(validateOpportunityBody(true), { body: {} });

    assert.equal(nextCalled, false);
    const fields = res.payload.errors.map((error) => error.field);
    assert.ok(fields.includes('title'));
    assert.ok(fields.includes('companyName'));
    assert.ok(fields.includes('type'));
});

test('validateOpportunityBody rejects an invalid type value', async () => {
    const { res, nextCalled } = await run(validateOpportunityBody(true), {
        body: { title: 'Frontend Developer', companyName: 'Acme', type: 'volunteer' },
    });

    assert.equal(nextCalled, false);
    assert.ok(res.payload.errors.some((error) => error.field === 'type'));
});

test('validateClassBody(true) requires classTitle and instructorOrOrganization', async () => {
    const { res, nextCalled } = await run(validateClassBody(true), { body: {} });

    assert.equal(nextCalled, false);
    const fields = res.payload.errors.map((error) => error.field);
    assert.ok(fields.includes('classTitle'));
    assert.ok(fields.includes('instructorOrOrganization'));
});

test('validateClassBody accepts a valid partial update', async () => {
    const { nextCalled } = await run(validateClassBody(false), {
        body: { price: 0, certificateAvailability: true, mode: 'live' },
    });

    assert.equal(nextCalled, true);
});

test('validateApprovalBody only accepts pending, approved, or rejected', async () => {
    const valid = await run(validateApprovalBody, { body: { approvalStatus: 'approved' } });
    const invalid = await run(validateApprovalBody, { body: { approvalStatus: 'archived' } });

    assert.equal(valid.nextCalled, true);
    assert.equal(invalid.nextCalled, false);
});

test('validateInquiryCreateBody requires targetType, targetRecord, and a non-empty message', async () => {
    const { res, nextCalled } = await run(validateInquiryCreateBody, { body: {} });

    assert.equal(nextCalled, false);
    const fields = res.payload.errors.map((error) => error.field);
    assert.ok(fields.includes('targetType'));
    assert.ok(fields.includes('targetRecord'));
    assert.ok(fields.includes('message'));
});

test('validateInquiryCreateBody accepts a valid inquiry', async () => {
    const { nextCalled } = await run(validateInquiryCreateBody, {
        body: { targetType: 'college', targetRecord: VALID_OBJECT_ID, message: 'Hello, is admission still open?' },
    });

    assert.equal(nextCalled, true);
});

test('validateApplicationStatusBody rejects an unsupported status', async () => {
    const { res, nextCalled } = await run(validateApplicationStatusBody, { body: { status: 'in_progress' } });

    assert.equal(nextCalled, false);
    assert.equal(res.payload.errors[0].field, 'status');
});

test('validateApplicationStatusBody accepts a supported status', async () => {
    const { nextCalled } = await run(validateApplicationStatusBody, { body: { status: 'shortlisted' } });

    assert.equal(nextCalled, true);
});

test('validateSavedItemParams rejects an unknown saved item type', async () => {
    const { res, nextCalled } = await run(validateSavedItemParams, {
        params: { type: 'bookmarks', itemId: VALID_OBJECT_ID },
    });

    assert.equal(nextCalled, false);
    assert.equal(res.payload.errors[0].field, 'type');
});

test('validateSavedItemParams accepts a valid type and MongoDB id', async () => {
    const { nextCalled } = await run(validateSavedItemParams, {
        params: { type: 'colleges', itemId: VALID_OBJECT_ID },
    });

    assert.equal(nextCalled, true);
});

test('validateUserRoleBody rejects a role outside the configured ROLES', async () => {
    const { res, nextCalled } = await run(validateUserRoleBody, { body: { role: 'superadmin' } });

    assert.equal(nextCalled, false);
    assert.equal(res.payload.errors[0].field, 'role');
});

test('validateStudentProfileBody rejects non-array skills and accepts a valid profile', async () => {
    const invalid = await run(validateStudentProfileBody, { body: { skills: 'React' } });
    const valid = await run(validateStudentProfileBody, {
        body: { skills: ['React'], preferredCourses: ['Computer Science'], bio: 'Aspiring developer.' },
    });

    assert.equal(invalid.nextCalled, false);
    assert.equal(valid.nextCalled, true);
});
