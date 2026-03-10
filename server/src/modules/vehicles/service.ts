import prisma from '../../config/database.js';
import type { CreateVehicleDto, UpdateVehicleDto, VehicleFiltersDto } from './dto.js';

export class VehicleService {
  async list(filters: VehicleFiltersDto) {
    const where: Record<string, any> = {};

    if (filters.category) where.category = filters.category;
    if (filters.transmission) where.transmission = filters.transmission;
    if (filters.seats) where.seats = { gte: filters.seats };
    if (filters.available !== undefined) {
      where.status = filters.available ? 'AVAILABLE' : { not: 'AVAILABLE' };
    }
    if (filters.priceMin || filters.priceMax) {
      where.dailyRate = {};
      if (filters.priceMin) where.dailyRate.gte = filters.priceMin;
      if (filters.priceMax) where.dailyRate.lte = filters.priceMax;
    }

    const [data, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { dailyRate: 'asc' },
      }),
      prisma.vehicle.count({ where }),
    ]);

    return {
      data,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }

  async getById(id: string) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw Object.assign(new Error('Vehicle not found'), { status: 404 });
    return vehicle;
  }

  async checkAvailability(vehicleId: string, from: Date, to: Date) {
    const conflicts = await prisma.reservation.findMany({
      where: {
        vehicleId,
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
        OR: [
          { pickupDate: { lte: to }, returnDate: { gte: from } },
        ],
      },
      select: { pickupDate: true, returnDate: true, referenceNumber: true },
    });
    return { available: conflicts.length === 0, conflicts };
  }

  async create(data: CreateVehicleDto) {
    return prisma.vehicle.create({ data: data as any });
  }

  async update(id: string, data: UpdateVehicleDto) {
    return prisma.vehicle.update({ where: { id }, data: data as any });
  }

  async delete(id: string) {
    // Check for active reservations
    const active = await prisma.reservation.count({
      where: { vehicleId: id, status: { in: ['CONFIRMED', 'IN_PROGRESS'] } },
    });
    if (active > 0) {
      throw Object.assign(new Error('Cannot delete vehicle with active reservations'), { status: 400 });
    }
    return prisma.vehicle.delete({ where: { id } });
  }

  async getAlerts() {
    const now = new Date();
    const in30Days = new Date(Date.now() + 30 * 24 * 3600_000);

    const vehicles = await prisma.vehicle.findMany({
      where: {
        OR: [
          { insuranceExpiry: { lte: in30Days } },
          { ctExpiry: { lte: in30Days } },
          { vignetteExpiry: { lte: in30Days } },
        ],
      },
      orderBy: { insuranceExpiry: 'asc' },
    });

    return vehicles.map((v: any) => ({
      vehicle: v,
      alerts: [
        v.insuranceExpiry <= now && { type: 'insurance', status: 'expired' },
        v.insuranceExpiry <= in30Days && v.insuranceExpiry > now && { type: 'insurance', status: 'expiring_soon' },
        v.ctExpiry <= now && { type: 'ct', status: 'expired' },
        v.ctExpiry <= in30Days && v.ctExpiry > now && { type: 'ct', status: 'expiring_soon' },
        v.vignetteExpiry <= now && { type: 'vignette', status: 'expired' },
        v.vignetteExpiry <= in30Days && v.vignetteExpiry > now && { type: 'vignette', status: 'expiring_soon' },
      ].filter(Boolean),
    }));
  }
}
