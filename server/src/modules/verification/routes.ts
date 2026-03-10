import { Router } from 'express';
import { VerificationController } from './controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';
import { advanceStepDto, scoreVehicleDto, recordInspectionDto, overrideVerificationDto } from './dto.js';

const router = Router();
const controller = new VerificationController();

// All verification routes require admin/super_admin
const adminAuth = [authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'AGENT')];

// ── Verification queue ───────────────────────────────────
router.get('/queue', ...adminAuth, controller.listPending);
router.get('/reinspection-due', ...adminAuth, controller.listDueForReinspection);

// ── Vehicle-level verification ───────────────────────────
router.get('/:vehicleId', ...adminAuth, controller.getVehicleVerification);
router.post('/:vehicleId/steps/:stepNumber', ...adminAuth, validate(advanceStepDto), controller.advanceStep);
router.post('/:vehicleId/score', ...adminAuth, validate(scoreVehicleDto), controller.scoreVehicle);
router.put('/:vehicleId/override', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(overrideVerificationDto), controller.overrideVerification);

// ── Inspections ──────────────────────────────────────────
router.post('/inspections', ...adminAuth, validate(recordInspectionDto), controller.recordInspection);

export default router;
