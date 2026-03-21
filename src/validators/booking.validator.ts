import {z} from 'zod';

export const createBookingSchema=z.object({
    userId: z.number({error: "UserId is mendatory"}),
    hotelId: z.number({error: "BookingId is mendatory"}),
    bookingAmount: z.number({error: "Booking Amount is mendatory"}).min(1,{error: "Booking amount should be greater than 1"}),
});