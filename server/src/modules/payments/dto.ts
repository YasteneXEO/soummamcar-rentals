import { z } from 'zod';

export const initiateCibDto = z.object({
  reservationId: z.string().min(1),
  type: z.enum(['DEPOSIT', 'BALANCE', 'CAUTION']),
  amount: z.number().int().positive(),
});

export const initiateStripeDto = z.object({
  reservationId: z.string().min(1),
  type: z.enum(['DEPOSIT', 'BALANCE', 'CAUTION']),
  amount: z.number().int().positive(),
  currency: z.enum(['EUR', 'CAD', 'GBP']).default('EUR'),
});

export const confirmCashDto = z.object({
  reservationId: z.string().min(1),
  type: z.enum(['DEPOSIT', 'BALANCE', 'CAUTION']),
  amount: z.number().int().positive(),
  notes: z.string().optional(),
});

export const confirmTransferDto = z.object({
  reservationId: z.string().min(1),
  type: z.enum(['DEPOSIT', 'BALANCE', 'CAUTION']),
  amount: z.number().int().positive(),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

export const refundDto = z.object({
  amount: z.number().int().positive().optional(), // partial refund
  reason: z.string().optional(),
});

export type InitiateCibDto = z.infer<typeof initiateCibDto>;
export type InitiateStripeDto = z.infer<typeof initiateStripeDto>;
export type ConfirmCashDto = z.infer<typeof confirmCashDto>;
