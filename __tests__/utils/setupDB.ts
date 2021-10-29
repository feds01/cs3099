import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

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
