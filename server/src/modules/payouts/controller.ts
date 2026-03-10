import { Request, Response } from 'express';
import { PayoutService } from './service.js';
import { processPayoutDto, createPayoutDto, payoutFiltersDto } from './dto.js';

const payoutService = new PayoutService();

export class PayoutController {
  async list(req: Request, res: Response) {
    const filters = payoutFiltersDto.parse(req.query);
    const result = await payoutService.list(filters);
    res.json(result);
  }

  async markProcessing(req: Request, res: Response) {
    const payout = await payoutService.markProcessing(req.params.id as string);
    res.json(payout);
  }

  async markPaid(req: Request, res: Response) {
    const data = processPayoutDto.parse(req.body);
    const payout = await payoutService.markPaid(req.params.id as string, data);
    res.json(payout);
  }

  async markFailed(req: Request, res: Response) {
    const payout = await payoutService.markFailed(req.params.id as string, req.body.notes);
    res.json(payout);
  }

  async createManual(req: Request, res: Response) {
    const data = createPayoutDto.parse(req.body);
    const payout = await payoutService.createManual(data);
    res.status(201).json(payout);
  }

  async generatePending(req: Request, res: Response) {
    const result = await payoutService.generatePendingPayouts();
    res.json(result);
  }

  async partnerSummary(req: Request, res: Response) {
    let partnerId: string;
    if (req.params.partnerId) {
      partnerId = req.params.partnerId as string;
    } else {
      const db = await import('../../config/database.js');
      const partner = await db.default.partner.findUnique({ where: { userId: req.user!.id } });
      if (!partner) return res.status(404).json({ error: 'Partner not found' });
      partnerId = partner.id;
    }
    const summary = await payoutService.getPartnerSummary(partnerId);
    res.json(summary);
  }
}
