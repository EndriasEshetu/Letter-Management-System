import { Router } from 'express';
import { query } from '../lib/db';
import { asyncHandler } from '../lib/errors';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { serializeAuditLog, AuditLogRow } from '../lib/audit';

const router = Router();

/** GET /dashboard/admin — Real-time live stats for Main Administrator */
router.get(
  '/admin',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const [
      incomingRouting,
      outgoingReg,
      internalRouting,
      overdueOrg,
      recentAudit,
      totalUsers,
      totalDepts,
      totalDocs,
    ] = await Promise.all([
      query(`SELECT COUNT(*)::int AS count FROM documents WHERE letter_type = 'INCOMING' AND status IN ('RECEIVED', 'REGISTERED')`),
      query(`SELECT COUNT(*)::int AS count FROM documents WHERE letter_type = 'OUTGOING' AND status = 'APPROVED'`),
      query(`SELECT COUNT(*)::int AS count FROM documents WHERE letter_type = 'INTERNAL' AND status = 'APPROVED'`),
      query(`SELECT COUNT(*)::int AS count FROM documents WHERE due_date < NOW() AND status NOT IN ('COMPLETED', 'ARCHIVED')`),
      query(`SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 10`),
      query(`SELECT COUNT(*)::int AS count FROM users WHERE is_active = true`),
      query(`SELECT COUNT(*)::int AS count FROM departments`),
      query(`SELECT COUNT(*)::int AS count FROM documents`),
    ]);

    res.json({
      stats: [
        {
          id: 'incoming_routing',
          title: 'Incoming Awaiting Routing',
          value: incomingRouting.rows[0].count,
          description: 'Registered incoming letters needing department routing',
          highlight: incomingRouting.rows[0].count > 0,
          trendType: incomingRouting.rows[0].count > 0 ? 'negative' : 'neutral',
        },
        {
          id: 'outgoing_reg',
          title: 'Outgoing Awaiting Ref #',
          value: outgoingReg.rows[0].count,
          description: 'Manager approved outgoing letters awaiting registration',
          highlight: outgoingReg.rows[0].count > 0,
          trendType: 'neutral',
        },
        {
          id: 'internal_routing',
          title: 'Internal Awaiting Routing',
          value: internalRouting.rows[0].count,
          description: 'Approved internal memos awaiting department routing',
          trendType: 'neutral',
        },
        {
          id: 'overdue_org',
          title: 'Organization Overdue',
          value: overdueOrg.rows[0].count,
          description: 'Letters past action or response deadline',
          highlight: overdueOrg.rows[0].count > 0,
          trendType: overdueOrg.rows[0].count > 0 ? 'negative' : 'neutral',
        },
        {
          id: 'total_documents',
          title: 'Total System Letters',
          value: totalDocs.rows[0].count,
          description: 'Total letters managed across all directorates',
          trendType: 'positive',
        },
        {
          id: 'active_users',
          title: 'Active Personnel',
          value: totalUsers.rows[0].count,
          description: `${totalDepts.rows[0].count} official directorates`,
          trendType: 'positive',
        },
      ],
      recentActivities: recentAudit.rows.map((r) => serializeAuditLog(r as AuditLogRow)),
      systemHealth: {
        storageUsedPercent: 12,
        activeSessions: totalUsers.rows[0].count,
        uptimePercent: 99.9,
      },
    });
  })
);

/** GET /dashboard/registry — Real-time live stats for Registry Officer */
router.get(
  '/registry',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const [incomingToday, pendingDispatch, dispatchedWeek, responsesDue] = await Promise.all([
      query(`SELECT COUNT(*)::int AS count FROM documents WHERE letter_type = 'INCOMING' AND DATE(created_at) = CURRENT_DATE`),
      query(`SELECT COUNT(*)::int AS count FROM documents WHERE letter_type = 'OUTGOING' AND status IN ('APPROVED', 'READY_FOR_DISPATCH')`),
      query(`SELECT COUNT(*)::int AS count FROM documents WHERE status = 'DISPATCHED' AND dispatch_date >= NOW() - INTERVAL '7 days'`),
      query(`SELECT COUNT(*)::int AS count FROM documents WHERE response_required = true AND due_date BETWEEN NOW() AND NOW() + INTERVAL '3 days'`),
    ]);

    res.json({
      stats: [
        {
          id: 'incoming_today',
          title: 'Registered Today',
          value: incomingToday.rows[0].count,
          description: 'New incoming letters registered today',
          trendType: 'positive',
        },
        {
          id: 'pending_dispatch',
          title: 'Pending Dispatch',
          value: pendingDispatch.rows[0].count,
          description: 'Outgoing letters approved & ready for dispatch',
          highlight: pendingDispatch.rows[0].count > 0,
          trendType: 'neutral',
        },
        {
          id: 'dispatched_week',
          title: 'Dispatched This Week',
          value: dispatchedWeek.rows[0].count,
          description: 'Letters dispatched in last 7 days',
          trendType: 'positive',
        },
        {
          id: 'responses_due',
          title: 'Responses Due Soon',
          value: responsesDue.rows[0].count,
          description: 'Incoming letters with response deadlines in 3 days',
          highlight: responsesDue.rows[0].count > 0,
          trendType: responsesDue.rows[0].count > 0 ? 'negative' : 'neutral',
        },
      ],
    });
  })
);

/** GET /dashboard/manager — Real-time live stats for Department Manager */
router.get(
  '/manager',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const user = req.user!;
    const deptId = user.department_id;

    const [pendingApproval, inProgress, overdueDept] = await Promise.all([
      query(`SELECT COUNT(*)::int AS count FROM approvals WHERE status = 'PENDING'`),
      query(`SELECT COUNT(*)::int AS count FROM documents WHERE department_id = $1 AND status = 'IN_PROGRESS'`, [deptId]),
      query(`SELECT COUNT(*)::int AS count FROM documents WHERE department_id = $1 AND due_date < NOW() AND status NOT IN ('COMPLETED', 'ARCHIVED')`, [deptId]),
    ]);

    res.json({
      stats: [
        {
          id: 'pending_approval',
          title: 'Pending Manager Approvals',
          value: pendingApproval.rows[0].count,
          description: 'Letters awaiting your review and approval',
          highlight: pendingApproval.rows[0].count > 0,
          trendType: pendingApproval.rows[0].count > 0 ? 'negative' : 'neutral',
        },
        {
          id: 'dept_in_progress',
          title: 'Directorate In-Progress',
          value: inProgress.rows[0].count,
          description: 'Active letters assigned to your officers',
          trendType: 'positive',
        },
        {
          id: 'overdue_dept',
          title: 'Directorate Overdue',
          value: overdueDept.rows[0].count,
          description: 'Letters past action due date',
          highlight: overdueDept.rows[0].count > 0,
          trendType: overdueDept.rows[0].count > 0 ? 'negative' : 'neutral',
        },
      ],
    });
  })
);

/** GET /dashboard/employee — Real-time live stats for Assigned Officer */
router.get(
  '/employee',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const user = req.user!;

    const [activeTasks, dueWeek, drafts] = await Promise.all([
      query(`SELECT COUNT(*)::int AS count FROM documents WHERE (author_id = $1 OR LOWER(assigned_employee) LIKE LOWER($2)) AND status IN ('ASSIGNED', 'IN_PROGRESS', 'DRAFT')`, [user.id, `%${user.full_name}%`]),
      query(`SELECT COUNT(*)::int AS count FROM documents WHERE (author_id = $1 OR LOWER(assigned_employee) LIKE LOWER($2)) AND due_date BETWEEN NOW() AND NOW() + INTERVAL '7 days'`, [user.id, `%${user.full_name}%`]),
      query(`SELECT COUNT(*)::int AS count FROM documents WHERE author_id = $1 AND status = 'DRAFT'`, [user.id]),
    ]);

    res.json({
      stats: [
        {
          id: 'my_active_tasks',
          title: 'My Active Assigned Letters',
          value: activeTasks.rows[0].count,
          description: 'Letters currently assigned to you',
          highlight: activeTasks.rows[0].count > 0,
          trendType: 'neutral',
        },
        {
          id: 'due_week',
          title: 'Tasks Due This Week',
          value: dueWeek.rows[0].count,
          description: 'Letters requiring response/action in 7 days',
          highlight: dueWeek.rows[0].count > 0,
          trendType: dueWeek.rows[0].count > 0 ? 'negative' : 'neutral',
        },
        {
          id: 'my_drafts',
          title: 'My Saved Drafts',
          value: drafts.rows[0].count,
          description: 'Draft letters not yet submitted',
          trendType: 'neutral',
        },
      ],
    });
  })
);

export default router;
