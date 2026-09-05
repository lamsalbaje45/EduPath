import { CV } from '../models/cv.js';
import { User } from '../models/user.js';
import { exportToHTML, exportToJSON } from '../services/cvExportService.js';

import { asyncHandler, sendError, sendSuccess } from './controllerUtils.js';

const CV_UPDATABLE_FIELDS = [
    'personalDetails',
    'educationEntries',
    'skillList',
    'experienceEntries',
    'projectEntries',
    'certifications',
    'languages',
    'templatePreference',
    'publicShareStatus',
];

function toDateOnly(value) {
    if (!value) {
        return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

function mapCvToExportShape(cv, user) {
    const personalDetails = cv.personalDetails || {};

    return {
        fullName: personalDetails.fullName || user?.fullName || '',
        email: personalDetails.email || user?.email || '',
        phoneNumber: personalDetails.phoneNumber || user?.phoneNumber || '',
        location: personalDetails.location || '',
        website: personalDetails.website || '',
        summary: personalDetails.summary || '',
        skills: cv.skillList || [],
        experience: (cv.experienceEntries || []).map((entry) => ({
            company: entry.organization || '',
            jobTitle: entry.title || '',
            startDate: toDateOnly(entry.startDate),
            endDate: toDateOnly(entry.endDate),
            description: entry.description || '',
        })),
        education: (cv.educationEntries || []).map((entry) => ({
            institution: entry.institution || '',
            degree: entry.degree || '',
            year: toDateOnly(entry.endDate) || toDateOnly(entry.startDate),
            details: entry.fieldOfStudy || entry.gradeOrScore || '',
        })),
        certifications: (cv.certifications || []).map((cert) => cert.name).filter(Boolean),
    };
}

function computeCompleteness(cv) {
    const sections = {
        personalDetails: Boolean(cv.personalDetails && Object.keys(cv.personalDetails).length > 0),
        education: (cv.educationEntries || []).length > 0,
        skills: (cv.skillList || []).length > 0,
        experience: (cv.experienceEntries || []).length > 0,
        projects: (cv.projectEntries || []).length > 0,
        certifications: (cv.certifications || []).length > 0,
        languages: (cv.languages || []).length > 0,
    };

    const filledCount = Object.values(sections).filter(Boolean).length;

    return {
        sections,
        percentage: Math.round((filledCount / Object.keys(sections).length) * 100),
    };
}

const getMyCv = asyncHandler(async (req, res) => {
    const cv = await CV.findOne({ student: req.user.id });

    if (!cv) {
        return sendError(res, { status: 404, message: 'You have not created a CV yet. Use PATCH /cv/me to create one.' });
    }

    return sendSuccess(res, { message: 'CV retrieved successfully.', data: cv });
});

const upsertMyCv = asyncHandler(async (req, res) => {
    const update = {};

    CV_UPDATABLE_FIELDS.forEach((field) => {
        if (req.body[field] !== undefined) {
            update[field] = req.body[field];
        }
    });

    const cv = await CV.findOneAndUpdate(
        { student: req.user.id },
        { $set: update, $setOnInsert: { student: req.user.id } },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return sendSuccess(res, { message: 'CV saved successfully.', data: cv });
});

const deleteMyCv = asyncHandler(async (req, res) => {
    const cv = await CV.findOneAndDelete({ student: req.user.id });

    if (!cv) {
        return sendError(res, { status: 404, message: 'You have not created a CV yet.' });
    }

    return sendSuccess(res, { message: 'CV deleted successfully.' });
});

const previewMyCv = asyncHandler(async (req, res) => {
    const cv = await CV.findOne({ student: req.user.id });

    if (!cv) {
        return sendError(res, { status: 404, message: 'You have not created a CV yet.' });
    }

    return sendSuccess(res, {
        message: 'CV preview generated successfully.',
        data: { cv, completeness: computeCompleteness(cv) },
    });
});

const exportMyCv = asyncHandler(async (req, res) => {
    const format = String(req.query.format || 'json').toLowerCase();

    const [cv, user] = await Promise.all([
        CV.findOne({ student: req.user.id }).lean(),
        User.findById(req.user.id).select('fullName email phoneNumber').lean(),
    ]);

    if (!cv) {
        return sendError(res, { status: 404, message: 'You have not created a CV yet.' });
    }

    const exportShape = mapCvToExportShape(cv, user);

    if (format === 'html') {
        const html = exportToHTML(exportShape);
        res.setHeader('Content-Disposition', 'attachment; filename="cv.html"');
        return res.type('html').send(html);
    }

    return sendSuccess(res, {
        message: 'CV exported successfully.',
        data: JSON.parse(exportToJSON(exportShape)),
    });
});

const getPublicCv = asyncHandler(async (req, res) => {
    const cv = await CV.findOne({ student: req.params.studentId, publicShareStatus: true });

    if (!cv) {
        return sendError(res, { status: 404, message: 'No public CV found for this student.' });
    }

    return sendSuccess(res, { message: 'Public CV retrieved successfully.', data: cv });
});

const getCvByStudentId = asyncHandler(async (req, res) => {
    const cv = await CV.findOne({ student: req.params.studentId });

    if (!cv) {
        return sendError(res, { status: 404, message: 'CV not found for this student.' });
    }

    return sendSuccess(res, { message: 'CV retrieved successfully.', data: cv });
});

export {
    deleteMyCv,
    exportMyCv,
    getCvByStudentId,
    getMyCv,
    getPublicCv,
    previewMyCv,
    upsertMyCv,
};
