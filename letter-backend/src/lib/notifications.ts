import { query } from './db';

export type NotificationType =
  | 'DOCUMENT_SUBMITTED'
  | 'DOCUMENT_APPROVED'
  | 'DOCUMENT_REJECTED'
  | 'CHANGES_REQUESTED'
  | 'COMMENT_ADDED'
  | 'DOCUMENT_ARCHIVED';

interface CreateNotificationInput {
  userId: number;
  type: NotificationType;
  message: string;
  documentId?: number;
  documentTitle?: string;
}

/** Insert a notification row for a single user. */
export async function createNotification(input: CreateNotificationInput) {
  await query(
    `INSERT INTO notifications (user_id, type, message, document_id, document_title)
     VALUES ($1, $2, $3, $4, $5)`,
    [input.userId, input.type, input.message, input.documentId ?? null, input.documentTitle ?? null]
  );
}

/** Notify every department manager of a department (falls back to admins). */
export async function notifyDepartmentManagers(
  departmentId: number | null,
  type: NotificationType,
  message: string,
  documentId?: number,
  documentTitle?: string
) {
  let { rows } = await query(
    `SELECT id FROM users WHERE role = 'DEPARTMENT_MANAGER' AND department_id = $1`,
    [departmentId]
  );
  if (rows.length === 0) {
    const admins = await query(`SELECT id FROM users WHERE role = 'ADMIN'`);
    rows = admins.rows;
  }
  await Promise.all(
    rows.map((r) =>
      createNotification({ userId: r.id as number, type, message, documentId, documentTitle })
    )
  );
}
