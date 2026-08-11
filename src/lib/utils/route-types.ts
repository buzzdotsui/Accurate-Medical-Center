import { NextRequest } from 'next/server';

/**
 * Route Context Type
 * Properly typed context object passed to Next.js route handlers
 */
export type RouteContext = {
  params: Promise<Record<string, string>>;
};

/**
 * Type-safe params extractor for Next.js 15+
 */
export async function extractParams(
  context: RouteContext
): Promise<Record<string, string>> {
  return await context.params;
}

/**
 * Type-safe route parameter getter
 */
export async function getParam(
  context: RouteContext,
  name: string
): Promise<string> {
  const params = await context.params;
  return params[name];
}
