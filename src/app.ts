import cors from 'cors';
import helmet from 'helmet';
import express from 'express';
import fileUpload from 'express-fileupload';

// Import relevant modules to Swagger UI
import Swagger from 'swagger-jsdoc';
import SwaggerUI from 'swagger-ui-express';

import Logger from './common/logger';
import * as errors from './common/errors';
import manifest from './../package.json';
import * as SwaggerOptions from '../swagger.json';

// Routers
import userRouter from './routes/user';
import authRouter from './routes/auth';
import ssoRouter from './routes/auth/sso';
import reviewsRouter from './routes/reviews';
import resourcesRouter from './routes/resources';
import publicationsRouter from './routes/publications';
import morganMiddleware from './config/morganMiddleware';

// Create the express application
const app = express();

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
app.use(cors());
app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File uploads
app.use(fileUpload());

// app.use((_req: express.Request, res: express.Response, next: express.NextFunction) => {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', '*');
//     res.header('Access-Control-Allow-Methods', 'POST, PUT, GET, OPTIONS, DELETE, PATCH');

//     next();
// });

app.get('/version', (_req: express.Request, res: express.Response) => {
    res.status(200).json({
        status: true,
        version: {
            app: manifest.version,
        },
    });
});

// Setup the specific API routes
app.use('/sg', ssoRouter); // TODO(alex): we'll probably need to setup a proxy so that the SuperGroup can access all endpoints not just login
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/review', reviewsRouter);
app.use('/resource', resourcesRouter);
app.use('/publication', publicationsRouter);

app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
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
            status: "error",
            message: errors.BAD_REQUEST,
        });
    }

    // Check if there is a general error, and if so return a 500 since all other errors should
    // be handled by the routes.
    if (err) {
        Logger.error(err);

        return res.status(500).json({
            status: "error",
            message: errors.INTERNAL_SERVER_ERROR,
        })
    }

    next();
    return;
});

// catch 404 and forward to error handler
app.use((_req: express.Request, res: express.Response) => {
    res.status(404).send({
        status: "error",
        message: errors.RESOURCE_NOT_FOUND
    });
});

export default app;
