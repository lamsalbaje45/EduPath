import { Router } from 'express';

import { listColleges } from '../controllers/collegesController.js';
import { validateCollegeListQuery } from '../validators/requestValidators.js';

const collegesRouter = Router();

collegesRouter.get('/', validateCollegeListQuery, listColleges);

export default collegesRouter;
