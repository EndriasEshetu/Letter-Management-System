import { query } from './db';
import { logAudit } from './audit';
import { createNotification } from './notifications';

/* ─── Types ──────────────────────────────────────────────── */

export type TaskType =
  | 'ROUTE_INCOMING'
  | 'REGISTER_OUTGOING'
  | 'REGISTER_INTERNAL'
  | 'ROUTE_INTERNAL'
  | 'REVIEW_REGISTRATION'
  | 'PREPARE_DISPATCH'
  | 'DISPATCH_EXCEPTION'
  | 'DELIVERY_EXCEPTION'
  | 'RESPONSE_REVIEW'
  | 'ADMINISTRATIVE_REQUEST'
  | 'WORKFLOW_ESCALATION'
  | 'OVERDUE_ACTION';

export type TaskStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'CLAIMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED';

export type TaskPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface CreateTaskInput {
  letterId: number;
  taskType: TaskType;
  title: string;
  description?: string;
  actionRequired: string;
  assignedRole?: string;
  sourceUserId?: number;
  sourceRole?: string;
  sourceDepartmentId?: number;
  targetDepartmentId?: number;
  priority?: TaskPriority;
  dueDate?: Date;
  slaHours?: number;
}

export interface TaskRow {
  id: number;
  letter_id: number;
  task_type: TaskType;
  status: TaskStatus;
  title: string;
  description: string | null;
  action_required: string;
  assigned_to: number | null;
  assigned_role: string;
  source_user_id: number | null;
  source_role: string | null;
  source_department_id: number | null;
  target_department_id: number | null;
  priority: TaskPriority;
  due_date: Date | null;
  sla_hours: number | null;
  completed_at: Date | null;
  completed_by: number | null;
  claimed_by: number | null;
  claimed_at: Date | null;
  is_read: boolean;
  read_at: Date | null;
  read_by: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface TaskWithRelations extends TaskRow {
  // Letter fields
  letter_document_number: string;
  letter_title: string;
  letter_letter_type: string;
  letter_status: string;
  letter_sender: string | null;
  letter_recipient: string | null;
  letter_priority: string;
  letter_department_name: string | null;
  letter_created_by: string;
  
  // Source user fields
  source_user_full_name: string | null;
  source_user_role: string | null;
  
  // Source department fields
  source_department_name: string | null;
  
  // Target department fields
  target_department_name: string | null;
  
  // Assigned user fields
  assigned_user_full_name: string | null;
}

/* ─── Task Creation ──────────────────────────────────────── */

/**
 * Create a new admin task. Uses idempotency constraint to prevent duplicates.
 * Returns the created task or null if a duplicate was detected.
 */
export async function createTask(input: CreateTaskInput): Promise<TaskRow | null> {
  try {
    const { rows } = await query(
      `INSERT INTO admin_tasks (
        letter_id, task_type, title, description, action_required,
        assigned_role, source_user_id, source_role, source_department_id,
        target_department_id, priority, due_date, sla_hours
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        input.letterId,
        input.taskType,
        input.title,
        input.description || null,
        input.actionRequired,
        input.assignedRole || 'ADMIN',
        input.sourceUserId || null,
        input.sourceRole || null,
        input.sourceDepartmentId || null,
        input.targetDepartmentId || null,
        input.priority || 'NORMAL',
        input.dueDate || null,
        input.slaHours || null,
      ]
    );
    
    const task = rows[0] as TaskRow;
    
    // Log audit
    await logAudit({
      userId: input.sourceUserId || null,
      userName: input.sourceRole || 'SYSTEM',
      action: 'ADMIN_TASK_CREATED',
      entityType: 'TASK',
      entityId: task.id,
      newStatus: 'PENDING',
      details: {
        taskId: task.id,
        letterId: input.letterId,
        taskType: input.taskType,
        title: input.title,
      },
    });
    
    // Create notification for admin
    await createNotification({
      userId: input.assignedRole === 'ADMIN' ? 1 : (input.sourceUserId || 1), // Fallback to admin
      type: 'DOCUMENT_SUBMITTED',
      message: `${input.title}: ${input.description || input.actionRequired}`,
      documentId: input.letterId,
    });
    
    return task;
  } catch (err: any) {
    // Handle unique constraint violation (duplicate task)
    if (err.code === '23505') {
      console.log(`[task] Duplicate task prevented for letter ${input.letterId} type ${input.taskType}`);
      return null;
    }
    throw err;
  }
}

/* ─── Task Completion ────────────────────────────────────── */

/**
 * Complete a task after a successful business action.
 * Validates that the task exists and is in a completable state.
 */
export async function completeTask(
  taskId: number,
  completedBy: number,
  action: string,
  details?: Record<string, unknown>
): Promise<boolean> {
  const { rows: existing } = await query(
    `SELECT * FROM admin_tasks WHERE id = $1`,
    [taskId]
  );
  
  if (existing.length === 0) {
    console.warn(`[task] Task ${taskId} not found for completion`);
    return false;
  }
  
  const task = existing[0] as TaskRow;
  
  // Only allow completing tasks in PENDING, IN_PROGRESS, or CLAIMED status
  if (!['PENDING', 'IN_PROGRESS', 'CLAIMED'].includes(task.status)) {
    console.warn(`[task] Cannot complete task ${taskId} in status ${task.status}`);
    return false;
  }
  
  await query(
    `UPDATE admin_tasks 
     SET status = 'COMPLETED', 
         completed_at = NOW(), 
         completed_by = $2,
         updated_at = NOW()
     WHERE id = $1`,
    [taskId, completedBy]
  );
  
  // Log audit
  await logAudit({
    userId: completedBy,
    userName: action,
    action: 'ADMIN_TASK_COMPLETED',
    entityType: 'TASK',
    entityId: taskId,
    previousStatus: task.status,
    newStatus: 'COMPLETED',
    details: {
      taskId,
      letterId: task.letter_id,
      taskType: task.task_type,
      ...details,
    },
  });
  
  return true;
}

/* ─── Task Status Updates ────────────────────────────────── */

/**
 * Update task status to IN_PROGRESS when opened/viewed.
 */
export async function startTask(taskId: number, userId: number): Promise<boolean> {
  const { rows: existing } = await query(
    `SELECT * FROM admin_tasks WHERE id = $1`,
    [taskId]
  );
  
  if (existing.length === 0) return false;
  
  const task = existing[0] as TaskRow;
  if (task.status !== 'PENDING') return false;
  
  await query(
    `UPDATE admin_tasks 
     SET status = 'IN_PROGRESS', 
         is_read = true,
         read_at = NOW(),
         read_by = $2,
         updated_at = NOW()
     WHERE id = $1`,
    [taskId, userId]
  );
  
  await logAudit({
    userId,
    userName: 'TASK_OPENED',
    action: 'ADMIN_TASK_STARTED',
    entityType: 'TASK',
    entityId: taskId,
    previousStatus: 'PENDING',
    newStatus: 'IN_PROGRESS',
  });
  
  return true;
}

/**
 * Claim a task (for multiple administrator support).
 */
export async function claimTask(taskId: number, userId: number): Promise<boolean> {
  const { rows: existing } = await query(
    `SELECT * FROM admin_tasks WHERE id = $1`,
    [taskId]
  );
  
  if (existing.length === 0) return false;
  
  const task = existing[0] as TaskRow;
  if (task.status !== 'PENDING') return false;
  
  // Check if already claimed by another admin
  if (task.claimed_by && task.claimed_by !== userId) {
    return false;
  }
  
  await query(
    `UPDATE admin_tasks 
     SET status = 'CLAIMED',
         claimed_by = $2,
         claimed_at = NOW(),
         assigned_to = $2,
         updated_at = NOW()
     WHERE id = $1`,
    [taskId, userId]
  );
  
  await logAudit({
    userId,
    userName: 'TASK_CLAIMED',
    action: 'ADMIN_TASK_CLAIMED',
    entityType: 'TASK',
    entityId: taskId,
    previousStatus: task.status,
    newStatus: 'CLAIMED',
  });
  
  return true;
}

/**
 * Cancel a task (e.g., when letter is deleted/cancelled).
 */
export async function cancelTask(taskId: number, reason?: string): Promise<boolean> {
  const { rows: existing } = await query(
    `SELECT * FROM admin_tasks WHERE id = $1`,
    [taskId]
  );
  
  if (existing.length === 0) return false;
  
  const task = existing[0] as TaskRow;
  if (['COMPLETED', 'CANCELLED'].includes(task.status)) return false;
  
  await query(
    `UPDATE admin_tasks 
     SET status = 'CANCELLED',
         updated_at = NOW()
     WHERE id = $1`,
    [taskId]
  );
  
  await logAudit({
    userId: null,
    userName: 'SYSTEM',
    action: 'ADMIN_TASK_CANCELLED',
    entityType: 'TASK',
    entityId: taskId,
    previousStatus: task.status,
    newStatus: 'CANCELLED',
    details: { reason: reason || 'Letter workflow changed' },
  });
  
  return true;
}

/* ─── Workflow-Driven Task Generation ────────────────────── */

/**
 * Generate administrator tasks based on letter workflow transitions.
 * This is the centralized task generation mechanism.
 */
export async function generateTasksForWorkflow(
  letterId: number,
  previousStatus: string,
  newStatus: string,
  triggeredBy: {
    userId: number;
    role: string;
    departmentId?: number;
  }
): Promise<void> {
  // Get letter details
  const { rows: letterRows } = await query(
    `SELECT * FROM documents WHERE id = $1`,
    [letterId]
  );
  
  if (letterRows.length === 0) {
    console.warn(`[task] Letter ${letterId} not found for task generation`);
    return;
  }
  
  const letter = letterRows[0] as any;
  const letterType = letter.letter_type || 'INCOMING';
  
  // Determine what task to create based on workflow transition
  let taskType: TaskType | null = null;
  let title = '';
  let description = '';
  let actionRequired = '';
  let priority: TaskPriority = letter.priority || 'NORMAL';
  
  // Calculate due date (default: 3 days for NORMAL, 1 day for HIGH/URGENT)
  let dueDate = new Date();
  if (priority === 'URGENT') {
    dueDate.setDate(dueDate.getDate() + 1);
  } else if (priority === 'HIGH') {
    dueDate.setDate(dueDate.getDate() + 2);
  } else {
    dueDate.setDate(dueDate.getDate() + 3);
  }
  
  // INCOMING LETTER WORKFLOW
  if (letterType === 'INCOMING') {
    // Registry Officer registers incoming -> Admin needs to route
    if (previousStatus === 'RECEIVED' && newStatus === 'REGISTERED') {
      taskType = 'ROUTE_INCOMING';
      title = 'Route Incoming Letter';
      description = `Incoming letter "${letter.title}" has been registered and needs to be routed to the appropriate department.`;
      actionRequired = 'Select the destination department for this registered incoming letter.';
    }
    // Other incoming transitions that might need admin action
    else if (newStatus === 'RESPONSE_REQUIRED') {
      taskType = 'RESPONSE_REVIEW';
      title = 'Review Response Requirement';
      description = `Letter "${letter.title}" requires a response. Review and initiate response workflow.`;
      actionRequired = 'Review the response requirement and initiate outgoing response workflow.';
      priority = 'HIGH';
    }
  }
  
  // OUTGOING LETTER WORKFLOW
  else if (letterType === 'OUTGOING') {
    // Manager approves outgoing -> Admin needs to register
    if (previousStatus === 'PENDING_APPROVAL' && newStatus === 'APPROVED') {
      // Check if there's an approval record
      const { rows: approvalRows } = await query(
        `SELECT * FROM approvals WHERE document_id = $1 AND status = 'APPROVED'`,
        [letterId]
      );
      
      if (approvalRows.length > 0) {
        taskType = 'REGISTER_OUTGOING';
        title = 'Register Outgoing Letter';
        description = `Outgoing letter "${letter.title}" has been approved and needs to be registered with an official reference number.`;
        actionRequired = 'Verify the approved letter and assign its official outgoing reference number.';
      }
    }
  }
  
  // INTERNAL LETTER WORKFLOW
  else if (letterType === 'INTERNAL') {
    // Manager approves internal -> Admin needs to register and route
    if (previousStatus === 'PENDING_APPROVAL' && newStatus === 'APPROVED') {
      // Check if there's an approval record
      const { rows: approvalRows } = await query(
        `SELECT * FROM approvals WHERE document_id = $1 AND status = 'APPROVED'`,
        [letterId]
      );
      
      if (approvalRows.length > 0) {
        taskType = 'REGISTER_INTERNAL';
        title = 'Register & Route Internal Letter';
        description = `Internal letter "${letter.title}" has been approved and needs to be registered and routed to the receiving department.`;
        actionRequired = 'Register this internal letter and route it to the appropriate department.';
      }
    }
  }
  
  // Create the task if we determined one is needed
  if (taskType) {
    await createTask({
      letterId,
      taskType,
      title,
      description,
      actionRequired,
      assignedRole: 'ADMIN',
      sourceUserId: triggeredBy.userId,
      sourceRole: triggeredBy.role,
      sourceDepartmentId: triggeredBy.departmentId,
      priority,
      dueDate,
    });
  }
}

/* ─── Task Query Helpers ─────────────────────────────────── */

/**
 * Get task by ID with all relations.
 */
export async function getTaskById(taskId: number): Promise<TaskWithRelations | null> {
  const { rows } = await query(
    `SELECT t.*,
       d.document_number AS letter_document_number,
       d.title AS letter_title,
       d.letter_type AS letter_letter_type,
       d.status AS letter_status,
       d.sender AS letter_sender,
       d.recipient AS letter_recipient,
       d.priority AS letter_priority,
       d.department_name AS letter_department_name,
       d.created_by AS letter_created_by,
       su.full_name AS source_user_full_name,
       su.role AS source_user_role,
       sd.name AS source_department_name,
       td.name AS target_department_name,
       au.full_name AS assigned_user_full_name
     FROM admin_tasks t
     JOIN documents d ON d.id = t.letter_id
     LEFT JOIN users su ON su.id = t.source_user_id
     LEFT JOIN departments sd ON sd.id = t.source_department_id
     LEFT JOIN departments td ON td.id = t.target_department_id
     LEFT JOIN users au ON au.id = t.assigned_to
     WHERE t.id = $1`,
    [taskId]
  );
  
  return rows.length > 0 ? (rows[0] as TaskWithRelations) : null;
}

/**
 * Get tasks for a specific user (admin tasks).
 */
export async function getTasksForUser(
  userId: number,
  role: string,
  filters: {
    status?: string;
    taskType?: string;
    priority?: string;
    letterType?: string;
    search?: string;
    overdue?: boolean;
    page?: number;
    limit?: number;
    sort?: string;
  } = {}
): Promise<{ data: TaskWithRelations[]; total: number; page: number; limit: number; totalPages: number }> {
  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 20, 100);
  const offset = (page - 1) * limit;
  
  const where: string[] = [];
  const params: unknown[] = [];
  
  // Role-based filtering
  if (role === 'ADMIN') {
    // Admin sees all admin tasks
    where.push(`t.assigned_role = 'ADMIN'`);
  } else {
    // Other roles see tasks assigned to them specifically
    where.push(`t.assigned_to = $${params.length + 1}`);
    params.push(userId);
  }
  
  // Status filter
  if (filters.status && filters.status !== 'ALL') {
    if (filters.status === 'OVERDUE') {
      where.push(`t.due_date < NOW() AND t.status IN ('PENDING', 'IN_PROGRESS', 'CLAIMED')`);
    } else {
      where.push(`t.status = $${params.length + 1}`);
      params.push(filters.status);
    }
  }
  
  // Task type filter
  if (filters.taskType && filters.taskType !== 'ALL') {
    where.push(`t.task_type = $${params.length + 1}`);
    params.push(filters.taskType);
  }
  
  // Priority filter
  if (filters.priority && filters.priority !== 'ALL') {
    where.push(`t.priority = $${params.length + 1}`);
    params.push(filters.priority);
  }
  
  // Letter type filter
  if (filters.letterType && filters.letterType !== 'ALL') {
    where.push(`d.letter_type = $${params.length + 1}`);
    params.push(filters.letterType);
  }
  
  // Search filter
  if (filters.search) {
    const searchTerm = `%${filters.search.toLowerCase()}%`;
    where.push(`(
      LOWER(d.document_number) LIKE $${params.length + 1} OR
      LOWER(d.title) LIKE $${params.length + 2} OR
      LOWER(d.sender) LIKE $${params.length + 3} OR
      LOWER(d.recipient) LIKE $${params.length + 4} OR
      LOWER(t.title) LIKE $${params.length + 5} OR
      LOWER(su.full_name) LIKE $${params.length + 6}
    )`);
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }
  
  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  
  // Count query
  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM admin_tasks t
    JOIN documents d ON d.id = t.letter_id
    LEFT JOIN users su ON su.id = t.source_user_id
    ${whereSql}
  `;
  
  // Data query with sorting
  let orderSql = 'ORDER BY ';
  if (filters.sort) {
    orderSql += filters.sort;
  } else {
    // Default sort: overdue first, then by priority, then by due date, then by creation date
    orderSql += `
      CASE WHEN t.due_date < NOW() AND t.status IN ('PENDING', 'IN_PROGRESS', 'CLAIMED') THEN 0 ELSE 1 END,
      CASE t.priority WHEN 'URGENT' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'NORMAL' THEN 3 ELSE 4 END,
      t.due_date NULLS LAST,
      t.created_at ASC
    `;
  }
  
  const dataQuery = `
    SELECT t.*,
       d.document_number AS letter_document_number,
       d.title AS letter_title,
       d.letter_type AS letter_letter_type,
       d.status AS letter_status,
       d.sender AS letter_sender,
       d.recipient AS letter_recipient,
       d.priority AS letter_priority,
       d.department_name AS letter_department_name,
       d.created_by AS letter_created_by,
       su.full_name AS source_user_full_name,
       su.role AS source_user_role,
       sd.name AS source_department_name,
       td.name AS target_department_name,
       au.full_name AS assigned_user_full_name
     FROM admin_tasks t
     JOIN documents d ON d.id = t.letter_id
     LEFT JOIN users su ON su.id = t.source_user_id
     LEFT JOIN departments sd ON sd.id = t.source_department_id
     LEFT JOIN departments td ON td.id = t.target_department_id
     LEFT JOIN users au ON au.id = t.assigned_to
     ${whereSql}
     ${orderSql}
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;
  
  const countParams = [...params];
  const dataParams = [...params, limit, offset];
  
  const [{ rows: countRows }, { rows: dataRows }] = await Promise.all([
    query(countQuery, countParams),
    query(dataQuery, dataParams),
  ]);
  
  const total = (countRows[0] as { total: number }).total;
  
  return {
    data: dataRows as TaskWithRelations[],
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

/**
 * Get task summary for a user.
 */
export async function getTaskSummary(userId: number, role: string) {
  let whereClause = '';
  const params: unknown[] = [];
  
  if (role === 'ADMIN') {
    whereClause = `WHERE assigned_role = 'ADMIN'`;
  } else {
    whereClause = `WHERE assigned_to = $1`;
    params.push(userId);
  }
  
  const { rows } = await query(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE status = 'PENDING')::int AS pending,
       COUNT(*) FILTER (WHERE status = 'IN_PROGRESS')::int AS in_progress,
       COUNT(*) FILTER (WHERE status = 'CLAIMED')::int AS claimed,
       COUNT(*) FILTER (WHERE status = 'COMPLETED')::int AS completed,
       COUNT(*) FILTER (WHERE status = 'CANCELLED')::int AS cancelled,
       COUNT(*) FILTER (WHERE due_date < NOW() AND status IN ('PENDING', 'IN_PROGRESS', 'CLAIMED'))::int AS overdue,
       COUNT(*) FILTER (WHERE due_date::date = CURRENT_DATE AND status IN ('PENDING', 'IN_PROGRESS', 'CLAIMED'))::int AS due_today,
       COUNT(*) FILTER (WHERE priority = 'URGENT' AND status IN ('PENDING', 'IN_PROGRESS', 'CLAIMED'))::int AS urgent,
       COUNT(*) FILTER (WHERE priority = 'HIGH' AND status IN ('PENDING', 'IN_PROGRESS', 'CLAIMED'))::int AS high
     FROM admin_tasks
     ${whereClause}`,
    params
  );
  
  const summary = rows[0] as {
    total: number;
    pending: number;
    in_progress: number;
    claimed: number;
    completed: number;
    cancelled: number;
    overdue: number;
    due_today: number;
    urgent: number;
    high: number;
  };
  
  // Get by letter type
  const { rows: byTypeRows } = await query(
    `SELECT 
       d.letter_type,
       COUNT(*)::int AS count
     FROM admin_tasks t
     JOIN documents d ON d.id = t.letter_id
     ${whereClause.replace('assigned_role', 't.assigned_role').replace('assigned_to', 't.assigned_to')}
     AND t.status IN ('PENDING', 'IN_PROGRESS', 'CLAIMED')
     GROUP BY d.letter_type`,
    params
  );
  
  const byType: Record<string, number> = {};
  for (const row of byTypeRows) {
    byType[(row as any).letter_type] = (row as any).count;
  }
  
  return {
    total: summary.total,
    pending: summary.pending,
    inProgress: summary.in_progress,
    claimed: summary.claimed,
    completed: summary.completed,
    cancelled: summary.cancelled,
    overdue: summary.overdue,
    dueToday: summary.due_today,
    urgent: summary.urgent,
    high: summary.high,
    byType,
  };
}

/**
 * Check for overdue tasks and escalate if needed.
 * This should be called by a scheduled job.
 */
export async function checkOverdueTasks(): Promise<number> {
  const { rows } = await query(
    `UPDATE admin_tasks 
     SET status = 'EXPIRED',
         updated_at = NOW()
     WHERE due_date < NOW() 
       AND status IN ('PENDING', 'IN_PROGRESS', 'CLAIMED')
     RETURNING id, letter_id, task_type, title`
  );
  
  for (const task of rows) {
    await logAudit({
      userId: null,
      userName: 'SYSTEM',
      action: 'ADMIN_TASK_EXPIRED',
      entityType: 'TASK',
      entityId: (task as any).id,
      previousStatus: 'PENDING',
      newStatus: 'EXPIRED',
      details: {
        taskId: (task as any).id,
        letterId: (task as any).letter_id,
        taskType: (task as any).task_type,
      },
    });
  }
  
  return rows.length;
}
