import { z } from 'zod';

// --- Create condition report (état des lieux) ---
// Matches Prisma ConditionReport model: reservationId, ReportType (PICKUP/RETURN),
// kmReading, FuelLevel enum, damageNotes, photos (JSON), gps, signature.
export const createConditionReportDto = z.object({
  reservationId: z.string().min(1),
  type: z.enum(['PICKUP', 'RETURN']),
  kmReading: z.number().int().min(0),
  fuelLevel: z.enum(['QUARTER', 'HALF', 'THREE_QUARTER', 'FULL']),
  damageNotes: z.string().optional(),
  gpsLatitude: z.number().optional(),
  gpsLongitude: z.number().optional(),
  signature: z.string().optional(), // base64 or URL
});
export type CreateConditionReportDto = z.infer<typeof createConditionReportDto>;

// --- Update condition report ---
export const updateConditionReportDto = createConditionReportDto
  .partial()
  .omit({ reservationId: true, type: true });
export type UpdateConditionReportDto = z.infer<typeof updateConditionReportDto>;

// --- List filters ---
export const conditionFiltersDto = z.object({
  reservationId: z.string().min(1).optional(),
  type: z.enum(['PICKUP', 'RETURN']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ConditionFiltersDto = z.infer<typeof conditionFiltersDto>;
