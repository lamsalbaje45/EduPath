import assert from 'node:assert/strict';
import test from 'node:test';

import { ROLES } from '../config/roles.js';
import { colleges, onlineClasses, opportunities, sampleUsers } from '../seeds/initialData.js';

test('initial seed users include every supported role', () => {
    assert.deepEqual(
        new Set(sampleUsers.map((user) => user.role)),
        new Set(Object.values(ROLES))
    );
    assert.equal(new Set(sampleUsers.map((user) => user.email)).size, sampleUsers.length);
});

test('initial catalog records have unique upsert identities', () => {
    for (const records of [colleges, opportunities, onlineClasses]) {
        const identities = records.map((record) => JSON.stringify(record.identity));

        assert.equal(new Set(identities).size, records.length);
    }
});
