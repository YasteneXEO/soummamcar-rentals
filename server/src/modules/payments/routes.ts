import { Router } from 'express';
import { PaymentController } from './controller.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validation.js';
import { initiateCibDto, initiateStripeDto, confirmCashDto, confirmTransferDto, refundDto } from './dto.js';

const router = Router();
const controller = new PaymentController();

// Public — payment gateway callbacks
router.post('/callback/cib', controller.cibCallback.bind(controller));
router.post('/webhook/stripe', controller.stripeWebhook.bind(controller));

// Authenticated — initiate payments
router.post('/cib', authenticate, validate(initiateCibDto), controller.initiateCib.bind(controller));
router.post('/stripe', authenticate, validate(initiateStripeDto), controller.initiateStripe.bind(controller));

// Admin — manual confirmations and refunds
router.post('/cash', authenticate, authorize('ADMIN', 'AGENT'), validate(confirmCashDto), controller.confirmCash.bind(controller));
router.post('/transfer', authenticate, authorize('ADMIN', 'AGENT'), validate(confirmTransferDto), controller.confirmTransfer.bind(controller));
router.post('/:id/refund', authenticate, authorize('ADMIN', 'AGENT'), validate(refundDto), controller.refund.bind(controller));

// List payments for a reservation
router.get('/reservation/:reservationId', authenticate, controller.listByReservation.bind(controller));

export default router;
