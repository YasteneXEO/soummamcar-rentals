import { Router } from 'express';
import { ContractController } from './controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';
import { createContractDto, signContractDto, contractFiltersDto } from './dto.js';

const router = Router();
const controller = new ContractController();

// All routes require authentication
router.use(authenticate);

router.get('/', authorize('ADMIN', 'AGENT'), validate(contractFiltersDto, 'query'), controller.list.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.get('/:id/pdf', controller.downloadPdf.bind(controller));

router.post('/', authorize('ADMIN', 'AGENT'), validate(createContractDto), controller.create.bind(controller));
router.post('/:id/sign', validate(signContractDto), controller.sign.bind(controller));

router.patch('/:id/complete', authorize('ADMIN', 'AGENT'), controller.complete.bind(controller));
router.patch('/:id/cancel', authorize('ADMIN', 'AGENT'), controller.cancel.bind(controller));

export default router;
