import { asyncHandler, sendSuccess } from './controllerUtils.js';

const getApplicationsOverview = asyncHandler(async (req, res) => sendSuccess(res, {
    message: 'Application route group',
    routes: ['apply', 'view own', 'view employer applications', 'update status'],
}));

export { getApplicationsOverview };
