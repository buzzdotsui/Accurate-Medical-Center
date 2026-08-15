import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'user',
  password: 'password',
  database: 'accurate_medical',
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting DB seed...');

  // 1. Create Default Branch (HQ)
  const _branch = await prisma.branch.upsert({
    where: { code: 'HQ' },
    update: {},
    create: {
      name: 'Accurate Medical Center - HQ',
      code: 'HQ',
      address: '123 Health Ave, Lagos, Nigeria',
      phone: '+2348000000000',
      email: 'hq@accuratemedical.com',
    },
  });

  // 2. Create Departments
  const deps = ['Cardiology', 'Pediatrics', 'Neurology', 'General Practice'];
  for (const dep of deps) {
    await prisma.department.upsert({
      where: { code: dep.substring(0, 3).toUpperCase() },
      update: {},
      create: {
        name: dep,
        code: dep.substring(0, 3).toUpperCase(),
      },
    });
  }

  console.log('Default Branch and Departments created.');
  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
