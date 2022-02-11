import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const options = {};

    await mongoose.connect(uri, options);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
});
