require('dotenv').config(); // Import our environment variables

import helmet from "helmet";
import mongoose from 'mongoose';
import { createServer } from 'http';
import { AddressInfo } from 'net';
import express, { Application } from "express";

// Import relevant modules to Swagger UI
import Swagger from "swagger-jsdoc";
import SwaggerUI from "swagger-ui-express";


import Logger from "./common/logger";
import userRouter from './routes/user';
import reviewsRouter from './routes/reviews';
import submissionsRouter from './routes/submissions';
import morganMiddleware from './config/morganMiddleware';
import * as SwaggerOptions from "./../swagger.json";

// Create the express application
const app: Application = express();

// Add swagger to the Express app
const options = {
  definition: SwaggerOptions,
  apis: ['./routes/user.ts', './routes/reviews.ts', './routes/submissions.ts'],
};

const specs = Swagger(options);

app.use(
  "/docs",
  SwaggerUI.serve,
  SwaggerUI.setup(specs)
);

// Setup express middleware
app.use(helmet());
app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup the specific API routes
app.use("/user", userRouter);
app.use("/submissions", submissionsRouter);
app.use("/reviews", reviewsRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).send({
    status: false
  });
});

//initialize a simple http server
const server = createServer(app);

//start our server
server.listen(process.env.PORT || 5000, () => {
  const port = (server.address() as AddressInfo).port;

  Logger.info(`Server started on ${port}! (environment: ${process.env.NODE_ENV || "dev"})`);
  Logger.info("Attempting connection with MongoDB service");

  mongoose.connect(process.env.MONGODB_CONNECTION_URI!, {
    connectTimeoutMS: 30000,
  }, (err: any) => {
    if (err) {
      Logger.error(`Failed to connect to MongoDB: ${err.message}`);
      process.exit(1);
    }

    Logger.info('Established connection with MongoDB service');
  });
});
