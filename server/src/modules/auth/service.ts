import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../../config/database.js';
import { env } from '../../config/env.js';
import type { RegisterDto, LoginDto, UpdateProfileDto } from './dto.js';
import logger from '../../utils/logger.js';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

function generateTokens(userId: string, email: string, role: string): TokenPair {
  const accessToken = jwt.sign(
    { userId, email, role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN } as jwt.SignOptions
  );
  const refreshToken = jwt.sign(
    { userId, email, role },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
  );
  return { accessToken, refreshToken };
}

export class AuthService {
  async register(data: RegisterDto) {
    // Check existing
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: data.email }, { phone: data.phone }] },
    });
    if (existing) {
      throw Object.assign(new Error('Email or phone already registered'), { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, env.BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        passwordHash,
        fullName: data.fullName,
        isDiaspora: data.isDiaspora ?? false,
        country: data.country,
        role: 'CLIENT',
      },
    });

    const tokens = generateTokens(user.id, user.email, user.role);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    logger.info(`New user registered: ${user.email}`);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async login(data: LoginDto) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    }

    if (user.status === 'BLACKLISTED') {
      throw Object.assign(new Error('Account suspended'), { status: 403 });
    }

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) {
      throw Object.assign(new Error('Invalid credentials'), { status: 401 });
    }

    const tokens = generateTokens(user.id, user.email, user.role);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    logger.info(`User logged in: ${user.email}`);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as {
        userId: string;
        email: string;
        role: string;
      };

      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user || user.refreshToken !== token) {
        throw Object.assign(new Error('Invalid refresh token'), { status: 401 });
      }

      const tokens = generateTokens(user.id, user.email, user.role);
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken };
    } catch {
      throw Object.assign(new Error('Invalid refresh token'), { status: 401 });
    }
  }

  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal whether email exists
      return { message: 'If this email is registered, you will receive a reset link' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExp = new Date(Date.now() + 3600_000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExp },
    });

    // TODO: Send email via NotificationService
    logger.info(`Password reset requested for: ${email}, token: ${resetToken}`);

    return { message: 'If this email is registered, you will receive a reset link' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExp: { gte: new Date() } },
    });
    if (!user) {
      throw Object.assign(new Error('Invalid or expired reset token'), { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, env.BCRYPT_ROUNDS);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExp: null, refreshToken: null },
    });

    return { message: 'Password updated successfully' };
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { documents: true },
    });
    if (!user) throw Object.assign(new Error('User not found'), { status: 404 });
    return this.sanitizeUser(user);
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });
    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: any) {
    const { passwordHash, refreshToken, resetToken, resetTokenExp, ...safe } = user;
    return safe;
  }
}
