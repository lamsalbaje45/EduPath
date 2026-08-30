import { Router } from 'express';

import { listOpportunities } from '../controllers/opportunitiesController.js';
import { validateOpportunityListQuery } from '../validators/requestValidators.js';

const opportunitiesRouter = Router();

opportunitiesRouter.get('/', validateOpportunityListQuery, listOpportunities);

export default opportunitiesRouter;
