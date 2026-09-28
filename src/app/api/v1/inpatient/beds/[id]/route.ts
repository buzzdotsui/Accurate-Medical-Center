import { NextRequest } from "next/server";
import { withRole } from "@/lib/api/middleware";
import { ok, noContent, badRequest, notFound } from "@/lib/api/response";

import { ROLES } from "@/config/roles";
import { prisma } from "@/lib/db/client";
import { z } from "zod";

const UpdateBedSchema = z.object({
  bedNumber: z.string().min(1).optional(),
  status: z.enum(["AVAILABLE", "OCCUPIED", "MAINTENANCE"]).optional(),
  /** Assign a patient (by admissionId) to this bed */
  patientId: z.string().optional(),
});

/**
 * PATCH /api/v1/inpatient/beds/[id]
 * Edit bed number, status, or assign/unassign a patient.
 */
export const PATCH = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.NURSE, ROLES.DOCTOR],
  async (req: NextRequest, _session, { params }) => {
    const bedId = (await params).id as string;
    const body = await req.json().catch(() => null);
    const parsed = UpdateBedSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? "Invalid payload");
    }

    const bed = await prisma.bed.findUnique({ where: { id: bedId } });
    if (!bed) return notFound("Bed");

    const updated = await prisma.bed.update({
      where: { id: bedId },
      data: {
        ...(parsed.data.bedNumber && { bedNumber: parsed.data.bedNumber }),
        ...(parsed.data.status && { status: parsed.data.status }),
      },
    });

    return ok(updated);
  }
);

/**
 * DELETE /api/v1/inpatient/beds/[id]
 * Removes a bed — only if it is not currently OCCUPIED.
 */
export const DELETE = withRole(
  [ROLES.SUPER_ADMIN, ROLES.ADMIN],
  async (_req, _session, { params }) => {
    const bedId = (await params).id as string;

    const bed = await prisma.bed.findUnique({ where: { id: bedId } });
    if (!bed) return notFound("Bed");
    if (bed.status === "OCCUPIED") {
      return badRequest("Cannot remove an occupied bed. Discharge the patient first.");
    }

    await prisma.bed.delete({ where: { id: bedId } });
    return noContent();
  }
);
