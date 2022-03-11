import cors from 'cors';
import path from 'path';
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
import sgSsoRouter from './routes/sg/sso';
import threadsRouter from './routes/threads';
import reviewsRouter from './routes/reviews';
import commentRouter from './routes/comment';
import activityRouter from "./routes/activity";
import searchRouter from './routes/search';
import sgUsersRouter from './routes/sg/users';
import resourcesRouter from './routes/resources';
import sgResourcesRouter from './routes/sg/resources';
import publicationsRouter from './routes/publications';
import morganMiddleware from './config/morganMiddleware';


// Create the express application
const app = express();

// File uploads
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, '..', 'tmp'),
    createParentPath: true,
    limits: {
        fileSize: 1024 * 1024 * 10,
    },
    limitHandler: (_, res) => {
        res.sendStatus(413).json({
            status: "error",
            message: "The file sent is too large; limit is 10MiB.",
            errors: {}
        })
    }
}));

// Setup express middleware
app.use(helmet());
app.use(cors());
app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add swagger to the Express app
const options = {
    definition: SwaggerOptions,
    apis: [
        './routes/user/index.ts',
        './routes/auth/index.ts',
        './routes/sg/sso.ts',
        './routes/sg/resources.ts',
        './routes/sg/users.ts',
        './routers/activity/index.ts',
        './routes/reviews/index.ts',
        './routes/search/index.ts',
        './routes/publications/index.ts',
        './routes/threads/index.ts',
        './routes/comment/index.ts',
    ],
};

const specs = Swagger(options);
app.use('(\/api)?/docs', SwaggerUI.serve, SwaggerUI.setup(specs));

app.get('(\/api)?/version', (_req: express.Request, res: express.Response) => {
    res.status(200).json({
        status: "ok",
        version: manifest.version,
    });
});

app.get('(\/api)?/openapi', (_req: express.Request, res: express.Response) => {
    res.status(200).json({
        status: "ok",
        schema: SwaggerOptions
    });
});

// Setup the specific API routes
app.use('(\/api)?/sg/sso', sgSsoRouter);
app.use('(\/api)?/sg/resources', sgResourcesRouter);
app.use('(\/api)?/sg/users', sgUsersRouter);
app.use('(\/api)?/auth', authRouter);
app.use('(\/api)?/activity', activityRouter);
app.use('(\/api)?/user', userRouter);
app.use('(\/api)?/review', reviewsRouter);
app.use('(\/api)?/search', searchRouter);
app.use('(\/api)?/resource', resourcesRouter);
app.use('(\/api)?/publication', publicationsRouter);
app.use('(\/api)?/thread', threadsRouter);
app.use('(\/api)?/comment', commentRouter);

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
