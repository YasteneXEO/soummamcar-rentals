import type { Request, Response, NextFunction } from 'express';
import { PaymentService } from './service.js';

const service = new PaymentService();

export class PaymentController {
  /** POST /payments/cib */
  async initiateCib(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.initiateCib(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /** POST /payments/stripe */
  async initiateStripe(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.initiateStripe(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /** POST /payments/cash */
  async confirmCash(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await service.confirmCash(req.body);
      res.status(201).json(payment);
    } catch (error) {
      next(error);
    }
  }

  /** POST /payments/transfer */
  async confirmTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await service.confirmTransfer(req.body);
      res.status(201).json(payment);
    } catch (error) {
      next(error);
    }
  }

  /** POST /payments/:id/refund */
  async refund(req: Request, res: Response, next: NextFunction) {
    try {
      const { amount, reason } = req.body;
      const payment = await service.refund(req.params.id as string, amount, reason);
      res.json(payment);
    } catch (error) {
      next(error);
    }
  }

  /** GET /payments/reservation/:reservationId */
  async listByReservation(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await service.listByReservation(req.params.reservationId as string);
      res.json(payments);
    } catch (error) {
      next(error);
    }
  }

  /** POST /payments/callback/cib — SATIM callback */
  async cibCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.handleCibCallback(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /** POST /payments/webhook/stripe — Stripe webhook */
  async stripeWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const result = await service.handleStripeWebhook(req.body, signature);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
