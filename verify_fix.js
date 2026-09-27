const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.$queryRaw`
    SELECT id, email, role, "branchId" 
    FROM users 
    WHERE role IN ('NURSE', 'DOCTOR', 'RECEPTIONIST', 'ADMIN') 
    ORDER BY role
  `;
  console.log('Users with branchId:', JSON.stringify(users, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());