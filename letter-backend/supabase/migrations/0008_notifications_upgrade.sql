-- Migration 0008: Upgrade notifications table for full workflow integration
-- Plain PostgreSQL migration — run with: npm run migrate

-- 1. Add new columns for proper notification entity
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS actor_user_id bigint REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS entity_type text DEFAULT 'LETTER';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority text DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT'));
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata jsonb;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at timestamptz;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT NOW();

-- 2. Add idempotency key for duplicate prevention
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS idempotency_key text;

-- 3. Create unique constraint for idempotency (one notification per event per user)
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
  -- Constraint may already exist or fail on duplicates, skip
  NULL;
END $$;

-- 4. Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications (is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications (type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications (priority);
CREATE INDEX IF NOT EXISTS idx_notifications_actor ON notifications (actor_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON notifications (entity_type, entity_id);

-- 5. Compound index for user's unread notifications (most common query)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, is_read, created_at DESC);

-- 6. Index for idempotency lookup
CREATE INDEX IF NOT EXISTS idx_notifications_idempotency ON notifications (idempotency_key) WHERE idempotency_key IS NOT NULL;

-- 7. Add updated_at trigger
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
