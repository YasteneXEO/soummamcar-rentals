import { Request, Response, NextFunction } from 'express';
import { ReservationService } from './service.js';

const service = new ReservationService();

export class ReservationController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const reservation = await service.create(req.body, req.user?.id);
      res.status(201).json({ data: reservation });
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ message: err.message }); return; }
      next(err);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.list(req.query as any);
      res.json(result);
    } catch (err) { next(err); }
  }

  async getMyReservations(req: Request, res: Response, next: NextFunction) {
    try {
      const reservations = await service.getMyReservations(req.user!.id);
      res.json({ data: reservations });
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const reservation = await service.getById(req.params.id as string);
      res.json({ data: reservation });
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ message: err.message }); return; }
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const reservation = await service.updateStatus(req.params.id as string, req.body.status);
      res.json({ data: reservation });
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ message: err.message }); return; }
      next(err);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user!.role === 'ADMIN' || req.user!.role === 'AGENT';
      const reservation = await service.cancel(req.params.id as string, req.user!.id, isAdmin);
      res.json({ data: reservation });
    } catch (err: any) {
      if (err.status) { res.status(err.status).json({ message: err.message }); return; }
      next(err);
    }
  }
}
