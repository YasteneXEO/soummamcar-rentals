import prisma from '../../config/database.js';
import logger from '../../utils/logger.js';
import type { CreateReviewDto, RespondToReviewDto, ModerateReviewDto, ReviewFiltersDto } from './dto.js';

export class ReviewService {
  /**
   * Create a review for a completed reservation.
   */
  async create(authorId: string, data: CreateReviewDto) {
    const reservation = await prisma.reservation.findUnique({
      where: { id: data.reservationId },
      include: { vehicle: true },
    });
    if (!reservation) throw Object.assign(new Error('Reservation not found'), { status: 404 });
    if (reservation.clientId !== authorId) throw Object.assign(new Error('Not your reservation'), { status: 403 });
    if (reservation.status !== 'COMPLETED') throw Object.assign(new Error('Reservation must be completed'), { status: 400 });

    const existing = await prisma.review.findFirst({ where: { reservationId: data.reservationId } });
    if (existing) throw Object.assign(new Error('Review already exists for this reservation'), { status: 409 });

    const overallRating = (data.vehicleRating + data.serviceRating + data.cleanlinessRating) / 3;

    const review = await prisma.review.create({
      data: {
        reservationId: data.reservationId,
        authorId,
        partnerId: reservation.partnerId,
        vehicleRating: data.vehicleRating,
        serviceRating: data.serviceRating,
        cleanlinessRating: data.cleanlinessRating,
        overallRating: Math.round(overallRating * 10) / 10,
        comment: data.comment,
        isPublished: true,
      },
    });

    // Update partner average rating if applicable
    if (reservation.partnerId) {
      await this._updatePartnerRating(reservation.partnerId);
    }

    logger.info(`Review created: reservation ${data.reservationId} by author ${authorId}`);
    return review;
  }

  /**
   * Partner responds to a review.
   */
  async respond(reviewId: string, partnerId: string, data: RespondToReviewDto) {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw Object.assign(new Error('Review not found'), { status: 404 });
    if (review.partnerId !== partnerId) throw Object.assign(new Error('Not your review'), { status: 403 });
    if (review.response) throw Object.assign(new Error('Already responded'), { status: 409 });

    return prisma.review.update({
      where: { id: reviewId },
      data: { response: data.response },
    });
  }

  /**
   * Admin: moderate a review.
   */
  async moderate(reviewId: string, data: ModerateReviewDto) {
    return prisma.review.update({
      where: { id: reviewId },
      data: { isPublished: data.isPublished },
    });
  }

  /**
   * List reviews (public or filtered).
   */
  async list(filters: ReviewFiltersDto) {
    const where: Record<string, any> = { isPublished: true };
    if (filters.partnerId) where.partnerId = filters.partnerId;
    if (filters.authorId) where.authorId = filters.authorId;
    if (filters.minRating) where.overallRating = { gte: filters.minRating };

    const [data, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          author: { select: { fullName: true } },
          reservation: { select: { vehicle: { select: { name: true } } } },
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where }),
    ]);

    return { data, total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / filters.limit) };
  }

  /**
   * Admin: list all reviews (including unpublished).
   */
  async listAll(filters: ReviewFiltersDto) {
    const where: Record<string, any> = {};
    if (filters.partnerId) where.partnerId = filters.partnerId;
    if (filters.authorId) where.authorId = filters.authorId;

    const [data, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          author: { select: { fullName: true, email: true } },
          reservation: { select: { vehicle: { select: { name: true } } } },
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where }),
    ]);

    return { data, total, page: filters.page, limit: filters.limit, totalPages: Math.ceil(total / filters.limit) };
  }

  /**
   * Recalculate partner average rating. Auto-suspend if < 3.0 on last 5.
   */
  private async _updatePartnerRating(partnerId: string) {
    const agg = await prisma.review.aggregate({
      where: { partnerId, isPublished: true },
      _avg: { overallRating: true },
      _count: true,
    });
    await prisma.partner.update({
      where: { id: partnerId },
      data: {
        averageRating: agg._avg?.overallRating || 0,
      },
    });

    // Auto-suspend: if average of last 5 reviews < 3.0
    const lastFive = await prisma.review.findMany({
      where: { partnerId, isPublished: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { overallRating: true },
    });

    if (lastFive.length >= 5) {
      const avgLastFive = lastFive.reduce((sum: number, r: { overallRating: number }) => sum + r.overallRating, 0) / 5;
      if (avgLastFive < 3.0) {
        await prisma.partner.update({
          where: { id: partnerId },
          data: { status: 'SUSPENDED' },
        });
        logger.warn(`Partner ${partnerId} auto-suspended: avg of last 5 reviews = ${avgLastFive.toFixed(2)}`);
      }
    }
  }
}