-- Migration: remove Supabase Auth dependency
-- Adds password_hash column and makes auth_uid optional (nullable, no FK to auth.users).
-- Safe to run multiple times (all statements are idempotent).

-- Drop the Supabase auth.users foreign key (it references the supabase-managed auth schema).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'users' AND constraint_type = 'FOREIGN KEY'
    AND constraint_name IN ('users_auth_uid_fkey', 'users_auth_uid_key')
  ) THEN
    EXECUTE 'ALTER TABLE users DROP CONSTRAINT IF EXISTS users_auth_uid_fkey';
    EXECUTE 'ALTER TABLE users DROP CONSTRAINT IF EXISTS users_auth_uid_key';
  END IF;
END $$;

-- Make auth_uid nullable (it's no longer required; existing rows keep their value).
ALTER TABLE users ALTER COLUMN auth_uid DROP NOT NULL;

-- Drop any remaining FK to auth.users if it still exists under any name.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT constraint_name
    FROM information_schema.table_constraints
    WHERE table_name = 'users'
      AND constraint_type = 'FOREIGN KEY'
      AND constraint_name LIKE '%auth_uid%'
  LOOP
    EXECUTE format('ALTER TABLE users DROP CONSTRAINT IF EXISTS %I', r.constraint_name);
  END LOOP;
END $$;

-- Add password_hash column to store bcrypt hashes.
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text;
