import prisma from '../config/database.js';
import logger from '../utils/logger.js';
import { PayoutService } from '../modules/payouts/service.js';
import { VerificationService } from '../modules/verification/service.js';

const payoutService = new PayoutService();
const verificationService = new VerificationService();

/**
 * Generate pending payouts for completed reservations (48h after return).
 * Runs every 6 hours.
 */
export async function jobPayoutPartners() {
  try {
    const result = await payoutService.generatePendingPayouts();
    if (result.created > 0) {
      logger.info(`[CRON] payoutPartners: generated ${result.created} payouts`);
    }
  } catch (err) {
    logger.error('[CRON] payoutPartners failed:', err);
  }
}

/**
 * Monthly rescoring of vehicles based on recent reviews and condition reports.
 * Runs on the 1st of each month.
 */
export async function jobMonthlyRescoring() {
  try {
    // Get vehicles with partner that are verified
    const vehicles = await prisma.vehicle.findMany({
      where: {
        verificationStatus: { in: ['APPROVED', 'PROBATION', 'FULLY_VERIFIED'] },
        partnerId: { not: null },
      },
      include: {
        reservations: {
          where: { review: { isNot: null } },
          include: { review: { select: { overallRating: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    let updated = 0;
    for (const vehicle of vehicles) {
      const ratings = vehicle.reservations
        .map((r) => r.review?.overallRating)
        .filter((r): r is number => r !== null && r !== undefined);
      if (ratings.length === 0) continue;

      const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
      const newScore = Math.round(avgRating * 20);
      if (vehicle.verificationScore !== newScore) {
        await prisma.vehicle.update({
          where: { id: vehicle.id },
          data: { verificationScore: newScore },
        });
        updated++;
      }
    }

    logger.info(`[CRON] monthlyRescoring: updated ${updated} vehicle scores`);
  } catch (err) {
    logger.error('[CRON] monthlyRescoring failed:', err);
  }
}

/**
 * Auto-suspend partners with avg rating < 3.0 on last 5 reviews.
 * Runs daily.
 */
export async function jobAutoSuspendLowRating() {
  try {
    const partners = await prisma.partner.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, displayName: true },
    });

    let suspended = 0;
    for (const partner of partners) {
      const lastFive = await prisma.review.findMany({
        where: { partnerId: partner.id, isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { overallRating: true },
      });

      if (lastFive.length < 5) continue;

      const avg = lastFive.reduce((sum: number, r) => sum + r.overallRating, 0) / 5;
      if (avg < 3.0) {
        await prisma.partner.update({ where: { id: partner.id }, data: { status: 'SUSPENDED' } });
        logger.warn(`[CRON] Auto-suspended partner ${partner.displayName} (avg: ${avg.toFixed(2)})`);
        suspended++;
      }
    }

    logger.info(`[CRON] autoSuspendLowRating: suspended ${suspended} partners`);
  } catch (err) {
    logger.error('[CRON] autoSuspendLowRating failed:', err);
  }
}

/**
 * Check vehicles due for 6-month reinspection.
 * Runs weekly.
 */
export async function jobReinspectionReminder() {
  try {
    const vehicles = await verificationService.listDueForReinspection();

    for (const vehicle of vehicles) {
      // Create a notification for admins
      const admins = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
        select: { id: true },
      });
      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'REINSPECTION_DUE',
            title: `Reinspection due: ${vehicle.name}`,
            body: `Vehicle ${vehicle.plateNumber} (${vehicle.partner?.displayName}) is due for reinspection.`,
            link: `/admin/verification/${vehicle.id}`,
          },
        });
      }
    }

    logger.info(`[CRON] reinspectionReminder: ${vehicles.length} vehicles due`);
  } catch (err) {
    logger.error('[CRON] reinspectionReminder failed:', err);
  }
}

/**
 * Check and flag vehicles with expiring documents (insurance, CT, vignette).
 * Runs daily.
 */
export async function jobExpireDocuments() {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const today = new Date();

    // Find vehicles with expired or soon-to-expire documents
    const expiring = await prisma.vehicle.findMany({
      where: {
        status: { not: 'UNAVAILABLE' },
        OR: [
          { insuranceExpiry: { lt: thirtyDaysFromNow } },
          { ctExpiry: { lt: thirtyDaysFromNow } },
          { vignetteExpiry: { lt: thirtyDaysFromNow } },
        ],
      },
      include: { partner: { select: { displayName: true, userId: true } } },
    });

    let flagged = 0;
    for (const vehicle of expiring) {
      // If any document is already expired, mark vehicle as unavailable
      const isExpired =
        vehicle.insuranceExpiry < today || vehicle.ctExpiry < today || vehicle.vignetteExpiry < today;

      if (isExpired && vehicle.status !== 'UNAVAILABLE') {
        await prisma.vehicle.update({
          where: { id: vehicle.id },
          data: { status: 'UNAVAILABLE', isPublished: false },
        });
        flagged++;
      }
    }

    logger.info(`[CRON] expireDocuments: ${flagged} vehicles flagged, ${expiring.length} approaching expiry`);
  } catch (err) {
    logger.error('[CRON] expireDocuments failed:', err);
  }
}

/**
 * Refresh exchange rates from external API (or keep existing if API fails).
 * Runs daily.
 */
export async function jobRefreshExchangeRates() {
  try {
    // For now, maintain a simple EUR/DZD and USD/DZD rate
    // In production, use an external API like exchangerate-api.com
    const rates = [
      { fromCurrency: 'EUR', toCurrency: 'DZD', rate: 146.5 },
      { fromCurrency: 'USD', toCurrency: 'DZD', rate: 135.0 },
      { fromCurrency: 'GBP', toCurrency: 'DZD', rate: 171.0 },
      { fromCurrency: 'CAD', toCurrency: 'DZD', rate: 99.0 },
    ];

    for (const rate of rates) {
      await prisma.exchangeRate.upsert({
        where: {
          fromCurrency_toCurrency: {
            fromCurrency: rate.fromCurrency,
            toCurrency: rate.toCurrency,
          },
        },
        update: { rate: rate.rate },
        create: rate,
      });
    }

    logger.info(`[CRON] refreshExchangeRates: updated ${rates.length} rates`);
  } catch (err) {
    logger.error('[CRON] refreshExchangeRates failed:', err);
  }
}

/**
 * Start all scheduled cron jobs using setInterval.
 * (For production, consider node-cron or a dedicated scheduler.)
 */
export function initCronJobs() {
  const HOUR = 60 * 60 * 1000;
  const DAY = 24 * HOUR;

  // Payouts: every 6 hours
  setInterval(jobPayoutPartners, 6 * HOUR);

  // Auto-suspend low rating: daily
  setInterval(jobAutoSuspendLowRating, DAY);

  // Expire documents: daily
  setInterval(jobExpireDocuments, DAY);

  // Reinspection reminders: weekly
  setInterval(jobReinspectionReminder, 7 * DAY);

  // Exchange rates: daily
  setInterval(jobRefreshExchangeRates, DAY);

  // Monthly rescoring: check daily, runs only on 1st
  setInterval(async () => {
    if (new Date().getDate() === 1) {
      await jobMonthlyRescoring();
    }
  }, DAY);

  // Run some jobs immediately on startup
  setTimeout(() => {
    jobPayoutPartners();
    jobExpireDocuments();
    jobRefreshExchangeRates();
  }, 10000); // 10s after startup

  logger.info('[CRON] All scheduled jobs initialized');
}
