import { Router } from 'express';

import { requireAdmin, requireStudentSelf } from '../middleware/authorization.js';
import {
    addSavedItem,
    getMyProfile,
    getMySavedItems,
    getStudentById,
    listStudents,
    removeSavedItem,
    updateMyProfile,
} from '../controllers/studentsController.js';
import {
    validateSavedItemParams,
    validateStudentProfileBody,
    validateUserListQuery,
} from '../validators/requestValidators.js';

const studentsRouter = Router();

studentsRouter.get('/me', getMyProfile);
studentsRouter.patch('/me', validateStudentProfileBody, updateMyProfile);
studentsRouter.get('/me/saved', getMySavedItems);
studentsRouter.post('/me/saved/:type/:itemId', validateSavedItemParams, addSavedItem);
studentsRouter.delete('/me/saved/:type/:itemId', validateSavedItemParams, removeSavedItem);

studentsRouter.get('/', requireAdmin, validateUserListQuery, listStudents);
studentsRouter.get('/:id', requireStudentSelf, getStudentById);

export default studentsRouter;
