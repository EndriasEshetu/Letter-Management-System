-- Migration 0009: Safety net — ensure all notifications columns exist
-- Root cause: Migration 0008 created an index on (entity_type, entity_id) but
-- entity_id was never added, causing the entire 0008 transaction to roll back.
-- All columns 0008 intended to add were therefore never created.
-- This migration re-adds everything with IF NOT EXISTS so it is safe to run
-- regardless of whether 0008 partially applied or never applied at all.

-- Re-add all columns from 0008 (idempotent)
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS actor_user_id bigint REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS entity_type text DEFAULT 'LETTER';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS entity_id bigint;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority text DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT'));
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata jsonb;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at timestamptz;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT NOW();
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS idempotency_key text;

-- Idempotency constraint (skip if already exists or fails on duplicates)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'unique_notification_per_event_per_user'
  ) THEN
    ALTER TABLE notifications
      ADD CONSTRAINT unique_notification_per_event_per_user
      UNIQUE (user_id, type, document_id, idempotency_key);
  END IF;
EXCEPTION WHEN others THEN
  NULL;
END $$;

-- Re-create all indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_notifications_is_read    ON notifications (is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type       ON notifications (type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority   ON notifications (priority);
CREATE INDEX IF NOT EXISTS idx_notifications_actor      ON notifications (actor_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_entity     ON notifications (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_idempotency ON notifications (idempotency_key) WHERE idempotency_key IS NOT NULL;

-- Back-fill entity_id from document_id for any existing rows
UPDATE notifications
SET entity_id = document_id
WHERE entity_id IS NULL AND document_id IS NOT NULL;

-- Re-create updated_at trigger
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF NEW.is_read = true AND OLD.is_read = false THEN
    NEW.read_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notifications_updated_at ON notifications;
CREATE TRIGGER trigger_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();
