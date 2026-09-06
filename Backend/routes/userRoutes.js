import { Router } from 'express';

import { requireAdmin } from '../middleware/authorization.js';
import { profileImageUpload } from '../middleware/upload.js';
import {
    deleteUser,
    getMyAccount,
    getUserById,
    listUsers,
    updateMyAccount,
    updateUserRole,
    updateUserStatus,
    uploadMyProfileImage,
} from '../controllers/usersController.js';
import {
    validateObjectId,
    validateUserListQuery,
    validateUserRoleBody,
    validateUserSelfUpdateBody,
    validateUserStatusBody,
} from '../validators/requestValidators.js';

const usersRouter = Router();

usersRouter.get('/me', getMyAccount);
usersRouter.patch('/me', validateUserSelfUpdateBody, updateMyAccount);
usersRouter.post('/me/profile-image', profileImageUpload, uploadMyProfileImage);

usersRouter.get('/', requireAdmin, validateUserListQuery, listUsers);
usersRouter.get('/:id', requireAdmin, validateObjectId('id'), getUserById);
usersRouter.patch('/:id/status', requireAdmin, validateObjectId('id'), validateUserStatusBody, updateUserStatus);
usersRouter.patch('/:id/role', requireAdmin, validateObjectId('id'), validateUserRoleBody, updateUserRole);
usersRouter.delete('/:id', requireAdmin, validateObjectId('id'), deleteUser);

export default usersRouter;
