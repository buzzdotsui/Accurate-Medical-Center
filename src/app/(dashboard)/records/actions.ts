"use server";

import { prisma } from "@/lib/db/client";
import { getSessionUser } from "@/lib/auth/session";
import { headers } from "next/headers";
import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { ROLES } from "@/config/roles";

export async function removeStaff(staffId: string) {
  // Construct a dummy request to pass to getSessionUser to reuse existing auth logic
  const req = new NextRequest(new URL("http://localhost"));
  const currentHeaders = await headers();
  currentHeaders.forEach((value, key) => {
    req.headers.set(key, value);
  });
  
  const { user } = await getSessionUser(req);
  if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.ADMIN) {
    throw new Error("Unauthorized");
  }

  await prisma.staff.update({
    where: { id: staffId },
    data: { 
      deletedAt: new Date(),
      isActive: false
    }
  });
  
  redirect("/dashboard");
}

export async function removePatient(patientId: string) {
  const req = new NextRequest(new URL("http://localhost"));
  const currentHeaders = await headers();
  currentHeaders.forEach((value, key) => {
    req.headers.set(key, value);
  });
  
  const { user } = await getSessionUser(req);
  if (user.role !== ROLES.SUPER_ADMIN && user.role !== ROLES.ADMIN) {
    throw new Error("Unauthorized");
  }

  await prisma.patient.update({
    where: { id: patientId },
    data: { 
      deletedAt: new Date()
    }
  });

  redirect("/dashboard");
}
