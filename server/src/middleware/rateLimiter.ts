import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for auth endpoints: max 5 attempts per 15 min per IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { message: 'Too many attempts, please try again in 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter: 100 req/min per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { message: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});
