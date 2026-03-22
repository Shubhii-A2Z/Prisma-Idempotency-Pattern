import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { confirmBookingService, createBookingService } from "../services/booking.service";
import logger from "../config/logger.config";

export async function createBookingHandler(req: Request,resp: Response){
    const booking=await createBookingService(req.body);
    if(!booking){
        return resp.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            data: {},
        });
    }
    return resp.status(StatusCodes.CREATED).json({
        bookingId: booking.bookingId,
        idempotencyKey: booking.idempotencyKey
    })
}

export async function confirmBookingHandler(req: Request,resp: Response){
    const key=req.params.idempotencyKey;

    if(!key || typeof(key)!=='string'){
        logger.error('Invalid Request',{success: false});
        throw new Error('Invalid Idempotency Key');
    }

    const booking=await confirmBookingService(key);
    return resp.status(StatusCodes.OK).json({
        bookingId: booking.id,
        status: booking.status,
    });
}