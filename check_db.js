const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL } }
});

async function checkDatabaseState() {
  try {
    const result = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;
    console.log("DB_TABLES_COUNT:", result.length);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseState();
