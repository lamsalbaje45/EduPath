import { asyncHandler, sendSuccess } from './controllerUtils.js';

const getStudentsOverview = asyncHandler(async (req, res) => sendSuccess(res, {
    message: 'Student route group',
    routes: ['profile CRUD', 'saved items', 'recommendations'],
}));

export { getStudentsOverview };
