-- Migration 0003: Expand letter workflows, audit logs, and dispatch metadata

-- 1. Drop existing status constraint on documents to allow all 3 official letter workflow statuses
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_status_check;

ALTER TABLE documents ADD CONSTRAINT documents_status_check CHECK (
  status IN (
    'DRAFT',
    'RECEIVED',
    'REGISTERED',
    'ROUTED',
    'ASSIGNED',
    'IN_PROGRESS',
    'PENDING_REVIEW',
    'PENDING_APPROVAL',
    'APPROVED',
    'REJECTED',
    'CHANGES_REQUESTED',
    'READY_FOR_DISPATCH',
    'DISPATCHED',
    'DELIVERED',
    'RESPONSE_REQUIRED',
    'COMPLETED',
    'ARCHIVED'
  )
);

-- 2. Add response linking & dispatch metadata columns to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS response_to_id bigint REFERENCES documents(id) ON DELETE SET NULL;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS dispatch_method text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS tracking_number text;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS dispatch_date timestamptz;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS delivered_at timestamptz;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS assignment_instructions text;

-- 3. Create Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id              bigserial PRIMARY KEY,
  user_id         bigint REFERENCES users(id) ON DELETE SET NULL,
  user_name       text NOT NULL,
  action          text NOT NULL,
  entity_type     text NOT NULL DEFAULT 'LETTER',
  entity_id       bigint NOT NULL,
  previous_status text,
  new_status      text,
  details         jsonb,
  timestamp       timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp DESC);
