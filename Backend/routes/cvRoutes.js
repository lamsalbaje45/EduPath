import { Router } from 'express';
import { getCvOverview } from '../controllers/cvController.js';

const cvRouter = Router();

cvRouter.get('/', getCvOverview);

export default cvRouter;
