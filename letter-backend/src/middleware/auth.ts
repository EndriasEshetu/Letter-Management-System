import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../lib/jwt';
import { ApiError } from '../lib/errors';
import { query } from '../lib/db';
import { UserRow } from '../lib/utils';

export interface AuthenticatedRequest extends Request {
  user?: UserRow;
  authUid?: string;
}

export type Role = 'ADMIN' | 'DEPARTMENT_MANAGER' | 'EMPLOYEE' | 'REGISTRY_OFFICER';

/**
 * Extract the Bearer token, verify it (JWT), load the corresponding
 * `users` profile row and attach it to `req.user`.
 */
export async function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Missing or malformed Authorization header.');
    }
    const token = header.slice('Bearer '.length).trim();

    const payload = verifyToken(token);
    if (!payload) {
      throw ApiError.unauthorized('Invalid or expired session token.');
    }

    const { rows } = await query(
      `SELECT u.*, d.name AS department_name
         FROM users u
         LEFT JOIN departments d ON d.id = u.department_id
        WHERE u.id = $1`,
      [payload.sub]
    );

    if (rows.length === 0) {
      throw ApiError.unauthorized('User profile not found. Please log in again.');
    }

    req.user = rows[0] as UserRow;
    req.authUid = String(payload.sub);
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
