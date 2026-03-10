import bcrypt from 'bcrypt';
import prisma from '../../config/database.js';
import { env } from '../../config/env.js';
import logger from '../../utils/logger.js';
import type {
  RegisterPartnerDto,
  UpdatePartnerDto,
  AdminUpdatePartnerDto,
  PartnerFiltersDto,
  SubmitVehicleDto,
} from './dto.js';

export class PartnerService {
  /**
   * Register a new partner (creates User + Partner in a transaction).
   */
  async register(data: RegisterPartnerDto) {
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { phone: data.phone }] },
    });
    if (existing) {
      throw Object.assign(new Error('Email or phone already registered'), { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);
    const commissionRate = data.type === 'AGENCY' ? 0.15 : 0.20;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          phone: data.phone,
          passwordHash,
          fullName: data.fullName,
          role: 'PARTNER',
        },
      });

      const partner = await tx.partner.create({
        data: {
          userId: user.id,
          type: data.type,
          status: 'PENDING_REVIEW',
          displayName: data.displayName,
          description: data.description,
          phone: data.phone,
          whatsapp: data.whatsapp,
          wilaya: data.wilaya,
          city: data.city,
          address: data.address,
          registreCommerce: data.registreCommerce,
          nif: data.nif,
          nis: data.nis,
          idCardUrl: data.idCardUrl,
          commissionRate,
          bankName: data.bankName,
          bankRib: data.bankRib,
          maxVehicles: data.type === 'AGENCY' ? 50 : 3,
        },
      });

      return { user, partner };
    });

    logger.info(`Partner registered: ${data.displayName} (${data.type})`);
    return { userId: result.user.id, partnerId: result.partner.id };
  }

  /**
   * Get partner profile by userId.
   */
  async getByUserId(userId: string) {
    const partner = await prisma.partner.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, email: true, fullName: true, status: true } },
        vehicles: { select: { id: true, name: true, status: true, verificationStatus: true, isPublished: true } },
      },
    });
    if (!partner) throw Object.assign(new Error('Partner not found'), { status: 404 });
    return partner;
  }

  /**
   * Get partner by ID.
   */
  async getById(id: string) {
    const partner = await prisma.partner.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, fullName: true, status: true } },
        vehicles: true,
        payouts: { take: 10, orderBy: { createdAt: 'desc' } },
        reviewsReceived: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!partner) throw Object.assign(new Error('Partner not found'), { status: 404 });
    return partner;
  }

  /**
   * List partners (admin).
   */
  async list(filters: PartnerFiltersDto) {
    const where: Record<string, any> = {};
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.wilaya) where.wilaya = filters.wilaya;

    const [data, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        include: { user: { select: { id: true, email: true, fullName: true } } },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.partner.count({ where }),
    ]);

    return { data, total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / filters.limit) };
  }

  /**
   * Partner: update own profile.
   */
  async updateProfile(partnerId: string, data: UpdatePartnerDto) {
    return prisma.partner.update({ where: { id: partnerId }, data });
  }

  /**
   * Admin: update partner status, commission, etc.
   */
  async adminUpdate(id: string, data: AdminUpdatePartnerDto) {
    const updateData: Record<string, any> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.commissionRate !== undefined) updateData.commissionRate = data.commissionRate;
    if (data.maxVehicles !== undefined) updateData.maxVehicles = data.maxVehicles;
    if (data.isBoosted !== undefined) updateData.isBoosted = data.isBoosted;
    if (data.boostExpiresAt !== undefined) updateData.boostExpiresAt = new Date(data.boostExpiresAt);

    const partner = await prisma.partner.update({ where: { id }, data: updateData });

    // Also suspend user account if partner is suspended/rejected
    if (data.status === 'SUSPENDED' || data.status === 'REJECTED') {
      await prisma.user.update({ where: { id: partner.userId }, data: { status: 'SUSPENDED' } });
    }
    if (data.status === 'ACTIVE') {
      await prisma.user.update({ where: { id: partner.userId }, data: { status: 'ACTIVE' } });
    }

    logger.info(`Partner ${id} updated by admin: ${JSON.stringify(data)}`);
    return partner;
  }

  /**
   * Partner: submit a vehicle for verification.
   */
  async submitVehicle(partnerId: string, data: SubmitVehicleDto) {
    const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
    if (!partner) throw Object.assign(new Error('Partner not found'), { status: 404 });
    if (partner.status !== 'ACTIVE') {
      throw Object.assign(new Error('Partner account is not active'), { status: 403 });
    }

    // Check vehicle limit
    const vehicleCount = await prisma.vehicle.count({ where: { partnerId } });
    if (vehicleCount >= partner.maxVehicles) {
      throw Object.assign(new Error(`Maximum ${partner.maxVehicles} vehicles reached`), { status: 400 });
    }

    const ownerType = partner.type === 'AGENCY' ? 'AGENCY' : 'INDIVIDUAL';

    const vehicle = await prisma.vehicle.create({
      data: {
        ...(data as any),
        partnerId,
        ownerType: ownerType as any,
        verificationStatus: 'SUBMITTED',
        isPublished: false,
        status: 'UNAVAILABLE',
        insuranceExpiry: new Date(data.insuranceExpiry),
        ctExpiry: new Date(data.ctExpiry),
        vignetteExpiry: new Date(data.vignetteExpiry),
        custodyStartDate: data.custodyStartDate ? new Date(data.custodyStartDate) : undefined,
        custodyEndDate: data.custodyEndDate ? new Date(data.custodyEndDate) : undefined,
      },
    });

    // Create initial verification step (SUBMISSION)
    await prisma.vehicleVerificationStep.create({
      data: {
        vehicleId: vehicle.id,
        stepNumber: 1,
        stepName: 'SUBMISSION',
        status: 'PASSED',
        completedAt: new Date(),
      },
    });

    // Update partner vehicle count
    await prisma.partner.update({
      where: { id: partnerId },
      data: { totalVehicles: { increment: 1 } },
    });

    logger.info(`Vehicle submitted by partner ${partnerId}: ${vehicle.name} (${vehicle.plateNumber})`);
    return vehicle;
  }

  /**
   * Partner dashboard stats.
   */
  async getDashboard(partnerId: string) {
    const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
    if (!partner) throw Object.assign(new Error('Partner not found'), { status: 404 });

    const [vehicles, activeReservations, completedReservations, pendingPayouts] = await Promise.all([
      prisma.vehicle.groupBy({
        by: ['status'],
        where: { partnerId },
        _count: true,
      }),
      prisma.reservation.count({
        where: { partnerId, status: { in: ['CONFIRMED', 'IN_PROGRESS'] } },
      }),
      prisma.reservation.count({
        where: { partnerId, status: 'COMPLETED' },
      }),
      prisma.payout.aggregate({
        where: { partnerId, status: 'PENDING' },
        _sum: { amount: true },
      }),
    ]);

    return {
      partner: {
        displayName: partner.displayName,
        type: partner.type,
        status: partner.status,
        commissionRate: partner.commissionRate,
        averageRating: partner.averageRating,
        totalRevenue: partner.totalRevenue,
      },
      vehicles: vehicles.reduce((acc, v) => ({ ...acc, [v.status]: v._count }), {}),
      reservations: {
        active: activeReservations,
        completed: completedReservations,
      },
      pendingPayouts: pendingPayouts._sum.amount || 0,
    };
  }
}
