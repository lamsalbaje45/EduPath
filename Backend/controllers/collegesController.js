import { College } from '../models/college.js';
import { isAdmin } from '../middleware/authorization.js';
import { buildCollegeQuery, buildPaginationMetadata } from '../services/queryBuilders.js';

import { asyncHandler, isDatabaseConnected, sendCreated, sendError, sendPaginated, sendSuccess } from './controllerUtils.js';

const CREATABLE_FIELDS = [
    'collegeName',
    'city',
    'address',
    'affiliation',
    'courses',
    'feeRange',
    'facilities',
    'admissionStatus',
    'description',
    'contactEmail',
    'contactPhone',
    'website',
    'images',
];

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

const getCollegeById = asyncHandler(async (req, res) => {
    const college = await College.findById(req.params.id);

    if (!college) {
        return sendError(res, { status: 404, message: 'College not found.' });
    }

    return sendSuccess(res, { message: 'College retrieved successfully.', data: college });
});

const createCollege = asyncHandler(async (req, res) => {
    const payload = {};
    CREATABLE_FIELDS.forEach((field) => {
        if (req.body[field] !== undefined) {
            payload[field] = req.body[field];
        }
    });

    payload.owner = req.user.id;
    payload.approvalStatus = isAdmin(req.user) ? 'approved' : 'pending';

    const college = await College.create(payload);

    return sendCreated(res, { message: 'College created successfully.', data: college });
});

const updateCollege = asyncHandler(async (req, res) => {
    const college = await College.findById(req.params.id);

    if (!college) {
        return sendError(res, { status: 404, message: 'College not found.' });
    }

    if (!isAdmin(req.user) && String(college.owner) !== String(req.user.id)) {
        return sendError(res, { status: 403, message: 'You do not have permission to modify this college.' });
    }

    CREATABLE_FIELDS.forEach((field) => {
        if (req.body[field] !== undefined) {
            college[field] = req.body[field];
        }
    });

    await college.save();

    return sendSuccess(res, { message: 'College updated successfully.', data: college });
});

const deleteCollege = asyncHandler(async (req, res) => {
    const college = await College.findById(req.params.id);

    if (!college) {
        return sendError(res, { status: 404, message: 'College not found.' });
    }

    if (!isAdmin(req.user) && String(college.owner) !== String(req.user.id)) {
        return sendError(res, { status: 403, message: 'You do not have permission to delete this college.' });
    }

    await college.deleteOne();

    return sendSuccess(res, { message: 'College deleted successfully.' });
});

const updateCollegeApproval = asyncHandler(async (req, res) => {
    const college = await College.findByIdAndUpdate(
        req.params.id,
        { $set: { approvalStatus: req.body.approvalStatus } },
        { new: true, runValidators: true }
    );

    if (!college) {
        return sendError(res, { status: 404, message: 'College not found.' });
    }

    return sendSuccess(res, { message: 'College approval status updated successfully.', data: college });
});

export {
    createCollege,
    deleteCollege,
    getCollegeById,
    listColleges,
    updateCollege,
    updateCollegeApproval,
};
