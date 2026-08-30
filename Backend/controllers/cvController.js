import { asyncHandler, sendSuccess } from './controllerUtils.js';

const getCvOverview = asyncHandler(async (req, res) => sendSuccess(res, {
    message: 'CV route group',
    routes: ['save', 'update sections', 'preview', 'export later'],
}));

export { getCvOverview };
