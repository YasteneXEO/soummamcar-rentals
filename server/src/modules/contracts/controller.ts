import type { Request, Response, NextFunction } from 'express';
import { ContractService } from './service.js';

const service = new ContractService();

export class ContractController {
  /** POST /contracts */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const contract = await service.create(req.body);
      res.status(201).json(contract);
    } catch (error) {
      next(error);
    }
  }

  /** POST /contracts/:id/sign */
  async sign(req: Request, res: Response, next: NextFunction) {
    try {
      const contract = await service.sign(req.params.id as string, req.body.signatureBase64);
      res.json(contract);
    } catch (error) {
      next(error);
    }
  }

  /** GET /contracts/:id/pdf */
  async downloadPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const buffer = await service.generatePdf(req.params.id as string);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=contrat-${req.params.id}.pdf`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  /** GET /contracts */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.list(req.query as any);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /** GET /contracts/:id */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const contract = await service.getById(req.params.id as string);
      res.json(contract);
    } catch (error) {
      next(error);
    }
  }

  /** PATCH /contracts/:id/complete */
  async complete(req: Request, res: Response, next: NextFunction) {
    try {
      const contract = await service.complete(req.params.id as string);
      res.json(contract);
    } catch (error) {
      next(error);
    }
  }

  /** PATCH /contracts/:id/cancel */
  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const contract = await service.cancel(req.params.id as string);
      res.json(contract);
    } catch (error) {
      next(error);
    }
  }
}
