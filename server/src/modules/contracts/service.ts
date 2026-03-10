import prisma from '../../config/database.js';
import logger from '../../utils/logger.js';
import type { CreateContractDto, ContractFiltersDto } from './dto.js';

export class ContractService {
  /**
   * Create a new rental contract linked to a reservation.
   * The Prisma Contract model is intentionally simple: reservationId, status,
   * pdfUrl, signatureUrl, signedAt. Detailed client/driver info lives on the User model.
   */
  async create(data: CreateContractDto) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: data.reservationId },
      include: { vehicle: true, client: true },
    });
    if (!reservation) throw Object.assign(new Error('Reservation not found'), { status: 404 });

    // Ensure one contract per reservation (reservationId is @unique)
    const existing = await prisma.contract.findUnique({
      where: { reservationId: data.reservationId },
    });
    if (existing) {
      throw Object.assign(new Error('A contract already exists for this reservation'), { status: 409 });
    }

    const contract = await prisma.contract.create({
      data: {
        reservationId: data.reservationId,
        status: 'DRAFT',
      },
    });

    logger.info(`Contract created: ${contract.id} for reservation ${reservation.referenceNumber}`);
    return contract;
  }

  /**
   * Sign the contract (client signature as base64 image).
   */
  async sign(contractId: string, signatureBase64: string) {
    const contract = await prisma.contract.findUnique({ where: { id: contractId } });
    if (!contract) throw Object.assign(new Error('Contract not found'), { status: 404 });
    if (contract.status !== 'DRAFT') {
      throw Object.assign(new Error('Contract already signed or closed'), { status: 400 });
    }

    const updated = await prisma.contract.update({
      where: { id: contractId },
      data: {
        signatureUrl: signatureBase64, // TODO: Upload to S3 and store URL
        signedAt: new Date(),
        status: 'SIGNED',
      },
    });

    logger.info(`Contract ${contract.id} signed`);
    return updated;
  }

  /**
   * Generate PDF of the contract.
   * Returns a buffer for streaming.
   */
  async generatePdf(contractId: string): Promise<Buffer> {
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        reservation: {
          include: { vehicle: true, client: true },
        },
      },
    });
    if (!contract) throw Object.assign(new Error('Contract not found'), { status: 404 });

    // TODO: Use pdfkit or @react-pdf/renderer for proper PDF generation
    // Placeholder: return a simple text buffer
    const res = contract.reservation;
    const content = [
      `CONTRAT DE LOCATION — ${contract.id}`,
      `==========================================`,
      ``,
      `Client: ${res.client.fullName}`,
      `Véhicule: ${res.vehicle.brand} ${res.vehicle.model}`,
      `Immatriculation: ${res.vehicle.plateNumber}`,
      ``,
      `Début: ${res.pickupDate.toISOString().split('T')[0]}`,
      `Fin: ${res.returnDate.toISOString().split('T')[0]}`,
      `Montant total: ${res.subtotal} DZD`,
      ``,
      contract.signedAt ? `Signé le: ${contract.signedAt.toISOString().split('T')[0]}` : 'Non signé',
    ].join('\n');

    logger.info(`PDF generated for contract ${contract.id}`);
    return Buffer.from(content, 'utf-8');
  }

  /**
   * List contracts with filters and pagination.
   */
  async list(filters: ContractFiltersDto) {
    const where: Record<string, any> = {};
    if (filters.status) where.status = filters.status;
    if (filters.clientId) where.reservation = { clientId: filters.clientId };

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        include: {
          reservation: { include: { vehicle: true, client: true } },
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contract.count({ where }),
    ]);

    return {
      data: contracts,
      meta: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  /**
   * Get a single contract by ID.
   */
  async getById(id: string) {
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        reservation: { include: { vehicle: true, client: true } },
      },
    });
    if (!contract) throw Object.assign(new Error('Contract not found'), { status: 404 });
    return contract;
  }

  /**
   * Complete a contract (mark as finished after vehicle return).
   */
  async complete(id: string) {
    return prisma.contract.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });
  }

  /**
   * Cancel a contract — resets to DRAFT status since the schema does not have a CANCELLED state.
   * In practice you may want to delete the contract or add a CANCELLED enum value.
   */
  async cancel(id: string) {
    return prisma.contract.update({
      where: { id },
      data: { status: 'DRAFT' },
    });
  }
}
