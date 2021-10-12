require('dotenv').config(); // Import our environment variables

import morgan from 'morgan';
import helmet from "helmet";
import mongoose from 'mongoose';
import express, { Application, Request, Response } from "express";

import logger from "./logFormatter";
import userRouter from './routes/user';
import reviewsRouter from './routes/reviews';
import submissionsRouter from './routes/submissions';
import { createServer } from 'http';
import { AddressInfo } from 'net';

// Create the express application
const app: Application = express();

// Use helmet
app.use(helmet());

// Use morgan if we're on development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));  // Logging for network requests
}

// Body parsing Middleware
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
server.listen(process.env.PORT || 3000, () => {
  const port = (server.address() as AddressInfo).port;

  logger.info(`Server started on ${port}! (environment: ${process.env.NODE_ENV || "dev"})`);
  logger.info("Attempting connection with MongoDB service");

  mongoose.connect(process.env.MONGODB_CONNECTION_URI!, {
    connectTimeoutMS: 30000,
  }, (err: any) => {
    if (err) {
      logger.error(`Failed to connect to MongoDB: ${err.message}`);
      process.exit(1);
    }

    logger.info('Established connection with MongoDB service');
  });
});
