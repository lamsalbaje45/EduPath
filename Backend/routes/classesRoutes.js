import { Router } from 'express';

import { ROLES } from '../config/roles.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin, requireRole } from '../middleware/authorization.js';
import {
    createClass,
    deleteClass,
    getClassById,
    listClasses,
    updateClass,
    updateClassApproval,
} from '../controllers/classesController.js';
import {
    validateApprovalBody,
    validateClassBody,
    validateClassListQuery,
    validateObjectId,
} from '../validators/requestValidators.js';

const classesRouter = Router();

classesRouter.get('/', validateClassListQuery, listClasses);
classesRouter.get('/:id', validateObjectId('id'), getClassById);

classesRouter.post(
    '/',
    authenticateToken,
    requireRole(ROLES.INSTRUCTOR, ROLES.ADMIN),
    validateClassBody(true),
    createClass
);
classesRouter.patch('/:id', authenticateToken, validateObjectId('id'), validateClassBody(false), updateClass);
classesRouter.delete('/:id', authenticateToken, validateObjectId('id'), deleteClass);
classesRouter.patch(
    '/:id/approval',
    authenticateToken,
    requireAdmin,
    validateObjectId('id'),
    validateApprovalBody,
    updateClassApproval
);

export default classesRouter;
