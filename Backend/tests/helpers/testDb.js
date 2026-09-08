import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod;

async function startTestDb() {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
}

async function stopTestDb() {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();

    if (mongod) {
        await mongod.stop();
        mongod = undefined;
    }
}

async function clearTestDb() {
    const { collections } = mongoose.connection;

    await Promise.all(
        Object.values(collections).map((collection) => collection.deleteMany({}))
    );
}

export { clearTestDb, startTestDb, stopTestDb };
