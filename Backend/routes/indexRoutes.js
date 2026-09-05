import { Router } from 'express';

import { authenticateToken } from '../middleware/auth.js';
import authRouter from './authRoutes.js';
import usersRouter from './userRoutes.js';
import studentsRouter from './studentRoutes.js';
import collegesRouter from './collegeRoutes.js';
import opportunitiesRouter from './opportunitiesRoutes.js';
import classesRouter from './classesRoutes.js';
import inquiriesRouter from './inquiriesRoutes.js';
import applicationsRouter from './applicationRoutes.js';
import cvRouter from './cvRoutes.js';
import recommendationsRouter from './recommendationsRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', authenticateToken, usersRouter);
apiRouter.use('/students', authenticateToken, studentsRouter);
apiRouter.use('/colleges', collegesRouter);
apiRouter.use('/opportunities', opportunitiesRouter);
apiRouter.use('/classes', classesRouter);
apiRouter.use('/inquiries', authenticateToken, inquiriesRouter);
apiRouter.use('/applications', authenticateToken, applicationsRouter);
apiRouter.use('/cv', cvRouter);
apiRouter.use('/recommendations', recommendationsRouter);

export default apiRouter;