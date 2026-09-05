import { OnlineClass } from '../models/onlineClass.js';
import { isAdmin } from '../middleware/authorization.js';
import { buildClassQuery, buildPaginationMetadata } from '../services/queryBuilders.js';

import { asyncHandler, isDatabaseConnected, sendCreated, sendError, sendPaginated, sendSuccess } from './controllerUtils.js';

const CREATABLE_FIELDS = [
    'classTitle',
    'instructorOrOrganization',
    'level',
    'mode',
    'duration',
    'price',
    'subjects',
    'certificateAvailability',
    'description',
    'startDate',
    'schedule',
    'enrollmentLink',
];

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

    return sendPaginated(res, {
        message: 'Online classes retrieved successfully.',
        data: classes,
        meta: buildPaginationMetadata({ ...query.pagination, total }),
        filters: query.search,
        sort: query.sort,
    });
});

const getClassById = asyncHandler(async (req, res) => {
    const onlineClass = await OnlineClass.findById(req.params.id);

    if (!onlineClass) {
        return sendError(res, { status: 404, message: 'Online class not found.' });
    }

    return sendSuccess(res, { message: 'Online class retrieved successfully.', data: onlineClass });
});

const createClass = asyncHandler(async (req, res) => {
    const payload = {};
    CREATABLE_FIELDS.forEach((field) => {
        if (req.body[field] !== undefined) {
            payload[field] = req.body[field];
        }
    });

    payload.owner = req.user.id;
    payload.approvalStatus = isAdmin(req.user) ? 'approved' : 'pending';

    const onlineClass = await OnlineClass.create(payload);

    return sendCreated(res, { message: 'Online class created successfully.', data: onlineClass });
});

const updateClass = asyncHandler(async (req, res) => {
    const onlineClass = await OnlineClass.findById(req.params.id);

    if (!onlineClass) {
        return sendError(res, { status: 404, message: 'Online class not found.' });
    }

    if (!isAdmin(req.user) && String(onlineClass.owner) !== String(req.user.id)) {
        return sendError(res, { status: 403, message: 'You do not have permission to modify this online class.' });
    }

    CREATABLE_FIELDS.forEach((field) => {
        if (req.body[field] !== undefined) {
            onlineClass[field] = req.body[field];
        }
    });

    await onlineClass.save();

    return sendSuccess(res, { message: 'Online class updated successfully.', data: onlineClass });
});

const deleteClass = asyncHandler(async (req, res) => {
    const onlineClass = await OnlineClass.findById(req.params.id);

    if (!onlineClass) {
        return sendError(res, { status: 404, message: 'Online class not found.' });
    }

    if (!isAdmin(req.user) && String(onlineClass.owner) !== String(req.user.id)) {
        return sendError(res, { status: 403, message: 'You do not have permission to delete this online class.' });
    }

    await onlineClass.deleteOne();

    return sendSuccess(res, { message: 'Online class deleted successfully.' });
});

const updateClassApproval = asyncHandler(async (req, res) => {
    const onlineClass = await OnlineClass.findByIdAndUpdate(
        req.params.id,
        { $set: { approvalStatus: req.body.approvalStatus } },
        { new: true, runValidators: true }
    );

    if (!onlineClass) {
        return sendError(res, { status: 404, message: 'Online class not found.' });
    }

    return sendSuccess(res, { message: 'Online class approval status updated successfully.', data: onlineClass });
});

export {
    createClass,
    deleteClass,
    getClassById,
    listClasses,
    updateClass,
    updateClassApproval,
};
