ALTER TABLE documents ADD COLUMN IF NOT EXISTS assigned_employee_id bigint REFERENCES users (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_documents_author ON documents (author_id);
CREATE INDEX IF NOT EXISTS idx_documents_assigned_employee_id ON documents (assigned_employee_id);
CREATE INDEX IF NOT EXISTS idx_documents_assigned_employee ON documents (assigned_employee);