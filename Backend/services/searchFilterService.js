/**
 * Search and Filter Service
 * Provides advanced search and filtering capabilities for opportunities, classes, and users
 * Extends queryBuilders.js with more complex filtering logic
 */

import {
    DEFAULT_PAGE,
    DEFAULT_LIMIT,
    MAX_LIMIT,
    toTextArray,
    toBoolean,
    toNumber,
} from './queryBuilders.js';

/**
 * Build advanced opportunity filter query
 * @param {Object} params - Query parameters
 * @returns {Object} Mongo filter query
 */
export function buildAdvancedOpportunityFilter(params) {
    const filter = {};

    // Text search across title and description
    if (params.search) {
        filter.$text = { $search: params.search };
    }

    // Location filter
    if (params.location) {
        const locations = toTextArray(params.location);
        if (locations.length === 1) {
            filter.location = new RegExp(locations[0], 'i');
        } else if (locations.length > 1) {
            filter.location = { $in: locations.map(loc => new RegExp(loc, 'i')) };
        }
    }

    // Skills filter
    if (params.skills) {
        const skills = toTextArray(params.skills);
        filter.requiredSkills = { $in: skills };
    }

    // Opportunity type filter
    if (params.type) {
        filter.opportunityType = params.type;
    }

    // Deadline filter
    if (params.upcomingOnly === 'true') {
        filter.applicationDeadline = { $gt: new Date() };
    }

    // Status filter
    if (params.status) {
        filter.status = params.status;
    }

    // Duration filter
    if (params.minDuration || params.maxDuration) {
        filter.duration = {};
        if (params.minDuration) {
            filter.duration.$gte = toNumber(params.minDuration);
        }
        if (params.maxDuration) {
            filter.duration.$lte = toNumber(params.maxDuration);
        }
    }

    // Application status filter
    if (params.applicationStatus) {
        filter.applicationStatus = params.applicationStatus;
    }

    return filter;
}

/**
 * Build advanced student/user filter query
 * @param {Object} params - Query parameters
 * @returns {Object} Mongo filter query
 */
export function buildAdvancedUserFilter(params) {
    const filter = {};

    // Name search
    if (params.search) {
        filter.fullName = new RegExp(params.search, 'i');
    }

    // Role filter
    if (params.role) {
        filter.role = params.role;
    }

    // Account status filter
    if (params.accountStatus) {
        filter.accountStatus = params.accountStatus;
    }

    // Email verified filter
    if (params.emailVerified !== undefined) {
        filter.emailVerified = toBoolean(params.emailVerified);
    }

    // Skills filter
    if (params.skills) {
        const skills = toTextArray(params.skills);
        filter.skills = { $in: skills };
    }

    // Education level filter
    if (params.educationLevel) {
        filter.educationLevel = params.educationLevel;
    }

    // Major/field filter
    if (params.major) {
        filter.major = new RegExp(params.major, 'i');
    }

    // Location filter
    if (params.location) {
        filter.location = new RegExp(params.location, 'i');
    }

    // Phone number search
    if (params.phoneNumber) {
        filter.phoneNumber = new RegExp(params.phoneNumber.replace(/\D/g, ''));
    }

    return filter;
}

/**
 * Build advanced class filter query
 * @param {Object} params - Query parameters
 * @returns {Object} Mongo filter query
 */
export function buildAdvancedClassFilter(params) {
    const filter = {};

    // Title/name search
    if (params.search) {
        filter.$text = { $search: params.search };
    }

    // Instructor filter
    if (params.instructor) {
        filter.instructor = new RegExp(params.instructor, 'i');
    }

    // Subject/category filter
    if (params.subject) {
        filter.subject = params.subject;
    }

    // Level filter
    if (params.level) {
        filter.level = params.level;
    }

    // Status filter
    if (params.status) {
        filter.status = params.status;
    }

    // Active classes only
    if (params.activeOnly === 'true') {
        filter.status = 'active';
        filter.startDate = { $lte: new Date() };
        filter.endDate = { $gte: new Date() };
    }

    // Duration filter
    if (params.minDuration || params.maxDuration) {
        filter.duration = {};
        if (params.minDuration) {
            filter.duration.$gte = toNumber(params.minDuration);
        }
        if (params.maxDuration) {
            filter.duration.$lte = toNumber(params.maxDuration);
        }
    }

    return filter;
}

/**
 * Get sort options for opportunities
 * @param {string} sortBy - Sort field
 * @param {string} order - Sort order (asc/desc)
 * @returns {Object} Mongo sort query
 */
export function getOpportunitySortOptions(sortBy = 'createdAt', order = 'desc') {
    const validSortFields = {
        recent: { createdAt: -1 },
        upcoming: { applicationDeadline: 1 },
        popular: { applications: -1 },
        salary_high: { salary: -1 },
        salary_low: { salary: 1 },
        duration_long: { duration: -1 },
        duration_short: { duration: 1 },
    };

    return validSortFields[sortBy] || validSortFields.recent;
}

/**
 * Get sort options for users
 * @param {string} sortBy - Sort field
 * @param {string} order - Sort order (asc/desc)
 * @returns {Object} Mongo sort query
 */
export function getUserSortOptions(sortBy = 'createdAt', order = 'desc') {
    const direction = order === 'asc' ? 1 : -1;
    const validSortFields = {
        recent: { createdAt: direction },
        name: { fullName: direction },
        email: { email: direction },
        updated: { updatedAt: direction },
    };

    return validSortFields[sortBy] || validSortFields.recent;
}

/**
 * Get sort options for classes
 * @param {string} sortBy - Sort field
 * @param {string} order - Sort order (asc/desc)
 * @returns {Object} Mongo sort query
 */
export function getClassSortOptions(sortBy = 'createdAt', order = 'desc') {
    const validSortFields = {
        recent: { createdAt: -1 },
        upcoming: { startDate: 1 },
        title: { title: 1 },
        popular: { enrollmentCount: -1 },
    };

    return validSortFields[sortBy] || validSortFields.recent;
}

/**
 * Apply faceted search for opportunities
 * @param {Array} opportunities - Array of opportunities
 * @returns {Object} Facet counts
 */
export function getOpportunityFacets(opportunities) {
    const facets = {
        types: {},
        locations: {},
        skills: {},
        statuses: {},
    };

    opportunities.forEach(opp => {
        // Count by type
        if (opp.opportunityType) {
            facets.types[opp.opportunityType] = (facets.types[opp.opportunityType] || 0) + 1;
        }

        // Count by location
        if (opp.location) {
            facets.locations[opp.location] = (facets.locations[opp.location] || 0) + 1;
        }

        // Count by skills
        if (opp.requiredSkills && Array.isArray(opp.requiredSkills)) {
            opp.requiredSkills.forEach(skill => {
                facets.skills[skill] = (facets.skills[skill] || 0) + 1;
            });
        }

        // Count by status
        if (opp.status) {
            facets.statuses[opp.status] = (facets.statuses[opp.status] || 0) + 1;
        }
    });

    return facets;
}

/**
 * Get filter suggestions based on current filters
 * @param {Object} params - Current filter parameters
 * @returns {Object} Suggested filters and counts
 */
export function getFilterSuggestions(params) {
    const suggestions = {
        filterOptions: {
            types: ['Internship', 'Job', 'Scholarship', 'Fellowship'],
            levels: ['Beginner', 'Intermediate', 'Advanced'],
            locations: [],
            skills: [],
        },
        activeFilters: [],
    };

    // Track active filters
    if (params.search) suggestions.activeFilters.push({ type: 'search', value: params.search });
    if (params.location) suggestions.activeFilters.push({ type: 'location', value: params.location });
    if (params.skills) suggestions.activeFilters.push({ type: 'skills', value: params.skills });

    return suggestions;
}
