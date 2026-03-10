import { Router } from 'express';
import { ReservationController } from './controller.js';
import { validate } from '../../middleware/validation.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { createReservationDto, reservationFiltersDto, updateReservationStatusDto } from './dto.js';

const router = Router();
const ctrl = new ReservationController();

// Create reservation (authenticated or guest)
router.post('/', validate(createReservationDto), ctrl.create);

// Client: my reservations
router.get('/my', authenticate, ctrl.getMyReservations);

// Admin: list all
router.get('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'AGENT'), validate(reservationFiltersDto, 'query'), ctrl.list);

// Detail
router.get('/:id', authenticate, ctrl.getById);

// Admin: change status
router.put('/:id/status', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'AGENT'), validate(updateReservationStatusDto), ctrl.updateStatus);

// Cancel (client or admin)
router.put('/:id/cancel', authenticate, ctrl.cancel);

export default router;
