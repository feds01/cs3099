import { createServer } from 'http';
import mongoose from 'mongoose';
import { AddressInfo } from 'net';
import path from 'path';
import { ZodError } from 'zod';

import app from './app';
import Logger from './common/logger';
import program from './config/commander';
import PublicationModel from './models/Publication';
import UserModel from './models/User';
import { ConfigSchema } from './validators/config';

require('dotenv').config({
    path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
}); // Import our environment variables

// Here we create a config object and try to validate it using the config validator...
const rawConfig = {
    mongoURI: process.env.MONGODB_CONNECTION_URI,
    jwtExpiry: '1h',
    jwtRefreshExpiry: '7d',
    jwtSecret: process.env.JWT_SECRET_KEY,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET_KEY,
    resourcesFolder: process.env.RESOURCES_FOLDER,
    tempFolder: path.resolve(__dirname + '/../tmp'),
    teamName: 't06',
    port: process.env.PORT,
    frontendURI: process.env.FRONT_END_URI,
    serviceEndpoint: process.env.SERVICE_ENDPOINT,
};

function validateConfig() {
    // Parse command-line arguments.
    program.parse(process.argv);
    const options = program.opts();

    try {
        Logger.info('Loading server configuration...');
        return ConfigSchema.parse({
            ...rawConfig,
            ...(typeof options.port !== 'undefined' && { port: options.port }),
        });
    } catch (e) {
        if (e instanceof ZodError) {
            const errorMessages = [];

            for (const error of e.errors) {
                errorMessages.push(`  • '${error.path.join('.')}': ${error.message}.`);
            }
            Logger.error(`Server config validation failed:\n${errorMessages.join('\n')}`);
        }
        console.log(e);
        process.exit(1);
    }
}

export const config = validateConfig();

//initialize a simple http server
const server = createServer(app);

function startServer() {
    server.on('error', (err: NodeJS.ErrnoException) => {
        if ('code' in err && err.code === 'EADDRINUSE') {
            Logger.error('Server port is in use, try another or free the port.');
            process.exit(1);
        }
    });

    server.listen(config.port, async () => {
        const port = (server.address() as AddressInfo).port;

        Logger.info(
            `Server started on ${port}! (environment: ${process.env['NODE_ENV'] || 'dev'})`,
        );
        Logger.info('Attempting connection with MongoDB service');

        mongoose.connect(
            config.mongoURI,
            {
                connectTimeoutMS: 30000,
            },
            async (err) => {
                if (err) {
                    Logger.error(`Failed to connect to MongoDB: ${err.message}`);
                    process.exit(1);
                }

                Logger.info('Established connection with MongoDB service');
                // Now create/ensure that the indexes for publications and users exist...
                Logger.info('Verifying that search indexes exist...');

                await PublicationModel.createIndexes();
                await UserModel.createIndexes();
            },
        );
    });
}

//start our server
if (process.env.NODE_ENV !== 'test') {
    startServer();
}
