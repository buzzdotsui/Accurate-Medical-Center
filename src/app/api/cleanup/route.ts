import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

export async function GET() {
  try {
    const patientId = "cmto564zf000004jiv7dzxr39";
    await prisma.appointment.deleteMany({ where: { patientId } });
    await prisma.patient.delete({ where: { id: patientId } });

    // Also delete any other remaining bad test data
    const moreDummy = await prisma.patient.findMany({
      where: {
        OR: [
          { firstName: { contains: 'fd', mode: 'insensitive' } },
          { user: { name: { contains: 'THE NEW MAN', mode: 'insensitive' } } }
        ]
      }
    });

    for (const p of moreDummy) {
      await prisma.appointment.deleteMany({ where: { patientId: p.id } });
      await prisma.patient.delete({ where: { id: p.id } });
    }

    return NextResponse.json({ success: true, deleted: 1 + moreDummy.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
