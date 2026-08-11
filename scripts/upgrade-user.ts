import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Please provide an email to upgrade");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.error(`User ${email} not found`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { email },
    data: { role: "SUPER_ADMIN" }
  });

  console.log(`Successfully upgraded ${email} to SUPER_ADMIN`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
