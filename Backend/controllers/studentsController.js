import { College } from '../models/college.js';
import { OnlineClass } from '../models/onlineClass.js';
import { Opportunity } from '../models/opportunity.js';
import { User } from '../models/user.js';
import { ROLES } from '../config/roles.js';
import { buildPaginationMetadata, buildUserQuery } from '../services/queryBuilders.js';

import { asyncHandler, sendError, sendPaginated, sendSuccess } from './controllerUtils.js';

const SAVED_ITEM_CONFIG = {
    colleges: { model: College, field: 'studentProfile.savedColleges' },
    opportunities: { model: Opportunity, field: 'studentProfile.savedOpportunities' },
    classes: { model: OnlineClass, field: 'studentProfile.savedClasses' },
};

const getMyProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return sendError(res, { status: 404, message: 'Student not found.' });
    }

    return sendSuccess(res, { message: 'Student profile retrieved successfully.', data: user });
});

const updateMyProfile = asyncHandler(async (req, res) => {
    const {
        educationLevel,
        currentCourse,
        preferredCourses,
        preferredCities,
        skills,
        careerInterests,
        preferredOpportunityType,
        portfolioLinks,
        bio,
        address,
        recommendationPreferences,
    } = req.body;

    const update = {};
    const fields = {
        'studentProfile.educationLevel': educationLevel,
        'studentProfile.currentCourse': currentCourse,
        'studentProfile.preferredCourses': preferredCourses,
        'studentProfile.preferredCities': preferredCities,
        'studentProfile.skills': skills,
        'studentProfile.careerInterests': careerInterests,
        'studentProfile.preferredOpportunityType': preferredOpportunityType,
        'studentProfile.portfolioLinks': portfolioLinks,
        'studentProfile.bio': bio,
        'studentProfile.address': address,
        'studentProfile.recommendationPreferences': recommendationPreferences,
    };

    Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined) {
            update[key] = value;
        }
    });

    const user = await User.findByIdAndUpdate(req.user.id, { $set: update }, { new: true, runValidators: true });

    if (!user) {
        return sendError(res, { status: 404, message: 'Student not found.' });
    }

    return sendSuccess(res, { message: 'Student profile updated successfully.', data: user });
});

const getMySavedItems = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
        .populate('studentProfile.savedColleges')
        .populate('studentProfile.savedOpportunities')
        .populate('studentProfile.savedClasses');

    if (!user) {
        return sendError(res, { status: 404, message: 'Student not found.' });
    }

    return sendSuccess(res, {
        message: 'Saved items retrieved successfully.',
        data: {
            colleges: user.studentProfile.savedColleges,
            opportunities: user.studentProfile.savedOpportunities,
            classes: user.studentProfile.savedClasses,
        },
    });
});

const addSavedItem = asyncHandler(async (req, res) => {
    const { type, itemId } = req.params;
    const config = SAVED_ITEM_CONFIG[type];

    const item = await config.model.findById(itemId).select('_id').lean();

    if (!item) {
        return sendError(res, { status: 404, message: 'Item not found.' });
    }

    await User.findByIdAndUpdate(req.user.id, { $addToSet: { [config.field]: itemId } });

    return sendSuccess(res, { message: 'Item saved successfully.' });
});

const removeSavedItem = asyncHandler(async (req, res) => {
    const { type, itemId } = req.params;
    const config = SAVED_ITEM_CONFIG[type];

    await User.findByIdAndUpdate(req.user.id, { $pull: { [config.field]: itemId } });

    return sendSuccess(res, { message: 'Item removed from saved list successfully.' });
});

const listStudents = asyncHandler(async (req, res) => {
    const query = buildUserQuery(req.query, { forceRole: ROLES.STUDENT });

    const [students, total] = await Promise.all([
        User.find(query.filter).sort(query.sort).skip(query.pagination.skip).limit(query.pagination.limit),
        User.countDocuments(query.filter),
    ]);

    return sendPaginated(res, {
        message: 'Students retrieved successfully.',
        data: students,
        meta: buildPaginationMetadata({ ...query.pagination, total }),
        filters: query.search,
    });
});

const getStudentById = asyncHandler(async (req, res) => {
    const student = await User.findOne({ _id: req.params.id, role: ROLES.STUDENT });

    if (!student) {
        return sendError(res, { status: 404, message: 'Student not found.' });
    }

    return sendSuccess(res, { message: 'Student retrieved successfully.', data: student });
});

export {
    addSavedItem,
    getMyProfile,
    getMySavedItems,
    getStudentById,
    listStudents,
    removeSavedItem,
    updateMyProfile,
};
