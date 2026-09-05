import { Router } from 'express';

import { ROLES } from '../config/roles.js';
import { requireRole } from '../middleware/authorization.js';
import {
    createInquiry,
    deleteInquiry,
    getInquiryById,
    listMyInquiries,
    listReceivedInquiries,
    updateInquiryStatus,
} from '../controllers/inquiriesController.js';
import {
    validateInquiryCreateBody,
    validateInquiryStatusBody,
    validateObjectId,
} from '../validators/requestValidators.js';

const inquiriesRouter = Router();

inquiriesRouter.post('/', requireRole(ROLES.STUDENT), validateInquiryCreateBody, createInquiry);
inquiriesRouter.get('/me', listMyInquiries);
inquiriesRouter.get('/received', listReceivedInquiries);
inquiriesRouter.get('/:id', validateObjectId('id'), getInquiryById);
inquiriesRouter.patch('/:id/status', validateObjectId('id'), validateInquiryStatusBody, updateInquiryStatus);
inquiriesRouter.delete('/:id', validateObjectId('id'), deleteInquiry);

export default inquiriesRouter;
