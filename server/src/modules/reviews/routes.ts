import { Router } from 'express';
import { ReviewController } from './controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';
import { createReviewDto, respondToReviewDto, moderateReviewDto } from './dto.js';

const router = Router();
const controller = new ReviewController();

// ── Public ───────────────────────────────────────────────
router.get('/', controller.list);

// ── Client ───────────────────────────────────────────────
router.post('/', authenticate, authorize('CLIENT'), validate(createReviewDto), controller.create);

// ── Partner ──────────────────────────────────────────────
router.post('/:id/respond', authenticate, authorize('PARTNER'), validate(respondToReviewDto), controller.respond);

// ── Admin ────────────────────────────────────────────────
router.get('/all', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), controller.listAll);
router.put('/:id/moderate', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(moderateReviewDto), controller.moderate);

export default router;
