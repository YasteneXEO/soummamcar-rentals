import { z } from 'zod';

// ── Advance a verification step ──────────────────────────
export const advanceStepDto = z.object({
  status: z.enum(['PASSED', 'FAILED', 'SKIPPED']),
  notes: z.string().optional(),
  data: z.record(z.any()).optional(),
});
export type AdvanceStepDto = z.infer<typeof advanceStepDto>;

// ── Score a vehicle (admin reviews step) ─────────────────
export const scoreVehicleDto = z.object({
  score: z.number().min(0).max(100),
  notes: z.string().optional(),
});
export type ScoreVehicleDto = z.infer<typeof scoreVehicleDto>;

// ── Record an inspection ─────────────────────────────────
export const recordInspectionDto = z.object({
  vehicleId: z.string(),
  type: z.enum(['INITIAL', 'REINSPECTION', 'VIDEO']),
  date: z.string().datetime(),
  location: z.string().optional(),
  checklistResults: z.record(z.any()),
  totalScore: z.number().int().min(0).max(28),
  photos: z.array(z.string()).default([]),
  videoUrl: z.string().url().optional(),
  result: z.enum(['APPROVED', 'APPROVED_WITH_RESERVES', 'REJECTED']),
  reserves: z.array(z.string()).default([]),
  notes: z.string().optional(),
});
export type RecordInspectionDto = z.infer<typeof recordInspectionDto>;

// ── Admin: override verification status ──────────────────
export const overrideVerificationDto = z.object({
  status: z.enum([
    'SUBMITTED',
    'DOCS_REVIEW',
    'PHOTOS_REVIEW',
    'SCORED',
    'INSPECTION_SCHEDULED',
    'APPROVED',
    'PROBATION',
    'FULLY_VERIFIED',
    'REJECTED',
    'SUSPENDED',
  ]),
  reason: z.string().optional(),
});
export type OverrideVerificationDto = z.infer<typeof overrideVerificationDto>;

// ── List vehicles pending verification ───────────────────
export const verificationFiltersDto = z.object({
  status: z.enum([
    'SUBMITTED', 'DOCS_REVIEW', 'PHOTOS_REVIEW', 'SCORED',
    'INSPECTION_SCHEDULED', 'APPROVED', 'PROBATION',
    'FULLY_VERIFIED', 'REJECTED', 'SUSPENDED',
  ]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type VerificationFiltersDto = z.infer<typeof verificationFiltersDto>;
