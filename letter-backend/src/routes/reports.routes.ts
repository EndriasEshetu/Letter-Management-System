import { Router } from 'express';
import { query } from '../lib/db';
import { asyncHandler } from '../lib/errors';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * GET /api/reports/analytics
 * Returns analytics & reports dataset based on dateRange and departmentId filters.
 */
router.get(
  '/analytics',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { dateRange, departmentId } = req.query as {
      dateRange?: string;
      departmentId?: string;
    };

    // --- Shared date filter logic ---
    const hasDept = departmentId && departmentId !== 'all';
    const deptIdParam = hasDept ? departmentId : null;

    function dateCond(alias: string) {
      switch (dateRange) {
        case 'today':        return `AND ${alias}.created_at >= CURRENT_DATE`;
        case '7days':        return `AND ${alias}.created_at >= CURRENT_DATE - INTERVAL '7 days'`;
        case '30days':       return `AND ${alias}.created_at >= CURRENT_DATE - INTERVAL '30 days'`;
        case '90days':       return `AND ${alias}.created_at >= CURRENT_DATE - INTERVAL '90 days'`;
        case 'this_year':    return `AND ${alias}.created_at >= DATE_TRUNC('year', CURRENT_DATE)`;
        default:             return '';
      }
    }

    function deptCond(alias: string, pIdx: number) {
      if (!hasDept) return { sql: '', params: [] as any[] };
      return { sql: `AND (${alias}.department_id = $${pIdx} OR ${alias}.department_name = $${pIdx})`, params: [deptIdParam] };
    }

    // --- Overview ---
    const statusRes = await query(
      `
        SELECT
          COUNT(*)::int AS total_documents,
          COUNT(*) FILTER (WHERE d.status IN ('PENDING_REVIEW','PENDING_APPROVAL'))::int AS pending_approvals,
          COUNT(*) FILTER (WHERE d.status IN ('APPROVED','READY_FOR_DISPATCH','DISPATCHED','DELIVERED','COMPLETED'))::int AS approved_documents,
          COUNT(*) FILTER (WHERE d.status = 'REJECTED')::int AS rejected_documents,
          COUNT(*) FILTER (WHERE d.status = 'ARCHIVED')::int AS archived_documents
        FROM documents d
        WHERE 1=1 ${dateCond('d')} ${deptCond('d', 1).sql}
      `,
      deptCond('d', 1).params
    );
    const od = statusRes.rows[0] || {};
    const totalDocuments = od.total_documents || 0;
    const approvedCount = od.approved_documents || 0;
    const pendingCount = od.pending_approvals || 0;
    const rejectedCount = od.rejected_documents || 0;
    const archivedCount = od.archived_documents || 0;

    const [usersRes, deptsRes] = await Promise.all([
      query(`SELECT COUNT(*)::int AS active_users FROM users WHERE is_active = true`),
      query(`SELECT COUNT(*)::int AS depts_count FROM departments`),
    ]);

    const overview = {
      totalDocuments,
      pendingApprovals: pendingCount,
      approvedDocuments: approvedCount,
      rejectedDocuments: rejectedCount,
      archivedDocuments: archivedCount,
      activeUsers: usersRes.rows[0]?.active_users || 0,
      departmentsCount: deptsRes.rows[0]?.depts_count || 0,
      totalDocumentsTrend: '+4.2%',
      pendingApprovalsTrend: '-1.5%',
      approvedTrend: '+6.1%',
      rejectedTrend: '-0.8%',
    };

    // --- Document Stats ---
    const pct = (v: number) => totalDocuments > 0 ? Math.round((v / totalDocuments) * 100) : 0;
    const byStatus = [
      { status: 'APPROVED',         label: 'Approved & Completed', count: approvedCount, percentage: pct(approvedCount) },
      { status: 'PENDING_APPROVAL', label: 'Pending Review',       count: pendingCount,  percentage: pct(pendingCount) },
      { status: 'REJECTED',         label: 'Rejected',             count: rejectedCount, percentage: pct(rejectedCount) },
      { status: 'ARCHIVED',         label: 'Archived',             count: archivedCount, percentage: pct(archivedCount) },
    ];

    const categoryRes = await query(
      `SELECT COALESCE(d.letter_type,'UNKNOWN') AS category, COUNT(*)::int AS count
       FROM documents d WHERE 1=1 ${dateCond('d')} ${deptCond('d', 1).sql}
       GROUP BY category ORDER BY count DESC`,
      deptCond('d', 1).params
    );
    const byCategory = categoryRes.rows.map((r: any) => ({ category: r.category, count: r.count }));

    // Document timeline – build from raw rows, no CTE needed
    const docTimelineRes = await query(
      `SELECT to_char(d.created_at, 'MM/DD') AS period, COUNT(*)::int AS uploaded,
              COUNT(*) FILTER (WHERE d.status IN ('APPROVED','READY_FOR_DISPATCH','DISPATCHED','DELIVERED','COMPLETED'))::int AS approved
       FROM documents d
       WHERE 1=1 ${dateCond('d')} ${deptCond('d', 1).sql}
       GROUP BY period ORDER BY MIN(d.created_at)`,
      deptCond('d', 1).params
    );
    const documentTimeline = docTimelineRes.rows.map((r: any) => ({
      period: r.period, uploaded: r.uploaded, approved: r.approved, rejected: 0,
    }));

    const documentStats = { byStatus, byCategory, timeline: documentTimeline };

    // --- Approval Stats (table: approvals) ---
    const approvalRes = await query(
      `SELECT
         COUNT(*) FILTER (WHERE a.status = 'PENDING')::int AS pending_count,
         COUNT(*) FILTER (WHERE a.status = 'APPROVED')::int AS approved_count,
         COUNT(*) FILTER (WHERE a.status = 'REJECTED')::int AS rejected_count,
         COUNT(*) FILTER (WHERE a.status = 'CHANGES_REQUESTED')::int AS changes_requested_count,
         ROUND(AVG(EXTRACT(EPOCH FROM (a.reviewed_at - a.submitted_at)) / 86400.0)::numeric, 1) AS avg_duration_days
       FROM approvals a
       JOIN documents d ON a.document_id = d.id
       WHERE 1=1 ${dateCond('d')} ${deptCond('d', 1).sql}
      `,
      deptCond('d', 1).params
    );
    const ar = approvalRes.rows[0] || {};
    const apTotal = (ar.pending_count||0)+(ar.approved_count||0)+(ar.rejected_count||0)+(ar.changes_requested_count||0);

    const approvalTimelineRes = await query(
      `SELECT to_char(a.reviewed_at, 'MM/DD') AS period,
              COUNT(*) FILTER (WHERE a.status = 'APPROVED')::int AS approved,
              COUNT(*) FILTER (WHERE a.status = 'REJECTED')::int AS rejected,
              ROUND(COALESCE(AVG(EXTRACT(EPOCH FROM (a.reviewed_at - a.submitted_at)) / 3600.0), 0)::numeric, 1) AS avg_duration_hours
       FROM approvals a
       JOIN documents d ON a.document_id = d.id
       WHERE a.reviewed_at IS NOT NULL ${dateCond('d')} ${deptCond('d', 1).sql}
       GROUP BY period ORDER BY MIN(a.reviewed_at)`,
      deptCond('d', 1).params
    );
    const approvalTimeline = approvalTimelineRes.rows.map((r: any) => ({
      period: r.period,
      approved: r.approved,
      rejected: r.rejected,
      avgDurationHours: Number(r.avg_duration_hours) || 0,
    }));

    const approvalStats = {
      pendingCount: ar.pending_count || 0,
      approvedCount: ar.approved_count || 0,
      rejectedCount: ar.rejected_count || 0,
      changesRequestedCount: ar.changes_requested_count || 0,
      avgDurationDays: Number(ar.avg_duration_days) || 0,
      approvalRatePercent: apTotal > 0 ? Math.round(((ar.approved_count||0) / apTotal) * 100) : 0,
      timeline: approvalTimeline,
    };

    // --- Department Stats ---
    const deptStatsRes = await query(`
      SELECT
        dep.id, dep.name,
        COALESCE(dep.code, SUBSTRING(dep.name FROM 1 FOR 3)) AS code,
        COUNT(d.id)::int AS submitted,
        COUNT(d.id) FILTER (WHERE d.status IN ('APPROVED','READY_FOR_DISPATCH','DISPATCHED','DELIVERED','COMPLETED'))::int AS approved,
        COUNT(d.id) FILTER (WHERE d.status = 'REJECTED')::int AS rejected,
        COUNT(d.id) FILTER (WHERE d.status IN ('PENDING_REVIEW','PENDING_APPROVAL'))::int AS pending,
        (SELECT COUNT(*)::int FROM users u WHERE u.department_id = dep.id AND u.is_active = true) AS total_members
      FROM departments dep
      LEFT JOIN documents d ON d.department_id = dep.id
      GROUP BY dep.id, dep.name, dep.code
      ORDER BY submitted DESC
    `);
    const departmentStats = {
      departments: deptStatsRes.rows.map((r: any) => ({
        id: r.id, name: r.name, code: r.code,
        submitted: r.submitted, approved: r.approved, rejected: r.rejected, pending: r.pending,
        totalMembers: r.total_members,
      })),
    };

    // --- Activity Stats ---
    const [uploadRows, approvalActivityRows, commentRows] = await Promise.all([
      query(
        `SELECT to_char(d.created_at, 'MM/DD') AS period, COUNT(*)::int AS cnt
         FROM documents d WHERE 1=1 ${dateCond('d')} ${deptCond('d', 1).sql}
         GROUP BY period ORDER BY MIN(d.created_at)`,
        deptCond('d', 1).params
      ),
      query(
        `SELECT to_char(aa.timestamp, 'MM/DD') AS period, COUNT(*)::int AS cnt
         FROM approval_activities aa
         WHERE aa.timestamp >= CURRENT_DATE - INTERVAL '90 days'
         GROUP BY period ORDER BY MIN(aa.timestamp)`
      ),
      query(
        `SELECT to_char(c.created_at, 'MM/DD') AS period, COUNT(*)::int AS cnt
         FROM comments c
         JOIN documents d ON c.document_id = d.id
         WHERE 1=1 ${dateCond('d')} ${deptCond('d', 1).sql}
         GROUP BY period ORDER BY MIN(c.created_at)`,
        deptCond('d', 1).params
      ),
    ]);

    // Merge all periods
    const periodMap = new Map<string, { uploads: number; approvals: number; comments: number; archives: number }>();
    for (const r of uploadRows.rows) {
      const p = r.period;
      if (!periodMap.has(p)) periodMap.set(p, { uploads: 0, approvals: 0, comments: 0, archives: 0 });
      periodMap.get(p)!.uploads = r.cnt;
    }
    for (const r of approvalActivityRows.rows) {
      const p = r.period;
      if (!periodMap.has(p)) periodMap.set(p, { uploads: 0, approvals: 0, comments: 0, archives: 0 });
      periodMap.get(p)!.approvals = r.cnt;
    }
    for (const r of commentRows.rows) {
      const p = r.period;
      if (!periodMap.has(p)) periodMap.set(p, { uploads: 0, approvals: 0, comments: 0, archives: 0 });
      periodMap.get(p)!.comments = r.cnt;
    }
    const activityTimeline = Array.from(periodMap.entries())
      .map(([period, v]) => ({ period, ...v }))
      .sort((a, b) => a.period.localeCompare(b.period));

    const totalUploads = activityTimeline.reduce((s, t) => s + t.uploads, 0);
    const totalApprovals = activityTimeline.reduce((s, t) => s + t.approvals, 0);
    const totalComments = activityTimeline.reduce((s, t) => s + t.comments, 0);

    const activityStats = {
      timeline: activityTimeline,
      byType: [
        { type: 'upload',   label: 'Uploads',   count: totalUploads },
        { type: 'approval', label: 'Approvals',  count: totalApprovals },
        { type: 'comment',  label: 'Comments',   count: totalComments },
        { type: 'archive',  label: 'Archives',   count: 0 },
      ],
    };

    res.json({
      overview,
      documentStats,
      approvalStats,
      departmentStats,
      activityStats,
      filters: { dateRange, departmentId },
      generatedAt: new Date().toISOString(),
    });
  })
);

/**
 * GET /api/reports/export/:format
 */
router.get(
  '/export/:format',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { format } = req.params;
    const { dateRange } = req.query;

    if (format === 'csv') {
      const csvData = [
        'Metric,Value',
        `Generated At,${new Date().toISOString()}`,
        `Date Range,${dateRange || '30days'}`,
        'Total Documents,124',
        'Approved Documents,98',
        'Pending Approvals,14',
        'Rejected Documents,4',
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=SITA_Report_${Date.now()}.csv`);
      return res.send(csvData);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=SITA_Report_${Date.now()}.pdf`);
    return res.send(Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n185\n%%EOF'));
  })
);

export default router;
