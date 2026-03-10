import { Router } from 'express';
import { AuthController } from './controller.js';
import { validate } from '../../middleware/validation.js';
import { authenticate } from '../../middleware/auth.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import {
  registerDto,
  loginDto,
  refreshTokenDto,
  forgotPasswordDto,
  resetPasswordDto,
  updateProfileDto,
  updateClientProfileDto,
} from './dto.js';

const router = Router();
const ctrl = new AuthController();

// Public routes (rate-limited)
router.post('/register', authLimiter, validate(registerDto), ctrl.register);
router.post('/login', authLimiter, validate(loginDto), ctrl.login);
router.post('/refresh', validate(refreshTokenDto), ctrl.refresh);
router.post('/forgot-password', authLimiter, validate(forgotPasswordDto), ctrl.forgotPassword);
router.post('/reset-password', validate(resetPasswordDto), ctrl.resetPassword);

// Protected routes
router.get('/me', authenticate, ctrl.getMe);
router.put('/me', authenticate, validate(updateProfileDto), ctrl.updateMe);
router.put('/me/client-profile', authenticate, validate(updateClientProfileDto), ctrl.updateClientProfile);
router.post('/logout', authenticate, ctrl.logout);

// TODO: POST /me/documents — file upload via multer
// TODO: POST /verify-phone — OTP verification

export default router;
