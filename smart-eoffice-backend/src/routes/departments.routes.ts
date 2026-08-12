import { Router } from 'express';
import { query } from '../lib/db';
import { ApiError } from '../lib/errors';
import { asyncHandler } from '../lib/errors';
import { requireAuth, requireRole } from '../middleware/auth';
import { serializeDepartment, DepartmentRow } from '../lib/utils';

const router = Router();

const DEPT_SELECT = `
  SELECT d.*,
         u.full_name AS manager_name,
         (SELECT COUNT(*)::int FROM users u2 WHERE u2.department_id = d.id) AS member_count
    FROM departments d
    LEFT JOIN users u ON u.id = d.manager_id
`;

/** GET /departments — any authenticated user. */
router.get(
  '/',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const { rows } = await query(`${DEPT_SELECT} ORDER BY d.name ASC`);
    res.json(rows.map((r) => serializeDepartment(r as DepartmentRow)));
  })
);

/** GET /system/capacity — license usage summary (admin pages). */
router.get(
  '/capacity',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const { rows } = await query(`SELECT COUNT(*)::int AS used FROM users WHERE is_active = true`);
    const used = (rows[0] as { used: number }).used;
    const total = 100; // licensed seats
    res.json({
      total_licenses: total,
      used_licenses: used,
      utilization_percent: Math.round((used / total) * 100),
    });
  })
);

/** POST /departments — create (admin). */
router.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const { name, code, description, manager_id } = req.body || {};
    if (!name || !code) throw ApiError.badRequest('Department name and code are required.');

    const inserted = await query(
      `INSERT INTO departments (name, code, description, manager_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [name, code, description || null, manager_id ?? null]
    ).catch((err: Error) => {
      if (err.message.includes('duplicate key')) {
        throw ApiError.conflict('A department with this name or code already exists.');
      }
      throw err;
    });

    const id = (inserted.rows[0] as { id: number }).id;
    const { rows } = await query(`${DEPT_SELECT} WHERE d.id = $1`, [id]);
    res.status(201).json(serializeDepartment(rows[0] as DepartmentRow));
  })
);

/** PUT /departments/:id — update (admin). */
router.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw ApiError.badRequest('Invalid department id.');

    const { name, code, description } = req.body || {};
    const updated = await query(
      `UPDATE departments
          SET name = COALESCE($2, name),
              code = COALESCE($3, code),
              description = COALESCE($4, description)
        WHERE id = $1
        RETURNING id`,
      [id, name ?? null, code ?? null, description ?? null]
    );
    if (updated.rows.length === 0) throw ApiError.notFound('Department not found.');

    const { rows } = await query(`${DEPT_SELECT} WHERE d.id = $1`, [id]);
    res.json(serializeDepartment(rows[0] as DepartmentRow));
  })
);

/** POST /departments/:id/assign-manager (admin). */
router.post(
  '/:id/assign-manager',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw ApiError.badRequest('Invalid department id.');

    const managerId = Number(req.body?.manager_id);
    if (!Number.isFinite(managerId)) throw ApiError.badRequest('A valid manager_id is required.');

    const updated = await query(
      `UPDATE departments SET manager_id = $2 WHERE id = $1 RETURNING id`,
      [id, managerId]
    );
    if (updated.rows.length === 0) throw ApiError.notFound('Department not found.');

    const { rows } = await query(`${DEPT_SELECT} WHERE d.id = $1`, [id]);
    res.json(serializeDepartment(rows[0] as DepartmentRow));
  })
);

export default router;
