import { Router } from 'express';
import { query } from '../lib/db';
import { ApiError } from '../lib/errors';
import { asyncHandler } from '../lib/errors';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { serializeDocument, toIso, DocumentRow } from '../lib/utils';
import { createNotification } from '../lib/notifications';

const router = Router();

/* ─── Shared query: approvals joined with their documents ─ */

const APPROVAL_SELECT = `
  SELECT
    a.id, a.submitter_id, a.submitter_name, a.submitter_role, a.submitter_department,
    a.priority, a.status AS approval_status, a.submitted_at, a.reviewed_at,
    a.reviewer_name, a.comment, a.page_count,
    d.id AS doc_id, d.document_number, d.title, d.description, d.category,
    d.department_id AS doc_department_id, d.department_name AS doc_department_name,
    d.created_by, d.author_id, d.status AS doc_status, d.security_level,
    d.file_name, d.file_size, d.file_type, d.created_at, d.updated_at, d.tags,
    d.version, d.is_new, COALESCE(dep.name, d.department_name) AS dept_name
  FROM approvals a
  JOIN documents d ON d.id = a.document_id
  LEFT JOIN departments dep ON dep.id = d.department_id
`;

interface ApprovalJoinRow {
  id: number;
  submitter_id: number | null;
  submitter_name: string;
  submitter_role: string | null;
  submitter_department: string | null;
  priority: 'HIGH' | 'NORMAL';
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  submitted_at: Date;
  reviewed_at: Date | null;
  reviewer_name: string | null;
  comment: string | null;
  page_count: number | null;
  // document columns
  doc_id: number;
  document_number: string;
  title: string;
  description: string | null;
  category: string;
  doc_department_id: number | null;
  doc_department_name: string | null;
  created_by: string;
  author_id: number | null;
  doc_status: string;
  security_level: string;
  file_name: string;
  file_size: number;
  file_type: string;
  created_at: Date;
  updated_at: Date;
  tags: string[] | null;
  version: string | null;
  is_new: boolean;
  dept_name: string | null;
}

function serializeApprovalRequest(row: ApprovalJoinRow) {
  const doc = {
    id: String(row.doc_id),
    documentNumber: row.document_number,
    title: row.title,
    description: row.description ?? undefined,
    category: row.category,
    department_id: row.doc_department_id ?? undefined,
    department_name: row.dept_name ?? row.doc_department_name ?? '',
    created_by: row.created_by,
    author_id: row.author_id ? String(row.author_id) : undefined,
    status: row.doc_status,
    securityLevel: row.security_level,
    file_name: row.file_name,
    file_size: row.file_size,
    file_type: row.file_type,
    created_at: row.created_at,
    updated_at: row.updated_at,
    tags: row.tags ?? [],
    version: row.version ?? undefined,
    is_new: row.is_new,
  };

  return {
    id: String(row.id),
    document: serializeDocument(doc as unknown as DocumentRow),
    submitter_name: row.submitter_name,
    submitter_role: row.submitter_role ?? undefined,
    submitter_department: row.submitter_department ?? undefined,
    priority: row.priority,
    status: row.approval_status,
    submitted_at: toIso(row.submitted_at),
    reviewed_at: toIso(row.reviewed_at),
    reviewer_name: row.reviewer_name ?? undefined,
    comment: row.comment ?? undefined,
    page_count: row.page_count ?? undefined,
  };
}

/* ─── GET /approvals — queue (filter tabs) ─────────────── */

router.get(
  '/',
  requireAuth,
  requireRole('DEPARTMENT_MANAGER', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const { priority, status } = req.query as Record<string, string | undefined>;

    let whereSql = '';
    if (priority === 'HIGH') {
      whereSql = `WHERE a.priority = 'HIGH' AND a.status = 'PENDING'`;
    } else if (status === 'REVIEWED') {
      whereSql = `WHERE a.status <> 'PENDING'`;
    } else {
      whereSql = `WHERE a.status = 'PENDING'`;
    }

    const { rows } = await query(`${APPROVAL_SELECT} ${whereSql} ORDER BY a.submitted_at DESC`);
    res.json(rows.map((r) => serializeApprovalRequest(r as ApprovalJoinRow)));
  })
);

/* ─── GET /approvals/metrics ───────────────────────────── */

router.get(
  '/metrics',
  requireAuth,
  requireRole('DEPARTMENT_MANAGER', 'ADMIN'),
  asyncHandler(async (_req, res) => {
    const { rows } = await query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'PENDING')::int AS pending_count,
        COUNT(*) FILTER (WHERE status = 'APPROVED')::int AS approved_count,
        COUNT(*) FILTER (WHERE status = 'REJECTED')::int AS rejected_count,
        COUNT(*) FILTER (WHERE status = 'CHANGES_REQUESTED')::int AS changes_requested_count
      FROM approvals
    `);
    const m = rows[0] as {
      pending_count: number;
      approved_count: number;
      rejected_count: number;
      changes_requested_count: number;
    };

    const total = m.approved_count + m.rejected_count + m.changes_requested_count;
    const { rows: turnaround } = await query(`
      SELECT AVG(EXTRACT(EPOCH FROM (reviewed_at - submitted_at)) / 3600)::float AS avg_hours
        FROM approvals
       WHERE reviewed_at IS NOT NULL
    `);

    res.json({
      pending_count: m.pending_count,
      approved_count: m.approved_count,
      rejected_count: m.rejected_count,
      changes_requested_count: m.changes_requested_count,
      approval_rate_percent: total > 0 ? Math.round((m.approved_count / total) * 100) : null,
      avg_turnaround_hours:
        turnaround.rows[0]?.avg_hours != null ? Math.round((turnaround.rows[0] as { avg_hours: number }).avg_hours * 10) / 10 : null,
    });
  })
);

/* ─── GET /approvals/activity ──────────────────────────── */

router.get(
  '/activity',
  requireAuth,
  requireRole('DEPARTMENT_MANAGER', 'ADMIN'),
  asyncHandler(async (_req, res) => {
    const { rows } = await query(
      `SELECT id, action, document_title, document_id, user_name, timestamp
         FROM approval_activities
        ORDER BY timestamp DESC
        LIMIT 10`
    );
    res.json(
      rows.map((r) => ({
        id: String(r.id),
        action: r.action,
        document_title: r.document_title,
        document_id: r.document_id != null ? String(r.document_id) : undefined,
        user_name: r.user_name,
        timestamp: toIso(r.timestamp),
      }))
    );
  })
);

/* ─── Review actions: approve / reject / request-changes ── */

async function reviewDocument(
  documentId: number,
  reviewerName: string,
  action: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED',
  comment: string | undefined
) {
  const { rows } = await query(
    `UPDATE approvals
        SET status = $2, reviewed_at = now(), reviewer_name = $3, comment = COALESCE($4, comment)
      WHERE document_id = $1
      RETURNING id`,
    [documentId, action, reviewerName, comment || null]
  );
  if (rows.length === 0) throw ApiError.notFound('No pending approval request for this document.');

  await query(
    `UPDATE documents SET status = $2, updated_at = now() WHERE id = $1`,
    [documentId, action]
  );

  const docRes = await query(`SELECT * FROM documents WHERE id = $1`, [documentId]);
  const doc = docRes.rows[0] as DocumentRow;
  if (!doc) throw ApiError.notFound('Document not found.');

  await query(
    `INSERT INTO approval_activities (action, document_id, document_title, user_name, timestamp)
     VALUES ($1, $2, $3, $4, now())`,
    [action, documentId, doc.title, reviewerName]
  );

  if (doc.author_id) {
    const typeMap = {
      APPROVED: 'DOCUMENT_APPROVED',
      REJECTED: 'DOCUMENT_REJECTED',
      CHANGES_REQUESTED: 'CHANGES_REQUESTED',
    } as const;
    await createNotification({
      userId: doc.author_id,
      type: typeMap[action],
      message: `Your document "${doc.title}" was ${action === 'APPROVED' ? 'approved' : action === 'REJECTED' ? 'rejected' : 'sent back with change requests'}.`,
      documentId: doc.id,
      documentTitle: doc.title,
    });
  }

  return { message: `Document ${action === 'APPROVED' ? 'approved' : action === 'REJECTED' ? 'rejected' : 'updated with change requests'} successfully.` };
}

router.post(
  '/:document_id/approve',
  requireAuth,
  requireRole('DEPARTMENT_MANAGER', 'ADMIN'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const documentId = Number(req.params.document_id);
    if (!Number.isFinite(documentId)) throw ApiError.badRequest('Invalid document id.');
    res.json(await reviewDocument(documentId, req.user!.full_name, 'APPROVED', req.body?.comment));
  })
);

router.post(
  '/:document_id/reject',
  requireAuth,
  requireRole('DEPARTMENT_MANAGER', 'ADMIN'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const documentId = Number(req.params.document_id);
    if (!Number.isFinite(documentId)) throw ApiError.badRequest('Invalid document id.');
    const reason = req.body?.reason;
    if (!reason) throw ApiError.badRequest('A rejection reason is required.');
    res.json(await reviewDocument(documentId, req.user!.full_name, 'REJECTED', reason));
  })
);

router.post(
  '/:document_id/request-changes',
  requireAuth,
  requireRole('DEPARTMENT_MANAGER', 'ADMIN'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const documentId = Number(req.params.document_id);
    if (!Number.isFinite(documentId)) throw ApiError.badRequest('Invalid document id.');
    const reason = req.body?.reason;
    if (!reason) throw ApiError.badRequest('A change request note is required.');
    res.json(await reviewDocument(documentId, req.user!.full_name, 'CHANGES_REQUESTED', reason));
  })
);

export default router;
