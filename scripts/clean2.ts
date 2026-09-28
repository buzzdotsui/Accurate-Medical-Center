import { prisma } from '../src/lib/db/client';

async function cleanup() {
  try {
    const patientId = "cmto564zf000004jiv7dzxr39"; // ID for THE NEW MAN
    await prisma.appointment.deleteMany({ where: { patientId } });
    await prisma.patient.delete({ where: { id: patientId } });
    console.log("Deleted THE NEW MAN");
  } catch (err) {
    console.error("Error:", err);
  }
}

cleanup();
