import prisma from '../../config/database.js';
import logger from '../../utils/logger.js';
import type {
  AdvanceStepDto,
  ScoreVehicleDto,
  RecordInspectionDto,
  OverrideVerificationDto,
  VerificationFiltersDto,
} from './dto.js';

/**
 * Verification pipeline steps (mapped to VerificationStepName enum):
 * 1. SUBMISSION   - Partner submits vehicle (auto-passed on submit)
 * 2. DOCUMENTS    - Admin verifies registration, insurance, CT docs
 * 3. PHOTOS       - Admin reviews photos quality / authenticity
 * 4. SCORING      - Auto + manual scoring (threshold: 70)
 * 5. INSPECTION   - On-site or video inspection
 * 6. PROBATION    - 3 supervised rentals before full verification
 */
const STEP_ORDER: Array<{ stepNumber: number; stepName: string; nextVehicleStatus: string }> = [
  { stepNumber: 1, stepName: 'SUBMISSION',  nextVehicleStatus: 'DOCS_REVIEW' },
  { stepNumber: 2, stepName: 'DOCUMENTS',   nextVehicleStatus: 'PHOTOS_REVIEW' },
  { stepNumber: 3, stepName: 'PHOTOS',      nextVehicleStatus: 'SCORED' },
  { stepNumber: 4, stepName: 'SCORING',     nextVehicleStatus: 'INSPECTION_SCHEDULED' },
  { stepNumber: 5, stepName: 'INSPECTION',  nextVehicleStatus: 'APPROVED' },
  { stepNumber: 6, stepName: 'PROBATION',   nextVehicleStatus: 'FULLY_VERIFIED' },
];

export class VerificationService {
  /**
   * Get full verification status for a vehicle.
   */
  async getVehicleVerification(vehicleId: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        verificationSteps: { orderBy: { stepNumber: 'asc' } },
        inspections: { orderBy: { date: 'desc' } },
        partner: { select: { displayName: true, type: true } },
      },
    });
    if (!vehicle) throw Object.assign(new Error('Vehicle not found'), { status: 404 });
    return vehicle;
  }

  /**
   * Advance a verification step (admin action).
   */
  async advanceStep(vehicleId: string, stepNumber: number, data: AdvanceStepDto, performedById: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { verificationSteps: { orderBy: { stepNumber: 'asc' } } },
    });
    if (!vehicle) throw Object.assign(new Error('Vehicle not found'), { status: 404 });

    const stepDef = STEP_ORDER.find((s) => s.stepNumber === stepNumber);
    if (!stepDef) throw Object.assign(new Error('Invalid step number'), { status: 400 });

    const existingStep = vehicle.verificationSteps.find((s) => s.stepNumber === stepNumber);

    const step = existingStep
      ? await prisma.vehicleVerificationStep.update({
          where: { id: existingStep.id },
          data: {
            status: data.status as any,
            notes: data.notes,
            performedById,
            completedAt: new Date(),
            data: data.data || undefined,
          },
        })
      : await prisma.vehicleVerificationStep.create({
          data: {
            vehicleId,
            stepNumber,
            stepName: stepDef.stepName as any,
            status: data.status as any,
            notes: data.notes,
            performedById,
            completedAt: new Date(),
            data: data.data || undefined,
          },
        });

    // If step passed, advance vehicle verificationStatus
    if (data.status === 'PASSED') {
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { verificationStatus: stepDef.nextVehicleStatus as any },
      });

      // If scoring step (step 4) passed, handle scoring logic
      if (stepNumber === 4) {
        await this._handleScoring(vehicleId);
      }
    }

    // If step failed, set vehicle to REJECTED
    if (data.status === 'FAILED') {
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { verificationStatus: 'REJECTED' },
      });
    }

    logger.info(`Verification step ${stepNumber} (${stepDef.stepName}) for vehicle ${vehicleId}: ${data.status}`);
    return step;
  }

  /**
   * Score a vehicle (step 4).
   */
  async scoreVehicle(vehicleId: string, data: ScoreVehicleDto, performedById: string) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw Object.assign(new Error('Vehicle not found'), { status: 404 });

    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { verificationScore: data.score },
    });

    return this.advanceStep(vehicleId, 4, {
      status: data.score >= 50 ? 'PASSED' : 'FAILED',
      notes: data.notes || `Score: ${data.score}/100`,
    }, performedById);
  }

  /**
   * Handle post-scoring logic.
   * >= 70: PROBATION (published, 3 supervised rentals)
   * 50-69: SCORED (admin must manually approve)
   * < 50: REJECTED (handled by FAILED in advanceStep)
   */
  private async _handleScoring(vehicleId: string) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle || vehicle.verificationScore === null) return;

    if (vehicle.verificationScore >= 70) {
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: {
          verificationStatus: 'PROBATION',
          probationRentalsCompleted: 0,
          isPublished: true,
          status: 'AVAILABLE',
        },
      });
    }
    // 50-69: stays at SCORED, admin must manually review
  }

  /**
   * Record a physical/video inspection (step 5).
   */
  async recordInspection(data: RecordInspectionDto, inspectorId: string) {
    const inspection = await prisma.vehicleInspection.create({
      data: {
        vehicleId: data.vehicleId,
        inspectorId,
        type: data.type as any,
        date: new Date(data.date),
        location: data.location,
        checklistResults: data.checklistResults,
        totalScore: data.totalScore,
        photos: data.photos,
        videoUrl: data.videoUrl,
        result: data.result as any,
        reserves: data.reserves,
        notes: data.notes,
      },
    });

    // Update vehicle last inspection date
    await prisma.vehicle.update({
      where: { id: data.vehicleId },
      data: { lastInspectionDate: new Date(data.date) },
    });

    // If initial inspection, auto-advance step 5
    if (data.type === 'INITIAL') {
      const stepStatus = data.result === 'REJECTED' ? 'FAILED' : 'PASSED';
      await this.advanceStep(data.vehicleId, 5, {
        status: stepStatus as any,
        notes: `Inspection result: ${data.result}`,
      }, inspectorId);
    }

    logger.info(`Inspection recorded for vehicle ${data.vehicleId}: ${data.type} → ${data.result}`);
    return inspection;
  }

  /**
   * Check if a probation vehicle should be fully verified.
   */
  async checkProbationCompletion(vehicleId: string) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) return;
    if (vehicle.verificationStatus !== 'PROBATION') return;

    const PROBATION_THRESHOLD = 3;
    if ((vehicle.probationRentalsCompleted || 0) >= PROBATION_THRESHOLD) {
      await prisma.vehicleVerificationStep.create({
        data: {
          vehicleId,
          stepNumber: 6,
          stepName: 'PROBATION',
          status: 'PASSED',
          notes: `Completed ${vehicle.probationRentalsCompleted} probation rentals`,
          completedAt: new Date(),
        },
      });

      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { verificationStatus: 'FULLY_VERIFIED' },
      });

      logger.info(`Vehicle ${vehicleId} is now FULLY_VERIFIED after ${vehicle.probationRentalsCompleted} probation rentals`);
    }
  }

  /**
   * Admin: override verification status directly.
   */
  async overrideVerification(vehicleId: string, data: OverrideVerificationDto, performedById: string) {
    const vehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { verificationStatus: data.status as any },
    });

    // If approved/probation — auto-publish
    if (['APPROVED', 'PROBATION', 'FULLY_VERIFIED'].includes(data.status)) {
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { isPublished: true, status: 'AVAILABLE' },
      });
    }

    await prisma.activityLog.create({
      data: {
        userId: performedById,
        action: 'VERIFICATION_OVERRIDE',
        entity: 'Vehicle',
        entityId: vehicleId,
        metadata: { from: vehicle.verificationStatus, to: data.status, reason: data.reason },
      },
    });

    logger.info(`Verification override for vehicle ${vehicleId}: → ${data.status} by ${performedById}`);
    return vehicle;
  }

  /**
   * List vehicles by verification status (admin queue).
   */
  async listPending(filters: VerificationFiltersDto) {
    const where: Record<string, any> = {};
    if (filters.status) {
      where.verificationStatus = filters.status;
    } else {
      where.verificationStatus = {
        in: ['SUBMITTED', 'DOCS_REVIEW', 'PHOTOS_REVIEW', 'SCORED', 'INSPECTION_SCHEDULED'],
      };
    }

    const [data, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        include: {
          partner: { select: { displayName: true, type: true, wilaya: true } },
          verificationSteps: { orderBy: { stepNumber: 'asc' } },
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { createdAt: 'asc' },
      }),
      prisma.vehicle.count({ where }),
    ]);

    return { data, total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / filters.limit) };
  }

  /**
   * Vehicles due for re-inspection (6-month cycle).
   */
  async listDueForReinspection() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return prisma.vehicle.findMany({
      where: {
        verificationStatus: { in: ['APPROVED', 'PROBATION', 'FULLY_VERIFIED'] },
        OR: [
          { lastInspectionDate: null },
          { lastInspectionDate: { lt: sixMonthsAgo } },
        ],
      },
      include: {
        partner: { select: { displayName: true, phone: true } },
      },
      orderBy: { lastInspectionDate: 'asc' },
    });
  }
}
