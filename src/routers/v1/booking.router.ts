import express from 'express';

import { validateRequestBody } from '../../validators';
import { createBookingSchema } from '../../validators/booking.validator';
import { createBookingHandler } from '../../controllers/booking.controller';

const bookingRouter=express.Router();

bookingRouter.post('/',validateRequestBody(createBookingSchema),createBookingHandler);

export default bookingRouter;