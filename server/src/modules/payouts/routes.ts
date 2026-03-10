import { Router } from 'express';
import { PayoutController } from './controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';
import { processPayoutDto, createPayoutDto } from './dto.js';

const router = Router();
const controller = new PayoutController();

// ── Partner ──────────────────────────────────────────────
router.get('/me/summary', authenticate, authorize('PARTNER'), controller.partnerSummary);

// ── Admin ────────────────────────────────────────────────
router.get('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), controller.list);
router.post('/generate', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), controller.generatePending);
router.post('/manual', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(createPayoutDto), controller.createManual);
router.put('/:id/processing', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), controller.markProcessing);
router.put('/:id/paid', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(processPayoutDto), controller.markPaid);
router.put('/:id/failed', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), controller.markFailed);
router.get('/:partnerId/summary', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), controller.partnerSummary);

export default router;
