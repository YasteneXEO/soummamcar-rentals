import prisma from '../../config/database.js';
import logger from '../../utils/logger.js';
import type { ProcessPayoutDto, CreatePayoutDto, PayoutFiltersDto } from './dto.js';

export class PayoutService {
  /**
   * Generate pending payouts for completed reservations.
   * Called by cron job — 48h after confirmed return.
   * Groups reservations by partner into weekly payout batches.
   */
  async generatePendingPayouts() {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48h ago
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Find completed reservations with a partner payout that haven't been paid out
    const reservations = await prisma.reservation.findMany({
      where: {
        status: 'COMPLETED',
        partnerId: { not: null },
        partnerPayout: { gt: 0 },
        updatedAt: { lt: cutoff },
      },
    });

    // Group by partner
    const byPartner = new Map<string, typeof reservations>();
    for (const res of reservations) {
      if (!res.partnerId) continue;
      const list = byPartner.get(res.partnerId) || [];
      list.push(res);
      byPartner.set(res.partnerId, list);
    }

    let created = 0;
    for (const [partnerId, partnerReservations] of byPartner) {
      const reservationIds = partnerReservations.map((r) => r.id);

      // Check if a payout already includes any of these reservations
      const existingPayouts = await prisma.payout.findMany({
        where: { partnerId },
        select: { reservationIds: true },
      });
      const alreadyPaidIds = new Set(existingPayouts.flatMap((p) => p.reservationIds));
      const unpaidReservations = partnerReservations.filter((r) => !alreadyPaidIds.has(r.id));
      if (unpaidReservations.length === 0) continue;

      const totalAmount = unpaidReservations.reduce((sum, r) => sum + (r.partnerPayout || 0), 0);

      await prisma.payout.create({
        data: {
          partnerId,
          amount: totalAmount,
          currency: unpaidReservations[0].currency,
          status: 'PENDING',
          periodStart: weekAgo,
          periodEnd: now,
          reservationIds: unpaidReservations.map((r) => r.id),
        },
      });
      created++;
    }

    if (created > 0) {
      logger.info(`Generated ${created} pending payouts`);
    }
    return { created };
  }

  /**
   * List payouts (admin or partner filtered).
   */
  async list(filters: PayoutFiltersDto) {
    const where: Record<string, any> = {};
    if (filters.partnerId) where.partnerId = filters.partnerId;
    if (filters.status) where.status = filters.status;

    const [data, total] = await Promise.all([
      prisma.payout.findMany({
        where,
        include: {
          partner: { select: { displayName: true, bankName: true, bankRib: true } },
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payout.count({ where }),
    ]);

    return { data, total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / filters.limit) };
  }

  /**
   * Admin: mark a payout as processing.
   */
  async markProcessing(payoutId: string) {
    return prisma.payout.update({
      where: { id: payoutId },
      data: { status: 'PROCESSING' },
    });
  }

  /**
   * Admin: mark a payout as paid.
   */
  async markPaid(payoutId: string, data: ProcessPayoutDto) {
    const payout = await prisma.payout.update({
      where: { id: payoutId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
        reference: data.reference,
        notes: data.notes,
      },
    });

    // Update partner total revenue
    await prisma.partner.update({
      where: { id: payout.partnerId },
      data: { totalRevenue: { increment: payout.amount } },
    });

    logger.info(`Payout ${payoutId} marked as PAID (amount: ${payout.amount} ${payout.currency})`);
    return payout;
  }

  /**
   * Admin: mark a payout as failed.
   */
  async markFailed(payoutId: string, notes?: string) {
    return prisma.payout.update({
      where: { id: payoutId },
      data: { status: 'FAILED', notes },
    });
  }

  /**
   * Admin: create a manual payout (bonus, adjustment, etc.).
   */
  async createManual(data: CreatePayoutDto) {
    const partner = await prisma.partner.findUnique({ where: { id: data.partnerId } });
    if (!partner) throw Object.assign(new Error('Partner not found'), { status: 404 });

    const now = new Date();
    return prisma.payout.create({
      data: {
        partnerId: data.partnerId,
        amount: data.amount,
        currency: data.currency,
        status: 'PENDING',
        notes: data.notes,
        periodStart: now,
        periodEnd: now,
        reservationIds: [],
      },
    });
  }

  /**
   * Get payout summary for a partner.
   */
  async getPartnerSummary(partnerId: string) {
    const [pending, processing, paid, failed] = await Promise.all([
      prisma.payout.aggregate({ where: { partnerId, status: 'PENDING' }, _sum: { amount: true }, _count: true }),
      prisma.payout.aggregate({ where: { partnerId, status: 'PROCESSING' }, _sum: { amount: true }, _count: true }),
      prisma.payout.aggregate({ where: { partnerId, status: 'PAID' }, _sum: { amount: true }, _count: true }),
      prisma.payout.aggregate({ where: { partnerId, status: 'FAILED' }, _sum: { amount: true }, _count: true }),
    ]);

    return {
      pending: { amount: pending._sum.amount || 0, count: pending._count },
      processing: { amount: processing._sum.amount || 0, count: processing._count },
      paid: { amount: paid._sum.amount || 0, count: paid._count },
      failed: { amount: failed._sum.amount || 0, count: failed._count },
    };
  }
}
