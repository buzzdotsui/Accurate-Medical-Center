import { prisma } from '../src/lib/db/client';

async function main() {
  console.log("Cleaning up dummy 'fd yuygj' data...")
  
  // Find the dummy patient
  const patients = await prisma.patient.findMany({
    where: {
      OR: [
        { firstName: { contains: 'fd', mode: 'insensitive' } },
        { lastName: { contains: 'yuygj', mode: 'insensitive' } },
        { firstName: { contains: 'THE NEW MAN', mode: 'insensitive' } } // Also mentioned in the user's paste
      ]
    }
  });

  console.log(`Found ${patients.length} dummy patients.`);

  for (const patient of patients) {
    console.log(`Deleting patient: ${patient.firstName} ${patient.lastName} (${patient.id})`);
    
    // Appointments will be deleted automatically if we have onDelete: Cascade
    // But let's delete explicitly just in case
    await prisma.appointment.deleteMany({
      where: { patientId: patient.id }
    });

    await prisma.patient.delete({
      where: { id: patient.id }
    });
  }

  console.log("Cleanup complete!");
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
