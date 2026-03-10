import { z } from 'zod';

// ── Process a payout (admin marks as paid) ───────────────
export const processPayoutDto = z.object({
  reference: z.string().min(1).max(100).optional(),
  notes: z.string().optional(),
});
export type ProcessPayoutDto = z.infer<typeof processPayoutDto>;

// ── Admin: create a manual payout ────────────────────────
export const createPayoutDto = z.object({
  partnerId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default('DZD'),
  notes: z.string().optional(),
});
export type CreatePayoutDto = z.infer<typeof createPayoutDto>;

// ── Filters ──────────────────────────────────────────────
export const payoutFiltersDto = z.object({
  partnerId: z.string().uuid().optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'PAID', 'FAILED']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PayoutFiltersDto = z.infer<typeof payoutFiltersDto>;
