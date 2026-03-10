import { z } from 'zod';

// --- Create contract ---
// The Prisma Contract model is simple: reservationId + status + pdfUrl + signature.
// Additional driver/guarantor info lives on the User model or in the reservation extras.
export const createContractDto = z.object({
  reservationId: z.string().min(1),
});
export type CreateContractDto = z.infer<typeof createContractDto>;

// --- Sign contract ---
export const signContractDto = z.object({
  signatureBase64: z.string().min(10, 'Signature required'),
});
export type SignContractDto = z.infer<typeof signContractDto>;

// --- List filters ---
export const contractFiltersDto = z.object({
  status: z.enum(['DRAFT', 'SIGNED', 'COMPLETED']).optional(),
  clientId: z.string().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type ContractFiltersDto = z.infer<typeof contractFiltersDto>;
