import { asyncHandler, sendSuccess } from './controllerUtils.js';

const getUsersOverview = asyncHandler(async (req, res) => sendSuccess(res, {
    message: 'User route group',
    routes: ['account details', 'update account', 'status management', 'admin management'],
}));

export { getUsersOverview };
