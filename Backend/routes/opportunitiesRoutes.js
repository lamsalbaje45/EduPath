import { Router } from 'express';

import { ROLES } from '../config/roles.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin, requireRole } from '../middleware/authorization.js';
import {
    createOpportunity,
    deleteOpportunity,
    getOpportunityById,
    listOpportunities,
    updateOpportunity,
    updateOpportunityApproval,
} from '../controllers/opportunitiesController.js';
import {
    validateApprovalBody,
    validateObjectId,
    validateOpportunityBody,
    validateOpportunityListQuery,
} from '../validators/requestValidators.js';

const opportunitiesRouter = Router();

opportunitiesRouter.get('/', validateOpportunityListQuery, listOpportunities);
opportunitiesRouter.get('/:id', validateObjectId('id'), getOpportunityById);

opportunitiesRouter.post(
    '/',
    authenticateToken,
    requireRole(ROLES.EMPLOYER, ROLES.ADMIN),
    validateOpportunityBody(true),
    createOpportunity
);
opportunitiesRouter.patch('/:id', authenticateToken, validateObjectId('id'), validateOpportunityBody(false), updateOpportunity);
opportunitiesRouter.delete('/:id', authenticateToken, validateObjectId('id'), deleteOpportunity);
opportunitiesRouter.patch(
    '/:id/approval',
    authenticateToken,
    requireAdmin,
    validateObjectId('id'),
    validateApprovalBody,
    updateOpportunityApproval
);

export default opportunitiesRouter;
