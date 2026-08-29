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
  checkOverdueTasks,
  reconcileOrphanedTasks,
  TaskWithRelations,
  TaskError,
} from '../lib/tasks';

const router = Router();

/* ─── Task Serializer ────────────────────────────────────── */

function serializeTask(task: TaskWithRelations) {
  const isOverdue = task.due_date
    ? new Date(task.due_date) < new Date() && ['PENDING', 'IN_PROGRESS', 'CLAIMED'].includes(task.status)
    : false;

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
      canExecute: true,
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

/* ─── Authorization Helpers (Sections 32, 48) ─────────────── */

/** Assert the user owns or has access to this task */
function assertTaskAccess(task: TaskWithRelations, user: AuthenticatedRequest['user']) {
  if (!user) throw TaskError.forbidden();
  if (user.role === 'ADMIN') return; // Admin can access all admin tasks
  if (task.assigned_to === user.id) return;
  if (task.assigned_role === user.role) return;
  throw TaskError.forbidden('You do not have access to this task.');
}

/** Assert the user is an authorized administrator */
function assertAdmin(user: AuthenticatedRequest['user']) {
  if (!user || user.role !== 'ADMIN') {
    throw TaskError.forbidden('Only administrators can perform this action.');
  }
}

/* ─── Error Handler Middleware ────────────────────────────── */

function handleTaskErrors(err: any, _req: any, res: any, next: any) {
  if (err instanceof TaskError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }
  next(err);
}

/* ─── GET /tasks/my — Get current user's tasks (Section 18) ─ */

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

/* ─── GET /tasks/my/summary — Task summary (Section 20) ──── */

router.get(
  '/my/summary',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const user = req.user!;
    const summary = await getTaskSummary(user.id, user.role);
    res.json(summary);
  }),
);

/* ─── POST /tasks/escalate — Run overdue escalation (Section 43) ── */

router.post(
  '/escalate',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (_req: AuthenticatedRequest, res) => {
    const expiredCount = await checkOverdueTasks();
    const reconciledCount = await reconcileOrphanedTasks();
    res.json({
      message: `Escalation complete: ${expiredCount} tasks expired, ${reconciledCount} orphaned tasks cancelled.`,
      expiredCount,
      reconciledCount,
    });
  }),
);

/* ─── GET /tasks/overdue — Get overdue tasks (Section 42) ─── */

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

/* ─── GET /tasks/stats — Task statistics (admin) ─────────── */

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

/* ─── GET /tasks/:id — Get task details (Section 19) ─────── */

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

    // Authorization (Section 32, 48)
    assertTaskAccess(task, req.user);

    // Mark as read if not already (Section 40)
    if (!task.is_read) {
      await startTask(taskId, req.user!.id);
      // Reload to get updated read state
      const updated = await getTaskById(taskId);
      if (updated) {
        return res.json(serializeTask(updated));
      }
    }

    res.json(serializeTask(task));
  }),
);

/* ─── POST /tasks/:id/claim — Claim a task (Section 29) ──── */

router.post(
  '/:id/claim',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const taskId = Number(req.params.id);
    if (!Number.isFinite(taskId)) {
      throw ApiError.badRequest('Invalid task id.');
    }

    // Validate task exists and is claimable
    const task = await getTaskById(taskId);
    if (!task) {
      throw ApiError.notFound('Task not found.');
    }
    assertAdmin(req.user);

    if (task.status !== 'PENDING') {
      return res.status(409).json({
        success: false,
        message: 'Task is not in a claimable state.',
        code: 'TASK_NOT_CLAIMABLE',
      });
    }

    if (task.claimed_by && task.claimed_by !== req.user!.id) {
      return res.status(409).json({
        success: false,
        message: 'Task is already claimed by another administrator.',
        code: 'TASK_ALREADY_CLAIMED',
      });
    }

    const success = await claimTask(taskId, req.user!.id);
    if (!success) {
      throw ApiError.badRequest('Unable to claim this task.');
    }

    const updated = await getTaskById(taskId);
    res.json({
      message: 'Task claimed successfully.',
      task: updated ? serializeTask(updated) : null,
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

    const task = await getTaskById(taskId);
    if (!task) {
      throw ApiError.notFound('Task not found.');
    }
    assertTaskAccess(task, req.user);

    const success = await startTask(taskId, req.user!.id);
    if (!success) {
      return res.status(409).json({
        success: false,
        message: 'Task is not in a startable state.',
        code: 'INVALID_WORKFLOW_TRANSITION',
      });
    }

    const updated = await getTaskById(taskId);
    res.json({
      message: 'Task started.',
      task: updated ? serializeTask(updated) : null,
    });
  }),
);

/* ─── POST /tasks/:id/cancel — Cancel a task (Section 44) ── */

router.post(
  '/:id/cancel',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const taskId = Number(req.params.id);
    if (!Number.isFinite(taskId)) {
      throw ApiError.badRequest('Invalid task id.');
    }

    const task = await getTaskById(taskId);
    if (!task) {
      throw ApiError.notFound('Task not found.');
    }
    assertAdmin(req.user);

    if (['COMPLETED', 'CANCELLED'].includes(task.status)) {
      return res.status(409).json({
        success: false,
        message: 'Task is already completed or cancelled.',
        code: 'TASK_ALREADY_COMPLETED',
      });
    }

    const { reason } = req.body || {};
    const success = await cancelTask(taskId, reason);

    if (!success) {
      throw ApiError.badRequest('Unable to cancel this task.');
    }

    res.json({ message: 'Task cancelled.' });
  }),
);

/* ─── POST /tasks/:id/complete — Complete a task ─────────── */
/* NOTE: Business actions (route, register, dispatch) should complete
   tasks through their respective endpoints in documents.routes.ts */

router.post(
  '/:id/complete',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const taskId = Number(req.params.id);
    if (!Number.isFinite(taskId)) {
      throw ApiError.badRequest('Invalid task id.');
    }

    const task = await getTaskById(taskId);
    if (!task) {
      throw ApiError.notFound('Task not found.');
    }
    assertAdmin(req.user);

    if (!['PENDING', 'IN_PROGRESS', 'CLAIMED'].includes(task.status)) {
      return res.status(409).json({
        success: false,
        message: 'Task is not in a completable state.',
        code: 'TASK_NOT_COMPLETABLE',
      });
    }

    const { action, details } = req.body || {};
    if (!action || typeof action !== 'string') {
      throw ApiError.badRequest('Action description is required.');
    }

    const success = await completeTask(taskId, req.user!.id, action, details);
    if (!success) {
      throw ApiError.badRequest('Unable to complete this task.');
    }

    const updated = await getTaskById(taskId);
    res.json({
      message: 'Task completed successfully.',
      task: updated ? serializeTask(updated) : null,
    });
  }),
);

/* ─── Apply task error handler ────────────────────────────── */
router.use(handleTaskErrors);

export default router;
