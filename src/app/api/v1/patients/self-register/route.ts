import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { PatientService } from '@/services/patient.service';
import { auth } from '@/lib/auth/config';

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (session.user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { firstName, lastName, phone } = await req.json();

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'First name and last name are required.' }, { status: 400 });
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
      orderBy: { createdAt: 'asc' },
    });

    if (!defaultBranch) {
      return NextResponse.json({ error: 'System is not fully configured (No branch found).' }, { status: 500 });
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
  } catch (error: any) {
    console.error('Patient Self-Registration Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
