import { OnlineClass } from '../models/onlineClass.js';
import { buildClassQuery, buildPaginationMetadata } from '../services/queryBuilders.js';

import { asyncHandler, isDatabaseConnected, sendSuccess } from './controllerUtils.js';

const listClasses = asyncHandler(async (req, res) => {
    const query = buildClassQuery(req.query);
    let classes = [];
    let total = 0;

    if (isDatabaseConnected()) {
        [classes, total] = await Promise.all([
            OnlineClass.find(query.filter).sort(query.sort).skip(query.pagination.skip).limit(query.pagination.limit).lean(),
            OnlineClass.countDocuments(query.filter),
        ]);
    }

    return sendSuccess(res, {
        message: 'Online classes retrieved successfully.',
        data: classes,
        meta: buildPaginationMetadata({ ...query.pagination, total }),
        filters: query.search,
        sort: query.sort,
    });
});

export { listClasses };
