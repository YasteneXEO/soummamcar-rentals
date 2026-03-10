import { z } from 'zod';

export const createVehicleDto = z.object({
  name: z.string().min(2).max(100),
  plateNumber: z.string().min(3).max(20),
  brand: z.string().min(1).max(50),
  model: z.string().min(1).max(50),
  year: z.number().int().min(2000).max(2030),
  images: z.array(z.string().url()).min(1),
  dailyRate: z.number().int().positive(),
  cautionAmount: z.number().int().positive(),
  currentKm: z.number().int().min(0),
  nextServiceKm: z.number().int().min(0),
  fuelType: z.enum(['ESSENCE', 'DIESEL', 'GPL']),
  transmission: z.enum(['MANUAL', 'AUTOMATIC']),
  seats: z.number().int().min(2).max(9),
  hasAC: z.boolean().default(true),
  category: z.enum(['ECONOMY', 'COMPACT', 'SEDAN', 'SUV', 'PREMIUM']),
  kmPolicy: z.enum(['UNLIMITED', 'LIMITED']).default('UNLIMITED'),
  kmLimit: z.number().int().positive().optional(),
  insuranceExpiry: z.string().datetime(),
  ctExpiry: z.string().datetime(),
  vignetteExpiry: z.string().datetime(),
  registrationDoc: z.string().optional(),
});

export const updateVehicleDto = createVehicleDto.partial();

export const vehicleFiltersDto = z.object({
  category: z.enum(['ECONOMY', 'COMPACT', 'SEDAN', 'SUV', 'PREMIUM']).optional(),
  transmission: z.enum(['MANUAL', 'AUTOMATIC']).optional(),
  priceMin: z.coerce.number().int().min(0).optional(),
  priceMax: z.coerce.number().int().optional(),
  seats: z.coerce.number().int().min(2).optional(),
  available: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateVehicleDto = z.infer<typeof createVehicleDto>;
export type UpdateVehicleDto = z.infer<typeof updateVehicleDto>;
export type VehicleFiltersDto = z.infer<typeof vehicleFiltersDto>;
