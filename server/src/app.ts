import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { corsOptions } from './config/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import logger from './utils/logger.js';

// Route imports
import authRoutes from './modules/auth/routes.js';
import vehicleRoutes from './modules/vehicles/routes.js';
import reservationRoutes from './modules/reservations/routes.js';
import paymentRoutes from './modules/payments/routes.js';
import contractRoutes from './modules/contracts/routes.js';
import conditionRoutes from './modules/conditions/routes.js';
import partnerRoutes from './modules/partners/routes.js';
import verificationRoutes from './modules/verification/routes.js';
import reviewRoutes from './modules/reviews/routes.js';
import payoutRoutes from './modules/payouts/routes.js';

// Cron jobs
import { initCronJobs } from './jobs/scheduler.js';

const app = express();

// ─── Global Middleware ─────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting on all API routes
app.use('/api', apiLimiter);

// ─── Health Check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/conditions', conditionRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payouts', payoutRoutes);

// ─── Initialize Cron Jobs ──────────────────────────────────────
initCronJobs();

// ─── 404 Handler ───────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ──────────────────────────────────────
app.use(errorHandler);

export default app;
