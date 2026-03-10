import prisma from '../../config/database.js';
import logger from '../../utils/logger.js';
import type { InitiateCibDto, InitiateStripeDto, ConfirmCashDto } from './dto.js';

export class PaymentService {
  /**
   * Initiate CIB/Edahabia payment via SATIM gateway.
   * Returns a redirect URL for the client to complete payment.
   */
  async initiateCib(data: InitiateCibDto) {
    const reservation = await prisma.reservation.findUnique({ where: { id: data.reservationId } });
    if (!reservation) throw Object.assign(new Error('Reservation not found'), { status: 404 });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        reservationId: data.reservationId,
        type: data.type,
        amount: data.amount,
        currency: 'DZD',
        method: 'CIB',
        status: 'PENDING',
      },
    });

    // TODO: Call SATIM API to initiate payment and get redirect URL
    // For now, return a placeholder
    logger.info(`CIB payment initiated: ${payment.id} for ${data.amount} DZD`);

    return {
      paymentId: payment.id,
      redirectUrl: `https://epay.satim.dz/payment?orderId=${payment.id}`, // placeholder
    };
  }

  /**
   * Initiate Stripe payment for diaspora clients.
   */
  async initiateStripe(data: InitiateStripeDto) {
    const reservation = await prisma.reservation.findUnique({ where: { id: data.reservationId } });
    if (!reservation) throw Object.assign(new Error('Reservation not found'), { status: 404 });

    const payment = await prisma.payment.create({
      data: {
        reservationId: data.reservationId,
        type: data.type,
        amount: data.amount,
        currency: data.currency,
        method: 'STRIPE',
        status: 'PENDING',
      },
    });

    // TODO: Create Stripe Checkout session
    // const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    // const session = await stripe.checkout.sessions.create({ ... });
    logger.info(`Stripe payment initiated: ${payment.id} for ${data.amount} ${data.currency}`);

    return {
      paymentId: payment.id,
      checkoutUrl: `https://checkout.stripe.com/placeholder/${payment.id}`, // placeholder
    };
  }

  /**
   * Confirm cash payment (admin action).
   */
  async confirmCash(data: ConfirmCashDto) {
    const payment = await prisma.payment.create({
      data: {
        reservationId: data.reservationId,
        type: data.type,
        amount: data.amount,
        currency: 'DZD',
        method: 'CASH',
        status: 'PAID',
        paidAt: new Date(),
        notes: data.notes,
      },
    });

    logger.info(`Cash payment confirmed: ${payment.id} for ${data.amount} DZD`);
    return payment;
  }

  /**
   * Confirm bank transfer (admin action).
   */
  async confirmTransfer(data: any) {
    const payment = await prisma.payment.create({
      data: {
        reservationId: data.reservationId,
        type: data.type,
        amount: data.amount,
        currency: 'DZD',
        method: 'BANK_TRANSFER',
        status: 'PAID',
        paidAt: new Date(),
        transactionId: data.transactionId,
        notes: data.notes,
      },
    });

    logger.info(`Transfer payment confirmed: ${payment.id}`);
    return payment;
  }

  /**
   * Refund a payment (full or partial).
   */
  async refund(paymentId: string, amount?: number, reason?: string) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw Object.assign(new Error('Payment not found'), { status: 404 });
    if (payment.status !== 'PAID') {
      throw Object.assign(new Error('Can only refund paid payments'), { status: 400 });
    }

    const refundAmount = amount || payment.amount;
    const isPartial = refundAmount < payment.amount;

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: isPartial ? 'PARTIALLY_RETAINED' : 'REFUNDED',
        refundedAt: new Date(),
        retainedAmount: isPartial ? payment.amount - refundAmount : undefined,
        retainedReason: reason,
      },
    });

    logger.info(`Payment ${paymentId} refunded: ${refundAmount} DZD`);
    return updated;
  }

  /**
   * List payments for a reservation.
   */
  async listByReservation(reservationId: string) {
    return prisma.payment.findMany({
      where: { reservationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Handle SATIM callback after CIB/Edahabia payment.
   */
  async handleCibCallback(body: any) {
    // TODO: Verify SATIM signature, update payment status
    logger.info('CIB callback received', body);
    return { message: 'Callback processed' };
  }

  /**
   * Handle Stripe webhook.
   */
  async handleStripeWebhook(body: any, signature: string) {
    // TODO: Verify Stripe signature, update payment status
    logger.info('Stripe webhook received');
    return { message: 'Webhook processed' };
  }
}
