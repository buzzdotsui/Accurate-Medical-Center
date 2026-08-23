"use server";

import { z } from "zod";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { AppointmentService } from "@/services/appointment.service";
import { PublicAppointmentRequestSchema } from "@/lib/validations/appointment";
import { prisma } from "@/lib/db/client";
import { headers } from "next/headers";

export async function submitPublicAppointmentRequest(
  data: z.infer<typeof PublicAppointmentRequestSchema>
) {
  try {
    // 1. Rate Limiting (graceful fallback if Redis isn't set up)
    const ip = (await headers()).get("x-forwarded-for") ?? "127.0.0.1";
    await checkRateLimit(ip, "global");

    // 2. Validation
    const validatedData = PublicAppointmentRequestSchema.parse(data);

    // 3. Determine the branch. For public requests, we assign to the primary branch.
    const branch = await prisma.branch.findFirst({
      orderBy: { createdAt: "asc" }, // Usually the first branch is HQ
    });

    if (!branch) {
      throw new Error("System configuration error: No branch available.");
    }

    // 4. Time Validation
    const preferredDate = new Date(validatedData.preferredDate);
    if (preferredDate < new Date(new Date().setHours(0, 0, 0, 0))) {
      throw new Error("Preferred date cannot be in the past.");
    }

    // 5. Atomic Service Invocation
    const appointment = await AppointmentService.requestPublicAppointment({
      ...validatedData,
      branchId: branch.id,
    });

    return {
      success: true,
      referenceId: appointment.appointmentId,
    };
  } catch (error) {
    console.error("Public appointment request error:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: "Validation failed. Please check your inputs." };
    }
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "An unexpected error occurred." };
  }
}
