import { query } from './db';

/* ─── Notification Types (Section 5) ─────────────────────── */

export type NotificationType =
  | 'LETTER_RECEIVED'
  | 'LETTER_REGISTERED'
  | 'LETTER_ROUTED'
  | 'LETTER_ASSIGNED'
  | 'LETTER_REASSIGNED'
  | 'LETTER_APPROVED'
  | 'LETTER_REJECTED'
  | 'CHANGES_REQUESTED'
  | 'RESPONSE_REQUIRED'
  | 'RESPONSE_CREATED'
  | 'TASK_ASSIGNED'
  | 'TASK_DUE_SOON'
  | 'TASK_OVERDUE'
  | 'TASK_COMPLETED'
  | 'DISPATCH_READY'
  | 'LETTER_DISPATCHED'
  | 'LETTER_DELIVERED'
  | 'LETTER_COMPLETED'
  | 'LETTER_ARCHIVED'
  | 'WORKFLOW_ESCALATED'
  | 'SYSTEM_NOTIFICATION'
  // Legacy types for backward compatibility
  | 'DOCUMENT_SUBMITTED'
  | 'DOCUMENT_APPROVED'
  | 'DOCUMENT_REJECTED'
  | 'DOCUMENT_ARCHIVED'
  | 'DOCUMENT_RESTORED'
  | 'COMMENT_ADDED';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

/* ─── Input Types ────────────────────────────────────────── */

interface CreateNotificationInput {
  recipientUserId: number;
  type: NotificationType;
  title?: string;
  message: string;
  entityType?: string;
  entityId?: number;
  letterId?: number;
  taskId?: number;
  actorUserId?: number;
  priority?: NotificationPriority;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
}

interface NotificationRow {
  id: number;
  user_id: number;
  type: string;
  title: string | null;
  message: string;
  is_read: boolean;
  read_at: Date | null;
  entity_type: string | null;
  entity_id: number | null;
  document_id: number | null;
  document_title: string | null;
  task_id: number | null;
  actor_user_id: number | null;
  priority: string;
  metadata: unknown;
  idempotency_key: string | null;
  created_at: Date;
  updated_at: Date;
}

/* ─── Duplicate Prevention (Section 31) ──────────────────── */

/**
 * Generate an idempotency key from notification context.
 * Ensures one notification per event per user.
 */
function generateIdempotencyKey(
  type: NotificationType,
  entityType: string,
  entityId: number,
  recipientUserId: number,
): string {
  return `${type}:${entityType}:${entityId}:${recipientUserId}`;
}

/* ─── Core Notification Creation (Sections 4, 31-32) ─────── */

/**
 * Create a notification with duplicate prevention.
 * Uses idempotency key to prevent the same event from creating multiple notifications.
 * Returns the created notification or null if duplicate was prevented.
 */
export async function createNotification(
  input: CreateNotificationInput,
): Promise<NotificationRow | null> {
  try {
    // Generate idempotency key if not provided
    const idempotencyKey = input.idempotencyKey || generateIdempotencyKey(
      input.type,
      input.entityType || 'LETTER',
      input.entityId || input.letterId || 0,
      input.recipientUserId,
    );

    const { rows } = await query(
      `INSERT INTO notifications (
        user_id, type, title, message, entity_type, entity_id,
        document_id, task_id, actor_user_id, priority, metadata, idempotency_key
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (user_id, type, document_id, idempotency_key) DO NOTHING
      RETURNING *`,
      [
        input.recipientUserId,
        input.type,
        input.title || generateTitle(input.type),
        input.message,
        input.entityType || 'LETTER',
        input.entityId || input.letterId || null,
        input.letterId || input.entityId || null,
        input.taskId || null,
        input.actorUserId || null,
        input.priority || 'NORMAL',
        input.metadata ? JSON.stringify(input.metadata) : null,
        idempotencyKey,
      ],
    );

    if (rows.length === 0) {
      // Duplicate prevented
      console.log(`[notification] Duplicate prevented: ${idempotencyKey}`);
      return null;
    }

    return rows[0] as NotificationRow;
  } catch (err: any) {
    // Handle unique constraint violation gracefully
    if (err.code === '23505') {
      console.log(`[notification] Duplicate prevented (constraint): ${input.type}`);
      return null;
    }
    // Don't let notification failures break business operations (Section 40)
    console.error(`[notification] Failed to create notification:`, err.message);
    return null;
  }
}

/* ─── Title Generator ────────────────────────────────────── */

function generateTitle(type: NotificationType): string {
  const titles: Record<string, string> = {
    LETTER_RECEIVED: 'New Letter Received',
    LETTER_REGISTERED: 'Letter Registered',
    LETTER_ROUTED: 'Letter Routed',
    LETTER_ASSIGNED: 'Letter Assigned',
    LETTER_REASSIGNED: 'Letter Reassigned',
    LETTER_APPROVED: 'Letter Approved',
    LETTER_REJECTED: 'Letter Rejected',
    CHANGES_REQUESTED: 'Changes Requested',
    RESPONSE_REQUIRED: 'Response Required',
    RESPONSE_CREATED: 'Response Created',
    TASK_ASSIGNED: 'New Task Assigned',
    TASK_DUE_SOON: 'Task Due Soon',
    TASK_OVERDUE: 'Task Overdue',
    TASK_COMPLETED: 'Task Completed',
    DISPATCH_READY: 'Ready for Dispatch',
    LETTER_DISPATCHED: 'Letter Dispatched',
    LETTER_DELIVERED: 'Letter Delivered',
    LETTER_COMPLETED: 'Letter Completed',
    LETTER_ARCHIVED: 'Letter Archived',
    WORKFLOW_ESCALATED: 'Workflow Escalated',
    SYSTEM_NOTIFICATION: 'System Notification',
    DOCUMENT_SUBMITTED: 'Document Submitted',
    DOCUMENT_APPROVED: 'Document Approved',
    DOCUMENT_REJECTED: 'Document Rejected',
    DOCUMENT_ARCHIVED: 'Document Archived',
    DOCUMENT_RESTORED: 'Document Restored',
    COMMENT_ADDED: 'New Comment',
  };
  return titles[type] || 'Notification';
}

/* ─── Workflow-Specific Notification Helpers (Sections 6-17) */

/**
 * Notify administrator when incoming letter is registered (Section 6).
 */
export async function notifyAdminLetterRegistered(
  letterId: number,
  letterRef: string,
  letterSubject: string,
  actorUserId: number,
  actorName: string,
): Promise<void> {
  // Find active admin
  const { rows: admins } = await query(
    `SELECT id FROM users WHERE role = 'ADMIN' AND is_active = true ORDER BY id ASC LIMIT 1`,
  );
  if (admins.length === 0) return;

  await createNotification({
    recipientUserId: (admins[0] as any).id,
    type: 'LETTER_REGISTERED',
    title: 'New Incoming Letter Requires Routing',
    message: `Incoming letter ${letterRef} "${letterSubject}" has been registered by ${actorName} and requires your routing action.`,
    entityType: 'LETTER',
    entityId: letterId,
    letterId,
    actorUserId,
    priority: 'HIGH',
    metadata: { letterRef, letterSubject, actorName },
  });
}

/**
 * Notify department manager when letter is routed to their department (Section 7).
 */
export async function notifyManagerLetterRouted(
  letterId: number,
  letterRef: string,
  letterSubject: string,
  departmentId: number,
  departmentName: string,
  actorUserId: number,
  actorName: string,
): Promise<void> {
  // Find department manager
  const { rows: managers } = await query(
    `SELECT id FROM users WHERE role = 'DEPARTMENT_MANAGER' AND department_id = $1 AND is_active = true`,
    [departmentId],
  );

  if (managers.length === 0) {
    // Fallback to admins
    const { rows: admins } = await query(
      `SELECT id FROM users WHERE role = 'ADMIN' AND is_active = true ORDER BY id ASC LIMIT 1`,
    );
    if (admins.length === 0) return;

    await createNotification({
      recipientUserId: (admins[0] as any).id,
      type: 'LETTER_ROUTED',
      title: 'Letter Routed',
      message: `Letter ${letterRef} "${letterSubject}" has been routed to ${departmentName}.`,
      entityType: 'LETTER',
      entityId: letterId,
      letterId,
      actorUserId,
      priority: 'NORMAL',
      metadata: { letterRef, departmentName, actorName },
    });
    return;
  }

  for (const manager of managers) {
    await createNotification({
      recipientUserId: (manager as any).id,
      type: 'LETTER_ROUTED',
      title: 'New Letter Routed to Your Department',
      message: `Letter ${letterRef} "${letterSubject}" has been routed to ${departmentName} by ${actorName}.`,
      entityType: 'LETTER',
      entityId: letterId,
      letterId,
      actorUserId,
      priority: 'HIGH',
      metadata: { letterRef, departmentName, actorName },
    });
  }
}

/**
 * Notify officer when letter is assigned to them (Section 8).
 */
export async function notifyOfficerLetterAssigned(
  letterId: number,
  letterRef: string,
  letterSubject: string,
  officerUserId: number,
  actorUserId: number,
  actorName: string,
  dueDate?: string,
): Promise<void> {
  await createNotification({
    recipientUserId: officerUserId,
    type: 'LETTER_ASSIGNED',
    title: 'Letter Assigned to You',
    message: `You have been assigned letter ${letterRef} "${letterSubject}" by ${actorName}.${dueDate ? ` Due: ${dueDate}.` : ''}`,
    entityType: 'LETTER',
    entityId: letterId,
    letterId,
    actorUserId,
    priority: 'HIGH',
    metadata: { letterRef, actorName, dueDate },
  });
}

/**
 * Notify manager when officer submits outgoing for approval (Section 11).
 */
export async function notifyManagerOutgoingSubmitted(
  letterId: number,
  letterRef: string,
  letterSubject: string,
  departmentId: number,
  actorUserId: number,
  actorName: string,
): Promise<void> {
  const { rows: managers } = await query(
    `SELECT id FROM users WHERE role = 'DEPARTMENT_MANAGER' AND department_id = $1 AND is_active = true`,
    [departmentId],
  );

  for (const manager of managers) {
    await createNotification({
      recipientUserId: (manager as any).id,
      type: 'DOCUMENT_SUBMITTED',
      title: 'Outgoing Letter Awaiting Review',
      message: `${actorName} submitted outgoing letter ${letterRef} "${letterSubject}" for your review and approval.`,
      entityType: 'LETTER',
      entityId: letterId,
      letterId,
      actorUserId,
      priority: 'NORMAL',
      metadata: { letterRef, actorName },
    });
  }
}

/**
 * Notify admin when manager approves outgoing letter (Section 12).
 */
export async function notifyAdminOutgoingApproved(
  letterId: number,
  letterRef: string,
  letterSubject: string,
  actorUserId: number,
  actorName: string,
): Promise<void> {
  const { rows: admins } = await query(
    `SELECT id FROM users WHERE role = 'ADMIN' AND is_active = true ORDER BY id ASC LIMIT 1`,
  );
  if (admins.length === 0) return;

  await createNotification({
    recipientUserId: (admins[0] as any).id,
    type: 'LETTER_APPROVED',
    title: 'Outgoing Letter Approved',
    message: `Outgoing letter ${letterRef} "${letterSubject}" has been approved by ${actorName} and requires registration.`,
    entityType: 'LETTER',
    entityId: letterId,
    letterId,
    actorUserId,
    priority: 'HIGH',
    metadata: { letterRef, actorName },
  });
}

/**
 * Notify officer when manager requests changes (Section 13).
 */
export async function notifyOfficerChangesRequested(
  letterId: number,
  letterRef: string,
  letterSubject: string,
  officerUserId: number,
  actorUserId: number,
  actorName: string,
  reason?: string,
): Promise<void> {
  await createNotification({
    recipientUserId: officerUserId,
    type: 'CHANGES_REQUESTED',
    title: 'Changes Requested',
    message: `${actorName} has requested changes for letter ${letterRef} "${letterSubject}".${reason ? ` Reason: ${reason}` : ''}`,
    entityType: 'LETTER',
    entityId: letterId,
    letterId,
    actorUserId,
    priority: 'HIGH',
    metadata: { letterRef, reason, actorName },
  });
}

/**
 * Notify dispatch officer when letter is ready for dispatch (Section 14).
 */
export async function notifyDispatchReady(
  letterId: number,
  letterRef: string,
  letterSubject: string,
  actorUserId: number,
  actorName: string,
): Promise<void> {
  // Find registry/dispatch officers
  const { rows: officers } = await query(
    `SELECT id FROM users WHERE role = 'REGISTRY_OFFICER' AND is_active = true`,
  );

  for (const officer of officers) {
    await createNotification({
      recipientUserId: (officer as any).id,
      type: 'DISPATCH_READY',
      title: 'Letter Ready for Dispatch',
      message: `Letter ${letterRef} "${letterSubject}" has been registered by ${actorName} and is ready for dispatch.`,
      entityType: 'LETTER',
      entityId: letterId,
      letterId,
      actorUserId,
      priority: 'NORMAL',
      metadata: { letterRef, actorName },
    });
  }
}

/**
 * Notify responsible user when letter is dispatched (Section 15).
 */
export async function notifyLetterDispatched(
  letterId: number,
  letterRef: string,
  letterSubject: string,
  authorId: number | null,
  actorUserId: number,
  actorName: string,
): Promise<void> {
  if (authorId) {
    await createNotification({
      recipientUserId: authorId,
      type: 'LETTER_DISPATCHED',
      title: 'Letter Dispatched',
      message: `Letter ${letterRef} "${letterSubject}" has been dispatched by ${actorName}.`,
      entityType: 'LETTER',
      entityId: letterId,
      letterId,
      actorUserId,
      priority: 'NORMAL',
      metadata: { letterRef, actorName },
    });
  }
}

/**
 * Notify when letter is completed (Section 9, 17).
 */
export async function notifyLetterCompleted(
  letterId: number,
  letterRef: string,
  letterSubject: string,
  authorId: number | null,
  actorUserId: number,
): Promise<void> {
  if (authorId && authorId !== actorUserId) {
    await createNotification({
      recipientUserId: authorId,
      type: 'LETTER_COMPLETED',
      title: 'Letter Completed',
      message: `Letter ${letterRef} "${letterSubject}" has been marked as completed.`,
      entityType: 'LETTER',
      entityId: letterId,
      letterId,
      actorUserId,
      priority: 'LOW',
      metadata: { letterRef },
    });
  }
}

/**
 * Notify when letter is archived (Section 17).
 */
export async function notifyLetterArchived(
  letterId: number,
  letterRef: string,
  letterSubject: string,
  authorId: number | null,
  actorUserId: number,
): Promise<void> {
  if (authorId && authorId !== actorUserId) {
    await createNotification({
      recipientUserId: authorId,
      type: 'LETTER_ARCHIVED',
      title: 'Letter Archived',
      message: `Letter ${letterRef} "${letterSubject}" has been archived.`,
      entityType: 'LETTER',
      entityId: letterId,
      letterId,
      actorUserId,
      priority: 'LOW',
      metadata: { letterRef },
    });
  }
}

/**
 * Notify when task is created (Section 18).
 */
export async function notifyTaskCreated(
  taskId: number,
  letterId: number,
  letterRef: string,
  taskType: string,
  taskTitle: string,
  recipientUserId: number,
  actorUserId: number,
  actorName: string,
): Promise<void> {
  await createNotification({
    recipientUserId,
    type: 'TASK_ASSIGNED',
    title: taskTitle,
    message: `New task "${taskTitle}" created for letter ${letterRef}. Action required.`,
    entityType: 'TASK',
    entityId: taskId,
    letterId,
    taskId,
    actorUserId,
    priority: 'HIGH',
    metadata: { letterRef, taskType, actorName },
  });
}

/**
 * Notify when task is completed (Section 18).
 */
export async function notifyTaskCompleted(
  taskId: number,
  letterId: number,
  letterRef: string,
  taskTitle: string,
  recipientUserId: number,
  actorUserId: number,
): Promise<void> {
  await createNotification({
    recipientUserId,
    type: 'TASK_COMPLETED',
    title: 'Task Completed',
    message: `Task "${taskTitle}" for letter ${letterRef} has been completed.`,
    entityType: 'TASK',
    entityId: taskId,
    letterId,
    taskId,
    actorUserId,
    priority: 'NORMAL',
    metadata: { letterRef },
  });
}

/**
 * Notify when task is overdue (Section 20).
 */
export async function notifyTaskOverdue(
  taskId: number,
  letterId: number,
  letterRef: string,
  taskTitle: string,
  recipientUserId: number,
): Promise<void> {
  await createNotification({
    recipientUserId,
    type: 'TASK_OVERDUE',
    title: 'Task Overdue',
    message: `Task "${taskTitle}" for letter ${letterRef} is now overdue and requires immediate attention.`,
    entityType: 'TASK',
    entityId: taskId,
    letterId,
    taskId,
    priority: 'URGENT',
    metadata: { letterRef },
  });
}

/**
 * Notify when changes are requested on approval (Section 13).
 */
export async function notifyApprovalChangesRequested(
  letterId: number,
  letterRef: string,
  letterSubject: string,
  submitterUserId: number,
  actorUserId: number,
  actorName: string,
  reason?: string,
): Promise<void> {
  await createNotification({
    recipientUserId: submitterUserId,
    type: 'CHANGES_REQUESTED',
    title: 'Changes Requested on Your Submission',
    message: `${actorName} has requested changes for letter ${letterRef} "${letterSubject}".${reason ? ` Reason: ${reason}` : ''}`,
    entityType: 'LETTER',
    entityId: letterId,
    letterId,
    actorUserId,
    priority: 'HIGH',
    metadata: { letterRef, reason, actorName },
  });
}

/* ─── Legacy Compatibility ────────────────────────────────── */

/**
 * Backward-compatible createNotification for existing code.
 * Maps old-style calls to the new system.
 */
export async function createNotificationLegacy(input: {
  userId: number;
  type: NotificationType;
  message: string;
  documentId?: number;
  documentTitle?: string;
}): Promise<NotificationRow | null> {
  return createNotification({
    recipientUserId: input.userId,
    type: input.type,
    message: input.message,
    entityType: 'LETTER',
    entityId: input.documentId,
    letterId: input.documentId,
  });
}

/**
 * Notify every department manager of a department (falls back to admins).
 * Legacy function kept for backward compatibility.
 */
export async function notifyDepartmentManagers(
  departmentId: number | null,
  type: NotificationType,
  message: string,
  documentId?: number,
  documentTitle?: string,
): Promise<void> {
  let { rows } = await query(
    `SELECT id FROM users WHERE role = 'DEPARTMENT_MANAGER' AND department_id = $1`,
    [departmentId],
  );
  if (rows.length === 0) {
    const admins = await query(`SELECT id FROM users WHERE role = 'ADMIN'`);
    rows = admins.rows;
  }
  await Promise.all(
    rows.map((r) =>
      createNotificationLegacy({
        userId: r.id as number,
        type,
        message,
        documentId,
        documentTitle,
      }),
    ),
  );
}
