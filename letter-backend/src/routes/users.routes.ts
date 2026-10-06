import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query, transaction } from '../lib/db';
import { ApiError } from '../lib/errors';
import { asyncHandler } from '../lib/errors';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';
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

    const userRole = role || 'EMPLOYEE';
    const isCentralRole = userRole === 'ADMIN' || userRole === 'REGISTRY_OFFICER';
    const deptId = isCentralRole ? null : (department_id ? Number(department_id) : null);

    const inserted = await query(
      `INSERT INTO users (full_name, email, phone, job_title, role, department_id, status, is_active, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7 <> 'INACTIVE', $8)
       RETURNING *`,
      [
        full_name,
        normalizedEmail,
        phone || null,
        job_title || null,
        userRole,
        deptId,
        status || 'ACTIVE',
        passwordHash,
      ]
    );
    const row = inserted.rows[0] as UserRow;

    // Automatically synchronize department manager if added as DEPARTMENT_MANAGER
    if (userRole === 'DEPARTMENT_MANAGER' && deptId && (status || 'ACTIVE') !== 'INACTIVE') {
      // 1. Demote any previous manager in this department to EMPLOYEE
      await query(
        `UPDATE users SET role = 'EMPLOYEE' WHERE department_id = $1 AND role = 'DEPARTMENT_MANAGER' AND id <> $2`,
        [deptId, row.id]
      );
      // 2. Set department manager_id to new user
      await query(`UPDATE departments SET manager_id = $1 WHERE id = $2`, [row.id, deptId]);
    }

    const { rows } = await query(`${USER_SELECT} WHERE u.id = $1`, [row.id]);
    res.status(201).json({
      ...serializeUser(rows[0] as UserRow),
      // Extra field for the admin (frontend ignores unknown props).
      temporaryPassword: DEFAULT_PASSWORD,
    });
  })
);

/** PUT /users/:id — update all personnel info (admin). */
router.put(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw ApiError.badRequest('Invalid user id.');

    const { full_name, email, phone, job_title, role, department_id, status, password } = req.body || {};

    // Verify user exists first
    const { rows: existingRows } = await query(`SELECT * FROM users WHERE id = $1`, [id]);
    if (existingRows.length === 0) throw ApiError.notFound('User not found.');
    const existingUser = existingRows[0] as UserRow;

    // Email update and uniqueness validation
    let normalizedEmail = existingUser.email;
    if (email && String(email).trim().toLowerCase() !== existingUser.email.toLowerCase()) {
      normalizedEmail = String(email).trim().toLowerCase();
      const { rows: duplicateEmail } = await query(
        `SELECT id FROM users WHERE email = $1 AND id <> $2`,
        [normalizedEmail, id]
      );
      if (duplicateEmail.length > 0) {
        throw ApiError.conflict('A user with this email address already exists.');
      }
    }

    // Optional admin-set password
    if (password && String(password).trim().length > 0) {
      if (String(password).trim().length < 6) {
        throw ApiError.badRequest('Password must be at least 6 characters long.');
      }
      const newHash = await bcrypt.hash(String(password).trim(), 12);
      await query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [newHash, id]);
    }

    const finalNewRole = role || existingUser.role;
    const isCentralRole = finalNewRole === 'ADMIN' || finalNewRole === 'REGISTRY_OFFICER';
    const willSetDept = isCentralRole ? true : (department_id !== undefined);
    const newDeptId = isCentralRole ? null : (department_id ? Number(department_id) : null);

    const updated = await query(
      `UPDATE users
          SET full_name = COALESCE($2, full_name),
              email = COALESCE($3, email),
              phone = CASE WHEN $4::boolean THEN $5 ELSE phone END,
              job_title = CASE WHEN $6::boolean THEN $7 ELSE job_title END,
              role = COALESCE($8, role),
              department_id = CASE WHEN $9::boolean THEN $10 ELSE department_id END,
              status = COALESCE($11, status),
              is_active = CASE WHEN $11 IS NOT NULL THEN ($11 <> 'INACTIVE') ELSE is_active END
        WHERE id = $1
        RETURNING *`,
      [
        id,
        full_name ? String(full_name).trim() : null,
        normalizedEmail,
        phone !== undefined,
        phone ? String(phone).trim() : null,
        job_title !== undefined,
        job_title ? String(job_title).trim() : null,
        role || null,
        willSetDept,
        newDeptId,
        status || null,
      ]
    );

    if (updated.rows.length === 0) throw ApiError.notFound('User not found.');

    const updatedUser = updated.rows[0] as UserRow;
    const finalRole = updatedUser.role;
    const finalDeptId = updatedUser.department_id;
    const isActive = updatedUser.is_active;

    // Automatically synchronize department manager assignment
    if (finalRole === 'DEPARTMENT_MANAGER' && finalDeptId && isActive) {
      // 1. Demote any previous manager in this department to EMPLOYEE
      await query(
        `UPDATE users SET role = 'EMPLOYEE' WHERE department_id = $1 AND role = 'DEPARTMENT_MANAGER' AND id <> $2`,
        [finalDeptId, id]
      );
      // 2. Set this department's manager_id to this user
      await query(`UPDATE departments SET manager_id = $1 WHERE id = $2`, [id, finalDeptId]);
      // 3. Clear from any other department where this user might have previously been manager
      await query(`UPDATE departments SET manager_id = NULL WHERE manager_id = $1 AND id <> $2`, [id, finalDeptId]);
    } else {
      // If user is no longer an active department manager, unassign them from any department manager roles
      await query(`UPDATE departments SET manager_id = NULL WHERE manager_id = $1`, [id]);
    }

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

    const updatedUser = updated.rows[0] as UserRow;
    if (!updatedUser.is_active) {
      // If deactivated, remove as department manager
      await query(`UPDATE departments SET manager_id = NULL WHERE manager_id = $1`, [id]);
    } else if (updatedUser.role === 'DEPARTMENT_MANAGER' && updatedUser.department_id) {
      // If re-activated as DEPARTMENT_MANAGER, assign to department
      await query(
        `UPDATE users SET role = 'EMPLOYEE' WHERE department_id = $1 AND role = 'DEPARTMENT_MANAGER' AND id <> $2`,
        [updatedUser.department_id, id]
      );
      await query(`UPDATE departments SET manager_id = $1 WHERE id = $2`, [id, updatedUser.department_id]);
    }

    const { rows } = await query(`${USER_SELECT} WHERE u.id = $1`, [id]);
    res.json(serializeUser(rows[0] as UserRow));
  })
);

/** DELETE /users/:id — permanently delete personnel account (admin). */
router.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) throw ApiError.badRequest('Invalid user id.');

    // Prevent admin from deleting their own current session account
    if (Number(req.user!.id) === id) {
      throw ApiError.badRequest('You cannot delete your own Administrator account.');
    }

    // Check user exists
    const { rows: targets } = await query(`SELECT id, role, full_name FROM users WHERE id = $1`, [id]);
    if (targets.length === 0) {
      throw ApiError.notFound('User not found.');
    }
    const target = targets[0] as { id: number; role: string; full_name: string };

    // If target is an admin, ensure at least one other active admin remains
    if (target.role === 'ADMIN') {
      const { rows: adminCount } = await query(
        `SELECT COUNT(*)::int AS count FROM users WHERE role = 'ADMIN' AND id <> $1 AND status = 'ACTIVE'`,
        [id]
      );
      if ((adminCount[0]?.count ?? 0) < 1) {
        throw ApiError.badRequest('Cannot delete the last remaining active Administrator.');
      }
    }

    // Clean up dependent foreign keys gracefully within a transaction
    await transaction(async (client) => {
      // Nullify references in documents, versions, approvals, comments, departments
      await client.query(`UPDATE documents SET author_id = NULL WHERE author_id = $1`, [id]);
      await client.query(`UPDATE documents SET assigned_employee_id = NULL WHERE assigned_employee_id = $1`, [id]);
      await client.query(`UPDATE document_versions SET uploaded_by_id = NULL WHERE uploaded_by_id = $1`, [id]);
      await client.query(`UPDATE approvals SET submitter_id = NULL WHERE submitter_id = $1`, [id]);
      await client.query(`UPDATE comments SET author_id = NULL WHERE author_id = $1`, [id]);
      await client.query(`UPDATE departments SET manager_id = NULL WHERE manager_id = $1`, [id]);

      // If admin_tasks table exists, nullify assignment references
      await client.query(
        `DO $$ BEGIN
           IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_tasks') THEN
             UPDATE admin_tasks SET assigned_to = NULL WHERE assigned_to = ${id};
             UPDATE admin_tasks SET source_user_id = NULL WHERE source_user_id = ${id};
             UPDATE admin_tasks SET completed_by = NULL WHERE completed_by = ${id};
             UPDATE admin_tasks SET claimed_by = NULL WHERE claimed_by = ${id};
             UPDATE admin_tasks SET read_by = NULL WHERE read_by = ${id};
           END IF;
         END $$;`
      );

      // Clean up notifications for this user
      await client.query(`DELETE FROM notifications WHERE user_id = $1`, [id]);

      // Finally, delete the user record
      await client.query(`DELETE FROM users WHERE id = $1`, [id]);
    });

    res.json({
      success: true,
      message: `Personnel account "${target.full_name}" has been deleted successfully.`,
    });
  })
);

export default router;
