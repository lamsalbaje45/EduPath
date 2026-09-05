import { validationResult, body, param, query } from 'express-validator';
import { sendError } from '../utils/apiResponse.js';
import { ROLES } from '../config/roles.js';

const PUBLIC_REGISTERABLE_ROLES = [ROLES.STUDENT, ROLES.COLLEGE_ADMIN, ROLES.EMPLOYER, ROLES.INSTRUCTOR];

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const commonQueryRules = [
    query('search').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Search term must be between 1 and 200 characters.'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
    query('limit').optional().isInt({ min: 1, max: MAX_LIMIT }).withMessage(`Limit must be between 1 and ${MAX_LIMIT}.`),
    query('sortBy').optional().trim().matches(/^[a-zA-Z0-9_.-]+$/).withMessage('Sort field is invalid.'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc.'),
];

function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return sendError(res, {
            status: 400,
            message: 'Validation failed',
            errors: errors.array().map((error) => ({
                field: error.path || error.param || 'unknown',
                message: error.msg,
            })),
        });
    }

    return next();
}

function createValidatorChain(rules) {
    return async function validateRequest(req, res, next) {
        for (const rule of rules) {
            await rule.run(req);
        }

        return handleValidationErrors(req, res, next);
    };
}

const validateCollegeListQuery = createValidatorChain([
    ...commonQueryRules,
    query('course').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('Course filter is invalid.'),
    query('city').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('City filter is invalid.'),
    query('admissionStatus').optional().isIn(['open', 'closed', 'coming_soon']).withMessage('Admission status must be open, closed, or coming_soon.'),
    query('affiliation').optional().isString().trim().isLength({ min: 1, max: 120 }).withMessage('Affiliation filter is invalid.'),
    query('ratingMin').optional().isFloat({ min: 0, max: 5 }).withMessage('ratingMin must be between 0 and 5.'),
    query('ratingMax').optional().isFloat({ min: 0, max: 5 }).withMessage('ratingMax must be between 0 and 5.'),
    query('feeMin').optional().isFloat({ min: 0 }).withMessage('feeMin must be a positive number.'),
    query('feeMax').optional().isFloat({ min: 0 }).withMessage('feeMax must be a positive number.'),
]);

const validateOpportunityListQuery = createValidatorChain([
    ...commonQueryRules,
    query('type').optional().isIn(['job', 'internship']).withMessage('Type must be job or internship.'),
    query('skill').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('Skill filter is invalid.'),
    query('location').optional().isString().trim().isLength({ min: 1, max: 120 }).withMessage('Location filter is invalid.'),
    query('workMode').optional().isIn(['onsite', 'remote', 'hybrid']).withMessage('Work mode must be onsite, remote, or hybrid.'),
    query('status').optional().isIn(['active', 'closed', 'draft']).withMessage('Status must be active, closed, or draft.'),
    query('deadlineBefore').optional().isISO8601().withMessage('deadlineBefore must be a valid ISO date.'),
    query('deadlineAfter').optional().isISO8601().withMessage('deadlineAfter must be a valid ISO date.'),
]);

const validateClassListQuery = createValidatorChain([
    ...commonQueryRules,
    query('level').optional().isString().trim().isLength({ min: 1, max: 80 }).withMessage('Level filter is invalid.'),
    query('mode').optional().isIn(['live', 'recorded', 'self_paced']).withMessage('Mode must be live, recorded, or self_paced.'),
    query('certificate').optional().isBoolean().withMessage('Certificate must be true or false.'),
    query('priceMin').optional().isFloat({ min: 0 }).withMessage('priceMin must be a positive number.'),
    query('priceMax').optional().isFloat({ min: 0 }).withMessage('priceMax must be a positive number.'),
]);

const validateObjectId = (fieldName) => createValidatorChain([
    param(fieldName).exists().isMongoId().withMessage(`${fieldName} must be a valid MongoDB ObjectId.`),
]);

const validateBody = (rules) => createValidatorChain(rules);

// ---- Auth ----

const validateRegisterBody = createValidatorChain([
    body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters.'),
    body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
    body('password').isString().isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
    body('phoneNumber').optional().trim().isLength({ min: 5, max: 20 }).withMessage('Phone number is invalid.'),
    body('role').optional().isIn(PUBLIC_REGISTERABLE_ROLES).withMessage(`Role must be one of: ${PUBLIC_REGISTERABLE_ROLES.join(', ')}.`),
]);

const validateLoginBody = createValidatorChain([
    body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
    body('password').isString().notEmpty().withMessage('Password is required.'),
]);

const validateChangePasswordBody = createValidatorChain([
    body('currentPassword').isString().notEmpty().withMessage('Current password is required.'),
    body('newPassword').isString().isLength({ min: 8 }).withMessage('New password must be at least 8 characters long.'),
]);

const validatePasswordResetRequestBody = createValidatorChain([
    body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
]);

const validatePasswordResetConfirmBody = createValidatorChain([
    body('token').isString().notEmpty().withMessage('Reset token is required.'),
    body('newPassword').isString().isLength({ min: 8 }).withMessage('New password must be at least 8 characters long.'),
]);

// ---- Users ----

const validateUserSelfUpdateBody = createValidatorChain([
    body('fullName').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters.'),
    body('phoneNumber').optional().trim().isLength({ min: 5, max: 20 }).withMessage('Phone number is invalid.'),
    body('profileImage').optional().trim().isLength({ min: 1, max: 500 }).withMessage('Profile image is invalid.'),
]);

const validateUserStatusBody = createValidatorChain([
    body('accountStatus').isIn(['active', 'inactive', 'suspended', 'pending']).withMessage('Account status must be active, inactive, suspended, or pending.'),
]);

const validateUserRoleBody = createValidatorChain([
    body('role').isIn(Object.values(ROLES)).withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}.`),
]);

const validateUserListQuery = createValidatorChain([
    ...commonQueryRules,
    query('role').optional().isIn(Object.values(ROLES)).withMessage('Role filter is invalid.'),
    query('accountStatus').optional().isIn(['active', 'inactive', 'suspended', 'pending']).withMessage('Account status filter is invalid.'),
]);

// ---- Students ----

const validateStudentProfileBody = createValidatorChain([
    body('educationLevel').optional().trim().isLength({ max: 100 }).withMessage('Education level is invalid.'),
    body('currentCourse').optional().trim().isLength({ max: 150 }).withMessage('Current course is invalid.'),
    body('preferredCourses').optional().isArray().withMessage('Preferred courses must be an array.'),
    body('preferredCities').optional().isArray().withMessage('Preferred cities must be an array.'),
    body('skills').optional().isArray().withMessage('Skills must be an array.'),
    body('careerInterests').optional().isArray().withMessage('Career interests must be an array.'),
    body('preferredOpportunityType').optional().trim().isLength({ max: 100 }).withMessage('Preferred opportunity type is invalid.'),
    body('portfolioLinks').optional().isArray().withMessage('Portfolio links must be an array.'),
    body('bio').optional().trim().isLength({ max: 2000 }).withMessage('Bio must be at most 2000 characters.'),
    body('address').optional().trim().isLength({ max: 300 }).withMessage('Address is invalid.'),
    body('recommendationPreferences').optional().isObject().withMessage('Recommendation preferences must be an object.'),
]);

const validateSavedItemParams = createValidatorChain([
    param('type').isIn(['colleges', 'opportunities', 'classes']).withMessage('Saved item type must be colleges, opportunities, or classes.'),
    param('itemId').isMongoId().withMessage('itemId must be a valid MongoDB ObjectId.'),
]);

// ---- Catalog (colleges / opportunities / classes) shared field rules ----

const validateCollegeBody = (requireFields) => createValidatorChain([
    body('collegeName')[requireFields ? 'exists' : 'optional']().trim().isLength({ min: 2, max: 200 }).withMessage('College name must be between 2 and 200 characters.'),
    body('city')[requireFields ? 'exists' : 'optional']().trim().isLength({ min: 1, max: 100 }).withMessage('City is required.'),
    body('address').optional().trim().isLength({ max: 300 }).withMessage('Address is invalid.'),
    body('affiliation').optional().trim().isLength({ max: 120 }).withMessage('Affiliation is invalid.'),
    body('courses').optional().isArray().withMessage('Courses must be an array.'),
    body('feeRange').optional().trim().isLength({ max: 100 }).withMessage('Fee range is invalid.'),
    body('facilities').optional().isArray().withMessage('Facilities must be an array.'),
    body('admissionStatus').optional().isIn(['open', 'closed', 'coming_soon']).withMessage('Admission status must be open, closed, or coming_soon.'),
    body('description').optional().trim().isLength({ max: 5000 }).withMessage('Description is too long.'),
    body('contactEmail').optional().trim().isEmail().withMessage('Contact email is invalid.'),
    body('contactPhone').optional().trim().isLength({ max: 20 }).withMessage('Contact phone is invalid.'),
    body('website').optional().trim().isLength({ max: 300 }).withMessage('Website is invalid.'),
    body('images').optional().isArray().withMessage('Images must be an array.'),
]);

const validateOpportunityBody = (requireFields) => createValidatorChain([
    body('title')[requireFields ? 'exists' : 'optional']().trim().isLength({ min: 2, max: 200 }).withMessage('Title must be between 2 and 200 characters.'),
    body('companyName')[requireFields ? 'exists' : 'optional']().trim().isLength({ min: 1, max: 150 }).withMessage('Company name is required.'),
    body('type')[requireFields ? 'exists' : 'optional']().isIn(['job', 'internship']).withMessage('Type must be job or internship.'),
    body('location').optional().trim().isLength({ max: 150 }).withMessage('Location is invalid.'),
    body('workMode').optional().isIn(['onsite', 'remote', 'hybrid']).withMessage('Work mode must be onsite, remote, or hybrid.'),
    body('stipendOrSalaryRange').optional().trim().isLength({ max: 100 }).withMessage('Stipend/salary range is invalid.'),
    body('requiredSkills').optional().isArray().withMessage('Required skills must be an array.'),
    body('suitableCourses').optional().isArray().withMessage('Suitable courses must be an array.'),
    body('applicationDeadline').optional().isISO8601().withMessage('Application deadline must be a valid ISO date.'),
    body('description').optional().trim().isLength({ max: 5000 }).withMessage('Description is too long.'),
    body('applicationLink').optional().trim().isLength({ max: 300 }).withMessage('Application link is invalid.'),
    body('internalApplication').optional().isBoolean().withMessage('internalApplication must be true or false.'),
    body('status').optional().isIn(['active', 'closed', 'draft']).withMessage('Status must be active, closed, or draft.'),
]);

const validateClassBody = (requireFields) => createValidatorChain([
    body('classTitle')[requireFields ? 'exists' : 'optional']().trim().isLength({ min: 2, max: 200 }).withMessage('Class title must be between 2 and 200 characters.'),
    body('instructorOrOrganization')[requireFields ? 'exists' : 'optional']().trim().isLength({ min: 1, max: 150 }).withMessage('Instructor/organization is required.'),
    body('level').optional().trim().isLength({ max: 80 }).withMessage('Level is invalid.'),
    body('mode').optional().isIn(['live', 'recorded', 'self_paced']).withMessage('Mode must be live, recorded, or self_paced.'),
    body('duration').optional().trim().isLength({ max: 100 }).withMessage('Duration is invalid.'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number.'),
    body('subjects').optional().isArray().withMessage('Subjects must be an array.'),
    body('certificateAvailability').optional().isBoolean().withMessage('certificateAvailability must be true or false.'),
    body('description').optional().trim().isLength({ max: 5000 }).withMessage('Description is too long.'),
    body('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date.'),
    body('schedule').optional().trim().isLength({ max: 200 }).withMessage('Schedule is invalid.'),
    body('enrollmentLink').optional().trim().isLength({ max: 300 }).withMessage('Enrollment link is invalid.'),
]);

const validateApprovalBody = createValidatorChain([
    body('approvalStatus').isIn(['pending', 'approved', 'rejected']).withMessage('Approval status must be pending, approved, or rejected.'),
]);

// ---- Inquiries ----

const validateInquiryCreateBody = createValidatorChain([
    body('targetType').isIn(['college', 'employer', 'instructor']).withMessage('Target type must be college, employer, or instructor.'),
    body('targetRecord').isMongoId().withMessage('targetRecord must be a valid MongoDB ObjectId.'),
    body('message').trim().isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters.'),
    body('phone').optional().trim().isLength({ max: 20 }).withMessage('Phone number is invalid.'),
]);

const validateInquiryStatusBody = createValidatorChain([
    body('status').isIn(['new', 'read', 'replied', 'closed']).withMessage('Status must be new, read, replied, or closed.'),
]);

// ---- Applications ----

const validateApplicationCreateBody = createValidatorChain([
    body('opportunity').isMongoId().withMessage('opportunity must be a valid MongoDB ObjectId.'),
    body('coverMessage').optional().trim().isLength({ max: 2000 }).withMessage('Cover message must be at most 2000 characters.'),
]);

const validateApplicationStatusBody = createValidatorChain([
    body('status').isIn(['draft', 'submitted', 'reviewing', 'shortlisted', 'rejected', 'accepted']).withMessage('Status is invalid.'),
    body('employerNotes').optional().trim().isLength({ max: 2000 }).withMessage('Employer notes must be at most 2000 characters.'),
]);

// ---- CV ----

const validateCvBody = createValidatorChain([
    body('personalDetails').optional().isObject().withMessage('personalDetails must be an object.'),
    body('educationEntries').optional().isArray().withMessage('educationEntries must be an array.'),
    body('skillList').optional().isArray().withMessage('skillList must be an array.'),
    body('experienceEntries').optional().isArray().withMessage('experienceEntries must be an array.'),
    body('projectEntries').optional().isArray().withMessage('projectEntries must be an array.'),
    body('certifications').optional().isArray().withMessage('certifications must be an array.'),
    body('languages').optional().isArray().withMessage('languages must be an array.'),
    body('templatePreference').optional().trim().isLength({ max: 100 }).withMessage('Template preference is invalid.'),
    body('publicShareStatus').optional().isBoolean().withMessage('publicShareStatus must be true or false.'),
]);

export {
    DEFAULT_PAGE,
    DEFAULT_LIMIT,
    MAX_LIMIT,
    handleValidationErrors,
    validateApplicationCreateBody,
    validateApplicationStatusBody,
    validateApprovalBody,
    validateBody,
    validateChangePasswordBody,
    validateClassBody,
    validateClassListQuery,
    validateCollegeBody,
    validateCollegeListQuery,
    validateCvBody,
    validateInquiryCreateBody,
    validateInquiryStatusBody,
    validateLoginBody,
    validateObjectId,
    validateOpportunityBody,
    validateOpportunityListQuery,
    validatePasswordResetConfirmBody,
    validatePasswordResetRequestBody,
    validateRegisterBody,
    validateSavedItemParams,
    validateStudentProfileBody,
    validateUserListQuery,
    validateUserRoleBody,
    validateUserSelfUpdateBody,
    validateUserStatusBody,
    body,
    param,
    query,
};
