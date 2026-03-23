import logger from "../config/logger.config";
import serverConfig from "../config/server.config";
import { CreateBookingDTO } from "../dto/booking.dto";
import { prismaClient } from "../prisma/client";
import { confirmBooking, createBooking, createIdempotencyKey, finalizeIdempotencyKey, getIdempotencyKey } from "../repositories/booking.repo";
import { InternalServerError, UnauthorizedAccess } from "../utils/errors/app.error";
import generateIdempotencyKey from "../utils/generateIdempotencyKey";
import { acquireLock } from "../utils/redlock.redis";

export async function createBookingService(createBookingDTO: CreateBookingDTO) {
    const ttl=serverConfig.LOCK_TTL; // Lock expiry time (in milliseconds)
    const resource=`hotel:${createBookingDTO.hotelId}`;

    try {
        await acquireLock([resource],ttl); 

        // Critical section - perform operations that require the lock
        const booking=await createBooking({
            userId: createBookingDTO.userId,
            hotelId: createBookingDTO.hotelId,
            bookingAmount: createBookingDTO.bookingAmount
        });

        // Generating unique idempotency key for this booking
        const idempotencyKey=generateIdempotencyKey();

        // Storing this key corresponding to booking id inside db
        await createIdempotencyKey(idempotencyKey,booking.id);

        // await releaseLock(lock);

        return {
            bookingId: booking.id,
            idempotencyKey: idempotencyKey
        };
    } catch (error) {
        logger.error('Failed to acquire lock',{success: false});
        throw new InternalServerError('Failed to acquire lock');
    }

}

export async function confirmBookingService(idempotencyKey: string) {
    return await prismaClient.$transaction(async (tx)=>{

        // Fetching the idempotency key
        const idempotencyKeyData=await getIdempotencyKey(idempotencyKey,tx);

        if(!idempotencyKeyData){  // No such key found, invalid request
            logger.error('Invalid Key',{success: false});
            throw new UnauthorizedAccess('Idempotency key not found');
        }
        if(idempotencyKeyData.completed){ // Booking already completed
            logger.error('Booking Completed',{success: false});
            throw new InternalServerError('Booking already finalized');
        }
        
        // Confirming the booking
        const booking=await confirmBooking(idempotencyKeyData.bookingId,tx);
        await finalizeIdempotencyKey(idempotencyKey,tx);

        return booking;

    });
}