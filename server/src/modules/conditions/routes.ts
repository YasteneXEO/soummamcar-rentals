import { Router } from 'express';
import multer from 'multer';
import { ConditionController } from './controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';
import { createConditionReportDto, conditionFiltersDto } from './dto.js';

const router = Router();
const controller = new ConditionController();

// Multer for photo uploads (max 10 photos per report)
const upload = multer({
  storage: multer.memoryStorage(), // TODO: Switch to S3 storage
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// All routes require authentication + admin/agent role
router.use(authenticate);

router.get('/', authorize('ADMIN', 'AGENT'), validate(conditionFiltersDto, 'query'), controller.list.bind(controller));
router.get('/compare/:reservationId', authorize('ADMIN', 'AGENT'), controller.compare.bind(controller));
router.get('/:id', controller.getById.bind(controller));

router.post(
  '/',
  authorize('ADMIN', 'AGENT'),
  upload.array('photos', 10),
  validate(createConditionReportDto),
  controller.create.bind(controller),
);

router.patch(
  '/:id',
  authorize('ADMIN', 'AGENT'),
  upload.array('photos', 10),
  controller.update.bind(controller),
);

export default router;
