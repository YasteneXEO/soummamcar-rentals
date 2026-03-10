import prisma from '../../config/database.js';
import { env } from '../../config/env.js';
import { generateReferenceNumber, calculateRentalDays } from '../../utils/helpers.js';
import type { CreateReservationDto, ReservationFiltersDto } from './dto.js';
import logger from '../../utils/logger.js';

export class ReservationService {
  /**
   * Create a reservation with server-side pricing calculation.
   */
  async create(data: CreateReservationDto, userId?: string) {
    // Fetch vehicle to get pricing
    const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
    if (!vehicle) throw Object.assign(new Error('Vehicle not found'), { status: 404 });
    if (vehicle.status !== 'AVAILABLE') {
      throw Object.assign(new Error('Vehicle is not available'), { status: 400 });
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
      data.returnTime
    );
    const dailyRate = vehicle.dailyRate;
    const subtotal = dailyRate * totalDays;
    const depositAmount = Math.round(subtotal * 0.25);
    const cautionAmount = vehicle.cautionAmount;

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
        userId: userId || '',  // TODO: handle guest bookings
        vehicleId: data.vehicleId,
        pickupDate: new Date(data.pickupDate),
        returnDate: new Date(data.returnDate),
        pickupTime: data.pickupTime,
        returnTime: data.returnTime,
        pickupLocation: data.pickupLocation,
        returnLocation: data.returnLocation,
        status: 'PENDING',
        isDiaspora: data.isDiaspora,
        flightNumber: data.flightNumber,
        dailyRate,
        totalDays,
        subtotal,
        depositAmount,
        cautionAmount,
        extras: data.extras as any,
        specialRequests: data.specialRequests,
        currency: data.currency,
        exchangeRate,
      },
      include: { vehicle: true },
    });

    logger.info(`Reservation created: ${referenceNumber} for vehicle ${vehicle.name}`);
    return reservation;
  }

  async list(filters: ReservationFiltersDto) {
    const where: Record<string, any> = {};
    if (filters.status) where.status = filters.status;
    if (filters.userId) where.userId = filters.userId;
    if (filters.from || filters.to) {
      where.pickupDate = {};
      if (filters.from) where.pickupDate.gte = new Date(filters.from);
      if (filters.to) where.pickupDate.lte = new Date(filters.to);
    }

    const [data, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        include: { vehicle: true, user: { select: { id: true, fullName: true, phone: true, email: true } } },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.reservation.count({ where }),
    ]);

    return { data, total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / filters.limit) };
  }

  async getMyReservations(userId: string) {
    return prisma.reservation.findMany({
      where: { userId },
      include: { vehicle: true, payments: true, contract: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        vehicle: true,
        user: { select: { id: true, fullName: true, phone: true, email: true, isDiaspora: true } },
        payments: true,
        contract: true,
        conditionReports: true,
      },
    });
    if (!reservation) throw Object.assign(new Error('Reservation not found'), { status: 404 });
    return reservation;
  }

  async updateStatus(id: string, status: string) {
    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status: status as any },
      include: { vehicle: true },
    });

    // If confirmed → mark vehicle as RENTED when IN_PROGRESS
    if (status === 'IN_PROGRESS') {
      await prisma.vehicle.update({
        where: { id: reservation.vehicleId },
        data: { status: 'RENTED' },
      });
    }
    // If completed or cancelled → mark vehicle as AVAILABLE
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      await prisma.vehicle.update({
        where: { id: reservation.vehicleId },
        data: { status: 'AVAILABLE' },
      });
    }

    return reservation;
  }

  async cancel(id: string, userId: string, isAdmin: boolean) {
    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) throw Object.assign(new Error('Reservation not found'), { status: 404 });

    if (!isAdmin && reservation.userId !== userId) {
      throw Object.assign(new Error('Forbidden'), { status: 403 });
    }
    if (['COMPLETED', 'CANCELLED'].includes(reservation.status)) {
      throw Object.assign(new Error('Cannot cancel a completed/cancelled reservation'), { status: 400 });
    }

    return this.updateStatus(id, 'CANCELLED');
  }

  private async fetchExchangeRate(currency: string): Promise<number> {
    try {
      const url = `${env.EXCHANGE_RATE_API_URL}?from=EUR&to=DZD`;
      const res = await fetch(url);
      const data = await res.json() as { rates: Record<string, number> };
      // We get EUR → DZD rate, then we convert from target currency to DZD
      // Simplified: assume EUR base for now
      return data.rates?.DZD || 150; // fallback
    } catch {
      logger.warn('Failed to fetch exchange rate, using fallback');
      return 150; // fallback EUR→DZD
    }
  }
}
