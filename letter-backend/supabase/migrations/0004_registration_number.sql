-- Migration 0004: Add registration_number column to documents for outgoing letter reference tracking

ALTER TABLE documents ADD COLUMN IF NOT EXISTS registration_number text;

CREATE INDEX IF NOT EXISTS idx_documents_letter_type ON documents (letter_type);
CREATE INDEX IF NOT EXISTS idx_documents_registration_number ON documents (registration_number);
