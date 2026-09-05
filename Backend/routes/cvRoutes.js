import { Router } from 'express';

import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/authorization.js';
import {
    deleteMyCv,
    exportMyCv,
    getCvByStudentId,
    getMyCv,
    getPublicCv,
    previewMyCv,
    upsertMyCv,
} from '../controllers/cvController.js';
import { validateCvBody, validateObjectId } from '../validators/requestValidators.js';

const cvRouter = Router();

cvRouter.get('/public/:studentId', validateObjectId('studentId'), getPublicCv);

cvRouter.get('/me', authenticateToken, getMyCv);
cvRouter.patch('/me', authenticateToken, validateCvBody, upsertMyCv);
cvRouter.delete('/me', authenticateToken, deleteMyCv);
cvRouter.get('/me/preview', authenticateToken, previewMyCv);
cvRouter.get('/me/export', authenticateToken, exportMyCv);

cvRouter.get('/:studentId', authenticateToken, requireAdmin, validateObjectId('studentId'), getCvByStudentId);

export default cvRouter;
