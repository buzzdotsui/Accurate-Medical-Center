import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { logger } from "@/lib/utils/logger";
import { serverError } from "@/lib/api/response";

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
 * This endpoint must only be callable by an authenticated admin in production.
 * For simplicity during development it is unguarded, but returns a 403 in
 * NODE_ENV === "production" to prevent accidental use in a live environment.
 *
 * The Docker container runs NODE_ENV=production, so we allow this in Docker
 * only by checking for the ALLOW_SEED environment variable.
 */
export async function GET() {
  const allowSeed =
    process.env.NODE_ENV !== "production" ||
    process.env.ALLOW_SEED === "true";

  if (!allowSeed) {
    return NextResponse.json(
      { error: "Seed endpoint disabled in production. Set ALLOW_SEED=true to enable." },
      { status: 403 }
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
