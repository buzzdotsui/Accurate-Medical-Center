import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { PatientService } from '@/services/patient.service';
import { auth } from '@/lib/auth/config';
import { withApiHandler } from '@/lib/api/middleware';

/**
 * POST /api/v1/patients/self-register
 * Creates a Patient profile for the currently authenticated PATIENT user.
 *
 * Wrapped in withApiHandler so any unexpected error is caught, logged
 * server-side via the existing logger, and returned as a generic 500
 * response — the raw error.message is never exposed to the client.
 */
export const POST = withApiHandler(async (req: NextRequest) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (session.user.role !== 'PATIENT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { firstName, lastName, phone } = await req.json();

  if (!firstName || !lastName) {
    return NextResponse.json(
      { error: 'First name and last name are required.' },
      { status: 400 }
    );
  }

  // Check if Patient profile already exists
  const existingPatient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
  });

  if (existingPatient) {
    return NextResponse.json(existingPatient, { status: 200 });
  }

  // We need a branchId for the PatientService. Find the HQ or oldest branch.
  const defaultBranch = await prisma.branch.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  });

  if (!defaultBranch) {
    return NextResponse.json(
      { error: 'System is not fully configured (No branch found).' },
      { status: 500 }
    );
  }

  const patient = await PatientService.createPatient({
    firstName,
    lastName,
    email: session.user.email,
    phone: phone || undefined,
    branchId: defaultBranch.id,
    userId: session.user.id,
    auditContext: {
      userId: session.user.id,
      userRole: 'PATIENT',
      ip: req.headers.get('x-forwarded-for') ?? undefined,
      userAgent: req.headers.get('user-agent') ?? undefined,
      source: 'PUBLIC_SELF_REGISTER',
    },
  });

  return NextResponse.json(patient, { status: 201 });
});
