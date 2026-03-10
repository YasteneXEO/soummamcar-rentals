import { Request, Response, NextFunction } from 'express';
import { VehicleService } from './service.js';

const vehicleService = new VehicleService();

export class VehicleController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await vehicleService.list(req.query as any);
      res.json(result);
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await vehicleService.getById(req.params.id as string);
      res.json({ data: vehicle });
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ message: err.message }); return; }
      next(err);
    }
  }

  async checkAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { from, to } = req.query as { from: string; to: string };
      if (!from || !to) { res.status(400).json({ message: 'from and to query params required' }); return; }
      const result = await vehicleService.checkAvailability(req.params.id as string, new Date(from), new Date(to));
      res.json({ data: result });
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await vehicleService.create(req.body);
      res.status(201).json({ data: vehicle });
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await vehicleService.update(req.params.id as string, req.body);
      res.json({ data: vehicle });
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await vehicleService.delete(req.params.id as string);
      res.json({ message: 'Vehicle deleted' });
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ message: err.message }); return; }
      next(err);
    }
  }

  async getAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const alerts = await vehicleService.getAlerts();
      res.json({ data: alerts });
    } catch (err) { next(err); }
  }
}
