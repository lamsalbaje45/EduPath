import { Opportunity } from '../models/opportunity.js';
import { buildOpportunityQuery, buildPaginationMetadata } from '../services/queryBuilders.js';

import { asyncHandler, isDatabaseConnected, sendSuccess } from './controllerUtils.js';

const listOpportunities = asyncHandler(async (req, res) => {
    const query = buildOpportunityQuery(req.query);
    let opportunities = [];
    let total = 0;

    if (isDatabaseConnected()) {
        [opportunities, total] = await Promise.all([
            Opportunity.find(query.filter).sort(query.sort).skip(query.pagination.skip).limit(query.pagination.limit).lean(),
            Opportunity.countDocuments(query.filter),
        ]);
    }

    return sendSuccess(res, {
        message: 'Opportunities retrieved successfully.',
        data: opportunities,
        meta: buildPaginationMetadata({ ...query.pagination, total }),
        filters: query.search,
        sort: query.sort,
    });
});

export { listOpportunities };
