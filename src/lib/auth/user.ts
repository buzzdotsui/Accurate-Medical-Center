import type { User as BetterAuthUser } from "better-auth";

/**
 * Extended user type that includes additional fields from our database
 * that are not part of the standard Better Auth user object.
 */
export type User = BetterAuthUser & {
  role?: string;
  branchId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};