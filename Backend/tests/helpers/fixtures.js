import { College } from '../../models/college.js';
import { OnlineClass } from '../../models/onlineClass.js';
import { Opportunity } from '../../models/opportunity.js';

async function createCollegeDoc(overrides = {}) {
    return College.create({
        collegeName: 'Test College',
        city: 'Pune',
        admissionStatus: 'open',
        approvalStatus: 'approved',
        ...overrides,
    });
}

async function createOpportunityDoc(overrides = {}) {
    return Opportunity.create({
        title: 'Frontend Developer',
        companyName: 'Acme Corp',
        type: 'job',
        status: 'active',
        approvalStatus: 'approved',
        ...overrides,
    });
}

async function createClassDoc(overrides = {}) {
    return OnlineClass.create({
        classTitle: 'Intro to React',
        instructorOrOrganization: 'Acme Academy',
        approvalStatus: 'approved',
        ...overrides,
    });
}

export { createClassDoc, createCollegeDoc, createOpportunityDoc };
