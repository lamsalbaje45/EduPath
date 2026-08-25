import { asyncHandler, sendSuccess } from './controllerUtils.js';

const getAuthOverview = asyncHandler(async (req, res) => sendSuccess(res, {
    message: 'Auth route group',
    routes: ['register', 'login', 'me', 'password-reset', 'logout'],
}));

const getCurrentUser = asyncHandler(async (req, res) => sendSuccess(res, {
    message: 'Current authenticated user',
    data: req.user,
    user: req.user,
}));

export { getAuthOverview, getCurrentUser };
