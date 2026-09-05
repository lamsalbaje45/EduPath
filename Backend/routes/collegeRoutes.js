import { Router } from 'express';

import { ROLES } from '../config/roles.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin, requireRole } from '../middleware/authorization.js';
import {
    createCollege,
    deleteCollege,
    getCollegeById,
    listColleges,
    updateCollege,
    updateCollegeApproval,
} from '../controllers/collegesController.js';
import {
    validateApprovalBody,
    validateCollegeBody,
    validateCollegeListQuery,
    validateObjectId,
} from '../validators/requestValidators.js';

const collegesRouter = Router();

collegesRouter.get('/', validateCollegeListQuery, listColleges);
collegesRouter.get('/:id', validateObjectId('id'), getCollegeById);

collegesRouter.post(
    '/',
    authenticateToken,
    requireRole(ROLES.COLLEGE_ADMIN, ROLES.ADMIN),
    validateCollegeBody(true),
    createCollege
);
collegesRouter.patch('/:id', authenticateToken, validateObjectId('id'), validateCollegeBody(false), updateCollege);
collegesRouter.delete('/:id', authenticateToken, validateObjectId('id'), deleteCollege);
collegesRouter.patch(
    '/:id/approval',
    authenticateToken,
    requireAdmin,
    validateObjectId('id'),
    validateApprovalBody,
    updateCollegeApproval
);

export default collegesRouter;
