import { Request, Response } from 'express';
import { VerificationService } from './service.js';
import {
  advanceStepDto,
  scoreVehicleDto,
  recordInspectionDto,
  overrideVerificationDto,
  verificationFiltersDto,
} from './dto.js';

const verificationService = new VerificationService();

export class VerificationController {
  async getVehicleVerification(req: Request, res: Response) {
    const result = await verificationService.getVehicleVerification(req.params.vehicleId as string);
    res.json(result);
  }

  async advanceStep(req: Request, res: Response) {
    const data = advanceStepDto.parse(req.body);
    const stepNumber = parseInt(req.params.stepNumber as string, 10);
    const result = await verificationService.advanceStep(req.params.vehicleId as string, stepNumber, data, req.user!.id);
    res.json(result);
  }

  async scoreVehicle(req: Request, res: Response) {
    const data = scoreVehicleDto.parse(req.body);
    const result = await verificationService.scoreVehicle(req.params.vehicleId as string, data, req.user!.id);
    res.json(result);
  }

  async recordInspection(req: Request, res: Response) {
    const data = recordInspectionDto.parse(req.body);
    const result = await verificationService.recordInspection(data, req.user!.id);
    res.status(201).json(result);
  }

  async overrideVerification(req: Request, res: Response) {
    const data = overrideVerificationDto.parse(req.body);
    const result = await verificationService.overrideVerification(req.params.vehicleId as string, data, req.user!.id);
    res.json(result);
  }

  async listPending(req: Request, res: Response) {
    const filters = verificationFiltersDto.parse(req.query);
    const result = await verificationService.listPending(filters);
    res.json(result);
  }

  async listDueForReinspection(req: Request, res: Response) {
    const result = await verificationService.listDueForReinspection();
    res.json(result);
  }
}
