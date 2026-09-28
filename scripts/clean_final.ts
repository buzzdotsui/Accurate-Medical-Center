import { prisma } from '../src/lib/db/client';

async function cleanup() {
  try {
    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          { patientId: "AMC-PT-000004" },
          { patientId: "AMC-PT-000005" },
          { firstName: { contains: "THE NEW MAN", mode: "insensitive" } },
          { firstName: { contains: "fd yuygj", mode: "insensitive" } }
        ]
      }
    });

    console.log("Found patients to delete:", patients.map(p => ({ id: p.id, patientId: p.patientId, name: p.firstName })));

    for (const patient of patients) {
      console.log(`Deleting patient ${patient.id}...`);
      
      // Delete any dependent records that don't have onDelete: Cascade
      await prisma.invoice.deleteMany({ where: { patientId: patient.id } });
      await prisma.appointment.deleteMany({ where: { patientId: patient.id } });
      await prisma.admission.deleteMany({ where: { patientId: patient.id } });
      await prisma.visit.deleteMany({ where: { patientId: patient.id } });
      await prisma.document.deleteMany({ where: { patientId: patient.id } });
      await prisma.consentForm.deleteMany({ where: { patientId: patient.id } });
      await prisma.pregnancyRecord.deleteMany({ where: { patientId: patient.id } });
      await prisma.psychologicalAssessment.deleteMany({ where: { patientId: patient.id } });
      await prisma.therapySession.deleteMany({ where: { patientId: patient.id } });
      
      // Delete the patient
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
