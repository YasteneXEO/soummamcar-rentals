import { Request, Response } from 'express';
import { PartnerService } from './service.js';
import {
  registerPartnerDto,
  updatePartnerDto,
  adminUpdatePartnerDto,
  partnerFiltersDto,
  submitVehicleDto,
} from './dto.js';

const partnerService = new PartnerService();

export class PartnerController {
  async register(req: Request, res: Response) {
    const data = registerPartnerDto.parse(req.body);
    const result = await partnerService.register(data);
    res.status(201).json(result);
  }

  async getMyProfile(req: Request, res: Response) {
    const partner = await partnerService.getByUserId(req.user!.id);
    res.json(partner);
  }

  async updateMyProfile(req: Request, res: Response) {
    const partner = await partnerService.getByUserId(req.user!.id);
    const data = updatePartnerDto.parse(req.body);
    const updated = await partnerService.updateProfile(partner.id, data);
    res.json(updated);
  }

  async list(req: Request, res: Response) {
    const filters = partnerFiltersDto.parse(req.query);
    const result = await partnerService.list(filters);
    res.json(result);
  }

  async getById(req: Request, res: Response) {
    const partner = await partnerService.getById(req.params.id as string);
    res.json(partner);
  }

  async adminUpdate(req: Request, res: Response) {
    const data = adminUpdatePartnerDto.parse(req.body);
    const partner = await partnerService.adminUpdate(req.params.id as string, data);
    res.json(partner);
  }

  async submitVehicle(req: Request, res: Response) {
    const partner = await partnerService.getByUserId(req.user!.id);
    const data = submitVehicleDto.parse(req.body);
    const vehicle = await partnerService.submitVehicle(partner.id, data);
    res.status(201).json(vehicle);
  }

  async getMyVehicles(req: Request, res: Response) {
    const partner = await partnerService.getByUserId(req.user!.id);
    const vehicles = await import('../../config/database.js').then((db) =>
      db.default.vehicle.findMany({
        where: { partnerId: partner.id },
        include: { verificationSteps: true },
        orderBy: { createdAt: 'desc' },
      })
    );
    res.json(vehicles);
  }

  async getDashboard(req: Request, res: Response) {
    const partner = await partnerService.getByUserId(req.user!.id);
    const dashboard = await partnerService.getDashboard(partner.id);
    res.json(dashboard);
  }

  async getMyReservations(req: Request, res: Response) {
    const partner = await partnerService.getByUserId(req.user!.id);
    const db = await import('../../config/database.js');
    const reservations = await db.default.reservation.findMany({
      where: { partnerId: partner.id },
      include: { vehicle: true, client: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(reservations);
  }

  async getMyPayouts(req: Request, res: Response) {
    const partner = await partnerService.getByUserId(req.user!.id);
    const db = await import('../../config/database.js');
    const payouts = await db.default.payout.findMany({
      where: { partnerId: partner.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(payouts);
  }
}
