import dotenv from 'dotenv';
dotenv.config();

export const env = {
  // Server
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:8080',
  APP_URL: process.env.APP_URL || 'http://localhost:3000',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'CHANGE_ME_jwt_secret_32_chars_min',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'CHANGE_ME_refresh_secret',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Bcrypt
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

  // SATIM
  SATIM_MERCHANT_ID: process.env.SATIM_MERCHANT_ID || '',
  SATIM_TERMINAL_ID: process.env.SATIM_TERMINAL_ID || '',
  SATIM_SECRET_KEY: process.env.SATIM_SECRET_KEY || '',
  SATIM_API_URL: process.env.SATIM_API_URL || '',

  // Stripe
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',

  // Email
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@soummamcar.dz',

  // WhatsApp
  WHATSAPP_API_TOKEN: process.env.WHATSAPP_API_TOKEN || '',
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || '',

  // Storage
  S3_ENDPOINT: process.env.S3_ENDPOINT || '',
  S3_BUCKET: process.env.S3_BUCKET || 'soummamcar-files',
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY || '',
  S3_SECRET_KEY: process.env.S3_SECRET_KEY || '',

  // Exchange rate
  EXCHANGE_RATE_API_URL: process.env.EXCHANGE_RATE_API_URL || 'https://api.frankfurter.dev/v1/latest',

  // Admin
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@soummamcar.dz',
} as const;
