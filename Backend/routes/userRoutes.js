import { Router } from 'express';
import { getUsersOverview } from '../controllers/usersController.js';

const usersRouter = Router();

usersRouter.get('/', getUsersOverview);

export default usersRouter;
