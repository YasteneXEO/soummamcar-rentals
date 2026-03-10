import { Request, Response } from 'express';
import { ReviewService } from './service.js';
import { createReviewDto, respondToReviewDto, moderateReviewDto, reviewFiltersDto } from './dto.js';

const reviewService = new ReviewService();

export class ReviewController {
  async create(req: Request, res: Response) {
    const data = createReviewDto.parse(req.body);
    const review = await reviewService.create(req.user!.id, data);
    res.status(201).json(review);
  }

  async respond(req: Request, res: Response) {
    const db = await import('../../config/database.js');
    const partner = await db.default.partner.findUnique({ where: { userId: req.user!.id } });
    if (!partner) return res.status(404).json({ error: 'Partner not found' });

    const data = respondToReviewDto.parse(req.body);
    const review = await reviewService.respond(req.params.id as string, partner.id, data);
    res.json(review);
  }

  async moderate(req: Request, res: Response) {
    const data = moderateReviewDto.parse(req.body);
    const review = await reviewService.moderate(req.params.id as string, data);
    res.json(review);
  }

  async list(req: Request, res: Response) {
    const filters = reviewFiltersDto.parse(req.query);
    const result = await reviewService.list(filters);
    res.json(result);
  }

  async listAll(req: Request, res: Response) {
    const filters = reviewFiltersDto.parse(req.query);
    const result = await reviewService.listAll(filters);
    res.json(result);
  }
}
