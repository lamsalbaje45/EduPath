import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';

import { connectDatabase } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import apiRouter from './routes/indexRoutes.js';
import { sendSuccess } from './utils/apiResponse.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
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

let server;

mongoose.connection.on('disconnected', () => {
    console.error('MongoDB disconnected. Shutting down the server.');

    if (server) {
        server.close(() => {
            process.exit(1);
        });
        return;
    }

    process.exit(1);
});

async function startServer() {
    try {
        await connectDatabase();

        server = app.listen(PORT, () => {
            console.log(`Server is running at http://localhost:${PORT}/`);
        });
    } catch (error) {
        console.error('Failed to start server because the database connection was unavailable.');
        console.error(error.message);
        process.exit(1);
    }
}

async function shutdown(signal) {
    try {
        if (server) {
            await new Promise((resolve, reject) => {
                server.close((error) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve();
                });
            });
        }

        await mongoose.connection.close();
        console.log(`Received ${signal}. Server shut down cleanly.`);
        process.exit(0);
    } catch (error) {
        console.error(`Error during shutdown after ${signal}.`);
        console.error(error.message);
        process.exit(1);
    }
}

process.on('SIGINT', () => {
    void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
});

void startServer();
