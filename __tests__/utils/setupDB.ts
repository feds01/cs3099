import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongod: MongoMemoryServer;

// We want to configure the JEST hook callback timeout to be to 30 seconds since it might 
// take longer than the default 5 seconds to install MongoDB and create the mock server.
jest.setTimeout(30000);


beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const options = {};
    
    // Write the MongoDB connection string to the process environment
    process.env.MONGODB_CONNECTION_URI = uri;

    await mongoose.connect(uri, options);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
});
