import { prisma } from '../src/lib/db/client';

async function cleanup() {
  try {
    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          { patientId: "AMC-PT-000004" },
          { patientId: "AMC-PT-000005" }
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
    
    // Also delete any dangling appointments for these patients if the patient doesn't exist anymore
    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [
          { patientId: "AMC-PT-000004" },
          { patientId: "AMC-PT-000005" }
        ]
      }
    });
    
    console.log("Found appointments to delete:", appointments.map(a => a.id));
    for(const apt of appointments) {
       await prisma.appointment.delete({ where: { id: apt.id } });
    }

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
