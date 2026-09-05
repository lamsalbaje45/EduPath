import { College } from '../models/college.js';
import { Inquiry } from '../models/inquiry.js';
import { OnlineClass } from '../models/onlineClass.js';
import { Opportunity } from '../models/opportunity.js';
import { User } from '../models/user.js';
import { ROLES } from '../config/roles.js';
import { isAdmin } from '../middleware/authorization.js';
import { buildPagination, buildPaginationMetadata } from '../services/queryBuilders.js';

import { asyncHandler, sendCreated, sendError, sendPaginated, sendSuccess } from './controllerUtils.js';

const TARGET_TYPE_CONFIG = {
    college: { model: College, ownerField: 'owner', ownerRole: ROLES.COLLEGE_ADMIN },
    employer: { model: Opportunity, ownerField: 'employer', ownerRole: ROLES.EMPLOYER },
    instructor: { model: OnlineClass, ownerField: 'owner', ownerRole: ROLES.INSTRUCTOR },
};

async function resolveTargetOwner(targetType, targetRecordId) {
    const config = TARGET_TYPE_CONFIG[targetType];
    const record = await config.model.findById(targetRecordId).select(config.ownerField).lean();

    if (!record) {
        return null;
    }

    return record[config.ownerField] ? String(record[config.ownerField]) : null;
}

const createInquiry = asyncHandler(async (req, res) => {
    const { targetType, targetRecord, message, phone } = req.body;

    const config = TARGET_TYPE_CONFIG[targetType];
    const exists = await config.model.exists({ _id: targetRecord });

    if (!exists) {
        return sendError(res, { status: 404, message: 'Target record was not found.' });
    }

    const student = await User.findById(req.user.id).select('fullName email').lean();

    if (!student) {
        return sendError(res, { status: 404, message: 'Student not found.' });
    }

    const inquiry = await Inquiry.create({
        student: req.user.id,
        targetType,
        targetRecord,
        studentName: student.fullName,
        email: student.email,
        phone,
        message,
    });

    return sendCreated(res, { message: 'Inquiry sent successfully.', data: inquiry });
});

const listMyInquiries = asyncHandler(async (req, res) => {
    const { page, limit, skip } = buildPagination(req.query);
    const filter = { student: req.user.id };

    const [inquiries, total] = await Promise.all([
        Inquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Inquiry.countDocuments(filter),
    ]);

    return sendPaginated(res, {
        message: 'Your inquiries retrieved successfully.',
        data: inquiries,
        meta: buildPaginationMetadata({ page, limit, total }),
    });
});

const listReceivedInquiries = asyncHandler(async (req, res) => {
    const { page, limit, skip } = buildPagination(req.query);

    let filter;

    if (isAdmin(req.user)) {
        filter = {};
    } else {
        const targetType = Object.keys(TARGET_TYPE_CONFIG).find(
            (key) => TARGET_TYPE_CONFIG[key].ownerRole === req.user.role
        );

        if (!targetType) {
            return sendError(res, { status: 403, message: 'Your role does not receive inquiries.' });
        }

        const config = TARGET_TYPE_CONFIG[targetType];
        const ownedRecords = await config.model.find({ [config.ownerField]: req.user.id }).select('_id').lean();
        const ownedIds = ownedRecords.map((record) => record._id);

        filter = { targetType, targetRecord: { $in: ownedIds } };
    }

    const [inquiries, total] = await Promise.all([
        Inquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Inquiry.countDocuments(filter),
    ]);

    return sendPaginated(res, {
        message: 'Received inquiries retrieved successfully.',
        data: inquiries,
        meta: buildPaginationMetadata({ page, limit, total }),
    });
});

async function canAccessInquiry(req, inquiry) {
    if (isAdmin(req.user)) {
        return true;
    }

    if (String(inquiry.student) === String(req.user.id)) {
        return true;
    }

    const ownerId = await resolveTargetOwner(inquiry.targetType, inquiry.targetRecord);
    return ownerId !== null && ownerId === String(req.user.id);
}

const getInquiryById = asyncHandler(async (req, res) => {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
        return sendError(res, { status: 404, message: 'Inquiry not found.' });
    }

    if (!(await canAccessInquiry(req, inquiry))) {
        return sendError(res, { status: 403, message: 'You do not have permission to view this inquiry.' });
    }

    return sendSuccess(res, { message: 'Inquiry retrieved successfully.', data: inquiry });
});

const updateInquiryStatus = asyncHandler(async (req, res) => {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
        return sendError(res, { status: 404, message: 'Inquiry not found.' });
    }

    const ownerId = await resolveTargetOwner(inquiry.targetType, inquiry.targetRecord);
    const allowed = isAdmin(req.user) || (ownerId !== null && ownerId === String(req.user.id));

    if (!allowed) {
        return sendError(res, { status: 403, message: 'You do not have permission to update this inquiry.' });
    }

    inquiry.status = req.body.status;
    await inquiry.save();

    return sendSuccess(res, { message: 'Inquiry status updated successfully.', data: inquiry });
});

const deleteInquiry = asyncHandler(async (req, res) => {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
        return sendError(res, { status: 404, message: 'Inquiry not found.' });
    }

    const isSender = String(inquiry.student) === String(req.user.id);

    if (!isAdmin(req.user) && !(isSender && inquiry.status === 'new')) {
        return sendError(res, {
            status: 403,
            message: 'You can only delete your own inquiries while they are still new.',
        });
    }

    await inquiry.deleteOne();

    return sendSuccess(res, { message: 'Inquiry deleted successfully.' });
});

export {
    createInquiry,
    deleteInquiry,
    getInquiryById,
    listMyInquiries,
    listReceivedInquiries,
    updateInquiryStatus,
};
