import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

/**
 * Global error handler middleware.
 */
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  logger.error(err.message, { stack: err.stack });

  // Prisma known errors
  if ((err as any).code === 'P2002') {
    res.status(409).json({ message: 'A record with this value already exists' });
    return;
  }
  if ((err as any).code === 'P2025') {
    res.status(404).json({ message: 'Record not found' });
    return;
  }

  res.status(500).json({
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}
