import assert from 'node:assert/strict';
import test from 'node:test';

import {
    calculateClassMatchScore,
    calculateCollegeMatchScore,
    calculateOpportunityMatchScore,
} from '../services/recommendationService.js';

test('calculateCollegeMatchScore awards points for course, city, admission, and rating matches', () => {
    const student = {
        studentProfile: {
            preferredCourses: ['Computer Science', 'Data Science'],
            preferredCities: ['pune'],
        },
    };
    const college = {
        courses: ['Computer Science', 'Mechanical Engineering'],
        city: 'Pune',
        admissionStatus: 'open',
        rating: 4,
    };

    const { score, matches } = calculateCollegeMatchScore(student, college);

    // 1 course match (+1) + city match (+10) + admission open (+5) + rating 4*2=8 (+8)
    assert.equal(score, 24);
    assert.equal(matches.courses, 1);
    assert.equal(matches.city, true);
    assert.equal(matches.admissionOpen, true);
    assert.equal(matches.rating, 4);
});

test('calculateCollegeMatchScore caps the course bonus at 10 points', () => {
    const preferredCourses = Array.from({ length: 15 }, (_, i) => `Course ${i}`);
    const student = { studentProfile: { preferredCourses } };
    const college = { courses: preferredCourses };

    const { score, matches } = calculateCollegeMatchScore(student, college);

    assert.equal(matches.courses, 15);
    assert.equal(score, 10);
});

test('calculateCollegeMatchScore returns zero when nothing matches', () => {
    const student = { studentProfile: {} };
    const college = { courses: [], city: 'Kathmandu', admissionStatus: 'closed' };

    const { score, matches } = calculateCollegeMatchScore(student, college);

    assert.equal(score, 0);
    assert.equal(matches.city, false);
    assert.equal(matches.admissionOpen, false);
});

test('calculateCollegeMatchScore handles a student with no studentProfile', () => {
    const { score } = calculateCollegeMatchScore({}, { courses: ['CS'], city: 'Pune' });

    assert.equal(score, 0);
});

test('calculateOpportunityMatchScore scores skills, career interest, type, courses, location and deadline', () => {
    const student = {
        studentProfile: {
            skills: ['React', 'Node'],
            careerInterests: ['frontend'],
            preferredOpportunityType: 'job',
            preferredCities: ['Remote'],
            currentCourse: 'Computer Science',
        },
    };
    const opportunity = {
        title: 'Frontend Developer',
        requiredSkills: ['React', 'Node', 'CSS'],
        type: 'job',
        suitableCourses: ['Computer Science'],
        location: 'Remote',
        applicationDeadline: new Date(Date.now() + 86400000),
    };

    const { score, matches } = calculateOpportunityMatchScore(student, opportunity);

    // skills 2*2=4, career +15, type +10, courses 1*1=1, location +5, deadline +5 = 40
    assert.equal(score, 40);
    assert.equal(matches.skills, 2);
    assert.equal(matches.careerInterest, true);
    assert.equal(matches.typeMatch, true);
    assert.equal(matches.courses, 1);
    assert.equal(matches.location, true);
    assert.equal(matches.deadlineValid, true);
});

test('calculateOpportunityMatchScore caps the skills bonus at 20 points', () => {
    const skills = Array.from({ length: 20 }, (_, i) => `skill-${i}`);
    const student = { studentProfile: { skills } };
    const opportunity = { requiredSkills: skills };

    const { score, matches } = calculateOpportunityMatchScore(student, opportunity);

    assert.equal(matches.skills, 20);
    assert.equal(score, 20);
});

test('calculateOpportunityMatchScore does not award deadline points for an expired deadline', () => {
    const opportunity = { applicationDeadline: new Date(Date.now() - 86400000) };

    const { matches } = calculateOpportunityMatchScore({ studentProfile: {} }, opportunity);

    assert.equal(matches.deadlineValid, false);
});

test('calculateOpportunityMatchScore skips the course bonus when currentCourse is missing', () => {
    const student = { studentProfile: {} };
    const opportunity = { suitableCourses: ['Computer Science'] };

    const { matches } = calculateOpportunityMatchScore(student, opportunity);

    assert.equal(matches.courses, 0);
});

test('calculateClassMatchScore scores subject, level, certificate, price, and schedule matches', () => {
    const student = {
        studentProfile: {
            skills: ['React', 'Node'],
            educationLevel: 'beginner',
        },
    };
    const onlineClass = {
        subjects: ['React', 'Vue'],
        level: 'Beginner',
        certificateAvailability: true,
        price: 0,
        startDate: new Date(Date.now() + 86400000),
    };

    const { score, matches } = calculateClassMatchScore(student, onlineClass);

    // skills 1*3=3, level +10, certificate +5, free +5, active +5 = 28
    assert.equal(score, 28);
    assert.equal(matches.skills, 1);
    assert.equal(matches.levelMatch, true);
    assert.equal(matches.hasCertificate, true);
    assert.equal(matches.isFree, true);
    assert.equal(matches.isActive, true);
});

test('calculateClassMatchScore treats a missing price as free', () => {
    const { matches } = calculateClassMatchScore({ studentProfile: {} }, {});

    assert.equal(matches.isFree, true);
});

test('calculateClassMatchScore does not mark a paid class as free', () => {
    const { matches } = calculateClassMatchScore({ studentProfile: {} }, { price: 49 });

    assert.equal(matches.isFree, false);
});

test('calculateClassMatchScore caps the subject bonus at 15 points', () => {
    const skills = Array.from({ length: 10 }, (_, i) => `subject-${i}`);
    const student = { studentProfile: { skills } };
    const onlineClass = { subjects: skills };

    const { score, matches } = calculateClassMatchScore(student, onlineClass);

    assert.equal(matches.skills, 10);
    assert.equal(score, 15 + 5); // subject cap (15) + isFree bonus (5), no price provided
});
