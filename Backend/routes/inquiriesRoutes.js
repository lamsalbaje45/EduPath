import { Router } from 'express';
import { getInquiriesOverview } from '../controllers/inquiriesController.js';

const inquiriesRouter = Router();

inquiriesRouter.get('/', getInquiriesOverview);

export default inquiriesRouter;
