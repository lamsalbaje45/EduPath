import { College } from '../models/college.js';
import { buildCollegeQuery, buildPaginationMetadata } from '../services/queryBuilders.js';

import { asyncHandler, isDatabaseConnected, sendPaginated } from './controllerUtils.js';

const listColleges = asyncHandler(async (req, res) => {
    const query = buildCollegeQuery(req.query);
    let colleges = [];
    let total = 0;

    if (isDatabaseConnected()) {
        [colleges, total] = await Promise.all([
            College.find(query.filter).sort(query.sort).skip(query.pagination.skip).limit(query.pagination.limit).lean(),
            College.countDocuments(query.filter),
        ]);
    }

    return sendPaginated(res, {
        message: 'Colleges retrieved successfully.',
        data: colleges,
        meta: buildPaginationMetadata({ ...query.pagination, total }),
        filters: query.search,
        sort: query.sort,
    });
});

export { listColleges };
