import { z } from 'zod';

export const createVehicleDto = z.object({
  name: z.string().min(2).max(100),
  plateNumber: z.string().min(3).max(20),
  brand: z.string().min(1).max(50),
  model: z.string().min(1).max(50),
  year: z.number().int().min(2000).max(2030),
  vin: z.string().optional(),
  color: z.string().optional(),
  images: z.array(z.string()).min(1),
  dailyRate: z.number().int().positive(),
  cautionAmount: z.number().int().positive(),
  weeklyDiscount: z.number().min(0).max(100).optional(),
  monthlyDiscount: z.number().min(0).max(100).optional(),
  extraKmRate: z.number().int().positive().optional(),
  currentKm: z.number().int().min(0),
  nextServiceKm: z.number().int().min(0),
  fuelType: z.enum(['ESSENCE', 'DIESEL', 'GPL']),
  transmission: z.enum(['MANUAL', 'AUTOMATIC']),
  seats: z.number().int().min(2).max(9),
  hasAC: z.boolean().default(true),
  features: z.array(z.string()).default([]),
  category: z.enum(['ECONOMY', 'COMPACT', 'SEDAN', 'SUV', 'PREMIUM']),
  kmPolicy: z.enum(['UNLIMITED', 'LIMITED']).default('UNLIMITED'),
  kmLimitPerDay: z.number().int().positive().optional(),
  ownerType: z.enum(['OWN_FLEET', 'AGENCY', 'INDIVIDUAL']).default('OWN_FLEET'),
  partnerId: z.string().optional(),
  wilaya: z.string().optional(),
  city: z.string().optional(),
  insuranceExpiry: z.string().datetime(),
  ctExpiry: z.string().datetime(),
  vignetteExpiry: z.string().datetime(),
  registrationDocUrl: z.string().optional(),
  insuranceUrl: z.string().optional(),
  ctUrl: z.string().optional(),
  custodyMode: z.enum(['PERMANENT', 'TEMPORARY']).optional(),
  custodyStartDate: z.string().datetime().optional(),
  custodyEndDate: z.string().datetime().optional(),
});

export const updateVehicleDto = createVehicleDto.partial();

export const vehicleFiltersDto = z.object({
  category: z.enum(['ECONOMY', 'COMPACT', 'SEDAN', 'SUV', 'PREMIUM']).optional(),
  transmission: z.enum(['MANUAL', 'AUTOMATIC']).optional(),
  priceMin: z.coerce.number().int().min(0).optional(),
  priceMax: z.coerce.number().int().optional(),
  seats: z.coerce.number().int().min(2).optional(),
  available: z.coerce.boolean().optional(),
  ownerType: z.enum(['OWN_FLEET', 'AGENCY', 'INDIVIDUAL']).optional(),
  wilaya: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateVehicleDto = z.infer<typeof createVehicleDto>;
export type UpdateVehicleDto = z.infer<typeof updateVehicleDto>;
export type VehicleFiltersDto = z.infer<typeof vehicleFiltersDto>;
