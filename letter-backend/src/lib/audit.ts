import { query } from './db';

export interface LogAuditInput {
  userId?: number | null;
  userName: string;
  action: string;
  entityType?: string;
  entityId: number;
  previousStatus?: string | null;
  newStatus?: string | null;
  details?: Record<string, unknown> | null;
}

/**
 * Record an audit log entry in the database.
 * Every important letter action (create, route, assign, approve, dispatch, status change) must call this.
 */
export async function logAudit(input: LogAuditInput): Promise<void> {
  try {
    await query(
      `INSERT INTO audit_logs
         (user_id, user_name, action, entity_type, entity_id, previous_status, new_status, details, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        input.userId ?? null,
        input.userName,
        input.action,
        input.entityType || 'LETTER',
        input.entityId,
        input.previousStatus ?? null,
        input.newStatus ?? null,
        input.details ? JSON.stringify(input.details) : null,
      ]
    );
  } catch (err) {
    console.error('[audit] Failed to write audit log:', err);
  }
}

export interface AuditLogRow {
  id: number;
  user_id: number | null;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: number;
  previous_status: string | null;
  new_status: string | null;
  details: unknown;
  timestamp: Date;
}

export function serializeAuditLog(row: AuditLogRow) {
  return {
    id: String(row.id),
    userId: row.user_id ? String(row.user_id) : undefined,
    userName: row.user_name,
    action: row.action,
    entityType: row.entity_type,
    entityId: String(row.entity_id),
    previousStatus: row.previous_status ?? undefined,
    newStatus: row.new_status ?? undefined,
    details: row.details ?? undefined,
    timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : String(row.timestamp),
  };
}
