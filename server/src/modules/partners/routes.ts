import { Router } from 'express';
import { PartnerController } from './controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';
import {
  registerPartnerDto,
  updatePartnerDto,
  adminUpdatePartnerDto,
  submitVehicleDto,
} from './dto.js';

const router = Router();
const controller = new PartnerController();

// ── Public ───────────────────────────────────────────────
router.post('/register', validate(registerPartnerDto), controller.register);

// ── Partner (self) ───────────────────────────────────────
router.get('/me', authenticate, authorize('PARTNER'), controller.getMyProfile);
router.put('/me', authenticate, authorize('PARTNER'), validate(updatePartnerDto), controller.updateMyProfile);
router.get('/me/dashboard', authenticate, authorize('PARTNER'), controller.getDashboard);
router.get('/me/vehicles', authenticate, authorize('PARTNER'), controller.getMyVehicles);
router.post('/me/vehicles', authenticate, authorize('PARTNER'), validate(submitVehicleDto), controller.submitVehicle);
router.get('/me/reservations', authenticate, authorize('PARTNER'), controller.getMyReservations);
router.get('/me/payouts', authenticate, authorize('PARTNER'), controller.getMyPayouts);

// ── Admin ────────────────────────────────────────────────
router.get('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), controller.list);
router.get('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), controller.getById);
router.put('/:id/admin', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(adminUpdatePartnerDto), controller.adminUpdate);

export default router;
