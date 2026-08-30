import { Router } from 'express';

import { authenticateToken } from '../middleware/auth.js';
import { getAuthOverview, getCurrentUser } from '../controllers/authController.js';

const authRouter = Router();

authRouter.get('/', getAuthOverview);

authRouter.get('/me', authenticateToken, getCurrentUser);

export default authRouter;
