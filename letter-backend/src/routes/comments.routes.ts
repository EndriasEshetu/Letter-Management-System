import { Router } from "express";
import { query } from "../lib/db";
import { ApiError } from "../lib/errors";
import { asyncHandler } from "../lib/errors";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import { toIso, DocumentRow } from "../lib/utils";
import { createNotificationLegacy } from "../lib/notifications";

const router = Router();

function serializeComment(row: {
  id: number;
  document_id: number;
  author_id: number | null;
  author_name: string;
  author_role: string | null;
  author_department: string | null;
  message: string;
  created_at: Date;
}) {
  return {
    id: String(row.id),
    documentId: String(row.document_id),
    author: {
      id: row.author_id ?? row.id,
      name: row.author_name,
      role: row.author_role ?? undefined,
      department: row.author_department ?? undefined,
    },
    message: row.message,
    createdAt: toIso(row.created_at),
  };
}

/** GET /documents/:documentId/comments */
router.get(
  "/:documentId/comments",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const documentId = Number(req.params.documentId);
    if (!Number.isFinite(documentId))
      throw ApiError.badRequest("Invalid document id.");

    if (req.user?.role === "EMPLOYEE") {
      const access = await query(
        `SELECT id FROM documents
          WHERE id = $1
            AND (author_id = $2 OR assigned_employee_id = $2 OR LOWER(TRIM(assigned_employee)) = LOWER(TRIM($3::text)))`,
        [documentId, req.user.id, req.user.full_name],
      );
      if (access.rows.length === 0)
        throw ApiError.notFound("Document not found.");
    }

    const { rows } = await query(
      `SELECT * FROM comments WHERE document_id = $1 ORDER BY created_at ASC`,
      [documentId],
    );
    res.json(rows.map((r) => serializeComment(r)));
  }),
);

/** POST /documents/:documentId/comments */
router.post(
  "/:documentId/comments",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const documentId = Number(req.params.documentId);
    if (!Number.isFinite(documentId))
      throw ApiError.badRequest("Invalid document id.");

    if (req.user?.role === "EMPLOYEE") {
      const access = await query(
        `SELECT id FROM documents
          WHERE id = $1
            AND (author_id = $2 OR assigned_employee_id = $2 OR LOWER(TRIM(assigned_employee)) = LOWER(TRIM($3::text)))`,
        [documentId, req.user.id, req.user.full_name],
      );
      if (access.rows.length === 0)
        throw ApiError.notFound("Document not found.");
    }

    const message = req.body?.message;
    if (typeof message !== "string" || !message.trim()) {
      throw ApiError.badRequest("Comment message is required.");
    }

    const user = req.user!;
    const inserted = await query(
      `INSERT INTO comments (document_id, author_id, author_name, author_role, author_department, message)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        documentId,
        user.id,
        user.full_name,
        user.job_title || null,
        user.department_name || null,
        message.trim(),
      ],
    );

    // Notify the document author (unless commenting on your own document).
    const docRes = await query(`SELECT * FROM documents WHERE id = $1`, [
      documentId,
    ]);
    const doc = docRes.rows[0] as DocumentRow | undefined;
    if (doc && doc.author_id && doc.author_id !== user.id) {
      await createNotificationLegacy({
        userId: doc.author_id,
        type: "COMMENT_ADDED",
        message: `${user.full_name} commented on "${doc.title}".`,
        documentId: doc.id,
        documentTitle: doc.title,
      });
    }

    res.status(201).json(serializeComment(inserted.rows[0]));
  }),
);

export default router;
