import { defineConfig } from '@prisma/config';
import 'dotenv/config';

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Prisma CLI (migrate, validate, generate) uses the DIRECT connection.
    // The runtime pooled connection (DATABASE_URL) is set in src/lib/db/client.ts via the adapter.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
