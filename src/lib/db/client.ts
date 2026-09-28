import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  // Fail loudly at startup so the error is obvious in logs rather than
  // surfacing as a cryptic query-time failure deep inside a request.
  console.error(
    '[DB] DATABASE_URL is not set. All database operations will fail. ' +
    'Set DATABASE_URL in your environment and redeploy.'
  );
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// Next.js fast refresh in development creates new instances of PrismaClient,
// exhausting connection pools. This singleton pattern prevents that.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
