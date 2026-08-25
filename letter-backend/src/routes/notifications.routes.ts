import { Router } from 'express';
import { query } from '../lib/db';
import { ApiError } from '../lib/errors';
import { asyncHandler } from '../lib/errors';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { toIso } from '../lib/utils';

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
}) {
  return {
    id: String(row.id),
    type: row.type,
    message: row.message,
    isRead: row.is_read,
    createdAt: toIso(row.created_at),
    documentId: row.document_id != null ? String(row.document_id) : undefined,
    documentTitle: row.document_title ?? undefined,
  };
}

/** GET /notifications — current user's notifications, newest first. */
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { rows } = await query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user!.id]
    );
    res.json(rows.map((r) => serializeNotification(r)));
  })
);

/** POST /notifications/:id/read */
router.post(
  '/:id/read',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw ApiError.badRequest('Invalid notification id.');

    const updated = await query(
      `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, req.user!.id]
    );
    if (updated.rows.length === 0) throw ApiError.notFound('Notification not found.');
    res.json({ message: 'Notification marked as read.' });
  })
);

/** POST /notifications/read-all */
router.post(
  '/read-all',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    await query(`UPDATE notifications SET is_read = true WHERE user_id = $1`, [req.user!.id]);
    res.json({ message: 'All notifications marked as read.' });
  })
);

export default router;
