import prisma from '../../config/database.js';
import { env } from '../../config/env.js';
import { generateReferenceNumber, calculateRentalDays } from '../../utils/helpers.js';
import type { CreateReservationDto, ReservationFiltersDto } from './dto.js';
import logger from '../../utils/logger.js';

export class ReservationService {
  /**
   * Create a reservation with server-side pricing & marketplace commission calculation.
   */
  async create(data: CreateReservationDto, clientId?: string) {
    // Fetch vehicle with partner info
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
      include: { partner: true },
    });
    if (!vehicle) throw Object.assign(new Error('Vehicle not found'), { status: 404 });
    if (vehicle.status !== 'AVAILABLE') {
      throw Object.assign(new Error('Vehicle is not available'), { status: 400 });
    }
    if (!vehicle.isPublished) {
      throw Object.assign(new Error('Vehicle is not published'), { status: 400 });
    }

    // Check availability for the requested dates
    const conflicts = await prisma.reservation.count({
      where: {
        vehicleId: data.vehicleId,
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
        pickupDate: { lte: new Date(data.returnDate) },
        returnDate: { gte: new Date(data.pickupDate) },
      },
    });
    if (conflicts > 0) {
      throw Object.assign(new Error('Vehicle not available for these dates'), { status: 409 });
    }

    // Server-side pricing
    const totalDays = calculateRentalDays(
      new Date(data.pickupDate),
      new Date(data.returnDate),
      data.pickupTime,
      data.returnTime,
    );
    const dailyRate = vehicle.dailyRate;
    let subtotal = dailyRate * totalDays;

    // Apply discounts
    let discountAmount = 0;
    if (totalDays >= 30 && vehicle.monthlyDiscount) {
      discountAmount = Math.round(subtotal * (vehicle.monthlyDiscount / 100));
    } else if (totalDays >= 7 && vehicle.weeklyDiscount) {
      discountAmount = Math.round(subtotal * (vehicle.weeklyDiscount / 100));
    }
    subtotal -= discountAmount;

    // Calculate extras total
    let extrasTotal = 0;
    if (data.extras && data.extras.length > 0) {
      for (const extra of data.extras) {
        extrasTotal += (extra.pricePerDay * totalDays + (extra.flatFee || 0)) * extra.quantity;
      }
    }

    const depositAmount = Math.round(subtotal * 0.25);
    const cautionAmount = vehicle.cautionAmount;
    const totalClient = subtotal + extrasTotal;

    // Marketplace commission
    let platformFee = 0;
    let partnerPayout = 0;
    const ownerType = vehicle.ownerType;
    const partnerId = vehicle.partnerId;

    if (ownerType !== 'OWN_FLEET' && vehicle.partner) {
      const commissionRate = vehicle.partner.commissionRate;
      platformFee = Math.round(subtotal * commissionRate);
      partnerPayout = subtotal - platformFee;
    }

    // Exchange rate for diaspora
    let exchangeRate: number | undefined;
    if (data.isDiaspora && data.currency !== 'DZD') {
      exchangeRate = await this.fetchExchangeRate(data.currency);
    }

    // Generate unique reference number
    let referenceNumber: string;
    let attempts = 0;
    do {
      referenceNumber = generateReferenceNumber();
      const existing = await prisma.reservation.findUnique({ where: { referenceNumber } });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    const reservation = await prisma.reservation.create({
      data: {
        referenceNumber,
        clientId: clientId || '',
        vehicleId: data.vehicleId,
        ownerType,
        partnerId,
        pickupDate: new Date(data.pickupDate),
        returnDate: new Date(data.returnDate),
        pickupTime: data.pickupTime,
        returnTime: data.returnTime,
        pickupLocationId: data.pickupLocationId,
        returnLocationId: data.returnLocationId,
        status: 'PENDING',
        isDiaspora: data.isDiaspora,
        flightNumber: data.flightNumber,
        arrivalTime: data.arrivalTime,
        dailyRate,
        totalDays,
        subtotal,
        extrasTotal,
        discountAmount,
        depositAmount,
        cautionAmount,
        platformFee,
        partnerPayout,
        totalClient,
        extras: data.extras as any,
        specialRequests: data.specialRequests,
        currency: data.currency,
        exchangeRate,
      },
      include: { vehicle: true },
    });

    // Update vehicle probation counter if applicable
    if (vehicle.verificationStatus === 'PROBATION') {
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: { probationRentalsCompleted: { increment: 1 } },
      });
    }

    logger.info(`Reservation created: ${referenceNumber} for vehicle ${vehicle.name} (${ownerType})`);
    return reservation;
  }

  async list(filters: ReservationFiltersDto) {
    const where: Record<string, any> = {};
    if (filters.status) where.status = filters.status;
    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.partnerId) where.partnerId = filters.partnerId;
    if (filters.ownerType) where.ownerType = filters.ownerType;
    if (filters.from || filters.to) {
      where.pickupDate = {};
      if (filters.from) where.pickupDate.gte = new Date(filters.from);
      if (filters.to) where.pickupDate.lte = new Date(filters.to);
    }

    const [data, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        include: {
          vehicle: true,
          client: { select: { id: true, fullName: true, phone: true, email: true } },
          partner: { select: { id: true, displayName: true, type: true } },
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.reservation.count({ where }),
    ]);

    return { data, total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / filters.limit) };
  }

  async getMyReservations(clientId: string) {
    return prisma.reservation.findMany({
      where: { clientId },
      include: { vehicle: true, payments: true, contract: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        vehicle: true,
        client: { select: { id: true, fullName: true, phone: true, email: true, isDiaspora: true } },
        partner: { select: { id: true, displayName: true, type: true, commissionRate: true } },
        payments: true,
        contract: true,
        conditionReports: true,
        review: true,
      },
    });
    if (!reservation) throw Object.assign(new Error('Reservation not found'), { status: 404 });
    return reservation;
  }

  async updateStatus(id: string, status: string, cancelledBy?: string, cancellationReason?: string) {
    const updateData: Record<string, any> = { status };
    if (cancelledBy) updateData.cancelledBy = cancelledBy;
    if (cancellationReason) updateData.cancellationReason = cancellationReason;

    const reservation = await prisma.reservation.update({
      where: { id },
      data: updateData,
      include: { vehicle: true },
    });

    // Vehicle status side effects
    if (status === 'IN_PROGRESS') {
      await prisma.vehicle.update({
        where: { id: reservation.vehicleId },
        data: { status: 'RENTED' },
      });
    }
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      await prisma.vehicle.update({
        where: { id: reservation.vehicleId },
        data: { status: 'AVAILABLE' },
      });
    }

    // If completed and has partner payout, the payout job will handle it
    return reservation;
  }

  async cancel(id: string, userId: string, isAdmin: boolean) {
    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) throw Object.assign(new Error('Reservation not found'), { status: 404 });

    if (!isAdmin && reservation.clientId !== userId) {
      throw Object.assign(new Error('Forbidden'), { status: 403 });
    }
    if (['COMPLETED', 'CANCELLED'].includes(reservation.status)) {
      throw Object.assign(new Error('Cannot cancel a completed/cancelled reservation'), { status: 400 });
    }

    return this.updateStatus(id, 'CANCELLED', userId, 'User cancelled');
  }

  private async fetchExchangeRate(currency: string): Promise<number> {
    try {
      // Try to get from DB first
      const stored = await prisma.exchangeRate.findUnique({
        where: { fromCurrency_toCurrency: { fromCurrency: currency, toCurrency: 'DZD' } },
      });
      if (stored) return stored.rate;

      const url = `${env.EXCHANGE_RATE_API_URL}?from=EUR&to=DZD`;
      const res = await fetch(url);
      const data = await res.json() as { rates: Record<string, number> };
      return data.rates?.DZD || 150;
    } catch {
      logger.warn('Failed to fetch exchange rate, using fallback');
      return 150;
    }
  }
}
