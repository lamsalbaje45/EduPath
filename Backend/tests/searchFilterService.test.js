import assert from 'node:assert/strict';
import test from 'node:test';

import {
    buildAdvancedClassFilter,
    buildAdvancedOpportunityFilter,
    buildAdvancedUserFilter,
    getClassSortOptions,
    getFilterSuggestions,
    getOpportunityFacets,
    getOpportunitySortOptions,
    getUserSortOptions,
} from '../services/searchFilterService.js';

test('buildAdvancedOpportunityFilter combines search, location, skills, and type filters', () => {
    const filter = buildAdvancedOpportunityFilter({
        search: 'developer',
        location: 'Remote,Pune',
        skills: 'React,Node',
        type: 'job',
    });

    assert.deepEqual(filter.$text, { $search: 'developer' });
    assert.ok(filter.location.$in.every((entry) => entry instanceof RegExp));
    assert.deepEqual(filter.requiredSkills, { $in: ['React', 'Node'] });
    assert.equal(filter.opportunityType, 'job');
});

test('buildAdvancedOpportunityFilter only restricts to upcoming deadlines when upcomingOnly is the string "true"', () => {
    const upcoming = buildAdvancedOpportunityFilter({ upcomingOnly: 'true' });
    const notUpcoming = buildAdvancedOpportunityFilter({ upcomingOnly: true });

    assert.ok(upcoming.applicationDeadline.$gt instanceof Date);
    assert.equal(notUpcoming.applicationDeadline, undefined);
});

test('buildAdvancedOpportunityFilter builds a duration range from minDuration/maxDuration', () => {
    const filter = buildAdvancedOpportunityFilter({ minDuration: '3', maxDuration: '6' });

    assert.deepEqual(filter.duration, { $gte: 3, $lte: 6 });
});

test('buildAdvancedOpportunityFilter returns an empty filter for an empty input', () => {
    assert.deepEqual(buildAdvancedOpportunityFilter({}), {});
});

test('buildAdvancedUserFilter builds name search, role, and boolean filters', () => {
    const filter = buildAdvancedUserFilter({
        search: 'Bajen',
        role: 'student',
        accountStatus: 'active',
        emailVerified: 'true',
        skills: 'React',
    });

    assert.ok(filter.fullName instanceof RegExp);
    assert.equal(filter.role, 'student');
    assert.equal(filter.accountStatus, 'active');
    assert.equal(filter.emailVerified, true);
    assert.deepEqual(filter.skills, { $in: ['React'] });
});

test('buildAdvancedUserFilter strips non-digits from a phone number search', () => {
    const filter = buildAdvancedUserFilter({ phoneNumber: '(987) 654-3210' });

    assert.ok(filter.phoneNumber.test('9876543210'));
});

test('buildAdvancedClassFilter forces status and date bounds when activeOnly is set', () => {
    const filter = buildAdvancedClassFilter({ status: 'draft', activeOnly: 'true' });

    assert.equal(filter.status, 'active');
    assert.ok(filter.startDate.$lte instanceof Date);
    assert.ok(filter.endDate.$gte instanceof Date);
});

test('buildAdvancedClassFilter builds a duration range from minDuration/maxDuration', () => {
    const filter = buildAdvancedClassFilter({ minDuration: '2' });

    assert.deepEqual(filter.duration, { $gte: 2 });
});

test('getOpportunitySortOptions falls back to the recent sort for an unknown key', () => {
    assert.deepEqual(getOpportunitySortOptions('unknown'), { createdAt: -1 });
    assert.deepEqual(getOpportunitySortOptions('salary_high'), { salary: -1 });
});

test('getUserSortOptions applies the requested direction to the chosen field', () => {
    assert.deepEqual(getUserSortOptions('name', 'asc'), { fullName: 1 });
    assert.deepEqual(getUserSortOptions('name', 'desc'), { fullName: -1 });
});

test('getClassSortOptions falls back to the recent sort for an unknown key', () => {
    assert.deepEqual(getClassSortOptions('unknown'), { createdAt: -1 });
    assert.deepEqual(getClassSortOptions('upcoming'), { startDate: 1 });
});

test('getOpportunityFacets counts types, locations, skills, and statuses', () => {
    const facets = getOpportunityFacets([
        { opportunityType: 'job', location: 'Remote', requiredSkills: ['React', 'Node'], status: 'active' },
        { opportunityType: 'job', location: 'Pune', requiredSkills: ['React'], status: 'closed' },
    ]);

    assert.deepEqual(facets.types, { job: 2 });
    assert.deepEqual(facets.locations, { Remote: 1, Pune: 1 });
    assert.deepEqual(facets.skills, { React: 2, Node: 1 });
    assert.deepEqual(facets.statuses, { active: 1, closed: 1 });
});

test('getOpportunityFacets handles an empty opportunity list', () => {
    const facets = getOpportunityFacets([]);

    assert.deepEqual(facets.types, {});
    assert.deepEqual(facets.locations, {});
});

test('getFilterSuggestions tracks which filters are currently active', () => {
    const suggestions = getFilterSuggestions({ search: 'react', location: 'Remote' });

    assert.deepEqual(suggestions.activeFilters, [
        { type: 'search', value: 'react' },
        { type: 'location', value: 'Remote' },
    ]);
    assert.ok(Array.isArray(suggestions.filterOptions.types));
});
