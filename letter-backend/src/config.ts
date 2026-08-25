import dotenv from 'dotenv';
import path from 'path';

// Load .env from the backend project root.
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". Copy .env.example to .env and fill in your values.`
    );
  }
  return value;
};

export const config = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: (process.env.CORS_ORIGIN || '*').split(',').map((s) => s.trim()),

  // PostgreSQL
  databaseUrl: required('DATABASE_URL'),
  dbSsl: process.env.DB_SSL === 'true',

  // JWT auth
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // File uploads — local disk storage
  uploadsDir: process.env.UPLOADS_DIR || path.resolve(process.cwd(), 'uploads'),
};
