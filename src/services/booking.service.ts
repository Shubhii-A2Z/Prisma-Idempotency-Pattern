import { CreateBookingDTO } from "../dto/booking.dto";
import { confirmBooking, createBooking, createIdempotencyKey, finalizeIdempotencyKey, getIdempotencyKey } from "../repositories/booking.repo";
import generateIdempotencyKey from "../utils/generateIdempotencyKey";

export async function createBookingService(createBookingDTO: CreateBookingDTO) {
    const booking=await createBooking({
        userId: createBookingDTO.userId,
        hotelId: createBookingDTO.hotelId,
        bookingAmount: createBookingDTO.bookingAmount
    });

    const idempotencyKey=generateIdempotencyKey();

    await createIdempotencyKey(idempotencyKey,booking.id);

    return {
        bookingId: booking.id,
        idempotencyKey: idempotencyKey
    };
}

export async function finalizeBookingService(idempotencyKey: string) {
    const idempotencyKeyData=await getIdempotencyKey(idempotencyKey);

    if(!idempotencyKeyData){
        throw new Error('Idempotency key not found');
    }
    if(idempotencyKeyData.completed){
        throw new Error('Booking already finalized');
    }
    
    const booking=await confirmBooking(idempotencyKeyData.id);
    await finalizeIdempotencyKey(idempotencyKey);

    return booking;
}