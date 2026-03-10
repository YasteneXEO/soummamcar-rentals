import { z } from 'zod';

export const createReservationDto = z.object({
  vehicleId: z.string().min(1),
  pickupDate: z.string().datetime(),
  returnDate: z.string().datetime(),
  pickupTime: z.string().regex(/^\d{2}:\d{2}$/),
  returnTime: z.string().regex(/^\d{2}:\d{2}$/),
  pickupLocationId: z.string().optional(),
  returnLocationId: z.string().optional(),
  isDiaspora: z.boolean().default(false),
  flightNumber: z.string().optional(),
  arrivalTime: z.string().optional(),
  extras: z.array(z.object({
    key: z.string(),
    label: z.string(),
    pricePerDay: z.number(),
    flatFee: z.number().optional(),
    quantity: z.number().int().min(1),
  })).optional(),
  specialRequests: z.string().optional(),
  currency: z.enum(['DZD', 'EUR', 'CAD', 'GBP']).default('DZD'),

  // Client info (for unauthenticated bookings)
  fullName: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  email: z.string().email().optional(),
  idNumber: z.string().optional(),
  licenseNumber: z.string().optional(),
});

export const reservationFiltersDto = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  clientId: z.string().optional(),
  partnerId: z.string().optional(),
  ownerType: z.enum(['OWN_FLEET', 'AGENCY', 'INDIVIDUAL']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const updateReservationStatusDto = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED']),
  cancelledBy: z.string().optional(),
  cancellationReason: z.string().optional(),
});

export type CreateReservationDto = z.infer<typeof createReservationDto>;
export type ReservationFiltersDto = z.infer<typeof reservationFiltersDto>;
