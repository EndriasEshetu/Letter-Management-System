-- Migration 0005: Allow REGISTRY_OFFICER in users table check constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (
  role IN ('ADMIN', 'DEPARTMENT_MANAGER', 'EMPLOYEE', 'REGISTRY_OFFICER')
);
