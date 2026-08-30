import { Router } from 'express';
import { getStudentsOverview } from '../controllers/studentsController.js';

const studentsRouter = Router();

studentsRouter.get('/', getStudentsOverview);

export default studentsRouter;
