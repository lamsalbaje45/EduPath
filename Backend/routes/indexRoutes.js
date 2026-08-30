import { Router } from 'express';

import { authenticateToken } from '../middleware/auth.js';
import authRouter from './auth.js';
import usersRouter from './users.js';
import studentsRouter from './students.js';
import collegesRouter from './colleges.js';
import opportunitiesRouter from './opportunities.js';
import classesRouter from './classes.js';
import inquiriesRouter from './inquiries.js';
import applicationsRouter from './applications.js';
import cvRouter from './cv.js';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/users', authenticateToken, usersRouter);
apiRouter.use('/students', authenticateToken, studentsRouter);
apiRouter.use('/colleges', collegesRouter);
apiRouter.use('/opportunities', opportunitiesRouter);
apiRouter.use('/classes', classesRouter);
apiRouter.use('/inquiries', authenticateToken, inquiriesRouter);
apiRouter.use('/applications', authenticateToken, applicationsRouter);
apiRouter.use('/cv', authenticateToken, cvRouter);

export default apiRouter;