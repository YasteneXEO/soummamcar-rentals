import { z } from 'zod';

// ─── Register as partner ──────────────────────────────────────
export const registerPartnerDto = z.object({
  // User fields
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  password: z.string().min(8),
  fullName: z.string().min(2).max(100),
  // Partner fields
  type: z.enum(['AGENCY', 'INDIVIDUAL']),
  displayName: z.string().min(2).max(100),
  description: z.string().optional(),
  whatsapp: z.string().optional(),
  wilaya: z.string().min(2),
  city: z.string().min(2),
  address: z.string().optional(),
  // Agency-specific
  registreCommerce: z.string().optional(),
  nif: z.string().optional(),
  nis: z.string().optional(),
  // Individual-specific (max 3 vehicles)
  idCardUrl: z.string().optional(),
  // Finance
  bankName: z.string().optional(),
  bankRib: z.string().optional(),
});

// ─── Update partner profile ───────────────────────────────────
export const updatePartnerDto = z.object({
  displayName: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
  phone: z.string().min(10).max(20).optional(),
  whatsapp: z.string().optional(),
  wilaya: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  logo: z.string().optional(),
  registreCommerce: z.string().optional(),
  nif: z.string().optional(),
  nis: z.string().optional(),
  businessLicenseUrl: z.string().optional(),
  idCardUrl: z.string().optional(),
  bankName: z.string().optional(),
  bankRib: z.string().optional(),
});

// ─── Admin: update partner status / commission ────────────────
export const adminUpdatePartnerDto = z.object({
  status: z.enum(['PENDING_REVIEW', 'ACTIVE', 'SUSPENDED', 'REJECTED']).optional(),
  commissionRate: z.number().min(0).max(1).optional(),
  maxVehicles: z.number().int().min(1).optional(),
  isBoosted: z.boolean().optional(),
  boostExpiresAt: z.string().datetime().optional(),
});

// ─── Filters ──────────────────────────────────────────────────
export const partnerFiltersDto = z.object({
  type: z.enum(['AGENCY', 'INDIVIDUAL']).optional(),
  status: z.enum(['PENDING_REVIEW', 'ACTIVE', 'SUSPENDED', 'REJECTED']).optional(),
  wilaya: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// ─── Partner: submit vehicle ──────────────────────────────────
export const submitVehicleDto = z.object({
  name: z.string().min(2).max(100),
  plateNumber: z.string().min(3).max(20),
  brand: z.string().min(1).max(50),
  model: z.string().min(1).max(50),
  year: z.number().int().min(2000).max(2030),
  vin: z.string().optional(),
  color: z.string().optional(),
  images: z.array(z.string()).min(3, 'At least 3 photos required'),
  dailyRate: z.number().int().positive(),
  cautionAmount: z.number().int().positive(),
  weeklyDiscount: z.number().min(0).max(100).optional(),
  monthlyDiscount: z.number().min(0).max(100).optional(),
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
  extraKmRate: z.number().int().positive().optional(),
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

export type RegisterPartnerDto = z.infer<typeof registerPartnerDto>;
export type UpdatePartnerDto = z.infer<typeof updatePartnerDto>;
export type AdminUpdatePartnerDto = z.infer<typeof adminUpdatePartnerDto>;
export type PartnerFiltersDto = z.infer<typeof partnerFiltersDto>;
export type SubmitVehicleDto = z.infer<typeof submitVehicleDto>;
