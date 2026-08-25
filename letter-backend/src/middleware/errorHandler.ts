import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../lib/errors';

/** Central error handler — always responds with `{ message }` for the frontend. */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  // Multer file size limit
  if (err && typeof err === 'object' && (err as any).code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File too large. Maximum allowed size is 20 MB.' });
  }
  // Multer unexpected field
  if (err && typeof err === 'object' && (err as any).code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ message: 'Unexpected file field in upload.' });
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message });
  }

  const message = err instanceof Error ? err.message : 'Internal server error.';
  console.error('[error]', err);
  return res.status(500).json({ message });
}

/** 404 for unknown /api routes. */
export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ message: 'API endpoint not found.' });
}
