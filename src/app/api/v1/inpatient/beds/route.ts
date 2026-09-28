import { NextRequest } from "next/server";
import { withRole } from "@/lib/api/middleware";
import { ok, created, badRequest } from "@/lib/api/response";
import { AppError } from "@/lib/api/errors";
import { buildBranchFilter } from "@/lib/auth/resource-authorization";
import { ROLES } from "@/config/roles";
import { prisma } from "@/lib/db/client";
import { z } from "zod";

const CreateBedSchema = z.object({
  wardId: z.string().min(1),
  roomNumber: z.string().min(1),
  bedNumber: z.string().min(1),
});

/**
 * GET /api/v1/inpatient/beds
 * Returns all wards with rooms and beds.
 */
export const GET = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.THEATRE_STAFF, ROLES.MATERNAL_STAFF],
  async (_req, session) => {
    const { branchId } = buildBranchFilter(session.user);
    const wards = await prisma.ward.findMany({
      where: branchId ? { branchId } : undefined,
      include: {
        rooms: {
          include: {
            beds: {
              include: {
                admission: {
                  include: {
                    patient: { select: { id: true, firstName: true, lastName: true, patientId: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });
    return ok(wards);
  }
);

/**
 * POST /api/v1/inpatient/beds
 * Creates a new bed in an existing ward (room created if roomNumber doesn't exist yet).
 */
export const POST = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  async (req: NextRequest, session) => {
    const body = await req.json().catch(() => null);
    const parsed = CreateBedSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");
    }

    const { wardId, roomNumber, bedNumber } = parsed.data;
    const { branchId } = buildBranchFilter(session.user);

    // Verify ward belongs to caller's branch
    const ward = await prisma.ward.findUnique({ where: { id: wardId } });
    if (!ward) return badRequest("Ward not found");
    if (branchId && ward.branchId !== branchId) return badRequest("Ward does not belong to your branch");

    // Upsert room by roomNumber within the ward
    let room = await prisma.room.findFirst({ where: { wardId, roomNumber } });
    if (!room) {
      room = await prisma.room.create({ data: { wardId, roomNumber } });
    }

    const bed = await prisma.bed.create({
      data: { roomId: room.id, bedNumber, status: "AVAILABLE" },
    });

    return created(bed);
  }
);
