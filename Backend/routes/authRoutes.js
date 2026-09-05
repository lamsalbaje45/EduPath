import { Router } from 'express';

import { authenticateToken } from '../middleware/auth.js';
import {
    changePassword,
    confirmPasswordReset,
    getCurrentUser,
    login,
    logout,
    register,
    requestPasswordReset,
} from '../controllers/authController.js';
import {
    validateChangePasswordBody,
    validateLoginBody,
    validatePasswordResetConfirmBody,
    validatePasswordResetRequestBody,
    validateRegisterBody,
} from '../validators/requestValidators.js';

const authRouter = Router();

authRouter.post('/register', validateRegisterBody, register);
authRouter.post('/login', validateLoginBody, login);
authRouter.post('/password-reset/request', validatePasswordResetRequestBody, requestPasswordReset);
authRouter.post('/password-reset/confirm', validatePasswordResetConfirmBody, confirmPasswordReset);

authRouter.get('/me', authenticateToken, getCurrentUser);
authRouter.post('/logout', authenticateToken, logout);
authRouter.patch('/change-password', authenticateToken, validateChangePasswordBody, changePassword);

export default authRouter;
