import { CreateBookingDTO } from "../dto/booking.dto";
import { prismaClient } from "../prisma/client";
import { confirmBooking, createBooking, createIdempotencyKey, finalizeIdempotencyKey, getIdempotencyKey } from "../repositories/booking.repo";
import generateIdempotencyKey from "../utils/generateIdempotencyKey";

export async function createBookingService(createBookingDTO: CreateBookingDTO) {
    const booking=await createBooking({
        userId: createBookingDTO.userId,
        hotelId: createBookingDTO.hotelId,
        bookingAmount: createBookingDTO.bookingAmount
    });

    // Generating unique idempotency key for this booking
    const idempotencyKey=generateIdempotencyKey();

    // Storing this key corresponding to booking id inside db
    await createIdempotencyKey(idempotencyKey,booking.id);

    return {
        bookingId: booking.id,
        idempotencyKey: idempotencyKey
    };
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