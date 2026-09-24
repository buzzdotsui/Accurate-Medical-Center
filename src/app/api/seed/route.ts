import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { logger } from "@/lib/utils/logger";
import { serverError } from "@/lib/api/response";
import { getSessionUser } from "@/lib/auth/session";
import { AppError } from "@/lib/api/errors";
import { ROLES } from "@/config/roles";
import { type NextRequest } from "next/server";

/**
 * GET /api/seed
 *
 * Safely seeds the database with required bootstrap data:
 * - 1 Branch (Accurate Medical Center HQ)
 * - 4 Departments (Cardiology, Pediatrics, Neurology, General Practice)
 *
 * Uses upsert — completely safe to call multiple times.
 * NEVER drops, truncates, or destroys existing data.
 *
 * Authorization: authenticated SUPER_ADMIN only.
 * There is no ALLOW_SEED escape hatch — production cannot re-enable an
 * unauthenticated seed endpoint. Prefer `prisma/seed.ts` for local bootstrap.
 */
export async function GET(request: NextRequest) {
  try {
    const { user } = await getSessionUser(request);
    if (user.role !== ROLES.SUPER_ADMIN) {
      return NextResponse.json(
        { error: "Forbidden. SUPER_ADMIN required." },
        { status: 403 },
      );
    }
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  try {
    // 1. Upsert the default branch (HQ)
    const branch = await prisma.branch.upsert({
      where: { code: "HQ" },
      update: {},
      create: {
        name: "Accurate Medical Center - HQ",
        code: "HQ",
        address: "123 Health Ave, Lagos, Nigeria",
        phone: "+2348000000000",
        email: "hq@accuratemedical.com",
      },
    });

    // 2. Upsert departments
    const deptDefs = [
      { name: "Cardiology", code: "CAR" },
      { name: "Pediatrics", code: "PED" },
      { name: "Neurology", code: "NEU" },
      { name: "General Practice", code: "GEN" },
    ];

    const departments = [];
    for (const d of deptDefs) {
      const dept = await prisma.department.upsert({
        where: { code: d.code },
        update: {},
        create: { name: d.name, code: d.code },
      });
      departments.push(dept);
    }

    return NextResponse.json({
      success: true,
      message: "Seed completed successfully.",
      data: {
        branch: { id: branch.id, name: branch.name, code: branch.code },
        departments: departments.map((d) => ({ id: d.id, name: d.name, code: d.code })),
      },
    });
  } catch (error) {
    logger.error('Seed endpoint failed', {
      error: error instanceof Error ? error.stack : String(error),
      path: '/api/seed',
    });
    return serverError();
  }
}
