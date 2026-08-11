import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isAppError, getErrorMessage, AppError } from './errors';
import { error as errorResponse, serverError, validationError } from './response';
import { logger } from '@/lib/utils/logger';
import { getSessionUser, type SessionUser } from '@/lib/auth/session';
import { type Role, ROLES } from '@/config/roles';

type RouteContext = { params: Promise<Record<string, string>> };

type ApiHandler = (
  req: NextRequest,
  context: RouteContext,
) => Promise<NextResponse<any>> | NextResponse<any>;

type AuthApiHandler = (
  req: NextRequest,
  session: { user: SessionUser },
  context: RouteContext,
) => Promise<NextResponse<any>> | NextResponse<any>;

/**
 * Base API handler that catches all errors (AppError, Zod, generic)
 * and normalizes them into structured API responses.
 */
export function withApiHandler(handler: ApiHandler): ApiHandler {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      if (isAppError(error)) {
        return errorResponse(error.code, error.message, error.statusCode, error.details);
      }
      
      if (error instanceof z.ZodError) {
        return validationError(error.format());
      }
      
      logger.error('Unhandled API Error', {
        error: error instanceof Error ? error.stack : String(error),
        path: req.nextUrl.pathname,
        method: req.method,
      });

      return serverError();
    }
  };
}

/**
 * Wraps an API route with authentication. 
 * Passes the authenticated user down to the handler.
 */
export function withAuth(handler: AuthApiHandler): ApiHandler {
  return withApiHandler(async (req, context) => {
    const { user } = await getSessionUser(req);
    return handler(req, { user }, context);
  });
}

/**
 * Wraps an API route with role-based authorization.
 * Ensures the user has one of the allowed roles.
 */
export function withRole(allowedRoles: Role[], handler: AuthApiHandler): ApiHandler {
  return withAuth(async (req, session, context) => {
    if (!allowedRoles.includes(session.user.role as Role)) {
      throw new AppError(
        'You do not have permission to access this resource.',
        'FORBIDDEN',
        403
      );
    }
    return handler(req, session, context);
  });
}

/**
 * Ensures the authenticated user belongs to a specific branch,
 * unless they are a SUPER_ADMIN.
 */
export function withBranch(handler: AuthApiHandler): ApiHandler {
  return withAuth(async (req, session, context) => {
    if (session.user.role !== ROLES.SUPER_ADMIN && !session.user.branchId) {
      throw new AppError(
        'User is not assigned to a branch.',
        'FORBIDDEN',
        403
      );
    }
    return handler(req, session, context);
  });
}

/**
 * Helper to safely parse JSON body with Zod validation.
 */
export async function parseBody<T>(req: NextRequest, schema: z.ZodSchema<T>): Promise<T> {
  const json = await req.json().catch(() => ({}));
  return schema.parse(json);
}

/**
 * Helper to safely parse query params with Zod validation.
 */
export function parseQuery<T>(req: NextRequest, schema: z.ZodSchema<T>): T {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  return schema.parse(params);
}
