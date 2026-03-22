import serverConfig from "../config/server.config";
import { CreateBookingDTO } from "../dto/booking.dto";
import { prismaClient } from "../prisma/client";
import { confirmBooking, createBooking, createIdempotencyKey, finalizeIdempotencyKey, getIdempotencyKey } from "../repositories/booking.repo";
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
        console.log(error);
        throw new Error('Failed to acquire lock');
    }

}

export async function confirmBookingService(idempotencyKey: string) {
    return await prismaClient.$transaction(async (tx)=>{

        // Fetching the idempotency key
        const idempotencyKeyData=await getIdempotencyKey(idempotencyKey,tx);

        if(!idempotencyKeyData){  // No such key found, invalid request
            throw new Error('Idempotency key not found');
        }
        if(idempotencyKeyData.completed){ // Booking already completed
            throw new Error('Booking already finalized');
        }
        
        // Confirming the booking
        const booking=await confirmBooking(idempotencyKeyData.bookingId,tx);
        await finalizeIdempotencyKey(idempotencyKey,tx);

        return booking;

    });
}