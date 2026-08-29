-- Migration 0007: Create admin_tasks table for workflow-driven task system
-- This migration adds proper task entities that track administrative actions
-- required by the Main Administrator.

-- 1. Create task types enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_type') THEN
    CREATE TYPE task_type AS ENUM (
      'ROUTE_INCOMING',
      'REGISTER_OUTGOING',
      'REGISTER_INTERNAL',
      'ROUTE_INTERNAL',
      'REVIEW_REGISTRATION',
      'PREPARE_DISPATCH',
      'DISPATCH_EXCEPTION',
      'DELIVERY_EXCEPTION',
      'RESPONSE_REVIEW',
      'ADMINISTRATIVE_REQUEST',
      'WORKFLOW_ESCALATION',
      'OVERDUE_ACTION'
    );
  END IF;
END $$;

-- 2. Create task status enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM (
      'PENDING',
      'IN_PROGRESS',
      'CLAIMED',
      'COMPLETED',
      'CANCELLED',
      'EXPIRED'
    );
  END IF;
END $$;

-- 3. Create admin_tasks table
CREATE TABLE IF NOT EXISTS admin_tasks (
  id BIGSERIAL PRIMARY KEY,
  
  -- Letter reference
  letter_id BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  
  -- Task type and status
  task_type task_type NOT NULL,
  status task_status NOT NULL DEFAULT 'PENDING',
  
  -- Task metadata
  title TEXT NOT NULL,
  description TEXT,
  action_required TEXT NOT NULL,
  
  -- Assignment
  assigned_to BIGINT REFERENCES users(id) ON DELETE SET NULL,
  assigned_role TEXT NOT NULL DEFAULT 'ADMIN',
  
  -- Source information (who triggered this task)
  source_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  source_role TEXT,
  source_department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
  
  -- Target department
  target_department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
  
  -- Priority and timing
  priority TEXT NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  due_date TIMESTAMPTZ,
  sla_hours INTEGER,
  
  -- Completion tracking
  completed_at TIMESTAMPTZ,
  completed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  
  -- Claiming support (for multiple administrators)
  claimed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,
  
  -- Read state
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  read_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Idempotency constraint: prevent duplicate active tasks for same letter+type
  CONSTRAINT unique_active_task_per_letter_type UNIQUE (letter_id, task_type, status)
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_tasks_letter ON admin_tasks (letter_id);
CREATE INDEX IF NOT EXISTS idx_admin_tasks_assigned_to ON admin_tasks (assigned_to);
CREATE INDEX IF NOT EXISTS idx_admin_tasks_assigned_role ON admin_tasks (assigned_role);
CREATE INDEX IF NOT EXISTS idx_admin_tasks_status ON admin_tasks (status);
CREATE INDEX IF NOT EXISTS idx_admin_tasks_task_type ON admin_tasks (task_type);
CREATE INDEX IF NOT EXISTS idx_admin_tasks_priority ON admin_tasks (priority);
CREATE INDEX IF NOT EXISTS idx_admin_tasks_due_date ON admin_tasks (due_date);
CREATE INDEX IF NOT EXISTS idx_admin_tasks_created_at ON admin_tasks (created_at DESC);

-- 5. Create index for overdue detection
CREATE INDEX IF NOT EXISTS idx_admin_tasks_overdue ON admin_tasks (due_date, status) 
  WHERE status IN ('PENDING', 'IN_PROGRESS', 'CLAIMED');

-- 6. Create index for task summary queries
CREATE INDEX IF NOT EXISTS idx_admin_tasks_summary ON admin_tasks (status, task_type, priority, due_date);

-- 7. Add task reference to audit_logs
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS task_id BIGINT REFERENCES admin_tasks(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_task ON audit_logs (task_id);

-- 8. Add task reference to notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS task_id BIGINT REFERENCES admin_tasks(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_task ON notifications (task_id);

-- 9. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_admin_tasks_updated_at ON admin_tasks;
CREATE TRIGGER trigger_admin_tasks_updated_at
  BEFORE UPDATE ON admin_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_tasks_updated_at();

-- 11. Create function to prevent duplicate active tasks
CREATE OR REPLACE FUNCTION prevent_duplicate_active_tasks()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if an active task already exists for this letter and type
  IF NEW.status IN ('PENDING', 'IN_PROGRESS', 'CLAIMED') THEN
    IF EXISTS (
      SELECT 1 FROM admin_tasks 
      WHERE letter_id = NEW.letter_id 
        AND task_type = NEW.task_type 
        AND status IN ('PENDING', 'IN_PROGRESS', 'CLAIMED')
        AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'Active task already exists for letter % with type %', NEW.letter_id, NEW.task_type;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. Create trigger for duplicate prevention
DROP TRIGGER IF EXISTS trigger_prevent_duplicate_active_tasks ON admin_tasks;
CREATE TRIGGER trigger_prevent_duplicate_active_tasks
  BEFORE INSERT OR UPDATE ON admin_tasks
  FOR EACH ROW
  EXECUTE FUNCTION prevent_duplicate_active_tasks();
