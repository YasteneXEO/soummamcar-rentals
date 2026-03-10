import prisma from '../../config/database.js';
import logger from '../../utils/logger.js';
import type { CreateConditionReportDto, ConditionFiltersDto } from './dto.js';

// FuelLevel enum ordinal mapping for comparison
const FUEL_LEVEL_ORDER = { QUARTER: 1, HALF: 2, THREE_QUARTER: 3, FULL: 4 } as const;

export class ConditionService {
  /**
   * Create a condition report (état des lieux) for pickup or return.
   */
  async create(data: CreateConditionReportDto, photoUrls: string[] = []) {
    // Verify the reservation exists
    const reservation = await prisma.reservation.findUnique({
      where: { id: data.reservationId },
    });
    if (!reservation) throw Object.assign(new Error('Reservation not found'), { status: 404 });

    // Ensure no duplicate report of same type for same reservation
    const existing = await prisma.conditionReport.findFirst({
      where: { reservationId: data.reservationId, type: data.type },
    });
    if (existing) {
      throw Object.assign(
        new Error(`A ${data.type} condition report already exists for this reservation`),
        { status: 409 },
      );
    }

    const report = await prisma.conditionReport.create({
      data: {
        reservationId: data.reservationId,
        type: data.type,
        kmReading: data.kmReading,
        fuelLevel: data.fuelLevel,
        damageNotes: data.damageNotes ?? null,
        photos: photoUrls, // stored as Json
        gpsLatitude: data.gpsLatitude ?? null,
        gpsLongitude: data.gpsLongitude ?? null,
        signature: data.signature ?? null,
      },
    });

    logger.info(`Condition report created: ${data.type} for reservation ${reservation.referenceNumber}`);
    return report;
  }

  /**
   * Update an existing condition report.
   */
  async update(id: string, data: Partial<CreateConditionReportDto>, newPhotoUrls?: string[]) {
    const report = await prisma.conditionReport.findUnique({ where: { id } });
    if (!report) throw Object.assign(new Error('Condition report not found'), { status: 404 });

    const updateData: Record<string, any> = {};
    if (data.kmReading !== undefined) updateData.kmReading = data.kmReading;
    if (data.fuelLevel !== undefined) updateData.fuelLevel = data.fuelLevel;
    if (data.damageNotes !== undefined) updateData.damageNotes = data.damageNotes;
    if (data.gpsLatitude !== undefined) updateData.gpsLatitude = data.gpsLatitude;
    if (data.gpsLongitude !== undefined) updateData.gpsLongitude = data.gpsLongitude;
    if (data.signature !== undefined) updateData.signature = data.signature;
    if (newPhotoUrls) {
      const existingPhotos = (report.photos as string[]) || [];
      updateData.photos = [...existingPhotos, ...newPhotoUrls];
    }

    return prisma.conditionReport.update({ where: { id }, data: updateData });
  }

  /**
   * Get a single condition report.
   */
  async getById(id: string) {
    const report = await prisma.conditionReport.findUnique({
      where: { id },
      include: { reservation: true },
    });
    if (!report) throw Object.assign(new Error('Condition report not found'), { status: 404 });
    return report;
  }

  /**
   * List condition reports with filters and pagination.
   */
  async list(filters: ConditionFiltersDto) {
    const where: Record<string, any> = {};
    if (filters.reservationId) where.reservationId = filters.reservationId;
    if (filters.type) where.type = filters.type;

    const [reports, total] = await Promise.all([
      prisma.conditionReport.findMany({
        where,
        include: { reservation: true },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.conditionReport.count({ where }),
    ]);

    return {
      data: reports,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  /**
   * Compare pickup and return reports for damage assessment.
   */
  async compare(reservationId: string) {
    const [pickup, returnReport] = await Promise.all([
      prisma.conditionReport.findFirst({ where: { reservationId, type: 'PICKUP' } }),
      prisma.conditionReport.findFirst({ where: { reservationId, type: 'RETURN' } }),
    ]);

    if (!pickup) throw Object.assign(new Error('No pickup report found'), { status: 404 });
    if (!returnReport) throw Object.assign(new Error('No return report found'), { status: 404 });

    const kmDiff = returnReport.kmReading - pickup.kmReading;
    const fuelDiff = FUEL_LEVEL_ORDER[returnReport.fuelLevel] - FUEL_LEVEL_ORDER[pickup.fuelLevel];

    return {
      pickup,
      return: returnReport,
      diff: {
        kmDiff,
        fuelDiff, // positive = more fuel at return, negative = less
        pickupDamageNotes: pickup.damageNotes,
        returnDamageNotes: returnReport.damageNotes,
      },
    };
  }
}
