import { Prisma } from "@prisma/client";
import { prismaClient } from "../prisma/client";

export async function createBooking(bookingInput: Prisma.BookingCreateInput){
    const booking = await prismaClient.booking.create({
        data: bookingInput
    });
    return booking;
}

export async function createIdempotencyKey(key: string,bookingId: number) {
    const idempotencyKey=await prismaClient.idempotencyKey.create({
        data: {
            key,
            booking: {
                connect: {
                    id: bookingId
                }
            }
        }
    });

    return idempotencyKey;
}

export async function getIdempotencyKey(key:string,tx: Prisma.TransactionClient) {
    const idempotencyKey=await tx.idempotencyKey.findUnique({
        where: {
            key
        }
    });

    return  idempotencyKey;
}

export async function finalizeIdempotencyKey(key:string,tx: Prisma.TransactionClient) {
    const idempotencyKey=await tx.idempotencyKey.update({
        where: {
            key
        },
        data: {
           completed: true 
        }
    });

    return  idempotencyKey;
}

export async function getBookingById(bookingId: number) {
    const booking=await prismaClient.booking.findUnique({
        where: {
            id: bookingId
        }
    });
    
    return booking;
}

export async function confirmBooking(bookingId: number,tx: Prisma.TransactionClient) {
    const booking=await tx.booking.update({
        where: {
            id: bookingId
        },
        data: {
            status: "CONFIRMED"
        }
    });
    
    return booking;
}