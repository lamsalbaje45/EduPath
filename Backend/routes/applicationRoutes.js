import { Router } from 'express';

import { ROLES } from '../config/roles.js';
import { requireRole } from '../middleware/authorization.js';
import {
    createApplication,
    deleteApplication,
    getApplicationById,
    listMyApplications,
    listReceivedApplications,
    updateApplicationStatus,
} from '../controllers/applicationsController.js';
import {
    validateApplicationCreateBody,
    validateApplicationStatusBody,
    validateObjectId,
} from '../validators/requestValidators.js';

const applicationsRouter = Router();

applicationsRouter.post('/', requireRole(ROLES.STUDENT), validateApplicationCreateBody, createApplication);
applicationsRouter.get('/me', listMyApplications);
applicationsRouter.get('/received', listReceivedApplications);
applicationsRouter.get('/:id', validateObjectId('id'), getApplicationById);
applicationsRouter.patch('/:id/status', validateObjectId('id'), validateApplicationStatusBody, updateApplicationStatus);
applicationsRouter.delete('/:id', validateObjectId('id'), deleteApplication);

export default applicationsRouter;
