import path from 'path';

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';

import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import apiRouter from './routes/indexRoutes.js';
import { sendSuccess } from './utils/apiResponse.js';

dotenv.config();

const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || './uploads');
const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '100kb' }));
app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/api', apiRouter);

app.get('/', (req, res) => sendSuccess(res, { message: 'EduPath backend is running.' }));

app.get('/health', (req, res) => {
    return sendSuccess(res, {
        message: 'Service is healthy.',
        data: {
            status: 'ok',
            database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        },
    });
});

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
