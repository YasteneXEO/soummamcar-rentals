import { Router } from 'express';
import { VehicleController } from './controller.js';
import { validate } from '../../middleware/validation.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { createVehicleDto, updateVehicleDto, vehicleFiltersDto } from './dto.js';

const router = Router();
const ctrl = new VehicleController();

// Public
router.get('/', validate(vehicleFiltersDto, 'query'), ctrl.list);
router.get('/alerts', authenticate, authorize('ADMIN', 'AGENT'), ctrl.getAlerts);
router.get('/:id', ctrl.getById);
router.get('/:id/availability', ctrl.checkAvailability);

// Admin only
router.post('/', authenticate, authorize('ADMIN'), validate(createVehicleDto), ctrl.create);
router.put('/:id', authenticate, authorize('ADMIN'), validate(updateVehicleDto), ctrl.update);
router.delete('/:id', authenticate, authorize('ADMIN'), ctrl.delete);

export default router;
