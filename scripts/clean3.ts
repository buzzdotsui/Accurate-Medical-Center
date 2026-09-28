import { prisma } from '../src/lib/db/client';

async function cleanup() {
  try {
    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          { firstName: { contains: "fd yuygj", mode: "insensitive" } },
          { firstName: { contains: "THE NEW MAN", mode: "insensitive" } },
          { lastName: { contains: "THE NEW MAN", mode: "insensitive" } }
        ]
      }
    });

    console.log("Found patients to delete:", patients.map(p => ({ id: p.id, patientId: p.patientId, name: p.firstName })));

    for (const patient of patients) {
      console.log(`Deleting patient ${patient.id}...`);
      await prisma.appointment.deleteMany({ where: { patientId: patient.id } });
      await prisma.patient.delete({ where: { id: patient.id } });
      console.log(`Deleted patient ${patient.id}`);
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
