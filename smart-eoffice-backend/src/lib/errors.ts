/** Application error carrying an HTTP status code. */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }

  static badRequest(message: string) {
    return new ApiError(400, message);
  }

  static unauthorized(message = 'Authentication required.') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'You do not have permission to perform this action.') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found.') {
    return new ApiError(404, message);
  }

  static conflict(message: string) {
    return new ApiError(409, message);
  }
}

/** Wrap an async Express handler so rejections reach the error middleware. */
export const asyncHandler =
  (fn: (req: any, res: any, next: any) => Promise<void>) =>
  (req: any, res: any, next: any) => {
    fn(req, res, next).catch(next);
  };
