import { NextFunction, Request, Response } from 'express';
import {v4 as uuidv4} from 'uuid';

export function attachCorrelationIdMiddleware(req: Request,_: Response,next: NextFunction){
    // Generating a unique Correlation Id
    const correlationId=uuidv4();

    // Attaching it to request header
    req.headers['Correlation-Id']=correlationId;

    // calling next middleware or router handler
    next();
}