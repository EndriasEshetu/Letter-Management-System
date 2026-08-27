import { Router } from "express";
import { query } from "../lib/db";
import { ApiError } from "../lib/errors";
import { asyncHandler } from "../lib/errors";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import { toIso } from "../lib/utils";

const router = Router();

function serializeNotification(row: {
  id: number;
  user_id: number;
  type: string;
  message: string;
  is_read: boolean;
  document_id: number | null;
  document_title: string | null;
  created_at: Date;
  reference_number?: string | null;
}) {
  return {
    id: String(row.id),
    type: row.type,
    message: row.message,
    isRead: row.is_read,
    createdAt: toIso(row.created_at),
    documentId: row.document_id != null ? String(row.document_id) : undefined,
    documentTitle: row.document_title ?? undefined,
    letterId: row.document_id != null ? String(row.document_id) : undefined,
    referenceNumber: row.reference_number ?? undefined,
    entityType: row.document_id != null ? "LETTER" : undefined,
    entityId: row.document_id != null ? String(row.document_id) : undefined,
  };
}

/** GET /notifications — current user's notifications, newest first. */
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const readFilter = req.query.read as string | undefined;
    const whereRead =
      readFilter === "unread"
        ? " AND n.is_read = false"
        : readFilter === "read"
          ? " AND n.is_read = true"
          : "";
    const [{ rows }, { rows: countRows }] = await Promise.all([
      query(
        `SELECT n.*, d.document_number AS reference_number
           FROM notifications n
           LEFT JOIN documents d ON d.id = n.document_id
          WHERE n.user_id = $1${whereRead}
          ORDER BY n.created_at DESC LIMIT $2 OFFSET $3`,
        [req.user!.id, limit, offset],
      ),
      query(
        `SELECT COUNT(*)::int AS total FROM notifications n WHERE n.user_id = $1${whereRead}`,
        [req.user!.id],
      ),
    ]);
    res.json({
      data: rows.map((r) => serializeNotification(r)),
      total: countRows[0].total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(countRows[0].total / limit)),
    });
  }),
);

/** GET /notifications/unread-count — current user's unread total. */
router.get(
  "/unread-count",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { rows } = await query(
      `SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = false`,
      [req.user!.id],
    );
    res.json({ count: rows[0].count });
  }),
);

/** POST /notifications/:id/read */
router.post(
  "/:id/read",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id))
      throw ApiError.badRequest("Invalid notification id.");

    const updated = await query(
      `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, req.user!.id],
    );
    if (updated.rows.length === 0)
      throw ApiError.notFound("Notification not found.");
    res.json({ message: "Notification marked as read." });
  }),
);

/** POST /notifications/read-all */
router.post(
  "/read-all",
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await query(`UPDATE notifications SET is_read = true WHERE user_id = $1`, [
      req.user!.id,
    ]);
    res.json({ message: "All notifications marked as read." });
  }),
);

export default router;
