import { validationResult, body, param, query } from 'express-validator';

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
        return res.status(400).json({
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

export {
    DEFAULT_PAGE,
    DEFAULT_LIMIT,
    MAX_LIMIT,
    handleValidationErrors,
    validateBody,
    validateClassListQuery,
    validateCollegeListQuery,
    validateObjectId,
    validateOpportunityListQuery,
    body,
    param,
    query,
};
