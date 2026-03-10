import { Router } from 'express';
import { VehicleController } from './controller.js';
import { validate } from '../../middleware/validation.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { createVehicleDto, updateVehicleDto, vehicleFiltersDto } from './dto.js';

const router = Router();
const ctrl = new VehicleController();

// Public
router.get('/', validate(vehicleFiltersDto, 'query'), ctrl.list);
router.get('/:id', ctrl.getById);
router.get('/:id/availability', ctrl.checkAvailability);

// Admin / Agent
router.get('/admin/all', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'AGENT'), validate(vehicleFiltersDto, 'query'), ctrl.listAll);
router.get('/admin/alerts', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'AGENT'), ctrl.getAlerts);
router.get('/partner/:partnerId', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'PARTNER'), validate(vehicleFiltersDto, 'query'), ctrl.listByPartner);

router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(createVehicleDto), ctrl.create);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), validate(updateVehicleDto), ctrl.update);
router.patch('/:id/publish', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), ctrl.publish);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), ctrl.delete);

export default router;
