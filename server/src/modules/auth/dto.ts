import { z } from 'zod';

export const registerDto = z.object({
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone number too short').max(20),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Name too short').max(100),
  isDiaspora: z.boolean().optional().default(false),
  country: z.string().optional(),
});

export const loginDto = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

export const refreshTokenDto = z.object({
  refreshToken: z.string().min(1),
});

export const forgotPasswordDto = z.object({
  email: z.string().email('Invalid email'),
});

export const resetPasswordDto = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateProfileDto = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().min(10).max(20).optional(),
  wilaya: z.string().optional(),
  country: z.string().optional(),
  isDiaspora: z.boolean().optional(),
  preferredLang: z.enum(['FR', 'EN', 'AR', 'TZ']).optional(),
  preferredCurrency: z.string().optional(),
  avatar: z.string().optional(),
});

export const updateClientProfileDto = z.object({
  idNumber: z.string().optional(),
  passportNumber: z.string().optional(),
  licenseNumber: z.string().optional(),
  licenseCountry: z.string().optional(),
});

export type RegisterDto = z.infer<typeof registerDto>;
export type LoginDto = z.infer<typeof loginDto>;
export type RefreshTokenDto = z.infer<typeof refreshTokenDto>;
export type UpdateProfileDto = z.infer<typeof updateProfileDto>;
export type UpdateClientProfileDto = z.infer<typeof updateClientProfileDto>;
