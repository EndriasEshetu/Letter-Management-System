import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface JwtPayload {
  sub: number;   // users.id
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/** Sign a JWT for the given user. */
export function signToken(userId: number, email: string, role: string): string {
  return jwt.sign(
    { sub: userId, email, role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
  );
}

/** Verify a JWT and return its payload, or null if invalid/expired. */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const payload = jwt.verify(token, config.jwtSecret) as unknown as JwtPayload;
    return payload;
  } catch {
    return null;
  }
}
