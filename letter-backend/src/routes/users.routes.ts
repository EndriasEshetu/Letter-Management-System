import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../lib/db';
import { ApiError } from '../lib/errors';
import { asyncHandler } from '../lib/errors';
import { requireAuth, requireRole } from '../middleware/auth';
import { serializeUser, toNumber, UserRow } from '../lib/utils';

const router = Router();

const USER_SELECT = `
  SELECT u.*, d.name AS department_name
    FROM users u
    LEFT JOIN departments d ON d.id = u.department_id
`;

/** Default password assigned to newly created accounts (changeable on first login). */
const DEFAULT_PASSWORD = 'Sita@2026';

/** GET /users — paginated, filtered (admin). */
router.get(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const { search, role, department_id, status } = req.query as Record<string, string | undefined>;
    const page = toNumber(req.query.page, 1);
    const limit = Math.min(toNumber(req.query.limit, 10), 100);
    const offset = (page - 1) * limit;

    const whereClauses: string[] = [];
    const searchParams: unknown[] = [];
    if (search) {
      const q = `%${search.toLowerCase()}%`;
      whereClauses.push(`(LOWER(u.full_name) LIKE $${searchParams.length + 1} OR LOWER(u.email) LIKE $${searchParams.length + 2} OR LOWER(COALESCE(u.job_title,'')) LIKE $${searchParams.length + 3})`);
      searchParams.push(q, q, q);
    }
    if (role && role !== 'ALL') {
      whereClauses.push(`u.role = $${searchParams.length + 1}`);
      searchParams.push(role);
    }
    if (status && status !== 'ALL') {
      whereClauses.push(`u.status = $${searchParams.length + 1}`);
      searchParams.push(status);
    }
    if (department_id && department_id !== 'ALL') {
      const n = Number(department_id);
      if (Number.isFinite(n) && String(department_id) === String(n)) {
        whereClauses.push(`u.department_id = $${searchParams.length + 1}`);
        searchParams.push(n);
      } else {
        whereClauses.push(`LOWER(d.name) LIKE $${searchParams.length + 1}`);
        searchParams.push(`%${String(department_id).toLowerCase()}%`);
      }
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const paramsForPage: unknown[] = [...searchParams, limit, offset];

    const [{ rows: countRows }, { rows }] = await Promise.all([
      query(
        `SELECT COUNT(*)::int AS total FROM users u LEFT JOIN departments d ON d.id = u.department_id ${whereSql}`,
        searchParams
      ),
      query(
        `${USER_SELECT} ${whereSql} ORDER BY u.created_at DESC, u.id DESC LIMIT $${searchParams.length + 1} OFFSET $${searchParams.length + 2}`,
        paramsForPage
      ),
    ]);

    const total = (countRows[0] as { total: number }).total;
    res.json({
      data: rows.map((r) => serializeUser(r as UserRow)),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  })
);

/** POST /users — create a user account with hashed password (admin). */
router.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const { full_name, email, phone, job_title, role, department_id, status } = req.body || {};

    if (!full_name || !email) throw ApiError.badRequest('Full name and email are required.');
    const normalizedEmail = String(email).trim().toLowerCase();

    // Check for duplicate email
    const { rows: existing } = await query(`SELECT id FROM users WHERE email = $1`, [normalizedEmail]);
    if (existing.length > 0) {
      throw ApiError.conflict('A user with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

    const inserted = await query(
      `INSERT INTO users (full_name, email, phone, job_title, role, department_id, status, is_active, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7 <> 'INACTIVE', $8)
       RETURNING *`,
      [
        full_name,
        normalizedEmail,
        phone || null,
        job_title || null,
        role || 'EMPLOYEE',
        department_id ?? null,
        status || 'ACTIVE',
        passwordHash,
      ]
    );
    const row = inserted.rows[0] as UserRow;
    const { rows } = await query(`${USER_SELECT} WHERE u.id = $1`, [row.id]);
    res.status(201).json({
      ...serializeUser(rows[0] as UserRow),
      // Extra field for the admin (frontend ignores unknown props).
      temporaryPassword: DEFAULT_PASSWORD,
    });
  })
);

/** PUT /users/:id — update profile (admin). */
router.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw ApiError.badRequest('Invalid user id.');

    const { full_name, phone, job_title, role, department_id, status } = req.body || {};

    const updated = await query(
      `UPDATE users
          SET full_name = COALESCE($2, full_name),
              phone = COALESCE($3, phone),
              job_title = COALESCE($4, job_title),
              role = COALESCE($5, role),
              department_id = COALESCE($6, department_id),
              status = COALESCE($7, status),
              is_active = COALESCE($8, is_active)
        WHERE id = $1
        RETURNING *`,
      [
        id,
        full_name ?? null,
        phone ?? null,
        job_title ?? null,
        role ?? null,
        department_id ?? null,
        status ?? null,
        status ? status !== 'INACTIVE' : null,
      ]
    );
    if (updated.rows.length === 0) throw ApiError.notFound('User not found.');

    const { rows } = await query(`${USER_SELECT} WHERE u.id = $1`, [id]);
    res.json(serializeUser(rows[0] as UserRow));
  })
);

/** PATCH /users/:id/toggle-status — flip active/inactive (admin). */
router.patch(
  '/:id/toggle-status',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw ApiError.badRequest('Invalid user id.');

    const updated = await query(
      `UPDATE users
          SET status = CASE WHEN status = 'ACTIVE' THEN 'INACTIVE' ELSE 'ACTIVE' END,
              is_active = NOT is_active
        WHERE id = $1
        RETURNING *`,
      [id]
    );
    if (updated.rows.length === 0) throw ApiError.notFound('User not found.');

    const { rows } = await query(`${USER_SELECT} WHERE u.id = $1`, [id]);
    res.json(serializeUser(rows[0] as UserRow));
  })
);

export default router;
