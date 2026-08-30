import assert from 'node:assert/strict';
import test from 'node:test';

import {
    validateCollegeListQuery,
    validateClassListQuery,
    validateOpportunityListQuery,
    validateObjectId,
} from '../validators/requestValidators.js';

test('college list validation rejects invalid pagination values', async () => {
    const req = { query: { page: '0', limit: '250' } };
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

    await validateCollegeListQuery(req, res, next);

    assert.equal(res.statusCode, 400);
    assert.equal(nextCalled, false);
    assert.equal(res.payload.message, 'Validation failed');
    assert.ok(Array.isArray(res.payload.errors));
});

test('opportunity list validation accepts valid filters and pagination', async () => {
    const req = {
        query: {
            search: 'Frontend Developer',
            type: 'job',
            skill: 'React',
            location: 'Remote',
            workMode: 'remote',
            status: 'active',
            page: '1',
            limit: '10',
        }
    };
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

    await validateOpportunityListQuery(req, res, next);

    assert.equal(res.statusCode, 200);
    assert.equal(nextCalled, true);
});

test('class list validation rejects invalid certificate filter', async () => {
    const req = { query: { certificate: 'maybe' } };
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

    await validateClassListQuery(req, res, next);

    assert.equal(res.statusCode, 400);
    assert.equal(nextCalled, false);
});

test('object id validation rejects invalid ids', async () => {
    const req = { params: { id: 'abc' } };
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

    await validateObjectId('id')(req, res, next);

    assert.equal(res.statusCode, 400);
    assert.equal(nextCalled, false);
    assert.equal(res.payload.errors[0].field, 'id');
});
