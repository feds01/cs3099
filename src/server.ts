import app from './app';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import mongoose from 'mongoose';
import Logger from './common/logger';
import { ConfigSchema } from './validators/config';
import { ZodError } from 'zod';

require('dotenv').config(); // Import our environment variables

//initialize a simple http server
const server = createServer(app);

// Here we create a config object and try to validate it using the config validator...
const rawConfig = {
    mongoURI: process.env.MONGODB_CONNECTION_URI,
    jwtExpiry: '1h',
    jwtRefreshExpiry: '7d',
    jwtSecret: process.env.JWT_SECRET_KEY,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET_KEY,
    resourcesFolder: process.env.RESOURCES_FOLDER,
    teamName: 't06',
    frontendURI: process.env.FRONT_END_URI,
}

function validateConfig() {
    try {
        Logger.info('Loading server configuration');
        return ConfigSchema.parse(rawConfig);
    } catch (e) {
        if (e instanceof ZodError) {
            Logger.error(`Server config validation failed: ${e}`);
        }
        process.exit(1);
    }
}

export const config = validateConfig();

//start our server
server.listen(process.env['PORT'] || 5000, () => {
    const port = (server.address() as AddressInfo).port;

    Logger.info(`Server started on ${port}! (environment: ${process.env['NODE_ENV'] || 'dev'})`);
    Logger.info('Attempting connection with MongoDB service');

    // TODO(alex): Try to load the current federations configuration from disk, but if we don't
    //             have it, then we make a request to the supergroup info endpoint at:
    //             --> https://gbs3.host.cs.st-andrews.ac.uk/cs3099-journals.json

    mongoose.connect(
        process.env['MONGODB_CONNECTION_URI']!,
        {
            connectTimeoutMS: 30000,
        },
        (err: any) => {
            if (err) {
                Logger.error(`Failed to connect to MongoDB: ${err.message}`);
                process.exit(1);
            }

            Logger.info('Established connection with MongoDB service');
        },
    );
});
