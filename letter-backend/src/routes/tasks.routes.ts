import { Router } from 'express';
import { query } from '../lib/db';
import { ApiError } from '../lib/errors';
import { asyncHandler } from '../lib/errors';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { formatDisplayDate, toNumber } from '../lib/utils';
import {
  getTaskById,
  getTasksForUser,
  getTaskSummary,
  startTask,
  claimTask,
  completeTask,
  cancelTask,
  TaskWithRelations,
} from '../lib/tasks';

const router = Router();

/* ─── Task Serializer ────────────────────────────────────── */

function serializeTask(task: TaskWithRelations) {
  // Calculate is_overdue
  const isOverdue = task.due_date
    ? new Date(task.due_date) < new Date() && ['PENDING', 'IN_PROGRESS', 'CLAIMED'].includes(task.status)
    : false;

  // Calculate days remaining
  let daysRemaining: number | null = null;
  let hoursRemaining: number | null = null;
  if (task.due_date) {
    const now = new Date();
    const due = new Date(task.due_date);
    const diffMs = due.getTime() - now.getTime();
    daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    hoursRemaining = Math.ceil(diffMs / (1000 * 60 * 60));
  }

  return {
    id: String(task.id),
    type: task.task_type,
    title: task.title,
    description: task.description ?? undefined,
    actionRequired: task.action_required,
    status: task.status,
    
    letter: {
      id: String(task.letter_id),
      referenceNumber: task.letter_document_number,
      type: task.letter_letter_type,
      status: task.letter_status,
      subject: task.letter_title,
      sender: task.letter_sender ?? undefined,
      recipient: task.letter_recipient ?? undefined,
      priority: task.letter_priority,
      department: task.letter_department_name ?? undefined,
      createdBy: task.letter_created_by,
    },
    
    requestedBy: {
      id: task.source_user_id ? String(task.source_user_id) : undefined,
      name: task.source_user_full_name ?? undefined,
      role: task.source_role ?? undefined,
    },
    
    sourceDepartment: {
      id: task.source_department_id ? String(task.source_department_id) : undefined,
      name: task.source_department_name ?? undefined,
    },
    
    targetDepartment: {
      id: task.target_department_id ? String(task.target_department_id) : undefined,
      name: task.target_department_name ?? undefined,
    },
    
    assignedTo: task.assigned_user_full_name ?? undefined,
    
    priority: task.priority,
    dueDate: task.due_date ? formatDisplayDate(task.due_date) : undefined,
    isOverdue,
    daysRemaining,
    hoursRemaining,
    
    slaHours: task.sla_hours ?? undefined,
    
    workflow: {
      previousStep: task.source_role ?? 'UNKNOWN',
      currentStep: task.assigned_role,
      nextStep: task.target_department_name ?? 'UNKNOWN',
    },
    
    permissions: {
      canExecute: true, // Will be validated at action time
      canClaim: task.status === 'PENDING' && !task.claimed_by,
      canCancel: ['PENDING', 'IN_PROGRESS', 'CLAIMED'].includes(task.status),
    },
    
    claimedBy: task.claimed_by ? String(task.claimed_by) : undefined,
    claimedAt: task.claimed_at ? formatDisplayDate(task.claimed_at) : undefined,
    
    isRead: task.is_read,
    readAt: task.read_at ? formatDisplayDate(task.read_at) : undefined,
    
    createdAt: formatDisplayDate(task.created_at),
    updatedAt: formatDisplayDate(task.updated_at),
  };
}

/* ─── GET /tasks/my — Get current user's tasks ───────────── */

router.get(
  '/my',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const user = req.user!;
    
    const {
      status,
      type: taskType,
      priority,
      letterType,
      search,
      overdue,
      page: pageStr,
      limit: limitStr,
      sort,
    } = req.query as Record<string, string | undefined>;
    
    const result = await getTasksForUser(user.id, user.role, {
      status,
      taskType,
      priority,
      letterType,
      search,
      overdue: overdue === 'true',
      page: toNumber(pageStr, 1),
      limit: toNumber(limitStr, 20),
      sort,
    });
    
    res.json({
      data: result.data.map(serializeTask),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  }),
);

/* ─── GET /tasks/my/summary — Get task summary ───────────── */

router.get(
  '/my/summary',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const user = req.user!;
    const summary = await getTaskSummary(user.id, user.role);
    res.json(summary);
  }),
);

/* ─── GET /tasks/:id — Get task details ──────────────────── */

router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const taskId = Number(req.params.id);
    if (!Number.isFinite(taskId)) {
      throw ApiError.badRequest('Invalid task id.');
    }
    
    const task = await getTaskById(taskId);
    if (!task) {
      throw ApiError.notFound('Task not found.');
    }
    
    // Authorization check: admin can see all admin tasks, others only their own
    const user = req.user!;
    if (user.role !== 'ADMIN' && task.assigned_to !== user.id) {
      throw ApiError.forbidden('You do not have access to this task.');
    }
    
    // Mark as read if not already
    if (!task.is_read) {
      await startTask(taskId, user.id);
    }
    
    res.json(serializeTask(task));
  }),
);

/* ─── POST /tasks/:id/claim — Claim a task ───────────────── */

router.post(
  '/:id/claim',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const taskId = Number(req.params.id);
    if (!Number.isFinite(taskId)) {
      throw ApiError.badRequest('Invalid task id.');
    }
    
    const user = req.user!;
    const success = await claimTask(taskId, user.id);
    
    if (!success) {
      throw ApiError.badRequest('Unable to claim this task. It may already be claimed or not available.');
    }
    
    const task = await getTaskById(taskId);
    res.json({
      message: 'Task claimed successfully.',
      task: task ? serializeTask(task) : null,
    });
  }),
);

/* ─── POST /tasks/:id/start — Start working on a task ────── */

router.post(
  '/:id/start',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const taskId = Number(req.params.id);
    if (!Number.isFinite(taskId)) {
      throw ApiError.badRequest('Invalid task id.');
    }
    
    const user = req.user!;
    const success = await startTask(taskId, user.id);
    
    if (!success) {
      throw ApiError.badRequest('Unable to start this task. It may not be in a startable state.');
    }
    
    const task = await getTaskById(taskId);
    res.json({
      message: 'Task started.',
      task: task ? serializeTask(task) : null,
    });
  }),
);

/* ─── POST /tasks/:id/cancel — Cancel a task ─────────────── */

router.post(
  '/:id/cancel',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const taskId = Number(req.params.id);
    if (!Number.isFinite(taskId)) {
      throw ApiError.badRequest('Invalid task id.');
    }
    
    const { reason } = req.body || {};
    const success = await cancelTask(taskId, reason);
    
    if (!success) {
      throw ApiError.badRequest('Unable to cancel this task. It may already be completed or cancelled.');
    }
    
    res.json({ message: 'Task cancelled.' });
  }),
);

/* ─── POST /tasks/:id/complete — Complete a task ─────────── */
/* NOTE: This endpoint is for administrative task completion only.
   Business actions (route, register, etc.) should complete tasks
   through their respective endpoints in documents.routes.ts */

router.post(
  '/:id/complete',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const taskId = Number(req.params.id);
    if (!Number.isFinite(taskId)) {
      throw ApiError.badRequest('Invalid task id.');
    }
    
    const user = req.user!;
    const { action, details } = req.body || {};
    
    if (!action) {
      throw ApiError.badRequest('Action description is required.');
    }
    
    const success = await completeTask(taskId, user.id, action, details);
    
    if (!success) {
      throw ApiError.badRequest('Unable to complete this task. It may not be in a completable state.');
    }
    
    const task = await getTaskById(taskId);
    res.json({
      message: 'Task completed successfully.',
      task: task ? serializeTask(task) : null,
    });
  }),
);

/* ─── GET /tasks/overdue — Get overdue tasks (admin) ──────── */

router.get(
  '/overdue',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const user = req.user!;
    const result = await getTasksForUser(user.id, user.role, {
      status: 'OVERDUE',
      page: toNumber(req.query.page, 1),
      limit: toNumber(req.query.limit, 20),
    });
    
    res.json({
      data: result.data.map(serializeTask),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  }),
);

/* ─── GET /tasks/stats — Get task statistics (admin) ──────── */

router.get(
  '/stats',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (_req, res) => {
    const { rows } = await query(`
      SELECT
        task_type,
        status,
        COUNT(*)::int AS count
      FROM admin_tasks
      WHERE assigned_role = 'ADMIN'
      GROUP BY task_type, status
      ORDER BY task_type, status
    `);
    
    const stats: Record<string, Record<string, number>> = {};
    for (const row of rows) {
      const r = row as any;
      if (!stats[r.task_type]) {
        stats[r.task_type] = {};
      }
      stats[r.task_type][r.status] = r.count;
    }
    
    res.json(stats);
  }),
);

export default router;
