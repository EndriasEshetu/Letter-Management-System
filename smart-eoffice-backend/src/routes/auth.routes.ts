import { Router } from 'express';
import { supabaseAdmin, supabaseAuth } from '../lib/supabase';
import { query } from '../lib/db';
import { ApiError, asyncHandler } from '../lib/errors';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { serializeAuthUser, UserRow } from '../lib/utils';

const router = Router();

/** Load a users row by its Supabase auth uid, auto-provisioning a minimal profile if missing. */
async function loadUserByAuthUid(authUid: string): Promise<UserRow> {
  const { rows } = await query(
    `SELECT u.*, d.name AS department_name
       FROM users u
       LEFT JOIN departments d ON d.id = u.department_id
      WHERE u.auth_uid = $1`,
    [authUid]
  );
  if (rows.length > 0) return rows[0] as UserRow;

  // Auto-provision: account exists in Supabase Auth but has no profile row yet.
  const { data: authData } = await supabaseAdmin.auth.admin.getUserById(authUid);
  const email = authData.user?.email ?? '';
  const fullName = (authData.user?.user_metadata?.full_name as string) || email.split('@')[0] || 'User';
  const inserted = await query(
    `INSERT INTO users (auth_uid, full_name, email, role)
     VALUES ($1, $2, $3, 'EMPLOYEE')
     RETURNING *`,
    [authUid, fullName, email]
  );
  const row = inserted.rows[0] as UserRow;
  return { ...row, department_name: null };
}

/** POST /auth/login */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      throw ApiError.badRequest('Email and password are required.');
    }

    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error || !data.session) {
      throw new ApiError(401, 'Invalid email or password.');
    }

    const user = await loadUserByAuthUid(data.user.id);
    res.json({
      token: data.session.access_token,
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

    // Verify the current password by attempting a fresh sign-in.
    const user = req.user!;
    const { error: verifyError } = await supabaseAuth.auth.signInWithPassword({
      email: user.email,
      password: current_password,
    });
    if (verifyError) {
      throw ApiError.badRequest('Current password is incorrect.');
    }

    // Apply the new password via the service-role admin API. This needs no user
    // session on a shared client, avoiding cross-request session races.
    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.authUid, {
      password: new_password,
    });
    if (error) {
      throw new ApiError(400, error.message || 'Failed to update password.');
    }

    res.json({ message: 'Password updated successfully.' });
  })
);

export default router;
