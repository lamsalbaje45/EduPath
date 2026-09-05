import { Application } from '../models/application.js';
import { CV } from '../models/cv.js';
import { Opportunity } from '../models/opportunity.js';
import { isAdmin } from '../middleware/authorization.js';
import { buildPagination, buildPaginationMetadata } from '../services/queryBuilders.js';

import { asyncHandler, sendCreated, sendError, sendPaginated, sendSuccess } from './controllerUtils.js';

const createApplication = asyncHandler(async (req, res) => {
    const { opportunity: opportunityId, coverMessage } = req.body;

    const opportunity = await Opportunity.findById(opportunityId);

    if (!opportunity) {
        return sendError(res, { status: 404, message: 'Opportunity not found.' });
    }

    if (opportunity.status !== 'active') {
        return sendError(res, { status: 400, message: 'This opportunity is not currently accepting applications.' });
    }

    const alreadyApplied = await Application.exists({ student: req.user.id, opportunity: opportunityId });

    if (alreadyApplied) {
        return sendError(res, { status: 409, message: 'You have already applied to this opportunity.' });
    }

    const cv = await CV.findOne({ student: req.user.id }).lean();

    const application = await Application.create({
        student: req.user.id,
        opportunity: opportunityId,
        coverMessage,
        cvReference: cv?._id,
        cvSnapshot: cv || undefined,
    });

    return sendCreated(res, { message: 'Application submitted successfully.', data: application });
});

const listMyApplications = asyncHandler(async (req, res) => {
    const { page, limit, skip } = buildPagination(req.query);
    const filter = { student: req.user.id };

    const [applications, total] = await Promise.all([
        Application.find(filter)
            .populate('opportunity', 'title companyName type location status')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Application.countDocuments(filter),
    ]);

    return sendPaginated(res, {
        message: 'Your applications retrieved successfully.',
        data: applications,
        meta: buildPaginationMetadata({ page, limit, total }),
    });
});

const listReceivedApplications = asyncHandler(async (req, res) => {
    const { page, limit, skip } = buildPagination(req.query);

    let filter;

    if (isAdmin(req.user)) {
        filter = {};
    } else {
        const ownedOpportunities = await Opportunity.find({ employer: req.user.id }).select('_id').lean();
        filter = { opportunity: { $in: ownedOpportunities.map((item) => item._id) } };
    }

    const [applications, total] = await Promise.all([
        Application.find(filter)
            .populate('student', 'fullName email')
            .populate('opportunity', 'title companyName type')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Application.countDocuments(filter),
    ]);

    return sendPaginated(res, {
        message: 'Received applications retrieved successfully.',
        data: applications,
        meta: buildPaginationMetadata({ page, limit, total }),
    });
});

async function canAccessApplication(req, application) {
    if (isAdmin(req.user)) {
        return true;
    }

    if (String(application.student) === String(req.user.id)) {
        return true;
    }

    const opportunity = await Opportunity.findById(application.opportunity).select('employer').lean();
    return Boolean(opportunity && String(opportunity.employer) === String(req.user.id));
}

const getApplicationById = asyncHandler(async (req, res) => {
    const application = await Application.findById(req.params.id)
        .populate('opportunity', 'title companyName type employer');

    if (!application) {
        return sendError(res, { status: 404, message: 'Application not found.' });
    }

    if (!(await canAccessApplication(req, application))) {
        return sendError(res, { status: 403, message: 'You do not have permission to view this application.' });
    }

    return sendSuccess(res, { message: 'Application retrieved successfully.', data: application });
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
    const application = await Application.findById(req.params.id);

    if (!application) {
        return sendError(res, { status: 404, message: 'Application not found.' });
    }

    const opportunity = await Opportunity.findById(application.opportunity).select('employer').lean();
    const isOwner = opportunity && String(opportunity.employer) === String(req.user.id);

    if (!isAdmin(req.user) && !isOwner) {
        return sendError(res, { status: 403, message: 'You do not have permission to update this application.' });
    }

    const { status, employerNotes } = req.body;
    application.status = status;
    if (employerNotes !== undefined) {
        application.employerNotes = employerNotes;
    }
    await application.save();

    return sendSuccess(res, { message: 'Application status updated successfully.', data: application });
});

const deleteApplication = asyncHandler(async (req, res) => {
    const application = await Application.findById(req.params.id);

    if (!application) {
        return sendError(res, { status: 404, message: 'Application not found.' });
    }

    const isOwner = String(application.student) === String(req.user.id);

    if (!isAdmin(req.user) && !(isOwner && application.status === 'submitted')) {
        return sendError(res, {
            status: 403,
            message: 'You can only withdraw your own applications while they are still submitted.',
        });
    }

    await application.deleteOne();

    return sendSuccess(res, { message: 'Application deleted successfully.' });
});

export {
    createApplication,
    deleteApplication,
    getApplicationById,
    listMyApplications,
    listReceivedApplications,
    updateApplicationStatus,
};
