import { Router } from 'express';

import { listClasses } from '../controllers/classesController.js';
import { validateClassListQuery } from '../validators/requestValidators.js';

const classesRouter = Router();

classesRouter.get('/', validateClassListQuery, listClasses);

export default classesRouter;
