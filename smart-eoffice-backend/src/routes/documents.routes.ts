import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { config } from '../config';
import { supabaseAdmin } from '../lib/supabase';
import { query } from '../lib/db';
import { ApiError } from '../lib/errors';
import { asyncHandler } from '../lib/errors';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import {
  serializeDocument,
  serializeVersion,
  toNumber,
  normalizeDepartmentParam,
  splitTags,
  DocumentRow,
  VersionRow,
} from '../lib/utils';
import { createNotification, notifyDepartmentManagers } from '../lib/notifications';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

const DOC_SELECT = `
  SELECT d.*, COALESCE(dep.name, d.department_name) AS department_name
    FROM documents d
    LEFT JOIN departments dep ON dep.id = d.department_id
`;

/** Generate the next document number, e.g. DOC-2026-042. */
async function nextDocumentNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const { rows } = await query(
    `SELECT COUNT(*)::int AS n FROM documents WHERE EXTRACT(YEAR FROM created_at) = $1`,
    [year]
  );
  const n = (rows[0] as { n: number }).n + 1;
  return `DOC-${year}-${String(n).padStart(3, '0')}`;
}

/** Upload a buffer to Supabase Storage and return its path. */
async function uploadToStorage(buffer: Buffer, path: string, contentType: string) {
  const { error } = await supabaseAdmin.storage
    .from(config.storageBucket)
    .upload(path, buffer, { contentType, upsert: false });
  if (error) {
    throw new ApiError(500, `File storage upload failed: ${error.message}`);
  }
  return path;
}

/** Remove an object from storage (used to roll back a failed insert). */
async function deleteFromStorage(path: string) {
  await supabaseAdmin.storage.from(config.storageBucket).remove([path]).catch(() => undefined);
}

/** Load versions for a document, newest first. */
async function loadVersions(documentId: number): Promise<VersionRow[]> {
  const { rows } = await query(
    `SELECT * FROM document_versions WHERE document_id = $1 ORDER BY date DESC, id DESC`,
    [documentId]
  );
  return rows as VersionRow[];
}

/* ─── GET /documents — paginated, filtered ─────────────── */

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { search, category, status, securityLevel, start_date, end_date } =
      req.query as Record<string, string | undefined>;
    const dept = normalizeDepartmentParam(req.query.department_id);
    const page = toNumber(req.query.page, 1);
    const limit = Math.min(toNumber(req.query.limit, 10), 100);
    const offset = (page - 1) * limit;

    const where: string[] = [];
    const params: unknown[] = [];

    if (search) {
      const q = `%${search.toLowerCase()}%`;
      where.push(
        `(LOWER(d.title) LIKE $${params.length + 1} OR LOWER(d.document_number) LIKE $${params.length + 2} OR LOWER(d.category) LIKE $${params.length + 3})`
      );
      params.push(q, q, q);
    }
    if (category && category !== 'ALL') {
      where.push(`d.category = $${params.length + 1}`);
      params.push(category);
    }
    if (dept.id !== undefined) {
      where.push(`d.department_id = $${params.length + 1}`);
      params.push(dept.id);
    } else if (dept.name) {
      where.push(`LOWER(d.department_name) LIKE $${params.length + 1}`);
      params.push(`%${dept.name}%`);
    }
    if (status && status !== 'ALL') {
      where.push(`d.status = $${params.length + 1}`);
      params.push(status);
    }
    if (securityLevel && securityLevel !== 'ALL') {
      where.push(`d.security_level = $${params.length + 1}`);
      params.push(securityLevel);
    }
    if (start_date) {
      where.push(`d.created_at >= $${params.length + 1}`);
      params.push(start_date);
    }
    if (end_date) {
      where.push(`d.created_at <= $${params.length + 1}`);
      params.push(end_date);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const countParams = [...params];
    const pageParams = [...params, limit, offset];

    const [{ rows: countRows }, { rows }] = await Promise.all([
      query(`SELECT COUNT(*)::int AS total FROM documents d ${whereSql}`, countParams),
      query(
        `${DOC_SELECT} ${whereSql} ORDER BY d.created_at DESC, d.id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        pageParams
      ),
    ]);

    const total = (countRows[0] as { total: number }).total;
    res.json({
      data: rows.map((r) => serializeDocument(r as DocumentRow)),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  })
);

/* ─── POST /documents — multipart upload ───────────────── */

router.post(
  '/',
  requireAuth,
  upload.single('file'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const user = req.user!;
    if (!req.file) throw ApiError.badRequest('No file provided.');

    const body = req.body as Record<string, string | undefined>;
    const title = body.title?.trim() || req.file.originalname;
    const category = body.category || 'General / Documentation';
    const securityLevel = body.securityLevel || 'INTERNAL';
    const description = body.description || '';

    // Resolve department from the name the frontend sends (e.g. "Public Works").
    let departmentId: number | null = null;
    let departmentName = body.department_name || '';
    if (departmentName) {
      const dept = await query(
        `SELECT id, name FROM departments WHERE LOWER(name) = LOWER($1) LIMIT 1`,
        [departmentName]
      );
      if (dept.rows.length > 0) {
        departmentId = (dept.rows[0] as { id: number }).id;
        departmentName = (dept.rows[0] as { name: string }).name;
      }
    }

    // Upload the file to storage first, then record metadata.
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `documents/${randomUUID()}-${safeName}`;
    await uploadToStorage(req.file.buffer, storagePath, req.file.mimetype);

    const documentNumber = await nextDocumentNumber();
    let doc: DocumentRow;
    try {
      const inserted = await query(
        `INSERT INTO documents
           (document_number, title, description, category, department_id, department_name,
            created_by, author_id, status, security_level, file_name, file_size, file_type,
            storage_path, tags, version, is_new)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'DRAFT',$9,$10,$11,$12,$13,$14,'v1.0',true)
         RETURNING *`,
        [
          documentNumber,
          title,
          description || null,
          category,
          departmentId,
          departmentName || null,
          user.full_name,
          user.id,
          securityLevel,
          req.file.originalname,
          req.file.size,
          req.file.mimetype,
          storagePath,
          splitTags(body.tags),
        ]
      );
      doc = inserted.rows[0] as DocumentRow;
    } catch (err) {
      // Roll back the stored file if the metadata insert failed.
      await deleteFromStorage(storagePath);
      throw err;
    }

    // Initial v1.0 version row.
    await query(
      `INSERT INTO document_versions
         (document_id, version_number, uploaded_by, uploaded_by_id, date, file_size, file_name, storage_path, is_current)
       VALUES ($1,'v1.0',$2,$3,now(),$4,$5,$6,true)`,
      [doc.id, user.full_name, user.id, req.file.size, req.file.originalname, storagePath]
    );

    const { rows } = await query(`${DOC_SELECT} WHERE d.id = $1`, [doc.id]);
    res.status(201).json(serializeDocument(rows[0] as DocumentRow, await loadVersions(doc.id)));
  })
);

/* ─── GET /documents/:id — detail with versions ────────── */

router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw ApiError.badRequest('Invalid document id.');

    const { rows } = await query(`${DOC_SELECT} WHERE d.id = $1`, [id]);
    if (rows.length === 0) throw ApiError.notFound('Document not found.');
    const doc = rows[0] as DocumentRow;

    res.json(serializeDocument(doc, await loadVersions(doc.id)));
  })
);

/* ─── GET /documents/:id/versions ──────────────────────── */

router.get(
  '/:id/versions',
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw ApiError.badRequest('Invalid document id.');
    res.json((await loadVersions(id)).map(serializeVersion));
  })
);

/* ─── POST /documents/:id/versions — new version upload ── */

router.post(
  '/:id/versions',
  requireAuth,
  upload.single('file'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw ApiError.badRequest('Invalid document id.');
    if (!req.file) throw ApiError.badRequest('No file provided.');

    const user = req.user!;
    const { rows } = await query(`SELECT * FROM documents WHERE id = $1`, [id]);
    if (rows.length === 0) throw ApiError.notFound('Document not found.');
    const doc = rows[0] as DocumentRow;

    // Next version number: count existing versions + 1.
    const countRes = await query(
      `SELECT COUNT(*)::int AS n FROM document_versions WHERE document_id = $1`,
      [id]
    );
    const versionNumber = `v${(countRes.rows[0] as { n: number }).n + 1}.0`;

    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `documents/${id}/${versionNumber}-${safeName}`;
    await uploadToStorage(req.file.buffer, storagePath, req.file.mimetype);

    await query(`UPDATE document_versions SET is_current = false WHERE document_id = $1`, [id]);
    await query(
      `INSERT INTO document_versions
         (document_id, version_number, uploaded_by, uploaded_by_id, date, file_size, file_name, storage_path, is_current)
       VALUES ($1,$2,$3,$4,now(),$5,$6,$7,true)`,
      [id, versionNumber, user.full_name, user.id, req.file.size, req.file.originalname, storagePath]
    );
    await query(
      `UPDATE documents SET version = $2, file_name = $3, file_size = $4, file_type = $5, storage_path = $6, updated_at = now()
        WHERE id = $1`,
      [id, versionNumber, req.file.originalname, req.file.size, req.file.mimetype, storagePath]
    );

    res.json({ message: 'Version uploaded successfully.', version: versionNumber });
  })
);

/* ─── GET /documents/:id/download — stream file ────────── */

router.get(
  '/:id/download',
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw ApiError.badRequest('Invalid document id.');

    const { rows } = await query(`SELECT * FROM documents WHERE id = $1`, [id]);
    if (rows.length === 0) throw ApiError.notFound('Document not found.');
    const doc = rows[0] as DocumentRow;

    const bucket = config.storageBucket;
    const { data, error } = await supabaseAdmin.storage.from(bucket).download(doc.storage_path);
    if (error || !data) {
      throw new ApiError(404, 'File not found in storage.');
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    res.setHeader('Content-Type', doc.file_type || 'application/octet-stream');
    // RFC 5987 filename* handles unicode/spaces; plain filename as a fallback.
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${doc.file_name.replace(/["\\]/g, '_')}"; filename*=UTF-8''${encodeURIComponent(doc.file_name)}`
    );
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  })
);

/* ─── POST /documents/:id/archive ──────────────────────── */

router.post(
  '/:id/archive',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw ApiError.badRequest('Invalid document id.');

    const { rows } = await query(
      `UPDATE documents SET status = 'ARCHIVED', updated_at = now() WHERE id = $1 RETURNING *`,
      [id]
    );
    if (rows.length === 0) throw ApiError.notFound('Document not found.');
    const doc = rows[0] as DocumentRow;

    if (doc.author_id) {
      await createNotification({
        userId: doc.author_id,
        type: 'DOCUMENT_ARCHIVED',
        message: `Your document "${doc.title}" was archived.`,
        documentId: doc.id,
        documentTitle: doc.title,
      });
    }

    const { rows: full } = await query(`${DOC_SELECT} WHERE d.id = $1`, [id]);
    res.json({ message: 'Document moved to archive.', document: serializeDocument(full[0] as DocumentRow) });
  })
);

/* ─── POST /documents/:id/submit — submit for approval ─── */

router.post(
  '/:id/submit',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw ApiError.badRequest('Invalid document id.');

    const { rows } = await query(
      `UPDATE documents SET status = 'PENDING_APPROVAL', updated_at = now() WHERE id = $1 RETURNING *`,
      [id]
    );
    if (rows.length === 0) throw ApiError.notFound('Document not found.');
    const doc = rows[0] as DocumentRow;

    const user = req.user!;

    // Upsert the approval request (resubmission re-opens an existing one).
    await query(
      `INSERT INTO approvals
         (document_id, submitter_id, submitter_name, submitter_role, submitter_department,
          priority, status, submitted_at, page_count)
       VALUES ($1,$2,$3,$4,$5,'NORMAL','PENDING',now(),NULL)
       ON CONFLICT (document_id) DO UPDATE
         SET status = 'PENDING', submitted_at = now(), reviewed_at = NULL, comment = NULL
       RETURNING id`,
      [id, doc.author_id ?? user.id, user.full_name, user.job_title || null, doc.department_name || null]
    );

    await query(
      `INSERT INTO approval_activities (action, document_id, document_title, user_name, timestamp)
       VALUES ('SUBMITTED', $1, $2, $3, now())`,
      [id, doc.title, user.full_name]
    );

    await notifyDepartmentManagers(
      doc.department_id,
      'DOCUMENT_SUBMITTED',
      `${user.full_name} submitted "${doc.title}" for approval.`,
      doc.id,
      doc.title
    );

    const { rows: full } = await query(`${DOC_SELECT} WHERE d.id = $1`, [id]);
    res.json({ message: 'Document submitted for approval.', document: serializeDocument(full[0] as DocumentRow) });
  })
);

export default router;
