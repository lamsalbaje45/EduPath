import mongoose from 'mongoose';

async function connectDatabase() {
    const mongoUri = process.env.MONGODB_URI;
    const serverSelectionTimeoutMS = Number(process.env.MONGODB_TIMEOUT_MS || 5000);

    if (!mongoUri) {
        throw new Error('MONGODB_URI is not set.');
    }

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS,
        });
        console.log('MongoDB connected successfully.');
        return mongoose.connection;
    } catch (error) {
        console.error('MongoDB connection error.');
        throw error;
    }
}

export { connectDatabase };