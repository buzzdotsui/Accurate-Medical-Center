const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
  .then(result => {
    console.log('Tables:', result);
  })
  .catch(err => {
    console.error('Error:', err);
  })
  .finally(() => prisma.$disconnect());