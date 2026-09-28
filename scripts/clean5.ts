import { prisma } from '../src/lib/db/client';

async function cleanup() {
  try {
    const apts = await prisma.appointment.findMany({
      where: {
        OR: [
          { appointmentId: "AMC-APT-000002" },
          { appointmentId: "AMC-APT-000003" },
          { appointmentId: "AMC-APT-20260927-H6DWC7" },
          { appointmentId: "AMC-APT-20260927-MRW7U5" },
          { appointmentId: "AMC-APT-000005" }
        ]
      }
    });

    console.log("Found appointments to delete:", apts.map(a => a.appointmentId));

    for (const apt of apts) {
      await prisma.appointment.delete({ where: { id: apt.id } });
      console.log(`Deleted appointment ${apt.appointmentId}`);
    }

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
