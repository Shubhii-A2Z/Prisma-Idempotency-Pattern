import express from 'express';

import serverConfig from './config/server.config';
import v1Router from './routers/v1';
import logger from './config/logger.config';
import { attachCorrelationIdMiddleware } from './middlewares/correlationId.middleware';
import { genericErrorHandler } from './middlewares/error.middleware';

const app=express();

app.use(attachCorrelationIdMiddleware);

app.use(express.json());
app.use('/',v1Router);

/**
 * Adding the error handler middleware: this will replace the default error handler middlware
 */
app.use(genericErrorHandler);

app.listen(serverConfig.PORT,()=>{
    console.log(`Server started at PORT: ${serverConfig.PORT}`);
    logger.info('Server Started',{success: true}); // Logging with Metadata
});