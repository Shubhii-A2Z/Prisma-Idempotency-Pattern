
// (Data Transfer Object): This defines what data the API accepts or returns

export type CreateBookingDTO={
    userId: number,
    hotelId: number,
    bookingAmount: number
}