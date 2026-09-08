import assert from 'node:assert/strict';
import test from 'node:test';

import {
    buildClassQuery,
    buildCollegeQuery,
    buildOpportunityQuery,
    buildPagination,
    buildPaginationMetadata,
    buildSort,
    buildUserQuery,
} from '../services/queryBuilders.js';

test('buildPagination applies defaults when page and limit are missing', () => {
    const { page, limit, skip } = buildPagination({});

    assert.equal(page, 1);
    assert.equal(limit, 10);
    assert.equal(skip, 0);
});

test('buildPagination clamps page below 1 and limit above the max', () => {
    const { page, limit, skip } = buildPagination({ page: '0', limit: '500' });

    assert.equal(page, 1);
    assert.equal(limit, 100);
    assert.equal(skip, 0);
});

test('buildPagination computes skip from page and limit', () => {
    const { page, limit, skip } = buildPagination({ page: '3', limit: '5' });

    assert.equal(page, 3);
    assert.equal(limit, 5);
    assert.equal(skip, 10);
});

test('buildPaginationMetadata reports page bounds and totals', () => {
    const meta = buildPaginationMetadata({ page: 2, limit: 10, total: 25 });

    assert.equal(meta.totalPages, 3);
    assert.equal(meta.hasNextPage, true);
    assert.equal(meta.hasPrevPage, true);
});

test('buildPaginationMetadata treats a missing/negative total as zero', () => {
    const meta = buildPaginationMetadata({ page: 1, limit: 10, total: -5 });

    assert.equal(meta.total, 0);
    assert.equal(meta.totalPages, 0);
    assert.equal(meta.hasNextPage, false);
});

test('buildSort uses the default sort when sortBy is absent', () => {
    const sort = buildSort({}, { createdAt: -1 });

    assert.deepEqual(sort, { createdAt: -1 });
});

test('buildSort honors sortBy/sortOrder from the query', () => {
    const sort = buildSort({ sortBy: 'rating', sortOrder: 'desc' }, { createdAt: -1 });

    assert.deepEqual(sort, { rating: -1 });
});

test('buildSort defaults sortOrder to ascending', () => {
    const sort = buildSort({ sortBy: 'price' }, {});

    assert.deepEqual(sort, { price: 1 });
});

test('buildCollegeQuery builds a text search clause and normalizes list filters', () => {
    const { filter, search } = buildCollegeQuery({
        search: 'MIT',
        course: 'Computer Science,Data Science',
        city: 'Pune',
        admissionStatus: 'open',
    });

    assert.deepEqual(search.course, ['Computer Science', 'Data Science']);
    assert.deepEqual(search.city, ['Pune']);
    assert.equal(search.admissionStatus, 'open');
    assert.equal(search.searchTerm, 'MIT');
    assert.ok(Array.isArray(filter.$and));
    assert.ok(filter.$and.some((clause) => clause.admissionStatus === 'open'));
});

test('buildCollegeQuery returns an empty filter when no criteria are supplied', () => {
    const { filter } = buildCollegeQuery({});

    assert.deepEqual(filter, {});
});

test('buildCollegeQuery escapes regex metacharacters in search terms', () => {
    const { filter } = buildCollegeQuery({ search: 'C++ (Hons)' });
    const clause = filter.$and[0].$or[0];

    assert.doesNotThrow(() => clause.collegeName.test('C++ (Hons)'));
    assert.ok(clause.collegeName.test('C++ (Hons) Program'));
    assert.equal(clause.collegeName.test('C something Hons'), false);
});

test('buildCollegeQuery builds a rating range filter from ratingMin/ratingMax', () => {
    const { filter } = buildCollegeQuery({ ratingMin: '3', ratingMax: '4.5' });
    const ratingClause = filter.$and.find((clause) => clause.rating);

    assert.deepEqual(ratingClause.rating, { $gte: 3, $lte: 4.5 });
});

test('buildOpportunityQuery normalizes type/skill/location filters', () => {
    const { filter, search } = buildOpportunityQuery({
        type: 'job',
        skill: 'React,Node',
        location: 'Remote',
        workMode: 'remote',
        status: 'active',
    });

    assert.deepEqual(search.type, ['job']);
    assert.deepEqual(search.skill, ['React', 'Node']);
    assert.equal(search.status, 'active');
    assert.ok(filter.$and.some((clause) => Array.isArray(clause.type?.$in) && clause.type.$in.includes('job')));
});

test('buildOpportunityQuery ignores an invalid deadline date', () => {
    const { filter } = buildOpportunityQuery({ deadlineBefore: 'not-a-date' });

    assert.deepEqual(filter, {});
});

test('buildOpportunityQuery applies a valid deadlineAfter filter', () => {
    const { filter } = buildOpportunityQuery({ deadlineAfter: '2025-01-01' });
    const deadlineClause = filter.$and.find((clause) => clause.applicationDeadline);

    assert.ok(deadlineClause.applicationDeadline.$gte instanceof Date);
});

test('buildClassQuery converts the certificate filter to a boolean', () => {
    const { filter, search } = buildClassQuery({ certificate: 'true' });

    assert.equal(search.certificate, true);
    assert.ok(filter.$and.some((clause) => clause.certificateAvailability === true));
});

test('buildClassQuery leaves the certificate filter out when the value is not boolean-like', () => {
    const { filter, search } = buildClassQuery({ certificate: 'maybe' });

    assert.equal(search.certificate, undefined);
    assert.deepEqual(filter, {});
});

test('buildClassQuery builds a price range filter from priceMin/priceMax', () => {
    const { filter } = buildClassQuery({ priceMin: '0', priceMax: '50' });
    const priceClause = filter.$and.find((clause) => clause.price);

    assert.deepEqual(priceClause.price, { $gte: 0, $lte: 50 });
});

test('buildUserQuery forces the role filter when forceRole is supplied', () => {
    const { filter, search } = buildUserQuery({ role: 'admin' }, { forceRole: 'student' });

    assert.equal(search.role, 'student');
    assert.ok(filter.$and.some((clause) => clause.role === 'student'));
});
