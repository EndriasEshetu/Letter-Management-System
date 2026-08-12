import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../lib/supabase';
import { ApiError } from '../lib/errors';
import { query } from '../lib/db';
import { UserRow } from '../lib/utils';

export interface AuthenticatedRequest extends Request {
  user?: UserRow;
  authUid?: string;
}

export type Role = 'ADMIN' | 'DEPARTMENT_MANAGER' | 'EMPLOYEE';

/**
 * Extract the Bearer token, verify it against Supabase Auth, load the
 * corresponding `users` profile row and attach it to `req.user`.
 */
export async function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Missing or malformed Authorization header.');
    }
    const token = header.slice('Bearer '.length).trim();

    const authUser = await verifyToken(token);
    if (!authUser) {
      throw ApiError.unauthorized('Invalid or expired session token.');
    }

    const { rows } = await query(
      `SELECT u.*, d.name AS department_name
         FROM users u
         LEFT JOIN departments d ON d.id = u.department_id
        WHERE u.auth_uid = $1`,
      [authUser.id]
    );

    if (rows.length === 0) {
      throw ApiError.unauthorized('User profile not found. Please log in again.');
    }

    req.user = rows[0] as UserRow;
    req.authUid = authUser.id;
    next();
  } catch (err) {
    next(err);
  }
}

/** Require one of the given roles. Must run after `requireAuth`. */
export function requireRole(...roles: Role[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return next(ApiError.unauthorized());
    if (!roles.includes(user.role)) {
      return next(ApiError.forbidden());
    }
    next();
  };
}
