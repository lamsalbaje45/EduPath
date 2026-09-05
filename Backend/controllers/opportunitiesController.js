import { Opportunity } from '../models/opportunity.js';
import { isAdmin } from '../middleware/authorization.js';
import { buildOpportunityQuery, buildPaginationMetadata } from '../services/queryBuilders.js';

import { asyncHandler, isDatabaseConnected, sendCreated, sendError, sendPaginated, sendSuccess } from './controllerUtils.js';

const CREATABLE_FIELDS = [
    'title',
    'companyName',
    'type',
    'location',
    'workMode',
    'stipendOrSalaryRange',
    'requiredSkills',
    'suitableCourses',
    'applicationDeadline',
    'description',
    'applicationLink',
    'internalApplication',
    'status',
];

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

    return sendPaginated(res, {
        message: 'Opportunities retrieved successfully.',
        data: opportunities,
        meta: buildPaginationMetadata({ ...query.pagination, total }),
        filters: query.search,
        sort: query.sort,
    });
});

const getOpportunityById = asyncHandler(async (req, res) => {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
        return sendError(res, { status: 404, message: 'Opportunity not found.' });
    }

    return sendSuccess(res, { message: 'Opportunity retrieved successfully.', data: opportunity });
});

const createOpportunity = asyncHandler(async (req, res) => {
    const payload = {};
    CREATABLE_FIELDS.forEach((field) => {
        if (req.body[field] !== undefined) {
            payload[field] = req.body[field];
        }
    });

    payload.employer = req.user.id;
    payload.approvalStatus = isAdmin(req.user) ? 'approved' : 'pending';

    const opportunity = await Opportunity.create(payload);

    return sendCreated(res, { message: 'Opportunity created successfully.', data: opportunity });
});

const updateOpportunity = asyncHandler(async (req, res) => {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
        return sendError(res, { status: 404, message: 'Opportunity not found.' });
    }

    if (!isAdmin(req.user) && String(opportunity.employer) !== String(req.user.id)) {
        return sendError(res, { status: 403, message: 'You do not have permission to modify this opportunity.' });
    }

    CREATABLE_FIELDS.forEach((field) => {
        if (req.body[field] !== undefined) {
            opportunity[field] = req.body[field];
        }
    });

    await opportunity.save();

    return sendSuccess(res, { message: 'Opportunity updated successfully.', data: opportunity });
});

const deleteOpportunity = asyncHandler(async (req, res) => {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
        return sendError(res, { status: 404, message: 'Opportunity not found.' });
    }

    if (!isAdmin(req.user) && String(opportunity.employer) !== String(req.user.id)) {
        return sendError(res, { status: 403, message: 'You do not have permission to delete this opportunity.' });
    }

    await opportunity.deleteOne();

    return sendSuccess(res, { message: 'Opportunity deleted successfully.' });
});

const updateOpportunityApproval = asyncHandler(async (req, res) => {
    const opportunity = await Opportunity.findByIdAndUpdate(
        req.params.id,
        { $set: { approvalStatus: req.body.approvalStatus } },
        { new: true, runValidators: true }
    );

    if (!opportunity) {
        return sendError(res, { status: 404, message: 'Opportunity not found.' });
    }

    return sendSuccess(res, { message: 'Opportunity approval status updated successfully.', data: opportunity });
});

export {
    createOpportunity,
    deleteOpportunity,
    getOpportunityById,
    listOpportunities,
    updateOpportunity,
    updateOpportunityApproval,
};
