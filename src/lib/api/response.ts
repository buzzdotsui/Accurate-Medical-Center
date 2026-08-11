import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Standard API Response Types
// ---------------------------------------------------------------------------

export interface ApiMeta {
  page?: number;
  perPage?: number;
  total?: number;
  totalPages?: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: ApiMeta;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ---------------------------------------------------------------------------
// Response Helpers
// ---------------------------------------------------------------------------

/**
 * Return a 200 OK success response.
 */
export function ok<T>(
  data: T,
  options?: { message?: string; meta?: ApiMeta; status?: number },
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(options?.message && { message: options.message }),
      ...(options?.meta && { meta: options.meta }),
    },
    { status: options?.status ?? 200 },
  );
}

/**
 * Return a 201 Created response.
 */
export function created<T>(data: T, message?: string): NextResponse<ApiSuccess<T>> {
  return ok(data, { message, status: 201 });
}

/**
 * Return a 204 No Content response.
 */
export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Return an error response with a given HTTP status code.
 */
export function error(
  code: string,
  message: string,
  status: number,
  details?: unknown,
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, ...(details !== undefined && { details }) },
    },
    { status },
  );
}

// Convenience shortcuts

export const badRequest = (message = 'Bad request', details?: unknown) =>
  error('BAD_REQUEST', message, 400, details);

export const unauthorized = (message = 'Authentication required') =>
  error('UNAUTHORIZED', message, 401);

export const forbidden = (message = 'You do not have permission to perform this action') =>
  error('FORBIDDEN', message, 403);

export const notFound = (resource = 'Resource') =>
  error('NOT_FOUND', `${resource} not found`, 404);

export const conflict = (message: string) => error('CONFLICT', message, 409);

export const serverError = (message = 'An unexpected error occurred') =>
  error('INTERNAL_SERVER_ERROR', message, 500);

export const validationError = (details: unknown) =>
  error('VALIDATION_ERROR', 'Validation failed', 422, details);

export const tooManyRequests = (message = 'Too many requests. Please try again later.') =>
  error('TOO_MANY_REQUESTS', message, 429);
