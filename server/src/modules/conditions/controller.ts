import type { Request, Response, NextFunction } from 'express';
import { ConditionService } from './service.js';

const service = new ConditionService();

export class ConditionController {
  /** POST /conditions */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // Photo URLs would come from multer + S3 upload middleware
      const photoUrls = (req.files as any[])?.map((f: any) => f.location || f.path) || [];
      const report = await service.create(req.body, photoUrls);
      res.status(201).json(report);
    } catch (error) {
      next(error);
    }
  }

  /** PATCH /conditions/:id */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const newPhotoUrls = (req.files as any[])?.map((f: any) => f.location || f.path);
      const report = await service.update(req.params.id as string, req.body, newPhotoUrls);
      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  /** GET /conditions/:id */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const report = await service.getById(req.params.id as string);
      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  /** GET /conditions */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.list(req.query as any);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /** GET /conditions/compare/:reservationId */
  async compare(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await service.compare(req.params.reservationId as string);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
