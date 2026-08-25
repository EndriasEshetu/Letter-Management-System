import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../lib/db';
import { signToken } from '../lib/jwt';
import { ApiError, asyncHandler } from '../lib/errors';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { serializeAuthUser, UserRow } from '../lib/utils';

const router = Router();

/** POST /auth/login */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw ApiError.badRequest('Email and password are required.');
    }

    const { rows } = await query(
      `SELECT u.*, d.name AS department_name
         FROM users u
         LEFT JOIN departments d ON d.id = u.department_id
        WHERE u.email = $1`,
      [email.trim().toLowerCase()]
    );

    if (rows.length === 0) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const user = rows[0] as UserRow & { password_hash: string };

    if (!user.password_hash) {
      throw new ApiError(401, 'Account not configured for password login. Please contact an administrator.');
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    if (user.status === 'INACTIVE') {
      throw new ApiError(403, 'Your account has been deactivated. Please contact an administrator.');
    }

    const token = signToken(user.id, user.email, user.role);

    res.json({
      token,
      user: serializeAuthUser(user),
      message: 'Authenticated successfully',
    });
  })
);

/** GET /auth/me */
router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    res.json({ user: serializeAuthUser(req.user!) });
  })
);

/** POST /auth/change-password */
router.post(
  '/change-password',
  requireAuth,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { current_password, new_password, confirm_password } = req.body || {};

    if (!current_password || !new_password || !confirm_password) {
      throw ApiError.badRequest('All password fields are required.');
    }
    if (new_password !== confirm_password) {
      throw ApiError.badRequest('New password and confirm password do not match.');
    }
    if (String(new_password).length < 6) {
      throw ApiError.badRequest('New password must be at least 6 characters long.');
    }

    const user = req.user!;

    // Fetch current hash from DB.
    const { rows } = await query(`SELECT password_hash FROM users WHERE id = $1`, [user.id]);
    const currentHash: string | null = rows[0]?.password_hash ?? null;

    if (!currentHash) {
      throw ApiError.badRequest('No password set for this account.');
    }

    const valid = await bcrypt.compare(current_password, currentHash);
    if (!valid) {
      throw ApiError.badRequest('Current password is incorrect.');
    }

    const newHash = await bcrypt.hash(new_password, 12);
    await query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [newHash, user.id]);

    res.json({ message: 'Password updated successfully.' });
  })
);

export default router;
