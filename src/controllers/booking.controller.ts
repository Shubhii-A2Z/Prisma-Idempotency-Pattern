import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import { createBookingService } from "../services/booking.service";

export async function createBookingHandler(req: Request,resp: Response){
    const booking=await createBookingService(req.body);
    return resp.status(StatusCodes.CREATED).json({
        bookingId: booking.bookingId,
        idempotencyKey: booking.idempotencyKey
    })
}