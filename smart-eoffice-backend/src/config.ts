import dotenv from 'dotenv';
import path from 'path';

// Load .env from the backend project root. `process.cwd()` is the package root
// for all npm scripts (dev, start, migrate, seed) in both source and compiled modes.
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable "${name}". Copy .env.example to .env and fill in your Supabase credentials.`
    );
  }
  return value;
};

export const config = {
  port: Number(process.env.PORT || 5000),
  corsOrigin: (process.env.CORS_ORIGIN || '*').split(',').map((s) => s.trim()),

  supabaseUrl: required('SUPABASE_URL'),
  supabaseAnonKey: required('SUPABASE_ANON_KEY'),
  supabaseServiceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY'),
  supabaseDbUrl: required('SUPABASE_DB_URL'),
  storageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'documents',
};
