require('dotenv').config(); // Import our environment variables

import helmet from 'helmet';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import express, { Application } from 'express';

// Import relevant modules to Swagger UI
import Swagger from 'swagger-jsdoc';
import SwaggerUI from 'swagger-ui-express';

import Logger from './common/logger';
import * as errors from './common/errors';
import * as SwaggerOptions from './../swagger.json';

// Routers
import userRouter from './routes/user';
import authRouter from './routes/auth';
import ssoRouter from './routes/auth/sso';
import reviewsRouter from './routes/reviews';
import publicationsRouter from './routes/publications';
import morganMiddleware from './config/morganMiddleware';

// Create the express application
const app: Application = express();

// Add swagger to the Express app
const options = {
    definition: SwaggerOptions,
    apis: [
        './routes/user/index.ts',
        './routes/auth/index.ts',
        './routes/auth/sso.ts',
        './routes/reviews/index.ts',
        './routes/publications/index.ts',
    ],
};

const specs = Swagger(options);

app.use('/docs', SwaggerUI.serve, SwaggerUI.setup(specs));

// Setup express middleware
app.use(helmet({}));
app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Methods', 'POST, PUT, GET, OPTIONS, DELETE, PATCH');

    next();
});

// Setup the specific API routes
app.use('/sg', ssoRouter); // TODO(alex): we'll probably need to setup a proxy so that the SuperGroup can access all endpoints not just login
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/publication', publicationsRouter);
app.use('/reviews', reviewsRouter);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    // This check makes sure this is a JSON parsing issue, but it might be
    // coming from any middleware, not just body-parser:

    if (
        errors.isExpressError(err) &&
        err instanceof SyntaxError &&
        err.status === 400 &&
        'body' in err
    ) {
        Logger.warn('received invalid JSON body.');

        // Bad request
        return res.status(400).json({
            status: false,
            message: errors.BAD_REQUEST,
        });
    }

    next();
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
    res.status(404).send({
        status: false,
    });
});

//initialize a simple http server
const server = createServer(app);

//start our server
server.listen(process.env.PORT || 5000, () => {
    const port = (server.address() as AddressInfo).port;

    Logger.info(`Server started on ${port}! (environment: ${process.env.NODE_ENV || 'dev'})`);
    Logger.info('Attempting connection with MongoDB service');

    // TODO(alex): Try to load the current federations configuration from disk, but if we don't
    //             have it, then we make a request to the supergroup info endpoint at:
    //             --> https://gbs3.host.cs.st-andrews.ac.uk/cs3099-journals.json

    mongoose.connect(
        process.env.MONGODB_CONNECTION_URI!,
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
