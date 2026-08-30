import assert from 'node:assert/strict';
import test from 'node:test';

import collegesRouter from '../routes/colleges.js';
import opportunitiesRouter from '../routes/opportunities.js';
import classesRouter from '../routes/classes.js';

async function invokeRoute(router, query) {
    const layer = router.stack.find((entry) => entry.route && entry.route.path === '/');

    if (!layer) {
        throw new Error('Route not found');
    }

    const handler = layer.route.stack.at(-1).handle;
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

    await handler({ query }, res, () => { });

    return res.payload;
}

test('college route exposes pagination metadata and search filters', async () => {
    const payload = await invokeRoute(collegesRouter, {
        search: 'MIT',
        course: 'Computer Science',
        city: 'Pune',
        admissionStatus: 'open',
        sortBy: 'rating',
        sortOrder: 'desc',
        page: '2',
        limit: '5',
    });

    assert.equal(payload.meta.page, 2);
    assert.equal(payload.meta.limit, 5);
    assert.equal(payload.filters.searchTerm, 'MIT');
    assert.deepEqual(payload.filters.course, ['Computer Science']);
    assert.deepEqual(payload.filters.city, ['Pune']);
    assert.equal(payload.filters.admissionStatus, 'open');
    assert.ok(payload.meta.total >= 0);
});

test('opportunity route exposes pagination metadata and opportunity filters', async () => {
    const payload = await invokeRoute(opportunitiesRouter, {
        search: 'frontend',
        type: 'job',
        skill: 'React',
        location: 'Remote',
        workMode: 'remote',
        status: 'active',
        page: '1',
        limit: '10',
    });

    assert.equal(payload.meta.page, 1);
    assert.equal(payload.meta.limit, 10);
    assert.equal(payload.filters.searchTerm, 'frontend');
    assert.deepEqual(payload.filters.type, ['job']);
    assert.deepEqual(payload.filters.skill, ['React']);
    assert.equal(payload.filters.status, 'active');
});

test('class route exposes pagination metadata and class filters', async () => {
    const payload = await invokeRoute(classesRouter, {
        search: 'node',
        level: 'beginner',
        mode: 'live',
        certificate: 'true',
        sortBy: 'price',
        sortOrder: 'asc',
        page: '3',
        limit: '7',
    });

    assert.equal(payload.meta.page, 3);
    assert.equal(payload.meta.limit, 7);
    assert.equal(payload.filters.searchTerm, 'node');
    assert.deepEqual(payload.filters.level, ['beginner']);
    assert.deepEqual(payload.filters.mode, ['live']);
    assert.equal(payload.filters.certificate, true);
});
