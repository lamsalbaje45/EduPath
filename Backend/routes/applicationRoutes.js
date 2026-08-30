import { Router } from 'express';
import { getApplicationsOverview } from '../controllers/applicationsController.js';

const applicationsRouter = Router();

applicationsRouter.get('/', getApplicationsOverview);

export default applicationsRouter;
