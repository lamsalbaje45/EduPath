const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toTextArray(value) {
    if (!value) {
        return [];
    }

    const rawValues = Array.isArray(value) ? value : String(value).split(',');

    return rawValues
        .map((entry) => String(entry).trim())
        .filter(Boolean);
}

function toBoolean(value) {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value !== 'string') {
        return undefined;
    }

    const normalized = value.trim().toLowerCase();

    if (['true', '1', 'yes'].includes(normalized)) {
        return true;
    }

    if (['false', '0', 'no'].includes(normalized)) {
        return false;
    }

    return undefined;
} 

function toNumber(value) {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }

    const parsedValue = Number(value);

    return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function buildPagination(query = {}) {
    const page = Math.max(1, toNumber(query.page) || DEFAULT_PAGE);
    const limit = Math.min(MAX_LIMIT, Math.max(1, toNumber(query.limit) || DEFAULT_LIMIT));
    const skip = (page - 1) * limit;

    return {
        page,
        limit,
        skip,
    };
}

function buildPaginationMetadata({ page, limit, total }) {
    const safeTotal = Math.max(0, total || 0);
    const totalPages = safeTotal === 0 ? 0 : Math.ceil(safeTotal / limit);

    return {
        page,
        limit,
        total: safeTotal,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
}

function buildSort(query = {}, defaultSort = {}) {
    if (query.sortBy) {
        const direction = String(query.sortOrder || query.order || 'asc').toLowerCase() === 'desc' ? -1 : 1;

        return {
            [String(query.sortBy).trim()]: direction,
        };
    }

    return defaultSort;
}

function buildTextSearchClause(fields, term) {
    if (!term) {
        return null;
    }

    const regex = new RegExp(escapeRegex(String(term).trim()), 'i');

    return {
        $or: fields.map((field) => ({ [field]: regex })),
    };
}

function buildCollegeQuery(query = {}) {
    const filters = [];
    const searchTerm = query.search || query.q || query.keyword;

    const searchClause = buildTextSearchClause(['collegeName', 'courses', 'city', 'affiliation'], searchTerm);
    if (searchClause) {
        filters.push(searchClause);
    }

    const courseFilter = toTextArray(query.course || query.courses);
    if (courseFilter.length > 0) {
        filters.push({ courses: { $in: courseFilter.map((course) => new RegExp(escapeRegex(course), 'i')) } });
    }

    const cityFilter = toTextArray(query.city || query.cities);
    if (cityFilter.length > 0) {
        filters.push({ city: { $in: cityFilter.map((city) => new RegExp(escapeRegex(city), 'i')) } });
    }

    if (query.admissionStatus) {
        filters.push({ admissionStatus: String(query.admissionStatus).trim() });
    }

    if (query.affiliation) {
        filters.push({ affiliation: new RegExp(escapeRegex(String(query.affiliation).trim()), 'i') });
    }

    const ratingMin = toNumber(query.ratingMin);
    const ratingMax = toNumber(query.ratingMax);
    if (ratingMin !== undefined || ratingMax !== undefined) {
        const ratingFilter = {};

        if (ratingMin !== undefined) {
            ratingFilter.$gte = ratingMin;
        }

        if (ratingMax !== undefined) {
            ratingFilter.$lte = ratingMax;
        }

        filters.push({ rating: ratingFilter });
    }

    const feeMin = toNumber(query.feeMin);
    const feeMax = toNumber(query.feeMax);

    const { page, limit, skip } = buildPagination(query);

    return {
        filter: filters.length > 0 ? { $and: filters } : {},
        sort: buildSort(query, { rating: -1, createdAt: -1 }),
        pagination: { page, limit, skip },
        search: {
            searchTerm: searchTerm ? String(searchTerm).trim() : undefined,
            course: courseFilter,
            city: cityFilter,
            admissionStatus: query.admissionStatus ? String(query.admissionStatus).trim() : undefined,
            affiliation: query.affiliation ? String(query.affiliation).trim() : undefined,
            ratingMin,
            ratingMax,
            feeMin,
            feeMax,
        },
    };
}

function buildOpportunityQuery(query = {}) {
    const filters = [];
    const searchTerm = query.search || query.q || query.keyword;

    const searchClause = buildTextSearchClause(['title', 'companyName', 'requiredSkills'], searchTerm);
    if (searchClause) {
        filters.push(searchClause);
    }

    const typeFilter = toTextArray(query.type || query.types);
    if (typeFilter.length > 0) {
        filters.push({ type: { $in: typeFilter } });
    }

    const skillsFilter = toTextArray(query.skill || query.skills);
    if (skillsFilter.length > 0) {
        filters.push({ requiredSkills: { $in: skillsFilter.map((skill) => new RegExp(escapeRegex(skill), 'i')) } });
    }

    const locationFilter = toTextArray(query.location || query.locations);
    if (locationFilter.length > 0) {
        filters.push({ location: { $in: locationFilter.map((location) => new RegExp(escapeRegex(location), 'i')) } });
    }

    const workModeFilter = toTextArray(query.workMode || query.mode);
    if (workModeFilter.length > 0) {
        filters.push({ workMode: { $in: workModeFilter } });
    }

    const suitableCourseFilter = toTextArray(query.suitableCourse || query.course || query.suitableCourses);
    if (suitableCourseFilter.length > 0) {
        filters.push({ suitableCourses: { $in: suitableCourseFilter.map((course) => new RegExp(escapeRegex(course), 'i')) } });
    }

    if (query.status) {
        filters.push({ status: String(query.status).trim() });
    }

    const deadlineBefore = query.deadlineBefore || query.before;
    if (deadlineBefore) {
        const deadlineDate = new Date(deadlineBefore);
        if (!Number.isNaN(deadlineDate.getTime())) {
            filters.push({ applicationDeadline: { $lte: deadlineDate } });
        }
    }

    const deadlineAfter = query.deadlineAfter || query.after;
    if (deadlineAfter) {
        const deadlineDate = new Date(deadlineAfter);
        if (!Number.isNaN(deadlineDate.getTime())) {
            filters.push({ applicationDeadline: { $gte: deadlineDate } });
        }
    }

    const { page, limit, skip } = buildPagination(query);

    return {
        filter: filters.length > 0 ? { $and: filters } : {},
        sort: buildSort(query, { createdAt: -1, applicationDeadline: 1 }),
        pagination: { page, limit, skip },
        search: {
            searchTerm: searchTerm ? String(searchTerm).trim() : undefined,
            type: typeFilter,
            skill: skillsFilter,
            location: locationFilter,
            workMode: workModeFilter,
            suitableCourse: suitableCourseFilter,
            status: query.status ? String(query.status).trim() : undefined,
            deadlineBefore: deadlineBefore || undefined,
            deadlineAfter: deadlineAfter || undefined,
        },
    };
}

function buildClassQuery(query = {}) {
    const filters = [];
    const searchTerm = query.search || query.q || query.keyword;

    const searchClause = buildTextSearchClause(['classTitle', 'instructorOrOrganization', 'subjects'], searchTerm);
    if (searchClause) {
        filters.push(searchClause);
    }

    const levelFilter = toTextArray(query.level || query.levels);
    if (levelFilter.length > 0) {
        filters.push({ level: { $in: levelFilter.map((level) => new RegExp(escapeRegex(level), 'i')) } });
    }

    const modeFilter = toTextArray(query.mode || query.modes);
    if (modeFilter.length > 0) {
        filters.push({ mode: { $in: modeFilter } });
    }

    const subjectFilter = toTextArray(query.subject || query.subjects);
    if (subjectFilter.length > 0) {
        filters.push({ subjects: { $in: subjectFilter.map((subj) => new RegExp(escapeRegex(subj), 'i')) } });
    }

    const certificateValue = toBoolean(query.certificate ?? query.hasCertificate);
    if (certificateValue !== undefined) {
        filters.push({ certificateAvailability: certificateValue });
    }

    const priceMin = toNumber(query.priceMin);
    const priceMax = toNumber(query.priceMax);
    if (priceMin !== undefined || priceMax !== undefined) {
        const priceFilter = {};

        if (priceMin !== undefined) {
            priceFilter.$gte = priceMin;
        }

        if (priceMax !== undefined) {
            priceFilter.$lte = priceMax;
        }

        filters.push({ price: priceFilter });
    }

    const { page, limit, skip } = buildPagination(query);

    return {
        filter: filters.length > 0 ? { $and: filters } : {},
        sort: buildSort(query, { price: 1, createdAt: -1 }),
        pagination: { page, limit, skip },
        search: {
            searchTerm: searchTerm ? String(searchTerm).trim() : undefined,
            level: levelFilter,
            mode: modeFilter,
            certificate: certificateValue,
            priceMin,
            priceMax,
        },
    };
}

function buildUserQuery(query = {}, { forceRole } = {}) {
    const filters = [];
    const searchTerm = query.search || query.q || query.keyword;

    const searchClause = buildTextSearchClause(['fullName', 'email'], searchTerm);
    if (searchClause) {
        filters.push(searchClause);
    }

    const role = forceRole || query.role;
    if (role) {
        filters.push({ role: String(role).trim() });
    }

    if (query.accountStatus) {
        filters.push({ accountStatus: String(query.accountStatus).trim() });
    }

    const { page, limit, skip } = buildPagination(query);

    return {
        filter: filters.length > 0 ? { $and: filters } : {},
        sort: buildSort(query, { createdAt: -1 }),
        pagination: { page, limit, skip },
        search: {
            searchTerm: searchTerm ? String(searchTerm).trim() : undefined,
            role: role || undefined,
            accountStatus: query.accountStatus ? String(query.accountStatus).trim() : undefined,
        },
    };
}

export {
    buildClassQuery,
    buildCollegeQuery,
    buildOpportunityQuery,
    buildPagination,
    buildPaginationMetadata,
    buildSort,
    buildUserQuery,
};