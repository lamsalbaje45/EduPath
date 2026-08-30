import { asyncHandler, sendSuccess } from './controllerUtils.js';

const getInquiriesOverview = asyncHandler(async (req, res) => sendSuccess(res, {
    message: 'Inquiry route group',
    routes: ['send', 'view own', 'view received', 'update status'],
}));

export { getInquiriesOverview };
