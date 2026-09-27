import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          { patientId: 'AMC-PT-000004' },
          { patientId: 'AMC-PT-000005' },
          { firstName: { contains: 'fd', mode: 'insensitive' } }
        ]
      }
    });

    let count = 0;
    for (const patient of patients) {
      await prisma.appointment.deleteMany({
        where: { patientId: patient.id }
      });
      await prisma.patient.delete({
        where: { id: patient.id }
      });
      count++;
    }

    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
