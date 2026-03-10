import { z } from 'zod';

// ── Create a review (client → vehicle/partner) ──────────
export const createReviewDto = z.object({
  reservationId: z.string(),
  vehicleRating: z.number().int().min(1).max(5),
  serviceRating: z.number().int().min(1).max(5),
  cleanlinessRating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000).optional(),
});
export type CreateReviewDto = z.infer<typeof createReviewDto>;

// ── Partner responds to a review ─────────────────────────
export const respondToReviewDto = z.object({
  response: z.string().min(5).max(500),
});
export type RespondToReviewDto = z.infer<typeof respondToReviewDto>;

// ── Admin: moderate a review ─────────────────────────────
export const moderateReviewDto = z.object({
  isPublished: z.boolean(),
});
export type ModerateReviewDto = z.infer<typeof moderateReviewDto>;

// ── Filters ──────────────────────────────────────────────
export const reviewFiltersDto = z.object({
  partnerId: z.string().optional(),
  authorId: z.string().optional(),
  minRating: z.coerce.number().int().min(1).max(5).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ReviewFiltersDto = z.infer<typeof reviewFiltersDto>;
